import { BoxGeometry, Vector3 } from 'three';
import { pixelArt, pixelTexture, tileBox, skinFaces, skinBox, skinLayout, cellPaint, pick, bayer } from '../../../../kits/pixel';

const tile = pixelArt(['abcd','efgh','ijkl','mnop'], Object.fromEntries('abcdefghijklmnop'.split('').map((c,i)=>[c,`#${(i+1).toString(16).padStart(6,'0')}`])));
for (const [size, texel] of [[[0.04,0.04,0.04],0.01], [[0.05,0.03,0.04],0.01], [[0.09,0.09,0.09],0.01]] as const) {
 const g = tileBox(size, tile, texel, {rand:()=>0.5, step:[1,1]}); const uv=g.getAttribute('uv');
 console.log('tile', size, texel, [...Array(6)].map((_,f)=>[...Array(4)].map((_,i)=>[uv.getX(f*4+i),uv.getY(f*4+i)])));
}
const faces=skinFaces(0,0,[2,3,1]); console.log('faces',faces);
const sheet=pixelTexture(10,8,()=>{}); const sg=skinBox(sheet,faces,0.1); console.log('skin size',sg.parameters, [...Array(6)].map((_,f)=>[...Array(4)].map((_,i)=>[sg.getAttribute('uv').getX(f*4+i),sg.getAttribute('uv').getY(f*4+i)])));
console.log('pick',pick(['a','b','c'],0.25),pick(['a','b','c'],0.25, bayer(0,0)), pick(['a','b','c'],0.75,bayer(1,0)));
const cp=cellPaint(1,c=>{console.log('cell',c.at.toArray(),c.u,c.v,c.depth,c.axis,c.threshold,c.pick([0,1],0.51)); return '#fff'}); console.log('paint', cp.at(new Vector3(0.0,0,0),new Vector3(0,1,0)));
