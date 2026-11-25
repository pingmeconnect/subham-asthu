/* Subham Astu — small shared helpers: Tamil Nadu / Puducherry pincode check, photo resize, Excel reading. */
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

  window.SARegion = { okPin: okPin };
  window.SAExtras = { okPin: okPin, parseAreas: parseAreas, toDataUrl: toDataUrl, readSheet: readSheet };
})();
