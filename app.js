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
const ICE=LOCAL?[]:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},
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
const FILES2=['pa','flap','qok','cinta_4','tic','tac','cd1','cd2','cd3','cd4','cd5','grow','tmo'];
function ac(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();const c=AC.createDynamicsCompressor();c.threshold.value=-8;c.ratio.value=12;c.connect(AC.destination);OUT=AC.createGain();OUT.connect(c)}if(AC.state==='suspended')AC.resume();return true}catch(e){return false}}
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
function spk(el,n,cols){if(RM()||!el)return;const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(let i=0;i<n;i++){const p=document.createElement('i');p.className='spk';p.style.cssText=`left:${cx}px;top:${cy}px;background:${cols[i%cols.length]};box-shadow:0 0 8px ${cols[i%cols.length]}`;document.body.appendChild(p);
    const a=Math.random()*Math.PI*2,d=r.width*.45+Math.random()*r.width*.55;p.animate([{transform:'translate(-50%,-50%) scale(1.3)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(.2)`,opacity:0}],{duration:600+Math.random()*450,easing:'cubic-bezier(.15,.7,.35,1)'}).onfinish=()=>p.remove()}}
function pop(el,ms){if(RM()||!el)return;el.animate([{transform:'scale(.4)',opacity:0},{transform:'scale(1.12)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:ms||450,easing:'cubic-bezier(.3,1.5,.5,1)'})}
function shake(el){if(RM()||!el)return;el.animate([0,-12,12,-9,7,-4,0].map(x=>({transform:`translateX(${x}px) rotate(${x*.6}deg)`})),{duration:460,easing:'ease-out'})}

/* ===================== PANTALLA GRANDE ===================== */
const H={net:null,code:'',bi:0,P:new Map(),mem:{},av:(a=>Array.isArray(a)&&a.length===2&&AVM[a[0]]&&AVM[a[1]]&&a[0]!==a[1]?a:['ajolote','jaguar'])(LS.get('bt-av',null)),
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
    H.P.set(uid,{uid,name:String(m.name||'Jugador').slice(0,14),team:tm,ping:old?old.ping:null,last:performance.now()});H.mem[uid]=tm;sendState(uid);drawTeams();if(!old&&H.phase==='lobby')sf('went',.4);
    /* si entra a media ronda, que vea el resultado */
    if(H.res&&H.phase==='res')toP(H.P.get(uid),{t:'res',r:H.r,...H.res});return}
  const pl=H.P.get(uid);if(!pl){toP({uid},{t:'who'});return}
  pl.last=performance.now();
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
  H.presses.push({uid:pl.uid,name:pl.name,team:pl.team,rt:Math.round(rt)});
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
    else if(R.kind==='ok'){sides[R.win].classList.add('win');sides[1-R.win].classList.add('lose');$$('#lamps i').forEach((l,k)=>lamp(k,'t',TCOL[R.win]));semt(`¡${NAMES[R.win]}!`,'wn',TCOL[R.win]);sf('bz'+R.win,.9);spk($('.sav',sides[R.win]),26,[TCOL[R.win],'#fff','#fff3c4']);later(600,()=>sf(R.rec&&R.rec.nuevo?'rec':'fin',.7))}
    else{semt('Nadie tocó','')}}
  let h='';
  if(R.kind==='foul'){const f=R.foul;h=`<h3>Se adelantó</h3><p class="foulx">${esc(f.name)} (${NAMES[f.team]}) tocó <b>${sec(f.before)}</b> antes del ¡YA!</p><p class="verdict">Le toca a ${NAMES[R.win]}</p>`}
  else if(R.kind==='ok'){const L=R.list.slice(0,8),mx=Math.max(250,...L.map(p=>p.rt)),b=L[0],o=R.list.find(p=>p.team!==b.team);
    h=`<h3>Foto finish</h3>`+L.map((p,i)=>`<div class="lane" style="--c:${TCOL[p.team]}"><span>${avSVG(H.av[p.team])}${i+1}. ${esc(p.name)}</span><i><em style="--w:${(p.rt/mx).toFixed(3)}"></em></i><b>${sec(p.rt)}</b></div>`).join('')+
      `<p class="verdict">${o?`¡${esc(b.name)} le ganó a ${NAMES[o.team]} por ${sec(o.rt-b.rt)}!`:`¡${esc(b.name)} fue el más rápido!`}</p>`+
      (R.rec?(R.rec.nuevo?`<span class="rec">¡Nuevo récord! ${sec(R.rec.rt)}</span>`:`<span class="rc">Récord: ${sec(R.rec.rt)} (${esc(R.rec.name)})</span>`):'')}
  else h=`<h3>Nadie tocó</h3><p class="verdict">Toquen “Otra vez” para repetir.</p>`;
  box.innerHTML=h;box.hidden=false;if(first&&!RM()){box.animate([{opacity:0,transform:'translateY(20px) scale(.95)'},{opacity:1,transform:'none'}],{duration:420,delay:R.kind==='foul'?900:300,fill:'backwards',easing:'cubic-bezier(.3,1.4,.5,1)'});$$('.lane em',box).forEach((e,k)=>e.animate([{transform:'scaleX(0)'},{transform:`scaleX(${e.style.getPropertyValue('--w')})`}],{duration:650,delay:450+k*110,easing:'cubic-bezier(.2,.8,.3,1)',fill:'backwards'}))}}
function backToLobby(){if(H.phase==='arm'||H.phase==='go')bcast({t:'cancel'},1);clearHT();H.phase='lobby';showArena(false);$('#go').disabled=false;$('#go').textContent='¡Probar botones!';drawTeams()}
/* escoger animalito de cada equipo */
let SHEET=0;
function openSheet(t){SHEET=t;const s=$('#avsheet');s.style.setProperty('--tc',TCOL[t]);$('#avtitle').textContent='Animalito de '+NAMES[t];
  $('#avg').innerHTML=AVS3.map(a=>`<button type="button" data-av="${a.id}" aria-pressed="${H.av[t]===a.id}" class="${H.av[1-t]===a.id?'taken':''}" ${H.av[1-t]===a.id?'disabled':''}><i>${avSVG(a.id)}</i>${a.n}</button>`).join('');s.hidden=false}
$('#avg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;H.av[SHEET]=b.dataset.av;LS.set('bt-av',H.av);openSheet(SHEET);drawTeams();bcastState()});
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
function playStart(code,name,bi){MODE='play';P.code=code;P.name=name;P.st=null;P.found=false;LS.set('bt-name',name);const sv=LS.get('bt-team',null);P.team=sv&&sv.code===code?sv.team:-1;
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
function hello(){if(P.net)P.net.pub(ptp('h'),{t:'hello',u:P.uid,name:P.name,team:P.team},1)}
function psend(m,q){if(dcOpen(P.dc)){try{P.dc.send(JSON.stringify(m));return}catch(e){}}if(P.net)P.net.pub(ptp('h'),{...m,u:P.uid},q||0)}
function dropP(){try{P.pc&&P.pc.close()}catch(e){}P.pc=null;P.dc=null}
async function playRTC(){if(!RTC_OK||P.pc||MODE!=='play')return;const pc=new RTCPeerConnection({iceServers:ICE});P.pc=pc;const dc=pc.createDataChannel('b',{ordered:true});
  dc.onopen=()=>{if(P.pc!==pc)return;P.dc=dc;setStat('#pstat','Conectado directo','ok');later(800,async()=>{const k=await pathType(pc);if(P.dc===dc)setStat('#pstat',k==='relevo'?'Conectado por relevo':k==='casa'?'Conectado directo (Wi-Fi)':'Conectado directo','ok')})};dc.onclose=()=>{if(P.dc===dc){P.dc=null;setStat('#pstat','Conectado','ok');later(4000,()=>{if(P.pc===pc){dropP();playRTC()}})}};
  dc.onmessage=ev=>{let x;try{x=JSON.parse(ev.data)}catch(e){return}if(x&&typeof x==='object')playMsg('dc',x)};
  try{await pc.setLocalDescription(await pc.createOffer());await gathered(pc,2500);if(P.pc!==pc)return;psend({t:'rtc-offer',sdp:pc.localDescription.sdp},1)}catch(e){dropP();return}
  /* si en 12 s no se abrió, se queda por el servidor */
  later(12000,()=>{if(P.pc===pc&&!dcOpen(dc))dropP()})}
const myAv=()=>P.st&&P.team>=0?P.st.av[P.team]:'ajolote';
function drawMe(){const t=P.team,v=$('#v-play');v.classList.toggle('t1',t===1);
  $('#me').innerHTML=(t>=0&&P.st?avSVG(P.st.av[t]):'')+`<span>${esc(P.name)}<small>${t>=0?NAMES[t]:'Sin equipo'}</small></span>`;
  if(t>=0&&P.st)$('#pav').innerHTML=avSVG(P.st.av[t]);
  $('#chteam').hidden=!P.found}
function playMsg(topic,m){
  if(topic.endsWith('/up')){if(m.t==='up'&&!P.found)hello();return}
  P.lastHost=performance.now();
  if(m.t==='ping'){psend({t:'pong',ts:m.ts});return}
  if(m.t==='who'){hello();return}
  if(m.t==='rtc-answer'){if(P.pc&&typeof m.sdp==='string'&&P.pc.signalingState==='have-local-offer')P.pc.setRemoteDescription({type:'answer',sdp:m.sdp}).catch(()=>dropP());return}
  if(m.t==='state'){const firstFound=!P.found,prevT=P.team;P.found=true;setNames(m.names);if(m.info&&m.info.text)P.info=m.info;if(Array.isArray(m.av))preAnimals(m.av);clearTimeout(P.probeT);P.st=m;P.foul=!!m.foul;if(m.team===0||m.team===1)P.team=m.team;else if(m.team===-1)P.team=-1;
    if(!dcOpen(P.dc))setStat('#pstat','Conectado por servidor','ok');drawMe();if(firstFound)later(300,playRTC);
    if(P.phase==='idle'||P.phase==='res'){if(P.team<0)showPick();else if(P.picking&&prevT<0&&!firstFound){showPad();toast('La pantalla del juego te puso en '+NAMES[P.team]+'.')}else if(P.picking)drawPick();else if(firstFound)showPad();else gvShow()}else drawPick();return}
  if(m.t==='info'){P.info={text:m.text,sub:m.sub||''};if(P.found&&P.phase==='idle'&&!$('#pad').hidden){$$('#plamps i').forEach(l=>{l.className='';l.style.removeProperty('--wc')});padState('idle',P.info.text,P.info.sub)}return}
  if(!P.found)return;
  if(m.t==='view'){gvDraw(m);wphView(m);return}
  if(m.t==='wspin'){wphSpin(m);return}
  if(m.t==='kick'){playStop();toast('La pantalla del juego te sacó de la sala.');return}
  if(m.t==='ask'){showAsk(m);return}if(m.t==='asked'||m.t==='judged'||m.t==='close'||m.t==='lock'){askMsg(m);return}
  if(m.t==='arm'){hideAsk();arm(m)}else if(m.t==='res')onRes(m);else if(m.t==='cancel'){clearPT();P.phase='idle';hideRes();showPad();padState('idle','Esperen la siguiente ronda','')}}
function drawPick(){const st=P.st;$('#pteams').innerHTML=st?[0,1].map(t=>`<button type="button" data-t="${t}" style="--tc:${TCOL[t]}" aria-pressed="${P.team===t}"><i>${avSVG(st.av[t])}</i><b>${NAMES[t]}</b><small>${st.counts[t]} ${st.counts[t]===1?'jugador':'jugadores'}</small></button>`).join(''):'<p>Conectando…</p>'}
function showPick(){P.picking=true;drawPick();$('#pick').hidden=false;$('#pad').hidden=true;gvShow()}
function showPad(){P.picking=false;$('#pick').hidden=true;$('#pad').hidden=false;drawMe();gvShow();if(P.phase==='idle'){if(P.info)padState('idle',P.info.text,P.info.sub);else padState('idle','Esperen la siguiente ronda','Cuando la pantalla grande empiece, aquí sale el semáforo')}}
function padState(cls,msg,sub){$('#pad').className='pad '+cls;$('#v-play').dataset.pad=cls;$('#pmsg').textContent=msg;if(sub!=null)$('#psub').textContent=sub}
function plamp(k,c){const l=$$('#plamps i')[k];l.className=c;if(!RM())l.animate([{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:220})}
function clearPT(){P.T.forEach(clearTimeout);P.T=[];clearTimeout(P.q);P.q=0}
function arm(m){clearPT();hideRes();P.r=m.r;P.rt=0;P.lateUntil=0;P.foul=!!m.foul;P.phase='wait';P.lock=0;P.yaAt=performance.now()+m.d;
  if(P.team<0){showPick();return}showPad();$$('#plamps i').forEach(l=>{l.className='';l.style.removeProperty('--wc')});
  padState('wait','Prepárense…',P.foul?'Si tocas antes del ¡YA!, tu equipo pierde el turno':'Esperen la luz verde');
  m.lights.forEach((ms,k)=>P.T.push(later(ms,()=>{if(P.phase==='wait'){plamp(k,'r');sf('lr',.35)}})));
  P.T.push(later(m.d,()=>{if(P.phase!=='wait')return;P.phase='go';P.yaAt=performance.now();$$('#plamps i').forEach(l=>l.className='g');padState('go','¡YA!','¡Toca el botón!');sf('ya',.7);vib(70);
    requestAnimationFrame(f=>{if(P.phase==='go'&&f>P.yaAt&&f-P.yaAt<200)P.yaAt=f})}))}
/* menos de 0.1 s después del ¡YA! nadie reacciona: eso es adivinar */
const MIN_RT=100;
function press(ts){const pn=performance.now(),now=ts>0&&ts<=pn&&pn-ts<300?ts:pn,dome=$('#dome');
  if(P.phase==='go'&&!P.foul&&(P.lock>now||now-P.yaAt<MIN_RT)){if(P.lock<=now){P.lock=now+400;animal(myAv(),.7)}vib(25);shake(dome);$('#psub').textContent='¡Muy pronto! Espera tantito y vuelve a tocar';return}
  if(P.phase==='go'){
    P.phase='sent';P.rt=now-P.yaAt;psend({t:'press',r:P.r,rt:P.rt},1);tick();vib(30);padState('sent','¡Listo!',`Tu tiempo: ${sec(P.rt)}`);spk(dome,22,['#fff','#fff3c4',getComputedStyle($('#v-play')).getPropertyValue('--tc')]);return}
  if(P.phase==='wait'){
    if(P.foul){P.phase='early';psend({t:'early',r:P.r,before:Math.max(0,P.yaAt-now)},1);animal(myAv(),1);vib([60,40,60]);padState('early','¡Te adelantaste!','Esperen el resultado…');shake(dome);return}
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
  showRes(cls,big,txt,sub,av);
  if(first){if(cls==='win')sf('bz'+me,.85);else if(cls==='foul'&&m.foul.uid!==P.uid)animal(myAv(),.8);vib(cls==='win'?[40,40,80]:60)}
  clearTimeout(P.resT);P.resT=later(4500,()=>{hideRes();if(P.phase==='res'){P.phase='idle';showPad()}})}
function showRes(cls,big,txt,sub,av){const r=$('#pres');r.className='pres '+cls;r.innerHTML=(av?avSVG(av):'')+`<b>${esc(big)}</b><p>${esc(txt)}</p>`+(sub?`<p>${esc(sub)}</p>`:'');r.hidden=false;if(!RM()){pop($('.l3-svg',r),600);r.animate([{opacity:0},{opacity:1}],{duration:250})}}
function hideRes(){clearTimeout(P.resT);$('#pres').hidden=true}
function onDome(e){const d=$('#dome');if(MODE!=='play'||$('#pad').hidden)return false;const r=d.getBoundingClientRect();if(!r.width)return false;return Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2))<=r.width/2}
document.addEventListener('pointerdown',e=>{if(MODE!=='play'||!$('#ask').hidden||e.target.closest('button,input,a,.pbar'))return;if(!onDome(e))return;e.preventDefault();const p=$('#pad');if(P.phase==='go'||P.phase==='idle')p.classList.add('press');press(e.timeStamp)},{passive:false});
['pointerup','pointercancel'].forEach(k=>document.addEventListener(k,()=>$('#pad').classList.remove('press')));
$('#pteams').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ac();loadSounds();P.team=+b.dataset.t;LS.set('bt-team',{code:P.code,team:P.team});psend({t:'team',team:P.team},1);tick();showPad()});
$('#gvch').addEventListener('click',e=>$('#chteam').click());
$('#chteam').addEventListener('click',e=>{e.stopPropagation();if(P.phase==='wait'||P.phase==='go'||P.phase==='sent'||P.phase==='early'){toast('Espera a que termine la ronda para cambiarte.');return}
  if(!P.found){toast('Primero se tiene que conectar con la pantalla grande.');return}showPick()});
addEventListener('pagehide',()=>{if(MODE==='play')psend({t:'bye'},0)});

/* nombres de los equipos que pone la pantalla del juego */
function setNames(n){if(!Array.isArray(n)||n.length!==2)return;let ch=false;[0,1].forEach(t=>{const v=String(n[t]||'').slice(0,14);if(v&&NAMES[t]!==v){NAMES[t]=v;ch=true}});
  if(!ch)return;[0,1].forEach(t=>$('#gvt'+t+' b').textContent=NAMES[t]);drawMe();if(P.picking)drawPick()}
/* salir de la partida (por ejemplo si la pantalla del juego te saca) */
function playStop(){clearInterval(P.helloT);clearTimeout(P.probeT);clearPT();hideAsk();hideRes();if(P.net){const n=P.net;P.net=null;later(200,()=>{try{n.close()}catch(e){}})}dropP();
  MODE='';P.found=false;GV=null;gvShow();LS.set('bt-team',null);location.hash='';show('home')}

/* ===================== EL JUEGO EN EL CELULAR (modo celulares) ===================== */
let GV=null;
function boing(){if(!AC)return;try{const t=AC.currentTime+.02,s=AC.createOscillator(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();s.type='sine';s.frequency.setValueAtTime(380,t);s.frequency.exponentialRampToValueAtTime(90,t+.55);
  l.frequency.value=12;lg.gain.value=11;l.connect(lg);lg.connect(s.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.42,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.62);s.connect(g);g.connect(OUT);s.start(t);l.start(t);s.stop(t+.7);l.stop(t+.7)}catch(e){}}
const gvOn=()=>!!(GV&&GV.on&&P.found&&P.team>=0&&!P.picking);
function gvShow(){const on=gvOn();$('#gv').hidden=!on;$('#v-play').classList.toggle('gvon',on);
  if(on){const f=$('#gvf');if(!f.dataset.on){f.dataset.on=1;f.src='ver.html';FILES2.forEach(loadOne)}}}
let VERok=false;
function verSend(v){const f=$('#gvf');if(VERok&&f.contentWindow)try{f.contentWindow.postMessage({t:'view',v},'*')}catch(e){}}
/* sonidos que pide la pantalla del juego en vivo */
function sfR(n,vol,rate){if(!AC||!BUF[n])return;try{const s=AC.createBufferSource(),g=AC.createGain();s.buffer=BUF[n];s.playbackRate.value=rate||1;g.gain.value=vol==null?.85:vol;s.connect(g);g.connect(OUT);s.start()}catch(e){}}
addEventListener('message',e=>{const f=$('#gvf');if(!f||e.source!==f.contentWindow)return;const d=e.data||{};
  if(d.t==='ver-listo'){VERok=true;if(GV)verSend(GV);return}
  if(d.t==='snd'&&gvOn()&&typeof d.n==='string'){if(d.n==='boing')boing();else{if(!BUF[d.n])loadOne(d.n);sfR(d.n,+d.vol||.85,+d.rate||1)}}});
function gvDraw(v){const old=GV;GV=v;gvShow();verSend(v);if(!v.on)return;const snd=false;
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
  if(!$('#wph').hidden&&WP.on&&!WP.me)sf('thr',.6);wphGo()}
/* aventarla con el dedo (solo a quien le toca) */
function wphAng(e){const r=$('#wphc').getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI}
$('#wphw').addEventListener('pointerdown',e=>{if(!WP.me||WP.spin||WP.res)return;e.preventDefault();try{$('#wphw').setPointerCapture(e.pointerId)}catch(_){}ac();loadSounds();
  WP.drag=true;WP.aPrev=wphAng(e);WP.smp=[{t:performance.now(),th:WP.th}];$('#wphh').hidden=true;$('#wphr').textContent=''});
$('#wphw').addEventListener('pointermove',e=>{if(!WP.drag)return;const a=wphAng(e);let d=a-WP.aPrev;if(d>180)d-=360;if(d<-180)d+=360;WP.aPrev=a;WP.th+=d;wphRot();const n=performance.now();WP.smp.push({t:n,th:WP.th});while(WP.smp.length>2&&n-WP.smp[0].t>110)WP.smp.shift();
  const pg=Math.floor(WP.th/45);if(pg!==WP.peg){WP.peg=pg;vib(4)}});
const wphUp=()=>{if(!WP.drag)return;WP.drag=false;const s=WP.smp,a=s[0],b=s[s.length-1],dt=Math.max(16,b.t-a.t)/1000,om=(b.th-a.th)/dt;
  if(Math.abs(om)<260||performance.now()-b.t>160){const r=$('#wphr');r.className='wph-r on';r.textContent='¡Más fuerte! ¡Aviéntala!';shake(r);$('#wphh').hidden=false;return}
  psend({t:'wthrow',om},1);sf('thr',.7);vib(20);WP.flickAt=performance.now();
  /* mientras llega la respuesta, la ruleta ya va girando */
  const om2=Math.sign(om)*Math.min(2600,Math.max(1000,Math.abs(om)));WP.pred=wTraj(WP.th,om2,1);WP.P=WP.pred;WP.t0=WP.flickAt;WP.spin=true;$('#wphs').textContent='¡Allá va!';wphGo()};
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
function showAsk(m){clearTimeout(AK.hT);const s=$('#ask'),again=AK.id===m.a,wasDone=!s.hidden&&s.classList.contains('done');AK.id=m.a;AK.sent=false;AK.mine=false;AK.sec=Math.max(2,+m.sec||15);AK.end=performance.now()+AK.sec*1000;AK.last='';
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
  AK.sent=true;AK.mine=true;psend({t:'answer',a:AK.id,text:t},1);tick();vib(30);$('#aski').disabled=true;try{$('#aski').blur()}catch(e){}
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
  else if(m.res==='dup'){akRes('dup','¡Esa ya salió!','Ahorita te dan otra oportunidad',m.ans);vib(60)}
  else if(m.res==='time'){akRes('time','¡Se acabó el tiempo!','Ni modo, cuenta como error');vib([60,40,60]);shake($('#askres b'));AK.hT=later(2800,hideAsk)}
  else{akRes('miss','No está en el tablero','Si sí contaba, la pantalla todavía la puede destapar',AK.txt?'“'+AK.txt+'”':'');vib([60,40,60]);shake($('#askres b'));AK.hT=later(3400,hideAsk)}}
$('#aski').addEventListener('input',()=>{akPrev();const now=performance.now();clearTimeout(AK.tw);const go=()=>{AK.tl=performance.now();psend({t:'typing',a:AK.id,w:akWords($('#aski').value).map(x=>x.length).slice(0,8)})};
  if(now-(AK.tl||0)>150)go();else AK.tw=later(160,go)});
$('#askf').addEventListener('submit',e=>{e.preventDefault();akSend()});
$('#ask').addEventListener('pointerdown',e=>{if(!AK.sent&&!e.target.closest('form,button'))later(0,()=>$('#aski').focus())});

/* ===================== INICIO ===================== */
/* partida guardada en este aparato: se puede continuar */
function savedGame(){try{const g=JSON.parse(localStorage.getItem('j-game')||'null'),c=JSON.parse(localStorage.getItem('j-cfg')||'{}')||{};
  if(!g||g.ended||!Array.isArray(g.sc))return null;if(!(g.ri>0||g.sc[0]+g.sc[1]>0||g.fin>=0))return null;return{g,c}}catch(e){return null}}
function drawSaved(){const s=savedGame();$('#contcard').hidden=!s;$('#modesnote').hidden=!s;$('#createbtn').classList.toggle('star',!s);if(!s)return;
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
let DEF=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEF=e;$('#install').hidden=false});
$('#install').addEventListener('click',async()=>{if(!DEF)return;DEF.prompt();try{await DEF.userChoice}catch(e){}DEF=null;$('#install').hidden=true});
if('serviceWorker' in navigator&&!LOCAL)navigator.serviceWorker.register('sw.js').catch(()=>{});
$('#pname').value=P.name;
{const m=location.hash.match(/^#j=([A-Za-z0-9]{4})(?:-(\d))?$/);if(m){$('#joinf').hidden=false;$('#code').value=m[1].toUpperCase();if(m[2]!=null)LINKBI=Math.min(+m[2],BROKERS.length-1);later(50,()=>$('#pname').focus())}}
window.__bt={H,P,WP};
}
