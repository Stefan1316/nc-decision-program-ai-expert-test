import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserQuery } from './types/damu';
import { evaluatePrograms } from './logic/decisionEngine';
import { calculateReadiness } from './logic/readiness';
import { Header } from './components/Header';
import { QueryInputPanel } from './components/QueryInputPanel';
import { MioPrioritiesMap } from './components/MioPrioritiesMap';
import { ReportExportModal } from './components/ReportExportModal';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { AcceptanceTestsModal } from './components/AcceptanceTestsModal';
import { ProductNav } from './components/ProductNav';
import { AIExpertPanel } from './components/AIExpertPanel';
import { buildExpertContext } from './aiExpert/buildExpertContext';
import { ExpertParameterChange } from './aiExpert/types';
import { ThemeMode, Language, translations } from './i18n/translations';
import { 
  FileText, 
  Map, 
  Sparkles,
  Search,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'nc-decision:draft:v1';

const INITIAL_QUERY: UserQuery = {
  oked_code: '',
  location_name: '',
  location_level: 'city',
  location_role: 'unknown',
  region_id: '',
  region_name: '',
  district_id: '',
  district_name: '',
  settlement_type: '',
  settlement_type_confirmed: false,
  entity_type: '',
  business_status: '',
  operating_years: null,
  purpose: '',
  amount_kzt: null,
  instrument_preference: '',
  tax_arrears: null,
  overdue_debt_days: null,
  social_enterprise_registry: null,
  domestic_equivalent_available: null
};

export default function App() {
  const [query, setQuery] = useState<UserQuery>(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return INITIAL_QUERY;
      return { ...INITIAL_QUERY, ...JSON.parse(saved) } as UserQuery;
    } catch {
      return INITIAL_QUERY;
    }
  });
  const [analyzedQuery, setAnalyzedQuery] = useState<UserQuery | null>(null);
  const analysisResultRef = useRef<HTMLDivElement>(null);

  // Тема оформления: 'neon' (глубокий черный фон с неон-свечением) или 'light' (бело-чёрная)
  const [theme, setTheme] = useState<ThemeMode>('neon');

  // Язык интерфейса: 'ru' (по умолчанию) или 'kk' (казахский)
  const [language, setLanguage] = useState<Language>('ru');

  // Модальные окна
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [isAcceptanceTestsOpen, setIsAcceptanceTestsOpen] = useState(false);
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isAIExpertOpen, setIsAIExpertOpen] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState('');

  // Режим работы: 'map' (интерактивная карта Даму), 'search' (поисковик) или 'split' (совмещенный)
  const [activeView, setActiveView] = useState<'map' | 'search' | 'split'>('split');

  const t = translations[language];
  const isLight = theme === 'light';
  const isKk = language === 'kk';

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(query));
      setDraftSavedAt(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // Local storage may be unavailable in private or embedded preview contexts.
    }
  }, [query]);

  const handleQueryChange = (updated: Partial<UserQuery>) => {
    setQuery((prev) => ({ ...prev, ...updated }));
  };

  const handleAnalyze = () => {
    setAnalyzedQuery({ ...query });
    window.setTimeout(() => {
      analysisResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleAIExpertApplyChanges = (changes: ExpertParameterChange[]) => {
    const patch: Partial<UserQuery> = {};
    for (const change of changes) {
      (patch as Record<string, unknown>)[change.field] = change.value;
    }

    const nextQuery = { ...query, ...patch } as UserQuery;

    // If a region/city is selected directly, clear stale district fields unless the command
    // explicitly supplied a district.
    const changedFields = new Set(changes.map((c) => c.field));
    if ((changedFields.has('region_name') || changedFields.has('location_name')) && !changedFields.has('district_name')) {
      nextQuery.district_id = '';
      nextQuery.district_name = '';
    }

    setQuery(nextQuery);
    setAnalyzedQuery(nextQuery);

    const nextSummary = evaluatePrograms(nextQuery);
    return buildExpertContext(nextSummary);
  };

  const handleOpenReport = () => {
    const snapshot = { ...query };
    setAnalyzedQuery(snapshot);
    setIsReportOpen(true);
  };

  const handleReset = () => {
    setQuery(INITIAL_QUERY);
    setAnalyzedQuery(null);
    setDraftSavedAt('');
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage errors in embedded preview contexts.
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'neon' ? 'light' : 'neon');
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'ru') return 'kk';
      if (prev === 'kk') return 'en';
      if (prev === 'en') return 'zh';
      return 'ru';
    });
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  // Выбор региона на интерактивной карте МИО
  const handleSelectRegionFromMap = (regionName: string, level: 'city' | 'region', regionId?: string) => {
    setQuery(prev => ({
      ...prev,
      location_name: regionName,
      location_level: level,
      region_id: regionId || prev.region_id,
      region_name: regionName,
      district_id: '',
      district_name: '',
      settlement_type: ['almaty-city', 'astana-city', 'shymkent-city'].includes(regionId || '')
        ? 'republican_city'
        : '',
      settlement_type_confirmed: ['almaty-city', 'astana-city', 'shymkent-city'].includes(regionId || '')
    }));
  };

  // Выполнение приёмочного теста ТЗ
  const handleRunAcceptanceTest = (testId: string) => {
    if (testId === 'T1') {
      setQuery({
        ...INITIAL_QUERY,
        oked_code: '10.51',
        location_name: 'Алматы',
        location_level: 'city'
      });
    } else if (testId === 'T2') {
      setQuery({
        ...INITIAL_QUERY,
        oked_code: '46.73',
        location_name: 'Алматинская область',
        location_level: 'region'
      });
    } else if (testId === 'T3') {
      setQuery({
        ...INITIAL_QUERY,
        oked_code: 'C',
        location_name: 'Караганда',
        location_level: 'city'
      });
    } else if (testId === 'T4') {
      setQuery({
        ...INITIAL_QUERY,
        oked_code: '47.11',
        location_name: 'Алматы',
        location_level: 'city'
      });
    } else if (testId === 'T5') {
      setQuery({
        ...INITIAL_QUERY,
        oked_code: '25.11',
        location_name: 'Шымкент',
        location_level: 'city'
      });
    }
    setActiveView('map');
  };

  // Предварительная оценка пересчитывается на лету и используется только для подсказок.
  const liveSummary = useMemo(() => {
    return evaluatePrograms(query);
  }, [query]);

  // Финальный отчёт всегда строится по зафиксированному снимку параметров.
  const reportSummary = useMemo(() => {
    return evaluatePrograms(analyzedQuery || query);
  }, [analyzedQuery, query]);

  const expertContext = useMemo(() => {
    if (!analyzedQuery) return null;
    return buildExpertContext(reportSummary);
  }, [analyzedQuery, reportSummary]);

  const readiness = useMemo(() => {
    return calculateReadiness(query, liveSummary);
  }, [query, liveSummary]);

  const analysisState: 'idle' | 'stale' | 'done' = useMemo(() => {
    if (!analyzedQuery) return 'idle';
    return JSON.stringify(analyzedQuery) === JSON.stringify(query) ? 'done' : 'stale';
  }, [analyzedQuery, query]);

  const recommendedClarifications = useMemo(() => {
    const labels = new Set<string>();
    const rows = [...liveSummary.needs_clarification, ...liveSummary.needs_verification];
    for (const row of rows) {
      for (const item of row.missing_inputs || []) {
        const s = item.toLowerCase();
        if (s.includes('сумм')) labels.add('Сумма финансирования');
        else if (s.includes('цел') || s.includes('назначен')) labels.add('Цель финансирования');
        else if (s.includes('насел') || s.includes('район') || s.includes('город') || s.includes('территор')) labels.add('Точная территория');
        else if (s.includes('категор') || s.includes('форм') || s.includes('субъект')) labels.add('Форма бизнеса');
        else if (s.includes('стаж') || s.includes('лет') || s.includes('срок работы')) labels.add('Стаж бизнеса');
        else if (s.includes('лизинг') || s.includes('инструмент')) labels.add('Финансовый инструмент');
        else if (s.includes('задолж') || s.includes('просроч')) labels.add('Кредитная / налоговая задолженность');
        else if (s.includes('реестр') || s.includes('социаль')) labels.add('Статус в реестре');
      }
    }
    return Array.from(labels).slice(0, 6);
  }, [liveSummary]);

  const clarificationCount = useMemo(() => {
    const buckets = new Set<string>();
    const rows = [...liveSummary.needs_clarification, ...liveSummary.needs_verification];
    for (const row of rows) {
      for (const item of row.missing_inputs || []) {
        const s = item.toLowerCase();
        if (s.includes('сумм')) buckets.add('amount');
        else if (s.includes('цел') || s.includes('назначен')) buckets.add('purpose');
        else if (s.includes('насел') || s.includes('район') || s.includes('город') || s.includes('территор')) buckets.add('location');
        else if (s.includes('категор') || s.includes('форм') || s.includes('субъект')) buckets.add('entity');
        else if (s.includes('реестр') || s.includes('социаль')) buckets.add('social');
        else if (s.includes('собствен')) buckets.add('own_funds');
        else if (s.includes('задолж') || s.includes('просроч')) buckets.add('debt');
        else if (s.includes('лизинг') || s.includes('инструмент')) buckets.add('instrument');
        else if (s.includes('регламент') || s.includes('провер')) buckets.add('verification');
        else buckets.add(item.trim());
      }
    }
    return buckets.size;
  }, [liveSummary]);

  return (
    <div data-theme={isLight ? 'light' : 'dark'} className={`nc-app-shell min-h-[100dvh] flex flex-col font-sans transition-colors duration-300 overflow-x-hidden relative ${
      isLight 
        ? 'bg-[#F8FAFC] text-slate-900 selection:bg-neutral-200' 
        : 'bg-[#080A1A] text-[#F8FAFC] selection:bg-cyan-500/20 selection:text-[#00E5FF]'
    }`}>
      {/* Декоративное мягкое неоновое фоновое свечение в темной теме */}
      {!isLight && (
        <>
          <div className="fixed top-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/5 blur-[140px] pointer-events-none -z-10" />
          <div className="fixed top-1/2 right-10 w-[450px] h-[350px] bg-purple-600/5 blur-[160px] pointer-events-none -z-10" />
        </>
      )}

      {/* Шапка NC Consulting с кнопками темы, языка, карты МИО и сброса */}
      <Header 
        onReset={handleReset}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        onToggleLanguage={handleToggleLanguage}
        isMapActive={activeView === 'map' || activeView === 'split'}
        onOpenMenu={() => setIsNavDrawerOpen(true)}
      />

      {/* Основной контент */}
      <div className="flex flex-1 min-w-0">
        <ProductNav
          theme={theme}
          language={language}
          onSelectLanguage={handleSelectLanguage}
          onToggleTheme={handleToggleTheme}
          onReset={handleReset}
          isDrawerOpen={isNavDrawerOpen}
          onDrawerOpenChange={setIsNavDrawerOpen}
          onOpenAIExpert={() => setIsAIExpertOpen(true)}
          aiExpertAvailable={analysisState === 'done'}
        />
        <main className="flex-1 min-w-0 max-w-[1480px] mx-auto w-full px-3.5 sm:px-6 pt-4 sm:pt-6 lg:pt-7 pb-40 md:pb-8 space-y-5 sm:space-y-7">
        
        {/* Баннер сервиса */}
        <div className={`text-left space-y-2 border-b pb-5 sm:pb-6 ${
          isLight ? 'border-neutral-200' : 'border-[#1E223D]'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              isLight 
                ? 'bg-neutral-100 text-neutral-800 border-neutral-300 shadow-xs' 
                : 'bg-cyan-950/40 text-[#00E5FF] border-cyan-500/30 shadow-[0_0_12px_-2px_rgba(0,229,255,0.35)]'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
              <span>{t.banner.tag}</span>
            </div>
            {draftSavedAt && (
              <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Черновик сохранён · {draftSavedAt}
              </span>
            )}

            {/* Быстрая кнопка открытия отчета */}
            <button
              type="button"
              onClick={handleOpenReport}
              disabled={analysisState !== 'done'}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                analysisState !== 'done' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isLight 
                  ? 'bg-neutral-900 hover:bg-black text-white' 
                  : 'bg-cyan-950/60 hover:bg-cyan-900/80 text-[#00E5FF] border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {language === 'kk' ? 'Сараптамалық есепті ашу' : language === 'en' ? 'Open Expert Report' : language === 'zh' ? '生成专家评估报告' : 'Сформировать отчёт'}
              </span>
            </button>
          </div>

          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
          }`}>
            {t.banner.title}
          </h2>
          <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${isLight ? 'text-neutral-600' : 'text-slate-400'}`}>
            {t.banner.desc}
          </p>
        </div>

        <section data-testid="ux-steps" aria-label="Этапы анализа проекта" className="nc-ux-steps grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['1 · ОКЭД','2 · Территория','3 · Анализ','4 · Заключение'].map((label,index)=>{
            const ready=index===0?Boolean(query.oked_code):index===1?Boolean(query.region_name&&(query.location_level!=='region'||query.district_name)):analysisState==='done';
            return <div key={label} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${ready?'nc-ux-step-complete':'nc-ux-step-pending'}`}>{label}</div>;
          })}
        </section>
        {/* Единый рабочий стол: карта + параметры + readiness */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMapOpen((v) => !v)}
            className={`w-full nc-touch rounded-xl border px-3.5 py-2.5 flex items-center justify-between text-xs font-bold ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-900'
                : 'bg-[#060814] border-[#1E223D] text-[#F4F7FF]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Map className="w-4 h-4 text-[#00E5FF]" />
              {isMobileMapOpen ? 'Скрыть карту' : 'Открыть карту-справочник'}
            </span>
            {isMobileMapOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5 items-start nc-ux-workspace">
          <div className={`order-2 md:order-2 xl:order-1 xl:col-span-7 min-w-0 ${isMobileMapOpen ? 'block' : 'hidden md:block'}`}>
            <MioPrioritiesMap
              compactMode
              currentLocationName={query.location_name}
              currentOkedCode={query.oked_code}
              onSelectRegion={handleSelectRegionFromMap}
              onSelectOked={(code) => handleQueryChange({ oked_code: code })}
              onSelectDistrict={(districtName, settlementType, districtId, regionId, regionName) => handleQueryChange({
                location_name: districtName,
                location_level: 'district',
                region_id: regionId || query.region_id,
                region_name: regionName || query.region_name,
                district_id: districtId || '',
                district_name: districtName,
                settlement_type: settlementType || '',
                settlement_type_confirmed: settlementType === 'republican_city' || settlementType === 'regional_city' || settlementType === 'monotown'
              })}
              theme={theme}
              language={language}
              onOpenReport={handleOpenReport}
            />
          </div>

          <div className="order-1 md:order-1 xl:order-2 xl:col-span-5 min-w-0 xl:sticky xl:top-20 space-y-4">
            <QueryInputPanel
              query={query}
              onChange={handleQueryChange}
              isBroadOked={liveSummary.is_broad_oked}
              broadWarning={liveSummary.broad_oked_warning}
              theme={theme}
              language={language}
              clarificationCount={clarificationCount}
              recommendedClarifications={recommendedClarifications}
              onAnalyze={handleAnalyze}
              analysisState={analysisState}
            />

            <div className={`nc-surface-section p-4 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-[#0D1127]/95 border-[#1E223D] shadow-lg'
            }`}>
              <div className={`mb-3 text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Полнота данных · не вероятность одобрения
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-bold ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>Анализ</span>
                    <span className={`text-xs font-mono font-bold ${readiness.analysis_percent >= 80 ? 'text-emerald-400' : readiness.analysis_percent >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {readiness.analysis_percent}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-neutral-200' : 'bg-[#172036]'}`}>
                    <div className="h-full bg-cyan-400 transition-all" style={{ width: `${readiness.analysis_percent}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-bold ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>Досье</span>
                    <span className={`text-xs font-mono font-bold ${readiness.dossier_percent >= 90 ? 'text-emerald-400' : readiness.dossier_percent >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {readiness.dossier_percent}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-neutral-200' : 'bg-[#172036]'}`}>
                    <div className="h-full bg-purple-400 transition-all" style={{ width: `${readiness.dossier_percent}%` }} />
                  </div>
                </div>
              </div>

              <div className={`mt-3 text-[11px] leading-relaxed ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                {readiness.can_run_preliminary
                  ? 'Предварительный подбор уже доступен. Неполные данные не блокируют результат.'
                  : 'Укажите ОКЭД и территорию, чтобы запустить предварительный подбор.'}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-700' : 'bg-[#080A1A] border-[#1E223D] text-slate-300'}`}>
                  {liveSummary.exact_matches.length} точных
                </span>
                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono ${isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/30 border-amber-500/20 text-amber-300'}`}>
                  {clarificationCount} уточнений
                </span>
                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-600' : 'bg-[#080A1A] border-[#1E223D] text-slate-400'}`}>
                  {liveSummary.not_applicable.length} исключено
                </span>
              </div>

              {(readiness.analysis_missing.length > 0 || readiness.dossier_missing.length > 0) && (
                <div className={`mt-3 p-3 rounded-xl border text-[11px] ${isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-700' : 'bg-[#080A1A] border-[#1E223D] text-slate-300'}`}>
                  <div className="font-bold mb-1">Следующие шаги</div>
                  <div>
                    {readiness.analysis_missing.length > 0
                      ? `Для точности анализа: ${readiness.analysis_missing.slice(0, 3).join(', ')}${readiness.analysis_missing.length > 3 ? '…' : ''}`
                      : 'Анализ заполнен достаточно для уверенного предварительного заключения.'}
                  </div>
                </div>
              )}

              <button
                onClick={handleOpenReport}
                disabled={analysisState !== 'done'}
                className={`mt-3 w-full px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  analysisState !== 'done' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isLight ? 'bg-neutral-900 hover:bg-black text-white' : 'bg-[#00E5FF] hover:bg-[#33ebff] text-slate-950 shadow-[0_0_18px_rgba(0,229,255,0.35)]'
                }`}
              >
                <FileText className="w-4 h-4" />
                Сформировать отчёт
              </button>
            </div>
          </div>
        </div>

        {/* Краткий результат под рабочим столом */}
        <div
          ref={analysisResultRef}
          className={`nc-surface-section p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
            analysisState === 'done'
              ? isLight
                ? 'ring-2 ring-emerald-200'
                : 'ring-1 ring-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.08)]'
              : ''
          } ${
          isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-[#0D1127]/90 border-[#1E223D] shadow-lg'
        }`}>
          <div>
            <div className={`text-sm font-bold ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>Предварительный результат</div>
            <div className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-slate-400'}`}>
              {analysisState === 'done' && analyzedQuery
                ? `Анализ зафиксирован для ${analyzedQuery.location_name} и ОКЭД ${analyzedQuery.oked_code}: ${reportSummary.exact_matches.length} точных, ${reportSummary.possible_matches.length} возможных, ${reportSummary.needs_clarification.length + reportSummary.needs_verification.length} программ требуют уточнения/проверки.`
                : analysisState === 'stale'
                  ? 'Параметры проекта изменены после последнего анализа. Предварительный подбор уже обновлён автоматически — нажмите «Провести повторный анализ», чтобы зафиксировать новый результат.'
                  : query.location_name && query.oked_code
                    ? `Предварительный подбор: для ${query.location_name} и ОКЭД ${query.oked_code} найдено ${liveSummary.exact_matches.length} точных и ${liveSummary.possible_matches.length} возможных совпадений. Нажмите «Провести анализ», чтобы зафиксировать результат.`
                    : 'Заполните ОКЭД и территорию — система сразу покажет предварительный подбор программ.'}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => setIsAIExpertOpen(true)}
            disabled={analysisState !== 'done'}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
              analysisState !== 'done' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${
              isLight ? 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-200' : 'bg-violet-950/40 hover:bg-violet-900/50 text-violet-300 border-violet-500/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Expert
          </button>
          <button
            onClick={handleOpenReport}
            disabled={analysisState !== 'done'}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              analysisState !== 'done' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${
              isLight ? 'bg-neutral-900 hover:bg-black text-white' : 'bg-cyan-950/60 hover:bg-cyan-900/80 text-[#00E5FF] border border-cyan-500/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            Открыть заключение
          </button>
          </div>
        </div>

        {/* Информационный футер с дисклеймером NC Consulting */}
        <div className={`nc-surface-section p-4 rounded-xl border text-xs leading-relaxed ${
          isLight 
            ? 'bg-white border-neutral-200 text-neutral-600' 
            : 'bg-[#060814] border-[#1E223D] text-slate-400'
        }`}>
          <strong className={isLight ? 'text-neutral-900' : 'text-slate-200'}>NC Consulting: </strong>
          {t.footer.disclaimer}
        </div>
        </main>
      </div>

      <div className="md:hidden fixed left-3 right-3 bottom-[68px] z-40">
        <button
          type="button"
          disabled={!readiness.can_run_preliminary && analysisState !== 'done'}
          onClick={analysisState === 'done' ? handleOpenReport : handleAnalyze}
          className={`w-full min-h-[48px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
            (!readiness.can_run_preliminary && analysisState !== 'done')
              ? 'opacity-40 cursor-not-allowed bg-slate-700 text-slate-300 border-slate-600'
              : isLight
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg'
                : 'bg-[#00E5FF] text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.35)]'
          }`}
        >
          {analysisState === 'done'
            ? 'Сформировать отчёт'
            : analysisState === 'stale'
              ? 'Провести повторный анализ'
              : 'Провести анализ'}
        </button>
      </div>

      <AIExpertPanel
        isOpen={isAIExpertOpen}
        onClose={() => setIsAIExpertOpen(false)}
        context={expertContext}
        theme={theme}
        onApplyChanges={handleAIExpertApplyChanges}
      />

      {/* Модальное окно формирования экспертного заключения */}
      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        summary={reportSummary}
        theme={theme}
        language={language}
      />

      {/* Модальное окно Базы Знаний Даму */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        theme={theme}
      />

      {/* Модальное окно Приёмочных Тестов ТЗ */}
      <AcceptanceTestsModal
        isOpen={isAcceptanceTestsOpen}
        onClose={() => setIsAcceptanceTestsOpen(false)}
        onRunTest={handleRunAcceptanceTest}
        theme={theme}
      />
    </div>
  );
}
