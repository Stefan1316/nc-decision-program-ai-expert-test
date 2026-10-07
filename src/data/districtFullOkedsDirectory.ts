import { DistrictOkedItem } from './kazakhstanDistricts';

/**
 * Базовый каталог отраслей ОКЭД по всем действующим программам Фонда «Даму» и МИО:
 * 1. «Өрлеу» / Orleu и Лизинг (Обрабатывающая промышленность, машиностроение, пищепром)
 * 2. Единая комплексная программа (ЕКП / МСБ: производство, услуги, логистика, IT)
 * 3. Субсидирование внутренней торговли (ОКЭД 46, 47, 68.20.3-68.20.5)
 * 4. АПК и переработка сельхозпродукции (Субсидии, гарантирование)
 * 5. Социальное предпринимательство и сельские квоты («С дипломом — в село!»)
 */

export const MANUFACTURING_ORLEU_OKEDS: DistrictOkedItem[] = [
  { code: '10.11', name: 'Переработка и консервирование мяса', category: 'Пищепром', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '10.51', name: 'Переработка молока и производство сыров', category: 'Пищепром', programTag: '«Өрлеу» / АПК', isPriority: true, rateText: '12.6%' },
  { code: '10.61', name: 'Производство продуктов мукомольно-крупяной промышленности', category: 'Пищепром', programTag: '«Өрлеу» / АПК', isPriority: true, rateText: '12.6%' },
  { code: '10.71', name: 'Производство хлебобулочных и мучных кондитерских изделий', category: 'Пищепром', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '10.85', name: 'Производство готовых пищевых продуктов и полуфабрикатов', category: 'Пищепром', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '11.07', name: 'Производство безалкогольных напитков и минеральных вод', category: 'Пищепром', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '13.20', name: 'Ткацкое производство и текстиль', category: 'Легпром', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '14.13', name: 'Производство верхней одежды и спецодежды', category: 'Легпром', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '15.20', name: 'Производство обуви и кожгалантереи', category: 'Легпром', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '16.23', name: 'Производство деревянных строительных конструкций и столярных изделий', category: 'Деревообработка', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '17.21', name: 'Производство гофрированной бумаги, картона и бумажной тары', category: 'Упаковка', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '18.12', name: 'Полиграфическая деятельность и тиражирование', category: 'Полиграфия', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '20.41', name: 'Производство мыла и моющих средств, чистящих препаратов', category: 'Химпром', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '21.20', name: 'Производство фармацевтических препаратов и лекарств', category: 'Фармацевтика', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '22.21', name: 'Производство пластмассовых плит, полос, труб и профилей', category: 'Полимеры', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '23.61', name: 'Производство изделий из бетона для строительства', category: 'Стройматериалы', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '23.64', name: 'Производство сухих строительных смесей', category: 'Стройматериалы', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '24.10', name: 'Производство чугуна, стали и ферросплавов', category: 'Металлургия', programTag: '«Өрлеу» (Кредитование)', isPriority: true, rateText: '12.6%' },
  { code: '25.11', name: 'Производство строительных металлических конструкций', category: 'Металлообработка', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '25.62', name: 'Основные технологические процессы машинной обработки металлов', category: 'Металлообработка', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '26.20', name: 'Производство компьютеров и периферийного оборудования', category: 'Приборостроение', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '27.12', name: 'Производство электрораспределительной и регулирующей аппаратуры', category: 'Электротехника', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '28.14', name: 'Производство кранов, клапанов и трубопроводной арматуры', category: 'Машиностроение', programTag: '«Өрлеу» (Кредитование)', isPriority: true, rateText: '12.6%' },
  { code: '28.22', name: 'Производство подъемно-транспортного оборудования и погрузчиков', category: 'Машиностроение', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '28.30', name: 'Производство сельскохозяйственных и лесохозяйственных машин', category: 'Машиностроение', programTag: '«Өрлеу» / АПК', isPriority: true, rateText: '12.6%' },
  { code: '28.92', name: 'Производство машин и оборудования для добычи полезных ископаемых', category: 'Машиностроение', programTag: '«Өрлеу» (Кредитование)', isPriority: true, rateText: '12.6%' },
  { code: '29.20', name: 'Производство кузовов для автотранспортных средств, прицепов и полуприцепов', category: 'Машиностроение', programTag: '«Өрлеу» / Лизинг', isPriority: true, rateText: '12.6%' },
  { code: '30.11', name: 'Строительство кораблей, судов и плавучих конструкций', category: 'Судостроение', programTag: '«Өрлеу» / Машиностроение', isPriority: true, rateText: '12.6%' },
  { code: '31.01', name: 'Производство мебели для офисов и предприятий торговли', category: 'Мебель', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '31.09', name: 'Производство прочей мебели', category: 'Мебель', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '33.12', name: 'Ремонт и техническое обслуживание промышленного оборудования', category: 'Сервис', programTag: '«Өрлеу» / Сервис', isPriority: true, rateText: '12.6%' }
];

export const TRADE_OKEDS: DistrictOkedItem[] = [
  { code: '46.39', name: 'Неспециализированная оптовая торговля пищевыми продуктами, напитками', category: 'Торговля', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' },
  { code: '46.73', name: 'Оптовая торговля лесоматериалами, строительными материалами и сантехникой', category: 'Торговля', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' },
  { code: '46.90', name: 'Неспециализированная оптовая торговля', category: 'Торговля', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' },
  { code: '47.11', name: 'Розничная торговля в неспециализированных магазинах преимущественно продуктами', category: 'Торговля', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' },
  { code: '47.21', name: 'Розничная торговля фруктами и овощами в специализированных магазинах', category: 'Торговля', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' },
  { code: '47.73', name: 'Розничная торговля лекарственными средствами (аптеки)', category: 'Торговля / Медицина', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' },
  { code: '68.20.3', name: 'Аренда и управление собственными или арендованными торговыми центрами и рынками', category: 'Торговля / Недвижимость', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' },
  { code: '68.20.5', name: 'Аренда и эксплуатация складских комплексов и логистических терминалов', category: 'Логистика', programTag: 'Субсидирование торговли (Даму)', isPriority: true, rateText: '12.6%' }
];

export const AGRICULTURE_OKEDS: DistrictOkedItem[] = [
  { code: '01.11', name: 'Выращивание зерновых, зернобобовых и семян масличных культур', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.13', name: 'Выращивание овощей и бахчевых, корнеплодов и клубнеплодов', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.21', name: 'Выращивание винограда', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.24', name: 'Выращивание семечковых и косточковых плодов (яблоневые сады)', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.41', name: 'Разведение молочного крупного рогатого скота и производство сырого молока', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.42', name: 'Разведение прочего крупного рогатого скота и буйволов (мясное скотоводство)', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.45', name: 'Разведение овец и коз', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.47', name: 'Разведение птицы (бройлерные и яичные птицефабрики)', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '01.61', name: 'Вспомогательная деятельность в области выращивания сельскохозяйственных культур', category: 'АПК', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' },
  { code: '03.22', name: 'Пресноводное рыбоводство и аквакультура', category: 'АПК / Рыбоводство', programTag: 'АПК & Гарантии Даму', isPriority: true, rateText: '12.6%' }
];

export const SERVICES_IT_LOGISTICS_OKEDS: DistrictOkedItem[] = [
  { code: '49.41', name: 'Деятельность грузового автомобильного транспорта', category: 'Логистика', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '52.10', name: 'Складирование и хранение грузов (овощехранилища, склады класса A/B)', category: 'Логистика', programTag: '«Өрлеу» / ЕКП', isPriority: true, rateText: '12.6%' },
  { code: '52.29', name: 'Прочая вспомогательная транспортная деятельность и экспедирование', category: 'Логистика', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' },
  { code: '62.01', name: 'Компьютерное программирование и разработка ПО', category: 'IT', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' },
  { code: '62.02', name: 'Консультационные услуги в области компьютерных технологий', category: 'IT', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' },
  { code: '63.11', name: 'Обработка данных, размещение приложений (хостинг) и сопутствующие услуги', category: 'IT', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' },
  { code: '71.12', name: 'Деятельность в области инженерных изысканий и технического проектирования', category: 'Инжиниринг', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' },
  { code: '71.20', name: 'Технические испытания, исследования и сертификация лабораторий', category: 'Инжиниринг', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' },
  { code: '55.10', name: 'Предоставление услуг гостиницами и аналогичными местами проживания', category: 'Туризм', programTag: 'ЕКП: Туризм', isPriority: true, rateText: '12.6%' },
  { code: '55.20', name: 'Предоставление жилья на выходные дни и кемпинги (эко-туризм)', category: 'Туризм', programTag: 'ЕКП: Туризм', isPriority: true, rateText: '12.6%' },
  { code: '79.12', name: 'Деятельность туристских операторов', category: 'Туризм', programTag: 'ЕКП: Туризм', isPriority: true, rateText: '12.6%' }
];

export const SOCIAL_RURAL_QUOTA_OKEDS: DistrictOkedItem[] = [
  { code: '85.10', name: 'Дошкольное образование (детские сады и центры раннего развития)', category: 'Образование', programTag: 'ЕКП / Социальное', isPriority: true, rateText: '12.6%' },
  { code: '85.31', name: 'Общее среднее образование (частные школы и лицеи)', category: 'Образование', programTag: 'ЕКП / «С дипломом в село»', isPriority: true, rateText: '12.6%' },
  { code: '85.59', name: 'Прочие виды образования (языковые школы, центры профобучения)', category: 'Образование', programTag: 'ЕКП / Социальное', isPriority: true, rateText: '12.6%' },
  { code: '86.10', name: 'Деятельность больничных организаций и стационаров', category: 'Медицина', programTag: 'ЕКП / «С дипломом в село»', isPriority: true, rateText: '12.6%' },
  { code: '86.21', name: 'Общая врачебная практика (сельские амбулатории и клиники)', category: 'Медицина', programTag: 'ЕКП / «С дипломом в село»', isPriority: true, rateText: '12.6%' },
  { code: '86.22', name: 'Специальная врачебная практика (диагностические медцентры)', category: 'Медицина', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' },
  { code: '86.23', name: 'Стоматологическая деятельность', category: 'Медицина', programTag: 'ЕКП / «С дипломом в село»', isPriority: true, rateText: '12.6%' },
  { code: '75.00', name: 'Ветеринарная деятельность (ветеринарные пункты и клиники)', category: 'Ветеринария', programTag: '«С дипломом в село» / АПК', isPriority: true, rateText: '12.6%' },
  { code: '93.11', name: 'Функционирование спортивных сооружений и залов', category: 'Спорт', programTag: 'ЕКП / «С дипломом в село»', isPriority: true, rateText: '12.6%' },
  { code: '93.29', name: 'Прочая деятельность по организации отдыха и развлечений', category: 'Досуг', programTag: 'ЕКП: МСБ', isPriority: true, rateText: '12.6%' }
];

/**
 * Получить полный унифицированный перечень ОКЭД для конкретного района/города,
 * объединяющий:
 * - официальные коды программы «Іскер аймақ» (с тегом "«Іскер аймақ» (МИО)");
 * - обрабатывающую промышленность программы «Өрлеу» / Orleu и лизинга;
 * - внутреннюю торговлю (ОКЭД 46, 47, 68.20);
 * - агропромышленный комплекс и сельское хозяйство;
 * - IT, логистику и инженерию;
 * - медицину, образование и сельские квоты программы «С дипломом — в село!».
 */
export function buildComprehensiveDistrictOkeds(
  iskerOkeds: { code: string; name: string }[] = [],
  districtType: 'city' | 'monotown' | 'district' | 'industrial_zone' = 'city',
  isRepCity: boolean = false
): DistrictOkedItem[] {
  const map = new Map<string, DistrictOkedItem>();

  // 1. Первыми добавляем официальные региональные приоритеты МИО «Іскер аймақ» (только если не город республиканского значения)
  if (!isRepCity) {
    for (const item of iskerOkeds) {
      const code = item.code.trim();
      map.set(code, {
        code,
        name: item.name,
        category: 'Приоритет МИО',
        programTag: '«Іскер аймақ» (МИО)',
        isPriority: true,
        rateText: '12.6%'
      });
    }
  }

  // 2. Обрабатывающая промышленность «Өрлеу»
  for (const item of MANUFACTURING_ORLEU_OKEDS) {
    if (!map.has(item.code)) {
      map.set(item.code, item);
    }
  }

  // 3. Внутренняя торговля (Даму)
  // В городах республиканского значения (Астана, Алматы, Шымкент) субсидирование торговли НЕ РАБОТАЕТ!
  for (const item of TRADE_OKEDS) {
    if (!map.has(item.code)) {
      if (isRepCity) {
        map.set(item.code, {
          ...item,
          programTag: 'Торговля (Гарантия Даму; субсидия исключена)',
          rateText: 'Субсидия не действует',
          isPriority: false
        });
      } else {
        map.set(item.code, item);
      }
    }
  }

  // 4. Сельское хозяйство и АПК (особенно важно для районов и аграрных городов)
  for (const item of AGRICULTURE_OKEDS) {
    if (!map.has(item.code)) {
      map.set(item.code, item);
    }
  }

  // 5. Логистика, транспорт и IT
  for (const item of SERVICES_IT_LOGISTICS_OKEDS) {
    if (!map.has(item.code)) {
      map.set(item.code, item);
    }
  }

  // 6. Социальная сфера, здравоохранение, образование
  for (const item of SOCIAL_RURAL_QUOTA_OKEDS) {
    if (!map.has(item.code)) {
      if (isRepCity && item.programTag?.includes('С дипломом в село')) {
        map.set(item.code, {
          ...item,
          programTag: 'ЕКП / Социальное (в городах)',
          rateText: '12.6%'
        });
      } else {
        map.set(item.code, item);
      }
    }
  }

  return Array.from(map.values());
}
