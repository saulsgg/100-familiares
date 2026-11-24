/* 100 Familiares · Botones en vivo
   La pantalla grande abre una partida con un código de 4 letras.
   Pantalla y celulares se hablan por un servidor de mensajes en internet (MQTT por WebSocket):
   así funciona en cualquier Wi-Fi o con datos, sin depender de que los aparatos se "vean" entre sí.
   Para que sea justo, cada celular mide su propio tiempo desde que A ÉL le salió el ¡YA!,
   así no importa si el internet de uno va un poquito más lento. */
{
'use strict';
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const later=(ms,f)=>setTimeout(f,ms);
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const NAMES=['Turquesas','Dorados'],TCOL=['#3fe0cc','#ffc42e'];
const losN=(t,cap)=>{const n=NAMES[t];return /^(los|las|el|la)\s/i.test(n)?n:(cap?'Los ':'los ')+n};

const ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LOCAL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
/* servidores públicos de mensajes; si uno falla, se usa el siguiente */
const BROKERS=LOCAL?['ws://127.0.0.1:8883/mqtt']:['wss://broker.hivemq.com:8884/mqtt','wss://broker.emqx.io:8084/mqtt','wss://test.mosquitto.org:8081/mqtt'];
const NS='fam100dijeron/v1/';
const sec=ms=>(Math.max(0,ms)/1000).toFixed(2)+' s';
const yaWait=()=>{const r=Math.random();return r<.3?600+Math.random()*700:r<.7?1600+Math.random()*1400:3300+Math.random()*2200};
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const rid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=later(3600,()=>t.classList.remove('on'))}
function setStat(sel,text,cls){const p=$(sel);p.textContent=text;p.className='pill '+(cls||'')}

/* ===================== CONEXIÓN ===================== */
/* o: {id, bi (servidor), rotate (probar otro si falla), subs, onMsg, onUp, onDown} */
function Net(o){
  const N={c:null,up:false,bi:o.bi||0,fails:0,closed:false,
    pub(t,m,q,ret){if(!N.up||!N.c)return false;try{N.c.send(t,JSON.stringify(m),q||0,!!ret);return true}catch(e){return false}},
    close(){N.closed=true;N.up=false;try{N.c&&N.c.isConnected()&&N.c.disconnect()}catch(e){}}};
  function go(){if(N.closed)return;const uri=BROKERS[N.bi%BROKERS.length];let c;
    try{c=new Paho.Client(uri,(o.id+'-'+Math.random().toString(36).slice(2,8)).slice(0,23))}catch(e){fail();return}
    N.c=c;
    c.onMessageArrived=msg=>{if(N.c!==c)return;let m;try{m=JSON.parse(msg.payloadString)}catch(e){return}if(m&&typeof m==='object')o.onMsg(msg.destinationName,m)};
    c.onConnectionLost=()=>{if(N.c!==c||N.closed)return;N.up=false;o.onDown&&o.onDown('lost');later(1200,go)};
    const opts={timeout:7,keepAliveInterval:20,cleanSession:true,mqttVersion:4,
      onSuccess:()=>{if(N.c!==c)return;N.fails=0;let n=o.subs.length;const done=()=>{N.up=true;o.onUp&&o.onUp(N.bi%BROKERS.length)};if(!n)done();
        o.subs.forEach(s=>c.subscribe(s,{qos:1,onSuccess:()=>{if(--n===0)done()},onFailure:()=>{if(--n===0)done()}}))},
      onFailure:()=>{if(N.c===c)fail()}};
    if(uri.startsWith('wss'))opts.useSSL=true;
    try{c.connect(opts)}catch(e){fail()}}
  function fail(){N.fails++;if(o.rotate)N.bi++;o.onDown&&o.onDown('fail');if(!N.closed)later(Math.min(5000,700+N.fails*500),go)}
  N.switchTo=bi=>{N.bi=bi;const c=N.c;N.c=null;N.up=false;try{c&&c.isConnected()&&c.disconnect()}catch(e){}go()};
  go();return N}

/* conexión directa entre la pantalla y cada celular (cuando el Wi-Fi lo permite): casi sin retraso.
   Se arregla por el servidor de mensajes; si no se logra, todo sigue por el servidor. */
const ICE=LOCAL?[]:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun.cloudflare.com:3478']},
  {urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
const RTC_OK=typeof RTCPeerConnection==='function';
function gathered(pc,ms){return new Promise(ok=>{if(pc.iceGatheringState==='complete')return ok();const t=later(ms,ok);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);ok()}})})}
function dcOpen(dc){return dc&&dc.readyState==='open'}
async function pathType(pc){try{const st=await pc.getStats();let pair=null;
  st.forEach(r=>{if(r.type==='transport'&&r.selectedCandidatePairId)pair=st.get(r.selectedCandidatePairId)});
  if(!pair)st.forEach(r=>{if(r.type==='candidate-pair'&&r.state==='succeeded'&&(r.nominated||r.selected))pair=r});
  if(!pair)return'';const l=st.get(pair.localCandidateId),m=st.get(pair.remoteCandidateId),t=[l&&l.candidateType,m&&m.candidateType];
  return t.includes('relay')?'relevo':t[0]==='host'&&t[1]==='host'?'casa':'internet'}catch(e){return''}}
const KIND={casa:'directo por Wi-Fi',internet:'directo por internet',relevo:'por relevo'};
/* busca el servidor de mensajes que responde más rápido desde aquí */
function fastestBroker(){if(BROKERS.length<2)return Promise.resolve(0);return new Promise(ok=>{let done=false;const cs=[];
  const fin=i=>{if(done)return;done=true;ok(i);cs.forEach(c=>{try{c.isConnected()&&c.disconnect()}catch(e){}})};
  BROKERS.forEach((u,i)=>{try{const c=new Paho.Client(u,'t'+Math.random().toString(36).slice(2,10));cs.push(c);c.connect({timeout:5,keepAliveInterval:30,cleanSession:true,mqttVersion:4,useSSL:u.startsWith('wss'),onSuccess:()=>fin(i),onFailure:()=>{}})}catch(e){}});
  later(5500,()=>fin(LS.get('bt-bi',0)))})}

/* ===================== SONIDO ===================== */
let AC=null,OUT=null,loading=null;const BUF={};
const FILES=['lr','ya','bz0','bz1','fin','rec','went','ok1','top1','pts','flap2','peg','thr','wx1','wx2','wx3','wx4'];
/* sonidos de la pantalla del juego (se cargan cuando el juego se ve en el celular) */
const FILES2=['pa','flap','qok','cinta_4','tic','tac','cd1','cd2','cd3','cd4','cd5','grow','tmo','med','medf','cmd'];if(!FILES.includes('grow'))FILES.push('grow');
/* silenciar este celular (se guarda; las vibraciones siguen) */
let MUTED=!!LS.get('bt-mute',false);
function muteSet(on){MUTED=!!on;LS.set('bt-mute',MUTED);if(OUT)OUT.gain.value=MUTED?0:1;const b=$('#mutek');if(b){b.textContent=MUTED?'🔇':'🔊';b.setAttribute('aria-pressed',String(MUTED));b.setAttribute('aria-label',MUTED?'Activar el sonido de este celular':'Silenciar este celular')}}
function ac(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();const c=AC.createDynamicsCompressor();c.threshold.value=-8;c.ratio.value=12;c.connect(AC.destination);OUT=AC.createGain();OUT.gain.value=MUTED?0:1;OUT.connect(c)}if(AC.state==='suspended')AC.resume();return true}catch(e){return false}}
function loadSounds(){if(loading)return loading;if(!ac())return Promise.resolve();loading=Promise.all(FILES.map(f=>fetch('sounds/'+f+'.mp3').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise((ok,ko)=>AC.decodeAudioData(b,ok,ko))).then(b=>{BUF[f]=b}).catch(()=>{})));return loading}
function loadOne(n){if(BUF[n]||BUF['_'+n]||!ac())return;BUF['_'+n]=1;fetch('sounds/'+n+'.mp3').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise((ok,ko)=>AC.decodeAudioData(b,ok,ko))).then(b=>{BUF[n]=b}).catch(()=>{delete BUF['_'+n]})}
/* el grito del animalito de cada equipo (cuando se adelantan) */
function animal(id,vol){const n='an_'+id;if(BUF[n])sf(n,vol==null?.9:vol);else loadOne(n)}
const preAnimals=ids=>ids.forEach(id=>loadOne('an_'+id));
function sf(n,vol){if(!AC||!BUF[n])return;try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=BUF[n];g.gain.value=vol==null?.85:vol;s.connect(g);g.connect(OUT);s.start()}catch(e){}}
function tick(){if(!AC)return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(900,t);o.frequency.exponentialRampToValueAtTime(260,t+.07);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);g.connect(OUT);o.start(t);o.stop(t+.12)}catch(e){}}
document.addEventListener('pointerdown',()=>{ac();loadSounds()},{capture:true});

/* la pantalla no se apaga mientras juegan */
let WL=null,MODE='';
async function wake(){try{if('wakeLock' in navigator&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&MODE)wake()});
function show(v){['home','host','play'].forEach(k=>$('#v-'+k).hidden=k!==v);scrollTo(0,0)}
function spk(el,n,cols){if(RM()||!el)return;if(document.documentElement.classList.contains('lite'))n=Math.ceil(n*.35);const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(let i=0;i<n;i++){const p=document.createElement('i');p.className='spk';p.style.cssText=`left:${cx}px;top:${cy}px;background:${cols[i%cols.length]};box-shadow:0 0 8px ${cols[i%cols.length]}`;document.body.appendChild(p);
    const a=Math.random()*Math.PI*2,d=r.width*.45+Math.random()*r.width*.55;p.animate([{transform:'translate(-50%,-50%) scale(1.3)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(.2)`,opacity:0}],{duration:600+Math.random()*450,easing:'cubic-bezier(.15,.7,.35,1)'}).onfinish=()=>p.remove()}}
function pop(el,ms){if(RM()||!el)return;el.animate([{transform:'scale(.4)',opacity:0},{transform:'scale(1.12)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:ms||450,easing:'cubic-bezier(.3,1.5,.5,1)'})}
function shake(el){if(RM()||!el)return;el.animate([0,-12,12,-9,7,-4,0].map(x=>({transform:`translateX(${x}px) rotate(${x*.6}deg)`})),{duration:460,easing:'ease-out'})}

/* ===================== PANTALLA GRANDE ===================== */
const H={raceTok:0,raceAt:0,net:null,code:'',bi:0,P:new Map(),mem:{},av:(a=>Array.isArray(a)&&a.length===2&&AVM[a[0]]&&AVM[a[1]]&&a[0]!==a[1]?a:['ajolote','jaguar'])(LS.get('bt-av',null)),
  foul:LS.get('bt-foul',true),r:0,phase:'lobby',T:[],presses:[],res:null,first:0,early:null,pingT:0,resAt:0,lat:0};
function newCode(){let s='';for(let i=0;i<4;i++)s+=ABC[Math.floor(Math.random()*ABC.length)];return s}
const tp=(code,k)=>NS+code+'/'+k;
function hostStart(){MODE='host';show('host');wake();drawRule();drawTeams();
  const code=LS.get('bt-code',null)||newCode();H.code=code;$('#hcode').textContent=code;$('#qr').innerHTML='';$('#hlink').textContent='';setStat('#hstat','Conectando…','');
  setStat('#hstat','Buscando el servidor más rápido…','');
  fastestBroker().then(bi=>{if(MODE!=='host')return;H.net=Net({id:'h'+code,bi,rotate:true,subs:[tp(code,'h')],onMsg:hostMsg,
    onUp:bi=>{H.bi=bi;LS.set('bt-code',code);LS.set('bt-bi',bi);setStat('#hstat','Listos para jugadores','ok');drawQR();hostUp()},
    onDown:why=>{setStat('#hstat',why==='fail'?'Buscando servidor…':'Reconectando…','bad')}})});
  clearInterval(H.pingT);H.pingT=setInterval(pingAll,2000)}
/* aviso guardado en el servidor: "aquí hay pantalla grande" (los celulares lo ven al llegar) */
function hostUp(){H.net.pub(tp(H.code,'up'),{t:'up',at:Date.now()},1,true);bcastState()}
function hostStop(){clearHT();clearInterval(H.pingT);H.P.forEach(dropRTC);if(H.net){H.net.pub(tp(H.code,'up'),{t:'down'},1,true);const n=H.net;later(300,()=>n.close())}H.net=null;H.P.clear();H.phase='lobby';MODE='';show('home')}
function joinURL(){return location.origin+location.pathname.replace(/index\.html$/,'')+'#j='+H.code+'-'+H.bi}
function drawQR(){const u=joinURL();$('#hlink').textContent=u.replace(/^https?:\/\//,'');try{const q=qrcode(0,'M');q.addData(u);q.make();$('#qr').innerHTML=q.createSvgTag({cellSize:8,margin:2,scalable:true,alt:'Código QR para unirse a la partida'})}catch(e){$('#qr').textContent=''}}
function toP(p,m,q){if(p.dc&&dcOpen(p.dc)){try{p.dc.send(JSON.stringify(m));return}catch(e){}}if(H.net)H.net.pub(tp(H.code,'p/'+p.uid),m,q||0)}
function bcast(m,q){H.P.forEach(p=>toP(p,m,q))}
function hostMsg(topic,m){const uid=String(m.u||'').slice(0,40);if(!uid)return;
  if(m.t==='hello'){const old=H.P.get(uid),tm=old?old.team:H.mem[uid]!=null?H.mem[uid]:(m.team===0||m.team===1?m.team:-1);
    H.P.set(uid,{uid,name:String(m.name||'Jugador').slice(0,14),team:tm,av:AVM[m.av]?String(m.av):old?old.av:null,ping:old?old.ping:null,last:performance.now()});H.mem[uid]=tm;sendState(uid);drawTeams();if(!old&&H.phase==='lobby')sf('went',.4);
    /* si entra a media ronda, que vea el resultado */
    if(H.res&&H.phase==='res')toP(H.P.get(uid),{t:'res',r:H.r,...H.res});return}
  const pl=H.P.get(uid);if(!pl){toP({uid},{t:'who'});return}
  pl.last=performance.now();
  if(m.t==='me'){if(AVM[m.av])pl.av=String(m.av);drawTeams();return}
  if(m.t==='team'&&(m.team===0||m.team===1||m.team===-1)){pl.team=m.team;H.mem[uid]=m.team;drawTeams();bcastState();return}
  if(m.t==='pong'){const v=performance.now()-(+m.ts||0);if(v>=0&&v<20000){pl.rtts=(pl.rtts||[]).concat(v).slice(-6);pl.ping=Math.round(Math.min(...pl.rtts))}drawTeams();return}
  if(m.t==='bye'){dropRTC(pl);H.P.delete(uid);drawTeams();bcastState();return}
  if(m.t==='rtc-offer'){hostRTC(pl,m);return}
  if(m.t==='early')onEarly(pl,m);else if(m.t==='press')onPress(pl,m)}
function dropRTC(p){try{p.pc&&p.pc.close()}catch(e){}p.pc=null;p.dc=null}
async function hostRTC(p,m){if(!RTC_OK||typeof m.sdp!=='string')return;dropRTC(p);const pc=new RTCPeerConnection({iceServers:ICE});p.pc=pc;
  pc.ondatachannel=e=>{const dc=e.channel;dc.onopen=()=>{if(p.pc!==pc)return;p.dc=dc;p.ping=null;p.rtts=[];drawTeams();later(800,async()=>{p.kind=await pathType(pc);drawTeams()})};dc.onclose=()=>{if(p.dc===dc){p.dc=null;p.rtts=[];drawTeams()}};
    dc.onmessage=ev=>{let x;try{x=JSON.parse(ev.data)}catch(er){return}if(x&&typeof x==='object'){x.u=p.uid;hostMsg('dc',x)}}};
  try{await pc.setRemoteDescription({type:'offer',sdp:m.sdp});await pc.setLocalDescription(await pc.createAnswer());await gathered(pc,2500);
    if(p.pc===pc&&H.net)H.net.pub(tp(H.code,'p/'+p.uid),{t:'rtc-answer',sdp:pc.localDescription.sdp},1)}catch(e){dropRTC(p)}}
const players=()=>[...H.P.values()];
const sigCls=p=>p==null?'':p<120?'good':p<300?'mid':'slow';
function drawTeams(){const L=players();
  $('#teams').innerHTML=[0,1].map(t=>{const ps=L.filter(p=>p.team===t);return `<div class="team" style="--tc:${TCOL[t]}"><header><button type="button" class="tav" data-t="${t}" aria-label="Cambiar el animalito de ${NAMES[t]}">${avSVG(H.av[t])}</button><h3>${NAMES[t]}<small>${ps.length} ${ps.length===1?'jugador':'jugadores'}</small></h3></header><ul class="plist">${ps.length?ps.map(p=>`<li>${esc(p.name)}<span class="sig ${sigCls(p.ping)}">${p.ping==null?'…':(dcOpen(p.dc)?(KIND[p.kind]||'directo'):'por servidor')+' · '+p.ping+' ms'}</span></li>`).join(''):'<li class="empty">Aún nadie. Escaneen el QR.</li>'}</ul></div>`}).join('')+
    (L.some(p=>p.team<0)?`<p class="waiting">Escogiendo equipo: ${L.filter(p=>p.team<0).map(p=>esc(p.name)).join(', ')}</p>`:'');
  if(!$('#arena').hidden)drawSides()}
function stateMsg(){return{t:'state',av:H.av,foul:H.foul,counts:[0,1].map(t=>players().filter(p=>p.team===t).length)}}
function sendState(uid){const p=H.P.get(uid);if(p)toP(p,{...stateMsg(),team:p.team},1)}
function bcastState(){H.P.forEach(p=>toP(p,{...stateMsg(),team:p.team}))}
function pingAll(){if(!H.net||!H.net.up)return;const now=performance.now();let gone=false;
  H.P.forEach((p,k)=>{if(now-(p.last||now)>9000){dropRTC(p);H.P.delete(k);gone=true}});if(gone){drawTeams();bcastState()}
  bcast({t:'ping',ts:now});
  /* retraso típico de ida (la mitad de la vuelta) para que el semáforo de la tele vaya parejo con los celulares */
  const best=players().filter(p=>p.rtts&&p.rtts.length).map(p=>Math.min(...p.rtts)).sort((a,b)=>a-b);H.lat=best.length?Math.min(300,best[best.length-1]/2):0;
  if(H.phase==='lobby'&&Math.random()<.2)hostUp()}
function drawRule(){$$('#rule button').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.r==='foul')===H.foul)))}
function clearHT(){H.T.forEach(clearTimeout);H.T=[];clearTimeout(H.dT)}
function showArena(on){$('#lobby').hidden=on;$('#arena').hidden=!on;$('#lobbyb').hidden=!on;if(on)drawSides(true)}
function drawSides(full){const L=players();[0,1].forEach(t=>{const s=$(t?'#sideB':'#sideA');s.style.setProperty('--tc',TCOL[t]);const n=L.filter(p=>p.team===t).length,txt=`${n} ${n===1?'jugador':'jugadores'}`;
  if(full||!$('.sav',s))s.innerHTML=`<div class="sav">${avSVG(H.av[t])}</div><b>${NAMES[t]}</b><small>${txt}</small>`;else $('small',s).textContent=txt})}
function lamp(k,c,col){const l=$$('#lamps i')[k];l.className=c;if(col)l.style.setProperty('--wc',col);if(!RM())l.animate([{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:220})}
function semt(text,cls,col){const s=$('#semt');s.textContent=text;s.className='semt '+(cls||'');if(col)s.style.setProperty('--wc',col);pop(s,380)}
function hostGo(){ac();loadSounds();preAnimals(H.av);if(!H.net||!H.net.up){toast('Todavía me estoy conectando. Espera tantito.');return}
  if(!players().some(p=>p.team>=0)){toast('Aún no hay jugadores con equipo: que escaneen el QR.');return}
  clearHT();H.r++;H.phase='arm';H.presses=[];H.res=null;H.first=0;H.early=null;
  const lights=[900,1500,2100],d=2100+yaWait(),lat=Math.round(H.lat);
  H.armAt=performance.now();H.d=d;bcast({t:'arm',r:H.r,lights,d,foul:H.foul},1);
  showArena(true);$('#result').hidden=true;$$('#arena .stamp').forEach(s=>s.remove());$$('.side').forEach(s=>s.classList.remove('win','lose','foul'));$$('#lamps i').forEach(l=>{l.className='';l.style.removeProperty('--wc')});semt('Prepárense…','');
  $('#go').disabled=true;$('#go').textContent='En juego…';
  lights.forEach((ms,k)=>H.T.push(later(ms+lat,()=>{if(H.phase==='arm'){lamp(k,'r');sf('lr',.6)}})));
  H.T.push(later(d+lat,()=>{if(H.phase!=='arm')return;H.phase='go';$$('#lamps i').forEach(l=>l.className='g');semt('¡YA!','go');sf('ya',.85);
    H.T.push(later(7000,()=>{if(H.phase==='go')finish('none')}))}))}
function onEarly(pl,m){if(m.r!==H.r||!H.foul||pl.team<0||(H.phase!=='arm'&&H.phase!=='go'))return;H.early={uid:pl.uid,name:pl.name,team:pl.team,before:Math.max(0,Math.min(15000,+m.before||0))};finish('foul')}
function onPress(pl,m){const rt=+m.rt;if(m.r!==H.r||pl.team<0||!(rt>=0&&rt<15000)||H.presses.some(p=>p.uid===pl.uid))return;
  H.presses.push({uid:pl.uid,name:pl.name,team:pl.team,av:pl.av||null,rt:Math.round(rt)});
  /* se espera un ratito por si el toque más rápido viene de un celular con internet más lento */
  if(H.phase==='arm'||H.phase==='go'){if(!H.first)H.first=performance.now();decideSoon()}
  else if(H.phase==='res'&&H.res&&H.res.kind==='ok'&&performance.now()-H.resAt<2200){H.res.list=sorted();
    /* si el que llegó tarde en realidad fue más rápido, se corrige el ganador */
    const b=H.res.list[0];if(b.team!==H.res.win){H.res.win=b.team;drawResult(true)}else drawResult(false);bcast({t:'res',r:H.r,...H.res},1)}}
const sorted=()=>H.presses.slice().sort((a,b)=>a.rt-b.rt);
/* un toque más rápido que el mejor de ahorita llegaría, a más tardar, a: envío + espera + su tiempo + la vuelta de su conexión */
const rttOf=p=>{const r=(p.rtts||[]).slice().sort((a,b)=>a-b);return r.length?r[Math.floor(r.length/2)]:800};
function decideSoon(){clearTimeout(H.dT);const best=Math.min(...H.presses.map(p=>p.rt)),now=performance.now();
  const wait=players().filter(p=>p.team>=0&&!H.presses.some(x=>x.uid===p.uid)).map(p=>H.armAt+H.d+best+rttOf(p)*1.2+80);
  const at=Math.min(H.first+1200,Math.max(now+30,...wait));H.dT=later(Math.max(0,at-now),()=>finish('ok'))}
function finish(kind){if(H.phase==='res'||H.phase==='lobby')return;clearHT();clearTimeout(H.dT);H.phase='res';H.resAt=performance.now();
  if(kind==='foul'){const f=H.early;H.res={kind:'foul',win:1-f.team,foul:f,list:[]}}
  else{const L=sorted();H.res=L.length?{kind:'ok',win:L[0].team,list:L}:{kind:'none',win:-1,list:[]}}
  if(H.res.kind==='ok'){const rec=LS.get('bt-rec',null),b=H.res.list[0];if(!rec||b.rt<rec.rt){H.res.rec={rt:b.rt,name:b.name,nuevo:true};LS.set('bt-rec',{rt:b.rt,name:b.name})}else H.res.rec={rt:rec.rt,name:rec.name,nuevo:false}}
  bcast({t:'res',r:H.r,...H.res},1);drawResult(true);
  later(900,()=>{$('#go').disabled=false;$('#go').textContent='¡Otra vez!'})}
function drawResult(first){const R=H.res,box=$('#result');
  if(first){const sides=[$('#sideA'),$('#sideB')];sides.forEach(s=>s.classList.remove('win','lose'));
    if(R.kind==='foul'){const f=R.foul;sides[f.team].classList.add('foul','lose');$$('#lamps i').forEach(l=>l.className='r');semt('¡FALTA!','fl');animal(H.av[f.team],1);
      const st=document.createElement('div');st.className='stamp';st.textContent='¡SE ADELANTÓ!';sides[f.team].appendChild(st);pop(st,520);shake(sides[f.team]);
      H.T.push(later(1000,()=>{sides[R.win].classList.add('win');$$('#lamps i').forEach((l,k)=>lamp(k,'t',TCOL[R.win]));semt(`¡Turno de ${NAMES[R.win]}!`,'wn',TCOL[R.win]);sf('bz'+R.win,.9);spk($('.sav',sides[R.win]),26,[TCOL[R.win],'#fff','#fff3c4'])}))}
    else if(R.kind==='ok'){sides[R.win].classList.add('win');sides[1-R.win].classList.add('lose');$$('#lamps i').forEach((l,k)=>lamp(k,'t',TCOL[R.win]));semt(`¡${NAMES[R.win]}!`,'wn',TCOL[R.win]);sf('bz'+R.win,.9);spk($('.sav',sides[R.win]),26,[TCOL[R.win],'#fff','#fff3c4'])}
    else{semt('Nadie tocó','')}}
  let h='';
  if(R.kind==='foul'){const f=R.foul;h=`<h3>Se adelantó</h3><p class="foulx">${esc(f.name)} (${NAMES[f.team]}) tocó <b>${sec(f.before)}</b> antes del ¡YA!</p><p class="verdict">Le toca a ${NAMES[R.win]}</p>`}
  else if(R.kind==='ok'){const L=R.list.slice(0,8),b=L[0],o=R.list.find(p=>p.team!==b.team);
    h=`<h3>🏇 Foto finish</h3>`+raceHTML(L,H.av,TCOL)+
      `<p class="verdict">${o?`¡${esc(b.name)} le ganó a ${NAMES[o.team]} por ${sec(o.rt-b.rt)}!`:`¡${esc(b.name)} fue el más rápido!`}</p>`+
      (R.rec?(R.rec.nuevo?`<span class="rec">¡Nuevo récord! ${sec(R.rec.rt)}</span>`:`<span class="rc">Récord: ${sec(R.rec.rt)} (${esc(R.rec.name)})</span>`):'')}
  else h=`<h3>Nadie tocó</h3><p class="verdict">Toquen “Otra vez” para repetir.</p>`;
  box.innerHTML=h;box.hidden=false;if(first&&!RM()){box.animate([{opacity:0,transform:'translateY(20px) scale(.95)'},{opacity:1,transform:'none'}],{duration:420,delay:R.kind==='foul'?900:300,fill:'backwards',easing:'cubic-bezier(.3,1.4,.5,1)'})}
  /* carrera de caballitos: arranca cuando aparece la tarjeta; si alguien tocó tarde, sigue donde iba */
  if(R.kind==='ok'){const L=R.list.slice(0,8),tok=++H.raceTok;if(first)H.raceAt=performance.now()+(RM()?0:300);const v=$('.verdict',box),snd=()=>sf(R.rec&&R.rec.nuevo?'rec':'fin',.7);
    if(first&&!RM())v.style.opacity=0;
    const go=()=>{if(tok!==H.raceTok)return;const rr=raceRun(box,L,!RM(),snd,Math.max(0,performance.now()-H.raceAt));if(first&&!rr.first)snd();
      if(first&&rr.first)later(rr.first+150,()=>{v.style.opacity='';v.animate([{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.3,1.5,.5,1)'})});else v.style.opacity=''};
    const w=H.raceAt-performance.now();if(w>0)later(w,go);else go()}}
function backToLobby(){if(H.phase==='arm'||H.phase==='go')bcast({t:'cancel'},1);clearHT();H.phase='lobby';showArena(false);$('#go').disabled=false;$('#go').textContent='¡Probar botones!';drawTeams()}
/* escoger animalito de cada equipo */
let SHEET=0;
function openSheet(t){if(t==='me'){myAvSheet();return}SHEET=t;const s=$('#avsheet');s.style.setProperty('--tc',TCOL[t]);$('#avtitle').textContent='Animalito de '+NAMES[t];
  $('#avg').innerHTML=avList(H.av).map(a=>`<button type="button" data-av="${a.id}" aria-pressed="${H.av[t]===a.id}" class="${H.av[1-t]===a.id?'taken':''}${a.secret?' av-sec':''}" ${H.av[1-t]===a.id?'disabled':''}><i>${avSVG(a.id)}</i>${a.n}</button>`).join('');s.hidden=false}
/* truco secreto: tocar 5 veces el título de la hoja */
$('#avtitle').addEventListener('click',()=>avSecretTap($('#avtitle'),()=>{openSheet(SHEET);sf('rec',.8);toast('🥚 ¡Encontraste los íconos secretos!');$$('#avg .av-sec').forEach((b,k)=>{b.classList.add('av-new');later(k*140,()=>spk(b,14,['#ffd23f','#fff','#ff5c9a']))})}));
/* tu animalito (jugador) */
function myAvSheet(){SHEET='me';const s=$('#avsheet');s.style.setProperty('--tc',TCOL[P.team>=0?P.team:0]);$('#avtitle').textContent='Tu animalito';
  $('#avg').innerHTML=avList([P.av]).map(a=>`<button type="button" data-av="${a.id}" aria-pressed="${P.av===a.id}" class="${a.secret?'av-sec':''}"><i>${avSVG(a.id)}</i>${a.n}</button>`).join('');s.hidden=false}
function myAvSet(id){if(!AVM[id])return;P.av=id;LS.set('bt-myav',id);drawMe();preAnimals([id]);psend({t:'me',av:id},1);animal(id,.7)}
$('#myavb').addEventListener('click',()=>{ac();loadSounds();myAvSheet()});
$('#me').addEventListener('click',()=>{if(MODE!=='play'||['arm','go','wait'].includes(P.phase)||!$('#ask').hidden)return;ac();loadSounds();myAvSheet()});
$('#avg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(SHEET==='me'){myAvSet(b.dataset.av);myAvSheet();return}H.av[SHEET]=b.dataset.av;LS.set('bt-av',H.av);openSheet(SHEET);drawTeams();bcastState()});
$('#avclose').addEventListener('click',()=>{$('#avsheet').hidden=true});
$('#avsheet').addEventListener('click',e=>{if(e.target.id==='avsheet')$('#avsheet').hidden=true});
$('#teams').addEventListener('click',e=>{const b=e.target.closest('.tav');if(b)openSheet(+b.dataset.t)});
$('#rule').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;H.foul=b.dataset.r==='foul';LS.set('bt-foul',H.foul);drawRule();bcastState()});
$('#go').addEventListener('click',hostGo);
$('#lobbyb').addEventListener('click',backToLobby);
$('#hback').addEventListener('click',hostStop);

/* ===================== JUGADOR ===================== */
const P={net:null,code:'',bi:-1,name:LS.get('bt-name',''),uid:LS.get('bt-uid',null)||rid(),team:-1,st:null,phase:'idle',r:0,T:[],yaAt:0,lock:0,q:0,foul:true,
  lastHost:0,helloT:0,probeT:0,rt:0,resT:0,lateUntil:0,found:false};
LS.set('bt-uid',P.uid);
const ptp=k=>NS+P.code+'/'+k;
function playStart(code,name,bi){MODE='play';P.code=code;P.name=name;P.st=null;P.found=false;LS.set('bt-name',name);const sv=LS.get('bt-team',null);P.team=sv&&sv.code===code?sv.team:-1;P.spec=!!(sv&&sv.code===code&&sv.spec);
  show('play');wake();drawMe();setStat('#pstat','Conectando…','');$('#pick').hidden=true;$('#pad').hidden=false;P.phase='idle';padState('idle','Conectando con la pantalla grande…',`Partida ${code}`);
  if(P.net)P.net.close();dropP();
  /* si el link trae el servidor, se usa ese; si no, se prueban uno por uno hasta encontrar la pantalla grande */
  P.bi=bi>=0?bi:0;P.fixed=bi>=0;
  P.net=Net({id:'p'+P.uid.slice(0,8),bi:P.bi,rotate:!P.fixed,subs:[ptp('a'),ptp('p/'+P.uid),ptp('up')],onMsg:playMsg,
    onUp:bi=>{P.bi=bi;setStat('#pstat','Buscando la pantalla grande…','');hello();clearTimeout(P.probeT);if(!P.fixed)P.probeT=later(4500,probe)},
    onDown:()=>{setStat('#pstat','Sin internet, reintentando…','bad')}});
  clearInterval(P.helloT);P.helloT=setInterval(()=>{if(!P.net||!P.net.up)return;
    if(!P.found||performance.now()-P.lastHost>7000){if(P.found)setStat('#pstat','Se perdió la pantalla grande…','bad');hello()}},2500)}
/* no está la pantalla grande en este servidor: probar el siguiente */
function probe(){if(P.found||MODE!=='play'||!P.net)return;const nb=(P.bi+1)%BROKERS.length;if(BROKERS.length>1){P.net.switchTo(nb)}
  padState('idle',`Buscando la partida ${P.code}…`,'Revisen que la pantalla grande esté abierta y que el código sea el mismo.');
  clearTimeout(P.probeT);P.probeT=later(5000,probe)}
function hello(){if(P.net)P.net.pub(ptp('h'),{t:'hello',u:P.uid,name:P.name,team:P.team,av:P.av,spec:P.spec?1:0},1)}
function psend(m,q){if(dcOpen(P.dc)){try{P.dc.send(JSON.stringify(m));return}catch(e){}}if(P.net)P.net.pub(ptp('h'),{...m,u:P.uid},q||0)}
function dropP(){try{P.pc&&P.pc.close()}catch(e){}P.pc=null;P.dc=null}
async function playRTC(){if(!RTC_OK||P.pc||MODE!=='play')return;const pc=new RTCPeerConnection({iceServers:ICE});P.pc=pc;const dc=pc.createDataChannel('b',{ordered:true});
  dc.onopen=()=>{if(P.pc!==pc)return;P.dc=dc;P.rtcN=0;setStat('#pstat','Conectado directo','ok');later(800,async()=>{const k=await pathType(pc);if(P.dc===dc)setStat('#pstat',k==='relevo'?'Conectado por relevo':k==='casa'?'Conectado directo (Wi-Fi)':'Conectado directo','ok')})};dc.onclose=()=>{if(P.dc===dc){P.dc=null;setStat('#pstat','Conectado','ok');later(4000,()=>{if(P.pc===pc){dropP();playRTC()}})}};
  dc.onmessage=ev=>{let x;try{x=JSON.parse(ev.data)}catch(e){return}if(x&&typeof x==='object')playMsg('dc',x)};
  try{await pc.setLocalDescription(await pc.createOffer());await gathered(pc,2500);if(P.pc!==pc)return;psend({t:'rtc-offer',sdp:pc.localDescription.sdp},1)}catch(e){dropP();return}
  /* si en 12 s no se abrió, sigue por el servidor y lo vuelve a intentar más tarde (hasta 4 veces) */
  later(12000,()=>{if(P.pc===pc&&!dcOpen(dc)){dropP();P.rtcN=(P.rtcN||0)+1;if(P.rtcN<=4)later(15000*P.rtcN,()=>{if(MODE==='play'&&P.found&&!P.pc&&!dcOpen(P.dc))playRTC()})}})}
/* tu propio animalito (cada jugador escoge el suyo; se guarda en este celular) */
P.av=(a=>AVM[a]?a:(()=>{const L=AVS3.filter(x=>!x.secret);const r=L[Math.floor(Math.random()*L.length)].id;LS.set('bt-myav',r);return r})())(LS.get('bt-myav',''));
const myAv=()=>P.av;
function drawMe(){const t=P.team,v=$('#v-play');v.classList.toggle('t1',t===1);
  $('#me').innerHTML=avSVG(P.av)+`<span>${esc(P.name)}<small>${t>=0?NAMES[t]:P.spec?'👀 Viendo':'Sin equipo'}</small></span>`;
  $('#pav').innerHTML=avSVG(P.av);$('#myavi').innerHTML=avSVG(P.av);
  $('#chteam').hidden=!P.found}
function playMsg(topic,m){
  if(topic.endsWith('/up')){if(m.t==='up'&&!P.found)hello();return}
  P.lastHost=performance.now();
  if(m.t==='ping'){psend({t:'pong',ts:m.ts,pt:performance.now()});return}
  if(m.t==='off'){if(isFinite(+m.off))P.hoff=+m.off;return}
  if(m.t&&m.t.startsWith('adm-')){admMsg(m);return}
  if(m.t==='ev'){const f=$('#gvf');if(VERok&&f.contentWindow)try{f.contentWindow.postMessage({t:'ev',e:m,_d:isFinite(P.hoff)?performance.timeOrigin-P.hoff:null},'*')}catch(e){}return}
  if(m.t==='who'){hello();return}
  if(m.t==='rtc-answer'){if(P.pc&&typeof m.sdp==='string'&&P.pc.signalingState==='have-local-offer')P.pc.setRemoteDescription({type:'answer',sdp:m.sdp}).catch(()=>dropP());return}
  if(m.t==='state'){const firstFound=!P.found,prevT=P.team;P.found=true;setNames(m.names);if(m.info&&m.info.text)P.info=m.info;if(Array.isArray(m.av))preAnimals(m.av);clearTimeout(P.probeT);P.st=m;P.foul=!!m.foul;if(m.team===0||m.team===1){P.team=m.team;P.spec=false;$('#v-play').classList.remove('spec')}else if(m.team===-1)P.team=-1;
    if(!dcOpen(P.dc))setStat('#pstat','Conectado por servidor','ok');drawMe();admHello();admUI();if(firstFound)later(300,playRTC);
    if(P.phase==='idle'||P.phase==='res'){if(P.team<0){if(P.spec)showSpec();else showPick()}else if(P.picking&&prevT<0&&!firstFound){showPad();toast('La pantalla del juego te puso en '+NAMES[P.team]+'.')}else if(P.picking)drawPick();else if(firstFound)showPad();else gvShow()}else drawPick();return}
  if(m.t==='info'){P.info={text:m.text,sub:m.sub||''};if(P.found&&P.phase==='idle'&&!$('#pad').hidden){$$('#plamps i').forEach(l=>{l.className='';l.style.removeProperty('--wc')});padState('idle',P.info.text,P.info.sub)}return}
  if(!P.found)return;
  if(m.t==='view'){gvDraw(m);wphView(m);return}
  if(m.t==='wspin'){wphSpin(m);return}
  if(m.t==='warn'){warnMe(+m.team);return}
  if(m.t==='fin'){finMe(m);return}
  if(m.t==='cmdno'){toast(m.why||'Ahorita no se puede');vib([40,40,40]);return}
  if(m.t==='cmdok'){vib(30);return}
  if(m.t==='cmdwait'){toast('🤫 Silenciando…');return}
  if(m.t==='hint'){if(m.a===AK.id){const h=$('#askhint');h.textContent=m.text;h.hidden=false;if(!RM())h.animate([{transform:'scale(.6)',opacity:0},{transform:'scale(1.08)',opacity:1,offset:.6},{transform:'none'}],{duration:420})}return}
  if(m.t==='askpause'){askPause(m.a);return}
  if(m.t==='askresume'){askResume(m.a,+m.sec,+m.end);return}
  if(m.t==='chat'){if(m.on)chatOpen(m);else chatClose(m);return}
  if(m.t==='chatm'){chatAdd(m);return}
  if(m.t==='chtyp'){if(m.id===CH.id&&m.uid!==P.uid)CH.ty[m.uid]={name:String(m.name||''),at:performance.now()};return}
  if(m.t==='chclaim'){if(m.id===CH.id){CH.claim={u:m.uid,name:String(m.name||'')};chatClaimDraw();if(m.uid===P.uid)vib([30,30,60])}return}
  if(m.t==='chatclk'){if(m.id===CH.id){chatClk(m.end||null,+m.sec||0);$('#chatok').hidden=CH.kind==='robo'&&!CH.end;if(!$('#chat').classList.contains('min'))chatOpenSub();if(CH.end){vib([60,40,60]);sf('cmd',.8);chatMin(false)}}return}
  if(m.t==='kick'){playStop();toast('La pantalla del juego te sacó de la sala.');return}
  if(m.t==='ask'){showAsk(m);return}if(m.t==='asked'||m.t==='judged'||m.t==='close'||m.t==='lock'){askMsg(m);return}
  if(m.t==='arm'){hideAsk();arm(m)}else if(m.t==='res')onRes(m);else if(m.t==='cancel'){clearPT();P.phase='idle';hideRes();showPad();padState('idle','Esperen la siguiente ronda','')}}
function drawPick(){const st=P.st;$('#pteams').innerHTML=st?[0,1].map(t=>`<button type="button" data-t="${t}" style="--tc:${TCOL[t]}" aria-pressed="${P.team===t}"><i>${avSVG(st.av[t])}</i><b>${NAMES[t]}</b><small>${st.counts[t]} ${st.counts[t]===1?'jugador':'jugadores'}</small></button>`).join(''):'<p>Conectando…</p>'}
function showPick(){P.picking=true;$('#v-play').classList.remove('spec');rxShow();drawPick();$('#pick').hidden=false;$('#pad').hidden=true;gvShow()}
function showPad(){P.picking=false;rxShow();$('#pick').hidden=true;$('#pad').hidden=false;drawMe();gvShow();if(P.phase==='idle'){if(P.info)padState('idle',P.info.text,P.info.sub);else padState('idle','Esperen la siguiente ronda','Cuando la pantalla grande empiece, aquí sale el semáforo')}}
function padState(cls,msg,sub){$('#pad').className='pad '+cls;$('#v-play').dataset.pad=cls;$('#pmsg').textContent=msg;if(sub!=null)$('#psub').textContent=sub}
function plamp(k,c){const l=$$('#plamps i')[k];l.className=c;if(!RM())l.animate([{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:220})}
function clearPT(){P.T.forEach(clearTimeout);P.T=[];clearTimeout(P.q);P.q=0}
function arm(m){clearPT();hideRes();const now0=performance.now(),base=typeof m.at==='number'&&m.at-now0>m.d*.3&&m.at-now0<m.d+3000?m.at-m.d-now0:0;
  P.r=m.r;P.rt=0;P.lateUntil=0;P.foul=!!m.foul;P.phase='wait';P.lock=0;P.yaAt=now0+base+m.d;
  if(P.team<0){if(P.spec)showSpec();else showPick();return}showPad();$$('#plamps i').forEach(l=>{l.className='';l.style.removeProperty('--wc')});
  padState('wait','Prepárense…',P.foul?'Si tocas antes del ¡YA!, tu equipo pierde el turno':'Esperen la luz verde');
  m.lights.forEach((ms,k)=>P.T.push(later(Math.max(0,base+ms),()=>{if(P.phase==='wait'){plamp(k,'r');sf('lr',.35)}})));
  P.T.push(later(Math.max(0,base+m.d),()=>{if(P.phase!=='wait')return;P.phase='go';P.yaAt=performance.now();$$('#plamps i').forEach(l=>l.className='g');padState('go','¡YA!','¡Toca el botón!');sf('ya',.7);vib(70)}))}
/* menos de 0.1 s después del ¡YA! nadie reacciona: eso es adivinar */
const MIN_RT=80;
function press(ts){const pn=performance.now(),now=ts>0&&ts<=pn&&pn-ts<300?ts:pn,dome=$('#dome');
  /* si el dedo tocó justo antes del ¡YA! (aunque el celular lo procese después), cuenta como antes */
  if(P.phase==='go'&&now<P.yaAt-5){P.phase='wait';if(!P.foul){P.phase='go';P.lock=now+400;animal(myAv(),.7);vib(25);shake(dome);$('#psub').textContent='¡Muy pronto! Espera tantito y vuelve a tocar';return}}
  if(P.phase==='go'&&!P.foul&&(P.lock>now||now-P.yaAt<MIN_RT)){if(P.lock<=now){P.lock=now+400;animal(myAv(),.7)}vib(25);shake(dome);$('#psub').textContent='¡Muy pronto! Espera tantito y vuelve a tocar';return}
  if(P.phase==='go'){
    P.phase='sent';P.rt=now-P.yaAt;psend({t:'press',r:P.r,rt:P.rt},1);tick();vib(30);padState('sent','¡Listo!',`Tu tiempo: ${sec(P.rt)}`);spk(dome,22,['#fff','#fff3c4',getComputedStyle($('#v-play')).getPropertyValue('--tc')]);return}
  if(P.phase==='wait'){
    if(P.foul){P.phase='early';psend({t:'early',r:P.r,before:Math.max(0,P.yaAt-now)},1);animal(myAv(),1);vib([60,40,60]);padState('early','¡Te adelantaste!',`Tocaste ${sec(Math.max(0,P.yaAt-now))} antes del ¡YA! · esperen el resultado`);shake(dome);return}
    if(P.lock>now)return;P.lock=now+400;animal(myAv(),.7);vib(25);shake(dome);$('#psub').textContent='¡Todavía no! Espera la luz verde';return}
  if(P.phase==='res'&&now<P.lateUntil){P.lateUntil=0;P.rt=now-P.yaAt;psend({t:'press',r:P.r,rt:P.rt},1);tick();vib(30);const ps=$$('#pres p');if(ps.length)ps[ps.length-1].textContent=`Tu tiempo: ${sec(P.rt)}`;return}
  if(P.phase==='idle'){tick();if(!RM())dome.animate([{transform:'scale(1)'},{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:180})}}
function onRes(m){if(m.r!==P.r){if(P.phase!=='idle')return;P.r=m.r}clearPT();const me=P.team,first=P.phase!=='res';if(P.phase==='go')P.lateUntil=performance.now()+1500;P.phase='res';let cls,big,txt,sub='',av=me>=0&&P.st?P.st.av[me]:null;
  if(m.kind==='foul'){const f=m.foul;if(f.team===me){cls='foul';big='¡Se adelantaron!';txt=(f.uid===P.uid?'Te adelantaste ':`${f.name} se adelantó `)+sec(f.before)+'. Le toca al otro equipo.'}
    else{cls='win';big='¡Les toca!';txt=`${f.name} (${NAMES[f.team]}) se adelantó ${sec(f.before)}.`}}
  else if(m.kind==='none'){cls='lose';big='Nadie tocó';txt='Otra vez será.'}
  else{const L=m.list,pos=L.findIndex(x=>x.uid===P.uid),won=m.win===me;cls=won?'win':'lose';big=won?'¡Ganaron!':'¡Uy, casi!';if(!won&&P.st)av=P.st.av[m.win];
    txt=won?(pos===0?`¡Fuiste el más rápido! ${sec(L[0].rt)}`:`${L[0].name} tocó primero: ${sec(L[0].rt)}`):`Ganó ${NAMES[m.win]}: ${L[0].name} en ${sec(L[0].rt)}`;
    if(pos>0)sub=`Tu tiempo: ${sec(L[pos].rt)} · lugar ${pos+1} de ${L.length}`;else if(pos<0)sub=P.rt?`Tu tiempo: ${sec(P.rt)}`:'No alcanzaste a tocar';}
  showRes(cls,big,txt,sub,av);let hold=4500;
  /* la carrera de caballitos también en tu celular (tu caballito va marcado) */
  if(m.kind==='ok'&&Array.isArray(m.list)&&m.list.length&&P.st){const r=$('#pres'),L=m.list.slice(0,6);r.classList.add('hasrace');r.insertAdjacentHTML('beforeend',raceHTML(L,P.st.av,TCOL,P.uid));
    if(first||!isFinite(P.raceAt))P.raceAt=performance.now()+250;const tok=P.raceTok=(P.raceTok||0)+1,el=performance.now()-P.raceAt,go=()=>{if(tok===P.raceTok)raceRun(r,L,!RM(),null,Math.max(0,performance.now()-P.raceAt))};
    if(el<0)later(-el,go);else go();hold=Math.max(hold,P.raceAt-performance.now()+Math.min(2800,1000+(L[L.length-1].rt-L[0].rt)*4)+1800)}
  if(first){if(cls==='win')sf('bz'+me,.85);else if(cls==='foul'&&m.foul.uid!==P.uid)animal(myAv(),.8);vib(cls==='win'?[40,40,80]:60)}
  clearTimeout(P.resT);P.resT=later(hold,()=>{hideRes();if(P.phase==='res'){P.phase='idle';showPad()}})}
function showRes(cls,big,txt,sub,av){const r=$('#pres');r.className='pres '+cls;r.innerHTML=(av?avSVG(av):'')+`<b>${esc(big)}</b><p>${esc(txt)}</p>`+(sub?`<p>${esc(sub)}</p>`:'');r.hidden=false;if(!RM()){pop($('.l3-svg',r),600);r.animate([{opacity:0},{opacity:1}],{duration:250})}}
function hideRes(){clearTimeout(P.resT);$('#pres').hidden=true}
function onDome(e){const d=$('#dome');if(MODE!=='play'||$('#pad').hidden)return false;const r=d.getBoundingClientRect();if(!r.width)return false;return Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2))<=r.width/2}
document.addEventListener('pointerdown',e=>{if(MODE!=='play'||!$('#ask').hidden||e.target.closest('button,input,a,.pbar'))return;if(!onDome(e))return;e.preventDefault();const p=$('#pad');if(P.phase==='go'||P.phase==='idle')p.classList.add('press');press(e.timeStamp)},{passive:false});
['pointerup','pointercancel'].forEach(k=>document.addEventListener(k,()=>$('#pad').classList.remove('press')));
$('#pteams').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ac();loadSounds();P.team=+b.dataset.t;P.spec=false;$('#v-play').classList.remove('spec');LS.set('bt-team',{code:P.code,team:P.team});psend({t:'team',team:P.team},1);tick();showPad()});
$('#gvch').addEventListener('click',e=>$('#chteam').click());
$('#chteam').addEventListener('click',e=>{e.stopPropagation();if(P.phase==='wait'||P.phase==='go'||P.phase==='sent'||P.phase==='early'){toast('Espera a que termine la ronda para cambiarte.');return}
  if(!P.found){toast('Primero se tiene que conectar con la pantalla grande.');return}showPick()});
addEventListener('pagehide',()=>{if(MODE==='play')psend({t:'bye'},0)});

/* nombres de los equipos que pone la pantalla del juego */
function setNames(n){if(!Array.isArray(n)||n.length!==2)return;let ch=false;[0,1].forEach(t=>{const v=String(n[t]||'').slice(0,14);if(v&&NAMES[t]!==v){NAMES[t]=v;ch=true}});
  if(!ch)return;[0,1].forEach(t=>$('#gvt'+t+' b').textContent=NAMES[t]);drawMe();if(P.picking)drawPick()}
/* salir de la partida (por ejemplo si la pantalla del juego te saca) */
function playStop(){$('#rxbar').hidden=true;clearInterval(P.helloT);clearTimeout(P.probeT);clearPT();hideAsk();hideRes();if(P.net){const n=P.net;P.net=null;later(200,()=>{try{n.close()}catch(e){}})}dropP();
  MODE='';P.found=false;GV=null;gvShow();LS.set('bt-team',null);location.hash='';show('home')}

/* ===================== EL JUEGO EN EL CELULAR (modo celulares) ===================== */
let GV=null;
function boing(){if(!AC)return;try{const t=AC.currentTime+.02,s=AC.createOscillator(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();s.type='sine';s.frequency.setValueAtTime(380,t);s.frequency.exponentialRampToValueAtTime(90,t+.55);
  l.frequency.value=12;lg.gain.value=11;l.connect(lg);lg.connect(s.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.42,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.62);s.connect(g);g.connect(OUT);s.start(t);l.start(t);s.stop(t+.7);l.stop(t+.7)}catch(e){}}
const gvOn=()=>!!(GV&&GV.on&&P.found&&(P.team>=0||P.spec)&&!P.picking);
function gvShow(){const on=gvOn();$('#gv').hidden=!on;$('#v-play').classList.toggle('gvon',on);
  if(on){const f=$('#gvf');if(!f.dataset.on){f.dataset.on=1;f.src='ver.html';FILES2.forEach(loadOne)}}drawCmdBar()}
let VERok=false;
/* _d convierte la hora de la pantalla del juego a hora real (así el juego en vivo puede ir exactamente al mismo paso) */
function verSend(v){const f=$('#gvf');if(isFinite(P.hoff))v._d=performance.timeOrigin-P.hoff;if(VERok&&f.contentWindow)try{f.contentWindow.postMessage({t:'view',v},'*')}catch(e){}}
/* sonidos que pide la pantalla del juego en vivo */
function sfR(n,vol,rate){if(!AC||!BUF[n])return;try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=BUF[n];s.playbackRate.value=rate||1;g.gain.value=vol==null?.85:vol;s.connect(g);g.connect(OUT);s.start()}catch(e){}}
addEventListener('message',e=>{const f=$('#gvf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};
  if(d.t==='ver-listo'){VERok=true;if(GV)verSend(GV);return}
  if(d.t==='snd'&&gvOn()&&typeof d.n==='string'){if(d.n==='boing')boing();else{if(!BUF[d.n])loadOne(d.n);sfR(d.n,+d.vol||.85,+d.rate||1)}}});
function gvDraw(v){const old=GV;GV=v;gvShow();verSend(v);drawCmdBar();if(!$('#chat').hidden)chatRev();$('#v-play').classList.toggle('ingame',!!v.ph);if(!$('#ask').hidden)drawAskRev();if(!v.on)return;const snd=false;
  [0,1].forEach(t=>{$('#gvs'+t).textContent=v.sc[t];if(P.st)$('#gva'+t).innerHTML=avSVG(P.st.av[t]);
    const turn=v.ph==='steal'?1-v.ctl:v.ctl;$('#gvt'+t).classList.toggle('on',(v.ph==='play'||v.ph==='steal')&&turn===t);
    if(old&&old.sc[t]<v.sc[t]){sf('pts',.8);if(!RM())$('#gvt'+t).animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:500,easing:'cubic-bezier(.3,1.6,.5,1)'})}});
  $('#gvb').textContent=v.bank||0;$('#gvm').textContent=v.m>1?'×'+v.m+' al final':'';$('#gvr').textContent='Ronda '+v.rn+(v.rr?' de '+v.rr:'');
  $('#gvq').textContent=v.q||(v.ph==='wheel'?'Están girando la ruleta…':'Esperando la pregunta…');
  const n=v.n||0,rev=new Map((v.rev||[]).map(r=>[r[0],r])),b=$('#gvboard');
  if(b.children.length!==n||!old||old.q!==v.q)b.innerHTML=Array.from({length:n},(_,i)=>`<li data-i="${i}"><span class="gv-n">${i+1}</span><span class="gv-a"></span><b class="gv-p"></b></li>`).join('');
  [...b.children].forEach((li,i)=>{const r=rev.get(i),was=li.classList.contains('on');if(r&&!was){li.classList.add('on');$('.gv-a',li).textContent=r[1];$('.gv-p',li).textContent=r[2];
      if(snd){sf(i===0?'top1':'ok1',.85);vib(40);if(!RM())li.animate([{transform:'rotateX(90deg)'},{transform:'rotateX(-12deg)',offset:.7},{transform:'none'}],{duration:520,easing:'ease-out'})}}
    else if(!r&&was){li.classList.remove('on');$('.gv-a',li).textContent='';$('.gv-p',li).textContent=''}});
  const x=v.x||0;$$('#gvx i').forEach((e,k)=>e.classList.toggle('on',k<x));
  if(snd&&old&&(v.x||0)>(old.x||0)){boing();vib([60,40,60]);if(!RM())shake($('#gvx'))}
  if(snd&&old&&old.say&&old.say.cls!=='miss'&&old.say.cls!=='time'&&v.say&&(v.say.cls==='miss'||v.say.cls==='time'))vib(50);
  const tn=v.ph==='end'?(v.sc[0]===v.sc[1]?'¡Empate!':`🏆 ¡Ganaron ${losN(v.sc[0]>v.sc[1]?0:1)}!`):v.ph==='steal'?`¡Roban ${losN(1-v.ctl)}!`:v.ph==='play'&&v.ctl>=0?`Contestan ${losN(v.ctl)}`:v.ph==='buzz'?'¡Botones!':v.ph==='done'?'Ronda terminada':v.ph==='q'?'Ahí viene la pregunta…':'';
  $('#gvturn').textContent=tn;
  const ck=v.ck||{left:15,run:false};$('#gvckn').textContent=ck.left;$('#gvck').classList.toggle('run',!!ck.run);$('#gvck').classList.toggle('hot',!!ck.run&&ck.left<=5);
  const sy=v.say,e=$('#gvsay');if(sy){e.hidden=false;e.className='gv-say '+sy.cls;
    e.textContent=sy.cls==='typing'?`${sy.who} está escribiendo…`:sy.cls==='hit'?`✓ ${sy.who}: “${sy.txt}” ¡Sí está!`:sy.cls==='miss'?`✕ ${sy.who}: “${sy.txt}” no está`:sy.cls==='dup'?`${sy.who}: “${sy.txt}” ya salió`:sy.cls==='time'?`¡Se le acabó el tiempo a ${sy.who}!`:`${sy.who} contestó: “${sy.txt}”`}else e.hidden=true;
  if(snd&&old&&!old.q&&v.q)sf('flap2',.5)}

/* ===================== COMODINES ===================== */
const CMDS=[{k:'p',i:'💡',n:'Pista'},{k:'s',i:'🤫',n:'Silencio'},{k:'c',i:'💬',n:'Junta'}];
function cmdBtns(keys){const c=GV&&GV.cmd,t=P.team;if(!c||t<0)return'';return CMDS.filter(x=>keys.includes(x.k)).map(x=>{const j=CMDS.indexOf(x),u=c.u[t][j],can=c.can[t][j];
  return ctkHTML(x.k,{used:u,can,tag:'button',sub:u?'Usado':can?'¡Ahora!':'',attrs:`type="button" data-k="${x.k}" aria-label="Comodín ${x.n}${u?' (ya lo usaron)':can?' (lo puedes usar ahora)':''}"`})}).join('')}
function setHTML(el,h){if(el._h!==h){el._h=h;el.innerHTML=h}}
function drawCmdBar(){const b=$('#cmdbar'),show=!!(GV&&GV.cmd&&P.found&&P.team>=0&&!P.picking);b.hidden=!show;setHTML(b,show?'<span class="cmdl">Comodines</span>'+cmdBtns(['p','s','c']):'');
  setHTML($('#askcmd'),show?cmdBtns(['p','c']):'')}
function cmdTap(e){const b=e.target.closest('.ctk');if(!b)return;ac();loadSounds();if(b.classList.contains('used')){toast('Ese comodín ya lo usaron en esta partida');return}
  psend({t:'cmd',k:b.dataset.k,pt:performance.now()},1);tick();if(!RM())b.animate([{transform:'scale(1)'},{transform:'scale(.88)'},{transform:'scale(1)'}],{duration:220})}
$('#cmdbar').addEventListener('click',cmdTap);$('#askcmd').addEventListener('click',cmdTap);
/* en el recuadro para contestar: las que ya salieron en el tablero (para no repetir) */
function drawAskRev(){const b=$('#askrev'),r=GV&&Array.isArray(GV.rev)?GV.rev.slice().sort((x,y)=>x[0]-y[0]):[];b.hidden=!r.length;
  const h=r.length?'<small>Ya salieron:</small>'+r.map(([i,t])=>`<span>${i+1}. ${esc(String(t))}</span>`).join(''):'';if(b._h!==h){b._h=h;b.innerHTML=h}}
/* el reloj del recuadro se pausa durante la junta */
function askPause(a){if(a!==AK.id||AK.paused)return;AK.paused=true;AK.rest=Math.max(0,AK.end-performance.now());clearInterval(AK.T);$('#ask').classList.add('paused');$('#asksec').textContent='⏸'}
function askResume(a,sec,end){if(a!==AK.id)return;AK.paused=false;$('#ask').classList.remove('paused');AK.end=isFinite(end)&&isFinite(P.hoff)?end-P.hoff:performance.now()+(sec>0?sec*1000:AK.rest||0);clearInterval(AK.T);AK.T=setInterval(akTick,100);akTick()}
/* junta de equipo: chat solo para tu equipo */
const CH={id:0,end:0,tot:0,T:0,kind:'',claim:null,ty:{},openAt:0,lastTy:0,last:''};
function chatOpen(m){const same=m.again&&CH.id===m.id&&!$('#chat').hidden;CH.id=m.id;CH.kind=m.kind==='robo'?'robo':'junta';CH.openAt=performance.now();CH.ty={};if(!same){CH.claim=null;$('#chatm').innerHTML=''}
  chatClk(m.end||null,+m.sec||0);$('#chatq').textContent=GV&&GV.q?GV.q:'';
  const robo=CH.kind==='robo',s=$('#chat');$('#chatt').textContent=robo?'🕵️ Junta para robar':'💬 Junta de equipo';
  $('#chatsub').textContent=robo?`${m.other?m.other.charAt(0).toUpperCase()+m.other.slice(1):'El otro equipo'} siguen contestando. Si fallan una vez más, les toca robar.`:'El reloj está en pausa: pónganse de acuerdo.';
  $('#chatclaim').hidden=!robo||!!m.all;chatClaimDraw();$('#chatok').hidden=robo&&!CH.end;$('#chatok').textContent=robo?'¡Listos! Ya sabemos':'¡Ya sabemos! Seguir jugando';
  s.classList.toggle('robo',robo);s.classList.remove('min');$('#chatmin').setAttribute('aria-expanded','true');s.style.setProperty('--tc',TCOL[P.team>=0?P.team:0]);
  if(s.hidden){s.hidden=false;if(!RM())s.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.9,.3,1)'});vib([40,30,40]);sf('cmd',.7)}
  chatRev();clearInterval(CH.T);CH.T=setInterval(chatTick,200);chatTick();
  if(!robo&&!same)chatAdd({from:'',text:m.who?`${m.who} pidió la junta. ¡Pónganse de acuerdo!`:'¡Pónganse de acuerdo!',sys:1})}
/* reloj de la junta (end en hora de la pantalla grande) */
function chatClk(end,sec){CH.end=end&&isFinite(P.hoff)?end-P.hoff:sec>0?performance.now()+sec*1000:0;CH.tot=sec>0?sec*1000:0}
function chatTick(){const now=performance.now();ringSet($('#chatring'),CH.end?Math.max(0,CH.end-now)/1000:null,CH.tot/1000);
  const ty=Object.entries(CH.ty).filter(([u,x])=>now-x.at<2600).map(([u,x])=>x.name),tx=ty.length?(ty.length===1?`${ty[0]} está escribiendo…`:ty.length===2?`${ty[0]} y ${ty[1]} están escribiendo…`:'Varios están escribiendo…'):'';
  const el=$('#chatty');if(el.textContent!==tx)el.textContent=tx;$('#chat').classList.toggle('typing',!!tx);
  /* por si se perdió el aviso de que se acabó (la vista de la pantalla ya no la tiene) */
  if(CH.kind==='robo'&&GV&&now-CH.openAt>3500&&(!GV.hud||GV.hud.id!==CH.id))chatClose({id:CH.id,quiet:1})}
/* lo que ya salió en el tablero, para no repetir */
function chatRev(){const b=$('#chatrev');if(!b)return;const r=GV&&Array.isArray(GV.rev)?GV.rev.slice().sort((x,y)=>x[0]-y[0]):[];b.hidden=!r.length;const h=r.length?'Ya salieron: '+r.map(([i,t])=>esc(String(t))).join(' · '):'';if(b._h!==h){b._h=h;b.innerHTML=h}}
function chatClose(m){if(m.id&&m.id!==CH.id)return;clearInterval(CH.T);const s=$('#chat');if(s.hidden)return;try{$('#chati').blur()}catch(e){}s.hidden=true;
  if(!m.quiet)toast(m.why?m.why:CH.kind==='robo'?'¡Se acabó la junta: a robar!':'Se acabó la junta: ¡sigue el reloj!');vib(40)}
function chatPop(){if(!AC||MUTED)return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(980,t+.09);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(OUT);o.start(t);o.stop(t+.18)}catch(e){}}
function chatAdd(m){if(m.id&&m.id!==CH.id)return;const box=$('#chatm'),d=document.createElement('div'),me=m.uid===P.uid;
  if(m.sys){d.className='sys';d.textContent=m.text}
  else{d.className='bub'+(me?' me':'');d.innerHTML=(me?'':`<i>${avSVG(AVM[m.av]?m.av:'ajolote')}</i>`)+`<p>${me?'':`<b>${esc(m.from)}</b>`}${esc(m.text)}</p>`;if(m.uid)delete CH.ty[m.uid];
    CH.last=(me?'Tú':m.from)+': '+m.text;if($('#chat').classList.contains('min'))$('#chatsub').textContent=CH.last}
  box.appendChild(d);box.scrollTop=box.scrollHeight;if(!RM()&&!m.sys)d.animate([{opacity:0,transform:'translateY(10px) scale(.92)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.3,1.4,.5,1)'});
  if(!m.sys&&!me){vib(15);chatPop()}}
function chatClaimDraw(){const b=$('#chatclaim'),mine=CH.claim&&CH.claim.u===P.uid;b.classList.toggle('on',!!mine);b.setAttribute('aria-pressed',String(!!mine));
  b.textContent=mine?'✋ Tú la vas a decir':CH.claim?`✋ Mejor yo la digo (ahorita: ${CH.claim.name})`:'✋ Yo la digo'}
$('#chatf').addEventListener('submit',e=>{e.preventDefault();const i=$('#chati'),t=i.value.trim();if(!t)return;psend({t:'say',text:t},1);i.value='';i.focus()});
$('#chati').addEventListener('input',()=>{const now=performance.now();if(now-CH.lastTy>1500&&$('#chati').value.trim()){CH.lastTy=now;psend({t:'chtyp'})}});
$('#chatqk').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;psend({t:'say',text:b.dataset.q},1);tick();if(!RM())b.animate([{transform:'scale(1)'},{transform:'scale(.9)'},{transform:'scale(1)'}],{duration:200})});
$('#chatclaim').addEventListener('click',()=>{if(CH.claim&&CH.claim.u===P.uid)return;psend({t:'claim'},1);tick()});
$('#chatok').addEventListener('click',()=>psend({t:'chatok'},1));
/* hacerlo chiquito para ver el tablero, y volverlo a abrir */
function chatMin(on){const s=$('#chat');s.classList.toggle('min',on);$('#chatmin').setAttribute('aria-expanded',String(!on));$('#chatmin').setAttribute('aria-label',on?'Abrir el chat':'Hacer chiquito el chat');
  if(on){try{$('#chati').blur()}catch(e){}$('#chatsub').textContent=CH.last||'Toca aquí para seguir platicando'}else chatOpenSub()}
function chatOpenSub(){$('#chatsub').textContent=CH.kind==='robo'?(CH.end?'¡Les toca robar! Decidan quién la dice.':'El otro equipo sigue contestando. Si fallan una vez más, les toca robar.'):'El reloj está en pausa: pónganse de acuerdo.'}
$('#chatmin').addEventListener('click',()=>chatMin(!$('#chat').classList.contains('min')));
$('#chatsub').addEventListener('click',()=>{if($('#chat').classList.contains('min'))chatMin(false)});
$('#chatt').addEventListener('click',()=>{if($('#chat').classList.contains('min'))chatMin(false)});

/* final: tus medallas y el premio */
let FINT=0;
function finMe(m){if(!P.found||(P.team<0&&!P.spec))return;FPH=m;clearTimeout(FINT);loadOne('med');loadOne('medf');
  /* en modo celulares primero se ve la ceremonia completa en la pantalla del juego */
  const wait=gvOn()?2700+(+m.n||0)*1300+3500:2600;
  FINT=later(wait,()=>{const won=m.w===P.team,tie=m.w<0,mine=Array.isArray(m.mine)?m.mine:[];
    $('#finphav').innerHTML=avSVG(myAv());$('#finpht').textContent=tie?'¡Empate!':won?'🏆 ¡GANARON!':'¡Buen juego!';
    $('#finphs').textContent=`${NAMES[0]} ${m.sc[0]} · ${NAMES[1]} ${m.sc[1]}`;$('#finphpz').hidden=!(won&&m.prize);$('#finphpzt').textContent=m.prize||'';
    $('#finphmt').textContent=mine.length?(mine.length===1?'Tu medalla':'Tus medallas'):'Esta vez no te tocó medalla. ¡A la próxima!';
    $('#finphm').innerHTML=mine.map(x=>`<div class="finph-med" style="--mc:${esc(x.c||'#ffc42e')}"><span class="dk">${esc(x.ic)}</span><div><b>${esc(x.t)}${x.team?' <small>(tu equipo)</small>':''}</b><small>${esc(x.d)}</small></div></div>`).join('');
    $('#finphph').hidden=!(won||tie||(AD&&AD.ok));$('#finphpic').hidden=true;$('#finphcam').hidden=false;$('#finphnote').textContent='';
    const s=$('#finph');s.className='finph'+(won?' won':tie?' tie':'');s.hidden=false;
    if(!RM()){s.animate([{opacity:0},{opacity:1}],{duration:300});$$('.finph-med',s).forEach((e,k)=>e.animate([{opacity:0,transform:'translateX(40px) scale(.9)'},{opacity:1,transform:'none'}],{duration:480,delay:500+k*450,fill:'backwards',easing:'cubic-bezier(.2,.9,.3,1)'}))}
    vib(won?[60,40,60,40,200]:[60]);if(!gvOn()||!$('#gvf').offsetParent){sf(mine.length?'med':'medf',.8);if(won)later(500,()=>sf('medf',.8))}
    $$('.finph-med',s).forEach((e,k)=>later(600+k*450,()=>spk($('.dk',e),14,['#fff','#fff3c4','#ffc42e'])))})}
$('#finphok').addEventListener('click',()=>{$('#finph').hidden=true});

/* dos errores: aviso para que el otro equipo se prepare a robar */
let WARNT=0;
function warnMe(t){if(!P.found||P.team<0)return;const mine=P.team===t;vib(mine?[90,60,90,60,160]:[60,40,60]);
  if(gvOn()&&$('#gvf').offsetParent)return; /* en modo celulares ya lo muestra la pantalla del juego */
  const b=$('#warnb');b.className='warnb '+(mine?'mine':'other');$('#warnbt').textContent=mine?'¡Prepárense para robar!':'¡Cuidado! Ya llevan 2 ✕';
  $('#warnbs').textContent=mine?'Vayan pensando la respuesta: una ✕ más y les toca':'Una ✕ más y el otro equipo puede robar';b.hidden=false;
  if(!RM())b.animate([{transform:'translateY(-140%) rotate(-4deg)'},{transform:'translateY(6%) rotate(1deg)',offset:.7},{transform:'none'}],{duration:520,easing:'cubic-bezier(.2,.9,.3,1)'});
  clearTimeout(WARNT);WARNT=later(3600,()=>{if(RM()){b.hidden=true;return}b.animate([{opacity:1},{opacity:0,transform:'translateY(-30%)'}],{duration:300}).onfinish=()=>{b.hidden=true}})}

/* ===================== LA RULETA EN EL CELULAR ===================== */
/* mismo cálculo que la pantalla del juego: todos ven caer el mismo número */
const WSEG=[1,2,1,3,2,1,4,2],WPA=['#ff2e88','#14b8a6','#8b5cf6','#ff8a1a','#2f80ff','#22c55e','#ffc42e','#e83e8c'],WH_H=1/240;
function wTraj(th0,om0,fr){const P=[th0];let th=th0,om=om0,peg=Math.floor(th0/45);
  for(let k=0;k<240*40;k++){const a=Math.abs(om),na=Math.max(0,a-(60+.5*a)*fr*WH_H);om=Math.sign(om)*na;th+=om*WH_H;const pg=Math.floor(th/45);if(pg!==peg){peg=pg;om*=.994}P.push(th);if(na<5)break}
  return P}
const WP={th:0,P:null,t0:0,spin:false,id:0,drag:false,smp:[],aPrev:0,res:0,raf:0,me:false,on:false,peg:0,flickAt:0,hideT:0,drawn:0};
function wphFace(){const c=$('#wphc'),s=c.clientWidth;if(!s||WP.drawn===s)return;WP.drawn=s;const dpr=Math.min(3,devicePixelRatio||1);c.width=c.height=Math.round(s*dpr);const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);
  const r=s/2,n=WSEG.length,a=2*Math.PI/n;
  for(let i=0;i<n;i++){const a0=-Math.PI/2+i*a,m=WSEG[i];x.beginPath();x.moveTo(r,r);x.arc(r,r,r,a0,a0+a);x.closePath();x.fillStyle=m===4?'#ffc42e':WPA[i];x.fill();
    const sh=x.createRadialGradient(r,r,r*.2,r,r,r);sh.addColorStop(0,'rgba(0,0,0,.3)');sh.addColorStop(.6,'rgba(0,0,0,0)');sh.addColorStop(.92,'rgba(255,255,255,.2)');sh.addColorStop(1,'rgba(255,255,255,.05)');x.fillStyle=sh;x.fill();
    x.strokeStyle='#fff';x.lineWidth=Math.max(3,s/95);x.stroke();
    x.save();x.translate(r,r);x.rotate(a0+a/2);x.textAlign='center';x.textBaseline='middle';const fs=Math.round(r*(m===4?.27:.22));x.font=`${fs}px "Lilita One",Rubik,sans-serif`;
    x.lineJoin='round';x.lineWidth=Math.max(4,s/70);x.strokeStyle=m===4?'rgba(120,60,0,.55)':'rgba(20,10,60,.45)';x.strokeText('×'+m,r*.64,3);x.fillStyle=m===4?'#5a2a00':'#fff';x.fillText('×'+m,r*.64,0);x.restore();
    const px=r+Math.cos(a0)*r*.94,py=r+Math.sin(a0)*r*.94,pr=Math.max(3,s/62);x.fillStyle='#ffc42e';x.beginPath();x.arc(px,py,pr,0,7);x.fill()}
  const hg=x.createRadialGradient(r*.94,r*.9,r*.02,r,r,r*.21);hg.addColorStop(0,'#fff6c8');hg.addColorStop(.55,'#ffc42e');hg.addColorStop(1,'#a86a00');x.fillStyle=hg;x.beginPath();x.arc(r,r,r*.21,0,7);x.fill();
  x.fillStyle='#0b0f3a';x.beginPath();x.arc(r,r,r*.155,0,7);x.fill();x.fillStyle='#ffd76a';x.textAlign='center';x.textBaseline='middle';x.font=`${Math.round(r*.13)}px "Lilita One",Rubik,sans-serif`;x.fillText('100',r,r+1)}
function wphRot(){$('#wphc').style.transform=`rotate(${WP.th}deg)`}
function wphAt(t){const P=WP.P;if(!P)return{th:WP.th,done:true};const e=Math.max(0,(t-WP.t0)/1000)/WH_H,i=Math.floor(e);if(i>=P.length-1)return{th:P[P.length-1],done:true};return{th:P[i]+(P[i+1]-P[i])*(e-i),done:false}}
function wphLoop(t){WP.raf=0;if(!WP.spin)return;const s=wphAt(t);WP.th=s.th;wphRot();const pg=Math.floor(WP.th/45);if(pg!==WP.peg){WP.peg=pg;if(WP.on)sf('peg',.45);else if(WP.me)vib(4)}
  if(s.done){WP.spin=false;if(WP.P===WP.pred){WP.P=WP.pred=null;return}wphLanded();return}WP.raf=requestAnimationFrame(wphLoop)}
function wphGo(){if(!WP.raf)WP.raf=requestAnimationFrame(wphLoop)}
function wphLanded(){const ang=((-WP.th%360)+360)%360,m=WSEG[Math.floor(ang/45)];WP.res=m;wphRes(m,true)}
function wphRes(m,fresh){const r=$('#wphr');r.textContent=m===1?'×1: puntos normales':m===2?'¡×2! Esta ronda vale DOBLE':m===3?'¡×3! Esta ronda vale TRIPLE':'¡¡×4!! ¡CUÁDRUPLE!';r.className='wph-r on x'+m;
  $('#wphh').hidden=true;if(fresh){if(WP.on)sf('wx'+m,.85);vib(m>=3?[30,60,30]:30);if(!RM())r.animate([{opacity:0,transform:'scale(.5)'},{opacity:1,transform:'scale(1.12)',offset:.6},{opacity:1,transform:'none'}],{duration:480,easing:'cubic-bezier(.3,1.5,.5,1)'})}}
/* lo que manda la pantalla del juego */
function wphView(v){const s=$('#wph'),show=v.ph==='wheel'&&P.found&&P.team>=0&&(v.on||v.wsp===P.uid);WP.on=!!v.on;
  if(!show){if(!s.hidden&&!WP.hideT)WP.hideT=later(v.ph==='wheel'?0:1300,()=>{WP.hideT=0;s.hidden=true;WP.spin=false;WP.P=null});return}
  clearTimeout(WP.hideT);WP.hideT=0;WP.me=v.wsp===P.uid;
  if(s.hidden){s.hidden=false;WP.res=0;WP.drawn=0;WP.P=null;WP.spin=false;$('#wphr').className='wph-r';$('#wphr').textContent='';if(v.wth!=null)WP.th=v.wth;requestAnimationFrame(()=>{wphFace();wphRot()});
    if(!RM())s.animate([{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.3,1.4,.5,1)'});if(WP.me){vib([30,40,30]);sf('went',.5)}}
  $('#wpht').textContent=WP.me?'¡Te toca girar la ruleta!':v.wspn?`Gira la ruleta: ${v.wspn}`:'¡Ruleta!';
  $('#wphs').textContent=WP.me?(WP.spin||WP.res?'¡Allá va!':'Pon el dedo en la ruleta y aviéntala fuerte'):'Multiplica los puntos de esta ronda';
  $('#wphh').hidden=!WP.me||WP.spin||!!WP.res||WP.drag;
  if(!WP.spin&&!WP.drag&&v.wth!=null&&!WP.res){WP.th=v.wth;wphRot()}
  if(v.wres&&!WP.res&&!WP.spin){WP.res=v.wres;wphRes(v.wres,false)}}
function wphSpin(m){WP.id=m.id;if(!m.om){WP.spin=false;WP.P=null;WP.th=m.th0;wphRot();return}
  WP.P=wTraj(m.th0,m.om,m.fr);WP.t0=WP.flickAt&&performance.now()-WP.flickAt<2000?WP.flickAt:performance.now();WP.flickAt=0;WP.pred=null;WP.spin=true;WP.res=0;$('#wphr').className='wph-r';$('#wphr').textContent='';$('#wphh').hidden=true;
  if(!$('#wph').hidden&&WP.on&&!WP.me)sf('thr',.6);wphGo();if(!$('#wph').hidden)wphFx(m.lv)}
/* fuerza del aventón (débil · ¡qué fuerza! · ¡súper giro! · ¡rompiste la ruleta!) */
function wphFx(lv){if(lv==null||lv===1)return;const k=WLV[lv];if(!k)return;const el=$('#wphfx'),w=$('#wphw'),snd=WP.on||WP.me;
  el.textContent=k.n;el.className='wph-fx '+k.k;w.classList.remove('fire','fast');void w.offsetWidth;if(lv>=2)w.classList.add(lv>=3?'fire':'fast');
  vib(lv===0?20:lv===2?[40,30,60]:lv===3?[40,30,40,30,120]:[60,40,60,40,200,60,300]);
  if(!RM()){if(lv===0)el.animate([{opacity:0,transform:'translate(-50%,-30%) scale(.6)'},{opacity:1,transform:'translate(-50%,-50%) scale(1) rotate(-3deg)',offset:.3},{opacity:1,transform:'translate(-50%,-46%) scale(.96) rotate(4deg)',offset:.7},{opacity:0,transform:'translate(-50%,-20%) scale(.9) rotate(8deg)'}],{duration:2000,easing:'ease-in-out',fill:'forwards'});
    else el.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.2) rotate(-25deg)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.2) rotate(6deg)',offset:.55},{opacity:1,transform:'translate(-50%,-50%) scale(1) rotate(-4deg)',offset:.8},{opacity:0,transform:'translate(-50%,-70%) scale(1.1) rotate(-4deg)'}],{duration:lv===4?3000:2100,easing:'cubic-bezier(.2,.9,.3,1)',fill:'forwards'});
    if(lv>=2&&lv<4)shake(w)}
  if(snd){if(lv===0)sfR('grow',.45,.62);else{sfR('grow',.6,lv===2?1.05:1.25);if(lv>=3)later(120,()=>sf('top1',.55))}}
  if(lv===4)wBreakFx(w,$('#wphc'),{shake:()=>shake(w),snd:()=>{if(snd&&AC&&!MUTED)crashSnd(AC,OUT)},sparks:()=>spk(w,40,['#ffd23f','#fff','#ff5c9a'])});
  later(lv===4?3200:2600,()=>w.classList.remove('fire','fast'))}
/* aventarla con el dedo (solo a quien le toca) */
function wphAng(e){const r=$('#wphc').getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI}
$('#wphw').addEventListener('pointerdown',e=>{if(!WP.me||WP.spin||WP.res)return;e.preventDefault();try{$('#wphw').setPointerCapture(e.pointerId)}catch(_){}ac();loadSounds();
  WP.drag=true;WP.aPrev=wphAng(e);WP.smp=[{t:performance.now(),th:WP.th}];$('#wphh').hidden=true;$('#wphr').textContent=''});
$('#wphw').addEventListener('pointermove',e=>{if(!WP.drag)return;const a=wphAng(e);let d=a-WP.aPrev;if(d>180)d-=360;if(d<-180)d+=360;WP.aPrev=a;WP.th+=d;wphRot();const n=performance.now();WP.smp.push({t:n,th:WP.th});while(WP.smp.length>2&&n-WP.smp[0].t>110)WP.smp.shift();
  const pg=Math.floor(WP.th/45);if(pg!==WP.peg){WP.peg=pg;vib(4)}});
const wphUp=()=>{if(!WP.drag)return;WP.drag=false;const s=WP.smp,a=s[0],b=s[s.length-1],dt=Math.max(60,b.t-a.t)/1000,om=(b.th-a.th)/dt;
  if(Math.abs(om)<260||performance.now()-b.t>160){const r=$('#wphr');r.className='wph-r on';r.textContent='¡Más fuerte! ¡Aviéntala!';shake(r);$('#wphh').hidden=false;return}
  psend({t:'wthrow',om},1);sf('thr',.7);vib(20);WP.flickAt=performance.now();
  /* mientras llega la respuesta, la ruleta ya va girando */
  const om2=Math.sign(om)*wLvOm(wLevel(Math.abs(om)),Math.abs(om));WP.pred=wTraj(WP.th,om2,1);WP.P=WP.pred;WP.t0=WP.flickAt;WP.spin=true;$('#wphs').textContent='¡Allá va!';wphGo()};
$('#wphw').addEventListener('pointerup',wphUp);$('#wphw').addEventListener('pointercancel',wphUp);
addEventListener('resize',()=>{if(!$('#wph').hidden){WP.drawn=0;wphFace()}});

/* ===================== CONTESTAR ESCRIBIENDO ===================== */
const AK={a:0,id:0,end:0,sec:0,sent:false,T:0,last:'',tw:0};
const akWords=s=>s.toUpperCase().trim().split(/\s+/).filter(Boolean);
/* lo que van escribiendo sale con letritas de aeropuerto */
function akPrev(){const w=akWords($('#aski').value),box=$('#askprev'),old=AK.last;AK.last=w.join(' ');
  if(!w.length){box.innerHTML='<span class="ask-ph">Aquí sale tu respuesta</span>';return}
  box.innerHTML=w.map(x=>`<span class="pw">${[...x].map(c=>`<span class="pc">${esc(c)}</span>`).join('')}</span>`).join('');
  if(!RM()&&AK.last.length>old.length&&AK.last.startsWith(old)){const cs=$$('.pc',box),c=cs[cs.length-1];if(c)c.animate([{transform:'scaleY(.05)'},{transform:'scaleY(1.08)',offset:.6},{transform:'scaleY(1)'}],{duration:180,easing:'ease-out'})}}
function akTick(){const left=Math.max(0,AK.end-performance.now()),s=Math.ceil(left/1000);$('#askbar').style.transform=`scaleX(${(left/(AK.sec*1000)).toFixed(4)})`;
  if(String(s)!==$('#asksec').textContent){$('#asksec').textContent=s;const hot=s<=5&&!AK.sent;$('#ask').classList.toggle('hot',hot);if(hot&&s>0){vib(18);if(!RM())$('#asksec').animate([{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:300})}}
  if(left<=0)clearInterval(AK.T)}
function showAsk(m){drawAskRev();{const h=$('#askhint');h.hidden=!m.hint;if(m.hint)h.textContent=m.hint}clearTimeout(AK.hT);const s=$('#ask'),again=AK.id===m.a,wasDone=!s.hidden&&s.classList.contains('done');AK.id=m.a;AK.sent=false;AK.mine=false;AK.sec=Math.max(2,+m.sec||15);AK.end=isFinite(+m.end)&&isFinite(P.hoff)&&Math.abs(+m.end-P.hoff-performance.now()-AK.sec*1000)<3000?+m.end-P.hoff:performance.now()+AK.sec*1000;AK.last='';
  hideRes();s.className='ask'+(m.steal?' steal':'');$('#askres').hidden=true;$('#askf').hidden=false;
  $('#askav').innerHTML=avSVG(myAv());$('#askt').textContent=m.steal?'¡A robar!':m.again?'¡Intenta con otra!':m.all?'¡Les toca contestar!':'¡Te toca contestar!';
  $('#asks').textContent=m.steal?(m.all?'Una sola oportunidad: el primero que escriba contesta por el equipo':'Una sola oportunidad: pónganse de acuerdo y tú la escribes'):m.all?'El primero que empiece a escribir contesta por el equipo':'¿Qué dijeron las 100 personas?';
  $('#askq').textContent=m.q||'';const i=$('#aski');if(!again)i.value='';i.disabled=false;akPrev();
  clearInterval(AK.T);AK.T=setInterval(akTick,100);akTick();
  if(s.hidden){s.hidden=false;if(!RM())s.animate([{transform:'translateY(100%)'},{transform:'translateY(-2%)',offset:.75},{transform:'none'}],{duration:480,easing:'cubic-bezier(.2,.9,.3,1)'});pop($('#askav .l3-svg'),600);vib([30,40,30]);sf('went',.5)}
  else if(wasDone&&!RM()){s.animate([{opacity:.4,transform:'scale(.96)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.3,1.4,.5,1)'});vib([30,40,30])}
  later(60,()=>{try{i.focus({preventScroll:true})}catch(e){}})}
function hideAsk(){clearInterval(AK.T);clearTimeout(AK.hT);const s=$('#ask');if(s.hidden)return;try{$('#aski').blur()}catch(e){}s.hidden=true}
function akSend(){if(AK.sent||$('#ask').hidden)return;const t=$('#aski').value.replace(/\s+/g,' ').trim().slice(0,40);
  if(!t){shake($('#aski'));vib(40);$('#aski').focus();return}
  AK.sent=true;AK.mine=true;psend({t:'answer',a:AK.id,text:t,pt:performance.now()},1);tick();vib(30);$('#aski').disabled=true;try{$('#aski').blur()}catch(e){}
  akRes('sent','¡Enviado!','Miren la pantalla grande…')}
function akRes(cls,big,sub,extra){const r=$('#askres');$('#ask').classList.remove('hot');$('#ask').classList.add('done',cls);$('#askf').hidden=true;
  r.innerHTML=avSVG(myAv())+`<b>${esc(big)}</b>`+(extra?`<p class="ask-ans">${esc(extra)}</p>`:'')+(sub?`<p>${esc(sub)}</p>`:'')+(cls==='sent'?'<span class="ask-spin"></span>':'');r.hidden=false;
  if(!RM())$('b',r).animate([{transform:'scale(.3)',opacity:0},{transform:'scale(1.12)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'})}
function askMsg(m){if(m.a!==AK.id||$('#ask').hidden)return;const s=$('#ask');s.classList.remove('sent','hit','miss','dup','time','other');
  if(m.t==='asked'){clearInterval(AK.T);AK.txt=m.text;if(!AK.sent){AK.sent=true;$('#aski').disabled=true;try{$('#aski').blur()}catch(e){}}akRes('sent',AK.mine?'¡Enviado!':`${m.by} contestó`,'Miren la pantalla grande…','“'+m.text+'”');return}
  if(m.t==='close'){clearInterval(AK.T);if(m.why)toast(m.why);hideAsk();return}
  /* otro del equipo ya está escribiendo: a este se le bloquea */
  if(m.t==='lock'){if(AK.mine)return;AK.sent=true;$('#aski').disabled=true;try{$('#aski').blur()}catch(e){}akRes('sent',`${m.by} está escribiendo`,'Contesta por el equipo. Si sabes la respuesta, ¡díctasela!');return}
  clearInterval(AK.T);clearTimeout(AK.hT);
  if(m.res==='hit'){akRes('hit','¡SÍ ESTÁ!',`${m.pts} ${m.pts===1?'persona lo dijo':'personas lo dijeron'}`,m.ans);vib([40,40,90]);later(200,()=>spk($('#askres b'),30,['#fff','#fff3c4','#35e08a',getComputedStyle(s).getPropertyValue('--tc')]));AK.hT=later(3000,hideAsk)}
  else if(m.res==='dup'){akRes('dup','¡Esa ya salió!','Repetir cuenta como error ✕',m.ans);vib(60)}
  else if(m.res==='time'){akRes('time','¡Se acabó el tiempo!','Ni modo, cuenta como error');vib([60,40,60]);shake($('#askres b'));AK.hT=later(2800,hideAsk)}
  else{akRes('miss','No está en el tablero','Si sí contaba, la pantalla todavía la puede destapar',AK.txt?'“'+AK.txt+'”':'');vib([60,40,60]);shake($('#askres b'));AK.hT=later(3400,hideAsk)}}
$('#aski').addEventListener('input',()=>{akPrev();const now=performance.now();clearTimeout(AK.tw);const go=()=>{AK.tl=performance.now();psend({t:'typing',a:AK.id,w:akWords($('#aski').value).map(x=>x.length).slice(0,8)})};
  if(now-(AK.tl||0)>150)go();else AK.tw=later(160,go)});
$('#askf').addEventListener('submit',e=>{e.preventDefault();akSend()});
$('#ask').addEventListener('pointerdown',e=>{if(!AK.sent&&!e.target.closest('form,button'))later(0,()=>$('#aski').focus())});

/* ===================== INICIO ===================== */
/* partida guardada en este aparato: se puede continuar */
function savedGame(){try{const g=JSON.parse(localStorage.getItem('j-game')||'null'),c=JSON.parse(localStorage.getItem('j-cfg')||'{}')||{};
  if(!g||g.ended||!Array.isArray(g.sc))return null;let rd=null;try{rd=JSON.parse(localStorage.getItem('j-round')||'null')}catch(e){}
  if(!(g.ri>0||g.sc[0]+g.sc[1]>0||g.fin>=0||rd&&rd.ri===g.ri))return null;return{g,c}}catch(e){return null}}
function drawSaved(){const s=savedGame();$('#contcard').hidden=!s;$('#modesnote').hidden=!s;$('#createbtn').classList.toggle('star',!s);
  /* con partida guardada no se borra sola: al entrar pregunta si continuar o empezar de nuevo */
  $$('#modes a[href*="modo="]').forEach(a=>{const q=new URLSearchParams(a.getAttribute('href').split('?')[1]||'');if(s)q.delete('nueva');else q.set('nueva','1');a.setAttribute('href','juego.html?'+q)});if(!s)return;
  const g=s.g,c=s.c,nm=Array.isArray(c.names)&&c.names.length===2?c.names:['Turquesas','Dorados'],r=c.rounds==null?5:c.rounds,n=g.fin===g.ri?g.ri+2:g.ri+1;
  $('#contsm').textContent=(r>0&&n>r?'Ya terminaron todas las rondas':`Van en la ronda ${n}${r>0?' de '+r:''}`)+` · ${nm[0]} ${g.sc[0]} · ${nm[1]} ${g.sc[1]}`}
drawSaved();addEventListener('pageshow',drawSaved);
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>{ac();loadSounds();const g=b.dataset.go;if(g==='host'){hostStart();return}
  if(g==='create'){$('#joinf').hidden=true;const m=$('#modes');m.hidden=!m.hidden;if(!m.hidden){m.scrollIntoView({behavior:'smooth',block:'nearest'});if(!RM())m.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:260})}return}
  $('#modes').hidden=true;$('#joinf').hidden=false;($('#code').value?$('#pname'):$('#code')).focus()}));
$('#code').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4)});
let LINKBI=-1;
$('#joinf').addEventListener('submit',e=>{e.preventDefault();const code=$('#code').value.toUpperCase().replace(/[^A-Z0-9]/g,''),name=$('#pname').value.trim().slice(0,14)||'Jugador';
  if(code.length!==4){$('#joinerr').textContent='El código tiene 4 letras o números.';return}$('#joinerr').textContent='';ac();loadSounds();playStart(code,name,LINKBI)});
/* instalar la app: si el navegador lo permite, sale su ventana; si no, los pasos para Android y iPhone */
const STANDALONE=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let DEF=null;$('#install').hidden=STANDALONE;addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEF=e;$('#install').hidden=false});
$('#install').addEventListener('click',async()=>{if(DEF){DEF.prompt();try{const r=await DEF.userChoice;if(r&&r.outcome==='accepted')$('#install').hidden=true}catch(e){}DEF=null;return}$('#instsh').hidden=false});
$('#instok').addEventListener('click',()=>$('#instsh').hidden=true);
/* modo ligero a mano: auto → sí → no */
function liteBtn(){$('#litev').textContent={auto:LITE.on?'Auto (activado)':'Auto',on:'Sí',off:'No'}[LITE.mode]}
addEventListener('litechange',liteBtn);$('#mutek').addEventListener('click',()=>{ac();muteSet(!MUTED);if(!MUTED){loadSounds();tick()}toast(MUTED?'🔇 Este celular quedó en silencio':'🔊 Sonido activado')});muteSet(MUTED);
$('#litebtn').addEventListener('click',()=>{liteMode({auto:'on',on:'off',off:'auto'}[LITE.mode]);liteBtn()});liteBtn();
/* ¿qué hay de nuevo? (una vez, después de cada actualización, solo a quien ya había jugado) */
function newsShow(){if(typeof NEWS==='undefined'||!NEWS.length||typeof APPV==='undefined')return;const n=NEWS[0];if(n.v!==APPV||LS.get('news-seen','')===n.v)return;
  if(!LS.get('bt-name','')){LS.set('news-seen',n.v);return}if($('#v-home').hidden||!$('#modes').hidden||!$('#joinf').hidden){later(4000,newsShow);return}
  $('#newl').innerHTML=n.t.map(x=>`<li>${esc(x)}</li>`).join('');$('#newsh').hidden=false}
$('#newok').addEventListener('click',()=>{$('#newsh').hidden=true;if(typeof NEWS!=='undefined'&&NEWS[0])LS.set('news-seen',NEWS[0].v)});
later(1800,newsShow);
if('serviceWorker' in navigator&&!LOCAL)navigator.serviceWorker.register('sw.js').catch(()=>{});
$('#pname').value=P.name;
{const m=location.hash.match(/^#j=([A-Za-z0-9]{4})(?:-(\d))?$/);if(m){$('#joinf').hidden=false;$('#code').value=m[1].toUpperCase();if(m[2]!=null)LINKBI=Math.min(+m[2],BROKERS.length-1);later(50,()=>$('#pname').focus())}}
/* ===================== SE ACTUALIZA SOLO =====================
   Cada rato revisa si hay versión nueva; si la hay, recarga en un momento tranquilo y vuelve a entrar a la misma sala. */
const UPD={new:false,T:0};
const updOn=()=>!LOCAL||LS.get('upd-test',false);
async function updCheck(){if(UPD.new||!updOn()||typeof APPV==='undefined')return;try{const r=await fetch('version.txt?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const v=(await r.text()).trim();if(v&&v!==APPV){UPD.new=true;updTry()}}catch(e){}}
function updSafe(){if(MODE==='host')return H.phase==='lobby';if(!$('#ask').hidden||!$('#chat').hidden)return false;if(['arm','wait','go'].includes(P.phase))return false;if(WP.spin||WP.drag)return false;return true}
function updTry(){if(!UPD.new)return;clearTimeout(UPD.T);if(!updSafe()){UPD.T=later(3000,updTry);return}
  if(MODE==='play'&&P.code)try{sessionStorage.setItem('bt-auto',JSON.stringify({code:P.code,name:P.name,bi:P.bi,at:Date.now()}))}catch(e){}
  if(MODE==='host'){toast('Hay versión nueva: se instala la próxima vez que abras el juego.');return}
  toast('Actualizando a la versión nueva…');later(900,()=>location.reload())}
setInterval(updCheck,90000);addEventListener('visibilitychange',()=>{if(!document.hidden)updCheck()});later(15000,updCheck);
/* después de actualizarse, vuelve a entrar solo a la misma sala */
{let a=null;try{a=JSON.parse(sessionStorage.getItem('bt-auto')||'null');sessionStorage.removeItem('bt-auto')}catch(e){}
  if(a&&a.code&&Date.now()-a.at<600000)later(250,()=>playStart(a.code,a.name||P.name||'Jugador',a.bi))}
/* ===================== MODO ANFITRIÓN (solo el celular que sabe el PIN) =====================
   Del PIN solo existe una versión cifrada. Tu celular lo pide una vez (teclado revuelto, sin marcar qué tecla tocas)
   y guarda una llave; con ella, cualquier pantalla del juego lo reconoce como anfitrión. */
const ADM_KH='4f741ec379e0261a59ed966dc79a20b779d74af2cdd4efdcded1cb9859fedea1';
const AD={k:LS.get('adm-k',''),ok:false,st:null,tab:'b',cover:false,conf:{},pin:'',fails:LS.get('adm-fails',0),until:LS.get('adm-until',0)};
async function sha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function admHello(){if(AD.k&&MODE==='play'&&P.found)psend({t:'adm-hi',k:AD.k,black:LS.get('adm-black',[])},1)}
function admUI(){$('#admk').hidden=MODE!=='play'||AD.ok;$('#admt').hidden=!(MODE==='play'&&AD.ok)}
/* PIN */
function pinOpen(){if(Date.now()<AD.until){toast(`Muchos intentos. Espera ${Math.ceil((AD.until-Date.now())/1000)} s`);return}AD.pin='';pinPad();pinDots();$('#pinmsg').textContent='Escribe tu PIN';$('#pin').hidden=false}
function pinPad(){const d=[...'0123456789'];for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}
  $('#pinpad').innerHTML=d.slice(0,9).map(x=>`<button type="button" class="pin-k" data-d="${x}">${x}</button>`).join('')+`<span></span><button type="button" class="pin-k" data-d="${d[9]}">${d[9]}</button><button type="button" class="pin-k pin-del" data-d="del" aria-label="Borrar">⌫</button>`}
function pinDots(){$$('#pindots i').forEach((e,k)=>e.classList.toggle('on',k<AD.pin.length))}
$('#pinpad').addEventListener('pointerdown',e=>{const b=e.target.closest('.pin-k');if(!b)return;e.preventDefault();const d=b.dataset.d;
  if(d==='del')AD.pin=AD.pin.slice(0,-1);else if(AD.pin.length<4)AD.pin+=d;pinDots();if(AD.pin.length===4)pinTry()});
$('#pinx').addEventListener('click',()=>{AD.pin='';$('#pin').hidden=true});
$('#admk').addEventListener('click',pinOpen);
async function pinTry(){const k=await sha256('100familiares-anfitrion:'+AD.pin);AD.pin='';pinDots();
  if(await sha256(k)!==ADM_KH){AD.fails++;LS.set('adm-fails',AD.fails);vib([60,40,60]);if(AD.fails>=3){AD.fails=0;LS.set('adm-fails',0);AD.until=Date.now()+60000;LS.set('adm-until',AD.until);$('#pin').hidden=true;toast('PIN incorrecto. Espera un minuto');return}
    $('#pinmsg').textContent='PIN incorrecto';pinPad();return}
  AD.fails=0;LS.set('adm-fails',0);AD.k=k;LS.set('adm-k',k);$('#pin').hidden=true;vib(40);toast('🔑 Listo: este celular es el anfitrión');admHello()}
/* mensajes de la pantalla */
function admMsg(m){if(m.t==='adm-ok'){AD.ok=true;admUI();return}if(m.t==='adm-no'){AD.k='';LS.set('adm-k','');AD.ok=false;admUI();toast('La pantalla no reconoció tu llave: vuelve a poner el PIN');return}
  if(m.t==='adm-st'){AD.st=m;if(Array.isArray(m.black))LS.set('adm-black',m.black);if(!$('#adm').hidden)admDraw()}}
const admSend=(c,o)=>{psend(Object.assign({t:'adm',c},o||{}),1);tick();vib(15)};
/* doble toque para lo delicado */
function admTwice(key,el,msg){const now=Date.now();if(AD.conf[key]&&now-AD.conf[key]<3500){AD.conf[key]=0;return true}AD.conf[key]=now;if(el){const t=el.textContent;el.textContent=msg||'¿Seguro? Toca otra vez';el.classList.add('warn');later(3500,()=>{if(el.isConnected){el.textContent=t;el.classList.remove('warn')}})}return false}
/* panel */
function admOpen(){admDraw();const a=$('#adm');a.hidden=false;if(!RM())a.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.9,.3,1)'})}
function admClose(){$('#adm').hidden=true;AD.cover=false}
$('#admt').addEventListener('click',()=>{$('#adm').hidden?admOpen():admClose()});$('#admx').addEventListener('click',admClose);
$('.adm-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;AD.tab=b.dataset.tab;$$('.adm-tabs [data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));admDraw()});
const AB=(cmd,label,cls,extra)=>`<button type="button" class="adm-b ${cls||''}" data-c="${cmd}" ${extra||''}>${label}</button>`;
function admDraw(){const s=AD.st,b=$('#admbody');if(!s){b.innerHTML='<p class="adm-note">Conectando con la pantalla…</p>';return}let h='';
  const score=`<div class="adm-sc">${[0,1].map(t=>`<span style="--tc:${TCOL[t]}">${esc(s.names[t])} <b>${s.sc[t]}</b></span>`).join('')}</div>`;
  if(AD.tab==='b'){
    if(s.lob){h+=`<p class="adm-note">La pantalla está en la sala.</p>`;if(s.saved){if(s.cont)h+=AB('cont','▶ Continuar la partida','gd big');h+=AB('fresh','Empezar de nuevo','')}if(s.start)h+=AB('start','▶ '+esc(s.start),'gd big')}
    else{h+=score;if(s.q)h+=`<p class="adm-q">${s.rn?`Ronda ${s.rn} · `:''}${esc(s.q)}</p>`;
      if(s.nc)h+=`<div class="adm-nc">${AB('nocontaba','↩ No contaba','x')}<small>${esc(s.nc)}</small></div>`;
      if(s.wauto)h+=AB('wauto','🎡 Girar la ruleta por ellos','gd');
      if(s.fin)h+=AB('finagain','🎉 Otra partida','gd big')+AB('fincl','Cerrar la ceremonia','');
      h+=`<div class="adm-ctl">${s.ctl.map(c=>AB('ctl',esc(c.l),c.c==='x'?'x big':c.c==='gd'?'gd big':c.c==='gh'?'gh':'',`data-a="${esc(c.a)}"`)).join('')}</div>`;
      if(s.n&&['play','steal','done'].includes(s.ph))h+=`<p class="adm-lbl">${AD.cover?'Toca la ficha que quieres tapar':'Destapar una ficha'}</p><div class="adm-bd">${s.rev.map((r,i)=>`<button type="button" class="adm-t${r?' on':''}${AD.cover&&r?' cov':''}" data-c="${AD.cover?'cover':'tile'}" data-i="${i}" ${(AD.cover?!r:r)?'disabled':''}>${i+1}</button>`).join('')}</div>`}}
  else{
    h+=`<p class="adm-lbl">Correcciones</p><div class="adm-g">${AB('undox','Quitar la última ✕','',s.ux?'':'disabled')}${AB('cover1',AD.cover?'Cancelar tapar':'Tapar una ficha','',s.rev.some(Boolean)&&s.ph!=='done'?'':'disabled')}
      ${AB('redo','Repetir la ronda','',s.q?'':'disabled')}${AB('skipq','Cambiar la pregunta','',s.q?'':'disabled')}</div>${AB('blackq','👎 Quitar esta pregunta para siempre','x',s.q?'':'disabled')}
      <p class="adm-lbl">Puntos</p>${[0,1].map(t=>`<div class="adm-pt" style="--tc:${TCOL[t]}"><b>${esc(s.names[t])} · ${s.sc[t]}</b><span>${[-10,-5,5,10].map(d=>`<button type="button" class="adm-b" data-c="pts" data-t="${t}" data-d="${d}">${d>0?'+':''}${d}</button>`).join('')}</span></div>`).join('')}
      <p class="adm-lbl">Partida</p><div class="adm-g">${AB('sala','Ir a la sala','',s.lob?'disabled':'')}${AB('fresh','Reiniciar la partida','x')}</div>
      <label class="adm-sw"><input type="checkbox" id="admhide" ${s.hide?'checked':''}> Esconder los botones en la pantalla</label>
      <div class="adm-cf"><span>🐢 Modo ligero en la pantalla${s.liteOn&&s.lite==='auto'?' (se activó solo)':''}</span><div>${[['auto','Auto'],['on','Sí'],['off','No']].map(([v,l])=>`<button type="button" class="adm-b" data-c="lite" data-v="${v}" aria-pressed="${s.lite===v}">${l}</button>`).join('')}</div></div>
      <p class="adm-lbl">Ajustes</p>${admCfg(s.cfg)}
      <p class="adm-lbl">Premio</p><form class="adm-pz" id="admpz"><input id="admpzi" maxlength="40" value="${esc(s.cfg.prize)}" placeholder="Ej. escogen la película"><button class="adm-b gd">Guardar</button></form>
      <p class="adm-lbl">Equipos</p>${[0,1].map(t=>`<div class="adm-tm" style="--tc:${TCOL[t]}"><form class="adm-tn" data-t="${t}"><input value="${esc(s.names[t])}" maxlength="14" aria-label="Nombre del equipo"><button class="adm-b">✓</button></form>
        ${s.ps.filter(p=>p.t===t).map(p=>`<div class="adm-p"><span>${esc(p.n)}</span><button type="button" class="adm-b" data-c="move" data-u="${esc(p.u)}" aria-label="Cambiar de equipo">⇄</button><button type="button" class="adm-b x" data-c="kick" data-u="${esc(p.u)}" aria-label="Sacar">✕</button></div>`).join('')||'<p class="adm-note">Nadie todavía.</p>'}</div>`).join('')}
      <p class="adm-lbl">Preguntas quitadas (${s.black.length})</p>${s.black.length?s.black.map(q=>`<div class="adm-p"><span>${esc(q)}</span><button type="button" class="adm-b" data-c="blkdel" data-q="${esc(q)}">Restaurar</button></div>`).join(''):'<p class="adm-note">Ninguna.</p>'}`}
  b.innerHTML=h}
function admCfg(c){const row=(k,lbl,opts,cur)=>`<div class="adm-cf"><span>${lbl}</span><div>${opts.map(([v,l])=>`<button type="button" class="adm-b" data-c="cfg" data-k="${k}" data-v="${v}" aria-pressed="${String(v)===String(cur)}">${l}</button>`).join('')}</div></div>`;
  return row('secs','Segundos',[['15','15'],['20','20'],['30','30']],c.secs)+row('rounds','Rondas',[['3','3'],['5','5'],['7','7'],['0','Sin límite']],c.rounds)+row('wheel','Ruleta',[['1','Sí'],['0','No']],c.wheel?1:0)+row('ans','Quién escribe',[['turnos','Por turnos'],['equipo','Cualquiera']],c.ans)}
$('#admbody').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b||b.disabled)return;const c=b.dataset.c;
  if(c==='cover1'){AD.cover=!AD.cover;AD.tab='b';$$('.adm-tabs [data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab==='b')));admDraw();return}
  if(c==='cover'){AD.cover=false;admSend('cover',{i:+b.dataset.i});admDraw();return}
  if(c==='tile'){admSend('tile',{i:+b.dataset.i});return}
  if(c==='ctl'){admSend('ctl',{a:b.dataset.a});return}
  if((c==='fresh'||c==='blackq'||c==='kick')&&!admTwice(c+(b.dataset.u||''),b))return;
  if(c==='pts'){admSend('pts',{tm:+b.dataset.t,d:+b.dataset.d});return}
  if(c==='cfg'){admSend('cfg',{k:b.dataset.k,v:b.dataset.v});return}
  if(c==='lite'){admSend('lite',{v:b.dataset.v});return}
  if(c==='move'||c==='kick'){admSend(c,{u:b.dataset.u});return}
  if(c==='blkdel'){admSend('blkdel',{q:b.dataset.q});return}
  admSend(c)});
$('#admbody').addEventListener('change',e=>{if(e.target.id==='admhide')admSend('hide',{v:e.target.checked})});
$('#admbody').addEventListener('submit',e=>{e.preventDefault();const f=e.target;if(f.id==='admpz'){admSend('prize',{v:$('#admpzi').value});toast('Premio guardado');return}
  if(f.classList.contains('adm-tn')){admSend('tname',{tm:+f.dataset.t,v:$('input',f).value});toast('Nombre guardado')}});
admUI();
/* ===================== REACCIONES: emojis que salen en la pantalla grande ===================== */
$('#rxp').innerHTML=REACT.map((e,i)=>`<button type="button" data-e="${i}" aria-label="Mandar ${e}">${e}</button>`).join('');
let RXT=0,RXC=0;
function rxShow(){$('#rxbar').hidden=!(MODE==='play'&&!P.picking)}
function rxAuto(){clearTimeout(RXC);RXC=later(6000,()=>{$('#rxp').hidden=true;$('#rxk').setAttribute('aria-expanded','false')})}
$('#rxk').addEventListener('click',()=>{const o=$('#rxp').hidden;$('#rxp').hidden=!o;$('#rxk').setAttribute('aria-expanded',String(o));if(o)rxAuto()});
$('#rxp').addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(!b)return;const now=performance.now();if(now-RXT<500)return;RXT=now;const i=+b.dataset.e;
  psend({t:'react',e:i});reactFx({e:i,av:P.av,tm:P.team});vib(12);rxAuto();if(!RM())b.animate([{transform:'scale(1)'},{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:260})});
/* ===================== CÓMO SE JUEGA (20 s, opcional) ===================== */
const TUT=[['🚦','Gana el botón','Cuando la luz se ponga verde, ¡toca tu botón! El más rápido gana el turno para su equipo. Si tocas antes, lo pierden.'],
  ['✍️','Adivina qué dijeron','Escribe en tu celular lo que crees que dijeron las 100 personas. Si está en el tablero, se destapa y suma puntos.'],
  ['❌','Tres errores = robo','Con 3 ✕, el otro equipo se pone de acuerdo en secreto y tiene una sola oportunidad para robarse los puntos.'],
  ['🎟️','Comodines','Una vez por partida: 💡 Pista (una letra), 🤫 Silencio (calla al que escribe del otro equipo) y 💬 Junta (pausa para platicar).'],
  ['🎡','La ruleta','Multiplica los puntos de la ronda. ¡Aviéntala con fuerza! Pero no tanta… o la rompes.']];
const TU={i:0,T:0,t0:0,D:4000};
function tutGo(i){TU.i=Math.max(0,Math.min(TUT.length-1,i));const[ic,t,p]=TUT[TU.i];$('#tutic').textContent=ic;$('#tutt').textContent=t;$('#tutp').textContent=p;$('#tutn').textContent=`${TU.i+1} de ${TUT.length}`;
  $('#tutprev').disabled=TU.i===0;$('#tutnext').textContent=TU.i===TUT.length-1?'✓':'▶';TU.t0=performance.now();
  if(!RM())$('.tut-card').animate([{opacity:.4,transform:'translateX(18px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.9,.3,1)'});tick()}
function tutOpen(){$('#tut').hidden=false;tutGo(0);clearInterval(TU.T);TU.T=setInterval(()=>{const f=(performance.now()-TU.t0)/TU.D;$('#tutbar').style.transform=`scaleX(${((TU.i+Math.min(1,f))/TUT.length).toFixed(3)})`;
  if(f>=1){if(TU.i<TUT.length-1)tutGo(TU.i+1);else TU.t0=performance.now()+1e9}},100)}
function tutClose(){$('#tut').hidden=true;clearInterval(TU.T)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-tut]');if(b){ac();loadSounds();tutOpen()}});
$('#tutprev').addEventListener('click',()=>tutGo(TU.i-1));$('#tutnext').addEventListener('click',()=>{if(TU.i===TUT.length-1)tutClose();else tutGo(TU.i+1)});$('#tutx').addEventListener('click',tutClose);
/* ===================== ESPECTADORES: ver sin jugar (y mandar reacciones) ===================== */
function showSpec(){P.picking=false;$('#pick').hidden=true;$('#pad').hidden=false;$('#v-play').classList.add('spec');drawMe();gvShow();rxShow();
  padState('idle','👀 Estás viendo',GV&&GV.on?'El juego se ve aquí arriba. Manda reacciones con 😀. Si quieres jugar, toca tu nombre → Cambiar de equipo.':'Mira la pantalla grande y manda reacciones con 😀. Si quieres jugar, escoge equipo con “Cambiar de equipo”.')}
$('#pspec').addEventListener('click',()=>{ac();loadSounds();P.spec=true;P.team=-1;LS.set('bt-team',{code:P.code,team:-1,spec:1});psend({t:'team',team:-1,spec:1},1);tick();showSpec()});
/* ===================== FOTO DE LOS GANADORES (opcional): se enmarca aquí; a la pantalla grande solo se manda por conexión directa ===================== */
let FPH=null;
function phLoad(file){return new Promise((ok,ko)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{URL.revokeObjectURL(u);ok(im)};im.onerror=e=>{URL.revokeObjectURL(u);ko(e)};im.src=u})}
function phScaled(im,max,q){const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)}
async function phFrame(im,m){try{await document.fonts.load('60px "Lilita One"')}catch(e){}const W=900,H=1140,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),tc=m.w>=0?TCOL[m.w]:'#ff2e88';
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#232c86');g.addColorStop(1,'#0b0f3a');x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){x.fillStyle=['#ffc42e','#ff2e88','#3fe0cc','#fff'][i%4];x.globalAlpha=.55;x.beginPath();x.arc(Math.random()*W,Math.random()*H,3+Math.random()*5,0,7);x.fill()}x.globalAlpha=1;
  const P0=60,S=W-2*P0;x.fillStyle='#ffc42e';x.fillRect(P0-14,P0-14,S+28,S+28);x.fillStyle=tc;x.fillRect(P0-6,P0-6,S+12,S+12);
  const r=Math.max(S/im.naturalWidth,S/im.naturalHeight),w=im.naturalWidth*r,h=im.naturalHeight*r;x.save();x.beginPath();x.rect(P0,P0,S,S);x.clip();x.drawImage(im,P0+(S-w)/2,P0+(S-h)/2,w,h);x.restore();
  x.textAlign='center';x.fillStyle='#fff';x.font='64px "Lilita One",Rubik,sans-serif';const ln=n=>/^(los|las|el|la)\s/i.test(n)?n:'los '+n;x.fillText(m.w<0?'¡Empate!':`🏆 ¡Ganaron ${m.w===0||m.w===1?ln(NAMES[m.w]):''}!`,W/2,P0+S+96);
  x.font='bold 34px Rubik,sans-serif';x.fillStyle='#ffd76a';x.fillText(`${NAMES[0]} ${m.sc[0]} · ${NAMES[1]} ${m.sc[1]}`,W/2,P0+S+150);
  x.font='bold 26px Rubik,sans-serif';x.fillStyle='#b9c1f5';x.fillText('100 Familiares Dijeron · '+new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}),W/2,H-34);
  return c.toDataURL('image/jpeg',.9)}
$('#finphcam').addEventListener('click',()=>$('#finphf').click());$('#finphre').addEventListener('click',()=>$('#finphf').click());
$('#finphf').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f||!FPH)return;
  try{const im=await phLoad(f);const fr=await phFrame(im,FPH);$('#finphimg').src=fr;$('#finphpic').hidden=false;$('#finphcam').hidden=true;
    if(dcOpen(P.dc)){try{P.dc.send(JSON.stringify({t:'wphoto',img:phScaled(im,640,.72)}));$('#finphnote').textContent='¡Ya sale en la pantalla grande!'}catch(er){$('#finphnote').textContent='No se pudo mandar a la pantalla grande, pero aquí la puedes guardar.'}}
    else $('#finphnote').textContent='Solo se ve en tu celular: a la pantalla grande se manda únicamente con conexión directa (mismo Wi-Fi), para que no pase por internet.';
    if(!RM())$('#finphpic').animate([{opacity:0,transform:'rotate(-6deg) scale(.8)'},{opacity:1,transform:'rotate(-2deg) scale(1)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)',fill:'forwards'});sf('rec',.7)}
  catch(er){toast('No se pudo abrir esa foto.')}});
$('#finphsave').addEventListener('click',async()=>{const u=$('#finphimg').src;if(!u)return;
  try{if(navigator.canShare){const b=await (await fetch(u)).blob(),file=new File([b],'100-familiares-ganadores.jpg',{type:'image/jpeg'});if(navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'100 Familiares Dijeron'});return}}}catch(e){if(e&&e.name==='AbortError')return}
  const a=document.createElement('a');a.href=u;a.download='100-familiares-ganadores.jpg';document.body.appendChild(a);a.click();a.remove()});
window.__bt={H,P,WP,UPD,updCheck,AD};
}
