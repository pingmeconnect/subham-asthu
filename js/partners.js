/* Subham Astu — priest/cook directory, booking request, My bookings (Phase 4/6).
   Public: directory. Login: request a booking. Phone numbers are never listed; the server
   returns them only on a booking the partner has accepted. */
(function () {
  'use strict';

  var DB = window.SADB;
  var A = window.SAAuth;
  var P = window.SAPoojas;
  var PD = window.SAPartners;
  var SUB = window.SASub;
  var RETURN_KEY = 'subham-asthu-return';
  var visiblePoojas = []; // poojas the admin has left visible, loaded on route
  var bi = PD.bi, esc = PD.esc;

  // [Tamil, English]
  var MSG = {
    req_ok: ['கோரிக்கை அனுப்பப்பட்டது. வாத்தியார் / சமையல்காரர் ஏற்ற பின் தொலைபேசி எண் காட்டப்படும்.', 'Request sent. The phone number appears once the partner accepts.'],
    login_first: ['முன்பதிவு செய்ய முதலில் உள்நுழையவும்.', 'Please log in first to request a booking.'],
    date_bad: ['இன்றோ அதற்குப் பின்னரோ உள்ள தேதியைத் தேர்ந்தெடுக்கவும்.', 'Choose a date today or later.'],
    pin_bad: ['தமிழ்நாடு / புதுச்சேரியின் சரியான 6 இலக்க PIN குறியீட்டை உள்ளிடவும்.', 'Enter a valid 6-digit Tamil Nadu / Puducherry PIN code.'],
    pooja_bad: ['பூஜை / நிகழ்ச்சியைத் தேர்ந்தெடுக்கவும்.', 'Choose a pooja or event.'],
    unavailable: ['இந்தச் சேவை வழங்குநர் இப்போது கிடைக்கவில்லை.', 'This partner is not available right now.'],
    fail: ['முன்பதிவு அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not send the request. Please try again.'],
    none: ['பொருந்தும் வாத்தியார் / சமையல்காரர் இல்லை.', 'No priests or cooks match these filters.'],
    waiting: ['வாத்தியார் / சமையல்காரர் ஏற்ற பின் தொலைபேசி எண் காட்டப்படும்.', 'The phone number appears after the partner accepts.'],
    call: ['நேரடியாக அழைத்துத் தட்சிணையை முடிவு செய்யவும்.', 'Call to agree the dakshina directly.'],
    time_bad: ['நிகழ்ச்சி நேரத்தைத் தேர்ந்தெடுக்கவும்.', 'Choose the event time.'],
    area_bad: ['பகுதி / நகர் பெயரை உள்ளிடவும்.', 'Please enter the area / nagar name.'],
    address_bad: ['நிகழ்ச்சி நடக்கும் இடத்தின் முகவரியை முழுமையாக (குறைந்தது 10 எழுத்துகள்) உள்ளிடவும்.', 'Enter the full address of the venue (at least 10 characters).'],
    notes_bad: ['குறிப்பு 300 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Notes must be within 300 characters.'],
    guests_bad: ['எத்தனை பேருக்குச் சமையல் என்பதையும் உணவு வகையையும் தேர்ந்தெடுக்கவும்.', 'Enter how many guests and choose the meal type.'],
    prefs_bad: ['மரபைச் சரியாகத் தேர்ந்தெடுக்கவும்.', 'Please choose a valid tradition.'],
    no_bookings: ['இன்னும் முன்பதிவுகள் இல்லை.', 'No bookings yet.']
  };

  function $(id) { return document.getElementById(id); }

  function setMsg(el, code, isError) {
    var m = MSG[code] || MSG.fail;
    el.innerHTML = bi(m[0], m[1]);
    el.classList.toggle('is-error', !!isError);
    el.classList.toggle('is-ok', !isError);
  }

  function nameOf(p) {
    return bi(esc(p.name_ta || p.name_en || ''), esc(p.name_en || p.name_ta || ''));
  }

  function matchesLang(p, key) {
    return (p.languages || []).indexOf(key) !== -1 || p.sampradayam === key;
  }

  function langLabel(key) {
    var l = PD.LANGS[key] || PD.SAMP[key] || [key, key];
    return bi(l[0], l[1]);
  }

  // ---------- Directory ----------
  function card(p) {
    var specialty = p.role === 'priest'
      ? ((p.traditions && p.traditions.length ? p.traditions : [p.sampradayam]).filter(Boolean).map(function (k) { return '<span class="badge">' + langLabel(k) + '</span>'; }).join(''))
      : '<span class="badge">' + bi(PD.COOK[p.cook_specialty][0], PD.COOK[p.cook_specialty][1]) + '</span>';
    var vlevel = p.verify_level ? '<span class="badge badge-ok">✔ ' + bi(PD.VERIFY[p.verify_level][0], PD.VERIFY[p.verify_level][1]) + '</span>' : '';
    var langs = (p.languages || []).map(langLabel).join('');
    var areas = (p.areas || []).map(function (a) {
      return '<span class="badge">' + esc(a.pin) + (a.place ? ' · ' + esc(a.place) : '') + '</span>';
    }).join('');
    return '<article class="pooja-card partner-card">' +
      '<div class="pcard-head">' + (p.photo_url ? '<img class="pcard-photo" src="' + esc(p.photo_url) + '" alt="" loading="lazy">'
        : '<span class="pcard-photo pcard-nophoto" aria-hidden="true">🙏</span>') + '<strong>' + nameOf(p) + '</strong></div>' +
      '<div class="badges">' +
        '<span class="badge">' + bi(PD.ROLE[p.role][0], PD.ROLE[p.role][1]) + '</span>' +
        specialty + vlevel +
        '<span class="badge">' + bi(p.experience_years + ' ஆண்டுகள் அனுபவம்', p.experience_years + ' yrs experience') + '</span>' +
        langs +
      '</div>' +
      '<p class="partner-pin">' + bi('சேவை வழங்கும் பகுதிகள்', 'Areas served') + ':</p><div class="badges">' + areas + '</div>' +
      '<button type="button" class="btn btn-wide" data-request="' + esc(p.id) + '">' +
        bi('முன்பதிவு கோரிக்கை', 'Request booking') + '</button>' +
      '</article>';
  }

  // Visible profiles come from the server (hidden when unpaid, no phone numbers included).
  function renderList() {
    var role = $('f-role').value;
    var lang = $('f-lang').value;
    var pin = $('f-pin').value.replace(/\D/g, '');
    return DB.rpc('sa_list_partners', { p_role: role || null, p_lang: null, p_pin: pin || null }).then(function (all) {
      var trad = ($('f-trad') || {}).value || '';
      var rows = all.filter(function (p) {
        if (lang && !matchesLang(p, lang)) return false;
        if (!trad) return true;
        if (PD.SAMP[trad]) return p.role !== 'priest' || (p.traditions || []).indexOf(trad) !== -1 || (p.traditions || []).indexOf('General') !== -1;
        return p.role !== 'cook' || p.cook_specialty === trad;
      });
      $('partner-list').innerHTML = rows.map(card).join('');
      $('partner-empty').hidden = rows.length > 0;
      if (rows.length === 0) setMsg($('partner-empty'), 'none', false);
    });
  }

  // ---------- Booking request ----------
  function renderForm(pid) {
    var box = $('booking-box');
    if (!pid) { box.hidden = true; box.innerHTML = ''; return Promise.resolve(); }
    return DB.rpc('sa_partner_public', { p_id: pid }).then(function (p) {
      box.hidden = false;
      if (!p) {
        box.innerHTML = '<p class="form-msg is-error">' + bi(MSG.unavailable[0], MSG.unavailable[1]) + '</p>';
        return;
      }
      var opts = visiblePoojas.map(function (q) {
        return '<option value="' + esc(q.slug) + '">' + esc(q.name_en) + ' · ' + esc(q.name_ta) + '</option>';
      }).join('');
      box.innerHTML = '<h2>' + bi('முன்பதிவு கோரிக்கை', 'Request booking') + '</h2>' +
        '<p>' + bi('வாத்தியார்:', 'Partner:') + ' <strong>' + nameOf(p) + '</strong> · ' +
          bi(PD.ROLE[p.role][0], PD.ROLE[p.role][1]) + '</p>' +
        '<form id="booking-form" data-partner="' + esc(p.id) + '" novalidate>' +
          '<label class="field"><span class="ta">நிகழ்ச்சி தேதி</span><span class="en">Event date</span>' +
            '<input name="event_date" type="date" min="' + SUB.today() + '" required></label>' +
          '<label class="field"><span class="ta">நிகழ்ச்சி நேரம்</span><span class="en">Event time</span>' +
            '<input name="event_time" type="time" value="07:00" required></label>' +
          '<label class="field"><span class="ta">பூஜை / நிகழ்ச்சி</span><span class="en">Pooja / event</span>' +
            '<select name="pooja_slug" required><option value="">—</option>' + opts + '</select></label>' +
          '<label class="field"><span class="ta">PIN குறியீடு (6 இலக்கம்)</span><span class="en">PIN code (6 digits)</span>' +
            '<input name="pin" type="text" inputmode="numeric" maxlength="6" value="' + esc(p.pin_code) + '" required></label>' +
          '<label class="field"><span class="ta">பகுதி / நகர் பெயர் (ஏற்கும் முன் காட்டப்படும்)</span><span class="en">Area / nagar name (shown before they accept)</span>' +
            '<input name="area" type="text" maxlength="80" placeholder="' + (document.documentElement.getAttribute('data-lang') === 'en' ? 'e.g. Anna Nagar, Chennai' : 'எ.கா. அண்ணா நகர், சென்னை') + '" required></label>' +
          '<label class="field"><span class="ta">முழு முகவரி (கதவு எண், அடுக்குமாடி பெயர் — ஏற்ற பின் மட்டும் காட்டப்படும்)</span><span class="en">Full address (door no., flat name — shown only after they accept)</span>' +
            '<textarea name="venue" rows="3" maxlength="300" required></textarea></label>' +
          '<label class="field"><span class="ta">குறிப்பு (விருப்பம்)</span><span class="en">Notes (optional)</span>' +
            '<textarea name="notes" rows="2" maxlength="300"></textarea></label>' +
          (p.role === 'priest'
            ? '<label class="field"><span class="ta">உங்கள் குடும்ப மரபு (விருப்பம்)</span><span class="en">Your family tradition (optional)</span>' +
              '<select name="tradition"><option value="">' + (document.documentElement.getAttribute('data-lang') === 'en' ? 'Any' : 'எதுவும்') + '</option>' +
              Object.keys(PD.SAMP).map(function (k) { return '<option value="' + k + '">' + esc(PD.SAMP[k][0] + ' · ' + PD.SAMP[k][1]) + '</option>'; }).join('') + '</select></label>'
            : '<label class="field"><span class="ta">எத்தனை பேருக்குச் சமையல்?</span><span class="en">How many guests?</span>' +
              '<input name="guests" type="number" inputmode="numeric" min="1" max="2000" required></label>' +
              '<label class="field"><span class="ta">உணவு வகை</span><span class="en">Meal type</span><select name="meal">' +
              Object.keys(PD.MEAL).map(function (k) { return '<option value="' + k + '">' + esc(PD.MEAL[k][0] + ' · ' + PD.MEAL[k][1]) + '</option>'; }).join('') + '</select></label>' +
              '<label class="check-row"><input type="checkbox" name="kitchen" checked> ' + bi('இடத்தில் சமையலறை வசதி உள்ளது', 'A kitchen is available at the venue') + '</label>' +
              '<p class="soon">' + bi('அனைத்து சமையல்காரர்களும் சுத்த சைவ உணவு மட்டுமே சமைப்பார்கள்.', 'All cooks on Subham Asthu cook pure vegetarian food only.') + '</p>') +
          (p.role === 'priest'
            ? '<label class="check-row"><input type="checkbox" name="cook_addon"> ' +
              bi('சமையல்காரரும் தேவை (கூடுதல்)', 'Also need a cook (add-on)') + '</label>'
            : '') +
          '<p class="od-notes-box soon">' + bi('முடிவு செய்ய, இந்த வாத்தியார் / சமையல்காரர் உங்கள் பகுதி, தேதி மற்றும் தேவைகளை மட்டுமே பார்ப்பார். முழு முகவரி மற்றும் தொலைபேசி எண் அவர் ஏற்ற பின் மட்டுமே பகிரப்படும்.', 'To decide, this priest / cook will see only your area, date and requirements. Your full address and phone number are shared only after they accept.') + '</p>' +
          '<p class="od-notes-box soon">' + bi('முன்பணம் தேவைப்பட்டால், உங்கள் முன்பதிவு ஏற்கப்பட்ட பின், சரிபார்க்கப்பட்ட நபருக்கு மட்டும் கொடுக்கவும். சுபம் அஸ்து உங்களிடம் ஒருபோதும் பணம் கேட்காது.',
            'If an advance is asked for, pay it only after your booking is accepted, and only to a verified person. Subham Asthu never asks you for money.') + '</p>' +
          '<button type="submit" class="btn">' + bi('கோரிக்கை அனுப்பு', 'Send request') + '</button>' +
          '<p class="form-msg" role="status" aria-live="polite"></p>' +
        '</form>';
    });
  }

  function placeBooking(pid, form) {
    var out = form.querySelector('.form-msg');
    var d = new FormData(form);
    var date = String(d.get('event_date') || '');
    var pin = String(d.get('pin') || '').trim();
    var slug = String(d.get('pooja_slug') || '');
    var time = String(d.get('event_time') || '');
    var venue = String(d.get('venue') || '').trim();
    var notes = String(d.get('notes') || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < SUB.today()) return setMsg(out, 'date_bad', true);
    if (!/^[0-2]\d:[0-5]\d$/.test(time)) return setMsg(out, 'time_bad', true);
    if (venue.length < 10) return setMsg(out, 'address_bad', true);
    var area = String(d.get('area') || '').trim();
    if (area.length < 2) return setMsg(out, 'area_bad', true);
    if (notes.length > 300) return setMsg(out, 'notes_bad', true);
    if (!window.SARegion.okPin(pin)) return setMsg(out, 'pin_bad', true);
    if (!slug) return setMsg(out, 'pooja_bad', true);

    var prefs = { area: area };
    if (d.get('tradition')) prefs.tradition = String(d.get('tradition'));
    if (d.get('guests') !== null) { prefs.guests = String(d.get('guests') || ''); prefs.meal = String(d.get('meal') || ''); prefs.kitchen = d.get('kitchen') === 'on'; }
    return DB.rpc('sa_create_booking_v2', {
      p_token: DB.token(), p_partner: pid, p_pooja_slug: slug, p_event_date: date,
      p_pin: pin, p_cook_addon: d.get('cook_addon') === 'on',
      p_time: time, p_venue: venue, p_notes: notes, p_prefs: prefs
    }).then(function (r) {
      if (!r.ok) return setMsg(out, r.error, true);
      form.reset();
      setMsg(out, 'req_ok', false);
      return renderMine();
    }).catch(function () { setMsg(out, 'fail', true); });
  }

  // ---------- My bookings (customer view) ----------
  function prefsLine(pf) {
    var out = [];
    if (pf.tradition) out.push(bi('மரபு: ', 'Tradition: ') + langLabel(pf.tradition));
    if (pf.guests) out.push(bi('நபர்கள்: ', 'Guests: ') + esc(pf.guests));
    if (pf.meal && PD.MEAL[pf.meal]) out.push(bi(PD.MEAL[pf.meal][0], PD.MEAL[pf.meal][1]));
    return out.join(' · ');
  }

  function renderMine() {
    var box = $('my-bookings');
    return A.currentUser().then(function (u) {
      box.hidden = !u;
      if (!u) return;
      return DB.rpc('sa_my_bookings', { p_token: DB.token() }).then(function (r) {
        var rows = r.bookings || [];
        var list = rows.map(function (b) {
          var st = PD.STATUS[b.status];
          var contact = b.partner_phone
            ? '<p><strong>' + bi('தொலைபேசி', 'Phone') + ': <a href="tel:+91' + esc(b.partner_phone) + '">+91 ' + esc(b.partner_phone) + '</a></strong><br>' +
              bi(MSG.call[0], MSG.call[1]) + '</p>'
            : '<p class="soon">' + bi(MSG.waiting[0], MSG.waiting[1]) + '</p>';
          return '<article class="pooja-card">' +
            '<strong>' + nameOf(b) + '</strong>' +
            '<div class="badges">' +
              '<span class="badge">' + bi(PD.ROLE[b.service_type][0], PD.ROLE[b.service_type][1]) + '</span>' +
              '<span class="badge">' + bi(st[0], st[1]) + '</span>' +
              (b.cook_addon ? '<span class="badge">' + bi('சமையல்காரர் கூடுதல்', 'Cook add-on') + '</span>' : '') +
            '</div>' +
            '<p>' + esc(b.event_date) + (b.event_time ? ' · ' + esc(b.event_time) : '') + ' · ' + esc(b.pooja_en || '') + '</p>' +
            (b.venue_address ? '<p class="soon">📍 ' + esc(b.venue_address) + '</p>' : '') +
            contact +
            (b.prefs ? '<p>' + prefsLine(b.prefs) + '</p>' : '') +
            (b.status === 'cancelled' && b.cancel_reason ? '<p class="soon">' + bi('ரத்துக்கான காரணம்:', 'Reason:') + ' ' + esc(b.cancel_reason) + '</p>' : '') +
            (b.can_confirm ? '<div class="confirm-box"><p><strong>' + bi('நிகழ்ச்சி சிறப்பாக நடந்ததா?', 'Did the service go smoothly?') + '</strong></p>' +
              '<button type="button" class="btn" data-confirm="yes" data-id="' + esc(b.id) + '">' + bi('ஆம்', 'Yes') + '</button> ' +
              '<button type="button" class="btn btn-outline" data-confirm="no" data-id="' + esc(b.id) + '">' + bi('இல்லை', 'No') + '</button></div>' : '') +
            window.SAExtras.feedbackHtml('booking', b.id, (b.status === 'accepted' || b.status === 'completed') && b.event_date <= SUB.today(), b.feedback) +
            '</article>';
        }).join('');

        box.innerHTML = '<h2>' + bi('என் முன்பதிவுகள்', 'My bookings') + '</h2>' +
          (rows.length ? '<div class="pooja-grid">' + list + '</div>' : '<p>' + bi(MSG.no_bookings[0], MSG.no_bookings[1]) + '</p>');
        window.SAExtras.bindFeedback(box, renderMine);
        if (!box.dataset.confirmBound) {
          box.dataset.confirmBound = '1';
          box.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-confirm]');
            if (!btn) return;
            DB.rpc('sa_confirm_completion', { p_token: DB.token(), p_booking: btn.getAttribute('data-id'), p_done: btn.getAttribute('data-confirm') === 'yes' })
              .then(function () { return renderMine(); });
          });
        }
      });
    });
  }

  // ---------- Routing & events ----------
  function openRequest(pid) {
    A.currentUser().then(function (u) {
      if (!u) {
        try { localStorage.setItem(RETURN_KEY, '#bookings/' + pid); } catch (e) { /* session only */ }
        location.hash = '#login';
        return;
      }
      location.hash = '#bookings/' + pid;
    });
  }

  function route() {
    var parts = (location.hash || '').split('/');
    if (parts[0] !== '#bookings') return;
    if (parts[1] === 'priest' || parts[1] === 'cook') { $('f-role').value = parts[1]; parts[1] = ''; }
    P.seed().then(function (rows) {
      visiblePoojas = rows;
      return PD.seed();
    }).then(function () {
      return Promise.all([renderList(), renderMine(), renderForm(parts[1] || '')]);
    }).catch(function () { setMsg($('partner-empty'), 'fail', true); });
  }

  $('f-role').addEventListener('change', renderList);
  $('f-lang').addEventListener('change', renderList);
  $('f-trad').addEventListener('change', renderList);
  $('f-pin').addEventListener('input', renderList);

  $('partner-list').addEventListener('click', function (e) {
    var b = e.target.closest('[data-request]');
    if (b) openRequest(b.getAttribute('data-request'));
  });

  $('booking-box').addEventListener('submit', function (e) {
    if (e.target.id !== 'booking-form') return;
    e.preventDefault();
    placeBooking(e.target.getAttribute('data-partner'), e.target);
  });

  window.addEventListener('hashchange', route);
  route();
})();
