```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { frame } from "agentic-3js-builder";
import { rng } from "agentic-3js-builder";
import { catmull } from "agentic-3js-builder";
import { mottle, noise, paint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Floating Sky Island",
  description:
    "A floating island of grass and layered rock with a ruined arch and pillars, a glowing rune altar, a waterfall pouring off the edge, trees, crystals and drifting petals.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "skyIsland", paintSize: 1024 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);
  const TOP = 1.4;

  const GRASS = cel(mottle("#86dc58", "#b0f070", { size: 0.2, seed: 3 }));
  const ROCK = cel(
    paint((p) => {
      const l = Math.floor(p.y / 0.12);
      return ["#a99dc0", "#9488b0", "#b9aed0"][((l % 3) + 3) % 3] + "";
    }),
  );
  const ROCK_D = cel("#7d7399", "#564e78");
  const RUIN = cel("#e6dcc8", "#a99fb8");
  const MOSS = cel("#6cc060", "#3a8a5a");
  const GOLD = cel("#f6c552", "#b9742c");
  const TEAL = cel("#4fe6c8", "#2a86b4");
  const BARK = cel("#7a5160", "#4a3040");
  const LEAF_A = cel("#ffb4d4", "#e080b0");
  const LEAF_B = cel("#6fd070", "#38905a");
  const WATER = cel("#7fdcf4", "#3aa0d8");
  const FOAM = cel("#ffffff", "#c6d8f0");
  const CLOUD = cel("#ffffff", "#c9d2f4");

  const bins = new Map<unknown, THREE.BufferGeometry[]>();
  const put = (m: unknown, g: THREE.BufferGeometry, p: V, o: { ry?: number; rz?: number; s?: V } = {}) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, (o.ry ?? 0) * Math.PI / 180, (o.rz ?? 0) * Math.PI / 180));
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), q, new THREE.Vector3(...(o.s ?? [1, 1, 1]))));
    const n = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(n.attributes)) if (!["position", "normal", "uv"].includes(k)) n.deleteAttribute(k);
    const l = bins.get(m);
    if (l) l.push(n);
    else bins.set(m, [n]);
  };
  const lit = new Map<string, THREE.BufferGeometry[]>();
  const lamp = (c: string, g: THREE.BufferGeometry, p: V, o: { s?: V } = {}) => {
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion(), new THREE.Vector3(...(o.s ?? [1, 1, 1]))));
    const n = g.toNonIndexed();
    for (const k of Object.keys(n.attributes)) if (!["position", "normal", "uv"].includes(k)) n.deleteAttribute(k);
    const l = lit.get(c);
    if (l) l.push(n);
    else lit.set(c, [n]);
  };

  // island top disc
  const rim: OutlinePoint[] = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2;
    const r = 1.3 * (1 + 0.06 * Math.sin(a * 3) + 0.04 * Math.sin(a * 5 + 1));
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  b.extrude(rim, { at: [0, TOP - 0.08, 0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.1, color: GRASS, bone: base, bevel: 0.02 });
  // rock underside: stacked shrinking tapered layers
  const layers: [number, number, number][] = [
    [1.28, 1.0, 0.3],
    [1.0, 0.7, 0.3],
    [0.7, 0.4, 0.3],
    [0.42, 0.18, 0.3],
    [0.2, 0.05, 0.25],
  ];
  let y = TOP - 0.08;
  layers.forEach(([rt, rb, h], i) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, 9, 1);
    const pos = g.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const k = 1 + 0.12 * Math.sin(pos.getX(j) * 9 + pos.getZ(j) * 7 + i);
      pos.setXYZ(j, pos.getX(j) * k, pos.getY(j), pos.getZ(j) * k);
    }
    put(i % 2 ? ROCK_D : ROCK, g, [0, y - h / 2, 0], { ry: i * 20 });
    y -= h;
  });
  // hanging stalactite crystals
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3;
    lamp("#7ff3d8", new THREE.ConeGeometry(0.05, 0.3, 5), [Math.cos(a) * 0.3, y + 0.1, Math.sin(a) * 0.3]);
  }
  put(ROCK, new THREE.ConeGeometry(0.1, 0.4, 5), [0, y - 0.15, 0], { rz: 180 });

  // ruins: pillars, arch, steps
  const pillar = (x: number, z: number, h: number, br: boolean) => {
    put(RUIN, new THREE.CylinderGeometry(0.09, 0.1, h, 7), [x, TOP + h / 2 - 0.02, z]);
    put(RUIN, new THREE.BoxGeometry(0.26, 0.05, 0.26), [x, TOP + 0.005, z]);
    if (!br) put(RUIN, new THREE.BoxGeometry(0.26, 0.06, 0.26), [x, TOP + h + 0.01, z]);
    put(GOLD, new THREE.CylinderGeometry(0.095, 0.095, 0.02, 7), [x, TOP + h * 0.7, z]);
    put(MOSS, new THREE.SphereGeometry(0.09, 6, 4), [x + 0.03, TOP + 0.04, z + 0.05], { s: [1, 0.4, 1] });
  };
  pillar(-0.55, -0.25, 0.8, false);
  pillar(-0.05, -0.25, 0.8, false);
  pillar(-0.8, 0.3, 0.4, true);
  pillar(0.35, -0.5, 0.55, true);
  put(RUIN, new THREE.BoxGeometry(0.75, 0.09, 0.2), [-0.3, TOP + 0.86, -0.25]);
  put(GOLD, new THREE.BoxGeometry(0.77, 0.02, 0.22), [-0.3, TOP + 0.915, -0.25]);
  put(RUIN, new THREE.BoxGeometry(0.28, 0.08, 0.2), [-0.3, TOP + 0.95, -0.25], { ry: 4 });
  for (let i = 0; i < 3; i++) put(RUIN, new THREE.BoxGeometry(0.7 - i * 0.12, 0.04, 0.2), [-0.3, TOP + 0.02 * i, 0.05 + i * 0.0 + (2 - i) * 0.12]);
  // altar with glowing rune
  put(RUIN, new THREE.CylinderGeometry(0.2, 0.24, 0.12, 8), [0.1, TOP + 0.04, 0.35]);
  lamp("#7ff3d8", new THREE.OctahedronGeometry(0.1), [0.1, TOP + 0.34, 0.35], { s: [1, 1.5, 1] });
  const RUNE = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="none" stroke="#7ff3d8" stroke-width="3"/><path d="M32 8L32 56M12 22L52 42M52 22L12 42" stroke="#7ff3d8" stroke-width="3" fill="none"/><circle cx="32" cy="32" r="9" fill="none" stroke="#f6c552" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  glow(b.part(new THREE.CircleGeometry(0.17, 20), "#ffffff", { bone: base, at: [0.1, TOP + 0.105, 0.35], dir: [0, 1, 0], axis: "z", texture: RUNE }), 1.2);

  // trees
  const tree = (x: number, z: number, h: number, m: typeof LEAF_A) => {
    put(BARK, new THREE.CylinderGeometry(0.04, 0.065, h, 6), [x, TOP + h / 2 - 0.03, z]);
    for (const [dx, dy, dz, r] of [[0, 0.1, 0, 0.3], [0.17, -0.03, 0.06, 0.2], [-0.15, 0, -0.08, 0.22], [0.02, 0.28, 0.02, 0.2]] as number[][])
      put(m, new THREE.IcosahedronGeometry(r, 1), [x + dx, TOP + h + dy, z + dz], { s: [1, 0.85, 1] });
  };
  tree(0.75, 0.05, 0.6, LEAF_A);
  tree(0.55, 0.75, 0.45, LEAF_B);
  tree(-0.95, -0.55, 0.5, LEAF_A);
  tree(-0.3, 0.8, 0.35, LEAF_B);

  // waterfall off the +X edge
  const wx = 1.27;
  put(WATER, new THREE.BoxGeometry(0.5, 0.03, 0.2), [wx - 0.25, TOP - 0.02, -0.05]);
  put(WATER, new THREE.BoxGeometry(0.05, 1.1, 0.2), [wx + 0.04, TOP - 0.55, -0.05]);
  for (let i = 0; i < 6; i++) put(FOAM, new THREE.IcosahedronGeometry(0.06, 0), [wx + 0.04, TOP - 1.1 - i * 0.05, -0.05 + (i % 2) * 0.05], { s: [1, 0.7, 1] });
  // stream pond
  put(WATER, new THREE.CylinderGeometry(0.22, 0.22, 0.03, 10), [0.9, TOP - 0.02, -0.05]);

  // rocks, crystals
  for (let i = 0; i < 6; i++) {
    const a = R() * 6.28;
    const r = 0.5 + R() * 0.7;
    put(ROCK_D, new THREE.IcosahedronGeometry(0.06 + R() * 0.05, 0), [Math.cos(a) * r, TOP + 0.02, Math.sin(a) * r]);
  }
  for (const [x, z] of [[-1.0, 0.1], [-0.6, 0.65], [0.9, -0.7]] as [number, number][])
    for (let k = 0; k < 3; k++) lamp("#7ff3d8", new THREE.ConeGeometry(0.035, 0.16 + k * 0.05, 5), [x + k * 0.05, TOP + 0.08 + k * 0.025, z + k * 0.03]);

  // clouds
  for (const [x, yy, z] of [[-1.5, 0.3, 0.5], [1.5, 0.1, -0.6], [0.3, -0.4, 1.4]] as V[])
    for (const [dx, r] of [[0, 0.16], [0.17, 0.12], [-0.17, 0.12]]) put(CLOUD, new THREE.IcosahedronGeometry(r, 1), [x + dx, yy, z], { s: [1, 0.6, 0.9] });

  for (const [m, l] of bins) {
    const g = mergeGeometries(l);
    if (g) b.part(g, m as never, { bone: base, at: [0, 0, 0], flat: true });
  }
  for (const [c, l] of lit) {
    const g = mergeGeometries(l);
    if (g) glow(b.part(g, c, { bone: base, at: [0, 0, 0], flat: true }), 1.2);
  }

  // grass tufts and petals
  const TUFT = svg(`<svg viewBox="0 0 32 32"><path d="M4 32L8 4L14 32Z" fill="#5cc04a"/><path d="M12 32L18 0L22 32Z" fill="#86e060"/><path d="M20 32L28 8L28 32Z" fill="#48a83e"/></svg>`, { size: 64 });
  const PETAL = svg(`<svg viewBox="0 0 24 32"><path d="M12 31C2 24 0 12 6 2L12 8L18 2C24 12 22 24 12 31Z" fill="#ffc0dc"/></svg>`, { size: 64 });
  const tf: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 60; i++) {
    const a = R() * 6.28;
    const r = Math.sqrt(R()) * 1.15;
    tf.push(frame([Math.cos(a) * r, TOP - 0.02, Math.sin(a) * r], [0, 1, 0]));
  }
  b.cards(tf, TUFT, { size: [0.06, 0.07], cross: true, vary: 0.3, rng: R, bone: base });
  const pf: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 24; i++) pf.push(frame([(R() - 0.5) * 3, TOP + 0.2 + R() * 1.3, (R() - 0.5) * 3], [0, 1, 0]));
  glow(b.cards(pf, PETAL, { size: 0.06, lean: 60, flow: [1, -0.3, 0.4], vary: 0.3, rng: R, bone: base, sink: 0 }), 1);

  return b.root;
}
```