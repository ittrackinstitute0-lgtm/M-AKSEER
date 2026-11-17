# AL AKSEER ABBASI - Premium 3D Dry Fruits Store & Gemini 3 AI Chatbot

A luxury, interactive e-commerce storefront for **AL AKSEER ABBASI** (Quetta Road, Jacobabad), featuring real-time **Three.js 3D product rendering**, interactive shopping cart, WhatsApp checkout, and an **AI Chatbot Agent powered by Google Gemini 3 API** via a secure **Cloudflare Worker proxy**.

---

## 📍 Store Information
- **Store Name:** AL AKSEER ABBASI
- **Type:** Premium Royal Dry Fruits & Nuts
- **Location / Address:** Quetta Road, Jacobabad, Sindh, Pakistan
- **Phone / WhatsApp:** 03353320944 (+92 335 3320944)
- **Timings:** 6:00 AM – 12:00 AM (Daily: 6.00 to 12.00)
- **Services:** 100% Free Express Delivery on All Orders nationwide!
- **Special Rates:**
  - **BADAM (Almonds / بادام):** Rs. 999 per kg
  - **PISTA (Pistachios / پستہ):** Rs. 999 per kg
  - **KAJU (Cashews / کاجو):** Rs. 999 per kg
  - Fresh Akhrot, Ajwa & Medjool Dates, Pure Kashmiri Saffron, and Royal Gift Boxes

---

## 🤖 AI Chatbot Agent (Google Gemini 3)
The website includes an intelligent, grounded chatbot agent:
1. **Model:** Google Gemini 3 (`gemini-3-flash-preview` with automatic resilience fallbacks).
2. **Multilingual:** Responds in the visitor's language — **English, Urdu, or Roman Urdu**.
3. **Strict Grounding Rules:**
   - Answers visitors **only** about AL AKSEER ABBASI and website dry fruits content.
   - Refuses to invent prices, timings, or facts. If unknown, directs the user to **03353320944** and **Quetta Road, Jacobabad**.
   - Politely refuses questions unrelated to AL AKSEER ABBASI.
4. **Animated 3D Floating UI:**
   - 3D perspective mouse physics on hover with metallic gold pulse ring.
   - Luxury dark gold glassmorphic chat window with suggestion chips, online badge, direct call/WhatsApp shortcuts, and quick settings popover.
   - Works seamlessly on desktop and mobile devices.

---

## 🔒 API Key Security Protocol
The website is designed to be public on GitHub Pages without ever exposing your Gemini API key:
- **Private Folder:** The API key is stored **ONLY** in `private/api_key.txt` and `private/.env`.
- **Git Ignored:** `.gitignore` explicitly prevents the `private/` folder and secret files from being committed.
- **Server-Side Proxy:** The website calls **only** your free Cloudflare Worker proxy. Your API key is stored as an encrypted Worker secret on Cloudflare.

---

## 🚀 Step-by-Step Instructions

### Step 1: Deploy the Free Cloudflare Worker Proxy (2 Minutes)

You can deploy the proxy with zero software installation directly from your browser:

1. **Sign Up / Log In to Cloudflare:**
   Go to [dash.cloudflare.com](https://dash.cloudflare.com/) (Free).
2. **Create a Worker:**
   - Click **Compute (Workers & Pages)** in the left sidebar.
   - Click **Create Application** -> **Create Worker**.
   - Name your worker: `al-akseer-ai-proxy` and click **Deploy**.
3. **Paste the Worker Code:**
   - Click **Edit Code** in the top right.
   - Replace everything in `worker.js` with the code inside [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js).
   - Click **Save and Deploy**.
4. **Add Your Gemini API Key as a Secret:**
   - Go to your Worker's main page -> **Settings** tab -> **Variables and Secrets**.
   - Under **Secrets**, click **Add**.
   - **Variable name:** `GEMINI_API_KEY`
   - **Value:** Paste the API key from your `private/api_key.txt`.
   - Click **Save and Deploy**.
5. **Copy Your Worker URL:**
   - Your URL will look like: `https://al-akseer-ai-proxy.YOUR-SUBDOMAIN.workers.dev`
   - Test it by visiting it in your browser; it should return `{"status":"online", ...}`.

---

### Step 2: Connect the Worker URL to Your Website

You can set the worker URL in any of these 3 easy ways:

- **Method A (Easiest - From Chatbot UI):**
  Open `index.html` in your browser, click the floating AI chat button, click the ⚙️ (Settings) icon in the header, paste your Worker URL, and click **Save URL**.
- **Method B (From Admin Panel):**
  Open `admin.html` (Password: `admin123`), navigate to **Store Settings**, paste the URL into **Gemini 3 AI Chatbot - Cloudflare Worker Proxy URL**, and click **Save Settings**.
- **Method C (In Code):**
  Open [`js/chatbot-config.js`](js/chatbot-config.js) and paste the URL into:
  ```javascript
  window.AL_AKSEER_CONFIG = {
    workerUrl: "https://al-akseer-ai-proxy.YOUR-SUBDOMAIN.workers.dev",
    ...
  };
  ```

---

### Step 3: Publish Your Website on GitHub Pages

1. **Initialize Git Repository:**
   Open PowerShell or Terminal in this folder (`AL AKSEER ABBASI`):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AL AKSEER ABBASI store with Gemini 3 AI Chatbot"
   ```
   *(Note: The `private/` folder is in `.gitignore` and will never be committed!)*

2. **Create a New GitHub Repository:**
   - Go to [github.com/new](https://github.com/new).
   - Name it `al-akseer-abbasi` (Public).
   - Do NOT check "Initialize with README".
   - Click **Create repository**.

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/al-akseer-abbasi.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - On GitHub, go to your repository **Settings** -> **Pages** (left menu).
   - Under **Build and deployment -> Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`, then click **Save**.
   - In 1-2 minutes, your website is live at:
     `https://YOUR_USERNAME.github.io/al-akseer-abbasi/`

---

## 📁 Project Structure

```text
AL AKSEER ABBASI/
│
├── index.html                   # Storefront with 3D canvas and interactive shop
├── admin.html                   # Store Admin Portal & Dashboard
├── README.md                    # Documentation & step-by-step guides
├── .gitignore                   # Prevents private/ and keys from being committed
│
├── private/                     # SECURE DIRECTORY (Git-ignored)
│   ├── api_key.txt              # Your Gemini API key (private only)
│   └── .env                     # Environment variable format for wrangler
│
├── cloudflare-worker/           # CLOUDFLARE WORKER PROXY
│   ├── worker.js                # Server-side proxy with Gemini 3 API & grounding
│   ├── wrangler.toml            # Cloudflare deployment configuration
│   ├── package.json             # NPM scripts for wrangler
│   └── README.md                # Fast deployment guide for Cloudflare
│
├── css/
│   ├── style.css                # Luxury storefront styling & 3D card perspective
│   ├── admin.css                # Admin dashboard layout & styles
│   └── chatbot.css              # 3D animated floating button & glassmorphic chat
│
└── js/
    ├── chatbot-config.js        # Public configuration for proxy URL
    ├── chatbot.js               # 3D Chatbot engine, multilingual, grounding & fallback
    ├── data.js                  # StoreDB layer & verified products (Rs. 999/kg)
    ├── three-scene.js           # Procedural 3D WebGL engine (Pistachio, Almond, etc.)
    ├── app.js                   # E-commerce cart, filters, weights, WhatsApp checkout
    └── admin.js                 # Admin CRUD, orders, and store settings
```

---

## 📞 Support & Contacts
- **Address:** Quetta Road, Jacobabad, Sindh, Pakistan
- **Phone / WhatsApp:** 03353320944
- **Admin Access:** Open `admin.html` and click **One-Click Demo Login** (Password: `admin123`).
