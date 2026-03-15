import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, Lock, Database } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Last Updated: March 2026</p>
      </motion.div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-bold mb-4">Data Collection</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We collect information that you provide directly to us when you create an account, place an order, or subscribe to our newsletter. This may include:
          </p>
          <ul className="space-y-2 text-gray-600 list-disc pl-6">
            <li>Name and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment details (processed securely)</li>
            <li>Purchase history and preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">How We Use Your Data</h2>
          <p className="text-gray-600 leading-relaxed">
            Your data is used to process orders, provide customer support, and improve our services. We may also use your contact information to send you updates about our collections and special offers, which you can opt-out of at any time. We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Data Security</h2>
          <p className="text-gray-600 leading-relaxed">
            We implement industry-standard security measures to protect your personal information. This includes SSL encryption for data transmission and secure storage protocols. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to access, correct, or delete your personal information. You can manage your account settings through your profile page or contact our support team for assistance with data-related requests.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
