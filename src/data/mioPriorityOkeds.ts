import { ISKER_OFFICIAL_RECORDS } from './iskerOfficialRecords';

/**
 * База данных приоритетных направлений и ОКЭД Местных исполнительных органов (МИО / Акиматов)
 * и совместных региональных программ льготного финансирования и субсидирования с АО «ФРП «Даму».
 */

export interface MioOkedItem {
  code: string;
  name: string;
  category: string;
  priorityLevel: 'high' | 'medium';
}

export interface MioRegionalProgram {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  akimatPartner: string;
  maxAmountKzt: number;
  maxAmountText: string;
  borrowerRateText: string;
  subsidyText: string;
  termText: string;
  purposeText: string;
  description: string;
  priorityOkedsSummary: string;
}

export interface MioRegionProfile {
  regionId: string;
  regionName: string;
  shortName: string;
  center: string;
  specialization: string;
  description: string;
  programs: MioRegionalProgram[];
  priorityOkeds: MioOkedItem[];
}

export const MIO_REGIONS_DATABASE: Record<string, MioRegionProfile> = {
  'almaty-city': {
    regionId: 'almaty-city',
    regionName: 'г. Алматы',
    shortName: 'Алматы',
    center: 'г. Алматы',
    specialization: 'Креативная экономика, IT и цифровизация, туризм, сфера услуг, пищевое производство, медицина',
    description: 'Финансовый и инновационный центр РК. Городские программы МИО сфокусированы на бездымной промышленности, высоких технологиях, сервисной экономике и креативных индустриях.',
    programs: [
      {
        id: 'mio.almaty.business',
        name: 'Almaty Business (Региональное финансирование)',
        regionId: 'almaty-city',
        regionName: 'г. Алматы',
        akimatPartner: 'Акимат г. Алматы / СПК «Алматы»',
        maxAmountKzt: 500000000,
        maxAmountText: 'до 500 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев (инвестиции), до 36 месяцев (оборотные)',
        purposeText: 'Инвестиции в оборудование, расширение услуг, инновации, оборотные средства',
        description: 'Специальная программа поддержки МСБ мегаполиса с упором на локализацию услуг и инновационных проектов.',
        priorityOkedsSummary: 'IT (62), Медицина (86), Креативная сфера (90), Образование (85), Пищепром (10)'
      },
      {
        id: 'mio.almaty.tourism',
        name: 'Almaty Tourism & Hospitality',
        regionId: 'almaty-city',
        regionName: 'г. Алматы',
        akimatPartner: 'Управление туризма г. Алматы',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Модернизация гостиниц, кемпингов, туристического транспорта и объектов общепита',
        description: 'Развитие горнолыжного, культурного и делового туризма в Алматинской агломерации.',
        priorityOkedsSummary: 'Гостиницы и хостелы (55.1), Туроператоры (79.1), Общепит с нац. колоритом (56.1)'
      }
    ],
    priorityOkeds: [
      { code: '62.01', name: 'Деятельность в области компьютерного программирования', category: 'IT и связь', priorityLevel: 'high' },
      { code: '62.02', name: 'Консультационные услуги в области компьютерных технологий', category: 'IT и связь', priorityLevel: 'high' },
      { code: '63.11', name: 'Деятельность по обработке данных, размещение информации', category: 'IT и связь', priorityLevel: 'high' },
      { code: '86.10', name: 'Деятельность больничных организаций', category: 'Здравоохранение', priorityLevel: 'high' },
      { code: '86.21', name: 'Общая врачебная практика', category: 'Здравоохранение', priorityLevel: 'high' },
      { code: '85.10', name: 'Дошкольное образование', category: 'Образование', priorityLevel: 'high' },
      { code: '85.20', name: 'Начальное образование', category: 'Образование', priorityLevel: 'medium' },
      { code: '90.01', name: 'Деятельность в области исполнительских искусств', category: 'Креативная индустрия', priorityLevel: 'high' },
      { code: '55.10', name: 'Предоставление мест для краткосрочного проживания', category: 'Туризм', priorityLevel: 'high' },
      { code: '10.71', name: 'Производство хлеба и кондитерских изделий', category: 'Пищепром', priorityLevel: 'medium' },
      { code: '10.82', name: 'Производство какао, шоколада и кондитерских изделий', category: 'Пищепром', priorityLevel: 'medium' },
      { code: '72.19', name: 'Научные исследования в области естественных наук', category: 'Инновации', priorityLevel: 'high' }
    ]
  },

  'astana-city': {
    regionId: 'astana-city',
    regionName: 'г. Астана',
    shortName: 'Астана',
    center: 'г. Астана',
    specialization: 'Инновации, IT, медицина высоких технологий, столичное образование, логистика и сервисный сектор',
    description: 'Столичный хаб деловой активности, медицинского туризма и государственных цифровых сервисов.',
    programs: [
      {
        id: 'mio.astana.business',
        name: 'Астана Бизнес / Start Capital',
        regionId: 'astana-city',
        regionName: 'г. Астана',
        akimatPartner: 'Акимат г. Астана / Astana Invest',
        maxAmountKzt: 400000000,
        maxAmountText: 'до 400 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Приобретение основных средств, IT-инфраструктура, частные клиники и школы',
        description: 'Поддержка проектов в Индустриальном парке №1 и Astana Hub, а также объектов социальной сферы.',
        priorityOkedsSummary: 'IT (62), Медицина (86), Складская логистика (52.1), Образование (85)'
      }
    ],
    priorityOkeds: [
      { code: '62.01', name: 'Компьютерное программирование и разработка ПО', category: 'IT', priorityLevel: 'high' },
      { code: '63.12', name: 'Веб-порталы и цифровые платформы', category: 'IT', priorityLevel: 'high' },
      { code: '86.22', name: 'Специальная врачебная практика (клиники)', category: 'Здравоохранение', priorityLevel: 'high' },
      { code: '85.31', name: 'Общее среднее образование', category: 'Образование', priorityLevel: 'high' },
      { code: '52.10', name: 'Складирование и хранение', category: 'Логистика', priorityLevel: 'high' },
      { code: '26.20', name: 'Производство компьютеров и периферийного оборудования', category: 'Электроника', priorityLevel: 'high' },
      { code: '71.12', name: 'Деятельность в области инженерных изысканий и проектирования', category: 'Инжиниринг', priorityLevel: 'medium' }
    ]
  },

  'shymkent-city': {
    regionId: 'shymkent-city',
    regionName: 'г. Шымкент',
    shortName: 'Шымкент',
    center: 'г. Шымкент',
    specialization: 'Текстильная и швейная промышленность, стройматериалы, фармацевтика, переработка агропродукции',
    description: 'Крупный южный промышленный и транспортно-логистический центр с развитыми индустриальными зонами «Оңтүстік» и «Жұлдыз».',
    programs: [
      {
        id: 'mio.shymkent.damu',
        name: 'Шымкент Кәсіпкерлік',
        regionId: 'shymkent-city',
        regionName: 'г. Шымкент',
        akimatPartner: 'Акимат г. Шымкент / СПК «Shymkent»',
        maxAmountKzt: 350000000,
        maxAmountText: 'до 350 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев',
        purposeText: 'Закуп оборудования, запуск текстильных фабрик, пищевых цехов, упаковочных линий',
        description: 'Приоритет отдается субъектам МСП, расположенным в Индустриальной зоне «Оңтүстік» и СЭЗ.',
        priorityOkedsSummary: 'Текстиль (13), Одежда (14), Фармацевтика (21), Продукты питания (10)'
      }
    ],
    priorityOkeds: [
      { code: '13.20', name: 'Ткацкое производство', category: 'Легкая промышленность', priorityLevel: 'high' },
      { code: '14.13', name: 'Производство прочей верхней одежды', category: 'Легкая промышленность', priorityLevel: 'high' },
      { code: '21.20', name: 'Производство фармацевтических препаратов', category: 'Фармацевтика', priorityLevel: 'high' },
      { code: '10.51', name: 'Переработка молока и производство сыров', category: 'АПК переработка', priorityLevel: 'high' },
      { code: '23.61', name: 'Производство изделий из бетона для строительства', category: 'Стройматериалы', priorityLevel: 'medium' },
      { code: '49.41', name: 'Деятельность грузового автомобильного транспорта', category: 'Логистика', priorityLevel: 'high' }
    ]
  },

  'akmola-region': {
    regionId: 'akmola-region',
    regionName: 'Акмолинская область',
    shortName: 'Акмолинская обл.',
    center: 'г. Кокшетау',
    specialization: 'Зерновое хозяйство, глубокая переработка пшеницы, мясо-молочный кластер, курортный туризм Бурабай',
    description: 'Главный продовольственный пояс столицы и флагман зернопереработки Казахстана.',
    programs: [
      {
        id: 'mio.akmola.agro',
        name: 'Акмола Өнім / Агропереработка',
        regionId: 'akmola-region',
        regionName: 'Акмолинская область',
        akimatPartner: 'Акимат Акмолинской области',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Модернизация мельниц, зернохранилищ, птицефабрик, упаковка продуктов питания',
        description: 'Поддержка перерабатывающих производств, поставляющих продукцию в Астану и на экспорт.',
        priorityOkedsSummary: 'Мукомольное производство (10.6), Мясопереработка (10.1), Корма для скота (10.9)'
      }
    ],
    priorityOkeds: [
      { code: '10.61', name: 'Производство продуктов мукомольно-крупяной промышленности', category: 'АПК переработка', priorityLevel: 'high' },
      { code: '10.11', name: 'Переработка и консервирование мяса', category: 'АПК переработка', priorityLevel: 'high' },
      { code: '10.91', name: 'Производство готовых кормов для сельскохозяйственных животных', category: 'АПК переработка', priorityLevel: 'high' },
      { code: '28.30', name: 'Производство сельскохозяйственных и лесохозяйственных машин', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '55.20', name: 'Предоставление мест для отдыха, лагеря и базы отдыха (Бурабай)', category: 'Туризм', priorityLevel: 'high' }
    ]
  },

  'aktobe-region': {
    regionId: 'aktobe-region',
    regionName: 'Актюбинская область',
    shortName: 'Актюбинская обл.',
    center: 'г. Актобе',
    specialization: 'Химическая и металлургическая промышленность, нефтесервис, производство стройматериалов, АПК',
    description: 'Западный индустриальный и логистический хаб коридора «Западная Европа — Западный Китай».',
    programs: [
      {
        id: 'mio.aktobe.invest',
        name: 'Ақтөбе Инвест Даму',
        regionId: 'aktobe-region',
        regionName: 'Актюбинская область',
        akimatPartner: 'Акимат Актюбинской области / СПК «Актобе»',
        maxAmountKzt: 400000000,
        maxAmountText: 'до 400 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 72 месяцев',
        purposeText: 'Химические заводы, производство оборудования, металлоконструкций, сельхозкооперативы',
        description: 'Развитие индустриальной зоны Актобе и поддержка сервисных производств.',
        priorityOkedsSummary: 'Химпром (20), Металлоизделия (25), Нефтегазовый сервис (09.1), Логистика (52)'
      }
    ],
    priorityOkeds: [
      { code: '20.13', name: 'Производство прочих основных неорганических химических веществ', category: 'Химия', priorityLevel: 'high' },
      { code: '25.11', name: 'Производство строительных металлических конструкций', category: 'Металлообработка', priorityLevel: 'high' },
      { code: '09.10', name: 'Предоставление вспомогательных услуг в области добычи нефти и газа', category: 'Нефтесервис', priorityLevel: 'medium' },
      { code: '52.10', name: 'Складирование и терминальная обработка грузов', category: 'Логистика', priorityLevel: 'high' },
      { code: '10.51', name: 'Переработка молока и производство сыров', category: 'АПК', priorityLevel: 'high' }
    ]
  },

  'almaty-region': {
    regionId: 'almaty-region',
    regionName: 'Алматинская область',
    shortName: 'Алматинская обл.',
    center: 'г. Конаев',
    specialization: 'Пищевая промышленность, теплицы, садоводство, логистика, строительные материалы, туризм (Капшагай)',
    description: 'Аграрно-промышленная зона, прилегающая к мегаполису Алматы, с мощным пищевым кластером.',
    programs: [
      {
        id: 'mio.almaty_reg.damu',
        name: 'Алатау Кәсіпкерлік',
        regionId: 'almaty-region',
        regionName: 'Алматинская область',
        akimatPartner: 'Акимат Алматинской области',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Тепличные комплексы, фруктохранилища с РГС, производство соков и консервов',
        description: 'Фокус на обеспечение продовольственной безопасности и глубокую переработку урожая.',
        priorityOkedsSummary: 'Консервирование овощей и фруктов (10.3), Соки (10.32), Напитки (11.07), Логистика (52.1)'
      }
    ],
    priorityOkeds: [
      { code: '10.39', name: 'Прочая переработка и консервирование фруктов и овощей', category: 'АПК переработка', priorityLevel: 'high' },
      { code: '10.32', name: 'Производство соков из фруктов и овощей', category: 'АПК переработка', priorityLevel: 'high' },
      { code: '11.07', name: 'Производство безалкогольных напитков и минеральных вод', category: 'Пищепром', priorityLevel: 'high' },
      { code: '52.10.1', name: 'Хранение и складирование зерна, плодоовощной продукции', category: 'Логистика', priorityLevel: 'high' },
      { code: '55.20', name: 'Зоны отдыха на водохранилище Конаев и предгорьях Заилийского Алатау', category: 'Туризм', priorityLevel: 'high' }
    ]
  },

  'atyrau-region': {
    regionId: 'atyrau-region',
    regionName: 'Атырауская область',
    shortName: 'Атырауская обл.',
    center: 'г. Атырау',
    specialization: 'Нефтегазохимия, нефтесервисное машиностроение, осетроводство и рыбный промысел, экология',
    description: 'Нефтяная столица Казахстана с развивающейся нефтехимической индустрией и производством полимеров.',
    programs: [
      {
        id: 'mio.atyrau.damu',
        name: 'Атырау Өрлеу / Нефтесервис & МСБ',
        regionId: 'atyrau-region',
        regionName: 'Атырауская область',
        akimatPartner: 'Акимат Атырауской области / СПК «Атырау»',
        maxAmountKzt: 400000000,
        maxAmountText: 'до 400 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев',
        purposeText: 'Сертификация, закуп станков с ЧПУ, лаборатории неразрушающего контроля, полимерные изделия',
        description: 'Приоритет отдается местным поставщикам крупных недропользователей (ТШО, NCOC, КПО).',
        priorityOkedsSummary: 'Ремонт оборудования (33.12), Изделия из пластмасс (22.2), Рыбоводство (03.22)'
      }
    ],
    priorityOkeds: [
      { code: '33.12', name: 'Ремонт машин и оборудования для нефтегазового сектора', category: 'Сервис и машиностроение', priorityLevel: 'high' },
      { code: '22.21', name: 'Производство пластмассовых плит, полос, труб и профилей', category: 'Нефтегазохимия', priorityLevel: 'high' },
      { code: '03.22', name: 'Пресноводное рыбоводство (осетровые фермы)', category: 'Рыбное хозяйство', priorityLevel: 'high' },
      { code: '71.20', name: 'Технические испытания, исследования и анализ металлов', category: 'Лаборатории', priorityLevel: 'medium' }
    ]
  },

  'karaganda-region': {
    regionId: 'karaganda-region',
    regionName: 'Карагандинская область',
    shortName: 'Карагандинская обл.',
    center: 'г. Караганда',
    specialization: 'Черная и цветная металлургия, тяжелое машиностроение, горно-шахтное оборудование, металлоконструкции',
    description: 'Индустриальное ядро Казахстана с развитой сетью моногородов (Темиртау, Сарань, Балхаш).',
    programs: [
      {
        id: 'mio.karaganda.damu',
        name: 'Қарағанды Өндіріс',
        regionId: 'karaganda-region',
        regionName: 'Карагандинская область',
        akimatPartner: 'Акимат Карагандинской области',
        maxAmountKzt: 500000000,
        maxAmountText: 'до 500 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев',
        purposeText: 'Производство шин, автобусов, кабельной продукции, металлоконструкций, горного крепежа',
        description: 'Программа диверсификации моногородов и снижения сырьевой зависимости региона.',
        priorityOkedsSummary: 'Металлургия (24), Машиностроение (28), Металлоизделия (25), Резина/шины (22.1)'
      }
    ],
    priorityOkeds: [
      { code: '25.11', name: 'Производство строительных металлических конструкций и изделий', category: 'Металлообработка', priorityLevel: 'high' },
      { code: '28.92', name: 'Производство машин для добычи полезных ископаемых и разработки карьеров', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '22.11', name: 'Производство резиновых шин, покрышек и камер', category: 'Автопром/химия', priorityLevel: 'high' },
      { code: '27.32', name: 'Производство прочих электронных и электрических проводов и кабелей', category: 'Электротехника', priorityLevel: 'high' },
      { code: '10.11', name: 'Переработка мяса в сельских районах области', category: 'АПК', priorityLevel: 'medium' }
    ]
  },

  'kostanay-region': {
    regionId: 'kostanay-region',
    regionName: 'Костанайская область',
    shortName: 'Костанайская обл.',
    center: 'г. Костанай',
    specialization: 'Автомобилестроение, производство автокомпонентов, сельхозмашиностроение, мукомольный кластер',
    description: 'Лидер казахстанского автопрома (Allur) и крупнейший экспортер муки и масличных культур.',
    programs: [
      {
        id: 'mio.kostanay.auto',
        name: 'Қостанай Индустрия',
        regionId: 'kostanay-region',
        regionName: 'Костанайская область',
        akimatPartner: 'Акимат Костанайской области / СПК «Тобол»',
        maxAmountKzt: 450000000,
        maxAmountText: 'до 450 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев',
        purposeText: 'Локализация деталей для автомобилей, сборка комбайнов, зерносушилок, производство муки',
        description: 'Развитие машиностроительного кластера в Индустриальной зоне г. Костанай.',
        priorityOkedsSummary: 'Автопром (29.1), Автокомпоненты (29.3), Сельхозмашины (28.3), Мука (10.61)'
      }
    ],
    priorityOkeds: [
      { code: '29.10', name: 'Производство автотранспортных средств', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '29.32', name: 'Производство прочих комплектующих и принадлежностей для автотранспорта', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '28.30', name: 'Производство сельскохозяйственных тракторов и комбайнов', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '10.61', name: 'Производство продуктов мукомольно-крупяной промышленности', category: 'АПК', priorityLevel: 'high' },
      { code: '10.41', name: 'Производство растительных масел', category: 'АПК', priorityLevel: 'high' }
    ]
  },

  'mangystau-region': {
    regionId: 'mangystau-region',
    regionName: 'Мангистауская область',
    shortName: 'Мангистауская обл.',
    center: 'г. Актау',
    specialization: 'Морские порты и логистика (Каспийский хаб ТМТМ), опреснение воды, курортный туризм, нефтесервис',
    description: 'Морские ворота Казахстана на Каспии, ключевой элемент Транскаспийского международного транспортного маршрута.',
    programs: [
      {
        id: 'mio.mangystau.caspian',
        name: 'Каспий Өңірі Даму',
        regionId: 'mangystau-region',
        regionName: 'Мангистауская область',
        akimatPartner: 'Акимат Мангистауской области / СЭЗ «Морпорт Актау»',
        maxAmountKzt: 400000000,
        maxAmountText: 'до 400 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 72 месяцев',
        purposeText: 'Морские контейнерные терминалы, отели побережья «Теплый пляж», ремонт бурового флота',
        description: 'Развитие мультимодальных перевозок и создание туристического кластера Каспия.',
        priorityOkedsSummary: 'Морской транспорт (50.2), Склады (52.1), Отели (55.1), Опреснение (36.0)'
      }
    ],
    priorityOkeds: [
      { code: '50.20', name: 'Деятельность морского и каботажного грузового транспорта', category: 'Морской транспорт', priorityLevel: 'high' },
      { code: '52.22', name: 'Деятельность вспомогательная, связанная с водным транспортом (порты)', category: 'Логистика', priorityLevel: 'high' },
      { code: '55.10', name: 'Гостиницы и туристические комплексы Каспийского побережья', category: 'Туризм', priorityLevel: 'high' },
      { code: '33.15', name: 'Ремонт и техническое обслуживание судов и плавучих конструкций', category: 'Судоремонт', priorityLevel: 'high' },
      { code: '36.00', name: 'Сбор, обработка и распределение воды (опреснительные заводы)', category: 'ЖКХ/Технологии', priorityLevel: 'high' }
    ]
  },

  'pavlodar-region': {
    regionId: 'pavlodar-region',
    regionName: 'Павлодарская область',
    shortName: 'Павлодарская обл.',
    center: 'г. Павлодар',
    specialization: 'Электроэнергетика, алюминиевый кластер, нефтехимия, ж/д машиностроение, картофелеводство',
    description: 'Крупнейший энергоемкий индустриальный центр с СЭЗ «Павлодар» и производством первичного алюминия.',
    programs: [
      {
        id: 'mio.pavlodar.damu',
        name: 'Ертіс Өрлеу',
        regionId: 'pavlodar-region',
        regionName: 'Павлодарская область',
        akimatPartner: 'Акимат Павлодарской области',
        maxAmountKzt: 350000000,
        maxAmountText: 'до 350 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Глубокая переработка алюминия (кабель, профиль, диски), комплектующие для вагонов',
        description: 'Стимулирование высоких переделов на базе дешевой электроэнергии и первичного металла.',
        priorityOkedsSummary: 'Алюминий (24.42), Ж/д колеса и стрелки (30.2), Овощехранилища (52.1)'
      }
    ],
    priorityOkeds: [
      { code: '24.42', name: 'Производство алюминия и изделий из него', category: 'Металлургия', priorityLevel: 'high' },
      { code: '30.20', name: 'Производство железнодорожных локомотивов и подвижного состава', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '20.14', name: 'Производство прочих основных органических химических веществ', category: 'Химия', priorityLevel: 'high' },
      { code: '52.10.1', name: 'Хранение и складирование картофеля и овощей с климат-контролем', category: 'АПК логистика', priorityLevel: 'high' }
    ]
  },

  'north-kz-region': {
    regionId: 'north-kz-region',
    regionName: 'Северо-Казахстанская область',
    shortName: 'Северо-Казахстанская обл.',
    center: 'г. Петропавловск',
    specialization: 'Зерновое производство, масличные культуры, молочное животноводство, машиностроение (ЗИКСТО)',
    description: 'Аграрный форпост севера с высочайшей культурой земледелия и современными мега-фермами.',
    programs: [
      {
        id: 'mio.sko.qyzyljar',
        name: 'Qyzyljar Agro Invest',
        regionId: 'north-kz-region',
        regionName: 'Северо-Казахстанская область',
        akimatPartner: 'Акимат Северо-Казахстанской области / СЭЗ «Qyzyljar»',
        maxAmountKzt: 400000000,
        maxAmountText: 'до 400 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев',
        purposeText: 'Строительство МТФ, доильные залы типа «Карусель», заводы рапсового и льняного масла',
        description: 'Программа создания пояса глубокой переработки северного зерна и масличных.',
        priorityOkedsSummary: 'Масло растительное (10.41), Молоко и сыр (10.51), Вагоностроение (30.2)'
      }
    ],
    priorityOkeds: [
      { code: '10.41', name: 'Производство растительных масел (рапс, лен, подсолнечник)', category: 'АПК переработка', priorityLevel: 'high' },
      { code: '10.51', name: 'Переработка молока и производство сыров на МТФ', category: 'АПК', priorityLevel: 'high' },
      { code: '30.20', name: 'Производство грузовых железнодорожных платформ и вагонов', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '10.91', name: 'Производство кормов высокой протеиновой ценности', category: 'АПК', priorityLevel: 'medium' }
    ]
  },

  'turkestan-region': {
    regionId: 'turkestan-region',
    regionName: 'Туркестанская область',
    shortName: 'Туркестанская обл.',
    center: 'г. Туркестан',
    specialization: 'Международный духовный туризм, тепличное хозяйство, хлопок, бахчеводство, стройматериалы',
    description: 'Исторический центр тюркского мира, лидер РК по площади теплиц и сбору плодоовощной продукции.',
    programs: [
      {
        id: 'mio.turkestan.turizm',
        name: 'Түркістан Кәсіпкер / Туризм & Агро',
        regionId: 'turkestan-region',
        regionName: 'Туркестанская область',
        akimatPartner: 'Акимат Туркестанской области / СЭЗ «TURKISTAN»',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 72 месяцев',
        purposeText: 'Строительство бутик-отелей, этно-парков, капельное орошение, переработка хлопка',
        description: 'Развитие туристического кластера древнего Туркестана и аграрного экспорта в Узбекистан и РФ.',
        priorityOkedsSummary: 'Отели (55.1), Общепит нац. кухни (56.1), Теплицы (01.13), Переработка хлопка (13.1)'
      }
    ],
    priorityOkeds: [
      { code: '55.10', name: 'Гостиницы и караван-сараи для паломников и туристов', category: 'Туризм', priorityLevel: 'high' },
      { code: '01.13', name: 'Выращивание овощей, бахчевых, корнеплодов и клубнеплодов в теплицах', category: 'АПК', priorityLevel: 'high' },
      { code: '13.10', name: 'Подготовка и прядение текстильных волокон (хлопок)', category: 'Легкая промышленность', priorityLevel: 'high' },
      { code: '10.39', name: 'Сушка и консервирование фруктов (сухофрукты)', category: 'АПК переработка', priorityLevel: 'high' }
    ]
  },

  'zhambyl-region': {
    regionId: 'zhambyl-region',
    regionName: 'Жамбылская область',
    shortName: 'Жамбылская обл.',
    center: 'г. Тараз',
    specialization: 'Фосфорная и химическая промышленность, зеленая энергетика (ВИЭ), сахарная свекла, луководство',
    description: 'Центр химической индустрии (Казфосфат) и крупный производитель сахара и овощей юга страны.',
    programs: [
      {
        id: 'mio.zhambyl.agro',
        name: 'Тараз Бизнес Даму',
        regionId: 'zhambyl-region',
        regionName: 'Жамбылская область',
        akimatPartner: 'Акимат Жамбылской области',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Хранилища для лука с вентиляцией, переработка сахарной свеклы, солнечные электростанции',
        description: 'Развитие переработки сельскохозяйственного сырья и сопутствующих химпроизводств.',
        priorityOkedsSummary: 'Сахар (10.81), Удобрения (20.15), Хранение овощей (52.1), ВИЭ (35.11)'
      }
    ],
    priorityOkeds: [
      { code: '10.81', name: 'Производство сахара', category: 'Пищепром', priorityLevel: 'high' },
      { code: '20.15', name: 'Производство минеральных удобрений и азотосодержащих соединений', category: 'Химия', priorityLevel: 'high' },
      { code: '52.10', name: 'Складирование и хранение лука и овощей', category: 'Логистика', priorityLevel: 'high' },
      { code: '35.11', name: 'Производство электроэнергии солнечными и ветровыми электростанциями', category: 'Энергетика', priorityLevel: 'high' }
    ]
  },

  'zhetysu-region': {
    regionId: 'zhetysu-region',
    regionName: 'Жетысуская область',
    shortName: 'Жетысуская обл.',
    center: 'г. Талдыкорган',
    specialization: 'Приграничная логистика («Хоргос»), переработка сои и сахарной свеклы, овцеводство, озеро Алаколь',
    description: 'Стратегический мост между Китаем и ЕАЭС через МЦПС «Хоргос» и СЭЗ «Хоргос — Восточные ворота».',
    programs: [
      {
        id: 'mio.zhetysu.khorgos',
        name: 'Жетісу Қолдау / Хоргос Логистика',
        regionId: 'zhetysu-region',
        regionName: 'Жетысуская область',
        akimatPartner: 'Акимат области Жетысу / СПК «Жетісу»',
        maxAmountKzt: 350000000,
        maxAmountText: 'до 350 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 72 месяцев',
        purposeText: 'Сухой порт, кросс-докинг на границе с КНР, заводы соевого масла, гостиницы на Алаколе',
        description: 'Развитие трансграничной торговли и туризма на восточном побережье Алаколя.',
        priorityOkedsSummary: 'Склады на границе (52.1), Соя (10.41), Турбазы Алаколь (55.2), Аккумуляторы (27.2)'
      }
    ],
    priorityOkeds: [
      { code: '52.10', name: 'Деятельность по складированию и хранению (Сухой порт «Хоргос»)', category: 'Логистика', priorityLevel: 'high' },
      { code: '10.41', name: 'Производство растительных масел из сои', category: 'АПК', priorityLevel: 'high' },
      { code: '27.20', name: 'Производство электрических аккумуляторов и аккумуляторных батарей', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '55.20', name: 'Базы отдыха и пансионаты на озере Алаколь', category: 'Туризм', priorityLevel: 'high' }
    ]
  },

  'abay-region': {
    regionId: 'abay-region',
    regionName: 'Абайская область',
    shortName: 'Абайская обл.',
    center: 'г. Семей',
    specialization: 'Машиностроение (Семипалатинский автосборочный), легкая промышленность, мясопереработка, цемент',
    description: 'Историко-культурный центр с мощными традициями легкой промышленности и приграничной торговли с РФ.',
    programs: [
      {
        id: 'mio.abay.damu',
        name: 'Абай Өңірі Даму',
        regionId: 'abay-region',
        regionName: 'Абайская область',
        akimatPartner: 'Акимат области Абай',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Швейные и обувные фабрики, мясокомбинаты, сборка тракторов («Беларус»), деревообработка',
        description: 'Возрождение статуса Семея как флагмана перерабатывающей и легкой промышленности.',
        priorityOkedsSummary: 'Одежда и обувь (14, 15), Мясо (10.11), Сборка сельхозтехники (28.3)'
      }
    ],
    priorityOkeds: [
      { code: '14.12', name: 'Производство спецодежды', category: 'Легкая промышленность', priorityLevel: 'high' },
      { code: '15.20', name: 'Производство обуви', category: 'Легкая промышленность', priorityLevel: 'high' },
      { code: '10.11', name: 'Переработка мяса и мясных консервов (Семипалатинский мясокомбинат)', category: 'АПК', priorityLevel: 'high' },
      { code: '28.30', name: 'Сборка тракторов и прицепной сельхозтехники', category: 'Машиностроение', priorityLevel: 'high' }
    ]
  },

  'east-kz-region': {
    regionId: 'east-kz-region',
    regionName: 'Восточно-Казахстанская область',
    shortName: 'ВКО',
    center: 'г. Усть-Каменогорск',
    specialization: 'Цветная металлургия (титан, цинк, свинец, медь), ядерная медицина, пчеловодство, туризм (Алтай)',
    description: 'Мировой лидер по производству титана и редких металлов, край уникального алтайского меда и туризма.',
    programs: [
      {
        id: 'mio.vko.altai',
        name: 'Шығыс Даму / Алтай Эко',
        regionId: 'east-kz-region',
        regionName: 'Восточно-Казахстанская область',
        akimatPartner: 'Акимат ВКО / СПК «Ертіс»',
        maxAmountKzt: 350000000,
        maxAmountText: 'до 350 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 72 месяцев',
        purposeText: 'Титановые изделия, мед, пантовое оленеводство, горнолыжные базы Алтая, деревообработка',
        description: 'Развитие экологических производств, алтайского туризма и высокотехнологичных металлов.',
        priorityOkedsSummary: 'Цветные металлы (24.4), Пчеловодство (01.49), Горные базы (55.2), Лесопиление (16.1)'
      }
    ],
    priorityOkeds: [
      { code: '24.45', name: 'Производство прочих цветных металлов (титан, тантал, бериллий)', category: 'Металлургия', priorityLevel: 'high' },
      { code: '01.49', name: 'Разведение пчел и производство натурального алтайского меда', category: 'АПК/Эко', priorityLevel: 'high' },
      { code: '55.20', name: 'Горнолыжные курорты и эко-базы отдыха в Алтайских горах', category: 'Туризм', priorityLevel: 'high' },
      { code: '16.10', name: 'Распиловка и строгание древесины', category: 'Деревообработка', priorityLevel: 'medium' }
    ]
  },

  'ulytau-region': {
    regionId: 'ulytau-region',
    regionName: 'Улытауская область',
    shortName: 'Улытауская обл.',
    center: 'г. Жезказган',
    specialization: 'Медная металлургия («Казахмыс»), геологоразведка, развитие МСБ вокруг градообразующих предприятий',
    description: 'Сердце Сарыарки, историческая колыбель казахской государственности и центр медной промышленности.',
    programs: [
      {
        id: 'mio.ulytau.damu',
        name: 'Ұлытау Өрлеу / Локализация',
        regionId: 'ulytau-region',
        regionName: 'Улытауская область',
        akimatPartner: 'Акимат области Ұлытау',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев',
        purposeText: 'Производство запчастей для горно-металлургических комбинатов, сервис, пищевое обеспечение',
        description: 'Специальная программа развития новой области с акцентом на импортозамещение горного оборудования.',
        priorityOkedsSummary: 'Ремонт горного оборудования (33.12), Металлоизделия (25.1), Строительство (41.2)'
      }
    ],
    priorityOkeds: [
      { code: '33.12', name: 'Ремонт оборудования для горно-металлургического комбината', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '25.62', name: 'Основные технологические процессы машиностроения (токарная обработка)', category: 'Металлообработка', priorityLevel: 'high' },
      { code: '10.71', name: 'Производство хлебобулочных изделий для шахтерских городов', category: 'Пищепром', priorityLevel: 'medium' }
    ]
  },

  'kyzylorda-region': {
    regionId: 'kyzylorda-region',
    regionName: 'Кызылординская область',
    shortName: 'Кызылординская обл.',
    center: 'г. Кызылорда',
    specialization: 'Рисоводство и переработка риса, листовое стекло, уранодобыча, пищевая соль (Аралтуз)',
    description: 'Главный рисоводческий регион Казахстана с современным заводом листового стекла Orda Glass.',
    programs: [
      {
        id: 'mio.kyzylorda.rice',
        name: 'Сыр Елі Кәсіпкер',
        regionId: 'kyzylorda-region',
        regionName: 'Кызылординская область',
        akimatPartner: 'Акимат Кызылординской области / СПК «Байконур»',
        maxAmountKzt: 300000000,
        maxAmountText: 'до 300 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 60 месяцев',
        purposeText: 'Шлифовка и упаковка риса, производство автостекла и стеклотары, добыча йодированной соли',
        description: 'Развитие переработки риса и создание кластера промышленной переработки стекла.',
        priorityOkedsSummary: 'Переработка риса (10.61), Листовое стекло (23.11), Стеклоизделия (23.13), Соль (10.84)'
      }
    ],
    priorityOkeds: [
      { code: '10.61.2', name: 'Производство риса шелушеного и шлифованного', category: 'АПК', priorityLevel: 'high' },
      { code: '23.11', name: 'Производство листового стекла', category: 'Стройматериалы', priorityLevel: 'high' },
      { code: '23.13', name: 'Производство стеклянных изделий для упаковки', category: 'Упаковка/стекло', priorityLevel: 'high' },
      { code: '10.84', name: 'Производство пищевой поваренной соли (Арал)', category: 'Пищепром', priorityLevel: 'high' }
    ]
  },

  'west-kz-region': {
    regionId: 'west-kz-region',
    regionName: 'Западно-Казахстанская область',
    shortName: 'ЗКО',
    center: 'г. Уральск',
    specialization: 'Машиностроение (оборонное и нефтегазовое «Зенит», «Гидроприбор»), Карачаганакское месторождение, АПК',
    description: 'Европейская часть Казахстана, граничащая с пятью регионами России, с высоким машиностроительным потенциалом.',
    programs: [
      {
        id: 'mio.zko.orleu',
        name: '«Батыс Өрлеу» (Orleu ЗКО)',
        regionId: 'west-kz-region',
        regionName: 'Западно-Казахстанская область',
        akimatPartner: 'Акимат ЗКО / АО «ФРП «Даму»',
        maxAmountKzt: 500000000,
        maxAmountText: 'до 500 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 84 месяцев',
        purposeText: 'Приобретение технологического оборудования, модернизация заводов и развитие сервисных производств в ЗКО',
        description: 'Региональная программа льготного кредитования «Өрлеу» (Orleu) для субъектов малого и среднего предпринимательства Западно-Казахстанской области.',
        priorityOkedsSummary: 'Машиностроение (28), Металлообработка (25), Пищепром (10), Логистика (52)'
      },
      {
        id: 'mio.zko.karachaganak',
        name: 'Батыс Инвест / Нефтесервис',
        regionId: 'west-kz-region',
        regionName: 'Западно-Казахстанская область',
        akimatPartner: 'Акимат ЗКО / СПК «Aqjaiyq»',
        maxAmountKzt: 350000000,
        maxAmountText: 'до 350 млн ₸',
        borrowerRateText: '12.6% годовых',
        subsidyText: 'Субсидирование ставки до конечной 12.6% годовых, гарантия Даму до 85%',
        termText: 'до 72 месяцев',
        purposeText: 'Катера, запорная арматура высокого давления, газоанализаторы, переработка скота едильбаевской породы',
        description: 'Повышение внутристрановой ценности в проекте расширения Карачаганака.',
        priorityOkedsSummary: 'Запорная арматура (28.14), Судостроение (30.11), Мясопереработка (10.11)'
      }
    ],
    priorityOkeds: [
      { code: '28.14', name: 'Производство кранов, клапанов и вентилей', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '30.11', name: 'Строительство кораблей, судов и плавучих конструкций (Уральский завод «Зенит»)', category: 'Машиностроение', priorityLevel: 'high' },
      { code: '10.11', name: 'Переработка мяса и мясных полуфабрикатов', category: 'АПК', priorityLevel: 'high' },
      { code: '49.41', name: 'Грузовые автоперевозки в трансграничном сообщении с РФ', category: 'Логистика', priorityLevel: 'medium' }
    ]
  }
};

/**
 * Получить профиль МИО по идентификатору региона или его названию
 */
export function getMioProfile(regionIdOrName: string): MioRegionProfile | undefined {
  if (!regionIdOrName) return undefined;
  
  // Прямое совпадение по ID
  if (MIO_REGIONS_DATABASE[regionIdOrName]) {
    return MIO_REGIONS_DATABASE[regionIdOrName];
  }

  const lower = regionIdOrName.toLowerCase().trim();

  // Поиск по ключевым словам в названии
  for (const profile of Object.values(MIO_REGIONS_DATABASE)) {
    if (
      profile.regionName.toLowerCase().includes(lower) ||
      profile.shortName.toLowerCase().includes(lower) ||
      profile.center.toLowerCase().includes(lower) ||
      lower.includes(profile.shortName.toLowerCase()) ||
      lower.includes(profile.center.toLowerCase())
    ) {
      return profile;
    }
  }

  return undefined;
}

/**
 * Проверка применимости конкретного ОКЭД к приоритетам МИО конкретного региона
 */
export function checkMioEligibility(
  regionIdOrName: string,
  okedCode: string
): {
  isPriority: boolean;
  matchedOkeds: MioOkedItem[];
  regionalPrograms: MioRegionalProgram[];
  regionProfile?: MioRegionProfile;
  recommendation: string;
} {
  const profile = getMioProfile(regionIdOrName);
  const cleanOked = okedCode.trim().replace(/,/g, '.').replace(/\s+/g, '');

  if (!profile) {
    return {
      isPriority: false,
      matchedOkeds: [],
      regionalPrograms: [],
      recommendation: 'Регион не выбран или не найден в региональной базе МИО.'
    };
  }

  if (!cleanOked) {
    return {
      isPriority: false,
      matchedOkeds: [],
      regionalPrograms: profile.programs,
      regionProfile: profile,
      recommendation: `В ${profile.regionName} доступны региональные данные МИО. Введите код ОКЭД для точной проверки по официальной матрице.`
    };
  }

  const exactRows = ISKER_OFFICIAL_RECORDS.filter(
    row => row.regionId === profile.regionId && row.okedCode.trim() === cleanOked
  );

  const uniqueMatches = Array.from(
    new Map(exactRows.map(row => [
      row.okedCode,
      {
        code: row.okedCode,
        name: row.activityName,
        category: 'Приоритет МИО',
        priorityLevel: 'high' as const
      }
    ])).values()
  );

  const isPriority = exactRows.length > 0;
  const recommendation = isPriority
    ? `ОКЭД ${cleanOked} подтверждён в официальной матрице МИО для ${profile.regionName}. Для точного заключения необходимо учитывать конкретный город/район, где присутствует эта запись.`
    : `ОКЭД ${cleanOked} не найден как точная запись в официальной матрице МИО для ${profile.regionName}. Общереспубликанские программы проверяются отдельно.`;

  return {
    isPriority,
    matchedOkeds: uniqueMatches,
    regionalPrograms: profile.programs,
    regionProfile: profile,
    recommendation
  };
}

/**
 * Получить список идентификаторов регионов, где данный код ОКЭД находится в приоритете МИО
 */
export function getRegionsWithPriorityOked(okedCode: string): string[] {
  const clean = okedCode.trim().replace(/,/g, '.').replace(/\s+/g, '');
  if (!clean) return [];

  return Array.from(new Set(
    ISKER_OFFICIAL_RECORDS
      .filter(row => row.okedCode.trim() === clean)
      .map(row => row.regionId)
  ));
}
