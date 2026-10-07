import { UserQuery } from '../types/damu';
import { EvaluationSummary } from './decisionEngine';

export interface ReadinessResult {
  analysis_percent: number;
  dossier_percent: number;
  analysis_missing: string[];
  dossier_missing: string[];
  can_run_preliminary: boolean;
}

function weightedScore(items: Array<{ weight: number; ok: boolean }>): number {
  const total = items.reduce((s, i) => s + i.weight, 0);
  const earned = items.reduce((s, i) => s + (i.ok ? i.weight : 0), 0);
  return total ? Math.round((earned / total) * 100) : 0;
}

export function calculateReadiness(query: UserQuery, summary: EvaluationSummary): ReadinessResult {
  const territoryReady = Boolean(query.region_name || query.location_name);
  const districtRequired = query.location_level === 'region';
  const districtReady = !districtRequired || Boolean(query.district_name);

  const analysisMissing: string[] = [];
  if (!query.oked_code) analysisMissing.push('ОКЭД');
  if (!territoryReady) analysisMissing.push('регион / территория проекта');
  if (!districtReady) analysisMissing.push('район / город внутри области');
  if (!query.amount_kzt) analysisMissing.push('сумма финансирования');
  if (!query.purpose) analysisMissing.push('цель финансирования');
  if (!query.entity_type) analysisMissing.push('форма заявителя');
  if (query.operating_years === null || query.operating_years === undefined) analysisMissing.push('срок деятельности бизнеса');

  const analysisPercent = weightedScore([
    { weight: 30, ok: Boolean(query.oked_code) },
    { weight: 20, ok: territoryReady },
    { weight: 15, ok: districtReady },
    { weight: 10, ok: Boolean(query.amount_kzt) },
    { weight: 10, ok: Boolean(query.purpose) },
    { weight: 5, ok: Boolean(query.entity_type) },
    { weight: 5, ok: query.operating_years !== null && query.operating_years !== undefined },
    { weight: 5, ok: Boolean(query.settlement_type_confirmed || query.settlement_type === 'any') }
  ]);

  const candidates = [
    ...summary.exact_matches,
    ...summary.possible_matches,
    ...summary.needs_clarification,
    ...summary.needs_verification
  ];
  const programMissing = Array.from(new Set(candidates.flatMap(r => r.missing_inputs || []))).filter(Boolean);

  const dossierMissing = [...analysisMissing];
  if (!query.instrument_preference) dossierMissing.push('предпочтительный инструмент финансирования');
  if (query.tax_arrears === null || query.tax_arrears === undefined) dossierMissing.push('наличие / отсутствие налоговой задолженности');
  if (query.overdue_debt_days === null || query.overdue_debt_days === undefined) dossierMissing.push('наличие / срок просроченной задолженности');
  for (const item of programMissing) if (!dossierMissing.includes(item)) dossierMissing.push(item);

  const dossierPercent = weightedScore([
    { weight: 15, ok: Boolean(query.oked_code) },
    { weight: 10, ok: territoryReady },
    { weight: 10, ok: districtReady },
    { weight: 15, ok: Boolean(query.amount_kzt) },
    { weight: 15, ok: Boolean(query.purpose) },
    { weight: 10, ok: Boolean(query.entity_type) },
    { weight: 5, ok: query.operating_years !== null && query.operating_years !== undefined },
    { weight: 5, ok: Boolean(query.instrument_preference) },
    { weight: 5, ok: query.tax_arrears !== null && query.tax_arrears !== undefined },
    { weight: 5, ok: query.overdue_debt_days !== null && query.overdue_debt_days !== undefined },
    { weight: 5, ok: programMissing.length === 0 }
  ]);

  return {
    analysis_percent: analysisPercent,
    dossier_percent: dossierPercent,
    analysis_missing: analysisMissing,
    dossier_missing: dossierMissing,
    can_run_preliminary: Boolean(query.oked_code && territoryReady && districtReady)
  };
}
