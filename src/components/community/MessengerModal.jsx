import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getMessages, sendMessage } from '../../services/db';
import { X, Send, User, MessageCircle, Shield } from 'lucide-react';

export default function MessengerModal() {
  const { modalState, setModalState, currentUser, refreshData } = useApp();
  const chatInfo = modalState.activeChatRequest;

  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (chatInfo?.id) {
      setMessages(getMessages(chatInfo.id));
    }
  }, [chatInfo?.id]);

  if (!modalState.messenger || !chatInfo) return null;

  const handleClose = () => {
    setModalState(s => ({ ...s, messenger: false, activeChatRequest: null }));
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = sendMessage(chatInfo.id, {
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      text: inputMsg.trim()
    });

    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');
  };

  const targetName = currentUser.id === chatInfo.ownerId ? chatInfo.borrowerName || 'Neighbour' : chatInfo.ownerName;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg h-[560px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {targetName?.charAt(0) || 'N'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{targetName}</h3>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                In-App Neighbourhood Chat
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 text-xs">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 text-center">
            🔒 Safe in-app communication. Please coordinate pickup, tool usage questions, or return timing respectfully.
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No messages yet. Say hello to {targetName}!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">{m.senderName}</span>
                  <div className={`p-3 rounded-2xl max-w-xs leading-relaxed ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Send Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type your message to neighbour..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:bg-white focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
