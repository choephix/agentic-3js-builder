import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import type { Path } from "../../../../src/path";
import { gradient } from "../../../../src/paint";
import { rng } from "../../../../src/math";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description: "A white spirit fox with nine fanned tails tipped in blue fire, gold collar and drifting spirit flames.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const WHITE = "#fffaf0";
const CREAM = "#f6dcc0";
const RED = "#d8344a";
const GOLD = "#f2b53a";
const SOCK = "#5b3a7a";
const PINK = "#f5a0b8";
const FIRE = "#5ad7ff";
const FIRE2 = "#b58cff";
const CORE = "#e8fbff";

const FUR = cel(furEdge(WHITE, CREAM, { axis: [0, 1, 0], level: -0.4, teeth: 0.2, period: 0.03, ink: INK }));
const FURW = cel(WHITE);
const LEG = cel(gradient(WHITE, SOCK, [0, 0.2, 0], [0, 0.09, 0]));
const REDC = cel(RED);
const GOLDC = cel(GOLD);

const TAILKEYS = [0.05, 0.1, 0.11, 0.07, 0.015];
function tailR(t: number): number {
  const f = t * (TAILKEYS.length - 1);
  const i = Math.min(TAILKEYS.length - 2, Math.floor(f));
  return TAILKEYS[i] + (TAILKEYS[i + 1] - TAILKEYS[i]) * (f - i);
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const rand = rng(7);

  // ---- body
  const body = b.sweep(
    catmull([[0, 0.55, 0.32], [0, 0.6, 0.1], [0, 0.58, -0.12], [0, 0.52, -0.28]]),
    [0.1, 0.14, 0.15, 0.12, 0.09],
    FUR,
  );
  void body;

  // ---- legs
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.09, 0.52, 0.24], [s * 0.085, 0.28, 0.255], [s * 0.085, 0.04, 0.27]]), [0.06, 0.04, 0.032], LEG);
    b.sweep(catmull([[s * 0.1, 0.5, -0.2], [s * 0.115, 0.25, -0.29], [s * 0.095, 0.04, -0.24]]), [0.075, 0.045, 0.032], LEG);
    b.capsule([s * 0.085, 0.035, 0.27], [s * 0.085, 0.035, 0.31], 0.032, SOCK);
    b.capsule([s * 0.095, 0.035, -0.24], [s * 0.095, 0.035, -0.2], 0.032, SOCK);
    // gold anklets
    b.part(new THREE.TorusGeometry(0.042, 0.008, 5, 10), GOLD, { at: [s * 0.085, 0.13, 0.26], dir: [0, 1, 0], axis: "z" });
    b.part(new THREE.TorusGeometry(0.044, 0.008, 5, 10), GOLD, { at: [s * 0.1, 0.13, -0.25], dir: [0, 1, 0], axis: "z" });
    // claws
    for (const k of [-1, 0, 1]) {
      b.spike([s * 0.085 + k * 0.016, 0.03, 0.325], [0, -0.1, 1], 0.03, 0.007, "#f3ead8", { sides: 5 });
      b.spike([s * 0.095 + k * 0.016, 0.03, -0.185], [0, -0.1, 1], 0.03, 0.007, "#f3ead8", { sides: 5 });
    }
  }

  // ---- neck, head
  b.capsule([0, 0.58, 0.3], [0, 0.78, 0.42], [0.085, 0.07], FURW);
  const HC: [number, number, number] = [0, 0.83, 0.48];
  const head = b.part(new THREE.SphereGeometry(1, 16, 12), FURW, { at: HC, scale: [0.09, 0.075, 0.085] });
  b.spike([0, 0.81, 0.52], [0, -0.14, 1], 0.14, 0.05, FURW, { sides: 8 });
  b.part(new THREE.SphereGeometry(0.018, 6, 5), INK, { at: [0, 0.778, 0.655] });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), CREAM, { at: [0, 0.77, 0.52], scale: [0.9, 0.6, 1.0] });
  for (const s of [1, -1]) {
    // ears
    const ear = [[-0.045, 0], [0.045, 0], [0.012, 0.22, "sharp"], [-0.012, 0.22, "sharp"]] as Array<[number, number] | [number, number, "sharp"]>;
    b.extrude(ear, { at: [s * 0.055, 0.875, 0.46], x: [s, 0, 0], y: [s * 0.18, 1, -0.3], thickness: 0.022, bevel: 0.005, smoothing: 1, color: cel(gradient(WHITE, SOCK, [0, 1.0, 0], [0, 1.08, 0])) });
    b.extrude(
      [[-0.028, 0.01], [0.028, 0.01], [0, 0.15, "sharp"]] as Array<[number, number] | [number, number, "sharp"]>,
      { at: [s * 0.055, 0.875, 0.46 + s * 0.013], x: [s, 0, 0], y: [s * 0.18, 1, -0.3], thickness: 0.01, color: PINK },
    );
    // cheek ruff
    for (const k of [0, 1, 2]) {
      b.spike([s * 0.075, 0.8 - k * 0.012, 0.5 - k * 0.02], [s, -0.35 - k * 0.12, -0.45], 0.08 - k * 0.01, 0.026, FURW, { sides: 5 });
    }
    // whiskers
    for (const k of [0, 1]) {
      b.rod([s * 0.035, 0.785, 0.6], [s * 0.17, 0.8 + k * 0.03, 0.56], 0.0025, "#ffffff", { sides: 4 });
    }
    // eyes + markings
    const skin = b.surface(head);
    const hit = skin.around(HC).at(s * 40, 4);
    if (hit) b.decal(skin, animeEye({ iris: "#ffb21a" }), { at: hit, size: [0.05, 0.068], mirror: s > 0 });
    const m1 = skin.around(HC).at(s * 62, 24);
    if (m1) b.stick(new THREE.ConeGeometry(0.012, 0.05, 4), REDC, m1);
    const m2 = skin.around(HC).at(s * 58, 8);
    if (m2) b.stick(new THREE.ConeGeometry(0.012, 0.045, 4), REDC, m2);
    // brow mark
    const m3 = skin.around(HC).at(s * 26, 38);
    if (m3) b.stick(new THREE.ConeGeometry(0.01, 0.035, 4), REDC, m3);
  }
  // forehead tuft and gem
  for (const k of [-1, 0, 1]) {
    b.spike([k * 0.02, 0.9, 0.47], [k * 0.3, 0.8, 0.5], 0.06, 0.016, FURW, { sides: 4 });
  }
  const sk = b.surface(head);
  const gemHit = sk.around(HC).at(0, 52);
  if (gemHit) glow(b.stick(new THREE.OctahedronGeometry(0.018), RED, gemHit));

  // ---- collar, beads, tassels
  b.part(new THREE.TorusGeometry(0.1, 0.012, 6, 14), GOLD, { at: [0, 0.69, 0.36], dir: [0, 0.2, 0.12], axis: "z" });
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI - Math.PI / 2;
    b.part(new THREE.SphereGeometry(0.018, 6, 5), i % 2 ? RED : "#7fe0ff", {
      at: [Math.sin(a) * 0.1, 0.665 - Math.cos(a) * 0.03, 0.4 + Math.cos(a) * 0.03],
    });
  }
  glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), FIRE, { at: [0, 0.6, 0.45] }), 1.2);
  for (const s of [-1, 0, 1]) {
    b.spike([s * 0.035, 0.575, 0.44], [0, -1, 0.1], 0.1, 0.014, RED, { sides: 5 });
  }
  // chest and shoulder fur
  for (const k of [-1, 0, 1]) {
    b.spike([k * 0.05, 0.55, 0.42], [k * 0.2, -0.5, 0.8], 0.09, 0.03, FURW, { sides: 5 });
  }
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      b.spike([s * 0.13, 0.62 - k * 0.035, 0.25 - k * 0.04], [s, -0.4, -0.5], 0.09, 0.03, FURW, { sides: 5 });
    }
    // red back-stripe tabs
    for (let k = 0; k < 4; k++) {
      b.spike([s * 0.07, 0.71 - k * 0.01, 0.22 - k * 0.12], [s * 0.7, 0.3, -0.15], 0.07, 0.017, RED, { sides: 4 });
    }
  }
  // spine crest
  for (let k = 0; k < 6; k++) {
    b.spike([0, 0.69 - k * 0.012, 0.28 - k * 0.1], [0, 1, -0.5], 0.06, 0.02, GOLD, { sides: 4 });
  }

  // ---- nine tails
  const base: [number, number, number] = [0, 0.56, -0.27];
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const arch = 1 - u * u;
    const path: Path = catmull([
      base,
      [u * 0.14, 0.64 + 0.1 * arch, -0.45],
      [u * 0.45, 0.78 + 0.3 * arch, -0.68],
      [u * 0.78, 0.55 + 0.45 * Math.pow(Math.abs(arch), 0.8), -0.95 - 0.1 * arch],
    ]);
    const tip = new THREE.Vector3(...(path.at(1) as THREE.Vector3).toArray());
    const alt = i % 2 === 0;
    b.sweep(path, TAILKEYS, cel(gradient(WHITE, alt ? "#ffd9a8" : "#d8c4ff", path.at(0.6), path.at(1))), { caps: "point" });
    for (const t of [0.4, 0.58]) {
      b.part(new THREE.TorusGeometry(tailR(t) + 0.004, 0.008, 5, 12), GOLD, { at: path.at(t), dir: path.tangentAt(t), axis: "z" });
    }
    // tail-tip spirit flame
    const T = path.tangentAt(1);
    const c1 = alt ? FIRE : FIRE2;
    const fl = (sc: number, col: string) =>
      glow(
        b.sweep(
          [
            tip.clone().addScaledVector(T, -0.02),
            tip.clone().addScaledVector(T, 0.05 * sc).add(new THREE.Vector3(0, 0.07 * sc, 0)),
            tip.clone().addScaledVector(T, 0.06 * sc).add(new THREE.Vector3(0.02 * sc * (alt ? 1 : -1), 0.2 * sc, 0)),
          ],
          [0.05 * sc, 0.042 * sc, 0.012],
          col,
          { caps: "point", sides: 6 },
        ),
      );
    fl(1, c1);
    fl(0.55, CORE);
  }

  // ---- drifting spirit flames
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rand() * 0.3;
    const r = 0.75 + rand() * 0.5;
    const y = 0.25 + rand() * 1.0;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r * 0.9 - 0.2;
    const sc = 0.7 + rand() * 0.7;
    const col = i % 2 ? FIRE : FIRE2;
    glow(
      b.sweep(
        [[x, y, z], [x + 0.02 * sc, y + 0.07 * sc, z], [x - 0.015 * sc, y + 0.17 * sc, z]],
        [0.045 * sc, 0.04 * sc, 0.01],
        col,
        { caps: "point", sides: 6 },
      ),
    );
    glow(b.sweep([[x, y, z], [x + 0.01 * sc, y + 0.05 * sc, z]], [0.022 * sc, 0.008], CORE, { caps: "point", sides: 5 }));
  }

  return b.root;
}
