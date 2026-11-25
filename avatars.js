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
    <circle cx="52" cy="60" r="23" fill="#9b7bf0" ${SK}/><path d="M33 50 q18 -16 38 -2 q-20 -8 -38 2z" fill="#b39af7"/>`+EYEW(55,55,4.6,'#ffe36b')+CHK(44,68),secret:1}
,
  /* secretos: chica caballo de carreras (diseño propio) */
  {id:'potra',n:'Potranca',bg:'#45b86a',secret:1,art:
    `<path d="M21 103 Q12 58 32 40 Q60 22 88 40 Q108 58 99 103 A58 58 0 0 1 21 103 Z" fill="#7a3f22" ${SK}/>
    <path d="M52 86 v14 h16 v-14" fill="#ffe0c8" ${SKt}/>
    <path d="M24 106 Q36 98 50 97 H70 Q84 98 96 106 A58 58 0 0 1 24 106 Z" fill="#fff" ${SK}/><path d="M44 98 l16 13 l16 -13" fill="none" stroke="#e8364f" stroke-width="4.5" stroke-linejoin="round"/>
    <rect x="51" y="104" width="18" height="11" rx="3" fill="#fff" ${SKt}/><text x="60" y="113" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="9" fill="${OL}">1</text>
    <ellipse cx="60" cy="64" rx="26" ry="28" fill="#ffe0c8" ${SK}/>
    <path d="M32 58 q-2 -28 28 -30 q30 2 28 30 q-6 -6 -10 -15 q-4 10 -12 12 q2 -8 -2 -14 q-6 12 -16 14 q4 -6 2 -12 q-8 10 -18 15z" fill="#8a4a28" ${SK}/>
    <path d="M38 34 q-10 -14 -7 -26 q14 6 17 22z" fill="#8a4a28" ${SK}/><path d="M37 29 q-5 -9 -4 -16 q7 5 9 12z" fill="#ffb3c4"/>
    <path d="M82 34 q10 -14 7 -26 q-14 6 -17 22z" fill="#8a4a28" ${SK}/><path d="M83 29 q5 -9 4 -16 q-7 5 -9 12z" fill="#ffb3c4"/>
    <path d="M86 28 l9 -6 l1 9 z M86 28 l2 10 l-8 -4z" fill="#ff4d6d" ${SKt}/><circle cx="86" cy="30" r="2.6" fill="#ffd23f" ${SKt}/>
    <g ${SKt}><ellipse cx="49" cy="68" rx="5.6" ry="7.4" fill="#8a52e0"/><ellipse cx="71" cy="68" rx="5.6" ry="7.4" fill="#8a52e0"/></g>
    <ellipse cx="49" cy="69.5" rx="2.6" ry="3.6" fill="${OL}"/><ellipse cx="71" cy="69.5" rx="2.6" ry="3.6" fill="${OL}"/>
    <circle cx="51" cy="65" r="2" fill="#fff"/><circle cx="73" cy="65" r="2" fill="#fff"/><circle cx="47.5" cy="72" r="1" fill="#fff"/><circle cx="69.5" cy="72" r="1" fill="#fff"/>
    <path d="M43 57 q6 -4 11 -1 M77 57 q-6 -4 -11 -1" fill="none" ${SKt}/>`+CHK(42,78)+CHK(78,78)+
    `<path d="M54 82 q6 6 12 0 q-6 3 -12 0z" fill="#e8364f" ${SKt}/>`}
,
  /* secretos: monstruo gigante (diseño propio) */
  {id:'kaiju',n:'Kaiju',bg:'#2b3a8f',secret:1,art:
    `<g fill="#1b2464"><path d="M5 76 H12 V66 H22 V74 H30 V112 L28 108 A58 58 0 0 1 5 76 Z"/><path d="M115 74 H108 V62 H98 V70 H90 V108 L92 108 A58 58 0 0 0 115 74 Z"/></g>
    <g fill="#ffd96b"><rect x="14" y="72" width="4" height="5"/><rect x="22" y="82" width="4" height="5"/><rect x="101" y="68" width="4" height="5"/><rect x="96" y="80" width="4" height="5"/></g>
    <g fill="#ffd23f" ${SK}><path d="M34 42 l-6 -20 l16 10z"/><path d="M52 32 l4 -22 l10 20z"/><path d="M72 32 l14 -18 l2 22z"/><path d="M88 46 l20 -10 l-8 18z"/></g>
    <path d="M24 106 Q18 70 32 48 Q60 16 90 44 Q104 70 96 106 A58 58 0 0 1 24 106 Z" fill="#ff6b3d" ${SK}/>
    <path d="M44 116 Q42 96 60 92 Q78 96 76 116 A58 58 0 0 1 44 116 Z" fill="#ffd9a8" ${SK}/><path d="M50 103 h20 M48 110 h24" fill="none" stroke="#e0a060" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M58 38 l3 -14 l6 13z" fill="#fff3d6" ${SKt}/>`+EYEW(46,58,5.4,'#9cf06b')+EYEW(76,58,5.4,'#9cf06b')+
    `<path d="M40 76 q20 18 42 0 q-21 6 -42 0z" fill="#7a1530" ${SK}/><path d="M44 77 l4 6 l4 -5 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6" fill="#fff" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M30 50 q-4 -4 -2 -10 M92 50 q4 -4 2 -10" fill="none" ${SKt}/>`}
];
/* animalitos de la tiendita (solo salen en tu lista si los compraste) */
const AVSHOP=[
  {id:'pinguino',n:'Pingüino',bg:'#3aa0e0',shop:1,snd:'tucan',art:
    `<ellipse cx="60" cy="62" rx="37" ry="36" fill="#2e3140" ${SK}/><path d="M60 30 q4 -9 9 -6 q-5 1 -5 7" fill="#2e3140" ${SKt}/>
    <path d="M60 46 q-9 -10 -21 -4 q-12 8 -9 25 q4 19 30 21 q26 -2 30 -21 q3 -17 -9 -25 q-12 -6 -21 4z" fill="#fff"/>`+EYE(47,60,4.8)+EYE(73,60,4.8)+CHK(38,73)+CHK(82,73)+
    `<path d="M51 70 q9 -6 18 0 q-9 10 -18 0z" fill="#f29a3b" ${SK}/>`},
  {id:'zorro',n:'Zorro',bg:'#2f8f5b',shop:1,snd:'coyote',art:
    MIR(`<path d="M24 18 L50 38 L28 56z" fill="#f07a3c" ${SK}/><path d="M30 30 L42 40 L32 48z" fill="#5a3520"/>`)+
    `<path d="M24 18 L50 38 L28 56z" fill="#f07a3c" ${SK}/><path d="M30 30 L42 40 L32 48z" fill="#5a3520"/>
    <path d="M60 32 q32 0 37 26 q3 15 -14 25 q-12 7 -23 17 q-11 -10 -23 -17 q-17 -10 -14 -25 q5 -26 37 -26z" fill="#f07a3c" ${SK}/>
    <path d="M25 64 q16 2 27 13 q6 6 8 22 q2 -16 8 -22 q11 -11 27 -13 q-3 12 -12 19 q-12 7 -23 17 q-11 -10 -23 -17 q-9 -7 -12 -19z" fill="#fff4dc"/>`+
    EYE(46,57,4.6)+EYE(74,57,4.6)+`<ellipse cx="60" cy="88" rx="5.5" ry="4" fill="${OL}"/><path d="M60 92 v3" ${SKt}/>`},
  {id:'panda',n:'Panda',bg:'#6fbf5c',shop:1,snd:'armadillo',art:
    `<g fill="#2e3140" ${SK}><circle cx="31" cy="33" r="12"/><circle cx="89" cy="33" r="12"/></g>
    <circle cx="60" cy="63" r="36" fill="#fff" ${SK}/>
    <ellipse cx="45" cy="60" rx="9" ry="12" transform="rotate(28 45 60)" fill="#2e3140"/><ellipse cx="75" cy="60" rx="9" ry="12" transform="rotate(-28 75 60)" fill="#2e3140"/>
    <circle cx="46" cy="59" r="4.2" fill="#fff"/><circle cx="47" cy="59" r="2.4" fill="${OL}"/><circle cx="74" cy="59" r="4.2" fill="#fff"/><circle cx="75" cy="59" r="2.4" fill="${OL}"/>
    <ellipse cx="60" cy="74" rx="6.5" ry="4.4" fill="${OL}"/>`+SMILE(60,79,7)+CHK(35,77)+CHK(85,77)+
    `<path d="M92 96 q8 -10 14 -26" fill="none" stroke="#3f9a4c" stroke-width="5" stroke-linecap="round"/><path d="M104 74 q8 -4 10 2 q-6 4 -10 -2z" fill="#6cc96a" ${SKt}/>`},
  {id:'dragon',n:'Dragón',bg:'#6b4fc4',shop:1,snd:'kaiju',art:
    MIR(`<path d="M38 36 q-4 -18 -16 -24 q8 14 6 28z" fill="#ffe27a" ${SK}/>`)+`<path d="M38 36 q-4 -18 -16 -24 q8 14 6 28z" fill="#ffe27a" ${SK}/>
    <g fill="#e8364b" ${SKt}><path d="M50 30 l4 -10 l4 9z"/><path d="M58 28 l4 -11 l4 11z"/><path d="M66 29 l4 -9 l4 10z"/></g>
    <ellipse cx="60" cy="60" rx="37" ry="32" fill="#45b86a" ${SK}/>
    <ellipse cx="60" cy="80" rx="22" ry="14" fill="#93d67d" ${SK}/><circle cx="53" cy="77" r="2.2" fill="${OL}"/><circle cx="67" cy="77" r="2.2" fill="${OL}"/>`+
    EYEW(44,55,4.6,'#ffe36b')+EYEW(76,55,4.6,'#ffe36b')+`<path d="M50 88 q10 5 20 0" fill="none" ${SKt}/><path d="M53 88.5 l2.5 5 l2.5 -4z" fill="#fff" ${SKt}/>`},
  {id:'fenix',n:'Fénix',bg:'#7a1530',shop:1,snd:'guacamaya',art:
    MIR(`<path d="M34 70 q-16 0 -22 -16 q10 6 16 3 q-11 -9 -9 -23 q11 14 21 22z" fill="#ff8a1a" ${SK}/>`)+`<path d="M34 70 q-16 0 -22 -16 q10 6 16 3 q-11 -9 -9 -23 q11 14 21 22z" fill="#ff8a1a" ${SK}/>
    <path d="M60 8 q11 14 3 27 q11 -6 15 -18 q9 17 -6 31 h-24 q-15 -14 -6 -31 q4 12 15 18 q-8 -13 3 -27z" fill="#ffb020" ${SK}/>
    <circle cx="60" cy="66" r="30" fill="#ff5a1f" ${SK}/><ellipse cx="60" cy="73" rx="20" ry="15" fill="#ffd23f"/>`+EYE(48,62,4.6)+EYE(72,62,4.6)+
    `<path d="M53 71 q7 -3 14 0 q-7 12 -14 0z" fill="#fff0a0" ${SK}/>`+CHK(42,74,'#ff2e88')+CHK(78,74,'#ff2e88')}];

AVSHOP.forEach(a=>AVS3.push(a));
const AVM=(()=>{const o={};AVS3.forEach(a=>o[a.id]=a);
  /* "ajolote~sk_oro~ac_corona~fo_mar" (animalito con cosas de la tienda) cuenta como su animalito base */
  return new Proxy(o,{get:(t,k)=>typeof k==='string'&&!(k in t)&&k.length<64&&k.includes('~')?t[k.split('~')[0]]:t[k]})})();
/* íconos secretos: aparecen al tocar 5 veces el título de la hoja de animalitos */
function avSecretOn(){try{return localStorage.getItem('av-secret')==='1'}catch(e){return false}}
function avList(cur){const on=avSecretOn();return AVS3.filter(a=>(a.shop?typeof avOwn==='function'&&avOwn(a.id):!a.secret||on)||(cur||[]).includes(a.id))}
function avSecretTap(el,onOpen){const now=performance.now();el._tp=(el._tp||[]).filter(t=>now-t<2500);el._tp.push(now);if(el._tp.length<5||avSecretOn())return false;
  el._tp=[];try{localStorage.setItem('av-secret','1')}catch(e){}if(onOpen)onOpen();return true}
/* el dibujo en su placa redonda de color */
function avSVG(id,cls){if(typeof id==='string'&&id.includes('~')&&AVM[id])try{return avComp(id,cls)}catch(e){id=id.split('~')[0]}const a=AVM[id]||AVS3[0];return `<svg class="${cls||'l3-svg'}" viewBox="0 0 120 120" role="img" aria-label="${a.n}"><circle cx="60" cy="60" r="58" fill="${a.bg}"/><circle cx="60" cy="60" r="54.5" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/><ellipse cx="44" cy="30" rx="28" ry="14" fill="#fff" opacity=".16" transform="rotate(-25 44 30)"/><g>${a.art}</g><circle cx="60" cy="60" r="58" fill="none" stroke="#fff" stroke-width="3.5"/></svg>`}

/* ===================== FOTO FINISH: CARRERA DE CABALLITOS =====================
   Cada jinete es la barra de tiempo: el que tocó más rápido llega primero a la meta.
   L: lista ordenada del más rápido al más lento [{name,team,rt}], av: animalito de cada equipo, col: color de cada equipo */
/* ===================== FOTO FINISH: carrera de caballos =====================
   Caballos que galopan (4 cuadros), polvo, cerca y meta; si fue muy pareja, cámara lenta.
   Tocar un carril mientras corren: ¡arre! (solo de adorno, no cambia nada). */
const COATS=[['#b06a3c','#4a2a14'],['#6b3f22','#24120a'],['#d9d3ca','#8d8578'],['#3b2a26','#140c0a'],['#e3b15c','#9a6a20'],['#9a5f3a','#3a2212']];
const HLEG={/* cuadros del galope: [mano lejana, pata lejana, mano cercana, pata cercana] */
  f1:['46 28L49 37L45 42','24 28L28 38L31 45','48 28L52 36L47 40','26 28L31 37L35 44'],
  f2:['46 28L52 36L55 43','24 28L20 37L16 45','48 28L56 34L62 38','26 28L19 36L12 41'],
  f3:['46 28L57 35L63 39','24 28L15 35L9 40','48 28L58 33L65 35','26 28L16 33L8 36'],
  f4:['46 28L52 35L58 39','24 28L28 36L30 42','48 28L50 38L50 47','26 28L24 37L22 46'],
  fs:['46 28L46 38L46 47','24 28L23 38L23 47','49 28L49 38L49 47','27 28L26 38L26 47']};
const hLeg=(p,c)=>{const e=p.split(/L|\s/).slice(-2);return `<path d="M${p}" fill="none" stroke="#2b1840" stroke-width="5.6"/><path d="M${p}" fill="none" stroke="${c}" stroke-width="3.2"/><circle cx="${e[0]}" cy="${e[1]}" r="2.1" fill="#2b1840"/>`};
const HSKIN={fuego:['#c2410c','#ffb020'],uni:['#fbf8ff','url(#hrRain)'],fant:['rgba(210,230,255,.55)','rgba(170,200,255,.75)'],
  /* de la tiendita */rosa:['#ffb3d1','#ff4f9a'],cebra:['url(#hrZeb)','#1d1d1d'],noche:['#1b1f4a','#7ab8ff'],dorado:['#f2c230','#fff3a8']};
function horseSVG(i,hz){const[c,m]=HSKIN[hz]||COATS[i%COATS.length];const fr=(k,a,b)=>Object.keys(HLEG).map(f=>`<g class="hr-f ${f}">${hLeg(HLEG[f][a],k)}${hLeg(HLEG[f][b],k)}</g>`).join('');
  return `<svg class="hr-h${hz?' hz-'+hz:''}" viewBox="0 0 80 50" aria-hidden="true">${hz==='uni'?'<defs><linearGradient id="hrRain" x1="0" x2="1"><stop offset="0" stop-color="#ff5ce1"/><stop offset=".33" stop-color="#ffd23f"/><stop offset=".66" stop-color="#3fe0cc"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>':''}${hz==='cebra'?'<defs><pattern id="hrZeb" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><rect width="7" height="7" fill="#f4f4f4"/><rect width="3" height="7" fill="#1d1d1d"/></pattern></defs>':''}<g stroke-linecap="round" stroke-linejoin="round">
  <path class="hr-tail" d="M21 21q-11-3-17 6q-3 5-2 11q4-7 10-9q6-2 10-4z" fill="${m}" stroke="#2b1840" stroke-width="2"/>
  ${fr(m,0,1)}
  <g stroke="#2b1840" stroke-width="2"><path d="M19 23q0-10 14-11h13q8 0 10 6l4 8q-2 6-10 7H30q-11 0-11-10z" fill="${c}"/>
  <path d="M50 19q3-10 9-14l6 5q-5 5-7 13z" fill="${c}"/><path d="M58 5q10-3 16 6q2 4-1 6q-3 1-6-1l-8-2z" fill="${c}"/><path d="M60 6l1-5l4 4z" fill="${c}"/>
  <path class="hr-mane" d="M51 15q3-8 9-12" fill="none" stroke="${m}" stroke-width="3.6"/>
  <rect x="31" y="11" width="14" height="10" rx="2.5" fill="currentColor"/></g>
  <circle cx="67" cy="8.5" r="1.4" fill="#2b1840"/><circle cx="74.6" cy="13.2" r=".9" fill="#2b1840"/>
  ${fr(c,2,3)}${hz==='noche'?'<g fill="#fff6b0"><circle cx="36" cy="18" r="1.2"/><circle cx="44" cy="24" r=".9"/><circle cx="28" cy="26" r=".8"/></g>':''}${hz==='uni'?'<path d="M66 4L74 -6L69 6z" fill="#ffe27a" stroke="#2b1840" stroke-width="1.6"/>':''}</g></svg>`}
function raceHTML(L,av,col,me){const A=p=>p.av&&AVM[p.av]?p.av:av[p.team];
  return `<div class="hr" role="img" aria-label="Carrera: ${L.map((p,i)=>`${i+1}. ${String(p.name).replace(/[<>"&]/g,'')}`).join(', ')}">`+
  L.map((p,i)=>`<div class="hr-lane${me&&p.uid===me?' me':''}" style="--c:${col[p.team]}"><span class="hr-nm">${avSVG(A(p),'hr-av')}<span>${String(p.name).replace(/[<>&]/g,'')}</span></span>`+
    `<span class="hr-trk"><i class="hr-gate"></i><span class="hr-go"><i class="hr-tr"></i><span class="hr-run"><i class="hr-dust"></i>${horseSVG(i,p.hz)}<i class="hr-jk${(()=>{try{return typeof auraCls==='function'}catch(e){return false}})()?auraCls(p.au==null?-1:p.au):''}">${avSVG(A(p),'hr-avj')}</i></span></span><u class="hr-meta"></u></span>`+
    `<span class="hr-t"><em>${i+1}°</em>${(p.rt/1000).toFixed(2)} s</span></div>`).join('')+`<span class="hr-flash"></span><span class="hr-slowt">📸 FOTO FINISH</span><span class="hr-photo">¡Por una nariz!</span></div>`}
/* arranca la carrera (el: ms que ya pasaron, para seguirla si llega alguien tarde); regresa {first,total} en ms */
function raceRun(box,L,anim,onFirst,el){const lanes=[...box.querySelectorAll('.hr-lane')],hr=box.querySelector('.hr');if(!hr||!L.length||lanes.length!==L.length)return{first:0,total:0};el=isFinite(el)&&el>0?el:0;
  const d=L.map(p=>Math.round(1000+Math.min(1800,Math.max(0,p.rt-L[0].rt)*4))),total=Math.max(...d);
  if(!anim||el>=total||matchMedia('(prefers-reduced-motion:reduce)').matches){lanes.forEach(l=>l.classList.add('fin','still'));return{first:0,total:0}}
  /* cámara lenta si los dos primeros llegaron casi juntos */
  const SL=1500,RT=.2,ts=d[0]*.78,slow=L.length>1&&L[1].rt-L[0].rt<45&&el<ts-80&&!document.documentElement.classList.contains('lite');
  const ex=f=>!slow||f<=ts?0:f<=ts+SL*RT?(f-ts)/RT-(f-ts):SL-SL*RT;
  hr.classList.add('run');
  lanes.forEach((l,i)=>{const o={duration:d[i],easing:'cubic-bezier(.35,0,.65,1)',fill:'forwards'},a=l.querySelector('.hr-run').animate([{left:'0%'},{left:'100%'}],o),b=l.querySelector('.hr-tr').animate([{width:'0%'},{width:'100%'}],o);
    [a,b].forEach(x=>x.currentTime=Math.min(el,d[i]));
    if(d[i]<=el){l.classList.add('fin','still');return}
    a.finished.then(()=>{l.classList.add('fin');if(i===0){hr.classList.add('flash');if(onFirst)onFirst();if(L[1]&&L[1].rt-L[0].rt<25)hr.classList.add('photo')}}).catch(()=>{})});
  if(slow)setTimeout(()=>{if(!hr.isConnected)return;hr.classList.add('slow');const all=()=>{try{return hr.getAnimations({subtree:true})}catch(e){return[]}};all().forEach(x=>{try{x.playbackRate=RT}catch(e){}});
    setTimeout(()=>{hr.classList.remove('slow');all().forEach(x=>{try{x.playbackRate=1}catch(e){}})},SL)},ts-el);
  /* ¡arre!: tocar tu carril mientras corren */
  hr.addEventListener('pointerdown',e=>{const l=e.target.closest('.hr-lane');if(!l||!hr.classList.contains('run')||l.classList.contains('fin'))return;const now=performance.now();if(now-(l._ch||0)<260)return;l._ch=now;
    const r=l.querySelector('.hr-run'),b=document.createElement('i');b.className='hr-cheer';b.textContent=['¡Arre!','🔥','💨','¡Vamos!'][Math.floor(Math.random()*4)];r.appendChild(b);
    b.animate([{opacity:0,transform:'translate(-50%,0) scale(.5)'},{opacity:1,transform:'translate(-50%,-14px) scale(1.1)',offset:.3},{opacity:0,transform:'translate(-50%,-30px) scale(1)'}],{duration:700}).onfinish=()=>b.remove();
    const h=r.querySelector('.hr-h');if(h)h.animate([{translate:'0 0'},{translate:'0 -7px'},{translate:'0 0'}],{duration:240,easing:'ease-out'});try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}});
  setTimeout(()=>hr.classList.remove('run'),total-el+ex(total));return{first:Math.max(0,d[0]-el+ex(d[0])),total:total-el+ex(total)}}

/* ===================== COMODINES: fichas redondas con icono (iguales en todas las pantallas) ===================== */
const CMDI={
  p:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4a6.6 6.6 0 0 0-4 11.8c.8.6 1.3 1.4 1.3 2.3v.6h5.4v-.6c0-.9.5-1.7 1.3-2.3A6.6 6.6 0 0 0 12 2.4z" fill="#fff"/><path d="M9.4 15.6a4 4 0 0 1 .9-3.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".55"/><path d="M9.6 19.3h4.8M10.4 21.6h3.2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
  s:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 9.2h3.8L11.6 5v14l-5-4.2H2.8z" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M15.4 8.8l5.4 6.4M20.8 8.8l-5.4 6.4" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  c:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.4 8.6h1.4a2.2 2.2 0 0 1 2.2 2.2v5.2a2.2 2.2 0 0 1-2.2 2.2h-.8v2.6l-3.1-2.6h-4.1a2.2 2.2 0 0 1-2-1.3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><path d="M3.2 4.2h11.6a2.2 2.2 0 0 1 2.2 2.2v6a2.2 2.2 0 0 1-2.2 2.2H8.6l-3.8 3.1v-3.1H3.2A2.2 2.2 0 0 1 1 12.4v-6a2.2 2.2 0 0 1 2.2-2.2z" fill="#fff"/><g fill="currentColor"><circle cx="5.4" cy="9.4" r="1.25"/><circle cx="9" cy="9.4" r="1.25"/><circle cx="12.6" cy="9.4" r="1.25"/></g></svg>`};
const CMDN={p:'Pista',s:'Silencio',c:'Junta'};
/* o:{used,can,tag,attrs,label,sub} */
function ctkHTML(k,o){o=o||{};const tag=o.tag||'span';return `<${tag} class="ctk ctk-${k}${o.used?' used':''}${o.can&&!o.used?' can':''}" ${o.attrs||''}><span class="ctk-d">${CMDI[k]}</span>`+
  (o.label===false?'':`<span class="ctk-t"><b>${CMDN[k]}</b>${o.sub?`<small>${o.sub}</small>`:''}</span>`)+`</${tag}>`}

/* ===================== MODO LIGERO =====================
   Si el aparato se traba (menos de 30 cuadros por segundo casi todo el rato), se apagan las luces y adornos pesados.
   También se puede poner o quitar a mano: auto / on / off (se guarda en este aparato). */
const LITE={mode:(()=>{try{return localStorage.getItem('lite')||'auto'}catch(e){return'auto'}})(),on:false,bad:0};
function liteApply(){const on=LITE.mode==='on'||(LITE.mode==='auto'&&(()=>{try{return localStorage.getItem('lite-auto')==='1'}catch(e){return false}})());LITE.on=on;document.documentElement.classList.toggle('lite',on);try{dispatchEvent(new Event('litechange'))}catch(e){}}
function liteMode(m){LITE.mode=m;try{localStorage.setItem('lite',m);if(m!=='auto')localStorage.removeItem('lite-auto')}catch(e){}liteApply()}
function liteNote(){if(window.top!==window||!document.body)return;const d=document.createElement('div');d.className='lite-note';d.innerHTML='<span>🐢 Este aparato iba lento: activé el <b>modo ligero</b>.</span><button type="button">Quitarlo</button>';
  d.querySelector('button').onclick=()=>{liteMode('off');d.remove()};document.body.appendChild(d);setTimeout(()=>d.remove(),12000)}
liteApply();addEventListener('storage',e=>{if(e.key==='lite'||e.key==='lite-auto'){LITE.mode=(()=>{try{return localStorage.getItem('lite')||'auto'}catch(x){return'auto'}})();liteApply()}});
(function liteWatch(){if(window.top!==window)return;let last=performance.now(),t0=last,n=0,slow=0;
  const f=t=>{const d=t-last;last=t;if(!document.hidden&&d<500){n++;if(d>34)slow++}
    if(t-t0>4000){if(n>40&&slow/n>.45){LITE.bad++;if(LITE.bad>=2&&LITE.mode==='auto'&&!LITE.on){try{localStorage.setItem('lite-auto','1')}catch(e){}liteApply();liteNote()}}else LITE.bad=0;n=0;slow=0;t0=t}
    if(!LITE.on)requestAnimationFrame(f)};requestAnimationFrame(f)})();

/* ===================== JUNTAS: reloj redondo y "quién está platicando" (pantalla, vista del celular y celular) ===================== */
/* color de cada equipo (en el celular TCOL vive dentro de app.js) */
const tcol=t=>(typeof TCOL!=='undefined'?TCOL:['#3fe0cc','#ffc42e'])[t];
const avEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ringHTML(id){return `<span class="ring" ${id?`id="${id}"`:''} hidden><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="rg-bg" cx="18" cy="18" r="15.5"/><circle class="rg-fg" cx="18" cy="18" r="15.5" pathLength="100"/></svg><b></b></span>`}
/* left/tot en segundos; left=null lo esconde */
function ringSet(el,left,tot){if(!el)return;if(left==null||!(tot>0)){el.hidden=true;return}el.hidden=false;const f=Math.max(0,Math.min(1,left/tot));
  el.querySelector('.rg-fg').style.strokeDashoffset=(100-100*f).toFixed(1);el.querySelector('b').textContent=Math.max(0,Math.ceil(left-.05));el.classList.toggle('hot',left<=5.05)}
/* fila de animalitos del equipo: quién escribe (puntitos) y quién dijo "yo la digo" (✋) */
function talkAvs(box,ps,ty,cl){if(!box)return;ty=ty||[];const k=ps.map(p=>p.u+p.av+p.a+(ty.includes(p.u)?'t':'')+(cl===p.u?'c':'')).join();if(box.dataset.k===k)return;box.dataset.k=k;
  box.innerHTML=ps.map(p=>`<span class="tk${ty.includes(p.u)?' ty':''}${cl===p.u?' cl':''}"><i class="${(()=>{try{return typeof auraCls==='function'}catch(e){return false}})()?auraCls(p.a==null?-1:p.a):''}">${avSVG(p.av)}</i><small>${avEsc(p.n)}</small>${ty.includes(p.u)?'<em class="tk-d" aria-label="escribiendo"><i></i><i></i><i></i></em>':''}${cl===p.u?'<em class="tk-c" aria-label="la va a decir">✋</em>':''}</span>`).join('')}
/* el cuadrito "se ponen de acuerdo para robar" (en la pantalla nunca se ven los mensajes: la ve el otro equipo) */
function hudPanel(h){const p=document.getElementById('jhud');if(!p)return;if(!h){if(!p.hidden)p.hidden=true;return}
  if(p.hidden){p.hidden=false;if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))p.animate([{opacity:0,transform:'translateY(30px) scale(.9)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'})}
  p.style.setProperty('--tc',tcol(h.t)||tcol(0));p.classList.toggle('wait',h.left!=null);
  const tt=document.getElementById('jhudn');if(tt.textContent!==h.title)tt.textContent=h.title;
  const x=document.getElementById('jhudx'),sx=h.n?`💬 ${h.n} ${h.n===1?'mensaje':'mensajes'}`:'💬 Platicando en sus celulares…';if(x.textContent!==sx)x.textContent=sx;
  talkAvs(document.getElementById('jhudav'),h.ps||[],h.ty,h.cl);ringSet(document.getElementById('jhudr'),h.left,h.tot)}

/* ===================== REACCIONES (solo emojis): salen flotando en la pantalla y en la vista del celular ===================== */
const REACT=['😂','😱','👏','🔥','😮','🤦','❤️','🎉'];
let RXN=0;
function reactFx(e){const em=REACT[e.e|0];if(!em||!document.body)return;if(RXN>=14)return;RXN++;
  const lite=document.documentElement.classList.contains('lite'),d=document.createElement('div');d.className='rx';d.setAttribute('aria-hidden','true');
  d.style.left=(6+Math.random()*82).toFixed(1)+'%';if(e.tm===0||e.tm===1)d.style.setProperty('--tc',tcol(e.tm));
  d.innerHTML=`<b>${em}</b>`+(e.av&&AVM[e.av]&&!lite?`<i>${avSVG(e.av)}</i>`:'');document.body.appendChild(d);
  const rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,H=innerHeight*(.45+Math.random()*.2),sw=(Math.random()*40-20).toFixed(0);
  const a=d.animate(rm?[{opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.8},{opacity:0}]:[{opacity:0,transform:'translate(0,0) scale(.4)'},{opacity:1,transform:`translate(${sw/2}px,-${H*.15}px) scale(1.15)`,offset:.12},{opacity:1,transform:`translate(${-sw}px,-${H*.55}px) scale(1)`,offset:.55},{opacity:0,transform:`translate(${sw}px,-${H}px) scale(.9)`}],{duration:rm?1800:2600+Math.random()*700,easing:'cubic-bezier(.3,.6,.4,1)'});
  a.onfinish=()=>{d.remove();RXN--}}

/* ===================== RULETA: 5 niveles de fuerza =====================
   La fuerza se mide con lo rápido que giró el dedo al soltarla (en por lo menos 60 ms, para que un jalón chiquito no cuente como súper giro). */
const WLV=[{k:'deb',n:'¡Uy, qué débil! 😴',s:'débil',min:0},{k:'nor',n:'',s:'normal',min:600},{k:'fast',n:'¡Qué fuerza!',s:'¡qué fuerza!',min:1600},{k:'sup',n:'¡SÚPER GIRO!',s:'¡súper giro!',min:2700},{k:'brk',n:'¡ROMPISTE LA RULETA!',s:'¡rompió la ruleta!',min:4000}];
function wLevel(raw){let l=0;WLV.forEach((x,i)=>{if(raw>=x.min)l=i});return l}
/* qué tan rápido gira de verdad la ruleta según el nivel */
function wLvOm(lv,raw){const r=Math.random();return lv===0?880+r*220:lv===1?1150+Math.max(0,Math.min(1,(raw-600)/1000))*720+r*90:lv===2?1980+r*360:lv===3?2440+r*240:2760+r*80}
/* ¡crash! (ruido que se apaga + golpe grave) */
function crashSnd(ctx,out){try{const t=ctx.currentTime,n=Math.floor(ctx.sampleRate*.9),b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.4);
  const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(6000,t);f.frequency.exponentialRampToValueAtTime(320,t+.85);const g=ctx.createGain();g.gain.value=.9;
  const o=ctx.createOscillator(),og=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(38,t+.5);og.gain.setValueAtTime(.6,t);og.gain.exponentialRampToValueAtTime(.001,t+.6);
  s.connect(f);f.connect(g);g.connect(out);o.connect(og);og.connect(out);s.start(t);o.start(t);o.stop(t+.65)}catch(e){}}
/* la ruleta se cuartea, explota en pedazos y se vuelve a armar (sigue girando por dentro) */
function wBreakFx(stage,wheel,o){o=o||{};const rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,lite=document.documentElement.classList.contains('lite');
  const c=document.createElement('div');c.className='wbrk';c.setAttribute('aria-hidden','true');
  c.innerHTML='<svg viewBox="0 0 100 100"><path d="M50 50L36 30L22 9L15 1M50 50L67 33L84 20L97 13M50 50L60 70L76 92M50 50L28 55L8 60L1 67M36 30L25 33M67 33L73 41M60 70L52 81M28 55L22 70M84 20L88 8"/></svg>';stage.appendChild(c);
  if(o.shake)o.shake(8);
  setTimeout(()=>{if(o.snd)o.snd();if(o.shake)o.shake(26);
    const fl=document.createElement('div');fl.className='wbrk-fl';stage.appendChild(fl);
    if(rm){fl.animate([{opacity:.9},{opacity:0}],{duration:500}).onfinish=()=>fl.remove();return}
    fl.animate([{opacity:0},{opacity:1,offset:.15},{opacity:0}],{duration:650}).onfinish=()=>fl.remove();
    o.boom=wheel.animate([{scale:'1',opacity:1,filter:'none'},{scale:'1.2',opacity:1,filter:'brightness(2.4)',offset:.22},{scale:'.3',opacity:0,filter:'blur(8px) brightness(2)'}],{duration:520,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'});
    c.animate([{opacity:1},{opacity:0}],{duration:280,fill:'forwards'});
    const cols=['#ff2e88','#ffc42e','#3fe0cc','#8b5cf6','#ff8a1a','#fff8ec'],N=lite?7:16;
    for(let i=0;i<N;i++){const p=document.createElement('i');p.className='wbrk-sh';p.style.background=cols[i%cols.length];const ang=Math.PI*2*i/N+Math.random()*.4,dist=(.55+Math.random()*.4)*stage.clientWidth;
      stage.appendChild(p);p.animate([{transform:'translate(-50%,-50%) rotate(0) scale(1)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(ang)*dist}px),calc(-50% + ${Math.sin(ang)*dist}px)) rotate(${(Math.random()*720-360).toFixed(0)}deg) scale(.6)`,opacity:0}],{duration:850+Math.random()*350,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>p.remove()}
    if(o.sparks)o.sparks()},650);
  setTimeout(()=>{c.remove();if(rm){if(o.done)o.done();return}if(o.boom)o.boom.cancel();
    wheel.animate([{scale:'.3',opacity:0,filter:'blur(8px)',rotate:'-45deg'},{scale:'1.12',opacity:1,filter:'none',rotate:'6deg',offset:.7},{scale:'1',opacity:1,filter:'none',rotate:'0deg'}],{duration:780,easing:'cubic-bezier(.3,1.4,.5,1)'});
    if(o.done)o.done()},1500)}
