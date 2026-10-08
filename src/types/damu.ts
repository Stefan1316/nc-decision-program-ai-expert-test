export type TerritoryLevel = 'city' | 'region' | 'district';
export type TerritoryRole = 'registration' | 'project' | 'both' | 'unknown';

export type ProgramStatus = 
  | 'exact_match' 
  | 'possible_match' 
  | 'needs_clarification' 
  | 'needs_verification' 
  | 'not_applicable';

export interface DamuSource {
  source_id: string;
  institution_id: string;
  program_id: string;
  source_type: string;
  title_ru: string;
  url: string;
  format: string;
  language: string;
  source_date?: string;
  checked_on: string;
  availability: string;
  authority_level: string;
  locator?: string;
  notes?: string;
}

export interface DamuCondition {
  condition_id: string;
  program_id: string;
  category: string;
  field_name: string;
  operator: string;
  value_text: string;
  value_number: number | null;
  value_min?: number | null;
  value_max?: number | null;
  unit: string;
  currency: string;
  applies_to: string;
  source_id: string;
  source_locator?: string;
  effective_date?: string;
  confidence: string;
  notes?: string;
}

export interface DamuEligibility {
  eligibility_id: string;
  program_id: string;
  rule_type: 'include' | 'exclude';
  subject_type: string;
  sector_or_oked: string;
  geography: string;
  criteria_text: string;
  source_id: string;
  confidence: string;
  notes?: string;
}

export interface DamuProcessStep {
  process_id: string;
  program_id: string;
  step_no: number;
  actor: string;
  action: string;
  sla_text: string;
  source_id: string;
  notes?: string;
}

export interface DamuProgram {
  id: string;
  institution_id: string;
  family: string;
  instrument_type: string;
  status: 'active_public' | 'listed_current' | 'needs_verification';
  details_page_status: 'accessible' | 'parent_only' | 'login_required' | 'element_not_found';
  name_ru: string;
  target_segment: string;
  purpose_short: string;
  amount_max_kzt: number | null;
  amount_max_text: string;
  borrower_rate_text: string;
  subsidy_text: string;
  guarantee_text: string;
  term_text: string;
  grace_period_text: string;
  commission_text: string;
  collateral_text: string;
  geography_text: string;
  sector_text: string;
  source_ids: string[];
  data_quality: 'high' | 'medium' | 'low';
  last_checked: string;
  notes: string;
  conditions: DamuCondition[];
  eligibility: DamuEligibility[];
  process: DamuProcessStep[];
  sources: DamuSource[];
}

export interface UserQuery {
  oked_code: string;
  additional_oked?: string;
  location_name: string;
  location_level: TerritoryLevel;
  location_role: TerritoryRole;
  region_id?: string;
  region_name?: string;
  district_id?: string;
  district_name?: string;
  settlement_type?: 'republican_city' | 'regional_city' | 'monotown' | 'village' | 'any' | '';
  settlement_type_confirmed?: boolean;
  
  // Step 2 Clarification fields
  entity_type?: 'ИП' | 'ТОО' | 'Сельхозкооператив' | 'Юрлицо МФЦА' | 'Любое' | '';
  business_status?: 'новый' | 'действующий' | '';
  operating_years?: number | null;
  purpose?: 'Инвестиции' | 'Оборотные средства' | 'Рефинансирование' | 'Лизинг' | '';
  amount_kzt?: number | null;
  instrument_preference?: 'Субсидирование' | 'Гарантирование' | 'Льготное кредитование' | 'Лизинг' | '';
  tax_arrears?: boolean | null;
  overdue_debt_days?: number | null;
  social_enterprise_registry?: boolean | null;
  own_funds_percent?: number | null;
  domestic_equivalent_available?: boolean | null;
  is_shopping_entertainment_center?: boolean | null;
  working_capital_kz_manufacturer_registry?: boolean | null;
  refinancing_date?: string;
}

export interface ProgramMatchResult {
  program: DamuProgram;
  status: ProgramStatus;
  status_label_ru: string;
  matched_reasons: string[];
  restrictions: string[];
  missing_inputs: string[];
  confidence: 'high' | 'medium' | 'low';
  sources: DamuSource[];
}
