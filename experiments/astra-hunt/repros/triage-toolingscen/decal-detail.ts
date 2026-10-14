import * as THREE from "three";
const mod = await import(`../../samples/${process.argv[2] ?? "bisonBull"}.ts`);
const root = await mod.default(); root.updateMatrixWorld(true);
root.traverse((node: THREE.Object3D) => {
  if (!(node as THREE.Mesh).isMesh || !node.name.startsWith("decal")) return;
  const mesh = node as THREE.Mesh; const pos = mesh.geometry.getAttribute("position"); const idx = mesh.geometry.index;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), cr = new THREE.Vector3();
  const out: unknown[] = [];
  for (let i=0; i<(idx?idx.count:pos.count); i+=3) {
    const ia=idx?idx.getX(i):i, ib=idx?idx.getX(i+1):i+1, ic=idx?idx.getX(i+2):i+2;
    a.fromBufferAttribute(pos,ia); b.fromBufferAttribute(pos,ib); c.fromBufferAttribute(pos,ic);
    if (cr.subVectors(b,a).cross(c.sub(a)).length()<1e-10) out.push({i:i/3,a:a.toArray(),b:b.toArray(),c:c.toArray()});
  }
  if (out.length) console.log(mesh.name, out);
});
