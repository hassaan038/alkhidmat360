import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { sendChatbotMessage } from '../../services/chatbotService';

const STORAGE_KEY = 'alkhidmat_chatbot_history_v1';
const MAX_PERSIST_TURNS = 30;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_PERSIST_TURNS);
  } catch {
    return [];
  }
}

function persistHistory(history) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(-MAX_PERSIST_TURNS))
    );
  } catch {
    // ignore quota / privacy mode
  }
}

export default function ChatbotWidget() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState(loadHistory);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const isUrdu = i18n.language === 'ur';
  const sideClass = isUrdu ? 'left-4 sm:left-6' : 'right-4 sm:right-6';

  const role = user?.userType || 'GUEST';
  const language = isUrdu ? 'ur' : 'en';

  // Greet if there is no history yet — purely a UI message; we don't send it
  // to the backend so it doesn't pollute the conversation context.
  const greeting = useMemo(() => {
    const name = user?.fullName?.split(' ')[0];
    if (isUrdu) {
      return name
        ? `السلام علیکم ${name}! میں Khidmat Helper ہوں۔ Alkhidmat 360 کے بارے میں آپ کا کوئی سوال؟`
        : 'السلام علیکم! میں Khidmat Helper ہوں۔ Alkhidmat 360 کے بارے میں آپ کا کوئی سوال؟';
    }
    return name
      ? `Assalamu alaikum ${name}! I'm Khidmat Helper. Ask me anything about Alkhidmat 360.`
      : "Assalamu alaikum! I'm Khidmat Helper. Ask me anything about Alkhidmat 360.";
  }, [isUrdu, user?.fullName]);

  // Persist user/assistant turns whenever they change.
  useEffect(() => {
    persistHistory(messages);
  }, [messages]);

  // Auto-scroll to latest.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [messages, open, sending]);

  // Focus input on open.
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Esc to close.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const nextHistory = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setSending(true);

    try {
      const { reply } = await sendChatbotMessage({
        message: trimmed,
        history: messages, // prior turns only — server appends current
        role,
        language,
        currentScreen: location.pathname,
      });
      setMessages([...nextHistory, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg =
        err?.message ||
        (isUrdu
          ? 'معذرت، جواب حاصل نہیں ہو سکا۔ دوبارہ کوشش کریں۔'
          : 'Sorry, I could not get a reply. Please try again.');
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating action button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('chatbot.open')}
          className={cn(
            'fixed bottom-4 sm:bottom-6 z-[60] flex items-center justify-center',
            'h-14 w-14 rounded-full shadow-large transition-all',
            'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105',
            'ring-4 ring-primary-600/20 dark:ring-primary-500/20',
            'focus:outline-none focus:ring-4 focus:ring-primary-400/50',
            sideClass
          )}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t('chatbot.title')}
          dir={isUrdu ? 'rtl' : 'ltr'}
          className={cn(
            'fixed bottom-4 sm:bottom-6 z-[60] flex flex-col',
            'w-[calc(100vw-2rem)] sm:w-[380px] max-w-[420px]',
            'h-[min(75vh,560px)]',
            'rounded-2xl shadow-large border overflow-hidden',
            'bg-white dark:bg-gray-900',
            'border-gray-200 dark:border-gray-800',
            'animate-fade-in',
            sideClass
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">
                  {t('chatbot.title')}
                </p>
                <p className="text-[11px] text-primary-100 leading-tight truncate">
                  {t('chatbot.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="text-[11px] px-2 py-1 rounded-md hover:bg-white/15 transition-colors"
                  title={t('chatbot.clear')}
                >
                  {t('chatbot.clear')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('chatbot.close')}
                className="p-1.5 rounded-md hover:bg-white/15 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50 dark:bg-gray-900/60"
          >
            {/* Greeting (always shown — not part of history) */}
            <BotMessage text={greeting} />

            {messages.map((m, i) =>
              m.role === 'user' ? (
                <UserMessage key={i} text={m.content} />
              ) : (
                <BotMessage key={i} text={m.content} />
              )
            )}

            {sending && (
              <div className="flex items-center gap-2 px-3 py-2 w-fit rounded-2xl bg-white dark:bg-gray-800 shadow-soft">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600 dark:text-primary-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('chatbot.thinking')}
                </span>
              </div>
            )}

            {error && (
              <div className="px-3 py-2 rounded-lg bg-error-light/60 text-error-dark dark:bg-error/20 dark:text-error-light text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Input bar */}
          <form
            onSubmit={onSubmit}
            className="flex items-end gap-2 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              rows={1}
              placeholder={t('chatbot.inputPlaceholder')}
              disabled={sending}
              className="flex-1 resize-none max-h-32 min-h-[40px] px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label={t('chatbot.send')}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function BotMessage({ text }) {
  return (
    <div className="flex items-start gap-2">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
        <Bot className="h-4 w-4" />
      </span>
      <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 shadow-soft whitespace-pre-wrap break-words">
        {renderMarkdownLite(text)}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex items-start gap-2 justify-end">
      <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-tr-sm bg-primary-600 text-white text-sm shadow-soft whitespace-pre-wrap break-words">
        {text}
      </div>
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        <User className="h-4 w-4" />
      </span>
    </div>
  );
}

/**
 * Tiny markdown helper — supports **bold**, *italic*, line breaks. Avoids a
 * full markdown lib dependency for ~3kb savings. Anything fancier the LLM
 * outputs (lists, headings) renders as plain text which is fine for a chat.
 */
function renderMarkdownLite(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <span key={i}>
      {renderInline(line)}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

function renderInline(line) {
  // Match **bold** then *italic*. Greedy enough for chat replies.
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIdx) {
      parts.push(line.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIdx = match.index + token.length;
  }
  if (lastIdx < line.length) parts.push(line.slice(lastIdx));
  return parts;
}
