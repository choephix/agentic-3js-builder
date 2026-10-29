import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, spiral, offset, catmull, frame, bezier } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Baku, the Dream-Eater",
  "description": "A stylized dream-eating tapir spirit in ukiyo-e woodblock style: an indigo barrel-bodied tapir with a short drooping trunk, a gold crescent moon on its brow, a flowing smoke mane down its spine, and pale dream wisps curling up into its nostrils."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  ink: "#241a2e",
  indigo: "#2c4a68",
  indigoDeep: "#1c3247",
  indigoLight: "#567c9c",
  cream: "#f4ead6",
  creamShade: "#ddc9a8",
  vermilion: "#c94236",
  vermilionDeep: "#8c2a24",
  gold: "#d9a441",
  goldPale: "#f0d68a",
  mist: "#c2d6e2",
  mistDeep: "#8fb0c2",
  mistWhite: "#eef4f6",
  bone: "#e9deca",
  rose: "#e2a0a0",
};
const M = {
  neckRoot: [0, 1.32, 0.72] as [number, number, number],
  headRoot: [0, 1.66, 1.12] as [number, number, number],
  shoulderL: [0.45, 1.06, 0.78] as [number, number, number],
  shoulderR: [-0.45, 1.06, 0.78] as [number, number, number],
  hipL: [0.45, 1.06, -0.72] as [number, number, number],
  hipR: [-0.45, 1.06, -0.72] as [number, number, number],
  tailRoot: [0, 1.32, -1.32] as [number, number, number],
  maneSpine: [0, 1.56, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const INK = P.ink, GOLD = P.gold, GP = P.goldPale;

  // Barrel torso: rump to chest, elliptical sections wider than tall
  const bodyPath = [[0, 1.15, -1.0], [0, 1.05, -0.4], [0, 1.05, 0.2], [0, 1.1, 0.6]];
  const key: [number, number][] = [[0.45, 0.42], [0.55, 0.5], [0.62, 0.55], [0.62, 0.55], [0.58, 0.52]];
  const rad = (t: number): [number, number] => {
    const f = Math.min(Math.max(t, 0), 1) * (key.length - 1);
    const i = Math.min(Math.floor(f), key.length - 2);
    const u = f - i;
    return [key[i][0] + (key[i + 1][0] - key[i][0]) * u, key[i][1] + (key[i + 1][1] - key[i][1]) * u];
  };
  const torso = b.sweep(bodyPath, rad, {
    bone: J.body, color: P.indigo, sides: 12, smooth: false,
    sectors: [[115, 245, P.cream]],
  });

  // Neck
  const neck = b.sweep([[0, 1.2, 0.55], [0, 1.4, 0.85], [0, 1.66, 1.12]], [0.34, 0.27], {
    bone: J.neck, color: P.indigo, sides: 10, smooth: false, caps: { start: "round", end: "flat" },
    sectors: [[120, 240, P.cream]],
  });

  // Ink zig-zag edge between indigo and cream
  const zig = (sw: any, t0: number, t1: number, n: number, bone: any) => {
    for (const centre of [115, 245]) {
      const pts: any[] = [];
      for (let i = 0; i <= n; i++) {
        const t = t0 + ((t1 - t0) * i) / n;
        pts.push(sw.at(t, centre + (i % 2 ? 9 : -9), 0.008).at);
      }
      b.sweep(pts, 0.013, { bone, color: INK, sides: 5, caps: "round" });
    }
  };
  zig(torso, 0.04, 0.96, 26, J.body);
  zig(neck, 0.15, 0.92, 10, J.neck);

  // Woodblock tone patches on upper flank
  const skin = b.surface(torso);
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const t = 0.1 + i * 0.15 + R() * 0.04;
      const ang = s > 0 ? 270 + 25 + R() * 40 : 90 - 25 - R() * 40;
      const h = torso.at(t, ang, 0);
      b.stick(new THREE.SphereGeometry(1, 6, 4), P.indigoLight, h, {
        embed: 0.5, scale: [0.13 + R() * 0.05, 0.025, 0.08 + R() * 0.04], bone: J.body,
      });
    }
    // darker back-edge patches
    const h = torso.at(0.5, s > 0 ? 330 : 30, 0);
    b.stick(new THREE.SphereGeometry(1, 6, 4), P.indigoDeep, h, { embed: 0.5, scale: [0.16, 0.02, 0.1], bone: J.body });
  }

  // Artist's seal on left flank
  const sealHit = skin.nearest([0.7, 1.15, 0.1]);
  b.stick(new THREE.BoxGeometry(0.085, 0.012, 0.115), INK, sealHit, { embed: 0.4, bone: J.body });
  const sealTop = sealHit.moved([0, 0.004, 0]);
  b.stick(new THREE.BoxGeometry(0.07, 0.012, 0.1), P.vermilion, sealTop, { embed: 0.3, bone: J.body });
  const sealHi = sealHit.moved([0, 0.009, 0]);
  for (const [dx, dz, w, d] of [[0, 0.025, 0.045, 0.014], [0, 0, 0.014, 0.04], [0.012, -0.03, 0.03, 0.012]] as number[][])
    b.stick(new THREE.BoxGeometry(w, 0.008, d), P.vermilionDeep, sealHi.moved([dx, 0, dz]), { embed: 0.2, bone: J.body });

  // Gold wave-cloud emblem
  const emblem = (hit: any, r: number) => {
    b.stick(new THREE.CylinderGeometry(r * 1.12, r * 1.12, 0.014, 12), INK, hit, { embed: 0.4, bone: J.body });
    b.stick(new THREE.CylinderGeometry(r, r, 0.014, 12), GOLD, hit.moved([0, 0.004, 0]), { embed: 0.3, bone: J.body });
    b.stick(new THREE.CylinderGeometry(r * 0.78, r * 0.78, 0.01, 12), P.goldPale, hit.moved([0, 0.009, 0]), { embed: 0.2, bone: J.body });
    b.stick(new THREE.CylinderGeometry(r * 0.68, r * 0.68, 0.01, 12), GOLD, hit.moved([0, 0.012, 0]), { embed: 0.2, bone: J.body });
    const n = hit.n.clone();
    const c = hit.at.clone().addScaledVector(n, 0.02);
    const from = offset(c, [0, 1, 0], r * 0.6);
    const path = spiral(c, from, n, { turns: 1.6, r1: r * 0.12, pitch: 0 });
    b.sweep(path, r * 0.07, { bone: J.body, color: INK, sides: 5, caps: "round" });
    // wave scallop dots around the rim
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = offset(c, [Math.cos(a) * n.z + Math.sin(a) * 0, Math.sin(a), -Math.cos(a) * n.x], r * 0.86);
      b.part(new THREE.SphereGeometry(r * 0.09, 5, 4), INK, { at: p, bone: J.body });
    }
  };
  for (const s of [1, -1]) {
    emblem(skin.nearest([s * 0.72, 1.2, 0.5]), 0.09);
    emblem(skin.nearest([s * 0.72, 1.2, -0.85]), 0.125);
  }
}
    return buildBody;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const INK = P.ink, INDIGO = P.indigo, CREAM = P.cream, GOLD = P.gold, PALE = P.goldPale;

  // ---------- skull ----------
  const hc = [0, 1.72, 1.17] as [number, number, number];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), INDIGO, {
    bone: J.head, at: hc, scale: [0.23, 0.22, 0.3],
  });
  const skin = b.surface(skull);
  // cream lower face and cheeks
  b.part(new THREE.SphereGeometry(1, 10, 7), CREAM, {
    bone: J.head, at: [0, 1.6, 1.3], scale: [0.18, 0.11, 0.24],
  });
  // brow-ridge shade over the forehead
  b.part(new THREE.SphereGeometry(1, 8, 6), P.indigoDeep, {
    bone: J.head, at: [0, 1.8, 1.0], scale: [0.2, 0.12, 0.16],
  });
  // nose bridge / muzzle to [0,1.62,1.5]
  b.sweep([[0, 1.73, 1.25], [0, 1.68, 1.4], [0, 1.62, 1.5]], [0.13, 0.1], {
    bone: J.head, color: INDIGO, sides: 8, caps: "round",
  });
  // cream muzzle underside
  b.sweep([[0, 1.6, 1.3], [0, 1.55, 1.45]], [0.11, 0.09], { bone: J.head, color: CREAM, sides: 8 });

  // ---------- trunk ----------
  const tp = [V(0, 1.64, 1.48), V(0, 1.6, 1.7), V(0, 1.42, 1.88)];
  const trunkPath = catmull([[0, 1.66, 1.4], ...tp.map((p) => [p.x, p.y, p.z])]);
  const rad = (t: number) => 0.15 - 0.08 * t;
  b.sweep(trunkPath, rad, {
    bone: [J.trunkA, J.trunkB, J.trunkTip], color: INDIGO, sides: 10, caps: "flat",
    sectors: [[105, 255, CREAM]],
  });
  for (const t of [0.25, 0.42, 0.6, 0.78]) {
    const p = trunkPath.at(t);
    const tg = trunkPath.tangentAt(t);
    const bone = t < 0.4 ? J.trunkA : t < 0.7 ? J.trunkB : J.trunkTip;
    b.part(new THREE.TorusGeometry(rad(t) + 0.003, 0.007, 4, 12), INK, {
      bone, at: p, dir: tg, axis: "z",
    });
  }
  // tulip lip
  const endP = trunkPath.at(1);
  const endT = trunkPath.tangentAt(1).clone().normalize();
  b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.05, 10), CREAM, {
    bone: J.trunkTip, at: endP.clone().addScaledVector(endT, 0.0), dir: endT,
  });
  b.part(new THREE.TorusGeometry(0.095, 0.011, 4, 12), P.creamShade, {
    bone: J.trunkTip, at: endP.clone().addScaledVector(endT, 0.025), dir: endT, axis: "z",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 8), INK, {
      bone: J.trunkTip, at: endP.clone().addScaledVector(endT, 0.028).add(V(s * 0.04, 0, 0)), dir: endT,
    });
    // cream lip curls
    const a = endP.clone().add(V(s * 0.1, 0, 0)).addScaledVector(endT, -0.02);
    const c = endP.clone().add(V(s * 0.115, 0, 0)).addScaledVector(endT, 0.045);
    b.capsule(a, c, 0.014, CREAM, { bone: J.trunkTip, sides: 6 });
  }

  // ---------- jaw ----------
  b.sweep([[0, 1.54, 1.36], [0, 1.5, 1.62]], [0.09, 0.07], {
    bone: J.jaw, color: CREAM, sides: 8, caps: "round",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
    bone: J.jaw, at: [0, 1.495, 1.6], scale: [0.075, 0.05, 0.06],
  });
  b.rod([0, 1.585, 1.38], [0, 1.545, 1.63], 0.008, INK, { bone: J.jaw, sides: 5 });
  for (const s of [1, -1]) {
    b.rod([s * 0.075, 1.56, 1.38], [s * 0.06, 1.53, 1.6], 0.007, INK, { bone: J.jaw, sides: 5 });
  }

  // ---------- tusks ----------
  for (const s of [1, -1]) {
    const base = V(s * 0.14, 1.57, 1.48);
    const dir = V(s * 0.12, 1, 0.35).normalize();
    b.spike(base, dir, 0.11, 0.02, { bone: J.head, color: P.bone, sides: 6 });
    b.spike(base.clone().addScaledVector(dir, 0.07), dir, 0.05, 0.009, { bone: J.head, color: INK, sides: 5 });
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.18, 1.75, 1.33]);
    const n = hit.n.clone().add(V(s * 0.15, 0, 0.35)).normalize();
    const pos = hit.at.clone();
    const up = V(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const side = V().crossVectors(up, n).normalize();
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
      bone: J.head, at: pos.clone().addScaledVector(n, 0.0), dir: n, axis: "z", scale: [0.095, 0.085, 0.04],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), INK, {
      bone: J.head, at: pos.clone().addScaledVector(n, 0.02), dir: n, axis: "z", scale: [0.07, 0.055, 0.03],
    });
    b.part(new THREE.CircleGeometry(0.04, 10), GOLD, {
      bone: J.head, at: pos.clone().addScaledVector(n, 0.043), dir: n, axis: "z",
    });
    b.part(new THREE.CircleGeometry(0.02, 8), INK, {
      bone: J.head, at: pos.clone().addScaledVector(n, 0.045), dir: n, axis: "z",
    });
    b.part(new THREE.CircleGeometry(0.009, 6), PALE, {
      bone: J.head, at: pos.clone().addScaledVector(n, 0.047).addScaledVector(up, 0.014).addScaledVector(side, 0.01),
      dir: n, axis: "z",
    });
    // brow stroke
    const b1 = skin.nearest(pos.clone().addScaledVector(up, 0.1).add(V(-s * 0.07, 0, 0.0)));
    const b2 = skin.nearest(pos.clone().addScaledVector(up, 0.09).add(V(s * 0.06, 0, -0.04)));
    b.capsule(b1.at.clone().addScaledVector(b1.n, 0.008), b2.at.clone().addScaledVector(b2.n, 0.008), 0.014, INK, {
      bone: J.head, sides: 6,
    });
  }

  // ---------- ears ----------
  const leaf: [number, number][] = [
    [-0.05, -0.12], [0.05, -0.12], [0.1, 0.0], [0.1, 0.1], [0.05, 0.18], [0, 0.22], [-0.05, 0.18], [-0.1, 0.1], [-0.1, 0.0],
  ];
  const lk = (k: number): [number, number][] => leaf.map(([x, y]) => [x * k, (y - 0.05) * k + 0.05]);
  for (const s of [1, -1]) {
    const ear = s > 0 ? J.earL : J.earR;
    const dir = V(s * 0.4, 0.9, -0.2).normalize();
    const nrm = V(0, 0, 1).cross(dir).normalize();
    const inner = Math.sign(nrm.x * -s) || 1;
    const at = ear.at.clone();
    const common = { x: [0, 0, 1] as [number, number, number], y: dir.toArray() as [number, number, number], bone: ear, smoothing: 1 };
    b.extrude(lk(1.22), { ...common, at, thickness: 0.012, color: INK });
    b.extrude(lk(1.12), { ...common, at, thickness: [0.02, 0.012], color: CREAM });
    b.extrude(leaf, { ...common, at, thickness: [0.034, 0.01], color: INDIGO });
    b.extrude(lk(0.68), {
      ...common, at: at.clone().addScaledVector(nrm, inner * 0.0185), thickness: 0.006, color: P.rose,
    });
  }

  // ---------- brow moon ----------
  const R = 0.09;
  const crescent: [number, number][] = [];
  for (let a = -140; a <= 140; a += 20) crescent.push([R * Math.cos((a * Math.PI) / 180), R * Math.sin((a * Math.PI) / 180)]);
  for (let a = 119; a >= -119; a -= 24) {
    const r = 0.0665, c = -0.0365;
    crescent.push([c + r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)]);
  }
  // rotate so horns open upward, then scale
  const cres = (k: number): [number, number][] => crescent.map(([x, y]) => [y * k, -x * k]);
  const mn = V(0, 0.6, 0.8);
  const mpos = V(0, 1.93, 1.27).addScaledVector(mn, -0.01);
  const mc = { x: [1, 0, 0] as [number, number, number], y: [0, 0.8, -0.6] as [number, number, number], bone: J.head };
  b.extrude(cres(1.2), { ...mc, at: mpos, thickness: 0.012, color: INK });
  glow(b.extrude(cres(1), { ...mc, at: mpos, thickness: 0.026, bevel: 0.004, color: GOLD }), 1.2);
  glow(b.extrude(cres(0.62), { ...mc, at: mpos.clone().addScaledVector(mn, 0.0135), thickness: 0.006, color: PALE }), 1.2);

  // vermilion seal dot beneath
  const seal = skin.nearest([0, 1.9, 1.4]);
  b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 8), P.vermilion, seal, { bone: J.head, embed: 0.3 });

  // ---------- rest pose: jaw open ----------
  b.pose(J.jaw, { axis: [1, 0, 0], deg: 12 });
}
    return buildHead;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const flat = { flat: true } as const;

  // Cone-like segment between two points, with tapered radius, riding a bone.
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any) =>
    b.capsule(a, c, [r0, r1], color, { bone, sides: 8 });

  // Ring (band) around a segment at point p, axis along dir.
  const band = (p: number[], dir: number[], r: number, h: number, color: string, bone: any) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 8), color, { at: p, dir, bone });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = 0.45 * s;

    // ---------- FRONT LEG ----------
    const fu = J["legFU" + S], fl = J["legFL" + S], ff = J["legFF" + S];
    const shoulder = [x, 1.06, 0.78];
    const knee = [x, 0.6, 0.79];
    const ankle = [x, 0.16, 0.78];
    // upper (buried 0.12+ into body: start 0.14 above joint)
    seg([x, 1.2, 0.78], knee, 0.16, 0.14, P.indigo, fu);
    // lower
    seg(knee, [x, 0.2, 0.78], 0.135, 0.125, P.indigoDeep, fl);
    // knee ink ring
    band([x, 0.6, 0.79], [0, 1, 0], 0.145, 0.025, P.ink, fl);
    // cream sock mid-shin down
    b.rod([x, 0.36, 0.78], [x, 0.2, 0.78], [0.132, 0.126], P.cream, { bone: fl, sides: 8 });
    band([x, 0.37, 0.78], [0, 1, 0], 0.134, 0.015, P.ink, fl);
    // gold cuff
    band([x, 0.2, 0.78], [0, 1, 0], 0.14, 0.04, P.gold, ff);

    // ---------- HIND LEG ----------
    const hu = J["legHU" + S], hk = J["legHK" + S], hh = J["legHH" + S], hf = J["legHF" + S];
    const hip = [x, 1.2, -0.7];
    const hknee = [x, 0.62, -0.64];
    const hock = [x, 0.44, -0.8];
    const hfoot = [x, 0.2, -0.74];
    seg(hip, hknee, 0.17, 0.14, P.indigo, hu);
    seg(hknee, hock, 0.14, 0.125, P.indigo, hk);
    seg(hock, hfoot, 0.125, 0.12, P.indigoDeep, hh);
    // hock sphere joint filler
    b.part(new THREE.SphereGeometry(0.13, 8, 6), P.indigo, { at: hock, bone: hh });
    // knee-cap ink disc on outer side
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), P.ink, {
      at: [x + s * 0.13, 0.62, -0.62], dir: [s, 0, 0], bone: hk,
    });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 8), P.goldPale, {
      at: [x + s * 0.135, 0.62, -0.62], dir: [s, 0, 0], bone: hk,
    });
    // sock
    b.rod([x, 0.34, -0.75], [x, 0.2, -0.74], [0.123, 0.12], P.cream, { bone: hh, sides: 8 });
    band([x, 0.35, -0.75], [0, 1, 0], 0.126, 0.015, P.ink, hh);
    band([x, 0.2, -0.74], [0, 1, 0], 0.135, 0.04, P.gold, hf);

    // ---------- FEET (three toes) ----------
    const feet: [any, number][] = [[ff, 0.78], [hf, -0.74]];
    for (const [bone, z] of feet) {
      // foot base pad
      b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.05, 8), P.creamShade, {
        at: [x, 0.025, z + 0.02], bone,
      });
      for (const a of [-22, 0, 22]) {
        const rad = (a * Math.PI) / 180;
        const cx = x + Math.sin(rad) * 0.1 * s;
        const cz = z + 0.02 + Math.cos(rad) * 0.1;
        const dir = [Math.sin(rad) * s, 0, Math.cos(rad)];
        // toe: tapered box lying forward, top at y 0.15, bottom at y 0
        const w = a === 0 ? 0.1 : 0.085;
        b.part(new THREE.BoxGeometry(w, 0.13, 0.15), P.gold, {
          at: [cx, 0.065, cz], dir, axis: "z", bone,
        });
        // sloping hoof top
        b.part(new THREE.BoxGeometry(w * 0.9, 0.04, 0.1), P.goldPale, {
          at: [cx + dir[0] * 0.02, 0.13, cz + dir[2] * 0.02], dir, axis: "z", bone,
        });
        // ink outline on front face
        b.part(new THREE.BoxGeometry(w * 0.7, 0.016, 0.012), P.ink, {
          at: [cx + dir[0] * 0.077, 0.1, cz + dir[2] * 0.077], dir, axis: "z", bone,
        });
        // sole pad
        b.part(new THREE.BoxGeometry(w * 0.85, 0.012, 0.12), P.creamShade, {
          at: [cx, 0.006, cz], dir, axis: "z", bone,
        });
      }
      // ink ring above the cuff
      band([x, 0.235, z], [0, 1, 0], 0.13, 0.012, P.ink, bone);
    }
    // small gold accent stripes on upper legs (cloud motif dots)
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), P.goldPale, {
        at: [x + s * (0.148 - i * 0.005), 0.86 - i * 0.1, 0.78 + (R() - 0.5) * 0.05], bone: fu,
      });
    }
  }
}
    return buildLegs;
  })(),
  // maneTail
  (() => {
function buildManeTail({ b, J, P, M }: Ctx) {
  const rand = rng(11);

  // ---------- Mane: two staggered rows of smoke blades along the dorsal line ----------
  const dorsal = catmull([
    [0, 2.0, 1.15],
    [0, 1.9, 0.9],
    [0, 1.72, 0.5],
    [M.maneSpine[0], M.maneSpine[1] + 0.04, M.maneSpine[2]],
    [0, 1.56, -0.7],
    [0, 1.5, -1.1],
    [M.tailRoot[0], M.tailRoot[1] + 0.12, M.tailRoot[2]],
  ]);

  const boneFor = (z: number) => (z > 1.0 ? J.head : z > 0.65 ? J.neck : J.body);

  const blade = (t: number, side: number, h: number, lean: number, r: number, tipColor: string) => {
    const p = dorsal.at(t);
    const x = side * 0.045;
    const base: [number, number, number] = [x, p.y - 0.03, p.z];
    const back = Math.tan((lean * Math.PI) / 180);
    const mid: [number, number, number] = [x + side * 0.01, base[1] + h * 0.6, base[2] - h * back * 0.25];
    const tip: [number, number, number] = [x + side * 0.03, base[1] + h, base[2] - h * back];
    b.sweep(bezier(base, mid, tip), [r, 0], {
      bone: boneFor(p.z),
      caps: { start: "flat", end: "point" },
      sides: 5,
      bands: [
        [0.3, P.indigoDeep],
        [0.58, P.mist],
        [0.82, P.mistWhite],
        [1, tipColor],
      ],
    });
  };

  const rowCount = 12;
  for (let row = 0; row < 2; row++) {
    const side = row === 0 ? 1 : -1;
    for (let i = 0; i < rowCount; i++) {
      const t = (i + (row ? 0.5 : 0.1)) / (rowCount + 0.2);
      const h = 0.16 + 0.12 * Math.sin(Math.PI * Math.min(1, t * 1.15)) + rand() * 0.03;
      const lean = 20 + 20 * t + rand() * 4;
      const r = 0.03 - 0.015 * Math.abs(t - 0.4);
      blade(Math.min(t, 0.98), side, h, lean, Math.max(r, 0.015), P.goldPale);
    }
  }
  // long silhouette wisps at neck and rump
  const wisps: [number, number][] = [[0.14, 1], [0.27, -1], [0.88, 1], [0.97, -1]];
  for (const [t, s] of wisps) blade(t, s * 0.3, 0.4, 38, 0.032, P.gold);

  // ---------- Tail ----------
  const tailPath = catmull([
    [0, 1.38, -1.25],
    [0, 1.32, -1.32],
    [0, 1.05, -1.62],
    [0, 0.62, -1.78],
  ]);
  b.sweep(tailPath, [0.085, 0.04], {
    bone: [J.tailBase, J.tailMid, J.tailTip],
    color: P.ink,
    sides: 8,
    caps: { start: "round", end: "round" },
  });

  const bandAt = tailPath.at(0.62);
  const bandT = tailPath.tangentAt(0.62);
  b.part(new THREE.TorusGeometry(0.066, 0.016, 6, 12), P.gold, {
    at: bandAt,
    dir: bandT,
    axis: "z",
    bone: J.tailMid,
  });
  b.part(new THREE.TorusGeometry(0.066, 0.006, 4, 12), P.goldPale, {
    at: [bandAt.x, bandAt.y + 0.03, bandAt.z - 0.01],
    dir: bandT,
    axis: "z",
    bone: J.tailMid,
  });

  // tassel
  const tip: [number, number, number] = [0, 0.64, -1.78];
  b.part(new THREE.TorusGeometry(0.052, 0.017, 6, 12), P.gold, {
    at: [0, 0.68, -1.785],
    dir: [0, -1, -0.2],
    axis: "z",
    bone: J.tailTip,
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.05, 8), P.gold, {
    at: [0, 0.62, -1.785],
    bone: J.tailTip,
  });
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const sx = Math.cos(a) * 0.045;
    const sz = Math.sin(a) * 0.045;
    const len = 0.17 + rand() * 0.04;
    const base: [number, number, number] = [sx * 0.5, tip[1] + 0.0, tip[2] + sz * 0.5];
    const end: [number, number, number] = [sx * 1.7, 0.45 + rand() * 0.02, tip[2] + sz * 1.7];
    const mid: [number, number, number] = [sx * 1.1, tip[1] - len * 0.5, tip[2] + sz * 1.1];
    b.sweep(bezier(base, mid, end), [0.034, 0.004], {
      bone: J.tailTip,
      sides: 5,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.55, P.mistWhite],
        [1, P.mist],
      ],
    });
  }
}
    return buildManeTail;
  })(),
  // dreams
  (() => {
function buildDreams({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const tip: [number, number, number] = [0, 1.42, 1.9];

  // Spiral of smoke: starts at the outer end (far from the nostril), ends at the nostril tip.
  // Build spiral path in the xy plane around the z axis, then reverse so it ends at the tip.
  const center: [number, number, number] = [0, 1.42, 2.28];
  const sp = spiral(center, [0.12, 1.42, 2.28], [0, 0, -1], { turns: 2, r1: 0.05, pitch: 0.19 });
  // sp starts at outer radius 0.12 (z 2.28) and moves toward -z with shrinking radius, ends near z 1.9
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) pts.push(sp.at(i / 40).clone());
  const end = pts[pts.length - 1];
  // pull the last point exactly to the tip
  pts[pts.length - 1] = new THREE.Vector3(tip[0], tip[1], tip[2]);
  void end;
  const path = catmull(pts.map((p) => [p.x, p.y, p.z] as [number, number, number]));
  b.sweep(path, [0.035, 0.012], {
    bone: J.trunkTip,
    color: (t: number) => (t < 0.35 ? P.mistDeep : t < 0.7 ? P.mist : P.mistWhite),
    sides: 6,
  });

  const squash = (r: number, sx: number, sy: number, sz: number, at: number[], col: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone: J.head, at: at as [number, number, number], scale: [sx, sy, sz], flat: true });

  const star = (at: number[], size: number, col: string, tilt = 0) => {
    const o: [number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 2;
      const r = i % 2 ? size * 0.18 : size * 0.5;
      o.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    const rim = b.extrude(o, { at: at as [number, number, number], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: P.ink, bone: J.head });
    void rim;
    const s2 = o.map(([x, y]) => [x * 0.78, y * 0.78] as [number, number]);
    glow(
      b.extrude(s2, { at: [at[0], at[1], at[2] + 0.008] as [number, number, number], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: col, bone: J.head }),
      0.8,
    );
    void tilt;
  };

  const puff = (c: number[], s: number, starCol: string) => {
    const [x, y, z] = c;
    // undersides first
    squash(0.1 * s, 1.3, 0.45, 1, [x, y - 0.045 * s, z], P.mistDeep);
    squash(0.08 * s, 1.3, 0.4, 1, [x + 0.1 * s, y - 0.035 * s, z + 0.01], P.mistDeep);
    squash(0.075 * s, 1.3, 0.4, 1, [x - 0.1 * s, y - 0.035 * s, z - 0.01], P.mistDeep);
    // tops
    squash(0.1 * s, 1.2, 0.8, 1, [x, y + 0.01 * s, z], P.mistWhite);
    squash(0.07 * s, 1.1, 0.8, 1, [x + 0.1 * s, y, z + 0.01], P.mistWhite);
    squash(0.065 * s, 1.1, 0.8, 1, [x - 0.1 * s, y, z - 0.01], P.mistWhite);
    squash(0.06 * s, 1, 0.8, 1, [x + 0.03 * s, y + 0.07 * s, z], P.mistWhite);
    // ink underside line
    b.part(new THREE.BoxGeometry(0.28 * s, 0.006, 0.012), P.ink, { bone: J.head, at: [x, y - 0.075 * s, z + 0.05 * s] });
    star([x, y + 0.04 * s, z + 0.1 * s], 0.06, starCol);
  };

  puff([0.2, 1.55, 2.2], 1, P.gold);
  puff([-0.25, 1.75, 2.35], 1.05, P.vermilion);
  puff([0.05, 1.5, 2.5], 0.9, P.gold);

  // loose stars
  star([-0.08, 1.64, 2.12], 0.06, P.gold);
  star([0.33, 1.78, 2.4], 0.055, P.goldPale);
  star([-0.38, 1.52, 2.45], 0.05, P.gold);

  // moon crescent
  const crescent = (r: number, k: number): [number, number][] => {
    const o: [number, number][] = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI * 0.8 + (i / n) * Math.PI * 1.6;
      o.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    for (let i = n - 1; i >= 1; i--) {
      const a = -Math.PI * 0.8 + (i / n) * Math.PI * 1.6;
      o.push([Math.cos(a) * r * 0.72 + r * k, Math.sin(a) * r * 0.78]);
    }
    return o;
  };
  const mc: [number, number, number] = [0, 1.92, 2.45];
  b.extrude(crescent(0.155, 0.32), { at: [mc[0], mc[1], mc[2] - 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: P.ink, bone: J.head });
  glow(
    b.extrude(crescent(0.14, 0.3), { at: [mc[0] - 0.005, mc[1], mc[2]], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, color: P.gold, bone: J.head }),
    1.3,
  );
  glow(
    b.extrude(crescent(0.11, 0.26), { at: [mc[0] - 0.005, mc[1], mc[2] + 0.014], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: P.goldPale, bone: J.head }),
    1.3,
  );

  // small drifting wisps near the spiral
  for (let i = 0; i < 4; i++) {
    const a = R() * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.018, 6, 4), P.mistWhite, {
      bone: J.trunkTip,
      at: [Math.cos(a) * 0.15, 1.45 + Math.sin(a) * 0.12, 2.0 + R() * 0.2],
    });
  }
}
    return buildDreams;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bakuDreamEater" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,1.32,0.72], dir: [0,0.65,0.76], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.66,1.12], dir: [0,0.15,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.54,1.36], dir: [0,-0.35,1], role: "jaw" });
  J["trunkA"] = b.joint("trunkA", { parent: J["head"], at: [0,1.64,1.48], dir: [0,-0.1,1], role: "tentacle" });
  J["trunkB"] = b.joint("trunkB", { parent: J["trunkA"], at: [0,1.6,1.7], dir: [0,-0.5,1], role: "tentacle" });
  J["trunkTip"] = b.joint("trunkTip", { parent: J["trunkB"], at: [0,1.42,1.88], dir: [0,-0.9,0.4], role: "tentacle" });
  J["earL"] = b.joint("earL", { parent: J["head"], at: [0.2,1.96,1.08], dir: [0.4,0.9,-0.2], role: "hinge" });
  J["earR"] = b.joint("earR", { parent: J["head"], at: [-0.2,1.96,1.08], dir: [-0.4,0.9,-0.2], role: "hinge" });
  J["legFUL"] = b.joint("legFUL", { parent: J["body"], at: [0.45,1.06,0.78], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legFLL"] = b.joint("legFLL", { parent: J["legFUL"], at: [0.45,0.6,0.79], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legFFL"] = b.joint("legFFL", { parent: J["legFLL"], at: [0.45,0.16,0.78], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legFUR"] = b.joint("legFUR", { parent: J["body"], at: [-0.45,1.06,0.78], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legFLR"] = b.joint("legFLR", { parent: J["legFUR"], at: [-0.45,0.6,0.79], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legFFR"] = b.joint("legFFR", { parent: J["legFLR"], at: [-0.45,0.16,0.78], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legHUL"] = b.joint("legHUL", { parent: J["body"], at: [0.45,1.06,-0.72], dir: [0,-1,0.15], role: "leg", group: "legs" });
  J["legHKL"] = b.joint("legHKL", { parent: J["legHUL"], at: [0.45,0.62,-0.64], dir: [0,-0.6,-0.8], role: "leg", group: "legs" });
  J["legHHL"] = b.joint("legHHL", { parent: J["legHKL"], at: [0.45,0.44,-0.8], dir: [0,-0.95,0.25], role: "leg", group: "legs" });
  J["legHFL"] = b.joint("legHFL", { parent: J["legHHL"], at: [0.45,0.16,-0.74], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legHUR"] = b.joint("legHUR", { parent: J["body"], at: [-0.45,1.06,-0.72], dir: [0,-1,0.15], role: "leg", group: "legs" });
  J["legHKR"] = b.joint("legHKR", { parent: J["legHUR"], at: [-0.45,0.62,-0.64], dir: [0,-0.6,-0.8], role: "leg", group: "legs" });
  J["legHHR"] = b.joint("legHHR", { parent: J["legHKR"], at: [-0.45,0.44,-0.8], dir: [0,-0.95,0.25], role: "leg", group: "legs" });
  J["legHFR"] = b.joint("legHFR", { parent: J["legHHR"], at: [-0.45,0.16,-0.74], dir: [0,-1,0], role: "leg", group: "legs" });
  J["tailBase"] = b.joint("tailBase", { parent: J["body"], at: [0,1.32,-1.32], dir: [0,-0.3,-0.95], role: "tail" });
  J["tailMid"] = b.joint("tailMid", { parent: J["tailBase"], at: [0,1.05,-1.62], dir: [0,-0.7,-0.7], role: "tail" });
  J["tailTip"] = b.joint("tailTip", { parent: J["tailMid"], at: [0,0.62,-1.78], dir: [0,-1,-0.2], role: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
