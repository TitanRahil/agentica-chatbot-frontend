(function () {
    // 0. Prevent Multiple Injections
    if (document.getElementById('ai-chatbot-root')) {
        return;
    }

    // 1. Configuration & Initialization
    const defaultConfig = {
        apiUrl: "https://fastapi-chatbot-754369800088.europe-west1.run.app/chat", // Default local backend
        botName: "Agentica Assistant",
        themeColor: "#2563EB",
        welcomeMessage: "Hello! I am Agentica Virtual Assistant. How can I help you today?",
    };

    const config = { ...defaultConfig, ...(window.ChatWidgetConfig || {}) };

    // 2. Build Styles (Scoped CSS)
    const styles = `
        .chatbot-container {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
        }

        /* Toggle Button (Bubble) */
        .chat-toggle-btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: ${config.themeColor};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s, background-color 0.2s;
            color: white;
            border: none;
            outline: none;
        }

        .chat-toggle-btn:hover {
            transform: scale(1.05);
            filter: brightness(1.1);
        }

        .chat-toggle-icon {
            width: 30px;
            height: 30px;
            fill: currentColor;
            transition: opacity 0.2s;
        }

        /* Chat Window */
        .chat-window {
            width: 380px;
            height: 600px;
            max-height: 80vh;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            pointer-events: none;
            transition: opacity 0.3s, transform 0.3s;
            position: absolute;
            bottom: 80px;
            right: 0;
            border: 1px solid #e5e7eb;
        }

        .chat-window.open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        /* Header */
        .chat-header {
            background-color: ${config.themeColor};
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-title {
            font-weight: 600;
            font-size: 1.1rem;
            margin: 0;
        }

        .chat-close-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0.8;
            padding: 0;
        }

        .chat-close-btn:hover {
            opacity: 1;
        }

        /* Messages Area */
        .chat-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background-color: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .message {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 0.95rem;
            line-height: 1.5;
            word-wrap: break-word;
            animation: fadeIn 0.3s ease;
        }

        .message.bot {
            align-self: flex-start;
            background-color: white;
            border: 1px solid #e5e7eb;
            color: #1f2937;
            border-bottom-left-radius: 2px;
        }

        .message.user {
            align-self: flex-end;
            background-color: ${config.themeColor};
            color: white;
            border-bottom-right-radius: 2px;
        }

        .message.error {
            align-self: center;
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
            font-size: 0.85rem;
        }

        .message.system-info {
            align-self: center;
            background-color: #eff6ff;
            color: #1d4ed8;
            border: 1px solid #bfdbfe;
            font-size: 0.82rem;
            text-align: center;
            border-radius: 8px;
            max-width: 90%;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Input Area */
        .chat-input-area {
            padding: 12px;
            border-top: 1px solid #e5e7eb;
            background-color: white;
            display: flex;
            gap: 8px;
            flex-direction: column;
        }

        /* Lead flow step indicator */
        .lead-step-bar {
            display: none;
            gap: 6px;
            align-items: center;
            padding: 0 2px 6px 2px;
        }

        .lead-step-bar.visible {
            display: flex;
        }

        .lead-step-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #d1d5db;
            transition: background-color 0.3s;
            flex-shrink: 0;
        }

        .lead-step-dot.active {
            background-color: ${config.themeColor};
        }

        .lead-step-dot.done {
            background-color: #34d399;
        }

        .lead-step-label {
            font-size: 0.75rem;
            color: #6b7280;
            margin-left: 4px;
        }

        .chat-input-row {
            display: flex;
            gap: 8px;
        }

        .chat-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            outline: none;
            font-size: 0.95rem;
            transition: border-color 0.2s;
        }

        .chat-input:focus {
            border-color: ${config.themeColor};
        }

        .chat-input.lead-mode {
            border-color: ${config.themeColor};
            background-color: #eff6ff;
        }

        .chat-send-btn {
            background: none;
            border: none;
            color: ${config.themeColor};
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .chat-send-btn:hover {
            background-color: #f3f4f6;
        }

        .chat-send-btn:disabled {
            color: #9ca3af;
            cursor: not-allowed;
        }

        /* Typing Indicator */
        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 4px 8px;
            align-self: flex-start;
            background-color: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            margin-bottom: 8px;
            width: fit-content;
        }

        .typing-dot {
            width: 6px;
            height: 6px;
            background-color: #9ca3af;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
            .chat-window {
                width: calc(100vw - 40px);
                height: calc(100vh - 100px);
                bottom: 80px;
                right: 0;
            }
        }
    `;

    // 3. Icons (SVG Strings)
    const icons = {
        chat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
        close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
        send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`
    };

    // 4. Create Elements & Shadow DOM
    const root = document.createElement('div');
    root.id = 'ai-chatbot-root';
    document.body.appendChild(root);

    // Create Shadow DOM for isolation
    const shadow = root.attachShadow({ mode: 'open' });

    // Inject Styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    shadow.appendChild(styleSheet);

    // Create Container
    const container = document.createElement('div');
    container.className = 'chatbot-container';

    container.innerHTML = `
        <div class="chat-window">
            <div class="chat-header">
                <h3 class="chat-title">${config.botName}</h3>
                <button class="chat-close-btn">${icons.close}</button>
            </div>
            <div class="chat-messages">
                <div class="message bot">${config.welcomeMessage}</div>
            </div>
            <div class="chat-input-area">
                <div class="lead-step-bar" id="lead-step-bar">
                    <div class="lead-step-dot" id="dot-0"></div>
                    <div class="lead-step-dot" id="dot-1"></div>
                    <div class="lead-step-dot" id="dot-2"></div>
                    <div class="lead-step-dot" id="dot-3"></div>
                    <span class="lead-step-label" id="lead-step-label"></span>
                </div>
                <div class="chat-input-row">
                    <input type="text" class="chat-input" id="chat-input" placeholder="Type a message...">
                    <button class="chat-send-btn" id="chat-send-btn" disabled>${icons.send}</button>
                </div>
            </div>
        </div>
        <button class="chat-toggle-btn">
            <div class="chat-toggle-icon">${icons.chat}</div>
        </button>
    `;

    shadow.appendChild(container);

    // 5. Logic & State
    const elements = {
        window: shadow.querySelector('.chat-window'),
        toggleBtn: shadow.querySelector('.chat-toggle-btn'),
        closeBtn: shadow.querySelector('.chat-close-btn'),
        messages: shadow.querySelector('.chat-messages'),
        input: shadow.querySelector('#chat-input'),
        sendBtn: shadow.querySelector('#chat-send-btn'),
        stepBar: shadow.querySelector('#lead-step-bar'),
        stepLabel: shadow.querySelector('#lead-step-label'),
        dots: [0, 1, 2, 3].map(i => shadow.querySelector(`#dot-${i}`))
    };

    let isOpen = false;
    let isTyping = false;

    // ── Lead Flow State Machine ──────────────────────────────────────────────
    const LEAD_STEPS = [
        {
            field: 'name',
            prompt: "Great! Before I connect you with our team, could I get your name?",
            placeholder: "Enter your full name...",
            label: "Name",
            validate: (v) => v.trim().length >= 2 ? null : "Please enter your full name (at least 2 characters)."
        },
        {
            field: 'email',
            prompt: "Thanks! What's your email address?",
            placeholder: "Enter your email...",
            label: "Email",
            validate: (v) => v.includes('@') && v.includes('.') ? null : "That doesn't look like a valid email. Please include @ and a domain (e.g. you@email.com)."
        },
        {
            field: 'phone',
            prompt: "Got it! What's the best phone number to reach you on?",
            placeholder: "Enter your phone number...",
            label: "Phone",
            validate: (v) => {
                const digits = v.replace(/[\s\-\+\(\)]/g, '');
                return /^\d{7,15}$/.test(digits) ? null : "Please enter a valid phone number (digits only, 7-15 chars).";
            }
        },
        {
            field: 'requirement',
            prompt: "Almost there! Briefly describe what you're looking to achieve or which product interests you.",
            placeholder: "Describe your requirement...",
            label: "Requirement",
            validate: (v) => v.trim().length >= 3 ? null : "Please describe your requirement (at least 3 characters)."
        }
    ];

    const leadFlow = {
        active: false,
        step: 0,
        data: { name: '', email: '', phone: '', requirement: '' }
    };

    function startLeadFlow() {
        leadFlow.active = true;
        leadFlow.step = 0;
        leadFlow.data = { name: '', email: '', phone: '', requirement: '' };
        updateStepBar();
        showLeadPrompt(0);
    }

    function updateStepBar() {
        if (!leadFlow.active) {
            elements.stepBar.classList.remove('visible');
            elements.input.classList.remove('lead-mode');
            return;
        }
        elements.stepBar.classList.add('visible');
        elements.input.classList.add('lead-mode');

        elements.dots.forEach((dot, i) => {
            dot.classList.remove('active', 'done');
            if (i < leadFlow.step) dot.classList.add('done');
            else if (i === leadFlow.step) dot.classList.add('active');
        });

        const step = LEAD_STEPS[leadFlow.step];
        elements.stepLabel.textContent = `Step ${leadFlow.step + 1}/4 — ${step.label}`;
        elements.input.placeholder = step.placeholder;
        elements.input.type = leadFlow.step === 2 ? 'tel' : (leadFlow.step === 1 ? 'email' : 'text');
    }

    function showLeadPrompt(stepIndex) {
        const step = LEAD_STEPS[stepIndex];
        // Small delay so it feels like the bot is "typing"
        showTyping();
        setTimeout(() => {
            removeTyping();
            appendMessage(step.prompt, 'bot');
            elements.input.value = '';
            elements.sendBtn.disabled = true;
            elements.input.focus();
        }, 700);
    }

    function handleLeadInput(value) {
        const step = LEAD_STEPS[leadFlow.step];
        const error = step.validate(value);

        appendMessage(value, 'user');
        elements.input.value = '';
        elements.sendBtn.disabled = true;

        if (error) {
            showTyping();
            setTimeout(() => {
                removeTyping();
                appendMessage(error, 'error');
                setTimeout(() => {
                    showTyping();
                    setTimeout(() => {
                        removeTyping();
                        appendMessage(step.prompt, 'bot');
                        elements.input.focus();
                    }, 600);
                }, 400);
            }, 600);
            return;
        }

        // Save the valid value
        leadFlow.data[step.field] = value.trim();
        leadFlow.step++;

        if (leadFlow.step < LEAD_STEPS.length) {
            updateStepBar();
            showLeadPrompt(leadFlow.step);
        } else {
            // All steps complete — submit the lead
            completeLead();
        }
    }

    async function completeLead() {
        leadFlow.active = false;
        updateStepBar();
        elements.input.placeholder = "Type a message...";
        elements.input.type = "text";

        showTyping();
        setTimeout(async () => {
            removeTyping();
            appendMessage(
                "Thank you! Your details have been received. Our team will reach out to you shortly.",
                'bot'
            );

            // Submit lead to backend
            try {
                const leadUrl = config.apiUrl.replace('/chat', '/lead');
                await fetchWithRetry(leadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: leadFlow.data.name,
                        email: leadFlow.data.email,
                        phone: leadFlow.data.phone,
                        requirement: leadFlow.data.requirement,
                        page_url: window.location.href
                    })
                });
            } catch (e) {
                console.error('Failed to submit lead:', e);
            }
        }, 800);
    }
    // ─────────────────────────────────────────────────────────────────────────

    // 6. Session Management
    function getSessionId() {
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chat_session_id', sid);
        }
        return sid;
    }

    const sessionId = getSessionId();

    // 7. Event Handlers
    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            elements.window.classList.add('open');
            elements.toggleBtn.innerHTML = `<div class="chat-toggle-icon">${icons.close}</div>`;
            setTimeout(() => elements.input.focus(), 100);
        } else {
            elements.window.classList.remove('open');
            elements.toggleBtn.innerHTML = `<div class="chat-toggle-icon">${icons.chat}</div>`;
        }
    }

    elements.toggleBtn.addEventListener('click', toggleChat);
    elements.closeBtn.addEventListener('click', toggleChat);

    elements.input.addEventListener('input', (e) => {
        elements.sendBtn.disabled = !e.target.value.trim();
    });

    elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !elements.sendBtn.disabled) {
            e.preventDefault();
            handleSubmit();
        }
    });

    elements.sendBtn.addEventListener('click', handleSubmit);

    // Unified submit handler — routes to lead flow or AI chat
    function handleSubmit() {
        const text = elements.input.value.trim();
        if (!text || isTyping) return;

        if (leadFlow.active) {
            handleLeadInput(text);
        } else {
            sendMessage(text);
        }
    }

    // 8. Messaging Logic
    function appendMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.style.whiteSpace = 'pre-wrap';
        msgDiv.style.fontFamily = 'inherit';
        msgDiv.textContent = text;
        elements.messages.appendChild(msgDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        elements.messages.scrollTop = elements.messages.scrollHeight;
    }

    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        elements.messages.appendChild(typingDiv);
        scrollToBottom();
        isTyping = true;
    }

    function removeTyping() {
        const typingDiv = shadow.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
        isTyping = false;
    }

    async function fetchWithRetry(url, options = {}, retries = 1, timeout = 15000) {
        const tryFetch = async (attempt) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);

            try {
                const fetchOptions = { ...options, signal: controller.signal };
                const response = await fetch(url, fetchOptions);
                clearTimeout(id);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response;
            } catch (error) {
                clearTimeout(id);
                if (attempt < retries) {
                    console.log(`Retrying... (${attempt + 1}/${retries})`);
                    return tryFetch(attempt + 1);
                }
                throw error;
            }
        };
        return tryFetch(0);
    }

    async function sendMessage(text) {
        if (!text || isTyping) return;

        // User message
        appendMessage(text, 'user');
        elements.input.value = '';
        elements.sendBtn.disabled = true;

        showTyping();

        try {
            // Ensure HTTPS for production if not localhost
            let targetUrl = config.apiUrl;
            if (!targetUrl.includes('localhost') && !targetUrl.includes('127.0.0.1') && targetUrl.startsWith('http://')) {
                console.warn('Auto-upgrading API URL to HTTPS for production safety');
                targetUrl = targetUrl.replace('http://', 'https://');
            }

            const response = await fetchWithRetry(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.detail || `HTTP error! status: ${response.status}`;
                throw new Error(message);
            }

            const data = await response.json();
            removeTyping();

            // Clean up any residual markdown that might slip through
            const cleanReply = data.reply.replace(/\*\*/g, '').replace(/^\s*[\-\*]\s+/gm, '');
            appendMessage(cleanReply, 'bot');

            // If backend detected buying intent, start the hardcoded lead flow
            if (data.intent_detected) {
                // Small pause before the flow starts so it feels natural
                setTimeout(() => {
                    startLeadFlow();
                }, 500);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            removeTyping();

            let errorMessage = 'Failed to send message. Please try again.';
            if (error.message.includes('overloaded') || error.message.includes('429')) {
                errorMessage = 'The AI is currently busy. Please wait a moment and try again.';
            }
            appendMessage(errorMessage, 'error');
        }
    }

})();
