```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, limb, countershade, scales, svg } from "agentic-3js-builder";
import { animeEye } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "High-fantasy anime qilin: scaled golden chimera with dragon head, jade antlers, cloud-and-flame mane, cloven hooves and a flaming tail.",
};

const GOLD = "#e9a93a";
const GOLD2 = "#ffd36b";
const CREAM = "#fff1d0";
const JADE = "#2fd6b0";
const TEAL = "#127f86";
const RED = "#d8433a";
const INK = "#2a1633";
const HORN = "#f2c15a";
const HOOF = "#4a2a3a";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const flameSvg = (root: string, mid: string, tip: string, line: string) =>
  svg(
    `<svg viewBox="0 0 40 100">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="${root}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${tip}"/></linearGradient></defs>
  <path d="M6 100 C2 66 16 34 34 2 C30 40 40 70 28 100 Z" fill="url(#g)" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M14 96 C12 70 20 46 30 14" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
    { size: 192 },
  );
const FLAME_G = flameSvg(TEAL, JADE, "#eafff6", "#0b4a55");
const FLAME_Y = flameSvg(RED, GOLD2, "#fff8dc", "#7a1f1f");
const SWIRL = svg(
  `<svg viewBox="0 0 100 100">
  <path d="M50 52 C50 44 60 44 60 52 C60 64 40 64 40 50 C40 34 66 34 66 54 C66 76 34 76 34 48" fill="none" stroke="#7a1f1f" stroke-width="9" stroke-linecap="round"/>
  <path d="M50 52 C50 44 60 44 60 52 C60 64 40 64 40 50 C40 34 66 34 66 54 C66 76 34 76 34 48" fill="none" stroke="${GOLD2}" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="34" cy="48" r="4" fill="${JADE}" stroke="#0b4a55" stroke-width="1.5"/>
  </svg>`,
  { size: 256 },
);
const EYE = animeEye({ iris: "#22d3b0", blush: false });

const COAT = countershade(
  scales(["#e6a93a", "#f0bc4c", "#d8962c"], "#a8561d", { size: 0.05, width: 0.14, seed: 3 }),
  scales([CREAM, "#ffe3a8"], "#d9b27a", { size: 0.05, seed: 4 }),
  { level: -0.25, soft: 0.3 },
);
const HEADP = countershade(
  scales(["#f0b844", "#e6a436"], "#a8561d", { size: 0.03, width: 0.15, seed: 8 }),
  "#ffe9b8",
  { level: -0.3 },
);

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const R = rng(11);

  // ---------- skeleton
  const hips = b.joint("hips", { at: [0, 1.2, -0.75], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.2, -0.75], [0, 1.22, -0.1], [0, 1.26, 0.62]]), {
    parent: hips,
    role: "spine",
    count: 3,
  });
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", catmull([[0, 1.26, 0.62], [0, 1.52, 0.82], [0, 1.85, 0.96]]), {
    parent: chest,
    role: "neck",
    names: ["neck1", "neck2"],
  });
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1).at, dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, down: 0.07 }),
    aim: head.local({ forward: 0.44, down: 0.075 }),
    role: "jaw",
  });
  const tail = b.chain("tail", catmull([[0, 1.22, -0.8], [0, 1.28, -1.1], [0, 1.2, -1.45], [0, 1.0, -1.75]]), {
    parent: hips,
    role: "tail",
    count: 4,
  });

  // ---------- body
  const body = b.sweep(spine, (t) => [0.24 + 0.04 * Math.sin(t * 3), 0.27 + 0.03 * t], {
    color: COAT,
    extend: [0.05, 0.05],
  });
  const neckS = b.sweep(neck, [0.19, 0.1], { color: COAT });
  const tailS = b.sweep(tail, [0.07, 0.03], { color: COAT });
  const sph = new THREE.SphereGeometry(1, 10, 8);
  for (const s of [1, -1]) {
    b.part(sph, COAT, { bone: hips, at: [s * 0.2, 1.1, -0.68], scale: [0.16, 0.27, 0.25] });
    b.part(sph, COAT, { bone: chest, at: [s * 0.2, 1.12, 0.52], scale: [0.14, 0.24, 0.22] });
  }

  // ---------- legs
  const legGeo = new THREE.CylinderGeometry(0.036, 0.046, 0.1, 6);
  const ringGeo = new THREE.TorusGeometry(0.058, 0.012, 5, 10);
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.55 : -0.7;
      const root = V(s * 0.2, 1.1, z);
      const foot = V(s * 0.2, 0.11, z + (front ? 0.03 : -0.05));
      const pts = limb(
        root,
        foot,
        front ? [0.42, 0.4, 0.3] : [0.45, 0.42, 0.3],
        front ? [[0, 0, -1], [0, 0, 1]] : [[0, 0, 1], [0, 0, -1]],
      );
      const nm = front
        ? [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hoofF${L}`]
        : [`hip${L}`, `knee${L}`, `hock${L}`, `hoofH${L}`];
      const leg = b.chain(`leg${front ? "F" : "H"}${L}`, pts, {
        parent: front ? chest : hips,
        names: nm,
        role: "leg",
        contact: [foot.x, 0, foot.z],
      });
      const sw = b.sweep(leg, front ? [0.095, 0.075, 0.05, 0.04, 0.036] : [0.1, 0.075, 0.045, 0.042, 0.036], {
        color: COAT,
      });
      legSweeps.push(sw);
      const tip = leg.tip!;
      for (const o of [-0.03, 0.03])
        b.part(legGeo, HOOF, { bone: tip, at: [foot.x + o, 0.049, foot.z + 0.012] });
      b.part(ringGeo, GOLD2, { bone: tip, at: [foot.x, 0.17, foot.z], rotation: [90, 0, 0] });
      const fl = [0, 120, 240].map((a) => sw.at(0.86, a));
      glow(
        b.cards(fl, FLAME_Y, { size: [0.06, 0.16], lean: 70, flow: [0, -1, -0.3], vary: 0.3, rng: R, cross: true }),
        0.4,
      );
      // elbow / knee tufts
      const el = [0, 90, 270].map((a) => sw.at(0.2, a));
      b.cards(el, FLAME_G, { size: [0.07, 0.2], lean: 60, bend: 25, flow: [0, -0.3, -1], vary: 0.3, rng: R });
    }
  }

  // ---------- head
  const skull = b.part(sph, HEADP, { bone: head, at: head.local({ forward: 0.08 }), scale: [0.12, 0.13, 0.17] });
  b.frustumBox(
    head.local({ forward: 0.15, up: -0.01 }),
    head.local({ forward: 0.46 }),
    [0.17, 0.13],
    [0.12, 0.09],
    { bone: head, color: HEADP },
  );
  b.part(sph, HEADP, { bone: head, at: head.local({ forward: 0.45, up: 0.015 }), scale: [0.065, 0.05, 0.05] });
  b.frustumBox(
    jaw.at,
    head.local({ forward: 0.44, down: 0.075 }),
    [0.13, 0.05],
    [0.1, 0.035],
    { bone: jaw, color: HEADP },
  );
  b.part(new THREE.BoxGeometry(0.09, 0.012, 0.22), "#8a2a3a", { bone: jaw, at: head.local({ forward: 0.28, down: 0.045 }) });
  const sk = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = sk.around(skull.at).at(s * 52, 6);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.075, 0.1], mirror: s > 0 });
    b.part(new THREE.SphereGeometry(1, 5, 4), INK, {
      bone: head,
      at: head.local({ left: s * 0.03, forward: 0.485, up: 0.02 }),
      scale: [0.012, 0.01, 0.012],
    });
    b.rod(head.local({ left: s * 0.06, up: 0.1, forward: 0.06 }), head.local({ left: s * 0.12, up: 0.09, forward: 0.2 }), 0.016, RED, { bone: head });
    for (const [x, f] of [[0.045, 0.38], [0.055, 0.3]])
      b.spike(head.local({ left: s * x, forward: f, down: 0.05 }), [0, -1, 0], 0.035, 0.01, { color: CREAM, bone: head });
    b.spike(jaw.local({ left: s * 0.04, forward: 0.22, up: 0.0 }), [0, 1, 0], 0.03, 0.009, { color: CREAM, bone: jaw });
    // ear
    b.extrude([[0, 0], [0.05, 0.03], [0.045, 0.13], [0, 0.22, "sharp"], [-0.04, 0.12], [-0.04, 0.03]], {
      at: head.local({ left: s * 0.1, up: 0.04, back: 0.05 }),
      x: [s, 0, 0],
      y: [s * 0.5, 0.8, -0.5],
      thickness: 0.014,
      smoothing: 1,
      color: GOLD,
      bone: head,
    });
    // whiskers
    b.sweep(
      bezier(
        head.local({ left: s * 0.07, forward: 0.36, down: 0.01 }),
        head.local({ left: s * 0.25, forward: 0.45, up: 0.05 }),
        head.local({ left: s * 0.4, forward: 0.1, down: 0.15 }),
        head.local({ left: s * 0.45, back: 0.3, down: 0.4 }),
      ),
      [0.012, 0.003],
      { bone: head, color: JADE, caps: { end: "point" } },
    );
    // cheek tufts
    glow(
      b.cards(
        [0.0, -0.08, -0.16].map((f) => frame(head.local({ left: s * 0.1, back: -f * -1, up: f * 0.3 }), [s * 0.6, 0.1, -0.8])),
        FLAME_Y,
        { size: [0.07, 0.22], lean: 55, flow: [s * 0.3, -0.2, -1], bone: head, cross: true },
      ),
      0.4,
    );
    // antlers
    const pts = [
      head.local({ left: s * 0.06, up: 0.1 }),
      head.local({ left: s * 0.1, up: 0.3, back: 0.12 }),
      head.local({ left: s * 0.09, up: 0.5, back: 0.28 }),
      head.local({ left: s * 0.05, up: 0.66, back: 0.45 }),
    ];
    const m = catmull(pts);
    b.sweep(m, [0.03, 0.008], { bone: head, color: HORN, caps: { end: "point" } });
    const tipBall = (p: THREE.Vector3, r: number) =>
      glow(b.part(new THREE.IcosahedronGeometry(r, 0), "#7dffd8", { bone: head, at: p }), 1.2);
    for (const [t, dx, dy, dz] of [[0.35, 0.05, 0.12, 0.12], [0.6, 0.04, 0.13, 0.09], [0.82, 0.03, 0.1, 0.06]]) {
      const p = m.at(t);
      const q = V(p.x + s * dx, p.y + dy, p.z + dz);
      const c = V(p.x + s * dx * 0.2, p.y + dy * 0.6, p.z + dz * 0.2);
      b.sweep(bezier(p, c, q), [0.017, 0.004], { bone: head, color: HORN, caps: { end: "point" } });
      tipBall(q, 0.013);
    }
    tipBall(m.at(1), 0.018);
  }
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), RED, { bone: head, at: head.local({ forward: 0.15, up: 0.1 }), scale: [0.8, 1.5, 0.8] }), 1.3);
  // goatee
  glow(
    b.cards([0, 0.05].map((x) => frame(jaw.local({ left: x * 0, forward: 0.3 - x, down: 0.03 }), [0, 1, 0])), FLAME_G, {
      size: [0.06, 0.2],
      lean: 180,
      flow: [0, 0, 1],
      bone: jaw,
      cross: true,
    }),
    0.4,
  );

  // ---------- cloud mane
  const manePuffs = [CREAM, "#d9fff1", "#bdeedd"];
  [0.12, 0.32, 0.52, 0.72, 0.9].forEach((t, i) => {
    for (const a of [-35, 0, 35]) {
      const r = 0.06 + 0.03 * R();
      b.stick(new THREE.IcosahedronGeometry(r, 1), manePuffs[(i + (a > 0 ? 1 : 0)) % 3], neckS.at(t, a), {
        embed: 0.3,
      });
    }
  });
  const nf: any[] = [];
  for (const a of [-45, 0, 45]) for (let i = 0; i < 9; i++) nf.push(neckS.at(0.04 + i * 0.11, a));
  glow(
    b.cards(nf, [FLAME_G, FLAME_G, FLAME_Y], {
      size: [0.1, 0.3],
      lean: 55,
      bend: 40,
      flow: [0, 0.1, -1],
      vary: 0.3,
      rng: R,
      cross: true,
    }),
    0.45,
  );
  const bf: any[] = [];
  for (let i = 0; i < 8; i++) bf.push(body.at(0.08 + i * 0.12, 0));
  glow(
    b.cards(bf, [FLAME_Y, FLAME_G], { size: [0.07, 0.2], lean: 60, bend: 30, flow: [0, 0, -1], vary: 0.3, rng: R, cross: true }),
    0.4,
  );

  // shoulder swirls
  for (const s of [1, -1]) {
    const hit = b.surface(body).around([0, 1.2, 0.35]).at(s * 90, 5);
    if (hit) b.decal(body, SWIRL, { at: hit, dir: [s, 0, 0], size: [0.3, 0.3], mirror: s > 0 });
    const hh = b.surface(body).around([0, 1.2, -0.6]).at(s * 90, 5);
    if (hh) b.decal(body, SWIRL, { at: hh, dir: [s, 0, 0], size: [0.26, 0.26], mirror: s > 0 });
  }

  // ---------- tail tuft
  const tf: any[] = [];
  for (const t of [0.7, 0.85, 1]) for (const a of [0, 90, 180, 270]) tf.push(tailS.at(t, a));
  glow(
    b.cards(tf, [FLAME_Y, FLAME_G], { size: [0.13, 0.42], lean: 40, bend: 50, flow: [0, -0.3, -1], vary: 0.3, rng: R, cross: true }),
    0.45,
  );
  for (const [t, a] of [[0.8, 0], [0.9, 120], [0.95, 240]] as [number, number][])
    b.stick(new THREE.IcosahedronGeometry(0.07, 1), CREAM, tailS.at(t, a), { embed: 0.3 });

  return b.root;
}
```