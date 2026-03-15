import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SiteSettings } from '../../types';
import { Save, RefreshCw, Image as ImageIcon, Type, Layout, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    heroImage: 'https://picsum.photos/seed/luxury-vibe/1200/1600',
    heroHeading: 'Meher Mala',
    heroSubheading: 'A sanctuary of timeless elegance. Handcrafted jewellery and premium apparel for the discerning soul.',
    marqueeText: ['Handcrafted Excellence', 'Premium Materials', 'Timeless Design'],
    brandStoryImage: 'https://picsum.photos/seed/craft/1000/1250',
    updatedAt: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marqueeInput, setMarqueeInput] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'site');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings(data);
        setMarqueeInput(data.marqueeText.join(', '));
      } else {
        setMarqueeInput(settings.marqueeText.join(', '));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        marqueeText: marqueeInput.split(',').map(s => s.trim()).filter(s => s),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'settings', 'site'), updatedSettings);
      setSettings(updatedSettings);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-brand-beige/30 min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-16 flex items-center justify-center">
          <RefreshCw className="animate-spin text-brand-gold" size={48} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-ink text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            Save Changes
          </button>
        </header>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero Section Settings */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Layout size={20} className="text-gray-400" />
                <h2 className="text-lg font-bold">Hero Section</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Hero Heading</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={settings.heroHeading}
                    onChange={e => setSettings({...settings, heroHeading: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Hero Subheading</label>
                  <textarea 
                    rows={4}
                    className="input-field resize-none" 
                    value={settings.heroSubheading}
                    onChange={e => setSettings({...settings, heroSubheading: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Hero Image URL</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={settings.heroImage}
                    onChange={e => setSettings({...settings, heroImage: e.target.value})}
                  />
                  {settings.heroImage && (
                    <div className="mt-4 aspect-video rounded-lg overflow-hidden border border-gray-100">
                      <img src={settings.heroImage} alt="Hero Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={20} className="text-gray-400" />
                <h2 className="text-lg font-bold">Marquee Content</h2>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Marquee Phrases (Comma Separated)</label>
                <textarea 
                  rows={3}
                  className="input-field resize-none" 
                  value={marqueeInput}
                  onChange={e => setMarqueeInput(e.target.value)}
                  placeholder="Handcrafted Excellence, Premium Materials, Timeless Design"
                />
                <p className="mt-2 text-[10px] text-gray-400 italic">These phrases will scroll across the home page.</p>
              </div>
            </div>
          </div>

          {/* Brand Story Settings */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon size={20} className="text-gray-400" />
                <h2 className="text-lg font-bold">Brand Story</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Story Image URL</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={settings.brandStoryImage}
                    onChange={e => setSettings({...settings, brandStoryImage: e.target.value})}
                  />
                  {settings.brandStoryImage && (
                    <div className="mt-4 aspect-[4/5] rounded-lg overflow-hidden border border-gray-100 max-w-xs">
                      <img src={settings.brandStoryImage} alt="Story Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-brand-ink rounded-xl p-8 text-white shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Quick Guide</h3>
              <ul className="space-y-3 text-xs text-gray-400 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-white font-bold">01</span>
                  Use high-quality image URLs for the best visual impact.
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-bold">02</span>
                  Hero headings should be short and impactful.
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-bold">03</span>
                  Separate marquee phrases with commas.
                </li>
                <li className="flex gap-2">
                  <span className="text-white font-bold">04</span>
                  Remember to save changes to apply updates.
                </li>
              </ul>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminSettings;
