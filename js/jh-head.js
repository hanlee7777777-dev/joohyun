/* 제이주현 공통(헤드) — 새로고침 위치 유지 */
(function(){try{var n=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0])||{};if(n.type!=='reload')return;var d=JSON.parse(sessionStorage.getItem('jhScroll:'+location.pathname)||'null');if(!d||!d.y)return;var Y=d.y,stop=false,t0=Date.now();
var st=document.createElement('style');st.id='jhKSHide';st.textContent='html{visibility:hidden!important}';document.head.appendChild(st);
function show(){var e=document.getElementById('jhKSHide');if(e)e.remove();}
var oTo=window.scrollTo.bind(window),oS=window.scroll.bind(window);
function topCall(a){var t=(a[0]&&typeof a[0]==='object')?a[0].top:a[1];return !stop&&(Date.now()-t0<4000)&&(t===0||t===undefined&&a[0]&&a[0].top===undefined);}
window.scrollTo=function(){if(topCall(arguments))return;return oTo.apply(null,arguments);};
window.scroll=function(){if(topCall(arguments))return;return oS.apply(null,arguments);};
function go(){if(!stop)oTo({top:Y,left:0,behavior:'instant'});}
['wheel','touchstart','keydown'].forEach(function(ev){window.addEventListener(ev,function(){stop=true;show();},{passive:true,once:true});});
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){go();requestAnimationFrame(function(){go();show();});},0);});
window.addEventListener('load',function(){go();setTimeout(go,300);});
var c=0;(function tick(){go();if(++c<90)requestAnimationFrame(tick);})();
setTimeout(show,1200);
}catch(e){}})();
