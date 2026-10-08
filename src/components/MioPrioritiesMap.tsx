import React, { useState, useMemo } from 'react';
import { KAZAKHSTAN_MAP_REGIONS, MapRegionDef } from '../data/kazakhstanMapRegions';
import { MIO_REGIONS_DATABASE, checkMioEligibility, getRegionsWithPriorityOked, MioRegionProfile } from '../data/mioPriorityOkeds';
import { getDistrictsByRegion, MioDistrictItem, DistrictOkedItem } from '../data/kazakhstanDistricts';
import { getDamuProgramsForRegion, DamuDisplayProgram } from '../data/allDamuProgramsCatalog';
import { ThemeMode, Language } from '../i18n/translations';
import { 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  X, 
  Info, 
  ArrowRight,
  TrendingUp,
  Percent,
  Banknote,
  Compass,
  ChevronDown,
  Layers,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';

interface MioPrioritiesMapProps {
  currentLocationName: string;
  currentOkedCode: string;
  onSelectRegion: (regionName: string, level: 'city' | 'region', regionId?: string) => void;
  onSelectOked?: (code: string) => void;
  onSelectDistrict?: (districtName: string, settlementType?: 'monotown' | 'village' | 'regional_city' | 'republican_city' | 'any', districtId?: string, regionId?: string, regionName?: string) => void;
  theme: ThemeMode;
  language: Language;
  onClose?: () => void;
  onOpenReport?: () => void;
  compactMode?: boolean;
}

type MacroZone = 'all' | 'west' | 'north' | 'center' | 'east' | 'south' | 'cities';
type SidebarTab = 'districts' | 'programs' | 'overview';

export const MioPrioritiesMap: React.FC<MioPrioritiesMapProps> = ({
  currentLocationName,
  currentOkedCode,
  onSelectRegion,
  onSelectOked,
  onSelectDistrict,
  theme,
  language,
  onClose,
  onOpenReport,
  compactMode = false
}) => {
  const isLight = theme === 'light';
  const isKk = language === 'kk';
  const isEn = language === 'en';
  const isZh = language === 'zh';

  // Сводный каталог ОКЭД по территории: по умолчанию свернут, чтобы не перегружать рабочее пространство.
  const [isDistrictDirectoryOpen, setIsDistrictDirectoryOpen] = useState(false);

  // Фильтр по категории программ Даму
  const [programCategoryFilter, setProgramCategoryFilter] = useState<'all' | 'subsidy' | 'guarantee' | 'loan' | 'quota'>('all');
  const [programSearchQuery, setProgramSearchQuery] = useState('');

  // Фильтр отраслей (ОКЭД) внутри открытого района/города
  const [districtOkedCategory, setDistrictOkedCategory] = useState<string>('all');
  const [districtOkedSearch, setDistrictOkedSearch] = useState<string>('');

  // Фильтр по коду ОКЭД на карте
  const [okedFilter, setOkedFilter] = useState(currentOkedCode || '');
  
  // Макро-зона для быстрой фильтрации на карте
  const [activeZone, setActiveZone] = useState<MacroZone>('all');

  // Активная вкладка в правом сайдбаре: по умолчанию 'districts' (районы и поддерживаемые ОКЭДы)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('districts');

  // Поисковый запрос внутри списка районов выбранного региона
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');

  // Выбранный регион на карте
  const [selectedRegionId, setSelectedRegionId] = useState<string>(() => {
    const lower = (currentLocationName || '').toLowerCase();
    const found = KAZAKHSTAN_MAP_REGIONS.find(r => 
      lower.includes(r.name.toLowerCase()) || 
      lower.includes(r.center.toLowerCase()) ||
      r.id.toLowerCase().includes(lower)
    );
    return found ? found.id : 'aktobe-region'; // По умолчанию Актюбинская область или выбранная
  });

  // Синхронизация выбора из формы с картой.
  React.useEffect(() => {
    const lower = (currentLocationName || '').toLowerCase().trim();
    if (!lower) return;
    const found = KAZAKHSTAN_MAP_REGIONS.find(r =>
      lower.includes(r.name.toLowerCase()) ||
      r.name.toLowerCase().includes(lower) ||
      lower.includes(r.center.toLowerCase())
    );
    if (found && found.id !== selectedRegionId) {
      setSelectedRegionId(found.id);
    }
  }, [currentLocationName]);

  // Синхронизация ОКЭД из формы с фильтром карты.
  React.useEffect(() => {
    setOkedFilter(currentOkedCode || '');
  }, [currentOkedCode]);

  // Раскрытый район в аккордеоне (по умолчанию первый район)
  const [expandedDistrictId, setExpandedDistrictId] = useState<string | null>(null);

  // Наведение курсора для всплывающей подсказки (HUD Tooltip)
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Список регионов, где введенный код ОКЭД в приоритете МИО
  const priorityRegionIds = useMemo(() => {
    if (!okedFilter.trim()) return [];
    return getRegionsWithPriorityOked(okedFilter);
  }, [okedFilter]);

  // Данные выбранного региона
  const selectedProfile: MioRegionProfile | undefined = useMemo(() => {
    return MIO_REGIONS_DATABASE[selectedRegionId];
  }, [selectedRegionId]);

  const selectedRegionDef: MapRegionDef | undefined = useMemo(() => {
    return KAZAKHSTAN_MAP_REGIONS.find(r => r.id === selectedRegionId);
  }, [selectedRegionId]);

  // Список районов для выбранного региона
  const regionDistricts: MioDistrictItem[] = useMemo(() => {
    if (!selectedRegionDef) return [];
    return getDistrictsByRegion(selectedRegionId, selectedRegionDef.name);
  }, [selectedRegionId, selectedRegionDef]);

  // Автоматически открывать первый район при смене региона
  React.useEffect(() => {
    if (regionDistricts.length > 0) {
      setExpandedDistrictId(regionDistricts[0].id);
    }
  }, [selectedRegionId]);

  // Отфильтрованные районы по поиску
  const filteredDistricts = useMemo(() => {
    if (!districtSearchQuery.trim()) return regionDistricts;
    const q = districtSearchQuery.toLowerCase().trim();
    return regionDistricts.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.center.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.supportedOkeds.some(o => o.code.includes(q) || o.name.toLowerCase().includes(q) || o.category.toLowerCase().includes(q))
    );
  }, [regionDistricts, districtSearchQuery]);

  // Все программы Фонда «Даму» и региональные программы для выбранного региона
  const allRegionPrograms: DamuDisplayProgram[] = useMemo(() => {
    return getDamuProgramsForRegion(selectedRegionId);
  }, [selectedRegionId]);

  // Отфильтрованные программы по категориям и строке поиска
  const filteredPrograms = useMemo(() => {
    let list = allRegionPrograms;

    if (programCategoryFilter === 'subsidy') {
      list = list.filter(p => p.category === 'subsidy');
    } else if (programCategoryFilter === 'guarantee') {
      list = list.filter(p => p.category === 'guarantee');
    } else if (programCategoryFilter === 'loan') {
      list = list.filter(p => p.category === 'loan');
    } else if (programCategoryFilter === 'quota') {
      list = list.filter(p => p.category === 'quota' || p.category === 'leasing');
    }

    if (programSearchQuery.trim()) {
      const q = programSearchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nameKk.toLowerCase().includes(q) ||
        p.family.toLowerCase().includes(q) ||
        p.purposeText.toLowerCase().includes(q) ||
        p.priorityText.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allRegionPrograms, programCategoryFilter, programSearchQuery]);

  // Данные региона под курсором
  const hoveredProfile: MioRegionProfile | undefined = useMemo(() => {
    return hoveredRegionId ? MIO_REGIONS_DATABASE[hoveredRegionId] : undefined;
  }, [hoveredRegionId]);

  const hoveredRegionDef: MapRegionDef | undefined = useMemo(() => {
    return hoveredRegionId ? KAZAKHSTAN_MAP_REGIONS.find(r => r.id === hoveredRegionId) : undefined;
  }, [hoveredRegionId]);

  // Проверка соответствия выбранного ОКЭД в данном регионе
  const eligibility = useMemo(() => {
    return checkMioEligibility(selectedRegionId, okedFilter);
  }, [selectedRegionId, okedFilter]);

  // Проверка соответствия в hovered регионе
  const hoveredEligibility = useMemo(() => {
    return hoveredRegionId ? checkMioEligibility(hoveredRegionId, okedFilter) : undefined;
  }, [hoveredRegionId, okedFilter]);

  // Группировка макро-зон
  const isRegionInActiveZone = (regionId: string): boolean => {
    if (activeZone === 'all') return true;
    if (activeZone === 'cities') return ['astana-city', 'almaty-city', 'shymkent-city'].includes(regionId);
    if (activeZone === 'west') return ['west-kz-region', 'atyrau-region', 'mangystau-region', 'aktobe-region'].includes(regionId);
    if (activeZone === 'north') return ['kostanay-region', 'north-kz-region', 'akmola-region', 'pavlodar-region'].includes(regionId);
    if (activeZone === 'center') return ['karaganda-region', 'ulytau-region'].includes(regionId);
    if (activeZone === 'east') return ['east-kz-region', 'abay-region'].includes(regionId);
    if (activeZone === 'south') return ['zhambyl-region', 'turkestan-region', 'kyzylorda-region', 'almaty-region', 'zhetysu-region'].includes(regionId);
    return true;
  };

  const handleRegionClick = (regionId: string) => {
    setSelectedRegionId(regionId);
  };

  const handleApplyToQuery = () => {
    if (!selectedRegionDef) return;
    const level = selectedRegionDef.isCity ? 'city' : 'region';
    onSelectRegion(selectedRegionDef.name, level, selectedRegionId);
  };

  const handleSelectSpecificOked = (code: string) => {
    setOkedFilter(code);
    if (onSelectOked) {
      onSelectOked(code);
    }
  };

  const handleSelectDistrictRow = (district: MioDistrictItem) => {
    if (!selectedRegionDef) return;

    const isRepublicanCityRegion = ['astana-city', 'almaty-city', 'shymkent-city'].includes(selectedRegionId);
    const settlementType = district.type === 'monotown'
      ? 'monotown'
      : district.type === 'city'
        ? (isRepublicanCityRegion ? 'republican_city' : 'regional_city')
        : 'any';

    // Сначала фиксируем регион, затем конкретную территорию.
    onSelectRegion(
      selectedRegionDef.name,
      selectedRegionDef.isCity ? 'city' : 'region',
      selectedRegionId
    );

    if (onSelectDistrict) {
      onSelectDistrict(
        district.name,
        settlementType,
        district.id,
        selectedRegionId,
        selectedRegionDef.name
      );
    }
  };

  return (
    <div className={`nc-surface-section rounded-2xl border transition-all duration-300 overflow-hidden relative ${
      isLight 
        ? 'bg-white border-neutral-200 shadow-md' 
        : 'bg-[#060814] border-[#172036] shadow-[0_0_50px_-10px_rgba(0,0,0,0.9)]'
    }`}>
      {/* Шапка интерактивной карты */}
      <div className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
        isLight ? 'border-neutral-200 bg-neutral-50/90' : 'border-[#172036] bg-[#02040A]'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wider font-bold border transition-all ${
              isLight 
                ? 'bg-sky-50 text-sky-800 border-sky-300' 
                : 'bg-cyan-950/60 text-[#00E5FF] border-cyan-500/40 shadow-[0_0_12px_rgba(0,229,255,0.35)]'
            }`}>
              {isKk ? 'Өңірлер мен аудандар' : isEn ? 'Regions & Districts' : isZh ? '各州及区县' : 'Регионы и районы'}
            </span>
            <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
              · {isKk ? '17 облыс + 3 мегаполис' : isEn ? '17 regions + 3 metropolises' : isZh ? '17个州 + 3个直辖市' : '17 областей + 3 города'}
            </span>
          </div>

          <h3 className={`text-base sm:text-lg font-extrabold tracking-tight mt-1 flex items-center gap-2 ${
            isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
          }`}>
            <span>{isKk ? 'Қазақстанның нақты векторлық картасы' : isEn ? 'Interactive Vector Map of Kazakhstan' : isZh ? '哈萨克斯坦交互式高精度矢量地图' : 'Интерактивная карта регионов и районов Казахстана'}</span>
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-emerald-500' : 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'}`} />
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-600' : 'text-slate-400'}`}>
            {isKk 
              ? 'Аймақты немесе ауданды басып, субсидияланатын нақты ОКЭД-тер мен басымдықтар тізімін көріңіз.' 
              : isEn
                ? 'Click any region or district to view subsidized OKED codes and priorities.'
                : isZh
                  ? '点击任意州或区县，即可查看该地区支持的贴息行业代码及重点扶持名录。'
                  : 'Кликните на любой регион: справа откроется интерактивный перечень районов с поддерживаемыми кодами ОКЭД.'}
          </p>
        </div>

        {/* Фильтр по ОКЭД и кнопка закрытия */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-neutral-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={okedFilter}
              onChange={(e) => setOkedFilter(e.target.value)}
              placeholder={isKk ? 'ОКЭД (мыс. 10.51, 25.11)' : isEn ? 'Filter by OKED (e.g. 25.11)' : isZh ? '按 OKED 代码过滤（如 25.11）' : 'Фильтр по ОКЭД (напр. 25.11)'}
              className={`w-44 sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-xl border font-mono transition-all outline-none ${
                isLight
                  ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                  : 'bg-[#02040A] border-[#172036] text-[#00E5FF] placeholder-slate-500 focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              }`}
            />
            {okedFilter && (
              <button 
                onClick={() => setOkedFilter('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition-all ${
                isLight 
                  ? 'border-neutral-300 text-neutral-600 hover:bg-neutral-200' 
                  : 'border-[#172036] text-slate-400 hover:text-white hover:bg-[#02040A]'
              }`}
              title="Закрыть карту"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Быстрые фильтры по макро-регионам Казахстана */}
      <div className={`px-4 sm:px-5 py-2.5 border-b flex flex-wrap items-center gap-1.5 text-xs font-mono ${
        isLight ? 'bg-neutral-100/60 border-neutral-200' : 'bg-[#02040A]/60 border-[#172036]'
      }`}>
        <span className={`text-[11px] font-bold mr-1 flex items-center gap-1 ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isKk ? 'Аймақтар:' : isEn ? 'Zones:' : isZh ? '大区:' : 'Зоны:'}</span>
        </span>

        {[
          { id: 'all', label: isKk ? 'Барлығы (20)' : isEn ? 'All (20)' : isZh ? '全部 (20)' : 'Все (20)' },
          { id: 'cities', label: isKk ? '★ Мегаполистер' : isEn ? '★ Metropolises' : isZh ? '★ 直辖市' : '★ Мегаполисы' },
          { id: 'west', label: isKk ? 'Батыс' : isEn ? 'West' : isZh ? '西部' : 'Запад' },
          { id: 'north', label: isKk ? 'Солтүстік' : isEn ? 'North' : isZh ? '北部' : 'Север' },
          { id: 'center', label: isKk ? 'Орталық' : isEn ? 'Center' : isZh ? '中部' : 'Центр' },
          { id: 'south', label: isKk ? 'Оңтүстік' : isEn ? 'South' : isZh ? '南部' : 'Юг' },
          { id: 'east', label: isKk ? 'Шығыс' : isEn ? 'East' : isZh ? '东部' : 'Восток' },
        ].map((zone) => (
          <button
            key={zone.id}
            onClick={() => setActiveZone(zone.id as MacroZone)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeZone === zone.id
                ? isLight
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-[#00E5FF] text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                : isLight
                  ? 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                  : 'bg-[#060814] text-slate-400 hover:text-white border border-[#172036]'
            }`}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {/* Основная сетка: Точная векторная карта слева + Детализация районов и ОКЭД справа */}
      <div className={compactMode ? "grid grid-cols-1 gap-0 divide-y divide-neutral-200 dark:divide-[#172036]" : "grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 dark:divide-[#172036]"}>
        
        {/* Левая колонка: Высокоточная векторная карта Казахстана */}
        <div className={compactMode ? "p-3 sm:p-5 flex flex-col justify-between relative" : "lg:col-span-7 p-3 sm:p-5 flex flex-col justify-between relative"}>
          
          {/* Индикатор соответствия по ОКЭД */}
          {okedFilter.trim() && (
            <div className={`mb-3 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
              priorityRegionIds.length > 0
                ? isLight 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_18px_-3px_rgba(16,185,129,0.35)]'
                : isLight 
                  ? 'bg-amber-50 border-amber-300 text-amber-900' 
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  {isKk ? 'ОКЭД бойынша басымдық берілген өңірлер:' : 'Регионы, где данный ОКЭД поддержан МИО:'}{' '}
                  <strong className="font-mono text-sm">{priorityRegionIds.length} из 20</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono opacity-80">
                {priorityRegionIds.length > 0 ? 'Подсвечены неоном на карте' : 'Нет прямых региональных льгот'}
              </span>
            </div>
          )}

          {compactMode && selectedProfile && (
            <div className={`mb-3 p-3 rounded-xl border ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#02040A] border-[#172036]'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className={`text-xs font-bold ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                    {selectedProfile.regionName}
                  </div>
                  <div className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-slate-400'}`}>
                    {selectedProfile.description}
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-1 rounded-md border text-[10px] font-mono ${
                  isLight ? 'bg-white border-neutral-200 text-neutral-600' : 'bg-[#060814] border-[#172036] text-cyan-300'
                }`}>
                  {selectedProfile.center}
                </span>
              </div>
              <div className={`mt-2 pt-2 border-t text-[11px] leading-relaxed ${
                isLight ? 'border-neutral-200 text-neutral-700' : 'border-[#172036] text-slate-300'
              }`}>
                <strong className={isLight ? 'text-neutral-900' : 'text-amber-300'}>Приоритеты региона: </strong>
                {selectedProfile.specialization}
              </div>
            </div>
          )}

          {/* SVG полотно точной географической карты Казахстана */}
          <div className="relative w-full aspect-[1000/620] bg-transparent select-none overflow-hidden rounded-2xl">
            <svg 
              viewBox="0 0 1000 620" 
              className="w-full h-full drop-shadow-xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="selectedRegionNeonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.88" />
                </linearGradient>

                <linearGradient id="selectedRegionLightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.9" />
                </linearGradient>

                <filter id="neonPulseGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <filter id="hubRadarGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Фоновая координатная технологичная сетка */}
              <g opacity={isLight ? 0.07 : 0.12} stroke={isLight ? '#000000' : '#00E5FF'} strokeWidth="0.5" strokeDasharray="4 8">
                <line x1="200" y1="0" x2="200" y2="620" />
                <line x1="400" y1="0" x2="400" y2="620" />
                <line x1="600" y1="0" x2="600" y2="620" />
                <line x1="800" y1="0" x2="800" y2="620" />
                <line x1="0" y1="180" x2="1000" y2="180" />
                <line x1="0" y1="360" x2="1000" y2="360" />
                <line x1="0" y1="500" x2="1000" y2="500" />
              </g>

              {/* 17 Областей РК */}
              {KAZAKHSTAN_MAP_REGIONS.filter(r => !r.isCity).map((region) => {
                const isSelected = region.id === selectedRegionId;
                const isHovered = region.id === hoveredRegionId;
                const isPriorityByOked = priorityRegionIds.includes(region.id);
                const isInActiveZone = isRegionInActiveZone(region.id);

                let fillColor = isLight ? '#f8fafc' : '#090d1c';
                let strokeColor = isLight ? '#cbd5e1' : '#172036';
                let strokeWidth = '1.2';
                let opacity = isInActiveZone ? 1 : 0.35;

                if (isPriorityByOked) {
                  fillColor = isLight ? '#e0f2fe' : '#082842';
                  strokeColor = isLight ? '#0284c7' : '#00E5FF';
                  strokeWidth = '1.8';
                }

                if (isHovered) {
                  fillColor = isLight ? '#f1f5f9' : '#121b3d';
                  strokeColor = isLight ? '#475569' : '#8B5CF6';
                  strokeWidth = '2';
                }

                if (isSelected) {
                  fillColor = isLight ? 'url(#selectedRegionLightGradient)' : 'url(#selectedRegionNeonGradient)';
                  strokeColor = '#ffffff';
                  strokeWidth = '2.5';
                }

                return (
                  <g 
                    key={region.id} 
                    role="button"
                    tabIndex={0}
                    aria-label={`Выбрать регион: ${region.name}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRegionClick(region.id); } }}
                    className="cursor-pointer transition-all duration-200"
                    style={{ opacity }}
                    onClick={() => handleRegionClick(region.id)}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                  >
                    <path
                      d={region.svgPath}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={isSelected ? 'url(#neonPulseGlow)' : undefined}
                      className="transition-all duration-200"
                    />

                    {/* Текстовая географическая метка региона */}
                    <text
                      x={region.labelX}
                      y={region.labelY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-mono pointer-events-none select-none transition-all duration-200"
                      fill={
                        isSelected 
                          ? '#ffffff' 
                          : isLight 
                            ? '#334155' 
                            : isPriorityByOked 
                              ? '#00E5FF' 
                              : '#94A3B8'
                      }
                      fontSize={isSelected ? "13" : "11"}
                      fontWeight={isSelected || isPriorityByOked ? "700" : "500"}
                    >
                      {region.code} {region.center.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* 3 Города республиканского значения */}
              {KAZAKHSTAN_MAP_REGIONS.filter(r => r.isCity).map((city) => {
                const isSelected = city.id === selectedRegionId;
                const isHovered = city.id === hoveredRegionId;
                const isPriorityByOked = priorityRegionIds.includes(city.id);
                const isInActiveZone = isRegionInActiveZone(city.id);

                return (
                  <g 
                    key={city.id} 
                    role="button"
                    tabIndex={0}
                    aria-label={`Выбрать город: ${city.name}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRegionClick(city.id); } }}
                    className="cursor-pointer"
                    style={{ opacity: isInActiveZone ? 1 : 0.4 }}
                    onClick={() => handleRegionClick(city.id)}
                    onMouseEnter={() => setHoveredRegionId(city.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                  >
                    {/* Концентрические радарные волны */}
                    <circle
                      cx={city.labelX}
                      cy={city.labelY}
                      r="24"
                      fill="none"
                      stroke={isLight ? '#0284c7' : '#00E5FF'}
                      strokeWidth="1.5"
                      opacity="0.6"
                      filter="url(#hubRadarGlow)"
                    >
                      <animate
                        attributeName="r"
                        values="10;32"
                        dur="2.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0"
                        dur="2.8s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    <circle
                      cx={city.labelX}
                      cy={city.labelY}
                      r="16"
                      fill={
                        isSelected 
                          ? isLight ? 'rgba(2,132,199,0.3)' : 'rgba(0,229,255,0.35)' 
                          : isPriorityByOked 
                            ? 'rgba(0,229,255,0.2)' 
                            : 'transparent'
                      }
                      stroke={
                        isSelected 
                          ? isLight ? '#0284c7' : '#00E5FF' 
                          : isHovered 
                            ? '#8B5CF6' 
                            : isLight ? '#475569' : '#F4F7FF'
                      }
                      strokeWidth="2"
                    />

                    {/* Внутренняя яркая точка мегаполиса */}
                    <circle
                      cx={city.labelX}
                      cy={city.labelY}
                      r={isSelected ? "8" : "6"}
                      fill={
                        isSelected 
                          ? '#ffffff' 
                          : isLight ? '#0f172a' : '#00E5FF'
                      }
                      stroke={isSelected ? '#00E5FF' : '#ffffff'}
                      strokeWidth="2"
                    />

                    {/* Название мегаполиса */}
                    <text
                      x={city.labelX}
                      y={city.labelY - (city.id === 'almaty-city' ? 22 : 20)}
                      textAnchor="middle"
                      className="font-mono font-bold pointer-events-none select-none"
                      fill={
                        isSelected 
                          ? isLight ? '#0284c7' : '#00E5FF' 
                          : isLight ? '#0f172a' : '#ffffff'
                      }
                      fontSize={isSelected ? "12" : "11"}
                    >
                      ★ {city.name.replace('г. ', '').split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Всплывающий интерактивный HUD Tooltip при наведении */}
            {hoveredProfile && hoveredRegionDef && hoveredRegionId !== selectedRegionId && (
              <div className={`absolute bottom-3 left-3 pointer-events-none p-3 rounded-xl border backdrop-blur-xl shadow-2xl max-w-xs animate-in fade-in duration-150 z-20 ${
                isLight 
                  ? 'bg-white/95 border-neutral-300 text-neutral-900' 
                  : 'bg-[#02040A]/95 border-[#172036] text-[#F4F7FF] shadow-[0_0_20px_rgba(0,0,0,0.8)]'
              }`}>
                <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-1.5">
                  <span className="font-bold text-xs">{hoveredProfile.regionName}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isLight ? 'bg-neutral-100 text-neutral-800' : 'bg-cyan-950 text-[#00E5FF]'
                  }`}>
                    {hoveredRegionDef.code}
                  </span>
                </div>
                <div className="text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Центр:</span>
                    <strong className="font-medium">{hoveredProfile.center}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Районов в базе:</span>
                    <strong className={`font-mono ${isLight ? 'text-sky-800' : 'text-cyan-400'}`}>
                      {getDistrictsByRegion(hoveredProfile.regionId, hoveredProfile.regionName).length}
                    </strong>
                  </div>
                  {hoveredEligibility?.isPriority && (
                    <div className="text-emerald-400 font-bold text-[10px] flex items-center gap-1 pt-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>ОКЭД {okedFilter} в приоритете МИО</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Легенда карты с пояснениями */}
          <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
            isLight ? 'border-neutral-200 text-neutral-600' : 'border-[#172036] text-slate-400'
          }`}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${isLight ? 'bg-sky-600' : 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]'}`} />
                <span>{isKk ? 'Таңдалған өңір' : isEn ? 'Selected region' : isZh ? '选中地区' : 'Выбранный регион'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${isLight ? 'bg-sky-100 border border-sky-500' : 'bg-[#082842] border border-[#00E5FF]'}`} />
                <span>{isKk ? 'ОКЭД басым өңір' : isEn ? 'OKED Priority' : isZh ? '重点扶持地区' : 'Приоритет ОКЭД'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-amber-400">★</span>
                <span>{isKk ? 'Республикалық қалалар' : isEn ? 'Metropolises' : isZh ? '直辖市' : 'Мегаполисы'}</span>
              </span>
            </div>

            <span className="font-mono text-xs opacity-75">
              Точные границы 2026 · МИО & Даму
            </span>
          </div>
        </div>

        {/* Правая колонка: Детализация выбранного региона, список районов и поддерживаемых ОКЭД */}
        <div className={`${compactMode ? "" : "lg:col-span-5 "}p-4 sm:p-5 flex flex-col justify-between space-y-4 ${
          isLight ? 'bg-neutral-50/50' : 'bg-[#02040A]'
        }`}>
          {selectedProfile && selectedRegionDef ? (
            <div className="space-y-4">
              
              {/* Шапка правого сайдбара: Название, код и статус региона */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                    isLight 
                      ? 'bg-neutral-200 text-neutral-800' 
                      : 'bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  }`}>
                    КОД {selectedRegionDef.code} · {selectedRegionDef.isCity ? 'МЕГАПОЛИС' : 'ОБЛАСТЬ'}
                  </span>
                  
                  <span className={`text-xs flex items-center gap-1.5 font-medium ${
                    isLight ? 'text-neutral-600' : 'text-slate-300'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Центр: <strong>{selectedProfile.center}</strong></span>
                  </span>
                </div>

                <h4 className={`text-xl font-extrabold tracking-tight mt-2 ${
                  isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
                }`}>
                  {selectedProfile.regionName}
                </h4>
                
                <p className={`text-xs mt-1 leading-relaxed ${
                  isLight ? 'text-neutral-600' : 'text-slate-400'
                }`}>
                  {selectedProfile.description}
                </p>
              </div>

              {/* Табы правого сайдбара: 1. Районы и ОКЭДы | 2. Программы МИО | 3. Специализация */}
              <div className={`flex items-center p-1 rounded-xl border text-xs font-mono font-bold ${
                isLight ? 'bg-neutral-200/80 border-neutral-300' : 'bg-[#060814] border-[#172036]'
              }`}>
                <button
                  type="button"
                  onClick={() => setSidebarTab('districts')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    sidebarTab === 'districts'
                      ? isLight
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'bg-[#00E5FF] text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : isLight
                        ? 'text-neutral-600 hover:text-black'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Справочник: Города и Районы ({regionDistricts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarTab('programs')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    sidebarTab === 'programs'
                      ? isLight
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'bg-[#00E5FF] text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : isLight
                        ? 'text-neutral-600 hover:text-black'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Программы «Даму» ({allRegionPrograms.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSidebarTab('overview')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer hidden sm:flex ${
                    sidebarTab === 'overview'
                      ? isLight
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'bg-[#00E5FF] text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : isLight
                        ? 'text-neutral-600 hover:text-black'
                        : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Инфо</span>
                </button>
              </div>

              {/* 1. ВКЛАДКА: РЕГИОНАЛЬНЫЙ СПРАВОЧНИК: ГОРОДА, РАЙОНЫ И ВСЕ ОКЭД ПО ПРОГРАММАМ ДАМУ */}
              {sidebarTab === 'districts' && (
                <div className="space-y-3">
                  {/* Компактный вход в сводный каталог ОКЭД и программ поддержки. */}
                  <div className={`rounded-xl border overflow-hidden ${
                    isLight
                      ? 'bg-sky-50/70 border-sky-200'
                      : 'bg-cyan-950/20 border-cyan-500/25'
                  }`}>
                    <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`flex items-center gap-2 text-xs font-bold ${
                          isLight ? 'text-sky-950' : 'text-cyan-200'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>ОКЭД и программы поддержки по территории</span>
                        </div>
                        <p className={`mt-1 text-[11px] leading-relaxed ${
                          isLight ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          Сводный каталог по подключённым маршрутам поддержки: МИО / «Іскер аймақ», «Өрлеу», торговля, АПК, IT, логистика и социальные направления. Это не полный классификатор ОКЭД РК.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsDistrictDirectoryOpen((v) => !v)}
                        className={`nc-touch shrink-0 px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          isLight
                            ? 'bg-white border-sky-200 text-sky-900 hover:border-sky-400'
                            : 'bg-[#0D1127] border-cyan-500/30 text-[#00E5FF] hover:border-cyan-400/60'
                        }`}
                        aria-expanded={isDistrictDirectoryOpen}
                      >
                        <span>{isDistrictDirectoryOpen ? 'Скрыть каталог' : 'Показать ОКЭД и программы'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDistrictDirectoryOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <div className={`px-3 py-2 border-t flex flex-wrap gap-2 text-[10px] font-mono ${
                      isLight ? 'bg-white/60 border-sky-100 text-slate-600' : 'bg-[#080A1A]/60 border-cyan-500/15 text-slate-400'
                    }`}>
                      <span>{regionDistricts.length} городов и районов</span>
                      <span>•</span>
                      <span>«МИО» = официальные районные приоритеты</span>
                      <span>•</span>
                      <span>«Все» = сводный каталог подключённых программ</span>
                    </div>
                  </div>

                  {isDistrictDirectoryOpen && (
                    <>
                  {/* Поиск внутри районов выбранного региона */}
                  <div className="relative">
                    <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                      isLight ? 'text-neutral-400' : 'text-slate-400'
                    }`} />
                    <input
                      type="text"
                      value={districtSearchQuery}
                      onChange={(e) => setDistrictSearchQuery(e.target.value)}
                      placeholder={`Поиск района или ОКЭД в ${selectedProfile.shortName}...`}
                      className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border font-mono transition-all outline-none ${
                        isLight
                          ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black'
                          : 'bg-[#060814] border-[#172036] text-[#F4F7FF] placeholder-slate-500 focus:border-[#00E5FF]'
                      }`}
                    />
                    {districtSearchQuery && (
                      <button
                        onClick={() => setDistrictSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Список районов (Аккордеон) */}
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map((district) => {
                        const isExpanded = expandedDistrictId === district.id;
                        const hasMatchingOked = okedFilter && district.supportedOkeds.some(o => o.code.startsWith(okedFilter) || okedFilter.startsWith(o.code));

                        return (
                          <div
                            key={district.id}
                            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                              isExpanded
                                ? isLight
                                  ? 'bg-white border-neutral-300 shadow-sm ring-1 ring-neutral-300'
                                  : 'bg-[#060814] border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.15)] ring-1 ring-cyan-500/40'
                                : isLight
                                  ? 'bg-white border-neutral-200 hover:border-neutral-300'
                                  : 'bg-[#060814]/80 border-[#172036] hover:border-slate-700'
                            } ${hasMatchingOked ? (isLight ? 'border-emerald-300 bg-emerald-50/20' : 'border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]') : ''}`}
                          >
                            {/* Заголовок строки района (Кликабельный) */}
                            <button
                              type="button"
                              onClick={() => setExpandedDistrictId(isExpanded ? null : district.id)}
                              className="w-full p-3 text-left flex items-center justify-between gap-2 cursor-pointer touch-manipulation"
                            >
                              <div className="min-w-0 pr-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`text-xs font-bold ${
                                    isExpanded 
                                      ? (isLight ? 'text-black' : 'text-[#00E5FF]') 
                                      : (isLight ? 'text-neutral-900' : 'text-[#F4F7FF]')
                                  }`}>
                                    {district.name}
                                  </span>

                                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                                    district.type === 'monotown'
                                      ? isLight ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold' : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                      : district.type === 'city'
                                        ? isLight ? 'bg-sky-100 text-sky-900 border-sky-300 font-semibold' : 'bg-cyan-950/60 text-[#00E5FF] border-cyan-500/40'
                                        : isLight ? 'bg-neutral-100 text-neutral-700 border-neutral-200' : 'bg-[#02040A] text-slate-400 border-[#172036]'
                                  }`}>
                                    {district.typeLabel.split('/')[0]}
                                  </span>

                                  {hasMatchingOked && (
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                      isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                    }`}>
                                      ★ ОКЭД совпал
                                    </span>
                                  )}
                                </div>

                                <div className={`text-[11px] font-mono mt-0.5 truncate ${
                                  isLight ? 'text-neutral-500' : 'text-slate-400'
                                }`}>
                                  Центр: {district.center} · <strong className={isLight ? 'text-neutral-700' : 'text-slate-300'}>Условия финансирования — по выбранной программе</strong>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                  isLight ? 'bg-neutral-100 text-neutral-800' : 'bg-[#02040A] text-cyan-300 border border-cyan-500/30'
                                }`}>
                                  {district.supportedOkeds.length} ОКЭД · сводно
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-cyan-400' : 'text-slate-400'
                                }`} />
                              </div>
                            </button>

                            {/* Раскрывающийся блок: Специализация и список поддерживаемых ОКЭД */}
                            {isExpanded && (
                              <div className={`p-3.5 pt-0 border-t space-y-3 animate-in fade-in duration-150 ${
                                isLight ? 'border-neutral-100' : 'border-[#172036]'
                              }`}>
                                
                                {/* Специализация района */}
                                <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                                  isLight ? 'bg-neutral-100/70 text-neutral-700' : 'bg-[#02040A] text-slate-300'
                                }`}>
                                  <strong className={isLight ? 'text-neutral-900 font-semibold' : 'text-slate-200 font-semibold'}>
                                    Профиль и специфика района: 
                                  </strong>{' '}
                                  {district.specialization}
                                </div>

                                {/* Условия зависят от конкретной программы; район сам по себе не задаёт ставку или гарантию. */}
                                <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                                  isLight ? 'bg-sky-50 border-sky-200 text-slate-700' : 'bg-cyan-950/20 border-cyan-500/20 text-slate-300'
                                }`}>
                                  <strong className={isLight ? 'text-sky-900' : 'text-cyan-300'}>Финансовые условия:</strong>{' '}
                                  ставка, лимит, субсидия и гарантия показываются после выбора конкретной программы и проверки её действующих условий.
                                </div>

                                {/* СПИСОК ПРИОРИТЕТНЫХ ОКЭД В ЭТОМ РАЙОНЕ */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className={`font-bold flex items-center gap-1.5 ${
                                      isLight ? 'text-neutral-900' : 'text-[#00E5FF]'
                                    }`}>
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>Сводный каталог ОКЭД в «{district.name}»:</span>
                                    </span>
                                    <span className="text-[11px] font-mono opacity-70">
                                      {district.supportedOkeds.length} ОКЭД · МИО: {district.supportedOkeds.filter((oked) => oked.programTag?.includes('Іскер') || oked.category === 'Приоритет МИО').length}
                                    </span>
                                  </div>

                                  {/* Фильтры категорий отраслей внутри открытого района */}
                                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                                    {[
                                      { id: 'all', label: `Все (${district.supportedOkeds.length})` },
                                      { id: 'manufacturing', label: 'Промышленность («Өрлеу»)' },
                                      { id: 'trade', label: 'Торговля (Даму)' },
                                      { id: 'apk', label: 'АПК & Фермерство' },
                                      { id: 'services', label: 'IT & Логистика' },
                                      { id: 'social', label: 'Соцсфера & Село' },
                                      { id: 'mio', label: 'Приоритеты МИО' }
                                    ].map((cat) => (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setDistrictOkedCategory(cat.id)}
                                        className={`px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                          districtOkedCategory === cat.id
                                            ? isLight
                                              ? 'bg-neutral-900 text-white border-black font-bold'
                                              : 'bg-cyan-950 text-[#00E5FF] border-cyan-500 font-bold shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                                            : isLight
                                              ? 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:border-neutral-300'
                                              : 'bg-[#02040A] text-slate-400 border-[#172036] hover:border-slate-700'
                                        }`}
                                      >
                                        {cat.label}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Поиск ОКЭД внутри района */}
                                  <div className="relative">
                                    <Search className={`w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                                      isLight ? 'text-neutral-400' : 'text-slate-400'
                                    }`} />
                                    <input
                                      type="text"
                                      value={districtOkedSearch}
                                      onChange={(e) => setDistrictOkedSearch(e.target.value)}
                                      placeholder={`Поиск ОКЭД в ${district.name} (по коду, отрасли, названию)...`}
                                      className={`w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border font-mono transition-all outline-none ${
                                        isLight
                                          ? 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-black'
                                          : 'bg-[#02040A] border-[#172036] text-[#F4F7FF] placeholder-slate-500 focus:border-[#00E5FF]'
                                      }`}
                                    />
                                    {districtOkedSearch && (
                                      <button
                                        type="button"
                                        onClick={() => setDistrictOkedSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Список ОКЭД района с бейджами программ Даму */}
                                  <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                                    {district.supportedOkeds
                                      .filter((oked) => {
                                        if (districtOkedCategory === 'manufacturing') {
                                          if (!oked.programTag?.includes('Өрлеу') && !['Пищепром', 'Машиностроение', 'Металлообработка', 'Легпром', 'Стройматериалы', 'Химпром', 'Фармацевтика', 'Деревообработка', 'Металлургия'].includes(oked.category)) {
                                            return false;
                                          }
                                        } else if (districtOkedCategory === 'trade') {
                                          if (oked.category !== 'Торговля' && !oked.code.startsWith('46') && !oked.code.startsWith('47') && !oked.code.startsWith('68.20')) {
                                            return false;
                                          }
                                        } else if (districtOkedCategory === 'apk') {
                                          if (oked.category !== 'АПК' && !oked.category.includes('АПК') && !oked.code.startsWith('01') && !oked.code.startsWith('03')) {
                                            return false;
                                          }
                                        } else if (districtOkedCategory === 'services') {
                                          if (!['IT', 'Логистика', 'Инжиниринг', 'Туризм'].includes(oked.category)) {
                                            return false;
                                          }
                                        } else if (districtOkedCategory === 'social') {
                                          if (!['Медицина', 'Образование', 'Ветеринария', 'Спорт', 'Досуг'].includes(oked.category) && !oked.programTag?.includes('дипломом')) {
                                            return false;
                                          }
                                        } else if (districtOkedCategory === 'mio') {
                                          if (!oked.programTag?.includes('Іскер') && oked.category !== 'Приоритет МИО') {
                                            return false;
                                          }
                                        }

                                        if (districtOkedSearch.trim()) {
                                          const q = districtOkedSearch.toLowerCase().trim();
                                          return (
                                            oked.code.toLowerCase().includes(q) ||
                                            oked.name.toLowerCase().includes(q) ||
                                            oked.category.toLowerCase().includes(q) ||
                                            (oked.programTag && oked.programTag.toLowerCase().includes(q))
                                          );
                                        }

                                        return true;
                                      })
                                      .map((oked) => {
                                        const isMatch = okedFilter && (oked.code.startsWith(okedFilter) || okedFilter.startsWith(oked.code));

                                        return (
                                          <div
                                            key={oked.code}
                                            onClick={() => handleSelectSpecificOked(oked.code)}
                                            className={`p-2 rounded-lg border text-xs transition-all cursor-pointer flex items-start justify-between gap-2 ${
                                              isMatch
                                                ? isLight
                                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium'
                                                  : 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-medium'
                                                : isLight
                                                  ? 'bg-neutral-50/80 border-neutral-200 hover:border-black text-neutral-800'
                                                  : 'bg-[#02040A] border-[#172036] hover:border-cyan-500/50 text-slate-300'
                                            }`}
                                            title="Нажмите, чтобы применить этот ОКЭД в расчет"
                                          >
                                            <div className="space-y-0.5 min-w-0 pr-1">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`font-mono font-bold text-xs ${
                                                  isMatch 
                                                    ? (isLight ? 'text-emerald-800' : 'text-emerald-400 text-glow-emerald') 
                                                    : (isLight ? 'text-sky-800' : 'text-[#00E5FF]')
                                                }`}>
                                                  {oked.code}
                                                </span>

                                                {oked.programTag && (
                                                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                                                    oked.programTag.includes('Өрлеу')
                                                      ? isLight ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-cyan-950 text-[#00E5FF] border-cyan-500/40'
                                                      : oked.programTag.includes('Торговля')
                                                        ? isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                                        : oked.programTag.includes('АПК')
                                                          ? isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                                          : isLight ? 'bg-neutral-200/80 text-neutral-700' : 'bg-neutral-900 text-slate-300 border-slate-700'
                                                  }`}>
                                                    {oked.programTag}
                                                  </span>
                                                )}

                                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border opacity-80 ${
                                                  isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-900 text-slate-400 border-slate-700'
                                                }`}>
                                                  {oked.category}
                                                </span>
                                              </div>
                                              <div className="text-xs leading-snug">
                                                {oked.name}
                                              </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                              {oked.programTag && (
                                                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                                  isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-[#11172E] text-slate-400'
                                                }`}>
                                                  условия по программе
                                                </span>
                                              )}
                                              <span className={`text-[10px] font-mono underline ${
                                                isMatch ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                                              }`}>
                                                {isMatch ? '✓ Выбран' : 'Применить'}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>

                                {/* Кнопка выбора конкретно этого района */}
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectDistrictRow(district)}
                                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                                      isLight
                                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300'
                                        : 'bg-[#101426] hover:bg-[#182038] text-[#00E5FF] border border-cyan-500/30 hover:border-cyan-500/60'
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Выбрать район «{district.name}» для расчета</span>
                                  </button>
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className={`p-6 text-center text-xs rounded-xl border ${
                        isLight ? 'bg-neutral-50 text-neutral-500' : 'bg-[#02040A] text-slate-400 border-[#172036]'
                      }`}>
                        Районы по запросу «{districtSearchQuery}» не найдены
                      </div>
                    )}
                  </div>
                    </>
                  )}
                </div>
              )}

              {/* 2. ВКЛАДКА: ВСЕ ДЕЙСТВУЮЩИЕ ПРОГРАММЫ ФОНДА «ДАМУ» И ГОСПРОГРАММЫ */}
              {sidebarTab === 'programs' && (
                <div className="space-y-3">
                  {/* Кнопка мгновенного отчета по региону */}
                  {onOpenReport && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRegion(selectedProfile.regionName, selectedRegionDef.isCity ? 'city' : 'region');
                        onOpenReport();
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        isLight
                          ? 'bg-neutral-900 hover:bg-black text-white'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>Сформировать полный отчёт по региону {selectedProfile.shortName}</span>
                    </button>
                  )}

                  {/* Фильтры категорий программ */}
                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                    {[
                      { key: 'all', label: `Все (${allRegionPrograms.length})` },
                      { key: 'subsidy', label: 'Субсидии (12.6%)' },
                      { key: 'guarantee', label: 'Гарантии (до 85%)' },
                      { key: 'loan', label: 'Кредиты («Өрлеу»)' },
                      { key: 'quota', label: 'Квоты & Лизинг' }
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setProgramCategoryFilter(cat.key as any)}
                        className={`px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          programCategoryFilter === cat.key
                            ? isLight
                              ? 'bg-neutral-900 text-white border-black font-bold shadow-xs'
                              : 'bg-cyan-950 text-[#00E5FF] border-cyan-500/60 shadow-[0_0_10px_rgba(0,229,255,0.3)] font-bold'
                            : isLight
                              ? 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                              : 'bg-[#060814] text-slate-400 border-[#172036] hover:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Быстрый поиск программ внутри региона */}
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isLight ? 'text-neutral-400' : 'text-[#00E5FF]'
                    }`}>
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={programSearchQuery}
                      onChange={(e) => setProgramSearchQuery(e.target.value)}
                      placeholder={isKk ? 'Бағдарламаларды іздеу (мысалы, Өрлеу, Orleu, несие)...' : 'Поиск по программам (например: Orleu, Өрлеу, лизинг, кредит)...'}
                      className={`w-full py-2 pl-8 pr-7 text-xs rounded-xl border font-mono transition-all ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-black'
                          : 'bg-[#02040A] border-[#172036] text-[#F4F7FF] placeholder-slate-500 focus:border-[#00E5FF]'
                      }`}
                    />
                    {programSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setProgramSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Список всех программ Фонда Даму */}
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {filteredPrograms.length === 0 ? (
                      <div className={`p-6 text-center text-xs rounded-xl border ${
                        isLight ? 'bg-neutral-50 text-neutral-500' : 'bg-[#02040A] text-slate-400 border-[#172036]'
                      }`}>
                        Программы по запросу «{programSearchQuery}» не найдены
                      </div>
                    ) : (
                      filteredPrograms.map((prog) => {
                      const isQuota = prog.isRegionalQuota;

                      return (
                        <div
                          key={prog.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                            isQuota
                              ? isLight
                                ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                                : 'bg-[#0a0f1d] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : isLight 
                                ? 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs' 
                                : 'bg-[#060814] border-[#172036] hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                                  prog.category === 'subsidy'
                                    ? isLight ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-cyan-950/60 text-[#00E5FF] border-cyan-500/40'
                                    : prog.category === 'guarantee'
                                      ? isLight ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                                      : prog.category === 'loan'
                                        ? isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                        : isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                }`}>
                                  {isKk ? prog.categoryLabelKk : prog.categoryLabel}
                                </span>

                                {isQuota && (
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                    ★ Госпрограмма
                                  </span>
                                )}

                                <span className={`text-[10px] font-mono opacity-65 ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                                  {prog.family}
                                </span>
                              </div>

                              <h5 className={`font-bold text-xs mt-1 ${isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'}`}>
                                {isKk ? prog.nameKk : prog.name}
                              </h5>
                            </div>

                            <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs shrink-0 ${
                              isLight 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-cyan-950 text-[#00E5FF] border border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                            }`}>
                              {prog.borrowerRateText}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono opacity-85 pt-1 border-t border-neutral-100 dark:border-[#172036]">
                            <div>Лимит: <strong>{prog.maxAmountText}</strong></div>
                            <div>Гарантия: <strong>{prog.guaranteeText}</strong></div>
                          </div>

                          <p className={`text-xs leading-relaxed ${
                            isLight ? 'text-neutral-600' : 'text-slate-400'
                          }`}>
                            {prog.purposeText}
                          </p>

                          <div className={`p-2 rounded-lg text-[11px] font-mono leading-tight ${
                            isLight ? 'bg-neutral-50 text-neutral-700' : 'bg-[#02040A] text-slate-300'
                          }`}>
                            <strong className={isLight ? 'text-sky-800' : 'text-cyan-400'}>Приоритет:</strong> {prog.priorityText}
                          </div>

                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectRegion(selectedProfile.regionName, selectedRegionDef.isCity ? 'city' : 'region');
                              }}
                              className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isLight
                                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
                                  : 'bg-[#101426] hover:bg-[#182038] text-[#00E5FF] border border-cyan-500/30'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Применить условия программы к расчету</span>
                            </button>
                          </div>
                        </div>
                      );
                    }))}
                  </div>
                </div>
              )}

              {/* 3. ВКЛАДКА: ОБЗОР И СПЕЦИАЛИЗАЦИЯ */}
              {sidebarTab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className={`p-2.5 rounded-xl border ${
                      isLight ? 'bg-white border-neutral-200' : 'bg-[#060814] border-[#172036]'
                    }`}>
                      <span className="text-[10px] block opacity-70">Конечная ставка заемщика:</span>
                      <strong className={`text-sm font-bold ${isLight ? 'text-sky-700' : 'text-[#00E5FF] text-glow-cyan'}`}>
                        12.6% годовых
                      </strong>
                    </div>

                    <div className={`p-2.5 rounded-xl border ${
                      isLight ? 'bg-white border-neutral-200' : 'bg-[#060814] border-[#172036]'
                    }`}>
                      <span className="text-[10px] block opacity-70">Гарантия Фонда «Даму»:</span>
                      <strong className={`text-sm font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400 text-glow-emerald'}`}>
                        до 85%
                      </strong>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    isLight 
                      ? 'bg-white border-neutral-200 text-neutral-700' 
                      : 'bg-[#060814] border-[#172036] text-slate-300'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-400">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{isKk ? 'Өңірлік мамандану' : 'Экономическая специализация'}:</span>
                    </div>
                    <p className="leading-relaxed text-xs">{selectedProfile.specialization}</p>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    eligibility.isPriority
                      ? isLight 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
                      : isLight 
                        ? 'bg-neutral-100 border-neutral-300 text-neutral-700' 
                        : 'bg-[#060814] border-[#172036] text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {eligibility.isPriority ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{isKk ? 'ОКЭД сәйкестігі' : 'Статус ОКЭД в регионе'}:</span>
                      </span>
                      {okedFilter && (
                        <span className={`font-mono text-xs font-semibold ${isLight ? 'text-sky-800' : 'text-[#00E5FF]'}`}>{okedFilter}</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      {eligibility.recommendation}
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Выберите регион на карте для просмотра районов и параметров МИО.
            </div>
          )}

          {/* Главные кнопки действий для выбранного региона */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleApplyToQuery}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.98] ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-300'
                  : 'bg-[#101426] hover:bg-[#182038] text-[#00E5FF] border border-cyan-500/30'
              }`}
            >
              <span>
                {isKk ? 'Бұл өңірді таңдау' : isEn ? `Select ${selectedProfile?.shortName || 'region'}` : isZh ? `选定${selectedProfile?.shortName || '地区'}` : `Выбрать ${selectedProfile?.shortName || 'регион'}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  handleApplyToQuery();
                  onOpenReport();
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.98] shadow-md ${
                  isLight
                    ? 'bg-neutral-900 hover:bg-black text-white'
                    : 'bg-[#00E5FF] hover:bg-[#33ebff] text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.45)]'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>
                  {isKk ? 'Есепті қалыптастыру' : isEn ? 'Generate Report' : isZh ? '生成评估报告' : 'Сформировать отчёт'}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
