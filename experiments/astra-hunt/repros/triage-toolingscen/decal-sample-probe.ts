import * as THREE from "three";
const names = process.argv.slice(2).map((name) => name.replace(/\.ts$/, ""));
for (const name of names) {
  try {
    const mod = await import(`../../samples/${name}.ts`);
    const root = await mod.default();
    let decals = 0, zero = 0, tri = 0;
    const rows: string[] = [];
    root.updateMatrixWorld(true);
    root.traverse((node: THREE.Object3D) => {
      if (!(node as THREE.Mesh).isMesh || !node.name.startsWith("decal")) return;
      const mesh = node as THREE.Mesh;
      const pos = mesh.geometry.getAttribute("position");
      const idx = mesh.geometry.index;
      let z = 0, t = 0;
      const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
      const cross = new THREE.Vector3();
      for (let i = 0; i < (idx ? idx.count : pos.count); i += 3) {
        const ia = idx ? idx.getX(i) : i, ib = idx ? idx.getX(i + 1) : i + 1, ic = idx ? idx.getX(i + 2) : i + 2;
        a.fromBufferAttribute(pos, ia); b.fromBufferAttribute(pos, ib); c.fromBufferAttribute(pos, ic);
        const area2 = cross.subVectors(b, a).cross(c.clone().sub(a)).length();
        if (area2 < 1e-10) z++;
        t++;
      }
      decals++; zero += z; tri += t;
      rows.push(`${mesh.name}:${z}/${t}`);
    });
    if (zero) console.log(name, { decals, zero, tri, rows });
  } catch (error) {
    console.error("ERROR", name, error instanceof Error ? error.message : error);
  }
}
