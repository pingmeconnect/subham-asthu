// Kudai API + shopkeeper app. One Cloudflare Worker.
// Secret needed in Cloudflare: SUPABASE_SERVICE_KEY  (Settings > Variables and Secrets > Secret)
const HTML = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1\">\n<meta name=\"theme-color\" content=\"#08323a\"><link rel=\"manifest\" href=\"/manifest.json\"><link rel=\"icon\" href=\"/icon.svg\">\n<title>Kudai</title>\n<style>\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n:root{--ink:#0c2230;--ink2:#3d5563;--mut:#6b8190;--line:#e3e9ee;--bg:#f2f5f8;--pri:#0f766e;--pri2:#0b5d57;--pri3:#14b8a6;--soft:#e6f4f2;--gold:#b88a2b;--gold2:#e8c36a;--red:#b42318;--amber:#b54708;--sh1:0 1px 2px rgba(12,34,48,.05);--sh2:0 1px 2px rgba(12,34,48,.04),0 10px 28px rgba(12,34,48,.07)}\nhtml{-webkit-text-size-adjust:100%}\nbody{margin:0;font-family:\"Inter\",system-ui,-apple-system,\"Segoe UI\",Roboto,\"Noto Sans Tamil\",sans-serif;background:radial-gradient(1200px 500px at 50% -120px,#dff1ee 0,transparent 70%),var(--bg);color:var(--ink);font-size:16px;line-height:1.4;letter-spacing:-.005em;font-variant-numeric:tabular-nums;min-height:100vh}\nheader{background:linear-gradient(120deg,#08323a 0,#0b5d57 55%,#0f766e 100%);color:#fff;padding:11px 14px;display:flex;align-items:center;gap:8px;position:sticky;top:0;z-index:5;box-shadow:0 6px 20px rgba(8,50,58,.28);border-bottom:2px solid var(--gold)}\nheader b{flex:1;font-size:17px;font-weight:700;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\nheader button{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 11px;font-size:14px;transition:background .15s}\nheader button:active{background:rgba(255,255,255,.26)}\nheader button.on{background:#fff;color:var(--pri2);font-weight:700;border-color:#fff}\n#tabs{display:flex;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);position:sticky;top:50px;z-index:4;overflow-x:auto;scrollbar-width:none;padding:0 6px}\n#tabs::-webkit-scrollbar{display:none}\n#tabs button{flex:1 0 auto;border:0;background:none;padding:13px 12px;font-size:15px;font-weight:500;color:var(--mut);border-bottom:3px solid transparent;white-space:nowrap;transition:color .15s}\n#tabs button.on{color:var(--pri);font-weight:700;border-bottom-color:var(--pri)}\nmain{padding:14px;max-width:600px;margin:0 auto;padding-bottom:96px}\ninput,select{width:100%;padding:13px 14px;border:1.5px solid var(--line);border-radius:12px;font-size:16px;background:#fff;color:var(--ink);margin:4px 0;font-family:inherit;transition:border-color .15s,box-shadow .15s;box-shadow:var(--sh1)}\ninput:focus,select:focus{outline:0;border-color:var(--pri);box-shadow:0 0 0 4px rgba(15,118,110,.14)}\n.row{display:flex;gap:8px;align-items:center}.row input{flex:1}\n.btn{background:linear-gradient(180deg,#14877e 0,var(--pri) 100%);color:#fff;border:0;border-radius:12px;padding:13px 16px;font-size:16px;font-weight:650;width:100%;box-shadow:0 1px 0 rgba(255,255,255,.18) inset,0 6px 14px rgba(15,118,110,.28);transition:transform .06s,filter .15s;font-family:inherit}\n.btn:active{transform:translateY(1px) scale(.995);filter:brightness(.95)}\n.btn.sm{width:auto;padding:12px 16px}.btn:disabled{background:#a9c3bf;box-shadow:none}\n.btn.warn{background:linear-gradient(180deg,#d1620f,var(--amber))}.btn.ghost{background:var(--soft);color:var(--pri2);box-shadow:none;border:1px solid #cfe7e3}.btn.red{background:linear-gradient(180deg,#d13a2c,var(--red))}\n.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;margin:12px 0;box-shadow:var(--sh2)}\n.cust{display:flex;justify-content:space-between;gap:8px;align-items:center}\n.cust .n{font-weight:750;font-size:18px;letter-spacing:-.01em}.mut{color:var(--mut);font-size:14px}\n.bal{text-align:right}.bal b{font-size:22px;color:var(--pri);display:block;font-weight:800}\nh3{margin:20px 2px 8px;font-size:12.5px;font-weight:700;color:var(--ink2);text-transform:uppercase;letter-spacing:.09em}\n.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}\n.item{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 8px;display:flex;flex-direction:column;gap:4px;align-items:center;font-size:16px;min-height:78px;justify-content:center;color:var(--ink);box-shadow:var(--sh1);transition:transform .06s,box-shadow .15s}\n.item span{color:var(--pri);font-weight:800}.item:active{background:var(--soft);transform:scale(.98)}\n.line{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid #eef2f5}\n.line .nm{flex:1}.q{display:flex;align-items:center;gap:8px}\n.q button{width:36px;height:36px;border-radius:50%;border:1.5px solid var(--line);background:#fff;font-size:18px;color:var(--pri2)}\n.tot{display:flex;justify-content:space-between;font-size:24px;font-weight:800;padding:12px 0;letter-spacing:-.02em}\n.chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}\n.chips button{padding:10px 15px;border-radius:999px;border:1.5px solid #bfe0db;background:#fff;color:var(--pri2);font-size:16px;font-weight:600}\n.chips button.on{background:var(--pri);color:#fff;border-color:var(--pri);box-shadow:0 4px 10px rgba(15,118,110,.25)}\n.ok{background:linear-gradient(180deg,#effaf5,#e6f6ef);border-color:#a8dcc3}\n#toast{position:fixed;left:12px;right:12px;bottom:18px;max-width:560px;margin:auto;padding:14px 16px;border-radius:14px;background:rgba(12,34,48,.96);color:#fff;text-align:center;z-index:9;display:none;font-weight:600;box-shadow:0 14px 34px rgba(12,34,48,.4)}\n#toast.bad{background:rgba(180,35,24,.97)}\n.login{max-width:400px;margin:9vh auto;padding:28px 24px;background:rgba(255,255,255,.94);border:1px solid var(--line);border-radius:24px;box-shadow:0 24px 60px rgba(12,34,48,.14),0 2px 6px rgba(12,34,48,.05)}\n.login .mark{width:58px;height:58px;border-radius:18px;background:linear-gradient(135deg,#08323a,#0f766e);color:var(--gold2);display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:12px;box-shadow:0 10px 22px rgba(15,118,110,.35),inset 0 0 0 1.5px rgba(232,195,106,.55)}\n.login h1{margin:0;color:var(--ink);font-size:32px;font-weight:800;letter-spacing:-.03em}\n.login p{margin:4px 0 20px;color:var(--mut)}.login .btn{margin-top:12px}.lg{text-align:center;margin-top:18px}\n.lg button{border:1.5px solid var(--line);background:#fff;border-radius:10px;padding:7px 13px;margin:0 4px;color:var(--ink2)}.lg button.on{background:var(--pri);color:#fff;border-color:var(--pri)}\n.tx{display:flex;justify-content:space-between;gap:8px;padding:11px 0;border-bottom:1px solid #eef2f5;align-items:center}.tx:last-child{border-bottom:0}\n.pos{color:var(--pri);font-weight:750}.neg{color:var(--red);font-weight:750}\n#snack{position:fixed;left:12px;right:12px;bottom:78px;max-width:560px;margin:auto;background:rgba(12,34,48,.97);color:#fff;border-radius:14px;padding:11px 14px;display:none;justify-content:space-between;align-items:center;z-index:8;box-shadow:0 14px 34px rgba(12,34,48,.4)}\n#snack button{background:#fff;color:var(--pri2);border:0;border-radius:9px;padding:8px 14px;font-weight:750}\n.tiles{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}\n.tile{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px;text-align:left;display:flex;flex-direction:column;gap:2px;color:var(--ink);font-size:15px;box-shadow:var(--sh1);transition:transform .06s}\n.tile:active{background:var(--soft);transform:scale(.985)}.tile.done{background:#effaf5;border-color:#a8dcc3}\n.tn{font-weight:750;font-size:16px}.ck{color:var(--pri)}.tu{color:var(--mut);font-size:13px}.tb{font-weight:750;color:var(--pri)}.tb.low{color:var(--amber)}\n#sub{display:flex;gap:6px;padding:9px 12px;background:rgba(238,246,244,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);position:sticky;top:98px;z-index:3;overflow-x:auto;scrollbar-width:none}#sub:empty{display:none}#sub button{border:1.5px solid #cfe3df;background:#fff;border-radius:999px;padding:6px 14px;color:var(--pri2);white-space:nowrap;font-weight:600}#sub button.on{background:var(--pri);color:#fff;border-color:var(--pri)}\n.kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:10px 0}.kp{background:linear-gradient(180deg,#fff,#f7fafb);border:1px solid var(--line);border-radius:14px;padding:11px 12px}.kp span{display:block;color:var(--mut);font-size:12.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}.kp b{font-size:21px;font-weight:800;color:var(--ink);letter-spacing:-.02em}\n.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:4px 0 6px}\n.stat{background:linear-gradient(150deg,#0b3f45 0,#0f766e 100%);color:#fff;border-radius:16px;padding:13px 14px;box-shadow:0 10px 22px rgba(15,118,110,.22);position:relative;overflow:hidden}\n.stat:after{content:\"\";position:absolute;right:-18px;top:-18px;width:70px;height:70px;border-radius:50%;background:rgba(232,195,106,.18)}\n.stat span{display:block;font-size:12px;font-weight:650;text-transform:uppercase;letter-spacing:.06em;opacity:.82}.stat b{display:block;font-size:22px;font-weight:800;margin-top:3px;letter-spacing:-.02em;word-break:break-word}\n.att{border-left:5px solid #9bb3bd}.att.bad{border-left-color:var(--red)}.att.warn{border-left-color:#e8a02b}\n.atth{display:flex;justify-content:space-between;align-items:center;font-weight:750;margin-bottom:6px}\n.pill{background:var(--ink);color:#fff;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:700}.att.bad .pill{background:var(--red)}.att.warn .pill{background:var(--amber)}\n.arow{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid #eef2f5;cursor:pointer;align-items:center}.arow .mut{text-align:right;font-size:13px}\n.hr{display:flex;align-items:center;gap:8px;padding:3px 0}.hr span{width:48px;color:var(--mut);font-size:13px}.hr i{display:block;height:10px;background:linear-gradient(90deg,var(--pri),var(--pri3));border-radius:5px}.hr b{margin-left:auto;font-size:13px}\n@media(min-width:900px){main{max-width:760px}.stats{grid-template-columns:repeat(4,1fr)}.kpis{grid-template-columns:repeat(4,1fr)}#tabs{justify-content:center}}\n@media print{header,#tabs,#sub,.noprint,#unsent,#snack,#toast{display:none!important}body{background:#fff}main{max-width:none;padding:0}.card{box-shadow:none}}\nlabel.ck{display:flex;gap:8px;align-items:center;margin:8px 0}label.ck input{width:auto;box-shadow:none}\n</style></head><body>\n<div id=\"app\"></div><div id=\"snack\"></div><div id=\"toast\"></div>\n<script>\nconst T={\nen:{tagline:'Wallet & loyalty for your shop',email:'Email',password:'Password',signin:'Sign in',logout:'Log out',\nbill:'Bill',members:'Members',menu:'Menu',recent:'Recent',findph:'Name, mobile or ID',search:'Search',\nbalance:'Balance',points:'Points',total:'Total',charge:'Charge',confirm:'Tap again to confirm',clear:'Clear',\nother:'Other amount (₹)',undo:'Undo',addmoney:'Add money to wallet',received:'Money received',bonus:'Bonus',\nwalletget:'Wallet gets',newmember:'New member',name:'Name',mobile:'Mobile number',emailopt:'Email (optional)',\naddress:'Address (optional)',language:'Customer language',offersok:'OK to send offers',save:'Save',additem:'Add menu item',\nitemen:'Item name (English)',itemta:'Item name (Tamil, optional)',price:'Price (₹)',del:'Delete',\nnoitems:'No menu items yet. Add them in the Menu tab.',nocust:'Find a member first',nothing:'Nothing yet',\ncharged:'Charged',newbal:'New balance',earned:'points earned',added:'Added to wallet',registered:'Member registered',\nsaved:'Saved',deleted:'Deleted',undone:'Undone',walkin:'Find a member to bill',\ncashnote:'Tap the amount, choose how the customer paid, then confirm.',\ne_insufficient_balance:'Not enough balance',e_customer_not_found:'Member not found',\ne_undo_window_over:'Undo time (5 minutes) is over',e_invalid_amount:'Invalid amount',e_shop_inactive:'Shop is not active',\ne_duplicate_mobile:'This mobile number is already registered',e_invalid_mobile:'Enter a valid 10-digit mobile number',\ne_name_required:'Name is required',e_bad_login:'Wrong email or password',e_not_reversible:'This cannot be undone',\ne_no_shop:'This login is not linked to a shop',e_owner_only:'Only the owner can do this',\ne_server_error:'Something went wrong. Please try again',e_server_not_configured:'Server key is not set yet',\ntype_RECHARGE:'Money added',type_DEDUCT:'Bill',type_REVERSAL:'Undo',type_POINTS_REDEEM:'Points used',noitemsedit:'No items',today:'Today',pendingreq:'Recharge requests',nopending:'No waiting requests',approve:'Money received — Add',expired:'expired',left:'left',\nsum:'Today so far',s_recharge:'Money added to wallets',s_bonus:'Bonus given',s_spent:'Wallet spent',s_points:'Points given',s_upi:'UPI received',s_unm:'UPI not matched',s_new:'New members',s_liab:'Wallet balance owed to customers',s_undo:'Bills undone',\ncustlink:'Customer wallet link',copy:'Copy',copied:'Link copied',upi:'Shop UPI ID (for customer payments)',upiph:'name@bank',pincode:'Customer app code',codeinfo:'Give this code to the customer. Valid 10 minutes.',\nvoiceon:'Voice on',voiceoff:'Voice off',e_invalid_upi:'Enter a valid UPI ID like name@bank',e_not_found:'Not found',e_not_pending:'Already processed',e_too_many:'Too many requests',\nregulars:'Regulars',noregs:'Regulars appear here after their first bills.',again:'Already charged {a} {m} min ago. Charge again?',e_recent_bill:'Not charged',e_invalid_item:'This item is not on the menu any more',cash:'Cash',upi:'UPI',wacon:'Customer agrees to WhatsApp updates',redeem:'Redeem points',s_cash:'Cash added',s_upiadd:'UPI added',e_not_enough_points:'Not enough points',e_invalid_method:'Choose cash or UPI',say_bill:'{a} rupees received from {n}',say_add:'{a} rupees added to wallet of {n}',say_req:'Recharge request, {a} rupees, from {n}'},\nta:{tagline:'உங்கள் கடைக்கான வாலட் & லாயல்டி',email:'மின்னஞ்சல்',password:'கடவுச்சொல்',signin:'உள்நுழைக',logout:'வெளியேறு',\nbill:'பில்',members:'உறுப்பினர்கள்',menu:'மெனு',recent:'சமீபத்தியவை',findph:'பெயர், மொபைல் அல்லது ஐடி',search:'தேடு',\nbalance:'இருப்பு',points:'புள்ளிகள்',total:'மொத்தம்',charge:'வசூலிக்க',confirm:'உறுதிசெய்ய மீண்டும் தொடவும்',clear:'அழி',\nother:'வேறு தொகை (₹)',undo:'ரத்து செய்',addmoney:'வாலட்டில் பணம் சேர்க்க',received:'பணம் பெறப்பட்டது',bonus:'போனஸ்',\nwalletget:'வாலட்டில் சேரும்',newmember:'புதிய உறுப்பினர்',name:'பெயர்',mobile:'மொபைல் எண்',emailopt:'மின்னஞ்சல் (விருப்பம்)',\naddress:'முகவரி (விருப்பம்)',language:'வாடிக்கையாளர் மொழி',offersok:'சலுகைகள் அனுப்பலாம்',save:'சேமி',additem:'மெனு பொருள் சேர்க்க',\nitemen:'பொருள் பெயர் (ஆங்கிலம்)',itemta:'பொருள் பெயர் (தமிழ், விருப்பம்)',price:'விலை (₹)',del:'நீக்கு',\nnoitems:'மெனு பொருட்கள் இல்லை. மெனு தாவலில் சேர்க்கவும்.',nocust:'முதலில் உறுப்பினரைத் தேடவும்',nothing:'இன்னும் எதுவும் இல்லை',\ncharged:'வசூலிக்கப்பட்டது',newbal:'புதிய இருப்பு',earned:'புள்ளிகள் கிடைத்தன',added:'வாலட்டில் சேர்க்கப்பட்டது',registered:'உறுப்பினர் பதிவு செய்யப்பட்டார்',\nsaved:'சேமிக்கப்பட்டது',deleted:'நீக்கப்பட்டது',undone:'ரத்து செய்யப்பட்டது',walkin:'பில் போட உறுப்பினரைத் தேடவும்',\ncashnote:'தொகையைத் தொட்டு, எப்படி செலுத்தினார் என்பதைத் தேர்ந்தெடுத்து, உறுதிசெய்யவும்.',\ne_insufficient_balance:'இருப்பு போதாது',e_customer_not_found:'உறுப்பினர் கிடைக்கவில்லை',\ne_undo_window_over:'ரத்து செய்யும் நேரம் (5 நிமிடம்) முடிந்தது',e_invalid_amount:'தவறான தொகை',e_shop_inactive:'கடை செயலில் இல்லை',\ne_duplicate_mobile:'இந்த மொபைல் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது',e_invalid_mobile:'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',\ne_name_required:'பெயர் அவசியம்',e_bad_login:'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறு',e_not_reversible:'இதை ரத்து செய்ய முடியாது',\ne_no_shop:'இந்த உள்நுழைவு எந்த கடையுடனும் இணைக்கப்படவில்லை',e_owner_only:'உரிமையாளர் மட்டுமே இதைச் செய்யலாம்',\ne_server_error:'ஏதோ தவறு நடந்தது. மீண்டும் முயலவும்',e_server_not_configured:'சர்வர் கீ இன்னும் அமைக்கப்படவில்லை',\ntype_RECHARGE:'பணம் சேர்க்கப்பட்டது',type_DEDUCT:'பில்',type_REVERSAL:'ரத்து',type_POINTS_REDEEM:'புள்ளிகள் பயன்பாடு',noitemsedit:'பொருட்கள் இல்லை',today:'இன்று',pendingreq:'ரீசார்ஜ் கோரிக்கைகள்',nopending:'காத்திருக்கும் கோரிக்கை இல்லை',approve:'பணம் பெறப்பட்டது — சேர்',expired:'காலாவதி',left:'மீதம்',\nsum:'இன்றைய நிலவரம்',s_recharge:'வாலட்டில் சேர்த்த பணம்',s_bonus:'வழங்கிய போனஸ்',s_spent:'வாலட் செலவு',s_points:'வழங்கிய புள்ளிகள்',s_upi:'UPI வரவு',s_unm:'பொருந்தாத UPI',s_new:'புதிய உறுப்பினர்கள்',s_liab:'வாடிக்கையாளர்களுக்கு தர வேண்டிய வாலட் இருப்பு',s_undo:'ரத்து செய்த பில்கள்',\ncustlink:'வாடிக்கையாளர் வாலட் இணைப்பு',copy:'நகலெடு',copied:'இணைப்பு நகலெடுக்கப்பட்டது',upi:'கடை UPI ஐடி (வாடிக்கையாளர் பணம் செலுத்த)',upiph:'name@bank',pincode:'வாடிக்கையாளர் ஆப் குறியீடு',codeinfo:'இந்தக் குறியீட்டை வாடிக்கையாளரிடம் கொடுக்கவும். 10 நிமிடம் செல்லும்.',\nvoiceon:'குரல் இயக்கம்',voiceoff:'குரல் நிறுத்தம்',e_invalid_upi:'name@bank போன்ற சரியான UPI ஐடி உள்ளிடவும்',e_not_found:'கிடைக்கவில்லை',e_not_pending:'ஏற்கனவே செயல்படுத்தப்பட்டது',e_too_many:'அதிக கோரிக்கைகள்',\nregulars:'வழக்கமான வாடிக்கையாளர்கள்',noregs:'முதல் பில்களுக்குப் பிறகு இங்கே தோன்றுவார்கள்.',again:'ஏற்கனவே {a} வசூலிக்கப்பட்டது ({m} நிமிடம் முன்பு). மீண்டும் வசூலிக்கவா?',e_recent_bill:'வசூலிக்கப்படவில்லை',e_invalid_item:'இந்தப் பொருள் மெனுவில் இல்லை',cash:'ரொக்கம்',upi:'UPI',wacon:'வாடிக்கையாளர் WhatsApp செய்திகளுக்கு சம்மதித்தார்',redeem:'புள்ளிகளைப் பயன்படுத்து',s_cash:'ரொக்கமாகச் சேர்த்தது',s_upiadd:'UPI மூலம் சேர்த்தது',e_not_enough_points:'புள்ளிகள் போதாது',e_invalid_method:'ரொக்கம் அல்லது UPI தேர்வு செய்யவும்',say_bill:'{n} இடமிருந்து {a} ரூபாய் பெறப்பட்டது',say_add:'{n} வாலட்டில் {a} ரூபாய் சேர்க்கப்பட்டது',say_req:'{n} இடமிருந்து {a} ரூபாய் ரீசார்ஜ் கோரிக்கை'}};\n\nObject.assign(T.en,{forgot:'Forgot password?',forgoth:'Enter your login email. We will send a link to set a new password.',sendlink:'Send link',linksent:'If this email is registered, a link has been sent. Check your inbox and spam.',newpw:'New password (8+ letters)',setpw:'Save new password',pwdone:'Password changed. Please sign in.',resetpw:'Reset password',newpwfor:'New password for this person (8+ letters):',e_link_expired:'This link has expired. Ask for a new one.',settings:'Settings',alertsh:'WhatsApp alerts to customers',al_welcome:'Welcome (new member)',al_recharge:'Money added',al_bill:'Every bill',al_low:'Low balance warning',al_reversal:'Bill undone',al_redeem:'Points used',\nlowbal:'Low balance limit (₹)',footer:'Line under every message (place / city / pincode)',footerph:'e.g. Madambakkam, Chennai 600126',preview:'See how messages look',msglog:'Latest alerts',nomsg:'No alerts yet',\nstaffh:'Your team',staffadd:'Add a person',staffname:'Name',staffpw:'Password (8+ letters)',staffof:'people (max {m})',remove:'Remove',owner:'Owner',addperson:'Add person',alertson:'WhatsApp alerts for this customer',\nunsent:'bills waiting to send',savedoff:'No network. Bill saved and will be sent automatically.',last4:'Last 4 digits, ID or name',usual:'Usual',queued:'queued',\ne_invalid_email:'Enter a valid email',e_weak_password:'Password must be 8 or more characters',e_staff_limit:'Team limit reached. Ask Kudai to raise it.',e_email_in_use:'This email is already used',e_staff_create_failed:'Could not add this person',e_cannot_remove_self:'You cannot remove yourself',e_nothing_to_change:'Nothing to change',back:'Back'});\nObject.assign(T.ta,{forgot:'கடவுச்சொல் மறந்துவிட்டதா?',forgoth:'உள்நுழையும் மின்னஞ்சலை உள்ளிடவும். புதிய கடவுச்சொல் அமைக்க இணைப்பு அனுப்புவோம்.',sendlink:'இணைப்பு அனுப்பு',linksent:'இந்த மின்னஞ்சல் பதிவில் இருந்தால் இணைப்பு அனுப்பப்பட்டது. Inbox மற்றும் spam பார்க்கவும்.',newpw:'புதிய கடவுச்சொல் (8+ எழுத்துகள்)',setpw:'புதிய கடவுச்சொல்லைச் சேமி',pwdone:'கடவுச்சொல் மாற்றப்பட்டது. உள்நுழையவும்.',resetpw:'கடவுச்சொல் மாற்று',newpwfor:'இவருக்கான புதிய கடவுச்சொல் (8+ எழுத்துகள்):',e_link_expired:'இந்த இணைப்பு காலாவதியானது. புதிதாகக் கோரவும்.',settings:'அமைப்புகள்',alertsh:'வாடிக்கையாளருக்கு WhatsApp அறிவிப்புகள்',al_welcome:'வரவேற்பு (புதிய உறுப்பினர்)',al_recharge:'பணம் சேர்த்தல்',al_bill:'ஒவ்வொரு பில்',al_low:'குறைந்த இருப்பு எச்சரிக்கை',al_reversal:'பில் ரத்து',al_redeem:'புள்ளிகள் பயன்பாடு',\nlowbal:'குறைந்த இருப்பு வரம்பு (₹)',footer:'ஒவ்வொரு செய்தியின் கீழ் வரி (ஊர் / நகரம் / பின்கோடு)',footerph:'எ.கா. மடம்பாக்கம், சென்னை 600126',preview:'செய்திகள் எப்படி இருக்கும் என்று பார்க்க',msglog:'சமீபத்திய அறிவிப்புகள்',nomsg:'இன்னும் அறிவிப்புகள் இல்லை',\nstaffh:'உங்கள் குழு',staffadd:'ஒருவரைச் சேர்க்க',staffname:'பெயர்',staffpw:'கடவுச்சொல் (8+ எழுத்துகள்)',staffof:'பேர் (அதிகபட்சம் {m})',remove:'நீக்கு',owner:'உரிமையாளர்',addperson:'சேர்',alertson:'இந்த வாடிக்கையாளருக்கு WhatsApp அறிவிப்பு',\nunsent:'பில்கள் அனுப்ப காத்திருக்கின்றன',savedoff:'நெட்வொர்க் இல்லை. பில் சேமிக்கப்பட்டது, தானாக அனுப்பப்படும்.',last4:'கடைசி 4 இலக்கம், ஐடி அல்லது பெயர்',usual:'வழக்கமானது',queued:'காத்திருக்கிறது',\ne_invalid_email:'சரியான மின்னஞ்சலை உள்ளிடவும்',e_weak_password:'கடவுச்சொல் 8 அல்லது அதற்கு மேல் எழுத்துகள் வேண்டும்',e_staff_limit:'குழு வரம்பு முடிந்தது. Kudai-யிடம் உயர்த்தச் சொல்லவும்.',e_email_in_use:'இந்த மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் உள்ளது',e_staff_create_failed:'இவரைச் சேர்க்க முடியவில்லை',e_cannot_remove_self:'உங்களை நீக்க முடியாது',e_nothing_to_change:'மாற்றம் ஏதுமில்லை',back:'திரும்ப'});\nObject.assign(T.en,{sub_offers:'Offers',admin:'Admin',reports:'Reports',staffmode:'Staff',ownermode:'Owner',mobile10:'Mobile number',pin4:'4-digit PIN',\nlock:'Lock',unlocktxt:'Enter your PIN to continue',unlock:'Unlock',adminpin:'Admin PIN',adminpinh:'Enter your 4-digit admin PIN',makepin:'Create your 4-digit admin PIN',makepinh:'This PIN protects reports, settings and team. Only you will know it.',pinagain:'Repeat PIN',forgotpin:'Forgot PIN?',forgotpinh:'Enter your login password and a new PIN',newpin:'New PIN',setpin:'Save PIN',enter:'Open',\nstaffpin:'PIN (leave empty to auto-create)',newpinbtn:'New PIN',pinshown:'PIN for {n}: {p}. Tell him now. It is not shown again.',\nsub_reports:'Reports',sub_menu:'Menu',sub_settings:'Settings',since:'Since last close',closeday:'Close day',reopen:'Reopen last close',closed:'Day closed. Report saved.',reopened:'Reopened',closeq:'Close the day now? Later bills go to the next day.',reopenq:'Reopen the last close?',\nr_sales:'Wallet sales',r_bills:'Bills',r_added:'Money added',r_members:'New members',r_owed:'Wallet balance owed',r_gross:'Gross sales',r_corr:'Corrections (earlier bills undone)',r_cash:'Cash',r_upi:'UPI',r_bonus:'Bonus given',r_pts:'Points given',r_ptsr:'Points used',r_undo:'Bills undone',\nr_items:'Items sold',r_staff:'By person',r_hours:'By hour',r_top:'Top customers',r_low:'Low balance customers',r_none:'None',r_note:'Sales shown are wallet bills only (not walk-in cash sales).',csv:'Download Excel (CSV)',print:'Print / PDF',share:'Share',history:'Earlier closes',revised:'Revised',\ne_admin_locked:'Enter your admin PIN',e_pin_required:'Master PIN needed for this action',e_pin_locked:'Too many wrong PINs. Try after 15 minutes.',e_admin_pin_not_set:'Create your admin PIN first',e_wrong_pin:'Wrong PIN',e_locked:'Too many wrong tries. Try after 5 minutes.',e_bad_pin:'PIN must be 4 digits',e_mobile_in_use:'This mobile number is already added',e_nothing_to_reopen:'Nothing to reopen',e_reopen_window_over:'Reopen is only allowed within 3 days',e_shop_inactive:'This shop is not active',\nsendstaff:'Staff login: mobile + PIN',ownerlogin:'Owner login: email + password'});\nObject.assign(T.ta,{sub_offers:'சலுகைகள்',admin:'நிர்வாகம்',reports:'அறிக்கைகள்',staffmode:'ஊழியர்',ownermode:'உரிமையாளர்',mobile10:'மொபைல் எண்',pin4:'4 இலக்க PIN',\nlock:'பூட்டு',unlocktxt:'தொடர உங்கள் PIN-ஐ உள்ளிடவும்',unlock:'திற',adminpin:'Admin PIN',adminpinh:'உங்கள் 4 இலக்க Admin PIN-ஐ உள்ளிடவும்',makepin:'உங்கள் 4 இலக்க Admin PIN-ஐ உருவாக்குங்கள்',makepinh:'இந்த PIN அறிக்கைகள், அமைப்புகள், குழுவைப் பாதுகாக்கும். உங்களுக்கு மட்டுமே தெரியும்.',pinagain:'PIN மீண்டும்',forgotpin:'PIN மறந்துவிட்டதா?',forgotpinh:'உங்கள் உள்நுழைவு கடவுச்சொல்லையும் புதிய PIN-ஐயும் உள்ளிடவும்',newpin:'புதிய PIN',setpin:'PIN சேமி',enter:'திற',\nstaffpin:'PIN (காலியாக விட்டால் தானாக உருவாகும்)',newpinbtn:'புதிய PIN',pinshown:'{n} PIN: {p}. இப்போதே அவரிடம் சொல்லவும். மீண்டும் காட்டப்படாது.',\nsub_reports:'அறிக்கைகள்',sub_menu:'மெனு',sub_settings:'அமைப்புகள்',since:'கடைசி முடிப்பிலிருந்து',closeday:'நாளை முடி',reopen:'கடைசி முடிப்பை மீண்டும் திற',closed:'நாள் முடிக்கப்பட்டது. அறிக்கை சேமிக்கப்பட்டது.',reopened:'மீண்டும் திறக்கப்பட்டது',closeq:'இப்போது நாளை முடிக்கவா? இனி வரும் பில்கள் அடுத்த நாளுக்குப் போகும்.',reopenq:'கடைசி முடிப்பை மீண்டும் திறக்கவா?',\nr_sales:'வாலட் விற்பனை',r_bills:'பில்கள்',r_added:'சேர்த்த பணம்',r_members:'புதிய உறுப்பினர்',r_owed:'வாடிக்கையாளருக்குத் தர வேண்டிய வாலட்',r_gross:'மொத்த விற்பனை',r_corr:'திருத்தங்கள் (முந்தைய பில் ரத்து)',r_cash:'பணம்',r_upi:'UPI',r_bonus:'வழங்கிய போனஸ்',r_pts:'வழங்கிய புள்ளிகள்',r_ptsr:'பயன்படுத்திய புள்ளிகள்',r_undo:'ரத்தான பில்கள்',\nr_items:'விற்ற பொருட்கள்',r_staff:'நபர் வாரியாக',r_hours:'மணி வாரியாக',r_top:'முதன்மை வாடிக்கையாளர்கள்',r_low:'இருப்பு குறைந்தவர்கள்',r_none:'எதுவுமில்லை',r_note:'காட்டப்படும் விற்பனை வாலட் பில்கள் மட்டுமே (நேரடிப் பண விற்பனை அல்ல).',csv:'Excel (CSV) பதிவிறக்கு',print:'அச்சு / PDF',share:'பகிர்',history:'முந்தைய முடிப்புகள்',revised:'திருத்தப்பட்டது',\ne_admin_locked:'உங்கள் Admin PIN-ஐ உள்ளிடவும்',e_pin_required:'இந்தச் செயலுக்கு Master PIN தேவை',e_pin_locked:'தவறான PIN அதிகம். 15 நிமிடம் கழித்து முயலவும்.',e_admin_pin_not_set:'முதலில் Admin PIN உருவாக்கவும்',e_wrong_pin:'PIN தவறு',e_locked:'பல தவறுகள். 5 நிமிடம் கழித்து முயலவும்.',e_bad_pin:'PIN 4 இலக்கமாக இருக்க வேண்டும்',e_mobile_in_use:'இந்த மொபைல் எண் ஏற்கனவே சேர்க்கப்பட்டுள்ளது',e_nothing_to_reopen:'மீண்டும் திறக்க எதுவுமில்லை',e_reopen_window_over:'3 நாட்களுக்குள் மட்டுமே மீண்டும் திறக்கலாம்',e_shop_inactive:'இந்தக் கடை செயலில் இல்லை',\nsendstaff:'ஊழியர் உள்நுழைவு: மொபைல் + PIN',ownerlogin:'உரிமையாளர் உள்நுழைவு: email + கடவுச்சொல்'});\nObject.assign(T.en,{e_bad_staff:'Wrong mobile number or PIN',master:'Master',m_shops:'Shops',m_new:'New shop',m_month:'Month',m_cust:'Customers',m_staff:'Team',m_alerts:'WhatsApp alerts',m_bills:'Bills',m_sales:'Wallet sales',m_owed:'Wallet owed',m_active:'Active',m_susp:'Suspended',m_manage:'Manage',m_save:'Save',m_maxstaff:'Max people (owner + employees)',m_limit:'Monthly alert allowance',m_suspend:'Suspend shop',m_activate:'Activate shop',m_suspq:'Suspend this shop? Nobody there can bill until you activate it again.',m_ownerpw:'New owner password',m_ownerpwq:'New password for the owner (8+ letters):',m_resetpin:'Reset owner admin PIN',m_resetpinq:'Reset the owner admin PIN? He will create a new one.',m_done:'Done',\nm_shopname:'Shop name',m_cat:'Shop type',m_ownername:'Owner name',m_ownerphone:'Owner mobile',m_ownermail:'Owner email (his login)',m_pw:'Password (8+ letters)',m_gen:'Make password',m_create:'Create shop',m_created:'Shop created. Send these login details to the owner:',m_copy:'Copy',m_none:'No shops yet',m_lastact:'Last bill',m_shopapp:'Shop app',\ne_not_master:'This login is not a master admin',e_owner_required:'Owner name is required',e_create_failed:'Could not create. Try again',e_email_in_use:'This email is already used'});\nObject.assign(T.ta,{e_bad_staff:'மொபைல் எண் அல்லது PIN தவறு',master:'மாஸ்டர்',m_shops:'கடைகள்',m_new:'புதிய கடை',m_month:'மாதம்',m_cust:'வாடிக்கையாளர்கள்',m_staff:'குழு',m_alerts:'WhatsApp அறிவிப்புகள்',m_bills:'பில்கள்',m_sales:'வாலட் விற்பனை',m_owed:'வாலட் நிலுவை',m_active:'செயலில்',m_susp:'நிறுத்தப்பட்டது',m_manage:'நிர்வகி',m_save:'சேமி',m_maxstaff:'அதிகபட்ச நபர்கள் (உரிமையாளர் + ஊழியர்)',m_limit:'மாதாந்திர அறிவிப்பு அளவு',m_suspend:'கடையை நிறுத்து',m_activate:'கடையை இயக்கு',m_suspq:'இந்தக் கடையை நிறுத்தவா? மீண்டும் இயக்கும் வரை யாரும் பில் போட முடியாது.',m_ownerpw:'உரிமையாளருக்குப் புதிய கடவுச்சொல்',m_ownerpwq:'உரிமையாளருக்குப் புதிய கடவுச்சொல் (8+ எழுத்துகள்):',m_resetpin:'உரிமையாளர் Admin PIN மீட்டமை',m_resetpinq:'இவரது Admin PIN-ஐ மீட்டமைக்கவா? அவர் புதியது உருவாக்குவார்.',m_done:'முடிந்தது',\nm_shopname:'கடை பெயர்',m_cat:'கடை வகை',m_ownername:'உரிமையாளர் பெயர்',m_ownerphone:'உரிமையாளர் மொபைல்',m_ownermail:'உரிமையாளர் email (அவர் உள்நுழைவு)',m_pw:'கடவுச்சொல் (8+ எழுத்துகள்)',m_gen:'கடவுச்சொல் உருவாக்கு',m_create:'கடையை உருவாக்கு',m_created:'கடை உருவானது. இந்த உள்நுழைவு விவரங்களை உரிமையாளருக்கு அனுப்பவும்:',m_copy:'நகலெடு',m_none:'இன்னும் கடைகள் இல்லை',m_lastact:'கடைசிப் பில்',m_shopapp:'கடை app',\ne_not_master:'இந்த உள்நுழைவு மாஸ்டர் நிர்வாகி அல்ல',e_owner_required:'உரிமையாளர் பெயர் அவசியம்',e_create_failed:'உருவாக்க முடியவில்லை. மீண்டும் முயலவும்',e_email_in_use:'இந்த email ஏற்கனவே பயன்பாட்டில் உள்ளது'});\nconst S={tok:null,rt:null,me:null,lang:null,tab:'bill',cust:null,cart:{},menu:[],last:null,arm:0,amt:0,method:'CASH',voice:0,regs:[],res:[],adm:null,admAt:0,rep:null,busy:0,pend:[],seen:{},polled:0,armId:null,code:null};\nconst $=s=>document.querySelector(s);\nconst esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\nconst t=k=>(T[S.lang]&&T[S.lang][k])||T.en[k]||k;\nconst rs=p=>'₹'+(p/100).toLocaleString('en-IN',{minimumFractionDigits:p%100?2:0,maximumFractionDigits:2});\nconst nm=m=>(S.lang==='ta'&&m.name_ta)?m.name_ta:m.name_en;\nconst err=e=>t('e_'+((e&&e.error)||'server_error'));\nfunction load(){try{const o=JSON.parse(localStorage.getItem('kudai')||'{}');S.tok=o.tok||null;S.rt=o.rt||null;S.lang=o.lang||null;S.voice=o.voice?1:0}catch(e){}}\nfunction save(){try{localStorage.setItem('kudai',JSON.stringify({tok:S.tok,rt:S.rt,lang:S.lang,voice:S.voice}))}catch(e){}}\nlet tt;function toast(m,bad){const e=$('#toast');e.textContent=m;e.className=bad?'bad':'';e.style.display='block';clearTimeout(tt);tt=setTimeout(()=>e.style.display='none',3200)}\n\nasync function refresh(){if(!S.rt)return false;try{const r=await fetch('/api/refresh',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({refresh_token:S.rt})});if(!r.ok)return false;const d=await r.json();S.tok=d.access_token;S.rt=d.refresh_token;save();return true}catch(e){return false}}\nasync function api(path,o){o=o||{};const h={'content-type':'application/json'};if(S.tok)h.authorization='Bearer '+S.tok;if(S.adm){h['x-admin']=S.adm;S.admAt=Date.now()}if(S.mtok&&path.startsWith('/api/m/'))h['x-mpin']=S.mtok\n const r=await fetch(path,{method:o.method||'GET',headers:h,body:o.body?JSON.stringify(o.body):undefined});\n if(r.status===401&&S.rt&&!o.retry&&path!=='/api/login'){if(await refresh())return api(path,Object.assign({},o,{retry:1}));}\n const d=await r.json().catch(()=>({}));if(!r.ok){if(d&&d.error==='admin_locked'){S.adm=null;if(ADMINP.includes(S.tab))gate(S.tab)}\n  if(d&&d.error==='pin_required'&&!o.pinretry){S.mtok=null;if(await askMpin())return api(path,Object.assign({},o,{pinretry:1}))}throw d}return d}\n\nfunction langBtns(){return `<button class=\"${S.lang==='en'?'on':''}\" onclick=\"setLang('en')\">EN</button><button class=\"${S.lang==='ta'?'on':''}\" onclick=\"setLang('ta')\">தமிழ்</button>`}\nfunction setLang(l){S.lang=l;save();if(S.mview)masterMain();else S.me?main():login()}\nfunction logoutStop(){clearInterval(S.pt);if(S.wl){try{S.wl.release()}catch(e){}S.wl=null}}\nfunction logout(){logoutStop();S.tok=S.rt=null;S.me=null;S.adm=null;S.cust=null;S.cart={};save();login()}\n\nfunction login(mode){mode=mode||S.lmode||'staff';S.lmode=mode;\n $('#app').innerHTML=`<div class=\"login\"><div class=\"mark\">☂</div><h1>Kudai</h1><p>${t('tagline')}</p>\n<div class=\"chips\" style=\"margin-bottom:6px\"><button class=\"${mode==='staff'?'on':''}\" onclick=\"login('staff')\">${t('staffmode')}</button><button class=\"${mode==='owner'?'on':''}\" onclick=\"login('owner')\">${t('ownermode')}</button></div>\n${mode==='staff'?`<input id=\"sm\" inputmode=\"numeric\" maxlength=\"12\" placeholder=\"${t('mobile10')}\" autocomplete=\"username\"><input id=\"sp\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('pin4')}\" autocomplete=\"current-password\" onkeydown=\"if(event.key==='Enter')doPinLogin()\"><button class=\"btn\" onclick=\"doPinLogin()\">${t('signin')}</button>`\n :`<input id=\"em\" type=\"email\" placeholder=\"${t('email')}\" autocomplete=\"username\"><input id=\"pw\" type=\"password\" placeholder=\"${t('password')}\" autocomplete=\"current-password\" onkeydown=\"if(event.key==='Enter')doLogin()\"><button class=\"btn\" onclick=\"doLogin()\">${t('signin')}</button><div class=\"lg\"><a href=\"#\" onclick=\"forgotUI();return false\" style=\"color:#0f766e\">${t('forgot')}</a></div>`}\n<div class=\"lg\">${langBtns()}</div></div>`}\nfunction forgotUI(){$('#app').innerHTML=`<div class=\"login\"><div class=\"mark\">☂</div><h1>Kudai</h1><p>${t('forgoth')}</p><input id=\"fe\" type=\"email\" placeholder=\"${t('email')}\" autocapitalize=\"none\"><button class=\"btn\" onclick=\"sendLink()\">${t('sendlink')}</button><div class=\"lg\"><a href=\"#\" onclick=\"otpUI();return false\" style=\"color:#0f766e\">${LL('Get a code on WhatsApp instead','அதற்குப் பதில் WhatsApp-ல் குறியீடு பெறு')}</a></div><div class=\"lg\"><a href=\"#\" onclick=\"login('owner');return false\" style=\"color:#0f766e\">← ${t('signin')}</a></div></div>`}\nasync function sendLink(){try{await api('/api/forgot',{method:'POST',body:{email:$('#fe').value}});toast(t('linksent'))}catch(e){toast(err(e),1)}}\nfunction recoveryUI(tok){$('#app').innerHTML=`<div class=\"login\"><div class=\"mark\">☂</div><h1>Kudai</h1><p>${t('newpw')}</p><input id=\"np\" type=\"password\" autocomplete=\"new-password\" placeholder=\"${t('newpw')}\"><button class=\"btn\" onclick=\"setNewPw('${tok}')\">${t('setpw')}</button></div>`}\nasync function setNewPw(tok){try{await api('/api/setpw',{method:'POST',body:{token:tok,password:$('#np').value}});history.replaceState(null,'',location.pathname);S.tok=S.rt=null;save();toast(t('pwdone'));login()}catch(e){toast(err(e),1)}}\nasync function doPinLogin(){try{const d=await api('/api/pinlogin',{method:'POST',body:{mobile:$('#sm').value,pin:$('#sp').value}});afterLogin(d)}catch(e){S.tok=null;toast(e&&e.error==='bad_login'?t('e_bad_staff'):err(e),1)}}\nasync function loadMe(){try{S.me=await api('/api/me');S.master=!!S.me.is_master;return 'shop'}catch(e){if(e&&e.error==='no_shop'){await api('/api/m/me');S.me=null;S.master=true;return 'master'}throw e}}\nasync function afterLogin(d){S.tok=d.access_token;S.rt=d.refresh_token;const kind=await loadMe();if(kind==='master'){save();return masterMain()}\n if(!localStorage.getItem('kudai')||!JSON.parse(localStorage.getItem('kudai')).lang)S.lang=S.me.shop.default_lang;save();await loadMenu();main()}\nasync function doLogin(){try{const d=await api('/api/login',{method:'POST',body:{email:$('#em').value,password:$('#pw').value}});await afterLogin(d)}catch(e){S.tok=null;toast(err(e),1)}}\nasync function loadMenu(){S.menu=await api('/api/menu')}\n\nconst ADMINP=['reports','offers','menu','settings'];\nfunction main(){const own=S.me.role==='owner';\n $('#app').innerHTML=`<header><b>☂ ${esc(S.me.shop.name)}</b><button id=\"vbtn\" onclick=\"toggleVoice()\"></button>${langBtns()}${own?`${S.master?`<button onclick=\"masterMain()\">👑</button>`:''}<button onclick=\"go('settings')\">⚙</button><button onclick=\"logout()\">⎋</button>`:`<button onclick=\"lockNow()\">🔒</button>`}</header><div id=\"unsent\" style=\"display:none;background:#b45309;color:#fff;padding:8px 12px;text-align:center;font-weight:600\"></div><div id=\"tabs\"></div><div id=\"sub\"></div><main id=\"main\"></main>`;\n vbtn();go(S.tab==='today'?'bill':S.tab);startPoll();flushQ();if(!own){touch();if(localStorage.getItem('kudai_locked'))lockNow()}}\nfunction renderTabs(){const own=S.me.role==='owner',adm=ADMINP.includes(S.tab);\n const tabs=['bill','members','recent'].concat(own?['admin']:[]);\n $('#tabs').innerHTML=tabs.map(x=>`<button class=\"${(x==='admin'?adm:S.tab===x)?'on':''}\" onclick=\"go('${x==='admin'?'reports':x}')\">${t(x)}</button>`).join('');\n $('#sub').innerHTML=adm?['reports','offers','menu','settings'].map(x=>`<button class=\"${S.tab===x?'on':''}\" onclick=\"go('${x}')\">${t('sub_'+x)}</button>`).join('')+`<button onclick=\"S.adm=null;go('bill')\">🔒</button>`:''}\nfunction go(k){if(ADMINP.includes(k)&&S.me.role!=='owner')k='bill';\n if(!ADMINP.includes(k))S.adm=null;   // leaving the admin area locks it again\n S.tab=k;S.arm=0;S.armId=null;renderTabs();\n if(ADMINP.includes(k)&&!S.adm)return gate(k);\n ({bill:tBill,members:tMembers,menu:tMenu,recent:tRecent,reports:tReports,offers:tOffers,settings:tSettings})[k]()}\n\n/* ---------- admin PIN gate ---------- */\nfunction gate(k){renderTabs();const set=S.me.admin_pin_set;\n $('#main').innerHTML=set?`<div class=\"card\"><h3 style=\"margin-top:0\">${t('adminpin')}</h3><p class=\"mut\">${t('adminpinh')}</p><input id=\"ap\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" style=\"font-size:26px;text-align:center;letter-spacing:.4em\" oninput=\"if(this.value.length===4)verifyPin('${k}')\" autofocus><button class=\"btn\" onclick=\"verifyPin('${k}')\">${t('enter')}</button><div class=\"lg\"><a href=\"#\" onclick=\"forgotPinUI('${k}');return false\" style=\"color:#0f766e\">${t('forgotpin')}</a></div></div>`\n  :`<div class=\"card\"><h3 style=\"margin-top:0\">${t('makepin')}</h3><p class=\"mut\">${t('makepinh')}</p><input id=\"ap\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('pin4')}\"><input id=\"ap2\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('pinagain')}\"><button class=\"btn\" onclick=\"makePin('${k}')\">${t('setpin')}</button></div>`}\nasync function verifyPin(k){const v=$('#ap').value;if(v.length!==4)return;try{const r=await api('/api/adminpin/verify',{method:'POST',body:{pin:v}});S.adm=r.token;S.admAt=Date.now();go(k)}catch(e){$('#ap').value='';toast(err(e),1)}}\nasync function makePin(k){const a=$('#ap').value,b=$('#ap2').value;if(!/^\\d{4}$/.test(a)){toast(t('e_bad_pin'),1);return}if(a!==b){toast(t('e_bad_pin'),1);return}\n try{const r=await api('/api/adminpin/set',{method:'POST',body:{pin:a}});S.me.admin_pin_set=true;S.adm=r.token;S.admAt=Date.now();go(k)}catch(e){toast(err(e),1)}}\nfunction forgotPinUI(k){$('#main').innerHTML=`<div class=\"card\"><h3 style=\"margin-top:0\">${t('forgotpin')}</h3><p class=\"mut\">${t('forgotpinh')}</p><input id=\"fp\" type=\"password\" placeholder=\"${t('password')}\" autocomplete=\"current-password\"><input id=\"np4\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('newpin')}\"><button class=\"btn\" onclick=\"resetPin('${k}')\">${t('setpin')}</button></div>`}\nasync function resetPin(k){try{const r=await api('/api/adminpin/reset',{method:'POST',body:{password:$('#fp').value,pin:$('#np4').value}});S.adm=r.token;S.admAt=Date.now();go(k)}catch(e){toast(err(e),1)}}\nsetInterval(()=>{if(S.adm&&Date.now()-S.admAt>180000){S.adm=null;if(ADMINP.includes(S.tab))gate(S.tab)}},10000);\n\n/* ---------- employee lock screen (2 minutes idle, or the 🔒 button) ---------- */\nlet idleAt=Date.now();function touch(){idleAt=Date.now()}\n['touchstart','click','keydown'].forEach(e=>addEventListener(e,touch,true));\nsetInterval(()=>{if(S.me&&S.me.role!=='owner'&&!$('#lockov')&&Date.now()-idleAt>120000)lockNow()},5000);\nfunction lockNow(){if($('#lockov'))return;try{localStorage.setItem('kudai_locked','1')}catch(e){}\n const d=document.createElement('div');d.id='lockov';d.style.cssText='position:fixed;inset:0;background:#0f766e;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px';\n d.innerHTML=`<div class=\"card\" style=\"width:100%;max-width:340px;text-align:center\"><h2 style=\"margin:0 0 4px\">🔒 ${esc(S.me.shop.name)}</h2><p class=\"mut\">${t('unlocktxt')}</p><input id=\"up\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" style=\"font-size:28px;text-align:center;letter-spacing:.4em\" oninput=\"if(this.value.length===4)doUnlock()\"><button class=\"btn\" onclick=\"doUnlock()\">${t('unlock')}</button></div>`;\n document.body.appendChild(d);setTimeout(()=>{const i=$('#up');if(i)i.focus()},100)}\nasync function doUnlock(){const v=$('#up').value;if(v.length!==4)return;try{await api('/api/unlock',{method:'POST',body:{pin:v}});try{localStorage.removeItem('kudai_locked')}catch(e){}$('#lockov').remove();touch()}catch(e){$('#up').value='';toast(err(e),1)}}\n\n/* ---------- member lookup, shared by Bill and Members ---------- */\nfunction lookupHTML(){return `<div class=\"row\"><input id=\"q\" placeholder=\"${S.tab==='bill'?t('last4'):t('findph')}\" inputmode=\"${S.tab==='bill'?'numeric':'text'}\" style=\"font-size:22px;padding:14px\" autocomplete=\"off\" oninput=\"qin()\" onkeydown=\"if(event.key==='Enter')look()\"><button class=\"btn sm\" onclick=\"look()\">${t('search')}</button></div><div id=\"sres\"></div><div id=\"cc\">${custCard()}</div>`}\nfunction custCard(){const c=S.cust;if(!c)return '';\n let h=`<div class=\"card\"><div class=\"cust\"><div><div class=\"n\">${esc(c.name)}</div><div class=\"mut\">${esc(c.mobile)} · #${c.short_id}</div></div><div class=\"bal\"><b>${rs(c.wallet_paise)}</b><span class=\"mut\">${t('balance')} · ${c.points} ${t('points')}</span></div></div></div>`;\n if(S.tab==='members'){h+=`<label class=\"ck\"><input type=\"checkbox\" ${c.whatsapp_optin?'checked':''} onchange=\"setOptin(this.checked)\"> ${t('alertson')}</label>`+addMoneyHTML();if(S.cust.points>=S.me.shop.redeem_points)h+=`<button class=\"btn ghost\" style=\"margin-bottom:10px\" onclick=\"redeem()\">🎁 ${t('redeem')}: ${S.me.shop.redeem_points} ${t('points')} → ${rs(S.me.shop.redeem_value_paise)}</button>`}return h}\nlet qt;function qin(){clearTimeout(qt);const v=$('#q').value.trim();if(/^\\d{4}$/.test(v))qt=setTimeout(look,150);else if(!v){S.res=[];$('#sres').innerHTML=''}}\nasync function look(){const q=$('#q').value.trim();if(!q)return;S.last=null;S.amt=0;S.arm=0;$('#sres').innerHTML='';\n try{S.res=await api('/api/search?q='+encodeURIComponent(q))}catch(e){toast(err(e),1);return}\n if(!S.res.length){S.cust=null;$('#cc').innerHTML='';toast(t('e_customer_not_found'),1);return}\n if(S.res.length===1){pickCust(S.res[0]);return}\n $('#sres').innerHTML=S.res.map(x=>`<button class=\"card\" style=\"width:100%;text-align:left;margin:6px 0;padding:16px\" onclick=\"pickId('${x.id}')\"><div class=\"cust\"><div><div class=\"n\" style=\"font-size:20px\">${esc(x.name)}</div><div class=\"mut\">…${esc(x.mobile.slice(-4))} · #${x.short_id}</div></div><b style=\"font-size:20px;color:#0f766e\">${rs(x.wallet_paise)}</b></div></button>`).join('')}\nfunction pickId(id){const c=S.res.find(x=>x.id===id);if(c)pickCust(c)}\nfunction pickCust(c){S.cust=c;S.res=[];$('#sres').innerHTML='';$('#cc').innerHTML=custCard();if(S.tab==='bill'){const q=$('#q');if(q)q.blur();usualBtn();showLast();cart()}}\nfunction usualBtn(){const el=$('#usual');if(!el)return;const r=S.cust&&S.regs.find(x=>x.id===S.cust.id);\n el.innerHTML=r?`<button class=\"btn\" style=\"padding:18px;font-size:19px;margin:6px 0\" onclick=\"quick('${r.id}')\">⚡ ${t('usual')}: ${esc(usualText(r))} · ${rs(usualTotal(r))}</button>`:''}\n\n/* ---------- Bill ---------- */\nfunction tBill(){const av=S.menu.filter(m=>m.is_available);\n $('#main').innerHTML=lookupHTML()+`<div id=\"usual\"></div><h3>${t('regulars')}</h3><div class=\"tiles\" id=\"tiles\"></div><div id=\"res\"></div><h3>${t('menu')}</h3><div class=\"grid\">${av.map(m=>`<button class=\"item\" onclick=\"addItem('${m.id}')\"><b>${esc(nm(m))}</b><span>${rs(m.price_paise)}</span></button>`).join('')}</div>${av.length?'':`<p class=\"mut\">${t('noitems')}</p>`}\n<div style=\"margin-top:10px\"><input id=\"oth\" inputmode=\"decimal\" placeholder=\"${t('other')}\" oninput=\"S.arm=0;cart()\"></div><div id=\"cart\"></div>`;cart();showLast();refreshTiles().then(usualBtn)}\nfunction addItem(id){S.cart[id]=(S.cart[id]||0)+1;S.arm=0;cart()}\nfunction dec(id){if(S.cart[id]>1)S.cart[id]--;else delete S.cart[id];S.arm=0;cart()}\nfunction customAmt(){const o=$('#oth');const v=o?parseFloat(o.value):0;return v>0?Math.round(v*100):0}\nfunction total(){let s=customAmt();for(const id in S.cart){const m=S.menu.find(x=>x.id===id);if(m)s+=m.price_paise*S.cart[id]}return s}\nfunction cart(){const el=$('#cart');if(!el)return;const tot=total();\n const lines=Object.keys(S.cart).map(id=>{const m=S.menu.find(x=>x.id===id);if(!m)return '';return `<div class=\"line\"><span class=\"nm\">${esc(nm(m))}</span><span class=\"q\"><button onclick=\"dec('${id}')\">−</button><b>${S.cart[id]}</b><button onclick=\"addItem('${id}')\">+</button></span><b style=\"min-width:64px;text-align:right\">${rs(m.price_paise*S.cart[id])}</b></div>`}).join('');\n el.innerHTML=(lines||tot?`<div class=\"card\">${lines}<div class=\"tot\"><span>${t('total')}</span><span>${rs(tot)}</span></div>\n<button class=\"btn ${S.arm?'warn':''}\" ${(!tot)?'disabled':''} onclick=\"charge()\">${S.arm?t('confirm')+' · '+rs(tot):t('charge')+' '+rs(tot)}</button>\n<button class=\"btn ghost\" style=\"margin-top:8px\" onclick=\"S.cart={};$('#oth').value='';S.arm=0;cart()\">${t('clear')}</button></div>`:'')}\nasync function charge(){if(!S.cust){toast(t('walkin'),1);return}if(!total())return;\n if(!S.arm){S.arm=1;cart();setTimeout(()=>{if(S.arm){S.arm=0;cart()}},4000);return}S.arm=0;\n try{const r=await postBill({customer_id:S.cust.id,items:Object.keys(S.cart).map(id=>({id,qty:S.cart[id]})),custom_paise:customAmt()||undefined});\n  S.cust=r.customer;S.last=r;S.cart={};$('#oth').value='';$('#cc').innerHTML=custCard();cart();showLast();toast('✓ '+t('charged')+' '+rs(r.txn.base_paise));say('say_bill',r.txn.base_paise,r.customer.name);refreshTiles()}\n catch(e){if(!e.queued)toast(err(e),1);if(e.queued){S.cart={};const o=$('#oth');if(o)o.value=''}cart()}}\nfunction showLast(){const el=$('#res');if(!el)return;const r=S.last;if(!r||!S.cust){el.innerHTML='';return}\n el.innerHTML=`<div class=\"card ok\"><b>✓ ${t('charged')} ${rs(r.txn.base_paise)}</b><div class=\"mut\">${t('newbal')}: ${rs(S.cust.wallet_paise)} · +${r.txn.points_change} ${t('earned')}</div><button class=\"btn ghost\" style=\"margin-top:8px\" onclick=\"undo('${r.txn.id}')\">↩ ${t('undo')}</button></div>`}\nasync function undo(id){try{const r=await api('/api/undo',{method:'POST',body:{txn_id:id}});if(S.cust&&S.cust.id===r.customer.id)S.cust=r.customer;S.last=null;toast('↩ '+t('undone'));if(S.tab==='bill'){$('#cc').innerHTML=custCard();showLast()}else go(S.tab)}catch(e){toast(err(e),1)}}\n\nasync function setOptin(v){try{const r=await api('/api/optin',{method:'POST',body:{customer_id:S.cust.id,whatsapp_optin:v}});S.cust=r.customer;toast('✓ '+t('saved'))}catch(e){toast(err(e),1);$('#cc').innerHTML=custCard()}}\nasync function redeem(){if(!S.cust)return;try{const r=await api('/api/redeem',{method:'POST',body:{customer_id:S.cust.id,blocks:1}});S.cust=r.customer;$('#cc').innerHTML=custCard();toast('✓ '+t('saved'))}catch(e){toast(err(e),1)}}\n\n/* ---------- Members ---------- */\nfunction addMoneyHTML(){const max=S.me.shop.max_recharge_paise;const a=[];for(let p=10000;p<=max;p+=10000)a.push(p);\n const bonus=S.amt?Math.floor(S.amt*S.me.shop.bonus_percent/100):0;\n const meth=`<div class=\"chips\">${['CASH','UPI'].map(k=>`<button class=\"${S.method===k?'on':''}\" onclick=\"S.method='${k}';S.arm=0;$('#cc').innerHTML=custCard()\">${t(k.toLowerCase())}</button>`).join('')}</div>`;\n return `<div class=\"card\"><b>${t('addmoney')}</b><div class=\"mut\">${t('cashnote')}</div><div class=\"chips\">${a.map(p=>`<button class=\"${S.amt===p?'on':''}\" onclick=\"pick(${p})\">${rs(p)}</button>`).join('')}</div>\n${S.amt?`<div class=\"mut\">${t('bonus')}: ${rs(bonus)} · ${t('walletget')}: <b>${rs(S.amt+bonus)}</b></div>${meth}<button class=\"btn ${S.arm?'warn':''}\" style=\"margin-top:8px\" onclick=\"recharge()\">${S.arm?t('confirm'):t('received')+' '+rs(S.amt)+' ('+t(S.method.toLowerCase())+')'}</button>`:''}</div>`}\nfunction pick(p){S.amt=p;S.arm=0;$('#cc').innerHTML=custCard()}\nasync function recharge(){if(!S.cust||!S.amt)return;if(!S.arm){S.arm=1;$('#cc').innerHTML=custCard();setTimeout(()=>{if(S.arm){S.arm=0;if(S.tab==='members')$('#cc').innerHTML=custCard()}},4000);return}S.arm=0;\n try{const r=await api('/api/addmoney',{method:'POST',body:{customer_id:S.cust.id,base_paise:S.amt,method:S.method}});S.cust=r.customer;S.amt=0;$('#cc').innerHTML=custCard();toast('✓ '+t('added')+' '+rs(r.txn.wallet_change_paise));say('say_add',r.txn.base_paise,r.customer.name)}\n catch(e){toast(err(e),1);$('#cc').innerHTML=custCard()}}\nfunction tMembers(){$('#main').innerHTML=lookupHTML()+`<h3>${t('newmember')}</h3><div class=\"card\">\n<input id=\"nn\" placeholder=\"${t('name')} *\"><input id=\"nmb\" inputmode=\"numeric\" maxlength=\"14\" placeholder=\"${t('mobile')} *\">\n<input id=\"nem\" type=\"email\" placeholder=\"${t('emailopt')}\"><input id=\"nad\" placeholder=\"${t('address')}\">\n<select id=\"nlg\"><option value=\"en\" ${S.lang==='en'?'selected':''}>English</option><option value=\"ta\" ${S.lang==='ta'?'selected':''}>தமிழ்</option></select>\n<label class=\"ck\"><input id=\"nwa\" type=\"checkbox\" checked> ${t('wacon')}</label><label class=\"ck\"><input id=\"nof\" type=\"checkbox\"> ${t('offersok')}</label><button class=\"btn\" onclick=\"reg()\">${t('save')}</button></div>`}\nasync function reg(){try{const c=await api('/api/customer',{method:'POST',body:{name:$('#nn').value,mobile:$('#nmb').value,email:$('#nem').value,address:$('#nad').value,lang:$('#nlg').value,offers_optin:$('#nof').checked,whatsapp_optin:$('#nwa').checked}});\n S.cust=c;S.amt=0;toast('✓ '+t('registered'));tMembers();$('#cc').innerHTML=custCard()}catch(e){toast(err(e),1)}}\n\n/* ---------- Menu ---------- */\nfunction tMenu(){const own=S.me.role==='owner';\n const add=own?`<div class=\"card\"><b>${t('additem')}</b><input id=\"mn\" placeholder=\"${t('itemen')}\"><input id=\"mt\" placeholder=\"${t('itemta')}\"><input id=\"mp\" inputmode=\"decimal\" placeholder=\"${t('price')}\"><button class=\"btn\" onclick=\"mAdd()\">${t('save')}</button></div>`:'';\n const rows=S.menu.map(m=>`<div class=\"card\"><div class=\"row\"><b style=\"flex:1\">${esc(nm(m))}</b>${own?`<input id=\"p_${m.id}\" style=\"width:90px;flex:none\" inputmode=\"decimal\" value=\"${m.price_paise/100}\"><button class=\"btn sm ghost\" onclick=\"mSave('${m.id}')\">${t('save')}</button>`:`<b>${rs(m.price_paise)}</b>`}</div>\n${own?`<div class=\"row\" style=\"margin-top:6px\"><label class=\"ck\" style=\"flex:1;margin:0\"><input type=\"checkbox\" ${m.is_available?'checked':''} onchange=\"mTog('${m.id}',this.checked)\"> ✓</label><button class=\"btn sm red\" onclick=\"mDel('${m.id}')\">${t('del')}</button></div>`:''}</div>`).join('');\n $('#main').innerHTML=add+(rows||`<p class=\"mut\">${t('noitemsedit')}</p>`)}\nasync function mAdd(){try{await api('/api/menu',{method:'POST',body:{name_en:$('#mn').value,name_ta:$('#mt').value,price:$('#mp').value}});await loadMenu();toast('✓ '+t('saved'));tMenu()}catch(e){toast(err(e),1)}}\nasync function mSave(id){try{await api('/api/menu/'+id,{method:'PATCH',body:{price:$('#p_'+id).value}});await loadMenu();toast('✓ '+t('saved'));tMenu()}catch(e){toast(err(e),1)}}\nasync function mTog(id,v){try{await api('/api/menu/'+id,{method:'PATCH',body:{is_available:v}});await loadMenu()}catch(e){toast(err(e),1)}}\nasync function mDel(id){try{await api('/api/menu/'+id,{method:'DELETE'});S.cart={};await loadMenu();toast(t('deleted'));tMenu()}catch(e){toast(err(e),1)}}\n\n/* ---------- Recent ---------- */\nasync function tRecent(){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const rows=await api('/api/recent');const now=Date.now();\n  $('#main').innerHTML=rows.length?rows.map(r=>{const amt=r.wallet_change_paise;const dt=new Date(r.created_at);\n   const canUndo=r.txn_type==='DEDUCT'&&r.status==='COMPLETED'&&now-dt.getTime()<300000;\n   return `<div class=\"tx\"><div><b>${esc(r.customers?r.customers.name:'')}</b><div class=\"mut\">${t('type_'+r.txn_type)}${r.status==='REVERSED'?' (↩)':''} · ${dt.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div>\n<div style=\"text-align:right\"><span class=\"${amt>=0?'pos':'neg'}\">${amt>=0?'+':'−'}${rs(Math.abs(amt))}</span>${canUndo?`<div><button class=\"btn sm ghost\" style=\"padding:6px 10px;margin-top:4px\" onclick=\"undo('${r.id}')\">↩ ${t('undo')}</button></div>`:''}</div></div>`}).join(''):`<p class=\"mut\">${t('nothing')}</p>`}\n catch(e){$('#main').innerHTML='';toast(err(e),1)}}\n\n/* ---------- regulars grid ---------- */\nfunction getQ(){try{return JSON.parse(localStorage.getItem('kudai_q')||'[]')}catch(e){return[]}}\nfunction setQ(q){try{localStorage.setItem('kudai_q',JSON.stringify(q))}catch(e){}showQ()}\nfunction showQ(){const n=getQ().length,el=$('#unsent');if(el){el.style.display=n?'block':'none';el.textContent=n+' '+t('unsent')}}\nlet fq=0;async function flushQ(){if(fq)return;fq=1;try{let q=getQ();while(q.length){const it=q[0];\n  try{await api('/api/bill',{method:'POST',body:Object.assign({},it.body,{force:true})});q.shift();setQ(q)}\n  catch(e){if(e&&e.error){q.shift();setQ(q);toast((it.name||'')+': '+err(e),1)}else break}}}finally{fq=0;showQ()}}\nsetInterval(flushQ,10000);addEventListener('online',flushQ);\nasync function postBill(body){body=Object.assign({ref:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2))},body);\n try{return await api('/api/bill',{method:'POST',body})}\n catch(e){if(!e||!e.error){const q=getQ();q.push({body:Object.assign({},body,{force:true}),name:(S.cust&&S.cust.id===body.customer_id?S.cust.name:(S.regs.find(x=>x.id===body.customer_id)||{}).name)||''});setQ(q);toast(t('savedoff'),1);throw {queued:1}}\n  if(e&&e.error==='recent_bill'&&confirm(t('again').replace('{a}',rs(e.amount_paise)).replace('{m}',Math.max(1,Math.round(e.secs_ago/60)))))return api('/api/bill',{method:'POST',body:Object.assign({},body,{force:true})});throw e}}\nfunction usualTotal(r){let s=r.usual.custom_paise||0;for(const i of r.usual.items){const m=S.menu.find(x=>x.id===i.id);s+=(m?m.price_paise:i.price_paise)*i.qty}return s}\nfunction usualText(r){const a=r.usual.items.map(i=>{const m=S.menu.find(x=>x.id===i.id);return (i.qty>1?i.qty+'× ':'')+(m?nm(m):i.name)});if(r.usual.custom_paise)a.push(rs(r.usual.custom_paise));return a.join(' + ')}\nfunction tiles(){const el=$('#tiles');if(!el)return;const low=S.me.shop.low_balance_paise||2000;\n el.innerHTML=S.regs.length?S.regs.map(r=>`<button class=\"tile ${r.today?'done':''}\" onclick=\"quick('${r.id}')\"><div class=\"tn\">${esc(r.name)}${r.today?` <span class=\"ck\">✓${r.today>1?'×'+r.today:''}</span>`:''}</div><div class=\"tu\">${esc(usualText(r))} · ${rs(usualTotal(r))}</div><div class=\"tb ${r.wallet_paise<low?'low':''}\">${rs(r.wallet_paise)}${r.wallet_paise<low?' ⚠':''}</div></button>`).join(''):`<p class=\"mut\" style=\"grid-column:1/3\">${t('noregs')}</p>`}\nasync function refreshTiles(){try{S.regs=await api('/api/regulars')}catch(e){S.regs=[]}tiles()}\nasync function quick(id){const r=S.regs.find(x=>x.id===id);if(!r||S.busy)return;S.busy=1;\n try{const res=await postBill({customer_id:r.id,items:r.usual.items.map(i=>({id:i.id,qty:i.qty})),custom_paise:r.usual.custom_paise||undefined});\n  r.wallet_paise=res.customer.wallet_paise;r.points=res.customer.points;r.today++;r.visits++;tiles();\n  if(S.cust&&S.cust.id===r.id){S.cust=res.customer;$('#cc').innerHTML=custCard()}\n  say('say_bill',res.txn.base_paise,r.name);snack(res.txn.id,res.txn.base_paise,r.name,r.id)}\n catch(e){if(!e.queued)toast(err(e),1)}finally{S.busy=0}}\nlet sk;function snack(txn,amt,name,cid){const e=$('#snack');e.innerHTML=`<span>✓ ${esc(name)} · ${rs(amt)}</span><button onclick=\"undoSnack('${txn}','${cid}')\">↩ ${t('undo')}</button>`;e.style.display='flex';clearTimeout(sk);sk=setTimeout(()=>e.style.display='none',8000)}\nasync function undoSnack(txn,cid){$('#snack').style.display='none';\n try{const r=await api('/api/undo',{method:'POST',body:{txn_id:txn}});const x=S.regs.find(y=>y.id===cid);\n  if(x){x.wallet_paise=r.customer.wallet_paise;x.points=r.customer.points;x.today=Math.max(0,x.today-1);x.visits=Math.max(0,x.visits-1);tiles()}\n  if(S.cust&&S.cust.id===cid){S.cust=r.customer;$('#cc').innerHTML=custCard()}toast('↩ '+t('undone'))}catch(e){toast(err(e),1)}}\n\n/* ---------- voice ---------- */\nfunction rupeesWord(p){const r=p/100;return Number.isInteger(r)?String(r):r.toFixed(2)}\nfunction say(key,p,name){if(!S.voice||!('speechSynthesis' in window))return;\n const txt=t(key).replace('{a}',rupeesWord(p)).replace('{n}',name||'');\n const u=new SpeechSynthesisUtterance(txt);u.lang=S.lang==='ta'?'ta-IN':'en-IN';u.rate=0.95;speechSynthesis.speak(u)}\nfunction vbtn(){const b=$('#vbtn');if(b){b.textContent=S.voice?'🔊':'🔇';b.className=S.voice?'on':''}}\nasync function wake(){try{if(S.voice&&'wakeLock' in navigator&&!S.wl){S.wl=await navigator.wakeLock.request('screen');S.wl.addEventListener('release',()=>{S.wl=null})}}catch(e){}}\nfunction toggleVoice(){S.voice=S.voice?0:1;save();vbtn();toast(t(S.voice?'voiceon':'voiceoff'));if(S.voice){wake();const u=new SpeechSynthesisUtterance(S.lang==='ta'?'குரல் இயக்கத்தில் உள்ளது':'Voice is on');u.lang=S.lang==='ta'?'ta-IN':'en-IN';speechSynthesis.speak(u)}else if(S.wl){try{S.wl.release()}catch(e){}S.wl=null}}\ndocument.addEventListener('visibilitychange',()=>{if(!document.hidden){wake();if(S.me)poll()}});\n\nfunction startPoll(){wake()}\n\n/* ---------- Settings: alerts, team, message log ---------- */\nconst ALK=['welcome','recharge','bill','low','reversal','redeem'];\nasync function tSettings(){const own=S.me.role==='owner',sh=S.me.shop;\n let h=`<button class=\"btn ghost\" style=\"margin-bottom:8px\" onclick=\"go('bill')\">← ${t('back')}</button>`;\n h+=`<h3>${t('alertsh')}</h3><div class=\"card\">${ALK.map(k=>`<label class=\"ck\"><input type=\"checkbox\" id=\"al_${k}\" ${sh.alerts[k]!==false?'checked':''} ${own?'':'disabled'}> ${t('al_'+k)}</label>`).join('')}\n <label class=\"mut\">${t('lowbal')}</label><input id=\"lowb\" inputmode=\"numeric\" value=\"${(sh.low_balance_paise||0)/100}\" ${own?'':'disabled'}>\n <label class=\"mut\">${t('footer')}</label><input id=\"foot\" maxlength=\"80\" placeholder=\"${t('footerph')}\" value=\"${esc(sh.footer_line||'')}\" ${own?'':'disabled'}>\n ${own?`<button class=\"btn\" onclick=\"savePrefs()\">${t('save')}</button>`:''}\n <button class=\"btn ghost\" style=\"margin-top:8px\" onclick=\"showPrev()\">${t('preview')}</button><div id=\"prev\"></div></div>`;\n if(own)h+=`<h3>${LL('Usage and day close','பயன்பாடு மற்றும் நாள் முடிப்பு')}</h3><div class=\"card\" id=\"usagebox\">…</div>`;\n if(own)h+=`<h3>${t('staffh')}</h3><div class=\"card\" id=\"staffbox\">…</div>`;\n h+=`<h3>${t('msglog')}</h3><div class=\"card\" id=\"msgbox\">…</div>`;\n $('#main').innerHTML=h;\n if(own){loadStaff();usageBox()}\n try{const m=await api('/api/messages');$('#msgbox').innerHTML=m.length?m.map(x=>`<div style=\"padding:8px 0;border-bottom:1px solid #eef4f3\"><div class=\"mut\">${esc(x.name)} · ${new Date(x.created_at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · ${esc(x.status==='queued'?t('queued'):x.status)}${x.error?' · '+esc(x.error):''}</div><div style=\"white-space:pre-wrap;font-size:14px\">${esc(x.text)}</div></div>`).join(''):`<p class=\"mut\">${t('nomsg')}</p>`}catch(e){$('#msgbox').innerHTML=''}}\nasync function savePrefs(){const alerts={};ALK.forEach(k=>alerts[k]=$('#al_'+k).checked);\n try{const r=await api('/api/prefs',{method:'POST',body:Object.assign({alerts,low_balance:$('#lowb').value,footer_line:$('#foot').value},$('#ac')?{auto_close:$('#ac').checked,summary_wa:$('#sw').checked,alert_big:$('#abg').value,alert_reversal:$('#arv').checked}:{})});S.me.shop.alerts=r.alerts;S.me.shop.low_balance_paise=r.low_balance_paise;S.me.shop.footer_line=r.footer_line;toast('✓ '+t('saved'))}catch(e){toast(err(e),1)}}\nasync function showPrev(){try{const r=await api('/api/preview?lang='+S.lang);$('#prev').innerHTML=r.map(x=>`<div class=\"card\" style=\"background:#e7f7dc;white-space:pre-wrap;font-size:14px\">${esc(x.text)}</div>`).join('')}catch(e){toast(err(e),1)}}\nasync function loadStaff(){try{const r=await api('/api/staff');const full=r.staff.length>=r.max;\n $('#staffbox').innerHTML=`<p class=\"mut\">${r.staff.length} ${t('staffof').replace('{m}',r.max)}</p>`+(S.newpin?`<div class=\"card ok\" style=\"font-size:18px\"><b>${esc(S.newpin)}</b></div>`:'')+r.staff.map(x=>`<div class=\"tx\"><div><b>${esc(x.staff_name||'')||t('owner')}</b><div class=\"mut\">${x.role==='owner'?t('owner'):esc(x.mobile||'')}</div></div>${x.role==='owner'?'':`<span style=\"display:flex;gap:6px\"><button class=\"btn sm ghost\" onclick=\"pinStaff('${x.user_id}','${esc(x.staff_name||'')}')\">${t('newpinbtn')}</button><button class=\"btn sm red\" onclick=\"delStaff('${x.user_id}')\">${t('remove')}</button></span>`}</div>`).join('')\n +(full?'':`<h3>${t('staffadd')}</h3><input id=\"sn\" placeholder=\"${t('staffname')}\"><input id=\"sm2\" inputmode=\"numeric\" maxlength=\"12\" placeholder=\"${t('mobile10')}\"><input id=\"sp2\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('staffpin')}\"><button class=\"btn\" onclick=\"addStaff()\">${t('addperson')}</button>`)}catch(e){$('#staffbox').innerHTML=''}}\nasync function addStaff(){try{const n=$('#sn').value,r=await api('/api/staff',{method:'POST',body:{name:n,mobile:$('#sm2').value,pin:$('#sp2').value}});S.newpin=t('pinshown').replace('{n}',n).replace('{p}',r.pin);loadStaff()}catch(e){toast(err(e),1)}}\nasync function pinStaff(id,n){try{const r=await api('/api/staff/'+id+'/pin',{method:'POST'});S.newpin=t('pinshown').replace('{n}',n).replace('{p}',r.pin);loadStaff()}catch(e){toast(err(e),1)}}\nasync function delStaff(id){if(!confirm(t('remove')+'?'))return;try{await api('/api/staff/'+id,{method:'DELETE'});S.newpin='';loadStaff()}catch(e){toast(err(e),1)}}\n\n/* ---------- Reports and Day Close ---------- */\nconst fdt=d=>new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});\nfunction net(x){return Number(x.gross_sales_paise)-Number(x.corrections_paise)}\nfunction dash(x,title,meta){const row=(l,v)=>`<div class=\"line\"><span class=\"nm\">${l}</span><b>${v}</b></div>`;\n const kp=(l,v)=>`<div class=\"kp\"><span>${l}</span><b>${v}</b></div>`;const mx=Math.max(1,...x.by_hour.map(h=>Number(h.amount_paise)));\n const added=Number(x.added_cash_paise)+Number(x.added_upi_paise);\n return `<div id=\"rep\"><h3 style=\"margin-top:4px\">${title}</h3><div class=\"mut\">${meta}</div>\n <div class=\"kpis\">${kp(t('r_sales'),rs(net(x)))}${kp(t('r_bills'),x.bills)}${kp(t('r_added'),rs(added))}${kp(t('r_members'),x.new_members)}</div>\n <div class=\"card\">${row(t('r_gross'),rs(Number(x.gross_sales_paise)))}${Number(x.corrections_paise)?row(t('r_corr'),'− '+rs(Number(x.corrections_paise))):''}${row(t('r_cash'),rs(Number(x.added_cash_paise)))}${row(t('r_upi'),rs(Number(x.added_upi_paise)))}${row(t('r_bonus'),rs(Number(x.bonus_paise)))}${row(t('r_pts'),x.points_issued)}${row(t('r_ptsr'),x.points_redeemed)}${row(t('r_undo'),x.undo_count)}${row(t('r_owed'),rs(Number(x.wallet_owed_paise)))}</div>\n ${x.cash_counted_paise!==undefined?cashCard(x):''}<h3>${t('r_items')}</h3><div class=\"card\">${x.items.length?x.items.map(i=>row(esc(i.name)+' × '+i.qty,rs(Number(i.amount_paise)))).join(''):`<span class=\"mut\">${t('r_none')}</span>`}</div>\n <h3>${t('r_staff')}</h3><div class=\"card\">${x.by_staff.length?x.by_staff.map(i=>row(esc(i.name)+' · '+i.bills,rs(Number(i.amount_paise)))).join(''):`<span class=\"mut\">${t('r_none')}</span>`}</div>\n <h3>${t('r_hours')}</h3><div class=\"card\">${x.by_hour.length?x.by_hour.map(h=>`<div class=\"hr\"><span>${h.hour}:00</span><i style=\"width:${Math.max(3,Math.round(Number(h.amount_paise)/mx*100))}%\"></i><b>${rs(Number(h.amount_paise))}</b></div>`).join(''):`<span class=\"mut\">${t('r_none')}</span>`}</div>\n <h3>${t('r_top')}</h3><div class=\"card\">${x.top_customers.length?x.top_customers.map(c=>row(esc(c.name)+' …'+c.last4,rs(Number(c.amount_paise)))).join(''):`<span class=\"mut\">${t('r_none')}</span>`}</div>\n <h3>${t('r_low')}</h3><div class=\"card\">${x.low_customers.length?x.low_customers.map(c=>row(esc(c.name)+' …'+c.last4,rs(Number(c.wallet_paise)))).join(''):`<span class=\"mut\">${t('r_none')}</span>`}</div>\n <p class=\"mut\">${t('r_note')}</p></div>`}\nfunction cashCard(x){const d=Number(x.cash_diff_paise),ok=d===0;return `<h3>${LL('Cash drawer','கல்லா பணம்')}</h3><div class=\"card ${ok?'ok':''}\"><div class=\"line\"><span class=\"nm\">${LL('Cash expected','எதிர்பார்த்த பணம்')}</span><b>${rs(Number(x.cash_expected_paise))}</b></div><div class=\"line\"><span class=\"nm\">${LL('Cash counted','எண்ணிய பணம்')}</span><b>${rs(Number(x.cash_counted_paise))}</b></div><div class=\"line\"><span class=\"nm\">${LL('Difference','வேறுபாடு')}</span><b class=\"${ok?'pos':'neg'}\">${ok?'✓ '+LL('Matches','சரியாக உள்ளது'):(d>0?LL('Extra ','கூடுதல் '):LL('Short ','குறைவு '))+rs(Math.abs(d))}</b></div></div>`}\nasync function loadStaffRep(rg){rg=rg||'today';try{const r=await api('/api/staffrep?range='+rg);const el=$('#staffrep');if(!el)return;\n el.innerHTML=`<div class=\"noprint\"><h3>${LL('Staff performance','ஊழியர் செயல்பாடு')}</h3><div class=\"chips\">${[['today',LL('Today','இன்று')],['7d',LL('7 days','7 நாள்')],['month',LL('This month','இந்த மாதம்')]].map(([k,l])=>`<button class=\"${r.range===k?'on':''}\" onclick=\"loadStaffRep('${k}')\">${l}</button>`).join('')}</div><div class=\"card\">${r.rows.length?r.rows.map(x=>`<div class=\"tx\"><div><b>${esc(x.name)}</b><div class=\"mut\">${LL('Bills','Bills')} ${x.bills} · ${LL('Recharges','Recharges')} ${x.recharges} · <span class=\"${x.reversals>=3?'neg':''}\">${LL('Reversals','ரத்து')} ${x.reversals}${x.reversals?' ('+rs(Number(x.reversed_paise))+')':''}</span></div></div><div class=\"bal\"><b>${rs(Number(x.sales_paise))}</b><span class=\"mut\">+${rs(Number(x.added_paise))}</span></div></div>`).join(''):`<span class=\"mut\">${t('r_none')}</span>`}</div></div>`}catch(e){}}\nfunction repText(x,title){return `${S.me.shop.name} - ${title}\\n${t('r_sales')}: ${rs(net(x))} (${x.bills} ${t('r_bills')})\\n${t('r_added')}: ${rs(Number(x.added_cash_paise)+Number(x.added_upi_paise))} (${t('r_cash')} ${rs(Number(x.added_cash_paise))}, ${t('r_upi')} ${rs(Number(x.added_upi_paise))})\\n${t('r_members')}: ${x.new_members}\\n${t('r_owed')}: ${rs(Number(x.wallet_owed_paise))}\\n- Kudai`}\nfunction repCsv(x,title){const q=v=>'\"'+String(v).replace(/\"/g,'\"\"')+'\"',r=p=>(p/100).toFixed(2);\n const L=[[S.me.shop.name,title],[],['Wallet sales',r(net(x))],['Bills',x.bills],['Gross sales',r(Number(x.gross_sales_paise))],['Corrections',r(Number(x.corrections_paise))],['Cash added',r(Number(x.added_cash_paise))],['UPI added',r(Number(x.added_upi_paise))],['Bonus given',r(Number(x.bonus_paise))],['Points given',x.points_issued],['Points used',x.points_redeemed],['New members',x.new_members],['Wallet owed',r(Number(x.wallet_owed_paise))],[],['Item','Qty','Amount']]\n  .concat(x.items.map(i=>[i.name,i.qty,r(Number(i.amount_paise))])).concat([[],['Person','Bills','Amount']]).concat(x.by_staff.map(i=>[i.name,i.bills,r(Number(i.amount_paise))])).concat([[],['Top customer','Amount']]).concat(x.top_customers.map(c=>[c.name+' ..'+c.last4,r(Number(c.amount_paise))]));\n return L.map(a=>a.map(q).join(',')).join('\\n')}\nfunction repActs(){return `<div class=\"noprint\"><div class=\"row\" style=\"margin:8px 0\"><button class=\"btn ghost\" onclick=\"repShare()\">📤 ${t('share')}</button><button class=\"btn ghost\" onclick=\"repDl()\">⬇ ${t('csv')}</button></div><button class=\"btn ghost\" style=\"margin-bottom:8px\" onclick=\"window.print()\">🖨 ${t('print')}</button></div>`}\nfunction repShare(){const r=S.rep;if(!r)return;const tx=repText(r.x,r.title);if(navigator.share)navigator.share({text:tx}).catch(()=>{});else window.open('https://wa.me/?text='+encodeURIComponent(tx),'_blank')}\nfunction repDl(){const r=S.rep;if(!r)return;const b=new Blob(['﻿'+repCsv(r.x,r.title)],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='kudai-report-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove()}\nasync function tReports(){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const [r,cl]=await Promise.all([api('/api/report'),api('/api/closes')]);const title=t('since')+' '+fdt(r.from);S.rep={x:r.summary,title};\n  $('#main').innerHTML=`<div class=\"noprint row\" style=\"margin:0 0 8px\"><button class=\"btn\" onclick=\"closeDay()\">🔒 ${t('closeday')}</button>${r.last_close?`<button class=\"btn ghost\" onclick=\"reopenDay()\">${t('reopen')}</button>`:''}</div>`+dash(r.summary,title,fdt(r.from)+' → '+fdt(r.to))+repActs()+'<div id=\"staffrep\"></div>'\n   +(cl.length?`<div class=\"noprint\"><h3>${t('history')}</h3><div class=\"card\">${cl.map(c=>`<div class=\"tx\" onclick=\"showClose('${c.id}')\" style=\"cursor:pointer\"><span>${fdt(c.closed_at)}${c.revision>1?' · '+t('revised')+' '+c.revision:''}${c.status==='REOPENED'?' · ↺':''}</span><b>${rs(net(c.summary))}</b></div>`).join('')}</div></div>`:'');\n  S.closes=cl;loadStaffRep('today')}\n catch(e){$('#main').innerHTML='';if(e&&e.error!=='admin_locked')toast(err(e),1)}}\nfunction showClose(id){const c=(S.closes||[]).find(x=>x.id===id);if(!c)return;const title=fdt(c.closed_at)+(c.revision>1?' · '+t('revised')+' '+c.revision:'');S.rep={x:c.summary,title};\n $('#main').innerHTML=`<button class=\"btn ghost noprint\" onclick=\"tReports()\">← ${t('back')}</button>`+dash(c.summary,title,fdt(c.period_from)+' → '+fdt(c.closed_at))+repActs()}\nasync function closeDay(){if(!confirm(t('closeq')))return;const cc=prompt(LL('Cash counted in the drawer now (₹). Leave empty to skip.','கல்லாவில் இப்போது எண்ணிய பணம் (₹). தேவையில்லை என்றால் காலியாக விடவும்.'));if(cc===null)return;try{await api('/api/close',{method:'POST',body:cc.trim()?{cash_counted:cc.trim()}:{}});toast('✓ '+t('closed'));tReports()}catch(e){toast(err(e),1)}}\nasync function reopenDay(){if(!confirm(t('reopenq')))return;try{await api('/api/reopen',{method:'POST'});toast('✓ '+t('reopened'));tReports()}catch(e){toast(err(e),1)}}\n/* ---------- extras: raw fetch, owner Offers / Usage / Export, forgot-by-WhatsApp ---------- */\nconst LL=(e,ta)=>S.lang==='ta'?ta:e;\nasync function apiRaw(path){const h={};if(S.tok)h.authorization='Bearer '+S.tok;if(S.adm)h['x-admin']=S.adm;\n let r=await fetch(path,{headers:h});if(r.status===401&&await refresh()){h.authorization='Bearer '+S.tok;r=await fetch(path,{headers:h})}\n if(!r.ok){const d=await r.json().catch(()=>({}));if(d&&d.error==='admin_locked'){S.adm=null;if(ADMINP.includes(S.tab))gate(S.tab)}throw d}return r.text()}\nfunction saveFile(name,text,type){const b=new Blob([text],{type:type||'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove()}\nasync function dlCsv(path,name){try{saveFile(name,await apiRaw(path))}catch(e){toast(err(e),1)}}\nasync function openDoc(path){const w=window.open('','_blank');try{const h=await apiRaw(path);if(!w){toast('Allow pop-ups',1);return}w.document.open();w.document.write(h);w.document.close()}catch(e){if(w)w.close();toast(err(e),1)}}\nconst ST={queued:'⏳',sending:'⏳',sent:'✓',delivered:'✓✓',read:'✓✓',failed:'✗',held:'⏸',skipped:'–',expired:'–'};\nasync function usageBox(){try{const u=await api('/api/usage');S.usage=u;\n $('#usagebox').innerHTML=`<div class=\"kpis\"><div class=\"kp\"><span>${LL('Alerts this month','இந்த மாத அறிவிப்புகள்')}</span><b>${u.used} / ${u.limit}</b></div><div class=\"kp\"><span>${LL('Extra pack credits','கூடுதல் pack')}</span><b>${u.credits}</b></div></div>\n <div class=\"mut\">${u.live?LL('WhatsApp: live','WhatsApp: இயக்கத்தில்'):LL('WhatsApp: test mode (messages are not really sent yet)','WhatsApp: சோதனை முறை (செய்திகள் இன்னும் உண்மையாக அனுப்பப்படவில்லை)')}${u.queued?' · ⏳ '+u.queued:''}${u.held?' · ⏸ '+u.held:''}${u.failed?' · ✗ '+u.failed:''}</div>\n ${u.held?`<div class=\"card\" style=\"background:#fff4e0\">${LL('Monthly allowance is over. Ask Kudai for a message pack to resume alerts.','மாதாந்திர அளவு முடிந்தது. அறிவிப்புகளைத் தொடர Kudai-யிடம் message pack கேளுங்கள்.')}</div>`:''}\n <label class=\"ck\"><input type=\"checkbox\" id=\"ac\" ${u.auto_close?'checked':''}> ${LL('Auto close day at 11:30 PM','இரவு 11:30-க்கு நாளைத் தானாக முடி')}</label>\n <label class=\"ck\"><input type=\"checkbox\" id=\"sw\" ${u.summary_wa?'checked':''}> ${LL('Send me the day summary on WhatsApp','நாள் சுருக்கத்தை WhatsApp-ல் அனுப்பு')}</label>\n <label class=\"mut\" style=\"display:block;margin-top:8px\">${LL('Alert me on WhatsApp when a staff member makes a bill of ₹ or more (0 = off)','ஊழியர் இந்தத் தொகை (₹) அல்லது அதற்கு மேல் bill போட்டால் WhatsApp-ல் தெரிவி (0 = நிறுத்து)')}</label><input id=\"abg\" inputmode=\"decimal\" value=\"${(Number(u.alert_big_paise)||0)/100}\">\n <label class=\"ck\"><input type=\"checkbox\" id=\"arv\" ${u.alert_reversal?'checked':''}> ${LL('Alert me when a staff member reverses a bill','ஊழியர் bill-ஐ ரத்து செய்தால் எனக்குத் தெரிவி')}</label>\n <div class=\"row\" style=\"margin-top:8px\"><button class=\"btn ghost\" onclick=\"dlCsv('/api/export/customers','customers.csv')\">⬇ ${LL('Customers CSV','வாடிக்கையாளர் CSV')}</button><button class=\"btn ghost\" onclick=\"dlCsv('/api/export/transactions','transactions.csv')\">⬇ ${LL('Transactions CSV','பரிவர்த்தனை CSV')}</button></div>`}catch(e){$('#usagebox').innerHTML=''}}\nconst AUDN=()=>({all:LL('All customers who allowed offers','சலுகைக்கு ஒப்புக்கொண்ட அனைவரும்'),low:LL('Low wallet balance','குறைந்த வாலட் இருப்பு'),inactive:LL('Not visited for 30 days','30 நாள் வரவில்லை'),points:LL('Enough points to redeem','பயன்படுத்தப் போதுமான புள்ளிகள்')});\nasync function tOffers(){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const [o,u]=await Promise.all([api('/api/offers'),api('/api/usage')]);\n  $('#main').innerHTML=`<div class=\"card\"><h3 style=\"margin-top:0\">${LL('Send an offer on WhatsApp','WhatsApp-ல் சலுகை அனுப்பு')}</h3>\n  <p class=\"mut\">${LL('Only customers who agreed to offers get it. Each message uses 1 pack credit. You have','சலுகைக்கு ஒப்புக்கொண்டவர்களுக்கு மட்டும் செல்லும். ஒவ்வொரு செய்திக்கும் 1 pack credit. உங்களிடம் உள்ளது:')} <b>${u.credits}</b>.</p>\n  <select id=\"oa\" onchange=\"offCount()\">${Object.entries(AUDN()).map(([k,v])=>`<option value=\"${k}\">${v}</option>`).join('')}</select>\n  <textarea id=\"ot\" rows=\"4\" maxlength=\"500\" placeholder=\"${LL('Offer text (e.g. Buy 2 teas, get a biscuit free this week)','சலுகை விவரம் (எ.கா. இந்த வாரம் 2 டீ வாங்கினால் பிஸ்கட் இலவசம்)')}\"></textarea>\n  <input id=\"oi\" placeholder=\"${LL('Image link (https://…) optional','படத்தின் இணைப்பு (https://…) விருப்பம்')}\">\n  <div id=\"oc\" class=\"mut\" style=\"margin:4px 0\"></div>\n  <button class=\"btn\" onclick=\"offSend()\">${LL('Send offer','சலுகையை அனுப்பு')}</button></div>\n  <h3>${LL('Sent offers','அனுப்பிய சலுகைகள்')}</h3><div class=\"card\">${o.length?o.map(x=>`<div style=\"padding:8px 0;border-bottom:1px solid #eef4f3\"><div class=\"mut\">${fdt(x.created_at)} · ${x.recipients} ${LL('customers','பேர்')}</div><div style=\"white-space:pre-wrap\">${esc((x.params||{}).text||'')}</div></div>`).join(''):`<span class=\"mut\">${LL('None yet','இன்னும் இல்லை')}</span>`}</div>`;offCount()}\n catch(e){$('#main').innerHTML='';if(e&&e.error!=='admin_locked')toast(err(e),1)}}\nasync function offCount(){try{const r=await api('/api/offers/count',{method:'POST',body:{audience:$('#oa').value}});$('#oc').textContent=LL('Will reach','சென்றடையும்')+': '+r.count+' '+LL('customers','பேர்')}catch(e){}}\nasync function offSend(){const tx=$('#ot').value.trim();if(tx.length<3){toast(LL('Write the offer text','சலுகை விவரத்தை எழுதுங்கள்'),1);return}\n if(!confirm(LL('Send this offer now?','இந்தச் சலுகையை இப்போது அனுப்பவா?')))return;\n try{const r=await api('/api/offers',{method:'POST',body:{audience:$('#oa').value,text:tx,image:$('#oi').value}});toast('✓ '+r.count+' '+LL('queued','வரிசையில்'));tOffers()}catch(e){toast(e&&e.error==='need_credits'?LL('Not enough pack credits. Ask Kudai for a pack.','போதுமான pack credits இல்லை. Kudai-யிடம் pack கேளுங்கள்.'):e&&e.error==='no_recipients'?LL('No customer matches this group','இந்தக் குழுவில் யாரும் இல்லை'):err(e),1)}}\nfunction otpUI(){$('#app').innerHTML=`<div class=\"login\"><div class=\"mark\">☂</div><h1>Kudai</h1><p>${LL('Enter your login email. We will send a 6-digit code to the owner WhatsApp number saved with Kudai.','உள்நுழையும் மின்னஞ்சலை உள்ளிடவும். Kudai-யில் சேமித்த உரிமையாளர் WhatsApp எண்ணுக்கு 6 இலக்கக் குறியீடு அனுப்புவோம்.')}</p>\n <input id=\"oe\" type=\"email\" placeholder=\"${t('email')}\" autocapitalize=\"none\"><button class=\"btn\" onclick=\"otpSend()\">${LL('Send code','குறியீடு அனுப்பு')}</button>\n <input id=\"oc6\" inputmode=\"numeric\" maxlength=\"6\" placeholder=\"${LL('6-digit code','6 இலக்கக் குறியீடு')}\"><input id=\"onp\" type=\"password\" autocomplete=\"new-password\" placeholder=\"${t('newpw')}\"><button class=\"btn\" onclick=\"otpSet()\">${t('setpw')}</button>\n <div class=\"lg\"><a href=\"#\" onclick=\"login('owner');return false\" style=\"color:#0f766e\">← ${t('signin')}</a></div></div>`}\nasync function otpSend(){try{await api('/api/otp/request',{method:'POST',body:{email:$('#oe').value}});toast(LL('If this owner has a WhatsApp number saved, a code was sent.','உரிமையாளர் WhatsApp எண் சேமிக்கப்பட்டிருந்தால் குறியீடு அனுப்பப்பட்டது.'))}catch(e){toast(err(e),1)}}\nasync function otpSet(){try{await api('/api/otp/verify',{method:'POST',body:{email:$('#oe').value,code:$('#oc6').value,password:$('#onp').value}});toast(t('pwdone'));login('owner')}catch(e){toast(e&&e.error==='wrong_code'?LL('Wrong or expired code','குறியீடு தவறு அல்லது காலாவதி'):err(e),1)}}\n\n/* ---------- Master admin ---------- */\nconst fm=n=>Number(n).toLocaleString('en-IN');\nfunction masterMain(tab){S.mview=1;S.mtab=tab||S.mtab||'home';\n $('#app').innerHTML=`<header><b>☂ Kudai · ${t('master')}</b>${langBtns()}${S.me?`<button onclick=\"S.mview=0;main()\">${t('m_shopapp')}</button>`:''}<button onclick=\"S.mview=0;logout()\">⎋</button></header>\n <div id=\"tabs\">${MTABS().map(([x,l])=>`<button class=\"${S.mtab===x?'on':''}\" onclick=\"masterMain('${x}')\">${l}</button>`).join('')}</div><main id=\"main\"></main>`;\n ({home:mHome,audit:()=>mAudit(),new:mNew,billing:()=>mBilling(),msgs:()=>mMsgs(),wa:mWa,mset:mSettings}[S.mtab]||mShops)()}\nasync function mShops(mo){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{await mSet().catch(()=>{});const r=await api('/api/m/shops'+(mo?'?month='+mo:''));S.mshops=r.shops;S.mmonth=r.month;\n  $('#main').innerHTML=`<div class=\"row\" style=\"margin-bottom:8px\"><label class=\"mut\">${t('m_month')}</label><input type=\"month\" value=\"${r.month}\" onchange=\"mShops(this.value)\"></div>`\n   +(r.shops.length?r.shops.map(x=>`<div class=\"card\"><div class=\"cust\"><div><div class=\"n\">${esc(x.shop_name)}</div><div class=\"mut\">${esc(x.shop_code)} · ${esc(x.owner_name||'')} ${esc(x.owner_phone||'')}</div></div><span class=\"${x.is_active?'pos':'neg'}\">${x.is_active?t('m_active'):t('m_susp')}</span></div>\n   <div class=\"kpis\"><div class=\"kp\"><span>${t('m_cust')}</span><b>${fm(x.customers)}</b></div><div class=\"kp\"><span>${t('m_alerts')}</span><b>${fm(x.alerts_used)} / ${fm(x.monthly_msg_limit)}</b></div><div class=\"kp\"><span>${t('m_bills')}</span><b>${fm(x.bills)}</b></div><div class=\"kp\"><span>${t('m_sales')}</span><b>${rs(Number(x.sales_paise))}</b></div></div>\n   <div class=\"mut\">${t('m_staff')}: ${x.staff}/${x.max_staff} · ${t('m_owed')}: ${rs(Number(x.wallet_owed_paise))}${x.last_activity?' · '+t('m_lastact')+': '+fdt(x.last_activity):''}</div>\n   <div class=\"row\" style=\"margin-top:8px\"><button class=\"btn ghost\" onclick=\"mDetail('${x.id}')\">${LL('View details','விவரங்கள்')}</button><button class=\"btn ghost\" onclick=\"mManage('${x.id}')\">${t('m_manage')}</button></div><div id=\"mg_${x.id}\"></div></div>`).join(''):`<p class=\"mut\">${t('m_none')}</p>`)}\n catch(e){$('#main').innerHTML='';toast(err(e),1)}}\nfunction mManage(id){const x=S.mshops.find(v=>v.id===id),el=$('#mg_'+id);if(el.innerHTML){el.innerHTML='';return}\n const ty=['Tea shop','Bakery','Saloon','Restaurant','Juice shop','Other'];\n el.innerHTML=`<div style=\"margin-top:10px\"><label class=\"mut\">Shop name</label><input id=\"mn_${id}\" value=\"${esc(x.shop_name)}\">\n <label class=\"mut\">Shop type</label><select id=\"mc_${id}\">${ty.map(v=>`<option${v===x.category?' selected':''}>${v}</option>`).join('')}</select>\n <label class=\"mut\">Owner name</label><input id=\"mo_${id}\" value=\"${esc(x.owner_name||'')}\">\n <label class=\"mut\">Owner mobile</label><input id=\"mp_${id}\" inputmode=\"numeric\" value=\"${esc(x.owner_phone||'')}\">\n <label class=\"mut\">Plan fee per month (₹)</label><input id=\"mf_${id}\" inputmode=\"decimal\" value=\"${(Number(x.plan_fee_paise)||0)/100}\">\n <label class=\"mut\">Shop address (for invoice)</label><input id=\"ma_${id}\" value=\"${esc(x.address||'')}\"><label class=\"mut\">GSTIN (optional)</label><input id=\"mg2_${id}\" value=\"${esc(x.gstin||'')}\">\n <label class=\"mut\">${t('m_maxstaff')}</label><input id=\"ms_${id}\" inputmode=\"numeric\" value=\"${x.max_staff}\"><label class=\"mut\">${t('m_limit')}</label><input id=\"ml_${id}\" inputmode=\"numeric\" value=\"${x.monthly_msg_limit}\">\n <button class=\"btn\" onclick=\"mSave('${id}')\">${t('m_save')}</button>\n <div class=\"card\" style=\"background:#f6faf9;margin-top:10px\"><b>${LL('Message credits','Message credits')}: ${x.msg_credits}</b> <span class=\"mut\">(${LL('queued','வரிசை')} ${x.alerts_queued})</span><div class=\"row\" style=\"flex-wrap:wrap;margin-top:6px\">${((S.mset&&S.mset.packs)||[]).map(k=>`<button class=\"btn sm\" onclick=\"mPack('${id}',${k.qty},${k.price})\">+${k.qty} (₹${k.price})</button>`).join('')}<button class=\"btn sm ghost\" onclick=\"mAdj('${id}')\">±</button></div></div>\n <button class=\"btn ghost\" style=\"margin-top:8px\" onclick=\"mEm('${id}')\">Change owner login email</button>\n <button class=\"btn ghost\" style=\"margin-top:8px\" onclick=\"mPw('${id}')\">${t('m_ownerpw')}</button>\n <button class=\"btn ghost\" style=\"margin-top:8px\" onclick=\"mPin('${id}')\">${t('m_resetpin')}</button>\n <button class=\"btn ${x.is_active?'red':''}\" style=\"margin-top:8px\" onclick=\"mToggle('${id}',${x.is_active?0:1})\">${x.is_active?t('m_suspend'):t('m_activate')}</button></div>`}\nasync function mSave(id){try{await api('/api/m/shops/'+id,{method:'PATCH',body:{shop_name:$('#mn_'+id).value,category:$('#mc_'+id).value,owner_name:$('#mo_'+id).value,owner_phone:$('#mp_'+id).value,plan_fee:$('#mf_'+id).value,address:$('#ma_'+id).value,gstin:$('#mg2_'+id).value,max_staff:$('#ms_'+id).value,monthly_msg_limit:$('#ml_'+id).value}});toast('✓ '+t('saved'));mShops(S.mmonth)}catch(e){toast(err(e),1)}}\nasync function mEm(id){const em=prompt('New owner login email');if(!em)return;try{await api('/api/m/shops/'+id+'/owner-email',{method:'POST',body:{email:em}});toast('✓ '+t('m_done'));mShops(S.mmonth)}catch(e){toast(err(e),1)}}\nasync function mToggle(id,on){if(!on&&!confirm(t('m_suspq')))return;try{await api('/api/m/shops/'+id,{method:'PATCH',body:{is_active:!!on}});toast('✓ '+t('m_done'));mShops(S.mmonth)}catch(e){toast(err(e),1)}}\nasync function mPw(id){const pw=prompt(t('m_ownerpwq'));if(!pw)return;try{await api('/api/m/shops/'+id+'/owner-password',{method:'POST',body:{password:pw}});toast('✓ '+t('m_done'))}catch(e){toast(err(e),1)}}\nasync function mPin(id){if(!confirm(t('m_resetpinq')))return;try{await api('/api/m/shops/'+id+'/reset-admin-pin',{method:'POST'});toast('✓ '+t('m_done'))}catch(e){toast(err(e),1)}}\n\n\n/* ---------- Master PIN ---------- */\nasync function askMpin(){const pin=prompt(LL('Enter your 6-digit Master PIN','உங்கள் 6 இலக்க Master PIN-ஐ உள்ளிடவும்'));if(!pin)return false;\n try{const r=await api('/api/m/pin/verify',{method:'POST',body:{pin:pin.trim()}});S.mtok=r.token;return true}catch(e){toast(e&&e.error==='pin_locked'?err(e):LL('Wrong PIN','PIN தவறு'),1);return false}}\nasync function mPinSet(){let old='';if(S.mpinSet){old=prompt(LL('Current Master PIN','தற்போதைய Master PIN'));if(!old)return}\n const pin=prompt(LL('New 6-digit Master PIN','புதிய 6 இலக்க Master PIN'));if(!pin)return;\n if(pin!==prompt(LL('Type the new PIN again','புதிய PIN-ஐ மீண்டும் உள்ளிடவும்'))){toast(LL('PINs do not match','PIN பொருந்தவில்லை'),1);return}\n try{const r=await api('/api/m/pin/set',{method:'POST',body:{pin:pin.trim(),old_pin:old?old.trim():undefined}});S.mtok=r.token;S.mpinSet=1;toast('✓ '+LL('Master PIN saved','Master PIN சேமிக்கப்பட்டது'));masterMain(S.mtab)}\n catch(e){toast(e&&e.error==='bad_pin'?LL('PIN must be exactly 6 digits','PIN சரியாக 6 இலக்கங்கள் இருக்க வேண்டும்'):e&&e.error==='wrong_pin'?LL('Current PIN is wrong','தற்போதைய PIN தவறு'):err(e),1)}}\nconst pinCard=()=>`<div class=\"card ${S.mpinSet?'':'att warn'}\"><div class=\"cust\"><div><b>🔐 ${LL('Master PIN','Master PIN')}</b><div class=\"mut\">${S.mpinSet?LL('Protects password resets, credits, fees and settings.','password reset, credits, கட்டணம், அமைப்புகளைப் பாதுகாக்கிறது.'):LL('Not set. Set a 6-digit PIN so a stolen login cannot change money or passwords.','அமைக்கப்படவில்லை. 6 இலக்க PIN அமைத்தால், login திருடப்பட்டாலும் பணம்/password மாற்ற முடியாது.')}</div></div><button class=\"btn sm ${S.mpinSet?'ghost':''}\" onclick=\"mPinSet()\">${S.mpinSet?LL('Change','மாற்று'):LL('Set PIN','PIN அமை')}</button></div></div>`;\n/* ---------- master: overview, shop details, activity ---------- */\nconst AUDL={'shop.create':['New shop created','புதிய கடை உருவாக்கப்பட்டது'],'shop.edit':['Shop details edited','கடை விவரம் திருத்தப்பட்டது'],'shop.suspend':['Shop suspended','கடை முடக்கப்பட்டது'],'shop.activate':['Shop activated','கடை செயல்படுத்தப்பட்டது'],\n 'shop.pack':['Message credits changed','Message credits மாற்றப்பட்டது'],'owner.email':['Owner login email changed','Owner email மாற்றப்பட்டது'],'owner.password':['Owner password reset','Owner password மாற்றப்பட்டது'],'owner.pin_reset':['Admin PIN reset','Admin PIN reset செய்யப்பட்டது'],'pin.set':['Master PIN set','Master PIN அமைக்கப்பட்டது'],'pin.change':['Master PIN changed','Master PIN மாற்றப்பட்டது'],\n 'settings.save':['Billing settings saved','Billing அமைப்புகள் சேமிக்கப்பட்டன'],'job.run':['Daily job run manually','Daily job கைமுறையாக இயக்கப்பட்டது'],'invoice.generate':['Invoices generated','Invoices உருவாக்கப்பட்டன'],\n 'invoice.issue':['Invoice issued','Invoice வழங்கப்பட்டது'],'invoice.paid':['Invoice marked paid','Invoice பணம் பெறப்பட்டது'],'invoice.void':['Invoice voided','Invoice ரத்து'],'invoice.draft':['Invoice back to draft','Invoice draft-க்குத் திரும்பியது'],'invoice.edit':['Invoice edited','Invoice திருத்தப்பட்டது']};\nconst sgn=v=>(v>0?'+':v<0?'−':'')+rs(Math.abs(v));\nconst audTxt=a=>{const l=AUDL[a];return l?LL(l[0],l[1]):a};\nconst audDetail=d=>{if(!d||typeof d!=='object')return'';const o=[];for(const[k,v]of Object.entries(d)){if(v===undefined||v===null||v==='')continue;\n const val=/paise$/.test(k)?rs(Number(v)):(Array.isArray(v)?v.join(', '):v);o.push(esc(k.replace(/_paise$/,'').replace(/_/g,' '))+': '+esc(String(val)))}return o.join(' · ')};\nfunction tilesOf(a){return a.map(([l,v,c])=>`<div class=\"stat ${c||''}\"><span>${l}</span><b>${v}</b></div>`).join('')}\nasync function mHome(){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const [h,pn]=await Promise.all([api('/api/m/health'),api('/api/m/pin').catch(()=>({set:true}))]);S.mpinSet=!!pn.set;const T=h.totals||{};\n  const sec=(title,cls,items,fn)=>`<div class=\"card att ${cls}\"><div class=\"atth\">${title}<span class=\"pill\">${items.length}</span></div>${items.map(fn).join('')}</div>`;\n  const row=(id,a,b)=>`<div class=\"arow\" onclick=\"${id?`mDetail('${id}')`:''}\"><b>${esc(a)}</b><span class=\"mut\">${b}</span></div>`;\n  const blocks=[];\n  if(h.failed.length)blocks.push(sec('⚠ '+LL('Failed WhatsApp messages (7 days)','தோல்வியடைந்த WhatsApp செய்திகள் (7 நாள்)'),'bad',h.failed,x=>row(x.shop_id,x.shop_name,x.n+' · '+esc(x.last_error||''))));\n  if(h.unpaid.length)blocks.push(sec('₹ '+LL('Unpaid invoices','பணம் வராத invoices'),'warn',h.unpaid,x=>row(null,x.shop_name,esc(x.number)+' · '+rs(Number(x.total_paise))+' · '+x.age_days+LL(' days',' நாள்'))));\n  if(h.allowance.length)blocks.push(sec('✉ '+LL('Alert allowance almost used','Alert allowance தீரப்போகிறது'),'warn',h.allowance,x=>row(x.shop_id,x.shop_name,x.used+' / '+x.lim+' · credits '+x.credits)));\n  if(h.quiet.length)blocks.push(sec('💤 '+LL('No bills for 7 days','7 நாளாக bill இல்லை'),'',h.quiet,x=>row(x.shop_id,x.shop_name,x.last_txn?fdt(x.last_txn):LL('never','இதுவரை இல்லை'))));\n  if(h.held>0)blocks.push(`<div class=\"card att warn\"><div class=\"atth\">⏸ ${LL('Held messages','நிறுத்தி வைத்த செய்திகள்')}<span class=\"pill\">${h.held}</span></div><div class=\"mut\">${LL('Shops over their allowance with no credits. Add a pack in Shops → Manage.','Allowance முடிந்து credits இல்லாத கடைகள். Shops → Manage-ல் pack சேருங்கள்.')}</div></div>`);\n  if(h.drafts>0)blocks.push(`<div class=\"card att\"><div class=\"atth\">🧾 ${LL('Draft invoices waiting to be issued','வழங்கப்படாத draft invoices')}<span class=\"pill\">${h.drafts}</span></div></div>`);\n  $('#main').innerHTML=`<div class=\"stats\">${tilesOf([[t('m_shops'),fm(T.shops)],[t('m_active'),fm(T.active)],[t('m_cust'),fm(T.customers)],[t('m_owed'),rs(Number(T.wallet_paise))]])}</div>\n   ${S.mpinSet?'':pinCard()}<h3>${LL('Needs attention','கவனம் தேவை')}</h3>`+(blocks.length?blocks.join(''):`<div class=\"card ok\">✓ ${LL('All good. Nothing needs your attention.','எல்லாம் சரி. கவனிக்க எதுவுமில்லை.')}</div>`)}\n catch(e){$('#main').innerHTML='';toast(err(e),1)}}\nasync function mDetail(id){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const [d,shops]=await Promise.all([api('/api/m/shops/'+id+'/detail'),S.mshops?Promise.resolve({shops:S.mshops}):api('/api/m/shops')]);S.mshops=shops.shops;const x=S.mshops.find(v=>v.id===id)||{shop_name:'',shop_code:''};\n  const ty={RECHARGE:LL('Recharge','ரீசார்ஜ்'),DEDUCT:LL('Bill','பில்'),REVERSAL:LL('Reversal','திருத்தம்'),POINTS_REDEEM:LL('Points','புள்ளிகள்')};\n  const msgs=(d.msgs||[]).map(m=>m.status+' '+m.n).join(' · ')||'—';\n  $('#main').innerHTML=`<div class=\"row\" style=\"margin-bottom:6px\"><button class=\"btn sm ghost\" onclick=\"masterMain('shops')\">← ${t('m_shops')}</button><button class=\"btn sm ghost\" onclick=\"mAudit('${id}')\">${LL('Activity','செயல்பாடு')}</button></div>\n  <div class=\"card\"><div class=\"cust\"><div><div class=\"n\">${esc(x.shop_name)}</div><div class=\"mut\">${esc(x.shop_code)} · ${esc(x.owner_name||'')} ${esc(x.owner_phone||'')}</div></div><span class=\"${x.is_active===false?'neg':'pos'}\">${x.is_active===false?t('m_susp'):t('m_active')}</span></div></div>\n  <div class=\"stats\">${tilesOf([[t('m_cust'),fm(d.customers)],[t('m_owed'),rs(Number(d.wallet_paise))],[LL('Today bills','இன்று bills'),fm(d.today.bills)+' · '+rs(Number(d.today.sales_paise))],[LL('Month sales','மாத விற்பனை'),rs(Number(d.month.sales_paise))],[LL('Money added (month)','சேர்த்த பணம் (மாதம்)'),rs(Number(d.month.added_paise))],[LL('Messages (30 days)','செய்திகள் (30 நாள்)'),esc(msgs)]])}</div>\n  <h3>${LL('Recent activity','சமீபத்திய பரிவர்த்தனைகள்')}</h3><div class=\"card\">${d.recent.length?d.recent.map(r=>`<div class=\"tx\"><div><b>${esc(r.customer)}</b> <span class=\"mut\">#${r.short_id}</span><div class=\"mut\">${ty[r.type]||r.type}${r.status!=='COMPLETED'?' · '+r.status:''} · ${fdt(r.at)}${r.pay_method?' · '+r.pay_method:''}</div></div><span class=\"${Number(r.wallet_change_paise)>=0?'pos':'neg'}\">${Number(r.wallet_change_paise)>=0?'+':'−'}${rs(Math.abs(Number(r.wallet_change_paise)))}</span></div>`).join(''):`<p class=\"mut\">${t('nothing')}</p>`}</div>\n  <h3>${LL('Find a customer','Customer தேடு')}</h3><div class=\"card\"><div class=\"row\"><input id=\"mdq\" placeholder=\"${t('findph')}\" onkeydown=\"if(event.key==='Enter')mDCust('${id}')\"><button class=\"btn sm\" onclick=\"mDCust('${id}')\">${t('search')}</button></div><div id=\"mdc\"></div></div>\n  <h3>${LL('Top wallets','அதிக இருப்புள்ளவர்கள்')}</h3><div class=\"card\">${d.top.length?d.top.map(c=>`<div class=\"tx\"><div><b>${esc(c.name)}</b> <span class=\"mut\">#${c.short_id} · ${esc(c.mobile)}</span></div><span class=\"tb\">${rs(Number(c.wallet_paise))}</span></div>`).join(''):`<p class=\"mut\">${t('nothing')}</p>`}</div>\n  <h3>${LL('Staff','ஊழியர்கள்')}</h3><div class=\"card\">${d.staff.map(s=>`<div class=\"tx\"><div><b>${esc(s.name||'')}</b> <span class=\"mut\">${esc(s.role)} · ${esc(s.mobile||s.email||'')}</span></div></div>`).join('')||'—'}</div>\n  <h3>${LL('Day closes','நாள் முடிவுகள்')}</h3><div class=\"card\">${d.closes.length?d.closes.map(c=>`<div class=\"tx\"><div>${fdt(c.closed_at)}<div class=\"mut\">${c.status}${c.revision>1?' · rev '+c.revision:''}${(c.summary||{}).cash_diff_paise!==undefined?' · '+LL('cash diff','பண வேறுபாடு')+' '+sgn(Number(c.summary.cash_diff_paise)):''}</div></div><span class=\"tb\">${rs(Number((c.summary||{}).gross_sales_paise||0))}</span></div>`).join(''):`<p class=\"mut\">${t('nothing')}</p>`}</div>`}\n catch(e){toast(err(e),1);masterMain('shops')}}\nasync function mDCust(id){const q=$('#mdq').value;try{const r=await api('/api/m/shops/'+id+'/customers?q='+encodeURIComponent(q));\n $('#mdc').innerHTML=r.length?r.map(c=>`<div class=\"tx\"><div><b>${esc(c.name)}</b> <span class=\"mut\">#${c.short_id} · ${esc(c.mobile)}</span><div class=\"mut\">${c.points} ${t('points')}</div></div><span class=\"tb\">${rs(Number(c.wallet_paise))}</span></div>`).join(''):`<p class=\"mut\">${t('nothing')}</p>`}catch(e){toast(err(e),1)}}\nasync function mAudit(shop){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const r=await api('/api/m/audit'+(shop?'?shop='+shop:''));\n  $('#main').innerHTML=(shop?`<button class=\"btn sm ghost\" style=\"margin-bottom:8px\" onclick=\"mDetail('${shop}')\">← ${LL('Back','பின்')}</button>`:'')+`<h3>${LL('Activity log (who changed what)','செயல்பாட்டுப் பதிவு (யார் எதை மாற்றினார்)')}</h3>`\n   +(r.length?r.map(a=>`<div class=\"card\"><div class=\"cust\"><b>${esc(audTxt(a.action))}</b><span class=\"mut\">${fdt(a.at)}</span></div><div class=\"mut\">${esc(a.shop_name||'—')} · ${esc(a.actor)}</div><div class=\"mut\" style=\"font-size:13px\">${audDetail(a.detail)}</div></div>`).join(''):`<p class=\"mut\">${t('nothing')}</p>`)}\n catch(e){$('#main').innerHTML='';toast(err(e),1)}}\n/* ---------- master: billing, messages, WhatsApp, settings ---------- */\nconst MTABS=()=>[['home',LL('Overview','முகப்பு')],['shops',t('m_shops')],['new',t('m_new')],['billing',LL('Billing','பில்லிங்')],['msgs',LL('Messages','செய்திகள்')],['wa','WhatsApp'],['audit',LL('Activity','செயல்பாடு')],['mset',LL('Settings','அமைப்புகள்')]];\nasync function mSet(){if(!S.mset)S.mset=await api('/api/m/settings');return S.mset}\nasync function mPack(id,qty,price){if(!confirm(LL('Add','சேர்')+' '+qty+' '+LL('messages for','செய்திகள்')+' ₹'+price+'?'))return;\n try{const r=await api('/api/m/shops/'+id+'/pack',{method:'POST',body:{qty,price}});toast('✓ '+r.credits);mShops(S.mmonth)}catch(e){toast(err(e),1)}}\nasync function mAdj(id){const q=prompt(LL('Credits to add (use minus to remove):','சேர்க்க வேண்டிய credits (நீக்க மைனஸ்):'));if(!q)return;\n try{const r=await api('/api/m/shops/'+id+'/pack',{method:'POST',body:{qty:q,price:0,note:'adjustment'}});toast('✓ '+r.credits);mShops(S.mmonth)}catch(e){toast(err(e),1)}}\n/* billing */\nfunction curMonth(){const d=new Date(Date.now()+19800000);return d.toISOString().slice(0,7)}\nasync function mBilling(mo){mo=mo||S.bmonth||curMonth();S.bmonth=mo;$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const rows=await api('/api/m/invoices?month='+mo);S.binv=rows;const tot=rows.reduce((a,r)=>a+r.grand_paise,0),paid=rows.filter(r=>r.status==='PAID').reduce((a,r)=>a+r.grand_paise,0);\n  $('#main').innerHTML=`<div class=\"row\" style=\"margin-bottom:8px\"><label class=\"mut\">${t('m_month')}</label><input type=\"month\" value=\"${mo}\" onchange=\"mBilling(this.value)\"></div>\n  <div class=\"row\"><button class=\"btn\" onclick=\"mGen()\">${LL('Generate invoices','Invoices உருவாக்கு')}</button><button class=\"btn ghost\" onclick=\"openDoc('/api/m/invoices/html?month=${mo}')\">🖨 ${LL('Print all','அனைத்தும் அச்சிடு')}</button></div>\n  <div class=\"mut\" style=\"margin:6px 0\">${rows.length} ${LL('invoices','invoices')} · ${LL('Total','மொத்தம்')} ${rs(tot)} · ${LL('Received','பெற்றது')} ${rs(paid)}</div>\n  ${rows.map(r=>`<div class=\"card\"><div class=\"cust\"><div><div class=\"n\">${esc(r.shops?r.shops.shop_name:'')}</div><div class=\"mut\">${esc(r.number)}</div></div><div style=\"text-align:right\"><b>${rs(r.grand_paise)}</b><div class=\"${r.status==='PAID'?'pos':'mut'}\">${r.status}</div></div></div>\n  <div class=\"row\" style=\"margin-top:6px;flex-wrap:wrap\"><button class=\"btn sm ghost\" onclick=\"openDoc('/api/m/invoices/${r.id}/html')\">${LL('View / Print','பார் / அச்சிடு')}</button>\n  ${r.status==='DRAFT'?`<button class=\"btn sm ghost\" onclick=\"mInv('${r.id}')\">${LL('Edit','திருத்து')}</button><button class=\"btn sm\" onclick=\"mInvAct('${r.id}','issue')\">${LL('Issue','வெளியிடு')}</button>`:''}\n  ${r.status==='ISSUED'?`<button class=\"btn sm\" onclick=\"mInvPaid('${r.id}')\">${LL('Mark paid','பணம் பெற்றது')}</button><button class=\"btn sm ghost\" onclick=\"mInvAct('${r.id}','draft')\">${LL('Back to draft','Draft-க்கு')}</button>`:''}\n  ${r.status!=='PAID'?`<button class=\"btn sm red\" onclick=\"mInvAct('${r.id}','void')\">${LL('Void','ரத்து')}</button>`:''}</div></div>`).join('')||`<p class=\"mut\">${LL('No invoices for this month. Press Generate.','இந்த மாதம் invoice இல்லை. Generate அழுத்தவும்.')}</p>`}`}\n catch(e){$('#main').innerHTML='';toast(err(e),1)}}\nasync function mGen(){let off=0,c=0,s=0;try{for(let i=0;i<40;i++){const r=await api('/api/m/invoices/generate',{method:'POST',body:{month:S.bmonth,offset:off}});c+=r.created;s+=r.skipped;if(r.done)break;off=r.next}\n toast('✓ '+c+' '+LL('created','உருவாக்கப்பட்டது')+', '+s+' '+LL('skipped','தவிர்க்கப்பட்டது'));mBilling(S.bmonth)}catch(e){toast(err(e),1)}}\nasync function mInvAct(id,a){if(a==='void'&&!confirm(LL('Void this invoice?','இந்த invoice-ஐ ரத்து செய்யவா?')))return;try{await api('/api/m/invoices/'+id,{method:'PATCH',body:{action:a}});mBilling(S.bmonth)}catch(e){toast(err(e),1)}}\nasync function mInvPaid(id){const n=prompt(LL('Payment note (UPI ref / cash):','பணம் குறிப்பு (UPI ref / cash):'),'UPI');if(n===null)return;try{await api('/api/m/invoices/'+id,{method:'PATCH',body:{action:'paid',note:n}});mBilling(S.bmonth)}catch(e){toast(err(e),1)}}\nasync function mInv(id){try{const v=await api('/api/m/invoices/'+id);S.ed={id,lines:v.lines.map(l=>({desc:l.desc,qty:l.qty,rate:l.rate_paise/100})),notes:v.notes||'',shop:v.shops?v.shops.shop_name:'',no:v.number};edDraw()}catch(e){toast(err(e),1)}}\nfunction edDraw(){const e=S.ed;$('#main').innerHTML=`<button class=\"btn ghost\" onclick=\"mBilling(S.bmonth)\">← ${t('back')}</button><div class=\"card\"><b>${esc(e.shop)}</b> · ${esc(e.no)}\n <p class=\"mut\">${LL('Add an adjustment or discount as a line with a minus rate and a comment in the description.','Adjustment / discount-ஐ மைனஸ் rate உடன் விளக்கத்தில் குறிப்புடன் சேர்க்கவும்.')}</p>\n ${e.lines.map((l,i)=>`<div class=\"card\" style=\"background:#f6faf9\"><input value=\"${esc(l.desc)}\" oninput=\"S.ed.lines[${i}].desc=this.value\" placeholder=\"${LL('Description','விளக்கம்')}\"><div class=\"row\"><input value=\"${l.qty}\" inputmode=\"numeric\" style=\"max-width:70px\" oninput=\"S.ed.lines[${i}].qty=this.value\"><input value=\"${l.rate}\" inputmode=\"decimal\" oninput=\"S.ed.lines[${i}].rate=this.value\" placeholder=\"₹\"><button class=\"btn sm red\" onclick=\"S.ed.lines.splice(${i},1);edDraw()\">✕</button></div></div>`).join('')}\n <button class=\"btn ghost\" onclick=\"S.ed.lines.push({desc:'',qty:1,rate:0});edDraw()\">+ ${LL('Add line','வரி சேர்')}</button><button class=\"btn ghost\" style=\"margin-top:6px\" onclick=\"S.ed.lines.push({desc:'Discount – ',qty:1,rate:-0});edDraw()\">+ ${LL('Discount line','Discount வரி')}</button>\n <input id=\"ednote\" placeholder=\"${LL('Note on invoice (optional)','Invoice குறிப்பு (விருப்பம்)')}\" value=\"${esc(e.notes)}\" style=\"margin-top:8px\"><button class=\"btn\" onclick=\"edSave()\">${t('save')}</button></div>`}\nasync function edSave(){const e=S.ed;try{await api('/api/m/invoices/'+e.id,{method:'PATCH',body:{lines:e.lines,notes:$('#ednote').value}});toast('✓ '+t('saved'));mBilling(S.bmonth)}catch(x){toast(err(x),1)}}\n/* messages */\nasync function mMsgs(st){st=st===undefined?(S.mst||''):st;S.mst=st;$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const rows=await api('/api/m/messages'+(st?'?status='+st:''));\n  $('#main').innerHTML=`<div class=\"row\" style=\"margin-bottom:8px\"><select onchange=\"mMsgs(this.value)\">${['','queued','sent','failed','held','skipped'].map(x=>`<option value=\"${x}\" ${x===st?'selected':''}>${x||LL('All','அனைத்தும்')}</option>`).join('')}</select><button class=\"btn sm\" onclick=\"mSendNow()\">${LL('Send queued now','வரிசையை இப்போது அனுப்பு')}</button></div>\n  ${rows.map(x=>`<div class=\"card\"><div class=\"mut\">${ST[x.status]||''} ${x.status} · ${esc(x.shop)} · ${esc(x.name||'')} · +${esc(x.to||'')} · ${fdt(x.created_at)} · ${x.kind}${x.error?' · '+esc(x.error):''}</div><div style=\"white-space:pre-wrap;font-size:14px\">${esc(x.text)}</div>${x.status==='failed'||x.status==='held'?`<button class=\"btn sm ghost\" onclick=\"mRetry('${x.id}')\">${LL('Retry','மீண்டும்')}</button>`:''}</div>`).join('')||`<p class=\"mut\">${LL('No messages','செய்திகள் இல்லை')}</p>`}`}\n catch(e){$('#main').innerHTML='';toast(err(e),1)}}\nasync function mRetry(id){try{await api('/api/m/messages/retry',{method:'POST',body:{id}});mMsgs()}catch(e){toast(err(e),1)}}\nasync function mSendNow(){try{const r=await api('/api/m/send',{method:'POST'});toast(r.mode+': '+r.sent+' sent, '+r.failed+' failed, '+r.held+' held');mMsgs()}catch(e){toast(err(e),1)}}\n/* WhatsApp status + templates */\nasync function mWa(){$('#main').innerHTML='<p class=\"mut\">…</p>';\n try{const [w,tp]=await Promise.all([api('/api/m/wa'),api('/api/m/templates')]);\n  $('#main').innerHTML=`<div class=\"card\"><h3 style=\"margin-top:0\">${w.live?'🟢 WhatsApp LIVE':'🟡 TEST MODE (simulate)'}</h3>\n  <div class=\"mut\">Phone Number ID: ${esc(w.phone_id||'not set')}<br>WABA ID: ${esc(w.waba_id||'not set')}<br>Verify token: ${w.verify_set?'set':'NOT set'} · App secret: ${w.secret_set?'set':'NOT set'}<br>Webhook URL: <b>${esc(w.webhook)}</b><br>Queued ${w.queued} · Held ${w.held} · Failed ${w.failed}</div>\n  <div class=\"row\" style=\"margin-top:8px\"><button class=\"btn sm\" onclick=\"mSendNow2()\">${LL('Send queued now','வரிசையை அனுப்பு')}</button><button class=\"btn sm ghost\" onclick=\"mJob()\">${LL('Run daily job now','Daily job இப்போது')}</button></div>\n  <input id=\"tm\" inputmode=\"numeric\" maxlength=\"12\" placeholder=\"${LL('Mobile to test','சோதனை எண்')}\" style=\"margin-top:8px\"><button class=\"btn ghost\" onclick=\"mWaTest()\">${LL('Send test message','சோதனைச் செய்தி')}</button></div>\n  <h3>${LL('Templates to create in Meta','Meta-வில் உருவாக்க வேண்டிய templates')}</h3><p class=\"mut\">${LL('WhatsApp Manager → Message templates → Create. Use the exact name, category, language and text. Copy buttons help.','WhatsApp Manager → Message templates → Create. சரியான பெயர், வகை, மொழி, உரையைப் பயன்படுத்துங்கள்.')}</p>\n  ${tp.map((x,i)=>`<div class=\"card\"><div class=\"cust\"><div><div class=\"n\">${esc(x.name)}</div><div class=\"mut\">${x.category} · ${esc(x.language)}${x.header?' · header: '+x.header:''}</div></div><span style=\"display:flex;gap:4px\"><button class=\"btn sm ghost\" onclick=\"cp(${i},'n')\">name</button><button class=\"btn sm ghost\" onclick=\"cp(${i},'b')\">text</button></span></div><div style=\"white-space:pre-wrap;font-size:13px\">${esc(x.body)}</div><div class=\"mut\">examples: ${esc(x.example.join(' | '))}</div></div>`).join('')}`;S.tpl=tp}\n catch(e){$('#main').innerHTML='';toast(err(e),1)}}\nfunction cp(i,k){const x=S.tpl[i];const v=k==='n'?x.name:x.body;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('✓ copied')).catch(()=>prompt('Copy:',v))}\nasync function mSendNow2(){try{const r=await api('/api/m/send',{method:'POST'});toast(r.mode+': '+r.sent+' sent, '+r.failed+' failed, '+r.held+' held');mWa()}catch(e){toast(err(e),1)}}\nasync function mJob(){if(!confirm(LL('Close the day for all shops now (test)? Shops with activity get a day close and summary.','அனைத்துக் கடைகளுக்கும் இப்போது நாள் முடிக்கவா (சோதனை)?')))return;try{const r=await api('/api/m/job',{method:'POST'});toast('closed '+r.closed+' / checked '+r.checked)}catch(e){toast(err(e),1)}}\nasync function mWaTest(){try{const r=await api('/api/m/wa/test',{method:'POST',body:{mobile:$('#tm').value}});toast(r.simulated?'Test mode: nothing sent':r.ok?'✓ sent':'✗ '+(r.err||''),!r.simulated&&!r.ok)}catch(e){toast(err(e),1)}}\n/* platform settings */\nasync function mSettings(){$('#main').innerHTML='<p class=\"mut\">…</p>';try{const s=await mSet();try{S.mpinSet=!!(await api('/api/m/pin')).set}catch(e){}const f=(k,l,ph)=>`<label class=\"mut\">${l}</label><input id=\"ps_${k}\" value=\"${esc(s[k]||'')}\" placeholder=\"${ph||''}\">`;const pk=(s.packs||[]).concat([{},{},{}]).slice(0,3);\n $('#main').innerHTML=pinCard()+`<div class=\"card\"><h3 style=\"margin-top:0\">${LL('Your business (invoice header)','உங்கள் நிறுவனம் (invoice header)')}</h3>${f('biz_name','Business name')}${f('address','Address')}${f('phone','Phone')}${f('email','Email')}${f('gstin','GSTIN (optional)')}${f('pan','PAN (optional)')}\n <label class=\"mut\">Payment details (UPI / bank) shown on invoice</label><textarea id=\"ps_pay_text\" rows=\"3\">${esc(s.pay_text||'')}</textarea>${f('terms','Terms line')}${f('invoice_prefix','Invoice prefix (2-6 letters)')}\n <label class=\"mut\">GST % on invoices (0 = none)</label><input id=\"ps_gst_percent\" inputmode=\"decimal\" value=\"${s.gst_percent||0}\"><label class=\"mut\">Default monthly plan fee for new shops (₹)</label><input id=\"ps_default_plan_fee\" inputmode=\"decimal\" value=\"${s.default_plan_fee||0}\">\n <h3>${LL('Message packs','Message packs')}</h3>${pk.map((x,i)=>`<div class=\"row\"><input id=\"pq${i}\" inputmode=\"numeric\" placeholder=\"messages\" value=\"${x.qty||''}\"><input id=\"pp${i}\" inputmode=\"decimal\" placeholder=\"₹ price\" value=\"${x.price===undefined?'':x.price}\"></div>`).join('')}\n <button class=\"btn\" onclick=\"mSetSave()\">${t('save')}</button></div>`}catch(e){$('#main').innerHTML='';toast(err(e),1)}}\nasync function mSetSave(){const b={};['biz_name','address','phone','email','gstin','pan','pay_text','terms','invoice_prefix','gst_percent','default_plan_fee'].forEach(k=>b[k]=$('#ps_'+k).value);\n b.packs=[0,1,2].map(i=>({qty:$('#pq'+i).value,price:$('#pp'+i).value})).filter(x=>x.qty);try{S.mset=await api('/api/m/settings',{method:'POST',body:b});toast('✓ '+t('saved'))}catch(e){toast(err(e),1)}}\n\nfunction genPw(){const c='abcdefghjkmnpqrstuvwxyz23456789';let o='';const a=crypto.getRandomValues(new Uint8Array(10));for(const v of a)o+=c[v%c.length];return o}\nfunction mNew(){$('#main').innerHTML=`<div class=\"card\"><input id=\"n_name\" placeholder=\"${t('m_shopname')} *\"><select id=\"n_cat\"><option>Tea shop</option><option>Bakery</option><option>Saloon</option><option>Restaurant</option><option>Juice shop</option><option>Other</option></select>\n <input id=\"n_owner\" placeholder=\"${t('m_ownername')} *\"><input id=\"n_phone\" inputmode=\"numeric\" maxlength=\"12\" placeholder=\"${t('m_ownerphone')}\"><input id=\"n_mail\" type=\"email\" autocapitalize=\"none\" placeholder=\"${t('m_ownermail')} *\">\n <div class=\"row\"><input id=\"n_pw\" placeholder=\"${t('m_pw')} *\" autocapitalize=\"none\"><button class=\"btn sm ghost\" onclick=\"$('#n_pw').value=genPw()\">${t('m_gen')}</button></div>\n <select id=\"n_lang\"><option value=\"ta\">தமிழ்</option><option value=\"en\">English</option></select><button class=\"btn\" onclick=\"mCreate()\">${t('m_create')}</button></div><div id=\"n_out\"></div>`}\nasync function mCreate(){try{const b={shop_name:$('#n_name').value,category:$('#n_cat').value,owner_name:$('#n_owner').value,owner_phone:$('#n_phone').value,owner_email:$('#n_mail').value,password:$('#n_pw').value,default_lang:$('#n_lang').value};\n const r=await api('/api/m/shops',{method:'POST',body:b});const tx=`Kudai - ${r.shop.name}\\nApp: ${location.origin}\\nOwner login (Owner tab):\\nEmail: ${r.login.email}\\nPassword: ${r.login.password}`;S.ctx=tx;\n $('#n_out').innerHTML=`<div class=\"card ok\"><b>${t('m_created')}</b><pre style=\"white-space:pre-wrap;font-size:15px\">${esc(tx)}</pre><button class=\"btn ghost\" onclick=\"copyTx()\">${t('m_copy')}</button></div>`;\n ['n_name','n_owner','n_phone','n_mail','n_pw'].forEach(i=>$('#'+i).value='')}catch(e){toast(err(e),1)}}\nfunction copyTx(){try{navigator.clipboard.writeText(S.ctx);toast('✓ '+t('copied'))}catch(e){toast(S.ctx)}}\n\n(async function boot(){load();\n {const h=new URLSearchParams(location.hash.slice(1));if(h.get('type')==='recovery'&&h.get('access_token')){if(!S.lang)S.lang=(navigator.language||'').startsWith('ta')?'ta':'en';return recoveryUI(h.get('access_token'))}}\n if(S.tok){try{const kind=await loadMe();if(kind==='master'){if(!S.lang)S.lang='en';return masterMain()}if(!S.lang)S.lang=S.me.shop.default_lang;await loadMenu();return main()}catch(e){S.tok=null;S.me=null}}\n if(!S.lang)S.lang=(navigator.language||'').startsWith('ta')?'ta':'en';login()})();\n</script></body></html>\n";
const CHTML = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1\">\n<meta name=\"theme-color\" content=\"#0f766e\"><link rel=\"icon\" href=\"/icon.svg\">\n<title>Kudai Wallet</title>\n<style>\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\n:root{--ink:#0c2230;--mut:#6b8190;--line:#e3e9ee;--bg:#f2f5f8;--pri:#0f766e;--pri2:#0b5d57;--soft:#e6f4f2;--gold2:#e8c36a;--red:#b42318;--sh2:0 1px 2px rgba(12,34,48,.04),0 10px 28px rgba(12,34,48,.07)}\nbody{margin:0;font-family:\"Inter\",system-ui,-apple-system,\"Segoe UI\",Roboto,\"Noto Sans Tamil\",sans-serif;background:radial-gradient(900px 420px at 50% -100px,#dff1ee 0,transparent 70%),var(--bg);color:var(--ink);font-size:16px;line-height:1.4;font-variant-numeric:tabular-nums;min-height:100vh}\n.wrap{max-width:440px;margin:0 auto;padding:16px 16px 84px}\n.top{display:flex;align-items:center;gap:8px;margin-bottom:12px}.top b{flex:1;font-size:19px;font-weight:800;color:var(--ink);letter-spacing:-.02em}\n.lg button,.top button{border:1.5px solid var(--line);background:#fff;border-radius:10px;padding:6px 11px;margin-left:4px;font-size:14px;color:var(--ink)}\n.lg button.on{background:var(--pri);color:#fff;border-color:var(--pri)}\ninput{width:100%;padding:14px;border:1.5px solid var(--line);border-radius:12px;font-size:17px;background:#fff;margin:5px 0;font-family:inherit;box-shadow:0 1px 2px rgba(12,34,48,.05)}\ninput:focus{outline:0;border-color:var(--pri);box-shadow:0 0 0 4px rgba(15,118,110,.14)}\n.btn{background:linear-gradient(180deg,#14877e,var(--pri));color:#fff;border:0;border-radius:14px;padding:15px;font-size:17px;font-weight:700;width:100%;margin-top:8px;display:block;text-align:center;text-decoration:none;box-shadow:0 1px 0 rgba(255,255,255,.18) inset,0 8px 18px rgba(15,118,110,.28)}\n.btn.ghost{background:var(--soft);color:var(--pri2);box-shadow:none;border:1px solid #cfe7e3}.btn:disabled{background:#a9c3bf;box-shadow:none}\n.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:15px;margin:12px 0;box-shadow:var(--sh2)}\n.seg{display:flex;background:#e4ecef;border-radius:12px;padding:3px;margin:10px 0}\n.seg button{flex:1;border:0;background:none;padding:10px 2px;border-radius:10px;font-size:15px;color:var(--mut);font-weight:600}\n.seg button.on{background:#fff;color:var(--pri2);font-weight:750;box-shadow:0 1px 3px rgba(12,34,48,.12)}\n.bal{background:linear-gradient(135deg,#08323a 0,#0b5d57 55%,#0f766e 100%);color:#fff;border-radius:22px;padding:22px;margin:14px 0;box-shadow:0 18px 36px rgba(11,93,87,.32);position:relative;overflow:hidden;border:1px solid rgba(232,195,106,.5)}\n.bal:after{content:\"\";position:absolute;right:-40px;top:-40px;width:150px;height:150px;border-radius:50%;background:rgba(232,195,106,.16)}\n.bal small{opacity:.85;letter-spacing:.06em;text-transform:uppercase;font-size:12px;font-weight:650}.bal .a{font-size:42px;font-weight:800;margin:6px 0;letter-spacing:-.03em}\n.chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}\n.chips button{padding:10px 15px;border-radius:999px;border:1.5px solid #bfe0db;background:#fff;color:var(--pri2);font-size:16px;font-weight:600}\n.chips button.on{background:var(--pri);color:#fff;border-color:var(--pri);box-shadow:0 4px 10px rgba(15,118,110,.25)}\n.mut{color:var(--mut);font-size:14px}h3{margin:20px 2px 8px;font-size:12.5px;font-weight:700;color:#3d5563;text-transform:uppercase;letter-spacing:.09em}\n.tx{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #eef2f5;gap:8px}\n.pos{color:var(--pri);font-weight:750}.neg{color:var(--red);font-weight:750}\n.pay{text-align:center}.pay .a{font-size:40px;font-weight:800;color:var(--pri);letter-spacing:-.03em}\n#toast{position:fixed;left:12px;right:12px;bottom:18px;max-width:416px;margin:auto;padding:14px;border-radius:14px;background:rgba(12,34,48,.96);color:#fff;text-align:center;display:none;font-weight:600;box-shadow:0 14px 34px rgba(12,34,48,.4)}\n#toast.bad{background:rgba(180,35,24,.97)}\nlabel.ck{display:flex;gap:8px;align-items:center;margin:8px 0}label.ck input{width:auto;margin:0}\n</style></head><body><div class=\"wrap\" id=\"app\"></div><div id=\"toast\"></div>\n<script>\nconst T={\nen:{login:'Log in',register:'Join',setpin:'Set PIN',mobile:'Mobile number',pin:'4-digit PIN',newpin:'New 4-digit PIN',name:'Your name',\nemailopt:'Email (optional)',offers:'OK to receive offers',go:'Continue',code:'6-digit code from the shop',\ncodehelp:'Ask the shop for a code if you were registered at the counter or forgot your PIN.',\nbalance:'Wallet balance',points:'points',recharge:'Add money',pick:'Pick an amount',bonus:'Bonus',walletget:'Wallet gets',\npay:'Pay',payexact:'Pay exactly this amount',payhelp:'The paise (like .07) is how the shop recognises your payment. Do not change the amount.',\nopenupi:'Open UPI app',manual:'If the button shows an error, pay manually: open any UPI app, choose Pay to UPI ID, and enter these two things.',upiid:'UPI ID',amount:'Amount',copy:'Copy',copied:'Copied',notwork:'Button not working?',timeleft:'Time left',waiting:'Waiting for payment… your wallet updates by itself.',\npaid:'Money added to your wallet',expired:'This request expired. Start again.',cancel:'Cancel',\nredeem:'Redeem points',redeemfor:'points → wallet',history:'History',nothing:'Nothing yet',logout:'Log out',\nt_RECHARGE:'Money added',t_DEDUCT:'Purchase',t_REVERSAL:'Correction',t_POINTS_REDEEM:'Points redeemed',\nwelcome:'Welcome',done:'Done',\ne_bad_login:'Wrong mobile number or PIN',e_no_pin:'Set your PIN first (Set PIN tab)',e_locked:'Too many tries. Try again in 15 minutes',\ne_duplicate_mobile:'This number is already registered. Use Log in',e_invalid_mobile:'Enter a valid 10-digit mobile number',\ne_name_required:'Name is required',e_bad_pin:'PIN must be 4 digits',e_bad_code:'Wrong or expired code',\ne_invalid_amount:'Invalid amount',e_upi_not_set:'This shop has not set up UPI yet',e_too_many:'Too many requests. Try later',\ne_not_enough_points:'Not enough points',e_shop_not_found:'Shop not found',e_unauthorized:'Please log in again',\ne_server_error:'Something went wrong. Try again'},\nta:{login:'உள்நுழை',register:'சேர்',setpin:'PIN அமை',mobile:'மொபைல் எண்',pin:'4 இலக்க PIN',newpin:'புதிய 4 இலக்க PIN',name:'உங்கள் பெயர்',\nemailopt:'மின்னஞ்சல் (விருப்பம்)',offers:'சலுகைகளைப் பெற சம்மதம்',go:'தொடர்',code:'கடையிலிருந்து 6 இலக்க குறியீடு',\ncodehelp:'கடையில் பதிவு செய்தவர்கள் அல்லது PIN மறந்தவர்கள் கடையில் குறியீடு கேட்கவும்.',\nbalance:'வாலட் இருப்பு',points:'புள்ளிகள்',recharge:'பணம் சேர்க்க',pick:'தொகையைத் தேர்வு செய்யவும்',bonus:'போனஸ்',walletget:'வாலட்டில் சேரும்',\npay:'செலுத்து',payexact:'இந்தத் தொகையை சரியாக செலுத்தவும்',payhelp:'பைசா (எ.கா. .07) மூலம் கடை உங்கள் பணத்தை அடையாளம் காணும். தொகையை மாற்ற வேண்டாம்.',\nopenupi:'UPI ஆப் திற',manual:'பட்டனில் பிழை வந்தால், கைமுறையாக செலுத்தவும்: ஏதேனும் UPI ஆப்பில் UPI ஐடிக்கு செலுத்து என்பதைத் தேர்ந்தெடுத்து, இந்த இரண்டையும் உள்ளிடவும்.',upiid:'UPI ஐடி',amount:'தொகை',copy:'நகலெடு',copied:'நகலெடுக்கப்பட்டது',notwork:'பட்டன் வேலை செய்யவில்லையா?',timeleft:'மீதமுள்ள நேரம்',waiting:'பணம் வருவதற்காக காத்திருக்கிறது… வாலட் தானாக புதுப்பிக்கப்படும்.',\npaid:'உங்கள் வாலட்டில் பணம் சேர்க்கப்பட்டது',expired:'இந்தக் கோரிக்கை காலாவதியானது. மீண்டும் தொடங்கவும்.',cancel:'ரத்து',\nredeem:'புள்ளிகளைப் பயன்படுத்து',redeemfor:'புள்ளிகள் → வாலட்',history:'வரலாறு',nothing:'இன்னும் எதுவும் இல்லை',logout:'வெளியேறு',\nt_RECHARGE:'பணம் சேர்க்கப்பட்டது',t_DEDUCT:'கொள்முதல்',t_REVERSAL:'திருத்தம்',t_POINTS_REDEEM:'புள்ளிகள் பயன்பாடு',\nwelcome:'வரவேற்கிறோம்',done:'முடிந்தது',\ne_bad_login:'மொபைல் எண் அல்லது PIN தவறு',e_no_pin:'முதலில் PIN அமைக்கவும் (PIN அமை தாவல்)',e_locked:'பல முறை தவறு. 15 நிமிடம் கழித்து முயலவும்',\ne_duplicate_mobile:'இந்த எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. உள்நுழையவும்',e_invalid_mobile:'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',\ne_name_required:'பெயர் அவசியம்',e_bad_pin:'PIN 4 இலக்கமாக இருக்க வேண்டும்',e_bad_code:'குறியீடு தவறு அல்லது காலாவதியானது',\ne_invalid_amount:'தவறான தொகை',e_upi_not_set:'இந்தக் கடை இன்னும் UPI அமைக்கவில்லை',e_too_many:'அதிக கோரிக்கைகள். பிறகு முயலவும்',\ne_not_enough_points:'புள்ளிகள் போதாது',e_shop_not_found:'கடை கிடைக்கவில்லை',e_unauthorized:'மீண்டும் உள்நுழையவும்',\ne_server_error:'ஏதோ தவறு நடந்தது. மீண்டும் முயலவும்'}};\nconst C={code:(location.pathname.split('/')[2]||'').toLowerCase(),shop:null,tok:null,lang:null,me:null,mode:'login',amt:0,poll:null,wasPending:false};\nconst $=s=>document.querySelector(s);\nconst esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\nconst t=k=>(T[C.lang]&&T[C.lang][k])||T.en[k]||k;\nconst rs=p=>'₹'+(p/100).toLocaleString('en-IN',{minimumFractionDigits:p%100?2:0,maximumFractionDigits:2});\nconst err=e=>t('e_'+((e&&e.error)||'server_error'));\nconst K='kudai_c_'+C.code;\nfunction load(){try{const o=JSON.parse(localStorage.getItem(K)||'{}');C.tok=o.tok||null;C.lang=o.lang||null}catch(e){}}\nfunction save(){try{localStorage.setItem(K,JSON.stringify({tok:C.tok,lang:C.lang}))}catch(e){}}\nlet tt;function toast(m,bad){const e=$('#toast');e.textContent=m;e.className=bad?'bad':'';e.style.display='block';clearTimeout(tt);tt=setTimeout(()=>e.style.display='none',3400)}\nasync function api(path,body){const h={'content-type':'application/json'};if(C.tok)h.authorization='Bearer '+C.tok;\n const r=await fetch(path,{method:body?'POST':'GET',headers:h,body:body?JSON.stringify(body):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw d;return d}\nconst langBtns=()=>`<span class=\"lg\"><button class=\"${C.lang==='en'?'on':''}\" onclick=\"setLang('en')\">EN</button><button class=\"${C.lang==='ta'?'on':''}\" onclick=\"setLang('ta')\">தமிழ்</button></span>`;\nfunction setLang(l){C.lang=l;save();render()}\nfunction logout(){clearInterval(C.poll);C.tok=null;C.me=null;save();render()}\n\nfunction render(){const top=`<div class=\"top\"><b>☂ ${esc(C.shop?C.shop.name:'Kudai')}</b>${langBtns()}${C.me?`<button onclick=\"logout()\">⎋</button>`:''}</div>`;\n $('#app').innerHTML=top+(C.me?walletHTML():authHTML());if(C.me)tick()}\n\n/* ---------- sign in / join ---------- */\nfunction authHTML(){const m=C.mode;\n const seg=`<div class=\"seg\">${['login','register','setpin'].map(k=>`<button class=\"${m===k?'on':''}\" onclick=\"C.mode='${k}';render()\">${t(k)}</button>`).join('')}</div>`;\n let f=`<input id=\"mb\" inputmode=\"numeric\" maxlength=\"14\" placeholder=\"${t('mobile')}\">`;\n if(m==='register')f=`<input id=\"nm\" placeholder=\"${t('name')}\">`+f+`<input id=\"em\" type=\"email\" placeholder=\"${t('emailopt')}\"><input id=\"pn\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('pin')}\"><label class=\"ck\"><input id=\"of\" type=\"checkbox\"> ${t('offers')}</label>`;\n else if(m==='login')f+=`<input id=\"pn\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('pin')}\">`;\n else f+=`<input id=\"cd\" inputmode=\"numeric\" maxlength=\"6\" placeholder=\"${t('code')}\"><input id=\"pn\" type=\"password\" inputmode=\"numeric\" maxlength=\"4\" placeholder=\"${t('newpin')}\"><p class=\"mut\">${t('codehelp')}</p>`;\n return `<div class=\"card\">${seg}${f}<button class=\"btn\" onclick=\"submitAuth()\">${t('go')}</button></div>`}\nasync function submitAuth(){const v=id=>($('#'+id)||{}).value||'';const m=C.mode;\n try{let d;\n  if(m==='login')d=await api('/api/c/login',{shop_code:C.code,mobile:v('mb'),pin:v('pn')});\n  else if(m==='register')d=await api('/api/c/register',{shop_code:C.code,name:v('nm'),mobile:v('mb'),email:v('em'),pin:v('pn'),lang:C.lang,offers_optin:$('#of').checked});\n  else d=await api('/api/c/setpin',{shop_code:C.code,mobile:v('mb'),code:v('cd'),pin:v('pn')});\n  C.tok=d.token;save();await refresh();render();startPoll();if(m==='register')toast('✓ '+t('welcome'))}\n catch(e){toast(err(e),1)}}\n\n/* ---------- wallet ---------- */\nasync function refresh(){const d=await api('/api/c/me');\n if(C.wasPending&&!d.pending&&C.me&&d.customer.wallet_paise>C.me.customer.wallet_paise){toast('✓ '+t('paid'));C.amt=0}\n C.wasPending=!!d.pending;C.me=d}\nfunction walletHTML(){const m=C.me,c=m.customer,s=m.shop;\n let h=`<div class=\"bal\"><small>${esc(c.name)}</small><div class=\"a\">${rs(c.wallet_paise)}</div><small>${t('balance')} · ⭐ ${c.points} ${t('points')}</small></div>`;\n if(m.pending)h+=pendingHTML(m.pending);else h+=rechargeHTML();\n if(c.points>=s.redeem_points)h+=`<button class=\"btn ghost\" onclick=\"redeem()\">🎁 ${t('redeem')}: ${s.redeem_points} ${t('redeemfor')} ${rs(s.redeem_value_paise)}</button>`;\n h+=`<h3>${t('history')}</h3><div class=\"card\" style=\"padding:4px 14px\">${m.txns.length?m.txns.map(x=>{const a=x.wallet_change_paise;return `<div class=\"tx\"><div><b>${t('t_'+x.txn_type)}</b>${x.status==='REVERSED'?' ↩':''}<div class=\"mut\">${new Date(x.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div></div><span class=\"${a>=0?'pos':'neg'}\">${a>=0?'+':'−'}${rs(Math.abs(a))}</span></div>`}).join(''):`<p class=\"mut\">${t('nothing')}</p>`}</div>`;\n return h}\nfunction rechargeHTML(){const s=C.me.shop,a=[];for(let p=10000;p<=s.max_recharge_paise;p+=10000)a.push(p);\n const b=C.amt?Math.floor(C.amt*s.bonus_percent/100):0;\n return `<div class=\"card\"><b>${t('recharge')}</b><div class=\"mut\">${t('pick')}</div><div class=\"chips\">${a.map(p=>`<button class=\"${C.amt===p?'on':''}\" onclick=\"C.amt=${p};render()\">${rs(p)}</button>`).join('')}</div>\n${C.amt?`<div class=\"mut\">${t('bonus')}: <b>${rs(b)}</b> · ${t('walletget')}: <b>${rs(C.amt+b)}</b></div><button class=\"btn\" onclick=\"startRecharge()\">${t('go')}</button>`:''}</div>`}\nfunction pendingHTML(p){return `<div class=\"card pay\"><div class=\"mut\">${t('pay')}</div><div class=\"a\">${rs(p.payable_paise)}</div>\n<div class=\"mut\">${t('bonus')}: ${rs(p.bonus_paise)} · ${t('walletget')}: ${rs(p.base_paise+p.bonus_paise)}</div>\n<a class=\"btn\" href=\"${esc(p.upi_link)}\">${t('openupi')}</a>${p.payable_paise%100?`<div class=\"mut\" style=\"margin:10px 0\">${t('payhelp')}</div>`:''}\n\n<div class=\"mut\">${t('timeleft')}: <b id=\"left\"></b></div><div class=\"mut\" style=\"margin-top:6px\">${t('waiting')}</div>\n<button class=\"btn ghost\" onclick=\"cancelRecharge()\">${t('cancel')}</button></div>`}\nfunction cp(v){try{navigator.clipboard.writeText(v);toast(t('copied'))}catch(e){prompt('',v)}}\nfunction tick(){const p=C.me&&C.me.pending;const el=$('#left');if(!p||!el)return;const s=Math.max(0,Math.floor((new Date(p.expires_at)-Date.now())/1000));el.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}\nasync function startRecharge(){try{await api('/api/c/recharge',{base_paise:C.amt});await refresh();render()}catch(e){toast(err(e),1)}}\nasync function cancelRecharge(){try{await api('/api/c/cancel',{});C.amt=0;await refresh();render()}catch(e){toast(err(e),1)}}\nasync function redeem(){try{await api('/api/c/redeem',{blocks:1});await refresh();render();toast('✓ '+t('done'))}catch(e){toast(err(e),1)}}\nfunction startPoll(){clearInterval(C.poll);C.poll=setInterval(async()=>{if(!C.me||document.hidden)return;tick();\n if(C.me.pending||C.tickN++%5===0){try{const had=!!C.me.pending;await refresh();if(had||C.me.pending)render()}catch(e){if(e&&e.error==='unauthorized')logout()}}},3000);C.tickN=0}\n\n(async function boot(){load();\n try{C.shop=await api('/api/c/shop?code='+encodeURIComponent(C.code))}catch(e){document.body.innerHTML='<div class=\"wrap\"><h2>☂ Kudai</h2><p>Shop not found.</p></div>';return}\n if(!C.lang)C.lang=C.shop.default_lang||'en';\n if(C.tok){try{await refresh();render();startPoll();return}catch(e){C.tok=null}}\n render()})();\n</script></body></html>\n";
const DEF_URL = 'https://kkjxogofoehaxsddmzlm.supabase.co';
const DEF_ANON = 'sb_publishable_6S-xQVfqAJMQ3jukzLpiXw_l3i6ZRKD';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUST_COLS = 'id,short_id,name,mobile,wallet_paise,points,lang,whatsapp_optin,offers_optin,created_at';

const J = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const bad = (err, status = 400, extra) => ({ err, status, extra });

function cfg(env) {
  return { url: env.SUPABASE_URL || DEF_URL, anon: env.SUPABASE_ANON || DEF_ANON, svc: env.SUPABASE_SERVICE_KEY,
    secret: env.STAFF_SECRET || env.SUPABASE_SERVICE_KEY || '', customerApp: env.CUSTOMER_APP === '1', env };   // customer wallet page is switched off unless CUSTOMER_APP=1
}

async function sb(c, path, { method = 'GET', body, prefer } = {}) {
  if (!c.svc) throw bad('server_not_configured', 500);
  const h = { apikey: c.svc, 'content-type': 'application/json' };
  if (c.svc.startsWith('eyJ')) h.authorization = 'Bearer ' + c.svc;   // old-style JWT keys only
  if (prefer) h.prefer = prefer;
  const r = await fetch(c.url + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  const t = await r.text();
  let d = null;
  try { d = t ? JSON.parse(t) : null; } catch (e) { d = { message: t }; }
  if (!r.ok) throw { status: r.status, data: d };
  return d;
}
const rpc = (c, fn, args) => sb(c, '/rest/v1/rpc/' + fn, { method: 'POST', body: args });

async function auth(req, c) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  if (!tok) throw bad('unauthorized', 401);
  const r = await fetch(c.url + '/auth/v1/user', { headers: { apikey: c.anon, authorization: 'Bearer ' + tok } });
  if (!r.ok) throw bad('unauthorized', 401);
  const u = await r.json();
  const rows = await sb(c, `/rest/v1/shop_staff?user_id=eq.${u.id}&select=user_id,role,shop_id,staff_name,pin_hash,admin_pin_hash,pin_fails,locked_until,shops(*)`);
  if (!rows || !rows.length) throw bad('no_shop', 403);
  return { user: u, role: rows[0].role, shop: rows[0].shops, row: rows[0] };
}

const readBody = async (req) => { try { return await req.json(); } catch (e) { return {}; } };
const paise = (rupees) => Math.round(Number(rupees) * 100);
const cleanMobile = (m) => {
  let d = String(m || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
};
const getCust = async (c, shopId, id) => {
  const r = await sb(c, `/rest/v1/customers?id=eq.${id}&shop_id=eq.${shopId}&select=${CUST_COLS}`);
  if (!r.length) throw bad('customer_not_found', 404);
  return r[0];
};


// ---------------- customer side ----------------
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const sha = async (s) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
const rnd = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
async function pbk(pin, saltHex) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256));
}
const hashPin = async (pin) => { const salt = rnd(16); return salt + ':' + (await pbk(pin, salt)); };
const checkPin = async (pin, stored) => { const [salt, h] = String(stored).split(':'); return (await pbk(pin, salt)) === h; };
async function hmac(secret, text) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(text)));
}
const staffEmail = (mobile, shopId) => `${mobile}-${shopId.slice(0, 8)}@staff.kudai.invalid`;
const staffPw = (c, shopId, mobile) => hmac(c.secret, `kudai-staff:${shopId}:${mobile}`);   // never typed by anyone; the 4-digit PIN is checked by us
const mkAdm = async (c, userId) => { const exp = Date.now() + 30 * 60000; return exp + '.' + (await hmac(c.secret, `adm:${userId}:${exp}`)); };
const okAdm = async (c, userId, tok) => { const [exp, sig] = String(tok || '').split('.'); return !!exp && Number(exp) > Date.now() && sig === (await hmac(c.secret, `adm:${userId}:${exp}`)); };
const rndPin = () => String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));
const indiaMidnight = () => new Date(Math.floor((Date.now() + 19800000) / 86400000) * 86400000 - 19800000);
// 5 wrong PINs lock the login for 5 minutes
async function pinCheck(c, row, pin, field) {
  if (row.locked_until && new Date(row.locked_until) > new Date()) throw bad('locked', 429);
  if (row[field] && await checkPin(pin, row[field])) {
    if (row.pin_fails) await sb(c, `/rest/v1/shop_staff?user_id=eq.${row.user_id}&shop_id=eq.${row.shop_id}`, { method: 'PATCH', prefer: 'return=minimal', body: { pin_fails: 0, locked_until: null } });
    return true;
  }
  const f = (row.pin_fails || 0) + 1;
  await sb(c, `/rest/v1/shop_staff?user_id=eq.${row.user_id}&shop_id=eq.${row.shop_id}`, { method: 'PATCH', prefer: 'return=minimal',
    body: f >= 5 ? { pin_fails: 0, locked_until: new Date(Date.now() + 300000).toISOString() } : { pin_fails: f } });
  return false;
}
const isoAgo = (ms) => encodeURIComponent(new Date(Date.now() - ms).toISOString());
const isoNow = () => encodeURIComponent(new Date().toISOString());
const SHOP_PUBLIC = 'id,shop_name,default_lang,is_active,bonus_percent,max_recharge_paise,upi_id,redeem_points,redeem_value_paise,points_spend_paise';

async function shopByCode(c, code) {
  code = String(code || '').toLowerCase();
  if (!/^[a-z0-9-]{3,30}$/.test(code)) throw bad('shop_not_found', 404);
  const r = await sb(c, `/rest/v1/shops?shop_code=eq.${code}&select=${SHOP_PUBLIC}&limit=1`);
  if (!r.length || !r[0].is_active) throw bad('shop_not_found', 404);
  return r[0];
}
async function newSession(c, customerId) {
  const token = rnd(32);
  await sb(c, '/rest/v1/device_sessions', { method: 'POST', prefer: 'return=minimal',
    body: { customer_id: customerId, token_hash: await sha(token) } });
  return token;
}
async function cauth(req, c) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  if (!tok) throw bad('unauthorized', 401);
  const r = await sb(c, `/rest/v1/device_sessions?token_hash=eq.${await sha(tok)}&created_at=gt.${isoAgo(90 * 86400000)}&select=id,customers(${CUST_COLS},shop_id,shops(${SHOP_PUBLIC}))`);
  if (!r.length || !r[0].customers) throw bad('unauthorized', 401);
  const cu = r[0].customers;
  const shop = cu.shops;
  delete cu.shops;
  return { cust: cu, shop, session: r[0].id, token: tok };
}
const upiLink = (shop, paiseAmt, ref) => shop.upi_id
  ? `upi://pay?pa=${encodeURIComponent(shop.upi_id)}&pn=${encodeURIComponent(shop.shop_name)}&am=${(paiseAmt / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Kudai wallet')}` + (ref ? `&tr=KD${String(ref).replace(/-/g, '').slice(0, 20)}` : '')
  : null;

async function capi(req, c, u, p) {
  const m = req.method;
  if (p === '/api/c/shop' && m === 'GET') {
    const s = await shopByCode(c, u.searchParams.get('code'));
    return J({ name: s.shop_name, default_lang: s.default_lang });
  }
  if (p === '/api/c/register' && m === 'POST') {
    const b = await readBody(req);
    const shop = await shopByCode(c, b.shop_code);
    const name = String(b.name || '').trim().slice(0, 80);
    const mobile = cleanMobile(b.mobile);
    if (!name) throw bad('name_required');
    if (!/^[6-9][0-9]{9}$/.test(mobile)) throw bad('invalid_mobile');
    if (!/^[0-9]{4}$/.test(String(b.pin))) throw bad('bad_pin');
    const row = await rpc(c, 'create_customer', { p_shop: shop.id, p_name: name, p_mobile: mobile,
      p_email: String(b.email || '').trim().slice(0, 120) || null, p_lang: b.lang === 'ta' ? 'ta' : 'en',
      p_offers_optin: !!b.offers_optin });
    await sb(c, '/rest/v1/customer_pins', { method: 'POST', prefer: 'return=minimal',
      body: { customer_id: row.id, pin_hash: await hashPin(String(b.pin)) } });
    return J({ token: await newSession(c, row.id) });
  }
  if (p === '/api/c/login' && m === 'POST') {
    const b = await readBody(req);
    const shop = await shopByCode(c, b.shop_code);
    const mobile = cleanMobile(b.mobile);
    const pin = String(b.pin || '');
    if (!/^[0-9]{4}$/.test(pin) || !/^[6-9][0-9]{9}$/.test(mobile)) throw bad('bad_login', 401);
    const cu = await sb(c, `/rest/v1/customers?shop_id=eq.${shop.id}&mobile=eq.${mobile}&select=id&limit=1`);
    if (!cu.length) throw bad('bad_login', 401);
    const pr = await sb(c, `/rest/v1/customer_pins?customer_id=eq.${cu[0].id}&select=pin_hash,fails,locked_until`);
    if (!pr.length) throw bad('no_pin', 401);
    if (pr[0].locked_until && new Date(pr[0].locked_until) > new Date()) throw bad('locked', 429);
    if (!(await checkPin(pin, pr[0].pin_hash))) {
      const fails = pr[0].fails + 1;
      await sb(c, `/rest/v1/customer_pins?customer_id=eq.${cu[0].id}`, { method: 'PATCH', prefer: 'return=minimal',
        body: fails >= 5 ? { fails: 0, locked_until: new Date(Date.now() + 15 * 60000).toISOString() } : { fails } });
      throw bad('bad_login', 401);
    }
    if (pr[0].fails) await sb(c, `/rest/v1/customer_pins?customer_id=eq.${cu[0].id}`, { method: 'PATCH', prefer: 'return=minimal', body: { fails: 0 } });
    return J({ token: await newSession(c, cu[0].id) });
  }
  if (p === '/api/c/setpin' && m === 'POST') {
    const b = await readBody(req);
    const shop = await shopByCode(c, b.shop_code);
    const mobile = cleanMobile(b.mobile);
    const pin = String(b.pin || '');
    const code = String(b.code || '').replace(/\D/g, '');
    if (!/^[0-9]{4}$/.test(pin)) throw bad('bad_pin');
    const cu = await sb(c, `/rest/v1/customers?shop_id=eq.${shop.id}&mobile=eq.${mobile}&select=id&limit=1`);
    const otp = cu.length ? await sb(c, `/rest/v1/otp_codes?shop_id=eq.${shop.id}&mobile=eq.${mobile}&used_at=is.null&expires_at=gt.${isoNow()}&order=created_at.desc&limit=1&select=id,code_hash,attempts`) : [];
    if (!cu.length || !otp.length || otp[0].attempts >= 5) throw bad('bad_code', 401);
    if (otp[0].code_hash !== (await sha(code + ':' + mobile + ':' + shop.id))) {
      await sb(c, `/rest/v1/otp_codes?id=eq.${otp[0].id}`, { method: 'PATCH', prefer: 'return=minimal', body: { attempts: otp[0].attempts + 1 } });
      throw bad('bad_code', 401);
    }
    await sb(c, `/rest/v1/otp_codes?id=eq.${otp[0].id}`, { method: 'PATCH', prefer: 'return=minimal', body: { used_at: new Date().toISOString() } });
    await sb(c, '/rest/v1/customer_pins?on_conflict=customer_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal',
      body: { customer_id: cu[0].id, pin_hash: await hashPin(pin), fails: 0, locked_until: null } });
    return J({ token: await newSession(c, cu[0].id) });
  }

  const A = await cauth(req, c);
  const shop = A.shop;
  const cid = A.cust.id;

  if (p === '/api/c/me' && m === 'GET') {
    const txns = await sb(c, `/rest/v1/transactions?customer_id=eq.${cid}&status=in.(COMPLETED,REVERSED)&order=created_at.desc&limit=15&select=id,txn_type,status,base_paise,wallet_change_paise,points_change,created_at`);
    const pend = await sb(c, `/rest/v1/transactions?customer_id=eq.${cid}&txn_type=eq.RECHARGE&status=eq.PENDING&expires_at=gt.${isoNow()}&order=created_at.desc&limit=1&select=id,base_paise,bonus_paise,payable_paise,expires_at`);
    const customer = await getCust(c, shop.id, cid);
    return J({ customer, txns,
      pending: pend.length ? { ...pend[0], upi_link: upiLink(shop, pend[0].payable_paise, pend[0].id), upi_id: shop.upi_id } : null,
      shop: { name: shop.shop_name, bonus_percent: Number(shop.bonus_percent), max_recharge_paise: Number(shop.max_recharge_paise),
        redeem_points: shop.redeem_points, redeem_value_paise: Number(shop.redeem_value_paise) } });
  }
  if (p === '/api/c/recharge' && m === 'POST') {
    const b = await readBody(req);
    const base = Number(b.base_paise);
    if (!Number.isInteger(base)) throw bad('invalid_amount');
    if (!shop.upi_id) throw bad('upi_not_set');
    const recent = await sb(c, `/rest/v1/transactions?customer_id=eq.${cid}&txn_type=eq.RECHARGE&created_at=gt.${isoAgo(3600000)}&select=id`);
    if (recent.length >= 6) throw bad('too_many', 429);
    await sb(c, `/rest/v1/transactions?customer_id=eq.${cid}&txn_type=eq.RECHARGE&status=eq.PENDING`,
      { method: 'PATCH', prefer: 'return=minimal', body: { status: 'EXPIRED' } });   // frees the old paise slot
    const t = await rpc(c, 'create_recharge', { p_shop: shop.id, p_customer: cid, p_base_paise: base });
    return J({ id: t.id, payable_paise: Number(t.payable_paise), expires_at: t.expires_at, upi_link: upiLink(shop, Number(t.payable_paise), t.id) });
  }
  if (p === '/api/c/cancel' && m === 'POST') {
    await sb(c, `/rest/v1/transactions?customer_id=eq.${cid}&txn_type=eq.RECHARGE&status=eq.PENDING`,
      { method: 'PATCH', prefer: 'return=minimal', body: { status: 'EXPIRED' } });
    return J({ ok: true });
  }
  if (p === '/api/c/redeem' && m === 'POST') {
    const b = await readBody(req);
    const blocks = Number(b.blocks) || 1;
    if (!Number.isInteger(blocks) || blocks < 1 || blocks > 20) throw bad('invalid_amount');
    await rpc(c, 'redeem_points', { p_shop: shop.id, p_customer: cid, p_blocks: blocks });
    return J({ ok: true });
  }
  throw bad('not_found', 404);
}


// ---------------- WhatsApp alert wording (English / Tamil) ----------------
const inr = (p) => '₹' + (Number(p) / 100).toLocaleString('en-IN', { minimumFractionDigits: Number(p) % 100 ? 2 : 0, maximumFractionDigits: 2 });
const ownerAlert = async (c, shop, text) => {   // never breaks the bill/undo that triggered it
  try {
    if (!/^[6-9]\d{9}$/.test(String(shop.owner_phone || ''))) return;
    await sb(c, '/rest/v1/message_log', { method: 'POST', prefer: 'return=minimal', body: { shop_id: shop.id, kind: 'ownalert', lang: 'en', status: 'queued',
      to_mobile: '91' + shop.owner_phone, category: 'system', params: { owner: shop.owner_name || 'Owner', shop: shop.shop_name, text: String(text).slice(0, 200) } } });
  } catch (e) { /* ignore */ }
};
const ALERT_KINDS = ['welcome', 'recharge', 'bill', 'low', 'reversal', 'redeem'];
function renderMsg(kind, lang, p, shop) {
  const ta = lang === 'ta';
  const at = shop.redeem_points || 100;
  const sign = `\n\n— ${shop.shop_name}` + (shop.footer_line ? `\n${shop.footer_line}` : '');
  const pts = ta ? `புள்ளிகள்: ${p.points} (${at} புள்ளிகளில் பயன்படுத்தலாம்)` : `Points: ${p.points} (redeem at ${at})`;
  const items = p.items ? ` (${p.items})` : '';
  if (kind === 'welcome') return ta
    ? `👋 வணக்கம் ${p.name}! *${shop.shop_name}* கடைக்கு வரவேற்கிறோம்.\n\nஉங்கள் வாலட் தயார்.\nவாடிக்கையாளர் எண்: ${p.short_id}\nகடைக்கு வரும்போது உங்கள் மொபைல் எண்ணின் கடைசி 4 இலக்கங்களை (${p.last4}) சொன்னால் போதும்.\n\nஇருப்பு: ${inr(p.balance_paise)}\n${pts}` + sign
    : `👋 Hi ${p.name}, welcome to *${shop.shop_name}*!\n\nYour wallet is ready.\nCustomer ID: ${p.short_id}\nTip: just tell us the last 4 digits of your mobile (${p.last4}) when you visit.\n\nBalance: ${inr(p.balance_paise)}\n${pts}` + sign;
  if (kind === 'recharge') return ta
    ? `✅ *வாலட் ரீசார்ஜ் ஆனது*\n${p.name}, நன்றி!\n\nசெலுத்தியது: ${inr(p.paid_paise)}\nபோனஸ்: ${inr(p.bonus_paise)}\n*மொத்தம் சேர்ந்தது: ${inr(p.total_paise)}*\n\nஇருப்பு: ${inr(p.balance_paise)}\n${pts}\nவாடிக்கையாளர் எண்: ${p.short_id}` + sign
    : `✅ *Wallet recharged*\nHi ${p.name}, thank you!\n\nPaid: ${inr(p.paid_paise)}\nBonus: ${inr(p.bonus_paise)}\n*Total added: ${inr(p.total_paise)}*\n\nBalance: ${inr(p.balance_paise)}\n${pts}\nCustomer ID: ${p.short_id}` + sign;
  if (kind === 'bill' || kind === 'bill_low') {
    const low = kind === 'bill_low' ? (ta ? '\n\n⚠️ உங்கள் இருப்பு குறைவாக உள்ளது. விரைவில் ரீசார்ஜ் செய்யவும்.' : '\n\n⚠️ Your balance is low. Please recharge soon.') : '';
    return (ta
      ? `🧾 *${inr(p.amount_paise)} வாலட்டிலிருந்து செலுத்தப்பட்டது*${items}\n${p.name},\n\nஇருப்பு: ${inr(p.balance_paise)}\nகிடைத்த புள்ளிகள்: +${p.points_earned} · மொத்தம்: ${p.points} (${at} புள்ளிகளில் பயன்படுத்தலாம்)`
      : `🧾 *${inr(p.amount_paise)} paid* from your wallet${items}\nHi ${p.name},\n\nBalance: ${inr(p.balance_paise)}\nPoints earned: +${p.points_earned} · Total: ${p.points} (redeem at ${at})`) + low + sign;
  }
  if (kind === 'low') return ta
    ? `⚠️ ${p.name}, உங்கள் வாலட் இருப்பு குறைவாக உள்ளது: ${inr(p.balance_paise)}.\nவிரைவில் ரீசார்ஜ் செய்யவும்.` + sign
    : `⚠️ Hi ${p.name}, your wallet balance is low: ${inr(p.balance_paise)}.\nPlease recharge soon.` + sign;
  if (kind === 'reversal') return ta
    ? `↩️ *${inr(p.amount_paise)} உங்கள் வாலட்டுக்குத் திரும்ப வந்தது*\n${p.name}, கடைசி பில் திருத்தப்பட்டது.\n\nஇருப்பு: ${inr(p.balance_paise)}\nபுள்ளிகள்: ${p.points}` + sign
    : `↩️ *${inr(p.amount_paise)} returned to your wallet*\nHi ${p.name}, your last bill was corrected.\n\nBalance: ${inr(p.balance_paise)}\nPoints: ${p.points}` + sign;
  if (kind === 'redeem') return ta
    ? `🎁 *புள்ளிகள் பயன்படுத்தப்பட்டன*\n${p.name}, ${p.points_used} புள்ளிகள் → ${inr(p.value_paise)} வாலட்டில் சேர்ந்தது.\n\nஇருப்பு: ${inr(p.balance_paise)}\nமீதமுள்ள புள்ளிகள்: ${p.points}` + sign
    : `🎁 *Points redeemed*\nHi ${p.name}, ${p.points_used} points → ${inr(p.value_paise)} added to your wallet.\n\nBalance: ${inr(p.balance_paise)}\nPoints left: ${p.points}` + sign;
  if (kind === 'offer') return `${p.text}\n\n— ${shop.shop_name}\n` + (ta ? 'சலுகைகளை நிறுத்த STOP என்று பதிலளிக்கவும்.' : 'Reply STOP to stop offers.') + (p.image ? `\n[image: ${p.image}]` : '');
  if (kind === 'daysummary') return ta
    ? `📊 *${p.shop} – ${p.date}*\nவணக்கம் ${p.owner}, இன்றைய சுருக்கம்:\nவாலட் விற்பனை: ${p.sales}\nபில்கள்: ${p.bills}\nசேர்க்கப்பட்ட பணம்: ${p.added}\nபுதிய உறுப்பினர்கள்: ${p.new_members}`
    : `📊 *${p.shop} – ${p.date}*\nHi ${p.owner}, today's summary:\nWallet sales: ${p.sales}\nBills: ${p.bills}\nMoney added: ${p.added}\nNew members: ${p.new_members}`;
  if (kind === 'ownalert') return `🔔 *${p.shop}*\n${p.text}\n${ta ? 'விவரங்களை Kudai app-ல் பார்க்கவும்.' : 'Please review it in your Kudai app.'}`;
  if (kind === 'otp') return ta ? `🔐 ${p.code} உங்கள் Kudai உறுதிப்படுத்தும் குறியீடு. ${p.minutes} நிமிடங்களுக்குச் செல்லும். யாருடனும் பகிர வேண்டாம்.` : `🔐 ${p.code} is your Kudai verification code. Valid for ${p.minutes} minutes. Do not share it.`;
  return '';
}
const SAMPLE = {
  welcome: { name: 'Venkatraman', short_id: 1001, last4: '4587', balance_paise: 0, points: 0 },
  recharge: { name: 'Venkatraman', short_id: 1001, paid_paise: 20000, bonus_paise: 1000, total_paise: 21000, balance_paise: 21000, points: 0 },
  bill: { name: 'Venkatraman', amount_paise: 1000, balance_paise: 20000, points_earned: 1, points: 5, items: 'Tea' },
  low: { name: 'Venkatraman', balance_paise: 1500 },
  reversal: { name: 'Venkatraman', amount_paise: 1000, balance_paise: 21000, points: 4 },
  redeem: { name: 'Venkatraman', points_used: 100, value_paise: 1000, balance_paise: 3000, points: 20 },
};

// ---------------- master admin (platform owner) ----------------
const SHOP_TYPES = ['Tea shop', 'Bakery', 'Saloon', 'Restaurant', 'Juice shop', 'Other'];
async function mauth(req, c) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  if (!tok) throw bad('unauthorized', 401);
  const r = await fetch(c.url + '/auth/v1/user', { headers: { apikey: c.anon, authorization: 'Bearer ' + tok } });
  if (!r.ok) throw bad('unauthorized', 401);
  const u = await r.json();
  const rows = await sb(c, `/rest/v1/platform_admins?user_id=eq.${u.id}&select=user_id`);
  if (!rows.length) throw bad('not_master', 403);
  return u;
}
const adminHdr = (c) => ({ apikey: c.svc, 'content-type': 'application/json', ...(c.svc.startsWith('eyJ') ? { authorization: 'Bearer ' + c.svc } : {}) });
const mkMp = async (c, userId) => { const exp = Date.now() + 15 * 60000; return exp + '.' + (await hmac(c.secret, `mpin:${userId}:${exp}`)); };
const okMp = async (c, userId, tok) => { const [exp, sig] = String(tok || '').split('.'); return !!exp && Number(exp) > Date.now() && sig === (await hmac(c.secret, `mpin:${userId}:${exp}`)); };
const audit = (c, A, action, shopId, detail) => rpc(c, 'add_audit', { p_actor: A.email, p_action: action, p_shop: shopId || null, p_detail: detail || {} }).catch(() => {});
async function mapi(req, c, u, p) {
  const A = await mauth(req, c);
  const m = req.method;
  // ---- Master PIN: once set, risky actions need a PIN token (valid 15 minutes) in the x-mpin header ----
  const pinRow = async () => (await sb(c, `/rest/v1/master_pin?user_id=eq.${A.id}&select=pin_hash,fails,locked_until`).catch(() => []))[0] || null;
  const gate = async () => { const r = await pinRow(); if (r && !(await okMp(c, A.id, req.headers.get('x-mpin')))) throw bad('pin_required', 403); };
  const pinTry = async (r, pin) => {   // 5 wrong PINs lock it for 15 minutes
    if (r.locked_until && new Date(r.locked_until) > new Date()) throw bad('pin_locked', 429);
    if (await checkPin(pin, r.pin_hash)) { if (r.fails) await sb(c, `/rest/v1/master_pin?user_id=eq.${A.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { fails: 0, locked_until: null } }); return; }
    const f = (r.fails || 0) + 1;
    await sb(c, `/rest/v1/master_pin?user_id=eq.${A.id}`, { method: 'PATCH', prefer: 'return=minimal', body: f >= 5 ? { fails: 0, locked_until: new Date(Date.now() + 15 * 60000).toISOString() } : { fails: f } });
    throw bad(f >= 5 ? 'pin_locked' : 'wrong_pin', f >= 5 ? 429 : 403);
  };
  if (p === '/api/m/pin' && m === 'GET') return J({ set: !!(await pinRow()) });
  if (p === '/api/m/pin/verify' && m === 'POST') {
    const b = await readBody(req), r = await pinRow();
    if (!r) throw bad('pin_not_set', 400);
    await pinTry(r, String(b.pin || ''));
    return J({ token: await mkMp(c, A.id) });
  }
  if (p === '/api/m/pin/set' && m === 'POST') {
    const b = await readBody(req), pin = String(b.pin || ''), r = await pinRow();
    if (!/^\d{6}$/.test(pin)) throw bad('bad_pin');
    if (r) await pinTry(r, String(b.old_pin || ''));
    const row = { user_id: A.id, pin_hash: await hashPin(pin), fails: 0, locked_until: null, updated_at: new Date().toISOString() };
    await sb(c, '/rest/v1/master_pin?on_conflict=user_id', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: row });
    await audit(c, A, r ? 'pin.change' : 'pin.set', null, {});
    return J({ token: await mkMp(c, A.id) });
  }
  if (p === '/api/m/health' && m === 'GET') return J(await rpc(c, 'master_health', {}));
  if (p === '/api/m/audit' && m === 'GET') {
    const sh = String(u.searchParams.get('shop') || ''), lim = Math.min(Math.max(parseInt(u.searchParams.get('limit'), 10) || 100, 1), 300);
    if (sh && !UUID.test(sh)) throw bad('not_found', 404);
    return J(await sb(c, `/rest/v1/audit_log?select=id,at,actor,action,shop_id,shop_name,detail${sh ? '&shop_id=eq.' + sh : ''}&order=at.desc&limit=${lim}`));
  }
  if (p === '/api/m/me' && m === 'GET') return J({ email: A.email });
  if (p === '/api/m/shops' && m === 'GET') {
    const mo = String(u.searchParams.get('month') || '');
    const now = new Date(Date.now() + 19800000);
    const y = /^\d{4}-\d{2}$/.test(mo) ? +mo.slice(0, 4) : now.getUTCFullYear(), mn = /^\d{4}-\d{2}$/.test(mo) ? +mo.slice(5) : now.getUTCMonth() + 1;
    const from = new Date(Date.UTC(y, mn - 1, 1) - 19800000), to = new Date(Date.UTC(y, mn, 1) - 19800000);   // calendar month, India time
    return J({ month: `${y}-${String(mn).padStart(2, '0')}`, shops: await rpc(c, 'master_overview', { p_from: from.toISOString(), p_to: to.toISOString() }) });
  }
  if (p === '/api/m/shops' && m === 'POST') {
    const b = await readBody(req);
    const name = String(b.shop_name || '').trim().slice(0, 60), owner = String(b.owner_name || '').trim().slice(0, 60);
    const mobile = cleanMobile(b.owner_phone), email = String(b.owner_email || '').trim().toLowerCase(), pw = String(b.password || '');
    if (!name) throw bad('name_required');
    if (!owner) throw bad('owner_required');
    if (mobile && !/^[6-9][0-9]{9}$/.test(mobile)) throw bad('invalid_mobile');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('invalid_email');
    if (pw.length < 8) throw bad('weak_password');
    const cat = SHOP_TYPES.includes(b.category) ? b.category : 'Other';
    const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 20) || 'shop');
    const code = (slug.length < 3 ? slug + '-shop' : slug) + '-' + rnd(2);
    const ur = await fetch(c.url + '/auth/v1/admin/users', { method: 'POST', headers: adminHdr(c), body: JSON.stringify({ email, password: pw, email_confirm: true }) });
    const ud = await ur.json().catch(() => ({}));
    if (!ur.ok) throw bad(/already|registered|exists/i.test(JSON.stringify(ud)) ? 'email_in_use' : 'create_failed', 409);
    let shop;
    try {
      const rows = await sb(c, '/rest/v1/shops', { method: 'POST', prefer: 'return=representation',
        body: { shop_code: code, shop_name: name, category: cat, owner_name: owner, owner_phone: mobile || null, owner_email: email, default_lang: b.default_lang === 'ta' ? 'ta' : 'en',
          plan_fee_paise: Math.round(Number((await getSettings(c).catch(() => ({}))).default_plan_fee || 0) * 100) } });
      shop = rows[0];
      await sb(c, '/rest/v1/shop_staff', { method: 'POST', prefer: 'return=minimal',
        body: { user_id: ud.id, shop_id: shop.id, role: 'owner', staff_name: owner, mobile: mobile || null, email } });
    } catch (e) {   // undo the half-created shop so nothing is left behind
      if (shop) await sb(c, `/rest/v1/shops?id=eq.${shop.id}`, { method: 'DELETE' }).catch(() => {});
      await fetch(c.url + '/auth/v1/admin/users/' + ud.id, { method: 'DELETE', headers: adminHdr(c) }).catch(() => {});
      throw e;
    }
    await audit(c, A, 'shop.create', shop.id, { name, owner, email });
    return J({ shop: { id: shop.id, name: shop.shop_name, code: shop.shop_code }, login: { email, password: pw } });
  }
  // ---- WhatsApp status, test, queue ----
  if (p === '/api/m/wa' && m === 'GET') {
    const cnt = async (st) => (await sb(c, `/rest/v1/message_log?status=eq.${st}&select=id&limit=1000`)).length;
    const env = c.env || {};
    return J({ live: waOn(env), phone_id: env.WA_PHONE_ID || '', waba_id: env.WA_WABA_ID || '', verify_set: !!env.WA_VERIFY, secret_set: !!env.WA_APP_SECRET,
      webhook: u.origin + '/wa/webhook', queued: await cnt('queued'), held: await cnt('held'), failed: await cnt('failed') });
  }
  if (p === '/api/m/send' && m === 'POST') return J(await drain(c, 10));
  if (p === '/api/m/job' && m === 'POST') { await audit(c, A, 'job.run', null, {}); return J(await dailyJob(c, true)); }
  if (p === '/api/m/wa/test' && m === 'POST') {
    const b = await readBody(req), mob = cleanMobile(b.mobile);
    if (!/^[6-9][0-9]{9}$/.test(mob)) throw bad('invalid_mobile');
    if (!waOn(c.env)) return J({ simulated: true });
    const r = await waPost(c.env, { to: '91' + mob, type: 'template', template: { name: 'kudai2_low_en', language: { code: 'en' }, components: [{ type: 'body', parameters: ['Test', 'Kudai', 'Rs 15'].map((x) => ({ type: 'text', text: x })) }] } });
    return J(r);
  }
  if (p === '/api/m/messages' && m === 'GET') {
    let q = '';
    const st = u.searchParams.get('status'), sh = u.searchParams.get('shop');
    if (st && /^(queued|sending|sent|delivered|read|failed|held|skipped|expired)$/.test(st)) q += `&status=eq.${st}`;
    if (sh && UUID.test(sh)) q += `&shop_id=eq.${sh}`;
    const rows = await sb(c, `/rest/v1/message_log?order=created_at.desc&limit=60${q}&select=id,kind,lang,status,error,params,to_mobile,category,created_at,shop_id,shops(shop_name,footer_line,redeem_points),customers(name)`);
    return J(rows.map((r) => ({ id: r.id, kind: r.kind, status: r.status, error: r.error, to: r.to_mobile, category: r.category, created_at: r.created_at,
      shop: r.shops ? r.shops.shop_name : '', name: r.customers ? r.customers.name : '', text: renderMsg(r.kind, r.lang, r.params || {}, r.shops || { shop_name: '' }) })));
  }
  if (p === '/api/m/messages/retry' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.id))) throw bad('not_found', 404);
    await sb(c, `/rest/v1/message_log?id=eq.${b.id}&status=in.(failed,held)`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'queued', attempts: 0, error: null } });
    return J({ ok: true });
  }
  if (p === '/api/m/templates' && m === 'GET') {
    const out = [];
    for (const [k, t] of Object.entries(TPL)) for (const l of ['en'])
      out.push({ name: `kudai2_${k}_${l}`, category: t.cat, language: l === 'ta' ? 'Tamil (ta)' : 'English (en)', header: t.header || '', body: t[l], example: t.ex });
    for (const l of ['en']) out.push({ name: `kudai2_otp_${l}`, category: 'AUTHENTICATION', language: l === 'ta' ? 'Tamil (ta)' : 'English (en)', header: '', body: '(Meta fixed text: code + Copy code button)', example: ['123456'] });
    return J(out);
  }
  // ---- platform settings (invoice header, packs) ----
  if (p === '/api/m/settings' && m === 'GET') return J(await getSettings(c));
  if (p === '/api/m/settings' && m === 'POST') {
    await gate();
    const b = await readBody(req), cur = await getSettings(c), n = { ...cur };
    for (const k of ['biz_name', 'address', 'phone', 'email', 'gstin', 'pan', 'pay_text', 'terms'])
      if (b[k] !== undefined) n[k] = String(b[k]).trim().slice(0, 400);
    if (b.invoice_prefix !== undefined) { const v = String(b.invoice_prefix).trim().toUpperCase(); if (!/^[A-Z0-9]{2,6}$/.test(v)) throw bad('invalid_amount'); n.invoice_prefix = v; }
    for (const k of ['default_plan_fee', 'gst_percent']) if (b[k] !== undefined) { const v = Number(b[k]); if (!(v >= 0 && v <= (k === 'gst_percent' ? 28 : 1000000))) throw bad('invalid_amount'); n[k] = v; }
    if (b.packs !== undefined) {
      if (!Array.isArray(b.packs) || b.packs.length > 6) throw bad('invalid_amount');
      n.packs = b.packs.map((x) => ({ qty: parseInt(x.qty, 10), price: Number(x.price) })).filter((x) => x.qty > 0 && x.qty <= 100000 && x.price >= 0 && x.price <= 1000000);
    }
    await sb(c, '/rest/v1/platform_settings?id=eq.1', { method: 'PATCH', prefer: 'return=minimal', body: { data: n, updated_at: new Date().toISOString() } });
    await audit(c, A, 'settings.save', null, { fields: Object.keys(b).slice(0, 20) });
    return J(n);
  }
  // ---- invoices ----
  if (p === '/api/m/invoices' && m === 'GET') {
    const mo = String(u.searchParams.get('month') || '');
    if (!/^\d{4}-\d{2}$/.test(mo)) throw bad('invalid_amount');
    const st = await getSettings(c);
    const rows = await sb(c, `/rest/v1/invoices?month=eq.${mo}&status=neq.VOID&order=number.asc&select=*,shops(shop_name,owner_name)`);
    return J(rows.map((r) => ({ ...r, ...invTotals(r, st) })));
  }
  if (p === '/api/m/invoices/generate' && m === 'POST') {
    const b = await readBody(req), mo = String(b.month || ''), off = Math.max(0, parseInt(b.offset, 10) || 0);
    if (!/^\d{4}-\d{2}$/.test(mo)) throw bad('invalid_amount');
    const st = await getSettings(c), y = +mo.slice(0, 4), mn = +mo.slice(5);
    const from = new Date(Date.UTC(y, mn - 1, 1) - 19800000).toISOString(), to = new Date(Date.UTC(y, mn, 1) - 19800000).toISOString();
    const label = new Date(Date.UTC(y, mn - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const shops = await sb(c, `/rest/v1/shops?select=id,shop_name,plan_fee_paise,is_active&order=created_at.asc&offset=${off}&limit=6`);
    let created = 0, skipped = 0;
    for (const s of shops) {
      const ex = await sb(c, `/rest/v1/invoices?shop_id=eq.${s.id}&month=eq.${mo}&status=neq.VOID&select=id`);
      if (ex.length) { skipped++; continue; }
      const packs = await sb(c, `/rest/v1/pack_purchases?shop_id=eq.${s.id}&invoice_id=is.null&price_paise=gt.0&created_at=gte.${encodeURIComponent(from)}&created_at=lt.${encodeURIComponent(to)}&select=id,qty,price_paise,created_at`);
      const lines = [];
      if (s.is_active && Number(s.plan_fee_paise) > 0) lines.push({ desc: `Kudai service – ${label}`, qty: 1, rate_paise: Number(s.plan_fee_paise), amount_paise: Number(s.plan_fee_paise) });
      for (const k of packs) lines.push({ desc: `WhatsApp message pack – ${k.qty} messages (${new Date(k.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })})`, qty: 1, rate_paise: Number(k.price_paise), amount_paise: Number(k.price_paise) });
      if (!lines.length) { skipped++; continue; }
      const number = await rpc(c, 'next_invoice_no', { p_prefix: st.invoice_prefix || 'KUD', p_month: mo });
      const inv = await sb(c, '/rest/v1/invoices', { method: 'POST', prefer: 'return=representation', body: { shop_id: s.id, month: mo, number, lines, total_paise: lines.reduce((a, l) => a + l.amount_paise, 0) } });
      if (packs.length) await sb(c, `/rest/v1/pack_purchases?id=in.(${packs.map((k) => k.id).join(',')})`, { method: 'PATCH', prefer: 'return=minimal', body: { invoice_id: inv[0].id } });
      created++;
    }
    if (created) await audit(c, A, 'invoice.generate', null, { month: mo, created });
    return J({ created, skipped, done: shops.length < 6, next: off + 6 });
  }
  if (p === '/api/m/invoices/html' && m === 'GET') {
    const mo = String(u.searchParams.get('month') || '');
    if (!/^\d{4}-\d{2}$/.test(mo)) throw bad('invalid_amount');
    const st = await getSettings(c);
    const rows = await sb(c, `/rest/v1/invoices?month=eq.${mo}&status=neq.VOID&order=number.asc&select=*,shops(shop_name,owner_name,owner_phone,owner_email,address,gstin)`);
    return new Response(invoiceHtml(rows, st), { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' } });
  }
  const im = p.match(/^\/api\/m\/invoices\/([0-9a-f-]{36})(\/html)?$/i);
  if (im) {
    const id = im[1], st = await getSettings(c);
    const rows = await sb(c, `/rest/v1/invoices?id=eq.${id}&select=*,shops(shop_name,owner_name,owner_phone,owner_email,address,gstin)`);
    if (!rows.length) throw bad('not_found', 404);
    const inv = rows[0];
    if (im[2] && m === 'GET') return new Response(invoiceHtml([inv], st), { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' } });
    if (m === 'GET') return J({ ...inv, ...invTotals(inv, st) });
    if (m === 'PATCH') {
      await gate();
      const b = await readBody(req), patch = {};
      if (b.lines !== undefined) {
        if (inv.status !== 'DRAFT') throw bad('invoice_locked', 409);
        if (!Array.isArray(b.lines) || b.lines.length > 30) throw bad('invalid_amount');
        patch.lines = b.lines.map((l) => {
          const qty = parseInt(l.qty, 10) || 1, rate = Math.round(Number(l.rate) * 100), desc = String(l.desc || '').trim().slice(0, 140);
          if (!desc || !(qty >= 1 && qty <= 9999) || !Number.isFinite(rate) || Math.abs(rate) > 100000000) throw bad('invalid_amount');
          return { desc, qty, rate_paise: rate, amount_paise: qty * rate };
        });
        patch.total_paise = patch.lines.reduce((a, l) => a + l.amount_paise, 0);
      }
      if (b.notes !== undefined) patch.notes = String(b.notes).trim().slice(0, 300) || null;
      const a = b.action;
      if (a === 'issue') { if (inv.status !== 'DRAFT') throw bad('invoice_locked', 409); patch.status = 'ISSUED'; patch.issued_at = new Date().toISOString(); }
      else if (a === 'draft') { if (inv.status !== 'ISSUED') throw bad('invoice_locked', 409); patch.status = 'DRAFT'; }
      else if (a === 'paid') { if (inv.status !== 'ISSUED') throw bad('invoice_locked', 409); patch.status = 'PAID'; patch.paid_at = new Date().toISOString(); patch.paid_note = String(b.note || '').trim().slice(0, 120) || null; }
      else if (a === 'void') { patch.status = 'VOID';
        await sb(c, `/rest/v1/pack_purchases?invoice_id=eq.${id}`, { method: 'PATCH', prefer: 'return=minimal', body: { invoice_id: null } }); }
      if (!Object.keys(patch).length) throw bad('nothing_to_change');
      await sb(c, `/rest/v1/invoices?id=eq.${id}`, { method: 'PATCH', prefer: 'return=minimal', body: patch });
      await audit(c, A, 'invoice.' + (a || 'edit'), inv.shop_id, { number: inv.number, status: patch.status || inv.status, note: patch.paid_note || undefined });
      return J({ ok: true });
    }
  }
  const sm = p.match(/^\/api\/m\/shops\/([0-9a-f-]{36})(\/owner-password|\/reset-admin-pin|\/owner-email|\/pack|\/detail|\/customers)?$/i);
  if (sm) {
    if (!UUID.test(sm[1])) throw bad('not_found', 404);
    const sid = sm[1];
    if (sm[2] === '/detail' && m === 'GET') {
      const d = await rpc(c, 'shop_detail', { p_shop: sid }).catch((e) => { throw (e && e.data && /not_found/.test(JSON.stringify(e.data))) ? bad('not_found', 404) : e; });
      return J(d);
    }
    if (sm[2] === '/customers' && m === 'GET') {
      const q = String(u.searchParams.get('q') || '').slice(0, 40);
      const rows = await rpc(c, 'shop_customers', { p_shop: sid, p_q: q, p_limit: 30 });
      return J(rows.map((r) => ({ id: r.id, short_id: r.short_id, name: r.name, mobile: r.mobile, wallet_paise: r.wallet_paise, points: r.points, created_at: r.created_at, offers_optin: r.offers_optin })));
    }
    if (!sm[2] && m === 'PATCH') {
      await gate();
      const b = await readBody(req), patch = {};
      if (b.is_active !== undefined) patch.is_active = !!b.is_active;
      if (b.shop_name !== undefined) { const v = String(b.shop_name).trim().slice(0, 60); if (!v) throw bad('name_required'); patch.shop_name = v; }
      if (b.owner_name !== undefined) { const v = String(b.owner_name).trim().slice(0, 60); if (!v) throw bad('owner_required'); patch.owner_name = v; }
      if (b.owner_phone !== undefined) { const v = cleanMobile(b.owner_phone); if (v && !/^[6-9][0-9]{9}$/.test(v)) throw bad('invalid_mobile'); patch.owner_phone = v || null; }
      if (b.plan_fee !== undefined) { const v = Math.round(Number(b.plan_fee) * 100); if (!(v >= 0 && v <= 100000000)) throw bad('invalid_amount'); patch.plan_fee_paise = v; }
      if (b.gstin !== undefined) patch.gstin = String(b.gstin).trim().toUpperCase().slice(0, 20) || null;
      if (b.address !== undefined) patch.address = String(b.address).trim().slice(0, 200) || null;
      if (b.category !== undefined) patch.category = SHOP_TYPES.includes(b.category) ? b.category : 'Other';
      if (b.default_lang !== undefined) patch.default_lang = b.default_lang === 'ta' ? 'ta' : 'en';
      if (b.max_staff !== undefined) { const v = parseInt(b.max_staff, 10); if (!(v >= 1 && v <= 50)) throw bad('invalid_amount'); patch.max_staff = v; }
      if (b.monthly_msg_limit !== undefined) { const v = parseInt(b.monthly_msg_limit, 10); if (!(v >= 0 && v <= 1000000)) throw bad('invalid_amount'); patch.monthly_msg_limit = v; }
      if (b.bonus_percent !== undefined) { const v = Number(b.bonus_percent); if (!(v >= 0 && v <= 10)) throw bad('invalid_amount'); patch.bonus_percent = v; }
      if (!Object.keys(patch).length) throw bad('nothing_to_change');
      const row = await sb(c, `/rest/v1/shops?id=eq.${sid}`, { method: 'PATCH', prefer: 'return=representation', body: patch });
      if (!row.length) throw bad('not_found', 404);
      if (patch.monthly_msg_limit !== undefined) await sb(c, `/rest/v1/message_log?shop_id=eq.${sid}&status=eq.held`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'queued', error: null } });
      await audit(c, A, patch.is_active !== undefined && Object.keys(patch).length === 1 ? (patch.is_active ? 'shop.activate' : 'shop.suspend') : 'shop.edit', sid, patch);
      return J({ ok: true });
    }
    const own = await sb(c, `/rest/v1/shop_staff?shop_id=eq.${sid}&role=eq.owner&select=user_id`);
    if (!own.length) throw bad('not_found', 404);
    if (sm[2] === '/pack' && m === 'POST') {
      await gate();
      const b = await readBody(req), qty = parseInt(b.qty, 10), price = Math.round(Number(b.price || 0) * 100);
      if (!Number.isInteger(qty) || qty === 0 || Math.abs(qty) > 100000 || !(price >= 0 && price <= 100000000)) throw bad('invalid_amount');
      const credits = await rpc(c, 'add_pack', { p_shop: sid, p_qty: qty, p_price: price, p_note: String(b.note || '').trim().slice(0, 100) || null });
      await sb(c, `/rest/v1/message_log?shop_id=eq.${sid}&status=eq.held`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'queued', error: null } });
      await audit(c, A, 'shop.pack', sid, { qty, price_rupees: price / 100, note: String(b.note || '').slice(0, 100), credits_after: credits });
      return J({ credits });
    }
    if (sm[2] === '/owner-email' && m === 'POST') {
      await gate();
      const b = await readBody(req), em = String(b.email || '').trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) throw bad('invalid_email');
      const r = await fetch(c.url + '/auth/v1/admin/users/' + own[0].user_id, { method: 'PUT', headers: adminHdr(c), body: JSON.stringify({ email: em, email_confirm: true }) });
      if (!r.ok) throw bad('email_in_use', 409);
      await sb(c, `/rest/v1/shops?id=eq.${sid}`, { method: 'PATCH', prefer: 'return=minimal', body: { owner_email: em } });
      await sb(c, `/rest/v1/shop_staff?user_id=eq.${own[0].user_id}&shop_id=eq.${sid}`, { method: 'PATCH', prefer: 'return=minimal', body: { email: em } });
      await audit(c, A, 'owner.email', sid, { email: em });
      return J({ ok: true });
    }
    if (sm[2] === '/owner-password' && m === 'POST') {
      await gate();
      const b = await readBody(req);
      if (String(b.password || '').length < 8) throw bad('weak_password');
      const r = await fetch(c.url + '/auth/v1/admin/users/' + own[0].user_id, { method: 'PUT', headers: adminHdr(c), body: JSON.stringify({ password: String(b.password) }) });
      if (!r.ok) throw bad('create_failed', 500);
      await audit(c, A, 'owner.password', sid, {});
      return J({ ok: true });
    }
    if (sm[2] === '/reset-admin-pin' && m === 'POST') {
      await gate();   // owner forgot the admin PIN and cannot use his password
      await sb(c, `/rest/v1/shop_staff?user_id=eq.${own[0].user_id}&shop_id=eq.${sid}`, { method: 'PATCH', prefer: 'return=minimal', body: { admin_pin_hash: null, pin_fails: 0, locked_until: null } });
      await audit(c, A, 'owner.pin_reset', sid, {});
      return J({ ok: true });
    }
  }
  throw bad('not_found', 404);
}

async function api(req, c, u, p) {
  if (p.startsWith('/api/c/')) { if (!c.customerApp) throw bad('not_found', 404); return await capi(req, c, u, p); }
  const m = req.method;

  if (p === '/api/login' && m === 'POST') {
    const b = await readBody(req);
    const r = await fetch(c.url + '/auth/v1/token?grant_type=password', { method: 'POST',
      headers: { apikey: c.anon, 'content-type': 'application/json' },
      body: JSON.stringify({ email: String(b.email || '').trim(), password: String(b.password || '') }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw bad('bad_login', 401);
    return J({ access_token: d.access_token, refresh_token: d.refresh_token });
  }
  // employee login: mobile number + 4-digit PIN given by the shopkeeper
  if (p === '/api/pinlogin' && m === 'POST') {
    const b = await readBody(req);
    const mobile = cleanMobile(b.mobile), pin = String(b.pin || '');
    if (!/^[6-9][0-9]{9}$/.test(mobile) || !/^\d{4}$/.test(pin)) throw bad('bad_login', 401);
    const cands = await sb(c, `/rest/v1/shop_staff?mobile=eq.${mobile}&role=eq.staff&pin_hash=not.is.null&select=user_id,shop_id,email,pin_hash,pin_fails,locked_until,shops(is_active)`);
    if (!cands.length) throw bad('bad_login', 401);
    let hit = null;
    for (const row of cands) { if (await pinCheck(c, row, pin, 'pin_hash')) { hit = row; break; } }
    if (!hit) throw bad('bad_login', 401);
    if (!hit.shops || !hit.shops.is_active) throw bad('shop_inactive', 403);
    const r = await fetch(c.url + '/auth/v1/token?grant_type=password', { method: 'POST',
      headers: { apikey: c.anon, 'content-type': 'application/json' },
      body: JSON.stringify({ email: hit.email, password: await staffPw(c, hit.shop_id, mobile) }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw bad('bad_login', 401);
    return J({ access_token: d.access_token, refresh_token: d.refresh_token });
  }
  // forgot password: Supabase emails a link back to this site (same answer whether or not the email exists)
  if (p === '/api/forgot' && m === 'POST') {
    const b = await readBody(req);
    const email = String(b.email || '').trim().toLowerCase();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      await fetch(c.url + '/auth/v1/recover?redirect_to=' + encodeURIComponent(u.origin + '/'), { method: 'POST',
        headers: { apikey: c.anon, 'content-type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => {});
    }
    return J({ ok: true });
  }
  // set a new password using the token from the emailed link
  if (p === '/api/setpw' && m === 'POST') {
    const b = await readBody(req);
    const pw = String(b.password || '');
    if (pw.length < 8) throw bad('weak_password');
    const r = await fetch(c.url + '/auth/v1/user', { method: 'PUT',
      headers: { apikey: c.anon, authorization: 'Bearer ' + String(b.token || ''), 'content-type': 'application/json' },
      body: JSON.stringify({ password: pw }) });
    if (!r.ok) throw bad('link_expired', 400);
    return J({ ok: true });
  }
  if (p === '/api/refresh' && m === 'POST') {
    const b = await readBody(req);
    const r = await fetch(c.url + '/auth/v1/token?grant_type=refresh_token', { method: 'POST',
      headers: { apikey: c.anon, 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: String(b.refresh_token || '') }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.access_token) throw bad('unauthorized', 401);
    return J({ access_token: d.access_token, refresh_token: d.refresh_token });
  }

  // forgot password by WhatsApp code (owner): code goes to the owner mobile saved by the master admin
  const ownerByEmail = async (email) => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
    const r = await sb(c, `/rest/v1/shop_staff?email=eq.${encodeURIComponent(email)}&role=eq.owner&select=user_id,shop_id,shops(id,is_active,owner_phone,default_lang)`);
    const o = r[0];
    return o && o.shops && o.shops.is_active && /^[6-9]\d{9}$/.test(String(o.shops.owner_phone || '')) ? o : null;
  };
  if (p === '/api/otp/request' && m === 'POST') {
    const b = await readBody(req), o = await ownerByEmail(String(b.email || '').trim().toLowerCase());
    if (o) {
      const mob = o.shops.owner_phone;
      const recent = await sb(c, `/rest/v1/otp_codes?shop_id=eq.${o.shop_id}&mobile=eq.${mob}&created_at=gt.${isoAgo(10 * 60000)}&select=id`);
      if (recent.length < 3) {
        const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
        await sb(c, `/rest/v1/otp_codes?shop_id=eq.${o.shop_id}&mobile=eq.${mob}&used_at=is.null`, { method: 'PATCH', prefer: 'return=minimal', body: { used_at: new Date().toISOString() } });
        await sb(c, '/rest/v1/otp_codes', { method: 'POST', prefer: 'return=minimal', body: { shop_id: o.shop_id, mobile: mob,
          code_hash: await sha(code + ':' + mob + ':' + o.shop_id), expires_at: new Date(Date.now() + 10 * 60000).toISOString() } });
        await sb(c, '/rest/v1/message_log', { method: 'POST', prefer: 'return=minimal', body: { shop_id: o.shop_id, kind: 'otp', lang: o.shops.default_lang || 'en',
          status: 'queued', to_mobile: '91' + mob, category: 'system', params: { code, minutes: 10 } } });
        await drain(c, 3).catch(() => {});
      }
    }
    return J({ ok: true });   // same answer whether or not the email exists
  }
  if (p === '/api/otp/verify' && m === 'POST') {
    const b = await readBody(req), o = await ownerByEmail(String(b.email || '').trim().toLowerCase());
    const pw = String(b.password || ''), code = String(b.code || '').trim();
    if (pw.length < 8) throw bad('weak_password');
    if (!o || !/^\d{6}$/.test(code)) throw bad('wrong_code');
    const mob = o.shops.owner_phone;
    const rows = await sb(c, `/rest/v1/otp_codes?shop_id=eq.${o.shop_id}&mobile=eq.${mob}&used_at=is.null&expires_at=gt.${isoNow()}&order=created_at.desc&limit=1&select=id,code_hash,attempts`);
    if (!rows.length || rows[0].attempts >= 5) throw bad('wrong_code');
    if (rows[0].code_hash !== await sha(code + ':' + mob + ':' + o.shop_id)) {
      await sb(c, `/rest/v1/otp_codes?id=eq.${rows[0].id}`, { method: 'PATCH', prefer: 'return=minimal', body: { attempts: rows[0].attempts + 1 } });
      throw bad('wrong_code');
    }
    await sb(c, `/rest/v1/otp_codes?id=eq.${rows[0].id}`, { method: 'PATCH', prefer: 'return=minimal', body: { used_at: new Date().toISOString() } });
    const r = await fetch(c.url + '/auth/v1/admin/users/' + o.user_id, { method: 'PUT', headers: adminHdr(c), body: JSON.stringify({ password: pw }) });
    if (!r.ok) throw bad('server_error', 500);
    return J({ ok: true });
  }

  if (p.startsWith('/api/m/')) return await mapi(req, c, u, p);

  const A = await auth(req, c);
  const shop = A.shop;
  if (!shop.is_active && p !== '/api/me') throw bad('shop_inactive', 403);   // suspended shops stop at once
  const owner = A.role === 'owner';
  // Owner-only pages need the owner's 4-digit admin PIN (checked here on the server, not just hidden in the app)
  const adm = async () => {
    if (!owner) throw bad('owner_only', 403);
    if (!A.row.admin_pin_hash) throw bad('admin_pin_not_set', 403);
    if (!(await okAdm(c, A.user.id, req.headers.get('x-admin')))) throw bad('admin_locked', 403);
  };

  if (!c.customerApp && ['/api/recharge', '/api/pending', '/api/approve', '/api/pincode', '/api/settings'].includes(p)) throw bad('not_found', 404);

  if (p === '/api/me' && m === 'GET') {
    return J({ email: A.user.email, role: A.role, shop: {
      name: shop.shop_name, code: shop.shop_code, default_lang: shop.default_lang,
      bonus_percent: Number(shop.bonus_percent), max_recharge_paise: Number(shop.max_recharge_paise),
      points_spend_paise: shop.points_spend_paise, is_active: shop.is_active, upi_id: shop.upi_id || '', low_balance_paise: Number(shop.low_balance_paise),
      redeem_points: shop.redeem_points, redeem_value_paise: Number(shop.redeem_value_paise),
      alerts: owner ? (shop.alerts || {}) : {}, footer_line: owner ? (shop.footer_line || '') : '', max_staff: shop.max_staff || 3 },
      staff_name: A.row.staff_name || '', admin_pin_set: owner ? !!A.row.admin_pin_hash : undefined,
      is_master: (await sb(c, `/rest/v1/platform_admins?user_id=eq.${A.user.id}&select=user_id`)).length > 0 });
  }

  // ---- menu ----
  if (p === '/api/menu' && m === 'GET') {
    return J(await sb(c, `/rest/v1/menu_items?shop_id=eq.${shop.id}&select=id,name_en,name_ta,price_paise,is_available,sort_order&order=sort_order.asc,created_at.asc`));
  }
  if (p === '/api/menu' && m === 'POST') {
    await adm();
    const b = await readBody(req);
    const name = String(b.name_en || '').trim().slice(0, 60);
    const pp = paise(b.price);
    if (!name) throw bad('name_required');
    if (!Number.isInteger(pp) || pp < 1 || pp > 10000000) throw bad('invalid_amount');
    const row = await sb(c, '/rest/v1/menu_items', { method: 'POST', prefer: 'return=representation',
      body: { shop_id: shop.id, name_en: name, name_ta: String(b.name_ta || '').trim().slice(0, 60) || null, price_paise: pp } });
    return J(row[0]);
  }
  const mm = p.match(/^\/api\/menu\/([0-9a-f-]{36})$/i);
  if (mm) {
    await adm();
    if (!UUID.test(mm[1])) throw bad('bad_id');
    if (m === 'DELETE') {
      await sb(c, `/rest/v1/menu_items?id=eq.${mm[1]}&shop_id=eq.${shop.id}`, { method: 'DELETE' });
      return J({ ok: true });
    }
    if (m === 'PATCH') {
      const b = await readBody(req);
      const patch = {};
      if (b.name_en !== undefined) { patch.name_en = String(b.name_en).trim().slice(0, 60); if (!patch.name_en) throw bad('name_required'); }
      if (b.name_ta !== undefined) patch.name_ta = String(b.name_ta).trim().slice(0, 60) || null;
      if (b.price !== undefined) {
        const pp = paise(b.price);
        if (!Number.isInteger(pp) || pp < 1 || pp > 10000000) throw bad('invalid_amount');
        patch.price_paise = pp;
      }
      if (b.is_available !== undefined) patch.is_available = !!b.is_available;
      if (!Object.keys(patch).length) throw bad('nothing_to_change');
      const row = await sb(c, `/rest/v1/menu_items?id=eq.${mm[1]}&shop_id=eq.${shop.id}`,
        { method: 'PATCH', prefer: 'return=representation', body: patch });
      return J(row[0] || {});
    }
  }

  // ---- customers ----
  if (p === '/api/customer' && m === 'GET') {
    const q = String(u.searchParams.get('q') || '').replace(/\D/g, '');
    if (!q) throw bad('customer_not_found', 404);
    const filter = q.length >= 10 ? `mobile=eq.${cleanMobile(q)}` : `short_id=eq.${parseInt(q, 10)}`;
    const r = await sb(c, `/rest/v1/customers?shop_id=eq.${shop.id}&${filter}&select=${CUST_COLS}&limit=1`);
    if (!r.length) throw bad('customer_not_found', 404);
    return J(r[0]);
  }
  if (p === '/api/search' && m === 'GET') {
    const q = String(u.searchParams.get('q') || '').trim().slice(0, 30).replace(/[^\p{L}\p{N} ]/gu, '').trim();
    if (!q) return J([]);
    let filter;
    if (/^\d+$/.test(q)) {
      filter = q.length >= 10 ? `mobile=eq.${cleanMobile(q)}` : `or=(short_id.eq.${parseInt(q, 10)},mobile.like.*${q})`;
    } else {
      filter = `name=ilike.*${encodeURIComponent(q)}*`;
    }
    return J(await sb(c, `/rest/v1/customers?shop_id=eq.${shop.id}&${filter}&select=${CUST_COLS}&order=name.asc&limit=8`));
  }
  // Regular customers with their usual order (most common bill in the last 45 days)
  if (p === '/api/regulars' && m === 'GET') {
    const rows = await sb(c, `/rest/v1/transactions?shop_id=eq.${shop.id}&txn_type=eq.DEDUCT&status=eq.COMPLETED&created_at=gt.${isoAgo(45 * 86400000)}&order=created_at.desc&limit=1000&select=customer_id,items,created_at`);
    const dayStart = Math.floor((Date.now() + 19800000) / 86400000) * 86400000 - 19800000;   // midnight India time
    const by = {};
    for (const r of rows) {
      const o = by[r.customer_id] || (by[r.customer_id] = { visits: 0, today: 0, sigs: {} });
      o.visits++;
      if (new Date(r.created_at).getTime() >= dayStart) o.today++;
      const items = Array.isArray(r.items) ? r.items : [];
      const withId = items.filter((i) => i.id).map((i) => ({ id: i.id, qty: i.qty, name: i.name, price_paise: i.price_paise }))
        .sort((a, b2) => (a.id < b2.id ? -1 : 1));
      const custom = items.filter((i) => !i.id).reduce((a, i) => a + Number(i.price_paise) * (i.qty || 1), 0);
      if (!withId.length && !custom) continue;
      const sig = withId.map((i) => i.id + 'x' + i.qty).join(',') + '|' + custom;
      const sg = o.sigs[sig] || (o.sigs[sig] = { n: 0, withId, custom });
      sg.n++;
    }
    const ids = Object.keys(by).filter((i) => Object.keys(by[i].sigs).length).sort((a, b2) => by[b2].visits - by[a].visits).slice(0, 40);
    if (!ids.length) return J([]);
    const custs = await sb(c, `/rest/v1/customers?shop_id=eq.${shop.id}&id=in.(${ids.join(',')})&select=${CUST_COLS}`);
    const cm = Object.fromEntries(custs.map((x) => [x.id, x]));
    return J(ids.filter((i) => cm[i]).map((i) => {
      let best = null;
      for (const sg of Object.values(by[i].sigs)) if (!best || sg.n > best.n) best = sg;   // ties: newest bill wins
      return { ...cm[i], visits: by[i].visits, today: by[i].today, usual: { items: best.withId, custom_paise: best.custom } };
    }));
  }
  if (p === '/api/customer' && m === 'POST') {
    const b = await readBody(req);
    const name = String(b.name || '').trim().slice(0, 80);
    const mobile = cleanMobile(b.mobile);
    if (!name) throw bad('name_required');
    if (!/^[6-9][0-9]{9}$/.test(mobile)) throw bad('invalid_mobile');
    const row = await rpc(c, 'create_customer', {
      p_shop: shop.id, p_name: name, p_mobile: mobile,
      p_email: String(b.email || '').trim().slice(0, 120) || null,
      p_address: String(b.address || '').trim().slice(0, 250) || null,
      p_lang: b.lang === 'ta' ? 'ta' : 'en', p_offers_optin: !!b.offers_optin,
      p_whatsapp_optin: b.whatsapp_optin !== false });   // alerts ON unless the shopkeeper unticked it
    return J(await getCust(c, shop.id, row.id));
  }

  // ---- money in: shopkeeper took cash or saw the UPI credit; wallet gets the amount plus bonus ----
  if (p === '/api/addmoney' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.customer_id))) throw bad('customer_not_found', 404);
    const base = Number(b.base_paise);
    if (!Number.isInteger(base)) throw bad('invalid_amount');
    const method = b.method === 'UPI' ? 'UPI' : 'CASH';
    const txn = await rpc(c, 'add_money', { p_shop: shop.id, p_customer: b.customer_id, p_base_paise: base, p_method: method, p_actor: A.user.id });
    return J({ txn, customer: await getCust(c, shop.id, b.customer_id) });
  }
  if (p === '/api/redeem' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.customer_id))) throw bad('customer_not_found', 404);
    const blocks = Number(b.blocks) || 1;
    if (!Number.isInteger(blocks) || blocks < 1 || blocks > 20) throw bad('invalid_amount');
    await rpc(c, 'redeem_points', { p_shop: shop.id, p_customer: b.customer_id, p_blocks: blocks });
    return J({ customer: await getCust(c, shop.id, b.customer_id) });
  }

  // ---- old flow (customer wallet page), only when CUSTOMER_APP=1 ----
  if (p === '/api/recharge' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.customer_id))) throw bad('customer_not_found', 404);
    const base = Number(b.base_paise);
    if (!Number.isInteger(base)) throw bad('invalid_amount');
    const t = await rpc(c, 'create_recharge', { p_shop: shop.id, p_customer: b.customer_id, p_base_paise: base });
    const done = await rpc(c, 'approve_recharge', { p_txn: t.id, p_actor: A.user.id });
    return J({ txn: done, customer: await getCust(c, shop.id, b.customer_id) });
  }

  // ---- bill: the server works out the total from menu prices ----
  if (p === '/api/bill' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.customer_id))) throw bad('customer_not_found', 404);
    const req_items = Array.isArray(b.items) ? b.items.slice(0, 60) : [];
    const lines = [];
    let total = 0;
    if (req_items.length) {
      const ids = req_items.map((i) => String(i.id));
      if (!ids.every((i) => UUID.test(i))) throw bad('bad_id');
      const menu = await sb(c, `/rest/v1/menu_items?shop_id=eq.${shop.id}&id=in.(${ids.join(',')})&select=id,name_en,price_paise,is_available`);
      const byId = Object.fromEntries(menu.map((x) => [x.id, x]));
      for (const i of req_items) {
        const it = byId[String(i.id)];
        const qty = Number(i.qty);
        if (!it || !it.is_available || !Number.isInteger(qty) || qty < 1 || qty > 99) throw bad('invalid_item');
        lines.push({ id: it.id, name: it.name_en, qty, price_paise: Number(it.price_paise) });
        total += qty * Number(it.price_paise);
      }
    }
    if (b.custom_paise) {
      const cp = Number(b.custom_paise);
      if (!Number.isInteger(cp) || cp < 1 || cp > 5000000) throw bad('invalid_amount');
      lines.push({ name: 'Other', qty: 1, price_paise: cp });
      total += cp;
    }
    if (total < 1) throw bad('invalid_amount');
    const ref = b.ref && /^[\w-]{8,64}$/.test(String(b.ref)) ? String(b.ref) : null;
    if (ref) {   // a retry of a bill that already went through returns the first result
      const done = await sb(c, `/rest/v1/transactions?shop_id=eq.${shop.id}&client_ref=eq.${ref}&select=*`);
      if (done.length) return J({ txn: done[0], customer: await getCust(c, shop.id, done[0].customer_id) });
    }
    if (!b.force) {
      const rc = await sb(c, `/rest/v1/transactions?customer_id=eq.${b.customer_id}&shop_id=eq.${shop.id}&txn_type=eq.DEDUCT&status=eq.COMPLETED&created_at=gt.${isoAgo(120000)}&order=created_at.desc&limit=1&select=base_paise,created_at`);
      if (rc.length) throw bad('recent_bill', 409, { amount_paise: Number(rc[0].base_paise), secs_ago: Math.round((Date.now() - new Date(rc[0].created_at)) / 1000) });
    }
    const txn = await rpc(c, 'deduct', { p_shop: shop.id, p_customer: b.customer_id,
      p_amount_paise: total, p_items: lines, p_actor: A.user.id, p_ref: ref });
    const cu = await getCust(c, shop.id, b.customer_id);
    if (!owner && Number(shop.alert_big_paise) > 0 && total >= Number(shop.alert_big_paise)) await ownerAlert(c, shop, `${A.row.staff_name || 'A staff member'} billed ${inr(total)} to ${cu.name}.`);
    return J({ txn, customer: cu });
  }

  if (p === '/api/undo' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.txn_id))) throw bad('not_found', 404);
    const t = await sb(c, `/rest/v1/transactions?id=eq.${b.txn_id}&shop_id=eq.${shop.id}&select=id,customer_id,base_paise,txn_type`);
    if (!t.length) throw bad('not_found', 404);
    await rpc(c, 'reverse_txn', { p_txn: t[0].id, p_actor: A.user.id });
    const cu = await getCust(c, shop.id, t[0].customer_id);
    if (!owner && shop.alert_reversal !== false) await ownerAlert(c, shop, `${A.row.staff_name || 'A staff member'} reversed a ${t[0].txn_type === 'RECHARGE' ? 'recharge' : 'bill'} of ${inr(t[0].base_paise)} for ${cu.name}.`);
    return J({ customer: cu });
  }

  if (p === '/api/recent' && m === 'GET') {
    return J(await sb(c, `/rest/v1/transactions?shop_id=eq.${shop.id}&status=neq.PENDING&order=created_at.desc&limit=30&select=id,txn_type,status,base_paise,bonus_paise,wallet_change_paise,points_change,created_at,customers(name,mobile,short_id)`));
  }

  if (p === '/api/optin' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.customer_id))) throw bad('customer_not_found', 404);
    await sb(c, `/rest/v1/customers?id=eq.${b.customer_id}&shop_id=eq.${shop.id}`,
      { method: 'PATCH', prefer: 'return=minimal', body: { whatsapp_optin: !!b.whatsapp_optin } });
    return J({ customer: await getCust(c, shop.id, b.customer_id) });
  }
  if (p === '/api/prefs' && m === 'POST') {
    await adm();
    const b = await readBody(req);
    const patch = {};
    if (b.alerts && typeof b.alerts === 'object') {
      patch.alerts = {};
      for (const k of ALERT_KINDS) patch.alerts[k] = b.alerts[k] !== false;
    }
    if (b.low_balance !== undefined) {
      const lp = paise(b.low_balance);
      if (!Number.isInteger(lp) || lp < 0 || lp > 10000000) throw bad('invalid_amount');
      patch.low_balance_paise = lp;
    }
    if (b.auto_close !== undefined) patch.auto_close = !!b.auto_close;
    if (b.summary_wa !== undefined) patch.summary_wa = !!b.summary_wa;
    if (b.alert_big !== undefined) { const v = paise(b.alert_big || 0); if (!Number.isInteger(v) || v < 0 || v > 100000000) throw bad('invalid_amount'); patch.alert_big_paise = v; }
    if (b.alert_reversal !== undefined) patch.alert_reversal = !!b.alert_reversal;
    if (b.footer_line !== undefined) patch.footer_line = String(b.footer_line).replace(/[\r\n]+/g, ' ').trim().slice(0, 80) || null;
    if (b.default_lang !== undefined) patch.default_lang = b.default_lang === 'ta' ? 'ta' : 'en';
    if (!Object.keys(patch).length) throw bad('nothing_to_change');
    const row = await sb(c, `/rest/v1/shops?id=eq.${shop.id}`, { method: 'PATCH', prefer: 'return=representation', body: patch });
    const sh = row[0];
    return J({ alerts: sh.alerts, low_balance_paise: Number(sh.low_balance_paise), footer_line: sh.footer_line || '', default_lang: sh.default_lang, auto_close: sh.auto_close !== false, summary_wa: sh.summary_wa !== false, alert_big_paise: Number(sh.alert_big_paise || 0), alert_reversal: sh.alert_reversal !== false });
  }
  if (p === '/api/preview' && m === 'GET') {
    await adm();
    const lang = u.searchParams.get('lang') === 'ta' ? 'ta' : 'en';
    const kinds = ALERT_KINDS.map((k) => [k, k]).concat([['bill_low', 'bill']]);
    return J(kinds.map(([k, sk]) => ({ kind: k, text: renderMsg(k, lang, SAMPLE[sk], shop) })));
  }
  if (p === '/api/messages' && m === 'GET') {
    await adm();
    const rows = await sb(c, `/rest/v1/message_log?shop_id=eq.${shop.id}&kind=neq.otp&order=created_at.desc&limit=20&select=id,kind,lang,status,error,params,created_at,customers(name)`);
    return J(rows.map((r) => ({ id: r.id, kind: r.kind, status: r.status, error: r.error, created_at: r.created_at,
      name: r.customers ? r.customers.name : '', text: renderMsg(r.kind, r.lang, r.params || {}, shop) })));
  }

  // ---- usage, offers, exports (owner, admin PIN) ----
  if (p === '/api/usage' && m === 'GET') {
    await adm();
    const from = monthStartIST().toISOString();
    const q = await sb(c, `/rest/v1/message_log?shop_id=eq.${shop.id}&status=in.(queued,held,failed)&created_at=gte.${encodeURIComponent(from)}&select=status&limit=1000`);
    const n = (s) => q.filter((x) => x.status === s).length;
    return J({ used: await rpc(c, 'utility_used', { p_shop: shop.id, p_from: from }), limit: shop.monthly_msg_limit, credits: shop.msg_credits || 0,
      queued: n('queued'), held: n('held'), failed: n('failed'), live: waOn(c.env), auto_close: shop.auto_close !== false, summary_wa: shop.summary_wa !== false, alert_big_paise: Number(shop.alert_big_paise || 0), alert_reversal: shop.alert_reversal !== false });
  }
  const AUD = ['all', 'low', 'inactive', 'points'];
  if (p === '/api/offers' && m === 'GET') {
    await adm();
    return J(await sb(c, `/rest/v1/offers?shop_id=eq.${shop.id}&order=created_at.desc&limit=15&select=id,params,recipients,created_at`));
  }
  if (p === '/api/offers/count' && m === 'POST') {
    await adm();
    const b = await readBody(req);
    if (!AUD.includes(b.audience)) throw bad('invalid_amount');
    return J(await rpc(c, 'queue_offer', { p_shop: shop.id, p_audience: b.audience, p_params: {}, p_dry: true, p_by: A.user.id }));
  }
  if (p === '/api/offers' && m === 'POST') {
    await adm();
    const b = await readBody(req), text = String(b.text || '').trim().slice(0, 500), img = String(b.image || '').trim();
    if (text.length < 3) throw bad('text_required');
    if (!AUD.includes(b.audience)) throw bad('invalid_amount');
    if (img && !/^https:\/\/[^\s"<>]{4,280}$/.test(img)) throw bad('invalid_image');
    const r = await rpc(c, 'queue_offer', { p_shop: shop.id, p_audience: b.audience, p_params: img ? { text, image: img } : { text }, p_dry: false, p_by: A.user.id });
    await drain(c, 10).catch(() => {});
    return J(r);
  }
  const csv = (rows) => rows.map((r) => r.map((v) => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\n');
  const fetchAll = async (path) => { let all = [], off = 0; for (let i = 0; i < 20; i++) { const r = await sb(c, `${path}&limit=1000&offset=${off}`); all = all.concat(r); if (r.length < 1000) break; off += 1000; } return all; };
  const ist = (d) => new Date(new Date(d).getTime() + 19800000).toISOString().replace('T', ' ').slice(0, 19);
  const csvRes = (name, body) => new Response('﻿' + body, { headers: { 'content-type': 'text/csv;charset=utf-8', 'content-disposition': `attachment; filename="${name}"`, 'cache-control': 'no-store' } });
  if (p === '/api/export/customers' && m === 'GET') {
    await adm();
    const rows = await fetchAll(`/rest/v1/customers?shop_id=eq.${shop.id}&order=created_at.asc&select=short_id,name,mobile,wallet_paise,points,lang,whatsapp_optin,offers_optin,created_at`);
    return csvRes('customers.csv', csv([['ID', 'Name', 'Mobile', 'Wallet (Rs)', 'Points', 'Language', 'WhatsApp alerts', 'Offers', 'Joined (IST)']]
      .concat(rows.map((r) => [r.short_id, r.name, r.mobile, (r.wallet_paise / 100).toFixed(2), r.points, r.lang, r.whatsapp_optin ? 'yes' : 'no', r.offers_optin ? 'yes' : 'no', ist(r.created_at)]))));
  }
  if (p === '/api/export/transactions' && m === 'GET') {
    await adm();
    const rows = await fetchAll(`/rest/v1/transactions?shop_id=eq.${shop.id}&status=neq.PENDING&order=created_at.asc&select=txn_type,status,base_paise,bonus_paise,wallet_change_paise,points_change,pay_method,created_at,customers(name,mobile,short_id)`);
    return csvRes('transactions.csv', csv([['Date (IST)', 'Type', 'Status', 'Customer', 'Mobile', 'Customer ID', 'Amount (Rs)', 'Bonus (Rs)', 'Wallet change (Rs)', 'Points change', 'Paid by']]
      .concat(rows.map((r) => [ist(r.created_at), r.txn_type, r.status, r.customers ? r.customers.name : '', r.customers ? r.customers.mobile : '', r.customers ? r.customers.short_id : '',
        (r.base_paise / 100).toFixed(2), (r.bonus_paise / 100).toFixed(2), (r.wallet_change_paise / 100).toFixed(2), r.points_change, r.pay_method || '']))));
  }

  // ---- admin PIN (owner) and employee lock screen ----
  if (p === '/api/adminpin/set' && m === 'POST') {
    if (!owner) throw bad('owner_only', 403);
    const b = await readBody(req);
    if (!/^\d{4}$/.test(String(b.pin || ''))) throw bad('bad_pin');
    if (A.row.admin_pin_hash && !(await pinCheck(c, A.row, String(b.old_pin || ''), 'admin_pin_hash'))) throw bad('wrong_pin', 403);
    await sb(c, `/rest/v1/shop_staff?user_id=eq.${A.user.id}&shop_id=eq.${shop.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { admin_pin_hash: await hashPin(String(b.pin)) } });
    return J({ token: await mkAdm(c, A.user.id) });
  }
  if (p === '/api/adminpin/verify' && m === 'POST') {
    if (!owner) throw bad('owner_only', 403);
    const b = await readBody(req);
    if (!A.row.admin_pin_hash) throw bad('admin_pin_not_set', 403);
    if (!(await pinCheck(c, A.row, String(b.pin || ''), 'admin_pin_hash'))) throw bad('wrong_pin', 403);
    return J({ token: await mkAdm(c, A.user.id) });
  }
  if (p === '/api/adminpin/reset' && m === 'POST') {   // forgot the admin PIN: prove it is you with the login password
    if (!owner) throw bad('owner_only', 403);
    const b = await readBody(req);
    if (!/^\d{4}$/.test(String(b.pin || ''))) throw bad('bad_pin');
    const r = await fetch(c.url + '/auth/v1/token?grant_type=password', { method: 'POST',
      headers: { apikey: c.anon, 'content-type': 'application/json' }, body: JSON.stringify({ email: A.user.email, password: String(b.password || '') }) });
    if (!r.ok) throw bad('bad_login', 401);
    await sb(c, `/rest/v1/shop_staff?user_id=eq.${A.user.id}&shop_id=eq.${shop.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { admin_pin_hash: await hashPin(String(b.pin)), pin_fails: 0, locked_until: null } });
    return J({ token: await mkAdm(c, A.user.id) });
  }
  if (p === '/api/unlock' && m === 'POST') {   // employee's own PIN to leave the lock screen
    const b = await readBody(req);
    if (owner) throw bad('not_found', 404);
    if (!(await pinCheck(c, A.row, String(b.pin || ''), 'pin_hash'))) throw bad('wrong_pin', 403);
    return J({ ok: true });
  }

  // ---- employees (owner, admin PIN): name + mobile + 4-digit PIN created by the shopkeeper ----
  if (p === '/api/staff' && m === 'GET') {
    await adm();
    const rows = await sb(c, `/rest/v1/shop_staff?shop_id=eq.${shop.id}&select=user_id,role,staff_name,mobile,created_at&order=created_at.asc`);
    return J({ max: shop.max_staff || 3, staff: rows });
  }
  if (p === '/api/staff' && m === 'POST') {
    await adm();
    const b = await readBody(req);
    const name = String(b.name || '').trim().slice(0, 60);
    const mobile = cleanMobile(b.mobile);
    const pin = b.pin ? String(b.pin) : rndPin();
    if (!name) throw bad('name_required');
    if (!/^[6-9][0-9]{9}$/.test(mobile)) throw bad('invalid_mobile');
    if (!/^\d{4}$/.test(pin)) throw bad('bad_pin');
    const cur = await sb(c, `/rest/v1/shop_staff?shop_id=eq.${shop.id}&select=user_id,mobile`);
    if (cur.length >= (shop.max_staff || 3)) throw bad('staff_limit', 409, { max: shop.max_staff || 3 });
    if (cur.some((x) => x.mobile === mobile)) throw bad('mobile_in_use', 409);
    const email = staffEmail(mobile, shop.id);
    const r = await fetch(c.url + '/auth/v1/admin/users', { method: 'POST',
      headers: { apikey: c.svc, 'content-type': 'application/json', ...(c.svc.startsWith('eyJ') ? { authorization: 'Bearer ' + c.svc } : {}) },
      body: JSON.stringify({ email, password: await staffPw(c, shop.id, mobile), email_confirm: true }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw bad(/already|registered|exists/i.test(JSON.stringify(d)) ? 'mobile_in_use' : 'staff_create_failed', 409);
    await sb(c, '/rest/v1/shop_staff', { method: 'POST', prefer: 'return=minimal',
      body: { user_id: d.id, shop_id: shop.id, role: 'staff', staff_name: name, email, mobile, pin_hash: await hashPin(pin) } });
    return J({ ok: true, pin });   // shown to the shopkeeper once
  }
  const spin = p.match(/^\/api\/staff\/([0-9a-f-]{36})\/pin$/i);
  if (spin && m === 'POST') {   // new PIN, old one stops working at once
    await adm();
    const row = await sb(c, `/rest/v1/shop_staff?user_id=eq.${spin[1]}&shop_id=eq.${shop.id}&role=eq.staff&select=user_id`);
    if (!row.length) throw bad('not_found', 404);
    const pin = rndPin();
    await sb(c, `/rest/v1/shop_staff?user_id=eq.${spin[1]}&shop_id=eq.${shop.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { pin_hash: await hashPin(pin), pin_fails: 0, locked_until: null } });
    return J({ pin });
  }
  const sm = p.match(/^\/api\/staff\/([0-9a-f-]{36})$/i);
  if (sm && m === 'DELETE') {
    await adm();
    if (!UUID.test(sm[1]) || sm[1] === A.user.id) throw bad('cannot_remove_self', 400);
    const row = await sb(c, `/rest/v1/shop_staff?user_id=eq.${sm[1]}&shop_id=eq.${shop.id}&role=eq.staff&select=user_id`);
    if (!row.length) throw bad('not_found', 404);
    await sb(c, `/rest/v1/shop_staff?user_id=eq.${sm[1]}&shop_id=eq.${shop.id}`, { method: 'DELETE' });
    await fetch(c.url + '/auth/v1/admin/users/' + sm[1], { method: 'DELETE',
      headers: { apikey: c.svc, ...(c.svc.startsWith('eyJ') ? { authorization: 'Bearer ' + c.svc } : {}) } });
    return J({ ok: true });
  }

  // ---- reports and Day Close (owner, admin PIN) ----
  const period = async () => {
    const last = await sb(c, `/rest/v1/day_closes?shop_id=eq.${shop.id}&status=eq.CLOSED&order=closed_at.desc&limit=1&select=id,closed_at,revision`);
    return { from: last.length ? new Date(last[0].closed_at) : indiaMidnight(), last: last[0] || null };
  };
  if (p === '/api/report' && m === 'GET') {
    await adm();
    const pr = await period(), to = new Date();
    return J({ from: pr.from.toISOString(), to: to.toISOString(), last_close: pr.last,
      summary: await rpc(c, 'report_summary', { p_shop: shop.id, p_from: pr.from.toISOString(), p_to: to.toISOString() }) });
  }
  if (p === '/api/staffrep' && m === 'GET') {
    await adm();
    const rg = String(u.searchParams.get('range') || 'today'), now = new Date();
    const from = rg === 'month' ? monthStartIST() : new Date(indiaMidnight().getTime() - (rg === '7d' ? 6 : 0) * 86400000);
    return J({ range: ['month', '7d'].includes(rg) ? rg : 'today', from: from.toISOString(), to: now.toISOString(),
      rows: await rpc(c, 'staff_report', { p_shop: shop.id, p_from: from.toISOString(), p_to: now.toISOString() }) });
  }
  if (p === '/api/close' && m === 'POST') {
    await adm();
    const cb = await readBody(req);
    let counted = null;
    if (cb.cash_counted !== undefined && cb.cash_counted !== null && String(cb.cash_counted).trim() !== '') {
      counted = paise(cb.cash_counted);
      if (!Number.isInteger(counted) || counted < 0 || counted > 1000000000) throw bad('invalid_amount');
    }
    const pr = await period(), to = new Date();
    const summary = await rpc(c, 'report_summary', { p_shop: shop.id, p_from: pr.from.toISOString(), p_to: to.toISOString() });
    if (counted !== null) { summary.cash_expected_paise = Number(summary.added_cash_paise); summary.cash_counted_paise = counted; summary.cash_diff_paise = counted - Number(summary.added_cash_paise); }
    const re = await sb(c, `/rest/v1/day_closes?shop_id=eq.${shop.id}&status=eq.REOPENED&period_from=eq.${encodeURIComponent(pr.from.toISOString())}&select=id`);
    const row = await sb(c, '/rest/v1/day_closes', { method: 'POST', prefer: 'return=representation',
      body: { shop_id: shop.id, period_from: pr.from.toISOString(), closed_at: to.toISOString(), revision: 1 + re.length, summary, closed_by: A.user.id } });
    return J(row[0]);
  }
  if (p === '/api/reopen' && m === 'POST') {   // only the latest close, within 3 days
    await adm();
    const pr = await period();
    if (!pr.last) throw bad('nothing_to_reopen', 400);
    if (Date.now() - new Date(pr.last.closed_at) > 3 * 86400000) throw bad('reopen_window_over', 400);
    await sb(c, `/rest/v1/day_closes?id=eq.${pr.last.id}&shop_id=eq.${shop.id}`, { method: 'PATCH', prefer: 'return=minimal',
      body: { status: 'REOPENED', reopened_at: new Date().toISOString(), reopened_by: A.user.id } });
    return J({ ok: true });
  }
  if (p === '/api/closes' && m === 'GET') {
    await adm();
    return J(await sb(c, `/rest/v1/day_closes?shop_id=eq.${shop.id}&order=closed_at.desc&limit=30&select=id,period_from,closed_at,revision,status,summary`));
  }

  if (p === '/api/pending' && m === 'GET') {
    return J(await sb(c, `/rest/v1/transactions?shop_id=eq.${shop.id}&txn_type=eq.RECHARGE&or=(status.eq.PENDING,status.eq.EXPIRED)&created_at=gt.${isoAgo(30 * 60000)}&order=created_at.desc&limit=20&select=id,status,base_paise,bonus_paise,payable_paise,expires_at,created_at,customers(name,mobile,short_id)`));
  }
  if (p === '/api/approve' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.txn_id))) throw bad('not_found', 404);
    const t = await sb(c, `/rest/v1/transactions?id=eq.${b.txn_id}&shop_id=eq.${shop.id}&select=id,customer_id`);
    if (!t.length) throw bad('not_found', 404);
    const done = await rpc(c, 'approve_recharge', { p_txn: t[0].id, p_actor: A.user.id });
    return J({ txn: done, customer: await getCust(c, shop.id, t[0].customer_id) });
  }
  if (p === '/api/today' && m === 'GET') {
    await adm();
    let d = String(u.searchParams.get('d') || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) d = new Date(Date.now() + 19800000).toISOString().slice(0, 10);   // India date
    return J(await rpc(c, 'day_summary', { p_shop: shop.id, p_day: d }));
  }
  if (p === '/api/pincode' && m === 'POST') {
    const b = await readBody(req);
    if (!UUID.test(String(b.customer_id))) throw bad('customer_not_found', 404);
    const cu = await getCust(c, shop.id, b.customer_id);
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
    await sb(c, `/rest/v1/otp_codes?shop_id=eq.${shop.id}&mobile=eq.${cu.mobile}&used_at=is.null`,
      { method: 'PATCH', prefer: 'return=minimal', body: { used_at: new Date().toISOString() } });
    await sb(c, '/rest/v1/otp_codes', { method: 'POST', prefer: 'return=minimal',
      body: { shop_id: shop.id, mobile: cu.mobile, code_hash: await sha(code + ':' + cu.mobile + ':' + shop.id),
        expires_at: new Date(Date.now() + 10 * 60000).toISOString() } });
    return J({ code });
  }
  if (p === '/api/settings' && m === 'POST') {
    if (!owner) throw bad('owner_only', 403);
    const b = await readBody(req);
    const upi = String(b.upi_id || '').trim();
    if (!/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(upi)) throw bad('invalid_upi');
    await sb(c, `/rest/v1/shops?id=eq.${shop.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { upi_id: upi } });
    return J({ ok: true, upi_id: upi });
  }

  throw bad('not_found', 404);
}

// ================= WhatsApp: templates, sender (simulate or real), webhook, daily job =================
const WA_VER = 'v21.0';
const one = (s) => String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim() || '-';
const istNow = () => new Date(Date.now() + 19800000);
const monthStartIST = () => { const n = istNow(); return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1) - 19800000); };
// Template texts to register in Meta (WhatsApp Manager > Message templates). Name = kudai2_<key>_<en|ta>.
const TPL = {
  welcome: { cat: 'UTILITY', ex: ['Ravi', 'Demo Tea Stall', '1001', '4587', '₹0', '0'],
    en: 'Hi {{1}}, welcome to {{2}}! Your new wallet is ready to use. Your wallet number is {{3}}, linked to your mobile number ending with {{4}}. Your current wallet balance is {{5}} and your loyalty points are {{6}}. Thank you for joining us!',
    ta: 'வணக்கம் {{1}}! {{2}} கடைக்கு வரவேற்கிறோம். உங்கள் புதிய வாலட் பயன்படுத்தத் தயார். உங்கள் வாலட் எண் {{3}}, இது {{4}} என முடியும் உங்கள் மொபைல் எண்ணுடன் இணைக்கப்பட்டுள்ளது. தற்போதைய வாலட் இருப்பு {{5}}, உங்கள் புள்ளிகள் {{6}}. எங்களுடன் இணைந்ததற்கு நன்றி!',
    v: (p, s) => [p.name, s.shop_name, p.short_id, p.last4, inr(p.balance_paise), p.points] },
  recharge: { cat: 'UTILITY', ex: ['Ravi', 'Demo Tea Stall', '₹200', '₹10', '₹210', '₹210', '0'],
    en: 'Hi {{1}}, thank you for visiting. Your {{2}} wallet has been recharged successfully. You paid {{3}} and received a bonus of {{4}}, so the total amount added to your wallet is {{5}}. Your current wallet balance is {{6}} and your loyalty points are {{7}}. Thank you for being our valued customer!',
    ta: 'வணக்கம் {{1}}, வருகைக்கு நன்றி. உங்கள் {{2}} வாலட் வெற்றிகரமாக ரீசார்ஜ் செய்யப்பட்டது. நீங்கள் {{3}} செலுத்தி {{4}} போனஸ் பெற்றீர்கள், எனவே உங்கள் வாலட்டில் மொத்தம் {{5}} சேர்ந்தது. தற்போதைய வாலட் இருப்பு {{6}}, உங்கள் புள்ளிகள் {{7}}. எங்கள் அன்பான வாடிக்கையாளராக இருப்பதற்கு நன்றி!',
    v: (p, s) => [p.name, s.shop_name, inr(p.paid_paise), inr(p.bonus_paise), inr(p.total_paise), inr(p.balance_paise), p.points] },
  bill: { cat: 'UTILITY', ex: ['Ravi', 'Demo Tea Stall', '₹10', 'Tea x1', '₹200', '1', '5'],
    en: 'Hi {{1}}, thank you for shopping with us. An amount of {{3}} was paid from your {{2}} wallet for {{4}}. Your remaining wallet balance is {{5}}. You earned {{6}} points on this bill and your total loyalty points are now {{7}}. We look forward to seeing you again!',
    ta: 'வணக்கம் {{1}}, எங்களிடம் வாங்கியதற்கு நன்றி. உங்கள் {{2}} வாலட்டிலிருந்து {{3}} செலுத்தப்பட்டது ({{4}}). உங்கள் வாலட்டில் மீதமுள்ள இருப்பு {{5}}. இந்த பில்லில் {{6}} புள்ளிகள் கிடைத்தன, உங்கள் மொத்த புள்ளிகள் இப்போது {{7}}. மீண்டும் உங்களை சந்திக்க ஆவலாக இருக்கிறோம்!',
    v: (p, s) => [p.name, s.shop_name, inr(p.amount_paise), p.items || 'purchase', inr(p.balance_paise), p.points_earned, p.points] },
  bill_low: { cat: 'UTILITY', ex: ['Ravi', 'Demo Tea Stall', '₹10', 'Tea x1', '₹15', '1', '5'],
    en: 'Hi {{1}}, thank you for shopping with us. An amount of {{3}} was paid from your {{2}} wallet for {{4}}. Your remaining wallet balance is {{5}}. You earned {{6}} points on this bill and your total loyalty points are now {{7}}. Your balance is running low, so please recharge soon.',
    ta: 'வணக்கம் {{1}}, எங்களிடம் வாங்கியதற்கு நன்றி. உங்கள் {{2}} வாலட்டிலிருந்து {{3}} செலுத்தப்பட்டது ({{4}}). உங்கள் வாலட்டில் மீதமுள்ள இருப்பு {{5}}. இந்த பில்லில் {{6}} புள்ளிகள் கிடைத்தன, உங்கள் மொத்த புள்ளிகள் இப்போது {{7}}. இருப்பு குறைவாக உள்ளது, விரைவில் ரீசார்ஜ் செய்யவும்.',
    v: (p, s) => [p.name, s.shop_name, inr(p.amount_paise), p.items || 'purchase', inr(p.balance_paise), p.points_earned, p.points] },
  low: { cat: 'UTILITY', ex: ['Ravi', 'Demo Tea Stall', '₹15'],
    en: 'Hi {{1}}, this is a friendly reminder that your {{2}} wallet balance is running low at {{3}}. Please recharge your wallet soon so you can continue to enjoy hassle-free payments. Thank you!',
    ta: 'வணக்கம் {{1}}, இது ஒரு நினைவூட்டல்: உங்கள் {{2}} வாலட் இருப்பு {{3}} ஆகக் குறைந்துள்ளது. தொந்தரவில்லாமல் தொடர்ந்து பணம் செலுத்த விரைவில் வாலட்டை ரீசார்ஜ் செய்யவும். நன்றி!',
    v: (p, s) => [p.name, s.shop_name, inr(p.balance_paise)] },
  reversal: { cat: 'UTILITY', ex: ['Ravi', 'Demo Tea Stall', '₹10', '₹210', '4'],
    en: 'Hi {{1}}, an amount of {{3}} was returned to your {{2}} wallet because your last bill was corrected by the shop. Your updated wallet balance is {{4}} and your loyalty points are {{5}}. Thank you for your understanding!',
    ta: 'வணக்கம் {{1}}, உங்கள் கடைசி பில் கடையால் திருத்தப்பட்டதால் {{3}} உங்கள் {{2}} வாலட்டுக்குத் திரும்ப சேர்க்கப்பட்டது. உங்கள் புதிய வாலட் இருப்பு {{4}}, புள்ளிகள் {{5}}. உங்கள் புரிதலுக்கு நன்றி!',
    v: (p, s) => [p.name, s.shop_name, inr(p.amount_paise), inr(p.balance_paise), p.points] },
  redeem: { cat: 'UTILITY', ex: ['Ravi', 'Demo Tea Stall', '100', '₹10', '₹30', '20'],
    en: 'Hi {{1}}, thank you for being a loyal customer. At {{2}} you redeemed {{3}} loyalty points and received {{4}} as wallet credit. Your updated wallet balance is {{5}} and you still have {{6}} points left. We hope to see you again soon!',
    ta: 'வணக்கம் {{1}}, விசுவாசமான வாடிக்கையாளராக இருப்பதற்கு நன்றி. {{2}} கடையில் நீங்கள் {{3}} புள்ளிகளைப் பயன்படுத்தி {{4}} வாலட் தொகையாகப் பெற்றீர்கள். உங்கள் புதிய வாலட் இருப்பு {{5}}, மீதமுள்ள புள்ளிகள் {{6}}. விரைவில் உங்களை மீண்டும் சந்திப்போம்!',
    v: (p, s) => [p.name, s.shop_name, p.points_used, inr(p.value_paise), inr(p.balance_paise), p.points] },
  offer: { cat: 'MARKETING', ex: ['Ravi', 'Demo Tea Stall', 'Buy 2 teas and get a biscuit free this week.'],
    en: 'Hi {{1}}, here is a special message from {{2}} for our valued customers: {{3}} If you do not wish to receive such offers, reply STOP to unsubscribe.',
    ta: 'வணக்கம் {{1}}, எங்கள் மதிப்புமிக்க வாடிக்கையாளர்களுக்காக {{2}} கடையிலிருந்து ஒரு சிறப்புச் செய்தி: {{3}} இதுபோன்ற சலுகைகள் வேண்டாம் என்றால் STOP என்று பதிலளிக்கவும்.',
    v: (p, s, row) => [row.cname || 'friend', s.shop_name, p.text] },
  offerimg: { cat: 'MARKETING', header: 'IMAGE', ex: ['Ravi', 'Demo Tea Stall', 'Buy 2 teas and get a biscuit free this week.'],
    en: 'Hi {{1}}, here is a special message from {{2}} for our valued customers: {{3}} If you do not wish to receive such offers, reply STOP to unsubscribe.',
    ta: 'வணக்கம் {{1}}, எங்கள் மதிப்புமிக்க வாடிக்கையாளர்களுக்காக {{2}} கடையிலிருந்து ஒரு சிறப்புச் செய்தி: {{3}} இதுபோன்ற சலுகைகள் வேண்டாம் என்றால் STOP என்று பதிலளிக்கவும்.',
    v: (p, s, row) => [row.cname || 'friend', s.shop_name, p.text] },
  ownalert: { cat: 'UTILITY', ex: ['Murugan', 'Demo Tea Stall', 'Kala billed Rs 2,500 to Ravi.'],
    en: 'Hi {{1}}, this is a security alert for your shop {{2}}. {{3}} Please open your Kudai app to review the details. Thank you for using Kudai!',
    ta: 'வணக்கம் {{1}}, இது உங்கள் {{2}} கடைக்கான பாதுகாப்பு எச்சரிக்கை. {{3}} விவரங்களை Kudai app-ல் பார்க்கவும். Kudai பயன்படுத்தியதற்கு நன்றி!',
    v: (p) => [p.owner, p.shop, p.text] },
  daysummary: { cat: 'UTILITY', ex: ['Murugan', 'Demo Tea Stall', '23 Nov', '₹1,250', '42', '₹500', '3'],
    en: 'Hi {{1}}, here is the daily summary for your shop {{2}} on {{3}}. Total wallet sales were {{4}} across {{5}} bills. Money added to customer wallets was {{6}} and {{7}} new members joined today. Thank you for using Kudai!',
    ta: 'வணக்கம் {{1}}, உங்கள் {{2}} கடையின் {{3}} நாளுக்கான தினசரி சுருக்கம் இது. மொத்த வாலட் விற்பனை {{4}}, பில்கள் எண்ணிக்கை {{5}}. வாடிக்கையாளர் வாலட்டுகளில் சேர்க்கப்பட்ட பணம் {{6}}, இன்று புதிதாக இணைந்த உறுப்பினர்கள் {{7}}. Kudai பயன்படுத்தியதற்கு நன்றி!',
    v: (p) => [p.owner, p.shop, p.date, p.sales, p.bills, p.added, p.new_members] },
};
// Login code: create in Meta as category AUTHENTICATION (Copy code button) with names kudai2_otp_en and kudai2_otp_ta.
const waOn = (env) => !!(env && env.WA_TOKEN && env.WA_PHONE_ID);
async function waPost(env, body) {
  try {
    const r = await fetch(`https://graph.facebook.com/${WA_VER}/${env.WA_PHONE_ID}/messages`, { method: 'POST',
      headers: { authorization: 'Bearer ' + env.WA_TOKEN, 'content-type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...body }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.messages && d.messages[0]) return { ok: true, id: d.messages[0].id };
    const e = d.error || {};
    return { ok: false, retry: r.status >= 500 || r.status === 429 || e.code === 130429 || e.code === 131056, err: `${e.code || r.status}: ${e.message || 'error'}`.slice(0, 200) };
  } catch (e) { return { ok: false, retry: true, err: 'network' }; }
}
function waBody(row, shop) {
  const kind = row.kind, lang = 'en', p = row.params || {}; // WhatsApp templates are English only (Tamil not registered in Meta)
  if (kind === 'otp') return { to: row.to_mobile, type: 'template', template: { name: `kudai2_otp_${lang}`, language: { code: lang }, components: [
    { type: 'body', parameters: [{ type: 'text', text: String(p.code) }] },
    { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: String(p.code) }] }] } };
  const key = kind === 'offer' && p.image ? 'offerimg' : kind;
  const t = TPL[key];
  if (!t) return null;
  const comps = [];
  if (t.header === 'IMAGE') comps.push({ type: 'header', parameters: [{ type: 'image', image: { link: p.image } }] });
  comps.push({ type: 'body', parameters: t.v(p, shop, row).map((x) => ({ type: 'text', text: one(x) })) });
  return { to: row.to_mobile, type: 'template', template: { name: `kudai2_${key}_${lang}`, language: { code: lang }, components: comps } };
}
const refund = (c, shopId) => rpc(c, 'add_pack', { p_shop: shopId, p_qty: 1, p_price: 0, p_note: 'refund: message not sent' }).catch(() => {});
// Sends a batch of queued messages. No WhatsApp keys set = simulate mode (marked sent, nothing leaves the server).
async function drain(c, limit = 10) {
  const env = c.env || {}, real = waOn(env);
  const rows = await rpc(c, 'claim_queue', { p_limit: limit });
  const out = { mode: real ? 'whatsapp' : 'simulate', claimed: rows.length, sent: 0, failed: 0, held: 0, skipped: 0 };
  if (!rows.length) return out;
  const sids = [...new Set(rows.map((r) => r.shop_id))], cids = [...new Set(rows.map((r) => r.customer_id).filter(Boolean))];
  const shops = Object.fromEntries((await sb(c, `/rest/v1/shops?id=in.(${sids.join(',')})&select=id,shop_name,footer_line,redeem_points,is_active,monthly_msg_limit`)).map((s) => [s.id, s]));
  const custs = cids.length ? Object.fromEntries((await sb(c, `/rest/v1/customers?id=in.(${cids.join(',')})&select=id,name,whatsapp_optin,offers_optin`)).map((x) => [x.id, x])) : {};
  const from = monthStartIST().toISOString(), used = {};
  const patch = (id, body) => sb(c, `/rest/v1/message_log?id=eq.${id}`, { method: 'PATCH', prefer: 'return=minimal', body });
  const simIds = [];
  for (const r of rows) {
    const s = shops[r.shop_id], cu = r.customer_id ? custs[r.customer_id] : null;
    if (!s || !s.is_active) { await patch(r.id, { status: 'failed', error: 'shop_inactive' }); out.failed++; if (r.category === 'marketing') await refund(c, r.shop_id); continue; }
    if (r.customer_id && (!cu || !cu.whatsapp_optin || (r.kind === 'offer' && !cu.offers_optin))) {
      await patch(r.id, { status: 'skipped', error: 'opted_out' }); out.skipped++; if (r.category === 'marketing') await refund(c, r.shop_id); continue; }
    let paid = false;
    if (r.category === 'utility') {   // free monthly allowance first, then prepaid pack credits
      if (used[s.id] === undefined) used[s.id] = (await rpc(c, 'utility_used', { p_shop: s.id, p_from: from })) - rows.filter((x) => x.shop_id === s.id && x.category === 'utility').length;
      used[s.id]++;
      if (used[s.id] > s.monthly_msg_limit) {
        if (await rpc(c, 'use_credits', { p_shop: s.id, p_n: 1 })) paid = true;
        else { used[s.id]--; await patch(r.id, { status: 'held', error: 'allowance_over' }); out.held++; continue; }
      }
    }
    if (!real) { simIds.push(r.id); out.sent++; continue; }
    const body = waBody({ ...r, cname: cu && cu.name }, s);
    const res = body ? await waPost(env, body) : { ok: false, retry: false, err: 'no_template' };
    if (res.ok) { await patch(r.id, { status: 'sent', sent_at: new Date().toISOString(), wa_message_id: res.id, error: null }); out.sent++; continue; }
    const final = !(res.retry && r.attempts < 3);
    if (final ? (paid || r.category === 'marketing') : paid) await refund(c, r.shop_id);
    await patch(r.id, final ? { status: 'failed', error: res.err } : { status: 'queued', error: res.err });
    if (final) out.failed++;
  }
  if (simIds.length) await sb(c, `/rest/v1/message_log?id=in.(${simIds.join(',')})`, { method: 'PATCH', prefer: 'return=minimal',
    body: { status: 'sent', sent_at: new Date().toISOString(), wa_message_id: 'simulated', error: null } });
  return out;
}

// Day summary + auto close for one shop. Returns true when it closed something.
async function autoClose(c, s, day) {
  const last = await sb(c, `/rest/v1/day_closes?shop_id=eq.${s.id}&status=eq.CLOSED&order=closed_at.desc&limit=1&select=closed_at`);
  const from = last.length ? new Date(last[0].closed_at) : indiaMidnight(), to = new Date();
  const sum = await rpc(c, 'report_summary', { p_shop: s.id, p_from: from.toISOString(), p_to: to.toISOString() });
  const active = Number(sum.bills) + Number(sum.undo_count) + Number(sum.added_cash_paise) + Number(sum.added_upi_paise) + Number(sum.new_members) > 0;
  if (active) {
    const re = await sb(c, `/rest/v1/day_closes?shop_id=eq.${s.id}&status=eq.REOPENED&period_from=eq.${encodeURIComponent(from.toISOString())}&select=id`);
    await sb(c, '/rest/v1/day_closes', { method: 'POST', prefer: 'return=minimal',
      body: { shop_id: s.id, period_from: from.toISOString(), closed_at: to.toISOString(), revision: 1 + re.length, summary: sum, closed_by: null } });
    if (s.summary_wa && /^[6-9]\d{9}$/.test(String(s.owner_phone || ''))) {
      const d = new Date(Date.now() + 19800000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
      await sb(c, '/rest/v1/message_log', { method: 'POST', prefer: 'return=minimal', body: { shop_id: s.id, kind: 'daysummary', lang: s.default_lang || 'en',
        status: 'queued', to_mobile: '91' + s.owner_phone, category: 'system', params: { owner: s.owner_name || 'Owner', shop: s.shop_name, date: d,
          sales: inr(Number(sum.gross_sales_paise) - Number(sum.corrections_paise)), bills: String(sum.bills),
          added: inr(Number(sum.added_cash_paise) + Number(sum.added_upi_paise)), new_members: String(sum.new_members) } } });
    }
  }
  await sb(c, `/rest/v1/shops?id=eq.${s.id}`, { method: 'PATCH', prefer: 'return=minimal', body: { last_auto_day: day } });
  return active;
}
// Runs from the Cloudflare cron (every minute): send queued messages, housekeeping, and the 11:30 PM auto close.
async function dailyJob(c, force) {
  const out = { drain: null, closed: 0, checked: 0 };
  out.drain = await drain(c, 10).catch((e) => ({ error: String((e && (e.err || e.data && e.data.message)) || e) }));
  const ist = istNow(), mins = ist.getUTCHours() * 60 + ist.getUTCMinutes(), day = ist.toISOString().slice(0, 10);
  if (force || mins < 5) {
    await sb(c, `/rest/v1/message_log?status=eq.held&created_at=lt.${encodeURIComponent(new Date(Date.now() - 3 * 86400000).toISOString())}`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'expired' } }).catch(() => {});
    await sb(c, `/rest/v1/message_log?status=eq.held&created_at=lt.${encodeURIComponent(monthStartIST().toISOString())}`, { method: 'PATCH', prefer: 'return=minimal', body: { status: 'queued' } }).catch(() => {});
  }
  if (!force && mins < 23 * 60 + 30) return out;
  const shops = await sb(c, '/rest/v1/shops?is_active=eq.true&auto_close=eq.true&select=id,shop_name,owner_name,owner_phone,default_lang,summary_wa,last_auto_day&order=created_at.asc');
  const todo = shops.filter((s) => force || s.last_auto_day !== day).slice(0, 3);
  for (const s of todo) { out.checked++; try { if (await autoClose(c, s, day)) out.closed++; } catch (e) { console.log('autoclose', s.id, JSON.stringify(e && (e.data || String(e)))); } }
  return out;
}

// WhatsApp webhook: delivery status + customer replies (BAL, STOP, START)
async function waInbound(c, env, from, text) {
  const mobile = cleanMobile(from), w = String(text || '').trim().toLowerCase();
  const rows = await sb(c, `/rest/v1/customers?mobile=eq.${mobile}&select=id,name,lang,wallet_paise,points,shops(shop_name)`);
  if (!rows.length) return;
  const ta = rows[0].lang === 'ta', say = (t) => waOn(env) ? waPost(env, { to: '91' + mobile, type: 'text', text: { body: t } }) : null;
  const upd = (body) => sb(c, `/rest/v1/customers?mobile=eq.${mobile}`, { method: 'PATCH', prefer: 'return=minimal', body });
  if (/^(stop all|stopall)$/.test(w)) { await upd({ offers_optin: false, whatsapp_optin: false }); await say(ta ? 'இனி எந்தச் செய்தியும் அனுப்பப்படாது. மீண்டும் பெற START என்று அனுப்பவும்.' : 'You will not get any more messages. Send START to turn them back on.'); }
  else if (/^(stop|unsubscribe|நிறுத்து)$/.test(w)) { await upd({ offers_optin: false }); await say(ta ? 'சலுகைச் செய்திகள் நிறுத்தப்பட்டன. பில்/ரீசார்ஜ் அறிவிப்புகள் தொடரும்.' : 'Offers stopped. You will still get bill and recharge alerts.'); }
  else if (/^(start|resume|தொடங்கு)$/.test(w)) { await upd({ whatsapp_optin: true }); await say(ta ? 'அறிவிப்புகள் மீண்டும் தொடங்கின.' : 'Alerts are back on.'); }
  else if (/^(bal|balance|இருப்பு)$/.test(w)) {
    const lines = rows.map((r) => `• ${r.shops ? r.shops.shop_name : ''}: ${inr(r.wallet_paise)}, ${r.points} ${ta ? 'புள்ளிகள்' : 'points'}`).join('\n');
    await say((ta ? 'உங்கள் வாலட் இருப்பு:\n' : 'Your wallet balance:\n') + lines);
  }
}
async function waWebhook(req, c, env) {
  const u = new URL(req.url);
  if (req.method === 'GET') {
    if (u.searchParams.get('hub.mode') === 'subscribe' && env.WA_VERIFY && u.searchParams.get('hub.verify_token') === env.WA_VERIFY)
      return new Response(u.searchParams.get('hub.challenge') || '', { status: 200 });
    return new Response('forbidden', { status: 403 });
  }
  const raw = await req.text();
  if (env.WA_APP_SECRET) {
    const sig = (req.headers.get('x-hub-signature-256') || '').replace('sha256=', '');
    if (!sig || sig !== (await hmac(env.WA_APP_SECRET, raw))) return new Response('bad signature', { status: 403 });
  }
  let d = {}; try { d = JSON.parse(raw); } catch (e) { return new Response('ok'); }
  let n = 0;
  const stat = { delivered: ['delivered', 'sent'], read: ['read', 'sent,delivered'], failed: ['failed', 'sent,delivered,sending,queued'] };
  for (const en of d.entry || []) for (const ch of en.changes || []) {
    const v = ch.value || {};
    for (const st of v.statuses || []) {
      if (++n > 40) break;
      const t = stat[st.status];
      if (!t || !/^[\w.=\-]+$/.test(String(st.id))) continue;
      const er = st.errors && st.errors[0];
      await sb(c, `/rest/v1/message_log?wa_message_id=eq.${st.id}&status=in.(${t[1]})`, { method: 'PATCH', prefer: 'return=minimal',
        body: t[0] === 'failed' ? { status: 'failed', error: er ? `${er.code}: ${er.title || ''}`.slice(0, 200) : 'failed' } : { status: t[0] } }).catch(() => {});
    }
    for (const m of v.messages || []) {
      if (++n > 40) break;
      const text = (m.text && m.text.body) || (m.button && m.button.text) || (m.interactive && m.interactive.button_reply && m.interactive.button_reply.title) || '';
      if (text && m.from) await waInbound(c, env, m.from, text).catch((e) => console.log('inbound', JSON.stringify(e && (e.data || String(e)))));
    }
  }
  return new Response('ok');
}

const PRIVACY = (n) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kudai – Privacy Policy</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#1f2d2b}h1{color:#0f766e}</style>
<h1>Kudai – Privacy Policy</h1><p>Kudai is a prepaid wallet and loyalty service for small shops, operated by ${n}.</p>
<h3>What we keep</h3><p>A shop records a customer's name, mobile number (and optionally email/address), wallet balance, loyalty points and purchase history so that the wallet works.</p>
<h3>WhatsApp messages</h3><p>With the customer's consent the shop sends wallet alerts (welcome, recharge, bill, low balance, points) and, only if the customer agreed, offers. Reply STOP to stop offers, STOP ALL to stop every message, START to resume.</p>
<h3>Sharing</h3><p>We do not sell personal data. Data is processed by our hosting and messaging providers (Cloudflare, Supabase, Meta WhatsApp) only to run the service.</p>
<h3>Your rights</h3><p>You may ask the shop, or us, to correct or delete your data. Contact: pingmeconnect@gmail.com.</p>
<p style="color:#667">Last updated: November 2026</p>`;

const getSettings = async (c) => { const r = await sb(c, '/rest/v1/platform_settings?id=eq.1&select=data'); return (r[0] && r[0].data) || {}; };
const invTotals = (inv, st) => {
  const sub = (inv.lines || []).reduce((a, l) => a + Number(l.amount_paise || 0), 0), g = Number(st.gst_percent) || 0, gst = Math.round(sub * g / 100);
  return { sub_paise: sub, gst_paise: gst, gst_percent: g, grand_paise: sub + gst };
};
const hesc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function invoiceHtml(list, st) {
  const pages = list.map((inv) => {
    const t = invTotals(inv, st), sh = inv.shops || {};
    const mo = new Date(Date.UTC(+inv.month.slice(0, 4), +inv.month.slice(5) - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const dt = (inv.issued_at ? new Date(inv.issued_at) : new Date(inv.created_at)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
    return `<section class="pg">
<div class="hd"><div class="lg">${ICON.replace('<svg ', '<svg width="44" height="44" ')}<div><b class="br">Kudai</b><div class="mu">Prepaid wallet &amp; loyalty for shops</div></div></div>
<div class="r"><b>${hesc(st.biz_name || '')}</b><div class="mu">${hesc(st.address || '')}</div><div class="mu">${hesc([st.phone, st.email].filter(Boolean).join(' · '))}</div>
<div class="mu">${st.gstin ? 'GSTIN: ' + hesc(st.gstin) : ''} ${st.pan ? ' PAN: ' + hesc(st.pan) : ''}</div></div></div>
<h2>${inv.status === 'DRAFT' ? 'INVOICE (DRAFT)' : 'INVOICE'}${inv.status === 'PAID' ? ' <span class="paid">PAID</span>' : ''}</h2>
<div class="meta"><div><b>Bill to</b><br>${hesc(sh.shop_name || '')}<br>${hesc(sh.owner_name || '')}<br>${hesc(sh.address || '')}<br>${sh.gstin ? 'GSTIN: ' + hesc(sh.gstin) + '<br>' : ''}${hesc([sh.owner_phone, sh.owner_email].filter(Boolean).join(' · '))}</div>
<div class="r">Invoice no: <b>${hesc(inv.number)}</b><br>Date: ${dt}<br>Period: ${mo}</div></div>
<table><tr><th>#</th><th>Description</th><th class="n">Qty</th><th class="n">Rate</th><th class="n">Amount</th></tr>
${(inv.lines || []).map((l, i) => `<tr><td>${i + 1}</td><td>${hesc(l.desc)}</td><td class="n">${l.qty}</td><td class="n">${inr(l.rate_paise)}</td><td class="n">${inr(l.amount_paise)}</td></tr>`).join('')}
${t.gst_percent ? `<tr><td colspan="4" class="n">Subtotal</td><td class="n">${inr(t.sub_paise)}</td></tr><tr><td colspan="4" class="n">GST @ ${t.gst_percent}%</td><td class="n">${inr(t.gst_paise)}</td></tr>` : ''}
<tr class="tt"><td colspan="4" class="n">Total payable</td><td class="n">${inr(t.grand_paise)}</td></tr></table>
${inv.notes ? `<p><b>Note:</b> ${hesc(inv.notes)}</p>` : ''}
${st.pay_text ? `<div class="box"><b>Payment details</b><br>${hesc(st.pay_text).replace(/\n/g, '<br>')}</div>` : ''}
<p class="mu">${hesc(st.terms || '')}</p><p class="mu ft">Generated by Kudai · ${hesc(st.biz_name || '')}</p></section>`;
  }).join('');
  return `<!doctype html><meta charset="utf-8"><title>Kudai invoices</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:14px/1.5 system-ui,sans-serif;color:#17302d;margin:0;background:#eef2f1}.pg{background:#fff;max-width:760px;margin:12px auto;padding:28px;box-sizing:border-box}
.hd{display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid #0f766e;padding-bottom:10px}.lg{display:flex;gap:10px;align-items:center}.br{font-size:26px;color:#0f766e}
.r{text-align:right}.mu{color:#5f7370;font-size:12px}h2{margin:14px 0 6px;letter-spacing:1px}.paid{color:#fff;background:#15803d;font-size:12px;padding:2px 8px;border-radius:4px;vertical-align:middle}
.meta{display:flex;justify-content:space-between;gap:12px;margin:8px 0 14px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #d6e0de;padding:7px 6px;text-align:left}
th{background:#e6f1ef}.n{text-align:right}.tt td{font-weight:700;border-top:2px solid #0f766e;font-size:16px}.box{border:1px dashed #0f766e;padding:8px 10px;margin:12px 0;border-radius:6px}
.ft{text-align:center;margin-top:18px}.bar{max-width:760px;margin:10px auto;text-align:right}button{padding:8px 16px;font-size:14px}
@media print{body{background:#fff}.bar{display:none}.pg{margin:0;max-width:none;padding:14mm;page-break-after:always;box-shadow:none}}</style>
<div class="bar"><button onclick="print()">Print / Save as PDF</button></div>${pages || '<p style="padding:20px">No invoices.</p>'}`;
}

function fail(e) {
  if (e && e.err) return J({ error: e.err, ...(e.extra || {}) }, e.status || 400);
  if (e && e.data) {
    const d = e.data;
    const msg = String(d.message || '');
    if (d.code === '23505' && /mobile/.test(msg + (d.details || ''))) return J({ error: 'duplicate_mobile' }, 409);
    if (d.code === '23514' && /mobile/.test(msg)) return J({ error: 'invalid_mobile' }, 400);
    if (d.code === 'P0001' && /^[a-z_]+$/.test(msg)) return J({ error: msg }, 400);
  }
  console.log('server error', JSON.stringify(e && (e.data || String(e))));
  return J({ error: 'server_error' }, 500);
}

const ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#08323a"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#g)"/><rect x="3" y="3" width="94" height="94" rx="19" fill="none" stroke="#e8c36a" stroke-width="2.5" opacity=".8"/><path d="M14 54a36 36 0 0 1 72 0z" fill="#e8c36a"/><path d="M50 54v22a6 6 0 0 0 12 0" stroke="#e8c36a" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
const MANIFEST = { name: 'Kudai', short_name: 'Kudai', start_url: '/', display: 'standalone',
  background_color: '#f2f5f8', theme_color: '#08323a', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }] };

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    const p = u.pathname;
    try {
      if (req.method === 'GET' && p === '/') return new Response(HTML, { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-cache' } });
      if (env.CUSTOMER_APP === '1' && req.method === 'GET' && (p === '/c' || p.startsWith('/c/'))) return new Response(CHTML, { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-cache' } });
      if (p === '/wa/webhook') return await waWebhook(req, cfg(env), env);
      if (p === '/privacy') return new Response(PRIVACY('Bharani Innovations'), { headers: { 'content-type': 'text/html;charset=utf-8' } });
      if (p === '/manifest.json') return new Response(JSON.stringify(MANIFEST), { headers: { 'content-type': 'application/manifest+json' } });
      if (p === '/icon.svg') return new Response(ICON, { headers: { 'content-type': 'image/svg+xml' } });
      if (p.startsWith('/api/')) return await api(req, cfg(env), u, p);
      return new Response('Not found', { status: 404 });
    } catch (e) { return fail(e); }
  },
  async scheduled(ev, env, ctx) { ctx.waitUntil(dailyJob(cfg(env), false).catch((e) => console.log('cron', JSON.stringify(e && (e.data || String(e)))))); },
};
