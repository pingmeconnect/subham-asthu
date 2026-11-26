(function(){
var s=document.getElementById('stage'),v=document.getElementById('vp');
function scale(){var k=Math.max(window.innerWidth,320)/1536;s.style.transform='scale('+k+')';v.style.height=(1024*k)+'px';}
function fitText(){
  var els=s.querySelectorAll('.t[data-w]');
  for(var pass=0;pass<2;pass++){
    for(var i=0;i<els.length;i++){
      var e=els[i],w=parseFloat(e.getAttribute('data-w')),cur=e.offsetWidth;
      if(!cur) continue;
      var fs=parseFloat(e.style.fontSize);
      e.style.fontSize=(fs*w/cur).toFixed(2)+'px';
    }
  }
}
scale();window.addEventListener('resize',scale);
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fitText);}
window.addEventListener('load',fitText);
})();
