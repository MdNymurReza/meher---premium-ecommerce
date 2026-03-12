import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-3">Create Account</h1>
          <p className="text-brand-ink/40 text-[10px] font-bold uppercase tracking-widest">Join our inner circle for exclusive access</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-2xl border border-rose-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-brand-ink/40 mb-3">Full Name</label>
            <input 
              type="text" 
              required 
              className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all placeholder:text-brand-ink/20" 
              placeholder="YOUR NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-brand-ink/40 mb-3">Email Address</label>
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
            <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-brand-ink/40 mb-3">Password</label>
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
            {loading ? 'CREATING...' : 'JOIN NOW'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[12px] font-bold uppercase tracking-widest text-brand-ink/40">
            Already a member?{' '}
            <Link to="/login" className="text-brand-gold hover:text-brand-ink transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
