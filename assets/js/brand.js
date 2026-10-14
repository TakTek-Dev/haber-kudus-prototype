/* Haber Kudüs — identity book: alphabet, the typer, motion demos, and the formats filled with today's edition. */
(function () {
  'use strict';
  const E = window.EDITION || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- chapter bar: the open chapter's lamp is lit ---------- */
  const links = $$('.fihrist ol a');
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const a = byId.get(e.target.id);
        if (a) { a.setAttribute('aria-current', 'true'); a.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- cover and other inline mahyas light when seen ---------- */
  if (!reduce && 'IntersectionObserver' in window && window.HK) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { io.unobserve(e.target); HK.lightUp(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    $$('.kapak .mahya--night, .an .mahya--night, .kapanis .mahya--night, .u-buyuk .mahya--night').forEach((m) => { m.classList.add('is-armed'); io.observe(m); });
  }

  /* ---------- the alphabet ---------- */
  const harfler = $('#harfler');
  if (harfler && window.Mahya) {
    const tr = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
    const set = [...tr, ...'0123456789', ...".,:'-!?/«»+%", ...'QWX'];
    harfler.innerHTML = set.map((c, i) => `<div class="${'ÇĞİÖŞÜ'.includes(c) ? 'tr' : ''}">${Mahya.svg(c, { mode: 'night', rope: false, pad: 1.2, id: 'h' + i, label: c })}<span>${esc(c)}</span></div>`).join('');
    if (!reduce && 'IntersectionObserver' in window) {
      const cells = $$('svg', harfler);
      cells.forEach((s) => s.classList.add('is-armed'));
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        cells.forEach((s, k) => setTimeout(() => Mahya.light(s, { duration: 380 }), k * 32));
      }, { threshold: 0.2 });
      io.observe(harfler);
    }
  }

  /* ---------- hang your own mahya ---------- */
  const form = $('#asici-form'), input = $('#asici-girdi'), out = $('#asici-yazi'), sayac = $('#asici-sayac');
  function hang(animate) {
    const text = input.value.trim() || 'Haber Kudüs';
    out.innerHTML = Mahya.svg(text, { mode: 'night', id: 'ty' });
    sayac.textContent = `${input.value.length} / ${input.maxLength}`;
    if (window.HK) HK.alignRopes();
    if (animate) Mahya.light($('svg', out), { duration: 900 }).then(() => Mahya.flicker($('svg', out), 0.05));
  }
  if (form && window.Mahya) {
    hang(false);
    form.addEventListener('submit', (e) => { e.preventDefault(); hang(true); });
    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => hang(false), 120); });
    $$('[data-ornek]').forEach((b) => b.addEventListener('click', () => { input.value = b.dataset.ornek; hang(true); }));
    $('#asici-indir').addEventListener('click', () => exportPng(input.value.trim() || 'Haber Kudüs'));
  }

  // a 2400 × 1000 picture: night, rope, the message; ready for a post
  function exportPng(text) {
    const W = 2400, H = 1000;
    const svg = Mahya.svg(text, { mode: 'night', id: 'px' });
    const vb = svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
    const scale = Math.min((W * 0.8) / vb[2], (H * 0.42) / vb[3]);
    const w = vb[2] * scale, h = vb[3] * scale;
    const x = (W - w) / 2, y = (H - h) / 2 - 20;
    const ropeY = y + (-6.5 - vb[1]) * scale;
    const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    const full = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset=".6" stop-color="#0f1838"/><stop offset="1" stop-color="#16234f"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<line x1="60" x2="${W - 60}" y1="${ropeY}" y2="${ropeY}" stroke="#7d8fca" stroke-opacity=".42" stroke-width="2"/>
<g transform="translate(${x} ${y}) scale(${scale}) translate(${-vb[0]} ${-vb[1]})" color="#7d8fca"><style>.mahya__rope{display:none}.mahya__threads{stroke:#7d8fca;stroke-width:.05;opacity:.22}</style>${inner}</g>
</svg>`;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      c.getContext('2d').drawImage(img, 0, 0);
      c.toBlob((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'mahya-' + text.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9çğıöşü]+/g, '-').replace(/^-|-$/g, '') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(full);
  }

  /* ---------- motion demos ---------- */
  const an3 = $('#an3');
  const an3Msgs = ['Son dakika', 'Aksa 13.12', "Silvan'da yıkım"];
  let an3Timer;
  function playAn3() {
    clearTimeout(an3Timer);
    let k = 0;
    const step = () => {
      an3.innerHTML = Mahya.svg(an3Msgs[k % an3Msgs.length], { mode: 'night', id: 'a3' + k, rope: false, pad: 1 });
      const s = $('svg', an3); s.style.width = '86%';
      Mahya.light(s, { duration: 600 });
      k++;
      if (k < an3Msgs.length * 2) an3Timer = setTimeout(step, 2400);
    };
    step();
  }
  if (an3 && window.Mahya) {
    an3.innerHTML = Mahya.svg(an3Msgs[0], { mode: 'night', id: 'a3s', rope: false, pad: 1 });
    $('svg', an3).style.width = '86%';
  }
  $$('[data-tekrar]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.tekrar;
    if (k === 'an1') Mahya.light($('[data-mahya="an1"]'), { duration: 1050 });
    if (k === 'mini') $('#mini-sayfa').classList.toggle('gece');
    if (k === 'an3') playAn3();
  }));

  /* ---------- the two domes, seen from the Mount of Olives ---------- */
  const kf = $('[data-foto="kubbeler"]');
  if (kf) {
    // markers sit inside the 16:10 crop of a 1600 × 1064 photo (object-fit: cover crops top and bottom)
    kf.innerHTML = `<div class="foto"><img src="assets/img/arsiv/kudus-gece-1.jpg?v=1" alt="Zeytin Dağı'ndan akşam Kudüs: solda Kıble Mescidi'nin kubbesi, sağda Kubbetü's-Sahra'nın altın kubbesi" width="1600" height="1064" loading="lazy" decoding="async">
      <span class="isaretci isaretci--kurşun" style="left:27.3%;top:44.6%" aria-hidden="true"></span>
      <span class="isaretci isaretci--kubbe" style="left:68.9%;top:39.6%" aria-hidden="true"></span></div>
      <figcaption><span class="arsiv">Arşiv</span><b>Zeytin Dağı'ndan akşam Kudüs.</b> Solda Kıble Mescidi, sağda Kubbetü's-Sahra: Ü'nün iki kandili. Fotoğraf: GameOfLight, 2014, CC BY-SA 3.0, Wikimedia Commons.</figcaption>`;
    const img = $('img', kf);
    const done = () => img.classList.add('is-loaded');
    if (img.complete) done(); else img.addEventListener('load', done);
  }

  /* ---------- filled from today's edition ---------- */
  const S = E.sosyal || {};
  const mini = (text, o) => Mahya.svg(text, Object.assign({ mode: 'night' }, o));

  // type scale with real headlines
  const ol = E.olcek || {};
  $$('[data-olcek]').forEach((el) => { const v = ol[el.dataset.olcek]; if (v) el.innerHTML = v; });

  // a small thread of today in the light chapter
  const ia = $('#isik-akis');
  if (ia && E.akis) {
    ia.innerHTML = `<h3 class="alt-bas">Bugün, 14 Ekim: ışıkla okunan akış</h3><ol class="ip-akis">${E.akis.slice(0, 5).map((a) => `<li class="${a.isik === 'sonuk' ? 'eski' : ''}"><span class="lamp ${a.isik === 'kisik' ? 'lamp--dim' : a.isik === 'sonuk' ? 'lamp--off' : a.isik === 'canli' ? 'lamp--red is-live' : ''}" aria-hidden="true"></span><time>${esc(a.saat)}</time><h3>${esc(a.baslik)}<span class="yer">${esc(a.yer)}</span></h3></li>`).join('')}</ol>`;
  }

  // components
  const bl = $('#bilesenler');
  if (bl) {
    const h = (E.akis || [])[0] || { saat: '13.12', yer: 'Kudüs', baslik: '' };
    bl.innerHTML = `
      <div class="bilesen"><h3>Düğmeler</h3><div class="sira"><button class="btn" type="button">Abone ol</button><button class="btn btn--line" type="button">Tüm haberler</button><button class="btn" type="button" disabled>Gönderiliyor</button></div></div>
      <div class="bilesen"><h3>Işık düğmesi</h3><div class="sira" style="background:var(--gece);padding:14px"><span class="isik-dugme" aria-hidden="true"><span class="isik-dugme__lamba"></span>Işıkları yak</span><span class="isik-dugme" aria-hidden="true" data-yanik><span class="isik-dugme__lamba" style="box-shadow:0 0 10px 3px rgba(255,170,60,.6);background:radial-gradient(circle at 42% 38%,#fffbe9 0 18%,#ffd27a 55%,#f3a23a)"></span>Işıkları söndür</span></div></div>
      <div class="bilesen bilesen--genis"><h3>Son dakika şeridi</h3><div class="sondakika" style="position:relative"><div class="wrap" style="padding-inline:16px"><div class="sondakika__ad"><span class="lamp lamp--red is-live" aria-hidden="true"></span>${Mahya.svg('Son dakika', { mode: 'night', id: 'bsd', rope: false, pad: 1.4, r: .78, halo: 2.4 })}</div><time>${esc((E.sonDakika || [{}])[0].saat || '')}</time><div class="sondakika__satir"><a href="home.html">${esc((E.sonDakika || [{}])[0].baslik || '')}</a></div><div class="sondakika__kontrol"><span class="sira">1 / ${(E.sonDakika || []).length}</span></div></div></div></div>
      <div class="bilesen"><h3>Haber satırı</h3><div class="ornek-zemin"><h4 class="h-2"><a href="home.html">${esc(h.baslik)}</a></h4><div class="meta" style="margin-top:10px"><span class="lamp" aria-hidden="true"></span><span class="yer">${esc(h.yer)}</span><time>${esc(h.saat)}</time>${h.kaynak ? `<span class="dot"></span><span>${esc(h.kaynak)}</span>` : ''}</div></div></div>
      <div class="bilesen"><h3>Rakam paneli</h3>${S.rakam ? `<div class="rakam"><span class="rakam__ad">Günün rakamı</span>${mini(S.rakam.sayi, { id: 'br' })}<p>${esc(S.rakam.etiket)}</p><span class="kaynak">Kaynak: <b>${esc(S.rakam.kaynak)}</b> · ${esc(S.rakam.tarih)}</span></div>` : ''}</div>
      <div class="bilesen"><h3>Fotoğraf ve altyazı</h3><figure><div class="foto" style="aspect-ratio:21/9"><img src="assets/img/arsiv/sam-kapisi-gece.jpg?v=1" alt="Gece Şam Kapısı" width="1600" height="994" loading="lazy" class="is-loaded"></div><figcaption><span class="arsiv">Arşiv</span><b>Şam Kapısı, gece.</b> Kanuni Sultan Süleyman döneminde inşa edildi. Fotoğraf: Gerd Eichmann, CC BY-SA 4.0, Wikimedia Commons.</figcaption></figure></div>
      <div class="bilesen"><h3>Bölüm başlığı</h3><div class="bolum" style="margin:0"><div><h2>Mahalleler</h2><p>Doğu Kudüs, sokak sokak</p></div><a class="tum" href="home.html#mahalleler">Tümü <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div></div>`;
  }

  // off-site formats
  const ek = $('#ekran-sablon');
  if (ek && S.sonDakika) {
    const logo = (id) => `<div class="k-logo" style="left:6cqw;bottom:5.4cqw">${mini('Haber Kudüs', { id, halo: 2.2 })}</div>`;
    const min = (side) => { const m = $(`[data-minare="${side}"]`); return m ? m.outerHTML.replace(`data-minare="${side}"`, `style="${side === 'sol' ? 'left' : 'right'}:2cqw;height:140%;bottom:-36%"`) : ''; };
    const sd = S.sonDakika, hb = S.haber, rk = S.rakam, st = S.story, tg = S.telegram, ab = S.altBant;
    ek.innerHTML = `
      <figure class="e-4"><div class="profil"><img src="assets/brand/isaret-gece.svg?v=1" alt="Haber Kudüs profil görseli"><b>Haber Kudüs</b><span>Kudüs'ten, saati saatine. Mescid-i Aksa, Eski Şehir, Doğu Kudüs mahalleleri.</span></div><figcaption><b>Profil görseli.</b> Bütün platformlarda yalnız Ü. Daire kesimde iki kandil üst yarıda kalır.</figcaption></figure>
      <figure class="e-8"><div class="kart kart--3x1"><div class="k-ip" style="top:31%"></div>${min('sol')}${min('sag')}<div style="position:absolute;inset:22% 16% auto">${mini('Haber Kudüs', { id: 'kb' })}</div><div style="position:absolute;left:0;right:0;bottom:12%;text-align:center;font:italic 500 2.4cqw/1 var(--f-text);color:#aab2cf">Kudüs'ten, saati saatine.</div></div><figcaption><b>X ve YouTube kapağı.</b> 1500 × 500. Mahya ortada, minareler kenarda; profil görseli köşeye bindiğinde de mahya açık kalır.</figcaption></figure>
      <figure class="e-4"><div class="kart kart--45"><div class="k-ip" style="top:4.2%"></div><div style="position:absolute;inset:7.4cqw 6cqw auto" class="k-sd"><span class="lamp lamp--red is-live" aria-hidden="true"></span>${Mahya.svg('Son dakika', { mode: 'night', id: 'ks', rope: false, pad: .6 })}</div><div class="k-govde" style="bottom:18cqw"><div class="k-meta"><b>${esc(sd.yer)}</b> · ${esc(sd.saat)}</div><div class="k-baslik">${esc(sd.baslik)}</div><div class="k-kaynak">Kaynak: <b>${esc(sd.kaynak)}</b></div></div>${logo('kl1')}</div><figcaption><b>Son dakika.</b> 1080 × 1350. Kırmızı yalnız burada; başlık en çok dört satır.</figcaption></figure>
      <figure class="e-4"><div class="kart kart--45 kart--beyaz"><div class="k-foto"><img src="${esc(hb.foto)}" alt="${esc(hb.fotoAlt)}" loading="lazy"></div><div class="k-govde" style="bottom:17cqw"><div class="k-meta"><b>${esc(hb.yer)}</b> · ${esc(hb.saat)}</div><div class="k-baslik" style="font-size:6.4cqw">${esc(hb.baslik)}</div><div class="k-kaynak">Kaynak: <b>${esc(hb.kaynak)}</b> · Fotoğraf: arşiv</div></div><div class="k-logo" style="left:6cqw;bottom:5.4cqw">${Mahya.svg('Haber Kudüs', { mode: 'day', id: 'kl2', r: .62 })}</div></div><figcaption><b>Haber.</b> 1080 × 1350. Fotoğraf olay anına ait değilse künyede «arşiv» yazar.</figcaption></figure>
      <figure class="e-4"><div class="kart kart--45"><div class="k-ip" style="top:12.5%"></div><div class="k-rakam">${mini(rk.sayi, { id: 'kr' })}</div><div class="k-govde" style="bottom:18cqw"><div class="k-baslik" style="font-size:5.6cqw;font-weight:700">${esc(rk.etiket)}</div><div class="k-kaynak">Kaynak: <b>${esc(rk.kaynak)}</b> · ${esc(rk.tarih)}</div></div>${logo('kl3')}</div><figcaption><b>Rakam.</b> 1080 × 1350. Sayı mahya ile yazılır; kaynağı ve tarihi hemen altında.</figcaption></figure>
      <figure class="e-3"><div class="kart kart--916"><div class="k-foto" style="height:100%"><img src="${esc(st.foto)}" alt="${esc(st.fotoAlt)}" loading="lazy"></div><div class="k-golge"></div><div style="position:absolute;inset:7cqw 8cqw auto">${mini('Haber Kudüs', { id: 'kst' })}</div><div class="k-govde" style="inset:auto 8cqw 12cqw"><div class="k-meta" style="font-size:4cqw"><b style="font-size:4.2cqw">${esc(st.yer)}</b></div><div class="k-baslik" style="font-size:9.6cqw">${esc(st.baslik)}</div><div class="k-kaynak" style="font-size:3.6cqw">Yukarı kaydır · haberin tamamı</div></div></div><figcaption><b>Hikâye ve Reels kapağı.</b> 1080 × 1920. Üst ve alttaki 250 piksel uygulama arayüzüne bırakılır.</figcaption></figure>
      <figure class="e-5"><div class="tg"><div class="tg__balon"><div class="ad"><img src="assets/brand/favicon.svg?v=1" alt="">Haber Kudüs</div><p class="bas">${esc(tg.yer.toLocaleUpperCase('tr-TR'))} · ${esc(tg.saat)}</p><p class="bas">${esc(tg.baslik)}</p><p>${esc(tg.ozet)}</p><p class="kaynak">Kaynak: ${esc(tg.kaynak)}</p><span class="zaman">${esc(tg.saat)}</span></div></div><figcaption><b>Telegram ve WhatsApp kanalı.</b> Yer ve saat ilk satırda, büyük harfle; başlık kalın; tek paragraf özet; kaynak en sonda. Simge ve emoji kullanılmaz.</figcaption></figure>
      <figure class="e-4"><div class="kart" style="aspect-ratio:16/9"><div class="k-foto" style="height:100%"><img src="${esc(ab.foto)}" alt="${esc(ab.fotoAlt)}" loading="lazy"></div><div class="altbant"><div class="isaret"><img src="assets/brand/favicon.svg?v=1" alt=""></div><div class="yazi"><b>${esc(ab.baslik)}</b><span><span class="lamp" aria-hidden="true"></span>${esc(ab.yer)} · ${esc(ab.saat)}</span></div></div></div><figcaption><b>Video alt bandı.</b> Görüntünün alt beşte birinde; yer ve saat kandille birlikte.</figcaption></figure>`;
  }

  // place names
  const yt = $('#yerler');
  if (yt && E.yerler) {
    yt.innerHTML = `<caption class="sr">Kudüs yer adlarının Haber Kudüs'teki yazımı</caption><thead><tr><th scope="col">Haber Kudüs'te</th><th scope="col">Arapça</th><th scope="col">İngilizce</th><th scope="col">Not</th></tr></thead><tbody>${E.yerler.map((y) => `<tr><td>${esc(y.tr)}</td><td lang="ar">${esc(y.ar)}</td><td>${esc(y.en)}</td><td>${esc(y.not || '')}</td></tr>`).join('')}</tbody>`;
  }

  window.HKBrand = { esc, E };
})();
