import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import * as THREE from "three";
const dir = resolve("samples");
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
  const slug = file.slice(0, -3);
  try {
    const mod = await import(join(dir, file));
    const root = typeof mod.default === "function" ? mod.default() : null;
    if (!root?.traverse) continue;
    const by = new Map<string, number>();
    root.traverse((obj: THREE.Object3D) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
      const pos = mesh.geometry.getAttribute("position"); const idx = mesh.geometry.index;
      const n = idx ? idx.count : pos.count;
      let d = 0; const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
      for (let i = 0; i + 2 < n; i += 3) { const ia=idx?idx.getX(i):i, ib=idx?idx.getX(i+1):i+1, ic=idx?idx.getX(i+2):i+2; a.fromBufferAttribute(pos,ia); b.fromBufferAttribute(pos,ib); c.fromBufferAttribute(pos,ic); if (b.clone().sub(a).cross(c.clone().sub(a)).length()<1e-10) d++; }
      if (d) { const kind = String(mesh.userData.kind ?? mesh.geometry.type); by.set(kind, (by.get(kind) ?? 0) + d); }
    });
    if (by.size) console.log(slug, [...by].map(([k,v])=>`${k}=${v}`).join(" "));
  } catch { }
}
