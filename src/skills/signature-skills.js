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
    return ArenaBounds.confine(arena, point, padding);
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
    if (ComicSkills.handles(cast.technique)) {
      ComicSkills.release(arena,fighter,cast);
      return;
    }
    if (cast.contact) {
      ContactSkills.release(arena, fighter, cast);
      return;
    }
    if (cast.spectacle) ArenaUltimates.release(arena, fighter, cast);
    const singleThrow = ['shieldThrow','hammerThrow','purple','chakraBomb','divineFlame','trickShot'].includes(cast.technique);
    const count = singleThrow ? 1 : action === 'stones' ? Math.min(6, form + 2) : 1 + Math.floor(form * .75) + power;

    if (shots.has(action)) {
      cast.nodes = Array.from({ length: count }, (_, i) => {
        const angle = cast.aim + (i - (count - 1) / 2) * (action === 'ricochet' ? .38 : .16);
        const speed = (cast.technique === 'divineFlame' ? 790 : cast.technique === 'trickShot' ? 1490 : 1040) + 45 * form;
        return { ...offset(cast.origin, angle, fighter.radius * .35), vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed, color: action === 'stones' ? stoneColors[i] : cast.color,
          bounces: 0, hits: 0 };
      });
    }

    if (action === 'portal' || action === 'glitch') {
      cast.gate = inside(arena, offset(cast.focus, cast.aim + 2.03, 122 + form * 13), fighter.radius + 12);
      Object.assign(fighter, cast.gate);
      leap(fighter, aim(fighter, target), 545 + form * 45);
    } else if (action === 'dash' || action === 'claw' || (action === 'flame' && fighter.char.id === 'ghost_rider' && cast.technique !== 'hellBreath')) {
      leap(fighter, cast.aim, 915 + form * 72 + power * 80);
    } else if (action === 'guard') {
      fighter.guardTimer = Math.max(fighter.guardTimer, .72 + form * .12);
      if (cast.technique === 'kinetic') {
        cast.extraPower = Math.min(2, (fighter.custom.kinetic || 0) * .32);
        fighter.custom.kinetic = 0;
      }
      if (cast.technique === 'regeneration') {
        fighter.currentHp = Math.min(fighter.maxHp, fighter.currentHp + 1.4 + form * .3);
        arena.spawnRing(fighter.x,fighter.y,18,fighter.radius+30,'#adf0ad',.37);
      }
    }

    cast.last = { x: fighter.x, y: fighter.y };
    cast.contactRadius = 35 + form * 7 + power * 8;
    if (action === 'lightning') arena.triggerFlash(cast.color, .11 + form * .018);
  }

  function impact(arena, fighter, cast, part = 1, detail = {}) {
    const { color = cast.color, point, source } = detail;
    const target = cast.target;
    const ultimate = cast.slot === 'ultimate';
    const attack = (ultimate ? 6.2 + cast.form * 1.85 : 2.0 + cast.power * .83 + cast.form * .55) * part + cast.extraPower;
    const isArea = cast.comic || cast.action === 'webArena' || cast.action === 'titanMarch' || cast.action === 'nova';
    const result = arena.applyDamage(fighter, target, attack, { color, attack: isArea ? null : cast, skill: cast, point, source,
      isRanged: !cast.contact && !isArea && ranged.has(cast.action), isCrit: ultimate && cast.form === 4, size: ultimate ? 36 + cast.form * 3 : 28 });
    if (!result.amount || result.blocked) return;

    fighter.char.skills.passive?.(fighter, target, arena, 'onHitSuccess', result);
    if (cast.technique === 'smallLight') target.shrinkTimer = .8 + cast.power * .34;
    if (cast.technique === 'baryon') target.damageDebuffTimer = Math.max(target.damageDebuffTimer, .44 + .2*cast.power);
    const direction = aim(fighter, target);
    const pull = ['tether', 'web', 'webArena'].includes(cast.action);
    const impulse = pull ? -155 - cast.form * 22 : 105 + cast.power * 28 + (ultimate ? cast.form * 42 : 0);
    target.vx += Math.cos(direction) * impulse;
    target.vy += Math.sin(direction) * impulse;
    if (pull || cast.action === 'stones') target.domainSlowTimer = Math.max(target.domainSlowTimer, .16 + cast.form * .035);
    arena.spawnParticles(target.x, target.y, color, 4 + cast.form, 180 + cast.power * 45);
    arena.addShake(4 + cast.form + cast.power * 2);
  }

  function moveShots(arena, fighter, cast, dt) {
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
      if (!shot.hits && !CombatMovement.avoids(cast.target, fighter, cast) &&
          segmentDistance(cast.target, before, shot) <= cast.target.radius + 15 + cast.form * 2) {
        shot.hits++;
        impact(arena, fighter, cast, 1 / Math.sqrt(cast.nodes.length), { color: shot.color, source: before });
        if (cast.action !== 'ricochet') {
          shot.done = true;
          shot.hitAge = cast.age;
        }
      }
      if (shot.done || ArenaBounds.contains(arena, shot, 11)) continue;
      if (cast.action !== 'ricochet' || shot.bounces >= 1 + cast.form) {
        shot.done = true;
        continue;
      }
      ArenaBounds.reflect(arena, shot, 11);
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
      const twin = ['twinRepulsor','twinPhoton'].includes(cast.technique);
      const cut = ['cursedSlash','worldSlash'].includes(cast.technique);
      const count = twin ? 2 : cast.technique === 'worldSlash' ? 1
        : ['zoltraak','cursedSlash'].includes(cast.technique) && power === 2 ? 2 + form : 1;
      const length = cast.technique === 'widowBite' ? 150 + form * 17 + power * 25 : 670 + power * 78;
      return Array.from({ length: count }, (_, index) => {
        const source=twin && index===0 ? cast.otherHand : origin;
        const direction = aim(source,focus) + (index - (count - 1) / 2) * (twin ? .03 : .14);
        const end = offset(source, direction, length * open);
        if (cut) return curve(source, end, (index % 2 ? 1 : -1) * (44 + form * 12) * open);
        if (cast.technique === 'widowBite') {
          return Array.from({ length: 7 }, (_, i) =>
            offset(offset(origin, direction, length * open * i / 6), direction + Math.PI / 2, i % 6 ? (i % 2 ? -1 : 1) * 6 : 0));
        }
        return [source, end];
      });
    }
    if (action === 'web' || action === 'tether') {
      const source = UltimateAnimator.emitsFromBody(cast.technique) ? origin : offset(fighter, angle + .38, fighter.radius * .75);
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
        const start = cast.technique==='judradjim' ? origin : offset(hit, -Math.PI / 2 - i * .15, 190 + i * 22);
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
        const reach = action === 'satellite' ? arena.arenaHalfSize * .66 : fighter.radius + 30 + form * 13 + (action === 'clone' ? 56 * open : 0);
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
    if (action === 'flame' && (fighter.char.id === 'frieren' || cast.technique === 'hellBreath')) {
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
      ContactSkills.advance(arena, fighter, cast, progress, dt, (part, point) => impact(arena, fighter, cast, part, { point }));
      return;
    }
    if (UltimateAnimator.emitsFromBody(cast.technique) && !shots.has(cast.action) && !cast.comic) {
      cast.origin = UltimateAnimator.origin(arena,fighter,cast);
      cast.aim = aim(cast.origin,cast.focus);
    }
    if (['twinRepulsor','twinPhoton'].includes(cast.technique)) cast.otherHand=UltimateAnimator.origin(arena,fighter,cast,0);
    if (cast.comic) {
      ComicSkills.advance(arena,fighter,cast,progress,dt,part=>impact(arena,fighter,cast,part));
      return;
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
    if (hit && !CombatMovement.avoids(cast.target, fighter, cast)) pulse(arena, fighter, cast);
  }



  function circle(ctx, center, radius) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, TAU);
  }

  function drawField(ctx, cast, progress, alpha, background = false) {
    const { field, color, action, technique } = cast;
    const radius = field.reach;
    if (technique === 'airCannon') {
      if (background) return;
      ctx.save();
      ctx.translate(field.x, field.y);
      ctx.rotate(cast.aim);
      for (let i = 2; i >= 0; i--) {
        ctx.globalAlpha = alpha * (.92 - i * .19) * (1 - progress * .24);
        ctx.beginPath();
        ctx.ellipse(-i * 22, 0, radius * (.34 - i * .05), radius * (1 - i * .19), 0, -1.26, 1.26);
        SkillInk.traced(ctx, color, 7.8 - i * 1.9, '#effcff');
      }
      ctx.restore();
      SkillInk.speed(ctx, field, cast.aim, 74 + radius * .37, radius * .31, '#caefff', alpha * .73);
      return;
    }

    if (background) {
      ctx.save();
      ctx.globalAlpha *= alpha * (technique === 'blue' || technique === 'red' ? .29 : .16);
      const glow = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, radius);
      glow.addColorStop(0, color);
      glow.addColorStop(1, 'transparent');
      circle(ctx, field, radius);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(field.x, field.y);
    ctx.globalAlpha *= alpha * .87;
    if (technique === 'red' || technique === 'blue') {
      const red = technique === 'red';
      const core = Math.min(red ? 31 : 40, radius * .30);
      const gradient = ctx.createRadialGradient(-core*.23, -core*.26, 1, 0, 0, core);
      gradient.addColorStop(0, red ? '#fff7ed' : '#10142a');
      gradient.addColorStop(.52, red ? '#ffabb4' : '#265dc2');
      gradient.addColorStop(1, color);
      circle(ctx, {x:0, y:0}, core);
      ctx.fillStyle = gradient;
      ctx.fill();
      SkillInk.traced(ctx, color, 3.3);
      for (const sign of [-1, 1]) {
        const spin = cast.age * sign * 5.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, core * 1.87, core * .77, spin, sign * .68, sign * .68 + 3.83);
        SkillInk.traced(ctx, color, 3.3);
      }
      if (red) SkillInk.speed(ctx, {x:0,y:0}, cast.aim, core*2.65, core*.53, color, .81);
    }

    const marks = action === 'guard' ? 6 : 8;
    const drive = technique === 'blue' ? -1 : 1;
    const rotation = cast.age * drive * (technique === 'blue' ? 2.1 : .59);
    const lines = [];
    for (let i = 0; i < marks; i++) {
      const turn = i * TAU / marks + rotation;
      const pad = radius * (action === 'guard' ? .13 : .20);
      const b = offset({x:0,y:0}, turn, radius * .93);
      const a = offset(b, turn - 2.26, pad);
      const c = offset(b, turn + 2.26, pad);
      if (technique === 'blue') {
        const tip = offset(b, turn, -pad * 1.2);
        lines.push([a, tip, c]);
      } else lines.push([a,b,c]);
    }
    SkillInk.line(ctx, lines, color, action === 'guard' ? 4.5 : 4.9, .79);
    ctx.restore();
  }

  function drawShot(ctx, shot, cast, radius, spent = false) {
    const { technique } = cast;
    const direction = Math.atan2(shot.vy, shot.vx);
    const spins = cast.action === 'ricochet' || technique === 'rasenshuriken';
    ctx.save();
    ctx.translate(shot.x, shot.y);
    ctx.rotate(direction + (spins ? cast.age * 18 : 0));
    ctx.scale(radius, radius);
    const color = shot.color;

    if (technique === 'shieldThrow') {
      for (const [size, tint] of [[1.51,'#141421'],[1.36,'#cd4055'],[1.14,'#f1e6de'],[.86,'#e65365'],[.62,'#344d81']]) {
        circle(ctx, { x: 0, y: 0 }, size);
        ctx.fillStyle = tint;
        ctx.fill();
      }
      const star = Array.from({length:10}, (_,i) => {
        const a = i * TAU / 10 - Math.PI / 2;
        const d = i % 2 ? .23 : .48;
        return [Math.cos(a)*d, Math.sin(a)*d];
      });
      SkillInk.polygon(ctx, star, '#fcf5eb', 0);
    } else if (technique === 'hammerThrow') {
      SkillInk.polygon(ctx, [[-.43,.10],[-.10,.11],[-.12,1.36],[-.38,1.40]], '#a77a52', .13);
      SkillInk.polygon(ctx, [[-1.11,-.84],[.63,-.87],[.90,-.56],[.83,.35],[-.89,.35],[-1.12,.11]], '#849fbe', .16);
      SkillInk.polygon(ctx, [[-.90,-.69],[.60,-.66],[.69,-.52],[-.86,-.48]], '#f3f4f2', 0);
    } else if (technique === 'crescent' || technique === 'eclipse') {
      ctx.beginPath();
      ctx.arc(0, 0, 1.47, .05, Math.PI * 1.66);
      ctx.quadraticCurveTo(-.48, .44, 1.47, .05);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      SkillInk.traced(ctx, color, .15, '#fff3e3', .06);
    } else if (['metalShards','thunderSpears','missile','frost'].includes(technique)) {
      const spear = technique === 'thunderSpears' || technique === 'missile';
      const point = spear ? 2.06 : 1.64;
      SkillInk.polygon(ctx, [[point,0],[.26,-.45],[-1.23,-.39],[-1.46,.10],[-.48,.43],[.49,.38]], color, .14);
      SkillInk.polygon(ctx, [[point*.86,-.005],[-.79,-.23],[-1.09,-.065],[.49,.15]], spear ? '#f4eadb' : '#edfbff', 0);
      if (spear) SkillInk.polygon(ctx, [[-.45,-.35],[-.22,-.39],[-.19,.37],[-.43,.37]], '#695065', 0);
    } else if (technique === 'divineFlame') {
      SkillInk.polygon(ctx, [[2.49,0],[.32,-.64],[.53,-.27],[-1.43,-.77],[-.84,-.18],[-2.31,-.42],
        [-1.58,.13],[-2.22,.64],[-.81,.31],[-1.14,.82],[.62,.46],[.37,.18]], '#ee664b', .18);
      SkillInk.polygon(ctx, [[1.89,0],[.32,-.32],[-.84,-.27],[-.46,.03],[-1.03,.35],[.69,.27]], '#ffce84', 0);
      SkillInk.polygon(ctx, [[1.46,0],[.47,-.16],[-.27,-.03],[.29,.16]], '#fff6c7', 0);
    } else if (technique === 'purple' || technique === 'chakraBomb') {
      const purple = technique === 'purple';
      const size = purple ? 1.56 : 1.42;
      const glow = ctx.createRadialGradient(-.35, -.36, .05, 0, 0, size);
      glow.addColorStop(0, purple ? '#fcf4ff' : '#9c69bb');
      glow.addColorStop(.48, purple ? '#bd6aef' : '#332040');
      glow.addColorStop(1, '#22152e');
      circle(ctx, { x: 0, y: 0 }, size);
      ctx.fillStyle = glow;
      if (!spent) ctx.fill();
      SkillInk.traced(ctx, color, .17, '#ecd9ff', .06);
      for (const lane of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.28, size * .61, cast.age * lane * 6, .30 * lane, .30 * lane + 3.57);
        SkillInk.traced(ctx, purple ? '#d783ff' : '#c986de', .11, '#fff0ff', .045);
      }
    } else if (technique === 'rasenshuriken') {
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI / 2);
        SkillInk.polygon(ctx, [[0,0],[2.15,-.49],[1.68,.03],[.61,.58]], '#d6faff', .14);
        SkillInk.polygon(ctx, [[.26,.09],[1.86,-.30],[1.35,.05],[.51,.38]], '#72cced', 0);
        ctx.restore();
      }
      circle(ctx, { x: 0, y: 0 }, .51);
      ctx.fillStyle = '#ccfaff';
      ctx.fill();
      SkillInk.traced(ctx, '#66d5f4', .14, '#fffaf0', .055);
    } else {
      const base = ctx.createLinearGradient(-.9, .55, .84, -.35);
      base.addColorStop(0, '#241d32');
      base.addColorStop(.46, color);
      base.addColorStop(1, '#fff4df');
      ctx.beginPath();
      ctx.moveTo(1.24, 0);
      ctx.bezierCurveTo(.48,-.94,-.89,-.84,-1.38,-.04);
      ctx.bezierCurveTo(-.75,.69,.25,1.02,1.24,0);
      ctx.fillStyle = base;
      ctx.fill();
      SkillInk.traced(ctx, color, .15, '#fff3e5', .06);
    }
    ctx.restore();
  }

  function drawChain(ctx, cast, alpha) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    for (const path of cast.rays) {
      for (let index = 1; index < path.length; index++) {
        const from = path[index - 1];
        const to = path[index];
        const span = distance(from, to);
        const count = Math.ceil(span / 19);
        const direction = aim(from, to);
        const scale = 1 + cast.form * .12 + cast.power * .07;
        for (let i = 0; i < count; i++) {
          const center = offset(from, direction, span * (i + .5) / count);
          ctx.beginPath();
          ctx.ellipse(center.x, center.y, 11 * scale, (i % 2 ? 4.3 : 6.9) * scale, direction, 0, TAU);
          SkillInk.traced(ctx, '#f6a34e', 4.5 * scale, '#ffefb5');
        }
      }
    }
    ctx.restore();
  }

  function rayAtContact(path, hit) {
    const [start, end] = path;
    if (path.length !== 2) return path;
    const length = distance(start, end);
    if (length <= 1) return path;
    const ux = (end.x - start.x) / length;
    const uy = (end.y - start.y) / length;
    const cx = hit.targetX - start.x;
    const cy = hit.targetY - start.y;
    const projection = cx * ux + cy * uy;
    const perpendicular = Math.abs(cx * uy - cy * ux);
    const radius = hit.targetRadius * .83;
    if (perpendicular >= radius || projection <= 0 || projection >= length + radius) return path;
    const contact = Math.max(12, projection - Math.sqrt(radius * radius - perpendicular * perpendicular));
    return [start, { x: start.x + ux * contact, y: start.y + uy * contact }];
  }

  function drawRays(ctx, cast, progress, alpha) {
    const { technique, color, lastContact } = cast;
    const shorten = cast.action === 'beam' && lastContact && cast.age - lastContact.age < .27;
    const rays = shorten ? cast.rays.map(path => rayAtContact(path, lastContact)) : cast.rays;
    const mode = SkillInk.kind(technique);
    if (technique === 'hellChain') {
      drawChain(ctx, cast, alpha);
      return;
    }
    if (technique === 'door') {
      const tip = rays[0].at(-1);
      drawField(ctx, { ...cast, technique: 'airCannon', field: { ...tip, reach: 68 + cast.form * 7 } }, progress, alpha);
      return;
    }
    if (mode === 'blade' || mode === 'flame') {
      const width = mode === 'blade' ? (technique === 'worldSlash' ? 15 : 6.4) + cast.form * .7 : 13 + cast.form * 2;
      for (const path of rays) {
        SkillInk.ribbon(ctx, path, width, color, alpha, mode === 'flame' ? '#ffe2a6' : '#fff3f8');
        const tip = path.at(-1);
        if (tip && path.length > 1) {
          const direction = aim(path[0], tip);
          SkillInk.speed(ctx, tip, direction, 37 + width * 2.4, width * .92, color, alpha * .64, 4);
        }
      }
      return;
    }
    if (mode === 'web') {
      SkillInk.line(ctx, rays, '#d5ecff', cast.power === 2 ? 7.5 : 5.2, alpha, '#ffffff');
      for (const path of rays) {
        for (let i = 2; i < path.length - 1; i += 3) {
          const a = path[i];
          const b = path[i + 1];
          const angle = aim(a, b) + Math.PI / 2;
          const width = 6 + cast.form * 1.4;
          SkillInk.line(ctx, [[offset(a, angle, -width), offset(offset(a, angle, width), angle + Math.PI / 2, -8)]],
            '#b5d2f5', 2.15, alpha * .76);
        }
      }
      return;
    }
    const thin = mode === 'lightning' || mode === 'rope' || technique === 'smallLight';
    const width = thin ? (mode === 'rope' ? 7.7 : 8.5) + cast.form : Math.min(43, 13 + cast.width * .42);
    SkillInk.line(ctx, rays, color, width, alpha * .96, mode === 'rope' ? '#ffe8c5' : '#fffff2');
    if (mode === 'charge' || mode === 'lightning') {
      const main = rays[Math.floor(rays.length / 2)];
      const tip = main?.at(-1);
      if (tip && main.length > 1) {
        SkillInk.speed(ctx, tip, aim(main[0], tip), width * 4.2, width * 1.10, color, alpha * .68, 5);
      }
    }
  }

  function drawBackground(ctx, fighter, cast, progress, alpha) {
    if (cast.comic) ComicSkills.draw(ctx, cast, alpha, true);
    else if (cast.spectacle) ArenaUltimates.draw(ctx, fighter, cast, alpha, true);
    else if (cast.field) drawField(ctx, cast, progress, alpha, true);
  }

  function draw(ctx, fighter, cast, progress, alpha) {
    if (cast.comic) {
      ComicSkills.draw(ctx,cast,alpha);
      return;
    }
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
        const radius = 13 + cast.power * 4 + cast.form * 1.7;
        if (node.done) {
          if (['purple','divineFlame','chakraBomb','rasenshuriken'].includes(cast.technique) &&
              Number.isFinite(node.hitAge) && cast.age - node.hitAge < .18) {
            const fade = 1 - (cast.age - node.hitAge) / .18;
            ctx.globalAlpha = alpha * (.44 + fade * .32) * fade;
            const size = radius * (1.14 + (1 - fade) * .75);
            if (cast.lastContact) ctx.translate(cast.lastContact.x - node.x, cast.lastContact.y - node.y);
            drawShot(ctx, node, cast, size, true);
            if (cast.lastContact) ctx.translate(node.x - cast.lastContact.x, node.y - cast.lastContact.y);
          }
          continue;
        }
        const direction = Math.atan2(node.vy, node.vx);
        ctx.globalAlpha = alpha;
        SkillInk.speed(ctx, {x:node.x - Math.cos(direction)*radius*.62, y:node.y - Math.sin(direction)*radius*.62},
          direction, radius * 3.16, radius * .38, node.color, .64);
        drawShot(ctx, node, cast, radius);
      }
      return;
    }

    if (cast.anchor) {
      ctx.globalAlpha = 1;
      SkillInk.line(ctx, [curve(fighter, cast.anchor, 17)], cast.color, 3.8, alpha * .75);
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
      drawRays(ctx, cast, progress, alpha);
    }
    for (const node of cast.nodes) {
      if (cast.action === 'clone') {
        ctx.globalAlpha = alpha * (cast.technique === 'ninjaClone' ? .70 : .52);
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

  return { release, advance, drawBackground, draw };
})();
