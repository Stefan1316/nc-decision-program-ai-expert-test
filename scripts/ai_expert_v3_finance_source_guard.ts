import { composeExpertAnswer } from '../src/aiExpert/composeExpertAnswer';
import { buildExpertContext } from '../src/aiExpert/buildExpertContext';
import { evaluatePrograms } from '../src/logic/decisionEngine';
import type { UserQuery } from '../src/types/damu';
const query:UserQuery={oked_code:'45.2',region_id:'astana-city',region_name:'Астана',location_name:'Астана',location_level:'city',location_role:'project',district_name:'',settlement_type:'',settlement_type_confirmed:false,entity_type:'ТОО',business_status:'действующий',operating_years:3,purpose:'Инвестиции',amount_kzt:150000000,instrument_preference:'Гарантирование',tax_arrears:false,overdue_debt_days:0,social_enterprise_registry:false};
const answer=(date:string)=>composeExpertAnswer(buildExpertContext(evaluatePrograms(query),date),'Какие банковские альтернативы?');
function check(ok:boolean,msg:string){if(!ok)throw Error(msg);console.log('SOURCE_GUARD_PASS '+msg);}
check(!answer('2026-10-09T00:00:00Z').body.some(x=>x.includes('не проверялся более 30 дней')),'recent reference not stale');
check(answer('2026-11-10T00:00:00Z').body.some(x=>x.includes('не проверялся более 30 дней')),'old banking quotations flagged');
check(answer('2026-10-01T00:00:00Z').body.some(x=>x.includes('будущую дату')),'future dated quotations flagged');
check(answer('2026-11-10T00:00:00Z').body.some(x=>x.includes('Базовая ставка НБРК')),'bank and NBK distinction preserved');
console.log('SOURCE_GUARD_SUMMARY 4/4');
