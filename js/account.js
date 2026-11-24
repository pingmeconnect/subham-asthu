/* Subham Asthu — account screens (Phase 2, admin link Phase 5): log in, register, email PIN reset. */
(function () {
  'use strict';

  var A = window.SAAuth;

  // [Tamil, English]
  var MSG = {
    ok_registered: ['பதிவு முடிந்தது. வரவேற்கிறோம்!', 'Registration complete. Welcome!'],
    reset_sent: ['விவரங்கள் பொருந்தினால், பதிவு செய்த மின்னஞ்சலுக்கு 6 இலக்கக் குறியீடு அனுப்பப்படும்.', 'If the details match, a 6-digit code will be sent to your registered email.'],
    ok_reset: ['PIN மாற்றப்பட்டது. இப்போது உள்நுழையலாம்.', 'PIN updated. You can now log in.'],
    invalid_name: ['பெயரை உள்ளிடவும்.', 'Enter your name.'],
    invalid_mobile: ['சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.', 'Enter a valid 10-digit mobile number.'],
    invalid_email: ['சரியான மின்னஞ்சலை உள்ளிடவும்.', 'Enter a valid email address.'],
    invalid_role: ['பதிவு வகையைத் தேர்ந்தெடுக்கவும்.', 'Choose a registration type.'],
    invalid_pin: ['PIN 4 அல்லது 6 இலக்கங்களாக இருக்க வேண்டும்.', 'PIN must be 4 or 6 digits.'],
    pin_mismatch: ['இரண்டு PIN-களும் ஒன்றாக இல்லை.', 'The two PINs do not match.'],
    mobile_taken: ['இந்த மொபைல் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.', 'This mobile number is already registered.'],
    email_taken: ['இந்த மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது.', 'This email is already in use.'],
    invalid_credentials: ['மொபைல் எண் அல்லது PIN தவறு.', 'Mobile number or PIN is incorrect.'],
    locked: ['பல முறை தவறான PIN. சிறிது நேரம் கழித்து முயற்சிக்கவும்.', 'Too many wrong attempts. Please try again later.'],
    reset_invalid_code: ['குறியீடு தவறு அல்லது பொருந்தவில்லை.', 'The code is incorrect or does not match.'],
    reset_expired: ['குறியீட்டின் காலம் முடிந்தது. புதிய குறியீடு கோரவும்.', 'The code has expired. Request a new one.'],
    reset_too_many: ['அதிக முயற்சிகள். புதிய குறியீடு கோரவும்.', 'Too many attempts. Request a new code.'],
    storage: ['சேமிப்பு கிடைக்கவில்லை. உலாவி அமைப்புகளைச் சரிபார்க்கவும்.', 'Storage is unavailable. Check your browser settings.']
  };

  function $(id) { return document.getElementById(id); }

  // Shows the message in both languages; CSS displays only the active one.
  function show(el, code, isError) {
    var m = MSG[code] || MSG.storage;
    el.innerHTML = '<span class="ta">' + m[0] + '</span><span class="en">' + m[1] + '</span>';
    el.classList.toggle('is-error', !!isError);
    el.classList.toggle('is-ok', !isError);
  }

  // Unexpected failures (e.g. localStorage full or blocked) land here.
  function fail(el) {
    show(el, 'storage', true);
  }

  function setView(name) {
    document.querySelectorAll('[data-auth-view]').forEach(function (b) {
      var on = b.getAttribute('data-auth-view') === name;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('[data-auth-panel]').forEach(function (p) {
      p.hidden = p.getAttribute('data-auth-panel') !== name;
    });
  }

  function refresh() {
    return A.currentUser().then(function (u) {
      $('account-in').hidden = !u;
      $('account-out').hidden = !!u;
      if (u) $('account-name').textContent = u.name;
      $('partner-link').hidden = !(u && (u.role === 'priest' || u.role === 'cook'));
      $('admin-link').hidden = !(u && u.role === 'admin');
    });
  }

  // After login, return to the pooja the user was trying to order (set by pooja.js).
  function goReturn() {
    var h = null;
    try {
      h = localStorage.getItem('subham-asthu-return');
      localStorage.removeItem('subham-asthu-return');
    } catch (e) { h = null; }
    if (h) location.hash = h;
  }

  document.querySelectorAll('[data-auth-view]').forEach(function (b) {
    b.addEventListener('click', function () { setView(b.getAttribute('data-auth-view')); });
  });

  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, out = f.querySelector('.form-msg'), d = new FormData(f);
    A.login(d.get('mobile'), d.get('pin')).then(function (r) {
      if (!r.ok) return show(out, r.error, true);
      f.reset();
      out.innerHTML = '';
      return refresh().then(goReturn);
    }).catch(function (err) { fail(out, err); });
  });

  $('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, out = f.querySelector('.form-msg'), d = new FormData(f);
    A.register({
      name: d.get('name'), mobile: d.get('mobile'), email: d.get('email'),
      role: d.get('role'), pin: d.get('pin'), pin2: d.get('pin2')
    }).then(function (r) {
      if (!r.ok) return show(out, r.error, true);
      f.reset();
      show(out, 'ok_registered', false);
      return refresh();
    }).catch(function (err) { fail(out, err); });
  });

  $('reset-request-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, out = f.querySelector('.form-msg'), d = new FormData(f);
    A.requestPinReset(d.get('mobile'), d.get('email')).then(function (r) {
      if (!r.ok) return show(out, r.error, true);
      show(out, 'reset_sent', false);
      $('reset-confirm-form').hidden = false;
    }).catch(function (err) { fail(out, err); });
  });

  $('reset-confirm-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, out = f.querySelector('.form-msg'), d = new FormData(f);
    A.confirmPinReset(d.get('mobile'), d.get('code'), d.get('pin'), d.get('pin2')).then(function (r) {
      if (!r.ok) return show(out, r.error, true);
      f.reset();
      f.hidden = true;
      $('reset-request-form').reset();
      $('reset-request-form').querySelector('.form-msg').innerHTML = '';
      setView('login');
      show($('login-form').querySelector('.form-msg'), 'ok_reset', false);
    }).catch(function (err) { fail(out, err); });
  });

  $('logout-btn').addEventListener('click', function () {
    A.logout().then(refresh);
  });

  setView('login');
  refresh();
})();
