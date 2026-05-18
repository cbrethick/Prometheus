# PROMETHEUS SHIELD — FRONTEND BLUEPRINT FOR STITCH
# Give this ENTIRE document to Stitch as your prompt.
# Tech: React + Tailwind + Recharts + Framer Motion + WebSocket

---

## VISUAL IDENTITY

- Background: #020409 (near-black)
- Primary accent: #00d4ff (neon cyan)
- Danger: #ff3c5e (neon red)
- Success: #00ff9d (neon green)
- Warning: #ffb800 (amber)
- Panel bg: #071220
- Border: #0d2a3e
- Fonts: "Orbitron" (display/headers), "Share Tech Mono" (data/terminal), "Rajdhani" (body)
- Import from Google Fonts
- Scanline overlay: body::before with repeating-linear-gradient (subtle)
- Grid background: faint cyan grid lines on main bg

---

## NAVBAR

Fixed top. Height 60px.
Left: hexagon logo icon (gradient cyan→red) + "PROMETHEUS SHIELD" in Orbitron bold + subtitle "AI Agent Security Platform" in mono tiny
Right:
- Blinking green dot + "LIVE" text when connected
- Clock in mono font
- Nav links: Dashboard | Attacks | Policies | Analytics | Settings (scroll to sections)
- "CONNECT AGENT" button — glowing cyan border, opens modal

---

## SECTION 1: HERO DASHBOARD (top of page)

4 glowing stat cards in a row:

Card 1 — cyan glow:
  Label: "ATTACKS BLOCKED"
  Value: live counter (from metrics API)
  Sub: "this session"

Card 2 — red glow:
  Label: "ACTIVE THREATS"
  Value: attacks_slipped counter
  Sub: "unpatched"

Card 3 — green glow:
  Label: "POLICIES GENERATED"
  Value: policies_generated
  Sub: "auto-deployed"

Card 4 — amber glow:
  Label: "SECURITY SCORE"
  Value: security_score + "/100"
  Sub: risk_level badge (HIGH=red, MEDIUM=amber, LOW=green)

Below cards: THREAT LEVEL banner
  - HIGH = red pulsing bar
  - MEDIUM = amber
  - LOW = green

---

## SECTION 2: MAIN 3-COLUMN GRID

### LEFT COLUMN — ATTACK SIMULATOR

Title: "⚡ ATTACK SIMULATOR" in red

5 attack buttons, each a different color:

[🔴 Prompt Injection]   — fires attack_id: "prompt_injection"
[🟠 Data Leak]          — fires attack_id: "data_leak"
[🔴 Admin Escalation]   — fires attack_id: "admin_escalation"
[🟡 Jailbreak]          — fires attack_id: "jailbreak"
[🟣 Tool Abuse]         — fires attack_id: "tool_abuse"

On button click:
1. Button flashes red + shake animation
2. Call POST /api/attacks/fire  { attack_id, api_key }
3. Store response in state: { prompt, response, blocked, log_id }
4. Show result in the terminal log below
5. If NOT blocked → auto-trigger /api/attacks/analyze → then show analysis panel

Terminal log (below buttons):
  Scrollable dark box, mono font, green text
  Each entry: [HH:MM:SS] ATTACK TYPE — STATUS
  Animate new entries sliding in from top
  Color code: red=fired, green=blocked, amber=analyzing, cyan=patched

Also show:
  "ATTACKS ACTIVE: N" counter
  "POLICIES BLOCKING: N" counter

---

### CENTER COLUMN — LIVE AI CHATBOT

Title: "🤖 ShopEasy AI Assistant" + "PROTECTED BY PROMETHEUS SHIELD" badge

Two tabs at top:
  [SAFE MODE] — uses /api/chat/message (hardened)
  [DEMO MODE] — shows the before/after attack demo

Chat interface:
  Message bubbles (user right, AI left)
  User bubble: dark bg, cyan border
  AI bubble: panel bg, white text
  Typing indicator (animated dots) while waiting

Input bar at bottom:
  Placeholder: "Ask about your order, refund, account..."
  Send button + Enter key

Pre-built quick buttons above input:
  [Where is my order?] [Request a refund] [Reset password] [Track shipment]

ATTACK RESULT DISPLAY:
When an attack fires, show special styled response:
  BEFORE PATCH:
    Red border chat bubble
    Header: "⚠️ VULNERABILITY DETECTED"
    Shows the leaked data / vulnerable response
    
  AFTER PATCH (replay):
    Green border chat bubble
    Header: "⛔ BLOCKED BY PROMETHEUS SHIELD"
    Text: "Request blocked due to security policy: [policy_name]"
    Confetti or pulse animation

---

### RIGHT COLUMN — SECURITY ANALYSIS

Title: "🧠 GEMINI SECURITY ANALYSIS"

This panel updates automatically after each attack.

Shows 4 sub-sections stacked:

SUB 1 — ATTACK DETECTED
  Red badge: attack type + severity
  Prompt preview (truncated, mono font)
  Status: "Analyzing..." spinner → "Analysis Complete" ✓

SUB 2 — GEMINI ROOT CAUSE
  Amber box:
  Label: "ROOT CAUSE"
  Text: analysis.root_cause
  
  Label: "SUGGESTED FIX"
  Text: analysis.suggestion

SUB 3 — AUTO-GENERATED YAML POLICY
  Dark code box with syntax highlighting (green keywords)
  Shows analysis.policy_yaml
  Appears with typewriter animation (character by character)

SUB 4 — DEPLOYMENT STATUS
  [DEPLOY PATCH] button — cyan glow
  On click: POST /api/attacks/patch
  Shows:
    "Deploying..." spinner
    "✅ Patch deployed successfully"
    "Active policies: N"
  Then shows [REPLAY ATTACK] button
  On replay: POST /api/attacks/replay → shows WOW blocked result in chatbot

---

## SECTION 3: ANALYTICS (below main grid)

Title: "📊 REAL-TIME SECURITY ANALYTICS"

4 charts in 2x2 grid:

CHART 1 (top-left) — LINE CHART "Attacks Blocked Over Time"
  Data from: GET /api/metrics/timeline
  X: time, Y: blocked count
  Color: cyan line, red fill below
  Library: Recharts LineChart

CHART 2 (top-right) — BAR CHART "Security Score Improvement"
  Data from: GET /api/metrics/score
  2 bars: Before (42, red) and Current (score, green)
  Animated on load

CHART 3 (bottom-left) — PIE CHART "Threat Type Distribution"
  Data from: GET /api/metrics/threats
  Colors: red, orange, amber, purple, cyan
  Library: Recharts PieChart with custom legend

CHART 4 (bottom-right) — COUNTER CARDS
  Policies Generated: big number, amber
  Catch Rate: percentage, green
  Avg Risk Reduction: score improvement, cyan
  Active Protections: "5/5", green

---

## SECTION 4: AUDIT LOG (full width bottom)

Title: "📋 COMPLIANCE AUDIT TRAIL"
Subtitle: "Regulator-ready logs of all security events"

Table with columns:
  TIME | EVENT TYPE | SEVERITY | ACTION | POLICY USED | STATUS

Data from: GET /api/attacks/log

Color code rows:
  blocked=true → green left border
  blocked=false → red left border

Auto-refresh every 5 seconds.

Export button: "⬇ EXPORT AUDIT LOG (JSON)"

---

## CONNECT AGENT MODAL

Triggered by "CONNECT AGENT" navbar button.
Dark overlay + centered modal.

Title: "Connect Your AI Agent"
Subtitle: "Secure your AI in under 60 seconds"

Fields:
1. Agent Name (text input) — placeholder "ShopEasy Support Bot"
2. AI Provider (dropdown) — Gemini / OpenAI / Claude / Custom API
3. API Key (password input) — placeholder "AIzaSy..."
   Note below: "ⓘ Required for real AI responses. Free Gemini tier works."
4. Endpoint URL (text input) — placeholder "https://api.yoursite.com/chat" (optional)
5. Security Mode (radio):
   ○ Basic  ○ Advanced  ● Autonomous Auto-Patch (default)
6. Protections (checkboxes, all checked by default):
   ☑ Prompt Injection Protection
   ☑ Data Leak Detection
   ☑ Admin Escalation Protection
   ☑ Auto-Patching
   ☑ Threat Logging

Large glowing button: "[ ⚡ PROTECT MY AI AGENT ]"
  On click: POST /api/chat/connect
  Success: modal closes, navbar shows green "CONNECTED" dot
  
---

## API INTEGRATION MAP

### Base URL
const API_BASE = "http://localhost:8000"  // or env variable

### WebSocket
const ws = new WebSocket("ws://localhost:8000/ws")
ws.onmessage = (e) => handleEvent(JSON.parse(e.data))

Events to handle:
  "init"            → set initial metrics
  "agent_connected" → show connected state
  "attack_fired"    → add to terminal log, update counters
  "attack_blocked"  → green flash, update counters
  "gemini_analyzing"→ show spinner in analysis panel
  "analysis_ready"  → populate analysis panel
  "patch_deployed"  → show success, enable replay button
  "replay_result"   → show WOW blocked result

### All API calls

// Connect agent
POST /api/chat/connect
Body: { name, provider, api_key, endpoint, security_mode, protections }

// Normal chat
POST /api/chat/message
Body: { message, api_key }
Returns: { response, blocked, safe }

// Fire attack (STEP 1)
POST /api/attacks/fire
Body: { attack_id, api_key }
Returns: { prompt, response, blocked, log_id, metrics }

// Analyze attack (STEP 2 — call right after fire if !blocked)
POST /api/attacks/analyze
Body: { attack_id, attack_prompt, ai_response, api_key }
Returns: { analysis: { root_cause, suggestion, patterns, policy_name, policy_yaml } }

// Deploy patch (STEP 3)
POST /api/attacks/patch
Body: { attack_id, analysis }
Returns: { status, policy, policies_active, metrics }

// Replay attack (STEP 4 — WOW MOMENT)
POST /api/attacks/replay
Body: { attack_id, api_key }
Returns: { response, blocked, policy_used, wow_moment, metrics }

// Get metrics
GET /api/metrics/summary   → counter cards
GET /api/metrics/timeline  → line chart data
GET /api/metrics/threats   → pie chart data
GET /api/metrics/score     → bar chart data

// Get policies
GET /api/policies/         → policy list with YAML

// Get attack log
GET /api/attacks/log       → audit table

// Reset demo
POST /api/policies/reset   → clears everything

---

## KEY STATE TO MANAGE (React useState / Context)

const [agentConfig, setAgentConfig] = useState(null)
const [currentAttack, setCurrentAttack] = useState(null)   // { id, prompt, response, blocked }
const [currentAnalysis, setCurrentAnalysis] = useState(null) // Gemini analysis result
const [patchDeployed, setPatchDeployed] = useState(false)
const [metrics, setMetrics] = useState({ attacks_total:0, attacks_blocked:0, ... })
const [terminalLog, setTerminalLog] = useState([])          // live terminal entries
const [chatMessages, setChatMessages] = useState([])        // chat bubbles
const [policies, setPolicies] = useState([])                // active policies
const [wsConnected, setWsConnected] = useState(false)

---

## EXACT DEMO FLOW (in UI terms)

1. User opens site → sees hero metrics at 0, risk level HIGH
2. User clicks "CONNECT AGENT" → fills modal → clicks PROTECT → success toast
3. User clicks "[ Prompt Injection ]" button in Attack Simulator
4. RED FLASH animation on button + terminal log shows "[HH:MM] Firing Prompt Injection..."
5. Center chatbot shows: BEFORE state — vulnerable response with leaked data (red border)
6. Right panel: "Gemini analyzing..." spinner appears
7. Root cause text appears (typewriter effect)
8. YAML policy appears (typewriter effect, green syntax)
9. "DEPLOY PATCH" button glows — user clicks it
10. "✅ Patch deployed" message + counter increments
11. "REPLAY ATTACK" button appears — user clicks
12. Center chatbot shows: AFTER state — "⛔ BLOCKED" (green border, confetti pulse)
13. Metrics update: score jumps from 42 → higher, risk changes
14. Audit log at bottom shows new entry

THIS IS THE WINNING DEMO MOMENT.

---

## ANIMATIONS TO IMPLEMENT

- Button click: shake + red flash (CSS keyframes)
- New terminal entry: slide-in from top
- YAML typewriter: character-by-character reveal
- Stat counters: count-up animation on change
- Risk score bar: smooth width transition
- Chat bubble: fade-in-up
- "BLOCKED" response: green pulse + scale-up
- Charts: animate on data change (Recharts built-in)
- Scanning line on hero: sweeping cyan line top→bottom every 3s

---

## TAGLINE TO USE EVERYWHERE

"AI That Defends AI"
Subtitle: "Self-Healing Security for Autonomous AI Agents"

---

## COLOR REFERENCE FOR STITCH

Primary BG:      #020409
Secondary BG:    #071220  
Panel BG:        #050c14
Border color:    #0d2a3e
Cyan accent:     #00d4ff
Red danger:      #ff3c5e
Green success:   #00ff9d
Amber warning:   #ffb800
Dim text:        #3a6a8a
Body text:       #c8e8f8
