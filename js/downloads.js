/* Sankalpam — Downloads page. Anyone can see the list and dates; the PDF itself needs a registered login.
   The PDF is fetched from a private store by the guide-download function, which stamps the customer's
   mobile ending on every page. There is no preview: the file only downloads. */
(function () {
  'use strict';
  var DB = window.SADB, CFG = window.SA_CONFIG;
  if (!DB || !CFG) return;
  var root = document.getElementById('dl-grid');
  if (!root) return;

  // [slug, Tamil name, English name, emblem]
  var G = [
    ['sankatahara-chaturthi', 'சங்கடஹர சதுர்த்தி', 'Sankatahara Chaturthi', 'modak'],
    ['pradosham', 'பிரதோஷம்', 'Pradosham', 'shiva'],
    ['pournami-satyanarayana', 'பௌர்ணமி சத்யநாராயண பூஜை', 'Pournami Satyanarayana Pooja', 'vishnu'],
    ['krithigai', 'கிருத்திகை', 'Krithigai', 'vel'],
    ['ekadashi', 'ஏகாதசி', 'Ekadashi', 'vishnu'],
    ['thiruvilakku-pooja', 'திருவிளக்கு பூஜை', 'Thiruvilakku Pooja', 'deepam'],
    ['friday-home-pooja', 'வெள்ளிக்கிழமை வீட்டுப் பூஜை', 'Friday Home Pooja', 'lakshmi'],
    ['tuesday-home-pooja', 'செவ்வாய்க்கிழமை வீட்டுப் பூஜை', 'Tuesday Home Pooja', 'vel'],
    ['nithya-pooja', 'தினசரி நித்ய பூஜை', 'Daily Nithya Pooja', 'deepam'],
    ['masa-sashti', 'மாத சஷ்டி', 'Masa Sashti', 'vel'],
    ['amavasya-pitru', 'அமாவாசை பித்ரு பூஜை', 'Amavasya Pitru Pooja', 'tarpana'],
    ['guru-purnima', 'குரு பூர்ணிமா', 'Guru Purnima', 'moonlotus'],
    ['varalakshmi-vratam', 'வரலட்சுமி விரதம்', 'Varalakshmi Vratam', 'lakshmi'],
    ['vinayagar-chaturthi', 'விநாயகர் சதுர்த்தி', 'Vinayagar Chaturthi', 'modak'],
    ['navaratri-golu-ayudha-pooja', 'நவராத்திரி கொலு / சரஸ்வதி & ஆயுத பூஜை', 'Navaratri Golu / Saraswathi & Ayudha Pooja', 'kalasam'],
    ['karthigai-deepam', 'கார்த்திகை தீபம்', 'Karthigai Deepam', 'deepam'],
    ['maha-shivaratri', 'மகா சிவராத்திரி', 'Maha Shivaratri', 'shiva'],
    ['vaikunta-ekadashi', 'வைகுண்ட ஏகாதசி', 'Vaikunta Ekadashi', 'vishnu'],
    ['thai-pongal', 'தைப்பொங்கல் & மாட்டுப் பொங்கல்', 'Thai Pongal & Mattu Pongal', 'pot'],
    ['tamil-puthandu', 'தமிழ் புத்தாண்டு', 'Tamil Puthandu', 'kalasam'],
    ['aadi-velli-pooram-perukku', 'ஆடி வெள்ளி/பூரம்/பெருக்கு', 'Aadi Velli / Pooram / Perukku', 'kalasam'],
    ['kedara-gauri-vratam', 'கேதார கௌரி விரதம்', 'Kedara Gauri Vratam', 'shiva'],
    ['skanda-sashti', 'கந்த சஷ்டி', 'Skanda Sashti', 'vel'],
    ['krishna-jayanthi', 'கிருஷ்ண ஜெயந்தி', 'Krishna Jayanthi', 'flute'],
    ['avani-avittam', 'ஆவணி அவிட்டம்', 'Avani Avittam (Upakarma)', 'thread'],
    ['chitra-pournami', 'சித்ரா பௌர்ணமி', 'Chitra Pournami', 'scroll'],
    ['karadaiyan-nonbu', 'காரடையான் நோன்பு', 'Karadaiyan Nonbu', 'kalasam'],
    ['thai-poosam', 'தைப்பூசம்', 'Thai Poosam', 'vel'],
    ['panguni-uthiram', 'பங்குனி உத்திரம்', 'Panguni Uthiram', 'garland'],
    ['deepavali-kubera', 'தீபாவளி லட்சுமி குபேர பூஜை', 'Deepavali Lakshmi Kubera Pooja', 'lakshmi'],
    ['margazhi-thiruppavai', 'மார்கழி திருப்பாவை & திருவெம்பாவை', 'Margazhi Thiruppavai & Thiruvempavai', 'vishnu']
  ];
  var TA_MON = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
  var EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dates = {}, q = '';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bi(ta, en) { return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>'; }
  function dateHtml(d) {
    if (!d) return bi('தேதி விரைவில்', 'Date soon');
    var p = d.split('-'), m = +p[1] - 1, day = +p[2];
    return bi('அடுத்த நாள்: <b>' + day + ' ' + TA_MON[m] + ' ' + p[0] + '</b>', 'Next: <b>' + day + ' ' + EN_MON[m] + ' ' + p[0] + '</b>');
  }

  function draw() {
    var rows = G.filter(function (g) { return !q || (g[1] + ' ' + g[2]).toLowerCase().indexOf(q) !== -1; });
    rows.sort(function (a, b) {   // soonest first; poojas with no date go last
      var x = dates[a[0]] || '9999', y = dates[b[0]] || '9999';
      return x < y ? -1 : x > y ? 1 : 0;
    });
    root.innerHTML = rows.map(function (g) {
      return '<article class="dl-card" data-slug="' + g[0] + '">' +
        '<div class="dl-top"><img src="img/gods/' + g[3] + '.svg" alt="" width="56" height="56" loading="lazy">' +
        '<div><strong>' + bi(esc(g[1]), esc(g[2])) + '</strong><span class="dl-date">' + dateHtml(dates[g[0]]) + '</span></div></div>' +
        '<button type="button" class="dl-btn" data-dl="' + g[0] + '">⬇ ' + bi('PDF பதிவிறக்கம்', 'Download PDF') + '</button>' +
        '<p class="dl-msg" aria-live="polite"></p></article>';
    }).join('') || '<p>' + bi('எதுவும் கிடைக்கவில்லை.', 'Nothing found.') + '</p>';
  }

  function say(card, html) { var m = card.querySelector('.dl-msg'); if (m) m.innerHTML = html; }

  function go(slug, card, btn) {
    var t = DB.token();
    if (!t) {                                   // not registered: send to login, then come back here
      try { localStorage.setItem('subham-asthu-return', 'downloads'); } catch (e) { /* ignore */ }
      say(card, bi('பதிவிறக்க <a href="#login" data-auth-view="register">இலவசமாகப் பதிவு செய்யுங்கள்</a> அல்லது <a href="#login">உள்நுழையுங்கள்</a>.',
        'Please <a href="#login" data-auth-view="register">register free</a> or <a href="#login">log in</a> to download.'));
      return;
    }
    btn.disabled = true; say(card, bi('தயாராகிறது…', 'Getting your file…'));
    fetch(CFG.SUPABASE_URL + '/functions/v1/guide-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.SUPABASE_KEY, Authorization: 'Bearer ' + CFG.SUPABASE_KEY },
      body: JSON.stringify({ token: t, slug: slug })
    }).then(function (r) {
      if (r.status === 401) {   // only a real "not logged in" answer from our function ends the session
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (j && j.error === 'login') { DB.setToken(null); throw new Error('login'); }
          throw new Error('gateway');   // Supabase blocked the call (Verify JWT still ON) - the customer is still logged in
        });
      }
      if (r.status === 429) throw new Error('limit');
      if (!r.ok) throw new Error('fail');
      return r.blob();
    }).then(function (b) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'sankalpam-' + slug + '.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      say(card, bi('பதிவிறக்கம் தொடங்கியது ✔', 'Download started ✔'));
    }).catch(function (e) {
      say(card, e.message === 'login' ? bi('மீண்டும் <a href="#login">உள்நுழையுங்கள்</a>.', 'Please <a href="#login">log in</a> again.')
        : e.message === 'gateway' ? bi('சேவை இன்னும் தயாராகவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.', 'The download service is not ready yet. Please try again shortly.')
        : e.message === 'limit' ? bi('இன்றைய பதிவிறக்க வரம்பு முடிந்தது. நாளை முயற்சிக்கவும்.', 'Daily download limit reached. Try again tomorrow.')
        : bi('இப்போது பதிவிறக்க முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.', 'Could not download right now. Please try again shortly.'));
    }).then(function () { btn.disabled = false; });
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-dl]');
    if (b) go(b.getAttribute('data-dl'), b.closest('.dl-card'), b);
  });
  // Block right-click and drag on the page (light deterrent only).
  var page = root.closest('[data-page]');
  ['contextmenu', 'dragstart', 'copy'].forEach(function (ev) {
    page.addEventListener(ev, function (e) { if (!e.target.closest('input')) e.preventDefault(); });
  });
  var s = document.getElementById('dl-search');
  if (s) s.addEventListener('input', function () { q = s.value.trim().toLowerCase(); draw(); });

  draw();
  DB.rpc('sa_pooja_dates', {}).then(function (r) {
    (Array.isArray(r) ? r : []).forEach(function (x) { if (!dates[x.slug] || x.date < dates[x.slug]) dates[x.slug] = x.date; });
    draw();
  }).catch(function () { /* dates stay "soon" */ });
})();
