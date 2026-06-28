import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ShieldCheck, Lock } from 'lucide-react';
import { Message, User } from '../types';

interface CommunicationModuleProps {
  proposalId: string;
  currentUser: User;
  onNewMessageLogged?: () => void;
}

export default function CommunicationModule({ proposalId, currentUser, onNewMessageLogged }: CommunicationModuleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchDiscussion = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}/discussion`, {
        headers: {
          'Authorization': `Bearer ${currentUser.id}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch discussion messages');
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDiscussion();
    // Poll every 5 seconds for simulation feel
    const interval = setInterval(fetchDiscussion, 5000);
    return () => clearInterval(interval);
  }, [proposalId, currentUser]);

  useEffect(() => {
    // Scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/proposals/${proposalId}/discussion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to send message');
      }

      setInputText('');
      await fetchDiscussion();
      if (onNewMessageLogged) {
        onNewMessageLogged();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px] shadow-sm">
      {/* Thread Header */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <div>
            <h4 className="text-sm font-bold font-display tracking-tight">Secure Clarification Discussion</h4>
            <p className="text-[10px] text-slate-400 font-sans">CIISIC Monitored Communication Channel</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 bg-orange-950/25 text-orange-500 px-2 py-0.5 rounded text-[9px] font-mono border border-orange-500/10 uppercase font-bold tracking-wider">
          <Lock className="w-2.5 h-2.5" /> Siloed Channel
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-slate-50 border-b border-slate-100 p-2.5 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5 px-4 font-sans">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
        <p>
          To maintain transparency, all communications are restricted to this thread. Exchanging telephone numbers, email addresses, or external links is actively audited. Student identity is masked as an anonymous handle (e.g. Student #ST-XYZ) to industry SPOCs.
        </p>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3.5"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 px-6 text-center font-sans">
            <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.5]" />
            <div className="text-xs font-semibold uppercase tracking-wider font-display text-slate-500">No messages yet.</div>
            <p className="text-[10px] leading-relaxed max-w-xs">
              Industry SPOCs can query technical concepts or request revisions, and Students can reply in real time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                {/* Meta details */}
                <span className="text-[9px] font-semibold text-slate-500 mb-0.5 block px-1 font-sans">
                  {msg.senderName} • <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-orange-600">{msg.senderRole}</span>
                </span>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-orange-500 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Timestamp */}
                <span className="text-[8px] text-slate-400 mt-0.5 block px-1 font-mono font-semibold">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-700 text-[10px] text-center border-t border-red-100 font-bold uppercase font-mono">
          {error}
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 font-sans">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 p-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-orange-500 text-slate-850"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-lg transition disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
