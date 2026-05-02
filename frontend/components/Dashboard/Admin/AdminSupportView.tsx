import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Search, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import SupportChatView from '../common/SupportChatView';

interface Conversation {
  user_id: string | null;
  guest_id: string | null;
  name: string | null;
  email: string | null;
  last_message: string;
  last_activity: string;
}

const AdminSupportView: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const profile = await apiClient.getProfile();
        setAdminUser(profile);
      } catch (err) {
        console.error("Failed to get admin profile:", err);
      }
    };
    fetchAdminProfile();
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await apiClient.getAdminConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchString = searchQuery.toLowerCase();
    const nameMatch = conv.name?.toLowerCase().includes(searchString) || false;
    const emailMatch = conv.email?.toLowerCase().includes(searchString) || false;
    const guestMatch = conv.guest_id?.toLowerCase().includes(searchString) || false;
    return nameMatch || emailMatch || guestMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-careermap-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Sidebar - List of conversations */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-careermap-teal" />
              Conversations
            </h3>
            <span className="bg-careermap-teal/10 text-careermap-teal text-xs font-bold px-2 py-1 rounded-full">
              {conversations.length}
            </span>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-careermap-teal outline-none dark:text-white"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <User size={32} className="mx-auto mb-2" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const identifier = conv.user_id || conv.guest_id;
                const isSelected = selectedUserId === identifier;
                return (
                  <button
                    key={identifier || Math.random().toString()}
                    onClick={() => setSelectedUserId(identifier)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-careermap-teal border-careermap-teal text-white shadow-lg shadow-teal-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-careermap-teal/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-bold truncate pr-2">
                        {conv.name || `Guest (${conv.guest_id?.substring(0, 8)})`}
                      </span>
                      <Clock size={12} className={isSelected ? 'text-white/70' : 'text-slate-400'} />
                    </div>
                    <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {conv.last_message || 'No messages yet'}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-8">
        {selectedUserId && adminUser ? (
          <SupportChatView 
            currentUser={adminUser} 
            isAdminView={true} 
            targetUserId={selectedUserId} 
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 h-[600px] flex flex-col items-center justify-center p-12 text-center group transition-all hover:border-careermap-teal/30">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-10 h-10 text-slate-300 group-hover:text-careermap-teal" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a user to start chatting</h3>
             <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                Manage all incoming student support requests from one central place.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportView;
