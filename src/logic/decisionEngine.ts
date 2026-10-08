import { damuKnowledgeBase } from '../data/damuDatabase';
import { DamuProgram, ProgramMatchResult, ProgramStatus, UserQuery } from '../types/damu';
import { checkOrleuEligibility } from '../data/orleuPriorityOkeds';
import { checkIskerDistrictEligibility } from './iskerEligibility';
import { checkIskerNationalEligibility } from './iskerNationalEligibility';

export interface EvaluationSummary {
  query: UserQuery;
  total_checked: number;
  exact_matches: ProgramMatchResult[];
  possible_matches: ProgramMatchResult[];
  needs_clarification: ProgramMatchResult[];
  needs_verification: ProgramMatchResult[];
  not_applicable: ProgramMatchResult[];
  is_broad_oked: boolean;
  broad_oked_warning?: string;
  identified_clarifications: string[];
}

export const REPUBLICAN_CITIES = ['алматы', 'астана', 'шымкент'];

export function normalizeOked(code: string): { cleanCode: string; isBroad: boolean; warning?: string } {
  const trimmed = code.trim().replace(/,/g, '.').replace(/\s+/g, '');
  if (!trimmed) {
    return { cleanCode: '', isBroad: true, warning: 'Код ОКЭД не указан' };
  }
  
  // Single letter section like 'C', 'A', 'G'
  if (/^[A-Za-zА-Яа-я]$/i.test(trimmed)) {
    return {
      cleanCode: trimmed.toUpperCase(),
      isBroad: true,
      warning: `Указан только буквенный раздел («${trimmed.toUpperCase()}»). Для точного подбора программ Фонда Damu требуется указать 4- или 5-значный код ОКЭД.`
    };
  }

  // Pure 2-digit class like '10' or '46'
  if (/^\d{2}$/.test(trimmed)) {
    return {
      cleanCode: trimmed,
      isBroad: true,
      warning: `Указан 2-значный раздел («${trimmed}»). Результат носит предварительный характер; отдельные программы требуют детальный подкласс (например, 10.51 или 46.73).`
    };
  }

  return { cleanCode: trimmed, isBroad: false };
}

export function isRepublicanCity(locationName: string, level?: string): boolean {
  if (!locationName) return false;
  const lower = locationName.toLowerCase().trim();
  
  // Исключаем Алматинскую область (это область, не город республиканского значения)
  if (lower.includes('алматинская') || lower.includes('алматы облысы') || lower === 'almaty-region') {
    return false;
  }
  
  // Проверяем прямое указание на города республиканского значения
  if (
    lower.includes('астана') ||
    lower.includes('astana') ||
    lower.includes('шымкент') ||
    lower.includes('shymkent') ||
    lower === 'almaty-city' ||
    lower === 'astana-city' ||
    lower === 'shymkent-city' ||
    (lower.includes('алматы') && (level === 'city' || lower.includes('г.') || lower.includes('город') || lower.includes('қ.') || lower.includes('city') || lower === 'алматы'))
  ) {
    return true;
  }

  return false;
}

export function evaluatePrograms(query: UserQuery): EvaluationSummary {
  const { cleanCode, isBroad, warning } = normalizeOked(query.oked_code);
  const geographyName = query.region_name || query.location_name;
  const geographyLevel = query.location_level === 'district' ? 'region' : query.location_level;
  const isRepCity = isRepublicanCity(geographyName, geographyLevel);
  
  const exact_matches: ProgramMatchResult[] = [];
  const possible_matches: ProgramMatchResult[] = [];
  const needs_clarification: ProgramMatchResult[] = [];
  const needs_verification: ProgramMatchResult[] = [];
  const not_applicable: ProgramMatchResult[] = [];
  const clarificationSet = new Set<string>();

  for (const prog of damuKnowledgeBase.programs) {
    const matched_reasons: string[] = [];
    const restrictions: string[] = [];
    const missing_inputs: string[] = [];
    let okedMatchLevel: string = 'compatible';

    // 1. Geography evaluation
    if (prog.id === 'damu.subsidy.isker_aymak') {
      matched_reasons.push(`Территория проекта: ${query.location_name || query.region_name || 'не указана'}. Отраслевое соответствие «Іскер аймақ» проверяется отдельно по общереспубликанскому перечню и дополнительным приоритетам МИО.`);
    }

    // 2. Settlement type evaluation
    if (prog.id === 'damu.loan.micro_regional') {
      if (query.settlement_type === 'village' || query.settlement_type === 'monotown') {
        matched_reasons.push(`Тип населенного пункта (${query.settlement_type === 'village' ? 'Село' : 'Моногород'}) получает максимальный приоритет и льготные условия.`);
      }
    }

    // 3. OKED evaluation
    // Special program: Inner Trade subsidy (Субсидирование внутренней торговли)
    if (prog.id === 'damu.subsidy.inner_trade' || prog.id === 'damu.subsidy.retail_trade') {
      const isRetailRealEstateOked = ['68.20.3', '68.20.4', '68.20.5'].some(
        (code) => cleanCode === code || cleanCode.startsWith(code + '.')
      );
      const isRegionalCityTradeOked =
        cleanCode === '46.90.3' || cleanCode.startsWith('46.90.3.') ||
        cleanCode === '47.11' || cleanCode.startsWith('47.11.') ||
        cleanCode === '47.19' || cleanCode.startsWith('47.19.') ||
        cleanCode === '47.91.0' || cleanCode.startsWith('47.91.0.') ||
        isRetailRealEstateOked;
      const isSmallTownTradeOked =
        cleanCode.startsWith('46') || cleanCode.startsWith('47') || isRetailRealEstateOked;

      if (isRepCity) {
        okedMatchLevel = 'excluded';
        restrictions.push('Поддержка субъектов внутренней торговли не предоставляется по проектам, реализуемым в столице и городах республиканского значения (Астана, Алматы, Шымкент).');
      } else {
        const settlementConfirmed = query.settlement_type_confirmed === true;
        const settlementType = query.settlement_type || '';
        const isRegionalCity = settlementConfirmed && settlementType === 'regional_city';
        const isSmallTownOrRural = settlementConfirmed && (settlementType === 'monotown' || settlementType === 'village');

        if (!settlementConfirmed) {
          okedMatchLevel = 'verification_needed';
          missing_inputs.push('Подтвердить тип территории: город областного значения либо моно-/малый город/сельский населённый пункт');
          clarificationSet.add('location');
        } else if (isRegionalCity && !isRegionalCityTradeOked) {
          okedMatchLevel = 'excluded';
          restrictions.push(`ОКЭД ${cleanCode} не входит в перечень внутренней торговли для городов областного значения.`);
        } else if (isSmallTownOrRural && !isSmallTownTradeOked) {
          okedMatchLevel = 'excluded';
          restrictions.push(`ОКЭД ${cleanCode} не входит в перечень внутренней торговли для моно-/малых городов и сельских населённых пунктов.`);
        } else if (!isRegionalCity && !isSmallTownOrRural) {
          okedMatchLevel = 'verification_needed';
          missing_inputs.push('Выбранный тип территории требует проверки по условиям поддержки внутренней торговли');
          clarificationSet.add('location');
        } else {
          okedMatchLevel = 'exact';
          matched_reasons.push(`ОКЭД ${cleanCode} входит в перечень внутренней торговли для выбранного типа территории.`);

          const territoryLimit = isRegionalCity ? 3_000_000_000 : 1_500_000_000;
          if (query.amount_kzt && query.amount_kzt > territoryLimit) {
            restrictions.push(`Запрашиваемая сумма превышает территориальный лимит программы: ${isRegionalCity ? '3 млрд тг для города областного значения' : '1,5 млрд тг для моно-/малого города или сельского населённого пункта'}.`);
          }

          if ((cleanCode === '68.20.4' || cleanCode.startsWith('68.20.4.') || cleanCode === '68.20.5' || cleanCode.startsWith('68.20.5.'))) {
            if (query.is_shopping_entertainment_center === true) {
              restrictions.push('Торгово-развлекательные центры прямо исключены из поддержки субъектов внутренней торговли.');
            } else if (query.is_shopping_entertainment_center !== false) {
              missing_inputs.push('Подтвердить, что объект не является торгово-развлекательным центром (ТРЦ)');
              clarificationSet.add('trade_object');
            }
          }

          if (query.purpose === 'Оборотные средства') {
            if (query.working_capital_kz_manufacturer_registry === false) {
              restrictions.push('Для пополнения оборотных средств закупка должна осуществляться у казахстанских производителей, включённых в Реестр казахстанских товаропроизводителей.');
            } else if (query.working_capital_kz_manufacturer_registry !== true) {
              missing_inputs.push('Подтвердить закупку товаров, сырья и материалов у казахстанских производителей из соответствующего Реестра');
              clarificationSet.add('working_capital_source');
            }
          }
        }
      }
    } 
    
    // Isker Aymak: two independent eligibility dimensions.
    // 1) nationwide program OKED list; 2) additional exact regional priorities of MIO.
    else if (prog.id === 'damu.subsidy.isker_aymak') {
      const nationalCheck = checkIskerNationalEligibility(cleanCode);

      if (nationalCheck.excluded) {
        okedMatchLevel = 'excluded';
        restrictions.push(nationalCheck.reason);
      } else if (nationalCheck.matched) {
        okedMatchLevel = 'exact';
        matched_reasons.push(nationalCheck.reason);
        matched_reasons.push('Соответствие подтверждено по общереспубликанскому перечню программы; наличие отдельной записи в районной матрице МИО для этого основания не требуется.');
      } else if (query.region_id) {
        const mioCheck = checkIskerDistrictEligibility(
          query.region_id,
          query.district_name,
          cleanCode
        );

        if (query.district_name) {
          if (!mioCheck.districtFound) {
            okedMatchLevel = 'verification_needed';
            missing_inputs.push('Проверка выбранного города/района по официальной матрице МИО');
            matched_reasons.push(mioCheck.reason);
          } else if (mioCheck.matched) {
            okedMatchLevel = 'exact';
            matched_reasons.push('Общереспубликанский перечень не дал совпадения, но найден дополнительный региональный приоритет МИО.');
            matched_reasons.push(mioCheck.reason);
          } else if (mioCheck.classificationNeedsVerification) {
            okedMatchLevel = 'verification_needed';
            matched_reasons.push(mioCheck.reason);
            missing_inputs.push('Подтвердить классификационную связь детального ОКЭД с кодом, указанным в официальной матрице МИО');
            clarificationSet.add('oked');
          } else {
            okedMatchLevel = 'excluded';
            restrictions.push(nationalCheck.reason);
            restrictions.push(mioCheck.reason);
          }
        } else {
          if (mioCheck.matched) {
            okedMatchLevel = 'compatible';
            matched_reasons.push('Общереспубликанский перечень не дал совпадения; в выбранном регионе есть точные дополнительные приоритеты МИО.');
            matched_reasons.push(mioCheck.reason);
            missing_inputs.push('Конкретный город/район для точной проверки дополнительного приоритета МИО');
            clarificationSet.add('location');
          } else if (mioCheck.classificationNeedsVerification) {
            okedMatchLevel = 'verification_needed';
            matched_reasons.push(mioCheck.reason);
            missing_inputs.push('Конкретный город/район и подтверждение классификационной связи ОКЭД');
            clarificationSet.add('location');
            clarificationSet.add('oked');
          } else {
            okedMatchLevel = 'excluded';
            restrictions.push(nationalCheck.reason);
            restrictions.push(mioCheck.reason);
          }
        }
      } else {
        okedMatchLevel = 'verification_needed';
        matched_reasons.push(nationalCheck.reason);
        missing_inputs.push('Регион и конкретный город/район для проверки дополнительных приоритетов МИО');
        clarificationSet.add('location');
      }
    }

    // Agro subsidy
    else if (prog.id === 'damu.subsidy.agro_processing') {
      const isAgro = cleanCode.startsWith('10') || cleanCode.startsWith('01') || cleanCode.startsWith('11.06') || cleanCode.startsWith('11.07');
      if (isAgro) {
        okedMatchLevel = 'exact';
        matched_reasons.push(`ОКЭД ${cleanCode} относится к агропромышленному комплексу и переработке сельхозпродукции.`);
      } else {
        okedMatchLevel = 'compatible';
        matched_reasons.push(`Программа ориентирована на АПК. Требуется подтверждение связи проекта с сельхозпроизводством.`);
        missing_inputs.push('Подтверждение принадлежности проекта к субъектам АПК');
        clarificationSet.add('purpose');
      }
    }

    // Orleu Loan: Проверка по официальному Перечню приоритетных видов экономической деятельности программы «Өрлеу»
    else if (prog.id === 'damu.loan.orleu') {
      const orleuCheck = checkOrleuEligibility(cleanCode);

      if (orleuCheck.isExcluded) {
        okedMatchLevel = 'excluded';
        restrictions.push(orleuCheck.exclusionReason || `ОКЭД ${cleanCode} исключен из программы «Өрлеу».`);
      } else if (orleuCheck.matched) {
        okedMatchLevel = 'exact';
        matched_reasons.push(orleuCheck.reason || `ОКЭД ${cleanCode} входит в утвержденный перечень приоритетных отраслей программы «Өрлеу».`);
      } else {
        const okedNum = parseInt(cleanCode.slice(0, 2), 10);
        const isMfg = !isNaN(okedNum) && okedNum >= 10 && okedNum <= 33;
        if (isMfg) {
          okedMatchLevel = 'compatible';
          matched_reasons.push(`ОКЭД ${cleanCode} относится к обрабатывающей промышленности (раздел ${okedNum}). Требуется подтверждение соответствия детальному перечню программы «Өрлеу».`);
        } else {
          okedMatchLevel = 'excluded';
          restrictions.push(`ОКЭД ${cleanCode} не входит в утвержденный перечень приоритетных направлений «Өрлеу» (обрабатывающая промышленность, транспорт и логистика).`);
        }
      }
    }

    // Orleu Leasing: Секция C (ОКЭД 10-33) + транспорт и спецтехника программы «Өрлеу»
    else if (prog.id === 'damu.leasing.orleu') {
      const orleuCheck = checkOrleuEligibility(cleanCode);

      if (orleuCheck.isExcluded) {
        okedMatchLevel = 'excluded';
        restrictions.push(orleuCheck.exclusionReason || `ОКЭД ${cleanCode} исключен из программы «Өрлеу-Лизинг».`);
      } else if (orleuCheck.matched) {
        okedMatchLevel = 'exact';
        matched_reasons.push(orleuCheck.reason || `ОКЭД ${cleanCode} входит в перечень приоритетных видов деятельности «Өрлеу-Лизинг».`);
      } else {
        const isAlcohol = ['11.01', '11.02', '11.03', '11.04', '11.05'].some(ex => cleanCode.startsWith(ex));
        const isTobacco = cleanCode.startsWith('12');
        const isWeapons = cleanCode.startsWith('25.4');

        if (isAlcohol || isTobacco || isWeapons) {
          okedMatchLevel = 'excluded';
          restrictions.push(`Производство подакцизной продукции или оружия (${cleanCode}) прямо исключено из программы «Өрлеу-Лизинг».`);
        } else {
          const okedNum = parseInt(cleanCode.slice(0, 2), 10);
          if (!isNaN(okedNum) && okedNum >= 10 && okedNum <= 33) {
            okedMatchLevel = 'compatible';
            matched_reasons.push(`ОКЭД ${cleanCode} относится к Секции C «Обрабатывающая промышленность».`);
          } else {
            okedMatchLevel = 'excluded';
            restrictions.push(`Программа «Өрлеу-Лизинг» поддерживает исключительно обрабатывающую промышленность и транспортную инфраструктуру.`);
          }
        }
      }
    }

    // Guarantee Fund 1: regulatory eligibility must be confirmed independently from OKED.
    // Official parameters: financing <= 7bn KZT; guarantee <= 85% and <= 3.5bn KZT;
    // purposes: investment / working capital / refinancing; fee 1.5% of guarantee,
    // paid initially and annually on the outstanding guarantee balance.
    else if (prog.id === 'damu.guarantee.guarantee_fund_1') {
      const prohibitedExcise =
        cleanCode.startsWith('12') ||
        ['11.01', '11.02', '11.03', '11.04', '11.05'].some(ex => cleanCode.startsWith(ex));
      const miningWithoutProcessing = ['05', '06', '07', '08', '09'].some(prefix => cleanCode.startsWith(prefix));

      if (prohibitedExcise) {
        okedMatchLevel = 'excluded';
        restrictions.push(`ОКЭД ${cleanCode} относится к подакцизной деятельности, указанной в исключениях Гарантийного фонда 1.`);
      } else if (query.overdue_debt_days !== null && query.overdue_debt_days !== undefined && query.overdue_debt_days > 0) {
        okedMatchLevel = 'excluded';
        restrictions.push('По официальным требованиям гарантии у предпринимателя не должно быть текущей просроченной задолженности перед кредитором.');
      } else {
        okedMatchLevel = miningWithoutProcessing ? 'verification_needed' : 'compatible';

        if (miningWithoutProcessing) {
          matched_reasons.push('Добывающий проект может рассматриваться только при подтверждении дальнейшей переработки извлечённых/добытых материалов.');
          missing_inputs.push('Подтверждение дальнейшей переработки добываемого сырья');
        } else {
          matched_reasons.push('По виду деятельности явное отраслевое исключение Гарантийного фонда 1 не выявлено; окончательная применимость определяется всеми условиями Правил гарантирования.');
        }

        if (!query.amount_kzt) {
          missing_inputs.push('Сумма финансирования для проверки лимита Гарантийного фонда 1 (не более 7 млрд тг)');
          clarificationSet.add('amount');
        } else if (query.amount_kzt > 7000000000) {
          okedMatchLevel = 'excluded';
          restrictions.push('Сумма финансирования превышает 7 млрд тг; для этого диапазона Гарантийный фонд 1 не применяется.');
        }

        if (!query.purpose) {
          missing_inputs.push('Цель финансирования: инвестиции, пополнение оборотных средств или рефинансирование');
          clarificationSet.add('purpose');
        }

        if (!query.entity_type) {
          missing_inputs.push('Подтвердить статус субъекта частного предпринимательства / допустимого участника программы');
          clarificationSet.add('entity');
        }

        if (query.overdue_debt_days === null || query.overdue_debt_days === undefined) {
          missing_inputs.push('Подтвердить отсутствие текущей просроченной задолженности перед кредитором');
          clarificationSet.add('debt');
        }

        missing_inputs.push('Проверить кредитную историю за последние 36 месяцев по критериям Правил гарантирования');
        missing_inputs.push('Подтвердить отсутствие иных исключений Правил гарантирования, включая ограничения п. 4 ст. 24 Предпринимательского кодекса РК');
      }
    }

    // Guarantee Fund 2: крупные проекты свыше 7 млрд тг и ограниченный перечень секторов
    else if (prog.id === 'damu.guarantee.guarantee_fund_2') {
      const code2 = parseInt(cleanCode.slice(0, 2), 10);
      const gf2Sector =
        (!isNaN(code2) && code2 >= 10 && code2 <= 33) || // manufacturing
        cleanCode.startsWith('01') || cleanCode.startsWith('02') || cleanCode.startsWith('03') || // APK
        cleanCode.startsWith('35') || cleanCode.startsWith('36') || cleanCode.startsWith('37') || cleanCode.startsWith('38') || cleanCode.startsWith('39') || // energy/utilities
        cleanCode.startsWith('49') || cleanCode.startsWith('50') || cleanCode.startsWith('51') || cleanCode.startsWith('52') || cleanCode.startsWith('53') || // transport/logistics
        cleanCode.startsWith('55') || cleanCode.startsWith('56') || // tourism/hospitality
        cleanCode.startsWith('61') || // communications
        cleanCode.startsWith('85') || cleanCode.startsWith('86'); // education/health

      if (!gf2Sector) {
        okedMatchLevel = 'excluded';
        restrictions.push(`ОКЭД ${cleanCode} не относится к секторам, указанным в текущей базе условий Гарантийного фонда 2.`);
      } else if (!query.amount_kzt) {
        okedMatchLevel = 'compatible';
        missing_inputs.push('Сумма финансирования для проверки порога Гарантийного фонда 2 (> 7 млрд тг)');
        clarificationSet.add('amount');
      } else if (query.amount_kzt <= 7000000000) {
        okedMatchLevel = 'excluded';
        restrictions.push('Гарантийный фонд 2 предназначен для финансирования свыше 7 млрд тг; при меньшей сумме следует рассматривать Гарантийный фонд 1.');
      } else {
        okedMatchLevel = 'exact';
        matched_reasons.push('Сумма финансирования превышает 7 млрд тг и отрасль входит в перечень секторов Гарантийного фонда 2.');
        missing_inputs.push('Собственные средства не менее 20% стоимости проекта');
      }
    }

    // APK investment guarantee
    else if (prog.id === 'damu.guarantee.apk.investment') {
      const isApk =
        cleanCode.startsWith('01') ||
        cleanCode.startsWith('03') ||
        cleanCode.startsWith('10') ||
        cleanCode.startsWith('11.06') ||
        cleanCode.startsWith('11.07');

      if (!isApk) {
        okedMatchLevel = 'excluded';
        restrictions.push(`ОКЭД ${cleanCode} не относится к АПК или пищевой переработке, заявленным для данной программы гарантирования.`);
      } else {
        okedMatchLevel = 'exact';
        matched_reasons.push(`ОКЭД ${cleanCode} относится к АПК / переработке сельхозпродукции.`);
      }
    }

    // APK spring / harvesting guarantee
    else if (prog.id === 'damu.guarantee.apk.spring_harvesting') {
      if (!cleanCode.startsWith('01')) {
        okedMatchLevel = 'excluded';
        restrictions.push(`ОКЭД ${cleanCode} не относится к растениеводству/сельскохозяйственной деятельности для весенне-полевых и уборочных работ.`);
      } else {
        okedMatchLevel = 'compatible';
        matched_reasons.push(`ОКЭД ${cleanCode} относится к сельскому хозяйству; требуется подтверждение связи финансирования с весенне-полевыми или уборочными работами.`);
        missing_inputs.push('Подтверждение, что цель финансирования — весенне-полевые и/или уборочные работы');
      }
    }

    // Manufacturing SME tranches: Section C only, source quality requires verification
    else if (prog.id === 'damu.loan.manufacturing_msb.tranche1') {
      const code2 = parseInt(cleanCode.slice(0, 2), 10);
      const isManufacturing = !isNaN(code2) && code2 >= 10 && code2 <= 33;
      if (!isManufacturing) {
        okedMatchLevel = 'excluded';
        restrictions.push(`ОКЭД ${cleanCode} не относится к секции C «Обрабатывающая промышленность».`);
      } else {
        okedMatchLevel = 'verification_needed';
        matched_reasons.push(`ОКЭД ${cleanCode} относится к секции C «Обрабатывающая промышленность».`);
        missing_inputs.push('Актуальные условия транша требуют проверки: детальная страница программы в базе помечена как needs_verification');
      }
    }

    // Damu Leasing: program details are incomplete in the source base, never present as a confident match
    else if (prog.id === 'damu.leasing.damu_lizing') {
      okedMatchLevel = 'verification_needed';
      matched_reasons.push('Программа относится к лизингу техники/оборудования, но детальные условия в текущей базе не извлечены.');
      missing_inputs.push('Актуальные условия «Даму-Лизинг» и соответствие конкретного предмета лизинга');
      if (query.purpose && query.purpose !== 'Лизинг') {
        restrictions.push(`Указанная цель «${query.purpose}» не соответствует назначению программы «Даму-Лизинг».`);
      }
    }

    // EDP segment programs require business-size confirmation; do not show them as clean matches without it
    else if (
      prog.id.startsWith('damu.subsidy.enterprise_development.') ||
      prog.id.startsWith('damu.guarantee.enterprise_development.')
    ) {
      if (prog.id.endsWith('.small_town')) {
        const settlementConfirmed = query.settlement_type_confirmed === true;
        if (
          settlementConfirmed &&
          (query.settlement_type === 'monotown' || query.settlement_type === 'village')
        ) {
          okedMatchLevel = 'compatible';
          matched_reasons.push('Тип населённого пункта явно подтверждён пользователем как моногород или сельская территория.');
        } else if (
          settlementConfirmed &&
          (query.settlement_type === 'regional_city' || query.settlement_type === 'republican_city')
        ) {
          okedMatchLevel = 'excluded';
          restrictions.push('Направление предназначено для моно-/малых городов и сельских населённых пунктов; выбранный тип территории этому не соответствует.');
        } else {
          okedMatchLevel = 'verification_needed';
          missing_inputs.push('Подтвердить тип населённого пункта: моногород, малый город или сельский населённый пункт');
          clarificationSet.add('location');
        }
      } else if (prog.id.endsWith('.stock_exchange')) {
        okedMatchLevel = 'verification_needed';
        missing_inputs.push('Подтверждение, что финансирование планируется через выпуск/размещение облигаций');
      } else if (prog.id.endsWith('.social')) {
        okedMatchLevel = 'social_only';
        if (query.social_enterprise_registry === true) {
          matched_reasons.push('Статус социального предпринимательства подтверждён.');
        } else if (query.social_enterprise_registry === false) {
          restrictions.push('Для данного направления требуется статус социального предпринимательства.');
        } else {
          missing_inputs.push('Наличие записи в реестре субъектов социального предпринимательства');
          clarificationSet.add('social_enterprise_registry');
        }
      } else {
        okedMatchLevel = 'compatible';
        missing_inputs.push(`Подтверждение категории бизнеса для направления «${prog.target_segment}»`);
      }
    }

    // Social enterprise programs
    else if (prog.id.includes('.social')) {
      okedMatchLevel = 'social_only';
      matched_reasons.push('Без отраслевых ограничений при наличии статуса в реестре социального предпринимательства.');
      if (query.social_enterprise_registry === false) {
        restrictions.push('Требуется обязательное нахождение в Реестре субъектов социального предпринимательства.');
      } else if (query.social_enterprise_registry === true) {
        matched_reasons.push('Включение в Реестр субъектов социального предпринимательства подтверждено.');
      } else {
        missing_inputs.push('Наличие записи в реестре субъектов социального предпринимательства');
        clarificationSet.add('social_enterprise_registry');
      }
    }

    // Other programs: never overstate eligibility when the source base is incomplete
    else {
      if (prog.data_quality === 'low' || prog.status === 'needs_verification') {
        okedMatchLevel = 'verification_needed';
        matched_reasons.push('В текущей базе недостаточно детальных условий для точного автоматического заключения.');
        missing_inputs.push('Проверка актуального регламента программы');
      } else {
        okedMatchLevel = 'compatible';
        matched_reasons.push('Программа не содержит подтверждённого отраслевого запрета в текущей базе; применимость зависит от остальных параметров проекта.');
      }
    }

    // 4. Unified eligibility checks shared by ALL programs
    // Instrument preference
    if (query.instrument_preference) {
      const instrument = (prog.instrument_type || '').toLowerCase();
      const requested = query.instrument_preference.toLowerCase();
      const instrumentMatches =
        (requested.includes('субсид') && instrument.includes('субсид')) ||
        (requested.includes('гарант') && instrument.includes('гарант')) ||
        (requested.includes('кредит') && (instrument.includes('кредит') || instrument.includes('займ'))) ||
        (requested.includes('лизинг') && instrument.includes('лизинг'));

      if (!instrumentMatches) {
        restrictions.push(`Выбран предпочтительный инструмент «${query.instrument_preference}», а программа относится к инструменту «${prog.instrument_type}».`);
      } else {
        matched_reasons.push(`Инструмент программы соответствует предпочтению: ${query.instrument_preference}.`);
      }
    }

    // Financing purpose
    if (query.purpose) {
      const purposeText = (prog.purpose_short || '').toLowerCase();
      const requestedPurpose = query.purpose.toLowerCase();
      const purposeMatches =
        (requestedPurpose.includes('инвест') && purposeText.includes('инвест')) ||
        (requestedPurpose.includes('оборот') && (purposeText.includes('оборот') || purposeText.includes('пополн'))) ||
        (requestedPurpose.includes('рефин') && purposeText.includes('рефин')) ||
        (requestedPurpose.includes('лизинг') && (purposeText.includes('лизинг') || (prog.instrument_type || '').toLowerCase().includes('лизинг')));

      if (!purposeMatches && prog.purpose_short) {
        restrictions.push(`Цель «${query.purpose}» не подтверждена условиями программы: ${prog.purpose_short}.`);
      } else if (purposeMatches) {
        matched_reasons.push(`Цель финансирования «${query.purpose}» соответствует назначению программы.`);
      }
    }

    // Geography completeness: regional programs that depend on a district must have it selected.
    if (
      prog.id === 'damu.subsidy.isker_aymak' &&
      query.region_id &&
      !query.district_name &&
      !checkIskerNationalEligibility(cleanCode).matched
    ) {
      missing_inputs.push('Конкретный район/город для проверки дополнительного регионального приоритета МИО');
      clarificationSet.add('location');
    }

    // 5. Clarification Evaluation (Step 2 checks if filled)
    if (query.tax_arrears === true) {
      if (prog.id === 'damu.loan.orleu' || prog.id === 'damu.leasing.orleu' || prog.id.includes('guarantee_fund')) {
        restrictions.push('Наличие непогашенной налоговой задолженности прямо запрещает участие в данной программе.');
      }
    }

    if (query.overdue_debt_days && query.overdue_debt_days > 60) {
      if (prog.id === 'damu.loan.orleu') {
        restrictions.push(`Просроченная задолженность свыше 60 дней (${query.overdue_debt_days} дн.) исключает финансирование по программе «Өрлеу».`);
      }
    }

    if (query.operating_years !== null && query.operating_years !== undefined) {
      if (prog.id === 'damu.leasing.orleu' && query.operating_years < 1) {
        restrictions.push('Для «Өрлеу-Лизинг» требуется не менее одного полного операционного календарного года деятельности.');
      }
    }

    if (query.amount_kzt && prog.amount_max_kzt) {
      if (query.amount_kzt > prog.amount_max_kzt) {
        restrictions.push(`Запрашиваемая сумма (${(query.amount_kzt / 1e6).toLocaleString('ru-RU')} млн тг) превышает максимальный лимит программы (${prog.amount_max_text}).`);
      }
    }

    if (prog.id === 'damu.guarantee.guarantee_fund_2' && query.amount_kzt) {
      if (query.amount_kzt <= 7000000000) {
        restrictions.push(`Сумма финансирования до 7 млрд тенге относится к диапазону Гарантийного фонда 1; Гарантийный фонд 2 предназначен для финансирования свыше 7 млрд тенге.`);
      }
    }

    // GF1 intentionally remains "clarification / verification" until all regulatory
    // conditions are confirmed. Amount + purpose alone are insufficient for an exact match.

    // 5. Final Status Calculation
    let status: ProgramStatus = 'possible_match';
    let status_label_ru = 'Возможное соответствие';

    const hasFatalRestriction = restrictions.length > 0 && restrictions.some(r =>
      r.includes('исключен') ||
      r.includes('исключены') ||
      r.includes('не предоставляется') ||
      r.includes('запрещает') ||
      r.includes('превышает') ||
      r.includes('исключает') ||
      r.includes('не входит в перечень') ||
      r.includes('не подтверждена условиями программы') ||
      r.includes('предпочтительный инструмент') ||
      r.includes('закупка должна осуществляться')
    );

    if (hasFatalRestriction || okedMatchLevel === 'excluded') {
      status = 'not_applicable';
      status_label_ru = 'Не применимо';
    } else if (okedMatchLevel === 'verification_needed') {
      status = 'needs_verification';
      status_label_ru = 'Требуется верификация';
    } else if (missing_inputs.length > 0) {
      status = 'needs_clarification';
      status_label_ru = 'Требуется уточнение';
    } else if (okedMatchLevel === 'exact' && restrictions.length === 0) {
      status = 'exact_match';
      status_label_ru = 'Точное соответствие';
    } else {
      status = 'possible_match';
      status_label_ru = 'Возможное соответствие';
    }

    const hydratedSources = Array.from(
      new Map(
        [
          ...(prog.sources || []),
          ...damuKnowledgeBase.sources.filter((source) => prog.source_ids.includes(source.source_id))
        ].map((source) => [source.source_id, source])
      ).values()
    );

    const result: ProgramMatchResult = {
      program: { ...prog, sources: hydratedSources },
      status,
      status_label_ru,
      matched_reasons,
      restrictions,
      missing_inputs,
      confidence: prog.data_quality === 'high' ? 'high' : 'medium',
      sources: hydratedSources
    };

    if (status === 'exact_match') exact_matches.push(result);
    else if (status === 'possible_match') possible_matches.push(result);
    else if (status === 'needs_clarification') needs_clarification.push(result);
    else if (status === 'needs_verification') needs_verification.push(result);
    else not_applicable.push(result);
  }

  return {
    query,
    total_checked: damuKnowledgeBase.programs.length,
    exact_matches,
    possible_matches,
    needs_clarification,
    needs_verification,
    not_applicable,
    is_broad_oked: isBroad,
    broad_oked_warning: warning,
    identified_clarifications: Array.from(clarificationSet)
  };
}
