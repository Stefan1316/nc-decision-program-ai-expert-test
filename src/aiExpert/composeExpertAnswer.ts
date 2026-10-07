import { ExpertContext, ExpertIntent } from './types';

export interface ExpertAnswer {
  intent: ExpertIntent;
  title: string;
  body: string[];
  sourceIds: string[];
}

const activeStatuses = new Set(['exact_match','possible_match','needs_clarification','needs_verification']);

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function activeDecisions(context: ExpertContext) {
  return context.decisions.filter((d) => activeStatuses.has(d.decisionStatus));
}

export function detectExpertIntent(text: string): ExpertIntent {
  const q = text.toLowerCase();
  if (/источник|ссылка|регламент|официал/.test(q)) return 'show_sources';
  if (/не подход|почему.*(не|исключ)|исключен|отказ/.test(q)) return 'why_not';
  if (/уточн|не хватает|чего не хватает|добавить данные/.test(q)) return 'what_to_clarify';
  if (/дальше|следующ|что делать|порядок действий/.test(q)) return 'next_steps';
  if (/сравн|лучше|выгодн/.test(q)) return 'compare_programs';
  if (/почему.*подход|почему.*показыва|подходит/.test(q)) return 'why_matches';
  if (/помен|измени|проверь другой|другой окэд|другую сумму|другой район|другой регион/.test(q)) return 'change_project_parameter';
  return 'explain_summary';
}

export function composeExpertAnswer(context: ExpertContext, userText: string): ExpertAnswer {
  const intent = detectExpertIntent(userText);
  const active = activeDecisions(context);
  const excluded = context.decisions.filter((d) => d.decisionStatus === 'not_applicable');
  const sourceIds = uniq(context.decisions.flatMap((d) => d.sources.map((s) => s.sourceId)));

  if (intent === 'show_sources') {
    const rows = uniq(context.decisions.flatMap((d) => d.sources.map((s) =>
      `${s.sourceId} — ${s.title}; проверено ${s.checkedOn}`
    )));
    return {
      intent,
      title: 'Официальные источники текущего анализа',
      body: rows.length ? rows : ['В текущем контексте нет прикреплённых официальных источников. Этот вопрос требует верификации.'],
      sourceIds
    };
  }

  if (intent === 'why_not') {
    const rows = excluded.slice(0, 6).map((d) => {
      const reason = d.restrictions[0] || 'Программа исключена правилами decision engine по текущим параметрам.';
      return `${d.programName}: ${reason}`;
    });
    return {
      intent,
      title: 'Почему отдельные программы не подходят',
      body: rows.length ? rows : ['По текущему анализу нет программ со статусом «Не применимо».'],
      sourceIds: uniq(excluded.flatMap((d) => d.sources.map((s) => s.sourceId)))
    };
  }

  if (intent === 'what_to_clarify') {
    const missing = uniq(active.flatMap((d) => d.missingInputs));
    return {
      intent,
      title: 'Что требуется уточнить',
      body: missing.length
        ? missing.slice(0, 8)
        : ['Для текущих активных программ обязательных уточнений не выявлено. Можно переходить к проверке документов и условий подачи.'],
      sourceIds: uniq(active.flatMap((d) => d.sources.map((s) => s.sourceId)))
    };
  }

  if (intent === 'next_steps') {
    const missing = uniq(active.flatMap((d) => d.missingInputs));
    const steps = [
      missing.length ? `Уточнить недостающие данные: ${missing.slice(0, 3).join('; ')}.` : 'Зафиксировать выбранную программу и её действующие условия.',
      'Проверить официальный источник и дату актуальности условий.',
      'Сформировать перечень документов и подготовить досье для выбранного финансового маршрута.'
    ];
    return { intent, title: 'Рекомендуемые следующие шаги', body: steps, sourceIds: uniq(active.flatMap((d) => d.sources.map((s) => s.sourceId))) };
  }

  if (intent === 'compare_programs') {
    const rows = active.slice(0, 4).map((d) =>
      `${d.programName} — ${d.decisionLabel}; ставка: ${d.financialTerms.borrowerRate || 'уточняется'}; лимит: ${d.financialTerms.amountMax || 'уточняется'}; срок: ${d.financialTerms.term || 'уточняется'}.`
    );
    return {
      intent,
      title: 'Сравнение доступных маршрутов',
      body: rows.length ? rows : ['Нет активных программ для сравнения по текущим параметрам.'],
      sourceIds: uniq(active.flatMap((d) => d.sources.map((s) => s.sourceId)))
    };
  }

  if (intent === 'why_matches') {
    const rows = active.slice(0, 5).map((d) => {
      const reason = d.matchedReasons[0] || 'Программа не содержит подтверждённого запрета по текущим данным.';
      return `${d.programName}: ${reason}`;
    });
    return {
      intent,
      title: 'Почему система показывает эти программы',
      body: rows.length ? rows : ['Подходящие или требующие уточнения программы по текущим данным не найдены.'],
      sourceIds: uniq(active.flatMap((d) => d.sources.map((s) => s.sourceId)))
    };
  }

  if (intent === 'change_project_parameter') {
    return {
      intent,
      title: 'Изменение параметров проекта',
      body: [
        'Я распознал запрос на изменение параметров проекта.',
        'На следующем этапе AI Expert сможет вернуть структурированную команду изменения ОКЭД, территории, суммы или цели, после чего decision engine выполнит новый расчёт.',
        'Сейчас этот режим намеренно не меняет данные проекта автоматически.'
      ],
      sourceIds: []
    };
  }

  const exact = context.decisions.filter((d) => d.decisionStatus === 'exact_match');
  const clarification = context.decisions.filter((d) => d.decisionStatus === 'needs_clarification' || d.decisionStatus === 'needs_verification');
  const project = [
    context.project.okedCode ? `ОКЭД ${context.project.okedCode}${context.project.okedName ? ` — ${context.project.okedName}` : ''}` : '',
    context.project.region || '',
    context.project.district || ''
  ].filter(Boolean).join(' · ');

  return {
    intent: 'explain_summary',
    title: 'Краткое объяснение заключения',
    body: [
      project ? `Проект: ${project}.` : 'Параметры проекта сформированы частично.',
      `По decision engine: точных соответствий — ${exact.length}; возможных — ${context.counts.possible}; требуют уточнения/верификации — ${clarification.length}; не применимо — ${context.counts.notApplicable}.`,
      exact.length
        ? `Наиболее подтверждённые программы: ${exact.slice(0, 3).map((d) => d.programName).join('; ')}.`
        : 'Точных соответствий пока нет — это не означает отказ: часть программ требует дополнительных данных или верификации.',
      `Полнота данных анализа: ${context.readiness.analysisPercent}%. Это показатель полноты данных, а не вероятность одобрения финансирования.`
    ],
    sourceIds: uniq(active.flatMap((d) => d.sources.map((s) => s.sourceId)))
  };
}
