'use strict';
// =============================================================
//  SUPER MAMÃE WORLD  —  game.js
// =============================================================

const CW = 768, CH = 480;   // canvas size
const TS  = 32;              // tile size px
const PS  = 2;               // sprite pixel scale

// Ground sits at tile-row GY. In pixels: GY*TS must be < CH.
// CH=480, TS=32 → 15 rows (0-14). Ground at row 12 = 384px from top.
// That leaves rows 12-14 as ground (3 tiles = 96px visible ground).
const GY  = 12;

const GRAV = 0.52;
const VMAX = 13;
const VAND = 2.5;
const VCOR = 4.2;
const VPULO = -12;

// ─── Paleta (azuis mais vibrantes) ───────────────────────────
const COR = {
  _:null,
  // pele mamãe
  pe:'#f5c8a8', ps:'#e8aa80',
  // cabelo mamãe (escuro)
  hd:'#2a1205', hm:'#4a200a',
  // roupa mamãe (azul brilhante)
  az:'#2277ff', ab:'#1155cc', ad:'#0a3399',
  // detalhes
  ol:'#150500', bo:'#ee3355', br:'#ffffff',
  // estrela
  am:'#ffee00', al:'#fff480',
  // chão / plataforma / tijolo  (azuis brilhantes)
  ga:'#2266bb', gb:'#44aaff', gc:'#0d3d88',
  pl:'#1a55dd', pb:'#0d3399',
  ti:'#1a44cc', tb:'#0a2888',
  // bloco ?
  bq:'#ffcc00', bl:'#ffee88', bd:'#997700',
  // power-up (arroz+feijão)
  ar:'#f2eed8', as2:'#ddd0a0', fe:'#7a3e14', fd:'#552a0a', fm:'#cc2200',
  // castelo
  c1:'#0a1a55', c2:'#1a44cc',
  // irmã sprite
  si:'#f8dcc0', sd:'#e8bc98',
  ch:'#5a2805', cm:'#7a3a10', cl:'#9a5220',
  ri:'#cc3333', rm:'#aa2222', rb:'#ee5544',
  sa:'#7a3a10',
};

// ─── Desenhar sprite ─────────────────────────────────────────
function spr(ctx, grid, pal, x, y, flip) {
  const R=grid.length, C=grid[0].length;
  for (let r=0;r<R;r++) for (let c=0;c<C;c++) {
    const cor=pal[grid[r][c]]; if(!cor) continue;
    ctx.fillStyle=cor;
    const px = flip ? x+(C-1-c)*PS : x+c*PS;
    ctx.fillRect(px, y+r*PS, PS, PS);
  }
}
const S = (ctx,g,x,y,f) => spr(ctx,g,COR,x,y,f);

// ─── SPRITES MAMÃE (16×16) ───────────────────────────────────
const MAE_P = [  // parada
  ['_','_','hd','hd','hd','hd','hd','hd','hd','hd','_','_','_','_','_','_'],
  ['_','hd','hm','hd','hd','hd','hd','hd','hm','hd','hd','_','_','_','_','_'],
  ['_','hd','pe','pe','pe','pe','pe','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','ol','pe','pe','ol','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','pe','pe','pe','pe','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','ps','bo','bo','ps','pe','pe','hd','_','_','_','_','_','_'],
  ['_','_','hd','pe','pe','pe','pe','hd','_','_','_','_','_','_','_','_'],
  ['_','az','az','az','az','az','az','az','az','_','_','_','_','_','_','_'],
  ['az','ab','az','az','br','az','az','ab','az','_','_','_','_','_','_','_'],
  ['az','az','az','az','br','az','az','az','az','_','_','_','_','_','_','_'],
  ['ab','az','az','az','az','az','az','az','ab','_','_','_','_','_','_','_'],
  ['_','_','az','ab','_','_','ab','az','_','_','_','_','_','_','_','_'],
  ['_','_','az','az','_','_','az','az','_','_','_','_','_','_','_','_'],
  ['_','_','az','az','_','_','az','az','_','_','_','_','_','_','_','_'],
  ['_','_','ps','ps','_','_','ps','ps','_','_','_','_','_','_','_','_'],
  ['_','_','ps','ps','_','_','ps','ps','_','_','_','_','_','_','_','_'],
];
const MAE_R = [  // correndo
  ['_','_','hd','hd','hd','hd','hd','hd','hd','hd','_','_','_','_','_','_'],
  ['_','hd','hm','hd','hd','hd','hd','hd','hm','hd','hd','_','_','_','_','_'],
  ['_','hd','pe','pe','pe','pe','pe','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','ol','pe','pe','ol','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','pe','pe','pe','pe','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','ps','bo','bo','ps','pe','pe','hd','_','_','_','_','_','_'],
  ['_','_','hd','pe','pe','pe','pe','hd','_','_','_','_','_','_','_','_'],
  ['_','az','az','az','az','az','az','az','az','_','_','_','_','_','_','_'],
  ['az','ab','az','az','br','az','az','ab','az','_','_','_','_','_','_','_'],
  ['az','az','az','az','br','az','az','az','az','_','_','_','_','_','_','_'],
  ['ab','az','az','az','az','az','az','az','ab','_','_','_','_','_','_','_'],
  ['_','_','ab','az','_','_','az','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','az','az','az','_','az','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','az','az','az','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','ps','ps','ps','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','ps','_','_','_','_','_','_','_','_','_','_'],
];
const MAE_J = [  // pulando
  ['_','_','hd','hd','hd','hd','hd','hd','hd','hd','_','_','_','_','_','_'],
  ['_','hd','hm','hd','hd','hd','hd','hd','hm','hd','hd','_','_','_','_','_'],
  ['_','hd','pe','pe','pe','pe','pe','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','ol','pe','pe','ol','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','pe','pe','pe','pe','pe','pe','hd','_','_','_','_','_','_'],
  ['_','hd','pe','ps','bo','br','ps','pe','pe','hd','_','_','_','_','_','_'],
  ['_','_','hd','pe','pe','pe','pe','hd','_','_','_','_','_','_','_','_'],
  ['az','az','az','az','az','az','az','az','az','_','_','_','_','_','_','_'],
  ['az','ab','az','br','az','az','az','ab','az','_','_','_','_','_','_','_'],
  ['az','az','az','br','az','az','az','az','az','_','_','_','_','_','_','_'],
  ['ab','az','az','az','az','az','az','az','ab','_','_','_','_','_','_','_'],
  ['_','az','ab','_','_','_','ab','az','_','_','_','_','_','_','_','_'],
  ['_','az','az','_','_','_','az','az','_','_','_','_','_','_','_','_'],
  ['_','ps','az','_','_','_','az','ps','_','_','_','_','_','_','_','_'],
  ['_','_','ps','_','_','_','ps','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
];
const MAE_E = [  // estrela
  ['am','am','hd','hd','hd','hd','hd','hd','hd','hd','am','_','_','_','_','_'],
  ['am','hd','hm','hd','hd','hd','hd','hd','hm','hd','hd','am','_','_','_','_'],
  ['am','hd','al','al','al','al','al','al','al','hd','am','_','_','_','_','_'],
  ['am','hd','al','ol','al','al','ol','al','al','hd','am','_','_','_','_','_'],
  ['am','hd','al','al','al','al','al','al','al','hd','am','_','_','_','_','_'],
  ['am','hd','al','al','bo','br','bo','al','al','hd','am','_','_','_','_','_'],
  ['_','am','hd','al','al','al','al','hd','am','_','_','_','_','_','_','_'],
  ['am','am','am','am','am','am','am','am','am','am','_','_','_','_','_','_'],
  ['am','am','am','am','am','am','am','am','am','am','_','_','_','_','_','_'],
  ['am','am','am','am','am','am','am','am','am','am','_','_','_','_','_','_'],
  ['am','am','am','am','am','am','am','am','am','am','_','_','_','_','_','_'],
  ['_','am','am','_','_','am','am','_','_','_','_','_','_','_','_','_'],
  ['_','am','am','_','_','am','am','_','_','_','_','_','_','_','_','_'],
  ['_','am','am','_','_','am','am','_','_','_','_','_','_','_','_','_'],
  ['_','am','am','_','_','am','am','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
];

// ─── SPRITE IRMÃ (koopa) ─────────────────────────────────────
// Baseado na foto: cabelo castanho ondulado, vestido vermelho, pele clara, rosinha
const IRMA_P = [  // parada
  ['_','_','ch','ch','ch','ch','ch','ch','ch','_','_','_','_','_','_','_'],
  ['_','ch','cm','ch','ch','ch','ch','ch','cm','ch','_','_','_','_','_','_'],
  ['_','ch','si','si','si','si','si','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','ol','si','si','ol','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','si','si','si','si','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','sd','bo','bo','sd','si','si','ch','_','_','_','_','_','_'],
  ['_','_','ch','si','si','si','si','ch','_','_','_','_','_','_','_','_'],
  // Cabelo caindo nas laterais + pescoço
  ['_','ch','_','si','si','si','si','_','ch','_','_','_','_','_','_','_'],
  ['ch','cl','_','_','_','_','_','_','cl','ch','_','_','_','_','_','_'],
  // Vestido vermelho
  ['_','ri','ri','ri','ri','ri','ri','ri','ri','_','_','_','_','_','_','_'],
  ['ri','rm','ri','ri','br','ri','ri','rm','ri','_','_','_','_','_','_','_'],
  ['ri','ri','ri','ri','ri','ri','ri','ri','ri','_','_','_','_','_','_','_'],
  ['rm','ri','ri','ri','ri','ri','ri','ri','rm','_','_','_','_','_','_','_'],
  ['_','_','ri','rm','_','_','rm','ri','_','_','_','_','_','_','_','_'],
  ['_','_','sa','sa','_','_','sa','sa','_','_','_','_','_','_','_','_'],
  ['_','_','sa','sa','_','_','sa','sa','_','_','_','_','_','_','_','_'],
];
const IRMA_R = [  // andando
  ['_','_','ch','ch','ch','ch','ch','ch','ch','_','_','_','_','_','_','_'],
  ['_','ch','cm','ch','ch','ch','ch','ch','cm','ch','_','_','_','_','_','_'],
  ['_','ch','si','si','si','si','si','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','ol','si','si','ol','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','si','si','si','si','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','sd','bo','bo','sd','si','si','ch','_','_','_','_','_','_'],
  ['_','_','ch','si','si','si','si','ch','_','_','_','_','_','_','_','_'],
  ['_','ch','_','si','si','si','si','_','ch','_','_','_','_','_','_','_'],
  ['ch','cl','_','_','_','_','_','_','cl','ch','_','_','_','_','_','_'],
  ['_','ri','ri','ri','ri','ri','ri','ri','ri','_','_','_','_','_','_','_'],
  ['ri','rm','ri','ri','br','ri','ri','rm','ri','_','_','_','_','_','_','_'],
  ['ri','ri','ri','ri','ri','ri','ri','ri','ri','_','_','_','_','_','_','_'],
  ['rm','ri','ri','ri','ri','ri','ri','ri','rm','_','_','_','_','_','_','_'],
  // pernas alternadas
  ['_','_','rm','ri','_','_','ri','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','sa','sa','sa','_','sa','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','sa','sa','_','_','_','_','_','_','_','_','_','_'],
];
const IRMA_C = [  // amassada (só cabeça com expressão surpresa)
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','ch','ch','ch','ch','ch','ch','ch','_','_','_','_','_','_','_'],
  ['_','ch','cm','ch','ch','ch','ch','ch','cm','ch','_','_','_','_','_','_'],
  ['_','ch','si','si','si','si','si','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','ol','si','si','ol','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','si','si','si','si','si','si','ch','_','_','_','_','_','_'],
  ['_','ch','si','sd','bo','sd','sd','si','si','ch','_','_','_','_','_','_'],
  ['_','_','ch','si','si','si','si','ch','_','_','_','_','_','_','_','_'],
  ['_','ch','_','si','si','si','si','_','ch','_','_','_','_','_','_','_'],
  ['ch','cl','_','_','_','_','_','_','cl','ch','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
];

// ─── POWER-UP: arroz e feijão ─────────────────────────────────
const PU_SPR = [
  ['_','_','ar','ar','ar','ar','ar','ar','ar','ar','ar','ar','_','_','_','_'],
  ['_','ar','as2','ar','ar','ar','ar','ar','ar','as2','ar','ar','_','_','_','_'],
  ['ar','ar','ar','fe','fe','fe','fe','fe','fe','ar','ar','ar','_','_','_','_'],
  ['ar','ar','fe','fd','fm','fe','fe','fm','fd','fe','ar','ar','_','_','_','_'],
  ['ar','ar','fe','fe','fe','fe','fe','fe','fe','fe','ar','ar','_','_','_','_'],
  ['ar','ar','ar','fe','fe','fe','fe','fe','ar','ar','ar','_','_','_','_','_'],
  ['_','ar','ar','ar','ar','ar','ar','ar','ar','ar','ar','_','_','_','_','_'],
  ['_','as2','as2','as2','as2','as2','as2','as2','as2','as2','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
  ['_','_','_','_','_','_','_','_','_','_','_','_','_','_','_','_'],
];

// ─── MOEDA (8×8 tile, escala 2) ──────────────────────────────
const MO_SPR = [
  ['_','az','az','az','az','_'],
  ['az','ab','ga','ga','ab','az'],
  ['az','ga','ad','ad','ga','az'],
  ['az','ga','ad','ad','ga','az'],
  ['az','ab','ga','ga','ab','az'],
  ['_','az','az','az','az','_'],
];

// ─── CONSTRUÇÃO DA FASE ───────────────────────────────────────
// GY=12 → chão começa em pixel 12*32=384. Canvas=480 → 96px de chão visível.
function construirFase() {
  const tiles=[], inimigos=[];

  function addT(t,x,y,extra={}) { tiles.push({t,x,y,w:1,h:1,...extra}); }
  function chao(x,y)    { addT('ch',x,y); }
  function plat(x,y)    { addT('pl',x,y); }
  function tijolo(x,y)  { addT('ti',x,y); }
  function blocoQ(x,y,pu){ addT('bq',x,y,{usado:false,pu}); }
  function inimigo(tx)  { inimigos.push({x:tx*TS,y:0,vx:-1.1,vy:0,noChao:false,vivo:true,amassado:false,tAm:0,dir:-1}); }

  // CHÃO — tile row GY, GY+1, GY+2
  // Gaps (buracos): tiles 24-26, 48-49, 70-72, 92-93
  const GAPS = new Set([24,25,26, 48,49, 70,71,72, 92,93]);
  for(let x=0;x<=105;x++){
    if(GAPS.has(x)) continue;
    chao(x,GY); chao(x,GY+1); chao(x,GY+2);
  }

  // PLATAFORMAS (acima do chão)
  //   [startX, tileY, width]
  [
    [5, GY-3, 3],[9, GY-5, 2],[14,GY-6,2],[18,GY-2,3],
    [30,GY-3,3],[35,GY-5,2],[40,GY-3,3],
    [52,GY-3,3],[57,GY-5,2],[61,GY-3,2],
    [75,GY-3,3],[80,GY-5,2],[85,GY-3,3],
    [95,GY-3,2],[99,GY-5,2],
  ].forEach(([x,y,w])=>{ for(let i=0;i<w;i++) plat(x+i,y); });

  // BLOCOS ?
  blocoQ(7, GY-6, false); blocoQ(15,GY-7,false);
  blocoQ(19,GY-6, true ); blocoQ(34,GY-7,false);
  blocoQ(56,GY-7, true ); blocoQ(78,GY-6,false);
  blocoQ(97,GY-7, true );

  // TIJOLOS
  [[8,GY-6],[16,GY-7],[20,GY-6],[35,GY-7],[57,GY-7],[79,GY-6],[98,GY-7]]
    .forEach(([x,y])=>tijolo(x,y));

  // INIMIGOS
  [12,21,38,55,66,82,91].forEach(x=>inimigo(x));

  // BANDEIRA + CASTELO
  tiles.push({t:'polo',x:102,y:GY-11,w:1,h:11});
  tiles.push({t:'bnd', x:102,y:GY-11,w:1,h:1});
  tiles.push({t:'cas', x:104,y:GY-3, w:5,h:4});

  return {tiles,inimigos};
}

// ─── ESTADO DO JOGO ──────────────────────────────────────────
function novoJogo(){
  const {tiles,inimigos}=construirFase();
  return {
    j:{
      x:3*TS, y:(GY-3)*TS,
      vx:0,vy:0,
      w:24,h:30,
      noChao:false,dir:1,
      frame:0,fTick:0,
      estrela:false,tEst:0,
      puAnt:false,
    },
    cam:0,tiles,inimigos,
    powerups:[],moedas:[],particulas:[],
    pontos:0,vidas:3,
    estado:'jogando',tMorte:0,tick:0,
  };
}

// ─── INPUT ───────────────────────────────────────────────────
const K={}, BT={};
document.addEventListener('keydown',e=>{K[e.code]=true;});
document.addEventListener('keyup',  e=>{K[e.code]=false;});
function btnPress(d){BT[d]=true; const el=document.getElementById('btn_'+d); if(el)el.classList.add('pressionado');}
function btnRelease(d){BT[d]=false; const el=document.getElementById('btn_'+d); if(el)el.classList.remove('pressionado');}
const iL=()=>K.ArrowLeft||K.KeyA||BT.esquerda;
const iR=()=>K.ArrowRight||K.KeyD||BT.direita;
const iJ=()=>K.ArrowUp||K.KeyW||K.Space||K.KeyZ||BT.pular||BT.cima;
const iC=()=>K.ShiftLeft||K.ShiftRight||K.KeyX||BT.correr;

// ─── COLISÃO (2 passos X então Y) ────────────────────────────
function solido(t){ return t.t==='ch'||t.t==='pl'||t.t==='ti'||t.t==='bq'||t.t==='cas'; }
function tpx(t)   { return {x:t.x*TS,y:t.y*TS,w:t.w*TS,h:t.h*TS}; }
function hit(ax,ay,aw,ah,bx,by,bw,bh){ return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by; }

function moveX(rx,ry,rw,rh,vx,tiles){
  rx+=vx;
  for(const t of tiles){
    if(!solido(t)) continue;
    const p=tpx(t);
    if(!hit(rx,ry,rw,rh,p.x,p.y,p.w,p.h)) continue;
    rx = vx>0 ? p.x-rw : p.x+p.w;
    vx=0;
  }
  return {rx,vx};
}
function moveY(rx,ry,rw,rh,vy,tiles){
  ry+=vy;
  let noChao=false, hit_tile=null;
  for(const t of tiles){
    if(!solido(t)) continue;
    const p=tpx(t);
    if(!hit(rx,ry,rw,rh,p.x,p.y,p.w,p.h)) continue;
    if(vy>=0){ ry=p.y-rh; noChao=true; }
    else     { ry=p.y+p.h; hit_tile=t; }
    vy=0;
  }
  return {ry,vy,noChao,hit_tile};
}

// ─── AUDIO ───────────────────────────────────────────────────
let AC=null;
function beep(f,d,type='square',v=0.1){
  try{
    if(!AC) AC=new(window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain();
    o.connect(g);g.connect(AC.destination);
    o.type=type;o.frequency.value=f;
    g.gain.setValueAtTime(v,AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);
    o.start();o.stop(AC.currentTime+d);
  }catch(e){}
}
const sPulo=()=>beep(350,0.1,'square',0.12);
const sMoeda=()=>{beep(1046,0.06,'sine',0.1);setTimeout(()=>beep(1318,0.1,'sine',0.1),60);};
const sEstrela=()=>beep(660,0.08,'square',0.1);
const sInimigo=()=>beep(180,0.15,'square',0.12);
const sMorte=()=>{[400,320,260,200].forEach((f,i)=>setTimeout(()=>beep(f,0.1),i*80));};

// ─── PARTÍCULAS ──────────────────────────────────────────────
function boom(g,x,y,c){
  for(let i=0;i<8;i++){
    const a=Math.random()*Math.PI*2,s=1.5+Math.random()*3;
    g.particulas.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,vida:22,c,t:3+Math.random()*3});
  }
}

// ─── UPDATE ──────────────────────────────────────────────────
let jogo=null,animId=null;

function update(g){
  g.tick++;
  const j=g.j;

  if(g.estado==='morto'){
    g.tMorte--;
    j.vy+=GRAV; j.y+=j.vy;
    if(g.tMorte<=0){
      if(g.vidas<=0){g.estado='gameover';return;}
      j.x=3*TS;j.y=(GY-3)*TS;j.vx=0;j.vy=0;j.estrela=false;g.cam=0;g.estado='jogando';
    }
    return;
  }
  if(g.estado!=='jogando') return;

  // Input
  const vel=iC()?VCOR:VAND;
  if(iL()){j.vx=Math.max(j.vx-1,-vel);j.dir=-1;}
  else if(iR()){j.vx=Math.min(j.vx+1,vel);j.dir=1;}
  else{j.vx*=0.72;if(Math.abs(j.vx)<0.1)j.vx=0;}

  const puJ=iJ();
  if(puJ&&!j.puAnt&&j.noChao){j.vy=VPULO;j.noChao=false;sPulo();}
  if(!puJ&&j.vy<-4) j.vy+=0.7;
  j.puAnt=puJ;

  j.vy=Math.min(j.vy+GRAV,VMAX);
  j.noChao=false;

  let mx=moveX(j.x,j.y,j.w,j.h,j.vx,g.tiles);
  j.x=mx.rx;j.vx=mx.vx;
  if(j.x<0){j.x=0;j.vx=0;}

  let my=moveY(j.x,j.y,j.w,j.h,j.vy,g.tiles);
  j.y=my.ry;j.vy=my.vy;j.noChao=my.noChao;

  if(my.hit_tile){
    const t=my.hit_tile;
    if(t.t==='bq'&&!t.usado){
      t.usado=true;
      if(t.pu) spawnPU(g,t.x*TS,t.y*TS);
      else{spawnMo(g,t.x*TS+TS/2-6,t.y*TS);g.pontos+=200;sMoeda();}
    }else if(t.t==='ti'){
      const i=g.tiles.indexOf(t);if(i!==-1)g.tiles.splice(i,1);
      g.pontos+=50;boom(g,t.x*TS+TS/2,t.y*TS,'#44aaff');
    }
  }

  if(j.y>CH+80){morrer(g);return;}
  if(j.estrela){j.tEst--;if(j.tEst<=0)j.estrela=false;}

  // Power-ups
  for(let i=g.powerups.length-1;i>=0;i--){
    const p=g.powerups[i];
    p.vy=Math.min(p.vy+GRAV*0.6,VMAX);
    let px=moveX(p.x,p.y,TS-4,TS-4,p.vx,g.tiles);
    p.x=px.rx;if(px.vx===0)p.vx*=-1;
    let py=moveY(p.x,p.y,TS-4,TS-4,p.vy,g.tiles);
    p.y=py.ry;p.vy=py.vy;
    if(p.y>CH+60){g.powerups.splice(i,1);continue;}
    if(hit(j.x,j.y,j.w,j.h,p.x,p.y,TS-4,TS-4)){
      j.estrela=true;j.tEst=450;g.pontos+=1000;
      sEstrela();boom(g,p.x+TS/2,p.y,'#ffee00');
      g.powerups.splice(i,1);
    }
  }

  // Moedas
  for(let i=g.moedas.length-1;i>=0;i--){
    const m=g.moedas[i];
    m.vy-=0.4;m.y+=m.vy;m.vida--;
    if(hit(j.x,j.y,j.w,j.h,m.x,m.y,12,12)){g.pontos+=200;sMoeda();g.moedas.splice(i,1);}
    else if(m.vida<=0)g.moedas.splice(i,1);
  }

  // Inimigos
  for(let i=g.inimigos.length-1;i>=0;i--){
    const en=g.inimigos[i];
    if(!en.vivo){g.inimigos.splice(i,1);continue;}
    if(en.amassado){if(--en.tAm<=0)g.inimigos.splice(i,1);continue;}
    en.vy=Math.min(en.vy+GRAV,VMAX);en.noChao=false;
    let ex=moveX(en.x,en.y,TS-2,TS-2,en.vx,g.tiles);
    en.x=ex.rx;if(ex.vx===0){en.vx*=-1;en.dir*=-1;}
    let ey=moveY(en.x,en.y,TS-2,TS-2,en.vy,g.tiles);
    en.y=ey.ry;en.vy=ey.vy;en.noChao=ey.noChao;
    if(en.y>CH+60){g.inimigos.splice(i,1);continue;}
    // Não cair da borda
    if(en.noChao){
      const cx=en.vx>0?en.x+TS:en.x-2;
      const temChao=g.tiles.some(t=>solido(t)&&hit(cx,en.y+TS,2,2,t.x*TS,t.y*TS,t.w*TS,t.h*TS));
      if(!temChao){en.vx*=-1;en.dir*=-1;}
    }
    if(!hit(j.x+4,j.y+4,j.w-8,j.h-8,en.x+2,en.y+2,TS-4,TS-4)) continue;
    if(j.estrela){
      en.amassado=true;en.tAm=40;g.pontos+=300;
      sInimigo();boom(g,en.x+TS/2,en.y+TS/2,'#ffee00');
    }else if(j.vy>0&&j.y+j.h<en.y+TS*0.55){
      en.amassado=true;en.tAm=45;j.vy=-7;
      g.pontos+=100;sInimigo();boom(g,en.x+TS/2,en.y,'#44aaff');
    }else{morrer(g);return;}
  }

  if(j.x>101*TS){g.estado='vitoria';setTimeout(mostrarVitoria,1400);}

  // Partículas
  for(let i=g.particulas.length-1;i>=0;i--){
    const p=g.particulas[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.vida--;
    if(p.vida<=0)g.particulas.splice(i,1);
  }

  // Anim
  if(j.noChao&&Math.abs(j.vx)>0.3){
    if(++j.fTick>7){j.frame=(j.frame+1)%2;j.fTick=0;}
  }else{j.frame=0;j.fTick=0;}

  // Câmera
  g.cam+=(j.x-CW/4-g.cam)*0.13;
  if(g.cam<0)g.cam=0;
}

function morrer(g){g.vidas--;g.estado='morto';g.tMorte=80;g.j.vy=-10;sMorte();}
function spawnPU(g,x,y){g.powerups.push({x,y:y-TS,vx:1.5,vy:0});}
function spawnMo(g,x,y){g.moedas.push({x,y,vy:-9,vida:36});}

// ─── RENDER ──────────────────────────────────────────────────
function render(g){
  const canvas=document.getElementById('gameCanvas');
  const ctx=canvas.getContext('2d');
  const cam=Math.round(g.cam);

  // Céu
  const sky=ctx.createLinearGradient(0,0,0,CH);
  sky.addColorStop(0,'#0a2060');sky.addColorStop(0.55,'#1a55dd');sky.addColorStop(1,'#2277ff');
  ctx.fillStyle=sky;ctx.fillRect(0,0,CW,CH);

  drawClouds(ctx,cam);
  drawHills(ctx,cam);

  // Tiles
  for(const t of g.tiles){
    const sx=t.x*TS-cam, sy=t.y*TS;
    if(sx+TS<-TS||sx>CW+TS) continue;
    switch(t.t){
      case 'ch': drawGround(ctx,sx,sy); break;
      case 'pl': drawPlat(ctx,sx,sy);   break;
      case 'ti': drawTijolo(ctx,sx,sy); break;
      case 'bq': drawBQ(ctx,sx,sy,t.usado,g.tick); break;
      case 'polo':drawPolo(ctx,sx,sy,t.h); break;
      case 'bnd': drawBandeira(ctx,sx,sy,g.tick); break;
      case 'cas': drawCastelo(ctx,sx,sy,t.w,t.h); break;
    }
  }

  // Moedas
  for(const m of g.moedas) S(ctx,MO_SPR,Math.round(m.x-cam),Math.round(m.y),false);

  // Power-ups
  for(const p of g.powerups) S(ctx,PU_SPR,Math.round(p.x-cam),Math.round(p.y),false);

  // Inimigos
  for(const en of g.inimigos){
    if(!en.vivo) continue;
    const ex=Math.round(en.x-cam),ey=Math.round(en.y);
    if(ex<-TS||ex>CW+TS) continue;
    if(en.amassado){ S(ctx,IRMA_C,ex,ey,en.dir>0); }
    else{ const fr=Math.floor(g.tick/8)%2===0?IRMA_P:IRMA_R; S(ctx,fr,ex,ey,en.dir>0); }
  }

  // Jogador
  const j=g.j;
  const jx=Math.round(j.x-cam),jy=Math.round(j.y);
  const flip=j.dir<0;
  if(j.estrela){
    const fl=(g.tick%6)<3;
    S(ctx,fl?MAE_E:MAE_J,jx,jy,flip);
    ctx.fillStyle='rgba(255,238,0,0.12)';ctx.fillRect(jx-4,jy-4,j.w+8,j.h+8);
    ctx.fillStyle='#ffee00';
    for(let i=0;i<4;i++){
      const a=(g.tick*0.07+i*1.57)%(Math.PI*2);
      ctx.fillRect(jx+12+Math.cos(a)*15-1,jy+12+Math.sin(a)*15-1,3,3);
    }
  }else if(!j.noChao){ S(ctx,MAE_J,jx,jy,flip); }
  else if(j.frame===1){ S(ctx,MAE_R,jx,jy,flip); }
  else{ S(ctx,MAE_P,jx,jy,flip); }

  // Partículas
  for(const p of g.particulas){
    ctx.globalAlpha=p.vida/22;
    ctx.fillStyle=p.c;
    ctx.fillRect(Math.round(p.x-cam)-p.t/2,Math.round(p.y)-p.t/2,p.t,p.t);
  }
  ctx.globalAlpha=1;

  // HUD
  const se=document.getElementById('scoreDisplay');
  if(se) se.textContent=String(g.pontos).padStart(6,'0');
  const ve=document.getElementById('vidasDisplay');
  if(ve){
    ve.innerHTML='';
    for(let i=0;i<g.vidas;i++){
      const s=document.createElement('span');s.className='icone-vida';s.textContent='♥';ve.appendChild(s);
    }
  }
}

// ─── Cenário ─────────────────────────────────────────────────
function drawClouds(ctx,cam){
  const ns=[[100,50,1.2],[280,35,1.0],[480,55,1.4],[700,38,1.1],[950,48,1.5],
            [1200,32,1.2],[1550,50,1.6],[1850,36,1.1],[2150,52,1.4],[2450,40,1.5],
            [2800,34,1.3],[3100,48,1.4],[3450,38,1.2]];
  ctx.fillStyle='rgba(180,220,255,0.6)';
  for(const [x,y,s] of ns){
    const cx=x-cam*0.22;
    if(cx<-100||cx>CW+100) continue;
    const r=18*s;
    ctx.beginPath();ctx.arc(cx,y,r,0,Math.PI*2);
    ctx.arc(cx+r*0.82,y-r*0.28,r*0.68,0,Math.PI*2);
    ctx.arc(cx-r*0.75,y-r*0.18,r*0.60,0,Math.PI*2);
    ctx.fill();
  }
}
function drawHills(ctx,cam){
  ctx.fillStyle='rgba(20,65,175,0.35)';
  for(let i=0;i<30;i++){
    const hx=i*370-cam*0.35;
    ctx.beginPath();ctx.arc(hx,CH-70,70,0,Math.PI,true);ctx.fill();
    ctx.beginPath();ctx.arc(hx+165,CH-70,54,0,Math.PI,true);ctx.fill();
  }
}
function drawGround(ctx,x,y){
  ctx.fillStyle=COR.gb;ctx.fillRect(x,y,TS,4);
  ctx.fillStyle=COR.ga;ctx.fillRect(x,y+4,TS,TS-4);
  ctx.fillStyle=COR.gc;
  ctx.fillRect(x,y+4,1,TS-4);ctx.fillRect(x+TS-1,y+4,1,TS-4);
  ctx.fillRect(x,y+TS/2,TS,1);
  ctx.fillStyle='rgba(120,200,255,0.2)';ctx.fillRect(x+2,y+1,TS-4,2);
}
function drawPlat(ctx,x,y){
  ctx.fillStyle=COR.pl;ctx.fillRect(x,y,TS,TS);
  ctx.fillStyle=COR.pb;
  ctx.fillRect(x,y+TS/2,TS,2);ctx.fillRect(x+TS/2,y,2,TS/2);
  ctx.fillStyle='rgba(120,200,255,0.22)';ctx.fillRect(x+2,y+2,TS-4,4);
}
function drawTijolo(ctx,x,y){
  ctx.fillStyle=COR.ti;ctx.fillRect(x,y,TS,TS);
  ctx.fillStyle=COR.tb;
  ctx.fillRect(x,y+TS/3,TS,2);ctx.fillRect(x,y+TS*2/3,TS,2);
  ctx.fillRect(x+TS/2,y,2,TS/3);
  ctx.fillRect(x+TS/4,y+TS/3,2,TS/3);ctx.fillRect(x+TS*3/4,y+TS/3,2,TS/3);
  ctx.fillRect(x+TS/2,y+TS*2/3,2,TS/3);
}
function drawBQ(ctx,x,y,usado,tick){
  if(usado){
    ctx.fillStyle='#081440';ctx.fillRect(x,y,TS,TS);
    ctx.fillStyle='#101e58';ctx.fillRect(x+2,y+2,TS-4,TS-4);
  }else{
    const pl=Math.sin(tick*0.09)*0.14+0.86;
    ctx.fillStyle=COR.bq;ctx.fillRect(x,y,TS,TS);
    ctx.fillStyle=COR.bd;ctx.fillRect(x+2,y+2,TS-4,TS-4);
    ctx.globalAlpha=pl;ctx.fillStyle=COR.bl;ctx.fillRect(x+6,y+6,TS-12,TS-12);
    ctx.globalAlpha=1;
    ctx.fillStyle='#fff';ctx.font=`bold ${TS*0.62}px monospace`;
    ctx.textAlign='center';ctx.fillText('?',x+TS/2,y+TS*0.74);
  }
}
function drawPolo(ctx,x,y,h){
  ctx.fillStyle='#88ccff';ctx.fillRect(x+TS/2-2,y,4,h*TS);
  ctx.fillStyle=COR.am;ctx.beginPath();ctx.arc(x+TS/2,y+4,5,0,Math.PI*2);ctx.fill();
}
function drawBandeira(ctx,x,y,tick){
  const w=Math.sin(tick*0.1)*4;
  ctx.fillStyle='#dd2266';
  ctx.beginPath();
  ctx.moveTo(x+TS/2,y);ctx.lineTo(x+TS/2+18+w,y+8);ctx.lineTo(x+TS/2,y+16);
  ctx.fill();
}
function drawCastelo(ctx,x,y,w,h){
  // Drawn castle — stone blue blocks with battlements
  const tw=w*TS, th=h*TS;
  // Main body
  ctx.fillStyle='#0d2a7a'; ctx.fillRect(x,y,tw,th);
  // Stone pattern
  ctx.fillStyle='#1a3a9a';
  for(let row=0;row<h;row++){
    const offset=(row%2===0)?0:TS/2;
    for(let col=0;col<=w;col++){
      ctx.fillRect(x+col*TS+offset-1,y+row*TS,TS-2,TS-2);
    }
  }
  // Battlements on top
  ctx.fillStyle='#0d2a7a';
  for(let i=0;i<w;i++){
    if(i%2===0){ ctx.fillStyle='#1a3a9a'; ctx.fillRect(x+i*TS,y-TS/2,TS,TS/2); }
  }
  // Door arch
  ctx.fillStyle='#050d2a';
  const dx=x+tw/2-TS/2, dy=y+th-TS*1.5;
  ctx.fillRect(dx,dy+TS*0.4,TS,TS*1.1);
  ctx.beginPath();ctx.arc(dx+TS/2,dy+TS*0.4,TS/2,Math.PI,0);ctx.fill();
  // Windows
  ctx.fillStyle='#ffee44';
  ctx.fillRect(x+TS*0.8,y+TS*0.5,TS*0.5,TS*0.5);
  ctx.fillRect(x+tw-TS*1.3,y+TS*0.5,TS*0.5,TS*0.5);
  // Flag
  ctx.fillStyle='#88ccff'; ctx.fillRect(x+tw/2-1,y-TS,3,TS);
  ctx.fillStyle='#ff4466';
  ctx.beginPath();ctx.moveTo(x+tw/2+1,y-TS);ctx.lineTo(x+tw/2+12,y-TS+6);ctx.lineTo(x+tw/2+1,y-TS+12);ctx.fill();
}

// ─── Tela de vitória ─────────────────────────────────────────
function mostrarVitoria(){
  document.getElementById('telaVitoria').style.display='flex';
  document.getElementById('gameCanvas').style.display='none';
  document.getElementById('hud').style.display='none';
  const wm=document.getElementById('musicaVitoria');
  if(wm){wm.currentTime=0;wm.play().catch(()=>{});}
  document.getElementById('musicaFundo')?.pause();

  // Gerar estrelinhas animadas no fundo
  const starsEl = document.getElementById('winStars');
  if(starsEl && starsEl.children.length === 0){
    for(let i=0;i<80;i++){
      const s=document.createElement('div');
      s.className='win-star';
      const size = 1+Math.random()*3;
      s.style.cssText=`
        left:${Math.random()*100}%;
        top:${Math.random()*100}%;
        width:${size}px; height:${size}px;
        --dur:${0.8+Math.random()*2.5}s;
        animation-delay:${Math.random()*2}s;
      `;
      starsEl.appendChild(s);
    }
  }

  popularCasteloBig();
  popularFotos();
}

function pixelarImagem(src, canvasW, canvasH, pixelSize, callback){
  const img=new Image();
  img.onload=()=>{
    const c=document.createElement('canvas');
    c.width=canvasW; c.height=canvasH;
    c.style.imageRendering='pixelated';
    const ctx=c.getContext('2d');
    // Draw tiny then scale up for pixelation
    const tiny=document.createElement('canvas');
    tiny.width=Math.round(canvasW/pixelSize);
    tiny.height=Math.round(canvasH/pixelSize);
    const tc=tiny.getContext('2d');
    // Crop square from center
    const lado=Math.min(img.naturalWidth,img.naturalHeight);
    const ox=(img.naturalWidth-lado)/2, oy=(img.naturalHeight-lado)/2;
    tc.drawImage(img,ox,oy,lado,lado,0,0,tiny.width,tiny.height);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(tiny,0,0,canvasW,canvasH);
    callback(c);
  };
  img.src=src;
}

function popularCasteloBig(){
  const div=document.getElementById('castlePhoto');
  if(!div) return;
  div.innerHTML='';
  // Show it nicely — 200×160px, pixel size=3 (so 67×53 "pixels" of detail)
  pixelarImagem(
    'WhatsApp_Image_2026-05-10_at_08_49_20__9_.jpeg',
    200, 160, 3,
    (c)=>{
      c.style.width='200px'; c.style.height='160px';
      c.className='foto-pixel';
      c.style.border='4px solid #44aaff';
      c.style.boxShadow='0 0 20px #44aaff88';
      div.appendChild(c);
    }
  );
}

function popularFotos(){
  const faixa=document.getElementById('faixaFotos');
  if(!faixa) return;
  faixa.innerHTML='';
  const arqs=[
    'WhatsApp_Image_2026-05-10_at_08_49_20__1_.jpeg',
    'WhatsApp_Image_2026-05-10_at_08_49_20__2_.jpeg',
    'WhatsApp_Image_2026-05-10_at_08_49_20__3_.jpeg',
    'WhatsApp_Image_2026-05-10_at_08_49_20__4_.jpeg',
    'WhatsApp_Image_2026-05-10_at_08_49_20__5_.jpeg',
    'WhatsApp_Image_2026-05-10_at_08_49_20__7_.jpeg',
    'WhatsApp_Image_2026-05-10_at_08_49_20__8_.jpeg',
    'WhatsApp_Image_2026-05-10_at_08_49_20.jpeg',
    'WhatsApp Image 2026-05-10 at 08.49.20 (6).jpeg',
    'WhatsApp Image 2026-05-10 at 08.49.20 (9).jpeg',
    'WhatsApp Image 2026-05-10 at 08.49.20 (10).jpeg',
  ];
  arqs.forEach(arq=>{
    // 80×80 canvas, pixel size=2 → 40×40 pixels of detail (much cleaner)
    pixelarImagem(arq, 80, 80, 2, (c)=>{
      c.style.width='80px'; c.style.height='80px';
      c.className='foto-pixel';
      faixa.appendChild(c);
    });
  });
}

// ─── Loop ────────────────────────────────────────────────────
function loop(){
  if(!jogo) return;
  update(jogo);
  render(jogo);
  animId=requestAnimationFrame(loop);
}

function iniciarJogo(){
  if(animId) cancelAnimationFrame(animId);
  jogo=novoJogo();
  document.getElementById('telaInicio').style.display='none';
  document.getElementById('telaGameOver').style.display='none';
  document.getElementById('telaVitoria').style.display='none';
  document.getElementById('gameCanvas').style.display='block';
  document.getElementById('hud').style.display='flex';
  const bg=document.getElementById('musicaFundo');
  if(bg&&bg.querySelector('source')){bg.currentTime=0;bg.play().catch(()=>{});}
  loop();
  const w=setInterval(()=>{
    if(!jogo){clearInterval(w);return;}
    if(jogo.estado==='gameover'){
      clearInterval(w);cancelAnimationFrame(animId);
      const el=document.getElementById('pontuacaoFinal');
      if(el) el.textContent=jogo.pontos;
      document.getElementById('telaGameOver').style.display='flex';
    }
  },200);
}

window.addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
});
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.btn-dir,.btn-acao').forEach(b=>{
    b.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
    b.addEventListener('touchend',  e=>e.preventDefault(),{passive:false});
  });
});