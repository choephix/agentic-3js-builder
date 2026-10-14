import * as THREE from "three";
import { createBuilder, countershade, mottle, catmull, polyline, limb } from "../../../../src/index";

export const meta = {
  name: "Fruit Bat",
  description: "A stylized fruit bat at rest with its wings spread: big ears, finger-ribbed wing membranes, clawed thumbs and a jointed jaw.",
};

const FUR = "#6b4a35";
const FUR2 = "#8a6246";
const BELLY = "#b99572";
const WING = "#3e2f33";
const WING2 = "#5b4247";
const BONE = "#2c2024";
const PINK = "#c98a8a";
const DARK = "#15110f";
const CLAW = "#d8cbb0";

const mp = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

export default function build() {
  const b = createBuilder({ name: "bat" });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.075, -0.04], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.075, -0.04],
      [0, 0.08, 0.0],
      [0, 0.085, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.087, 0.04], dir: [0, 0.05, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.09, 0.07], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.015, down: 0.012 }),
    aim: head.local({ forward: 0.05, down: 0.014 }),
    role: "jaw",
  });

  const coat = countershade(mottle(FUR, FUR2, { size: 0.025, contrast: 0.6 }), BELLY, { level: -0.3, soft: 0.4 });

  // ---- body ----
  b.sweep(spine, [0.022, 0.034, 0.032, 0.02], { color: coat });
  b.capsule(spine.at(1).at, head, 0.022, { bone: neck, color: coat });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), coat, { bone: head, at: head.local({ forward: 0.008 }) });
  // muzzle and jaws
  b.frustumBox(head.local({ forward: 0.015 }), head.local({ forward: 0.056 }), [0.032, 0.026], [0.02, 0.016], {
    bone: head,
    color: FUR2,
  });
  b.frustumBox(jaw, jaw.local([0, 0.034, 0]), [0.022, 0.009], [0.012, 0.006], { bone: jaw, color: FUR2 });
  b.part(new THREE.SphereGeometry(0.007, 6, 4), DARK, { bone: head, at: head.local({ forward: 0.058, up: 0.004 }) });
  for (const s of [1, -1]) {
    // fangs
    b.spike(head.local({ left: s * 0.007, forward: 0.05, down: 0.009 }), [0, -1, 0.1], 0.012, 0.0028, {
      bone: head,
      color: CLAW,
    });
    // eyes
    const eye = b.part(new THREE.SphereGeometry(0.0075, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.018, forward: 0.022, up: 0.012 }),
    });
    b.part(new THREE.SphereGeometry(0.0025, 4, 3), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.021, forward: 0.028, up: 0.016 }),
    });
    void eye;
    // ears
    const ear = [
      [0, 0],
      [0.02, 0.006],
      [0.024, 0.055, "sharp"],
      [0.006, 0.034],
    ] as [number, number, "sharp"?][];
    b.extrude(ear as any, {
      at: head.local({ left: s * 0.015, up: 0.022 }),
      x: [s, 0.2, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: FUR,
      bone: head,
    });
    b.extrude(
      [
        [0.004, 0.006],
        [0.015, 0.01],
        [0.019, 0.045, "sharp"],
        [0.008, 0.032],
      ] as any,
      {
        at: head.local({ left: s * 0.015, up: 0.022 }),
        x: [s, 0.2, 0],
        y: [0, 1, 0],
        thickness: 0.0056,
        color: PINK,
        bone: head,
      },
    );
  }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.07, -0.06],
      [0, 0.066, -0.1],
      [0, 0.062, -0.15],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.009, 0.003], { color: FUR2 });

  const wingSkin = mottle(WING, WING2, { size: 0.05, contrast: 0.5 });

  // ---- limbs, wings ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // hind leg
    const hipPt: [number, number, number] = [s * 0.025, 0.07, -0.05];
    const footPt: [number, number, number] = [s * 0.05, 0.008, -0.09];
    const pts = limb(hipPt, footPt, [0.04, 0.045], [0, 0, -1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: footPt,
    });
    b.sweep(leg, [0.01, 0.005], { color: FUR2 });
    for (const k of [-1, 0, 1]) {
      b.spike(leg.tip!, [s * 0.5 + k * 0.5, -0.4, 1], 0.022, 0.0045, { color: CLAW });
    }

    // uropatagium between leg and tail
    b.membrane(polyline([pts[0], pts[2]]), polyline([[0, 0.07, -0.06], [0, 0.062, -0.15]]), {
      color: wingSkin,
      thickness: 0.002,
      bone: hips,
      rows: 3,
    });

    // arm
    const sh = [s * 0.03, 0.09, 0.03];
    const el = [s * 0.09, 0.105, 0.0];
    const wr = [s * 0.2, 0.11, 0.05];
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.011, 0.006], { color: FUR });
    b.spike(arm.tip!, [s * 0.3, 0.5, 0.8], 0.028, 0.005, { color: CLAW });

    // fingers
    const tips = [
      [s * 0.33, 0.1, 0.07],
      [s * 0.37, 0.095, -0.03],
      [s * 0.32, 0.09, -0.11],
      [s * 0.25, 0.085, -0.17],
    ];
    const fingers = tips.map((tip, i) => {
      const mid = mp(wr, tip, 0.5);
      mid[1] -= 0.004;
      const f = b.chain(`finger${i + 2}${S}`, polyline([wr, mid, tip]), {
        parent: arm.tip!,
        names: [`d${i + 2}a${S}`, `d${i + 2}b${S}`, `d${i + 2}c${S}`],
        role: "digit",
      });
      b.sweep(f, [0.004, 0.0015], { color: BONE });
      return f;
    });
    for (let i = 0; i < 3; i++) {
      b.membrane(fingers[i], fingers[i + 1], { color: wingSkin, thickness: 0.002, rows: 4 });
    }
    // body-side wing membrane
    b.membrane(fingers[3], [wr, [s * 0.04, 0.085, -0.03], [s * 0.03, 0.075, -0.055]], {
      color: wingSkin,
      thickness: 0.002,
      bone: hips,
      rows: 4,
    });
    // between arm and flank
    b.membrane([wr, [s * 0.04, 0.085, -0.03]], [wr, el, sh], {
      color: wingSkin,
      thickness: 0.002,
      bone: arm.joints[0],
      rows: 3,
    });
  }

  return b.root;
}
