import React, { useMemo, useState } from 'react';
import { Bot, X, Send, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { ExpertContext } from '../aiExpert/types';
import { composeExpertAnswer, ExpertAnswer } from '../aiExpert/composeExpertAnswer';
import { ThemeMode } from '../i18n/translations';

interface AIExpertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: ExpertContext | null;
  theme: ThemeMode;
}

const quickQuestions = [
  'Объясни моё заключение',
  'Почему эти программы подходят?',
  'Почему некоторые программы не подходят?',
  'Что нужно уточнить?',
  'Что делать дальше?',
  'Покажи официальные источники'
];

export const AIExpertPanel: React.FC<AIExpertPanelProps> = ({ isOpen, onClose, context, theme }) => {
  const isLight = theme === 'light';
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Array<{ id: number; question: string; answer: ExpertAnswer }>>([]);
  const turnId = React.useRef(1);

  const sourceMap = useMemo(() => {
    const map = new Map<string, { title: string; url: string; checkedOn: string }>();
    for (const decision of context?.decisions || []) {
      for (const source of decision.sources) {
        map.set(source.sourceId, { title: source.title, url: source.url, checkedOn: source.checkedOn });
      }
    }
    return map;
  }, [context]);

  React.useEffect(() => {
    if (!isOpen) return;
    setQuestion('');
    setHistory([]);
    turnId.current = 1;
  }, [isOpen, context]);

  if (!isOpen) return null;

  const ask = (text: string) => {
    if (!context || !text.trim()) return;
    const clean = text.trim();
    setHistory((prev) => [...prev, { id: turnId.current++, question: clean, answer: composeExpertAnswer(context, clean) }]);
    setQuestion('');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6">
      <button type="button" aria-label="Закрыть AI Expert" onClick={onClose} className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div className={`relative w-full max-w-4xl max-h-[88vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#080A1A] border-[#24304C]'
      }`}>
        <div className={`px-4 sm:px-5 py-4 border-b flex items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1127] border-[#24304C]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <div className={`font-extrabold text-sm sm:text-base ${isLight ? 'text-slate-950' : 'text-[#F4F7FF]'}`}>NC Decision AI Expert</div>
              <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Объясняет результат decision engine · не меняет правила программ
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
            isLight ? 'border-slate-200 text-slate-600' : 'border-[#24304C] text-slate-300'
          }`}><X className="w-4 h-4" /></button>
        </div>

        {!context ? (
          <div className="p-8 text-center text-sm text-slate-500">Сначала выполните анализ проекта.</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className={`p-3 rounded-xl border text-xs ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 font-bold"><ShieldCheck className="w-4 h-4" /> Контекст зафиксирован</div>
              <div className="mt-1 opacity-80">
                ОКЭД {context.project.okedCode}{context.project.region ? ` · ${context.project.region}` : ''}{context.project.district ? ` · ${context.project.district}` : ''}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((item) => (
                <button key={item} type="button" onClick={() => ask(item)} className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-violet-300' : 'bg-[#0D1127] border-[#24304C] text-slate-300 hover:border-violet-500/50'
                }`}>
                  {item}
                </button>
              ))}
            </div>

            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((turn) => (
                  <div key={turn.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className={`max-w-[88%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-xs sm:text-sm ${
                        isLight ? 'bg-violet-100 text-violet-950' : 'bg-violet-950/55 text-violet-100 border border-violet-500/20'
                      }`}>
                        {turn.question}
                      </div>
                    </div>

                    <div className={`rounded-2xl rounded-tl-md border p-4 sm:p-5 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0D1127] border-[#24304C]'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <div className={`font-bold text-sm ${isLight ? 'text-slate-950' : 'text-[#F4F7FF]'}`}>{turn.answer.title}</div>
                      </div>
                      <div className="space-y-2">
                        {turn.answer.body.map((line, idx) => (
                          <div key={idx} className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{line}</div>
                        ))}
                      </div>
                      {turn.answer.sourceIds.length > 0 && (
                        <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#24304C]'}`}>
                          <div className="text-[10px] uppercase tracking-wider font-bold mb-2 text-slate-500">Официальные источники</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {turn.answer.sourceIds.map((id) => {
                              const source = sourceMap.get(id);
                              if (!source) return null;
                              return (
                                <a key={id} href={source.url} target="_blank" rel="noreferrer noopener" className={`rounded-xl border px-3 py-2 transition-all ${
                                  isLight ? 'bg-sky-50 border-sky-200 hover:border-sky-400' : 'bg-cyan-950/20 border-cyan-500/20 hover:border-cyan-400/40'
                                }`}>
                                  <div className={`flex items-start justify-between gap-2 text-[11px] font-semibold ${isLight ? 'text-sky-900' : 'text-cyan-200'}`}>
                                    <span>{source.title}</span><ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  </div>
                                  <div className="mt-1 text-[9px] font-mono text-slate-500">Проверено: {source.checkedOn} · {id}</div>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`rounded-2xl border p-5 text-center text-xs leading-relaxed ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#0D1127] border-[#24304C] text-slate-400'
              }`}>
                Выберите быстрый вопрос или задайте свой. На этом этапе ответы формируются строго из результата decision engine и официальных источников текущего анализа.
              </div>
            )}
          </div>
        )}

        <div className={`p-3 sm:p-4 border-t ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D1127] border-[#24304C]'}`}>
          <form onSubmit={(e) => { e.preventDefault(); ask(question); }} className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!context}
              placeholder="Например: почему мне подходит «Өрлеу»?"
              className={`flex-1 min-w-0 px-3 py-2.5 rounded-xl border text-sm outline-none ${
                isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-violet-400' : 'bg-[#060814] border-[#24304C] text-[#F4F7FF] focus:border-violet-500'
              }`}
            />
            <button type="submit" disabled={!context || !question.trim()} className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className={`mt-2 text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            AI Expert объясняет результат системы и не заменяет решение Фонда «Даму», банка или иного финансового института.
          </div>
        </div>
      </div>
    </div>
  );
};
