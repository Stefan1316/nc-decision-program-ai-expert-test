export type ThemeMode = 'neon' | 'light';
export type Language = 'ru' | 'kk' | 'en' | 'zh';

export interface Translations {
  header: {
    systemTitle: string;
    badge: string;
    systemSubtitle: string;
    reset: string;
    themeTooltip: string;
    themeNeon: string;
    themeLight: string;
    langRu: string;
    langKk: string;
    langEn: string;
    langZh: string;
  };
  banner: {
    tag: string;
    title: string;
    desc: string;
  };
  form: {
    step1Title: string;
    step1Placeholder: string;
    step1Required: string;
    step1Example: string;
    step2Title: string;
    step2City: string;
    step2Region: string;
    selectTerritory: string;
    searchTerritory: string;
    generateReport: string;
    additionalParams: string;
    additionalParamsDesc: string;
    settlementType: string;
    settlementAny: string;
    settlementRepCity: string;
    settlementRegCity: string;
    settlementMonotown: string;
    settlementVillage: string;
    creditAmount: string;
    creditAmountPlaceholder: string;
    targetPurpose: string;
    targetAll: string;
    targetInvest: string;
    targetWorkingCap: string;
    targetRefinance: string;
    targetLeasing: string;
    instrumentType: string;
    instrumentAll: string;
    instrumentSubsidy: string;
    instrumentGuarantee: string;
    instrumentLoan: string;
    instrumentLeasing: string;
    legalForm: string;
    legalFormNotSet: string;
    businessAge: string;
    businessAgeNotSet: string;
    businessAgeNew: string;
    businessAge1: string;
    businessAge2: string;
    businessAge3Plus: string;
    warningBroadOked: string;
  };
  programsSection: {
    matched: string;
    possible: string;
    excluded: string;
    showCards: string;
    hideCards: string;
    registryTitle: string;
    totalInDb: string;
    sourceDamu: string;
  };
  footer: {
    disclaimer: string;
  };
  report: {
    title: string;
    subtitle: string;
    paramsTitle: string;
    okedLabel: string;
    territoryLabel: string;
    financierLabel: string;
    financierValue: string;
    programsTitle: string;
    programsCount: string;
    programsCountOne: string;
    limitLabel: string;
    rateLabel: string;
    termPurposeLabel: string;
    whoFinancesLabel: string;
    justificationLabel: string;
    officialSource: string;
    noPrograms: string;
    legalNoteTitle: string;
    legalNoteDesc: string;
    copyBtn: string;
    copiedBtn: string;
    downloadDocxBtn: string;
    generatingDocx: string;
    closeBtn: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    header: {
      systemTitle: 'Система анализа мер господдержки',
      badge: 'Damu.kz',
      systemSubtitle: 'Финансовый консалтинг по программам Фонда «Даму»',
      reset: 'Сбросить',
      themeTooltip: 'Переключить тему оформления',
      themeNeon: 'Тёмная',
      themeLight: 'Светлая',
      langRu: 'РУС',
      langKk: 'ҚАЗ',
      langEn: 'ENG',
      langZh: '中文'
    },
    banner: {
      tag: 'NC Consulting · Подбор мер господдержки',
      title: 'NC Decision Program',
      desc: 'Введите код ОКЭД и выберите территорию реализации проекта для моментального расчёта доступных субсидий, гарантий и льготного финансирования.'
    },
    form: {
      step1Title: 'ОКЭД (Основной код экономической деятельности)',
      step1Placeholder: 'Введите необходимый код экономической деятельности',
      step1Required: '*',
      step1Example: '',
      step2Title: 'Территория (Области и города Республики Казахстан)',
      step2City: 'Город (city)',
      step2Region: 'Область (region)',
      selectTerritory: 'Выберите область или город реализации проекта...',
      searchTerritory: 'Поиск области или города...',
      generateReport: 'Сформировать отчёт',
      additionalParams: 'Дополнительные параметры проекта',
      additionalParamsDesc: 'Тип населенного пункта (моногорода/села), сумма, цели, инструменты и стаж',
      settlementType: 'Тип населённого пункта (Моногорода / Село):',
      settlementAny: 'Любой тип населённого пункта',
      settlementRepCity: 'Город республиканского значения',
      settlementRegCity: 'Областной центр',
      settlementMonotown: 'Моногород (льготные условия)',
      settlementVillage: 'Сельский населённый пункт (село)',
      creditAmount: 'Запрашиваемая сумма кредита (KZT):',
      creditAmountPlaceholder: 'например, 150000000',
      targetPurpose: 'Целевое назначение:',
      targetAll: 'Все цели',
      targetInvest: 'Инвестиции / Модернизация',
      targetWorkingCap: 'Пополнение оборотных средств (ПОС)',
      targetRefinance: 'Рефинансирование',
      targetLeasing: 'Лизинг оборудования',
      instrumentType: 'Предпочитаемый инструмент:',
      instrumentAll: 'Все инструменты',
      instrumentSubsidy: 'Субсидирование ставки',
      instrumentGuarantee: 'Гарантирование залога',
      instrumentLoan: 'Льготный кредит',
      instrumentLeasing: 'Финансовый лизинг',
      legalForm: 'Форма заявителя:',
      legalFormNotSet: 'Не указана',
      businessAge: 'Стаж бизнеса:',
      businessAgeNotSet: 'Не указан',
      businessAgeNew: 'Новый бизнес (< 1 года)',
      businessAge1: '1 полный год',
      businessAge2: '2 года',
      businessAge3Plus: '3+ года (действующий)',
      warningBroadOked: 'Код ОКЭД слишком широкий (2-3 знака). Рекомендуется указать точный 4- или 5-значный код для точной проверки субсидий.'
    },
    programsSection: {
      matched: 'Совпадает',
      possible: 'Потенциально / Возможные',
      excluded: 'Исключены',
      showCards: 'Показать карточки программ',
      hideCards: 'Скрыть карточки программ',
      registryTitle: 'Реестр программ Фонда «Даму» (Damu.kz)',
      totalInDb: 'Всего проверено',
      sourceDamu: 'Damu.kz'
    },
    footer: {
      disclaimer: 'Аналитическое заключение по государственным мерам поддержки формируется на основании официальных регламентов АО «Фонд развития предпринимательства «ДАМУ». Окончательное решение принимается кредитным комитетом финансирующего банка и Фондом.'
    },
    report: {
      title: 'Экспертное заключение NC Decision Program',
      subtitle: 'Подготовлено NC Consulting · База: damu.kz',
      paramsTitle: '1. ИСХОДНЫЕ ПАРАМЕТРЫ ПРОЕКТА',
      okedLabel: 'Подтверждённый код ОКЭД:',
      territoryLabel: 'Территория проекта:',
      financierLabel: 'Институты финансирования:',
      financierValue: 'Банки второго уровня РК (Halyk, Forte, БЦК, Bereke, Jusan и др.) в партнёрстве с АО «ФРП «ДАМУ»',
      programsTitle: 'Целевые программы финансирования по предоставленным данным:',
      programsCount: 'программы',
      programsCountOne: 'программа',
      limitLabel: 'Лимит финансирования:',
      rateLabel: 'Ставка и субсидии:',
      termPurposeLabel: 'Срок и цели:',
      whoFinancesLabel: 'Кто финансирует:',
      justificationLabel: 'Обоснование соответствия:',
      officialSource: 'Регламент Damu:',
      noPrograms: 'По указанному ОКЭД целевых отраслевых программ субсидирования не зафиксировано.',
      legalNoteTitle: '3. РЕГЛАМЕНТ ПРИНЯТИЯ РЕШЕНИЯ',
      legalNoteDesc: 'Заключение сформировано строго по предоставленным параметрам. Окончательное решение принимается кредитным комитетом финансирующего банка и Фондом «Даму».',
      copyBtn: 'Копировать',
      copiedBtn: 'Скопировано!',
      downloadDocxBtn: 'Скачать .DOCX',
      generatingDocx: 'Формирование DOCX...',
      closeBtn: 'Закрыть'
    }
  },
  kk: {
    header: {
      systemTitle: 'Мемлекеттік қолдау шараларын талдау жүйесі',
      badge: 'Damu.kz',
      systemSubtitle: '«Даму» Қорының бағдарламалары бойынша қаржылық консалтинг',
      reset: 'Қайтару',
      themeTooltip: 'Интерфейс тақырыбын ауыстыру',
      themeNeon: 'Күңгірт',
      themeLight: 'Ақ-қара',
      langRu: 'РУС',
      langKk: 'ҚАЗ',
      langEn: 'ENG',
      langZh: '中文'
    },
    banner: {
      tag: 'NC Consulting · Мемлекеттік қолдауды іріктеу',
      title: 'NC Decision Program',
      desc: 'Қолжетімді субсидияларды, кепілдіктерді және жеңілдікті қаржыландыруды жедел есептеу үшін ЭҚЖЖ кодын енгізіп, жоба аумағын таңдаңыз.'
    },
    form: {
      step1Title: 'ЭҚЖЖ (Экономикалық қызметтің негізгі коды)',
      step1Placeholder: 'Қажетті экономикалық қызмет кодын енгізіңіз',
      step1Required: '*',
      step1Example: '',
      step2Title: 'Аумақ (Қазақстан Республикасының облыстары мен қалалары)',
      step2City: 'Қала (city)',
      step2Region: 'Облыс (region)',
      selectTerritory: 'Жоба іске асырылатын облысты немесе қаланы таңдаңыз...',
      searchTerritory: 'Облысты немесе қаланы іздеу...',
      generateReport: 'Есепті қалыптастыру',
      additionalParams: 'Жобаның қосымша параметрлері',
      additionalParamsDesc: 'Елді мекен түрі (моноқалалар/ауылдар), сомасы, мақсаты, құралдар және өтілі',
      settlementType: 'Елді мекен түрі (Моноқалалар / Ауыл):',
      settlementAny: 'Кез келген елді мекен түрі',
      settlementRepCity: 'Республикалық маңызы бар қала',
      settlementRegCity: 'Облыс орталығы',
      settlementMonotown: 'Моноқала (жеңілдікті шарттар)',
      settlementVillage: 'Ауылдық елді мекен (ауыл)',
      creditAmount: 'Сұралатын несие сомасы (KZT):',
      creditAmountPlaceholder: 'мысалы, 150000000',
      targetPurpose: 'Мақсатты пайдалану:',
      targetAll: 'Барлық мақсаттар',
      targetInvest: 'Инвестициялар / Жаңғырту',
      targetWorkingCap: 'Айналым қаражатын толықтыру (АҚТ)',
      targetRefinance: 'Қайта қаржыландыру',
      targetLeasing: 'Жабдық лизингі',
      instrumentType: 'Қолайлы құрал:',
      instrumentAll: 'Барлық құралдар',
      instrumentSubsidy: 'Сыйақыны субсидиялау',
      instrumentGuarantee: 'Кепілдік беру',
      instrumentLoan: 'Жеңілдікті несие',
      instrumentLeasing: 'Қаржылық лизинг',
      legalForm: 'Өтініш берушінің түрі:',
      legalFormNotSet: 'Көрсетілмеген',
      businessAge: 'Бизнес өтілі:',
      businessAgeNotSet: 'Көрсетілмеген',
      businessAgeNew: 'Жаңа бизнес (< 1 жыл)',
      businessAge1: '1 толық жыл',
      businessAge2: '2 жыл',
      businessAge3Plus: '3+ жыл (жұмыс істеп тұрған)',
      warningBroadOked: 'ЭҚЖЖ коды тым жалпы (2-3 белгі). Субсидиялауды дәл тексеру үшін нақты 4 немесе 5 белгілі кодты көрсету ұсынылады.'
    },
    programsSection: {
      matched: 'Сәйкес келеді',
      possible: 'Ықтимал / Мүмкін болатын',
      excluded: 'Шығарылды',
      showCards: 'Бағдарлама карточкаларын көрсету',
      hideCards: 'Карточкаларды жасыру',
      registryTitle: '«Даму» Қорының бағдарламалар тізілімі (Damu.kz)',
      totalInDb: 'Барлығы тексерілді',
      sourceDamu: 'Damu.kz'
    },
    footer: {
      disclaimer: 'Мемлекеттік қолдау шаралары бойынша аналитикалық қорытынды «ДАМУ» Кәсіпкерлікті дамыту қоры» АҚ ресми ережелері негізінде қалыптастырылады. Түпкілікті шешімді қаржыландырушы банктің несиелік комитеті және Қор қабылдайды.'
    },
    report: {
      title: 'NC Decision Program сараптамалық қорытындысы',
      subtitle: 'NC Consulting дайындаған · База: damu.kz',
      paramsTitle: '1. ЖОБАНЫҢ БАСТАПҚЫ ПАРАМЕТРЛЕРІ',
      okedLabel: 'Расталған ЭҚЖЖ коды:',
      territoryLabel: 'Жоба аумағы:',
      financierLabel: 'Қаржыландыру институттары:',
      financierValue: 'ҚР екінші деңгейдегі банктері (Halyk, Forte, БЦК, Bereke, Jusan ж.б.) «ДАМУ» КДҚ» АҚ-мен серіктестікте',
      programsTitle: 'Ұсынылған деректер бойынша нысаналы қаржыландыру бағдарламалары:',
      programsCount: 'бағдарлама',
      programsCountOne: 'бағдарлама',
      limitLabel: 'Қаржыландыру шегі:',
      rateLabel: 'Мөлшерлеме және субсидиялар:',
      termPurposeLabel: 'Мерзімі және мақсаты:',
      whoFinancesLabel: 'Кім қаржыландырады:',
      justificationLabel: 'Сәйкестік негіздемесі:',
      officialSource: '«Даму» ережесі:',
      noPrograms: 'Көрсетілген ЭҚЖЖ бойынша нысаналы салалық субсидиялау бағдарламалары тіркелмеген.',
      legalNoteTitle: '3. ШЕШІМ ҚАБЫЛДАУ ЕРЕЖЕСІ',
      legalNoteDesc: 'Қорытынды қатаң түрде ұсынылған параметрлер бойынша жасалды. Түпкілікті шешімді қаржыландырушы банктің несие комитеті мен «Даму» Қоры қабылдайды.',
      copyBtn: 'Көшіру',
      copiedBtn: 'Көшірілді!',
      downloadDocxBtn: '.DOCX жүктеп алу',
      generatingDocx: 'DOCX қалыптастыру...',
      closeBtn: 'Жабу'
    }
  },
  en: {
    header: {
      systemTitle: 'State Support Measures Analysis System',
      badge: 'Damu.kz',
      systemSubtitle: 'Financial consulting on programs of Damu Fund',
      reset: 'Reset',
      themeTooltip: 'Switch color theme',
      themeNeon: 'Dark Neon',
      themeLight: 'Light',
      langRu: 'РУС',
      langKk: 'ҚАЗ',
      langEn: 'ENG',
      langZh: '中文'
    },
    banner: {
      tag: 'NC Consulting · Selection of State Support Measures',
      title: 'NC Decision Program',
      desc: 'Enter the NACE (OKED) code and select the project region for instant calculation of available subsidies, guarantees, and preferential funding.'
    },
    form: {
      step1Title: 'OKED (Main Economic Activity Code)',
      step1Placeholder: 'Enter economic activity code (e.g. 10.51, 25.11, 46.73)',
      step1Required: '*',
      step1Example: '',
      step2Title: 'Territory (Regions and Cities of the Republic of Kazakhstan)',
      step2City: 'City',
      step2Region: 'Region',
      selectTerritory: 'Select the region or city of project implementation...',
      searchTerritory: 'Search region or city...',
      generateReport: 'Generate Report',
      additionalParams: 'Additional Project Parameters',
      additionalParamsDesc: 'Settlement type (monotown/village), loan amount, purpose, instruments, and operating years',
      settlementType: 'Settlement Type (Monotowns / Rural):',
      settlementAny: 'Any settlement type',
      settlementRepCity: 'City of republican significance',
      settlementRegCity: 'Regional administrative center',
      settlementMonotown: 'Monotown (preferential conditions)',
      settlementVillage: 'Rural settlement (village)',
      creditAmount: 'Requested Loan Amount (KZT):',
      creditAmountPlaceholder: 'e.g., 150000000',
      targetPurpose: 'Target Purpose:',
      targetAll: 'All purposes',
      targetInvest: 'Investments / Modernization',
      targetWorkingCap: 'Working capital replenishment',
      targetRefinance: 'Refinancing',
      targetLeasing: 'Equipment leasing',
      instrumentType: 'Preferred Instrument:',
      instrumentAll: 'All instruments',
      instrumentSubsidy: 'Interest rate subsidy',
      instrumentGuarantee: 'Collateral guarantee',
      instrumentLoan: 'Concessional loan',
      instrumentLeasing: 'Financial leasing',
      legalForm: 'Legal Entity Form:',
      legalFormNotSet: 'Not specified',
      businessAge: 'Business Operating Age:',
      businessAgeNotSet: 'Not specified',
      businessAgeNew: 'Startup (< 1 year)',
      businessAge1: '1 full year',
      businessAge2: '2 years',
      businessAge3Plus: '3+ years (active)',
      warningBroadOked: 'OKED code is too broad (2-3 digits). A 4- or 5-digit code is recommended for precise subsidy eligibility check.'
    },
    programsSection: {
      matched: 'Exact match',
      possible: 'Potential / Compatible',
      excluded: 'Excluded',
      showCards: 'Show program cards',
      hideCards: 'Hide program cards',
      registryTitle: 'Damu Fund Programs Registry (Damu.kz)',
      totalInDb: 'Total verified',
      sourceDamu: 'Damu.kz'
    },
    footer: {
      disclaimer: 'The analytical conclusion on state support measures is formed on the basis of official regulations of JSC "Entrepreneurship Development Fund "DAMU". The final decision is made by the credit committee of the financing bank and the Fund.'
    },
    report: {
      title: 'NC Decision Program Expert Report',
      subtitle: 'Prepared by NC Consulting · Database: damu.kz',
      paramsTitle: '1. INITIAL PROJECT PARAMETERS',
      okedLabel: 'Confirmed OKED code:',
      territoryLabel: 'Project territory:',
      financierLabel: 'Financing institutions:',
      financierValue: 'Second-tier banks of RK (Halyk, Forte, BCC, Bereke, Jusan, etc.) in partnership with JSC "EDF "DAMU"',
      programsTitle: 'Target financing programs according to provided data:',
      programsCount: 'programs',
      programsCountOne: 'program',
      limitLabel: 'Funding limit:',
      rateLabel: 'Rate & subsidies:',
      termPurposeLabel: 'Term & purposes:',
      whoFinancesLabel: 'Financing body:',
      justificationLabel: 'Eligibility justification:',
      officialSource: 'Damu regulation:',
      noPrograms: 'No targeted industry subsidy programs found for the specified OKED.',
      legalNoteTitle: '3. DECISION REGULATION',
      legalNoteDesc: 'The conclusion is generated strictly based on provided parameters. Final approval is subject to credit committees of partner banks and Damu Fund.',
      copyBtn: 'Copy',
      copiedBtn: 'Copied!',
      downloadDocxBtn: 'Download .DOCX',
      generatingDocx: 'Generating DOCX...',
      closeBtn: 'Close'
    }
  },
  zh: {
    header: {
      systemTitle: '国家支持政策分析系统',
      badge: 'Damu.kz',
      systemSubtitle: '哈萨克斯坦“达姆”基金国家补贴与优惠金融咨询',
      reset: '重置',
      themeTooltip: '切换界面主题',
      themeNeon: '深色霓虹',
      themeLight: '明亮浅色',
      langRu: 'РУС',
      langKk: 'ҚАЗ',
      langEn: 'ENG',
      langZh: '中文'
    },
    banner: {
      tag: 'NC Consulting · 国家政策扶持智能筛选',
      title: 'NC Decision Program',
      desc: '输入国民经济行业代码（OKED）并选择项目实施地区，即可即时计算可享受的政府贷款贴息、担保及优惠贷款政策。'
    },
    form: {
      step1Title: 'OKED（国民经济活动行业代码）',
      step1Placeholder: '请输入经济活动代码（如 10.51, 25.11, 46.73）',
      step1Required: '*',
      step1Example: '',
      step2Title: '项目实施地区（哈萨克斯坦各州及直辖市）',
      step2City: '城市 (city)',
      step2Region: '州 (region)',
      selectTerritory: '请选择项目实施所在的州或城市...',
      searchTerritory: '搜索地区或城市...',
      generateReport: '生成评估报告',
      additionalParams: '项目其他详细参数',
      additionalParamsDesc: '居民点类型（单一产业城市/农村）、贷款金额、用途、金融工具及经营年限',
      settlementType: '行政区及居民点类型（单一城镇 / 乡村）:',
      settlementAny: '任何居民点类型',
      settlementRepCity: '直辖市（阿斯塔纳、阿拉木图、奇姆肯特）',
      settlementRegCity: '州府行政中心',
      settlementMonotown: '单一工业城市（享优惠扶持政策）',
      settlementVillage: '农村居民点（乡村）',
      creditAmount: '申请贷款金额（坚戈 KZT）:',
      creditAmountPlaceholder: '例如：150000000',
      targetPurpose: '资金用途:',
      targetAll: '所有用途',
      targetInvest: '投资 / 产能现代化升级',
      targetWorkingCap: '流动资金补充',
      targetRefinance: '贷款转贷 / 再融资',
      targetLeasing: '设备融资租赁',
      instrumentType: '偏好金融工具:',
      instrumentAll: '所有支持工具',
      instrumentSubsidy: '政府利率贴息',
      instrumentGuarantee: '达姆基金贷款抵押担保',
      instrumentLoan: '低息优惠贷款',
      instrumentLeasing: '设备融资租赁',
      legalForm: '企业法定形式:',
      legalFormNotSet: '未指定',
      businessAge: '企业经营年限:',
      businessAgeNotSet: '未指定',
      businessAgeNew: '初创企业（< 1年）',
      businessAge1: '满1年',
      businessAge2: '满2年',
      businessAge3Plus: '3年以上（成熟经营企业）',
      warningBroadOked: 'OKED代码范围过宽（2-3位）。建议输入精确的4位或5位行业子类代码，以获取准确的贴息资格计算。'
    },
    programsSection: {
      matched: '精准匹配',
      possible: '潜在 / 待核验',
      excluded: '不适用 / 已排除',
      showCards: '展开政策卡片',
      hideCards: '收起政策卡片',
      registryTitle: '“达姆”基金国家扶持项目名录 (Damu.kz)',
      totalInDb: '已核验政策总数',
      sourceDamu: 'Damu.kz'
    },
    footer: {
      disclaimer: '国家扶持政策分析结论基于哈萨克斯坦“达姆”企业发展基金股份有限公司官方规程生成。最终审批决定由出资二级银行信贷委员会及达姆基金共同做出。'
    },
    report: {
      title: 'NC Decision Program 专家评估报告',
      subtitle: '由 NC Consulting 编制 · 数据来源：damu.kz',
      paramsTitle: '一、项目原始申报参数',
      okedLabel: '确认的 OKED 行业代码:',
      territoryLabel: '项目实施所在地:',
      financierLabel: '合作金融机构:',
      financierValue: '哈萨克斯坦二级商业银行（Halyk, Forte, BCC, Bereke, Jusan 等）与“达姆”基金联合执行',
      programsTitle: '根据申报数据匹配的国家专项扶持政策:',
      programsCount: '项政策',
      programsCountOne: '项政策',
      limitLabel: '融资额度上限:',
      rateLabel: '利率与贴息幅度:',
      termPurposeLabel: '期限与适用用途:',
      whoFinancesLabel: '出资与担保机构:',
      justificationLabel: '合规准入依据:',
      officialSource: '达姆官方规程:',
      noPrograms: '未检索到与该行业代码直接对应的专项贴息扶持政策。',
      legalNoteTitle: '三、决策规程与免责声明',
      legalNoteDesc: '本评估结论严格依据所填参数出具。最终审批结果以合作商业银行信贷委员会及“达姆”基金官方批复为准。',
      copyBtn: '复制文本',
      copiedBtn: '已复制！',
      downloadDocxBtn: '导出 .DOCX 报告',
      generatingDocx: '正在生成 DOCX...',
      closeBtn: '关闭'
    }
  }
};
