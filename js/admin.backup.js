/* Subham Asthu — Admin Dashboard (Phase 5/6). Admin role only. The database returns the data
   and masks phone numbers until an order is Confirmed / Dispatched; this file only renders it. */
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
  var tab = 'overview'; // admin section: overview | catalog | settings

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

  // ---------- Summary ----------
  function summary(d) {
    var tile = function (n, ta, en) {
      return '<div class="stat"><strong>' + n + '</strong><span>' + bi(ta, en) + '</span></div>';
    };
    var buckets = { active: 0, free: 0, hidden: 0 };
    d.partners.forEach(function (p) {
      if (p.status === 'free') buckets.free++;
      else if (p.status === 'hidden') buckets.hidden++;
      else buckets.active++;
    });
    return '<h2>' + bi('சுருக்கம்', 'Summary') + '</h2>' +
      '<div class="stat-grid">' +
        tile(d.counts.customers, 'வாடிக்கையாளர்கள்', 'Customers') +
        tile(d.counts.priests, 'வாத்தியார்கள்', 'Priests') +
        tile(d.counts.cooks, 'சமையல்காரர்கள்', 'Cooks') +
        tile(d.counts.stores, 'கடைகள்', 'Blind Tie-up Stores') +
      '</div>' +
      '<h3>' + bi('வாத்தியார் / சமையல்காரர் நிலை', 'Partner status') + '</h3>' +
      '<div class="stat-grid">' +
        tile(buckets.active, 'செயலில்', 'Active') +
        tile(buckets.free, 'இலவசம்', 'Free-tier') +
        tile(buckets.hidden, 'தானாக மறைக்கப்பட்டது', 'Auto-hidden') +
      '</div>' +
      '<p class="soon">' + bi('செயலில்: கட்டணம் செலுத்தியவர்கள் அல்லது கால அவகாசத்தில் உள்ளவர்கள்.', 'Active: paid, or still within the grace period.') + '</p>' +
      partnersSection(d);
  }

  // Fee tracking: the admin records payments (the app has no payment gateway).
  function partnersSection(d) {
    var rows = d.partners.filter(function (p) { return !p.is_sample && p.status !== 'free'; });
    if (!rows.length) return '';
    return '<h3>' + bi('கட்டணம் பதிவு செய்', 'Record subscription fees') + '</h3>' +
      '<div class="pooja-grid">' + rows.map(function (p) {
        return '<article class="pooja-card"><strong>' + nameBi(p) + '</strong>' +
          '<div class="badges"><span class="badge">' + bi(PD.ROLE[p.role][0], PD.ROLE[p.role][1]) + '</span>' +
          '<span class="badge">' + esc(p.status) + '</span></div>' +
          '<div class="action-row"><button type="button" class="btn btn-outline" data-act="mark-paid" data-id="' + esc(p.id) + '">' +
          bi('இந்த மாதம் செலுத்தப்பட்டது', 'Mark this month paid') + '</button></div></article>';
      }).join('') + '</div>';
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
    return '<h2>' + bi('கடைகள் (Blind Tie-up)', 'Blind Tie-up Stores') + '</h2>' +
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

  // ---------- Samagri orders ----------
  function ordersSection() {
    return '<h2>' + bi('சாமான் ஆர்டர்கள்', 'Samagri orders') + '</h2>' +
      '<label class="field"><span class="ta">PIN குறியீடு மூலம் வடிகட்டு</span><span class="en">Filter by PIN code</span>' +
        '<input id="order-pin" type="text" inputmode="numeric" maxlength="6" placeholder="600126" value="' + esc(pinFilter.order) + '"></label>' +
      '<div id="orders-list" class="pooja-grid"></div>';
  }

  function orderCard(o, d) {
    var st = ORDER_STATUS[o.status] || ['', ''];
    var done = o.status === 'confirmed_dispatched';
    var contact = done
      ? '<p><strong>' + bi('வாடிக்கையாளர்', 'Customer') + ':</strong> ' + esc(o.customer_name) + ' · ' + phoneLine(o.customer_mobile) + '</p>' +
        '<p><strong>' + bi('கடை', 'Store') + ':</strong> ' + esc(o.vendor_name || '') + ' · ' + phoneLine(o.vendor_phone) + '</p>'
      : '<p class="soon">' + bi('தொடர்பு எண்கள் உறுதிப்படுத்திய பின் காட்டப்படும்.', 'Contact numbers appear once confirmed.') + '</p>';

    var actions = '';
    if (o.status === 'waiting_for_confirmation') {
      var stores = d.vendors.filter(function (v) { return v.is_active && v.pin_code === o.pin_code; });
      var pick = stores.length
        ? '<label class="field"><span class="ta">கடையை ஒதுக்கு</span><span class="en">Assign store</span>' +
          '<select id="store-' + esc(o.id) + '">' + stores.map(function (v) {
            return '<option value="' + esc(v.id) + '">' + esc(v.name) + ' · +91 ' + esc(v.phone) + '</option>';
          }).join('') + '</select></label>'
        : '<p class="form-msg is-error">' + bi(NOTICE.no_store[0], NOTICE.no_store[1]) + '</p>';
      actions = pick + '<div class="action-row">' +
        (stores.length ? '<button type="button" class="btn" data-act="confirm-order" data-id="' + esc(o.id) + '">' +
          bi('உறுதி செய் / அனுப்பு', 'Confirm / Dispatch') + '</button>' : '') +
        '<button type="button" class="btn btn-outline" data-act="unavailable-order" data-id="' + esc(o.id) + '">' +
          bi('கிடைக்கவில்லை', 'Unavailable') + '</button></div>';
    }

    return '<article class="pooja-card">' +
      '<strong>' + nameBi({ name_ta: o.pooja_ta, name_en: o.pooja_en }) + '</strong>' +
      '<div class="badges"><span class="badge">' + bi(st[0], st[1]) + '</span>' +
        '<span class="badge">PIN ' + esc(o.pin_code || '—') + '</span></div>' +
      '<p>' + esc((o.created_at || '').slice(0, 10)) + '</p>' +
      contact + actions +
      '</article>';
  }

  function renderOrders(d) {
    var rows = d.orders.filter(function (o) {
      return !pinFilter.order || String(o.pin_code || '').indexOf(pinFilter.order) === 0;
    });
    $('orders-list').innerHTML = rows.length
      ? rows.map(function (o) { return orderCard(o, d); }).join('')
      : '<p>' + bi('ஆர்டர்கள் இல்லை.', 'No orders match.') + '</p>';
  }

  // ---------- Priest / Cook bookings ----------
  function bookingsSection() {
    return '<h2>' + bi('வாத்தியார் / சமையல்காரர் முன்பதிவுகள்', 'Priest & cook bookings') + '</h2>' +
      '<label class="field"><span class="ta">PIN குறியீடு மூலம் வடிகட்டு</span><span class="en">Filter by PIN code</span>' +
        '<input id="booking-pin" type="text" inputmode="numeric" maxlength="6" placeholder="600126" value="' + esc(pinFilter.booking) + '"></label>' +
      '<div id="bookings-list" class="pooja-grid"></div>';
  }

  function renderBookings(d) {
    var rows = d.bookings.filter(function (b) {
      return !pinFilter.booking || String(b.pin_code || '').indexOf(pinFilter.booking) === 0;
    });
    $('bookings-list').innerHTML = rows.length
      ? rows.map(function (b) {
          var st = PD.STATUS[b.status] || ['', ''];
          return '<article class="pooja-card">' +
            '<strong>' + esc(b.customer_name || '') + ' → ' + nameBi(b) + '</strong>' +
            '<div class="badges"><span class="badge">' + bi(PD.ROLE[b.service_type][0], PD.ROLE[b.service_type][1]) + '</span>' +
              '<span class="badge">' + bi(st[0], st[1]) + '</span>' +
              '<span class="badge">PIN ' + esc(b.pin_code || '—') + '</span></div>' +
            '<p>' + esc(b.event_date) + ' · ' + nameBi({ name_ta: b.pooja_ta, name_en: b.pooja_en }) + '</p>' +
            '</article>';
        }).join('')
      : '<p>' + bi('முன்பதிவுகள் இல்லை.', 'No bookings match.') + '</p>';
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
    return '<h2>' + bi('WhatsApp எச்சரிக்கைகள்', 'WhatsApp alerts') + '</h2>' +
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

  // ---------- Page ----------
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
        box.innerHTML = '<h1>' + bi('நிர்வாக டாஷ்போர்டு', 'Admin Dashboard') + '</h1>' +
          '<div id="admin-notice" class="form-msg" role="status" hidden></div>' +
          tabNav() + tabBody(d);
        if (tab === 'overview') {
          renderOrders(d);
          renderBookings(d);
        }
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

  // ---------- Tabs ----------
  function tabNav() {
    var tabs = [
      ['overview', 'கண்ணோட்டம்', 'Overview'],
      ['catalog', 'பூஜைகள் & கூட்டாளர்கள்', 'Catalog & Partners'],
      ['settings', 'விதிகள் & அமைப்புகள்', 'Settings & Rules']
    ];
    return '<nav class="admin-tabs" aria-label="Admin sections">' + tabs.map(function (t) {
      return '<button type="button" class="btn ' + (tab === t[0] ? '' : 'btn-outline') + '" data-act="tab" data-tab="' + t[0] + '">' +
        bi(t[1], t[2]) + '</button>';
    }).join('') + '</nav>';
  }

  function tabBody(d) {
    if (tab === 'catalog') return vendorsSection(d) + catalogSection(d);
    if (tab === 'settings') return settingsSection();
    return summary(d) + ordersSection() + bookingsSection() + waSection(d);
  }

  // ---------- Catalog & partners: show or hide poojas; approve or hide priests and cooks ----------
  function catalogSection(d) {
    var poojas = d.poojas.map(function (p) {
      return '<tr><td>' + esc(p.name_en) + '</td><td>' + esc(p.name_ta) + '</td><td>' + esc(p.category) + '</td>' +
        '<td><button type="button" class="btn btn-outline" data-act="pooja-visible" data-id="' + esc(p.id) + '" data-visible="' + (!p.is_visible) + '">' +
        (p.is_visible ? bi('மறை', 'Hide') : bi('காட்டு', 'Show')) + '</button></td></tr>';
    }).join('');
    var partners = d.partners.filter(function (p) { return !p.is_sample; }).map(function (p) {
      return '<article class="pooja-card"><strong>' + nameBi(p) + '</strong>' +
        '<div class="badges"><span class="badge">' + bi(PD.ROLE[p.role][0], PD.ROLE[p.role][1]) + '</span>' +
        '<span class="badge">' + (p.is_approved ? bi('அங்கீகரிக்கப்பட்டது', 'Approved') : bi('அங்கீகாரம் நிலுவை', 'Awaiting approval')) + '</span>' +
        (p.is_hidden ? '<span class="badge">' + bi('மறைக்கப்பட்டது', 'Hidden') + '</span>' : '') +
        '<span class="badge">' + esc(p.status) + '</span></div>' +
        '<div class="action-row">' +
        '<button type="button" class="btn" data-act="partner-flags" data-id="' + esc(p.id) + '" data-approved="' + (!p.is_approved) + '" data-hidden="' + !!p.is_hidden + '">' +
          (p.is_approved ? bi('அங்கீகாரத்தை நீக்கு', 'Unapprove') : bi('அங்கீகரி', 'Approve')) + '</button>' +
        '<button type="button" class="btn btn-outline" data-act="partner-flags" data-id="' + esc(p.id) + '" data-approved="' + !!p.is_approved + '" data-hidden="' + (!p.is_hidden) + '">' +
          (p.is_hidden ? bi('மீண்டும் காட்டு', 'Show again') : bi('மறை', 'Hide')) + '</button>' +
        '</div></article>';
    }).join('');
    return '<h2>' + bi('பூஜைகள்', 'Poojas') + '</h2>' +
      '<p class="soon">' + bi('மறைக்கப்பட்ட பூஜைகள் வாடிக்கையாளர்களுக்குக் காட்டப்படாது.', 'Hidden poojas are not shown to customers.') + '</p>' +
      '<div class="table-scroll"><table class="admin-table"><thead><tr><th>English</th><th>தமிழ்</th><th>' +
        bi('பிரிவு', 'Category') + '</th><th></th></tr></thead><tbody>' + poojas + '</tbody></table></div>' +
      '<h2>' + bi('வாத்தியார் / சமையல்காரர்', 'Priests & cooks') + '</h2>' +
      '<p class="soon">' + bi('புதிய கூட்டாளர்கள் அங்கீகரிக்கப்படும் வரை தேடலில் காட்டப்பட மாட்டார்கள்.', 'New partners stay out of search until approved.') + '</p>' +
      (partners || '<p>' + bi('இன்னும் கூட்டாளர்கள் இல்லை.', 'No partners yet.') + '</p>');
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
    var out = '<h2>' + bi('விதிகள் & அமைப்புகள்', 'Settings & rules') + '</h2>' +
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

  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || !last) return;
    var act = b.getAttribute('data-act');
    var id = b.getAttribute('data-id');
    if (act === 'tab') {
      tab = b.getAttribute('data-tab');
      return render();
    }
    if (act === 'pooja-visible') {
      return after(DB.rpc('sa_admin_set_pooja_visible', { p_token: DB.token(), p_pooja: id, p_visible: b.getAttribute('data-visible') === 'true' }),
        NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'partner-flags') {
      return after(DB.rpc('sa_admin_set_partner_flags', {
        p_token: DB.token(), p_partner: id,
        p_approved: b.getAttribute('data-approved') === 'true', p_hidden: b.getAttribute('data-hidden') === 'true'
      }), NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'toggle-vendor') {
      return after(DB.rpc('sa_admin_set_vendor_active', { p_token: DB.token(), p_vendor: id, p_active: b.getAttribute('data-active') === 'true' }),
        NOTICE.saved[0], NOTICE.saved[1]);
    }
    if (act === 'mark-paid') {
      return after(DB.rpc('sa_admin_mark_paid', { p_token: DB.token(), p_partner: id }), NOTICE.paid[0], NOTICE.paid[1]);
    }
    if (act === 'confirm-order') return confirmOrder(id);
    if (act === 'unavailable-order') return markUnavailable(id);
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
