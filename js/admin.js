(function () {
  'use strict';

  var DB = window.SADB;
  var A = window.SAAuth;
  var PD = window.SAPartners;
  var bi = PD.bi, esc = PD.esc;
  var C = window.SAContent;
  var pcSlug = '', pcLang = 'ta';

  var ORDER_STATUS = {
    waiting_for_confirmation: ['உறுதிப்படுத்தலுக்காகக் காத்திருக்கிறது', 'Waiting for Confirmation'],
    confirmed_dispatched: ['உறுதி செய்யப்பட்டது / அனுப்பப்பட்டது', 'Confirmed / Dispatched'],
    unavailable: ['கிடைக்கவில்லை', 'Unavailable']
  };

  // [Tamil, English]
  var NOTICE = {
    pick_store: ['உறுதி செய்ய ஒரு கடையைத் தேர்ந்தெடுக்கவும்.', 'Choose a blind tie-up store to confirm.'],
    no_store: ['இந்த PIN குறியீட்டில் செயலில் உள்ள கடை இல்லை. முதலில் கடையைச் சேர்க்கவும்.', 'No active store for this PIN. Add a store first.'],
    vendor_bad: ['பெயர், 10 இலக்க மொபைல் எண் மற்றும் 6 இலக்க PIN தேவை.', 'Name, a 10-digit mobile and a 6-digit PIN are required.'],
    saved: ['சேமிக்கப்பட்டது.', 'Saved.'],
    confirmed: ['ஆர்டர் உறுதி செய்யப்பட்டது. செய்தி வரிசையில் உள்ளது.', 'Order confirmed. Message queued.'],
    unavailable: ['கிடைக்கவில்லை எனக் குறிக்கப்பட்டது. செய்தி வரிசையில் உள்ளது.', 'Marked unavailable. Message queued.'],
    paid: ['கட்டணம் பதிவு செய்யப்பட்டது.', 'Fee recorded as paid.'],
    test_sent: ['சோதனைச் செய்திகள் வரிசையில் சேர்க்கப்பட்டன.', 'Test messages added to the queue.'],
    not_admin: ['நிர்வாகப் பக்கத்தைப் பார்க்க நிர்வாகி கணக்கில் உள்நுழையவும்.', 'Log in with an admin account to open this page.'],
    offer_saved: ['செய்தி சேமிக்கப்பட்டது.', 'Message saved.'],
    offer_need: ['முதலில் தலைப்பு மற்றும் செய்தியை எழுதவும்.', 'Write a title and a message first.'],
    offer_deleted: ['செய்தி நீக்கப்பட்டது.', 'Message deleted.'],
    dates_saved: ['தேதிகள் சேர்க்கப்பட்டன.', 'Dates added.'],
    dates_bad: ['தேதியைச் சரியாகத் தேர்ந்தெடுக்கவும்.', 'Please choose valid dates.'],
    copied: ['நகலெடுக்கப்பட்டது.', 'Copied.'],
    fees_queued: ['கட்டண நினைவூட்டல் மின்னஞ்சல்கள் அனுப்பப்படுகின்றன.', 'Fee reminder emails are being sent.'],
    upi_saved: ['UPI விவரங்கள் சேமிக்கப்பட்டன.', 'UPI details saved.'],
    bulk_done: ['பதிவேற்றம் முடிந்தது.', 'Upload finished.'],
    fail: ['சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not save. Please try again.']
  };

  var last = null;                 // last loaded dashboard data
  var pinFilter = { order: '', booking: '' };
  var offer = { id: null, title: '', ta: '', en: '', image: '', lang: 'ta', off: {}, sent: {}, q: '' };
  var custQ = '', adminUser = null, calRows = [];
  var fullP = {}, followData = null, bookPrefs = {}, offersList = [], editVendor = null, editOffer = null, offerImage = null, partnerPhoto = null;
  var contactData = { messages: [], new_count: 0 };
  var helpReqData = { requests: [], open_count: 0 };
  var tab = 'home'; // home | orders | bookings | people | stores | poojas | messages | settings
  var orderFilter = 'waiting_for_confirmation';
  var bookingFilter = 'soon';
  var peopleFilter = 'approve';

  // [key, icon, Tamil, English]
  var SECTIONS = [
    ['home', '🏠', 'முகப்பு', 'Home'],
    ['orders', '📦', 'பூஜைப் பொருள் ஆர்டர்கள்', 'Samagri orders'],
    ['bookings', '📅', 'வாத்தியார் / சமையல் முன்பதிவுகள்', 'Priest & cook bookings'],
    ['followup', '📞', 'கருத்து & பின்தொடர்தல்', 'Feedback & follow-up'],
    ['people', '🙏', 'வாத்தியார்கள் & சமையலர்கள்', 'Priests & Cooks'],
    ['addpeople', '➕', 'வாத்தியார் / சமையலர் சேர்', 'Add priest / cook'],
    ['stores', '🏪', 'பொருட்கள் கடைகள்', 'Pooja stores'],
    ['poojas', '🪔', 'பூஜை பட்டியல்', 'Pooja list'],
    ['poojacontent', '📝', 'பூஜை விவரங்கள் (திருத்த)', 'Pooja content (edit)'],
    ['calendar', '🗓', 'பூஜை தேதிகள் (பஞ்சாங்கம்)', 'Pooja dates (calendar)'],
    ['customers', '👥', 'வாடிக்கையாளர்கள்', 'Customers'],
    ['combos', '🎁', 'சிறப்பு நாள் தொகுப்புகள் (Combos)', 'Special-day combos'],
    ['soon', '🔔', 'விரைவில் வரும் உரைகள்', 'Coming-soon texts'],
    ['helpmsgs', '✉', 'உதவி & பரிந்துரைகள்', 'Help & suggestions'],
    ['helprequests', '🛟', 'உதவி மையம் கோரிக்கைகள்', 'Help Centre requests'],
    ['settings', '⚙', 'அமைப்புகள்', 'Settings']
  ];

  function $(id) { return document.getElementById(id); }

  function digits(v) { return String(v || '').replace(/\D/g, '').slice(0, 6); }

  function phoneLine(n) { return n ? '+91 ' + esc(n) : '—'; }

  function nameBi(p) {
    p = p || {};
    return bi(esc(p.name_ta || p.name_en || ''), esc(p.name_en || p.name_ta || ''));
  }

  function showNotice(ta, en, isError) {
    var el = $('admin-notice');
    if (!el) return;
    el.innerHTML = bi(ta, en);
    el.classList.toggle('is-error', !!isError);
    el.classList.toggle('is-ok', !isError);
    el.hidden = false;
  }

  // Runs a server action, re-reads the dashboard, then shows the result. r.ok false shows the error.
  function after(p, ta, en) {
    return p.then(function (r) {
      if (r && r.ok === false) throw new Error(r.error);
      return render();
    }).then(function () { if (ta) showNotice(ta, en, false); })
      .catch(function () { showNotice(NOTICE.fail[0], NOTICE.fail[1], true); });
  }

  function loadAll() {
    var t = DB.token();
    // The new lists come from the v4 database functions; if they are not installed yet, the older screens still work.
    var soft = function (name) { return DB.rpc(name, { p_token: t }).catch(function () { return null; }); };
    return Promise.all([DB.rpc('sa_admin_dashboard', { p_token: t }), soft('sa_admin_list_vendors_full'), soft('sa_admin_list_partners_full'),
      tab === 'combos' ? soft('sa_admin_list_offers') : Promise.resolve(null),
      tab === 'followup' ? soft('sa_admin_followup') : Promise.resolve(null),
      tab === 'bookings' ? soft('sa_admin_booking_prefs') : Promise.resolve(null),
      tab === 'helpmsgs' ? soft('sa_admin_list_contact') : Promise.resolve(null),
      tab === 'helprequests' ? soft('sa_admin_list_help_requests') : Promise.resolve(null)]).then(function (res) {
      var d = res[0];
      if (d && d.ok && res[1] && res[1].ok) d.vendors = res[1].vendors;
      fullP = {};
      if (res[2] && res[2].ok) res[2].partners.forEach(function (x) { fullP[x.id] = x; });
      offersList = res[3] && res[3].ok ? res[3].offers : [];
      followData = res[4] && res[4].ok ? res[4] : null;
      bookPrefs = res[5] && res[5].ok ? res[5].prefs : {};
      contactData = res[6] && res[6].ok ? res[6] : { messages: [], new_count: 0 };
      helpReqData = res[7] && res[7].ok ? res[7] : { requests: [], open_count: 0 };
      return d;
    });
  }

  // ---------- Date helpers (browser date, India) ----------
  function ymd(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function dayStr(offset) { var d = new Date(); d.setDate(d.getDate() + offset); return ymd(d); }

  // Confirmation prompt in the language the admin is reading.
  function ask(ta, en) {
    return window.confirm(document.documentElement.getAttribute('data-lang') === 'en' ? en : ta);
  }

  function realPartners(d) { return d.partners.filter(function (p) { return !p.is_sample; }); }
  function waitingOrders(d) { return d.orders.filter(function (o) { return o.status === 'waiting_for_confirmation'; }); }
  function soonBookings(d) {
    var t = dayStr(0), n = dayStr(1);
    return d.bookings.filter(function (b) {
      return (b.event_date === t || b.event_date === n) && (b.status === 'requested' || b.status === 'accepted');
    });
  }
  function toApprove(d) { return realPartners(d).filter(function (p) { return !p.is_approved; }); }
  function feesDue(d) { return realPartners(d).filter(function (p) { return p.status === 'due' || p.status === 'hidden'; }); }

  // ---------- Home: what needs the admin today ----------
  function todoCard(n, ta, en, subTa, subEn, tabKey, filter, hot) {
    return '<button type="button" class="ad-todo' + (hot && n ? ' is-hot' : '') + '" data-act="tab" data-tab="' + tabKey + '"' +
      (filter ? ' data-filter="' + filter + '"' : '') + '>' +
      '<span class="ad-num' + (n ? '' : ' is-zero') + '">' + n + '</span>' +
      '<span class="ad-todo-text"><strong>' + bi(ta, en) + '</strong><small>' + bi(subTa, subEn) + '</small></span>' +
      '<span class="ad-go" aria-hidden="true">›</span></button>';
  }

  function homeSection(d) {
    var tile = function (n, ta, en) {
      return '<div class="stat"><strong>' + n + '</strong><span>' + bi(ta, en) + '</span></div>';
    };
    return '<h1>' + bi('வணக்கம், நிர்வாகி', 'Welcome, Admin') + '</h1>' +
      '<p class="ad-sub">' + bi('இன்று உங்கள் கவனம் தேவைப்படுவது:', 'What needs you today:') + '</p>' +
      '<div class="ad-todo-grid">' +
        todoCard(waitingOrders(d).length, 'காத்திருக்கும் ஆர்டர்கள்', 'Orders waiting', 'உறுதி செய்ய வேண்டும்', 'Confirm or mark unavailable', 'orders', 'waiting_for_confirmation', true) +
        todoCard(soonBookings(d).length, 'இன்று / நாளை முன்பதிவுகள்', 'Bookings today / tomorrow', 'வாத்தியார் & சமையல்', 'Priests & cooks', 'bookings', 'soon', false) +
        todoCard(toApprove(d).length, 'புதிய அங்கீகாரம்', 'New approvals', 'வாத்தியார் / சமையலர்', 'Priests / cooks waiting', 'people', 'approve', true) +
        todoCard(feesDue(d).length, 'கட்டணம் நிலுவை', 'Fees pending', 'இந்த மாதம்', 'This month', 'people', 'fees', false) +
      '</div>' +
      '<p><a class="btn" href="#astro-admin">🔮 ' + bi('ஜோதிடர் ஆலோசனை கோரிக்கைகள்', 'Astrology consultation requests') + '</a></p>' +
      '<h2 class="ad-menu-h">' + bi('எல்லா பகுதிகள்', 'All sections') + '</h2>' +
      '<div class="ad-menu">' + SECTIONS.slice(1).map(function (s) {
        return '<button type="button" class="ad-menu-btn" data-act="tab" data-tab="' + s[0] + '"><span class="ad-ic" aria-hidden="true">' + s[1] + '</span>' + bi(s[2], s[3]) + '</button>';
      }).join('') + '</div>' +
      '<h2>' + bi('சுருக்கம்', 'Summary') + '</h2>' +
      '<div class="stat-grid">' +
        tile(d.counts.customers, 'வாடிக்கையாளர்கள்', 'Customers') +
        tile(d.counts.priests, 'வாத்தியார்கள்', 'Priests') +
        tile(d.counts.cooks, 'சமையலர்கள்', 'Cooks') +
        tile(d.counts.stores, 'கடைகள்', 'Pooja stores') +
      '</div>';
  }

  // ---------- Filter chips ----------
  function chips(group, current, items) {
    return '<div class="ad-chips" role="group">' + items.map(function (it) {
      return '<button type="button" class="ad-chip' + (current === it[0] ? ' is-on' : '') + '" data-act="chip" data-group="' + group +
        '" data-value="' + it[0] + '">' + bi(it[1], it[2]) + (it[3] != null ? ' (' + it[3] + ')' : '') + '</button>';
    }).join('') + '</div>';
  }

  // ---------- Samagri orders ----------
  function ordersSection(d) {
    var n = function (s) { return d.orders.filter(function (o) { return o.status === s; }).length; };
    return '<h1>' + bi('பொருட்கள் ஆர்டர்கள்', 'Samagri orders') + '</h1>' +
      chips('order', orderFilter, [
        ['waiting_for_confirmation', 'காத்திருக்கும்', 'Waiting', n('waiting_for_confirmation')],
        ['confirmed_dispatched', 'உறுதி', 'Confirmed', n('confirmed_dispatched')],
        ['unavailable', 'கிடைக்கவில்லை', 'Unavailable', n('unavailable')],
        ['all', 'எல்லாம்', 'All', d.orders.length]
      ]) +
      '<label class="field"><span class="ta">PIN குறியீடு மூலம் தேடு</span><span class="en">Search by PIN code</span>' +
        '<input id="order-pin" type="text" inputmode="numeric" maxlength="6" placeholder="600126" value="' + esc(pinFilter.order) + '"></label>' +
      '<div id="orders-list"></div>';
  }

  function orderCard(o, d) {
    var st = ORDER_STATUS[o.status] || ['', ''];
    var done = o.status === 'confirmed_dispatched';
    var contact = done
      ? '<p><strong>' + bi('வாடிக்கையாளர்', 'Customer') + ':</strong> ' + esc(o.customer_name) + ' · ' + phoneLine(o.customer_mobile) + '</p>' +
        '<p><strong>' + bi('கடை', 'Store') + ':</strong> ' + esc(o.vendor_name || '') + ' · ' + phoneLine(o.vendor_phone) + '</p>'
      : '<p class="ad-lock">🔒 ' + bi('தொடர்பு எண்கள் உறுதிப்படுத்திய பின் காட்டப்படும்.', 'Phone numbers show after confirming.') + '</p>';

    var actions = '';
    if (o.status === 'waiting_for_confirmation') {
      var stores = d.vendors.filter(function (v) { return v.is_active && (v.pin_code === o.pin_code || (v.deliver_nearby && (v.service_pins || []).indexOf(o.pin_code) !== -1)); });
      if (stores.length) {
        actions = '<label class="field"><span class="ta">கடையைத் தேர்ந்தெடு</span><span class="en">Choose store</span>' +
          '<select id="store-' + esc(o.id) + '">' + stores.map(function (v) {
            return '<option value="' + esc(v.id) + '">' + esc(v.name) + ' · +91 ' + esc(v.phone) + '</option>';
          }).join('') + '</select></label>' +
          '<div class="ad-btns"><button type="button" class="btn ad-ok" data-act="confirm-order" data-id="' + esc(o.id) + '">✔ ' +
          bi('உறுதி செய் / அனுப்பு', 'Confirm / Dispatch') + '</button>' +
          '<button type="button" class="btn btn-outline" data-act="unavailable-order" data-id="' + esc(o.id) + '">' +
          bi('கிடைக்கவில்லை', 'Unavailable') + '</button></div>';
      } else {
        actions = '<p class="ad-lock is-warn">⚠ ' + bi(NOTICE.no_store[0], NOTICE.no_store[1]) + '</p>' +
          '<div class="ad-btns"><button type="button" class="btn btn-outline" data-act="tab" data-tab="stores">+ ' + bi('கடையைச் சேர்', 'Add store') + '</button>' +
          '<button type="button" class="btn btn-outline" data-act="unavailable-order" data-id="' + esc(o.id) + '">' + bi('கிடைக்கவில்லை', 'Unavailable') + '</button></div>';
      }
    }

    return '<article class="ad-card">' +
      '<div class="ad-card-top"><h3>' + nameBi({ name_ta: o.pooja_ta, name_en: o.pooja_en }) + '</h3>' +
        '<span class="badge' + (o.status === 'waiting_for_confirmation' ? ' ad-wait' : '') + '">' + bi(st[0], st[1]) + '</span></div>' +
      '<div class="badges"><span class="badge">PIN ' + esc(o.pin_code || '—') + '</span>' +
        '<span class="badge">' + esc((o.created_at || '').slice(0, 10)) + '</span></div>' +
      (o.delivery_address ? '<p>📍 <strong>' + bi('முகவரி', 'Address') + ':</strong> ' + esc(o.delivery_address) + '</p>' : '') +
      (o.needed_by ? '<p>📅 <strong>' + bi('தேவைப்படும் தேதி', 'Needed by') + ':</strong> ' + esc(o.needed_by) + '</p>' : '') +
      (o.items && o.items.length ? '<ul class="ad-items">' + o.items.map(function (i) {
        return '<li>' + bi(esc(i.ta), esc(i.en)) + ' — <strong>' + bi(esc(i.qty + ' ' + i.unit_ta), esc(i.qty + ' ' + i.unit_en)) + '</strong></li>';
      }).join('') + '</ul>' : '') +
      (o.notes ? '<p>📝 <strong>' + bi('வாடிக்கையாளர் கருத்து', 'Customer comments') + ':</strong> ' + esc(o.notes) + '</p>' : '') +
      contact + actions + '</article>';
  }

  function renderOrders(d) {
    var rows = d.orders.filter(function (o) {
      return (orderFilter === 'all' || o.status === orderFilter) &&
        (!pinFilter.order || String(o.pin_code || '').indexOf(pinFilter.order) === 0);
    });
    $('orders-list').innerHTML = rows.length
      ? rows.map(function (o) { return orderCard(o, d); }).join('')
      : '<p class="ad-empty">' + bi('இந்தப் பட்டியலில் ஆர்டர்கள் இல்லை.', 'No orders in this list.') + '</p>';
  }

  // ---------- Priest / Cook bookings ----------
  function bookingsSection(d) {
    var t = dayStr(0), n = dayStr(1);
    var cnt = function (f) { return d.bookings.filter(f).length; };
    return '<h1>' + bi('முன்பதிவுகள்', 'Bookings') + '</h1>' +
      chips('booking', bookingFilter, [
        ['soon', 'இன்று / நாளை', 'Today / Tomorrow', cnt(function (b) { return b.event_date === t || b.event_date === n; })],
        ['upcoming', 'வரவிருப்பவை', 'Upcoming', cnt(function (b) { return b.event_date > n; })],
        ['past', 'முடிந்தவை', 'Past', cnt(function (b) { return b.event_date < t; })],
        ['all', 'எல்லாம்', 'All', d.bookings.length]
      ]) +
      '<label class="field"><span class="ta">PIN குறியீடு மூலம் தேடு</span><span class="en">Search by PIN code</span>' +
        '<input id="booking-pin" type="text" inputmode="numeric" maxlength="6" placeholder="600126" value="' + esc(pinFilter.booking) + '"></label>' +
      '<div id="bookings-list"></div>';
  }

  function renderBookings(d) {
    var t = dayStr(0), n = dayStr(1);
    var rows = d.bookings.filter(function (b) {
      var okDate = bookingFilter === 'all' ||
        (bookingFilter === 'soon' && (b.event_date === t || b.event_date === n)) ||
        (bookingFilter === 'upcoming' && b.event_date > n) ||
        (bookingFilter === 'past' && b.event_date < t);
      return okDate && (!pinFilter.booking || String(b.pin_code || '').indexOf(pinFilter.booking) === 0);
    });
    $('bookings-list').innerHTML = rows.length
      ? rows.map(function (b) {
          var st = PD.STATUS[b.status] || ['', ''];
          return '<article class="ad-card">' +
            '<div class="ad-card-top"><h3>' + esc(b.customer_name || '') + ' → ' + nameBi(b) + '</h3>' +
              '<span class="badge' + (b.status === 'requested' ? ' ad-wait' : '') + '">' + bi(st[0], st[1]) + '</span></div>' +
            '<div class="badges"><span class="badge">' + bi(PD.ROLE[b.service_type][0], PD.ROLE[b.service_type][1]) + '</span>' +
              '<span class="badge">PIN ' + esc(b.pin_code || '—') + '</span>' +
              '<span class="badge">' + esc(b.event_date) + '</span></div>' +
            '<p>' + nameBi({ name_ta: b.pooja_ta, name_en: b.pooja_en }) + (b.event_time ? ' · 🕐 ' + esc(b.event_time) : '') + '</p>' +
            (bookPrefs[b.id] ? '<p class="soon">' + prefsLine(bookPrefs[b.id]) + '</p>' : '') +
            (b.venue_address ? '<p>📍 ' + esc(b.venue_address) + '</p>' : '') +
            (b.notes ? '<p>📝 ' + esc(b.notes) + '</p>' : '') +
            '<p class="soon">' + bi('நிர்வாகி பார்வைக்கு மட்டும். ஏற்பு, நிராகரிப்பு மற்றும் நிறைவு வாத்தியார் / சமையலரால் மட்டுமே.', 'View only for admin. Accept, decline and completion are done by the priest or cook.') + '</p>' + '</article>';
        }).join('')
      : '<p class="ad-empty">' + bi('இந்தப் பட்டியலில் முன்பதிவுகள் இல்லை.', 'No bookings in this list.') + '</p>';
  }

  // ---------- Priests & Cooks: approve, hide, record fees ----------
  function prefsLine(pf) {
    var out = [];
    if (pf.tradition && PD.SAMP[pf.tradition]) out.push(bi('மரபு: ', 'Tradition: ') + bi(PD.SAMP[pf.tradition][0], PD.SAMP[pf.tradition][1]));
    if (pf.guests) out.push(bi('நபர்கள்: ', 'Guests: ') + esc(pf.guests));
    if (pf.meal && PD.MEAL[pf.meal]) out.push(bi(PD.MEAL[pf.meal][0], PD.MEAL[pf.meal][1]));
    if (pf.guests) out.push(pf.kitchen ? bi('சமையலறை உள்ளது', 'Kitchen available') : bi('சமையலறை இல்லை', 'No kitchen'));
    return out.join(' · ');
  }
  var RATE = { good: ['👍 நன்று', '👍 Good'], ok: ['😐 சரி', '😐 OK'], bad: ['👎 சரியில்லை', '👎 Not good'] };
  function followupSection() {
    if (!followData) return '<h1>' + bi('கருத்து & பின்தொடர்தல்', 'Feedback & follow-up') + '</h1><p class="ad-empty">' + bi('தரவு இல்லை (v5 SQL இயக்கப்பட்டதா?)', 'No data (has the v5 SQL been run?)') + '</p>';
    var f = followData;
    var calls = f.calls.map(function (c) {
      var rb = function (r) { return '<button type="button" class="btn btn-outline" data-act="rec-fu" data-kind="' + c.kind + '" data-id="' + esc(c.id) + '" data-rating="' + r + '">' + bi(RATE[r][0], RATE[r][1]) + '</button>'; };
      return '<article class="ad-card"><h3>' + esc(c.who || '') + ' · ' + esc(c.pooja || '') + '</h3>' +
        '<p>' + esc(c.when_date) + ' · ' + esc(c.customer_name || '') + '</p>' +
        '<p>📞 ' + bi('வாடிக்கையாளர்', 'Customer') + ': ' + phoneLine(c.customer_mobile) + '</p>' +
        '<p class="soon">' + bi('அழைத்து கேளுங்கள்: சேவை எப்படி இருந்தது? பின் முடிவைப் பதிவு செய்யுங்கள்.', 'Call and ask how it went, then record the answer.') + '</p>' +
        '<div class="ad-btns">' + rb('good') + rb('ok') + rb('bad') + '</div></article>';
    }).join('');
    var fbs = f.feedback.map(function (x) {
      return '<article class="ad-card"><p>' + bi(RATE[x.rating][0], RATE[x.rating][1]) + ' · ' + esc(x.who || '') + ' · ' + esc(x.customer_name || '') + ' <span class="badge">' + (x.source === 'call' ? '📞' : '📱') + '</span></p>' +
        (x.comment ? '<p>' + esc(x.comment) + '</p>' : '') + '</article>';
    }).join('');
    var reps = f.reports.map(function (r) {
      return '<article class="ad-card"><p><span class="badge' + (r.status === 'open' ? ' ad-wait' : '') + '">' + esc(r.status) + '</span> ' + esc(r.kind) + ' · ' + esc(r.customer_name || '') + ' · ' + phoneLine(r.customer_mobile) + '</p><p>' + esc(r.body) + '</p>' +
        (r.status === 'open' ? '<div class="ad-btns"><button type="button" class="btn ad-ok" data-act="resolve-report" data-id="' + esc(r.id) + '">✔ ' + bi('தீர்க்கப்பட்டது', 'Resolved') + '</button></div>' : '') + '</article>';
    }).join('');
    var none = '<p class="ad-empty">' + bi('இல்லை.', 'None.') + '</p>';
    return '<h1>' + bi('கருத்து & பின்தொடர்தல்', 'Feedback & follow-up') + '</h1>' +
      '<h2>⚠ ' + bi('புகார்கள்', 'Problem reports') + '</h2>' + (reps || none) +
      '<h2>📞 ' + bi('அழைக்க வேண்டியவை (கருத்து வரவில்லை)', 'To call (no feedback yet)') + '</h2>' + (calls || none) +
      '<h2>💬 ' + bi('பெற்ற கருத்துகள்', 'Feedback received') + '</h2>' + (fbs || none);
  }

  function peopleSection(d) {
    var all = realPartners(d);
    return '<h1>' + bi('வாத்தியார் & சமையலர்', 'Priests & Cooks') + '</h1>' +
      chips('people', peopleFilter, [
        ['approve', 'அங்கீகாரம் நிலுவை', 'To approve', toApprove(d).length],
        ['fees', 'கட்டணம்', 'Fees due', feesDue(d).length],
        ['all', 'எல்லோரும்', 'All', all.length]
      ]) +
      '<p class="soon">' + bi('புதிய கூட்டாளர்கள் அங்கீகரிக்கப்படும் வரை தேடலில் காட்டப்பட மாட்டார்கள்.', 'New partners stay out of search until approved.') + '</p>' +
      '<div class="action-row"><button type="button" class="btn btn-outline" data-act="fee-reminders">✉ ' +
        bi('கட்டணம் நிலுவை உள்ளவர்களுக்கு மின்னஞ்சல் அனுப்பு', 'Email everyone whose fee is due') + '</button></div>' +
      '<div id="people-list"></div>';
  }

  function renderPeople(d) {
    var rows = realPartners(d).filter(function (p) {
      if (peopleFilter === 'approve') return !p.is_approved;
      if (peopleFilter === 'fees') return p.status === 'due' || p.status === 'hidden';
      return true;
    });
    $('people-list').innerHTML = rows.length ? rows.map(function (p) {
      return '<article class="ad-card"><div class="ad-card-top"><h3>' + nameBi(p) + '</h3>' +
        '<span class="badge' + (p.is_approved ? '' : ' ad-wait') + '">' +
          (p.is_approved ? bi('அங்கீகரிக்கப்பட்டது', 'Approved') : bi('அங்கீகாரம் நிலுவை', 'Awaiting approval')) + '</span></div>' +
        (fullP[p.id] ? '<p>📞 ' + phoneLine(fullP[p.id].phone) + (fullP[p.id].phone2 ? ' · ' + phoneLine(fullP[p.id].phone2) : '') + '</p>' +
          '<p>📍 ' + areasText(fullP[p.id].areas) + '</p>' : '') +
        '<div class="badges"><span class="badge">' + bi(PD.ROLE[p.role][0], PD.ROLE[p.role][1]) + '</span>' +
          (p.is_hidden ? '<span class="badge">' + bi('மறைக்கப்பட்டது', 'Hidden') + '</span>' : '') +
          '<span class="badge">' + esc(p.status) + '</span></div>' +
        (fullP[p.id] && fullP[p.id].plan ? '<p>🧾 ' + esc(fullP[p.id].plan.tier || 'trial') + ' · ' +
          bi('முடிந்த ஆர்டர்கள்', 'Completed orders') + ': ' + fullP[p.id].plan.completed +
          ' · ' + bi('சோதனை முடிவு', 'Trial ends') + ': ' + esc(fullP[p.id].plan.trialEnd || '-') +
          (fullP[p.id].plan.billingStart ? ' · ' + bi('கட்டணம் தொடக்கம்', 'Billing from') + ': ' + esc(fullP[p.id].plan.billingStart) : '') +
          ' · ₹' + (fullP[p.id].plan.fee || 0) + '</p>' : '') +
        (fullP[p.id] ? '<label class="field"><span class="ta">சரிபார்ப்பு நிலை</span><span class="en">Verification level</span><select data-verify="' + esc(p.id) + '">' +
          [0, 1, 2, 3].map(function (n) { return '<option value="' + n + '"' + (fullP[p.id].verify_level === n ? ' selected' : '') + '>' + (n ? n + ' · ' + PD.VERIFY[n][1] : '0 · ' + 'Not verified') + '</option>'; }).join('') + '</select></label>' : '') +
        '<div class="ad-btns">' +
          '<button type="button" class="btn ' + (p.is_approved ? 'btn-outline' : 'ad-ok') + '" data-act="partner-flags" data-id="' + esc(p.id) +
            '" data-approved="' + (!p.is_approved) + '" data-hidden="' + !!p.is_hidden + '"' + (p.is_approved ? ' data-ask="unapprove"' : '') + '>' +
            (p.is_approved ? bi('அங்கீகாரத்தை நீக்கு', 'Unapprove') : '✔ ' + bi('அங்கீகரி', 'Approve')) + '</button>' +
          '<button type="button" class="btn btn-outline" data-act="partner-flags" data-id="' + esc(p.id) +
            '" data-approved="' + !!p.is_approved + '" data-hidden="' + (!p.is_hidden) + '"' + (p.is_hidden ? '' : ' data-ask="hide"') + '>' +
            (p.is_hidden ? bi('மீண்டும் காட்டு', 'Show again') : bi('மறை', 'Hide')) + '</button>' +
          (p.status === 'due' || p.status === 'hidden'
            ? '<button type="button" class="btn btn-outline" data-act="mark-paid" data-id="' + esc(p.id) + '">' + bi('இந்த மாதம் செலுத்தப்பட்டது', 'Mark this month paid') + '</button>' : '') +
        '</div></article>';
    }).join('') : '<p class="ad-empty">' + bi('இந்தப் பட்டியலில் யாரும் இல்லை.', 'Nobody in this list.') + '</p>';
  }

  // ---------- Poojas: show / hide ----------
  function poojasSection(d) {
    var poojas = d.poojas.map(function (p) {
      return '<tr><td>' + esc(p.name_en) + '</td><td>' + esc(p.name_ta) + '</td><td>' + esc(p.category) + '</td>' +
        '<td><button type="button" class="btn btn-outline" data-act="pooja-visible" data-id="' + esc(p.id) + '" data-visible="' + (!p.is_visible) + '">' +
        (p.is_visible ? bi('மறை', 'Hide') : bi('காட்டு', 'Show')) + '</button></td></tr>';
    }).join('');
    return '<h1>' + bi('பூஜைகள்', 'Poojas') + '</h1>' +
      '<p class="soon">' + bi('மறைக்கப்பட்ட பூஜைகள் வாடிக்கையாளர்களுக்குக் காட்டப்படாது.', 'Hidden poojas are not shown to customers.') + '</p>' +
      '<div class="table-scroll"><table class="admin-table"><thead><tr><th>English</th><th>தமிழ்</th><th>' +
        bi('பிரிவு', 'Category') + '</th><th></th></tr></thead><tbody>' + poojas + '</tbody></table></div>';
  }

  // ---------- Pooja dates (shown to customers: coming poojas and date search) ----------
  function calendarSection(d) {
    var opts = d.poojas.map(function (p) {
      return '<option value="' + esc(p.slug) + '">' + esc(p.name_ta) + ' / ' + esc(p.name_en) + '</option>';
    }).join('');
    var by = {};
    d.poojas.forEach(function (p) { by[p.slug] = p; });
    var list = calRows.map(function (r) {
      var p = by[r.slug] || {};
      return '<article class="ad-card ad-row"><div><strong>' + esc(r.date) + '</strong> · ' + nameBi(p) +
        (r.note_ta || r.note_en ? '<br><small>' + esc(r.note_ta || r.note_en) + '</small>' : '') + '</div>' +
        '<button type="button" class="btn btn-outline ad-small" data-act="date-del" data-id="' + esc(r.id) + '">✕ ' + bi('நீக்கு', 'Remove') + '</button></article>';
    }).join('');
    return '<h1>' + bi('பூஜை தேதிகள்', 'Pooja dates') + '</h1>' +
      '<ol class="ad-steps"><li>' + bi('பஞ்சாங்கத்தைப் பார்த்து தேதியைச் சேர்க்கவும் (எ.கா. பிரதோஷம், ஏகாதசி).', 'Look at your panchangam and add the date (for example Pradosham, Ekadashi).') + '</li>' +
      '<li>' + bi('வாடிக்கையாளர்கள் "வரும் பூஜைகள்" பகுதியிலும் தேதி தேடலிலும் இதைப் பார்ப்பார்கள்.', 'Customers see these in "Coming poojas" and in the date search.') + '</li>' +
      '<li>' + bi('இன்று முதல் உள்ள தேதிகள் மட்டும் காட்டப்படும்; கடந்தவை தானாக மறையும்.', 'Only dates from today are shown; past dates disappear by themselves.') + '</li></ol>' +
      '<form id="dates-form" class="ad-card" novalidate>' +
      '<label class="field"><span class="ta">பூஜை</span><span class="en">Pooja</span><select name="slug">' + opts + '</select></label>' +
      '<label class="field"><span class="ta">தேதி (ஒன்று அல்லது பல; ஒவ்வொன்றையும் புதிய வரியில்)</span><span class="en">Date(s) - one or many, each on a new line</span>' +
        '<textarea name="dates" rows="3" placeholder="2026-12-21&#10;2027-01-05"></textarea></label>' +
      '<label class="field"><span class="ta">இன்றைய தேதி தேர்வு (ஒன்றை மட்டும் சேர்க்க)</span><span class="en">Or pick a single date</span><input name="one" type="date"></label>' +
      '<label class="field"><span class="ta">குறிப்பு (விருப்பம், எ.கா. "சோம பிரதோஷம்")</span><span class="en">Note (optional)</span><input name="note" type="text" maxlength="100"></label>' +
      '<button type="submit" class="btn">+ ' + bi('தேதிகளைச் சேர்', 'Add dates') + '</button></form>' +
      '<h3>' + bi('சேர்க்கப்பட்ட வரும் தேதிகள்', 'Upcoming dates added') + '</h3>' +
      (list || '<p class="ad-empty">' + bi('இன்னும் தேதிகள் இல்லை.', 'No dates yet.') + '</p>');
  }

  function loadCal() {
    return DB.rpc('sa_admin_pooja_dates', { p_token: DB.token() }).then(function (r) { calRows = (r && r.rows) || []; });
  }

  // ---------- Customers ----------
  function customersSection(d) {
    return '<h1>' + bi('வாடிக்கையாளர்கள்', 'Customers') + '</h1>' +
      '<div class="stat-grid"><div class="stat"><strong>' + d.customers.length + '</strong><span>' + bi('மொத்தம்', 'Total') + '</span></div></div>' +
      '<label class="field"><span class="ta">பெயர் / எண் தேடு</span><span class="en">Search name or number</span><input id="cust-q" type="text" value="' + esc(custQ) + '"></label>' +
      '<div id="cust-list"></div>';
  }

  function renderCustomers(d) {
    var q = custQ.toLowerCase();
    var rows = d.customers.filter(function (c) {
      return !q || (c.name || '').toLowerCase().indexOf(q) >= 0 || String(c.mobile || '').indexOf(q) >= 0;
    }).slice(0, 200);
    $('cust-list').innerHTML = rows.length ? rows.map(function (c) {
      return '<article class="ad-card ad-row"><div><strong>' + esc(c.name) + '</strong><br>' + phoneLine(c.mobile) + '</div></article>';
    }).join('') : '<p class="ad-empty">' + bi('வாடிக்கையாளர்கள் இல்லை.', 'No customers found.') + '</p>';
  }

  // ---------- Admin security + payment details (inside Settings) ----------
  function securityCards(d) {
    var weak = adminUser && adminUser.pin_len !== 6;
    var u = d.upi || {};
    return (weak ? '<p class="ad-lock is-warn">⚠ ' + bi('உங்கள் நிர்வாகி PIN 6 இலக்கமாக இல்லை. "வாடிக்கையாளர் கணக்கு" பக்கத்தில் PIN-ஐ மாற்றவும்.', 'Your admin PIN is not 6 digits. Change it from the Account page.') +
        ' <a href="#login">' + bi('கணக்குப் பக்கம்', 'Account page') + '</a></p>' : '') +
      '<form id="upi-form" class="ad-card" novalidate><h3>' + bi('கூட்டாளர் கட்டணம் - UPI விவரங்கள்', 'Partner fee - UPI details') + '</h3>' +
      '<p class="soon">' + bi('இது கூட்டாளர் போர்ட்டலில் மட்டும் காட்டப்படும்.', 'Shown only inside the Partner Portal.') + '</p>' +
      '<label class="field"><span>UPI ID</span><input name="upi_id" type="text" maxlength="60" value="' + esc(u.upi_id || '') + '"></label>' +
      '<label class="field"><span class="ta">பெயர்</span><span class="en">Name</span><input name="upi_name" type="text" maxlength="60" value="' + esc(u.upi_name || '') + '"></label>' +
      '<button type="submit" class="btn">' + bi('சேமி', 'Save') + '</button></form>';
  }

  // ---------- v4 helpers ----------
  var ERR = {
    name_bad: ['பெயரை உள்ளிடவும்.', 'Enter the name.'],
    phone_bad: ['சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.', 'Enter a valid 10-digit mobile number.'],
    phone2_bad: ['இரண்டாவது மொபைல் எண் தேவை (முதல் எண்ணிலிருந்து வேறுபட்டது).', 'A second mobile number is needed (different from the first).'],
    areas_bad: ['சேவைப் பகுதிகள்: தமிழ்நாடு / புதுச்சேரி PIN குறியீடு (எ.கா. 600126 Chromepet).', 'Service areas: Tamil Nadu / Puducherry PIN codes (e.g. 600126 Chromepet).'],
    spec_bad: ['சம்பிரதாயம் / சமையல் வகையைச் சரியாகத் தேர்ந்தெடுக்கவும்.', 'Choose a valid sampradayam / cooking style.'],
    lang_bad: ['குறைந்தது ஒரு மொழி தேவை.', 'At least one language is needed.'],
    photo_bad: ['படம் சரியில்லை (சிறிய படம் அல்லது https இணைப்பு).', 'Photo not accepted (use a small photo or an https link).'],
    duplicate: ['இந்த மொபைல் எண் ஏற்கெனவே உள்ளது.', 'This mobile number already exists.'],
    pin_bad: ['தமிழ்நாடு / புதுச்சேரி PIN குறியீடு தேவை.', 'A Tamil Nadu / Puducherry PIN code is required.'],
    address_bad: ['முழு முகவரி தேவை (குறைந்தது 10 எழுத்துகள்).', 'A full address is needed (at least 10 characters).'],
    pins_bad: ['அருகிலுள்ள பகுதிகளின் PIN குறியீடுகள் சரியில்லை.', 'The nearby PIN codes are not valid.'],
    title_bad: ['தமிழ் மற்றும் ஆங்கிலத் தலைப்பு தேவை.', 'A Tamil and an English title are needed.'],
    role_bad: ['வகை (வாத்தியார் / சமையலர்) தேவை.', 'Role (priest / cook) is needed.'],
    rows_bad: ['கோப்பில் வரிசைகள் இல்லை அல்லது 500-க்கு மேல் உள்ளன.', 'The file has no rows, or more than 500.']
  };
  function errNotice(code) {
    var m = ERR[code] || NOTICE.fail;
    showNotice(m[0], m[1], true);
  }
  function saveRow(rpcName, row) {
    return DB.rpc(rpcName, { p_token: DB.token(), p_row: row }).then(function (r) {
      if (r && r.ok === false) { errNotice(r.error); return false; }
      return render().then(function () { showNotice(NOTICE.saved[0], NOTICE.saved[1], false); return true; });
    }).catch(function () { showNotice(NOTICE.fail[0], NOTICE.fail[1], true); return false; });
  }
  function digits10(v) { return String(v || '').replace(/\D/g, '').slice(-10); }
  function areasText(list) {
    return (list || []).map(function (a) { return esc(a.pin) + (a.place ? ' ' + esc(a.place) : ''); }).join(' · ');
  }
  // Reads a cell by the start of its header text, ignoring case.
  function cell(row, start) {
    var k = Object.keys(row).filter(function (h) { return h.trim().toLowerCase().indexOf(start) === 0; })[0];
    return k === undefined ? '' : String(row[k]).trim();
  }
  function pickKey(val, keys) {
    var v = String(val || '').trim().toLowerCase();
    return keys.filter(function (k) { return k.toLowerCase() === v; })[0] || '';
  }
  var LANG_KEYS = ['Tamil', 'Sanskrit', 'Telugu', 'Kannada', 'Malayalam', 'English'];
  function langsFrom(text) {
    return String(text || '').split(/[,;]+/).map(function (x) { return pickKey(x, LANG_KEYS); }).filter(Boolean).join(',');
  }
  function partnerRowFromSheet(role, r) {
    var specKeys = role === 'priest' ? Object.keys(PD.SAMP) : Object.keys(PD.COOK);
    return {
      role: role, name_en: cell(r, 'name (e'), name_ta: cell(r, 'name (t'),
      phone: digits10(cell(r, 'mobile')), phone2: digits10(cell(r, 'second')),
      spec: pickKey(cell(r, role === 'priest' ? 'sampradayam' : 'cooking'), specKeys),
      languages: langsFrom(cell(r, 'languages')), years: cell(r, 'experience'),
      areas: window.SAExtras.parseAreas(cell(r, 'service')), photo: cell(r, 'photo')
    };
  }
  function vendorRowFromSheet(r) {
    var near = /^(y|yes|ஆம்)/i.test(cell(r, 'deliver nearby'));
    return {
      name: cell(r, 'shop'), phone: digits10(cell(r, 'main')), phone2: digits10(cell(r, 'second')),
      pin: cell(r, 'pincode'), area: cell(r, 'area'), address: cell(r, 'full address'),
      landmark: cell(r, 'landmark'), location: cell(r, 'map'), nearby: near, service_pins: cell(r, 'nearby pin')
    };
  }
  function bulkReport(r) {
    var el = $('bulk-msg');
    if (!el) return;
    var bad = (r.failed || []).map(function (f) {
      var m = ERR[f.error] || NOTICE.fail;
      return '<li>' + bi('வரிசை ', 'Row ') + f.row + ': ' + bi(m[0], m[1]) + '</li>';
    }).join('');
    el.innerHTML = '<p class="form-msg is-ok">' + bi('சேர்க்கப்பட்டவை: ', 'Added: ') + '<strong>' + (r.added || 0) + '</strong></p>' +
      (bad ? '<p class="form-msg is-error">' + bi('இந்த வரிசைகள் சேர்க்கப்படவில்லை (திருத்தி மீண்டும் பதிவேற்றவும்):', 'These rows were not added (fix and upload again):') + '</p><ul>' + bad + '</ul>' : '');
  }
  function bulkUpload(file, kind) {
    var el = $('bulk-msg');
    if (el) el.innerHTML = '<p class="form-msg">…</p>';
    return window.SAExtras.readSheet(file).then(function (rows) {
      rows = rows.filter(function (r) { return Object.keys(r).some(function (k) { return String(r[k]).trim() !== ''; }); });
      if (!rows.length) { errNotice('rows_bad'); return; }
      var rpcName = kind === 'shops' ? 'sa_admin_bulk_vendors' : 'sa_admin_bulk_partners';
      var payload = kind === 'shops' ? rows.map(vendorRowFromSheet) : rows.map(function (r) { return partnerRowFromSheet(kind === 'priests' ? 'priest' : 'cook', r); });
      return DB.rpc(rpcName, { p_token: DB.token(), p_rows: payload }).then(function (r) {
        if (!r || r.ok === false) return errNotice(r && r.error);
        return render().then(function () { bulkReport(r); showNotice(NOTICE.bulk_done[0], NOTICE.bulk_done[1], false); });
      });
    }).catch(function () { showNotice(NOTICE.fail[0], NOTICE.fail[1], true); });
  }
  function bulkCard(kind, ta, en) {
    return '<div class="ad-card"><h3>📥 ' + bi(ta, en) + '</h3>' +
      '<p><a class="btn btn-outline" href="templates/' + kind + '-template.xlsx" download>⬇ ' + bi('Excel டெம்ப்ளேட் பதிவிறக்கு', 'Download Excel template') + '</a></p>' +
      '<p class="soon">' + bi('டெம்ப்ளேட்டை நிரப்பி (.xlsx அல்லது .csv) இங்கே பதிவேற்றவும். ஒரு கோப்பில் அதிகபட்சம் 500 வரிசைகள்.', 'Fill the template and upload it here (.xlsx or .csv). Up to 500 rows per file.') + '</p>' +
      '<input type="file" id="bulk-' + kind + '" accept=".xlsx,.xls,.csv"></div>';
  }

  // ---------- Add priest / cook ----------
  function specOptions(role) {
    var o = role === 'cook' ? PD.COOK : PD.SAMP;
    return Object.keys(o).map(function (k) { return '<option value="' + k + '">' + esc(o[k][0] + ' · ' + o[k][1]) + '</option>'; }).join('');
  }
  function addPeopleSection() {
    var langs = Object.keys(PD.LANGS).map(function (k) {
      return '<label class="check-row"><input type="checkbox" name="lang" value="' + k + '"' + (k === 'Tamil' ? ' checked' : '') + '> ' + bi(PD.LANGS[k][0], PD.LANGS[k][1]) + '</label>';
    }).join('');
    return '<h1>' + bi('வாத்தியார் / சமையலர் சேர்', 'Add priest / cook') + '</h1>' +
      '<p class="soon">' + bi('நிர்வாகம் சேர்ப்பவர்கள் உடனே அங்கீகரிக்கப்படுவார்கள். இவர்களுக்கு உள்நுழைவு இல்லை; முன்பதிவுகளை நிர்வாகம் "முன்பதிவுகள்" பகுதியில் ஏற்கும்.',
        'People added by admin are approved at once. They have no login; admin accepts their bookings in the Bookings section.') + '</p>' +
      '<form id="partner-form" class="vendor-form" novalidate>' +
        '<label class="field"><span class="ta">வகை</span><span class="en">Role</span><select name="role" id="ap-role"><option value="priest">வாத்தியார் · Priest</option><option value="cook">சமையலர் · Cook</option></select></label>' +
        '<label class="field"><span class="ta">பெயர் (ஆங்கிலம்)</span><span class="en">Name (English)</span><input name="name_en" type="text" maxlength="80"></label>' +
        '<label class="field"><span class="ta">பெயர் (தமிழ்)</span><span class="en">Name (Tamil)</span><input name="name_ta" type="text" maxlength="80"></label>' +
        '<label class="field"><span class="ta">மொபைல் எண்</span><span class="en">Mobile number</span><input name="phone" type="tel" inputmode="numeric" maxlength="14" required></label>' +
        '<label class="field"><span class="ta">இரண்டாவது மொபைல் எண் (கட்டாயம்)</span><span class="en">Second mobile number (required)</span><input name="phone2" type="tel" inputmode="numeric" maxlength="14" required></label>' +
        '<label class="field"><span class="ta">சம்பிரதாயம் / சமையல் வகை</span><span class="en">Sampradayam / cooking style</span><select name="spec" id="ap-spec">' + specOptions('priest') + '</select></label>' +
        '<fieldset class="check-group"><legend>' + bi('மொழிகள்', 'Languages') + '</legend>' + langs + '</fieldset>' +
        '<label class="field"><span class="ta">அனுபவம் (ஆண்டுகள்)</span><span class="en">Experience (years)</span><input name="years" type="number" min="0" max="80" value="0"></label>' +
        '<label class="field"><span class="ta">சேவை வழங்கும் பகுதிகள் — ஒரு வரிக்கு ஒன்று: PIN + இடம்</span><span class="en">Areas served — one per line: PIN + place</span>' +
          '<textarea name="areas" rows="4" placeholder="600126 Chromepet&#10;600044 Pallavaram" required></textarea></label>' +
        '<label class="field"><span class="ta">புகைப்படம் (விருப்பம்)</span><span class="en">Photo (optional)</span><input type="file" id="ap-photo" accept="image/*"></label>' +
        '<button type="submit" class="btn">' + bi('சேர்', 'Add') + '</button>' +
      '</form>' +
      bulkCard('priests', 'வாத்தியார்கள் — Excel மூலம் பலரைச் சேர்', 'Priests — bulk upload from Excel') +
      bulkCard('cooks', 'சமையலர்கள் — Excel மூலம் பலரைச் சேர்', 'Cooks — bulk upload from Excel') +
      '<div id="bulk-msg"></div>';
  }
  function submitPartner(form) {
    var d = new FormData(form);
    var row = {
      role: d.get('role'), name_en: d.get('name_en'), name_ta: d.get('name_ta'),
      phone: digits10(d.get('phone')), phone2: digits10(d.get('phone2')), spec: d.get('spec'),
      languages: d.getAll('lang').join(','), years: d.get('years'),
      areas: window.SAExtras.parseAreas(d.get('areas')), photo: partnerPhoto || ''
    };
    var img = partnerPhoto; partnerPhoto = null;
    return saveRow('sa_admin_add_partner', row).then(function (ok) { if (!ok) partnerPhoto = img; });
  }

  // ---------- Stores (shops): full details, edit, bulk upload ----------
  function vendorsSection(d) {
    var e = editVendor ? d.vendors.filter(function (v) { return v.id === editVendor; })[0] : null;
    var val = function (k) { return e && e[k] != null ? esc(e[k]) : ''; };
    var cards = d.vendors.map(function (v) {
      return '<article class="pooja-card">' +
        '<strong>' + esc(v.name) + '</strong>' +
        '<div class="badges"><span class="badge">' + phoneLine(v.phone) + '</span>' +
          (v.phone2 ? '<span class="badge">' + phoneLine(v.phone2) + '</span>' : '') +
          '<span class="badge">PIN ' + esc(v.pin_code) + '</span>' +
          (v.deliver_nearby ? '<span class="badge">' + bi('அருகிலுள்ள பகுதிகளுக்கும்', 'Delivers nearby') + (v.service_pins && v.service_pins.length ? ': ' + esc(v.service_pins.join(', ')) : '') + '</span>' : '') +
          '<span class="badge">' + (v.is_active ? bi('செயலில்', 'Active') : bi('நிறுத்தப்பட்டது', 'Paused')) + '</span></div>' +
        (v.address ? '<p>📍 ' + esc(v.area_name ? v.area_name + ', ' : '') + esc(v.address) + (v.landmark ? ' (' + esc(v.landmark) + ')' : '') + '</p>' : '') +
        (v.location_url ? '<p><a href="' + esc(v.location_url) + '" target="_blank" rel="noopener">🗺 ' + bi('வரைபடம்', 'Map') + '</a></p>' : '') +
        '<div class="action-row"><button type="button" class="btn btn-outline" data-act="edit-vendor" data-id="' + esc(v.id) + '">' + bi('திருத்து', 'Edit') + '</button> ' +
          '<button type="button" class="btn btn-outline" data-act="toggle-vendor" data-id="' + esc(v.id) + '" data-active="' + (!v.is_active) + '">' +
          (v.is_active ? bi('நிறுத்து', 'Pause') : bi('மீண்டும் இயக்கு', 'Reactivate')) + '</button></div>' +
        '</article>';
    }).join('');
    return '<h1>' + bi('கடைகள் (Blind Tie-up)', 'Blind Tie-up Stores') + '</h1>' +
      '<p class="soon">' + bi('கடைகளுக்கு உள்நுழைவு இல்லை. ஆர்டர் வந்ததும் நிர்வாகம் கடையிடம் உறுதி கேட்டு, ஆர்டரை ஒதுக்கும்.', 'Stores have no login. When an order arrives, admin checks with the shop and then assigns it.') + '</p>' +
      '<form id="vendor-form" class="vendor-form" novalidate>' + (e ? '<input type="hidden" name="id" value="' + esc(e.id) + '">' : '') +
        '<h3>' + (e ? bi('கடையைத் திருத்து', 'Edit store') : bi('புதிய கடை', 'New store')) + '</h3>' +
        '<label class="field"><span class="ta">கடையின் பெயர்</span><span class="en">Shop name</span><input name="name" type="text" value="' + val('name') + '" required></label>' +
        '<label class="field"><span class="ta">முதன்மை எண்</span><span class="en">Main number</span><input name="phone" type="tel" inputmode="numeric" maxlength="14" value="' + val('phone') + '" required></label>' +
        '<label class="field"><span class="ta">இரண்டாவது எண் (விருப்பம் — காப்பு)</span><span class="en">Second number (optional — backup)</span><input name="phone2" type="tel" inputmode="numeric" maxlength="14" value="' + val('phone2') + '"></label>' +
        '<label class="field"><span class="ta">PIN குறியீடு</span><span class="en">PIN code</span><input name="pin" type="text" inputmode="numeric" maxlength="6" value="' + val('pin_code') + '" required></label>' +
        '<label class="field"><span class="ta">பகுதி / ஊர்</span><span class="en">Area / locality</span><input name="area" type="text" maxlength="80" value="' + val('area_name') + '"></label>' +
        '<label class="field"><span class="ta">முழு முகவரி</span><span class="en">Full address</span><textarea name="address" rows="3" maxlength="300" required>' + val('address') + '</textarea></label>' +
        '<label class="field"><span class="ta">அடையாளம் (Landmark)</span><span class="en">Landmark</span><input name="landmark" type="text" maxlength="120" value="' + val('landmark') + '"></label>' +
        '<label class="field"><span class="ta">Google Maps இணைப்பு (விருப்பம்)</span><span class="en">Google Maps link (optional)</span><input name="location" type="url" maxlength="300" value="' + val('location_url') + '"></label>' +
        '<label class="check-row"><input type="checkbox" name="nearby"' + (e && e.deliver_nearby ? ' checked' : '') + '> ' + bi('அருகிலுள்ள பகுதிகளுக்கும் டெலிவரி செய்வார்கள் (விருப்பம்)', 'Can also deliver to nearby areas (optional)') + '</label>' +
        '<label class="field"><span class="ta">அருகிலுள்ள PIN குறியீடுகள் (கமாவால் பிரிக்கவும்)</span><span class="en">Nearby PIN codes (comma separated)</span><input name="service_pins" type="text" value="' + (e && e.service_pins ? esc(e.service_pins.join(', ')) : '') + '"></label>' +
        '<button type="submit" class="btn">' + (e ? bi('சேமி', 'Save') : bi('கடையைச் சேர்', 'Add store')) + '</button>' +
        (e ? ' <button type="button" class="btn btn-outline" data-act="cancel-edit-vendor">' + bi('ரத்து', 'Cancel') + '</button>' : '') +
      '</form>' +
      bulkCard('shops', 'கடைகள் — Excel மூலம் பலவற்றைச் சேர்', 'Shops — bulk upload from Excel') + '<div id="bulk-msg"></div>' +
      (d.vendors.length ? '<div class="pooja-grid">' + cards + '</div>'
        : '<p>' + bi('இன்னும் கடைகள் சேர்க்கப்படவில்லை.', 'No stores added yet.') + '</p>');
  }
  function addVendor(form) {
    var d = new FormData(form);
    var row = {
      id: d.get('id') || '', name: d.get('name'), phone: digits10(d.get('phone')), phone2: digits10(d.get('phone2')),
      pin: String(d.get('pin') || '').trim(), area: d.get('area'), address: d.get('address'), landmark: d.get('landmark'),
      location: d.get('location'), nearby: d.get('nearby') === 'on', service_pins: d.get('service_pins')
    };
    var was = editVendor; editVendor = null;
    return saveRow('sa_admin_save_vendor', row).then(function (ok) { if (!ok) editVendor = was; });
  }

  // ---------- Special-day combos (shown on the Order page; text only, no prices) ----------
  function combosSection(d) {
    var e = editOffer ? offersList.filter(function (o) { return o.id === editOffer; })[0] : null;
    var val = function (k) { return e && e[k] != null ? esc(e[k]) : ''; };
    var opts = '<option value="">— ' + bi('பூஜை இணைப்பு இல்லை', 'no pooja link') + ' —</option>' + d.poojas.map(function (p) {
      return '<option value="' + esc(p.slug) + '"' + (e && e.pooja_slug === p.slug ? ' selected' : '') + '>' + esc(p.name_en) + ' · ' + esc(p.name_ta) + '</option>';
    }).join('');
    var list = offersList.map(function (o) {
      return '<article class="ad-card"><div class="ad-card-top"><h3>' + bi(esc(o.title_ta), esc(o.title_en)) + '</h3>' +
        '<span class="badge' + (o.is_active ? '' : ' ad-wait') + '">' + (o.is_active ? bi('காட்டப்படுகிறது', 'Showing') : bi('மறைக்கப்பட்டது', 'Hidden')) + '</span></div>' +
        (o.valid_from || o.valid_to ? '<p>📅 ' + esc(o.valid_from || '…') + ' → ' + esc(o.valid_to || '…') + '</p>' : '') +
        '<div class="ad-btns"><button type="button" class="btn btn-outline" data-act="edit-offer" data-id="' + esc(o.id) + '">' + bi('திருத்து', 'Edit') + '</button>' +
        '<button type="button" class="btn btn-outline" data-act="del-offer" data-id="' + esc(o.id) + '">' + bi('நீக்கு', 'Delete') + '</button></div></article>';
    }).join('');
    return '<h1>' + bi('சிறப்பு நாள் தொகுப்புகள்', 'Special-day combos') + '</h1>' +
      '<p class="soon">' + bi('கோகுலாஷ்டமி, வரலட்சுமி போன்ற முக்கிய நாட்களுக்கான தொகுப்புகள் "பூஜைப் பொருள் ஆர்டர்" பக்கத்தில் வழக்கமான பட்டியலுக்கு மேலே தனியாகக் காட்டப்படும். விலை எதுவும் குறிப்பிட வேண்டாம்.',
        'Combos for major days (Gokulashtami, Varalakshmi…) show on the Order page above the regular list. Do not write any price.') + '</p>' +
      '<form id="combo-form" class="vendor-form" novalidate>' + (e ? '<input type="hidden" name="id" value="' + esc(e.id) + '">' : '') +
        '<label class="field"><span class="ta">தலைப்பு (தமிழ்)</span><span class="en">Title (Tamil)</span><input name="title_ta" type="text" maxlength="100" value="' + val('title_ta') + '" required></label>' +
        '<label class="field"><span class="ta">தலைப்பு (ஆங்கிலம்)</span><span class="en">Title (English)</span><input name="title_en" type="text" maxlength="100" value="' + val('title_en') + '" required></label>' +
        '<label class="field"><span class="ta">விவரம் (தமிழ்)</span><span class="en">Details (Tamil)</span><textarea name="text_ta" rows="3" maxlength="400">' + val('text_ta') + '</textarea></label>' +
        '<label class="field"><span class="ta">விவரம் (ஆங்கிலம்)</span><span class="en">Details (English)</span><textarea name="text_en" rows="3" maxlength="400">' + val('text_en') + '</textarea></label>' +
        '<label class="field"><span class="ta">இணைக்கும் பூஜை (ஆர்டர் பக்கத்துக்குச் செல்ல)</span><span class="en">Linked pooja (opens its order page)</span><select name="pooja_slug">' + opts + '</select></label>' +
        '<label class="field"><span class="ta">படம் (விருப்பம்)</span><span class="en">Picture (optional)</span><input type="file" id="combo-image" accept="image/*"></label>' +
        '<label class="field"><span class="ta">தொடக்கத் தேதி</span><span class="en">Show from</span><input name="valid_from" type="date" value="' + val('valid_from') + '"></label>' +
        '<label class="field"><span class="ta">முடிவுத் தேதி</span><span class="en">Show until</span><input name="valid_to" type="date" value="' + val('valid_to') + '"></label>' +
        '<label class="check-row"><input type="checkbox" name="is_active"' + (!e || e.is_active ? ' checked' : '') + '> ' + bi('வாடிக்கையாளர்களுக்குக் காட்டு', 'Show to customers') + '</label>' +
        '<button type="submit" class="btn">' + bi('சேமி', 'Save') + '</button>' +
        (e ? ' <button type="button" class="btn btn-outline" data-act="cancel-edit-offer">' + bi('ரத்து', 'Cancel') + '</button>' : '') +
      '</form>' + (list || '<p>' + bi('இன்னும் தொகுப்புகள் இல்லை.', 'No combos yet.') + '</p>');
  }
  function submitCombo(form) {
    var d = new FormData(form);
    var row = {
      id: d.get('id') || '', title_ta: d.get('title_ta'), title_en: d.get('title_en'), text_ta: d.get('text_ta'), text_en: d.get('text_en'),
      pooja_slug: d.get('pooja_slug'), valid_from: d.get('valid_from') || '', valid_to: d.get('valid_to') || '',
      is_active: d.get('is_active') === 'on', image: offerImage
    };
    var was = editOffer, img = offerImage; editOffer = null; offerImage = null;
    return saveRow('sa_admin_save_offer', row).then(function (ok) { if (!ok) { editOffer = was; offerImage = img; } });
  }

  // ---------- Pooja content: every point of every section, Tamil and English apart ----------
  function poojaContentSection(d) {
    var cats = window.SAPoojas.CATEGORIES, opts = '<option value="">— ' + bi('பூஜையைத் தேர்ந்தெடுக்கவும்', 'Choose a pooja') + ' —</option>';
    Object.keys(cats).forEach(function (c) {
      opts += '<optgroup label="' + esc(cats[c].en + ' · ' + cats[c].ta) + '">' + d.poojas.filter(function (p) { return p.category === c; }).map(function (p) {
        return '<option value="' + esc(p.slug) + '"' + (p.slug === pcSlug ? ' selected' : '') + '>' + esc(p.name_en) + ' · ' + esc(p.name_ta) + '</option>';
      }).join('') + '</optgroup>';
    });
    var out = '<h1>' + bi('பூஜை விவரங்கள்', 'Pooja content') + '</h1>' +
      '<p class="soon">' + bi('ஒரு பூஜையைத் தேர்ந்தெடுத்து, ஒவ்வொரு தலைப்பிலும் உள்ள குறிப்புகளை (ஒரு வரிக்கு ஒரு குறிப்பு) தமிழிலும் ஆங்கிலத்திலும் தனித்தனியாகத் திருத்தலாம். காலியாக விட்டால் உள்ளமைந்த உரை காட்டப்படும்.',
        'Choose a pooja, then edit the points in each section (one point per line), Tamil and English separately. Leave a section empty to show the built-in text.') + '</p>' +
      '<label class="field"><span class="ta">பூஜை</span><span class="en">Pooja</span><select id="pc-slug">' + opts + '</select></label>';
    if (!pcSlug) return out;
    var I = window.SAInfo, info = (I.get(pcSlug) || I.priest(pcSlug) || {});
    var m = C.merged(pcSlug, info);
    out += '<div class="ad-langtabs" role="tablist"><button type="button" class="btn ' + (pcLang === 'ta' ? '' : 'btn-outline') + '" data-act="pc-lang" data-lang="ta">தமிழ்</button> ' +
      '<button type="button" class="btn ' + (pcLang === 'en' ? '' : 'btn-outline') + '" data-act="pc-lang" data-lang="en">English</button></div>' +
      '<form id="pc-form" class="ad-form">';
    C.KEYS.forEach(function (k) {
      out += '<fieldset class="pc-sec"><legend>' + k[1] + ' ' + bi(k[2], k[3]) + '</legend>' +
        ['ta', 'en'].map(function (l) {
          return '<textarea name="' + l + '_' + k[0] + '" rows="4" data-pclang="' + l + '"' + (l === pcLang ? '' : ' hidden') + ' placeholder="' + (l === 'ta' ? 'ஒரு வரிக்கு ஒரு குறிப்பு' : 'One point per line') + '">' + esc(m[k[0]][l].join('\n')) + '</textarea>';
        }).join('') + '</fieldset>';
    });
    return out + '<div class="action-row"><button type="submit" class="btn">' + bi('சேமி', 'Save') + '</button> ' +
      '<button type="button" class="btn btn-outline" data-act="pc-reset">' + bi('உள்ளமைந்த உரைக்கு மாற்று', 'Reset to built-in text') + '</button></div></form>';
  }


  // ---------- Page shell: sidebar (laptop) / back button (phone) + one section at a time ----------
  function sectionBody(d) {
    if (tab === 'orders') return ordersSection(d);
    if (tab === 'bookings') return bookingsSection(d);
    if (tab === 'people') return peopleSection(d);
    if (tab === 'followup') return followupSection();
    if (tab === 'stores') return vendorsSection(d);
    if (tab === 'addpeople') return addPeopleSection();
    if (tab === 'combos') return combosSection(d);
    if (tab === 'poojas') return poojasSection(d);
    if (tab === 'poojacontent') return poojaContentSection(d);
    if (tab === 'calendar') return calendarSection(d);
    if (tab === 'customers') return customersSection(d);
    if (tab === 'soon') return soonSection();
    if (tab === 'helpmsgs') return helpMsgsSection();
    if (tab === 'helprequests') return helpRequestsSection();
    if (tab === 'settings') return securityCards(d) + settingsSection();
    return homeSection(d);
  }

  function sideNav() {
    return '<nav class="ad-side" aria-label="Admin sections">' + SECTIONS.map(function (s) {
      return '<button type="button" class="ad-side-btn' + (tab === s[0] ? ' is-on' : '') + '" data-act="tab" data-tab="' + s[0] + '">' +
        '<span aria-hidden="true">' + s[1] + '</span>' + bi(s[2], s[3]) + '</button>';
    }).join('') + '</nav>';
  }

  function render() {
    var box = $('admin-box');
    return SASettings.ready().then(function () { return A.currentUser(); }).then(function (u) {
      if (!u || u.role !== 'admin') {
        box.innerHTML = '<h1>' + bi('நிர்வாகம்', 'Admin') + '</h1>' +
          '<p>' + bi(NOTICE.not_admin[0], NOTICE.not_admin[1]) + '</p>' +
          '<p><a class="btn btn-outline" href="#login">' + bi('உள்நுழை', 'Log in') + '</a></p>';
        return;
      }
      adminUser = u;
      return (tab === 'calendar' ? loadCal() : tab === 'poojacontent' ? C.load(true) : Promise.resolve()).then(loadAll).then(function (d) {
        if (!d.ok) {
          box.innerHTML = '<p>' + bi(NOTICE.not_admin[0], NOTICE.not_admin[1]) + '</p>';
          return;
        }
        last = d;
        box.innerHTML = '<div class="ad-layout">' + sideNav() + '<div class="ad-main">' +
          (tab === 'home' ? '' : '<button type="button" class="ad-back" data-act="tab" data-tab="home">‹ ' + bi('முகப்பு', 'Home') + '</button>') +
          '<div id="admin-notice" class="form-msg" role="status" hidden></div>' +
          sectionBody(d) + '</div></div>';
        if (tab === 'orders') renderOrders(d);
        if (tab === 'bookings') renderBookings(d);
        if (tab === 'people') renderPeople(d);
        if (tab === 'customers') renderCustomers(d);
      });
    });
  }

  // ---------- Actions (each runs on the server, which checks the admin role) ----------
  function findOrder(id) {
    return last.orders.filter(function (o) { return o.id === id; })[0] || null;
  }

  // Trigger 2a: store confirms and dispatches.
  function confirmOrder(id) {
    var sel = $('store-' + id);
    if (!sel || !sel.value) return showNotice(NOTICE.pick_store[0], NOTICE.pick_store[1], true);
    return after(DB.rpc('sa_admin_confirm_order', { p_token: DB.token(), p_order: id, p_vendor: sel.value }),
      NOTICE.confirmed[0], NOTICE.confirmed[1]);
  }

  // Trigger 2b: samagri is not available.
  function markUnavailable(id) {
    return after(DB.rpc('sa_admin_mark_unavailable', { p_token: DB.token(), p_order: id }),
      NOTICE.unavailable[0], NOTICE.unavailable[1]);
  }

  // Trigger 4: one-day reminders for tomorrow's accepted bookings.
  // ---------- Settings & rules: every value below is saved to the database and read live by the app ----------
  var GROUP_TITLE = {
    subscription: ['சந்தா விதிகள்', 'Subscription rules'],
    security: ['முன்பதிவு & பாதுகாப்பு', 'Booking & security rules'],
    content: ['உள்ளடக்கம் & உரைகள்', 'Content & texts'],
    payment: ['கட்டணம்', 'Payment']
  };

  function settingField(r) {
    var v = r.value, k = r.key;
    if (typeof v === 'boolean') {
      return '<label class="check-row"><input type="checkbox" data-key="' + esc(k) + '" data-kind="bool"' + (v ? ' checked' : '') + '> ' + esc(r.label) + '</label>';
    }
    if (typeof v === 'number') {
      return '<label class="field"><span>' + esc(r.label) + '</span><input type="number" data-key="' + esc(k) + '" data-kind="number" value="' + v + '"></label>';
    }
    if (typeof v === 'string') {
      return '<label class="field"><span>' + esc(r.label) + '</span><input type="text" data-key="' + esc(k) + '" data-kind="string" value="' + esc(v) + '"></label>';
    }
    return '<fieldset class="check-group"><legend>' + esc(r.label) + '</legend>' + ['ta', 'en'].map(function (l) {
      return '<label class="field"><span>' + (l === 'ta' ? 'தமிழ்' : 'English') + '</span><textarea rows="4" data-key="' + esc(k) +
        '" data-kind="text" data-lang="' + l + '">' + esc((v && v[l]) || '') + '</textarea></label>';
    }).join('') + '</fieldset>';
  }

  // Coming-soon texts: one {ta, en} text per service, shown to visitors when the service is not open yet.
  function soonSection() {
    var rows = SASettings.rows().filter(function (r) { return r.group === 'coming_soon'; });
    return '<h1>' + bi('விரைவில் வரும் உரைகள்', 'Coming-soon texts') + '</h1>' +
      '<p class="soon">' + bi('ஒரு சேவை இன்னும் திறக்கப்படாதபோது பார்வையாளருக்குக் காட்டப்படும் பெயர். மாற்றியதும் சேமிக்கவும்.',
        'The name shown to a visitor when a service is not open yet. Save after changing.') + '</p>' +
      '<form id="soon-form" novalidate>' + rows.map(settingField).join('') +
      '<div class="action-row"><button type="submit" class="btn">' + bi('சேமி', 'Save') + '</button></div>' +
      '<p class="form-msg" role="status" aria-live="polite"></p></form>';
  }

  // Help & suggestions sent from the site. Status: new / read / replied.
  function helpMsgsSection() {
    var KIND = { help: ['உதவி', 'Help'], suggestion: ['பரிந்துரை', 'Suggestion'], complaint: ['குறை', 'Complaint'] };
    var STATUS = [['new', 'புதியது', 'New'], ['read', 'படித்தது', 'Read'], ['replied', 'பதில் அனுப்பியது', 'Replied']];
    var items = (contactData.messages || []).map(function (m) {
      var when = new Date(m.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      var k = KIND[m.kind] || KIND.help;
      return '<div class="ad-card' + (m.status === 'new' ? ' is-hot' : '') + '">' +
        '<p><strong>' + esc(m.name) + '</strong> · ' + phoneLine(m.mobile) + ' · ' + bi(k[0], k[1]) + ' · ' + esc(when) + '</p>' +
        '<p>' + esc(m.message) + '</p>' +
        '<div class="ad-btns">' + STATUS.map(function (st) {
          return '<button type="button" class="btn' + (m.status === st[0] ? '' : ' btn-outline') + '" data-act="contact-status" data-id="' +
            esc(m.id) + '" data-st="' + st[0] + '">' + bi(st[1], st[2]) + '</button>';
        }).join('') + '</div></div>';
    }).join('');
    return '<h1>' + bi('உதவி & பரிந்துரைகள்', 'Help & suggestions') + '</h1>' +
      '<p class="soon">' + bi('புதியவை: ' + (contactData.new_count || 0), 'New: ' + (contactData.new_count || 0)) + '</p>' +
      (items || '<p>' + bi('இன்னும் செய்திகள் இல்லை.', 'No messages yet.') + '</p>');
  }

  // Help Centre requests from logged-in customers. The admin's reply shows to the customer as a notification.
  function helpRequestsSection() {
    var H = window.SA_HELP || { CATS: [], QUESTIONS: {} };
    var catName = function (code) {
      var c = H.CATS.filter(function (x) { return x.code === code; })[0];
      return c ? bi(c.ta, c.en) : esc(code);
    };
    var qName = function (cat, code) {
      if (!code) return '';
      var q = (H.QUESTIONS[cat] || []).filter(function (x) { return x[0] === code; })[0];
      return q ? '<p><strong>' + bi(q[1], q[2]) + '</strong></p>' : '';
    };
    var items = (helpReqData.requests || []).map(function (r) {
      var when = new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      return '<div class="ad-card' + (r.status === 'open' ? ' is-hot' : '') + '">' +
        '<p><strong>' + esc(r.name) + '</strong> · ' + phoneLine(r.mobile) + ' · ' + catName(r.category) + ' · ' + esc(when) + '</p>' +
        qName(r.category, r.question_code) +
        (r.message ? '<p>' + esc(r.message) + '</p>' : '') +
        (r.reply ? '<p class="soon">' + bi('முந்தைய பதில்: ', 'Earlier reply: ') + esc(r.reply) + '</p>' : '') +
        '<label class="field"><span class="ta">பதில்</span><span class="en">Reply</span>' +
          '<textarea id="hr-reply-' + esc(r.id) + '" rows="3" maxlength="1000"></textarea></label>' +
        '<div class="ad-btns"><button type="button" class="btn" data-act="help-reply" data-id="' + esc(r.id) + '">' +
          bi('பதில் அனுப்பு', 'Send reply') + '</button></div></div>';
    }).join('');
    return '<h1>' + bi('உதவி மையம் கோரிக்கைகள்', 'Help Centre requests') + '</h1>' +
      '<p class="soon">' + bi('திறந்தவை: ' + (helpReqData.open_count || 0), 'Open: ' + (helpReqData.open_count || 0)) + '</p>' +
      (items || '<p>' + bi('இன்னும் கோரிக்கைகள் இல்லை.', 'No requests yet.') + '</p>');
  }

  function settingsSection() {
    var rows = SASettings.rows().filter(function (r) { return r.key !== 'wa_sample' && r.group !== 'coming_soon' && r.group !== 'whatsapp' && r.group !== 'offers'; });
    var out = '<h1>' + bi('அமைப்புகள்', 'Settings') + '</h1>' +
      '<p class="soon">' + bi('மாற்றங்கள் சேமித்த உடனே செயலிக்குள் நடைமுறைக்கு வரும்.', 'Changes take effect in the app as soon as you save.') + '</p>' +
      '<form id="settings-form" novalidate>';
    var lastGroup = null;
    rows.forEach(function (r) {
      if (r.group !== lastGroup) {
        if (lastGroup !== null) out += '';
        var t = GROUP_TITLE[r.group] || [r.group, r.group];
        out += '<h3>' + bi(t[0], t[1]) + '</h3>';
        lastGroup = r.group;
      }
      out += settingField(r);
    });
    return out + '<div class="action-row"><button type="submit" class="btn">' + bi('சேமி', 'Save changes') + '</button></div>' +
      '<p class="form-msg" role="status" aria-live="polite"></p></form>';
  }

  // Reads every field in the settings form into one payload, then saves it on the server.
  function saveSettings(form) {
    var payload = {};
    form.querySelectorAll('[data-key]').forEach(function (el) {
      var k = el.getAttribute('data-key'), kind = el.getAttribute('data-kind');
      if (kind === 'bool') payload[k] = el.checked;
      else if (kind === 'number') payload[k] = Number(el.value);
      else if (kind === 'string') payload[k] = el.value.trim();
      else {
        payload[k] = payload[k] || {};
        payload[k][el.getAttribute('data-lang')] = el.value;
      }
    });
    var msg = form.querySelector('.form-msg');
    return DB.rpc('sa_admin_update_settings', { p_token: DB.token(), p_values: payload }).then(function (r) {
      if (!r.ok) {
        msg.innerHTML = bi(NOTICE.fail[0], NOTICE.fail[1] + ' (' + esc(r.key || r.error) + ')');
        msg.classList.add('is-error');
        return;
      }
      return SASettings.reload().then(function () { return render(); }).then(function () {
        showNotice(NOTICE.saved[0], NOTICE.saved[1], false);
      });
    }).catch(function () { msg.innerHTML = bi(NOTICE.fail[0], NOTICE.fail[1]); msg.classList.add('is-error'); });
  }

  // ---------- Events ----------
  var box = $('admin-box');

  var ASK = {
    unapprove: ['இந்த கூட்டாளரின் அங்கீகாரத்தை நீக்கவா?', 'Remove approval for this partner?'],
    hide: ['இந்த கூட்டாளரை மறைக்கவா?', 'Hide this partner from customers?'],
    poojaHide: ['இந்த பூஜையை வாடிக்கையாளர்களிடமிருந்து மறைக்கவா?', 'Hide this pooja from customers?'],
    unavailable: ['இந்த ஆர்டரை "கிடைக்கவில்லை" எனக் குறிக்கவா? வாடிக்கையாளருக்குச் செய்தி செல்லும்.', 'Mark this order unavailable? The customer will get a message.'],
    confirm: ['ஆர்டரை உறுதி செய்து கடைக்கு அனுப்பவா? வாடிக்கையாளருக்குச் செய்தி செல்லும்.', 'Confirm and dispatch this order? The customer will get a message.'],
    vendor: ['இந்தக் கடையை நிறுத்தவா?', 'Pause this store?']
  };

  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || !last) return;
    var act = b.getAttribute('data-act');
    var id = b.getAttribute('data-id');
    if (act === 'contact-status') {
      return after(DB.rpc('sa_admin_set_contact_status', { p_token: DB.token(), p_id: id, p_status: b.getAttribute('data-st') }),
        NOTICE.saved[0], NOTICE.saved[1]).then(function () { return render(); });
    }
    if (act === 'tab') {
      tab = b.getAttribute('data-tab');
      var f = b.getAttribute('data-filter');
      if (f) {
        if (tab === 'orders') orderFilter = f;
        if (tab === 'bookings') bookingFilter = f;
        if (tab === 'people') peopleFilter = f;
      }
      window.scrollTo(0, 0);
      return render();
    }
    if (act === 'chip') {
      var g = b.getAttribute('data-group'), v = b.getAttribute('data-value');
      if (g === 'order') orderFilter = v;
      if (g === 'booking') bookingFilter = v;
      if (g === 'people') peopleFilter = v;
      return render();
    }
    if (act === 'edit-vendor') { editVendor = id; return render(); }
    if (act === 'cancel-edit-vendor') { editVendor = null; return render(); }
    if (act === 'edit-offer') { editOffer = id; offerImage = null; return render(); }
    if (act === 'cancel-edit-offer') { editOffer = null; offerImage = null; return render(); }
    if (act === 'del-offer') {
      if (!ask('இந்தத் தொகுப்பை நீக்கவா?', 'Delete this combo?')) return;
      return after(DB.rpc('sa_admin_delete_offer', { p_token: DB.token(), p_id: id }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'help-reply') {
      var hta = document.getElementById('hr-reply-' + id);
      var txt = hta ? hta.value.trim() : '';
      if (txt.length < 2) { showNotice('பதிலை எழுதவும்.', 'Please write a reply.', true); return; }
      return after(DB.rpc('sa_admin_reply_help_request', { p_token: DB.token(), p_id: id, p_reply: txt }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'rec-fu') {
      return after(DB.rpc('sa_admin_record_followup', { p_token: DB.token(), p_kind: b.getAttribute('data-kind'), p_ref: id, p_rating: b.getAttribute('data-rating'), p_comment: '' }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'resolve-report') {
      return after(DB.rpc('sa_admin_resolve_report', { p_token: DB.token(), p_id: id }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'booking-status') {
      var st = b.getAttribute('data-status');
      if (st === 'accepted' && !ask('இந்த முன்பதிவை ஏற்கவா?', 'Accept this booking?')) return;
      return after(DB.rpc('sa_admin_set_booking_status', { p_token: DB.token(), p_booking: id, p_status: st }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'pc-lang') {
      pcLang = b.getAttribute('data-lang');
      box.querySelectorAll('[data-pclang]').forEach(function (t) { t.hidden = t.getAttribute('data-pclang') !== pcLang; });
      box.querySelectorAll('[data-act="pc-lang"]').forEach(function (x) { x.classList.toggle('btn-outline', x.getAttribute('data-lang') !== pcLang); });
      return;
    }
    if (act === 'pc-reset') {
      if (!pcSlug || !ask('இந்த பூஜையின் திருத்தங்களை நீக்கி உள்ளமைந்த உரைக்குத் திரும்பவா?', 'Remove your edits for this pooja and go back to the built-in text?')) return;
      return after(DB.rpc('sa_admin_reset_pooja_content', { p_token: DB.token(), p_slug: pcSlug }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'pooja-visible') {
      var show = b.getAttribute('data-visible') === 'true';
      if (!show && !ask(ASK.poojaHide[0], ASK.poojaHide[1])) return;
      return after(DB.rpc('sa_admin_set_pooja_visible', { p_token: DB.token(), p_pooja: id, p_visible: show }),
        NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'partner-flags') {
      var q = b.getAttribute('data-ask');
      if (q && !ask(ASK[q][0], ASK[q][1])) return;
      return after(DB.rpc('sa_admin_set_partner_flags', {
        p_token: DB.token(), p_partner: id,
        p_approved: b.getAttribute('data-approved') === 'true', p_hidden: b.getAttribute('data-hidden') === 'true'
      }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'toggle-vendor') {
      var on = b.getAttribute('data-active') === 'true';
      if (!on && !ask(ASK.vendor[0], ASK.vendor[1])) return;
      return after(DB.rpc('sa_admin_set_vendor_active', { p_token: DB.token(), p_vendor: id, p_active: on }),
        NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'mark-paid') {
      return after(DB.rpc('sa_admin_mark_paid', { p_token: DB.token(), p_partner: id }), NOTICE.paid[0], NOTICE.paid[1]);
    }
    if (act === 'confirm-order') { if (ask(ASK.confirm[0], ASK.confirm[1])) return confirmOrder(id); return; }
    if (act === 'unavailable-order') { if (ask(ASK.unavailable[0], ASK.unavailable[1])) return markUnavailable(id); return; }
    if (act === 'fee-reminders') {
      return DB.rpc('sa_admin_queue_fee_reminders', { p_token: DB.token() }).then(function (r) {
        if (!r.ok) throw new Error(r.error);
        A.kickEmail();
        showNotice(NOTICE.fees_queued[0], NOTICE.fees_queued[1], false);
      }).catch(function () { showNotice(NOTICE.fail[0], NOTICE.fail[1], true); });
    }
    if (act === 'date-del') {
      return DB.rpc('sa_admin_delete_pooja_date', { p_token: DB.token(), p_id: id }).then(function () { return render(); });
    }
  });

  box.addEventListener('change', function (e) {
    if (e.target.id !== 'pc-slug') return;
    pcSlug = e.target.value;
    return render();
  });

  box.addEventListener('submit', function (e) {
    if (e.target.id === 'pc-form') {
      e.preventDefault();
      var fd0 = new FormData(e.target), content = {};
      C.KEYS.forEach(function (k) {
        var split = function (v) { return C.clean(String(v || '').split(/\r?\n/)); };
        content[k[0]] = { ta: split(fd0.get('ta_' + k[0])), en: split(fd0.get('en_' + k[0])) };
      });
      return after(DB.rpc('sa_admin_save_pooja_content', { p_token: DB.token(), p_slug: pcSlug, p_content: content }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (e.target.id === 'soon-form') { e.preventDefault(); saveSettings(e.target); return; }
    if (e.target.id === 'settings-form') {
      e.preventDefault();
      saveSettings(e.target);
      return;
    }
    if (e.target.id === 'dates-form') {
      e.preventDefault();
      var f = new FormData(e.target);
      var all = String(f.get('dates') || '').split(/[\s,;]+/).concat([f.get('one') || '']).filter(function (x) { return /^\d{4}-\d{2}-\d{2}$/.test(x); });
      if (!all.length) return showNotice(NOTICE.dates_bad[0], NOTICE.dates_bad[1], true);
      return DB.rpc('sa_admin_add_pooja_dates', { p_token: DB.token(), p_slug: f.get('slug'), p_dates: all, p_note_ta: f.get('note') || '', p_note_en: f.get('note') || '' })
        .then(function (r) { if (!r.ok) throw new Error(r.error); return render(); })
        .then(function () { showNotice(NOTICE.dates_saved[0], NOTICE.dates_saved[1], false); })
        .catch(function () { showNotice(NOTICE.dates_bad[0], NOTICE.dates_bad[1], true); });
    }
    if (e.target.id === 'upi-form') {
      e.preventDefault();
      var fd = new FormData(e.target);
      return after(DB.rpc('sa_admin_update_settings', { p_token: DB.token(), p_values: { upi_id: String(fd.get('upi_id') || '').trim(), upi_name: String(fd.get('upi_name') || '').trim() } })
        .then(function (r) { return SASettings.reload().then(function () { return r; }); }), NOTICE.upi_saved[0], NOTICE.upi_saved[1]);
    }
    if (e.target.id === 'partner-form') { e.preventDefault(); return submitPartner(e.target); }
    if (e.target.id === 'combo-form') { e.preventDefault(); return submitCombo(e.target); }
    if (e.target.id !== 'vendor-form') return;
    e.preventDefault();
    addVendor(e.target);
  });

  box.addEventListener('change', function (e) {
    var t = e.target;
    if (t.getAttribute('data-verify')) {
      return after(DB.rpc('sa_admin_set_verify', { p_token: DB.token(), p_partner: t.getAttribute('data-verify'), p_level: Number(t.value) }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (t.id === 'ap-role') { $('ap-spec').innerHTML = specOptions(t.value); return; }
    if (t.id === 'ap-photo' && t.files[0]) {
      return window.SAExtras.toDataUrl(t.files[0], 240).then(function (u) { partnerPhoto = u; }).catch(function () { errNotice('photo_bad'); });
    }
    if (t.id === 'combo-image' && t.files[0]) {
      return window.SAExtras.toDataUrl(t.files[0], 480).then(function (u) { offerImage = u; }).catch(function () { errNotice('photo_bad'); });
    }
    var m = /^bulk-(priests|cooks|shops)$/.exec(t.id || '');
    if (m && t.files[0]) { var f = t.files[0]; t.value = ''; return bulkUpload(f, m[1]); }
  });

  box.addEventListener('input', function (e) {
    if (!last) return;
    if (e.target.id === 'cust-q') { custQ = e.target.value; return renderCustomers(last); }
    if (e.target.id === 'order-pin') {
      pinFilter.order = digits(e.target.value);
      e.target.value = pinFilter.order;
      renderOrders(last);
    }
    if (e.target.id === 'booking-pin') {
      pinFilter.booking = digits(e.target.value);
      e.target.value = pinFilter.booking;
      renderBookings(last);
    }
  });

  function route() {
    if ((location.hash || '') === '#admin') render();
  }

  window.addEventListener('hashchange', route);
  route();
})();
