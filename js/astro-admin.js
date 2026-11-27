/* Sankalpam — Astrology admin page (#astro-admin): review the chart, write the reply, send, WhatsApp buttons. */
(function () {
  'use strict';
  var U = window.SAAstroUI, DB = window.SADB, A = window.SAAstro;
  var box = document.getElementById('astro-admin-box');
  if (!U || !DB || !box) return;
  var esc = U.esc, bi = U.bi;
  var data = null, open = null, filter = 'todo', msgs = '';
  var SITE = 'sankalpam.pro';

  function two(n) { return n < 10 ? '0' + n : '' + n; }
  function fdate(s) { var d = new Date(s); return two(d.getDate()) + '-' + two(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()); }
  var ST = { awaiting_payment: ['கட்டணம் காத்திருப்பு', 'Awaiting payment'], 'new': ['புதியது', 'New'], in_review: ['பார்வையில்', 'In review'], answered: ['பதில் அனுப்பப்பட்டது', 'Answered'] };

  function load() {
    return DB.rpc('sa_admin_astro_list', { p_token: DB.token() }).then(function (r) { data = r; render(); }).catch(function () { data = { ok: false }; render(); });
  }

  function listHtml() {
    var items = (data.items || []).filter(function (x) {
      return filter === 'all' ? true : filter === 'done' ? x.status === 'answered' : x.status !== 'answered';
    });
    var cnt = function (f) { return (data.items || []).filter(function (x) { return f === 'done' ? x.status === 'answered' : f === 'todo' ? x.status !== 'answered' : true; }).length; };
    var s = data.settings || {};
    var out = '<h1>' + bi('ஜோதிடர் ஆலோசனை — நிர்வாகம்', 'Astrology consultations — admin') + '</h1>' +
      '<p class="as-note">' + bi('இலவச இடங்கள் மீதம் (இந்த வாரம்): ', 'Free slots left (this week): ') + '<b>' + (s.free_left == null ? '-' : s.free_left) + '</b> · ' + bi('கட்டணம்', 'Fee') + ' ₹' + (s.price || '-') + '</p>' +
      '<div class="as-tabs">' + [['todo', 'செய்ய வேண்டியவை', 'To do'], ['done', 'முடிந்தவை', 'Answered'], ['all', 'எல்லாம்', 'All']].map(function (t) {
        return '<a href="#astro-admin" data-f="' + t[0] + '" class="' + (filter === t[0] ? 'is-on' : '') + '">' + bi(t[1], t[2]) + ' (' + cnt(t[0]) + ')</a>'; }).join('') + '</div>';
    if (!items.length) out += '<p>' + bi('கோரிக்கைகள் இல்லை.', 'No requests here.') + '</p>';
    out += items.map(function (x) {
      var p = x.payload || {}, st = ST[x.status] || ['', ''];
      return '<button type="button" class="as-card" data-open="' + esc(x.id) + '"><b>' + esc(p.name) + '</b> <small>' + fdate(x.created_at) + '</small> ' +
        '<span class="as-badge s-' + x.status + '">' + bi(st[0], st[1]) + '</span> ' + (x.free ? '<span class="as-badge">' + bi('இலவசம்', 'Free') + '</span>' : '<span class="as-badge">₹' + x.amount + (x.paid ? ' ✓' : x.pay_ref ? ' ref' : '') + '</span>') +
        '<span class="as-card-q">' + esc((p.questions || []).join(' | ')) + '</span></button>';
    }).join('');
    out += '<details class="as-set"><summary>' + bi('கட்டணம் & இட அமைப்பு', 'Fee & slot settings') + '</summary><form id="aa-set">' +
      '<label class="field"><span>' + bi('கட்டணம் (₹)', 'Flat fee (₹)') + '</span><input name="price" type="number" min="0" max="5000" value="' + (s.price || 199) + '"></label>' +
      '<label class="field"><span>' + bi('வாரம் இலவச இடங்கள்', 'Free slots per week') + '</span><input name="free" type="number" min="0" max="100" value="' + (s.free_per_week == null ? 10 : s.free_per_week) + '"></label>' +
      '<label class="field"><span>' + bi('கட்டண வாசிப்பில் கேள்விகள்', 'Questions in a paid reading') + '</span><input name="q" type="number" min="1" max="10" value="3"></label>' +
      '<button class="btn btn-outline" type="submit">' + bi('சேமி', 'Save') + '</button> <span class="form-msg"></span></form></details>';
    return out;
  }

  function detailHtml(x) {
    var p = x.payload || {}, c = null, lang = (x.reply && x.reply.lang) || p.lang || 'ta', i, rp = x.reply || {};
    try { c = U.chartFromInput(p.input); } catch (e) { c = null; }
    var tk = p.tob_known !== false;
    var vmap = { yes: ['ஆம் (பொருந்துகிறது)', 'Yes (matches)'], no: ['இல்லை (வேறுபடுகிறது)', 'No (differs)'], unsure: ['தெரியவில்லை', "Doesn't know"] };
    var v = vmap[p.verify] || ['', ''];
    var known = '';
    if (p.verify === 'no') known = ' — ' + bi('வாடிக்கையாளர் கூறும் ராசி/நட்சத்திரம்: ', 'Customer says rasi/star: ') + (p.known_rasi !== '' && p.known_rasi != null ? A.RASI_TA[p.known_rasi] : '-') + ' / ' + (p.known_star !== '' && p.known_star != null ? A.NAK_TA[p.known_star] : '-');
    var out = '<button type="button" class="ad-back" data-back="1">‹ ' + bi('பட்டியல்', 'List') + '</button>' +
      '<h2>' + esc(p.name) + ' <small>(' + esc(x.account_name) + ' · ' + esc(x.mobile) + ')</small></h2>' +
      '<div class="as-facts"><div class="as-row"><span class="as-l">' + bi('பிறப்பு', 'Birth') + '</span><b>' + esc(p.dob) + (tk ? ' ' + esc(p.tob) : ' (' + (lang === 'en' ? 'time unknown' : 'நேரம் தெரியாது') + ')') + ' · ' + esc(p.place) + ' / ' + esc(p.place_en) + ' · ' + (p.gender === 'M' ? 'M' : p.gender === 'F' ? 'F' : '') + '</b></div>' +
      '<div class="as-row"><span class="as-l">' + bi('வாடிக்கையாளர் சரிபார்ப்பு', 'Customer check') + '</span><b>' + bi(v[0], v[1]) + '</b>' + known + '</div>' +
      '<div class="as-row"><span class="as-l">' + bi('பதில் மொழி', 'Reply language') + '</span><b>' + (p.lang === 'en' ? 'English' : 'தமிழ்') + '</b></div></div>';
    if (c) out += U.chartBlock(c, tk) + U.kattamPair(c) + planetTable(c);
    out += '<h3>' + bi('கேள்விகள்', 'Questions') + '</h3><ol class="as-ql">' + (p.questions || []).map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>';
    // payment
    if (!x.free) {
      out += '<div class="as-pay"><b>' + bi('கட்டணம்', 'Payment') + ' ₹' + x.amount + '</b> — ' + (x.paid ? '<span class="as-badge s-answered">' + bi('பெறப்பட்டது', 'Received') + '</span>' : '<span class="as-badge s-awaiting_payment">' + bi('நிலுவை', 'Pending') + '</span>') +
        ' · UTR: <b>' + esc(x.pay_ref || '-') + '</b><br>' +
        '<button type="button" class="btn btn-outline" data-paid="' + (x.paid ? '0' : '1') + '" data-id="' + esc(x.id) + '">' + (x.paid ? bi('பெறவில்லை என குறி', 'Mark not paid') : bi('பணம் பெறப்பட்டது ✓', 'Mark paid ✓')) + '</button> ' +
        '</div>';
    }
    // reply form
    var lng = rp.lang || p.lang || 'ta';
    var basic = rp.basic != null ? rp.basic : (c ? U.basicText(c, lng, tk) : '');
    var answers = (p.questions || []).map(function (q, idx) {
      var ex = (rp.answers || [])[idx];
      return '<label class="field"><span>' + (idx + 1) + '. ' + esc(q) + '</span><textarea name="a' + idx + '" rows="5">' + esc(ex ? ex.a : '') + '</textarea></label>';
    }).join('');
    out += '<form id="aa-reply" data-id="' + esc(x.id) + '"><h3>' + bi('உங்கள் பதில்', 'Your reply') + '</h3>' +
      '<label class="field"><span>' + bi('பதில் மொழி', 'Reply language') + '</span><select name="lang"><option value="ta"' + (lng === 'ta' ? ' selected' : '') + '>தமிழ்</option><option value="en"' + (lng === 'en' ? ' selected' : '') + '>English</option></select></label>' +
      '<label class="field"><span>' + bi('அடிப்படை விவரம் (தானாக நிரப்பப்பட்டது; திருத்தலாம்)', 'Basic details (auto-filled; edit if needed)') + '</span><textarea name="basic" rows="4">' + esc(basic) + '</textarea></label>' +
      answers +
      '<label class="field"><span>' + bi('பரிகாரம் / வழிகாட்டுதல்', 'Pariharam / guidance') + '</span><textarea name="parihara" rows="5">' + esc(rp.parihara || '') + '</textarea></label>' +
      '<label class="field"><span>' + bi('குறிப்பு (விருப்பம்)', 'Closing note (optional)') + '</span><textarea name="remarks" rows="3">' + esc(rp.remarks || '') + '</textarea></label>' +
      '<label class="field"><span>' + bi('தனிப்பட்ட குறிப்பு (வாடிக்கையாளருக்குத் தெரியாது)', 'Private notes (customer never sees)') + '</span><textarea name="notes" rows="3">' + esc(x.notes || '') + '</textarea></label>' +
      '<p class="form-msg" id="aa-m"></p>' +
      '<button type="submit" class="btn btn-outline" data-send="0">' + bi('வரைவாகச் சேமி', 'Save draft') + '</button> ' +
      '<button type="submit" class="btn" data-send="1">' + (x.status === 'answered' ? bi('புதுப்பித்து அனுப்பு', 'Update & send') : bi('வாடிக்கையாளருக்கு அனுப்பு', 'Send to customer')) + '</button></form>';
    if (x.status === 'answered') {
      out += '<p class="as-pay">' + bi('பதில் இணையதளத்தில் வெளியிடப்பட்டது. வாடிக்கையாளருக்கு தகவல் அனுப்பவும்:', 'The reading is live on the site. Tell the customer:') + '<br>' +
        '<details><summary>' + bi('வாடிக்கையாளர் பார்வை', 'Customer view') + '</summary>' + U.readingHtml(x) + '</details>';
    } else {
      out += '<p class="soon">' + bi('வாடிக்கையாளருடன் தொடர்பு கொள்ள இணையதள விவரங்களைப் பயன்படுத்தவும்.', 'Contact the customer through the details on this page.') + '</p>';
    }
    return out;
  }

  function planetTable(c) {
    var rows = A.BODY.map(function (k) {
      var pl = c.planets[k], deg = Math.floor(pl.deg), mn = Math.floor((pl.deg - deg) * 60);
      return '<tr><td>' + bi(A.BODY_TA[k], A.BODY_EN[k]) + (pl.retro && k !== 'ra' && k !== 'ke' ? ' (R)' : '') + '</td><td>' + bi(A.RASI_TA[pl.rasi], A.RASI_EN[pl.rasi]) + '</td><td>' + deg + '°' + mn + '′</td><td>' + bi(A.NAK_TA[pl.nak], A.NAK_EN[pl.nak]) + ' ' + pl.pada + '</td><td>' + bi(A.RASI_TA[pl.nav], A.RASI_EN[pl.nav]) + '</td></tr>';
    }).join('');
    return '<div class="table-scroll"><table class="admin-table"><thead><tr><th>' + bi('கிரகம்', 'Planet') + '</th><th>' + bi('ராசி', 'Rasi') + '</th><th>' + bi('பாகை', 'Degree') + '</th><th>' + bi('நட்சத்திரம்', 'Star') + '</th><th>' + bi('நவாம்சம்', 'Navamsa') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function render() {
    if (!data) { box.innerHTML = '<p>…</p>'; return; }
    if (!data.ok) { box.innerHTML = '<h1>' + bi('ஜோதிடர் ஆலோசனை — நிர்வாகம்', 'Astrology admin') + '</h1><p>' + bi('நிர்வாகியாக உள்நுழையவும் (அல்லது migration_v8_astrology.sql இயக்கப்படவில்லை).', 'Log in as admin (or migration_v8_astrology.sql has not been run yet).') + '</p><p><a class="btn" href="#login">' + bi('உள்நுழை', 'Log in') + '</a></p>'; return; }
    var x = open && (data.items || []).filter(function (i) { return i.id === open; })[0];
    box.innerHTML = x ? detailHtml(x) : listHtml();
  }

  box.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open],[data-back],[data-f],[data-paid]');
    if (!t) return;
    if (t.hasAttribute('data-f')) { e.preventDefault(); filter = t.getAttribute('data-f'); return render(); }
    if (t.hasAttribute('data-open')) { open = t.getAttribute('data-open'); render(); return window.scrollTo(0, 0); }
    if (t.hasAttribute('data-back')) { open = null; return render(); }
    if (t.hasAttribute('data-paid')) {
      DB.rpc('sa_admin_astro_mark_paid', { p_token: DB.token(), p_id: t.getAttribute('data-id'), p_paid: t.getAttribute('data-paid') === '1' }).then(load);
    }
  });
  box.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'aa-set') {
      e.preventDefault(); var d = new FormData(f), m = f.querySelector('.form-msg');
      DB.rpc('sa_admin_astro_settings', { p_token: DB.token(), p_price: +d.get('price'), p_free: +d.get('free'), p_q: +d.get('q') }).then(function (r) { m.textContent = r && r.ok ? '✓' : 'Error'; if (r && r.ok) load(); });
    }
    if (f.id === 'aa-reply') {
      e.preventDefault();
      var send = e.submitter && e.submitter.getAttribute('data-send') === '1', fd = new FormData(f), x = (data.items || []).filter(function (i) { return i.id === f.getAttribute('data-id'); })[0];
      var answers = (x.payload.questions || []).map(function (q, i) { return { q: q, a: String(fd.get('a' + i) || '').trim() }; });
      if (send && answers.some(function (a) { return !a.a; })) { var mm = document.getElementById('aa-m'); mm.className = 'form-msg is-error'; mm.textContent = 'எல்லா கேள்விகளுக்கும் பதில் எழுதவும் / Please answer every question'; return; }
      var reply = { lang: fd.get('lang'), basic: String(fd.get('basic') || '').trim(), answers: answers, parihara: String(fd.get('parihara') || '').trim(), remarks: String(fd.get('remarks') || '').trim() };
      DB.rpc('sa_admin_astro_save', { p_token: DB.token(), p_id: x.id, p_reply: reply, p_notes: String(fd.get('notes') || ''), p_send: !!send }).then(function (r) {
        if (r && r.ok) return load();
        var mm = document.getElementById('aa-m'); mm.className = 'form-msg is-error';
        mm.textContent = r && r.error === 'unpaid' ? 'பணம் பெறப்படவில்லை — முதலில் "பணம் பெறப்பட்டது" குறிக்கவும் / Payment not marked received yet' : 'Error';
      });
    }
  });

  function maybeLoad() { if ((location.hash || '').indexOf('#astro-admin') === 0) { open = null; load(); } }
  window.addEventListener('hashchange', maybeLoad);
  maybeLoad();
})();
