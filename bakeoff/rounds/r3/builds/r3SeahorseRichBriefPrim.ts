import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with a ridged body, dark thin lines, white freckles, a spiky crown, a tube snout, a fluttering dorsal fin and big curious eyes, gripping a strand of seagrass with its curled tail.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "lined_seahorse" });
  const rand = rng(7);

  // palette
  const YEL = "#f4c430";
  const YEL_L = "#fadd6e";
  const ORG = "#e39a1b";
  const DARK = "#5b3a12";
  const WHITE = "#fffdf4";
  const FIN = "#f8e6a4";
  const GOLD = "#f0a81e";
  const BLACK = "#16110c";
  const GRASS = "#3f9d4f";
  const GRASS_D = "#2a7439";
  const SAND = "#dccb94";
  const PEB = "#b3a47a";

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { at: [0, 0.095, 0.015], parent: root });
  const spine1 = b.joint("spine1", { at: [0, 0.125, 0.018], parent: hips });
  const spine2 = b.joint("spine2", { at: [0, 0.15, 0.02], parent: spine1 });
  const neck = b.joint("neck", { at: [0, 0.172, 0.014], parent: spine2 });
  const head = b.joint("head", { at: [0, 0.19, 0.012], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.19, 0.04], parent: head });

  // tail curl around the seagrass stem
  const C = { y: 0.06, z: 0.05 };
  const tailPts: V[] = [];
  const tailJ: any[] = [];
  const tailR: number[] = [];
  let prev: any = hips;
  for (let k = 0; k < 9; k++) {
    const th = ((165 + k * 40) * Math.PI) / 180;
    const R = 0.021 - k * 0.001;
    const p: V = [0, C.y + R * Math.sin(th), C.z + R * Math.cos(th)];
    tailPts.push(p);
    tailR.push(0.0115 - k * 0.00095);
    prev = b.joint("tail" + (k + 1), { at: p, parent: prev });
    tailJ.push(prev);
  }

  const dorsal = b.joint("dorsalFin", { at: [0, 0.13, -0.004], parent: spine1 });
  const finJ: any[] = [];
  const finY = [0.1, 0.111, 0.122, 0.133, 0.144, 0.155];
  finY.forEach((y, i) => {
    finJ.push(b.joint("finRay" + (i + 1), { at: [0, y, -0.004], parent: dorsal }));
  });
  const pecL = b.joint("pectoralL", { at: [0.017, 0.155, 0.0], parent: spine2 });
  const pecR = b.joint("pectoralR", { at: [-0.017, 0.155, 0.0], parent: spine2 });

  // ---------- helpers ----------
  const ell = (rx: number, ry: number, rz: number, s = 9, r = 7) =>
    new THREE.SphereGeometry(1, s, r).scale(rx, ry, rz);
  const norm = (v: V): V => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
  const len = (v: V) => Math.hypot(v[0], v[1], v[2]);
  const midp = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

  const cone = (base: V, dir: V, l: number, r: number, color: string, bone: any, seg = 5) => {
    const d = norm(dir);
    const at: V = [base[0] + (d[0] * l) / 2, base[1] + (d[1] * l) / 2, base[2] + (d[2] * l) / 2];
    b.part(new THREE.ConeGeometry(r, l, seg), color, { at, bone, dir: d });
  };
  const rod = (a: V, c: V, ra: number, rb: number, color: string, bone: any, seg = 6) => {
    const d = sub(c, a);
    const l = len(d);
    // top radius at c, bottom at a
    b.part(new THREE.CylinderGeometry(rb, ra, l, seg), color, { at: midp(a, c), bone, dir: norm(d) });
  };

  // ridge rings + back spines + freckles on an ellipsoid body segment
  const ringsOn = (cy: number, cz: number, rx: number, ry: number, rz: number, n: number, bone: any) => {
    for (let i = 0; i < n; i++) {
      const f = -0.78 + (1.56 * i) / (n - 1);
      const s = Math.sqrt(1 - f * f);
      const g = new THREE.TorusGeometry(1, 0.06, 3, 14).rotateX(Math.PI / 2).scale(rx * s * 1.05, 0.02, rz * s * 1.05);
      b.part(g, DARK, { at: [0, cy + f * ry, cz], bone });
      cone([0, cy + f * ry, cz - rz * s * 0.98], [0, 0.35, -1], 0.009, 0.0033, ORG, bone, 4);
    }
  };
  const freckles = (cy: number, cz: number, rx: number, ry: number, rz: number, n: number, bone: any) => {
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const f = (rand() * 2 - 1) * 0.7;
      const ph = (rand() * 2 - 1) * 0.7;
      const s = Math.sqrt(1 - f * f);
      const at: V = [side * rx * s * Math.cos(ph) * 1.0, cy + f * ry, cz + rz * s * Math.sin(ph)];
      b.part(ell(0.0024, 0.0024, 0.0024, 5, 4), WHITE, { at, bone });
    }
  };

  // ---------- body ----------
  // belly
  b.part(ell(0.024, 0.042, 0.03, 10, 8), YEL, { at: [0, 0.115, 0.025], bone: hips });
  b.part(ell(0.018, 0.032, 0.02, 8, 6), YEL_L, { at: [0, 0.108, 0.047], bone: hips });
  ringsOn(0.115, 0.025, 0.024, 0.042, 0.03, 7, hips);
  freckles(0.115, 0.025, 0.024, 0.042, 0.03, 8, hips);
  // chest
  b.part(ell(0.02, 0.03, 0.025, 9, 7), YEL, { at: [0, 0.15, 0.025], bone: spine2 });
  ringsOn(0.15, 0.025, 0.02, 0.03, 0.025, 4, spine2);
  freckles(0.15, 0.025, 0.02, 0.03, 0.025, 4, spine2);
  // neck
  b.part(ell(0.014, 0.026, 0.015, 8, 6), YEL, { at: [0, 0.177, 0.012], bone: neck });
  for (let i = 0; i < 3; i++) {
    const y = 0.168 + i * 0.01;
    const g = new THREE.TorusGeometry(1, 0.07, 3, 10).rotateX(Math.PI / 2).scale(0.0145, 0.02, 0.0155);
    b.part(g, DARK, { at: [0, y, 0.012], bone: neck });
    cone([0, y, -0.002], [0, 0.3, -1], 0.007, 0.003, ORG, neck, 4);
  }

  // ---------- head ----------
  b.part(ell(0.016, 0.02, 0.022, 9, 7), YEL, { at: [0, 0.2, 0.016], bone: head });
  b.part(ell(0.012, 0.01, 0.012, 7, 5), YEL_L, { at: [0, 0.19, 0.03], bone: head }); // cheek/throat
  // brow ridge
  b.part(ell(0.018, 0.004, 0.01, 7, 4), ORG, { at: [0, 0.213, 0.027], bone: head });

  // snout (upper tube)
  const sBase: V = [0, 0.196, 0.032];
  const sTip: V = [0, 0.182, 0.085];
  rod(sBase, sTip, 0.0098, 0.0055, YEL, head, 7);
  for (const t of [0.3, 0.55, 0.8]) {
    const p: V = [0, sBase[1] + (sTip[1] - sBase[1]) * t, sBase[2] + (sTip[2] - sBase[2]) * t];
    const r = 0.0098 + (0.0055 - 0.0098) * t + 0.0006;
    b.part(new THREE.CylinderGeometry(r, r, 0.0012, 7), DARK, { at: p, bone: head, dir: norm(sub(sTip, sBase)) });
  }
  b.part(ell(0.0052, 0.0052, 0.004, 6, 4), DARK, { at: [0, 0.1815, 0.0855], bone: head }); // nostril end
  // lower jaw
  const jBase: V = [0, 0.186, 0.04];
  const jTip: V = [0, 0.176, 0.081];
  rod(jBase, jTip, 0.0055, 0.0032, YEL_L, jaw, 6);

  // eyes
  for (const s of [1, -1]) {
    b.part(ell(0.0075, 0.0095, 0.0095, 8, 6), GOLD, { at: [s * 0.0135, 0.205, 0.026], bone: head });
    b.part(ell(0.0045, 0.0065, 0.0065, 7, 5), BLACK, { at: [s * 0.0175, 0.205, 0.0265], bone: head });
    b.part(ell(0.0015, 0.0018, 0.0018, 5, 4), WHITE, { at: [s * 0.0207, 0.2085, 0.0295], bone: head });
    // eyelid ridge
    b.part(ell(0.0035, 0.0018, 0.0105, 5, 4), ORG, { at: [s * 0.0128, 0.2145, 0.026], bone: head });
  }

  // crown of spikes
  for (let i = 0; i < 5; i++) {
    const u = (i / 4) * 2 - 1;
    const l = 0.016 - Math.abs(u) * 0.006;
    cone([u * 0.011, 0.216 - Math.abs(u) * 0.004, 0.012], [u * 0.55, 1, -0.45], l, 0.0034, ORG, head, 5);
  }
  cone([0, 0.214, 0.004], [0, 0.7, -1], 0.012, 0.003, ORG, head, 5);
  cone([0, 0.2, -0.004], [0, 0.2, -1], 0.009, 0.003, ORG, head, 5);

  // ---------- pectoral fins ----------
  for (const [j, s] of [[pecL, 1], [pecR, -1]] as [any, number][]) {
    const g = new THREE.BoxGeometry(0.0012, 0.013, 0.015);
    b.part(g, FIN, { at: [s * 0.0215, 0.155, -0.002], bone: j });
    b.part(new THREE.BoxGeometry(0.002, 0.0015, 0.016), ORG, { at: [s * 0.0215, 0.155, -0.002], bone: j });
  }

  // ---------- dorsal fin ----------
  finY.forEach((y, i) => {
    const tilt = Math.sin(i * 1.1) * 0.18;
    const g = new THREE.BoxGeometry(0.0013, 0.0105, 0.022).rotateX(tilt);
    const w = 0.022 - Math.abs(i - 2.5) * 0.0015;
    const z = -0.003 - w / 2 + 0.002;
    b.part(g, FIN, { at: [0, y, z], bone: finJ[i] });
    const rib = new THREE.BoxGeometry(0.0021, 0.0014, w + 0.001).rotateX(tilt);
    b.part(rib, ORG, { at: [0, y, z], bone: finJ[i] });
  });

  // ---------- tail ----------
  for (let k = 0; k < 8; k++) {
    const a = tailPts[k];
    const c = tailPts[k + 1];
    const d = sub(c, a);
    const l = len(d);
    const r = (tailR[k] + tailR[k + 1]) / 2;
    const bone = tailJ[k + 1];
    b.part(new THREE.BoxGeometry(r * 2, l * 1.06, r * 2), YEL, { at: midp(a, c), bone, dir: norm(d), up: [1, 0, 0] });
    // dark band at joint
    b.part(new THREE.BoxGeometry(tailR[k + 1] * 2.25, 0.0022, tailR[k + 1] * 2.25), DARK, {
      at: c,
      bone,
      dir: norm(d),
      up: [1, 0, 0],
    });
    // outward ridge nub
    const th = ((165 + (k + 0.5) * 40) * Math.PI) / 180;
    const out: V = [0, Math.sin(th), Math.cos(th)];
    const m = midp(a, c);
    cone([m[0], m[1] + out[1] * r * 0.85, m[2] + out[2] * r * 0.85], out, 0.006 - k * 0.0004, 0.0028 - k * 0.0001, ORG, bone, 4);
  }
  // body-to-tail joint cover
  b.part(ell(0.014, 0.02, 0.018, 8, 6), YEL, { at: [0, 0.078, 0.025], bone: hips });
  const tipP = tailPts[8];
  b.part(ell(0.0042, 0.0042, 0.0042, 5, 4), YEL, { at: tipP, bone: tailJ[8] });
  for (let i = 0; i < 4; i++) {
    const s = i % 2 ? 1 : -1;
    b.part(ell(0.0022, 0.0022, 0.0022, 5, 4), WHITE, {
      at: [s * tailR[2 + i] * 0.95, tailPts[2 + i][1] + 0.002, tailPts[2 + i][2]],
      bone: tailJ[2 + i],
    });
  }

  // ---------- seagrass ----------
  const blade = (x0: number, z0: number, h: number, w0: number, lean: number, leanZ: number, ph: number) => {
    const n = 11;
    const pts: V[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([x0 + lean * t * t, h * t - 0.003, z0 + leanZ * t * t + 0.022 * Math.sin(ph + t * 5) * t * t]);
    }
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const c = pts[i + 1];
      const d = sub(c, a);
      const l = len(d);
      const t = (i + 0.5) / n;
      const w = w0 * (1 - 0.75 * t * t);
      b.part(new THREE.BoxGeometry(w, l * 1.1, 0.0018), i % 2 ? GRASS : GRASS, { at: midp(a, c), bone: root, dir: norm(d) });
      b.part(new THREE.BoxGeometry(w * 0.16, l * 1.1, 0.0024), GRASS_D, { at: midp(a, c), bone: root, dir: norm(d) });
    }
    const e = pts[n];
    const dd = sub(e, pts[n - 1]);
    cone(e, dd, 0.014, w0 * 0.2, GRASS, root, 4);
  };
  blade(0, C.z, 0.42, 0.015, 0.01, 0.0, 0);
  blade(0.048, 0.05, 0.3, 0.012, 0.06, 0.01, 1.6);
  blade(-0.05, 0.042, 0.34, 0.013, -0.05, -0.01, 3.1);
  blade(-0.022, 0.098, 0.25, 0.011, -0.03, 0.03, 4.4);
  blade(0.03, 0.01, 0.2, 0.01, 0.04, -0.02, 2.2);

  // sand mound and pebbles
  b.part(ell(0.1, 0.006, 0.1, 10, 4), SAND, { at: [0, 0, 0.05], bone: root });
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.05 + rand() * 0.035;
    const s = 0.005 + rand() * 0.005;
    b.part(ell(s, s * 0.6, s, 5, 4), PEB, { at: [Math.cos(a) * r, 0.003, 0.05 + Math.sin(a) * r], bone: root });
  }

  return b.root;
}
