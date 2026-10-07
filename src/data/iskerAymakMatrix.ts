import { MioDistrictItem } from './kazakhstanDistricts';
import { buildComprehensiveDistrictOkeds } from './districtFullOkedsDirectory';
import { ISKER_OFFICIAL_RECORDS } from './iskerOfficialRecords';

export interface IskerDistrictRecord {
  districtName: string;
  okeds: {
    code: string;
    name: string;
  }[];
}

export interface IskerRegionRecord {
  regionId: string;
  regionName: string;
  districtsCount: number;
  rowsCount: number;
  uniqueOkedsCount: number;
  districts: IskerDistrictRecord[];
}

/**
 * Полная матрица «Іскер аймақ» — «Приоритетные отрасли МИО».
 * Источник-снимок: Damu, 28.09.2026.
 * 20 регионов, 200 территорий, 1177 исходных строк;
 * 1176 уникальных сочетаний после удаления одного полного дубля.
 */
export const ISKER_AYMAK_MATRIX: Record<string, IskerDistrictRecord[]> = (() => {
  const matrix: Record<string, IskerDistrictRecord[]> = {};

  for (const row of ISKER_OFFICIAL_RECORDS) {
    matrix[row.regionId] ||= [];
    let territory = matrix[row.regionId].find(item => item.districtName === row.territoryName);
    if (!territory) {
      territory = { districtName: row.territoryName, okeds: [] };
      matrix[row.regionId].push(territory);
    }
    territory.okeds.push({ code: row.okedCode, name: row.activityName });
  }

  return matrix;
})();

function classifyTerritory(name: string): 'city' | 'monotown' | 'district' {
  const lower = name.toLowerCase().trim();
  const isCity = lower.startsWith('г.') || lower.startsWith('г ') || lower.startsWith('город ');
  if (!isCity) return 'district';

  const cleanName = lower
    .replace(/^г\.\s*/i, '')
    .replace(/^г\s+/i, '')
    .replace(/^город\s+/i, '')
    .trim();

  const monotowns = new Set([
    'рудный',
    'лисаковск',
    'сарань',
    'балхаш',
    'темиртау',
    'сатпаев',
    'жезказган',
    'экибастуз',
    'риддер',
    'жанатас',
    'степногорск'
  ]);

  return monotowns.has(cleanName) ? 'monotown' : 'city';
}

/**
 * Преобразование официальной матрицы в унифицированные MioDistrictItem.
 */
export function getIskerAymakDistrictsForRegion(regionId: string, regionName: string): MioDistrictItem[] {
  const records = ISKER_AYMAK_MATRIX[regionId] || [];
  const isRepCityRegion = ['astana-city', 'almaty-city', 'shymkent-city'].includes(regionId);

  return records.map((rec, idx) => {
    const districtType = classifyTerritory(rec.districtName);
    const isRepCity = isRepCityRegion;
    const isCity = districtType === 'city';
    const isMonotown = districtType === 'monotown';

    return {
      id: `${regionId}-${idx}`,
      name: rec.districtName,
      nameKk: rec.districtName,
      regionId,
      type: districtType,
      typeLabel: isMonotown ? 'Моногород / Промышленный узел' : isCity ? 'Город' : 'Район',
      center: rec.districtName.replace(/^(г\.|г|город)\s*/i, '').trim(),
      specialization: isRepCity
        ? 'Город республиканского значения. Приоритетность ОКЭД проверяется по официальной матрице МИО и общереспубликанским программам отдельно.'
        : isCity
          ? 'Город областного значения. Приоритетность ОКЭД проверяется по официальной матрице МИО для этой территории.'
          : isMonotown
            ? 'Моногород. Приоритетность ОКЭД и специальные территориальные условия проверяются раздельно.'
            : 'Район. Приоритетность ОКЭД проверяется только по подтверждённым записям официальной матрицы МИО.',
      preferentialRate: 'Уточняется по конкретной программе',
      maxSubsidyText: 'Уточняется по конкретной программе',
      guaranteeText: 'Уточняется по конкретной программе',
      supportedOkeds: buildComprehensiveDistrictOkeds(rec.okeds, districtType, isRepCity)
    };
  });
}
