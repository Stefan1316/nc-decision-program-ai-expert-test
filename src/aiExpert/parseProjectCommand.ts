import { KAZAKHSTAN_TERRITORIES } from '../data/kazakhstanTerritories';
import { KAZAKHSTAN_DISTRICTS_DATABASE } from '../data/kazakhstanDistricts';
import { ExpertParameterChange } from './types';

export interface ParsedProjectCommand {
  recognized: boolean;
  changes: ExpertParameterChange[];
  summaryLines: string[];
  unresolved: string[];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/ё/g, 'е')
    .replace(/[—–−]/g, ' - ')
    .replace(/[«»"'()[\]{}:;!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAmount(text: string): number | null {
  const q = normalize(text);
  const match = q.match(/(\d{1,3}(?:[\s.]\d{3})+|\d+(?:[.,]\d+)?)\s*(млрд|миллиард|млн|миллион|тыс|тысяч)?\s*(?:тг|тенге)?/i);
  if (!match) return null;

  const unit = (match[2] || '').toLowerCase();
  const numericText = match[1];

  let raw: number;
  if (unit) {
    raw = Number(numericText.replace(/\s/g, '').replace(',', '.'));
  } else {
    raw = Number(numericText.replace(/[\s.]/g, '').replace(',', '.'));
  }

  if (!Number.isFinite(raw)) return null;
  if (/млрд|миллиард/.test(unit)) return Math.round(raw * 1_000_000_000);
  if (/млн|миллион/.test(unit)) return Math.round(raw * 1_000_000);
  if (/тыс|тысяч/.test(unit)) return Math.round(raw * 1_000);
  if (raw >= 100_000) return Math.round(raw);
  return null;
}

function formatKzt(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString('ru-RU')} млрд ₸`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('ru-RU')} млн ₸`;
  return `${value.toLocaleString('ru-RU')} ₸`;
}

function findTerritory(text: string) {
  const q = normalize(text);
  const sorted = [...KAZAKHSTAN_TERRITORIES].sort((a,b) => b.name.length - a.name.length);
  return sorted.find((item) => q.includes(normalize(item.name)) || (item.id === 'astana-city' && /астану(?:\s|$)/.test(q))) || null;
}

function findDistrict(text: string) {
  const q = normalize(text);
  const all = Object.values(KAZAKHSTAN_DISTRICTS_DATABASE).flat();
  return [...all].sort((a,b) => b.name.length - a.name.length).find((item) =>
    q.includes(normalize(item.name).replace(/^г\s+/, '')) || q.includes(normalize(item.name))
  ) || null;
}

export function parseProjectCommand(text: string): ParsedProjectCommand {
  const q = normalize(text);
  const changes: ExpertParameterChange[] = [];
  const summaryLines: string[] = [];
  const unresolved: string[] = [];

  const okedMatch = q.match(/(?:окэд|оквед)\s*(?:на|=|:|-)?\s*([a-zа-я]?\s*\d{1,2}(?:[.\-]\d{1,3}){0,2}|[a-zа-я])/i);
  if (okedMatch) {
    const value = okedMatch[1].replace(/\s+/g,'').replace(/-/g, '.').toUpperCase();
    changes.push({ field:'oked_code', value });
    summaryLines.push(`ОКЭД → ${value}`);
  }

  const explicitAmountCue = /сумм|размер\s+финансирован|объем\s+финансирован|объём\s+финансирован|запрашива.*сумм|запрос.*(?:тг|тенге|млн|млрд)/.test(q);
  if (explicitAmountCue) {
    const amountSegment = q.match(/(?:сумм[аыуеой]?|размер\s+финансировани[яе]|объ[её]м\s+финансировани[яе])(?:\s+финансировани[яе])?\s*(?:на|в|=|-)?\s*(.*)/);
    const segment = amountSegment?.[1] || text;
    const amount = parseAmount(segment);
    // If the user gave competing figures in the same request, do not silently pick the first.
    const figureMatches = Array.from(segment.matchAll(/\d+(?:[\s.,]\d+)*\s*(?:млрд|миллиард(?:ов|а)?|млн|миллион(?:ов|а)?|тыс|тысяч(?:а|и)?)?\s*(?:тг|тенге)?/g))
      .map((m) => parseAmount(m[0])).filter((v): v is number => v !== null);
    const invalidCurrency = /(?:^|\s)(?:доллар(?:ов|а|ы)?|usd|евро|eur|рубл(?:ей|и)?|rub)(?:\s|$)/.test(segment);
    const negativeAmount = /(?:^|\s)-\s*\d+/.test(segment);
    const conflictingAmounts = new Set(figureMatches).size > 1;
    if (invalidCurrency) unresolved.push('Указана иностранная валюта. Уточните сумму в тенге.');
    if (negativeAmount) unresolved.push('Сумма финансирования не может быть отрицательной.');
    if (conflictingAmounts) unresolved.push('Указаны разные суммы финансирования. Уточните одну итоговую сумму.');

    if (amount && !conflictingAmounts && !invalidCurrency && !negativeAmount) {
      changes.push({ field:'amount_kzt', value:amount });
      summaryLines.push(`Сумма финансирования → ${formatKzt(amount)}`);
    } else if (!conflictingAmounts && !invalidCurrency && !negativeAmount) {
      unresolved.push('Не удалось однозначно определить сумму финансирования.');
    }
  }

  let purpose: ExpertParameterChange['value'] | null = null;
  if (/оборотн/.test(q)) purpose = 'Оборотные средства';
  else if (/рефинанс/.test(q)) purpose = 'Рефинансирование';
  else if (/лизинг/.test(q) && /цель|назначен|финансирован/.test(q)) purpose = 'Лизинг';
  else if (/инвестиц/.test(q)) purpose = 'Инвестиции';
  if (purpose) {
    changes.push({ field:'purpose', value:purpose });
    summaryLines.push(`Цель финансирования → ${purpose}`);
  }

  const entity = /\bтоо\b/.test(q) ? 'ТОО'
    : /\bип\b/.test(q) ? 'ИП'
    : /сельхозкооператив/.test(q) ? 'Сельхозкооператив'
    : null;
  if (entity && /форм|заявител|бизнес|компан|предприним/.test(q)) {
    changes.push({ field:'entity_type', value:entity });
    summaryLines.push(`Форма бизнеса → ${entity}`);
  }

  let instrument: string | null = null;
  if (/гарантир/.test(q)) instrument = 'Гарантирование';
  else if (/субсидир/.test(q)) instrument = 'Субсидирование';
  else if (/льготн.*кредит/.test(q)) instrument = 'Льготное кредитование';
  else if (/лизинг/.test(q) && /инструмент|предпочт/.test(q)) instrument = 'Лизинг';
  if (instrument) {
    changes.push({ field:'instrument_preference', value:instrument });
    summaryLines.push(`Инструмент → ${instrument}`);
  }

  if (/регион|област|город|район|территор|проверь\s+(в|для)|замени.*(на|город|област)|перенеси|переведи|перемести/.test(q)) {
    // In "из X в Y" or "из X в Y" with the word "перенеси", resolve only the destination.
    const movement = q.match(/(?:^|\s)(?:перенеси|переведи|перемести|перенести)\s+[\s\S]*?\sиз\s+(.+?)\s+(?:в|во)\s+(.+)$/);
    const destinationText = movement ? movement[2] : text;
    const topCities = KAZAKHSTAN_TERRITORIES.filter(t=>t.level==='city' && t.id.endsWith('-city') && (normalize(destinationText).includes(normalize(t.name)) || (t.id==='astana-city' && /астану/.test(normalize(destinationText)))));
    const cityConflict = topCities.length > 1;
    if (cityConflict) unresolved.push('Указаны несколько возможных городов. Уточните одну территорию реализации проекта.');
    const district = cityConflict ? null : findDistrict(destinationText);
    if (district) {
      changes.push(
        { field:'region_id', value:district.regionId },
        { field:'district_id', value:district.id },
        { field:'district_name', value:district.name },
        { field:'location_name', value:district.name },
        { field:'location_level', value:'district' }
      );
      summaryLines.push(`Территория → ${district.name}`);
    } else {
      const territory = cityConflict ? null : findTerritory(destinationText);
      if (territory) {
        changes.push(
          { field:'region_id', value:territory.id },
          { field:'region_name', value:territory.name },
          { field:'district_id', value:'' },
          { field:'district_name', value:'' },
          { field:'location_name', value:territory.name },
          { field:'location_level', value:territory.level }
        );
        summaryLines.push(`Территория → ${territory.name}`);
      } else if (/регион|област|город|район|территор/.test(q)) {
        unresolved.push('Не удалось однозначно определить территорию.');
      }
    }
  }

  // Remove duplicate fields, keeping the last recognized value.
  const deduped = Array.from(new Map(changes.map((c) => [c.field, c])).values());

  return {
    recognized: deduped.length > 0,
    changes: deduped,
    summaryLines,
    unresolved
  };
}
