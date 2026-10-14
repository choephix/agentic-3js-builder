import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { spots } from "../../../../src/paint";
const b=createBuilder({name:"spots-rgb",paintSize:512});
b.joint("root",{at:[0,0,0]});
b.sweep([[0,0,0],[0,0,1]],0.25,{caps:"none",color:spots("#ffffff", [1,0,0], {size:0.1,amount:1})});
const root=b.root;
const meshes:THREE.Mesh[]=[];
root.traverse(x=>{if(x instanceof THREE.Mesh) meshes.push(x);});
const tex=(meshes[0].material as THREE.MeshStandardMaterial).map as THREE.DataTexture;
const data=tex.image.data as Uint8Array;
let black=0,white=0,red=0,other=0,total=0;
for(let i=0;i<data.length;i+=4){total++; const [r,g,b]=[data[i],data[i+1],data[i+2]]; if(r===0&&g===0&&b===0)black++; else if(r===255&&g===255&&b===255)white++; else if(r>240&&g<20&&b<20)red++; else other++;}
console.log({meshes:meshes.length,total,black,white,red,other,width:tex.image.width,height:tex.image.height});
