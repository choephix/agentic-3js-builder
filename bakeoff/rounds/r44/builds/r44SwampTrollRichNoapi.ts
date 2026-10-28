import * as THREE from "three";
import { createBuilder, frame, limb, catmull, mix, noise, smoothstep, paint, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, long-armed swamp troll with teal skin, upward tusks, a flaming red mohawk, a necklace of skulls and bones, and a fetish staff topped with a skull and a glowing green orb.",
};

const SK = "#4f8f86", SK_D = "#2f5a63", BELLY = "#9cc3a0";
const RED = "#d6361e", ORANGE = "#ff8a1c";
const BONE = "#e8dcc0", BONE_D = "#b49e78";
const LEATHER = "#6b4426", LEATHER_D = "#3e2614", CLOTH = "#8e2b1e";
const WOODC = "#5a3b22", GREEN = "#6dff7a", INK = "#1b1210";

const SKIN = paint((p, n) => {
  let c = mix(SK_D, SK, 0.3 + 0.7 * noise(p, 0.09, 4));
  c = mix(c, "#8fd0b0", 0.3 * smoothstep(0.3, 1, n.y));
  if (n.z > 0.4 && p.y < 1.85 && p.y > 1.1) c = mix(c, BELLY, 0.7 * smoothstep(0.4, 0.8, n.z));
  if (noise(p, 0.05, 11) > 0.76) c = mix(c, "#2a4a3a", 0.6);
  return c;
});
const CLOTHP = paint((_p, _n, s) => {
  if (s[1] > -0.05) return "#e0a030";
  const k = (Math.floor(s[0] / 0.045) + Math.floor(s[1] / 0.045)) & 1;
  return k ? CLOTH : "#5e1a12";
});
const LEATHERP = paint((p) => mix(LEATHER_D, LEATHER, noise(p, 0.05, 6)));

const EYE = svg(
  `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 40 Q50 -6 96 36 Q50 66 4 40Z" fill="#ffd21f" stroke="#1b1210" stroke-width="7" stroke-linejoin="round"/>
  <ellipse cx="50" cy="38" rx="9" ry="22" fill="#1b1210"/>
  <path d="M0 22 Q50 0 100 16" stroke="#1b1210" stroke-width="9" fill="none"/>
  <circle cx="42" cy="28" r="4" fill="#fff6c0"/></svg>`,
  { size: 192 },
);
const PAINT_FACE = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6 L58 14 M2 22 L60 28 M6 38 L54 42" stroke="#f2ead0" stroke-width="5" stroke-linecap="round"/>
  <path d="M10 14 L50 20" stroke="#d6361e" stroke-width="3" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const GLYPH = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="28" fill="none" stroke="#f2ead0" stroke-width="5"/>
  <path d="M32 8 L32 56 M14 22 L32 36 L50 22 M18 46 L46 46" stroke="#d6361e" stroke-width="6" stroke-linecap="round" fill="none"/>
  <circle cx="32" cy="32" r="5" fill="#ffd21f"/></svg>`,
  { size: 192 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 32 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 99 C2 80 2 30 16 1 C30 30 30 80 16 99Z" fill="#d6361e" stroke="#1b1210" stroke-width="3"/>
  <path d="M16 90 L16 14" stroke="#ffd21f" stroke-width="3"/>
  <path d="M16 70 L6 58 M16 54 L8 42 M16 70 L26 58 M16 54 L24 42" stroke="#ff8a1c" stroke-width="3"/></svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 0 C26 16 31 40 27 64 L5 64 C1 40 6 16 16 0Z" fill="#ff8a1c"/><path d="M16 8 C20 28 20 46 16 64" stroke="#d6361e" stroke-width="4" fill="none"/></svg>`,
  { size: 96 },
);

const ring = (cx: number, cy: number, cz: number, rx: number, rz: number, n = 12, drop = 0) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.sin(a) * rx, cy - drop * Math.max(0, Math.cos(a)), cz + Math.cos(a) * rz] as [number, number, number];
  });

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 1024 });

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.05, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 1.05, 0], [0, 1.35, 0.1], [0, 1.7, 0.22], [0, 1.95, 0.28]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.95, 0.28], aim: [0, 2.08, 0.4], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.08, 0.4], aim: [0, 2.15, 0.6], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.04, 0.5], aim: [0, 2.0, 0.7], role: "jaw" });

  const legs = [1, -1].map((s) => {
    const n = s > 0 ? "L" : "R";
    const pts = limb([s * 0.2, 1.0, 0], [s * 0.22, 0.12, 0.08], [0.56, 0.56], [0, 0, 1]);
    return b.chain(`leg${n}`, catmull(pts), { parent: hips, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg" });
  });
  const armTargets: [number, number, number][] = [[0.64, 1.0, 0.28], [-0.62, 1.05, 0.28]];
  const arms = [1, -1].map((s, i) => {
    const n = s > 0 ? "L" : "R";
    const pts = limb([s * 0.4, 1.9, 0.18], armTargets[i], [0.55, 0.55], [0, 0, -1]);
    return b.chain(`arm${n}`, catmull(pts), { parent: chest, names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "arm" });
  });

  // ---------------- body
  const torso = b.sweep(
    spine,
    (t) => [0.22 + 0.22 * Math.sin(t * Math.PI * 0.9), 0.19 + 0.12 * Math.sin(t * Math.PI * 0.9)],
    { color: SKIN, caps: "round", sides: 10 },
  );
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { at: [0, 2.0, 0.1], scale: [0.34, 0.25, 0.3], bone: chest });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { at: [0, 1.08, -0.02], scale: [0.3, 0.2, 0.24], bone: hips });
  b.decal(torso, GLYPH, { at: [0, 1.6, 0.5], dir: [0, 0, 1], size: [0.22, 0.22] });
  b.sweep(catmull([[0, 1.95, 0.28], [0, 2.03, 0.36], [0, 2.1, 0.43]]), 0.12, { bone: neck, color: SKIN, sides: 8 });

  // ---------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { at: [0, 2.13, 0.48], scale: [0.2, 0.19, 0.23], bone: head });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { at: [0, 2.07, 0.66], scale: [0.14, 0.09, 0.12], bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), SK_D, { at: [0, 2.22, 0.6], scale: [0.2, 0.045, 0.1], bone: head });
  b.sweep(catmull([[0, 2.14, 0.7], [0, 2.1, 0.8], [0, 2.05, 0.82]]), [0.055, 0.04], { bone: head, color: SK_D, sides: 6, caps: "round" });
  for (const s of [1, -1]) {
    glow(b.decal(skull, EYE, { at: [s * 0.09, 2.17, 0.62], dir: [s * 0.3, 0.05, 1], size: [0.11, 0.07], mirror: s > 0, bone: head }), 0.8);
    b.decal(skull, PAINT_FACE, { at: [s * 0.16, 2.07, 0.55], dir: [s, 0, 0.5], size: [0.13, 0.1], mirror: s > 0, bone: head });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), INK, { at: [s * 0.03, 2.08, 0.84], bone: head });
    // ears
    b.spike([s * 0.18, 2.17, 0.4], [s * 1, 0.55, -0.6], 0.42, 0.065, { color: SK, bone: head, sides: 5 });
    b.spike([s * 0.2, 2.2, 0.38], [s * 1, 0.55, -0.6], 0.3, 0.03, { color: SK_D, bone: head, sides: 5 });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 8), BONE, { at: [s * 0.3, 2.3, 0.34], dir: [s, 0, 0.3], axis: "z", bone: head });
    // tusks
    b.spike([s * 0.095, 2.0, 0.66], [s * 0.15, 1, 0.25], 0.3, 0.035, { color: BONE, bone: jaw, sides: 6 });
    for (const k of [0, 1]) b.spike([s * (0.04 + k * 0.04), 2.0, 0.72], [0, 1, 0.1], 0.04, 0.012, { color: BONE_D, bone: jaw, sides: 4 });
  }
  b.part(new THREE.SphereGeometry(1, 10, 8), SK, { at: [0, 1.97, 0.58], scale: [0.14, 0.07, 0.16], bone: jaw });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#7a2a2a", { at: [0, 2.02, 0.6], scale: [0.1, 0.02, 0.1], bone: jaw });
  // beard braids
  for (const s of [1, -1]) {
    const br = b.sweep(catmull([[s * 0.05, 1.93, 0.72], [s * 0.07, 1.8, 0.76], [s * 0.07, 1.66, 0.76]]), [0.03, 0.015], { bone: jaw, color: ORANGE, sides: 5, caps: "round" });
    void br;
    b.part(new THREE.SphereGeometry(0.022, 6, 5), BONE, { at: [s * 0.07, 1.64, 0.76], bone: jaw });
  }

  // ---------------- mohawk
  const crest: [number, number, number, number][] = [
    [0.64, 2.28, 0.3, 0.2], [0.55, 2.31, 0.26, 0.26], [0.44, 2.32, 0.3, 0.3], [0.34, 2.31, 0.32, 0.34],
    [0.24, 2.29, 0.32, 0.34], [0.14, 2.25, 0.3, 0.3], [0.04, 2.2, 0.28, 0.27],
  ].map(([z, y, h, hh]) => [y, z, h, hh] as [number, number, number, number]).map(([y, z, h]) => [z, y, h, h]);
  crest.forEach(([z, y, h], i) => {
    b.extrude(
      [[-0.06, 0], [0.06, 0], [0.05, h * 0.5], [0.01, h, "sharp"], [-0.04, h * 0.55]],
      { at: [0, y - 0.03, z - 0.0], x: [0, 0, 1], y: [0, 1, -0.45], thickness: 0.035, bevel: 0.006, color: i % 2 ? ORANGE : RED, bone: head },
    );
  });
  [[1.98, -0.08], [1.8, -0.1], [1.62, -0.06], [1.44, -0.04]].forEach(([y, z], i) => {
    b.extrude(
      [[-0.07, 0], [0.07, 0], [0.05, 0.14], [0, 0.26 - i * 0.02, "sharp"], [-0.05, 0.12]],
      { at: [0, y, z], x: [0, 0, 1], y: [0, 1, -0.6], thickness: 0.035, bevel: 0.006, color: i % 2 ? RED : ORANGE, bone: chest },
    );
  });
  b.cards(
    [0.5, 0.36, 0.22].map((z) => frame([0, 2.3, z], [0, 1, 0])),
    TUFT,
    { size: [0.1, 0.2], lean: 40, flow: [0, 0, -1], cross: true, bone: head },
  );

  // ---------------- legs & feet
  legs.forEach((ch, i) => {
    const s = i === 0 ? 1 : -1;
    b.sweep(ch, (t) => 0.17 - 0.08 * t, { color: SKIN, sides: 8 });
    const ankle = ch.joints[2];
    b.part(new THREE.SphereGeometry(1, 9, 7), SKIN, { at: [s * 0.22, 0.085, 0.1], scale: [0.11, 0.085, 0.2], bone: ankle });
    for (const dx of [-0.07, 0, 0.07]) {
      const x = s * 0.22 + dx;
      b.capsule([x, 0.045, 0.2], [x + dx * 0.3, 0.04, 0.34], [0.045, 0.035], { color: SK_D, bone: ankle, sides: 6 });
      b.spike([x + dx * 0.3, 0.04, 0.35], [0, -0.1, 1], 0.07, 0.027, { color: BONE, bone: ankle, sides: 5 });
    }
    // anklet with beads
    b.sweep(catmull(ring(s * 0.22, 0.2, 0.08, 0.11, 0.11, 8), { closed: true } as never), 0.012, { color: LEATHER, bone: ankle, sides: 5 });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), BONE, { at: [s * 0.22, 0.2, 0.2], bone: ankle });
  });

  // ---------------- arms
  arms.forEach((ch, i) => {
    const s = i === 0 ? 1 : -1;
    const n = s > 0 ? "L" : "R";
    b.sweep(ch, (t) => 0.11 - 0.04 * t, { color: SKIN, sides: 8 });
    b.sweep(ch, 0.075, { from: 0.72, to: 0.96, color: LEATHERP, sides: 8, caps: "flat" });
    for (const t of [0.76, 0.84, 0.92]) b.sweep(ch, 0.08, { from: t, to: t + 0.015, color: BONE, sides: 8, caps: "flat" });
    // pauldron
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), LEATHERP, { at: [s * 0.42, 1.95, 0.16], scale: [0.18, 0.14, 0.18], bone: ch.joints[0] });
    for (const [dx, dy, dz] of [[0.3, 0.9, 0], [0.8, 0.5, 0.2], [0.6, 0.6, -0.5]])
      b.spike([s * 0.42 + s * dx * 0.12, 2.0 + dy * 0.05, 0.16 + dz * 0.1], [s * dx, dy, dz], 0.2, 0.04, { color: BONE, bone: ch.joints[0], sides: 5 });
    const w = ch.tip!.at;
    const wr = ch.tip!;
    b.part(new THREE.SphereGeometry(1, 9, 7), SKIN, { at: [w.x, w.y - (s > 0 ? 0.06 : 0), w.z + 0.01], scale: [0.075, 0.09, 0.05], bone: wr });
    const paths: [number, number, number][][] = [];
    const names: string[] = [];
    if (s > 0) {
      for (let k = 0; k < 4; k++) {
        const x = w.x + (k - 1.5) * 0.035;
        paths.push([[x, w.y - 0.1, w.z + 0.03], [x, w.y - 0.2, w.z + 0.07], [x, w.y - 0.28, w.z + 0.05]]);
        names.push(`finger${n}${k + 1}`);
      }
      paths.push([[w.x + 0.06, w.y - 0.05, w.z + 0.03], [w.x + 0.1, w.y - 0.1, w.z + 0.07], [w.x + 0.13, w.y - 0.14, w.z + 0.1]]);
      names.push(`thumb${n}`);
    } else {
      const cx = -0.62, cz = 0.34, r = 0.06;
      for (let k = 0; k < 4; k++) {
        const y = w.y + 0.07 - k * 0.04;
        paths.push([30, 100, 170].map((a) => [cx + r * Math.sin((a * Math.PI) / 180), y, cz - r * Math.cos((a * Math.PI) / 180)] as [number, number, number]));
        names.push(`finger${n}${k + 1}`);
      }
      paths.push([-30, -100, -170].map((a) => [cx + r * Math.sin((a * Math.PI) / 180), w.y + 0.12, cz - r * Math.cos((a * Math.PI) / 180)] as [number, number, number]));
      names.push(`thumb${n}`);
    }
    paths.forEach((pts, k) => {
      const f = b.chain(names[k], catmull(pts), { parent: wr, names: [`${names[k]}a`, `${names[k]}b`], role: "digit" });
      b.sweep(f, [0.024, 0.017], { color: SK, caps: "round", sides: 6 });
      if (s > 0) b.spike(pts[2], [0, -1, 0.2], 0.05, 0.016, { color: BONE, bone: f.joints[1], sides: 4 });
    });
  });

  // ---------------- loincloth & belt
  b.sweep(catmull(ring(0, 1.1, 0, 0.27, 0.23, 12), { closed: true } as never), 0.03, { bone: hips, color: LEATHER, sides: 6 });
  for (const [z, th] of [[0.25, 1], [-0.2, -1]] as [number, number][]) {
    b.extrude(
      [[-0.17, 0], [0.17, 0], [0.16, -0.45], [0.08, -0.62], [0, -0.5], [-0.08, -0.62], [-0.16, -0.45]],
      { at: [0, 1.08, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, bevel: 0.004, color: CLOTHP, bone: hips },
    );
    void th;
  }
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [0, 0.78, 0.2755], dir: [0, 0, 1], axis: "z", texture: GLYPH, bone: hips });
  for (const a of [0, 60, 120, 180, 240, 300]) {
    const r = (a * Math.PI) / 180;
    b.part(new THREE.SphereGeometry(0.03, 7, 5), BONE, { at: [Math.sin(r) * 0.3, 1.1, Math.cos(r) * 0.26], scale: [1, 1, 0.8], bone: hips });
  }
  const bsk = (at: [number, number, number], sc: number, bone: any) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), BONE, { at, scale: [sc, sc * 0.9, sc * 1.05], bone, flat: true });
    b.part(new THREE.BoxGeometry(sc * 1.2, sc * 0.5, sc * 1.1), BONE_D, { at: [at[0], at[1] - sc * 0.85, at[2] + sc * 0.2], bone, flat: true });
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(sc * 0.28, 6, 5), INK, { at: [at[0] + s * sc * 0.4, at[1] + sc * 0.05, at[2] + sc * 0.85], bone });
  };
  bsk([0.42, 1.04, 0.24], 0.04, hips);

  // ---------------- necklace of fetishes
  const neckPts = ring(0, 1.87, 0.27, 0.4, 0.27, 14, 0.2);
  b.sweep(catmull(neckPts, { closed: true } as never), 0.012, { bone: chest, color: LEATHER_D, sides: 5 });
  [0, 1, 13].forEach((i) => {
    const p = neckPts[i];
    bsk([p[0], p[1] - 0.06, p[2] + 0.02], i === 0 ? 0.055 : 0.04, chest);
  });
  [2, 3, 4, 12, 11, 10].forEach((i) => {
    const p = neckPts[i];
    b.capsule([p[0], p[1] - 0.01, p[2]], [p[0], p[1] - 0.12, p[2] + 0.01], 0.014, { color: BONE, bone: chest, sides: 5 });
    b.part(new THREE.SphereGeometry(0.024, 6, 5), BONE, { at: [p[0], p[1] - 0.13, p[2] + 0.01], bone: chest });
  });
  for (const [x, y, z] of [[0, 1.52, 0.52]]) {
    b.part(new THREE.OctahedronGeometry(0.03, 0), GREEN, { at: [x, y + 0.02, z], scale: [1, 1.4, 0.8], bone: chest });
  }

  // ---------------- fetish staff
  const wristR = arms[1].tip!;
  const staff = b.joint("staff", { parent: wristR, at: [-0.62, 1.0, 0.34], dir: [0, 1, 0] });
  b.rod([-0.62, 0.0, 0.34], [-0.62, 2.55, 0.34], 0.03, { color: WOODC, bone: staff, sides: 6 });
  b.rod([-0.62, 0.0, 0.34], [-0.62, 0.1, 0.34], 0.04, { color: BONE_D, bone: staff, sides: 6 });
  for (const y of [1.45, 1.8, 2.2]) b.rod([-0.62, y, 0.34], [-0.62, y + 0.03, 0.34], 0.042, { color: LEATHER, bone: staff, sides: 6 });
  bsk([-0.62, 2.66, 0.34], 0.1, staff);
  for (const s of [1, -1]) {
    b.spike([-0.62 + s * 0.08, 2.7, 0.34], [s * 1, 0.8, 0], 0.22, 0.03, { color: BONE, bone: staff, sides: 5 });
    b.capsule([-0.62 + s * 0.04, 2.45, 0.34], [-0.62 + s * 0.14, 2.3, 0.34], 0.012, { color: BONE, bone: staff, sides: 4 });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), BONE, { at: [-0.62 + s * 0.15, 2.28, 0.34], bone: staff });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.06, 0), GREEN, { at: [-0.62, 2.43, 0.34], bone: staff, flat: true }), 1.6);
  b.cards(
    [-1, 0, 1].map((k) => frame([-0.62 + k * 0.04, 2.5, 0.34], [0, 1, 0])),
    FEATHER,
    { size: [0.07, 0.3], lean: 180, flow: [0, 0, 1], cross: true, bone: staff },
  );

  return b.root;
}
