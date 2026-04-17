import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  onViewAll?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onViewAll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.notifications.slice(0, 10)); // Show latest 10
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-primary dark:text-white">Notifications</h3>
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-secondary hover:text-secondary/80 font-semibold flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  Mark all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${
                      !notification.is_read ? 'bg-secondary/5' : ''
                    }`}
                    onClick={() => {
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${
                            !notification.is_read ? 'text-primary dark:text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-1">
                            {!notification.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                title="Mark as read"
                              >
                                <Check size={14} className="text-secondary" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                              title="Delete"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && onViewAll && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onViewAll();
                }}
                className="w-full text-center text-sm text-secondary hover:text-secondary/80 font-semibold"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
