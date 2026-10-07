import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion resting with head held high: huge gradient mane from golden to chocolate, scarred brow, amber eyes, padded paws and a dark-tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const rand = rng(7);

  const TAWNY = "#c8925a";
  const TAWNY_D = "#b07c48";
  const CREAM = "#efdcb4";
  const DARK = "#3a2416";
  const TAN = "#d8b080";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.55, -0.7] });
  const spine = b.joint("spine", { at: [0, 0.6, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.65, 0.45], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.85, 0.7], parent: chest });
  const head = b.joint("head", { at: [0, 1.15, 0.9], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.05, 1.1], parent: head });

  const tailPts: number[][] = [
    [0, 0.45, -1.35],
    [0.05, 0.2, -1.75],
    [0.3, 0.1, -2.1],
    [0.55, 0.08, -2.4],
    [0.8, 0.08, -2.6],
  ];
  const tailJ: THREE.Object3D[] = [];
  tailPts.forEach((p, i) => {
    tailJ.push(b.joint("tail" + (i + 1), { at: p as [number, number, number], parent: i === 0 ? hips : (tailJ[i - 1] as any) }));
  });

  type J = any;
  const legs: Record<string, Record<string, J>> = {};
  for (const [side, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const shoulder = b.joint("shoulder" + side, { at: [0.27 * s, 0.6, 0.5], parent: chest });
    const elbow = b.joint("elbow" + side, { at: [0.27 * s, 0.22, 0.45], parent: shoulder });
    const wrist = b.joint("wrist" + side, { at: [0.27 * s, 0.14, 1.0], parent: elbow });
    const paw = b.joint("paw" + side, { at: [0.27 * s, 0.09, 1.15], parent: wrist });
    const hip = b.joint("hip" + side, { at: [0.4 * s, 0.45, -0.8], parent: hips });
    const knee = b.joint("knee" + side, { at: [0.45 * s, 0.22, -0.3], parent: hip });
    const hock = b.joint("hock" + side, { at: [0.4 * s, 0.14, -0.95], parent: knee });
    const hpaw = b.joint("hindPaw" + side, { at: [0.38 * s, 0.09, -0.5], parent: hock });
    legs[side] = { shoulder, elbow, wrist, paw, hip, knee, hock, hpaw };
  }

  // ---------- helpers ----------
  const add = (g: THREE.BufferGeometry, color: string, bone: J) =>
    b.part(g, color, { at: [0, 0, 0], bone });

  const ell = (
    rx: number, ry: number, rz: number,
    pos: number[], color: string, bone: J, w = 8, h = 6
  ) => {
    const g = new THREE.SphereGeometry(1, w, h);
    g.scale(rx, ry, rz);
    g.translate(pos[0], pos[1], pos[2]);
    return add(g, color, bone);
  };

  const orient = (g: THREE.BufferGeometry, dir: THREE.Vector3) => {
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    g.applyQuaternion(q);
  };

  const rod = (a: number[], c: number[], r0: number, r1: number, color: string, bone: J, seg = 7) => {
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const C = new THREE.Vector3(...(c as [number, number, number]));
    const d = C.clone().sub(A);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1);
    orient(g, d);
    const m = A.clone().add(C).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return add(g, color, bone);
  };

  const cone = (pos: THREE.Vector3, dir: THREE.Vector3, r: number, h: number, color: string, bone: J, seg = 5) => {
    const g = new THREE.ConeGeometry(r, h, seg, 1);
    orient(g, dir);
    const c = pos.clone().add(dir.clone().normalize().multiplyScalar(h / 2));
    g.translate(c.x, c.y, c.z);
    return add(g, color, bone);
  };

  // ---------- torso ----------
  ell(0.4, 0.42, 0.95, [0, 0.52, -0.3], TAWNY, spine, 10, 8);
  ell(0.36, 0.34, 0.5, [0, 0.46, -0.5], TAWNY, hips, 8, 6);
  ell(0.3, 0.3, 0.8, [0, 0.4, -0.15], CREAM, spine, 8, 6); // belly
  ell(0.4, 0.5, 0.45, [0, 0.62, 0.5], TAWNY, chest, 9, 7); // chest
  ell(0.28, 0.3, 0.3, [0, 0.45, 0.72], CREAM, chest, 8, 6); // chest cream
  ell(0.3, 0.2, 0.4, [0, 0.95, 0.35], TAWNY_D, chest, 8, 6); // shoulder hump
  rod([0, 0.82, 0.55], [0, 1.12, 0.88], 0.27, 0.22, TAWNY, neck, 8);

  // ---------- legs ----------
  for (const [side, s] of [["L", 1], ["R", -1]] as [string, number][]) {
    const l = legs[side];
    ell(0.17, 0.3, 0.22, [0.3 * s, 0.5, 0.5], TAWNY_D, l.shoulder, 7, 6);
    rod([0.27 * s, 0.55, 0.5], [0.27 * s, 0.2, 0.5], 0.14, 0.11, TAWNY, l.shoulder);
    ell(0.11, 0.1, 0.11, [0.27 * s, 0.2, 0.47], TAWNY, l.elbow, 6, 5);
    rod([0.27 * s, 0.2, 0.47], [0.27 * s, 0.13, 1.0], 0.1, 0.085, TAWNY, l.elbow);
    // paw
    ell(0.115, 0.085, 0.17, [0.27 * s, 0.085, 1.15], TAN, l.paw, 8, 6);
    for (let t = -1; t <= 1; t++) {
      ell(0.036, 0.034, 0.045, [(0.27 + t * 0.06) * s, 0.06, 1.3 - Math.abs(t) * 0.02], CREAM, l.paw, 5, 4);
      ell(0.014, 0.014, 0.025, [(0.27 + t * 0.06) * s, 0.04, 1.35 - Math.abs(t) * 0.02], DARK, l.paw, 4, 3);
    }
    // hind
    ell(0.2, 0.31, 0.38, [0.42 * s, 0.42, -0.72], TAWNY, l.hip, 9, 7);
    rod([0.43 * s, 0.35, -0.55], [0.4 * s, 0.14, -0.95], 0.13, 0.08, TAWNY_D, l.knee);
    ell(0.1, 0.085, 0.3, [0.38 * s, 0.085, -0.62], TAN, l.hpaw, 8, 6);
    for (let t = -1; t <= 1; t++) {
      ell(0.032, 0.03, 0.04, [(0.38 + t * 0.055) * s, 0.05, -0.31], CREAM, l.hpaw, 5, 4);
    }
  }

  // ---------- tail ----------
  for (let i = 0; i < tailPts.length - 1; i++) {
    const r0 = 0.07 - i * 0.008;
    const r1 = 0.07 - (i + 1) * 0.008;
    rod(tailPts[i], tailPts[i + 1], r0, r1, TAWNY_D, tailJ[i] as J, 6);
    ell(r1 * 1.05, r1 * 1.05, r1 * 1.05, tailPts[i + 1], TAWNY_D, tailJ[i] as J, 5, 4);
  }
  {
    const last = tailPts[tailPts.length - 1];
    ell(0.1, 0.1, 0.2, [last[0] + 0.07, 0.12, last[2] - 0.12], DARK, tailJ[4] as J, 7, 6);
    ell(0.07, 0.07, 0.12, [last[0] + 0.15, 0.1, last[2] - 0.28], "#2a180e", tailJ[4] as J, 6, 5);
  }

  // ---------- head ----------
  ell(0.25, 0.22, 0.27, [0, 1.2, 0.95], TAWNY, head, 10, 8);
  ell(0.15, 0.115, 0.17, [0, 1.1, 1.22], CREAM, head, 8, 6); // muzzle
  ell(0.12, 0.05, 0.1, [0, 1.17, 1.3], TAN, head, 7, 5); // nose bridge
  ell(0.08, 0.055, 0.055, [0, 1.16, 1.4], "#120c0a", head, 7, 5); // broad nose
  ell(0.03, 0.02, 0.025, [0.04, 1.185, 1.42], "#2b1f1c", head, 4, 3);
  // brow ridges
  for (const s of [1, -1]) {
    ell(0.1, 0.035, 0.08, [0.13 * s, 1.32, 1.07], TAWNY_D, head, 6, 4);
    // eyes
    ell(0.042, 0.04, 0.035, [0.13 * s, 1.26, 1.13], "#f0a820", head, 7, 5);
    ell(0.018, 0.026, 0.012, [0.13 * s, 1.26, 1.163], "#150c08", head, 5, 4);
    // ears
    ell(0.07, 0.07, 0.035, [0.2 * s, 1.4, 0.85], TAWNY_D, head, 7, 5);
    ell(0.045, 0.045, 0.02, [0.2 * s, 1.4, 0.875], DARK, head, 6, 4);
    // whisker pads + dots
    ell(0.06, 0.045, 0.07, [0.1 * s, 1.08, 1.3], CREAM, head, 6, 5);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        ell(0.009, 0.009, 0.009, [(0.07 + c * 0.04) * s, 1.1 - r * 0.02, 1.37 - c * 0.01], DARK, head, 4, 3);
      }
    }
    // dark tear lines
    rod([0.14 * s, 1.22, 1.14], [0.13 * s, 1.14, 1.2], 0.008, 0.006, DARK, head, 4);
  }
  // scar across left (+X) eyebrow
  {
    const g = new THREE.BoxGeometry(0.014, 0.17, 0.014);
    g.rotateZ(-0.45);
    g.translate(0.13, 1.33, 1.125);
    add(g, "#8a3f38", head);
    const g2 = new THREE.BoxGeometry(0.008, 0.19, 0.008);
    g2.rotateZ(-0.45);
    g2.translate(0.13, 1.33, 1.133);
    add(g2, "#d9a89a", head);
  }
  // lower jaw
  ell(0.1, 0.04, 0.14, [0, 1.025, 1.22], CREAM, jaw, 7, 5);
  ell(0.055, 0.035, 0.05, [0, 1.03, 1.34], TAN, jaw, 5, 4);
  for (const s of [1, -1]) {
    cone(new THREE.Vector3(0.06 * s, 1.05, 1.3), new THREE.Vector3(0, 1, 0), 0.012, 0.045, "#fffbea", jaw, 4);
    cone(new THREE.Vector3(0.06 * s, 1.1, 1.32), new THREE.Vector3(0, -1, 0), 0.012, 0.045, "#fffbea", head, 4);
  }

  // ---------- mane ----------
  const maneColors = ["#d9a841", "#c08a30", "#996022", "#74421a", "#52301a", "#3a2012"];
  const center = new THREE.Vector3(0, 1.08, 0.72);
  const layers = maneColors.length;
  for (let k = 0; k < layers; k++) {
    const sc = 0.62 + k * 0.1;
    const n = 26 + k * 12;
    const rx = 0.5 * sc, ry = 0.55 * sc, rz = 0.4 * sc;
    for (let i = 0; i < n; i++) {
      const y = 1 - (2 * (i + 0.5)) / n;
      const rr = Math.sqrt(1 - y * y);
      const th = i * 2.39996 + k * 0.7;
      const dir = new THREE.Vector3(rr * Math.cos(th), y, rr * Math.sin(th));
      // keep the face open
      if (dir.z > 0.35 + k * 0.05) continue;
      const pos = new THREE.Vector3(
        center.x + dir.x * rx,
        center.y + dir.y * ry - 0.05,
        center.z + dir.z * rz - 0.08
      );
      if (pos.y < 0.3) continue;
      const out = dir.clone();
      out.add(new THREE.Vector3((rand() - 0.5) * 0.3, -0.35 - rand() * 0.2, -0.4 + (rand() - 0.5) * 0.2));
      const h = 0.2 + k * 0.035 + rand() * 0.06;
      const r = 0.075 + k * 0.006;
      cone(pos, out, r, h, maneColors[k], head);
    }
  }
  // hanging chest / ruff mane
  for (let i = 0; i < 34; i++) {
    const x = (rand() - 0.5) * 0.7;
    const y = 0.5 + rand() * 0.35;
    const z = 0.55 + rand() * 0.3;
    const col = maneColors[3 + Math.floor(rand() * 3)];
    cone(
      new THREE.Vector3(x, y + 0.15, z),
      new THREE.Vector3(x * 0.4, -1, 0.15),
      0.07, 0.25 + rand() * 0.1, col, chest
    );
  }
  // golden frame tufts around the face
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const pos = new THREE.Vector3(Math.cos(a) * 0.25, 1.2 + Math.sin(a) * 0.23, 0.92);
    if (pos.y < 0.9 && Math.abs(pos.x) < 0.1) continue;
    cone(pos, new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0.5), 0.05, 0.16, "#e2b04a", head);
  }

  // belly-side fur tufts on the elbows
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      cone(
        new THREE.Vector3(0.3 * s, 0.22 - i * 0.02, 0.4 - i * 0.05),
        new THREE.Vector3(0.3 * s, -0.5, -1),
        0.04, 0.12, "#7a4a22", legs[s > 0 ? "L" : "R"].elbow
      );
    }
  }

  return b.root;
}
