import React, { useState } from 'react';
import { EvaluationSummary } from '../logic/decisionEngine';
import { generateDocxReport, CoreProgramExport } from '../logic/docxExport';
import { 
  X, Copy, Check, Download, FileText, 
  ExternalLink, Sparkles, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { ThemeMode, Language, translations } from '../i18n/translations';
import { resolveOked } from '../data/okedMaster';
import { buildFundingFallback } from '../logic/fundingFallback';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: EvaluationSummary;
  theme?: ThemeMode;
  language?: Language;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ 
  isOpen, 
  onClose, 
  summary,
  theme = 'neon',
  language = 'ru'
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  if (!isOpen) return null;

  const t = translations[language].report;
  const isLight = theme === 'light';
  const { query } = summary;

  // Единый отчёт по результатам decisionEngine для всех программ базы.
  const cleanCode = query.oked_code.trim().replace(/,/g, '.').replace(/\s+/g, '');
  const masterOked = resolveOked(cleanCode);
  const okedName = masterOked.record?.nameRu || cleanCode;
  const fallback = buildFundingFallback(summary);

  const eligibleResults = [
    ...summary.exact_matches,
    ...summary.possible_matches,
    ...summary.needs_clarification,
    ...summary.needs_verification
  ];
  const excludedResults = summary.not_applicable;

  const passedCorePrograms: CoreProgramExport[] = eligibleResults.map((result) => {
    const p = result.program;
    const primarySource = result.sources?.[0];
    const reasonParts = [
      ...result.matched_reasons,
      ...(result.missing_inputs.length > 0 ? ['Требуется уточнить: ' + result.missing_inputs.join('; ')] : [])
    ];

    return {
      id: p.id,
      title: p.name_ru,
      category: p.instrument_type + ' · ' + result.status_label_ru,
      applicable: result.status !== 'not_applicable',
      limit: p.amount_max_text || 'По условиям программы',
      rate: p.borrower_rate_text || p.subsidy_text || 'По условиям программы',
      term: p.term_text || 'Не указано',
      purposes: p.purpose_short || 'Уточняется по регламенту',
      financier: p.institution_id === 'damu' ? 'АО «ФРП «Даму» / партнёрские финансовые организации' : p.institution_id,
      sourceId: primarySource?.source_id || p.source_ids?.[0] || 'SOURCE',
      url: primarySource?.url || '',
      note: reasonParts.join(' ') || 'Программа требует дополнительной проверки условий.'
    };
  });

  const excludedProgramRows = excludedResults.map((result) => ({
    id: result.program.id,
    title: result.program.name_ru,
    instrument: result.program.instrument_type,
    reasons: result.restrictions.length > 0 ? result.restrictions : ['Не соответствует текущим параметрам запроса.'],
    sourceId: result.sources?.[0]?.source_id || result.program.source_ids?.[0] || 'SOURCE',
    url: result.sources?.[0]?.url || ''
  }));
  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await generateDocxReport(query, okedName, passedCorePrograms, excludedProgramRows, fallback);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NC_Decision_Report_${cleanCode}_${query.location_name || 'RK'}.docx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate DOCX', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const markdownReport = `
# ${t.title}
*${t.subtitle} (${new Date().toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU')})*

### ${t.paramsTitle}
- **${t.okedLabel}** \`${cleanCode}\` (${okedName})
- **${language === 'kk' ? 'Өңір:' : 'Регион:'}** ${query.region_name || query.location_name || (language === 'kk' ? 'Көрсетілмеген' : 'Не указан')}
${query.district_name ? `- **${language === 'kk' ? 'Аудан / қала:' : 'Район / город:'}** ${query.district_name}` : ''}
- **${t.financierLabel}** ${t.financierValue}

---

### ${t.programsTitle}
${passedCorePrograms.map((p, i) => `
#### ${i + 1}. ${p.title}
- **${language === 'kk' ? 'Санаты:' : 'Категория:'}** ${p.category}
- **${t.limitLabel}** ${p.limit}
- **${t.rateLabel}** ${p.rate}
- **${t.termPurposeLabel}** ${p.term} | ${p.purposes}
- **${t.whoFinancesLabel}** ${p.financier}
- **${t.justificationLabel}** ${p.note}
- **${t.officialSource}** [${p.sourceId}](${p.url})
`).join('\n')}


${fallback.show ? `
### Альтернативный маршрут финансирования
- **Базовая ставка НБРК:** ${fallback.market.baseRate.ratePercent}% (действует с ${fallback.market.baseRate.effectiveFrom}; не является ставкой банковского кредита)
${fallback.routes.map((r) => `- **${r.title}:** ${r.description}`).join('\n')}

### Рыночные продукты БВУ
${fallback.market.products.map((p) => `- **${p.institution} — ${p.productName}:** ${p.nominalRateText}${p.aeirText ? `; ${p.aeirText}` : ''}; ${p.amountText || ''}; ${p.termText || ''}. Источник: ${p.sourceUrl}`).join('\n')}
` : ''}

### ${language === 'kk' ? 'Сәйкес келмейтін бағдарламалар' : 'Не подходят по текущим параметрам'}
${excludedProgramRows.map((p, i) => `
#### ${i + 1}. ${p.title}
- **${language === 'kk' ? 'Себебі:' : 'Причина:'}** ${p.reasons.join('; ')}
- **${t.officialSource}** ${p.sourceId}${p.url ? ` — ${p.url}` : ''}
`).join('\n')}

---
*${t.legalNoteDesc}*
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`border rounded-2xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        isLight 
          ? 'bg-white border-neutral-300 text-neutral-900 shadow-neutral-400/30' 
          : 'bg-[#060814] border-[#172036] text-[#F4F7FF] shadow-[0_0_50px_rgba(0,0,0,0.9)]'
      }`}>
        
        {/* Шапка отчёта */}
        <div className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between gap-3 ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#02040A] border-[#172036]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <FileText className={`w-5 h-5 shrink-0 ${isLight ? 'text-black' : 'text-[#00E5FF]'}`} />
            <div className="min-w-0">
              <h2 className={`text-sm sm:text-base font-bold tracking-tight truncate ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                {t.title}
              </h2>
              <span className={`text-xs font-mono truncate block ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                OKED: {cleanCode} · {query.region_name || query.location_name || (language === 'kk' ? 'Қазақстан' : language === 'en' ? 'Kazakhstan' : language === 'zh' ? '哈萨克斯坦' : 'Казахстан')}{query.district_name ? ` · ${query.district_name}` : ''}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
              isLight 
                ? 'text-neutral-500 hover:text-black hover:bg-neutral-200' 
                : 'text-[#94A3B8] hover:text-[#F4F7FF] hover:bg-[#201850]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело отчёта */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          
          {/* Сводка параметров */}
          <div className={`p-3.5 sm:p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs ${
            isLight 
              ? 'bg-neutral-50 border-neutral-200' 
              : 'bg-[#080A1A]/80 border-[#2A2360]'
          }`}>
            <div className="space-y-0.5">
              <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                {t.okedLabel}
              </span>
              <div className={`font-mono font-bold text-sm ${isLight ? 'text-neutral-900' : 'text-[#00E5FF]'}`}>
                {cleanCode}
              </div>
              <span className={`text-[11px] block leading-tight ${isLight ? 'text-neutral-600' : 'text-slate-400'}`}>
                {okedName}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                {t.territoryLabel}
              </span>
              <div className={`font-medium ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                {query.region_name || query.location_name || (language === 'kk' ? 'Көрсетілмеген' : language === 'en' ? 'Not specified' : language === 'zh' ? '未指定' : 'Не указан')}
              </div>
              <span className={`text-[11px] font-mono block ${isLight ? 'text-blue-600' : 'text-[#2F8BFF]'}`}>
                {query.district_name
                  ? `${language === 'kk' ? 'Аудан/қала' : language === 'en' ? 'District/city' : language === 'zh' ? '区/城市' : 'Район/город'}: ${query.district_name}`
                  : (query.location_level === 'city'
                      ? (language === 'kk' ? 'Қала (city)' : language === 'en' ? 'City' : language === 'zh' ? '城市' : 'Город (city)')
                      : (language === 'kk' ? 'Облыс (region)' : language === 'en' ? 'Region' : language === 'zh' ? '州' : 'Область (region)'))}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                {t.whoFinancesLabel}
              </span>
              <div className={`font-medium flex items-center gap-1 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>БВУ РК + Фонд «Даму»</span>
              </div>
              <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                Halyk, Forte, БЦК, Bereke, Jusan
              </span>
            </div>
          </div>

          {/* ЦЕЛЕВЫЕ ПРОГРАММЫ ПО ПРЕДОСТАВЛЕННЫМ ДАННЫМ */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <h3 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'text-neutral-900' : 'text-[#00E5FF]'
              }`}>
                <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isLight ? 'text-amber-500' : 'text-[#8B5CFF]'}`} />
                <span>{t.programsTitle}</span>
              </h3>
              <span className={`text-[11px] sm:text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                {passedCorePrograms.length} {passedCorePrograms.length === 1 ? t.programsCountOne : t.programsCount}
              </span>
            </div>

            {passedCorePrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {passedCorePrograms.map((prog, idx) => (
                  <div 
                    key={prog.id}
                    className={`p-3.5 sm:p-4 rounded-xl border flex flex-col justify-between space-y-2.5 sm:space-y-3 transition-all ${
                      isLight 
                        ? 'bg-neutral-50 border-neutral-300 hover:border-black' 
                        : 'bg-[#080A1A] border-[#8B5CFF]/30 hover:border-[#8B5CFF]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between gap-2 border-b pb-2 ${
                        isLight ? 'border-neutral-200' : 'border-[#2A2360]'
                      }`}>
                        <span className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider truncate ${
                          isLight ? 'text-amber-700 font-semibold' : 'text-[#CBA13A]'
                        }`}>
                          #{idx + 1} {prog.category}
                        </span>
                        <a
                          href={prog.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`text-[11px] font-mono flex items-center gap-1 shrink-0 ${
                            isLight ? 'text-blue-600 hover:text-black' : 'text-[#2F8BFF] hover:text-[#00E5FF]'
                          }`}
                        >
                          <span>{prog.sourceId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <h4 className={`text-xs sm:text-sm font-bold leading-snug ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                        {prog.title}
                      </h4>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                            {t.limitLabel}
                          </span>
                          <strong className={`font-mono text-xs ${isLight ? 'text-neutral-900 font-extrabold' : 'text-[#00E5FF]'}`}>
                            {prog.limit}
                          </strong>
                        </div>

                        <div>
                          <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                            {t.rateLabel}
                          </span>
                          <span className={`leading-relaxed block ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                            {prog.rate}
                          </span>
                        </div>

                        <div>
                          <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                            {t.termPurposeLabel}
                          </span>
                          <span className={`leading-relaxed block ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                            {prog.term} · {prog.purposes}
                          </span>
                        </div>

                        <div>
                          <span className={`text-[11px] block ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
                            {t.whoFinancesLabel}
                          </span>
                          <span className={`leading-relaxed block ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                            {prog.financier}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`pt-2 border-t text-[11px] ${
                      isLight ? 'border-neutral-200 text-neutral-500' : 'border-[#2A2360]/60 text-[#94A3B8]'
                    }`}>
                      {prog.note}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-xl border text-xs ${
                isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-[#080A1A] border-[#2A2360] text-[#94A3B8]'
              }`}>
                {t.noPrograms}
              </div>
            )}
          </div>

          {fallback.show && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-neutral-900' : 'text-amber-300'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Альтернативный маршрут финансирования</span>
                </h3>
                <span className={`text-[10px] font-mono ${isLight ? 'text-neutral-500' : 'text-slate-500'}`}>
                  без подмены льготной ставки
                </span>
              </div>
              <div className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/15 border-amber-700/30'
              }`}>
                <div className={`font-semibold text-xs sm:text-sm ${isLight ? 'text-neutral-900' : 'text-amber-200'}`}>
                  {fallback.headline}
                </div>
                <div className={`text-[11px] leading-relaxed mt-1 ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                  {fallback.explanation}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fallback.routes.map((route) => (
                  <div key={route.id} className={`p-3.5 rounded-xl border ${
                    isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#080A1A] border-[#2A2360]'
                  }`}>
                    <div className={`font-semibold text-xs ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                      {route.title}
                    </div>
                    <div className={`text-[11px] leading-relaxed mt-1.5 ${isLight ? 'text-neutral-600' : 'text-slate-400'}`}>
                      {route.description}
                    </div>
                    {route.sourceId && (
                      <div className={`text-[10px] font-mono mt-2 ${isLight ? 'text-neutral-500' : 'text-slate-500'}`}>
                        {route.sourceId}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-950/15 border-blue-800/40'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className={`font-semibold text-xs sm:text-sm ${isLight ? 'text-neutral-900' : 'text-blue-200'}`}>
                    Рыночные ставки банков
                  </div>
                  <div className={`text-[10px] font-mono ${isLight ? 'text-neutral-600' : 'text-slate-400'}`}>
                    Базовая ставка НБРК: {fallback.market.baseRate.ratePercent}% · с {fallback.market.baseRate.effectiveFrom}
                  </div>
                </div>
                <div className={`text-[10px] mt-1 ${isLight ? 'text-neutral-500' : 'text-slate-500'}`}>
                  Базовая ставка НБРК не является ставкой кредита. Ниже — только официально опубликованные банковские продукты, проверенные на {fallback.market.products[0]?.checkedOn || fallback.market.baseRate.checkedOn}.
                </div>

                <div className="mt-3 space-y-2">
                  {fallback.market.products.map((product) => (
                    <div key={product.sourceId} className={`p-3 rounded-lg border ${
                      isLight ? 'bg-white border-neutral-200' : 'bg-[#060814] border-[#172036]'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className={`font-semibold text-xs ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                            {product.institution} · {product.productName}
                          </div>
                          <div className={`text-[11px] mt-1 ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                            {product.nominalRateText}{product.aeirText ? ` · ${product.aeirText}` : ''}
                          </div>
                          <div className={`text-[10px] mt-1 ${isLight ? 'text-neutral-500' : 'text-slate-500'}`}>
                            {[product.amountText, product.termText, product.borrowerText].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        <a
                          href={product.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`text-[10px] font-mono shrink-0 flex items-center gap-1 ${
                            isLight ? 'text-blue-600' : 'text-[#2F8BFF]'
                          }`}
                        >
                          источник <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {excludedProgramRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className={'text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center gap-1.5 ' + (isLight ? 'text-neutral-900' : 'text-rose-300')}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{language === 'kk' ? 'Сәйкес келмейтін бағдарламалар' : language === 'en' ? 'Not applicable programs' : language === 'zh' ? '不适用的项目' : 'Не подходят по текущим параметрам'}</span>
                </h3>
                <span className={'text-[11px] font-mono ' + (isLight ? 'text-neutral-500' : 'text-[#94A3B8]')}>{excludedProgramRows.length}</span>
              </div>
              <div className="space-y-2">
                {excludedProgramRows.map((prog) => (
                  <div key={prog.id} className={'p-3.5 rounded-xl border ' + (isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-950/15 border-rose-900/50')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={'font-semibold text-xs sm:text-sm ' + (isLight ? 'text-neutral-900' : 'text-[#F4F7FF]')}>{prog.title}</div>
                        <div className={'text-[10px] font-mono mt-0.5 ' + (isLight ? 'text-neutral-500' : 'text-slate-500')}>{prog.instrument}</div>
                      </div>
                      <span className={'text-[10px] font-mono shrink-0 ' + (isLight ? 'text-neutral-500' : 'text-slate-500')}>{prog.sourceId}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {prog.reasons.map((reason, idx) => (
                        <div key={idx} className={'text-[11px] leading-relaxed flex items-start gap-2 ' + (isLight ? 'text-rose-800' : 'text-rose-300')}>
                          <span className="font-bold shrink-0">✕</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Подвал отчёта */}
        <div className={`px-4 sm:px-6 py-3 sm:py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#080A1A] border-[#2A2360]'
        }`}>
          <span className={`hidden sm:inline ${isLight ? 'text-neutral-500' : 'text-[#94A3B8]'}`}>
            NC Consulting · {t.subtitle}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-initial justify-center px-3.5 py-2.5 sm:py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                isLight 
                  ? 'bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300' 
                  : 'bg-[#201850] hover:bg-[#2A2360] text-[#F4F7FF] border-[#8B5CFF]/30'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-black' : 'text-[#00E5FF]'}`} />}
              <span className="text-xs">{copied ? t.copiedBtn : t.copyBtn}</span>
            </button>

            {/* Скачать DOCX файл */}
            <button
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold disabled:opacity-50 touch-manipulation active:scale-95 ${
                isLight
                  ? 'bg-neutral-900 hover:bg-black text-white shadow-sm'
                  : 'bg-[#00E5FF] hover:bg-[#33ebff] text-slate-950 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              }`}
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="text-xs">{isExportingDocx ? t.generatingDocx : t.downloadDocxBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
