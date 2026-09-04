import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, CheckCircle, AlertTriangle, Info, Sparkles, CheckCheck } from 'lucide-react';
import { getCollegeDateString } from '../utils/dateTime.js';

export const NotificationDrawer = () => {
  const { 
    notifications, 
    unreadCount, 
    isNotificationOpen, 
    setIsNotificationOpen, 
    markAllNotificationsRead, 
    markNotificationAsRead 
  } = useApp();

  if (!isNotificationOpen) return null;

  const formatNotifTime = (notif) => {
    if (!notif?.createdAt) return notif?.time || 'Today';
    try {
      const createdDate = new Date(notif.createdAt);
      const now = new Date();
      const diffSec = Math.floor((now - createdDate) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;

      const todayStr = getCollegeDateString(now);
      const notifDateStr = getCollegeDateString(createdDate);

      if (todayStr === notifDateStr) {
        return createdDate.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return notifDateStr;
    } catch {
      return notif.time || 'Today';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(!notifications || notifications.length === 0) ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Bell className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No new notifications</p>
                <p className="text-xs text-slate-400">Activity updates and reward alerts will appear here in real-time.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const getIcon = () => {
                  switch (notif.type) {
                    case 'success':
                    case 'reward': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
                    case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
                    case 'system': return <Sparkles className="w-4 h-4 text-purple-500" />;
                    default: return <Info className="w-4 h-4 text-blue-500" />;
                  }
                };

                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && markNotificationAsRead?.(notif.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      notif.read
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 opacity-75'
                        : 'bg-white dark:bg-slate-800 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/10'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">{formatNotifTime(notif)}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 font-medium">
            MessMate Real-time Notification Engine
          </div>

        </div>
      </div>
    </div>
  );
};
