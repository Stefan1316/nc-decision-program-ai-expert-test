import { EvaluationSummary } from './decisionEngine';
import { resolveOked } from '../data/okedMaster';
import { getMarketFundingSnapshot, MarketFundingSnapshot } from '../data/bankMarketRates';

export interface FundingFallbackRoute {
  show: boolean;
  headline: string;
  explanation: string;
  routes: Array<{
    id: 'commercial_bvu' | 'damu_guarantee' | 'leasing' | 'regional_other';
    title: string;
    status: 'available_route' | 'needs_verification';
    description: string;
    sourceId?: string;
  }>;
  okedRecognized: boolean;
  okedName?: string;
  market: MarketFundingSnapshot;
}

export function buildFundingFallback(summary: EvaluationSummary): FundingFallbackRoute {
  const resolution = resolveOked(summary.query.oked_code);
  const market = getMarketFundingSnapshot(summary.query);

  const allEligible = [
    ...summary.exact_matches,
    ...summary.possible_matches,
    ...summary.needs_clarification,
    ...summary.needs_verification
  ];

  const hasConfirmedConcession =
    summary.exact_matches.some((r) =>
      ['Субсидирование ставки', 'Льготное кредитование'].includes(r.program.instrument_type)
    );

  const gf1 = allEligible.find((r) => r.program.id === 'damu.guarantee.guarantee_fund_1');
  const gf1Excluded = summary.not_applicable.some((r) => r.program.id === 'damu.guarantee.guarantee_fund_1');
  const leasingCandidate = allEligible.find((r) => r.program.instrument_type.toLowerCase().includes('лизинг'));

  const routes: FundingFallbackRoute['routes'] = [];

  if (!hasConfirmedConcession && resolution.found) {
    routes.push({
      id: 'commercial_bvu',
      title: 'Коммерческое финансирование БВУ',
      status: 'available_route',
      description: `Льготная ставка по подтверждённым программам не найдена. Рыночный ориентир формируется только из официально опубликованных банковских продуктов. Базовая ставка НБРК: ${market.baseRate.ratePercent}% (с ${market.baseRate.effectiveFrom}); это не ставка кредита клиента.`,
      sourceId: 'SRC-NBK-BASE-RATE'
    });

    if (gf1 && !gf1Excluded) {
      routes.push({
        id: 'damu_guarantee',
        title: 'Коммерческий кредит + Гарантийный фонд 1 «Даму»',
        status: 'needs_verification',
        description: 'Этот маршрут показывается только потому, что decision engine не выявил исключение по ГФ1. Официальные параметры: финансирование не более 7 млрд ₸; гарантия до 85% суммы финансирования, но не более 3,5 млрд ₸; комиссия 1,5% от суммы гарантии при выпуске и ежегодно от остатка гарантии. Необходимо подтвердить все требования Правил, включая кредитную историю, отсутствие текущей просрочки и иные исключения.',
        sourceId: 'SRC-GF1'
      });
    }

    if (leasingCandidate || summary.query.purpose === 'Лизинг') {
      routes.push({
        id: 'leasing',
        title: 'Лизинговый маршрут',
        status: 'needs_verification',
        description: 'Показывается только как отдельный финансовый маршрут для техники/оборудования. Конкретная ставка, предмет лизинга, аванс и применимость господдержки проверяются по регламенту выбранного лизингодателя/программы.'
      });
    }

    routes.push({
      id: 'regional_other',
      title: 'Другие институты и региональные механизмы',
      status: 'needs_verification',
      description: 'После подключения СПК, СЭЗ и других институтов этот слой будет проверяться по их собственным регламентам. Наличие полного ОКЭД в справочнике само по себе не создаёт право на поддержку.'
    });
  }

  return {
    show: !hasConfirmedConcession && resolution.found,
    headline: 'Льготная ставка по текущим параметрам не подтверждена',
    explanation: 'NC Decision не останавливает маршрут финансирования: отдельно показывает рыночные продукты БВУ и только те инструменты господдержки, которые не исключены их собственными правилами.',
    routes,
    okedRecognized: resolution.found,
    okedName: resolution.record?.nameRu,
    market
  };
}
