import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Shield,
  User,
  Key,
  Download,
  Trash2,
  LogOut,
  Save,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';
import { useNavigate } from '../lib/router';
import { cn } from '../lib/supabase';

export function SettingsPage() {
  const { user, theme, toggleDarkMode, setUser, addNotification } = useAppStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setUser({ ...user!, name });
    addNotification({ type: 'success', title: 'Settings Saved', message: 'Your profile has been updated' });
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-50">Settings</h1>
        <p className="text-dark-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-6 flex items-center gap-2">
              <User size={20} className="text-primary-400" />
              Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={18} />}
              />
              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                leftIcon={<Key size={18} />}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={18} />}>
                Save Changes
              </Button>
            </div>
          </Card>

          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-accent-400" />
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => theme.mode !== 'dark' && toggleDarkMode()}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  theme.mode === 'dark'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <Moon size={24} className="text-dark-400" />
                  <div className="text-left">
                    <p className="font-medium text-dark-100">Dark Mode</p>
                    <p className="text-xs text-dark-500">Optimized for night</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => theme.mode !== 'light' && toggleDarkMode()}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  theme.mode === 'light'
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-700 hover:border-dark-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <Sun size={24} className="text-dark-400" />
                  <div className="text-left">
                    <p className="font-medium text-dark-100">Light Mode</p>
                    <p className="text-xs text-dark-500">Clean and bright</p>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-6 flex items-center gap-2">
              <Bell size={20} className="text-warning-400" />
              Notifications
            </h3>
            <div className="space-y-4">
              {[
                { key: 'high_risk', label: 'High-risk alerts', desc: 'Get notified when dangerous documents detected', checked: true },
                { key: 'new_features', label: 'New features', desc: 'Updates about new capabilities', checked: false },
                { key: 'tips', label: 'Security tips', desc: 'Weekly tips to stay protected', checked: true },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 rounded-xl bg-dark-700/30">
                  <div>
                    <p className="text-sm font-medium text-dark-100">{setting.label}</p>
                    <p className="text-xs text-dark-500">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={setting.checked} />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-6 flex items-center gap-2">
              <Download size={20} className="text-success-400" />
              Data & Privacy
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-700/30">
                <div>
                  <p className="text-sm font-medium text-dark-100">Export Your Data</p>
                  <p className="text-xs text-dark-500">Download all your analysis history</p>
                </div>
                <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>Export</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-danger-500/10 border border-danger-500/20">
                <div>
                  <p className="text-sm font-medium text-danger-400">Delete Account</p>
                  <p className="text-xs text-dark-500">Permanently delete your account and data</p>
                </div>
                <Button variant="danger" size="sm" leftIcon={<Trash2 size={16} />}>Delete</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">Plan</span>
                <Badge variant="success">Free</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">Status</span>
                <Badge variant={user ? 'success' : 'outline'} dot>{user ? 'Signed In' : 'Guest'}</Badge>
              </div>
              {user && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-400">Member Since</span>
                  <span className="text-sm text-dark-200">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card variant="gradient">
            <h3 className="text-lg font-semibold text-dark-50 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start" leftIcon={<Download size={18} />}>
                Download Reports
              </Button>
              <Button variant="ghost" className="w-full justify-start" leftIcon={<Shield size={18} />}>
                Security Settings
              </Button>
              {user ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-danger-400 hover:text-danger-300"
                  leftIcon={<LogOut size={18} />}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary-400"
                  leftIcon={<User size={18} />}
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
