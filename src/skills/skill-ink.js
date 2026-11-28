'use strict';

const SkillInk = (() => {
  const outline = '#120f20';
  const white = '#fff5e7';
  const styles = {
    blade: new Set(['claws','hotClaws','sword','dualBlades','nanoBlade','daggers','moonBlade','reverseBlade',
      'odm','cursedSlash','worldSlash','cleave','stinger','ironArms','baton','panel']),
    web: new Set(['web','webArena','webSwing']),
    rope: new Set(['hellChain','mysticBands','tether','tendrils','thread']),
    lightning: new Set(['lightning','widowBite','judradjim']),
    flame: new Set(['divineFlame','flame','hellBreath']),
    heavy: new Set(['stomp','warHammer','hammer','dualHammer','bifrost','titanMarch','dawnFists','giantFist','grapple']),
    air: new Set(['airCannon','door','smallLight']),
    charge: new Set(['repulsor','twinRepulsor','unibeam','photon','twinPhoton','cosmicRay','zoltraak','beam',
      'red','blue','purple','rasengan','rasenshuriken','chakraBomb','powerStone','hexBolt','stones'])
  };

  function kind(technique) {
    for (const [name, techniques] of Object.entries(styles)) {
      if (techniques.has(technique)) return name;
    }
    return 'strike';
  }

  function line(ctx, paths, color, width, alpha = 1, core = white) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const path of paths) {
      if (path.length < 2) continue;
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    }
    traced(ctx, color, width, core);
    ctx.restore();
  }

  function traced(ctx, color, width, core = white, rim = 2) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = width + Math.max(width * .36, rim);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    if (core) {
      ctx.strokeStyle = core;
      ctx.lineWidth = width * .29;
      ctx.stroke();
    }
  }

  function polygon(ctx, points, color, width = 2.8) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (width) {
      ctx.strokeStyle = outline;
      ctx.lineWidth = width;
      ctx.stroke();
    }
  }

  function ribbon(ctx, points, width, shade, alpha = 1, detail = white, unit = 1) {
    if (points.length < 2) return;
    const offsets = points.map((point, i) => {
      const before = points[Math.max(0, i - 1)];
      const after = points[Math.min(points.length - 1, i + 1)];
      const angle = Math.atan2(after.y - before.y, after.x - before.x);
      const t = i / (points.length - 1);
      const reach = width * (.06 + Math.sin(Math.PI * t) * (.61 + t * .52));
      return { point, x: -Math.sin(angle) * reach, y: Math.cos(angle) * reach };
    });
    const edge = (direction) => offsets.map(({ point, x, y }) => [point.x + x * direction, point.y + y * direction]);
    ctx.save();
    ctx.globalAlpha *= alpha;
    polygon(ctx, [...edge(1), ...edge(-.73).reverse()], shade, Math.max(1.2 * unit, width * .21));
    const shine = offsets.slice(1, -1).map(({ point, x, y }) => ({ x: point.x + x * .43, y: point.y + y * .43 }));
    if (shine.length > 1) {
      ctx.strokeStyle = detail;
      ctx.lineWidth = Math.max(1.35 * unit, width * .22);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shine[0].x, shine[0].y);
      for (const p of shine.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function speed(ctx, point, angle, length, spread, color, alpha, count = 4) {
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle);
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const lane = (i - (count - 1) * .5) * spread;
      const head = -Math.abs(lane) * .30;
      const trail = length * (.46 + ((i * 7 + 4) % 11) / 17);
      const width = 1.25 + (i % 3) * .88;
      ctx.beginPath();
      ctx.moveTo(head, lane);
      ctx.lineTo(head - trail * .48, lane - width * .49);
      ctx.lineTo(head - trail, lane - width);
      ctx.lineTo(head - trail * .43, lane + width);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function windup(ctx, from, angle, color, progress, mode, power) {
    const opening = (1 - progress) * (power === 2 ? 38 : 22);
    const width = (power === 2 ? 17 : 11) + opening;
    ctx.save();
    ctx.translate(from.x, from.y);
    ctx.rotate(angle);
    ctx.globalAlpha *= .37 + progress * .54;
    if (mode === 'charge') {
      const size = (power === 2 ? 24 : 17) * (.40 + .60 * progress);
      ctx.beginPath();
      ctx.arc(0, 0, size, .35, Math.PI * 2 - .35);
      traced(ctx, color, power === 2 ? 5.5 : 3.8);
      ctx.fillStyle = '#171628';
      ctx.beginPath();
      ctx.arc(0, 0, size * .53, 0, Math.PI * 2);
      ctx.fill();
      polygon(ctx, [[0,-size*.52],[size*.43,0],[0,size*.52],[-size*.43,0]], white, 1.4);
    } else {
      const height = power === 2 ? 20 : 13;
      for (const sign of [-1, 1]) {
        const y = sign * (height + opening * .4);
        line(ctx, [[{x: -width, y: y * 1.36}, {x: 0, y}, {x: -width * .35, y: y * .60}]],
          color, power === 2 ? 5 : 3.5);
      }
    }
    ctx.restore();
  }

  function launch(ctx, cast) {
    const elapsed = cast.age - cast.charge;
    if (!cast.releaseMark || elapsed < 0 || elapsed > .155) return;
    const t = elapsed / .155;
    const radius = (cast.power === 2 ? 27 : 19) * (.5 + t);
    const alpha = (1 - t) * .88;
    if (cast.contact || cast.kind === 'fist') return;
    const angle = cast.releaseMark.angle;
    const { x, y } = cast.releaseMark;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha *= alpha;
    polygon(ctx, [[-radius * .42,0],[0,-radius*.26],[radius*.24,-radius*.75],[radius*.34,-radius*.16],
      [radius*.84,0],[radius*.29,radius*.16],[radius*.24,radius*.66],[0,radius*.29]], cast.color, 2.4);
    polygon(ctx, [[0,0],[radius*.29,-radius*.19],[radius*.55,0],[radius*.24,radius*.17]], white, 0);
    ctx.restore();
  }

  function impact(arena, caster, target, cast, opts) {
    const source = opts.source || caster || { x: target.x - 1, y: target.y };
    let dx = target.x - source.x;
    let dy = target.y - source.y;
    if (Math.hypot(dx, dy) < 2) {
      dx = Math.cos(cast.aim || 0);
      dy = Math.sin(cast.aim || 0);
    }
    const length = Math.hypot(dx, dy);
    const ux = dx / length;
    const uy = dy / length;
    const mode = kind(cast.technique);
    const strength = (cast.power === 2 ? 1.02 : .67) + (mode === 'heavy' ? .16 : 0) + (cast.form || 0) * .022;
    const point = opts.point || { x: target.x - ux * target.radius * .66, y: target.y - uy * target.radius * .62 };
    const duration = cast.power === 2 ? .35 : .28;
    const entry = { x: point.x, y: point.y, ux, uy, mode, strength, duration,
      start: arena.time, age: cast.age, targetX: target.x, targetY: target.y, targetRadius: target.radius,
      color: opts.color || cast.color || FighterForms.color(target) };
    cast.lastContact = entry;
    if (!target.skillReaction || arena.time - target.skillReaction.start > .11 ||
        target.skillReaction.strength <= strength) target.skillReaction = entry;
    if (arena.skillHits.length >= 18) arena.skillHits.shift();
    arena.skillHits.push(entry);
  }

  function drawImpacts(ctx, arena) {
    for (const hit of arena.skillHits) {
      const t = (arena.time - hit.start) / hit.duration;
      if (t >= 1) continue;
      const { strength, mode, color, ux, uy } = hit;
      const size = (35 + strength * 35) * (.56 + t * .62);
      const angle = Math.atan2(uy, ux);
      ctx.save();
      ctx.translate(hit.x, hit.y);
      ctx.rotate(angle);
      ctx.globalAlpha *= 1 - t * t;
      const points = [];
      const rays = mode === 'blade' ? 5 : mode === 'lightning' ? 7 : 6;
      for (let i = 0; i < rays * 2; i++) {
        const a = i * Math.PI / rays;
        const extent = size * (i % 2 ? .26 : .70 + ((i * 5) % 7) * .065);
        points.push([Math.cos(a) * extent, Math.sin(a) * extent * (mode === 'blade' ? .43 : .78)]);
      }
      if (t < .60) {
        polygon(ctx, points, color, 3);
        ctx.globalAlpha *= 1 - t * 1.25;
        polygon(ctx, points.map(([x, y]) => [x * .55, y * .55]), white, 0);
      }
      ctx.restore();

      speed(ctx, { x: hit.x + ux * (16 + t * size), y: hit.y + uy * (16 + t * size) }, angle,
        size * (mode === 'blade' ? 1.63 : .91), size * .30, color, .90 * (1 - t), rays);
      if (mode === 'heavy' || mode === 'air') {
        const width = 5 + strength * 3;
        ctx.save();
        ctx.translate(hit.x, hit.y + size * .18);
        ctx.rotate(angle);
        ctx.globalAlpha *= .84 * (1 - t);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * (.47 + t), size * (.26 + t * .58), 0, -.95, 1.45);
        traced(ctx, color, width);
        ctx.restore();
      }
    }
  }

  return { kind, line, traced, ribbon, polygon, speed, windup, launch, impact, drawImpacts };
})();
