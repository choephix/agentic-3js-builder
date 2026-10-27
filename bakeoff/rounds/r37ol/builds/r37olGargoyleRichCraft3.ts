import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  mottle,
  countershade,
  spots,
  frame,
} from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouched gothic stone gargoyle perched on a carved cathedral ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = mottle("#62636a", "#34353c", { size: 0.19, contrast: 1.25, seed: 21 });
  const STONE_LIGHT = mottle("#85858a", "#4b4c52", { size: 0.13, contrast: 1.1, seed: 8 });
  const BELLY = countershade(STONE_LIGHT, "#292a31", { level: -0.2, soft: 0.28 });
  const CREVICE = "#17171d";
  const EYE = "#b9bdc8";
  const IRIS = "#191b25";
  const IRON = "#292a30";
  const MOSS = "#58684e";
  const LEDGE = mottle("#4d4d53", "#25262c", { size: 0.24, contrast: 1.1, seed: 44 });

  const box = (size: [number, number, number], at: THREE.Vector3 | [number, number, number], color: any, bone?: any, bevel = 0) => {
    const g = new THREE.BoxGeometry(...size);
    if (bevel > 0) {
      // subtle faceting is more appropriate than a smooth bevel for carved stone
      g.translate(0, 0, 0);
    }
    return b.part(g, color, { at, bone, flat: true });
  };
  const orb = (r: number, at: any, color: any, bone?: any, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(5, Math.floor(seg * 0.75))), color, {
      at,
      bone,
      flat: true,
    });

  // ---------------------------------------------------------------------------
  // Ledge and architectural footing: simple, heavy, and subordinate to the hero.
  // ---------------------------------------------------------------------------
  box([1.95, 0.18, 0.72], [0, 0.09, 0], LEDGE);
  box([1.72, 0.13, 0.58], [0, 0.235, 0.025], STONE);
  box([1.42, 0.10, 0.50], [0, 0.35, 0.05], "#393a40");

  // carved underside blocks
  for (const x of [-0.76, -0.38, 0, 0.38, 0.76]) {
    box([0.22, 0.22, 0.44], [x, -0.02, -0.03], LEDGE);
    orb(0.08, [x, 0.12, 0.22], STONE_LIGHT, undefined, 6);
  }
  // moss only where it reads as old masonry
  for (const x of [-0.67, -0.4, 0.21, 0.58]) {
    b.part(new THREE.ConeGeometry(0.035, 0.10 + (Math.abs(x) % 0.05), 5), MOSS, {
      at: [x, 0.39, 0.25],
      dir: [0, 1, 0],
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Skeleton first. The pose is a crouched, broad-winged neutral gargoyle pose.
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.74, -0.02], dir: [0, 0.18, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.08],
      [0, 0.83, 0.10],
      [0, 0.91, 0.34],
      [0, 0.98, 0.57],
    ]),
    { parent: hips, names: ["pelvis", "back", "shoulder", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.57],
      [0, 1.08, 0.68],
      [0, 1.19, 0.76],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip, at: [0, 1.22, 0.78], dir: [0, -0.03, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.13, 0.91], dir: [0, -0.12, 0.95], role: "jaw", group: "head" });

  const hindL = b.chain("legL", [[0.32, 0.72, -0.12], [0.46, 0.45, 0.02], [0.40, 0.28, 0.26], [0.37, 0.27, 0.38]], {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.37, 0.26, 0.38],
  });
  const hindR = b.chain("legR", [[-0.32, 0.72, -0.12], [-0.46, 0.45, 0.02], [-0.40, 0.28, 0.26], [-0.37, 0.27, 0.38]], {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.37, 0.26, 0.38],
  });
  const armL = b.chain("armL", [[0.32, 0.97, 0.48], [0.53, 0.73, 0.56], [0.68, 0.46, 0.49], [0.68, 0.34, 0.43]], {
    parent: spine.joints[2],
    names: ["shoulderL", "elbowL", "wristL", "clawL"],
    role: "arm",
  });
  const armR = b.chain("armR", [[-0.32, 0.97, 0.48], [-0.53, 0.73, 0.56], [-0.68, 0.46, 0.49], [-0.68, 0.34, 0.43]], {
    parent: spine.joints[2],
    names: ["shoulderR", "elbowR", "wristR", "clawR"],
    role: "arm",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.68, -0.20],
      [0, 0.55, -0.47],
      [0, 0.43, -0.74],
      [0, 0.36, -1.02],
      [0.04, 0.40, -1.22],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  // ---------------------------------------------------------------------------
  // Main carved volumes.
  // ---------------------------------------------------------------------------
  b.sweep(spine, (t) => 0.22 - t * 0.035, {
    color: STONE,
    section: { ngon: 8 },
    sides: 8,
    name: "ribbed torso",
  });
  b.sweep(neck, [0.17, 0.13], { color: STONE, section: { ngon: 7 }, name: "neck" });
  b.sweep(tail, (t) => 0.13 * (1 - t) + 0.025, {
    color: STONE,
    section: { ngon: 7 },
    name: "whip tail",
    caps: { end: "point" },
  });

  for (const leg of [hindL, hindR]) {
    b.sweep(leg, (t) => 0.105 - t * 0.045, { color: BELLY, section: { ngon: 6 }, name: "bent hind leg" });
    orb(0.12, leg.tip.at, STONE_LIGHT, leg.tip, 7);
    for (const s of [-1, 0, 1]) {
      const p = leg.tip.local([s * 0.045, 0.045, 0.08]);
      b.spike(p, [0, 0, 1], 0.13, 0.022, { color: CREVICE, bone: leg.tip });
    }
  }
  for (const arm of [armL, armR]) {
    b.sweep(arm, (t) => 0.09 - t * 0.045, { color: STONE, section: { ngon: 6 }, name: "foreleg" });
    orb(0.105, arm.tip.at, STONE_LIGHT, arm.tip, 7);
    for (const s of [-1, 0, 1]) {
      const p = arm.tip.local([s * 0.04, 0.035, 0.02]);
      b.spike(p, [s * 0.20, -0.03, 0.32], null, 0.018, { color: CREVICE, bone: arm.tip });
    }
  }

  // chest plate and abdominal facets
  b.part(new THREE.SphereGeometry(0.24, 8, 6), BELLY, { bone: spine.joints[2], at: [0, 0.91, 0.57], scale: [0.82, 0.72, 0.45], flat: true });
  for (let i = 0; i < 3; i++) {
    box([0.22 - i * 0.025, 0.025, 0.018], [0, 0.78 - i * 0.07, 0.62 + i * 0.035], CREVICE, spine.joints[1]);
  }

  // ---------------------------------------------------------------------------
  // Head, muzzle, fangs and expression.
  // ---------------------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.23, 10, 7), STONE_LIGHT, {
    bone: head,
    at: [0, 1.24, 0.79],
    scale: [1.0, 0.9, 0.86],
    flat: true,
    name: "carved skull",
  });
  b.part(new THREE.SphereGeometry(0.14, 8, 6), BELLY, {
    bone: head,
    at: [0, 1.17, 0.94],
    scale: [1.0, 0.72, 0.72],
    flat: true,
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.055, 7, 5), CREVICE, { bone: head, at: [0, 1.19, 1.055], flat: true });
  b.sweep(polyline([[0, 1.13, 1.045], [0, 1.105, 1.09], [0, 1.075, 1.10]]), 0.018, {
    color: CREVICE,
    bone: jaw,
    caps: "flat",
    name: "open mouth",
  });
  for (const s of [-1, 1]) {
    b.spike([s * 0.075, 1.105, 1.04], [0, -1, 0.1], 0.105, 0.028, { color: STONE_LIGHT, bone: jaw });
    b.spike([s * 0.045, 1.145, 1.055], [0, -1, 0.05], 0.075, 0.018, { color: STONE_LIGHT, bone: jaw });
    orb(0.042, [s * 0.105, 1.285, 0.945], EYE, head, 7);
    orb(0.018, [s * 0.105, 1.285, 0.982], IRIS, head, 6);
    // heavy brow blocks
    b.rod([s * 0.16, 1.34, 0.91], [s * 0.055, 1.355, 0.985], 0.027, { color: CREVICE, bone: head });
  }

  // ears and crown horns
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.105, 0.28, 6), STONE, {
      bone: head,
      at: [s * 0.17, 1.39, 0.78],
      dir: [s * 0.30, 0.86, -0.05],
      flat: true,
      name: "pointed ear",
    });
    b.spike([s * 0.105, 1.39, 0.75], [s * 0.15, 0.12, -0.04], 0.19, 0.055, { color: STONE_LIGHT, bone: head });
  }
  b.spike([0.0, 1.43, 0.72], [0, 1, -0.18], 0.24, 0.07, { color: STONE, bone: head });
  b.spike([0.0, 1.44, 0.84], [0, 1, 0.10], 0.20, 0.06, { color: STONE_LIGHT, bone: head });

  // ---------------------------------------------------------------------------
  // Monumental bat wings: layered carved spars plus membranes.
  // ---------------------------------------------------------------------------
  for (const s of [-1, 1]) {
    const wingRoot = [s * 0.16, 1.00, 0.42] as [number, number, number];
    const wingTip = [s * 0.82, 1.48, 0.10] as [number, number, number];
    const wingSpine = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([wingRoot, [s * 0.40, 1.27, 0.25], [s * 0.65, 1.47, 0.12], wingTip]),
      { parent: spine.joints[2], names: s > 0 ? ["wingBaseL", "wingMidL", "wingTipL"] : ["wingBaseR", "wingMidR", "wingTipR"], role: "wing" },
    );
    b.sweep(wingSpine, [0.08, 0.035], { color: STONE, section: { ngon: 6 }, name: "wing fingers" });

    const lower = polyline([
      wingRoot,
      [s * 0.45, 0.83, 0.34],
      [s * 0.78, 0.69, 0.16],
      [s * 0.88, 0.90, 0.06],
    ]);
    const upper = polyline([wingRoot, [s * 0.33, 1.20, 0.27], [s * 0.60, 1.42, 0.14], wingTip]);
    b.membrane(upper, lower, { color: BELLY, thickness: 0.018, rows: 4, cols: 7, scallop: 0.12, name: "stone wing membrane" });

    for (let i = 0; i < 4; i++) {
      const a: [number, number, number] = [s * (0.20 + i * 0.15), 1.03 + i * 0.11, 0.38 - i * 0.07];
      const c: [number, number, number] = [s * (0.42 + i * 0.14), 0.78 + i * 0.06, 0.29 - i * 0.06];
      b.rod(a, c, 0.025, { color: STONE_LIGHT, bone: wingSpine.joints[Math.min(i, wingSpine.joints.length - 1)], name: "wing rib" });
    }
  }

  // dorsal ridge and tail spines
  b.along(spine, 5, (p) =>
    b.spike(p, p, 0.075, 0.028, { color: STONE_LIGHT, name: "back ridge" }),
  );
  b.along(tail, 6, (p) =>
    b.spike(p, [0, 1, -0.25], 0.065, 0.018, { color: STONE_LIGHT, name: "tail barb" }),
  );

  // engraved cracks / masonry scars as dark inset rods
  for (const s of [-1, 1]) {
    b.rod([s * 0.12, 0.88, 0.76], [s * 0.19, 0.95, 0.79], 0.008, { color: CREVICE, bone: spine.joints[2] });
    b.rod([s * 0.19, 0.95, 0.79], [s * 0.16, 1.04, 0.80], 0.006, { color: CREVICE, bone: spine.joints[2] });
    b.rod([s * 0.34, 0.56, 0.08], [s * 0.40, 0.48, 0.20], 0.007, { color: CREVICE, bone: hindL.joints[1] });
  }

  // A final carved rosette on the ledge face, behind the feet.
  const rosette = b.surface(b.root).around([0, 0.34, 0.34]).at(0, 0);
  if (rosette) {
    b.stick(new THREE.CylinderGeometry(0.105, 0.105, 0.025, 10), STONE_LIGHT, rosette, { embed: 0.35, name: "ledge rosette" });
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      orb(0.018, [Math.sin(a) * 0.07, 0.35, 0.34 + Math.cos(a) * 0.07], CREVICE, undefined, 6);
    }
  }

  return b.root;
}
