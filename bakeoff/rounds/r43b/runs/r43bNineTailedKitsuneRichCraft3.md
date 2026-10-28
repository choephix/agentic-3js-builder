```ts
import * as THREE from "three";
import { createBuilder, limb, catmull, mottle, paint, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A white nine-tailed fox spirit with crimson markings, a shide-rope collar and blue spirit flames burning at every tail tip.",
};

const GOLD = "#e8b84a";
const CRIM = "#c8283c";
const DARK = "#3a1424";
const PINK = "#f6c9c9";
const FLAME_OUT = "#6a8cff";
const FLAME_IN = "#c9f6ff";
const ORB = "#bff3ff";
const STRAW = "#d9c48a";
const PAPER = "#fbf8f0";

const FURP = mottle("#f7f2ea", "#d6cfe8", { size: 0.18, contrast: 0.8, seed: 3 });
const BODY = paint((p, n) =>
  n.y > 0.75 && Math.abs(p.x) < 0.012 + 0.008 * Math.sin(p.z * 40) && p.z > -0.45 && p.z < 0.35 ? CRIM : FURP,
);
const LEGP = paint((p) => (p.y < 0.28 ? DARK : p.y < 0.295 ? GOLD : FURP));
const TAILC = mottle("#f9f5ee", "#cfd0f0", { size: 0.22, contrast: 0.7, seed: 8 });
const EARP = paint((_p, _n, s) => (s[1] > 0.15 ? CRIM : FURP));
const ROPEP = paint((p) => (Math.sin((p.x + p.z) * 160 + p.y * 90) > 0 ? STRAW : "#b89c5c"));

const eyeSvg = (mirror: boolean) =>
  svg(
    `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="c"><path d="M14 36 Q44 12 84 32 Q56 54 14 36Z"/></clipPath></defs>
  <g ${mirror ? 'transform="translate(100,0) scale(-1,1)"' : ""}>
    <path d="M10 46 Q0 24 22 8 Q12 28 24 34 Z" fill="${CRIM}"/>
    <path d="M12 38 Q44 6 90 30 Q50 20 12 38Z" fill="${CRIM}"/>
    <path d="M14 36 Q44 12 84 32 Q56 54 14 36Z" fill="#fff0c0"/>
    <g clip-path="url(#c)">
      <ellipse cx="52" cy="33" rx="13" ry="17" fill="#ffa91a"/>
      <ellipse cx="52" cy="26" rx="13" ry="8" fill="#d9701a"/>
      <ellipse cx="52" cy="33" rx="4" ry="12" fill="#2a0e18"/>
    </g>
    <circle cx="46" cy="29" r="4" fill="#fff"/><circle cx="58" cy="40" r="2" fill="#fff"/>
    <path d="M14 36 Q44 12 84 32 Q56 54 14 36Z" fill="none" stroke="#3a1424" stroke-width="3.5" stroke-linejoin="round"/>
  </g></svg>`,
    { size: 256 },
  );

const MARK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 2 L50 30 L32 62 L14 30Z" fill="${CRIM}" stroke="#7a1022" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 14 L41 30 L32 48 L23 30Z" fill="${GOLD}"/>
  <circle cx="32" cy="30" r="4" fill="#fff4c4"/></svg>`,
  { size: 128 },
);

const FLAME: [number, number, "sharp"?][] = [
  [0, 0], [0.045, 0.03], [0.055, 0.1], [0.035, 0.17], [0.012, 0.24],
  [0.03, 0.34, "sharp"], [-0.005, 0.24], [-0.035, 0.2], [-0.055, 0.12], [-0.05, 0.04],
];

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const hips = b.joint("hips", { at: [0, 0.64, -0.5] });

  // ---- spine & body
  const spine = b.chain(
    "spine",
    catmull([[0, 0.64, -0.5], [0, 0.66, -0.15], [0, 0.68, 0.2], [0, 0.66, 0.38]]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const body = b.sweep(spine, (t) => {
    const r = 0.13 + 0.06 * Math.sin(Math.PI * (0.15 + 0.75 * t));
    return [r * 0.9, r * 1.05];
  }, { color: BODY });

  // ---- neck & head
  const neck = b.chain("neck", catmull([[0, 0.66, 0.38], [0, 0.8, 0.5], [0, 0.95, 0.57]]), {
    parent: chest, role: "neck",
  });
  const neckTube = b.sweep(neck, [0.11, 0.09, 0.075], { color: FURP });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.96, 0.58], dir: [0, 0.15, 1], role: "head" });
  const HC: [number, number, number] = [0, 0.99, 0.62];
  b.part(new THREE.SphereGeometry(1, 12, 8), FURP, { bone: head, at: HC, scale: [0.12, 0.11, 0.13] });
  b.capsule([0, 0.97, 0.66], [0, 0.945, 0.85], [0.065, 0.028], "#fbf7ef", { bone: head });
  b.part(new THREE.SphereGeometry(0.024, 8, 6), DARK, { bone: head, at: [0, 0.95, 0.885] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.93, 0.68], aim: [0, 0.915, 0.84], role: "jaw" });
  b.capsule([0, 0.93, 0.68], [0, 0.915, 0.84], [0.04, 0.022], "#f1ebe2", { bone: jaw });
  for (const s of [1, -1]) {
    b.spike([s * 0.026, 0.935, 0.8], [0, -1, 0], 0.03, 0.007, { color: "#fff", bone: head });
    for (const k of [0, 1]) {
      b.rod([s * 0.04, 0.95 - k * 0.012, 0.8], [s * (0.15 + k * 0.02), 0.97 - k * 0.04, 0.78], 0.0035, "#ddd", { bone: head });
    }
    // cheek ruff
    [0.94, 0.97, 1.0].forEach((y, i) => {
      b.spike([s * 0.1, y - 0.02, 0.58 + i * 0.01], [s * 0.8, -0.2 + i * 0.15, -0.5], 0.13 - i * 0.015, 0.035, {
        color: "#faf6ee", bone: head,
      });
    });
    // ears
    const lean: [number, number, number] = [s * 0.3, 1, -0.2];
    b.extrude(
      [[-0.065, 0], [0.065, 0], [0.05, 0.08], [0.01, 0.23, "sharp"], [-0.03, 0.1]],
      { at: [s * 0.07, 1.07, 0.55], x: [s, 0, 0], y: lean, thickness: 0.03, bevel: 0.006, color: EARP, bone: head },
    );
    b.extrude([[-0.035, 0], [0.035, 0], [0.005, 0.15]], {
      at: [s * 0.07, 1.075, 0.57], x: [s, 0, 0], y: lean, thickness: 0.012, color: PINK, bone: head,
    });
    // eyes
    const u = new THREE.Vector3(0.55 * s, 0.2, 0.81);
    const pt = new THREE.Vector3(HC[0] + u.x * 0.12, HC[1] + u.y * 0.11, HC[2] + u.z * 0.13);
    const nrm = new THREE.Vector3(u.x / 0.12, u.y / 0.11, u.z / 0.13).normalize();
    b.part(new THREE.PlaneGeometry(0.09, 0.058), "#ffffff", {
      bone: head, at: pt.clone().addScaledVector(nrm, 0.012), dir: nrm, axis: "z", up: [0, 1, 0],
      texture: eyeSvg(s > 0),
    });
  }
  b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
    bone: head, at: [0, 1.08, 0.72], dir: [0, 0.78, 0.63], axis: "z", up: [0, 1, 0], texture: MARK,
  });

  // ---- ruffs
  const skin = b.surface(body);
  for (let i = -3; i <= 3; i++) {
    const h = skin.around([0, 0.64, 0.3]).at(i * 16, -28);
    if (h) b.spike(h, h, 0.13, 0.04, { color: "#faf6ee" });
  }
  b.along(neckTube, 5, (at) => b.spike(at, [0, 0.4, -1], 0.12, 0.035, { color: "#faf6ee" }));

  // ---- collar rope, bells, shide
  const rope = b.surface(neckTube).loop(neck.joints[1], { lift: 0.01 });
  b.sweep(rope, 0.019, { color: ROPEP });
  const front = b.surface(neckTube).around(neck.joints[1].at).at(0, -5);
  if (front) {
    const a = front.at.clone().add(new THREE.Vector3(0, 0, 0.02));
    b.part(new THREE.SphereGeometry(0.026, 8, 6), GOLD, { at: a, bone: neck.joints[1] });
    b.extrude(
      [[-0.025, 0], [0.025, 0], [0.025, -0.04], [0.04, -0.07], [0.025, -0.1], [0.04, -0.13], [0, -0.16],
       [-0.04, -0.13], [-0.025, -0.1], [-0.04, -0.07], [-0.025, -0.04]],
      { at: a.clone().add(new THREE.Vector3(0, -0.02, 0.005)), x: [1, 0, 0], thickness: 0.004, color: PAPER, bone: neck.joints[1] },
    );
  }

  // ---- legs
  const legs = (s: number) => {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.1;
    const f = limb([x, 0.6, 0.3], [x, 0.045, 0.32], [0.3, 0.3], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, f, {
      parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "leg",
    });
    b.sweep(fl, [0.06, 0.045, 0.035], { color: LEGP });
    b.part(new THREE.SphereGeometry(1, 8, 6), FURP, { bone: fl.joints[0], at: [x, 0.58, 0.3], scale: [0.08, 0.12, 0.11] });
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
      bone: fl.joints[fl.joints.length - 1], at: [x, 0.03, 0.355], scale: [0.05, 0.034, 0.07],
    });
    const hx = s * 0.11;
    const h = limb([hx, 0.6, -0.45], [hx, 0.05, -0.5], [0.27, 0.26, 0.15], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${side}`, h, {
      parent: hips, names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`], role: "leg",
    });
    b.sweep(hl, [0.07, 0.045, 0.035, 0.028], { color: LEGP });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, { bone: hl.joints[0], at: [hx, 0.6, -0.45], scale: [0.095, 0.15, 0.15] });
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
      bone: hl.joints[hl.joints.length - 1], at: [hx, 0.03, -0.46], scale: [0.05, 0.034, 0.07],
    });
  };
  legs(1);
  legs(-1);

  // ---- flames
  const flame = (at: [number, number, number], sc: number, bone: any, strength: number) => {
    const outline = FLAME.map(([x, y, m]) => (m ? [x * sc, y * sc, m] : [x * sc, y * sc])) as any;
    const inner = FLAME.map(([x, y, m]) => (m ? [x * sc * 0.6, y * sc * 0.65, m] : [x * sc * 0.6, y * sc * 0.65])) as any;
    for (const dx of [[1, 0, 0], [0, 0, 1]] as [number, number, number][]) {
      glow(b.extrude(outline, { at, x: dx, thickness: 0.012 * sc, color: FLAME_OUT, bone, smoothing: 1 }), strength);
      glow(
        b.extrude(inner, { at: [at[0], at[1] + 0.01 * sc, at[2]], x: dx, thickness: 0.016 * sc, color: FLAME_IN, bone, smoothing: 1 }),
        strength + 0.4,
      );
    }
  };

  // ---- nine tails
  const B = new THREE.Vector3(0, 0.72, -0.6);
  for (let i = 0; i < 9; i++) {
    const k = (i - 4) / 4;
    const a = k * 1.3;
    const d = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
    const hgt = 0.35 + 0.35 * (1 - Math.abs(k));
    const pt = (dist: number, up: number) => B.clone().addScaledVector(d, dist).add(new THREE.Vector3(0, up, 0));
    const p3 = pt(0.85, 0.15 + 0.7 * hgt);
    const path = catmull([B.toArray(), pt(0.3, 0.1).toArray(), pt(0.62, 0.12 + 0.25 * hgt).toArray(), p3.toArray()]);
    const nm = `tail${i + 1}`;
    const tail = b.chain(nm, path, { parent: hips, names: [`${nm}a`, `${nm}b`, `${nm}c`], role: "tail" });
    b.sweep(tail, [0.05, 0.11, 0.12, 0.08, 0.02], {
      caps: "point",
      bands: [[0.68, TAILC], [0.72, GOLD], [1, "#eaf6ff"]],
    });
    flame([p3.x, p3.y + 0.01, p3.z], 1.3, tail.joints[2], 1.4);
  }

  // ---- floating spirit flames
  const orbs: [number, number, number][] = [
    [0.7, 1.0, 0.3], [-0.75, 1.15, 0.1], [0.55, 1.35, -0.2], [-0.5, 0.9, 0.7], [0.15, 1.5, 0.9],
  ];
  for (const o of orbs) {
    glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), ORB, { at: o, bone: hips }), 1.3);
    flame([o[0], o[1] + 0.04, o[2]], 1, hips, 1.2);
  }

  return b.root;
}
```