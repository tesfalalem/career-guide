import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Shield, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import ConfirmModal from '../../common/ConfirmModal';

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  message: string;
  sender_name: string;
  created_at: string;
}

interface SupportChatViewProps {
  currentUser: any;
  isAdminView?: boolean;
  targetUserId?: string; // If admin, which user are they chatting with
}

const SupportChatView: React.FC<SupportChatViewProps> = ({ currentUser, isAdminView = false, targetUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      let data;
      if (isAdminView && targetUserId) {
        data = await apiClient.getAdminMessages(targetUserId);
      } else {
        data = await apiClient.getSupportMessages();
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
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [targetUserId]);

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
      await apiClient.sendSupportMessage(
        newMessage, 
        isAdminView ? targetUserId : '1' // Admin sends to user, User sends to admin (ID 1)
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessageToDelete(messageId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;
    
    try {
      await apiClient.deleteSupportMessage(messageToDelete);
      setMessages(prev => prev.filter(m => m.id !== messageToDelete));
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="w-10 h-10 text-careermap-teal animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-careermap-teal/10 flex items-center justify-center text-careermap-teal">
          {isAdminView ? <User size={20} /> : <Shield size={20} />}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            {isAdminView ? 'Chat with User' : 'Support Team'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isAdminView ? 'Direct support line' : 'We typically reply within a few hours'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 dark:text-slate-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.sender_id) === String(currentUser.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isMe && (
                    <div className="w-8 h-8 rounded-lg bg-careermap-teal/10 flex items-center justify-center text-careermap-teal shrink-0 mb-1">
                      {isAdminView ? <User size={14} /> : <Shield size={14} />}
                    </div>
                  )}
                  <div className="relative group/bubble flex items-end gap-2">
                    <div className={`rounded-2xl px-4 py-3 ${
                      isMe 
                        ? 'bg-careermap-teal text-white rounded-tr-none shadow-md' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {isAdminView && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className={`p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg opacity-0 group-hover:opacity-100 group-hover/bubble:opacity-100 transition-all shrink-0 mb-1`}
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-careermap-teal outline-none dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 bg-careermap-teal hover:bg-teal-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        title="Delete Message"
        message="This action cannot be undone. The message will be removed for both you and the user."
        confirmText="Delete Message"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        variant="danger"
      />
    </div>
  );
};

export default SupportChatView;
