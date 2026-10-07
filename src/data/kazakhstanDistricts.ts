/**
 * Структурированная база данных районов, моногородов и административных округов
 * 20 регионов Республики Казахстан с детализацией поддерживаемых кодов ОКЭД
 * в рамках программ регионального субсидирования МИО и Фонда «Даму».
 */

import { getIskerAymakDistrictsForRegion } from './iskerAymakMatrix';

export interface DistrictOkedItem {
  code: string;
  name: string;
  nameKk?: string;
  category: string;
  programTag?: string;
  isPriority: boolean;
  rateText?: string;
}

export interface MioDistrictItem {
  id: string;
  name: string;
  nameKk: string;
  regionId: string;
  type: 'city' | 'monotown' | 'district' | 'industrial_zone';
  typeLabel: string;
  center: string;
  specialization: string;
  preferentialRate: string;
  maxSubsidyText: string;
  guaranteeText: string;
  supportedOkeds: DistrictOkedItem[];
}

export const KAZAKHSTAN_DISTRICTS_DATABASE: Record<string, MioDistrictItem[]> = {
  // 1. Актюбинская область (г. Актобе + ключевые районы области)
  'aktobe-region': [
    {
      id: 'aktobe-city',
      name: 'г. Актобе',
      nameKk: 'Ақтөбе қ.',
      regionId: 'aktobe-region',
      type: 'city',
      typeLabel: 'Областной центр / Агломерация',
      center: 'г. Актобе',
      specialization: 'Машиностроение, химическая промышленность, Индустриальная зона «Актобе», медицина, логистический хаб, пищепром, IT',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '25.11', name: 'Производство строительных металлических конструкций', category: 'Металлообработка', isPriority: true, rateText: '12.6%' },
        { code: '20.13', name: 'Производство прочих основных неорганических химических веществ', category: 'Химия', isPriority: true, rateText: '12.6%' },
        { code: '09.10', name: 'Предоставление вспомогательных услуг в области добычи нефти и газа', category: 'Нефтесервис', isPriority: true, rateText: '12.6%' },
        { code: '10.51', name: 'Переработка молока и производство сыров', category: 'АПК переработка', isPriority: true, rateText: '12.6%' },
        { code: '10.71', name: 'Производство хлебобулочных и кондитерских изделий', category: 'Пищепром', isPriority: false, rateText: '12.6%' },
        { code: '52.10', name: 'Складирование и терминальная логистика грузов', category: 'Транспорт и склады', isPriority: true, rateText: '12.6%' },
        { code: '62.01', name: 'Разработка компьютерного программного обеспечения', category: 'IT и связь', isPriority: true, rateText: '12.6%' },
        { code: '86.10', name: 'Деятельность больничных организаций', category: 'Медицина', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'khromtau-district',
      name: 'Хромтауский район',
      nameKk: 'Хромтау ауданы',
      regionId: 'aktobe-region',
      type: 'monotown',
      typeLabel: 'Моногород / Горнорудный кластер',
      center: 'г. Хромтау',
      specialization: 'Добыча и обогащение хромовых руд (Донской ГОК), металлургия, производство огнеупоров, горно-шахтное оборудование',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '07.10', name: 'Добыча железных руд и хромитов', category: 'Горнодобыча', isPriority: true, rateText: '12.6%' },
        { code: '24.51', name: 'Литье чугуна и ферросплавов', category: 'Металлургия', isPriority: true, rateText: '12.6%' },
        { code: '23.20', name: 'Производство огнеупорных изделий', category: 'Стройматериалы', isPriority: true, rateText: '12.6%' },
        { code: '28.92', name: 'Производство оборудования для добычи полезных ископаемых', category: 'Машиностроение', isPriority: true, rateText: '12.6%' },
        { code: '33.12', name: 'Ремонт и монтаж промышленного оборудования', category: 'Сервис', isPriority: true, rateText: '12.6%' },
        { code: '23.61', name: 'Производство изделий из бетона для строительства', category: 'Стройматериалы', isPriority: false, rateText: '12.6%' }
      ]
    },
    {
      id: 'mugalzhar-district',
      name: 'Мугалжарский район',
      nameKk: 'Мұғалжар ауданы',
      regionId: 'aktobe-region',
      type: 'monotown',
      typeLabel: 'Моногород / Нефтегазовый и щебеночный хаб',
      center: 'г. Кандыагаш (а также г. Эмба)',
      specialization: 'Нефтедобыча, щебеночные карьеры, производство строительных материалов, крупный ж/д узел',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '08.12', name: 'Разработка гравийных и песчаных карьеров, добыча щебня', category: 'Горнорудное сырье', isPriority: true, rateText: '12.6%' },
        { code: '06.10', name: 'Добыча сырой нефти и попутного газа', category: 'Недропользование', isPriority: false, rateText: '12.6%' },
        { code: '23.69', name: 'Производство изделий из бетона, цемента и гипса', category: 'Стройматериалы', isPriority: true, rateText: '12.6%' },
        { code: '52.21', name: 'Вспомогательная деятельность железнодорожного транспорта', category: 'Логистика', isPriority: true, rateText: '12.6%' },
        { code: '01.42', name: 'Разведение мясного крупного рогатого скота', category: 'АПК', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'alga-district',
      name: 'Алгинский район',
      nameKk: 'Алға ауданы',
      regionId: 'aktobe-region',
      type: 'district',
      typeLabel: 'Индустриально-аграрный район',
      center: 'г. Алга',
      specialization: 'Индустриальная зона «Актобе-Алга», химическая переработка, птицефабрики, зерноводство',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '20.15', name: 'Производство минеральных удобрений', category: 'Химия', isPriority: true, rateText: '12.6%' },
        { code: '10.12', name: 'Производство и переработка мяса птицы', category: 'АПК переработка', isPriority: true, rateText: '12.6%' },
        { code: '10.11', name: 'Переработка мяса КРС и мелкого скота', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.11', name: 'Выращивание зерновых и зернобобовых культур', category: 'Сельское хозяйство', isPriority: true, rateText: '12.6%' },
        { code: '22.21', name: 'Производство пластмассовых труб и профилей', category: 'Полимеры', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'shalkar-district',
      name: 'Шалкарский район',
      nameKk: 'Шалқар ауданы',
      regionId: 'aktobe-region',
      type: 'district',
      typeLabel: 'Транспортно-логистический район',
      center: 'г. Шалкар',
      specialization: 'Ж/д магистраль «Бейнеу-Шалкар», добыча щебня и минералов, пастбищное животноводство',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '52.29', name: 'Прочая вспомогательная деятельность в области перевозок', category: 'Логистика', isPriority: true, rateText: '12.6%' },
        { code: '08.11', name: 'Добыча камня для строительства, щебня и гипса', category: 'Горнорудное', isPriority: true, rateText: '12.6%' },
        { code: '01.45', name: 'Разведение овец и коз', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.43', name: 'Разведение лошадей и верблюдов', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '10.13', name: 'Производство мясных консервов и полуфабрикатов', category: 'АПК переработка', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'martuk-district',
      name: 'Мартукский район',
      nameKk: 'Мәртөк ауданы',
      regionId: 'aktobe-region',
      type: 'district',
      typeLabel: 'Аграрный / Молочный кластер',
      center: 'с. Мартук',
      specialization: 'Молочно-товарные фермы, промышленное сыроварение, приграничная торговля с РФ, кормопроизводство',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '10.51', name: 'Переработка молока и производство сыров', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.41', name: 'Разведение молочного крупного рогатого скота', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.19', name: 'Выращивание кормовых культур (люцерна, суданка)', category: 'Растениеводство', isPriority: true, rateText: '12.6%' },
        { code: '10.71', name: 'Производство хлебобулочных изделий', category: 'Пищепром', isPriority: false, rateText: '12.6%' },
        { code: '01.61', name: 'Вспомогательная деятельность в области выращивания сельхозкультур', category: 'Агросервис', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'kargaly-district',
      name: 'Каргалинский район',
      nameKk: 'Қарғалы ауданы',
      regionId: 'aktobe-region',
      type: 'district',
      typeLabel: 'Зеленая энергетика и зерновое хозяйство',
      center: 'с. Бадамша',
      specialization: 'Ветроэлектростанции (ВЭС Бадамша), твердые сорта пшеницы, рыбоводство (Каргалинское вдхр.)',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '35.11', name: 'Производство электроэнергии ветровыми электростанциями (ВИЭ)', category: 'Энергетика', isPriority: true, rateText: '12.6%' },
        { code: '01.11', name: 'Выращивание зерновых культур (пшеница, ячмень)', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '03.22', name: 'Пресноводное рыбоводство и разведение ценных пород', category: 'Рыбхоз', isPriority: true, rateText: '12.6%' },
        { code: '10.61', name: 'Производство продуктов мукомольно-крупяной промышленности', category: 'АПК переработка', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'baiganin-district',
      name: 'Байганинский район',
      nameKk: 'Байғанин ауданы',
      regionId: 'aktobe-region',
      type: 'district',
      typeLabel: 'Нефтегазовый и верблюдоводческий район',
      center: 'с. Карауылкельды',
      specialization: 'Добыча нефти, производство шубата, пастбищное верблюдоводство и мясное коневодство',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '09.10', name: 'Предоставление вспомогательных услуг в нефтедобыче', category: 'Нефтесервис', isPriority: true, rateText: '12.6%' },
        { code: '01.43', name: 'Разведение верблюдов и производство шубата', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.45', name: 'Разведение овец едильбаевской породы', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '10.11', name: 'Переработка мяса баранины и говядины', category: 'АПК переработка', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'aiteke-bi-district',
      name: 'Айтекебийский район',
      nameKk: 'Әйтеке би ауданы',
      regionId: 'aktobe-region',
      type: 'district',
      typeLabel: 'Зерновой и мукомольный район',
      center: 'с. Темирбека Жургенова',
      specialization: 'Выращивание твердой пшеницы, семенные хозяйства, элеваторы и хранение зерна',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '01.11', name: 'Выращивание зерновых культур', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '52.10.1', name: 'Хранение и складирование зерна (элеваторы)', category: 'Логистика', isPriority: true, rateText: '12.6%' },
        { code: '10.61', name: 'Производство муки и комбикормов', category: 'АПК переработка', isPriority: true, rateText: '12.6%' },
        { code: '01.42', name: 'Мясное скотоводство', category: 'АПК', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'irgyz-district',
      name: 'Иргизский район',
      nameKk: 'Ырғыз ауданы',
      regionId: 'aktobe-region',
      type: 'district',
      typeLabel: 'Придорожный сервис и озерное рыболовство',
      center: 'с. Иргиз',
      specialization: 'Придорожный сервис трассы «Западная Европа – Западный Китай», рыболовство (Иргиз-Торгай), овцеводство',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '55.10', name: 'Гостиницы и мотели вдоль транзитного коридора', category: 'Туризм и сервис', isPriority: true, rateText: '12.6%' },
        { code: '56.10', name: 'Услуги пунктов питания для водителей транзитного транспорта', category: 'Общепит', isPriority: true, rateText: '12.6%' },
        { code: '03.12', name: 'Пресноводное промышленное рыболовство', category: 'Рыбхоз', isPriority: true, rateText: '12.6%' },
        { code: '01.43', name: 'Коневодство и кумысоделие', category: 'АПК', isPriority: true, rateText: '12.6%' }
      ]
    }
  ],

  // 2. Карагандинская область
  'karaganda-region': [
    {
      id: 'karaganda-city',
      name: 'г. Караганда',
      nameKk: 'Қарағанды қ.',
      regionId: 'karaganda-region',
      type: 'city',
      typeLabel: 'Областной центр / Индустриальный хаб',
      center: 'г. Караганда',
      specialization: 'Машиностроение, горно-шахтное оборудование, металлоконструкции, фармацевтика, пищепром, IT',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '25.11', name: 'Производство строительных металлических конструкций', category: 'Металлообработка', isPriority: true, rateText: '12.6%' },
        { code: '28.92', name: 'Производство машин для добычи полезных ископаемых', category: 'Машиностроение', isPriority: true, rateText: '12.6%' },
        { code: '27.32', name: 'Производство кабельной продукции и проводов', category: 'Электротехника', isPriority: true, rateText: '12.6%' },
        { code: '21.20', name: 'Производство фармацевтических препаратов', category: 'Фармацевтика', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'temirtau-city',
      name: 'г. Темиртау',
      nameKk: 'Теміртау қ.',
      regionId: 'karaganda-region',
      type: 'monotown',
      typeLabel: 'Моногород / Черная металлургия',
      center: 'г. Темиртау',
      specialization: 'Металлургический комбинат (Qarmet), стальной прокат, коксохимия, трубопрокат',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '24.10', name: 'Производство чугуна, стали и ферросплавов', category: 'Металлургия', isPriority: true, rateText: '12.6%' },
        { code: '24.20', name: 'Производство стальных труб, полых профилей и фитингов', category: 'Металлургия', isPriority: true, rateText: '12.6%' },
        { code: '25.62', name: 'Основные технологические процессы машиностроения', category: 'Металлообработка', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'saran-city',
      name: 'г. Сарань',
      nameKk: 'Саран қ.',
      regionId: 'karaganda-region',
      type: 'monotown',
      typeLabel: 'Моногород / Индустриальная зона «Сарань»',
      center: 'г. Сарань',
      specialization: 'Производство автомобильных шин, сборка автобусов и спецтехники, бытовая техника',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '22.11', name: 'Производство резиновых шин, покрышек и камер', category: 'Химия/Автопром', isPriority: true, rateText: '12.6%' },
        { code: '29.10', name: 'Производство автотранспортных средств (автобусы)', category: 'Машиностроение', isPriority: true, rateText: '12.6%' },
        { code: '27.51', name: 'Производство электрических бытовых приборов', category: 'Электроника', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'balkhash-city',
      name: 'г. Балхаш',
      nameKk: 'Балқаш қ.',
      regionId: 'karaganda-region',
      type: 'monotown',
      typeLabel: 'Моногород / Цветная металлургия и туризм',
      center: 'г. Балхаш',
      specialization: 'Выплавка меди (Балхашский медеплавильный завод), курортный туризм на озере Балхаш, рыбный промысел',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '24.44', name: 'Производство меди и медного проката', category: 'Металлургия', isPriority: true, rateText: '12.6%' },
        { code: '55.20', name: 'Зоны отдыха и отели на побережье озера Балхаш', category: 'Туризм', isPriority: true, rateText: '12.6%' },
        { code: '03.22', name: 'Пресноводное рыбоводство и переработка судака/сазана', category: 'Рыбхоз', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'bukhar-zhyrau-district',
      name: 'Бухар-Жырауский район',
      nameKk: 'Бұқар жырау ауданы',
      regionId: 'karaganda-region',
      type: 'district',
      typeLabel: 'Агропродовольственный пояс Караганды',
      center: 'п. Ботакара',
      specialization: 'Птицефабрики, теплицы, производство картофеля, пригородное животноводство',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '01.47', name: 'Разведение птицы и производство пищевых яиц', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.13', name: 'Выращивание овощей, корнеплодов и картофеля', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '10.51', name: 'Переработка молока', category: 'Пищепром', isPriority: true, rateText: '12.6%' }
      ]
    }
  ],

  // 3. г. Астана
  'astana-city': [
    {
      id: 'astana-esil',
      name: 'Район Есиль',
      nameKk: 'Есіл ауданы',
      regionId: 'astana-city',
      type: 'industrial_zone',
      typeLabel: 'Инновационный / Финансовый кластер (МФЦА, Astana Hub)',
      center: 'г. Астана',
      specialization: 'IT-стартапы, разработка ПО, финансовые технологии, консалтинг, деловой туризм',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '62.01', name: 'Деятельность в области компьютерного программирования', category: 'IT', isPriority: true, rateText: '12.6%' },
        { code: '63.11', name: 'Обработка данных, хостинг и связанная деятельность', category: 'IT', isPriority: true, rateText: '12.6%' },
        { code: '64.99', name: 'Предоставление прочих финансовых услуг', category: 'Финтех', isPriority: true, rateText: '12.6%' },
        { code: '55.10', name: 'Гостиницы для делового и конгрессного туризма', category: 'Туризм', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'astana-industrial-zone',
      name: 'Индустриальный парк №1 (район Алматы)',
      nameKk: '№1 Индустриялық саябақ',
      regionId: 'astana-city',
      type: 'industrial_zone',
      typeLabel: 'СЭЗ «Астана — новый город»',
      center: 'г. Астана',
      specialization: 'Локомотивосборочный завод, производство электровозов, медтехники, сборка вертолетов, металлоконструкции',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '30.20', name: 'Производство железнодорожных локомотивов и подвижного состава', category: 'Машиностроение', isPriority: true, rateText: '12.6%' },
        { code: '26.60', name: 'Производство облучающего, электромедицинского оборудования', category: 'Медтехника', isPriority: true, rateText: '12.6%' },
        { code: '25.11', name: 'Производство строительных металлических конструкций', category: 'Металлообработка', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'astana-saryarka',
      name: 'Район Сарыарка & Байконыр',
      nameKk: 'Сарыарқа және Байқоңыр аудандары',
      regionId: 'astana-city',
      type: 'city',
      typeLabel: 'Сервисно-торговый и складской кластер',
      center: 'г. Астана',
      specialization: 'Транспортная логистика, оптово-распределительные центры, пищевые цеха, сервис',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '52.10', name: 'Складирование и хранение продовольственных товаров', category: 'Логистика', isPriority: true, rateText: '12.6%' },
        { code: '10.71', name: 'Производство хлебобулочных изделий', category: 'Пищепром', isPriority: true, rateText: '12.6%' },
        { code: '85.10', name: 'Дошкольное воспитание и частные детсады', category: 'Образование', isPriority: true, rateText: '12.6%' }
      ]
    }
  ],

  // 4. г. Алматы
  'almaty-city': [
    {
      id: 'almaty-alatau-iz',
      name: 'Алатауский район (Индустриальная зона)',
      nameKk: 'Алатау ауданы (Индустриялық аймақ)',
      regionId: 'almaty-city',
      type: 'industrial_zone',
      typeLabel: 'Индустриальная зона г. Алматы / Производство',
      center: 'г. Алматы',
      specialization: 'Сборка легковых автомобилей (Hyundai), производство кабеля, фармацевтика, энергосберегающее оборудование',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '29.10', name: 'Производство автотранспортных средств', category: 'Автопром', isPriority: true, rateText: '12.6%' },
        { code: '21.20', name: 'Производство фармацевтических препаратов', category: 'Фармацевтика', isPriority: true, rateText: '12.6%' },
        { code: '27.32', name: 'Производство проводов и кабелей', category: 'Электротехника', isPriority: true, rateText: '12.6%' },
        { code: '10.82', name: 'Производство какао, шоколада и кондитерских изделий', category: 'Пищепром', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'almaty-medeu-bostandyk',
      name: 'Медеуский & Бостандыкский районы',
      nameKk: 'Медеу және Бостандық аудандары',
      regionId: 'almaty-city',
      type: 'city',
      typeLabel: 'Финансово-туристический и креативный кластер',
      center: 'г. Алматы',
      specialization: 'Шымбулак, Медеу, горный туризм, креативные хабы, частные клиники, университеты, IT',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '55.10', name: 'Гостиницы и эко-отели в предгорьях Заилийского Алатау', category: 'Туризм', isPriority: true, rateText: '12.6%' },
        { code: '90.01', name: 'Деятельность в области исполнительских искусств и креатива', category: 'Креативная сфера', isPriority: true, rateText: '12.6%' },
        { code: '86.10', name: 'Деятельность больничных организаций', category: 'Здравоохранение', isPriority: true, rateText: '12.6%' },
        { code: '62.01', name: 'Компьютерное программирование и мобильные приложения', category: 'IT', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: 'almaty-turksib-zhetysu',
      name: 'Турксибский & Жетысуский районы',
      nameKk: 'Түрксіб және Жетісу аудандары',
      regionId: 'almaty-city',
      type: 'city',
      typeLabel: 'Логистический хаб аэропорта и ж/д',
      center: 'г. Алматы',
      specialization: 'Авиагрузовой терминал, мультимодальные склады, переработка плодоовощной продукции, оптовая торговля',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '52.10', name: 'Складирование и хранение грузов', category: 'Логистика', isPriority: true, rateText: '12.6%' },
        { code: '52.23', name: 'Вспомогательная деятельность авиационного транспорта', category: 'Авиалогистика', isPriority: true, rateText: '12.6%' },
        { code: '10.71', name: 'Производство хлебобулочных изделий', category: 'Пищепром', isPriority: true, rateText: '12.6%' }
      ]
    }
  ]
};

/**
 * Получить список районов для выбранного региона.
 * Если для региона еще нет детального списка районов, генерируется стандартный
 * состав районов региона на основе данных МИО и областных центров.
 */
export function getDistrictsByRegion(regionId: string, regionName: string): MioDistrictItem[] {
  // 1. Официальная региональная матрица программы «Іскер аймақ» (Даму / МИО)
  const officialIskerAymak = getIskerAymakDistrictsForRegion(regionId, regionName);
  if (officialIskerAymak && officialIskerAymak.length > 0) {
    return officialIskerAymak;
  }

  if (KAZAKHSTAN_DISTRICTS_DATABASE[regionId]) {
    return KAZAKHSTAN_DISTRICTS_DATABASE[regionId];
  }

  // Дефолтный генератор районов для любого из 20 регионов на основе общих параметров МИО
  return [
    {
      id: `${regionId}-center`,
      name: `г. ${regionName.replace(/область|облысы/gi, '').trim()}`,
      nameKk: `${regionName} орталығы`,
      regionId,
      type: 'city',
      typeLabel: 'Областной центр / Индустриальная зона',
      center: regionName,
      specialization: 'Обрабатывающая промышленность, машиностроение, пищепром, логистика, медицина',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '25.11', name: 'Производство строительных металлических конструкций', category: 'Металлообработка', isPriority: true, rateText: '12.6%' },
        { code: '10.51', name: 'Переработка молока и сыров', category: 'АПК переработка', isPriority: true, rateText: '12.6%' },
        { code: '52.10', name: 'Складирование и логистика', category: 'Логистика', isPriority: true, rateText: '12.6%' },
        { code: '10.11', name: 'Переработка и консервирование мяса', category: 'Пищепром', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: `${regionId}-monotown`,
      name: 'Моногорода региона',
      nameKk: 'Өңірдегі моноқалалар',
      regionId,
      type: 'monotown',
      typeLabel: 'Моногород / Промышленный узел',
      center: 'Моногород региона',
      specialization: 'Градообразующие предприятия, горнорудная металлургия, машиностроение, субсидированные кредиты',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '28.92', name: 'Производство оборудования для добычи и карьеров', category: 'Машиностроение', isPriority: true, rateText: '12.6%' },
        { code: '24.10', name: 'Металлургическое производство', category: 'Металлургия', isPriority: true, rateText: '12.6%' },
        { code: '33.12', name: 'Ремонт промышленного оборудования', category: 'Сервис', isPriority: true, rateText: '12.6%' }
      ]
    },
    {
      id: `${regionId}-rural`,
      name: 'Сельские районы региона',
      nameKk: 'Өңірдің ауылдық аудандары',
      regionId,
      type: 'district',
      typeLabel: 'Сельские районы / АПК',
      center: 'Сельские округа',
      specialization: 'Сельхозкооперативы, молочные фермы, зерноводство, переработка плодоовощной продукции',
      preferentialRate: '12.6% годовых',
      maxSubsidyText: 'Субсидирование до 12.6%',
      guaranteeText: 'Гарантия Даму до 85%',
      supportedOkeds: [
        { code: '01.11', name: 'Выращивание зерновых и зернобобовых', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.41', name: 'Разведение молочного скота', category: 'АПК', isPriority: true, rateText: '12.6%' },
        { code: '01.42', name: 'Мясное скотоводство', category: 'АПК', isPriority: true, rateText: '12.6%' }
      ]
    }
  ];
}
