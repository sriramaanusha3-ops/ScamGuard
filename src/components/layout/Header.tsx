import { motion } from 'framer-motion';
import { Bell, Search, Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../store';
import { cn } from '../../lib/supabase';
import { Badge, Input } from '../ui';

export function Header() {
  const { theme, toggleDarkMode, notifications, markNotificationRead } = useAppStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-dark-800 text-dark-400">
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success-500/10 text-success-400 rounded-full">
              <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
              <span className="text-sm font-medium">System Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-full">
              <span className="text-sm font-medium">AI Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block w-48">
            <Input
              placeholder="Search reports..."
              leftIcon={<Search size={18} />}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setShowSearch(false)}
              className="text-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 rounded-full flex items-center justify-center text-xs font-medium text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-dark-800 rounded-xl border border-dark-700 shadow-2xl z-50"
                >
                  <div className="p-4 border-b border-dark-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark-100">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge variant="danger" size="sm">{unreadCount} new</Badge>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-custom">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-dark-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={cn(
                            'p-4 border-b border-dark-700/50 last:border-0 hover:bg-dark-700/50 transition-colors cursor-pointer',
                            !notification.read && 'bg-primary-500/5'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                                notification.type === 'warning' && 'bg-warning-500',
                                notification.type === 'error' && 'bg-danger-500',
                                notification.type === 'success' && 'bg-success-500',
                                notification.type === 'info' && 'bg-primary-500'
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-dark-100">
                                {notification.title}
                              </p>
                              <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-100 transition-colors"
          >
            {theme.mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
