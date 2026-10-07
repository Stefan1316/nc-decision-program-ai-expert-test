import React from 'react';
import { X, Play } from 'lucide-react';
import { ThemeMode } from '../i18n/translations';

interface AcceptanceTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTest: (testId: string) => void;
  activeTestId?: string;
  theme?: ThemeMode;
}

export const ACCEPTANCE_TESTS = [
  {
    id: 'T1',
    name: 'T1. Минимальный ввод',
    input: 'Точный ОКЭД: 10.51 + Территория: Алматы (город республиканского значения)',
    expected: 'Агент выдаёт предварительный список и НЕ требует заполнить весь опросник.',
    category: 'Минимальный ввод'
  },
  {
    id: 'T2',
    name: 'T2. Область (Уровень region)',
    input: 'Точный ОКЭД: 46.73 (Оптовая торговля) + Территория: Алматинская область (region)',
    expected: 'Агент строго учитывает уровень region и НЕ подменяет его городом. Внутренняя торговля разрешена в области, в отличие от города республиканского значения.',
    category: 'Территориальность'
  },
  {
    id: 'T3',
    name: 'T3. Широкий код',
    input: 'ОКЭД: раздел «C» (или «10» без подкласса) + Территория: Караганда',
    expected: 'Агент помечает результат как неполный/предварительный и рекомендует указать точный 4-5 значный код.',
    category: 'Нормализация'
  },
  {
    id: 'T4',
    name: 'T4. Подтверждённое ограничение',
    input: 'ОКЭД: 47.11 (Розничная торговля) + Территория: Алматы (город республиканского значения)',
    expected: 'Программа внутренней торговли маркируется как исключённая/ограниченная (not_applicable), причина прямо выводится в карточке.',
    category: 'Ограничения'
  },
  {
    id: 'T5',
    name: 'T5. Неполные данные / needs_verification',
    input: 'ОКЭД: 25.11 + Программа поддержки МСБ в обрабатывающей промышленности (Транши 1-3) или Даму-Лизинг',
    expected: 'Выводится статус «Требует проверки по источнику» (needs_verification), без выдумывания лимитов или ставок.',
    category: 'Целостность данных'
  },
  {
    id: 'T6',
    name: 'T6. Уточнение целей финансирования',
    input: 'ОКЭД: 10.51 + Территория: Алматы. Найдены программы с разными целями (инвестиции vs оборотка)',
    expected: 'Агент задаёт вопрос о цели (инвестиции или пополнение оборотных средств) и не запрашивает нерелевантные поля.',
    category: 'Интерактивное уточнение'
  },
  {
    id: 'T7',
    name: 'T7. Источники и верификация',
    input: 'Любая найденная программа',
    expected: 'Для каждого результата возвращаются точные source_id, официальный URL и дата проверки (2026-09-28).',
    category: 'Прозрачность'
  }
];

export const AcceptanceTestsModal: React.FC<AcceptanceTestsModalProps> = ({
  isOpen,
  onClose,
  onRunTest,
  activeTestId,
  theme = 'neon'
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        isLight 
          ? 'bg-white border-neutral-300 text-neutral-900 shadow-neutral-400/30' 
          : 'bg-[#060814] border-[#172036] text-[#F4F7FF] shadow-[0_0_50px_rgba(0,0,0,0.9)]'
      }`}>
        {/* Modal Header */}
        <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#02040A] border-[#172036]'
        }`}>
          <div>
            <h2 className={`text-base font-bold tracking-tight flex items-center gap-2 ${
              isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
            }`}>
              Приёмочные тесты ТЗ (Раздел 10)
              <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${
                isLight 
                  ? 'bg-neutral-200 text-neutral-800 border-neutral-300' 
                  : 'text-[#00E5FF] bg-cyan-950/60 border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
              }`}>
                NC Decision
              </span>
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
              Нажмите «Запустить тест» для мгновенной проверки соответствия логики демо-агента
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight 
                ? 'text-neutral-500 hover:text-black hover:bg-neutral-200' 
                : 'text-slate-400 hover:text-white hover:bg-[#101426]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className={`p-5 sm:p-6 overflow-y-auto space-y-3.5 text-xs divide-y ${
          isLight ? 'divide-neutral-100' : 'divide-[#172036]'
        }`}>
          {ACCEPTANCE_TESTS.map((test) => {
            const isActive = activeTestId === test.id;
            return (
              <div key={test.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                      {test.name}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isLight 
                        ? 'bg-neutral-100 text-neutral-700 border-neutral-200' 
                        : 'bg-[#02040A] text-slate-400 border-[#172036]'
                    }`}>
                      {test.category}
                    </span>
                  </div>

                  <p className={isLight ? 'text-neutral-700' : 'text-slate-300'}>
                    <strong className={isLight ? 'text-neutral-900' : 'text-slate-200'}>Ввод: </strong>
                    {test.input}
                  </p>

                  <p className={isLight ? 'text-neutral-600' : 'text-slate-400'}>
                    <strong className={isLight ? 'text-sky-700' : 'text-[#00E5FF]'}>Ожидаемое поведение: </strong>
                    {test.expected}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onRunTest(test.id);
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95 ${
                    isActive
                      ? isLight
                        ? 'bg-neutral-900 text-white shadow-sm'
                        : 'bg-[#00E5FF] text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.45)]'
                      : isLight
                        ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isActive ? 'Активен' : 'Запустить'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3.5 border-t flex justify-between items-center text-xs font-mono ${
          isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-[#02040A] border-[#172036] text-slate-400'
        }`}>
          <span>Все тесты соответствуют спецификации от 28 сентября 2026 г.</span>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300' 
                : 'bg-[#060814] hover:bg-[#101426] text-slate-300 border-[#172036]'
            }`}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
