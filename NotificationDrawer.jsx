import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, CheckCircle, AlertTriangle, Info, Sparkles, CheckCheck } from 'lucide-react';

export const NotificationDrawer = () => {
  const { notifications, isNotificationOpen, setIsNotificationOpen, markAllNotificationsRead } = useApp();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
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
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const getIcon = () => {
                  switch (notif.type) {
                    case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
                    case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
                    case 'system': return <Sparkles className="w-4 h-4 text-purple-500" />;
                    default: return <Info className="w-4 h-4 text-blue-500" />;
                  }
                };

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      notif.read
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80 opacity-75'
                        : 'bg-white dark:bg-slate-800 border-brand-500/30 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">{getIcon()}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            MessMate Real-time Notification Engine
          </div>

        </div>
      </div>
    </div>
  );
};
