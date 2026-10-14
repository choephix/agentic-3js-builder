```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Armadillo",
  description:
    "A stylized nine-banded armadillo in a rest pose. It has a studded scapular and pelvic shield, nine shingled bands with cream rims, a ringed tail, a long snout with a separate jaw, tall ears and digging claws.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---------- palette ----------
  const C = {
    shell: "#8d6b4f",
    shellAlt: "#a5815f",
    rim: "#e6cfa8",
    stud: "#c9a57e",
    studDark: "#7a5a40",
    skin: "#d4a596",
    skinDark: "#b58172",
    belly: "#e7c2b2",
    claw: "#f0e4cb",
    eye: "#1a1210",
    shine: "#ffffff",
    nose: "#5a3a36",
    innerEar: "#e79b92",
    hair: "#e9dcc4",
  };

  // ---------- helpers ----------
  const J = (name: string, at: number[], parent?: any, role?: string) =>
    b.joint(name, { at, ...(parent ? { parent } : {}), ...(role ? { role } : {}) } as any);
  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(geo, color, { at, bone } as any);

  const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
  // orient a Y-axis geometry so +Y points along d
  const orient = (g: THREE.BufferGeometry, d: THREE.Vector3) => {
    const n = d.clone().normalize();
    g.rotateX(Math.asin(clamp1(n.z)));
    g.rotateZ(Math.atan2(-n.x, n.y));
    return g;
  };
  const rod = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, seg = 8) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const g = new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1);
    orient(g, d);
    return P(g, color, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], bone);
  };
  const blob = (sx: number, sy: number, sz: number, color: string, at: number[], bone: any, ws = 10, hs = 7) => {
    const g = new THREE.SphereGeometry(1, ws, hs);
    g.scale(sx, sy, sz);
    return P(g, color, at, bone);
  };

  // ---------- skeleton ----------
  const hips = J("hips", [0, 0.19, -0.12], undefined, "spine");
  const spine1 = J("spine1", [0, 0.2, 0.0], hips, "spine");
  const chest = J("chest", [0, 0.2, 0.1], spine1, "spine");
  const neck = J("neck", [0, 0.18, 0.2], chest, "neck");
  const head = J("head", [0, 0.178, 0.245], neck, "head");
  const jaw = J("jaw", [0, 0.162, 0.285], head, "jaw");
  const earL = J("earL", [0.024, 0.212, 0.248], head);
  const earR = J("earR", [-0.024, 0.212, 0.248], head);

  const tailPts = [
    [0, 0.15, -0.27],
    [0, 0.125, -0.35],
    [0, 0.1, -0.43],
    [0, 0.078, -0.51],
    [0, 0.06, -0.58],
    [0, 0.046, -0.645],
  ];
  const tailR = [0.036, 0.03, 0.024, 0.018, 0.013, 0.006];
  const tailJ: any[] = [];
  tailPts.forEach((p, i) => {
    tailJ.push(J(i === tailPts.length - 1 ? "tailTip" : `tail${i + 1}`, p, i === 0 ? hips : tailJ[i - 1], "tail"));
  });

  // ---------- shell profile ----------
  const CY = 0.19;
  const SY = 0.9;
  const SPAN = Math.PI * 1.4;
  const H = SPAN / 2;
  const ZC = -0.02;
  const A = 0.27;
  const R0 = 0.155;
  const EXP = 2.6;
  const r = (z: number) => {
    const t = Math.min(0.97, Math.abs((z - ZC) / A));
    return R0 * Math.pow(1 - Math.pow(t, EXP), 1 / EXP);
  };
  const boneAt = (z: number) => (z > 0.075 ? chest : z < -0.1 ? hips : spine1);

  const arch = (z0: number, z1: number, rb: number, rf: number, color: string, bone: any, seg = 16) => {
    const g = new THREE.CylinderGeometry(rb, rf, z1 - z0, seg, 1, true, -H, SPAN);
    g.rotateX(-Math.PI / 2);
    g.scale(1, SY, 1);
    P(g, color, [0, CY, (z0 + z1) / 2], bone);
  };
  const rim = (z: number, rr: number, tube: number, color: string, bone: any) => {
    const g = new THREE.TorusGeometry(rr, tube, 4, 22, SPAN);
    g.rotateZ(Math.PI / 2 - H);
    g.scale(1, SY, 1);
    P(g, color, [0, CY, z], bone);
  };
  const onShell = (theta: number, rr: number, z: number) => [rr * Math.sin(theta), CY + SY * rr * Math.cos(theta), z];

  // stud rows (hex scutes) over a shield
  const studRows = (zStart: number, zEnd: number, step: number) => {
    let row = 0;
    for (let z = zStart; z <= zEnd + 1e-6; z += step, row++) {
      const rr = r(z) + 0.0015;
      const h = H - 0.06;
      const n = Math.max(4, Math.round((rr * 2 * h) / 0.025));
      for (let j = 0; j < n; j++) {
        const th = -h + (2 * h * (j + 0.5)) / n + (row % 2 ? h / n : 0);
        if (th > h) continue;
        const g = new THREE.CylinderGeometry(0.0088, 0.0108, 0.005, 6);
        g.rotateY(0.52);
        g.rotateZ(-th);
        const edge = Math.abs(th) > h - 0.25;
        P(g, edge ? C.studDark : C.stud, onShell(th, rr, z), boneAt(z));
      }
    }
  };

  // ---------- body (skin core) ----------
  blob(0.12, 0.1, 0.255, C.belly, [0, 0.17, -0.02], spine1, 12, 8);

  // ---------- scapular shield (front) ----------
  {
    const z0 = 0.078, z1 = 0.212, n = 5;
    for (let i = 0; i < n; i++) {
      const a = z0 + ((z1 - z0) * i) / n, c = z0 + ((z1 - z0) * (i + 1)) / n;
      arch(a, c, r(a), r(c), C.shell, chest);
    }
    rim(z1, r(z1), 0.006, C.rim, chest);
    studRows(0.09, 0.2, 0.021);
  }

  // ---------- pelvic shield (rear) ----------
  {
    const z0 = -0.252, z1 = -0.1, n = 5;
    for (let i = 0; i < n; i++) {
      const a = z0 + ((z1 - z0) * i) / n, c = z0 + ((z1 - z0) * (i + 1)) / n;
      arch(a, c, r(a), r(c), C.shell, hips);
    }
    rim(z0, r(z0), 0.006, C.rim, hips);
    studRows(-0.24, -0.11, 0.021);
    // rump cap
    const cap = new THREE.SphereGeometry(r(z0), 12, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.rotateX(-Math.PI / 2);
    cap.scale(1, SY, 0.35);
    P(cap, C.shellAlt, [0, CY, z0], hips);
    // rosette of studs on the rump cap
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * Math.PI * 2;
      const rr = r(z0) * 0.55;
      const g = new THREE.CylinderGeometry(0.008, 0.01, 0.005, 6);
      g.rotateX(-Math.PI / 2 - 0.5 * Math.cos(ang) * 0); // facing -Z
      P(g, C.stud, [rr * Math.cos(ang), CY + SY * rr * Math.sin(ang), z0 - 0.03], hips);
    }
  }

  // ---------- nine bands ----------
  {
    const z0 = -0.1, z1 = 0.078, n = 9;
    const bl = (z1 - z0) / n;
    for (let i = 0; i < n; i++) {
      const a = z0 + bl * i, c = a + bl;
      const bone = boneAt((a + c) / 2);
      const col = i % 2 ? C.shellAlt : C.shell;
      // rear edge raised so each band shingles over the one behind
      arch(a - 0.004, c, r(a) + 0.009, r(c), col, bone);
      rim(a - 0.003, r(a) + 0.009, 0.0035, C.rim, bone);
      // row of ridged tiles down each band
      const zm = (a + c) / 2;
      const rr = r(zm) + 0.006;
      const h = H - 0.08;
      const cnt = Math.round((rr * 2 * h) / 0.03);
      for (let j = 0; j < cnt; j++) {
        const th = -h + (2 * h * (j + 0.5)) / cnt;
        const g = new THREE.BoxGeometry(0.009, 0.004, bl * 0.75);
        g.rotateZ(-th);
        P(g, i % 2 ? C.stud : C.rim, onShell(th, rr, zm), bone);
      }
    }
  }

  // ---------- hair fringe under the shell skirt ----------
  for (const s of [1, -1]) {
    for (let z = -0.235; z <= 0.2; z += 0.02) {
      const rr = r(z);
      const p = onShell(s * H, rr, z);
      const g = new THREE.ConeGeometry(0.0025, 0.03, 3);
      g.rotateX(Math.PI);
      g.rotateZ(s * 0.35);
      P(g, C.hair, [p[0] + s * 0.004, p[1] - 0.014, z], boneAt(z));
    }
  }

  // ---------- neck & head ----------
  rod([0, 0.178, 0.18], [0, 0.178, 0.255], 0.05, 0.044, C.skin, neck, 10);
  blob(0.048, 0.045, 0.06, C.skin, [0, 0.18, 0.265], head);
  // upper jaw / snout
  rod([0, 0.182, 0.285], [0, 0.171, 0.4], 0.032, 0.013, C.skin, head, 9);
  // lower jaw (separate, hinged)
  rod([0, 0.158, 0.28], [0, 0.155, 0.385], 0.022, 0.009, C.skinDark, jaw, 8);
  // nose
  blob(0.014, 0.012, 0.01, C.nose, [0, 0.17, 0.402], head, 8, 6);
  for (const s of [1, -1]) blob(0.003, 0.003, 0.003, C.eye, [s * 0.006, 0.172, 0.411], head, 6, 4);
  // head shield
  {
    const g = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    g.scale(0.042, 0.022, 0.085);
    g.rotateX(0.15);
    P(g, C.shell, [0, 0.198, 0.305], head);
    for (const dz of [-0.05, -0.02, 0.01, 0.04, 0.065]) {
      for (const x of [-0.016, 0, 0.016]) {
        const q = 1 - (x / 0.042) ** 2 - (dz / 0.085) ** 2;
        if (q <= 0.05) continue;
        const y = 0.198 + 0.022 * Math.sqrt(q) - dz * 0.15;
        const sg = new THREE.CylinderGeometry(0.0055, 0.007, 0.004, 6);
        sg.rotateX(0.15);
        sg.rotateZ(-x * 8);
        P(sg, C.stud, [x, y + 0.0005, 0.305 + dz], head);
      }
    }
  }
  // eyes
  for (const s of [1, -1]) {
    blob(0.008, 0.008, 0.008, C.eye, [s * 0.043, 0.19, 0.285], head, 8, 6);
    blob(0.0028, 0.0028, 0.0028, C.shine, [s * 0.049, 0.194, 0.29], head, 6, 4);
  }
  // ears
  for (const [s, ej] of [[1, earL], [-1, earR]] as [number, any][]) {
    const g = new THREE.SphereGeometry(1, 8, 6);
    g.scale(0.019, 0.036, 0.005);
    g.rotateY(s * 0.5);
    g.rotateZ(-s * 0.3);
    P(g, C.skinDark, [s * 0.034, 0.243, 0.248], ej);
    const gi = new THREE.SphereGeometry(1, 8, 6);
    gi.scale(0.012, 0.026, 0.003);
    gi.rotateY(s * 0.5);
    gi.rotateZ(-s * 0.3);
    P(gi, C.innerEar, [s * 0.035, 0.242, 0.2525], ej);
  }

  // ---------- legs ----------
  const leg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const z = front ? 0.12 : -0.13;
    const top = [s * 0.075, 0.15, z];
    const mid = [s * 0.09, 0.085, z + (front ? 0.012 : 0.02)];
    const low = [s * 0.092, 0.022, z + (front ? 0.008 : -0.008)];
    const j1 = J((front ? "shoulder" : "hip") + side, top, front ? chest : hips, "leg");
    const j2 = J((front ? "elbow" : "knee") + side, mid, j1, "leg");
    const j3 = J((front ? "wrist" : "ankle") + side, low, j2, "leg");

    const rUp = front ? 0.027 : 0.032;
    rod(top, mid, rUp, rUp * 0.8, C.skinDark, j1, 8);
    blob(rUp * 0.82, rUp * 0.82, rUp * 0.82, C.skinDark, mid, j2, 8, 6);
    rod(mid, low, rUp * 0.78, rUp * 0.6, C.skin, j2, 8);
    // scale plates on the outer face of the leg
    for (let k = 0; k < 3; k++) {
      const t = 0.25 + k * 0.25;
      const p = [top[0] + (mid[0] - top[0]) * t, top[1] + (mid[1] - top[1]) * t, top[2] + (mid[2] - top[2]) * t];
      const g = new THREE.CylinderGeometry(0.008, 0.01, 0.005, 6);
      g.rotateZ(-s * Math.PI / 2);
      P(g, C.shellAlt, [p[0] + s * rUp * 0.92, p[1], p[2]], j1);
      const p2 = [mid[0] + (low[0] - mid[0]) * t, mid[1] + (low[1] - mid[1]) * t, mid[2] + (low[2] - mid[2]) * t];
      const g2 = new THREE.CylinderGeometry(0.006, 0.0075, 0.004, 6);
      g2.rotateZ(-s * Math.PI / 2);
      P(g2, C.shell, [p2[0] + s * rUp * 0.7, p2[1], p2[2]], j2);
    }
    // foot
    blob(0.022, 0.012, 0.03, C.skinDark, [low[0], 0.012, low[2] + 0.012], j3, 8, 6);
    // claws, separated and splayed
    const nClaw = front ? 4 : 5;
    const len = front ? 0.032 : 0.02;
    for (let k = 0; k < nClaw; k++) {
      const u = k / (nClaw - 1) - 0.5;
      const g = new THREE.ConeGeometry(0.0045, len, 5);
      g.rotateX(Math.PI / 2 + 0.12);
      g.rotateY(u * 0.7);
      P(g, C.claw, [low[0] + u * 0.034, 0.0065, low[2] + 0.036 + len * 0.4 - Math.abs(u) * 0.01], j3);
    }
  };
  leg(1, true);
  leg(-1, true);
  leg(1, false);
  leg(-1, false);

  // ---------- ringed tail ----------
  for (let i = 0; i < tailPts.length - 1; i++) {
    const a = tailPts[i], c = tailPts[i + 1];
    const bone = tailJ[i];
    const last = i === tailPts.length - 2;
    if (last) {
      const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
      const g = new THREE.ConeGeometry(tailR[i], d.length(), 8);
      orient(g, d);
      P(g, C.shell, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], bone);
    } else {
      rod(a, c, tailR[i], tailR[i + 1], i % 2 ? C.shellAlt : C.shell, bone, 9);
    }
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const rings = last ? 1 : 3;
    for (let k = 0; k < rings; k++) {
      const t = (k + 0.2) / rings;
      const rr = tailR[i] + (tailR[i + 1] - tailR[i]) * t;
      const g = new THREE.TorusGeometry(rr + 0.001, Math.max(0.0022, rr * 0.13), 4, 12);
      g.rotateX(-Math.PI / 2);
      orient(g, d);
      P(g, k % 2 ? C.stud : C.rim, [a[0] + d.x * t, a[1] + d.y * t, a[2] + d.z * t], bone);
    }
  }

  return b.root;
}
```