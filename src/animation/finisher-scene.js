'use strict';

const FinisherScene = (() => {
  const slowDuration = 1;
  const slowSpeed = .4;
  const dissolveStart = slowDuration + .22;
  const dissolveEnd = dissolveStart + 1.5;
  const panEnd = dissolveEnd + .85;
  const winnerAt = panEnd + .15;
  const duration = winnerAt + 3.2;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const mix = (from, to, t) => from + (to - from) * t;

  function create(winner, loser, rng) {
    return {
      winner, loser, realTimer: 0, victoryPlayed: false, sprite: null,
      fragments: Array.from({ length: 324 }, (_, index) => ({
        col: index % 18, row: Math.floor(index / 18),
        drift: rng(), spin: (rng() - .5) * 4, delay: rng() * .10
      }))
    };
  }

  function frame(arena) {
    const state = arena.koState;
    const age = state.realTimer;
    const { winner, loser } = state;
    const approach = smooth(age / .55);
    const pan = smooth((age - dissolveEnd) / (panEnd - dissolveEnd));
    const loserZoom = Math.min(2.1, 285 / loser.radius);
    const winnerZoom = Math.min(2.35, 260 / winner.radius);
    return {
      phase: age < slowDuration ? 'slow-hit' : age < dissolveStart ? 'hit'
        : age < dissolveEnd ? 'dissolve' : age < panEnd ? 'pan' : 'winner',
      timeScale: age < slowDuration ? slowSpeed : 1,
      hitAge: Math.min(age, slowDuration) * slowSpeed + Math.max(0, age - slowDuration),
      x: mix(mix(arena.centerX, loser.x, approach), winner.x, pan),
      y: mix(mix(arena.centerY, loser.y, approach), winner.y, pan),
      screenY: mix(arena.centerY, 760, pan),
      zoom: mix(mix(1, loserZoom, approach), winnerZoom, pan),
      winnerOpacity: mix(mix(1, .18, smooth(age / slowDuration)), 1, pan),
      dissolve: clamp((age - dissolveStart) / (dissolveEnd - dissolveStart)),
      nameOpacity: smooth((age - winnerAt) / .4),
      complete: age >= duration
    };
  }

  function advance(arena, dt) {
    const state = arena.koState;
    state.realTimer += dt;
    if (!state.victoryPlayed && state.realTimer >= panEnd) {
      state.victoryPlayed = true;
      arena.playVictorySound();
    }
  }

  function applyCamera(ctx, arena) {
    const camera = frame(arena);
    ctx.translate(arena.centerX, camera.screenY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);
  }

  function capture(arena) {
    const state = arena.koState;
    const loser = state.loser;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = Math.ceil(loser.radius * 5);
    arena.drawAvatarOn(sprite.getContext('2d'), loser.char, sprite.width / 2, sprite.height / 2, loser.radius * (1.10 + loser.formStage * .016), {
      form: loser.formStage, pose: 'hit', hurt: 1, wind: 0, time: arena.time, color: FighterForms.color(loser)
    });
    state.sprite = sprite;
    return sprite;
  }

  function drawWorld(ctx, arena) {
    const state = arena.koState;
    const { winner, loser, realTimer: age } = state;
    if (age >= dissolveEnd) return;
    const sprite = state.sprite || capture(arena);
    const shot = frame(arena);
    const progress = shot.dissolve;
    const cell = sprite.width / 18;
    const away = Math.sign(loser.x - winner.x) || 1;
    const color = FighterForms.color(loser);
    const dx = loser.x - winner.x;
    const dy = loser.y - winner.y;
    const distance = Math.hypot(dx, dy) || 1;
    const recoil = Math.sin(clamp(shot.hitAge / .65) * Math.PI) * (1 - progress);
    ctx.save();
    ctx.save();
    ctx.translate(loser.x + dx / distance * loser.radius * .25 * recoil,
      loser.y + dy / distance * loser.radius * .25 * recoil);
    ctx.rotate(dx / distance * recoil * .14);
    ctx.scale(1 - recoil * .12, 1 + recoil * .07);
    ctx.translate(-loser.x, -loser.y);
    if (progress === 0) {
      ctx.drawImage(sprite, loser.x - sprite.width / 2, loser.y - sprite.height / 2);
    } else for (const fragment of state.fragments) {
      const { col, row, drift, spin, delay } = fragment;
      const peel = clamp((progress - (1 - row / 18) * .28 - delay) / .62);
      if (peel >= 1) continue;
      const travel = peel * peel;
      const sx = col * cell;
      const sy = row * cell;
      const x = loser.x - sprite.width / 2 + sx + cell / 2 + away * (35 + drift * 190) * travel;
      const y = loser.y - sprite.height / 2 + sy + cell / 2 - (65 + drift * 210) * travel;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(spin * travel);
      ctx.globalAlpha = (1 - peel) ** .75;
      const size = cell * (1 - peel * .7);
      ctx.drawImage(sprite, sx, sy, cell, cell, -size / 2, -size / 2, size, size);
      if (peel > .04 && Math.hypot(col - 8.5, row - 8) < 4.8) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = drift > .55 ? '#fff4d7' : color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 9;
        ctx.globalAlpha *= Math.sin(peel * Math.PI);
        ctx.fillRect(-size * .25, -size * .25, Math.max(1, size * .36), Math.max(1, size * .36));
      }
      ctx.restore();
    }
    ctx.restore();
    // Play the impact at 0.4x for one second, then resume before the portrait dissolves.
    if (shot.hitAge < .62) {
      const fade = 1 - shot.hitAge / .62;
      const reach = smooth(shot.hitAge / .10);
      ctx.globalAlpha = fade;
      ctx.strokeStyle = FighterForms.color(winner);
      ctx.lineWidth = 8 * fade + 1;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.moveTo(winner.x, winner.y);
      ctx.lineTo(mix(winner.x, loser.x, reach), mix(winner.y, loser.y, reach));
      ctx.stroke();
      ctx.strokeStyle = '#fff8e8';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (reach === 1) {
        ctx.lineWidth = 3;
        ctx.beginPath();
        const spread = loser.radius * (.32 + shot.hitAge * .7);
        for (let ray = 0; ray < 8; ray++) {
          const angle = ray * Math.PI / 4;
          ctx.moveTo(loser.x + Math.cos(angle) * spread * .3, loser.y + Math.sin(angle) * spread * .3);
          ctx.lineTo(loser.x + Math.cos(angle) * spread, loser.y + Math.sin(angle) * spread);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawOverlay(ctx, arena, width, height) {
    const camera = frame(arena);
    const { winner, realTimer: age } = arena.koState;
    const color = FighterForms.color(winner);
    ctx.save();
    const vignette = ctx.createRadialGradient(width / 2, camera.screenY, 250, width / 2, camera.screenY, 1120);
    vignette.addColorStop(0, 'rgba(3,5,13,0)');
    vignette.addColorStop(.55, 'rgba(3,5,13,.18)');
    vignette.addColorStop(1, 'rgba(3,5,13,.94)');
    ctx.globalAlpha = smooth(age / .35);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    if (camera.nameOpacity > 0) {
      ctx.globalAlpha = camera.nameOpacity;
      const rise = (1 - camera.nameOpacity) * 25;
      ctx.translate(0, rise);
      ctx.textAlign = 'center';
      ctx.font = '800 26px Segoe UI, sans-serif';
      ctx.fillStyle = '#e4e7f1';
      ctx.fillText('WINNER', width / 2, 1105);
      ctx.font = '900 68px Segoe UI, sans-serif';
      ctx.shadowColor = color;
      ctx.shadowBlur = 24;
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#080a14';
      ctx.strokeText(winner.char.name, width / 2, 1190, width - 110);
      ctx.fillStyle = color;
      ctx.fillText(winner.char.name, width / 2, 1190, width - 110);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  return { duration, winnerAt, create, frame, advance, applyCamera, drawWorld, drawOverlay };
})();
