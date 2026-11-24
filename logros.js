/* ===================== LOGROS, TÍTULOS, AURAS Y CABALLOS (iguales en todas las pantallas) =====================
   Cada celular guarda su propio perfil (no hay cuentas): lo que ganó, sus contadores y lo que trae puesto. */
const RAR=[{k:'com',n:'Común',c:'#9aa3b8'},{k:'poc',n:'Poco común',c:'#35e08a'},{k:'rar',n:'Raro',c:'#3b9bff'},{k:'epi',n:'Épico',c:'#a855f7'},
  {k:'leg',n:'Legendario',c:'#ffb020'},{k:'mit',n:'Mítico',c:'#ff5ce1'},{k:'sec',n:'Secreto',c:'#b3122e'}];
/* k: contador del perfil; goal: cuánto hace falta. Los secretos no dicen cómo se ganan hasta que los sacas. */
const LOGROS=[
  {id:'novato',r:0,n:'Novato',d:'Termina tu primera partida',k:'games',goal:1},
  {id:'acierto',r:0,n:'Primer acierto',d:'Atina tu primera respuesta',k:'hits',goal:1},
  {id:'inquieto',r:0,n:'Dedo inquieto',d:'Tócale al botón antes del ¡YA!',k:'fouls',goal:1},
  {id:'chismoso',r:0,n:'Chismoso',d:'Manda 10 mensajes en las juntas',k:'msgs',goal:10},
  {id:'veloz',r:1,n:'Dedo veloz',d:'Gana el botón 5 veces',k:'bz',goal:5},
  {id:'ladron',r:1,n:'Ladronzuelo',d:'Atina una respuesta en un robo',k:'steals',goal:1},
  {id:'fiel',r:1,n:'Fiel',d:'Juega 5 partidas',k:'games',goal:5},
  {id:'atinado',r:1,n:'Atinado',d:'Atina 15 respuestas',k:'hits',goal:15},
  {id:'cazador',r:2,n:'Cazador de la #1',d:'Atina la respuesta #1 diez veces',k:'ones',goal:10},
  {id:'ganador',r:2,n:'Ganador',d:'Gana 3 partidas',k:'wins',goal:3},
  {id:'colmena',r:2,n:'Mente colmena',d:'Atina justo después de una junta de tu equipo',k:'hive',goal:1},
  {id:'comodinero',r:2,n:'Comodinero',d:'Tu equipo usa los 3 comodines en una partida',k:'cmd3',goal:1},
  {id:'rey',r:3,n:'Rey del botón',d:'Gana el botón 50 veces',k:'bz',goal:50},
  {id:'maestro',r:3,n:'Robo maestro',d:'Atina 5 robos',k:'steals',goal:5},
  {id:'limpio',r:3,n:'Tablero limpio',d:'Tu equipo destapa todo el tablero sin ninguna ✕',k:'clean',goal:1},
  {id:'supergiro',r:3,n:'Súper giro',d:'Avienta la ruleta con muchísima fuerza',k:'sup',goal:1},
  {id:'rayo',r:4,n:'Rayo',d:'Gana el botón en menos de 0.18 s',k:'rayo',goal:1},
  {id:'guante',r:4,n:'Guante blanco',d:'Atina 3 robos en una sola partida',k:'steal3',goal:1},
  {id:'relperf',r:4,n:'Relámpago perfecto',d:'Haz 150 puntos o más tú solo en la Ronda Relámpago',k:'fm150',goal:1},
  {id:'piedad',r:4,n:'Sin piedad',d:'Gana por 300 puntos o más',k:'win300',goal:1},
  {id:'rompe',r:5,n:'Rompe ruletas',d:'Rompe la ruleta',k:'brk',goal:1},
  {id:'invicto',r:5,n:'Invicto',d:'Gana 5 partidas seguidas',k:'streak',goal:5},
  {id:'perfecto',r:5,n:'Perfecto',d:'Gana una partida sin que tu equipo tenga ni una ✕',k:'perfect',goal:1},
  {id:'gente',r:5,n:'Y la gente dijo…',d:'Tu equipo hace 200 puntos en la Ronda Relámpago',k:'fm200',goal:1},
  {id:'gemelos',r:6,n:'Gemelos',d:'Tocar el botón en el mismo milisegundo que alguien del otro equipo',k:'twin',goal:1},
  {id:'tigres',r:6,n:'Tres tristes tigres',d:'Tocar el botón en exactamente 0.333 s',k:'t333',goal:1},
  {id:'filo',r:6,n:'Al filo',d:'En la última ronda, atinar en el último segundo y que tu equipo gane',k:'edge',goal:1},
  {id:'destino',r:6,n:'Ruleta del destino',d:'Romper la ruleta y que caiga en ×4',k:'brk4',goal:1},
  {id:'remontada',r:6,n:'Remontada imposible',d:'Ganar después de ir 200 puntos abajo antes de la última ronda',k:'comeback',goal:1}];
const LGM={};LOGROS.forEach(l=>LGM[l.id]=l);
/* premios que se equipan: aura (una por rareza que tengas), caballo (legendario o más) y letras (mítico o más) */
const HORSES=[{id:'',n:'Normal',r:-1},{id:'fuego',n:'Caballo de fuego',r:4},{id:'uni',n:'Unicornio arcoíris',r:5},{id:'fant',n:'Caballo fantasma',r:6}];
const WRITES=[{id:'',n:'Normales',r:-1},{id:'oro',n:'Letras de oro',r:5},{id:'rayo',n:'Letras de rayo',r:6}];
const lgTitle=id=>LGM[id]?LGM[id].n:'';
/* aura alrededor del animalito: clase según la rareza */
const auraCls=a=>a>=0&&a<RAR.length?' aura aura-'+RAR[a].k:'';
/* lo que un jugador trae puesto, ya revisado (para que nadie mande cosas raras) */
function eqClean(e){e=e&&typeof e==='object'?e:{};return{t:LGM[e.t]?e.t:'',a:Number.isInteger(e.a)&&e.a>=0&&e.a<RAR.length?e.a:-1,h:HORSES.some(x=>x.id===e.h)?e.h:'',w:WRITES.some(x=>x.id===e.w)?e.w:''}}
/* identificador corto y estable de cada pregunta (para recordar cuáles ya vio cada celular) */
function qid(q){const s=String(q||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))>>>0;return h.toString(36)}
