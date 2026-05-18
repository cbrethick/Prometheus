# 🛡️ PROMETHEUS SHIELD
## AI Agent Red Team + Auto-Patch Security Engine
### Built for "Transforming Enterprise Through AI" Hackathon — lablab.ai

---

## 🎯 What It Does

PROMETHEUS SHIELD is an autonomous security system that:

1. 🔴 **RED TEAM AGENT** — Fires 12+ real attack types against AI agents  
   (prompt injection, jailbreaks, PII theft, credential exfiltration, SQL injection, SSRF, token smuggling...)

2. 🔍 **LOBSTER TRAP DPI** — Deep Prompt Inspection catches attacks in real-time  
   (simulated locally — plug in real Lobster Trap proxy for full power)

3. 🧠 **GEMINI ANALYZER** — When an attack slips through, Gemini reads the logs,  
   understands WHY it succeeded, and writes a new YAML security policy

4. 🛡️ **AUTO-PATCH DEPLOYER** — Hot-deploys the new policy, re-tests, confirms blocked

5. 📊 **LIVE DASHBOARD** — Real-time war room with WebSocket feed, audit trail,  
   risk score meter, and one-click compliance export

---

## ⚡ QUICK START (100% FREE — No paid APIs required)

### Option 1: Docker (Easiest)
```bash
git clone <your-repo>
cd prometheus-shield

# FREE mode (no API keys needed)
docker-compose up

# With real Gemini (free tier):
GEMINI_API_KEY=your_key_here docker-compose up
```

Then open: **http://localhost:3000**

---

### Option 2: Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
# Just open frontend/index.html in browser
# OR serve it:
cd frontend
python -m http.server 3000
```

Then open: **http://localhost:3000**

---

## 🔑 API Keys (ALL FREE TIERS)

| Service | Key | Where to Get | Cost |
|---------|-----|--------------|------|
| Gemini API | Optional | [Google AI Studio](https://aistudio.google.com) | FREE tier |
| Lobster Trap | None needed | MIT open source | FREE |
| Backend | None | Runs locally | FREE |
| Frontend | None | Static HTML | FREE |

**The entire system runs FREE without any API key (mock mode).**  
Add a Gemini key for real AI-generated policies.

---

## 📱 Mobile / APK

The `frontend/index.html` is fully responsive and works on mobile browsers.

**For APK (Android):**
1. Open the HTML in Android Studio WebView
2. Use [Capacitor.js](https://capacitorjs.com/) to wrap into APK:
```bash
npm install @capacitor/core @capacitor/android
npx cap init PrometheusShield com.prometheus.shield
npx cap add android
# copy frontend/index.html to src/
npx cap sync
npx cap open android
# Build APK in Android Studio
```

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────┐
                    │      PROMETHEUS SHIELD       │
                    └─────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌─────────┐    ┌─────────────┐  ┌──────────┐
       │  Red    │    │  Lobster    │  │  Gemini  │
       │  Team   │───▶│  Trap DPI   │  │  Analyzer│
       │  Agent  │    │  (Inspect)  │  │  + YAML  │
       └─────────┘    └─────────────┘  └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                   ┌─────────────────┐
                   │  FastAPI + WS   │
                   │   Backend       │
                   └────────┬────────┘
                            │ WebSocket
                   ┌────────▼────────┐
                   │   React-like    │
                   │   Dashboard     │
                   │   (HTML/JS/CSS) │
                   └─────────────────┘
```

---

## 🎥 Demo Script (60 seconds for judges)

> *"Watch this. I fire a credential-theft attack at our AI agent — it slips past basic filters. 
> PROMETHEUS SHIELD catches it via Lobster Trap DPI, sends it to Gemini for analysis, 
> gets a new YAML policy back in 3 seconds, deploys it hot — and the same attack is now 
> permanently blocked. Risk score went from 45 to 94. 
> Every action is logged in a regulator-readable audit trail."*

---

## 🏆 Tracks Targeted

- ✅ **Track 1: Agent Security & AI Governance** (Veea Award)
- ✅ **Track 2: AI Agents with Google AI Studio** (Gemini Award)
- ✅ **$5,000 First Place**

---

## 🗂️ Project Structure

```
prometheus-shield/
├── backend/
│   ├── main.py           # FastAPI server + agents + WebSocket
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── index.html        # Full dashboard (web + mobile responsive)
├── docker-compose.yml    # One command to run everything
└── README.md
```

---

## 📋 Judging Criteria Alignment

| Criterion | How We Hit It |
|-----------|---------------|
| **Application of Technology** | Lobster Trap DPI + Gemini 2.0 Flash + WebSockets |
| **Business Value** | Every enterprise deploying AI agents needs this |
| **Originality** | First system to RED TEAM + AUTO-PATCH in one loop |
| **Presentation** | Live war-room dashboard with real-time attack visualization |

---

## 👥 Team
Built for lablab.ai "Transforming Enterprise Through AI" Hackathon  
May 11–19, 2026

License: MIT
