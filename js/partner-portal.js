/* Subham Astu — Partner Portal (Phase 4/6): own profile, booking requests with Accept, and the
   subscription tracker. Subscription rules are shown ONLY here, never on customer pages.
   Fees are recorded as paid by the admin; partners cannot mark their own months paid. */
(function () {
  'use strict';

  var DB = window.SADB;
  var A = window.SAAuth;
  var PD = window.SAPartners;
  var SUB = window.SASub;
  var bi = PD.bi, esc = PD.esc;

  // [Tamil, English]
  var MSG = {
    login: ['பார்ட்னர் போர்ட்டலைப் பார்க்க உள்நுழையவும்.', 'Log in to open the Partner Portal.'],
    partner_only: ['கூட்டாளர் போர்ட்டல் வாத்தியார் / சமையல்காரர்களுக்கானது.', 'The Partner Portal is for priests and cooks.'],
    saved: ['விவரங்கள் சேமிக்கப்பட்டன.', 'Details saved.'],
    phone2_bad: ['இரண்டாவது மொபைல் எண் (10 இலக்கம், முதல் எண்ணிலிருந்து வேறுபட்டது) கட்டாயம்.', 'A second mobile number (10 digits, different from your login number) is required.'],
    areas_bad: ['சேவை வழங்கும் குறைந்தது ஒரு PIN குறியீட்டை (தமிழ்நாடு / புதுச்சேரி) உள்ளிடவும்.', 'Enter at least one Tamil Nadu / Puducherry PIN code you serve.'],
    photo_bad: ['படத்தைச் சேர்க்க முடியவில்லை. வேறு படத்தை முயற்சிக்கவும்.', 'Could not use that photo. Try another one.'],
    pin_bad: ['சரியான 6 இலக்க PIN குறியீட்டை உள்ளிடவும்.', 'Enter a valid 6-digit PIN code.'],
    lang_bad: ['குறைந்தது ஒரு மொழியைத் தேர்ந்தெடுக்கவும்.', 'Choose at least one language.'],
    fail: ['சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not save. Please try again.'],
    free: ['இலவசக் காலம். தேடலில் காட்டப்படும்.', 'Free period. Your profile is visible in search.'],
    paid: ['இந்த மாதத்திற்கான கட்டணம் பதிவு செய்யப்பட்டது. தேடலில் காட்டப்படும்.', 'This month is recorded as paid. Your profile is visible in search.'],
    due: ['இந்த மாதக் கட்டணம் செலுத்த வேண்டும்.', 'This month\'s fee is due.'],
    hidden: ['கட்டணம் செலுத்தாததால் தேடலில் மறைக்கப்பட்டுள்ளது. செலுத்திய பின் நிர்வாகம் பதிவு செய்ததும் மீண்டும் காட்டப்படும்.', 'Unpaid, so hidden from search. It returns once the admin records payment.'],
    no_requests: ['இன்னும் கோரிக்கைகள் இல்லை.', 'No booking requests yet.'],
    accept_note: ['ஏற்ற பின் வாடிக்கையாளர் உங்கள் தொலைபேசி எண்ணைக் காண்பார்.', 'Once you accept, the customer can see your phone number.']
  };

  var STATE_MSG = { free: 'free', paid: 'paid', due: 'due', hidden: 'hidden' };

  var ctx = null; // { role, profile, state, subscription, bookings }
  var photo = { value: null, shown: '' }; // value: null = unchanged, '' = remove, 'data:...' = new

  function $(id) { return document.getElementById(id); }

  function note(code, isError) {
    var m = MSG[code];
    return '<p class="form-msg ' + (isError ? 'is-error' : 'is-ok') + '">' + bi(m[0], m[1]) + '</p>';
  }

  function showMsg(el, code, isError) {
    var m = MSG[code] || MSG.fail;
    el.innerHTML = bi(m[0], m[1]);
    el.classList.toggle('is-error', !!isError);
    el.classList.toggle('is-ok', !isError);
  }

  function areaRow(a) {
    return '<div class="area-row"><input name="apin" type="text" inputmode="numeric" maxlength="6" placeholder="600126" value="' + esc(a ? a.pin : '') + '" aria-label="PIN">' +
      '<input name="aplace" type="text" maxlength="60" placeholder="' + (document.documentElement.getAttribute('data-lang') === 'en' ? 'Place name' : 'இடத்தின் பெயர்') + '" value="' + esc(a ? a.place : '') + '" aria-label="Place">' +
      '<button type="button" class="od-b" data-action="area-del" aria-label="remove">✕</button></div>';
  }
  function areaRows(p) {
    var list = p && p.service_areas && p.service_areas.length ? p.service_areas : (p && p.pin_code ? [{ pin: p.pin_code, place: '' }] : [null]);
    return list.map(areaRow).join('');
  }

  function profileForm(role, p) {
    var langs = PD.LANGS;
    var langBoxes = Object.keys(langs).map(function (k) {
      var on = p && (p.languages || []).indexOf(k) !== -1;
      return '<label class="check-row"><input type="checkbox" name="lang" value="' + k + '"' + (on ? ' checked' : '') + '> ' +
        bi(langs[k][0], langs[k][1]) + '</label>';
    }).join('');
    var options = role === 'priest' ? PD.SAMP : PD.COOK;
    var current = p ? (role === 'priest' ? p.sampradayam : p.cook_specialty) : null;
    var specialty = '<label class="field"><span class="ta">' + (role === 'priest' ? 'சம்பிரதாயம்' : 'சமையல் வகை') +
      '</span><span class="en">' + (role === 'priest' ? 'Sampradayam' : 'Cooking style') + '</span>' +
      '<select name="spec">' + Object.keys(options).map(function (k) {
        return '<option value="' + k + '"' + (current === k ? ' selected' : '') + '>' + options[k][0] + ' · ' + options[k][1] + '</option>';
      }).join('') + '</select></label>';
    return '<form id="profile-form" novalidate>' +
      '<label class="field"><span class="ta">இரண்டாவது மொபைல் எண் (கட்டாயம்) — முதல் எண் கிடைக்காவிட்டால் மட்டும் அழைப்போம்</span><span class="en">Second mobile number (required) — used only if we cannot reach your main number</span>' +
        '<input name="phone2" type="tel" inputmode="numeric" maxlength="10" value="' + esc(p && p.phone2 ? p.phone2 : '') + '" required></label>' +
      '<fieldset class="check-group"><legend>' + bi('எந்தெந்த பகுதிகளில் சேவை வழங்குவீர்கள்? (PIN குறியீடு + இடத்தின் பெயர்)', 'Which areas do you serve? (PIN code + place name)') + '</legend>' +
        '<div id="area-rows">' + areaRows(p) + '</div>' +
        '<button type="button" class="btn btn-outline" data-action="area-add">+ ' + bi('இன்னொரு பகுதி', 'Add another area') + '</button></fieldset>' +
      '<fieldset class="check-group"><legend>' + bi('புகைப்படம் (விருப்பம்)', 'Photo (optional)') + '</legend>' +
        '<div class="photo-pick"><img id="photo-prev" class="photo-prev" alt="" ' + (photo.shown ? 'src="' + esc(photo.shown) + '"' : 'hidden') + '>' +
        '<input id="photo-file" type="file" accept="image/*">' +
        '<button type="button" class="btn btn-outline" data-action="photo-del">' + bi('படத்தை நீக்கு', 'Remove photo') + '</button></div></fieldset>' +
      specialty +
      '<label class="field"><span class="ta">அனுபவம் (ஆண்டுகள்)</span><span class="en">Experience (years)</span>' +
        '<input name="years" type="number" min="0" max="80" value="' + (p ? p.experience_years : 0) + '" required></label>' +
      '<fieldset class="check-group"><legend>' + bi('மொழிகள்', 'Languages') + '</legend>' + langBoxes + '</fieldset>' +
      '<button type="submit" class="btn">' + bi('சேமி', 'Save') + '</button>' +
      '<p class="form-msg" role="status" aria-live="polite"></p>' +
      '</form>';
  }

  function subscriptionCard(role, state, sub) {
    var pre = role === 'priest' ? 'priest' : 'cook';
    var lo = SASettings.int('sub_' + pre + '_fee_min');
    var hi = SASettings.int('sub_' + pre + '_fee_max');
    var step = SASettings.int('sub_fee_step') || 50;
    var fees = [];
    for (var f0 = lo; f0 <= hi; f0 += step) fees.push(f0);
    if (fees[fees.length - 1] !== hi) fees.push(hi);
    var cur = sub ? sub.monthly_fee_inr : lo;
    var feeOpts = fees.map(function (f) {
      return '<option value="' + f + '"' + (f === cur ? ' selected' : '') + '>₹' + f + '</option>';
    }).join('');
    return '<div class="sub-card">' +
      '<h2>' + bi('கட்டண நிலை (கூட்டாளர் மட்டும்)', 'Subscription (partner only)') + '</h2>' +
      '<p>' + bi('முடிந்த நிகழ்ச்சிகள்', 'Completed events') + ': <strong>' + state.completed + ' / ' + SASettings.int('sub_free_events') + '</strong></p>' +
      (state.freeUntil ? '<p>' + bi('இலவசம் வரை', 'Free until') + ': <strong>' + esc(state.freeUntil) + '</strong></p>' : '') +
      (state.billingStart ? '<p>' + bi('கட்டணம் தொடங்கும் நாள்', 'Billing starts') + ': <strong>' + esc(state.billingStart) + '-01</strong></p>' : '') +
      note(STATE_MSG[state.status] || 'free', state.status === 'hidden') +
      '<label class="field"><span class="ta">மாதக் கட்டணம்</span><span class="en">Monthly fee</span>' +
        '<select name="fee" data-action="fee-select">' + feeOpts + '</select></label>' +
      '<button type="button" class="btn btn-outline" data-action="save-fee">' + bi('கட்டணத்தைச் சேமி', 'Save fee') + '</button>' +
      '</div>';
  }

  // Payment details live only in the Partner Portal (subscription privacy rule).
  function payCard(r) {
    var st = r.state && r.state.status;
    if (st !== 'due' && st !== 'hidden') return '';
    var pay = r.pay || {};
    var day = SASettings.int('sub_grace_day');
    return '<div class="pay-box"><strong>' + bi('கட்டணம் செலுத்தும் முறை', 'How to pay your fee') + '</strong>' +
      '<p>' + bi('மாதம் ' + day + '-ஆம் தேதிக்குள் செலுத்தவும்; இல்லையெனில் சுயவிவரம் தேடலில் மறைக்கப்படும்.', 'Please pay by day ' + day + ' of the month, or your profile is hidden from search.') + '</p>' +
      (pay.upi_id ? '<p>UPI ID: <strong>' + esc(pay.upi_id) + '</strong>' + (pay.upi_name ? ' (' + esc(pay.upi_name) + ')' : '') + '</p>'
        : '<p>' + bi('UPI விவரங்களை நிர்வாகத்திடம் கேட்கவும்.', 'Ask the admin for the UPI details.') + '</p>') +
      '<p class="soon">' + bi('செலுத்திய பின் நிர்வாகம் பதிவு செய்தவுடன் மீண்டும் காட்டப்படும்.', 'Once you pay, the admin records it and your profile returns.') + '</p></div>';
  }

  function bookingRow(b) {
    var st = PD.STATUS[b.status];
    var actions = '';
    if (b.status === 'requested') {
      actions = '<button type="button" class="btn" data-action="accept" data-id="' + esc(b.id) + '">' + bi('ஏற்கிறேன்', 'Accept') + '</button> ' +
        '<button type="button" class="btn btn-outline" data-action="decline" data-id="' + esc(b.id) + '">' + bi('நிராகரி', 'Decline') + '</button>';
    } else if (b.status === 'accepted') {
      actions = '<button type="button" class="btn" data-action="complete" data-id="' + esc(b.id) + '">' + bi('நிகழ்ச்சி முடிந்தது', 'Mark completed') + '</button> ' +
        '<button type="button" class="btn btn-outline" data-action="cancel" data-id="' + esc(b.id) + '">' + bi('ரத்து', 'Cancel') + '</button>';
    }
    return '<article class="pooja-card">' +
      '<strong>' + esc(b.customer_name) + '</strong>' +
      '<div class="badges"><span class="badge">' + bi(st[0], st[1]) + '</span>' +
        (b.cook_addon ? '<span class="badge">' + bi('சமையல்காரர் கூடுதல்', 'Cook add-on') + '</span>' : '') + '</div>' +
      '<p>' + esc(b.event_date) + (b.event_time ? ' · ' + esc(b.event_time) : '') + ' · ' + esc(b.pooja_en || '') + ' · PIN ' + esc(b.pin_code) + '</p>' +
      (b.venue_address ? '<p>📍 <strong>' + bi('இடம்', 'Venue') + ':</strong> ' + esc(b.venue_address) + '</p>'
        : (b.status === 'requested' ? '<p class="soon">' + bi('இடத்தின் முகவரி ஏற்ற பின் காட்டப்படும்.', 'The venue address shows after you accept.') + '</p>' : '')) +
      (b.notes ? '<p>📝 ' + esc(b.notes) + '</p>' : '') +
      (actions ? '<div class="action-row">' + actions + '</div>' : '') +
      '</article>';
  }

  function render() {
    var box = $('portal-box');
    return SASettings.ready().then(function () { return A.currentUser(); }).then(function (u) {
      if (!u) {
        box.innerHTML = '<p>' + bi(MSG.login[0], MSG.login[1]) + '</p>' +
          '<p><a class="btn btn-outline" href="#login"><span class="ta">உள்நுழை</span><span class="en">Log in</span></a></p>';
        return;
      }
      return DB.rpc('sa_partner_portal', { p_token: DB.token() }).then(function (r) {
        if (!r.ok) {
          box.innerHTML = '<p>' + bi(MSG.login[0], MSG.login[1]) + '</p>';
          return;
        }
        if (!r.profile) {
          if (r.role !== 'priest' && r.role !== 'cook') {
            ctx = null;
            box.innerHTML = '<p>' + bi(MSG.partner_only[0], MSG.partner_only[1]) + '</p>';
            return;
          }
          // A partner login with no profile yet: create one from the form.
          photo = { value: null, shown: '' };
          ctx = { role: r.role, profile: null, mobile: u.mobile };
          box.innerHTML = '<h1>' + bi('பார்ட்னர் போர்ட்டல்', 'Partner Portal') + '</h1>' +
            '<p>' + bi('முதலில் உங்கள் சுயவிவரத்தை அமைக்கவும்.', 'Set up your profile first.') + '</p>' +
            profileForm(r.role, null);
          return;
        }
        var p = r.profile;
        photo = { value: null, shown: p.photo_url || '' };
        ctx = { role: p.role, profile: p, state: r.state, subscription: r.subscription, mobile: u.mobile };
        box.innerHTML = '<h1>' + bi(esc(p.name_ta || p.name_en), esc(p.name_en || p.name_ta)) + '</h1>' +
          '<h2>' + bi('சுயவிவரம்', 'Profile') + '</h2>' + profileForm(p.role, p) +
          (SASettings.bool('subscriptions_enabled') ? subscriptionCard(p.role, r.state, r.subscription) + payCard(r) : '') +
          '<h2>' + bi('முன்பதிவு கோரிக்கைகள்', 'Booking requests') + '</h2>' +
          '<p class="soon">' + bi(MSG.accept_note[0], MSG.accept_note[1]) + '</p>' +
          (r.bookings.length ? '<div class="pooja-grid">' + r.bookings.map(bookingRow).join('') + '</div>'
            : '<p>' + bi(MSG.no_requests[0], MSG.no_requests[1]) + '</p>');
      });
    });
  }

  function setStatus(id, status) {
    return DB.rpc('sa_set_booking_status', { p_token: DB.token(), p_booking: id, p_status: status });
  }

  // ---------- Events ----------
  $('portal-box').addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b || !ctx) return;
    var act = b.getAttribute('data-action');
    var id = b.getAttribute('data-id');
    var next = function () { return render(); };
    if (act === 'area-add') { document.getElementById('area-rows').insertAdjacentHTML('beforeend', areaRow(null)); return; }
    if (act === 'area-del') { var rows = document.querySelectorAll('#area-rows .area-row'); if (rows.length > 1) b.closest('.area-row').remove(); return; }
    if (act === 'photo-del') { photo.value = ''; photo.shown = ''; var im = document.getElementById('photo-prev'); im.hidden = true; im.removeAttribute('src'); return; }
    if (act === 'accept') return setStatus(id, 'accepted').then(next);
    if (act === 'decline') return setStatus(id, 'declined').then(next);
    if (act === 'complete') return setStatus(id, 'completed').then(next);
    if (act === 'cancel') return setStatus(id, 'cancelled').then(next);
    if (act === 'save-fee') {
      var fee = parseInt(document.querySelector('select[name="fee"]').value, 10);
      return DB.rpc('sa_set_fee', { p_token: DB.token(), p_fee: fee }).then(next);
    }
  });

  $('portal-box').addEventListener('change', function (e) {
    if (e.target.id !== 'photo-file' || !e.target.files[0]) return;
    window.SAExtras.toDataUrl(e.target.files[0], 240).then(function (u) {
      photo.value = u; photo.shown = u;
      var im = document.getElementById('photo-prev'); im.src = u; im.hidden = false;
    }).catch(function () { showMsg(document.querySelector('#profile-form .form-msg'), 'photo_bad', true); });
  });

  $('portal-box').addEventListener('submit', function (e) {
    if (e.target.id !== 'profile-form') return;
    e.preventDefault();
    var f = e.target;
    var out = f.querySelector('.form-msg');
    var d = new FormData(f);
    var langs = d.getAll('lang');
    var phone2 = String(d.get('phone2') || '').replace(/\D/g, '');
    var pins = d.getAll('apin'), places = d.getAll('aplace');
    var areas = [];
    pins.forEach(function (pn, i) { pn = String(pn).trim(); if (pn || String(places[i]).trim()) areas.push({ pin: pn, place: String(places[i] || '').trim() }); });
    if (!/^[6-9]\d{9}$/.test(phone2) || (ctx && ctx.mobile && phone2 === ctx.mobile)) return showMsg(out, 'phone2_bad', true);
    if (!areas.length || !areas.every(function (a) { return window.SARegion.okPin(a.pin); })) return showMsg(out, 'areas_bad', true);
    if (!langs.length) return showMsg(out, 'lang_bad', true);

    DB.rpc('sa_save_profile_v2', {
      p_token: DB.token(), p_spec: String(d.get('spec') || ''),
      p_years: parseInt(d.get('years'), 10) || 0, p_langs: langs,
      p_phone2: phone2, p_areas: areas, p_photo: photo.value
    }).then(function (r) {
      if (!r.ok) return showMsg(out, ['phone2_bad', 'areas_bad', 'photo_bad', 'lang_bad'].indexOf(r.error) !== -1 ? r.error : 'fail', true);
      return render();
    }).catch(function () { showMsg(out, 'fail', true); });
  });

  function route() {
    if ((location.hash || '') !== '#partner') return;
    render();
  }

  window.addEventListener('hashchange', route);
  route();
})();
