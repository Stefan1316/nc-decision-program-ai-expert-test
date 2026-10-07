import { ProgramStatus, UserQuery } from '../types/damu';

export type ExpertDecisionStatus = ProgramStatus;

export interface ExpertSourceRef {
  sourceId: string;
  title: string;
  url: string;
  checkedOn: string;
  authorityLevel: string;
}

export interface ExpertFinancialTerms {
  borrowerRate: string;
  subsidy: string;
  guarantee: string;
  amountMax: string;
  term: string;
  commission: string;
  collateral: string;
}

export interface ExpertProgramDecision {
  institution: string;
  programId: string;
  programName: string;
  family: string;
  instrument: string;
  decisionStatus: ExpertDecisionStatus;
  decisionLabel: string;
  confidence: 'high' | 'medium' | 'low';
  matchedReasons: string[];
  restrictions: string[];
  missingInputs: string[];
  financialTerms: ExpertFinancialTerms;
  geography: string;
  sector: string;
  sources: ExpertSourceRef[];
  checkedAt: string;
}

export interface ExpertProjectContext {
  okedCode: string;
  okedName?: string;
  region?: string;
  district?: string;
  locationLevel: UserQuery['location_level'];
  amountKzt?: number | null;
  purpose?: UserQuery['purpose'];
  entityType?: UserQuery['entity_type'];
  operatingYears?: number | null;
  instrumentPreference?: UserQuery['instrument_preference'];
  taxArrears?: boolean | null;
  overdueDebtDays?: number | null;
}

export interface ExpertReadinessContext {
  analysisPercent: number;
  dossierPercent: number;
  analysisMissing: string[];
  dossierMissing: string[];
  semantics: 'data_completeness_not_approval_probability';
}

export interface ExpertContext {
  schemaVersion: '1.0';
  institutionScope: 'DAMU';
  generatedAt: string;
  project: ExpertProjectContext;
  readiness: ExpertReadinessContext;
  decisions: ExpertProgramDecision[];
  counts: {
    exact: number;
    possible: number;
    clarification: number;
    verification: number;
    notApplicable: number;
  };
  safety: {
    deterministicEngineIsAuthority: true;
    aiMayChangeEligibility: false;
    requireSourceForFactualProgramTerms: true;
    unsupportedFactsMustBeMarkedForVerification: true;
  };
}

export type ExpertIntent =
  | 'explain_summary'
  | 'why_matches'
  | 'why_not'
  | 'what_to_clarify'
  | 'next_steps'
  | 'compare_programs'
  | 'show_sources'
  | 'change_project_parameter';

export interface ExpertParameterChange {
  field:
    | 'oked_code'
    | 'region_name'
    | 'district_name'
    | 'amount_kzt'
    | 'purpose'
    | 'entity_type'
    | 'instrument_preference';
  value: string | number | null;
}

export interface ExpertCommand {
  intent: ExpertIntent;
  programIds?: string[];
  parameterChanges?: ExpertParameterChange[];
  userText: string;
}
