import React from 'react';
import {
  LayoutDashboard,
  SearchCheck,
  Route,
  FolderKanban,
  Landmark,
  Database,
  Bot,
  History,
  Sun,
  Moon,
  RefreshCw,
  MoreHorizontal
} from 'lucide-react';
import { NcConsultingLogo } from './Logo';
import { ThemeMode, Language } from '../i18n/translations';

interface ProductNavProps {
  theme: ThemeMode;
  language: Language;
  onSelectLanguage: (language: Language) => void;
  onToggleTheme: () => void;
  onReset: () => void;
  isDrawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onOpenAIExpert?: () => void;
  aiExpertAvailable?: boolean;
}

const desktopItems = [
  { label: 'Dashboard', icon: LayoutDashboard, comingSoon: true },
  { label: 'Новый анализ проекта', icon: SearchCheck, active: true },
  { label: 'Funding Navigator', icon: Route, comingSoon: true },
  { label: 'Проекты', icon: FolderKanban, comingSoon: true },
  { label: 'Программы', icon: Landmark, comingSoon: true },
  { label: 'База знаний', icon: Database, comingSoon: true },
  { label: 'AI Expert', icon: Bot, ai: true, comingSoon: false },
  { label: 'История', icon: History, comingSoon: true }
];

export const ProductNav: React.FC<ProductNavProps> = ({
  theme,
  language,
  onSelectLanguage,
  onToggleTheme,
  onReset,
  isDrawerOpen,
  onDrawerOpenChange,
  onOpenAIExpert,
  aiExpertAvailable = false
}) => {
  const isLight = theme === 'light';

  return (
    <>
      <aside className={`hidden lg:flex w-52 xl:w-60 shrink-0 sticky top-0 h-screen border-r flex-col justify-between z-30 ${
        isLight ? 'bg-white border-neutral-200' : 'bg-[#0D1127] border-[#1E223D]'
      }`}>
        <div className="min-h-0">
          <div className={`px-3.5 py-3 border-b ${isLight ? 'border-neutral-200' : 'border-[#1E223D]'}`}>
            <NcConsultingLogo className="h-9" theme={theme} />
          </div>

          <nav className="p-2 space-y-0.5 overflow-y-auto">
            {desktopItems.map(({ label, icon: Icon, active, ai, comingSoon }) => (
              <button
                key={label}
                type="button"
                aria-disabled={!active && label !== 'AI Expert'}
                onClick={() => {
                  if (label === 'AI Expert' && aiExpertAvailable) onOpenAIExpert?.();
                }}
                className={`relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold border transition-all ${
                  active
                    ? isLight
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-[#131938] text-[#00E5FF] border-cyan-500/30 shadow-[0_0_16px_-6px_rgba(0,229,255,0.45)]'
                    : isLight
                      ? 'text-neutral-500 border-transparent hover:bg-neutral-100'
                      : 'text-slate-400 border-transparent hover:bg-[#131938] hover:text-[#F8FAFC]'
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r bg-[#00E5FF]" />}
                <Icon className={`w-3.5 h-3.5 shrink-0 ${ai && !active ? 'text-[#8B5CFF]' : ''}`} />
                <span className="truncate">{label}</span>
                {comingSoon && <span className={`ml-auto px-1.5 py-0.5 text-[9px] rounded border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800/70 border-slate-700 text-slate-400'}`}>Скоро</span>}
                {label === 'AI Expert' && !aiExpertAvailable && <span className={`ml-auto px-1.5 py-0.5 text-[9px] rounded border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800/70 border-slate-700 text-slate-400'}`}>После анализа</span>}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />}
                {ai && <span className="ml-auto px-1.5 py-0.5 text-[8px] rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">AI</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className={`p-2.5 border-t space-y-2 ${isLight ? 'border-neutral-200 bg-neutral-50' : 'border-[#1E223D] bg-[#080A1A]/70'}`}>
          <div className={`grid grid-cols-4 gap-0.5 rounded-lg p-0.5 border text-[10px] font-bold ${
            isLight ? 'bg-white border-neutral-200' : 'bg-[#131938] border-[#1E223D]'
          }`}>
            {([
              ['ru','РУС'],['kk','ҚАЗ'],['en','ENG'],['zh','中文']
            ] as [Language,string][]).map(([code,label]) => (
              <button
                key={code}
                type="button"
                onClick={() => onSelectLanguage(code)}
                className={`px-1.5 py-1 rounded-md transition-all ${
                  language === code
                    ? isLight ? 'bg-neutral-900 text-white' : 'bg-[#00E5FF] text-[#080A1A]'
                    : isLight ? 'text-neutral-500' : 'text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 text-[11px] px-1 py-1 transition-colors ${
                isLight ? 'text-neutral-600 hover:text-neutral-950' : 'text-slate-400 hover:text-[#CBA13A]'
              }`}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-[#CBA13A]" />}
              <span>{isLight ? 'Тёмная' : 'Светлая'}</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className={`flex items-center gap-1.5 text-[11px] px-1 py-1 transition-colors ${
                isLight ? 'text-neutral-600 hover:text-neutral-950' : 'text-slate-400 hover:text-[#F8FAFC]'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Сбросить</span>
            </button>
          </div>

          <div className={`flex items-center gap-2 pt-2 border-t ${isLight ? 'border-neutral-200' : 'border-[#1E223D]'}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#2F8BFF] to-[#8B5CFF] flex items-center justify-center text-[10px] font-bold text-white">NC</div>
            <div className="min-w-0">
              <div className={`text-[11px] font-semibold truncate ${isLight ? 'text-neutral-900' : 'text-[#F8FAFC]'}`}>Инвестор / Аналитик</div>
              <div className="text-[9px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Сессия активна
              </div>
            </div>
          </div>
        </div>
      </aside>

      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5 ${
        isLight ? 'bg-white/95 border-neutral-200' : 'bg-[#0D1127]/95 border-[#1E223D]'
      }`}>
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            ['Анализ', SearchCheck, true],
            ['Проекты', FolderKanban, false],
            ['Программы', Landmark, false],
            ['AI Expert', Bot, false],
            ['Ещё', MoreHorizontal, false]
          ].map(([label, Icon, active]: any) => (
            <button
              key={label}
              type="button"
              aria-disabled={!active}
              onClick={() => { if (label === 'Ещё') onDrawerOpenChange(true); if (label === 'AI Expert' && aiExpertAvailable) onOpenAIExpert?.(); }}
              className={`min-h-[48px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
              active
                ? isLight ? 'text-neutral-950 bg-neutral-100' : 'text-[#00E5FF] bg-cyan-950/30'
                : isLight ? 'text-neutral-400' : 'text-slate-500'
            }`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => onDrawerOpenChange(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          />

          <aside className={`absolute inset-y-0 left-0 w-[86vw] max-w-[340px] border-r shadow-2xl flex flex-col ${
            isLight
              ? 'bg-[#F8FAFC] border-slate-200'
              : 'bg-[#0D1127] border-[#24304C]'
          }`}>
            <div className={`px-4 py-4 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200' : 'border-[#24304C]'
            }`}>
              <NcConsultingLogo className="h-9" theme={theme} />
              <button
                type="button"
                onClick={() => onDrawerOpenChange(false)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-[#080A1A] border-[#24304C] text-slate-300'
                }`}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className={`text-[10px] uppercase tracking-[0.16em] font-bold px-2 mb-2 ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Личный кабинет
              </div>

              <nav className="space-y-1">
                {desktopItems.map(({ label, icon: Icon, active, ai, comingSoon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (active) onDrawerOpenChange(false);
                      if (label === 'AI Expert' && aiExpertAvailable) {
                        onDrawerOpenChange(false);
                        onOpenAIExpert?.();
                      }
                    }}
                    className={`w-full min-h-[46px] flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold border transition-all ${
                      active
                        ? isLight
                          ? 'bg-white text-slate-950 border-slate-300 shadow-sm'
                          : 'bg-[#131938] text-[#00E5FF] border-cyan-500/30'
                        : isLight
                          ? 'bg-transparent text-slate-600 border-transparent hover:bg-white'
                          : 'bg-transparent text-slate-300 border-transparent hover:bg-[#131938]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${ai ? 'text-[#8B5CFF]' : ''}`} />
                    <span className="flex-1">{label}</span>
                    {comingSoon && <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800/70 border-slate-700 text-slate-400'}`}>Скоро</span>}
                    {label === 'AI Expert' && !aiExpertAvailable && <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800/70 border-slate-700 text-slate-400'}`}>После анализа</span>}
                    {active && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    {ai && <span className="text-[9px] px-1.5 py-0.5 rounded border border-violet-500/30 text-violet-300">AI</span>}
                  </button>
                ))}
              </nav>
            </div>

            <div className={`p-3 border-t space-y-3 ${
              isLight ? 'border-slate-200 bg-white/70' : 'border-[#24304C] bg-[#080A1A]/70'
            }`}>
              <div className="grid grid-cols-4 gap-1">
                {([
                  ['ru','РУС'],['kk','ҚАЗ'],['en','ENG'],['zh','中文']
                ] as [Language,string][]).map(([code,label]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onSelectLanguage(code)}
                    className={`min-h-[34px] rounded-lg text-[10px] font-bold border ${
                      language === code
                        ? isLight
                          ? 'bg-slate-950 text-white border-slate-950'
                          : 'bg-[#00E5FF] text-[#080A1A] border-[#00E5FF]'
                        : isLight
                          ? 'bg-white text-slate-500 border-slate-200'
                          : 'bg-[#0D1127] text-slate-400 border-[#24304C]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`min-h-[40px] flex-1 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700'
                      : 'bg-[#0D1127] border-[#24304C] text-slate-300'
                  }`}
                >
                  {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#CBA13A]" />}
                  {isLight ? 'Тёмная' : 'Светлая'}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className={`min-h-[40px] flex-1 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700'
                      : 'bg-[#0D1127] border-[#24304C] text-slate-300'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Сбросить
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
