/* Subham Astu — panchang calculator (runs on the phone, no database).
   Sun and Moon positions use the standard Meeus series, Lahiri ayanamsa, sunrise by the NOAA method.
   Accuracy: tithi / nakshatra / yoga times within a few minutes. For temple or ritual timings, confirm with
   your family's printed panchangam. */
(function (root) {
  'use strict';
  var R = Math.PI / 180;
  function mod(a, n) { return ((a % n) + n) % n; }
  function jd(y, m, d, hUT) {            // Gregorian date + UT hours -> Julian day
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + hUT / 24;
  }
  function sunLon(J) {
    var T = (J - 2451545) / 36525;
    var L0 = 280.46646 + 36000.76983 * T, M = (357.52911 + 35999.05029 * T) * R;
    var C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    return mod(L0 + C, 360);
  }
  // [D, M, M', F, coefficient (1e-6 degree)]
  var MT = [[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
  function moonLon(J) {
    var T = (J - 2451545) / 36525;
    var Lp = 218.3164477 + 481267.88123421 * T, D = (297.8501921 + 445267.1114034 * T) * R,
        M = (357.5291092 + 35999.0502909 * T) * R, Mp = (134.9633964 + 477198.8675055 * T) * R,
        F = (93.272095 + 483202.0175233 * T) * R, E = 1 - 0.002516 * T - 0.0000074 * T * T, s = 0;
    for (var i = 0; i < MT.length; i++) {
      var t = MT[i], e = t[1] ? (Math.abs(t[1]) === 2 ? E * E : E) : 1;
      s += t[4] * e * Math.sin(t[0] * D + t[1] * M + t[2] * Mp + t[3] * F);
    }
    var A1 = (119.75 + 131.849 * T) * R, A2 = (53.09 + 479264.29 * T) * R;
    s += 3958 * Math.sin(A1) + 1962 * Math.sin(Lp * R - F) + 318 * Math.sin(A2);
    return mod(Lp + s / 1e6, 360);
  }
  function ayan(J) { return 23.8531 + 0.013969 * ((J - 2451545) / 365.25); }   // Lahiri
  function sid(x, J) { return mod(x - ayan(J), 360); }
  function elong(J) { return mod(moonLon(J) - sunLon(J), 360); }

  // Time (as Julian day) when quantity f(J) next reaches a multiple of `step`, starting from J0. rate = deg/day.
  function nextEnd(f, J0, step, rate) {
    var v = f(J0), target = (Math.floor(v / step) + 1) * step, J = J0;
    for (var i = 0; i < 12; i++) {
      var cur = f(J), diff = mod(target - cur + 180, 360) - 180;   // signed, small
      J += diff / rate;
    }
    return J;
  }

  // Sunrise / sunset in minutes after local midnight (IST), NOAA method.
  function sunTimes(y, m, d, lat, lon) {
    var J0 = jd(y, m, d, 0), doy = Math.round(J0 - jd(y, 1, 1, 0)) + 1;
    var g = 2 * Math.PI / 365 * (doy - 1);
    var eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    var dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    var ha = Math.acos(Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(dec)) - Math.tan(lat * R) * Math.tan(dec)) / R;
    return { rise: 720 - 4 * (lon + ha) - eq + 330, set: 720 - 4 * (lon - ha) - eq + 330 };
  }

  var RASI_TA = ['மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'];
  var RASI_EN = ['Mesha (Aries)', 'Rishabha (Taurus)', 'Mithuna (Gemini)', 'Kataka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)', 'Dhanus (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];
  var MONTH_TA = ['சித்திரை', 'வைகாசி', 'ஆனி', 'ஆடி', 'ஆவணி', 'புரட்டாசி', 'ஐப்பசி', 'கார்த்திகை', 'மார்கழி', 'தை', 'மாசி', 'பங்குனி'];
  var MONTH_EN = ['Chithirai', 'Vaikasi', 'Aani', 'Aadi', 'Aavani', 'Purattasi', 'Aippasi', 'Karthigai', 'Margazhi', 'Thai', 'Maasi', 'Panguni'];
  var NAK_TA = ['அஸ்வினி', 'பரணி', 'கிருத்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'];
  var NAK_EN = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
  var TITHI_TA = ['பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி', 'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி', 'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி'];
  var TITHI_EN = ['Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi'];
  var YOGA_TA = ['விஷ்கம்பம்', 'ப்ரீதி', 'ஆயுஷ்மான்', 'சௌபாக்யம்', 'சோபனம்', 'அதிகண்டம்', 'சுகர்மம்', 'திருதி', 'சூலம்', 'கண்டம்', 'விருத்தி', 'துருவம்', 'வியாகாதம்', 'ஹர்ஷணம்', 'வஜ்ரம்', 'சித்தி', 'வியதீபாதம்', 'வரீயான்', 'பரிகம்', 'சிவம்', 'சித்தம்', 'சாத்தியம்', 'சுபம்', 'சுக்லம்', 'பிரம்மம்', 'இந்திரம்', 'வைதிருதி'];
  var YOGA_EN = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  var KAR_TA = ['பவம்', 'பாலவம்', 'கௌலவம்', 'தைதுலம்', 'கரசை', 'வணிசை', 'பத்திரை'];
  var KAR_EN = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti (Bhadra)'];
  var DAY_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Part of the day (1-8) for Rahu, Yama, Kuligai, by weekday Sun..Sat
  var RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], KULI = [7, 6, 5, 4, 3, 2, 1];

  function tithiName(n) {   // n = 1..30
    if (n === 15) return ['பௌர்ணமி', 'Pournami (Full moon)'];
    if (n === 30) return ['அமாவாசை', 'Amavasya (New moon)'];
    var i = (n - 1) % 15;
    return [TITHI_TA[i], TITHI_EN[i]];
  }
  function karanaName(k) {  // k = 0..59
    if (k === 0) return ['கிம்ஸ்துக்னம்', 'Kimstughna'];
    if (k === 57) return ['சகுனி', 'Shakuni'];
    if (k === 58) return ['சதுஷ்பாதம்', 'Chatushpada'];
    if (k === 59) return ['நாகவம்', 'Naga'];
    var i = (k - 1) % 7;
    return [KAR_TA[i], KAR_EN[i]];
  }

  // Chandra Bala: moon's house counted from your own rasi. Houses 1,3,6,7,10,11 are favourable, 8 is the one to be careful of.
  function chandraBala(natal, moon) {
    var h = mod(moon - natal, 12) + 1;
    var word = (h === 1 || h === 3 || h === 6 || h === 7 || h === 10 || h === 11) ? 'good' : h === 8 ? 'care' : 'avg';
    return { house: h, word: word };
  }

  // date: {y,m,d}; city: {lat,lon}; atMin: minutes after local midnight for the "moon now" reading (default noon)
  function calc(date, city, atMin) {
    var st = sunTimes(date.y, date.m, date.d, city.lat, city.lon);
    var J = function (min) { return jd(date.y, date.m, date.d, 0) + (min - 330) / 1440; };   // local IST minutes -> JD
    var Jr = J(st.rise), Jn = J(atMin == null ? 720 : atMin);
    var wd = new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay();
    var e = elong(Jr), tithi = Math.floor(e / 12) + 1;
    var sidMoon = function (j) { return sid(moonLon(j), j); }, sidSun = function (j) { return sid(sunLon(j), j); };
    var nakV = sidMoon(Jr), nak = Math.floor(nakV / (360 / 27));
    var yogaF = function (j) { return mod(sidMoon(j) + sidSun(j), 360); };
    var yoga = Math.floor(yogaF(Jr) / (360 / 27));
    var kar = Math.floor(e / 6);
    function clock(Jx) {     // Julian day -> {min since this date's local midnight}
      return (Jx - jd(date.y, date.m, date.d, 0)) * 1440 + 330;
    }
    var out = {
      weekday: wd, sunrise: st.rise, sunset: st.set,
      tithi: { n: tithi, name: tithiName(tithi), paksha: tithi <= 15 ? ['வளர்பிறை', 'Shukla (waxing)'] : ['தேய்பிறை', 'Krishna (waning)'], end: clock(nextEnd(elong, Jr, 12, 12.19)) },
      nakshatra: { i: nak, pada: Math.floor((nakV % (360 / 27)) / (360 / 108)) + 1, name: [NAK_TA[nak], NAK_EN[nak]], end: clock(nextEnd(sidMoon, Jr, 360 / 27, 13.176)) },
      yoga: { i: yoga, name: [YOGA_TA[yoga], YOGA_EN[yoga]], end: clock(nextEnd(yogaF, Jr, 360 / 27, 14.16)) },
      karana: { name: karanaName(kar), end: clock(nextEnd(elong, Jr, 6, 12.19)) }
    };
    var dayLen = st.set - st.rise, part = dayLen / 8;
    var span = function (n) { return [st.rise + (n - 1) * part, st.rise + n * part]; };
    out.rahu = span(RAHU[wd]); out.yama = span(YAMA[wd]); out.kuligai = span(KULI[wd]);
    var noon = (st.rise + st.set) / 2;
    out.abhijit = [noon - 24, noon + 24];
    out.brahma = [st.rise - 96, st.rise - 48];
    // Moon rasi at the chosen time, and when it moves on
    var mr = Math.floor(sidMoon(Jn) / 30);
    out.moonRasi = { i: mr, ta: RASI_TA[mr], en: RASI_EN[mr], until: clock(nextEnd(sidMoon, Jn, 30, 13.176)) };
    out.sunRasi = Math.floor(sidSun(Jr) / 30);
    // Tamil month and day: the month's first day is the day whose sunset has the new sun sign
    var signAtSet = function (dd) { var s2 = sunTimes(dd.y, dd.m, dd.d, city.lat, city.lon).set; return Math.floor(sidSun(jd(dd.y, dd.m, dd.d, 0) + (s2 - 330) / 1440) / 30); };
    var cur = signAtSet(date), dayNo = 1, dt = new Date(Date.UTC(date.y, date.m - 1, date.d));
    for (var k = 0; k < 33; k++) {
      dt = new Date(dt.getTime() - 86400000);
      var prev = signAtSet({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() });
      if (prev !== cur) break;
      dayNo++;
    }
    out.tamil = { month: [MONTH_TA[cur], MONTH_EN[cur]], day: dayNo, day_name: [DAY_TA[wd], DAY_EN[wd]] };
    return out;
  }

  root.SAPanchangCore = { calc: calc, chandraBala: chandraBala, RASI_TA: RASI_TA, RASI_EN: RASI_EN,
    _t: { elong: elong, sunLon: sunLon, moonLon: moonLon, sid: sid, jd: jd } };
  if (typeof module !== 'undefined') module.exports = root.SAPanchangCore;
})(typeof window !== 'undefined' ? window : globalThis);
