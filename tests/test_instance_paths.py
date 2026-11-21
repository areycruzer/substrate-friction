"""Instance ids come from HTTP path parameters, so the helpers that turn an id
into a corpus path must refuse ids that leave the arms root."""

from __future__ import annotations

import pytest

from friction import cli
from friction.connectivity import instance_dir
from friction.gate import _edges_path

BAD_IDS = ["..", "../x", "a/../../x", "/etc", "", "."]


def test_instance_dir_keeps_a_plain_id_under_root(tmp_path):
    assert instance_dir(tmp_path, "django__django-10973") == (
        tmp_path / "django__django-10973")


@pytest.mark.parametrize("bad", BAD_IDS)
def test_instance_dir_refuses_ids_that_escape_root(tmp_path, bad):
    with pytest.raises(ValueError):
        instance_dir(tmp_path, bad)


@pytest.mark.parametrize("bad", ["../outside", "/etc"])
def test_edges_path_refuses_escaping_ids(tmp_path, bad):
    outside = tmp_path / "outside" / "arm_b"
    outside.mkdir(parents=True)
    (outside / "edges.ndjson").write_text("", encoding="utf-8")
    root = tmp_path / "arms"
    root.mkdir()
    with pytest.raises(ValueError):
        _edges_path(root, bad, "arm_b")


def test_edges_path_refuses_an_escaping_arm(tmp_path):
    (tmp_path / "x").mkdir()
    with pytest.raises(ValueError):
        _edges_path(tmp_path, "x", "../../y")


def test_load_instance_graph_refuses_escaping_ids():
    with pytest.raises(ValueError):
        cli.load_instance_graph("../../../etc")


def test_load_instance_graph_still_reads_a_shipped_instance():
    g = cli.load_instance_graph("django__django-10973", "arm_b")
    assert g.number_of_edges() > 0

