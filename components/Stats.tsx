
import React from 'react';
import { AppConfig } from '../types';

interface StatsProps {
  days: number;
  config: AppConfig;
}

const Stats: React.FC<StatsProps> = ({ days, config }) => {
  const pricePerCig = config.packPrice / 20;
  const totalSaved = days * config.cigPerDay * pricePerCig;
  const wishPercent = Math.min(100, (totalSaved / config.wishPrice) * 100);

  return (
    <div className="grid grid-cols-2 gap-4 px-6 pb-24">
      <div className="glass p-5 rounded-3xl border border-zinc-800/50">
        <span className="block text-2xl mb-2">💰</span>
        <p className="text-xl font-bold text-white">{totalSaved.toFixed(0)} DH</p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Économisés</p>
      </div>

      <div className="glass p-5 rounded-3xl border border-zinc-800/50 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-1">
             <span className="text-xs font-bold text-zinc-300 truncate pr-2">{config.wishName}</span>
             <span className="text-[10px] font-bold text-yellow-500">{wishPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-700 ease-out"
              style={{ width: `${wishPercent}%` }}
            />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Objectif</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;
