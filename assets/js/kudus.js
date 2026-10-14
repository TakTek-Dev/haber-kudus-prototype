/* Haber Kudüs — shared behaviour: the opening, the lights switch, lamps lighting as they come into view. */
(function () {
  'use strict';
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  /* ---------- lights switch: day page or night page ---------- */
  const switches = document.querySelectorAll('[data-isik]');
  function setTheme(dark, animate, from) {
    doc.dataset.theme = dark ? 'dark' : 'light';
    store.set('hk-tema', dark ? 'dark' : 'light');
    switches.forEach((b) => {
      b.setAttribute('aria-pressed', String(dark));
      const label = b.querySelector('[data-isik-etiket]');
      // the visible words are the accessible name; aria-pressed carries the state
      if (label) label.textContent = dark ? 'Işıkları söndür' : 'Işıkları yak';
    });
    if (animate && dark && !reduce) {
      // the day's unlit lamps (ink numerals) come on, nearest the switch first
      doc.classList.add('is-yakiliyor');
      const o = from ? from.getBoundingClientRect() : { left: innerWidth, top: 0, width: 0, height: 0 };
      const ox = o.left + o.width / 2, oy = o.top + o.height / 2;
      const seen = [...document.querySelectorAll('.mahya--mono')].map((m) => {
        const r = m.getBoundingClientRect();
        return { m, d: Math.hypot(r.left + r.width / 2 - ox, r.top + r.height / 2 - oy), vis: r.bottom > 0 && r.top < innerHeight };
      }).filter((x) => x.vis).sort((a, b) => a.d - b.d);
      seen.forEach((x, k) => setTimeout(() => window.Mahya && Mahya.light(x.m, { duration: 520 }), 120 + k * 110));
      setTimeout(() => doc.classList.remove('is-yakiliyor'), 1600);
    }
  }
  switches.forEach((b) => b.addEventListener('click', () => setTheme(doc.dataset.theme !== 'dark', true, b)));
  setTheme(doc.dataset.theme === 'dark', false);

  /* ---------- lamps light the first time they are seen ---------- */
  const lit = new WeakSet();
  function lightUp(m) {
    if (lit.has(m) || !window.Mahya) return;
    lit.add(m);
    Mahya.light(m, { duration: +m.dataset.sure || 900 }).then(() => Mahya.flicker(m, 0.05));
  }
  const watch = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { lightUp(e.target); watch.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  document.querySelectorAll('.mahya--night[data-yak]').forEach((m) => {
    if (reduce || !watch) return;
    m.classList.add('is-armed');
    watch.observe(m);
  });

  /* ---------- the long rope: from minaret to minaret, at the mahya's own rope height ---------- */
  function alignRopes() {
    document.querySelectorAll('[data-ip]').forEach((line) => {
      const svg = line.parentElement.querySelector('svg.mahya');
      const host = line.offsetParent;
      if (!svg || !host || !window.Mahya) return;
      const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), p = host.getBoundingClientRect();
      if (!r.height) return;
      line.style.top = (r.top - p.top + (Mahya.ROPE - vb.y) / vb.height * r.height).toFixed(1) + 'px';
      line.classList.add('is-hizali');
    });
  }
  alignRopes();
  if ('ResizeObserver' in window) new ResizeObserver(alignRopes).observe(document.body);
  if (document.fonts) document.fonts.ready.then(alignRopes);

  /* ---------- photos fade in once decoded ---------- */
  document.querySelectorAll('.foto img').forEach((img) => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done); img.addEventListener('error', done); }
  });

  /* ---------- the opening: the mahyacı lights the sky, then the sky lifts ---------- */
  const acilis = document.getElementById('acilis');
  if (acilis) {
    const end = () => {
      acilis.classList.add('is-kalkiyor');
      store.sset('hk-acilis', '1');
      setTimeout(() => { acilis.remove(); doc.classList.remove('has-acilis'); }, 640);
    };
    if (reduce || store.sget('hk-acilis') || !window.Mahya) { acilis.remove(); doc.classList.remove('has-acilis'); }
    else {
      const m = acilis.querySelector('.mahya');
      const fail = setTimeout(end, 2600);
      requestAnimationFrame(() => Mahya.light(m, { duration: 820 }).then(() => {
        acilis.classList.add('is-yandi');
        setTimeout(() => { clearTimeout(fail); end(); }, 380);
      }));
      acilis.addEventListener('click', () => { clearTimeout(fail); end(); }, { once: true });
    }
  }

  window.HK = { setTheme, lightUp, alignRopes, store, reduce };
})();
