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
    Smartha: ['ஸ்மார்த்தம்', 'Smartha'], Madhva: ['மாத்வ', 'Madhva'],
    Saiva: ['சைவம் (குருக்கள் / சிவாச்சாரியார்)', 'Saiva (Gurukkal)'],
    Amman: ['அம்மன் / கிராம தெய்வ பூசாரி', 'Amman / village-deity poosari'],
    TamilArchanai: ['தமிழ் அர்ச்சனை', 'Tamil archanai'],
    General: ['பொது (எந்த மரபும்)', 'General (any tradition)']
  };
  var COOK = {
    iyer_veg: ['சைவ சமையல் (ஐயர்)', 'Vegetarian (Iyer style)'],
    iyengar_veg: ['சைவ சமையல் (ஐயங்கார்)', 'Vegetarian (Iyengar style)'],
    general_veg: ['சைவ சமையல் (பொது)', 'Vegetarian (general)'],
    chettinad_veg: ['செட்டிநாடு சைவ சமையல்', 'Chettinad vegetarian'],
    kongu_veg: ['கொங்கு சைவ சமையல்', 'Kongu vegetarian'],
    festival_sweets: ['பண்டிகை இனிப்புகள்', 'Festival sweets']
  };
  var MEAL = {
    tiffin: ['டிபன்', 'Tiffin'], lunch: ['மதிய உணவு', 'Lunch'],
    feast: ['முழு விருந்து', 'Full feast'], snacks: ['சிற்றுண்டி / இனிப்பு', 'Snacks & sweets']
  };
  var VERIFY = {
    1: ['தொலைபேசி சரிபார்க்கப்பட்டது', 'Phone verified'],
    2: ['வீடியோ மூலம் சரிபார்க்கப்பட்டது', 'Video verified'],
    3: ['பரிந்துரை சரிபார்க்கப்பட்டது', 'Reference verified']
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
    LANGS: LANGS, SAMP: SAMP, COOK: COOK, MEAL: MEAL, VERIFY: VERIFY, ROLE: ROLE, STATUS: STATUS,
    seed: seed, bi: bi, esc: esc
  };
})();
