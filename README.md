# ⚡ INFINITY STORE — Agentic AI E-Commerce & Razorpay Autonomous Commerce Platform

<div align="center">

![Infinity Banner](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&auto=format&fit=crop&q=80)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=blue)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Next-Generation Autonomous AI Commerce Engine with Consultative Specification Breakdown, Dynamic Prototype Generation, Synergistic Add-ons, and Bounded In-Chat Razorpay Payments.</strong>
</p>

[Key Features](#-key-features--capabilities) • [Architecture](#-system-architecture) • [Local Setup](#-step-by-step-local-setup) • [API Documentation](#-api-reference) • [Audit & Safety](#-security-and-financial-guardrails)

</div>

---

## 🌟 Executive Overview

**Infinity Store** is an enterprise-grade agentic e-commerce platform that bridges the gap between consultative retail shopping and instant digital checkout. Powered by **Google Gemini 1.5** and an in-memory inverted index of **100,000+ catalog items**, the AI assistant conducts single-turn requirement discovery, calculates deep hardware/material specifications, generates specification-accurate prototype products on demand, curates complementary related add-ons with actionable rationale, and executes 1-click **Razorpay Payment Gateway** checkouts with an **Explainable Audit Trail**.

---

## 🚀 Key Features & Capabilities

### 1. 🤖 Agentic AI Senior Commerce Advisor
- **Single-Turn Requirement Discovery**: Broad queries (e.g., *"I want to buy a laptop"*) trigger an interactive questionnaire card with clickable chips, budget sliders, and custom specification inputs.
- **Strict No-Repeat Questionnaire Loop**: Once specifications are provided (or selected from discovery chips), the agent **never repeats questions** and immediately serves verified product recommendations with deep technical breakdowns.
- **100% Professional English Interface**: All prompts, breakdowns, upsell pitches, tooltips, and toasts communicate in fluent, articulate, and professional English.

### 2. 🔬 Deep Technical & Material Specification Engine
- **Hardware Architecture**: Detailed breakdown of multi-core CPUs, dedicated NVIDIA RTX 40-series GPUs (TGP wattages, MUX switches, DLSS 3.5), display technologies (240Hz OLED/Mini-LED, 100% DCI-P3), and vapor chamber thermal solutions.
- **Fabric & Craftsmanship**: Bio-washed 220 GSM heavyweight cotton drapes, Pure Banarasi Golden Zari weaves, and ergonomic dual-density EVA footwear soles.

### 3. ⚡ Dynamic Prototype Demo Product Generator
- When a user requests specific constraints (e.g., *"RTX 4070 laptop under ₹75,000"* or *"Oversized graphic tee under ₹300"*) that are absent or sparse in static catalog presets, the backend dynamically synthesizes realistic, specification-matched **Prototype Demo Products** complete with accurate pricing, specifications, ratings, reviews, and high-resolution visuals.

### 4. 💡 Synergistic Related Products & Add-ons Engine
- Right below recommended products, a dedicated **Essential Add-ons & Related Products** grid is generated.
- **Actionable "Why Buy This Separately" Rationale**: Every companion card includes a highlighted callout explaining the exact synergy (e.g., *preventing laptop thermal throttling with turbo cooling pads, protecting AMOLED screens with 9H tempered glass, or 3x faster charging with GaN adapters*).
- **1-Click Companion Actions**: Direct `Watch` (details modal), `+ Add to Cart`, and `⚡ Instant Buy` controls for every related accessory.

### 5. 💳 Bounded & Gated Razorpay Payment Gateway
- **Official Razorpay Checkout**: Fully integrated with official Razorpay Web SDK and backend HMAC-SHA256 signature verification.
- **In-Chat 1-Click Payments**: Launch payment modals directly from AI conversations or standard cart drawers.
- **Graceful Failure & Dismissal Handling**: If a user cancels the popup or network timeouts occur, cart state is 100% preserved with automated retry triggers.
- **Zero Surprise Deductions**: All money operations are human-authorized and bounded by configurable session caps.

### 6. 📝 Real-Time Explainable Audit Trail
- Transparent ledger recording every monetary event:
  - `PAYMENT_INITIATED` / `RAZORPAY_ORDER_CREATED`
  - `PAYMENT_VERIFIED` with Razorpay Payment ID
  - `PAYMENT_DISMISSED` / `PAYMENT_FAILED` with error diagnostics
  - `CART_ITEM_ADDED` / `CART_ITEM_REMOVED`
  - `A2A_TRANSACT_SUCCESS` (Autonomous agent simulation under ACP-2.0 protocols)

### 7. ⚡ High-Throughput 100k+ Inverted Index Search
- Microsecond search over 100,000+ generated products utilizing tag inverted indexes, keyword scoring, budget boundaries, and category hierarchy filters.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Customer / Agent UI]) -->|Query / Voice / Filters| Frontend[React 18 + Vite Frontend]
    Frontend -->|POST /api/ai/chat| Backend[Node.js + Express Backend]
    
    subgraph AI & Catalog Layer
        Backend -->|Semantic / Keyword Query| SearchEngine[Inverted Index Catalog (100k+ SKUs)]
        Backend -->|Requirements Prompt| GeminiAPI[Google Gemini 1.5 Flash]
        Backend -->|Sparse Catalog Fallback| PrototypeGen[Dynamic Spec & Prototype Generator]
        Backend -->|Cross-Category Synergy| RelatedEngine[Related Products & Why-Buy Engine]
    end

    subgraph Payments & Security Layer
        Frontend -->|SDK Trigger| RazorpayModal[Official Razorpay Web SDK]
        RazorpayModal -->|Auth & Pay| RazorpayServer[Razorpay Payment Gateway]
        RazorpayServer -->|Payment ID + Signature| Backend
        Backend -->|HMAC-SHA256 Verification| PaymentService[Payment Verification Service]
        PaymentService -->|Log Transaction| AuditTrail[Explainable Audit Ledger]
    end

    Backend -->|JSON Response: Reply + Specs + Products + Related| Frontend
```

---

## 📁 Repository Structure

```
Razorpay/
├── Backend/
│   ├── data/
│   │   └── products/
│   │       ├── index.js              # Inverted index, hierarchy & search engine
│   │       ├── generator.js          # 100,000+ multi-category product generator
│   │       ├── electronics.js        # Laptops, audio, smart wearables, PC gear
│   │       ├── clothing.js           # Streetwear, sarees, kurtas, denim
│   │       ├── beauty.js             # Skincare, cosmetics, serums
│   │       ├── home.js               # Home decor, kitchenware, furnishings
│   │       └── jewelleryAndBags.js   # Temple jewelry, clutches, footwear
│   ├── services/
│   │   ├── aiService.js              # Gemini 1.5 integration, prototypes & related products
│   │   └── paymentService.js         # Razorpay order creation & HMAC verification
│   ├── .env.example                  # Environment configuration blueprint
│   ├── package.json                  # Backend dependencies & scripts
│   ├── server.js                     # Express API gateway & routes
│   └── test_razorpay.js              # Standalone gateway connectivity verification
│
├── Frontend/
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAssistantModal.jsx   # Interactive AI chat, specs & related products UI
│   │   │   ├── AIAssistantButton.jsx  # Floating luxury launch button
│   │   │   ├── CheckoutModal.jsx      # Multi-step address, order & Razorpay modal
│   │   │   ├── CartDrawer.jsx         # Live slide-over cart drawer
│   │   │   ├── ProductGrid.jsx        # Responsive catalog cards & filters
│   │   │   ├── ProductDetailModal.jsx # Full-screen rich specs inspection
│   │   │   ├── FilterSidebar.jsx      # Advanced price/category/rating filters
│   │   │   ├── Header.jsx             # Search bar, mega menu & currency header
│   │   │   └── SafeImage.jsx          # Resilient image loader with fallback
│   │   ├── context/
│   │   │   └── ShopContext.jsx        # Cart state, filters, orders & audit store
│   │   ├── data/                      # Banners, static category presets & coupons
│   │   ├── index.css                  # Modern glassmorphism & Tailwind design system
│   │   ├── App.jsx                    # Root view orchestrator
│   │   └── main.jsx                   # React DOM mount point
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js             # Extended color palettes & animations
│   └── vite.config.js                 # Vite dev server & proxy settings
│
└── README.md                         # Comprehensive platform documentation
```

---

## 🛠️ Step-by-Step Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **Razorpay Account**: Test Mode API Keys ([Razorpay Dashboard](https://dashboard.razorpay.com/))
- **Google Gemini API Key**: *(Optional, platform has built-in smart fallback)* ([Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Bhavesh189/Razorpay.git
cd Razorpay
```

---

### Step 2: Backend Setup & Configuration

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Populate your `.env` file with your credentials:
   ```env
   PORT=5000
   GEMINI_API_KEY="your_gemini_api_key_here"
   RAZORPAY_KEY_ID="rzp_test_YourKeyIdHere"
   RAZORPAY_KEY_SECRET="YourRazorpayKeySecretHere"
   ```

5. Start the backend server:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Or standard production start
   npm start
   ```

   *The backend will initialize the 100,000+ catalog in-memory and start listening on `http://localhost:5000`.*

---

### Step 3: Frontend Setup & Launch

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Testing Gateway Connectivity

To verify your Razorpay API keys without launching the full web app, run our diagnostic script:

```bash
cd Backend
node test_razorpay.js
```

**Expected Diagnostic Output:**
```
🔍 Testing Razorpay Credentials...
Key ID: rzp_test_...
✅ Razorpay client initialized successfully!
📦 Creating test order for INR 500.00...
🎉 Test Order Created Successfully!
Order ID: order_XXXXX
Amount: 50000 paise (Rs.500)
Status: created
🚀 Razorpay Integration is 100% READY for Live Transactions!
```

---

## 📡 API Reference

### 1. AI Agent Commerce Endpoint
- **URL**: `/api/ai/chat`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "query": "Gaming laptop with RTX 4070 and 32GB RAM under 130000",
    "history": [],
    "cartContext": []
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "reply": "Here is the technical specification breakdown for our top-recommended gaming laptops...",
    "questionnaire": null,
    "products": [
      {
        "id": "prod-27",
        "title": "Lenovo Legion Pro 7i Gen 9 • Core i9 • RTX 4070 8GB • 240Hz Display",
        "price": 119999,
        "originalPrice": 169999,
        "discount": 29
      }
    ],
    "relatedProducts": [
      {
        "id": "rel-lap-1",
        "title": "Pro Esports RGB Optical Gaming Mouse (7200 DPI)",
        "price": 399,
        "whyBuy": "Prevents trackpad fatigue and delivers pixel-perfect cursor accuracy during gaming and coding.",
        "benefitTag": "Essential Precision & Ergonomics"
      }
    ],
    "suggestedFollowUpQueries": ["Add to Cart 🛒", "Proceed to Razorpay Checkout ⚡"]
  }
  ```

---

### 2. Create Razorpay Order
- **URL**: `/api/payment/create-order`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "amount": 2499,
    "currency": "INR",
    "receipt": "inf_order_12345"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order_NX8...",
      "amount": 249900,
      "currency": "INR",
      "status": "created"
    },
    "key_id": "rzp_test_..."
  }
  ```

---

### 3. Verify Payment Signature
- **URL**: `/api/payment/verify`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "razorpay_order_id": "order_NX8...",
    "razorpay_payment_id": "pay_NX9...",
    "razorpay_signature": "e5c2b..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully",
    "paymentId": "pay_NX9..."
  }
  ```

---

## 🛡️ Security and Financial Guardrails

| Guardrail | Implementation | Protection Detail |
| :--- | :--- | :--- |
| **Human-Gated Authorization** | Official Razorpay Modal Popup | Zero auto-debit. User must explicitly authorize payment on the official gateway. |
| **HMAC-SHA256 Signature Verification** | `crypto.createHmac` Backend Validation | Prevents client-side spoofing of transaction completion status. |
| **Session Price Integrity** | Dynamic Cart Recalculation | Frontend price manipulation is blocked; backend recomputes MRP & discounts. |
| **Sanitized Secret Key Storage** | Server-side `.env` containment | Razorpay secret keys are never bundled or exposed to the client application. |
| **Explainable Audit Ledger** | Real-time structured log | All monetary interactions are immutably logged with timestamps & payment IDs. |

---

## 🎨 UI/UX Design System Tokens

- **Typography**: `Outfit`, `Inter`, `system-ui`
- **Color Palette**:
  - Primary Indigo: `#4338ca` to `#6366f1`
  - Deep Violet: `#6d28d9` to `#7c3aed`
  - Accent Amber / Gold: `#f59e0b` to `#fbbf24`
  - Emerald Verified: `#10b981`
  - Midnight Glass Canvas: `#0f172a` & `#f8fafc`
- **Animations**: Tailwind `animate-in`, `zoom-in-95`, pulse micro-badges, and celebratory canvas confetti.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by <strong>Bhavesh Sharma</strong> for the Next Era of Agentic E-Commerce.</sub>
</div>
