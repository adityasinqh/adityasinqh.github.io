// Builds the single-file site: reads src/index.src.html, inlines every linked assets/ stylesheet,
// script and icon, and writes ../index.html (the page GitHub Pages serves).
// Run from the repo root:  node src/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(here, p), 'utf8');
let html = read('index.src.html');

const stripCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n+/g, '\n');
html = html.replace(/<link rel="stylesheet" href="(assets\/[^"]+\.css)">/g, (_, p) =>
  '<style>\n' + stripCss(read(p)).trim() + '\n</style>');
html = html.replace(/<script type="module" src="(assets\/[^"]+\.js)"><\/script>/g, (_, p) =>
  '<script type="module">\n' + read(p).replace(/<\/script/gi, '<\\/script') + '\n</script>');
html = html.replace(/src="(assets\/icons\/[^"]+\.svg)"/g, (_, p) =>
  'src="data:image/svg+xml;base64,' + fs.readFileSync(path.join(here, p)).toString('base64') + '"');

const out = path.join(here, '..', 'index.html');
fs.writeFileSync(out, html);
console.log('wrote index.html', (html.length / 1024).toFixed(1) + ' KB');
