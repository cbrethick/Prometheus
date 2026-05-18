from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, attacks, policies, metrics, ws_router
import uvicorn

app = FastAPI(
    title="PROMETHEUS SHIELD API",
    description="Self-Healing AI Security Platform for Autonomous AI Agents",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,     prefix="/api/chat",     tags=["Chat"])
app.include_router(attacks.router,  prefix="/api/attacks",  tags=["Attacks"])
app.include_router(policies.router, prefix="/api/policies", tags=["Policies"])
app.include_router(metrics.router,  prefix="/api/metrics",  tags=["Metrics"])
app.include_router(ws_router.router,                        tags=["WebSocket"])

@app.get("/")
def root():
    return {"status": "PROMETHEUS SHIELD ACTIVE", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
