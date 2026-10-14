import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Moon Jellyfish",
  description:
    "Glowing translucent moon jellyfish with a pale-blue bell, four pink horseshoe gonads, a fringe of rim tentacles and four ruffled oral arms.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "moonJelly" });

  const BELL = "#a9d6f2";
  const CORE = "#fff1f9";
  const HORSE = "#ff7db9";
  const FRINGE = "#f6c9e6";
  const PEARL = "#efeaf8";
  const LILAC = "#c6b0ec";
  const RUFFLE = "#dccdf6";

  // Glow and translucency on the shared materials.
  const glow = (color: string, emissive: string, intensity: number, opacity = 1) => {
    const m = b.material(color) as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = intensity;
    if (opacity < 1) {
      m.transparent = true;
      m.opacity = opacity;
      m.depthWrite = false;
    }
    m.roughness = 0.35;
  };
  glow(BELL, "#4fa6e8", 0.55, 0.5);
  glow(CORE, "#ffd6f0", 1.6);
  glow(HORSE, "#ff4f9f", 0.9, 0.9);
  glow(FRINGE, "#ff9ad0", 0.6, 0.8);
  glow(PEARL, "#bfb2ff", 0.45, 0.85);
  glow(LILAC, "#9a7cf0", 0.55, 0.85);
  glow(RUFFLE, "#b090f5", 0.55, 0.8);

  // Skeleton
  const BY = 0.58;
  b.joint("root", { at: [0, 0.4, 0], dir: [0, 1, 0] });
  b.joint("bell", { parent: "root", at: [0, BY, 0], dir: [0, 1, 0], role: "spine" });

  // Bell dome (lathe: x = radius, y = height above BY)
  b.lathe(
    [
      [0, 0.19],
      [0.1, 0.18],
      [0.18, 0.13],
      [0.225, 0.05],
      [0.245, -0.02],
      [0.235, -0.035],
      [0.205, 0.0],
      [0.165, 0.08],
      [0.09, 0.14],
      [0, 0.155],
    ],
    { color: BELL, at: [0, BY, 0], bone: "bell", segments: 16, name: "bellShell" },
  );

  // Glowing core
  b.part(new THREE.SphereGeometry(0.05, 8, 6), CORE, { at: [0, BY + 0.04, 0], scale: [1, 0.7, 1], bone: "bell" });
  b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.08, 8), CORE, { at: [0, BY - 0.03, 0], bone: "bell" });

  // Four horseshoes
  const arc = 4.4;
  const gapAng = arc + (Math.PI * 2 - arc) / 2;
  const gap0 = new THREE.Vector3(Math.cos(gapAng), 0, -Math.sin(gapAng));
  const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  for (let k = 0; k < 4; k++) {
    const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (k * Math.PI) / 2 + Math.PI / 4);
    const gd = gap0.clone().applyQuaternion(qy);
    const pos = new THREE.Vector3(0, BY + 0.045, 0).addScaledVector(gd, -0.075);
    b.part(new THREE.TorusGeometry(0.055, 0.017, 5, 10, arc), HORSE, {
      at: pos,
      quat: qy.clone().multiply(qx),
      bone: "bell",
      name: `horseshoe${k + 1}`,
    });
  }

  // Rim fringe band
  const rimY = BY - 0.03;
  b.part(new THREE.TorusGeometry(0.235, 0.011, 5, 24), FRINGE, {
    at: [0, rimY, 0],
    rotation: [90, 0, 0],
    bone: "bell",
    name: "rimBand",
  });

  // Rim tentacles in 8 groups
  const groups = 8;
  const rimJoints: string[] = [];
  for (let g = 0; g < groups; g++) {
    const a = ((g + 0.5) / groups) * Math.PI * 2;
    const name = `rimTentacle${g + 1}`;
    b.joint(name, {
      parent: "bell",
      at: [Math.sin(a) * 0.235, rimY, Math.cos(a) * 0.235],
      dir: [Math.sin(a) * 0.3, -1, Math.cos(a) * 0.3],
    });
    rimJoints.push(name);
  }
  const tentGeo = new THREE.CylinderGeometry(0.0032, 0.0022, 0.1, 4);
  const count = 56;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const bone = rimJoints[Math.floor((i * groups) / count)];
    const p0 = new THREE.Vector3(sx * 0.236, rimY, cz * 0.236);
    const d1 = new THREE.Vector3(sx * 0.3, -1, cz * 0.3).normalize();
    const p1 = p0.clone().addScaledVector(d1, 0.1);
    const w = Math.sin(i * 1.7) * 0.25;
    const d2 = new THREE.Vector3(sx * 0.1 + w * cz, -1, cz * 0.1 - w * sx).normalize();
    const p2 = p1.clone().addScaledVector(d2, 0.1);
    b.part(tentGeo, FRINGE, { at: p0.clone().add(p1).multiplyScalar(0.5), dir: d1, bone });
    b.part(tentGeo, FRINGE, { at: p1.clone().add(p2).multiplyScalar(0.5), dir: d2, bone });
  }

  // Oral arms
  const frill = new THREE.BoxGeometry(0.075, 0.016, 0.006);
  for (let k = 0; k < 4; k++) {
    const phi = (k * Math.PI) / 2 + Math.PI / 4;
    const ox = Math.sin(phi);
    const oz = Math.cos(phi);
    const tx = oz;
    const tz = -ox;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 5; i++) {
      const s = i / 5;
      const out = 0.03 + 0.05 * Math.sin(s * 2.4);
      const wob = 0.025 * Math.sin(s * 5 + k * 1.3) * s;
      pts.push(
        new THREE.Vector3(ox * out + tx * wob, BY - 0.02 - s * 0.54 + (i === 5 ? 0.0 : 0), oz * out + tz * wob),
      );
    }
    const names = Array.from({ length: 5 }, (_, i) => `oralArm${k + 1}_${i + 1}`);
    const chain = b.chain(`oralArm${k + 1}`, pts, {
      parent: "bell",
      count: 5,
      names,
      role: "tentacle",
      up: [ox, 0, oz],
    });
    b.sweep(chain, (t) => [0.03 * (1 - 0.65 * t) * (1 + 0.2 * Math.sin(t * 28)), 0.012 * (1 - 0.5 * t)], {
      bands: [
        [0.5, PEARL],
        [1, LILAC],
      ],
      sides: 6,
      name: `oralArmCore${k + 1}`,
    });
    let n = 0;
    b.along(chain, 14, (p) => {
      const t = p.t;
      const sc = 1.15 - 0.7 * t;
      const side = n % 2 === 0 ? 1 : -1;
      b.part(frill, n % 3 === 0 ? PEARL : t > 0.5 ? LILAC : RUFFLE, {
        frame: p,
        at: p.local([side * 0.03 * sc, 0, 0]),
        rotation: [0, 0, 0],
        quat: p.quat.clone().multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, side * 0.5 + n * 0.4, side * 0.5)),
        ),
        scale: [sc, 1, 1],
        name: `ruffle${k + 1}_${n}`,
      });
      n++;
    });
  }

  return b.root;
}
