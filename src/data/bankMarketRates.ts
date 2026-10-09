import { UserQuery } from '../types/damu';

export interface MarketRateSource {
  sourceId: string;
  institution: string;
  institutionType: 'nbk' | 'bank';
  productName: string;
  nominalRateText: string;
  aeirText?: string;
  amountText?: string;
  termText?: string;
  borrowerText?: string;
  purposeText?: string;
  collateralText?: string;
  sourceUrl: string;
  checkedOn: string;
  effectiveOn?: string;
  dataQuality: 'high' | 'medium';
}

export const NBK_BASE_RATE = {
  ratePercent: 16.25,
  corridorText: '15,25%–17,25%',
  effectiveFrom: '2026-09-07',
  nextDecisionDate: '2026-10-23',
  sourceUrl: 'https://nationalbank.kz/ru/news/grafik-prinyatiya-resheniy-po-bazovoy-stavke/rubrics/2365',
  checkedOn: '2026-10-06'
} as const;

// Only official public bank sources are included. If a bank does not publish a
// numerical rate in a machine-readable/public page, NC Decision must not invent it.
export const BANK_MARKET_RATES: MarketRateSource[] = [
  {
    sourceId: 'SRC-HALYK-PREDPRENIMATEL-20261006',
    institution: 'Halyk Bank',
    institutionType: 'bank',
    productName: 'Halyk Предприниматель',
    nominalRateText: 'от 22,75% до 30% годовых',
    aeirText: 'ГЭСВ от 25,00% до 35,00%',
    amountText: 'до 600 млн ₸',
    termText: 'до 7 лет',
    borrowerText: 'действующий бизнес',
    purposeText: 'оборотный капитал; развитие бизнеса; имущество; коммерческая недвижимость; ремонт/реконструкция',
    sourceUrl: 'https://halykbank.kz/business/credit/halyk-predprinimatel',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  },
  {
    sourceId: 'SRC-HALYK-BUSINESS-MEDIUM-20261006',
    institution: 'Halyk Bank',
    institutionType: 'bank',
    productName: 'Business Medium',
    nominalRateText: 'от 20,75% до 30% годовых',
    aeirText: 'ГЭСВ от 23,23% до 35,00%',
    amountText: 'до 15 млрд ₸',
    termText: 'до 7 лет',
    borrowerText: 'действующий и стартовый бизнес',
    purposeText: 'инвестиции; основные средства; ремонт/реконструкция; рефинансирование',
    collateralText: 'движимое и недвижимое имущество; при недостатке залога возможны гарантийные механизмы при соответствии их правилам',
    sourceUrl: 'https://halykbank.kz/business/credit/biznes-medium',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  },
  {
    sourceId: 'SRC-HALYK-ONLINE-IP-20261006',
    institution: 'Halyk Bank',
    institutionType: 'bank',
    productName: 'Онлайн кредит для ИП',
    nominalRateText: 'от 25% до 37,5% годовых',
    aeirText: 'ГЭСВ от 27,50% до 46,00%',
    amountText: 'до 100 млн ₸',
    termText: 'до 48 месяцев',
    borrowerText: 'ИП; срок деятельности от 6 месяцев',
    purposeText: 'развитие бизнеса; рефинансирование',
    collateralText: 'без залога',
    sourceUrl: 'https://halykbank.kz/business/credit/onlainkredit-ip',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  },
  {
    sourceId: 'SRC-BCC-CREDIT-LIMIT-20261006',
    institution: 'Банк ЦентрКредит',
    institutionType: 'bank',
    productName: 'Кредитный лимит на счёт',
    nominalRateText: '23,5% годовых',
    aeirText: 'ГЭСВ 26,21%–27,45%',
    amountText: 'до 250 млн ₸',
    termText: 'лимит/транш до 30 дней по опубликованным тарифам',
    borrowerText: 'ИП и ТОО',
    purposeText: 'операционное финансирование бизнеса',
    collateralText: 'без залога',
    sourceUrl: 'https://www.bcc.kz/business/loans/credit-limit-for-account/',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  },
  {
    sourceId: 'SRC-BCC-GROWING-BUSINESS-20261006',
    institution: 'Банк ЦентрКредит',
    institutionType: 'bank',
    productName: 'Растущий бизнес',
    nominalRateText: 'ставка различается по форме заёмщика, обеспечению и варианту кредита; конкретные диапазоны следует уточнить по действующему тарифу банка',
    aeirText: 'ГЭСВ зависит от выбранного банковского продукта и условий заёмщика; требуется подтверждение действующего тарифа',
    amountText: 'до 300 млн ₸ по залоговому варианту; беззалоговые лимиты ниже',
    termText: 'до 120 месяцев по инвестиционному залоговому финансированию',
    borrowerText: 'ИП и юридические лица',
    purposeText: 'развитие бизнеса / инвестиции',
    sourceUrl: 'https://www.bcc.kz/business/loans/growing-business/',
    checkedOn: '2026-10-06',
    dataQuality: 'medium'
  },
  {
    sourceId: 'SRC-FORTE-COLLATERAL-IP-20261006',
    institution: 'ForteBank',
    institutionType: 'bank',
    productName: 'Залоговый кредит для ИП / МСБ',
    nominalRateText: 'от 19,75% годовых',
    aeirText: 'ГЭСВ от 23,30% до 35%',
    amountText: 'до 1 млрд ₸ по опубликованному залоговому продукту',
    termText: 'до 84 месяцев',
    borrowerText: 'ИП / МСБ по условиям продукта',
    purposeText: 'пополнение оборотных средств; инвестиции; рефинансирование',
    collateralText: 'жилая и коммерческая недвижимость; на официальной странице также указана гарантия Фонда «Даму»',
    sourceUrl: 'https://business.forte.kz/ru/declaration',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  },
  {
    sourceId: 'SRC-FORTE-MSB-OFFLINE-20261006',
    institution: 'ForteBank',
    institutionType: 'bank',
    productName: 'Офлайн-кредит для бизнеса',
    nominalRateText: 'от 19,75% годовых',
    aeirText: 'ГЭСВ от 23,30% до 35%',
    amountText: 'до 8 млрд ₸',
    termText: 'до 84 месяцев',
    borrowerText: 'бизнес-клиенты',
    purposeText: 'развитие бизнеса; оборудование; новые проекты',
    sourceUrl: 'https://business.forte.kz/ru/credits',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  },
  {
    sourceId: 'SRC-FORTE-AUTO-MSB-20261006',
    institution: 'ForteBank',
    institutionType: 'bank',
    productName: 'Автокредит для МСБ',
    nominalRateText: 'от 20% до 30% годовых',
    aeirText: 'ГЭСВ от 21,94% до 35%',
    amountText: 'до 100 млн ₸',
    termText: 'до 60 месяцев',
    borrowerText: 'МСБ',
    purposeText: 'приобретение автотранспорта для бизнеса',
    sourceUrl: 'https://business.forte.kz/ru/credits',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  },
  {
    sourceId: 'SRC-BEREKE-IP-ONLINE-20261006',
    institution: 'Bereke Bank',
    institutionType: 'bank',
    productName: 'Кредит для ИП онлайн',
    nominalRateText: '37,5% годовых',
    aeirText: 'ГЭСВ от 44,26% до 44,73%',
    amountText: '300 тыс. ₸ – 15 млн ₸',
    termText: 'от 12 месяцев',
    borrowerText: 'ИП; срок деятельности от 6 месяцев; резидент РК',
    purposeText: 'финансирование бизнеса',
    sourceUrl: 'https://berekebank.kz/ru/small_business/credits/business/',
    checkedOn: '2026-10-06',
    dataQuality: 'high'
  }
];

export interface MarketFundingSnapshot {
  baseRate: typeof NBK_BASE_RATE;
  products: MarketRateSource[];
}

export function getMarketFundingSnapshot(query: UserQuery): MarketFundingSnapshot {
  const entity = query.entity_type;
  const amount = query.amount_kzt || null;

  const products = BANK_MARKET_RATES.filter((p) => {
    if (p.sourceId.includes('BEREKE-IP') || p.sourceId.includes('HALYK-ONLINE-IP')) {
      if (entity && entity !== 'ИП' && entity !== 'Любое') return false;
    }
    if (p.sourceId.includes('BCC-CREDIT-LIMIT') && amount && amount > 250_000_000) return false;
    if (p.sourceId.includes('HALYK-PREDPRENIMATEL') && amount && amount > 600_000_000) return false;
    if (p.sourceId.includes('HALYK-ONLINE-IP') && amount && amount > 100_000_000) return false;
    if (p.sourceId.includes('BEREKE-IP') && amount && amount > 15_000_000) return false;
    if (p.sourceId.includes('FORTE-AUTO') && amount && amount > 100_000_000) return false;
    if (p.sourceId.includes('FORTE-COLLATERAL') && amount && amount > 1_000_000_000) return false;
    if (p.sourceId.includes('FORTE-MSB-OFFLINE') && amount && amount > 8_000_000_000) return false;
    return true;
  });

  return { baseRate: NBK_BASE_RATE, products };
}
