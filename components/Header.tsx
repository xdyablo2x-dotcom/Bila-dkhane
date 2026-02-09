
import React from 'react';
import { LEVEL_DATA } from '../constants.ts';
import { translations } from '../translations.ts';
import { AppLanguage } from '../types.ts';

interface HeaderProps {
  xp: number;
  level: number;
  firstName: string;
  lastName: string;
  language: AppLanguage;
}

const Header: React.FC<HeaderProps> = ({ xp, level, firstName, lastName, language }) => {
  const t = translations[language] || translations.fr;
  const currentLevelData = LEVEL_DATA.find(l => l.level === level) || LEVEL_DATA[0];
  const progressPercent = ((xp - currentLevelData.minXp) / (currentLevelData.maxXp - currentLevelData.minXp)) * 100;
  const agentName = lastName ? `AGENT ${lastName.toUpperCase()}` : t.agent_elite;

  return (
    <div className="w-full px-6 pt-10 pb-4 relative z-10">
      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] mb-1">{agentName}</p>
          <h2 className="text-sm font-bold tracking-tight text-white uppercase italic">
            {currentLevelData.title} <span className="text-zinc-500 font-normal">| {t.level} {level}</span>
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{xp} XP</p>
        </div>
      </div>
      <div className="w-full h-[3px] bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="h-full clinical-gradient shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>
    </div>
  );
};

export default Header;
