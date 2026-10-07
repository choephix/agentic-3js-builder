```ts
import * as THREE from "three";
import {
  createBuilder,
  paint,
  scales,
  gradient,
  svg,
  limb,
  catmull,
  offset,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Toco Toucan",
  description:
    "A stylized toco toucan in a rigging rest pose: blocky black body with scaled plumage paint, white bib with a red-gold border, a huge two-part orange bill with a black tip, painted eye patch, fanned flat-plate wing and tail feathers, and blue zygodactyl feet.",
};

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---------- palette ----------
  const BLACK = "#16161c";
  const BLACK_EDGE = "#0c0c11";
  const SHEEN = "#1e2638";
  const SHAFT = "#3c3f4c";
  const WHITE = "#f7f4ea";
  const CREAM = "#fbefc8";
  const RED = "#e0321f";
  const GOLD = "#f5c02c";
  const CLAW = "#262a36";

  const plumage = scales(BLACK, BLACK_EDGE, { size: 0.02, width: 0.14 });
  const legPaint = scales("#5a83c2", "#2f518a", { size: 0.006 });

  // body paint: black plumage, white bib with red/gold border, white rump, red crissum
  const bodyPaint = paint((p, n) => {
    const edge = 0.258 + 0.007 * Math.sin(p.x * 70);
    const front = n.z > (p.y > 0.33 ? -0.55 : 0.05) && p.z > -0.02;
    if (front && p.y > edge && p.y < 0.376) {
      if (p.y < edge + 0.007) return RED;
      if (p.y < edge + 0.016) return GOLD;
      return p.y < 0.295 ? CREAM : WHITE;
    }
    if (p.z < -0.075 && n.y > 0.25) return WHITE;
    if (p.z < -0.06 && n.y < -0.3) return RED;
    return plumage;
  });

  const billBase = gradient("#ffbd22", "#ff6c12", [0, 0.4, 0.12], [0, 0.34, 0.3]);
  const billPaint = paint((_p, _n, s) => {
    const t = s[0];
    const d = ((s[1] % 360) + 360) % 360;
    const fromTop = Math.min(d, 360 - d);
    if (t > 0.84) return "#121215";
    if (t < 0.05) return "#141417";
    if (fromTop < 13) return "#e4481a";
    if (fromTop > 150) return "#cf4416";
    return billBase;
  });

  const featherPaint = (base: string) =>
    paint((_p, _n, s) => (Math.abs(s[1]) < 0.0016 && s[0] > 0.004 ? SHAFT : base));
  const tailPaint = paint((_p, _n, s) => {
    const d = ((s[1] % 360) + 360) % 360;
    return Math.min(d, 360 - d) < 5 ? SHAFT : BLACK;
  });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.18, -0.03], dir: [0, 0.85, 0.5] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.18, -0.03],
      [0, 0.26, 0.02],
      [0, 0.33, 0.06],
    ],
    { parent: hips, names: ["spine", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.33, 0.06],
      [0, 0.372, 0.085],
    ],
    { parent: spine.joints[1], names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.372, 0.085], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.358, 0.108], aim: [0, 0.335, 0.29], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.165, -0.08],
      [0, 0.13, -0.19],
      [0, 0.1, -0.3],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.15, -0.1], w: 0.06, h: 0.05 },
      { at: [0, 0.18, -0.04], w: 0.11, h: 0.11 },
      { at: [0, 0.24, 0.01], w: 0.122, h: 0.12 },
      { at: [0, 0.31, 0.05], w: 0.1, h: 0.098 },
      { at: [0, 0.36, 0.075], w: 0.074, h: 0.074 },
      { at: [0, 0.382, 0.085], w: 0.06, h: 0.06 },
    ],
    { bone: [tail, hips, spine, neck, head], color: bodyPaint, sides: 10, name: "body" },
  );

  // rump coverts
  b.capsule([0, 0.145, -0.07], [0, 0.122, -0.14], 0.022, { color: RED, bone: tail.joints[0], name: "crissum" });
  b.capsule([0, 0.178, -0.07], [0, 0.163, -0.13], 0.019, { color: WHITE, bone: tail.joints[0], name: "rumpCoverts" });

  // tail feathers: flat box plates, centre on top
  for (let k = -2; k <= 2; k++) {
    const x = k * 0.021;
    const yL = -0.003 * Math.abs(k);
    const path = catmull([
      [x * 0.3, 0.168 + yL, -0.07],
      [x * 0.7, 0.135 + yL, -0.19],
      [x, 0.105 + yL, -0.31 + 0.012 * Math.abs(k)],
    ]);
    b.sweep(path, (t) => [0.017 * (t > 0.85 ? 1 - (t - 0.85) * 3 : 1), 0.0035], {
      bone: tail,
      section: "box",
      caps: "flat",
      color: tailPaint,
      name: `tailFeather${k + 2}`,
    });
  }

  // ---------- head ----------
  const H: [number, number, number] = [0, 0.388, 0.088];
  const headPart = b.part(new THREE.SphereGeometry(0.05, 12, 9), bodyPaint, {
    bone: head,
    at: H,
    scale: [0.86, 0.95, 1.05],
    name: "skull",
  });

  // upper bill
  b.loft(
    [
      { at: [0, 0.392, 0.115], w: 0.05, h: 0.06 },
      { at: [0, 0.392, 0.16], w: 0.042, h: 0.056 },
      { at: [0, 0.385, 0.22], w: 0.032, h: 0.046 },
      { at: [0, 0.37, 0.27], w: 0.022, h: 0.032 },
      { at: [0, 0.35, 0.305], w: 0.012, h: 0.016 },
      { at: [0, 0.33, 0.322], w: 0.004, h: 0.005 },
    ],
    { bone: head, color: billPaint, sides: 10, name: "billUpper" },
  );
  // lower mandible
  b.loft(
    [
      { at: [0, 0.352, 0.115], w: 0.044, h: 0.022 },
      { at: [0, 0.352, 0.16], w: 0.036, h: 0.022 },
      { at: [0, 0.35, 0.22], w: 0.028, h: 0.018 },
      { at: [0, 0.342, 0.265], w: 0.018, h: 0.012 },
      { at: [0, 0.332, 0.29], w: 0.006, h: 0.004 },
    ],
    { bone: jaw, color: billPaint, sides: 10, name: "billLower" },
  );
  // feathery tongue
  b.capsule([0, 0.359, 0.12], [0, 0.356, 0.2], [0.006, 0.003], { color: "#e46b7a", bone: jaw, name: "tongue" });

  // eyes
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="32" rx="30" ry="27" fill="#f7a128"/>
      <ellipse cx="32" cy="32" rx="28" ry="25" fill="none" stroke="#e0661c" stroke-width="3"/>
      <circle cx="32" cy="32" r="16" fill="#3f86e0"/>
      <circle cx="32" cy="32" r="11" fill="#1f4fa8"/>
    </svg>`,
    { size: 128 },
  );
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const hit = headSurf.around(H).at(s * 70, 12)!;
    b.decal(headPart, eyeTex, { at: hit, size: [0.044, 0.04], bone: head, name: `eyePatch${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(0.0085, 10, 8), "#0a0a0d", {
      bone: head,
      at: hit.local([0, 0.0015, 0]),
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.0026, 6, 4), "#ffffff", {
      bone: head,
      at: offset(hit.local([0, 0.0075, 0]), [0, 1, 0.7], 0.004),
      name: `eyeGlint${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------- legs & zygodactyl feet ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const footAt: [number, number, number] = [s * 0.04, 0.012, 0.018];
    const pts = limb([s * 0.035, 0.165, -0.005], footAt, [0.055, 0.07, 0.05], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [s * 0.04, 0, 0.018],
    });
    b.sweep(leg, [0.02, 0.011], { to: leg.ts[2], color: plumage, name: `thigh${S}` });
    b.sweep(leg, 0.0075, { from: leg.ts[2], color: legPaint, sides: 6, name: `tarsus${S}` });

    const foot = leg.tip!;
    const f = pts[3];
    const toes = [
      { a: s * 20, L: 0.046 },
      { a: -s * 10, L: 0.044 },
      { a: s * 150, L: 0.033 },
      { a: -s * 165, L: 0.03 },
    ];
    toes.forEach((toe, i) => {
      const r = (toe.a * Math.PI) / 180;
      const dx = Math.sin(r);
      const dz = Math.cos(r);
      const p1 = [f.x + dx * toe.L * 0.5, 0.0066, f.z + dz * toe.L * 0.5];
      const p2 = [f.x + dx * toe.L, 0.0062, f.z + dz * toe.L];
      const chain = b.chain(`toe${i + 1}${S}`, [[f.x, f.y, f.z], p1, p2], {
        parent: foot,
        names: [`toe${i + 1}a${S}`, `toe${i + 1}b${S}`],
        role: "digit",
      });
      b.sweep(chain, [0.0062, 0.0048], { color: legPaint, sides: 6 });
      b.spike(p2, [dx, -0.5, dz], 0.011, 0.0034, { color: CLAW, bone: chain.joints[1] });
    });
  }

  // ---------- wings (extended rest pose) ----------
  const feather = (L: number, W: number): OutlinePoint[] => [
    [0, -W / 2, "sharp"],
    [L * 0.72, -W / 2],
    [L, 0],
    [L * 0.72, W / 2],
    [0, W / 2, "sharp"],
  ];
  const flightPaint = featherPaint(BLACK);
  const covertPaint = featherPaint(SHEEN);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      [
        [s * 0.045, 0.305, 0.035],
        [s * 0.13, 0.31, 0.012],
        [s * 0.22, 0.312, 0.018],
        [s * 0.3, 0.306, 0.004],
      ],
      { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "wing" },
    );
    b.sweep(arm, [0.02, 0.014, 0.01, 0.007], { color: plumage, name: `armTube${S}` });

    const wristT = arm.ts[2];
    const place = (t: number, angDeg: number, L: number, W: number, yOff: number, color: typeof flightPaint, name: string) => {
      const cp = arm.at(t);
      const a = (angDeg * Math.PI) / 180;
      b.extrude(feather(L, W), {
        at: cp.moved(offset(cp.at, [0, 1, 0], yOff)),
        x: [s * Math.sin(a), -0.06, -Math.cos(a)],
        y: [Math.cos(a), 0, s * Math.sin(a)],
        thickness: 0.003,
        bevel: 0.001,
        smoothing: 2,
        color,
        name,
      });
    };

    let k = 0;
    // secondaries
    for (let i = 0; i < 6; i++, k++)
      place(0.08 + ((wristT - 0.08) * i) / 6, i * 3, 0.1 + i * 0.004, 0.036, -0.0015 * k, flightPaint, `secondary${i}${S}`);
    // primaries fanning out to the tip
    for (let j = 0; j < 6; j++, k++)
      place(wristT + ((0.97 - wristT) * j) / 5, 22 + j * 12, 0.12 + 0.007 * j, 0.032, -0.0015 * k, flightPaint, `primary${j}${S}`);
    // coverts, a shorter iridescent layer on top
    for (let c = 0; c < 8; c++)
      place(0.05 + (0.9 * c) / 7, (c / 7) * 50, 0.055, 0.034, 0.006 - 0.0008 * c, covertPaint, `covert${c}${S}`);
  }

  return b.root;
}
```