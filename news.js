/* lo nuevo de cada versión (sale una vez en el celular después de actualizarse) */
const NEWS=[{v:'botones-v46',t:['🪪 Ahora cada quien tiene un solo nombre: lo escoges una vez y se queda. Cambiarlo cuesta 300 🪙 (en Mi perfil).','🛒 La tiendita ya es individual: a cada quien le sale distinta.','🧩 Llegaron las colecciones (Pirata, Espacio, Ninja, Dinosaurio, Magia y Videojuegos retro): junta todas las piezas y te ganas fichas.','🎖️ Compensación: si ya habías jugado, te llegan fichas y el título «Veterano».']},
 {v:'botones-v45',t:['✍️ Cada logro legendario, mítico y secreto ahora también trae sus propias letras de respuesta y su burbuja del chat.','🛒 La tiendita creció: 8 letras nuevas, 8 burbujas, 9 títulos, 4 pieles, 4 fondos, 4 auras, 4 caballos, 4 accesorios y 3 celebraciones (corazones, lluvia de monedas y piñata).']},
 {v:'botones-v44',t:['💠 Cada logro legendario, mítico y secreto ahora trae su propia aura, con su color, movimiento y emoji. Póntelas en Mi perfil → Aura.']},
 {v:'botones-v43',t:['📵 Si a quien le toca contestar se le va el internet, el turno pasa solo a otro de su equipo (sin contar ✕) y la pantalla avisa.']},
 {v:'botones-v42',t:['🛠️ Arreglado: en la pantalla del juego en celular, los botones de comodines (como Junta) a veces no respondían, y el cuadro de la junta para robar tapaba ✕ Error.']},
 {v:'botones-v41',t:['🙋 En «Cada quien en su celular», quien juega desde la pantalla del juego ya puede escribir en la junta para robar y jugar la Ronda Relámpago.']},
 {v:'botones-v40',t:['🐢 En la tele, Ajustes → Modo ligero → «No» regresa todos los efectos si tu tele aguanta.']},
 {v:'botones-v39',t:[
 '📺 En teles el juego va más ligero: quité los adornos que se mueven sin parar y arreglé las animaciones que fallaban en navegadores viejitos.']},
 {v:'botones-v38',t:[
 '📺 El juego ya arranca en navegadores de teles más viejitas, y se ve mejor en ellas. Si algo falla, la pantalla muestra un aviso con el detalle.']},
 {v:'botones-v37',t:[
 '🙋 Si creas la partida en el mismo celular donde tienes tu perfil, al jugar desde esa pantalla eres tú: tu animalito, tu aura, tu título y lo demás. Lo que juegues suma a tus logros, fichas y temporada.']},
 {v:'botones-v36',t:['🔧 Ajustes menores.']},
 {v:'botones-v35',t:[
 '👑 Hay un set secreto del creador del juego. Solo hay uno.']},
 {v:'botones-v34',t:[
 '🛠️ Arreglado: si ya habías jugado desde la pantalla del juego, al abrirla de nuevo se trababa en «Reconectando» y no respondían los botones.']},
 {v:'botones-v33',t:[
 '🔄 Las actualizaciones llegan al instante (antes el celular podía seguir con la versión anterior unos minutos).']},
 {v:'botones-v32',t:[
 '📶 Toca el letrero de conexión de la sala para ver qué está pasando y reconectar con otro servidor.']},
 {v:'botones-v31',t:[
 '📶 La pantalla del juego ya no se queda atorada en «Reconectando»: si el servidor falla, prueba otro sola. También puedes tocar el letrero para reconectar al instante.',
 '📱 Los celulares encuentran solos la pantalla del juego si esta tuvo que cambiarse de servidor.']},
 {v:'botones-v30',t:[
 '✍️ Si juegas desde la pantalla del juego (aunque estés solo), ya te sale dónde escribir tu respuesta.',
 '📺 Si intentas unirte desde el mismo celular que es la pantalla del juego, te avisa: esa pantalla tiene que quedarse abierta y al frente.']},
 {v:'botones-v29',t:[
 '🛒 ¡La tiendita! Ganas 🪙 fichas jugando (terminar, ganar, atinar, ganar el botón, logros) y compras pieles, accesorios, fondos, auras, títulos, letras, caballos, burbujas del chat y celebraciones. Cambia cada día y lo más raro casi no sale.',
 '🎁 Si ya habías jugado, te regalamos fichas por tus logros y partidas.',
 '🎉 Celebración al ganar el botón: si te compras una, sale en la pantalla y en los celulares cuando ganas.',
 '📅 Temporadas: cada mes hay tabla en la pestaña 🏆 Fama. El 1er lugar se lleva el título «Campeón de temporada» y fichas. Ahí mismo salen las últimas partidas.',
 '📦 ¿Cambias de celular? En Mi perfil saca tu código y escanéalo con el celular nuevo.']},
 {v:'botones-v28',t:[
 'La foto de los ganadores ya llega a la pantalla aunque estés conectado “por servidor”: se manda cifrada con una clave que solo viene en el QR.',
 'Toca la etiqueta de conexión (arriba) para ver qué significa.',
 'Tus reacciones 😀 ya salen también en tu propio celular.',
 'Los títulos míticos y secretos ahora se mueven.']},
 {v:'botones-v27',t:[
 'Arreglos: la tele ya no se actualiza sola a media Ronda Relámpago, se puede saltar la ronda desde la tele, y la tabla de respuestas ya cabe completa.',
 'Si se te recarga el celular a media Ronda Relámpago, vuelves a donde ibas.',
 'La barra de arriba ya cabe bien en celulares angostos.']},
 {v:'botones-v26',t:[
 '⚡ Ronda Relámpago al final: dos de cada equipo contestan 5 preguntas en secreto en su celular, ¡y los puntos valen doble! (se puede apagar en Ajustes)',
 '📚 300 preguntas nuevas: de todos los días, con trampa, de Mérida y México, familia y fiestas, nostalgia, y gamer/anime/internet. Ya son 524.',
 'En la pestaña 🏆 Fama ves cuántas preguntas ya salieron y cuántas faltan.']},
 {v:'botones-v25',t:[
 'Tu perfil: toca tu nombre arriba para ver tus números, tus logros y lo que traes puesto.',
 'Logros de 7 rarezas (¡hay secretos!) que dan títulos, auras, caballos y letras especiales. Cuando sacas uno, sale una animación solo en tu celular.',
 'Ya no te tocan preguntas que ya viste en otras partidas.',
 'Salón de la fama, momentos de la partida y tarjeta de resultados para compartir.',
 'Si quedan empatados: ¡desempate a muerte súbita!']},
 {v:'botones-v24',t:[
 'Junta para robar: con 2 ✕, el otro equipo platica en secreto en sus celulares, y con “✋ Yo la digo” escogen quién contesta.',
 'Chat más bonito: con tu animalito, “escribiendo…”, respuestas rápidas y reloj redondo.',
 'Cada quien escoge su propio animalito (tócate arriba a la izquierda) y puedes mandar reacciones con 😀.',
 'Ruleta con 5 niveles de fuerza… y si la avientas con muchísima fuerza, ¡la rompes!',
 'Carrera de caballos nueva, con cámara lenta cuando llegan casi juntos.',
 'Foto de los ganadores (si quieren), botón para silenciar el celular, “¿Cómo se juega?” y modo para solo ver.']},
 {v:'botones-v23',t:['El anfitrión ya puede controlar todo desde su celular.']}];
