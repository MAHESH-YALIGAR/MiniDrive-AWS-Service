'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Upload, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPages() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/Auth/register', {
        name: name,
        email: email,
        password: password
      });

      alert('✅ Account created! Please login now.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsSignup(false);
      setLoading(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Signup failed';
      setError(errorMsg);
      setLoading(false);
    }
  };

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!email || !password) {
    setError('Email and password are required');
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post('http://localhost:8000/api/Auth/login', {
      email,
      password,
    });

    const { token, user, message } = response.data;

    if (token) {
      // ✅ Save JWT token to localStorage
      localStorage.setItem('token', token);

      // ✅ Optionally store user info
      localStorage.setItem('user', JSON.stringify(user));

      // ✅ Update Auth context
      login({
        name: user?.name || 'User',
        email: user?.email,
      });

      alert(message || '✅ Login successful!');
      navigate('/');

      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError('Login failed. No token received.');
    }

  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Login failed';
    setError(errorMsg);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 opacity-15 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl border border-emerald-500/30">
              <Upload className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            MiniDrive
          </h1>
          <p className="text-slate-400">Secure Cloud Storage Made Simple</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-slate-700/50">
          <div className="flex gap-3 mb-8 bg-slate-900/50 p-1 rounded-xl">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                !isSignup
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                isSignup
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-emerald-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 w-5 h-5 text-emerald-500/60" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-700/50 border-2 border-slate-600/50 focus:border-emerald-500 focus:outline-none text-slate-100 placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-emerald-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-emerald-500/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-700/50 border-2 border-slate-600/50 focus:border-emerald-500 focus:outline-none text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-emerald-500/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-700/50 border-2 border-slate-600/50 focus:border-emerald-500 focus:outline-none text-slate-100 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-500 hover:text-emerald-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-emerald-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-emerald-500/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-700/50 border-2 border-slate-600/50 focus:border-emerald-500 focus:outline-none text-slate-100 placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            {isSignup ? 'Already have account?' : "Don't have account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-emerald-400 hover:text-emerald-300 font-bold"
            >
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}