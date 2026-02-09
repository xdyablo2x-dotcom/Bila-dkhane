
import React from 'react';
import { motion } from 'framer-motion';
import { HEALTH_MILESTONES } from '../constants';
import { AppState } from '../types';
import { TrendingUp, Activity, Zap, ShieldAlert } from 'lucide-react';
import { translations } from '../translations.ts';

interface HealthTabProps {
  state: AppState;
}

const HealthTab: React.FC<HealthTabProps> = ({ state }) => {
  const { days, checkInHistory, config } = state;
  const t = translations[config.language] || translations.fr;
  const pricePerCig = config.packPrice / 20;
  const totalSaved = days * config.cigPerDay * pricePerCig;

  const completedMilestones = HEALTH_MILESTONES.filter(m => days >= m.daysRequired).length;
  const regenerationScore = Math.min(100, (completedMilestones / HEALTH_MILESTONES.length) * 100);

  const renderPrecisionGraph = () => {
    const points = checkInHistory.slice(-10).map((ts, i) => {
      const x = (i / 9) * 300;
      const val = Math.log10(i + 1 + days) * 40;
      return `${x},${100 - val}`;
    }).join(' ');

    return (
      <div className="relative h-40 w-full bg-zinc-950/50 rounded-2xl border border-white/5 overflow-hidden p-4">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{backgroundImage: 'radial-gradient(#10b981 0.5px, transparent 0.5px)', backgroundSize: '10px 10px'}} />
        <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
          <motion.polyline
            fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            points={points}
            {...({ initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 2 } } as any)}
          />
          {checkInHistory.slice(-10).map((_, i) => (
            <circle key={i} cx={(i / 9) * 300} cy={100 - (Math.log10(i + 1 + days) * 40)} r="2" fill="#10b981" />
          ))}
        </svg>
        <div className="absolute bottom-2 left-4 text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
          {t.bio_trends}
        </div>
      </div>
    );
  };

  return (
    <motion.div {...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)} className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32 space-y-8 relative">
      <header className="flex justify-between items-start z-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">{t.protocol_data}</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{t.systemic_analysis}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded text-emerald-500 text-[10px] font-bold">
          {t.status_excellent}
        </div>
      </header>

      <section className="glass-panel rounded-3xl p-6 flex items-center gap-6 z-10">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="40%" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
            <motion.circle 
              cx="50%" cy="50%" r="40%" stroke="#10b981" strokeWidth="4" fill="transparent"
              strokeDasharray="100 100"
              {...({ animate: { strokeDashoffset: 100 - regenerationScore }, transition: { duration: 1.5 } } as any)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl text-white">
            {regenerationScore.toFixed(0)}%
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1">{t.recovery_index}</h3>
          <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">{t.recovery_desc}</p>
        </div>
      </section>

      <section className="space-y-3 z-10">
        <div className="flex items-center gap-2 pl-1">
          <TrendingUp size={14} className="text-emerald-500" />
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.bio_trends}</h3>
        </div>
        {renderPrecisionGraph()}
      </section>

      <div className="grid grid-cols-2 gap-4 z-10">
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{t.total_saved}</p>
          <p className="text-2xl font-display font-bold text-white">{totalSaved.toFixed(0)} <span className="text-xs text-zinc-500">DH</span></p>
        </div>
        <div className="glass-panel p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{t.record_streak}</p>
          <p className="text-2xl font-display font-bold text-white">{state.longestStreak} <span className="text-xs text-zinc-500">{t.days.charAt(0)}</span></p>
        </div>
      </div>

      <section className="space-y-3 z-10">
        <div className="flex items-center gap-2 pl-1">
          <Activity size={14} className="text-rose-500" />
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.physio_markers}</h3>
        </div>
        {HEALTH_MILESTONES.map((m, idx) => {
          const isComplete = days >= m.daysRequired;
          return (
            <div key={m.id} className={`glass-panel p-4 rounded-xl flex items-center gap-4 transition-all ${isComplete ? 'border-emerald-500/30' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
                {isComplete ? <Zap size={14} /> : <ShieldAlert size={14} />}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white">{m.label}</h4>
                <p className="text-[9px] text-zinc-500 mt-0.5">{m.description}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-white">{isComplete ? t.done : `${m.daysRequired}${t.days.charAt(0)}`}</p>
              </div>
            </div>
          );
        })}
      </section>
    </motion.div>
  );
};

export default HealthTab;
