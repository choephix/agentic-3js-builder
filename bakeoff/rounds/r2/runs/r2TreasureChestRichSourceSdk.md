```ts
import * as THREE from "three";
import { createBuilder, rng, svg, mottle, stripes, grain, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Pirate Treasure Chest",
  description:
    "Weathered plank chest with its lid thrown open, rusty iron straps and studs, a loose padlock, a skull-and-crossbones carving, and spilling gold coins, pearls, a jewelled goblet and gems.",
};

const flip = (g: THREE.BufferGeometry) => {
  const idx = g.index!;
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i + 1);
    const c = idx.getX(i + 2);
    idx.setX(i + 1, c);
    idx.setX(i + 2, a);
  }
  g.computeVertexNormals();
  return g;
};

// Half cylinder (arch) whose axis runs along X; y >= 0, z = r*cos.
const arch = (r: number, len: number, open: boolean, start = 0, span = Math.PI, seg = 8) =>
  new THREE.CylinderGeometry(r, r, len, seg, 1, open, start, span).rotateZ(Math.PI / 2);

const SKULL = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<g stroke="#140a04" stroke-width="7" stroke-linecap="round"><line x1="14" y1="62" x2="86" y2="93"/><line x1="86" y1="62" x2="14" y2="93"/></g>
<g fill="#140a04"><circle cx="11" cy="60" r="6"/><circle cx="17" cy="66" r="5"/><circle cx="89" cy="60" r="6"/><circle cx="83" cy="66" r="5"/>
<circle cx="11" cy="95" r="6"/><circle cx="17" cy="90" r="5"/><circle cx="89" cy="95" r="6"/><circle cx="83" cy="90" r="5"/></g>
<path fill="#140a04" fill-rule="evenodd" d="M50 6 C27 6 19 23 21 40 C22 48 28 52 31 55 L31 68 L69 68 L69 55 C72 52 78 48 79 40 C81 23 73 6 50 6 Z M29 38 a10 11 0 1 0 20 0 a10 11 0 1 0 -20 0 Z M51 38 a10 11 0 1 0 20 0 a10 11 0 1 0 -20 0 Z M50 48 l-5 10 h10 z M37 60 h4 v8 h-4 z M48 60 h4 v8 h-4 z M59 60 h4 v8 h-4 z"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "treasure_chest", paintSize: 2048 });
  const rand = rng(11);

  b.joint("chest", { at: [0, 0, 0] });
  b.joint("lid", { parent: "chest", at: [0, 0.4, -0.27], dir: [0, 0, 1], up: [0, 1, 0], role: "hinge" });
  b.joint("lock", { parent: "chest", at: [0, 0.31, 0.292], dir: [0, -1, 0] });

  // ---------- paints ----------
  const wood = (grainAxis: "x" | "z", stripeAxis: "y" | "z", seed: number) =>
    stripes(
      grain("#52331c", "#2b1a0d", { size: 0.02, axis: grainAxis, seed }),
      "#150b04",
      { size: 0.09, axis: stripeAxis, width: 0.07, wobble: 0.04, seed },
    );
  const rust = mottle("#45454a", "#7a3f20", { size: 0.035, seed: 5, contrast: 1.6 });
  const goldPaint = mottle("#f0b81c", "#a8700c", { size: 0.025, seed: 9, contrast: 1.3 });
  const lining = mottle("#7a1c1c", "#4a0f12", { size: 0.06, seed: 2 });

  const box = (
    w: number, h: number, d: number, at: number[], color: any, bone = "chest", rotation?: number[],
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, rotation });

  // ---------- body ----------
  box(0.94, 0.03, 0.58, [0, 0.015, 0], "#2a1a0e");
  box(0.82, 0.05, 0.46, [0, 0.025, 0], wood("x", "z", 1));
  const front = box(0.9, 0.4, 0.04, [0, 0.2, 0.25], wood("x", "y", 2));
  box(0.9, 0.4, 0.04, [0, 0.2, -0.25], wood("x", "y", 3));
  box(0.04, 0.4, 0.46, [0.43, 0.2, 0], wood("z", "y", 4));
  box(0.04, 0.4, 0.46, [-0.43, 0.2, 0], wood("z", "y", 5));

  // iron: corners, bands, straps
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.07, 0.4, 0.07, [sx * 0.43, 0.2, sz * 0.25], rust);
  box(0.94, 0.05, 0.012, [0, 0.06, 0.276], rust);
  box(0.94, 0.05, 0.012, [0, 0.06, -0.276], rust);
  for (const sx of [-1, 1]) {
    box(0.012, 0.05, 0.56, [sx * 0.456, 0.06, 0], rust);
    box(0.012, 0.05, 0.56, [sx * 0.456, 0.35, 0], rust);
  }
  const stud = new THREE.SphereGeometry(0.014, 6, 4);
  for (const sx of [-0.3, 0.3]) {
    box(0.07, 0.4, 0.016, [sx, 0.2, 0.278], rust);
    for (const y of [0.12, 0.22, 0.32]) b.part(stud, "#3b3b40", { at: [sx, y, 0.287], bone: "chest" });
  }
  for (const sx of [-1, 1])
    for (const y of [0.06, 0.2, 0.35]) b.part(stud, "#3b3b40", { at: [sx * 0.463, y, 0.2], bone: "chest" });

  // hinges
  for (const sx of [-0.3, 0.3])
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 8).rotateZ(Math.PI / 2), "#3b3b40", {
      at: [sx, 0.4, -0.275], bone: "chest",
    });

  // hasp plate, staple and padlock
  box(0.09, 0.11, 0.014, [0, 0.31, 0.277], rust);
  b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 10), "#5a5a60", { at: [0, 0.312, 0.292], bone: "chest" });
  b.part(new THREE.TorusGeometry(0.022, 0.005, 5, 10, Math.PI).rotateY(Math.PI / 2), "#a5a5ab", {
    at: [0, 0.286, 0.3], bone: "lock",
  });
  box(0.07, 0.075, 0.055, [0, 0.248, 0.3], "#8a6a2a", "lock");
  box(0.012, 0.025, 0.006, [0, 0.245, 0.329], "#1a1208", "lock");
  b.pose("lock", { axis: [1, 0, 0], deg: -14 });

  // skull and crossbones carving
  b.decal(front, svg(SKULL, { size: 256 }), {
    at: [-0.17, 0.2, 0.27], dir: [0, 0, 1], size: [0.17, 0.17], segments: 4, color: "#ffffff",
  });

  // ---------- lid (closed pose, then swung open) ----------
  b.part(arch(0.28, 0.9, false), wood("x", "z", 6), { at: [0, 0.4, 0], bone: "lid" });
  b.part(flip(arch(0.24, 0.82, true)), lining, { at: [0, 0.4, 0], bone: "lid" });
  for (const sx of [-1, 1]) {
    const disc = new THREE.CircleGeometry(0.28, 8, 0, Math.PI).rotateY((-sx * Math.PI) / 2);
    b.part(disc, "#2e1b0d", { at: [sx * 0.4, 0.4, 0], bone: "lid" });
  }
  for (const sz of [-1, 1]) box(0.82, 0.02, 0.04, [0, 0.4, sz * 0.26], "#2e1b0d", "lid");
  for (const sx of [-0.43, -0.3, 0.3, 0.43]) {
    b.part(arch(0.287, 0.07, true), rust, { at: [sx, 0.4, 0], bone: "lid" });
    for (const deg of [22, 56, 90, 124, 158]) {
      const a = (deg * Math.PI) / 180;
      b.part(stud, "#3b3b40", { at: [sx, 0.4 + 0.29 * Math.sin(a), 0.29 * Math.cos(a)], bone: "lid" });
    }
  }
  b.part(arch(0.289, 0.08, true, 0, 0.75, 6), rust, { at: [0, 0.4, 0], bone: "lid" });
  b.pose("lid", { axis: [1, 0, 0], deg: -110 });

  // ---------- treasure ----------
  const heapY = (x: number, z: number) =>
    0.33 + 0.15 * Math.sqrt(Math.max(0, 1 - (x / 0.39) ** 2 - (z / 0.21) ** 2));
  box(0.8, 0.28, 0.44, [0, 0.19, 0], "#b8860b");
  b.part(new THREE.SphereGeometry(0.3, 10, 6), goldPaint, { at: [0, 0.33, 0], scale: [1.3, 0.5, 0.7], bone: "chest" });

  const coinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10);
  const golds = ["#e8b923", "#d9a514", "#f3cc4a", "#c8921a"];
  const coin = (x: number, y: number, z: number, tilt = 40) =>
    b.part(coinGeo, golds[Math.floor(rand() * golds.length)], {
      at: [x, y, z], bone: "chest",
      rotation: [(rand() - 0.5) * 2 * tilt, rand() * 360, (rand() - 0.5) * 2 * tilt],
    });
  for (let i = 0; i < 55; i++) {
    let x = 0, z = 0;
    do {
      x = (rand() * 2 - 1) * 0.36;
      z = (rand() * 2 - 1) * 0.19;
    } while ((x / 0.39) ** 2 + (z / 0.21) ** 2 > 0.9);
    coin(x, heapY(x, z) + 0.008, z);
  }
  coin(-0.2, 0.407, 0.25, 8);
  coin(0.1, 0.409, 0.252, 12);

  // spilled gold in front
  b.part(new THREE.SphereGeometry(0.1, 8, 5), goldPaint, { at: [-0.05, 0.035, 0.38], scale: [1.4, 0.35, 0.9], bone: "chest" });
  for (let i = 0; i < 22; i++) {
    const x = -0.5 + rand() * 0.75;
    const z = 0.33 + rand() * 0.38;
    const e = ((x + 0.05) / 0.14) ** 2 + ((z - 0.38) / 0.09) ** 2;
    const y = e < 1 ? 0.035 + 0.035 * Math.sqrt(1 - e) + 0.004 : 0.004;
    coin(x, y, z, e < 1 ? 30 : 4);
  }
  for (let k = 0; k < 6; k++) b.part(coinGeo, golds[k % 4], { at: [0.52, 0.004 + k * 0.0065, 0.42], bone: "chest", rotation: [0, k * 25, 0] });
  for (let k = 0; k < 4; k++) b.part(coinGeo, golds[k % 4], { at: [-0.5, 0.004 + k * 0.0065, 0.5], bone: "chest", rotation: [0, k * 40, 0] });

  // gems
  const gem = new THREE.OctahedronGeometry(0.025, 0);
  const gemSpots: Array<[number, number, string]> = [
    [-0.32, 0.05, "#c0182b"], [0.3, -0.04, "#1fae5a"], [0.1, -0.12, "#c0182b"],
    [0.06, 0.12, "#1fae5a"], [0.22, 0.08, "#d42036"], [-0.28, -0.11, "#2bbf6a"], [0.34, 0.08, "#c0182b"],
  ];
  for (const [x, z, c] of gemSpots)
    b.part(gem, c, {
      at: [x, heapY(x, z) + 0.012, z], bone: "chest", flat: true,
      rotation: [rand() * 60, rand() * 360, rand() * 60], scale: [1, 1.3, 1],
    });
  b.part(gem, "#c0182b", { at: [0.4, 0.02, 0.58], bone: "chest", flat: true, scale: [1, 0.9, 1] });
  b.part(gem, "#1fae5a", { at: [-0.3, 0.02, 0.62], bone: "chest", flat: true, rotation: [0, 30, 0] });

  // pearl necklace
  const path = catmull([
    [0.02, 0.475, -0.12], [0.1, 0.485, 0.0], [0.17, 0.465, 0.1], [0.2, 0.44, 0.17],
    [0.23, 0.418, 0.25], [0.24, 0.412, 0.275], [0.24, 0.36, 0.3], [0.23, 0.25, 0.31],
    [0.26, 0.13, 0.35], [0.3, 0.03, 0.42], [0.38, 0.016, 0.5],
  ]);
  const pearl = new THREE.SphereGeometry(0.015, 8, 6);
  for (let i = 0; i < 28; i++)
    b.part(pearl, i % 7 === 3 ? "#e8dcc8" : "#f4eee2", { at: path.at(i / 27), bone: "chest" });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.02), "#d9a514", { at: path.at(1), bone: "chest" });

  // jewelled goblet
  const goblet = b.lathe(
    [[0, 0], [0.04, 0], [0.04, 0.008], [0.012, 0.02], [0.01, 0.06], [0.03, 0.08], [0.05, 0.11],
     [0.055, 0.15], [0.047, 0.15], [0.042, 0.11], [0, 0.09]],
    { at: [-0.14, 0.455, -0.02], axis: [0.45, 0.88, 0.12], color: "#d9a514", segments: 10, bone: "chest" },
  );
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    b.part(new THREE.OctahedronGeometry(0.009, 0), k % 2 ? "#1fae5a" : "#c0182b", {
      at: goblet.local([0.053 * Math.sin(a), 0.12, 0.053 * Math.cos(a)]), bone: "chest", flat: true,
    });
  }

  return b.root;
}
```