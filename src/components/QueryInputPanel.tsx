import React, { useState, useRef, useEffect } from 'react';
import { UserQuery } from '../types/damu';
import { KAZAKHSTAN_TERRITORIES, TerritoryOption } from '../data/kazakhstanTerritories';
import { ISKER_AYMAK_MATRIX } from '../data/iskerAymakMatrix';
import { Search, MapPin, ChevronDown, Check, AlertTriangle, SlidersHorizontal, Building2, Coins, Briefcase } from 'lucide-react';
import { ThemeMode, Language, translations } from '../i18n/translations';

interface QueryInputPanelProps {
  query: UserQuery;
  onChange: (updated: Partial<UserQuery>) => void;
  isBroadOked: boolean;
  broadWarning?: string;
  theme?: ThemeMode;
  language?: Language;
  clarificationCount?: number;
  onAnalyze?: () => void;
  analysisState?: 'idle' | 'stale' | 'done';
  recommendedClarifications?: string[];
}

export const QueryInputPanel: React.FC<QueryInputPanelProps> = ({
  query,
  onChange,
  isBroadOked,
  broadWarning,
  theme = 'neon',
  language = 'ru',
  clarificationCount = 0,
  onAnalyze,
  analysisState = 'idle',
  recommendedClarifications = []
}) => {
  const [isTerritoryDropdownOpen, setIsTerritoryDropdownOpen] = useState(false);
  const [territorySearchTerm, setTerritorySearchTerm] = useState('');
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');
  
  // Дополнительные параметры
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[language].form;
  const isLight = theme === 'light';

  const advancedFilledCount = [
    query.settlement_type && query.settlement_type !== 'any' ? 1 : 0,
    query.amount_kzt ? 1 : 0,
    query.purpose ? 1 : 0,
    query.instrument_preference ? 1 : 0,
    query.entity_type ? 1 : 0,
    query.operating_years !== null && query.operating_years !== undefined ? 1 : 0
  ].reduce((sum, value) => sum + value, 0);

  const baseReady = Boolean(
    query.oked_code &&
    query.region_name &&
    (query.location_level !== 'region' || query.district_name)
  );

  const missingBaseInputs = [!query.oked_code?'код ОКЭД':'',!query.region_name?'область или город':'',query.region_name && query.location_level==='region'&&!query.district_name?'район или город области':''].filter(Boolean);

  // Закрытие при клике вне выпадающего списка
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTerritoryDropdownOpen(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
        setIsDistrictDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Единый сценарий территории: сначала регион / город республиканского значения,
  // затем (для области) конкретный район или город из официальной матрицы МИО.
  const primaryTerritories = KAZAKHSTAN_TERRITORIES.filter(item =>
    item.group === 'Города республиканского значения' ||
    item.group === 'Области Республики Казахстан'
  );

  const filteredTerritories = primaryTerritories.filter(item =>
    item.name.toLowerCase().includes(territorySearchTerm.toLowerCase()) ||
    item.typeLabel.toLowerCase().includes(territorySearchTerm.toLowerCase()) ||
    item.group.toLowerCase().includes(territorySearchTerm.toLowerCase())
  );

  const selectedTerritory = KAZAKHSTAN_TERRITORIES.find(item =>
    item.id === query.region_id ||
    item.name.toLowerCase().trim() === (query.region_name || (query.location_level !== 'district' ? query.location_name : '')).toLowerCase().trim()
  );

  // Районы берём напрямую из той же официальной матрицы, которую использует карта.
  // Это исключает расхождение между поиском и картой.
  const effectiveRegionId = query.region_id || selectedTerritory?.id || '';
  const matrixDistricts = selectedTerritory?.level === 'region' && effectiveRegionId
    ? (ISKER_AYMAK_MATRIX[effectiveRegionId] || [])
    : [];

  const districtOptions = matrixDistricts.map((record, index) => {
    const lower = record.districtName.toLowerCase().trim();
    const isCity = lower.startsWith('г.') || lower.startsWith('город');
    const cleanPlaceName = lower.startsWith('г.')
      ? lower.slice(2).trim()
      : lower.startsWith('город')
        ? lower.slice(5).trim()
        : lower;
    const monotownNames = ['рудный', 'лисаковск', 'сарань', 'балхаш', 'темиртау', 'сатпаев', 'жезказган', 'экибастуз', 'риддер', 'жанатас', 'степногорск'];
    const isMonotown = isCity && monotownNames.includes(cleanPlaceName);

    return {
      id: `${effectiveRegionId}-${index}`,
      name: record.districtName,
      type: isMonotown ? 'monotown' : isCity ? 'city' : 'district',
      typeLabel: isMonotown ? 'Моногород / промышленный узел' : isCity ? 'Город области' : 'Район'
    };
  });

  const filteredDistricts = districtOptions.filter(item => {
    const q = districtSearchTerm.toLowerCase().trim();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) ||
      item.typeLabel.toLowerCase().includes(q);
  });

  const selectedDistrict = districtOptions.find(item =>
    item.id === query.district_id ||
    item.name.toLowerCase().trim() === (query.district_name || '').toLowerCase().trim()
  );

  const handleSelectTerritory = (selected: TerritoryOption) => {
    const isRepCity = ['almaty-city', 'astana-city', 'shymkent-city'].includes(selected.id);

    onChange({
      location_name: selected.name,
      location_level: selected.level,
      region_id: selected.id,
      region_name: selected.name,
      district_id: '',
      district_name: '',
      settlement_type: isRepCity ? 'republican_city' : '',
      settlement_type_confirmed: isRepCity
    });
    setIsTerritoryDropdownOpen(false);
    setTerritorySearchTerm('');
    setIsDistrictDropdownOpen(false);
    setDistrictSearchTerm('');
  };

  const handleSelectDistrict = (district: typeof districtOptions[number]) => {
    const settlementType = district.type === 'monotown'
      ? 'monotown'
      : district.type === 'city'
        ? 'regional_city'
        : 'any';

    onChange({
      location_name: district.name,
      location_level: 'district',
      district_id: district.id,
      district_name: district.name,
      settlement_type: settlementType,
      settlement_type_confirmed: district.type === 'monotown' || district.type === 'city'
    });
    setIsDistrictDropdownOpen(false);
    setDistrictSearchTerm('');
  };

  return (
    <div className={`nc-surface-section rounded-2xl p-4 sm:p-7 transition-all duration-300 border ${
      isLight 
        ? 'bg-white border-neutral-200 shadow-sm' 
        : 'bg-[#060814]/95 border-[#172036] shadow-xl backdrop-blur-xl'
    }`}>
      <div className="space-y-5 sm:space-y-6">
        
        {/* 1. Поле: ОКЭД */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className={`text-xs font-bold tracking-tight flex items-center gap-2 ${
              isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
            }`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono font-bold border shrink-0 ${
                isLight 
                  ? 'bg-neutral-100 text-neutral-800 border-neutral-300' 
                  : 'bg-cyan-950/60 text-[#00E5FF] border-cyan-500/40 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
              }`}>
                1
              </span>
              <span>{t.step1Title}</span>
              <span className={isLight ? 'text-rose-600' : 'text-[#FF3FD8]'}>*</span>
            </label>
            {t.step1Example ? (
              <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                {t.step1Example}
              </span>
            ) : null}
          </div>

          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
              isLight ? 'text-neutral-400' : 'text-[#00E5FF]'
            }`}>
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query.oked_code}
              onChange={(e) => {
                const lookalikeMap: Record<string, string> = {
                  'А':'A','В':'B','Е':'E','К':'K','М':'M','Н':'H','О':'O','Р':'P','С':'C','Т':'T','Х':'X'
                };
                const normalized = e.target.value
                  .toUpperCase()
                  .replace(/[АВЕКМНОРСТХ]/g, (ch) => lookalikeMap[ch] || ch)
                  .replace(/,/g, '.')
                  .replace(/\s+/g, '')
                  .replace(/\.{2,}/g, '.')
                  .replace(/[^A-Z0-9.]/g, '');
                onChange({ oked_code: normalized });
              }}
              placeholder={t.step1Placeholder}
              className={`w-full border rounded-xl pl-10 pr-3.5 py-3 text-sm font-mono tracking-wider focus:outline-none transition-all duration-200 ${
                isLight 
                  ? 'bg-neutral-50/80 border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black' 
                  : 'bg-[#02040A] text-[#F4F7FF] placeholder-slate-500 border-[#172036] focus:border-[#00E5FF] focus:shadow-[0_0_15px_-3px_rgba(0,229,255,0.4)]'
              } ${isBroadOked ? (isLight ? 'border-rose-500 ring-1 ring-rose-500' : 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]') : ''}`}
            />
          </div>

          {isBroadOked && (
            <div className={`flex items-start gap-2 p-3 border rounded-xl text-xs ${
              isLight 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{broadWarning || t.warningBroadOked}</span>
            </div>
          )}
        </div>

        {/* 2. Поле: Территория (Выпадающий список) */}
        <div className="space-y-2" ref={dropdownRef}>
          <div className="flex flex-wrap items-center justify-between gap-1">
            <label className={`text-xs font-bold tracking-tight flex items-center gap-2 ${
              isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
            }`}>
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono font-bold border shrink-0 ${
                isLight 
                  ? 'bg-neutral-100 text-neutral-800 border-neutral-300' 
                  : 'bg-blue-950/60 text-[#2F8BFF] border-blue-500/40 shadow-[0_0_8px_rgba(47,139,255,0.4)]'
              }`}>
                2
              </span>
              <span>{t.step2Title}</span>
              <span className={isLight ? 'text-rose-600' : 'text-[#FF3FD8]'}>*</span>
            </label>
            <span className={`text-xs font-mono font-semibold ${isLight ? 'text-sky-700' : 'text-[#00E5FF]'}`}>
              {selectedTerritory?.level === 'city' ? t.step2City : t.step2Region}
            </span>
          </div>

          {/* Кнопка выпадающего списка */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTerritoryDropdownOpen(!isTerritoryDropdownOpen)}
              className={`w-full border rounded-xl pl-9 sm:pl-10 pr-9 sm:pr-10 py-3 text-sm text-left flex items-center justify-between transition-all duration-200 cursor-pointer touch-manipulation focus:outline-none ${
                isLight 
                  ? 'bg-neutral-50/80 border-neutral-300 hover:border-black text-neutral-900 focus:bg-white focus:ring-1 focus:ring-black' 
                  : 'bg-[#02040A] border-[#172036] hover:border-[#00E5FF] text-[#F4F7FF] focus:border-[#00E5FF] focus:shadow-[0_0_15px_-3px_rgba(0,229,255,0.4)]'
              }`}
            >
              <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                <MapPin className={`w-4 h-4 absolute left-3 sm:left-3.5 shrink-0 ${isLight ? 'text-neutral-600' : 'text-[#00E5FF]'}`} />
                <span className="font-semibold truncate text-xs sm:text-sm">
                  {selectedTerritory?.name || query.region_name || (query.location_level !== 'district' ? query.location_name : '') || t.selectTerritory}
                </span>
                <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                  isLight 
                    ? 'bg-neutral-200 text-neutral-800 border-neutral-300' 
                    : 'bg-cyan-950/60 text-[#00E5FF] border-cyan-500/30'
                }`}>
                  {selectedTerritory?.level === 'city' ? 'город' : 'область'}
                </span>
                {selectedTerritory && (
                  <span className={`text-xs hidden md:inline truncate ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                    ({selectedTerritory.typeLabel})
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                isLight ? 'text-neutral-500' : 'text-slate-400'
              } ${isTerritoryDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {/* Всплывающий список */}
            {isTerritoryDropdownOpen && (
              <div className={`absolute z-50 left-0 right-0 mt-2 border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in duration-150 max-w-full ${
                isLight 
                  ? 'bg-white border-neutral-300 shadow-neutral-400/40' 
                  : 'bg-[#030611] border-cyan-500/40 shadow-[0_0_30px_rgba(0,0,0,0.9)]'
              }`}>
                {/* Поле поиска */}
                <div className={`p-3 border-b ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#060814] border-[#172036]'}`}>
                  <div className="relative">
                    <Search className={`w-3.5 h-3.5 absolute left-3 top-3 ${isLight ? 'text-neutral-400' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      value={territorySearchTerm}
                      onChange={(e) => setTerritorySearchTerm(e.target.value)}
                      placeholder={t.searchTerritory}
                      autoFocus
                      className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none transition-all ${
                        isLight 
                          ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black' 
                          : 'bg-[#02040A] border-[#172036] text-[#F4F7FF] placeholder-slate-500 focus:border-[#00E5FF]'
                      }`}
                    />
                  </div>
                </div>

                {/* Список территорий */}
                <div className={`max-h-72 overflow-y-auto p-1.5 divide-y ${isLight ? 'divide-neutral-100' : 'divide-[#172036]'}`}>
                  {filteredTerritories.length > 0 ? (
                    ['Города республиканского значения', 'Области Республики Казахстан'].map((grp) => {
                      const groupItems = filteredTerritories.filter(item => item.group === grp);
                      if (groupItems.length === 0) return null;

                      return (
                        <div key={grp} className="py-1">
                          <div className={`px-3 py-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider ${
                            isLight ? 'text-neutral-500 bg-neutral-100/70' : 'text-[#00E5FF] bg-cyan-950/30'
                          }`}>
                            {grp}
                          </div>
                          <div className="space-y-0.5 pt-1">
                            {groupItems.map((territory) => {
                              const isSelected = selectedTerritory?.id === territory.id;
                              return (
                                <button
                                  key={`${territory.name}-${territory.level}`}
                                  type="button"
                                  onClick={() => handleSelectTerritory(territory)}
                                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer touch-manipulation ${
                                    isSelected
                                      ? (isLight 
                                          ? 'bg-neutral-900 text-white font-semibold' 
                                          : 'bg-cyan-500/20 text-[#00E5FF] font-semibold border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.25)]')
                                      : (isLight 
                                          ? 'hover:bg-neutral-100 text-neutral-800' 
                                          : 'hover:bg-[#0d1224] text-slate-200')
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    <span className="truncate">{territory.name}</span>
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                      isSelected
                                        ? (isLight ? 'bg-neutral-800 text-neutral-200' : 'bg-cyan-950 text-[#00E5FF]')
                                        : (isLight ? 'bg-neutral-200 text-neutral-600' : 'bg-[#02040A] text-slate-400')
                                    }`}>
                                      {territory.typeLabel}
                                    </span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={`p-4 text-center text-xs ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                      Ничего не найдено
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Район / город внутри выбранной области */}
        {selectedTerritory?.level === 'region' && (
          <div className="space-y-2" ref={districtDropdownRef}>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className={`text-xs font-bold tracking-tight flex items-center gap-2 ${
                isLight ? 'text-neutral-900' : 'text-[#F4F7FF]'
              }`}>
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono font-bold border shrink-0 ${
                  isLight
                    ? 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    : 'bg-purple-950/60 text-[#8B5CFF] border-purple-500/40 shadow-[0_0_8px_rgba(139,92,255,0.4)]'
                }`}>
                  3
                </span>
                <span>{language === 'kk' ? 'Аудан / облыстық қала' : language === 'en' ? 'District / regional city' : language === 'zh' ? '区 / 州辖市' : 'Район / город области'}</span>
                <span className={isLight ? 'text-rose-600' : 'text-[#FF3FD8]'}>*</span>
              </label>
              <span className={`text-xs font-mono ${
                query.district_name
                  ? (isLight ? 'text-emerald-700' : 'text-emerald-400')
                  : (isLight ? 'text-amber-700' : 'text-amber-400')
              }`}>
                {query.district_name
                  ? (language === 'kk' ? 'Таңдалды' : language === 'en' ? 'Selected' : language === 'zh' ? '已选择' : 'Выбрано')
                  : (language === 'kk' ? 'МИО үшін қажет' : language === 'en' ? 'Required for MIO' : language === 'zh' ? 'MIO 必填' : 'Обязательно для точной проверки МИО')}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                className={`w-full border rounded-xl pl-10 pr-10 py-3 text-sm text-left flex items-center justify-between transition-all duration-200 cursor-pointer focus:outline-none ${
                  isLight
                    ? 'bg-neutral-50/80 border-neutral-300 hover:border-black text-neutral-900'
                    : 'bg-[#02040A] border-[#172036] hover:border-[#8B5CFF] text-[#F4F7FF] focus:border-[#8B5CFF]'
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                  <Building2 className={`w-4 h-4 absolute left-3.5 shrink-0 ${isLight ? 'text-purple-600' : 'text-[#8B5CFF]'}`} />
                  <span className="font-semibold truncate text-xs sm:text-sm">
                    {selectedDistrict?.name || (language === 'kk' ? 'Аудан немесе қаланы таңдаңыз' : language === 'en' ? 'Select district or city' : language === 'zh' ? '选择区或城市' : 'Выберите район или город')}
                  </span>
                  {selectedDistrict && (
                    <span className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-md border shrink-0 ${
                      isLight ? 'bg-neutral-200 text-neutral-800 border-neutral-300' : 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                    }`}>
                      {selectedDistrict.typeLabel}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isDistrictDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDistrictDropdownOpen && (
                <div className={`absolute z-50 left-0 right-0 mt-2 border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl ${
                  isLight ? 'bg-white border-neutral-300' : 'bg-[#030611] border-purple-500/40'
                }`}>
                  <div className={`p-3 border-b ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-[#060814] border-[#172036]'}`}>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={districtSearchTerm}
                        onChange={(e) => setDistrictSearchTerm(e.target.value)}
                        placeholder={language === 'kk' ? 'Аудан немесе қала бойынша іздеу' : language === 'en' ? 'Search district or city' : language === 'zh' ? '搜索区或城市' : 'Поиск района или города'}
                        autoFocus
                        className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none ${
                          isLight
                            ? 'bg-white border-neutral-300 text-neutral-900'
                            : 'bg-[#02040A] border-[#172036] text-[#F4F7FF] focus:border-[#8B5CFF]'
                        }`}
                      />
                    </div>
                  </div>
                  <div className={`max-h-72 overflow-y-auto p-1.5 divide-y ${isLight ? 'divide-neutral-100' : 'divide-[#172036]'}`}>
                    {filteredDistricts.length > 0 ? filteredDistricts.map((district) => {
                      const isSelected = selectedDistrict?.id === district.id;
                      return (
                        <button
                          key={district.id}
                          type="button"
                          onClick={() => handleSelectDistrict(district)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors ${
                            isSelected
                              ? (isLight ? 'bg-neutral-900 text-white' : 'bg-purple-500/20 text-purple-200 border border-purple-500/40')
                              : (isLight ? 'hover:bg-neutral-100 text-neutral-800' : 'hover:bg-[#0d1224] text-slate-200')
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{district.name}</div>
                            <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'opacity-80' : (isLight ? 'text-neutral-500' : 'text-slate-500')}`}>
                              {district.typeLabel}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    }) : (
                      <div className={`p-4 text-center text-xs ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
                        {language === 'kk' ? 'Ештеңе табылмады' : language === 'en' ? 'Nothing found' : language === 'zh' ? '未找到结果' : 'Ничего не найдено'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-500' : 'text-slate-500'}`}>
              {language === 'ru' && 'Список синхронизирован с картой и районной матрицей МИО. Выбор здесь автоматически используется в экспертном заключении.'}
              {language === 'kk' && 'Тізім карта және МИО аудандық матрицасымен синхрондалған.'}
              {language === 'en' && 'This list is synchronized with the map and MIO district matrix.'}
              {language === 'zh' && '该列表与地图和 MIO 区域矩阵同步。'}
            </div>
          </div>
        )}

        {/* 4. ДОПОЛНИТЕЛЬНЫЕ ПАРАМЕТРЫ ПРОЕКТА */}
        <div className={`pt-4 border-t ${isLight ? 'border-neutral-200' : 'border-[#172036]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-1 pb-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 text-xs font-bold cursor-pointer touch-manipulation transition-colors ${
                isLight ? 'text-neutral-900 hover:text-black' : 'text-[#00E5FF] hover:text-white'
              }`}
            >
              <SlidersHorizontal className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-purple-400'} shrink-0`} />
              <span className="text-xs sm:text-sm">{t.additionalParams}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                clarificationCount > 0
                  ? (isLight ? 'text-amber-700 border-amber-300 bg-amber-50' : 'text-amber-300 border-amber-500/30 bg-amber-950/30')
                  : (isLight ? 'text-neutral-500 border-neutral-300 bg-white' : 'text-slate-400 border-[#172036] bg-[#02040A]')
              }`}>
                {advancedFilledCount}/6 заполнено{clarificationCount > 0 ? ` · ${clarificationCount} уточнений` : ''}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
              {t.additionalParamsDesc}
            </span>
          </div>

          {showAdvanced && (
            <>
            {recommendedClarifications.length > 0 && (
              <div className={`mb-3 p-3 rounded-xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-500/20'}`}>
                <div className={`text-xs font-bold mb-2 ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                  Рекомендуется уточнить сейчас
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recommendedClarifications.map((item) => (
                    <span key={item} className={`px-2 py-1 rounded-lg border text-[11px] font-medium ${isLight ? 'bg-white border-amber-200 text-slate-700' : 'bg-[#11172E] border-amber-500/20 text-slate-200'}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={`mb-3 px-3 py-2 rounded-xl border text-xs leading-relaxed ${
              isLight ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-cyan-950/20 border-cyan-500/20 text-slate-300'
            }`}>
              Эти поля не заполняются автоматически. Укажите только известные параметры — система использует их для уточнения eligibility конкретных программ.
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-4 rounded-xl border ${
              isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-[#02040A]/90 border-[#172036]'
            }`}>
              
              {/* Поле 1: Населенный пункт (Моногорода / Село) */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                  isLight ? 'text-neutral-700' : 'text-slate-300'
                }`}>
                  <Building2 className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-[#00E5FF]'} shrink-0`} />
                  <span className="truncate">{t.settlementType}</span>
                </label>
                <select
                  value={query.settlement_type || ''}
                  onChange={(e) => onChange({
                    settlement_type: e.target.value as any,
                    settlement_type_confirmed: e.target.value !== '' && e.target.value !== 'any'
                  })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                    isLight 
                      ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black' 
                      : 'bg-[#060814] border-[#172036] text-[#F4F7FF] focus:border-[#00E5FF]'
                  }`}
                >
                  <option value="">Не знаю / нужно проверить</option>
                  <option value="any">Любой тип</option>
                  <option value="republican_city">{t.settlementRepCity}</option>
                  <option value="monotown">{t.settlementMonotown}</option>
                  <option value="village">{t.settlementVillage}</option>
                  <option value="regional_city">{t.settlementRegCity}</option>
                </select>
              </div>

              {/* Поле 2: Сумма кредита / финансирования */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                  isLight ? 'text-neutral-700' : 'text-slate-300'
                }`}>
                  <Coins className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'} shrink-0`} />
                  <span className="truncate">{t.creditAmount}</span>
                </label>
                <input
                  type="number"
                  value={query.amount_kzt || ''}
                  onChange={(e) => onChange({ amount_kzt: e.target.value ? Number(e.target.value) : null })}
                  placeholder={t.creditAmountPlaceholder}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                    isLight 
                      ? 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-black' 
                      : 'bg-[#060814] border-[#172036] text-[#F4F7FF] placeholder-slate-500 focus:border-[#00E5FF]'
                  }`}
                />
              </div>

              {/* Поле 3: Целевое назначение */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold flex items-center gap-1.5 ${
                  isLight ? 'text-neutral-700' : 'text-slate-300'
                }`}>
                  <Briefcase className={`w-3.5 h-3.5 ${isLight ? 'text-purple-600' : 'text-purple-400'} shrink-0`} />
                  <span className="truncate">{t.targetPurpose}</span>
                </label>
                <select
                  value={query.purpose || ''}
                  onChange={(e) => onChange({ purpose: e.target.value as any })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                    isLight 
                      ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black' 
                      : 'bg-[#060814] border-[#172036] text-[#F4F7FF] focus:border-[#00E5FF]'
                  }`}
                >
                  <option value="">Не знаю / пока не выбрано</option>
                  <option value="Инвестиции">{t.targetInvest}</option>
                  <option value="Оборотные средства">{t.targetWorkingCap}</option>
                  <option value="Рефинансирование">{t.targetRefinance}</option>
                  <option value="Лизинг">{t.targetLeasing}</option>
                </select>
              </div>

              {/* Поле 4: Финансовый инструмент */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                  {t.instrumentType}
                </label>
                <select
                  value={query.instrument_preference || ''}
                  onChange={(e) => onChange({ instrument_preference: e.target.value as any })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                    isLight 
                      ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black' 
                      : 'bg-[#060814] border-[#172036] text-[#F4F7FF] focus:border-[#00E5FF]'
                  }`}
                >
                  <option value="">Не знаю / пока не выбрано</option>
                  <option value="Субсидирование">{t.instrumentSubsidy}</option>
                  <option value="Гарантирование">{t.instrumentGuarantee}</option>
                  <option value="Льготное кредитование">{t.instrumentLoan}</option>
                  <option value="Лизинг">{t.instrumentLeasing}</option>
                </select>
              </div>

              {/* Поле 5: Статус / Форма предприятия */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                  {t.legalForm}
                </label>
                <select
                  value={query.entity_type || ''}
                  onChange={(e) => onChange({ entity_type: e.target.value as any })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                    isLight 
                      ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black' 
                      : 'bg-[#060814] border-[#172036] text-[#F4F7FF] focus:border-[#00E5FF]'
                  }`}
                >
                  <option value="">Не знаю / нужно проверить</option>
                  <option value="ИП">Индивидуальный предприниматель (ИП)</option>
                  <option value="ТОО">Товарищество с огр. ответственностью (ТОО)</option>
                  <option value="Сельхозкооператив">Сельхозкооператив (КХ/СПК)</option>
                  <option value="Юрлицо МФЦА">Юрлицо МФЦА (AIFC)</option>
                </select>
              </div>

              {/* Поле 6: Срок работы бизнеса */}
              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isLight ? 'text-neutral-700' : 'text-slate-300'}`}>
                  {t.businessAge}
                </label>
                <select
                  value={query.operating_years !== null ? query.operating_years : ''}
                  onChange={(e) => onChange({ operating_years: e.target.value ? Number(e.target.value) : null })}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                    isLight 
                      ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black' 
                      : 'bg-[#060814] border-[#172036] text-[#F4F7FF] focus:border-[#00E5FF]'
                  }`}
                >
                  <option value="">Не знаю / нужно проверить</option>
                  <option value="0">{t.businessAgeNew}</option>
                  <option value="1">{t.businessAge1}</option>
                  <option value="2">{t.businessAge2}</option>
                  <option value="3">{t.businessAge3Plus}</option>
                </select>
              </div>

            </div>
            </>
          )}

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-slate-400'}`}>
              {!baseReady
                ? `Для анализа заполните: ${missingBaseInputs.join(', ')}.`
                : analysisState === 'done'
                  ? 'Анализ зафиксирован. Если измените параметры проекта, потребуется повторный анализ.'
                  : analysisState === 'stale'
                    ? 'Параметры изменены после последнего анализа. Проведите анализ повторно.'
                    : (clarificationCount > 0
                        ? `Предварительный подбор уже рассчитан. Для повышения точности есть ${clarificationCount} уточнений.`
                        : 'Основные данные заполнены. Можно провести анализ проекта.')}
            </div>
            <button
              type="button"
              disabled={!baseReady || analysisState === 'done'}
              title={!baseReady ? `Необходимо заполнить: ${missingBaseInputs.join(', ')}` : undefined}
              onClick={onAnalyze}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !baseReady || analysisState === 'done'
                  ? analysisState === 'done'
                    ? isLight
                      ? 'cursor-default bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'cursor-default bg-emerald-950/30 border border-emerald-500/30 text-emerald-300'
                    : 'opacity-40 cursor-not-allowed bg-slate-700 text-slate-300'
                  : isLight
                    ? 'bg-neutral-900 text-white hover:bg-black'
                    : 'bg-[#00E5FF] text-slate-950 hover:bg-[#33ebff] shadow-[0_0_16px_rgba(0,229,255,0.35)]'
              }`}
            >
              {analysisState === 'done'
                ? '✓ Анализ выполнен'
                : analysisState === 'stale'
                  ? 'Провести повторный анализ'
                  : 'Провести анализ'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
