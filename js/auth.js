/* Subham Astu — mobile + PIN auth on Supabase (Phase 6).
   The database checks PINs (bcrypt), lockouts and reset codes. The browser keeps only the
   session token. No SMS/WhatsApp OTP: email is the only PIN-reset channel. */
(function () {
  'use strict';

  var DB = window.SADB;

  function remember(r) {
    if (r && r.ok && r.token) DB.setToken(r.token);
    return r;
  }

  function register(input) {
    if (input.pin !== input.pin2) return Promise.resolve({ ok: false, error: 'pin_mismatch' });
    return DB.rpc('sa_register', {
      p_name: input.name, p_mobile: input.mobile, p_email: input.email,
      p_role: input.role, p_pin: input.pin,
      p_consent: !!input.consent, p_marketing: !!input.marketing, p_hp: input.hp || ''
    }).then(remember);
  }

  function login(mobile, pin) {
    return DB.rpc('sa_login', { p_mobile: mobile, p_pin: pin }).then(remember);
  }

  function logout() {
    var t = DB.token();
    DB.setToken(null);
    if (!t) return Promise.resolve();
    return DB.rpc('sa_logout', { p_token: t }).catch(function () { /* already signed out */ });
  }

  function currentUser() {
    var t = DB.token();
    if (!t) return Promise.resolve(null);
    return DB.rpc('sa_me', { p_token: t }).then(function (u) {
      if (!u) DB.setToken(null);
      return u;
    });
  }

  // Always answers the same way, so the form cannot reveal which mobile/email pairs exist.
  function requestPinReset(mobile, email) {
    return DB.rpc('sa_request_pin_reset', { p_mobile: mobile, p_email: email }).then(function (r) {
      kickEmail();
      return r;
    });
  }

  // Asks the email sender (Supabase Edge Function "send-outbox") to deliver queued emails.
  // Fire and forget: if the sender is not set up yet, nothing breaks.
  function kickEmail() {
    try {
      var c = window.SA_CONFIG;
      fetch(c.SUPABASE_URL + '/functions/v1/send-outbox', {
        method: 'POST',
        headers: { 'apikey': c.SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: '{}'
      }).catch(function () { /* sender not deployed yet */ });
    } catch (e) { /* ignore */ }
  }

  function changePin(oldPin, newPin, newPin2) {
    if (newPin !== newPin2) return Promise.resolve({ ok: false, error: 'pin_mismatch' });
    return DB.rpc('sa_change_pin', { p_token: DB.token(), p_old: oldPin, p_new: newPin });
  }

  function setMarketing(on) {
    return DB.rpc('sa_set_marketing', { p_token: DB.token(), p_on: !!on });
  }

  function deleteAccount(pin) {
    return DB.rpc('sa_delete_my_account', { p_token: DB.token(), p_pin: pin }).then(function (r) {
      if (r && r.ok) DB.setToken(null);
      return r;
    });
  }

  function confirmPinReset(mobile, code, pin, pin2) {
    return DB.rpc('sa_confirm_pin_reset', { p_mobile: mobile, p_code: code, p_pin: pin, p_pin2: pin2 });
  }

  window.SAAuth = {
    register: register,
    login: login,
    logout: logout,
    currentUser: currentUser,
    requestPinReset: requestPinReset,
    confirmPinReset: confirmPinReset,
    changePin: changePin,
    setMarketing: setMarketing,
    deleteAccount: deleteAccount,
    kickEmail: kickEmail
  };
})();
