import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Armored Knight",
  description: "A stylised plate-armoured knight in a planted guard, with crimson cape, plumed great helm and heater shield.",
};

const STEEL = "#9aa4b0";
const STEEL_DARK = "#5b636e";
const GOLD = "#c9a227";
const CRIMSON = "#7a1f24";
const PLUME = "#b3262e";
const LEATHER = "#4a3020";
const SLIT = "#15171a";

const unit = (v: number[]) => new THREE.Vector3(v[0], v[1], v[2]).normalize().toArray() as [number, number, number];

export default function build() {
  const b = createBuilder({ name: "armored-knight" });
  const rand = rng(7);

  // Helpers --------------------------------------------------------------
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], dir?: number[]) =>
    b.part(geo, color, dir ? { at, dir: unit(dir) } : { at });

  const seg = (a: number[], c: number[], r: number, color: string) => {
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const C = new THREE.Vector3(...(c as [number, number, number]));
    const len = A.distanceTo(C);
    const mid = A.clone().add(C).multiplyScalar(0.5);
    put(new THREE.CylinderGeometry(r, r, len, 10), color, mid.toArray(), C.clone().sub(A).toArray());
  };

  const sphere = (r: number, color: string, at: number[]) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at);

  const box = (w: number, h: number, d: number, color: string, at: number[]) =>
    put(new THREE.BoxGeometry(w, h, d), color, at);

  // Skeleton ---------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const spine = b.joint("spine", { at: [0, 1.2, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.4, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.56, 0], parent: chest });
  const head = b.joint("head", { at: [0, 1.66, 0], parent: neck });

  const limbs: Array<{ s: 1 | -1; side: "L" | "R" }> = [
    { s: 1, side: "L" },
    { s: -1, side: "R" },
  ];

  const joints: Record<string, ReturnType<typeof b.joint>> = {};
  for (const { s, side } of limbs) {
    const x = 0.26 * s;
    joints[`shoulder${side}`] = b.joint(`shoulder${side}`, { at: [x, 1.48, 0], parent: chest });
    joints[`elbow${side}`] = b.joint(`elbow${side}`, { at: [x + 0.07 * s, 1.22, 0.04], parent: joints[`shoulder${side}`] });
    joints[`wrist${side}`] = b.joint(`wrist${side}`, { at: [x + 0.1 * s, 0.97, 0.2], parent: joints[`elbow${side}`] });
    const hx = 0.13 * s;
    joints[`hip${side}`] = b.joint(`hip${side}`, { at: [hx, 1.0, 0], parent: hips });
    joints[`knee${side}`] = b.joint(`knee${side}`, { at: [hx + 0.01 * s, 0.55, 0.03], parent: joints[`hip${side}`] });
    joints[`ankle${side}`] = b.joint(`ankle${side}`, { at: [hx + 0.01 * s, 0.1, 0.0], parent: joints[`knee${side}`] });
  }

  // Torso --------------------------------------------------------------------
  box(0.4, 0.36, 0.26, STEEL, [0, 1.3, 0]);                 // breastplate
  box(0.36, 0.1, 0.24, STEEL_DARK, [0, 1.1, 0]);            // waist plates
  box(0.38, 0.16, 0.22, STEEL_DARK, [0, 0.98, 0]);          // fauld
  box(0.3, 0.06, 0.2, GOLD, [0, 1.16, 0.0]);                // gold belt
  box(0.06, 0.2, 0.02, GOLD, [0, 1.32, 0.135]);             // gold keel ridge on breastplate
  box(0.16, 0.05, 0.02, GOLD, [0, 1.42, 0.14]);             // gold collar trim

  // Rivets along the breastplate edge, slightly jittered for a hand-set look.
  for (let i = 0; i < 5; i++) {
    const x = -0.16 + i * 0.08;
    sphere(0.014, GOLD, [x, 1.2 + rand() * 0.004, 0.14]);
  }

  // Gorget / neck
  seg([0, 1.46, 0], [0, 1.52, 0], 0.09, STEEL_DARK);

  // Cape ----------------------------------------------------------------------
  box(0.44, 1.4, 0.02, CRIMSON, [0, 0.8, -0.16]);
  box(0.46, 0.04, 0.03, GOLD, [0, 1.5, -0.165]);

  // Pauldrons, arms, gauntlets -------------------------------------------------
  for (const { s, side } of limbs) {
    const x = 0.26 * s;
    sphere(0.13, STEEL, [x, 1.48, 0]);                       // pauldron
    box(0.06, 0.05, 0.14, GOLD, [x * 1.05, 1.5, 0.0]);       // pauldron trim
    seg([x, 1.48, 0], [x + 0.07 * s, 1.22, 0.04], 0.065, STEEL_DARK); // upper arm
    sphere(0.07, STEEL, [x + 0.07 * s, 1.22, 0.04]);         // elbow cop
    seg([x + 0.07 * s, 1.22, 0.04], [x + 0.1 * s, 0.97, 0.2], 0.055, STEEL); // vambrace
    box(0.1, 0.1, 0.11, STEEL_DARK, [x + 0.11 * s, 0.93, 0.24]); // gauntlet
  }

  // Legs ------------------------------------------------------------------------
  for (const { s, side } of limbs) {
    const hx = 0.13 * s;
    seg([hx, 1.0, 0], [hx + 0.01 * s, 0.55, 0.03], 0.09, STEEL_DARK); // cuisse core
    sphere(0.1, STEEL, [hx, 0.97, 0.0]);                              // hip plate
    sphere(0.085, STEEL, [hx + 0.01 * s, 0.55, 0.03]);                // poleyn
    box(0.1, 0.02, 0.02, GOLD, [hx + 0.01 * s, 0.55, 0.12]);          // knee gold strip
    seg([hx + 0.01 * s, 0.55, 0.03], [hx + 0.01 * s, 0.14, 0.02], 0.085, STEEL); // greave
    box(0.13, 0.12, 0.2, STEEL_DARK, [hx + 0.01 * s, 0.07, 0.07]);    // sabaton
  }

  // Sword planted in the right hand ---------------------------------------------
  const swordX = -0.4;
  box(0.035, 0.78, 0.01, "#d6dce3", [swordX, 0.62, 0.27]);     // blade
  box(0.13, 0.03, 0.03, GOLD, [swordX, 0.22, 0.27]);           // crossguard
  seg([swordX, 0.2, 0.27], [swordX, 0.08, 0.27], 0.02, LEATHER); // grip
  sphere(0.03, GOLD, [swordX, 0.04, 0.27]);                    // pommel

  // Heater shield on the left arm ------------------------------------------------
  put(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), CRIMSON, [0.42, 1.06, 0.24], [0, 0, 1]);
  put(new THREE.CylinderGeometry(0.2, 0.2, 0.01, 8), GOLD, [0.42, 1.06, 0.265], [0, 0, 1]);
  box(0.04, 0.3, 0.012, GOLD, [0.42, 1.06, 0.28]);             // cross emblem
  box(0.2, 0.04, 0.012, GOLD, [0.42, 1.06, 0.28]);

  // Head: plumed great helm --------------------------------------------------------
  box(0.26, 0.28, 0.26, STEEL, [0, 1.68, 0]);                  // helm
  box(0.2, 0.03, 0.02, SLIT, [0, 1.66, 0.135]);                // visor slit
  box(0.03, 0.02, 0.02, SLIT, [0, 1.6, 0.135]);                // breath holes
  box(0.03, 0.02, 0.02, SLIT, [-0.06, 1.6, 0.135]);
  box(0.03, 0.02, 0.02, SLIT, [0.06, 1.6, 0.135]);
  box(0.035, 0.22, 0.02, STEEL_DARK, [0, 1.66, 0.14]);         // nasal bar
  box(0.28, 0.035, 0.28, GOLD, [0, 1.82, 0]);                  // helm band
  put(new THREE.ConeGeometry(0.07, 0.34, 8), PLUME, [0, 1.98, -0.04], [0, 1, -0.35]); // plume
  sphere(0.035, GOLD, [0, 1.84, 0]);

  return b.root;
}
