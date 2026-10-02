import { BoxGeometry } from 'three';
import { skinFaces, skinBox, pixelTexture } from '../../../../kits/pixel';
const fs=skinFaces(0,0,[2,3,1]); const sheet=pixelTexture(10,8,()=>{}); const g=skinBox(sheet,fs,.1); const pos=g.getAttribute('position'), uv=g.getAttribute('uv');
for(let f=0;f<6;f++){ console.log('face',f); for(let i=0;i<4;i++){const k=f*4+i;console.log(i,'p',[pos.getX(k),pos.getY(k),pos.getZ(k)],'uv',[uv.getX(k),uv.getY(k)]);} }
