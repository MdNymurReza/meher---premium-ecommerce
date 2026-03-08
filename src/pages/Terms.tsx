import React from 'react';
import { motion } from 'motion/react';
import { Shield, Scale, FileText, Clock } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20 text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <Scale className="text-brand-gold" size={24} />
          <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Legal Archive</span>
        </div>
        <h1 className="text-6xl font-display font-bold uppercase tracking-tighter mb-8">Terms of Service</h1>
        <p className="text-brand-ink/40 text-[10px] font-bold uppercase tracking-[0.2em]">Last Updated: March 2026</p>
      </motion.div>

      <div className="space-y-16">
        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-brand-beige/30 rounded-xl flex items-center justify-center text-brand-gold">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">1. Acceptance of Terms</h2>
          </div>
          <p className="text-brand-ink/60 leading-relaxed font-light">
            By accessing and using the Meher Mala website, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the site signifies your acceptance of any updated terms.
          </p>
        </section>

        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-brand-beige/30 rounded-xl flex items-center justify-center text-brand-gold">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">2. Intellectual Property</h2>
          </div>
          <p className="text-brand-ink/60 leading-relaxed font-light">
            All content on this site, including text, graphics, logos, images, and software, is the property of Meher Mala and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works from any part of this site without our express written permission.
          </p>
        </section>

        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-brand-beige/30 rounded-xl flex items-center justify-center text-brand-gold">
              <Clock size={20} />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight">3. Orders and Payments</h2>
          </div>
          <p className="text-brand-ink/60 leading-relaxed font-light mb-6">
            All orders are subject to acceptance and availability. We reserve the right to refuse any order. Prices are subject to change without notice. Payments are processed securely through our chosen payment gateways.
          </p>
          <ul className="space-y-4 text-brand-ink/60 font-light list-disc pl-6">
            <li>Cash on Delivery is available for selected regions.</li>
            <li>bKash payments must include a valid Transaction ID.</li>
            <li>Shipping costs are calculated at checkout.</li>
          </ul>
        </section>

        <section className="bg-white p-12 rounded-[3rem] border border-black/5 shadow-2xl shadow-black/5">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-8">4. Limitation of Liability</h2>
          <p className="text-brand-ink/60 leading-relaxed font-light">
            Meher Mala shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability to you for any claim arising out of or relating to these terms shall not exceed the amount paid by you for the product in question.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
