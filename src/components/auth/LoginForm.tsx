'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm p-8 bg-glass border border-white/10 rounded-2xl backdrop-blur-xl">
      <h2 className="text-2xl font-semibold text-white mb-6">Welcome Back</h2>
      
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-white/50 font-medium">Email</label>
        <Input 
          type="email" 
          placeholder="your@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-accent/50 focus:ring-accent/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-white/50 font-medium">Password</label>
        <Input 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-accent/50 focus:ring-accent/20"
        />
      </div>

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-accent hover:bg-accent-hover text-black font-semibold h-12 rounded-xl transition-all duration-300 shadow-lg shadow-accent/20 mt-4"
      >
        {loading ? 'Authenticating...' : 'Sign In'}
      </Button>
    </form>
  );
}
