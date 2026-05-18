"""
routers/policies.py
GET  /api/policies/        — list all active policies
GET  /api/policies/{id}    — get single policy with YAML
DELETE /api/policies/{id}  — remove a policy (for demo reset)
POST /api/policies/reset   — clear all policies (demo reset)
"""
from fastapi import APIRouter, HTTPException
from core import state

router = APIRouter()


@router.get("/")
def list_policies():
    return {
        "policies": state.active_policies,
        "total": len(state.active_policies),
    }


@router.get("/{policy_id}")
def get_policy(policy_id: str):
    for p in state.active_policies:
        if p["id"] == policy_id:
            return p
    raise HTTPException(404, "Policy not found")


@router.delete("/{policy_id}")
def delete_policy(policy_id: str):
    before = len(state.active_policies)
    state.active_policies[:] = [p for p in state.active_policies if p["id"] != policy_id]
    if len(state.active_policies) == before:
        raise HTTPException(404, "Policy not found")
    state.metrics["policies_generated"] = len(state.active_policies)
    return {"status": "deleted", "remaining": len(state.active_policies)}


@router.post("/reset")
def reset_all():
    """Full demo reset — clears policies, logs, resets metrics."""
    state.active_policies.clear()
    state.attack_log.clear()
    state.analysis_log.clear()
    state.metrics.update({
        "attacks_total": 0,
        "attacks_blocked": 0,
        "attacks_slipped": 0,
        "policies_generated": 0,
        "security_score": 42,
        "risk_level": "HIGH",
        "timeline": [],
        "threat_types": {
            "Prompt Injection": 0,
            "Jailbreak": 0,
            "Data Leak": 0,
            "Admin Escalation": 0,
            "Tool Abuse": 0,
        }
    })
    return {"status": "reset", "message": "All policies and logs cleared. Ready for fresh demo."}
