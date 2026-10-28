```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, mottle, stripes, grain, paint, svg, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description: "Low-poly whimsical oasis: pond, palms, striped tents, campfire and camels on a sand island.",
};

const SAND = "#e8c27a", SAND2 = "#d6a85c", GRASS = "#6fae4a", GRASS2 = "#4f8f3a", WATER = "#35c4c8", BARK = "#8a5a32";
const CAMEL = "#c58f4e", CAMEL_D = "#8a5c2c", CLOTH = "#d8483c", CLOTH2 = "#2d7fb8", CREAM = "#fff0cc", STONE = "#9a8a7a";

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const GY = 0.25;
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const P = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: root, at, ...o });
  const flat = { flat: true };

  // ---- ground
  const sandPaint = mottle(SAND, SAND2, { size: 0.5, seed: 3 });
  b.lathe([[0, 0], [4.1, 0], [4.3, 0.12], [4.0, GY], [0, GY]], {
    at: [0, 0, 0], bone: root, segments: 14, color: sandPaint, name: "island",
  });
  // dunes
  for (const [x, z, s, h] of [[-2.9, -2.6, 1.1, 0.55], [3.0, -2.8, 1.3, 0.7], [-3.3, 1.6, 0.9, 0.4], [3.4, 2.0, 0.8, 0.35], [0, -3.5, 1.2, 0.5]]) {
    P(new THREE.SphereGeometry(1, 8, 5), sandPaint, [x, GY - 0.05, z], { scale: [s * 1.3, h, s], ...flat });
  }
  // grass ring around the pond
  b.lathe([[0, 0], [1.75, 0], [1.75, 0.04], [1.5, 0.07], [0, 0.07]], {
    at: [0, GY, 0.3], bone: root, segments: 12, color: mottle(GRASS, GRASS2, { size: 0.3, seed: 5 }),
  });
  // water
  P(new THREE.CylinderGeometry(1.25, 1.25, 0.05, 14), WATER, [0, GY + 0.07, 0.3], { scale: [1, 1, 0.8] });
  glow(P(new THREE.CylinderGeometry(0.7, 0.7, 0.01, 12), "#8fe8e0", [0.2, GY + 0.1, 0.35], { scale: [1, 1, 0.7] }), 0.5);
  // pond rocks
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    P(new THREE.DodecahedronGeometry(0.12 + R() * 0.07, 0), STONE, [Math.sin(a) * 1.35, GY + 0.1, 0.3 + Math.cos(a) * 1.1], { ...flat });
  }
  // grass tufts + reeds
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, r = 1.3 + R() * 0.35;
    P(new THREE.ConeGeometry(0.05, 0.3 + R() * 0.2, 4), GRASS2, [Math.sin(a) * r, GY + 0.2, 0.3 + Math.cos(a) * r * 0.85], { ...flat });
  }

  // ---- palms
  const palm = (x: number, z: number, h: number, lean: number, seed: number) => {
    const rr = rng(seed);
    const pts = [[0, 0, 0], [lean * 0.2, h * 0.35, 0], [lean * 0.6, h * 0.7, 0], [lean, h, 0]].map(
      (p) => [x + p[0], GY + p[1], z + p[2]],
    );
    b.sweep(catmull(pts), [0.11, 0.06], { bone: root, color: grain(BARK, "#5c3a1e", { size: 0.05 }), sides: 6, caps: "flat" });
    const top = pts[3];
    // trunk rings
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      P(new THREE.TorusGeometry(0.1 - t * 0.04, 0.012, 4, 8), "#6a4224", [x + lean * t * t * 0.9 + 0, GY + h * t * 0.98, z], { rotation: [90, 0, 0], ...flat });
    }
    const leaf: [number, number][] = [[0, 0], [0.3, 0.14], [0.75, 0.12], [1.15, -0.28], [0.75, -0.04], [0.3, -0.06]];
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr();
      b.extrude(leaf, {
        at: [top[0], top[1], top[2]], x: [Math.sin(a), 0.25, Math.cos(a)], y: [0, 1, 0],
        thickness: 0.02, color: i % 2 ? GRASS : GRASS2, bone: root,
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      P(new THREE.SphereGeometry(0.085, 6, 4), "#7a4a1c", [top[0] + Math.sin(a) * 0.1, top[1] - 0.1, top[2] + Math.cos(a) * 0.1]);
    }
  };
  palm(-1.5, -0.55, 2.2, -0.35, 1);
  palm(1.55, -0.3, 1.9, 0.3, 2);
  palm(-0.4, 1.55, 1.5, 0.25, 3);
  palm(1.2, 1.3, 1.2, -0.2, 4);

  // ---- tents
  const rugTex = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#b8352f"/><rect x="4" y="4" width="56" height="32" fill="none" stroke="#f4d28a" stroke-width="3"/><path d="M32 8 L50 20 L32 32 L14 20Z" fill="#2d7fb8" stroke="#f4d28a" stroke-width="2"/><circle cx="32" cy="20" r="4" fill="#f4d28a"/></svg>`, { size: 128 });
  const tent = (x: number, z: number, rotDeg: number, c1: string, c2: string) => {
    const cloth = paint((_p, _n, s) => (Math.floor(((s[1] % 360) + 360) % 360 / 45) % 2 ? c1 : c2));
    P(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 8), STONE, [x, GY + 0.02, z]);
    b.lathe([[0, 0], [1.0, 0], [1.0, 0.55], [0, 1.5]], {
      at: [x, GY, z], bone: root, segments: 8, color: cloth, name: "tent",
    });
    const rad = (rotDeg * Math.PI) / 180;
    const fx = Math.sin(rad), fz = Math.cos(rad);
    // door
    b.extrude([[-0.28, 0], [0.28, 0], [0.2, 0.7], [0, 0.95], [-0.2, 0.7]], {
      at: [x + fx * 0.98, GY + 0.01, z + fz * 0.98], x: [fz, 0, -fx], thickness: 0.05, color: "#3a2230", bone: root,
    });
    // pole + pennant
    P(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5), BARK, [x, GY + 1.6, z]);
    b.extrude([[0, 0], [0.4, -0.1], [0, -0.2]], { at: [x, GY + 1.82, z], x: [0, 0, 1], thickness: 0.015, color: CLOTH, bone: root });
    P(new THREE.SphereGeometry(0.05, 6, 4), "#f4c84a", [x, GY + 1.87, z]);
    // rug
    P(new THREE.PlaneGeometry(0.9, 0.56), "#ffffff", [x + fx * 1.5, GY + 0.015, z + fz * 1.5], { dir: [0, 1, 0], axis: "z", texture: rugTex, rotation: [-90, rotDeg, 0] });
    // pegs
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      P(new THREE.CylinderGeometry(0.015, 0.02, 0.2, 4), BARK, [x + Math.sin(a) * 1.15, GY + 0.07, z + Math.cos(a) * 1.15]);
    }
  };
  tent(-2.5, -1.6, 30, CLOTH, CREAM);
  tent(2.6, -1.5, -35, CLOTH2, CREAM);

  // ---- campfire
  const fx = 0.2, fz = -2.3;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    P(new THREE.DodecahedronGeometry(0.09, 0), STONE, [fx + Math.sin(a) * 0.27, GY + 0.05, fz + Math.cos(a) * 0.27], { ...flat });
  }
  for (let i = 0; i < 3; i++) {
    P(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 5), BARK, [fx, GY + 0.1, fz], { rotation: [70, i * 60, 0] });
  }
  glow(P(new THREE.ConeGeometry(0.15, 0.4, 5), "#ff9a2a", [fx, GY + 0.28, fz], { ...flat }), 1.6);
  glow(P(new THREE.ConeGeometry(0.08, 0.28, 5), "#ffe066", [fx, GY + 0.26, fz], { ...flat }), 2);

  // crates & jars
  for (const [x, z, s] of [[-3.0, -0.3, 0.3], [-2.75, -0.05, 0.22], [3.1, 0.2, 0.28]]) {
    P(new THREE.BoxGeometry(s, s, s), "#a8743c", [x, GY + s / 2, z], { rotation: [0, x * 20, 0] });
  }
  b.lathe([[0, 0], [0.12, 0.02], [0.17, 0.15], [0.1, 0.3], [0.07, 0.38], [0.1, 0.4], [0, 0.4]], {
    at: [3.0, GY, 0.6], bone: root, segments: 8, color: "#c4623a",
  });

  // ---- camels
  let cid = 0;
  const camel = (px: number, pz: number, rotDeg: number, k: number) => {
    cid++;
    const a = (rotDeg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    const T = (x: number, y: number, z: number): [number, number, number] =>
      [px + (x * ca + z * sa) * k, GY + y * k, pz + (-x * sa + z * ca) * k];
    const rt: [number, number, number] = [0, 0, 0];
    void rt;
    const body = b.joint(`camel${cid}Body`, { parent: root, at: T(0, 1.15, 0), aim: T(0, 1.15, 0.5) });
    const neck1 = b.joint(`camel${cid}Neck1`, { parent: body, at: T(0, 1.3, 0.55), aim: T(0, 1.75, 0.85), role: "neck" });
    const neck2 = b.joint(`camel${cid}Neck2`, { parent: neck1, at: T(0, 1.75, 0.85), aim: T(0, 2.05, 1.0), role: "neck" });
    const head = b.joint(`camel${cid}Head`, { parent: neck2, at: T(0, 2.05, 1.0), aim: T(0, 2.0, 1.4), role: "head" });
    const jaw = b.joint(`camel${cid}Jaw`, { parent: head, at: T(0, 1.95, 1.2), aim: T(0, 1.9, 1.45), role: "jaw" });
    const tail = b.joint(`camel${cid}Tail`, { parent: body, at: T(0, 1.2, -0.7), aim: T(0, 0.8, -0.85), role: "tail" });
    const sc = (x: number, y: number, z: number): [number, number, number] => [x * k, y * k, z * k];
    const E = (g: THREE.BufferGeometry, col: any, at: number[], s: number[], bone: any) =>
      b.part(g, col, { bone, at, scale: sc(s[0], s[1], s[2]), rotation: [0, rotDeg, 0] });
    const fur = paint((p, n) => (n.y > 0.3 ? CAMEL : n.y < -0.3 ? "#b07c42" : CAMEL));
    const sph = new THREE.SphereGeometry(1, 8, 6);
    E(sph, fur, T(0, 1.15, 0), [0.38, 0.4, 0.8], body);
    E(sph, CAMEL, T(0, 1.55, 0.25), [0.26, 0.3, 0.26], body);
    E(sph, CAMEL, T(0, 1.55, -0.25), [0.26, 0.3, 0.26], body);
    // saddle blanket
    b.part(new THREE.BoxGeometry(0.85 * k, 0.07 * k, 0.5 * k), stripes(CLOTH, CREAM, { size: 0.08, axis: "x" }), { bone: body, at: T(0, 1.42, 0), rotation: [0, rotDeg, 0] });
    b.part(new THREE.BoxGeometry(0.86 * k, 0.2 * k, 0.12 * k), CLOTH2, { bone: body, at: T(0, 1.32, 0), rotation: [0, rotDeg, 0] });
    // neck
    b.sweep(catmull([T(0, 1.3, 0.55), T(0, 1.75, 0.85), T(0, 2.05, 1.0)]), [0.2 * k, 0.12 * k], { bone: [neck1, neck2] as any, color: CAMEL, sides: 6 });
    // head
    E(sph, CAMEL, T(0, 2.05, 1.1), [0.14, 0.15, 0.28], head);
    E(sph, CAMEL_D, T(0, 1.99, 1.38), [0.1, 0.09, 0.12], head);
    E(sph, CAMEL_D, T(0, 1.9, 1.3), [0.08, 0.04, 0.18], jaw);
    for (const s of [1, -1]) {
      E(sph, "#1a1010", T(s * 0.12, 2.12, 1.2), [0.03, 0.03, 0.03], head);
      E(sph, CAMEL_D, T(s * 0.13, 2.22, 1.0), [0.04, 0.09, 0.05], head);
    }
    // legs
    for (const sx of [1, -1])
      for (const sz of [0.5, -0.5]) {
        const hip = T(sx * 0.26, 1.0, sz), knee = T(sx * 0.27, 0.55, sz + (sz > 0 ? 0.04 : -0.05)), hoof = T(sx * 0.27, 0.06, sz);
        const j = b.joint(`camel${cid}Leg${sx > 0 ? "L" : "R"}${sz > 0 ? "F" : "B"}`, { parent: body, at: hip, aim: knee, role: "leg" });
        b.rod(hip, knee, [0.12 * k, 0.08 * k], CAMEL, { bone: j });
        b.rod(knee, hoof, [0.07 * k, 0.06 * k], CAMEL_D, { bone: j });
        b.part(new THREE.CylinderGeometry(0.09 * k, 0.1 * k, 0.07 * k, 6), "#4a3220", { bone: j, at: T(sx * 0.27, 0.035, sz) });
      }
    b.rod(T(0, 1.2, -0.7), T(0, 0.8, -0.85), [0.05 * k, 0.03 * k], CAMEL_D, { bone: tail });
    b.part(new THREE.SphereGeometry(0.06 * k, 5, 4), "#4a3220", { bone: tail, at: T(0, 0.78, -0.86) });
  };
  camel(1.9, 2.0, -40, 0.72);
  camel(-1.7, 2.3, 50, 0.62);
  camel(0.0, 2.9, 190, 0.5);

  void countershade;
  return b.root;
}
```