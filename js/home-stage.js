(function(){
  var box=document.getElementById('sa-hn'),st=document.getElementById('sa-hn-stage');
  if(!box||!st)return;
  var H=1068;
  function scale(){var w=document.documentElement.clientWidth||window.innerWidth;var k=w/1536;st.style.transform='scale('+k+')';box.style.height=(H*k)+'px';}
  function fit(){
    var els=st.querySelectorAll('.t[data-w]');
    for(var pass=0;pass<2;pass++){for(var i=0;i<els.length;i++){var e=els[i],w=parseFloat(e.getAttribute('data-w')),cur=e.offsetWidth;if(!cur)continue;var fs=parseFloat(e.style.fontSize);e.style.fontSize=(fs*w/cur).toFixed(2)+'px';}}
  }
  function refresh(){scale();fit();}
  scale();
  window.addEventListener('resize',scale);
  window.addEventListener('load',refresh);
  window.addEventListener('hashchange',function(){setTimeout(refresh,0);});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refresh);
  // fit again whenever the home page becomes visible
  var sec=box.closest('.page');
  if(sec&&window.MutationObserver)new MutationObserver(function(){if(!sec.hidden)refresh();}).observe(sec,{attributes:true,attributeFilter:['hidden']});
  // stage prev/next arrows are decorative (single banner)
})();
