```ts
import * as THREE from "three";
import { createBuilder, polyline, catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description: "A kid in a homemade cardboard-box robot costume: box torso with button panel, box helmet with a face window, tube sleeves, foil trim and tape.",
};

const CARD = "#b98a55", CARD_L = "#d0a licensed".length ? "#d2a96f" : "#d2a96f", CARD_D = "#8c6338", FLUTE = "#a47445";
const TAPE = "#e2cf9a", FOIL = "#cfd4dc", FOIL_D = "#9aa2ae";
const RED = "#d8352f", BLUE = "#2f6fd0", YEL = "#f2c230", GRN = "#49c46a", MARK = "#2a2a35";
const SKIN = "#efb78f", SKIN_D = "#d99572", HAIR = "#5a3a22", JEANS = "#3d5a8a", JEANS_D = "#2c4468";
const SHOE = "#d8352f", SOLE = "#f1ece0", GLOVE = "#e8c43a", SCREEN = "#12331f", SCREEN_L = "#6fe69a";

export default function build() {
  const b = createBuilder({ name: "cardboard_robot_kid" });
  const R = rng(5);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.55, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.62, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 0.85, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.04, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.12, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.2, 0.02], dir: [0, 0, 1], role: "jaw" });

  const arms: Record<string, any> = {};
  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    arms[n] = b.chain(
      "arm" + n,
      polyline([[s * 0.2, 1.0, 0], [s * 0.5, 0.9, 0.0], [s * 0.74, 0.76, 0.05]]),
      { parent: chest, names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "arm" },
    );
    legs[n] = b.chain(
      "leg" + n,
      polyline([[s * 0.1, 0.55, 0], [s * 0.1, 0.3, 0.025], [s * 0.1, 0.085, 0]]),
      { parent: hips, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg" },
    );
  }

  // ---------- helpers ----------
  const box = (bone: any, at: number[], size: number[], color: string, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...o });
  const cylZ = (bone: any, at: number[], r: number, h: number, color: string, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir: [0, 0, 1] });
  const cylX = (bone: any, at: number[], r: number, h: number, color: string, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir: [1, 0, 0] });
  const ball = (bone: any, at: number[], r: number, color: string, sc: number[] = [1, 1, 1], seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), color, { bone, at, scale: sc });
  const tapeStrip = (bone: any, at: number[], size: number[]) => box(bone, at, size, TAPE);

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const ch = legs[n];
    b.rod([s * 0.1, 0.55, 0], [s * 0.1, 0.3, 0.025], 0.062, JEANS, { bone: ch.joints[0] });
    ball(ch.joints[1], [s * 0.1, 0.3, 0.025], 0.062, JEANS);
    b.rod([s * 0.1, 0.3, 0.025], [s * 0.1, 0.1, 0], 0.052, JEANS_D, { bone: ch.joints[1] });
    // cuff
    b.rod([s * 0.1, 0.13, 0], [s * 0.1, 0.1, 0], 0.058, "#5476a8", { bone: ch.joints[1] });
    // cardboard shin guard w/ foil + tape
    box(ch.joints[1], [s * 0.1, 0.2, 0.062], [0.1, 0.17, 0.02], CARD_L);
    box(ch.joints[1], [s * 0.1, 0.2, 0.074], [0.075, 0.12, 0.006], FOIL);
    tapeStrip(ch.joints[1], [s * 0.1, 0.27, 0.074], [0.105, 0.025, 0.008]);
    tapeStrip(ch.joints[1], [s * 0.1, 0.13, 0.074], [0.105, 0.025, 0.008]);
    // red dot on guard
    cylZ(ch.joints[1], [s * 0.1, 0.2, 0.08], 0.018, 0.006, RED, 8);
    // sneakers
    box(ch.joints[1], [s * 0.1, 0.035, 0.05], [0.115, 0.07, 0.21], SHOE);
    box(ch.joints[1], [s * 0.1, 0.01, 0.055], [0.12, 0.022, 0.225], SOLE);
    ball(ch.joints[1], [s * 0.1, 0.045, 0.15], 0.052, SHOE, [1.05, 0.8, 0.9]);
    box(ch.joints[1], [s * 0.1, 0.06, 0.08], [0.08, 0.02, 0.04], SOLE);
  }
  // pelvis / belt hidden under box
  box(hips, [0, 0.56, 0], [0.26, 0.12, 0.17], JEANS);

  // ---------- kid torso under box (neck, shirt) ----------
  box(spine, [0, 0.88, 0], [0.3, 0.38, 0.19], "#e9534a"); // red tee
  b.rod([0, 1.02, 0], [0, 1.15, 0], 0.042, SKIN, { bone: neck });

  // ---------- cardboard torso box ----------
  const TW = 0.5, TH = 0.5, TD = 0.34, TY = 0.86;
  const T = TD / 2;
  box(chest, [0, TY, 0], [TW, TH, TD], CARD);
  // corrugated edges (side flutes)
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      box(chest, [s * (TW / 2 + 0.002), TY - 0.2 + i * 0.08, 0], [0.004, 0.02, TD - 0.04], FLUTE);
  // top flaps (folded out)
  box(chest, [0, TY + TH / 2 + 0.01, T - 0.02], [TW - 0.02, 0.012, 0.1], CARD_L, { rotation: [-18, 0, 0] });
  box(chest, [0, TY + TH / 2 + 0.01, -T + 0.02], [TW - 0.02, 0.012, 0.1], CARD_L, { rotation: [18, 0, 0] });
  // arm holes
  for (const s of [1, -1]) {
    cylX(chest, [s * (TW / 2 + 0.003), 1.0, 0], 0.07, 0.008, MARK, 14);
    // ragged cut rim
    cylX(chest, [s * (TW / 2 + 0.001), 1.0, 0], 0.082, 0.006, CARD_D, 14);
  }
  // tape on edges
  tapeStrip(chest, [0, TY + TH / 2 - 0.002, 0], [TW + 0.006, 0.01, 0.06]);
  tapeStrip(chest, [0, TY - TH / 2 + 0.003, 0], [TW + 0.006, 0.01, 0.07]);
  tapeStrip(chest, [-0.17, TY + 0.14, T + 0.002], [0.06, 0.13, 0.006]);
  tapeStrip(chest, [0.2, TY - 0.2, T + 0.002], [0.07, 0.05, 0.006]);
  // chest panel
  const FZ = T + 0.004;
  box(chest, [0, TY + 0.02, FZ], [0.38, 0.34, 0.008], FOIL);
  box(chest, [0, TY + 0.02, FZ + 0.006], [0.4, 0.012, 0.004], MARK);
  box(chest, [0, TY + 0.02 + 0.17, FZ + 0.004], [0.4, 0.014, 0.01], FOIL_D);
  box(chest, [0, TY + 0.02 - 0.17, FZ + 0.004], [0.4, 0.014, 0.01], FOIL_D);
  // screen
  glow(box(chest, [-0.075, TY + 0.1, FZ + 0.008], [0.16, 0.1, 0.008], SCREEN), 0.7);
  box(chest, [-0.075, TY + 0.1, FZ + 0.004], [0.18, 0.12, 0.006], MARK);
  const lines = [[-0.1, 0.12, 0.09], [-0.09, 0.1, 0.1], [-0.11, 0.08, 0.05], [-0.1, 0.06, 0.11]];
  lines.forEach(([x, y, w]) => glow(box(chest, [x + 0.03, TY + y, FZ + 0.014], [w, 0.009, 0.004], SCREEN_L), 1.6));
  // dial
  cylZ(chest, [0.1, TY + 0.1, FZ + 0.01], 0.045, 0.012, "#f5ecd2", 14);
  cylZ(chest, [0.1, TY + 0.1, FZ + 0.006], 0.052, 0.008, MARK, 14);
  box(chest, [0.1, TY + 0.115, FZ + 0.019], [0.006, 0.035, 0.004], RED, { rotation: [0, 0, -25] });
  // buttons
  const bc = [RED, YEL, BLUE, GRN];
  bc.forEach((c, i) => {
    cylZ(chest, [-0.14 + i * 0.07, TY - 0.03, FZ + 0.012], 0.024, 0.016, MARK, 10);
    glow(cylZ(chest, [-0.14 + i * 0.07, TY - 0.03, FZ + 0.02], 0.019, 0.012, c, 10), 1.1);
  });
  // lever/slider
  box(chest, [-0.06, TY - 0.11, FZ + 0.01], [0.2, 0.014, 0.008], MARK);
  box(chest, [0.0, TY - 0.11, FZ + 0.018], [0.03, 0.04, 0.012], RED);
  // vent slats
  for (let i = 0; i < 4; i++) box(chest, [0.1, TY - 0.09 - i * 0.018, FZ + 0.008], [0.1, 0.008, 0.005], MARK);
  // heart emblem
  box(chest, [0.12, TY - 0.2, FZ + 0.003], [0.06, 0.06, 0.004], "#f5ecd2", { rotation: [0, 0, 45] });
  ball(chest, [0.105, TY - 0.178, FZ + 0.008], 0.02, RED, [1, 1, 0.2]);
  ball(chest, [0.135, TY - 0.178, FZ + 0.008], 0.02, RED, [1, 1, 0.2]);
  box(chest, [0.12, TY - 0.21, FZ + 0.008], [0.036, 0.036, 0.004], RED, { rotation: [0, 0, 45] });
  // side marker doodles
  for (const s of [1, -1]) {
    box(chest, [s * (TW / 2 + 0.003), TY - 0.12, 0.05], [0.004, 0.08, 0.1], MARK);
    box(chest, [s * (TW / 2 + 0.005), TY - 0.12, 0.05], [0.004, 0.05, 0.07], s > 0 ? BLUE : RED);
  }
  // back: backpack-like smaller box w/ tubes
  box(chest, [0, TY + 0.02, -T - 0.05], [0.28, 0.3, 0.1], CARD_L);
  tapeStrip(chest, [0, TY + 0.02, -T - 0.05], [0.29, 0.04, 0.104]);
  for (const s of [1, -1]) {
    b.rod([s * 0.08, TY + 0.17, -T - 0.05], [s * 0.08, TY + 0.4, -T - 0.05], 0.025, FOIL_D, { bone: chest });
    cylZ(chest, [s * 0.08, TY + 0.4, -T - 0.05], 0.03, 0.02, RED, 8).mesh.rotation.x += 0;
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const ch = arms[n];
    const sh = [s * 0.2, 1.0, 0], el = [s * 0.5, 0.9, 0.0], wr = [s * 0.74, 0.76, 0.05];
    b.rod(sh, el, 0.058, SKIN, { bone: ch.joints[0] });
    b.rod([s * 0.27, 0.975, 0], [s * 0.5, 0.9, 0], 0.07, CARD_L, { bone: ch.joints[0] }); // towel-roll sleeve
    // sleeve rings
    for (const t of [0.3, 0.6, 0.9]) {
      const p = [sh[0] + (el[0] - sh[0]) * t + s * 0.05, sh[1] + (el[1] - sh[1]) * t - 0.01, 0];
      b.rod([p[0] - s * 0.008, p[1] + 0.0027, 0], [p[0] + s * 0.008, p[1] - 0.0027, 0], 0.074, CARD_D, { bone: ch.joints[0] });
    }
    ball(ch.joints[1], el, 0.065, FOIL_D, [1, 1, 1], 8);
    b.rod(el, wr, 0.066, FOIL, { bone: ch.joints[1] });
    // tape wrap at wrist
    b.rod([el[0] + (wr[0] - el[0]) * 0.8, el[1] + (wr[1] - el[1]) * 0.8, 0.0],
      [el[0] + (wr[0] - el[0]) * 0.9, el[1] + (wr[1] - el[1]) * 0.9, 0.0], 0.07, TAPE, { bone: ch.joints[1] });
    b.rod(
      [el[0] + (wr[0] - el[0]) * 0.35, el[1] + (wr[1] - el[1]) * 0.35, 0.0],
      [el[0] + (wr[0] - el[0]) * 0.45, el[1] + (wr[1] - el[1]) * 0.45, 0.0], 0.07, s > 0 ? RED : BLUE, { bone: ch.joints[1] });
    // glove mitten
    const hp = [wr[0] + s * 0.05, wr[1] - 0.02, wr[2] + 0.01];
    ball(ch.tip ?? ch.joints[2], hp, 0.052, GLOVE, [1.1, 0.85, 0.9]);
    ball(ch.tip ?? ch.joints[2], [hp[0] + s * 0.005, hp[1] - 0.005, hp[2] + 0.055], 0.028, GLOVE);
    for (let i = 0; i < 3; i++)
      box(ch.tip ?? ch.joints[2], [hp[0] + s * 0.07, hp[1] - 0.02 - i * 0.002 + 0.02 - i * 0.02, hp[2] - 0.02 + i * 0.02],
        [0.05, 0.022, 0.022], GLOVE, { rotation: [0, 0, s * -20] });
  }

  // ---------- helmet (box with face window) ----------
  const HY = 1.26, HS = 0.34, H = HS / 2, th = 0.012;
  box(head, [0, HY, -H], [HS, HS, th], CARD); // back
  box(head, [H, HY, 0], [th, HS, HS], CARD_L); // left side
  box(head, [-H, HY, 0], [th, HS, HS], CARD_L);
  box(head, [0, HY + H, 0], [HS, th, HS], CARD); // top
  // front frame around opening x±0.105, y HY-0.095..HY+0.085
  const fz = H;
  box(head, [0, HY + 0.13, fz], [HS, 0.08, th], CARD_L); // top band
  box(head, [0, HY - 0.14, fz], [HS, 0.06, th], CARD_L); // bottom band
  for (const s of [1, -1]) box(head, [s * 0.14, HY - 0.015, fz], [0.06, 0.2, th], CARD_L);
  // window inner rim (cut edge)
  box(head, [0, HY + 0.09, fz - 0.005], [0.24, 0.01, 0.02], CARD_D);
  box(head, [0, HY - 0.11, fz - 0.005], [0.24, 0.01, 0.02], CARD_D);
  for (const s of [1, -1]) box(head, [s * 0.11, HY - 0.01, fz - 0.005], [0.01, 0.2, 0.02], CARD_D);
  // foil visor trim
  box(head, [0, HY + 0.09 + 0.012, fz + 0.007], [0.26, 0.016, 0.006], FOIL);
  box(head, [0, HY - 0.12, fz + 0.007], [0.26, 0.016, 0.006], FOIL);
  for (const s of [1, -1]) box(head, [s * 0.125, HY - 0.015, fz + 0.007], [0.016, 0.22, 0.006], FOIL);
  // LED row on forehead band
  [RED, YEL, GRN, BLUE, RED].forEach((c, i) =>
    glow(cylZ(head, [-0.1 + i * 0.05, HY + 0.135, fz + 0.01], 0.013, 0.008, c, 8), 1.2));
  // chin vent
  for (let i = 0; i < 5; i++) box(head, [-0.06 + i * 0.03, HY - 0.14, fz + 0.007], [0.012, 0.035, 0.004], MARK);
  // side ear tubes
  for (const s of [1, -1]) {
    cylX(head, [s * (H + 0.04), HY, 0], 0.06, 0.08, CARD_D, 10);
    cylX(head, [s * (H + 0.082), HY, 0], 0.05, 0.012, FOIL, 10);
    cylX(head, [s * (H + 0.09), HY, 0], 0.02, 0.01, s > 0 ? RED : BLUE, 8);
    // marker bolt
    box(head, [s * (H + 0.008), HY + 0.12, -0.05], [0.004, 0.05, 0.05], MARK);
  }
  // tape cross on top
  tapeStrip(head, [0, HY + H + 0.004, 0], [0.07, 0.006, HS + 0.01]);
  tapeStrip(head, [0, HY + H + 0.006, 0.0], [HS + 0.01, 0.006, 0.05]);
  tapeStrip(head, [H + 0.004, HY + 0.05, -0.1], [0.006, 0.07, 0.08]);
  // antennae
  for (const s of [1, -1]) {
    const base = [s * 0.07, HY + H, -0.02];
    const mid = [s * 0.1, HY + H + 0.1, -0.02];
    const tip = [s * 0.12, HY + H + 0.2, -0.02];
    b.sweep(catmull([base, mid, tip]), 0.006, { color: FOIL_D, bone: head });
    ball(head, tip, 0.035, s > 0 ? RED : FOIL, [1, 1, 1], 8);
    glow(ball(head, [tip[0], tip[1] + 0.045, tip[2]], 0.012, YEL, [1, 1, 1], 6), 1.4);
    // bent spring
    b.sweep(polyline([[s * 0.07, HY + H, -0.02], [s * 0.08, HY + H + 0.03, -0.02], [s * 0.07, HY + H + 0.05, -0.02]]), 0.012, { color: BLUE, bone: head });
  }

  // ---------- kid face inside ----------
  const KY = 1.25;
  ball(head, [0, KY, 0.0], 0.095, SKIN, [1, 1.05, 1.0], 10);
  ball(head, [0, KY + 0.045, -0.015], 0.098, HAIR, [1.0, 0.95, 1.0], 8);
  // hair back & sides
  box(head, [0, KY + 0.0, -0.07], [0.19, 0.17, 0.06], HAIR);
  for (const s of [1, -1]) {
    box(head, [s * 0.094, KY + 0.015, -0.01], [0.015, 0.08, 0.1], HAIR);
    ball(head, [s * 0.098, KY - 0.015, 0.0], 0.026, SKIN, [0.4, 1, 0.8], 6);
  }
  // bangs
  for (let i = 0; i < 6; i++) {
    const x = -0.075 + i * 0.03;
    b.spike([x, KY + 0.085, 0.07], [x * 1.05 + (R() - 0.5) * 0.01, KY + 0.045, 0.1], null, 0.02, { color: HAIR, bone: head });
  }
  for (const s of [1, -1]) {
    // eyes
    ball(head, [s * 0.038, KY + 0.01, 0.083], 0.024, "#ffffff", [1, 1.1, 0.5], 8);
    ball(head, [s * 0.038, KY + 0.008, 0.093], 0.015, "#4a2f1c", [1, 1.1, 0.5], 8);
    ball(head, [s * 0.038, KY + 0.008, 0.099], 0.008, "#111", [1, 1.1, 0.4], 6);
    ball(head, [s * 0.033, KY + 0.017, 0.103], 0.005, "#fff", [1, 1, 0.5], 5);
    // brows
    box(head, [s * 0.04, KY + 0.045, 0.088], [0.04, 0.008, 0.008], HAIR, { rotation: [0, 0, s * 8] });
    // cheeks
    ball(head, [s * 0.06, KY - 0.03, 0.079], 0.016, "#f48f86", [1, 0.7, 0.3], 6);
  }
  ball(head, [0, KY - 0.012, 0.096], 0.014, SKIN_D, [1, 1, 1], 6);
  // upper lip / mouth line
  box(head, [0, KY - 0.047, 0.089], [0.04, 0.006, 0.006], "#a8453f");
  // lower jaw
  ball(jaw, [0, KY - 0.062, 0.03], 0.058, SKIN, [1, 0.55, 0.95], 8);
  box(jaw, [0, KY - 0.057, 0.079], [0.032, 0.007, 0.006], "#8a2f2b");

  b.root.name = "cardboard_robot_kid";
  return b.root;
}
```