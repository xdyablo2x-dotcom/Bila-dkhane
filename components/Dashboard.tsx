
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppConfig, DailyMission } from '../types.ts';
import { analyzeCraving, generateAppHeroImage, getDailyWisdom } from '../services/geminiService.ts';
import { 
  Activity, Zap, Sparkles, TrendingUp, Award, 
  Target, Clock, ShieldAlert, RefreshCw, Cpu, Brain
} from 'lucide-react';
import { translations } from '../translations.ts';

interface DashboardProps {
  days: number;
  xp: number;
  config: AppConfig;
  mission: DailyMission;
  wishImageUrl?: string;
  onCheckIn: () => void;
  onLogCraving: (advice: string) => void;
  onLogMood: (value: number) => void;
  onGenerateVision: () => void;
  alreadyCheckedIn: boolean;
  lastMoodValue?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  days, config, wishImageUrl, onCheckIn, onLogCraving, onLogMood, onGenerateVision, alreadyCheckedIn, lastMoodValue
}) => {
  const t = translations[config.language] || translations.fr;
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [wisdom, setWisdom] = useState<string>(t.initializing);
  const [isSOSActive, setIsSOSActive] = useState(false);

  useEffect(() => {
    generateAppHeroImage().then(url => setHeroUrl(url));
    getDailyWisdom(days, config.targetDays, config.language).then(w => setWisdom(w));
  }, [days, config.language, config.targetDays]);

  const totalSaved = days * config.cigPerDay * (config.packPrice / 20);
  const progressPercent = Math.min(100, (days / config.targetDays) * 100);
  const timeRemaining = Math.max(0, config.targetDays - days);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar px-6 pt-6 pb-32 space-y-10 relative z-10">
      
      <div className="glass-panel rounded-[48px] overflow-hidden relative shadow-2xl border-white/10">
        <div className="aspect-[21/9] w-full relative">
          {heroUrl ? <img src={heroUrl} className="w-full h-full object-cover opacity-20 mix-blend-screen" alt="Hub" /> : <div className="w-full h-full bg-slate-900/40 flex items-center justify-center animate-pulse"><Cpu className="text-emerald-500/10" size={48} /></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
          <div className="absolute top-6 left-8 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.5em]">{t.quantum_sync}</span>
          </div>
          <div className="absolute bottom-6 left-8">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{t.mission_hub}</h2>
          </div>
        </div>
      </div>

      <motion.div {...({ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } } as any)} className="glass-panel p-6 rounded-[32px] border-l-4 border-emerald-500 bg-emerald-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.neural_order}</span>
        </div>
        <p className="text-sm font-semibold text-slate-200 leading-relaxed italic">"{wisdom}"</p>
      </motion.div>

      <div className="flex flex-col items-center justify-center py-6 relative">
        <div className="relative z-20">
          <svg className="w-72 h-72 -rotate-90">
            <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
            <motion.circle cx="50%" cy="50%" r="45%" stroke="url(#q-grad)" strokeWidth="14" fill="transparent" strokeDasharray="283" {...({ animate: { strokeDashoffset: 283 - (progressPercent / 100) * 283 }, transition: { duration: 4, ease: "circOut" } } as any)} strokeLinecap="round" className="drop-shadow-[0_0_35px_rgba(16,185,129,0.4)]" />
            <defs><linearGradient id="q-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div {...({ animate: { scale: [1, 1.03, 1] }, transition: { duration: 5, repeat: Infinity } } as any)} className="text-center">
              <span className="text-[84px] font-black text-white tracking-tighter block leading-none">{days}</span>
              <span className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.6em] mt-3">{t.elite_days}</span>
            </motion.div>
          </div>
        </div>
        <div className="absolute w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel p-7 rounded-[36px] border-l-4 border-emerald-500">
          <TrendingUp size={18} className="text-emerald-400 mb-4" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t.wealth_saved}</p>
          <p className="text-3xl font-black text-white">{totalSaved.toFixed(0)} <span className="text-xs text-zinc-600">DH</span></p>
        </div>
        <div className="glass-panel p-7 rounded-[36px] border-l-4 border-accent">
          <Clock size={18} className="text-accent mb-4" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{t.victory_path}</p>
          <p className="text-3xl font-black text-white">{timeRemaining} <span className="text-xs text-zinc-600">{t.days}</span></p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2 px-2"><Activity size={14} className="text-emerald-500" /><span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">{t.mood_scan}</span></div>
        <div className="glass-panel rounded-[32px] p-2.5 flex gap-2">
          {[1,2,3,4,5].map(v => (
            <button key={v} onClick={() => onLogMood(v)} className={`flex-1 py-5 rounded-[20px] flex items-center justify-center transition-all duration-700 ${lastMoodValue === v ? 'bg-emerald-500 text-black shadow-emerald-500/40 shadow-2xl scale-110' : 'hover:bg-white/5 text-zinc-500'}`}><span className="text-xl font-black italic">{v}</span></button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-[56px] overflow-hidden aspect-video relative group shadow-2xl border-white/5">
        {wishImageUrl ? <img src={wishImageUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[4000ms]" alt="Goal" /> : <div className="w-full h-full bg-slate-900/60 flex flex-col items-center justify-center p-12 text-center"><Award className="text-emerald-500/20 mb-4 animate-pulse" size={64} /><p className="text-[12px] text-zinc-500 font-black uppercase tracking-[0.6em]">Awaiting Reward Synthesis...</p></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-black/10 to-transparent p-12 flex flex-col justify-end">
          <div className="flex justify-between items-end">
            <div><p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.5em] mb-2">{t.neural_target}</p><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{config.wishName}</h3></div>
            <button onClick={onGenerateVision} className="p-5 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"><RefreshCw size={24} /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 pt-6">
        <button onClick={onCheckIn} disabled={alreadyCheckedIn} className={`w-full py-8 rounded-[40px] font-black text-[16px] tracking-[0.6em] transition-all shadow-2xl relative overflow-hidden group ${alreadyCheckedIn ? 'bg-zinc-900 text-zinc-700' : 'clinical-gradient text-white active:scale-95'}`}>{alreadyCheckedIn ? t.mission_logged : <span className="flex items-center justify-center gap-4"><Zap size={22} fill="currentColor" /> {t.validate_24h}</span>}</button>
        <button onClick={() => setIsSOSActive(true)} className="w-full py-5 bg-red-600/10 rounded-[28px] text-red-500 text-[11px] font-black uppercase tracking-[0.5em] border border-red-500/20 active:bg-red-500/30 transition-all flex items-center justify-center gap-3"><ShieldAlert size={18} /> {t.sos_shield}</button>
      </div>

      <AnimatePresence>
        {isSOSActive && (
          <motion.div {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)} className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-10">
            <div className="w-full max-w-sm space-y-12">
              <div className="text-center">
                <div className="w-28 h-28 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_80px_rgba(239,68,68,0.2)]"><ShieldAlert size={56} className="text-red-500 animate-pulse" /></div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">{t.threat_detection}</h2>
              </div>
              <div className="grid grid-cols-1 gap-5">
                {['Stress', 'Pressure', 'Habit', 'Fatigue'].map(trigger => (
                  <button key={trigger} onClick={async () => { const advice = await analyzeCraving(trigger, 5, config.language); onLogCraving(advice); setIsSOSActive(false); }} className="p-8 bg-white/5 border border-white/10 rounded-[40px] text-sm font-black text-white uppercase tracking-[0.5em] hover:bg-emerald-500 hover:text-black transition-all text-center">{trigger}</button>
                ))}
              </div>
              <button onClick={() => setIsSOSActive(false)} className="w-full py-4 text-zinc-700 font-black text-[12px] uppercase tracking-[0.7em] text-center">{t.abort}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
