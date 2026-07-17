import React, { useState, useRef, useEffect } from 'react';

const INTENTS = [
  {
    intent: 'greeting',
    questions: ['Hi', 'Hello', 'Hey there', 'Good morning', 'Is anyone available to help?'],
    answer: 'Hello! Welcome to StyleAI. I can help you understand how to use our AI hairstyle assistant. What would you like to know?'
  },
  {
    intent: 'goodbye',
    questions: ['Bye', "Thanks, that's all", 'See you later', 'Thank you, goodbye'],
    answer: 'Thank you for visiting StyleAI! Have a great day and enjoy your new hairstyles.'
  },
  {
    intent: 'how_it_works',
    questions: ['How does this work?', 'How do I use the app?', 'What do I do?', 'How can I try on hairstyles?', 'How to find my face shape'],
    answer: 'It\'s easy! Just go to the "Try AI Stylist" page, upload a clear photo of your face, and our AI will analyze your face shape and suggest the best hairstyles for you.'
  },
  {
    intent: 'photo_requirements',
    questions: ['What kind of photo should I upload?', 'Photo requirements', 'Does the photo need to be clear?', 'Why is my photo failing?'],
    answer: 'For best results, upload a clear, front-facing photo with good lighting. Make sure your hair is pulled back or away from your face so the AI can accurately detect your face shape.'
  },
  {
    intent: 'cost',
    questions: ['Is this free?', 'How much does it cost?', 'Do I have to pay?', 'Pricing'],
    answer: 'We offer a free trial so you can test our AI! After that, you can check our Pricing page for premium features and unlimited hairstyle generation.'
  },
  {
    intent: 'privacy',
    questions: ['Is my photo safe?', 'What happens to my picture?', 'Do you save my photos?', 'Privacy policy'],
    answer: 'Your privacy is our priority. Photos uploaded for AI analysis are processed securely and are not stored permanently unless you choose to save them to your gallery.'
  },
  {
    intent: 'accuracy',
    questions: ['How accurate is the AI?', 'Does it really work?', 'Will the haircut look good on me?'],
    answer: 'Our AI uses advanced computer vision to accurately detect face shapes (oval, square, round, etc.) and recommends styles based on expert cosmetology guidelines. However, it\'s always a good idea to consult your real stylist before a big change!'
  },
  {
    intent: 'contact',
    questions: ['I need human help', 'Contact support', 'How do I reach you?', 'Email support'],
    answer: 'You can reach out to our team by visiting the Contact page, or email us directly at support@styleai.com.'
  },
  {
    intent: 'thanks',
    questions: ['Thank you', 'Thanks for the help', 'That was helpful, thanks', 'Appreciate it'],
    answer: "You're very welcome! Is there anything else I can help you with?"
  },
  {
    intent: 'unknown',
    questions: [],
    answer: "I'm sorry, I didn't quite understand that. Could you try rephrasing? You can ask me how the app works, photo requirements, or pricing."
  }
];

const SUGGESTED_QUESTIONS = [
  '👋 Hi there!',
  '🤔 How does this work?',
  '📸 What kind of photo should I upload?',
  '💰 Is this free?',
  '🔒 Are my photos safe?',
];

/* ── Simple keyword-matching engine ── */
function findBestAnswer(userMessage) {
  const input = userMessage.toLowerCase().trim();

  let bestScore = 0;
  let bestAnswer = INTENTS.find(i => i.intent === 'unknown').answer;

  for (const intent of INTENTS) {
    if (intent.intent === 'unknown') continue;

    for (const question of intent.questions) {
      const q = question.toLowerCase();

      // Exact match
      if (input === q) return intent.answer;

      // Word-overlap score
      const qWords = q.split(/\s+/);
      const inputWords = input.split(/\s+/);
      let matches = 0;
      for (const w of inputWords) {
        if (w.length < 2) continue;
        if (qWords.some(qw => qw.includes(w) || w.includes(qw))) {
          matches++;
        }
      }
      const score = matches / Math.max(inputWords.length, 1);
      if (score > bestScore && score >= 0.4) {
        bestScore = score;
        bestAnswer = intent.answer;
      }
    }
  }

  return bestAnswer;
}

/* ── Component ── */
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! 👋 Welcome to StyleAI support. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;

    const userMsg = { from: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = findBestAnswer(trimmed);
      setMessages(prev => [...prev, { from: 'bot', text: reply }]);
      setIsTyping(false);
    }, 600 + Math.random() * 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (q) => {
    const clean = q.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}]\s*/u, '').trim();
    sendMessage(clean);
  };

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <button
        id="chatbot-toggle"
        className="cb-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="cb-window">
          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <div className="cb-header-name">StyleAI Support</div>
                <div className="cb-header-status">
                  <span className="cb-status-dot"></span>
                  Online
                </div>
              </div>
            </div>
            <button className="cb-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="cb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cb-msg cb-msg-${msg.from}`}>
                <div className={`cb-bubble cb-bubble-${msg.from}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="cb-msg cb-msg-bot">
                <div className="cb-bubble cb-bubble-bot cb-typing">
                  <span className="cb-dot"></span>
                  <span className="cb-dot"></span>
                  <span className="cb-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="cb-suggestions">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i} className="cb-suggestion-btn" onClick={() => handleSuggestion(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="cb-input-area">
            <input
              ref={inputRef}
              type="text"
              className="cb-input"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="cb-send" onClick={() => sendMessage()} disabled={!input.trim()} aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* ── Toggle Button ── */
        .cb-toggle {
          position: fixed;
          bottom: 28px;
          left: 28px;
          z-index: 9999;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.45);
          transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s ease;
        }
        .cb-toggle:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.55);
        }
        .cb-toggle:active {
          transform: scale(0.95);
        }

        /* ── Chat Window ── */
        .cb-window {
          position: fixed;
          bottom: 100px;
          left: 28px;
          z-index: 9998;
          width: 370px;
          max-height: 520px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: cbSlideUp 0.3s cubic-bezier(.4,0,.2,1);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        @keyframes cbSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .cb-header {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .cb-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cb-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .cb-header-name {
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.2px;
        }
        .cb-header-status {
          font-size: 12px;
          color: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 1px;
        }
        .cb-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(52,211,153,0.3);
        }
        .cb-close {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .cb-close:hover {
          background: rgba(255,255,255,0.3);
        }

        /* ── Messages ── */
        .cb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 18px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 200px;
          max-height: 280px;
          background: #f9fafb;
        }
        .cb-messages::-webkit-scrollbar { width: 5px; }
        .cb-messages::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .cb-msg {
          display: flex;
        }
        .cb-msg-bot { justify-content: flex-start; }
        .cb-msg-user { justify-content: flex-end; }

        .cb-bubble {
          max-width: 82%;
          padding: 10px 15px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
        }
        .cb-bubble-bot {
          background: #ffffff;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .cb-bubble-user {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          border-bottom-right-radius: 4px;
        }

        /* ── Typing indicator ── */
        .cb-typing {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 12px 18px;
        }
        .cb-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9ca3af;
          animation: cbBounce 1.2s ease-in-out infinite;
        }
        .cb-dot:nth-child(2) { animation-delay: 0.15s; }
        .cb-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes cbBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        /* ── Suggestions ── */
        .cb-suggestions {
          padding: 6px 14px 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }
        .cb-suggestion-btn {
          padding: 6px 13px;
          font-size: 12px;
          font-weight: 500;
          color: #6366f1;
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          border-radius: 20px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.18s ease;
          font-family: inherit;
        }
        .cb-suggestion-btn:hover {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }

        /* ── Input Area ── */
        .cb-input-area {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
          flex-shrink: 0;
        }
        .cb-input {
          flex: 1;
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 13.5px;
          color: #111827;
          outline: none;
          background: #f9fafb;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cb-input::placeholder { color: #9ca3af; }
        .cb-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
          background: #fff;
        }
        .cb-send {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.15s, opacity 0.15s;
        }
        .cb-send:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .cb-send:not(:disabled):hover {
          transform: scale(1.06);
        }
        .cb-send:not(:disabled):active {
          transform: scale(0.94);
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .cb-window {
            left: 10px;
            right: 10px;
            bottom: 94px;
            width: auto;
            max-height: 70vh;
          }
          .cb-toggle {
            bottom: 18px;
            left: 18px;
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
