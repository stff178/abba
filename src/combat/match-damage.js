'use strict';

const MatchDamage = (() => {
  function create(duration) {
    const interval = Math.min(1.05, duration / 14);
    return { interval, next: interval, pending: [false, false], exchanges: [], closing: null };
  }

  function winner(arena) {
    if (arena.winnerPreference !== 'auto') return arena.fighters[Number(arena.winnerPreference)];
    const [left, right] = arena.fighters;
    const lead = left.currentHp - right.currentHp || left.totalDamageDealt - right.totalDamageDealt;
    return lead < 0 ? right : left;
  }

  function targetHp(arena, defender, elapsed) {
    const fraction = Math.min(1, elapsed / (arena.matchDuration * .975));
    const curve = fraction * (.87 + .13 * fraction);
    const end = arena.winnerPreference !== 'auto' && defender.side === Number(arena.winnerPreference) ? .10 : .045;
    return defender.maxHp * (1 - (1 - end) * curve);
  }

  function amount(arena, defender, damage, opts) {
    if (opts.isFinisher) return defender.currentHp;
    const safetyHp = Math.max(2.25, targetHp(arena, defender, arena.elapsed) - defender.maxHp * .045);
    return Math.min(damage, Math.max(0, defender.currentHp - safetyHp));
  }

  function queueEffect(arena, attacker, defender, color, strength) {
    const angle = Math.atan2(defender.y - attacker.y, defender.x - attacker.x);
    const reach = Math.min(attacker.radius + 8, Math.hypot(defender.x - attacker.x, defender.y - attacker.y) / 2);
    arena.matchDamage.exchanges.push({
      x: attacker.x + Math.cos(angle) * reach, y: attacker.y + Math.sin(angle) * reach,
      angle, start: arena.time, color, strength
    });
    attacker.contactBeat = { start: arena.time, target: defender };
  }

  function pace(arena, attacker, defender, elapsed, closing) {
    const gap = defender.currentHp - targetHp(arena, defender, elapsed);
    if (gap < (closing ? .15 : 1.15)) return;

    const color = FighterForms.color(attacker);
    const hit = arena.applyDamage(attacker, defender, closing ? gap : Math.min(gap, defender.maxHp * .115), {
      isPaced: true, size: 24, color
    });
    if (hit.amount > 0 && !hit.blocked) queueEffect(arena, attacker, defender, color, .58);
  }

  function steer(attacker, defender, dt, closing) {
    const dx = defender.x - attacker.x;
    const dy = defender.y - attacker.y;
    const distance = Math.hypot(dx, dy) || 1;
    const speed = Math.min(closing ? 1570 : 1260, 420 + (distance - attacker.radius - defender.radius) * 3.2);
    const turn = Math.min(1, dt * (closing ? 19 : 12));
    attacker.vx += (dx / distance * speed - attacker.vx) * turn;
    attacker.vy += (dy / distance * speed - attacker.vy) * turn;
  }

  function advance(arena, dt = 0) {
    if (!arena.running || arena.elapsed >= arena.matchDuration) return;
    const plan = arena.matchDamage;
    const closingStart = arena.matchDuration - Math.min(.76, arena.matchDuration * .18);
    if (arena.elapsed >= closingStart && !plan.closing) plan.closing = { start: closingStart };

    if (arena.elapsed + 1e-9 >= plan.next) {
      plan.next = (Math.floor(arena.elapsed / plan.interval + 1e-8) + 1) * plan.interval;
      for (const defender of arena.fighters) {
        plan.pending[defender.side] = defender.currentHp - targetHp(arena, defender, arena.elapsed) >= 1.15;
      }
    }

    const closing = Boolean(plan.closing);
    for (const defender of arena.fighters) {
      const attacker = arena.fighters[1 - defender.side];
      const distance = Math.hypot(attacker.x - defender.x, attacker.y - defender.y);
      const reach = attacker.radius + defender.radius + 20;
      if (distance <= reach) {
        if (plan.pending[defender.side] || closing) pace(arena, attacker, defender, arena.elapsed, false);
        plan.pending[defender.side] = false;
      } else if (plan.pending[defender.side] || closing) {
        steer(attacker, defender, dt, closing);
      }
    }
  }

  function setFinisherPositions(arena, chosen, defeated) {
    const separation = chosen.radius + defeated.radius + 8;
    if (Math.hypot(chosen.x - defeated.x, chosen.y - defeated.y) <= separation) return;

    const angle = Math.atan2(defeated.y - chosen.y, defeated.x - chosen.x);
    const mx = (chosen.x + defeated.x) / 2 - arena.centerX;
    const my = (chosen.y + defeated.y) / 2 - arena.centerY;
    const limit = (arena.arenaRadius - separation / 2 - Math.max(chosen.radius, defeated.radius) - 10);
    const scale = Math.min(1, limit / (Math.hypot(mx, my) || 1));
    const x = arena.centerX + mx * scale;
    const y = arena.centerY + my * scale;
    const dx = Math.cos(angle) * separation / 2;
    const dy = Math.sin(angle) * separation / 2;
    Object.assign(chosen, { x: x - dx, y: y - dy });
    Object.assign(defeated, { x: x + dx, y: y + dy });
  }

  function resolve(arena) {
    const chosen = winner(arena);
    const defeated = arena.fighters[1 - chosen.side];
    setFinisherPositions(arena, chosen, defeated);
    pace(arena, chosen, defeated, arena.matchDuration, true);
    pace(arena, defeated, chosen, arena.matchDuration, true);
    const color = FighterForms.color(chosen);
    const hit = arena.applyDamage(chosen, defeated, defeated.currentHp, {
      isFinisher: true, isCrit: true, size: 44, color
    });
    if (hit.amount > 0) queueEffect(arena, chosen, defeated, color, 1);
    return { winner: chosen, loser: defeated };
  }

  function draw(ctx, arena) {
    const { closing, exchanges } = arena.matchDamage;
    ctx.save();
    ctx.lineCap = 'round';

    for (const exchange of exchanges) {
      const age = arena.time - exchange.start;
      if (age > .32) continue;
      const remaining = 1 - age / .32;
      ctx.save();
      ctx.translate(exchange.x, exchange.y);
      ctx.rotate(exchange.angle);
      ctx.globalAlpha = remaining * exchange.strength;
      ctx.strokeStyle = exchange.color;
      ctx.lineWidth = 2 + 5 * remaining;
      ctx.beginPath();
      for (let index = 0; index < 7; index++) {
        const angle = (index - 3) * .54;
        const ux = Math.cos(angle);
        const uy = Math.sin(angle);
        const start = 8 + age * 102;
        const end = start + (11 + (index % 3) * 8) * exchange.strength;
        ctx.moveTo(ux * start, uy * start);
        ctx.lineTo(ux * end, uy * end);
      }
      ctx.stroke();
      ctx.strokeStyle = '#fff9e7';
      ctx.lineWidth *= .32;
      ctx.stroke();
      ctx.restore();
    }

    if (closing && !arena.koState) {
      const attacker = winner(arena);
      const progress = Math.min(1, (arena.elapsed - closing.start) / (arena.matchDuration - closing.start));
      const radius = attacker.radius * (1.55 - progress * .29);
      ctx.globalAlpha = .25 + progress * .32;
      ctx.strokeStyle = FighterForms.color(attacker);
      ctx.lineWidth = 3 + progress * 2;
      ctx.beginPath();
      ctx.arc(attacker.x, attacker.y, radius, arena.time * 7, arena.time * 7 + 1.44);
      ctx.stroke();
    }

    ctx.restore();
  }

  function prune(arena) {
    const plan = arena.matchDamage;
    if (plan.exchanges.length && arena.time - plan.exchanges[0].start > .32) {
      plan.exchanges = plan.exchanges.filter(exchange => arena.time - exchange.start <= .32);
    }
  }

  return { create, amount, advance, resolve, draw, prune };
})();
