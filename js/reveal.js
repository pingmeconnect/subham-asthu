/* Sankalpam — scroll reveal: text slides in from one side, pictures from the other. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var SEL = '.hero-cta, .fest-banner, .svc-link, .home-section, .cat-tile, .step-no, .trust-strip .ts-item, .fest-card, .dl-card, .about-block, .card > h1';
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  var n = 0;
  function scan(root) {
    (root || document).querySelectorAll(SEL).forEach(function (el) {
      if (el.classList.contains('sa-rv')) return;
      var dir = el.matches('.cat-tile, .svc-link, .fest-card, .dl-card') ? 'from-up' : (n++ % 2 ? 'from-right' : 'from-left');
      el.classList.add('sa-rv', dir);
      io.observe(el);
    });
  }
  scan();
  new MutationObserver(function () { scan(); }).observe(document.body, { childList: true, subtree: true });
})();
