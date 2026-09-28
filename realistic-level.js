import * as T from 'three';
import {RGBELoader} from './rgbe-loader.js';
const root='./assets/realistic/';
let library;
export async function loadRealisticLevel(loader,renderer){
 const textures=new T.TextureLoader(),names=['asphalt_02','brick_wall_02','concrete_wall_006'];
 const surfaces={};
 await Promise.all(names.map(async name=>{
  const maps=await Promise.all(['color','normal','roughness'].map(s=>textures.loadAsync(root+name+'-'+s+'.jpg')));
  maps.forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())});maps[0].colorSpace=T.SRGBColorSpace;
  surfaces[name]=new T.MeshStandardMaterial({map:maps[0],normalMap:maps[1],roughnessMap:maps[2],roughness:.88,normalScale:new T.Vector2(.65,.65)});
 }));
 const [hdr,...props]=await Promise.all([new RGBELoader().loadAsync(root+'courtyard.hdr'),...['barrel_03','concrete_road_barrier','wooden_crate_01'].map(n=>loader.loadAsync(root+n+'/'+n+'.gltf'))]);
 hdr.mapping=T.EquirectangularReflectionMapping;
 const generator=new T.PMREMGenerator(renderer),lighting=generator.fromEquirectangular(hdr).texture;generator.dispose();
 library={surfaces,hdr,lighting,props};return library;
}
export function createRealisticLevel(){
 const group=new T.Group(),obstacles=[],resources=new Set(),bounds={minX:-12,maxX:12,minZ:-23,maxZ:21};
 const keep=r=>(resources.add(r),r),mats=new Map();let seed=9182;
 const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
 const mat=(color,metalness=0,roughness=.8)=>{const key=[color,metalness,roughness].join();if(!mats.has(key))mats.set(key,keep(new T.MeshStandardMaterial({color,metalness,roughness})));return mats.get(key)};
 const brick=library.surfaces.brick_wall_02,concrete=library.surfaces.concrete_wall_006,asphalt=library.surfaces.asphalt_02;
 const metal=mat(0x424d4b,.7,.6),trim=mat(0x64695e,.15,.8),glass=mat(0x344647,.6,.17),rust=mat(0x68513a,.4,.9);
 function box(x,y,z,w,h,d,material=concrete,collision=false){
  const geo=keep(new T.BoxGeometry(w,h,d)),uv=geo.attributes.uv,p=geo.attributes.position,n=geo.attributes.normal;
  const scale=material===asphalt?5:2;
  for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,(nx>.5?p.getZ(i):p.getX(i))/scale,(ny>.5?p.getZ(i):p.getY(i))/scale)}
  const mesh=new T.Mesh(geo,material);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
  if(collision)obstacles.push({x,z,w:w/2+.15,d:d/2+.15,h});return mesh;
 }
 function pipe(x,y,z,r,length,material=metal,axis='y'){
  const mesh=new T.Mesh(keep(new T.CylinderGeometry(r,r,length,12)),material);mesh.position.set(x,y,z);if(axis==='x')mesh.rotation.z=Math.PI/2;if(axis==='z')mesh.rotation.x=Math.PI/2;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;
 }
 function sign(text,x,y,z,w,h,rotation=0,warning=false){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=warning?'#b3a06a':'#263a3a';ctx.fillRect(0,0,1024,256);ctx.strokeStyle=warning?'#34382f':'#94a39a';ctx.lineWidth=9;ctx.strokeRect(16,16,992,224);ctx.fillStyle=warning?'#252a25':'#dfdfcc';ctx.font='bold 92px Arial';ctx.textAlign='center';ctx.fillText(text,512,160);for(let i=0;i<1100;i++){ctx.fillStyle='rgba(20,23,20,.12)';ctx.fillRect(random()*1024,random()*256,random()*15,2)}
  const tex=keep(new T.CanvasTexture(canvas));tex.colorSpace=T.SRGBColorSpace;const material=keep(new T.MeshStandardMaterial({map:tex,roughness:.95}));const mesh=new T.Mesh(keep(new T.PlaneGeometry(w,h)),material);mesh.position.set(x,y,z);mesh.rotation.y=rotation;group.add(mesh);
 }
 // Enclosed, human-scale service courtyard with distinct flanking lanes.
 box(0,-.18,-1,44,.36,66,asphalt);
 box(-13,5,-3,3,10,54,brick,true);box(14,3.5,-5,5,7,54,concrete,true);box(0,5,-26,29,10,3,brick,true);
 box(0,2,24,28,4,2,concrete,true);
 for(const side of [-1,1]){
  const x=side*11.3;
  box(x,.1,-1,1.25,.2,47,concrete);
  box(side*11.95,side<0?9.9:7.05,-2,.7,.3,51,trim);
  box(side*11.8,.55,-1,.15,1.1,49,concrete);
  for(let z=18;z>=-20;z-=6){
   // Recessed glass, jambs, sills and mullions, oriented into the arena.
   const y=side<0?5.1:4.2;
   box(x+side*.3,y,z,.12,2.25,2.9,metal);
   box(x+side*.21,y,z,.035,1.98,2.66,glass);
   for(const dy of [-1.1,0,1.1])box(x+side*.13,y+dy,z,.12,.055,2.8,trim);
   for(const dz of [-1.4,0,1.4])box(x+side*.12,y,z+dz,.12,2.2,.06,trim);
   box(x,y-1.18,z,.5,.13,3.1,concrete);
   if(side<0){box(x+.2,8.1,z,.1,1.6,2.8,metal);box(x+.26,8.1,z,.06,1.4,2.6,glass)}
  }
 }
 // Loading bay: slatted steel shutter, warning edging, overhead canopy.
 box(0,2.15,-24.43,7,4.3,.14,metal);
 for(let y=.12;y<4.3;y+=.17)box(0,y,-24.31,6.85,.045,.05,trim);
 for(const x of [-3.65,3.65])box(x,2.3,-24.15,.22,4.6,.4,concrete);
 box(0,4.65,-23.8,8,.18,1.8,metal);sign('SECTOR 07  /  LOADING',0,5.6,-24.35,6,.95);
 for(const x of [-8.6,8.6]){
  box(x,2,-24.4,2.2,4,.12,metal);box(x-.65,1.85,-24.24,.06,.4,.08,rust);
  sign('RESTRICTED',x,3,-24.2,1.65,.43,0,true);
 }
 // Mechanical details: drainpipes, clamps, electrical conduits and HVAC.
 for(const z of [-19,-4,15]){
  pipe(-11.12,4.8,z,.09,9.6,rust);for(let y=1;y<9;y+=2)pipe(-11.12,y,z,.12,.09,metal);
  box(10.6,2.85,z,1.3,1.1,1.5,metal);for(let i=0;i<8;i++)box(9.93,2.4+i*.12,z,.04,.035,1.28,trim);
  pipe(10.7,1.2,z,.035,2.2,rust);
 }
 pipe(-10.95,6.55,-1,.14,42,rust,'z');pipe(-10.85,6.2,-1,.06,42,metal,'z');
 for(let z=-21;z<22;z+=4)box(-11,6.4,z,.3,.65,.06,metal);
 sign('QUARANTINE  /  KEEP CLEAR',-11.02,2.4,7,3.7,.7,Math.PI/2,true);
 // Scanned props, with the same collision bounds as the visible models.
 function prop(index,x,z,height,angle=0,blocking=true){
  const model=library.props[index].scene.clone(true);const b=new T.Box3().setFromObject(model),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3()),scale=height/size.y;
  model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-b.min.y*scale,-center.z*scale);
  const pivot=new T.Group();pivot.add(model);pivot.position.set(x,0,z);pivot.rotation.y=angle;group.add(pivot);pivot.updateMatrixWorld(true);
  model.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});
  const bound=new T.Box3().setFromObject(pivot);if(blocking)obstacles.push({x:(bound.min.x+bound.max.x)/2,z:(bound.min.z+bound.max.z)/2,w:(bound.max.x-bound.min.x)/2+.12,d:(bound.max.z-bound.min.z)/2+.12,h:height});
  return pivot;
 }
 prop(1,-4,5,1.05,.14);prop(1,4.8,-8,1.05,-.3);prop(1,-6.6,-16,1.05,.2);
 for(const [x,z]of [[-9,12],[-8.2,11],[8,6],[9,6.4],[8.4,-18]])prop(0,x,z,.92,random()*6);
 for(const [x,z]of [[7,15],[8.5,15.4],[-8,-8],[-9,-9.5],[8,-21]])prop(2,x,z,1.15,random()*.3);
 // Pallet slats and scattered rubble establish believable scale.
 for(const [x,z]of [[-8,16],[8,-2]]){for(let i=0;i<7;i++)box(x-1+i*.3,.14,z,.23,.09,1.7,mat(0x665c43));for(const dz of [-.65,0,.65])box(x,.065,z+dz,2,.1,.14,mat(0x494536))}
 const debrisGeo=keep(new T.DodecahedronGeometry(1,0)),debrisMaterial=mat(0x767264),debris=new T.InstancedMesh(debrisGeo,debrisMaterial,180),dummy=new T.Object3D();
 for(let i=0;i<180;i++){const side=i%2?1:-1;dummy.position.set(side*(8.7+random()*2.2),.035+random()*.06,-22+random()*43);dummy.rotation.set(random()*3,random()*6,random()*3);dummy.scale.set(.03+random()*.15,.03+random()*.1,.03+random()*.2);dummy.updateMatrix();debris.setMatrixAt(i,dummy.matrix)}debris.receiveShadow=true;group.add(debris);
 // Tufts in wall cracks, with slender blades instead of rounded green blobs.
 const grassGeo=keep(new T.PlaneGeometry(.045,.38)),grassMaterial=keep(new T.MeshStandardMaterial({color:0x525a36,side:T.DoubleSide,roughness:1})),grass=new T.InstancedMesh(grassGeo,grassMaterial,350);
 for(let i=0;i<350;i++){dummy.position.set((i%2?1:-1)*(10.3+random()*.6),.13,-22+random()*44);dummy.rotation.set((random()-.5)*.7,random()*6,(random()-.5)*.7);dummy.scale.set(1,.4+random(),1);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix)}group.add(grass);
 // Worn paint markings and drainage grilles sit flush with the pavement.
 const paint=mat(0xa39460,0,.98);for(let z=-20;z<20;z+=3)box(-.15,.009,z,.07,.014,1.2,paint);
 for(const z of [10,-10]){box(0,.008,z,1.1,.015,.6,metal);for(let i=0;i<12;i++)box(-.49+i*.088,.02,z,.025,.014,.55,mat(0x161d1c))}
 // Warm practical fixtures contrast subtly with daylight.
 for(const z of [-17,1,17]){box(-10.95,3.3,z,.2,.24,.55,metal);box(-10.81,3.28,z,.035,.12,.42,keep(new T.MeshStandardMaterial({color:0xffd39a,emissive:0xffb65c,emissiveIntensity:2})));const light=new T.PointLight(0xffcf91,7,5,2);light.position.set(-10.45,3.1,z);group.add(light)}
 const spawn=new T.Vector3(0,0,18),spawnPoints=[{x:0,z:2},{x:-4,z:-3},{x:6,z:-2},{x:0,z:-13},{x:-4,z:-19},{x:7,z:-14},{x:3,z:-20},{x:-7,z:0}];
 const clear=(x,z,pad=.65)=>x>bounds.minX+.5&&x<bounds.maxX-.5&&z>bounds.minZ+.5&&z<bounds.maxZ-.5&&!obstacles.some(o=>Math.abs(x-o.x)<o.w+pad&&Math.abs(z-o.z)<o.d+pad);
 const cell=1,nx=25,nz=45,walk=new Uint8Array(nx*nz),distance=new Int16Array(nx*nz),queue=new Int32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)walk[j*nx+i]=clear(-12+i,-23+j)?1:0;
 const index=(x,z)=>Math.max(0,Math.min(nz-1,Math.round(z+23)))*nx+Math.max(0,Math.min(nx-1,Math.round(x+12)));let last=-1;
 function updateNavigation(target){let start=index(target.x,target.z);if(!walk[start]){let best=Infinity;for(let k=0;k<walk.length;k++)if(walk[k]){const d=Math.abs(k%nx-start%nx)+Math.abs(Math.floor(k/nx)-Math.floor(start/nx));if(d<best){best=d;start=k}}}if(start===last)return;last=start;distance.fill(-1);let head=0,tail=0;queue[tail++]=start;distance[start]=0;while(head<tail){const k=queue[head++],x=k%nx;for(const n of [x>0?k-1:-1,x<nx-1?k+1:-1,k-nx,k+nx])if(n>=0&&n<walk.length&&walk[n]&&distance[n]<0){distance[n]=distance[k]+1;queue[tail++]=n}}}
 function direction(pos,target){let k=index(pos.x,pos.z),best=k,d=distance[k]<0?32767:distance[k],x=k%nx;for(const n of [x>0?k-1:-1,x<nx-1?k+1:-1,k-nx,k+nx])if(n>=0&&n<walk.length&&distance[n]>=0&&distance[n]<d){best=n;d=distance[n]}return best===k?target:{x:-12+best%nx,z:-23+Math.floor(best/nx)}}
 updateNavigation(spawn);
 return{group,obstacles,bounds,spawn,spawnPoints:spawnPoints.filter(p=>clear(p.x,p.z)&&distance[index(p.x,p.z)]>=0),name:'ساحة العزل · المرحلة التجريبية',sky:0xa6b0ae,kind:'prototype',clear,updateNavigation,direction,background:library.hdr,lighting:library.lighting,dispose(){resources.forEach(r=>r.dispose())}};
}
