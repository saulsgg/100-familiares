/* ===================== LA NUBE: lo que se comparte entre tus aparatos (compu, celular, tele) =====================
   Usa los mismos servidores públicos de mensajes del juego. Cada aparato guarda SU parte en un mensaje "retenido"
   (el servidor se queda con el último) y lee la de los demás. Todo va cifrado con la clave del grupo: sin la
   clave nadie puede leer los nombres. Si un servidor borra algo, cada aparato vuelve a subir lo que tiene. */
const NUBE={cs:[],sp:{},up:0,ok:0,at:0};
const nubeB64=u=>{let s='';for(let i=0;i<u.length;i+=4096)s+=String.fromCharCode.apply(null,u.subarray(i,i+4096));return btoa(s)};
const nubeU8=t=>{const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
async function nubeHex(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function nubeKey(sec){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(sec),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('100familiares-nube'),iterations:30000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function nubeEnc(key,obj){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(obj)))),o=new Uint8Array(12+ct.length);o.set(iv);o.set(ct,12);return nubeB64(o)}
async function nubeDec(key,t){const u=nubeU8(t);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:u.subarray(0,12)},key,u.subarray(12))))}
const nubeTopic=(S,slot)=>'fam100dijeron/nube/'+S.tid+'/'+slot;
function nubeConnect(){if(NUBE.cs.length||typeof Paho==='undefined')return;
  BROKERS.forEach((u,i)=>{const B={u,i,c:null,up:false,wait:2000};NUBE.cs.push(B);
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
  if(slot===S.mine){if(S.own&&raw!==S.own.raw){try{const d=await nubeDec(S.key,raw);if(d.v>S.own.v&&S.onSlot)S.onSlot(slot,d,raw)}catch(e){}}return}
  const c=S.cache[slot];if(c&&c.raw===raw){c.seen=1;return}let d;try{d=await nubeDec(S.key,raw)}catch(e){return}
  if(!d||typeof d!=='object'||(c&&c.v>=d.v)){if(c)c.seen=1;return}S.cache[slot]={slot,v:d.v,raw,seen:1};NUBE.ok++;NUBE.at=Date.now();if(S.onSlot)S.onSlot(slot,d,raw)}
/* para que otro aparato use los mismos grupos: un código de palabras fácil de escribir */
const NUBEW=['luna','sol','tigre','mango','faro','nube','rayo','coco','perla','trueno','lima','oso','foca','pino','rio','miel','kiwi','loro','nopal','cielo','fresa','gato','lobo','mar','roca','salsa','taco','uva','vaca','zorro','bola','dado','flor','gema','hoja','isla','jade','lago','mapa','nido','ola','pera','queso','rana','seda','tren','vela','yate'];
function nubeCode(){const r=crypto.getRandomValues(new Uint32Array(5));return[0,1,2,3].map(i=>NUBEW[r[i]%NUBEW.length]).join('-')+'-'+String(10+r[4]%90)}
const nubeNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const nubeValid=s=>/^([a-z]+-){4}\d{2}$/.test(s);
