import * as T from 'three';
import {clone} from './skeleton-utils.js';
export function detailedWeapon(template){
 const group=new T.Group(),model=clone(template.scene),framing=new T.Group();framing.add(model);group.add(framing);
 const mixer=new T.AnimationMixer(model),actions={};
 for(const [name,suffix]of Object.entries({Idle:'AK_Idle',Shoot:'AK_Shot',Reload:'AK_Reload'})){const clip=template.animations.find(c=>c.name.endsWith(suffix));if(!clip)throw new Error('Missing AK animation: '+suffix);const action=mixer.clipAction(clip);if(name!=='Idle'){action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true}actions[name]=action}
 actions.Idle.play();mixer.update(.05);model.updateMatrixWorld(true);
 const camera=model.getObjectByName('Camera'),position=camera.getWorldPosition(new T.Vector3()),quaternion=camera.getWorldQuaternion(new T.Quaternion());
 framing.quaternion.copy(quaternion).invert();framing.position.copy(position).applyQuaternion(framing.quaternion).negate();const align=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2);framing.quaternion.premultiply(align);framing.position.applyQuaternion(align).multiplyScalar(.5);framing.scale.setScalar(.5);
 model.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;const source=Array.isArray(o.material)?o.material:[o.material];const mats=source.map(m=>{const copy=m.clone();copy.envMapIntensity=.8;return copy});o.material=Array.isArray(o.material)?mats:mats[0]}});
 const muzzle=new T.Mesh(new T.SphereGeometry(.028,12,8),new T.MeshBasicMaterial({color:0xffd89a,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));muzzle.position.set(0,-.015,-1.06);muzzle.scale.z=2.5;group.add(muzzle);
 mixer.addEventListener('finished',()=>{for(const name of ['Shoot','Reload'])actions[name].fadeOut(.08);actions.Idle.reset().fadeIn(.08).play()});
 group.userData={model,mixer,actions,muzzle};return group;
}
