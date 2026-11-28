'use strict';

// Each form supplies its display name and accent color.
const FighterRoster = (() => {
  function fighter(name, theme, finale, forms, options = {}) {
    return { name, theme, finale, forms, ...options };
  }

  const profiles = {
    spider_man: fighter('SPIDER-MAN', 'web', 'Infinite Spider Web', [
      ['Classic Spider-Man', '#ec5165'],
      ['Advanced Suit', '#8dacff'],
      ['Iron Spider', '#ffd379'],
      ['Symbiote Spider-Man', '#b6a7ee'],
      ['Cosmic Spider-Man', '#8aefff']
    ], { passive: 'webDodge', speed: 414 }),
    ironman: fighter('IRON MAN', 'satellite', 'Stark Satellite Network', [
      ['Mark III', '#ff7c66'],
      ['Mark VII', '#65dcff'],
      ['Mark XLII', '#ffc469'],
      ['Mark L Nanotech', '#fa9d8c'],
      ['Cosmic Godkiller', '#ffdf8d']
    ], { finisher: 'satellite' }),
    wolverine: fighter('WOLVERINE', 'claw', 'Berserker Arena', [
      ['Classic Wolverine', '#ffd36c'],
      ['Weapon X', '#b1e4f3'],
      ['Berserker', '#ff826f'],
      ['Adamantium Rage', '#cbd9f3'],
      ['Immortal Berserker', '#fff0a0']
    ], { passive: 'regeneration', speed: 404, finisher: 'claw' }),
    deadpool: fighter('DEADPOOL', 'glitch', 'Game Error', [
      ['Classic Deadpool', '#fb6677'],
      ['X-Force Deadpool', '#bbc5d4'],
      ['Regeneration Mode', '#f8948f'],
      ['Venompool', '#d89ab9'],
      ['Fourth Wall Deadpool', '#ff94c4']
    ], { passive: 'regeneration', speed: 402 }),
    captain_america: fighter('CAPTAIN AMERICA', 'shield', 'Vibranium Field', [
      ['Classic Captain', '#6a9afa'],
      ['Tactical Captain', '#9fbcff'],
      ['Vibranium Overload', '#daacff'],
      ['Worthy Captain', '#9af1ff'],
      ['Cosmic Sentinel', '#ffd4ac']
    ]),
    thor: fighter('THOR', 'storm', 'Ragnarok Storm', [
      ['God of Thunder', '#82ccff'],
      ['Awakened Thor', '#ffde89'],
      ['Stormbreaker Thor', '#87d9ff'],
      ['Rune King Thor', '#b9adff'],
      ['Cosmic King Thor', '#bfecff']
    ], { finisher: 'lightning' }),
    hulk: fighter('HULK', 'gamma', 'World Breaker', [
      ['Classic Hulk', '#89d86c'],
      ['Angry Hulk', '#b1eb76'],
      ['Gladiator Hulk', '#f9d38d'],
      ['World War Hulk', '#a8f46a'],
      ['World Breaker Hulk', '#d3ff8d']
    ], { growth: .145, weight: .40, slowdown: .055 }),
    doctor_strange: fighter('DOCTOR STRANGE', 'mirror', 'Mirror Dimension', [
      ['Master of Mystic Arts', '#ffad74'],
      ['Sorcerer Supreme', '#ffd08d'],
      ['Mirror Master', '#87dcff'],
      ['Strange Supreme', '#c994ff'],
      ['Multiverse Strange', '#ffcf83']
    ], { speed: 382 }),
    scarlet_witch: fighter('SCARLET WITCH', 'chaos', 'Chaos Reality', [
      ['Wanda Maximoff', '#ed637e'],
      ['Scarlet Witch', '#ff5474'],
      ['Chaos Witch', '#ff8fa3'],
      ['Reality Weaver', '#de85fb'],
      ['House of M', '#ff94bd']
    ], { passive: 'hex', speed: 383 }),
    thanos: fighter('THANOS', 'stones', 'Infinity Universe', [
      ['Armored Thanos', '#c59cf5'],
      ['Power Stone', '#c785ff'],
      ['Space & Reality', '#80cdff'],
      ['Time & Mind', '#e3f385'],
      ['Infinity Thanos', '#ffd297']
    ], { speed: 380, growth: .035, weight: .23 }),
    black_panther: fighter('BLACK PANTHER', 'panther', 'Ancestral Plane', [
      ['Panther Suit', '#abb7ef'],
      ['Vibranium Charge', '#a688ff'],
      ['Golden Panther', '#ffcc7c'],
      ['Ancestral Panther', '#c3a5ff'],
      ['Avatar of Bast', '#d8b5ff']
    ], { passive: 'kinetic', speed: 414 }),
    loki: fighter('LOKI', 'timeline', 'Yggdrasil Timeline', [
      ['God of Mischief', '#a7dc87'],
      ['Frost Giant Loki', '#8ce4ff'],
      ['Illusion Master', '#bcf983'],
      ['Time Weaver', '#8eedbd'],
      ['God of Stories', '#d7ffc2']
    ], { passive: 'trickster', speed: 396 }),
    venom: fighter('VENOM', 'symbiote', 'Symbiote World', [
      ['Classic Venom', '#d0bdf2'],
      ['Enhanced Venom', '#c58bff'],
      ['Symbiote Swarm', '#db8fc7'],
      ['Winged Venom', '#a68be5'],
      ['King in Black', '#e8ace9']
    ], { speed: 390, growth: .055, weight: .19, slowdown: .02 }),
    doctor_doom: fighter('DOCTOR DOOM', 'doom', 'Battleworld', [
      ['Classic Doom', '#a0e4a0'],
      ['Doombot Commander', '#9deecb'],
      ['Sorcerer Doom', '#d1a7fd'],
      ['Cosmic Doom', '#9ad7ff'],
      ['God Emperor Doom', '#e6f6db']
    ], { passive: 'techWard', speed: 384 }),
    ghost_rider: fighter('GHOST RIDER', 'chain', 'Hellfire Arena', [
      ['Classic Ghost Rider', '#ff9d62'],
      ['Hellfire Rider', '#ff774c'],
      ['Blue Flame Rider', '#84dcff'],
      ['Spirit of Vengeance', '#ffb871'],
      ['Cosmic Ghost Rider', '#d0adff']
    ], { speed: 409, finisher: 'tether' }),
    black_widow: fighter('BLACK WIDOW', 'tactical', 'Tactical Network', [
      ['Classic Widow', '#ff927f'],
      ['Tactical Widow', '#88dcff'],
      ['Stealth Widow', '#b3bdfd'],
      ['Advanced Agent', '#ff7c99'],
      ['Red Room Protocol', '#ff99ae']
    ], { passive: 'webDodge', speed: 424 }),
    magneto: fighter('MAGNETO', 'metal', 'Magnetic Collapse', [
      ['Classic Magneto', '#f285a7'],
      ['Magnetic Master', '#d79aff'],
      ['White Magneto', '#dfebff'],
      ['Omega Magneto', '#f9a7dd'],
      ['Magnetic Sovereign', '#ffd4f1']
    ], { passive: 'techWard', speed: 387 }),
    captain_marvel: fighter('CAPTAIN MARVEL', 'stellar', 'Stellar Core', [
      ['Captain Marvel', '#ffc86b'],
      ['Photon Overload', '#ffab6a'],
      ['Energy Absorption', '#ffe68f'],
      ['Binary Form', '#ff9279'],
      ['Cosmic Binary', '#fff0a1']
    ], { passive: 'absorb', speed: 418 }),
    moon_knight: fighter('MOON KNIGHT', 'moon', 'Temple of Khonshu', [
      ['Moon Knight', '#cbdcf9'],
      ['Mr. Knight', '#f7eee4'],
      ['Lunar Knight', '#abcfff'],
      ['Fist of Khonshu', '#d7c2ff'],
      ['Eclipse Avatar', '#ffd596']
    ], { passive: 'trickster', speed: 396 }),
    silver_surfer: fighter('SILVER SURFER', 'singularity', 'Cosmic Singularity', [
      ['Classic Silver Surfer', '#c4e4fc'],
      ['Cosmic Charge', '#89dfff'],
      ['Power Cosmic', '#c4c4ff'],
      ['Silver Surfer Black', '#9b9fe5'],
      ['Cosmic Transcendence', '#e1f9ff']
    ], { speed: 416, finisher: 'gravity' }),
    gojo: fighter('GOJO SATORU', 'infinity', 'Limitless Horizon', [
      ['Base Form', '#00f3ff'],
      ['Six Eyes', '#81eaff'],
      ['Limitless Unbound', '#d7bdff'],
      ['Infinity Fracture', '#e6a5ff'],
      ['Hollow Limitless', '#eae1ff']
    ], { passive: 'infinityDodge' }),
    sukuna: fighter('RYOMEN SUKUNA', 'shrine', 'Shrine of Ruin', [
      ['Base Form', '#fb4b72'],
      ['Cursed Surge', '#ff7997'],
      ['Shrine Unsealed', '#ff5579'],
      ['Cursed Crown', '#ff987a'],
      ['King of Curses', '#ffb0b8']
    ]),
    naruto: fighter('NARUTO UZUMAKI', 'fox', 'Nine-Tails Horizon', [
      ['Base Form', '#ff8b42'],
      ['Chakra Mantle', '#ffd477'],
      ['Nine-Tails Cloak', '#ff945c'],
      ['Sage of Six Paths', '#ffcb67'],
      ['Solar Fox', '#ffe999']
    ]),
    luffy: fighter('MONKEY D. LUFFY', 'cloud', 'Dawn Playground', [
      ['Gear 1', '#ff7968'],
      ['Gear 2', '#ffb086'],
      ['Gear 4', '#ff8e79'],
      ['Gear 5', '#e7deff'],
      ['Dawn Monkey', '#ffe0b2']
    ], { finisher: 'tether' }),
    eren: fighter('EREN YEAGER', 'titan', 'Titan Faultline', [
      ['Base Form', '#77ba91'],
      ['Titan Surge', '#aee6a9'],
      ['Attack Titan', '#e3bc8e'],
      ['Warhammer Aspect', '#d1d9d2'],
      ['Founding Titan', '#a2e4c4']
    ], { growth: .085, weight: .22, slowdown: .03 }),
    levi: fighter('LEVI ACKERMAN', 'blades', 'Ackerman Crosswind', [
      ['Base Form', '#93d4cc'],
      ['Ackerman Focus', '#9ae9dc'],
      ['Ackerman Overdrive', '#bde8ff'],
      ['Silver Vortex', '#d2c4ff'],
      ['Wings of Resolve', '#e2f4fa']
    ]),
    doraemon: fighter('DORAEMON', 'pocket', 'Twenty-Second Century', [
      ['Base Form', '#4fb8f1'],
      ['Pocket Boost', '#78edff'],
      ['Future Mode', '#a9b8ff'],
      ['Anywhere Gate', '#ead0f9'],
      ['Future Guardian', '#a6f9ff']
    ]),
    frieren: fighter('FRIEREN', 'runes', 'Astral Constellation', [
      ['Base Form', '#88dec3'],
      ['Hidden Power', '#a6e6c1'],
      ['Astral Weave', '#e0c7ff'],
      ['Star Scribe', '#c4d4ff'],
      ['Celestial Mage', '#f4deff']
    ])
  };

  function get(id) { return profiles[id]; }

  function form(fighter) {
    return get(fighter.char.id)?.forms[fighter.formStage];
  }

  return { get, form, ids: Object.keys(profiles) };
})();
