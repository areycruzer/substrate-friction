"""Triage a GitHub PR or issue: human verification or AI autonomy?

Fetches the change surface from the GitHub API (no new dependencies —
urllib), shallow-clones the repository at the PR's head (or the default
branch for an issue), and runs the live gate over it. The tier logic is
fail-closed at every seam:

- the class prior can only REFUSE (SKIP_SAFE requires the measured recall's
  one-sided 95% Wilson lower bound to clear the bar — never a point
  estimate);
- the optional issue-localization layer (file paths mentioned in the issue
  text, or an LLM when a key is configured) only chooses WHERE to look;
  a wrong prediction can over-route to a human, never grant autonomy.

Every number in the rendered output comes from the gate itself.

Demo note: this line exists so the demo PR carries a Python change —
the policy-bar run needs a gateable surface to measure.

Dogfood: this module triages its own repository's PRs via
.github/workflows/triage.yml — the PR that added this line was itself
labeled and commented by that workflow.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import tempfile
import urllib.error
import urllib.request
from dataclasses import dataclass, replace as _replace
from pathlib import Path

from friction.gate import SAFE_SKIP_RECALL
from friction.live import LiveGate, gate_repo

TIERS = {
    "ai-autonomy": "triage/ai-autonomy",
    "human-verification": "triage/human-verification",
    "needs-human": "triage/needs-human",
    "out-of-scope": "triage/out-of-scope",
}

TIER_BLURB = {
    "ai-autonomy":
        "the measured recall's lower bound clears the bar — this graph "
        "class has earned autonomous test selection",
    "human-verification":
        "the map class under this change has not earned autonomy (see the "
        "prior and its bound below) — keep a human in the loop and run the "
        "full verification",
    "needs-human":
        "the gate is blind on this change: it could not establish the "
        "neighbourhood (unmatched files, no recognised tests, or a "
        "truncated walk) — a human must verify",
    "out-of-scope":
        "no Python change surface (docs/config/other languages) — "
        "test-selection risk does not apply to this change, so the gate has "
        "no objection to automated handling on THAT axis (content review is "
        "a separate question it does not measure)",
}


@dataclass(frozen=True)
class TriageReport:
    kind: str                 # "pr" | "issue"
    slug: str                 # owner/repo
    number: int
    head: str                 # head sha or branch checked out
    changed: tuple[str, ...]
    tier: str
    label: str
    blurb: str
    gate: LiveGate | None
    localization_note: str    # provenance of fix-site prediction (issues)
    threshold: float | None = None   # policy bar if the operator set one


def _gh(path: str, token: str | None = None) -> dict:
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "User-Agent": "substrate-friction-triage",
            "Accept": "application/vnd.github+json",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            raise ValueError(
                f"github reports no such PR/issue: {path} (404) — check the "
                f"URL, or set GITHUB_TOKEN if the repository is private"
            ) from exc
        if exc.code in (403, 429):
            raise ValueError(
                f"github refused the request ({exc.code}, likely a rate "
                f"limit) — set GITHUB_TOKEN and retry"
            ) from exc
        raise ValueError(f"github API error {exc.code} on {path}") from exc
    except urllib.error.URLError as exc:
        raise ValueError(
            f"could not reach api.github.com ({exc.reason}) — triage needs "
            f"network access to read the PR"
        ) from exc


def parse_target(url: str) -> tuple[str, str, int]:
    """`https://github.com/o/r/pull/12` | `.../issues/34` -> (o/r, kind, n)."""
    m = re.fullmatch(r"https://github\.com/([^/]+/[^/]+)/(pull|pulls|issues)/(\d+)/?",
                     url.strip())
    if not m:
        raise ValueError(f"not a github PR/issue URL: {url}")
    kind = "pr" if m.group(2).startswith("pull") else "issue"
    return m.group(1), kind, int(m.group(3))


# Files that can change WHICH tests run, without any .py in the surface.
# The gate cannot measure their effect on selection — such a PR is blind,
# never "cleared": a workflow edit can silently alter the suite itself.
SELECTION_INFLUENCING = (
    ".github/", "conftest.py", "pytest.ini", "tox.ini", "setup.cfg",
    "pyproject.toml", "noxfile.py", "Makefile",
)


PR_FILE_PAGE = 100
PR_FILE_CAP = 300   # beyond this the change surface is disclosed-truncated


def _pr_files(slug: str, number: int,
              token: str | None) -> tuple[list[str], bool]:
    """All changed paths — removed files INCLUDED (a deletion is a change;
    its symbols will not resolve at head and the gate abstains), plus
    whether the surface is complete (false once the pagination cap hit)."""
    out: list[str] = []
    page = 1
    complete = True
    while len(out) < PR_FILE_CAP:
        rows = _gh(f"/repos/{slug}/pulls/{number}/files"
                   f"?per_page={PR_FILE_PAGE}&page={page}", token)
        out += [r["filename"] for r in rows]
        if len(rows) < PR_FILE_PAGE:
            break
        page += 1
    if len(out) > PR_FILE_CAP:
        complete = False
        out = out[:PR_FILE_CAP]
    return out, complete


def _issue_files(slug: str, number: int,
                 token: str | None) -> tuple[list[str], str]:
    """Where would this issue's fix land? Disclosed, fail-closed upstream.

    Issue triage uses the paths the issue itself names — no prediction
    layer. (An LLM localizer is future work; it is not advertised here.)
    """
    issue = _gh(f"/repos/{slug}/issues/{number}", token)
    body = (issue.get("body") or "") + "\n" + issue.get("title", "")
    mentioned = sorted(set(re.findall(r"([\w./-]+\.py)\b", body)))
    return mentioned, (
        f"fix files taken from {len(mentioned)} path(s) mentioned in the "
        "issue text — DISCLOSED heuristic; the gate below stays fail-closed "
        "regardless of prediction quality")


def _shallow_clone(slug: str, dest: Path, pr_number: int | None = None,
                   branch: str | None = None) -> None:
    """Shallow clone at the PR head (works for fork PRs too — GitHub keeps
    `pull/N/head` in the base repo) or at a branch."""
    base = f"https://github.com/{slug}.git"
    if pr_number is not None:
        subprocess.run(["git", "clone", "--depth", "1", "--quiet", base,
                        str(dest)], check=True, capture_output=True,
                       timeout=600)
        subprocess.run(["git", "fetch", "--depth", "1", "--quiet", "origin",
                        f"pull/{pr_number}/head"], cwd=dest, check=True,
                       capture_output=True, timeout=600)
        subprocess.run(["git", "checkout", "--quiet", "FETCH_HEAD"], cwd=dest,
                       check=True, capture_output=True, timeout=60)
    else:
        subprocess.run(["git", "clone", "--depth", "1", "--quiet",
                        "--branch", branch, base, str(dest)], check=True,
                       capture_output=True, timeout=600)


def _default_branch(slug: str, token: str | None) -> str:
    return _gh(f"/repos/{slug}", token)["default_branch"]


def classify(gate: LiveGate, changed: list[str]) -> str:
    """Four tiers; three vary per change today. Fail-closed by construction."""
    if gate.verdict.decision == "SKIP_SAFE":
        return "ai-autonomy"
    py = [f for f in changed if f.endswith(".py")]
    if not py:
        return "out-of-scope"
    if gate.changed_symbols == 0 or gate.unmatched_changed or \
            not gate.graph_complete or gate.total_tests == 0:
        return "needs-human"
    return "human-verification"


def triage(url: str, *, token: str | None = None,
           keep: Path | None = None,
           threshold: float | None = None) -> TriageReport:
    slug, kind, number = parse_target(url)
    token = token or os.environ.get("GITHUB_TOKEN")

    # 1. the change surface first — from the API, before any cloning
    surface_complete = True
    if kind == "pr":
        changed, surface_complete = _pr_files(slug, number, token)
        ref = f"pull/{number}/head"
        note = ("fix sites are the PR's real changed files (removed files "
                "included — a deletion is a change)")
    else:
        ref = _default_branch(slug, token)
        changed, note = _issue_files(slug, number, token)

    # 2a. an issue with no named fix files is a LOCALIZATION FAILURE, not
    # out-of-scope: the gate is blind through it. needs-human.
    if kind == "issue" and not changed:
        return TriageReport(
            kind=kind, slug=slug, number=number, head="—",
            changed=(), tier="needs-human", label=TIERS["needs-human"],
            blurb="the issue names no fix files, so no change surface could "
            "be established — localization failed and we do not guess; a "
            "human triages this", gate=None,
            localization_note="no .py paths mentioned in the issue text",
            threshold=threshold)
    # 2b. a truncated change surface is insufficient evidence: needs-human,
    # never a quiet partial measurement.
    if not surface_complete:
        return TriageReport(
            kind=kind, slug=slug, number=number, head="—",
            changed=tuple(changed), tier="needs-human",
            label=TIERS["needs-human"],
            blurb=f"the change surface was truncated at the {PR_FILE_CAP}-file"
            " pagination cap — insufficient evidence to measure, a human "
            "triages this", gate=None, localization_note=note)
    # 2c. no Python — but a change that can influence WHICH tests run
    # (CI workflows, pytest/tox config) is blind, not cleared: needs-human.
    if not any(f.endswith(".py") for f in changed):
        influencing = [f for f in changed
                       if any(m in f for m in SELECTION_INFLUENCING)]
        if influencing:
            shown = ", ".join(influencing[:3])
            return TriageReport(
                kind=kind, slug=slug, number=number, head="—",
                changed=tuple(changed), tier="needs-human",
                label=TIERS["needs-human"],
                blurb="this change touches test-execution configuration "
                f"({shown}) — it can alter WHICH tests run, the gate "
                "cannot measure that effect, so a human verifies. "
                "Never 'cleared'.", gate=None,
                localization_note=note)
        return TriageReport(
            kind=kind, slug=slug, number=number, head="—",
            changed=tuple(changed), tier="out-of-scope",
            label=TIERS["out-of-scope"],
            blurb="no Python signal in the change surface — the gate "
            "measures nothing here", gate=None, localization_note=note)

    # 3. shallow clone at the surface's commit, then the real gate
    workdir = keep or Path(tempfile.mkdtemp(prefix="friction-triage-"))
    if kind == "pr":
        _shallow_clone(slug, workdir, pr_number=number)
    else:
        _shallow_clone(slug, workdir, branch=ref)

    gate = gate_repo(workdir, changed, threshold=threshold)
    # the prior note names the clone dir; name the real repo instead
    gate = _replace(gate, prior_note=gate.prior_note.replace(
        gate.repo.name, slug))

    tier = classify(gate, changed)
    return TriageReport(
        kind=kind, slug=slug, number=number,
        head=ref, changed=tuple(changed), tier=tier, label=TIERS[tier],
        blurb=TIER_BLURB[tier], gate=gate, localization_note=note,
        threshold=threshold)


def render_markdown(r: TriageReport) -> str:
    """The PR comment — every number below is emitted by the gate itself."""
    v = r.gate.verdict if r.gate else None
    lines = [
        f"## 🔺 substrate—friction triage — `{r.tier}`",
        "",
        f"**{r.blurb}.**",
        "",
        f"- change surface: {len(r.changed)} file(s)"
        + (f" — `{r.changed[0]}`"
           f"{' …' if len(r.changed) > 1 else ''}" if r.changed else ""),
    ]
    if r.gate is None:
        lines.append(f"- localization: {r.localization_note}")
        lines.append("- gate: not run (nothing to measure)")
        lines.append("")
        lines.append("*The label is the triage decision. Install the gate "
                     "on your repo: see the README quickstart.*")
        return "\n".join(lines)

    g = r.gate
    sel = len(g.selected_tests)
    reach = (f"{sel:,} of {g.total_tests:,} tests"
             if g.total_tests else "0 tests recognised")
    lines += [
        f"- localization: {r.localization_note}",
        f"- graph: {g.graph_nodes:,} nodes · {g.graph_edges:,} edges "
        f"(name-matched, `arm_a`)",
        f"- blast radius: the walk reaches **{reach}**"
        + ("" if g.graph_complete else " · walk truncated")
        + " (graph symbols matching test markers — not framework-collected "
          "node IDs)",
        f"- verdict: `{v.decision}` — exit {1 if v.decision == 'RUN_FULL' else 0}",
        "",
        "> " + v.reason,
        ">",
        "> " + g.prior_note,
    ]
    if sel and g.selected_tests:
        shown = "\n".join(f"- `{t}`" for t in g.selected_tests[:5])
        pct = 100.0 * sel / g.total_tests if g.total_tests else 0.0
        lines += ["", f"**tests to watch** (first {min(5, sel)} of "
                  f"{sel:,}):", shown]
        if v.decision == "RUN_FULL" and g.total_tests:
            lines += [
                "",
                f"**review focus — the head start:** the evidence narrows a "
                f"human's starting point to **{sel:,} of {g.total_tests:,} "
                f"tests ({pct:.1f}% of the suite)** plus the "
                f"{g.changed_symbols:,} changed symbol(s). A head start, not "
                f"a guarantee: at measured recall "
                f"{v.measured_recall:.2f}, the full suite remains the safety "
                f"net — start where the graph points, finish everywhere.",
            ]
    if r.threshold is not None and r.threshold != SAFE_SKIP_RECALL:
        lines += [
            "",
            f"⚠️ **policy bar:** this run used an operator-set bar of "
            f"**{r.threshold:.2f}**, not the default safety bar of "
            f"{SAFE_SKIP_RECALL:.2f}. The evidence cleared the *policy* bar; "
            f"at the default bar this same evidence would refuse. The bar is "
            f"policy — the evidence is statistical.",
        ]
    lines += [
        "",
        "*Fail-closed by construction: the autonomous label requires the "
        "measured recall's one-sided 95% Wilson lower bound to clear the "
        "bar — a point estimate or a lucky small sample cannot unlock it. "
        "Numbers in this comment are emitted by `friction gate`; "
        "re-derive them with `friction verify`.*",
    ]
    return "\n".join(lines)
