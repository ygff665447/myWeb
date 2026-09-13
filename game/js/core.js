(function(){
  'use strict';
  var KEY='lt_v1';
  var S={done:[],code:''};
  try{
    var raw=localStorage.getItem(KEY);
    if(raw){var o=JSON.parse(raw);S.done=o.done||[];S.code=o.code||'';}
  }catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({done:S.done,code:S.code}))}catch(e){}}
  function has(k){return S.done.indexOf(k)>-1}
  function mark(k){if(!has(k)){S.done.push(k);save()}}

  var AC=null;
  function initAudio(){
    if(AC) return;
    try{
      AC=new (window.AudioContext||window.webkitAudioContext)();
      var o=AC.createOscillator(),g=AC.createGain();
      o.type='sine';o.frequency.value=43;g.gain.value=0.028;
      o.connect(g);g.connect(AC.destination);o.start();
    }catch(e){AC=null}
  }
  function blip(freq,dur,type,vol){
    if(!AC) return;
    try{
      var o=AC.createOscillator(),g=AC.createGain();
      o.type=type||'square';o.frequency.value=freq;
      g.gain.setValueAtTime(vol||.06,AC.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+(dur||.12));
      o.connect(g);g.connect(AC.destination);
      o.start();o.stop(AC.currentTime+(dur||.12));
    }catch(e){}
  }
  document.addEventListener('pointerdown',initAudio,{once:true});

  function norm(s){
    return String(s==null?'':s).trim().toUpperCase()
      .replace(/[\s\u3000]+/g,'')
      .replace(/[：:，,。.、\-_]/g,'')
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0xFEE0)});
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  function gate(root,answer,onPass,failMsg,nextKey){
    if(!root) return;
    var input=root.querySelector('#gateInput');
    var btn=root.querySelector('#gateBtn');
    var hint=root.querySelector('#gateHint');
    function go(){
      if(norm(input.value)===norm(answer)){
        input.disabled=true;btn.disabled=true;hint.textContent='';
        blip(540,.18,'sine',.07);
        if(nextKey) mark(nextKey);
        onPass();
      }else{
        hint.textContent=failMsg||'不对。';
        blip(85,.24,'square',.075);
        input.value='';input.focus();
        root.classList.add('shake');
        setTimeout(function(){root.classList.remove('shake')},260);
      }
    }
    btn.addEventListener('click',go);
    input.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
  }

  function typewriter(el,lines,after){
    var i=0;
    (function tick(){
      if(i>=lines.length){if(after)after();return}
      el.textContent+=lines[i++]+'\n';
      blip(1200,.03,'sine',.02);
      setTimeout(tick,480);
    })();
  }

  function reset(){
    if(confirm('清除全部进度？')){
      try{localStorage.removeItem(KEY)}catch(e){}
      location.href='index.html';
    }
  }
  document.addEventListener('DOMContentLoaded',function(){
    var r=document.getElementById('reset');
    if(r) r.addEventListener('click',reset);
    initAudio();
  });

  window.LT={has:has,mark:mark,save:save,norm:norm,esc:esc,gate:gate,blip:blip,initAudio:initAudio,typewriter:typewriter,reset:reset,S:S};
})();