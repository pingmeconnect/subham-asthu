/* Sankalpam — online samagri order page: edit items -> review -> submit. No prices; payment is settled directly. */
(function () {
  'use strict';

  var O = window.SAOrder, DB = window.SADB, A = window.SAAuth;
  var RETURN_KEY = 'subham-asthu-return';
  var st = null; // { slug, rows, extra notes..., step }

  var T = {
    login: ['ஆர்டர் செய்ய முதலில் உள்நுழையவும்.', 'Please log in first to place an order.'],
    pin_bad: ['தமிழ்நாடு / புதுச்சேரியின் சரியான 6 இலக்க PIN குறியீட்டை உள்ளிடவும்.', 'Enter a valid 6-digit Tamil Nadu / Puducherry PIN code.'],
    address_bad: ['டெலிவரி முகவரியை முழுமையாக (குறைந்தது 10 எழுத்துகள்) உள்ளிடவும்.', 'Enter the full delivery address (at least 10 characters).'],
    date_bad: ['இன்றோ அதற்குப் பின்னரோ உள்ள தேதியைத் தேர்ந்தெடுக்கவும்.', 'Choose a date today or later.'],
    notes_bad: ['கருத்து 480 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Comments must be within 480 characters.'],
    items_none: ['குறைந்தது ஒரு சாமானையாவது தேர்ந்தெடுக்கவும்.', 'Tick at least one item.'],
    store_none: ['இந்த PIN குறியீட்டுப் பகுதியில் இப்போது கூட்டாளர் கடை இல்லை.', 'No partner store is available for this PIN code right now.'],
    time_bad: ['டெலிவரி நேரத்தைத் தேர்ந்தெடுக்கவும்.', 'Choose a delivery time.'],
    fail: ['ஆர்டர் அனுப்ப முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.', 'Could not send the order. Check your connection and try again.']
  };

  function bi(ta, en) { return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function msg(code) { return bi(T[code][0], T[code][1]); }
  function todayStr() {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function unitOf(it) { return O.UNIT[it.unit]; }
  function qtyText(it, q) { var u = unitOf(it); return bi(q + ' ' + u[0], q + ' ' + u[1]); }
  function fmt(n) { return String(Math.round(n * 100) / 100); }

  var TIMES = [['காலை 8 – 12', 'Morning 8 AM – 12 PM'], ['மதியம் 12 – 4', 'Afternoon 12 – 4 PM'], ['மாலை 4 – 8', 'Evening 4 – 8 PM']];

  function noticeHtml() {
    return '<ul class="od-notes">' +
      '<li>' + bi('பொருட்கள் உங்கள் வீட்டு வாசலில் டெலிவரி ஆன பிறகு மட்டும் பணம் செலுத்தவும் (ரொக்கமாக அல்லது ஆன்லைனில்). சங்கல்பம் எந்தப் பணமும் வசூலிப்பதில்லை.',
        'Please pay only after the goods are delivered at your doorstep, in cash or online. Sankalpam does not collect any payment.') + '</li>' +
      '<li>' + bi('குறைந்தபட்ச ஆர்டர் மதிப்பு ₹1000. டெலிவரி கட்டணம் இருந்தால் அது கடையின் விதிப்படி; டெலிவரியின் போது கடையிடம் சரிபார்த்துக் கொள்ளவும்.',
        'Minimum order value is ₹1000. Any delivery charge is as per the shop; please confirm it with the shop at the time of delivery.') + '</li>' +
      '<li>' + bi('கடை உறுதி செய்த பின், டெலிவரிக்கு முன் உங்களை அழைப்பார்கள்.', 'The shop will call you once before delivering, after it confirms.') + '</li>' +
      '<li>' + bi('இரவு 9 மணிக்குப் பின் அனுப்பும் ஆர்டர்கள் மறுநாள் காலை உறுதி செய்யப்படும்.', 'Orders sent after 9 PM are confirmed the next morning.') + '</li></ul>';
  }

  function stepper(n) {
    var labels = [['சாமான்கள்', 'Items'], ['சரிபார்', 'Review'], ['முடிந்தது', 'Done']];
    return '<ol class="od-steps">' + labels.map(function (l, i) {
      return '<li class="' + (i + 1 === n ? 'is-now' : i + 1 < n ? 'is-done' : '') + '"><b>' + (i + 1) + '</b>' + bi(l[0], l[1]) + '</li>';
    }).join('') + '</ol>';
  }

  function head(p, n) {
    return '<a class="back" href="#pooja/' + esc(p.slug) + '">' + bi('← பூஜைப் பக்கம்', '← Pooja page') + '</a>' +
      '<header class="pj-head od-head"><h1>' + bi(esc(p.name_ta), esc(p.name_en)) + '</h1>' +
      '<p class="pj-deity">🧺 ' + bi('பூஜை சாமான்கள் — ஆன்லைன் ஆர்டர்', 'Pooja samagri — online order') + '</p></header>' + stepper(n);
  }

  // ---------- Step 1: edit ----------
  function rowHtml(r) {
    var it = O.info(r.key), u = unitOf(it);
    return '<li class="od-row' + (r.on ? '' : ' is-off') + '" data-key="' + r.key + '">' +
      '<label class="od-ck"><input type="checkbox" data-od="on"' + (r.on ? ' checked' : '') + '>' +
      '<span class="od-name"><strong>' + bi(esc(it.ta), esc(it.en)) + '</strong>' +
      (it.home ? '<small>' + bi('பொதுவாக வீட்டில் இருக்கும்', 'usually at home') + '</small>' : '') + '</span></label>' +
      '<div class="od-qty"><button type="button" class="od-b" data-od="minus" aria-label="-">−</button>' +
      '<input type="number" inputmode="decimal" min="0" step="any" value="' + fmt(r.qty) + '" data-od="qty" aria-label="quantity">' +
      '<button type="button" class="od-b" data-od="plus" aria-label="+">+</button>' +
      '<span class="od-unit">' + bi(u[0], u[1]) + '</span></div>' +
      (r.extra ? '<button type="button" class="od-x" data-od="del" aria-label="remove">✕</button>' : '') + '</li>';
  }

  function missingOptions() {
    var have = {}; st.rows.forEach(function (r) { have[r.key] = 1; });
    var en = document.documentElement.getAttribute('data-lang') === 'en';
    return O.all().filter(function (i) { return !have[i.key]; })
      .sort(function (a, b) { return en ? a.en.localeCompare(b.en) : a.ta.localeCompare(b.ta, 'ta'); })
      .map(function (i) { return '<option value="' + i.key + '">' + esc(en ? i.en : i.ta) + ' (' + esc(en ? unitOf(i)[1] : unitOf(i)[0]) + ')</option>'; }).join('');
  }

  function edit(box, p) {
    var priestNote = !p.is_self_pooja
      ? '<p class="pj-note">' + bi('குறிப்பு: இந்தப் பட்டியல் பொதுவானது. உங்கள் வாத்தியார் அறிவுறுத்தலின்படியும் உங்கள் குடும்ப வழக்கப்படியும் சில சாமான்கள் மாறலாம். வாத்தியாரிடம் கேட்டு உறுதி செய்த பின் ஆர்டர் செய்யவும்.',
        'Note: This list is general. Items may change as your priest advises and as per your family custom. Please confirm with your priest before ordering.') + '</p>' : '';
    box.innerHTML = '<div class="pj od" style="--cc:' + (st.color || '#702C35') + '">' + head(p, 1) +
      '<section class="pj-card"><h2>1. ' + bi('சாமான்களைச் சரிபார்க்கவும்', 'Check your items') + '</h2>' +
      '<p class="od-help">' + bi('தேவையில்லாததை டிக் நீக்கவும்; அளவை மாற்றலாம்.', 'Untick what you do not need. You can change the quantity.') + '</p>' + priestNote +
      '<ul class="od-list" id="od-list">' + st.rows.map(rowHtml).join('') + '</ul>' +
      '<div class="od-add"><label class="field"><span class="ta">பட்டியலில் இல்லாத சாமான் சேர்க்க</span><span class="en">Add an item that is not in the list</span>' +
      '<select id="od-pick"></select></label>' +
      '<button type="button" class="btn btn-outline" id="od-add">+ ' + bi('சேர்', 'Add') + '</button></div></section>' +
      '<section class="pj-card"><h2>2. ' + bi('கூடுதல் கருத்துகள்', 'Additional comments') + '</h2>' +
      '<label class="field"><span class="ta">வேறு ஏதேனும் தேவை / சிறப்பு அறிவுறுத்தல் இருந்தால் எழுதவும் (விருப்பம்)</span>' +
      '<span class="en">Anything else you need or any special instruction (optional)</span>' +
      '<textarea id="od-notes" rows="4" maxlength="480">' + esc(st.notes) + '</textarea></label></section>' +
      '<section class="pj-card"><h2>3. ' + bi('டெலிவரி விவரங்கள்', 'Delivery details') + '</h2>' +
      '<label class="field"><span class="ta">டெலிவரி PIN குறியீடு (6 இலக்கம்)</span><span class="en">Delivery PIN code (6 digits)</span>' +
      '<input id="od-pin" type="text" inputmode="numeric" maxlength="6" value="' + esc(st.pin) + '"></label>' +
      '<label class="field"><span class="ta">டெலிவரி முகவரி</span><span class="en">Delivery address</span>' +
      '<textarea id="od-addr" rows="3" maxlength="300">' + esc(st.address) + '</textarea></label>' +
      '<label class="field"><span class="ta">எப்போது தேவை (தேதி)</span><span class="en">Needed by (date)</span>' +
      '<input id="od-date" type="date" min="' + todayStr() + '" value="' + esc(st.needed) + '"></label>' +
      '<label class="field"><span class="ta">டெலிவரி நேரம்</span><span class="en">Preferred delivery time</span>' +
      '<select id="od-time"><option value="">—</option>' + TIMES.map(function (t, i) { return '<option value="' + i + '"' + (String(st.time) === String(i) ? ' selected' : '') + '>' + esc(document.documentElement.getAttribute('data-lang') === 'en' ? t[1] : t[0]) + '</option>'; }).join('') + '</select></label>' +
      noticeHtml() + '</section>' +
      '<p class="form-msg" id="od-msg" role="status" aria-live="polite"></p>' +
      '<div class="action-row od-nav"><button type="button" class="btn btn-wide" id="od-next">' + bi('அடுத்து — சரிபார்க்க →', 'Next — review →') + '</button></div></div>';
    fillPick();
    wireEdit(box, p);
  }

  function fillPick() {
    var sel = document.getElementById('od-pick');
    if (!sel) return;
    var opts = missingOptions();
    sel.innerHTML = '<option value="">' + (document.documentElement.getAttribute('data-lang') === 'en' ? '— choose item —' : '— சாமானைத் தேர்ந்தெடுக்கவும் —') + '</option>' + opts;
  }

  function sync(box) {
    box.querySelectorAll('.od-row').forEach(function (li) {
      var r = st.rows.filter(function (x) { return x.key === li.getAttribute('data-key'); })[0];
      if (!r) return;
      r.on = li.querySelector('[data-od="on"]').checked;
      var q = parseFloat(li.querySelector('[data-od="qty"]').value);
      r.qty = isFinite(q) && q > 0 ? q : 0;
    });
    st.notes = document.getElementById('od-notes').value;
    st.pin = document.getElementById('od-pin').value.trim();
    st.address = document.getElementById('od-addr').value.trim();
    st.needed = document.getElementById('od-date').value;
    st.time = document.getElementById('od-time').value;
  }

  function wireEdit(box, p) {
    var list = document.getElementById('od-list');
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-od]');
      if (!b) return;
      var li = b.closest('.od-row'), key = li.getAttribute('data-key');
      var inp = li.querySelector('[data-od="qty"]');
      var a = b.getAttribute('data-od'), step = unitOf(O.info(key))[2];
      if (a === 'plus' || a === 'minus') {
        var v = parseFloat(inp.value) || 0;
        v = Math.max(0, v + (a === 'plus' ? step : -step));
        inp.value = fmt(v);
        if (v > 0) { li.querySelector('[data-od="on"]').checked = true; li.classList.remove('is-off'); }
      } else if (a === 'del') {
        sync(box);
        st.rows = st.rows.filter(function (r) { return r.key !== key; });
        li.remove(); fillPick();
      }
    });
    list.addEventListener('change', function (e) {
      var li = e.target.closest('.od-row');
      if (li && e.target.getAttribute('data-od') === 'on') li.classList.toggle('is-off', !e.target.checked);
    });
    document.getElementById('od-add').addEventListener('click', function () {
      var sel = document.getElementById('od-pick'), key = sel.value;
      if (!key) return;
      sync(box);
      var r = { key: key, on: true, qty: O.info(key).qty, extra: true };
      st.rows.push(r);
      list.insertAdjacentHTML('beforeend', rowHtml(r));
      fillPick();
      list.lastChild.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
    document.getElementById('od-next').addEventListener('click', function () {
      sync(box);
      var out = document.getElementById('od-msg');
      var chosen = st.rows.filter(function (r) { return r.on && r.qty > 0; });
      var bad = null;
      if (!chosen.length) bad = 'items_none';
      else if (!window.SARegion.okPin(st.pin)) bad = 'pin_bad';
      else if (st.address.length < 10) bad = 'address_bad';
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(st.needed) || st.needed < todayStr()) bad = 'date_bad';
      else if (st.time === '') bad = 'time_bad';
      else if (st.notes.length > 480) bad = 'notes_bad';
      if (bad) { out.innerHTML = msg(bad); out.className = 'form-msg is-error'; out.scrollIntoView({ block: 'center' }); return; }
      review(box, p);
    });
  }

  // ---------- Step 2: review ----------
  function review(box, p) {
    var chosen = st.rows.filter(function (r) { return r.on && r.qty > 0; });
    box.innerHTML = '<div class="pj od" style="--cc:' + (st.color || '#702C35') + '">' + head(p, 2) +
      '<section class="pj-card"><h2>' + bi('உங்கள் ஆர்டரைச் சரிபாருங்கள்', 'Please check your order') + '</h2>' +
      '<ul class="od-sum">' + chosen.map(function (r) {
        var it = O.info(r.key);
        return '<li><span>' + bi(esc(it.ta), esc(it.en)) + '</span><b>' + qtyText(it, fmt(r.qty)) + '</b></li>';
      }).join('') + '</ul>' +
      (st.notes.trim() ? '<h3>📝 ' + bi('உங்கள் கருத்துகள்', 'Your comments') + '</h3><p class="od-text">' + esc(st.notes) + '</p>' : '') +
      '<h3>📍 ' + bi('டெலிவரி', 'Delivery') + '</h3>' +
      '<p class="od-text">PIN ' + esc(st.pin) + '<br>' + esc(st.address).replace(/\n/g, '<br>') + '<br>📅 ' + esc(st.needed) + ' · ' + bi(TIMES[st.time][0], TIMES[st.time][1]) + '</p>' +
      noticeHtml() + '</section>' +
      '<p class="form-msg" id="od-msg" role="status" aria-live="polite"></p>' +
      '<div class="action-row od-nav"><button type="button" class="btn btn-wide btn-outline" id="od-back">← ' + bi('மாற்றங்கள் செய்ய', 'Back to edit') + '</button>' +
      '<button type="button" class="btn btn-wide" id="od-submit">✔ ' + bi('உறுதி செய்து அனுப்பு', 'Confirm & submit') + '</button></div></div>';
    document.getElementById('od-back').addEventListener('click', function () { edit(box, p); window.scrollTo(0, 0); });
    document.getElementById('od-submit').addEventListener('click', function () { submit(box, p, chosen, this); });
    window.scrollTo(0, 0);
  }

  function submit(box, p, chosen, btn) {
    var out = document.getElementById('od-msg');
    btn.disabled = true;
    var items = chosen.map(function (r) {
      var it = O.info(r.key), u = unitOf(it);
      return { ta: it.ta, en: it.en, qty: r.qty, unit_ta: u[0], unit_en: u[1] };
    });
    A.currentUser().then(function (u) {
      if (!u) { out.innerHTML = msg('login'); out.className = 'form-msg is-error'; btn.disabled = false; return; }
      return DB.rpc('sa_place_order_items', { p_token: DB.token(), p_pooja_slug: p.slug, p_pin: st.pin,
        p_address: st.address, p_needed_by: st.needed, p_notes: ('Delivery time: ' + TIMES[st.time][1] + (st.notes.trim() ? '\n' + st.notes.trim() : '')), p_items: items })
        .then(function (r) {
          if (!r.ok) {
            out.innerHTML = msg(T[r.error] ? r.error : 'fail'); out.className = 'form-msg is-error'; btn.disabled = false; return;
          }
          done(box, p);
        });
    }).catch(function () { out.innerHTML = msg('fail'); out.className = 'form-msg is-error'; btn.disabled = false; });
  }

  // ---------- Step 3: done ----------
  function done(box, p) {
    st = null;
    box.innerHTML = '<div class="pj od">' + head(p, 3) +
      '<section class="pj-card od-done"><h2>🙏 ' + bi('ஆர்டர் பதிவு செய்யப்பட்டது', 'Order received') + '</h2>' +
      '<p>' + bi('உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறது. கடை உறுதி செய்ததும் WhatsApp-இல் தெரிவிப்போம்.',
        'It is waiting for confirmation. We will tell you on WhatsApp once a store confirms.') + '</p>' +
      '<div class="action-row"><a class="btn btn-wide" href="#poojas">' + bi('பூஜைப் பட்டியல்', 'Pooja list') + '</a></div></section></div>';
    window.scrollTo(0, 0);
  }

  // ---------- Entry ----------
  function render(box, p, d, kind, color) {
    return A.currentUser().then(function (u) {
      if (!u) {
        try { localStorage.setItem(RETURN_KEY, '#pooja/' + p.slug + '/order'); } catch (e) { /* session only */ }
        box.innerHTML = '<div class="pj od">' + head(p, 1) + '<section class="pj-card"><p>' + msg('login') + '</p>' +
          '<div class="action-row"><a class="btn btn-wide" href="#login">' + bi('உள்நுழை / பதிவு செய்', 'Log in / Register') + '</a></div></section></div>';
        return;
      }
      if (!st || st.slug !== p.slug) {
        var keys = d.samagri.length && d.samagri[0].key ? d.samagri.map(function (s) { return s.key; }) : O.kindKeys(kind);
        st = { slug: p.slug, rows: O.defaults(keys), notes: '', pin: '', address: '', needed: '', time: '', color: color };
      }
      edit(box, p);
      window.scrollTo(0, 0);
    });
  }

  // Re-sort the "add item" list when the language is switched.
  new MutationObserver(fillPick).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  window.SAOrderPage = { render: render };
})();
