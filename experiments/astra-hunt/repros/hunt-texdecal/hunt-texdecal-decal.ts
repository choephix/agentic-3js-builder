import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { svg } from '../../../../src/texture';
import { buildAtlas } from '../../../../harness/atlas';

function worldVertices(mesh: THREE.Mesh) {
  const p = mesh.geometry.getAttribute('position');
  return Array.from({length:p.count}, (_,i)=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld));
}
function triAreas(mesh: THREE.Mesh) {
  const p=worldVertices(mesh), idx=mesh.geometry.index!; const out:number[]=[];
  for(let k=0;k<idx.count;k+=3){ const a=p[idx.getX(k)],b=p[idx.getX(k+1)],c=p[idx.getX(k+2)]; out.push(b.clone().sub(a).cross(c.clone().sub(a)).length()/2); }
  return out;
}
function distToPlane(p:THREE.Vector3, n:THREE.Vector3, d:number){ return p.dot(n)-d; }

// 1) A slanted finite plane: `at` can be offset along its normal and still projects.
{
  const b=createBuilder({name:'slant'}); b.joint('root',{at:[0,0,0]});
  const n=new THREE.Vector3(1,0,1).normalize();
  const plane=b.part(new THREE.PlaneGeometry(1,1), '#888888', {at:[0,0,0], dir:n, axis:'z'});
  const d=b.decal(plane, new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1), {at:n.clone().multiplyScalar(.25), dir:n, size:[.6,.6], segments:[3,3]});
  b.root.updateMatrixWorld(true);
  const pts=worldVertices(d.mesh); const ds=pts.map(p=>distToPlane(p,n,0));
  console.log('slanted-offset', { min:Math.min(...ds), max:Math.max(...ds), vertices:pts.length });
}

// 2) A decal partly beyond a square edge: ray misses use nearest(), collapsing rows to edge.
{
  const b=createBuilder({name:'miss'}); b.joint('root',{at:[0,0,0]});
  const plane=b.part(new THREE.PlaneGeometry(.5,.5), '#888888', {at:[0,0,0], dir:[0,0,1], axis:'z'});
  const d=b.decal(plane, new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1), {at:[.24,0,0], dir:[0,0,1], size:[.5,.4], segments:[4,2]});
  b.root.updateMatrixWorld(true);
  const p=worldVertices(d.mesh), idx=d.mesh.geometry.index!; const areas=triAreas(d.mesh);
  console.log('ray-miss', {vertices:p.length, x:p.map(v=>+v.x.toFixed(4)), minTriangleArea:Math.min(...areas), maxTriangleArea:Math.max(...areas), triangles:areas.length});
}

// 3) Decal across a convex box edge. Grid triangles connect front and side hits across the silhouette.
{
  const b=createBuilder({name:'edge'}); b.joint('root',{at:[0,0,0]});
  const box=b.part(new THREE.BoxGeometry(1,1,1), '#888888', {at:[0,0,0]});
  const dir=new THREE.Vector3(1,0,1).normalize();
  const d=b.decal(box, new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1), {at:dir.clone().multiplyScalar(.5), dir, size:[.7,.5], segments:[4,2]});
  b.root.updateMatrixWorld(true);
  const p=worldVertices(d.mesh), idx=d.mesh.geometry.index!;
  const tris=[]; for(let k=0;k<idx.count;k+=3){ const a=p[idx.getX(k)],bb=p[idx.getX(k+1)],c=p[idx.getX(k+2)]; const mid=a.clone().add(bb).add(c).multiplyScalar(1/3); tris.push({area:+(bb.clone().sub(a).cross(c.clone().sub(a)).length()/2).toFixed(6), radius:+Math.hypot(mid.x,mid.z).toFixed(4), y:+mid.y.toFixed(4)}); }
  console.log('convex-edge', {vertices:p.length, triangles:tris});
}

// 4) New svg() object per helper call vs one reused object. Atlas pixel de-dupe remains one packed tile only for exact bytes,
// but assembly source records retain distinct UUIDs/texture entries.
{
  const markup='<svg viewBox="0 0 4 4"><rect width="4" height="4" fill="#777"/></svg>';
  const a=svg(markup,{size:16}), c=svg(markup,{size:16});
  console.log('svg-identity', {same:a===c, uuidA:a.uuid, uuidB:c.uuid, colouredA:a.userData.coloured, colouredB:c.userData.coloured});
  const atlas=await buildAtlas([], [{key:'a',texture:a,tint:'#ffffff'},{key:'b',texture:c,tint:'#ffffff'}]);
  console.log('atlas-duplicate', {packed:atlas.packed, tileA:atlas.tiles.get('a'), tileB:atlas.tiles.get('b')});
}

// 5) Warm-grey is treated as grey by the >.03 channel-difference test, so tint is suppressed.
for (const fill of ['#808080','#888888','#8a8888','#908080','#ff0000']) {
  const t=svg(`<svg viewBox="0 0 1 1"><rect width="1" height="1" fill="${fill}"/></svg>`,{size:8});
  console.log('colour-detect',fill,Boolean(t.userData.coloured));
}
