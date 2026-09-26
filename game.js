import * as THREE from './three.module.js';
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xbad6d7,.005);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,180);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x73b7df);$('world').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xf1f4ee,0x718379,1.5));const sun=new THREE.DirectionalLight(0xfff3de,1.9);sun.position.set(-30,55,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-50,right:50,top:65,bottom:-65});sun.shadow.normalBias=.04;scene.add(sun);
const palette={grass:0x65b7a4,edge:0x447e81,rock:0x5b697e,trunk:0x694e64,pink:0xf9a5c8,dark:0x30334f,wood:0xb77979};
const ramp=new THREE.DataTexture(new Uint8Array([105,180,245]),3,1,THREE.RedFormat);ramp.minFilter=THREE.NearestFilter;ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
const mats=new Map();function mat(c){if(!mats.has(c))mats.set(c,new THREE.MeshToonMaterial({color:c,gradientMap:ramp,flatShading:true}));return mats.get(c)}
function mesh(g,c,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(g,typeof c==='number'?mat(c):c);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function ball(x,y,z,r,c,parent=scene){return mesh(new THREE.IcosahedronGeometry(r,1),c,x,y,z,parent)}
function box(x,y,z,w,h,d,c,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,parent)}
function branch(a,b,r,c,parent=scene){let av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);let m=mesh(new THREE.CylinderGeometry(r*.65,r,v.length(),7),c,...av.clone().add(bv).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m}
let seed=13;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
// A sunlit countryside village, built as playable geometry.
const mapScale=1, garden=new THREE.Group();scene.add(garden);
const obstacles=[],treePositions=[];const ripples=[],petals=[];
box(0,-.25,-15,180,.5,180,0x8eb28b,garden);
box(0,.015,-15,11,.03,150,0xabb4b3,garden);
for(const x of [-5.7,5.7])box(x,.022,-15,.13,.045,150,0xf1e7c7,garden);
for(const x of [-6.5,6.5])box(x,.005,-15,1.3,.025,150,0xdacfa7,garden);
for(let z=35;z>-85;z-=6)box(0,.04,z,.12,.035,2.4,0xf7eed2,garden);
for(let x=-4.5;x<=4.5;x+=1.5)box(x,.045,-8,.85,.03,2.1,0xf7eed2,garden);
// Gabled roofs have a true triangular silhouette, with overhanging eaves.
function roof(w,h,d,color,parent,y){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,h);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});const r=mesh(geo,color,0,y,-d/2,parent);return r}
function house(x,z,w,h,d,wall,roofColor){const g=new THREE.Group();g.position.set(x,0,z);garden.add(g);box(0,h/2,0,w,h,d,wall,g);roof(w+.65,1.9,d+.65,roofColor,g,h);box(0,.15,0,w+.15,.3,d+.15,0xb6ac92,g);
 for(const xx of [-w*.27,w*.27])for(const yy of [1.8,h-1.25]){box(xx,yy,d/2+.03,1.05,1.25,.12,0xd8ddc5,g);box(xx,yy,d/2+.11,.84,1.03,.06,0x597b82,g);box(xx,yy,d/2+.16,.045,1.06,.04,0xc7d3c2,g);box(xx,yy,d/2+.17,.88,.045,.04,0xc7d3c2,g);box(xx,yy-.68,d/2+.17,1.24,.09,.28,0xaca993,g)}
 box(0,1.05,d/2+.06,1.03,2.1,.14,0x665f52,g);ball(.32,1,d/2+.17,.045,0xd5c194,g);box(0,2.24,d/2+.4,1.5,.15,.95,roofColor,g);box(0,.12,d/2+.5,1.5,.24,1,0xc9c5ae,g);
 const side=x<0?1:-1;for(const zz of [-d*.25,d*.25]){box(side*(w/2+.05),h-1.3,zz,.1,1.3,1.1,0xd5d6bd,g);box(side*(w/2+.11),h-1.3,zz,.06,1.05,.86,0x688c96,g)}
 box(w*.22,h+1.3,-d*.23,.65,1.8,.7,0xb1a997,g);box(w*.22,h+2.23,-d*.23,.84,.12,.88,0x696e69,g);
 obstacles.push({x,z,w:w/2+.28,d:d/2+.45});
}
house(-11,3,6,5.2,6,0xd1c3b0,0xa46e6e);house(11,-1,6.4,6,7,0xddccaf,0xd88a6f);house(-12,-17,6,5,6,0xb4c2ba,0x647e91);house(12,-25,7,5.3,7,0xe1d2b2,0xb97662);house(-11,-37,5.5,4.5,6,0xc6c7ac,0x82718b);house(11,23,5.5,4.8,6,0xd4c6aa,0x768d92);
// Small timber shed beside the road.
box(8,1.1,9,3.2,2.2,3,0xaa916b,garden);roof(3.6,.8,3.5,0x8fabb6,garden,2.2).position.set(8,2.2,7.25);for(let i=0;i<10;i++)box(6.55+i*.32,1.1,10.52,.025,2.2,.035,0x817d60,garden);obstacles.push({x:8,z:9,w:1.8,d:1.7});
function oak(x,z,scale=1){treePositions.push([x,z,.38*scale]);const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);garden.add(g);branch([0,0,0],[.1,4.7,0],.23,0x8d8971,g);branch([0,2.2,0],[-1.5,4.6,0],.12,0x96967b,g);branch([0,2.8,0],[1.6,5,.4],.11,0x96967b,g);for(let i=0;i<10;i++){let a=i*2.4;const b=ball(Math.cos(a)*1.4,4.7+rand()*1.5,Math.sin(a)*1.2,1.25+rand()*.55,[0x347b68,0x438872,0x538f76,0x276b60][i%4],g);b.scale.set(1.1,.9,1)} }
for(let z=30;z>-65;z-=9){oak(-20-rand()*7,z,.9+rand()*.4);oak(20+rand()*6,z,1+rand()*.5)}oak(-8,15,.9);oak(15,12,1.1);oak(-8,-27,.8);oak(8,-42,1);
for(let i=0;i<26;i++){let x=(i%2?1:-1)*(11+rand()*27),z=35-rand()*105;for(let j=0;j<3;j++)ball(x+j*.7,.6,z,.8+rand()*.4,0x397c63,garden)}
// Faceted distant ridges leave the road's vanishing point open.
for(let i=0;i<22;i++){const x=(i%2?1:-1)*(32+rand()*45),z=30-rand()*125;const hill=ball(x,0,z,10+rand()*12,[0x719a7b,0x8bad8b,0x648f78][i%3],garden);hill.scale.y=.35+rand()*.25;}
for(let side of [-1,1])for(let z=25;z>-65;z-=13){const x=side*6.9;branch([x,0,z],[x,5.7,z],.065,0x737c6c,garden);branch([x,5.7,z],[x-side*.7,6,z],.065,0x737c6c,garden);box(x-side*.78,5.98,z,.48,.13,.25,0x666e60,garden)}
// Utility poles and gently sagging overhead lines.
for(let z=27;z>-60;z-=24){box(8,4.3,z,.18,8.6,.18,0x747760,garden);box(8,8,z,2,.12,.12,0x747760,garden);if(z> -45){const pts=[];for(let i=0;i<=20;i++)pts.push(new THREE.Vector3(8,8-.7*Math.sin(i/20*Math.PI),z-i/20*24));garden.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x697264})))}}
for(let x of [-16,16])for(let z=15;z<29;z+=1.3){box(x,.6,z,.12,1.2,.15,0xc8b994,garden);box(x,.8,z,.1,.1,1.4,0xc8b994,garden);box(x,.35,z,.1,.1,1.4,0xc8b994,garden)}
// Instanced grass gives the ground detail without thousands of draw calls.
const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.045,.19,3),mat(0x699767),1300);const dummy=new THREE.Object3D();for(let i=0;i<1300;i++){dummy.position.set((rand()>.5?1:-1)*(7.5+rand()*34),.08,rand()*105-65);dummy.rotation.set(0,rand()*6,rand()*.35);dummy.scale.setScalar(.5+rand());dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix)}garden.add(grass);
// Warm cloud banks above the green horizon.
for(let i=0;i<15;i++){const g=new THREE.Group();g.position.set(rand()*170-85,16+rand()*15,-45-rand()*45);scene.add(g);for(let j=0;j<7;j++){const b=mesh(new THREE.SphereGeometry(2.5+rand(),12,8),new THREE.MeshBasicMaterial({color:0xffe8bc}),j*2.3,Math.sin(j)*1.3,rand()*2,g);b.scale.set(1.6,.65,.75);b.castShadow=false}}
for(let i=0;i<7;i++){const h=ball(-48+i*16,-3,-105,15,0x8eae8d,garden);h.scale.y=.65;}
// The village's old arch is the destination after collecting every keepsake.
const gate=new THREE.Group();gate.position.set(0,0,-52);garden.add(gate);for(let x of [-2,2])box(x,1.6,0,.28,3.2,.3,0x95866b,gate);box(0,3.2,0,4.7,.35,.5,0x9b896c,gate);box(0,3.45,0,5,.15,.65,0x687e67,gate);
const portal=mesh(new THREE.CircleGeometry(1.5,48),new THREE.MeshBasicMaterial({color:0xffe4a0,transparent:true,opacity:.07,side:THREE.DoubleSide}),0,1.7,0,gate);
const ring=mesh(new THREE.TorusGeometry(1.5,.035,6,48),new THREE.MeshBasicMaterial({color:0xffe6a7,transparent:true,opacity:.2}),0,1.7,0,gate);

const player=new THREE.Group();scene.add(player);player.position.set(0,0,20);player.rotation.y=Math.PI;const body=new THREE.Group();player.add(body);
function soft(x,y,z,sx,sy,sz,c,parent=body){const m=mesh(new THREE.SphereGeometry(1,12,10),mat(c),x,y,z,parent);m.scale.set(sx,sy,sz);return m}
mesh(new THREE.CylinderGeometry(.24,.34,.55,10),0xece4d8,0,.75,0,body);box(0,.6,0,.5,.13,.38,0x46516d,body);
const headRig=new THREE.Group();headRig.position.y=1.27;body.add(headRig);soft(0,0,0,.29,.29,.27,0xffd5b5,headRig);soft(0,.15,-.065,.32,.25,.29,0x30334e,headRig);
for(let i=0;i<5;i++){const lock=soft(-.23+i*.115,.15,.22,.09,.145,.07,0x30334e,headRig);lock.rotation.z=-.22+i*.09}
for(const side of [-1,1]){soft(side*.105,.006,.259,.046,.068,.018,0x35334a,headRig);soft(side*.1,.025,.274,.013,.017,.006,0xffffff,headRig);soft(side*.19,-.055,.225,.044,.022,.015,0xefad9d,headRig)}
const legs=[],arms=[],knees=[],elbows=[],ankles=[];
for(const side of [-1,1]){const hip=new THREE.Group();hip.position.set(side*.15,.49,0);body.add(hip);legs.push(hip);soft(0,-.1,0,.085,.15,.085,0x343d59,hip);const knee=new THREE.Group();knee.position.y=-.2;hip.add(knee);knees.push(knee);soft(0,-.065,0,.075,.115,.075,0x343d59,knee);const ankle=new THREE.Group();ankle.position.y=-.17;knee.add(ankle);ankles.push(ankle);soft(0,-.03,.05,.1,.08,.16,0x4c4962,ankle);
const arm=new THREE.Group();arm.position.set(side*.27,.98,0);body.add(arm);arms.push(arm);soft(0,-.1,0,.09,.14,.1,0xe6ddcf,arm);const elbow=new THREE.Group();elbow.position.y=-.2;arm.add(elbow);elbows.push(elbow);soft(0,-.065,0,.071,.11,.074,0xe6ddcf,elbow);soft(0,-.17,.015,.07,.07,.07,0xffd5b5,elbow)}
mesh(new THREE.TorusGeometry(.235,.08,8,20),0xd85675,0,1.055,0,body).rotation.x=Math.PI/2;
const scarf=box(.07,1,-.4,.22,.055,.6,0xeb6489,body);scarf.rotation.x=-.2;player.traverse(o=>{if(o.isMesh)o.castShadow=false});
const shadow=mesh(new THREE.CircleGeometry(.43,24),new THREE.MeshBasicMaterial({color:0x294e66,transparent:true,opacity:.2,depthWrite:false}),0,.035,7.2);shadow.rotation.x=-Math.PI/2;
const coords=[[0,15],[-6.8,8],[6.5,0],[-6.5,-12],[6.5,-19],[-6.7,-28],[5,-34],[-4,-41],[2,-46],[0,-50]];const crystals=[];const glowmat=new THREE.MeshStandardMaterial({color:0xabfff0,emissive:0x46d9cc,emissiveIntensity:.9,roughness:.3,metalness:.15});
coords.forEach(([baseX,baseZ],i)=>{const x=baseX*mapScale,z=baseZ*mapScale;const g=new THREE.Group();g.position.set(x,1,z);scene.add(g);const gem=mesh(new THREE.OctahedronGeometry(.28),glowmat,0,0,0,g);gem.scale.y=1.7;const halo=mesh(new THREE.TorusGeometry(.44,.013,5,32),new THREE.MeshBasicMaterial({color:0xcbfff7,transparent:true,opacity:.65}),0,0,0,g);halo.rotation.x=Math.PI/2;crystals.push({g,gem,halo,x,z,taken:false,phase:i})});
crystals.forEach(c=>c.g.visible=false);
const keys=new Set();let jumpV=0,count=0,won=false,muted=true,audioCtx,toastTimer;
function sound(freq){if(muted)return;audioCtx??=new AudioContext();audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(freq,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(freq*1.5,audioCtx.currentTime+.2);g.gain.setValueAtTime(.07,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.5);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.5)}
function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2500)}
function jump(){if(!won&&!dead)jumpBuffer=.14}
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)jump();if(e.code==='KeyJ'&&!e.repeat)attack()});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();velocity.set(0,0,0)});document.addEventListener('visibilitychange',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);if(b.dataset.key==='Space')jump();if(b.dataset.key==='KeyJ')attack()});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key))}
$('sound').onclick=()=>{muted=!muted;$('sound').querySelector('span').textContent=muted?'الصوت مغلق':'الصوت يعمل';$('sound').setAttribute('aria-label',muted?'تفعيل الصوت':'كتم الصوت');sound(523)};
function reset(){resetCombat();count=0;won=false;keys.clear();jumpV=0;jumpBuffer=0;velocity.set(0,0,0);yaw=0;pitch=.15;cameraReady=false;player.rotation.y=Math.PI;player.position.set(0,0,20);crystals.forEach(c=>{c.taken=false;c.g.visible=false});$('finish').hidden=true;$('count').innerHTML='٠ <em>/ ١٠</em>';$('bar').style.width='0%';$('objective').textContent='احمِ القرية';$('hint').textContent='اهزم ٨ أعداء • J أو زر السيف للهجوم';portal.material.opacity=.07;ring.material.opacity=.2;combatHUD()}
$('reset').onclick=reset;$('again').onclick=reset;
let last=performance.now(),time=0,step=0,jumpBuffer=0,yaw=0,pitch=.15,distance=5.7,cameraReady=false;
const velocity=new THREE.Vector3(),target=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),cameraFocus=new THREE.Vector3();
const forward=new THREE.Vector3(),right=new THREE.Vector3(),direction=new THREE.Vector3();
const occlusionRay=new THREE.Raycaster(),occlusionDirection=new THREE.Vector3(),faded=new Set(),cameraObstacles=[];
garden.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingSphere();if(o.geometry.boundingSphere.radius>.32)cameraObstacles.push(o)}});
function clearCameraView(){
 for(const o of faded){o.material.opacity=1;o.material.transparent=false;o.material.depthWrite=true}faded.clear();
 scene.updateMatrixWorld();occlusionDirection.copy(camera.position).sub(cameraFocus);occlusionRay.set(cameraFocus,occlusionDirection.clone().normalize());occlusionRay.near=.35;occlusionRay.far=occlusionDirection.length()+.6;
 for(const hit of occlusionRay.intersectObjects(cameraObstacles,false)){const o=hit.object;if(!o.userData.cameraMaterial){o.material=o.material.clone();o.userData.cameraMaterial=true}o.material.transparent=true;o.material.opacity=.12;o.material.depthWrite=false;faded.add(o)}
}
const canvas=renderer.domElement;canvas.style.touchAction='none';let dragging=false,dragX=0,dragY=0;
canvas.addEventListener('pointerdown',e=>{dragging=true;dragX=e.clientX;dragY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw-=(e.clientX-dragX)*.005;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-dragY)*.004,-.08,.75);dragX=e.clientX;dragY=e.clientY});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>dragging=false);
canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.005,3.2,8)},{passive:false});canvas.addEventListener('contextmenu',e=>e.preventDefault());
const treeColliders=treePositions;
// Sword combat: wind-up, active strike, recovery, and a three-hit combo.
const sword=new THREE.Group();sword.position.set(0,-.17,.04);sword.rotation.x=-Math.PI/2;elbows[1].add(sword);
box(0,.05,0,.055,.24,.065,0x665444,sword);box(0,.2,0,.3,.055,.1,0xc6aa63,sword);
const blade=mesh(new THREE.CylinderGeometry(0,.065,.9,4),new THREE.MeshStandardMaterial({color:0xe0f5fa,metalness:.65,roughness:.28}),0,.68,0,sword);blade.scale.z=.35;
const slash=mesh(new THREE.TorusGeometry(1.15,.045,5,36,Math.PI*1.4),new THREE.MeshBasicMaterial({color:0xc7faff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),0,1,0,player);slash.rotation.x=Math.PI/2;
let hp=100,kills=0,dead=false,attackTime=0,attackCooldown=0,combo=0,comboWindow=0,hitSet=new Set(),invulnerable=0;
const enemies=[];const enemySpawns=[[0,14],[3,8],[-3,2],[2,-7],[-2,-15],[3,-24],[-3,-34],[0,-44]];
function spawnEnemies(){for(const e of enemies)scene.remove(e.g);enemies.length=0;enemySpawns.forEach(([x,z],i)=>{const g=new THREE.Group(),rig=new THREE.Group();g.position.set(x,0,z);scene.add(g);g.add(rig);soft(0,.82,0,.28,.35,.2,i%2?0x66516f:0x45526a,rig);const head=new THREE.Group();head.position.y=1.32;rig.add(head);soft(0,0,0,.22,.25,.21,0xc2baa7,head);
const limbs=[],joints=[];for(const side of [-1,1]){soft(side*.085,.03,.194,.042,.026,.025,0xff6255,head);mesh(new THREE.ConeGeometry(.07,.25,6),0xd1bd98,side*.18,.26,0,head);
const leg=new THREE.Group();leg.position.set(side*.16,.57,0);rig.add(leg);soft(0,-.12,0,.09,.16,.09,0x3c4051,leg);const knee=new THREE.Group();knee.position.y=-.24;leg.add(knee);soft(0,-.1,0,.075,.13,.08,0x3c4051,knee);soft(0,-.23,.06,.1,.08,.16,0x292f40,knee);limbs.push(leg);joints.push(knee)}
const hands=[],bends=[];for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.29,1.05,0);rig.add(arm);soft(0,-.12,0,.1,.17,.1,0x565568,arm);const elbow=new THREE.Group();elbow.position.y=-.25;arm.add(elbow);soft(0,-.12,0,.08,.16,.08,0x565568,elbow);soft(0,-.25,0,.09,.085,.09,0xa6a295,elbow);hands.push(arm);bends.push(elbow)}
const club=new THREE.Group();club.position.set(0,-.25,.03);club.rotation.x=-Math.PI/2;bends[1].add(club);box(0,.2,0,.085,.65,.09,0x69564c,club);const mace=mesh(new THREE.IcosahedronGeometry(.18,0),0x88879a,0,.57,0,club);mace.scale.y=1.6;
const hpbar=box(0,1.9,0,.65,.065,.04,0xe28777,g);const tell=mesh(new THREE.RingGeometry(.8,.88,32),new THREE.MeshBasicMaterial({color:0xff674d,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),0,.055,0,g);tell.rotation.x=-Math.PI/2;g.traverse(o=>{if(o.isMesh)o.castShadow=false});enemies.push({g,rig,head,limbs,joints,hands,bends,hpbar,tell,hp:4,cooldown:1+i*.1,wind:0,flash:0,stun:0,phase:i,dead:false,death:0,step:i,kick:new THREE.Vector3(),strike:0,didHit:false})})}
function combatHUD(){$('health-fill').style.width=hp+'%';$('health-label').textContent=hp+' / 100';$('count').innerHTML=kills+' <em>/ 8</em>';$('bar').style.width=kills/8*100+'%'}
function resetCombat(){hitStop=0;shake=0;hurtPose=0;pendingStrike=false;winDelay=0;trailPoints.length=0;trailGeo.setDrawRange(0,0);sparks.forEach(s=>{s.life=0;s.m.visible=false});hp=100;kills=0;dead=false;attackTime=0;attackCooldown=0;comboWindow=0;combo=0;invulnerable=0;body.visible=true;spawnEnemies();combatHUD();$('objective').textContent='احمِ القرية';$('hint').textContent='اهزم ٨ أعداء • J أو زر السيف للهجوم';$('finish').hidden=true}
function finishFight(lost){keys.clear();velocity.set(0,0,0);$('finish').hidden=false;document.querySelector('.finish-card h2').textContent=lost?'حاول مرة أخرى':'قتلت كل اعداء لاسا';document.querySelector('.finish-card p').textContent=lost?'اقترب واضرب، ثم تحرك لتفادي الدائرة الحمراء.':'هزمت الأعداء الثمانية وأعدت الهدوء إلى الطريق.';$('again').textContent='العب من جديد ←'}
let hitStop=0,shake=0,hurtPose=0,attackDuration=.58,pendingStrike=false,winDelay=0;
const trailPoints=[],trailArray=new Float32Array(12*6*3),trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(trailArray,3));trailGeo.setDrawRange(0,0);
const trail=new THREE.Mesh(trailGeo,new THREE.MeshBasicMaterial({color:0xc5f6ff,side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false}));trail.frustumCulled=false;scene.add(trail);
const sparks=[];for(let i=0;i<36;i++){const m=mesh(new THREE.IcosahedronGeometry(.035,0),new THREE.MeshBasicMaterial({color:i%2?0xffdfa0:0xdbffff}));m.visible=false;m.castShadow=false;sparks.push({m,v:new THREE.Vector3(),life:0})}
function burst(p){for(let i=0;i<10;i++){const s=sparks.find(s=>s.life<=0);if(!s)break;s.life=.25+Math.random()*.2;s.m.visible=true;s.m.position.copy(p);s.v.set((Math.random()-.5)*6,1+Math.random()*3,(Math.random()-.5)*6)}}
function attack(){if(dead||won)return;if(attackCooldown>0){if(attackTime<.22)pendingStrike=true;return}combo=comboWindow>0?(combo+1)%3:0;attackDuration=combo===2?.76:.58;comboWindow=1.15;attackTime=attackDuration;attackCooldown=attackDuration;pendingStrike=false;hitSet.clear();trailPoints.length=0;sound(180+combo*70);
let nearest=null,best=2.8;for(const e of enemies){const d=e.g.position.distanceTo(player.position);if(!e.dead&&d<best){best=d;nearest=e}}if(nearest)player.rotation.y=Math.atan2(nearest.g.position.x-player.position.x,nearest.g.position.z-player.position.z)}
function updateCombat(dt){invulnerable=Math.max(0,invulnerable-dt);hurtPose=Math.max(0,hurtPose-dt);attackCooldown=Math.max(0,attackCooldown-dt);comboWindow=Math.max(0,comboWindow-dt);shake=Math.max(0,shake-dt*1.5);if(keys.has('KeyJ')||pendingStrike&&attackCooldown===0)attack();body.visible=true;slash.visible=false;
if(winDelay>0){winDelay-=dt;if(winDelay<=0)finishFight(false)}
let active=false;
if(attackTime>0){attackTime=Math.max(0,attackTime-dt);const t=1-attackTime/attackDuration;const wind=Math.min(t/.3,1),cut=THREE.MathUtils.smoothstep(t,.3,.52),recover=THREE.MathUtils.smoothstep(t,.65,1),direction=combo===1?-1:1;
active=t>.3&&t<.6;const pose=1-recover;
if(combo===2){arms[1].rotation.set((-2.7+cut*3)*pose,0,-.2);elbows[1].rotation.x=-.45;body.rotation.x=(-.17+cut*.45)*pose;body.rotation.y=-.25*pose;arms[0].rotation.x=-1.4*pose}else{arms[1].rotation.set((-1.25+.4*cut)*pose,(-.8+cut*1.7)*direction*pose,(-1.15*wind+cut*2.1)*direction*pose);elbows[1].rotation.x=(-1+.8*cut)*pose;body.rotation.y=(-.7*wind+cut*1.45)*direction*pose;body.rotation.x=.08*pose;arms[0].rotation.x=.4*pose}
legs[1].rotation.x=-.18*pose;legs[0].rotation.x=.18*pose;
if(active&&!dead){player.position.x+=Math.sin(player.rotation.y)*dt*(combo===2?2.4:1.4);player.position.z+=Math.cos(player.rotation.y)*dt*(combo===2?2.4:1.4);
for(const e of enemies){if(e.dead||hitSet.has(e))continue;const dx=e.g.position.x-player.position.x,dz=e.g.position.z-player.position.z,d=Math.hypot(dx,dz),dot=(dx*Math.sin(player.rotation.y)+dz*Math.cos(player.rotation.y))/Math.max(d,.01);if(d<2.15&&dot>-.1&&player.position.y<1.5){hitSet.add(e);e.hp-=combo===2?2:1;e.flash=.18;e.stun=combo===2?.65:.38;e.wind=0;e.strike=0;e.kick.set(dx/Math.max(d,.1),0,dz/Math.max(d,.1)).multiplyScalar(combo===2?5:2.5);e.hpbar.scale.x=Math.max(0,e.hp/4);e.tell.material.opacity=0;burst(e.g.position.clone().add(new THREE.Vector3(0,1,0)));hitStop=combo===2?.07:.035;shake=combo===2?.17:.07;sound(95+combo*30);if(e.hp<=0){e.dead=true;e.death=.75;kills++;e.hpbar.visible=false;hp=Math.min(100,hp+8);combatHUD();toast(combo===2?'⚔ ضربة قاضية!':'⚔ هُزم العدو');if(kills===8){won=true;keys.clear();winDelay=.8}}}}
}
}else{body.rotation.y*=Math.exp(-12*dt)}
if(hurtPose>0){body.rotation.x=-.25*Math.sin(hurtPose/.35*Math.PI);arms[0].rotation.x=-.6;body.position.y-=.05}
player.updateMatrixWorld(true);
if(active){trailPoints.unshift([sword.localToWorld(new THREE.Vector3(0,.35,0)),sword.localToWorld(new THREE.Vector3(0,1.12,0))]);if(trailPoints.length>12)trailPoints.pop()}else if(trailPoints.length)trailPoints.pop();
let n=0;for(let i=0;i<trailPoints.length-1;i++){const a=trailPoints[i],b=trailPoints[i+1];for(const p of [a[0],a[1],b[0],a[1],b[1],b[0]]){trailArray[n++]=p.x;trailArray[n++]=p.y;trailArray[n++]=p.z}}trailGeo.attributes.position.needsUpdate=true;trailGeo.setDrawRange(0,n/3);
for(const s of sparks){if(s.life<=0)continue;s.life-=dt;s.m.position.addScaledVector(s.v,dt);s.v.y-=dt*8;s.m.scale.setScalar(Math.max(0,s.life*3));s.m.visible=s.life>0}
for(const e of enemies){if(e.dead){if(e.death>0){e.death-=dt;e.g.position.addScaledVector(e.kick,dt);e.kick.multiplyScalar(Math.exp(-5*dt));e.rig.rotation.x=-(1-e.death/.75)*1.5;e.rig.position.y=-.2*(1-e.death/.75);e.rig.scale.setScalar(Math.max(0,Math.min(1,e.death/.25)));if(e.death<=0)e.g.visible=false}continue}
e.stun=Math.max(0,e.stun-dt);e.flash=Math.max(0,e.flash-dt);e.cooldown=Math.max(0,e.cooldown-dt);e.g.position.addScaledVector(e.kick,dt);e.kick.multiplyScalar(Math.exp(-9*dt));e.rig.rotation.x=-Math.sin(Math.min(1,e.stun/.38)*Math.PI)*.38;
const dx=player.position.x-e.g.position.x,dz=player.position.z-e.g.position.z,d=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);let moving=false;
if(!dead&&!won&&e.stun===0){if(e.strike>0){e.strike=Math.max(0,e.strike-dt);const t=1-e.strike/1.05;e.hands[1].rotation.x=-2.5*THREE.MathUtils.smoothstep(t,0,.5)+3.2*THREE.MathUtils.smoothstep(t,.55,.72);e.bends[1].rotation.x=-.5;e.rig.rotation.x=t<.55?-.12:.25;e.tell.material.opacity=t<.58?.45:0;e.tell.scale.setScalar(.8+t*.4);
if(t>.57&&t<.72){e.g.position.x+=Math.sin(e.g.rotation.y)*dt*2;e.g.position.z+=Math.cos(e.g.rotation.y)*dt*2;if(!e.didHit){e.didHit=true;const facing=(dx*Math.sin(e.g.rotation.y)+dz*Math.cos(e.g.rotation.y))/Math.max(d,.01);if(d<1.8&&facing>.4&&player.position.y<.6&&invulnerable===0){hp=Math.max(0,hp-18);invulnerable=.9;hurtPose=.35;shake=.13;burst(player.position.clone().add(new THREE.Vector3(0,.9,0)));combatHUD();sound(80);if(hp===0){dead=true;attackTime=0;pendingStrike=false;finishFight(true)}}}}if(e.strike===0){e.cooldown=1.1;e.tell.material.opacity=0}
}else{e.g.rotation.y+=Math.atan2(Math.sin(angle-e.g.rotation.y),Math.cos(angle-e.g.rotation.y))*(1-Math.exp(-7*dt));if(d<13&&d>1.4){e.g.position.x+=dx/d*dt*(e.phase%2?1.9:1.6);e.g.position.z+=dz/d*dt*(e.phase%2?1.9:1.6);moving=true}else if(d<=1.6&&e.cooldown===0){e.strike=1.05;e.didHit=false}}}
if(e.strike===0){e.step+=dt*(moving?8:1.5);const amp=moving?.5:.025;e.limbs.forEach((l,i)=>{let w=Math.sin(e.step+i*Math.PI);l.rotation.x=w*amp;e.joints[i].rotation.x=Math.max(0,-w)*amp;e.hands[i].rotation.x=-w*amp*.75;e.bends[i].rotation.x=-.25});e.rig.position.y=moving?Math.abs(Math.sin(e.step))*.035:Math.sin(time*2+e.phase)*.012;e.head.rotation.z=Math.sin(time+e.phase)*.035}
e.hpbar.quaternion.copy(camera.quaternion).premultiply(e.g.quaternion.clone().invert());
for(const other of enemies){if(other===e||other.dead)continue;const ax=e.g.position.x-other.g.position.x,az=e.g.position.z-other.g.position.z,dist=Math.hypot(ax,az);if(dist>0&&dist<.65){e.g.position.x+=ax/dist*dt;e.g.position.z+=az/dist*dt}}
for(const o of obstacles){const ax=e.g.position.x-o.x,az=e.g.position.z-o.z,ox=o.w+.25-Math.abs(ax),oz=o.d+.25-Math.abs(az);if(ox>0&&oz>0){if(ox<oz)e.g.position.x+=Math.sign(ax||1)*ox;else e.g.position.z+=Math.sign(az||1)*oz}}
}
}
spawnEnemies();combatHUD();

function animate(now){requestAnimationFrame(animate);const rawDt=Math.min((now-last)/1000,.05);last=now;const dt=hitStop>0?0:rawDt;hitStop=Math.max(0,hitStop-rawDt);time+=dt;
if(keys.has('KeyQ'))yaw+=dt*1.8;if(keys.has('KeyE'))yaw-=dt*1.8;
forward.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));
let mx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),mz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);
const moving=(mx||mz)&&!won&&!dead;const sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');
direction.set(0,0,0);if(moving)direction.copy(forward).multiplyScalar(mz).addScaledVector(right,mx).normalize().multiplyScalar(sprint?5.8:3.2);
velocity.lerp(direction,1-Math.exp(-(moving?9:15)*dt));if(velocity.length()<.015)velocity.set(0,0,0);
player.position.addScaledVector(velocity,dt);
for(const [x,z,r] of treeColliders){let dx=player.position.x-x,dz=player.position.z-z,d=Math.hypot(dx,dz);if(d<r+.25&&d>0){player.position.x=x+dx/d*(r+.25);player.position.z=z+dz/d*(r+.25)}}
for(const o of obstacles){const dx=player.position.x-o.x,dz=player.position.z-o.z,ox=o.w+.22-Math.abs(dx),oz=o.d+.22-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz){player.position.x+=Math.sign(dx||1)*ox;velocity.x=0}else{player.position.z+=Math.sign(dz||1)*oz;velocity.z=0}}}
player.position.x=THREE.MathUtils.clamp(player.position.x,-42,42);player.position.z=THREE.MathUtils.clamp(player.position.z,-63,38);
const speed=velocity.length();if(speed>.08&&attackTime<=0){const angle=Math.atan2(velocity.x,velocity.z),diff=Math.atan2(Math.sin(angle-player.rotation.y),Math.cos(angle-player.rotation.y));player.rotation.y+=diff*(1-Math.exp(-14*dt))}
jumpBuffer=Math.max(0,jumpBuffer-dt);if(jumpBuffer>0&&player.position.y<=.001&&!won&&!dead){jumpV=5.4;jumpBuffer=0;sound(260)}
jumpV-=14*dt;player.position.y=Math.max(0,player.position.y+jumpV*dt);if(player.position.y===0)jumpV=0;
const stride=Math.min(speed/3.2,1.65),airborne=player.position.y>.02,running=speed>3.7;
step+=dt*(speed>.08?(running?11:8)*Math.min(speed/3.2,1.2):0);
const blend=1-Math.exp(-14*dt),swing=(running?.75:.48)*Math.min(stride,1);
body.position.y=airborne?0:Math.abs(Math.sin(step))*(running?.055:.023)*Math.min(stride,1);
body.rotation.z=THREE.MathUtils.lerp(body.rotation.z,Math.sin(step)*.025*Math.min(stride,1),blend);
body.rotation.x=THREE.MathUtils.lerp(body.rotation.x,airborne?-.04:running?.12:.025*Math.min(stride,1),blend);
headRig.rotation.y=Math.sin(time*1.6)*.025;headRig.rotation.x=-body.rotation.x*.45;
legs.forEach((leg,i)=>{const phase=step+i*Math.PI,wave=Math.sin(phase);let hip=wave*swing,knee=Math.max(0,-wave)*(running?1.1:.65),foot=-knee*.32;
if(airborne){hip=i?-.28:-.5;knee=i?.65:1;foot=.12}else if(speed<.08){hip=0;knee=.035;foot=0}
leg.rotation.x=THREE.MathUtils.lerp(leg.rotation.x,hip,blend);knees[i].rotation.x=THREE.MathUtils.lerp(knees[i].rotation.x,knee,blend);ankles[i].rotation.x=THREE.MathUtils.lerp(ankles[i].rotation.x,foot,blend);
arms[i].rotation.x=THREE.MathUtils.lerp(arms[i].rotation.x,airborne?-.65:-wave*swing*.8,blend);arms[i].rotation.z=THREE.MathUtils.lerp(arms[i].rotation.z,(i?1:-1)*(airborne?.3:.09),blend);elbows[i].rotation.x=THREE.MathUtils.lerp(elbows[i].rotation.x,airborne?-1:running?-1.1:-.18-Math.max(0,wave)*.2,blend)});
scarf.rotation.x=-.2-speed*.08;scarf.rotation.z=Math.sin(time*9)*(.08+speed*.03);shadow.position.set(player.position.x,.04,player.position.z);shadow.scale.setScalar(1-player.position.y*.2);
updateCombat(dt);
for(const p of petals){p.position.x+=dt*.5;p.position.y-=dt*.35;p.position.z+=Math.sin(time+p.id)*dt*.18;p.rotation.x+=dt;p.rotation.z+=dt*.4;if(p.position.y<0)p.position.set(rand()*26-13,10+rand()*3,rand()*22-11);if(p.position.x>16)p.position.x=-16}
ripples.forEach((r,i)=>{r.material.opacity=.2+Math.sin(time*1.5+i)*.1});
const portrait=innerWidth<700;const fov=portrait?65:58;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix()}
target.set(player.position.x,player.position.y*.35+1.8,player.position.z);
if(!cameraReady){cameraFocus.copy(target)}else cameraFocus.lerp(target,1-Math.exp(-12*dt));
desiredCamera.set(cameraFocus.x+Math.sin(yaw)*Math.cos(pitch)*distance,cameraFocus.y+.5+Math.sin(pitch)*distance,cameraFocus.z+Math.cos(yaw)*Math.cos(pitch)*distance);
if(!cameraReady){camera.position.copy(desiredCamera);cameraReady=true}else camera.position.lerp(desiredCamera,1-Math.exp(-10*dt));
camera.position.x+=Math.sin(now*.073)*shake;camera.position.y+=Math.cos(now*.091)*shake*.6;camera.lookAt(cameraFocus);clearCameraView();renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
$('loading').remove();requestAnimationFrame(animate);
// Read-only state for smoke checks and debugging.
window.sakura={get state(){return {count,won,hp,kills,dead,combo,attacking:attackTime>0,enemies:enemies.filter(e=>!e.dead).map(e=>({hp:e.hp,striking:e.strike>0,stunned:e.stun>0,position:e.g.position.toArray()})),speed:velocity.length(),yaw,camera:camera.position.toArray(),position:player.position.toArray(),remaining:crystals.filter(c=>!c.taken).map(c=>[c.x,c.z])}}};





