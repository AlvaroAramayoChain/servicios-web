/* Meta Pixel — Desarrollo Cardón
 * Carga el pixel y registra los eventos que importan del sitio.
 * Se incluye desde el <head> de cada página con:
 *   <script defer src="assets/metapixel.js"></script>
 */
(function () {
  'use strict';

  var PIXEL_ID = '915156607845494';

  /* --- Código base de Meta (no tocar) ------------------------------------ */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  /* --- Eventos propios --------------------------------------------------- */
  var path = location.pathname;

  if (path.indexOf('/cotizador') === 0) {
    fbq('track', 'ViewContent', { content_name: 'Cotizador', content_category: 'cotizador' });
  } else if (path.indexOf('/precios') === 0) {
    fbq('track', 'ViewContent', { content_name: 'Precios', content_category: 'precios' });
  }

  /* Lee el total que muestra el cotizador y lo pasa a número. */
  function totalARS() {
    var el = document.getElementById('qTotal') || document.getElementById('qBarTotal');
    if (!el) return 0;
    var n = parseInt((el.textContent || '').replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }

  /* Empezó a usar el cotizador: se dispara una sola vez por visita.
     Es la señal intermedia con volumen suficiente para optimizar. */
  var usado = false;
  document.addEventListener('change', function (ev) {
    if (usado) return;
    var n = ev.target && ev.target.name;
    if (n === 'qbase' || n === 'qmod' || n === 'qextra') {
      usado = true;
      fbq('trackCustom', 'CotizadorUsado', { content_name: 'Cotizador' });
    }
  }, true);

  /* Un solo listener delegado: sobrevive a cualquier botón que agregues después. */
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('a, button') : null;
    if (!el) return;

    var href = (el.getAttribute('href') || '').toLowerCase();
    var id   = el.id || '';

    /* Conversión principal: manda el presupuesto armado por WhatsApp. */
    if (id === 'qSend' || id === 'qBarSend') {
      fbq('track', 'Lead', {
        content_name: 'Presupuesto por WhatsApp',
        value: totalARS(),
        currency: 'ARS'
      });
      return;
    }

    /* Cualquier otro WhatsApp: flotante, header, footer. */
    if (id === 'waFab' || href.indexOf('wa.me') > -1 || href.indexOf('whatsapp.com') > -1) {
      fbq('track', 'Contact', { content_name: 'WhatsApp', method: 'whatsapp' });
      return;
    }

    if (href.indexOf('mailto:') === 0) {
      fbq('track', 'Contact', { content_name: 'Email', method: 'email' });
      return;
    }

    if (href.indexOf('.pdf') > -1) {
      fbq('trackCustom', 'DescargaPDF', { file: href.split('/').pop() });
    }
  }, true);
})();
