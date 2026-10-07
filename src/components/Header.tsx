import React, { useState } from 'react';
import { NcConsultingLogo } from './Logo';
import { RefreshCw, Sun, Moon, Globe, ChevronDown, Menu } from 'lucide-react';
import { ThemeMode, Language, translations } from '../i18n/translations';

interface HeaderProps {
  onReset: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: Language;
  onSelectLanguage?: (lang: Language) => void;
  onToggleLanguage?: () => void;
  onOpenMap?: () => void;
  onOpenKnowledgeBase?: () => void;
  onOpenAcceptanceTests?: () => void;
  isMapActive?: boolean;
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  theme,
  onToggleTheme,
  language,
  onSelectLanguage,
  onToggleLanguage,
  onOpenMenu
}) => {
  const t = translations[language].header;
  const isLight = theme === 'light';
  const [langOpen, setLangOpen] = useState(false);

  const languageOptions: Array<{ code: Language; label: string }> = [
    { code: 'ru', label: 'РУС' },
    { code: 'kk', label: 'ҚАЗ' },
    { code: 'en', label: 'ENG' },
    { code: 'zh', label: '中文' }
  ];

  const activeLanguage = languageOptions.find((item) => item.code === language)?.label || 'РУС';

  const selectLanguage = (code: Language) => {
    if (onSelectLanguage) onSelectLanguage(code);
    else if (onToggleLanguage) onToggleLanguage();
    setLangOpen(false);
  };

  return (
    <header className={`lg:hidden sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${
      isLight ? 'bg-white/95 border-neutral-200 shadow-sm' : 'bg-[#080A1A]/96 border-[#1E223D]'
    }`}>
      <div className="max-w-[1720px] mx-auto px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center">
          <div className="sm:hidden flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
              isLight ? 'bg-neutral-950 border-[#CBA13A]/60' : 'bg-[#080A1A] border-[#CBA13A]/55'
            }`}>
              <span className="text-[#CBA13A] font-extrabold text-[11px] tracking-[-0.06em]">NC</span>
            </div>
            <div className="min-w-0">
              <div className={`text-[11px] font-extrabold tracking-[0.06em] whitespace-nowrap ${
                isLight ? 'text-neutral-950' : 'text-[#F4F7FF]'
              }`}>
                NC DECISION
              </div>
              <div className="text-[8px] text-slate-500">Funding Navigator</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <NcConsultingLogo className="h-8 sm:h-9 shrink-0" theme={theme} />
            <div className={`h-6 w-px hidden md:block ${isLight ? 'bg-neutral-200' : 'bg-[#1E223D]'}`} />
            <div className="hidden md:flex flex-col min-w-0">
              <h1 className={`text-xs sm:text-sm font-bold tracking-tight flex items-center gap-2 truncate ${
                isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
              }`}>
                <span className="truncate">{t.systemTitle}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                  isLight
                    ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    : 'text-[#00E5FF] bg-cyan-950/60 border-cyan-500/40'
                }`}>
                  {t.badge}
                </span>
              </h1>
              <span className={`text-[11px] truncate ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                {t.systemSubtitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMenu}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
              isLight
                ? 'bg-white text-neutral-700 border-neutral-300'
                : 'bg-[#0D1127] text-slate-200 border-[#24304C]'
            }`}
            title="Открыть меню"
            aria-label="Открыть меню"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-bold transition-all ${
                isLight
                  ? 'bg-neutral-100 border-neutral-300 text-neutral-800'
                  : 'bg-[#0D1127] border-[#1E223D] text-[#F4F7FF]'
              }`}
              aria-expanded={langOpen}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className={language === 'ru' && !isLight ? 'text-[#00E5FF]' : ''}>{activeLanguage}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className={`absolute right-0 top-11 z-[70] min-w-[116px] p-1 rounded-xl border shadow-2xl ${
                isLight ? 'bg-white border-neutral-200' : 'bg-[#0D1127] border-[#1E223D]'
              }`}>
                {languageOptions.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => selectLanguage(item.code)}
                    className={`w-full px-3 py-2 rounded-lg text-left text-[11px] font-bold transition-colors ${
                      language === item.code
                        ? isLight
                          ? 'bg-neutral-900 text-white'
                          : 'bg-cyan-950/50 text-[#00E5FF]'
                        : isLight
                          ? 'text-neutral-600 hover:bg-neutral-100'
                          : 'text-slate-300 hover:bg-[#131938]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onToggleTheme}
            type="button"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
              isLight
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-[#0D1127] text-amber-300 border-amber-500/30'
            }`}
            title={t.themeTooltip}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={onReset}
            type="button"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
              isLight
                ? 'bg-white text-neutral-700 border-neutral-300'
                : 'bg-[#0D1127] text-slate-400 border-[#1E223D]'
            }`}
            title="Сбросить все введённые параметры"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
