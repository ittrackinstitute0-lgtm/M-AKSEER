/**
 * ============================================================================
 * AL AKSEER ABBASI - AI CHATBOT CLOUDFLARE WORKER PROXY
 * Powered by Google Gemini 3 API (gemini-3-flash-preview)
 * ============================================================================
 * 
 * This Cloudflare Worker acts as a secure, private proxy between the public
 * AL AKSEER ABBASI website and the Google Gemini API.
 * 
 * SECURITY:
 * - Your Gemini API key is stored securely in Worker environment secrets (GEMINI_API_KEY).
 * - The API key is NEVER exposed to the browser or public GitHub repository.
 * - Full CORS protection and strict system rules are enforced on the server.
 */

// Store Information & Verified Knowledge Base
const SYSTEM_INSTRUCTION = `
You are the official AI Chatbot Assistant for "AL AKSEER ABBASI", a premier dry fruits and nuts business in Jacobabad, Sindh, Pakistan.

ABOUT AL AKSEER ABBASI:
- Business Name: AL AKSEER ABBASI
- Business Type: Premium Dry Fruits & Exotic Nuts
- Location / Address: Quetta Road, Jacobabad, Sindh, Pakistan
- Contact Phone / WhatsApp: 03353320944 (International: +92 335 3320944)
- Shop Timings: 6:00 AM to 12:00 AM (Daily 6.00 to 12.00)
- Services: 100% Free Express Delivery on all orders nationwide!
- Core Menu & Verified Prices:
  * BADAM (Almonds / بادام): Rs. 999 per kg (500g: Rs. 500, 250g: Rs. 250)
  * PISTA (Pistachios / پستہ): Rs. 999 per kg (500g: Rs. 500, 250g: Rs. 250)
  * KAJU (Cashews / کاجو): Rs. 999 per kg (500g: Rs. 500, 250g: Rs. 250)
  * AKHROT (Walnuts / اخروٹ Giri): Fresh handpicked harvest
  * KHAJOOR (Dates / کھجور): Premium Saudi Ajwa and Medjool Dates
  * Zafran (Pure Kashmiri Saffron) and Royal Festive Gift Boxes available
- Ordering: Visitors can order directly through the website shopping cart or contact directly on WhatsApp at 03353320944.

STRICT AGENT RULES (MANDATORY):
1. Answer visitors ONLY about AL AKSEER ABBASI, using the verified information above and the website's content.
2. Reply in the visitor's language (English, Urdu, or Roman Urdu). For example, if the visitor speaks Roman Urdu (e.g., "pista ka rate kya hai?"), reply in natural, polite Roman Urdu. If they speak Urdu in Arabic script, reply in Urdu. If in English, reply in English.
3. Keep answers short, friendly, helpful, and welcoming.
4. If the answer is not in this verified info, politely say you don't have that information and provide our contact details (Phone/WhatsApp: 03353320944, Address: Quetta Road, Jacobabad). NEVER invent prices, timings, or facts.
5. If the question is unrelated to AL AKSEER ABBASI (e.g. general knowledge, politics, homework, coding, other businesses), politely refuse and guide the user back to AL AKSEER ABBASI dry fruits.
`;

// Model hierarchy: Use the latest Gemini 3 model with reliable fallbacks
const PRIMARY_MODEL = "gemini-3-flash-preview";
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

// CORS headers to allow GitHub Pages and local development
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 2. Health check / Info endpoint
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          service: "AL AKSEER ABBASI AI Chatbot Proxy",
          model: env.GEMINI_MODEL || PRIMARY_MODEL,
          keyConfigured: Boolean(env.GEMINI_API_KEY),
          version: "1.0.0",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. Only accept POST for chat
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Validate API Key from Worker Secret
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY secret is not set in Cloudflare Worker.",
          hint: "Run 'npx wrangler secret put GEMINI_API_KEY' or configure it in Cloudflare Dashboard -> Settings -> Variables and Secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format chat conversation history for Gemini API
    // Accepts either { messages: [{role: 'user', content: '...'}, ...] } or { message: "..." }
    const rawMessages = requestData.messages || [
      { role: "user", content: requestData.message || "" },
    ];

    if (!rawMessages || rawMessages.length === 0 || !rawMessages[rawMessages.length - 1].content) {
      return new Response(
        JSON.stringify({ error: "Message content cannot be empty." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Convert standard chat messages into Gemini API format
    // Roles: 'user' -> 'user', 'assistant'|'bot'|'model' -> 'model'
    const contents = rawMessages.map((msg) => ({
      role: msg.role === "assistant" || msg.role === "bot" || msg.role === "model" ? "model" : "user",
      parts: [{ text: String(msg.content || "").trim() }],
    }));

    // Selected model from environment or default Gemini 3 model
    const requestedModel = env.GEMINI_MODEL || PRIMARY_MODEL;
    const modelCandidates = [requestedModel, ...FALLBACK_MODELS.filter((m) => m !== requestedModel)];

    // Call Gemini API with automatic fallback
    let lastError = null;

    for (const modelName of modelCandidates) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const payload = {
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: contents,
          generationConfig: {
            temperature: 0.4, // Keep it factual and consistent
            maxOutputTokens: 600,
          },
        };

        const geminiResponse = await fetch(geminiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const replyText =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Assalam-o-Alaikum! Main AL AKSEER ABBASI ka AI assistant hoon. Ap dry fruits ke rates ya free delivery ke baray mein pooch sakte hain, ya 03353320944 par rabta kar sakte hain.";

          return new Response(
            JSON.stringify({
              reply: replyText,
              model: modelName,
              status: "success",
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          const errText = await geminiResponse.text();
          console.warn(`Model ${modelName} returned status ${geminiResponse.status}: ${errText}`);
          lastError = { status: geminiResponse.status, text: errText, model: modelName };
          // If 429 or 404, try next fallback model
          continue;
        }
      } catch (err) {
        console.error(`Fetch exception for ${modelName}:`, err);
        lastError = { status: 500, text: err.message, model: modelName };
        continue;
      }
    }

    // If all models failed, return error
    return new Response(
      JSON.stringify({
        error: "Failed to generate AI response from Gemini API.",
        details: lastError?.text || "Unknown error",
        modelAttempted: lastError?.model,
      }),
      {
        status: lastError?.status || 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  },
};
