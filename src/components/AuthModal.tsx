import React, { useState } from 'react';
import { User, Mail, Lock, Bike, ShoppingBag, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthModalProps {
  onLogin: (user: any, token: string) => void;
}

type AuthMode = 'login' | 'signup-customer' | 'signup-delivery' | 'forgot';

export default function AuthModal({ onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Common Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  
  // Delivery Partner Specific Fields
  const [vehicleType, setVehicleType] = useState('Bike');
  const [licenseNumber, setLicenseNumber] = useState('');

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
      if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Password reset failed');
        setSuccessMsg('Password has been reset successfully! You can now log in with your new password.');
        setMode('login');
      } else if (mode === 'login') {
        let firebaseUid: string | undefined = undefined;
        let firebaseEmail: string | undefined = undefined;

        try {
          const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
          firebaseUid = userCred.user.uid;
          firebaseEmail = userCred.user.email || email;
        } catch (fbErr: any) {
          console.warn('Firebase Auth signin attempt:', fbErr?.code, fbErr?.message);
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firebaseUid, firebaseEmail })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');

        // Check Delivery Partner approval status
        if (data.user.role === 'delivery') {
          if (data.user.approvalStatus === 'pending') {
            throw new Error('Your delivery partner account is pending admin approval. You will be able to access the delivery dashboard once an administrator approves your account.');
          } else if (data.user.approvalStatus === 'rejected') {
            throw new Error('Your delivery partner application was rejected by the administrator. Please contact support.');
          }
        }

        onLogin(data.user, data.token);
      } else if (mode === 'signup-customer') {
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (fbErr: any) {
          console.warn('Firebase Auth register attempt:', fbErr?.code, fbErr?.message);
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, address, landmark })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        onLogin(data.user, data.token);
      } else if (mode === 'signup-delivery') {
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (fbErr: any) {
          console.warn('Firebase Auth register attempt:', fbErr?.code, fbErr?.message);
        }

        const res = await fetch('/api/auth/register-delivery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            address,
            vehicleType,
            licenseNumber
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Delivery partner registration failed');

        setSuccessMsg(data.message || 'Application submitted successfully! Your account is pending admin approval.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div id="auth-panel" className="max-w-md w-full bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl p-6 sm:p-8 text-left text-white">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#1a1a1a] border border-red-600/50 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
            🥟
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Dumpling Dream
          </h2>
          <p className="text-xs text-stone-400 mt-1 font-medium">
            {mode === 'forgot'
              ? 'Reset your account password'
              : mode === 'login'
              ? 'Sign in to access your account'
              : mode === 'signup-customer'
              ? 'Create a customer account'
              : 'Apply as a Delivery Partner'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'forgot' && (
          <div className="flex bg-[#181818] p-1 rounded-xl border border-[#2a2a2a] mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                mode === 'login' ? 'bg-red-600 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup-customer');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                mode === 'signup-customer' ? 'bg-red-600 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup-delivery');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all flex items-center justify-center space-x-1 ${
                mode === 'signup-delivery' ? 'bg-amber-600 text-white shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Bike size={13} />
              <span>Partner</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/90 border border-red-800 text-red-200 text-xs rounded-xl font-bold leading-relaxed">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/90 border border-emerald-800 text-emerald-200 text-xs rounded-xl font-bold leading-relaxed">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Full Name field for Signups */}
          {(mode === 'signup-customer' || mode === 'signup-delivery') && (
            <div>
              <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-red-600 text-white placeholder-stone-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* Email Address field */}
          <div>
            <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-red-600 text-white placeholder-stone-500 text-xs"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider">
                {mode === 'forgot' ? 'New Password' : 'Password'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-500">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-red-600 text-white placeholder-stone-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Customer Signup Additional Fields */}
          {mode === 'signup-customer' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-red-600 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street Address, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-red-600 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Delivery Partner Signup Specific Fields */}
          {mode === 'signup-delivery' && (
            <div className="space-y-3 pt-1 border-t border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                🛵 Delivery Rider Specs
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-amber-600 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-amber-600 text-white text-xs"
                  >
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">License Plate / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AS-11-2026-99"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-amber-600 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-stone-300 uppercase tracking-wider mb-1">Operating Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sribhumi Central Zone"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181818] border border-[#2a2a2a] rounded-xl focus:outline-none focus:border-amber-600 text-white text-xs"
                />
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl text-[10px] text-amber-300 font-semibold leading-normal">
                ⏳ Note: Your delivery partner application will be reviewed by a restaurant admin before account activation.
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-black py-3 rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider flex justify-center items-center ${
              mode === 'signup-delivery'
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/50'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50'
            }`}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : mode === 'forgot' ? (
              'Reset Password'
            ) : mode === 'login' ? (
              'Log In'
            ) : mode === 'signup-customer' ? (
              'Create Customer Account'
            ) : (
              'Submit Delivery Partner Application'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          {mode === 'forgot' ? (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs font-bold text-stone-300 hover:text-white underline"
            >
              Back to Log In
            </button>
          ) : (
            <p className="text-xs text-stone-400 font-medium">
              {mode === 'login' ? (
                <>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup-customer')}
                    className="font-bold text-red-500 hover:underline"
                  >
                    Sign Up
                  </button>{' '}
                  or{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup-delivery')}
                    className="font-bold text-amber-500 hover:underline"
                  >
                    Join as Delivery Partner
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-red-500 hover:underline"
                  >
                    Log In
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
