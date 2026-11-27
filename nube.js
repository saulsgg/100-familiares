/* ===================== LA NUBE: lo que se comparte entre tus aparatos (compu, celular, tele) =====================
   Usa los mismos servidores públicos de mensajes del juego. Cada aparato guarda SU parte en un mensaje "retenido"
   (el servidor se queda con el último) y lee la de los demás. Todo va cifrado con la clave del grupo: sin la
   clave nadie puede leer los nombres. Si un servidor borra algo, cada aparato vuelve a subir lo que tiene. */
const NUBE={cs:[],sp:{},up:0,ok:0,at:0};
const nubeBrokers=()=>typeof BROKERS!=='undefined'?BROKERS:/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?['ws://127.0.0.1:8883/mqtt']:['wss://broker.hivemq.com:8884/mqtt','wss://broker.emqx.io:8084/mqtt','wss://test.mosquitto.org:8081/mqtt'];
const nubeB64=u=>{let s='';for(let i=0;i<u.length;i+=4096)s+=String.fromCharCode.apply(null,u.subarray(i,i+4096));return btoa(s)};
const nubeU8=t=>{const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
async function nubeHex(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function nubeKey(sec){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(sec),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('100familiares-nube'),iterations:30000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function nubeEnc(key,obj){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(obj)))),o=new Uint8Array(12+ct.length);o.set(iv);o.set(ct,12);return nubeB64(o)}
async function nubeDec(key,t){const u=nubeU8(t);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:u.subarray(0,12)},key,u.subarray(12))))}
const nubeTopic=(S,slot)=>'fam100dijeron/nube/'+S.tid+'/'+slot;
function nubeConnect(){if(NUBE.cs.length||typeof Paho==='undefined')return;
  nubeBrokers().forEach((u,i)=>{const B={u,i,c:null,up:false,wait:2000};NUBE.cs.push(B);
    const go=()=>{let c;try{c=new Paho.Client(u,'n'+Math.random().toString(36).slice(2,10))}catch(e){return}B.c=c;
      c.onMessageArrived=m=>{try{nubeIn(m.destinationName,m.payloadString)}catch(e){}};
      c.onConnectionLost=()=>{B.up=false;nubeCount();setTimeout(go,B.wait=Math.min(B.wait*2,60000))};
      try{c.connect({timeout:8,keepAliveInterval:50,cleanSession:true,mqttVersion:4,useSSL:/^wss/.test(u),
        onSuccess:()=>{B.up=true;B.wait=2000;nubeCount();Object.values(NUBE.sp).forEach(S=>{try{c.subscribe(nubeTopic(S,'#'),{qos:1})}catch(e){}});
          /* al conectar se vuelve a subir lo propio (por si el servidor lo perdió) */
          setTimeout(()=>Object.values(NUBE.sp).forEach(S=>nubeRepub(S,B)),1500)},
        onFailure:()=>{B.up=false;setTimeout(go,B.wait=Math.min(B.wait*2,60000))}})}catch(e){setTimeout(go,B.wait)}};
    go()})}
function nubeCount(){NUBE.up=NUBE.cs.filter(B=>B.up).length;if(NUBE.onState)try{NUBE.onState()}catch(e){}}
/* un espacio = un grupo (o tu perfil). onSlot(slot, datos) cada vez que llega algo nuevo de otro aparato */
async function nubeJoin(id,sec,mine,onSlot){const S={id,sec,mine,onSlot,key:await nubeKey(sec),tid:(await nubeHex('100f-espacio|'+sec)).slice(0,24),cache:{},own:null};
  NUBE.sp[id]=S;nubeConnect();NUBE.cs.forEach(B=>{if(B.up)try{B.c.subscribe(nubeTopic(S,'#'),{qos:1})}catch(e){}});
  /* lo de otros aparatos que ya conocíamos: si a los 12 s ningún servidor lo trae, lo volvemos a subir nosotros */
  setTimeout(()=>Object.values(S.cache).forEach(x=>{if(!x.seen&&x.raw)NUBE.cs.forEach(B=>nubeSend(B,nubeTopic(S,x.slot),x.raw))}),12000);return S}
function nubeLeave(id){const S=NUBE.sp[id];if(!S)return;delete NUBE.sp[id];NUBE.cs.forEach(B=>{if(B.up)try{B.c.unsubscribe(nubeTopic(S,'#'))}catch(e){}})}
function nubeSend(B,topic,raw){if(!B.up||!B.c)return false;try{const m=new Paho.Message(raw);m.destinationName=topic;m.qos=1;m.retained=true;B.c.send(m);return true}catch(e){return false}}
async function nubePut(id,data){const S=NUBE.sp[id];if(!S)return;data.v=Date.now();S.own={raw:await nubeEnc(S.key,data),v:data.v};NUBE.cs.forEach(B=>nubeSend(B,nubeTopic(S,S.mine),S.own.raw))}
function nubeRepub(S,B){if(S.own)nubeSend(B,nubeTopic(S,S.mine),S.own.raw)}
async function nubeIn(topic,raw){const S=Object.values(NUBE.sp).find(s=>topic.startsWith('fam100dijeron/nube/'+s.tid+'/'));if(!S||!raw)return;const slot=topic.slice(topic.lastIndexOf('/')+1);
  if(slot===S.mine)return;
  const c=S.cache[slot];if(c&&c.raw===raw){c.seen=1;return}let d;try{d=await nubeDec(S.key,raw)}catch(e){return}
  if(!d||typeof d!=='object'||(c&&c.v>=d.v)){if(c)c.seen=1;return}S.cache[slot]={slot,v:d.v,raw,seen:1};NUBE.ok++;NUBE.at=Date.now();if(S.onSlot)S.onSlot(slot,d,raw)}
/* para que otro aparato use los mismos grupos: un código de palabras fácil de escribir */
const NUBEW=['luna','sol','tigre','mango','faro','nube','rayo','coco','perla','trueno','lima','oso','foca','pino','rio','miel','kiwi','loro','nopal','cielo','fresa','gato','lobo','mar','roca','salsa','taco','uva','vaca','zorro','bola','dado','flor','gema','hoja','isla','jade','lago','mapa','nido','ola','pera','queso','rana','seda','tren','vela','yate'];
function nubeCode(){const r=crypto.getRandomValues(new Uint32Array(5));return[0,1,2,3].map(i=>NUBEW[r[i]%NUBEW.length]).join('-')+'-'+String(10+r[4]%90)}
const nubeNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const nubeValid=s=>/^([a-z]+-){4}\d{2}$/.test(s);

/* ===================== TU PERFIL EN VARIOS APARATOS =====================
   Cada aparato lleva la cuenta de SU parte (lo que ganó, gastó y jugó ahí) y la sube; el perfil que ves es la suma de
   todas las partes. Así nunca se pierde nada aunque juegues en la compu y en el celular. Lo que traes puesto y tu nombre:
   gana el último que lo cambió. */
const PSLW=['streak'],PSMX=['streakMax'],PSSETS=['ach','own','col','comp','tp'];
const psLS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const psO=o=>o&&typeof o==='object'&&!Array.isArray(o)?o:{};
const psSnap=(p,av)=>({c:Object.assign({},psO(p.c)),coin:+p.coin||0,eq:JSON.stringify(p.eq||{}),nm:p.nm||'',av:av||''});
let PSY=psLS.get('bt-psync',null);if(!(PSY&&nubeValid(PSY.m||'')&&PSY.own))PSY=null;else{delete PSY.last;PSY.oth=psO(PSY.oth)}
/* lo guardado es de todo el aparato (puede haber dos pestañas): se vuelve a leer antes de cada cambio; 'last' es de esta pestaña */
function psCur(){const c=psLS.get('bt-psync',null);if(c&&PSY&&c.m===PSY.m&&c.dev===PSY.dev&&c.own){PSY.own=c.own;PSY.oth=psO(c.oth)}}
const psStore=()=>psLS.set('bt-psync',{m:PSY.m,dev:PSY.dev,own:PSY.own,oth:PSY.oth});
let PSH=null;
function psNew(code,p,av,keep){const own={c:{},coin:0,lt:Date.now(),u:psLS.get('bt-uid','')};PSSETS.forEach(k=>own[k]={});
  if(keep){own.c=Object.assign({},psO(p.c));own.coin=+p.coin||0;PSSETS.forEach(k=>own[k]=Object.assign({},psO(p[k])));own.best=p.best;own.eq=p.eq;own.nm=p.nm||'';own.av=av||'';own.t=Date.now();own.cre=p.cre?1:0;own.day=p.day||''}
  PSY={m:code,dev:Math.random().toString(36).slice(2,10),own,last:psSnap(p,av),oth:{}};psStore()}
/* después de cambiar algo en este aparato: se anota en su parte y se sube */
function psSaved(p,av){if(!PSY||!p)return;psCur();if(!PSY.last){PSY.last=psSnap(p,av);return}const o=PSY.own,L=PSY.last,c=psO(p.c);
  for(const k in c){const v=+c[k]||0;if(PSLW.includes(k)){if(v!==(+L.c[k]||0))o.st=[v,Date.now()]}else if(PSMX.includes(k))o.c[k]=Math.max(+o.c[k]||0,v);else{const d=v-(+L.c[k]||0);if(d)o.c[k]=(+o.c[k]||0)+d}}
  const dc=(+p.coin||0)-L.coin;if(dc)o.coin=(+o.coin||0)+dc;
  PSSETS.forEach(k=>{o[k]=Object.assign(psO(o[k]),psO(p[k]))});if(p.best!=null&&(o.best==null||p.best<o.best))o.best=p.best;if(p.cre)o.cre=1;if((p.day||'')>(o.day||''))o.day=p.day;
  if(JSON.stringify(p.eq||{})!==L.eq||(p.nm||'')!==L.nm||(av||'')!==L.av){o.eq=p.eq;o.nm=p.nm||'';o.av=av||'';o.t=Date.now()}
  PSY.last=psSnap(p,av);psStore();clearTimeout(psSaved.t);psSaved.t=setTimeout(()=>{try{nubePut('perfil',Object.assign({},PSY.own))}catch(e){}},700)}
/* juntar lo de todos los aparatos en el perfil de aquí */
function psMerge(p,av){if(!PSY)return null;psCur();const L=[PSY.own].concat(Object.values(PSY.oth||{})).filter(x=>x&&typeof x==='object');p.c=psO(p.c);const c={};let coin=0,st=null,lw=null,best=null,first=null;
  L.forEach(o=>{const oc=psO(o.c);for(const k in oc){const v=+oc[k]||0;if(PSMX.includes(k))c[k]=Math.max(c[k]||0,v);else if(!PSLW.includes(k))c[k]=(c[k]||0)+v}coin+=+o.coin||0;
    if(Array.isArray(o.st)&&(!st||o.st[1]>st[1]))st=o.st;if(o.t&&(!lw||o.t>lw.t))lw=o;if(o.best!=null&&(best==null||o.best<best))best=o.best;if(o.lt&&o.u&&(!first||o.lt<first.lt))first=o});
  if(st)c.streak=st[0];else if(p.c.streak!=null)c.streak=p.c.streak;p.c=c;p.coin=Math.max(0,Math.round(coin));
  PSSETS.forEach(k=>{const m={};L.forEach(o=>Object.assign(m,psO(o[k])));p[k]=m});if(best!=null)p.best=best;if(L.some(o=>o.cre))p.cre=1;
  const day=L.reduce((a,o)=>(o.day||'')>a?o.day:a,'');if(day)p.day=day;
  if(lw){if(lw.eq)p.eq=typeof eqClean==='function'?eqClean(lw.eq):lw.eq;if(typeof lw.nm==='string'&&lw.nm)p.nm=lw.nm;if(lw.av)av=lw.av}
  if(first&&typeof first.u==='string'&&first.u&&psLS.get('bt-uid','')!==first.u)psLS.set('bt-uid',first.u);
  PSY.last=psSnap(p,av);psStore();return{p,av}}
/* conectarse: hooks = {get:()=>perfil, av:()=>animalito, put:(perfil,animalito)=>guardar sin volver a subir, changed:()=>redibujar} */
async function psStart(h){PSH=h;if(!PSY)return;if(!PSY.last)PSY.last=psSnap(h.get(),h.av());try{await nubeJoin('perfil',PSY.m+'|perfil','p_'+PSY.dev,(slot,d)=>{if(!/^p_[a-z0-9]{6,12}$/.test(slot)||slot==='p_'+PSY.dev)return;psCur();PSY.oth[slot]=d;psStore();
    const p=PSH.get(),r=psMerge(p,PSH.av());if(r){PSH.put(r.p,r.av);if(PSH.changed)try{PSH.changed()}catch(e){}}});nubePut('perfil',Object.assign({},PSY.own))}catch(e){}}
function psLink(code){const p=PSH.get(),av=PSH.av();if(PSY)nubeLeave('perfil');psNew(code,p,av,true);return psStart(PSH)}
function psUnlink(){PSY=null;try{localStorage.removeItem('bt-psync')}catch(e){}nubeLeave('perfil')}
