'use strict';

const SignatureSkills = (() => {
  const TAU = Math.PI * 2;
  const shots = new Set(['volley', 'ricochet', 'stones']);
  const fields = new Set(['shock', 'guard', 'chaos', 'gravity', 'magnet', 'glitch']);
  const ranged = new Set(['web', 'volley', 'ricochet', 'stones', 'beam', 'satellite', 'lightning']);
  const stoneColors = ['#b97fff', '#76caff', '#ff797a', '#86e789', '#ffe28a', '#ffae79'];

  function aim(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  function offset(point, angle, distance) {
    return { x: point.x + Math.cos(angle) * distance, y: point.y + Math.sin(angle) * distance };
  }

  function inside(arena, point, padding) {
    const center = { x: arena.centerX, y: arena.centerY };
    const reach = Math.min(Math.hypot(point.x - center.x, point.y - center.y), arena.arenaRadius - padding);
    return offset(center, aim(center, point), reach);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function segmentDistance(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const width = dx * dx + dy * dy || 1;
    const t = Math.min(1, Math.max(0, ((point.x - start.x) * dx + (point.y - start.y) * dy) / width));
    return Math.hypot(point.x - start.x - dx * t, point.y - start.y - dy * t);
  }

  function curve(start, end, bend) {
    const mid = offset({ x: (start.x + end.x) * .5, y: (start.y + end.y) * .5 }, aim(start, end) + Math.PI / 2, bend);
    return Array.from({ length: 9 }, (_, index) => {
      const t = index / 8;
      return {
        x: (1 - t) ** 2 * start.x + 2 * t * (1 - t) * mid.x + t * t * end.x,
        y: (1 - t) ** 2 * start.y + 2 * t * (1 - t) * mid.y + t * t * end.y
      };
    });
  }

  function leap(fighter, direction, speed) {
    fighter.vx = Math.cos(direction) * speed;
    fighter.vy = Math.sin(direction) * speed;
    fighter.motion.dash = .32;
  }

  function release(arena, fighter, cast) {
    const { action, target, form, power } = cast;
    cast.focus = inside(arena, { x: target.x + target.vx * .12, y: target.y + target.vy * .12 }, 18);
    cast.rays = [];
    cast.nodes = [];
    cast.extraPower = 0;
    cast.width = 12 + form * (power === 2 ? 9 : 5) + power * 6;
    arena.showFighterSkill(fighter, cast.name.toUpperCase(), cast.color);
    if (power === 2) arena.triggerUltimateCinematic(fighter, cast.name.toUpperCase(), cast.color);
    if (cast.contact) {
      ContactSkills.release(arena, fighter, cast);
      return;
    }
    if (cast.spectacle) ArenaUltimates.release(arena, fighter, cast);
    const singleThrow = ['shieldThrow', 'hammerThrow', 'purple', 'chakraBomb'].includes(cast.technique);
    const count = singleThrow ? 1 : action === 'stones' ? Math.min(6, form + 2) : 1 + Math.floor(form * .75) + power;

    if (shots.has(action)) {
      cast.nodes = Array.from({ length: count }, (_, i) => {
        const angle = cast.aim + (i - (count - 1) / 2) * (action === 'ricochet' ? .38 : .16);
        const speed = 1040 + 45 * form;
        return { ...offset(cast.origin, angle, fighter.radius * .35), vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed, color: action === 'stones' ? stoneColors[i] : cast.color,
          bounces: 0, hits: 0 };
      });
    }

    if (action === 'portal' || action === 'glitch') {
      cast.gate = inside(arena, offset(cast.focus, cast.aim + 2.03, 122 + form * 13), fighter.radius + 12);
      Object.assign(fighter, cast.gate);
      leap(fighter, aim(fighter, target), 545 + form * 45);
    } else if (action === 'dash' || action === 'claw' || (action === 'flame' && fighter.char.id === 'ghost_rider')) {
      leap(fighter, cast.aim, 915 + form * 72 + power * 80);
    } else if (action === 'web') {
      const anchorAngle = aim({ x: arena.centerX, y: arena.centerY }, fighter) + (fighter.side ? .42 : -.42);
      cast.anchor = offset({ x: arena.centerX, y: arena.centerY }, anchorAngle, arena.arenaRadius - 8);
      leap(fighter, aim(fighter, cast.anchor) + (fighter.side ? -.83 : .83), 720 + form * 43);
    } else if (action === 'guard') {
      fighter.guardTimer = Math.max(fighter.guardTimer, .72 + form * .12);
      cast.extraPower = Math.min(2, (fighter.custom.kinetic || 0) * .32);
      fighter.custom.kinetic = 0;
    }

    cast.last = { x: fighter.x, y: fighter.y };
    cast.contactRadius = 35 + form * 7 + power * 8;
    if (action === 'lightning') arena.triggerFlash(cast.color, .11 + form * .018);
  }

  function impact(arena, fighter, cast, part = 1, color = cast.color) {
    const target = cast.target;
    const ultimate = cast.slot === 'ultimate';
    const attack = (ultimate ? 6.2 + cast.form * 1.85 : 2.0 + cast.power * .83 + cast.form * .55) * part + cast.extraPower;
    const isArea = cast.action === 'webArena' || cast.action === 'titanMarch' || cast.action === 'nova';
    const result = arena.applyDamage(fighter, target, attack, { color, isRanged: !cast.contact && !isArea && ranged.has(cast.action), isCrit: ultimate && cast.form === 4, size: ultimate ? 36 + cast.form * 3 : 28 });
    if (!result.amount || result.blocked) return;

    fighter.char.skills.passive?.(fighter, target, arena, 'onHitSuccess', result);
    if (cast.technique === 'smallLight') target.shrinkTimer = .8 + cast.power * .34;
    const direction = aim(fighter, target);
    const pull = ['tether', 'web', 'webArena'].includes(cast.action);
    const impulse = pull ? -155 - cast.form * 22 : 105 + cast.power * 28 + (ultimate ? cast.form * 42 : 0);
    target.vx += Math.cos(direction) * impulse;
    target.vy += Math.sin(direction) * impulse;
    if (pull || cast.action === 'stones') target.domainSlowTimer = Math.max(target.domainSlowTimer, .16 + cast.form * .035);
    arena.spawnRing(target.x, target.y, 14, 64 + cast.form * 15 + cast.power * 12, color, .31);
    arena.spawnParticles(target.x, target.y, color, 9 + cast.form * 2, 280 + cast.power * 90);
    arena.addShake(4 + cast.form + cast.power * 2);
  }

  function moveShots(arena, fighter, cast, dt) {
    const center = { x: arena.centerX, y: arena.centerY };
    const border = arena.arenaRadius - 11;
    for (const shot of cast.nodes) {
      if (shot.done) continue;
      const before = { x: shot.x, y: shot.y };
      if (fighter.char.id === 'scarlet_witch' && cast.form >= 2) {
        const angle = aim(shot, cast.target);
        const turn = Math.min(1, dt * 3.6);
        shot.vx += (Math.cos(angle) * 1060 - shot.vx) * turn;
        shot.vy += (Math.sin(angle) * 1060 - shot.vy) * turn;
      }
      if (['shieldThrow', 'hammerThrow'].includes(cast.technique) &&
          (shot.hits || shot.returning || cast.age - cast.charge > .55)) {
        shot.returning = true;
        const angle = aim(shot, fighter);
        shot.vx = Math.cos(angle) * 1310;
        shot.vy = Math.sin(angle) * 1310;
        if (distance(shot, fighter) <= fighter.radius + 14) {
          shot.done = true;
          continue;
        }
      }
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      if (!shot.hits && segmentDistance(cast.target, before, shot) <= cast.target.radius + 15 + cast.form * 2) {
        shot.hits++;
        impact(arena, fighter, cast, 1 / Math.sqrt(cast.nodes.length), shot.color);
        if (cast.action !== 'ricochet') shot.done = true;
      }
      if (distance(shot, center) < border) continue;
      if (cast.action !== 'ricochet' || shot.bounces >= 1 + cast.form) {
        shot.done = true;
        continue;
      }
      const angle = aim(center, shot);
      Object.assign(shot, offset(center, angle, border - 1));
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);
      const dot = shot.vx * nx + shot.vy * ny;
      shot.vx -= 2 * dot * nx;
      shot.vy -= 2 * dot * ny;
      shot.bounces++;
      arena.spawnRing(shot.x, shot.y, 8, 52, cast.color, .26);
    }
  }

  function moveField(arena, fighter, cast, progress, dt) {
    const action = cast.action;
    const air = cast.technique === 'airCannon';
    const rangedRed = cast.technique === 'red';
    const local = cast.technique === 'penance';
    const orient = local ? fighter : air || rangedRed ? offset(cast.origin, cast.aim, progress * (air ? 480 : 515))
      : action === 'shock' || action === 'guard' ? cast.origin : cast.focus;
    const reach = local ? fighter.radius + 64 + cast.form * 10 : air || rangedRed ? 38 + cast.form * 10 + progress * 62 : (action === 'shock' || action === 'guard' ? 44 + 255 * Math.sqrt(progress) : 110 + 95 * progress)
      + cast.form * 24 + cast.power * 31;
    cast.field = { ...orient, reach };
    const target = cast.target;
    const near = distance(orient, target);
    if (near <= reach + target.radius && (action === 'gravity' || action === 'magnet' || action === 'chaos')) {
      const angle = aim(target, orient) + (action === 'chaos' ? (fighter.side ? -.95 : .95) : 0);
      const force = (235 + cast.form * 120) * dt;
      target.vx += Math.cos(angle) * force;
      target.vy += Math.sin(angle) * force;
    }

    const offensive = action !== 'guard' || cast.technique === 'kinetic';
    if (offensive && canPulse(cast, progress) && near <= reach + target.radius) {
      if (action === 'chaos') target.domainSlowTimer = Math.max(target.domainSlowTimer, .28 + cast.form * .05);
      pulse(arena, fighter, cast);
    }

    if (action === 'magnet') {
      for (const projectile of arena.projectiles) {
        if (projectile.owner !== fighter) bendProjectile(projectile, orient, reach, dt);
      }
      if (shots.has(target.skillCast?.action)) {
        for (const projectile of target.skillCast.nodes || []) bendProjectile(projectile, orient, reach, dt);
      }
    }
  }

  function canPulse(cast, progress) {
    const count = cast.slot === 'ultimate' && cast.form >= 3 ? 3 : 1;
    return (cast.pulses || 0) < count && progress >= .12 + (cast.pulses || 0) * .25;
  }

  function pulse(arena, fighter, cast) {
    cast.pulses = (cast.pulses || 0) + 1;
    const split = cast.slot === 'ultimate' && cast.form >= 3 ? .43 : 1;
    impact(arena, fighter, cast, split);
  }

  function bendProjectile(projectile, center, reach, dt) {
    if (projectile.done || distance(projectile, center) > reach) return;
    const angle = aim(projectile, center) + Math.PI / 2;
    projectile.vx += Math.cos(angle) * dt * 730;
    projectile.vy += Math.sin(angle) * dt * 730;
  }

  function buildPaths(arena, fighter, cast, progress) {
    const { action, target, form, power, origin, focus } = cast;
    const open = Math.min(1, progress * 3.9);
    const angle = aim(fighter, focus);
    if (action === 'beam') {
      const count = ['zoltraak', 'cursedSlash'].includes(cast.technique) && power === 2 ? 2 + form : 1;
      const length = cast.technique === 'widowBite' ? 150 + form * 17 + power * 25 : 670 + power * 78;
      return Array.from({ length: count }, (_, index) => {
        const direction = cast.aim + (index - (count - 1) / 2) * .14;
        const end = offset(origin, direction, length * open);
        if (cast.technique === 'cursedSlash') return curve(origin, end, (index % 2 ? 1 : -1) * (44 + form * 12) * open);
        if (cast.technique === 'widowBite') {
          return Array.from({ length: 7 }, (_, i) =>
            offset(offset(origin, direction, length * open * i / 6), direction + Math.PI / 2, i % 6 ? (i % 2 ? -1 : 1) * 6 : 0));
        }
        return [origin, end];
      });
    }
    if (action === 'web' || action === 'tether') {
      const source = action === 'web' && power === 2 ? origin : offset(fighter, angle + .38, fighter.radius * .75);
      const end = offset(source, aim(source, focus), distance(source, focus) * open);
      const count = 1 + (form >= 2 ? 2 : 0) + Number(power === 2);
      return Array.from({ length: count }, (_, i) => curve(source, offset(end, angle + Math.PI / 2, (i ? i * 10 : 0)), (i % 2 ? -1 : 1) * (i + form * .5) * 37 * open));
    }
    if (action === 'portal') {
      if (cast.technique === 'door' && power < 2) return [];
      return [curve(cast.gate, offset(cast.gate, aim(cast.gate, focus),
        Math.min(cast.technique === 'door' ? 220 : 265, distance(cast.gate, focus)) * open), 18)];
    }
    if (action === 'lightning') {
      const count = 1 + Math.ceil(form * .6) + Number(power === 2);
      return Array.from({ length: count }, (_, i) => {
        const hit = offset(focus, i * 1.6, i * 32);
        const start = offset(hit, -Math.PI / 2 - i * .15, 190 + i * 22);
        const end = offset(start, aim(start, hit), distance(start, hit) * open);
        return Array.from({ length: 7 }, (_, j) => {
          const t = j / 6;
          const bend = (j === 0 || j === 6 ? 0 : Math.sin(j * 4.2 + cast.age * 42) * 15);
          return { x: start.x + (end.x - start.x) * t + bend, y: start.y + (end.y - start.y) * t };
        });
      });
    }
    if (action === 'orbit' || action === 'satellite' || action === 'clone') {
      const count = 1 + Math.ceil(form * .64) + power;
      cast.nodes = Array.from({ length: count }, (_, i) => {
        const center = action === 'satellite' ? { x: arena.centerX, y: arena.centerY } : fighter;
        const reach = action === 'satellite' ? arena.arenaRadius * .66 : fighter.radius + 30 + form * 13 + (action === 'clone' ? 56 * open : 0);
        return offset(center, i * TAU / count + cast.age * (action === 'orbit' ? 5 : 2) * (fighter.side ? -1 : 1), reach);
      });
      if (action === 'orbit') return cast.nodes.map(node => [node, offset(node, aim(node, target), open * (35 + form * 17))]);
      if (action === 'clone') {
        const reach = cast.technique === 'ninjaClone' ? 125 + form * 38 : 37 + form * 9;
        cast.nodes = cast.nodes.map(node => offset(node, aim(node, target), open * Math.min(reach, distance(node, target))));
        return cast.nodes.map(node => [node, offset(node, aim(node, target), 28 + form * 4)]);
      }
      return cast.nodes.map(node => curve(node, offset(node, aim(node, focus), distance(node, focus) * open), 0));
    }
    if (action === 'flame' && fighter.char.id === 'frieren') {
      return [-1, 0, 1].map(lane => curve(origin, offset(origin, cast.aim + lane * .22,
        open * (310 + form * 49 + power * 43)), lane * 28));
    }
    if (action === 'flame') return [fighter.trail.slice(-(5 + form * 2)).concat([{ x: fighter.x, y: fighter.y }, offset(fighter, angle, open * (77 + form * 29))])];

    const heading = action === 'claw' ? aim(fighter, target) : cast.aim;
    const end = offset(fighter, heading, open * (77 + form * 22 + power * 19));
    const start = cast.last;
    cast.last = { x: fighter.x, y: fighter.y };
    if (action !== 'claw') return [[start, end]];
    return [-1, 0, 1].map(side => curve(offset(start, heading + Math.PI / 2, side * 22), offset(end, heading + Math.PI / 2, side * 38), side * 18));
  }

  function advance(arena, fighter, cast, progress, dt) {
    if (cast.contact) {
      ContactSkills.advance(arena, fighter, cast, progress, dt, part => impact(arena, fighter, cast, part));
      return;
    }
    if (cast.power === 2 && UltimateAnimator.emitsFromBody(cast.technique)) {
      cast.origin = UltimateAnimator.origin(fighter, cast);
      cast.aim = aim(cast.origin, cast.focus);
    }
    if (cast.spectacle) {
      ArenaUltimates.advance(arena, fighter, cast, progress, dt, part => impact(arena, fighter, cast, part));
      return;
    }

    if (shots.has(cast.action)) {
      moveShots(arena, fighter, cast, dt);
      return;
    }
    if (fields.has(cast.action)) {
      moveField(arena, fighter, cast, progress, dt);
      return;
    }

    cast.rays = buildPaths(arena, fighter, cast, progress);
    if (!canPulse(cast, progress)) return;
    const hit = cast.rays.some(path => path.some((point, index) =>
      index > 0 && segmentDistance(cast.target, path[index - 1], point) <= cast.target.radius + cast.contactRadius * .45
    ));
    if (hit) pulse(arena, fighter, cast);
  }

  function strokePaths(ctx, paths) {
    ctx.beginPath();
    for (const path of paths) {
      if (!path.length) continue;
      ctx.moveTo(path[0].x, path[0].y);
      for (const point of path.slice(1)) ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }

  function circle(ctx, center, radius) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, TAU);
  }

  function drawField(ctx, cast, progress, alpha) {
    const { field, color, action } = cast;
    if (cast.technique === 'airCannon') {
      ctx.save();
      ctx.translate(field.x, field.y);
      ctx.rotate(cast.aim);
      ctx.strokeStyle = '#def5ff';
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = alpha * (.72 - .13 * i) * (1 - progress * .55);
        ctx.lineWidth = 4.8 - i * .65;
        ctx.beginPath();
        ctx.ellipse(-i * 22, 0, field.reach * .29, field.reach * (1 - i * .16), 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    ctx.globalAlpha = alpha * .18;
    const glow = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, field.reach);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'transparent');
    circle(ctx, field, field.reach);
    ctx.fillStyle = glow;
    ctx.fill();

    const count = action === 'gravity' || action === 'chaos' || action === 'magnet' ? 5 : 3;
    for (let i = 0; i < count; i++) {
      ctx.globalAlpha = alpha * (.65 - i * .07);
      ctx.lineWidth = (i === 0 ? 4.5 : 2.1) * (1 - progress * .35);
      const radius = field.reach * (1 - i * .153);
      if (action === 'glitch') {
        ctx.strokeRect(field.x - radius, field.y - radius * .5, radius * 2, radius);
      } else {
        ctx.beginPath();
        const start = cast.age * (i % 2 ? -4 : 4) + i;
        ctx.arc(field.x, field.y, radius, start, start + (action === 'shock' ? TAU : Math.PI * 1.54));
        ctx.stroke();
      }
    }
    if (action === 'glitch') {
      ctx.globalAlpha = alpha * .82;
      ctx.font = '900 19px Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff0f5';
      ctx.fillText('PANEL BREAK', field.x - field.reach * .58, field.y - field.reach * .49);
    }
  }

  function drawShot(ctx, shot, cast, radius) {
    const { technique } = cast;
    const direction = Math.atan2(shot.vy, shot.vx);
    ctx.save();
    ctx.translate(shot.x, shot.y);
    ctx.rotate(direction + (cast.action === 'ricochet' ? cast.age * 18 : 0));
    ctx.fillStyle = shot.color;
    ctx.strokeStyle = '#fff8ef';
    ctx.lineWidth = 2.3;
    if (technique === 'shieldThrow') {
      for (const [size, color] of [[1.43, '#e65763'], [1.12, '#d7e6ee'], [.87, '#df4b5e'], [.57, '#436897']]) {
        circle(ctx, { x: 0, y: 0 }, radius * size);
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.stroke();
    } else if (technique === 'hammerThrow') {
      ctx.fillStyle = '#c6d8eb';
      ctx.fillRect(-radius, -radius * 1.15, radius * 1.3, radius * 1.3);
      ctx.strokeRect(-radius, -radius * 1.15, radius * 1.3, radius * 1.3);
      ctx.fillStyle = '#9c694f';
      ctx.fillRect(-radius * .55, radius * .02, radius * .36, radius * 1.5);
    } else if (technique === 'crescent') {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.35, .05, Math.PI * 1.66);
      ctx.quadraticCurveTo(-.44 * radius, .30 * radius, radius * 1.35, .05 * radius);
      ctx.fill();
      ctx.stroke();
    } else if (['metalShards', 'thunderSpears', 'missile', 'frost'].includes(technique)) {
      ctx.beginPath();
      ctx.moveTo(radius * 1.55, 0);
      ctx.lineTo(-radius * .83, -radius * .42);
      ctx.lineTo(-radius * .46, radius * .46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (technique === 'purple' || technique === 'chakraBomb') {
      const size = radius * (technique === 'purple' ? 1.58 : 1.32);
      const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, size);
      glow.addColorStop(0, technique === 'purple' ? '#fff2ff' : '#211527');
      glow.addColorStop(.58, technique === 'purple' ? '#b961f4' : '#3f2055');
      glow.addColorStop(1, 'transparent');
      circle(ctx, { x: 0, y: 0 }, size);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.rotate(cast.age * 9);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * .89, size * .69, 0, 0, TAU);
      ctx.strokeStyle = '#ddbeff';
      ctx.stroke();
    } else if (technique === 'rasenshuriken') {
      ctx.rotate(cast.age * 22);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = i * Math.PI / 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius * 1.9, Math.sin(angle) * radius * 1.9);
        ctx.lineTo(Math.cos(angle + .54) * radius * .85, Math.sin(angle + .54) * radius * .85);
      }
      ctx.fill();
      ctx.stroke();
      circle(ctx, { x: 0, y: 0 }, radius * .38);
      ctx.stroke();
    } else {
      circle(ctx, { x: 0, y: 0 }, radius);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawChain(ctx, cast, alpha) {
    ctx.globalAlpha = alpha * .88;
    ctx.strokeStyle = '#fff0c2';
    ctx.lineWidth = 2.6;
    for (const path of cast.rays) {
      for (let index = 1; index < path.length; index++) {
        const from = path[index - 1];
        const to = path[index];
        const span = distance(from, to);
        const count = Math.ceil(span / 16);
        for (let i = 0; i < count; i++) {
          const point = offset(from, aim(from, to), span * (i + .5) / count);
          ctx.beginPath();
          ctx.ellipse(point.x, point.y, 9, i % 2 ? 3.4 : 5.7, aim(from, to), 0, TAU);
          ctx.stroke();
        }
      }
    }
  }

  function draw(ctx, fighter, cast, progress, alpha) {
    if (cast.contact) {
      ContactSkills.draw(ctx, fighter, cast, progress, alpha);
      return;
    }
    if (cast.spectacle) {
      ArenaUltimates.draw(ctx, fighter, cast, alpha);
      return;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = cast.color;
    if (cast.field) drawField(ctx, cast, progress, alpha);

    if (shots.has(cast.action)) {
      for (const node of cast.nodes) {
        if (node.done) continue;
        ctx.globalAlpha = alpha * .83;
        ctx.strokeStyle = node.color;
        const radius = 10 + cast.power * 3 + cast.form * 2;
        const tail = { x: node.x - node.vx * .052, y: node.y - node.vy * .052 };
        ctx.lineWidth = radius * .55;
        strokePaths(ctx, [[tail, node]]);
        drawShot(ctx, node, cast, radius);
      }
      return;
    }

    if (cast.anchor) {
      ctx.globalAlpha = alpha * .53;
      ctx.lineWidth = 2.7;
      strokePaths(ctx, [curve(fighter, cast.anchor, 17)]);
      circle(ctx, cast.anchor, 8 + 2 * cast.form);
      ctx.stroke();
    }
    if (cast.gate) {
      ctx.globalAlpha = alpha * .69;
      ctx.lineWidth = 3 + cast.form * .8;
      for (const point of [cast.origin, cast.gate]) {
        ctx.beginPath();
        if (cast.technique === 'door') {
          ctx.strokeStyle = '#ffa2d4';
          ctx.fillStyle = '#c956a0';
          ctx.roundRect(point.x - 24, point.y - 54, 48, 108, 3);
          ctx.fill();
          ctx.stroke();
          circle(ctx, { x: point.x + 13, y: point.y + 6 }, 3);
          ctx.stroke();
        } else ctx.ellipse(point.x, point.y, 34 + cast.form * 6, 52 + cast.form * 7, cast.aim, 0, TAU);
        ctx.stroke();
      }
    }
    if (cast.rays.length && cast.action !== 'clone') {
      if (cast.technique === 'cursedSlash') {
        ctx.globalAlpha = alpha * .9;
        ctx.strokeStyle = '#fff1f4';
        ctx.lineWidth = 2.7 + cast.form * .4;
        strokePaths(ctx, cast.rays);
        return;
      }
      if (cast.technique === 'hellChain') {
        drawChain(ctx, cast, alpha);
        return;
      }
      if (cast.technique === 'door') {
        const tip = cast.rays[0].at(-1);
        drawField(ctx, { ...cast, technique: 'airCannon', field: { ...tip, reach: 68 + cast.form * 7 } }, progress, alpha);
        return;
      }
      const thin = ['web', 'widowBite', 'smallLight'].includes(cast.technique);
      ctx.globalAlpha = alpha * .23;
      ctx.lineWidth = cast.width * (thin ? .48 : 1);
      strokePaths(ctx, cast.rays);
      ctx.globalAlpha = alpha * .83;
      ctx.lineWidth *= .47;
      strokePaths(ctx, cast.rays);
      ctx.strokeStyle = '#fff2ed';
      ctx.globalAlpha = alpha * .67;
      ctx.lineWidth = thin ? 1.4 : 2.5;
      strokePaths(ctx, cast.rays);
    }
    for (const node of cast.nodes) {
      if (cast.action === 'clone') {
        ctx.globalAlpha = alpha * .37;
        FighterPortraits.draw(ctx, fighter.char.id, node.x, node.y, fighter.radius * .63,
          { form: cast.form, pose: 'attack', wind: 0, color: cast.color, time: cast.age, compact: true });
      } else {
        ctx.strokeStyle = cast.color;
        ctx.globalAlpha = alpha * .76;
        circle(ctx, node, 7 + cast.form * 2);
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }

  return { release, advance, draw };
})();
