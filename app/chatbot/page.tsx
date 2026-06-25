"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import { Send, TrendingUp, AlertCircle } from "lucide-react";

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [aiConnected, setAiConnected] = useState(true);

  useEffect(() => {
    fetch('/api/ai-status')
      .then(res => res.json())
      .then(data => setAiConnected(data.connected))
      .catch(() => setAiConnected(false));
  }, []);

  const { messages, sendMessage, status, error }: any = (useChat as any)({
    api: "/api/chat",
  });

  const isLoading = status === "submitted" || status === "streaming";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      <style>{`
        body { overflow: hidden !important; }
        .main-content { padding-bottom: 20px !important; height: 100vh !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; }
        .page-section.active { flex: 1 !important; display: flex !important; flex-direction: column !important; padding-bottom: 0 !important; min-height: 0 !important; }
      `}</style>
      <div className="section-title mb-6 text-2xl flex-shrink-0">💬 Vault AI Assistant</div>
      <p className="mb-6 text-gray-400 max-w-2xl text-lg flex-shrink-0">
        Your personalized financial AI. Ask questions about live stock prices, request market analysis, or get investment advice.
      </p>

      {!aiConnected && (
        <div style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px', flexShrink: 0 }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <h3 style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '15px', marginBottom: '6px' }}>AI Consultant Offline (Missing API Key)</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              You are running this open-source repository locally without an active Google Gemini API Key. Neural market consulting is disabled. To activate live stock intelligence, generate a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: '#fcd34d', fontWeight: 'bold', textDecoration: 'underline' }}>Google AI Studio</a> and add <code style={{ background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: '4px', color: '#fbbf24', fontFamily: 'monospace' }}>GOOGLE_GENERATIVE_AI_API_KEY=your_key</code> to your repository&apos;s <code style={{ background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: '4px', color: '#fff', fontFamily: 'monospace' }}>.env</code> file.
            </p>
          </div>
        </div>
      )}

      <div className="chat-layout flex-1 flex flex-col min-h-0" style={{ marginTop: aiConnected ? '20px' : '0px' }}>
        <div className="chat-messages flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="chat-welcome h-full flex flex-col items-center justify-center text-white/50 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/30 shadow-[0_0_15px_rgba(0,212,170,0.15)] mb-2">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white/90">Vault AI Ready</h3>
              <p className="text-sm text-center max-w-sm">
                Ask me about live stock prices (e.g. &quot;What&apos;s Apple&apos;s stock price?&quot;), market sentiment, or general finance queries.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 pt-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`msg max-w-[70%] flex flex-col gap-1 ${
                    msg.role === "user" ? "msg-user self-end" : "msg-bot self-start"
                  }`}
                >
                  {/* AI SDK v5 parts renderer */}
                  {msg.parts?.map((part: any, idx: number) => {
                    if (part.type === "text") {
                      return (
                        <div key={`${msg.id}-${idx}`} className="msg-bubble whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    }

                    if (part.type === "tool-getStockPrice") {
                      const callId = part.toolCallId;
                      return (
                        <div key={callId} className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 my-1 text-xs font-mono text-teal-300 flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,170,0.1)]">
                          <TrendingUp size={16} className="text-teal-400 animate-pulse flex-shrink-0" />
                          <span>
                            {part.state === "output-available"
                              ? `Live quote fetched for ${part.output?.resolvedSymbol || part.input?.symbol || 'ticker'}: $${part.output?.price?.toFixed(2) || 'N/A'} (${part.output?.changePercent >= 0 ? '+' : ''}${part.output?.changePercent?.toFixed(2) || '0'}%)`
                              : `Scraping live Yahoo Finance market data for ${part.input?.symbol || 'ticker'}...`}
                          </span>
                        </div>
                      );
                    }

                    return null;
                  })}

                  <div className="msg-time text-[10px] text-white/30 px-1">
                    {msg.role === "user" ? "You" : "Vault AI"}
                  </div>
                </div>
              ))}
              
              {status === "submitted" && (
                <div className="msg msg-bot self-start max-w-[70%] flex flex-col gap-1">
                  <div className="msg-bubble flex items-center space-x-2">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                  <div className="msg-time text-[10px] text-white/30 px-1">Vault AI Thinking...</div>
                </div>
              )}
              
              {error && (
                <div className="self-center bg-red-500/20 text-red-400 text-xs px-3 py-2 rounded-md border border-red-500/30 flex items-center gap-2 my-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error.message || "An error occurred while communicating with Gemini."}</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="chat-input-wrap flex items-center mt-auto">
          <input
            type="text"
            className="chat-input flex-1"
            placeholder="Ask about AAPL live price, market trends, or investment advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="btn-send ml-2" disabled={isLoading || !input.trim()}>
            Send <Send size={14} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
