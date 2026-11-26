/* Subham Astu — content for poojas a family can do at home (is_self_pooja).
   Small line icons for checklist items, a library of traditional mantras in Tamil script, and
   pooja-specific samagri, steps and mantras for all 20 self-done poojas.
   Priest-led poojas (homas, samskaras) never use mantras (project rule 7).
   DRAFT: every mantra must be checked by a priest before launch. */
(function () {
  'use strict';

  var M = '#702C35', G = '#B18A45';
  function svg(inner) {
    return '<svg class="ico" viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="' + M +
      '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }
  function gold(x) { return x.replace(/GOLD/g, G); }

  // ---------- small line icons (own drawings, 32x32) ----------
  var ICON = {
    lamp: '<path d="M10 27h12M13 27l1.5-8h3L19 27"/><path d="M8 17c0 3 3 4 8 4s8-1 8-4H8z"/><path d="M16 5c2 2.5 2.5 4 0 6.5-2.5-2.5-2-4 0-6.5z" fill="GOLD" stroke="GOLD"/>',
    oil: '<path d="M12 9h8v3l2 3v12H10V15l2-3z"/><path d="M13 6h6v3h-6z"/><path d="M13 20h6" stroke="GOLD"/>',
    wick: '<path d="M8 24c4-1 6-6 8-12 2 6 4 11 8 12"/><path d="M16 12c1.5-2 1.5-4 0-6-1.5 2-1.5 4 0 6z" fill="GOLD" stroke="GOLD"/>',
    kumkum: '<path d="M7 17h18l-2 9H9z"/><path d="M10 17c0-3 3-5 6-5s6 2 6 5" fill="#B3202A" stroke="#B3202A"/>',
    turmeric: '<path d="M7 17h18l-2 9H9z"/><path d="M10 17c0-3 3-5 6-5s6 2 6 5" fill="#E6B422" stroke="#E6B422"/>',
    sandal: '<path d="M7 17h18l-2 9H9z"/><path d="M10 17c0-3 3-5 6-5s6 2 6 5" fill="#E8D3A8" stroke="#B89B5E"/>',
    vibhuti: '<path d="M8 11h16M8 16h16M8 21h16" stroke-width="2.4"/>',
    flower: '<circle cx="16" cy="16" r="3" fill="GOLD" stroke="GOLD"/><path d="M16 4c3 3 3 6 0 9-3-3-3-6 0-9zM16 19c3 3 3 6 0 9-3-3-3-6 0-9zM4 16c3-3 6-3 9 0-3 3-6 3-9 0zM19 16c3-3 6-3 9 0-3 3-6 3-9 0z"/>',
    lotus: '<path d="M16 7c3 4 3 9 0 14-3-5-3-10 0-14z"/><path d="M6 12c5 0 8 4 10 9-5 0-9-3-10-9zM26 12c-5 0-8 4-10 9 5 0 9-3 10-9z"/><path d="M8 25c5 3 11 3 16 0"/>',
    garland: '<path d="M5 8c2 14 20 14 22 0"/><circle cx="7" cy="14" r="2" fill="GOLD" stroke="GOLD"/><circle cx="11" cy="20" r="2" fill="GOLD" stroke="GOLD"/><circle cx="16" cy="23" r="2" fill="GOLD" stroke="GOLD"/><circle cx="21" cy="20" r="2" fill="GOLD" stroke="GOLD"/><circle cx="25" cy="14" r="2" fill="GOLD" stroke="GOLD"/>',
    leaf: '<path d="M7 25C7 13 14 7 26 7c0 12-6 19-18 19"/><path d="M7 25L20 12"/>',
    bilva: '<path d="M16 26V14"/><path d="M16 14c-4-1-6-4-5-8 4 0 6 3 5 8zM16 14c4-1 6-4 5-8-4 0-6 3-5 8zM16 16c-5 0-9 2-10 6 4 1 8-1 10-6zM16 16c5 0 9 2 10 6-4 1-8-1-10-6z"/>',
    betel: '<path d="M6 24C6 12 14 6 25 6c0 11-6 18-17 18"/><circle cx="24" cy="24" r="3.5" fill="GOLD" stroke="GOLD"/>',
    fruits: '<path d="M16 11c-5-3-10 1-9 7s5 9 9 8c4 1 8-2 9-8s-4-10-9-7z"/><path d="M16 11c0-3 1-5 3-6"/>',
    banana: '<path d="M6 10c3 14 12 17 21 13-1 1-4 2-7 2-8 0-13-6-14-15z" fill="GOLD" stroke="GOLD"/><path d="M6 10l-1-3"/>',
    coconut: '<circle cx="16" cy="16" r="10"/><circle cx="13" cy="13" r="1.4" fill="' + M + '"/><circle cx="19" cy="13" r="1.4" fill="' + M + '"/><circle cx="16" cy="18" r="1.4" fill="' + M + '"/>',
    kalasam: '<path d="M10 14c-2 3-2 9 2 12h8c4-3 4-9 2-12z"/><path d="M12 14h8"/><path d="M11 12c1-3 3-4 5-4s4 1 5 4"/><circle cx="16" cy="8" r="3" fill="GOLD" stroke="GOLD"/>',
    mango: '<path d="M6 22C8 12 14 8 24 8c-1 9-7 15-18 14z"/><path d="M6 22l-2 4M10 20l10-8"/>',
    rice: '<path d="M4 25c3-9 9-15 12-15s9 6 12 15z"/><path d="M12 20h.01M16 16h.01M20 20h.01M16 22h.01" stroke-width="2.6"/>',
    camphor: '<rect x="9" y="19" width="14" height="6" rx="3"/><path d="M16 17c2-2.5 2-5 0-8-2 3-2 5.500 0 8z" fill="GOLD" stroke="GOLD"/>',
    incense: '<path d="M8 27h16"/><path d="M14 27L20 8"/><path d="M20 8c-2-2-1-4 1-5M24 12c-2-2-1-4 1-5" stroke="GOLD"/>',
    matches: '<rect x="6" y="12" width="20" height="12" rx="2"/><path d="M6 17h20"/><path d="M13 12V7M19 12V7" stroke="GOLD"/>',
    milk: '<path d="M10 6h12l-2 20H12z"/><path d="M10.800 12h10.400" stroke="GOLD"/>',
    pot: '<path d="M9 14c-3 4-2 10 3 12h8c5-2 6-8 3-12z"/><path d="M8 14h16"/><path d="M12 10c0-2 2-2 2-4M18 10c0-2 2-2 2-4" stroke="GOLD"/>',
    honey: '<path d="M10 12h12v14H10z"/><path d="M12 8h8v4h-8z"/><path d="M14 18h4" stroke="GOLD"/>',
    sweets: '<circle cx="12" cy="18" r="6"/><circle cx="21" cy="14" r="5"/><circle cx="19" cy="23" r="4"/>',
    cane: '<path d="M8 27L24 5"/><path d="M12 21l4 3M16 15l4 3M20 9l4 3" stroke="GOLD"/>',
    thread: '<circle cx="16" cy="16" r="9"/><circle cx="16" cy="16" r="5"/><path d="M16 11v10M11 16h10" stroke="GOLD"/>',
    bangles: '<circle cx="12" cy="18" r="7"/><circle cx="21" cy="14" r="6" stroke="GOLD"/>',
    cloth: '<path d="M6 8h20v16H6z"/><path d="M6 13h20M6 19h20" stroke="GOLD"/>',
    frame: '<rect x="7" y="5" width="18" height="22" rx="2"/><circle cx="16" cy="13" r="4" fill="GOLD" stroke="GOLD"/><path d="M10 24c1-4 3-5 6-5s5 1 6 5"/>',
    bell: '<path d="M8 21c0-8 2-12 8-12s8 4 8 12z"/><path d="M6 21h20"/><circle cx="16" cy="25" r="2" fill="GOLD" stroke="GOLD"/><path d="M16 9V6"/>',
    kolam: '<circle cx="16" cy="6" r="1.4" fill="' + M + '"/><circle cx="6" cy="16" r="1.4" fill="' + M + '"/><circle cx="26" cy="16" r="1.4" fill="' + M + '"/><circle cx="16" cy="26" r="1.4" fill="' + M + '"/><path d="M16 6c6 2 8 6 10 10-2 4-4 8-10 10-6-2-8-6-10-10 2-4 4-8 10-10z" stroke="GOLD"/>',
    book: '<path d="M6 7h8c2 0 2 1 2 2v17c0-1-1-2-2-2H6zM26 7h-8c-2 0-2 1-2 2v17c0-1 1-2 2-2h8z"/>',
    dot: '<path d="M16 7l7 9-7 9-7-9z" stroke="GOLD"/>'
  };
  var ICONS = {};
  Object.keys(ICON).forEach(function (k) { ICONS[k] = svg(gold(ICON[k])); });

  // ---------- samagri items: [icon, Tamil, English] ----------
  var ITEM = {
    sesame: ['rice', 'கருப்பு எள்', 'Black sesame'],
    darbha: ['leaf', 'தர்ப்பைப் புல்', 'Darbha grass'],
    elderpic: ['dot', 'முன்னோர் படம்', 'Photo of ancestors'],
    gurupic: ['dot', 'குரு / ஆச்சார்யர் படம்', 'Picture of your Guru'],
    vadamalai: ['garland', 'வடை மாலை', 'Vada garland'],
    poonool: ['thread', 'புதிய பூணூல்', 'New sacred thread (poonool)'],
    paper: ['dot', 'புதிய வெள்ளைக் காகிதம்', 'Fresh white paper'],
    pen: ['dot', 'எழுதுகோல் (பேனா)', 'Pen'],
    coins: ['dot', 'நாணயங்கள் / பணம்', 'Coins and notes'],
    panakam: ['milk', 'பானகம்', 'Panakam (jaggery drink)'],
    neermor: ['milk', 'நீர்மோர்', 'Spiced buttermilk'],
    butter: ['milk', 'வெண்ணெய்', 'Butter'],
    greens: ['leaf', 'அகத்திக்கீரை / புல்', 'Agathi keerai or fresh grass'],
    cowdecor: ['dot', 'பசுவுக்கான மஞ்சள், குங்குமம், மாலை, மணி', 'Turmeric, kumkum, garland and bell for the cow'],
    kadai: ['sweets', 'காரடை (இனிப்பு) & உப்பு அடை', 'Karadai (sweet) and salted adai'],
    rawbutter: ['milk', 'உருக்காத வெண்ணெய்', 'Unmelted butter'],
    kuberakolam: ['dot', 'குபேர கோலம் (அரிசி மாவு)', 'Kubera kolam (rice flour)'],
    lamp: ['lamp', 'குத்துவிளக்கு', 'Kuthuvilakku (lamp)'],
    agal: ['lamp', 'அகல் விளக்குகள்', 'Agal (clay) lamps'],
    oil: ['oil', 'நல்லெண்ணெய் / நெய்', 'Gingelly oil or ghee'],
    wicks: ['wick', 'பஞ்சுத் திரி', 'Cotton wicks'],
    kumkum: ['kumkum', 'குங்குமம்', 'Kumkum'],
    turmeric: ['turmeric', 'மஞ்சள் தூள்', 'Turmeric powder'],
    sandal: ['sandal', 'சந்தனம்', 'Sandal paste'],
    vibhuti: ['vibhuti', 'விபூதி', 'Vibhuti (sacred ash)'],
    flowers: ['flower', 'மலர்கள்', 'Flowers'],
    lotus: ['lotus', 'தாமரை / செம்பருத்தி', 'Lotus / hibiscus'],
    garland: ['garland', 'பூமாலை', 'Flower garland'],
    tulsi: ['leaf', 'துளசி இலைகள்', 'Tulsi leaves'],
    durva: ['leaf', 'அருகம்புல்', 'Arugampul (durva grass)'],
    bilva: ['bilva', 'வில்வ இலைகள்', 'Bilva leaves'],
    betel: ['betel', 'வெற்றிலை, பாக்கு', 'Betel leaves & areca nut'],
    fruits: ['fruits', 'பழங்கள்', 'Fruits'],
    banana: ['banana', 'வாழைப்பழம்', 'Bananas'],
    coconut: ['coconut', 'தேங்காய்', 'Coconut'],
    tender: ['coconut', 'இளநீர்', 'Tender coconut water'],
    kalasam: ['kalasam', 'கலசம் (நீர் நிரப்பியது)', 'Kalasam filled with water'],
    mango: ['mango', 'மாவிலை', 'Mango leaves'],
    rice: ['rice', 'பச்சரிசி', 'Raw rice'],
    camphor: ['camphor', 'கற்பூரம்', 'Camphor'],
    incense: ['incense', 'ஊதுபத்தி', 'Incense sticks'],
    matches: ['matches', 'தீப்பெட்டி', 'Matchbox'],
    milk: ['milk', 'பால்', 'Milk'],
    curd: ['pot', 'தயிர்', 'Curd'],
    honey: ['honey', 'தேன்', 'Honey'],
    sweets: ['sweets', 'இனிப்பு / நைவேத்தியம்', 'Sweets / naivedyam'],
    modak: ['sweets', 'கொழுக்கட்டை', 'Kozhukattai (modak)'],
    sundal: ['sweets', 'சுண்டல், அவல், பொரி', 'Sundal, aval & pori'],
    sweetpongal: ['pot', 'சர்க்கரைப் பொங்கல்', 'Sweet pongal'],
    pongalpot: ['pot', 'புதுப் பானை', 'New pongal pot'],
    jaggery: ['sweets', 'வெல்லம்', 'Jaggery'],
    dal: ['rice', 'பாசிப்பருப்பு', 'Moong dal'],
    cane: ['cane', 'கரும்பு', 'Sugarcane'],
    turmericplant: ['leaf', 'மஞ்சள் கொத்து', 'Turmeric plant bunch'],
    thread: ['thread', 'நோன்புச் சரடு / மஞ்சள் கயிறு', 'Nombu thread / turmeric thread'],
    bangles: ['bangles', 'வளையல்கள்', 'Bangles'],
    blouse: ['cloth', 'ரவிக்கைத் துணி', 'Blouse piece'],
    cloth: ['cloth', 'புதுத் துணி / வஸ்திரம்', 'New cloth'],
    picture: ['frame', 'தெய்வப் படம் / விக்ரகம்', 'Deity picture / idol'],
    vinayagar: ['frame', 'களிமண் விநாயகர் சிலை', 'Clay Ganesha idol'],
    vel: ['frame', 'வேல் / முருகன் படம்', 'Vel / Murugan picture'],
    sivalingam: ['frame', 'சிவலிங்கம் / சிவன் படம்', 'Sivalingam / Shiva picture'],
    bell: ['bell', 'மணி', 'Bell'],
    kolam: ['kolam', 'கோலமாவு', 'Kolam powder'],
    bananaleaf: ['leaf', 'வாழை இலை', 'Banana leaf'],
    books: ['book', 'புத்தகங்கள், கருவிகள்', 'Books & tools'],
    neem: ['leaf', 'வேப்பம்பூ', 'Neem flowers'],
    rawmango: ['fruits', 'மாங்காய்', 'Raw mango'],
    panchamritham: ['pot', 'பஞ்சாமிர்தம்', 'Panchamritham']
  };


  // ---------- how to get each item ready: [Tamil, English] ----------
  var PREP = {
    sesame: ['சிறு கிண்ணத்தில் வைக்கவும்.', 'Keep in a small bowl.'],
    darbha: ['கழுவி வைக்கவும்; கிடைக்காவிட்டால் வாத்தியாரிடம் கேளுங்கள்.', 'Wash and keep; ask your priest if you cannot find it.'],
    elderpic: ['சுத்தமாகத் துடைத்து மாலை அணிவிக்கவும்.', 'Wipe clean and garland it.'],
    gurupic: ['சுத்தமாகத் துடைத்து மலர் வைக்கவும்.', 'Wipe clean and place flowers.'],
    vadamalai: ['முன்னதாகவே மிளகு வடை செய்து மாலையாகக் கோர்க்கவும்.', 'Make pepper vadas earlier and string them.'],
    poonool: ['வாத்தியார் அல்லது கடையில் வாங்கி முன்கூட்டியே வைக்கவும்.', 'Buy or arrange from your priest in advance.'],
    paper: ['சுத்தமான தாள்; தட்டில் வைக்கவும்.', 'A clean sheet; keep it on a plate.'],
    pen: ['புதிய அல்லது சுத்தமான பேனா.', 'A new or clean pen.'],
    coins: ['சுத்தம் செய்து தட்டில் வைக்கவும்.', 'Clean them and keep on a plate.'],
    panakam: ['வெல்லம், சுக்கு, ஏலக்காய், எலுமிச்சை சேர்த்து முன்னதாகத் தயாரிக்கவும்.', 'Make with jaggery, dry ginger, cardamom and lemon.'],
    neermor: ['பூஜைக்கு முன் தயாரிக்கவும்.', 'Prepare before the pooja.'],
    butter: ['சிறு கிண்ணத்தில் வைக்கவும்.', 'Keep in a small bowl.'],
    greens: ['பசுவுக்குக் கொடுக்க, கழுவிக் கட்டி வைக்கவும்.', 'To feed the cow; wash and bundle.'],
    cowdecor: ['பசுவின் அருகில் ஒரு தட்டில் வைக்கவும்.', 'Keep on a plate near the cow.'],
    kadai: ['பச்சரிசி மாவு, காராமணி கொண்டு முன்கூட்டியே தயாரிக்கவும்.', 'Make with rice flour and cowpeas beforehand.'],
    rawbutter: ['சிறு கிண்ணத்தில் வைக்கவும்.', 'Keep in a small bowl.'],
    kuberakolam: ['பூஜைப் பீடத்தில் அரிசி மாவால் வரையவும்.', 'Draw on the pooja seat with rice flour.'],
    lamp: ['கழுவித் துடைத்து, சந்தனம் குங்குமம் இடவும்.', 'Wash, wipe dry and mark with sandal and kumkum.'],
    agal: ['புது அகல்களை முதல் நாள் நீரில் ஊறவைத்துக் காயவிடவும்.', 'Soak new clay lamps in water the day before and dry them.'],
    oil: ['விளக்கின் முக்கால் பங்கு நிரப்பவும்.', 'Fill the lamp about three-quarters.'],
    wicks: ['பஞ்சைத் திரியாகத் திரித்து, எண்ணெயில் நனைத்து வைக்கவும்.', 'Twist cotton into wicks and dip them in oil.'],
    kumkum: ['சிறு கிண்ணத்தில் வைக்கவும்.', 'Keep in a small bowl.'],
    turmeric: ['பூஜைக்கு எனத் தனியாகச் சிறு கிண்ணத்தில் வைக்கவும்.', 'Keep a separate small bowl for the pooja.'],
    sandal: ['சந்தனக் கட்டையை உரைத்து அல்லது பொடியைக் குழைத்து வைக்கவும்.', 'Grind sandalwood or mix the powder with water.'],
    vibhuti: ['சிறு தட்டில் வைக்கவும்.', 'Keep on a small plate.'],
    flowers: ['அன்று காலை வாங்கி, ஈரத் துணியில் சுற்றி வைக்கவும்; முகர்ந்த அல்லது கீழே விழுந்த பூ வேண்டாம்.', 'Buy that morning and wrap in a damp cloth; do not use smelled or fallen flowers.'],
    lotus: ['தண்டுடன் நீர்க் கிண்ணத்தில் வைக்கவும்.', 'Keep with the stem in a bowl of water.'],
    garland: ['புதிய மாலை; பூஜைக்கு முன் எடுத்து வைக்கவும்.', 'A fresh garland, kept ready before the pooja.'],
    tulsi: ['கழுவி, தட்டில் வைக்கவும். (விநாயகருக்குத் துளசி வேண்டாம்.)', 'Wash and keep on a plate. (Not for Ganesha.)'],
    durva: ['கழுவி, 21 புல்லாகக் கட்டி வைக்கவும்.', 'Wash and tie into bunches of 21 blades.'],
    bilva: ['மூன்று இதழ் இலைகளைக் கழுவி வைக்கவும்.', 'Wash three-petal leaves and keep ready.'],
    betel: ['2 வெற்றிலை, பாக்கு, வாழைப்பழத்துடன் தாம்பூலத் தட்டாக வைக்கவும்.', 'Arrange 2 betel leaves, areca nut and a banana on a plate.'],
    fruits: ['நன்கு பழுத்த, கெடாத பழங்களைக் கழுவித் துடைக்கவும்.', 'Choose ripe, unspoiled fruit; wash and wipe dry.'],
    banana: ['2 அல்லது 4 பழங்கள்; கழுவி வைக்கவும்.', '2 or 4 bananas; wash and keep.'],
    coconut: ['குடுமியுடன் நல்ல தேங்காய்; கழுவி மஞ்சள் தடவவும்.', 'A good coconut with its tuft; wash and apply turmeric.'],
    tender: ['அபிஷேகத்திற்குப் பாத்திரத்தில் எடுத்து வைக்கவும்.', 'Pour into a vessel for abhishekam.'],
    kalasam: ['செம்பில் நீர் நிரப்பி, மாவிலை வைத்து, மேல் தேங்காய் வைக்கவும்; மஞ்சள் குங்குமம் இடவும்.', 'Fill a pot with water, set mango leaves and a coconut on top; mark with turmeric and kumkum.'],
    mango: ['5 அல்லது 7 இலைகள், காம்புடன்.', '5 or 7 leaves with stalks.'],
    rice: ['தட்டில் பரப்பி வைக்கவும்.', 'Spread on a plate.'],
    camphor: ['ஆரத்தித் தட்டில் வைக்கவும்.', 'Keep on the aarti plate.'],
    incense: ['ஸ்டாண்டுடன் எடுத்து வைக்கவும்.', 'Keep with a stand.'],
    matches: ['கை எட்டும் இடத்தில் வைக்கவும்.', 'Keep within reach.'],
    milk: ['அபிஷேகத்திற்குச் சுத்தமான பால்.', 'Clean milk for abhishekam.'],
    curd: ['புளிக்காத புதிய தயிர்.', 'Fresh, non-sour curd.'],
    honey: ['சிறு கிண்ணத்தில் வைக்கவும்.', 'Keep in a small bowl.'],
    sweets: ['வீட்டிலேயே செய்தது சிறப்பு; இல்லையெனில் வாங்கிய இனிப்பு.', 'Home-made is best; otherwise bought sweets are fine.'],
    modak: ['அரிசி மாவில் தேங்காய்-வெல்லப் பூரணம் வைத்து ஆவியில் வேகவைக்கவும்.', 'Fill rice dough with coconut-jaggery and steam.'],
    sundal: ['முதல் நாள் இரவு கடலையை ஊறவைத்து, வேகவைத்துத் தாளிக்கவும்.', 'Soak the chickpeas overnight, boil and temper.'],
    sweetpongal: ['பச்சரிசி, பாசிப்பருப்பு, வெல்லம், நெய் சேர்த்துச் செய்யவும்.', 'Cook rice, moong dal, jaggery and ghee.'],
    pongalpot: ['புதுப் பானைக்கு மஞ்சள் கொத்து கட்டிக் கோலமிடவும்.', 'Tie a turmeric plant on the new pot and draw a kolam.'],
    jaggery: ['தண்ணீரில் கரைத்து வடிகட்டவும்.', 'Dissolve in water and strain.'],
    dal: ['லேசாக வறுத்து வேகவைக்கவும்.', 'Dry-roast lightly and boil.'],
    cane: ['முழுக் கரும்பைச் சுத்தம் செய்து வைக்கவும்.', 'Clean the whole sugarcane.'],
    turmericplant: ['பானையின் கழுத்தில் கட்டவும்.', 'Tie around the neck of the pot.'],
    thread: ['மஞ்சள் தடவிய நூலில் பூ வைத்துத் தயாராக வைக்கவும்.', 'Turmeric-dyed thread with a flower, kept ready.'],
    bangles: ['தாம்பூலத்துடன் தனியாக வைக்கவும்.', 'Keep aside with the thaamboolam.'],
    blouse: ['புதிய துணி; தாம்பூலத்துடன் வைக்கவும்.', 'New cloth, kept with the thaamboolam.'],
    cloth: ['புதுத் துணியில் மஞ்சள் தொட்டு வைக்கவும்.', 'Touch a new cloth with turmeric.'],
    picture: ['படத்தைத் துடைத்து, சந்தனம் குங்குமம் இட்டு, பூ சாத்தவும்.', 'Wipe the picture, apply sandal and kumkum, and add a flower.'],
    vinayagar: ['இயற்கைக் களிமண் சிலை; பலகையில் வாழை இலை வைத்து அமர்த்தவும்.', 'Natural clay idol; seat it on a banana leaf over a plank.'],
    vel: ['வேல் அல்லது படத்தைத் துடைத்து வைக்கவும்.', 'Wipe the vel or picture clean.'],
    sivalingam: ['லிங்கம் / படத்தைச் சுத்தம் செய்து, தட்டில் வைக்கவும்.', 'Clean the lingam or picture and set it on a plate.'],
    bell: ['கழுவித் துடைத்து வைக்கவும்.', 'Wash and wipe dry.'],
    kolam: ['பூஜை இடத்தில் அரிசி மாவுக் கோலம் இடவும்.', 'Draw a rice-flour kolam at the pooja place.'],
    bananaleaf: ['நுனி இலையைக் கழுவித் துடைக்கவும்.', 'Wash and wipe the tip leaf.'],
    books: ['சுத்தம் செய்து பலகையில் வைக்கவும்; அன்று படிக்க வேண்டாம்.', 'Clean and place on a plank; do not study that day.'],
    neem: ['பச்சடிக்கு வேப்பம்பூவை ஆய்ந்து வைக்கவும்.', 'Pick and clean neem flowers for the pachadi.'],
    rawmango: ['பச்சடிக்குச் சிறு துண்டுகளாக நறுக்கவும்.', 'Chop into small pieces for the pachadi.'],
    panchamritham: ['வாழைப்பழம், வெல்லம், நெய், தேன், உலர் திராட்சை கலக்கவும்.', 'Mix banana, jaggery, ghee, honey and raisins.']
  };

  // ---------- mantra library (Tamil script). me = [Tamil meaning, English meaning] ----------
  var MANTRA = {
    ganesha_dhyana: { t: ['விநாயகர் துதி', 'Ganesha prayer'], v: ['சுக்லாம்பரதரம் விஷ்ணும் சசிவர்ணம் சதுர்புஜம் |', 'ப்ரசன்னவதனம் த்யாயேத் ஸர்வவிக்னோபசாந்தயே ||'],
      me: ['வெண்ணாடை அணிந்த, மலர்ந்த முகமுடைய விநாயகரை எல்லாத் தடைகளும் நீங்கத் தியானிக்கிறேன்.', 'I meditate on cheerful Ganesha, in white garments, for the removal of all obstacles.'] },
    ganesha_gayatri: { t: ['விநாயகர் காயத்ரி', 'Ganesha Gayatri'], v: ['ஓம் ஏகதந்தாய வித்மஹே வக்ரதுண்டாய தீமஹி |', 'தந்நோ தந்தி: ப்ரசோதயாத் ||'],
      me: ['ஒற்றைத் தந்தமுடைய விநாயகரை அறிவோம்; தியானிப்போம்; அவர் நம்மை நல்வழிப்படுத்தட்டும்.', 'We know the one-tusked Ganesha and meditate on him; may he guide us.'] },
    vakratunda: { t: ['வக்ரதுண்ட மந்திரம்', 'Vakratunda shloka'], v: ['வக்ரதுண்ட மஹாகாய ஸூர்யகோடி ஸமப்ரப |', 'நிர்விக்நம் குருமே தேவ ஸர்வகார்யேஷு ஸர்வதா ||'],
      me: ['கோடி சூரிய ஒளி கொண்டவரே, என் எல்லாச் செயல்களிலும் தடைகளை நீக்கி அருள்வாய்.', 'O radiant Ganesha, make all my undertakings free of obstacles.'] },
    avvai: { t: ['ஔவையார் விநாயகர் துதி', 'Avvaiyar\'s Vinayagar prayer'], v: ['பாலும் தெளிதேனும் பாகும் பருப்பும் இவை', 'நாலும் கலந்துனக்கு நான் தருவேன் - கோலம்செய்', 'துங்கக் கரிமுகத்துத் தூமணியே நீஎனக்குச்', 'சங்கத் தமிழ்மூன்றும் தா ||'],
      me: ['பால், தேன், பாகு, பருப்பு ஆகிய நான்கையும் உனக்குத் தருவேன்; எனக்கு முத்தமிழைத் தந்தருள்வாய்.', 'I offer you milk, honey, jaggery and dal; grant me the three forms of Tamil.'] },
    sankata: { t: ['சங்கடஹர துதி', 'Sankatahara prayer'], v: ['ப்ரணம்ய ஶிரஸா தேவம் கௌரீபுத்ரம் விநாயகம் |', 'பக்தாவாஸம் ஸ்மரேந்நித்யம் ஆயு: காமார்த்த ஸித்தயே ||'],
      me: ['கௌரியின் மைந்தன் விநாயகரைத் தலை வணங்கி, ஆயுள் விருப்பம் நிறைவேற நாளும் நினைக்கிறேன்.', 'I bow to Ganesha, son of Gauri, and remember him daily for long life and fulfilled wishes.'] },
    deepa: { t: ['தீப மந்திரம்', 'Lamp shloka'], v: ['ஶுபம் கரோதி கல்யாணம் ஆரோக்யம் தநஸம்பதா |', 'ஶத்ருபுத்தி விநாஶாய தீபஜ்யோதிர் நமோஸ்துதே ||'],
      me: ['நன்மை, ஆரோக்கியம், செல்வம் தந்து, தீய எண்ணங்களை அழிக்கும் தீப ஒளியை வணங்குகிறேன்.', 'I bow to the lamp-light that brings good fortune, health and wealth and destroys ill thoughts.'] },
    lakshmi_gayatri: { t: ['லட்சுமி காயத்ரி', 'Lakshmi Gayatri'], v: ['ஓம் மஹாலக்ஷ்ம்யை ச வித்மஹே விஷ்ணுபத்ந்யை ச தீமஹி |', 'தந்நோ லக்ஷ்மீ: ப்ரசோதயாத் ||'],
      me: ['மகாலட்சுமியை அறிவோம்; விஷ்ணுவின் துணைவியைத் தியானிப்போம்; அவள் நம்மை நல்வழிப்படுத்தட்டும்.', 'We know Mahalakshmi, consort of Vishnu, and meditate on her; may she guide us.'] },
    lakshmi_stuti: { t: ['மகாலட்சுமி துதி', 'Mahalakshmi prayer'], v: ['நமஸ்தேஸ்து மஹாமாயே ஶ்ரீபீடே ஸுரபூஜிதே |', 'ஶங்கசக்ரகதாஹஸ்தே மஹாலக்ஷ்மி நமோஸ்துதே ||'],
      me: ['தேவர்களால் வணங்கப்படும், சங்கு சக்கரம் கதை ஏந்திய மகாலட்சுமியே, உன்னை வணங்குகிறேன்.', 'Salutations to Mahalakshmi, worshipped by the gods, holding conch, discus and mace.'] },
    lakshmi_nama: { t: ['லட்சுமி நாமம்', 'Lakshmi name'], v: ['ஓம் ஶ்ரீ மஹாலக்ஷ்ம்யை நம: ||'], me: ['மகாலட்சுமிக்கு வணக்கம்.', 'Salutations to Mahalakshmi.'] },
    varalakshmi_nama: { t: ['வரலட்சுமி நாமம்', 'Varalakshmi name'], v: ['ஓம் ஶ்ரீ வரலக்ஷ்ம்யை நம: ||'], me: ['வரம் அருளும் வரலட்சுமிக்கு வணக்கம்.', 'Salutations to Varalakshmi, giver of boons.'] },
    mangala: { t: ['மங்கள ஸ்லோகம்', 'Mangala shloka'], v: ['ஸர்வமங்கல மாங்கல்யே ஶிவே ஸர்வார்த்த ஸாதிகே |', 'ஶரண்யே த்ர்யம்பகே தேவி நாராயணி நமோஸ்துதே ||'],
      me: ['எல்லா மங்கலங்களின் மங்கலமே, எல்லாப் பயனும் தருபவளே, தஞ்சம் அளிக்கும் தேவி நாராயணியே, வணக்கம்.', 'Salutations to Devi Narayani, the auspiciousness of all that is auspicious and the giver of all goals.'] },
    durga: { t: ['தேவி துதி', 'Devi prayer'], v: ['யா தேவீ ஸர்வபூதேஷு ஶக்திரூபேண ஸம்ஸ்திதா |', 'நமஸ்தஸ்யை நமஸ்தஸ்யை நமஸ்தஸ்யை நமோ நம: ||'],
      me: ['எல்லா உயிர்களிலும் சக்தியாக விளங்கும் தேவிக்கு மீண்டும் மீண்டும் வணக்கம்.', 'Repeated salutations to the Devi who dwells in all beings as Shakti.'] },
    saraswati1: { t: ['சரஸ்வதி துதி', 'Saraswati prayer'], v: ['ஸரஸ்வதி நமஸ்துப்யம் வரதே காமரூபிணி |', 'வித்யாரம்பம் கரிஷ்யாமி ஸித்திர்பவது மே ஸதா ||'],
      me: ['வரம் தரும் சரஸ்வதியே, வணக்கம்; கல்வியைத் தொடங்குகிறேன்; எனக்கு எப்போதும் வெற்றி கிடைக்கட்டும்.', 'Salutations Saraswati, giver of boons; I begin my learning, may I always succeed.'] },
    saraswati2: { t: ['சரஸ்வதி தியானம்', 'Saraswati meditation'], v: ['யா குந்தேந்து துஷாரஹார தவளா யா ஶுப்ரவஸ்த்ராவ்ருதா |', 'யா வீணாவரதண்டமண்டிதகரா யா ஶ்வேதபத்மாஸநா ||'],
      me: ['மல்லிகை, நிலவு, பனி போல வெண்மையானவள்; வெண்ணாடை அணிந்து வீணை ஏந்தி வெண்தாமரையில் அமர்ந்தவள்.', 'She who is white as jasmine, moon and snow, in white garments, holding the veena, seated on a white lotus.'] },
    panchakshara: { t: ['பஞ்சாட்சரம்', 'Panchakshara'], v: ['ஓம் நம: ஶிவாய ||'], me: ['சிவனுக்கு வணக்கம்.', 'Salutations to Shiva.'] },
    mrityunjaya: { t: ['மிருத்யுஞ்சய மந்திரம்', 'Mrityunjaya mantra'], v: ['ஓம் த்ர்யம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்தநம் |', 'உர்வாருகமிவ பந்தநாந் ம்ருத்யோர்முக்ஷீய மாம்ருதாத் ||'],
      me: ['மூன்று கண்ணுடைய, வளம் தருபவனை வணங்குகிறேன்; பழம் காம்பிலிருந்து விடுபடுவது போல, மரண பயத்திலிருந்து என்னை விடுவிப்பாயாக.', 'We worship the three-eyed giver of nourishment; as a ripe fruit frees itself from its stem, free us from the fear of death.'] },
    sivapuranam: { t: ['சிவபுராணம் (திருவாசகம்)', 'Sivapuranam (Thiruvasagam)'], v: ['நமச்சிவாய வாழ்க நாதன் தாள் வாழ்க', 'இமைப்பொழுதும் என் நெஞ்சில் நீங்காதான் தாள் வாழ்க', 'கோகழி ஆண்ட குருமணி தன் தாள் வாழ்க ||'],
      me: ['மாணிக்கவாசகர் பாடிய சிவபுராணத்தின் தொடக்க வரிகள்.', 'Opening lines of Sivapuranam by Manikkavasagar.'] },
    lingashtaka: { t: ['லிங்காஷ்டகம் (1-4)', 'Lingashtakam (1-4)'], v: ['ப்ரஹ்மமுராரி ஸுரார்சித லிங்கம் நிர்மலபாஸித ஶோபித லிங்கம் |', 'ஜன்மஜ து:கவிநாஶக லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||', 'தேவமுநிப்ரவரார்சித லிங்கம் காமதஹன கருணாகர லிங்கம் |', 'ராவணதர்பவிநாஶன லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||', 'ஸர்வஸுகந்தி ஸுலேபித லிங்கம் புத்திவிவர்தன காரண லிங்கம் |', 'ஸித்தஸுராஸுர வந்தித லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||', 'கனகமஹாமணி பூஷித லிங்கம் பணிபதிவேஷ்டித ஶோபித லிங்கம் |', 'தக்ஷஸுயஜ்ஞ விநாஶன லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||'],
      me: ['சதாசிவ லிங்கத்தைப் போற்றும் எட்டுப் பாடல்களில் முதல் நான்கு: பிரம்மாவும் விஷ்ணுவும் வணங்கும், களங்கமற்ற, பிறவித் துன்பம் போக்கும் லிங்கத்தை வணங்குகிறேன்.', 'First four of eight verses praising the Sadashiva lingam, worshipped by Brahma and Vishnu, spotless, destroyer of the sorrow of birth.'] },
    uma: { t: ['உமாமகேஸ்வர நாமம்', 'Uma-Maheshwara name'], v: ['ஓம் உமாமஹேஶ்வராப்யாம் நம: ||'], me: ['உமையும் மகேசனும் ஆகிய இருவருக்கும் வணக்கம்.', 'Salutations to Uma and Maheshwara.'] },
    vishnu_shanta: { t: ['விஷ்ணு தியானம்', 'Vishnu meditation'], v: ['ஶாந்தாகாரம் புஜகஶயநம் பத்மநாபம் ஸுரேஶம்', 'விஶ்வாதாரம் ககநஸத்ருஶம் மேகவர்ணம் ஶுபாங்கம் |', 'லக்ஷ்மீகாந்தம் கமலநயநம் யோகிஹ்ருத்த்யாநகம்யம்', 'வந்தே விஷ்ணும் பவபயஹரம் ஸர்வலோகைகநாதம் ||'],
      me: ['அமைதியான வடிவினர், பாம்புப் படுக்கையில் துயில்பவர், தாமரை நாபியர்; பிறவிப் பயம் தீர்க்கும் உலகநாதன் விஷ்ணுவை வணங்குகிறேன்.', 'I bow to the serene Vishnu reclining on the serpent, lotus-naveled lord of all worlds, remover of the fear of rebirth.'] },
    vishnu_gayatri: { t: ['விஷ்ணு காயத்ரி', 'Vishnu Gayatri'], v: ['ஓம் நாராயணாய வித்மஹே வாஸுதேவாய தீமஹி |', 'தந்நோ விஷ்ணு: ப்ரசோதயாத் ||'],
      me: ['நாராயணனை அறிவோம்; வாசுதேவனைத் தியானிப்போம்; விஷ்ணு நம்மை நல்வழிப்படுத்தட்டும்.', 'We know Narayana and meditate on Vasudeva; may Vishnu guide us.'] },
    narayana: { t: ['நாராயண நாமம்', 'Narayana name'], v: ['ஓம் நமோ நாராயணாய ||'], me: ['நாராயணனுக்கு வணக்கம்.', 'Salutations to Narayana.'] },
    tiruppavai: { t: ['திருப்பாவை - முதல் பாசுரம்', 'Tiruppavai - first verse'], v: ['மார்கழித் திங்கள் மதிநிறைந்த நன்னாளால்', 'நீராடப் போதுவீர் போதுமினோ நேரிழையீர்', 'சீர்மல்கும் ஆய்ப்பாடிச் செல்வச் சிறுமீர்காள்', 'கூர்வேல் கொடுந்தொழிலன் நந்தகோபன் குமரன்', 'ஏரார்ந்த கண்ணி யசோதை இளஞ்சிங்கம்', 'கார்மேனிச் செங்கண் கதிர்மதியம் போல்முகத்தான்', 'நாராயணனே நமக்கே பறைதருவான்', 'பாரோர் புகழப் படிந்தேலோர் எம்பாவாய் ||'],
      me: ['ஆண்டாள் பாடிய திருப்பாவையின் முதல் பாசுரம்: மார்கழி நன்னாளில் நீராடி நாராயணனை வழிபட அழைக்கிறது.', 'First verse of Andal\'s Tiruppavai, inviting everyone to bathe on a Margazhi morning and worship Narayana.'] },
    muruga_venba: { t: ['கந்த சஷ்டி கவசம் - தொடக்கம்', 'Kanda Sashti Kavacham - opening'], v: ['துதிப்போர்க்கு வல்வினை போம் துன்பம் போம் நெஞ்சில்', 'பதிப்போர்க்குச் செல்வம் பலித்துக் கதித்தோங்கும்', 'நிஷ்டையும் கைகூடும் நிமலர் அருள் கந்தர்', 'சஷ்டி கவசந் தனை ||'],
      me: ['இக்கவசத்தைத் துதிப்போர்க்கு வினைகளும் துன்பமும் நீங்கும்; செல்வமும் தியானமும் கைகூடும்.', 'For those who recite this kavacham, troubles go away and wealth and inner focus increase.'] },
    muruga_nama: { t: ['முருகன் நாமம்', 'Murugan name'], v: ['ஓம் ஶரவணபவாய நம: ||'], me: ['முருகப் பெருமானுக்கு வணக்கம்.', 'Salutations to Lord Murugan.'] },
    hanuman: { t: ['அனுமன் துதி', 'Hanuman prayer'], v: ['மநோஜவம் மாருததுல்ய வேகம் ஜிதேந்த்ரியம் புத்திமதாம் வரிஷ்டம் |', 'வாதாத்மஜம் வாநரயூதமுக்யம் ஶ்ரீராமதூதம் ஶிரஸா நமாமி ||'],
      me: ['மனம் போல் வேகமும் காற்றின் வலிமையும் கொண்ட, அறிவில் சிறந்த ராமதூதன் அனுமனைத் தலை வணங்குகிறேன்.', 'I bow to Hanuman, swift as the mind, strong as the wind, wisest of the wise, messenger of Rama.'] },
    rama_dhyana: { t: ['ராம துதி', 'Rama prayer'], v: ['ஆபதாமபஹர்தாரம் தாதாரம் ஸர்வஸம்பதாம் |', 'லோகாபிராமம் ஶ்ரீராமம் பூயோ பூயோ நமாம்யஹம் ||'],
      me: ['துன்பம் தீர்த்து எல்லாச் செல்வமும் தரும், உலகம் விரும்பும் ஸ்ரீராமனை மீண்டும் மீண்டும் வணங்குகிறேன்.', 'I bow again and again to Sri Rama, remover of dangers, giver of all wealth, beloved of the world.'] },
    rama_nama: { t: ['ராம நாமம்', 'Rama name'], v: ['ஶ்ரீ ராம ராம ராமேதி ரமே ராமே மநோரமே |', 'ஸஹஸ்ரநாம தத்துல்யம் ராமநாம வரானநே ||'],
      me: ['"ராம" என்று மூன்று முறை சொல்வது ஆயிரம் நாமங்களுக்குச் சமம்.', 'Saying "Rama" three times equals chanting a thousand names.'] },
    krishna1: { t: ['கிருஷ்ண துதி', 'Krishna prayer'], v: ['க்ருஷ்ணாய வாஸுதேவாய ஹரயே பரமாத்மநே |', 'ப்ரணதக்லேஶ நாஶாய கோவிந்தாய நமோ நம: ||'],
      me: ['வணங்குவோரின் துன்பம் தீர்க்கும் வாசுதேவன், கோவிந்தனுக்கு மீண்டும் மீண்டும் வணக்கம்.', 'Salutations to Krishna Vasudeva, Govinda, remover of the sorrows of those who bow to him.'] },
    krishna2: { t: ['கிருஷ்ண தியானம்', 'Krishna meditation'], v: ['வஸுதேவ ஸுதம் தேவம் கம்ஸசாணூர மர்தநம் |', 'தேவகீ பரமாநந்தம் க்ருஷ்ணம் வந்தே ஜகத்குரும் ||'],
      me: ['வசுதேவர் மைந்தன், தேவகியின் பேரானந்தம், உலகின் குருவான கிருஷ்ணனை வணங்குகிறேன்.', 'I bow to Krishna, son of Vasudeva, joy of Devaki, teacher of the world.'] },
    surya: { t: ['சூரிய துதி', 'Surya prayer'], v: ['ஜபாகுஸும ஸங்காஶம் காஶ்யபேயம் மஹாத்யுதிம் |', 'தமோரிம் ஸர்வபாபக்நம் ப்ரணதோஸ்மி திவாகரம் ||'],
      me: ['செம்பருத்தி நிறத்தவர், இருளை அழிப்பவர், பாவம் தீர்க்கும் சூரியனை வணங்குகிறேன்.', 'I bow to the Sun, red as the hibiscus, enemy of darkness, destroyer of sin.'] },
    surya_gayatri: { t: ['சூரிய காயத்ரி', 'Surya Gayatri'], v: ['ஓம் பாஸ்கராய வித்மஹே மஹாத்யுதிகராய தீமஹி |', 'தந்நோ ஆதித்ய: ப்ரசோதயாத் ||'],
      me: ['பாஸ்கரனை அறிவோம்; பேரொளி தருபவனைத் தியானிப்போம்; சூரியன் நம்மை நல்வழிப்படுத்தட்டும்.', 'We know Bhaskara and meditate on the giver of great light; may the Sun guide us.'] },
    kaveri: { t: ['நதி வணக்கம்', 'River prayer'], v: ['கங்கே ச யமுநே சைவ கோதாவரி ஸரஸ்வதி |', 'நர்மதே ஸிந்து காவேரி ஜலேஸ்மிந் ஸந்நிதிம் குரு ||'],
      me: ['கங்கை, யமுனை, கோதாவரி, சரஸ்வதி, நர்மதை, சிந்து, காவேரி ஆகிய நதிகளே, இந்த நீரில் வந்து அமையுங்கள்.', 'O Ganga, Yamuna, Godavari, Saraswati, Narmada, Sindhu and Kaveri, be present in this water.'] },
    lalita_nama: { t: ['அம்பாள் நாமம்', 'Ambal name'], v: ['ஓம் ஶ்ரீ மாத்ரே நம: ||'], me: ['ஸ்ரீ அன்னைக்கு வணக்கம்.', 'Salutations to Sri Mata, the Divine Mother.'] },
    lingashtaka2: { t: ['லிங்காஷ்டகம் (5-8)', 'Lingashtakam (5-8)'], v: ['குங்குமசந்தன லேபித லிங்கம் பங்கஜஹார ஸுஶோபித லிங்கம் |', 'ஸஞ்சித பாபவிநாஶன லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||', 'தேவகணார்சித ஸேவித லிங்கம் பாவைர்பக்திபிரேவ ச லிங்கம் |', 'தினகரகோடி ப்ரபாகர லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||', 'அஷ்டதளோபரிவேஷ்டித லிங்கம் ஸர்வஸமுத்பவ காரண லிங்கம் |', 'அஷ்டதரித்ர வினாஶன லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||', 'ஸுரகுருஸுரவர பூஜித லிங்கம் ஸுரவனபுஷ்ப ஸதார்சித லிங்கம் |', 'பராத்பரம் பரமாத்மக லிங்கம் தத்ப்ரணமாமி ஸதாஶிவ லிங்கம் ||', 'லிங்காஷ்டகமிதம் புண்யம் ய: படேச்சிவஸந்நிதௌ |', 'ஶிவலோகமவாப்னோதி ஶிவேன ஸஹ மோததே ||'],
      me: ['குங்குமம் சந்தனம் பூசிய, பாவம் போக்கும், கோடி சூரிய ஒளியுடைய, வறுமை நீக்கும், பரம்பொருளான லிங்கத்தை வணங்குகிறேன். இதைச் சிவ சந்நிதியில் படிப்பவர் சிவலோகம் அடைவார்.', 'I bow to the lingam smeared with kumkum and sandal, destroyer of sins and poverty, bright as a crore of suns, the Supreme. One who reads this near Shiva reaches the realm of Shiva.'] },
    pancha1: { t: ['சிவ பஞ்சாக்ஷர ஸ்தோத்ரம் (1-3)', 'Shiva Panchakshara Stotram (1-3)'], v: ['நாகேந்த்ரஹாராய த்ரிலோசனாய பஸ்மாங்கராகாய மஹேஶ்வராய |', 'நித்யாய ஶுத்தாய திகம்பராய தஸ்மை நகாராய நம: ஶிவாய ||', 'மந்தாகினீ ஸலில சந்தன சர்சிதாய நந்தீஶ்வர ப்ரமதநாத மஹேஶ்வராய |', 'மந்தாரமுக்ய பஹுபுஷ்ப ஸுபூஜிதாய தஸ்மை மகாராய நம: ஶிவாய ||', 'ஶிவாய கௌரீவதனாப்ஜ ப்ருந்த ஸூர்யாய தக்ஷாத்வர நாஶகாய |', 'ஶ்ரீ நீலகண்டாய வ்ருஷத்வஜாய தஸ்மை ஶிகாராய நம: ஶிவாய ||'],
      me: ['பாம்பை மாலையாக அணிந்த, மூன்று கண்ணுடைய, திருநீறு பூசிய, தூய, திசைகளை ஆடையாகக் கொண்ட சிவனுக்கு ந, ம, ஶி என்ற எழுத்துகளால் வணக்கம்.', 'Salutations to Shiva - serpent-garlanded, three-eyed, smeared with sacred ash, pure and sky-clad - through the syllables Na, Ma and Shi.'] },
    pancha2: { t: ['சிவ பஞ்சாக்ஷர ஸ்தோத்ரம் (4-5)', 'Shiva Panchakshara Stotram (4-5)'], v: ['வஶிஷ்ட கும்போத்பவ கௌதமார்ய முனீந்த்ர தேவார்சித ஶேகராய |', 'சந்த்ரார்க வைஶ்வானர லோசனாய தஸ்மை வகாராய நம: ஶிவாய ||', 'யஜ்ஞ ஸ்வரூபாய ஜடாதராய பினாக ஹஸ்தாய ஸனாதனாய |', 'திவ்யாய தேவாய திகம்பராய தஸ்மை யகாராய நம: ஶிவாய ||', 'பஞ்சாக்ஷரமிதம் புண்யம் ய: படேச்சிவஸந்நிதௌ |', 'ஶிவலோகமவாப்னோதி ஶிவேன ஸஹ மோததே ||'],
      me: ['முனிவர்களும் தேவர்களும் வணங்கும், சந்திரன் சூரியன் அக்னியை கண்களாகக் கொண்ட, யாகத்தின் வடிவான சிவனுக்கு வ, ய என்ற எழுத்துகளால் வணக்கம். இந்த ஐந்தெழுத்துத் துதியைச் சிவ சந்நிதியில் படிப்பவர் சிவலோகம் அடைவார்.', 'Salutations to Shiva, worshipped by sages and gods, whose eyes are the moon, sun and fire, the form of sacrifice, through Va and Ya. One who reads this near Shiva reaches the realm of Shiva.'] },
    lakshmi_a1: { t: ['மகாலட்சுமி அஷ்டகம் (1-4)', 'Mahalakshmi Ashtakam (1-4)'], v: ['நமஸ்தேஸ்து மஹாமாயே ஶ்ரீபீடே ஸுரபூஜிதே |', 'ஶங்கசக்ரகதாஹஸ்தே மஹாலக்ஷ்மி நமோஸ்துதே ||', 'நமஸ்தே கருடாரூடே கோலாஸுரபயங்கரி |', 'ஸர்வபாபஹரே தேவி மஹாலக்ஷ்மி நமோஸ்துதே ||', 'ஸர்வஜ்ஞே ஸர்வவரதே ஸர்வதுஷ்டபயங்கரி |', 'ஸர்வது:கஹரே தேவி மஹாலக்ஷ்மி நமோஸ்துதே ||', 'ஸித்திபுத்திப்ரதே தேவி புக்திமுக்திப்ரதாயினி |', 'மந்த்ரமூர்தே ஸதா தேவி மஹாலக்ஷ்மி நமோஸ்துதே ||'],
      me: ['இந்திரன் இயற்றிய துதி. சங்கு சக்கரம் கதை ஏந்தியவளே, கருடன் மீது அமர்ந்தவளே, எல்லாம் அறிந்து வரம் தருபவளே, துன்பம் தீர்ப்பவளே, மகாலட்சுமியே, வணக்கம்.', 'Hymn by Indra. Salutations, Mahalakshmi: bearer of conch, discus and mace, rider of Garuda, all-knowing giver of boons, remover of all sorrow.'] },
    lakshmi_a2: { t: ['மகாலட்சுமி அஷ்டகம் (5-8)', 'Mahalakshmi Ashtakam (5-8)'], v: ['ஆத்யந்தரஹிதே தேவி ஆத்யஶக்தி மஹேஶ்வரி |', 'யோகஜே யோகஸம்பூதே மஹாலக்ஷ்மி நமோஸ்துதே ||', 'ஸ்தூலஸூக்ஷ்ம மஹாரௌத்ரே மஹாஶக்தி மஹோதரே |', 'மஹாபாபஹரே தேவி மஹாலக்ஷ்மி நமோஸ்துதே ||', 'பத்மாஸனஸ்திதே தேவி பரப்ரஹ்மஸ்வரூபிணி |', 'பரமேஶி ஜகன்மாத: மஹாலக்ஷ்மி நமோஸ்துதே ||', 'ஶ்வேதாம்பரதரே தேவி நானாலங்காரபூஷிதே |', 'ஜகத்ஸ்திதே ஜகன்மாத: மஹாலக்ஷ்மி நமோஸ்துதே ||', 'த்ரிகாலம் ய: படேந்நித்யம் மஹாஶத்ருவிநாஶனம் |', 'மஹாலக்ஷ்மீர்பவேந்நித்யம் ப்ரஸன்னா வரதா ஶுபா ||'],
      me: ['ஆதியும் அந்தமும் இல்லாதவளே, தாமரையில் அமர்ந்தவளே, வெண்ணாடை அணிந்தவளே, உலகத்தின் தாயே, மகாலட்சுமியே, வணக்கம். மூன்று வேளையும் படிப்பவருக்குத் தடைகள் நீங்கி, மகாலட்சுமி மகிழ்ந்து வரம் அருள்வாள்.', 'Salutations to Mahalakshmi, without beginning or end, seated on the lotus, in white garments, mother of the world. For one who reads it thrice daily, obstacles end and Lakshmi gladly grants boons.'] },
    sankata_stotra: { t: ['சங்கடநாசன கணேச ஸ்தோத்ரம்', 'Sankata Nashana Ganesha Stotram'], v: ['ப்ரணம்ய ஶிரஸா தேவம் கௌரீபுத்ரம் விநாயகம் |', 'பக்தாவாஸம் ஸ்மரேந்நித்யம் ஆயு:காமார்த்தஸித்தயே ||', 'ப்ரதமம் வக்ரதுண்டம் ச ஏகதந்தம் த்விதீயகம் |', 'த்ருதீயம் க்ருஷ்ணபிங்காக்ஷம் கஜவக்த்ரம் சதுர்த்தகம் ||', 'லம்போதரம் பஞ்சமம் ச ஷஷ்டம் விகடமேவ ச |', 'ஸப்தமம் விக்னராஜம் ச தூம்ரவர்ணம் ததாஷ்டமம் ||', 'நவமம் பாலசந்த்ரம் ச தஶமம் து விநாயகம் |', 'ஏகாதஶம் கணபதிம் த்வாதஶம் து கஜாநநம் ||', 'த்வாதஶைதானி நாமானி த்ரிஸந்த்யம் ய: படேந்நர: |', 'ந ச விக்னபயம் தஸ்ய ஸர்வஸித்திகரம் ப்ரபோ ||'],
      me: ['நாரத புராணத்தில் உள்ள துதி. கௌரியின் மகன் விநாயகரைத் தலை வணங்குகிறேன். வக்ரதுண்டர், ஏகதந்தர், கிருஷ்ணபிங்காக்ஷர், கஜவக்த்ரர், லம்போதரர், விகடர், விக்னராஜர், தூம்ரவர்ணர், பாலசந்திரர், விநாயகர், கணபதி, கஜானனர் - இந்தப் பன்னிரண்டு பெயர்களை மூன்று வேளை சொல்பவருக்குத் தடை பயம் இல்லை.', 'From the Narada Purana. I bow to Vinayaka, son of Gauri. These twelve names - Vakratunda, Ekadanta, Krishnapingaksha, Gajavaktra, Lambodara, Vikata, Vighnaraja, Dhumravarna, Bhalachandra, Vinayaka, Ganapati, Gajanana - said at dawn, noon and dusk free one from fear of obstacles.'] },
    appar: { t: ['திருநாவுக்கரசர் தேவாரம்', 'Appar Thevaram'], v: ['மாசில் வீணையும் மாலை மதியமும்', 'வீசு தென்றலும் வீங்கிள வேனிலும்', 'மூசு வண்டறை பொய்கையும் போன்றதே', 'ஈசன் எந்தை இணையடி நீழலே ||'],
      me: ['குற்றமற்ற வீணை இசை, மாலை நிலவு, வீசும் தென்றல், இளவேனில், வண்டு ஒலிக்கும் குளம் போல இனிது - ஈசனான என் தந்தையின் இரு திருவடி நிழல்.', 'Sweet as a faultless veena, evening moon, soft breeze, early spring and a bee-hummed pond is the shade of the feet of my Lord Shiva.'] },
    sambandar: { t: ['திருஞானசம்பந்தர் தேவாரம்', 'Sambandar Thevaram'], v: ['காதலாகிக் கசிந்து கண்ணீர்மல்கி', 'ஓதுவார்தமை நன்னெறிக் குய்ப்பது', 'வேதம் நான்கினும் மெய்ப்பொரு ளாவது', 'நாதன் நாமம் நமச்சி வாயவே ||'],
      me: ['அன்புடன் உருகிக் கண்ணீர் பெருகப் பாடுவோரை நல்வழியில் செலுத்துவது, நான்கு வேதங்களின் உண்மைப் பொருளானது, இறைவனின் திருநாமமான நமச்சிவாயவே.', 'The name Namah Shivaya leads those who chant it with melting love and tears to the good path; it is the true meaning of the four Vedas.'] },
    abirami: { t: ['அபிராமி அந்தாதி - காப்பு', 'Abirami Anthadhi - first verse'], v: ['உதிக்கின்ற செங்கதிர் உச்சித் திலகம் உணர்வுடையோர்', 'மதிக்கின்ற மாணிக்கம் மாதுளம் போது மலர்க்கமலை', 'துதிக்கின்ற மின்கொடி மென்கடிக் குங்கும தோயமென்ன', 'விதிக்கின்ற மேனி அபிராமி என்றன் விழுத்துணையே ||'],
      me: ['உதிக்கும் செங்கதிர், நெற்றித் திலகம், மாணிக்கம் போன்ற அழகிய மேனியுடைய அபிராமி அன்னையே என் சிறந்த துணை.', 'Mother Abirami, with a form bright as the rising sun and a ruby, is my greatest support.'] },
    kamban: { t: ['அனுமன் - கம்பராமாயணம்', 'Hanuman - Kamba Ramayanam'], v: ['அஞ்சிலே ஒன்று பெற்றான் அஞ்சிலே ஒன்றைத் தாவி', 'அஞ்சிலே ஒன்றா றாகத் தாயவ ளுக்காக ஏகி', 'அஞ்சிலே ஒன்று பெற்ற அணங்கைக்கண் டயலார் ஊரில்', 'அஞ்சிலே ஒன்றை வைத்தான் அவன்நம்மை அளித்துக் காப்பான் ||'],
      me: ['ஐம்பூதங்களில் ஒன்றான வாயுவின் மகன் அனுமன், கடலைத் தாண்டி சீதையைக் கண்டு, இலங்கையில் தீ வைத்தவன்; அவன் நம்மைக் காப்பான்.', 'Hanuman, son of the Wind, crossed the sea, found Sita and set Lanka afire; may he protect us.'] }
  };

  // ---------- reusable steps: [Tamil, English] ----------
  var S = {
    bathe: ['குளித்து, சுத்தமான ஆடை அணியவும்.', 'Bathe and wear clean clothes.'],
    clean: ['பூஜை இடத்தைச் சுத்தம் செய்து, கோலமிடவும்.', 'Clean the pooja place and draw a kolam.'],
    sit: ['கிழக்கு அல்லது வடக்கு நோக்கி அமரவும்.', 'Sit facing east or north.'],
    decorate: ['தெய்வப் படத்தை / விக்ரகத்தை மலர் மாலையால் அலங்கரித்து, குங்குமம், சந்தனம் இடவும்.', 'Decorate the picture or idol with a garland and apply kumkum and sandal.'],
    aarti: ['கற்பூர ஆரத்தி காட்டி, மணி அடித்து வணங்கவும்.', 'Show camphor aarti, ring the bell and pray.'],
    prasadam: ['பிரசாதத்தைக் குடும்பத்துடன் பகிர்ந்து உண்ணவும்.', 'Share the prasadam with the family.'],
    namaskar: ['தெய்வத்தை விழுந்து வணங்கி, குடும்ப நலனுக்காகப் பிரார்த்திக்கவும்.', 'Bow before the deity and pray for the family\'s well-being.'],
    lampoff: ['விளக்கை ஊதி அணைக்க வேண்டாம்; பூவினால் மெதுவாக அணைக்கவும் அல்லது தானாக அடங்க விடவும்.', 'Do not blow the lamp out; put it out gently with a flower or let it settle by itself.']
  };

  function J(m) { return m; } // readability helper

  // ---------- the 20 self-done poojas ----------
  // sam: item keys. steps: key of S, or [Tamil, English, mantraNumber?]. m: [mantraId, whenTa, whenEn, times]
  var POOJA = {
    'friday-home-pooja': {
      time: ['சுமார் 30 நிமிடம்', 'About 30 minutes'],
      sam: ['picture', 'lamp', 'oil', 'wicks', 'kumkum', 'turmeric', 'sandal', 'flowers', 'lotus', 'rice', 'kalasam', 'betel', 'tulsi', 'sweetpongal', 'milk', 'fruits', 'camphor', 'incense', 'bell'],
      steps: ['bathe', 'clean', 'decorate', ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['லட்சுமி தேவியை மனதில் தியானித்து, மலர், குங்குமம் சாத்தி வணங்கவும்.', 'Meditate on Goddess Lakshmi and offer flowers and kumkum.', 3], ['லட்சுமி துதியைக் கூறவும்.', 'Recite the Lakshmi prayer.', 4], ['108 போற்றியை (அஷ்டோத்தர சதநாமாவளி) கூறி, ஒவ்வொரு நாமத்துக்கும் குங்குமம் அல்லது மலர் இடவும்.', 'Chant the 108 names, offering kumkum or a flower with each name.', 5], ['பால் பாயசம் / சர்க்கரைப் பொங்கல் / கற்கண்டு நைவேத்தியம் படைக்கவும்.', 'Offer milk payasam, sweet pongal or kalkandu as naivedyam.'], 'aarti', 'namaskar'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['lakshmi_gayatri', 'தியானத்தின் போது', 'During meditation', '3'], ['lakshmi_stuti', 'பூஜையில்', 'During the pooja', '1'], ['lakshmi_nama', 'போற்றியின் போது', 'While chanting the names', '1']]
    },
    'tuesday-home-pooja': {
      time: ['சுமார் 30 நிமிடம்', 'About 30 minutes'],
      sam: ['vel', 'lamp', 'oil', 'wicks', 'kumkum', 'vibhuti', 'flowers', 'rice', 'kalasam', 'betel', 'sweetpongal', 'banana', 'camphor', 'incense', 'bell'],
      steps: ['bathe', 'clean', ['முருகப்பெருமான் படம் அல்லது வேலை அலங்கரித்து, செவ்வரளி போன்ற மலர் சாத்தவும்.', 'Decorate the Murugan picture or vel and offer red flowers such as arali.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['முருகனைத் தியானித்து, நாமத்தைக் கூறவும்.', 'Meditate on Murugan and chant his name.', 3], ['துர்க்கை துதியைக் கூறி வணங்கவும்.', 'Recite the Durga prayer and bow.', 4], ['சர்க்கரைப் பொங்கல் / பாயசம் / வாழைப்பழம் நைவேத்தியம் படைக்கவும்.', 'Offer sweet pongal, payasam or banana as naivedyam.'], 'aarti', 'namaskar'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['muruga_nama', 'முருகனுக்கு', 'For Murugan', '3'], ['durga', 'துர்க்கைக்கு', 'For Durga', '1']]
    },
    'nithya-pooja': {
      time: ['சுமார் 20 நிமிடம்', 'About 20 minutes'],
      sam: ['picture', 'lamp', 'oil', 'wicks', 'kumkum', 'vibhuti', 'flowers', 'fruits', 'camphor', 'incense', 'matches'],
      steps: ['bathe', 'clean', ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['பூஜைக்குப் புதிய நீர் அல்லது பாலை நைவேத்தியமாக வைக்கவும்.', 'Keep fresh water or milk as the daily offering.'], ['தெய்வப் படங்களுக்கு மலர், குங்குமம், விபூதி இடவும்.', 'Offer flowers, kumkum and vibhuti to the pictures of the deities.'], ['சூரிய துதியைக் கூறவும்.', 'Recite the Surya prayer.', 3], ['ஓம் நமசிவாய என்றும், ஓம் நமோ நாராயணாய என்றும் உங்கள் வழக்கப்படி கூறவும்.', 'Say Om Namah Shivaya and Om Namo Narayanaya, as your family does.', 4], ['நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer naivedyam and show aarti.'], 'namaskar', ['மாலை சுமார் 6 மணிக்கு மீண்டும் விளக்கேற்றி, 5 நிமிடம் வணங்கவும் (சந்தியா தீபம்).', 'Light the lamp again around 6 PM and pray for 5 minutes (sandhya deepam).']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['surya', 'காலையில்', 'In the morning', '1'], ['panchakshara', 'உங்கள் வழக்கப்படி', 'As your family follows', '1']]
    },
    'masa-sashti': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['vel', 'lamp', 'oil', 'wicks', 'kumkum', 'vibhuti', 'flowers', 'rice', 'kalasam', 'betel', 'sweetpongal', 'milk', 'fruits', 'camphor', 'incense'],
      steps: [['சஷ்டி அன்று காலை முதல் முடிந்தவரை உபவாசம் இருக்கவும்; பால், பழம் எடுக்கலாம்.', 'Fast from morning as far as you can; milk and fruit are fine.'], 'bathe', 'clean', ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['முருகப்பெருமானை வேல் / படத்தில் தியானித்து, செவ்வரளி மலர் சாத்தவும்.', 'Meditate on Murugan at the vel or picture and offer red arali flowers.', 3], ['முருகன் நாமம், ஷடாட்சர மந்திரம் கூறவும்.', 'Chant the Murugan name.', 3], ['கந்த சஷ்டி கவசத்தின் தொடக்கப் பகுதியைப் படிக்கவும்.', 'Read the opening of the Kanda Sashti Kavacham.', 4], ['பால் பாயசம் / சர்க்கரைப் பொங்கல் / தேன் தினை மாவு நைவேத்தியம் படைக்கவும்.', 'Offer milk payasam, sweet pongal or honey-millet flour.'], 'aarti', ['மாலை பூஜைக்குப் பின் எளிய உணவுடன் விரதம் முடிக்கவும்.', 'Break the fast with simple food after the evening pooja.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['muruga_nama', 'முருகனுக்கு', 'For Murugan', '3'], ['muruga_venba', 'கவசம்', 'Kavacham', '1']]
    },
    'amavasya-pitru': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['elderpic', 'lamp', 'oil', 'wicks', 'sesame', 'rice', 'darbha', 'kalasam', 'bananaleaf', 'betel', 'banana', 'fruits', 'camphor', 'incense', 'matches'],
      steps: ['bathe', ['பூஜை இடத்தைச் சுத்தம் செய்து, முன்னோர் படத்தை மாலை அணிவித்து வைக்கவும்.', 'Clean the place and set the photo of your ancestors with a garland.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் நீர் வைத்து, முன்னோரை நினைத்து உங்கள் குடும்ப வழக்கப்படி சங்கல்பம் செய்யவும்.', 'Keep a kalasam of water and make the resolve for your ancestors as your family custom.'], ['எள்ளும் நீரும் அளித்தல் (தர்ப்பணம்) உங்கள் குடும்ப வாத்தியார் அல்லது பெரியவர்கள் சொல்லும் முறைப்படி செய்யவும்.', 'Offer sesame and water (tarpanam) as your family priest or elders direct.'], ['வாழை இலையில் முன்னோருக்குப் பிடித்த எளிய சைவ உணவுகளைப் படையல் வைக்கவும்.', 'Serve simple vegetarian food your ancestors liked on a banana leaf.'], 'aarti', ['காகத்துக்கும் பசுவுக்கும் உணவு வைத்த பின் குடும்பத்தினர் உண்ணவும்; முடிந்தால் ஒருவருக்கு அன்னதானம்.', 'Feed a crow and a cow first, then the family eats; give food to a needy person if you can.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['narayana', 'நிறைவில்', 'At the end', '3']]
    },
    'guru-purnima': {
      time: ['சுமார் 40 நிமிடம்', 'About 40 minutes'],
      sam: ['gurupic', 'lamp', 'oil', 'wicks', 'sandal', 'kumkum', 'vibhuti', 'flowers', 'cloth', 'sundal', 'sweetpongal', 'fruits', 'betel', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['குரு படத்தை (தட்சிணாமூர்த்தி, வியாசர், ஆதிசங்கரர் அல்லது உங்கள் குரு) மஞ்சள் வஸ்திரம், மலர் மாலையால் அலங்கரிக்கவும்.', 'Decorate your guru picture (Dakshinamurthy, Vyasa, Adi Sankara or your own guru) with a yellow cloth and garland.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['குருவைத் தியானித்து, சந்தனம், குங்குமம், மஞ்சள் மலர் சாத்தவும்.', 'Meditate on the guru and offer sandal, kumkum and yellow flowers.'], ['குரு போற்றி (அஷ்டோத்தர சதநாமாவளி) கூறவும்.', 'Chant the guru\'s 108 names.'], ['கொண்டைக்கடலை சுண்டல், சர்க்கரைப் பொங்கல், பழம் நைவேத்தியம் படைக்கவும்.', 'Offer chickpea sundal, sweet pongal and fruit.'], 'aarti', ['உங்கள் ஆசிரியர்கள், பெரியவர்களை வணங்கி ஆசி பெறவும்.', 'Bow to your teachers and elders and take their blessings.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1']]
    },
    'maattu-pongal': {
      time: ['சுமார் 40 நிமிடம்', 'About 40 minutes'],
      sam: ['cowdecor', 'greens', 'pongalpot', 'rice', 'jaggery', 'cane', 'banana', 'coconut', 'flowers', 'kumkum', 'turmeric', 'lamp', 'oil', 'wicks', 'camphor', 'incense'],
      steps: ['bathe', ['பசுவையும் கன்றையும் நீராட்டி, கொம்புகளுக்கு வண்ணம் தீட்டி, மாலை, மணி அணிவிக்கவும் (வீட்டில் பசு இல்லையெனில் அருகிலுள்ள பசுவிடம் செல்லவும்).', 'Bathe the cow and calf, colour the horns and garland them with a bell (if you have no cow, go to one nearby).'], ['பசுவுக்கு மஞ்சள், குங்குமம் இடவும்.', 'Apply turmeric and kumkum to the cow.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['பொங்கல் வைத்து, "பொங்கலோ பொங்கல்" என்று கூறி மகிழவும்.', 'Cook the pongal and say "Pongalo Pongal" with joy.'], ['பசுவுக்கு அகத்திக்கீரை, வாழைப்பழம், பொங்கல் கொடுக்கவும்.', 'Feed the cow agathi keerai, banana and pongal.'], 'aarti', ['பசுவை வலம் வந்து வணங்கவும்; உழைக்கும் கால்நடைகளுக்கு நன்றி சொல்லவும்.', 'Walk around the cow and bow; thank all working animals.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1']]
    },
    'rama-navami': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['picture', 'lamp', 'oil', 'tulsi', 'flowers', 'garland', 'sandal', 'banana', 'fruits', 'panakam', 'neermor', 'betel', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['ராமர் - சீதை - லட்சுமணன் - அனுமன் படத்தை அலங்கரித்து, துளசி, மலர் மாலை சாத்தவும்.', 'Decorate the Rama-Sita-Lakshmana-Hanuman picture and offer tulsi and garland.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['ராம துதியைக் கூறவும்.', 'Recite the Rama prayer.', 3], ['"ஸ்ரீ ராம ராம ராமேதி" நாமத்தைக் கூறவும்.', 'Chant the Rama name verse.', 4], ['பானகம், நீர்மோர், பழம் நைவேத்தியம் படைக்கவும்.', 'Offer panakam, buttermilk and fruit.'], 'aarti', 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['rama_dhyana', 'ராமருக்கு', 'For Rama', '1'], ['rama_nama', 'நாமம் சொல்லும்போது', 'While chanting the name', '3']]
    },
    'hanuman-jayanthi': {
      time: ['சுமார் 40 நிமிடம்', 'About 40 minutes'],
      sam: ['picture', 'lamp', 'oil', 'vadamalai', 'garland', 'flowers', 'tulsi', 'butter', 'jaggery', 'banana', 'betel', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['அனுமன் படத்துக்கு மலர், துளசி, வெற்றிலை / வடை மாலை சாத்தவும்.', 'Offer flowers, tulsi and a betel-leaf or vada garland to the Hanuman picture.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['ராம நாமத்தைக் கூறவும்.', 'Chant the Rama name.', 3], ['அனுமன் துதியைக் கூறவும்.', 'Recite the Hanuman prayer.', 4], ['வடை, வெண்ணெய், வெல்லம் கலந்த அவல், பழம் நைவேத்தியம் படைக்கவும்.', 'Offer vada, butter, jaggery aval and fruit.'], 'aarti', 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['rama_nama', 'ராம நாமம்', 'Rama name', '3'], ['hanuman', 'அனுமனுக்கு', 'For Hanuman', '1']]
    },
    'avani-avittam': {
      time: ['சுமார் 60 நிமிடம்', 'About 60 minutes'],
      sam: ['poonool', 'picture', 'lamp', 'oil', 'wicks', 'sandal', 'kumkum', 'turmeric', 'flowers', 'rice', 'kalasam', 'darbha', 'coconut', 'sweets', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['உபாகர்மாவுக்கான சங்கல்பம், காமோகார்ஷீத் ஜபம், புதிய பூணூல் அணியும் முறைகள் உங்கள் சாகைக்கு ஏற்ப வாத்தியாருடன் சேர்ந்து செய்யவும்.', 'The upakarma sankalpam, kamokarsheet japam and wearing of the new poonool vary by your Veda shakha; do them with your priest.'], ['பழைய பூணூலை மாற்றிப் புதியதை அணிந்த பின் பெரியோர்களிடம் ஆசி பெறவும்.', 'After changing the old thread for the new one, take the blessings of elders.'], ['தேங்காய் பாயசம் / இனிப்பு நைவேத்தியம் படைக்கவும்.', 'Offer coconut payasam or a sweet as naivedyam.'], 'aarti', ['மறுநாள் காயத்ரி ஜபம்: உங்கள் வழக்கப்படி காயத்ரி ஜபத்தைக் குறிப்பிட்ட எண்ணிக்கையில் செய்யவும்.', 'Next day, Gayatri japam: do the Gayatri japam in your family\'s count.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1']]
    },
    'chitra-pournami': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['paper', 'pen', 'picture', 'lamp', 'oil', 'wicks', 'flowers', 'bilva', 'kumkum', 'sandal', 'rice', 'betel', 'sweetpongal', 'fruits', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['சித்ரகுப்தர் படத்தை (இல்லையெனில் ஒரு விளக்கை) அலங்கரிக்கவும்.', 'Decorate the Chitragupta picture (or a lamp if you have none).'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['புதிய வெள்ளைக் காகிதம், எழுதுகோல் இரண்டையும் படத்தின் முன் வைத்து, மலர் சாத்தி வணங்கவும்.', 'Place a fresh white paper and a pen before the picture and offer flowers.'], ['பஞ்சாக்ஷர மந்திரத்தை உங்கள் வழக்கப்படி கூறவும்.', 'Chant the Panchakshara mantra as your family does.', 3], ['பால் பாயசம் / சர்க்கரைப் பொங்கல் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer milk payasam or sweet pongal and show aarti.'], 'aarti', ['உப்பில்லாத உணவுடன் விரதம் இருப்பது வழக்கம்; முடிந்தவர்கள் கடைப்பிடிக்கலாம்.', 'Keeping a salt-free diet is a custom; follow it if you can.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['panchakshara', 'சிவனுக்கு', 'For Shiva', '1']]
    },
    'karadaiyan-nonbu': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['picture', 'lamp', 'oil', 'wicks', 'kumkum', 'turmeric', 'thread', 'flowers', 'bananaleaf', 'betel', 'banana', 'coconut', 'kadai', 'rawbutter', 'kalasam', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['காமாட்சி / கௌரி அம்மன் படத்தை அலங்கரித்து, வாழை இலையில் காரடை, வெண்ணெய், வெற்றிலை பாக்கு, பழம் வைக்கவும்.', 'Decorate the Kamakshi/Gauri picture and set karadai, butter, betel and fruit on a banana leaf.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['அம்மன் துதி (அம்பாள் நாமம்) கூறவும்.', 'Recite the Ambal name.', 3], ['அபிராமி துதியைக் கூறவும்.', 'Recite the Abirami verse.', 4], ['நோன்புச் சரடை அம்மனிடம் வைத்து வணங்கி, குடும்பப் பெரியவர் உதவியுடன் கட்டிக்கொள்ளவும்.', 'Place the nonbu thread before the Goddess, pray, and tie it with an elder\'s help.'], 'aarti', ['சுமங்கலிகளுக்குத் தாம்பூலம் கொடுத்து ஆசி பெறவும்.', 'Give thaamboolam to married women and take their blessings.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['lalita_nama', 'அம்மனுக்கு', 'For the Goddess', '3'], ['abirami', 'நிறைவில்', 'At the end', '1']]
    },
    'thai-poosam': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['vel', 'lamp', 'oil', 'wicks', 'kumkum', 'vibhuti', 'flowers', 'milk', 'sweetpongal', 'banana', 'fruits', 'rice', 'betel', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['முருகன் படம் அல்லது வேலை மலர் மாலையால் அலங்கரிக்கவும்.', 'Decorate the Murugan picture or vel with a garland.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['முருகனைத் தியானித்து, முருகன் நாமத்தைக் கூறவும்.', 'Meditate on Murugan and chant his name.', 3], ['கந்த சஷ்டி கவசத்தின் தொடக்கத்தைப் படிக்கவும்.', 'Read the opening of the Kanda Sashti Kavacham.', 4], ['பசும்பால் (பால் காவடி), சர்க்கரைப் பொங்கல், பழம் நைவேத்தியம் படைக்கவும்.', 'Offer cow\'s milk (paal kavadi), sweet pongal and fruit.'], 'aarti', 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['muruga_nama', 'முருகனுக்கு', 'For Murugan', '3'], ['muruga_venba', 'கவசம்', 'Kavacham', '1']]
    },
    'panguni-uthiram': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['picture', 'lamp', 'oil', 'wicks', 'kumkum', 'turmeric', 'thread', 'flowers', 'garland', 'rice', 'betel', 'banana', 'sweetpongal', 'milk', 'fruits', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['சிவன்-பார்வதி (அல்லது முருகன்-தெய்வானை) திருமணக் கோலப் படத்தை மாலையால் அலங்கரிக்கவும்.', 'Decorate the wedding picture of Shiva-Parvati (or Murugan-Deivanai) with a garland.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['உமா மகேஸ்வர நாமத்தைக் கூறவும்.', 'Chant the Uma-Maheshwara name.', 3], ['முருகன் நாமத்தைக் கூறவும்.', 'Chant the Murugan name.', 4], ['பால் பாயசம், சர்க்கரைப் பொங்கல், பழம் நைவேத்தியம் படைக்கவும்.', 'Offer milk payasam, sweet pongal and fruit.'], 'aarti', ['சுமங்கலிகளுக்குத் தாம்பூலம் கொடுத்து ஆசி பெறவும்.', 'Give thaamboolam to married women and take their blessings.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['uma', 'சிவ பார்வதிக்கு', 'For Shiva-Parvati', '3'], ['muruga_nama', 'முருகனுக்கு', 'For Murugan', '3']]
    },
    'deepavali-kubera': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['kuberakolam', 'picture', 'lamp', 'agal', 'oil', 'wicks', 'coins', 'lotus', 'flowers', 'kumkum', 'turmeric', 'rice', 'kalasam', 'betel', 'sweets', 'sweetpongal', 'fruits', 'camphor', 'incense'],
      steps: ['clean', ['பூஜை பீடத்தில் அரிசி மாவால் குபேர கோலம் வரைந்து, மகாலட்சுமி, குபேரர், கணபதி படங்களை வைக்கவும்.', 'Draw the Kubera kolam with rice flour on the pooja seat and place the pictures of Mahalakshmi, Kubera and Ganapathy.'], ['நாணயங்கள் / பணத்தை சுத்தம் செய்து தட்டில் வைக்கவும்; வீடு முழுவதும் அகல் விளக்குகள் ஏற்றவும்.', 'Clean the coins or notes and keep them on a plate; light agal lamps around the home.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['கலசத்தில் / செம்பில் நீர் வைத்து, இந்தப் பூஜையை ஏன் செய்கிறோம் என்று மனதார வேண்டிக்கொள்ளவும் (சங்கல்பம்).', 'Keep a kalasam or pot of water and make a simple resolve (sankalpam) for why you do this pooja.'], ['மகாலட்சுமியைத் தியானித்து, தாமரை மலர் சாத்தவும்.', 'Meditate on Mahalakshmi and offer a lotus flower.', 3], ['லட்சுமி நாமம், துதியைக் கூறவும்.', 'Chant the Lakshmi names and prayer.', 4], ['பால் பாயசம், சர்க்கரைப் பொங்கல், இனிப்பு, பழம் நைவேத்தியம் படைக்கவும்.', 'Offer milk payasam, sweet pongal, sweets and fruit.'], 'aarti', 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['lakshmi_gayatri', 'தியானத்தின் போது', 'During meditation', '3'], ['lakshmi_nama', 'போற்றியின் போது', 'While chanting the names', '1'], ['lakshmi_stuti', 'பூஜையில்', 'During the pooja', '1']]
    },
    'margazhi-thiruppavai': {
      time: ['சுமார் 30 நிமிடம் (தினமும்)', 'About 30 minutes (daily)'],
      sam: ['picture', 'lamp', 'oil', 'wicks', 'kolam', 'flowers', 'tulsi', 'kumkum', 'rice', 'sweetpongal', 'banana', 'camphor', 'incense'],
      steps: [['அதிகாலை எழுந்து நீராடி, வாசலில் கோலமிடவும்.', 'Wake early, bathe and draw a kolam at the doorstep.'], 'clean', ['ஆண்டாள் / ரங்கநாதர் படத்தை மலர், துளசியால் அலங்கரிக்கவும்.', 'Decorate the Andal/Ranganatha picture with flowers and tulsi.'], ['விளக்கேற்றி, விநாயகரை வணங்கவும்; குரு, குலதெய்வத்தை மனதில் நினைக்கவும்.', 'Light the lamp and pray to Ganesha; remember your guru and kula deivam.', 2], ['அன்றைய நாளுக்கான திருப்பாவை பாசுரத்தைப் பாடவும் (30 நாள் முறை); முதல் பாசுரம் இங்கே உள்ளது.', 'Sing that day\'s Tiruppavai verse (30-day order); the first verse is given here.', 3], ['நாராயண நாமம் கூறவும்.', 'Chant the Narayana name.', 4], ['திருவெம்பாவை / சிவபுராணம் சிவ வழிபாட்டாளர்கள் படிக்கலாம்.', 'Shiva devotees may read Tiruvempavai or Sivapuranam.', 5], ['சர்க்கரைப் பொங்கல் / வாழைப்பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer sweet pongal or banana and show aarti.'], 'aarti', 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['tiruppavai', 'முதல் பாசுரம்', 'First verse', '1'], ['narayana', 'நாமம்', 'Name', '3'], ['sivapuranam', 'சிவ வழிபாடு', 'For Shiva worship', '1']]
    },
    'sankatahara-chaturthi': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['vinayagar', 'lamp', 'oil', 'wicks', 'durva', 'flowers', 'kumkum', 'turmeric', 'modak', 'fruits', 'coconut', 'camphor', 'incense'],
      steps: [['பகல் முழுவதும் முடிந்தவர்கள் உபவாசம் இருக்கவும்; மாலையில் குளிக்கவும்.', 'Fast during the day if you can; bathe in the evening.'], 'clean', 'sit',
        ['விளக்கேற்றவும்.', 'Light the lamp.', 2], ['விநாயகரை அலங்கரித்து, அருகம்புல், மலர் சாத்தவும்.', 'Decorate Ganesha and offer durva grass and flowers.', 1],
        ['மந்திரங்களைக் கூறி, 21 முறை "ஓம் கணேசாய நம:" சொல்லவும்.', 'Chant the mantras and say "Om Ganeshaya Namah" 21 times.', 3],
        ['கொழுக்கட்டை, பழம், தேங்காய் நைவேத்தியம் படைக்கவும்.', 'Offer kozhukattai, fruit and coconut as naivedyam.'], 'aarti',
        ['சந்திரன் உதித்ததும் அதைப் பார்த்து வணங்கிய பின் விரதம் முடிக்கவும்.', 'Break the fast only after seeing and bowing to the moon.'], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['ganesha_gayatri', 'அர்ச்சனையின் போது', 'During offerings', '21'], ['sankata', 'ஆரத்திக்கு முன்', 'Before aarti', '1'], ['avvai', 'நிறைவில்', 'At the end', '1']]
    },
    'pradosham': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['sivalingam', 'milk', 'curd', 'honey', 'tender', 'bilva', 'flowers', 'vibhuti', 'sandal', 'lamp', 'oil', 'rice', 'jaggery', 'fruits', 'camphor', 'incense'],
      steps: [['பகலில் முடிந்தவர்கள் உபவாசம் இருக்கவும்; மாலை 4:30–6:00 பிரதோஷ வேளைக்கு முன் குளிக்கவும்.', 'Fast during the day if you can; bathe before the pradosham time of 4:30–6:00 pm.'], 'clean', 'sit',
        ['விநாயகரை வணங்கி, நெய் விளக்கு ஏற்றவும்.', 'Pray to Ganesha and light a ghee lamp.', 1],
        ['சிவனுக்குப் பால், தயிர், தேன், இளநீரால் அபிஷேகம் செய்து "ஓம் நம: சிவாய" சொல்லவும்.', 'Perform abhishekam with milk, curd, honey and tender coconut while chanting "Om Namah Shivaya".', 2],
        ['விபூதி, சந்தனம் இட்டு, வில்வம், மலர் சாத்தவும்.', 'Apply vibhuti and sandal; offer bilva leaves and flowers.'],
        ['மிருத்யுஞ்சய மந்திரத்தைக் கூறவும்.', 'Chant the Mrityunjaya mantra.', 3], ['நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்; சிவபுராணம் பாடவும்.', 'Offer naivedyam, show aarti and sing the Sivapuranam.', 4], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['panchakshara', 'அபிஷேகத்தின் போது', 'During abhishekam', '108'], ['mrityunjaya', 'பூஜையின் நடுவில்', 'Mid-pooja', '9 / 27'], ['sivapuranam', 'நிறைவில்', 'At the end', '1']]
    },
    'pournami-satyanarayana': {
      time: ['சுமார் 1 மணி நேரம்', 'About 1 hour'],
      sam: ['picture', 'kalasam', 'mango', 'coconut', 'lamp', 'oil', 'tulsi', 'flowers', 'garland', 'banana', 'sweetpongal', 'betel', 'kumkum', 'camphor', 'incense'],
      steps: [['பௌர்ணமி அன்று காலையில் குளித்து, முடிந்தவர்கள் உபவாசம் இருக்கவும்.', 'On Pournami morning, bathe and fast if you can.'], 'clean', 'sit',
        ['கலசம் வைத்து மாவிலை, தேங்காய் அமைக்கவும்; பெருமாள் படத்தை அலங்கரிக்கவும்.', 'Set up the kalasam with mango leaves and coconut; decorate the Perumal picture.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['துளசி, மலர் சாத்தி விஷ்ணு மந்திரங்களைக் கூறவும்.', 'Offer tulsi and flowers and chant the Vishnu mantras.', 2],
        ['சத்யநாராயண பூஜை கதையைப் படிக்கவும் அல்லது கேட்கவும்.', 'Read or listen to the Satyanarayana katha.'],
        ['சர்க்கரைப் பொங்கல், பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer sweet pongal and fruit; show aarti.', 4], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['vishnu_shanta', 'தியானத்தின் போது', 'During meditation', '1'], ['vishnu_gayatri', 'அர்ச்சனையின் போது', 'During offerings', '3'], ['narayana', 'ஆரத்தியின் போது', 'During aarti', '108']]
    },
    'krithigai': {
      time: ['சுமார் 40 நிமிடம்', 'About 40 minutes'],
      sam: ['vel', 'lamp', 'oil', 'wicks', 'flowers', 'vibhuti', 'sandal', 'fruits', 'panchamritham', 'sweets', 'camphor', 'incense'],
      steps: [['காலையில் குளித்து, முடிந்தவர்கள் விரதம் இருக்கவும்.', 'Bathe in the morning and keep the vratam if you can.'], 'clean', 'sit',
        ['முருகன் படம் / வேலுக்கு விபூதி, சந்தனம் இட்டு மலர் சாத்தவும்.', 'Apply vibhuti and sandal to the Murugan picture or vel and offer flowers.'],
        ['நெய் விளக்கு ஏற்றி, விநாயகரை வணங்கவும்.', 'Light a ghee lamp and pray to Ganesha.', 1],
        ['கந்த சஷ்டி கவசத் தொடக்கத்தையும் முருகன் நாமத்தையும் கூறவும்.', 'Recite the Kanda Sashti Kavacham opening and the Murugan name.', 2],
        ['பஞ்சாமிர்தம், பழம் படைத்து ஆரத்தி காட்டவும்.', 'Offer panchamritham and fruit; show aarti.'], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['muruga_venba', 'விளக்கேற்றிய பின்', 'After lighting the lamp', '1'], ['muruga_nama', 'அர்ச்சனையின் போது', 'During offerings', '108']]
    },
    'ekadashi': {
      time: ['சுமார் 40 நிமிடம்', 'About 40 minutes'],
      sam: ['picture', 'lamp', 'oil', 'tulsi', 'flowers', 'banana', 'fruits', 'milk', 'sandal', 'camphor', 'incense'],
      steps: [['ஏகாதசி அன்று உபவாசம் இருக்கவும் (அரிசி உணவைத் தவிர்க்கவும்).', 'Fast on Ekadashi (avoid rice).'], 'bathe', 'clean',
        ['விளக்கேற்றி, பெருமாள் படத்தை அலங்கரிக்கவும்.', 'Light the lamp and decorate the Perumal picture.', 1], ['துளசி, மலர் சாத்தி விஷ்ணு மந்திரங்களைக் கூறவும்.', 'Offer tulsi and flowers and chant the Vishnu mantras.', 2],
        ['பழம், பால் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer fruit and milk; show aarti.'],
        ['இரவில் விழித்திருந்து நாமம் சொல்வது சிறப்பு. மறுநாள் துவாதசி காலையில் உணவு உண்டு விரதம் முடிக்கவும்.', 'Staying awake chanting the name at night is auspicious. Break the fast on Dwadashi morning.']],
      m: [['vishnu_shanta', 'ஆரம்பத்தில்', 'At the start', '1'], ['vishnu_gayatri', 'அர்ச்சனையின் போது', 'During offerings', '3'], ['narayana', 'நாமம் சொல்லும்போது', 'While chanting the name', '108']]
    },
    'thiruvilakku-pooja': {
      time: ['சுமார் 30 நிமிடம்', 'About 30 minutes'],
      sam: ['lamp', 'oil', 'wicks', 'kumkum', 'turmeric', 'sandal', 'lotus', 'betel', 'fruits', 'coconut', 'sweetpongal', 'camphor', 'incense', 'matches'],
      steps: ['bathe', 'clean', ['குத்துவிளக்கைக் கழுவி, குங்குமம்-மஞ்சள் இட்டு, பூ சாத்தவும். ஐந்து முகங்களுக்கும் எண்ணெய் ஊற்றித் திரி போடவும்.', 'Wash the lamp, apply kumkum and turmeric and add flowers. Pour oil and place a wick in each of the five faces.'],
        ['முதலில் விநாயகரை வணங்கவும்.', 'First pray to Ganesha.', 1], ['கிழக்கு நோக்கி அமர்ந்து விளக்கை ஏற்றவும்.', 'Sit facing east and light the lamp.', 2],
        ['லட்சுமியைப் பிரார்த்தித்து, மலர் தூவவும்.', 'Pray to Lakshmi and offer flowers.', 3], ['நைவேத்தியம் படைத்து, கற்பூர ஆரத்தி காட்டவும்.', 'Offer naivedyam and show camphor aarti.', 4], 'lampoff'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['lakshmi_gayatri', 'மலர் தூவும்போது', 'While offering flowers', '3'], ['mangala', 'ஆரத்தியின் போது', 'During aarti', '1']]
    },
    'weekly-home-pooja': {
      time: ['சுமார் 20 நிமிடம்', 'About 20 minutes'],
      sam: ['picture', 'lamp', 'oil', 'wicks', 'kumkum', 'turmeric', 'flowers', 'fruits', 'camphor', 'incense'],
      steps: ['bathe', ['வெள்ளிக்கிழமை லட்சுமி / அம்மன்; செவ்வாய்க்கிழமை முருகன் / துர்க்கை - அன்றைய தெய்வத்தை அலங்கரிக்கவும்.', 'Friday: Lakshmi / Amman. Tuesday: Murugan / Durga. Decorate that day\'s deity.'], 'clean',
        ['விளக்கேற்றி விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['மலர், குங்குமம் சாத்தி மந்திரங்களைக் கூறவும் (வெள்ளி: 3, செவ்வாய்: 4).', 'Offer flowers and kumkum and chant (Friday: mantra 3, Tuesday: mantra 4).', 3],
        ['பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer fruit and show aarti.'], 'namaskar'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['lakshmi_stuti', 'வெள்ளிக்கிழமை', 'On Friday', '1'], ['muruga_nama', 'செவ்வாய்க்கிழமை', 'On Tuesday', '108']]
    },
    'varalakshmi-vratam': {
      time: ['சுமார் 1½ மணி நேரம்', 'About 1½ hours'],
      sam: ['kalasam', 'mango', 'coconut', 'picture', 'thread', 'garland', 'lotus', 'lamp', 'oil', 'sweetpongal', 'modak', 'fruits', 'betel', 'bangles', 'blouse', 'kumkum', 'camphor', 'incense'],
      steps: [['முந்தைய நாள் வீட்டைச் சுத்தம் செய்து, வாசலில் கோலமிடவும்.', 'The day before, clean the house and draw a kolam at the door.'],
        ['விரத நாளில் குளித்து, பட்டுப்புடவை / சுத்தமான ஆடை அணியவும்.', 'On the day, bathe and wear a silk saree or clean clothes.'],
        ['கலசத்தில் அரிசி, நீர் நிரப்பி, மாவிலை, தேங்காய் வைத்து, அம்மனை அலங்கரிக்கவும்.', 'Fill the kalasam with rice and water, add mango leaves and coconut, and decorate Amman.'],
        ['விநாயகரை வணங்கி விளக்கேற்றவும்.', 'Pray to Ganesha and light the lamp.', 1], ['கலசத்தில் லட்சுமியை எழுந்தருளச் செய்து வணங்கவும்.', 'Invite Lakshmi into the kalasam and worship.', 2],
        ['நோன்புச் சரடை அம்மன் முன் வைத்து, வலக்கையில் கட்டிக்கொள்ளவும்.', 'Place the nombu saradu before Amman and tie it on the right wrist.', 3],
        ['நைவேத்தியம் படைத்து, ஆரத்தி காட்டவும்.', 'Offer naivedyam and show aarti.', 4], ['சுமங்கலிகளுக்குத் தாம்பூலம் கொடுத்து ஆசி பெறவும்.', 'Give thaamboolam to married women and take their blessings.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['lakshmi_stuti', 'கலசத்தில் அழைக்கும்போது', 'While invoking Lakshmi', '1'], ['varalakshmi_nama', 'சரடு கட்டும்போது', 'While tying the thread', '9'], ['mangala', 'ஆரத்தியின் போது', 'During aarti', '1']]
    },
    'vinayagar-chaturthi': {
      time: ['சுமார் 1 மணி நேரம்', 'About 1 hour'],
      sam: ['vinayagar', 'kolam', 'durva', 'lotus', 'garland', 'lamp', 'oil', 'kumkum', 'sandal', 'modak', 'sundal', 'fruits', 'coconut', 'betel', 'camphor', 'incense'],
      steps: [['காலையில் குளித்து, வீட்டைச் சுத்தம் செய்யவும்; களிமண் விநாயகரை வாங்கி வைக்கவும்.', 'Bathe in the morning, clean the house and bring home the clay Ganesha.'], 'clean',
        ['இலை மீது அரிசி பரப்பி, அதன் மேல் விநாயகரை வைத்து அலங்கரிக்கவும்.', 'Spread rice on a leaf, place Ganesha on it and decorate.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray.', 2], ['அருகம்புல், மலர் சாத்தி மந்திரங்களைக் கூறவும்.', 'Offer durva grass and flowers while chanting.', 1],
        ['கொழுக்கட்டை, சுண்டல், பழம் நைவேத்தியம் படைக்கவும்.', 'Offer kozhukattai, sundal and fruit.'], ['ஆரத்தி காட்டி, ஔவையார் துதியைப் பாடவும்.', 'Show aarti and sing Avvaiyar\'s prayer.', 5], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['ganesha_gayatri', 'அர்ச்சனையின் போது', 'During offerings', '21'], ['vakratunda', 'நைவேத்தியத்திற்கு முன்', 'Before naivedyam', '1'], ['avvai', 'ஆரத்தியின் போது', 'During aarti', '1']]
    },
    'navaratri-golu-ayudha-pooja': {
      time: ['சுமார் 1 மணி நேரம் (தினமும் 20 நிமிடம்)', 'About 1 hour (20 minutes daily)'],
      sam: ['picture', 'books', 'kalasam', 'mango', 'lamp', 'oil', 'flowers', 'kumkum', 'turmeric', 'sandal', 'sundal', 'fruits', 'betel', 'camphor', 'incense'],
      steps: [['கொலு படிகளைச் சுத்தம் செய்து, பொம்மைகளை வரிசையாக அடுக்கவும்.', 'Clean the golu steps and arrange the dolls in order.'], 'clean',
        ['சரஸ்வதி பூஜை / ஆயுத பூஜை அன்று புத்தகங்கள், கருவிகளைச் சுத்தம் செய்து குங்குமம், சந்தனம் இடவும்.', 'On Saraswati / Ayudha Pooja, clean books and tools and apply kumkum and sandal.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['சரஸ்வதியைத் தியானித்து, புத்தகங்களின் முன் மலர் தூவவும்.', 'Meditate on Saraswati and offer flowers before the books.', 2],
        ['தேவி துதி கூறி, சுண்டல் நைவேத்தியம் படைக்கவும்.', 'Chant the Devi prayer and offer sundal.', 4], ['ஆரத்தி காட்டி, தாம்பூலம் வழங்கவும்.', 'Show aarti and give thaamboolam.'],
        ['விஜயதசமி அன்று குழந்தைகளுக்குக் கல்வி தொடங்க (வித்யாரம்பம்) நல்ல நாள்.', 'Vijayadasami is an auspicious day to begin a child\'s learning (Vidyarambham).']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['saraswati1', 'புத்தகங்களுக்கு முன்', 'Before the books', '1'], ['saraswati2', 'தியானத்தின் போது', 'During meditation', '1'], ['durga', 'நிறைவில்', 'At the end', '3'], ['lakshmi_stuti', 'ஆரத்தியின் போது', 'During aarti', '1']]
    },
    'karthigai-deepam': {
      time: ['சுமார் 30 நிமிடம்', 'About 30 minutes'],
      sam: ['agal', 'oil', 'wicks', 'kolam', 'flowers', 'sundal', 'sweets', 'fruits', 'vibhuti', 'camphor', 'incense', 'matches'],
      steps: [['மாலை நேரத்திற்கு முன் வீட்டைச் சுத்தம் செய்து, வாசலில் கோலமிடவும்.', 'Before evening, clean the house and draw a kolam at the entrance.'], 'bathe',
        ['அகல் விளக்குகளில் நல்லெண்ணெய் ஊற்றித் திரி போடவும்.', 'Fill the agal lamps with oil and place wicks.'],
        ['பூஜை அறையில் முதல் விளக்கை ஏற்றி, விநாயகரை வணங்கவும்.', 'Light the first lamp in the pooja room and pray to Ganesha.', 2],
        ['வீட்டின் வாசல், மாடம், முற்றம், பூஜை அறை ஆகிய இடங்களில் வரிசையாக விளக்குகளை ஏற்றவும்.', 'Light lamps in a row at the door, niches, courtyard and pooja room.'],
        ['சிவ, முருக மந்திரங்களைக் கூறி, "அண்ணாமலைக்கு அரோகரா" என்று வணங்கவும்.', 'Chant the Shiva and Murugan mantras and bow with "Annamalaiku Arohara".', 3],
        ['பொரி, அவல், பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer pori, aval and fruit; show aarti.'], 'lampoff'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'ஒவ்வொரு விளக்கு ஏற்றும்போது', 'With each lamp', '1'], ['sivapuranam', 'விளக்கேற்றிய பின்', 'After lighting', '1'], ['panchakshara', 'நிறைவில்', 'At the end', '108'], ['muruga_nama', 'நிறைவில்', 'At the end', '27']]
    },
    'maha-shivaratri': {
      time: ['இரவு முழுவதும் (நான்கு ஜாமம்)', 'All night (four prahars)'],
      sam: ['sivalingam', 'milk', 'curd', 'honey', 'tender', 'bilva', 'flowers', 'vibhuti', 'sandal', 'lamp', 'oil', 'fruits', 'rice', 'camphor', 'incense'],
      steps: [['சிவராத்திரி அன்று பகல் முழுவதும் உபவாசம் இருக்கவும்.', 'Fast through the day of Shivaratri.'], 'bathe', 'clean',
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1],
        ['நான்கு ஜாமங்களிலும் (இரவு 6, 9, 12, காலை 3 மணி) பால், தயிர், தேன், இளநீரால் சிவனுக்கு அபிஷேகம் செய்யவும்.', 'Perform abhishekam in each of the four prahars (about 6, 9, 12 and 3 am) with milk, curd, honey and tender coconut.', 2],
        ['வில்வ இலை சாத்தி, விபூதி, சந்தனம் இடவும்.', 'Offer bilva leaves; apply vibhuti and sandal.'], ['லிங்காஷ்டகம், மிருத்யுஞ்சய மந்திரம் கூறவும்.', 'Recite the Lingashtakam and Mrityunjaya mantra.', 3],
        ['இரவு விழித்திருந்து சிவ நாமம் கூறவும்; காலையில் பிரசாதம் உண்டு விரதம் முடிக்கவும்.', 'Stay awake chanting Shiva\'s name; break the fast with prasadam in the morning.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['panchakshara', 'அபிஷேகத்தின் போது', 'During abhishekam', '108'], ['lingashtaka', 'ஒவ்வொரு ஜாமத்திலும்', 'In each prahar', '1'], ['mrityunjaya', 'ஒவ்வொரு ஜாமத்திலும்', 'In each prahar', '9'], ['sivapuranam', 'நிறைவில்', 'At the end', '1']]
    },
    'vaikunta-ekadashi': {
      time: ['சுமார் 45 நிமிடம் (இரவு விழிப்பு)', 'About 45 minutes (plus night vigil)'],
      sam: ['picture', 'lamp', 'oil', 'tulsi', 'garland', 'flowers', 'banana', 'fruits', 'sweetpongal', 'sandal', 'camphor', 'incense'],
      steps: [['ஏகாதசி அன்று உபவாசம் இருக்கவும்.', 'Fast on Ekadashi.'], 'bathe', 'clean',
        ['விளக்கேற்றி, பெருமாள் படத்தை துளசி மாலையால் அலங்கரிக்கவும்.', 'Light the lamp and decorate the Perumal picture with a tulsi garland.', 1],
        ['விஷ்ணு தியானம், காயத்ரி, "ஓம் நமோ நாராயணாய" கூறவும்.', 'Recite the Vishnu meditation, Gayatri and "Om Namo Narayanaya".', 2],
        ['திருப்பாவை முதல் பாசுரத்தைப் பாடவும்.', 'Sing the first verse of the Tiruppavai.', 4], ['நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer naivedyam and show aarti.'],
        ['இரவு விழித்திருந்து நாமம் சொல்லவும்; மறுநாள் காலை உணவு உண்டு விரதம் முடிக்கவும்.', 'Stay awake chanting the name; break the fast the next morning.']],
      m: [['vishnu_shanta', 'ஆரம்பத்தில்', 'At the start', '1'], ['vishnu_gayatri', 'அர்ச்சனையின் போது', 'During offerings', '3'], ['narayana', 'நாமம் சொல்லும்போது', 'While chanting the name', '108'], ['tiruppavai', 'பாடல்', 'Song', '1']]
    },
    'thai-pongal': {
      time: ['சுமார் 1½ மணி நேரம்', 'About 1½ hours'],
      sam: ['pongalpot', 'rice', 'dal', 'jaggery', 'milk', 'oil', 'cane', 'turmericplant', 'banana', 'mango', 'kolam', 'flowers', 'kumkum', 'turmeric', 'betel', 'camphor', 'incense'],
      steps: [['விடியற்காலையில் குளித்து, வாசலில் பெரிய கோலமிடவும்.', 'Bathe at dawn and draw a big kolam at the door.'],
        ['புதுப் பானையில் மஞ்சள் கொத்து கட்டி, வெளியில் சூரிய ஒளி படும் இடத்தில் அடுப்பு வைக்கவும்.', 'Tie a turmeric bunch around the new pot and set the stove outside where sunlight falls.'],
        ['பானையில் பால் ஊற்றிக் காய்ச்சவும்; பொங்கி வழியும்போது "பொங்கலோ பொங்கல்!" என்று குரல் எழுப்பவும்.', 'Boil milk in the pot; when it overflows, shout "Pongalo Pongal!".'],
        ['அரிசி, பாசிப்பருப்பு, வெல்லம் சேர்த்து சர்க்கரைப் பொங்கல் செய்யவும்.', 'Add rice, moong dal and jaggery to make sweet pongal.'],
        ['சூரியனுக்குக் கரும்பு, வாழைப்பழத்துடன் பொங்கல் படைக்கவும்.', 'Offer the pongal to the Sun with sugarcane and bananas.', 1], ['சூரிய மந்திரங்களைக் கூறி வணங்கவும்.', 'Bow to the Sun and chant the Surya mantras.', 2],
        ['மாட்டுப் பொங்கல்: பசுக்களுக்கு மஞ்சள், குங்குமம் இட்டு, பழம், பொங்கல் கொடுக்கவும்.', 'Mattu Pongal: apply turmeric and kumkum to the cows and feed them fruit and pongal.'], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['surya', 'சூரியனுக்குப் படைக்கும்போது', 'While offering to the Sun', '1'], ['surya_gayatri', 'வணங்கும்போது', 'While bowing', '3']]
    },
    'tamil-puthandu': {
      time: ['சுமார் 30 நிமிடம்', 'About 30 minutes'],
      sam: ['kolam', 'mango', 'picture', 'lamp', 'oil', 'flowers', 'fruits', 'rawmango', 'neem', 'jaggery', 'banana', 'betel', 'cloth', 'camphor', 'incense'],
      steps: [['முந்தைய நாள் வீட்டைச் சுத்தம் செய்து, வாசலில் மாவிலைத் தோரணம் கட்டவும்.', 'The day before, clean the house and hang a mango-leaf toran at the door.'],
        ['புத்தாண்டு காலையில் குளித்து, புதிய ஆடை அணியவும்.', 'On New Year morning, bathe and wear new clothes.'],
        ['கனிகள், பூ, வெற்றிலை பாக்குடன் "கனி காணுதல்" - கண்ணாடியில் பழங்களைக் காணவும்.', 'Do "kani kaanuthal": see the fruits, flowers and betel arranged before a mirror.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['குலதெய்வம், இஷ்ட தெய்வத்தை வணங்கி மலர் சாத்தவும்.', 'Worship your kula deivam and chosen deity with flowers.', 2],
        ['மாங்காய் பச்சடி, வேப்பம்பூ, வெல்லம் சேர்த்த உணவு நைவேத்தியம் படைக்கவும் (இனிப்பும் கசப்பும் வாழ்வின் சுவை).', 'Offer food with mango pachadi, neem flower and jaggery (sweet and bitter are the flavours of life).'],
        ['பெரியோர்களிடம் ஆசி பெறவும்.', 'Take blessings from the elders.'], 'aarti'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['deepa', 'விளக்கு ஏற்றும்போது', 'While lighting the lamp', '1'], ['lakshmi_gayatri', 'நிறைவில்', 'At the end', '3'], ['mangala', 'ஆரத்தியின் போது', 'During aarti', '1']]
    },
    'aadi-velli-pooram-perukku': {
      time: ['சுமார் 40 நிமிடம்', 'About 40 minutes'],
      sam: ['picture', 'kalasam', 'mango', 'lamp', 'oil', 'lotus', 'garland', 'kumkum', 'turmeric', 'bangles', 'sweetpongal', 'fruits', 'betel', 'camphor', 'incense'],
      steps: [['காலையில் குளித்து, வீட்டைச் சுத்தம் செய்து கோலமிடவும்.', 'Bathe in the morning, clean the house and draw a kolam.'], 'clean',
        ['அம்மன் படத்தை / கலசத்தை மஞ்சள், குங்குமம், மலரால் அலங்கரிக்கவும்.', 'Decorate the Amman picture or kalasam with turmeric, kumkum and flowers.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['அம்மன் துதிகளைக் கூறி மலர் சாத்தவும்.', 'Chant the Amman prayers and offer flowers.', 2],
        ['சர்க்கரைப் பொங்கல், பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer sweet pongal and fruit; show aarti.'],
        ['ஆடிப் பெருக்கு அன்று ஆறு / நீர்நிலைக்குச் சென்று வணங்கலாம்; வீட்டில் கலசத்தில் காவிரி நீரை வணங்கி மந்திரம் கூறவும்.', 'On Aadi Perukku, go to a river or water body, or worship the water in a kalasam at home with the river mantra.', 5],
        ['பெண்களுக்கு மஞ்சள், குங்குமம், வளையல் தாம்பூலம் வழங்கவும்.', 'Give thaamboolam with turmeric, kumkum and bangles to women.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['lalita_nama', 'அர்ச்சனையின் போது', 'During offerings', '108'], ['durga', 'துதியின் போது', 'During prayer', '3'], ['mangala', 'ஆரத்தியின் போது', 'During aarti', '1'], ['kaveri', 'ஆடிப் பெருக்கு அன்று', 'On Aadi Perukku', '1']]
    },
    'kedara-gauri-vratam': {
      time: ['சுமார் 1 மணி நேரம்', 'About 1 hour'],
      sam: ['sivalingam', 'kalasam', 'mango', 'thread', 'lamp', 'oil', 'bilva', 'flowers', 'vibhuti', 'kumkum', 'turmeric', 'sweets', 'fruits', 'betel', 'camphor', 'incense'],
      steps: [['விரத நாளில் குளித்து, முடிந்தவர்கள் உபவாசம் இருக்கவும்.', 'On the vratam day, bathe and fast if you can.'], 'clean',
        ['கலசம் வைத்து சிவ-பார்வதி படத்தை அலங்கரிக்கவும்.', 'Set up the kalasam and decorate the Shiva-Parvati picture.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['சிவனுக்கு வில்வம், பார்வதிக்கு மஞ்சள்-குங்குமம் சாத்தி மந்திரங்களைக் கூறவும்.', 'Offer bilva to Shiva and turmeric-kumkum to Parvati while chanting.', 2],
        ['நோன்புச் சரடை வைத்து வணங்கி, கையில் கட்டிக்கொள்ளவும்.', 'Place the nombu thread, worship and tie it on the wrist.'],
        ['இனிப்பு, பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer sweets and fruit; show aarti.', 4], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['panchakshara', 'அர்ச்சனையின் போது', 'During offerings', '108'], ['uma', 'நோன்புச் சரடு கட்டும்போது', 'While tying the thread', '21'], ['mangala', 'ஆரத்தியின் போது', 'During aarti', '1']]
    },
    'skanda-sashti': {
      time: ['சுமார் 1 மணி நேரம்', 'About 1 hour'],
      sam: ['vel', 'lamp', 'oil', 'wicks', 'flowers', 'garland', 'vibhuti', 'sandal', 'panchamritham', 'sweets', 'fruits', 'camphor', 'incense'],
      steps: [['ஆறு நாட்கள் விரதம் இருப்பவர்கள் அதிகாலையில் குளிக்கவும்; முடிந்தவர்கள் ஒரு வேளை உணவு மட்டும் உண்ணவும்.', 'Those keeping the six-day vratam bathe at dawn; if possible, eat only one meal.'], 'clean',
        ['முருகன் படம் / வேலுக்கு விபூதி, சந்தனம் இட்டு மலர் மாலை சாத்தவும்.', 'Apply vibhuti and sandal to the Murugan picture or vel and offer a garland.'],
        ['நெய் விளக்கு ஏற்றி, விநாயகரை வணங்கவும்.', 'Light a ghee lamp and pray to Ganesha.', 1], ['கந்த சஷ்டி கவசம் படிக்கவும்; முடிந்தால் முழுவதும் பாடவும்.', 'Read the Kanda Sashti Kavacham; sing it fully if you can.', 2],
        ['முருகன் நாமம் கூறி அர்ச்சனை செய்யவும்.', 'Chant the Murugan name and offer archanai.', 3], ['பஞ்சாமிர்தம், பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer panchamritham and fruit; show aarti.'],
        ['சூரசம்ஹாரம் முடிந்த மறுநாள் (திருக்கல்யாணம்) விரதம் முடிக்கவும்.', 'End the vratam the day after Soorasamharam.']],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['muruga_venba', 'கவசம் தொடங்கும் முன்', 'Before the kavacham', '1'], ['muruga_nama', 'அர்ச்சனையின் போது', 'During offerings', '108']]
    },
    'krishna-jayanthi': {
      time: ['சுமார் 1 மணி நேரம்', 'About 1 hour'],
      sam: ['picture', 'kolam', 'lamp', 'oil', 'flowers', 'tulsi', 'garland', 'sandal', 'milk', 'curd', 'sweets', 'fruits', 'betel', 'camphor', 'incense'],
      steps: [['வாசல் முதல் பூஜை அறை வரை அரிசி மாவால் சிறு பாதச் சுவடுகள் இடவும் (கிருஷ்ணன் வருகை).', 'Draw tiny footprints with rice flour from the door to the pooja room (Krishna\'s arrival).'],
        'bathe', ['கிருஷ்ணர் படம் / சிலையை அலங்கரித்து, துளசி மாலை சாத்தவும்.', 'Decorate the Krishna picture or idol and offer a tulsi garland.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['கிருஷ்ண மந்திரங்களைக் கூறவும்.', 'Chant the Krishna mantras.', 2],
        ['சீடை, முறுக்கு, வெண்ணெய், பால், தயிர், அவல் நைவேத்தியம் படைக்கவும்.', 'Offer seedai, murukku, butter, milk, curd and aval.'], ['நள்ளிரவு பிறப்பு நேரத்தில் ஆரத்தி காட்டவும்.', 'Show aarti at the midnight birth time.', 3], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['krishna1', 'அர்ச்சனையின் போது', 'During offerings', '3'], ['krishna2', 'ஆரத்தியின் போது', 'During aarti', '1']]
    },
    'rama-navami-hanuman-jayanthi': {
      time: ['சுமார் 45 நிமிடம்', 'About 45 minutes'],
      sam: ['picture', 'lamp', 'oil', 'tulsi', 'flowers', 'garland', 'sandal', 'banana', 'fruits', 'sweets', 'betel', 'camphor', 'incense'],
      steps: ['bathe', 'clean', ['ராமர் / அனுமன் படத்தை அலங்கரித்து, துளசி, மலர் மாலை சாத்தவும்.', 'Decorate the Rama / Hanuman picture with tulsi and a flower garland.'],
        ['விளக்கேற்றி, விநாயகரை வணங்கவும்.', 'Light the lamp and pray to Ganesha.', 1], ['ராம துதி, ராம நாமம் கூறவும்.', 'Recite the Rama prayer and Rama name.', 2],
        ['அனுமன் துதி கூறி வணங்கவும் (அனுமன் ஜெயந்தி அன்று வடை மாலை சாத்துவது வழக்கம்).', 'Recite the Hanuman prayer (offering a vada garland is customary on Hanuman Jayanthi).', 4],
        ['பானகம், நீர்மோர், பழம் நைவேத்தியம் படைத்து ஆரத்தி காட்டவும்.', 'Offer panakam, buttermilk and fruit; show aarti.'], 'prasadam'],
      m: [['ganesha_dhyana', 'ஆரம்பத்தில்', 'At the start', '1'], ['rama_dhyana', 'ராமருக்கு', 'For Rama', '1'], ['rama_nama', 'நாமம் சொல்லும்போது', 'While chanting the name', '3'], ['hanuman', 'அனுமனுக்கு', 'For Hanuman', '1']]
    }
  };

  // Turns a pooja entry into ready-to-render data (resolved items, steps and mantras).

  // ---------- extra full stotras, added after the core mantras (so step numbers stay valid) ----------
  var SHIVA = [['pancha1', 'அபிஷேகம் / வழிபாட்டின் போது', 'During abhishekam / worship', '1'], ['pancha2', 'தொடர்ந்து', 'Continue', '1'],
    ['lingashtaka', 'ஆரத்திக்கு முன்', 'Before aarti', '1'], ['lingashtaka2', 'தொடர்ந்து', 'Continue', '1'],
    ['appar', 'நிறைவில்', 'At the end', '1'], ['sambandar', 'நிறைவில்', 'At the end', '1']];
  var LAKSHMI = [['lakshmi_a1', 'அர்ச்சனைக்குப் பின்', 'After the offerings', '1'], ['lakshmi_a2', 'தொடர்ந்து', 'Continue', '1']];
  var AMBAL = [['abirami', 'நிறைவில்', 'At the end', '1']];
  var EXTRA = {
    'friday-home-pooja': LAKSHMI,
    'rama-navami': [['kamban', 'நிறைவில்', 'At the end', '1']],
    'hanuman-jayanthi': [['kamban', 'நிறைவில்', 'At the end', '1']],
    'deepavali-kubera': LAKSHMI,
    'sankatahara-chaturthi': [['sankata_stotra', 'அர்ச்சனைக்குப் பின்', 'After the offerings', '1']],
    'vinayagar-chaturthi': [['sankata_stotra', 'அர்ச்சனைக்குப் பின்', 'After the offerings', '1']],
    'pradosham': SHIVA, 'maha-shivaratri': SHIVA,
    'varalakshmi-vratam': LAKSHMI.concat(AMBAL), 'weekly-home-pooja': LAKSHMI, 'aadi-velli-pooram-perukku': LAKSHMI.concat(AMBAL),
    'navaratri-golu-ayudha-pooja': LAKSHMI.concat(AMBAL), 'thiruvilakku-pooja': AMBAL, 'kedara-gauri-vratam': AMBAL,
    'rama-navami-hanuman-jayanthi': [['kamban', 'நிறைவில்', 'At the end', '1']]
  };

  // ---------- when to do it: [Tamil, English] ----------
  var WHEN = {
    'friday-home-pooja': ['ஒவ்வொரு வெள்ளிக்கிழமை; காலை 6:00–8:00 அல்லது மாலை 6:00 மணி. ராகு காலத்தில் (10:30–12:00) தொடங்க வேண்டாம்.', 'Every Friday; morning 6:00-8:00 or evening 6:00 PM. Do not begin in Rahu Kalam (10:30-12:00).'],
    'tuesday-home-pooja': ['ஒவ்வொரு செவ்வாய்க்கிழமை; காலை அல்லது மாலை. ராகு காலத்தில் (பிற்பகல் 3:00–4:30) தொடங்க வேண்டாம்.', 'Every Tuesday; morning or evening. Do not begin in Rahu Kalam (3:00-4:30 PM).'],
    'nithya-pooja': ['தினமும்; காலை 6:00–8:00 (சூரிய உதய நேரம்) மற்றும் மாலை சுமார் 6:00 மணி.', 'Every day; morning 6:00-8:00 (sunrise) and evening around 6:00 PM.'],
    'masa-sashti': ['சஷ்டி திதி அன்று (மாதம் இரு முறை); வளர்பிறை சஷ்டி பலரும் கடைப்பிடிப்பர். செவ்வாய் அல்லது கிருத்திகையுடன் சேர்ந்தால் சிறப்பு.', 'On Sashti tithi (twice a month); many keep the waxing-moon Sashti. Special when it falls on Tuesday or Krithigai.'],
    'amavasya-pitru': ['அமாவாசை திதியில்; பகல் வேளை (மதியம் / தர்ப்பண நேரம்).', 'On Amavasya tithi; during the day (midday / tarpanam time).'],
    'guru-purnima': ['ஆடி மாத பௌர்ணமி; காலை 6:00–9:00 அல்லது மாலை.', 'Aadi month Pournami (full moon); morning 6:00-9:00 or evening.'],
    'maattu-pongal': ['தை 2 (ஜனவரி 15 / 16); காலை.', 'Thai 2 (15/16 January); morning.'],
    'rama-navami': ['பங்குனி / சித்திரை வளர்பிறை நவமி; நண்பகல் சுமார் 11:30–12:30. நவமியும் புனர்பூசமும் சேரும் நாள் சிறப்பு.', 'Waxing Navami in Panguni/Chithirai; around noon 11:30-12:30. Special when Navami meets Punarvasu.'],
    'hanuman-jayanthi': ['மார்கழி அமாவாசையும் மூல நட்சத்திரமும் கூடும் நாள் (தமிழ்நாடு வழக்கம்); காலை.', 'The day Margazhi Amavasya meets the Moolam star (Tamil Nadu custom); morning.'],
    'avani-avittam': ['ஆவணி மாதம் அவிட்டம் நட்சத்திரம் / பௌர்ணமி; மறுநாள் காயத்ரி ஜபம். காலை.', 'Aavani month, Avittam star or full moon; Gayatri japam the next day. Morning.'],
    'chitra-pournami': ['சித்திரை பௌர்ணமி, சித்திரை நட்சத்திரத்துடன் கூடினால் சிறப்பு; காலை அல்லது மாலை.', 'Chithirai Pournami, special when it meets the Chithirai star; morning or evening.'],
    'karadaiyan-nonbu': ['மாசி முடிந்து பங்குனி பிறக்கும் நேரம் (மீன சங்கிராந்தி); நோன்பு நேரம் ஆண்டுதோறும் மாறும் - பஞ்சாங்கத்தைப் பாருங்கள்.', 'At the turn from Masi to Panguni (Meena Sankranti); the exact time changes each year, so check the panchangam.'],
    'thai-poosam': ['தை மாத பௌர்ணமி, பூசம் நட்சத்திரத்துடன்; காலை 6:00–9:00.', 'Thai month Pournami with the Poosam star; morning 6:00-9:00.'],
    'panguni-uthiram': ['பங்குனி பௌர்ணமி, உத்திரம் நட்சத்திரத்துடன்; காலை அல்லது மாலை.', 'Panguni Pournami with the Uthiram star; morning or evening.'],
    'deepavali-kubera': ['தீபாவளி அன்று மாலை; பிரதோஷ காலத்துக்குப் பின் அல்லது பஞ்சாங்கம் குறிக்கும் லட்சுமி பூஜை நேரத்தில்.', 'Deepavali evening; after Pradosham time or at the Lakshmi pooja time given in your panchangam.'],
    'margazhi-thiruppavai': ['மார்கழி மாதம் முழுவதும் (30 நாள்); அதிகாலை 4:30–6:00.', 'The whole of Margazhi (30 days); early morning 4:30-6:00.'],
    'sankatahara-chaturthi': ['மாதம் ஒருமுறை - தேய்பிறை சதுர்த்தி அன்று மாலை; சந்திரன் உதித்த பின் விரதம் முடிக்கவும்.', 'Once a month on the waning-moon Chaturthi, in the evening; break the fast after moonrise.'],
    'pradosham': ['மாதம் இருமுறை - திரயோதசி அன்று மாலை சுமார் 4:30–6:00 பிரதோஷ வேளையில்.', 'Twice a month on Trayodashi, in the evening Pradosha time, about 4:30–6:00 PM.'],
    'pournami-satyanarayana': ['மாதம் ஒருமுறை - பௌர்ணமி அன்று, காலை அல்லது மாலை.', 'Once a month on Pournami (full moon), morning or evening.'],
    'krithigai': ['மாதம் ஒருமுறை - கிருத்திகை நட்சத்திர நாளில், காலை.', 'Once a month on the Krithigai star day, in the morning.'],
    'ekadashi': ['மாதம் இருமுறை - ஏகாதசி அன்று விரதம்; மறுநாள் துவாதசி காலையில் விரதம் முடிக்கவும்.', 'Twice a month on Ekadashi; break the fast next morning (Dwadashi).'],
    'thiruvilakku-pooja': ['வெள்ளி அல்லது செவ்வாய் மாலை, சுமார் 6:00 மணிக்கு.', 'Friday or Tuesday evening, around 6:00 PM.'],
    'weekly-home-pooja': ['ஒவ்வொரு வெள்ளி அல்லது செவ்வாய், காலை அல்லது மாலை.', 'Every Friday or Tuesday, morning or evening.'],
    'varalakshmi-vratam': ['ஆவணி பௌர்ணமிக்கு முந்தைய வெள்ளிக்கிழமை (ஆடி / ஆவணி), காலை.', 'The Friday before the Aavani full moon (Aadi/Aavani), in the morning.'],
    'vinayagar-chaturthi': ['ஆவணி வளர்பிறை சதுர்த்தி (ஆகஸ்ட் / செப்டம்பர்), காலை அல்லது மதியம்.', 'Aavani waxing-moon Chaturthi (Aug/Sep), morning or noon.'],
    'navaratri-golu-ayudha-pooja': ['புரட்டாசி / ஐப்பசி மாதத்தில் அமாவாசைக்குப் பின் 9 நாள்; கடைசி நாட்களில் சரஸ்வதி / ஆயுத பூஜை.', '9 nights after the Amavasya in Purattasi/Aippasi; Saraswathi and Ayudha Pooja on the last days.'],
    'karthigai-deepam': ['கார்த்திகை மாதம் கிருத்திகை நட்சத்திரமும் பௌர்ணமியும் சேரும் நாள்; மாலை 6:00 மணிக்கு விளக்கேற்றவும்.', 'In Karthigai month, on the day the Krithigai star meets the full moon; light lamps at about 6:00 PM.'],
    'maha-shivaratri': ['மாசி தேய்பிறை சதுர்த்தசி; இரவு முழுவதும் விழித்திருந்து நான்கு ஜாமம் வழிபடவும்.', 'Masi waning-moon Chaturdashi; stay awake through the night and worship in four watches.'],
    'vaikunta-ekadashi': ['மார்கழி வளர்பிறை ஏகாதசி; அதிகாலை.', 'Margazhi waxing-moon Ekadashi; early morning.'],
    'thai-pongal': ['தை 1 (ஜனவரி 14 / 15) காலை, சூரிய உதயத்தின்போது.', 'Thai 1 (14/15 January), in the morning at sunrise.'],
    'tamil-puthandu': ['சித்திரை 1 (ஏப்ரல் 14), காலை.', 'Chithirai 1 (14 April), in the morning.'],
    'aadi-velli-pooram-perukku': ['ஆடி மாதம் வெள்ளிக்கிழமைகள், ஆடிப் பூரம், ஆடிப் பெருக்கு (ஆடி 18).', 'Fridays of Aadi, Aadi Pooram and Aadi Perukku (Aadi 18).'],
    'kedara-gauri-vratam': ['ஐப்பசி மாதம்; தீபாவளி அமாவாசை அன்று நிறைவு.', 'In Aippasi; concludes on Deepavali Amavasya.'],
    'skanda-sashti': ['ஐப்பசி வளர்பிறை பிரதமை முதல் சஷ்டி வரை 6 நாள்.', 'Six days from Pratipada to Sashti in Aippasi waxing moon.'],
    'krishna-jayanthi': ['ஆவணி தேய்பிறை அஷ்டமி (கோகுலாஷ்டமி); மாலை முதல் நள்ளிரவு வரை.', 'Aavani waning-moon Ashtami (Gokulashtami); evening to midnight.'],
    'rama-navami-hanuman-jayanthi': ['ராம நவமி - பங்குனி / சித்திரை வளர்பிறை நவமி; அனுமன் ஜெயந்தி - மார்கழி அமாவாசை.', 'Rama Navami - waxing-moon Navami in Panguni/Chithirai; Hanuman Jayanthi - Margazhi Amavasya.']
  };

  function get(slug) {
    var d = POOJA[slug];
    if (!d) return null;
    var list = d.m.slice(), have = {};
    list.forEach(function (x) { have[x[0]] = true; });
    var firstExtra = list.length + 1;
    (EXTRA[slug] || []).forEach(function (x) { if (!have[x[0]]) { list.push(x); have[x[0]] = true; } });
    var steps = d.steps.map(function (s) {
      var st = typeof s === 'string' ? S[s] : s;
      return { ta: st[0], en: st[1], m: st[2] || 0 };
    });
    if (list.length >= firstExtra) {
      steps.splice(Math.max(1, steps.length - 1), 0, {
        ta: 'நேரம் இருந்தால், PDF-இல் உள்ள கூடுதல் துதிகளையும் (மந்திரம் ' + firstExtra + ' முதல்) படிக்கலாம்.',
        en: 'If you have time, also read the extra hymns in the PDF (from Mantra ' + firstExtra + ').', m: firstExtra });
    }
    return {
      time: d.time,
      when: WHEN[slug] || null,
      samagri: d.sam.map(function (k) { var it = ITEM[k], pr = PREP[k]; return { key: k, icon: it[0], ta: it[1], en: it[2], prep: pr || null }; }),
      steps: steps,
      mantras: list.map(function (x) {
        var m = MANTRA[x[0]];
        return { ta: m.t[0], en: m.t[1], whenTa: x[1], whenEn: x[2], count: x[3], lines: m.v, meTa: m.me[0], meEn: m.me[1] };
      })
    };
  }

  // Icon for old-style [Tamil, English] samagri rows (priest-led poojas): picked from Tamil keywords.
  var WORDS = [['விளக்கு', 'lamp'], ['நெய்', 'oil'], ['எண்ணெய்', 'oil'], ['திரி', 'wick'], ['குங்கும', 'kumkum'], ['மஞ்சள்', 'turmeric'], ['சந்தன', 'sandal'],
    ['மலர்', 'flower'], ['மாலை', 'garland'], ['வெற்றிலை', 'betel'], ['பழம்', 'fruits'], ['தேங்காய்', 'coconut'], ['கலசம்', 'kalasam'], ['மாவிலை', 'mango'],
    ['அரிசி', 'rice'], ['நவதானிய', 'rice'], ['கற்பூர', 'camphor'], ['ஊதுபத்தி', 'incense'], ['பால்', 'milk'], ['இனிப்பு', 'sweets'], ['வஸ்திரம்', 'cloth'],
    ['ஆடை', 'cloth'], ['துணி', 'cloth'], ['தாம்பூல', 'betel'], ['தர்ப்பை', 'leaf'], ['சமித்து', 'leaf'], ['குண்டம்', 'pot'], ['எள்', 'rice']];
  function iconFor(ta) {
    for (var i = 0; i < WORDS.length; i++) if (String(ta).indexOf(WORDS[i][0]) !== -1) return WORDS[i][1];
    return 'dot';
  }

  window.SASelf = {
    ICONS: ICONS,
    icon: function (key) { return ICONS[key] || ICONS.dot; },
    iconFor: iconFor,
    get: get,
    count: Object.keys(POOJA).length
  };
})();
