/* Subham Astu — priest/cook labels and fee ranges (Phase 4). Partner rows live in the
   database (partner_profiles); placeholder profiles are seeded there and hidden from customers. */
(function () {
  'use strict';

  // [Tamil, English]
  var LANGS = {
    Tamil: ['தமிழ்', 'Tamil'], Sanskrit: ['சமஸ்கிருதம்', 'Sanskrit'], Telugu: ['தெலுங்கு', 'Telugu'],
    Kannada: ['கன்னடம்', 'Kannada'], Malayalam: ['மலையாளம்', 'Malayalam'], English: ['ஆங்கிலம்', 'English']
  };
  var SAMP = {
    Vadagalai: ['வடகலை', 'Vadagalai'], Thenkalai: ['தென்கலை', 'Thenkalai'],
    Smartha: ['ஸ்மார்த்தம்', 'Smartha'], Madhva: ['மாத்வ', 'Madhva']
  };
  var COOK = {
    iyer_veg: ['சைவ சமையல் (ஐயர்)', 'Vegetarian (Iyer style)'],
    iyengar_veg: ['சைவ சமையல் (ஐயங்கார்)', 'Vegetarian (Iyengar style)'],
    festival_sweets: ['பண்டிகை இனிப்புகள்', 'Festival sweets']
  };
  var ROLE = { priest: ['வாத்தியார்', 'Priest'], cook: ['சமையல்காரர்', 'Cook'] };
  var STATUS = {
    requested: ['கோரிக்கை அனுப்பப்பட்டது', 'Request sent'],
    accepted: ['ஏற்கப்பட்டது', 'Accepted'],
    declined: ['நிராகரிக்கப்பட்டது', 'Declined'],
    completed: ['முடிந்தது', 'Completed'],
    cancelled: ['ரத்து செய்யப்பட்டது', 'Cancelled']
  };

  function bi(ta, en) {
    return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Kept for callers; the database already holds the placeholder partners.
  function seed() {
    return Promise.resolve();
  }

  window.SAPartners = {
    LANGS: LANGS, SAMP: SAMP, COOK: COOK, ROLE: ROLE, STATUS: STATUS,
    seed: seed, bi: bi, esc: esc
  };
})();
