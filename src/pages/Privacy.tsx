import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, Lock, Database } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20 text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <ShieldCheck className="text-brand-gold" size={24} />
          <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Security Archive</span>
        </div>
        <h1 className="text-6xl font-display font-bold uppercase tracking-tighter mb-8">Privacy Policy</h1>
        <p className="text-brand-ink/40 text-[10px] font-bold uppercase tracking-[0.2em]">Last Updated: March 2026</p>
      </motion.div>

      <div className="space-y-16">
        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-brand-beige/30 rounded-xl flex items-center justify-center text-brand-gold">
              <Database size={20} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Data Collection</h2>
          </div>
          <p className="text-brand-ink/60 leading-relaxed font-light mb-6">
            We collect information that you provide directly to us when you create an account, place an order, or subscribe to our newsletter. This may include:
          </p>
          <ul className="space-y-4 text-brand-ink/60 font-light list-disc pl-6">
            <li>Name and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment details (processed securely)</li>
            <li>Purchase history and preferences</li>
          </ul>
        </section>

        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-brand-beige/30 rounded-xl flex items-center justify-center text-brand-gold">
              <Eye size={20} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">How We Use Your Data</h2>
          </div>
          <p className="text-brand-ink/60 leading-relaxed font-light">
            Your data is used to process orders, provide customer support, and improve our services. We may also use your contact information to send you updates about our collections and special offers, which you can opt-out of at any time. We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-brand-beige/30 rounded-xl flex items-center justify-center text-brand-gold">
              <Lock size={20} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">Data Security</h2>
          </div>
          <p className="text-brand-ink/60 leading-relaxed font-light">
            We implement industry-standard security measures to protect your personal information. This includes SSL encryption for data transmission and secure storage protocols. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-8">Your Rights</h2>
          <p className="text-brand-ink/60 leading-relaxed font-light">
            You have the right to access, correct, or delete your personal information. You can manage your account settings through your profile page or contact our support team for assistance with data-related requests.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
