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
      var c = content(p);
      var html = '<a class="back" href="#poojas">' + bi('← பூஜைப் பட்டியல்', '← Pooja list') + '</a>' +
        '<h1>' + bi(esc(p.name_ta), esc(p.name_en)) + '</h1>' +
        '<div class="badges">' +
        '<span class="badge">' + bi(P.CATEGORIES[p.category].ta, P.CATEGORIES[p.category].en) + '</span>' +
        (p.has_cook_option ? '<span class="badge">' + bi('சமையல்காரர் வசதி', 'Cook option') + '</span>' : '') +
        (p.is_self_pooja ? '<span class="badge">' + bi('வீட்டிலேயே செய்யலாம்', 'Can be done at home') + '</span>' : '') +
        '</div>' +
        '<h2>' + bi('தேவையான சாமான்கள்', 'Samagri list') + '</h2>' + pairList(c.samagri, 'ul') +
        '<h2>' + bi('செய்முறை', 'Steps') + '</h2>' + pairList(c.steps, 'ol');

      // Mantra Rule: only self-done poojas carry mantras (Tamil script).
      if (p.is_self_pooja && c.mantra) {
        html += '<h2>' + bi('மந்திரம்', 'Mantra') + '</h2>' +
          '<blockquote class="mantra">' + c.mantra.map(esc).join('<br>') + '</blockquote>';
      }

      html += '<div class="action-row">' +
        '<button type="button" class="btn btn-wide" id="btn-pdf">' + bi('நானே வாங்கிக் கொள்கிறேன்', 'I will buy it myself (PDF)') + '</button>' +
        '<button type="button" class="btn btn-wide btn-outline" id="btn-order">' + bi('ஆன்லைனில் ஆர்டர் செய்கிறேன்', 'I will order samagri online') + '</button>' +
        '</div>' +
        '<p class="form-msg" id="pdf-msg" role="status" aria-live="polite"></p>' +
        '<form id="order-form" class="order-form" novalidate hidden>' +
        '<label class="field"><span class="ta">டெலிவரி PIN குறியீடு (6 இலக்கம்)</span><span class="en">Delivery PIN code (6 digits)</span>' +
        '<input name="pin" type="text" inputmode="numeric" maxlength="6" required></label>' +
        '<button type="submit" class="btn">' + bi('ஆர்டர் உறுதி செய்', 'Place order') + '</button>' +
        '<p class="form-msg" role="status" aria-live="polite"></p>' +
        '</form>';

      box.innerHTML = html;
      box.dataset.poojaId = p.id;
      $('btn-pdf').addEventListener('click', function () { downloadPdf(p, c); });
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
    var pin = String(new FormData(form).get('pin') || '').trim();
    if (!/^\d{6}$/.test(pin)) return setMsg(out, 'pin_bad', true);

    A.currentUser().then(function (u) {
      if (!u) return setMsg(out, 'login_first', true);
      // The server checks the delivery PIN for an active store and queues WhatsApp trigger 1.
      return DB.rpc('sa_place_order', { p_token: DB.token(), p_pooja_slug: p.slug, p_pin: pin })
        .then(function (r) {
          if (!r.ok) return setMsg(out, ['store_none', 'login_first'].indexOf(r.error) !== -1 ? r.error : 'pin_bad', true);
          form.reset();
          setMsg(out, 'order_ok', false);
        });
    }).catch(function () { setMsg(out, 'pdf_fail', true); });
  }

  // ---------- Branded PDF (every page: logo + watermark) ----------
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

  function pdfPage(body) {
    return '<div class="pdf-page">' +
      '<div class="pdf-wm">' + watermark() + '</div>' +
      '<div class="pdf-head"><img class="pdf-logo" src="' + LOGO_SRC + '" alt="">' +
      '<div class="pdf-brand">' + bi('சுபம் அஸ்து', 'Subham Asthu') + '</div></div>' +
      body +
      '<div class="pdf-foot">' + watermark() + '</div>' +
      '</div>';
  }

  function buildSheet(p, c) {
    var title = '<h1>' + bi(esc(p.name_ta), esc(p.name_en)) + '</h1>';
    var page1 = pdfPage(title +
      '<h2>' + bi('தேவையான சாமான்கள்', 'Samagri list') + '</h2>' + pairList(c.samagri, 'ul'));
    var mantra = (p.is_self_pooja && c.mantra)
      ? '<h2>' + bi('மந்திரம்', 'Mantra') + '</h2><blockquote class="mantra">' + c.mantra.map(esc).join('<br>') + '</blockquote>'
      : '';
    var page2 = pdfPage(title +
      '<h2>' + bi('செய்முறை', 'Steps') + '</h2>' + pairList(c.steps, 'ol') + mantra);
    var root = document.createElement('div');
    root.className = 'pdf-root';
    root.innerHTML = page1 + page2;
    return root;
  }

  function downloadPdf(p, c) {
    var out = $('pdf-msg');
    var btn = $('btn-pdf');
    btn.disabled = true;
    setMsg(out, 'preparing', false);

    loadPdfLibs().then(function () {
      var root = buildSheet(p, c);
      document.body.appendChild(root);
      // The logo must be decoded before the page is drawn into the PDF.
      var images = Array.prototype.map.call(root.querySelectorAll('img'), function (im) {
        return im.decode ? im.decode().catch(function () { /* drawn as-is */ }) : Promise.resolve();
      });
      return Promise.all(images).then(function () {
        var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        var pages = root.querySelectorAll('.pdf-page');
        var chain = Promise.resolve();
        Array.prototype.forEach.call(pages, function (el, i) {
          chain = chain.then(function () {
            return window.html2canvas(el, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true });
          }).then(function (canvas) {
            if (i > 0) doc.addPage();
            doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
          });
        });
        return chain.then(function () {
          doc.save('subham-asthu-' + p.slug + '.pdf');
          root.remove();
        }, function (err) {
          root.remove();
          throw err;
        });
      });
    }).then(function () {
      out.innerHTML = '';
    }).catch(function () {
      setMsg(out, 'pdf_fail', true);
    }).finally(function () {
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
