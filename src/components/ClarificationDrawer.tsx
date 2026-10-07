import React from 'react';
import { UserQuery } from '../types/damu';
import { SlidersHorizontal, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ClarificationDrawerProps {
  query: UserQuery;
  onChange: (updated: Partial<UserQuery>) => void;
  identifiedFields: string[];
  isOpen: boolean;
  onToggle: () => void;
  onResetClarifications: () => void;
}

export const ClarificationDrawer: React.FC<ClarificationDrawerProps> = ({
  query,
  onChange,
  identifiedFields,
  isOpen,
  onToggle,
  onResetClarifications
}) => {
  const activeFiltersCount = [
    query.entity_type,
    query.purpose,
    query.amount_kzt,
    query.operating_years !== undefined && query.operating_years !== null,
    query.social_enterprise_registry !== undefined && query.social_enterprise_registry !== null,
    query.tax_arrears !== undefined && query.tax_arrears !== null,
    query.overdue_debt_days !== undefined && query.overdue_debt_days !== null
  ].filter(Boolean).length;

  return (
    <div className="border border-[#8B5CFF]/30 rounded-xl bg-[#17113D]/70 overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div 
        onClick={onToggle}
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#201850]/50 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-4 h-4 text-[#8B5CFF]" />
          <div>
            <span className="text-xs font-semibold text-[#F4F7FF] flex items-center gap-2">
              Шаг 2: Уточнение параметров применимости
              {activeFiltersCount > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-[#8B5CFF]/20 text-[#00E5FF] border border-[#8B5CFF]/40">
                  {activeFiltersCount} заполнено
                </span>
              )}
            </span>
            <span className="text-[11px] text-[#94A3B8]">
              Заполняется по желанию для перехода от предварительного подбора к точному заключению
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResetClarifications();
              }}
              className="text-[11px] text-[#FF3FD8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              Очистить шаг 2
            </button>
          )}

          <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-1 rounded border border-[#00E5FF]/20">
            {isOpen ? 'Скрыть опросник ▲' : 'Развернуть опросник ▼'}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="p-5 border-t border-[#2A2360] bg-[#080A1A]/60 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Форма заявителя */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium flex items-center gap-1">
              Форма бизнеса:
            </label>
            <select
              value={query.entity_type || ''}
              onChange={(e) => onChange({ entity_type: e.target.value as any })}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] focus:border-[#8B5CFF] focus:outline-none"
            >
              <option value="">Не знаю / нужно проверить</option>
              <option value="ИП">ИП (Индивидуальный предприниматель)</option>
              <option value="ТОО">ТОО (Товарищество с огр. ответственностью)</option>
              <option value="Сельхозкооператив">Сельскохозяйственный кооператив</option>
              <option value="Юрлицо МФЦА">Юридическое лицо МФЦА</option>
            </select>
          </div>

          {/* 2. Цель финансирования */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium flex items-center gap-1">
              Цель финансирования:
            </label>
            <select
              value={query.purpose || ''}
              onChange={(e) => onChange({ purpose: e.target.value as any })}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] focus:border-[#8B5CFF] focus:outline-none"
            >
              <option value="">Не знаю / нужно проверить</option>
              <option value="Инвестиции">Инвестиции (приобретение оборудования, стройка)</option>
              <option value="Оборотные средства">Пополнение оборотных средств (сырье, товары)</option>
              <option value="Рефинансирование">Рефинансирование действующего кредита</option>
              <option value="Лизинг">Финансовый лизинг оборудования/техники</option>
            </select>
          </div>

          {/* 3. Сумма в млн тенге */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium flex items-center justify-between">
              <span>Сумма (млн тг):</span>
              {query.amount_kzt ? (
                <span className="text-[#00E5FF] font-mono">{(query.amount_kzt / 1e6).toLocaleString('ru-RU')} млн тг</span>
              ) : null}
            </label>
            <input
              type="number"
              placeholder="например, 150"
              value={query.amount_kzt ? query.amount_kzt / 1e6 : ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChange({ amount_kzt: isNaN(val) ? null : val * 1e6 });
              }}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] font-mono focus:border-[#8B5CFF] focus:outline-none"
            />
          </div>

          {/* 4. Стаж бизнеса (полных лет) */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium">
              Стаж бизнеса (полных лет):
            </label>
            <select
              value={query.operating_years !== undefined && query.operating_years !== null ? query.operating_years.toString() : ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ 
                  operating_years: val === '' ? null : parseInt(val, 10),
                  business_status: val === '0' ? 'новый' : 'действующий'
                });
              }}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] focus:border-[#8B5CFF] focus:outline-none"
            >
              <option value="">Не знаю / нужно проверить</option>
              <option value="0">Новый бизнес (стартап &lt; 1 года)</option>
              <option value="1">1 полный год (подходит под лизинг)</option>
              <option value="2">2 года</option>
              <option value="3">3+ года (действующий бизнес)</option>
            </select>
          </div>

          {/* 5. Реестр социального предпринимательства */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium">
              Реестр социального предпринимательства:
            </label>
            <select
              value={query.social_enterprise_registry === true ? 'true' : query.social_enterprise_registry === false ? 'false' : ''}
              onChange={(e) => {
                const v = e.target.value;
                onChange({ social_enterprise_registry: v === 'true' ? true : v === 'false' ? false : null });
              }}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] focus:border-[#8B5CFF] focus:outline-none"
            >
              <option value="">Не указано / Не состоит</option>
              <option value="true">Да, включён в Реестр соц. предпринимательства</option>
              <option value="false">Нет, не включён</option>
            </select>
          </div>

          {/* 6. Налоговая задолженность */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium">
              Налоговая задолженность:
            </label>
            <select
              value={query.tax_arrears === true ? 'true' : query.tax_arrears === false ? 'false' : ''}
              onChange={(e) => {
                const v = e.target.value;
                onChange({ tax_arrears: v === 'true' ? true : v === 'false' ? false : null });
              }}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] focus:border-[#8B5CFF] focus:outline-none"
            >
              <option value="">Не знаю / нужно проверить</option>
              <option value="false">Отсутствует (чисто)</option>
              <option value="true">Есть задолженность (ограничение)</option>
            </select>
          </div>

          {/* 7. Просрочка по кредитам */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium">
              Просрочка по кредитам:
            </label>
            <select
              value={query.overdue_debt_days !== undefined && query.overdue_debt_days !== null ? (query.overdue_debt_days > 60 ? 'over_60' : '0') : ''}
              onChange={(e) => {
                const v = e.target.value;
                onChange({ overdue_debt_days: v === 'over_60' ? 65 : v === '0' ? 0 : null });
              }}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] focus:border-[#8B5CFF] focus:outline-none"
            >
              <option value="">Не знаю / нужно проверить</option>
              <option value="0">0 дней (просрочек нет)</option>
              <option value="over_60">Свыше 60 дней (запрет для «Өрлеу»)</option>
            </select>
          </div>

          {/* 8. Отечественные аналоги оборудования */}
          <div className="space-y-1.5">
            <label className="text-[#94A3B8] font-medium">
              Отечественные аналоги оборудования:
            </label>
            <select
              value={query.domestic_equivalent_available === true ? 'true' : query.domestic_equivalent_available === false ? 'false' : ''}
              onChange={(e) => {
                const v = e.target.value;
                onChange({ domestic_equivalent_available: v === 'true' ? true : v === 'false' ? false : null });
              }}
              className="w-full bg-[#17113D] border border-[#2A2360] rounded-lg px-2.5 py-2 text-[#F4F7FF] focus:border-[#8B5CFF] focus:outline-none"
            >
              <option value="">Не знаю / нужно проверить</option>
              <option value="false">Аналогов в РК нет (импорт разрешён)</option>
              <option value="true">Есть аналоги «Сделано в Казахстане»</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
