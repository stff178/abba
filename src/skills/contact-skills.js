'use strict';

const ContactSkills = (() => {
  const armed = new Set(['claws','sword','odm','baton','hammer','ironArms','hotClaws','nanoBlade',
    'dualBlades','moonBlade','reverseBlade','daggers','dualHammer','stinger','cleave']);
  const hook = new Set(['odm', 'webSwing']);
  const heavy = new Set(['stomp', 'warHammer', 'hammer', 'dualHammer']);

  function heading(fighter, target) {
    return Math.atan2(target.y - fighter.y, target.x - fighter.x);
  }

  function release(arena, fighter, cast) {
    cast.hits = 0;
    cast.hitFrames = [];
    if (hook.has(cast.technique)) {
      const bearing = heading({ x: arena.centerX, y: arena.centerY }, cast.target) + (fighter.side ? -.57 : .57);
      cast.anchor = ArenaBounds.wallAt(arena, bearing, 6);
    }
    fighter.motion.dash = .28;
  }

  function advance(arena, fighter, cast, progress, dt, strike) {
    const { target, technique, power, form } = cast;
    if (cast.finishedContact || fighter.motion.dodge > .11 || fighter.movement.reset > .08) return;
    const dx = target.x - fighter.x;
    const dy = target.y - fighter.y;
    const distance = Math.hypot(dx, dy) || 1;
    const ux = dx / distance;
    const uy = dy / distance;
    const slam = heavy.has(technique);
    const reach = fighter.radius + target.radius + (slam ? 35 + form * 10 : armed.has(technique) ? 36 : 17);
    const direction = heading(fighter, target);
    const count = power === 2 && !slam ? (technique === 'baryon' ? 4 : form >= 2 ? 3 : 2) : 1;
    if (technique === 'rasengan' || technique === 'webSwing') cast.handPoint = UltimateAnimator.origin(arena,fighter,cast);
    if (distance > reach * .90) {
      const speed = Math.min(1290, 320 + (distance - reach * .86) * 3.4) + (hook.has(technique) ? 170 : 0);
      const turn = Math.min(1, dt * 15);
      const bearing = direction + (cast.anchor && !cast.hits ? Math.sin(progress * Math.PI) * (fighter.side ? -.33 : .33) : 0);
      fighter.vx += (Math.cos(bearing) * speed - fighter.vx) * turn;
      fighter.vy += (Math.sin(bearing) * speed - fighter.vy) * turn;
    } else {
      const turn = Math.min(1, dt * 12);
      const sweep = fighter.side ? -1 : 1;
      fighter.vx += (-uy * sweep * 255 - fighter.vx) * turn;
      fighter.vy += (ux * sweep * 255 - fighter.vy) * turn;
    }

    const hitAt = (slam ? .17 : .10) + cast.hits * (technique === 'baryon' ? .19 : .24);
    if (distance > reach || cast.hits >= count || progress < hitAt || progress > .96 ||
        cast.age - cast.charge < (slam ? .12 : .078)) return;
    if (CombatMovement.avoids(target, fighter, cast)) return;
    cast.hits++;
    cast.impactAge = cast.age;
    const point = { x: fighter.x + ux * Math.min(fighter.radius + 22, distance * .6),
      y: fighter.y + uy * Math.min(fighter.radius + 22, distance * .6) };
    cast.hitFrames.push({ ...point, start: cast.age, direction });
    strike(count === 1 ? 1.12 : 1.25 / count, point);
    cast.finishedContact = cast.hits === count;
    if (cast.finishedContact) CombatMovement.reset(arena, fighter, target, .31, 610);
    if (slam) {
      arena.spawnParticles(point.x, point.y, cast.color, 6 + form, 185 + form * 30);
      arena.addShake(6 + form * 2);
    }
  }

  function draw(ctx, fighter, cast, progress, alpha) {
    const { technique, form, color } = cast;
    const slam = heavy.has(technique);
    const blades = armed.has(technique);
    const angle = heading(fighter, cast.target);
    if (cast.anchor) {
      const lanes = technique === 'odm' ? [-1, 1] : [0];
      ctx.globalAlpha = alpha * .72;
      ctx.lineWidth = 2.3;
      ctx.strokeStyle = technique === 'odm' ? '#d9e4f1' : '#eef7ff';
      for (const lane of lanes) {
        ctx.beginPath();
        const source = cast.handPoint || fighter;
        ctx.moveTo(source.x - lane * 19 * Math.sin(angle), source.y + lane * 19 * Math.cos(angle));
        ctx.quadraticCurveTo((fighter.x + cast.anchor.x) * .5 + lane * 14,
          (fighter.y + cast.anchor.y) * .5 + lane * 25, cast.anchor.x + lane * 23, cast.anchor.y - lane * 9);
        ctx.stroke();
      }
    }
    if (technique === 'rasengan' && cast.hits === 0 && cast.handPoint) {
      const {x,y} = cast.handPoint;
      const radius = 12 + form * 4;
      ctx.globalAlpha = alpha * .89;
      ctx.fillStyle = '#8ee7ff';
      ctx.strokeStyle = '#e6fcff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 1.45, radius * .47, cast.age * 13, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const hit of cast.hitFrames) {
      const t = (cast.age - hit.start) / .32;
      if (t >= 1) continue;
      const size = (blades ? 63 : 39) + form * 7 + cast.power * 11;
      ctx.save();
      ctx.translate(hit.x, hit.y);
      ctx.rotate(hit.direction);
      ctx.globalAlpha = alpha * (1 - t) * .87;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = (blades ? 8 : 5) * (1 - t) + 2;
      ctx.beginPath();
      if (blades) {
        const slashes = technique === 'claws' ? [-1, 0, 1] : technique === 'odm' ? [-1, 1] : [0];
        for (const side of slashes) {
          ctx.ellipse(side * 12, side * 14, size * .91, size * .57, -.53 + side * .25, -.92 - t, 1.23 + t);
        }
      } else {
        ctx.ellipse(0, 0, size * (.36 + t * .6), size * (.32 + t * .73), 0, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.strokeStyle = '#fff4d8';
      ctx.lineWidth *= .29;
      ctx.stroke();
      if (slam) {
        for (let i = 0; i < (technique === 'warHammer' ? 9 : 6); i++) {
          const a = i * Math.PI / 3 + .38;
          const spread = size * (.32 + t * .89) * (1 + i % 3 * .13);
          const x = Math.cos(a) * spread;
          const y = Math.sin(a) * spread * .68;
          ctx.beginPath();
          ctx.moveTo(x * .29, y * .29);
          ctx.lineTo(x * .51 - 7, y * .55 + 4);
          ctx.lineTo(x * .73 + 8, y * .71 - 7);
          ctx.lineTo(x, y);
          ctx.strokeStyle = i % 2 ? color : '#e0c696';
          ctx.lineWidth = 4 * (1 - t) + 1;
          ctx.stroke();
          if (technique === 'warHammer') {
            ctx.fillStyle = i % 2 ? '#c7dddc' : color;
            ctx.beginPath();
            ctx.moveTo(x - 8, y + 5);
            ctx.lineTo(x + 4, y - (28 + i % 3 * 12) * Math.sin(t * Math.PI));
            ctx.lineTo(x + 12, y + 8);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }

  return { release, advance, draw };
})();
