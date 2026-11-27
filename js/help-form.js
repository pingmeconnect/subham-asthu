/* Sankalpam — Help Centre (#help). Only logged-in customers can send a request. Requests go to
   sa_submit_help_request; the admin answers them in Admin > உதவி மையம். Replies show here as a
   notification (a badge on the Account tab, and a "new reply" banner). */
(function () {
  'use strict';

  // Categories and prefilled questions. Question codes are checked by the database (letter + digit).
  var CATS = [
    { code: 'booking', ta: 'வாத்தியார் / சமையல்காரர் முன்பதிவு', en: 'Priest / cook booking' },
    { code: 'order', ta: 'பூஜைப் பொருட்கள் ஆர்டர்', en: 'Pooja items order' },
    { code: 'guides', ta: 'வழிகாட்டி PDF', en: 'Guide PDF' },
    { code: 'panchang', ta: 'பஞ்சாங்கம் / ராசி பலன்', en: 'Panchang / Rasi palan' },
    { code: 'account', ta: 'கணக்கு / உள்நுழைவு', en: 'Account / login' },
    { code: 'other', ta: 'மற்றவை', en: 'Other' }
  ];
  var QUESTIONS = {
    booking: [['b1', 'என் முன்பதிவை எப்படி மாற்றுவது?', 'How do I change my booking?'], ['b2', 'முன்பதிவு நிலை என்ன?', 'What is my booking status?'], ['b3', 'வாத்தியார் எப்போது உறுதிப்படுத்துவார்?', 'When will the priest confirm?']],
    order: [['o1', 'ஆர்டரை எப்படி ரத்து செய்வது?', 'How do I cancel an order?'], ['o2', 'ஆர்டர் எப்போது வரும்?', 'When will my order arrive?'], ['o3', 'பணம் செலுத்துவது எப்படி?', 'How do I pay?']],
    guides: [['g1', 'PDF பதிவிறக்கம் ஆகவில்லை', 'The PDF will not download'], ['g2', 'வழிகாட்டியை எப்படிப் பயன்படுத்துவது?', 'How do I use a guide?']],
    panchang: [['p1', 'பஞ்சாங்கம் தவறாக உள்ளது', 'Panchang looks wrong'], ['p2', 'ராசி பலனை எப்படிப் பார்ப்பது?', 'How do I see Rasi palan?']],
    account: [['a1', 'PIN மறந்துவிட்டது', 'I forgot my PIN'], ['a2', 'கணக்கை நீக்குவது எப்படி?', 'How do I delete my account?']],
    other: []
  };
  var MSG = {
    sent: ['நன்றி! உங்கள் கோரிக்கை கிடைத்தது. பதில் வந்ததும் இங்கே அறிவிப்பு தோன்றும்.', 'Thank you! Your request was received. The reply will appear here as a notification.'],
    login_required: ['கோரிக்கை அனுப்ப முதலில் உள்நுழையவும்.', 'Please log in first to send a request.'],
    bad_category: ['வகையைத் தேர்ந்தெடுக்கவும்.', 'Please choose a category.'],
    bad_message: ['விவரம் 5 முதல் 1000 எழுத்துகளுக்குள் இருக்க வேண்டும் (கேள்வி தேர்ந்தெடுக்காவிட்டால்).', 'Details must be 5 to 1000 characters (if you did not pick a question).'],
    too_many: ['இன்று அதிக கோரிக்கைகள் அனுப்பப்பட்டுவிட்டன. நாளை மீண்டும் முயற்சிக்கவும்.', 'Too many requests today. Please try again tomorrow.'],
    fail: ['கோரிக்கையை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not send the request. Please try again.']
  };

  var DB = function () { return window.SADB; };
  var box = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function bi(ta, en) { return '<span class="ta">' + esc(ta) + '</span><span class="en">' + esc(en) + '</span>'; }
  function catLabel(code) {
    var c = CATS.filter(function (x) { return x.code === code; })[0];
    return c ? bi(c.ta, c.en) : '';
  }
  function questionLabel(cat, code) {
    var q = (QUESTIONS[cat] || []).filter(function (x) { return x[0] === code; })[0];
    return q ? bi(q[1], q[2]) : '';
  }
  function fmtDate(iso) {
    return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  }

  // Badge on the Account tab of the bottom menu, showing how many replies are new.
  function updateBadge(unseen) {
    document.querySelectorAll('[data-nav="login"]').forEach(function (link) {
      var dot = link.querySelector('.help-dot');
      if (unseen > 0 && !dot) {
        dot = document.createElement('span');
        dot.className = 'help-dot';
        dot.setAttribute('aria-label', 'New reply');
        dot.style.cssText = 'position:absolute;top:4px;right:calc(50% - 16px);min-width:16px;height:16px;border-radius:8px;background:#c0392b;color:#fff;font-size:11px;line-height:16px;text-align:center;padding:0 4px;';
        dot.textContent = String(unseen);
        link.style.position = 'relative';
        link.appendChild(dot);
      } else if (unseen > 0 && dot) {
        dot.textContent = String(unseen);
      } else if (dot) {
        dot.remove();
      }
    });
  }

  function loginPrompt() {
    box.innerHTML = '<div class="help-login">' +
      '<p>' + bi('உதவி கோரிக்கை அனுப்ப உள்நுழையவும். பதில் வந்ததும் இங்கே அறிவிப்பு தோன்றும்.', 'Log in to send a help request. Replies will show here as a notification.') + '</p>' +
      '<div class="action-row"><a class="btn btn-gold" href="#login">' + bi('உள்நுழைய / பதிவு', 'Log in / Register') + '</a></div></div>';
  }

  function categoryOptions() {
    return '<option value="">' + bi('தேர்ந்தெடுக்கவும்', 'Choose') + '</option>' + CATS.map(function (c) {
      return '<option value="' + c.code + '">' + esc(c.ta) + ' / ' + esc(c.en) + '</option>';
    }).join('');
  }

  function requestCard(r) {
    var reply = r.reply
      ? '<div class="help-reply"><p><strong>' + bi('பதில் / Reply', 'Reply') + '</strong></p><p>' + esc(r.reply) + '</p>' +
        '<p class="soon">' + esc(fmtDate(r.replied_at)) + '</p></div>'
      : '<p class="soon">' + bi('பதில் இன்னும் வரவில்லை.', 'No reply yet.') + '</p>';
    var q = r.question_code ? '<p><strong>' + questionLabel(r.category, r.question_code) + '</strong></p>' : '';
    var own = r.message ? '<p>' + esc(r.message) + '</p>' : '';
    return '<article class="ad-card' + (r.reply ? ' is-hot' : '') + '">' +
      '<p>' + catLabel(r.category) + ' · ' + esc(fmtDate(r.created_at)) + '</p>' + q + own + reply + '</article>';
  }

  function renderPage(data) {
    var unseen = data.unseen || 0;
    var banner = unseen > 0
      ? '<div class="help-notice" role="status"><strong>' + bi('புதிய பதில் வந்துள்ளது!', 'You have a new reply!') + '</strong></div>'
      : '';
    var mine = (data.requests || []).length
      ? data.requests.map(requestCard).join('')
      : '<p>' + bi('நீங்கள் இன்னும் கோரிக்கை அனுப்பவில்லை.', 'You have not sent a request yet.') + '</p>';

    box.innerHTML = banner +
      '<form id="help-request-form" class="help-form" novalidate>' +
        '<label class="field"><span class="ta">எதைப் பற்றி உதவி வேண்டும்?</span><span class="en">What do you need help with?</span>' +
          '<select name="category" required>' + categoryOptions() + '</select></label>' +
        '<label class="field"><span class="ta">பொதுவான கேள்வியைத் தேர்ந்தெடுக்கவும்</span><span class="en">Choose a common question</span>' +
          '<select name="question" disabled><option value="">' + bi('முதலில் வகையைத் தேர்ந்தெடுக்கவும்', 'Choose a category first') + '</option></select></label>' +
        '<label class="field"><span class="ta">உங்கள் சொந்தக் கேள்வி / பரிந்துரை / விவரம்</span><span class="en">Your own question / suggestion / details</span>' +
          '<textarea name="message" rows="5" maxlength="1000" placeholder="இங்கே எழுதுங்கள் / Type here"></textarea></label>' +
        '<div class="action-row"><button type="submit" class="btn btn-gold">' + bi('அனுப்பு', 'Submit') + '</button></div>' +
        '<p class="form-msg" role="status" aria-live="polite"></p>' +
      '</form>' +
      '<h2 class="section-title">' + bi('என் கோரிக்கைகள்', 'My requests') + '</h2>' + mine;

    var form = document.getElementById('help-request-form');
    var catSel = form.querySelector('[name="category"]');
    var qSel = form.querySelector('[name="question"]');
    catSel.addEventListener('change', function () {
      var list = QUESTIONS[catSel.value] || [];
      qSel.disabled = !catSel.value;
      qSel.innerHTML = '<option value="">' + bi(list.length ? 'என் சொந்தக் கேள்வி' : 'என் சொந்தக் கேள்வி / விவரம்', list.length ? 'My own question' : 'My own details') + '</option>' +
        list.map(function (q) { return '<option value="' + q[0] + '">' + esc(q[1]) + ' / ' + esc(q[2]) + '</option>'; }).join('');
    });
  }

  function load() {
    if (!box) return;
    if (!DB().token()) return loginPrompt();
    DB().rpc('sa_my_help_requests', { p_token: DB().token() }).then(function (r) {
      if (!r || !r.ok) { loginPrompt(); return; }
      renderPage(r);
      updateBadge(r.unseen || 0);
      if (r.unseen > 0) DB().rpc('sa_mark_help_replies_seen', { p_token: DB().token() }).then(function () { updateBadge(0); });
    }).catch(function () { loginPrompt(); });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'help-request-form') return;
    e.preventDefault();
    var msgEl = form.querySelector('.form-msg');
    var button = form.querySelector('button[type="submit"]');
    var cat = form.querySelector('[name="category"]').value;
    var q = form.querySelector('[name="question"]').value;
    var msg = form.querySelector('[name="message"]').value.trim();
    var show = function (pair, isErr) {
      msgEl.innerHTML = bi(pair[0], pair[1]);
      msgEl.classList.toggle('is-error', !!isErr);
    };
    if (!cat) return show(MSG.bad_category, true);
    button.disabled = true;
    DB().rpc('sa_submit_help_request', { p_token: DB().token(), p_category: cat, p_question: q, p_message: msg }).then(function (r) {
      if (r && r.ok) { show(MSG.sent, false); load(); }
      else show(MSG[(r && r.error) || 'fail'] || MSG.fail, true);
    }).catch(function () { show(MSG.fail, true); })
      .then(function () { button.disabled = false; });
  });

  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('#help') === 0) load();
  });
  // Scripts run with defer, so the page is parsed by the time this runs.
  if (document.readyState !== 'loading') {
    box = document.getElementById('help-request-box');
    if (box) load();
  }

  // Shared with the admin screen, so both show the same names.
  window.SA_HELP = { CATS: CATS, QUESTIONS: QUESTIONS };
})();
