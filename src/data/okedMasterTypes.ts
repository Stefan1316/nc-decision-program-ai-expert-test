export type OkedLevel = 'section' | 'division' | 'group' | 'class' | 'subclass';

export interface OkedMasterRecord {
  code: string;
  rawCode: string;
  nameRu: string;
  nameKk: string;
  level: OkedLevel;
  parentCode: string | null;
  sectionCode: string | null;
}

export interface OkedMasterResolution {
  inputCode: string;
  normalizedCode: string;
  found: boolean;
  record: OkedMasterRecord | null;
  parentChain: OkedMasterRecord[];
  source: {
    classifier: 'ОКЭД НК РК 03-2019';
    effectiveFrom: '2020-01-01';
    updatedOn: '2026-07-01';
    authority: 'Бюро национальной статистики РК';
    url: 'https://stat.gov.kz/ru/classifiers/statistical/21/';
  };
}
