/* Sankalpam — small shared helpers: Tamil Nadu / Puducherry pincode check, photo resize, Excel reading. */
(function () {
  'use strict';

  // Tamil Nadu, Puducherry and Karaikal pincodes all start with 600 to 643.
  function okPin(p) {
    p = String(p || '');
    if (!/^\d{6}$/.test(p)) return false;
    var n = parseInt(p.slice(0, 3), 10);
    return n >= 600 && n <= 643;
  }

  // "600126 Chromepet; 600044 Pallavaram" -> [{pin, place}]
  function parseAreas(text) {
    return String(text || '').split(/[;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) {
      var m = s.match(/^(\d{6})\s*[-,:]?\s*(.*)$/);
      return m ? { pin: m[1], place: m[2].trim() } : { pin: '', place: s };
    });
  }

  // Picks a photo, crops it square and shrinks it so it stays small (about 10-30 KB).
  function toDataUrl(file, size) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('not_image'));
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(img.width, img.height);
        var c = document.createElement('canvas');
        c.width = c.height = size;
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('not_image')); };
      img.src = url;
    });
  }

  // Excel/CSV upload: loads the reader library only when needed, returns rows as objects keyed by the header cells.
  var XLSX_SRC = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  function loadXlsx() {
    if (window.XLSX) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = XLSX_SRC; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function readSheet(file) {
    return loadXlsx().then(function () { return file.arrayBuffer(); }).then(function (buf) {
      var wb = window.XLSX.read(buf, { type: 'array' });
      var ws = wb.Sheets[wb.SheetNames[0]];
      return window.XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
    });
  }

  // ---------- Feedback + "report a problem" block (used for bookings and orders) ----------
  function bi(ta, en) { return '<span class="ta">' + ta + '</span><span class="en">' + en + '</span>'; }
  var FB_MSG = {
    thanks: ['நன்றி! உங்கள் கருத்து பதிவு செய்யப்பட்டது.', 'Thank you! Your feedback is saved.'],
    reported: ['புகார் அனுப்பப்பட்டது. நிர்வாகம் உங்களைத் தொடர்பு கொள்ளும்.', 'Problem reported. We will contact you.'],
    short: ['பிரச்சினையை சற்று விரிவாக எழுதவும் (குறைந்தது 10 எழுத்துகள்).', 'Please describe the problem (at least 10 characters).'],
    fail: ['அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', 'Could not send. Please try again.']
  };
  var FB_LABEL = { good: ['நன்று', 'Good'], ok: ['சரி', 'OK'], bad: ['சரியில்லை', 'Not good'] };
  // canGive: the service is finished, so feedback can be given. current: 'good' | 'ok' | 'bad' | null.
  function feedbackHtml(kind, id, canGive, current) {
    var top = current
      ? '<p class="soon">✔ ' + bi('உங்கள் கருத்து: ', 'Your feedback: ') + bi(FB_LABEL[current][0], FB_LABEL[current][1]) + '</p>'
      : canGive
        ? '<p><strong>' + bi('சேவை எப்படி இருந்தது?', 'How was the service?') + '</strong></p><div class="fb-btns">' +
          '<button type="button" class="btn btn-outline" data-fb="good">👍 ' + bi('நன்று', 'Good') + '</button>' +
          '<button type="button" class="btn btn-outline" data-fb="ok">😐 ' + bi('சரி', 'OK') + '</button>' +
          '<button type="button" class="btn btn-outline" data-fb="bad">👎 ' + bi('சரியில்லை', 'Not good') + '</button></div>'
        : '';
    return '<div class="fb" data-kind="' + kind + '" data-id="' + id + '">' + top +
      '<button type="button" class="linkbtn" data-fb-report>⚠ ' + bi('பிரச்சினையைத் தெரிவிக்க', 'Report a problem') + '</button>' +
      '<div class="fb-report" hidden><textarea rows="3" maxlength="500" aria-label="problem"></textarea>' +
      '<button type="button" class="btn" data-fb-send>' + bi('அனுப்பு', 'Send') + '</button></div>' +
      '<p class="form-msg" role="status" aria-live="polite"></p></div>';
  }
  function fbSay(el, key, isErr) {
    el.innerHTML = bi(FB_MSG[key][0], FB_MSG[key][1]);
    el.classList.toggle('is-error', !!isErr); el.classList.toggle('is-ok', !isErr);
  }
  // Call once per container; onDone() re-renders the list after feedback is saved.
  function bindFeedback(container, onDone) {
    if (container.dataset.fbBound) return;
    container.dataset.fbBound = '1';
    container.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fb],[data-fb-report],[data-fb-send]');
      if (!b) return;
      var box = b.closest('.fb'), msg = box.querySelector('.form-msg');
      var DB = window.SADB, kind = box.getAttribute('data-kind'), id = box.getAttribute('data-id');
      if (b.hasAttribute('data-fb-report')) { box.querySelector('.fb-report').hidden = false; return; }
      if (b.hasAttribute('data-fb')) {
        return DB.rpc('sa_submit_feedback', { p_token: DB.token(), p_kind: kind, p_ref: id, p_rating: b.getAttribute('data-fb'), p_comment: '' })
          .then(function (r) { if (!r || !r.ok) throw new Error('x'); fbSay(msg, 'thanks', false); if (onDone) setTimeout(onDone, 900); })
          .catch(function () { fbSay(msg, 'fail', true); });
      }
      var text = box.querySelector('textarea').value.trim();
      if (text.length < 10) return fbSay(msg, 'short', true);
      return DB.rpc('sa_submit_report', { p_token: DB.token(), p_kind: kind, p_ref: id, p_text: text })
        .then(function (r) { if (!r || !r.ok) throw new Error('x'); box.querySelector('.fb-report').hidden = true; fbSay(msg, 'reported', false); })
        .catch(function () { fbSay(msg, 'fail', true); });
    });
  }

  window.SARegion = { okPin: okPin };
  window.SAExtras = { feedbackHtml: feedbackHtml, bindFeedback: bindFeedback, okPin: okPin, parseAreas: parseAreas, toDataUrl: toDataUrl, readSheet: readSheet };
})();
