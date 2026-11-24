/* Subham Asthu — WhatsApp message previews (Phase 5/7). The database queues and renders the live
   messages from app_settings (sa_queue_wa). This file only previews the same templates for the
   Admin screen, using the sample values stored in settings. Exactly four triggers:
     1  order_received                      Samagri order received
     2  order_confirmed / order_unavailable Samagri order final status
     3  booking_confirmed                   Priest/Cook accepted; direct contact shared
     4  reminder_1day                       One day before the event */
(function () {
  'use strict';

  var PREFIX = 'சுபம் அஸ்து:';

  // Template keys map to settings keys wa_tpl_<key> ({ta, en}).
  var KEYS = ['order_received', 'order_confirmed', 'order_unavailable', 'booking_confirmed', 'reminder_1day'];

  // Admin screen labels (UI text only).
  var TITLES = {
    order_received: ['1 · ஆர்டர் பெறப்பட்டது', '1 · Order received'],
    order_confirmed: ['2a · ஆர்டர் உறுதி / அனுப்பப்பட்டது', '2a · Order confirmed / dispatched'],
    order_unavailable: ['2b · ஆர்டர் கிடைக்கவில்லை', '2b · Order unavailable'],
    booking_confirmed: ['3 · முன்பதிவு உறுதி', '3 · Booking confirmed'],
    reminder_1day: ['4 · 1 நாள் முன் நினைவூட்டல்', '4 · One-day reminder']
  };

  function fill(text, data, i) {
    return String(text || '').replace(/\{(\w+)\}/g, function (_, k) {
      var v = data[k];
      if (Array.isArray(v)) v = v[i];
      return v == null ? '' : String(v);
    });
  }

  // Full preview text in one language, always starting with the prefix.
  function preview(key, lang) {
    var i = lang === 'ta' ? 0 : 1;
    var tpl = window.SASettings.text('wa_tpl_' + key, lang);
    return PREFIX + ' ' + fill(tpl, window.SASettings.get('wa_sample') || {}, i);
  }

  window.SAWA = {
    KEYS: KEYS,
    TITLES: TITLES,
    preview: preview
  };
})();
