"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Globe, Clock, Users, ArrowRight, X } from 'lucide-react';

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  const stats = [
    { label: 'Memories Saved', value: '1.2M+', icon: Clock },
    { label: 'Active Clusters', value: '45k', icon: Globe },
    { label: 'Families Connected', value: '12k', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Globe className="w-8 h-8 text-primary animate-pulse" />
          <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            MEMORY ATLAS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setAuthMode('login')}
            className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthMode('signup')}
            className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            Beta Access Now Open
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            The Digital Anchor for Your <br />
            <span className="text-primary italic">Family Legacy.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let&apos;s map your life&apos;s most meaningful moments, together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setAuthMode('signup')}
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl flex items-center gap-2 text-lg shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all hover:scale-105"
            >
              Start Your Atlas <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-colors text-lg">
              Explore Demo
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-4xl">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-8 rounded-3xl bg-secondary border border-white/5 text-left group hover:border-primary/30 transition-colors"
            >
              <stat.icon className="w-6 h-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-white/40 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {authMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-secondary border border-white/10 p-10 rounded-[40px] shadow-2xl"
            >
              <button 
                onClick={() => setAuthMode(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6 text-white/40" />
              </button>

              <div className="text-center mb-8">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold tracking-tight">
                  {authMode === 'login' ? 'Welcome Back' : 'Join the Atlas'}
                </h2>
                <p className="text-white/40 mt-2">
                  {authMode === 'login' ? 'Access your family memories' : 'Begin your preservation journey'}
                </p>
              </div>

              {authMode === 'login' ? (
                <LoginForm onSuccess={() => setAuthMode(null)} />
              ) : (
                <SignupForm onSuccess={() => setAuthMode(null)} />
              )}

              <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm">
                <span className="text-white/40">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                </span>{' '}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-primary font-bold hover:underline"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
