'use strict';

const ComicSkills = (() => {
  const scenes = new Set(['void','shrine','tenShadows','snap','timeCloth','timeStone','mirror','reality',
    'dispel','panel','coordinate','bifrost','ancestor','reversal']);
  const TAU = Math.PI*2;

  function point(x,y,angle,d) { return {x:x+Math.cos(angle)*d,y:y+Math.sin(angle)*d}; }
  function worldRadius(arena,cast) {
    if(['void','snap','reversal'].includes(cast.technique)) return arena.arenaHalfSize * Math.SQRT2;
    if(['shrine','reality','mirror'].includes(cast.technique)) return 180+cast.form*38+cast.power*31;
    return 115+cast.form*23+cast.power*18;
  }

  function release(arena,fighter,cast) {
    const tech=cast.technique;
    const anchor=['void','snap','reversal','coordinate','shrine'].includes(tech)
      ? {x:arena.centerX,y:arena.centerY} : ['timeCloth','dispel','panel'].includes(tech) ? {x:fighter.x,y:fighter.y} : cast.focus;
    cast.comic={...anchor,reach:worldRadius(arena,cast),progress:0,hits:0,armed:false,
      echo:cast.target.trail.at(0) || {x:cast.target.x,y:cast.target.y}};
    if(tech==='timeCloth') fighter.guardTimer=Math.max(fighter.guardTimer,.78);
    if(tech==='dispel') {
      fighter.damageDebuffTimer=0;
      fighter.domainSlowTimer=0;
      fighter.shrinkTimer=0;
    }
  }

  function advance(arena,fighter,cast,progress,dt,hit) {
    const scene=cast.comic;
    const {technique:tech,target,power,form}=cast;
    const themed=tech==='timeCloth';
    scene.progress=progress;
    if(tech==='bifrost' && progress > .27 && !scene.armed) {
      scene.armed=true;
      const angle=Math.atan2(fighter.y-target.y,fighter.x-target.x);
      const end=point(target.x,target.y,angle,fighter.radius+target.radius+3);
      Object.assign(fighter, ArenaBounds.confine(arena, end, fighter.radius + 4));
      fighter.vx*=.27;
      fighter.vy*=.27;
      scene.x=fighter.x;
      scene.y=fighter.y;
    }
    const grow=Math.min(1,progress*(tech==='snap'?1.75:3.5));
    const radius=scene.reach*grow;
    const x=themed ? fighter.x : scene.x;
    const y=themed ? fighter.y : scene.y;
    const dist=Math.hypot(target.x-x,target.y-y);
    const close=dist<=radius+target.radius;
    if(tech==='void' && close && progress>=.16) {
      target.domainSlowTimer=Math.max(target.domainSlowTimer,.18);
    }
    if(tech==='reversal' && close) {
      const angle=Math.atan2(target.y-y,target.x-x)+(progress<.53?Math.PI:0);
      target.vx+=Math.cos(angle)*960*dt;
      target.vy+=Math.sin(angle)*960*dt;
    }
    if(tech==='timeStone' && close && progress>=.24) {
      target.domainSlowTimer=Math.max(target.domainSlowTimer,.22);
    }
    if(tech==='dispel' && !scene.armed && progress>=.23) {
      scene.armed=true;
      target.guardTimer=0;
      for(const shot of target.skillCast?.nodes||[]) {
        if(Number.isFinite(shot.vx) && Math.hypot(shot.x-fighter.x,shot.y-fighter.y)<scene.reach) shot.done=true;
      }
    }
    const count=['void','shrine','tenShadows','reality','ancestor','coordinate'].includes(tech) && power===2 ? 3 : 1;
    const first=tech==='snap' ? .48 : tech==='bifrost' ? .33 : tech==='shrine' ? .19 : .25;
    if(!close || scene.hits>=count || progress<first+scene.hits*.19) return;
    scene.hits++;
    if(['timeStone','timeCloth'].includes(tech)) {
      const recall=themed ? .76 : .48;
      const dx=(scene.echo.x-target.x)*recall;
      const dy=(scene.echo.y-target.y)*recall;
      Object.assign(target, ArenaBounds.confine(arena, { x: target.x + dx, y: target.y + dy }, target.radius));
      target.domainSlowTimer=Math.max(target.domainSlowTimer,.48);
      arena.spawnRing(target.x,target.y,15,85+form*14,cast.color,.40);
    }
    if(tech==='timeCloth' && power<2) return;
    const scale=tech==='snap'?1.04:count===1?1:.39;
    hit(scale);
  }

  function polygon(ctx,vertices,fill,stroke,width=3) {
    ctx.beginPath();
    ctx.moveTo(vertices[0][0],vertices[0][1]);
    for (const [x,y] of vertices.slice(1)) ctx.lineTo(x,y);
    ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  }

  function ring(ctx,x,y,rx,ry,color,width,spin=0,start=0,end=TAU) {
    ctx.beginPath();
    ctx.ellipse(x,y,Math.max(.25,rx),Math.max(.25,ry),spin,start,end);
    ctx.strokeStyle=color;
    ctx.lineWidth=width;
    ctx.stroke();
  }

  function clock(ctx,r,size,age,color) {
    ring(ctx,0,0,r,r,color,3);
    ring(ctx,0,0,r*.82,r*.82,'#fff4d7',1.4);
    ctx.strokeStyle=color;
    ctx.lineCap='round';
    ctx.beginPath();
    for(let i=0;i<12;i++){
      const angle=i*TAU/12;
      ctx.moveTo(Math.cos(angle)*r*.84,Math.sin(angle)*r*.84);
      ctx.lineTo(Math.cos(angle)*r*.94,Math.sin(angle)*r*.94);
    }
    ctx.moveTo(Math.cos(-age*7)*r*.69,Math.sin(-age*7)*r*.69);
    ctx.lineTo(0,0);
    ctx.lineTo(Math.cos(-age*13)*size,Math.sin(-age*13)*size);
    ctx.lineWidth=3;
    ctx.stroke();
  }

  function drawVoid(ctx,r,progress,age,color,back) {
    if(back){
      const sky=ctx.createRadialGradient(0,0,r*.08,0,0,r);
      sky.addColorStop(0,'rgba(10,9,39,.98)');sky.addColorStop(.72,'rgba(13,14,54,.92)');sky.addColorStop(1,'rgba(49,56,106,.0)');
      ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fillStyle=sky;ctx.fill();
      for(let i=0;i<75;i++){
        const angle=i*2.39996+age*.18;
        const d=r*Math.sqrt((i%71+1)/72);
        const x=Math.cos(angle)*d,y=Math.sin(angle)*d;
        ctx.fillStyle=i%7===0?color:'#eff2ff';
        ctx.fillRect(x,y,i%5===0?3.1:1.4,i%5===0?3.1:1.4);
      }
    } else {
      for(let i=0;i<4;i++) ring(ctx,0,0,r*(.91-i*.07),r*(.28+i*.062),i%2?color:'#e0e6ff',2+i*.25,
        .18+(i-1.5)*.33,age*.6+i,age*.6+i+4.8);
      ring(ctx,0,0,r*.23,r*.12,'#f7fbff',4.8,.24);
    }
  }

  function drawShrine(ctx,r,age,color,back) {
    if(back){
      const spread=r*.54;
      ctx.save();
      ctx.translate(0,-r*.09);
      polygon(ctx,[[-spread,r*.24],[-spread*.73,-r*.10],[spread*.73,-r*.10],[spread,r*.24]],'#351928',color,2.3);
      for(let tier=0;tier<3;tier++){
        const half=spread*(1-tier*.22),y=r*(.12-tier*.24);
        polygon(ctx,[[-half*1.15,y],[-half*.67,y-r*.10],[-half*.31,y-r*.17],[0,y-r*.235],[half*.31,y-r*.17],
          [half*.67,y-r*.10],[half*1.15,y]],tier%2?'#50203b':'#631f3d','#ec7d91',3);
        polygon(ctx,[[-half*.66,y],[-half*.66,y+r*.11],[half*.66,y+r*.11],[half*.66,y]],'#3b202e',color,2.1);
      }
      ctx.restore();
    } else {
      const count=9;
      ctx.strokeStyle='#ffd6e3';
      for(let i=0;i<count;i++){
        const a=i*2.39996+age*.86;
        const p=r*(.15+(i%5)*.15);
        const x=Math.cos(a)*p,y=Math.sin(a)*p;
        ctx.beginPath();ctx.moveTo(x-r*.18,y-r*.17);ctx.quadraticCurveTo(x+r*.14,y+r*.04,x+r*.21,y+r*.23);
        ctx.lineWidth=i%3===0?4:1.7;ctx.stroke();
      }
    }
  }

  function drawSummons(ctx,cast,r,progress,back) {
    const rise=Math.min(1,progress*3.6);
    ring(ctx,0,0,r*.67,r*.26,cast.color,2.4,.05);
    const tough=cast.power===2 && cast.technique==='tenShadows';
    if (tough) {
      for(let i=0;i<8;i++){
        const a=i*TAU/8+cast.age*1.3;
        const p=point(0,-r*.35,a,r*.24);
        ring(ctx,p.x,p.y,12,8,'#f4ce86',3,a);
      }
      ring(ctx,0,-r*.35,r*.24,r*.24,'#f3c77f',4);
    }
    if(!back)return;
    const size=(tough?1.1:.71)*r*rise;
    const count=tough?1:cast.power===2?4:2;
    for(let i=0;i<count;i++){
      ctx.save();
      ctx.translate((i-(count-1)*.5)*size*.64,-r*.09+(i%2)*r*.14);
      const body=tough ? [[-.40,.25],[-.32,-.38],[-.12,-.50],[.13,-.50],[.31,-.28],[.41,.25],[0,.47]]
        : [[-.50,.20],[-.34,-.03],[-.27,-.32],[-.06,-.19],[.10,-.36],[.27,-.16],[.47,.04],[.41,.24],[.06,.31]];
      polygon(ctx,body.map(([x,y])=>[x*size,y*size]),'#282238',cast.color,3.3);
      ctx.fillStyle=tough?'#ffe6ad':'#f1e4ff';
      ctx.fillRect(-.13*size,-.09*size,6,4);
      ctx.fillRect(.08*size,-.09*size,6,4);
      ctx.restore();
    }
  }

  function drawSnap(ctx,r,progress,age,back) {
    const colors=['#bd91ff','#6edbff','#ff829c','#8de89f','#ffe586','#ffa778'];
    if(back){
      ctx.beginPath();ctx.arc(0,0,r,0,TAU);
      ctx.fillStyle=progress<.54?'rgba(58,30,68,.46)':'rgba(12,9,19,.58)';ctx.fill();
      return;
    }
    for(let i=0;i<6;i++){
      const angle=i*TAU/6+age*.95;
      const p=point(0,0,angle,r*(.35+progress*.59));
      ring(ctx,0,0,r*(.57+i*.07),r*(.45+i*.08),colors[i],2+i%3,angle,0,1.67);
      polygon(ctx,[[p.x,p.y-11],[p.x+8,p.y],[p.x,p.y+11],[p.x-8,p.y]],colors[i],'#fff1df',1.4);
    }
  }

  function drawPanels(ctx,r,cast,back) {
    const {technique:tech,color,age}=cast;
    const count=tech==='mirror'?8:tech==='reality'?11:5;
    for(let i=0;i<count;i++){
      const angle=i*TAU/count+age*.55;
      const at=point(0,0,angle,r*(.54+i%3*.15));
      ctx.save();ctx.translate(at.x,at.y);ctx.rotate(angle+.8);
      const size=r*(.11+.035*(i%4));
      polygon(ctx,[[-size,-size*.61],[size*.42,-size*.88],[size,.15*size],[size*.48,size*.78],[-size*.70,size*.59]],
        back?(tech==='reality'?'#592954':'#32324e'):null,i%3===0?'#ffe5f6':color,back?1.3:3);
      if(!back && tech==='panel') ring(ctx,0,0,size*.85,size*.35,'#ffe7e1',1.7,.25);
      ctx.restore();
    }
  }

  function draw(ctx,cast,alpha,back=false) {
    const scene=cast.comic;
    if(!scene || scene.progress<=0) return;
    const {technique:tech,color,age}=cast;
    const progress=scene.progress;
    const radius=Math.max(3,scene.reach*Math.min(1,progress*(tech==='snap'?1.75:3.5)));
    ctx.save();
    ctx.translate(scene.x,scene.y);
    ctx.globalAlpha*=alpha*(back ? .63 : .80)*(1-Math.max(0,progress-.82));
    if(tech==='void') drawVoid(ctx,radius,progress,age,color,back);
    else if(tech==='shrine') drawShrine(ctx,radius,age,color,back);
    else if(tech==='snap') drawSnap(ctx,radius,progress,age,back);
    else if(['tenShadows','ancestor','coordinate'].includes(tech)) drawSummons(ctx,cast,radius,progress,back);
    else if(['mirror','reality','panel'].includes(tech)) drawPanels(ctx,radius,cast,back);
    else if(tech==='timeStone' || tech==='timeCloth') {
      if(back && tech==='timeCloth') {
        polygon(ctx,[[-radius,-radius*.18],[radius*.72,-radius*.31],[radius*.98,radius*.47],[-radius*.58,radius*.53]],
          '#652747',color,2.3);
      }
      if(!back)clock(ctx,radius*.66,24,age,color);
    } else if(tech==='bifrost') {
      if(back){
        for(const [i,hue] of ['#fa897a','#ffd795','#c0e8ab','#a9e9ff','#cbb3fc'].entries()){
          ctx.fillStyle=hue;ctx.fillRect((i-2)*radius*.10,-radius*1.6,radius*.089,radius*1.61);
        }
      } else ring(ctx,0,0,radius*.71,radius*.29,color,4.2);
    } else {
      for(let i=0;i<4;i++)ring(ctx,0,0,radius*(.65+i*.1),radius*(.46+i*.13),
        i%2?color:'#eeeaff',back?1.3:3.1,age*.71+i,.28,4.52);
    }
    ctx.restore();
  }

  return {handles:technique=>scenes.has(technique),release,advance,draw};
})();
