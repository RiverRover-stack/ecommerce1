/**
 * Aria Chat Widget
 * Front-end implementation of the Aria customer service agent for ShoeStore.
 * Aria's character and personality are defined in backend/aria-persona.js.
 */

(function () {
    const ARIA_GREETING =
        "Hi there! 👋 I'm Aria, your ShoeStore assistant. How can I help you find your perfect pair today?";
    const API_URL = '/api/chat';

    // ── Build the widget DOM ────────────────────────────────────────────────
    function createWidget() {
        // Floating toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'aria-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-comments"></i>';
        toggleBtn.title = 'Chat with Aria';
        toggleBtn.setAttribute('aria-label', 'Open Aria chat');
        toggleBtn.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; z-index: 9999;
            width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
            background: #22c55e; color: #fff; font-size: 22px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25); transition: background 0.2s;
        `;

        // Chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'aria-chat-window';
        chatWindow.setAttribute('aria-live', 'polite');
        chatWindow.style.cssText = `
            display: none; position: fixed; bottom: 92px; right: 24px; z-index: 9999;
            width: 340px; max-height: 480px; border-radius: 16px; overflow: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.18); font-family: 'Poppins', sans-serif;
            flex-direction: column; background: #f9fafb;
        `;

        chatWindow.innerHTML = `
            <div id="aria-header" style="background:#22c55e;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-robot" style="color:#22c55e;font-size:18px;"></i>
                    </div>
                    <div>
                        <div style="font-weight:600;font-size:15px;">Aria</div>
                        <div style="font-size:11px;opacity:0.9;">ShoeStore Assistant</div>
                    </div>
                </div>
                <button id="aria-close" aria-label="Close chat"
                    style="background:none;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1;">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div id="aria-messages" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;max-height:300px;"></div>

            <div id="aria-input-area" style="padding:10px 12px;background:#fff;border-top:1px solid #e5e7eb;display:flex;gap:8px;">
                <input id="aria-input" type="text" placeholder="Type a message…"
                    aria-label="Type your message to Aria"
                    style="flex:1;border:1px solid #d1d5db;border-radius:20px;padding:8px 14px;font-size:13px;outline:none;font-family:inherit;" />
                <button id="aria-send" aria-label="Send message"
                    style="background:#22c55e;color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toggleBtn);
        document.body.appendChild(chatWindow);
        return { toggleBtn, chatWindow };
    }

    // ── Message helpers ─────────────────────────────────────────────────────
    function appendMessage(container, text, sender) {
        const bubble = document.createElement('div');
        const isAria = sender === 'aria';
        bubble.style.cssText = `
            max-width: 80%; padding: 9px 13px; border-radius: 16px; font-size: 13px; line-height: 1.5;
            ${isAria
                ? 'background:#e9fbe9;color:#1a1a1a;align-self:flex-start;border-bottom-left-radius:4px;'
                : 'background:#22c55e;color:#fff;align-self:flex-end;border-bottom-right-radius:4px;'
            }
        `;
        bubble.textContent = text;
        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }

    function showTypingIndicator(container) {
        const indicator = document.createElement('div');
        indicator.id = 'aria-typing';
        indicator.style.cssText = `
            align-self:flex-start;background:#e9fbe9;padding:9px 13px;border-radius:16px;
            border-bottom-left-radius:4px;font-size:13px;color:#6b7280;
        `;
        indicator.textContent = 'Aria is typing…';
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
        return indicator;
    }

    // ── Send message ────────────────────────────────────────────────────────
    async function sendMessage(input, messages) {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        appendMessage(messages, text, 'user');

        const typingIndicator = showTypingIndicator(messages);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            typingIndicator.remove();

            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            appendMessage(messages, data.message, 'aria');
        } catch {
            typingIndicator.remove();
            appendMessage(messages, "Sorry, I'm having trouble connecting right now. Please try again shortly.", 'aria');
        }
    }

    // ── Initialise ──────────────────────────────────────────────────────────
    function init() {
        const { toggleBtn, chatWindow } = createWidget();
        const messages = chatWindow.querySelector('#aria-messages');
        const input = chatWindow.querySelector('#aria-input');
        const sendBtn = chatWindow.querySelector('#aria-send');
        const closeBtn = chatWindow.querySelector('#aria-close');

        let opened = false;

        toggleBtn.addEventListener('click', () => {
            const isOpen = chatWindow.style.display === 'flex';
            chatWindow.style.display = isOpen ? 'none' : 'flex';

            if (!isOpen && !opened) {
                opened = true;
                appendMessage(messages, ARIA_GREETING, 'aria');
                setTimeout(() => input.focus(), 100);
            }
        });

        closeBtn.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });

        sendBtn.addEventListener('click', () => sendMessage(input, messages));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage(input, messages);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
