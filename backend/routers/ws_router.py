"""
routers/ws_router.py
WebSocket endpoint — broadcasts real-time events to all connected frontends.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio

router = APIRouter()

# Global connection manager
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    # send current state on connect
    from core.state import metrics, attack_log, active_policies, agent_config
    await ws.send_text(json.dumps({
        "event": "init",
        "metrics": metrics,
        "recent_attacks": attack_log[:10],
        "policies_count": len(active_policies),
        "connected": agent_config["connected"],
    }))
    try:
        while True:
            await asyncio.sleep(30)  # keep-alive
    except WebSocketDisconnect:
        manager.disconnect(ws)

# Export broadcast so routers can push events
async def push(data: dict):
    await manager.broadcast(data)
