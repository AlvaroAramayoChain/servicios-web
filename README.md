# Desarrollo Cardon — catálogo de servicios web

Catálogo comercial de desarrollo web con **precios publicados** y cotizador en línea.
No es un portfolio ni una página informativa: es la herramienta de venta. El visitante
entra, entiende qué se ofrece, arma su presupuesto y llega a WhatsApp con un número
ya en la cabeza.

**En vivo:** https://desarrollocardon.com/
**Portfolio (aparte):** https://alvaroaramayochain.github.io/

---

## Objetivo del proyecto

**Etapa actual (1):** validar el catálogo y conseguir el primer cliente con el menor
costo y la menor complejidad posibles. Todo corre en GitHub Pages, gratis, sin
servidor, sin base de datos y sin dominio propio.

**Etapa 2 (después del primer cliente):** recién ahí se evalúa dominio propio,
hosting y backend. Ver [Reservado para la etapa 2](#reservado-para-la-etapa-2).

La regla de esta etapa: **no agregar infraestructura por anticipación.**

---

## Tecnologías

| Qué | Con qué | Por qué |
|---|---|---|
| Estructura | HTML5 semántico | Se indexa y se lee sin JavaScript |
| Estilos | CSS puro con variables | Sin build, sin preprocesador, sin framework |
| Comportamiento | JavaScript sin dependencias (~20 KB) | Cero librerías externas que puedan caerse |
| Tipografía | Jost variable autoalojada (27 KB) + serif y mono del sistema | Tres familias, ninguna descargada de terceros |
| Animación | Web Animations API + IntersectionObserver | Nativo del navegador |
| Idiomas | Diccionario en `assets/i18n.js` | Español e inglés, sin duplicar el sitio |
| Cotización del dólar | `dolarapi.com` desde el navegador | Sin servidor, con respaldo fijo si falla |
| Publicación | GitHub Pages | Gratis, HTTPS incluido, sin build |

**No hay** Node, npm, bundler, framework, backend, base de datos ni proceso de build.
Lo que está en el repositorio es exactamente lo que se publica.

---

## Estructura del proyecto

```
servicios-web/
├── index.html              → todo el catálogo, más el diccionario de inglés
├── styles.css              → sistema visual: tokens, componentes y movimiento
├── script.js               → acordeón, cotizador, nav y botón flotante
├── 404.html                → página de error, con la identidad del sitio
├── catalogo.pdf            → catálogo descargable
├── robots.txt              → permite indexar y apunta al sitemap
├── sitemap.xml             → la URL del catálogo
├── .nojekyll               → le dice a Pages que publique los archivos tal cual
└── assets/
    ├── fonts/
    │   ├── jost-var.woff2  → la tipografía del sitio, pesos 100 a 900
    │   └── JOST-OFL.txt    → su licencia (SIL Open Font License)
    ├── favicon.svg         → ícono (la marca del sitio)
    ├── favicon-32.png      → respaldo para navegadores viejos
    ├── apple-touch-icon.png→ ícono al agregar a pantalla de inicio
    └── og-cover.jpg        → imagen que se ve al compartir el link (1200×630)
```

### Secciones de `index.html`, en orden

| # | Sección | Ancla | Para qué está |
|---|---|---|---|
| — | Hero | `#top` | Propuesta de valor y lista de precios de un vistazo |
| 01 | Sitios web | `#sitios` | Landing, Institucional, Premium |
| 02 | Apps web | `#apps` | App básica, con tickets y full |
| 03 | Trabajos | `#trabajos` | Prueba de que se entregaron proyectos reales |
| 04 | Cotizador | `#cotizador` | Auto-calificación: el visitante arma su presupuesto |
| 05 | Después de publicar | `#hosting` | Puesta en producción, dominio y mantenimiento mensual |
| 06 | Preguntas frecuentes | `#preguntas` | Responde objeciones sin consumir tiempo en WhatsApp |
| — | Cierre | `#contacto` | WhatsApp, email y catálogo en PDF |

---

## Cómo ejecutarlo localmente

No hace falta instalar nada, pero **no lo abras con doble clic** (`file://`): algunas
cosas no funcionan igual que en el servidor. Levantá un servidor local:

```bash
# con Python (viene instalado en Linux y macOS)
python3 -m http.server 8000
# después abrí http://localhost:8000
```

```bash
# o con Node, si lo tenés
npx serve .
```

En VS Code también sirve la extensión **Live Server**.

> Para probarlo tal cual se ve en GitHub Pages (que sirve el sitio en
> `/servicios-web/`, no en la raíz), poné la carpeta dentro de otra y serví la de
> afuera: `http://localhost:8000/servicios-web/`. Sirve para detectar rutas absolutas
> rotas antes de publicar.

---

## Cómo agregar un servicio nuevo

Los precios de los planes viven **una sola vez**, en el HTML. El cotizador los lee de
ahí: no hay que tocar `script.js`.

1. En `index.html`, buscá la sección donde va (`#sitios` o `#apps`).
2. Copiá un `<article class="plan">` entero y pegalo dentro del mismo `<div class="ledger">`.
3. Cambiá:

```html
<article class="plan"
         data-plan="miid"          <!-- id único, sin espacios -->
         data-includes="wa"        <!-- módulos que el plan ya trae (ver tabla) -->
         data-cot-sub="3 páginas"> <!-- texto corto que se ve en el cotizador -->
  ...
  <button class="plan-bar" aria-expanded="false" aria-controls="b-miid">
    <span class="plan-n">07</span>                    <!-- número de la fila -->
    <span class="plan-t">
      <span class="plan-name">Nombre del plan</span>
      <span class="plan-sub">Bajada corta</span>
    </span>
    <span class="plan-p"><span class="num">$500.000</span></span>
    <span class="plan-x" aria-hidden="true"></span>
  </button>
  <div class="plan-drop" id="b-miid">   <!-- este id tiene que coincidir con aria-controls -->
    ...
  </div>
</article>
```

4. **Importante:** `aria-controls` del botón y el `id` del `.plan-drop` tienen que ser
   iguales y no repetirse en toda la página.
5. Actualizá el bloque `hasOfferCatalog` del JSON-LD al final de `index.html` para que
   Google vea el precio nuevo.

### Módulos que puede traer incluido un plan (`data-includes`)

| id | Módulo |
|---|---|
| `wa` | Botón de WhatsApp |
| `tk` | Sistema de tickets |
| `tka` | Tickets avanzado |
| `tg` | Bot de Telegram |
| `tga` | Bot de Telegram avanzado |

Se separan con coma: `data-includes="wa,tk,tka"`.

### Para destacar un plan

Agregá la clase `is-pick` al `<article>` y la etiqueta dentro del nombre:

```html
<span class="plan-name">Institucional <em class="pick">el más pedido</em></span>
```

---

## Cómo cambiar un precio

En `index.html`, dentro del `<span class="num">`. **Es el único lugar.** El cotizador
lee ese número del HTML, así que no puede quedar desincronizado.

Los precios de **módulos sueltos y extras** (los de la columna B y C del cotizador)
están en el bloque `<script type="application/json" id="cotizadorData">`, al final de
`index.html`. Es el único lugar donde viven.

Al terminar, actualizá también:

- La ficha del hero (`.ficha-list`), si cambió un "desde".
- La tabla de hosting (`.rows`).
- El bloque JSON-LD del final.
- El pie: `Última actualización de la lista: ...`.
- `assets/og-cover.jpg`, si querés que la imagen que se comparte muestre los precios nuevos.

---

## Cómo agregar un trabajo o una referencia

En la sección `#trabajos`, copiá un `<article class="work">`:

```html
<article class="work">
  <p class="work-kind">Tipo de proyecto</p>
  <h3 class="work-name">Nombre</h3>
  <p class="work-desc">Qué problema resolvía y qué se construyó.</p>
  <ul class="work-tags"><li>Python</li><li>Django</li></ul>
  <p class="work-state"><span class="work-dot is-done" aria-hidden="true"></span>Entregado</p>
</article>
```

Estados disponibles: `is-done` (verde, entregado), `is-wip` (ocre, en desarrollo),
`is-tpl` (gris, plantilla).

La grilla es de 3 columnas en pantallas grandes. Si agregás un cuarto trabajo, se
acomoda solo en una fila nueva.

### Para agregar una captura al trabajo

```html
<div class="work-shot">
  <img src="assets/trabajos/nombre.webp" alt="Pantalla principal del sitio de X"
       width="800" height="500" loading="lazy" decoding="async">
</div>
```

Va después de `.work-desc`.

---

## Cómo agregar imágenes

1. Guardalas en `assets/` (creá `assets/trabajos/` si son capturas).
2. **Convertilas a WebP** y redimensionalas a lo que se va a ver en pantalla. Una
   captura de 800 px de ancho no necesita pesar más de 60–80 KB.
3. Usá siempre **ruta relativa**: `assets/trabajos/foto.webp`. Nunca
   `/assets/...` (con barra al inicio) — en GitHub Pages el sitio no está en la raíz
   del dominio y esa ruta se rompe.
4. Poné `width`, `height`, `alt` descriptivo y `loading="lazy"` en todo lo que esté
   abajo del primer scroll.

---

## Cómo agregar una pregunta frecuente

En la sección `#preguntas`, copiá un `<article class="plan faq">` y cambiá el texto.
Acordate de dos cosas:

1. `aria-controls="f-11"` del botón y `id="f-11"` del panel tienen que coincidir y ser
   únicos.
2. Sumá la pregunta al bloque **FAQPage** del JSON-LD, al final de `index.html`. Eso es
   lo que puede hacer que Google la muestre desplegada en los resultados.

---

## Cómo modificar textos

Todo el texto visible está en `index.html`, en orden de lectura. No hay plantillas ni
archivos de traducción: se edita directo.

Los lugares que más se tocan:

| Qué | Dónde |
|---|---|
| Titular principal | `<h1 class="display">` |
| "Tomando proyectos · Salta, Argentina" | `.eyebrow` del hero |
| Bajada de cada sección | `.sec-note` |
| Qué incluye cada plan | `<ul class="ticks">` |
| Para quién es cada plan | `.plan-for` |
| Plazo de entrega | `.plan-meta` |
| Condiciones de pago | `.ficha-foot` y la pregunta "¿Cómo se paga?" |
| Aviso legal del pie | `.foot-legal` |

---

## Cómo actualizar los botones de contacto

El número de WhatsApp aparece en **dos lugares**:

1. En `index.html`, en cada `href="https://wa.me/543874832897?text=..."`.
2. En `script.js`, en la constante `var WA = 'https://wa.me/543874832897';`
   (la usa el botón del cotizador, que arma el mensaje solo).

Buscá y reemplazá `543874832897` en los dos archivos.

### Los mensajes precargados

Cada botón manda a WhatsApp con un texto distinto según de dónde se hizo clic. Eso te
dice, sin preguntar nada, qué le interesa a cada persona que te escribe.

El texto va en el parámetro `?text=` y tiene que estar **codificado para URL** (los
espacios como `%20`, la `¿` como `%C2%BF`, la `á` como `%C3%A1`). Para generarlo:

```bash
python3 -c "from urllib.parse import quote; print(quote('Hola! Me interesa el plan X'))"
```

### El email

`contacto@desarrollocardon.com`, en el cierre, en el pie y en el JSON-LD de
`index.html`. Son 11 enlaces, todos con el mismo asunto ya escrito:

```html
<a href="mailto:contacto@desarrollocardon.com?subject=Consulta%20por%20servicios%20web"
   data-mail-en="Enquiry about web services">Email</a>
```

Igual que en WhatsApp, el `href` es el español y funciona aunque el JavaScript
falle; `data-mail-en` es el asunto que se pone al cambiar a inglés.

**Ojo con el parámetro.** WhatsApp arma el mensaje con `?text=` y un correo arma
el asunto con `?subject=`. `i18n.js` lo saca del atributo justamente por eso: si
estuviera cableado a `?text=`, el `mailto` quedaría con un parámetro que ningún
cliente de correo interpreta y el asunto se perdería. Si algún día se suma otro
destino que meta un mensaje en el href, se agrega al arreglo `CON_MENSAJE` con su
propio parámetro.

---

## Sistema visual

La dirección se llama **ÍNDICE**. El negocio vende una sola cosa que nadie más
ofrece —los precios están publicados— y el diseño existe para que eso se vea antes
de leerlo: el sitio se compone como un índice de precios impreso, no como una
landing. Todo lo que sigue sostiene esa idea.

### La marca

**Desarrollo Cardon** es la marca comercial; **Alvaro Aramayo Chain** es el
desarrollador detrás. Esa jerarquía se sostiene en tres lugares y en ese orden:

- El lockup de la nav y del pie: `Desarrollo Cardon` en serif + `Desarrollo web
  a medida` en versalitas.
- El pie cierra con el crédito del desarrollador (`.foot-by`), a la derecha de
  la letra chica y un escalón más abajo en tamaño y color, para identificar sin
  competir con la marca.
- El JSON-LD declara la marca como `ProfessionalService` y a la persona como su
  `founder`, que es como se modela esto en schema.org.

Lo que **no** cambia con la marca: el dominio, el email y el enlace de GitHub
siguen llevando `alvaroaramayochain`. Son alojamiento y contacto, no identidad;
tocarlos rompería el sitio publicado. Si algún día hay dominio propio, ahí sí
hay que actualizar `canonical`, `og:url`, `sitemap.xml`, el JSON-LD y el `<base>`
de la 404.

### El logo

El isotipo es un cardón, el cactus columnar de Salta. Los originales viven en
`logo/`, con su propio `USO.md`: ese es el kit de marca completo y no lo toca el
sitio. Lo que el sitio usa se copia a `assets/`:

| Archivo | Dónde |
|---|---|
| `assets/logo.svg` | la marca de la nav **y** el icono de pestaña en SVG |
| `assets/favicon.ico` · `favicon-32.png` · `favicon-16.png` | pestaña, respaldos |
| `assets/apple-touch-icon.png` | pantalla de inicio en iOS |

Dos cosas que hay que respetar si lo cambiás:

- **En la nav va `cardon-favicon.svg`, la variante sólida, no el isotipo
  completo.** El isotipo tiene trazo fino y un `</>` en la base que a 28px se
  vuelven ruido; el manual pide 48px mínimos para esa versión. Se comprobó: a
  34px ya no se lee.
- **El amarillo del logo se deja intacto.** Es la marca, y va en su color aunque
  la interfaz use latón: son la misma familia y el logo queda como el punto más
  vivo de la pantalla. Desaturarlo hacia el latón lo apaga y no mejora nada. Por
  eso el hover no le cambia el color, sólo lo levanta un pixel.

El cardón ocupa más ancho que la forma que había antes, así que a 320px hubo que
recuperar esos píxeles del resto de la barra. Si lo agrandás, revisá ese ancho.

### Tipografía

**Dos familias para el contenido, y el contraste entre ellas es la identidad.** Los titulares van en
una serif old-style; la interfaz y todos los números, en una geométrica. Esa tensión
—una propuesta escrita en serif, un precio escrito como dato duro— es lo primero que
separa al sitio de una landing generada, porque las plantillas usan geométrica para
absolutamente todo.

```css
--serif: 'Iowan Old Style','Palatino Linotype',Palatino,'Book Antiqua',
         Georgia,'Times New Roman',serif;
--sans:  'Jost','Century Gothic','URW Gothic',system-ui,-apple-system,
         'Segoe UI',sans-serif;
```

La serif **no se descarga**: Iowan cubre macOS, Palatino Linotype cubre Windows y
Georgia cubre el resto. Son todas humanistas de proporción parecida, así que el
sitio se ve consistente sin sumar un solo kilobyte ni depender de Google Fonts.

**Jost va primera en la pila sans**, antes que Century Gothic. Es al revés que en la
versión anterior y es a propósito: Jost está autoalojada en `assets/fonts/`
(variable, 27 KB, SIL OFL), así que poniéndola primera todo el mundo ve exactamente
lo mismo en lugar de depender de si el visitante tiene instalada una fuente de
Monotype.

| Rol | Familia | Peso | Interletrado | Dónde |
|---|---|---|---|---|
| Titular | serif | 400 | −0,019 em | `.display` |
| Subtítulo | serif | 400 | −0,014 em | `.display-2` |
| Nombre de plan | serif | 400 | −0,008 em | `.plan-name`, `.work-name`, `.row dt` |
| Precio | sans | 300 | −0,03 em | `.plan-p .num`, `.quote-total` |
| Bajada | sans | 300 | +0,004 em | `.lead`, `.sec-note` |
| Rótulo | sans | 500 | +0,18 em, versalitas | `.sec-idx`, `.eyebrow`, `.work-kind` |
| Botón | sans | 500 | +0,14 em, versalitas | `.btn` |

Regla si agregás un tamaño: **titulares y nombres, serif; cualquier cosa con
números, sans**. Los números nunca van en serif, porque las cifras old-style no
alinean en columna.

### Paleta

```css
--ink:#0B0B0A   --ink-2:#101010   --ink-3:#060605     /* superficies, en capas */
--surface:#151514   --surface-2:#1E1E1C               /* paneles */
--bone:#F4EFE6   --bone-2:#BDB6A8   --bone-3:#948D80  /* texto */
--line / --line-2 / --line-3                          /* filetes de 1px, hueso */
--brass:#C2913C   --brass-hi:#E7C179   --brass-dp:#7E5C1F
--on-brass:#0B0B0A                                    /* texto sobre el botón lleno */
```

**El texto es hueso, no blanco puro.** Es la decisión de color más importante del
sistema: el blanco puro sobre negro es la firma de la plantilla, y el hueso cálido
es lo que hace que el conjunto se lea caro en vez de genérico. No lo cambies a
`#fff`.

**El latón aparece poco y siempre informa:** la acción principal, el elemento
activo, el plan destacado, la barra que abre cada sección, la equivalencia en
dólares. Reemplaza al azul de la versión anterior porque dice valor, moneda y
oficio, que es de lo que habla el sitio. Si lo ves en algo que no informa nada,
sacalo.

El botón primario lleva **texto de tinta sobre latón**, no blanco sobre color. Es
el único elemento completamente relleno del sitio y por eso se ve desde lejos.

La profundidad se construye con **valor** (capas de carbón) y **filetes de 1px**, no
con gradientes ni sombras. La única sombra del sitio está en el panel del cotizador.

Todos los pares de texto y fondo están medidos: el más ajustado da **5,55:1**, por
encima del 4,5:1 que pide WCAG AA. Si cambiás un color, medilo antes.

### Fotos

Las tres imagenes de `assets/bg/` son fotografias oscuras con acento dorado, una
por seccion. Vienen practicamente en la paleta del sitio, asi que **no se
convierten a duotono**: solo se desatura un poco el amarillo hacia el laton.

```css
filter: brightness(.95) contrast(1.02) saturate(.88) hue-rotate(-4deg);
```

**La legibilidad la da el escrito, no el filtro.** Es la regla importante de esta
seccion: bajar el brillo de la foto para que el texto se lea apaga la foto entera
y no hace falta. El `::after` de `.shot` lleva una placa casi opaca bajo la
columna de texto que se abre hacia el lado donde vive el motivo, mas vinetas
arriba y abajo para que las diagonales doradas no choquen con el filete que
separa las secciones.

Si reemplazas una imagen, mira de que lado esta el motivo y elegi la seccion en
consecuencia: `.shot` lleva el texto a la izquierda y `.shot-alt` a la derecha.

**En celular la composicion es otra.** La caja pasa a ser vertical y solo entra
un 30% del ancho de la foto, asi que centrarla deja ver un vacio. Por eso ahi el
texto baja al pie sobre una placa, la foto ocupa la banda de arriba, y el recorte
se elige a mano por seccion:

```css
#sitios-info  .shot-bg img{object-position:74% center;}  /* el laptop */
#apps-info    .shot-bg img{object-position:26% center;}  /* la pantalla de codigo */
#hosting-info .shot-bg img{object-position:66% center;}  /* el haz y la malla */
```

**Formato y tamano.** WebP, al tamano nativo de la foto (hoy 1672x941, 16:9), por
debajo de 300 KB cada una. Las actuales pesan unos 58 KB. Windows no trae
codificador de WebP y el repo no usa herramientas externas: la conversion se hizo
dibujando el PNG en un canvas de Chrome y exportando con
`toDataURL('image/webp', .82)`. A ese tamano el resultado es indistinguible del
PNG original de 1,2 MB.

### El menú

Seis destinos en una fila, sin desplegables: Inicio, Precios, Cotizador,
Trabajos, Preguntas y Portfolio. Cada elemento es una página real y se llega en
un clic. La página actual lleva `is-active` y `aria-current="page"`, escritos a
mano en cada HTML, y se marca con el filete de latón (con el color del acento en
celular, que en una lista apilada se lee mejor).

**El umbral del menú es 1120px, no 1024 como el del riel.** Son dos ajustes
distintos que antes compartían número por casualidad: con seis destinos más la
marca, el idioma y el botón, la barra se desbordaba 47px justo a 1024. Por
debajo de 1120 el menú se guarda detrás del botón. Si cambiás la cantidad de
enlaces o sus etiquetas, revisá ese umbral: `esAncho()` en `script.js` tiene que
seguir usando el mismo número que el CSS.

### La columna de código del hero

Ocupa el margen del titular, donde antes iba el rótulo de estado. Escribe un
bloque línea por línea, lo deja 2,6s y lo borra letra por letra para escribir el
siguiente. La caja reserva sus cuatro filas siempre, así que no empuja al
titular ni un píxel.

Los bloques están en `script.js` y no son código de relleno: repiten tres
argumentos que ya están escritos en la página (precio publicado, dominio a tu
nombre, diseño sin plantillas). Si los cambiás, que no pasen de **26
caracteres**: el riel mide 168px y a 10px de monoespaciada no entra más.

### La foto del hero

`assets/bg/hero.webp` va a sangre detrás del titular. Para eso la sección es de
ancho completo y el contenido vive en `.hero-in`, que mantiene la misma columna
que el resto del sitio.

El escrito hace dos cosas a la vez: una placa en diagonal a 112° que oscurece
arriba a la izquierda, donde vive el titular, y deja abierta la esquina inferior
derecha, por donde entra la diagonal dorada de la foto; y un degradado vertical
que hace que la imagen **emerja desde la nav y se apague al pie**, en vez de
arrancar y cortarse con dos costuras horizontales.

En celular la caja es alta y angosta: de una foto 16:9 sólo entra una cuarta
parte del ancho. Centrada caía en la zona plana y la diagonal quedaba recortada,
así que ahí el encuadre se corre a `82% center` y el escrito se aclara.

**Peso:** 14 KB. El archivo entregado era un PNG de 448 KB con extensión `.webp`.
Ojo con la calidad al reconvertir: a q82 la trama de puntos del fondo desaparece.
q92 la conserva y sigue pesando 14 KB, porque la imagen es casi plana.

### Resolución de las fotos

Las fotos van a sangre, así que el navegador las estira al ancho de la pantalla.
En pantallas de alta densidad —cualquier notebook moderna, o Windows al 125/150%—
una imagen de 1672px se agranda casi al doble y se ve blanda. Por eso las cuatro
están a **3200×1800**, y cada una tiene además una versión de 1600px:

```html
srcset="assets/bg/sitios-1600.webp 1600w, assets/bg/sitios.webp 3200w"
sizes="100vw"
```

El celular baja la chica (147 KB las cuatro) y el escritorio de alta densidad la
grande (620 KB, y tres de las cuatro son `loading="lazy"`).

**La calidad se eligió midiendo, no a ojo:** se generaron q72, q80, q88 y q94 y
se comparó cuánto detalle fino conserva cada una contra el original. q88 conserva
casi toda la mejora visible a 190 KB; q94 pesa 506 KB y el original 962 KB, y a
tamaño real de pantalla son indistinguibles de q88.

**Cuidado al reemplazar una foto:** un reescalado no sirve, aunque el archivo diga
3200px. Ya pasó una vez: los archivos tenían el tamaño correcto pero eran el mismo
original de 1672px agrandado, con 1,02× a 1,08× de detalle real. Hay que regenerar
a resolución nativa o usar un escalador generativo.

### El riel al margen

A partir de 1024 px los rótulos numerados (`01 — Sitios web`) **salen de la columna
de texto y viven en un margen propio** de 168 px, con un tramo corto de latón
debajo. Es lo que da la asimetría editorial: ningún generador de sitios compone así,
todos centran o apilan.

Se implementa con `grid-template-columns: var(--rail) minmax(0,1fr)` sobre `.sec`,
`.hero-say` y `.page-head > .wrap`. La variante `.sec-wide` abre en tres columnas
(margen, titular, nota). Por debajo de 1024 el riel desaparece y el rótulo vuelve a
su filete horizontal.

**Dos excepciones a propósito:** las secciones con foto (`.shot`) llevan el rótulo
en línea con su propio tramo de latón, y dentro de `.split` el riel se desactiva
porque la columna ya es angosta. Que no todas las secciones se compongan igual es
parte del diseño.

### La regla graduada

Cada sección abre con una **barra corta de latón seguida de marcas de medición** que
se desvanecen. Es el motivo de la casa y significa algo: medido, publicado, sin
adivinanzas. Reemplaza a la "cota" azul de la versión anterior.

Se implementa con `.band::before` (la barra) y `.band::after` (las marcas), más la
clase `is-seen` que agrega `script.js` al entrar en pantalla. Si agregás una sección
con `class="band"`, hereda todo sin tocar nada. `.shot` sólo lleva la barra: su
`::after` está ocupado por el escrito sobre la foto.

El mismo motivo se repite arriba de `.hero-band` y en el filete que traza cada grupo
de filas (`[data-stagger]`), que arranca en latón y sigue en hueso.

### Movimiento

**Tres gestos, y nada más.** La regla es menos animaciones y mejor hechas:

1. **Titulares:** se descubren línea por línea con máscara. `script.js` los corta en
   líneas visuales reales midiendo el layout, y al terminar devuelve el texto plano.
2. **Grupos de filas:** el filete superior se traza y las filas se descubren detrás,
   escalonadas.
3. **Barras de sección:** se trazan al entrar en pantalla, una sola vez.

Más las microinteracciones: el relleno de los botones secundarios entra desde abajo,
las filas se corren unos píxeles al pasar el mouse, el borde izquierdo del plan
abierto se enciende en latón, los enlaces con flecha abren el espacio entre texto e
ícono, la página actual lleva su filete de latón puesto en el menú.

**Lo que no va**, porque delata una plantilla automática: tarjetas idénticas para
todo, tres columnas con íconos, círculos decorativos, puntos entre frases como
adorno, efectos de vidrio, glows, elementos flotando, degradados que sólo están para
"verse modernos", y cualquier cosa que se mueva en bucle.

**La única excepción, y es deliberada:** la columna de código del hero se
escribe y se borra sin parar. Rompe la regla de arriba a pedido expreso. Para
que no abarate el conjunto se la mantiene en el margen, en cuerpo de 10px y en
tono bajo, con `prefers-reduced-motion` dejándola quieta. Si alguna vez estorba,
se saca borrando el `<div class="hero-code">` del HTML: el CSS y el JS la
detectan por `#heroCode` y no hacen nada si no está.

Si vas a agregar una animación, la prueba es: **¿comunica algo que sin ella no se
entiende?** Si la respuesta es no, no va.

### Detalles que sostienen la identidad

- **Radios de 2 px.** Es un índice, no una burbuja. Nada redondeado.
- **El texto nunca es blanco puro.** Ver arriba.
- **Los números usan cifras tabulares** (`tabular-nums`), así los precios alinean en
  columna.
- **Los estados son cuadrados**, no círculos. Los círculos leen genérico.
- **Los rótulos y botones van en versalitas espaciadas**, siempre desde CSS con
  `text-transform`. Nunca escribas el texto en mayúsculas en el HTML: el diccionario
  de idiomas compara nodos de texto literales y dejaría de encontrarlos.

### Regla de oro al tocar el diseño

El sitio se traduce comparando **nodos de texto literales** contra `assets/i18n.js`,
y `script.js` engancha unos sesenta selectores. Por eso el rediseño completo se hizo
**sin tocar una sola palabra visible ni la estructura**: todo vive en `styles.css`.
Si cambiás un texto del HTML, actualizá el diccionario en el mismo commit o el
inglés se rompe en silencio.

---

## Idiomas: español e inglés

El sitio está escrito en español. **El español es la fuente**: es lo que ve Google, lo
que se lee sin JavaScript y lo que hay que editar. El inglés vive en un diccionario y se
aplica reemplazando el texto en el momento.

### Cómo elige el idioma

En este orden:

1. `?lang=es` o `?lang=en` en la URL, si está.
2. Lo que el visitante haya elegido antes (guardado en el navegador).
3. El idioma del navegador: si empieza con `es`, español; si no, inglés.

Al tocar ES / EN se cambia al instante, se recuerda la elección y la URL queda con
`?lang=`, así podés mandar `…/servicios-web/?lang=en` a un cliente del exterior y le abre
directo en inglés.

### Cómo traducir algo nuevo

Buscá el bloque `<script id="i18nEn" type="application/json">` al final de `index.html`.
Es un diccionario **frase en español → frase en inglés**:

```json
"Para que te encuentren y sepan qué hacés.": "So people find you and know what you do.",
```

La clave tiene que ser **exactamente** el texto que está en el HTML (los espacios y
saltos de línea de más no importan, se normalizan). Si una frase no está en el
diccionario, se muestra en español: no se rompe nada, sólo queda sin traducir.

Las claves que empiezan con `@` no salen del HTML: son los textos que arma el
JavaScript (el mensaje de WhatsApp del cotizador, "En 2 pagos de…", la nota del dólar).
Sus versiones en español están en el objeto `ES` del script de idioma, justo debajo del
diccionario.

### Cuando agregues un servicio o una pregunta

Agregalo en español como siempre, y después sumá sus frases al diccionario. Si te
olvidás, esa parte se ve en español dentro del sitio en inglés — feo, pero no roto.

Los botones de WhatsApp llevan un atributo aparte, porque el mensaje va dentro del enlace:

```html
<a class="plan-cta"
   href="https://wa.me/543874832897?text=Hola%21%20Me%20interesa..."
   data-wa-en="Hi! I'm interested in the Landing plan (AR$200,000). Can we go over it?">
```

El `href` es el español (funciona aunque el JavaScript falle) y `data-wa-en` es el
inglés, en texto plano: el navegador lo codifica solo.

### Analítica

Umami, con `defer`, antes de `</head>` en las cinco páginas. Es el único script
externo del repositorio y no bloquea la primera pintada: suma **0,4 KB** a lo
que descarga el navegador antes de dibujar, más 2,4 KB del script diferido.

**No hace falta cartel de consentimiento**, y eso está medido, no supuesto:
cargando la misma página con y sin el script, el `localStorage` queda igual —una
sola entrada, `aac-rate`, que es la caché del dólar del propio sitio— y las
cookies quedan vacías en los dos casos.

Tres eventos, todos con atributos en el HTML, sin JavaScript nuevo:

| Evento | Dónde |
|---|---|
| `presupuesto-wa` | `#qSend` y `#qBarSend` del cotizador. **Es la conversión** |
| `whatsapp` | el resto de los enlaces a `wa.me` |
| `catalogo-pdf` | las descargas del catálogo |

**Dos cosas que no hay que romper.**

Primero: **Umami admite un solo evento por elemento.** Los dos botones de
presupuesto son enlaces a `wa.me`, así que si alguna vez se marcan en bloque
"todos los `wa.me` como `whatsapp`" se pisa la conversión y queda mezclada con
los clics sueltos. Se marcan primero por id y el patrón genérico saltea lo ya
marcado.

Segundo: **el atributo va en el HTML a propósito.** `script.js` reescribe el
`href` de esos botones en cada `render()` pero no recrea los elementos, así que
el atributo sobrevive. Instrumentarlo desde el JavaScript abriría la puerta a
disparar dos veces la métrica que más importa.

Si Umami no carga —bloqueador, red caída— no pasa nada: no hay código propio que
dependa de él.

### Cómo se audita el diccionario

Tres cosas tienen que dar cero, y conviene revisarlas cada vez que se toca un
texto:

1. **Frases del HTML sin clave.** Las únicas que pueden quedar sin clave son
   nombres propios, marcas, tecnologías y números: `Desarrollo Cardón`, `Python`,
   `WhatsApp`, `ARS`, `Error 404`, los marcadores `A` `B` `C` del cotizador.
2. **Claves huérfanas**, que quedaron en el diccionario pero ya no están en el
   HTML. Hay una sola a propósito: la del `<noscript>` del cotizador, que i18n
   saltea porque sin JavaScript tampoco corre la traducción.
3. **Traducciones al inglés repetidas.** Dos frases distintas en español no
   pueden compartir traducción: el diccionario inverso, el que devuelve al
   español, dejaría de ser unívoco.

**Al auditar, hay que recorrer el DOM como lo recorre `i18n.js`**, no con
expresiones regulares sobre el HTML. En particular hay que volver a unir los
titulares que `script.js` parte en líneas para la animación de máscara; si no,
aparecen fragmentos sueltos como frases faltantes.

### El título y la descripción de cada página

Se traducen como cualquier otro texto: la frase en español de **esa** página es
la clave del diccionario. Si agregás una página nueva, sumá su `<title>` y su
`meta description` al diccionario, o en inglés va a caer en el texto de respaldo
de `@doc.title`.

Antes esto usaba directamente la clave global `@doc.title` y las cinco páginas
terminaban con el mismo título en inglés.

### Los números también cambian

En español un precio se muestra `$200.000`. En inglés, `AR$200,000` — con coma de miles y
el prefijo `AR$`, porque para un angloparlante `$200.000` son doscientos dólares. El
número se escribe **una sola vez** en el HTML; el formato lo pone el JavaScript.

### Lo que esta decisión implica

Google indexa el español. La versión en inglés no tiene URL propia, así que no posiciona
en buscadores en inglés. Para esta etapa está bien: el mercado es Salta y el inglés sirve
para mandarle el link a un cliente del exterior o a una agencia. Si algún día el SEO en
inglés importa, el paso es partir el sitio en `/` y `/en/` — está anotado en la etapa 2.

---

## Referencia en dólares

Debajo de cada precio en pesos aparece el equivalente aproximado en dólares, al **dólar
oficial**.

### De dónde sale la cotización

Del navegador del visitante, pidiéndosela a `https://dolarapi.com/v1/dolares/oficial`.
Es una API pública y gratuita que no necesita clave y que responde el mismo valor del
dólar oficial. **No hace falta ningún servidor**: la página estática la consulta sola.

> **Por qué no dolarhoy.com:** no tiene API y no permite que otra página lea su
> contenido desde el navegador (no envía cabeceras CORS). Leerlo requeriría un backend
> propio que lo consulte y lo republique. `dolarapi.com` publica el mismo dato.

### Qué pasa si la API no responde

Nada visible. En `script.js`, arriba de todo:

```js
var RATE_FALLBACK = 1510;          // dólar oficial, venta
var RATE_DATE     = '2026-08-14';  // fecha de ese valor
```

Si la consulta falla, tarda más de 4 segundos, o devuelve un valor absurdo, se usa ese
respaldo y el sitio muestra la referencia igual. La única diferencia es que la nota al
pie dice sólo el valor, sin fecha de actualización.

**Actualizá esas dos líneas cada tanto** — cada dos o tres meses alcanza — para que el
respaldo no quede viejo si algún día la API deja de existir.

La cotización se guarda 6 horas en el navegador del visitante, así que no se pide de
nuevo en cada visita.

### Si querés sacar el dólar

Borrá la sección 1 y 2 de `script.js` (`DÓLAR` y `PRECIOS EN PANTALLA`) y los elementos
`#rateNote`, `#qRate` y `#qUsd` del HTML. Los precios en pesos siguen funcionando: viven
en el HTML, no dependen del JavaScript.

---

## Cómo publicar en GitHub Pages

Ya está configurado. Cada `push` a `main` republica el sitio en uno o dos minutos.

```bash
git add .
git commit -m "Actualizo precios"
git push
```

Si alguna vez hay que configurarlo de cero:

1. Repositorio → **Settings** → **Pages**.
2. *Source*: **Deploy from a branch**.
3. *Branch*: `main`, carpeta `/ (root)`.
4. **Save**. La URL queda en `https://<usuario>.github.io/<repositorio>/`.

### Reglas para que no se rompa en Pages

- **Siempre rutas relativas.** `styles.css`, `assets/og-cover.jpg`, `catalogo.pdf`.
  Nunca con `/` al inicio: el sitio vive en `/servicios-web/`, no en la raíz.
- **`404.html` es la única excepción, y lleva `<base href="/">`.**
  Pages sirve esa página para *cualquier* ruta inexistente, pero la barra de
  direcciones se queda en la ruta pedida. Sin el `<base>`, desde
  `/precios/enlace-viejo` el navegador buscaba `/precios/styles.css` y la página
  salía sin estilos, sin tipografía y con los enlaces apuntando mal. No le saques
  el `<base>`. **Si algún día cambia dónde vive el sitio, esta línea cambia con
  él:** valía `/servicios-web/` mientras estaba en GitHub Pages y pasó a `/` al
  mudarse a dominio propio.
- Las URLs absolutas sólo van en las etiquetas que las exigen: `canonical`,
  `og:image`, `sitemap.xml` y el JSON-LD.
- El archivo `.nojekyll` tiene que seguir ahí. Sin él, Pages procesa el sitio con
  Jekyll e ignora cualquier carpeta o archivo que empiece con guion bajo.
- Nada de `localhost` en el código publicado.

### Cómo probar la 404 en local

El `<base>` apunta a `/servicios-web/`, así que si servís el repo desde su propia
carpeta la 404 se ve sin estilos. Para probarla como se publica, serví **la
carpeta de arriba** y entrá por la ruta completa:

```bash
cd ..                      # el directorio que contiene servicios-web/
python -m http.server 8000
# después abrí http://localhost:8000/servicios-web/404.html
```

El servidor de Python no sirve `404.html` en rutas inexistentes como sí hace
Pages; para comprobar ese comportamiento hay que mirarlo publicado.

### Antes de cada publicación

- [ ] Abrilo en el celular, no sólo en la computadora.
- [ ] Consola del navegador sin errores (F12 → Console).
- [ ] Los botones de WhatsApp abren el chat con el mensaje correcto.
- [ ] El cotizador suma bien y el total del panel coincide con el de la barra del celular.
- [ ] Si tocaste precios, que coincidan el HTML, el JSON-LD y el PDF.
- [ ] Miralo también en inglés (`?lang=en`): que no quede ninguna frase sin traducir.
- [ ] Que la referencia en dólares muestre un número razonable.
- [ ] Que ninguna sección quede sin su línea de cota trazada al hacer scroll.

---

## Cómo hacer cambios futuros

Decisiones tomadas a propósito, para no romperlas sin querer:

**Las animaciones están detrás de la clase `.js`.** El `<head>` marca `<html class="js">`
antes del primer pintado y, si `script.js` no llegó a correr en 2,5 segundos, agrega
`.motion-off` y todo vuelve a ser visible. Traducido: **si el JavaScript falla, el sitio
se sigue viendo.** Si agregás una animación nueva, ponela también detrás de `.js`.

**El HTML es la fuente de los precios de los planes.** `script.js` los lee del DOM.
No copies un precio dentro del JavaScript: se van a desincronizar.

**Sin dependencias externas de ningún tipo.** El sitio no carga ninguna librería, y
desde que la tipografía está autoalojada, tampoco ningún archivo de otro dominio.
Antes de sumar uno, preguntate si el navegador ya lo hace solo — casi siempre sí.

**La ficha del hero se revela con `mask-image`, no con `clip-path`.** No es capricho:
`clip-path` deja el rectángulo de intersección vacío y el observador nunca detecta
que el elemento entró en pantalla, así que la ficha no aparecía nunca.

**Los acordeones se animan con `element.animate()`**, no con transiciones de CSS, para
poder cancelarlos. Si alguien hace clic tres veces rápido, ningún panel queda trabado.

**El botón flotante de WhatsApp se esconde solo** cuando ya hay un botón de contacto en
pantalla (cotizador y cierre). Un llamado a la acción por pantalla, no tres.

---

## Reservado para la etapa 2

Nada de esto está implementado, y es a propósito. Se evalúa **después del primer cliente**.

| Funcionalidad | Por qué no está ahora | Qué necesita |
|---|---|---|
| Dominio propio | Cuesta plata y todavía estamos validando | Registro en NIC.ar + archivo `CNAME` en el repo |
| Email profesional | Depende del dominio | Alias en el dominio propio |
| Formulario de contacto que envía | GitHub Pages no ejecuta código de servidor | Servicio externo (Formspree, Basin) o backend propio |
| Panel de administración | Necesita servidor y base de datos | Hosting propio |
| Sistema de tickets funcional | Es el producto que se vende, no el catálogo | Backend + base de datos |
| Blog o páginas por rubro | Multiplica el trabajo de mantenimiento | Se puede hacer estático, en carpetas |
| Analítica (GA4 / Tag Manager) | Suma scripts de terceros antes de tener tráfico | Un `<script>` en el `<head>` |
| Testimonios | No hay clientes que los den todavía | Sección nueva, misma estructura que Trabajos |
| SEO en inglés | Hoy el inglés no tiene URL propia | Partir el sitio en `/` y `/en/`, con `hreflang` |
| Precios en dólares de verdad | Hoy el dólar es sólo una referencia | Decidir si se cotiza en USD y ajustar la lista |

### Cuando llegue el momento de migrar

El sitio es HTML, CSS y JS planos, con rutas relativas. Migrar a hosting propio es
**copiar los archivos y apuntar el dominio**. No hay build que reproducir ni base de
datos que exportar.

Lo único que hay que cambiar al mudarse:

1. `<link rel="canonical">` en `index.html`.
2. `og:url` y `og:image` (rutas absolutas).
3. La URL del sitemap en `robots.txt` y en `sitemap.xml`.
4. El `@id` y la `url` del JSON-LD.
5. Agregar un archivo `CNAME` si el dominio se sigue sirviendo desde GitHub Pages.

Si el día de mañana el catálogo pasa a un backend, la ruta natural es servir este mismo
HTML como plantilla y mover el bloque `cotizadorData` a la base de datos. La estructura
ya está separada para eso.

---

## Pendientes de revisión

Datos que conviene confirmar antes de mandar el link a un cliente:

- [ ] **Plazos de entrega** de cada plan (`.plan-meta` y la primera pregunta frecuente).
      Están puestos como estimación conservadora; ajustalos a tu ritmo real.
- [ ] **Facturación.** La pregunta "¿Cómo se paga?" explica el 50/50 pero no dice nada
      sobre si emitís factura. Si corresponde, agregalo.
- [ ] **Testimonios y nombres de clientes.** Hoy no hay ninguno publicado, a propósito.
      Es lo que más falta para vender un proyecto de siete cifras.
