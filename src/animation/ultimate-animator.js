'use strict';

const UltimateAnimator = (() => {
  // Sleeve, glove or skin, trousers and boots. The portrait layers over the rig.
  const costumes = {
    hulk: ['#719c52', '#a0cc69', '#514061', '#8cac62'],
    spider_man: ['#ab334e', '#f96470', '#273a65', '#a12b45'],
    ironman: ['#ab303b', '#edb24b', '#a12b39', '#e7a84d'],
    wolverine: ['#d4a539', '#eed19c', '#25384c', '#212c46'],
    deadpool: ['#a8344a', '#cd5061', '#583340', '#282a37'],
    captain_america: ['#2c4c83', '#aa3d4e', '#263b5e', '#984358'],
    thor: ['#8298a6', '#d7b79f', '#343b53', '#9f6277'],
    doctor_strange: ['#355584', '#eab69d', '#263858', '#34304a'],
    scarlet_witch: ['#903454', '#ed909f', '#4b2b4e', '#b33d68'],
    thanos: ['#a47e4e', '#ba94cc', '#433b68', '#b6935e'],
    black_panther: ['#343144', '#646074', '#292833', '#444257'],
    loki: ['#376350', '#d9c99a', '#2d423d', '#b99655'],
    venom: ['#2f394d', '#626d8d', '#272839', '#43455f'],
    doctor_doom: ['#617870', '#aab9ad', '#354a45', '#708882'],
    ghost_rider: ['#50435a', '#e9c38c', '#3d374a', '#755452'],
    black_widow: ['#3b3d55', '#687087', '#282e42', '#555564'],
    magneto: ['#a54461', '#d78aa6', '#563763', '#7b487a'],
    captain_marvel: ['#a53f56', '#dbb56d', '#30476c', '#ac4555'],
    moon_knight: ['#a4a9c2', '#dae4ea', '#737a94', '#abb3c6'],
    silver_surfer: ['#8cacca', '#daeef7', '#6f93b5', '#bed4ea'],
    gojo: ['#3c3b65', '#e4b5a6', '#302d4b', '#4b4167'],
    sukuna: ['#c89988', '#f5b8a2', '#432e46', '#673d50'],
    naruto: ['#bb7840', '#ecc08f', '#394050', '#6a5948'],
    luffy: ['#a93d54', '#efb48a', '#506785', '#b48a66'],
    eren: ['#74614d', '#c0a284', '#5d5463', '#776759'],
    levi: ['#736859', '#dac1a7', '#555464', '#48444d'],
    doraemon: ['#3887c0', '#e6f6fd', '#397da7', '#eefaff'],
    frieren: ['#d2d7cf', '#eac5ad', '#6c6077', '#685068']
  };

  // Two elbows, two hands, two knees and two feet in each release silhouette.
  const poses = {
    slam: { load: [[-1.09,-.61],[-.85,-1.37],[1.06,-.69],[.89,-1.35]], fire: [[-.94,.66],[-.72,1.17],[1.06,.60],[1.23,1.15]], step: .23, crouch: .23 },
    call: { load: [[-.86,.65],[-1.10,.45],[1.06,.00],[1.12,-.95]], fire: [[-.91,.52],[-1.29,.43],[.91,-.19],[.79,-1.22]], step: .24, crouch: .06 },
    punch: { load: [[-1.07,.52],[-1.24,.53],[.74,.55],[.82,.35]], fire: [[-.77,.55],[-.78,.77],[1.20,.31],[1.77,.10]], step: .43, crouch: .12 },
    rush: { load: [[-.93,.55],[-.80,.28],[.96,.40],[.91,.24]], fire: [[-1.1,.78],[-1.54,.84],[1.18,.31],[1.72,.15]], step: .55, crouch: .23 },
    sweep: { load: [[-1.02,.52],[-1.37,.25],[.84,.34],[.8,-.34]], fire: [[-.91,.60],[-1.23,.71],[1.15,.18],[1.64,-.19]], step: .40, crouch: .10 },
    kick: { load: [[-.92,.47],[-.86,.27],[.96,.59],[1.15,.85]], fire: [[-1.05,.37],[-1.41,.18],[.72,.66],[1.15,.94]], step: .88, crouch: .38 },
    aim: { load: [[-.94,.61],[-.81,.82],[.95,.47],[.96,.08]], fire: [[-.89,.62],[-1.08,.79],[1.14,.38],[1.74,.12]], step: .27, crouch: .13 },
    signs: { load: [[-.77,.88],[-.18,.76],[.81,.88],[.19,.74]], fire: [[-.86,.83],[-.13,.48],[1.10,.49],[1.52,.31]], step: .11, crouch: .16 },
    wide: { load: [[-.83,.74],[-.24,.86],[.87,.71],[.29,.81]], fire: [[-1.17,.29],[-1.73,.12],[1.16,.26],[1.75,.10]], step: .23, crouch: .03 },
    staff: { load: [[-.80,.72],[-.64,.99],[.85,.58],[.91,.13]], fire: [[-1.0,.58],[-1.38,.48],[1.20,.38],[1.59,.14]], step: .25, crouch: .08 }
  };

  const techniquePose = {
    stomp:'slam', warHammer:'slam', titanMarch:'slam', hammer:'slam', punch:'punch', grapple:'punch',
    rasengan:'punch', dawnFists:'punch', elasticFlurry:'punch', bodyRush:'rush', boardRush:'rush',
    kick:'kick', webKick:'kick', copter:'kick', lightning:'call', sword:'sweep', claws:'sweep', baton:'sweep', odm:'sweep',
    shieldBash:'punch', hammerThrow:'sweep', shieldThrow:'sweep', crescent:'sweep', hellChain:'sweep',
    web:'aim', webArena:'aim', widowBite:'aim', smallLight:'aim', airCannon:'aim',
    repulsor:'aim', unibeam:'wide', missile:'aim', ironArmor:'wide',
    cursedSlash:'signs', shrine:'signs', red:'aim', blue:'aim', purple:'signs', void:'signs',
    ninjaClone:'signs', chakraBomb:'wide', rasenshuriken:'slam', zoltraak:'staff'
  };
  const tools = {
    sword:'blade', odm:'blades', hammer:'hammer', hammerThrow:'hammer', shieldThrow:'shield',
    shieldBash:'shield', crescent:'crescent', baton:'batons', claws:'claws', hellChain:'chain',
    smallLight:'light', airCannon:'cannon', door:'cannon', thunderSpears:'spears'
  };
  const martial = new Set(['slam', 'punch', 'rush', 'sweep', 'kick']);
  const emitted = new Set(['repulsor','web','webArena','zoltraak','widowBite','smallLight','airCannon','photon','cosmicRay']);

  function smooth(value) {
    const n = Math.min(1, Math.max(0, value));
    return n * n * (3 - 2 * n);
  }

  function activeMove(arena, fighter) {
    const scene = arena.transformation.active;
    if (scene?.fighter === fighter && scene.age >= scene.length * .67) {
      const move = CharacterMoves.get(fighter.char.id, 4, 'ultimate');
      return { ...move, target: arena.fighters[1 - fighter.side], age: (scene.age / scene.length - .67) / .33,
        charge: 1, active: 1, slot: 'ultimate' };
    }
    if (fighter.currentHp <= 0) return null;
    const cast = fighter.skillCast;
    if (cast?.slot === 'ultimate' || (cast?.contact && cast.age >= cast.charge)) return cast;
    const beat = fighter.contactBeat;
    if (beat && arena.time - beat.start < .27 && fighter.currentHp > 0) {
      return { technique: 'punch', target: beat.target, age: .11 + arena.time - beat.start, charge: .08,
        active: .26, slot: 'skill1' };
    }
    return null;
  }

  function poseFor(fighter, cast, radius) {
    const id = fighter.char.id;
    const { technique } = cast;
    const mode = techniquePose[technique] || (id === 'frieren' ? 'staff' : id === 'gojo' || id === 'sukuna' ? 'signs' : 'wide');
    const motion = poses[mode];
    const facing = Math.sign(cast.target.x - fighter.x) || (fighter.side ? -1 : 1);
    const height = Math.max(-.37, Math.min(.37, (cast.target.y - fighter.y) / (radius * 4)));
    const after = cast.age - cast.charge;
    const progress = Math.min(1, Math.max(0, after / cast.active));
    const loading = after < 0 ? smooth(cast.age / cast.charge) : 1;
    const follow = after < 0 ? 0 : smooth(after / (mode === 'slam' ? .18 : .125));
    const ease = 1 - smooth((progress - .62) / .61);
    const moves = martial.has(mode);
    const run = moves && after >= 0 && (cast.hits ?? 0) < 1 && mode !== 'slam';
    const stride = run ? Math.sin(after * 20) * .21 : 0;
    const sweep = cast.slot === 'ultimate' && ['sweep','punch'].includes(mode) && after >= .13
      ? Math.sin(progress * Math.PI * 5.2) * .12 * (1 - progress) : 0;
    const tilt = (follow * ease - .48 * loading) * (moves ? .21 : .08);
    const crouch = motion.crouch * loading * (.6 + progress * .33) * ease;
    const hips = [.07 + tilt, .91 + crouch];
    const palette = id === 'luffy' && fighter.formStage >= 3 ? ['#d9b9e7','#ffe1cd','#d7c0e7','#ad82b3']
      : id === 'eren' && fighter.formStage > 0 ? ['#b68570','#dab898','#8b625b','#bc9782'] : costumes[id] || ['#595168', '#ddbdad', '#4e475e', '#797091'];

    const pair = (index, shoulder) => {
      const [restX, restY] = shoulder ? [index === 0 ? -.74 : .74, .74] : [index === 1 ? -1.06 : 1.06, .85];
      const [startX, startY] = motion.load[index];
      const [endX, endY] = motion.fire[index];
      const aimHeight = index === 3 && (mode === 'aim' || mode === 'staff') ? height * follow : 0;
      return [(restX + (startX - restX) * loading + (endX - startX) * follow * ease + sweep * index * .48 + tilt),
        restY + (startY - restY) * loading + (endY - startY) * follow * ease + aimHeight + crouch];
    };
    const raisedKick = mode === 'kick' ? follow * ease : 0;
    const spread = motion.step * (.54 + follow * .68) + .16;
    return {
      radius, facing, palette, mode, technique, tool: id === 'frieren' ? 'staff'
        : (id === 'thor' && technique === 'lightning' || id === 'captain_america' && technique === 'lightning') ? 'hammer'
        : id === 'loki' && technique === 'sword' ? 'dagger'
        : tools[technique],
      hammerAxe: id === 'thor' && (fighter.formStage === 2 || fighter.formStage === 4),
      board: id === 'silver_surfer', copter: technique === 'copter' || /Take-copter/.test(cast.name || ''),
      spin: cast.age * 45, armored: ['ironman','doctor_doom','captain_america','moon_knight'].includes(id),
      big: id === 'hulk' || id === 'thanos' || (id === 'eren' && fighter.formStage > 0),
      wrist: id === 'spider_man' && mode === 'aim',
      color: cast.color || FighterForms.color(fighter), form: fighter.formStage, follow,
      torso: [[-.67+tilt,.38],[-.43+tilt,.99+crouch],[.53+tilt,1.02+crouch],[.67+tilt,.39]],
      shoulder: [[-.61+tilt,.36],[.53+tilt,.39]],
      elbow: [pair(0, true), pair(2, true)], hands: [pair(1, false), pair(3, false)],
      hips: [[hips[0]-.25,hips[1]],[hips[0]+.24,hips[1]]],
      knees: [[-.43 - spread*.41 - stride,1.28+crouch*.9], [.47 + spread*.43+stride,1.29+crouch*.68-.48*raisedKick]],
      feet: [[-.59-spread*.64-stride*.82,1.68+crouch*.20], [.67+spread*.7+stride*.82,1.66+crouch*.18-1.19*raisedKick]]
    };
  }

  function pose(arena, fighter, radius) {
    const cast = activeMove(arena, fighter);
    return cast ? poseFor(fighter, cast, radius) : null;
  }

  function emitsFromBody(technique) {
    return technique === 'unibeam' || emitted.has(technique);
  }

  function origin(fighter, cast) {
    if (cast.technique === 'unibeam') return { x: fighter.x, y: fighter.y + fighter.radius * .55 };
    if (!emitted.has(cast.technique) || cast.slot !== 'ultimate') return { x: fighter.x, y: fighter.y };
    const pose = poseFor(fighter, cast, fighter.radius);
    const [x, y] = pose.hands[1];
    return { x: fighter.x + x * pose.radius * pose.facing * .87, y: fighter.y + y * pose.radius * .78 };
  }

  function stroke(ctx, points, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.stroke();
  }

  function shape(ctx, points, color, rim, width = .039) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (rim) {
      ctx.strokeStyle = rim;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function ellipse(ctx, x, y, rx, ry, color, rim, angle = 0) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (rim) {
      ctx.strokeStyle = rim;
      ctx.lineWidth = .036;
      ctx.stroke();
    }
  }

  const ink = '#1c1729';

  function drawBack(ctx, rig) {
    const [sleeve, glove, trousers, boots] = rig.palette;
    ctx.save();
    ctx.scale(rig.radius * rig.facing, rig.radius);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (rig.board) {
      ellipse(ctx, .01, 1.78, 1.56, .17, '#4b6d92', ink, -.05);
      ellipse(ctx, .06, 1.71, 1.54, .11, '#d2e5f2', '#80a8c7', -.05);
      stroke(ctx, [[-1.31,1.73],[-.37,1.71],[1.31,1.63]], '#f3f6ee', .025);
    } else {
      ellipse(ctx, .04, 1.81, rig.big ? 1.33 : 1.04, .12, 'rgba(13,12,25,.64)');
    }
    for (let index = 0; index < 2; index++) {
      const width = rig.big ? .35 : .24;
      const foot = rig.feet[index];
      const limb = [rig.hips[index], rig.knees[index], foot];
      stroke(ctx, limb, ink, width + .08);
      stroke(ctx, limb, trousers, width);
      stroke(ctx, [rig.knees[index], foot], boots, width * .68);
      ellipse(ctx, foot[0]+.09, foot[1], width * .88, width * .47, boots, ink, -.08);
      stroke(ctx, [[foot[0]+.09,foot[1]-.035],[foot[0]+.16,foot[1]-.046]], rig.color, .021);
    }
    shape(ctx, rig.torso, sleeve, ink, .063);
    stroke(ctx, [[-.41,.90],[.01,.95],[.45,.91]], rig.armored ? '#e9d5b9' : trousers, .088);
    for (let index = 0; index < 2; index++) {
      const arm = [rig.shoulder[index], rig.elbow[index], rig.hands[index]];
      const width = rig.big ? .35 : .23;
      stroke(ctx, arm, ink, width + .084);
      stroke(ctx, arm, sleeve, width);
      stroke(ctx, arm.slice(1), glove, width * (rig.big ? .84 : .67));
      const [x, y] = rig.elbow[index];
      ellipse(ctx, x, y, width * .20, width * .35, rig.color, null, -.56);
    }
    ctx.restore();
  }

  function equipment(ctx, rig, index) {
    const tool = rig.tool;
    const twin = ['claws','batons','blades'].includes(tool);
    if (!tool || (!twin && index === 0)) return;
    const [x, y] = rig.hands[index];
    const [ex, ey] = rig.elbow[index];
    ctx.save();
    ctx.translate(x, y);
    const swing = Math.atan2(y - ey, x - ex);
    ctx.rotate(tool === 'staff' ? -1.21 + rig.follow * .85 : swing - .22);
    if (tool === 'hammer' || tool === 'staff') {
      const isStaff = tool === 'staff';
      stroke(ctx, [[isStaff ? -.69 : -.25,0],[isStaff ? 1.07 : .64,0]], ink, .15);
      stroke(ctx, [[isStaff ? -.67 : -.23,0],[isStaff ? 1.04 : .62,0]], isStaff ? '#a45c52' : '#906550', .073);
      if (isStaff) {
        ellipse(ctx, 1.05, 0, .18, .16, '#eece9a', ink);
        ellipse(ctx, 1.06, 0, .10, .095, '#d87073', '#ffe2b3');
      } else {
        const head = rig.hammerAxe ? [[.48,-.13],[.72,-.35],[.95,-.34],[.99,.14],[.78,.26],[.48,.13]]
          : [[.45,-.24],[.78,-.24],[.85,-.15],[.85,.17],[.78,.23],[.45,.23]];
        shape(ctx, head, '#9ebad1', ink);
        stroke(ctx, [[.52,-.16],[.74,-.16],[.78,-.08]], '#e0f4ff', .048);
      }
    } else if (tool === 'shield') {
      for (const [r, color] of [[.52,ink],[.47,'#c54159'],[.365,'#e7e0de'],[.29,'#c64159'],[.19,'#486a9d']]) {
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
      for (const lane of [-1,0,1]) {
        const y = lane * .10;
        shape(ctx, [[.04,y-.026],[.53,y-.08],[.73,y-.18],[.57,y+.015],[.06,y+.042]],
          '#d1d9e5', ink, .025);
      }
    } else if (tool === 'crescent') {
      ctx.beginPath();
      ctx.arc(.25, 0, .29, .05, Math.PI * 1.62);
      ctx.quadraticCurveTo(.17, .04, .54, .015);
      ctx.fillStyle = '#e5f4f6';
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = .04;
      ctx.stroke();
    } else if (tool === 'chain') {
      for (let i = 0; i < 6; i++) ellipse(ctx, i * .14, Math.sin(i*.55)*.15, .10, .048, '#543143', '#f6aa6c', i * .13);
    } else {
      const length = tool === 'dagger' ? .49 : tool === 'batons' ? .56 : tool === 'spears' ? 1.2 : .87;
      shape(ctx, [[-.19,-.05],[.12,-.065],[.19,-.10],[length-.05,-.062],[length,.014],[.16,.073],[-.19,.052]],
        tool === 'batons' ? '#727c94' : '#c7e4ed', ink);
      stroke(ctx, [[.23,-.034],[length-.09,-.024]], tool === 'batons' ? '#d59098' : '#f0f7f3', .026);
      stroke(ctx, [[.04,-.095],[.04,.09]], '#ad885a', .043);
    }
    ctx.restore();
  }

  function drawFront(ctx, rig) {
    ctx.save();
    ctx.scale(rig.radius * rig.facing, rig.radius);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (rig.copter) {
      stroke(ctx, [[0,-.95],[0,-1.23]], '#e6ca8b', .08);
      const blade = Math.cos(rig.spin) * .48;
      ellipse(ctx, 0, -1.24, .13 + Math.abs(blade), .055, '#ffd176', ink, blade * .25);
    }
    for (let index = 0; index < 2; index++) {
      const [x, y] = rig.hands[index];
      const [ex, ey] = rig.elbow[index];
      const angle = Math.atan2(y - ey, x - ex);
      const [sleeve, glove] = rig.palette;
      const width = rig.big ? .235 : .155;
      if (rig.big && rig.mode === 'slam') {
        const shoulder = rig.shoulder[index];
        const arm = [[shoulder[0] + (index === 0 ? -.15 : .15), shoulder[1] + .10], [ex, ey], [x, y]];
        stroke(ctx, arm, ink, .37);
        stroke(ctx, arm, sleeve, .295);
        stroke(ctx, arm.slice(1), glove, .229);
        stroke(ctx, [[ex, ey - .055], [x, y - .08]], 'rgba(255,248,222,.33)', .029);
      } else if (index === 1 || rig.mode === 'signs') {
        stroke(ctx, [[ex, ey], [x, y]], ink, width * 1.16);
        stroke(ctx, [[ex, ey], [x, y]], glove, width * .89);
      }
      ellipse(ctx, x, y, width, width * .77, glove, ink, angle);
      if (rig.wrist && index === 1) {
        stroke(ctx, [[x-.07,y+.01],[x+.13,y+.04],[x+.22,y+.09]], glove, .076);
        stroke(ctx, [[x+.016,y-.07],[x+.12,y-.126]], glove, .055);
      } else if (rig.mode === 'signs') {
        stroke(ctx, [[x-.035,y+.04],[x+.05,y-.12],[x+.09,y-.20]], glove, .067);
        stroke(ctx, [[x+.06,y+.055],[x+.13,y-.085]], glove, .054);
      } else stroke(ctx, [[x+.035,y-.041],[x+.112,y-.02]], 'rgba(255,245,229,.69)', .02);
      equipment(ctx, rig, index);
    }
    ctx.restore();
  }

  return { pose, origin, emitsFromBody, drawBack, drawFront };
})();
