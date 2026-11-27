/* Sankalpam — Contact Us form (#contact). Public: no login needed. Saves through sa_submit_contact.
   Email is optional. Admin sees enquiries in the Help & suggestions tab. */
(function () {
  'use strict';

  var REASONS = [
    ['General Enquiry', 'பொதுவான விசாரணை'],
    ['Booking Related', 'முன்பதிவு தொடர்பானது'],
    ['Samagri Order Related', 'பூஜைப் பொருள் ஆர்டர் தொடர்பானது'],
    ['Priest / Cook Partner Enquiry', 'புரோகிதர் / சமையல் கலைஞர் விசாரணை'],
    ['Technical Issue', 'தொழில்நுட்பச் சிக்கல்'],
    ['Privacy Related', 'தனியுரிமை தொடர்பானது'],
    ['Complaint / Feedback', 'புகார் / கருத்து'],
    ['Report Inappropriate Behaviour', 'தகாத நடத்தையைப் புகாரளி'],
    ['Other', 'பிற']
  ];
  var MSG = {
    sent: ['நன்றி! உங்கள் விசாரணை பெறப்பட்டது. குறிப்பு எண்: ', 'Thank you! Your enquiry was received. Reference: '],
    bad_kind: ['விசாரணைக் காரணத்தைத் தேர்ந்தெடுக்கவும்.', 'Please choose a reason for enquiry.'],
    bad_name: ['பெயர் 2 முதல் 80 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Name must be 2 to 80 characters.'],
    bad_mobile: ['கைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்.', 'Mobile number must be 10 digits.'],
    bad_email: ['மின்னஞ்சல் முகவரி சரியாக இல்லை.', 'Email address is not valid.'],
    bad_message: ['செய்தி 5 முதல் 1000 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Message must be 5 to 1000 characters.'],
    too_many: ['இன்று அதிக விசாரணைகள் அனுப்பப்பட்டுவிட்டன. நாளை மீண்டும் முயற்சிக்கவும்.', 'Too many enquiries today. Please try again tomorrow.'],
    fail: ['விசாரணையை அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.', 'Could not send your enquiry. Please try again shortly.']
  };

  function show(el, pair, extra, isError) {
    if (!el) return;
    var tail = extra || '';
    el.innerHTML = pair[0] ? '<span class="ta">' + pair[0] + tail + '</span><span class="en">' + pair[1] + tail + '</span>' : '';
    el.setAttribute('data-err', isError ? '1' : '0');
  }

  function bind() {
    var form = document.getElementById('contact-form');
    if (!form || form.getAttribute('data-bound')) return;
    form.setAttribute('data-bound', '1');
    var status = document.getElementById('contact-status');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!window.SADB) { show(status, MSG.fail, '', true); return; }
      var f = form.elements;
      var payload = {
        p_kind: f.reason.value,
        p_name: f.name.value.trim(),
        p_mobile: f.mobile.value.trim(),
        p_email: f.email.value.trim(),
        p_message: f.message.value.trim()
      };
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      show(status, ['', ''], '', false);
      window.SADB.rpc('sa_submit_contact', payload).then(function (res) {
        btn.disabled = false;
        if (res && res.ok) {
          form.reset();
          show(status, MSG.sent, String(res.id || '').slice(0, 8).toUpperCase(), false);
          return;
        }
        var key = (res && res.error) || 'fail';
        show(status, MSG[key] || MSG.fail, '', true);
      }).catch(function () {
        btn.disabled = false;
        show(status, MSG.fail, '', true);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  window.addEventListener('hashchange', bind);
})();
