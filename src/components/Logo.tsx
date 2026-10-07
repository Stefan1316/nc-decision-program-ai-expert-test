import React from 'react';
import { ThemeMode } from '../i18n/translations';

interface LogoProps {
  className?: string;
  theme?: ThemeMode;
}

export const NcConsultingLogo: React.FC<LogoProps> = ({ className = 'h-10', theme = 'neon' }) => {
  const isLight = theme === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} aria-label="NC Consulting">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
        isLight
          ? 'bg-neutral-950 border-[#CBA13A]/60'
          : 'bg-[#080A1A] border-[#CBA13A]/55 shadow-[0_0_10px_rgba(203,161,58,0.12)]'
      }`}>
        <span className="text-[#CBA13A] font-extrabold text-[11px] tracking-[-0.06em]">NC</span>
      </div>

      <div className="min-w-0 leading-none">
        <div className={`text-[12px] sm:text-[13px] font-extrabold tracking-[0.08em] uppercase whitespace-nowrap ${
          isLight ? 'text-neutral-950' : 'text-[#F4F7FF]'
        }`}>
          NC CONSULTING
        </div>
        <div className={`text-[8px] sm:text-[9px] mt-1 font-medium tracking-[0.04em] whitespace-nowrap ${
          isLight ? 'text-neutral-500' : 'text-slate-500'
        }`}>
          Decision Intelligence
        </div>
      </div>
    </div>
  );
};
