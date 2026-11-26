/* Subham Astu — text-size buttons (A  A  A) for easy reading. Remembers the choice on this phone. */
(function () {
  'use strict';
  var KEY = 'subham-asthu-size', root = document.documentElement;
  function get() { try { return localStorage.getItem(KEY) || 'm'; } catch (e) { return 'm'; } }
  function set(v) {
    if (v === 'm') root.removeAttribute('data-size'); else root.setAttribute('data-size', v);
    try { localStorage.setItem(KEY, v); } catch (e) { /* session only */ }
    document.querySelectorAll('.sa-size button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v)); });
  }
  function make() {
    var d = document.createElement('div');
    d.className = 'sa-size'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'எழுத்துரு அளவு / Text size');
    d.innerHTML = '<button type="button" class="s1" data-v="m" aria-label="Normal text / சாதாரண எழுத்து">அ</button>' +
      '<button type="button" class="s2" data-v="l" aria-label="Large text / பெரிய எழுத்து">அ</button>' +
      '<button type="button" class="s3" data-v="xl" aria-label="Extra large text / மிகப் பெரிய எழுத்து">அ</button>';
    return d;
  }
  var end = document.querySelector('.header-end'), panel = document.querySelector('.m-panel');
  if (end) { var h = make(); h.classList.add('sa-size-head'); end.insertBefore(h, end.firstChild); }
  if (panel) {   // on phones the buttons live at the top of the menu, so the header stays uncluttered
    var row = document.createElement('div'); row.className = 'sa-size-row';
    row.innerHTML = '<span><span class="ta">எழுத்து அளவு</span><span class="en">Text size</span></span>';
    row.appendChild(make()); panel.insertBefore(row, panel.firstChild);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.sa-size button'); if (b) set(b.getAttribute('data-v'));
  });
  set(get());
})();
