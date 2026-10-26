import * as THREE from "three";
import { createBuilder, catmull, rng, paint, mix, noise, smoothstep, stripes, spots, svg } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood alebrije: jaguar body with eagle head, wings and talons, covered in dotted patterns.",
};

const TEAL = "#16b5b0", PINK = "#ee3a8c", YEL = "#ffc928", ORG = "#ff7a1c", PUR = "#6a2fa0", RED = "#d8262f", BLK = "#1a1020", WHT = "#fff6e0", GRN = "#4cb848", BLU = "#2a56c8";

const dots = (a: string, d: string, size: number, seed: number) => spots(a, d, { size, amount: 0.8, seed });
const BODY = paint((p, n) => {
  const base = stripes(ORG, PINK, { size: 0.09, axis: "z", width: 0.3, seed: 2 }).at(p, n);
  const sp = dots(`#${"ffc928"}`, BLK, 0.06, 4).at(p, n);
  const t = smoothstep(0.45, 0.55, noise(p, 0.1, 9));
  return mix(base, sp, t * 0.6);
});
const BELLY = dots(YEL, RED, 0.05, 7);
const WINGP = stripes(TEAL, PUR, { size: 0.07, axis: "y", width: 0.35, seed: 5 });
const WOOD = paint((p, n) => mix("#d9a066", "#b9773c", noise(p, 0.05, 3) * 0.8 + n.y * 0.1));

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const R = rng(11);

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.35] });
  const spine = b.chain("spine", catmull([[0, 0.62, -0.35], [0, 0.68, 0], [0, 0.74, 0.35]]), { parent: hips, role: "spine", names: ["spine1", "spine2"] });
  const neck = b.chain("neck", catmull([[0, 0.74, 0.35], [0, 0.9, 0.5], [0, 1.0, 0.62]]), { parent: spine.joints[1], role: "neck", names: ["neck1", "neck2"] });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.0, 0.62], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.97, 0.7], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", catmull([[0, 0.62, -0.35], [0, 0.6, -0.75], [0, 0.75, -1.1], [0, 1.0, -1.3]]), { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] });

  // body
  b.sweep(catmull([[0, 0.62, -0.5], [0, 0.65, -0.2], [0, 0.72, 0.2], [0, 0.78, 0.42]]), (t) => [0.2 + 0.05 * Math.sin(t * 3), 0.22], { bone: [hips, spine.joints[0], spine.joints[1]], color: BODY, sides: 10 });
  b.sweep(catmull([[0, 0.5, -0.4], [0, 0.5, 0.1], [0, 0.55, 0.35]]), [0.15, 0.12], { bone: spine.joints[0], color: BELLY, sides: 8 });
  b.sweep(neck, [0.14, 0.11], { color: BODY });
  b.sweep(tail, (t) => 0.09 * (1 - t) + 0.035, { color: (t) => (t > 0.8 ? YEL : t > 0.6 ? PUR : t > 0.4 ? TEAL : t > 0.2 ? PINK : ORG) });
  b.part(new THREE.SphereGeometry(0.05, 6, 5), RED, { bone: tail.joints[2], at: [0, 1.0, -1.32] });

  // legs
  for (const s of [1, -1]) {
    for (const [z, nm] of [[0.3, "F"], [-0.4, "H"]] as [number, string][]) {
      const x = s * 0.17;
      const top = [x, 0.55, z];
      const leg = b.chain(`leg${nm}${s > 0 ? "L" : "R"}`, [top, [x, 0.3, z + 0.02], [x, 0.07, z + 0.03]], { parent: z > 0 ? spine.joints[1] : hips, role: "leg", names: [`hip${nm}${s > 0 ? "L" : "R"}`, `knee${nm}${s > 0 ? "L" : "R"}`, `foot${nm}${s > 0 ? "L" : "R"}`] });
      b.sweep(leg, [0.09, 0.05], { color: stripes(YEL, BLK, { size: 0.06, axis: "y", width: 0.4, seed: 8 }) });
      // talons
      const foot = leg.tip ?? leg.joints[2];
      for (let i = -1; i <= 1; i++) {
        b.spike([x + i * 0.04, 0.04, z + 0.05], [i * 0.15, -0.1, 1], 0.12, 0.022, { color: WHT, bone: foot });
      }
      b.part(new THREE.SphereGeometry(0.05, 6, 5), ORG, { bone: foot, at: [x, 0.05, z + 0.04], scale: [1, 0.7, 1.2] });
    }
  }

  // eagle head
  b.part(new THREE.SphereGeometry(0.17, 10, 8), WHT, { bone: head, at: [0, 1.02, 0.66], scale: [0.95, 1, 1.05] });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), TEAL, { bone: head, at: [0, 1.1, 0.62], scale: [1.4, 0.6, 1] });
  // beak upper
  b.part(new THREE.ConeGeometry(0.1, 0.26, 6), YEL, { bone: head, at: [0, 0.99, 0.87], dir: [0, -0.3, 1] });
  b.part(new THREE.ConeGeometry(0.1, 0.12, 6), RED, { bone: head, at: [0, 1.02, 0.78], dir: [0, 0, 1] });
  // lower jaw
  b.part(new THREE.ConeGeometry(0.07, 0.2, 6), ORG, { bone: jaw, at: [0, 0.93, 0.82], dir: [0, 0, 1] });
  // eyes
  const EYE = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${YEL}" stroke="${BLK}" stroke-width="4"/><circle cx="32" cy="32" r="17" fill="${RED}"/><circle cx="32" cy="32" r="9" fill="${BLK}"/><circle cx="27" cy="26" r="4" fill="#fff"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.06, 14), "#ffffff", { bone: head, at: [s * 0.14, 1.06, 0.74], dir: [s * 0.5, 0, 1], axis: "z", texture: EYE });
    b.part(new THREE.BoxGeometry(0.1, 0.025, 0.05), BLK, { bone: head, at: [s * 0.13, 1.13, 0.75], rotation: [0, 0, s * -20] });
    // jaguar ears
    b.part(new THREE.SphereGeometry(0.06, 6, 5), ORG, { bone: head, at: [s * 0.14, 1.18, 0.55], scale: [1, 1, 0.6] });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), PINK, { bone: head, at: [s * 0.14, 1.18, 0.58] });
  }
  // crest feathers
  const names = [TEAL, PINK, YEL, PUR, ORG];
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.2;
    b.extrude([[-0.03, 0], [0.03, 0], [0.02, 0.2], [0, 0.26, "sharp"], [-0.02, 0.2]], { at: [Math.sin(a) * 0.1, 1.17, 0.5], x: [1, 0, 0], y: [Math.sin(a), 1, -0.5], thickness: 0.02, color: names[i % 5], bone: head, smoothing: 1 });
  }
  // neck ruff
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.14, 0.9 + Math.sin(a) * 0.14, 0.5], [Math.cos(a), Math.sin(a), -0.4], 0.12, 0.04, { color: names[i % 5], bone: neck.joints[1] });
  }

  // wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = b.joint(`shoulder${side}`, { parent: spine.joints[1], at: [s * 0.22, 0.85, 0.15], dir: [s, 0.3, -0.2], role: "wing" });
    const el = b.joint(`elbow${side}`, { parent: sh, at: [s * 0.65, 1.0, 0.0], dir: [s, 0.1, -0.5], role: "wing" });
    b.rod(sh, el, 0.05, { color: ORG });
    b.rod(el, [s * 1.05, 1.05, -0.2], 0.04, { color: PINK, bone: el });
    for (let i = 0; i < 7; i++) {
      const k = i / 6;
      const bx = s * (0.3 + k * 0.7), by = 0.95 + k * 0.1, bz = 0.05 - k * 0.25;
      const len = 0.45 + 0.2 * Math.sin(k * 3);
      const col = names[i % 5];
      b.extrude([[-0.05, 0], [0.05, 0], [0.06, len * 0.7], [0, len, "sharp"], [-0.06, len * 0.7]], { at: [bx, by, bz], x: [s, 0, 0.2], y: [s * 0.6, -0.1, -1], thickness: 0.018, color: i % 2 ? col : WINGP, bone: i < 3 ? sh : el, smoothing: 1 });
      b.spike([bx, by + 0.01, bz - 0.05], [s * 0.6, -0.1, -1], len * 0.8, 0.008, { color: BLK, bone: i < 3 ? sh : el });
    }
    // covert layer
    for (let i = 0; i < 5; i++) {
      const k = i / 4;
      b.part(new THREE.SphereGeometry(0.07, 6, 5), dots(TEAL, WHT, 0.04, 3), { bone: sh, at: [s * (0.3 + k * 0.6), 1.0 + k * 0.03, 0.02 - k * 0.1], scale: [1.1, 0.5, 1.5] });
    }
  }

  // spine dots, body ornament
  const skin = b.surface(b.root);
  for (const h of skin.scatter(30, { rng: R, minDist: 0.12, filter: (h) => h.n.y > 0.6 && h.at.y > 0.6 && h.at.z < 0.4 && h.at.z > -0.5 && Math.abs(h.at.x) < 0.3 })) {
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 7), names[Math.floor(R() * 5)], h, { embed: 0.3 });
  }
  // whiskers/ trim dots on beak
  for (let i = 0; i < 5; i++) b.part(new THREE.SphereGeometry(0.014, 5, 4), BLK, { bone: head, at: [(i - 2) * 0.03, 1.07, 0.9 - Math.abs(i - 2) * 0.01] });
  // tongue
  b.part(new THREE.BoxGeometry(0.04, 0.01, 0.12), RED, { bone: jaw, at: [0, 0.95, 0.83] });
  // base stripe collar
  b.part(new THREE.TorusGeometry(0.17, 0.03, 5, 12), GRN, { bone: neck.joints[0], at: [0, 0.78, 0.4], rotation: [70, 0, 0] });
  b.part(new THREE.TorusGeometry(0.2, 0.025, 5, 12), BLU, { bone: spine.joints[0], at: [0, 0.66, -0.15], rotation: [0, 90, 0] });
  b.part(new THREE.BoxGeometry(0.01, 0.01, 0.01), WOOD, { bone: hips, at: [0, 0.6, -0.3] });

  return b.root;
}
