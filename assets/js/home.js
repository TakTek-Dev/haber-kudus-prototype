/* Haber Kudüs — homepage: sections menu, the moving mahya, the lamp chart, search, newsletter. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const E = window.EDITION || {};

  /* ---------- sections menu on narrow screens ---------- */
  const nav = $('#bolumler'), menuBtn = $('.menu-dugme');
  if (nav && menuBtn) {
    const close = () => { nav.classList.remove('is-acik'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Bölümleri aç'); };
    menuBtn.addEventListener('click', () => {
      const open = !nav.classList.contains('is-acik');
      nav.classList.toggle('is-acik', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Bölümleri kapat' : 'Bölümleri aç');
      if (open) $('a', nav).focus();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-acik')) { close(); menuBtn.focus(); } });
    $$('#bolum-listesi a').forEach((a) => a.addEventListener('click', close));
  }

  /* ---------- son dakika: one line at a time, lit lamp by lamp ---------- */
  const sd = $('.sondakika');
  const items = E.sonDakika || [];
  if (sd && items.length > 1) {
    const link = $('.sondakika__satir a', sd), time = $('time', sd), sira = $('.sira', sd), pause = $('[data-sd="dur"]', sd);
    let k = 0, timer = null, paused = reduce, hovering = false;
    const show = (n) => {
      k = (n + items.length) % items.length;
      const it = items[k];
      link.textContent = it.baslik;
      link.href = it.href || '#';
      time.textContent = it.saat;
      time.setAttribute('datetime', `2026-10-14T${it.saat.replace('.', ':')}+03:00`);
      sira.textContent = `${k + 1} / ${items.length}`;
      if (!reduce) { link.classList.remove('is-yaniyor'); void link.offsetWidth; link.classList.add('is-yaniyor'); }
    };
    const tick = () => { clearTimeout(timer); if (!paused && !hovering) timer = setTimeout(() => { show(k + 1); tick(); }, 6000); };
    const setPaused = (p) => {
      paused = p;
      pause.setAttribute('aria-pressed', String(p));
      pause.setAttribute('aria-label', p ? 'Son dakika akışını sürdür' : 'Son dakika akışını durdur');
      pause.innerHTML = (p
        ? '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>');
      tick();
    };
    $('[data-sd="geri"]', sd).addEventListener('click', () => { show(k - 1); tick(); });
    $('[data-sd="ileri"]', sd).addEventListener('click', () => { show(k + 1); tick(); });
    pause.addEventListener('click', () => setPaused(!paused));
    sd.addEventListener('mouseenter', () => { hovering = true; clearTimeout(timer); });
    sd.addEventListener('mouseleave', () => { hovering = false; tick(); });
    sd.addEventListener('focusin', () => { hovering = true; clearTimeout(timer); });
    sd.addEventListener('focusout', () => { hovering = false; tick(); });
    setPaused(paused);
  }

  /* ---------- lamp chart: one lamp per 500 people, built from the figure itself ---------- */
  const chart = $('.kandil-grafik');
  const fmt = (n) => n.toLocaleString('tr-TR');
  $$('.sutun[data-n]').forEach((col) => {
    const n = +col.dataset.n, full = Math.floor(n / 500), half = n % 500 >= 250;
    let html = '';
    for (let k = 0; k < full; k++) html += `<i style="--k:${k}"></i>`;
    if (half) html += `<i class="yarim" style="--k:${full}"></i>`;
    col.innerHTML = html + `<b>${fmt(n)}</b>`;
    col.querySelector('b').style.bottom = `${(full + (half ? 1 : 0)) * 16 + 18}px`;
  });
  if (chart) {
    if (reduce || !('IntersectionObserver' in window)) chart.classList.add('is-yandi');
    else {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { chart.classList.add('is-yandi'); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(chart);
    }
  }

  /* ---------- today's thread: yesterday's rest ---------- */
  const daha = $('[data-daha-ac]');
  if (daha) daha.addEventListener('click', () => {
    const open = daha.getAttribute('aria-expanded') !== 'true';
    $$('[data-daha]').forEach((li) => { li.hidden = !open; });
    daha.setAttribute('aria-expanded', String(open));
    daha.textContent = open ? 'Daha az göster' : 'Dünden 3 haber daha göster';
  });

  /* ---------- search the edition on this page ---------- */
  const panel = $('#ara'), araAc = $('[data-ara-ac]');
  if (panel && araAc) {
    const toggle = (open) => {
      panel.classList.toggle('is-acik', open);
      araAc.setAttribute('aria-expanded', String(open));
      if (open) $('input', panel).focus();
    };
    araAc.addEventListener('click', (e) => { e.preventDefault(); toggle(!panel.classList.contains('is-acik')); });
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { toggle(false); araAc.focus(); } });
  }
  if (panel) {
    const q = $('input', panel), list = $('.ara__sonuc', panel), say = $('.ara__durum', panel);
    const index = $$('main h2 a, main h3 a, .ip-akis h3').map((el) => ({ text: el.textContent.trim(), el }));
    const norm = (s) => s.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
    q.addEventListener('input', () => {
      const v = norm(q.value.trim());
      list.innerHTML = '';
      if (v.length < 2) { say.textContent = 'En az iki harf yazın.'; return; }
      const hits = index.filter((x) => norm(x.text).includes(v)).slice(0, 8);
      say.textContent = hits.length ? `Bugünkü sayıda ${hits.length} sonuç bulundu.` : `«${q.value.trim()}» bugünkü sayıda geçmiyor.`;
      hits.forEach((h) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#'; a.textContent = h.text;
        a.addEventListener('click', (e) => { e.preventDefault(); h.el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); h.el.closest('article, li')?.classList.add('is-bulundu'); });
        li.appendChild(a); list.appendChild(li);
      });
    });
  }

  /* ---------- newsletter: honest about being a prototype ---------- */
  const bf = $('#bulten-form');
  if (bf) {
    const input = $('input', bf), msg = $('.durum', bf);
    bf.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = input.value.trim();
      msg.classList.remove('hata', 'tamam');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        msg.textContent = 'E-posta adresi eksik ya da hatalı görünüyor. Örnek: ad@ornek.com';
        msg.classList.add('hata');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      msg.textContent = 'Bu bir tasarım örneği; adresiniz kaydedilmedi. Site yayına geçtiğinde bülten her sabah 07.00\'de gönderilecek.';
      msg.classList.add('tamam');
    });
  }
})();
