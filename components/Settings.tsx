
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppConfig, AppLanguage } from '../types';
import { X, Save, User, Globe, Database, Shield, Target, Smartphone } from 'lucide-react';
import { translations } from '../translations.ts';

interface SettingsProps {
  config: AppConfig;
  firstName: string;
  lastName: string;
  onSave: (firstName: string, lastName: string, newConfig: AppConfig) => void;
  onClose: () => void;
  onReset: () => void;
  isOpen: boolean;
}

const Settings: React.FC<SettingsProps> = ({ config, firstName, lastName, onSave, onClose, onReset, isOpen }) => {
  const t = translations[config.language] || translations.fr;
  const [localConfig, setLocalConfig] = useState<AppConfig>({ ...config });
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);

  if (!isOpen) return null;

  const languages: { code: AppLanguage, label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'ar', label: 'AR' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];

  return (
    <motion.div {...({ initial: { opacity: 0, scale: 1.1 }, animate: { opacity: 1, scale: 1 } } as any)} className="fixed inset-0 z-[200] bg-[#020617]/98 backdrop-blur-3xl flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-lg min-h-full flex flex-col p-8 md:p-12">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 className="text-5xl font-black text-white font-display uppercase tracking-tighter italic leading-none">{t.global_config}</h2>
            <p className="text-emerald-500 text-[10px] uppercase tracking-[0.5em] font-black mt-4 flex items-center gap-2"><Shield size={12} /> {t.neural_security}</p>
          </div>
          <button onClick={onClose} className="p-5 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all shadow-2xl border border-white/5"><X size={28} /></button>
        </div>

        <div className="flex-1 space-y-12 pb-48">
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-emerald-500 mb-2"><Globe size={20} /><h3 className="text-[11px] font-black uppercase tracking-[0.5em]">{t.language}</h3></div>
            <div className="grid grid-cols-4 gap-3">
              {languages.map(lang => (<button key={lang.code} onClick={() => setLocalConfig({...localConfig, language: lang.code})} className={`py-5 rounded-[24px] border transition-all text-xs font-black tracking-widest ${localConfig.language === lang.code ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl' : 'bg-white/5 border-white/5 text-zinc-600'}`}>{lang.label}</button>))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-sky-500 mb-2"><Target size={20} /><h3 className="text-[11px] font-black uppercase tracking-[0.5em]">{t.target_days}</h3></div>
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/5">
                <input type="number" value={localConfig.targetDays} onChange={(e) => setLocalConfig({...localConfig, targetDays: Math.max(1, parseInt(e.target.value))})} className="w-full bg-transparent text-5xl font-black text-white outline-none border-b-2 border-white/10 focus:border-emerald-500 transition-all py-2" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-accent mb-2"><User size={20} /><h3 className="text-[11px] font-black uppercase tracking-[0.5em]">{t.identity}</h3></div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white/5 p-7 rounded-[32px] border border-white/5"><input type="text" value={localFirstName} onChange={(e) => setLocalFirstName(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white outline-none" /></div>
              <div className="bg-white/5 p-7 rounded-[32px] border border-white/5"><input type="text" value={localLastName} onChange={(e) => setLocalLastName(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white outline-none" /></div>
            </div>
          </section>

          <section className="bg-red-500/5 p-10 rounded-[48px] border border-red-500/10 space-y-6">
             <div className="flex items-center gap-3 text-red-500"><Database size={20} /><h3 className="text-[11px] font-black uppercase tracking-[0.5em]">{t.danger_zone}</h3></div>
             <button onClick={onReset} className="w-full py-5 border-2 border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.6em] rounded-[24px] hover:bg-red-500 hover:text-white transition-all">{t.format}</button>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-10 bg-[#020617]/90 backdrop-blur-3xl border-t border-white/5 flex flex-col items-center">
          <button onClick={() => onSave(localFirstName, localLastName, localConfig)} className="w-full max-w-lg clinical-gradient text-white py-7 rounded-[40px] font-black text-[14px] tracking-[0.7em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all"><Save size={24} /> {t.init_protocol}</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
