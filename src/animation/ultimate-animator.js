'use strict';

const UltimateAnimator = (() => {
  const costumes = {
    hulk: ['#719c52', '#a0cc69'],
    spider_man: ['#ab334e', '#f96470'],
    ironman: ['#ab303b', '#edb24b'],
    wolverine: ['#d4a539', '#eed19c'],
    deadpool: ['#a8344a', '#cd5061'],
    captain_america: ['#2c4c83', '#aa3d4e'],
    thor: ['#8298a6', '#d7b79f'],
    doctor_strange: ['#355584', '#eab69d'],
    scarlet_witch: ['#903454', '#ed909f'],
    thanos: ['#a47e4e', '#ba94cc'],
    black_panther: ['#343144', '#646074'],
    loki: ['#376350', '#d9c99a'],
    venom: ['#2f394d', '#626d8d'],
    doctor_doom: ['#617870', '#aab9ad'],
    ghost_rider: ['#50435a', '#e9c38c'],
    black_widow: ['#3b3d55', '#687087'],
    magneto: ['#a54461', '#d78aa6'],
    captain_marvel: ['#a53f56', '#dbb56d'],
    moon_knight: ['#a4a9c2', '#dae4ea'],
    silver_surfer: ['#8cacca', '#daeef7'],
    gojo: ['#3c3b65', '#e4b5a6'],
    sukuna: ['#c89988', '#f5b8a2'],
    naruto: ['#bb7840', '#ecc08f'],
    luffy: ['#a93d54', '#efb48a'],
    eren: ['#74614d', '#c0a284'],
    levi: ['#736859', '#dac1a7'],
    doraemon: ['#3887c0', '#e6f6fd'],
    frieren: ['#d2d7cf', '#eac5ad']
  };

  // Coordinates are relative to the portrait radius, on the same plane as the shoulders.
  const clips = {
    hook:   { coil: [[-1.13,.46],[-1.07,-.04],[.80,.62],[.77,.23]], hit: [[-.88,.67],[-.75,.76],[1.14,.25],[1.68,-.04]], end: [[-.83,.63],[-.75,.67],[.95,.48],[1.26,.28]], grip:'fist', curl:.26 },
    upper:  { coil: [[-.96,.53],[-.87,.25],[1.13,.67],[1.28,.96]], hit: [[-.95,.45],[-1.18,.59],[1.06,.03],[1.39,-.93]], end: [[-.83,.47],[-.75,.56],[1.03,.21],[1.38,-.49]], grip:'fist', curl:.36 },
    smash:  { coil: [[-1.04,-.35],[-.90,-1.25],[1.04,-.44],[.93,-1.28]], hit: [[-1.07,.62],[-.73,1.08],[1.13,.61],[1.36,.97]], end: [[-.97,.67],[-.71,.72],[1.08,.69],[1.21,.79]], grip:'fist', curl:.41 },
    seize:  { coil: [[-1.09,.52],[-1.28,.28],[.99,.68],[1.23,.16]], hit: [[-.36,.74],[.60,.41],[1.20,.52],[1.68,.31]], end: [[-.71,.68],[-.29,.59],[1.03,.60],[.96,.43]], grip:'open', curl:.25 },
    web:    { coil: [[-.96,.49],[-1.29,.66],[.85,.56],[.91,-.04]], hit: [[-1.12,.64],[-1.47,.65],[1.08,.22],[1.72,.02]], end: [[-.91,.52],[-1.05,.64],[1.09,.42],[1.46,.24]], grip:'web', curl:.19 },
    crossedWeb: { coil: [[-.78,.70],[.26,.63],[.76,.70],[-.24,.52]], hit: [[-1.14,.27],[-1.58,-.04],[1.14,.26],[1.51,-.06]], end: [[-.96,.43],[-1.3,.26],[.96,.4],[1.33,.26]], grip:'web', curl:.19 },
    cut:    { coil: [[-.96,.54],[-1.16,.09],[.97,.24],[.82,-.56]], hit: [[-.98,.65],[-1.36,.52],[1.19,.37],[1.52,.54]], end: [[-.85,.66],[-1,.66],[1.03,.62],[1.19,.8]], grip:'weapon', curl:-.30 },
    cross:  { coil: [[-.87,.72],[.16,.65],[.89,.67],[-.13,.60]], hit: [[-1.13,.32],[-1.62,-.08],[1.16,.27],[1.67,-.17]], end: [[-.98,.56],[-1.28,.27],[1.01,.54],[1.30,.26]], grip:'weapon', curl:-.22 },
    return: { coil: [[-1.09,.53],[-1.06,.62],[.65,.90],[.38,.70]], hit: [[-.93,.66],[-1.24,.72],[1.17,.40],[1.60,.20]], end: [[-.81,.58],[-.97,.43],[1.03,.61],[1.32,.35]], grip:'throw', curl:.43 },
    flinch: { coil: [[-.94,.57],[-1.17,.22],[.94,.60],[1.17,.27]],
      hit: [[-.83,.48],[-.56,.15],[.83,.48],[.56,.14]],
      end: [[-.84,.63],[-1.01,.52],[.84,.63],[.99,.50]], grip:'open', curl:.07 },
    ward:   { coil: [[-.79,.69],[-.15,.50],[.89,.57],[.60,.58]], hit: [[-.70,.67],[.25,.56],[.88,.56],[.82,.56]], end: [[-.88,.64],[-.39,.61],[.88,.64],[1.15,.68]], grip:'open', curl:.10 },
    raise:  { coil: [[-.94,.62],[-.98,.72],[1.1,-.16],[1.13,-.66]], hit: [[-.65,.78],[.32,.53],[.98,-.46],[.79,-1.32]], end: [[-.77,.60],[-.47,.63],[1.09,-.18],[1.15,-.75]], grip:'weapon', curl:.27 },
    palm:   { coil: [[-.91,.65],[-.78,.87],[.91,.58],[.91,.04]], hit: [[-.83,.70],[-.57,.79],[1.14,.37],[1.66,.05]], end: [[-.89,.62],[-.64,.78],[1.01,.52],[1.25,.41]], grip:'open', curl:.15 },
    twin:   { coil: [[-.93,.67],[-.74,.38],[.95,.67],[.76,.33]], hit: [[-.44,.71],[.52,.44],[1.23,.38],[1.67,.01]], end: [[-.82,.67],[-.34,.55],[1.02,.48],[1.34,.33]], grip:'open', curl:.17 },
    open:   { coil: [[-.86,.65],[-.28,.72],[.86,.65],[.28,.65]], hit: [[-1.08,.26],[-1.69,.02],[1.13,.22],[1.73,-.03]], end: [[-.94,.54],[-1.30,.45],[.98,.49],[1.40,.42]], grip:'open', curl:.25 },
    point:  { coil: [[-.85,.56],[-.67,.7],[.94,.48],[.86,.09]], hit: [[-.89,.60],[-.62,.62],[1.19,.23],[1.68,.03]], end: [[-.85,.62],[-.62,.73],[1.03,.46],[1.32,.28]], grip:'point', curl:.14 },
    sign:   { coil: [[-.76,.89],[-.13,.66],[.77,.87],[.17,.66]], hit: [[-.77,.78],[-.14,.39],[.76,.78],[.13,.37]], end: [[-.83,.68],[-.49,.51],[.94,.58],[1.06,.36]], grip:'sign', curl:-.17 },
    void:   { coil: [[-.84,.72],[-.64,.66],[.91,.58],[.54,.17]], hit: [[-.90,.55],[-.89,.49],[.91,.48],[.67,-.24]], end: [[-.91,.64],[-.99,.59],[.96,.51],[.94,.12]], grip:'crossFingers', curl:.12 },
    sphere: { coil: [[-.72,.83],[-.34,.78],[.79,.72],[.33,.68]], hit: [[-.38,.76],[.66,.39],[1.14,.28],[1.57,.15]], end: [[-.75,.68],[-.44,.62],[1.00,.52],[1.27,.28]], grip:'orb', curl:.17 },
    circle: { coil: [[-.88,.65],[-.27,.64],[.94,.52],[1.03,-.23]], hit: [[-.49,.70],[.46,.69],[1.13,.18],[1.51,-.12]], end: [[-.85,.62],[-.54,.66],[1.10,.48],[1.43,.45]], grip:'point', curl:1.05 },
    staff:  { coil: [[-.91,.64],[-.13,.64],[.83,.55],[.91,-.12]], hit: [[-.94,.65],[-1.06,.59],[1.08,.26],[1.49,.08]], end: [[-.82,.63],[-.83,.69],[.96,.49],[1.19,.37]], grip:'weapon', curl:.17 },
    snap:   { coil: [[-.91,.62],[-.82,.74],[.96,.45],[.96,.03]], hit: [[-.91,.65],[-1.07,.73],[.97,-.04],[1.07,-.66]], end: [[-.85,.62],[-.9,.61],[1.02,.33],[1.25,-.15]], grip:'snap', curl:.29 },
    cloth:  { coil: [[-.86,.56],[-.26,.65],[.87,.56],[.27,.68]], hit: [[-1.09,.2],[-1.43,-.07],[1.08,.17],[1.45,-.07]], end: [[-.94,.43],[-1.17,.45],[.96,.41],[1.23,.42]], grip:'fist', curl:.23 }
  };

  const moveClips = {
    flinch:'flinch', punch:'hook', uppercut:'upper', bodyRush:'hook', webSwing:'web', stomp:'smash', warHammer:'smash',
    hammer:'smash', dualHammer:'cross', bifrost:'raise', lightning:'raise', crystalPunch:'hook', baryon:'hook',
    grapple:'seize', stinger:'point', ironArms:'seize', claws:'cross', hotClaws:'cross', dualBlades:'cross',
    sword:'cut', moonBlade:'cut', reverseBlade:'cut', nanoBlade:'cut', daggers:'cut', baton:'cross', odm:'cross',
    shieldBash:'cut', shieldGuard:'ward', hammerThrow:'return', shieldThrow:'return', crescent:'return',
    trickShot:'point', thunderSpears:'return', hellChain:'circle', web:'web', webArena:'crossedWeb', tendrils:'seize',
    repulsor:'palm', twinRepulsor:'twin', unibeam:'open', photon:'palm', twinPhoton:'twin',
    widowBite:'point', smallLight:'point', airCannon:'palm', door:'palm', timeCloth:'cloth',
    cursedSlash:'point', cleave:'palm', worldSlash:'sign', shrine:'sign', void:'void', purple:'sphere',
    red:'point', blue:'point', ninjaClone:'sign', rasengan:'sphere', rasenshuriken:'raise',
    chakraBomb:'sphere', divineFlame:'sphere', tenShadows:'sign', elastic:'hook', giantFist:'hook',
    elasticFlurry:'hook', dawnFists:'hook', titanMarch:'open', coordinate:'seize', mirror:'circle',
    portal:'circle', mysticBands:'circle', timeStone:'circle', snap:'snap', guard:'ward', absorb:'ward',
    regeneration:'ward', panel:'cut', dispel:'staff', zoltraak:'staff', judradjim:'staff', boardRush:'open'
  };

  const gear = {
    sword:'blade', dualBlades:'blades', odm:'reverseBlades', reverseBlade:'reverseBlades', moonBlade:'moonBlade',
    daggers:'dagger', nanoBlade:'nanoBlade', hammer:'hammer', hammerThrow:'hammerThrow', dualHammer:'dualHammer',
    bifrost:'hammer', shieldThrow:'shieldThrow', shieldBash:'shield', shieldGuard:'shield',
    crescent:'crescent', baton:'batons', claws:'claws', hotClaws:'claws', hellChain:'chain', stinger:'stinger',
    smallLight:'light', airCannon:'cannon', door:'cannon', thunderSpears:'spears', trickShot:'sidearm'
  };

  const handEffects = new Set(['repulsor','twinRepulsor','unibeam','web','webArena','zoltraak','widowBite',
    'smallLight','airCannon','photon','twinPhoton','cosmicRay','hellBreath','mysticBands','thread','tendrils','tether',
    'red','purple','shieldThrow','hammerThrow','crescent','thunderSpears','missile','trickShot','hellChain',
    'rasenshuriken','divineFlame','hexBolt','frost','beam','timeCloth','snap','worldSlash','cursedSlash','elastic','flame','judradjim']);

  function clamp(n) { return Math.max(0, Math.min(1, n)); }
  function smooth(n) { const t = clamp(n); return t*t*(3-2*t); }
  function mixPoint(a,b,t) { return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]; }

  function palette(id, form) {
    if (id === 'hulk' && form === 1) return ['#6f748a','#a6a9af'];
    if (id === 'hulk' && form === 2) return ['#ad7248','#a7c671'];
    if (id === 'spider_man' && form === 1) return ['#353447','#747b9a'];
    if (id === 'spider_man' && form === 2) return ['#a63445','#efb14e'];
    if (id === 'luffy' && form === 3) return ['#4b2e42','#9a4d53'];
    if (id === 'luffy' && form === 4) return ['#d9b9e7','#ffe1cd'];
    if (id === 'naruto' && form === 4) return ['#bd3f36','#ee9d63'];
    if (id === 'eren' && form > 0) return form === 3 ? ['#9093a1','#e2e7ee'] : ['#a96857','#d6a18a'];
    if (id === 'moon_knight' && form === 1) return ['#d3ced2','#f3ede8'];
    return costumes[id] || ['#595168','#ddbdad'];
  }

  function activeMove(arena, fighter) {
    if (fighter.currentHp <= 0) return null;
    const scene = arena.transformation.active;
    if (scene?.fighter === fighter && scene.age >= scene.length * .70) {
      const move = CharacterMoves.get(fighter.char.id, 4, 'ultimate');
      return { ...move, form:4, power:2, target: arena.fighters[1-fighter.side],
        age: (scene.age / scene.length - .70) / .30, charge:1, active:1, slot:'ultimate' };
    }
    if (fighter.skillCast && !fighter.formBefore) return fighter.skillCast;
    const beat = fighter.contactBeat;
    if (beat && arena.time-beat.start < .23 && !fighter.formBefore) {
      return { technique:'punch', target:beat.target, age:.075+arena.time-beat.start, charge:.07,
        active:.22, slot:'skill1', power:0, form:fighter.formStage };
    }
    return null;
  }

  function poseFor(fighter, cast, radius, sampleAge = cast.age) {
    const id = fighter.char.id;
    const { technique, form, target } = cast;
    const baseClip = moveClips[technique] || 'open';
    const clip = id === 'frieren' && technique !== 'flinch' ? 'staff' : baseClip;
    const motion = clips[clip];
    const facing = cast.facing ?? (Math.sign(target.x-fighter.x) || (fighter.side ? -1 : 1));
    const pitch = Math.max(-.47,Math.min(.43,(target.y-fighter.y)/(radius*2.9)));
    const after = sampleAge-cast.charge;
    const active = cast.active || .5;
    const progress = clamp(after/active);
    const load = smooth(sampleAge / cast.charge);
    const swing = clip === 'smash' ? .126 : clip === 'return' || clip === 'cut' || clip === 'cross' ? .094 : .088;
    const strike = smooth(after/swing);
    const hold = ['void','sign','cloth'].includes(clip) ? .69 : .46;
    const follow = smooth((progress-hold)/(.98-hold));
    const fade = 1-smooth((Math.max(0,after)-active*.88)/(active*.12+(cast.recovery || .14)));
    const flair = cast.power === 2 ? 1 : .70;
    const point = (index) => {
      const isLeft = index < 2;
      const side = isLeft ? -1 : 1;
      const elbow = index % 2 === 0;
      const rest = [side*(elbow ? .81 : 1.00),elbow ? .49 : .67];
      const loaded = mixPoint(rest,motion.coil[index],load);
      const pushed = mixPoint(loaded,motion.hit[index],strike);
      const settled = mixPoint(pushed,motion.end[index],follow);
      const angular = Math.sin(Math.PI*strike)*motion.curl*flair*(elbow ? .39 : 1);
      const cyclic = technique === 'baryon' || (cast.power===2 && ['claws','hotClaws','odm','dualBlades','baton'].includes(technique));
      const combo = cyclic && after > .12 ? .14*Math.sin(progress*Math.PI*6)*(1-follow)*side : 0;
      const aimPitch = (elbow ? .39 : 1)*pitch*strike*(index > 1 ? 1 : .35);
      return [settled[0]+combo,settled[1]-angular+aimPitch*(['sign','void','snap','smash','raise','cloth'].includes(clip) ? .22 : 1)];
    };
    let tool = gear[technique];
    if (id === 'frieren' && technique !== 'flinch') tool = 'staff';
    else if ((id === 'thor' || id === 'captain_america') && technique === 'lightning') tool = 'hammer';
    else if (id === 'captain_america' && technique === 'kinetic') tool = 'shield';
    const big = ['hulk','thanos','venom','eren'].includes(id) && (id !== 'eren' || form > 0);
    const extra = id === 'sukuna' && form >= 3;
    const hands = [point(1),point(3)];
    const elbows = [point(0),point(2)];
    const shoulders = [[-.55,.36],[.55,.36]];
    if (extra) {
      shoulders.push([-.58,.63],[.58,.64]);
      elbows.push([elbows[0][0]-.17,elbows[0][1]+.46],[elbows[1][0]+.17,elbows[1][1]+.43]);
      hands.push([hands[0][0]-.27,hands[0][1]+.54],[hands[1][0]+.26,hands[1][1]+.52]);
    }
    return { radius, facing, palette:palette(id,form), clip, grip:motion.grip, tool, technique, form,
      big, hands, elbows, shoulders, strike, follow, fade, progress, id, cast, fighter,
      rotate: Math.sin(Math.PI*strike) * motion.curl * 2.6,
      copter: technique==='copter' || cast.name?.includes('Take-copter'), color:cast.color || FighterForms.color(fighter) };
  }

  function pose(arena, fighter, radius) {
    const cast = activeMove(arena, fighter);
    const hit = FighterAnimator.reaction(fighter, arena.time);
    if (!hit || fighter.currentHp <= 0) return cast ? poseFor(fighter, cast, radius) : null;
    const defensive = {
      technique: 'flinch', target: { x: fighter.x - hit.ux, y: fighter.y - hit.uy },
      form: fighter.formStage, charge: .06, age: .14 + hit.age, active: hit.duration, power: 0,
      facing: cast?.facing, color: FighterForms.color(fighter)
    };
    if (!cast) {
      const rig = poseFor(fighter, defensive, radius);
      rig.fade = Math.min(1, hit.brace * 1.95);
      return rig;
    }
    const rig = poseFor(fighter, cast, radius);
    const guarded = poseFor(fighter, defensive, radius);
    const blend = Math.min(.64, hit.brace * .62);
    for (let i = 0; i < rig.hands.length; i++) {
      rig.hands[i] = mixPoint(rig.hands[i], guarded.hands[i], blend);
      rig.elbows[i] = mixPoint(rig.elbows[i], guarded.elbows[i], blend * .77);
    }
    return rig;
  }

  function emitsFromBody(technique) { return handEffects.has(technique); }

  function origin(arena, fighter, cast, hand = 1, anticipate = false) {
    if (cast.technique === 'unibeam') return { x:fighter.x,y:fighter.y+fighter.radius*.55 };
    if (cast.technique === 'hellBreath') return { x:fighter.x + (cast.facing || 1)*fighter.radius*.40,y:fighter.y+fighter.radius*.36 };
    const radius = fighter.radius;
    const rig = poseFor(fighter,cast,radius,anticipate ? Math.max(cast.age,cast.charge+.082) : cast.age);
    const style = FighterAnimator.pose(fighter,arena.time,arena.running,false);
    const shrink = 1-.28*Math.min(1,fighter.shrinkTimer*4);
    const [hx,hy] = rig.hands[hand];
    const [ex,ey] = rig.elbows[hand];
    const bearing = Math.atan2(hy-ey,hx-ex);
    const reach = rig.tool==='staff' ? .79 : ['cannon','light'].includes(rig.tool) ? .40 : .12;
    const direction = rig.tool==='staff' ? -.86+rig.strike*.93 : bearing;
    const x = (hx+Math.cos(direction)*reach)*radius*rig.facing*style.sx*shrink;
    const y = (hy+Math.sin(direction)*reach)*radius*style.sy*shrink;
    return {x:style.x+x*Math.cos(style.tilt)-y*Math.sin(style.tilt),
      y:style.y+x*Math.sin(style.tilt)+y*Math.cos(style.tilt)};
  }

  const ink = '#171622';

  function stroke(ctx, points, color, width) {
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for(const point of points.slice(1)) ctx.lineTo(...point);
    ctx.stroke();
  }

  function shape(ctx, points, color, rim = ink, width = .039) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for(const point of points.slice(1)) ctx.lineTo(...point);
    ctx.closePath();
    ctx.fillStyle=color;
    ctx.fill();
    if(rim) { ctx.strokeStyle=rim; ctx.lineWidth=width; ctx.stroke(); }
  }

  function ellipse(ctx,x,y,rx,ry,color,rim=null,angle=0) {
    ctx.beginPath();
    ctx.ellipse(x,y,rx,ry,angle,0,Math.PI*2);
    ctx.fillStyle=color;
    ctx.fill();
    if(rim) {ctx.strokeStyle=rim;ctx.lineWidth=.032;ctx.stroke();}
  }

  function arm(ctx, rig, index, front) {
    const [sleeve,glove]=rig.palette;
    const elbow=rig.elbows[index];
    const wrist=rig.hands[index];
    const width=(rig.big ? .34 : .218)*(index>1 ? .83 : 1);
    const shoulder=rig.shoulders[index];
    const segments=front ? [mixPoint(shoulder,elbow,.58),elbow,wrist] : [shoulder,elbow,wrist];
    stroke(ctx,segments,ink,width+.073);
    stroke(ctx,segments,sleeve,width);
    stroke(ctx,[elbow,wrist],ink,width*.81+.047);
    stroke(ctx,[elbow,wrist],glove,width*.78);
    const high=elbow[1] < shoulder[1];
    stroke(ctx,[[elbow[0],elbow[1]-(high ? .058 : .035)],[wrist[0],wrist[1]-.05]],'rgba(255,244,220,.42)',.028);
    if (['ironman','doctor_doom','black_widow','thanos','captain_america'].includes(rig.id)) {
      const brace=mixPoint(elbow,wrist,.69);
      ellipse(ctx,brace[0],brace[1],width*.26,width*.40,rig.color,ink,rig.rotate);
    }
  }

  const fingers = {
    open: [[.13,-.17],[.22,-.088],[.23,.016],[.18,.111]],
    point: [[.26,-.09],[.09,-.015],[.10,.052],[.079,.118]],
    web: [[.25,-.105],[.083,-.033],[.079,.047],[.218,.128]],
    sign: [[.15,-.19],[.20,-.116],[.13,-.033],[.09,.048]],
    crossFingers: [[.15,-.21],[.21,-.166],[.09,.03],[.073,.10]],
    snap: [[.17,-.11],[.19,-.004],[.08,.044],[.064,.112]],
    orb: [[.16,-.15],[.23,-.108],[.22,-.014],[.18,.069]],
    throw: [[.22,-.11],[.22,-.042],[.19,.048],[.15,.117]]
  };

  function hand(ctx,rig,index) {
    const [x,y]=rig.hands[index];
    const [ex,ey]=rig.elbows[index];
    const angle=Math.atan2(y-ey,x-ex);
    const glove=rig.palette[1];
    const scale=rig.big ? 1.39 : rig.id==='doraemon' ? 1.16 : 1;
    const grip=(rig.grip==='throw' && rig.strike<.82) || (rig.tool && ['fist','weapon'].includes(rig.grip))
      ? 'fist' : rig.grip;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    const digits = rig.id==='doraemon' ? null : fingers[grip];
    if (digits) {
      const signPose=['sign','crossFingers','snap'].includes(grip);
      if(signPose)ctx.rotate(-.45+rig.strike*.22);
      for(const [i,end] of digits.entries()){
        const base=[.042,-.087+i*.057];
        const tip=grip==='snap' && i===1 ? [.18+rig.strike*.09,-.024-rig.strike*.055] : end;
        stroke(ctx,[base,tip],ink,.068);
        stroke(ctx,[base,tip],glove,.042);
      }
      const thumb=grip==='snap' ? [.178,-.027] : [.021,.148];
      stroke(ctx,[[-.04,.047],thumb],ink,.087);
      stroke(ctx,[[-.04,.047],thumb],glove,.056);
    }
    const inflate=rig.id==='luffy' && index===1 && ['giantFist','dawnFists'].includes(rig.technique)
      ? 1+(.62+.28*rig.form)*smooth(rig.cast.age/rig.cast.charge)*(1-rig.strike*.42) : 1;
    if (grip==='snap' && index===1) {
      shape(ctx,[[-.18,-.13],[.07,-.16],[.14,-.08],[.13,.10],[.03,.15],[-.21,.085]],'#bd945e');
      const gems=['#be8cff','#7dc7ff','#ff8599','#91edb3','#ffdf82','#ffa77e'];
      for(let i=0;i<gems.length;i++)ellipse(ctx,-.09+(i%3)*.057,-.064+Math.floor(i/3)*.089,.026,.021,gems[i],ink);
    } else ellipse(ctx,0,0,.144*inflate,(rig.big ? .113 : .096)*inflate,glove,ink);
    if(!digits){
      stroke(ctx,[[.032,-.063],[.098,-.059]],'rgba(255,244,220,.55)',.025);
      for(const y of [-.038,.017,.063]) stroke(ctx,[[.075,y],[.126,y+.013]],ink,.012);
    } else if(rig.id==='ironman' && (rig.technique==='repulsor'||rig.technique==='twinRepulsor')){
      ellipse(ctx,.026,.005,.044,.050,'#c9ffff','#69bde7');
    } else if(grip==='web' && index<2){
      ellipse(ctx,-.09,.027,.031,.050,'#c3e3ff','#56617e');
    }
    ctx.restore();
  }

  const twinTools = new Set(['claws','batons','blades','reverseBlades','dualHammer']);
  const edgeTools = new Set(['blade','blades','reverseBlades','nanoBlade','moonBlade','hammer','dualHammer','dagger','claws','batons','stinger']);

  function equipmentAngle(rig, index) {
    const [x, y] = rig.hands[index];
    const [ex, ey] = rig.elbows[index];
    const swing = Math.atan2(y - ey, x - ex);
    const reverse = rig.tool === 'reverseBlades' ? -1.24 : 0;
    return rig.tool === 'staff' ? -.86 + rig.strike * .93 : swing - .22 + rig.rotate + reverse;
  }

  function equipment(ctx, rig, index) {
    const tool = rig.tool;
    const twin = twinTools.has(tool);
    if (!tool || index > 1 || (!twin && index === 0)) return;
    const launched = ['hammerThrow','shieldThrow','crescent','spears'].includes(tool);
    if (launched && rig.cast.age >= rig.cast.charge && !rig.cast.nodes?.some(node => node.done && node.returning)) return;
    const [x, y] = rig.hands[index];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(equipmentAngle(rig, index));
    if (['hammer','hammerThrow','dualHammer','staff'].includes(tool)) {
      const isStaff = tool === 'staff';
      stroke(ctx, [[isStaff ? -.69 : -.25,0],[isStaff ? 1.07 : .64,0]], ink, .15);
      stroke(ctx, [[isStaff ? -.67 : -.23,0],[isStaff ? 1.04 : .62,0]], isStaff ? '#a45c52' : '#906550', .073);
      if (isStaff) {
        ellipse(ctx, 1.05, 0, .18, .16, '#eece9a', ink);
        ellipse(ctx, 1.06, 0, .10, .095, '#d87073', '#ffe2b3');
      } else {
        const axe = rig.technique === 'bifrost' || (rig.id === 'thor' && (rig.form === 2 || rig.form === 4 || (tool === 'dualHammer' && index === 1)));
        const head = axe ? [[.48,-.13],[.72,-.35],[.95,-.34],[.99,.14],[.78,.26],[.48,.13]]
          : [[.45,-.24],[.78,-.24],[.85,-.15],[.85,.17],[.78,.23],[.45,.23]];
        shape(ctx, head, rig.id === 'hulk' ? '#b08c70' : '#9ebad1', ink);
        stroke(ctx, [[.52,-.16],[.74,-.16],[.78,-.08]], '#e0f4ff', .048);
      }
    } else if (tool === 'shield' || tool === 'shieldThrow') {
      if(rig.form===2){
        shape(ctx,[[.19,-.55],[.54,-.31],[.49,.17],[.20,.49],[-.14,.19],[-.19,-.32]],'#387cbd','#a1efff',.061);
        shape(ctx,[[.19,-.43],[.43,-.27],[.36,.14],[.20,.36],[-.015,.14],[-.08,-.28]],'#285887','#92e1f5',.034);
        stroke(ctx,[[.19,-.37],[.19,.31]],'#d6ffff',.035);
        ctx.restore();
        return;
      }
      const shieldColors = [[.52,ink],[.47,'#c54159'],[.365,'#e7e0de'],[.29,'#c64159'],[.19,'#486a9d']];
      for (const [r, color] of shieldColors) {
        ellipse(ctx, .19, 0, r * .63, r, color);
      }
      const star = Array.from({ length: 10 }, (_, i) => {
        const angle = -Math.PI / 2 + i * Math.PI / 5;
        const radius = i % 2 ? .055 : .13;
        return [.19 + Math.cos(angle) * radius * .72, Math.sin(angle) * radius];
      });
      shape(ctx, star, '#f9f2ed');
    } else if (tool === 'cannon' || tool === 'light') {
      shape(ctx, [[-.08,-.16],[.28,-.2],[.48,-.26],[.48,.25],[.28,.17],[-.08,.13]],
        tool === 'light' ? '#f0bc69' : '#719acc', ink);
      ellipse(ctx, .49, 0, .10, .235, '#273347', '#d7ecf1');
      ellipse(ctx, .51, 0, .06, .12, tool === 'light' ? '#ffe395' : '#769ccb');
    } else if (tool === 'claws') {
      const length = rig.id === 'black_panther' ? .48 : .73;
      for (const lane of [-1,0,1]) {
        const y = lane * .10;
        shape(ctx, [[.04,y-.026],[length*.73,y-.08],[length,y-.18],[length*.78,y+.015],[.06,y+.042]],
          rig.technique === 'hotClaws' ? '#ffac71' : '#d1d9e5', ink, .025);
      }
    } else if (tool === 'crescent' || tool === 'moonBlade') {
      ctx.beginPath();
      ctx.arc(.25, 0, .29, .05, Math.PI * 1.62);
      ctx.quadraticCurveTo(.17, .04, .54, .015);
      ctx.fillStyle = '#e5f4f6';
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = .04;
      ctx.stroke();
    } else if (tool === 'sidearm') {
      shape(ctx, [[-.16,-.14],[.32,-.14],[.38,-.06],[.16,.00],[.05,.13],[-.12,.12]],
        '#655b73', ink);
      stroke(ctx, [[-.12,-.095],[.27,-.09]],'#aaa2ba',.035);
    } else if (tool === 'stinger') {
      shape(ctx,[[-.10,-.14],[.41,-.16],[.62,-.31],[.52,-.06],[.19,.03],[-.08,.03]],'#e5d2ad',ink);
    } else if (tool === 'chain') {
      for (let i = 0; i < 6; i++) ellipse(ctx, i * .14, Math.sin(i*.55)*.15, .10, .048, '#543143', '#f6aa6c', i * .13);
    } else {
      const length = tool === 'dagger' ? .49 : tool === 'batons' ? .56 : tool === 'spears' ? 1.2 : .87;
      shape(ctx, [[-.19,-.05],[.12,-.065],[.19,-.10],[length-.05,-.062],[length,.014],[.16,.073],[-.19,.052]],
        tool === 'batons' ? '#727c94' : tool === 'nanoBlade' ? '#8cf4f4' : '#c7e4ed', ink);
      stroke(ctx, [[.23,-.034],[length-.09,-.024]], tool === 'batons' ? '#d59098' : '#f0f7f3', .026);
      stroke(ctx, [[.04,-.095],[.04,.09]], '#ad885a', .043);
    }
    ctx.restore();
  }

  function animateTrail(ctx, rig) {
    const blade = edgeTools.has(rig.tool);
    const elapsed = rig.cast.age - rig.cast.charge;
    if (elapsed < .015 || rig.progress > .43 || (!blade && !['hook','smash','upper'].includes(rig.clip))) return;
    const whole = Math.min(1, elapsed / .07);
    const fade = (1 - Math.max(0, rig.progress - .17) / .26) * whole;
    const first = Math.max(rig.cast.charge, rig.cast.age - .163);
    const samples = Array.from({ length: 8 }, (_, i) =>
      poseFor(rig.fighter, rig.cast, rig.radius, first + (rig.cast.age - first) * i / 7)
    );
    const hands = twinTools.has(rig.tool) || rig.clip === 'smash' ? [0, 1] : [1];
    const reach = blade ? (rig.tool === 'dagger' ? .57 : rig.tool === 'claws' ? .69 : .91) : .16;
    const wide = blade ? (rig.cast.power === 2 ? .24 : .17) : .092;
    for (const index of hands) {
      const trail = samples.map((sample) => {
        const angle = equipmentAngle(sample, index);
        const [x, y] = sample.hands[index];
        return { x: x + Math.cos(angle) * reach, y: y + Math.sin(angle) * reach };
      });
      if (Math.hypot(trail[0].x - trail.at(-1).x, trail[0].y - trail.at(-1).y) < .12) continue;
      SkillInk.ribbon(ctx, trail, wide, rig.color, fade * .92, '#fff2df', 1 / rig.radius);
    }
  }

  function ironSpiderArms(ctx,rig) {
    for(const side of [-1,1]){
      const extend=.76+rig.strike*.31-rig.follow*.18;
      for(const index of [0,1]){
        const shoulder=[side*.48,.22+index*.38];
        const pivot=[side*(.83+index*.24),-.48+index*.45];
        const tip=[side*(1.40+index*.26)*extend,-.90+index*.53+rig.strike*.34];
        stroke(ctx,[shoulder,pivot,tip],ink,.153);
        stroke(ctx,[shoulder,pivot,tip],index===0?'#bd7650':'#d2a35e',.099);
        ellipse(ctx,pivot[0],pivot[1],.078,.077,'#ffd695',ink);
        shape(ctx,[[tip[0]-.11,tip[1]+.04],[tip[0]+.11,tip[1]+.03],[tip[0]+.08*side,tip[1]-.18],
          [tip[0]-.10*side,tip[1]-.13]],'#ffe3a5',ink,.025);
      }
    }
  }

  function render(ctx,rig,front) {
    ctx.save();
    ctx.scale(rig.radius*rig.facing,rig.radius);
    ctx.globalAlpha *= rig.fade;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    if(!front){
      animateTrail(ctx,rig);
      if(rig.technique==='ironArms')ironSpiderArms(ctx,rig);
      for(let i=0;i<rig.hands.length;i++) arm(ctx,rig,i,false);
      ctx.restore();
      return;
    }
    if(rig.copter) {
      stroke(ctx,[[0,-1],[0,-1.30]],'#e4bc52',.073);
      ellipse(ctx,0,-1.30,.13+Math.abs(Math.cos(rig.cast.age*45))*.49,.055,'#ffd47c',ink);
    }
    for(let i=rig.hands.length-1;i>=0;i--){
      arm(ctx,rig,i,true);
      equipment(ctx,rig,i);
      hand(ctx,rig,i);
    }
    if(rig.grip==='snap' && rig.strike > .65 && rig.progress < .21) {
      const [x,y] = rig.hands[1];
      const light = (1-rig.progress/.21)*.17;
      shape(ctx,[[x+light,y-.25],[x+light*1.5,y-.24-light],[x+light*2,y-.25],
        [x+light*1.5,y-.16]],'#fff1b5',rig.color,.012);
    }
    if(rig.technique==='purple' && rig.progress<.18) {
      const [a,b]=rig.hands;
      const t=smooth((rig.cast.age/rig.cast.charge-.35)/.65);
      const end=mixPoint(a,b,.5);
      const fuse=rig.strike*.76;
      const first=mixPoint(a,end,fuse),second=mixPoint(b,end,fuse);
      ellipse(ctx,first[0]-.10,first[1]-.17,.04+.105*t,.04+.095*t,'#74bfff','#cfeaff');
      ellipse(ctx,second[0]+.10,second[1]-.17,.04+.105*t,.04+.095*t,'#eb657b','#ffe0e6');
    }
    if(rig.clip==='cloth') {
      const [a,b]=rig.hands;
      ctx.beginPath();ctx.moveTo(...a);
      ctx.quadraticCurveTo((a[0]+b[0])*.5,a[1]-.24,b[0],b[1]);
      ctx.lineTo(b[0]-.10,b[1]+.42);
      ctx.quadraticCurveTo((a[0]+b[0])*.5,a[1]+.55,a[0]+.12,a[1]+.37);
      ctx.closePath();ctx.fillStyle='#d95778';ctx.fill();ctx.strokeStyle='#ffafbd';ctx.lineWidth=.04;ctx.stroke();
      ellipse(ctx,(a[0]+b[0])*.5,(a[1]+b[1])*.5+.25,.105,.085,'#ffe4dd','#8b4070');
    }
    ctx.restore();
  }

  return { pose, origin, emitsFromBody, drawBack:(ctx,rig)=>render(ctx,rig,false),
    drawFront:(ctx,rig)=>render(ctx,rig,true) };
})();
