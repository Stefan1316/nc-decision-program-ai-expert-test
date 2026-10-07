import React from 'react';
import { damuKnowledgeBase } from '../data/damuDatabase';
import { X, ExternalLink, ShieldCheck, Database, FileCheck } from 'lucide-react';
import { ThemeMode } from '../i18n/translations';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: ThemeMode;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ 
  isOpen, 
  onClose,
  theme = 'neon'
}) => {
  if (!isOpen) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        isLight 
          ? 'bg-white border-neutral-300 text-neutral-900 shadow-neutral-400/30' 
          : 'bg-[#060814] border-[#172036] text-[#F4F7FF] shadow-[0_0_50px_rgba(0,0,0,0.9)]'
      }`}>
        {/* Header */}
        <div className={`px-5 sm:px-6 py-4 border-b flex items-center justify-between ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#02040A] border-[#172036]'
        }`}>
          <div className="flex items-center gap-3">
            <Database className={`w-5 h-5 ${isLight ? 'text-purple-600' : 'text-[#00E5FF]'}`} />
            <div>
              <h2 className={`text-base font-bold tracking-tight flex items-center gap-2 ${
                isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
              }`}>
                Закрытая база знаний: Damu Demo v2
              </h2>
              <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                {damuKnowledgeBase.dataset_id} · Обновлено: {damuKnowledgeBase.generated_on}
              </span>
            </div>
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs">
          {/* Rules Banner */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isLight 
              ? 'bg-neutral-50 border-neutral-200 text-neutral-800' 
              : 'bg-[#02040A] border-[#172036] text-slate-300'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-2 ${
              isLight ? 'text-neutral-900' : 'text-[#00E5FF]'
            }`}>
              <ShieldCheck className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-[#00E5FF]'}`} />
              Правила использования закрытой базы (ТЗ Раздел 3 и 8):
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Источником ответа является только файл <code className="font-mono text-purple-400">Damu_AI_Knowledge_Base_Demo_v2_OKED_Region.json</code>.</li>
              <li>Не выдумывать условия, даже если программа обычно имеет похожие параметры в других банках.</li>
              <li>Не подменять точный ОКЭД общей отраслью и не считать совпадение кода гарантией одобрения.</li>
              <li>Если данные неполные или страница недоступна, обязательно указывать статус <code className="font-mono text-[#00E5FF]">needs_verification</code>.</li>
              <li>Раздельно показывать номинальную ставку, ставку заёмщика и субсидию.</li>
            </ul>
          </div>

          {/* Sources Table */}
          <div className="space-y-3">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${
              isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
            }`}>
              <FileCheck className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
              Официальные первоисточники Фонда «Даму» ({damuKnowledgeBase.sources.length}):
            </h3>

            <div className={`rounded-xl border overflow-hidden ${
              isLight ? 'border-neutral-200' : 'border-[#172036]'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b font-mono ${
                      isLight ? 'bg-neutral-100/70 border-neutral-200 text-neutral-700' : 'bg-[#02040A] border-[#172036] text-slate-400'
                    }`}>
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Название источника</th>
                      <th className="p-3 font-semibold">Тип</th>
                      <th className="p-3 font-semibold">Статус</th>
                      <th className="p-3 font-semibold">Ссылка</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y font-mono ${
                    isLight ? 'divide-neutral-100 bg-white' : 'divide-[#172036] bg-[#060814]'
                  }`}>
                    {damuKnowledgeBase.sources.map((s) => (
                      <tr 
                        key={s.source_id} 
                        className={`transition-colors ${
                          isLight ? 'hover:bg-neutral-50' : 'hover:bg-[#0d1224]'
                        }`}
                      >
                        <td className={`p-3 font-bold ${isLight ? 'text-sky-800' : 'text-[#00E5FF]'}`}>
                          {s.source_id}
                        </td>
                        <td className={`p-3 font-sans font-medium ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                          {s.title_ru}
                        </td>
                        <td className="p-3 opacity-80 uppercase text-[11px]">
                          {s.source_type}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            s.availability === 'accessible' || s.availability === 'public'
                              ? isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : isLight ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          }`}>
                            {s.availability || 'доступно'}
                          </span>
                        </td>
                        <td className="p-3">
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className={`inline-flex items-center gap-1 font-bold ${
                              isLight ? 'text-sky-700 hover:text-sky-900' : 'text-[#00E5FF] hover:text-white'
                            }`}
                          >
                            <span>Открыть</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between text-xs font-mono ${
          isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-500' : 'bg-[#02040A] border-[#172036] text-slate-400'
        }`}>
          <span>Программ в реестре: {damuKnowledgeBase.programs.length}</span>
          <span>Всего источников: {damuKnowledgeBase.sources.length}</span>
        </div>
      </div>
    </div>
  );
};
