'use strict';

const ArenaEffects = (() => {
  const turn = Math.PI * 2;
  const stars = Array.from({ length: 86 }, (_, index) => ({
    angle: index * 2.39996,
    distance: Math.sqrt((index * .61803399) % 1),
    size: index % 9 === 0 ? 2.6 : 1.25,
    glow: .3 + index % 7 * .09
  }));

  const motifs = {
    web: ['mesh', 10, 4, .14], satellite: ['beacon', 4, 3, .18], claw: ['jagged', 9, 2, -.17],
    glitch: ['grid', 9, 3, .20], shield: ['mesh', 6, 4, -.12], storm: ['jagged', 12, 3, .32],
    gamma: ['jagged', 7, 4, -.12], mirror: ['mesh', 5, 4, .23], chaos: ['curve', 6, 4, -.35],
    stones: ['beacon', 6, 3, .15], panther: ['jagged', 5, 2, .10], timeline: ['branch', 7, 3, -.13],
    symbiote: ['curve', 8, 3, .18], doom: ['islands', 5, 3, .10], chain: ['links', 21, 2, -.39],
    tactical: ['grid', 12, 2, .25], metal: ['islands', 9, 2, .39], stellar: ['curve', 7, 4, .45],
    moon: ['beacon', 4, 4, -.11], singularity: ['curve', 5, 5, -.55], infinity: ['beacon', 6, 4, .28],
    shrine: ['jagged', 14, 2, -.30], fox: ['branch', 9, 3, .22], cloud: ['links', 12, 2, .19],
    titan: ['jagged', 8, 3, .10], blades: ['jagged', 11, 2, -.48], pocket: ['grid', 7, 3, .20],
    runes: ['beacon', 8, 4, -.27]
  };

  function addFinalForm(arena, fighter, profile) {
    arena.finalFormStages[fighter.side] = { theme: profile.theme, color: FighterForms.color(fighter), start: arena.time };
    arena.spawnRing(fighter.x, fighter.y, 40, arena.arenaRadius * .82, FighterForms.color(fighter), .78);
  }

  function castUltimate(arena, fighter, cast) {
    const profile = FighterRoster.get(fighter.char.id);
    if (!profile) return;
    const strength = .38 + cast.form * .147;
    arena.ultimateDomains[fighter.side] = {
      theme: profile.theme, color: cast.color, start: arena.time,
      length: cast.active + .72 + cast.form * .16, strength, anchor: { x: fighter.x, y: fighter.y }
    };
    if (cast.form >= 2) {
      arena.spawnRing(fighter.x, fighter.y, 38, arena.arenaRadius * (.76 + strength * .2), cast.color, .63);
      arena.triggerFlash(cast.color, .10 + strength * .09);
    }
  }

  function advance(arena, dt) {
    const lowHp = arena.fighters.every(fighter => fighter.currentHp < fighter.maxHp * .5);
    if (lowHp && arena.clashAge === 0) {
      const [left, right] = arena.fighters;
      arena.spawnRing(left.x, left.y, 46, 275, FighterForms.color(left), .72);
      arena.spawnRing(right.x, right.y, 46, 275, FighterForms.color(right), .72);
    }
    arena.clashAge = lowHp ? Math.min(1, arena.clashAge + dt * 1.8) : Math.max(0, arena.clashAge - dt * 2);
  }

  function get(arena) {
    if (arena.domainEffect) {
      return { kind: 'domain', color: '#ff476c', alpha: Math.min(1, arena.domainEffect.age * 4) };
    }
    return null;
  }

  function drawCracks(ctx, x, y, radius, accent, time) {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.globalAlpha *= .26;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const angle = i * turn / 7 + .34;
      const reach = radius * (.43 + .45 * Math.min(1, time * 1.5));
      const nearX = x + Math.cos(angle) * radius * .14;
      const nearY = y + Math.sin(angle) * radius * .14;
      const midX = x + Math.cos(angle + .17) * reach * .62;
      const midY = y + Math.sin(angle + .17) * reach * .62;
      ctx.moveTo(nearX, nearY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(x + Math.cos(angle - .07) * reach, y + Math.sin(angle - .07) * reach);
      ctx.moveTo(midX, midY);
      ctx.lineTo(x + Math.cos(angle + .42) * reach * .78, y + Math.sin(angle + .42) * reach * .78);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawCosmic(ctx, x, y, radius, scene) {
    const gradient = ctx.createRadialGradient(x - radius * .25, y - radius * .24, 10, x, y, radius);
    gradient.addColorStop(0, '#30305a');
    gradient.addColorStop(.58, '#181937');
    gradient.addColorStop(1, '#080a19');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.fillStyle = '#e5e4ff';
    for (const star of stars) {
      const distance = star.distance * radius;
      ctx.globalAlpha = scene.alpha * star.glow;
      ctx.beginPath();
      ctx.arc(x + Math.cos(star.angle) * distance, y + Math.sin(star.angle) * distance, star.size, 0, turn);
      ctx.fill();
    }
    ctx.globalAlpha = scene.alpha;
    drawCracks(ctx, x, y, radius, scene.color, scene.age);
  }

  function drawDomain(ctx, x, y, radius, scene, time) {
    ctx.fillStyle = '#160f23';
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    ctx.strokeStyle = scene.color;
    for (let i = 0; i < 6; i++) {
      ctx.globalAlpha = scene.alpha * (.1 + i * .027);
      ctx.lineWidth = i === 5 ? 3.5 : 1.6;
      const orbit = radius * (.26 + i * .121);
      const spin = time * (i % 2 ? -.51 : .42) + i * .65;
      ctx.beginPath();
      ctx.arc(x, y, orbit, spin, spin + Math.PI * 1.48);
      ctx.stroke();
    }

    ctx.globalAlpha = scene.alpha * .33;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = i * turn / 24 + time * .12;
      ctx.moveTo(x + Math.cos(a - .03) * radius * .88, y + Math.sin(a - .03) * radius * .88);
      ctx.lineTo(x + Math.cos(a) * radius * .95, y + Math.sin(a) * radius * .95);
      ctx.lineTo(x + Math.cos(a + .03) * radius * .88, y + Math.sin(a + .03) * radius * .88);
    }
    ctx.stroke();
  }

  function drawClashFloor(ctx, arena, x, y, radius) {
    const alpha = arena.clashAge;
    const time = arena.time;
    const power = .72 + arena.intensity * .28;
    ctx.save();
    for (const [i, fighter] of arena.fighters.entries()) {
      const color = FighterForms.color(fighter);
      const side = i * 2 - 1;
      const glowX = x + side * radius * .55;
      const glowY = y + Math.sin(time * .8 + i * Math.PI) * radius * .19;
      const tint = ctx.createRadialGradient(glowX, glowY, 8, glowX, glowY, radius * .88);
      tint.addColorStop(0, color);
      tint.addColorStop(1, 'transparent');
      ctx.globalAlpha = alpha * .19 * power;
      ctx.fillStyle = tint;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.1;
      ctx.globalAlpha = alpha * .32 * power;
      for (let j = 0; j < 4; j++) {
        const spin = time * side * (.32 + j * .06) + i * Math.PI + j * .82;
        ctx.beginPath();
        ctx.arc(x, y, radius * (.26 + j * .17), spin, spin + 1.4);
        ctx.stroke();
      }

      ctx.fillStyle = color;
      for (let j = 0; j < 18; j++) {
        const angle = j * 2.39996 + time * side * (.05 + (j % 4) * .036);
        const reach = radius * (.19 + (j * .61803 % 1) * .75);
        ctx.globalAlpha = alpha * (.23 + .24 * Math.sin(time * 2 + j) ** 2) * power;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * reach, y + Math.sin(angle) * reach, j % 6 === 0 ? 3.2 : 1.55, 0, turn);
        ctx.fill();
      }
    }
    ctx.globalAlpha = alpha * .75;
    drawCracks(ctx, x, y, radius, '#d9ceff', 1);
    ctx.restore();
  }

  function drawClashRim(ctx, arena, x, y) {
    const radius = arena.arenaRadius;
    ctx.save();
    ctx.lineCap = 'round';
    for (const [i, fighter] of arena.fighters.entries()) {
      const color = FighterForms.color(fighter);
      const start = arena.time * (.23 + arena.intensity * .23) + i * Math.PI;
      ctx.globalAlpha = arena.clashAge * .82;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 22;
      ctx.lineWidth = 7 + arena.intensity * 3;
      ctx.beginPath();
      ctx.arc(x, y, radius + 1, start, start + Math.PI * .82);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha *= .59;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let j = 0; j < 14; j++) {
        const a = start + j * .205;
        ctx.moveTo(x + Math.cos(a) * (radius - 20), y + Math.sin(a) * (radius - 20));
        ctx.lineTo(x + Math.cos(a + .015) * (radius - 10), y + Math.sin(a + .015) * (radius - 10));
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function polar(x, y, radius, angle) {
    return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
  }

  function polygon(ctx, x, y, radius, count, rotation) {
    for (let i = 0; i < count; i++) {
      const [px, py] = polar(x, y, radius, rotation + i * turn / count);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawMotif(ctx, stage, arena, x, y, index) {
    const [kind, spokes, layers, speed] = motifs[stage.theme];
    const radius = arena.arenaRadius - 12;
    const age = arena.time - stage.start;
    const blend = Math.min(1, age * 2.1) * (stage.strength ?? 1);
    const rotation = arena.time * speed + index * Math.PI;
    const direction = index === 0 ? -1 : 1;
    ctx.save();
    if (['stellar', 'singularity', 'infinity'].includes(stage.theme)) {
      ctx.globalAlpha = blend * .24;
      drawCosmic(ctx, x, y, radius, { color: stage.color, alpha: blend * .55, age });
    }
    const glow = ctx.createRadialGradient(x + direction * radius * .45, y, 16, x + direction * radius * .31, y, radius * .9);
    glow.addColorStop(0, stage.color);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.globalAlpha = blend * .12;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.globalAlpha = blend * .43;
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = stage.color;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    for (let i = 0; i < spokes; i++) {
      const angle = rotation + i * turn / spokes;
      const [edgeX, edgeY] = polar(x, y, radius * .91, angle);
      if (kind === 'mesh' || kind === 'branch') {
        ctx.moveTo(x, y);
        if (kind === 'mesh') ctx.lineTo(edgeX, edgeY);
        else ctx.bezierCurveTo(...polar(x, y, radius * .49, angle - .25), ...polar(x, y, radius * .67, angle + .29), edgeX, edgeY);
        if (kind === 'branch') {
          ctx.moveTo(...polar(x, y, radius * .55, angle + .12));
          ctx.lineTo(...polar(x, y, radius * .77, angle + .39));
        }
      } else if (kind === 'jagged') {
        ctx.moveTo(...polar(x, y, radius * .21, angle + .10));
        ctx.lineTo(...polar(x, y, radius * .42, angle - .09));
        ctx.lineTo(...polar(x, y, radius * .54, angle + .08));
        ctx.lineTo(...polar(x, y, radius * .70, angle - .07));
        ctx.lineTo(edgeX, edgeY);
      } else if (kind === 'grid') {
        const yd = (i / (spokes - 1) - .5) * radius * 1.82;
        ctx.moveTo(x - radius * .82, y + yd);
        ctx.lineTo(x + radius * .82, y + yd + Math.sin(rotation) * 12);
        ctx.moveTo(x + yd, y - radius * .82);
        ctx.lineTo(x + yd, y + radius * .82);
      } else if (kind === 'links') {
        ctx.moveTo(edgeX + 14, edgeY);
        ctx.ellipse(edgeX, edgeY, 16, 8, angle + .4, 0, turn);
      } else {
        const reach = radius * (kind === 'islands' ? .7 : .73);
        const [px, py] = polar(x, y, reach, angle);
        polygon(ctx, px, py, (kind === 'islands' ? 26 : 16) + i % 3 * 7,
          kind === 'islands' ? 4 : 5, angle + .17);
        if (kind === 'curve') {
          ctx.moveTo(...polar(x, y, radius * .13, angle));
          ctx.bezierCurveTo(...polar(x, y, radius * .72, angle - .95), ...polar(x, y, radius * .85, angle + .35), edgeX, edgeY);
        }
      }
    }
    ctx.stroke();

    ctx.globalAlpha = blend * .31;
    for (let i = 0; i < layers; i++) {
      ctx.beginPath();
      const r = radius * (.19 + i * .17);
      if (kind === 'mesh' || kind === 'islands' || kind === 'beacon') polygon(ctx, x, y, r, spokes, rotation * (i % 2 ? .75 : -.75));
      else ctx.arc(x, y, r, rotation + i, rotation + i + Math.PI * 1.75);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawUltimateDomain(ctx, arena, x, y, domain, side) {
    const age = arena.time - domain.start;
    const phase = age / domain.length;
    if (phase < 0 || phase >= 1) return;
    const power = domain.strength * Math.min(1, phase * 13) * Math.min(1, (1 - phase) * 4.4);
    const radius = arena.arenaRadius;
    const [kind, spokes] = motifs[domain.theme];
    const direction = side ? -1 : 1;
    const color = domain.color;
    ctx.save();
    const hue = ctx.createRadialGradient(domain.anchor.x, domain.anchor.y, 11, x, y, radius * 1.8);
    hue.addColorStop(0, color);
    hue.addColorStop(.68, color);
    hue.addColorStop(1, 'transparent');
    ctx.fillStyle = hue;
    ctx.globalAlpha = power * .21;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);

    const spread = radius * Math.min(.97, phase * 3.65 + .16);
    const rotation = phase * turn * .42 * direction + side * Math.PI;
    ctx.globalAlpha = power * .72;
    ctx.lineWidth = 2.3 + power * 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    const count = Math.max(6, Math.min(14, spokes));
    if (kind === 'jagged') {
      for (let i = 0; i < count; i++) {
        const angle = rotation + i * turn / count;
        ctx.moveTo(...polar(x, y, spread * .18, angle + .17));
        ctx.lineTo(...polar(x, y, spread * .55, angle - .08));
        ctx.lineTo(...polar(x, y, spread * .63, angle + .05));
        ctx.lineTo(...polar(x, y, spread, angle - .07));
      }
    } else if (kind === 'grid') {
      for (let i = 0; i < 5; i++) {
        const pos = x + (i - 2) * radius * .32;
        ctx.moveTo(pos, y - spread);
        ctx.lineTo(pos + Math.sin(rotation + i) * 42, y + spread);
      }
    } else if (kind === 'beacon' || kind === 'mesh' || kind === 'islands') {
      polygon(ctx, x, y, spread, count, rotation);
      polygon(ctx, x, y, spread * .71, count, -rotation);
      polygon(ctx, x, y, spread * .36, count, rotation);
    } else {
      for (let i = 0; i < 4; i++) {
        const reach = spread * (.31 + i * .20);
        const start = rotation * (i % 2 ? -1 : 1) + i;
        ctx.moveTo(...polar(x, y, reach, start));
        ctx.arc(x, y, reach, start, start + turn * .67);
      }
    }
    ctx.stroke();

    ctx.globalAlpha = power * .61;
    ctx.strokeStyle = '#fff7eb';
    ctx.lineWidth = 1.6 + power * 2.1;
    ctx.beginPath();
    const opening = Math.min(.88, phase * 1.2 + .31);
    ctx.arc(x, y, spread, rotation, rotation + turn * opening);
    ctx.stroke();
    ctx.restore();
  }

  function drawFloor(ctx, arena, x, y) {
    const radius = arena.arenaRadius;
    const scene = get(arena);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, turn);
    ctx.clip();

    const ground = ctx.createRadialGradient(x, y - radius * .35, 8, x, y, radius);
    ground.addColorStop(0, '#182030');
    ground.addColorStop(1, '#0c111b');
    ctx.fillStyle = ground;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.strokeStyle = 'rgba(167,192,226,.095)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let offset = -Math.ceil(radius / 42) * 42; offset <= radius; offset += 42) {
      ctx.moveTo(x + offset, y - radius);
      ctx.lineTo(x + offset, y + radius);
      ctx.moveTo(x - radius, y + offset);
      ctx.lineTo(x + radius, y + offset);
    }
    ctx.stroke();

    if (scene) {
      ctx.globalAlpha = scene.alpha;
      drawDomain(ctx, x, y, radius, scene, arena.time);
    }
    if (arena.clashAge > 0) drawClashFloor(ctx, arena, x, y, radius);
    for (const [index, stage] of arena.finalFormStages.entries()) {
      if (stage) drawMotif(ctx, stage, arena, x, y, index);
      const domain = arena.ultimateDomains[index];
      if (domain) drawUltimateDomain(ctx, arena, x, y, domain, index);
    }
    ctx.restore();
  }

  function drawRim(ctx, arena, x, y, baseColor) {
    if (arena.clashAge > 0) drawClashRim(ctx, arena, x, y);
    for (const [index, stage] of arena.finalFormStages.entries()) {
      if (!stage) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(.82, (arena.time - stage.start) * 3);
      ctx.strokeStyle = stage.color;
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 8, 2, 11]);
      ctx.lineDashOffset = arena.time * (index ? 60 : -60);
      const start = index === 0 ? Math.PI / 2 : -Math.PI / 2;
      ctx.beginPath();
      ctx.arc(x, y, arena.arenaRadius - 8, start, start + Math.PI);
      ctx.stroke();
      ctx.restore();
    }
    const scene = get(arena);
    if (!scene || scene.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = scene.alpha;
    ctx.lineWidth = 6;
    ctx.strokeStyle = scene.color || baseColor;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 23;
    ctx.setLineDash(scene.kind === 'cosmic' ? [34, 11, 4, 11] : [19, 8]);
    ctx.lineDashOffset = -arena.time * 32;
    ctx.beginPath();
    ctx.arc(x, y, arena.arenaRadius - 3, 0, turn);
    ctx.stroke();
    ctx.restore();
  }

  return { addFinalForm, castUltimate, advance, drawFloor, drawRim };
})();
