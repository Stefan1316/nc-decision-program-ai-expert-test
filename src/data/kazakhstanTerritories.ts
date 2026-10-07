import { TerritoryLevel } from '../types/damu';

export interface TerritoryOption {
  id: string;
  name: string;
  level: TerritoryLevel;
  typeLabel: string;
  group: 'Города республиканского значения' | 'Области Республики Казахстан' | 'Крупные и областные города';
}

export const KAZAKHSTAN_TERRITORIES: TerritoryOption[] = [
  // Города республиканского значения
  {
    id: 'almaty-city',
    name: 'Алматы',
    level: 'city',
    typeLabel: 'Город республиканского значения',
    group: 'Города республиканского значения'
  },
  {
    id: 'astana-city',
    name: 'Астана',
    level: 'city',
    typeLabel: 'Столица / Город республиканского значения',
    group: 'Города республиканского значения'
  },
  {
    id: 'shymkent-city',
    name: 'Шымкент',
    level: 'city',
    typeLabel: 'Город республиканского значения',
    group: 'Города республиканского значения'
  },

  // 17 Областей РК
  {
    id: 'abay-region',
    name: 'Абайская область',
    level: 'region',
    typeLabel: 'Область (центр: Семей)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'akmola-region',
    name: 'Акмолинская область',
    level: 'region',
    typeLabel: 'Область (центр: Кокшетау)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'aktobe-region',
    name: 'Актюбинская область',
    level: 'region',
    typeLabel: 'Область (центр: Актобе)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'almaty-region',
    name: 'Алматинская область',
    level: 'region',
    typeLabel: 'Область (центр: Конаев)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'atyrau-region',
    name: 'Атырауская область',
    level: 'region',
    typeLabel: 'Область (центр: Атырау)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'west-kz-region',
    name: 'Западно-Казахстанская область',
    level: 'region',
    typeLabel: 'Область (центр: Уральск)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'zhambyl-region',
    name: 'Жамбылская область',
    level: 'region',
    typeLabel: 'Область (центр: Тараз)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'zhetysu-region',
    name: 'Жетысуская область',
    level: 'region',
    typeLabel: 'Область (центр: Талдыкорган)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'karaganda-region',
    name: 'Карагандинская область',
    level: 'region',
    typeLabel: 'Область (центр: Караганда)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'kostanay-region',
    name: 'Костанайская область',
    level: 'region',
    typeLabel: 'Область (центр: Костанай)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'kyzylorda-region',
    name: 'Кызылординская область',
    level: 'region',
    typeLabel: 'Область (центр: Кызылорда)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'mangystau-region',
    name: 'Мангистауская область',
    level: 'region',
    typeLabel: 'Область (центр: Актау)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'pavlodar-region',
    name: 'Павлодарская область',
    level: 'region',
    typeLabel: 'Область (центр: Павлодар)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'north-kz-region',
    name: 'Северо-Казахстанская область',
    level: 'region',
    typeLabel: 'Область (центр: Петропавловск)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'turkestan-region',
    name: 'Туркестанская область',
    level: 'region',
    typeLabel: 'Область (центр: Туркестан)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'ulytau-region',
    name: 'Улытауская область',
    level: 'region',
    typeLabel: 'Область (центр: Жезказган)',
    group: 'Области Республики Казахстан'
  },
  {
    id: 'east-kz-region',
    name: 'Восточно-Казахстанская область',
    level: 'region',
    typeLabel: 'Область (центр: Усть-Каменогорск)',
    group: 'Области Республики Казахстан'
  },

  // Крупные города и областные центры
  {
    id: 'karaganda-city',
    name: 'Караганда',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'aktobe-city',
    name: 'Актобе',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'taraz-city',
    name: 'Тараз',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'pavlodar-city',
    name: 'Павлодар',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'ust-kamenogorsk-city',
    name: 'Усть-Каменогорск',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'semey-city',
    name: 'Семей',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'atyrau-city',
    name: 'Атырау',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'kostanay-city',
    name: 'Костанай',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'kyzylorda-city',
    name: 'Кызылорда',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'uralsk-city',
    name: 'Уральск',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'petropavlovsk-city',
    name: 'Петропавловск',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'aktau-city',
    name: 'Актау',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'temirtau-city',
    name: 'Темиртау',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'turkestan-city',
    name: 'Туркестан',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'kokshetau-city',
    name: 'Кокшетау',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'taldykorgan-city',
    name: 'Талдыкорган',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'ekibastuz-city',
    name: 'Экибастуз',
    level: 'city',
    typeLabel: 'Моногород / город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'rudny-city',
    name: 'Рудный',
    level: 'city',
    typeLabel: 'Моногород / город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'zhezkazgan-city',
    name: 'Жезказган',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  },
  {
    id: 'konaev-city',
    name: 'Конаев',
    level: 'city',
    typeLabel: 'Город областного значения',
    group: 'Крупные и областные города'
  }
];
