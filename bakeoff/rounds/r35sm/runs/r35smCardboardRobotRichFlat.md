```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cardboard Robot Kid",
  description:
    "A kid in a homemade cardboard-box robot costume: box torso with a control panel, a box helmet with a face window, foil-wrapped sleeves and a toilet-roll-ear helmet. Craft style, rigged rest pose.",
};

const CARD = "#b98a55";
const CARD_D = "#9c7040";
const CARD_L = "#d2ad74";
const TAPE = "#e9d9a6";
const FOIL = "#c9ced6";
const FOIL_D = "#8e95a3";
const RED = "#d9473a";
const BLUE = "#3e7bd0";
const YEL = "#f2c230";
const GRN = "#4caf50";
const INKC = "#222222";
const SKIN = "#f0c09a";
const HAIR = "#5a3a22";
const SHIRT = "#3b8f9e";
const PANTS = "#3a4a7a";
const WHITE = "#f4f1ea";
const PINK = "#e9908a";

export default function build() {
  const b = createBuilder({ name: "cardboardRobotKid" });
  const rand = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.52, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.78, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.98, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.1, 0], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.09, 0.02], dir: [0, 0, 1], role: "jaw" });

  // ---------- helpers ----------
  const box = (bone: any, size: number[], at: number[], color: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, rotation: rot });
  const cyl = (bone: any, r: number, h: number, at: number[], color: string, dir: number[], seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });
  const ball = (bone: any, r: number, at: number[], color: string, scale?: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, scale });
  // a strip of masking tape
  const tape = (bone: any, size: number[], at: number[], rot?: number[]) => box(bone, size, at, TAPE, rot);

  // ---------- hips / shorts ----------
  box(hips, [0.3, 0.14, 0.2], [0, 0.54, 0], PANTS);
  box(hips, [0.31, 0.03, 0.21], [0, 0.6, 0], RED); // waistband
  ball(hips, 0.012, [0, 0.54, 0.105], YEL);

  // ---------- torso: the cardboard box ----------
  const TW = 0.44, TH = 0.44, TD = 0.3, TY = 0.78;
  box(chest, [TW, TH, TD], [0, TY, 0], CARD);
  // lid flaps folded at the top rim and a bottom rim
  box(chest, [TW + 0.02, 0.014, 0.05], [0, TY + TH / 2, TD / 2 - 0.02], CARD_L);
  box(chest, [TW + 0.02, 0.014, 0.05], [0, TY + TH / 2, -TD / 2 + 0.02], CARD_L);
  box(chest, [TW + 0.02, 0.014, 0.05], [0, TY - TH / 2, TD / 2 - 0.02], CARD_D);
  // shoulders hole in the top: kid's shirt peeks out
  box(chest, [0.3, 0.012, 0.16], [0, TY + TH / 2 + 0.003, 0], SHIRT);
  // tape on the vertical corners and across the top
  for (const s of [1, -1]) {
    tape(chest, [0.05, TH - 0.02, 0.006], [s * (TW / 2 - 0.02), TY, TD / 2 + 0.003]);
    tape(chest, [0.006, TH - 0.02, 0.05], [s * (TW / 2 + 0.003), TY, TD / 2 - 0.02]);
    // arm holes with dark insides and torn edge
    cyl(chest, 0.062, 0.012, [s * (TW / 2 + 0.002), 0.9, 0], INKC, [s, 0, 0], 10);
    cyl(chest, 0.072, 0.008, [s * (TW / 2 + 0.001), 0.9, 0], CARD_D, [s, 0, 0], 10);
    cyl(chest, 0.062, 0.016, [s * (TW / 2 + 0.006), 0.9, 0], INKC, [s, 0, 0], 10);
    // side marker stripes
    for (let i = 0; i < 3; i++) box(chest, [0.004, 0.012, 0.1 - i * 0.02], [s * (TW / 2 + 0.002), 0.7 - i * 0.04, 0.0], INKC);
  }
  tape(chest, [0.18, 0.006, 0.05], [0, TY + TH / 2 + 0.009, 0.0], [0, 0, 0]);

  // control panel (front, z = 0.15)
  const FZ = TD / 2;
  box(chest, [0.3, 0.26, 0.012], [0, 0.82, FZ + 0.006], FOIL_D);
  box(chest, [0.28, 0.24, 0.008], [0, 0.82, FZ + 0.012], FOIL);
  // screen
  const SCREEN = svg(
    `<svg viewBox="0 0 40 24"><rect width="40" height="24" rx="3" fill="#0e2a16"/>
     <rect x="4" y="4" width="5" height="5" fill="#7dff9a"/><rect x="31" y="4" width="5" height="5" fill="#7dff9a"/>
     <path d="M8 15 Q20 24 32 15" stroke="#7dff9a" stroke-width="2.4" fill="none"/>
     <path d="M2 21 H12 M28 21 H38" stroke="#3fae5a" stroke-width="1.2"/></svg>`,
    { size: 192 },
  );
  box(chest, [0.2, 0.12, 0.012], [0, 0.88, FZ + 0.02], INKC);
  glow(
    b.part(new THREE.PlaneGeometry(0.18, 0.1), "#ffffff", { bone: chest, at: [0, 0.88, FZ + 0.0275], dir: [0, 0, 1], axis: "z", texture: SCREEN }),
    1.2,
  );
  // buttons
  const bcols = [RED, YEL, GRN, BLUE];
  bcols.forEach((c, i) => {
    const x = -0.09 + i * 0.06;
    cyl(chest, 0.022, 0.014, [x, 0.79, FZ + 0.02], INKC, [0, 0, 1], 10);
    cyl(chest, 0.019, 0.02, [x, 0.79, FZ + 0.024], c, [0, 0, 1], 10);
  });
  // dial with needle
  cyl(chest, 0.034, 0.012, [-0.085, 0.725, FZ + 0.02], WHITE, [0, 0, 1], 12);
  cyl(chest, 0.037, 0.008, [-0.085, 0.725, FZ + 0.016], INKC, [0, 0, 1], 12);
  box(chest, [0.006, 0.026, 0.004], [-0.079, 0.733, FZ + 0.028], RED, [0, 0, -35]);
  // slider
  box(chest, [0.09, 0.012, 0.006], [0.07, 0.73, FZ + 0.02], INKC);
  box(chest, [0.014, 0.03, 0.01], [0.085, 0.73, FZ + 0.026], RED);
  // lightning bolt (black outline then glowing yellow)
  const bolt = [[0.012, 0.06], [-0.032, -0.004], [0.0, -0.004], [-0.016, -0.06], [0.036, 0.014], [0.006, 0.014]];
  b.extrude(bolt.map((p) => [p[0] * 1.35, p[1] * 1.35] as [number, number]), { at: [0.0, 0.64, FZ + 0.003], x: [1, 0, 0], thickness: 0.006, color: INKC, bone: chest });
  glow(b.extrude(bolt as any, { at: [0, 0.64, FZ + 0.006], x: [1, 0, 0], thickness: 0.006, color: YEL, bone: chest }), 1);
  // vent slats at the bottom
  for (let i = 0; i < 4; i++) box(chest, [0.2, 0.01, 0.006], [0.0, 0.595 + i * 0.02, FZ + 0.004], INKC);
  // crayon scribbled gears-ish doodles on back left
  cyl(chest, 0.04, 0.006, [0, 0.8, -FZ - 0.003], RED, [0, 0, -1], 8);
  cyl(chest, 0.026, 0.008, [0, 0.8, -FZ - 0.004], CARD_L, [0, 0, -1], 8);
  tape(chest, [0.2, 0.05, 0.006], [0, 0.66, -FZ - 0.004], [0, 0, 8]);

  // backpack box
  box(chest, [0.26, 0.28, 0.12], [0, 0.82, -FZ - 0.07], CARD_D);
  box(chest, [0.27, 0.014, 0.13], [0, 0.96, -FZ - 0.07], CARD_L);
  for (const s of [1, -1]) {
    cyl(chest, 0.032, 0.3, [s * 0.07, 0.84, -FZ - 0.16], FOIL, [0, 1, 0], 8);
    for (const dy of [-0.1, 0.1]) cyl(chest, 0.035, 0.02, [s * 0.07, 0.84 + dy, -FZ - 0.16], TAPE, [0, 1, 0], 8);
  }
  box(chest, [0.24, 0.02, 0.01], [0, 0.72, -FZ - 0.14], RED);

  // ---------- neck, head, face ----------
  cyl(neck, 0.04, 0.12, [0, 1.02, 0], SKIN, [0, 1, 0], 8);
  const HY = 1.14;
  b.part(new THREE.SphereGeometry(0.1, 12, 9), SKIN, { bone: head, at: [0, HY, 0], scale: [1, 1.04, 1] });
  // hair: cap + fringe
  b.part(new THREE.SphereGeometry(0.108, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), HAIR, { bone: head, at: [0, HY + 0.005, -0.01] });
  for (let i = -3; i <= 3; i++) {
    box(head, [0.032, 0.05 + 0.012 * ((i + 3) % 2), 0.02], [i * 0.028, HY + 0.085, 0.082 - Math.abs(i) * 0.008], HAIR, [0, i * -6, i * 4]);
  }
  for (const s of [1, -1]) {
    ball(head, 0.022, [s * 0.1, HY, -0.005], SKIN, [0.5, 1, 0.8]); // ears
    // eyes
    ball(head, 0.021, [s * 0.04, HY + 0.01, 0.088], WHITE, [1, 1.1, 0.7]);
    ball(head, 0.012, [s * 0.04, HY + 0.008, 0.099], INKC, [1, 1.1, 0.5]);
    ball(head, 0.004, [s * 0.044, HY + 0.014, 0.106], WHITE);
    box(head, [0.04, 0.009, 0.012], [s * 0.042, HY + 0.045, 0.093], HAIR, [0, 0, -s * 10]); // brows
    ball(head, 0.015, [s * 0.065, HY - 0.025, 0.083], PINK, [1, 0.6, 0.3]); // cheeks
    for (let i = 0; i < 3; i++) ball(head, 0.003, [s * (0.035 + i * 0.012), HY - 0.015 + (i % 2) * 0.008, 0.099], "#c98a62");
  }
  ball(head, 0.014, [0, HY - 0.018, 0.1], "#e8a98a", [1, 0.9, 0.9]); // nose
  box(head, [0.062, 0.014, 0.012], [0, HY - 0.052, 0.093], "#5a1f1f"); // mouth cavity (upper)
  box(head, [0.056, 0.008, 0.01], [0, HY - 0.043, 0.098], WHITE); // top teeth
  // lower jaw
  const jawY = HY - 0.075;
  box(jaw, [0.1, 0.03, 0.075], [0, jawY, 0.06], SKIN);
  box(jaw, [0.055, 0.008, 0.01], [0, jawY + 0.016, 0.099], PINK);
  ball(jaw, 0.03, [0, jawY - 0.004, 0.09], SKIN, [1.3, 0.7, 0.8]);
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  // ---------- cardboard helmet ----------
  const HX = 0.19, HB = 1.0, HT = 1.34, HHZ = 0.18, TH2 = 0.012;
  const HC = (HB + HT) / 2, HH = HT - HB;
  box(head, [TH2, HH, HHZ * 2], [HX, HC, 0], CARD); // sides
  box(head, [TH2, HH, HHZ * 2], [-HX, HC, 0], CARD);
  box(head, [HX * 2, HH, TH2], [0, HC, -HHZ], CARD_D); // back
  box(head, [HX * 2 + TH2, TH2, HHZ * 2], [0, HT, 0], CARD_L); // top
  // front frame around face window (x ±.13, y 1.03–1.25)
  box(head, [HX * 2 + TH2, HT - 1.25, TH2], [0, (HT + 1.25) / 2, HHZ], CARD);
  box(head, [HX * 2 + TH2, 1.03 - HB, TH2], [0, (HB + 1.03) / 2, HHZ], CARD);
  for (const s of [1, -1]) {
    box(head, [HX - 0.13 + TH2, 0.22, TH2], [s * (0.13 + HX) / 2, 1.14, HHZ], CARD);
    // window edge thickness
    box(head, [0.008, 0.22, 0.03], [s * 0.13, 1.14, HHZ - 0.012], CARD_D);
    // ear toilet-roll tubes
    cyl(head, 0.05, 0.1, [s * (HX + 0.05), HC - 0.02, 0.0], FOIL, [s, 0, 0], 10);
    cyl(head, 0.052, 0.012, [s * (HX + 0.05), HC - 0.02, 0.0], TAPE, [s, 0, 0], 10);
    cyl(head, 0.052, 0.012, [s * (HX + 0.097), HC - 0.02, 0.0], RED, [s, 0, 0], 10);
    cyl(head, 0.02, 0.012, [s * (HX + 0.1), HC - 0.02, 0.0], INKC, [s, 0, 0], 8);
    // glowing indicator lights on the forehead bar
    glow(cyl(head, 0.024, 0.012, [s * 0.12, 1.295, HHZ + 0.008], s > 0 ? RED : GRN, [0, 0, 1], 10), 1.3);
    cyl(head, 0.03, 0.008, [s * 0.12, 1.295, HHZ + 0.004], INKC, [0, 0, 1], 10);
    // folded top flaps
    box(head, [0.18, 0.012, 0.36], [s * 0.255, HT + 0.025, 0], s > 0 ? CARD_L : CARD, [0, 0, s * 35]);
    // tape corners
    tape(head, [0.03, 0.09, 0.004], [s * 0.17, 1.295, HHZ + 0.004]);
  }
  // forehead grille
  for (let i = 0; i < 3; i++) box(head, [0.1, 0.008, 0.004], [0, 1.31 - i * 0.02, HHZ + 0.004], INKC);
  // side chin vents
  for (let i = 0; i < 4; i++) box(head, [0.012, 0.008, 0.004], [-0.06 + i * 0.04, 1.015, HHZ + 0.004], INKC);
  // antennas
  for (const s of [1, -1]) {
    const base: number[] = [s * 0.08, HT + 0.005, -0.02];
    const tip: number[] = [s * 0.13, HT + 0.16, -0.04];
    b.rod(base, tip, 0.008, FOIL, { bone: head });
    ball(head, 0.025, tip, s > 0 ? RED : YEL);
    cyl(head, 0.018, 0.02, base, INKC, [0, 1, 0], 8);
  }
  // wobbly spring on one antenna: rings
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.TorusGeometry(0.014, 0.003, 4, 8), FOIL_D, {
      bone: head, at: [0.088 + i * 0.011, HT + 0.03 + i * 0.03, -0.0 - i * 0.004], dir: [0, 1, 0], axis: "z",
    });
  }
  // helmet scuff / paint dabs, hand-drawn
  for (let i = 0; i < 5; i++) {
    const x = -0.12 + rand() * 0.24;
    ball(head, 0.008 + rand() * 0.006, [x, HT + 0.0075, -0.12 + rand() * 0.2], i % 2 ? RED : BLUE, [1, 0.2, 1]);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = [s * 0.2, 0.9, 0.0], el = [s * 0.34, 0.74, 0.03], wr = [s * 0.46, 0.58, 0.07];
    const arm = b.chain(`arm${side}`, [sh, el, wr], {
      parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm",
    });
    b.sweep(arm, 0.046, { sides: 6, smooth: false, bands: [[0.4, SHIRT], [1, FOIL]] });
    // foil crinkle rings
    b.along(arm, 3, (p: any) => {
      b.part(new THREE.TorusGeometry(0.048, 0.006, 4, 8), FOIL_D, { bone: p.bone, at: p.at, dir: p.tangent, axis: "z" });
    }, { from: 0.45, to: 1 });
    // cardboard cuff
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8), RED, { bone: arm.tip!, at: [wr[0] - s * 0.012, wr[1] + 0.012, wr[2] - 0.003], dir: [s * 0.35, -0.9, 0.2] });
    // hand
    const w = arm.tip!;
    box(w, [0.06, 0.05, 0.03], [wr[0] + s * 0.02, wr[1] - 0.04, wr[2] + 0.005], SKIN, [0, 0, s * 20]);
    for (let i = 0; i < 4; i++) {
      box(w, [0.012, 0.045, 0.014], [wr[0] + s * (0.035 + i * 0.0 + 0.0) + s * (i - 1.5) * 0.002 + s * 0.012 - s * 0.01 * 0 + s * (i - 1.5) * 0.006, wr[1] - 0.09 - (i === 1 || i === 2 ? 0.006 : 0), wr[2] + 0.005], SKIN, [0, 0, s * 20]);
    }
    box(w, [0.014, 0.04, 0.016], [wr[0] - s * 0.012, wr[1] - 0.065, wr[2] + 0.02], SKIN, [0, 0, -s * 30]);
    // elbow pad
    box(arm.joints[1], [0.07, 0.07, 0.07], [el[0] + s * 0.012, el[1] + 0.005, el[2] - 0.045], CARD_D, [0, 0, s * 25]);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [[s * 0.08, 0.52, 0], [s * 0.085, 0.29, 0.015], [s * 0.09, 0.08, 0]],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, 0.052, { sides: 6, smooth: false, bands: [[0.55, PANTS], [1, FOIL]] });
    // knee pad
    box(leg.joints[1], [0.085, 0.07, 0.04], [s * 0.085, 0.29, 0.065], CARD, [0, 0, 0]);
    tape(leg.joints[1], [0.04, 0.012, 0.006], [s * 0.085, 0.29, 0.087]);
    // shoe
    box(leg.tip!, [0.092, 0.065, 0.17], [s * 0.09, 0.052, 0.045], RED);
    box(leg.tip!, [0.098, 0.022, 0.18], [s * 0.09, 0.011, 0.045], WHITE);
    ball(leg.tip!, 0.04, [s * 0.09, 0.056, 0.115], RED, [1.1, 0.8, 0.9]);
    box(leg.tip!, [0.07, 0.012, 0.05], [s * 0.09, 0.088, 0.03], WHITE);
    for (let i = 0; i < 3; i++) box(leg.tip!, [0.05, 0.005, 0.008], [s * 0.09, 0.095, 0.06 + i * 0.018], WHITE);
  }

  return b.root;
}
```