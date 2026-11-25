/* ===================== RONDA RELÁMPAGO: lo que se ve en la pantalla grande (y en la vista del celular) =====================
   v = {ph:'pick'|'b1'|'b2'|'rev'|'done', id, left, tot, tn:[nombres], ps:[[{n,av,a},…],…], prog:[[n,n],[n,n]], bat, qs:[…], cells:[{b,k,t,txt,ans,pts,dup}], sum:[a,b], dbl} */
let FLD={id:null,n:0};
function flBox(){let b=document.getElementById('rlp');if(b)return b;b=document.createElement('div');b.className='fl';b.id='rlp';b.hidden=true;b.setAttribute('role','dialog');b.setAttribute('aria-labelledby','rlpt');
  b.innerHTML=`<div class="fl-in"><div class="fl-h"><b id="rlpt">⚡ Ronda Relámpago</b>${ringHTML('rlpr')}</div><p class="fl-s" id="rlps"></p><div class="fl-tm" id="rlptm"></div><div class="fl-bd" id="rlpbd"></div><div class="fl-sum" id="rlpsum"></div><div class="fl-x" id="rlpx"></div></div>`;
  document.body.appendChild(b);return b}
/* la cinta (¡PUNTOS DOBLES!, etc.) tiene que verse encima de la ronda */
function flBan(on){const n=document.querySelector('.ban');if(n)n.style.zIndex=on?'75':''}
function flDraw(v){const b=flBox();if(!v||v.ph==='done'){if(!b.hidden){b.hidden=true;flBan(false)}FLD={id:null,n:0};return}flBan(true);
  const first=b.hidden||FLD.id!==v.id;if(first){b.hidden=false;FLD={id:v.id,n:0,ph:''};if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))b.firstChild.animate([{opacity:0,transform:'scale(.9)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'})}
  const tn=v.tn||['',''],sub={pick:'Dos de cada equipo contestan 5 preguntas en secreto en su celular. ¡Toquen “Yo juego”!',b1:'Contestan los primeros. ¡Nadie les sople!',b2:'Ahora los segundos: si repiten la respuesta de su compañero, vale 0.',rev:v.dbl?'¡Puntos dobles!':'¿Qué dijeron las 100 personas?'}[v.ph]||'';
  const s=document.getElementById('rlps');if(s.textContent!==sub)s.textContent=sub;
  ringSet(document.getElementById('rlpr'),v.left==null?null:v.left,v.tot||15);
  const tm=document.getElementById('rlptm'),bd=document.getElementById('rlpbd'),play=v.ph!=='rev';tm.hidden=!play;bd.hidden=play;
  if(play){const k=JSON.stringify([v.ph,v.ps,v.prog,v.bat]);if(tm.dataset.k!==k){tm.dataset.k=k;
    tm.innerHTML=[0,1].map(t=>`<div class="fl-team" style="--tc:${TCOL[t]}"><b>${avEsc(tn[t])}</b>`+[0,1].map(j=>{const p=(v.ps[t]||[])[j],on=v.ph==='b'+(j+1),n=((v.prog||[])[t]||[])[j]||0;
      return `<div class="fl-p${on?' on':''}${p?'':' empty'}"><i class="${p&&typeof auraCls==='function'?auraCls(p.a==null?-1:p.a):''}">${p?avSVG(p.av):'?'}</i><span>${p?avEsc(p.n):'(libre)'}</span><em>${v.ph==='pick'?'':Array.from({length:5},(_,x)=>`<u class="${x<n?'on':''}"></u>`).join('')}</em></div>`}).join('')+'</div>').join('')}}
  else{if(FLD.ph!=='rev'||bd.dataset.id!==String(v.id)){bd.dataset.id=String(v.id);FLD.n=0;
      bd.innerHTML=`<div class="fl-row fl-hd"><span></span>${[0,1].map(t=>`<b style="--tc:${TCOL[t]}">${avEsc(tn[t])}</b>`).join('')}</div>`+(v.qs||[]).map((q,k)=>`<div class="fl-row"><span class="fl-q">${k+1}. ${avEsc(q)}</span>${[0,1].map(t=>`<div class="fl-cs" style="--tc:${TCOL[t]}">${[0,1].map(j=>`<div class="fl-c" data-c="${j}-${k}-${t}"><small></small><b></b><em></em></div>`).join('')}</div>`).join('')}</div>`).join('')}
    const cs=v.cells||[];for(let i=FLD.n;i<cs.length;i++){const c=cs[i],el=bd.querySelector(`[data-c="${c.b}-${c.k}-${c.t}"]`);if(!el)continue;
      el.classList.add('on',c.pts>0?'hit':'miss');el.querySelector('small').textContent=c.txt?'«'+c.txt+'»':'(no contestó)';el.querySelector('b').textContent=c.dup?'Repetida':c.ans||'✕';el.querySelector('em').textContent=c.pts>0?c.pts:'0';
      if(!first&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){el.animate([{transform:'rotateX(90deg)',opacity:.3},{transform:'rotateX(-12deg)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:520,easing:'cubic-bezier(.3,1.4,.5,1)'});
        try{if(c.pts>0)sfr(c.pts>=25?'top1':'ok1',.7);else sfr('peg',.7)}catch(e){}el.scrollIntoView({block:'nearest',behavior:'smooth'})}}
    FLD.n=cs.length}
  FLD.ph=v.ph;
  const sm=document.getElementById('rlpsum'),h=v.ph==='rev'?[0,1].map(t=>`<div style="--tc:${TCOL[t]}"><small>${avEsc(tn[t])}</small><b>${v.sum?v.sum[t]:0}</b>${v.dbl?`<em>×2 = ${(v.sum?v.sum[t]:0)*2}</em>`:''}</div>`).join(''):'';
  if(sm.dataset.h!==h){const was=sm.dataset.h||'';sm.dataset.h=h;sm.innerHTML=h;if(v.dbl&&!was.includes('×2')&&!first)try{sfr('pts',.9)}catch(e){}}}
