# Cover page maker

Open `index.html` in a browser. No build step, no server, no dependencies.

    index.html        page structure
    css/style.css     styling
    js/logo.js        default college logo (base64)
    js/palettes.js    colour helpers and the 24 palettes
    js/helpers.js     text, shape and image drawing helpers
    js/layouts.js     the six page layouts
    js/app.js         form, preview, uploads, download

## Adding a design

1. Add a palette to `PALETTE_DATA` in `js/palettes.js`.
2. Or write a new `drawSomething(ctx, data, pal, height)` in `js/layouts.js`
   and add it to `LAYOUTS`. Each layout gets four palettes, in order.
