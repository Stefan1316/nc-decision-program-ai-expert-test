import { UserQuery } from '../types/damu';

/**
 * Future analytics contract for aggregated demand intelligence.
 * No events are persisted or transmitted in the current stage.
 *
 * Design principle:
 * - aggregate by OKED, geography, requested purpose and result class;
 * - do not place IIN/BIN, names, phones or other direct identifiers in this event;
 * - later connect this contract to the marketing agent and policy-demand dashboard.
 */
export interface FundingDemandEvent {
  schemaVersion: 1;
  occurredAt: string;
  okedCode: string;
  regionId?: string;
  districtId?: string;
  purpose?: string;
  amountBand?: 'unknown' | 'lt20m' | '20m_200m' | '200m_1_5b' | '1_5b_7b' | 'gt7b';
  resultClass: 'exact_found' | 'clarification_only' | 'no_concessionary_match';
}

export function buildFundingDemandEvent(
  query: UserQuery,
  resultClass: FundingDemandEvent['resultClass']
): FundingDemandEvent {
  const amount = query.amount_kzt || 0;
  const amountBand: FundingDemandEvent['amountBand'] =
    !amount ? 'unknown' :
    amount < 20_000_000 ? 'lt20m' :
    amount < 200_000_000 ? '20m_200m' :
    amount < 1_500_000_000 ? '200m_1_5b' :
    amount <= 7_000_000_000 ? '1_5b_7b' : 'gt7b';

  return {
    schemaVersion: 1,
    occurredAt: new Date().toISOString(),
    okedCode: (query.oked_code || '').trim().replace(/,/g, '.'),
    regionId: query.region_id || undefined,
    districtId: query.district_id || undefined,
    purpose: query.purpose || undefined,
    amountBand,
    resultClass
  };
}
