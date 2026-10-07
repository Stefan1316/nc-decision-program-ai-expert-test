import { evaluatePrograms } from '../src/logic/decisionEngine';
import { buildFundingFallback } from '../src/logic/fundingFallback';
import { OKED_MASTER_RECORDS } from '../src/data/okedMaster.generated';
import { ISKER_OFFICIAL_RECORDS } from '../src/data/iskerOfficialRecords';
import { UserQuery } from '../src/types/damu';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let seed = 20261006;
function rnd() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
}
function pick<T>(items: T[]): T {
  return items[Math.floor(rnd() * items.length)];
}

const okeds = OKED_MASTER_RECORDS.filter((r) => r.level === 'class' || r.level === 'subclass');
const territories = ISKER_OFFICIAL_RECORDS;
const amounts = [5_000_000, 50_000_000, 250_000_000, 1_200_000_000, 6_500_000_000, 8_500_000_000];
const purposes: NonNullable<UserQuery['purpose']>[] = ['Инвестиции', 'Оборотные средства', 'Рефинансирование', 'Лизинг'];
const entities: NonNullable<UserQuery['entity_type']>[] = ['ИП', 'ТОО'];

assert(okeds.length > 1000, 'Master OKED must contain >1000 class/subclass records');
assert(territories.length > 1000, 'Official MIO records must be loaded');

const stats = {
  cases: 0,
  fallbackShown: 0,
  guaranteeRouteShown: 0,
  concessionaryFound: 0,
  excludedGf1: 0,
  regions: new Set<string>(),
  okedSections: new Set<string>()
};

for (let i = 0; i < 300; i++) {
  const oked = pick(okeds);
  const territory = pick(territories);
  const overdue = pick([null, null, 0, 0, 5] as Array<number | null>);

  const query: UserQuery = {
    oked_code: oked.code,
    location_name: territory.regionName,
    location_level: 'region',
    location_role: 'project',
    region_id: territory.regionId,
    region_name: territory.regionName,
    district_id: territory.territoryId,
    district_name: territory.territoryName,
    settlement_type: '',
    settlement_type_confirmed: false,
    entity_type: pick(entities),
    business_status: 'действующий',
    operating_years: 3,
    purpose: pick(purposes),
    amount_kzt: pick(amounts),
    instrument_preference: '',
    tax_arrears: false,
    overdue_debt_days: overdue,
    social_enterprise_registry: false,
    domestic_equivalent_available: null
  };

  const summary = evaluatePrograms(query);
  const fallback = buildFundingFallback(summary);
  const buckets = [
    ...summary.exact_matches,
    ...summary.possible_matches,
    ...summary.needs_clarification,
    ...summary.needs_verification,
    ...summary.not_applicable
  ];

  assert(buckets.length === summary.total_checked, `Case ${i}: bucket count mismatch`);
  const ids = buckets.map((r) => r.program.id);
  assert(new Set(ids).size === ids.length, `Case ${i}: a program appeared in multiple buckets`);

  const gf1Exact = summary.exact_matches.some((r) => r.program.id === 'damu.guarantee.guarantee_fund_1');
  assert(!gf1Exact, `Case ${i}: GF1 must not be exact without full regulatory verification`);

  const gf1Eligible = [
    ...summary.possible_matches,
    ...summary.needs_clarification,
    ...summary.needs_verification
  ].some((r) => r.program.id === 'damu.guarantee.guarantee_fund_1');
  const gf1Excluded = summary.not_applicable.some((r) => r.program.id === 'damu.guarantee.guarantee_fund_1');

  if (overdue !== null && overdue > 0) {
    assert(gf1Excluded, `Case ${i}: GF1 must be excluded when current overdue debt exists`);
    assert(!gf1Eligible, `Case ${i}: excluded GF1 leaked into eligible buckets`);
  }

  if (fallback.show) {
    stats.fallbackShown++;
    assert(fallback.market.baseRate.ratePercent === 16.25, `Case ${i}: unexpected NBK base rate snapshot`);
    assert(fallback.market.products.length >= 1, `Case ${i}: market fallback must contain at least one verified product compatible with coarse filters`);
    for (const p of fallback.market.products) {
      assert(/^https:\/\//.test(p.sourceUrl), `Case ${i}: bank product missing official source URL`);
      assert(Boolean(p.nominalRateText), `Case ${i}: bank product missing rate text`);
    }

    const guaranteeRoute = fallback.routes.some((r) => r.id === 'damu_guarantee');
    assert(guaranteeRoute === gf1Eligible, `Case ${i}: fallback guarantee route must follow GF1 engine result`);
    if (guaranteeRoute) stats.guaranteeRouteShown++;
  }

  if (gf1Excluded) stats.excludedGf1++;
  if (summary.exact_matches.some((r) => ['Субсидирование ставки', 'Льготное кредитование'].includes(r.program.instrument_type))) {
    stats.concessionaryFound++;
  }

  stats.regions.add(territory.regionId);
  stats.okedSections.add(oked.sectionCode || '?');
  stats.cases++;
}

// Deterministic regression: national Isker eligibility must not depend on a MIO row.
const territoryWithout2511 = ISKER_OFFICIAL_RECORDS.find((row) => {
  const sameTerritoryRows = ISKER_OFFICIAL_RECORDS.filter(
    (candidate) => candidate.regionId === row.regionId && candidate.territoryId === row.territoryId
  );
  return !sameTerritoryRows.some((candidate) => candidate.okedCode === '25.11');
});
assert(Boolean(territoryWithout2511), 'Need a territory without MIO 25.11 for Isker national-list regression');
if (territoryWithout2511) {
  const nationalQuery: UserQuery = {
    oked_code: '25.11',
    location_name: territoryWithout2511.regionName,
    location_level: 'region',
    location_role: 'project',
    region_id: territoryWithout2511.regionId,
    region_name: territoryWithout2511.regionName,
    district_id: territoryWithout2511.territoryId,
    district_name: territoryWithout2511.territoryName,
    entity_type: 'ТОО',
    operating_years: 3,
    purpose: 'Инвестиции',
    amount_kzt: 100_000_000,
    settlement_type: '',
    settlement_type_confirmed: false,
    instrument_preference: '',
    tax_arrears: false,
    overdue_debt_days: 0,
    social_enterprise_registry: false
  };
  const nationalSummary = evaluatePrograms(nationalQuery);
  const isker = [
    ...nationalSummary.exact_matches,
    ...nationalSummary.possible_matches,
    ...nationalSummary.needs_clarification,
    ...nationalSummary.needs_verification
  ].find((r) => r.program.id === 'damu.subsidy.isker_aymak');
  assert(Boolean(isker), 'Isker national-list OKED 25.11 must remain eligible even without district MIO row');
  assert(
    isker?.matched_reasons.some((reason) => reason.includes('общереспубликанский перечень')),
    'Isker result must explain national-list basis separately from MIO'
  );
  assert((isker?.sources.length || 0) >= 1, 'Isker result must hydrate at least one official source');
}

// Every result should hydrate any resolvable source_ids from the global official source registry.
const sourceProbe = evaluatePrograms({
  oked_code: '25.11',
  location_name: 'Алматинская область',
  location_level: 'region',
  location_role: 'project',
  region_id: 'almaty-region',
  region_name: 'Алматинская область',
  district_name: 'Карасайский район',
  entity_type: 'ТОО',
  operating_years: 3,
  purpose: 'Инвестиции',
  amount_kzt: 100_000_000,
  settlement_type: '',
  settlement_type_confirmed: false,
  instrument_preference: '',
  tax_arrears: false,
  overdue_debt_days: 0,
  social_enterprise_registry: false
});
for (const result of [
  ...sourceProbe.exact_matches,
  ...sourceProbe.possible_matches,
  ...sourceProbe.needs_clarification,
  ...sourceProbe.needs_verification,
  ...sourceProbe.not_applicable
]) {
  if (result.program.source_ids.length > 0) {
    assert(result.sources.length > 0, `Program ${result.program.id} has source_ids but no hydrated source objects`);
  }
}

assert(stats.regions.size >= 15, `Random suite covered too few regions: ${stats.regions.size}`);
assert(stats.okedSections.size >= 15, `Random suite covered too few OKED sections: ${stats.okedSections.size}`);
assert(stats.fallbackShown > 0, 'Random suite did not exercise commercial fallback');
assert(stats.excludedGf1 > 0, 'Random suite did not exercise GF1 exclusion');

console.log(JSON.stringify({
  cases: stats.cases,
  regionsCovered: stats.regions.size,
  okedSectionsCovered: stats.okedSections.size,
  fallbackShown: stats.fallbackShown,
  guaranteeRouteShown: stats.guaranteeRouteShown,
  concessionaryFound: stats.concessionaryFound,
  gf1Excluded: stats.excludedGf1
}, null, 2));
