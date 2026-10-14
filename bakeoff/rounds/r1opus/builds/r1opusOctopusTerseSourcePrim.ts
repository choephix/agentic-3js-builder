import * as THREE from "three";
import { createBuilder, rng, paint, spots, mottle, countershade, catmull } from "../../../../src/index";

export const meta = {
  name: "Coral Octopus",
  description:
    "A stylized common octopus in a rigging rest pose: bulbous spotted mantle, turret eyes with bar pupils and brow papillae, eight splayed tentacles with cream sucker rows, webbing between the arms, a siphon and a two-part beak.",
};

export default function build() {
  const b = createBuilder({ name: "octopus", detail: 1, paintSize: 1024 });

  // ---------- Palette ----------
  const RED = "#e0533d";
  const RED_DARK = "#b8382c";
  const DEEP = "#8e2a2a";
  const APRICOT = "#f39a5c";
  const BELLY = "#f5c2a8";
  const SUCKER = "#f8e3c8";
  const SUCKER_IN = "#d9806f";
  const WEB = "#c2413a";
  const BEAK = "#2b1d1a";
  const EYE = "#fff4d6";
  const IRIS = "#f0b429";
  const PUPIL = "#1a1214";

  const skin = mottle(RED, "#c9443a", { size: 0.08, seed: 2 });
  const bodyPaint = spots(skin, [APRICOT, DEEP, APRICOT], { size: 0.045, amount: 0.35, seed: 5 });
  const armPaint = countershade(bodyPaint, BELLY, { level: -0.3, soft: 0.25 });
  const tipPaint = paint((p, n) => (p.y < 0.0 ? BELLY : armPaint));

  // ---------- Skeleton core ----------
  const hubC = new THREE.Vector3(0, 0.17, 0);
  b.joint("root", { at: [0, 0.12, 0] });
  b.joint("head", { at: [0, 0.17, 0.02], parent: "root", dir: [0, 1, 0], role: "head" });

  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.2, -0.01],
      [0, 0.34, -0.07],
      [0, 0.495, -0.14],
    ]),
    { parent: "head", names: ["mantle1", "mantle2", "mantleTip"], role: "spine" },
  );

  // ---------- Head hub & mantle ----------
  b.part(new THREE.SphereGeometry(0.13, 14, 10), bodyPaint, {
    at: hubC,
    scale: [1, 0.85, 1],
    bone: "head",
    name: "headHub",
  });

  const mantleSweep = b.loft(
    [
      { at: [0, 0.2, -0.01], w: 0.2, h: 0.2 },
      { at: [0, 0.3, -0.05], w: 0.3, h: 0.28 },
      { at: [0, 0.4, -0.1], w: 0.27, h: 0.25 },
      { at: [0, 0.47, -0.13], w: 0.15, h: 0.13 },
      { at: [0, 0.495, -0.14], w: 0.04, h: 0.04 },
    ],
    { color: bodyPaint, bone: mantle, sides: 14, name: "mantle" },
  );

  // Papillae bumps on the mantle
  const bumps = b.surface(mantleSweep).scatter(26, {
    rng: rng(3),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.2 && h.at.y > 0.26,
  });
  for (const h of bumps) b.stick(new THREE.ConeGeometry(0.007, 0.02, 5), "#d4604a", h, { embed: 0.35 });

  // Siphon on the right side
  const siphonA = new THREE.Vector3(-0.1, 0.21, -0.07);
  const siphonB = new THREE.Vector3(-0.175, 0.175, -0.03);
  b.rod(siphonA, siphonB, [0.026, 0.019], { color: RED_DARK, bone: "head", name: "siphon" });
  b.part(new THREE.TorusGeometry(0.017, 0.005, 5, 10), "#9c2f28", {
    at: siphonB,
    dir: siphonB.clone().sub(siphonA),
    axis: "z",
    bone: "head",
    name: "siphonLip",
  });

  // ---------- Eyes ----------
  for (const side of [1, -1]) {
    const tag = side > 0 ? "L" : "R";
    const az = side * 48 * (Math.PI / 180);
    const el = 26 * (Math.PI / 180);
    const d = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
    const turret = hubC.clone().addScaledVector(d, 0.1);
    b.joint(`eye${tag}`, { at: turret, parent: "head", dir: d });
    b.part(new THREE.SphereGeometry(0.056, 12, 8), bodyPaint, { at: turret, bone: `eye${tag}`, name: `eyeTurret${tag}` });
    const ball = hubC.clone().addScaledVector(d, 0.14);
    b.part(new THREE.SphereGeometry(0.042, 12, 9), EYE, { at: ball, bone: `eye${tag}`, name: `eyeball${tag}` });
    b.part(new THREE.CylinderGeometry(0.029, 0.029, 0.006, 14), IRIS, {
      at: ball.clone().addScaledVector(d, 0.039),
      dir: d,
      bone: `eye${tag}`,
      name: `iris${tag}`,
    });
    b.part(new THREE.BoxGeometry(0.046, 0.011, 0.01), PUPIL, {
      at: ball.clone().addScaledVector(d, 0.042),
      dir: d,
      axis: "z",
      up: [0, 1, 0],
      bone: `eye${tag}`,
      name: `pupil${tag}`,
    });
    b.part(new THREE.SphereGeometry(0.0065, 6, 4), "#ffffff", {
      at: ball.clone().addScaledVector(d, 0.045).add(new THREE.Vector3(side * 0.008, 0.013, 0)),
      bone: `eye${tag}`,
      name: `glint${tag}`,
    });
    // Eyelid arc over the top
    b.part(new THREE.TorusGeometry(0.047, 0.012, 6, 12, Math.PI), RED_DARK, {
      at: ball.clone().addScaledVector(d, 0.012),
      dir: d,
      axis: "z",
      up: [0, 1, 0],
      bone: `eye${tag}`,
      name: `lid${tag}`,
    });
    // Brow papilla horn
    const elB = 52 * (Math.PI / 180);
    const azB = side * 40 * (Math.PI / 180);
    const dB = new THREE.Vector3(Math.sin(azB) * Math.cos(elB), Math.sin(elB), Math.cos(azB) * Math.cos(elB));
    const base = hubC.clone().addScaledVector(dB, 0.13);
    b.spike(base, dB.clone().add(new THREE.Vector3(0, 0.6, 0)), 0.035, 0.009, {
      color: RED_DARK,
      bone: `eye${tag}`,
      name: `brow${tag}`,
      sides: 5,
    });
  }

  // ---------- Beak (upper + lower jaw) ----------
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 12), BELLY, { at: [0, 0.062, 0], bone: "head", name: "oralDisc" });
  b.part(new THREE.ConeGeometry(0.02, 0.034, 6), BEAK, {
    at: [0, 0.05, 0.006],
    rotation: [180, 0, 0],
    bone: "head",
    name: "beakUpper",
  });
  b.joint("jaw", { at: [0, 0.062, -0.006], parent: "head", dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.014, 0.024, 6), "#4a302a", {
    at: [0, 0.052, -0.012],
    rotation: [200, 0, 0],
    bone: "jaw",
    name: "beakLower",
  });

  // ---------- Arms ----------
  const arms: { name: string; az: number }[] = [
    { name: "armL1", az: 22.5 },
    { name: "armL2", az: 67.5 },
    { name: "armL3", az: 112.5 },
    { name: "armL4", az: 157.5 },
    { name: "armR4", az: -157.5 },
    { name: "armR3", az: -112.5 },
    { name: "armR2", az: -67.5 },
    { name: "armR1", az: -22.5 },
  ];
  const rad = (t: number) => 0.042 * (1 - t) + 0.005;
  const ds = [0.06, 0.16, 0.28, 0.4, 0.52, 0.63, 0.72];
  const curl = [0, 0, 0, 0, 0.01, 0.03, 0.06];

  const chains = arms.map((arm, ai) => {
    const a = arm.az * (Math.PI / 180);
    const h = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const s = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)).multiplyScalar(Math.sign(a));
    const pts = ds.map((d, k) => {
      const t = (d - ds[0]) / (ds[ds.length - 1] - ds[0]);
      const ry = 0.8 * rad(t);
      const y = k === 0 ? 0.13 : k === 1 ? 0.072 : k === 5 ? ry + 0.006 : k === 6 ? 0.03 : ry * 0.95;
      return h.clone().multiplyScalar(d).addScaledVector(s, curl[k]).setY(y);
    });
    const names = [1, 2, 3, 4, 5].map((i) => `${arm.name}_${i}`).concat([`${arm.name}_tip`]);
    const chain = b.chain(arm.name, catmull(pts), {
      parent: "root",
      count: 5,
      names,
      up: [0, 1, 0],
      role: "tentacle",
    });
    const sw = b.sweep(chain, (t) => [rad(t), 0.8 * rad(t)], {
      color: tipPaint,
      sides: 10,
      name: `${arm.name}Skin`,
    });
    // Sucker rows along both lower flanks
    const n = 13;
    for (let k = 0; k < n; k++) {
      const t = 0.1 + (0.86 * (k + 0.5)) / n;
      for (const ang of [112, 248]) {
        const pt = sw.at(t, ang + (k % 2 ? 6 : -6));
        const r = Math.max(pt.radius * 0.34, 0.0028);
        b.stick(new THREE.CylinderGeometry(r, r * 1.12, r * 0.6, 8), SUCKER, pt, {
          embed: 0.3,
          name: `sucker.${arm.name}.${k}.${ang}`,
        });
        b.stick(new THREE.CylinderGeometry(r * 0.5, r * 0.5, r * 0.72, 7), SUCKER_IN, pt, {
          embed: 0.3,
          name: `cup.${arm.name}.${k}.${ang}`,
        });
      }
    }
    void ai;
    return chain;
  });

  // ---------- Webbing between neighbouring arms ----------
  const webTs = [0.0, 0.07, 0.14, 0.21, 0.28, 0.34];
  for (let i = 0; i < chains.length; i++) {
    const A = chains[i];
    const B = chains[(i + 1) % chains.length];
    b.membrane(
      webTs.map((t) => A.at(t)),
      webTs.map((t) => B.at(t)),
      { color: WEB, thickness: 0.006, scallop: 0.55, rows: 4, name: `web${i + 1}` },
    );
  }

  return b.root;
}
