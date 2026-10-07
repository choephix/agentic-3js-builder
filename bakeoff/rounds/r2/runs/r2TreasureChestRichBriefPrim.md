```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Pirate Treasure Chest",
  description:
    "Weathered open treasure chest with iron straps, a dangling padlock, a carved skull and crossbones, and spilling gold, pearls, goblet and gems.",
};

export default function build() {
  const b = createBuilder({ name: "treasure_chest" });
  const chest = b.joint("chest", { at: [0, 0, 0] });
  const HINGE = new THREE.Vector3(0, 0.45, -0.3);
  const lid = b.joint("lid", { at: [HINGE.x, HINGE.y, HINGE.z], parent: chest });
  const LID_ANGLE = -THREE.MathUtils.degToRad(108);

  const mk = (pos: number[], rot: number[]) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
      new THREE.Vector3(1, 1, 1)
    );
  const P = (geo: THREE.BufferGeometry, color: string, pos: number[], rot: number[] = [0, 0, 0]) => {
    geo.applyMatrix4(mk(pos, rot));
    b.part(geo, color, { at: [0, 0, 0], bone: chest });
  };
  const lidM = new THREE.Matrix4()
    .makeTranslation(HINGE.x, HINGE.y, HINGE.z)
    .multiply(new THREE.Matrix4().makeRotationX(LID_ANGLE));
  const L = (geo: THREE.BufferGeometry, color: string, pos: number[], rot: number[] = [0, 0, 0]) => {
    geo.applyMatrix4(mk(pos, rot));
    geo.applyMatrix4(lidM);
    b.part(geo, color, { at: [0, 0, 0], bone: lid });
  };
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  let seed = 12345;
  const R = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const woods = ["#5a3a1f", "#6b4526", "#4f3219"];
  const IRON = "#3b3b40";
  const RUST = "#7a4325";
  const DARK = "#24160b";

  // ---------- body ----------
  P(box(0.9, 0.06, 0.5), DARK, [0, 0.03, 0]);
  P(box(0.9, 0.4, 0.5), DARK, [0, 0.2, 0]);
  for (let i = 0; i < 4; i++) {
    const y = 0.05625 + i * 0.1125;
    P(box(1.0, 0.11, 0.05), woods[i % 3], [0, y, 0.275]);
    P(box(1.0, 0.11, 0.05), woods[(i + 1) % 3], [0, y, -0.275]);
    P(box(0.05, 0.11, 0.5), woods[(i + 2) % 3], [0.475, y, 0]);
    P(box(0.05, 0.11, 0.5), woods[i % 3], [-0.475, y, 0]);
    // seams
    P(box(1.0, 0.006, 0.006), DARK, [0, i * 0.1125, 0.301]);
  }
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P(box(0.09, 0.03, 0.09), IRON, [sx * 0.47, 0.012, sz * 0.27]);

  // iron on body
  for (const sx of [-1, 1]) {
    P(box(0.07, 0.45, 0.012), RUST, [sx * 0.34, 0.225, 0.306]);
    P(box(0.07, 0.45, 0.012), RUST, [sx * 0.34, 0.225, -0.306]);
    P(box(0.06, 0.46, 0.06), IRON, [sx * 0.49, 0.225, 0.29]);
    P(box(0.06, 0.46, 0.06), IRON, [sx * 0.49, 0.225, -0.29]);
    P(box(0.012, 0.07, 0.5), RUST, [sx * 0.506, 0.38, 0]);
    P(box(0.012, 0.07, 0.5), RUST, [sx * 0.506, 0.07, 0]);
    for (let k = 0; k < 4; k++) {
      P(new THREE.SphereGeometry(0.014, 5, 4), "#2b2724", [sx * 0.34, 0.06 + k * 0.11, 0.314]);
      P(new THREE.SphereGeometry(0.014, 5, 4), "#2b2724", [sx * 0.34, 0.06 + k * 0.11, -0.314]);
    }
  }
  P(box(1.02, 0.04, 0.012), IRON, [0, 0.42, 0.306]);
  P(box(1.02, 0.04, 0.012), IRON, [0, 0.03, 0.306]);
  P(box(1.02, 0.04, 0.012), IRON, [0, 0.42, -0.306]);
  for (let k = 0; k < 9; k++) P(new THREE.SphereGeometry(0.012, 5, 4), "#2b2724", [-0.4 + k * 0.1, 0.42, 0.314]);

  // hinges
  for (const sx of [-1, 1]) {
    P(box(0.08, 0.14, 0.012), IRON, [sx * 0.2, 0.38, -0.306]);
    const h = new THREE.CylinderGeometry(0.025, 0.025, 0.09, 6);
    h.rotateZ(Math.PI / 2);
    P(h, IRON, [sx * 0.2, 0.45, -0.31]);
  }

  // skull and crossbones carved on front
  const BONE = "#b59c70";
  for (const s of [-1, 1]) {
    P(box(0.2, 0.018, 0.012), "#8c7650", [0, 0.12, 0.306], [0, 0, s * 0.5]);
    for (const e of [-1, 1]) {
      P(new THREE.SphereGeometry(0.014, 5, 4), "#8c7650", [e * 0.085 * Math.cos(0.5) * 1, 0.12 + s * e * 0.085 * Math.sin(0.5), 0.306]);
    }
  }
  const cran = new THREE.SphereGeometry(0.055, 7, 5);
  cran.scale(1, 1, 0.3);
  P(cran, BONE, [0, 0.16, 0.308]);
  P(box(0.055, 0.035, 0.014), BONE, [0, 0.112, 0.308]);
  for (const e of [-1, 1]) {
    P(new THREE.SphereGeometry(0.014, 5, 4), "#1a0f06", [e * 0.022, 0.162, 0.318]);
  }
  P(box(0.01, 0.016, 0.01), "#1a0f06", [0, 0.135, 0.318]);
  P(box(0.04, 0.005, 0.01), "#1a0f06", [0, 0.115, 0.318]);

  // padlock hanging from the staple
  P(box(0.06, 0.07, 0.014), IRON, [0, 0.4, 0.31]);
  const staple = new THREE.TorusGeometry(0.02, 0.005, 4, 8);
  P(staple, IRON, [0, 0.37, 0.322], [0, 0, 0]);
  const lb = box(0.085, 0.075, 0.035);
  P(lb, "#8a6a1e", [0.01, 0.305, 0.335], [0, 0, 0.12]);
  const shackle = new THREE.TorusGeometry(0.026, 0.006, 4, 8, Math.PI);
  P(shackle, "#9a9a9e", [0.0, 0.342, 0.335], [0, 0, 0.12 + 0.6]);
  P(new THREE.SphereGeometry(0.008, 4, 3), "#1a1209", [0.006, 0.305, 0.354]);

  // ---------- lid (local frame: hinge origin, closed lid extends +z) ----------
  const barrel = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 10, 1, false, 0, Math.PI);
  barrel.rotateZ(Math.PI / 2);
  L(barrel, "#5f3d21", [0, 0, 0.3]);
  L(box(1.0, 0.03, 0.6), DARK, [0, 0.0, 0.3]);
  for (let i = -2; i <= 2; i++) {
    const seam = new THREE.CylinderGeometry(0.302, 0.302, 0.008, 10, 1, true, 0, Math.PI);
    seam.rotateZ(Math.PI / 2);
    L(seam, DARK, [i * 0.16, 0, 0.3]);
  }
  for (const sx of [-1, 1]) {
    const st = new THREE.CylinderGeometry(0.31, 0.31, 0.07, 10, 1, true, 0, Math.PI);
    st.rotateZ(Math.PI / 2);
    L(st, RUST, [sx * 0.34, 0, 0.3]);
    const st2 = new THREE.CylinderGeometry(0.31, 0.31, 0.07, 10, 1, true, 0, Math.PI);
    st2.rotateZ(Math.PI / 2);
    L(st2, RUST, [sx * 0.49, 0, 0.3]);
    for (let k = 0; k < 6; k++) {
      const phi = THREE.MathUtils.degToRad(15 + k * 30);
      L(new THREE.SphereGeometry(0.014, 5, 4), "#2b2724", [sx * 0.34, 0.317 * Math.sin(phi), 0.3 + 0.317 * Math.cos(phi)]);
    }
  }
  // lid front band and hasp
  const band = new THREE.CylinderGeometry(0.31, 0.31, 1.02, 10, 1, true, 0, 0.3);
  band.rotateZ(Math.PI / 2);
  L(band, IRON, [0, 0, 0.3]);
  const hphi = THREE.MathUtils.degToRad(18);
  L(box(0.08, 0.13, 0.012), IRON, [0, 0.31 * Math.sin(hphi) - 0.0, 0.3 + 0.31 * Math.cos(hphi)], [-hphi, 0, 0]);
  L(box(0.03, 0.03, 0.02), "#2b2724", [0, 0.31 * Math.sin(hphi) - 0.06, 0.3 + 0.31 * Math.cos(hphi) + 0.0], [-hphi, 0, 0]);

  // ---------- treasure ----------
  const pile = new THREE.SphereGeometry(0.45, 8, 5);
  pile.scale(0.92, 0.28, 0.55);
  P(pile, "#c8951a", [0, 0.42, 0]);
  const slope = new THREE.SphereGeometry(0.25, 7, 4);
  slope.scale(1.5, 0.5, 0.8);
  P(slope, "#d4a12a", [-0.1, 0.43, 0.3]);
  const floorMound = new THREE.SphereGeometry(0.25, 7, 4);
  floorMound.scale(1.1, 0.25, 0.9);
  P(floorMound, "#c8951a", [0.1, 0.0, 0.52]);

  const coinCols = ["#f2c230", "#e0a91e", "#ffd54a", "#caa02a"];
  const coin = (x: number, y: number, z: number, tilt: number) => {
    const g = new THREE.CylinderGeometry(0.032, 0.032, 0.009, 8);
    P(g, coinCols[Math.floor(R() * coinCols.length)], [x, y, z], [(R() - 0.5) * tilt, R() * 6, (R() - 0.5) * tilt]);
  };
  for (let i = 0; i < 90; i++) {
    const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 0.95;
    const x = Math.cos(a) * rr * 0.414, z = Math.sin(a) * rr * 0.2475;
    const y = 0.42 + 0.126 * Math.sqrt(Math.max(0, 1 - (x / 0.414) ** 2 - (z / 0.2475) ** 2));
    coin(x, y, z, 1.2);
  }
  for (let i = 0; i < 32; i++) {
    const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 0.9;
    const x = -0.1 + Math.cos(a) * rr * 0.375, z = 0.3 + Math.sin(a) * rr * 0.2;
    const y = 0.43 + 0.125 * Math.sqrt(Math.max(0, 1 - ((x + 0.1) / 0.375) ** 2 - ((z - 0.3) / 0.2) ** 2));
    coin(x, y, z, 1.0);
  }
  for (let i = 0; i < 28; i++) {
    const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 0.95;
    const x = 0.1 + Math.cos(a) * rr * 0.275, z = 0.52 + Math.sin(a) * rr * 0.225;
    const y = 0.0 + 0.0625 * Math.sqrt(Math.max(0, 1 - ((x - 0.1) / 0.275) ** 2 - ((z - 0.52) / 0.225) ** 2));
    coin(x, y + 0.004, z, 0.8);
  }
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI - 0.1, rr = 0.55 + R() * 0.35;
    coin(Math.cos(a) * rr * 0.9, 0.005, 0.35 + Math.sin(a) * rr * 0.6, 0.08);
  }
  // coin stack
  for (let i = 0; i < 6; i++) coin(-0.45, 0.005 + i * 0.009, 0.55, 0.05);

  // pearl necklace
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 0.52, 0.05),
    new THREE.Vector3(0.18, 0.54, 0.25),
    new THREE.Vector3(0.27, 0.47, 0.33),
    new THREE.Vector3(0.3, 0.3, 0.345),
    new THREE.Vector3(0.28, 0.12, 0.38),
    new THREE.Vector3(0.34, 0.025, 0.5),
    new THREE.Vector3(0.5, 0.02, 0.58),
    new THREE.Vector3(0.58, 0.02, 0.5),
  ]);
  const pts = curve.getSpacedPoints(46);
  pts.forEach((p, i) => {
    const pearl = new THREE.SphereGeometry(i % 9 === 4 ? 0.017 : 0.013, 6, 4);
    P(pearl, "#f3ede2", [p.x, Math.max(p.y, 0.014), p.z]);
  });
  P(new THREE.OctahedronGeometry(0.02, 0), "#e8b930", [0.58, 0.022, 0.5]);

  // goblet
  const gob = new THREE.LatheGeometry(
    [
      [0.0, 0.0], [0.05, 0.0], [0.05, 0.012], [0.013, 0.03], [0.013, 0.09],
      [0.04, 0.11], [0.058, 0.17], [0.055, 0.21], [0.047, 0.21], [0.0, 0.13],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    9
  );
  P(gob, "#e3b52e", [-0.27, 0.5, 0.0], [0.15, 0, 0.3]);
  const gemOnCup = (a: number, c: string) =>
    P(new THREE.OctahedronGeometry(0.013, 0), c, [-0.27 + Math.cos(a) * 0.05 - 0.04, 0.5 + 0.1, Math.sin(a) * 0.05 + 0.02]);
  gemOnCup(1.6, "#c4122b");
  gemOnCup(3.0, "#18a057");
  gemOnCup(4.6, "#c4122b");

  // loose gems
  const gems: [number, number, number, string, number][] = [
    [0.2, 0.56, -0.05, "#c4122b", 0.034],
    [-0.1, 0.55, 0.08, "#18a057", 0.03],
    [0.3, 0.53, 0.1, "#18a057", 0.026],
    [-0.35, 0.5, 0.15, "#c4122b", 0.028],
    [-0.28, 0.51, 0.34, "#c4122b", 0.032],
    [0.02, 0.04, 0.68, "#18a057", 0.034],
    [0.4, 0.03, 0.4, "#c4122b", 0.03],
  ];
  gems.forEach(([x, y, z, c, r], i) => {
    P(new THREE.OctahedronGeometry(r, 0), c, [x, y, z], [R() * 3, R() * 3, R() * 3]);
  });

  return b.root;
}
```