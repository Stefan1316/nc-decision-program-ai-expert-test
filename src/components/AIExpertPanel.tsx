import React, { useMemo, useState } from 'react';
import { Bot, X, Send, ShieldCheck, ExternalLink, Sparkles, Check, RotateCcw } from 'lucide-react';
import { ExpertContext, ExpertParameterChange } from '../aiExpert/types';
import { composeExpertAnswer, ExpertAnswer, detectExpertIntent } from '../aiExpert/composeExpertAnswer';
import { parseProjectCommand, ParsedProjectCommand } from '../aiExpert/parseProjectCommand';
import { compareExpertContexts } from '../aiExpert/compareExpertContexts';
import { ThemeMode } from '../i18n/translations';

interface AIExpertPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: ExpertContext | null;
  theme: ThemeMode;
  onApplyChanges: (changes: ExpertParameterChange[]) => ExpertContext;
}

interface ConversationTurn {
  id: number;
  question: string;
  answer: ExpertAnswer;
}

const quickQuestions = [
  'Объясни моё заключение',
  'Почему эти программы подходят?',
  'Почему некоторые программы не подходят?',
  'Что нужно уточнить?',
  'Что делать дальше?',
  'Покажи официальные источники'
];

export const AIExpertPanel: React.FC<AIExpertPanelProps> = ({
  isOpen,
  onClose,
  context,
  theme,
  onApplyChanges
}) => {
  const isLight = theme === 'light';
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [pendingCommand, setPendingCommand] = useState<ParsedProjectCommand | null>(null);
  const [commandQuestion, setCommandQuestion] = useState('');
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
    setPendingCommand(null);
    setCommandQuestion('');
    turnId.current = 1;
  }, [isOpen]);

  if (!isOpen) return null;

  const pushTurn = (questionText: string, answer: ExpertAnswer) => {
    setHistory((prev) => [...prev, { id: turnId.current++, question: questionText, answer }]);
  };

  const ask = (text: string) => {
    if (!context || !text.trim()) return;
    const clean = text.trim();
    const parsed = parseProjectCommand(clean);
    const intent = detectExpertIntent(clean);

    if (parsed.recognized && intent === 'change_project_parameter') {
      setPendingCommand(parsed);
      setCommandQuestion(clean);
      pushTurn(clean, {
        intent: 'change_project_parameter',
        title: 'Проверка команды перед пересчётом',
        body: [
          'Я распознал изменение параметров проекта. Пока ничего не изменено.',
          ...parsed.summaryLines.map((line) => `Будет изменено: ${line}.`),
          ...(parsed.unresolved.length ? ['Требует уточнения: ' + parsed.unresolved.join(' ')] : []),
          'Если всё верно, подтвердите команду — после этого decision engine выполнит новый расчёт.'
        ],
        sourceIds: []
      });
      setQuestion('');
      return;
    }

    if (intent === 'change_project_parameter' && !parsed.recognized) {
      pushTurn(clean, {
        intent,
        title: 'Не удалось однозначно распознать изменение',
        body: [
          'Команда похожа на изменение параметров проекта, но я не смог определить новое значение.',
          'Укажите параметр и значение, например: «Проверь другой ОКЭД — 45.20», «Измени сумму на 300 млн тенге» или «Проверь Алматы».'
        ],
        sourceIds: []
      });
      setQuestion('');
      return;
    }

    setPendingCommand(null);
    setCommandQuestion('');
    pushTurn(clean, composeExpertAnswer(context, clean));
    setQuestion('');
  };

  const applyPendingCommand = () => {
    if (!context || !pendingCommand?.changes.length) return;
    const before = context;
    const after = onApplyChanges(pendingCommand.changes);
    const diff = compareExpertContexts(before, after);

    pushTurn('Подтвердить изменения и пересчитать', {
      intent: 'change_project_parameter',
      title: 'Новый расчёт выполнен',
      body: [
        'Изменения применены через decision engine.',
        ...diff.lines
      ],
      sourceIds: Array.from(new Set(
        after.decisions
          .filter((d) => diff.changedProgramIds.includes(d.programId))
          .flatMap((d) => d.sources.map((s) => s.sourceId))
      ))
    });

    setPendingCommand(null);
    setCommandQuestion('');
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
                Объясняет и меняет параметры только через decision engine
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
              <div className="flex items-center gap-2 font-bold"><ShieldCheck className="w-4 h-4" /> Текущий контекст</div>
              <div className="mt-1 opacity-80">
                ОКЭД {context.project.okedCode}{context.project.region ? ` · ${context.project.region}` : ''}{context.project.district ? ` · ${context.project.district}` : ''}{context.project.amountKzt ? ` · ${context.project.amountKzt.toLocaleString('ru-RU')} ₸` : ''}
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
                Можно не только задавать вопросы, но и менять параметры проекта: например «Проверь другой ОКЭД — 45.20».
              </div>
            )}

            {pendingCommand && (
              <div className={`rounded-2xl border p-4 ${
                isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-500/25'
              }`}>
                <div className={`text-xs font-bold ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>Подтверждение изменения</div>
                <div className={`mt-2 space-y-1 text-xs ${isLight ? 'text-amber-900' : 'text-amber-100'}`}>
                  {pendingCommand.summaryLines.map((line) => <div key={line}>• {line}</div>)}
                  {pendingCommand.unresolved.map((line) => <div key={line}>• Нужно уточнить: {line}</div>)}
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={applyPendingCommand}
                    disabled={pendingCommand.unresolved.length > 0}
                    className="px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <Check className="w-4 h-4" /> Применить и пересчитать
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPendingCommand(null); setCommandQuestion(''); }}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      isLight ? 'bg-white border-amber-200 text-amber-900' : 'bg-transparent border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" /> Отменить
                  </button>
                </div>
                {commandQuestion && <div className="mt-2 text-[10px] opacity-60">Команда: {commandQuestion}</div>}
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
              placeholder="Например: проверь другой ОКЭД — 45.20"
              className={`flex-1 min-w-0 px-3 py-2.5 rounded-xl border text-sm outline-none ${
                isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-violet-400' : 'bg-[#060814] border-[#24304C] text-[#F4F7FF] focus:border-violet-500'
              }`}
            />
            <button type="submit" disabled={!context || !question.trim()} className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className={`mt-2 text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            Любое изменение сначала подтверждается пользователем, затем пересчитывается decision engine.
          </div>
        </div>
      </div>
    </div>
  );
};
