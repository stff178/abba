'use strict';

const CharacterMoves = (() => {
  // Each row is the tactical attack, close/support follow-up and ultimate for one form.
  const kits = {
    spider_man: [
      ['Web Shot/web', 'Wall Swing/webSwing', 'Web Sling Takedown/webSwing'],
      ['Organic Web/web', 'Symbiote Lash/tether', 'Black Web Cocoon/web'],
      ['Iron Arm Pin/ironArms', 'Wrist Web/web', 'Iron Spider Pincer/ironArms'],
      ['Wrist Stinger/stinger', 'Totem Silk/web', 'Stinger and Silk/stinger'],
      ['Star Web/web', 'Cosmic Sling/webSwing', 'Infinite Spider Web/webArena']
    ],
    ironman: [
      ['Palm Repulsor/repulsor', 'Armor Ram/bodyRush', 'Chest Unibeam/unibeam'],
      ['Shoulder Micro-Missiles/missile', 'Twin Palm Repulsors/repulsor', 'Two-Palm Repulsor Burst/twinRepulsor'],
      ['Armor Assembly/guard', 'Repulsor Pass/repulsor', 'Iron Legion Crossfire/ironArmor'],
      ['Nano Blade/nanoBlade', 'Nano Shield/guard', 'Nanotech Unibeam/unibeam'],
      ['Mark 85 Twin Repulsors/twinRepulsor', 'Nano Blade/nanoBlade', 'Nano Gauntlet Snap/snap']
    ],
    wolverine: [
      ['Claw Swipe/claws', 'Feral Lunge/claws', 'Adamantium Crosscut/claws'],
      ['Containment Break/claws', 'Reverse Claw Counter/claws', 'Weapon X Breakout/claws'],
      ['Feral Crosscut/claws', 'Berserker Grapple/grapple', 'Berserker Barrage/claws'],
      ['Heated Claw Swipe/hotClaws', 'Rising Claws/hotClaws', 'Red-Hot Crosscut/hotClaws'],
      ['Healing Factor/regeneration', 'Adamantium Hook/claws', 'Last Stand Barrage/claws']
    ],
    deadpool: [
      ['Katana Cross/dualBlades', 'Quickdraw/trickShot', 'Twin Katana Flourish/dualBlades'],
      ['X-Force Quickdraw/trickShot', 'Gray Katana Feint/dualBlades', 'X-Force Counterstrike/dualBlades'],
      ['Healing Factor/regeneration', 'Returning Counter/dualBlades', 'Back-on-My-Feet Encore/dualBlades'],
      ['Symbiote Lash/tether', 'Symbiote Katana/dualBlades', 'Venompool Double Cut/dualBlades'],
      ['Comic Panel Rip/panel', 'Katana Feint/dualBlades', 'Fourth Wall Slash/panel']
    ],
    captain_america: [
      ['Shield Throw/shieldThrow', 'Shield Bash/shieldBash', 'Vibranium Ricochet/shieldThrow'],
      ['Shield Cover/shieldGuard', 'Shield Counter/shieldBash', 'Captain’s Tactical Ricochet/shieldThrow'],
      ['Energy Shield/shieldGuard', 'Energy Shield Edge/shieldBash', 'Kinetic Shield Pulse/kinetic'],
      ['Mjolnir Throw/hammerThrow', 'Worthy Shield Counter/shieldBash', 'Worthy Thunder/lightning'],
      ['Sentinel Shield Throw/shieldThrow', 'Gauntlet Guard/shieldGuard', 'Infinity Gauntlet Push/powerStone']
    ],
    thor: [
      ['Mjolnir Throw/hammerThrow', 'Mjolnir Strike/hammer', 'Mjolnir Thunder/lightning'],
      ['Odinforce Lightning/lightning', 'Hammer Recall/hammerThrow', 'Odinforce Storm/lightning'],
      ['Stormbreaker Swing/hammer', 'Stormbreaker Throw/hammerThrow', 'Stormbreaker Bifrost Descent/bifrost'],
      ['Mjolnir Recall/hammerThrow', 'Twin Weapon Clash/dualHammer', 'Mjolnir and Stormbreaker/dualHammer'],
      ['King Thor Hammer/hammer', 'Skyfather Thunder/lightning', 'All-Father’s Storm/lightning']
    ],
    hulk: [
      ['Heavy Hook/punch', 'Shoulder Charge/bodyRush', 'Hulk Smash/stomp'],
      ['Body Hook/punch', 'Counter Grapple/grapple', 'Gray Hulk Uppercut/uppercut'],
      ['Arena Grapple/grapple', 'Gladiator Hammer/hammer', 'Sakaar Hammer Slam/hammer'],
      ['Warbound Shoulder/bodyRush', 'Double-Fist Smash/punch', 'Worldbreaker Faultline/stomp'],
      ['Immortal Hook/punch', 'Gamma Recovery/regeneration', 'Immortal Hulk Smash/stomp']
    ],
    doctor_strange: [
      ['Crimson Bands/mysticBands', 'Mystic Shield/guard', 'Crimson Bands of Cyttorak/mysticBands'],
      ['Eye of Agamotto/guard', 'Astral Double/illusion', 'Astral Projection/illusion'],
      ['Sling Ring Gate/portal', 'Images of Ikonn/illusion', 'Mirror Dimension Fold/mirror'],
      ['Time Loop/timeStone', 'Ring of Binding/mysticBands', 'Eye of Agamotto Reversal/timeStone'],
      ['Multiverse Gate/portal', 'Mirror Shards/mirror', 'Multiverse Mirror Array/mirror']
    ],
    scarlet_witch: [
      ['Hex Bolt/hexBolt', 'Warding Hex/guard', 'Hex Probability Burst/chaos'],
      ['Telekinetic Pull/telekinesis', 'Chaos Bolt Pair/hexBolt', 'Telekinetic Crush/telekinesis'],
      ['Chaos Sigil/chaos', 'Scarlet Barrier/guard', 'Chaos Magic Convergence/chaos'],
      ['Reality Fold/reality', 'Seeking Hex/hexBolt', 'Reality Rewritten/reality'],
      ['Scarlet Reality/reality', 'Possibility Shift/chaos', 'House of M Hex/reality']
    ],
    thanos: [
      ['Titan Punch/punch', 'Titan Grapple/grapple', 'Titan Overpower/stomp'],
      ['Power Stone Pulse/powerStone', 'Titan Fist/punch', 'Power Stone Release/powerStone'],
      ['Space Stone Gate/portal', 'Reality Stone Shift/reality', 'Space and Reality Fold/reality'],
      ['Time Stone Slow/timeStone', 'Mind Stone Pulse/telekinesis', 'Time Stone Reversal/timeStone'],
      ['Stone Volley/stones', 'Space Stone Rift/portal', 'Infinity Snap/snap']
    ],
    black_panther: [
      ['Vibranium Claws/claws', 'Panther Rush/bodyRush', 'Panther Claw Takedown/claws'],
      ['Kinetic Storage/guard', 'Charged Claw/claws', 'Vibranium Kinetic Pulse/kinetic'],
      ['Herb-Boosted Claw/claws', 'Panther Counter/bodyRush', 'Ancestral Pounce/claws'],
      ['Ancestral Guard/guard', 'Legacy Claw Chain/claws', 'Ancestral Kinetic Burst/kinetic'],
      ['Bast’s Claws/claws', 'Ancestor Echo/ancestor', 'Ancestral Procession/ancestor']
    ],
    loki: [
      ['Illusion Feint/illusion', 'Asgardian Dagger/daggers', 'Hall of Mischief/illusion'],
      ['Jotunn Ice Shards/frost', 'Frost Dagger/daggers', 'Jotunn Ice Fan/frost'],
      ['Double Illusion/illusion', 'Vanishing Blade/daggers', 'Illusion Court/illusion'],
      ['Time Slip/portal', 'Temporal Decoy/illusion', 'Timeline Loop/timeStone'],
      ['Timeline Thread/thread', 'Timeline Gate/portal', 'Yggdrasil Weave/thread']
    ],
    venom: [
      ['Symbiote Lash/tether', 'Venom Grapple/grapple', 'Symbiote Capture/tether'],
      ['Heavy Symbiote Punch/punch', 'Symbiote Slam/stomp', 'Symbiote Body Crush/grapple'],
      ['Swarm Lash/tendrils', 'Symbiote Snare/tether', 'Tendril Swarm/tendrils'],
      ['Black Wing Rush/bodyRush', 'Winged Tendril/tether', 'Black Wings Dive/bodyRush'],
      ['Hive Tendrils/tendrils', 'Symbiote Slam/stomp', 'Symbiote World Grasp/tendrils']
    ],
    doctor_doom: [
      ['Armor Ray/beam', 'Armor Force Field/guard', 'Gauntlet Discharge/beam'],
      ['Doombot Patrol/doomBots', 'Armored Fist/punch', 'Doombot Crossfire/doomBots'],
      ['Mystic Ward/guard', 'Sorcery Portal/portal', 'Doom Sorcery Circle/chaos'],
      ['Power Cosmic Ray/cosmicRay', 'Cosmic Ward/guard', 'Cosmic Doom Discharge/cosmicRay'],
      ['Battleworld Rift/reality', 'God Emperor Ward/guard', 'Battleworld Rewrite/reality']
    ],
    ghost_rider: [
      ['Hellfire Chain/hellChain', 'Hellfire Trail/flame', 'Chain Lasso/hellChain'],
      ['Flaming Chain Hook/hellChain', 'Hellfire Rider Charge/bodyRush', 'Hellfire Circuit/flame'],
      ['Hellfire Fan/flame', 'Flaming Chain Return/hellChain', 'Hellfire Breath/hellBreath'],
      ['Chain Restraint/hellChain', 'Judgment Glare/penance', 'Penance Stare/penance'],
      ['Hellfire Sweep/flame', 'Zarathos Chain/hellChain', 'Zarathos Chain Arena/hellChain']
    ],
    black_widow: [
      ['Widow’s Bite/widowBite', 'Baton Sweep/baton', 'Bite and Baton/baton'],
      ['Tactical Batons/baton', 'Widow’s Bite Pair/widowBite', 'Tactical Baton Counter/baton'],
      ['Stealth Feint/guard', 'Baton Counter/baton', 'Close-Quarters Takedown/grapple'],
      ['Widow’s Bite Circuit/widowBite', 'Twin Batons/baton', 'Widow’s Bite Overload/widowBite'],
      ['Red Room Baton/baton', 'Widow’s Bite Trap/widowBite', 'Red Room Counterstrike/baton']
    ],
    magneto: [
      ['Metal Shards/metalShards', 'Magnetic Deflection/magnet', 'Metal Barrage/metalShards'],
      ['Magnetic Force Field/guard', 'Magnetic Shrapnel/metalShards', 'Metal Orbit Trap/magnet'],
      ['Polarity Pull/magnet', 'Floating Shard Fan/metalShards', 'Magnetic Lift/magnet'],
      ['Omega Polarity/magnet', 'Metal Crossfire/metalShards', 'Omega Magnetic Field/magnet'],
      ['Magnetic Shield/guard', 'Magnetic Shrapnel/metalShards', 'Geomagnetic Collapse/reversal']
    ],
    captain_marvel: [
      ['Photon Blast/photon', 'Flight Punch/bodyRush', 'Photon Impact/photon'],
      ['Energy Absorption/absorb', 'Photon Return/photon', 'Absorbed Energy Release/photon'],
      ['Warbird Counter/punch', 'Aerial Charge/bodyRush', 'Warbird Flight Strike/bodyRush'],
      ['Binary Flight Strike/bodyRush', 'Twin Photon Bolts/twinPhoton', 'Binary Photon Burst/nova'],
      ['Cosmic Photon Blast/photon', 'Stellar Rush/bodyRush', 'Binary Stellar Core/nova']
    ],
    moon_knight: [
      ['Crescent Dart/crescent', 'Crescent Blade/moonBlade', 'Crescent Ricochet/crescent'],
      ['Baton Cross/baton', 'Mr. Knight Guard/guard', 'Mr. Knight Baton Flurry/baton'],
      ['Lunar Crescent/crescent', 'Lunar Guard/guard', 'Lunar Crescent Sweep/moonBlade'],
      ['Khonshu Crescent/crescent', 'Lunar Blade/moonBlade', 'Fist of Khonshu Assault/moonBlade'],
      ['Eclipse Crescent/crescent', 'Moon Blade Rush/moonBlade', 'Eclipse Crescent Storm/eclipse']
    ],
    silver_surfer: [
      ['Power Cosmic Ray/cosmicRay', 'Board Sweep/boardRush', 'Silver Cosmic Burst/cosmicRay'],
      ['Cosmic Charge/guard', 'Board Skim/boardRush', 'Charged Power Cosmic/cosmicRay'],
      ['Cosmic Orbit/orbit', 'Cosmic Ray/cosmicRay', 'Power Cosmic Convergence/nova'],
      ['Dark Matter Well/gravity', 'Black Board Pass/boardRush', 'Dark Cosmic Pulse/cosmicRay'],
      ['Galactic Power Cosmic/cosmicRay', 'Cosmic Board Dive/boardRush', 'Cosmic Singularity/gravity']
    ],
    gojo: [
      ['Limitless Infinity/guard', 'Cursed Technique Lapse: Blue/blue', 'Six Eyes: Blue Pull/blue'],
      ['Blue Pull/blue', 'Lapse Counter/punch', 'Maximum Output Blue/blue'],
      ['Reversal: Red/red', 'Infinity Guard/guard', 'Maximum Output Red/red'],
      ['Blue and Red Setup/red', 'Lapse: Blue/blue', '200% Hollow Purple/purple'],
      ['Hollow Technique: Purple/purple', 'Limitless Guard/guard', 'Domain Expansion: Unlimited Void/void']
    ],
    sukuna: [
      ['Dismantle/cursedSlash', 'Cleave/cleave', 'Malevolent Shrine/shrine'],
      ['Dismantle Cross/cursedSlash', 'Cleave Counter/cleave', 'Divine Flame: Open/divineFlame'],
      ['Divine Dog/tenShadows', 'Nue Lightning/lightning', 'Mahoraga: Ten Shadows/tenShadows'],
      ['Cleave Palm/cleave', 'Dismantle Sign/cursedSlash', 'World-Cutting Slash/worldSlash'],
      ['World-Cutting Dismantle/worldSlash', 'Cleave Crosscut/cleave', 'Open Domain: Malevolent Shrine/shrine']
    ],
    naruto: [
      ['Shadow Clone Jutsu/ninjaClone', 'Rasengan/rasengan', 'Multi Shadow Clone Combo/ninjaClone'],
      ['Frog Kata/punch', 'Sage Rasengan/rasengan', 'Wind Style: Rasenshuriken/rasenshuriken'],
      ['Kurama Chakra Arm/tether', 'Chakra Rasengan/rasengan', 'Tailed Beast Bomb/chakraBomb'],
      ['Truth-Seeking Orbs/orbit', 'Shadow Clone Assault/ninjaClone', 'Six Paths Rasenshuriken/rasenshuriken'],
      ['Baryon Counter/baryon', 'Baryon Palm/baryon', 'Baryon Close-Quarters Barrage/baryon']
    ],
    luffy: [
      ['Gum-Gum Pistol/elastic', 'Gum-Gum Bell/elastic', 'Gum-Gum Gatling/elasticFlurry'],
      ['Jet Pistol/elastic', 'Jet Bullet/elastic', 'Jet Gatling/elasticFlurry'],
      ['Gigant Pistol/giantFist', 'Gigant Rifle/elastic', 'Gigant Elephant Gun/dawnFists'],
      ['Kong Gun/elastic', 'Python/elastic', 'King Kong Gun/dawnFists'],
      ['Dawn Rocket/elastic', 'Dawn Gatling/elasticFlurry', 'Gear 5: Bajrang Gun/dawnFists']
    ],
    eren: [
      ['Cadet ODM Blade/odm', 'Twin Blade Counter/dualBlades', 'Scout Assault/odm'],
      ['Attack Titan Hook/punch', 'Titan Grapple/grapple', 'Attack Titan Ground Smash/stomp'],
      ['Hardened Knuckles/crystalPunch', 'Coordinate Call/coordinate', 'Hardened Titan Pummel/crystalPunch'],
      ['War Hammer Floor Spikes/warHammer', 'Crystal Guard/guard', 'War Hammer Spike Field/warHammer'],
      ['Founding Titan Command/coordinate', 'Titan Advance/titanMarch', 'Founding Titan: The Rumbling/titanMarch']
    ],
    levi: [
      ['Reverse-Grip Knife/reverseBlade', 'Quick Counter/reverseBlade', 'Underground Knife Flurry/reverseBlade'],
      ['ODM Blade Rush/odm', 'Twin Blade Slash/dualBlades', 'Ackerman Spinning Cut/odm'],
      ['Ackerman Cut/dualBlades', 'Grapple Feint/odm', 'Ackerman High-Speed Duel/odm'],
      ['Thunder Spear Volley/thunderSpears', 'Reverse Blade Flurry/odm', 'Thunder Spear Barrage/thunderSpears'],
      ['Ackerman Blade Charge/odm', 'Thunder Spear Pass/thunderSpears', 'Beast Titan Pursuit/odm']
    ],
    doraemon: [
      ['Air Cannon/airCannon', 'Small Light/smallLight', 'Air Cannon Gust/airCannon'],
      ['Take-copter Dive/copter', 'Air Cannon Puff/airCannon', 'Take-copter Air Cannon/airCannon'],
      ['Small Light Sweep/smallLight', 'Air Cannon Burst/airCannon', 'Small Light Double Sweep/smallLight'],
      ['Anywhere Door Escape/door', 'Air Cannon Counter/airCannon', 'Anywhere Door Surprise/door'],
      ['Time Cloth Cover/timeCloth', 'Small Light Assist/smallLight', 'Time Cloth Rewind/timeCloth']
    ],
    frieren: [
      ['Defensive Magic/guard', 'Binding Magic/mysticBands', 'Focused Zoltraak/zoltraak'],
      ['Zoltraak Pierce/zoltraak', 'Hexagonal Defense/guard', 'Zoltraak Array/zoltraak'],
      ['Judradjim Lightning/judradjim', 'Vollzanbel Fire/flame', 'Vollzanbel Flame Wave/flame'],
      ['Barrier Analysis/guard', 'Dispel Magic/dispel', 'Barrier-Breaking Spell/dispel'],
      ['Zoltraak Crossfire/zoltraak', 'Binding Ward/mysticBands', 'Grand Zoltraak Barrage/zoltraak']
    ]
  };

  const variations = {
    repulsor: 'beam', unibeam: 'beam', missile: 'volley', ironArmor: 'satellite', doomBots: 'satellite',
    shieldThrow: 'ricochet', hammerThrow: 'ricochet', crescent: 'ricochet', frost: 'volley',
    powerStone: 'shock', timeStone: 'gravity', hexBolt: 'volley', photon: 'beam', cosmicRay: 'beam',
    blue: 'gravity', red: 'shock', purple: 'volley', void: 'gravity', shrine: 'moonClaws',
    cursedSlash: 'beam', illusion: 'clone', ninjaClone: 'clone', chakraBomb: 'volley',
    rasenshuriken: 'volley', elasticFlurry: 'dawnFists', hellChain: 'tether', penance: 'chaos',
    thunderSpears: 'volley', airCannon: 'shock', smallLight: 'beam', door: 'portal',
    zoltraak: 'beam', kinetic: 'guard', metalShards: 'volley', widowBite: 'beam',
    warHammer: 'stomp', copter: 'rush', webSwing: 'bodyRush', ironArms: 'claws', stinger: 'claws',
    twinRepulsor: 'beam', twinPhoton: 'beam', nanoBlade: 'sword', hotClaws: 'claws', uppercut: 'punch',
    dualBlades: 'sword', moonBlade: 'sword', reverseBlade: 'sword', daggers: 'sword', trickShot: 'volley',
    shieldGuard: 'guard', regeneration: 'guard', absorb: 'guard', bifrost: 'hammer', dualHammer: 'hammer',
    mysticBands: 'tether', mirror: 'portal', reality: 'chaos', telekinesis: 'gravity', tendrils: 'tether',
    thread: 'tether', ancestor: 'clone', hellBreath: 'flame', reversal: 'magnet', eclipse: 'volley',
    cleave: 'claws', worldSlash: 'beam', baryon: 'punch', crystalPunch: 'punch', coordinate: 'titanMarch',
    tenShadows: 'shadowSummon', divineFlame: 'volley', giantFist: 'dawnFists', timeCloth: 'cloth',
    dispel: 'dispel', judradjim: 'lightning', snap: 'snap', panel: 'panel'
  };

  const close = new Set(['punch', 'stomp', 'bodyRush', 'grapple', 'claws', 'sword', 'shieldBash',
    'hammer', 'kick', 'webKick', 'rasengan', 'odm', 'baton', 'boardRush', 'warHammer', 'copter', 'webSwing', 'ironArms', 'stinger', 'nanoBlade', 'hotClaws', 'uppercut',
    'dualBlades', 'moonBlade', 'reverseBlade', 'daggers', 'dualHammer', 'cleave', 'baryon', 'crystalPunch']);

  function get(id, form, slot) {
    const index = slot === 'ultimate' ? 2 : slot === 'skill2' ? 1 : 0;
    const entry = kits[id]?.[form]?.[index];
    if (!entry) return null;
    const [name, technique] = entry.split('/');
    return { name, technique, action: variations[technique] || technique, contact: close.has(technique) };
  }

  return { get };
})();
