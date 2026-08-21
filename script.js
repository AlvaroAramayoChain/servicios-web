/* ===========================================================
   ALVARO ARAMAYO — comportamiento
   Sin framework y sin dependencias externas.

   Reglas de la casa:
   · Los precios de los planes viven UNA sola vez, en el HTML.
     Este archivo los lee del DOM; no los repite.
   · Si algo de acá falla, la página se tiene que seguir viendo.
     Por eso el CSS de animaciones está detrás de .js y el <head>
     tiene una red de seguridad por tiempo.
   · El idioma lo resuelve el bloque de i18n del final del HTML.
     Acá sólo se piden los textos con I18N.t().
   =========================================================== */
(function () {
  'use strict';

  var html   = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA     = 'https://wa.me/543874832897';

  var I18N = window.I18N || { lang: 'es', t: function (k) { return k; }, on: function () {} };

  var toNumber = function (txt) { return parseInt(String(txt).replace(/\D/g, ''), 10) || 0; };
  var $        = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$       = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* En inglés los miles se separan con coma y el peso se aclara como AR$:
     "$120.000" leído por un angloparlante son ciento veinte dólares. */
  function money(n) {
    var v = Math.round(n);
    return I18N.lang === 'en'
      ? 'AR$' + v.toLocaleString('en-US')
      : '$' + v.toLocaleString('es-AR');
  }
  function plainNumber(n) {
    return Math.round(n).toLocaleString(I18N.lang === 'en' ? 'en-US' : 'es-AR');
  }

  /* =========================================================
     1. DÓLAR
     Referencia en dólares junto a cada precio. El valor se pide
     a una API pública (dolarapi.com, dólar oficial) desde el
     navegador: no hace falta servidor. Si no responde, está
     bloqueada o tarda, se usa el respaldo fijo y no pasa nada.
     ========================================================= */
  var RATE_FALLBACK = 1510;                 // dólar oficial, venta
  var RATE_DATE     = '2026-08-14';         // fecha del respaldo
  var RATE_URL      = 'https://dolarapi.com/v1/dolares/oficial';
  var RATE_CACHE    = 'aac-rate';
  var RATE_TTL      = 6 * 60 * 60 * 1000;   // 6 horas

  var rate = { value: RATE_FALLBACK, date: RATE_DATE, live: false };

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(I18N.lang === 'en' ? 'en-GB' : 'es-AR',
      { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function readCachedRate() {
    try {
      var raw = localStorage.getItem(RATE_CACHE);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || !c.value || (Date.now() - c.at) > RATE_TTL) return null;
      return c;
    } catch (e) { return null; }
  }

  function fetchRate() {
    var cached = readCachedRate();
    if (cached) {
      rate = { value: cached.value, date: cached.date, live: true };
      renderPrices();
      return;
    }
    if (!window.fetch) return;

    // corte por tiempo: la cotización nunca puede demorar la página
    var ctrl = window.AbortController ? new AbortController() : null;
    if (ctrl) setTimeout(function () { ctrl.abort(); }, 4000);

    fetch(RATE_URL, { signal: ctrl ? ctrl.signal : undefined, cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var v = d && (d.venta || d.compra);
        if (!v || v < 100 || v > 1000000) return;      // valor absurdo: lo ignoramos
        rate = { value: v, date: d.fechaActualizacion || '', live: true };
        try {
          localStorage.setItem(RATE_CACHE, JSON.stringify(
            { value: rate.value, date: rate.date, at: Date.now() }));
        } catch (e) {}
        renderPrices();
      })
      .catch(function () { /* se queda el respaldo, sin ruido en consola */ });
  }

  /* =========================================================
     2. PRECIOS EN PANTALLA
     El número vive en el HTML. Acá sólo se le da formato según
     el idioma y se le agrega la equivalencia en dólares.
     ========================================================= */
  var priceEls = [];

  function collectPrices() {
    $$('.plan-p .num').forEach(function (el) {
      var n = toNumber(el.textContent);
      if (n) priceEls.push({ el: el, vals: [n], usdIn: el.parentNode });
    });
    $$('.ficha-list b').forEach(function (el) {
      var n = toNumber(el.textContent);
      if (n) priceEls.push({ el: el, vals: [n] });      // en la ficha no va el dólar: no entra
    });
    $$('.rows .row dd').forEach(function (dd) {
      var node = dd.firstChild;
      if (!node || node.nodeType !== 3) return;
      var nums = node.nodeValue.match(/\$[\d.,]+/g);
      if (!nums) return;
      priceEls.push({ node: node, vals: nums.map(toNumber), usdIn: dd, sep: '–' });
    });
  }

  function usdText(vals) {
    var parts = vals.map(function (v) { return Math.round(v / rate.value); });
    return I18N.t('@usd.aprox', { x: parts.join('–') });
  }

  function renderPrices() {
    priceEls.forEach(function (p) {
      var txt = p.vals.map(money).join(p.sep || '');
      if (p.el) p.el.textContent = txt;
      else p.node.nodeValue = txt + ' ';

      if (!p.usdIn) return;
      var tag = $('.usd', p.usdIn);
      if (!tag) {
        tag = document.createElement('small');
        tag.className = 'usd';
        p.usdIn.appendChild(tag);
      }
      tag.textContent = usdText(p.vals);
    });

    var note = rate.live && rate.date
      ? I18N.t('@usd.nota', { rate: plainNumber(rate.value), date: fmtDate(rate.date) })
      : I18N.t('@usd.nota.fija', { rate: plainNumber(rate.value) });

    [$('#rateNote'), $('#qRate')].forEach(function (el) {
      if (!el) return;
      el.textContent = note;
      el.hidden = false;
    });

    if (typeof render === 'function' && elBase) render();
  }


  /* =========================================================
     3. MENÚ PRINCIPAL
     Seis enlaces planos. En escritorio no hay nada que abrir: cada
     elemento es un destino y se llega en un clic. En pantallas
     angostas el menú entero se despliega desde el botón.
     ========================================================= */
  var menu    = $('#menuPrincipal');
  var navBtn  = $('#navToggle');
  // mismo umbral que el CSS: arriba de 1120 el menú vive en la barra
  var esAncho = function () { return window.matchMedia('(min-width:1120px)').matches; };

  function cerrarMenu(devolverFoco) {
    if (!navBtn || navBtn.getAttribute('aria-expanded') !== 'true') return;
    navBtn.setAttribute('aria-expanded', 'false');
    html.classList.remove('menu-abierto');
    if (devolverFoco) navBtn.focus();
  }

  if (navBtn && menu) {
    navBtn.addEventListener('click', function () {
      var abierto = navBtn.getAttribute('aria-expanded') === 'true';
      navBtn.setAttribute('aria-expanded', abierto ? 'false' : 'true');
      html.classList.toggle('menu-abierto', !abierto);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarMenu(true);
  });

  // un clic fuera del menú abierto lo cierra
  document.addEventListener('click', function (e) {
    if (!menu || menu.contains(e.target)) return;
    if (navBtn && navBtn.contains(e.target)) return;
    cerrarMenu(false);
  });

  // al pasar a escritorio el menú vuelve a su barra: el estado abierto sobra
  window.addEventListener('resize', function () {
    if (esAncho()) cerrarMenu(false);
  }, { passive: true });

  /* =========================================================
     4. MOTION
     Tres tipos de revelado distintos según el contenido, para
     que no entre todo con el mismo fundido.
     ========================================================= */

  /* Parte los titulares en líneas visuales reales para el efecto máscara.
     Cuando el revelado termina, devuelve el texto plano: así el titular
     vuelve a fluir normal si se rota el celular o se cambia el zoom. */
  function splitLines(el) {
    var original = el.textContent;
    var words = original.trim().split(/\s+/);
    var frag = document.createDocumentFragment();

    var spans = words.map(function (w, i) {
      var s = document.createElement('span');
      s.textContent = w + (i < words.length - 1 ? ' ' : '');
      frag.appendChild(s);
      return s;
    });
    el.textContent = '';
    el.appendChild(frag);

    var lines = [], last = null;
    spans.forEach(function (s) {
      var top = s.offsetTop;
      if (last === null || Math.abs(top - last) > 4) { lines.push([]); last = top; }
      lines[lines.length - 1].push(s.textContent);
    });

    el.textContent = '';
    lines.forEach(function (words, i) {
      var outer = document.createElement('span');
      outer.className = 'ln';
      var inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      inner.textContent = words.join('');
      outer.appendChild(inner);
      el.appendChild(outer);
    });

    el._plain  = original;
    el._settle = 820 + lines.length * 85 + 120;
  }

  function unsplit(el) {
    if (!el._plain) return;
    el.textContent = el._plain;
    el._plain = null;
  }

  function markVisible(el) {
    el.classList.add('on');
    if (el._plain) setTimeout(function () { unsplit(el); }, el._settle);
  }

  function startMotion() {
    html.classList.add('reveal-ready');

    if (!REDUCE) $$('[data-reveal="mask"]').forEach(splitLines);

    $$('[data-reveal="rise"]').forEach(function (el) {
      var d = el.getAttribute('data-delay');
      if (d) el.style.setProperty('--d', d);
    });
    $$('[data-stagger]').forEach(function (group) {
      $$('.plan, .row, .work', group).forEach(function (item, i) {
        item.style.setProperty('--i', i);
      });
    });

    var animated = $$('[data-reveal], [data-stagger]');

    if (REDUCE || !('IntersectionObserver' in window)) {
      animated.forEach(markVisible);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        markVisible(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    animated.forEach(function (el) { io.observe(el); });
  }

  /* Las líneas del titular se calculan midiendo el layout: si lo hacemos
     antes de que carguen las tipografías, los cortes quedan mal. Esperamos
     a las fuentes, pero con tope: si no cargan, seguimos igual. */
  if (document.fonts && document.fonts.ready) {
    var done = false;
    var go = function () { if (!done) { done = true; startMotion(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1200);
  } else {
    startMotion();
  }

  /* Cotas de sección: el filete de acento se traza al entrar en pantalla.
     Es el separador entre secciones, y se dibuja una sola vez. */
  function markBands() {
    var bands = $$('.band, .close, .shot, .page-head');
    if (REDUCE || !('IntersectionObserver' in window)) {
      bands.forEach(function (b) { b.classList.add('is-seen'); });
      return;
    }
    var bandIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-seen');
        bandIO.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    bands.forEach(function (b) { bandIO.observe(b); });
  }
  markBands();

  /* =========================================================
     4b. COLUMNA DE CÓDIGO DEL HERO
     Escribe un bloque línea por línea, lo deja un momento y lo borra
     letra por letra para escribir el siguiente.

     Es la única animación en bucle del sitio y contradice la regla de
     la casa ("nada que se mueva en bucle"), a pedido expreso. Para que
     no abarate el conjunto va en el margen, en cuerpo chico y en tono
     bajo: acompaña al titular en vez de competirle.

     Los bloques no son código de relleno: repiten tres argumentos que
     ya están escritos en la página (precio publicado, dominio a tu
     nombre, diseño sin plantillas).
     ========================================================= */
  (function () {
    var caja = $('#heroCode');
    if (!caja) return;

    var BLOQUES = [
      ['const sitio = {',
       "  precio: 'publicado',",
       "  dominio: 'a tu nombre'",
       '};'],
      ['.sitio {',
       '  diseño: a-medida;',
       '  plantillas: none;',
       '}'],
      ['<main>',
       '  <h1>Tu negocio</h1>',
       '</main>']
    ];

    var FILAS = 4;                       // alto fijo: la caja nunca empuja al titular
    var V_ESCRIBE = 45, V_BORRA = 22;    // ms por letra
    var P_LINEA = 170, P_BLOQUE = 2600, P_CICLO = 500;

    var filas = [];
    for (var i = 0; i < FILAS; i++) {
      var sp = document.createElement('span');
      sp.className = 'cl';
      caja.appendChild(sp);
      filas.push(sp);
    }

    var b = 0, l = 0, c = 0, fase = 'escribe', reloj = null;

    function pinta() {
      var bloque = BLOQUES[b];
      for (var i = 0; i < FILAS; i++) {
        var txt = '';
        if (i < bloque.length) {
          if (i < l) txt = bloque[i];
          else if (i === l) txt = bloque[i].slice(0, c);
        }
        filas[i].textContent = txt;
        filas[i].classList.toggle('activa', i === l);
      }
    }

    // sin movimiento: el primer bloque queda escrito y quieto, sin cursor
    if (REDUCE) {
      l = BLOQUES[0].length - 1;
      c = BLOQUES[0][l].length;
      pinta();
      for (var k = 0; k < FILAS; k++) filas[k].classList.remove('activa');
      return;
    }

    function paso() {
      var bloque = BLOQUES[b], t = V_ESCRIBE;

      if (fase === 'escribe') {
        if (c < bloque[l].length) c++;
        else if (l < bloque.length - 1) { l++; c = 0; t = P_LINEA; }
        else { fase = 'espera'; t = P_BLOQUE; }
      } else if (fase === 'espera') {
        fase = 'borra'; t = V_BORRA;
      } else {
        if (c > 0) { c--; t = V_BORRA; }
        else if (l > 0) { l--; c = bloque[l].length; t = V_BORRA; }
        else { b = (b + 1) % BLOQUES.length; fase = 'escribe'; t = P_CICLO; }
      }

      pinta();
      reloj = setTimeout(paso, t);
    }

    pinta();
    reloj = setTimeout(paso, 900);       // deja que entre primero el titular

    /* con la pestaña en segundo plano no tiene sentido seguir escribiendo */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearTimeout(reloj); reloj = null; }
      else if (!reloj) { reloj = setTimeout(paso, 300); }
    });
  })();

  /* =========================================================
     5. NAV — progreso, sombra al despegar y sección activa
     ========================================================= */
  var nav      = $('#nav');
  var bar      = $('#progressBar');
  var fab      = $('#waFab');
  var hero     = $('#top');
  var ticking  = false;
  var fabFrom  = 400;

  function measure() {
    fabFrom = hero ? Math.max(hero.offsetHeight * 0.7, 320) : 400;
  }

  function onScroll() {
    var y   = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-stuck', y > 8);
    if (fab) fab.classList.toggle('on', y > fabFrom);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
  measure();
  onScroll();

  /* =========================================================
     6. ACORDEÓN (planes y preguntas)
     Un botón real con aria-expanded. La altura se anima con la
     Web Animations API para poder cancelarla: si el visitante
     hace clic rápido dos veces, no queda ningún panel trabado.
     ========================================================= */
  var EASE = 'cubic-bezier(.22,.68,.28,1)';

  function panelOf(btn) { return document.getElementById(btn.getAttribute('aria-controls')); }

  function setPanel(btn, panel, open) {
    if (panel._anim) { panel._anim.cancel(); panel._anim = null; }

    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) panel.hidden = false;

    var inner = panel.firstElementChild;
    if (REDUCE || typeof panel.animate !== 'function') {
      panel.style.height = open ? 'auto' : '';
      panel.hidden = !open;
      return;
    }

    var from = panel.offsetHeight;
    var to   = open ? inner.offsetHeight : 0;

    // dejamos el estado final aplicado antes de animar: así no hay
    // ningún fotograma intermedio raro cuando la animación termina
    panel.style.height = open ? to + 'px' : '';

    var anim = panel.animate(
      [{ height: from + 'px' }, { height: to + 'px' }],
      { duration: open ? 420 : 320, easing: EASE }
    );
    panel._anim = anim;
    anim.onfinish = function () {
      panel._anim = null;
      if (open) { panel.style.height = 'auto'; }
      else      { panel.style.height = ''; panel.hidden = true; }
    };
  }

  $$('.plan-bar').forEach(function (btn) {
    var panel = panelOf(btn);
    if (!panel) return;
    panel.hidden = true;                       // colapsado sólo si hay JS para reabrirlo

    btn.addEventListener('click', function () {
      var open  = btn.getAttribute('aria-expanded') === 'true';
      var group = btn.closest('[data-accordion]');

      if (!open && group) {
        $$('.plan-bar[aria-expanded="true"]', group).forEach(function (other) {
          if (other !== btn) setPanel(other, panelOf(other), false);
        });
      }
      setPanel(btn, panel, !open);
    });
  });

  /* =========================================================
     7. COTIZADOR
     Las bases se leen de los <article class="plan"> del HTML.
     Los módulos y extras, del bloque JSON del final de la página.
     ========================================================= */
  /* Los datos salen de assets/catalogo.js, que comparten esta página y la
     de precios. En /precios/ los mismos números están escritos en el HTML
     porque es lo que ve Google; abajo hay un control que avisa si dejaron
     de coincidir. */
  var CAT = window.CATALOGO || { bases: [], modulos: [], extras: [] };

  function readBases() {
    return (CAT.bases || []).map(function (b) {
      return { id: b.id, name: I18N.t(b.nombre), price: b.precio,
               sub: I18N.t(b.sub || ''), has: b.incluye || [] };
    }).filter(function (b) { return b.id && b.price; });
  }

  var elBase   = $('#qBase');
  var elMods   = $('#qMods');
  var elExtra  = $('#qExtra');
  var elTotal  = $('#qTotal');
  var elUsd    = $('#qUsd');
  var elSplit  = $('#qSplit');
  var elLines  = $('#qLines');
  var elMonth  = $('#qMonth');
  var elSend   = $('#qSend');
  var elCard   = $('#qCard');
  var elStatus = $('#qStatus');

  /* barra resumen de celular — declarada ANTES de render() para que
     la primera pasada ya la deje sincronizada */
  var elBar      = $('#qBar');
  var elBarTotal = $('#qBarTotal');
  var elBarSend  = $('#qBarSend');
  var hasBase = false, cardOut = false;

  function syncBar() {
    if (!elBar) return;
    var show = hasBase && cardOut;
    elBar.hidden = !show;
    if (show) requestAnimationFrame(function () { elBar.classList.add('on'); });
    else elBar.classList.remove('on');
    if (fab) fab.classList.toggle('is-hidden', show);
  }

  var BASES  = [];
  var MODS   = (CAT.modulos || []).map(function (m) {
    return { id: m.id, name: m.nombre, price: m.precio, sub: m.sub, beats: m.reemplaza || [] };
  });
  var EXTRAS = (CAT.extras || []).map(function (x) {
    return { id: x.id, name: x.nombre, price: x.precio, sub: x.sub,
             on: !!x.activo, monthly: !!x.mensual };
  });

  var state = { base: null, mods: {}, extras: {} };
  EXTRAS.forEach(function (x) { state.extras[x.id] = !!x.on; });

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function option(type, name, id, title, sub, price) {
    var l = document.createElement('label');
    l.className = 'opt';
    l.setAttribute('data-for', id);

    var input = document.createElement('input');
    input.type = type; input.name = name; input.value = id;

    var box = document.createElement('span');
    box.className = 'box' + (type === 'radio' ? ' round' : '');

    var t = document.createElement('span');
    t.className = 'opt-t';
    t.appendChild(document.createTextNode(title));
    var small = document.createElement('small');
    small.textContent = sub;
    t.appendChild(small);

    var p = document.createElement('span');
    p.className = 'opt-p';
    p.textContent = price;

    l.appendChild(input); l.appendChild(box); l.appendChild(t); l.appendChild(p);
    return l;
  }

  /* Se vuelve a construir entero al cambiar de idioma: los nombres,
     las bajadas y el formato de los precios cambian todos juntos. */
  function buildQuote() {
    if (!elBase) return;
    BASES = readBases();
    if (!BASES.length) return;

    elBase.innerHTML = ''; elMods.innerHTML = ''; elExtra.innerHTML = '';

    BASES.forEach(function (b) {
      var node = option('radio', 'qbase', b.id, b.name, b.sub, money(b.price));
      if (state.base === b.id) $('input', node).checked = true;
      elBase.appendChild(node);
    });
    MODS.forEach(function (m) {
      elMods.appendChild(
        option('checkbox', 'qmod', m.id, I18N.t(m.name), I18N.t(m.sub), money(m.price)));
    });
    EXTRAS.forEach(function (x) {
      var label = x.monthly ? money(x.price) + '/' + (I18N.lang === 'en' ? 'mo' : 'mes')
                            : money(x.price);
      elExtra.appendChild(
        option('checkbox', 'qextra', x.id, I18N.t(x.name), I18N.t(x.sub), label));
    });

    render();
  }

  if (elBase) {
    elBase.addEventListener('change', function (e) { state.base = e.target.value; render(); });
    elMods.addEventListener('change', function (e) {
      var id = e.target.value;
      state.mods[id] = e.target.checked;
      if (e.target.checked) {
        var mod = find(MODS, id);
        (mod && mod.beats ? mod.beats : []).forEach(function (b) { state.mods[b] = false; });
      }
      render();
    });
    elExtra.addEventListener('change', function (e) {
      state.extras[e.target.value] = e.target.checked;
      render();
    });
  }

  function render() {
    if (!elBase || !BASES.length) return;
    var base     = state.base ? find(BASES, state.base) : null;
    var included = base ? base.has : [];
    var total = 0, monthly = 0, lines = [], parts = [];

    if (base) {
      total += base.price;
      lines.push({ t: base.name, v: money(base.price) });
      parts.push(base.name);
    }

    MODS.forEach(function (m) {
      var node = $('[data-for="' + m.id + '"]', elMods);
      if (!node) return;
      var input   = $('input', node);
      var priceEl = $('.opt-p', node);
      var isIn    = included.indexOf(m.id) !== -1;
      var name    = I18N.t(m.name);

      node.classList.toggle('is-in', isIn);
      input.disabled = isIn;
      priceEl.textContent = isIn ? I18N.t('@cot.incluido') : money(m.price);

      if (isIn) {
        input.checked = false;
        node.classList.remove('is-on');
        lines.push({ t: name, v: I18N.t('@cot.incluido'), free: true });
        return;
      }
      if (state.mods[m.id]) {
        input.checked = true;
        total += m.price;
        lines.push({ t: name, v: money(m.price) });
        parts.push(name);
      } else {
        input.checked = false;
      }
      node.classList.toggle('is-on', input.checked);
    });

    EXTRAS.forEach(function (x) {
      var node = $('[data-for="' + x.id + '"]', elExtra);
      if (!node) return;
      var on = !!state.extras[x.id];
      $('input', node).checked = on;
      node.classList.toggle('is-on', on);
      if (!on || !base) return;                 // sin base no hay presupuesto
      if (x.monthly) { monthly += x.price; }
      else {
        total += x.price;
        lines.push({ t: I18N.t(x.name), v: money(x.price) });
        parts.push(I18N.t(x.name));
      }
    });

    elCard.classList.toggle('is-filled', !!base);
    elTotal.textContent = money(total);
    elSplit.textContent = base ? I18N.t('@cot.pagos', { x: money(total / 2) })
                               : I18N.t('Seleccioná una base para comenzar');

    if (elUsd) {
      elUsd.textContent = I18N.t('@usd.aprox', { x: Math.round(total / rate.value) });
      elUsd.hidden = !base;
    }

    elLines.innerHTML = '';
    lines.forEach(function (l) {
      var li = document.createElement('li');
      if (l.free) li.className = 'is-free';
      var a = document.createElement('span'); a.textContent = l.t;
      var b = document.createElement('span'); b.textContent = l.v;
      li.appendChild(a); li.appendChild(b);
      elLines.appendChild(li);
    });

    if (monthly > 0) {
      elMonth.hidden = false;
      elMonth.textContent = I18N.t('@cot.mensual', { x: money(monthly) });
    } else {
      elMonth.hidden = true;
    }

    /* un solo aviso corto para lectores de pantalla, en vez de releer
       la lista entera en cada clic */
    if (elStatus) {
      elStatus.textContent = base ? I18N.t('@cot.estado', { x: money(total) }) : '';
    }

    var msg = base
      ? I18N.t('@cot.wa', {
          items: parts.join(' + '),
          total: money(total),
          monthly: monthly ? I18N.t('@cot.wa.mensual') : ''
        })
      : I18N.t('@cot.wa.simple');
    elSend.href = WA + '?text=' + encodeURIComponent(msg);

    if (elBarTotal) {
      elBarTotal.textContent = money(total);
      elBarSend.href = elSend.href;
    }
    hasBase = !!base;
    syncBar();
  }

  if (elCard && elBar && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      cardOut = !entries[0].isIntersecting;
      syncBar();
    }, { threshold: 0.25 }).observe(elCard);
  }

  /* El flotante se aparta donde ya hay un botón de contacto a la vista:
     dentro del cotizador y en el cierre. Un solo llamado a la acción por
     pantalla, sin tapar contenido. */
  var quietZones = ['#cotizador', '#contacto'].map(function (s) { return $(s); }).filter(Boolean);
  if (fab && quietZones.length && 'IntersectionObserver' in window) {
    var quiet = {};
    var quietIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { quiet[e.target.id] = e.isIntersecting; });
      var anyQuiet = Object.keys(quiet).some(function (k) { return quiet[k]; });
      fab.classList.toggle('is-quiet', anyQuiet);
    }, { threshold: 0.12 });
    quietZones.forEach(function (z) { quietIO.observe(z); });
  }

  /* =========================================================
     8. Scroll suave para anclas internas
     ========================================================= */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var dest = document.querySelector(id);
      if (!dest) return;
      e.preventDefault();
      dest.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', location.search + id);
    });
  });

  /* =========================================================
     9. Arranque y cambio de idioma
     ========================================================= */
  collectPrices();
  buildQuote();
  renderPrices();
  fetchRate();


  /* =========================================================
     10. CONTROL DE PRECIOS
     Los precios de los planes están escritos en el HTML de /precios/
     (para Google y para quien navegue sin JavaScript) y también en
     assets/catalogo.js (para el cotizador). Si dejan de coincidir,
     este control lo canta en la consola mientras trabajás en local.
     En el sitio publicado no dice nada.
     ========================================================= */
  (function () {
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) ||
                location.protocol === 'file:';
    if (!local || !window.CATALOGO) return;

    var enHtml = $$('.plan[data-plan]');
    if (!enHtml.length) return;

    var errores = [];
    enHtml.forEach(function (art) {
      var id = art.getAttribute('data-plan');
      var dato = (window.CATALOGO.bases || []).filter(function (b) { return b.id === id; })[0];
      if (!dato) { errores.push('El plan "' + id + '" está en el HTML pero no en catalogo.js'); return; }
      var enPantalla = toNumber($('.plan-p .num', art).textContent);
      if (enPantalla !== dato.precio) {
        errores.push('El plan "' + id + '" dice ' + enPantalla +
                     ' en el HTML y ' + dato.precio + ' en catalogo.js');
      }
    });
    (window.CATALOGO.bases || []).forEach(function (b) {
      if (!$('.plan[data-plan="' + b.id + '"]')) {
        errores.push('El plan "' + b.id + '" está en catalogo.js pero no en el HTML');
      }
    });

    if (errores.length) {
      console.warn('%c PRECIOS DESINCRONIZADOS ', 'background:#3E63DD;color:#fff;font-weight:600');
      errores.forEach(function (e) { console.warn('  · ' + e); });
    }
  })();

  I18N.on(function () {
    // el texto ya lo cambió el bloque de i18n; acá va lo que arma el JS
    renderPrices();
    buildQuote();
    // los titulares perdieron el troceado por líneas al cambiar de texto:
    // se dejan visibles en vez de volver a animarlos
    $$('[data-reveal], [data-stagger]').forEach(function (el) {
      el._plain = null;
      el.classList.add('on');
    });
  });
})();
