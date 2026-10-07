import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "A stylized low-poly keel-billed toucan in a rig-ready rest pose: rainbow beak with an opening jaw, yellow bib with a red band, lime eye skin, maroon nape, wings spread with layered feathers, a fanned tail, and blue zygodactyl feet.",
};

export default function build() {
  const b: any = createBuilder({ name: "toucan" });
  const R: any = rng(7);
  const r01 = (): number => {
    if (typeof R === "function") return R();
    if (R && typeof R.next === "function") return R.next();
    if (R && typeof R.float === "function") return R.float();
    if (R && typeof R.random === "function") return R.random();
    return 0.5;
  };

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const mid = (a: THREE.Vector3, c: THREE.Vector3) => a.clone().add(c).multiplyScalar(0.5);

  // ---------- palette ----------
  const BLACK = "#121318";
  const BLACK2 = "#1b1d26";
  const SHEEN = "#262a38";
  const MAROON = "#4c1622";
  const YELLOW = "#ffd21f";
  const YELLOW_HI = "#fff07a";
  const AMBER = "#ffab1f";
  const RED = "#e3232c";
  const LIME = "#8fd13f";
  const ORANGE = "#ff8c1a";
  const SKY = "#46a6e8";
  const EYESKIN = "#a6e04a";
  const TEAL = "#2bb3c9";
  const EYE = "#1a120c";
  const WHITE = "#ffffff";
  const LEG = "#5b86d6";
  const LEG_DK = "#4568ad";
  const CLAW = "#2a2a30";
  const SHAFT = "#3d4252";

  // ---------- geometry helpers ----------
  const basis = (yAxis: THREE.Vector3, hint: THREE.Vector3 = v(0, 0, 1)) => {
    const y = yAxis.clone().normalize();
    let x = new THREE.Vector3().crossVectors(y, hint);
    if (x.lengthSq() < 1e-6) x = new THREE.Vector3().crossVectors(y, v(1, 0, 0));
    x.normalize();
    const z = new THREE.Vector3().crossVectors(x, y).normalize();
    return new THREE.Matrix4().makeBasis(x, y, z);
  };

  const facet = (geo: THREE.BufferGeometry) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.clearGroups();
    if (g.getAttribute("normal")) g.deleteAttribute("normal");
    g.computeVertexNormals();
    return g;
  };

  const put = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, bone: any) =>
    b.part(facet(geo), color, { at: [at.x, at.y, at.z], bone });

  const ell = (
    c: THREE.Vector3,
    s: [number, number, number],
    color: string,
    bone: any,
    rotX = 0,
    ws = 10,
    hs = 7,
  ) => put(new THREE.SphereGeometry(1, ws, hs).scale(s[0], s[1], s[2]).rotateX(rotX), color, c, bone);

  const seat = (
    geo: THREE.BufferGeometry,
    color: string,
    at: THREE.Vector3,
    n: THREE.Vector3,
    bone: any,
    hint: THREE.Vector3 = v(0, 0, 1),
  ) => {
    geo.applyMatrix4(basis(n, hint));
    return put(geo, color, at, bone);
  };

  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, bone: any, seg = 6, r2 = r) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r2, r, d.length(), seg);
    g.applyMatrix4(basis(d));
    return put(g, color, mid(a, c), bone);
  };

  const loftGeo = (rings: THREE.Vector3[][]) => {
    const pos: number[] = [];
    const tri = (a: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) =>
      pos.push(a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
    const m = rings[0].length;
    for (let i = 0; i < rings.length - 1; i++) {
      const A = rings[i], B = rings[i + 1];
      for (let j = 0; j < m; j++) {
        const j2 = (j + 1) % m;
        tri(A[j], A[j2], B[j]);
        tri(A[j2], B[j2], B[j]);
      }
    }
    const cap = (Rg: THREE.Vector3[], flip: boolean) => {
      const c = new THREE.Vector3();
      Rg.forEach((p) => c.add(p));
      c.divideScalar(Rg.length);
      for (let j = 0; j < m; j++) {
        const j2 = (j + 1) % m;
        if (flip) tri(c, Rg[j2], Rg[j]);
        else tri(c, Rg[j], Rg[j2]);
      }
    };
    cap(rings[0], true);
    cap(rings[rings.length - 1], false);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  };

  // ---------- skeleton ----------
  const J = (name: string, at: THREE.Vector3, parent?: any, role?: string) => {
    const o: any = { at: [at.x, at.y, at.z] };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    return b.joint(name, o);
  };

  const hips = J("hips", v(0, 0.165, -0.03), undefined, "spine");
  const chest = J("chest", v(0, 0.215, 0.05), hips, "spine");
  const neck = J("neck", v(0, 0.265, 0.085), chest, "neck");
  const head = J("head", v(0, 0.3, 0.115), neck, "head");
  const BA = v(0, 0.325, 0.148); // beak base origin
  const L = 0.15;
  J("beakTip", v(0, BA.y - 0.055, BA.z + L), head, "head");
  const jaw = J("jaw", v(0, 0.282, 0.15), head, "jaw");
  J("jawTip", v(0, BA.y - 0.057, BA.z + 0.95 * L), jaw, "jaw");

  // ---------- body ----------
  const BC = v(0, 0.19, 0);
  const BS = v(0.075, 0.085, 0.13);
  const BT = -0.6;
  const X = v(1, 0, 0);
  ell(BC, [BS.x, BS.y, BS.z], BLACK, hips, BT, 12, 9);

  const bodyPt = (u: THREE.Vector3) => {
    const n = u.clone().normalize();
    const p = v(n.x * BS.x, n.y * BS.y, n.z * BS.z).applyAxisAngle(X, BT).add(BC);
    const nn = v(n.x / BS.x, n.y / BS.y, n.z / BS.z).normalize().applyAxisAngle(X, BT);
    return { p, n: nn };
  };

  // shingled mantle feathers on the back
  for (let r = 0; r < 4; r++) {
    for (let c = -2; c <= 2; c++) {
      if (r === 3 && Math.abs(c) === 2) continue;
      const { p, n } = bodyPt(v(c * 0.32 + (r % 2) * 0.12, 1, 0.35 - r * 0.38));
      const g = new THREE.SphereGeometry(1, 6, 4).scale(0.02, 0.0045, 0.026);
      const col = r === 0 ? MAROON : (r + c) % 2 === 0 ? SHEEN : BLACK2;
      seat(g, col, p.clone().addScaledVector(n, 0.002), n, hips);
    }
  }

  // neck, nape, head
  ell(v(0, 0.27, 0.08), [0.052, 0.05, 0.05], BLACK, neck);
  ell(v(0, 0.284, 0.062), [0.05, 0.032, 0.04], MAROON, neck, 0.5);
  const H = v(0, 0.305, 0.112);
  const HS: [number, number, number] = [0.05, 0.054, 0.06];
  ell(H, HS, BLACK, head, 0, 12, 8);

  // bib: red band, yellow throat, feather highlights
  ell(v(0, 0.205, 0.095), [0.06, 0.022, 0.04], RED, chest);
  const BB = v(0, 0.265, 0.098);
  const BBS: [number, number, number] = [0.058, 0.065, 0.04];
  ell(BB, BBS, YELLOW, chest, 0, 12, 8);
  for (let i = 0; i < 3; i++) {
    for (let j = -2; j <= 2; j++) {
      if (i === 0 && Math.abs(j) === 2) continue;
      const u = v(j * 0.33, -0.75 + i * 0.4, 1).normalize();
      const p = v(BB.x + u.x * BBS[0], BB.y + u.y * BBS[1], BB.z + u.z * BBS[2]);
      const n = v(u.x / BBS[0], u.y / BBS[1], u.z / BBS[2]).normalize();
      const g = new THREE.SphereGeometry(1, 6, 4).scale(0.009, 0.0025, 0.007);
      seat(g, i === 0 ? AMBER : YELLOW_HI, p.addScaledVector(n, 0.001), n, chest, v(0, 1, 0));
    }
  }

  // ---------- beak ----------
  const botU = (z: number) => -0.045 - 0.012 * Math.pow(z / L, 3);
  const hU = (z: number) => 0.053 * Math.pow(Math.max(0, 1 - Math.pow(z / L, 3)), 0.6) + 0.002;
  const topU = (z: number) => botU(z) + hU(z);
  const wU = (z: number) => {
    const u = Math.min(1, z / L);
    return 0.024 * (1 - 0.5 * u) * (0.35 + 0.65 * Math.sqrt(Math.max(0, 1 - Math.pow(u, 4))));
  };
  const LL = 0.95 * L;
  const topLo = (z: number) => botU(z) - 0.0006;
  const hL = (z: number) => 0.038 * Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, z / LL), 2)), 0.7) + 0.002;
  const botLo = (z: number) => topLo(z) - hL(z);
  const wL = (z: number) => wU(z) * 0.92;

  const sect = (z: number, t: number, bo: number, w: number) => {
    const h = t - bo;
    return [
      v(0, t, z),
      v(-0.7 * w, t - 0.18 * h, z),
      v(-w, t - 0.55 * h, z),
      v(-0.75 * w, bo + 0.1 * h, z),
      v(0, bo, z),
      v(0.75 * w, bo + 0.1 * h, z),
      v(w, t - 0.55 * h, z),
      v(0.7 * w, t - 0.18 * h, z),
    ];
  };
  const beakGeo = (
    z0: number,
    z1: number,
    n: number,
    top: (z: number) => number,
    bot: (z: number) => number,
    wid: (z: number) => number,
    inf: number,
  ) => {
    const rings: THREE.Vector3[][] = [];
    for (let i = 0; i <= n; i++) {
      const z = z0 + ((z1 - z0) * i) / n;
      rings.push(sect(z, top(z) + inf, bot(z) - inf, wid(z) + inf));
    }
    return loftGeo(rings);
  };

  const OV = 0.0012;
  // upper mandible: lime, orange flash, red tip, black base line
  put(beakGeo(0, L, 10, topU, botU, wU, 0), LIME, BA, head);
  put(beakGeo(0.55 * L, 0.78 * L, 4, topU, botU, wU, OV), ORANGE, BA, head);
  put(beakGeo(0.84 * L, L, 4, topU, botU, wU, OV), RED, BA, head);
  put(beakGeo(0, 0.04 * L, 1, topU, botU, wU, OV), BLACK, BA, head);
  // lower mandible: sky blue, lime band, red tip
  put(beakGeo(0, LL, 10, topLo, botLo, wL, 0), SKY, BA, jaw);
  put(beakGeo(0.38 * LL, 0.62 * LL, 3, topLo, botLo, wL, OV), LIME, BA, jaw);
  put(beakGeo(0.82 * LL, LL, 3, topLo, botLo, wL, OV), RED, BA, jaw);
  put(beakGeo(0, 0.04 * LL, 1, topLo, botLo, wL, OV), BLACK, BA, jaw);
  // nostril slits
  for (const s of [1, -1]) {
    const g = new THREE.SphereGeometry(1, 5, 3).scale(0.0018, 0.0035, 0.006);
    put(g, BLACK, v(s * 0.012, BA.y - 0.004, BA.z + 0.012), head);
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const d = v(0.846 * s, 0.31, 0.433);
    const p = v(H.x + d.x * HS[0], H.y + d.y * HS[1], H.z + d.z * HS[2]);
    const n = v(d.x / HS[0], d.y / HS[1], d.z / HS[2]).normalize();
    const Bm = basis(n, v(0, 1, 0));
    const patch = new THREE.SphereGeometry(0.021, 10, 6).scale(1.25, 0.3, 1);
    patch.applyMatrix4(Bm);
    put(patch, EYESKIN, p, head);
    put(new THREE.SphereGeometry(0.0085, 8, 6), EYE, p.clone().addScaledVector(n, 0.004), head);
    put(
      new THREE.SphereGeometry(0.0022, 5, 4),
      WHITE,
      p.clone().addScaledVector(n, 0.011).add(v(0, 0.003, 0.002)),
      head,
    );
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const off = v(Math.cos(a) * 0.0215 * 1.15, 0, Math.sin(a) * 0.0195).applyMatrix4(Bm);
      put(new THREE.SphereGeometry(0.0024, 5, 3), TEAL, p.clone().add(off).addScaledVector(n, 0.002), head);
    }
  }

  // ---------- feathers ----------
  const featherGeo = (len: number, w: number, tip = true, thick = 0.003) => {
    const s = new THREE.Shape();
    if (tip) {
      s.moveTo(-0.3 * w, 0);
      s.lineTo(0.3 * w, 0);
      s.lineTo(0.5 * w, 0.5 * len);
      s.lineTo(0.45 * w, 0.8 * len);
      s.lineTo(0.25 * w, 0.97 * len);
      s.lineTo(0, len);
      s.lineTo(-0.25 * w, 0.97 * len);
      s.lineTo(-0.45 * w, 0.8 * len);
      s.lineTo(-0.5 * w, 0.5 * len);
    } else {
      s.moveTo(-0.35 * w, 0);
      s.lineTo(0.35 * w, 0);
      s.lineTo(0.5 * w, 0.4 * len);
      s.lineTo(0.5 * w, len);
      s.lineTo(-0.5 * w, len);
      s.lineTo(-0.5 * w, 0.4 * len);
    }
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: false, curveSegments: 2 });
    g.translate(0, 0, -thick / 2);
    g.rotateX(-Math.PI / 2); // points toward -Z, lies flat
    return g;
  };
  const shaftGeo = (len: number) => new THREE.BoxGeometry(0.0016, 0.0012, len * 0.85).translate(0, 0.0022, -len * 0.425);

  const feather = (
    base: THREE.Vector3,
    len: number,
    w: number,
    yaw: number,
    pitch: number,
    color: string,
    bone: any,
    tip = true,
    shaft = true,
  ) => {
    const g = featherGeo(len, w, tip).rotateX(pitch).rotateY(yaw);
    put(g, color, base, bone);
    if (shaft) put(shaftGeo(len).rotateX(pitch).rotateY(yaw), SHAFT, base, bone);
  };

  // ---------- wings (spread, rest pose) ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S = v(0.068 * s, 0.245, 0.03);
    const E = v(0.14 * s, 0.25, 0.012);
    const W = v(0.21 * s, 0.25, 0.0);
    const T = v(0.29 * s, 0.25, -0.02);
    const sh = J(`shoulder${side}`, S, chest, "wing");
    const el = J(`elbow${side}`, E, sh, "wing");
    const wr = J(`wrist${side}`, W, el, "wing");
    J(`wingTip${side}`, T, wr, "wing");

    ell(mid(S, E), [0.042, 0.016, 0.036], BLACK, sh);
    ell(mid(E, W), [0.042, 0.013, 0.032], BLACK, el);
    ell(mid(W, T), [0.045, 0.01, 0.022], BLACK, wr);

    // secondaries + their coverts
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const base = v(s * (0.09 + 0.11 * t), 0.244 + 0.0009 * i, 0.012 - 0.01 * t);
      const yaw = -(0.05 + 0.25 * t) * s;
      const len = 0.11 + 0.015 * t + (r01() - 0.5) * 0.008;
      feather(base, len, 0.03, yaw, 0, i % 2 ? BLACK : BLACK2, el);
      feather(base.clone().add(v(0, 0.008, 0.004)), 0.055, 0.028, yaw, 0, i % 2 ? SHEEN : BLACK2, el, true, false);
    }
    // primaries + coverts
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const base = v(s * (0.2 + 0.075 * t), 0.248 + 0.0009 * (6 - i), -0.005 - 0.012 * t);
      const yaw = -(0.45 + 0.95 * t) * s;
      const len = 0.12 + 0.03 * Math.sin(Math.PI * (0.3 + 0.6 * t)) + (r01() - 0.5) * 0.006;
      feather(base, len, 0.03, yaw, 0, i % 2 ? BLACK2 : BLACK, wr);
      if (i < 4)
        feather(base.clone().add(v(0, 0.008, 0.003)), 0.05, 0.026, yaw, 0, i % 2 ? BLACK2 : SHEEN, wr, true, false);
    }
  }

  // ---------- tail ----------
  const pitchT = -0.35;
  const tdir = v(0, Math.sin(pitchT), -Math.cos(pitchT));
  const T1 = v(0, 0.155, -0.1);
  const tail1 = J("tail1", T1, hips, "tail");
  const tail2 = J("tail2", T1.clone().addScaledVector(tdir, 0.1), tail1, "tail");
  J("tail3", T1.clone().addScaledVector(tdir, 0.205), tail2, "tail");

  ell(v(0, 0.16, -0.085), [0.05, 0.035, 0.05], BLACK, hips, -0.3);
  ell(v(0, 0.128, -0.07), [0.036, 0.022, 0.05], RED, hips, 0.35);

  for (let i = 0; i < 7; i++) {
    const t = i / 6 - 0.5;
    const a = t * 0.35;
    const yoff = 0.0013 * (3 - Math.abs(i - 3)) + (i > 3 ? 0.0005 : 0);
    const base = v(t * 0.05, T1.y + yoff, T1.z);
    const dir = v(0, 0, -1).applyAxisAngle(X, pitchT).applyAxisAngle(v(0, 1, 0), -a);
    const col = i % 2 ? BLACK2 : BLACK;
    feather(base, 0.105, 0.034, -a, pitchT, col, tail1, false);
    const len2 = 0.11 + (i === 3 ? 0.008 : 0) + (r01() - 0.5) * 0.006;
    feather(base.clone().addScaledVector(dir, 0.1), len2, 0.034, -a, pitchT, col, tail2, true);
  }
  // uppertail coverts
  for (let i = 0; i < 3; i++) {
    const t = i - 1;
    feather(v(t * 0.018, T1.y + 0.014, T1.z + 0.02), 0.06, 0.03, -t * 0.15, pitchT, SHEEN, tail1, true, false);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hp = v(0.035 * s, 0.14, 0.0);
    const kn = v(0.04 * s, 0.1, 0.03);
    const an = v(0.042 * s, 0.014, 0.022);
    const F = v(0.042 * s, 0.007, 0.024);
    const hipJ = J(`hip${side}`, hp, hips, "leg");
    const kneeJ = J(`knee${side}`, kn, hipJ, "leg");
    const ankleJ = J(`ankle${side}`, an, kneeJ, "leg");
    const toesJ = J(`toes${side}`, F, ankleJ, "digit");

    ell(mid(hp, kn), [0.026, 0.034, 0.028], BLACK, hipJ);
    rod(kn, an, 0.0062, LEG, kneeJ, 6, 0.0055);
    for (let k = 1; k <= 4; k++) {
      const p = kn.clone().lerp(an, 0.25 + k * 0.13);
      const g = new THREE.CylinderGeometry(0.0074, 0.0074, 0.0022, 6);
      g.applyMatrix4(basis(an.clone().sub(kn)));
      put(g, LEG_DK, p, kneeJ);
    }
    put(new THREE.SphereGeometry(0.0075, 6, 5), LEG, an, ankleJ);

    const toes: [THREE.Vector3, number][] = [
      [v(0.35 * s, 0, 1), 0.036],
      [v(-0.12 * s, 0, 1), 0.04],
      [v(0.45 * s, 0, -1), 0.03],
      [v(-0.15 * s, 0, -1), 0.026],
    ];
    for (const [d0, len] of toes) {
      const d = d0.clone().normalize();
      const tipP = F.clone().addScaledVector(d, len);
      rod(F, tipP, 0.0048, LEG, toesJ, 5, 0.0038);
      put(new THREE.SphereGeometry(0.0052, 5, 4), LEG_DK, F.clone().addScaledVector(d, len * 0.5), toesJ);
      const cd = d.clone().add(v(0, -0.5, 0)).normalize();
      const claw = new THREE.ConeGeometry(0.0034, 0.01, 5);
      claw.applyMatrix4(basis(cd));
      put(claw, CLAW, tipP.clone().addScaledVector(d, 0.004).add(v(0, 0.001, 0)), toesJ);
    }
  }

  return b.root;
}
