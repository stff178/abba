'use strict';

const MarvelPortraits = (() => {
  function create({ shape, oval, collar, cape, face, eyes, mouth, pupilsAndMouth }) {
    const dark = '#171828';
    const pale = '#f7f0e7';
    const skull = 'M-.72 -.5 Q-.73 -.9 -.28 -1.04 Q0 -1.13 .28 -1.04 Q.73 -.9 .72 -.5 L.61 .19 L.42 .32 L.34 .63 Q.02 .79 -.34 .63 L-.42 .32 L-.61 .19Z';
    const shell = 'M-.74 -.43 C-.68 -.91 -.41 -1.12 0 -1.14 C.41 -1.12 .68 -.91 .74 -.43 L.66 .24 Q.52 .56 0 .72 Q-.52 .56 -.66 .24Z';
    const hawkLens = 'M.11 -.177 Q.37 -.18 .62 -.45 Q.63 -.12 .46 .035 Q.31 .17 .11 -.039Z';
    const helmetLens = 'M.12 -.13 L.54 -.21 Q.58 .001 .31 .10 L.16 .046Z';
    const moon = 'M.168 -.086 A.205 .205 0 1 1 -.149 -.244 Q-.213 -.027 .035 .018 Q.122 .03 .168 -.086Z';

    function mirrored(ctx, draw) {
      for (const sign of [-1, 1]) {
        ctx.save();
        ctx.scale(sign, 1);
        draw();
        ctx.restore();
      }
    }

    function lids(ctx, pose, lenses, color) {
      mirrored(ctx, () => shape(ctx, pose === 'hit' ? 'M.16 -.03 Q.38 .062 .52 -.08' : lenses, pose === 'hit' ? null : color, dark, .055));
    }

    function layeredHair(ctx, base, gloss, flip = false) {
      ctx.save();
      if (flip) ctx.scale(-1, 1);
      shape(ctx, 'M-.77 .39 Q-.905 -.43 -.56 -.85 Q-.22 -1.24 .18 -1.08 Q.54 -1.19 .757 -.73 L.743 .41 L.59 .32 L.54 -.505 Q.2 -.47 .052 -.783 Q-.047 -.42 -.46 -.26 L-.38 -.61 Q-.579 -.501 -.615 .302Z', base);
      shape(ctx, 'M-.65 -.45 Q-.514 -.865 -.194 -1 M.282 -.994 Q.537 -.924 .606 -.69 M.644 -.503 L.659 .11', null, gloss, .049);
      ctx.restore();
    }

    function circlet(ctx, color, tall = false) {
      shape(ctx, tall
        ? 'M-.715 -.589 L-.831 -1.10 L-.49 -.857 L-.273 -.828 L0 -1.335 L.273 -.828 L.49 -.857 L.831 -1.10 L.715 -.589 L.391 -.625 L.26 -.473 L0 -.66 L-.26 -.473 L-.391 -.625Z'
        : 'M-.67 -.62 L-.71 -.9 L-.39 -.793 L-.19 -.83 L0 -1.083 L.19 -.83 L.39 -.793 L.71 -.9 L.67 -.62 L.32 -.66 L0 -.58 L-.32 -.66Z', color);
      shape(ctx, 'M-.52 -.696 L-.284 -.726 L0 -.857 L.284 -.726 L.52 -.696', null, '#fff4dd', .035);
    }

    function capHood(ctx, cloth, rim) {
      shape(ctx, 'M-.98 .68 Q-.874 .1 -.851 -.49 Q-.777 -.99 0 -1.235 Q.777 -.99 .851 -.49 Q.874 .1 .98 .68 L.49 .741 Q0 .96 -.49 .741Z', cloth);
      shape(ctx, 'M-.763 -.35 Q-.689 -.831 0 -1.034 Q.689 -.831 .763 -.35 M-.776 -.15 L-.851 .45 M.776 -.15 L.851 .45', null, rim, .055);
    }

    const drawings = {
      spider_man(ctx, { form, pose, color }) {
        const suit = ['#b72e4d', '#ca3f5b', '#923051', '#2b2846', '#744da7'][form];
        const seam = form === 2 ? '#ffda85' : form >= 3 ? color : '#411e45';
        collar(ctx, '#22274e', form >= 2 ? '#5d4f92' : '#4a5796', dark);
        if (form === 2 || form === 4) mirrored(ctx, () => shape(ctx,
          'M.43 .57 L.93 .095 L1.22 -.71 L1.49 -.84 L1.294 -.536 L1.235 .22 L.71 .735Z M.62 .56 L1.09 .564 L1.38 .278 L1.43 .384 L1.16 .711 L.59 .753Z',
          form === 2 ? '#c79553' : '#7773c7'));
        shape(ctx, shell, suit);
        shape(ctx, 'M-.566 -.74 Q-.434 -1.014 -.08 -1.063 L-.256 -.886 L-.371 -.619Z', form >= 3 ? '#a17de1' : '#e87985', null);
        shape(ctx, 'M0 -1.076 L0 .64 M-.55 -.815 Q0 -.7 .55 -.815 M-.658 -.59 Q0 -.45 .658 -.59 M-.649 -.31 Q0 -.235 .649 -.31 M-.653 .021 Q0 -.088 .653 .021 M-.516 .339 Q0 .156 .516 .339 M-.382 .485 Q0 .392 .382 .485 M-.54 -.815 Q-.353 -.43 0 .045 Q.353 -.43 .54 -.815 M-.676 .28 L0 .045 L.676 .28', null, seam, .029);
        lids(ctx, pose, hawkLens, form === 4 ? '#ddfaff' : pale);
        if (form === 1) shape(ctx, 'M-.26 .504 L0 .659 L.26 .504', null, pale, .05);
      },
      wolverine(ctx, { form, pose, color }) {
        collar(ctx, form === 3 ? '#4b526f' : '#8a5651', '#ba8c51', dark);
        face(ctx, '#e7b590', '#a06967', { broad: true });
        shape(ctx, 'M-.63 .299 L-.776 .085 L-.902 -.24 L-1.042 -1.21 L-.468 -.881 Q0 -1.07 .468 -.881 L1.042 -1.21 L.902 -.24 L.776 .085 L.63 .299 L.28 .199 L0 .094 L-.28 .199Z', form === 1 || form === 3 ? '#898eb2' : '#d19a42');
        mirrored(ctx, () => shape(ctx, 'M.17 -.155 Q.43 -.532 .95 -1.05 L.76 -.20 L.63 .16 L.285 .215Z', '#26233e'));
        lids(ctx, pose, helmetLens, form >= 2 ? color : '#fbf0dc');
        mouth(ctx, 'calm', pose, '#89545c');
      },
      deadpool(ctx, { form, pose, color }) {
        collar(ctx, '#442941', form >= 3 ? '#795685' : '#a7495e');
        mirrored(ctx, () => shape(ctx, 'M.41 .44 L.84 -.76 L.99 -.818 L1.071 -.733 L.63 .585Z', '#69647f'));
        shape(ctx, shell, ['#b93b57', '#b6b3c5', '#d3646c', '#4d294e', '#e64f87'][form]);
        mirrored(ctx, () => shape(ctx, 'M.12 -.151 Q.383 -.71 .608 -.626 Q.831 -.195 .514 .224 Q.349 .313 .22 .083Z', '#222138'));
        lids(ctx, pose, 'M.196 -.139 Q.358 -.24 .5 -.141 L.45 -.012 Q.29 .071 .196 -.139Z', pale);
        shape(ctx, 'M-.22 .53 Q0 .625 .22 .53', null, form >= 3 ? color : '#78314c', .039);
        if (form === 4) shape(ctx, 'M-.63 -.735 L-.355 -.927 M.51 .321 L.632 .224 M-.573 .31 L-.392 .428', null, '#ffb9bf', .073);
      },
      doctor_strange(ctx, { form, pose, wind, color }) {
        cape(ctx, form >= 3 ? '#622e6c' : '#9a2944', color, wind);
        shape(ctx, 'M-.93 .68 L-.82 -.21 L-.488 .21 L0 .384 L.488 .21 L.82 -.21 L.93 .68 L.582 .87 L-.582 .87Z', '#a83d53');
        collar(ctx, form >= 3 ? '#34234f' : '#274461', '#477190', '#2d243d');
        face(ctx, '#e6ba9e', '#a97070');
        layeredHair(ctx, '#302638', '#624566');
        mirrored(ctx, () => shape(ctx, 'M.55 -.513 Q.66 -.433 .689 -.146 L.55 -.237Z', form === 4 ? color : '#d1c7d1', null));
        eyes(ctx, color, pose);
        shape(ctx, 'M-.32 .325 L0 .269 L.32 .325 L.194 .414 L.16 .649 L0 .715 L-.16 .649 L-.194 .414Z', '#3c2c3d');
        mouth(ctx, 'calm', pose, '#a1787a');
        oval(ctx, 0, .777, .122, .083, '#ffd28e', '#673d50');
        if (form >= 3) oval(ctx, 0, -.431, .083, .047, color, dark);
      },
      scarlet_witch(ctx, { form, pose, color }) {
        collar(ctx, '#6c2b47', '#a84a67', '#492444');
        face(ctx, '#f3cab8', '#bc7885');
        layeredHair(ctx, form >= 2 ? '#8b3b5a' : '#633342', '#c07578');
        if (form) {
          shape(ctx, 'M-.72 -.308 L-.734 -.834 L-.56 -.95 L-.334 -.626 L0 -.802 L.334 -.626 L.56 -.95 L.734 -.834 L.72 -.308 L.48 -.455 L.224 -.356 L0 -.578 L-.224 -.356 L-.48 -.455Z', form === 4 ? '#f377a5' : '#b72c5e');
          if (form >= 3) shape(ctx, 'M-.26 -.589 L0 -.75 L.26 -.589 M-.625 -.736 L-.525 -.543 M.625 -.736 L.525 -.543', null, '#ffadc3', .043);
        }
        pupilsAndMouth(ctx, color, pose, 'sharp');
      },
      thanos(ctx, { form, pose, color }) {
        collar(ctx, form >= 3 ? '#3e365b' : '#5f456c', '#c38960', '#261e42');
        face(ctx, form === 4 ? '#c599d7' : '#a77abc', '#744f98', { broad: true });
        shape(ctx, 'M-.76 .32 L-.905 -.202 L-.781 -.786 L-.49 -1.044 Q0 -1.212 .49 -1.044 L.781 -.786 L.905 -.202 L.76 .32 L.57 .007 L.56 -.503 L.28 -.649 L0 -.583 L-.28 -.649 L-.56 -.503 L-.57 .007Z', form === 4 ? '#f1c77e' : '#bc905e');
        shape(ctx, 'M-.584 -.728 L-.337 -.937 Q0 -1.033 .337 -.937 L.584 -.728 L.363 -.788 L0 -.71 L-.363 -.788Z', '#f9d78b', null);
        pupilsAndMouth(ctx, color, pose, 'sharp', '#784e91');
        shape(ctx, 'M-.252 .444 L-.194 .612 M-.079 .434 L-.051 .674 M.079 .434 L.051 .674 M.252 .444 L.194 .612', null, '#80569d', .038);
        const stones = ['#bc82ff', '#76caff', '#ff797a', '#8de88a', '#ffe28a', '#ffac7b'];
        for (let index = 0; index < (form === 4 ? 6 : form); index++) {
          oval(ctx, -.20 + index * .078, .79 - Math.sin(index * .58) * .06, .044, .052, stones[index], dark);
        }
      },
      black_panther(ctx, { form, pose, color }) {
        collar(ctx, '#252638', '#4a496d');
        shape(ctx, 'M-.75 -.214 L-.91 -1.096 L-.424 -.905 Q0 -1.135 .424 -.905 L.91 -1.096 L.75 -.214 L.658 .267 Q.39 .626 0 .699 Q-.39 .626 -.658 .267Z', form >= 3 ? '#422d61' : '#25243d');
        mirrored(ctx, () => shape(ctx, 'M.21 -.54 L.656 -.857 L.6 -.66 L.423 -.481 L.627 -.353 L.619 .182 L.394 .478 L.225 .522 M.18 .279 L.381 .202 L.539 -.001', null, form === 2 ? '#ffd583' : color, form > 0 ? .052 : .028));
        lids(ctx, pose, helmetLens, pale);
        for (let i = -3; i <= 3; i++) {
          ctx.save();
          ctx.translate(i * .17, .79 - Math.abs(i) * .035);
          ctx.rotate(i * -.13);
          shape(ctx, 'M-.074 -.088 L.076 -.084 L0 .104Z', form >= 2 ? color : '#c4b9d0');
          ctx.restore();
        }
      },
      loki(ctx, { form, pose, wind, color }) {
        cape(ctx, '#2c5e54', '#78aa76', wind);
        collar(ctx, '#2c554b', '#526e56', '#2c303e');
        face(ctx, form === 1 ? '#a0c5d1' : '#efc8af', form === 1 ? '#607ba5' : '#ad7280');
        layeredHair(ctx, '#26273a', '#5e4b6b');
        shape(ctx, 'M-.658 -.412 L-.661 -.769 Q-.55 -.971 0 -1.094 Q.55 -.971 .661 -.769 L.658 -.412 L.332 -.514 L.164 -.614 L0 -.48 L-.164 -.614 L-.332 -.514Z', form >= 3 ? '#bad988' : '#bca464');
        mirrored(ctx, () => shape(ctx, 'M.28 -.824 Q.679 -1.169 .748 -1.62 Q1.035 -1.225 .761 -.846 L.562 -.614Z', form === 4 ? '#d2eab0' : '#e9bd69'));
        pupilsAndMouth(ctx, color, pose, 'sharp');
      },
      venom(ctx, { form, pose, color }) {
        collar(ctx, '#211f39', '#43354e');
        if (form >= 3) mirrored(ctx, () => shape(ctx, 'M.58 .607 Q.783 -.283 1.41 -.993 L1.39 -.5 L1.61 -.43 L1.36 -.242 L1.45 .019 Q1.091 -.10 .934 .446Z', '#3d244c'));
        shape(ctx, 'M-.842 -.307 Q-.901 -.924 0 -1.099 Q.901 -.924 .842 -.307 L.75 .357 L.507 .634 L.228 .769 L-.228 .769 L-.507 .634 L-.75 .357Z', form >= 2 ? '#33264a' : '#242436');
        mirrored(ctx, () => shape(ctx, 'M.09 -.101 Q.285 -.306 .645 -.62 Q.707 -.315 .524 -.191 L.624 -.129 Q.574 .105 .261 .171Z', pose === 'hit' ? '#bd9ac3' : '#f9eaf7'));
        shape(ctx, 'M-.61 .285 Q0 .454 .61 .285 Q.469 .756 0 .735 Q-.469 .756 -.61 .285Z', '#3a1e36');
        shape(ctx, 'M-.499 .376 L-.348 .556 L-.294 .428 L-.156 .581 L-.095 .461 L0 .603 L.095 .461 L.156 .581 L.294 .428 L.348 .556 L.499 .376 Q0 .503 -.499 .376Z', '#f5e9eb', null);
        if (form >= 2) shape(ctx, 'M.036 .687 Q.23 .724 .353 .598 L.466 .556 Q.494 .917 -.117 .846Z', '#c973a1');
        if (form === 4) shape(ctx, 'M-.63 -.704 L-.335 -.873 L-.16 -.421 L0 -.813 L.16 -.421 L.335 -.873 L.63 -.704', null, color, .047);
      },
      doctor_doom(ctx, { form, pose, wind, color }) {
        cape(ctx, form === 4 ? '#c3d4be' : '#325548', '#94b08e', wind);
        capHood(ctx, form === 4 ? '#e5eadb' : '#3a685b', form === 4 ? '#99b9b0' : '#6a9f79');
        collar(ctx, '#394958', '#73837d');
        shape(ctx, 'M-.72 -.517 L-.543 -.8 L0 -.91 L.543 -.8 L.72 -.517 L.63 .308 L.394 .572 L0 .72 L-.394 .572 L-.63 .308Z', form === 4 ? '#e4e8d8' : '#a7b3b5');
        shape(ctx, 'M-.637 -.463 L-.417 -.664 L-.266 -.569 L-.318 -.33 L-.49 -.151 L-.51 .196 L-.327 .445 L-.386 .498 L-.607 .261Z M.637 -.463 L.417 -.664 L.266 -.569 L.318 -.33 L.49 -.151 L.51 .196 L.327 .445 L.386 .498 L.607 .261Z', '#657685', null);
        lids(ctx, pose, helmetLens, form >= 2 ? color : '#273945');
        shape(ctx, 'M-.264 .308 L-.177 .27 L.177 .27 L.264 .308 L.223 .463 L-.223 .463Z M-.159 .34 L-.159 .413 M-.057 .326 L-.057 .432 M.057 .326 L.057 .432 M.159 .34 L.159 .413', null, '#3f545d', .045);
      },
      ghost_rider(ctx, { form, pose, color }) {
        collar(ctx, '#292437', '#59445b', '#242034');
        shape(ctx, 'M-.79 .345 Q-1.19 -.037 -.844 -.583 L-.975 -.989 Q-.615 -.937 -.475 -1.269 L-.465 -1.458 Q-.087 -1.333 -.006 -1.621 Q.18 -1.395 .388 -1.247 L.449 -1.472 Q.669 -1.325 .798 -1.022 L.931 -.928 L.835 -.633 Q1.094 -.235 .78 .375Z', color);
        shape(ctx, 'M-.755 -.361 Q-.697 -.768 -.464 -.815 Q-.438 -1.146 -.20 -1.215 Q-.107 -1.266 -.04 -1.385 Q.015 -1.168 .254 -1.095 Q.337 -1.069 .395 -1.237 Q.49 -.966 .721 -.742 L.704 -.323Z', form >= 2 ? '#eaf4ff' : '#ffd49b', null);
        shape(ctx, skull, form >= 2 ? '#dfe5ef' : '#f1ddc6');
        lids(ctx, pose, 'M.118 -.125 L.556 -.273 L.479 .103 L.271 .135Z', '#38263b');
        oval(ctx, -.338, -.046, .078, .053, color);
        oval(ctx, .338, -.046, .078, .053, color);
        shape(ctx, 'M-.129 .262 L0 .09 L.129 .262Z M-.28 .461 L.277 .461 M-.171 .424 L-.171 .604 M-.046 .417 L-.046 .648 M.078 .415 L.078 .646 M.191 .422 L.191 .584', '#584357', '#584357', .039);
      },
      black_widow(ctx, { form, pose, color }) {
        collar(ctx, '#322d45', form >= 3 ? '#694760' : '#514656', '#282338');
        face(ctx, '#f4c1a9', '#b7787d');
        layeredHair(ctx, form >= 3 ? '#a43658' : '#ad494b', '#ef836c', true);
        pupilsAndMouth(ctx, color, pose, 'sharp');
        shape(ctx, 'M-.123 .685 L.122 .685 L.04 .769 L.122 .853 L-.123 .853 L-.04 .769Z', form >= 3 ? color : '#dc5c75');
        if (form >= 2) shape(ctx, 'M.276 -.145 L.531 -.198 L.563 .033 L.327 .12', null, '#a2e0fc', .061);
      },
      magneto(ctx, { form, pose, wind, color }) {
        cape(ctx, form === 2 ? '#a6b1c7' : '#762d59', color, wind);
        collar(ctx, '#702942', '#a74d67', '#422b46');
        shape(ctx, 'M-.853 -.032 Q-.969 -.66 -.631 -.941 Q0 -1.324 .631 -.941 Q.969 -.66 .853 -.032 L.887 .396 L.563 .71 L.432 .468 L-.432 .468 L-.563 .71 L-.887 .396Z', form === 2 ? '#d6e2ec' : form === 4 ? '#a15293' : '#ad456b');
        face(ctx, '#e6b7a9', '#a97484');
        shape(ctx, 'M-.73 -.493 L-.544 -.891 Q0 -1.111 .544 -.891 L.73 -.493 L.581 -.104 L.507 -.309 L.37 -.482 L.186 -.433 L0 -.26 L-.186 -.433 L-.37 -.482 L-.507 -.309 L-.581 -.104Z', form === 2 ? '#eeeef2' : '#7d355f');
        pupilsAndMouth(ctx, color, pose, 'sharp');
      },
      captain_marvel(ctx, { form, pose, color }) {
        collar(ctx, '#344680', '#6c5395', '#472841');
        face(ctx, '#f7c9a4', '#bc7884');
        const hair = form >= 3 ? color : '#e7b06a';
        layeredHair(ctx, hair, '#fff0ae');
        if (form >= 3) shape(ctx, 'M-.693 -.562 Q-.785 -.992 -.472 -1.17 L-.501 -1.36 Q-.283 -1.322 -.166 -1.576 Q-.11 -1.371 .074 -1.479 L.266 -1.693 Q.337 -1.341 .566 -1.362 L.534 -1.099 Q.76 -.969 .703 -.632 L.481 -.483 Q.539 -.719 .268 -.953 Q.0 -.79 -.263 -.606 L-.202 -.924 Q-.395 -.684 -.595 -.461Z', hair);
        shape(ctx, 'M-.628 -.11 L-.646 -.387 L-.468 -.444 L-.31 -.271 L0 -.313 L.31 -.271 L.468 -.444 L.646 -.387 L.628 -.11 Q0 .073 -.628 -.11Z', form >= 3 ? '#b75268' : '#a34364');
        lids(ctx, pose, helmetLens, pale);
        mouth(ctx, 'calm', pose, '#9f5c6b');
        shape(ctx, 'M0 .643 L.048 .745 L.138 .759 L.058 .812 L0 .894 L-.058 .812 L-.138 .759 L-.048 .745Z', '#ffe3a5');
      },
      moon_knight(ctx, { form, pose, wind, color }) {
        if (form !== 1) {
          cape(ctx, form === 4 ? '#7f759d' : '#afb5ce', color, wind);
          capHood(ctx, form >= 3 ? '#aaa6cf' : '#dce0e7', '#f8eadf');
        }
        collar(ctx, '#c4bdcd', '#ebdee1', '#514961');
        shape(ctx, shell, form === 1 ? '#e9e2e1' : form >= 3 ? '#343053' : '#72708b');
        if (form !== 1) {
          shape(ctx, 'M-.56 .457 L-.778 -.272 Q-.587 -.826 0 -1.098 Q.587 -.826 .778 -.272 L.56 .457 L.608 -.228 Q.479 -.657 0 -.842 Q-.479 -.657 -.608 -.228Z', form >= 3 ? '#d1c4e5' : '#efeae7');
        } else {
          shape(ctx, 'M0 -.996 L0 .68 M-.32 .396 Q0 .477 .32 .396', null, '#b19bad', .036);
        }
        lids(ctx, pose, helmetLens, form === 1 ? '#2b2951' : '#f7e4fb');
        ctx.save();
        ctx.translate(0, form === 1 ? -.6 : -.75);
        shape(ctx, moon, color, null);
        ctx.restore();
      },
      silver_surfer(ctx, { form, pose, color }) {
        shape(ctx, 'M-1.243 .881 Q-.776 .656 .567 .762 L1.355 .822 Q1.154 1.014 .481 1.111 L-.821 1.083 Q-1.189 1.037 -1.243 .881Z', form === 3 ? '#4e4970' : '#a6c2d4');
        shape(ctx, 'M-.972 .961 Q.08 .913 1.092 .862', null, color, .054);
        collar(ctx, '#697c96', '#acb9c7');
        const metal = ctx.createLinearGradient(-.75, -.73, .62, .37);
        metal.addColorStop(0, '#eff2f5');
        metal.addColorStop(.49, form === 3 ? '#606185' : '#b4c8d5');
        metal.addColorStop(1, form === 3 ? '#383552' : '#6e8ea6');
        shape(ctx, shell, metal);
        shape(ctx, 'M-.53 -.594 Q-.452 -.91 -.13 -.987 Q-.226 -.761 -.494 -.501Z', '#fbf6f1', null);
        lids(ctx, pose, helmetLens, form >= 2 ? color : '#f7f5ea');
        shape(ctx, 'M-.049 .026 L-.142 .247 L.063 .228 M-.138 .409 L.137 .389', null, '#52627c', .041);
      }
    };

    return drawings;
  }

  return { create };
})();
