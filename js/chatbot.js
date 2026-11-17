/**
 * ============================================================================
 * AL AKSEER ABBASI - 3D ANIMATED AI CHATBOT AGENT
 * Model: Google Gemini 3 (gemini-3-flash-preview) via Cloudflare Worker Proxy
 * Supports: English, Urdu & Roman Urdu, 3D Tilt Physics, Mobile Responsiveness
 * ============================================================================
 */

(function () {
  'use strict';

  // Store Knowledge Base & Rules
  const STORE_INFO = {
    name: "AL AKSEER ABBASI",
    type: "Dry Fruits & Nuts",
    address: "Quetta Road, Jacobabad, Sindh, Pakistan",
    phone: "03353320944",
    phoneFormatted: "+92 335 3320944",
    whatsapp: "923353320944",
    timings: "6:00 AM to 12:00 AM (Daily: 6.00 to 12.00)",
    delivery: "100% Free Express Delivery nationwide on all orders!",
    rates: {
      badam: "Rs. 999 per kg",
      pista: "Rs. 999 per kg",
      kaju: "Rs. 999 per kg"
    }
  };

  const ChatbotApp = {
    isOpen: false,
    history: [], // Multi-turn chat memory [{ role: 'user'|'model', content: '...' }]
    workerUrl: "",

    init: function () {
      this.loadWorkerUrl();
      this.renderWidget();
      this.bindEvents();
      this.init3DTilt();
    },

    loadWorkerUrl: function () {
      // 1. Check localStorage
      const saved = localStorage.getItem('al_akseer_worker_url');
      if (saved && saved.trim()) {
        this.workerUrl = saved.trim();
        return;
      }

      // 2. Check window config if set
      if (window.AL_AKSEER_CONFIG && window.AL_AKSEER_CONFIG.workerUrl) {
        this.workerUrl = window.AL_AKSEER_CONFIG.workerUrl.trim();
        return;
      }

      // 3. Check StoreDB settings if available
      if (typeof StoreDB !== 'undefined' && StoreDB.getSettings) {
        const settings = StoreDB.getSettings();
        if (settings && settings.workerUrl) {
          this.workerUrl = settings.workerUrl.trim();
          return;
        }
      }
    },

    saveWorkerUrl: function (url) {
      this.workerUrl = (url || '').trim();
      localStorage.setItem('al_akseer_worker_url', this.workerUrl);
      if (typeof StoreDB !== 'undefined' && StoreDB.saveSettings && StoreDB.getSettings) {
        const s = StoreDB.getSettings();
        s.workerUrl = this.workerUrl;
        StoreDB.saveSettings(s);
      }
    },

    /* ================= RENDER DOM ELEMENTS ================= */
    renderWidget: function () {
      if (document.getElementById('al-akseer-chat-root')) return;

      const root = document.createElement('div');
      root.id = 'al-akseer-chat-root';
      root.className = 'al-akseer-chat-widget';

      root.innerHTML = `
        <!-- Floating Tooltip Pill -->
        <div class="chat-tooltip-pill" id="chat-tooltip-pill">
          <i class="fas fa-sparkles tooltip-sparkle"></i>
          <span>Chat with AL AKSEER AI (Prices & Delivery)</span>
        </div>

        <!-- 3D Floating Action Button -->
        <button class="chat-trigger-btn" id="chat-trigger-btn" aria-label="Open AL AKSEER AI Chatbot">
          <div class="trigger-pulse-ring"></div>
          <div class="trigger-icon-wrap">
            <i class="fas fa-comment-dots"></i>
            <i class="fas fa-times"></i>
          </div>
        </button>

        <!-- 3D Glassmorphic Chat Window -->
        <div class="chat-window" id="chat-window" role="dialog" aria-modal="true" aria-label="AL AKSEER ABBASI AI Assistant">
          
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header-brand">
              <div class="chat-avatar-3d">
                <i class="fas fa-robot"></i>
                <div class="chat-status-dot" title="Online"></div>
              </div>
              <div class="chat-header-info">
                <div class="chat-header-title">
                  <span>AL AKSEER ABBASI</span>
                  <i class="fas fa-crown brand-crown"></i>
                </div>
                <div class="chat-header-sub">
                  <i class="fas fa-bolt text-gold"></i>
                  <span>Gemini 3 Powered • Online</span>
                </div>
              </div>
            </div>

            <div class="chat-header-actions">
              <a href="tel:${STORE_INFO.phone}" class="chat-action-btn" title="Call Store (${STORE_INFO.phone})">
                <i class="fas fa-phone-alt"></i>
              </a>
              <a href="https://wa.me/${STORE_INFO.whatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum AL AKSEER ABBASI! I would like to order fresh dry fruits.')}" target="_blank" class="chat-action-btn" title="WhatsApp Us">
                <i class="fab fa-whatsapp"></i>
              </a>
              <button class="chat-action-btn" id="chat-settings-toggle-btn" title="Proxy Connection Settings">
                <i class="fas fa-cog"></i>
              </button>
              <button class="chat-action-btn" id="chat-close-btn" title="Close Chat">
                <i class="fas fa-chevron-down"></i>
              </button>
            </div>
          </div>

          <!-- Settings Popover (Cloudflare Proxy URL Configuration) -->
          <div class="chat-settings-popover" id="chat-settings-popover">
            <div class="settings-popover-title">
              <span><i class="fas fa-shield-alt text-gold"></i> Cloudflare Proxy Settings</span>
              <button class="close-settings-btn" id="chat-settings-close-btn">&times;</button>
            </div>
            <div class="settings-input-group">
              <label for="worker-url-input">Cloudflare Worker URL:</label>
              <input type="url" id="worker-url-input" placeholder="https://al-akseer-ai-proxy.workers.dev" value="${this.workerUrl}">
            </div>
            <p class="settings-help-text">
              Enter your deployed Cloudflare Worker URL to connect to the Google Gemini 3 API. Your API key remains 100% private in Cloudflare Secrets.
            </p>
            <div class="settings-actions">
              <button type="button" class="btn-settings-test" id="btn-test-worker">Test Status</button>
              <button type="button" class="btn-settings-save" id="btn-save-worker">Save URL</button>
            </div>
          </div>

          <!-- Messages Body -->
          <div class="chat-messages-container" id="chat-messages-list">
            
            <!-- Welcome Card -->
            <div class="chat-welcome-card">
              <div class="chat-welcome-logo"><i class="fas fa-crown"></i></div>
              <div class="chat-welcome-title">AL AKSEER ABBASI AI ASSISTANT</div>
              <div class="chat-welcome-desc">
                Assalam-o-Alaikum! Welcome to AL AKSEER ABBASI Dry Fruits. Ask me anything about our dry fruit rates, free delivery, timings, or Jacobabad store location.
              </div>
              <div class="chat-highlights-grid">
                <div class="highlight-chip"><i class="fas fa-map-marker-alt"></i> Quetta Rd, Jacobabad</div>
                <div class="highlight-chip"><i class="fas fa-shipping-fast"></i> Free Delivery</div>
                <div class="highlight-chip"><i class="fas fa-tag"></i> Badam/Pista/Kaju Rs 999/kg</div>
                <div class="highlight-chip"><i class="fas fa-clock"></i> 6:00 AM - 12:00 AM</div>
              </div>
            </div>

            <!-- Quick Suggestions -->
            <div class="chat-suggestions-wrap">
              <div class="suggestions-title">Quick Inquiries:</div>
              <div class="suggestions-chips">
                <button class="btn-suggestion" data-msg="What are the prices of Badam, Pista and Kaju?">Badam, Pista & Kaju Rates</button>
                <button class="btn-suggestion" data-msg="Do you offer free delivery?">Free Delivery Details</button>
                <button class="btn-suggestion" data-msg="Where is your shop located and what are timings?">Location & Timings</button>
                <button class="btn-suggestion" data-msg="What is your phone number for ordering?">Contact / WhatsApp</button>
              </div>
            </div>

          </div>

          <!-- Typing Indicator (Initially Hidden) -->
          <div class="chat-typing-row" id="chat-typing-indicator" style="display: none; padding: 0 16px 12px 16px;">
            <div class="chat-typing-bubble">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>

          <!-- Input Footer -->
          <div class="chat-footer">
            <form class="chat-form" id="chat-form">
              <div class="chat-input-wrap">
                <input 
                  type="text" 
                  class="chat-input" 
                  id="chat-user-input" 
                  placeholder="Ask in English, Urdu or Roman Urdu..." 
                  autocomplete="off" 
                  required
                >
              </div>
              <button type="submit" class="btn-chat-send" id="chat-send-btn" aria-label="Send Message">
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>
            <div class="chat-bottom-meta">
              <span>English, Urdu & Roman Urdu supported</span>
              <span class="meta-model-tag"><i class="fas fa-brain"></i> Gemini 3 AI</span>
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(root);
    },

    /* ================= BIND EVENTS ================= */
    bindEvents: function () {
      const widget = document.getElementById('al-akseer-chat-root');
      const triggerBtn = document.getElementById('chat-trigger-btn');
      const closeBtn = document.getElementById('chat-close-btn');
      const form = document.getElementById('chat-form');
      const input = document.getElementById('chat-user-input');
      const settingsToggle = document.getElementById('chat-settings-toggle-btn');
      const settingsClose = document.getElementById('chat-settings-close-btn');
      const settingsPopover = document.getElementById('chat-settings-popover');
      const saveWorkerBtn = document.getElementById('btn-save-worker');
      const testWorkerBtn = document.getElementById('btn-test-worker');
      const suggestions = document.querySelectorAll('.btn-suggestion');

      // Toggle Chat Window
      const toggleChat = () => {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
          widget.classList.add('is-open');
          setTimeout(() => input.focus(), 300);
        } else {
          widget.classList.remove('is-open');
          settingsPopover.classList.remove('open');
        }
      };

      triggerBtn.addEventListener('click', toggleChat);
      closeBtn.addEventListener('click', () => {
        this.isOpen = false;
        widget.classList.remove('is-open');
        settingsPopover.classList.remove('open');
      });

      // Settings Popover Toggle
      settingsToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPopover.classList.toggle('open');
        const urlInput = document.getElementById('worker-url-input');
        if (urlInput) urlInput.value = this.workerUrl;
      });

      settingsClose.addEventListener('click', () => {
        settingsPopover.classList.remove('open');
      });

      // Save Worker URL
      saveWorkerBtn.addEventListener('click', () => {
        const val = document.getElementById('worker-url-input').value.trim();
        this.saveWorkerUrl(val);
        settingsPopover.classList.remove('open');
        this.addBotMessage(`✅ Cloudflare Worker URL saved: **${val || 'Default Offline Engine Active'}**`);
      });

      // Test Worker Status
      testWorkerBtn.addEventListener('click', async () => {
        const val = document.getElementById('worker-url-input').value.trim();
        if (!val) {
          alert('Please enter a Worker URL first (e.g. https://al-akseer-ai-proxy.workers.dev).');
          return;
        }
        testWorkerBtn.textContent = 'Testing...';
        try {
          const res = await fetch(val, { method: 'GET' });
          if (res.ok) {
            const data = await res.json();
            alert(`🎉 Success! Connected to Cloudflare Proxy.\nModel: ${data.model || 'Gemini 3'}\nKey Secret Configured: ${data.keyConfigured ? 'Yes' : 'No'}`);
          } else {
            alert(`⚠️ Worker reachable, but returned HTTP ${res.status}.`);
          }
        } catch (e) {
          alert(`❌ Could not connect to Worker: ${e.message}\nEnsure the worker is deployed and URL is correct.`);
        } finally {
          testWorkerBtn.textContent = 'Test Status';
        }
      });

      // Click on Suggestion Chips
      suggestions.forEach(btn => {
        btn.addEventListener('click', () => {
          const msg = btn.getAttribute('data-msg');
          if (msg) {
            input.value = msg;
            this.handleUserSubmit(msg);
          }
        });
      });

      // Form Submit
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        this.handleUserSubmit(text);
      });
    },

    /* ================= 3D TILT EFFECT ON TRIGGER ================= */
    init3DTilt: function () {
      const btn = document.getElementById('chat-trigger-btn');
      if (!btn) return;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = -(y / rect.height) * 35;
        const tiltY = (x / rect.width) * 35;
        btn.style.transform = `translateY(-4px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.08)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    },

    /* ================= SUBMIT MESSAGE ================= */
    handleUserSubmit: async function (userText) {
      const input = document.getElementById('chat-user-input');
      input.value = '';

      // 1. Append User Message
      this.addUserMessage(userText);
      this.history.push({ role: 'user', content: userText });

      // 2. Show 3D Typing indicator
      this.showTyping(true);

      // 3. Request AI Response
      try {
        let reply = "";

        if (this.workerUrl) {
          reply = await this.callCloudflareWorkerProxy(this.history);
        } else {
          // If no worker URL configured yet, simulate brief network latency and respond using local grounded engine
          await new Promise(r => setTimeout(r, 650));
          reply = this.localGroundedAgent(userText);
        }

        this.showTyping(false);
        this.addBotMessage(reply);
        this.history.push({ role: 'assistant', content: reply });

      } catch (err) {
        console.warn('Proxy fetch failed, using fallback engine:', err);
        this.showTyping(false);
        const fallbackReply = this.localGroundedAgent(userText);
        this.addBotMessage(fallbackReply);
        this.history.push({ role: 'assistant', content: fallbackReply });
      }
    },

    /* ================= CALL CLOUDFLARE WORKER ================= */
    callCloudflareWorkerProxy: async function (history) {
      const endpoint = this.workerUrl.replace(/\/+$/, '');
      const response = await fetch(`${endpoint}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-8) // Send recent turns for context
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.reply || "Assalam-o-Alaikum! Please call us at 03353320944 for immediate assistance.";
    },

    /* ================= LOCAL GROUNDED AGENT (STRICT RULES) =================
     * Used when testing locally or before Cloudflare Worker URL is connected.
     * Strictly abides by all 4 agent rules.
     */
    localGroundedAgent: function (query) {
      const q = query.toLowerCase();

      // Rule 4: Refusal on unrelated topics
      const unrelated = /(president|politics|movie|crypto|bitcoin|weather outside|python|coding|javascript|homework|essay|math problem)/i;
      if (unrelated.test(q)) {
        return "I can only assist you with questions regarding **AL AKSEER ABBASI** and our fresh dry fruits. Please ask about our products, rates, or delivery!";
      }

      // Check language: Urdu in Arabic script
      const isUrduScript = /[\u0600-\u06FF]/.test(query);

      // Rates / Prices
      if (q.includes('badam') || q.includes('pista') || q.includes('kaju') || q.includes('price') || q.includes('rate') || q.includes('rates') || q.includes('cost') || q.includes('kitne') || q.includes('bhaav') || q.includes('qemat') || q.includes('قیمت')) {
        if (isUrduScript) {
          return "ال اکسیر عباسی پر بادام، پستہ اور کاجو سب کا ریٹ **999 روپے فی کلو** ہے۔ اور پورے پاکستان میں ڈیلیوری بالکل فری ہے! مزید تفصیل یا آرڈر کے لیے 03353320944 پر رابطہ کریں۔";
        }
        if (q.includes('kia') || q.includes('kya') || q.includes('hai') || q.includes('hein') || q.includes('kitna') || q.includes('batao') || q.includes('chahiye')) {
          return "Assalam-o-Alaikum! **AL AKSEER ABBASI** par Badam, Pista aur Kaju sab ka rate **Rs. 999 per kg** hai. Aur Delivery bilkul FREE hai! Order ke liye aap 03353320944 par WhatsApp ya call kar sakte hain.";
        }
        return "At **AL AKSEER ABBASI**, Badam (Almonds), Pista (Pistachios), and Kaju (Cashews) are **Rs. 999 per kg**. We also provide 100% Free Express Delivery! For orders, call or WhatsApp 03353320944.";
      }

      // Free Delivery / Shipping
      if (q.includes('delivery') || q.includes('deliver') || q.includes('shipping') || q.includes('charges') || q.includes('free') || q.includes('ڈیلیوری')) {
        if (isUrduScript) {
          return "جی ہاں! **ال اکسیر عباسی** تمام آرڈرز پر **100% مفت ایکسپریس ڈیلیوری** فراہم کرتا ہے۔ کوئی اضافی چارجز نہیں ہیں۔";
        }
        if (q.includes('kia') || q.includes('kya') || q.includes('kitne') || q.includes('hai') || q.includes('charges')) {
          return "Ji bilkul! **AL AKSEER ABBASI** par tamam orders par **100% Free Delivery** dastiyab hai. Koi delivery charges nahi hain.";
        }
        return "Yes! **AL AKSEER ABBASI** offers **100% Free Express Delivery** nationwide on all dry fruit orders. No hidden fees.";
      }

      // Address / Location
      if (q.includes('address') || q.includes('location') || q.includes('where') || q.includes('kahan') || q.includes('kidhar') || q.includes('shop') || q.includes('dukan') || q.includes('jacobabad') || q.includes('پتہ')) {
        if (isUrduScript) {
          return "ہماری دکان کا پتہ ہے: **کوئٹہ روڈ، جیکب آباد، سندھ**۔ آپ کسی بھی وقت وزٹ کر سکتے ہیں یا 03353320944 پر رابطہ کر سکتے ہیں۔";
        }
        if (q.includes('kahan') || q.includes('kidhar') || q.includes('hai')) {
          return "Hamari shop ka address hai: **Quetta Road, Jacobabad, Sindh**. Hamari shop par zaroor tashreef layein ya 03353320944 par call karein.";
        }
        return "**AL AKSEER ABBASI** is located at **Quetta Road, Jacobabad, Sindh, Pakistan**. Visit us or call 03353320944.";
      }

      // Timings / Hours
      if (q.includes('timing') || q.includes('timings') || q.includes('time') || q.includes('open') || q.includes('close') || q.includes('hours') || q.includes('waqt') || q.includes('kab') || q.includes('اوقات')) {
        if (isUrduScript) {
          return "ہماری دکان کے اوقات صبح **6:00 بجے سے رات 12:00 بجے** تک ہیں (6.00 to 12.00 روزانہ کھلی رہتی ہے)۔";
        }
        if (q.includes('kab') || q.includes('hai') || q.includes('baje')) {
          return "Hamari shop subah **6:00 AM se raat 12:00 AM** tak khuli rehti hai (Daily 6.00 to 12.00).";
        }
        return "Our shop timings are **6:00 AM to 12:00 AM** daily (6.00 to 12.00).";
      }

      // Phone / Contact / WhatsApp
      if (q.includes('phone') || q.includes('contact') || q.includes('number') || q.includes('whatsapp') || q.includes('call') || q.includes('rabta') || q.includes('نمبر')) {
        return "You can call or WhatsApp **AL AKSEER ABBASI** directly at **03353320944** (+92 335 3320944). Address: Quetta Road, Jacobabad.";
      }

      // Greetings
      if (q.includes('salam') || q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('assalam')) {
        if (isUrduScript) {
          return "وعلیکم السلام! **ال اکسیر عباسی** میں خوش آمدید۔ آپ بادام، پستہ، کاجو کے ریٹس (999 روپے فی کلو) یا فری ڈیلیوری کے بارے میں پوچھ سکتے ہیں۔";
        }
        if (q.includes('salam') || q.includes('assalam')) {
          return "Walaikum Assalam! **AL AKSEER ABBASI** mein khush-aamdeed. Badam, Pista aur Kaju Rs. 999/kg hain aur Delivery bilkul FREE hai. Main aap ki kya madad kar sakta hoon?";
        }
        return "Assalam-o-Alaikum and welcome to **AL AKSEER ABBASI**! We offer premium dry fruits (Badam, Pista, Kaju at Rs. 999/kg) with 100% Free Delivery. How can I help you today?";
      }

      // Rule 3: Unknown question -> Give contact details, never invent facts
      if (isUrduScript) {
        return "معذرت، میرے پاس اس کی معلومات نہیں ہیں۔ براہ کرم ہمارے فون یا واٹس ایپ نمبر **03353320944** پر رابطہ کریں، یا کوئٹہ روڈ جیکب آباد تشریف لائیں۔";
      }
      if (q.includes('hai') || q.includes('kya') || q.includes('batao')) {
        return "Maazrat, yeh malomat mere pass dastiyab nahi hain. Baraye meherbani hamare phone/WhatsApp **03353320944** par rabta karein (Address: Quetta Road, Jacobabad).";
      }
      return "I do not have that specific information in my records. Please contact **AL AKSEER ABBASI** directly at **03353320944** or visit us at Quetta Road, Jacobabad.";
    },

    /* ================= MESSAGE RENDERING HELPERS ================= */
    addUserMessage: function (text) {
      const list = document.getElementById('chat-messages-list');
      const row = document.createElement('div');
      row.className = 'chat-message-row user-row';

      const time = this.getCurrentTime();
      row.innerHTML = `
        <div class="chat-bubble">
          ${this.escapeHtml(text)}
          <span class="chat-time">${time}</span>
        </div>
      `;

      list.appendChild(row);
      this.scrollToBottom();
    },

    addBotMessage: function (markdownText) {
      const list = document.getElementById('chat-messages-list');
      const row = document.createElement('div');
      row.className = 'chat-message-row bot-row';

      const isRtl = /[\u0600-\u06FF]/.test(markdownText);
      const formatted = this.formatMarkdown(markdownText);
      const time = this.getCurrentTime();

      row.innerHTML = `
        <div class="chat-bubble ${isRtl ? 'is-rtl' : ''}">
          ${formatted}
          <span class="chat-time">${time}</span>
        </div>
      `;

      list.appendChild(row);
      this.scrollToBottom();
    },

    showTyping: function (show) {
      const el = document.getElementById('chat-typing-indicator');
      if (el) {
        el.style.display = show ? 'flex' : 'none';
        if (show) this.scrollToBottom();
      }
    },

    scrollToBottom: function () {
      const list = document.getElementById('chat-messages-list');
      if (list) {
        setTimeout(() => {
          list.scrollTop = list.scrollHeight;
        }, 50);
      }
    },

    getCurrentTime: function () {
      const d = new Date();
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    escapeHtml: function (str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    formatMarkdown: function (text) {
      if (!text) return '';
      let safe = this.escapeHtml(text);

      // Bold: **text**
      safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Phone numbers clickable: 03353320944
      safe = safe.replace(/(03353320944)/g, '<a href="tel:$1" style="color: #ffd700; font-weight: bold; text-decoration: underline;">$1</a>');

      // Line breaks
      safe = safe.replace(/\n/g, '<br>');

      return safe;
    }
  };

  // Expose to window for external integration or manual control
  window.AlAkseerChatbot = ChatbotApp;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ChatbotApp.init());
  } else {
    ChatbotApp.init();
  }
})();
