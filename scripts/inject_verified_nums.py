"""Inject the artifact-derived figures into docs/index.html as data-num spans.

The React landing page bakes its numbers into a JS bundle, which is exactly
the hand-edited-figure drift `friction verify` exists to catch. This script
restores the machine-verifiability contract on top of the new UI: it derives
the canonical figures from data/shipped/gate-results.json (the same formulas
cmd_verify checks) and injects a small visible footer strip of data-num
spans into the built shell. Idempotent — re-running replaces the block.

Run after every `web/` rebuild that ships to docs/:

    python3 scripts/inject_verified_nums.py && friction verify
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "docs" / "index.html"
RESULTS = ROOT / "data" / "shipped" / "gate-results.json"

BEGIN = "<!-- verified-nums (scripts/inject_verified_nums.py) -->"
END = "<!-- /verified-nums -->"


def figures() -> dict[str, str]:
    d = json.loads(RESULTS.read_text(encoding="utf-8"))
    pool = d["summary"]["pooled"]
    per = d["summary"]["per_repo"]
    dj = per["django"]
    return {
        "pooled_b_recall": f"{pool['arm_b']['recall']:.3f}",
        "pooled_a_recall": f"{pool['arm_a']['recall']:.3f}",
        "pooled_b_ratio": f"{pool['arm_b']['hits']}/{pool['arm_b']['n']}",
        "pooled_a_ratio": f"{pool['arm_a']['hits']}/{pool['arm_a']['n']}",
        "django_b_ratio": f"{dj['arm_b']['hits']}/{dj['arm_b']['n']}",
        "django_b_recall": f"{dj['arm_b']['hits'] / dj['arm_b']['n']:.3f}",
        "django_a_recall": f"{dj['arm_a']['hits'] / dj['arm_a']['n']:.3f}",
    }


LABELS = {
    "pooled_b_recall": "type-resolved recall",
    "pooled_a_recall": "name-matched recall",
    "pooled_b_ratio": "type-resolved hits",
    "pooled_a_ratio": "name-matched hits",
    "django_b_ratio": "django · arm_b",
    "django_b_recall": "django · arm_b recall",
    "django_a_recall": "django · arm_a recall",
}


def block() -> str:
    spans = " · ".join(
        f'{LABELS[k]} <span data-num="{k}">{v}</span>'
        for k, v in figures().items())
    return (
        f"{BEGIN}\n"
        '<footer style="font-family:ui-monospace,Menlo,monospace;'
        "font-size:11px;line-height:1.8;padding:14px 20px;"
        'color:#8a7f6d;background:#141310;border-top:1px solid #2a261f;">'
        "figures, machine-verified — re-derive every one with "
        "<code>friction verify</code>: "
        f"{spans}</footer>\n{END}"
    )


def main() -> int:
    html = SITE.read_text(encoding="utf-8")
    html = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), "",
                  html, flags=re.S).rstrip("\n") + "\n"
    if "</body>" in html:
        html = html.replace("</body>", block() + "\n</body>", 1)
    else:
        html += block() + "\n"
    SITE.write_text(html, encoding="utf-8")
    print(f"injected {len(figures())} data-num spans into {SITE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
