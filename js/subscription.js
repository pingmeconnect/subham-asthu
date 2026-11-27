/* Sankalpam — date helper for the app (Phase 4/7). The subscription rules themselves
   (free events, grace day, enable switch, fee ranges) are computed in the database from
   app_settings; see sa_partner_state in schema.sql / migration_app_settings.sql. */
(function () {
  'use strict';

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // 'YYYY-MM-DD' for today in India (the database uses the same zone).
  function today() {
    var d = new Date();
    var ist = new Date(d.getTime() + (d.getTimezoneOffset() + 330) * 60000);
    return ist.getFullYear() + '-' + pad(ist.getMonth() + 1) + '-' + pad(ist.getDate());
  }

  window.SASub = { today: today };
})();
