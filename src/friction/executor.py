"""The executor: turn a verdict into a runnable command (and run it).

The gate's job is to decide; the executor's job is to act — run the selected
few when the walk is trusted enough to be *information*, and always print the
full-suite fallback beside them. The selected subset is never a licence to
skip: at today's measured recall the fallback is the safety net, so both
commands ship together, always.
"""

from __future__ import annotations

import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class RunPlan:
    selected_command: list[str]
    full_command: list[str]
    selected_ids: tuple[str, ...]


def to_pytest_id(qualname: str) -> str | None:
    """`tests.test_gate::test_x` → `tests/test_gate.py::test_x`.

    Class-qualified symbols (`pkg.mod::Cls.method`) map to pytest's
    `path::Cls::method` form. Non-mappable qualnames return None and are
    simply not included — an unrunnable id is dropped, never guessed.
    """
    module, sep, symbol = qualname.partition("::")
    if not sep or not module or not symbol:
        return None
    if module.startswith(".") or ".." in module:
        return None
    path = module.replace(".", "/") + ".py"
    # pytest node ids separate class from method with '::', never '.':
    # `path::Cls.method` collects NOTHING (verified: "no tests ran").
    return f"{path}::{symbol.replace('.', '::')}"


def build_plan(selected_tests: tuple[str, ...]) -> RunPlan:
    ids = tuple(i for i in (to_pytest_id(t) for t in selected_tests) if i)
    py = [sys.executable, "-m", "pytest"]
    return RunPlan(
        selected_command=[*py, *ids],
        full_command=list(py),
        selected_ids=ids,
    )


def execute(repo: Path, command: list[str]) -> dict:
    """Run the command in `repo`; report exit code and wall time.

    Exit codes are pytest's (0 pass / 1 fail) — pass-through by design: the
    executor reports test outcomes, it does not editorialize.
    """
    start = time.monotonic()
    proc = subprocess.run(command, cwd=str(repo), capture_output=True,
                          text=True, timeout=3600)
    return {"command": command, "exit_code": proc.returncode,
            "seconds": round(time.monotonic() - start, 1),
            "tail": "\n".join(proc.stdout.strip().splitlines()[-3:])}
