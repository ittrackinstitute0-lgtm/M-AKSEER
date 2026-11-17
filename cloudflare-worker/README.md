# AL AKSEER ABBASI - Cloudflare Worker Proxy Guide

This Cloudflare Worker is a free, high-speed proxy that connects your website to the **Google Gemini 3 API** (`gemini-3-flash-preview`).

---

## 🔒 Why Use This Proxy?
- **Keeps Your API Key Secret:** Google Gemini API keys should never be visible in client-side HTML or GitHub.
- **Enforces Store Grounding Rules:** The proxy injects the prompt and store knowledge base directly on the server.
- **100% Free:** Cloudflare Workers provides 100,000 free requests every day.

---

## 🚀 Option 1: Fast Deploy via Cloudflare Dashboard (Recommended, 2 Minutes, No Terminal Needed)

1. **Sign in / Sign up:**
   Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/) (Free account).

2. **Create Worker:**
   - In the left sidebar, click **Compute (Workers & Pages)** -> **Workers**.
   - Click **Create Application** -> **Create Worker**.
   - Name it `al-akseer-ai-proxy` and click **Deploy**.

3. **Paste Worker Code:**
   - On the worker page, click **Edit Code** (top right).
   - Delete everything in `worker.js` and paste the entire contents of `cloudflare-worker/worker.js`.
   - Click **Save and Deploy**.

4. **Add Your Gemini API Key as a Secret:**
   - Go back to the Worker overview page.
   - Click **Settings** tab -> **Variables and Secrets**.
   - Under **Secrets**, click **Add**.
   - Variable name: `GEMINI_API_KEY`
   - Value: Paste your key saved in `private/api_key.txt`.
   - Click **Save and Deploy**.

5. **Copy Your Worker URL:**
   - Your worker URL looks like:
     `https://al-akseer-ai-proxy.YOUR-SUBDOMAIN.workers.dev`
   - Test it by visiting it in your browser; it should show:
     `{"status":"online","service":"AL AKSEER ABBASI AI Chatbot Proxy", ...}`

---

## 💻 Option 2: Deploy via Wrangler CLI

If you prefer using the terminal with Node.js:

```bash
# Navigate to worker folder
cd cloudflare-worker

# Login to Cloudflare
npx wrangler login

# Set your secret Gemini API key (prompt will ask you to paste it)
npx wrangler secret put GEMINI_API_KEY

# Deploy to Cloudflare
npx wrangler deploy
```

---

## 🔗 Connect the Worker URL to Your Website

Once deployed, you can connect the proxy to your website in any of these easy ways:

1. **From Website UI:**
   Open your website (`index.html`), click the floating AI chat button, click the ⚙️ (Settings) icon in the chat header, paste your Worker URL, and click **Save**.
2. **From Admin Panel:**
   Go to `admin.html` -> **Store Settings** -> **AI Chatbot Proxy URL** -> Enter URL & Save.
3. **In Code (`js/chatbot-config.js`):**
   Set `window.AL_AKSEER_WORKER_URL = "https://your-worker-name.workers.dev";`.
