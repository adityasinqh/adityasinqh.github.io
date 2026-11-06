// Builds the single-file site: reads src/index.src.html, inlines every linked assets/ stylesheet,
// script and icon, and writes ../index.html (the page GitHub Pages serves). It then applies
// src/i18n/fr.json to the same source and writes ../fr/index.html, the French page.
// Run from the repo root:  node src/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(here, p), 'utf8');
const source = read('index.src.html');

const stripCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n+/g, '\n');
function inline(html) {
  html = html.replace(/<link rel="stylesheet" href="(assets\/[^"]+\.css)">/g, (_, p) =>
    '<style>\n' + stripCss(read(p)).trim() + '\n</style>');
  html = html.replace(/<script type="module" src="(assets\/[^"]+\.js)"><\/script>/g, (_, p) =>
    '<script type="module">\n' + read(p).replace(/<\/script/gi, '<\\/script') + '\n</script>');
  html = html.replace(/src="(assets\/icons\/[^"]+\.svg)"/g, (_, p) =>
    'src="data:image/svg+xml;base64,' + fs.readFileSync(path.join(here, p)).toString('base64') + '"');
  return html;
}
function write(rel, html) {
  const out = path.join(here, '..', rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log('wrote', rel, (html.length / 1024).toFixed(1) + ' KB');
}

write('index.html', inline(source));

// French: every English string must still be found in the source, so a copy edit that is not
// carried into fr.json fails the build instead of leaving English on the French page.
const fr = JSON.parse(read('i18n/fr.json'));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let html = source;
const missing = [];
for (const [en, tr] of fr.text) {
  let n = 0;
  html = html.replace(new RegExp('(>\\s*)' + esc(en) + '(\\s*<)', 'g'), (_, a, b) => (n++, a + tr + b));
  html = html.replace(new RegExp('(=")' + esc(en) + '(")', 'g'), (_, a, b) => (n++, a + tr + b));
  if (!n) missing.push(en);
}
for (const [en, tr] of fr.raw) {
  if (!html.includes(en)) missing.push(en);
  html = html.split(en).join(tr);
}
if (missing.length) {
  console.error('fr.json: not found in the source (update the translation):\n  ' + missing.join('\n  '));
  process.exit(1);
}
write('fr/index.html', inline(html));
