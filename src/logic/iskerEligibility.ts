import { ISKER_AYMAK_MATRIX } from '../data/iskerAymakMatrix';
import { normalizeOkedCode, okedHierarchyMatches } from './okedMatcher';

export interface IskerEligibilityResult {
  matched: boolean;
  districtFound: boolean;
  matchedCode?: string;
  matchedName?: string;
  matchingDistricts?: string[];
  classificationNeedsVerification?: boolean;
  candidateCode?: string;
  candidateName?: string;
  reason: string;
}

function normalizeTerritoryName(value: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/^(г\.|город)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkIskerDistrictEligibility(
  regionId: string,
  districtName: string | undefined,
  okedCode: string
): IskerEligibilityResult {
  const records = ISKER_AYMAK_MATRIX[regionId] || [];
  const cleanOked = normalizeOkedCode(okedCode);

  if (!regionId || records.length === 0) {
    return {
      matched: false,
      districtFound: false,
      reason: 'Для выбранного региона не найдена районная матрица «Іскер аймақ».'
    };
  }

  if (!cleanOked) {
    return {
      matched: false,
      districtFound: Boolean(districtName),
      reason: 'Для проверки матрицы «Іскер аймақ» требуется код ОКЭД.'
    };
  }

  if (!districtName) {
    const exactDistricts = records
      .filter(r => r.okeds.some(o => normalizeOkedCode(o.code) === cleanOked))
      .map(r => r.districtName);

    const hierarchyDistricts = records
      .filter(r => r.okeds.some(o =>
        normalizeOkedCode(o.code) !== cleanOked &&
        okedHierarchyMatches(cleanOked, o.code)
      ))
      .map(r => r.districtName);

    if (exactDistricts.length > 0) {
      return {
        matched: true,
        districtFound: false,
        matchingDistricts: exactDistricts,
        reason: `ОКЭД ${cleanOked} имеет точные записи в матрице «Іскер аймақ» выбранного региона. Для точного заключения требуется выбрать конкретный город/район.`
      };
    }

    if (hierarchyDistricts.length > 0) {
      return {
        matched: false,
        districtFound: false,
        matchingDistricts: hierarchyDistricts,
        classificationNeedsVerification: true,
        reason: `В матрице «Іскер аймақ» найден связанный код другого уровня классификатора для ОКЭД ${cleanOked}. Автоматически считать это точным региональным приоритетом нельзя; требуется верификация классификационной связи и конкретной территории.`
      };
    }

    return {
      matched: false,
      districtFound: false,
      matchingDistricts: [],
      reason: `ОКЭД ${cleanOked} не найден в районной матрице «Іскер аймақ» выбранного региона.`
    };
  }

  const target = normalizeTerritoryName(districtName);
  const district = records.find(r => {
    const candidate = normalizeTerritoryName(r.districtName);
    return candidate === target || candidate.includes(target) || target.includes(candidate);
  });

  if (!district) {
    return {
      matched: false,
      districtFound: false,
      reason: `Территория «${districtName}» не найдена в матрице «Іскер аймақ» региона.`
    };
  }

  const exactOked = district.okeds.find(o => normalizeOkedCode(o.code) === cleanOked);
  if (exactOked) {
    return {
      matched: true,
      districtFound: true,
      matchedCode: exactOked.code,
      matchedName: exactOked.name,
      reason: `ОКЭД ${cleanOked} имеет точную запись ${exactOked.code} «${exactOked.name}» в матрице «Іскер аймақ» для территории «${district.districtName}».`
    };
  }

  const hierarchyCandidate = district.okeds.find(o => okedHierarchyMatches(cleanOked, o.code));
  if (hierarchyCandidate) {
    return {
      matched: false,
      districtFound: true,
      classificationNeedsVerification: true,
      candidateCode: hierarchyCandidate.code,
      candidateName: hierarchyCandidate.name,
      reason: `Для территории «${district.districtName}» в матрице есть код ${hierarchyCandidate.code} «${hierarchyCandidate.name}», связанный с ОКЭД ${cleanOked} на другом уровне классификатора. По правилам матрицы это нельзя автоматически считать точным совпадением; требуется подтверждение классификационной связи.`
    };
  }

  return {
    matched: false,
    districtFound: true,
    reason: `ОКЭД ${cleanOked} не входит в приоритетный перечень «Іскер аймақ» для территории «${district.districtName}».`
  };
}
