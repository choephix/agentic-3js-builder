import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { polyline } from "../../../../src/path";

const b=createBuilder({name:"drapePose"}); const root=b.joint("root",{at:[0,0,0]});
const chain=b.chain("body",[[0,0,0],[0,1,0],[1,2,0]],{parent:root,count:3,names:["a","b","c"]});
const body=b.sweep(chain,.2,{color:"#999",name:"body"}); const skin=b.surface(body);
const rough=polyline([[0,.2,.22],[.8,1.8,.22]]); const d=skin.drape(rough,{lift:.01});
const strap=b.sweep(d,.035,{color:"#f00",name:"drapedStrap",caps:"flat"});
const strapMesh=strap.meshes[0]; const beforePath=d.at(.8).toArray();
const pos=strapMesh.geometry.getAttribute("position"); const beforeV=[pos.getX(pos.count-1),pos.getY(pos.count-1),pos.getZ(pos.count-1)];
const nearestEnd=skin.nearest(d.at(1));
console.log("drape path",{weights:d.weights?.map(([j,w])=>[j.name,+w.toFixed(4)]),at0:d.at(0).toArray(),at08:beforePath,at1:d.at(1).toArray(),endBone:nearestEnd.bone?.name,meshBones:strapMesh.userData.skinBones,skinWeights:strapMesh.geometry.getAttribute("skinWeight")?.count});
b.pose(chain.joints[2],{axis:[0,0,1],deg:70});
const afterPath=d.at(.8).toArray(); const pos2=strapMesh.geometry.getAttribute("position"); const afterV=[pos2.getX(pos2.count-1),pos2.getY(pos2.count-1),pos2.getZ(pos2.count-1)];
const nearestAfter=skin.nearest(afterPath);
console.log("drape after pose",{at08:afterPath,beforeV,afterV,nearestAfter:nearestAfter.at.toArray(),gap:nearestAfter.at.distanceTo(new THREE.Vector3(...afterPath))});
