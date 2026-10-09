import type { ExpertContext } from './types';
export type QuestionEntity = 'ТОО' | 'ИП';
export type EntityEvidence = { value: QuestionEntity | null; status: 'not_mentioned' | 'from_question' | 'confirmed_in_form' | 'conflict' | 'ambiguous'; note: string };
export function resolveQuestionEntity(context:ExpertContext,text:string):EntityEvidence {
 const q=text.toLowerCase().replace(/ё/g,'е');
 const mentionsTOO=/(?:^|[^а-яa-z])тоо(?:$|[^а-яa-z])|товариществ[ао]\s+с\s+ограниченн/i.test(q);
 const mentionsIP=/(?:^|[^а-яa-z])ип(?:$|[^а-яa-z])|индивидуальн(?:ого|ый|ому)\s+предпринимател/i.test(q);
 const form=context.project.entityType||null;
 if(mentionsTOO&&mentionsIP) return {value:null,status:'ambiguous',note:'В вопросе одновременно упомянуты ТОО и ИП. Уточните, какая форма бизнеса относится к заявителю.'};
 const mentioned:QuestionEntity|null=mentionsTOO?'ТОО':mentionsIP?'ИП':null;
 if(!mentioned) return {value:form==='ТОО'||form==='ИП'?form:null,status:form?'confirmed_in_form':'not_mentioned',note:''};
 if(form&&form!==mentioned) return {value:null,status:'conflict',note:'В анкете указано «'+form+'», а в вопросе — «'+mentioned+'». Уточните форму бизнеса. Анкета не изменена.'};
 if(form===mentioned) return {value:mentioned,status:'confirmed_in_form',note:'Форма бизнеса '+mentioned+' подтверждена в анкете.'};
 return {value:mentioned,status:'from_question',note:mentioned+' указано в вопросе, но не подтверждено в анкете. Анкета не изменена.'};
}
