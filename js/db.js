/* Subham Astu — Supabase connection (live).
   The browser never reads tables directly. Every call goes to a sa_* function in the database,
   which checks the session token (or admin role) itself. Requires the supabase-js CDN script
   in index.html, loaded before this file. */
(function () {
  'use strict';

  var SESSION_KEY = 'subham-asthu-session';
  var cfg = window.SA_CONFIG;
  var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  function token() {
    try { return localStorage.getItem(SESSION_KEY) || ''; } catch (e) { return ''; }
  }

  function setToken(t) {
    try {
      if (t) localStorage.setItem(SESSION_KEY, t);
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* session kept for this page only */ }
  }

  // Calls a sa_* function with named parameters. Resolves with the JSON result.
  function rpc(name, args) {
    return client.rpc(name, args || {}).then(function (res) {
      if (res.error) throw new Error(res.error.message);
      return res.data;
    });
  }

  window.SADB = { rpc: rpc, token: token, setToken: setToken };
})();
