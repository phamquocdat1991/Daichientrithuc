'use strict';
// Two-character sprite pilot. Pose frames are visual only; game rules remain unchanged.
const combatAtlasURL='assets/combat/wukong-satang-poses.png';
let combatAtlasReady=false;
const combatAtlasImage=new Image();
combatAtlasImage.onload=()=>{combatAtlasReady=true;if(location.hash==='#play'&&!fxLocked)mountCombatActors()};
combatAtlasImage.src=combatAtlasURL;
function combatPose(actor,pose){if(!actor?.classList.contains('combat-actor'))return;const p=reducedFX()?'idle':pose;actor.dataset.pose=p;const col={idle:0,windup:0,attack:1,hurt:2,down:3}[p]??0,row=Number(actor.dataset.row);const cuts=row?[0,360,832,1176,1536]:[0,360,816,1176,1536];const x=cuts[col],width=cuts[col+1]-x,sprite=actor.querySelector('.combat-sprite');if(!sprite)return;sprite.style.width=(width/384*100)+'%';sprite.style.left=(50-width/384*50)+'%';sprite.style.backgroundSize=(1536/width*100)+'% 200%';sprite.style.backgroundPosition=(x/(1536-width)*100)+'% '+(row?100:0)+'%';}
function mountCombatActors(){if(!combatAtlasReady)return;document.querySelectorAll('.fighter').forEach((fighter,i)=>{const c=game?.teams[i]?.character;if(!['char0','char1'].includes(c?.id)||fighter.querySelector('.combat-actor'))return;const img=fighter.querySelector('img');if(!img)return;const actor=document.createElement('span');actor.className='combat-actor';actor.dataset.row=c.id==='char0'?'0':'1';actor.dataset.side=String(i);actor.dataset.pose=game.teams[i].hp<=0&&!reducedFX()?'down':'idle';actor.setAttribute('role','img');actor.setAttribute('aria-label',c.name);const sprite=document.createElement('span');sprite.className='combat-sprite';sprite.setAttribute('aria-hidden','true');img.replaceWith(actor);actor.append(img,sprite);img.alt='';img.setAttribute('aria-hidden','true');combatPose(actor,actor.dataset.pose);});}
const poseRender=renderGame;renderGame=function(){poseRender();mountCombatActors()};
const poseClear=clearBattleFX;clearBattleFX=function(){poseClear();document.querySelectorAll('.combat-actor').forEach(actor=>{actor.style.zIndex='';combatPose(actor,game?.teams[Number(actor.dataset.side)]?.hp<=0?'down':'idle')})};
const combatVisual=f=>f?.querySelector('.combat-actor')||f?.querySelector('img');
impactFX=function({attacker,target,damage,critical=false,correct=true,before}){
 const arena=$('.arena'),stage=$('.fighters'),fighters=[...document.querySelectorAll('.fighter')];if(!arena||!stage)return;
 const source=combatVisual(fighters[attacker]),victim=combatVisual(fighters[target]),simple=reducedFX();
 const layer=document.createElement('div');layer.className='fx-layer melee-layer';layer.dataset.target=String(target);layer.setAttribute('aria-hidden','true');stage.append(layer);
 const sr=stage.getBoundingClientRect(),a=source?.getBoundingClientRect(),b=victim?.getBoundingClientRect(),direction=attacker===0?1:-1;
 const travel=a&&b?(b.left+b.width/2)-(a.left+a.width/2)-direction*Math.min(a.width*.6,120):0;
 const hpBars=[...document.querySelectorAll('.hpbar>div')];hpBars.forEach((bar,i)=>{bar.style.transition='none';bar.style.width=before[i]+'%'});
 fxLocked=true;document.querySelectorAll('.battlemessage button,.buzz,.arena button[onclick^="useSkill"]').forEach(button=>{if(!button.disabled){button.disabled=true;button.dataset.fxDisabled='1'}});
 if(correct&&!simple){combatPose(source,'windup');if(source)source.style.zIndex='12';motion(source,[{transform:'translateX(0)'},{transform:`translateX(${-direction*14}px) rotate(${-direction*5}deg)`,offset:.18},{transform:`translateX(${travel}px)`,offset:.42},{transform:`translateX(${travel}px)`,offset:.62},{transform:'translateX(0)',offset:1}],{duration:1250,fill:'forwards',easing:'ease-in-out'});fxLater(()=>{combatPose(source,'attack');BattleAudio.play('swoosh')},450);}
 const impactTime=simple?0:correct?560:80;
 fxLater(()=>{if(!layer.isConnected)return;hpBars.forEach((bar,i)=>{bar.style.transition=simple?'none':'width .45s ease-out';bar.style.width=game.teams[i].hp+'%'});combatPose(victim,'hurt');
 const hit=document.createElement('div');hit.className='fx-impact'+(critical?' critical':'');hit.style.left=(b?b.left+b.width/2-sr.left:sr.width*(target===0?.13:.87))+'px';hit.style.top='20%';hit.innerHTML=`<span class="impact-ring"></span><strong>${critical?'CHÍ MẠNG!':correct?'TRÚNG ĐÒN!':'MẤT MÁU'}<b>−${damage} HP</b></strong>`;layer.append(hit);
 if(!simple){motion(victim,[{transform:'translateX(0)'},{transform:`translateX(${(target===0?-1:1)*(critical?38:22)}px) rotate(${target===0?-9:9}deg)`,offset:.22,filter:'brightness(1.7)'},{transform:`translateX(${(target===0?-1:1)*12}px)`,offset:.6,filter:'brightness(1)'},{transform:'translateX(0)'}],{duration:620,fill:'forwards',easing:'ease-out'});for(let i=0;i<10;i++){const spark=document.createElement('i');spark.className='fx-spark';spark.style.setProperty('--x',Math.cos(i*Math.PI/5)*90+'px');spark.style.setProperty('--y',Math.sin(i*Math.PI/5)*75+'px');hit.append(spark)}if(critical)motion(stage,[{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:180});}
 BattleAudio.play(critical?'critical':correct?'hit':'wrong');
 },impactTime);
 fxLater(()=>{combatPose(source,game.teams[attacker].hp<=0?'down':'idle');combatPose(victim,game.teams[target].hp<=0?'down':'idle');if(source)source.style.zIndex=''},simple?400:1100);
 fxLater(()=>clearBattleFX(),simple?600:1500);
};
