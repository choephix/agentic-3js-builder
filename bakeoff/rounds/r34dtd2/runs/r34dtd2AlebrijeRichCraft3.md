```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, rng, mix, smoothstep, noise } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood jaguar with eagle wings, beak and talons, covered in dotted folk patterns.",
};

const PINK = "#ff2f8a", TEAL = "#12b5b0", YEL = "#ffd21f", ORG = "#ff7a1a", PURP = "#6a2cb8", GRN = "#35b24a", RED = "#e02a2a", BLK = "#1a1020", WHT = "#fff6e0";

const dots = (base: string, dot: string, size: number, seed: number) =>
  paint((p, n) => {
    const v = noise(p, size, seed);
    const w = noise(p, size * 0.5, seed + 3);
    const light = 0.85 + 0.15 * smoothstep(-0.5, 1, n.y);
    const c = v > 0.62 ? mix(base, dot, 0.9) : w > 0.7 ? mix(base, BLK, 0.7) : mix(base, base, 0);
    return [c[0] * light, c[1] * light, c[2] * light];
  });

const BODY = dots(ORG, YEL, 0.05, 1);
const SPOT = dots(YEL, PURP, 0.045, 2);
const WING = dots(TEAL, PINK, 0.06, 3);
const BELLY = dots(PINK, WHT, 0.04, 4);

const eyeTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff6e0" stroke="#1a1020" stroke-width="5"/><circle cx="32" cy="32" r="18" fill="#12b5b0"/><circle cx="32" cy="32" r="9" fill="#1a1020"/><circle cx="26" cy="26" r="4" fill="#fff"/><circle cx="32" cy="32" r="22" fill="none" stroke="#e02a2a" stroke-width="3" stroke-dasharray="4 4"/></svg>`,
  { size: 128 },
);
const featherTex = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 2 C30 16 30 48 16 62 C2 48 2 16 16 2Z" fill="#ff2f8a" stroke="#1a1020" stroke-width="3"/><path d="M16 8 V58" stroke="#ffd21f" stroke-width="3"/><circle cx="16" cy="24" r="4" fill="#12b5b0"/><circle cx="16" cy="40" r="4" fill="#12b5b0"/></svg>`,
  { size: 96 },
);
const flowerTex = svg(
  `<svg viewBox="0 0 64 64"><g fill="#fff6e0" stroke="#1a1020" stroke-width="2"><circle cx="32" cy="14" r="10"/><circle cx="50" cy="32" r="10"/><circle cx="32" cy="50" r="10"/><circle cx="14" cy="32" r="10"/></g><circle cx="32" cy="32" r="9" fill="#e02a2a" stroke="#1a1020" stroke-width="2"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const R = rng(5);
  const hips = b.joint("hips", { at: [0, 0.62, -0.3], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, -0.3], [0, 0.68, 0.05], [0, 0.74, 0.4]]), { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] });
  const neck = b.chain("neck", catmull([[0, 0.74, 0.4], [0, 0.88, 0.55], [0, 1.0, 0.66]]), { parent: spine.joints[2], role: "neck", names: ["neck1", "neck2", "neck3"] });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.0, 0.66], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.97, 0.78], dir: [0, 0, 1], role: "jaw" });

  // torso
  b.loft([
    { at: [0, 0.62, -0.38], w: 0.34, h: 0.34 },
    { at: [0, 0.66, -0.05], w: 0.44, h: 0.42 },
    { at: [0, 0.74, 0.35], w: 0.46, h: 0.46 },
  ], { bone: [hips, spine], color: BODY });
  b.sweep(catmull([[0, 0.74, 0.4], [0, 0.88, 0.55], [0, 1.0, 0.66]]), [0.17, 0.13], { bone: neck, color: SPOT });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), BELLY, { bone: spine.joints[1], at: [0, 0.5, 0.05], scale: [1, 0.6, 1.5] });

  // head: jaguar skull
  b.part(new THREE.SphereGeometry(0.2, 10, 8), SPOT, { bone: head, at: [0, 1.02, 0.7], scale: [1, 0.9, 1] });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.12), YEL, { bone: head, at: [0, 0.98, 0.86] });
  b.part(new THREE.BoxGeometry(0.17, 0.05, 0.14), PINK, { bone: jaw, at: [0, 0.93, 0.84] });
  // eagle beak
  b.spike([0, 1.0, 0.9], [0, 0.93, 1.12], null, 0.07, { bone: head, color: YEL });
  b.spike([0, 0.93, 0.9], [0, 0.88, 1.04], null, 0.05, { bone: jaw, color: ORG });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), BLK, { bone: head, at: [0, 0.97, 1.06] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 8, 6), BLK, { bone: head, at: [s * 0.14, 1.07, 0.8], scale: [0.5, 1, 1] });
    b.part(new THREE.PlaneGeometry(0.15, 0.15), "#ffffff", { bone: head, at: [s * 0.172, 1.07, 0.8], dir: [s, 0, 0.1], axis: "z", texture: eyeTex });
    b.part(new THREE.ConeGeometry(0.07, 0.12, 5), s > 0 ? PURP : PINK, { bone: head, at: [s * 0.11, 1.25, 0.62] });
    b.part(new THREE.ConeGeometry(0.04, 0.07, 5), YEL, { bone: head, at: [s * 0.11, 1.25, 0.64] });
    b.rod([s * 0.12, 1.15, 0.84], [s * 0.2, 1.17, 0.94], 0.01, { bone: head, color: BLK });
    b.rod([s * 0.1, 1.15, 0.84], [s * 0.32, 1.12, 0.96], 0.008, { bone: head, color: BLK });
  }
  // crest feathers
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.06;
    b.spike([x, 1.2, 0.62], [x * 1.6, 1.42 - Math.abs(i - 2) * 0.04, 0.5], null, 0.035, { bone: head, color: [PINK, YEL, TEAL, ORG, PURP][i] });
  }
  b.cards(
    [0, 1, 2, 3, 4].map((i) => ({ at: [(i - 2) * 0.07, 0.88, 0.62] }) as any).slice(0, 0),
    featherTex,
    {},
  );

  // legs (jaguar) and talons
  const legSpec: [string, number, number, boolean][] = [["FL", 0.17, 0.35, false], ["FR", -0.17, 0.35, false], ["HL", 0.17, -0.35, true], ["HR", -0.17, -0.35, true]];
  for (const [n, x, z, hind] of legSpec) {
    const top = b.joint("hip" + n, { parent: hind ? hips : spine.joints[2], at: [x, 0.55, z], dir: [0, -1, 0], role: "leg" });
    const knee = b.joint("knee" + n, { parent: top, at: [x, 0.3, z + (hind ? -0.04 : 0.03)], dir: [0, -1, 0.1], role: "leg" });
    b.capsule([x, 0.58, z], [x, 0.3, z + (hind ? -0.04 : 0.03)], [0.1, 0.07], { bone: top, color: BODY });
    b.capsule([x, 0.3, z + (hind ? -0.04 : 0.03)], [x, 0.07, z + 0.03], [0.065, 0.055], { bone: knee, color: SPOT });
    b.part(new THREE.BoxGeometry(0.13, 0.05, 0.2), TEAL, { bone: knee, at: [x, 0.025, z + 0.08] });
    for (const k of [-1, 0, 1]) {
      b.spike([x + k * 0.04, 0.04, z + 0.17], [x + k * 0.05, 0.015, z + 0.27], null, 0.022, { bone: knee, color: BLK });
    }
    b.part(new THREE.BoxGeometry(0.15, 0.04, 0.04), RED, { bone: top, at: [x, 0.42, z] });
  }

  // tail
  const tail = b.chain("tail", catmull([[0, 0.62, -0.38], [0, 0.6, -0.8], [0, 0.8, -1.1], [0, 1.05, -1.15]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });
  b.sweep(tail, [0.09, 0.04], { color: dots(YEL, BLK, 0.04, 6) });
  b.part(new THREE.SphereGeometry(0.07, 6, 5), PINK, { bone: tail.tip ?? tail.joints[2], at: [0, 1.07, -1.15] });

  // wings
  for (const s of [1, -1]) {
    const sh = b.joint("shoulder" + (s > 0 ? "L" : "R"), { parent: spine.joints[2], at: [s * 0.24, 0.9, 0.2], dir: [s, 0.4, -0.2], role: "wing" });
    const wr = b.joint("wrist" + (s > 0 ? "L" : "R"), { parent: sh, at: [s * 0.75, 1.15, 0.05], dir: [s, 0.2, -0.3], role: "wing" });
    b.capsule([s * 0.24, 0.9, 0.2], [s * 0.75, 1.15, 0.05], [0.07, 0.05], { bone: sh, color: PURP });
    b.capsule([s * 0.75, 1.15, 0.05], [s * 1.2, 1.2, -0.1], [0.05, 0.03], { bone: wr, color: PURP });
    const arm = [[s * 0.3, 0.92, 0.1], [s * 0.75, 1.15, 0.0], [s * 1.2, 1.2, -0.1]];
    b.membrane(arm, [[s * 0.3, 0.8, -0.3], [s * 0.8, 0.95, -0.55], [s * 1.25, 1.0, -0.6]], { color: WING, bone: sh, thickness: 0.02 });
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const bx = s * (0.35 + t * 0.85), by = 1.0 + t * 0.15 - 0.05, bz = -0.3 - t * 0.2;
      b.spike([bx, by, bz], [bx + s * 0.04, by - 0.25 - t * 0.05, bz - 0.25], null, 0.05, { bone: i < 3 ? sh : wr, color: [PINK, YEL, ORG, GRN, PURP, RED][i] });
    }
  }
  // dorsal flowers and body dots
  const skin = b.surface(b.root);
  const hits = skin.scatter(30, { rng: R, minDist: 0.1, filter: (h) => h.n.y > 0.3 && h.at.z < 0.4 && Math.abs(h.at.x) < 0.3 });
  b.cards(hits, flowerTex, { size: 0.09, lean: 90, rng: R });
  const stud = skin.scatter(40, { rng: rng(9), minDist: 0.08, filter: (h) => Math.abs(h.n.x) > 0.6 && h.at.y < 0.9 });
  for (const h of stud) b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 6), R() > 0.5 ? TEAL : PURP, h, { embed: 0.3 });

  return b.root;
}
```