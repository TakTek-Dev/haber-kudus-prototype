/* Haber Kudüs — inner pages: the reading rope and copy-link buttons. */
(function () {
  'use strict';

  /* one lamp travels the reading rope as the story is read */
  const ip = document.querySelector('.okuma-ipi');
  const article = document.querySelector('article .metin');
  if (ip && article) {
    const lamp = ip.querySelector('i');
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = article.getBoundingClientRect();
      const span = r.height - innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (innerHeight * 0.4 - r.top) / (span > 0 ? span : 1)));
      lamp.style.setProperty('--ilerleme', (p * innerWidth).toFixed(1) + 'px');
      ip.style.opacity = r.top < innerHeight ? 1 : 0;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* the section's name lights when the page opens */
  const isim = document.querySelector('.bolum-gok .mahya--night');
  if (isim && window.HK && !HK.reduce) { isim.classList.add('is-armed'); requestAnimationFrame(() => HK.lightUp(isim)); }

  /* copy a link; the button says it worked, then goes back */
  document.querySelectorAll('[data-kopyala]').forEach((b) => {
    const label = b.querySelector('span');
    const original = label ? label.textContent : '';
    b.addEventListener('click', async () => {
      const url = b.dataset.kopyala.startsWith('#') ? location.href.split('#')[0] + b.dataset.kopyala : b.dataset.kopyala;
      let ok = false;
      try { await navigator.clipboard.writeText(url); ok = true; } catch (e) { ok = false; }
      if (label) label.textContent = ok ? 'Kopyalandı' : 'Kopyalanamadı';
      b.classList.toggle('kopyalandi', ok);
      setTimeout(() => { if (label) label.textContent = original; b.classList.remove('kopyalandi'); }, 1800);
    });
  });
})();
