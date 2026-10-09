import {resolveQuestionEntity} from './questionEntity';
import type { ExpertContext } from './types';
import type { ExpertAnswer } from './composeExpertAnswer';

function uniq(xs: string[]): string[] { return Array.from(new Set(xs.filter(Boolean))); }
function fmt(amount: number): string { return amount.toLocaleString('ru-RU') + ' ₸'; }
function isStale(date: string, now: string): boolean {
 const x=Date.parse(date+'T00:00:00Z'),y=Date.parse(now+'T00:00:00Z');
 return !Number.isFinite(x)||!Number.isFinite(y)||x>y||y-x>30*86400000;
}
export function answerBankFunding(c:ExpertContext,userText=''): ExpertAnswer {
 const p=c.project,market=c.alternativeFunding.market,base=market.baseRate;
 const evidence=resolveQuestionEntity(c,userText);
 const products=(evidence.value==='ТОО'?market.products.filter(x=>!x.sourceId.includes('BEREKE-IP')&&!x.sourceId.includes('HALYK-ONLINE-IP')):evidence.value==='ИП'?market.products:market.products).slice(0,5);
 const known=[
  'ОКЭД '+p.okedCode+(p.region?' · '+p.region:''),
  p.entityType?'форма бизнеса '+p.entityType:(evidence.value?'форма бизнеса '+evidence.value+' (со слов заявителя)':''),
  p.amountKzt?'запрос '+fmt(p.amountKzt):'',
  p.purpose?'цель '+p.purpose:'',
  p.operatingYears!==undefined&&p.operatingYears!==null?'действует '+p.operatingYears+' лет':''
 ].filter(Boolean);
 const missing=[
  !p.entityType&&!evidence.value?'форму бизнеса':null,
  !p.amountKzt?'сумму кредита':null,
  !p.purpose?'цель финансирования':null,
  p.operatingYears===undefined||p.operatingYears===null?'срок деятельности бизнеса':null,
  'планируемый срок кредита','залог/обеспечение','финансовые показатели и денежные потоки'
 ].filter((x):x is string=>Boolean(x));
 const body=[
  'Предварительные банковские ориентиры по опубликованным тарифам. Это не означает одобрение банком и не подтверждает соответствия всем условиям.',
  'Уже известно о проекте: '+known.join('; ')+'.',
  ...(evidence.note?[evidence.note]:[]),
  'Базовая ставка НБРК в загруженной базе: '+base.ratePercent+'% с '+base.effectiveFrom+'; источник проверен '+base.checkedOn+'. Это не ставка кредита предпринимателя.',
  ...products.map(product=>{
   const compared=[
    evidence.value?'заявитель '+evidence.value+' (допустимая категория по опубликованному тарифу: '+(product.borrowerText||'не установлена')+')':'',
    p.amountKzt?'сумма '+fmt(p.amountKzt)+' прошла предварительный фильтр известного верхнего лимита':'',
    p.purpose?'цель '+p.purpose+' (по источнику: '+(product.purposeText||'не указана')+')':''
   ].filter(Boolean);
   return product.institution+' — '+product.productName+'. Ставка: '+product.nominalRateText+'; '+(product.aeirText||'ГЭСВ требуется уточнить')+'; лимит: '+(product.amountText||'уточняется')+'; срок: '+(product.termText||'уточняется')+'. '+(product.collateralText?'Обеспечение по источнику: '+product.collateralText+'. ':'')+'Сопоставлено: '+compared.join('; ')+'. Проверено по опубликованному источнику '+product.checkedOn+'. Отраслевые ограничения и окончательная применимость продукта для конкретного заявителя требуют проверки.';
  }),
  ...(products.length?[]:['Не найдено сопоставимых банковских продуктов по известным ограничениям.']),
  'Ещё необходимо уточнить: '+missing.join('; ')+'.',
  'Банк самостоятельно проверяет финансовую отчётность, кредитную историю, долговую нагрузку, денежные потоки, оценку обеспечения и внутренние критерии. Решение банка не предопределено.',
  ...(isStale(base.checkedOn,c.generatedAt.slice(0,10))||products.some(x=>isStale(x.checkedOn,c.generatedAt.slice(0,10)))?['ВНИМАНИЕ: как минимум один источник не проверялся более 30 дней, имеет некорректную или будущую дату. Перед использованием необходима повторная проверка.']:[])
 ];
 return {intent:'market_funding',title:'Рыночное финансирование БВУ',body,sourceIds:[...(base.sourceUrl?['SRC-NBK-BASE-RATE']:[]),...products.map(x=>x.sourceId)]};
}
export function answerGuarantees(c:ExpertContext,userText:string): ExpertAnswer {
 const focused=/(?:гф\s*1|гаранти[^\s]*\s+фонд[^\s]*\s*1|guarantee_fund_1)/i.test(userText);
 const gf1=c.decisions.find(x=>x.programId==='damu.guarantee.guarantee_fund_1');
 if(focused){
  if(!gf1)return {intent:'guarantee_routes',title:'Гарантийный фонд 1 «Даму»',body:['По текущему анализу ГФ-1 не найден. Требуется сверка с официальными правилами.'],sourceIds:[]};
  const amount=c.project.amountKzt;
  const bound=amount&&amount>0?Math.min(Math.round(amount*0.85),3500000000):null;
  const body=[
   'Гарантийный фонд 1 «Даму»: статус decision engine «'+gf1.decisionLabel+'». '+(gf1.decisionStatus==='not_applicable'?'По заданным параметрам не применим.':'Окончательная применимость не подтверждена.'),
   'По загруженным условиям (проверены '+gf1.checkedAt+'): финансирование до 7 млрд ₸, гарантия до 85% суммы кредита, максимум 3,5 млрд ₸; комиссия 1,5% от суммы гарантии при выпуске и ежегодно от остатка гарантии.',
   ...(amount&&bound!==null?['Для кредита '+fmt(amount)+' математический максимум по пределу 85%: '+fmt(bound)+'. Это не одобренная гарантия и не решение банка.']:['Сумма кредита неизвестна — необходима для расчёта верхнего предела гарантии.']),
   'Уже известно: ОКЭД '+c.project.okedCode+(c.project.region?' · '+c.project.region:'')+(c.project.entityType?' · '+c.project.entityType:'')+(c.project.purpose?' · '+c.project.purpose:'')+'.',
   ...(gf1.restrictions.length?['Ограничения в расчёте: '+gf1.restrictions.join('; ')+'.']:[]),
   ...(gf1.missingInputs.length?['Что ещё проверить: '+gf1.missingInputs.join('; ')+'.']:['Необходимо проверить все требования гарантийной программы.']),
   'Наличие официального источника и отсутствие явного отраслевого запрета не означают одобрение финансирования.'
  ];
  return {intent:'guarantee_routes',title:'Гарантийный фонд 1 «Даму» — проверка проекта',body,sourceIds:uniq(gf1.sources.map(x=>x.sourceId))};
 }
 const candidates=c.decisions.filter(x=>/гарант|guarantee/i.test(x.instrument+' '+x.programName+' '+x.programId));
 return {intent:'guarantee_routes',title:'Гарантии «Даму»: отдельная проверка',body:['Гарантирование и субсидирование ставки — разные инструменты; наличие источника не означает одобрение заявки.',...candidates.slice(0,5).map(x=>x.programName+': '+x.decisionLabel+'. '+(x.restrictions[0]||x.missingInputs[0]||'Уточните условия.')),'Для индивидуального разбора назовите механизм, например «Гарантийный фонд 1».'],sourceIds:uniq(candidates.slice(0,5).flatMap(x=>x.sources.map(s=>s.sourceId)))};
}
