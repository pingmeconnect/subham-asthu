/* Subham Asthu — pooja list, pooja detail, samagri order, branded PDF (Phase 3, logo Phase 5).
   Public: list + detail + PDF. Login required only for the samagri order. */
(function () {
  'use strict';

  // Watermark text comes from app_settings (text_pdf_watermark), shown on every PDF page.
  function watermark() {
    return [SASettings.text('text_pdf_watermark', 'ta'), SASettings.text('text_pdf_watermark', 'en')]
      .filter(Boolean).join(' — ');
  }
  var RETURN_KEY = 'subham-asthu-return';
  var JSPDF_SRC = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  var H2C_SRC = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
  var LOGO_SRC = 'img/logo.png';

  var mtSize = 1.4;
  function todayStr() {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  var DB = window.SADB;
  var P = window.SAPoojas;
  var A = window.SAAuth;

  // [Tamil, English]
  var MSG = {
    store_none: ['இந்த PIN குறியீட்டுப் பகுதியில் இப்போது கூட்டாளர் கடை இல்லை.', 'No partner store is available in this PIN code area yet.'],
    order_ok: ['ஆர்டர் பதிவு செய்யப்பட்டது. உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறது.', 'Order recorded. Waiting for confirmation.'],
    pin_bad: ['சரியான 6 இலக்க PIN குறியீட்டை உள்ளிடவும்.', 'Enter a valid 6-digit PIN code.'],
    login_first: ['ஆர்டர் செய்ய முதலில் உள்நுழையவும்.', 'Please log in first to place an order.'],
    pdf_fail: ['PDF உருவாக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', 'Could not create the PDF. Check your internet connection and try again.'],
    preparing: ['தயாராகிறது…', 'Preparing…'],
    address_bad: ['டெலிவரி முகவரியை முழுமையாக (குறைந்தது 10 எழுத்துகள்) உள்ளிடவும்.', 'Enter the full delivery address (at least 10 characters).'],
    date_bad: ['இன்றோ அதற்குப் பின்னரோ உள்ள தேதியைத் தேர்ந்தெடுக்கவும்.', 'Choose a date today or later.'],
    notes_bad: ['குறிப்பு 300 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Notes must be within 300 characters.'],
    not_found: ['பூஜை கிடைக்கவில்லை.', 'Pooja not found.']
  };

  function bi(ta, en) {
    return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>';
  }

  function $(id) { return document.getElementById(id); }

  function setMsg(el, code, isError) {
    var m = MSG[code];
    el.innerHTML = bi(m[0], m[1]);
    el.classList.toggle('is-error', !!isError);
    el.classList.toggle('is-ok', !isError);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function pairList(items, tag) {
    return '<' + tag + ' class="check-list">' + items.map(function (it) {
      return '<li>' + bi(esc(it[0]), esc(it[1])) + '</li>';
    }).join('') + '</' + tag + '>';
  }

  var SELF = window.SASelf;

  // Checklist rows with a small picture: items are { icon, ta, en }.
  function checkGrid(items) {
    return '<ul class="ck-grid">' + items.map(function (it) {
      return '<li><span class="ck-ico">' + SELF.icon(it.icon) + '</span><span class="ck-tx">' + bi(esc(it.ta), esc(it.en)) + '</span></li>';
    }).join('') + '</ul>';
  }

  function legacyItems(rows) {
    return rows.map(function (r) { return { icon: SELF.iconFor(r[0]), ta: r[0], en: r[1] }; });
  }

  function stepCards(steps) {
    return '<ol class="st-list">' + steps.map(function (s) {
      return '<li>' + bi(esc(s.ta), esc(s.en)) +
        (s.m ? ' <span class="st-m">' + bi('மந்திரம் ' + s.m, 'Mantra ' + s.m) + '</span>' : '') + '</li>';
    }).join('') + '</ol>';
  }

  function mantraCards(list) {
    return list.map(function (m, i) {
      return '<div class="mt-card"><h3>' + (i + 1) + ' · ' + bi(esc(m.ta), esc(m.en)) + '</h3>' +
        '<div class="badges"><span class="badge">' + bi(esc(m.whenTa), esc(m.whenEn)) + '</span>' +
        '<span class="badge">' + bi('எத்தனை முறை', 'Times') + ': ' + esc(m.count) + '</span></div>' +
        '<div class="mt-text">' + m.lines.map(esc).join('<br>') + '</div>' +
        '<p class="mt-mean">' + bi(esc(m.meTa), esc(m.meEn)) + '</p></div>';
    }).join('');
  }

  // Same data for the page and the PDF: what to show for any pooja.
  function sheetData(p) {
    var self = p.is_self_pooja ? SELF.get(p.slug) : null;
    if (self) return { time: self.time, samagri: self.samagri, steps: self.steps, mantras: self.mantras };
    var c = content(p);
    return {
      time: null,
      samagri: legacyItems(c.samagri),
      steps: c.steps.map(function (s) { return { ta: s[0], en: s[1], m: 0 }; }),
      mantras: []
    };
  }

  function catalogFor(slug) {
    return P.CATALOG.filter(function (c) { return c.slug === slug; })[0] || null;
  }

  function content(p) {
    return P.KINDS[catalogFor(p.slug).kind];
  }

  // ---------- List ----------
  function renderList() {
    return P.seed().then(function (rows) {
      var html = '';
      Object.keys(P.CATEGORIES).forEach(function (cat) {
        var items = rows.filter(function (r) { return r.category === cat; });
        html += '<section class="pooja-group cat-' + cat + '"><h2>' + bi(P.CATEGORIES[cat].ta, P.CATEGORIES[cat].en) + '</h2><div class="pooja-grid">';
        items.forEach(function (r) {
          html += '<a class="pooja-card" href="#pooja/' + r.slug + '">' +
            '<strong>' + bi(esc(r.name_ta), esc(r.name_en)) + '</strong>' +
            (r.has_cook_option ? '<span class="badge">' + bi('சமையல்காரர் வசதி', 'Cook option') + '</span>' : '') +
            '</a>';
        });
        html += '</div></section>';
      });
      $('pooja-list').innerHTML = html;
    });
  }

  // ---------- Detail ----------
  function renderDetail(slug) {
    var box = $('pooja-detail');
    return P.seed().then(function () {
      return P.seed();
    }).then(function (rows) {
      var p = rows.filter(function (r) { return r.slug === slug; })[0] || null;
      if (!p) { box.innerHTML = '<p>' + bi(MSG.not_found[0], MSG.not_found[1]) + '</p>'; return; }
      var d = sheetData(p);
      var html = '<a class="back" href="#poojas">' + bi('← பூஜைப் பட்டியல்', '← Pooja list') + '</a>' +
        '<h1>' + bi(esc(p.name_ta), esc(p.name_en)) + '</h1>' +
        '<div class="badges">' +
        '<span class="badge">' + bi(P.CATEGORIES[p.category].ta, P.CATEGORIES[p.category].en) + '</span>' +
        (p.has_cook_option ? '<span class="badge">' + bi('சமையல்காரர் வசதி', 'Cook option') + '</span>' : '') +
        (p.is_self_pooja ? '<span class="badge">' + bi('வீட்டிலேயே செய்யலாம்', 'Can be done at home') + '</span>' : '') +
        (d.time ? '<span class="badge">⏱ ' + bi(esc(d.time[0]), esc(d.time[1])) + '</span>' : '') +
        '</div>' +
        '<h2>' + bi('தேவையான சாமான்கள்', 'What you need') + '</h2>' + checkGrid(d.samagri) +
        '<h2>' + bi('செய்முறை', 'Step by step') + '</h2>' + stepCards(d.steps);

      // Mantra Rule: only self-done poojas carry mantras (Tamil script, same web fonts, adjustable size).
      if (d.mantras.length) {
        html += '<h2>' + bi('மந்திரங்கள்', 'Mantras') + '</h2>' +
          '<div class="mt-size" role="group" aria-label="Text size">' + bi('எழுத்தின் அளவு', 'Text size') +
          ' <button type="button" class="btn btn-outline" data-mt-size="-1">A−</button>' +
          '<button type="button" class="btn btn-outline" data-mt-size="1">A+</button></div>' +
          '<div id="mt-cards">' + mantraCards(d.mantras) + '</div>' +
          '<p class="soon">' + bi('மந்திரங்களை உங்கள் குடும்ப வாத்தியாரிடம் ஒருமுறை சரிபார்த்துக் கொள்ளலாம்.', 'You may check the mantras once with your family priest.') + '</p>';
      }

      html += '<div class="action-row">' +
        '<button type="button" class="btn btn-wide" id="btn-pdf">' + bi('நானே வாங்கிக் கொள்கிறேன்', 'I will buy it myself (PDF)') + '</button>' +
        '<button type="button" class="btn btn-wide btn-outline" id="btn-order">' + bi('ஆன்லைனில் ஆர்டர் செய்கிறேன்', 'I will order samagri online') + '</button>' +
        '</div>' +
        '<p class="form-msg" id="pdf-msg" role="status" aria-live="polite"></p>' +
        '<form id="order-form" class="order-form" novalidate hidden>' +
        '<label class="field"><span class="ta">டெலிவரி PIN குறியீடு (6 இலக்கம்)</span><span class="en">Delivery PIN code (6 digits)</span>' +
        '<input name="pin" type="text" inputmode="numeric" maxlength="6" required></label>' +
        '<label class="field"><span class="ta">டெலிவரி முகவரி</span><span class="en">Delivery address</span>' +
        '<textarea name="address" rows="3" maxlength="300" required></textarea></label>' +
        '<label class="field"><span class="ta">எப்போது தேவை (தேதி)</span><span class="en">Needed by (date)</span>' +
        '<input name="needed_by" type="date" required></label>' +
        '<label class="field"><span class="ta">குறிப்பு (விருப்பம்)</span><span class="en">Notes (optional)</span>' +
        '<textarea name="notes" rows="2" maxlength="300"></textarea></label>' +
        '<button type="submit" class="btn">' + bi('ஆர்டர் உறுதி செய்', 'Place order') + '</button>' +
        '<p class="form-msg" role="status" aria-live="polite"></p>' +
        '</form>';

      box.innerHTML = html;
      box.dataset.poojaId = p.id;
      $('btn-pdf').addEventListener('click', function () { downloadPdf(p, d); });
      var nb = box.querySelector('input[name="needed_by"]');
      if (nb) nb.min = todayStr();
      box.querySelectorAll('[data-mt-size]').forEach(function (b) {
        b.addEventListener('click', function () {
          mtSize = Math.max(1.1, Math.min(2.2, mtSize + 0.15 * Number(b.getAttribute('data-mt-size'))));
          box.style.setProperty('--mt-size', mtSize + 'rem');
        });
      });
      $('btn-order').addEventListener('click', function () { startOrder(p); });
      $('order-form').addEventListener('submit', function (e) { e.preventDefault(); placeOrder(p, this); });
    });
  }

  // ---------- Samagri order (login required) ----------
  function startOrder(p) {
    A.currentUser().then(function (u) {
      var form = $('order-form');
      if (!u) {
        try { localStorage.setItem(RETURN_KEY, '#pooja/' + p.slug); } catch (e) { /* session only */ }
        setMsg($('pdf-msg'), 'login_first', true);
        location.hash = '#login';
        return;
      }
      form.hidden = !form.hidden;
      if (!form.hidden) form.querySelector('input[name="pin"]').focus();
    });
  }

  function placeOrder(p, form) {
    var out = form.querySelector('.form-msg');
    var d = new FormData(form);
    var pin = String(d.get('pin') || '').trim();
    var address = String(d.get('address') || '').trim();
    var needed = String(d.get('needed_by') || '');
    var notes = String(d.get('notes') || '').trim();
    if (!/^\d{6}$/.test(pin)) return setMsg(out, 'pin_bad', true);
    if (address.length < 10) return setMsg(out, 'address_bad', true);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(needed) || needed < todayStr()) return setMsg(out, 'date_bad', true);
    if (notes.length > 300) return setMsg(out, 'notes_bad', true);

    A.currentUser().then(function (u) {
      if (!u) return setMsg(out, 'login_first', true);
      // The server checks the delivery PIN for an active store and queues WhatsApp trigger 1.
      return DB.rpc('sa_place_order', { p_token: DB.token(), p_pooja_slug: p.slug, p_pin: pin,
          p_address: address, p_needed_by: needed, p_notes: notes })
        .then(function (r) {
          if (!r.ok) return setMsg(out, MSG[r.error] ? r.error : 'pin_bad', true);
          form.reset();
          setMsg(out, 'order_ok', false);
        });
    }).catch(function () { setMsg(out, 'pdf_fail', true); });
  }

  // ---------- Branded PDF: automatic page breaks; logo on top, brand + notice at the bottom of EVERY page ----------
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadPdfLibs() {
    if (window.jspdf && window.html2canvas) return Promise.resolve();
    return loadScript(H2C_SRC).then(function () { return loadScript(JSPDF_SRC); });
  }

  function newPage(titleHtml, first) {
    var page = document.createElement('div');
    page.className = 'pdf-page';
    page.innerHTML =
      '<div class="pdf-wm">' + watermark() + '</div>' +
      '<div class="pdf-head"><img class="pdf-logo" src="' + LOGO_SRC + '" alt="">' +
      '<div class="pdf-brand">' + bi('சுபம் அஸ்து', 'Subham Asthu') + '</div>' +
      '<div class="pdf-pn"></div></div>' +
      '<div class="pdf-body">' + (first ? '' : '<div class="pdf-cont">' + titleHtml + '</div>') + '</div>' +
      '<div class="pdf-foot">' +
        '<div class="pdf-foot-brand"><img class="pdf-foot-logo" src="' + LOGO_SRC + '" alt="">' +
        '<strong>' + bi('சுபம் அஸ்து', 'Subham Asthu') + '</strong></div>' +
        '<div>' + watermark() + '</div></div>';
    return page;
  }

  // Atomic blocks (heading + first item stay together). Returns an array of HTML strings.
  function sheetBlocks(p, d) {
    var title = bi(esc(p.name_ta), esc(p.name_en));
    var blocks = ['<h1>' + title + '</h1>' + (d.time ? '<p class="pdf-time">⏱ ' + bi(esc(d.time[0]), esc(d.time[1])) + '</p>' : '')];
    var row = function (it) {
      return '<div class="pdf-ck"><span class="ck-ico">' + SELF.icon(it.icon) + '</span><span>' + bi(esc(it.ta), esc(it.en)) + '</span></div>';
    };
    var pairs = [];
    for (var i = 0; i < d.samagri.length; i += 2) {
      pairs.push('<div class="pdf-row2">' + row(d.samagri[i]) + (d.samagri[i + 1] ? row(d.samagri[i + 1]) : '<div></div>') + '</div>');
    }
    pairs[0] = '<h2>' + bi('தேவையான சாமான்கள்', 'What you need') + '</h2>' + pairs[0];
    blocks = blocks.concat(pairs);
    var steps = d.steps.map(function (s, k) {
      return '<div class="pdf-step"><span class="pdf-n">' + (k + 1) + '</span><div>' + bi(esc(s.ta), esc(s.en)) +
        (s.m ? ' <span class="pdf-m">' + bi('மந்திரம் ' + s.m, 'Mantra ' + s.m) + '</span>' : '') + '</div></div>';
    });
    steps[0] = '<h2>' + bi('செய்முறை', 'Step by step') + '</h2>' + steps[0];
    blocks = blocks.concat(steps);
    var mantras = d.mantras.map(function (m, k) {
      return '<div class="pdf-mt"><h3>' + (k + 1) + ' · ' + bi(esc(m.ta), esc(m.en)) + '</h3>' +
        '<div class="pdf-mt-when">' + bi(esc(m.whenTa), esc(m.whenEn)) + ' · ' + bi('எத்தனை முறை', 'Times') + ': ' + esc(m.count) + '</div>' +
        '<div class="pdf-mt-text">' + m.lines.map(esc).join('<br>') + '</div>' +
        '<div class="pdf-mt-mean">' + bi(esc(m.meTa), esc(m.meEn)) + '</div></div>';
    });
    if (mantras.length) {
      mantras[0] = '<h2>' + bi('மந்திரங்கள்', 'Mantras') + '</h2>' + mantras[0];
      blocks = blocks.concat(mantras);
    }
    return { blocks: blocks, title: title };
  }

  // Fills fixed-size A4 pages block by block; a block that does not fit starts the next page.
  function paginate(root, sheet) {
    var pages = [], cur = newPage(sheet.title, true);
    root.appendChild(cur); pages.push(cur);
    sheet.blocks.forEach(function (html) {
      var body = cur.querySelector('.pdf-body');
      var wrap = document.createElement('div');
      wrap.className = 'pdf-blk';
      wrap.innerHTML = html;
      body.appendChild(wrap);
      if (body.scrollHeight > body.clientHeight + 1 && body.children.length > 1 + (pages.length > 1 ? 1 : 0)) {
        body.removeChild(wrap);
        cur = newPage(sheet.title, false);
        root.appendChild(cur); pages.push(cur);
        cur.querySelector('.pdf-body').appendChild(wrap);
      }
    });
    pages.forEach(function (pg, i) {
      pg.querySelector('.pdf-pn').textContent = (i + 1) + ' / ' + pages.length;
    });
    return pages;
  }

  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('400 18px "Noto Sans Tamil"'), document.fonts.load('700 18px "Noto Sans Tamil"'),
      document.fonts.load('400 18px "Hind Madurai"'), document.fonts.load('700 18px "Hind Madurai"'),
      document.fonts.load('400 18px "Plus Jakarta Sans"'), document.fonts.load('700 18px "Plus Jakarta Sans"')
    ]).catch(function () { /* fall back to system fonts */ }).then(function () { return document.fonts.ready; });
  }

  function downloadPdf(p, d) {
    var out = $('pdf-msg');
    var btn = $('btn-pdf');
    btn.disabled = true;
    setMsg(out, 'preparing', false);
    var root = null;

    Promise.all([loadPdfLibs(), fontsReady()]).then(function () {
      root = document.createElement('div');
      root.className = 'pdf-root';
      document.body.appendChild(root);
      var pages = paginate(root, sheetBlocks(p, d));
      var images = Array.prototype.map.call(root.querySelectorAll('img'), function (im) {
        return im.decode ? im.decode().catch(function () { /* drawn as-is */ }) : Promise.resolve();
      });
      return Promise.all(images).then(function () {
        var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        var chain = Promise.resolve();
        pages.forEach(function (el, i) {
          chain = chain.then(function () {
            return window.html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true });
          }).then(function (canvas) {
            if (i > 0) doc.addPage();
            doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
          });
        });
        return chain.then(function () { doc.save('subham-asthu-' + p.slug + '.pdf'); });
      });
    }).then(function () {
      out.innerHTML = '';
    }).catch(function () {
      setMsg(out, 'pdf_fail', true);
    }).finally(function () {
      if (root) root.remove();
      btn.disabled = false;
    });
  }

  // ---------- Routing ----------
  function route() {
    var hash = location.hash || '';
    if (hash === '#poojas') return renderList();
    if (hash.indexOf('#pooja/') === 0) return renderDetail(hash.slice('#pooja/'.length));
  }

  window.addEventListener('hashchange', route);
  route();
})();
