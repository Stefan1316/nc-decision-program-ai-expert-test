import { buildExpertContext } from '../src/aiExpert/buildExpertContext';
import { evaluatePrograms } from '../src/logic/decisionEngine';
import { UserQuery } from '../src/types/damu';
import { composeExpertAnswer, findMentionedProgram, detectExpertIntent } from '../src/aiExpert/composeExpertAnswer';
import { parseProjectCommand } from '../src/aiExpert/parseProjectCommand';
import { compareExpertContexts } from '../src/aiExpert/compareExpertContexts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const query: UserQuery = {
  oked_code: '25.11',
  location_name: 'Алматинская область',
  location_level: 'region',
  location_role: 'project',
  region_id: 'almaty-region',
  region_name: 'Алматинская область',
  district_name: 'Карасайский район',
  settlement_type: '',
  settlement_type_confirmed: false,
  entity_type: 'ТОО',
  business_status: 'действующий',
  operating_years: 3,
  purpose: 'Инвестиции',
  amount_kzt: 100_000_000,
  instrument_preference: '',
  tax_arrears: false,
  overdue_debt_days: 0,
  social_enterprise_registry: false
};

const summary = evaluatePrograms(query);
const context = buildExpertContext(summary, '2026-10-07T00:00:00.000Z');

assert(context.schemaVersion === '1.0', 'Unexpected expert context schema version');
assert(context.institutionScope === 'DAMU', 'Expert v1 must be scoped to DAMU');
assert(context.project.okedCode === '25.11', 'Normalized project OKED missing');
assert(context.project.region === 'Алматинская область', 'Project region missing');
assert(context.project.district === 'Карасайский район', 'Project district missing');
assert(context.readiness.semantics === 'data_completeness_not_approval_probability', 'Readiness semantics must be explicit');
assert(context.safety.deterministicEngineIsAuthority === true, 'Decision engine authority guardrail missing');
assert(context.safety.aiMayChangeEligibility === false, 'AI must not be allowed to change eligibility');
assert(context.decisions.length === summary.total_checked, 'Expert context must preserve every checked program');

const ids = context.decisions.map((decision) => decision.programId);
assert(new Set(ids).size === ids.length, 'Expert context contains duplicate program decisions');

const exactStatuses = context.decisions.filter((d) => d.decisionStatus === 'exact_match').length;
const notApplicableStatuses = context.decisions.filter((d) => d.decisionStatus === 'not_applicable').length;
assert(exactStatuses === context.counts.exact, 'Exact-match count drifted between engine and expert context');
assert(notApplicableStatuses === context.counts.notApplicable, 'Not-applicable count drifted between engine and expert context');

for (const decision of context.decisions) {
  assert(Boolean(decision.programId), 'Decision missing programId');
  assert(Boolean(decision.programName), `Decision ${decision.programId} missing programName`);
  assert(Boolean(decision.decisionStatus), `Decision ${decision.programId} missing decisionStatus`);

  if (
    decision.financialTerms.borrowerRate ||
    decision.financialTerms.subsidy ||
    decision.financialTerms.guarantee ||
    decision.financialTerms.amountMax
  ) {
    assert(decision.sources.length > 0, `Decision ${decision.programId} exposes financial terms without hydrated official source`);
  }
}

const isker = context.decisions.find((d) => d.programId === 'damu.subsidy.isker_aymak');
assert(Boolean(isker), 'Isker decision missing from expert context');
assert((isker?.sources.length || 0) > 0, 'Isker decision must carry official sources');
assert(
  isker?.matchedReasons.some((reason) => reason.includes('общереспубликанский перечень')),
  'Isker expert context must preserve national-list reasoning'
);

console.log(JSON.stringify({
  schemaVersion: context.schemaVersion,
  decisions: context.decisions.length,
  counts: context.counts,
  readiness: {
    analysisPercent: context.readiness.analysisPercent,
    dossierPercent: context.readiness.dossierPercent
  },
  iskerSources: isker?.sources.map((s) => s.sourceId) || []
}, null, 2));


// AI Expert v1.1 regressions
const orleu = context.decisions.find((d) => /orleu|орлеу|өрлеу/i.test(d.programId + ' ' + d.programName));
if (orleu) {
  const resolved = findMentionedProgram(context, 'Почему мне подходит Өрлеу?');
  assert(resolved?.programId === orleu.programId, 'AI Expert must resolve named program Өрлеу');
  const targeted = composeExpertAnswer(context, 'Почему мне подходит Өрлеу?');
  assert(targeted.title.includes(orleu.programName), 'Targeted answer must name concrete program');
}

const whyMatches = composeExpertAnswer(context, 'Почему эти программы подходят?');
for (const pending of context.decisions.filter((d) => d.decisionStatus === 'needs_clarification' || d.decisionStatus === 'needs_verification')) {
  const line = whyMatches.body.find((x) => x.startsWith(pending.programName + ':'));
  if (line) assert(/пока не подтверждена|нужны дополнительные данные|требуется верификация/i.test(line), 'Pending result must not be described as confirmed');
}

const clarify = composeExpertAnswer(context, 'Что нужно уточнить?');
const businessCategoryLines = clarify.body.filter((x) => /категори.*бизнес|микро|малый|средний|крупный/i.test(x));
assert(businessCategoryLines.length <= 1, 'Repeated business-category clarifications must be aggregated');

console.log('AI Expert v1.1 regressions: OK');


// AI Expert v2 command regressions
const okedCommand = parseProjectCommand('Проверь другой ОКЭД — 45.20');
assert(okedCommand.recognized, 'V2 must recognize OKED change command');
assert(okedCommand.changes.some((c) => c.field === 'oked_code' && c.value === '45.20'), 'V2 must parse OKED 45.20');
assert(detectExpertIntent('Проверь другой ОКЭД — 45.20') === 'change_project_parameter', 'V2 must classify OKED command as project change');

const amountCommand = parseProjectCommand('Измени сумму финансирования на 300 млн тенге');
assert(amountCommand.changes.some((c) => c.field === 'amount_kzt' && c.value === 300_000_000), 'V2 must parse 300m KZT amount');

const purposeCommand = parseProjectCommand('Поставь цель финансирования оборотные средства');
assert(purposeCommand.changes.some((c) => c.field === 'purpose' && c.value === 'Оборотные средства'), 'V2 must parse financing purpose');

const changedSummary = evaluatePrograms({ ...query, oked_code: '45.20' });
const changedContext = buildExpertContext(changedSummary, '2026-10-07T00:01:00.000Z');
const contextDiff = compareExpertContexts(context, changedContext);
assert(contextDiff.lines.some((line) => line.includes('ОКЭД: 25.11 → 45.20')), 'V2 context diff must report OKED change');
assert(contextDiff.lines.some((line) => line.includes('Итог после пересчёта')), 'V2 context diff must report recalculation totals');

console.log('AI Expert v2 command regressions: OK');
