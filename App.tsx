
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import HealthTab from './components/HealthTab.tsx';
import HealthCoachLive from './components/HealthCoachLive.tsx';
import AnatomyScan from './components/AnatomyScan.tsx';
import Settings from './components/Settings.tsx';
import Background3D from './components/Background3D.tsx';
import { AppState } from './types.ts';
import { STORAGE_KEY, LEVEL_DATA } from './constants.ts';
import { generateWishImage } from './services/geminiService.ts';
import { notificationService } from './services/notificationService.ts';
import { LayoutDashboard, HeartPulse, Mic2, Settings as SettingsIcon, User } from 'lucide-react';
import { translations } from './translations.ts';

const INITIAL_STATE: AppState = {
  firstName: '',
  lastName: '',
  days: 0,
  xp: 0,
  level: 1,
  config: { 
    cigPerDay: 10, 
    packPrice: 35, 
    wishName: 'Objectif Elite', 
    wishPrice: 5000,
    language: 'fr',
    targetDays: 30 
  },
  lastCheckIn: null,
  checkInHistory: [],
  lifeMinutesGained: 0,
  streak: 0,
  longestStreak: 0,
  cravingLogs: [],
  moodLogs: [],
  currentMission: { id: 'm1', task: 'Remplir votre profil', completed: false, xpReward: 30 },
  wishImageUrl: undefined
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'home' | 'health' | 'anatomy' | 'coach'>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = translations[state.config.language] || translations.fr;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsed }));
      } catch (e) { console.error("Load error", e); }
    }
    notificationService.requestPermission();
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const handleCheckIn = useCallback(() => {
    const today = new Date().toDateString();
    if (state.lastCheckIn === today) return;
    setState(prev => {
      const newDays = prev.days + 1;
      const newXp = prev.xp + 50;
      let newLevel = prev.level;
      if (newXp >= 100 && newXp < 300) newLevel = 2;
      else if (newXp >= 300 && newXp < 1000) newLevel = 3;
      else if (newXp >= 1000) newLevel = 4;
      if (newLevel > prev.level) notificationService.notifyLevelUp(newLevel, LEVEL_DATA.find(l => l.level === newLevel)?.title || '');
      return { ...prev, days: newDays, xp: newXp, level: newLevel, lastCheckIn: today, streak: prev.streak + 1, longestStreak: Math.max(prev.longestStreak, prev.streak + 1), checkInHistory: [...prev.checkInHistory, Date.now()] };
    });
  }, [state.lastCheckIn, state.streak]);

  const handleGenerateVision = async () => {
    setLoading(true);
    const url = await generateWishImage(state.config.wishName);
    if (url) setState(prev => ({ ...prev, wishImageUrl: url }));
    setLoading(false);
  };

  return (
    <div className="flex justify-center bg-black h-[100dvh] w-full overflow-hidden relative font-sans text-white">
      <Background3D />
      <div className="app-container border-x border-white/5 shadow-2xl overflow-hidden flex flex-col">
        <Header xp={state.xp} level={state.level} firstName={state.firstName} lastName={state.lastName} language={state.config.language} />
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} {...({ initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.02 }, transition: { duration: 0.4, ease: "anticipate" } } as any)} className="flex-1 flex flex-col overflow-hidden">
              {activeTab === 'home' && <Dashboard days={state.days} xp={state.xp} config={state.config} mission={state.currentMission} wishImageUrl={state.wishImageUrl} onCheckIn={handleCheckIn} onLogCraving={(adv) => alert(adv)} onLogMood={(v) => setState(prev => ({...prev, moodLogs: [{timestamp: Date.now(), value: v}, ...prev.moodLogs]}))} onGenerateVision={handleGenerateVision} alreadyCheckedIn={state.lastCheckIn === new Date().toDateString()} lastMoodValue={state.moodLogs[0]?.value} />}
              {activeTab === 'health' && <HealthTab state={state} />}
              {activeTab === 'anatomy' && <AnatomyScan language={state.config.language} daysClean={state.days} />}
              {activeTab === 'coach' && <HealthCoachLive daysClean={state.days} firstName={state.firstName || "Elite"} language={state.config.language} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <nav className="h-[96px] flex items-center justify-around border-t border-white/5 bg-slate-950/90 backdrop-blur-3xl px-6 relative z-50">
          <NavBtn active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={24} />} label={t.command} />
          <NavBtn active={activeTab === 'health'} onClick={() => setActiveTab('health')} icon={<HeartPulse size={24} />} label={t.biometric} />
          <NavBtn active={activeTab === 'anatomy'} onClick={() => setActiveTab('anatomy')} icon={<User size={24} />} label={t.anatomy} />
          <NavBtn active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} icon={<Mic2 size={24} />} label={t.strategist} />
          <NavBtn active={false} onClick={() => setIsSettingsOpen(true)} icon={<SettingsIcon size={24} />} label={t.system} />
        </nav>
        <Settings isOpen={isSettingsOpen} config={state.config} firstName={state.firstName} lastName={state.lastName} onSave={(fn, ln, conf) => { setState(prev => ({ ...prev, firstName: fn, lastName: ln, config: conf })); setIsSettingsOpen(false); }} onClose={() => setIsSettingsOpen(false)} onReset={() => { localStorage.clear(); window.location.reload(); }} />
      </div>
      {loading && <div className="fixed inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center p-12 text-center backdrop-blur-2xl"><div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-10 shadow-[0_0_50px_rgba(16,185,129,0.5)]" /><p className="text-sm font-black text-emerald-500 uppercase tracking-[1em] animate-pulse">Quantum Synthesis...</p></div>}
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-2 flex-1 h-full justify-center transition-all ${active ? 'text-emerald-400' : 'text-zinc-600'}`}>
    <div className={`p-3 rounded-2xl transition-all duration-700 ${active ? 'bg-emerald-500/10 scale-125 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'opacity-40 grayscale'}`}>{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-[0.3em] truncate w-full text-center">{label}</span>
  </button>
);

export default App;
