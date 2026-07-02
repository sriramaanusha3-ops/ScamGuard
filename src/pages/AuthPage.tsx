import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Github,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';
import { useNavigate } from '../lib/router';
import { cn } from '../lib/supabase';

type AuthMode = 'signin' | 'signup' | 'forgot';

export function AuthPage() {
  const navigate = useNavigate();
  const { setUser, addNotification } = useAppStore();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name,
            created_at: new Date().toISOString(),
          });
          addNotification({ type: 'success', title: 'Account Created', message: 'Welcome to ScamGuard!' });
          navigate('/');
        }
      } else if (mode === 'signin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || 'User',
            created_at: new Date().toISOString(),
          });
          addNotification({ type: 'success', title: 'Welcome Back', message: `Signed in as ${data.user.email}` });
          navigate('/');
        }
      } else if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        addNotification({ type: 'info', title: 'Password Reset', message: 'Check your email for reset instructions' });
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 mesh-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-dark-50">ScamGuard</h1>
          <p className="text-dark-400 mt-2">AI-Powered Job Scam Detection Platform</p>
        </div>

        <Card variant="gradient" className="p-8">
          <div className="flex gap-2 mb-6">
            {(['signin', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-lg transition-all',
                  mode === m
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700/50 text-dark-400 hover:text-dark-200'
                )}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode !== 'forgot' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button variant="outline" onClick={() => handleOAuthSignIn('google')} className="w-full" disabled={isLoading}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.48 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleOAuthSignIn('github')} className="w-full" disabled={isLoading}>
                  <Github size={20} />
                  GitHub
                </Button>
              </div>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-800 text-dark-500">or continue with email</span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={18} />}
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
            />
            {mode !== 'forgot' && (
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={18} />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-danger-400 bg-danger-500/10 p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            {mode !== 'forgot' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-dark-400 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              onClick={handleEmailAuth}
              isLoading={isLoading}
              className="w-full"
              rightIcon={!isLoading ? <ArrowRight size={18} /> : undefined}
            >
              {mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
            </Button>
          </div>

          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('signin')}
                className="text-sm text-dark-400 hover:text-dark-200"
              >
                Back to Sign In
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-dark-500 hover:text-dark-300"
            >
              Continue without signing in →
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
