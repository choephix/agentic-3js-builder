```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chibi axolotl with a big round head, frilly pink gills, stubby limbs and a finned tail.",
};

export const REQUESTS = [
  { id: "eyeL", kind: "add", part: "head", what: "Left eye: big glossy black bead with two white highlights and a thin dark lid ring.", at: [0.17, 0.4, 0.32], normal: [0.5, 0.3, 0.8], bone: "head", room: [0.12, 0.12, 0.1] },
  { id: "eyeR", kind: "add", part: "head", what: "Right eye mirror of left: glossy bead, highlights, lid ring.", at: [-0.17, 0.4, 0.32], normal: [-0.5, 0.3, 0.8], bone: "head", room: [0.12, 0.12, 0.1] },
  { id: "smile", kind: "add", part: "head", what: "Tiny curved smile line in DARK across the front of the face with small dimple dots at the ends.", at: [0, 0.27, 0.5], normal: [0, 0, 1], bone: "head", room: [0.25, 0.08, 0.06] },
  { id: "nostrils", kind: "add", part: "head", what: "Two tiny nostril dots on top of the snout.", at: [0, 0.35, 0.5], normal: [0, 0.4, 1], bone: "head", room: [0.1, 0.04, 0.04] },
  { id: "cheekBlush", kind: "add", part: "head", what: "Two soft pink blush ovals on the cheeks under the eyes in GILL_LIGHT.", at: [0.24, 0.28, 0.3], normal: [1, 0, 0.5], bone: "head", room: [0.1, 0.07, 0.06] },
  { id: "gillTips", kind: "add", part: "gillL", what: "Small round bead tips in GILL_TIP at the end of every gill stalk, both sides.", at: [0.38, 0.45, -0.02], normal: [1, 0.4, 0], bone: "head", room: [0.3, 0.3, 0.3] },
  { id: "toesFront", kind: "add", part: "armL", what: "Four tiny rounded toes on each front hand, pale pink, splayed forward.", at: [0.36, 0.08, 0.22], normal: [0, 0, 1], bone: "armL", room: [0.12, 0.05, 0.08] },
  { id: "toesBack", kind: "add", part: "legL", what: "Five tiny toes on each hind foot.", at: [0.34, 0.06, -0.3], normal: [0, 0, 1], bone: "legL", room: [0.12, 0.05, 0.08] },
  { id: "tailFin", kind: "add", part: "tail", what: "Ruffled translucent-looking dorsal fin ridge along the tail top with small scalloped edge in FIN.", at: [0, 0.34, -0.7], normal: [0, 1, 0], bone: "tail2", room: [0.1, 0.2, 0.7] },
  { id: "bodyFreckles", kind: "texture", part: "body", what: "Scatter of small darker freckle spots in SKIN_DARK over the back of the body and head top, with pale belly in BELLY." },
  { id: "gillFrills", kind: "texture", part: "gillL", what: "Feathery lighter streaks from GILL to GILL_LIGHT along each gill stalk." },
  { id: "tailMark", kind: "texture", part: "tail", what: "Soft gradient from SKIN to FIN toward tail tip with faint spots." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const SKIN = "#f4b8c0";
const SKIN_DARK = "#d98c9c";
const BELLY = "#ffe3dc";
const GILL = "#ff5f8f";
const GILL_LIGHT = "#ff9ab8";
const GILL_TIP = "#ffd0de";
const FIN = "#ff9fb4";
const EYE = "#1a1220";
const DARK = "#7a3a52";

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(5);

  const hips = b.joint("hips", { at: [0, 0.2, -0.1], dir: [0, 0, 1], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.22, 0.12], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: chest, at: [0, 0.27, 0.3], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.2, 0.25], dir: [0, 0, 1], role: "jaw" });

  // body
  b.part(new THREE.SphereGeometry(0.3, 12, 9), SKIN, { bone: hips, at: [0, 0.27, -0.02], scale: [1, 0.8, 1.45], name: "body" });
  b.part(new THREE.SphereGeometry(0.28, 12, 8), BELLY, { bone: hips, at: [0, 0.2, 0.0], scale: [0.85, 0.55, 1.35], name: "belly" });

  // head: wide chibi
  b.part(new THREE.SphereGeometry(0.4, 14, 10), SKIN, { bone: head, at: [0, 0.35, 0.3], scale: [1.15, 0.85, 1.0], name: "head" });
  b.part(new THREE.SphereGeometry(0.3, 10, 8), BELLY, { bone: jaw, at: [0, 0.2, 0.32], scale: [1.0, 0.4, 0.9], name: "jaw" });
  b.part(new THREE.SphereGeometry(0.13, 8, 6), SKIN_DARK, { bone: head, at: [0, 0.6, 0.12], scale: [1.6, 0.6, 1.2], name: "crown" });

  // tail
  const tailPath = catmull([[0, 0.24, -0.35], [0, 0.22, -0.75], [0, 0.2, -1.1], [0, 0.24, -1.4]]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.17, 0.04], { color: SKIN, name: "tail", sectors: [[125, 235, BELLY]] });
  b.along(tail, 6, (at) => b.spike(at, [0, 1, 0], 0.12, 0.05, { color: FIN, caps: { end: "point" } }));

  // limbs
  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    const arm = b.chain(`arm${side}`, catmull([[s * 0.26, 0.16, 0.2], [s * 0.4, 0.09, 0.28], [s * 0.46, 0.05, 0.38]]), { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" });
    b.sweep(arm, [0.07, 0.05], { color: SKIN, name: `arm${side}` });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), BELLY, { bone: arm.tip ?? arm.joints[1], at: [s * 0.46, 0.04, 0.4], scale: [1.3, 0.5, 1.2] });
    const leg = b.chain(`leg${side}`, catmull([[s * 0.26, 0.17, -0.38], [s * 0.4, 0.09, -0.36], [s * 0.46, 0.05, -0.26]]), { parent: hips, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg" });
    b.sweep(leg, [0.08, 0.055], { color: SKIN, name: `leg${side}` });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), BELLY, { bone: leg.tip ?? leg.joints[1], at: [s * 0.46, 0.04, -0.24], scale: [1.3, 0.5, 1.2] });

    // gills: three frilly stalks per side
    const gillJ = b.joint(`gill${side}`, { parent: head, at: [s * 0.4, 0.42, 0.18], dir: [s, 0.3, 0], role: "fan" });
    const base: [number, number, number][] = [[s * 0.4, 0.42, 0.18], [s * 0.4, 0.42, 0.18], [s * 0.4, 0.42, 0.18]];
    const tips: [number, number, number][] = [[s * 0.78, 0.78, 0.1], [s * 0.86, 0.5, 0.16], [s * 0.74, 0.2, 0.2]];
    base.forEach((p, i) => {
      const t = tips[i];
      const mid: [number, number, number] = [(p[0] + t[0]) / 2, (p[1] + t[1]) / 2 + 0.06, (p[2] + t[2]) / 2 - 0.04];
      b.sweep(catmull([p, mid, t]), [0.035, 0.012], { color: GILL, bone: gillJ, name: `gill${side}` });
      // frills along stalk
      for (let k = 0; k < 4; k++) {
        const f = 0.3 + k * 0.2;
        const cx = p[0] + (t[0] - p[0]) * f, cy = p[1] + (t[1] - p[1]) * f + 0.03, cz = p[2] + (t[2] - p[2]) * f;
        const dir = [t[1] - p[1] > 0 ? 0.3 : -0.3, 0.8 * (i === 2 ? -1 : 1), 0.8 * (k % 2 ? 1 : -1)];
        b.spike([cx, cy, cz], dir, 0.17 - k * 0.02, 0.016, { color: k % 2 ? GILL_LIGHT : GILL, bone: gillJ, caps: { end: "point" } });
      }
      b.part(new THREE.SphereGeometry(0.025, 6, 4), GILL_TIP, { bone: gillJ, at: t });
    });
  }

  // placeholder eyes so stage 1 reads
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.065, 8, 6), EYE, { bone: head, at: [s * 0.2, 0.45, 0.58], name: "eye" });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), "#ffffff", { bone: head, at: [s * 0.185, 0.48, 0.63] });
  }
  b.part(new THREE.BoxGeometry(0.14, 0.012, 0.01), DARK, { bone: head, at: [0, 0.27, 0.68], name: "mouthLine" });
  void R;

  for (const add of STAGE2) add(b);
  return b.root;
}
```