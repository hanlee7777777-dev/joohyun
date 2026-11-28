/* 제이주현 공통 기능 — 모든 페이지(한국어+외국어 84개)가 이 파일 하나를 불러옵니다 */
/* 포트폴리오 바 숨김 */
(function(){var h=document.documentElement,last=window.scrollY||0,tk=false;
function ok(){return window.matchMedia('(orientation: portrait) and (max-width: 1023px)').matches;}
function run(){tk=false;var y=window.scrollY||0;if(!ok()){h.classList.remove('barsAutoHideP');last=y;return;}
if(y<=40)h.classList.remove('barsAutoHideP');else if(y>last+4)h.classList.add('barsAutoHideP');else if(y<last-4)h.classList.remove('barsAutoHideP');
var d=document.scrollingElement||h;if(y+window.innerHeight>=d.scrollHeight-20)h.classList.remove('barsAutoHideP');last=y;}
window.addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(run);}},{passive:true});
window.addEventListener('resize',function(){h.classList.remove('barsAutoHideP');last=window.scrollY||0;});})();
/* OG 이미지 맞춤 */
(function(){function fit(){document.querySelectorAll('.jhOgWrap').forEach(function(w){var t=w.querySelector('.jhOgTxt');if(!t||!t.offsetHeight)return;var k=1;t.style.setProperty('--ogk',1);var H=w.offsetHeight*0.9;function ch(){var c=t.children;if(!c.length)return 0;return c[c.length-1].getBoundingClientRect().bottom-c[0].getBoundingClientRect().top;}while(ch()>H&&k>0.7){k-=0.04;t.style.setProperty('--ogk',k);}});}
function later(){setTimeout(fit,60);setTimeout(fit,400);}
new MutationObserver(later).observe(document.documentElement,{attributes:true,attributeFilter:['data-jhlang']});
window.addEventListener('resize',later);window.addEventListener('load',later);later();})();
/* 맨위로 버튼 */
(function(){var b=document.querySelector('.jhToTop'),t=false;function u(){t=false;b.classList.toggle('show',(window.scrollY||0)>300);}window.addEventListener('scroll',function(){if(!t){t=true;requestAnimationFrame(u);}},{passive:true});u();})();
/* 새로고침 시 화면·위치 유지 */
(function(){var K='jhScroll:'+location.pathname;
function curSub(){var a=document.querySelectorAll('[id^="subPage"]');for(var i=0;i<a.length;i++){if(a[i].style.display==='block')return a[i];}return null;}
function save(){try{var s=curSub(),f=[];if(s){var dt=s.querySelectorAll('details');for(var i=0;i<dt.length;i++)if(dt[i].open)f.push(i);}sessionStorage.setItem(K,JSON.stringify({y:window.scrollY||0,sub:s?s.id:'',open:f,t:Date.now()}));}catch(e){}}
window.addEventListener('pagehide',save);window.addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')save();});
var nav=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};
if(nav.type!=='reload')return;
var d;try{d=JSON.parse(sessionStorage.getItem(K)||'null');}catch(e){}
if(!d)return;
function reopen(){if(!d.sub)return;var s=document.getElementById(d.sub);if(!s)return;
if(s.style.display!=='block'){var a=document.querySelectorAll('[id^="subPage"]');for(var i=0;i<a.length;i++){if(a[i]!==s&&a[i].style.display==='block'){a[i].style.display='none';a[i].setAttribute('aria-hidden','true');}}
var fn=window['openNotice'+d.sub.replace('subPage','')];if(typeof fn==='function'){try{fn();}catch(e){}}
if(s.style.display!=='block'){s.style.display='block';s.setAttribute('aria-hidden','false');document.body.classList.add('subOpen');}}
var dt=s.querySelectorAll('details');(d.open||[]).forEach(function(i){if(dt[i])dt[i].open=true;});}
reopen();window.addEventListener('load',function(){setTimeout(reopen,30);});
if(!d.y)return;
var y=d.y,done=false,n=0;
function go(){if(done)return;window.scrollTo(0,y);if(Math.abs((window.scrollY||0)-y)<4&&n>3)done=true;}
var iv=setInterval(function(){n++;go();if(n>25)clearInterval(iv);},120);
window.addEventListener('load',function(){setTimeout(go,50);setTimeout(go,400);});
['wheel','touchstart','keydown'].forEach(function(ev){window.addEventListener(ev,function(){done=true;clearInterval(iv);},{passive:true,once:true});});
})();

/* 아이폰에서도 누르는 동안 확대(:active)가 작동하도록 */
/* jhActiveTouch */document.addEventListener("touchstart",function(){},{passive:true});
