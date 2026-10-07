import { ExpertContext } from './types';

export interface ExpertContextDiff {
  lines: string[];
  changedProgramIds: string[];
}

export function compareExpertContexts(before: ExpertContext, after: ExpertContext): ExpertContextDiff {
  const lines: string[] = [];
  const changedProgramIds: string[] = [];

  if (before.project.okedCode !== after.project.okedCode) {
    lines.push(`ОКЭД: ${before.project.okedCode} → ${after.project.okedCode}${after.project.okedName ? ` (${after.project.okedName})` : ''}`);
  }
  if (before.project.amountKzt !== after.project.amountKzt) {
    const format = (v?: number | null) => v == null ? 'не указана' : `${v.toLocaleString('ru-RU')} ₸`;
    lines.push(`Сумма: ${format(before.project.amountKzt)} → ${format(after.project.amountKzt)}`);
  }
  if (before.project.purpose !== after.project.purpose) {
    lines.push(`Цель: ${before.project.purpose || 'не указана'} → ${after.project.purpose || 'не указана'}`);
  }
  const beforeLocation = [before.project.region, before.project.district].filter(Boolean).join(' · ');
  const afterLocation = [after.project.region, after.project.district].filter(Boolean).join(' · ');
  if (beforeLocation !== afterLocation) lines.push(`Территория: ${beforeLocation || 'не указана'} → ${afterLocation || 'не указана'}`);

  const beforeMap = new Map(before.decisions.map((d) => [d.programId, d]));
  for (const d of after.decisions) {
    const prev = beforeMap.get(d.programId);
    if (prev && prev.decisionStatus !== d.decisionStatus) {
      changedProgramIds.push(d.programId);
      lines.push(`${d.programName}: «${prev.decisionLabel}» → «${d.decisionLabel}»`);
    }
  }

  if (!changedProgramIds.length) {
    lines.push('Статусы программ после пересчёта не изменились.');
  }

  lines.push(`Итог после пересчёта: точных — ${after.counts.exact}; возможных — ${after.counts.possible}; уточнение — ${after.counts.clarification}; верификация — ${after.counts.verification}; не применимо — ${after.counts.notApplicable}.`);

  return { lines, changedProgramIds };
}
