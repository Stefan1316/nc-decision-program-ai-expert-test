import { OKED_MASTER_RECORDS } from './okedMaster.generated';
import { OkedMasterRecord, OkedMasterResolution } from './okedMasterTypes';

const SOURCE = {
  classifier: 'ОКЭД НК РК 03-2019' as const,
  effectiveFrom: '2020-01-01' as const,
  updatedOn: '2026-07-01' as const,
  authority: 'Бюро национальной статистики РК' as const,
  url: 'https://stat.gov.kz/ru/classifiers/statistical/21/' as const
};

const byCode = new Map<string, OkedMasterRecord>(OKED_MASTER_RECORDS.map((row) => [row.code, row]));

export function normalizeMasterOkedCode(input: string): string {
  const clean = (input || '').trim().replace(/,/g, '.').replace(/\s+/g, '').toUpperCase();
  if (/^[A-Z]$/.test(clean)) return clean;
  if (/^\d{2}\.\d{1,3}$/.test(clean) || /^\d{2}$/.test(clean)) return clean;
  if (/^\d{3,5}$/.test(clean)) return clean.length === 2 ? clean : `${clean.slice(0, 2)}.${clean.slice(2)}`;
  return clean;
}

export function resolveOked(input: string): OkedMasterResolution {
  const normalizedCode = normalizeMasterOkedCode(input);
  const record = byCode.get(normalizedCode) || null;
  const parentChain: OkedMasterRecord[] = [];
  let parent = record?.parentCode || null;

  while (parent) {
    const row = byCode.get(parent);
    if (!row) break;
    parentChain.push(row);
    parent = row.parentCode;
  }

  return {
    inputCode: input,
    normalizedCode,
    found: Boolean(record),
    record,
    parentChain,
    source: SOURCE
  };
}

export function searchOkedByText(query: string, limit = 20): OkedMasterRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return OKED_MASTER_RECORDS
    .filter((row) =>
      row.code.toLowerCase().includes(q) ||
      row.nameRu.toLowerCase().includes(q) ||
      row.nameKk.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export function getOkedMasterStats() {
  return {
    records: OKED_MASTER_RECORDS.length,
    sections: OKED_MASTER_RECORDS.filter((r) => r.level === 'section').length,
    subclasses: OKED_MASTER_RECORDS.filter((r) => r.level === 'subclass').length,
    source: SOURCE
  };
}
