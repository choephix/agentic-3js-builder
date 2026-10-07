import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";
import { polyline } from "../../../../src/index";

export const meta = {
  name: "griffin knight",
  description: "A battle-worn knight in layered plate, deep-blue surcoat with a silver griffin, kite shield, broadsword and a torn crimson cape.",
};

export default function build() {
  const b = createBuilder({ name: "griffin-knight" });
  const r = rng(1187);

  // Seats any geometry on a frame: position, facing direction and up.
  const seat = (geo: THREE.BufferGeometry, color: string, p: number[], d: number[], up?: number[]) =>
    b.stick(geo, color, frame(p, d, up));

  // A tube between two points (limbs, grip, sword blade).
  const bar = (a: number[], c: number[], radius: number, color: string) =>
    b.capsule(a, c, { radius, color });

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.95, 0] });
  const chest = b.joint("chest", { at: [0, 1.2, 0], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.5, 0], parent: chest });
  const head = b.joint("head", { at: [0, 1.6, 0], parent: neck });

  const shoulderL = b.joint("shoulderL", { at: [0.22, 1.42, 0], parent: chest });
  const elbowL = b.joint("elbowL", { at: [0.26, 1.15, 0.05], parent: shoulderL });
  const wristL = b.joint("wristL", { at: [0.27, 0.92, 0.2], parent: elbowL });

  const shoulderR = b.joint("shoulderR", { at: [-0.22, 1.42, 0], parent: chest });
  const elbowR = b.joint("elbowR", { at: [-0.28, 1.14, 0.1], parent: shoulderR });
  const wristR = b.joint("wristR", { at: [-0.2, 0.98, 0.32], parent: elbowR });

  const hipL = b.joint("hipL", { at: [0.12, 0.95, 0], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.13, 0.5, 0.02], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.13, 0.08, 0.02], parent: kneeL });

  const hipR = b.joint("hipR", { at: [-0.12, 0.95, 0], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.13, 0.5, 0.02], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.13, 0.08, 0.02], parent: kneeR });

  // ---------- Great helm ----------
  seat(new THREE.CylinderGeometry(0.13, 0.14, 0.26, 8), "steel", [0, 1.6, 0], [0, 0, 1], [0, 1, 0]);
  seat(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), "darkSteel", [0, 1.47, 0], [0, 0, 1], [0, 1, 0]);
  seat(new THREE.BoxGeometry(0.2, 0.05, 0.02), "black", [0, 1.6, 0.135], [0, 0, 1], [0, 1, 0]); // eye slit
  seat(new THREE.BoxGeometry(0.03, 0.2, 0.16), "steel", [0, 1.68, 0.0], [0, 0, 1], [0, 1, 0]); // crest ridge
  seat(new THREE.BoxGeometry(0.02, 0.02, 0.2), "steel", [0.07, 1.6, 0.11], [0, 0, 1], [0, 1, 0]); // breath rivets
  seat(new THREE.BoxGeometry(0.02, 0.02, 0.2), "steel", [-0.07, 1.6, 0.11], [0, 0, 1], [0, 1, 0]);

  // Crimson plume: fanned spikes rising from the crest
  b.spike([0, 1.8, -0.02], [0, 0.5, -0.85], 0.38, 0.045);
  b.spike([0.02, 1.8, -0.02], [0.05, 0.45, -0.9], 0.34, 0.04);
  b.spike([-0.02, 1.8, -0.02], [-0.05, 0.48, -0.8], 0.32, 0.04);

  // ---------- Neck and gorget ----------
  seat(new THREE.CylinderGeometry(0.1, 0.12, 0.18, 8), "darkSteel", [0, 1.4, 0], [0, 0, 1], [0, 1, 0]);

  // ---------- Torso ----------
  seat(new THREE.BoxGeometry(0.36, 0.42, 0.24), "steel", [0, 1.22, 0], [0, 0, 1], [0, 1, 0]); // breastplate
  seat(new THREE.BoxGeometry(0.1, 0.06, 0.04), "gold", [0, 1.36, 0.13], [0, 0, 1], [0, 1, 0]); // gold clasp

  // Blue surcoat with the silver griffin
  seat(new THREE.BoxGeometry(0.4, 0.62, 0.02), "blue", [0, 1.02, 0.13], [0, 0, 1], [0, 1, 0]);
  seat(new THREE.BoxGeometry(0.42, 0.04, 0.03), "gold", [0, 0.7, 0.14], [0, 0, 1], [0, 1, 0]); // hem trim

  const griffin: number[][] = [
    [0, 0.14], [0.03, 0.09], [0.07, 0.06], [0.1, 0.02], [0.08, -0.02],
    [0.05, -0.04], [0.07, -0.1], [0.02, -0.07], [0, -0.12], [-0.02, -0.07],
    [-0.07, -0.1], [-0.05, -0.04], [-0.08, -0.02], [-0.1, 0.02], [-0.07, 0.06],
    [-0.03, 0.09],
  ].map(([x, y]) => [x * 1.1, y * 1.1]);

  b.extrude(griffin, { at: [0, 1.04, 0.15], x: [1, 0, 0], y: [0, 1, 0] });

  // Belt and tassets
  seat(new THREE.BoxGeometry(0.4, 0.07, 0.26), "leather", [0, 0.92, 0], [0, 0, 1], [0, 1, 0]);
  seat(new THREE.BoxGeometry(0.2, 0.2, 0.03), "darkSteel", [0.1, 0.75, 0.14], [0, 0, 1], [0, 1, 0]);
  seat(new THREE.BoxGeometry(0.2, 0.2, 0.03), "darkSteel", [-0.1, 0.75, 0.14], [0, 0, 1], [0, 1, 0]);

  // ---------- Pauldrons: layered plates with gold filigree ----------
  for (const [side, sx] of [["L", 1], ["R", -1]] as const) {
    const sh = [0.22 * sx, 1.44, 0];
    seat(new THREE.SphereGeometry(0.12, 8, 5), "steel", sh, [0, 1, 0], [0, 0, 1]);
    for (let i = 0; i < 3; i++) {
      seat(
        new THREE.CylinderGeometry(0.11 - i * 0.02, 0.12 - i * 0.02, 0.05, 8),
        i === 1 ? "darkSteel" : "steel",
        [sh[0] * 1.02, sh[1] - 0.04 - i * 0.05, sh[2]],
        [0, 1, 0],
        [0, 0, 1],
      );
    }
    seat(new THREE.BoxGeometry(0.16, 0.012, 0.012), "gold", [sh[0], sh[1] + 0.02, 0.1], [0, 0, 1], [0, 1, 0]);
    seat(new THREE.BoxGeometry(0.012, 0.1, 0.012), "gold", [sh[0] + 0.07 * sx, sh[1] - 0.02, 0.1], [0, 0, 1], [0, 1, 0]);
  }

  // ---------- Arms ----------
  bar([0.22, 1.42, 0], [0.26, 1.15, 0.05], 0.065, "steel");
  bar([0.26, 1.15, 0.05], [0.27, 0.92, 0.2], 0.055, "darkSteel");
  bar([-0.22, 1.42, 0], [-0.28, 1.14, 0.1], 0.065, "steel");
  bar([-0.28, 1.14, 0.1], [-0.2, 0.98, 0.32], 0.055, "darkSteel");
  seat(new THREE.SphereGeometry(0.06, 6, 4), "steel", [0.27, 0.92, 0.2], [0, 0, 1]); // gauntlets
  seat(new THREE.SphereGeometry(0.06, 6, 4), "steel", [-0.2, 0.98, 0.32], [0, 0, 1]);

  // ---------- Legs ----------
  bar([0.12, 0.95, 0], [0.13, 0.5, 0.02], 0.08, "steel");
  bar([0.13, 0.5, 0.02], [0.13, 0.08, 0.02], 0.07, "darkSteel");
  bar([-0.12, 0.95, 0], [-0.13, 0.5, 0.02], 0.08, "steel");
  bar([-0.13, 0.5, 0.02], [-0.13, 0.08, 0.02], 0.07, "darkSteel");
  seat(new THREE.BoxGeometry(0.13, 0.12, 0.22), "black", [0.13, 0.06, 0.06], [0, 0, 1], [0, 1, 0]); // sabatons
  seat(new THREE.BoxGeometry(0.13, 0.12, 0.22), "black", [-0.13, 0.06, 0.06], [0, 0, 1], [0, 1, 0]);

  // ---------- Kite shield with griffin ----------
  const kite: number[][] = [[-0.18, 0.28], [0.18, 0.28], [0.18, 0.06], [0, -0.36], [-0.18, 0.06]];
  b.extrude(kite, { at: [0.42, 1.0, 0.28], x: [1, 0, 0], y: [0, 1, 0] });
  b.extrude(
    griffin.map(([x, y]) => [x * 1.2, y * 1.2]),
    { at: [0.42, 1.0, 0.32], x: [1, 0, 0], y: [0, 1, 0] },
  );
  seat(new THREE.BoxGeometry(0.36, 0.02, 0.02), "gold", [0.42, 1.28, 0.3], [0, 0, 1], [0, 1, 0]); // rim trim

  // ---------- Broadsword ----------
  bar([-0.2, 0.98, 0.32], [-0.22, 0.98, 0.36], 0.018, "leather"); // grip
  seat(new THREE.BoxGeometry(0.2, 0.025, 0.025), "gold", [-0.2, 0.98, 0.36], [0, 0, 1], [0, 1, 0]); // crossguard
  seat(new THREE.BoxGeometry(0.05, 0.03, 0.03), "gold", [-0.2, 0.98, 0.5], [0, 0, 1], [0, 1, 0]);
  seat(new THREE.BoxGeometry(0.05, 0.14, 0.92), "silver", [-0.2, 1.0, 0.95], [0, 0, 1], [0, 1, 0]); // blade
  seat(new THREE.ConeGeometry(0.03, 0.12, 4), "silver", [-0.2, 1.0, 1.5], [0, 0, 1], [0, 1, 0]);

  // ---------- Torn crimson cape ----------
  const capeTop = polyline([
    [0.22, 1.5, -0.12],
    [0.11, 1.46, -0.14],
    [0, 1.45, -0.15],
    [-0.11, 1.46, -0.14],
    [-0.22, 1.5, -0.12],
  ]);
  const capeBottom = polyline([
    [0.26, 0.55, -0.22],
    [0.14, 0.34, -0.24],
    [0.04, 0.48, -0.26],
    [-0.06, 0.3, -0.25],
    [-0.26, 0.42, -0.22],
  ]);
  b.membrane(capeTop, capeBottom);

  // ---------- Dents and scratches from many battles ----------
  const dentColor = "darkSteel";
  for (let i = 0; i < 14; i++) {
    const x = (r() - 0.5) * 0.3;
    const y = 1.08 + r() * 0.28;
    seat(new THREE.SphereGeometry(0.018 + r() * 0.012, 4, 3), dentColor, [x, y, 0.125], [0, 0, 1], [0, 1, 0]);
  }
  for (let i = 0; i < 8; i++) {
    const x = (r() - 0.5) * 0.12;
    const y = 1.36 + r() * 0.2;
    seat(new THREE.BoxGeometry(0.004, 0.09, 0.004), "silver", [x, y, 0.14], [0, 0, 1], [0, 1, 0]);
  }
  for (let i = 0; i < 6; i++) {
    const sx = i % 2 === 0 ? 1 : -1;
    seat(
      new THREE.SphereGeometry(0.014, 4, 3),
      dentColor,
      [0.25 * sx + (r() - 0.5) * 0.08, 1.4 + r() * 0.1, 0.12],
      [0, 0, 1],
      [0, 1, 0],
    );
  }

  return b.root;

  function r(): number {
    return rng.next();
  }
}
