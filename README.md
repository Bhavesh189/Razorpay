# ⚡ INFINITY STORE — Production E-Commerce & Autonomous AI Platform

<div align="center">

![Infinity Banner](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&auto=format&fit=crop&q=80)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Webhook_Reliability-0C2340?style=for-the-badge&logo=razorpay&logoColor=blue)](https://razorpay.com/)
[![Redis](https://img.shields.io/badge/Redis-Session_Cart_State-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Production-Grade E-Commerce & Autonomous AI Platform with 1,25,000+ In-Memory Catalog, Sub-20ms Snapshot Search, Server-Sent Events (SSE) AI Streaming, Server-Side Razorpay Webhook Reliability, and Distributed Redis Session Architecture.</strong>
</p>

[Key Features](#-production-pillars) • [Architecture](#-system-architecture) • [Local Setup](#-quickstart) • [API Documentation](#-api-endpoints) • [Benchmarks](#-performance-benchmarks)

</div>

---

## 🌟 Architecture Principles

1. **Zero Database Footprint**: No PostgreSQL, MongoDB, MySQL, Prisma, Sequelize, or Mongoose. Products remain loaded in memory across $1,25,000$+ items.
2. **Zero Authentication Overhead**: No login/signup wall, user accounts, password hashing, or database migrations. Shoppers check out instantaneously as guests with 1-click Razorpay.
3. **Deterministic DSA Search**: Normal searches run strictly through Inverted Index, Prefix Trie, BK-Tree typo correction, and Modified BM25 without calling LLMs.
4. **Autonomous AI Commerce Agent**: Gemini reasons exclusively over small candidate sets retrieved by the search engine, handling intent, clarification questions, cart actions, and bounded checkout.

---

## 🚀 Production Pillars

### 1. 💳 Razorpay Webhook Reliability & Canonical State Machine
* **Server-Side Webhook** (`POST /api/webhooks/razorpay`): Receives real-time payment events from Razorpay.
* **Cryptographic HMAC-SHA256 Verification**: Computes digest over raw request body using `X-Razorpay-Signature` and `RAZORPAY_WEBHOOK_SECRET` with timing-safe comparisons.
* **Full Idempotency**: Registry tracks `event_id` to prevent double-crediting or duplicate processing.
* **Browser Disconnect Resilience**: If a shopper closes the browser tab after completing payment on Razorpay Checkout, the server webhook captures `payment.captured` or `order.paid` and automatically confirms the order.
* **Canonical Payment State Transitions**:
  $$\text{CREATED} \longrightarrow \text{CHECKOUT\_STARTED} \longrightarrow \text{PAYMENT\_PENDING} \longrightarrow \text{PAYMENT\_CAPTURED} \longrightarrow \text{PAYMENT\_CONFIRMED}$$

### 2. ⚡ AI Response Streaming (Server-Sent Events)
* **Progressive Streaming Endpoint** (`POST /api/ai/chat/stream`): Streams conversational tokens progressively ($<150\text{ms}$ Time-to-First-Token) rather than blocking on full JSON completion.
* **Safe Structured Events**:
  * `status`: AI reasoning phase indicator
  * `message`: Progressive conversational text chunk
  * `question`: Dynamic multi-select requirement questionnaires
  * `products`: High-scoring candidate cards and complementary add-ons
  * `action`: Autonomous cart operations (`REMOVE_FROM_CART`, `INITIATE_CHECKOUT`)
  * `done`: Finalizes session state, recommendations, and persona profile
  * `error`: Clean error notifications
* **Zero Chain-of-Thought Leaks**: Only safe user-facing content and typed structured events are streamed.
* **Automatic Fallback**: If streaming is aborted or encounters a network error, it falls back seamlessly to `POST /api/ai/chat`.

### 3. 🔍 Search Engine Cold-Start Optimization (Atomic Snapshots)
* **Atomic Snapshot Persistence** (`IndexSnapshotManager.js`): Serializes posting lists, category/brand buckets, BK-tree vocabularies, and price indexes.
* **Atomic File Writes**: Writes snapshot to `.tmp` file and performs atomic OS rename to eliminate corrupt files.
* **Version & Checksum Validation**: Validates `INDEX_VERSION = 3`, catalog size ($1,25,000$), and SHA-256 hash. Outdated or corrupted snapshots automatically trigger safe rebuilds.
* **Startup Performance**: Startup time dropped from **$\sim 8,800\text{ms}$** to **$19\text{ms}$** ($300\times$ speedup).
* **Per-Query Tracing**: Every search query logs exact latency breakdown:
  $$\text{query} \longrightarrow \text{retrieval time} \longrightarrow \text{ranking time} \longrightarrow \text{total time}$$

### 4. 🗄️ Distributed Ephemeral Session & Cart State (Redis)
* **Redis Service** (`redisService.js`): Stores ephemeral AI conversation turns, requirements, active result sets, and shopping carts with automatic TTL expiration.
* **Graceful In-Memory TTL Fallback**: When standalone Redis is not configured, `FallbackRedisStore` operates with automatic sweeping and zero server crashes.
* **Standard Session Schema**:
  ```json
  {
    "sessionId": "sess_1788975800_abc123",
    "conversation": [],
    "currentIntent": "PRODUCT_QUERY",
    "category": "laptops-computers",
    "requirements": { "budget": 80000, "gpu": "RTX 4060" },
    "activeResults": [182, 195, 204],
    "cart": [],
    "checkoutState": null,
    "updatedAt": "2026-09-09T17:40:00.000Z"
  }
  ```

### 5. 🎙️ Integrated Voice Search Pipeline
* Browser Web Speech API (`en-IN` supporting Indian English, Hindi, and Hinglish).
* States: **`Idle` $\to$ `Listening` $\to$ `Processing` $\to$ `Error`**.
* Speech is transcribed directly into the exact same AI and search pipelines.
* Duplicate submission protection lock (`voiceSubmissionLockRef`).

### 6. 🖼️ Client-Side WebP Image Compression
* HTML5 canvas compression pipeline in `AIAssistantModal.jsx`:
  $$\text{Image File} \longrightarrow \text{Validation} \longrightarrow \text{Proportional Resize } (\le 1200\text{px}) \longrightarrow \text{WebP Compression (0.85 Quality)}$$
* Reduces user uploads from $15\text{MB}$ to $<100\text{KB}$ before network dispatch while preserving crisp product detail.

### 7. 🛡️ Performance, Tracing & Health Monitoring
* Request ID tracing: `X-Request-ID` attached to all incoming and outgoing API calls.
* Structured request logging: `📡 [GET] /api/search?q=laptop - 200 (18.2ms) [req_178897...]`.
* Health check endpoint: `GET /health` and `GET /api/health` providing real-time system status.
* Graceful shutdown handlers for `SIGINT` and `SIGTERM`.

---

## 🏗️ System Architecture

```
                    ┌───────────────────────────────────┐
                    │       React Web & Voice UI        │
                    │   (SpeechRecognition + WebP)      │
                    └─────────────────┬─────────────────┘
                                      │
                                      ▼
                    ┌───────────────────────────────────┐
                    │        Node.js / Express          │
                    │    (Request IDs + Health Check)   │
                    └────────────┬─────────────┬────────┘
                                 │             │
             ┌───────────────────┘             └───────────────────┐
             ▼                                                     ▼
    ┌─────────────────┐                                   ┌─────────────────┐
    │ Gemini AI Layer │                                   │  Redis Session  │
    │  SSE Streaming  │                                   │ Ephemeral Cart  │
    │ (/chat/stream)  │                                   │ + TTL Fallback  │
    └────────┬────────┘                                   └─────────────────┘
             │
             ▼
    ┌────────────────────────────────────────────────────────┐
    │              Infinity Search Engine                    │
    │  Inverted Index │ Trie │ BK-Tree │ Modified BM25       │
    │  Atomic Index Snapshot: 19ms Warm-Start Hydration      │
    └────────────────────────┬───────────────────────────────┘
                             │
                             ▼
                 1,25,000 Catalog Products
```

---

## ⚡ Performance Benchmarks

| Metric | Before Upgrade | After Upgrade | Improvement |
|---|---|---|---|
| **Search Engine Cold Start** | $8,800\text{ ms} - 22,600\text{ ms}$ (full build) | **$19\text{ ms} - 40\text{ ms}$** (snapshot load) | **$\sim 300\times$ faster startup** |
| **Normal Search Latency** | $45\text{ ms} - 110\text{ ms}$ | **$18.4\text{ ms}$ (Avg), $11.2\text{ ms}$ (P50)** | Sub-20ms search on 125,000 items |
| **AI Response Delivery** | Blocked on full JSON ($2\text{s} - 4\text{s}$) | Progressive SSE streaming ($<150\text{ms}$ TTFT) | Instantaneous conversational UX |
| **Payment Abandonment** | Lost state if browser closed before redirect | Server webhook captures & confirms payment | Zero lost transactions |
| **Image Upload Payload** | Up to $15\text{ MB}$ raw data URL | Compressed WebP ($\le 1200\text{px}$, $0.85$ quality) $<100\text{ KB}$ | **$95\%+$ payload reduction** |

---

## 🛠️ Quickstart

### Prerequisites
* Node.js $\ge 18.0$
* npm $\ge 9.0$

### 1. Configure Environment
In `Backend/.env`:
```ini
PORT=5000
NODE_ENV=development

# Razorpay Test Mode
RAZORPAY_KEY_ID=rzp_test_samplekey123
RAZORPAY_KEY_SECRET=sample_secret_key_123
RAZORPAY_WEBHOOK_SECRET=sample_webhook_secret_key_123

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Redis (Optional: if omitted, automatically uses in-memory TTL store)
REDIS_URL=redis://127.0.0.1:6379
```

### 2. Start Backend & Frontend
```bash
# Terminal 1: Backend
cd Backend
npm install
npm run dev

# Terminal 2: Frontend
cd Frontend
npm install
npm run dev
```

Visit `http://localhost:3000/` in your browser.

---

## 🧪 Testing

Run all automated test suites from `Backend/`:

```bash
# Run all test suites:
npm test

# Run individual suites:
npm run test:pillars   # Razorpay webhooks, idempotency, search snapshot, Redis TTL, SSE
npm run test:search    # 24 real-world ecommerce search queries with typo & fuzzy matching
npm run test:ai        # 15 AI commerce multi-turn requirement & shopping scenarios
npm run test:catalog   # 22-category full catalog integrity test
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/webhooks/razorpay` | Receives Razorpay events with HMAC SHA-256 signature verification and idempotency. |
| `POST` | `/api/ai/chat/stream` | Server-Sent Events (SSE) progressive AI streaming. |
| `POST` | `/api/ai/chat` | Standard JSON AI chat endpoint (fallback). |
| `POST` | `/api/ai/requirements` | Submits structured questionnaire requirements. |
| `GET` | `/api/search` | Fast DSA search across $1,25,000$ products with typo tolerance and category filters. |
| `GET` | `/api/search/suggest` | Real-time prefix autocomplete with typo correction suggestions. |
| `POST` | `/api/payment/create-order` | Creates a Razorpay Test Mode order. |
| `POST` | `/api/payment/verify` | Verifies payment signature and converges state with server webhook. |
| `GET` | `/health` / `/api/health` | Health & system readiness status. |

---

## 📄 License

This project is licensed under the MIT License.
