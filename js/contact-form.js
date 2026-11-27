/* Sankalpam — public Contact Us form (#contact). No login needed.
   Submissions go to sa_submit_contact, which returns a reference number. */
(function () {
  'use strict';

  // Nine reason categories from the owner's rules. Tamil wording is a draft pending owner review.
  var REASONS = [
    { code: 'general', ta: 'பொதுவான விசாரணை', en: 'General Enquiry' },
    { code: 'booking', ta: 'முன்பதிவு தொடர்பானது', en: 'Booking Related' },
    { code: 'order', ta: 'பூஜைப் பொருள் ஆர்டர் தொடர்பானது', en: 'Samagri Order Related' },
    { code: 'partner', ta: 'வாத்தியார் / சமையலர் கூட்டாளர் விசாரணை', en: 'Priest / Cook Partner Enquiry' },
    { code: 'technical', ta: 'தொழில்நுட்பச் சிக்கல்', en: 'Technical Issue' },
    { code: 'privacy', ta: 'தனியுரிமை தொடர்பானது', en: 'Privacy Related' },
    { code: 'complaint', ta: 'புகார் / கருத்து', en: 'Complaint / Feedback' },
    { code: 'report', ta: 'தகாத நடத்தையைப் புகாரளிக்க', en: 'Report Inappropriate Behaviour' },
    { code: 'other', ta: 'மற்றவை', en: 'Other' }
  ];
  var MSG = {
    sent: ['நன்றி! உங்கள் கோரிக்கை கிடைத்தது.', 'Thank you! Your enquiry has been received.'],
    bad_reason: ['விசாரணை வகையைத் தேர்ந்தெடுக்கவும்.', 'Please choose a reason for contact.'],
    bad_name: ['பெயரை உள்ளிடவும் (2 முதல் 80 எழுத்துகள்).', 'Please enter your name (2 to 80 characters).'],
    bad_mobile: ['சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்.', 'Please enter a valid 10-digit mobile number.'],
    bad_email: ['மின்னஞ்சல் முகவரி சரியாக இல்லை.', 'The email address is not valid.'],
    bad_message: ['செய்தி 10 முதல் 1000 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Message must be 10 to 1000 characters.'],
    too_many: ['இன்று அதிக கோரிக்கைகள் அனுப்பப்பட்டுவிட்டன. நாளை மீண்டும் முயற்சிக்கவும்.', 'Too many enquiries today. Please try again tomorrow.'],
    fail: ['அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not send. Please try again.']
  };

  var box = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bi(ta, en) { return '<span class="ta">' + esc(ta) + '</span><span class="en">' + esc(en) + '</span>'; }

  function reasonOptions() {
    return '<option value="">' + bi('தேர்ந்தெடுக்கவும்', 'Choose') + '</option>' + REASONS.map(function (r) {
      return '<option value="' + r.code + '">' + esc(r.ta) + ' / ' + esc(r.en) + '</option>';
    }).join('');
  }

  function render() {
    box.innerHTML =
      '<form id="contact-form" class="help-form" novalidate>' +
        '<label class="field"><span class="ta">விசாரணை வகை</span><span class="en">Reason for contact</span>' +
          '<select name="reason" required>' + reasonOptions() + '</select></label>' +
        '<label class="field"><span class="ta">பெயர்</span><span class="en">Name</span>' +
          '<input name="name" type="text" maxlength="80" required autocomplete="name"></label>' +
        '<label class="field"><span class="ta">கைபேசி எண்</span><span class="en">Mobile number</span>' +
          '<input name="mobile" type="tel" inputmode="numeric" maxlength="10" required autocomplete="tel"></label>' +
        '<label class="field"><span class="ta">மின்னஞ்சல் (விருப்பம்)</span><span class="en">Email (optional)</span>' +
          '<input name="email" type="email" maxlength="120" autocomplete="email"></label>' +
        '<label class="field"><span class="ta">உங்கள் செய்தி</span><span class="en">Your message</span>' +
          '<textarea name="message" rows="5" maxlength="1000" required></textarea></label>' +
        '<div class="action-row"><button type="submit" class="btn btn-gold">' + bi('அனுப்பு', 'Send') + '</button></div>' +
        '<p class="form-msg" role="status" aria-live="polite"></p>' +
      '</form>';
  }

  function validate(v) {
    if (!v.reason) return 'bad_reason';
    if (v.name.length < 2 || v.name.length > 80) return 'bad_name';
    if (!/^[6-9][0-9]{9}$/.test(v.mobile)) return 'bad_mobile';
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) return 'bad_email';
    if (v.message.length < 10 || v.message.length > 1000) return 'bad_message';
    return null;
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'contact-form') return;
    e.preventDefault();
    var msgEl = form.querySelector('.form-msg');
    var button = form.querySelector('button[type="submit"]');
    var v = {
      reason: form.reason.value,
      name: form.name.value.trim(),
      mobile: form.mobile.value.replace(/\s+/g, ''),
      email: form.email.value.trim(),
      message: form.message.value.trim()
    };
    var show = function (pair, isErr) {
      msgEl.innerHTML = bi(pair[0], pair[1]);
      msgEl.classList.toggle('is-error', !!isErr);
    };
    var bad = validate(v);
    if (bad) return show(MSG[bad], true);

    button.disabled = true;
    window.SADB.rpc('sa_submit_contact', {
      p_reason: v.reason, p_name: v.name, p_mobile: v.mobile, p_email: v.email || null, p_message: v.message
    }).then(function (r) {
      if (r && r.ok) {
        msgEl.innerHTML = bi(MSG.sent[0], MSG.sent[1]) + ' <strong>' + bi('குறிப்பு எண்', 'Reference') + ': ' + esc(r.reference) + '</strong>';
        msgEl.classList.remove('is-error');
        form.reset();
      } else {
        show(MSG[(r && r.error) || 'fail'] || MSG.fail, true);
      }
    }).catch(function () { show(MSG.fail, true); })
      .then(function () { button.disabled = false; });
  });

  if (document.readyState !== 'loading') {
    box = document.getElementById('contact-form-box');
    if (box) render();
  }
})();
