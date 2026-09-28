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
 const [hdr,...props]=await Promise.all([new RGBELoader().loadAsync(root+'sunset-sky.hdr'),...['barrel_03','concrete_road_barrier','wooden_crate_01','modular_factory_facade','exterior_aircon_unit','wild_rooibos_bush'].map(n=>loader.loadAsync(root+n+'/'+n+'.gltf'))]);
 hdr.mapping=T.EquirectangularReflectionMapping;
 const generator=new T.PMREMGenerator(renderer),lighting=generator.fromEquirectangular(hdr).texture;generator.dispose();
 library={surfaces,hdr,lighting,props};return library;
}
export function createRealisticLevel(){
 const group=new T.Group(),reflections=[],obstacles=[],resources=new Set(),bounds={minX:-12,maxX:12,minZ:-23,maxZ:21};
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
 // Detailed authored factory kit replaces the flat procedural facade.
 box(0,-.18,-1,44,.36,66,asphalt);
 const facade=library.props[3].scene;
 function kit(name,x,y,z,angle=0,width=3){const source=facade.getObjectByName(name);if(!source)throw new Error('Missing facade '+name);const part=source.clone(true),pivot=new T.Group();part.position.set(width/2,0,0);part.rotation.set(0,0,0);pivot.add(part);pivot.position.set(x,y,z);pivot.rotation.y=angle;part.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true}});group.add(pivot);return pivot}
 const roof=mat(0x454a45,.35,.82);
 // Deep building volumes support the kit's recesses and prevent sky leaks.
 box(-15,4.5,-1,6,9,48,concrete,true);box(15,3,-1,6,6,48,concrete,true);box(0,4.5,-28.5,30,9,6,concrete,true);box(0,2,24,28,4,2,concrete,true);
 for(const side of [-1,1]){
  const x=side*11.78,angle=side<0?Math.PI/2:-Math.PI/2,stories=side<0?3:2;
  box(side*11.25,.075,-1,1.2,.15,47,concrete);
  for(let i=0;i<16;i++){
   const z=21.5-i*3;
   for(let floor=0;floor<stories;floor++){
    const variant=['01','02','03','04'][(i+floor)%4];
    const style=side<0?'tall_large':'centered_medium';
    kit('wall_window_'+style+'_'+variant,x,floor*3,z,angle);
    kit('window_'+style+'_'+variant,x,floor*3,z,angle);
    kit('cornice03_standard_standard_01',x,floor*3,z,angle);
   }
   kit('base_standard_standard_01',x,0,z,angle);
   kit('cornice01_standard_standard_01',x,stories*3,z,angle);
   if(i%3===0)kit('wall_pier_standard_01',x+(side<0?.04:-.04),0,z-1.45,angle,0);
  }
  box(side*14.8,stories*3+.08,-1,6.4,.18,48,roof);
  for(const z of [-19,-4,15]){pipe(side*11.42,stories*1.5,z,.07,stories*3,rust);for(let y=.5;y<stories*3;y+=1.5)pipe(side*11.42,y,z,.1,.055,metal)}
 }
 for(let i=0;i<10;i++){
  const x=-13.5+i*3;
  for(let floor=0;floor<3;floor++){
   if(floor===0&&Math.abs(x)<4.6)continue;
   const v=i%2?'01':'03';kit('wall_window_tall_large_'+v,x,floor*3,-24.42);kit('window_tall_large_'+v,x,floor*3,-24.42);
  }
  kit('cornice01_standard_standard_01',x,9,-24.42);
 }
 kit('wall_door_garage_double_01',0,0,-24.42,0,9);kit('door_garage_double_01',0,0,-24.42,0,9);
 box(0,3.45,-23.6,10,.18,2,roof);for(const x of [-4.5,4.5])pipe(x,1.7,-22.9,.055,3.4,metal);
 sign('WEST YARD  /  07',0,4.25,-24.2,4.6,.7);sign('QUARANTINE',-11.32,2.6,8,2.5,.65,Math.PI/2,true);
 // Roof silhouettes, ducts and an external access stair break the rectangular skyline.
 for(const [x,z,y]of [[-15,-15,9],[15,-8,6],[-15,10,9]]){box(x,y+.45,z,2,.9,1.4,metal);pipe(x,y+1.6,z,.18,2.8,rust);pipe(x+.65,y+1,z,.25,1.7,metal)}
 for(let i=0;i<13;i++)box(10.55,.2+i*.21,-11-i*.31,1.2,.09,.32,metal);
 for(const x of [9.9,11.2]){const rail=pipe(x,2.45,-13,.035,4.7,metal,'z');rail.rotation.x=-.55;for(let i=0;i<4;i++)pipe(x,1.1+i*.64,-11.3-i*.93,.025,1,metal)}
 obstacles.push({x:10.55,z:-13,w:.9,d:2.7,h:3});
 // Real rusted air-conditioning units and naturally irregular shrubs.
 function objectPart(index,name,x,y,z,angle,scale=1){const o=library.props[index].scene.getObjectByName(name).clone(true);o.position.set(0,0,0);const g=new T.Group();g.add(o);g.position.set(x,y,z);g.rotation.y=angle;g.scale.setScalar(scale);g.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true}});group.add(g);return g}
 for(const z of [-17,-2,14])objectPart(4,'exterior_aircon_unit_rusted',11.25,3.25,z,-Math.PI/2,1.2);
 for(let i=0;i<14;i++){const side=i%2?1:-1;objectPart(5,'wild_rooibos_bush_'+['a','b','c','d','e'][i%5],side*(10.5+random()*.45),0,-20+random()*39,random()*6,.75+random()*.65)}
 // Cables run between buildings, with visible sag.
 for(const z of [-15,7]){const path=new T.CatmullRomCurve3([new T.Vector3(-11.5,7.8,z),new T.Vector3(0,6.5,z+.6),new T.Vector3(11.5,6,z)]);group.add(new T.Mesh(keep(new T.TubeGeometry(path,24,.014,5,false)),mat(0x252b2a)))}
 // Shallow irregular wet patches pick up the sky without behaving like mirrors.
 const puddle=keep(new T.MeshStandardMaterial({color:0x444c49,metalness:0,roughness:.32,transparent:true,opacity:.24,depthWrite:false}));
 for(const [x,z,sx,sz]of [[-5,12,1.3,.6],[5,1,1.7,.65],[-3,-11,1.4,.5]]){const shape=new T.Shape();for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=.8+random()*.2;const px=Math.cos(a)*r,pz=Math.sin(a)*r;i?shape.lineTo(px,pz):shape.moveTo(px,pz)}shape.closePath();const m=new T.Mesh(keep(new T.ShapeGeometry(shape)),puddle);m.rotation.x=-Math.PI/2;m.scale.set(sx,sz,1);m.position.set(x,.013,z);group.add(m);reflections.push(m)}
 // A distant factory district adds depth beyond the playable courtyard.
 const district=new T.Group();group.add(district);
 for(let i=0;i<14;i++){
  const x=(i%2?1:-1)*(23+Math.floor(i/2)*9),z=-50-Math.floor(i/2)*21,h=12+(i%4)*4;
  const mass=box(x,h/2,z,12,h,16,brick);district.attach(mass);
  const cap=box(x,h+.18,z,12.5,.36,16.5,roof);district.attach(cap);
  for(let j=0;j<4;j++)for(let floor=1;floor<h/3;floor++){const center=x-4.5+j*3;const wall=kit('wall_window_tall_large_01',center,floor*3,z+8.04);const window=kit('window_tall_large_01',center,floor*3,z+8.04);district.attach(wall);district.attach(window)}
  if(i%3===0){const chimney=pipe(x+2,h+6,z,1,12,rust);district.attach(chimney)}
 }
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
 updateNavigation(spawn);group.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial)m.envMapIntensity=.4});
 return{group,reflections,obstacles,bounds,spawn,spawnPoints:spawnPoints.filter(p=>clear(p.x,p.z)&&distance[index(p.x,p.z)]>=0),name:'ساحة العزل · المرحلة التجريبية',sky:0xa6b0ae,kind:'prototype',clear,updateNavigation,direction,background:library.hdr,lighting:library.lighting,dispose(){resources.forEach(r=>r.dispose())}};
}
