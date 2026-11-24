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
    pin_bad: ['சரியான 6 இலக்க PIN குறியீட்டை உள்ளிடவும்.', 'Enter a valid 6-digit PIN code.'],
    pooja_bad: ['பூஜை / நிகழ்ச்சியைத் தேர்ந்தெடுக்கவும்.', 'Choose a pooja or event.'],
    unavailable: ['இந்தச் சேவை வழங்குநர் இப்போது கிடைக்கவில்லை.', 'This partner is not available right now.'],
    fail: ['முன்பதிவு அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not send the request. Please try again.'],
    none: ['பொருந்தும் வாத்தியார் / சமையல்காரர் இல்லை.', 'No priests or cooks match these filters.'],
    waiting: ['வாத்தியார் / சமையல்காரர் ஏற்ற பின் தொலைபேசி எண் காட்டப்படும்.', 'The phone number appears after the partner accepts.'],
    call: ['நேரடியாக அழைத்துத் தட்சணையை முடிவு செய்யவும்.', 'Call to agree the dakshina directly.'],
    time_bad: ['நிகழ்ச்சி நேரத்தைத் தேர்ந்தெடுக்கவும்.', 'Choose the event time.'],
    address_bad: ['நிகழ்ச்சி நடக்கும் இடத்தின் முகவரியை முழுமையாக (குறைந்தது 10 எழுத்துகள்) உள்ளிடவும்.', 'Enter the full address of the venue (at least 10 characters).'],
    notes_bad: ['குறிப்பு 300 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Notes must be within 300 characters.'],
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
    var l = PD.LANGS[key] || PD.SAMP[key];
    return bi(l[0], l[1]);
  }

  // ---------- Directory ----------
  function card(p) {
    var specialty = p.role === 'priest'
      ? langLabel(p.sampradayam)
      : bi(PD.COOK[p.cook_specialty][0], PD.COOK[p.cook_specialty][1]);
    var langs = (p.languages || []).map(langLabel).join('');
    return '<article class="pooja-card partner-card">' +
      '<strong>' + nameOf(p) + '</strong>' +
      '<div class="badges">' +
        '<span class="badge">' + bi(PD.ROLE[p.role][0], PD.ROLE[p.role][1]) + '</span>' +
        '<span class="badge">' + specialty + '</span>' +
        '<span class="badge">' + bi(p.experience_years + ' ஆண்டுகள் அனுபவம்', p.experience_years + ' yrs experience') + '</span>' +
        langs +
      '</div>' +
      '<p class="partner-pin">' + bi('PIN குறியீடு', 'PIN code') + ': ' + esc(p.pin_code) + '</p>' +
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
      var rows = all.filter(function (p) { return !lang || matchesLang(p, lang); });
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
          '<label class="field"><span class="ta">நிகழ்ச்சி நடக்கும் இடத்தின் முகவரி</span><span class="en">Venue address</span>' +
            '<textarea name="venue" rows="3" maxlength="300" required></textarea></label>' +
          '<label class="field"><span class="ta">குறிப்பு (விருப்பம்)</span><span class="en">Notes (optional)</span>' +
            '<textarea name="notes" rows="2" maxlength="300"></textarea></label>' +
          (p.role === 'priest'
            ? '<label class="check-row"><input type="checkbox" name="cook_addon"> ' +
              bi('சமையல்காரரும் தேவை (கூடுதல்)', 'Also need a cook (add-on)') + '</label>'
            : '') +
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
    if (notes.length > 300) return setMsg(out, 'notes_bad', true);
    if (!/^\d{6}$/.test(pin)) return setMsg(out, 'pin_bad', true);
    if (!slug) return setMsg(out, 'pooja_bad', true);

    return DB.rpc('sa_create_booking', {
      p_token: DB.token(), p_partner: pid, p_pooja_slug: slug, p_event_date: date,
      p_pin: pin, p_cook_addon: d.get('cook_addon') === 'on',
      p_time: time, p_venue: venue, p_notes: notes
    }).then(function (r) {
      if (!r.ok) return setMsg(out, r.error, true);
      form.reset();
      setMsg(out, 'req_ok', false);
      return renderMine();
    }).catch(function () { setMsg(out, 'fail', true); });
  }

  // ---------- My bookings (customer view) ----------
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
            '</article>';
        }).join('');

        box.innerHTML = '<h2>' + bi('என் முன்பதிவுகள்', 'My bookings') + '</h2>' +
          (rows.length ? '<div class="pooja-grid">' + list + '</div>' : '<p>' + bi(MSG.no_bookings[0], MSG.no_bookings[1]) + '</p>');
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
