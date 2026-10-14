// Builds the brand files and the inline mahya regions.
// node tools/build.mjs   (from the project root)
// Regions between <!--@mahya:NAME--> and <!--/@mahya--> are regenerated; never hand-edit them.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('..', import.meta.url);

// The article, section, live and about pages stay local until the client answers.
// Set to true to link them from the header, footer and manşet (and un-ignore them in .gitignore).
const YENI_SAYFALAR = false;
const sec = (t) => t.replace(/<!--\?yeni-->([\s\S]*?)<!--\?eski-->([\s\S]*?)<!--\/\?-->/g, (m, y, e) => (YENI_SAYFALAR ? y : e));
const P = (f) => new URL(f, root);
vm.runInThisContext(readFileSync(P('assets/js/mahya.js'), 'utf8'));
const M = globalThis.Mahya;

// ---------- minaret: an Ottoman pencil minaret, two şerefe, lead cone, alem ----------
function minaret({ id = 'minare', lamps = true } = {}) {
  const cx = 20;
  const body = [
    // alem: rod, ball, crescent
    `M${cx} 22V9`, `M${cx - 1.6} 15.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0`,
    `M${cx + 3.2} 5.2a4.2 4.2 0 1 1 -6.4 0a3.3 3.3 0 1 0 6.4 0`,
    // külah
    `M${cx} 22L${cx - 7.2} 98H${cx + 7.2}Z`,
    // petek and upper şerefe
    `M${cx - 6.2} 98V128`, `M${cx + 6.2} 98V128`,
    `M${cx - 10.5} 128H${cx + 10.5}V134H${cx - 10.5}Z`,
    `M${cx - 10.5} 134L${cx - 6.2} 146`, `M${cx + 10.5} 134L${cx + 6.2} 146`,
    `M${cx - 8.4} 134L${cx - 6.6} 140`, `M${cx + 8.4} 134L${cx + 6.6} 140`,
    // gövde
    `M${cx - 6.2} 146V262`, `M${cx + 6.2} 146V262`,
    `M${cx - 6.2} 190H${cx + 6.2}`,
    // lower şerefe
    `M${cx - 11} 262H${cx + 11}V268H${cx - 11}Z`,
    `M${cx - 11} 268L${cx - 6.6} 281`, `M${cx + 11} 268L${cx + 6.6} 281`,
    `M${cx - 8.8} 268L${cx - 7} 275`, `M${cx + 8.8} 268L${cx + 7} 275`,
    `M${cx - 6.6} 281V420`, `M${cx + 6.6} 281V420`,
    `M${cx - 6.6} 330H${cx + 6.6}`
  ].join('');
  const shade = `M${cx} 22L${cx - 7.2} 98H${cx + 7.2}Z M${cx - 6.2} 98H${cx + 6.2}V128H${cx - 6.2}Z M${cx - 6.2} 146H${cx + 6.2}V262H${cx - 6.2}Z M${cx - 6.6} 281H${cx + 6.6}V420H${cx - 6.6}Z`;
  const ring = (y, half) => [-1, -0.5, 0, 0.5, 1].map((k) => [cx + k * half, y]);
  const pts = lamps ? ring(126.4, 8.6).concat(ring(260.4, 9)) : [];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 420" class="minare" aria-hidden="true" focusable="false"${id ? ` data-minare="${id}"` : ''}>` +
    `<path class="minare__shade" d="${shade}"/><path class="minare__body" d="${body}"/>` +
    pts.map(([x, y]) => `<circle class="minare__glow" cx="${x}" cy="${y}" r="2.6"/><circle class="minare__lamp" cx="${x}" cy="${y}" r=".95"/>`).join('') +
    `</svg>`;
}

// ---------- marks ----------
const NAME = 'Haber Kudüs';
const logoNight = (o = {}) => M.svg(NAME, { mode: 'night', id: o.id || 'lg', label: 'Haber Kudüs', ...o });
const logoDay = (o = {}) => M.svg(NAME, { mode: 'day', id: o.id || 'ld', label: 'Haber Kudüs', r: 0.62, ...o });

// the Ü alone: the mark for avatars and the favicon
function markU({ mode = 'night', size = 512, bg = true, id = 'mu', small = false, inline = false } = {}) {
  // small sizes take fewer, fatter lamps so the Ü survives at 16px
  const inner = M.svg('Ü', small
    ? { mode, id, rope: false, pad: 0, pitch: 3.1, r: 1.12, halo: 3.2 }
    : { mode, id, rope: mode === 'day', pad: 0, r: mode === 'night' ? 0.78 : 0.7, halo: 3 });
  const vb = inner.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const content = inner.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  // centre the glyph in a square with the rope across the top third
  const glyphW = vb[2], glyphH = vb[3];
  const S = 30, scale = (small ? 0.8 : 0.62) * S / Math.max(glyphW, glyphH);
  const tx = (S - glyphW * scale) / 2 - vb[0] * scale, ty = (S - glyphH * scale) / 2 - vb[1] * scale + 0.6;
  const fill = mode === 'night' ? '#0f1838' : '#f4f6fa';
  const ink = mode === 'night' ? '#7d8fca' : '#0f1838';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${size}" height="${size}" role="img" aria-label="Haber Kudüs">` +
    (bg ? `<rect width="${S}" height="${S}" fill="${fill}"/>` : '') +
    `<g transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(4)})" color="${ink}" class="mahya mahya--${mode}">` +
    // a <style> inside inline SVG leaks to the whole page, so only standalone files carry one
    (inline ? '' : `<style>.mahya__rope{stroke:currentColor;stroke-width:.13;opacity:.42}.mahya__threads{stroke:currentColor;stroke-width:.05;opacity:.28}.mahya--day .mahya__lamps circle{fill:${ink}}</style>`) +
    content + `</g></svg>`;
}

function fileSvg(markup, { bg, color, pad = 0 } = {}) {
  // standalone files carry their own rope colours (no page CSS)
  const vb = markup.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const style = `<style>.mahya__rope{stroke:${color};stroke-width:.13;opacity:.42}.mahya__threads{stroke:${color};stroke-width:.05;opacity:.24}.mahya--day .mahya__lamps circle,.mahya--mono .mahya__lamps circle{fill:${color}}.mahya--mono .mahya__rig{display:none}</style>`;
  const rect = bg ? `<rect x="${vb[0] - pad}" y="${vb[1] - pad}" width="${vb[2] + pad * 2}" height="${vb[3] + pad * 2}" fill="${bg}"/>` : '';
  return markup
    .replace(/viewBox="[^"]+"/, `viewBox="${vb[0] - pad} ${vb[1] - pad} ${vb[2] + pad * 2} ${vb[3] + pad * 2}"`)
    .replace(/(<svg[^>]*>)/, `$1${style}${rect}`);
}

mkdirSync(P('assets/brand/'), { recursive: true });
const files = {
  'assets/brand/logo-gece.svg': fileSvg(logoNight({ id: 'fg' }), { bg: '#0f1838', color: '#7d8fca', pad: 6 }),
  'assets/brand/logo-gece-seffaf.svg': fileSvg(logoNight({ id: 'fs' }), { color: '#7d8fca' }),
  'assets/brand/logo-gunduz.svg': fileSvg(logoDay({ id: 'fd' }), { color: '#0f1838' }),
  'assets/brand/logo-mono-beyaz.svg': fileSvg(M.svg(NAME, { mode: 'mono', id: 'fw', r: 0.7 }), { color: '#ffffff' }),
  'assets/brand/logo-mono-murekkep.svg': fileSvg(M.svg(NAME, { mode: 'mono', id: 'fi', r: 0.7 }), { color: '#0f1838' }),
  'assets/brand/isaret-gece.svg': markU({ mode: 'night', id: 'ig' }),
  'assets/brand/isaret-gunduz.svg': markU({ mode: 'day', id: 'id' }),
  'assets/brand/favicon.svg': markU({ mode: 'night', size: 64, id: 'fv', small: true }),
  'assets/brand/minare.svg': minaret({ id: '' }).replace(/(<svg[^>]*>)/, '$1<style>.minare__body{fill:none;stroke:#7d8fca;stroke-width:1;opacity:.7}.minare__shade{fill:#7d8fca;opacity:.1}.minare__lamp{fill:#ffc15e}.minare__glow{fill:#ffc15e;opacity:.2}</style>')
};
for (const [f, s] of Object.entries(files)) writeFileSync(P(f), s);

// ---------- inline regions ----------
const regions = {
  masthead: () => logoNight({ id: 'mh', attrs: 'data-mahya="masthead"' }),
  'masthead-day': () => logoDay({ id: 'md', attrs: 'data-mahya="masthead-day"' }),
  loader: () => logoNight({ id: 'ac', attrs: 'data-mahya="loader"', halo: 3 }),
  'minare-sol': () => minaret({ id: 'sol' }),
  'minare-sag': () => minaret({ id: 'sag' }),
  'footer': () => M.svg("Kudüs'ten, saati saatine", { mode: 'night', id: 'ft', attrs: 'data-mahya="footer"' }),
  'mark-night': () => markU({ mode: 'night', size: 240, id: 'bk', inline: true }),
  'mark-day': () => markU({ mode: 'day', size: 240, id: 'bd', inline: true }),
  'son-dakika': () => M.svg('Son dakika', { mode: 'night', id: 'sd', rope: false, pad: 1.4, r: 0.78, halo: 2.4, attrs: 'data-mahya="son-dakika"' })
};
// shared chrome: <!--@parca:NAME|CURRENT--> pulls tools/parca/NAME.html and marks the current section
function parts(html) {
  return html.replace(/<!--@parca:([\w-]+)(?:\|([\w-]+))?-->[\s\S]*?<!--\/@parca-->/g, (m, name, cur) => {
    const body = sec(readFileSync(P(`tools/parca/${name}.html`), 'utf8'))
      .replace(/\{\{cur:([\w-]+)\}\}/g, (x, k) => (k === cur ? ' aria-current="page"' : ''))
      .trimEnd();
    return `<!--@parca:${name}${cur ? '|' + cur : ''}-->
${body}
<!--/@parca-->`;
  });
}

// extra named messages: <!--@mahya:say|ID|MODE|TEXT-->
for (const page of ['index.html', 'home.html', 'haber.html', 'aksa.html', 'canli.html', 'hakkimizda.html']) {
  let html;
  try { html = readFileSync(P(page), 'utf8'); } catch { continue; }
  html = parts(html);
  html = html.replace(/href="[^"]*"(\s+data-yeni="([^"]*)"\s+data-eski="([^"]*)")/g, (m, rest, y, e) => `href="${YENI_SAYFALAR ? y : e}"${rest}`);
  html = html.replace(/<!--@mahya:([^>]+?)-->[\s\S]*?<!--\/@mahya-->/g, (m, key) => {
    let out;
    if (key.startsWith('mark|')) {
      const [, id, mode, size] = key.split('|');
      out = markU({ mode, id, size: +size || 240, inline: true });
    } else if (key.startsWith('say|')) {
      const [, id, mode, text] = key.split('|');
      out = M.svg(text, { mode, id, attrs: `data-mahya="${id}"`, r: mode === 'day' ? 0.62 : mode === 'mono' ? 0.9 : undefined, rope: mode === 'mono' ? false : undefined, pad: mode === 'mono' ? 0.6 : undefined });
    } else if (regions[key]) out = regions[key]();
    else { console.warn('unknown region', key); return m; }
    return `<!--@mahya:${key}-->${out}<!--/@mahya-->`;
  });
  writeFileSync(P(page), html);
  console.log('built', page);
}
console.log('brand files:', Object.keys(files).length);
