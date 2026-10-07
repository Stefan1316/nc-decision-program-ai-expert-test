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


function normalizeProgramText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[«»"'()[\]{}.,:;!?/\\_-]/g, ' ')
    .replace(/ө/g, 'о')
    .replace(/ә/g, 'а')
    .replace(/і/g, 'и')
    .replace(/қ/g, 'к')
    .replace(/ү/g, 'у')
    .replace(/ұ/g, 'у')
    .replace(/ң/g, 'н')
    .replace(/һ/g, 'х')
    .replace(/\s+/g, ' ')
    .trim();
}

function aliasesForProgram(program: ExpertContext['decisions'][number]): string[] {
  const name = normalizeProgramText(program.programName);
  const id = normalizeProgramText(program.programId);
  const aliases = new Set<string>([name, id]);

  if (/орлеу|orleu/.test(name + ' ' + id)) ['орлеу','өрлеу','orleu'].forEach((v) => aliases.add(normalizeProgramText(v)));
  if (/искер|isker/.test(name + ' ' + id)) ['искер аймак','іскер аймақ','isker aymak'].forEach((v) => aliases.add(normalizeProgramText(v)));
  if (/gf1|гарантийн.*фонд 1/.test(name + ' ' + id)) ['гф1','гф 1','гарантийный фонд 1'].forEach((v) => aliases.add(normalizeProgramText(v)));
  if (/gf2|гарантийн.*фонд 2/.test(name + ' ' + id)) ['гф2','гф 2','гарантийный фонд 2'].forEach((v) => aliases.add(normalizeProgramText(v)));

  for (const token of name.split(' ')) if (token.length >= 6) aliases.add(token);
  return Array.from(aliases).filter((v) => v.length >= 3);
}

export function findMentionedProgram(context: ExpertContext, text: string) {
  const q = normalizeProgramText(text);
  const scored = context.decisions
    .map((program) => {
      const hit = aliasesForProgram(program).filter((alias) => q.includes(alias)).sort((a,b) => b.length - a.length)[0];
      return { program, score: hit?.length || 0 };
    })
    .filter((row) => row.score > 0)
    .sort((a,b) => b.score - a.score);
  return scored[0]?.program || null;
}

function humanizeMissingInputs(items: string[]): string[] {
  const raw = uniq(items);
  const q = raw.map((item) => ({ item, normalized: normalizeProgramText(item) }));
  const result: string[] = [];

  if (q.some(({normalized}) => /категор.*бизнес|микро предприним|малое и среднее|малое среднее и крупное|форма заявителя/.test(normalized))) {
    result.push('Уточните категорию бизнеса: микро / малый / средний / крупный и организационно-правовую форму заявителя.');
  }
  if (q.some(({normalized}) => /сумм|лимит финанс/.test(normalized))) result.push('Уточните требуемую сумму финансирования.');
  if (q.some(({normalized}) => /цель|назначен|инвестиц|оборотн|рефинанс|лизинг/.test(normalized))) result.push('Уточните цель финансирования: инвестиции / оборотные средства / рефинансирование / лизинг.');
  if (q.some(({normalized}) => /район|город|населен|территор/.test(normalized))) result.push('Уточните точную территорию реализации проекта: область, город/район и тип населённого пункта.');
  if (q.some(({normalized}) => /социальн.*реестр|реестр.*социаль/.test(normalized))) result.push('Уточните наличие записи в реестре субъектов социального предпринимательства.');
  if (q.some(({normalized}) => /просроч|задолж|налог/.test(normalized))) result.push('Уточните наличие текущей просроченной кредитной или налоговой задолженности.');
  if (q.some(({normalized}) => /облигац/.test(normalized))) result.push('Уточните, планируется ли финансирование через выпуск/размещение облигаций.');

  const covered = (s: string) => /категор.*бизнес|микро предприним|малое и среднее|малое среднее и крупное|форма заявителя|сумм|лимит финанс|цель|назначен|инвестиц|оборотн|рефинанс|лизинг|район|город|населен|территор|социальн.*реестр|реестр.*социаль|просроч|задолж|налог|облигац/.test(s);
  for (const row of q) if (!covered(row.normalized)) result.push(row.item);

  return uniq(result).slice(0,8);
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
  const mentioned = findMentionedProgram(context, userText);
  const active = activeDecisions(context);

  if (mentioned && ['why_matches','why_not','show_sources','what_to_clarify','next_steps','explain_summary'].includes(intent)) {
    const sourceIds = uniq(mentioned.sources.map((s) => s.sourceId));
    if (intent === 'show_sources') {
      return {
        intent,
        title: `Официальные источники: ${mentioned.programName}`,
        body: mentioned.sources.length
          ? mentioned.sources.map((s) => `${s.title}; проверено ${s.checkedOn}.`)
          : ['По этой программе официальный источник в текущем контексте не прикреплён — требуется верификация.'],
        sourceIds
      };
    }

    const statusText =
      mentioned.decisionStatus === 'exact_match' ? 'Соответствие подтверждено по текущим данным.' :
      mentioned.decisionStatus === 'possible_match' ? 'Программа потенциально подходит по текущим данным, но это не окончательное одобрение.' :
      mentioned.decisionStatus === 'needs_clarification' ? 'Программа пока не подтверждена: не хватает данных пользователя.' :
      mentioned.decisionStatus === 'needs_verification' ? 'Программа пока не подтверждена: требуется верификация условия или источника.' :
      'Программа не применима по текущим параметрам.';

    const body = [statusText, `Текущий статус: «${mentioned.decisionLabel}».`];
    if (mentioned.matchedReasons[0] && mentioned.decisionStatus !== 'not_applicable') body.push(`Основание: ${mentioned.matchedReasons[0]}`);
    if (mentioned.restrictions[0]) body.push(`Ограничение/условие: ${mentioned.restrictions[0]}`);
    const missing = humanizeMissingInputs(mentioned.missingInputs);
    if (missing.length) body.push(`Что уточнить: ${missing.join(' ')}`);

    return {
      intent,
      title: `${mentioned.programName}: разбор по текущему проекту`,
      body,
      sourceIds
    };
  }
  const excluded = context.decisions.filter((d) => d.decisionStatus === 'not_applicable');
  const sourceIds = uniq(context.decisions.flatMap((d) => d.sources.map((s) => s.sourceId)));

  if (intent === 'show_sources') {
    const rows = uniq(context.decisions.flatMap((d) => d.sources.map((s) =>
      `${s.title}; проверено ${s.checkedOn}`
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
    const missing = humanizeMissingInputs(active.flatMap((d) => d.missingInputs));
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
    const confirmed = active.filter((d) => d.decisionStatus === 'exact_match' || d.decisionStatus === 'possible_match');
    const pending = active.filter((d) => d.decisionStatus === 'needs_clarification' || d.decisionStatus === 'needs_verification');
    const body: string[] = [];

    if (confirmed.length) {
      body.push('Подтверждённые / потенциально подходящие программы:');
      for (const d of confirmed.slice(0,5)) {
        const status = d.decisionStatus === 'exact_match'
          ? 'соответствие подтверждено'
          : 'потенциально подходит';
        body.push(`${d.programName}: ${status}. ${d.matchedReasons[0] || ''}`.trim());
      }
    }

    if (pending.length) {
      body.push('Отдельно требуют уточнения или верификации — это ещё не подтверждённое соответствие:');
      for (const d of pending.slice(0,4)) {
        const status = d.decisionStatus === 'needs_clarification'
          ? 'нужны дополнительные данные'
          : 'требуется верификация';
        body.push(`${d.programName}: программа пока не подтверждена; ${status}.`);
      }
    }

    return {
      intent,
      title: 'Почему система показывает эти программы',
      body: body.length ? body : ['Подходящие или требующие проверки программы по текущим данным не найдены.'],
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
