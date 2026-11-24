(function () {
  'use strict';

  var DB = window.SADB;
  var A = window.SAAuth;
  var WA = window.SAWA;
  var PD = window.SAPartners;
  var bi = PD.bi, esc = PD.esc;

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
    fail: ['சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not save. Please try again.']
  };

  var last = null;                 // last loaded dashboard data
  var pinFilter = { order: '', booking: '' };
  var tab = 'home'; // home | orders | bookings | people | stores | poojas | messages | settings
  var orderFilter = 'waiting_for_confirmation';
  var bookingFilter = 'soon';
  var peopleFilter = 'approve';

  // [key, icon, Tamil, English]
  var SECTIONS = [
    ['home', '🏠', 'முகப்பு', 'Home'],
    ['orders', '📦', 'ஆர்டர்கள்', 'Orders'],
    ['bookings', '📅', 'முன்பதிவுகள்', 'Bookings'],
    ['people', '🙏', 'வாத்தியார் & சமையல்', 'Priests & Cooks'],
    ['stores', '🏪', 'கடைகள்', 'Stores'],
    ['poojas', '🪔', 'பூஜைகள்', 'Poojas'],
    ['messages', '💬', 'WhatsApp செய்திகள்', 'WhatsApp messages'],
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
    return DB.rpc('sa_admin_dashboard', { p_token: DB.token() });
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
        todoCard(toApprove(d).length, 'புதிய அங்கீகாரம்', 'New approvals', 'வாத்தியார் / சமையல்காரர்', 'Priests / cooks waiting', 'people', 'approve', true) +
        todoCard(feesDue(d).length, 'கட்டணம் நிலுவை', 'Fees pending', 'இந்த மாதம்', 'This month', 'people', 'fees', false) +
      '</div>' +
      '<h2 class="ad-menu-h">' + bi('எல்லா பகுதிகள்', 'All sections') + '</h2>' +
      '<div class="ad-menu">' + SECTIONS.slice(1).map(function (s) {
        return '<button type="button" class="ad-menu-btn" data-act="tab" data-tab="' + s[0] + '"><span class="ad-ic" aria-hidden="true">' + s[1] + '</span>' + bi(s[2], s[3]) + '</button>';
      }).join('') + '</div>' +
      '<h2>' + bi('சுருக்கம்', 'Summary') + '</h2>' +
      '<div class="stat-grid">' +
        tile(d.counts.customers, 'வாடிக்கையாளர்கள்', 'Customers') +
        tile(d.counts.priests, 'வாத்தியார்கள்', 'Priests') +
        tile(d.counts.cooks, 'சமையல்காரர்கள்', 'Cooks') +
        tile(d.counts.stores, 'கடைகள்', 'Blind Tie-up Stores') +
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
    return '<h1>' + bi('சாமான் ஆர்டர்கள்', 'Samagri orders') + '</h1>' +
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
      var stores = d.vendors.filter(function (v) { return v.is_active && v.pin_code === o.pin_code; });
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
            '<p>' + nameBi({ name_ta: b.pooja_ta, name_en: b.pooja_en }) + '</p></article>';
        }).join('')
      : '<p class="ad-empty">' + bi('இந்தப் பட்டியலில் முன்பதிவுகள் இல்லை.', 'No bookings in this list.') + '</p>';
  }

  // ---------- Priests & Cooks: approve, hide, record fees ----------
  function peopleSection(d) {
    var all = realPartners(d);
    return '<h1>' + bi('வாத்தியார் & சமையல்காரர்', 'Priests & Cooks') + '</h1>' +
      chips('people', peopleFilter, [
        ['approve', 'அங்கீகாரம் நிலுவை', 'To approve', toApprove(d).length],
        ['fees', 'கட்டணம்', 'Fees due', feesDue(d).length],
        ['all', 'எல்லோரும்', 'All', all.length]
      ]) +
      '<p class="soon">' + bi('புதிய கூட்டாளர்கள் அங்கீகரிக்கப்படும் வரை தேடலில் காட்டப்பட மாட்டார்கள்.', 'New partners stay out of search until approved.') + '</p>' +
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
        '<div class="badges"><span class="badge">' + bi(PD.ROLE[p.role][0], PD.ROLE[p.role][1]) + '</span>' +
          (p.is_hidden ? '<span class="badge">' + bi('மறைக்கப்பட்டது', 'Hidden') + '</span>' : '') +
          '<span class="badge">' + esc(p.status) + '</span></div>' +
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

  // ---------- Blind tie-up stores ----------
  function vendorsSection(d) {
    var cards = d.vendors.map(function (v) {
      return '<article class="pooja-card">' +
        '<strong>' + esc(v.name) + '</strong>' +
        '<div class="badges"><span class="badge">' + phoneLine(v.phone) + '</span>' +
          '<span class="badge">PIN ' + esc(v.pin_code) + '</span>' +
          '<span class="badge">' + (v.is_active ? bi('செயலில்', 'Active') : bi('நிறுத்தப்பட்டது', 'Paused')) + '</span></div>' +
        '<div class="action-row"><button type="button" class="btn btn-outline" data-act="toggle-vendor" data-id="' + esc(v.id) + '" data-active="' + (!v.is_active) + '">' +
          (v.is_active ? bi('நிறுத்து', 'Pause') : bi('மீண்டும் இயக்கு', 'Reactivate')) + '</button></div>' +
        '</article>';
    }).join('');
    return '<h1>' + bi('கடைகள் (Blind Tie-up)', 'Blind Tie-up Stores') + '</h1>' +
      '<p class="soon">' + bi('கடைகளுக்கு உள்நுழைவு இல்லை. ஆர்டர்களை நிர்வாகமே கடைக்கு ஒதுக்கும்.', 'Stores have no login. Admin assigns each order to a store.') + '</p>' +
      '<form id="vendor-form" class="vendor-form" novalidate>' +
        '<label class="field"><span class="ta">கடையின் பெயர்</span><span class="en">Store name</span><input name="name" type="text" required></label>' +
        '<label class="field"><span class="ta">மொபைல் எண் (10 இலக்கம்)</span><span class="en">Mobile (10 digits)</span><input name="phone" type="tel" inputmode="numeric" maxlength="14" required></label>' +
        '<label class="field"><span class="ta">PIN குறியீடு (6 இலக்கம்)</span><span class="en">PIN code (6 digits)</span><input name="pin" type="text" inputmode="numeric" maxlength="6" required></label>' +
        '<button type="submit" class="btn">' + bi('கடையைச் சேர்', 'Add store') + '</button>' +
      '</form>' +
      (d.vendors.length ? '<div class="pooja-grid">' + cards + '</div>'
        : '<p>' + bi('இன்னும் கடைகள் சேர்க்கப்படவில்லை.', 'No stores added yet.') + '</p>');
  }

  // ---------- WhatsApp alerts ----------
  function waSection(d) {
    var previews = WA.KEYS.map(function (k) {
      var t = WA.TITLES[k];
      return '<article class="pooja-card"><strong>' + bi(t[0], t[1]) + '</strong>' +
        '<pre class="wa-text"><span class="ta">' + esc(WA.preview(k, 'ta')) + '</span>' +
        '<span class="en">' + esc(WA.preview(k, 'en')) + '</span></pre></article>';
    }).join('');
    var log = d.wa.map(function (m) {
      return '<tr><td>' + esc((m.created_at || '').slice(0, 16).replace('T', ' ')) + '</td>' +
        '<td>' + esc(m.template) + '</td><td>' + esc(m.to_addr) + '</td><td>' + esc(m.status) + '</td></tr>';
    }).join('');
    return '<h1>' + bi('WhatsApp செய்திகள்', 'WhatsApp messages') + '</h1>' +
      '<p>' + bi('ஒவ்வொரு செய்தியும் "சுபம் அஸ்து:" என்ற முன்னொட்டுடன் தொடங்கும். நான்கு தூண்டுதல்கள் மட்டுமே உள்ளன.', 'Every message starts with "சுபம் அஸ்து:". There are exactly four triggers.') + '</p>' +
      '<div class="pooja-grid">' + previews + '</div>' +
      '<div class="action-row">' +
        '<button type="button" class="btn btn-outline" data-act="test-messages">' + bi('சோதனைச் செய்திகளை அனுப்பு (எனக்கு)', 'Queue test messages (to me)') + '</button>' +
        '<button type="button" class="btn btn-outline" data-act="run-reminders">' + bi('நாளைய நினைவூட்டல்கள்', "Queue tomorrow's reminders") + '</button>' +
      '</div>' +
      '<h3>' + bi('சமீபத்திய வரிசை', 'Recent queue') + '</h3>' +
      (log ? '<div class="table-scroll"><table class="admin-table"><thead><tr><th>' + bi('நேரம்', 'Time') + '</th><th>' + bi('வகை', 'Trigger') + '</th><th>' + bi('பெறுநர்', 'To') + '</th><th>' + bi('நிலை', 'Status') + '</th></tr></thead><tbody>' + log + '</tbody></table></div>'
        : '<p>' + bi('இன்னும் செய்திகள் இல்லை.', 'No messages queued yet.') + '</p>');
  }


  // ---------- Page shell: sidebar (laptop) / back button (phone) + one section at a time ----------
  function sectionBody(d) {
    if (tab === 'orders') return ordersSection(d);
    if (tab === 'bookings') return bookingsSection(d);
    if (tab === 'people') return peopleSection(d);
    if (tab === 'stores') return vendorsSection(d);
    if (tab === 'poojas') return poojasSection(d);
    if (tab === 'messages') return waSection(d);
    if (tab === 'settings') return settingsSection();
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
      return loadAll().then(function (d) {
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
      });
    });
  }

  // ---------- Actions (each runs on the server, which checks the admin role) ----------
  function findOrder(id) {
    return last.orders.filter(function (o) { return o.id === id; })[0] || null;
  }

  function addVendor(form) {
    var d = new FormData(form);
    return after(DB.rpc('sa_admin_add_vendor', {
      p_token: DB.token(), p_name: d.get('name'), p_phone: d.get('phone'), p_pin: d.get('pin')
    }), NOTICE.saved[0], NOTICE.saved[1]);
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
  function runReminders() {
    return DB.rpc('sa_admin_queue_reminders', { p_token: DB.token() }).then(function (r) {
      var n = r.count || 0;
      return after(Promise.resolve({ ok: true }), n + ' நினைவூட்டல்கள் வரிசையில் சேர்க்கப்பட்டன.', n + ' reminder(s) added to the queue.');
    });
  }

  function testMessages() {
    return after(DB.rpc('sa_admin_queue_test', { p_token: DB.token() }), NOTICE.test_sent[0], NOTICE.test_sent[1]);
  }

  // ---------- Settings & rules: every value below is saved to the database and read live by the app ----------
  var GROUP_TITLE = {
    subscription: ['சந்தா விதிகள்', 'Subscription rules'],
    security: ['முன்பதிவு & பாதுகாப்பு', 'Booking & security rules'],
    content: ['உள்ளடக்கம் & உரைகள்', 'Content & texts'],
    whatsapp: ['WhatsApp எச்சரிக்கைகள்', 'WhatsApp alerts']
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

  function settingsSection() {
    var rows = SASettings.rows().filter(function (r) { return r.key !== 'wa_sample'; });
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
    if (act === 'run-reminders') return runReminders();
    if (act === 'test-messages') return testMessages();
  });

  box.addEventListener('submit', function (e) {
    if (e.target.id === 'settings-form') {
      e.preventDefault();
      saveSettings(e.target);
      return;
    }
    if (e.target.id !== 'vendor-form') return;
    e.preventDefault();
    addVendor(e.target);
  });

  box.addEventListener('input', function (e) {
    if (!last) return;
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
