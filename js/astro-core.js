/* Sankalpam — birth chart engine (runs on the phone, no database).
   Sun and Moon use the same Meeus series as the panchang (js/panchang-core.js). The five planets use the standard
   low-precision orbital elements (about 1-2 arc-minutes), mean Rahu/Ketu, Lahiri ayanamsa, whole-sign houses,
   Vimshottari dasa. Meant to give the astrologer a first chart and let the customer check lagna / rasi / star.
   The astrologer confirms everything before a reading is sent. */
(function (root) {
  'use strict';
  var P = root.SAPanchangCore || (typeof require !== 'undefined' ? require('./panchang-core.js') : null);
  var T = P._t, R = Math.PI / 180;
  function mod(a, n) { return ((a % n) + n) % n; }
  function sin(x) { return Math.sin(x * R); } function cos(x) { return Math.cos(x * R); }

  var RASI_TA = ['மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'];
  var RASI_EN = ['Mesha (Aries)', 'Rishabha (Taurus)', 'Mithuna (Gemini)', 'Kataka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Thula (Libra)', 'Vrischika (Scorpio)', 'Dhanus (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];
  var NAK_TA = ['அசுவினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'];
  var NAK_EN = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Thiruvathirai (Ardra)', 'Punarpoosam', 'Poosam', 'Ayilyam', 'Magam', 'Pooram', 'Uthiram', 'Hastham', 'Chithirai', 'Swathi', 'Visakam', 'Anusham', 'Kettai', 'Moolam', 'Pooradam', 'Uthiradam', 'Thiruvonam', 'Avittam', 'Sathayam', 'Poorattathi', 'Uthirattathi', 'Revathi'];
  // body keys: su mo ma me ju ve sa ra ke
  var BODY = ['su', 'mo', 'ma', 'me', 'ju', 've', 'sa', 'ra', 'ke'];
  var BODY_TA = { su: 'சூரியன்', mo: 'சந்திரன்', ma: 'செவ்வாய்', me: 'புதன்', ju: 'குரு', ve: 'சுக்கிரன்', sa: 'சனி', ra: 'ராகு', ke: 'கேது' };
  var BODY_EN = { su: 'Sun', mo: 'Moon', ma: 'Mars', me: 'Mercury', ju: 'Jupiter', ve: 'Venus', sa: 'Saturn', ra: 'Rahu', ke: 'Ketu' };
  var BODY_SHORT_TA = { su: 'சூ', mo: 'சந்', ma: 'செ', me: 'பு', ju: 'கு', ve: 'சு', sa: 'சனி', ra: 'ரா', ke: 'கே' };
  var BODY_SHORT_EN = { su: 'Su', mo: 'Mo', ma: 'Ma', me: 'Me', ju: 'Ju', ve: 'Ve', sa: 'Sa', ra: 'Ra', ke: 'Ke' };

  // ---- planets (orbital elements, d = days since 1999 Dec 31.0 UT) ----
  function kepler(M, e) {
    var E = M + (e * 180 / Math.PI) * sin(M) * (1 + e * cos(M));
    for (var i = 0; i < 8; i++) {
      var dE = (E - (e * 180 / Math.PI) * sin(E) - M) / (1 - e * cos(E));
      E -= dE; if (Math.abs(dE) < 1e-7) break;
    }
    return E;
  }
  var EL = {
    me: function (d) { return [48.3313 + 3.24587e-5 * d, 7.0047 + 5.0e-8 * d, 29.1241 + 1.01444e-5 * d, 0.387098, 0.205635 + 5.59e-10 * d, 168.6562 + 4.0923344368 * d]; },
    ve: function (d) { return [76.6799 + 2.4659e-5 * d, 3.3946 + 2.75e-8 * d, 54.8910 + 1.38374e-5 * d, 0.72333, 0.006773 - 1.302e-9 * d, 48.0052 + 1.6021302244 * d]; },
    ma: function (d) { return [49.5574 + 2.11081e-5 * d, 1.8497 - 1.78e-8 * d, 286.5016 + 2.92961e-5 * d, 1.523688, 0.093405 + 2.516e-9 * d, 18.6021 + 0.5240207766 * d]; },
    ju: function (d) { return [100.4542 + 2.76854e-5 * d, 1.303 - 1.557e-7 * d, 273.8777 + 1.64505e-5 * d, 5.20256, 0.048498 + 4.469e-9 * d, 19.895 + 0.0830853001 * d]; },
    sa: function (d) { return [113.6634 + 2.3898e-5 * d, 2.4886 - 1.081e-7 * d, 339.3939 + 2.97661e-5 * d, 9.55475, 0.055546 - 9.499e-9 * d, 316.967 + 0.0334442282 * d]; }
  };
  function helio(key, d) {
    var el = EL[key](d), N = el[0], inc = el[1], w = el[2], a = el[3], e = el[4], M = mod(el[5], 360);
    var E = kepler(M, e), xv = a * (cos(E) - e), yv = a * Math.sqrt(1 - e * e) * sin(E);
    var v = Math.atan2(yv, xv) / R, r = Math.sqrt(xv * xv + yv * yv), vw = v + w;
    var xh = r * (cos(N) * cos(vw) - sin(N) * sin(vw) * cos(inc)), yh = r * (sin(N) * cos(vw) + cos(N) * sin(vw) * cos(inc)), zh = r * sin(vw) * sin(inc);
    var lon = Math.atan2(yh, xh) / R, lat = Math.atan2(zh, Math.sqrt(xh * xh + yh * yh)) / R;
    if (key === 'ju' || key === 'sa') {
      var Mj = mod(19.895 + 0.0830853001 * d, 360), Ms = mod(316.967 + 0.0334442282 * d, 360);
      if (key === 'ju') lon += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21) - 0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
      else {
        lon += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3) + 0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32);
        lat += -0.02 * cos(2 * Mj - 4 * Ms - 2) + 0.018 * sin(2 * Mj - 6 * Ms - 49);
      }
    }
    return [r * cos(lat) * cos(lon), r * cos(lat) * sin(lon), r * sin(lat)];
  }
  function sunGeo(d) {            // Sun as seen from Earth (ecliptic rectangular)
    var w = 282.9404 + 4.70935e-5 * d, e = 0.016709 - 1.151e-9 * d, M = mod(356.047 + 0.9856002585 * d, 360);
    var E = kepler(M, e), xv = cos(E) - e, yv = Math.sqrt(1 - e * e) * sin(E);
    var v = Math.atan2(yv, xv) / R, r = Math.sqrt(xv * xv + yv * yv), lon = v + w;
    return [r * cos(lon), r * sin(lon), 0];
  }
  function planetTropical(key, J) {
    var d = J - 2451543.5, h = helio(key, d), s = sunGeo(d);
    return mod(Math.atan2(h[1] + s[1], h[0] + s[0]) / R, 360);
  }
  function tropical(key, J) {
    var Tc = (J - 2451545) / 36525;
    if (key === 'su') return T.sunLon(J);
    if (key === 'mo') return T.moonLon(J);
    if (key === 'ra') return mod(125.0445479 - 1934.1362891 * Tc + 0.0020754 * Tc * Tc, 360);
    if (key === 'ke') return mod(tropical('ra', J) + 180, 360);
    return planetTropical(key, J);
  }
  function sidereal(key, J) { return T.sid(tropical(key, J), J); }

  // ---- ascendant ----
  function lagnaTropical(J, lat, lon) {
    var Tc = (J - 2451545) / 36525;
    var gmst = mod(280.46061837 + 360.98564736629 * (J - 2451545) + 0.000387933 * Tc * Tc, 360);
    var th = mod(gmst + lon, 360), eps = 23.4392911 - 0.0130042 * Tc;
    return mod(Math.atan2(cos(th), -(sin(th) * cos(eps) + Math.tan(lat * R) * sin(eps))) / R, 360);
  }

  // ---- time zone offset (minutes east of UTC) for an IANA zone at a local wall-clock time ----
  function tzOffset(tz, y, m, d, hh, mi) {
    if (!tz || tz === 'Asia/Kolkata') return 330;
    try {
      var guess = Date.UTC(y, m - 1, d, hh, mi), off = 0, i;
      for (i = 0; i < 3; i++) {
        var parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date(guess - off * 60000)), o = {};
        parts.forEach(function (p) { o[p.type] = +p.value; });
        var shown = Date.UTC(o.year, o.month - 1, o.day, o.hour, o.minute);
        off = Math.round((shown - (guess - off * 60000)) / 60000);
      }
      return off;
    } catch (e) { return 330; }
  }

  // ---- dasa ----
  var DASA = ['ke', 've', 'su', 'mo', 'ma', 'ra', 'ju', 'sa', 'me'];
  var YEARS = { ke: 7, ve: 20, su: 6, mo: 10, ma: 7, ra: 18, ju: 16, sa: 19, me: 17 };
  var YEAR_DAYS = 365.25;
  function dasaTable(moonSid, birthJ) {
    var span = 360 / 27, nak = Math.floor(moonSid / span), frac = (moonSid % span) / span;
    var start = nak % 9, out = [], t = birthJ - frac * YEARS[DASA[start]] * YEAR_DAYS;
    for (var i = 0; i < 9; i++) {
      var lord = DASA[(start + i) % 9], len = YEARS[lord] * YEAR_DAYS, subs = [], st = t;
      var si = (start + i) % 9;
      for (var j = 0; j < 9; j++) {
        var sl = DASA[(si + j) % 9], sd = len * YEARS[sl] / 120;
        subs.push({ lord: sl, from: st, to: st + sd }); st += sd;
      }
      out.push({ lord: lord, from: t, to: t + len, subs: subs }); t += len;
    }
    return out;
  }
  function jdToYmd(J) {
    var Z = Math.floor(J + 0.5), F = J + 0.5 - Z, A = Z;
    if (Z >= 2299161) { var al = Math.floor((Z - 1867216.25) / 36524.25); A = Z + 1 + al - Math.floor(al / 4); }
    var B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C), Ee = Math.floor((B - D) / 30.6001);
    var day = B - D - Math.floor(30.6001 * Ee) + F, month = Ee < 14 ? Ee - 1 : Ee - 13, year = month > 2 ? C - 4716 : C - 4715;
    return { y: year, m: month, d: Math.floor(day) };
  }

  /* input: {y,m,d, hh, mi, lat, lon, tz}  (local birth time at the place) */
  function chart(inp, nowJ) {
    var off = tzOffset(inp.tz, inp.y, inp.m, inp.d, inp.hh, inp.mi);
    var J = T.jd(inp.y, inp.m, inp.d, 0) + (inp.hh * 60 + inp.mi - off) / 1440;
    var lagT = lagnaTropical(J, inp.lat, inp.lon), lag = T.sid(lagT, J);
    var pl = {}, span = 360 / 27;
    BODY.forEach(function (k) {
      var s = sidereal(k, J), s2 = sidereal(k, J + 0.5), s0 = sidereal(k, J - 0.5);
      var dl = mod(s2 - s0 + 180, 360) - 180;
      var rasi = Math.floor(s / 30);
      pl[k] = { lon: s, rasi: rasi, deg: s - rasi * 30, nak: Math.floor(s / span), pada: Math.floor((s % span) / (span / 4)) + 1, nav: Math.floor(s / (30 / 9)) % 12,
        retro: (k !== 'su' && k !== 'mo' && k !== 'ra' && k !== 'ke') ? dl < 0 : (k === 'ra' || k === 'ke'),
        edge: Math.min(s % 30, 30 - (s % 30)) < 0.5 || Math.min(s % (30 / 9), (30 / 9) - (s % (30 / 9))) < 0.1 };
    });
    var lr = Math.floor(lag / 30), asc = { lon: lag, rasi: lr, deg: lag - lr * 30, nak: Math.floor(lag / span), pada: Math.floor((lag % span) / (span / 4)) + 1, nav: Math.floor(lag / (30 / 9)) % 12,
      edge: Math.min(lag % 30, 30 - (lag % 30)) < 1 };
    var wd = new Date(Date.UTC(inp.y, inp.m - 1, inp.d)).getUTCDay();
    var dt = dasaTable(pl.mo.lon, J), nj = nowJ || (Date.now() / 86400000 + 2440587.5), cur = null, i, j;
    for (i = 0; i < dt.length; i++) if (nj >= dt[i].from && nj < dt[i].to) {
      for (j = 0; j < 9; j++) if (nj >= dt[i].subs[j].from && nj < dt[i].subs[j].to) cur = { dasa: dt[i].lord, bhukti: dt[i].subs[j].lord, dasaFrom: dt[i].from, dasaTo: dt[i].to, bFrom: dt[i].subs[j].from, bTo: dt[i].subs[j].to };
    }
    var moonSpan = pl.mo.lon % span, balance = (1 - moonSpan / span) * YEARS[DASA[Math.floor(pl.mo.lon / span) % 9]];
    return { jd: J, utcOffset: off, weekday: wd, lagna: asc, planets: pl, dasa: dt, current: cur, balanceYears: balance,
      moonRasi: pl.mo.rasi, janmaNak: pl.mo.nak, janmaPada: pl.mo.pada,
      uncertain: asc.edge || pl.mo.edge };
  }

  root.SAAstro = { chart: chart, jdToYmd: jdToYmd, sidereal: sidereal, lagnaTropical: lagnaTropical, tzOffset: tzOffset,
    RASI_TA: RASI_TA, RASI_EN: RASI_EN, NAK_TA: NAK_TA, NAK_EN: NAK_EN, BODY: BODY, BODY_TA: BODY_TA, BODY_EN: BODY_EN,
    BODY_SHORT_TA: BODY_SHORT_TA, BODY_SHORT_EN: BODY_SHORT_EN, YEARS: YEARS };
  if (typeof module !== 'undefined') module.exports = root.SAAstro;
})(typeof window !== 'undefined' ? window : globalThis);
