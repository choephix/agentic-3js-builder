import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import * as THREE from "three";

const dir = resolve("samples");
const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"));
const out: string[] = [];
for (const file of files) {
  const slug = file.slice(0, -3);
  try {
    const mod = await import(join(dir, file));
    const root = typeof mod.default === "function" ? mod.default() : null;
    if (!root?.traverse) continue;
    let meshes = 0, tris = 0, deg = 0;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    root.traverse((obj: any) => {
      if (!obj.isMesh || !obj.geometry?.getAttribute("position")) return;
      meshes++;
      const pos = obj.geometry.getAttribute("position");
      const idx = obj.geometry.index;
      const count = idx ? idx.count : pos.count;
      tris += Math.floor(count / 3);
      for (let i = 0; i + 2 < count; i += 3) {
        const ia = idx ? idx.getX(i) : i, ib = idx ? idx.getX(i + 1) : i + 1, ic = idx ? idx.getX(i + 2) : i + 2;
        a.fromBufferAttribute(pos, ia); b.fromBufferAttribute(pos, ib); c.fromBufferAttribute(pos, ic);
        if (b.clone().sub(a).cross(c.clone().sub(a)).length() < 1e-10) deg++;
      }
    });
    if (deg) out.push(`${slug}\tmeshes=${meshes}\ttris=${tris}\tdeg=${deg}`);
  } catch (e) {
    out.push(`${slug}\tERROR\t${String(e).split("\n")[0]}`);
  }
}
console.log(out.join("\n"));
