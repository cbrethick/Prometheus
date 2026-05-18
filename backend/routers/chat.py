"""
routers/chat.py
POST /api/chat/connect   — register agent config (name, key, mode)
POST /api/chat/message   — send a normal (safe) message to the AI
GET  /api/chat/config    — return current agent config (no key exposed)
"""
from fastapi import APIRouter
from pydantic import BaseModel
from core import state, gemini

router = APIRouter()


class ConnectPayload(BaseModel):
    name: str = "ShopEasy AI Assistant"
    provider: str = "gemini"
    api_key: str = ""
    endpoint: str = ""
    security_mode: str = "autonomous"
    protections: dict = {}


class MessagePayload(BaseModel):
    message: str
    api_key: str = ""   # frontend passes key each time so backend stays stateless-friendly


@router.post("/connect")
async def connect_agent(payload: ConnectPayload):
    state.agent_config.update({
        "name": payload.name,
        "provider": payload.provider,
        "api_key": payload.api_key,
        "endpoint": payload.endpoint,
        "security_mode": payload.security_mode,
        "protections": payload.protections or {
            "prompt_injection": True,
            "data_leak": True,
            "admin_escalation": True,
            "auto_patch": True,
            "threat_logging": True,
        },
        "connected": True,
    })

    from routers.ws_router import push
    await push({
        "event": "agent_connected",
        "name": payload.name,
        "mode": payload.security_mode,
    })

    return {
        "status": "connected",
        "agent": payload.name,
        "mode": payload.security_mode,
        "has_key": bool(payload.api_key),
    }


@router.post("/message")
async def send_message(payload: MessagePayload):
    """Normal safe message — goes through hardened system prompt."""
    api_key = payload.api_key or state.agent_config.get("api_key", "")
    response = await gemini.normal_chat(payload.message, api_key)
    return {"response": response, "blocked": False, "safe": True}


@router.get("/config")
def get_config():
    cfg = dict(state.agent_config)
    cfg.pop("api_key", None)   # never expose key
    return cfg
