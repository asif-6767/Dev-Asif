import React, { useEffect, useRef, useState } from 'react';
import { Bot, Minus, Send, Sparkles, X } from 'lucide-react';
import type { SiteData } from '../types/site';
import { generateBuiltinReply } from '../utils/aiAssistant';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
}

interface AiAssistantWidgetProps {
  siteData: SiteData;
}

function nowStamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({ siteData }) => {
  const { ai } = siteData;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'bot',
      text: ai.welcomeMessage,
      time: 'Just now',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], text: ai.welcomeMessage }];
      }
      return prev;
    });
  }, [ai.welcomeMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 160);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!ai.isEnabled) return null;

  const sendPrompt = (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      time: nowStamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateBuiltinReply(trimmed, siteData);
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: replyText,
        time: nowStamp(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen && (
        <section
          aria-label={ai.assistantName}
          className="glow-frame fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-5 flex h-dvh sm:h-[560px] sm:max-h-[calc(100dvh-120px)] w-full sm:w-[390px] flex-col overflow-hidden sm:rounded-[22px] border border-[var(--accent)]/30 bg-[#0C0F16]/95 backdrop-blur-xl shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-[#121722]/90 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--accent)]/35 bg-[var(--accent)]/15 text-[var(--accent)]">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wider text-[#F5F7FA]">
                  {ai.assistantName}
                </h3>
                <p className="text-[11px] text-[var(--accent-2)]">
                  Official Brand &amp; Service Guide
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-[#9299A8] hover:border-[var(--accent)] hover:text-[#F5F7FA] cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-[#9299A8] hover:border-[var(--accent)] hover:text-[#F5F7FA] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border font-mono text-[10px] font-semibold ${
                    msg.role === 'user'
                      ? 'border-[var(--accent-2)]/35 bg-[var(--accent-2)]/15 text-[var(--accent-2)]'
                      : 'border-[var(--accent)]/30 bg-[var(--accent)]/15 text-[var(--accent)]'
                  }`}
                >
                  {msg.role === 'user' ? 'YOU' : 'AI'}
                </div>
                <div className={`flex max-w-[80%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl border px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'border-[var(--accent)]/35 bg-gradient-to-br from-[var(--accent)]/20 to-[#00B8D4]/15 text-[#F5F7FA]'
                        : 'border-white/10 bg-white/[0.05] text-[#E5E9F0]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="font-mono text-[10px] text-[#9299A8]">{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/15 font-mono text-[10px] font-semibold text-[var(--accent)]">
                  AI
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {ai.suggestedQuestions.length > 0 && (
            <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto border-t border-white/[0.06] bg-[#0E121A]/80 px-3.5 py-2">
              {ai.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendPrompt(q)}
                  className="rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-2.5 py-1 text-[11.5px] text-[#D9F8FF] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/20 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 bg-[#0A0D13] p-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Asif, his journey, or services..."
              maxLength={600}
              className="flex-1 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2.5 text-sm text-[#F5F7FA] placeholder-[#9299A8] outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              aria-label="Send message"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[#06090E] transition hover:brightness-110 disabled:opacity-45 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Open ${ai.assistantName}`}
        aria-expanded={isOpen}
        className="glow-frame relative grid h-14 w-14 place-items-center rounded-full border border-[var(--accent)]/45 bg-gradient-to-br from-[#101A28] to-[#0A0D14] text-[var(--accent)] shadow-[0_14px_32px_rgba(0,0,0,0.65),0_0_24px_rgba(0,229,255,0.22)] transition hover:-translate-y-0.5 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span className="ai-launcher-pulse" aria-hidden="true" />
        <Sparkles className="relative z-10 h-6 w-6" />
      </button>
    </div>
  );
};
