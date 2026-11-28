#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const inline = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline, 'index.html is missing its main script');
new vm.Script(inline, { filename: 'index.html' });

const runtimeScripts = [...html.matchAll(/<script src="(src\/[^"\r\n]+\.js)"><\/script>/g)];
const context = vm.createContext({
  window: {},
  Path2D: class Path2D {},
  document: { getElementById: id => id === 'arena-canvas' ? { getContext: () => ({}) } : null }
});
for (const [, file] of runtimeScripts) {
  const program = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(program, context, { filename: file });
}
console.log('PASS: Loaded ' + runtimeScripts.length + ' runtime scripts.');

const controls = inline.indexOf('      const game = new BattleArena();');
assert.ok(controls > 0, 'Could not locate the boundary between the engine and browser controls');
vm.runInContext(inline.slice(0, controls) + [
  'SoundFX.enabled = false;',
  'Object.assign(globalThis, { BattleArena, CHARACTER_REGISTRY, FighterRoster, FighterForms, SkillTimeline, CharacterMoves, UltimateAnimator, ComicSkills, ArenaBounds, CombatMovement, FighterAnimator, SoundFX, FighterPortraits, TransformationScene, FinisherScene });',
  '})();'
].join('\n'), context, { filename: 'index.html' });

const { BattleArena, CHARACTER_REGISTRY: registry, FighterRoster, FighterForms, SkillTimeline, CharacterMoves, UltimateAnimator, ComicSkills, ArenaBounds, CombatMovement, FighterAnimator } = context;
const ids = Object.keys(registry);
assert.equal(ids.length, 28);
assert.equal(new Set(Object.values(registry).map(fighter => fighter.name)).size, 28);
const arena = new BattleArena();
const slots = ['skill1', 'skill2', 'ultimate'];

for (const id of ids) {
  arena.p1Id = id;
  arena.reset();
  const [fighter, target] = arena.fighters;
  assert.equal(fighter.maxHp, 100, id + ' max HP');
  assert.equal(FighterRoster.get(id).forms.length, 5, id + ' forms');
  const ultimates = Array.from({ length: 5 }, (_, form) => CharacterMoves.get(id, form, 'ultimate')?.name);
  assert.ok(ultimates.every(Boolean) && new Set(ultimates).size === 5, id + ' ultimate progression');
  assert.equal(typeof fighter.char.skills.passive, 'function', id + ' passive');

  for (const [stage, hp] of [100, 80, 60, 40, 20].entries()) {
    fighter.currentHp = hp;
    FighterForms.sync(arena, fighter);
    assert.equal(fighter.formStage, stage, id + ' phase at ' + hp + ' HP');
    assert.ok(Number.isFinite(FighterForms.damageMultiplier(fighter)), id + ' damage multiplier');
    for (const slot of slots) {
      SkillTimeline.begin(fighter, target, slot, .7);
      const cast = fighter.skillCast;
      assert.equal(cast.technique, CharacterMoves.get(id, stage, slot)?.technique, id + ' ' + stage + ' ' + slot);
      if (id === 'hulk') assert.ok(cast.technique === 'regeneration' ||
        (cast.contact && ['punch', 'stomp', 'bodyRush', 'grapple', 'hammer'].includes(cast.action)));
      {
        const rig = UltimateAnimator.pose(arena, fighter, fighter.radius);
        assert.equal(rig.hands.length, id === 'sukuna' && stage >= 3 ? 4 : 2, id + ' hands');
        assert.equal(rig.feet, undefined, id + ' hand-only animation');
        assert.equal(rig.elbows.length, rig.hands.length);
        cast.age = cast.charge + .2;
        const released = UltimateAnimator.pose(arena, fighter, fighter.radius);
        assert.notDeepEqual(released.hands, rig.hands, id + ' ultimate release stance');
        cast.age = 0;
      }
      if (cast.kind === 'signature') assert.ok(cast.action && cast.name, id + ' ' + stage + ' ' + slot);
      else assert.equal(typeof fighter.char.skills[slot], 'function', id + ' ' + stage + ' ' + slot);
      SkillTimeline.update(arena, fighter, (cast.charge + .015) / .85);
      assert.ok(Number.isFinite(fighter.x) && Number.isFinite(fighter.vx), id + ' cast state');
      if (ComicSkills.handles(cast.technique)) assert.ok(cast.comic, id + ' comic effect');
    }
  }

  assert.ok(arena.finalFormStages[0], id + ' final arena element');
  fighter.currentHp = 65;
  FighterForms.sync(arena, fighter);
  assert.equal(fighter.formStage, 4, id + ' forms remain unlocked on healing');
}
console.log('PASS: Verified 28 fighters, 140 forms and 420 hand-animated casts.');
assert.equal(CharacterMoves.get('gojo', 4, 'ultimate').technique, 'void');
assert.equal(CharacterMoves.get('sukuna', 1, 'ultimate').technique, 'divineFlame');
assert.equal(CharacterMoves.get('sukuna', 2, 'ultimate').technique, 'tenShadows');
assert.equal(CharacterMoves.get('naruto', 4, 'ultimate').contact, true);
assert.equal(CharacterMoves.get('thanos', 4, 'ultimate').technique, 'snap');
assert.equal(CharacterMoves.get('doraemon', 4, 'ultimate').technique, 'timeCloth');

const square = new BattleArena();
const [left, right] = square.fighters;
const cornerX = square.centerX + square.arenaHalfSize;
const cornerY = square.centerY - square.arenaHalfSize;
const ricochet = { x: cornerX + 4, y: cornerY - 7, vx: 300, vy: -460 };
const wall = ArenaBounds.reflect(square, ricochet);
assert.equal(wall.x, cornerX);
assert.equal(wall.y, cornerY);
assert.equal(ricochet.vx, -300);
assert.equal(ricochet.vy, 460);
assert.ok(ArenaBounds.contains(square, { x: cornerX - 8, y: cornerY + 8 }));
Object.assign(left, { x: cornerX - left.boundaryRadius, y: cornerY + left.boundaryRadius + 9, vx: 0, vy: 0 });
Object.assign(right, { x: cornerX - right.boundaryRadius - 12, y: cornerY + right.boundaryRadius, vx: 0, vy: 0 });
square.resolveBallCollision();
assert.ok(Math.hypot(left.x - right.x, left.y - right.y) > left.radius + right.radius);
assert.ok(square.fighters.every(fighter => ArenaBounds.contains(square, fighter, fighter.boundaryRadius)));

square.reset();
square.running = true;
const [shooter, dodger] = square.fighters;
Object.assign(shooter, { x: square.centerX - 220, y: square.centerY, vx: 0, vy: 0 });
Object.assign(dodger, { x: square.centerX + 30, y: square.centerY, vx: 0, vy: 0 });
SkillTimeline.begin(shooter, dodger, 'skill1');
const attack = shooter.skillCast;
Object.assign(attack, { action: 'volley', age: attack.charge + .17, nodes: [
  { x: dodger.x - 150, y: dodger.y, vx: 1050, vy: 0 }
] });
CombatMovement.advance(square, 1 / 60);
assert.ok(Math.abs(dodger.vy) > Math.abs(dodger.vx), 'The fighter sidesteps the incoming shot');
assert.ok(CombatMovement.avoids(dodger, shooter, attack));
assert.ok(!CombatMovement.avoids(dodger, shooter, {}), 'The dodge protects against the telegraphed attack');
assert.ok(square.floatingTexts.some(text => text.text === 'NÉ ĐÒN'), 'The dodge has a callout');
const dodgeHit = square.applyDamage(shooter, dodger, 5, { color: '#fff', attack, skill: attack, isRanged: true });
assert.ok(dodgeHit.blocked && dodgeHit.amount === 0);
assert.equal(square.skillHits.length, 0, 'A dodged attack must not leave an impact');
assert.equal(dodger.skillReaction, null);
console.log('PASS: Verified square walls, corner separation, and a directional dodge against an incoming shot.');

const strike = new BattleArena();
strike.p1Id = 'hulk';
strike.p2Id = 'ironman';
strike.reset();
strike.elapsed = 30;
strike.time = 30;
const [striker, defender] = strike.fighters;
SkillTimeline.begin(striker, defender, 'ultimate');
const smash = striker.skillCast;
const start = FighterAnimator.pose(defender, strike.time, false, false);
const landed = strike.applyDamage(striker, defender, 6, { color: smash.color, skill: smash, attack: smash });
assert.ok(landed.amount > 0, 'The skill landed');
assert.equal(strike.skillHits.length, 1);
assert.equal(defender.skillReaction.mode, 'heavy');
assert.ok(FighterAnimator.pose(defender, strike.time, false, false).x > start.x, 'Defender recoils away from the caster');
assert.equal(UltimateAnimator.pose(strike, defender, defender.radius).clip, 'flinch');
assert.equal(FighterAnimator.reaction(defender, strike.time + .45), null, 'The flinch ends after recovery');
console.log('PASS: A landed skill creates directional recoil and impact art, while a dodge creates neither.');

for (const [duration, side, p1 = 'spider_man', p2 = 'hulk'] of [[3.4, 1], [30, 0], [60, 1], [93.7, 0], [60, 0, 'hulk', 'hulk']]) {
  const battle = new BattleArena();
  battle.p1Id = p1;
  battle.p2Id = p2;
  battle.matchDuration = duration;
  battle.winnerPreference = String(side);
  battle.reset();
  battle.running = true;
  let finisher;
  const applyDamage = battle.applyDamage.bind(battle);
  battle.applyDamage = (attacker, defender, amount, opts) => {
    const before = defender.currentHp;
    const hit = applyDamage(attacker, defender, amount, opts);
    if (attacker.char.id === 'hulk') assert.ok(!opts.isRanged, 'Hulk must use physical attacks');
    if (opts.isPaced || opts.isFinisher) {
      assert.ok(Math.hypot(attacker.x - defender.x, attacker.y - defender.y) <= attacker.radius + defender.radius + 24,
        'Scheduled damage requires contact');
    }
    if (opts.isFinisher) finisher = { before, dealt: hit.amount, time: battle.elapsed };
    return hit;
  };
  let halfway;
  const halfSize = battle.arenaHalfSize;
  for (let step = 0; !battle.koState && step < duration * 70 + 1; step++) {
    assert.ok(battle.fighters.every(fighter => fighter.currentHp > 0), 'Early K.O.');
    battle.update(1 / 60);
    if (!battle.koState) assert.ok(battle.fighters.every(fighter => ArenaBounds.contains(battle, fighter, fighter.boundaryRadius)), 'Portrait left the square');
    if (!halfway && battle.elapsed >= duration / 2) halfway = battle.fighters.map(fighter => fighter.currentHp);
  }
  assert.ok(halfway?.every(hp => hp > 34 && (duration <= 6 || hp < 70)) && halfway.some(hp => hp < 90),
    `Damage was not distributed across the match: duration=${duration}, HP=${halfway}`);
  assert.ok(battle.projectiles.every(shot => shot.owner.char.id !== 'hulk'), 'Hulk cannot create projectiles');
  assert.ok(finisher && finisher.before > 0 && finisher.before <= 10, 'Closing hit must use the small remaining HP');
  assert.equal(finisher.dealt, finisher.before);
  assert.equal(finisher.time, duration);
  assert.equal(battle.elapsed, duration);
  assert.equal(battle.koState.winner.side, side);
  assert.equal(battle.koState.loser.currentHp, 0);
  assert.equal(battle.arenaHalfSize, halfSize);
  assert.ok(battle.finalFormStages.every(Boolean), 'Both final arena elements should coexist');
}
console.log('PASS: Damage is spread across timed matches, including a real last hit at 60 seconds.');

const duel = new BattleArena();
duel.p1Id = 'spider_man';
duel.p2Id = 'hulk';
duel.reset();
duel.running = true;
duel.elapsed = 48;
let transformationSounds = 0;
duel.playTransformationSound = () => transformationSounds++;
const [spider, hulk] = duel.fighters;
for (const fighter of duel.fighters) {
  fighter.currentHp = 20;
  FighterForms.sync(duel, fighter);
}
assert.ok(hulk.radius > hulk.char.radius * 1.5);
const positions = duel.fighters.map(fighter => [fighter.x, fighter.y]);
for (let frame = 0; frame < 50; frame++) duel.update(1 / 60);
assert.deepEqual(duel.fighters.map(fighter => [fighter.x, fighter.y]), positions);
assert.ok(duel.elapsed > 48.8, 'The countdown continues during the freeze');
assert.equal(duel.transformation.active.fighter, spider);
assert.equal(spider.formBefore, null, 'The portrait switches during the zoom');
assert.ok(hulk.formBefore, 'Simultaneous transformations are shown in order');
assert.equal(transformationSounds, 1, 'The first transformation sounds once');
assert.equal(duel.turn.age, 0, 'The one-second cinematic pauses the turn clock');
for (let frame = 0; frame < 12; frame++) duel.update(1 / 60);
assert.equal(spider.skillCast.action, 'webArena');
assert.ok(spider.skillCast.age >= spider.skillCast.charge, 'The ultimate releases without charging again');
for (let frame = 0; frame < 23; frame++) duel.update(1 / 60);
const lattice = spider.skillCast.spectacle.paths.flat();
assert.ok(Math.max(...lattice.map(point => point.x)) - Math.min(...lattice.map(point => point.x)) > duel.arenaHalfSize * 1.78);
for (let frame = 0; frame < 94; frame++) duel.update(1 / 60);
assert.ok(duel.finalFormStages.every(Boolean));
assert.equal(transformationSounds, 2, 'Each final transformation has its own sound');
assert.ok(hulk.pendingFinalUltimate, 'The defender waits for its attack turn after transforming');
for (let frame = 0; !hulk.skillCast && frame < 180; frame++) duel.update(1 / 60);
assert.equal(hulk.skillCast?.action, 'stomp');
assert.ok(hulk.skillCast?.contact);
assert.equal(duel.turn.side, hulk.side);
assert.ok(duel.ultimateDomains[1]);
console.log('PASS: Final-form scenes freeze combat, then launch each ultimate on its own turn.');

const turns = new BattleArena();
turns.running = true;
const [first, second] = turns.fighters;
const hp = first.currentHp;
assert.equal(turns.applyDamage(second, first, 10, {}).amount, 0, 'The runner cannot attack');
assert.equal(first.currentHp, hp);
for (let frame = 0; frame < 89; frame++) turns.update(1 / 60);
assert.equal(turns.turn.side, 0);
assert.equal(second.castIndex, 0, 'The defender never starts a skill');
SkillTimeline.begin(first, second, 'ultimate');
turns.projectiles.push({ owner: first });
turns.update(1 / 60);
assert.equal(turns.turn.side, 1, 'Turns switch after 1.5 seconds');
assert.equal(first.skillCast, null, 'Outgoing attacks stop on the turn boundary');
assert.equal(turns.projectiles.length, 0, 'Old projectiles cannot attack during the other turn');
for (let frame = 0; frame < 89; frame++) turns.update(1 / 60);
assert.equal(turns.turn.side, 1);
assert.equal(second.castIndex, 1);
turns.update(1 / 60);
assert.equal(turns.turn.side, 0);
const pausedTurn = turns.turn.age;
turns.running = false;
turns.update(.05);
assert.equal(turns.turn.age, pausedTurn, 'Pausing freezes the turn timer');
turns.reset();
assert.equal(turns.turn.side, 0);
assert.equal(turns.turn.age, 0);
assert.equal(turns.fighters[0].char.radius, 62 * 1.5);
assert.equal(turns.centerY - turns.arenaHalfSize, 455);

SkillTimeline.begin(turns.fighters[0], turns.fighters[1]);
const slowCast = turns.fighters[0].skillCast;
SkillTimeline.update(turns, turns.fighters[0], .1);
assert.ok(Math.abs(slowCast.age - .085) < 1e-10, 'Skill animation advances at 0.85 speed');
console.log('PASS: Alternating 1.5-second turns, pause/reset, 1.5x size and 0.85x cast speed.');

const { SoundFX, FighterPortraits } = context;
const tones = [];
const originalTone = SoundFX.tone;
SoundFX.tone = tone => tones.push(tone);
SoundFX.hit(false);
const normalGain = tones[0].gain;
tones.length = 0;
SoundFX.hit(true);
assert.ok(tones[0].gain > normalGain, 'Critical hits are louder');
for (const name of ['miss', 'ultimate', 'transform', 'ko', 'victory']) {
  tones.length = 0;
  SoundFX[name]();
  assert.ok(tones.length > 0 && tones.every(tone => tone.gain > 0), name + ' has audible SFX');
}
assert.ok(tones.some(tone => tone.delay > 0 && Math.abs(tone.pan) > .5), 'Victory has delayed stereo echoes');
SoundFX.tone = originalTone;

let missed = 0;
const originalMiss = SoundFX.miss;
SoundFX.miss = () => missed++;
turns.time = 10;
slowCast.age = slowCast.charge;
SkillTimeline.cancel(turns, turns.fighters[0]);
assert.equal(missed, 1, 'An attack that never connects plays a miss sound');
turns.playMissSound(slowCast);
assert.equal(missed, 1, 'A missed cast sounds once');
turns.time++;
SkillTimeline.begin(turns.fighters[0], turns.fighters[1]);
turns.fighters[0].skillCast.landed = true;
SkillTimeline.cancel(turns, turns.fighters[0]);
assert.equal(missed, 1, 'A landed cast never sounds like a miss');
SoundFX.miss = originalMiss;

const hitCanvas = new Proxy({}, { get: () => () => {} });
for (const id of ids) {
  for (const [form, health] of [100, 80, 60, 40, 20].entries()) {
    const hurtArena = new BattleArena();
    hurtArena.p2Id = id;
    hurtArena.reset();
    hurtArena.elapsed = 59;
    hurtArena.rng = () => .99;
    const [attacker, victim] = hurtArena.fighters;
    victim.currentHp = health;
    FighterForms.sync(hurtArena, victim);
    const hit = hurtArena.applyDamage(attacker, victim, 1, { isPaced: true, color: '#fff' });
    assert.ok(hit.amount > 0, id + ' receives a regular hit');
    assert.ok(victim.skillReaction, id + ' recoils from regular hits');
    const hurtPose = FighterAnimator.pose(victim, hurtArena.time, false, false);
    assert.equal(hurtPose.pose, 'hit', id + ' hurt pose in form ' + form);
    assert.equal(UltimateAnimator.pose(hurtArena, victim, victim.radius).clip, 'flinch');
    FighterPortraits.drawHit(hitCanvas, id, 0, 0, victim.radius, hurtPose);
  }
}
console.log('PASS: Hit/miss, critical, ultimate, transformation and K.O. SFX; hurt poses for all 140 forms.');

const { FinisherScene } = context;
const finale = new BattleArena();
finale.elapsed = finale.matchDuration;
finale.finishTimedMatch();
const ending = finale.koState;
assert.equal(finale.floatingTexts.length, 0, 'Combat labels never cover the final scene');
assert.equal(ending.fragments.length, 324);
assert.equal(FinisherScene.frame(finale).zoom, 1, 'The final camera starts at the normal view');
let victorySounds = 0;
finale.playVictorySound = () => victorySounds++;
FinisherScene.advance(finale, .5);
const closeup = FinisherScene.frame(finale);
assert.equal(closeup.phase, 'slow-hit');
assert.equal(closeup.timeScale, .4);
assert.equal(closeup.hitAge, .2, 'Half a real second advances the finishing strike by 0.2 seconds');
assert.equal(closeup.dissolve, 0, 'The defeated portrait stays intact during the slow strike');
assert.ok(closeup.zoom > 1);
assert.equal(closeup.nameOpacity, 0, 'The winner title never covers the final hit');

let sprites = 0;
let tilesDrawn = 0;
const makeCanvasContext = () => new Proxy({
  globalAlpha: 1,
  drawImage: () => tilesDrawn++,
  createRadialGradient: () => ({ addColorStop() {} }),
  createLinearGradient: () => ({ addColorStop() {} }),
  measureText: text => ({ width: text.length * 12 })
}, { get: (target, key) => key in target ? target[key] : () => {} });
context.document.createElement = name => {
  assert.equal(name, 'canvas');
  sprites++;
  return { width: 0, height: 0, getContext: makeCanvasContext };
};
const endingCanvas = makeCanvasContext();
FinisherScene.drawWorld(endingCanvas, finale);
assert.equal(sprites, 1, 'The defeated portrait is captured to its own canvas');
assert.equal(tilesDrawn, 1, 'The slow strike draws the intact portrait, without splitting it');
FinisherScene.drawWorld(endingCanvas, finale);
assert.equal(sprites, 1, 'The captured portrait is reused for the animation');
FinisherScene.advance(finale, .5);
assert.equal(FinisherScene.frame(finale).phase, 'hit');
assert.equal(FinisherScene.frame(finale).timeScale, 1, 'The strike returns to normal speed after one real second');
assert.equal(FinisherScene.frame(finale).dissolve, 0);
FinisherScene.advance(finale, .1);
assert.ok(Math.abs(FinisherScene.frame(finale).hitAge - .5) < 1e-10, 'The resumed strike advances at normal speed');
FinisherScene.advance(finale, .62);
assert.equal(FinisherScene.frame(finale).phase, 'dissolve');
const beforeFragments = tilesDrawn;
FinisherScene.drawWorld(endingCanvas, finale);
assert.ok(tilesDrawn > beforeFragments + 1, 'Disintegration starts after the resumed hit and draws portrait fragments');
FinisherScene.advance(finale, 2.72 - ending.realTimer + 1e-8);
assert.equal(FinisherScene.frame(finale).phase, 'pan', 'The portrait dissolves for 1.5 seconds after the final hit');
const tilesBefore = tilesDrawn;
FinisherScene.drawWorld(endingCanvas, finale);
assert.equal(tilesDrawn, tilesBefore, 'The defeated fighter is completely gone');
assert.equal(victorySounds, 0);
FinisherScene.advance(finale, .86);
const victoryFrame = FinisherScene.frame(finale);
assert.equal(victoryFrame.phase, 'winner');
assert.equal(victoryFrame.x, ending.winner.x);
assert.equal(victoryFrame.y, ending.winner.y);
assert.equal(victoryFrame.winnerOpacity, 1, 'The winner becomes fully visible after the pan');
assert.equal(victorySounds, 1);
FinisherScene.advance(finale, .6);
assert.equal(FinisherScene.frame(finale).nameOpacity, 1);
const winnerLabels = [];
endingCanvas.fillText = text => winnerLabels.push(text);
finale.roundRect = () => assert.fail('The final scene must not draw a statistics box');
FinisherScene.drawOverlay(endingCanvas, finale, 1080, 1920);
assert.deepEqual(winnerLabels, ['WINNER', ending.winner.char.name], 'Only the winner label and name remain');
assert.equal(victorySounds, 1, 'The victory sound only plays once');
assert.ok(FinisherScene.duration >= FinisherScene.winnerAt + 3, 'Recordings hold the winner title for at least three seconds');
FinisherScene.advance(finale, FinisherScene.duration);
assert.ok(FinisherScene.frame(finale).complete);
finale.reset();
assert.equal(finale.koState, null, 'Restart clears the previous final scene');
assert.ok(!html.includes('ATTACKS ·'), 'The visible turn banner is removed');
assert.ok(!html.includes("strokeText('K.O!'"), 'The K.O. title is replaced');
const slowClock = new BattleArena();
slowClock.finishTimedMatch();
const timeBeforeHit = slowClock.time;
slowClock.update(.05);
assert.ok(Math.abs(slowClock.time - timeBeforeHit - .02) < 1e-10, 'The impact effects run at 0.4x speed');
assert.equal(slowClock.koState.realTimer, .05, 'The cinematic keeps real time while the impact slows down');
slowClock.koState.realTimer = 1;
const timeAfterSlowdown = slowClock.time;
slowClock.update(.05);
assert.ok(Math.abs(slowClock.time - timeAfterSlowdown - .05) < 1e-10, 'The impact effects return to normal speed');
console.log('PASS: One-second final strike at 0.4x, normal-speed recovery, dissolve, winner camera and no stats box.');

const audioState = Object.fromEntries(['ctx', 'masterBus', 'battleBus', 'battleSource', 'battlePlaying', 'audioEnabled', 'enabled']
  .map(key => [key, SoundFX[key]]));
const gains = [];
let loopsStarted = 0;
const audioNode = () => ({
  connect() {},
  frequency: { value: 0 },
  gain: { value: 0, setTargetAtTime(value) { this.value = value; } },
  start() { loopsStarted++; }
});
SoundFX.ctx = {
  state: 'running', sampleRate: 8000, currentTime: 0,
  createBuffer: (_, length) => { const samples = new Float32Array(length); return { getChannelData: () => samples }; },
  createBufferSource: audioNode,
  createBiquadFilter: audioNode,
  createGain: () => { const node = audioNode(); gains.push(node.gain); return node; }
};
SoundFX.masterBus = audioNode();
SoundFX.battleBus = SoundFX.battleSource = null;
SoundFX.battlePlaying = false;
SoundFX.enabled = true;
SoundFX.syncBattle(true);
assert.equal(loopsStarted, 1);
assert.ok(gains[0].value > 0 && gains[0].value < normalGain / 20, 'The PK bed stays much quieter than impacts');
SoundFX.syncBattle(true);
assert.equal(loopsStarted, 1, 'Updating the battle never duplicates the background loop');
SoundFX.syncBattle(false);
assert.equal(gains[0].value, 0, 'Pause or finish fades out the battle bed');
SoundFX.syncBattle(true);
assert.equal(loopsStarted, 1, 'Resume reuses the loop');
SoundFX.enabled = false;
SoundFX.syncBattle(true);
assert.equal(gains[0].value, 0, 'SFX OFF mutes the bed');
assert.equal(SoundFX.masterBus.gain.value, 0, 'SFX OFF also mutes scheduled victory echoes');
Object.assign(SoundFX, audioState);
console.log('PASS: Very quiet battle audio, one loop, pause/resume and full SFX mute.');
