import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description: "A cel-shaded red panda with cream-rimmed ears, a ringed tail and big anime eyes, standing on a mossy boulder.",
};

const RUST = cel("#e0602a", "#b8402e");
const DARK = cel("#3a211c", "#24142a");
const CREAM = cel("#fff2da", "#f0cfb0");
const RING_A = cel("#d9561f", "#b03a2c");
const RING_B = cel("#8a3418", "#5e2224");
const NOSE = "#1e1018";
const MOSS = "#6fbf4a";
const MOSS_D = "#3f8a3a";

const TUFT = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b0b0b0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
  <polygon points="2,64 10,64 5,6" fill="url(#g)"/><polygon points="9,64 22,64 16,0" fill="url(#g)"/><polygon points="20,64 30,64 28,10" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const MOSS_TUFT = svg(
  `<svg viewBox="0 0 32 48"><polygon points="2,48 10,48 4,8" fill="#4fa23e"/><polygon points="9,48 22,48 16,0" fill="#86d65a"/><polygon points="20,48 30,48 29,12" fill="#5db84a"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const G = 0.19; // stone top
  const Y = 0.43;

  // ---------------- stone
  const stonePaint = paint((p, n) => {
    const base = mix("#8d8b96", "#5d5a6c", smoothstep(0.6, -0.4, n.y));
    const m = smoothstep(0.1, 0.55, n.y + (noise(p, 0.1, 3) - 0.5) * 0.9);
    const moss = mix(MOSS_D, MOSS, noise(p, 0.07, 8));
    return mix(base, moss, m);
  });
  b.lathe(
    [[0, 0], [0.23, 0], [0.3, 0.06], [0.285, 0.13], [0.21, 0.18], [0, 0.192]],
    { at: [0, 0, -0.02], segments: 9, color: stonePaint, smoothing: 0, name: "stone" },
  );
  b.part(new THREE.SphereGeometry(0.09, 6, 4), stonePaint, { at: [0.22, 0.05, 0.12], scale: [1, 0.6, 1], flat: true, name: "pebble" });
  b.ring(frame([0, 0.17, -0.02], [0, 1, 0]), { count: 9, radius: 0.21 }, (it) =>
    b.part(new THREE.SphereGeometry(0.035, 5, 4), MOSS, { at: it.at, scale: [1, 0.5, 1], flat: true, name: "mossBlob" }),
  );
  const mossHits = [0, 1, 2, 3, 4, 5, 6].map((i) => frame([Math.sin(i * 0.9) * 0.2, 0.18, -0.02 + Math.cos(i * 0.9) * 0.2], [0, 1, 0]));
  b.cards(mossHits, MOSS_TUFT, { size: [0.04, 0.05], lean: 20, cross: true, vary: 0.3, rng: rng(2) });

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, Y, -0.22], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", catmull([[0, Y, -0.22], [0, Y + 0.01, -0.04], [0, Y, 0.14]]), { parent: hips, names: ["spine1", "chest"], role: "spine" });
  const chest = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, Y, 0.14], [0, Y + 0.03, 0.22], [0, Y + 0.05, 0.27]]), { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, Y + 0.05, 0.27], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.455, 0.33], aim: [0, 0.445, 0.41], role: "jaw" });

  const body = b.loft(
    [
      { at: [0, Y, -0.3], w: 0.17, h: 0.17 },
      { at: [0, Y, -0.2], w: 0.22, h: 0.21 },
      { at: [0, Y + 0.01, -0.04], w: 0.23, h: 0.22 },
      { at: [0, Y, 0.1], w: 0.2, h: 0.2 },
      { at: [0, Y, 0.18], w: 0.16, h: 0.17 },
    ],
    { bone: [hips, spine], color: cel(furEdge(RUST, DARK, { level: -0.3, teeth: 0.25, period: 0.035, ink: INK })), sides: 10, name: "body" },
  );

  // ---------------- tail
  const tail = b.chain("tail", catmull([[0, Y - 0.02, -0.28], [0, Y - 0.03, -0.45], [0, Y - 0.07, -0.62], [0, Y - 0.12, -0.74], [0, Y - 0.15, -0.82]]), { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" });
  b.sweep(tail, (t) => 0.05 + 0.025 * Math.sin(t * 3) - 0.015 * t, {
    color: paint((_p, _n, s) => (s[0] > 0.93 ? DARK : Math.floor(s[0] * 11) % 2 ? RING_B : RING_A)),
    sides: 8,
    name: "tail",
  });

  // ---------------- legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root: [number, number, number] = [s * 0.1, Y - 0.05, front ? 0.1 : -0.2];
      const foot: [number, number, number] = [s * 0.095, G + 0.03, front ? 0.14 : -0.16];
      const pts = limb(root, foot, [0.09, 0.09], [[0, 0, front ? -1 : 1]]);
      const nm = front ? "F" : "H";
      const leg = b.chain(`leg${nm}${k}`, pts, {
        parent: front ? chest : hips,
        names: [`${front ? "shoulder" : "hip"}${k}`, `${front ? "elbow" : "knee"}${k}`, `${front ? "wrist" : "ankle"}${k}`],
        role: "leg",
        contact: [foot[0], G, foot[2]],
      });
      b.sweep(leg, [0.045, 0.032], { color: DARK, sides: 8, name: `leg${nm}${k}` });
      b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { bone: leg.tip!, at: [foot[0], G + 0.025, foot[2] + 0.018], scale: [0.04, 0.03, 0.055], name: "paw" });
      for (const o of [-1, 0, 1])
        b.part(new THREE.SphereGeometry(0.006, 4, 3), CREAM, { bone: leg.tip!, at: [foot[0] + o * 0.016, G + 0.025, foot[2] + 0.07], name: "claw" });
    }
  }

  // ---------------- head
  const C: [number, number, number] = [0, 0.49, 0.3];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), cel(furEdge(RUST, CREAM, { by: "position", axis: [0, 1, 0], level: 0.465, teeth: 0.012, period: 0.02, along: [1, 0, 0] })), {
    bone: head, at: C, scale: [0.088, 0.072, 0.077], name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [0, 0.468, 0.365], scale: [0.04, 0.032, 0.042], name: "muzzle" });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), NOSE, { bone: head, at: [0, 0.48, 0.402], scale: [1.3, 0.9, 1], name: "nose" });
  b.part(new THREE.SphereGeometry(1, 8, 4), CREAM, { bone: jaw, at: [0, 0.447, 0.362], scale: [0.03, 0.014, 0.04], name: "lowerJaw" });

  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#ffb02e", blush: false });
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 33, 4);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.036, 0.05], mirror: s > 0, segments: 10, name: "eye" });
    // brow dot
    b.part(new THREE.SphereGeometry(0.009, 5, 4), CREAM, { bone: head, at: [s * 0.04, 0.54, 0.34], scale: [1, 0.7, 0.7], name: "browDot" });
    // tear stripe
    b.capsule([s * 0.045, 0.468, 0.357], [s * 0.04, 0.44, 0.37], 0.005, { bone: head, color: RING_B, sides: 5, name: "tearMark" });
    // ears
    const dir: [number, number, number] = [s * 0.5, 0.7, -0.2];
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [s * 0.065, 0.552, 0.27], dir, axis: "z", scale: [0.04, 0.045, 0.014], name: "earRim" });
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST, { bone: head, at: [s * 0.065, 0.552, 0.264], dir, axis: "z", scale: [0.034, 0.039, 0.016], name: "ear" });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [s * 0.066, 0.55, 0.276], dir, axis: "z", scale: [0.022, 0.026, 0.01], name: "earInner" });
  }
  const cheeks = skin.scatter(40, { rng: rng(5), minDist: 0.02, filter: (h) => Math.abs(h.at.x) > 0.05 && h.at.z > 0.27 && h.at.y < 0.5 });
  b.cards(cheeks, TUFT, { size: [0.03, 0.05], lean: 65, cross: true, color: CREAM.id ? "#fff2da" : "#fff2da", rng: rng(6), vary: 0.25, flow: [0, -0.3, 0.2] });

  // ---------------- fur tufts
  const tufts = b.surface(body).scatter(160, { rng: rng(3), minDist: 0.035, filter: (h) => h.n.y > -0.2 });
  b.cards(tufts, TUFT, { size: [0.03, 0.055], lean: 65, bend: 15, color: "#f08a45", rng: rng(4), vary: 0.3 });

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  return b.root;
}
