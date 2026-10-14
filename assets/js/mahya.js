/* Haber Kudüs — mahya engine.
   A mahya is drawn on squared paper, hung from one carrier rope strung
   between two minarets; every lamp drops on its own thread. Glyphs here are
   monoline skeletons on a 12-unit cap height; lamps are sampled along each
   stroke at a fixed pitch, so curves stay smooth and every letter reads as
   lamps, not pixels. Runs in the browser and in Node (tools/build.mjs). */
(function (root) {
  'use strict';

  const CAP = 12;          // cap height in grid units
  const PITCH = 2;         // lamp spacing along a stroke
  const TRACK = 4.2;       // gap between glyph boxes
  const ROPE = -6.5;       // carrier rope height above the cap line

  // l: line x1 y1 x2 y2 · a: arc cx cy rx ry a0 a1 (deg, y down) · d: single lamp
  const G = {
    'A': [9, [['l', 0, 12, 4.5, 0], ['l', 4.5, 0, 9, 12], ['l', 1.9, 7.4, 7.1, 7.4]]],
    'B': [7.8, [['l', 0, 0, 0, 12], ['l', 0, 0, 4, 0], ['a', 4, 3, 3, 3, -90, 90], ['l', 4, 6, 0, 6], ['l', 4.4, 6, 0, 6], ['a', 4.4, 9, 3.4, 3, -90, 90], ['l', 4.4, 12, 0, 12]]],
    'C': [9.2, [['a', 5.6, 6, 5.6, 6, -42, -318]]],
    'D': [8.6, [['l', 0, 0, 0, 12], ['l', 0, 0, 2.8, 0], ['a', 2.8, 6, 5.8, 6, -90, 90], ['l', 2.8, 12, 0, 12]]],
    'E': [7, [['l', 0, 0, 0, 12], ['l', 0, 0, 7, 0], ['l', 0, 6, 6, 6], ['l', 0, 12, 7, 12]]],
    'F': [7, [['l', 0, 0, 0, 12], ['l', 0, 0, 7, 0], ['l', 0, 6, 6, 6]]],
    'G': [11.2, [['a', 5.6, 6, 5.6, 6, -42, -360], ['l', 11.2, 6, 6.6, 6]]],
    'H': [8.4, [['l', 0, 0, 0, 12], ['l', 8.4, 0, 8.4, 12], ['l', 0, 6, 8.4, 6]]],
    'I': [0, [['l', 0, 0, 0, 12]]],
    'J': [6.4, [['l', 6.4, 0, 6.4, 8.6], ['a', 3.2, 8.6, 3.2, 3.4, 0, 180]]],
    'K': [8, [['l', 0, 0, 0, 12], ['l', 7.6, 0, 0, 7.4], ['l', 2.9, 4.6, 8, 12]]],
    'L': [6.8, [['l', 0, 0, 0, 12], ['l', 0, 12, 6.8, 12]]],
    'M': [10.4, [['l', 0, 12, 0, 0], ['l', 0, 0, 5.2, 8.2], ['l', 5.2, 8.2, 10.4, 0], ['l', 10.4, 0, 10.4, 12]]],
    'N': [8.6, [['l', 0, 12, 0, 0], ['l', 0, 0, 8.6, 12], ['l', 8.6, 12, 8.6, 0]]],
    'O': [11.2, [['a', 5.6, 6, 5.6, 6, -90, 270]]],
    'P': [7.6, [['l', 0, 0, 0, 12], ['l', 0, 0, 4.2, 0], ['a', 4.2, 3.3, 3.4, 3.3, -90, 90], ['l', 4.2, 6.6, 0, 6.6]]],
    'Q': [11.2, [['a', 5.6, 6, 5.6, 6, -90, 270], ['l', 7.4, 9.2, 11, 12.8]]],
    'R': [8, [['l', 0, 0, 0, 12], ['l', 0, 0, 4.2, 0], ['a', 4.2, 3.3, 3.4, 3.3, -90, 90], ['l', 4.2, 6.6, 0, 6.6], ['l', 3.8, 6.6, 8, 12]]],
    'S': [8.2, [['a', 4.1, 3.1, 3.7, 3.1, -28, -270], ['a', 4.1, 9.05, 4.1, 2.95, -90, 152]]],
    'T': [8.4, [['l', 0, 0, 8.4, 0], ['l', 4.2, 0, 4.2, 12]]],
    'U': [8.4, [['l', 0, 0, 0, 7.8], ['a', 4.2, 7.8, 4.2, 4.2, 180, 0], ['l', 8.4, 7.8, 8.4, 0]]],
    'V': [9, [['l', 0, 0, 4.5, 12], ['l', 4.5, 12, 9, 0]]],
    'W': [12, [['l', 0, 0, 3, 12], ['l', 3, 12, 6, 3.4], ['l', 6, 3.4, 9, 12], ['l', 9, 12, 12, 0]]],
    'X': [8.6, [['l', 0, 0, 8.6, 12], ['l', 8.6, 0, 0, 12]]],
    'Y': [8.6, [['l', 0, 0, 4.3, 6.2], ['l', 8.6, 0, 4.3, 6.2], ['l', 4.3, 6.2, 4.3, 12]]],
    'Z': [8.2, [['l', 0, 0, 8.2, 0], ['l', 8.2, 0, 0, 12], ['l', 0, 12, 8.2, 12]]],
    '0': [8, [['a', 4, 6, 4, 6, -90, 270]]],
    '1': [4.4, [['l', 0.4, 2.6, 4.4, 0], ['l', 4.4, 0, 4.4, 12]]],
    '2': [8, [['a', 4, 4, 4, 4, -168, 28], ['l', 7.55, 5.9, 0, 12], ['l', 0, 12, 8, 12]]],
    '3': [8, [['a', 4, 3.1, 3.6, 3.1, -158, 90], ['a', 4, 9.05, 4, 2.95, -90, 158]]],
    '4': [8.6, [['l', 6.2, 12, 6.2, 0], ['l', 6.2, 0, 0, 8.4], ['l', 0, 8.4, 8.6, 8.4]]],
    '5': [8.2, [['l', 7.6, 0, 1, 0], ['l', 1, 0, 0.6, 5.4], ['a', 4.2, 8.15, 4, 3.85, -136, 148]]],
    '6': [8, [['a', 4, 8, 4, 4, -90, 270], ['a', 8.4, 8, 8.4, 8, 180, 246]]],
    '7': [8, [['l', 0, 0, 8, 0], ['l', 8, 0, 2.4, 12]]],
    '8': [8, [['a', 4, 3, 3.3, 3, -90, 270], ['a', 4, 9, 4, 3, -90, 270]]],
    '9': [8, [['a', 4, 4, 4, 4, -90, 270], ['a', -0.4, 4, 8.4, 8, 0, 66]]],
    '.': [0, [['d', 0, 12]]],
    ',': [0.6, [['d', 0.6, 12], ['d', -0.2, 13.9]]],
    ':': [0, [['d', 0, 4.4], ['d', 0, 12]]],
    ';': [0.6, [['d', 0.6, 4.4], ['d', 0.6, 12], ['d', -0.2, 13.9]]],
    "'": [0.4, [['d', 0.4, 0], ['d', 0, 2]]],
    '’': [0.4, [['d', 0.4, 0], ['d', 0, 2]]],
    '"': [3, [['d', 0.4, 0], ['d', 0, 2], ['d', 3.4, 0], ['d', 3, 2]]],
    '-': [4.4, [['l', 0, 6.4, 4.4, 6.4]]],
    '–': [6.4, [['l', 0, 6.4, 6.4, 6.4]]],
    '+': [6.4, [['l', 0, 6.4, 6.4, 6.4], ['l', 3.2, 3.2, 3.2, 9.6]]],
    '!': [0, [['l', 0, 0, 0, 8], ['d', 0, 12]]],
    '?': [7, [['a', 3.5, 3.5, 3.5, 3.5, -165, 64], ['l', 5.05, 6.65, 3.5, 8.4], ['d', 3.5, 12]]],
    '/': [6, [['l', 6, 0, 0, 12]]],
    '%': [9, [['l', 8.2, 0, 0.8, 12], ['a', 1.9, 2.3, 1.9, 2.3, -90, 270], ['a', 7.1, 9.7, 1.9, 2.3, -90, 270]]],
    '«': [6.4, [['l', 3, 3.4, 0, 6.4], ['l', 0, 6.4, 3, 9.4], ['l', 6.4, 3.4, 3.4, 6.4], ['l', 3.4, 6.4, 6.4, 9.4]]],
    '»': [6.4, [['l', 0, 3.4, 3, 6.4], ['l', 3, 6.4, 0, 9.4], ['l', 3.4, 3.4, 6.4, 6.4], ['l', 6.4, 6.4, 3.4, 9.4]]],
    '·': [0, [['d', 0, 6.4]]],
    '°': [3.2, [['a', 1.6, 1.6, 1.6, 1.6, -90, 270]]]
  };
  // Turkish letters: the base glyph plus its marks.
  const breve = (cx) => ['a', cx, -4.4, 2.4, 1.9, 12, 168];
  const cedilla = (cx) => [['d', cx, 14.2], ['d', cx - 1.3, 15.9]];
  const add = (base, extra) => [G[base][0], G[base][1].concat(extra)];
  G['Ç'] = add('C', cedilla(5.6));
  G['Ğ'] = add('G', [breve(5.6)]);
  G['İ'] = add('I', [['d', 0, -3.2]]);
  G['Ö'] = add('O', [['d', 3.7, -3.2], ['d', 7.5, -3.2]]);
  G['Ş'] = add('S', cedilla(4.1));
  // Seen from the Mount of Olives the lead dome of the Qibli mosque stands left,
  // the gold Dome of the Rock right: the Ü carries both.
  G['Ü'] = add('U', [['d', 2.3, -3.4, 'kurşun'], ['d', 6.1, -3.4, 'kubbe']]);
  G['Â'] = add('A', [['l', 2.6, -2.4, 4.5, -4.2], ['l', 4.5, -4.2, 6.4, -2.4]]);
  G['Î'] = [1.6, [['l', 0.8, 0, 0.8, 12], ['l', -0.6, -2.4, 0.8, -4], ['l', 0.8, -4, 2.2, -2.4]]];
  G['Û'] = add('U', [['l', 2.3, -2.4, 4.2, -4.2], ['l', 4.2, -4.2, 6.1, -2.4]]);

  function arcPoint(p, t) {
    const a = (p[5] + (p[6] - p[5]) * t) * Math.PI / 180;
    return [p[1] + p[3] * Math.cos(a), p[2] + p[4] * Math.sin(a)];
  }

  // Lamps at an even pitch along one stroke, both ends included.
  function sample(p, pitch) {
    if (p[0] === 'd') return [[p[1], p[2], p[3] || 'dot']];
    if (p[0] === 'l') {
      const len = Math.hypot(p[3] - p[1], p[4] - p[2]);
      const n = Math.max(1, Math.round(len / pitch));
      const out = [];
      for (let i = 0; i <= n; i++) out.push([p[1] + (p[3] - p[1]) * i / n, p[2] + (p[4] - p[2]) * i / n]);
      return out;
    }
    // ellipse arc: arc-length table, then even spacing
    const STEPS = 160, table = [0], pts = [arcPoint(p, 0)];
    for (let i = 1; i <= STEPS; i++) {
      const q = arcPoint(p, i / STEPS);
      table.push(table[i - 1] + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]));
      pts.push(q);
    }
    const total = table[STEPS];
    const closed = Math.abs(p[6] - p[5]) >= 359.9;
    const n = Math.max(1, Math.round(total / pitch));
    const out = [];
    for (let i = 0; i <= (closed ? n - 1 : n); i++) {
      const target = total * i / n;
      let j = 1;
      while (j < STEPS && table[j] < target) j++;
      const f = (target - table[j - 1]) / ((table[j] - table[j - 1]) || 1);
      out.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f]);
    }
    return out;
  }

  function glyphLamps(ch, pitch) {
    const g = G[ch];
    if (!g) return null;
    const lamps = [];
    for (const prim of g[1]) {
      for (const pt of sample(prim, pitch)) {
        if (lamps.some((q) => Math.hypot(q[0] - pt[0], q[1] - pt[1]) < pitch * 0.62)) continue;
        lamps.push(pt);
      }
    }
    return { w: g[0], lamps };
  }

  // Turkish-aware uppercase, then lay the message out on one line.
  function layout(text, o) {
    o = o || {};
    const pitch = o.pitch || PITCH, track = o.track == null ? TRACK : o.track;
    const space = o.space || 8;
    const chars = Array.from(String(text).toLocaleUpperCase('tr-TR'));
    const lamps = [];
    let x = 0, prevWasGlyph = false, minY = 0, maxY = CAP;
    chars.forEach((ch, ci) => {
      if (ch === ' ') { x += space; prevWasGlyph = false; return; }
      const g = glyphLamps(ch, pitch);
      if (!g) { x += space; prevWasGlyph = false; return; }
      if (prevWasGlyph) x += track;
      const narrow = /[.:;'’!·]/.test(ch);
      if (narrow && prevWasGlyph) x -= track * 0.45;
      for (const l of g.lamps) {
        lamps.push({ x: x + l[0], y: l[1], role: l[2] || 'lamp', ch: ci });
        minY = Math.min(minY, l[1]); maxY = Math.max(maxY, l[1]);
      }
      x += g.w;
      if (narrow) x += track * 0.2;
      prevWasGlyph = true;
    });
    return { lamps, width: x, top: Math.min(minY, ROPE), glyphTop: minY, bottom: maxY, rope: ROPE };
  }

  const fmt = (n) => +n.toFixed(2);

  /* SVG markup for a message.
     mode: 'night' lit lamps with halo · 'day' ink lamps with visible threads ·
           'mono' single colour, no halo. */
  function svg(text, o) {
    o = o || {};
    const L = layout(text, o);
    const mode = o.mode || 'night';
    const pad = o.pad == null ? 3 : o.pad;
    const r = o.r || 0.66, halo = o.halo || 2.6;
    const ropeExt = o.ropeExtend || 0;
    const x0 = -pad - ropeExt, w = L.width + (pad + ropeExt) * 2;
    const y0 = (o.rope === false ? Math.min(L.glyphTop, 0) : L.rope) - pad;
    const h = L.bottom - y0 + pad;
    const id = o.id || 'm' + Math.random().toString(36).slice(2, 7);
    const domes = o.domes !== false;
    const parts = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fmt(x0)} ${fmt(y0)} ${fmt(w)} ${fmt(h)}" class="mahya mahya--${mode}" role="img" aria-label="${(o.label || text).replace(/"/g, '&quot;')}"${o.attrs ? ' ' + o.attrs : ''}>`);
    if (mode === 'night') {
      parts.push(`<defs><radialGradient id="${id}h"><stop offset="0" stop-color="#ffb648" stop-opacity=".55"/><stop offset=".35" stop-color="#ff9f2e" stop-opacity=".18"/><stop offset="1" stop-color="#ff9f2e" stop-opacity="0"/></radialGradient><radialGradient id="${id}c" cx=".42" cy=".38"><stop offset="0" stop-color="#fffbe9"/><stop offset=".55" stop-color="#ffd27a"/><stop offset="1" stop-color="#f3a23a"/></radialGradient><radialGradient id="${id}k" cx=".42" cy=".38"><stop offset="0" stop-color="#fff6d1"/><stop offset=".45" stop-color="#ffcf4a"/><stop offset="1" stop-color="#e09a1c"/></radialGradient><radialGradient id="${id}s" cx=".42" cy=".38"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e4ebf7"/><stop offset="1" stop-color="#a9b6cc"/></radialGradient><radialGradient id="${id}kh"><stop offset="0" stop-color="#ffc83a" stop-opacity=".75"/><stop offset=".4" stop-color="#ffb21f" stop-opacity=".22"/><stop offset="1" stop-color="#ffb21f" stop-opacity="0"/></radialGradient><radialGradient id="${id}sh"><stop offset="0" stop-color="#dfe8ff" stop-opacity=".3"/><stop offset="1" stop-color="#dfe8ff" stop-opacity="0"/></radialGradient></defs>`);
    }
    if (o.rope !== false) {
      parts.push(`<g class="mahya__rig">`);
      parts.push(`<line class="mahya__rope" x1="${fmt(x0)}" y1="${L.rope}" x2="${fmt(x0 + w)}" y2="${L.rope}"/>`);
      if (o.threads !== false) {
        parts.push(`<path class="mahya__threads" d="${L.lamps.map((l) => `M${fmt(l.x)} ${L.rope}V${fmt(l.y)}`).join('')}"/>`);
      }
      parts.push(`</g>`);
    }
    // order of lighting: left to right with a little lift for each stroke
    const order = L.lamps.map((l, i) => [i, l.x + l.y * 0.18]).sort((a, b) => a[1] - b[1]);
    const rank = new Array(L.lamps.length);
    order.forEach((p, k) => { rank[p[0]] = k; });
    if (mode === 'night') {
      parts.push(`<g class="mahya__halos">`);
      L.lamps.forEach((l, i) => {
        const silver = domes && l.role === 'kurşun', gold = domes && l.role === 'kubbe';
        const dome = domes && (l.role === 'kubbe' || l.role === 'kurşun');
        parts.push(`<circle cx="${fmt(l.x)}" cy="${fmt(l.y)}" r="${fmt(gold ? halo * 1.6 : silver ? halo * 1.2 : halo)}" fill="url(#${id}${silver ? 'sh' : gold ? 'kh' : 'h'})" style="--i:${rank[i]}"/>`);
      });
      parts.push(`</g>`);
    }
    parts.push(`<g class="mahya__lamps">`);
    L.lamps.forEach((l, i) => {
      let fill = '';
      if (mode === 'night') fill = ` fill="url(#${id}${domes && l.role === 'kurşun' ? 's' : domes && l.role === 'kubbe' ? 'k' : 'c'})"`;
      const cls = domes && (l.role === 'kubbe' || l.role === 'kurşun') ? ` class="lamp--${l.role === 'kubbe' ? 'kubbe' : 'kursun'}"` : '';
      const big = domes && (l.role === 'kubbe' || l.role === 'kurşun') ? r * 1.32 : r;
      parts.push(`<circle cx="${fmt(l.x)}" cy="${fmt(l.y)}" r="${fmt(big)}"${fill}${cls} style="--i:${rank[i]}"/>`);
    });
    parts.push(`</g></svg>`);
    return parts.join('');
  }

  // Light a rendered mahya lamp by lamp. Returns a promise for the end.
  function light(el, o) {
    o = o || {};
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = el.querySelectorAll('.mahya__lamps circle').length || 1;
    const span = o.duration || 900;
    el.style.setProperty('--step', (reduce ? 0 : span / count) + 'ms');
    el.classList.remove('is-lit');
    el.classList.add('is-armed');
    void el.getBoundingClientRect();
    el.classList.add('is-lit');
    return new Promise((res) => setTimeout(res, reduce ? 0 : span + 260));
  }

  // A few lamps waver, the way oil flames and old filaments do.
  function flicker(el, share) {
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lamps = el.querySelectorAll('.mahya__lamps circle');
    const n = Math.max(1, Math.round(lamps.length * (share || 0.06)));
    for (let k = 0; k < n; k++) {
      const c = lamps[Math.floor(Math.random() * lamps.length)];
      c.classList.add('titrek');
      c.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
      c.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + 's';
    }
  }

  root.Mahya = { G, CAP, PITCH, TRACK, ROPE, layout, svg, light, flicker, glyphLamps };
})(typeof window !== 'undefined' ? window : globalThis);
