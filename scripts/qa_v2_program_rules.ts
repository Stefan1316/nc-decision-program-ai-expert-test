import { evaluatePrograms } from '../src/logic/decisionEngine';
import { UserQuery } from '../src/types/damu';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function baseQuery(overrides: Partial<UserQuery>): UserQuery {
  return {
    oked_code: '68.20.4',
    location_name: 'Караганда',
    location_level: 'city',
    location_role: 'project',
    region_id: 'karaganda-region',
    region_name: 'Карагандинская область',
    settlement_type: 'regional_city',
    settlement_type_confirmed: true,
    entity_type: 'ТОО',
    purpose: 'Инвестиции',
    amount_kzt: 300_000_000,
    tax_arrears: false,
    overdue_debt_days: 0,
    is_shopping_entertainment_center: false,
    ...overrides
  };
}

function program(summary: ReturnType<typeof evaluatePrograms>, id: string) {
  const all = [
    ...summary.exact_matches,
    ...summary.possible_matches,
    ...summary.needs_clarification,
    ...summary.needs_verification,
    ...summary.not_applicable
  ];
  const found = all.find((x) => x.program.id === id);
  assert(found, `Program ${id} missing from evaluation`);
  return found;
}

const INNER = 'damu.subsidy.inner_trade';
const ORLEU = 'damu.loan.orleu';
const MFG = 'damu.loan.manufacturing_msb.tranche1';

// 68.20.4: republican cities are excluded.
for (const city of ['Алматы', 'Астана', 'Шымкент']) {
  const result = program(evaluatePrograms(baseQuery({
    location_name: city,
    region_name: city,
    region_id: city.toLowerCase() + '-city',
    settlement_type: 'republican_city',
    settlement_type_confirmed: true
  })), INNER);
  assert(result.status === 'not_applicable', `68.20.4 must be excluded from Inner Trade in ${city}; got ${result.status}`);
}

// 68.20.4: regional city is eligible by OKED/territory when not a shopping mall.
{
  const result = program(evaluatePrograms(baseQuery({
    location_name: 'Караганда',
    settlement_type: 'regional_city',
    amount_kzt: 2_000_000_000,
    is_shopping_entertainment_center: false
  })), INNER);
  assert(result.status === 'exact_match', `68.20.4 regional-city case should be exact after confirmations; got ${result.status}`);
}

// 68.20.4: mono/small/rural cap is 1.5bn.
{
  const result = program(evaluatePrograms(baseQuery({
    location_name: 'Темиртау',
    settlement_type: 'monotown',
    amount_kzt: 2_000_000_000,
    is_shopping_entertainment_center: false
  })), INNER);
  assert(result.status === 'not_applicable', `2bn in mono/small/rural must exceed Inner Trade 1.5bn cap; got ${result.status}`);
}

// 68.20.4: shopping malls are excluded.
{
  const result = program(evaluatePrograms(baseQuery({
    is_shopping_entertainment_center: true
  })), INNER);
  assert(result.status === 'not_applicable', `Shopping mall under 68.20.4 must be excluded; got ${result.status}`);
}

// 68.20.4: unknown mall status must not become exact.
{
  const result = program(evaluatePrograms(baseQuery({
    is_shopping_entertainment_center: null
  })), INNER);
  assert(result.status === 'needs_clarification', `Unknown shopping-mall status must require clarification; got ${result.status}`);
}

// Working capital requires purchases from KZ manufacturers in the Register.
{
  const pending = program(evaluatePrograms(baseQuery({
    purpose: 'Оборотные средства',
    working_capital_kz_manufacturer_registry: null
  })), INNER);
  assert(pending.status === 'needs_clarification', `Working-capital source must require clarification; got ${pending.status}`);

  const rejected = program(evaluatePrograms(baseQuery({
    purpose: 'Оборотные средства',
    working_capital_kz_manufacturer_registry: false
  })), INNER);
  assert(rejected.status === 'not_applicable', `Working capital outside the KZ manufacturer register condition must be rejected; got ${rejected.status}`);
}

// 68.20.8 must NOT leak into Inner Trade, but it is an Orleu priority code.
{
  const summary = evaluatePrograms(baseQuery({
    oked_code: '68.20.8',
    is_shopping_entertainment_center: null
  }));
  assert(program(summary, INNER).status === 'not_applicable', '68.20.8 must not match Inner Trade');
  assert(program(summary, ORLEU).status === 'exact_match', '68.20.8 must match Orleu');
}

// 14.1 is an official Orleu priority and national Isker group.
{
  const summary = evaluatePrograms(baseQuery({ oked_code: '14.1' }));
  assert(program(summary, ORLEU).status === 'exact_match', '14.1 must match Orleu');
  assert(program(summary, 'damu.subsidy.isker_aymak').status === 'exact_match', '14.1 must match national Isker Aymak list');
}

// 62.0 and 55.30 are official Orleu priority codes.
for (const oked of ['62.0', '55.30']) {
  const result = program(evaluatePrograms(baseQuery({ oked_code: oked })), ORLEU);
  assert(result.status === 'exact_match', `${oked} must match Orleu; got ${result.status}`);
}

// 85.1 is not an Orleu priority.
{
  const result = program(evaluatePrograms(baseQuery({ oked_code: '85.1' })), ORLEU);
  assert(result.status === 'not_applicable', `85.1 must not match Orleu; got ${result.status}`);
}

// verification_needed must win over generic missing_inputs.
{
  const result = program(evaluatePrograms(baseQuery({ oked_code: '14.1' })), MFG);
  assert(result.status === 'needs_verification', `Low-quality manufacturing tranche must remain needs_verification; got ${result.status}`);
}

console.log('QA v2 program rules matrix: OK');
