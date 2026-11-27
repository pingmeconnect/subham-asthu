/* Sankalpam — Partner Portal (Phase 4/6): own profile, booking requests with Accept, and the
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
    trad_bad: ['குறைந்தது ஒரு மரபையாவது தேர்ந்தெடுக்கவும்.', 'Choose at least one tradition.'],
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
    var trads = (p && p.traditions && p.traditions.length) ? p.traditions : (p && p.sampradayam ? [p.sampradayam] : []);
    var specialty = role === 'priest'
      ? '<fieldset class="check-group"><legend>' + bi('நீங்கள் செய்யும் மரபுகள் (ஒன்றுக்கு மேல் தேர்ந்தெடுக்கலாம்)', 'Traditions you perform (choose one or more)') + '</legend>' +
        Object.keys(PD.SAMP).map(function (k) {
          return '<label class="check-row"><input type="checkbox" name="trad" value="' + k + '"' + (trads.indexOf(k) !== -1 ? ' checked' : '') + '> ' + bi(PD.SAMP[k][0], PD.SAMP[k][1]) + '</label>';
        }).join('') + '</fieldset>'
      : '<label class="field"><span class="ta">' + (role === 'priest' ? 'சம்பிரதாயம்' : 'சமையல் வகை') +
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

  // One plan for priests and cooks, shown as separate labelled boxes (Tamil + English).
  function subBox(ta, en, valueHtml, extraClass) {
    return '<div class="sub-box' + (extraClass ? ' ' + extraClass : '') + '">' +
      '<span class="sub-label"><span class="ta">' + ta + '</span><span class="en">' + en + '</span></span>' +
      '<strong class="sub-value">' + valueHtml + '</strong></div>';
  }
  function subscriptionCard(role, state) {
    var after = state.standardAfter || 5;
    var trialDays = SASettings.int('sub_trial_days');
    var starter = SASettings.int('sub_starter_fee');
    var standard = SASettings.int('sub_standard_fee');
    var tierTa = state.tier === 'standard' ? 'நிலையான திட்டம்' : state.tier === 'starter' ? 'தொடக்கத் திட்டம்' : 'இலவச சோதனைக் காலம்';
    var tierEn = state.tier === 'standard' ? 'Standard plan' : state.tier === 'starter' ? 'Starter plan' : 'Free trial';
    var statusTa = state.status === 'paid' ? 'செலுத்தப்பட்டது' : state.status === 'due' ? 'நிலுவை உள்ளது' : state.status === 'hidden' ? 'நிலுவை – சுயவிவரம் மறைக்கப்பட்டது' : 'இலவசம்';
    var statusEn = state.status === 'paid' ? 'Paid' : state.status === 'due' ? 'Payment due' : state.status === 'hidden' ? 'Overdue – profile hidden' : 'Free';
    var boxes =
      subBox('தற்போதைய திட்டம்', 'Current plan', '<span class="ta">' + tierTa + '</span><span class="en">' + tierEn + '</span>') +
      subBox('மாத கட்டணம்', 'Monthly fee', (state.fee ? '₹' + state.fee : '₹0') + ' <small>/ ' + bi('மாதம்', 'month') + '</small>') +
      subBox('முடிந்த ஆர்டர்கள்', 'Completed orders', String(state.completed) + ' <small>(' + after + ' ' + bi('வரை Starter', 'Starter up to') + ')</small>') +
      (state.tier === 'trial'
        ? subBox('சோதனை முடியும் நாள்', 'Trial ends', esc(state.trialEnd) + ' <small>(' + trialDays + ' ' + bi('நாட்கள்', 'days') + ' + 1 ' + bi('ஆர்டர்', 'order') + ')</small>')
        : '') +
      (state.billingStart ? subBox('கட்டணம் தொடங்கும் மாதம்', 'Billing starts', esc(state.billingStart)) : '') +
      subBox('நிலை', 'Status', '<span class="ta">' + statusTa + '</span><span class="en">' + statusEn + '</span>', 'sub-status-' + (state.status || 'free'));
    var rules =
      '<div class="sub-box sub-wide"><span class="sub-label"><span class="ta">திட்ட விதிகள்</span><span class="en">Plan rules</span></span>' +
      '<ul class="sub-rules">' +
        '<li><span class="ta">1 முதல் ' + after + ' முடிந்த ஆர்டர்கள்: ₹' + starter + ' / மாதம்.</span><span class="en">Orders 1 to ' + after + ': ₹' + starter + ' / month.</span></li>' +
        '<li><span class="ta">' + (after + 1) + '-ஆவது முடிந்த ஆர்டரிலிருந்து: ₹' + standard + ' / மாதம்.</span><span class="en">From order ' + (after + 1) + ': ₹' + standard + ' / month.</span></li>' +
        '<li><span class="ta">முதல் ஆர்டர் முடிந்து, ' + trialDays + ' நாட்கள் கழிந்த பின்பே கட்டணம் தொடங்கும்.</span><span class="en">Billing starts only after your first completed order AND ' + trialDays + ' days have both passed.</span></li>' +
      '</ul></div>';
    var pay =
      '<div class="sub-box sub-wide"><span class="sub-label"><span class="ta">கட்டணம் செலுத்தும் முறை</span><span class="en">How to pay</span></span>' +
      '<p><span class="ta">UPI மூலம் செலுத்தவும். பரிவர்த்தனை எண் அல்லது ஸ்கிரீன்ஷாட்டை நிர்வாகத்திற்கு அனுப்பவும்.</span><span class="en">Pay by UPI, then send the transaction ID or a screenshot to the admin.</span></p></div>';
    return '<div class="sub-card">' +
      '<h2><span class="ta">திட்டம் &amp; கட்டணம் (கூட்டாளர் மட்டும்)</span><span class="en">Plan &amp; fee (partner only)</span></h2>' +
      '<div class="sub-grid">' + boxes + rules + pay + '</div>' +
      note(STATE_MSG[state.status] || 'free', state.status === 'hidden') +
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

  function prefsText(pf) {
    var out = [];
    if (pf.tradition) out.push(bi('மரபு: ', 'Tradition: ') + bi(PD.SAMP[pf.tradition][0], PD.SAMP[pf.tradition][1]));
    if (pf.guests) out.push(bi('நபர்கள்: ', 'Guests: ') + esc(pf.guests));
    if (pf.meal && PD.MEAL[pf.meal]) out.push(bi(PD.MEAL[pf.meal][0], PD.MEAL[pf.meal][1]));
    if (pf.guests) out.push(pf.kitchen ? bi('சமையலறை உள்ளது', 'Kitchen available') : bi('சமையலறை இல்லை', 'No kitchen at venue'));
    return out.join(' · ');
  }

  function bookingRow(b) {
    var st = PD.STATUS[b.status];
    var actions = '';
    if (b.status === 'requested') {
      actions = '<button type="button" class="btn" data-action="accept" data-id="' + esc(b.id) + '">' + bi('ஏற்கிறேன்', 'Accept') + '</button> ' +
        '<button type="button" class="btn btn-outline" data-action="decline" data-id="' + esc(b.id) + '">' + bi('நிராகரி', 'Decline') + '</button>';
    } else if (b.status === 'accepted') {
      actions = '<p class="soon">' + bi('நிகழ்ச்சி முடிந்த பின் வாடிக்கையாளர் உறுதிப்படுத்துவார்.', 'The customer confirms completion after the event.') + '</p>' +
        '<button type="button" class="btn btn-outline" data-action="cancel" data-id="' + esc(b.id) + '">' + bi('முடியவில்லை / ரத்து', 'Could not finalise / Cancel') + '</button>';
    }
    return '<article class="pooja-card">' +
      '<strong>' + esc(b.customer_name) + '</strong>' +
      '<div class="badges"><span class="badge">' + bi(st[0], st[1]) + '</span>' +
        (b.cook_addon ? '<span class="badge">' + bi('சமையல்காரர் கூடுதல்', 'Cook add-on') + '</span>' : '') + '</div>' +
      '<p>' + esc(b.event_date) + (b.event_time ? ' · ' + esc(b.event_time) : '') + ' · ' + esc(b.pooja_en || '') + ' · PIN ' + esc(b.pin_code) + '</p>' +
      (b.prefs && b.prefs.area ? '<p>📍 <strong>' + bi('பகுதி', 'Area') + ':</strong> ' + esc(b.prefs.area) + '</p>' : '') +
      (b.venue_address ? '<p>🏠 <strong>' + bi('முழு முகவரி', 'Full address') + ':</strong> ' + esc(b.venue_address) + '</p>'
        : (b.status === 'requested' ? '<p class="soon">' + bi('முழு முகவரி மற்றும் தொலைபேசி எண் ஏற்ற பின் காட்டப்படும்.', 'The full address and phone number show after you accept.') + '</p>' : '')) +
      (b.customer_mobile ? '<p>📞 <strong>' + bi('வாடிக்கையாளர்', 'Customer') + ':</strong> ' + esc(b.customer_name || '') + ' · <a href="tel:+91' + esc(b.customer_mobile) + '">+91 ' + esc(b.customer_mobile) + '</a></p>'
        : '') +
      (b.prefs ? '<p class="soon"><strong>' + bi('வாடிக்கையாளர் விருப்பம்:', 'Customer wants:') + '</strong> ' + prefsText(b.prefs) + '</p>' : '') +
      (b.notes ? '<p>📝 ' + esc(b.notes) + '</p>' : '') +
      (actions ? '<div class="action-row">' + actions + '</div>' : '') +
      '</article>';
  }

  function render() {
    var box = $('portal-box');
    return SASettings.ready().then(function () { return A.currentUser(); }).then(function (u) {
      if (!u) {
        box.innerHTML = '<h1>' + bi('வாத்தியார் / சமையல்காரராக இணையுங்கள்', 'Join as Priest / Cook') + '</h1>' +
          '<ol class="join-steps">' +
          '<li>' + bi('கணக்கு உருவாக்குங்கள்: மொபைல் எண், PIN, மின்னஞ்சல்.', 'Create an account: mobile number, PIN and email.') + '</li>' +
          '<li>' + bi('பதிவு செய்யும்போது வகையாக "வாத்தியார்" அல்லது "சமையல்காரர்" தேர்ந்தெடுங்கள்.', 'While signing up, choose the role "Priest" or "Cook".') + '</li>' +
          '<li>' + bi('உங்கள் சுயவிவரம் மற்றும் சேவைப் பகுதியை நிரப்புங்கள். சரிபார்த்த பின் பட்டியலில் தெரியும்.', 'Complete your profile and service area. Your listing appears after review.') + '</li>' +
          '</ol>' +
          '<p class="join-actions"><a class="btn" href="#login" data-join-role="priest"><span class="ta">வாத்தியாராகப் பதிவு</span><span class="en">Sign up as Priest</span></a> <a class="btn btn-outline" href="#login" data-join-role="cook"><span class="ta">சமையல்காரராகப் பதிவு</span><span class="en">Sign up as Cook</span></a></p>' +
          '<p class="soon">' + bi('ஏற்கெனவே வாத்தியார் அல்லது சமையல்காரராக பதிவு செய்திருந்தால் உள்நுழையவும்.', 'Already registered as a priest or cook? Log in to open your portal.') + '</p>';
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
          (SASettings.bool('subscriptions_enabled') ? subscriptionCard(p.role, r.state) + payCard(r) : '') +
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
    if (act === 'cancel') {
      var why = window.prompt('ரத்துக்கான காரணம் (குறைந்தது 3 எழுத்துகள்) / Reason for cancelling (at least 3 characters):');
      if (!why || why.trim().length < 3) return;
      return DB.rpc('sa_set_booking_status', { p_token: DB.token(), p_booking: id, p_status: 'cancelled', p_reason: why.trim() }).then(next);
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

    var trads = d.getAll('trad');
    if (ctx && ctx.role === 'priest' && !trads.length) return showMsg(out, 'trad_bad', true);
    DB.rpc('sa_save_profile_v3', {
      p_token: DB.token(), p_spec: String(d.get('spec') || ''), p_traditions: trads,
      p_years: parseInt(d.get('years'), 10) || 0, p_langs: langs,
      p_phone2: phone2, p_areas: areas, p_photo: photo.value
    }).then(function (r) {
      if (!r.ok) return showMsg(out, ['phone2_bad', 'areas_bad', 'photo_bad', 'lang_bad', 'trad_bad'].indexOf(r.error) !== -1 ? r.error : 'fail', true);
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
