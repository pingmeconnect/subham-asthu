/* Sankalpam — exact-design homepage (desktop): scaling, font fitting, live data, English mode. */
(function(){
  var box=document.getElementById('sa-hn'),st=document.getElementById('sa-hn-stage');
  if(!box||!st)return;
  var H=1068,root=document.documentElement;
  function $(id){return document.getElementById(id);}
  function lang(){return root.getAttribute('data-lang')==='en'?'en':'ta';}
  function norm(t){return String(t).replace(/ /g,' ').replace(/\s+/g,' ').trim();}

  /* ---------- English strings (key = the Tamil text on the page) ---------- */
  var EN={
    'முகப்பு':'Home','பதிவுகள்':'Poojas','வழிகாட்டி PDF':'Guides PDF','பஞ்சாங்கம்':'Panchang','ராசி பலன்':'Rasi Palan','சேவைகள்':'Services','உள்நுழைவு':'Log in','பூஜை பொருட்கள்':'Pooja Items',
    'எல்லாம் நன்மையாகட்டும்!':'May all be auspicious!',
    'உங்கள் இல்லத்து மக்கள்':'For the auspicious','உங்கள் இல்லத்து மங்கள':'For the auspicious','சங்கல்பம்':'Sankalpam','தனியுரிமைக் கொள்கை':'Privacy Policy','விதிமுறைகள்':'Terms & Conditions','எங்களைத் தொடர்பு கொள்ள':'Contact Us','நிகழ்வுகளுக்கு...':'occasions of your home...','சரியான நபர். சரியான இணைப்பு.':'The right person. The right connection.','தொடங்குங்கள் →':'Get Started →',
    'தினசரி, மாதாந்திரம்':'Daily, monthly','இன்றைய பலன்':"Today's reading",'பிரபலமான வழிகாட்டி':'Popular guides','உத்தரவாத பொருட்கள்':'Quality items','பூஜை & வழிபாடு சேவைகள்':'Pooja & worship services','உதவி மையம்':'Help Centre','எங்கள் தொடர்புகள்':'Contact us',
    'அடுத்த நிகழ்வுகள்':'Next Events','முழு விவரம் →':'Full details →','அடுத்த விசேஷம்':'Next special day',
    'எங்கள் சேவைகள்':'Our Services','வழிபாடு சேவைகள்':'Worship Services','ஆன்மிக வழிகாட்டி':'Spiritual Guide','திருக்கோவில்':'Temple','தரிசனம்':'Darshan',
    'ஜோதிடர் ஆலோசனை':'Astrologer Consultation','முதல் கேள்வி இலவசம்':'First question FREE','புதியது':'NEW','ஜோதிடர் ஆலோசனை — முதல் கேள்வி இலவசம்!':'Astrologer Consultation — first question FREE!',
    'ஏன் சங்கல்பம்?':'Why Sankalpam?','நம்பகமான சேவை':'Trusted Service','உறுதியான நம்பிக்கை':'Assured trust','ஆன்மிக வழிகாட்டல்':'Spiritual Guidance','ஆழ்ந்த அறிவு':'Deep knowledge','பாரம்பரிய மரபு':'Traditional Heritage','நமது பண்பாடு':'Our culture','பெரிய சமூக ஆதரவு':'Strong Community Support','ஒன்றிணைந்த சமூகம்':'United community',
    '“நல்லதே நடக்கட்டும், எல்லோரும் வளமுடன் வாழ்க!”':'“May good things happen; may everyone live in prosperity!”',
    'எங்களைப் பற்றி':'About Us','கேள்விகள்':'FAQ','பொறுப்புத் துறப்பு':'Disclaimers','தனியுரிமை':'Privacy'
  };
  /* reverse map: English value -> Tamil key, so a label left in English always returns to Tamil */
  var REV={};Object.keys(EN).forEach(function(k){REV[norm(EN[k])]=k;});
  function tamilOf(t){var n=norm(t);return REV[n]||t;}
  var TA_MON=['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
  var EN_MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var els=[].slice.call(st.querySelectorAll('.t,.fl,.ap-new,.ap-txt,.rb-new')).filter(function(e){return !e.id||e.id==='';});
  els.forEach(function(e){e.setAttribute('data-ta',e.textContent);});

  function scale(){var w=root.clientWidth||window.innerWidth;var k=w/1536;st.style.transform='scale('+k+')';box.style.height=(H*k)+'px';}
  function fitAll(){
    for(var pass=0;pass<2;pass++){
      [].forEach.call(st.querySelectorAll('.t[data-w]'),function(e){
        if(e.id)return;var w=parseFloat(e.getAttribute('data-w')),cur=e.offsetWidth;if(!cur)return;
        e.style.fontSize=(parseFloat(e.style.fontSize)*w/cur).toFixed(2)+'px';
      });
    }
    els.forEach(function(e){e.setAttribute('data-fs0',e.style.fontSize||'');});
  }
  function applyLang(){
    var en=lang()==='en';
    var pills=st.querySelectorAll('a[data-set-lang]');[].forEach.call(pills,function(a){var on=a.getAttribute('data-set-lang')===(en?'en':'ta');a.style.border=on?'1.5px solid #e9c46f':'1.5px solid transparent';a.style.background=on?'#8a0f12':'transparent';});
    els.forEach(function(e){
      var ta=e.getAttribute('data-ta'),key=norm(ta);
      if(en&&EN[key]){
        e.textContent=EN[key];
        var lim=parseFloat(e.getAttribute('data-w'));
        if(lim&&e.offsetWidth>lim*1.0){e.style.fontSize=(parseFloat(e.getAttribute('data-fs0')||e.style.fontSize)*lim*1.0/e.offsetWidth).toFixed(2)+'px';}
      }else{
        e.textContent=tamilOf(ta);
        if(e.hasAttribute('data-fs0'))e.style.fontSize=e.getAttribute('data-fs0');
      }
    });
    live();
  }
  function refresh(){
    scale();
    // measure/fit with the Tamil text first, then switch language
    els.forEach(function(e){e.textContent=e.getAttribute('data-ta');});
    fitAll();
    applyLang();
  }

  /* ---------- live data ---------- */
  var S={ev:null,user:undefined,settings:false};
  function setIcons(re,show){[].forEach.call(st.querySelectorAll('img[src*="'+re+'"]'),function(i){i.style.display=show?'':'none';});}
  function setting(k){try{return window.SASettings&&window.SASettings.get(k);}catch(e){return undefined;}}
  function live(){
    var en=lang()==='en';
    // year
    var y=$('sa-year');if(y)y.textContent=new Date().getFullYear();
    // contact (admin setting "support_phone"; optional SA_CONFIG.SUPPORT_EMAIL / setting "support_email")
    var num=String(setting('support_phone')||'').replace(/\D/g,'');
    var ph=$('sa-tb-phone'),pa=$('sa-tb-phone-a');
    if(ph){if(num.length===10){ph.textContent='+91 '+num.slice(0,5)+' '+num.slice(5);pa.setAttribute('href','tel:+91'+num);setIcons('i-phone',true);}else{ph.textContent='';pa.removeAttribute('href');setIcons('i-phone',false);}}
    var em=String(setting('support_email')||(window.SA_CONFIG&&window.SA_CONFIG.SUPPORT_EMAIL)||'').trim();
    var eh=$('sa-tb-email'),ea=$('sa-tb-email-a');
    if(eh){if(em){eh.textContent=em;ea.setAttribute('href','mailto:'+em);setIcons('i-mail',true);}else{eh.textContent='';ea.removeAttribute('href');setIcons('i-mail',false);}}
    // help centre link stays on the site's own Help page
    var hc=$('sa-q-help');if(hc){hc.setAttribute('href','#help');hc.removeAttribute('target');}
    // login state
    var lg=$('sa-tb-login');if(lg){lg.textContent=S.user?(en?'Account':'கணக்கு'):(en?'Login':'Login');}
    // next special day card
    var ne=S.ev;
    if(ne){
      $('sa-ne-mon').textContent=en?EN_MON[ne.m]:TA_MON[ne.m];$('sa-ne-mon').style.fontSize=(!en&&TA_MON[ne.m].length>6)?'14px':'19px';
      $('sa-ne-day').textContent=String(ne.d);$('sa-ne-year').textContent=ne.y;
      $('sa-ne-title').textContent=en?(ne.name_en||ne.name_ta):(ne.name_ta||ne.name_en);
      $('sa-ne-l1').textContent=ne.n<=0?(en?'Today':'இன்று'):ne.n===1?(en?'Tomorrow':'நாளை'):(en?'in '+ne.n+' days':ne.n+' நாட்களில்');
      $('sa-ne-l2').textContent=(en?(ne.note_en||ne.name_en):(ne.note_ta||ne.name_en))||'';
      setIcons('i-clock',true);setIcons('i-pin',true);
    }else{
      $('sa-ne-title').textContent=en?'Next special day':'அடுத்த விசேஷம்';
      setIcons('i-clock',false);setIcons('i-pin',false);
    }
  }
  function load(){
    var DB=window.SADB,P=window.SAPoojas;
    if(window.SASettings&&window.SASettings.ready)window.SASettings.ready().then(live);
    if(window.SAAuth&&window.SAAuth.currentUser)window.SAAuth.currentUser().then(function(u){S.user=u||null;live();}).catch(function(){});
    if(!DB||!P||!DB.rpc)return;
    var today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
    function dn(v){var p=v.split('-');return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/86400000);}
    DB.rpc('sa_pooja_dates',{}).then(function(r){return Array.isArray(r)?r:[];}).catch(function(){return [];})
      .then(function(dates){return Promise.resolve(P.seed()).then(function(vis){return [dates,vis||[]];});})
      .then(function(res){
        var by={};res[1].forEach(function(r){by[r.slug]=r;});
        var list=res[0].filter(function(x){return x.date>=today&&by[x.slug];}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0;});
        if(!list.length)return;
        var f=list[0],r=by[f.slug],p=f.date.split('-');
        S.ev={y:p[0],m:+p[1]-1,d:+p[2],n:dn(f.date)-dn(today),name_ta:r.name_ta,name_en:r.name_en,note_ta:f.note_ta,note_en:f.note_en};
        var o=$('sa-ne-open');if(o)o.setAttribute('href','#poojas/'+encodeURIComponent(r.slug));
        live();
      }).catch(function(){});
  }

  setIcons('i-phone',false);setIcons('i-mail',false);setIcons('i-clock',false);setIcons('i-pin',false);
  scale();
  window.addEventListener('resize',scale);
  window.addEventListener('load',function(){refresh();load();});
  window.addEventListener('hashchange',function(){setTimeout(function(){refresh();},0);});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
  var sec=box.closest('.page');
  if(sec&&window.MutationObserver)new MutationObserver(function(){if(!sec.hidden)refresh();}).observe(sec,{attributes:true,attributeFilter:['hidden']});
  if(window.MutationObserver)new MutationObserver(function(){applyLang();}).observe(root,{attributes:true,attributeFilter:['data-lang']});
})();
