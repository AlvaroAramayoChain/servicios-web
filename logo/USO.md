# Cardón — archivos de marca

## Qué usar en cada caso

| Situación | Archivo |
|---|---|
| Logo principal del sitio (header, hero) | `cardon-isotipo.svg` |
| Header con nombre al lado, fondo oscuro | `cardon-lockup-oscuro.svg` |
| Header con nombre al lado, fondo claro | `cardon-lockup-claro.svg` |
| Un solo color (sellos, bordados, fax de la vida) | `cardon-isotipo-plano.svg` / `cardon-isotipo-negro.svg` |
| Pestaña del navegador | `favicon.ico`, `cardon-favicon.svg`, `favicon-32.png`, `favicon-16.png` |
| Icono en iOS / Android al agregar a inicio | `apple-touch-icon-180.png`, `favicon-512.png` |
| Redes sociales, PNG suelto | `cardon-isotipo-1024.png` (fondo transparente) |

Los `.svg` son los originales: escalan sin perder nitidez y pesan poco.
Usalos siempre que puedas y dejá los PNG para donde el formato no acepte vectores.

## Favicon: qué pegar en el `<head>`

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/cardon-favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
```

## Paleta

| Nombre | Hex | Uso |
|---|---|---|
| Luz | `#FFF3A8` | brillo alto del gradiente, hovers |
| Cardón | `#FFC42B` | color de marca, acentos, botones |
| Ámbar | `#E08C04` | sombra del gradiente, estados activos |
| Carbón | `#0C0D0B` | fondo oscuro |
| Arena | `#F7F4EC` | fondo claro |

Contraste: amarillo Cardón sobre Carbón pasa AA holgado.
Al revés (texto amarillo sobre blanco) **no** pasa: en fondo claro, el texto va en
Carbón y el amarillo queda solo para el logo y detalles gráficos.

## Tipografías

- **Space Grotesk 700** — nombre de marca y títulos.
- **JetBrains Mono 500** — descriptor, etiquetas, código.

Ambas gratuitas y en Google Fonts.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Reglas mínimas

- **Aire alrededor:** dejá libre, como mínimo, el ancho del tronco del cactus.
- **Tamaño mínimo:** el isotipo completo, a partir de 48 px de alto. Por debajo usá
  `cardon-favicon.svg`, y a 16 px `favicon-16.png`.
- **No** rotar, inclinar, agregarle sombras ni cambiar el gradiente por otro color.
  Si el fondo no permite el amarillo, va la versión plana en un solo color.
- Sobre fotos, poné el logo en un rectángulo oscuro sólido, no directo sobre la imagen.
