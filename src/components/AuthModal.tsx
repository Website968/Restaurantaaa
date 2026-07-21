import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Bike, ShoppingBag, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  onLogin: (user: any, token: string) => void;
}

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isForgot) {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password || 'customer123' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Password reset failed');
        setSuccessMsg('Password has been reset successfully! You can now log in with the new password.');
        setIsForgot(false);
        setIsLogin(true);
      } else if (isLogin) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');
        onLogin(data.user, data.token);
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, address, landmark })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        onLogin(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'admin' | 'delivery' | 'customer') => {
    let credentials = { email: '', password: '' };
    if (role === 'admin') {
      credentials = { email: 'admin@restaurant.com', password: 'admin123' };
    } else if (role === 'delivery') {
      credentials = { email: 'delivery@restaurant.com', password: 'delivery123' };
    } else {
      credentials = { email: 'customer@restaurant.com', password: 'customer123' };
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quick login failed');
      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-panel" className="max-w-md w-full mx-auto bg-stone-50/95 border border-stone-200/80 rounded-xl shadow-xl p-6 sm:p-8 backdrop-blur-sm">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          The Gourmet Craft
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          {isForgot
            ? 'Reset your account password'
            : isLogin
            ? 'Sign in to savor artisan cuisines'
            : 'Join us for a gourmet dining experience'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg font-medium">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && !isForgot && (
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <User size={16} />
              </span>
              <input
                id="reg-name"
                type="text"
                required
                placeholder="Chris Customer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 placeholder-stone-400 text-sm bg-white"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Mail size={16} />
            </span>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="customer@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 placeholder-stone-400 text-sm bg-white"
            />
          </div>
        </div>

        {!isForgot && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <Lock size={16} />
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 placeholder-stone-400 text-sm bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {isForgot && (
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <Lock size={16} />
              </span>
              <input
                id="auth-reset-password"
                type="password"
                required
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 placeholder-stone-400 text-sm bg-white"
              />
            </div>
          </div>
        )}

        {!isLogin && !isForgot && (
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+1 (555) 444-5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Delivery Address</label>
              <input
                id="reg-address"
                type="text"
                placeholder="742 Evergreen Terrace"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">Landmark (Optional)</label>
              <input
                id="reg-landmark"
                type="text"
                placeholder="Next to Springfield Mall"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-stone-800 text-sm bg-white"
              />
            </div>
          </div>
        )}

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-stone-50 font-bold py-2.5 px-4 rounded-lg hover:bg-stone-800 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 mt-2 text-sm flex justify-center items-center"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin"></span>
          ) : isForgot ? (
            'Reset Password'
          ) : isLogin ? (
            'Log In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsForgot(false);
            setIsLogin(!isLogin);
            setError('');
            setSuccessMsg('');
          }}
          className="text-xs font-semibold text-stone-800 hover:underline"
        >
          {isForgot
            ? 'Back to Log In'
            : isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Log In'}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-stone-200/80">
        <p className="text-center text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
          Instant Role Selector
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            id="quick-login-admin"
            onClick={() => handleQuickLogin('admin')}
            disabled={loading}
            className="flex flex-col items-center justify-center py-2 px-1 border border-stone-300 rounded-lg hover:bg-stone-100 bg-white transition-all text-stone-800 group shadow-sm hover:border-stone-800"
          >
            <Shield size={18} className="text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">Alex (Admin)</span>
            <span className="text-[9px] text-stone-500 font-medium">admin123</span>
          </button>
          <button
            id="quick-login-delivery"
            onClick={() => handleQuickLogin('delivery')}
            disabled={loading}
            className="flex flex-col items-center justify-center py-2 px-1 border border-stone-300 rounded-lg hover:bg-stone-100 bg-white transition-all text-stone-800 group shadow-sm hover:border-stone-800"
          >
            <Bike size={18} className="text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">Roy (Rider)</span>
            <span className="text-[9px] text-stone-500 font-medium">delivery123</span>
          </button>
          <button
            id="quick-login-customer"
            onClick={() => handleQuickLogin('customer')}
            disabled={loading}
            className="flex flex-col items-center justify-center py-2 px-1 border border-stone-300 rounded-lg hover:bg-stone-100 bg-white transition-all text-stone-800 group shadow-sm hover:border-stone-800"
          >
            <ShoppingBag size={18} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">Chris (User)</span>
            <span className="text-[9px] text-stone-500 font-medium">customer123</span>
          </button>
        </div>
      </div>
    </div>
  );
}
