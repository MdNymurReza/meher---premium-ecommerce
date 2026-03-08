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
    <div className="flex bg-brand-beige/30 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-16">
        <header className="mb-20">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-brand-gold font-bold tracking-[0.3em] uppercase text-xs">Configuration</span>
            <div className="h-px flex-grow bg-black/5"></div>
          </div>
          <div className="flex justify-between items-end">
            <h1 className="text-6xl font-display font-bold uppercase tracking-tighter">Site Settings</h1>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="premium-button-primary flex items-center gap-3 px-12 h-16 text-[10px] tracking-[0.2em] disabled:opacity-50"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
              SAVE CHANGES
            </button>
          </div>
        </header>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Hero Section Settings */}
          <div className="space-y-12">
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-black/5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <Layout size={20} />
                </div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Hero Section</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Hero Heading</label>
                  <input 
                    type="text" 
                    className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                    value={settings.heroHeading}
                    onChange={e => setSettings({...settings, heroHeading: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Hero Subheading</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all resize-none" 
                    value={settings.heroSubheading}
                    onChange={e => setSettings({...settings, heroSubheading: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Hero Image URL</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      className="flex-grow bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                      value={settings.heroImage}
                      onChange={e => setSettings({...settings, heroImage: e.target.value})}
                    />
                  </div>
                  {settings.heroImage && (
                    <div className="mt-6 aspect-video rounded-3xl overflow-hidden border border-black/5">
                      <img src={settings.heroImage} alt="Hero Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-black/5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Marquee Content</h2>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Marquee Phrases (Comma Separated)</label>
                <textarea 
                  rows={3}
                  className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all resize-none" 
                  value={marqueeInput}
                  onChange={e => setMarqueeInput(e.target.value)}
                  placeholder="Handcrafted Excellence, Premium Materials, Timeless Design"
                />
                <p className="mt-4 text-[10px] text-brand-ink/30 italic">These phrases will scroll across the home page.</p>
              </div>
            </div>
          </div>

          {/* Brand Story Settings */}
          <div className="space-y-12">
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-black/5 border border-black/5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <ImageIcon size={20} />
                </div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-tight">Brand Story</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-ink/40 mb-3">Story Image URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-brand-beige/20 border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-brand-gold/20 outline-none transition-all" 
                    value={settings.brandStoryImage}
                    onChange={e => setSettings({...settings, brandStoryImage: e.target.value})}
                  />
                  {settings.brandStoryImage && (
                    <div className="mt-6 aspect-[4/5] rounded-3xl overflow-hidden border border-black/5 max-w-xs mx-auto">
                      <img src={settings.brandStoryImage} alt="Story Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-brand-ink rounded-[3rem] p-12 text-white shadow-2xl shadow-black/20">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-6">Quick Guide</h3>
              <ul className="space-y-4 text-xs text-white/60 font-light leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-brand-gold font-bold">01</span>
                  Use high-quality image URLs (Cloudinary, Imgur, etc.) for the best visual impact.
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-gold font-bold">02</span>
                  Hero headings should be short and impactful (2-3 words).
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-gold font-bold">03</span>
                  Separate marquee phrases with commas to create a continuous flow.
                </li>
                <li className="flex gap-3">
                  <span className="text-brand-gold font-bold">04</span>
                  Remember to click "Save Changes" to apply updates to the live site.
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
