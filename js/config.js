/* Sankalpam — app-wide switches and the live Supabase connection.
   DEMO_CONTROLS: false for production. true shows the "Admin / Demo Controls" blocks and
   the demo date/partner switches; the database keeps placeholder partners hidden regardless. */
(function () {
  'use strict';

  window.SA_CONFIG = {
    DEMO_CONTROLS: false,
    SUPPORT_EMAIL: '',   // shown in the homepage top bar when filled (blank = hidden)
    SUPABASE_URL: 'https://gawzcdhuhbbbjohnnixz.supabase.co',
    SUPABASE_KEY: 'sb_publishable_hAi6yx1ay7PzBkwTL8ldtw_jcKLiZzW'
  };

  window.SADemo = {
    enabled: function () {
      return !!window.SA_CONFIG.DEMO_CONTROLS;
    },
    // Wraps demo-only markup in the labelled banner; returns '' when demo controls are off.
    banner: function (innerHtml) {
      if (!window.SA_CONFIG.DEMO_CONTROLS) return '';
      return '<div class="demo-controls">' +
        '<p class="demo-banner"><span class="ta">நிர்வாகம் / டெமோ கட்டுப்பாடுகள்</span><span class="en">Admin / Demo Controls</span></p>' +
        innerHtml + '</div>';
    }
  };
})();
