/* Subham Astu — samagri order catalogue (no prices). Each item: [Tamil, English, unit, default quantity, usually-at-home?].
   Used by the online order page: the customer edits quantities, adds missing items from this A-Z list and adds comments. */
(function () {
  'use strict';

  // unit -> [Tamil, English, step]
  var UNIT = {
    gm: ['கிராம்', 'g', 50], kg: ['கிலோ', 'kg', 0.25], ml: ['மி.லி', 'ml', 50], ltr: ['லிட்டர்', 'L', 0.5],
    pcs: ['எண்', 'pcs', 1], pkt: ['பாக்கெட்', 'packet', 1], bunch: ['கட்டு', 'bunch', 1], set: ['செட்', 'set', 1]
  };

  var ITEMS = {
    lamp: ['குத்துவிளக்கு', 'Kuthuvilakku (lamp)', 'pcs', 1, 1],
    agal: ['அகல் விளக்குகள்', 'Agal (clay) lamps', 'pcs', 12],
    oil: ['நல்லெண்ணெய்', 'Gingelly oil', 'ml', 250],
    ghee: ['நெய்', 'Ghee', 'gm', 100],
    wicks: ['பஞ்சுத் திரி', 'Cotton wicks', 'pkt', 1],
    kumkum: ['குங்குமம்', 'Kumkum', 'gm', 50],
    turmeric: ['மஞ்சள் தூள்', 'Turmeric powder', 'gm', 50],
    sandal: ['சந்தனம்', 'Sandal', 'gm', 25],
    vibhuti: ['விபூதி', 'Vibhuti (sacred ash)', 'gm', 50],
    akshata: ['அட்சதை', 'Akshata (rice with turmeric)', 'gm', 100],
    flowers: ['மலர்கள் (உதிரி)', 'Flowers (loose)', 'gm', 250],
    lotus: ['தாமரை / செம்பருத்தி', 'Lotus / hibiscus', 'pcs', 5],
    garland: ['பூமாலை', 'Flower garland', 'pcs', 1],
    tulsi: ['துளசி', 'Tulsi leaves', 'bunch', 1],
    durva: ['அருகம்புல்', 'Arugampul (durva grass)', 'bunch', 1],
    bilva: ['வில்வ இலைகள்', 'Bilva leaves', 'bunch', 1],
    darbha: ['தர்ப்பை', 'Darbha grass', 'bunch', 1],
    betel: ['வெற்றிலை, பாக்கு (தாம்பூலம்)', 'Betel leaves & areca nut (thaamboolam)', 'set', 1],
    fruits: ['பழங்கள் (கலவை)', 'Fruits (mixed)', 'kg', 1],
    banana: ['வாழைப்பழம்', 'Bananas', 'pcs', 12],
    coconut: ['தேங்காய்', 'Coconut', 'pcs', 2],
    tender: ['இளநீர்', 'Tender coconut', 'pcs', 1],
    kalasam: ['கலசம் (செம்பு / பித்தளை)', 'Kalasam (copper / brass pot)', 'pcs', 1, 1],
    mango: ['மாவிலை', 'Mango leaves', 'bunch', 1],
    toran: ['மாவிலைத் தோரணம்', 'Mango-leaf toran', 'pcs', 1],
    bananaleaf: ['வாழை இலை', 'Banana leaf', 'pcs', 2],
    rice: ['பச்சரிசி', 'Raw rice', 'kg', 1],
    sesame: ['எள்', 'Sesame seeds', 'gm', 100],
    navadhanyam: ['நவதானியம்', 'Navadhanyam (nine grains)', 'gm', 250],
    camphor: ['கற்பூரம்', 'Camphor', 'pkt', 1],
    incense: ['ஊதுபத்தி', 'Incense sticks', 'pkt', 1],
    sambrani: ['சாம்பிராணி', 'Sambrani (benzoin)', 'pkt', 1],
    rosewater: ['பன்னீர்', 'Rose water', 'ml', 100],
    matches: ['தீப்பெட்டி', 'Matchbox', 'pcs', 1],
    milk: ['பால்', 'Milk', 'ml', 500],
    curd: ['தயிர்', 'Curd', 'ml', 250],
    honey: ['தேன்', 'Honey', 'ml', 100],
    jaggery: ['வெல்லம்', 'Jaggery', 'gm', 250],
    dal: ['பாசிப்பருப்பு', 'Moong dal', 'gm', 250],
    cane: ['கரும்பு', 'Sugarcane', 'pcs', 2],
    turmericplant: ['மஞ்சள் கொத்து', 'Turmeric plant bunch', 'pcs', 2],
    thread: ['நோன்புச் சரடு / மஞ்சள் கயிறு', 'Nombu thread / turmeric thread', 'pkt', 1],
    bangles: ['வளையல்கள்', 'Bangles', 'set', 1],
    blouse: ['ரவிக்கைத் துணி', 'Blouse piece', 'pcs', 1],
    cloth: ['புதுத் துணி / வஸ்திரம்', 'New cloth (vastram)', 'pcs', 1],
    picture: ['தெய்வப் படம் / விக்ரகம்', 'Deity picture / idol', 'pcs', 1, 1],
    vinayagar: ['களிமண் விநாயகர் சிலை', 'Clay Ganesha idol', 'pcs', 1],
    vel: ['வேல் / முருகன் படம்', 'Vel / Murugan picture', 'pcs', 1, 1],
    sivalingam: ['சிவலிங்கம் / சிவன் படம்', 'Sivalingam / Shiva picture', 'pcs', 1, 1],
    bell: ['மணி', 'Bell', 'pcs', 1, 1],
    kolam: ['கோலமாவு', 'Kolam powder', 'gm', 250],
    neem: ['வேப்பம்பூ', 'Neem flowers', 'gm', 50],
    rawmango: ['மாங்காய்', 'Raw mango', 'pcs', 2],
    pongalpot: ['புதுப் பானை', 'New pongal pot', 'pcs', 1],
    homakundam: ['ஹோம குண்டம்', 'Homa kundam', 'set', 1],
    samidhu: ['சமித்து (மரக் குச்சிகள்)', 'Samidhu (sacred wood sticks)', 'pkt', 1]
  };

  // Typical list for the poojas done by a priest (kind of the catalogue). The priest may change it.
  var KIND = {
    daily: ['lamp', 'oil', 'wicks', 'kumkum', 'turmeric', 'flowers', 'betel', 'fruits', 'kalasam', 'camphor', 'incense', 'matches'],
    vratam: ['lamp', 'oil', 'wicks', 'thread', 'bananaleaf', 'mango', 'kumkum', 'turmeric', 'flowers', 'fruits', 'betel', 'camphor', 'incense'],
    homa: ['homakundam', 'samidhu', 'ghee', 'sesame', 'rice', 'kalasam', 'toran', 'cloth', 'betel', 'fruits', 'flowers', 'camphor'],
    puja: ['kalasam', 'mango', 'coconut', 'garland', 'flowers', 'cloth', 'betel', 'fruits', 'milk', 'camphor', 'incense', 'kumkum', 'navadhanyam', 'rice'],
    samskara: ['betel', 'cloth', 'flowers', 'fruits', 'milk', 'ghee', 'wicks', 'lamp', 'rice', 'sesame', 'darbha']
  };

  function info(key) {
    var it = ITEMS[key];
    if (!it) return null;
    return { key: key, ta: it[0], en: it[1], unit: it[2], qty: it[3], home: !!it[4] };
  }

  // Default rows for a pooja: [{key, on, qty}]. Items usually kept at home start un-ticked.
  function defaults(keys) {
    var seen = {};
    return keys.filter(function (k) { if (!ITEMS[k] || seen[k]) return false; return (seen[k] = true); })
      .map(function (k) { var i = info(k); return { key: k, on: !i.home, qty: i.qty }; });
  }

  window.SAOrder = {
    UNIT: UNIT,
    info: info,
    defaults: defaults,
    kindKeys: function (kind) { return KIND[kind] || KIND.daily; },
    all: function () { return Object.keys(ITEMS).map(info); }
  };
})();
