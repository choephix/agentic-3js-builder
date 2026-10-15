import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { gradient, mottle } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description:
    "A gray wolf standing alert, Blizzard/Warcraft style: heavy shoulders, oversized head and paws, painted cel coat with cream belly, fur ruff cards and a dark-tipped bushy tail.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "grayWolf" });

  // ---- palette -------------------------------------------------------------------------------------------------
  const BELLY = "#e9dfc9";
  const TAN = "#a98d66";
  const DARKTIP = "#2c2e35";
  const CLAW = "#2a2326";
  const TOOTH = "#f4efe0";
  const DORSAL = mottle("#3e424a", "#5e636c", { size: 0.09, seed: 2 });
  const FLANK = mottle("#7d8189", "#a1a3a1", { size: 0.1, seed: 5 });
  const RUFF = mottle("#8a8e95", "#b9b9b3", { size: 0.08, seed: 9 });
  const flankBelly = furEdge(FLANK, BELLY, { level: -0.5, teeth: 0.22, period: 0.035 });
  const COAT = cel(furEdge(DORSAL, flankBelly, { level: 0.45, teeth: 0.3, period: 0.04 }));
  const CHEST = cel(furEdge(BELLY, flankBelly, { axis: [0, 0, 1], level: 0.3, teeth: 0.3, period: 0.03, along: [1, 0, 0] }));
  const THIGH = cel(furEdge(FLANK, TAN, { level: -0.6, teeth: 0.2, period: 0.04 }));
  const LEG = cel(furEdge(FLANK, TAN, { by: "position", level: 0.42, teeth: 0.06, period: 0.03 }));
  const PAW = cel("#6b5d50");
  const HEADP = cel(
    furEdge(mottle("#686c73", "#8c8f93", { size: 0.05, seed: 8 }), BELLY, {
      by: "position",
      axis: [0, 1, 0],
      level: 1.03,
      teeth: 0.018,
      period: 0.028,
    }),
  );
  const CHEEK = cel("#c9c3b4");
  const JAWP = cel("#d9d1bd");
  const EAR = cel("#565a62");
  const TAILC = gradient(FLANK, DARKTIP, [0, 0.55, -1.0], [0, 0.4, -1.09]);

  // ---- textures --------------------------------------------------------------------------------------------------
  const TUFT = svg(
    `<svg viewBox="0 0 32 64">
      <path d="M16 0 C20 14 30 30 26 64 L6 64 C2 30 12 14 16 0Z" fill="#ffffff"/>
      <path d="M16 6 C17 24 17 44 16 64" stroke="#c4c4c4" stroke-width="3" fill="none"/>
      <path d="M10 44 L16 22 M22 46 L16 26" stroke="#dcdcdc" stroke-width="2.4" fill="none"/>
    </svg>`,
    { size: 128 },
  );

  // ---- skeleton --------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.78, -0.3], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.79, -0.18],
      [0, 0.8, 0.02],
      [0, 0.8, 0.24],
      [0, 0.84, 0.44],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.84, 0.44],
      [0, 0.96, 0.62],
      [0, 1.07, 0.8],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.07, 0.8], dir: [0, -0.15, 1], role: "head" });
  const HY = 1.07;
  const HZ = 0.8;
  const HP = (x: number, y: number, z: number): [number, number, number] => [x, HY + y, HZ + z];
  const jaw = b.joint("jaw", { parent: head, at: HP(0, -0.07, 0.07), aim: HP(0, -0.085, 0.36), role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.3],
      [0, 0.77, -0.6],
      [0, 0.68, -0.86],
      [0, 0.52, -1.03],
      [0, 0.37, -1.1],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---- body --------------------------------------------------------------------------------------------------------
  const body = b.loft(
    [
      { at: [0, 0.78, -0.52], w: 0.24, h: 0.27 },
      { at: [0, 0.79, -0.3], w: 0.3, h: 0.33 },
      { at: [0, 0.79, 0.0], w: 0.3, h: 0.34 },
      { at: [0, 0.77, 0.25], w: 0.36, h: 0.44 },
      { at: [0, 0.82, 0.46], w: 0.35, h: 0.43 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  const neckSw = b.sweep(neck, [0.145, 0.125, 0.108, 0.1], { color: COAT });
  const chest = b.part(new THREE.SphereGeometry(1, 10, 8), CHEST, {
    bone: spine.joints[2],
    at: [0, 0.7, 0.42],
    scale: [0.17, 0.24, 0.2],
  });
  const tailSw = b.sweep(tail, [0.07, 0.1, 0.115, 0.1, 0.035], { color: cel(TAILC) });

  // ---- legs --------------------------------------------------------------------------------------------------------
  const thighParts: THREE.Mesh[] = [];
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front leg
    const fl = limb(
      [s * 0.14, 0.72, 0.36],
      [s * 0.14, 0.05, 0.42],
      [0.3, 0.28, 0.18],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fc = b.chain(`legF${side}`, fl, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [s * 0.14, 0, 0.5],
    });
    legSweeps.push(b.sweep(fc, [0.085, 0.065, 0.048, 0.042, 0.045], { color: LEG }));
    b.part(new THREE.SphereGeometry(1, 10, 8), cel(FLANK), {
      bone: fc.joints[0],
      at: [s * 0.15, 0.74, 0.38],
      scale: [0.1, 0.17, 0.15],
    });
    // hind leg
    const hl = limb(
      [s * 0.14, 0.74, -0.34],
      [s * 0.15, 0.05, -0.44],
      [0.3, 0.3, 0.26],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hc = b.chain(`legH${side}`, hl, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.15, 0, -0.4],
    });
    legSweeps.push(b.sweep(hc, [0.115, 0.085, 0.055, 0.04, 0.045], { color: LEG }));
    const thigh = b.part(new THREE.SphereGeometry(1, 10, 8), THIGH, {
      bone: hc.joints[0],
      at: [s * 0.16, 0.68, -0.36],
      scale: [0.105, 0.17, 0.17],
    });
    thighParts.push(thigh.mesh);

    // paws: pad, toes, claws
    const paws: Array<[THREE.Object3D | never, number, number, typeof fc]> = [];
    paws.push([hips.object, s * 0.15, -0.4, hc]);
    paws.push([hips.object, s * 0.14, 0.46, fc]);
    for (const [, x, z, chain] of paws) {
      const tip = chain.joints[3];
      b.part(new THREE.SphereGeometry(1, 8, 6), PAW, { bone: tip, at: [x, 0.04, z], scale: [0.058, 0.04, 0.09] });
      for (const i of [-1, 0, 1]) {
        const tx = x + i * 0.032;
        b.part(new THREE.SphereGeometry(0.022, 6, 4), PAW, {
          bone: tip,
          at: [tx, 0.028, z + 0.075],
          scale: [1, 0.9, 1.2],
        });
        b.spike([tx, 0.02, z + 0.1], [0, -0.2, 1], 0.045, 0.012, CLAW, { bone: tip, sides: 5 });
      }
    }
  }

  // ---- head --------------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, {
    bone: head,
    at: HP(0, 0.02, 0.06),
    scale: [0.125, 0.115, 0.14],
  });
  b.sweep([HP(0, 0.0, 0.12), HP(0, -0.03, 0.4)], {
    radius: (t: number) => [0.075 - 0.037 * t, 0.06 - 0.025 * t],
    bone: head,
    color: HEADP,
    caps: "round",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#1d1a1f", {
    bone: head,
    at: HP(0, -0.028, 0.405),
    scale: [0.042, 0.03, 0.032],
  });
  b.part(new THREE.SphereGeometry(0.007, 5, 4), "#7a808c", { bone: head, at: HP(0, -0.012, 0.425) });
  // mouth roof, jaw, tongue
  b.sweep([HP(0, -0.055, 0.12), HP(0, -0.055, 0.34)], {
    radius: [0.045, 0.012],
    bone: head,
    color: "#5a2430",
    caps: "flat",
  });
  b.sweep([HP(0, -0.085, 0.08), HP(0, -0.082, 0.36)], {
    radius: (t: number) => [0.055 - 0.025 * t, 0.026 - 0.004 * t],
    bone: jaw,
    color: JAWP,
    caps: "round",
  });
  b.sweep([HP(0, -0.07, 0.1), HP(0, -0.072, 0.3)], {
    radius: [0.022, 0.012],
    bone: jaw,
    color: "#c4566a",
    caps: "round",
  });
  for (const s of [1, -1]) {
    // teeth
    b.spike(HP(s * 0.032, -0.058, 0.355), [0, -1, 0.15], 0.05, 0.011, TOOTH, { bone: head, sides: 5 });
    b.spike(HP(s * 0.04, -0.056, 0.3), [0, -1, 0.1], 0.025, 0.008, TOOTH, { bone: head, sides: 5 });
    b.spike(HP(s * 0.045, -0.055, 0.25), [0, -1, 0.1], 0.022, 0.008, TOOTH, { bone: head, sides: 5 });
    b.spike(HP(s * 0.026, -0.07, 0.34), [0, 1, 0.1], 0.04, 0.009, TOOTH, { bone: jaw, sides: 5 });
    b.spike(HP(s * 0.034, -0.07, 0.28), [0, 1, 0.05], 0.022, 0.008, TOOTH, { bone: jaw, sides: 5 });
    // ink lip line
    b.rod(HP(s * 0.04, -0.062, 0.15), HP(s * 0.032, -0.066, 0.37), 0.006, INK, { bone: head, sides: 4 });
    // cheek ruff
    b.spike(HP(s * 0.1, -0.03, 0.04), [s * 0.5, -0.35, -1], 0.13, 0.042, CHEEK, { bone: head, sides: 5 });
    b.spike(HP(s * 0.09, -0.06, 0.08), [s * 0.6, -0.5, -0.8], 0.1, 0.034, CHEEK, { bone: head, sides: 5 });
    b.spike(HP(s * 0.085, -0.08, 0.02), [s * 0.4, -0.7, -0.8], 0.09, 0.03, CHEEK, { bone: head, sides: 5 });
    // eye
    const eyeAt = HP(s * 0.085, 0.06, 0.145);
    glow(
      b.part(new THREE.SphereGeometry(1, 8, 6), "#f0a920", {
        bone: head,
        at: eyeAt,
        scale: [0.014, 0.022, 0.028],
        rotation: [0, s * 25, 0],
      }),
      0.6,
    );
    b.part(new THREE.SphereGeometry(0.009, 6, 4), "#0c0a0d", {
      bone: head,
      at: HP(s * 0.093, 0.06, 0.16),
    });
    b.part(new THREE.SphereGeometry(0.004, 4, 3), "#ffffff", {
      bone: head,
      at: HP(s * 0.096, 0.067, 0.165),
    });
    b.rod(HP(s * 0.09, 0.085, 0.115), HP(s * 0.07, 0.062, 0.195), 0.01, INK, { bone: head, sides: 5 });
    b.rod(HP(s * 0.075, 0.04, 0.18), HP(s * 0.05, -0.02, 0.3), 0.005, INK, { bone: head, sides: 4 });
    // brow ridge
    b.rod(HP(s * 0.06, 0.098, 0.1), HP(s * 0.04, 0.09, 0.2), 0.014, cel("#4d5158"), { bone: head, sides: 5 });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.rod(HP(s * 0.05, -0.03 - k * 0.006, 0.33), HP(s * (0.14 + k * 0.01), -0.05 - k * 0.02, 0.29 - k * 0.03), 0.003, "#d8d4c8", {
        bone: head,
        sides: 4,
      });
    // ear
    const earAt = HP(s * 0.075, 0.1, 0.0);
    const earJ = b.joint(`ear${s > 0 ? "L" : "R"}`, { parent: head, at: earAt, dir: [s * 0.3, 1, 0.08], role: "hinge" });
    const ear = b.extrude(
      [
        [-0.06, 0],
        [0.06, 0],
        [0.035, 0.13],
        [0.0, 0.21, "sharp"],
        [-0.035, 0.13],
      ],
      { at: earAt, x: [1, 0, 0], y: [s * 0.3, 1, 0.08], thickness: 0.03, bevel: 0.006, color: EAR, bone: earJ },
    );
    b.extrude(
      [
        [-0.035, 0],
        [0.035, 0],
        [0.018, 0.1],
        [0.0, 0.15, "sharp"],
      ],
      {
        at: ear.local([0, 0.012, 0.0165]),
        x: [1, 0, 0],
        y: [s * 0.3, 1, 0.08],
        thickness: 0.006,
        color: "#d4a08e",
        bone: earJ,
      },
    );
  }
  // scar over the left eye
  b.rod(HP(0.1, 0.12, 0.13), HP(0.06, 0.0, 0.2), 0.004, "#d9d2c4", { bone: head, sides: 4 });

  // ---- fur cards ---------------------------------------------------------------------------------------------------
  const neckHits = b.surface(neckSw).scatter(220, { rng: rng(11), minDist: 0.028, filter: (h) => h.n.y > -0.5 });
  b.cards(neckHits, TUFT, { size: [0.06, 0.13], lean: 55, bend: 25, vary: 0.3, spin: 15, rng: rng(12), color: RUFF });
  const bibHits = b.surface(chest).scatter(70, { rng: rng(13), minDist: 0.03, filter: (h) => h.n.z > 0.2 && h.n.y < 0.5 });
  b.cards(bibHits, TUFT, {
    size: [0.05, 0.1],
    lean: 50,
    bend: 20,
    vary: 0.25,
    flow: [0, -1, -0.2],
    rng: rng(14),
    color: BELLY,
  });
  const maneHits = b.surface(body).scatter(150, {
    rng: rng(15),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.55 && h.at.z > -0.2,
  });
  b.cards(maneHits, TUFT, { size: [0.05, 0.11], lean: 35, bend: 20, vary: 0.3, spin: 12, rng: rng(16), color: DORSAL });
  const neckMane = b.surface(neckSw).scatter(60, { rng: rng(17), minDist: 0.03, filter: (h) => h.n.y > 0.5 });
  b.cards(neckMane, TUFT, { size: [0.05, 0.11], lean: 35, bend: 20, vary: 0.3, rng: rng(18), color: DORSAL });
  const tailHits = b.surface(tailSw).scatter(150, { rng: rng(19), minDist: 0.03 });
  b.cards(tailHits, TUFT, { size: [0.07, 0.14], lean: 40, bend: 20, vary: 0.3, spin: 10, rng: rng(20), color: TAILC });
  for (const [i, m] of thighParts.entries()) {
    const hits = b.surface(m).scatter(40, { rng: rng(30 + i), minDist: 0.035, filter: (h) => h.n.z < -0.2 });
    b.cards(hits, TUFT, {
      size: [0.05, 0.1],
      lean: 60,
      bend: 15,
      vary: 0.25,
      flow: [0, -1, -0.3],
      rng: rng(40 + i),
      color: FLANK,
    });
  }
  for (const [i, sw] of legSweeps.entries()) {
    const hits = b.surface(sw).scatter(24, { rng: rng(50 + i), minDist: 0.04, filter: (h) => h.n.z < -0.3 && h.at.y > 0.3 });
    b.cards(hits, TUFT, {
      size: [0.04, 0.08],
      lean: 60,
      bend: 15,
      vary: 0.25,
      flow: [0, -1, -0.3],
      rng: rng(60 + i),
      color: FLANK,
    });
  }

  // slightly open mouth to show the fangs
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  return b.root;
}
