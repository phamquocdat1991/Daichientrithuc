'use strict';
// Presentation only: HP, scoring, timers and stored match rules belong to app/pro.js.
(() => {
  const backgrounds = ['', 'ninja-duel', 'fire-temple', 'ice-world', 'space-battle', 'comic-vs', 'school-arena'];
  const reduced = () => state.preferences?.reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let ctx, master, musicTimer, beat = 0, lastTick = '', pendingVictory = false;
  const voices = new Set(), effects = new Set();
  const volume = () => Math.max(0, Math.min(1, Number(state.preferences?.volume ?? .5)));
  function enabled() { return state.sound && volume() > 0 && !document.hidden; }
  function unlock() {
    if (!enabled()) return;
    try {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.connect(ctx.destination); }
      master.gain.value = volume() * .48;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    } catch { /* Gameplay remains available when audio is unsupported. */ }
  }
  function tone(freq, duration = .18, delay = 0, type = 'sine', gain = .14, end = freq) {
    if (!enabled() || !ctx || ctx.state !== 'running') return;
    master.gain.value = volume() * .48;
    const start = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, start); o.frequency.exponentialRampToValueAtTime(Math.max(20, end), start + duration);
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(gain, start + .012); g.gain.exponentialRampToValueAtTime(.0001, start + duration);
    o.connect(g); g.connect(master); voices.add(o); o.onended = () => { voices.delete(o); o.disconnect(); g.disconnect(); };
    o.start(start); o.stop(start + duration + .025);
  }
  function noise(duration = .18, gain = .16) {
    if (!enabled() || !ctx || ctx.state !== 'running') return;
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate), d = b.getChannelData(0);
    // Deterministic texture; never consume the random stream used by critical hits.
    let seed = 23; for (let i = 0; i < d.length; i++) { seed = (seed * 16807) % 2147483647; d[i] = (seed / 1073741823.5 - 1) * (1 - i / d.length); }
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = 1700; g.gain.value = gain;
    s.connect(f); f.connect(g); g.connect(master); voices.add(s); s.onended = () => { voices.delete(s); s.disconnect(); f.disconnect(); g.disconnect(); }; s.start();
  }
  function cue(name) {
    unlock();
    if (name === 'buzz') { tone(300,.16,0,'sawtooth',.1,920); tone(920,.24,.1,'sine',.18); }
    else if (name === 'correct') { noise(.2,.13); [523,659,784].forEach((f,i)=>tone(f,.3,i*.075,'triangle',.22)); tone(130,.25,0,'sine',.35,45); }
    else if (name === 'critical' || name === 'skill') { noise(.42,.25); tone(180,.45,0,'sine',.5,35); [392,587,784,1175].forEach((f,i)=>tone(f,.4,i*.075,'triangle',.21)); }
    else if (name === 'wrong' || name === 'timeout') { noise(.12,.08); tone(260,.3,0,'triangle',.23,120); tone(175,.35,.16,'sine',.25,70); }
    else if (name === 'tick') tone(950,.065,0,'sine',.12);
    else if (name === 'start') [262,392,523,784].forEach((f,i)=>tone(f,.38,i*.11,'triangle',.22));
    else if (name === 'victory') [523,523,523,659,784,1047].forEach((f,i)=>{tone(f,.55,i*.18,'triangle',.25);tone(f/2,.65,i*.18,'sine',.2)});
    else if (name === 'next') {tone(440,.12);tone(660,.18,.07);}
  }
  function hush() { for (const voice of voices) { try { voice.stop(); } catch {} } voices.clear(); }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }
  function syncMusic() {
    const playing = document.body.classList.contains('playing') && game && !game.paused && game.status !== 'done' && game.phase !== 'tie';
    if (!playing || !enabled()) { stopMusic(); hush(); return; }
    if (!ctx || ctx.state !== 'running' || musicTimer) return;
    musicTimer = setInterval(() => {
      if (!enabled() || !game || game.paused || !document.body.classList.contains('playing')) { stopMusic(); hush(); return; }
      const bass = [130.81,130.81,155.56,116.54,103.83,103.83,116.54,116.54];
      const f = bass[Math.floor(beat / 2) % bass.length];
      tone(f,.35,0,'sine',.075); if(beat%2===0)tone(f*4,.22,.16,'triangle',.035);
      const key = game.index + ':' + game.remaining;
      if(game.phase==='answering' && game.remaining <= 5 && game.remaining > 0 && key !== lastTick) {lastTick=key;cue('tick');}
      const clock = document.getElementById('clock'); clock?.classList.toggle('fx-urgent',game.phase==='answering' && game.remaining<=5);
      beat++;
    }, 420);
  }
  function later(fn, ms) { const id = setTimeout(()=>{effects.delete(id);fn()},ms); effects.add(id); }
  function clearEffects() { for(const id of effects)clearTimeout(id);effects.clear();document.querySelectorAll('.fx-overlay,.fx-particles').forEach(e=>e.remove()); }
  function particles(host, celebration = false) {
    if(reduced())return;
    const el=document.createElement('div'); el.className='fx-particles'+(celebration?' fx-confetti':'');el.setAttribute('aria-hidden','true');
    for(let i=0;i<(celebration?44:18);i++){const p=document.createElement('i');p.style.cssText=`--x:${(i*37)%100}%;--dx:${((i*43)%180)-90}px;--delay:${(i%8)*.045}s;--turn:${i*47}deg;--color:${['#ffce56','#ff388f','#71e9ff','#fff'][i%4]}`;el.append(p)}
    host.append(el);later(()=>el.remove(),celebration?2600:1100);
  }
  function strike(from, to, damage, kind='correct', combo=0) {
    const arena=document.querySelector('.arena'), fighters=document.querySelectorAll('.fighter');if(!arena||!fighters[to])return;
    const victim=fighters[to], attacker=fighters[from];
    const number=document.createElement('span');number.className='fx-damage';number.textContent='−'+damage+' HP';number.setAttribute('aria-hidden','true');victim.append(number);later(()=>number.remove(),1400);
    if(!reduced()){
      victim.classList.add('fx-hit');if(from!==to)attacker.classList.add('fx-attack');
      particles(victim);if(kind==='critical'||kind==='skill')arena.classList.add('fx-impact');
      if(from!==to){const bolt=document.createElement('div');bolt.className='fx-bolt'+(from===1?' reverse':'');bolt.setAttribute('aria-hidden','true');document.querySelector('.fighters')?.append(bolt);later(()=>bolt.remove(),600)}
      later(()=>{victim.classList.remove('fx-hit');attacker.classList.remove('fx-attack');arena.classList.remove('fx-impact')},750);
    }
    const label=document.createElement('div');label.className='fx-overlay fx-callout '+kind;label.setAttribute('aria-hidden','true');
    label.textContent=kind==='critical'?'CHÍ MẠNG!':kind==='skill'?'BÙNG NỔ KỸ NĂNG!':kind==='timeout'?'HẾT GIỜ!':kind==='wrong'?'CHƯA CHÍNH XÁC':combo>=2?'COMBO ×'+combo:'CHÍNH XÁC!';arena.append(label);later(()=>label.remove(),1500);
  }
  function decorate() {
    const arena=document.querySelector('.arena');if(!arena)return;
    const theme=backgrounds[game.config.theme]||'';arena.dataset.theme=String(game.config.theme||0);
    if(theme)arena.style.setProperty('--arena-image',`url("assets/arenas/${theme}.jpg")`);
    const stage=document.querySelector('.fighters');stage?.setAttribute('aria-label','Đấu trường hai đội');
    document.querySelectorAll('.fighter').forEach((f,i)=>{f.dataset.team=String(i);f.classList.toggle('fx-active',game.phase==='answering'&&game.active===i);f.classList.toggle('fx-low',game.teams[i].hp<=25);});
    const soundButton=document.createElement('button');soundButton.className='small fx-sound';soundButton.type='button';soundButton.textContent=state.sound?'♫ Âm thanh: Bật':'♫ Âm thanh: Tắt';soundButton.setAttribute('aria-pressed',String(state.sound));soundButton.onclick=()=>{toggleSound();soundButton.textContent=state.sound?'♫ Âm thanh: Bật':'♫ Âm thanh: Tắt';soundButton.setAttribute('aria-pressed',String(state.sound));};document.querySelector('.teacherbar')?.append(soundButton);
    const clock=document.getElementById('clock');clock?.classList.toggle('fx-urgent',game.phase==='answering'&&game.remaining<=5);
    syncMusic();
  }
  // Replace the original single beep without changing when gameplay calls it.
  sound = freq => cue(freq===650?'buzz':freq===850?'correct':'wrong');
  const render=renderGame;renderGame=function(){clearEffects();render();decorate();};
  const submitAnswer=answer;answer=function(i){
    if(!game||game.paused||game.phase!=='answering')return;
    const active=game.active;submitAnswer(i);const log=game.log.at(-1);if(!log)return;
    const kind=i===-1?'timeout':!log.correct?'wrong':log.critical?'critical':'correct';
    if(log.critical)cue('critical');
    strike(active,log.correct?1-active:active,log.damage,kind,game.teams[active].combo);
  };
  const skill=useSkill;useSkill=function(i){const valid=game&&!game.paused&&game.phase==='waiting'&&game.teams[i].energy>=3;skill(i);if(valid){cue('skill');strike(i,1-i,15,'skill')}};
  const start=startMatch;startMatch=function(){const before=game?.id;unlock();start();if(game?.id!==before)cue('start')};
  const next=nextQuestion;nextQuestion=function(){const before=game?.index;next();if(game?.index!==before)cue('next')};
  const completed=complete;complete=function(){pendingVictory=true;completed()};
  const showResult=result;result=function(m){clearEffects();stopMusic();hush();showResult(m);if(pendingVictory){pendingVictory=false;cue('victory');const host=document.querySelector('.result');if(host)particles(host,true)}};
  const toggle=toggleSound;toggleSound=function(){toggle();if(state.sound){unlock();cue('next');syncMusic()}else{stopMusic();hush()}};
  function previews(){document.querySelectorAll('.theme').forEach((card,i)=>{if(backgrounds[i])card.style.backgroundImage=`linear-gradient(0deg,#070915d9,transparent 85%),url("assets/arenas/${backgrounds[i]}.jpg")`;});}
  const setup=setupMatch;setupMatch=function(...args){setup(...args);previews()};
  // Existing route listeners still run first; cleanup occurs after the new page renders.
  window.addEventListener('hashchange',()=>{if(location.hash==='#result'){stopMusic();return;}clearEffects();syncMusic();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMusic();hush()}else syncMusic()});
  document.addEventListener('pointerdown',()=>{unlock();syncMusic()},{passive:true});
  document.addEventListener('keydown',()=>{unlock();syncMusic()});
  window.addEventListener('pagehide',()=>{clearEffects();stopMusic();hush()});
  decorate();
})();
