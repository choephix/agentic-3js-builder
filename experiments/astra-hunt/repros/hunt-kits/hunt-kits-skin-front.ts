import { Vector3 } from 'three';
import { pixelTexture, skinFaces, skinBox } from '../../../../kits/pixel';
const faces=skinFaces(10,20,[8,8,4]);
const sheet=pixelTexture(40,40,()=>{});
const geo=skinBox(sheet,faces,0.01); const p=geo.getAttribute('position'), uv=geo.getAttribute('uv');
for (const f of [4,5]) {
  console.log(f===4?'pz (+z front)':'nz (-z back)');
  for (let i=0;i<4;i++) { const k=f*4+i; console.log({x:p.getX(k),y:p.getY(k),z:p.getZ(k),u:uv.getX(k)*40,v:1-uv.getY(k)*40}); }
}
