/* ===========================================================
   CATÁLOGO — datos del cotizador
   Lo carga /cotizador/ para armar las opciones.

   Los precios de los planes también están escritos en el HTML de
   /precios/, que es lo que ve Google y lo que se lee sin JavaScript.
   Son dos lugares: si no coinciden, al abrir el sitio en local la
   consola te lo avisa con un mensaje claro. En producción no dice nada.

   "incluye" = módulos que la base ya trae y no se cobran dos veces.
   "reemplaza" = módulos que este deja sin efecto.
   =========================================================== */
window.CATALOGO = {
  bases: [
    { id:'landing', nombre:'Landing',                precio:200000,  sub:'1 página',          incluye:['wa'] },
    { id:'inst',    nombre:'Institucional',          precio:450000,  sub:'3 a 5 páginas',     incluye:['wa'] },
    { id:'prem',    nombre:'Institucional Premium',  precio:800000,  sub:'6 páginas o más',   incluye:['wa'] },
    { id:'app',     nombre:'App Web Básica',         precio:650000,  sub:'Panel con login',   incluye:['wa'] },
    { id:'appt',    nombre:'App Web + Tickets',      precio:1000000, sub:'Con soporte',
      incluye:['wa','tk','tka'] },
    { id:'appf',    nombre:'App Web Full',           precio:1350000, sub:'Tickets y bot',
      incluye:['wa','tk','tka','tg','tga'] }
  ],
  modulos: [
    { id:'tk',  nombre:'Sistema de tickets',       precio:280000, sub:'Crear, ver y cerrar' },
    { id:'tka', nombre:'Tickets avanzado',         precio:480000, sub:'Roles, notificaciones, historial', reemplaza:['tk'] },
    { id:'wa',  nombre:'Botón de WhatsApp',        precio:35000,  sub:'Chat flotante en el sitio' },
    { id:'tg',  nombre:'Bot de Telegram',          precio:220000, sub:'Avisos automáticos' },
    { id:'tga', nombre:'Bot de Telegram avanzado', precio:350000, sub:'Conectado a los tickets', reemplaza:['tg'] }
  ],
  extras: [
    { id:'prod', nombre:'Puesta en producción',    precio:50000, sub:'Publicación en hosting, a tu nombre', activo:true },
    { id:'host', nombre:'Hosting y mantenimiento', precio:30000, sub:'Desde $30.000 por mes', mensual:true }
  ]
};
