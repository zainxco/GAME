import * as T from 'three';
export function addGunAttachments(model,group,gun){const receiver=model.getObjectByName('AKM_model')||model.getObjectByName('Glock19');if(!receiver)return;group.updateWorldMatrix(true,true);group.updateMatrixWorld(true);model.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update()});const bb=new T.Box3().setFromObject(receiver,true).applyMatrix4(group.matrixWorld.clone().invert()),c=bb.getCenter(new T.Vector3());const steel=new T.MeshStandardMaterial({color:0x28313a,metalness:.65,roughness:.37}),glass=new T.MeshStandardMaterial({color:0x398fa5,metalness:.4,roughness:.12});function mount(geometry,mat,x,y,z,rotation=0){const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.rotation.x=rotation;mesh.frustumCulled=false;group.add(mesh);mesh.updateWorldMatrix(true,false);(model.getObjectByName('Root')||receiver).attach(mesh);return mesh}
if(gun.mod==='silencer')mount(new T.CylinderGeometry(.023,.025,.19,20),steel,c.x,bb.max.y-.025,bb.min.z-.08,Math.PI/2);
if(gun.type==='قناص'||gun.mod==='optic'){const r=gun.type==='قناص'?.037:.026,len=gun.type==='قناص'?.23:.1;mount(new T.BoxGeometry(.035,.12,.14),steel,c.x,bb.max.y-.015,c.z);mount(new T.CylinderGeometry(r,r,len,20),steel,c.x,bb.max.y+.059,c.z,Math.PI/2);mount(new T.CircleGeometry(r*.82,20),glass,c.x,bb.max.y+.059,c.z+len/2+.001)}
if(gun.mod==='drum'){const drum=mount(new T.CylinderGeometry(.095,.095,.07,24),steel,c.x,bb.min.y+.11,c.z+.08,Math.PI/2);model.getObjectByName('Magazine')?.attach(drum);mount(new T.BoxGeometry(.025,.16,.025),steel,c.x-.06,bb.min.y+.06,bb.min.z+.06);mount(new T.BoxGeometry(.025,.16,.025),steel,c.x+.06,bb.min.y+.06,bb.min.z+.06)}
if(gun.type==='شوزن')mount(new T.CylinderGeometry(.028,.028,.24,20),steel,c.x,bb.max.y-.09,bb.min.z+.1,Math.PI/2);
}




