import React from 'react';
import { ProgramMatchResult } from '../types/damu';
import { ThemeMode, Language } from '../i18n/translations';
import { ExternalLink, CheckCircle2, AlertTriangle, HelpCircle, XCircle, ShieldCheck, Banknote, Calendar, Percent, ArrowUpRight } from 'lucide-react';

interface ProgramCardProps {
  result: ProgramMatchResult;
  onOpenSourceModal?: (sourceId: string) => void;
  theme?: ThemeMode;
  language?: Language;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ 
  result, 
  onOpenSourceModal,
  theme = 'neon',
  language = 'ru'
}) => {
  const { program, status, status_label_ru, matched_reasons, restrictions, missing_inputs, sources } = result;
  const isLight = theme === 'light';
  const isKk = language === 'kk';

  // Премиальные ярлыки со свечением
  const statusConfig = {
    exact_match: {
      cardBorder: isLight 
        ? 'border-emerald-300/80 hover:border-emerald-500 hover:shadow-emerald-500/10' 
        : 'border-emerald-500/30 hover:border-emerald-400/80 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.3)]',
      badge: isLight 
        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs' 
        : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_-2px_rgba(16,185,129,0.35)]',
      dot: isLight ? 'bg-emerald-600' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      icon: <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
    },
    possible_match: {
      cardBorder: isLight 
        ? 'border-amber-300/80 hover:border-amber-500 hover:shadow-amber-500/10' 
        : 'border-purple-500/30 hover:border-purple-400/80 hover:shadow-[0_0_24px_-4px_rgba(168,85,247,0.3)]',
      badge: isLight 
        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs' 
        : 'bg-purple-950/70 text-purple-300 border-purple-500/40 shadow-[0_0_12px_-2px_rgba(168,85,247,0.35)]',
      dot: isLight ? 'bg-amber-600' : 'bg-purple-400 shadow-[0_0_8px_#c084fc]',
      icon: <HelpCircle className={`w-3.5 h-3.5 ${isLight ? 'text-amber-700' : 'text-purple-400'}`} />
    },
    needs_clarification: {
      cardBorder: isLight 
        ? 'border-sky-300/80 hover:border-sky-500 hover:shadow-sky-500/10' 
        : 'border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_24px_-4px_rgba(0,229,255,0.3)]',
      badge: isLight 
        ? 'bg-sky-50 text-sky-900 border-sky-300 shadow-xs' 
        : 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_-2px_rgba(0,229,255,0.35)]',
      dot: isLight ? 'bg-sky-600' : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
      icon: <HelpCircle className={`w-3.5 h-3.5 ${isLight ? 'text-sky-700' : 'text-cyan-400'}`} />
    },
    needs_verification: {
      cardBorder: isLight 
        ? 'border-neutral-300 hover:border-neutral-400' 
        : 'border-slate-800 hover:border-slate-600',
      badge: isLight 
        ? 'bg-neutral-100 text-neutral-800 border-neutral-300' 
        : 'bg-slate-900/80 text-slate-300 border-slate-700',
      dot: isLight ? 'bg-neutral-500' : 'bg-slate-400',
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    not_applicable: {
      cardBorder: isLight 
        ? 'border-neutral-200 opacity-75' 
        : 'border-rose-950/80 hover:border-rose-900/60 opacity-75',
      badge: isLight 
        ? 'bg-rose-50 text-rose-800 border-rose-200' 
        : 'bg-rose-950/70 text-rose-300 border-rose-500/30 shadow-[0_0_10px_-2px_rgba(244,63,94,0.25)]',
      dot: isLight ? 'bg-rose-500' : 'bg-rose-400 shadow-[0_0_8px_#fb7185]',
      icon: <XCircle className={`w-3.5 h-3.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
    }
  }[status];

  return (
    <div className={`nc-surface-card relative rounded-2xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between border ${
      isLight 
        ? 'bg-white shadow-sm hover:shadow-md' 
        : 'bg-[#060814] shadow-lg backdrop-blur-md'
    } ${statusConfig.cardBorder}`}>
      
      {/* Верхний декоративный неоновый блик в темной теме */}
      {!isLight && status === 'exact_match' && (
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
      )}
      {!isLight && status === 'possible_match' && (
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />
      )}
      {!isLight && (status === 'needs_clarification' || status === 'needs_verification') && (
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />
      )}

      <div>
        {/* Шапка карточки: Семейство, инструмент и ярлык статуса */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-3.5 border-b ${
          isLight ? 'border-neutral-100' : 'border-[#172036]'
        }`}>
          {/* Семейство программы и инструмент */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono uppercase tracking-widest font-semibold ${
              isLight ? 'text-neutral-500' : 'text-slate-400'
            }`}>
              {program.family}
            </span>
            <span className={isLight ? 'text-neutral-300' : 'text-slate-600'}>/</span>
            <span className={`text-xs font-semibold tracking-tight ${
              isLight ? 'text-sky-700' : 'text-[#00E5FF]'
            }`}>
              {program.instrument_type}
            </span>
          </div>

          {/* Премиальный ярлык статуса со светящейся точкой */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${statusConfig.badge}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusConfig.dot}`} />
            <span>{status_label_ru}</span>
          </div>
        </div>

        {/* Название программы */}
        <h3 className={`text-base sm:text-lg font-bold tracking-tight leading-snug ${
          isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
        }`}>
          {program.name_ru}
        </h3>

        {/* Назначение / Цель */}
        <p className={`text-sm mt-2 leading-relaxed ${
          isLight ? 'text-neutral-600' : 'text-slate-400'
        }`}>
          <strong className={isLight ? 'text-neutral-900 font-semibold' : 'text-slate-200 font-medium'}>
            {isKk ? 'Мақсаты: ' : 'Цель финансирования: '}
          </strong>
          {program.purpose_short || 'Уточняется в источнике'}
        </p>

        {/* Сетка финансовых метрик (Ставка, Лимит, Субсидия, Срок) */}
        <div className={`mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl border text-xs transition-all ${
          isLight 
            ? 'bg-neutral-50/80 border-neutral-200' 
            : 'bg-[#02040A]/90 border-[#172036]'
        }`}>
          {/* 1. Ставка заёмщика */}
          <div className="space-y-1">
            <span className={`text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5 ${
              isLight ? 'text-neutral-500 font-medium' : 'text-slate-400'
            }`}>
              <Percent className={`w-3 h-3 ${isLight ? 'text-sky-600' : 'text-[#00E5FF]'}`} />
              {isKk ? 'Мөлшерлеме:' : 'Ставка заёмщика:'}
            </span>
            <span className={`font-mono text-sm font-bold block ${
              isLight ? 'text-neutral-950' : 'text-[#00E5FF] text-glow-cyan'
            }`}>
              {program.borrower_rate_text || 'По банку'}
            </span>
          </div>

          {/* 2. Субсидирование */}
          <div className="space-y-1">
            <span className={`text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5 ${
              isLight ? 'text-neutral-500 font-medium' : 'text-slate-400'
            }`}>
              <Percent className={`w-3 h-3 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
              {isKk ? 'Субсидия:' : 'Субсидия:'}
            </span>
            <span className={`font-mono text-xs font-semibold block truncate ${
              isLight ? 'text-neutral-800' : 'text-purple-300'
            }`} title={program.subsidy_text || 'Без субсидирования'}>
              {program.subsidy_text || 'Без субсидирования'}
            </span>
          </div>

          {/* 3. Максимальный лимит */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className={`text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5 ${
              isLight ? 'text-neutral-500 font-medium' : 'text-slate-400'
            }`}>
              <Banknote className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              {isKk ? 'Лимит сомасы:' : 'Макс. лимит:'}
            </span>
            <span className={`font-mono text-xs font-bold block truncate ${
              isLight ? 'text-emerald-700' : 'text-emerald-300 text-glow-emerald'
            }`} title={program.amount_max_text || 'По регламенту'}>
              {program.amount_max_text || 'По регламенту'}
            </span>
          </div>

          {/* 4. Срок */}
          <div className="space-y-1">
            <span className={`text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5 ${
              isLight ? 'text-neutral-500 font-medium' : 'text-slate-400'
            }`}>
              <Calendar className="w-3 h-3 text-slate-400" />
              {isKk ? 'Мерзімі:' : 'Срок:'}
            </span>
            <span className={`font-mono text-xs block ${isLight ? 'text-neutral-800' : 'text-slate-300'}`}>
              {program.term_text || 'Не указано'}
            </span>
          </div>

          {/* 5. Гарантия Фонда Даму */}
          <div className="space-y-1 col-span-2">
            <span className={`text-[11px] uppercase tracking-wider font-mono flex items-center gap-1.5 ${
              isLight ? 'text-neutral-500 font-medium' : 'text-slate-400'
            }`}>
              <ShieldCheck className={`w-3 h-3 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              {isKk ? 'Кепілдік:' : 'Гарантирование Даму:'}
            </span>
            <span className={`block text-xs leading-snug ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
              {program.guarantee_text ? program.guarantee_text : 'По условиям банка-партнера'}
              {program.commission_text && (
                <span className={`block text-[11px] font-mono mt-0.5 ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                  Комиссия: {program.commission_text}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Список обоснований и ограничений */}
        <div className="mt-4 space-y-2 text-xs">
          {matched_reasons.length > 0 && (
            <div className="space-y-1.5">
              <div className={`text-xs font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Почему система показывает эту программу
              </div>
              {matched_reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-xs font-mono font-bold shrink-0 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>✓</span>
                  <span className={`text-xs leading-relaxed ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>{r}</span>
                </div>
              ))}
            </div>
          )}

          {restrictions.length > 0 && (
            <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-neutral-100' : 'border-[#172036]'}`}>
              <div className={`text-xs font-bold mb-2 ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>
                Ограничения и причины несоответствия
              </div>
              {restrictions.map((res, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`text-xs font-mono font-bold shrink-0 mt-0.5 ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>✕</span>
                  <span className={`text-xs leading-relaxed ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>{res}</span>
                </div>
              ))}
            </div>
          )}

          {/* Параметры для точной фиксации условий */}
          {status !== 'not_applicable' && missing_inputs.length > 0 && (
            <div className={`mt-3 p-3 rounded-xl border text-xs ${
              isLight 
                ? 'bg-purple-50/70 border-purple-200 text-purple-950' 
                : 'bg-purple-950/30 border-purple-500/20 text-slate-300'
            }`}>
              <span className={`text-[11px] font-mono uppercase tracking-wider font-bold block mb-1.5 ${
                isLight ? 'text-purple-800' : 'text-purple-400'
              }`}>
                {isKk ? 'Келесі қадамдар:' : 'Что нужно сделать дальше:'}
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {missing_inputs.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="leading-snug">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Футер карточки: Источники и дата верификации */}
      <div className={`mt-5 pt-3.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
        isLight ? 'border-neutral-100 text-neutral-500' : 'border-[#172036] text-slate-400'
      }`}>
        <div className="flex items-center gap-2">
          <span>Проверено: {program.last_checked}</span>
          <span className={isLight ? 'text-neutral-300' : 'text-slate-700'}>·</span>
          <span>Качество: <strong className={`uppercase ${isLight ? 'text-neutral-900' : 'text-slate-200'}`}>{program.data_quality}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {sources.map((s) => (
            <a
              key={s.source_id}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className={`inline-flex items-center gap-1 text-xs font-bold transition-all ${
                isLight 
                  ? 'text-sky-700 hover:text-sky-900' 
                  : 'text-[#00E5FF] hover:text-white hover:drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]'
              }`}
              title={`${s.title_ru} (${s.source_id})`}
            >
              <span className="max-w-[220px] truncate">Источник: {s.title_ru || s.source_id}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
