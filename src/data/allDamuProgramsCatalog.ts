import { MIO_REGIONS_DATABASE } from './mioPriorityOkeds';

export interface DamuDisplayProgram {
  id: string;
  name: string;
  nameKk: string;
  category: 'subsidy' | 'guarantee' | 'loan' | 'leasing' | 'quota';
  categoryLabel: string;
  categoryLabelKk: string;
  family: string;
  maxAmountText: string;
  borrowerRateText: string;
  guaranteeText: string;
  termText: string;
  purposeText: string;
  priorityText: string;
  isRegionalQuota?: boolean;
  appliesToRegion?: (regionId: string) => boolean;
}

/**
 * Полный каталог всех программ Фонда «Даму» и региональных квот МИО.
 * Включает общереспубликанские программы субсидирования, гарантирования,
 * льготного кредитования «Өрлеу», лизинга, а также квоты «С дипломом — в село!» и «Серпін».
 */
export const ALL_DAMU_PROGRAMS: DamuDisplayProgram[] = [
  // 1. СУБСИДИРОВАНИЕ СТАВКИ
  {
    id: 'damu-isker-aymak',
    name: '«Іскер аймақ» (Приоритетные отрасли МИО)',
    nameKk: '«Іскер аймақ» (ЖАО басым салалары)',
    category: 'subsidy',
    categoryLabel: 'Субсидирование',
    categoryLabelKk: 'Субсидиялау',
    family: 'Региональная программа МИО и Даму',
    maxAmountText: 'до 200 млн ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 36 месяцев (субсидия)',
    purposeText: 'Инвестиции в расширение бизнеса и пополнение оборотных средств по региональной матрице',
    priorityText: 'Официальный перечень приоритетных отраслей МИО по 200 городам и районам РК',
    appliesToRegion: (r) => !['almaty-city', 'astana-city', 'shymkent-city'].includes(r)
  },
  {
    id: 'damu-ekp-sme',
    name: 'ЕКП: Малый и средний бизнес (Субсидирование)',
    nameKk: 'ББК: Шағын және орта бизнес (Субсидиялау)',
    category: 'subsidy',
    categoryLabel: 'Субсидирование',
    categoryLabelKk: 'Субсидиялау',
    family: 'Единая комплексная программа (ЕКП)',
    maxAmountText: 'до 3 млрд ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 60 месяцев',
    purposeText: 'Инвестиции в основные средства, модернизация производственных мощностей, пополнение оборотного капитала',
    priorityText: 'Обрабатывающая промышленность, транспорт, туризм, здравоохранение, образование, IT'
  },
  {
    id: 'damu-ekp-micro',
    name: 'ЕКП: Микропредпринимательство',
    nameKk: 'ББК: Шағын кәсіпкерлік',
    category: 'subsidy',
    categoryLabel: 'Субсидирование',
    categoryLabelKk: 'Субсидиялау',
    family: 'Единая комплексная программа (ЕКП)',
    maxAmountText: 'до 20 млн ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 36 месяцев',
    purposeText: 'Быстрый старт и масштабирование микробизнеса, экспресс-субсидирование кредитов',
    priorityText: 'Все сферы предпринимательской деятельности (без отраслевых ограничений, кроме подакцизных)'
  },
  {
    id: 'damu-inner-trade',
    name: 'Субсидирование внутренней торговли',
    nameKk: 'Ішкі сауданы субсидиялау',
    category: 'subsidy',
    categoryLabel: 'Субсидирование',
    categoryLabelKk: 'Субсидиялау',
    family: 'Поддержка внутренней торговли',
    maxAmountText: 'до 3 млрд ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 60 месяцев',
    purposeText: 'Строительство и модернизация торговых площадей, магазинов у дома, складов продовольствия',
    priorityText: 'ОКЭД 46 (оптовая торговля), 47 (розничная торговля), 68.20.3-68.20.5 (торговая аренда). Внимание: действует в регионах, моногородах и малых городах (Астана, Алматы, Шымкент исключены по регламенту Даму)',
    isRegionalQuota: true,
    appliesToRegion: (r) => !['almaty-city', 'astana-city', 'shymkent-city'].includes(r)
  },
  {
    id: 'damu-social-business',
    name: 'Поддержка социального предпринимательства',
    nameKk: 'Әлеуметтік кәсіпкерлікті қолдау',
    category: 'subsidy',
    categoryLabel: 'Субсидирование',
    categoryLabelKk: 'Субсидиялау',
    family: 'Социальное предпринимательство',
    maxAmountText: 'до 1.5 млрд ₸',
    borrowerRateText: '12.6% годовых (субсидия 50%)',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 60 месяцев',
    purposeText: 'Развитие инклюзивных проектов, трудоустройство уязвимых слоев населения, адаптационные центры',
    priorityText: 'Субъекты, включенные в реестр социальных предпринимателей МНЭ РК'
  },

  // 2. ГАРАНТИРОВАНИЕ КРЕДИТОВ ФОНДА «ДАМУ»
  {
    id: 'damu-guarantee-fund-1',
    name: 'Гарантийный фонд 1 (МСБ до 1 млрд ₸)',
    nameKk: 'Кепілдік қоры 1 (ШОБ 1 млрд ₸ дейін)',
    category: 'guarantee',
    categoryLabel: 'Гарантирование',
    categoryLabelKk: 'Кепілдік беру',
    family: 'Портфельное и стандартное гарантирование',
    maxAmountText: 'до 1 млрд ₸',
    borrowerRateText: 'По ставке банка с субсидией Даму',
    guaranteeText: 'до 85% от суммы кредита',
    termText: 'на срок кредита (до 84 мес.)',
    purposeText: 'Предоставление залогового обеспечения начинающим и действующим предпринимателям при нехватке собственного залога',
    priorityText: 'Действует во всех 20 регионах Казахстана (до 85% для начинающих, до 50% для действующих)'
  },
  {
    id: 'damu-guarantee-fund-2',
    name: 'Гарантийный фонд 2 (Крупные проекты до 7 млрд ₸)',
    nameKk: 'Кепілдік қоры 2 (Ірі жобалар 7 млрд ₸ дейін)',
    category: 'guarantee',
    categoryLabel: 'Гарантирование',
    categoryLabelKk: 'Кепілдік беру',
    family: 'Крупное гарантирование инвестпроектов',
    maxAmountText: 'от 1 до 7 млрд ₸',
    borrowerRateText: 'Рыночная ставка с субсидированием',
    guaranteeText: 'до 50% от суммы займа',
    termText: 'до 120 месяцев',
    purposeText: 'Строительство крупных заводов, инфраструктурных объектов, логистических хабов национального масштаба',
    priorityText: 'Крупные производственные предприятия обрабатывающей промышленности и логистики'
  },
  {
    id: 'damu-guarantee-apk',
    name: 'Гарантирование кредитов в АПК и переработке',
    nameKk: 'АӨК және қайта өңдеудегі несиелерге кепілдік беру',
    category: 'guarantee',
    categoryLabel: 'Гарантирование',
    categoryLabelKk: 'Кепілдік беру',
    family: 'Агропромышленное гарантирование',
    maxAmountText: 'до 3 млрд ₸',
    borrowerRateText: 'Субсидированная ставка АПК',
    guaranteeText: 'до 85% для сельхозпроектов',
    termText: 'до 84 месяцев',
    purposeText: 'Финансирование весенне-полевых и уборочных работ, закуп скота, кормов, сельхозтехники и молочно-товарных ферм',
    priorityText: 'Аграрные хозяйства, сельхозкооперативы, переработка мяса, молока и масличных культур'
  },

  // 3. ЛЬГОТНОЕ ПРЯМОЕ КРЕДИТОВАНИЕ
  {
    id: 'damu-loan-orleu',
    name: 'Льготное кредитование «Өрлеу» / Orleu',
    nameKk: '«Өрлеу» (Orleu) жеңілдікті несиелендіру бағдарламасы',
    category: 'loan',
    categoryLabel: 'Льготный кредит',
    categoryLabelKk: 'Жеңілдікті несие',
    family: 'Программа развития «Өрлеу» (Orleu)',
    maxAmountText: 'до 7 млрд ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 84 месяцев (инвестиции), до 36 месяцев (оборот)',
    purposeText: 'Приобретение станков, промышленной робототехники, модернизация технологических линий',
    priorityText: 'Перечень 142 приоритетных кодов ОКЭД обрабатывающей промышленности и сервиса'
  },
  {
    id: 'damu-loan-micro-regional',
    name: 'Микрокредитование моногородов и сел («Ауыл аманаты»)',
    nameKk: 'Моноқалалар мен ауылдарды шағын несиелендіру («Ауыл аманаты»)',
    category: 'loan',
    categoryLabel: 'Льготный кредит',
    categoryLabelKk: 'Жеңілдікті несие',
    family: 'Региональное развитие сельских территорий',
    maxAmountText: 'до 20 млн ₸ (для кооперативов до 50 млн ₸)',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 60 месяцев',
    purposeText: 'Развитие малого бизнеса, мини-цехов переработки, ремесел, птицеводства и овощеводства на селе',
    priorityText: 'Моногорода (Темиртау, Рудный, Хромтау, Жанаозен, Риддер и др.) и сельские округа всех областей'
  },
  {
    id: 'damu-loan-green',
    name: '«Зелёное финансирование» (Green Finance)',
    nameKk: '«Жасыл қаржыландыру» (Green Finance)',
    category: 'loan',
    categoryLabel: 'Льготный кредит',
    categoryLabelKk: 'Жеңілдікті несие',
    family: 'Экологические и ESG-инвестиции',
    maxAmountText: 'до 5 млрд ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 84 месяцев',
    purposeText: 'Внедрение солнечных/ветровых панелей, очистных сооружений, вторичной переработки отходов и водосбережения',
    priorityText: 'Энергоэффективные предприятия, сбор и переработка отходов (ОКЭД 38), ВИЭ (ОКЭД 35.11)'
  },

  // 4. ЛИЗИНГ И СПЕЦИАЛЬНЫЕ ПРОГРАММЫ
  {
    id: 'damu-leasing-orleu',
    name: '«Өрлеу-Лизинг» / Orleu Leasing (Лизинг оборудования)',
    nameKk: '«Өрлеу-Лизинг» (Orleu Leasing / Құрал-жабдықтар лизингі)',
    category: 'leasing',
    categoryLabel: 'Лизинг',
    categoryLabelKk: 'Лизинг',
    family: 'Финансовый лизинг оборудования «Өрлеу»',
    maxAmountText: 'до 500 млн ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Оборудование выступает залогом',
    termText: 'до 60 месяцев',
    purposeText: 'Финансовый лизинг нового технологического оборудования, производственных линий и спецтехники без залога недвижимости',
    priorityText: 'Субъекты МСБ со сроком деятельности не менее 1 года'
  },
  {
    id: 'damu-women-umay',
    name: 'Программа женского предпринимательства «Умай»',
    nameKk: '«Ұмай» әйелдер кәсіпкерлігін қолдау бағдарламасы',
    category: 'loan',
    categoryLabel: 'Спецпрограмма',
    categoryLabelKk: 'Арнайы бағдарлама',
    family: 'Гендерное финансирование АБР и Даму',
    maxAmountText: 'до 200 млн ₸',
    borrowerRateText: '12.6% годовых',
    guaranteeText: 'Гарантия Даму до 85%',
    termText: 'до 60 месяцев',
    purposeText: 'Финансирование предприятий, где учредителями или первыми руководителями являются женщины',
    priorityText: 'Широкий спектр отраслей, с акцентом на региональные проекты вне городов Астана и Алматы'
  },

  // 5. РЕГИОНАЛЬНЫЕ КВОТЫ И ГОСУДАРСТВЕННЫЕ ПРОГРАММЫ МИО
  {
    id: 'quota-diplom-selo',
    name: 'Госпрограмма «С дипломом — в село!»',
    nameKk: '«Дипломмен – ауылға!» мемлекеттік бағдарламасы',
    category: 'quota',
    categoryLabel: 'Госпрограмма / Квота',
    categoryLabelKk: 'Мемлекеттік бағдарлама',
    family: 'Поддержка молодых специалистов на селе',
    maxAmountText: 'Подъемные 100 МРП + бюджетный кредит на жилье до 2500 МРП + финансирование предпринимательства',
    borrowerRateText: 'Субсидированная ставка МИО / 0.01% на жилье',
    guaranteeText: 'Гарантия государства и акимата',
    termText: 'до 15 лет на жилье, до 5 лет на развитие практики/бизнеса',
    purposeText: 'Привлечение специалистов здравоохранения, образования, спорта, культуры, АПК и ветеринарии в сельские населенные пункты',
    priorityText: 'Врачи, фельдшеры, учителя, ветеринары, агрономы, тренеры, открывающие практику в сельских округах',
    isRegionalQuota: true,
    appliesToRegion: (r) => !['almaty-city', 'astana-city', 'shymkent-city'].includes(r)
  },
  {
    id: 'quota-serpin',
    name: 'Программа расселения и развития «Серпін»',
    nameKk: '«Серпін» өңірлік қоныстандыру және дамыту бағдарламасы',
    category: 'quota',
    categoryLabel: 'Госпрограмма / Квота',
    categoryLabelKk: 'Мемлекеттік бағдарлама',
    family: 'Территориальное перераспределение трудовых ресурсов',
    maxAmountText: 'Гранты на переезд, субсидии аренды жилья до 1 года + льготные микрокредиты на открытие бизнеса',
    borrowerRateText: '12.6% годовых по субсидиям МИО',
    guaranteeText: 'Гарантия Фонда «Даму» до 85%',
    termText: 'до 60 месяцев',
    purposeText: 'Трудоустройство, создание кооперативов и малого бизнеса в регионах с дефицитом трудовых ресурсов',
    priorityText: 'Северные и восточные области: СКО, Костанайская, Павлодарская, Акмолинская, Абайская, ВКО',
    isRegionalQuota: true,
    appliesToRegion: (r) => ['north-kz-region', 'kostanay-region', 'pavlodar-region', 'akmola-region', 'abay-region', 'east-kz-region'].includes(r)
  }
];

/**
 * Получить все программы Фонда «Даму» и региональные программы для выбранного региона.
 */
export function getDamuProgramsForRegion(regionId: string): DamuDisplayProgram[] {
  const profile = MIO_REGIONS_DATABASE[regionId];
  
  // 1. Совместные региональные программы акимата и Даму (например, «Батыс Өрлеу» в ЗКО, «Атырау Өрлеу», «Almaty Business»)
  const regionalPrograms: DamuDisplayProgram[] = (profile?.programs || []).map(p => ({
    id: p.id,
    name: p.name,
    nameKk: p.name,
    category: (p.name.toLowerCase().includes('лизинг') ? 'leasing' : 'loan') as 'loan' | 'leasing',
    categoryLabel: 'Региональная программа МИО & Даму',
    categoryLabelKk: 'ЖАО мен Даму өңірлік бағдарламасы',
    family: `Программа акимата (${profile?.shortName || 'МИО'}) и Фонда «Даму»`,
    maxAmountText: p.maxAmountText,
    borrowerRateText: p.borrowerRateText,
    guaranteeText: 'Гарантия Фонда «Даму» до 85%',
    termText: p.termText,
    purposeText: p.purposeText,
    priorityText: p.priorityOkedsSummary || 'Приоритетные направления МИО региона',
    isRegionalQuota: true
  }));

  // 2. Общенациональные программы Фонда «Даму» (Субсидирование, Гарантирование, «Өрлеу», Лизинг, Квоты)
  const standardPrograms = ALL_DAMU_PROGRAMS.filter(prog => {
    if (prog.appliesToRegion) {
      return prog.appliesToRegion(regionId);
    }
    return true;
  });

  return [...regionalPrograms, ...standardPrograms];
}
