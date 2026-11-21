"""The FastAPI surface. Every test runs against ``create_app(live=False)`` so the
suite is hermetic — it never contacts or mutates a HydraDB node — while still
asserting each route's 200 status and documented shape, the 404 on an unknown
instance, and the two honesty invariants: the ``caveat`` field is always present
on ``/check`` and undirected reachability is never sold as "the test exercises
this code".
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from friction.api import create_app

DEMO = "django__django-10973"           # arm B answered, comparable


@pytest.fixture(scope="module")
def client() -> TestClient:
    return TestClient(create_app(live=False))


# --------------------------------------------------------------------------
# /health
# --------------------------------------------------------------------------

def test_health_returns_200_and_pinned_commit(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert "engine_reachable" in body
    assert body["pinned_commit"]                   # non-empty pinned sha
    assert len(body["pinned_commit"]) >= 40        # a git sha


def test_health_does_not_leak_the_engine_error(monkeypatch):
    import friction.client

    def _boom(*_a, **_k):
        raise RuntimeError("secret-host:7687 refused, token=abc")

    monkeypatch.setattr(friction.client, "connect", _boom)
    body = TestClient(create_app(live=True)).get("/health").json()
    assert body["engine_reachable"] is False
    assert "secret-host" not in body["detail"]
    assert "token" not in body["detail"]
    assert body["detail"] == "engine unreachable"


# --------------------------------------------------------------------------
# /instances
# --------------------------------------------------------------------------

def test_instances_lists_per_arm_counts(client):
    r = client.get("/instances")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] >= 1
    assert "arm_a_answered" in body and "arm_b_answered" in body
    row = body["instances"][0]
    assert "arm_a" in row and "arm_b" in row
    assert "nodes" in row["arm_a"] and "edges" in row["arm_b"]


# --------------------------------------------------------------------------
# /check
# --------------------------------------------------------------------------

def test_check_returns_documented_shape(client):
    r = client.get(f"/check/{DEMO}")
    assert r.status_code == 200
    body = r.json()
    for key in ("features", "cypher", "latency_ms", "recommendation", "caveat"):
        assert key in body
    assert "count(*)" in body["cypher"]


def test_check_features_carry_their_direction(client):
    body = client.get(f"/check/{DEMO}").json()
    assert body["features"]
    for f in body["features"]:
        assert "name" in f and "value" in f and "direction" in f


def test_check_caveat_field_is_present_and_illustrative(client):
    body = client.get(f"/check/{DEMO}").json()
    assert body["caveat"]
    assert "illustrative" in body["caveat"]
    assert "does not beat patch-scope baselines" in body["caveat"]


def test_check_unknown_id_returns_404_with_clear_message(client):
    r = client.get("/check/does__not-exist")
    assert r.status_code == 404
    assert "does__not-exist" in r.json()["detail"]


# --------------------------------------------------------------------------
# /compare
# --------------------------------------------------------------------------

def test_compare_returns_both_arms_and_unconfirmed_edges(client):
    r = client.get(f"/compare/{DEMO}")
    assert r.status_code == 200
    body = r.json()
    assert body["arm_a"]["arm"] == "A"
    assert body["arm_b"]["arm"] == "B"
    assert "unconfirmed_edges" in body and "confirmed_edges" in body
    assert body["unconfirmed_edges"] is not None
    assert "delta" in body


def test_compare_unknown_id_returns_404(client):
    r = client.get("/compare/does__not-exist")
    assert r.status_code == 404


# --------------------------------------------------------------------------
# /precision
# --------------------------------------------------------------------------

def test_precision_report_json_shape(client):
    r = client.get("/precision")
    assert r.status_code == 200
    body = r.json()
    assert body["precision_ceiling"] == 0.746
    assert body["recall"] == 0.352
    assert "projection" in body and "low" in body["projection"]
    assert "unconfirmed" in body


# --------------------------------------------------------------------------
# /connectivity
# --------------------------------------------------------------------------

def test_connectivity_report_json_shape(client):
    r = client.get("/connectivity")
    assert r.status_code == 200
    body = r.json()
    assert body["n"] >= 1
    assert body["test_to_fix"] >= 0
    assert body["undirected_6"] >= body["test_to_fix"]   # broader relation
    # the honesty caveat travels with the numbers
    assert "shares a neighbourhood" in body["note"].lower()
    assert "not \"the test exercises this code\"" in body["note"].lower()
