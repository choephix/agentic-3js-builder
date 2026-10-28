import * as THREE from "three";
import { createBuilder, catmull, polyline, limb, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A scarred, God of War style hydra: five collared, spiked necks, ember-cracked hide, an embedded frost axe and broken spears.",
};

const SKIN = "#2f3b34";
const SKIN2 = "#3b4a3f";
const SKIN3 = "#27302c";
const DARK = "#14191b";
const BELLY = "#85704c";
const BONE = "#d3c7a4";
const EMBER = "#ff6a1a";
const EYE = "#ffb52e";
const RED = "#7a1d1d";
const IRON = "#4a4f55";
const STEEL = "#9aa6b0";
const LEATHER = "#3d2b20";
const FROST = "#6fd3ff";

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(11);

  // ---- skeleton: body ----
  const pelvis = b.joint("pelvis", { at: [0, 1.95, -1.6], role: "spine" });
  const bodyPath = catmull([
    [0, 1.95, -1.6],
    [0, 2.05, -0.5],
    [0, 2.15, 0.5],
    [0, 2.3, 1.4],
  ]);
  const spine = b.chain("spine", bodyPath, {
    parent: pelvis,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine",
  });
  const chest = spine.joints[spine.joints.length - 1];
  const body = b.sweep(spine, (t) => [0.75 + 0.22 * Math.sin(Math.PI * t), 0.72 + 0.2 * Math.sin(Math.PI * t)], {
    color: SKIN2,
    sectors: [[125, 235, BELLY]],
    sides: 10,
  });
  b.along(body, 6, (at) => b.spike(at, at, 0.4, 0.1, { color: BONE }));

  // ember cracks and hide plates
  const skin = b.surface(body);
  for (const h of skin.scatter(12, { rng: rng(5), minDist: 0.4, filter: (h) => h.n.y > 0.1 })) {
    glow(b.stick(new THREE.BoxGeometry(0.05, 0.03, 0.4), EMBER, h, { spin: R() * 360, embed: 0.3 }), 1.3);
  }
  const plateCols = [SKIN, SKIN3, SKIN2];
  skin.scatter(50, { rng: rng(6), minDist: 0.25, filter: (h) => h.n.y > -0.2 }).forEach((h, i) => {
    b.stick(new THREE.BoxGeometry(0.22, 0.05, 0.18), plateCols[i % 3], h, { spin: R() * 360, embed: 0.35 });
  });

  // shoulder / haunch bulk
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.62, 8, 6), SKIN, { bone: chest, at: [s * 0.8, 2.1, 1.25] });
    b.part(new THREE.SphereGeometry(0.66, 8, 6), SKIN, { bone: pelvis, at: [s * 0.78, 2.0, -1.5] });
    // shoulder pauldron spikes
    b.spike([s * 1.1, 2.55, 1.2], [s * 0.7, 1, 0.1], 0.45, 0.1, { color: BONE, bone: chest });
    b.spike([s * 1.05, 2.5, -1.4], [s * 0.7, 1, -0.2], 0.45, 0.1, { color: BONE, bone: pelvis });
  }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.95, -1.6],
      [0, 1.8, -2.6],
      [0, 1.4, -3.6],
      [0, 1.0, -4.6],
      [0, 0.85, -5.5],
    ]),
    { parent: pelvis, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  const tailSw = b.sweep(tail, (t) => 0.55 * (1 - t) + 0.07, { color: SKIN2, sectors: [[130, 230, BELLY]], sides: 8 });
  b.along(tailSw, 6, (at) => b.spike(at, at, 0.3, 0.07, { color: BONE }));
  b.extrude(
    [
      [0, -0.15],
      [0.5, -0.38],
      [1.1, 0, "sharp"],
      [0.5, 0.38],
      [0, 0.15],
    ],
    { at: [0, 0.85, -5.5], x: [0, 0, -1], thickness: [0.07, 0.02], color: BONE, bone: tail.joints[tail.joints.length - 1] },
  );

  // ---- legs ----
  function leg(s: number, front: boolean) {
    const tag = (front ? "F" : "H") + (s > 0 ? "L" : "R");
    const root: [number, number, number] = front ? [s * 0.85, 1.85, 1.3] : [s * 0.85, 1.85, -1.5];
    const foot: [number, number, number] = front ? [s * 1.15, 0.15, 1.5] : [s * 1.2, 0.15, -1.2];
    const pts = limb(root, foot, front ? [1.05, 0.95] : [1.1, 1.05], front ? [[0, 0, -1]] : [[0, 0, 1]]);
    const c = b.chain(`leg${tag}`, polyline(pts), {
      parent: front ? chest : pelvis,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
      role: "leg",
    });
    b.sweep(c, [0.46, 0.22], { color: SKIN, sides: 8 });
    const knee = c.joints[1];
    b.spike(pts[1], [s * 0.6, 0.3, front ? -0.8 : -0.6], 0.32, 0.1, { color: BONE, bone: knee });
    const tip = c.tip ?? c.joints[c.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.6, 0.3, 0.85), SKIN3, { bone: tip, at: [foot[0], 0.15, foot[2] + 0.15] });
    for (const k of [-1, 0, 1]) {
      b.spike([foot[0] + k * 0.2, 0.17, foot[2] + 0.5], [k * 0.12, -0.25, 1], 0.4, 0.075, { color: BONE, bone: tip });
    }
    // iron anklet
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 8), IRON, { bone: tip, at: [foot[0], 0.55, foot[2]] });
  }
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // ---- heads ----
  const HX = [2.3, 1.15, 0, -1.15, -2.3];
  const HY = [3.7, 4.7, 5.5, 4.5, 3.6];
  const HZ = [2.8, 3.2, 3.0, 3.3, 2.8];
  const HS = [0.95, 1.05, 1.3, 1.05, 0.95];

  for (let i = 0; i < 5; i++) {
    const hx = HX[i], hy = HY[i], hz = HZ[i], S = HS[i];
    const pts: [number, number, number][] = [
      [hx * 0.22, 2.5, 1.1],
      [hx * 0.25, 2.5 + (hy - 2.5) * 0.4, 0.5],
      [hx * 0.6, hy - 0.7, 0.9],
      [hx * 0.95, hy - 0.15, hz - 0.9],
      [hx, hy - 0.1, hz - 0.3],
    ];
    const names = [1, 2, 3, 4, 5].map((n) => `neck${i}_${n}`);
    const neck = b.chain(`neck${i}`, catmull(pts), { parent: chest, names, role: "neck" });
    const sw = b.sweep(neck, (t) => [0.42 - 0.2 * t, 0.4 - 0.18 * t], {
      color: SKIN2,
      sectors: [[125, 235, BELLY]],
      sides: 8,
    });
    b.along(sw, 5, (at) => b.spike(at, at, 0.22, 0.06, { color: BONE }));
    const nskin = b.surface(sw);
    nskin.scatter(10, { rng: rng(20 + i), minDist: 0.22, filter: (h) => h.n.y > -0.2 }).forEach((h, k) => {
      b.stick(new THREE.BoxGeometry(0.15, 0.04, 0.12), plateCols[k % 3], h, { spin: R() * 360, embed: 0.35 });
    });
    // iron collar
    const band = b.ring(neck.at(0.35), { count: 10, radius: 0.4 });
    b.sweep(
      catmull(band.items.map((it) => it.at), { closed: true }),
      0.055,
      { color: IRON, bone: neck.joints[1] },
    );
    b.spike(neck.at(0.35).at, [0, 1, 0.3], 0.0 + 0.2, 0.05, { color: STEEL, bone: neck.joints[1] });

    const tipJ = neck.joints[neck.joints.length - 1];
    const head = b.joint(`head${i}`, {
      parent: tipJ,
      at: pts[4],
      dir: [hx * 0.1, -0.3, 1],
      role: "head",
    });
    const L = (f: number, u = 0, l = 0) => head.local({ forward: f * S, up: u * S, left: l * S });
    // upper head
    b.loft(
      [
        { at: L(-0.25), w: 0.55 * S, h: 0.52 * S },
        { at: L(0.2, 0.02), w: 0.58 * S, h: 0.5 * S },
        { at: L(0.65), w: 0.42 * S, h: 0.36 * S },
        { at: L(1.1, -0.02), w: 0.34 * S, h: 0.26 * S },
      ],
      { bone: head, color: SKIN },
    );
    // jaw
    const jaw = b.joint(`jaw${i}`, { parent: head, at: L(-0.05, -0.15), aim: L(0.9, -0.2), role: "jaw" });
    b.loft(
      [
        { at: L(0.0, -0.22), w: 0.46 * S, h: 0.14 * S },
        { at: L(0.5, -0.24), w: 0.4 * S, h: 0.12 * S },
        { at: L(1.0, -0.24), w: 0.28 * S, h: 0.1 * S },
      ],
      { bone: jaw, color: SKIN3 },
    );
    b.rod(L(0.1, -0.14), L(0.9, -0.15), 0.04 * S, RED, { bone: jaw });
    // teeth
    for (const sd of [1, -1]) {
      for (let k = 0; k < 5; k++) {
        const f = 0.3 + k * 0.17;
        const l = sd * (0.17 - k * 0.02);
        b.spike(L(f, -0.02, l), [0, -1, 0], 0.17 * S, 0.035 * S, { color: BONE, bone: head });
        b.spike(L(f + 0.05, -0.2, l * 0.85), [0, 1, 0], 0.13 * S, 0.03 * S, { color: BONE, bone: jaw });
      }
      // eyes, brows, horns, nostrils
      glow(b.part(new THREE.SphereGeometry(0.065 * S, 6, 4), EYE, { bone: head, at: L(0.5, 0.16, sd * 0.2) }), 1.5);
      b.part(new THREE.SphereGeometry(0.03 * S, 5, 4), DARK, { bone: head, at: L(0.55, 0.16, sd * 0.235) });
      b.rod(L(0.3, 0.27, sd * 0.16), L(0.72, 0.2, sd * 0.2), 0.05 * S, DARK, { bone: head });
      b.spike(L(0, 0.22, sd * 0.22), L(-0.75, 0.62, sd * 0.55), null, 0.09 * S, { color: BONE, bone: head });
      b.spike(L(0.15, 0.2, sd * 0.28), L(-0.2, 0.5, sd * 0.75), null, 0.06 * S, { color: BONE, bone: head });
      b.part(new THREE.SphereGeometry(0.03 * S, 5, 4), DARK, { bone: head, at: L(1.12, 0.0, sd * 0.07) });
      // cheek frill
      b.spike(L(-0.1, -0.05, sd * 0.28), L(-0.5, -0.1, sd * 0.7), null, 0.06 * S, { color: BONE, bone: head });
    }
    // war-paint scar
    b.rod(L(0.35, 0.26, 0.0), L(0.9, 0.12, 0.0), 0.02 * S, EMBER, { bone: head });
    b.pose(jaw, { axis: [1, 0, 0], deg: 12 + i * 3 });
  }

  // ---- embedded frost axe (left flank) ----
  b.rod([0.95, 2.8, 0.7], [2.1, 4.0, 0.3], 0.045, LEATHER, { bone: spine.joints[2] });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), IRON, { bone: spine.joints[2], at: [2.12, 4.02, 0.3] });
  b.extrude(
    [
      [-0.05, -0.2],
      [0.45, -0.38],
      [0.55, 0.38],
      [-0.05, 0.2],
    ],
    { at: [1.8, 3.7, 0.22], x: [0, 0, 1], thickness: 0.05, color: STEEL, bone: spine.joints[2] },
  );
  glow(b.part(new THREE.BoxGeometry(0.06, 0.24, 0.06), FROST, { bone: spine.joints[2], at: [1.8, 3.7, 0.55] }), 1.6);
  glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 0.2), FROST, { bone: spine.joints[2], at: [1.8, 3.7, 0.4] }), 1.6);

  // ---- broken spears (right flank) ----
  for (const [x, y, z, dx, dy, dz] of [
    [-0.95, 2.6, -0.2, -0.9, 0.9, -0.3],
    [-0.8, 2.9, 0.9, -0.6, 1.0, 0.4],
  ]) {
    b.rod([x, y, z], [x + dx, y + dy, z + dz], 0.035, LEATHER, { bone: spine.joints[1] });
    b.spike([x, y, z], [-dx, -dy, -dz], 0.0 + 0.35, 0.05, { color: STEEL, bone: spine.joints[1] });
  }

  return b.root;
}
