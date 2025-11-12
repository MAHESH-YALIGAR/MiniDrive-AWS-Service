import React, { useState } from 'react';
import { Cloud, Lock, Zap, Users, ArrowRight, CheckCircle, Shield, Smartphone } from 'lucide-react';
// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"

export default function FileVaultLanding() {
  const [isDark] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    // Show home page after login
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to FileVault!</h1>
          <p className="text-lg mb-8 text-gray-400">Your dashboard is ready</p>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white' : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900'}`}>
      
    
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Upload Your Files,
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> Secured</span>
            </h1>
            <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Store, manage, and share your files securely in the cloud. Access them anywhere, anytime.
            </p>
            <div className="flex gap-4">
              {/* <SignedOut> */}
        {/* <SignInButton mode="modal"> */}
          <button
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center gap-2 transition-all hover:scale-105"
          >
            Start Free <ArrowRight size={20} />
          </button>
        {/* </SignInButton> */}
      {/* </SignedOut> */}
              <button className={`px-8 py-3 rounded-lg border font-semibold transition-all ${
                isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
              }`}>
                Learn More
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
            <div className={`relative rounded-2xl p-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-slate-200/50'}`}>
              <Cloud className="w-32 h-32 text-blue-500 mx-auto" />
              <p className="text-center mt-4 font-semibold">Secure Cloud Storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose FileVault?</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className={`rounded-2xl p-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-slate-200/50'} hover:scale-105 transition-all`}>
            <Shield className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Military-Grade Security</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              End-to-end encryption keeps your files safe and private
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`rounded-2xl p-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-slate-200/50'} hover:scale-105 transition-all`}>
            <Zap className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Upload and download files at blazing-fast speeds
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`rounded-2xl p-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-slate-200/50'} hover:scale-105 transition-all`}>
            {/* <Users className="w-12 h-12 text-pink-500 mb-4" /> */}
            <h3 className="text-2xl font-bold mb-3">Easy Sharing</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Share files and folders with customizable permissions
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <h2 className="text-4xl font-bold text-center mb-16">Simple & Transparent Pricing</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Basic', price: 'Free', storage: '5 GB', features: ['5 GB Storage', 'Basic Sharing', 'Email Support'] },
            { name: 'Pro', price: '$9.99', storage: '1 TB', features: ['1 TB Storage', 'Advanced Sharing', 'Priority Support', 'File Versioning'], highlighted: true },
            { name: 'Business', price: '$19.99', storage: '5 TB', features: ['5 TB Storage', 'Team Collaboration', '24/7 Support', 'Admin Controls'] },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? 'backdrop-blur-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/50 scale-105'
                  : isDark
                  ? 'bg-slate-800/50 border border-slate-700/50'
                  : 'bg-white/50 border border-slate-200/50'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-4">{plan.price}<span className="text-lg text-gray-400">/month</span></p>
              <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{plan.storage}</p>
              <button className={`w-full py-2 px-4 rounded-lg font-semibold mb-6 transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : isDark
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-200 hover:bg-slate-300'
              }`}>
                Choose Plan
              </button>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className={`rounded-2xl p-12 backdrop-blur-xl text-center ${isDark ? 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50' : 'bg-gradient-to-r from-slate-100/50 to-slate-200/50 border border-slate-300/50'}`}>
          <h2 className="text-4xl font-bold mb-6">Ready to Secure Your Files?</h2>
          <p className={`text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Join thousands of users who trust FileVault with their important files
          </p>
          <button
            onClick={() => setIsLoggedIn(true)}
            className="px-10 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold text-lg transition-all hover:scale-105"
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-100/50'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            © 2024 FileVault. All rights reserved. Securing your digital life.
          </p>
        </div>
      </footer>
    </div>
  );
}