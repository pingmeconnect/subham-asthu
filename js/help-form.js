/* Subham Astu — help & suggestions form on the Help page (#help). Sends to sa_submit_contact;
   the admin reads the messages in Admin > உதவி & பரிந்துரைகள். */
(function () {
  'use strict';

  var MSG = {
    sent: ['நன்றி! உங்கள் செய்தி கிடைத்தது. விரைவில் தொடர்புகொள்வோம்.', 'Thank you! We received your message and will contact you soon.'],
    bad_name: ['பெயர் 2 முதல் 80 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Name must be 2 to 80 characters.'],
    bad_mobile: ['கைபேசி எண் 10 இலக்கங்களாக இருக்க வேண்டும்.', 'Mobile number must be 10 digits.'],
    bad_kind: ['வகையைத் தேர்ந்தெடுக்கவும்.', 'Please choose a type.'],
    bad_message: ['செய்தி 5 முதல் 1000 எழுத்துகளுக்குள் இருக்க வேண்டும்.', 'Message must be 5 to 1000 characters.'],
    too_many: ['இன்று இந்த எண்ணிலிருந்து அதிக செய்திகள் அனுப்பப்பட்டுவிட்டன. நாளை மீண்டும் முயற்சிக்கவும்.', 'Too many messages from this number today. Please try again tomorrow.'],
    fail: ['செய்தியை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not send the message. Please try again.']
  };

  function show(msgEl, pair, isError) {
    msgEl.innerHTML = '<span class="ta">' + pair[0] + '</span><span class="en">' + pair[1] + '</span>';
    msgEl.classList.toggle('is-error', !!isError);
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'help-form') return;
    e.preventDefault();
    var msgEl = form.querySelector('.form-msg');
    var f = new FormData(form);
    var payload = {
      p_name: String(f.get('name') || '').trim(),
      p_mobile: String(f.get('mobile') || '').replace(/\D/g, ''),
      p_kind: String(f.get('kind') || ''),
      p_message: String(f.get('message') || '').trim()
    };
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    window.SADB.rpc('sa_submit_contact', payload).then(function (r) {
      if (r && r.ok) {
        form.reset();
        show(msgEl, MSG.sent, false);
      } else {
        show(msgEl, MSG[(r && r.error) || 'fail'] || MSG.fail, true);
      }
    }).catch(function () {
      show(msgEl, MSG.fail, true);
    }).then(function () { button.disabled = false; });
  });
})();
