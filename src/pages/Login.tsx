import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-brand-beige/20">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl shadow-black/5 border border-black/5"
      >
        <div className="text-center mb-12">
          <div className="flex flex-col items-center mb-8">
            <span className="text-4xl font-display font-bold tracking-tighter text-brand-ink leading-none">MEHER</span>
            <span className="text-[10px] font-bold tracking-[0.5em] text-brand-gold uppercase mt-2">Mala</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-3">Welcome Back</h1>
          <p className="text-brand-ink/40 text-[10px] font-bold uppercase tracking-widest">Enter your credentials to access MEHER-MALA</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 text-rose-600 text-[15px] font-bold uppercase tracking-widest rounded-2xl border border-rose-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[15px] font-bold uppercase tracking-[0.1em] text-brand-ink/40 mb-3">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-ink/20" 
              placeholder="NAME@EXAMPLE.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[15px] font-bold uppercase tracking-[0.1em] text-brand-ink/40 mb-3">Password</label>
            <input 
              type="password" 
              required 
              className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-ink/20" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full premium-button-primary h-16 text-sm tracking-[0.2em]"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">
            New to Meher?{' '}
            <Link to="/register" className="text-brand-gold hover:text-brand-ink transition-colors">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
