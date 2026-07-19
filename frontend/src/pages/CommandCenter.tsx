import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, TerminalSquare, AlertCircle, Database, Globe } from 'lucide-react';
import type { ChatMessage } from '../../../shared/types';

interface CommandCenterProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export default function CommandCenter({ currentLang, onLanguageChange }: CommandCenterProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: getWelcomeMessage(currentLang),
      timestamp: Date.now(),
      citations: ['System Boot']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: getWelcomeMessage(currentLang),
          timestamp: Date.now(),
          citations: ['System Boot']
        }
      ]);
    }
  }, [currentLang]);

  function getWelcomeMessage(lang: string) {
    return 'MatchControl Pro Command AI Initialized. Type a query regarding match logistics, security protocols, or venue operations.';
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: `> ${userText}`,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
          language: currentLang
        })
      });

      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: data.content,
        timestamp: Date.now(),
        citations: data.citations || ['MatchControl DB']
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'model',
          content: "[SYS_ERR] Connection to Master AI lost. Operating on local offline cache. Gate security is active.",
          timestamp: Date.now(),
          citations: ['Offline Mode']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      
      {/* Terminal Interface */}
      <div className="lg:col-span-3 bg-slate-900 rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl border border-slate-700 h-full font-mono">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <TerminalSquare className="w-4 h-4 text-stadium-teal" />
            <span className="font-bold tracking-widest text-stadium-teal">CMD_INTERFACE_v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> SYS_ONLINE</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-stadium-teal"></div> UPLINK_STABLE</span>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] ${m.role === 'user' ? 'text-stadium-accent text-right' : 'text-slate-300'}`}>
                <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                {m.citations && m.citations.length > 0 && (
                  <div className={`mt-2 flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <Database className="w-3 h-3 text-slate-500" />
                    <span>SRC: {m.citations.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 text-stadium-teal animate-pulse" role="status" aria-label="Loading AI response">
              <span className="w-2 h-4 bg-stadium-teal inline-block"></span> Processing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
          <div className="text-stadium-teal font-bold pr-2">{'>'}</div>
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-sm text-stadium-teal focus:outline-none placeholder-slate-700 font-mono"
            placeholder="Enter command or query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            aria-label="Command input"
            autoFocus
          />
          <button
            type="submit"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-stadium-teal rounded transition-colors"
            disabled={loading || !input.trim()}
            aria-label="Send command"
          >
            <Terminal className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      {/* Database Context Panel */}
      <div className="glass-card p-5 h-full flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Database className="w-4 h-4 text-stadium-brand" />
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Active Data Schemas</h2>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
          The AI Command Terminal executes queries against live MatchControl databases.
        </p>
        <div className="space-y-3 mt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-1">Security Protocols</h4>
            <p className="text-slate-600">
              Clear bag policy enforced at all gates. Facial recognition active at VIP entry.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-1">Pitch Agronomy Rules</h4>
            <p className="text-slate-600">
              Optimal moisture is 35-50%. Watering prohibited within 2 hours of kickoff.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-1">VIP Hospitality</h4>
            <p className="text-slate-600">
              All suite requests routed to concourse kitchens. Medical emergencies supersede catering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
