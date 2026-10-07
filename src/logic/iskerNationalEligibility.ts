import { normalizeOkedCode } from './okedMatcher';

export interface IskerNationalEligibilityResult {
  matched: boolean;
  excluded: boolean;
  matchedRule?: string;
  reason: string;
}

/**
 * Общереспубликанский перечень приоритетных ОКЭД программы «Іскер аймақ».
 * Он проверяется отдельно от дополнительных региональных приоритетов МИО.
 *
 * Источник правил: SRC-ISKER в damuDatabase.ts.
 */
export function checkIskerNationalEligibility(okedCode: string): IskerNationalEligibilityResult {
  const code = normalizeOkedCode(okedCode).toUpperCase();

  if (!code) {
    return {
      matched: false,
      excluded: false,
      reason: 'Для проверки общереспубликанского перечня «Іскер аймақ» требуется код ОКЭД.'
    };
  }

  if (/^[A-Z]$/.test(code)) {
    return {
      matched: false,
      excluded: false,
      reason: `Указан укрупнённый буквенный раздел ${code}; для проверки перечня «Іскер аймақ» нужен числовой код ОКЭД.`
    };
  }

  if (code.startsWith('23.63')) {
    return {
      matched: false,
      excluded: true,
      matchedRule: '23 кроме 23.63',
      reason: 'ОКЭД 23.63 прямо исключён из общереспубликанского перечня «Іскер аймақ».'
    };
  }

  const excluded24 = ['24.10', '24.46', '24.51', '24.52'];
  if (excluded24.some((item) => code.startsWith(item))) {
    return {
      matched: false,
      excluded: true,
      matchedRule: '24 с исключениями 24.10, 24.46, 24.51, 24.52',
      reason: `ОКЭД ${code} входит в исключения раздела 24 общереспубликанского перечня «Іскер аймақ».`
    };
  }

  const exactPrefixes = ['11.06', '11.07'];
  const groupPrefixes = ['10', '13', '14', '15', '16', '17', '20', '21', '22', '23', '24', '25', '26', '27', '31', '32'];

  const exactRule = exactPrefixes.find((prefix) => code === prefix || code.startsWith(prefix + '.'));
  if (exactRule) {
    return {
      matched: true,
      excluded: false,
      matchedRule: exactRule,
      reason: `ОКЭД ${code} входит в общереспубликанский перечень «Іскер аймақ» по правилу ${exactRule}.`
    };
  }

  const groupRule = groupPrefixes.find((prefix) => code === prefix || code.startsWith(prefix + '.') || code.startsWith(prefix));
  if (groupRule) {
    return {
      matched: true,
      excluded: false,
      matchedRule: groupRule,
      reason: `ОКЭД ${code} входит в общереспубликанский перечень «Іскер аймақ» по группе ${groupRule}.`
    };
  }

  return {
    matched: false,
    excluded: false,
    reason: `ОКЭД ${code} не найден в общереспубликанском перечне «Іскер аймақ»; дополнительно проверяются региональные приоритеты МИО.`
  };
}
