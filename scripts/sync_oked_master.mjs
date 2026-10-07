import { writeFile } from 'node:fs/promises';

const SOURCE_URL = 'https://stat.gov.kz/upload/iblock/4f6/gli4uh5ur5wjni7ivqeegssfp02ebw04/%D0%9E%D0%9A%D0%AD%D0%94.JSON';
const OUT = 'src/data/okedMaster.generated.ts';

const sectionRanges = [
  ['A',1,3],['B',5,9],['C',10,33],['D',35,35],['E',36,39],['F',41,43],
  ['G',45,47],['H',49,53],['I',55,56],['J',58,63],['K',64,66],['L',68,68],
  ['M',69,75],['N',77,82],['O',84,84],['P',85,85],['Q',86,88],['R',90,93],
  ['S',94,96],['T',97,98],['U',99,99]
];

const displayCode = (raw) => {
  raw = String(raw).trim();
  if (/^[A-Za-z]$/.test(raw)) return raw.toUpperCase();
  if (!/^\d+$/.test(raw) || raw.length <= 2) return raw;
  return raw.slice(0,2) + '.' + raw.slice(2);
};

const levelOf = (raw) => {
  if (/^[A-Za-z]$/.test(raw)) return 'section';
  return ({2:'division',3:'group',4:'class',5:'subclass'})[raw.length] || 'subclass';
};

const sectionFor = (raw) => {
  if (/^[A-Za-z]$/.test(raw)) return raw.toUpperCase();
  if (!/^\d{2,}$/.test(raw)) return null;
  const d = Number(raw.slice(0,2));
  return sectionRanges.find(([,lo,hi]) => d >= lo && d <= hi)?.[0] ?? null;
};

const parentFor = (raw) => {
  if (/^[A-Za-z]$/.test(raw)) return null;
  if (!/^\d+$/.test(raw)) return null;
  if (raw.length === 2) return sectionFor(raw);
  if ([3,4,5].includes(raw.length)) return displayCode(raw.slice(0,-1));
  return null;
};

const response = await fetch(SOURCE_URL, { headers: { 'user-agent': 'NC-Decision-OKED-Sync/1.0' }});
if (!response.ok) throw new Error('Official OKED download failed: ' + response.status);
const payload = await response.json();
const rows = Object.values(payload)[0];

const seen = new Set();
const records = [];
for (const item of rows) {
  const rawCode = String(item.CODE ?? '').trim();
  if (!rawCode || rawCode === '0') continue;
  const code = displayCode(rawCode);
  if (seen.has(code)) continue;
  seen.add(code);
  records.push({
    code,
    rawCode,
    nameRu: String(item.NAME_RU ?? '').trim(),
    nameKk: String(item.NAME_KZ ?? '').trim(),
    level: levelOf(rawCode),
    parentCode: parentFor(rawCode),
    sectionCode: sectionFor(rawCode)
  });
}
records.sort((a,b) => (a.level === 'section' ? 0 : 1) - (b.level === 'section' ? 0 : 1) || a.rawCode.localeCompare(b.rawCode));

if (records.length < 1000) throw new Error('Official OKED dataset is unexpectedly small: ' + records.length);
for (const fixture of ['01.290','03.2','25.11','56.101','62.01']) {
  if (!records.some(r => r.code === fixture)) throw new Error('Missing fixture ' + fixture);
}

const content = `import { OkedMasterRecord } from './okedMasterTypes';\n\n// AUTO-GENERATED from the official Bureau of National Statistics OKED JSON.\n// Do not edit manually; run npm run sync:oked.\nexport const OKED_MASTER_RECORDS: OkedMasterRecord[] = ${JSON.stringify(records)};\n`;
await writeFile(OUT, content, 'utf8');
console.log('OKED master synchronized:', records.length, 'records');
