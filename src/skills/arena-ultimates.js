'use strict';

const ArenaUltimates = (() => {
  const turn = Math.PI * 2;
  const types = new Set(['webArena', 'titanMarch', 'dawnFists', 'moonClaws', 'nova']);

  function vec(origin, angle, reach) {
    return { x: origin.x + Math.cos(angle) * reach, y: origin.y + Math.sin(angle) * reach };
  }

  function angle(from, to) { return Math.atan2(to.y - from.y, to.x - from.x); }
  function distance(from, to) { return Math.hypot(to.x - from.x, to.y - from.y); }
  function mix(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }

  function webMesh(arena, source, strength) {
    const center = { x: arena.centerX, y: arena.centerY };
    const count = 14;
    const spokes = Array.from({ length: count }, (_, i) => ArenaBounds.wallAt(arena, i * turn / count - .13, 9));
    const rings = [0.20, .37, .54, .72, .89, 1].map(scale =>
      spokes.map(edge => mix(center, edge, strength * scale))
    );
    const paths = rings.map(ring => [...ring, ring[0]]);
    for (let i = 0; i < count; i++) {
      paths.push([center, ...rings.map(ring => ring[i])]);
      if (i % 2 === 0) paths.push([source, rings[5][i]]);
    }
    return paths;
  }

  function release(arena, fighter, cast) {
    cast.spectacle = { hits: 0, paths: [], fists: [], titans: [], phase: 0 };
    if (cast.action !== 'webArena') return;
    const center = { x: arena.centerX, y: arena.centerY };
    const wall = ArenaBounds.wallAt(arena, angle(center, fighter) + (fighter.side ? -.42 : .42), 12);
    cast.anchor = wall;
  }

  function strike(arena, fighter, cast, progress, strikeTarget, canHit) {
    const scene = cast.spectacle;
    const nextBeat = scene.hits;
    const giant = cast.action === 'dawnFists' && cast.technique !== 'elasticFlurry';
    const beatCount = giant ? 1 : cast.action === 'dawnFists' ? 4 : 3;
    if (nextBeat === beatCount || progress < (giant ? .43 : .19 + nextBeat * .22)) return;

    scene.hits++;
    if (!canHit) return;
    strikeTarget(1 / (beatCount * .8));
    const target = cast.target;
    arena.spawnParticles(target.x, target.y, cast.color, 5 + cast.form, 215 + cast.form * 25);
  }

  function advance(arena, fighter, cast, progress, dt, strikeTarget) {
    const scene = cast.spectacle;
    const { action, target, form, origin, focus, power } = cast;
    const center = { x: arena.centerX, y: arena.centerY };
    const flow = Math.min(1, progress * 3.8);
    scene.phase = progress;
    let canHit = false;

    if (action === 'webArena') {
      scene.paths = webMesh(arena, cast.origin, flow);
      canHit = ArenaBounds.contains(arena, target, arena.arenaHalfSize * (1 - flow) - target.radius);
      if (canHit) {
        const pull = angle(target, center);
        target.vx += Math.cos(pull) * 610 * dt;
        target.vy += Math.sin(pull) * 610 * dt;
        target.domainSlowTimer = Math.max(target.domainSlowTimer, .09);
      }
    } else if (action === 'dawnFists') {
      const giant = cast.technique !== 'elasticFlurry';
      const dawn = form === 4;
      const direction = angle(fighter, target);
      const count = giant ? 1 : 4 + Number(form >= 3);
      const reach = giant ? 430 + form * 49 : 380 + form * 37;
      scene.fists = Array.from({ length: count }, (_, i) => {
        const lane = (i - (count - 1) * .5);
        const shoulder = UltimateAnimator.origin(arena, fighter, cast, lane > 0 ? 0 : 1);
        const phase = (progress * 3.75 + i / count) % 1;
        const punch = giant ? Math.min(1, progress * 2.45) * (1 - Math.max(0, progress - .64) / .40)
          : Math.sin(phase * Math.PI) ** .68;
        const palm = Math.min(reach, distance(shoulder, target) + form * 14 + power * 7);
        const bent = direction + lane * (dawn ? .235 : .135);
        return { shoulder, tip: vec(shoulder, bent, palm * punch), angle: bent, punch, dawn, lane, giant };
      });
      canHit = scene.fists.some(fist => distance(fist.tip, target) <= target.radius + (giant ? 88 : 54));
    } else if (action === 'titanMarch') {
      const count = 3 + form;
      const dir = angle(origin, focus);
      const spacing = 125;
      scene.titans = Array.from({ length: count }, (_, i) => {
        const lane = i - (count - 1) * .5;
        const base = vec(vec(center, dir, -arena.arenaHalfSize * .9 + flow * arena.arenaHalfSize * 1.06), dir + Math.PI / 2, lane * spacing);
        return { ...base, stride: progress * 15 + i * .7, radius: 42 + form * 10 - Math.abs(lane) * 3 };
      });
      scene.field = { ...center, reach: arena.arenaHalfSize * (.17 + .79 * flow) };
      canHit = flow > .51 && distance(center, target) < scene.field.reach + target.radius;
    } else if (action === 'moonClaws') {
      const count = 3 + form;
      scene.paths = Array.from({ length: count }, (_, index) => {
        const dir = index * turn / count + progress * 3.5;
        const reach = (132 + form * 50 + power * 28) * (.45 + flow * .55);
        const hub = vec(fighter, dir, reach * .52);
        return Array.from({ length: 10 }, (_, point) => vec(hub, dir + point / 9 * Math.PI * 1.25, reach * .61));
      });
      canHit = distance(fighter, target) < 116 + form * 53 + power * 35 + target.radius;
    } else {
      scene.field = { ...focus, reach: (170 + form * 45 + power * 35) * (.16 + flow * .84) };
      canHit = distance(scene.field, target) <= scene.field.reach + target.radius;
    }

    strike(arena, fighter, cast, progress, strikeTarget, canHit);
  }



  function paintFist(ctx, cast, fighter, fist, alpha) {
    const { shoulder, tip, angle, punch, dawn, lane, giant } = fist;
    const size = (fighter.radius * (dawn ? .62 : .75) + cast.form * 6 + cast.power * 12) * (.68 + punch * .32) * (giant ? 1.76 : .82);
    const reach = distance(shoulder, tip);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = alpha * (.70 + punch * .30);
    const boundman = cast.form === 3;
    ctx.strokeStyle = dawn ? '#412d55' : '#302033';
    ctx.lineWidth = size * 1.03;
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    const bend = vec(mix(shoulder, tip, .50), angle + (lane >= 0 ? 1.57 : -1.57), dawn ? Math.min(100, reach * .23) : 21);
    ctx.quadraticCurveTo(bend.x, bend.y, tip.x, tip.y);
    ctx.stroke();
    ctx.strokeStyle = dawn ? '#efe1ff' : boundman ? '#75344d' : '#d78c65';
    ctx.lineWidth *= .76;
    ctx.stroke();
    ctx.strokeStyle = dawn ? '#fff8e4' : boundman ? '#f59587' : '#ffdda6';
    ctx.lineWidth *= .13;
    ctx.stroke();
    if (punch > .26) SkillInk.speed(ctx, tip, angle, size * 1.5, size * .53, '#fff4d6', .64, 5);

    ctx.translate(tip.x, tip.y);
    ctx.rotate(angle);
    ctx.scale(size, size);
    const glow = ctx.createLinearGradient(-.8, -.7, .9, .67);
    glow.addColorStop(0, dawn ? '#fff4ec' : boundman ? '#ec9582' : '#ffe0ad');
    glow.addColorStop(.58, dawn ? '#ecd1ff' : boundman ? '#8d405c' : '#e0a178');
    glow.addColorStop(1, dawn ? '#a689d0' : boundman ? '#3d233a' : '#8d4d59');
    ctx.beginPath();
    ctx.moveTo(-.74, -.42);
    ctx.quadraticCurveTo(-.52, -.86, -.13, -.71);
    ctx.bezierCurveTo(.09, -1.01, .36, -.93, .43, -.76);
    ctx.bezierCurveTo(.69, -.88, .95, -.62, .98, -.26);
    ctx.bezierCurveTo(1.10, .21, .82, .70, .50, .77);
    ctx.quadraticCurveTo(-.17, .96, -.68, .47);
    ctx.closePath();
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.strokeStyle = dawn ? '#382748' : '#322232';
    ctx.lineWidth = .13;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(.035, -.60);
    ctx.quadraticCurveTo(.27, -.58, .34, -.37);
    ctx.moveTo(.46, -.59);
    ctx.quadraticCurveTo(.64, -.53, .65, -.31);
    ctx.moveTo(-.38, .27);
    ctx.quadraticCurveTo(.18, .39, .46, .12);
    ctx.lineWidth = .067;
    ctx.stroke();
    ctx.restore();
  }

  function paintTitan(ctx, unit, color, alpha) {
    ctx.save();
    ctx.translate(unit.x, unit.y);
    ctx.scale(unit.radius, unit.radius);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#28232f';
    ctx.strokeStyle = color;
    ctx.lineWidth = .061;
    ctx.beginPath();
    ctx.moveTo(-.91, 1.02);
    ctx.lineTo(-.8, .18);
    ctx.lineTo(-.49, -.21);
    ctx.lineTo(-.36, -.77);
    ctx.lineTo(-.52, -1);
    ctx.quadraticCurveTo(-.59, -1.57, 0, -1.64);
    ctx.quadraticCurveTo(.55, -1.6, .53, -1.04);
    ctx.lineTo(.34, -.68);
    ctx.lineTo(.49, -.20);
    ctx.lineTo(.80, .18);
    ctx.lineTo(.91, 1.02);
    ctx.lineTo(.43, .78);
    ctx.lineTo(.19 + Math.sin(unit.stride) * .12, 1.71);
    ctx.lineTo(-.09 + Math.sin(unit.stride) * .12, 1.71);
    ctx.lineTo(-.26, .92);
    ctx.lineTo(-.56, .78);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ffe8c4';
    ctx.lineWidth = .08;
    ctx.beginPath();
    ctx.moveTo(-.32, -1.14);
    ctx.lineTo(-.12, -1.10);
    ctx.moveTo(.12, -1.10);
    ctx.lineTo(.32, -1.14);
    ctx.stroke();
    ctx.restore();
  }

  function drawField(ctx, cast, field, alpha) {
    const spread = field.reach;
    const color = cast.color;
    const tint = ctx.createRadialGradient(field.x, field.y, 2, field.x, field.y, spread);
    tint.addColorStop(0, '#fff6df');
    tint.addColorStop(.26, color);
    tint.addColorStop(1, 'transparent');
    ctx.globalAlpha = alpha * .21;
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.arc(field.x, field.y, spread, 0, turn);
    ctx.fill();
    const phase = cast.spectacle.phase;
    ctx.globalAlpha = alpha * .74;
    for (let i = 0; i < 4; i++) {
      const start = phase * (i % 2 ? 6 : -4) + i * 1.61;
      const radius = spread * (.73 + i * .076);
      ctx.beginPath();
      ctx.arc(field.x, field.y, radius, start, start + 1.05 + i * .29);
      SkillInk.traced(ctx, color, i % 2 ? 4.2 : 5.6);
    }
    ctx.globalAlpha = 1;
  }

  function draw(ctx, fighter, cast, alpha, background = false) {
    const state = cast.spectacle;
    const connected = cast.action === 'dawnFists' && cast.lastContact && cast.age - cast.lastContact.age < .34;
    const behind = connected || cast.action === 'webArena' || cast.action === 'titanMarch' || cast.action === 'nova';
    if (!state || alpha < .01 || behind !== background) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (state.field?.reach > 0) drawField(ctx, cast, state.field, alpha);
    if (state.paths.length) {
      const web = cast.action === 'webArena';
      if (web) SkillInk.line(ctx, state.paths, '#c7e9ff', 4.3, alpha * .69, '#ffffff');
      else for (const path of state.paths) SkillInk.ribbon(ctx, path, 12 + cast.form * 2, cast.color, alpha * .89);
    }
    for (const titan of state.titans) paintTitan(ctx, titan, cast.color, alpha * .86);
    for (const fist of state.fists) paintFist(ctx, cast, fighter, fist, alpha);
    ctx.restore();
  }

  return { handles: action => types.has(action), release, advance, draw };
})();
