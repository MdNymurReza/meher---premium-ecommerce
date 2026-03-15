import React from 'react';
import { motion } from 'motion/react';
import { Shield, Scale, FileText, Clock } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last Updated: March 2026</p>
      </motion.div>

      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing and using the Meher Mala website, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the site signifies your acceptance of any updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            All content on this site, including text, graphics, logos, images, and software, is the property of Meher Mala and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works from any part of this site without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Orders and Payments</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            All orders are subject to acceptance and availability. We reserve the right to refuse any order. Prices are subject to change without notice. Payments are processed securely through our chosen payment gateways.
          </p>
          <ul className="space-y-2 text-gray-600 list-disc pl-6">
            <li>Cash on Delivery is available for selected regions.</li>
            <li>bKash payments must include a valid Transaction ID.</li>
            <li>Shipping costs are calculated at checkout.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            Meher Mala shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability to you for any claim arising out of or relating to these terms shall not exceed the amount paid by you for the product in question.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
