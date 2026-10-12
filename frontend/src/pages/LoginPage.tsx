import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, loginDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginDemoUser();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-botanical-bg dark:bg-botanical-darkBg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex w-16 h-16 rounded-2xl bg-forest-700 text-white items-center justify-center shadow-card mb-4">
          <span className="text-3xl">🌿</span>
        </div>
        <h2 className="text-3xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
          Welcome back to FloraAI
        </h2>
        <p className="mt-2 text-sm text-botanical-muted dark:text-botanical-darkMuted">
          Your personal botanical sanctuary & AI plant doctor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-botanical-card dark:bg-botanical-darkCard py-8 px-6 sm:px-10 rounded-3xl border border-botanical-border dark:border-botanical-darkBorder shadow-card">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-leaf-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-botanical-muted dark:text-botanical-darkMuted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gardener@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-botanical-text dark:text-botanical-darkText placeholder-botanical-muted text-sm focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 dark:text-leaf-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-botanical-muted dark:text-botanical-darkMuted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-botanical-text dark:text-botanical-darkText placeholder-botanical-muted text-sm focus:ring-2 focus:ring-forest-500/30 focus:border-forest-600 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-botanical-muted hover:text-forest-700 dark:hover:text-leaf-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Garden
            </Button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-6 pt-5 border-t border-botanical-border/70 dark:border-botanical-darkBorder/70">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-leaf-300/80 dark:border-forest-700 bg-leaf-50/70 dark:bg-forest-950/40 text-forest-800 dark:text-leaf-300 hover:bg-leaf-100 dark:hover:bg-forest-900/60 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-leaf-500" />
              <span>Explore as Demo User (Preloaded Garden)</span>
            </button>
          </div>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-botanical-muted dark:text-botanical-darkMuted">
            <span>New to FloraAI? </span>
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-forest-700 dark:text-leaf-400 hover:underline"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
