'use strict';

const FormPortraits = (() => {
  // Each outfit describes a silhouette, its identifying garment or mask, and two materials.
  const outfits = {
    spider_man: [
      ['liquid','whiteSpider','#25273b','#edeeff'], ['carapace','ironSpider','#762c46','#f5c471'],
      ['fangs','totemEyes','#a83757','#efb6ad'], ['starlight','universeMask','#29284b','#9deeff']
    ],
    ironman: [
      ['jetpods','missileCollar','#8f2d3e','#edab67'], ['modules','modularPlate','#caa66f','#f5e8b6'],
      ['feathers','triReactor','#a92645','#8cf2ef'], ['gauntlets','gauntlet','#9d3847','#f4cc8b']
    ],
    wolverine: [
      ['cables','visor','#777d89','#f27979'], ['fangs','rageMask','#88533e','#ffc36d'],
      ['embers','hotMask','#552b3c','#ffac66'], ['armor','xClasp','#253253','#ffce64']
    ],
    deadpool: [
      ['scabbards','harness','#565665','#d9dae3'], ['wrap','patchedMask','#862d4b','#eec8b1'],
      ['liquid','symbioteEyes','#492644','#e6a8d0'], ['panels','panelRip','#ad355f','#ffd7c9']
    ],
    captain_america: [
      ['harness','rank','#304b75','#adc6e8'], ['plates','energyShield','#1f4d7f','#99e9fa'],
      ['thunder','worthyBrooch','#405771','#dfedff'], ['gauntlets','gauntlet','#364369','#eec590']
    ],
    thor: [
      ['mantle','godBrooch','#8b384d','#e8c581'], ['thunder','axeBrooch','#324b5d','#93d9e8'],
      ['armor','doubleBrooch','#583d57','#e9c3b0'], ['plume','kingHelm','#535279','#f5dfb1']
    ],
    hulk: [
      ['pinstripe','shirtTie','#4b4c62','#e1d2ba'], ['armor','arenaPlates','#855140','#e1bc7a'],
      ['harness','warHarness','#516047','#e9b678'], ['rubble','immortalMarks','#33463e','#c7ef8a']
    ],
    doctor_strange: [
      ['astral','eyeBrooch','#34446f','#ffd298'], ['shards','mirrorClasp','#39707c','#aae4f2'],
      ['clock','timeBrooch','#405849','#a9ecb7'], ['mantle','thirdEye','#6e2e57','#ffcb91']
    ],
    scarlet_witch: [
      ['mantle','maroonCollar','#7e2a48','#ee9aa6'], ['embers','witchDiadem','#a52c52','#ff9aa8'],
      ['shards','witchDiadem','#672b65','#e8a9f6'], ['panels','houseCrown','#963055','#ffcccd']
    ],
    thanos: [
      ['gauntlets','powerGem','#714798','#d5a3ff'], ['plates','dualGem','#505077','#90cdf8'],
      ['clock','triGem','#62556a','#efd992'], ['armor','gauntlet','#73604d','#ffe3a5']
    ],
    black_panther: [
      ['plates','pantherSeams','#353052','#bf87ff'], ['fangs','herbEyes','#483450','#f4c077'],
      ['ancestral','clawNecklace','#352646','#c8abeb'], ['ancestral','bastMask','#2f2941','#ebcbbb']
    ],
    loki: [
      ['ice','frostMarks','#357080','#bdf4fc'], ['astral','daggerClasp','#346954','#c6eb83'],
      ['clock','tvaCollar','#66504e','#ecc99a'], ['branches','branchHorns','#2c573a','#d6df92']
    ],
    venom: [
      ['liquid','whiteSpider','#373044','#f0e4f2'], ['spines','symbioteEyes','#472f54','#eb9edd'],
      ['wings','wingSigil','#342743','#a389d3'], ['spines','kingSigil','#191f33','#df90bf']
    ],
    doctor_doom: [
      ['modules','doomClasp','#41705d','#b6d2b4'], ['mantle','mysticBrooch','#4d576f','#dec0f2'],
      ['starlight','cosmicMask','#344f6d','#a8ecfa'], ['plume','emperorMask','#ada99b','#ffffe7']
    ],
    ghost_rider: [
      ['chains','chainCollar','#694039','#f0a465'], ['embers','fireCheeks','#354978','#a4dfff'],
      ['chains','spiritEyes','#473246','#ffe2a3'], ['spines','zarathosCrown','#55304f','#ff927c']
    ],
    black_widow: [
      ['harness','widowBadge','#394b62','#a9dbea'], ['wrap','stealthMask','#2f344b','#aab4dd'],
      ['gauntlets','widowBadge','#523346','#ff8eaa'], ['armor','redRoom','#5a283b','#f09cab']
    ],
    magneto: [
      ['plates','fieldCollar','#683c70','#d9aef8'], ['mantle','whiteHelm','#a4afc2','#f3f7fc'],
      ['rubble','omegaHelm','#733555','#fbaac3'], ['magnetism','polarityHelm','#581f50','#ffb4de']
    ],
    captain_marvel: [
      ['gauntlets','starBadge','#4b5271','#ffd785'], ['harness','warbirdBadge','#263651','#e0b872'],
      ['embers','binaryEyes','#a33b49','#ffc27c'], ['starlight','binaryCrest','#9c3c56','#fff2ad']
    ],
    moon_knight: [
      ['pinstripe','whiteSuit','#c6bcc0','#fff5df'], ['plates','crescentCrest','#576a89','#c6e8ff'],
      ['ancestral','khonshuBeak','#5c536e','#f1e4d9'], ['eclipse','eclipseCrest','#423959','#ffc899']
    ],
    silver_surfer: [
      ['board','surferLines','#5583a7','#caf7ff'], ['orbit','silverStar','#68648f','#e1ddff'],
      ['eclipse','blackSilver','#24263c','#9f9ddb'], ['board','surferCrown','#739abd','#efffff']
    ],
    gojo: [
      ['gravity','blueEyes','#274969','#9bdcff'], ['pulse','redEyes','#783450','#ff9da8'],
      ['eclipse','purpleEyes','#59366d','#e1beff'], ['void','domainEyes','#36375c','#c5d3ff']
    ],
    sukuna: [
      ['embers','shibuyaInk','#7b374b','#f8a984'], ['shadows','megumiVeil','#292636','#a18cad'],
      ['harness','heianMask','#733e57','#e8b1aa'], ['shrine','shrineInk','#633746','#f1b3b7']
    ],
    naruto: [
      ['mantle','sageEyes','#933f40','#e9bf86'], ['fox','chakraSeal','#ad633b','#ffdf83'],
      ['orbit','sixPathsMarks','#a27044','#ffedb4'], ['fox','baryonMask','#9d3d38','#ffb76c']
    ],
    luffy: [
      ['steam','jetMarks','#a54355','#ffb3a1'], ['giant','giantGlove','#9a473a','#e7af75'],
      ['steam','boundmanPaint','#482b45','#dd8990'], ['cloud','dawnBrow','#9e86bd','#fff0d8']
    ],
    eren: [
      ['fangs','titanJaw','#734b52','#dfaa94'], ['crystal','hardenedJaw','#665c77','#d8e4f1'],
      ['spikes','warHammerMask','#a9aab6','#f2ebe5'], ['ribcage','foundingJaw','#7e736d','#f2e4bd']
    ],
    levi: [
      ['mantle','scoutCravat','#45665a','#c5dbb8'], ['scabbards','ackermanStraps','#4b4b5f','#bac5d3'],
      ['jetpods','spearHarness','#5f5960','#eadbbc'], ['scabbards','scoutClasp','#37494e','#c4dbe3']
    ],
    doraemon: [
      ['copter','copterBand','#376fb9','#ffd29d'], ['pulse','smallLightBadge','#4185ab','#ffdc91'],
      ['door','doorClasp','#a34e82','#ffaed8'], ['cloth','clothBell','#b44773','#ffb6bd']
    ],
    frieren: [
      ['orbit','rubyStaffClasp','#6f6578','#e8c3a8'], ['thunder','dualSpellClasp','#554a70','#eccaff'],
      ['shards','wardDiadem','#696a8e','#dbe7ff'], ['starlight','goldRunes','#676286','#fff0c5']
    ]
  };

  const silhouette = {
    liquid:'M.57 .71Q1.02 .36.95-.08Q1.39-.09 1.29-.47Q1.63-.22 1.38.24Q1.65.55 1.24.69L1.1 .94Z',
    carapace:'M.52 .67L.95 .19L1.18-.58L1.46-.89L1.35-.57L1.28.23L1.58.12L1.49.41L1.16.80Z',
    fangs:'M.53 .72L.80 .14L1.17-.31L1.08.19L1.40.03L1.33.43L1.16.75Z',
    starlight:'M.54 .51L.91-.45L1.08-.80L1.09-.40L1.52-.61L1.32-.14L1.61.16L1.21.22L1.30.65Z',
    jetpods:'M.54 .71L.82-.44L1.18-.66L1.43-.26L1.33.61L1.05.92Z',
    modules:'M.48 .67L.83.11L1.13-.02L1.37.17L1.30.57L1.05.83Z M.91-.28L1.07-.53L1.41-.61L1.48-.32L1.30-.12Z',
    feathers:'M.49 .61L1.03-.41L1.54-.69L1.37-.27L1.65-.30L1.37.08L1.56.15L1.28.38L1.14.72Z',
    gauntlets:'M.47 .63L.76.39L1.09.26L1.40.39L1.46.65L1.21.90L.63.88Z',
    cables:'M.56 .72C1.49 1.01.88-.2 1.48-.29L1.48-.39C.76-.39 1.29.8.59.57Z M.72 .6C1.24.58 1.35.05 1.16-.42L1.07-.32C1.20.04 1.11.42.67.49Z',
    embers:'M.56 .61Q.81.28.80-.11Q.99.10 1.05.27Q1.37-.09 1.15-.53Q1.58-.20 1.35.26Q1.59.10 1.61.08Q1.56.49 1.20.83Z',
    armor:'M.46 .66L.79.29L1.11.16L1.46.36L1.42.64L1.13.88L.54.91Z',
    scabbards:'M.57 .67L1.04-.74L1.32-.89L1.42-.66L.97.51L.81.94Z',
    wrap:'M.47 .62Q.85.49 1.13.18L1.35.32L1.17.53L1.49.51L1.32.70L1.12.79L.54.89Z',
    panels:'M.52 .65L.82-.47L1.46-.56L1.28-.20L1.57-.03L1.38.15L1.50.35L1.07.75Z',
    harness:'M.51 .75L.70.34L1.00.31L1.20.61L1.44.67L1.29.88L.57.91Z',
    plates:'M.53 .60L.86.21L1.19.08L1.46.32L1.33.76L1.07.94L.55.87Z',
    thunder:'M.55 .60L.86.01L1.20-.44L1.14-.11L1.55-.24L1.38.11L1.59.18L1.30.40L1.18.73Z',
    mantle:'M.51 .70L.72.06L1.01-.04Q1.19.15 1.18.39L1.52.72Q1.19.94.56.89Z',
    plume:'M.53 .75L.84.19Q1.36.25 1.49-.27L1.50.19L1.39.59L1.56.68L1.25.88Z',
    pinstripe:'M.41 .66Q.75.35 1.14.37L1.40.69L1.28.89L.49.94Z',
    rubble:'M.49 .68L.82.27L.95.53L1.19.31L1.42.41L1.31.62L1.55.70L1.17.92Z M1.17-.07L1.35-.22L1.53-.10L1.47.18L1.21.13Z',
    astral:'M.57 .71Q1.24.44 1.09-.09Q1.47.11 1.38.44Q1.54.33 1.65.34Q1.51.69 1.21.87Z',
    shards:'M.56 .64L.89.17L.94-.12L1.14.16L1.49-.04L1.41.47L1.22.85Z M1.15-.40L1.45-.75L1.45-.32L1.28-.20Z',
    clock:'M.56 .72Q1.52.77 1.45.07Q1.44-.48 1.01-.53Q1.38-.22 1.29.13Q1.17.52.58.53Z',
    ancestral:'M.48 .72L.83.25L.91-.18L1.15.10L1.42-.03L1.39.54Q1.26.90.49.97Z',
    ice:'M.54 .68L.88.02L1.10-.21L1.04.14L1.39-.16L1.38.42L1.52.54L1.28.79L1.07.95Z',
    branches:'M.55 .75L.89.32L1.08.07L1.36-.17L1.21.19L1.53.04L1.59.17L1.14.50L1.44.48L1.58.63L1.04.78Z',
    spines:'M.54 .64L.88.05L1.15-.21L1.08.22L1.40-.01L1.32.37L1.60.25L1.37.63L1.11.89Z',
    wings:'M.45 .79L.85.24L.96-.37L1.60-.71L1.43-.17L1.29.18L1.65.00L1.46.46L1.10.84Z',
    chains:'M.59 .49Q1.03.72 1.31.11L1.44.11Q1.22.92.61.68Z M.65.75L1.30.67L1.39.81L.67.90Z',
    magnetism:'M.47 .76Q1.42.60 1.33-.33L1.55-.45Q1.69.56 1.03.92Z M.92-.66L1.18-.83L1.38-.54L1.25-.39L1.04-.46Z',
    eclipse:'M.51 .73Q1.62.58 1.40-.41Q1.32-.73.99-.85Q1.57-.78 1.61-.17Q1.72.65.78.91Z',
    board:'M.44 .76Q.92.80 1.63.49Q1.68.73 1.41.83Q.81 1.01.38.91Z',
    orbit:'M.50 .65Q1.15.53 1.53-.08L1.59-.13Q1.40.61.65.81Z',
    gravity:'M.54 .73Q1.30.49 1.42-.27Q1.34-.57 1.17-.70Q1.73-.57 1.56-.05Q1.38.59.67.91Z',
    pulse:'M.47 .73L1.11.54L1.02.21L1.60-.07L1.36.24L1.49.41L1.21.85Z',
    void:'M.45 .63L.91-.12L1.37-.36L1.22.02L1.62-.10L1.35.32L1.43.57L1.03.84Z',
    shadows:'M.50 .69L.88-.16L1.14-.75L1.24-.27L1.50-.59L1.44-.05L1.59.11L1.43.58L1.16.81Z',
    shrine:'M.48 .68L.77.01L1.31.04L1.62-.13L1.47.18L.83.27L.70.79Z M.76.42L1.47.31L1.35.47L.75.61Z',
    fox:'M.54 .66Q.96.19.95-.32Q1.37.06 1.13.42Q1.48.20 1.49-.18Q1.72.28 1.41.59L1.09.90Z',
    steam:'M.46 .75Q.77.40 1.06.49Q1.25.46 1.09.33Q.96.28 1.06.18Q1.29.03 1.49.21Q1.65.48 1.31.68Q1.01.94.49.88Z',
    giant:'M.44 .73Q.76.28 1.17.23Q1.58.29 1.57.64Q1.41 1.00.91.94Z',
    cloud:'M.48 .73Q.73.54.89.61Q.91.34 1.16.43Q1.37.21 1.54.39Q1.70.62 1.42.68Q1.31.87 1.07.81Q.96.96.56.91Z',
    crystal:'M.49 .66L.85.13L1.14-.07L1.14.14L1.45.00L1.40.57L1.27.86L.57.94Z',
    spikes:'M.55 .69L.82.19L.97-.47L1.15.12L1.44-.23L1.39.40L1.61.51L1.30.86Z',
    ribcage:'M.46 .75Q1.35.35 1.51-.35Q1.76.01 1.51.32L1.31.61L.59.89Z M.77.79L1.40.56L1.57.38L1.51.69L1.23.90Z',
    copter:'M-.05-.97L.07-.97L.06-1.29L.84-1.37L.91-1.47L.07-1.43L.07-1.52L-.07-1.52L-.07-1.43L-.88-1.39L-.89-1.30L-.05-1.30Z',
    door:'M.56 .87L.54-.70L.70-.91L1.42-.89L1.42 .86L1.24 .86L1.22-.71L.73-.70L.73 .87Z',
    cloth:'M.47 .66Q.90.28 1.25.41Q1.44.35 1.53.57Q1.24.99 .99.85L.55.91Z'
  };

  const masks = {
    whiteSpider:'M0 .50L.10 .58L.33 .53L.43 .43L.41 .64L.19 .74L.12 .91H-.12L-.19 .74L-.41 .64L-.43 .43L-.33 .53L-.10 .58Z',
    ironSpider:'M-.48 .68L-.32 .57L-.13 .71L0 .61L.13 .71L.32 .57L.48 .68L.25 .87L0 .82L-.25 .87Z',
    totemEyes:'M-.67-.19L-.45-.10L-.24 .22L-.48 .16L-.66 .02Z M.67-.19L.45-.10L.24 .22L.48 .16L.66 .02Z',
    universeMask:'M-.63-.20L-.49-.55L0-.73L.49-.55L.63-.20L.48-.41L0-.47L-.48-.41Z',
    missileCollar:'M-.57 .53L-.28 .68L0 .60L.28 .68L.57 .53L.49 .80L0 .93L-.49 .80Z',
    modularPlate:'M-.57 .50L-.28 .53L-.05 .68L.12 .57L.55 .5L.39 .83L0 .92L-.36 .83Z',
    triReactor:'M-.36 .62L.36 .62L.22 .76L0 .94L-.22 .76Z', gauntlet:'M-.43 .68L-.27 .57L.29 .59L.43 .70L.34 .84L-.34 .85Z',
    visor:'M-.68-.29Q0-.44.68-.29L.59 .075L.31 .17L-.31 .17L-.59 .075Z',
    rageMask:'M-.65 .27L-.35 .36L-.26 .54L-.60 .49Z M.65 .27L.35 .36L.26 .54L.60 .49Z',
    hotMask:'M-.72-.65L-.45-.49L-.56-.18L-.34-.06L-.60 .13L-.79-.11Z M.72-.65L.45-.49L.56-.18L.34-.06L.60 .13L.79-.11Z',
    xClasp:'M-.22 .60L-.33 .68L-.15 .78L-.30 .89L-.17 .97L0 .84L.17 .97L.30 .89L.15 .78L.33 .68L.22 .60L0 .73Z',
    harness:'M-.57 .46L-.32 .57L-.09 .86L-.33 .84Z M.57 .46L.32 .57L.09 .86L.33 .84Z',
    patchedMask:'M-.54 .33L-.16 .42L-.20 .58L-.39 .55L-.53 .47Z',
    symbioteEyes:'M-.69-.29Q-.42-.38-.17-.16L-.34 .13L-.55 .16Z M.69-.29Q.42-.38.17-.16L.34 .13L.55 .16Z',
    panelRip:'M-.63 .30L-.46 .38L-.51 .48L-.26 .56L-.41 .62L-.66 .49L-.56 .43Z M.60-.69L.43-.61L.51-.53L.34-.46L.52-.44L.70-.55L.60-.61Z',
    rank:'M-.46 .62L-.14 .68L0 .81L.14 .68L.46 .62L.48 .74L0 .96L-.48 .74Z',
    energyShield:'M-.65 .55L-.22 .63L0 .83L.22 .63L.65 .55L.54 .77L0 .96L-.54 .77Z',
    worthyBrooch:'M-.32 .68L.32 .68L.33 .79L.10 .82L.10 .99H-.10L-.10 .82L-.33 .79Z',
    godBrooch:'M-.48 .57L-.30 .65L-.15 .85L-.36 .85Z M.48 .57L.30 .65L.15 .85L.36 .85Z',
    axeBrooch:'M-.29 .70L-.16 .60L0 .71L.29 .63L.37 .88L.10 .82L0 .95L-.12 .80Z',
    doubleBrooch:'M-.38 .64L-.16 .58L.35 .82L.26 .95Z M.38 .64L.16 .58L-.35 .82L-.26 .95Z',
    kingHelm:'M-.66-.45L-.73-.75L-.43-.87L-.27-.55L0-.98L.27-.55L.43-.87L.73-.75L.66-.45L.35-.64L0-.50L-.35-.64Z',
    shirtTie:'M-.50 .59L-.17 .67L0 .78L.17 .67L.50 .59L.39 .86L.09 .81L.16 .86L0 1.02L-.16 .86L-.09 .81L-.39 .86Z',
    arenaPlates:'M-.76-.52L-.56-.72L-.46-.56L-.51 .22L-.67 .27Z M.76-.52L.56-.72L.46-.56L.51 .22L.67 .27Z',
    warHarness:'M-.57 .53L-.36 .51L.34 .80L.58 .67L.49 .93L-.37 .78Z',
    immortalMarks:'M-.51 .09L-.41 .16L-.45 .25L-.31 .39L-.54 .30L-.49 .22Z M.51 .09L.41 .16L.45 .25L.31 .39L.54 .30L.49 .22Z',
    eyeBrooch:'M-.36 .73Q0 .51 .36 .73Q0 .99-.36 .73Z', mirrorClasp:'M0 .59L.30 .76L0 .94L-.30 .76Z',
    timeBrooch:'M-.29 .69L0 .58L.29 .69L.29 .85L0 .96L-.29 .85Z', thirdEye:'M-.21-.41Q0-.56 .21-.41Q0-.26-.21-.41Z',
    maroonCollar:'M-.57 .55L-.29 .60L0 .78L.29 .60L.57 .55L.43 .82L0 .96L-.43 .82Z',
    witchDiadem:'M-.56-.43L-.38-.76L-.12-.55L0-.91L.12-.55L.38-.76L.56-.43L.29-.58L0-.48L-.29-.58Z',
    houseCrown:'M-.67-.40L-.64-.80L-.38-.63L-.21-.97L0-.67L.21-.97L.38-.63L.64-.80L.67-.40L.44-.55L0-.52L-.44-.55Z',
    powerGem:'M0 .49L.25 .72L0 .94L-.25 .72Z',dualGem:'M-.25 .60L-.09 .74L-.25 .89L-.40 .74Z M.25 .60L.09 .74L.25 .89L.40 .74Z',
    triGem:'M0 .57L.13 .71L0 .82L-.13 .71Z M-.31 .69L-.18 .80L-.31 .91L-.45 .80Z M.31 .69L.18 .80L.31 .91L.45 .80Z',
    pantherSeams:'M-.72-.37L-.49-.49L-.35-.41L-.59-.25L-.55 .11L-.40 .38L-.63 .28Z M.72-.37L.49-.49L.35-.41L.59-.25L.55 .11L.40 .38L.63 .28Z',
    herbEyes:'M-.64-.15L-.35-.07L-.20.09L-.48 .03Z M.64-.15L.35-.07L.20 .09L.48 .03Z',
    clawNecklace:'M-.49 .64L-.30 .69L-.35 .86Z M-.16 .72L0 .75L-.13 .96Z M.16 .72L0 .75L.13 .96Z M.49 .64L.30 .69L.35 .86Z',
    bastMask:'M-.68-.64L-.26-.41L0-.59L.26-.41L.68-.64L.51-.34L.27-.26L0-.40L-.27-.26L-.51-.34Z',
    frostMarks:'M-.56 .00L-.44 .16L-.30 .18L-.42 .22L-.52 .15Z M.56 .00L.44 .16L.30 .18L.42 .22L.52 .15Z',
    daggerClasp:'M-.11 .51L.10 .70L.37 .78L.28 .92L.08 .81L-.06 .93L-.16 .86L-.04 .73Z',
    tvaCollar:'M-.51 .63L-.14 .62L0 .78L.14 .62L.51 .63L.43 .88L0 .98L-.43 .88Z',
    branchHorns:'M-.27-.62Q-.78-.75-.96-1.31L-.82-1.21L-.87-1.48L-.67-1.18L-.60-.87Z M.27-.62Q.78-.75.96-1.31L.82-1.21L.87-1.48L.67-1.18L.60-.87Z',
    wingSigil:'M-.54 .58L-.26 .74L0 .65L.26 .74L.54 .58L.39 .84L0 .96L-.39 .84Z',
    kingSigil:'M0 .57L.19 .68L.23 .86L0 1.02L-.23 .86L-.19 .68Z M-.01 .70L-.09 .82L.03 .87L.11 .80Z',
    doomClasp:'M-.45 .63L-.22 .56L-.14 .77L-.39 .87Z M.45 .63L.22 .56L.14 .77L.39 .87Z',
    mysticBrooch:'M-.32 .78L0 .57L.32 .78L0 .96Z M-.13 .78L0 .88L.13 .78L0 .67Z',
    cosmicMask:'M-.62 .12L-.39 .18L-.36 .39L-.19 .53L-.47 .43Z M.62 .12L.39 .18L.36 .39L.19 .53L.47 .43Z',
    emperorMask:'M-.65-.21L-.51-.35L-.36-.32L-.08-.14L0-.25L.08-.14L.36-.32L.51-.35L.65-.21L.52-.20L.37-.10L.15-.08L0-.12L-.15-.08L-.37-.10L-.52-.20Z',
    chainCollar:'M-.48 .64L-.29 .62L-.17 .73L-.28 .84L-.47 .82Z M.48 .64L.29 .62L.17 .73L.28 .84L.47 .82Z',
    fireCheeks:'M-.57 .06L-.44 .22L-.49 .36L-.28 .35L-.48 .50L-.56 .36Z M.57 .06L.44 .22L.49 .36L.28 .35L.48 .50L.56 .36Z',
    spiritEyes:'M-.52-.08L-.34-.12L-.16-.04L-.32 .07Z M.52-.08L.34-.12L.16-.04L.32 .07Z',
    zarathosCrown:'M-.63-.45L-.75-.81L-.41-.64L-.18-.86L0-.71L.18-.86L.41-.64L.75-.81L.63-.45L.35-.57L0-.49L-.35-.57Z',
    widowBadge:'M-.22 .59H.22L.09 .75L.22 .91H-.22L-.09 .75Z',
    stealthMask:'M-.63 .08L-.52 .16L0 .23L.52 .16L.63 .08L.53 .47L.30 .58L0 .58L-.30 .58L-.53 .47Z',
    redRoom:'M-.43 .66L-.21 .62L0 .74L.21 .62L.43 .66L.20 .94L0 .86L-.20 .94Z',
    fieldCollar:'M-.61 .56L-.32 .63L0 .77L.32 .63L.61 .56L.48 .81L0 1.0L-.48 .81Z',
    whiteHelm:'M-.72-.50L-.40-.66L0-.72L.40-.66L.72-.50L.52-.40L.24-.46L0-.42L-.24-.46L-.52-.40Z',
    omegaHelm:'M-.64-.46L-.43-.68L-.22-.59L0-.72L.22-.59L.43-.68L.64-.46L.39-.51L0-.40L-.39-.51Z',
    polarityHelm:'M-.64-.52L-.45-.82L0-.65L.45-.82L.64-.52L.45-.61L0-.46L-.45-.61Z',
    starBadge:'M0 .55L.077 .70L.28 .75L.08 .80L0 .97L-.08 .80L-.28 .75L-.077 .70Z',
    warbirdBadge:'M-.38 .59L-.13 .62L0 .75L.13 .62L.38 .59L.25 .83L0 .94L-.25 .83Z',
    binaryEyes:'M-.55-.10L-.35-.14L-.14-.06L-.31 .06L-.50 .02Z M.55-.10L.35-.14L.14-.06L.31 .06L.50 .02Z',
    binaryCrest:'M0 .53L.10 .66L.35 .72L.18 .83L.11 .98L0 .88L-.11 .98L-.18 .83L-.35 .72L-.10 .66Z',
    whiteSuit:'M-.53 .53L-.20 .64L0 .80L.20 .64L.53 .53L.41 .86L0 .97L-.41 .86Z',
    crescentCrest:'M.16 .59Q.37 .85 .08 .94Q-.19 .97-.22 .73Q-.07 .90.10 .79Q.20 .72 .16 .59Z',
    khonshuBeak:'M-.47-.19L-.15-.34L.07-.17L.38-.14L.44 .07L.20 .13L.05 .45L-.11 .13L-.38 .08Z',
    eclipseCrest:'M.24 .60Q.40 .80 .20 .96Q-.06 1.02 -.25 .77Q-.02 .90 .16 .79Q.24 .71 .24 .60Z',
    surferLines:'M-.65 .19L-.47 .34L-.22 .44L-.40 .52L-.60 .44Z M.65 .19L.47 .34L.22 .44L.40 .52L.60 .44Z',
    silverStar:'M0 .53L.09 .68L.28 .71L.12 .81L0 .96L-.12 .81L-.28 .71L-.09 .68Z',
    blackSilver:'M-.64-.20L-.41-.26L-.17-.14L-.31-.02L-.53-.03Z M.64-.20L.41-.26L.17-.14L.31-.02L.53-.03Z',
    surferCrown:'M-.53-.52L-.32-.67L-.12-.57L0-.81L.12-.57L.32-.67L.53-.52L.29-.55L0-.46L-.29-.55Z',
    blueEyes:'M-.61-.20L-.32-.25L-.106-.13L-.36-.07Z M.61-.20L.32-.25L.106-.13L.36-.07Z',
    redEyes:'M-.66 .08L-.45 .16L-.25 .22L-.41 .25L-.62 .20Z M.66 .08L.45 .16L.25 .22L.41 .25L.62 .20Z',
    purpleEyes:'M-.58-.20L-.29-.25L-.15-.13L-.34-.06Z M.58-.20L.29-.25L.15-.13L.34-.06Z',
    domainEyes:'M-.62-.17Q-.38-.33-.14-.15Q-.38.03-.62-.17Z M.62-.17Q.38-.33.14-.15Q.38.03.62-.17Z',
    shibuyaInk:'M-.65 .10L-.48 .15L-.53 .33L-.38 .43L-.61 .40L-.66 .27Z M.65 .10L.48 .15L.53 .33L.38 .43L.61 .40L.66 .27Z',
    megumiVeil:'M-.67-.42L-.91-.60L-.59-.70L-.71-1.12L-.40-.98L-.19-1.27L-.06-.98L.28-1.20L.35-.94L.70-.99L.62-.77L.93-.71L.65-.42L.30-.68L.13-.49L0-.63L-.28-.51L-.39-.69Z',
    heianMask:'M.58-.50L.72-.46L.77-.09L.72 .35L.55 .53L.38 .39L.45 .08L.40-.16Z',
    shrineInk:'M-.54 .20L-.31 .31L-.20 .51L-.41 .48Z M.54 .20L.31 .31L.20 .51L.41 .48Z',
    sageEyes:'M-.62-.18L-.39-.22L-.16-.10L-.27 .02L-.50-.03Z M.62-.18L.39-.22L.16-.10L.27 .02L.50-.03Z',
    chakraSeal:'M-.41 .68L-.32 .60L0 .77L.32 .60L.41 .68L.27 .91L-.27 .91Z',
    sixPathsMarks:'M-.47 .64L-.32 .67L-.35 .82L-.46 .79Z M-.21 .70L-.08 .73L-.16 .89L-.25 .83Z M.47 .64L.32 .67L.35 .82L.46 .79Z M.21 .70L.08 .73L.16 .89L.25 .83Z',
    baryonMask:'M-.62-.30L-.44-.20L-.21-.13L-.30.04L-.44.10L-.57.33L-.64.19L-.58.01Z M.62-.30L.44-.20L.21-.13L.30.04L.44.10L.57.33L.64.19L.58.01Z',
    jetMarks:'M-.67 .19L-.42 .23L-.23 .34L-.47 .31Z M.67 .19L.42 .23L.23 .34L.47 .31Z',
    giantGlove:'M-.40 .69L-.29 .59L.29 .59L.40 .69L.31 .88L-.31 .88Z',
    boundmanPaint:'M-.65 .33L-.49 .38L-.37 .54L-.12 .53L-.26 .73L-.52 .65Z M.65 .33L.49 .38L.37 .54L.12 .53L.26 .73L.52 .65Z',
    dawnBrow:'M-.52-.24Q-.37-.41-.24-.24Q-.35-.30-.39-.18Z M.52-.24Q.37-.41.24-.24Q.35-.30.39-.18Z',
    titanJaw:'M-.60 .23L-.44 .36L-.29 .51L-.40 .54L-.57 .41Z M.60 .23L.44 .36L.29 .51L.40 .54L.57 .41Z',
    hardenedJaw:'M-.69 .10L-.57 .24L-.44 .27L-.23 .59L-.45 .64L-.63 .49Z M.69 .10L.57 .24L.44 .27L.23 .59L.45 .64L.63 .49Z',
    warHammerMask:'M-.62-.45Q-.15-.58 .62-.45L.60-.20L.36-.15L.14-.24L0-.17L-.14-.24L-.36-.15L-.60-.20Z M-.59 .10L-.38 .24L-.24 .51L0 .63L.24 .51L.38 .24L.59 .10L.51 .49L.30 .64L0 .73L-.30 .64L-.51 .49Z',
    foundingJaw:'M-.71 .09L-.55 .31L-.36 .39L-.29 .58L0 .64L.29 .58L.36 .39L.55 .31L.71 .09L.62 .48L.35 .71L0 .82L-.35 .71L-.62 .48Z',
    scoutCravat:'M-.49 .51L-.22 .60L0 .70L.22 .60L.49 .51L.30 .82L0 .97L-.30 .82Z',
    ackermanStraps:'M-.54 .53L-.36 .51L.46 .80L.30 .92Z M.54 .53L.36 .51L-.46 .80L-.30 .92Z',
    spearHarness:'M-.54 .57L-.19 .60L0 .81L.19 .60L.54 .57L.51 .76L0 .97L-.51 .76Z',
    scoutClasp:'M-.32 .56L-.07 .65L0 .76L.07 .65L.32 .56L.21 .86L0 1.02L-.21 .86Z',
    copterBand:'M-.46 .61Q0 .73 .46 .61L.38 .73Q0 .87-.38 .73Z',
    smallLightBadge:'M-.24 .73L-.13 .61L.19 .62L.28 .74L.17 .88L-.13 .90Z',
    doorClasp:'M-.20 .63H.20V.93H-.20Z', clothBell:'M-.36 .71Q0 .64 .36 .71L.20 .96L0 .86L-.20 .96Z',
    rubyStaffClasp:'M0 .58L.19 .74L0 .94L-.19 .74Z',
    dualSpellClasp:'M-.39 .62L-.14 .73L0 .67L.14 .73L.39 .62L.31 .87L0 .97L-.31 .87Z',
    wardDiadem:'M-.52-.54L-.37-.61L-.12-.56L0-.70L.12-.56L.37-.61L.52-.54L.29-.52L0-.43L-.29-.52Z',
    goldRunes:'M-.49 .63L-.23 .66L-.07 .80L-.30 .83Z M.49 .63L.23 .66L.07 .80L.30 .83Z M0 .70L.14 .83L0 .97L-.14 .83Z'
  };

  const shoulderLine = 'M.55 .72Q.89 .55 1.14 .65L1.31 .55 M.70 .80L.90 .76';
  const paletteDark = '#191726';
  const scarDetails = new Set(['blueEyes','redEyes','purpleEyes','domainEyes','shibuyaInk','jetMarks',
    'immortalMarks','titanJaw','frostMarks','surferLines','baryonMask','boundmanPaint','sageEyes','pantherSeams']);
  const starBodies = new Set(['starlight','eclipse','void','orbit','astral','magnetism','fox','branches']);

  function create({shape,oval}) {
    function back(ctx,id,style) {
      const look=outfits[id]?.[style.form-1];
      if(!look || style.compact) return;
      const [motif,,base,light]=look;
      ctx.save();
      const detached = ['copter','door'].includes(motif);
      if (detached) {
        if (motif === 'door') ctx.translate(.05,.04);
        shape(ctx,silhouette[motif],base,paletteDark,.057);
        if(motif==='door') oval(ctx,1.13,.29,.069,.042,light,paletteDark);
        else shape(ctx,'M-.73-1.36L.69-1.43',null,light,.044);
      } else for(const side of [-1,1]){
        ctx.save();
        ctx.scale(side*(style.form===4?1.06:1),1);
        shape(ctx,silhouette[motif],base,paletteDark,.065);
        shape(ctx,shoulderLine,null,light,.045);
        if(starBodies.has(motif)) {
          for(const [index,[x,y]] of [[1.12,.37],[1.21,-.04],[.94,.58]].entries()) {
            const size = .031 + .009*index;
            oval(ctx,x,y,size,size,light);
          }
        }
        ctx.restore();
      }
      ctx.restore();
    }

    function front(ctx,id,style) {
      const look=outfits[id]?.[style.form-1];
      if(!look) return;
      const [,mark,base,light]=look;
      const fine=scarDetails.has(mark);
      shape(ctx,masks[mark],fine && !['sageEyes','baryonMask','boundmanPaint'].includes(mark) ? light :
        ['sageEyes','baryonMask','boundmanPaint','megumiVeil','stealthMask','panelRip'].includes(mark) ? base : light,
        fine ? null : paletteDark,.030);
      if(mark==='sageEyes' || mark==='baryonMask' || mark==='domainEyes') {
        const iris = mark==='sageEyes' ? '#edbb54' : mark==='baryonMask' ? '#fff09d' : '#a9edff';
        for(const sign of [-1,1]){
          oval(ctx,sign*.373,-.115,.057,.050,iris,paletteDark);
          oval(ctx,sign*.373,-.115,.031,.017,paletteDark);
        }
      }
      if(['visor','energyShield','timeBrooch','starBadge','gauntlet','heianMask'].includes(mark)) {
        const points=mark==='gauntlet' ? [[-.26,.70],[-.13,.66],[0,.75],[.13,.66],[.26,.70]]
          : mark==='visor' ? [[-.37,-.18],[.37,-.18]] : mark==='heianMask' ? [[.56,-.18],[.59,.03]]
            : [[0,.765]];
        const gems=['#ff8ca9','#92e7ff','#ddd7a0','#c59bff','#ffeaba'];
        for(const [index,[x,y]] of points.entries()) oval(ctx,x,y,.055,.040,gems[index],paletteDark);
      }
    }
    return {back,front};
  }

  return {create};
})();
