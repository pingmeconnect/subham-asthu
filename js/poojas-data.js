/* Subham Astu — pooja catalog seed + content (Phase 3).
   Source: pooja-catalog.md (48 items, 4 categories).
   Mantra Rule: only self-done home poojas (is_self_pooja) carry mantras.
   Priest-led kinds (homa, puja, samskara) carry samagri + steps only.
   Content below is a draft for owner/priest review. */
(function () {
  'use strict';

  var CATEGORIES = {
    daily_monthly:     { ta: 'தினசரி & மாதாந்திர பூஜைகள்', en: 'Daily & Monthly Poojas' },
    annual_vratam:     { ta: 'வருடாந்திரப் பண்டிகைகள் & விரதங்கள்', en: 'Annual Festivals & Vratams' },
    home_subha_homa:   { ta: 'வீட்டு சுப காரியங்கள் & ஹோமங்கள்', en: 'Home Subha Karyams & Homas' },
    samskara_pitru:    { ta: 'வாழ்வியல் சடங்குகள் & பித்ரு காரியங்கள்', en: 'Life Samskaras & Pitru Karyams' }
  };

  // [slug, category, name_ta, name_en, has_cook_option, is_self_pooja, kind]
  var P = [
    ['sankatahara-chaturthi', 'daily_monthly', 'சங்கடஹர சதுர்த்தி', 'Sankatahara Chaturthi', false, true, 'daily'],
    ['pradosham', 'daily_monthly', 'பிரதோஷம்', 'Pradosham', false, true, 'daily'],
    ['pournami-satyanarayana', 'daily_monthly', 'பௌர்ணமி சத்யநாராயண பூஜை', 'Pournami Satyanarayana Pooja', false, true, 'daily'],
    ['krithigai', 'daily_monthly', 'கிருத்திகை', 'Krithigai', false, true, 'daily'],
    ['ekadashi', 'daily_monthly', 'ஏகாதசி', 'Ekadashi', false, true, 'daily'],
    ['thiruvilakku-pooja', 'daily_monthly', 'திருவிளக்கு பூஜை', 'Thiruvilakku Pooja', false, true, 'daily'],

    ['varalakshmi-vratam', 'annual_vratam', 'வரலட்சுமி விரதம்', 'Varalakshmi Vratam', false, true, 'vratam'],
    ['vinayagar-chaturthi', 'annual_vratam', 'விநாயகர் சதுர்த்தி', 'Vinayagar Chaturthi', false, true, 'vratam'],
    ['navaratri-golu-ayudha-pooja', 'annual_vratam', 'நவராத்திரி கொலு / சரஸ்வதி & ஆயுத பூஜை', 'Navaratri Golu / Saraswathi & Ayudha Pooja', false, true, 'vratam'],
    ['karthigai-deepam', 'annual_vratam', 'கார்த்திகை தீபம்', 'Karthigai Deepam', false, true, 'vratam'],
    ['maha-shivaratri', 'annual_vratam', 'மகா சிவராத்திரி', 'Maha Shivaratri', false, true, 'vratam'],
    ['vaikunta-ekadashi', 'annual_vratam', 'வைகுண்ட ஏகாதசி', 'Vaikunta Ekadashi', false, true, 'vratam'],
    ['thai-pongal', 'annual_vratam', 'தைப்பொங்கல் & மாட்டுப் பொங்கல்', 'Thai Pongal & Mattu Pongal', false, true, 'vratam'],
    ['tamil-puthandu', 'annual_vratam', 'தமிழ் புத்தாண்டு', 'Tamil Puthandu', false, true, 'vratam'],
    ['aadi-velli-pooram-perukku', 'annual_vratam', 'ஆடி வெள்ளி/பூரம்/பெருக்கு', 'Aadi Velli / Pooram / Perukku', false, true, 'vratam'],
    ['kedara-gauri-vratam', 'annual_vratam', 'கேதார கௌரி விரதம்', 'Kedara Gauri Vratam', false, true, 'vratam'],
    ['skanda-sashti', 'annual_vratam', 'கந்த சஷ்டி', 'Skanda Sashti', false, true, 'vratam'],
    ['krishna-jayanthi', 'annual_vratam', 'கிருஷ்ண ஜெயந்தி', 'Krishna Jayanthi', false, true, 'vratam'],
    ['rama-navami-hanuman-jayanthi', 'annual_vratam', 'ராம நவமி & அனுமன் ஜெயந்தி', 'Rama Navami & Hanuman Jayanthi', false, true, 'vratam'],
    ['friday-home-pooja', 'daily_monthly', 'வெள்ளிக்கிழமை வீட்டுப் பூஜை', 'Friday Home Pooja', false, true, 'daily'],
    ['tuesday-home-pooja', 'daily_monthly', 'செவ்வாய்க்கிழமை வீட்டுப் பூஜை', 'Tuesday Home Pooja', false, true, 'daily'],
    ['nithya-pooja', 'daily_monthly', 'தினசரி நித்ய பூஜை', 'Daily Nithya Pooja', false, true, 'daily'],
    ['masa-sashti', 'daily_monthly', 'மாத சஷ்டி', 'Masa Sashti', false, true, 'daily'],
    ['amavasya-pitru', 'daily_monthly', 'அமாவாசை பித்ரு பூஜை', 'Amavasya Pitru Pooja', false, true, 'daily'],
    ['guru-purnima', 'annual_vratam', 'குரு பூர்ணிமா', 'Guru Purnima', false, true, 'vratam'],
    ['avani-avittam', 'annual_vratam', 'ஆவணி அவிட்டம்', 'Avani Avittam (Upakarma)', false, true, 'vratam'],
    ['chitra-pournami', 'annual_vratam', 'சித்ரா பௌர்ணமி', 'Chitra Pournami', false, true, 'vratam'],
    ['karadaiyan-nonbu', 'annual_vratam', 'காரடையான் நோன்பு', 'Karadaiyan Nonbu', false, true, 'vratam'],
    ['thai-poosam', 'annual_vratam', 'தைப்பூசம்', 'Thai Poosam', false, true, 'vratam'],
    ['panguni-uthiram', 'annual_vratam', 'பங்குனி உத்திரம்', 'Panguni Uthiram', false, true, 'vratam'],
    ['deepavali-kubera', 'annual_vratam', 'தீபாவளி லட்சுமி குபேர பூஜை', 'Deepavali Lakshmi Kubera Pooja', false, true, 'vratam'],
    ['margazhi-thiruppavai', 'annual_vratam', 'மார்கழி திருப்பாவை & திருவெம்பாவை', 'Margazhi Thiruppavai & Thiruvempavai', false, true, 'vratam'],
    ['sumangali-prarthanai', 'annual_vratam', 'சுமங்கலி பிரார்த்தனை', 'Sumangali Prarthanai', true, false, 'puja'],

    ['grihapravesam-vastu-shanti', 'home_subha_homa', 'கிரகப்பிரவேசம் & வாஸ்து சாந்தி', 'Grihapravesam & Vastu Shanti', true, false, 'homa'],
    ['ganapathi-homam', 'home_subha_homa', 'கணபதி ஹோமம்', 'Ganapathi Homam', true, false, 'homa'],
    ['navagraha-homam', 'home_subha_homa', 'நவகிரக ஹோமம்', 'Navagraha Homam', false, false, 'homa'],
    ['sudarshana-homam', 'home_subha_homa', 'சுதர்சன ஹோமம்', 'Sudarshana Homam', false, false, 'homa'],
    ['mrityunjaya-ayush-homam', 'home_subha_homa', 'மிருத்யுஞ்சய / ஆயுஷ் ஹோமம்', 'Mrityunjaya / Ayush Homam', true, false, 'homa'],
    ['dhanvantari-homam', 'home_subha_homa', 'தன்வந்திரி ஹோமம்', 'Dhanvantari Homam', false, false, 'homa'],
    ['chandi-homam', 'home_subha_homa', 'சண்டி ஹோமம்', 'Chandi Homam', true, false, 'homa'],
    ['new-vehicle-pooja', 'home_subha_homa', 'புது வாகனம்', 'New Vehicle Pooja', false, false, 'puja'],
    ['new-business-shop-opening', 'home_subha_homa', 'புதிய தொழில்/கடை திறப்பு', 'New Business/Shop Opening', false, false, 'puja'],
    ['bhoomi-pooja', 'home_subha_homa', 'பூமி பூஜை', 'Bhoomi Pooja', false, false, 'puja'],

    ['pumsavanam-seemantham', 'samskara_pitru', 'பும்சவனம் & சீமந்தம்', 'Pumsavanam & Seemantham', true, false, 'samskara'],
    ['namakaranam', 'samskara_pitru', 'நாமகரணம்', 'Namakaranam', true, false, 'samskara'],
    ['annaprashanam', 'samskara_pitru', 'அன்னபிராசனம்', 'Annaprashanam', true, false, 'samskara'],
    ['karnavedham', 'samskara_pitru', 'கர்ணவேதம்', 'Karnavedham', true, false, 'samskara'],
    ['aksharabhyasam', 'samskara_pitru', 'அட்சராப்பியாசம்', 'Aksharabhyasam', true, false, 'samskara'],
    ['upanayanam', 'samskara_pitru', 'உபநயனம்', 'Upanayanam', true, false, 'samskara'],
    ['nichayathartham', 'samskara_pitru', 'நிச்சயதார்த்தம்', 'Nichayathartham', true, false, 'samskara'],
    ['thirumanam', 'samskara_pitru', 'திருமணம்', 'Thirumanam / Marriage', true, false, 'samskara'],
    ['sashtiabdapoorthi-60', 'samskara_pitru', 'சஷ்டியப்த பூர்த்தி - 60', 'Sashtiabdapoorthi - 60th', true, false, 'samskara'],
    ['bhimaratha-shanti-70', 'samskara_pitru', 'பீமரத சாந்தி - 70', 'Bhimaratha Shanti - 70th', true, false, 'samskara'],
    ['sathabhishekam-80', 'samskara_pitru', 'சதாபிஷேகம் - 80', 'Sathabhishekam - 80th', true, false, 'samskara'],
    ['amavasya-tharpanam', 'samskara_pitru', 'அமாவாசை தர்ப்பணம்', 'Amavasya Tharpanam', true, false, 'samskara'],
    ['mahalaya-paksha-tharpanam', 'samskara_pitru', 'மகாளய பட்ச தர்ப்பணம்', 'Mahalaya Paksha Tharpanam', true, false, 'samskara'],
    ['annual-thithi-shrardham', 'samskara_pitru', 'வருடாந்திர திதி / சிரார்த்தம்', 'Annual Thithi / Shrardham', true, false, 'samskara'],
    ['padayal-vazhipadu', 'samskara_pitru', 'படையல் வழிபாடு', 'Padayal Vazhipadu', true, false, 'samskara'],
    ['10th-16th-day-karyams', 'samskara_pitru', '10-ம் / 16-ம் நாள் காரியங்கள்', '10th / 16th Day Karyams', true, false, 'samskara']
  ];

  // Samagri and steps are [Tamil, English] pairs. Mantras are Tamil script only.
  var KINDS = {
    daily: {
      samagri: [
        ['குத்துவிளக்கு', 'Kuthuvilakku (lamp)'],
        ['நெய் / நல்லெண்ணெய்', 'Ghee / gingelly oil'],
        ['பஞ்சுத் திரி', 'Cotton wicks'],
        ['குங்குமம், மஞ்சள்', 'Kumkum & turmeric'],
        ['மலர்கள் (துளசி / அரளி)', 'Flowers (tulsi / arali)'],
        ['வெற்றிலை, பாக்கு, பழம்', 'Betel leaves, areca nut, fruits'],
        ['நீர் நிரப்பிய கலசம்', 'Kalasam filled with water'],
        ['கற்பூரம், ஊதுபத்தி', 'Camphor & incense']
      ],
      steps: [
        ['வீட்டை சுத்தம் செய்து பூஜை இடத்தில் கோலம் போடவும்.', 'Clean the house and draw a kolam at the pooja place.'],
        ['விளக்கேற்றி கலசத்தில் நீர் நிரப்பவும்.', 'Light the lamp and fill the kalasam with water.'],
        ['தெய்வத்திற்கு குங்குமம், மஞ்சள், மலர்கள் இட்டு வழிபடவும்.', 'Offer kumkum, turmeric and flowers to the deity.'],
        ['கீழ்க்கண்ட மந்திரத்தை மூன்று முறை கூறவும்.', 'Chant the mantra below three times.'],
        ['நைவேத்தியம் படைத்து கற்பூர ஆரத்தி காட்டி வணங்கவும்.', 'Offer naivedyam, show camphor aarti and pray.']
      ],
      mantra: ['அன்பு மனம் கொண்டு விளக்கேற்றுகின்றேன்,', 'ஒளியாய் வந்து குடும்பத்தை நலமுடன் காப்பாய்.']
    },
    vratam: {
      samagri: [
        ['குத்துவிளக்கு, நெய்', 'Lamp & ghee'],
        ['மஞ்சள் கயிறு / நோன்புச் சரடு', 'Turmeric thread (nombu saradu)'],
        ['வாழை இலை, மாவிலை', 'Banana leaf & mango leaves'],
        ['குங்குமம், மஞ்சள், மலர்கள்', 'Kumkum, turmeric & flowers'],
        ['பழம், இனிப்பு, நைவேத்தியம்', 'Fruits, sweets & naivedyam'],
        ['வெற்றிலை, பாக்கு, தாம்பூலம்', 'Betel set (thaamboolam)'],
        ['கற்பூரம், ஊதுபத்தி', 'Camphor & incense']
      ],
      steps: [
        ['விரதம் இருக்கும் நாளில் காலையில் நீராடி சுத்தமாக இருக்கவும்.', 'On the vratam day, bathe in the morning and stay clean.'],
        ['பூஜை இடத்தில் விளக்கேற்றி மலர்களால் அலங்கரிக்கவும்.', 'Light the lamp and decorate the pooja place with flowers.'],
        ['நோன்புச் சரடு அல்லது மஞ்சள் கயிற்றை வைத்து வணங்கவும்.', 'Place the nombu saradu or turmeric thread and worship.'],
        ['கீழ்க்கண்ட மந்திரத்தை கூறி பிரார்த்திக்கவும்.', 'Recite the mantra below and offer your prayers.'],
        ['நைவேத்தியம் படைத்து, குடும்பத்துடன் பிரசாதம் உண்ணவும்.', 'Offer naivedyam and share the prasadam with family.']
      ],
      mantra: ['நோன்பு நோற்று உன்னை வணங்குகின்றேன்,', 'மங்கலம் பெருகி வாழ்வு செழிக்க அருள்வாய்.']
    },
    homa: {
      samagri: [
        ['ஹோம குண்டம்', 'Homa kundam'],
        ['சமித்து (ஐந்து வகை மரக் குச்சிகள்)', 'Samidhu (five sacred wood sticks)'],
        ['நெய், எள், அரிசி', 'Ghee, sesame & rice'],
        ['கலசம், மாவிலைத் தோரணம்', 'Kalasam & mango-leaf toran'],
        ['வஸ்திரம், தாம்பூலம்', 'Cloth & betel set'],
        ['பழம், மலர், கற்பூரம்', 'Fruits, flowers & camphor']
      ],
      steps: [
        ['ஹோம இடத்தை சுத்தம் செய்து குண்டம் அமைக்கவும்.', 'Clean the homa area and set up the kundam.'],
        ['வாத்தியார் கலசம் ஸ்தாபனம் செய்வார்; குடும்பத்தினர் அமரவும்.', 'The priest will establish the kalasam; family members sit down.'],
        ['வாத்தியார் ஹோமத்தை நடத்தும்போது அமைதியாக பங்கேற்கவும்.', 'Participate calmly while the priest conducts the homa.'],
        ['பூர்ணாஹுதிக்குப் பின் தீபாராதனை செய்து அனைவரும் வணங்கவும்.', 'After purnahuti, perform deeparadhana and pray together.'],
        ['பிரசாதம் பெற்றுக் கொண்டு, தட்சிணையை வாத்தியாருடன் பேசி நேரடியாக வழங்கவும்.', 'Receive prasadam; settle dakshina directly with the priest.']
      ]
    },
    puja: {
      samagri: [
        ['கலசம், மாவிலை, தேங்காய்', 'Kalasam, mango leaves & coconut'],
        ['பூமாலை, மலர்கள்', 'Garlands & flowers'],
        ['வஸ்திரம், தாம்பூலம்', 'Cloth & betel set'],
        ['பழம், பால், இனிப்பு', 'Fruits, milk & sweets'],
        ['கற்பூரம், ஊதுபத்தி, குங்குமம்', 'Camphor, incense & kumkum'],
        ['நவதானியம், அரிசி', 'Navadhanyam & rice']
      ],
      steps: [
        ['இடத்தை சுத்தம் செய்து கலசம் வைக்க தயார் செய்யவும்.', 'Clean the place and prepare for the kalasam.'],
        ['வாத்தியார் குறித்த நேரத்தில் வந்து பூஜையை நடத்துவார்.', 'The priest arrives at the agreed time and conducts the pooja.'],
        ['குடும்பத்தினர் வாத்தியார் சொல்லும் வழிகாட்டலைப் பின்பற்றவும்.', 'Family members follow the priest\'s guidance.'],
        ['பூஜை முடிந்ததும் தீபாராதனை செய்து பிரசாதம் பெறவும்.', 'After the pooja, do deeparadhana and receive prasadam.']
      ]
    },
    samskara: {
      samagri: [
        ['தாம்பூலம், வெற்றிலை, பாக்கு', 'Betel set'],
        ['புத்தாடை / வஸ்திரம்', 'New clothes'],
        ['பூ, பழம், பால்', 'Flowers, fruits & milk'],
        ['நெய், பஞ்சுத் திரி, விளக்கு', 'Ghee, wicks & lamp'],
        ['அரிசி, எள், தர்ப்பை', 'Rice, sesame & darbha grass'],
        ['தட்சிணை (வாத்தியாருடன் பேசி முடிவு)', 'Dakshina (agreed with the priest)']
      ],
      steps: [
        ['சடங்கு நடைபெறும் இடத்தை சுத்தம் செய்து தயார் செய்யவும்.', 'Clean and prepare the place where the rite will be held.'],
        ['வாத்தியார் சடங்குகளை வழிநடத்துவார்; குடும்பத்தினர் பின்பற்றவும்.', 'The priest leads the rites; family members follow.'],
        ['வாத்தியார் குறிப்பிடும் நேரத்தில் பிரசாதம் மற்றும் தானம் வழங்கவும்.', 'Offer prasadam and charity at the time the priest specifies.'],
        ['சடங்கு முடிந்ததும் பெரியோர்களின் ஆசி பெறவும்.', 'After the rite, seek blessings from elders.']
      ]
    }
  };

  var CATALOG = P.map(function (r) {
    return {
      slug: r[0], category: r[1], name_ta: r[2], name_en: r[3],
      has_cook_option: r[4], is_self_pooja: r[5], kind: r[6]
    };
  });

  // The catalog lives in the browser; the database holds the same slugs (see schema.sql).
  // Content (samagri/steps/mantras) is never stored in the database.
  // Returns only the poojas the admin has left visible (sa_list_visible_poojas in the database).
  // If the database cannot be reached, nothing is listed rather than hidden poojas.
  function seed() {
    return window.SADB.rpc('sa_list_visible_poojas', {}).then(function (slugs) {
      return CATALOG.filter(function (p) { return slugs.indexOf(p.slug) !== -1; });
    }).catch(function () { return []; });
  }

  window.SAPoojas = {
    CATEGORIES: CATEGORIES,
    CATALOG: CATALOG,
    KINDS: KINDS,
    seed: seed
  };
})();
