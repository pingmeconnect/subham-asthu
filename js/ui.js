/* Subham Astu — presentation-only helper: closes the mobile menu panel after a link is chosen. */
(function () {
  'use strict';
  var menu = document.querySelector('.m-menu');
  if (!menu) return;
  function close() { menu.removeAttribute('open'); }
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  window.addEventListener('hashchange', close);
  document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
