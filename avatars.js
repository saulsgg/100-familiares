/* ===================== ANIMALITOS DE MÉXICO (dibujos SVG, nítidos a cualquier tamaño) ===================== */
const OL='#2b1840';
const SK=`stroke="${OL}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"`;
const SKt=`stroke="${OL}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
const EYE=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${OL}"/><circle cx="${(x+r*.36).toFixed(1)}" cy="${(y-r*.38).toFixed(1)}" r="${(r*.38).toFixed(1)}" fill="#fff"/>`;
const EYEW=(x,y,r,iris)=>`<circle cx="${x}" cy="${y}" r="${r+2.6}" fill="${iris||'#fff'}" ${SKt}/>`+EYE(x,y,r);
const CHK=(x,y,c)=>`<ellipse cx="${x}" cy="${y}" rx="6.5" ry="3.8" fill="${c||'#ff6f9c'}" opacity=".5"/>`;
const SMILE=(x,y,w)=>`<path d="M${x-w} ${y} q${w} ${w*.75} ${w*2} 0" fill="none" ${SK}/>`;
/* refleja un dibujo de la mitad izquierda a la derecha */
const MIR=s=>`<g transform="translate(120 0) scale(-1 1)">${s}</g>`;
const AVS3=[
  {id:'ajolote',n:'Ajolote',bg:'#27b3c4',art:
    MIR(`<g fill="#ff5c9a" ${SK}><ellipse cx="25" cy="44" rx="13" ry="5.5" transform="rotate(-38 25 44)"/><ellipse cx="20" cy="60" rx="13" ry="5.5" transform="rotate(-6 20 60)"/><ellipse cx="24" cy="76" rx="13" ry="5.5" transform="rotate(26 24 76)"/></g>`)+
    `<g fill="#ff5c9a" ${SK}><ellipse cx="25" cy="44" rx="13" ry="5.5" transform="rotate(-38 25 44)"/><ellipse cx="20" cy="60" rx="13" ry="5.5" transform="rotate(-6 20 60)"/><ellipse cx="24" cy="76" rx="13" ry="5.5" transform="rotate(26 24 76)"/></g>
    <ellipse cx="60" cy="62" rx="35" ry="30" fill="#ffb6d3" ${SK}/><ellipse cx="60" cy="74" rx="22" ry="11" fill="#ffd3e5"/>`+EYE(45,57,5.2)+EYE(75,57,5.2)+CHK(37,69)+CHK(83,69)+SMILE(60,71,11)},
  {id:'jaguar',n:'Jaguar',bg:'#1f8a5b',art:
    `<g ${SK}><circle cx="33" cy="35" r="12" fill="#f5b83d"/><circle cx="87" cy="35" r="12" fill="#f5b83d"/></g><circle cx="33" cy="36" r="5.5" fill="#7a4a16"/><circle cx="87" cy="36" r="5.5" fill="#7a4a16"/>
    <ellipse cx="60" cy="63" rx="38" ry="34" fill="#f7bd45" ${SK}/>
    <g fill="none" stroke="#6b3f12" stroke-width="2.6"><circle cx="40" cy="43" r="4.2"/><circle cx="60" cy="37" r="4.2"/><circle cx="80" cy="43" r="4.2"/><circle cx="31" cy="64" r="3.6"/><circle cx="89" cy="64" r="3.6"/></g>
    <g fill="#6b3f12"><circle cx="49" cy="46" r="2"/><circle cx="71" cy="46" r="2"/><circle cx="35" cy="76" r="2.2"/><circle cx="85" cy="76" r="2.2"/></g>
    <ellipse cx="60" cy="80" rx="19" ry="14" fill="#fff4dc" ${SK}/>`+EYEW(46,60,4.6,'#ffe36b')+EYEW(74,60,4.6,'#ffe36b')+
    `<path d="M53 72 h14 l-7 7 z" fill="#4a2410" ${SKt}/><path d="M60 79 v4 M60 83 q-5 4 -10 1 M60 83 q5 4 10 1" fill="none" ${SKt}/>`},
  {id:'quetzal',n:'Quetzal',bg:'#f2b632',art:
    `<path d="M60 22 q-15 5 -18 22 q9 -6 18 -6 q9 0 18 6 q-3 -17 -18 -22z" fill="#139158" ${SK}/>
    <circle cx="60" cy="62" r="32" fill="#22b573" ${SK}/><path d="M33 47 q27 -22 54 0 q-27 -10 -54 0z" fill="#17a063"/>
    <path d="M30.5 74 Q60 63 89.5 74 A32 32 0 0 1 30.5 74 Z" fill="#e8364b" ${SK}/><path d="M24 64 q-6 14 4 26 q4 -14 10 -18z M96 64 q6 14 -4 26 q-4 -14 -10 -18z" fill="#139158" ${SK}/>`+EYEW(48,57,4.4)+EYEW(72,57,4.4)+
    `<path d="M53 65 q7 -4 14 0 q-7 13 -14 0z" fill="#ffc83a" ${SK}/>`+CHK(40,70,'#0f7d4b')+CHK(80,70,'#0f7d4b')},
  {id:'mono',n:'Mono araña',bg:'#7cc14a',art:
    `<g ${SK}><circle cx="24" cy="62" r="11" fill="#7a4a2b"/><circle cx="96" cy="62" r="11" fill="#7a4a2b"/></g><circle cx="24" cy="62" r="5.5" fill="#e8b48a"/><circle cx="96" cy="62" r="5.5" fill="#e8b48a"/>
    <circle cx="60" cy="60" r="34" fill="#7a4a2b" ${SK}/><path d="M51 28 q9 -9 18 0 q-5 -2 -9 2 q-4 -4 -9 -2z" fill="#5a3520" ${SK}/>
    <path d="M60 50 c-10 -14 -31 -8 -29 8 c1 15 13 30 29 32 c16 -2 28 -17 29 -32 c2 -16 -19 -22 -29 -8z" fill="#f1c9a3" ${SK}/>`+EYE(48,60,5.2)+EYE(72,60,5.2)+
    `<circle cx="56.5" cy="71" r="1.9" fill="${OL}"/><circle cx="63.5" cy="71" r="1.9" fill="${OL}"/>`+SMILE(60,78,9)+CHK(41,73,'#e8907a')+CHK(79,73,'#e8907a')},
  {id:'xolo',n:'Xolo',bg:'#e2734a',art:
    MIR(`<path d="M37 52 L25 13 L55 36 Z" fill="#565c6e" ${SK}/><path d="M37 45 L30 22 L48 37 Z" fill="#e8909c"/>`)+
    `<path d="M37 52 L25 13 L55 36 Z" fill="#565c6e" ${SK}/><path d="M37 45 L30 22 L48 37 Z" fill="#e8909c"/>
    <ellipse cx="60" cy="64" rx="31" ry="32" fill="#5d6378" ${SK}/><path d="M49 35 q5 -11 11 -4 q5 -9 11 2 q-11 -3 -22 2z" fill="#2e3140" ${SK}/>
    <ellipse cx="60" cy="81" rx="15" ry="11.5" fill="#757d94" ${SK}/><ellipse cx="60" cy="75" rx="6.5" ry="4.6" fill="#1d1f2a"/>`+EYE(47,60,5.2)+EYE(73,60,5.2)+
    `<path d="M60 79 v4 M60 83 q-5 3 -8 0 M60 83 q5 3 8 0" fill="none" ${SKt}/><path d="M57 86 q3 7 6 0z" fill="#ff7a8f" ${SKt}/>`},
  {id:'flamenco',n:'Flamenco',bg:'#3aa0e0',art:
    `<path d="M66 122 q-6 -22 8 -40" fill="none" stroke="${OL}" stroke-width="19" stroke-linecap="round"/><path d="M66 122 q-6 -22 8 -40" fill="none" stroke="#ff9db0" stroke-width="13" stroke-linecap="round"/>
    <circle cx="58" cy="54" r="27" fill="#ffa3b5" ${SK}/><path d="M38 40 q12 -12 30 -10 q-16 2 -30 10z" fill="#ff8aa1"/>
    <path d="M71 56 q22 -3 24 15 q-1 11 -10 15 q2 -13 -14 -16z" fill="#fff1e8" ${SK}/><path d="M86 76 q5 -3 9 -4 q-2 10 -10 14 q2 -5 1 -10z" fill="${OL}"/>`+
    EYEW(55,49,4.4)+CHK(45,62)},
  {id:'tucan',n:'Tucán',bg:'#9fd34c',art:
    `<circle cx="48" cy="60" r="31" fill="#242238" ${SK}/><ellipse cx="42" cy="76" rx="17" ry="13" fill="#fff4d0" ${SK}/>
    <path d="M60 47 q37 -8 48 10 q-10 16 -48 16 q-7 -13 0 -26z" fill="#ffb52e" ${SK}/><path d="M64 49 q28 -6 40 6" fill="none" stroke="#ff6a1f" stroke-width="5" stroke-linecap="round"/><path d="M99 54 q7 2 9 4 q-4 7 -11 9z" fill="#e63946"/>
    <circle cx="49" cy="52" r="9" fill="#38b6ff" ${SK}/>`+EYE(49,52,4.3)},
  {id:'colibri',n:'Colibrí',bg:'#9a5fd6',art:
    `<path d="M24 74 q-10 -24 6 -40 q4 16 14 24z" fill="#0f9c83" ${SK}/>
    <circle cx="54" cy="60" r="28" fill="#20c8a9" ${SK}/><path d="M30 50 q20 -24 48 -6 q-24 -8 -48 6z" fill="#13a58a"/>
    <path d="M33 71 q21 22 42 4 q-6 15 -21 17 q-15 -2 -21 -21z" fill="#e0287a" ${SK}/>
    <path d="M80 55 L114 49 L80 62 Z" fill="${OL}" ${SKt}/>`+EYE(62,54,4.8)+`<path d="M68 50 q6 -2 10 2" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`},
  {id:'tortuga',n:'Tortuga marina',bg:'#1f74c7',art:
    `<ellipse cx="60" cy="100" rx="46" ry="27" fill="#2f8f5b" ${SK}/><path d="M40 88 l9 -7 h22 l9 7 l-4 13 h-32z" fill="#45ab72" ${SKt}/><path d="M22 96 l14 -6 M98 96 l-14 -6" ${SKt}/>
    <ellipse cx="60" cy="56" rx="28" ry="26" fill="#93d67d" ${SK}/><path d="M44 40 l6 -4 l7 3 l-2 6 l-7 1z M66 38 l7 -1 l4 5 l-4 5 l-6 -2z" fill="#6fbf5c"/>`+
    EYE(48,54,5.2)+EYE(72,54,5.2)+SMILE(60,66,10)+CHK(40,63,'#3f9a4c')+CHK(80,63,'#3f9a4c')},
  {id:'guacamaya',n:'Guacamaya',bg:'#2fae67',art:
    `<path d="M24 88 q32 16 60 0 l-4 16 q-26 9 -52 0z" fill="#2c7be5" ${SK}/><path d="M28 90 q28 11 52 0" fill="none" stroke="#ffd23f" stroke-width="5"/>
    <circle cx="55" cy="58" r="32" fill="#e8333f" ${SK}/><ellipse cx="64" cy="57" rx="14" ry="16" fill="#fff5ef" ${SKt}/><path d="M56 50 h7 M56 56 h9 M58 62 h7" stroke="#e8333f" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M74 54 q23 -2 23 21 q-8 -10 -21 -6z" fill="#f2e8dc" ${SK}/><path d="M76 70 q10 0 12 8 q-8 4 -14 -2z" fill="${OL}"/>`+EYE(62,53,4.4)},
  {id:'armadillo',n:'Armadillo',bg:'#f29a3b',art:
    `<path d="M20 66 q40 -52 80 0 z" fill="#9b8574" ${SK}/><path d="M27 58 q33 -24 66 0 M38 50 q22 -12 44 0" fill="none" stroke="#6e5a4c" stroke-width="3"/><path d="M60 44 v20 M47 46 l-4 18 M73 46 l4 18" fill="none" stroke="#6e5a4c" stroke-width="2"/>
    <g ${SK}><ellipse cx="36" cy="52" rx="8" ry="14" transform="rotate(-24 36 52)" fill="#dcbc9f"/><ellipse cx="84" cy="52" rx="8" ry="14" transform="rotate(24 84 52)" fill="#dcbc9f"/></g>
    <path d="M35 64 q25 -13 50 0 q4 13 -7 23 l-11 13 q-7 5 -14 0 l-11 -13 q-11 -10 -7 -23z" fill="#e6c8ab" ${SK}/><ellipse cx="60" cy="99" rx="5.5" ry="3.8" fill="#6b4a3a"/>`+
    EYE(48,72,4.4)+EYE(72,72,4.4)+CHK(42,82)+CHK(78,82)},
  {id:'monarca',n:'Mariposa monarca',bg:'#6b4fd8',art:
    MIR(`<path d="M58 58 C40 22 8 24 13 50 C16 67 40 67 58 62z" fill="#ff8a1f" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M58 65 C43 70 22 84 33 97 C44 106 57 87 58 71z" fill="#ffa23d" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M56 58 L24 38 M56 60 L19 53 M56 67 L36 91" fill="none" ${SKt}/><g fill="#fff"><circle cx="17" cy="44" r="1.8"/><circle cx="21" cy="57" r="1.8"/><circle cx="31" cy="95" r="1.6"/></g>`)+
    `<path d="M58 58 C40 22 8 24 13 50 C16 67 40 67 58 62z" fill="#ff8a1f" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M58 65 C43 70 22 84 33 97 C44 106 57 87 58 71z" fill="#ffa23d" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M56 58 L24 38 M56 60 L19 53 M56 67 L36 91" fill="none" ${SKt}/><g fill="#fff"><circle cx="17" cy="44" r="1.8"/><circle cx="21" cy="57" r="1.8"/><circle cx="31" cy="95" r="1.6"/></g>
    <path d="M57 33 q-5 -12 -13 -15 M63 33 q5 -12 13 -15" fill="none" ${SKt}/><circle cx="44" cy="18" r="2.6" fill="${OL}"/><circle cx="76" cy="18" r="2.6" fill="${OL}"/>
    <ellipse cx="60" cy="66" rx="5.5" ry="23" fill="${OL}"/><circle cx="60" cy="39" r="8" fill="${OL}"/><circle cx="57" cy="38" r="1.9" fill="#fff"/><circle cx="63" cy="38" r="1.9" fill="#fff"/>`},
  {id:'iguana',n:'Iguana',bg:'#ff7f50',art:
    `<path d="M33 41 l5 -13 l6 10 l6 -13 l6 10 l6 -13 l6 10 l6 -13 l5 15z" fill="#3e9e48" ${SK}/>
    <path d="M23 66 q2 -27 37 -29 q31 0 41 21 q6 14 -8 20 q-31 10 -61 2 q-11 -4 -9 -14z" fill="#6cc96a" ${SK}/>
    <path d="M40 79 q5 20 25 18 q-7 -10 -7 -18z" fill="#4aa84f" ${SK}/><circle cx="34" cy="68" r="6" fill="#dff3a8" ${SKt}/>`+EYEW(52,55,4.6,'#ffb84d')+
    `<circle cx="91" cy="56" r="1.9" fill="${OL}"/><path d="M60 73 q20 2 33 -6" fill="none" ${SKt}/>`},
  {id:'coyote',n:'Coyote',bg:'#4b3f9e',art:
    MIR(`<path d="M30 52 L27 16 L54 38Z" fill="#c4834a" ${SK}/><path d="M32 45 L31 25 L46 39Z" fill="#f3d2b3"/>`)+
    `<path d="M30 52 L27 16 L54 38Z" fill="#c4834a" ${SK}/><path d="M32 45 L31 25 L46 39Z" fill="#f3d2b3"/>
    <path d="M27 58 q4 -26 33 -26 q29 0 33 26 q2 16 -13 28 l-20 14 l-20 -14 q-15 -12 -13 -28z" fill="#d1925a" ${SK}/>
    <path d="M43 76 q17 -10 34 0 l-17 23z" fill="#fff1df" ${SK}/><ellipse cx="60" cy="92" rx="5.5" ry="4.2" fill="${OL}"/>`+EYE(46,60,5)+EYE(74,60,5)},
  {id:'tlacuache',n:'Tlacuache',bg:'#23807f',art:
    `<g ${SK}><circle cx="33" cy="38" r="11.5" fill="#3d3a48"/><circle cx="87" cy="38" r="11.5" fill="#3d3a48"/></g><circle cx="33" cy="39" r="5.8" fill="#ff9fb2"/><circle cx="87" cy="39" r="5.8" fill="#ff9fb2"/>
    <ellipse cx="60" cy="61" rx="32" ry="28" fill="#ece9f2" ${SK}/><path d="M53 35 q7 12 14 0" fill="#8f8aa0"/>
    <ellipse cx="46" cy="58" rx="9" ry="8" fill="#c3bed2"/><ellipse cx="74" cy="58" rx="9" ry="8" fill="#c3bed2"/>
    <path d="M44 70 q16 -6 32 0 l-12 22 q-4 4 -8 0z" fill="#f8f6fb" ${SK}/><ellipse cx="60" cy="92" rx="5.8" ry="4.2" fill="#ff7a96" ${SKt}/>`+EYE(46,58,5)+EYE(74,58,5)},
  {id:'venado',n:'Venado',bg:'#4aa7f0',art:
    MIR(`<path d="M44 34 q-10 -12 -6 -26 M41 24 q-9 -2 -13 -10 M46 28 q2 -8 8 -12" fill="none" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M44 34 q-10 -12 -6 -26 M41 24 q-9 -2 -13 -10 M46 28 q2 -8 8 -12" fill="none" stroke="#a8743f" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="25" cy="56" rx="14" ry="7" transform="rotate(-25 25 56)" fill="#b8744a" ${SK}/><ellipse cx="25" cy="56" rx="8" ry="3.4" transform="rotate(-25 25 56)" fill="#f2b8a8"/>`)+
    `<path d="M44 34 q-10 -12 -6 -26 M41 24 q-9 -2 -13 -10 M46 28 q2 -8 8 -12" fill="none" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M44 34 q-10 -12 -6 -26 M41 24 q-9 -2 -13 -10 M46 28 q2 -8 8 -12" fill="none" stroke="#a8743f" stroke-width="4.5" stroke-linecap="round"/><ellipse cx="25" cy="56" rx="14" ry="7" transform="rotate(-25 25 56)" fill="#b8744a" ${SK}/><ellipse cx="25" cy="56" rx="8" ry="3.4" transform="rotate(-25 25 56)" fill="#f2b8a8"/>
    <path d="M35 52 q25 -22 50 0 q6 18 -8 34 q-17 12 -34 0 q-14 -16 -8 -34z" fill="#c4814f" ${SK}/><ellipse cx="60" cy="84" rx="14" ry="10.5" fill="#f6e2cc" ${SK}/><ellipse cx="60" cy="80" rx="6.5" ry="4.6" fill="${OL}"/>`+
    EYE(49,62,5)+EYE(71,62,5)}
,
  {id:'ptero',n:'Pterodáctilo',bg:'#f07a3c',art:
    `<path d="M14 122 q2 -34 26 -50 l18 34 q-22 4 -44 16z" fill="#6b4fc4" ${SK}/>
    <path d="M42 80 q-6 22 2 42 h24 q-8 -22 2 -40z" fill="#8e6ee6" ${SK}/>
    <path d="M52 40 Q24 8 2 6 Q16 32 38 60 Z" fill="#6b4fc4" ${SK}/><path d="M44 36 Q24 18 12 14" fill="none" stroke="#8e6ee6" stroke-width="3" stroke-linecap="round"/>
    <path d="M64 50 L114 61 L64 72 Z" fill="#ffcf5a" ${SK}/><path d="M66 61 H104" fill="none" ${SKt}/><circle cx="96" cy="57" r="1.8" fill="${OL}"/>
    <circle cx="52" cy="60" r="23" fill="#9b7bf0" ${SK}/><path d="M33 50 q18 -16 38 -2 q-20 -8 -38 2z" fill="#b39af7"/>`+EYEW(55,55,4.6,'#ffe36b')+CHK(44,68)}
];
const AVM={};AVS3.forEach(a=>AVM[a.id]=a);
/* el dibujo en su placa redonda de color */
function avSVG(id,cls){const a=AVM[id]||AVS3[0];return `<svg class="${cls||'l3-svg'}" viewBox="0 0 120 120" role="img" aria-label="${a.n}"><circle cx="60" cy="60" r="58" fill="${a.bg}"/><circle cx="60" cy="60" r="54.5" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/><ellipse cx="44" cy="30" rx="28" ry="14" fill="#fff" opacity=".16" transform="rotate(-25 44 30)"/><g>${a.art}</g><circle cx="60" cy="60" r="58" fill="none" stroke="#fff" stroke-width="3.5"/></svg>`}
