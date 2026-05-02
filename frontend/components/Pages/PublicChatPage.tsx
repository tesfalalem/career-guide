import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Shield, MessageSquare, Loader2, ChevronLeft, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: number;
  sender_id: string | null;
  receiver_id: string | null;
  guest_id: string | null;
  message: string;
  sender_name: string;
  created_at: string;
}

interface PublicChatPageProps {
  currentUser: any | null;
  onNavigate: (view: any) => void;
}

const PublicChatPage: React.FC<PublicChatPageProps> = ({ currentUser, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle Guest ID
    if (!currentUser) {
      let storedId = localStorage.getItem('chat_guest_id');
      if (!storedId) {
        storedId = uuidv4();
        localStorage.setItem('chat_guest_id', storedId);
      }
      setGuestId(storedId);
    }
  }, [currentUser]);

  const fetchMessages = async () => {
    try {
      let data;
      if (currentUser) {
        data = await apiClient.getSupportMessages();
      } else if (guestId) {
        data = await apiClient.getGuestMessages(guestId);
      } else {
        return;
      }
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUser, guestId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      if (currentUser) {
        await apiClient.sendSupportMessage(newMessage, '1');
      } else if (guestId) {
        await apiClient.sendGuestMessage(newMessage, guestId);
      }
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Navigation Back */}
      <button 
        onClick={() => onNavigate('home')}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-careermap-teal dark:hover:text-teal-400 transition-all font-bold text-[10px] uppercase tracking-[0.3em] z-50 group"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-teal-500 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/30 transition-all">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span>Home</span>
      </button>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800">
            <Sparkles size={13} className="text-teal-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-careermap-teal dark:text-teal-400">
              Live Support
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Ask us anything about the platform. We're here to help!
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-careermap-teal/10 flex items-center justify-center text-careermap-teal">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Support Team</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Online</p>
              </div>
            </div>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-8 space-y-6">
            {loading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Connecting...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="w-16 h-16 text-slate-100 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-slate-400 dark:text-slate-500 font-medium">No messages yet. Send us a message to start!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser 
                  ? String(msg.sender_id) === String(currentUser.id)
                  : msg.sender_id === null; // Guests have null sender_id
                
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className="flex items-end gap-2 max-w-[85%]">
                      {!isMe && (
                        <div className="w-8 h-8 rounded-lg bg-careermap-teal/10 flex items-center justify-center text-careermap-teal shrink-0 mb-1">
                          <Shield size={14} />
                        </div>
                      )}
                      <div className={`rounded-2xl px-5 py-4 ${
                        isMe 
                          ? 'bg-careermap-navy text-white rounded-tr-none shadow-lg shadow-navy-500/10' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                        <p className={`text-[10px] mt-2 font-bold opacity-40 uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 bg-white dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-careermap-teal outline-none dark:text-white shadow-sm"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="w-14 h-14 bg-careermap-teal hover:bg-teal-600 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-teal-500/20"
              >
                {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send size={22} />}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
              Our team typically responds in under 2 hours
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicChatPage;
