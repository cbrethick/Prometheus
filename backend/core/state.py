"""
core/state.py
Global in-memory state. Single source of truth for the entire app.
All routers import this — no DB needed, everything is fast & real-time.
"""
from datetime import datetime
import uuid

# ── Agent config (set once via /api/chat/connect) ────────────────────────────
agent_config = {
    "name": "ShopEasy AI Assistant",
    "provider": "gemini",
    "api_key": "",          # user's Gemini key
    "endpoint": "",         # optional custom endpoint
    "security_mode": "autonomous",
    "protections": {
        "prompt_injection": True,
        "data_leak": True,
        "admin_escalation": True,
        "auto_patch": True,
        "threat_logging": True,
    },
    "connected": False,
}

# ── Active security policies (grows as attacks happen) ───────────────────────
# Each entry: { id, name, pattern, action, reason, created_at, blocked_count }
active_policies: list[dict] = []

# ── Attack / audit log ────────────────────────────────────────────────────────
# Each entry: { id, timestamp, type, severity, prompt, blocked, policy_used }
attack_log: list[dict] = []

# ── Gemini analysis results ───────────────────────────────────────────────────
# Each entry: { attack_id, root_cause, suggestion, yaml_patch, deployed_at }
analysis_log: list[dict] = []

# ── Metrics (live counters) ───────────────────────────────────────────────────
metrics = {
    "attacks_total": 0,
    "attacks_blocked": 0,
    "attacks_slipped": 0,
    "policies_generated": 0,
    "security_score": 42,       # starts low — improves with patches
    "risk_level": "HIGH",       # HIGH → MEDIUM → LOW
    "protected_agents": 1,
    # time-series for chart (last 20 data points)
    "timeline": [],
    # pie chart data
    "threat_types": {
        "Prompt Injection": 0,
        "Jailbreak": 0,
        "Data Leak": 0,
        "Admin Escalation": 0,
        "Tool Abuse": 0,
    }
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def new_id() -> str:
    return str(uuid.uuid4())[:8].upper()

def now_str() -> str:
    return datetime.utcnow().strftime("%H:%M:%S")

def log_attack(attack_type: str, severity: str, prompt: str, blocked: bool, policy_used: str = "") -> dict:
    entry = {
        "id": new_id(),
        "timestamp": now_str(),
        "type": attack_type,
        "severity": severity,
        "prompt": prompt[:120],
        "blocked": blocked,
        "policy_used": policy_used,
    }
    attack_log.insert(0, entry)
    if len(attack_log) > 100:
        attack_log.pop()

    # update metrics
    metrics["attacks_total"] += 1
    metrics["threat_types"][attack_type] = metrics["threat_types"].get(attack_type, 0) + 1

    if blocked:
        metrics["attacks_blocked"] += 1
    else:
        metrics["attacks_slipped"] += 1

    # recalculate score
    total = max(metrics["attacks_total"], 1)
    block_rate = metrics["attacks_blocked"] / total
    metrics["security_score"] = min(98, int(42 + block_rate * 56))
    metrics["risk_level"] = (
        "LOW" if metrics["security_score"] >= 80 else
        "MEDIUM" if metrics["security_score"] >= 60 else "HIGH"
    )

    # timeline point
    metrics["timeline"].append({
        "time": now_str(),
        "blocked": metrics["attacks_blocked"],
        "total": metrics["attacks_total"],
        "score": metrics["security_score"],
    })
    if len(metrics["timeline"]) > 20:
        metrics["timeline"].pop(0)

    return entry

def add_policy(name: str, patterns: list[str], reason: str, yaml_txt: str) -> dict:
    policy = {
        "id": new_id(),
        "name": name,
        "patterns": patterns,
        "action": "DENY",
        "reason": reason,
        "yaml": yaml_txt,
        "created_at": now_str(),
        "blocked_count": 0,
    }
    active_policies.insert(0, policy)
    metrics["policies_generated"] += 1
    return policy

def check_policies(prompt: str) -> tuple[bool, str]:
    """Returns (blocked, policy_name)"""
    p_lower = prompt.lower()
    for policy in active_policies:
        for pattern in policy["patterns"]:
            if pattern.lower() in p_lower:
                policy["blocked_count"] += 1
                return True, policy["name"]
    return False, ""
