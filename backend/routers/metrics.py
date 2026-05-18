"""
routers/metrics.py
GET /api/metrics/         — all metrics (counters + chart data + threat types)
GET /api/metrics/summary  — quick summary card data
GET /api/metrics/timeline — time-series for line chart
GET /api/metrics/threats  — pie chart data
GET /api/metrics/score    — before/after security score for bar chart
"""
from fastapi import APIRouter
from core import state

router = APIRouter()


@router.get("/")
def all_metrics():
    return state.metrics


@router.get("/summary")
def summary():
    return {
        "attacks_total":     state.metrics["attacks_total"],
        "attacks_blocked":   state.metrics["attacks_blocked"],
        "policies_generated":state.metrics["policies_generated"],
        "security_score":    state.metrics["security_score"],
        "risk_level":        state.metrics["risk_level"],
        "protected_agents":  state.metrics["protected_agents"],
        "catch_rate": (
            round(state.metrics["attacks_blocked"] /
                  max(state.metrics["attacks_total"], 1) * 100)
        ),
    }


@router.get("/timeline")
def timeline():
    return {"timeline": state.metrics["timeline"]}


@router.get("/threats")
def threat_types():
    return {
        "threat_types": [
            {"name": k, "value": v}
            for k, v in state.metrics["threat_types"].items()
            if v > 0
        ]
    }


@router.get("/score")
def score_comparison():
    """For the before/after bar chart."""
    return {
        "before": 42,
        "current": state.metrics["security_score"],
        "improvement": state.metrics["security_score"] - 42,
        "policies_active": len(state.active_policies),
    }


# Import needed for score endpoint
from core import state as _state
score_comparison.__globals__['active_policies'] = _state.active_policies
