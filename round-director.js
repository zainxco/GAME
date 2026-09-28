// Health, timing and unlocks are independent of rendering and can be validated for all rounds.
export const profiles=[
 {unlock:1,hp:70,speed:1.35,damage:10,range:1.5,windup:.52,recovery:.65},
 {unlock:3,hp:85,speed:1.7,damage:13,range:1.65,windup:.7,recovery:.7},
 {unlock:5,hp:52,speed:2.55,damage:8,range:1.45,windup:.4,recovery:.8},
 {unlock:8,hp:150,speed:1.25,damage:21,range:2.15,windup:.95,recovery:.85},
 {unlock:12,hp:195,speed:1.05,damage:25,range:1.95,windup:1.15,recovery:1.05}
];
export function roundRoster(round){const count=Math.min(18,5+Math.floor(round*.23)),unlocked=profiles.map((p,i)=>p.unlock<=round?i:-1).filter(i=>i>=0),roster=[];for(let i=0;i<count;i++){const type=unlocked[(i*7+round)%unlocked.length];roster.push({type,boss:false})}if(round%10===0)roster.push({type:3,boss:true});return roster}
export function enemyStats(type,round,boss){const p=profiles[type],scale=1+(round-1)*.012;return{...p,hp:Math.round(p.hp*scale*(boss?2.2:1)),speed:p.speed*(1+Math.min(.4,round*.004)),damage:Math.round(p.damage*(1+Math.min(.75,round*.008))*(boss?1.25:1)),attackDuration:p.windup+p.recovery}}
