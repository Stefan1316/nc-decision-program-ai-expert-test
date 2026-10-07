import { resolveOked } from '../data/okedMaster';
import { EvaluationSummary } from '../logic/decisionEngine';
import { calculateReadiness } from '../logic/readiness';
import { ProgramMatchResult } from '../types/damu';
import { ExpertContext, ExpertProgramDecision } from './types';

function mapDecision(result: ProgramMatchResult): ExpertProgramDecision {
  const p = result.program;

  return {
    institution: p.institution_id,
    programId: p.id,
    programName: p.name_ru,
    family: p.family,
    instrument: p.instrument_type,
    decisionStatus: result.status,
    decisionLabel: result.status_label_ru,
    confidence: result.confidence,
    matchedReasons: [...result.matched_reasons],
    restrictions: [...result.restrictions],
    missingInputs: [...result.missing_inputs],
    financialTerms: {
      borrowerRate: p.borrower_rate_text || '',
      subsidy: p.subsidy_text || '',
      guarantee: p.guarantee_text || '',
      amountMax: p.amount_max_text || '',
      term: p.term_text || '',
      commission: p.commission_text || '',
      collateral: p.collateral_text || ''
    },
    geography: p.geography_text || '',
    sector: p.sector_text || '',
    sources: result.sources.map((source) => ({
      sourceId: source.source_id,
      title: source.title_ru,
      url: source.url,
      checkedOn: source.checked_on,
      authorityLevel: source.authority_level
    })),
    checkedAt: p.last_checked
  };
}

export function buildExpertContext(summary: EvaluationSummary, generatedAt = new Date().toISOString()): ExpertContext {
  const query = summary.query;
  const readiness = calculateReadiness(query, summary);
  const oked = resolveOked(query.oked_code);

  const decisions = [
    ...summary.exact_matches,
    ...summary.possible_matches,
    ...summary.needs_clarification,
    ...summary.needs_verification,
    ...summary.not_applicable
  ].map(mapDecision);

  return {
    schemaVersion: '1.0',
    institutionScope: 'DAMU',
    generatedAt,
    project: {
      okedCode: oked.normalizedCode || query.oked_code,
      okedName: oked.record?.nameRu,
      region: query.region_name || query.location_name || undefined,
      district: query.district_name || undefined,
      locationLevel: query.location_level,
      amountKzt: query.amount_kzt,
      purpose: query.purpose,
      entityType: query.entity_type,
      operatingYears: query.operating_years,
      instrumentPreference: query.instrument_preference,
      taxArrears: query.tax_arrears,
      overdueDebtDays: query.overdue_debt_days
    },
    readiness: {
      analysisPercent: readiness.analysis_percent,
      dossierPercent: readiness.dossier_percent,
      analysisMissing: readiness.analysis_missing,
      dossierMissing: readiness.dossier_missing,
      semantics: 'data_completeness_not_approval_probability'
    },
    decisions,
    counts: {
      exact: summary.exact_matches.length,
      possible: summary.possible_matches.length,
      clarification: summary.needs_clarification.length,
      verification: summary.needs_verification.length,
      notApplicable: summary.not_applicable.length
    },
    safety: {
      deterministicEngineIsAuthority: true,
      aiMayChangeEligibility: false,
      requireSourceForFactualProgramTerms: true,
      unsupportedFactsMustBeMarkedForVerification: true
    }
  };
}
