/* cuánto da cada cosa en fichas 🪙: una partida normal deja como 55–70 (lo usan el celular y la pantalla del juego) */
const COIN={game:20,win:25,tie:10,day:15,streak:10,hit:3,one:3,steal:6,bz:2,flMax:20,ach:[10,20,40,70,120,200,300],tp:[300,150,75]};
/* ===================== TIENDA: catálogo, precios y cómo se dibuja cada cosa =====================
   Todo es de adorno (nada ayuda a ganar). Se compra con fichas 🪙 que se ganan jugando.
   Tipos: sk piel del animalito · ac accesorio · fo fondo · au aura · ti título · wr letras · hz caballo · bu burbuja de chat · ce celebración al ganar el botón */
const PRICE=[80,180,350,700,1200,2200];
const SHOP=[
  /* animalitos que solo hay en la tiendita */
  {id:'pinguino',k:'av',r:2,n:'Pingüino'},{id:'zorro',k:'av',r:2,n:'Zorro'},{id:'panda',k:'av',r:3,n:'Panda'},{id:'dragon',k:'av',r:4,n:'Dragón'},{id:'fenix',k:'av',r:5,n:'Fénix'},
  /* pieles: le cambian los colores a tu animalito (sirven con cualquiera) */
  {id:'sk_choco',k:'sk',r:0,n:'Piel chocolate'},{id:'sk_menta',k:'sk',r:0,n:'Piel menta'},{id:'sk_sombra',k:'sk',r:1,n:'Piel sombra'},
  {id:'sk_nieve',k:'sk',r:2,n:'Piel de nieve'},{id:'sk_neon',k:'sk',r:2,n:'Piel neón'},{id:'sk_oro',k:'sk',r:3,n:'Piel de oro'},
  {id:'sk_fantasma',k:'sk',r:3,n:'Piel fantasma'},{id:'sk_lava',k:'sk',r:4,n:'Piel de lava'},{id:'sk_galaxia',k:'sk',r:4,n:'Piel galaxia'},{id:'sk_arcoiris',k:'sk',r:5,n:'Piel arcoíris'},
  {id:'sk_coral',k:'sk',r:0,n:'Piel coral'},{id:'sk_cielo',k:'sk',r:1,n:'Piel cielo'},{id:'sk_veneno',k:'sk',r:2,n:'Piel veneno'},{id:'sk_cristal',k:'sk',r:3,n:'Piel de cristal'},
  /* accesorios */
  {id:'ac_gorrito',k:'ac',r:0,n:'Gorrito de fiesta'},{id:'ac_estrellas',k:'ac',r:0,n:'Estrellitas'},{id:'ac_mono',k:'ac',r:0,n:'Moño'},
  {id:'ac_medalla',k:'ac',r:1,n:'Medalla'},{id:'ac_audifonos',k:'ac',r:1,n:'Audífonos gamer'},{id:'ac_flor',k:'ac',r:1,n:'Flor en la oreja'},
  {id:'ac_charro',k:'ac',r:2,n:'Sombrero de charro'},{id:'ac_cuernos',k:'ac',r:2,n:'Cuernitos'},{id:'ac_corona',k:'ac',r:3,n:'Corona'},{id:'ac_halo',k:'ac',r:4,n:'Aureola'},
  {id:'ac_gorra',k:'ac',r:0,n:'Gorra'},{id:'ac_globo',k:'ac',r:1,n:'Globito'},{id:'ac_mago',k:'ac',r:2,n:'Sombrero de mago'},{id:'ac_vikingo',k:'ac',r:3,n:'Casco vikingo'},
  /* fondos */
  {id:'fo_atardecer',k:'fo',r:0,n:'Fondo atardecer'},{id:'fo_mar',k:'fo',r:1,n:'Fondo mar'},{id:'fo_oro',k:'fo',r:2,n:'Fondo dorado'},
  {id:'fo_lava',k:'fo',r:3,n:'Fondo volcán'},{id:'fo_galaxia',k:'fo',r:3,n:'Fondo galaxia'},{id:'fo_arcoiris',k:'fo',r:4,n:'Fondo arcoíris'},
  {id:'fo_selva',k:'fo',r:0,n:'Fondo selva'},{id:'fo_dulce',k:'fo',r:1,n:'Fondo dulce'},{id:'fo_noche',k:'fo',r:2,n:'Fondo noche estrellada'},{id:'fo_aurora',k:'fo',r:4,n:'Fondo aurora'},
  /* auras de la tienda */
  {id:'au_menta',k:'au',r:0,n:'Aura menta'},{id:'au_neon',k:'au',r:1,n:'Aura neón'},{id:'au_hielo',k:'au',r:2,n:'Aura de hielo'},{id:'au_corazon',k:'au',r:2,n:'Aura de corazones'},
  {id:'au_galaxia',k:'au',r:3,n:'Aura galaxia'},{id:'au_oro',k:'au',r:4,n:'Aura de oro'},{id:'au_fantasma',k:'au',r:4,n:'Aura fantasma'},{id:'au_prisma',k:'au',r:5,n:'Aura prisma'},
  {id:'au_sol',k:'au',r:0,n:'Aura de sol'},{id:'au_selva',k:'au',r:1,n:'Aura de selva'},{id:'au_fuego',k:'au',r:3,n:'Aura de fuego'},{id:'au_tormenta',k:'au',r:4,n:'Aura de tormenta'},
  /* títulos */
  {id:'ti_mantequilla',k:'ti',r:0,n:'Dedos de Mantequilla'},{id:'ti_panucho',k:'ti',r:0,n:'Panucho Feliz'},{id:'ti_tianguis',k:'ti',r:0,n:'Rey del Tianguis'},
  {id:'ti_pulpo',k:'ti',r:1,n:'Cerebro de Pulpo'},{id:'ti_bomba',k:'ti',r:1,n:'Bomba Yucateca'},{id:'ti_casi',k:'ti',r:1,n:'Casi la Atino'},
  {id:'ti_habanero',k:'ti',r:2,n:'Puro Habanero'},{id:'ti_progreso',k:'ti',r:2,n:'Leyenda de Progreso'},{id:'ti_encuesta',k:'ti',r:2,n:'Encuestador Profesional'},
  {id:'ti_senor',k:'ti',r:3,n:'Señor de las Respuestas'},{id:'ti_mente',k:'ti',r:3,n:'Mente Maestra'},
  {id:'ti_calor',k:'ti',r:4,n:'Más Rápido que el Calor'},{id:'ti_oraculo',k:'ti',r:4,n:'El Oráculo'},{id:'ti_dueno',k:'ti',r:5,n:'Dueño del Tablero'},
  {id:'ti_sobremesa',k:'ti',r:0,n:'Sabelotodo de Sobremesa'},{id:'ti_cochinita',k:'ti',r:0,n:'Cochinita Power'},{id:'ti_chisme',k:'ti',r:1,n:'Experto en Chismes'},{id:'ti_halcon',k:'ti',r:1,n:'Ojo de Halcón'},
  {id:'ti_huracan',k:'ti',r:2,n:'Huracán Peninsular'},{id:'ti_marquesita',k:'ti',r:2,n:'Rey de la Marquesita'},{id:'ti_sureste',k:'ti',r:3,n:'El Botón Más Rápido del Sureste'},{id:'ti_cenote',k:'ti',r:4,n:'Más Profundo que un Cenote'},{id:'ti_leyenda',k:'ti',r:5,n:'Leyenda Familiar'},
  /* letras de tus respuestas en la pantalla */
  {id:'neon',k:'wr',r:2,n:'Letras neón'},{id:'hielo',k:'wr',r:3,n:'Letras de hielo'},{id:'fuego',k:'wr',r:4,n:'Letras de fuego'},{id:'arcoiris',k:'wr',r:5,n:'Letras arcoíris'},
  {id:'chicle',k:'wr',r:0,n:'Letras de chicle'},{id:'tiza',k:'wr',r:0,n:'Letras de gis'},{id:'comic',k:'wr',r:1,n:'Letras de cómic'},{id:'retro',k:'wr',r:1,n:'Letras de maquinita'},
  {id:'mar',k:'wr',r:2,n:'Letras de mar'},{id:'sombra',k:'wr',r:2,n:'Letras 3D'},{id:'glitch',k:'wr',r:3,n:'Letras glitch'},{id:'holo',k:'wr',r:4,n:'Letras holograma'},
  /* caballos */
  {id:'rosa',k:'hz',r:0,n:'Pony rosa'},{id:'cebra',k:'hz',r:1,n:'Cebra'},{id:'noche',k:'hz',r:2,n:'Caballo de medianoche'},{id:'dorado',k:'hz',r:3,n:'Caballo dorado'},
  {id:'choco',k:'hz',r:0,n:'Caballo chocolate'},{id:'hielo',k:'hz',r:1,n:'Caballo de hielo'},{id:'neon',k:'hz',r:2,n:'Caballo neón'},{id:'galaxia',k:'hz',r:4,n:'Caballo galaxia'},
  /* burbujas del chat */
  {id:'bu_corazon',k:'bu',r:0,n:'Burbuja de corazón'},{id:'bu_neon',k:'bu',r:1,n:'Burbuja neón'},{id:'bu_oro',k:'bu',r:2,n:'Burbuja de oro'},{id:'bu_galaxia',k:'bu',r:3,n:'Burbuja galaxia'},
  {id:'bu_menta',k:'bu',r:0,n:'Burbuja menta'},{id:'bu_nube',k:'bu',r:0,n:'Burbuja nube'},{id:'bu_pizarra',k:'bu',r:1,n:'Burbuja pizarrón'},{id:'bu_comic',k:'bu',r:1,n:'Burbuja de cómic'},
  {id:'bu_hielo',k:'bu',r:2,n:'Burbuja de hielo'},{id:'bu_fuego',k:'bu',r:3,n:'Burbuja de fuego'},{id:'bu_retro',k:'bu',r:3,n:'Burbuja de maquinita'},{id:'bu_arcoiris',k:'bu',r:4,n:'Burbuja arcoíris'},
  /* celebración cuando ganas el botón (sale en la pantalla y en tu celular) */
  {id:'ce_confeti',k:'ce',r:0,n:'Celebración: confeti'},{id:'ce_globos',k:'ce',r:1,n:'Celebración: globos'},{id:'ce_fuegos',k:'ce',r:2,n:'Celebración: fuegos artificiales'},
  {id:'ce_rayo',k:'ce',r:3,n:'Celebración: rayo'},{id:'ce_corona',k:'ce',r:4,n:'Celebración: corona'},{id:'ce_arcoiris',k:'ce',r:5,n:'Celebración: arcoíris'},
  {id:'ce_corazones',k:'ce',r:1,n:'Celebración: corazones'},{id:'ce_monedas',k:'ce',r:2,n:'Celebración: lluvia de monedas'},{id:'ce_pinata',k:'ce',r:4,n:'Celebración: piñata'}];
const SHOPM={};SHOP.forEach(x=>{x.p=PRICE[x.r];SHOPM[x.k+':'+x.id]=x;if(!SHOPM[x.id])SHOPM[x.id]=x});
const shopGet=(k,id)=>SHOPM[k+':'+id]||null;
const SHOPK={av:'Animalito',sk:'Piel',ac:'Accesorio',fo:'Fondo',au:'Aura',ti:'Título',wr:'Letras',hz:'Caballo',bu:'Burbuja',ce:'Celebración'};

/* ===== la tienda del día: igual para todos, cambia a medianoche ===== */
function shopDay(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function shopRng(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
/* qué tan seguido sale cada rareza: común 34 % … mítico 1.5 %; el destacado (rebajado) solo de raro para arriba */
const SHOPW=[34,28,20,11,5.5,1.5],SHOPWF=[0,0,45,32,18,5];
function shopToday(day){const rnd=shopRng('100f-tienda:'+(day||shopDay())),used=new Set(),out=[];
  const roll=w=>{let x=rnd()*w.reduce((a,b)=>a+b,0);for(let r=0;r<w.length;r++){x-=w[r];if(x<0)return r}return 0};
  const pickOf=r=>{for(let rr=r;rr>=0;rr--){const L=SHOP.filter(x=>x.r===rr&&!used.has(x.k+':'+x.id));if(L.length){const it=L[Math.floor(rnd()*L.length)];used.add(it.k+':'+it.id);return it}}return null};
  const f=pickOf(roll(SHOPWF));if(f)out.push({it:f,p:Math.round(f.p*.85/10)*10,star:1});
  while(out.length<7){const it=pickOf(roll(SHOPW));if(!it)break;out.push({it,p:it.p})}return out}

/* ===== el animalito con piel, accesorio y fondo: "base~piel~accesorio~fondo" ===== */
const SKPAL={sk_choco:[['#3b2412','#7a4a26','#c89a6a'],'#5a3a20'],sk_menta:[['#1f8a6a','#5fe0b6','#d4fff2'],'#0f6b5a'],sk_sombra:[['#14141c','#34344a','#62627c'],'#06060c'],
  sk_nieve:[['#7fa8c9','#cfe8ff','#ffffff'],'#2c6fa8'],sk_neon:[['#ff2bd6','#00e5ff','#c6ff00'],'#140a30'],sk_oro:[['#7a5200','#d4a017','#ffe680'],'#4a3300'],
  sk_fantasma:[['#8fa6e8','#cfdcff','#f6f8ff'],'#3b3f8f'],sk_lava:[['#5a0a00','#ff4d00','#ffc04d'],'#220300'],sk_galaxia:[['#2a1060','#6a3cff','#c9a8ff'],'#0b0624'],sk_arcoiris:[null,'#2a1c5a'],
  sk_coral:[['#a8323a','#ff6f61','#ffc2b3'],'#7a1f2a'],sk_cielo:[['#1e5fa8','#5bb6ff','#d6efff'],'#123f75'],sk_veneno:[['#3b0a5a','#8bff3a','#e0ffc0'],'#1f0533'],sk_cristal:[['#6b5bd6','#c4b8ff','#f4f0ff'],'#2e2470']};
const RAINBOW=['#ff5c9a','#ffd23f','#3fe0cc','#8b5cf6','#ff8a1a','#5fe06a'];
const hexL=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;return .2126*r+.7152*g+.0722*b};
function skinArt(art,sk){const P=SKPAL[sk];if(!P)return art;let k=0;const map={};
  return art.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g,c=>{const lc=c.toLowerCase();if(lc==='#2b1840'||lc==='#fff'||lc==='#ffffff')return c;const L=hexL(lc);if(L<.06||L>.96)return c;
    if(map[lc])return map[lc];return map[lc]=P[0]?P[0][L<.33?0:L<.62?1:2]:RAINBOW[(k++)%RAINBOW.length]})}
const ACC={
  ac_gorrito:`<g transform="translate(0 7)"><path d="M60 -2L77 28H43Z" fill="#ff5c9a" stroke="#2b1840" stroke-width="2.6" stroke-linejoin="round"/><path d="M52 14h16M48 22h24" stroke="#ffd23f" stroke-width="3"/><circle cx="60" cy="-1" r="5.5" fill="#ffd23f" stroke="#2b1840" stroke-width="2.4"/></g>`,
  ac_estrellas:`<g fill="#ffe680" stroke="#2b1840" stroke-width="1.8" stroke-linejoin="round"><path d="M18 8l3 8l8 3l-8 3l-3 8l-3-8l-8-3l8-3z"/><path d="M102 16l2.4 6l6 2.4l-6 2.4l-2.4 6l-2.4-6l-6-2.4l6-2.4z"/><path d="M104 86l2 5l5 2l-5 2l-2 5l-2-5l-5-2l5-2z"/></g>`,
  ac_mono:`<g transform="translate(84 20) rotate(18)" stroke="#2b1840" stroke-width="2.4" stroke-linejoin="round"><path d="M0 0L-16 -9V9Z" fill="#ff2e88"/><path d="M0 0L16 -9V9Z" fill="#ff2e88"/><circle r="4.5" fill="#ff8ab1"/></g>`,
  ac_medalla:`<path d="M84 78l6 14h8l6-14z" fill="#e8333f" stroke="#2b1840" stroke-width="2" stroke-linejoin="round"/><path d="M90 78l4 10l4-10" fill="#3b9bff"/><circle cx="94" cy="100" r="12" fill="#ffd23f" stroke="#2b1840" stroke-width="2.4"/><path d="M94 93l2.2 4.6l5 .6l-3.7 3.4l1 5l-4.5-2.5l-4.5 2.5l1-5l-3.7-3.4l5-.6z" fill="#fff6b0" stroke="#b37a00" stroke-width="1"/>`,
  ac_audifonos:`<path d="M17 64A43 43 0 0 1 103 64" fill="none" stroke="#2b1840" stroke-width="8" stroke-linecap="round"/><path d="M17 64A43 43 0 0 1 103 64" fill="none" stroke="#3fe0cc" stroke-width="4" stroke-linecap="round"/><rect x="6" y="54" width="16" height="26" rx="7" fill="#ff2e88" stroke="#2b1840" stroke-width="2.6"/><rect x="98" y="54" width="16" height="26" rx="7" fill="#ff2e88" stroke="#2b1840" stroke-width="2.6"/>`,
  ac_flor:`<g transform="translate(24 28)" stroke="#2b1840" stroke-width="2"><circle cx="0" cy="-8" r="7" fill="#ff5c9a"/><circle cx="8" cy="-2" r="7" fill="#ff5c9a"/><circle cx="5" cy="8" r="7" fill="#ff5c9a"/><circle cx="-5" cy="8" r="7" fill="#ff5c9a"/><circle cx="-8" cy="-2" r="7" fill="#ff5c9a"/><circle r="4.5" fill="#ffd23f"/></g>`,
  ac_charro:`<g transform="translate(0 8)"><ellipse cx="60" cy="24" rx="54" ry="11" fill="#2b1a12" stroke="#2b1840" stroke-width="2.6"/><path d="M40 24c0-20 8-26 20-26s20 6 20 26z" fill="#3b2412" stroke="#2b1840" stroke-width="2.6"/><path d="M41 18h38" stroke="#ffd23f" stroke-width="3"/><ellipse cx="60" cy="24" rx="54" ry="11" fill="none" stroke="#ffd23f" stroke-width="1.6" stroke-dasharray="4 5"/></g>`,
  ac_cuernos:`<path d="M30 30c-6-10-4-22 2-28c0 10 6 16 12 20z" fill="#e8333f" stroke="#2b1840" stroke-width="2.4" stroke-linejoin="round"/><path d="M90 30c6-10 4-22-2-28c0 10-6 16-12 20z" fill="#e8333f" stroke="#2b1840" stroke-width="2.4" stroke-linejoin="round"/>`,
  ac_corona:`<g transform="translate(0 6)"><path d="M36 26L32 2L48 14L60 -2L72 14L88 2L84 26Z" fill="#ffd23f" stroke="#2b1840" stroke-width="2.6" stroke-linejoin="round"/><circle cx="60" cy="16" r="4" fill="#ff2e88"/><circle cx="44" cy="20" r="3" fill="#3fe0cc"/><circle cx="76" cy="20" r="3" fill="#3fe0cc"/></g>`,
  ac_halo:`<g transform="translate(0 6)"><ellipse cx="60" cy="4" rx="26" ry="7" fill="none" stroke="#fff6b0" stroke-width="8" opacity=".55"/><ellipse cx="60" cy="4" rx="26" ry="7" fill="none" stroke="#ffd23f" stroke-width="4"/></g>`,
  ac_gorra:`<g transform="translate(0 6)"><path d="M34 26c0-18 12-26 26-26s26 8 26 26z" fill="#e8333f" stroke="#2b1840" stroke-width="2.6" stroke-linejoin="round"/><path d="M60 2v22" stroke="#b81f2b" stroke-width="2"/><path d="M76 24c10 0 22 1 28 5c-6 3-18 3-28 1z" fill="#b81f2b" stroke="#2b1840" stroke-width="2.4" stroke-linejoin="round"/><circle cx="60" cy="1" r="3" fill="#ffd23f" stroke="#2b1840" stroke-width="1.6"/></g>`,
  ac_globo:`<path d="M101 58q-6 16 2 34" fill="none" stroke="#fff" stroke-width="1.8"/><ellipse cx="101" cy="42" rx="11" ry="14" fill="#3fe0cc" stroke="#2b1840" stroke-width="2.4"/><path d="M98 56l3 4l3-4z" fill="#3fe0cc" stroke="#2b1840" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="97" cy="37" rx="3" ry="5" fill="#fff" opacity=".55"/>`,
  ac_mago:`<g transform="translate(0 6)"><path d="M38 26L66 -6L82 26Z" fill="#3b2a8f" stroke="#2b1840" stroke-width="2.6" stroke-linejoin="round"/><ellipse cx="60" cy="26" rx="30" ry="6" fill="#2a1f6b" stroke="#2b1840" stroke-width="2.4"/><path d="M60 8l1.6 3.4l3.6.4l-2.7 2.5l.8 3.6l-3.3-1.9l-3.3 1.9l.8-3.6l-2.7-2.5l3.6-.4z" fill="#ffd23f"/><circle cx="71" cy="17" r="1.8" fill="#ffd23f"/></g>`,
  ac_vikingo:`<g transform="translate(0 8)"><path d="M37 22c-10-4-14-14-12-24c4 8 10 12 18 13z" fill="#f4ecd8" stroke="#2b1840" stroke-width="2.4" stroke-linejoin="round"/><path d="M83 22c10-4 14-14 12-24c-4 8-10 12-18 13z" fill="#f4ecd8" stroke="#2b1840" stroke-width="2.4" stroke-linejoin="round"/><path d="M36 26c0-16 10-24 24-24s24 8 24 24z" fill="#9aa3b8" stroke="#2b1840" stroke-width="2.6" stroke-linejoin="round"/><path d="M36 23h48" stroke="#c28a2b" stroke-width="5"/><path d="M60 3v18" stroke="#6b7390" stroke-width="3"/></g>`};
const FOND={
  fo_selva:['<linearGradient id="fg-selva" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7be07f"/><stop offset="1" stop-color="#0f6b3a"/></linearGradient>','url(#fg-selva)','<g fill="#0b4d2a" opacity=".5"><path d="M4 70c10-14 22-16 30-14c-10 4-18 12-22 24z"/><path d="M116 70c-10-14-22-16-30-14c10 4 18 12 22 24z"/><path d="M30 104c4-12 14-16 22-14c-8 2-14 8-16 18z"/></g>'],
  fo_dulce:['<linearGradient id="fg-dulce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe0f4"/><stop offset="1" stop-color="#ff7ccf"/></linearGradient>','url(#fg-dulce)','<g fill="#fff" opacity=".7"><circle cx="20" cy="30" r="3"/><circle cx="98" cy="24" r="2.5"/><circle cx="102" cy="92" r="3"/><circle cx="16" cy="88" r="2.5"/></g>'],
  fo_noche:['<radialGradient id="fg-noche" cx=".7" cy=".2"><stop offset="0" stop-color="#2c3f8f"/><stop offset="1" stop-color="#070b26"/></radialGradient>','url(#fg-noche)','<circle cx="96" cy="26" r="8" fill="#fff6c8" opacity=".9"/><g fill="#fff"><circle cx="20" cy="36" r="1.4"/><circle cx="30" cy="98" r="1.2"/><circle cx="104" cy="80" r="1.5"/><circle cx="72" cy="12" r="1"/><circle cx="14" cy="66" r="1"/></g>'],
  fo_aurora:['<linearGradient id="fg-aurora" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1a3d"/><stop offset=".38" stop-color="#1fbf8f"/><stop offset=".62" stop-color="#6a3cff"/><stop offset="1" stop-color="#0b0624"/></linearGradient>','url(#fg-aurora)','<path d="M0 50q30-20 60-4t60-8" fill="none" stroke="#7dffcf" stroke-width="5" opacity=".35"/>'],
  fo_atardecer:['<linearGradient id="fg-atardecer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb03a"/><stop offset="1" stop-color="#ff3d7f"/></linearGradient>','url(#fg-atardecer)',''],
  fo_mar:['<linearGradient id="fg-mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fd0ff"/><stop offset="1" stop-color="#1050b8"/></linearGradient>','url(#fg-mar)','<path d="M2 92q14-8 28 0t28 0t28 0t32 0V120H2z" fill="#0b3d8f" opacity=".45"/>'],
  fo_oro:['<radialGradient id="fg-oro"><stop offset="0" stop-color="#fff3a8"/><stop offset=".6" stop-color="#e0a816"/><stop offset="1" stop-color="#8a5a00"/></radialGradient>','url(#fg-oro)',''],
  fo_lava:['<radialGradient id="fg-lava" cy=".9"><stop offset="0" stop-color="#ffcf3a"/><stop offset=".5" stop-color="#ff4d00"/><stop offset="1" stop-color="#5a0a00"/></radialGradient>','url(#fg-lava)',''],
  fo_galaxia:['<radialGradient id="fg-galaxia" cx=".35" cy=".3"><stop offset="0" stop-color="#7a4dff"/><stop offset=".55" stop-color="#2a1060"/><stop offset="1" stop-color="#07041a"/></radialGradient>','url(#fg-galaxia)','<g fill="#fff"><circle cx="18" cy="40" r="1.6"/><circle cx="100" cy="30" r="1.3"/><circle cx="96" cy="84" r="1.8"/><circle cx="26" cy="92" r="1.2"/><circle cx="84" cy="14" r="1.1"/><circle cx="12" cy="66" r="1"/></g>'],
  fo_creador:['<radialGradient id="fg-creador"><stop offset="0" stop-color="#fff6c8"/><stop offset=".55" stop-color="#ffd23f"/><stop offset="1" stop-color="#b36b00"/></radialGradient>','url(#fg-creador)','<g opacity=".35" fill="#fff"><path d="M60 60L50 0h20z"/><path d="M60 60L120 50v20z"/><path d="M60 60L70 120H50z"/><path d="M60 60L0 70V50z"/><path d="M60 60L100 6l14 14z"/><path d="M60 60L114 100l-14 14z"/><path d="M60 60L20 114L6 100z"/><path d="M60 60L6 20L20 6z"/></g><circle cx="60" cy="60" r="55" fill="none" stroke="url(#fg-creador)" stroke-width="0"/>'],
  fo_arcoiris:['<linearGradient id="fg-arcoiris" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5c9a"/><stop offset=".25" stop-color="#ffd23f"/><stop offset=".5" stop-color="#3fe0cc"/><stop offset=".75" stop-color="#5b8cff"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient>','url(#fg-arcoiris)','']};
function avParse(id){const p=String(id||'').split('~');return{b:AVM[p[0]]?p[0]:null,s:SKPAL[p[1]]?p[1]:'',c:ACC[p[2]]?p[2]:'',f:FOND[p[3]]?p[3]:''}}
const avValid=id=>!!avParse(id).b;
const avJoin=(b,s,c,f)=>[b,s||'',c||'',f||''].join('~').replace(/~+$/,'');
const AVC=new Map();let AVN=0;
function avComp(id,cls){const k=id+'|'+(cls||'');let svg=AVC.get(k);if(!svg){const q=avParse(id),a=AVM[q.b]||AVS3[0],F=q.f?FOND[q.f]:null,P=q.s?SKPAL[q.s]:null;
  const bg=F?F[1]:P?P[1]:a.bg,art=q.s?skinArt(a.art,q.s):a.art,op=q.s==='sk_fantasma'?' opacity=".82"':'';
  svg=`<svg class="${cls||'l3-svg'}" viewBox="0 0 120 120" role="img" aria-label="${a.n}">${F?'<defs>'+F[0]+'</defs>':''}<circle cx="60" cy="60" r="58" fill="${bg}"/>${F?F[2]:''}<circle cx="60" cy="60" r="54.5" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/><ellipse cx="44" cy="30" rx="28" ry="14" fill="#fff" opacity=".16" transform="rotate(-25 44 30)"/><g${op}>${art}</g><circle cx="60" cy="60" r="58" fill="none" stroke="#fff" stroke-width="3.5"/>${q.c?ACC[q.c]:''}</svg>`;
    if(AVC.size>300)AVC.clear();AVC.set(k,svg)}
  return svg.includes('fg-')?svg.replace(/fg-([a-z]+)/g,'fg-$1-'+(++AVN)):svg}

/* ===== celebración al ganar el botón ===== */
function celebFx(kind,el){if(!el||!document.body)return;const rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,lite=document.documentElement.classList.contains('lite');
  const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,lay=document.createElement('div');lay.className='celeb';lay.setAttribute('aria-hidden','true');document.body.appendChild(lay);
  const P=(html,x,y,kf,dur,cls)=>{const d=document.createElement('i');d.className='celeb-p '+(cls||'');d.innerHTML=html;d.style.left=x+'px';d.style.top=y+'px';lay.appendChild(d);if(rm){d.animate([{opacity:1},{opacity:0}],{duration:1200});return}d.animate(kf,{duration:dur,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'})};
  const N=lite?.4:1,cols=['#ff5c9a','#ffd23f','#3fe0cc','#8b5cf6','#ff8a1a','#5fe06a'];
  if(kind==='ce_creador'){lay.remove();celebFx('ce_corona',el);setTimeout(()=>celebFx('ce_confeti',el),350);setTimeout(()=>celebFx('ce_arcoiris',el),700);
    const t=document.createElement('div');t.className='celeb';t.setAttribute('aria-hidden','true');t.innerHTML='<b class="cre-tx">¡EL CREADOR!</b>';document.body.appendChild(t);setTimeout(()=>t.remove(),2600);return}
  if(kind==='ce_confeti')for(let i=0;i<40*N;i++){const a=Math.random()*Math.PI*2,v=80+Math.random()*180;P(`<b style="background:${cols[i%6]}"></b>`,cx,cy,[{transform:'translate(-50%,-50%)'},{transform:`translate(calc(-50% + ${Math.cos(a)*v}px),calc(-50% + ${Math.sin(a)*v+120}px)) rotate(${Math.random()*720}deg)`,opacity:0}],1400+Math.random()*600)}
  else if(kind==='ce_globos')for(let i=0;i<9*N;i++){const x=cx+(Math.random()-.5)*r.width*1.2;P('🎈',x,r.bottom,[{transform:'translate(-50%,0)'},{transform:`translate(calc(-50% + ${(Math.random()-.5)*60}px),-${innerHeight*.7}px)`,opacity:.2}],2200+Math.random()*900,'big')}
  else if(kind==='ce_fuegos')[0,350,700].forEach((t,k)=>setTimeout(()=>{const x=cx+(k-1)*r.width*.35,y=cy-r.height*.25;for(let i=0;i<22*N;i++){const a=Math.PI*2*i/22,v=60+Math.random()*50;P(`<b class="dot" style="background:${cols[(i+k)%6]}"></b>`,x,y,[{transform:'translate(-50%,-50%) scale(1)'},{transform:`translate(calc(-50% + ${Math.cos(a)*v}px),calc(-50% + ${Math.sin(a)*v}px)) scale(.3)`,opacity:0}],900)}},t))
  else if(kind==='ce_rayo'){P('⚡',cx,cy,[{transform:'translate(-50%,-50%) scale(.2) rotate(-20deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1.6) rotate(8deg)',opacity:1,offset:.25},{transform:'translate(-50%,-50%) scale(1.3)',opacity:0}],1300,'huge');lay.classList.add('flash')}
  else if(kind==='ce_corona'){P('👑',cx,r.top,[{transform:'translate(-50%,-160px) scale(.6) rotate(-30deg)',opacity:0},{transform:'translate(-50%,-10px) scale(1.4) rotate(6deg)',opacity:1,offset:.5},{transform:'translate(-50%,-10px) scale(1.2)',opacity:1,offset:.85},{transform:'translate(-50%,-30px) scale(1.2)',opacity:0}],1900,'huge');
    for(let i=0;i<16*N;i++){const a=Math.PI*2*i/16;P('<b class="ray"></b>',cx,cy,[{transform:`translate(-50%,-50%) rotate(${a}rad) scaleY(.2)`,opacity:.9},{transform:`translate(-50%,-50%) rotate(${a}rad) scaleY(1.6)`,opacity:0}],1300)}}
  else if(kind==='ce_arcoiris'){P('🌈',cx,cy,[{transform:'translate(-50%,-50%) scale(.3)',opacity:0},{transform:'translate(-50%,-60%) scale(2.2)',opacity:1,offset:.4},{transform:'translate(-50%,-80%) scale(2.4)',opacity:0}],1900,'huge');
    for(let i=0;i<30*N;i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*160;P('✦',cx,cy,[{transform:'translate(-50%,-50%) scale(.4)',color:cols[i%6]},{transform:`translate(calc(-50% + ${Math.cos(a)*v}px),calc(-50% + ${Math.sin(a)*v}px)) scale(1.2)`,opacity:0,color:cols[(i+2)%6]}],1300+Math.random()*500,'star')}}
  else if(kind==='ce_corazones')for(let i=0;i<18*N;i++){const a=Math.random()*Math.PI*2,v=70+Math.random()*150;P(['💖','💗','💕'][i%3],cx,cy,[{transform:'translate(-50%,-50%) scale(.3)'},{transform:`translate(calc(-50% + ${Math.cos(a)*v}px),calc(-50% + ${Math.sin(a)*v-40}px)) scale(1.2)`,opacity:0}],1400+Math.random()*500,'big')}
  else if(kind==='ce_monedas')for(let i=0;i<22*N;i++){const x=cx+(Math.random()-.5)*r.width*1.4;setTimeout(()=>P('🪙',x,r.top-60,[{transform:'translate(-50%,0) rotateY(0deg)'},{transform:`translate(-50%,${r.height+160}px) rotateY(720deg)`,opacity:.1}],1300+Math.random()*500,'big'),Math.random()*600)}
  else if(kind==='ce_pinata'){P('🪅',cx,r.top,[{transform:'translate(-50%,-180px) rotate(-12deg)',opacity:0},{transform:'translate(-50%,-20px) rotate(10deg)',opacity:1,offset:.35},{transform:'translate(-50%,-20px) rotate(-10deg)',opacity:1,offset:.6},{transform:'translate(-50%,-20px) scale(1.5)',opacity:0}],1100,'huge');
    setTimeout(()=>{for(let i=0;i<26*N;i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*170;P(['🍬','🍭','🍫','⭐'][i%4],cx,r.top+10,[{transform:'translate(-50%,-50%) scale(.4)'},{transform:`translate(calc(-50% + ${Math.cos(a)*v}px),calc(-50% + ${Math.sin(a)*v+140}px)) rotate(${Math.random()*540}deg)`,opacity:0}],1500+Math.random()*500,'big')}},700)}
  setTimeout(()=>lay.remove(),3400)}
const CEIC={ce_creador:'👑',ce_confeti:'🎊',ce_globos:'🎈',ce_fuegos:'🎆',ce_rayo:'⚡',ce_corona:'👑',ce_arcoiris:'🌈',ce_corazones:'💖',ce_monedas:'🪙',ce_pinata:'🪅'};
