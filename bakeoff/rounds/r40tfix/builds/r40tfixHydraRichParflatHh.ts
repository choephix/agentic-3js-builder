import * as THREE from "three";
import { createBuilder, type Builder, type Joint, aim, catmull, rng, polyline, bezier, frame, vec } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Hydra of the Broken Mere",
  "description": "A colossal five-headed Norse-style hydra in a God of War look: scarred slate-green hide, bone horns, iron-bound leather and broken weapons embedded in its flesh, with ember, frost and venom runes glowing on each head."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  scaleDark: "#2b3a34",
  scaleMid: "#3f5547",
  scaleLight: "#5b7560",
  belly: "#a89a6c",
  bellyDark: "#7d6f4a",
  scar: "#8c2f24",
  bone: "#d6cbb0",
  boneDark: "#9a8d72",
  horn: "#3a2f28",
  hornTip: "#cfc3a4",
  iron: "#4b4e55",
  ironDark: "#26282d",
  rust: "#7a4326",
  leather: "#5b3b24",
  chain: "#6b6f78",
  ember: "#ff7a2a",
  emberHot: "#ffc15a",
  frost: "#6fd8ff",
  venom: "#9bd13a",
  eye: "#ffb52a",
  eyeSlit: "#120a08",
  mouth: "#7a2a2c",
  tooth: "#e4dcc0",
};
const M = {
  torsoStations_zYWH: [[2.2,2.7,1.5,1.5],[1.6,2.5,2.5,1.9],[0.5,2.4,2.9,1.8],[-0.8,2.3,2.8,1.7],[-1.8,2.2,2.2,1.4],[-2.4,2.1,1.2,1.1]] as unknown as [number, number, number],
  tailBase: [0, 2, -2.5] as [number, number, number],
  dorsalRidgeEnd: [0, 2.65, -2.4] as [number, number, number],
  neckBaseC: [0, 3, 1.7] as [number, number, number],
  neckBaseIL: [0.7, 3, 1.6] as [number, number, number],
  neckBaseIR: [-0.7, 3, 1.6] as [number, number, number],
  neckBaseOL: [1.1, 2.9, 1.3] as [number, number, number],
  neckBaseOR: [-1.1, 2.9, 1.3] as [number, number, number],
  skullC: [0, 5.6, 2.6] as [number, number, number],
  skullIL: [1.75, 5.1, 3] as [number, number, number],
  skullIR: [-1.75, 5.1, 3] as [number, number, number],
  skullOL: [2.85, 4.3, 2.95] as [number, number, number],
  skullOR: [-2.85, 4.3, 2.95] as [number, number, number],
  jawHingeC: [0, 5.35, 3.05] as [number, number, number],
  jawHingeIL: [1.75, 4.9, 3.35] as [number, number, number],
  jawHingeIR: [-1.75, 4.9, 3.35] as [number, number, number],
  jawHingeOL: [2.9, 4.05, 3.3] as [number, number, number],
  jawHingeOR: [-2.9, 4.05, 3.3] as [number, number, number],
  rearHipL: [1.2, 2.1, -1.5] as [number, number, number],
  rearHipR: [-1.2, 2.1, -1.5] as [number, number, number],
  frontShoulderL: [1.3, 2.3, 1.5] as [number, number, number],
  frontShoulderR: [-1.3, 2.3, 1.5] as [number, number, number],
  footContactBL: [1.4, 0, -1.4] as [number, number, number],
  footContactBR: [-1.4, 0, -1.4] as [number, number, number],
  footContactFL: [1.6, 0, 2] as [number, number, number],
  footContactFR: [-1.6, 0, 2] as [number, number, number],
  tailTip: [0, 0.3, -6.7] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: any };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torsoFrontLegs
  (() => {
function buildTorsoFrontLegs({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const R = rng(31);
  const safe = (f: () => void) => {
    try {
      f();
    } catch (e) {
      /* a failed detail never kills the part */
    }
  };

  // ---------------------------------------------------------------- batching helpers
  // Many small static pieces on one bone with one colour are merged into a single part.
  const batches = new Map<string, { geos: THREE.BufferGeometry[]; color: string; bone: any }>();
  const addGeo = (key: string, color: string, bone: any, geo: THREE.BufferGeometry) => {
    let bt = batches.get(key);
    if (!bt) {
      bt = { geos: [], color, bone };
      batches.set(key, bt);
    }
    bt.geos.push(geo);
  };
  // put a geometry (local +Y = dir, local +Z leaning toward up) at a model-space point
  const putGeo = (geo: THREE.BufferGeometry, at: THREE.Vector3, dir: THREE.Vector3, up?: THREE.Vector3, lift = 0) => {
    const d = dir.clone().normalize();
    const q = aim(d, up);
    geo.applyMatrix4(new THREE.Matrix4().compose(at.clone().addScaledVector(d, lift), q, V(1, 1, 1)));
    return geo;
  };
  const flush = () => {
    for (const [key, bt] of batches) {
      const g = mergeGeometries(bt.geos);
      if (g) b.part(g, bt.color, { bone: bt.bone, at: [0, 0, 0], flat: true, name: `torsoFrontLegs_${key}` });
    }
  };

  const st = M.torsoStations_zYWH as unknown as number[][];
  const tw = (z: number) => {
    for (let i = 0; i < st.length - 1; i++) {
      const a = st[i];
      const c = st[i + 1];
      if (z <= a[0] && z >= c[0]) {
        const t = (a[0] - z) / (a[0] - c[0]);
        return { y: a[1] + (c[1] - a[1]) * t, w: a[2] + (c[2] - a[2]) * t, h: a[3] + (c[3] - a[3]) * t };
      }
    }
    const e = z > st[0][0] ? st[0] : st[st.length - 1];
    return { y: e[1], w: e[2], h: e[3] };
  };
  const boneAt = (z: number): any => (z > -0.15 ? J.chest : J.hips);

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    st.map(([z, y, w, h]) => ({ at: [0, y, z] as [number, number, number], w, h })),
    {
      bone: [J.hips, J.chest],
      color: P.scaleMid,
      sides: 12,
      caps: "flat",
      sectors: [
        [-45, 45, P.scaleDark],
        [135, 225, P.bellyDark],
      ],
    } as any,
  );

  // shoulder hump swallowing the five neck roots
  const HC = V(0, 2.85, 1.5);
  const HR = [1.35, 0.65, 0.7];
  const hump = b.part(new THREE.SphereGeometry(1, 14, 10), P.scaleDark, {
    bone: J.chest,
    at: HC,
    scale: HR as any,
    flat: true,
  });
  const ell = (p: THREE.Vector3) =>
    ((p.x - HC.x) / HR[0]) ** 2 + ((p.y - HC.y) / HR[1]) ** 2 + ((p.z - HC.z) / HR[2]) ** 2;
  const bodySkin = b.surface([torso, hump]);
  const torsoSkin = b.surface(torso);

  // ---------------------------------------------------------------- neck collars
  const collarCentres: THREE.Vector3[] = [];
  const necks: [string, number][] = [
    ["C", 0.5],
    ["IL", 0.42],
    ["IR", 0.42],
    ["OL", 0.38],
    ["OR", 0.38],
  ];
  for (const [id, r] of necks) {
    safe(() => {
      const mb = M["neckBase" + id] as number[];
      const base = V(mb[0], mb[1], mb[2]);
      const d = new THREE.Vector3().subVectors(J["neck" + id + "2"].at, J["neck" + id + "1"].at).normalize();
      let t = 0;
      while (t < 3 && ell(base.clone().addScaledVector(d, t)) < 1) t += 0.02;
      const c = base.clone().addScaledVector(d, t + 0.08);
      collarCentres.push(c.clone());
      const Rr = r + 0.06;
      b.part(new THREE.TorusGeometry(Rr, 0.085, 6, 12), P.iron, { bone: J.chest, at: c, dir: d, axis: "z", flat: true });
      b.part(new THREE.TorusGeometry(Rr + 0.01, 0.065, 6, 12), P.leather, {
        bone: J.chest,
        at: c.clone().addScaledVector(d, 0.14),
        dir: d,
        axis: "z",
        flat: true,
      });
      const ref = Math.abs(d.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
      const u = new THREE.Vector3().crossVectors(ref, d).normalize();
      const v = new THREE.Vector3().crossVectors(d, u).normalize();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const p = c
          .clone()
          .addScaledVector(u, Math.cos(a) * (Rr + 0.085))
          .addScaledVector(v, Math.sin(a) * (Rr + 0.085));
        addGeo("collarRivets", P.chain, J.chest, new THREE.SphereGeometry(0.036, 6, 4).translate(p.x, p.y, p.z));
      }
      // buckle on the leather strap, facing forward-ish
      const bp = c
        .clone()
        .addScaledVector(d, 0.14)
        .addScaledVector(v, Rr + 0.06);
      addGeo(
        "collarBuckle",
        P.chain,
        J.chest,
        putGeo(new THREE.BoxGeometry(0.13, 0.05, 0.11), bp, v, d),
      );
    });
  }

  // ---------------------------------------------------------------- planned damage sites (exclusions for plates)
  const excl: [THREE.Vector3, number][] = [
    [V(1.3, 2.4, -0.55), 0.95],
    [V(-1.3, 2.5, -0.3), 0.95],
    [V(1.0, 3.0, 0.1), 0.5],
    [V(0.9, 3.05, -1.0), 0.5],
    [V(-0.9, 3.0, 1.15), 0.6],
    ...collarCentres.map((c) => [c, 0.8] as [THREE.Vector3, number]),
  ];

  // ---------------------------------------------------------------- body scale plates (merged)
  safe(() => {
    const hits = bodySkin.scatter(46, {
      rng: R,
      minDist: 0.42,
      filter: (h: any) =>
        h.n.z < 0.6 &&
        h.n.y > -0.25 &&
        h.at.z < 2.1 &&
        h.at.z > -2.3 &&
        Math.abs(h.at.z - 0.75) > 0.2 &&
        !(Math.abs(h.at.x) < 0.35 && h.n.y > 0.85) &&
        !excl.some(([p, r]) => p.distanceTo(h.at) < r),
    } as any);
    for (const h of hits) {
      const bn = boneAt(h.at.z);
      const light = R() < 0.5;
      const geo = new THREE.BoxGeometry(0.2 + R() * 0.18, 0.06, 0.2 + R() * 0.12);
      addGeo(
        `bodyPlate${light ? "L" : "D"}${bn.name}`,
        light ? P.scaleLight : P.scaleDark,
        bn,
        putGeo(geo, h.at, h.n, V(0, -1, 0), 0.01),
      );
    }
  });

  // ---------------------------------------------------------------- ventral plates
  for (let i = 0; i < 8; i++) {
    const z = 1.85 - i * 0.5;
    const W = tw(z).w;
    const bn = boneAt(z);
    for (const [xf, wf] of [
      [0, 0.3],
      [-0.27, 0.19],
      [0.27, 0.19],
    ]) {
      safe(() => {
        const h = bodySkin.ray(V(xf * W, 0.3, z), V(0, 1, 0)) as any;
        if (!h) return;
        addGeo(
          "ventralOutline" + bn.name,
          P.bellyDark,
          bn,
          putGeo(new THREE.BoxGeometry(wf * W + 0.07, 0.05, 0.47), h.at, h.n, V(0, 0, -1), 0.005),
        );
        addGeo(
          "ventralPlate" + bn.name,
          P.belly,
          bn,
          putGeo(new THREE.BoxGeometry(wf * W, 0.07, 0.4), h.at, h.n, V(0, 0, -1), 0.02),
        );
      });
    }
  }

  // ---------------------------------------------------------------- dorsal ridge (12 back-swept bone blades)
  const BLADE = (H: number): any[] => [
    [-0.17, -0.06],
    [0.17, -0.06],
    [0.2, H * 0.55],
    [0.27, H, "sharp"],
    [-0.04, H * 0.5],
    [-0.14, H * 0.1],
  ];
  const zEnd = (M.dorsalRidgeEnd as number[])[2] + 0.1;
  for (let i = 0; i < 12; i++) {
    safe(() => {
      const z = 1.0 + (zEnd - 1.0) * (i / 11);
      const h = bodySkin.ray(V(0, 8, z), V(0, -1, 0)) as any;
      if (!h) return;
      const H = 0.5 - i * 0.022;
      const bn = boneAt(z);
      b.extrude(BLADE(H), {
        at: h.at,
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.11, 0.04],
        bevel: 0.01,
        color: P.bone,
        bone: bn,
      } as any);
      addGeo(
        "dorsalBase" + bn.name,
        P.boneDark,
        bn,
        putGeo(new THREE.BoxGeometry(0.3 - i * 0.008, 0.12, 0.38), h.at, h.n, V(0, 0, -1), 0.0),
      );
    });
  }

  // ---------------------------------------------------------------- breastplate with ember crack, runes, chain
  const BP: any[] = [
    [-0.52, 0.42],
    [0, 0.52, "sharp"],
    [0.52, 0.42],
    [0.58, -0.05],
    [0, -0.55, "sharp"],
    [-0.58, -0.05],
  ];
  const BPY = 2.6;
  let frontSkin: any = torsoSkin;
  safe(() => {
    b.extrude(
      BP.map((p) => (p.length === 3 ? [p[0] * 1.13, p[1] * 1.13, "sharp"] : [p[0] * 1.13, p[1] * 1.13])),
      { at: [0, BPY, 2.19], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08, color: P.boneDark, bone: J.chest } as any,
    );
    const plate = b.extrude(BP, {
      at: [0, BPY, 2.2],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.03,
      color: P.bone,
      bone: J.chest,
    } as any);
    frontSkin = b.surface([torso, plate]);
    for (const p of BP) {
      addGeo(
        "plateRivets",
        P.iron,
        J.chest,
        new THREE.SphereGeometry(0.03, 6, 4).translate(p[0] * 0.86, BPY + p[1] * 0.86, 2.28),
      );
    }
  });
  const front = (x: number, y: number, lift: number) => {
    const h = frontSkin.ray(V(x, y, 5), V(0, 0, -1)) as any;
    return h ? (h.at.clone().addScaledVector(h.n, lift) as THREE.Vector3) : V(x, y, 2.3 + lift);
  };
  safe(() => {
    const crack: number[][] = [
      [0.0, 2.72],
      [-0.06, 2.58],
      [0.05, 2.44],
      [-0.02, 2.3],
      [0.06, 2.15],
    ];
    for (let i = 0; i < crack.length - 1; i++) {
      const a = crack[i];
      const c = crack[i + 1];
      b.capsule(front(a[0], a[1], 0.012), front(c[0], c[1], 0.012), 0.03, { color: P.ironDark, bone: J.chest });
      glow(b.capsule(front(a[0], a[1], 0.03), front(c[0], c[1], 0.03), 0.014, { color: P.emberHot, bone: J.chest }), 1.8);
    }
    b.capsule(front(-0.06, 2.58, 0.012), front(-0.26, 2.5, 0.012), 0.024, { color: P.ironDark, bone: J.chest });
    glow(b.capsule(front(-0.06, 2.58, 0.03), front(-0.26, 2.5, 0.03), 0.011, { color: P.emberHot, bone: J.chest }), 1.8);
  });

  // ---------------------------------------------------------------- runes
  const GLYPHS: number[][][] = [
    [[0, -1, 0, 1], [0, 0.4, 0.6, 0.95], [0, -0.1, 0.6, 0.45]],
    [[-0.4, -1, -0.4, 1], [-0.4, 1, 0.4, 0.35], [0.4, 0.35, 0.4, -1]],
    [[0, -1, 0, 1], [0, 0.55, 0.5, 0.05], [0.5, 0.05, 0, -0.45]],
    [[0.4, 0.9, -0.35, 0], [-0.35, 0, 0.4, -0.9]],
    [[0.3, 1, -0.3, 0.3], [-0.3, 0.3, 0.3, -0.3], [0.3, -0.3, -0.3, -1]],
    [[0, -1, 0, 1], [0, 0.15, -0.5, 0.85], [0, 0.15, 0.5, 0.85]],
    [[0, -1, 0, 1], [0, 1, -0.5, 0.4], [0, 1, 0.5, 0.4]],
    [[-0.5, 1, 0.5, -1], [0.5, 1, -0.5, -1]],
  ];
  const rune = (
    skin: any,
    origin: THREE.Vector3,
    right: THREE.Vector3,
    up: THREE.Vector3,
    nrm: THREE.Vector3,
    size: number,
    g: number,
  ) => {
    const get = (x: number, y: number) => {
      const p = origin.clone().addScaledVector(right, x * size).addScaledVector(up, y * size);
      const h = skin.ray(p.clone().addScaledVector(nrm, 3), nrm.clone().negate());
      return h ? { p: h.at.clone() as THREE.Vector3, n: h.n.clone() as THREE.Vector3 } : null;
    };
    for (const [x0, y0, x1, y1] of GLYPHS[g % GLYPHS.length]) {
      const a = get(x0, y0);
      const c = get(x1, y1);
      if (!a || !c) continue;
      b.capsule(a.p.clone().addScaledVector(a.n, 0.01), c.p.clone().addScaledVector(c.n, 0.01), 0.02, {
        color: P.ironDark,
        bone: J.chest,
      });
      glow(
        b.capsule(a.p.clone().addScaledVector(a.n, 0.028), c.p.clone().addScaledVector(c.n, 0.028), 0.011, {
          color: P.frost,
          bone: J.chest,
        }),
        1.4,
      );
    }
  };
  safe(() => {
    [-0.32, 0, 0.32].forEach((x, i) =>
      rune(frontSkin, V(x, 2.85, 2.3), V(1, 0, 0), V(0, 1, 0), V(0, 0, 1), 0.075, [0, 4, 6][i]),
    );
  });
  safe(() => {
    // left shoulder (+x): viewer's right is model back; right shoulder (-x): viewer's right is model front
    [
      [1.0, 1, 5],
      [0.55, 1, 2],
      [0.1, 1, 7],
    ].forEach(([z, , g]) => rune(bodySkin, V(0.9, 3.08, z), V(0, 0, -1), V(0, 1, 0), V(1, 0, 0), 0.1, g));
    [
      [1.0, 1, 1],
      [0.55, 1, 3],
      [0.1, 1, 5],
    ].forEach(([z, , g]) => rune(bodySkin, V(-0.9, 3.08, z), V(0, 0, 1), V(0, 1, 0), V(-1, 0, 0), 0.1, g));
  });

  // ---------------------------------------------------------------- chain remnant + spiked shackle
  safe(() => {
    const cp = catmull([
      [-0.72, 3.1, 2.05],
      [-0.62, 2.7, 2.38],
      [-0.35, 2.4, 2.43],
      [0.05, 2.28, 2.43],
      [0.45, 2.22, 2.37],
    ]);
    const N = 11;
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N;
      const geo = new THREE.TorusGeometry(0.055, 0.017, 5, 8).scale(1, 1.55, 1);
      if (i % 2) geo.rotateY(Math.PI / 2);
      addGeo("chainLinks", P.chain, J.chest, putGeo(geo, cp.at(t), cp.tangentAt(t), V(0, 0, 1)));
    }
    const e = cp.at(1);
    const sc = V(e.x + 0.06, e.y - 0.05, 2.36);
    const f = V(0, 0, 1);
    addGeo("shackle", P.iron, J.chest, putGeo(new THREE.TorusGeometry(0.13, 0.04, 6, 10).rotateX(Math.PI / 2), sc, f));
    addGeo("shackle", P.iron, J.chest, putGeo(new THREE.BoxGeometry(0.1, 0.08, 0.16), sc.clone().add(V(0, 0.13, 0)), V(0, 1, 0)));
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      const rad = V(Math.cos(a), Math.sin(a), 0);
      const dir = rad.clone().multiplyScalar(0.9).add(V(0, 0, 0.5)).normalize();
      addGeo(
        "shackleSpikes",
        P.ironDark,
        J.chest,
        putGeo(new THREE.ConeGeometry(0.035, 0.17, 5), sc.clone().addScaledVector(rad, 0.15).addScaledVector(dir, 0.08), dir),
      );
    }
  });

  // ---------------------------------------------------------------- scars
  const wound = (h: any, r: number) => {
    const bn = boneAt(h.at.z);
    addGeo("woundRing" + bn.name, P.bone, bn, putGeo(new THREE.CylinderGeometry(r * 1.3, r * 1.3, 0.03, 8), h.at, h.n, undefined, 0.0));
    addGeo("woundScar" + bn.name, P.scar, bn, putGeo(new THREE.CylinderGeometry(r, r, 0.04, 8), h.at, h.n, undefined, 0.012));
  };
  const scar = (h: any, len: number, diag: THREE.Vector3) => {
    const n: THREE.Vector3 = h.n.clone();
    const tan = diag.clone().addScaledVector(n, -diag.dot(n)).normalize();
    const bn = boneAt(h.at.z);
    addGeo(
      "scarEdge" + bn.name,
      P.bone,
      bn,
      putGeo(new THREE.BoxGeometry(0.17, 0.03, len + 0.1), h.at, n, tan, 0.005),
    );
    addGeo("scarCut" + bn.name, P.scar, bn, putGeo(new THREE.BoxGeometry(0.075, 0.05, len), h.at, n, tan, 0.018));
    for (let i = 0; i < 4; i++) {
      const p = h.at.clone().addScaledVector(tan, (i - 1.5) * (len / 4));
      addGeo("scarEdge" + bn.name, P.bone, bn, putGeo(new THREE.BoxGeometry(0.21, 0.035, 0.03), p, n, tan, 0.03));
    }
  };
  safe(() => {
    [
      [-0.15, 1.0],
      [-0.55, 1.15],
      [-0.95, 0.95],
    ].forEach(([z, len]) => {
      const h = torsoSkin.ray(V(5, 2.4, z), V(-1, 0, 0)) as any;
      if (h) scar(h, len, V(0, 0.55, 1));
    });
    const hr = torsoSkin.ray(V(-5, 2.5, -0.3), V(1, 0, 0)) as any;
    if (hr) {
      scar(hr, 1.4, V(0, -0.5, 1));
      wound(torsoSkin.ray(V(-5, 2.15, -1.2), V(1, 0, 0)) as any, 0.09);
    }
  });

  // ---------------------------------------------------------------- embedded axe in right shoulder
  safe(() => {
    const h0 = bodySkin.ray(V(-6, 3.0, 1.15), V(1, 0, 0)) as any;
    if (!h0) return;
    const hd = h0.n.clone().add(V(0, 0.35, 0.2)).normalize() as THREE.Vector3;
    const fwd = V(0, 0, 1);
    const xv = fwd.clone().addScaledVector(hd, -fwd.dot(hd)).normalize();
    wound(h0, 0.13);
    const E = h0.at.clone().addScaledVector(hd, 0.32);
    b.extrude(
      [
        [-0.08, -0.13],
        [0.08, -0.13],
        [0.32, -0.3],
        [0.4, -0.12, "sharp"],
        [0.33, 0.02, "sharp"],
        [0.42, 0.14, "sharp"],
        [0.32, 0.3],
        [0.08, 0.13],
        [-0.08, 0.13],
      ] as any,
      { at: E, x: xv.toArray(), y: hd.toArray(), thickness: 0.07, bevel: 0.01, color: P.iron, bone: J.chest } as any,
    );
    b.extrude(
      [
        [0.3, -0.27],
        [0.32, -0.3],
        [0.4, -0.12, "sharp"],
        [0.33, 0.02, "sharp"],
        [0.42, 0.14, "sharp"],
        [0.32, 0.3],
        [0.29, 0.26],
        [0.36, 0.13],
        [0.28, 0.02],
        [0.34, -0.12],
      ] as any,
      { at: E, x: xv.toArray(), y: hd.toArray(), thickness: 0.078, color: P.rust, bone: J.chest } as any,
    );
    const top = h0.at.clone().addScaledVector(hd, 0.62);
    b.rod(h0.at.clone().addScaledVector(hd, -0.08), top, 0.045, { color: P.horn, bone: J.chest });
    for (const d of [0.46, 0.52, 0.58])
      addGeo(
        "axeWraps",
        P.leather,
        J.chest,
        putGeo(new THREE.TorusGeometry(0.05, 0.02, 5, 8).rotateX(Math.PI / 2), h0.at.clone().addScaledVector(hd, d), hd),
      );
    addGeo("axeSplinter", P.boneDark, J.chest, putGeo(new THREE.ConeGeometry(0.045, 0.14, 5), top, hd, undefined, 0.05));
  });

  // ---------------------------------------------------------------- snapped spears in left flank
  const spear = (h: any, leather: boolean) => {
    const bn = boneAt(h.at.z);
    const hd = h.n.clone().add(V(0, 0.2, -0.55)).normalize() as THREE.Vector3;
    wound(h, 0.1);
    const L = leather ? 0.95 : 0.75;
    b.rod(h.at.clone().addScaledVector(hd, -0.1), h.at.clone().addScaledVector(hd, L), 0.035, {
      color: leather ? P.leather : P.bone,
      bone: bn,
    });
    addGeo(
      "spearSocket",
      P.iron,
      bn,
      putGeo(new THREE.CylinderGeometry(0.04, 0.075, 0.25, 6), h.at, hd, undefined, 0.08),
    );
    const side = new THREE.Vector3().crossVectors(hd, V(0, 0, 1)).normalize();
    for (const sg of [1, -1]) {
      const dir = hd.clone().multiplyScalar(0.6).addScaledVector(side, sg * 0.8).normalize();
      addGeo(
        "spearBarbs",
        P.iron,
        bn,
        putGeo(new THREE.ConeGeometry(0.035, 0.18, 5), h.at.clone().addScaledVector(hd, 0.04), dir, undefined, 0.09),
      );
    }
    for (const d of [0.3, 0.38, 0.46])
      addGeo(
        "spearWraps",
        leather ? P.bone : P.leather,
        bn,
        putGeo(new THREE.TorusGeometry(0.04, 0.014, 5, 8).rotateX(Math.PI / 2), h.at.clone().addScaledVector(hd, d), hd),
      );
    const end = h.at.clone().addScaledVector(hd, L);
    for (const sg of [1, -1])
      addGeo(
        "spearSplinter",
        P.boneDark,
        bn,
        putGeo(
          new THREE.ConeGeometry(0.03, 0.12, 4),
          end,
          hd.clone().addScaledVector(side, sg * 0.4).normalize(),
          undefined,
          0.05,
        ),
      );
  };
  safe(() => {
    const a = torsoSkin.ray(V(5, 3.0, 0.1), V(-1, 0, 0)) as any;
    if (a) spear(a, true);
    const c = torsoSkin.ray(V(5, 3.05, -1.0), V(-1, 0, 0)) as any;
    if (c) spear(c, false);
  });

  // ---------------------------------------------------------------- iron-bound chest strap
  safe(() => {
    const c0 = V(0, 2.5, 0.75);
    const lp = torsoSkin.loop(c0, { dir: V(0, 0, 1), lift: 0.03 }) as any;
    b.sweep(lp, 0.065, { color: P.leather, bone: J.chest } as any);
    let best = 0;
    let bt = 0;
    for (let i = 0; i < 48; i++) {
      const p = lp.at(i / 48);
      if (p.x > best) {
        best = p.x;
        bt = i / 48;
      }
    }
    for (let i = 0; i < 10; i++) {
      const p = lp.at((i + 0.5) / 10) as THREE.Vector3;
      const out = V(p.x - c0.x, p.y - c0.y, 0).normalize();
      if (Math.abs(((i + 0.5) / 10 - bt + 1) % 1) < 0.07) continue;
      p.addScaledVector(out, 0.05);
      addGeo("strapStuds", P.chain, J.chest, new THREE.SphereGeometry(0.03, 6, 4).translate(p.x, p.y, p.z));
    }
    const bp = lp.at(bt) as THREE.Vector3;
    const out = V(bp.x - c0.x, bp.y - c0.y, 0).normalize();
    addGeo("buckleFrame", P.iron, J.chest, putGeo(new THREE.BoxGeometry(0.24, 0.05, 0.3), bp, out, V(0, 1, 0), 0.04));
    addGeo("buckleTongue", P.ironDark, J.chest, putGeo(new THREE.BoxGeometry(0.06, 0.05, 0.22), bp, out, V(0, 1, 0), 0.075));
  });

  // ---------------------------------------------------------------- front legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = J["shoulderF" + sd];
    const el = J["elbowF" + sd];
    const wr = J["wristF" + sd];
    const hd = J["handF" + sd];
    const hx = hd.at.x as number;
    const path = catmull([sh.at.clone(), el.at.clone(), wr.at.clone(), V(hx, 0.42, 1.85)]);
    const leg = b.sweep(path, [0.5, 0.47, 0.4, 0.32, 0.3], {
      bone: [sh, el, wr],
      color: P.scaleMid,
      bands: [
        [0.86, P.scaleMid],
        [1, P.scaleDark],
      ],
    } as any);
    const legSkin = b.surface(leg);

    // shoulder mass + pauldron plates
    const mc = sh.at.clone().add(V(s * 0.04, 0.1, 0));
    const mass = b.part(new THREE.SphereGeometry(1, 10, 7), P.scaleMid, {
      bone: sh,
      at: mc,
      scale: [0.62, 0.62, 0.66] as any,
      flat: true,
    });
    safe(() => {
      const sk = b.surface(mass);
      [
        [55, 60],
        [85, 38],
        [105, 14],
        [130, -10],
      ].forEach(([az, e], i) => {
        const h = sk.around(mc).at(s * az, e) as any;
        if (!h) return;
        addGeo(
          "pauldron" + sd,
          i % 2 ? P.scaleDark : P.scaleLight,
          sh,
          putGeo(new THREE.BoxGeometry(0.42 - i * 0.03, 0.07, 0.34), h.at, h.n, V(0, -1, 0), 0.01),
        );
      });
    });

    // elbow spur
    const te = path.closestT(el.at);
    safe(() => {
      const hb = legSkin.around(path.at(te)).at(180, 10) as any;
      if (hb) b.spike(hb, hb, 0.38, 0.1, { color: P.bone });
    });

    // armoured forearm shingles + upper arm plates
    safe(() => {
      for (let i = 0; i < 5; i++) {
        const t = te + 0.08 + i * 0.08;
        for (const az of [0, s * 50, s * 100]) {
          const h = legSkin.around(path.at(t)).at(az, 0) as any;
          if (!h) continue;
          addGeo(
            "forearm" + sd + (i % 2),
            i % 2 ? P.scaleDark : P.scaleLight,
            el,
            putGeo(new THREE.BoxGeometry(0.22, 0.05, 0.2), h.at, h.n, V(0, -1, 0), 0.005),
          );
        }
      }
      for (const t of [0.2, 0.3]) {
        const h = legSkin.around(path.at(t)).at(s * 90, 0) as any;
        if (h)
          addGeo(
            "upperArm" + sd,
            P.scaleLight,
            sh,
            putGeo(new THREE.BoxGeometry(0.3, 0.06, 0.24), h.at, h.n, V(0, -1, 0), 0.01),
          );
      }
    });

    // iron-bound leather cuff
    safe(() => {
      const tc = 0.7;
      const lp = legSkin.loop(path.at(tc), { dir: path.tangentAt(tc), lift: 0.02 }) as any;
      b.sweep(lp, 0.055, { color: P.leather } as any);
      const t2 = 0.62;
      const c2 = path.at(t2) as THREE.Vector3;
      const lp2 = legSkin.loop(c2, { dir: path.tangentAt(t2), lift: 0.03 }) as any;
      b.sweep(lp2, 0.03, { color: P.iron } as any);
      for (let i = 0; i < 7; i++) {
        const p = lp2.at((i + 0.5) / 7) as THREE.Vector3;
        const out = p.clone().sub(c2);
        out.addScaledVector(path.tangentAt(t2), -out.dot(path.tangentAt(t2))).normalize();
        p.addScaledVector(out, 0.025);
        addGeo("cuffRivets" + sd, P.chain, el, new THREE.SphereGeometry(0.028, 6, 4).translate(p.x, p.y, p.z));
      }
    });

    // paw
    b.part(new THREE.SphereGeometry(1, 10, 7), P.scaleMid, {
      bone: hd,
      at: V(hx, 0.19, 2.0),
      scale: [0.38, 0.2, 0.42] as any,
      flat: true,
    });
    const offs = [-0.24, -0.08, 0.08, 0.24];
    offs.forEach((o) => {
      const tx = hx + o * 1.14;
      b.capsule(V(hx + o, 0.11, 2.12), V(tx, 0.1, 2.42), [0.095, 0.085], { color: P.scaleDark, bone: hd });
      addGeo(
        "knuckle" + sd,
        P.scaleLight,
        hd,
        putGeo(new THREE.BoxGeometry(0.13, 0.05, 0.14), V(hx + o * 1.05, 0.205, 2.18), V(0, 1, 0), V(0, 0, 1)),
      );
      const dir = V(o * 0.25, -0.28, 1).normalize();
      const base = V(tx, 0.1, 2.46);
      addGeo(
        "claws" + sd,
        P.horn,
        hd,
        putGeo(new THREE.ConeGeometry(0.065, 0.28, 6), base, dir, undefined, 0.14),
      );
      addGeo(
        "clawTips" + sd,
        P.hornTip,
        hd,
        putGeo(new THREE.ConeGeometry(0.034, 0.13, 6), base, dir, undefined, 0.215),
      );
    });
    // rear dew claw
    {
      const dir = V(0, -0.6, -0.8).normalize();
      const base = V(hx, 0.42, 1.6);
      addGeo("claws" + sd, P.horn, hd, putGeo(new THREE.ConeGeometry(0.06, 0.26, 6), base, dir, undefined, 0.13));
      addGeo("clawTips" + sd, P.hornTip, hd, putGeo(new THREE.ConeGeometry(0.031, 0.12, 6), base, dir, undefined, 0.2));
    }
  }

  flush();
}
    return buildTorsoFrontLegs;
  })(),
  // hindquartersTail
  (() => {
type V = THREE.Vector3;
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V3(0, 1, 0);
const toV = (p: any): V =>
  p && p.at ? new THREE.Vector3(p.at.x, p.at.y, p.at.z) : new THREE.Vector3(p.x, p.y, p.z);
const lerpV = (a: V, b: V, t: number) => a.clone().lerp(b, t);
const keyed = (arr: number[], t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (arr.length - 1);
  const i = Math.min(Math.floor(x), arr.length - 2);
  return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};
// component of hint perpendicular to n, unit
const perp = (n: V, hint: V): V => {
  const h = hint.clone().sub(n.clone().multiplyScalar(hint.dot(n)));
  if (h.lengthSq() < 1e-8) {
    h.set(0, 0, 1).sub(n.clone().multiplyScalar(n.z));
    if (h.lengthSq() < 1e-8) h.set(1, 0, 0).sub(n.clone().multiplyScalar(n.x));
  }
  return h.normalize();
};
const basisQ = (x: V, y: V, z: V) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
// local z = n, local y = along (made perpendicular), local x = y cross z
const frameQ = (n: V, along: V) => {
  const nn = n.clone().normalize();
  const a = perp(nn, along);
  const x = new THREE.Vector3().crossVectors(a, nn);
  return basisQ(x, a, nn);
};

function buildHindquartersTail({ b, J, P }: Ctx) {
  const JJ: any = J;
  const PP: any = P;
  const FADED = "#6a4e36";

  // ---------- accumulator: merged parts per bone / colour / glow ----------
  const buckets = new Map<string, { geos: THREE.BufferGeometry[]; color: string; bone: any; glow: number }>();
  const put = (g: THREE.BufferGeometry, color: string, bone: any, gl = 0) => {
    const key = `${bone.name}|${color}|${gl}`;
    let e = buckets.get(key);
    if (!e) {
      e = { geos: [], color, bone, glow: gl };
      buckets.set(key, e);
    }
    e.geos.push(g);
  };

  // local-frame builder: everything is authored in a frame at pos with orientation q
  const mk = (pos: V, q: THREE.Quaternion, bone: any) => {
    const fin = (g: THREE.BufferGeometry, c: string, gl: number) => {
      g.applyQuaternion(q);
      g.translate(pos.x, pos.y, pos.z);
      put(g, c, bone, gl);
    };
    return {
      box(o: number[], s: number[], c: string, rz = 0, gl = 0) {
        const g = new THREE.BoxGeometry(s[0], s[1], s[2]);
        if (rz) g.rotateZ(rz);
        g.translate(o[0], o[1], o[2]);
        fin(g, c, gl);
      },
      cyl(o: number[], r0: number, r1: number, len: number, c: string, sides = 6, gl = 0) {
        const g = new THREE.CylinderGeometry(r1, r0, len, sides);
        g.translate(o[0], o[1], o[2]);
        fin(g, c, gl);
      },
      cone(o: number[], r: number, len: number, c: string, sides = 5, gl = 0, sx = 1, sz = 1) {
        const g = new THREE.ConeGeometry(r, len, sides);
        g.scale(sx, 1, sz);
        g.translate(o[0], o[1] + len / 2, o[2]);
        fin(g, c, gl);
      },
      sph(o: number[], r: number[], c: string, gl = 0, w = 7, h = 5) {
        const g = new THREE.SphereGeometry(1, w, h);
        g.scale(r[0], r[1], r[2]);
        g.translate(o[0], o[1], o[2]);
        fin(g, c, gl);
      },
      tor(o: number[], R: number, tube: number, c: string, sz = 1, gl = 0, rs = 5, ts = 12) {
        const g = new THREE.TorusGeometry(R, tube, rs, ts);
        g.scale(1, 1, sz);
        g.translate(o[0], o[1], o[2]);
        fin(g, c, gl);
      },
    };
  };
  const ID = () => new THREE.Quaternion();
  const qDir = (d: V, up?: V) => (up ? aim(d, up) : aim(d));
  const qZ = (d: V) => aim(d, undefined as any, "z");
  const rod = (a: V, c: V, r0: number, r1: number, col: string, bone: any, sides = 6) => {
    const d = c.clone().sub(a);
    const L = d.length();
    mk(a, qDir(d.clone().normalize()), bone).cyl([0, L / 2, 0], r0, r1, L, col, sides);
  };
  const spikeW = (base: V, dir: V, len: number, r: number, col: string, bone: any, sides = 5) =>
    mk(base, qDir(dir.clone().normalize()), bone).cone([0, 0, 0], r, len, col, sides);
  const claw = (tip: V, dir: V, bone: any, big = 1) => {
    const d = dir.clone().normalize();
    spikeW(tip, d, 0.2 * big, 0.08 * big, PP.horn, bone, 5);
    spikeW(tip.clone().addScaledVector(d, 0.09 * big), d, 0.13 * big, 0.05 * big, PP.hornTip, bone, 5);
  };

  // ======================= TAIL =======================
  const tailPath = catmull([
    V3(0, 2.12, -2.2),
    V3(0, 1.7, -3.6),
    V3(0, 1.3, -4.7),
    V3(0, 0.8, -5.7),
    V3(0, 0.45, -6.2),
    V3(0, 0.18, -6.4),
  ]);
  const tr = (t: number) => 0.15 + 0.45 * Math.pow(1 - t, 1.35);
  const tailJ = [JJ.tail1, JJ.tail2, JJ.tail3, JJ.tail4, JJ.tail5];
  const cuts = [JJ.tail2, JJ.tail3, JJ.tail4, JJ.tail5].map((j: any) => tailPath.closestT(j.at));
  const tbone = (t: number) => {
    let i = 0;
    while (i < 4 && t >= cuts[i]) i++;
    return tailJ[i];
  };
  const tail = b.sweep(tailPath, (t: number) => tr(t), {
    bone: tailJ,
    color: PP.scaleMid,
    sectors: [
      [-65, 65, PP.scaleDark],
      [125, 235, PP.bellyDark],
    ],
    caps: "round",
  } as any);
  const S_ = (t: number, a: number, lift = 0) => {
    const p: any = tail.at(t, a, lift);
    return {
      pos: toV(p),
      n: new THREE.Vector3(p.n.x, p.n.y, p.n.z).normalize(),
      T: new THREE.Vector3(p.tangent.x, p.tangent.y, p.tangent.z).normalize(),
    };
  };

  // dorsal bone ridge, 14 plates shrinking
  for (let i = 0; i < 14; i++) {
    const t = 0.03 + (0.9 * i) / 13;
    const sc = 1 - 0.62 * (i / 13);
    const p = S_(t, 0);
    const bone = tbone(t);
    const w = 0.17 * sc;
    const h = 0.44 * sc;
    const dir = p.n.clone().add(p.T.clone().multiplyScalar(0.55)).normalize();
    mk(p.pos, qDir(dir, p.T), bone).cone([0, -0.04, 0], w, h, PP.bone, 4, 0, 0.42, 1);
    mk(p.pos, qDir(p.n), bone).cyl([0, 0.01, 0], w * 1.45, w * 1.2, 0.1, PP.boneDark, 6);
  }
  // scaleLight shingles on the lower flanks
  for (let i = 0; i < 14; i++) {
    const t = 0.05 + (0.88 * i) / 13;
    for (const a of [118, -118]) {
      const p = S_(t, a);
      mk(p.pos, frameQ(p.n, p.T), tbone(t)).box([0, 0, 0.01], [Math.min(0.3, tr(t) * 0.7), 0.2, 0.05], PP.scaleLight);
    }
  }

  // spiked war-collars
  const tailRing = (t: number, nSp: number) => {
    const c = toV(tailPath.at(t));
    const T = toV(tailPath.tangentAt(t)).normalize();
    const u = perp(T, UP);
    const v = new THREE.Vector3().crossVectors(T, u);
    const r = tr(t);
    const R = r * 1.13;
    const bone = tbone(t);
    mk(c, qZ(T), bone).tor([0, 0, 0], R, 0.045 + 0.06 * r, PP.iron, 1.9, 0, 5, 14);
    for (let k = 0; k < nSp; k++) {
      const th = (k * Math.PI * 2) / nSp + 0.3;
      const rad = u.clone().multiplyScalar(Math.cos(th)).add(v.clone().multiplyScalar(Math.sin(th)));
      const base = c.clone().addScaledVector(rad, R + 0.04);
      const dir = rad.clone().add(T.clone().multiplyScalar(0.45)).normalize();
      const len = 0.16 + 0.45 * r;
      const rr = 0.05 + 0.1 * r;
      if (base.clone().addScaledVector(dir, len).y < 0.04) continue;
      spikeW(base, dir, len, rr, PP.iron, bone, 5);
      mk(base.clone().addScaledVector(rad, -0.02), qDir(rad), bone).cyl([0, 0, 0], rr * 1.6, rr * 1.4, 0.06, PP.ironDark, 6);
    }
  };
  for (const t of [0.26, 0.41, 0.56, 0.71, 0.86]) tailRing(t, 7);
  tailRing(0.95, 0);

  // ember runes on the left flank
  const GLYPHS = [
    [[0, -0.5, 0, 0.5], [0, 0.5, 0.38, 0.2], [0, 0.12, 0.38, -0.18]],
    [[-0.2, -0.5, -0.2, 0.5], [-0.2, 0.32, 0.3, 0.02], [0.3, 0.02, -0.2, -0.28]],
    [[-0.28, 0.5, 0.25, 0.12], [0.25, 0.12, -0.25, -0.12], [-0.25, -0.12, 0.28, -0.5]],
  ];
  const rune = (pos: V, n: V, size: number, glyph: number[][], bone: any) => {
    const L = mk(pos, frameQ(n, UP), bone);
    L.box([0, 0, -0.01], [size * 1.0, size * 1.35, 0.06], PP.ironDark);
    const th = size * 0.14;
    for (const [a0, b0, a1, b1] of glyph) {
      const ca = ((a0 + a1) / 2) * size;
      const cb = ((b0 + b1) / 2) * size;
      const len = Math.hypot(a1 - a0, b1 - b0) * size;
      const ang = Math.atan2(b1 - b0, a1 - a0);
      L.box([ca, cb, 0.022], [len + th * 0.8, th, 0.03], PP.ember, ang, 1.4);
      L.box([ca, cb, 0.04], [len, th * 0.4, 0.012], PP.emberHot, ang, 1.7);
    }
  };
  [0.335, 0.485, 0.635].forEach((t, i) => {
    const p = S_(t, 85);
    rune(p.pos, p.n, Math.min(0.26, tr(t) * 0.65), GLYPHS[i], tbone(t));
  });

  // scars with pale ridges and stitches
  const scar = (pos: V, n: V, len: number, angDeg: number, bone: any) => {
    const L = mk(pos, frameQ(n, UP), bone);
    const a = (angDeg * Math.PI) / 180;
    const d = [Math.cos(a), Math.sin(a)];
    const pr = [-Math.sin(a), Math.cos(a)];
    L.box([0, 0, 0.006], [len, 0.05, 0.03], PP.scar, a);
    for (const sg of [-1, 1])
      L.box([pr[0] * 0.04 * sg, pr[1] * 0.04 * sg, 0.006], [len * 1.04, 0.014, 0.036], PP.bone, a);
    for (let k = -2; k <= 2; k++)
      L.box([d[0] * k * len * 0.2, d[1] * k * len * 0.2, 0.008], [0.012, 0.13, 0.04], PP.bone, a);
  };
  {
    let p = S_(0.22, -70);
    scar(p.pos, p.n, 0.5, 40, tbone(0.22));
    p = S_(0.665, -88);
    scar(p.pos, p.n, 0.4, -35, tbone(0.665));
    p = S_(0.45, 125);
    scar(p.pos, p.n, 0.45, 30, tbone(0.45));
  }

  // dark crescent wound on the rump, pale edges
  {
    const p = S_(0.07, 70);
    const L = mk(p.pos, frameQ(p.n, UP), tbone(0.07));
    const N = 9;
    for (let k = 0; k < N; k++) {
      const f = k / (N - 1);
      const phi = ((60 + 240 * f) * Math.PI) / 180;
      const w = 0.015 + 0.06 * Math.sin(Math.PI * f);
      const R0 = 0.2;
      L.box([Math.cos(phi) * R0, Math.sin(phi) * R0, 0.006], [0.13, w, 0.03], PP.scar, phi + Math.PI / 2);
      const Ro = R0 + w / 2 + 0.012;
      L.box([Math.cos(phi) * Ro, Math.sin(phi) * Ro, 0.006], [0.14, 0.014, 0.038], PP.bone, phi + Math.PI / 2);
    }
  }

  // faded leather harness strap around the tail base with hanging tail
  {
    const t = 0.15;
    const c = toV(tailPath.at(t));
    const T = toV(tailPath.tangentAt(t)).normalize();
    const u = perp(T, UP);
    const v = new THREE.Vector3().crossVectors(T, u);
    const r = tr(t);
    const R = r * 1.1;
    const bone = tbone(t);
    mk(c, qZ(T), bone).tor([0, 0, 0], R, 0.05, FADED, 2.4, 0, 5, 14);
    const radAt = (deg: number) => {
      const th = (deg * Math.PI) / 180;
      return u.clone().multiplyScalar(Math.cos(th)).add(v.clone().multiplyScalar(Math.sin(th)));
    };
    const rb = radAt(-60);
    mk(c.clone().addScaledVector(rb, R + 0.05), frameQ(rb, T), bone).box([0, 0, 0], [0.13, 0.16, 0.06], PP.iron);
    mk(c.clone().addScaledVector(rb, R + 0.085), frameQ(rb, T), bone).box([0, 0, 0], [0.04, 0.1, 0.03], PP.ironDark);
    for (const dg of [-35, -85, 20, 40]) {
      const rd = radAt(dg);
      const q = mk(c.clone().addScaledVector(rd, R + 0.06), ID(), bone);
      q.sph([0, 0, 0], [0.022, 0.022, 0.022], PP.chain, 0, 5, 4);
    }
    const rh = radAt(-100);
    const hp = c.clone().addScaledVector(rh, R + 0.05);
    mk(hp.clone().add(V3(0, -0.28, 0)), frameQ(rh, V3(0, -1, 0)), bone).box([0, 0, 0], [0.1, 0.56, 0.03], FADED);
    mk(hp.clone().add(V3(0, -0.58, 0)), frameQ(rh, V3(0, -1, 0)), bone).box([0, 0, 0], [0.13, 0.1, 0.04], PP.iron);
    mk(hp.clone().add(V3(0, -0.2, 0.0)), frameQ(rh, V3(0, -1, 0)), bone).box([0, 0, 0.02], [0.012, 0.3, 0.012], PP.leather);
  }

  // embedded rusted axe in the right flank
  {
    const t = 0.485;
    const p = S_(t, -80);
    const h = p.n.clone().add(V3(0, 0.6, 0)).add(p.T.clone().multiplyScalar(0.2)).normalize();
    const lat = new THREE.Vector3().crossVectors(p.T, h).normalize();
    const L = mk(p.pos, frameQ(lat, h), tbone(t));
    L.cyl([0, 0.3, 0], 0.045, 0.04, 0.8, PP.leather, 6);
    L.box([0, 0.12, 0], [0.42, 0.24, 0.07], PP.iron);
    L.box([0.21, 0.12, 0], [0.06, 0.27, 0.078], PP.rust);
    L.box([-0.2, 0.12, 0], [0.1, 0.2, 0.09], PP.ironDark);
    L.cyl([0, 0.5, 0], 0.055, 0.055, 0.07, PP.rust, 6);
    L.cyl([0, 0.38, 0], 0.055, 0.055, 0.07, PP.rust, 6);
    L.cone([0, 0.68, 0], 0.045, 0.12, PP.bone, 3);
  }

  // broken sword stubs
  const sword = (pos: V, dir: V, T: V, bone: any) => {
    const d = dir.clone().normalize();
    const lat = new THREE.Vector3().crossVectors(T, d).normalize();
    const L = mk(pos, frameQ(lat, d), bone);
    L.box([0, 0.22, 0], [0.13, 0.5, 0.025], PP.iron);
    L.box([0, 0.22, 0.014], [0.03, 0.44, 0.01], PP.ironDark);
    L.box([0.066, 0.22, 0], [0.014, 0.5, 0.03], PP.chain);
    L.box([-0.066, 0.22, 0], [0.014, 0.5, 0.03], PP.chain);
    L.cone([0, 0.47, 0], 0.075, 0.13, PP.iron, 3, 0, 1, 0.3);
    L.box([0.04, 0.4, 0], [0.03, 0.05, 0.03], PP.rust, 0.5);
  };
  {
    let p = S_(0.6, -42);
    sword(p.pos, p.n.clone().add(V3(0, 0.5, 0)), p.T, tbone(0.6));
    p = S_(0.78, 40);
    sword(p.pos, p.n.clone().add(V3(0, 0.35, 0.2)), p.T, tbone(0.78));
  }

  // tail-tip blade: bone and iron
  {
    const bladeAt = V3(0, 0.18, -6.4);
    const leaf: any[] = [
      [-0.04, 0.03], [0.02, -0.12], [0.12, -0.2], [0.26, -0.18], [0.35, -0.07],
      [0.4, 0.17, "sharp"], [0.35, 0.41], [0.26, 0.52], [0.12, 0.54], [0.02, 0.46], [-0.04, 0.31],
    ];
    b.extrude(leaf, { at: bladeAt, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.07, bevel: 0.01, color: PP.iron, bone: JJ.tail5 } as any);
    const inner = leaf.map(([u, v, s]: any) => (s ? [0.15 + (u - 0.15) * 0.72, 0.17 + (v - 0.17) * 0.72, s] : [0.15 + (u - 0.15) * 0.72, 0.17 + (v - 0.17) * 0.72]));
    b.extrude(inner as any, { at: bladeAt, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.11, bevel: 0.012, color: PP.bone, bone: JJ.tail5 } as any);
    b.extrude(
      [[0, 0], [0.12, 0.02], [0.07, -0.07]] as any,
      { at: V3(0, 0.18 + 0.47, -6.4 - 0.14), x: [0, 0, -1], y: [0, 1, 0], thickness: 0.08, color: PP.rust, bone: JJ.tail5 } as any,
    );
    const Lb = mk(V3(0, 0.18, -6.4), ID(), JJ.tail5);
    Lb.box([0, 0.17, -0.2], [0.135, 0.035, 0.32], PP.boneDark);
    for (const sx of [-1, 1])
      for (const y of [0.05, 0.3]) Lb.sph([sx * 0.062, y, -0.1], [0.025, 0.025, 0.025], PP.chain, 0, 5, 4);
    for (const sx of [-1, 1]) {
      const dir = V3(sx, 0.15, -0.7).normalize();
      const base = V3(sx * 0.1, 0.2, -6.42);
      spikeW(base, dir, 0.38, 0.09, PP.bone, JJ.tail5, 5);
      spikeW(base.clone().addScaledVector(dir, 0.22), dir, 0.2, 0.06, PP.iron, JJ.tail5, 5);
    }
  }

  // ======================= REAR LEGS =======================
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = JJ["hipB" + S], knee = JJ["kneeB" + S], hock = JJ["hockB" + S], foot = JJ["footB" + S];
    const pA = V3(1.1 * s, 2.38, -1.85);
    const pK = V3(1.45 * s, 1.3, -0.8);
    const pO = V3(1.4 * s, 0.8, -1.9);
    const pF = V3(1.4 * s, 0.2, -1.4);

    // thigh
    const thR = [0.6, 0.64, 0.5, 0.38];
    b.sweep(polyline([pA, pK]), thR, { bone: hip, color: PP.scaleMid, caps: "round" } as any);
    const dT = pK.clone().sub(pA).normalize();
    const fT = perp(dT, V3(0, 0, 1));
    const ptT = (t: number) => lerpV(pA, pK, t);
    mk(ptT(0.12).add(V3(s * 0.3, 0.15, -0.05)), ID(), hip).sph([0, 0, 0], [0.4, 0.5, 0.46], PP.scaleMid);
    mk(ptT(0.75).add(V3(-s * 0.4, -0.02, 0)), ID(), hip).sph([0, 0, 0], [0.13, 0.3, 0.24], PP.bellyDark);
    for (const t of [0.3, 0.5, 0.7]) {
      const pos = ptT(t).addScaledVector(fT, keyed(thR, t) * 0.92).add(V3(s * 0.04, 0, 0));
      const L = mk(pos, frameQ(fT, dT), hip);
      L.box([0, 0, -0.005], [0.58, 0.36, 0.06], PP.scaleDark);
      L.box([0, 0, 0.01], [0.5, 0.3, 0.07], PP.scaleLight);
    }

    // knee
    const Lk = mk(pK, ID(), knee);
    Lk.sph([0, 0, 0], [0.4, 0.38, 0.4], PP.scaleMid);
    mk(pK.clone().add(V3(0, 0.05, 0.3)), qDir(V3(0, 0.15, 1)), knee).cone([0, 0, 0], 0.13, 0.32, PP.bone, 5);
    mk(pK.clone().add(V3(0, 0.05, 0.28)), qDir(V3(0, 0.15, 1)), knee).cyl([0, 0, 0], 0.19, 0.17, 0.08, PP.boneDark, 6);
    for (const dx of [-1, 1]) {
      mk(pK.clone().add(V3(dx * 0.28, 0.12, 0.12)), frameQ(V3(dx, 0.3, 0.3), V3(0, 1, 0)), knee).box([0, 0, 0], [0.2, 0.22, 0.07], PP.scaleLight);
    }

    // shin
    const shR = [0.34, 0.28, 0.2];
    b.sweep(polyline([pK, pO]), shR, { bone: knee, color: PP.scaleMid, caps: "round" } as any);
    const dS = pO.clone().sub(pK).normalize();
    const uS = perp(dS, UP);
    for (const t of [0.3, 0.72]) {
      const pos = lerpV(pK, pO, t).addScaledVector(uS, keyed(shR, t) * 0.95);
      const L = mk(pos, frameQ(uS, dS), knee);
      L.box([0, 0, -0.005], [0.34, 0.34, 0.06], PP.scaleDark);
      L.box([0, 0, 0.01], [0.28, 0.28, 0.07], PP.scaleLight);
    }
    // iron-bound strap on the shin with 4 rivets
    {
      const c = lerpV(pK, pO, 0.5);
      const rr = keyed(shR, 0.5);
      const R = rr * 1.1 + 0.02;
      mk(c, qZ(dS), knee).tor([0, 0, 0], R, 0.05, PP.leather, 2.2, 0, 5, 12);
      for (const o of [-0.08, 0.08]) mk(c.clone().addScaledVector(dS, o), qZ(dS), knee).tor([0, 0, 0], R + 0.01, 0.02, PP.iron, 1, 0, 4, 12);
      const out = perp(dS, V3(s, 0, 0));
      const w2 = new THREE.Vector3().crossVectors(dS, out);
      mk(c.clone().addScaledVector(out, R + 0.05), frameQ(out, dS), knee).box([0, 0, 0], [0.12, 0.14, 0.06], PP.iron);
      mk(c.clone().addScaledVector(out, R + 0.085), frameQ(out, dS), knee).box([0, 0, 0], [0.04, 0.09, 0.03], PP.ironDark);
      for (const dg of [-80, -40, 40, 80]) {
        const a = (dg * Math.PI) / 180;
        const rad = out.clone().multiplyScalar(Math.cos(a)).add(w2.clone().multiplyScalar(Math.sin(a)));
        mk(c.clone().addScaledVector(rad, R + 0.05), ID(), knee).sph([0, 0, 0], [0.025, 0.025, 0.025], PP.chain, 0, 5, 4);
      }
    }

    // hock + spur
    mk(pO, ID(), hock).sph([0, 0, 0], [0.26, 0.26, 0.28], PP.scaleMid);
    const spurBase = pO.clone().add(V3(0, 0.03, -0.2));
    mk(spurBase, qDir(V3(0, 0.3, -1)), hock).cone([0, 0, 0], 0.12, 0.55, PP.bone, 5);
    mk(spurBase, qDir(V3(0, 0.3, -1)), hock).cyl([0, 0.04, 0], 0.17, 0.16, 0.1, PP.boneDark, 6);
    mk(pO.clone().add(V3(0, 0.2, 0.08)), frameQ(V3(0, 0.6, 1), UP), hock).box([0, 0, 0], [0.26, 0.2, 0.06], PP.scaleLight);

    // metatarsus
    b.sweep(polyline([pO, pF]), [0.22, 0.19, 0.18], { bone: hock, color: PP.scaleMid, caps: "round" } as any);
    const dM = pF.clone().sub(pO).normalize();
    const oM = perp(dM, V3(s, 0, 0));
    for (const t of [0.3, 0.55, 0.8]) {
      const pos = lerpV(pO, pF, t).addScaledVector(oM, 0.185);
      mk(pos, frameQ(oM, dM), hock).box([0, 0, 0], [0.08, 0.3, 0.03], PP.scaleDark);
    }

    // foot: pad, three toes + rear toe, claws, mud
    const LF = mk(V3(1.4 * s, 0.19, -1.28), ID(), foot);
    LF.sph([0, 0, 0], [0.31, 0.19, 0.38], PP.scaleMid, 0, 8, 5);
    for (const off of [-0.2, 0, 0.2]) {
      const base = V3(1.4 * s + off, 0.13, -1.18);
      const tip = V3(1.4 * s + off * 1.5, 0.11, off === 0 ? -0.62 : -0.7);
      rod(base, tip, 0.11, 0.09, PP.scaleMid, foot, 6);
      mk(base, ID(), foot).sph([0, 0, 0], [0.12, 0.11, 0.12], PP.scaleMid, 0, 6, 4);
      const dT2 = tip.clone().sub(base).normalize();
      for (const t of [0.35, 0.7]) {
        mk(lerpV(base, tip, t).add(V3(0, 0.085, 0)), frameQ(UP, dT2), foot).box([0, 0, 0], [0.13, 0.14, 0.035], PP.scaleLight);
      }
      claw(tip.clone().addScaledVector(dT2, 0.02), V3(off * 0.5, -0.28, 1), foot);
    }
    {
      const base = V3(1.4 * s, 0.13, -1.5);
      const tip = V3(1.4 * s, 0.11, -1.8);
      rod(base, tip, 0.09, 0.08, PP.scaleMid, foot, 6);
      claw(tip, V3(0, -0.25, -1), foot, 0.8);
    }
    for (const [dx, dz, rx] of [[-0.24, -1.1, 0.1], [0.2, -1.4, 0.09], [0.0, -0.95, 0.1], [-0.15, -1.62, 0.08]]) {
      mk(V3(1.4 * s + dx * s, 0.06, dz), ID(), foot).sph([0, 0, 0], [rx, 0.06, rx * 1.2], PP.scaleDark, 0, 6, 4);
    }

    // chain-wrapped broken spear in the left thigh
    if (s > 0) {
      const pos0 = V3(1.74, 2.0, -1.43);
      const dS2 = V3(0.45, 0.75, -0.5).normalize();
      const L = mk(pos0, qDir(dS2), hip);
      L.cyl([0, 0.26, 0], 0.04, 0.038, 0.8, PP.leather, 6);
      L.cyl([0, 0.06, 0], 0.056, 0.056, 0.07, PP.bone, 6);
      L.cyl([0, 0.5, 0], 0.052, 0.052, 0.06, PP.bone, 6);
      L.cone([0, 0.64, 0], 0.045, 0.16, PP.bone, 3);
      L.cone([0.015, 0.62, 0.01], 0.028, 0.22, PP.boneDark, 3);
      const u = perp(dS2, UP);
      const v = new THREE.Vector3().crossVectors(dS2, u);
      let last = pos0.clone();
      for (let i = 0; i < 11; i++) {
        const th = i * 1.1;
        const rad = u.clone().multiplyScalar(Math.cos(th)).add(v.clone().multiplyScalar(Math.sin(th)));
        const tan = dS2.clone().multiplyScalar(0.5).add(u.clone().multiplyScalar(-Math.sin(th))).add(v.clone().multiplyScalar(Math.cos(th))).normalize();
        const pos = pos0.clone().addScaledVector(dS2, 0.12 + i * 0.045).addScaledVector(rad, 0.058);
        const axis = i % 2 === 0 ? rad : new THREE.Vector3().crossVectors(rad, tan).normalize();
        mk(pos, qZ(axis), hip).tor([0, 0, 0], 0.04, 0.012, PP.chain, 1, 0, 4, 8);
        last = pos;
      }
      for (let k = 1; k <= 4; k++) {
        const pos = last.clone().add(V3(0.02, -0.062 * k, 0.02));
        mk(pos, qZ(k % 2 ? V3(1, 0, 0) : V3(0, 0, 1)), hip).tor([0, 0, 0], 0.036, 0.011, PP.chain, 1, 0, 4, 8);
      }
    }
  }

  // ---------- flush merged parts ----------
  for (const e of buckets.values()) {
    const merged = mergeGeometries(e.geos, false);
    if (!merged) continue;
    const part = b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], flat: true } as any);
    if (e.glow > 0) glow(part, e.glow);
  }
}
    return buildHindquartersTail;
  })(),
  // headCenter
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };
type N3 = number[];
type Space = { o: THREE.Vector3; q: THREE.Quaternion };

function buildHeadCenter({ b, J, P, M }: Ctx) {
  const DEG = Math.PI / 180;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const rnd = rng(1105);
  const TONGUE = "#a8403e";
  const THROAT = "#3a1214";
  const head = J.headC;
  const jaw = J.jawC;

  // ---------- spaces ----------
  const space = (o: N3, pitchDeg: number): Space => ({
    o: V(o[0], o[1], o[2]),
    q: new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), pitchDeg * DEG),
  });
  const W: Space = { o: V(), q: new THREE.Quaternion() };
  const H = space(M.skullC, 8.53); // head frame, pitched slightly down
  const JS = space(M.jawHingeC, 16.5); // jaw frame: head pitch + ~8 deg rest opening
  const P3 = (S: Space, p: N3) => V(p[0], p[1], p[2]).applyQuaternion(S.q).add(S.o);
  const D3 = (S: Space, d: N3) => V(d[0], d[1], d[2]).applyQuaternion(S.q);
  const qE = (rx = 0, ry = 0, rz = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rx * DEG, ry * DEG, rz * DEG));

  // ---------- merged accumulator: one part per bone / colour / glow ----------
  const buckets = new Map<string, { geos: THREE.BufferGeometry[]; color: string; bone: any; glow: number }>();
  const emit = (geo: THREE.BufferGeometry, color: string, bone: any, pos: THREE.Vector3, quat: THREE.Quaternion, g = 0) => {
    const key = `${bone.name}|${color}|${g}`;
    let e = buckets.get(key);
    if (!e) {
      e = { geos: [], color, bone, glow: g };
      buckets.set(key, e);
    }
    const c = geo.clone();
    c.applyMatrix4(new THREE.Matrix4().compose(pos, quat, V(1, 1, 1)));
    e.geos.push(c);
  };
  const put = (S: Space, geo: THREE.BufferGeometry, color: string, bone: any, c: N3,
    o: { rot?: N3; q?: THREE.Quaternion; glow?: number } = {}) => {
    const lq = o.q ?? (o.rot ? qE(o.rot[0], o.rot[1], o.rot[2]) : new THREE.Quaternion());
    emit(geo, color, bone, P3(S, c), S.q.clone().multiply(lq), o.glow ?? 0);
  };
  const box = (w: number, h: number, l: number) => new THREE.BoxGeometry(w, h, l);
  const tb = (w0: number, h0: number, w1: number, h1: number, len: number) => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const f = p.getZ(i) > 0;
      p.setXYZ(i, p.getX(i) * (f ? w1 : w0), p.getY(i) * (f ? h1 : h0), p.getZ(i) * len);
    }
    g.computeVertexNormals();
    return g;
  };
  const seg = (S: Space, a: N3, c: N3, w: number, h: number, color: string, bone: any, o: { up?: N3; glow?: number } = {}) => {
    const A = V(a[0], a[1], a[2]);
    const B = V(c[0], c[1], c[2]);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const mid = A.clone().add(B).multiplyScalar(0.5);
    const lq = aim(dir.normalize(), o.up ?? [0, 1, 0], "z");
    emit(box(w, h, len), color, bone, P3(S, [mid.x, mid.y, mid.z]), S.q.clone().multiply(lq), o.glow ?? 0);
  };
  const spk = (S: Space, base: N3, dir: N3, len: number, r: number, color: string, bone: any, sides = 5, g = 0) => {
    const d = V(dir[0], dir[1], dir[2]).normalize();
    put(S, new THREE.ConeGeometry(r, len, sides), color, bone,
      [base[0] + (d.x * len) / 2, base[1] + (d.y * len) / 2, base[2] + (d.z * len) / 2], { q: aim(d), glow: g });
  };
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const torus = (R: number, t: number, rs = 5, ts = 10) => new THREE.TorusGeometry(R, t, rs, ts);

  // ================= NECK =================
  const rAt = (t: number) => 0.5 - 0.14 * t;
  const neckPath = catmull([J.neckC1.at, J.neckC2.at, J.neckC3.at, J.headC.at]);
  const neck = b.sweep(neckPath, (t: number) => rAt(t), {
    bone: [J.neckC1, J.neckC2, J.neckC3, J.headC],
    color: P.scaleMid,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
    sectors: [
      [-60, 60, P.scaleDark],
      [125, 235, P.bellyDark],
    ],
  });
  const nb = (t: number) => (t < 0.31 ? J.neckC1 : t < 0.66 ? J.neckC2 : J.neckC3);
  const surfPut = (f: any, geo: THREE.BufferGeometry, color: string, bone: any, off: number, lq?: THREE.Quaternion, g = 0) => {
    const n = V().copy(f.n);
    const pos = V().copy(f.at).addScaledVector(n, off);
    const q = new THREE.Quaternion().copy(f.quat);
    if (lq) q.multiply(lq);
    emit(geo, color, bone, pos, q, g);
  };

  // scale plates on the flanks
  for (let i = 0; i < 12; i++) {
    const t = 0.07 + 0.075 * i;
    for (const s of [1, -1]) {
      const f = neck.at(t, s * (50 + (i % 2) * 14));
      surfPut(f, box(0.15, 0.05, 0.2), P.scaleLight, nb(t), 0.012, qE(0, s * 25, 0));
    }
  }
  // ventral throat plates
  for (let i = 0; i < 8; i++) {
    const t = 0.1 + i * 0.1;
    const f = neck.at(t, 180);
    const w = rAt(t) * 0.85;
    surfPut(f, box(w + 0.05, 0.04, 0.29), P.boneDark, nb(t), 0.008);
    surfPut(f, box(w, 0.08, 0.24), P.bone, nb(t), 0.022);
  }
  // dorsal spikes
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.105;
    const f = neck.at(t, 0);
    const k = 1 - 0.55 * (i / 8);
    const len = 0.4 * k;
    const r = 0.075 * k;
    const n = V().copy(f.n);
    const dir = n.clone().addScaledVector(V().copy(f.tangent), -0.5).normalize();
    const base = V().copy(f.at).addScaledVector(n, -0.03);
    emit(new THREE.ConeGeometry(r, len, 5), P.bone, nb(t),
      base.clone().addScaledVector(dir, len / 2), aim(dir));
    surfPut(f, new THREE.CylinderGeometry(r * 1.5, r * 1.7, 0.06, 6), P.boneDark, nb(t), 0.0);
  }

  // leather-and-iron collar
  {
    const tc = 0.51;
    const pc = V().copy(neckPath.at(tc));
    const tanc = V().copy(neckPath.tangentAt(tc)).normalize();
    const Rc = rAt(tc) * 1.08 + 0.03;
    const qT = aim(tanc, undefined, "z");
    emit(torus(Rc, 0.07, 5, 12), P.leather, J.neckC2, pc, qT);
    for (const d of [-0.12, 0.12])
      emit(torus(Rc + 0.01, 0.032, 5, 12), P.iron, J.neckC2, pc.clone().addScaledVector(tanc, d), qT);
    const fc = neck.at(tc, 180);
    const nF = V().copy(fc.n);
    const vv = tanc.clone().cross(nF).normalize();
    for (let k = 0; k < 12; k++) {
      const a = k * 30 * DEG;
      const dir = nF.clone().multiplyScalar(Math.cos(a)).addScaledVector(vv, Math.sin(a));
      emit(sph(0.03, 6, 4), P.chain, J.neckC2, pc.clone().addScaledVector(dir, Rc + 0.07), new THREE.Quaternion());
    }
    // buckle and strap tail
    emit(box(0.17, 0.05, 0.16), P.iron, J.neckC2, pc.clone().addScaledVector(nF, Rc + 0.08), new THREE.Quaternion().copy(fc.quat));
    emit(box(0.09, 0.02, 0.1), P.ironDark, J.neckC2, pc.clone().addScaledVector(nF, Rc + 0.115), new THREE.Quaternion().copy(fc.quat));
    emit(box(0.07, 0.03, 0.34), P.leather, J.neckC2,
      pc.clone().addScaledVector(nF, Rc + 0.1).addScaledVector(tanc, -0.22), new THREE.Quaternion().copy(fc.quat));
    emit(box(0.08, 0.035, 0.05), P.iron, J.neckC2,
      pc.clone().addScaledVector(nF, Rc + 0.105).addScaledVector(tanc, -0.4), new THREE.Quaternion().copy(fc.quat));
  }

  // ember runes down each side of the neck
  const GLYPHS: number[][][] = [
    [[0, -1, 0, 1], [0, 0.3, 0.6, 0.9], [0, -0.3, 0.6, 0.3]],
    [[0, -1, 0, 1], [0, 0.9, 0.55, 0.45], [0.55, 0.45, 0, 0]],
    [[0, -1, 0, 1], [0, 0, -0.6, 0.8], [0, 0, 0.6, 0.8]],
    [[-0.5, -1, -0.5, 1], [-0.5, 1, 0.5, 0.4], [0.5, 0.4, 0.5, -1]],
    [[0, -1, 0, 1], [0, 1, 0.6, 0.5], [0, 0.4, 0.6, -0.1]],
    [[0, -1, 0, 1], [0, 1, -0.5, 0.4], [0, 1, 0.5, 0.4]],
  ];
  const SA = 0.06;
  const SB = 0.085;
  const rune = (f: any, g: number[][], bone: any) => {
    const n = [f.n.x, f.n.y, f.n.z];
    surfPut(f, box(SA * 2 + 0.1, 0.03, SB * 2 + 0.1), P.scaleDark, bone, 0.004);
    for (const [a0, b0, a1, b1] of g) {
      const p0 = f.local([a0 * SA, 0.012, b0 * SB]);
      const p1 = f.local([a1 * SA, 0.012, b1 * SB]);
      seg(W, [p0.x, p0.y, p0.z], [p1.x, p1.y, p1.z], 0.022, 0.028, P.ember, bone, { up: n, glow: 1.5 });
    }
  };
  [0.14, 0.26, 0.38, 0.66, 0.78].forEach((t, i) => {
    for (const s of [1, -1]) rune(neck.at(t, s * 90), GLYPHS[(i + (s > 0 ? 0 : 3)) % GLYPHS.length], nb(t));
  });

  // ================= SKULL =================
  const hwU = (z: number) => 0.35 - (0.1 * (z - 0.6)) / 1.4;
  const hwJ = (z: number) => 0.32 - (0.1 * (z + 0.05)) / 1.6;

  put(H, tb(0.95, 0.62, 0.82, 0.5, 1.1), P.scaleMid, head, [0, 0, 0.2]);
  put(H, tb(0.78, 0.05, 0.68, 0.05, 1.08), P.scaleDark, head, [0, 0.285, 0.2], { rot: [3.1, 0, 0] });
  for (const row of [-0.15, 0.05, 0.5]) {
    for (const s of [1, -1])
      put(H, box(0.13, 0.03, 0.11), P.scaleLight, head, [s * 0.2, 0.3 - (row > 0.4 ? 0.04 : 0), row], { rot: [3, s * 28, 0] });
  }
  for (const s of [1, -1]) {
    put(H, box(0.06, 0.2, 0.3), P.scaleLight, head, [s * 0.435, -0.12, 0.15]);
    put(H, box(0.05, 0.12, 0.22), P.scaleLight, head, [s * 0.42, 0.05, -0.12]);
  }

  // snout
  put(H, tb(0.7, 0.46, 0.5, 0.4, 1.4), P.scaleMid, head, [0, -0.02, 1.3]);
  put(H, tb(0.58, 0.05, 0.4, 0.05, 1.38), P.scaleDark, head, [0, 0.205, 1.3], { rot: [1.6, 0, 0] });
  for (const z of [0.95, 1.3, 1.65])
    for (const s of [1, -1]) put(H, box(0.05, 0.15, 0.27), P.scaleLight, head, [s * (hwU(z) + 0.004), 0.04, z]);
  for (const z of [0.8, 1.05, 1.3, 1.55]) put(H, box(0.09, 0.07, 0.15), P.bone, head, [0, 0.235, z], { rot: [1.6, 0, 0] });
  put(H, tb(0.52, 0.2, 0.46, 0.18, 0.26), P.scaleDark, head, [0, 0.08, 1.9]);
  for (const s of [1, -1]) {
    put(H, box(0.14, 0.07, 0.14), P.scaleLight, head, [s * 0.12, 0.17, 1.9]);
    put(H, box(0.08, 0.07, 0.03), P.ember, head, [s * 0.12, 0.09, 2.035], { glow: 1.6 });
  }
  // emberHot cracks
  const crack = (pts: N3[], up: N3) => {
    for (let i = 0; i < pts.length - 1; i++) seg(H, pts[i], pts[i + 1], 0.02, 0.014, P.emberHot, head, { up, glow: 1.4 });
  };
  crack([[0.14, 0.235, 0.75], [0.2, 0.235, 0.95], [0.1, 0.235, 1.15], [0.17, 0.235, 1.4], [0.08, 0.235, 1.65]], [0, 1, 0]);
  crack([[-0.12, 0.235, 0.8], [-0.2, 0.235, 1.0], [-0.08, 0.235, 1.2], [-0.16, 0.235, 1.5]], [0, 1, 0]);
  crack([[-0.37, 0.1, 0.9], [-0.37, 0.0, 1.1], [-0.33, 0.07, 1.35]], [-1, 0, 0]);
  crack([[0.36, 0.08, 1.0], [0.34, -0.04, 1.2], [0.31, 0.05, 1.45]], [1, 0, 0]);

  // ---------- upper mouth ----------
  for (const s of [1, -1]) {
    put(H, tb(0.1, 0.05, 0.1, 0.05, 1.4), P.mouth, head, [s * 0.24, -0.262, 1.3], { rot: [0, -s * 4.1, 0] });
  }
  put(H, tb(0.46, 0.025, 0.28, 0.025, 1.4), THROAT, head, [0, -0.255, 1.3]);
  seg(H, [0, -0.272, 0.8], [0, -0.272, 1.5], 0.07, 0.015, P.ember, head, { glow: 0.6 });
  for (let i = 0; i < 10; i++) {
    const z = 0.72 + 0.14 * i;
    for (const s of [1, -1]) {
      const x = s * (hwU(z) - 0.06);
      if (i === 6) spk(H, [x, -0.28, z], [s * 0.05, -1, 0.12], 0.27, 0.055, P.tooth, head, 5);
      else spk(H, [x, -0.28, z], [0, -1, 0], 0.1 + 0.03 * rnd(), 0.034, P.tooth, head, 5);
    }
  }

  // ---------- eyes, brows ----------
  for (const s of [1, -1]) {
    const c = [s * 0.375, 0.1, 0.72];
    const dOut = V(s * 0.55, 0.05, 0.83).normalize();
    const d = [dOut.x, dOut.y, dOut.z];
    put(H, sph(0.105, 8, 6), P.scaleDark, head, [c[0] - d[0] * 0.035, c[1] - d[1] * 0.035, c[2] - d[2] * 0.035]);
    put(H, sph(0.088, 8, 6), P.eye, head, c, { glow: 1.3 });
    put(H, box(0.022, 0.12, 0.02), P.eyeSlit, head, [c[0] + d[0] * 0.082, c[1] + d[1] * 0.082, c[2] + d[2] * 0.082],
      { q: aim(dOut, [0, 1, 0], "z") });
    put(H, box(0.4, 0.1, 0.32), P.bone, head, [s * 0.35, 0.235, 0.74], { rot: [0, 0, s * 16] });
    put(H, box(0.34, 0.06, 0.3), P.boneDark, head, [s * 0.35, 0.19, 0.76], { rot: [0, 0, s * 16] });
    spk(H, [s * 0.52, 0.29, 0.7], [s * 0.6, 0.4, -0.6], 0.2, 0.05, P.bone, head, 5);
  }
  // left-eye scar: brow and cheek, pale ridged edges
  seg(H, [0.418, 0.28, 0.5], [0.418, -0.28, 0.76], 0.045, 0.04, P.scar, head, { up: [1, 0, 0] });
  for (const o of [-1, 1])
    seg(H, [0.418, 0.28 + o * 0.017 * 2, 0.5 + o * 0.036 * 1.2], [0.418, -0.28 + o * 0.034, 0.76 + o * 0.043], 0.018, 0.048, P.bone, head, { up: [1, 0, 0] });
  for (const k of [0.25, 0.5, 0.75]) {
    const my = 0.28 - 0.56 * k;
    const mz = 0.5 + 0.26 * k;
    seg(H, [0.418, my - 0.021, mz - 0.045], [0.418, my + 0.021, mz + 0.045], 0.014, 0.05, P.boneDark, head, { up: [1, 0, 0] });
  }
  seg(H, [0.53, 0.345, 0.62], [0.37, 0.3, 0.9], 0.045, 0.03, P.scar, head);
  for (const o of [-1, 1])
    seg(H, [0.53 + o * 0.026, 0.345, 0.62 + o * 0.015], [0.37 + o * 0.026, 0.3, 0.9 + o * 0.015], 0.016, 0.034, P.bone, head);

  // ---------- crown band ----------
  put(H, tb(0.92, 0.07, 0.86, 0.07, 0.14), P.iron, head, [0, 0.325, 0.3]);
  for (const s of [1, -1]) put(H, box(0.06, 0.46, 0.14), P.iron, head, [s * 0.455, 0.08, 0.3]);
  for (const x of [-0.25, 0, 0.25]) {
    put(H, box(0.07, 0.03, 0.07), P.ember, head, [x, 0.365, 0.3], { rot: [0, 45, 0], glow: 1.6 });
  }
  for (const x of [-0.36, -0.13, 0.13, 0.36]) put(H, sph(0.022, 6, 4), P.chain, head, [x, 0.365, 0.3]);

  // ---------- horns ----------
  const hornSet: { pts: N3[]; r0: number; rings: number[]; ember: boolean }[] = [
    { pts: [[0.24, 0.26, 0.1], [0.3, 0.62, -0.05], [0.34, 0.74, -0.55], [0.28, 0.78, -1.05]], r0: 0.1, rings: [0.2, 0.45], ember: true },
    { pts: [[0.42, 0.2, -0.05], [0.62, 0.38, -0.1], [0.85, 0.4, -0.5], [0.95, 0.62, -0.98]], r0: 0.11, rings: [0.2, 0.45], ember: true },
    { pts: [[0.41, -0.04, 0.28], [0.58, -0.06, 0.2], [0.72, -0.08, -0.1], [0.8, 0.06, -0.45]], r0: 0.075, rings: [0.3], ember: false },
  ];
  for (const hd of hornSet) {
    for (const s of [1, -1]) {
      const pts = hd.pts.map((p) => P3(H, [p[0] * s, p[1], p[2]]));
      const curve = bezier(pts[0], pts[1], pts[2], pts[3]);
      b.sweep(curve, [hd.r0, 0], {
        bone: head,
        color: P.horn,
        bands: [[0.68, P.horn], [1, P.hornTip]],
        sides: 6,
        smooth: false,
        caps: { start: "flat", end: "point" },
      });
      const t0 = V().copy(curve.tangentAt(0)).normalize();
      emit(new THREE.CylinderGeometry(hd.r0 * 1.5, hd.r0 * 1.7, 0.08, 6), P.boneDark, head,
        pts[0].clone().addScaledVector(t0, 0.01), aim(t0));
      const ringAt = (t: number, R: number, tube: number, color: string, g: number) => {
        const p = V().copy(curve.at(t));
        const tn = V().copy(curve.tangentAt(t)).normalize();
        emit(torus(R, tube, 5, 9), color, head, p, aim(tn, undefined, "z"), g);
      };
      for (const t of hd.rings) ringAt(t, hd.r0 * (1 - t) * 1.17 + 0.012, 0.03, P.iron, 0);
      if (hd.ember) ringAt(0.33, hd.r0 * (1 - 0.33) * 1.17 + 0.02, 0.017, P.ember, 1.5);
    }
  }

  // ---------- frill ----------
  {
    const upM = D3(H, [0, 1, 0]);
    [-70, -35, 0, 35, 70].forEach((phi, i) => {
      const L = [0.6, 0.75, 0.9, 0.75, 0.6][i];
      const cp = Math.cos(phi * DEG);
      const sp = Math.sin(phi * DEG);
      const d = D3(H, [sp * Math.cos(20 * DEG), Math.sin(20 * DEG), -cp * Math.cos(20 * DEG)]).normalize();
      const y = upM.clone().addScaledVector(d, -upM.dot(d)).normalize();
      const at = P3(H, [sp * 0.28, 0.05, -0.2 - cp * 0.05]);
      const outline: any = [[0, -0.09], [0.3 * L, -0.16], [L, -0.02, "sharp"], [0.62 * L, 0.2], [0.1 * L, 0.17]];
      b.extrude(outline, { at, x: d, y, thickness: 0.05, bevel: 0.01, color: P.bone, bone: head });
      const tip = at.clone().addScaledVector(d, L * 0.85);
      seg(W, [at.x, at.y, at.z], [tip.x, tip.y, tip.z], 0.07, 0.035, P.boneDark, head, { up: [y.x, y.y, y.z] });
    });
  }

  // ---------- axe blade in the right cheek ----------
  {
    const out = D3(H, [-1, -0.12, 0.2]).normalize();
    const upM = D3(H, [0, 1, 0]);
    const y = upM.clone().addScaledVector(out, -upM.dot(out)).normalize();
    const at = P3(H, [-0.34, -0.1, 0.3]);
    const blade: any = [[0, -0.26], [0.1, -0.34], [0.28, -0.2], [0.31, 0.2], [0.1, 0.34], [0, 0.26]];
    const rustEdge: any = [[0, -0.25], [0.07, -0.32], [0.11, -0.27], [0.11, 0.27], [0.07, 0.32], [0, 0.25]];
    b.extrude(blade, { at, x: out, y, thickness: 0.04, bevel: 0.006, color: P.iron, bone: head });
    b.extrude(rustEdge, { at, x: out, y, thickness: 0.058, bevel: 0.006, color: P.rust, bone: head });
    const A = at.clone().addScaledVector(out, 0.28);
    const B = at.clone().addScaledVector(out, 0.58);
    seg(W, [A.x, A.y, A.z], [B.x, B.y, B.z], 0.075, 0.075, P.horn, head, { up: [0, 1, 0] });
    for (const d of [0.35, 0.45, 0.54]) {
      const p = at.clone().addScaledVector(out, d);
      emit(torus(0.05, 0.016, 4, 8), P.leather, head, p, aim(out, undefined, "z"));
    }
    spk(W, [B.x, B.y, B.z], [out.x, out.y + 0.2, out.z], 0.1, 0.035, P.boneDark, head, 4);
    spk(W, [B.x, B.y + 0.03, B.z + 0.02], [out.x, out.y - 0.4, out.z + 0.1], 0.07, 0.025, P.bone, head, 4);
    // trailing strap
    let s0 = at.clone().addScaledVector(out, 0.45);
    const dirs: N3[] = [[0.03 * out.x, -0.18, 0.03], [0.02, -0.2, -0.04], [-0.02, -0.18, 0.04]];
    for (const dv of dirs) {
      const s1 = s0.clone().add(V(dv[0], dv[1], dv[2]));
      seg(W, [s0.x, s0.y, s0.z], [s1.x, s1.y, s1.z], 0.06, 0.02, P.leather, head, { up: [out.x, out.y, out.z] });
      s0 = s1;
    }
    emit(box(0.07, 0.04, 0.06), P.iron, head, s0.clone().add(V(0, -0.02, 0)), new THREE.Quaternion());
  }

  // ================= LOWER JAW (own part on jawC) =================
  put(JS, tb(0.64, 0.3, 0.44, 0.22, 1.6), P.scaleMid, jaw, [0, -0.2, 0.75]);
  put(JS, tb(0.4, 0.03, 0.26, 0.03, 1.5), P.bellyDark, jaw, [0, -0.335, 0.75], { rot: [-1.4, 0, 0] });
  put(JS, tb(0.56, 0.03, 0.36, 0.03, 1.5), P.mouth, jaw, [0, -0.062, 0.75]);
  for (const s of [1, -1]) {
    put(JS, tb(0.09, 0.04, 0.09, 0.04, 1.5), P.mouth, jaw, [s * 0.225, -0.062, 0.75], { rot: [0, -s * 3.8, 0] });
    for (const z of [0.4, 0.8, 1.2]) put(JS, box(0.04, 0.1, 0.25), P.scaleLight, jaw, [s * (hwJ(z) + 0.004), -0.2, z]);
    put(JS, new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), P.iron, jaw, [s * 0.33, -0.12, 0.03], { rot: [0, 0, 90] });
  }
  put(JS, tb(0.24, 0.05, 0.16, 0.04, 1.1), TONGUE, jaw, [0, -0.045, 0.62]);
  put(JS, box(0.26, 0.03, 0.2), P.ember, jaw, [0, -0.035, 0.2], { glow: 0.7 });
  for (let i = 0; i < 8; i++) {
    const z = 0.33 + 0.16 * i;
    for (const s of [1, -1]) spk(JS, [s * (hwJ(z) - 0.045), -0.06, z], [0, 1, 0.05], 0.09 + 0.03 * rnd(), 0.03, P.tooth, jaw, 5);
  }
  // chin spikes
  for (const [z, len, r] of [[0.55, 0.22, 0.06], [0.9, 0.28, 0.07], [1.25, 0.2, 0.055]])
    spk(JS, [0, -0.32, z], [0, -1, -0.4], len, r, P.bone, jaw, 5);

  // ---------- flush merged parts ----------
  for (const e of buckets.values()) {
    const g = mergeGeometries(e.geos);
    if (!g) continue;
    const part = b.part(g, e.color, { bone: e.bone, at: [0, 0, 0], flat: true });
    if (e.glow > 0) glow(part, e.glow);
  }
}
    return buildHeadCenter;
  })(),
  // headsLeft
  (() => {
function buildHeadsLeft({ b, J, P, M }: Ctx) {
  const V = THREE.Vector3;
  const Q = THREE.Quaternion;
  const M4 = THREE.Matrix4;
  const R = rng(11);

  // own colours (palette has no rime, tongue, throat or venom crust)
  const RIME = "#a8e6ff";
  const TONGUE = "#9a3a3c";
  const MOUTH_DK = "#4a1618";
  const VENOM_DK = "#6b8f26";

  // ------------------------------------------------------------------ merge buckets
  type Bucket = { geos: THREE.BufferGeometry[]; color: string; bone: any; glow: number };
  const buckets = new Map<string, Bucket>();
  const emit = (geo: THREE.BufferGeometry, color: string, bone: any, glowS = 0) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    for (const n of Object.keys(g.attributes)) if (n !== "position" && n !== "normal" && n !== "uv") g.deleteAttribute(n);
    g.clearGroups();
    g.computeVertexNormals();
    const key = `${bone.name}|${color}|${glowS}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { geos: [], color, bone, glow: glowS }));
    bk.geos.push(g);
  };
  const flush = () => {
    for (const bk of buckets.values()) {
      const merged = mergeGeometries(bk.geos);
      if (!merged) continue;
      const part = b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0], flat: true });
      if (bk.glow > 0) glow(part, bk.glow);
    }
    buckets.clear();
  };

  type PO = { p?: THREE.Vector3; q?: THREE.Quaternion; s?: THREE.Vector3 | number; glow?: number };
  const place = (PM: THREE.Matrix4, geo: THREE.BufferGeometry, color: string, bone: any, o: PO = {}) => {
    const s = typeof o.s === "number" ? new V(o.s, o.s, o.s) : (o.s ?? new V(1, 1, 1));
    geo.applyMatrix4(new M4().compose(o.p ?? new V(), o.q ?? new Q(), s));
    geo.applyMatrix4(PM);
    emit(geo, color, bone, o.glow ?? 0);
  };

  // ------------------------------------------------------------------ geometry helpers
  const E = (x = 0, y = 0, z = 0) => new Q().setFromEuler(new THREE.Euler(x, y, z));
  const box = (w: number, l: number, h: number) => new THREE.BoxGeometry(w, l, h);
  const taper = (w0: number, h0: number, w1: number, h1: number, len: number) => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = p.getY(i) + 0.5;
      p.setXYZ(i, p.getX(i) * (w0 + (w1 - w0) * t), p.getY(i) * len, p.getZ(i) * (h0 + (h1 - h0) * t));
    }
    return g;
  };
  const toothDown = (r: number, h: number) => {
    const g = new THREE.ConeGeometry(r, h, 5);
    g.translate(0, h / 2, 0);
    g.rotateX(-Math.PI / 2);
    return g;
  };
  const toothUp = (r: number, h: number) => {
    const g = new THREE.ConeGeometry(r, h, 5);
    g.translate(0, h / 2, 0);
    g.rotateX(Math.PI / 2);
    return g;
  };
  const fm = (p: any, ctr?: THREE.Vector3) =>
    new M4().compose(ctr ?? new V().copy(p.at), new Q().copy(p.quat), new V(1, 1, 1));

  // Norse rune strokes in a unit square (x across, z along)
  const GLYPHS: number[][][] = [
    [[0, -0.5, 0, 0.5], [0, 0.1, 0.3, 0.35], [0, -0.2, 0.3, 0.05]],
    [[-0.25, -0.5, -0.25, 0.5], [-0.25, 0.5, 0.25, 0.2], [0.25, 0.2, 0.25, -0.5]],
    [[0, -0.5, 0, 0.5], [0, 0.5, -0.3, 0.15], [0, 0.5, 0.3, 0.15]],
    [[0, -0.5, 0, 0.5], [-0.28, 0.2, 0, 0.5], [0.28, 0.2, 0, 0.5]],
    [[-0.2, -0.5, -0.2, 0.5], [-0.2, 0.25, 0.2, 0], [0.2, 0, -0.2, -0.25]],
    [[0, 0.5, 0.3, 0], [0.3, 0, 0, -0.5], [0, -0.5, -0.3, 0], [-0.3, 0, 0, 0.5]],
    [[0.25, 0.5, -0.2, 0.15], [-0.2, 0.15, 0.2, -0.15], [0.2, -0.15, -0.25, -0.5]],
    [[-0.25, -0.5, -0.25, 0.5], [0.25, -0.5, 0.25, 0.5], [-0.25, 0, 0.25, 0]],
  ];
  const rune = (PM: THREE.Matrix4, g: number[][], size: number, bone: any, col: string, gs: number) => {
    place(PM, box(size * 1.0, 0.03, size * 1.35), P.ironDark, bone);
    const sx = size * 0.78;
    const sz = size * 1.1;
    const w = Math.max(0.014, size * 0.1);
    for (const [x1, z1, x2, z2] of g) {
      const ax = x1 * sx, az = z1 * sz, bx = x2 * sx, bz = z2 * sz;
      const dx = bx - ax, dz = bz - az;
      place(PM, box(Math.hypot(dx, dz) + w, 0.034, w), col, bone, {
        p: new V((ax + bx) / 2, 0.003, (az + bz) / 2),
        q: E(0, -Math.atan2(dz, dx), 0),
        glow: gs,
      });
    }
  };

  // ------------------------------------------------------------------ neck
  type Cfg = {
    tag: string;
    h: any;
    jaw: any;
    neckJ: any[];
    start: number[];
    radii: number[];
    k: number;
    eye: string;
    kind: "frost" | "venom";
  };

  function buildNeck(c: Cfg) {
    const path = catmull([
      new V(c.start[0], c.start[1], c.start[2]),
      new V().copy(c.neckJ[1].at),
      new V().copy(c.neckJ[2].at),
      new V().copy(c.h.at),
    ]);
    const sw = b.sweep(path, c.radii, {
      bone: [c.neckJ[0], c.neckJ[1], c.neckJ[2], c.h],
      color: P.scaleMid,
      sectors: [
        [-65, 65, P.scaleDark],
        [135, 225, P.bellyDark],
      ],
      sides: 8,
      smooth: false,
    });
    const bn = (p: any, t: number) => p.bone ?? c.neckJ[Math.min(2, Math.floor(t * 3))];
    const glowC = c.kind === "frost" ? P.frost : P.venom;

    // ventral throat plates
    for (let i = 0; i < 8; i++) {
      const t = 0.1 + (0.8 * i) / 7;
      const p = sw.at(t, 180);
      const PM = fm(p);
      const r = p.radius;
      place(PM, box(r * 1.02, 0.04, 0.33), P.bellyDark, bn(p, t), { p: new V(0, -0.005, 0) });
      place(PM, box(r * 0.86, 0.075, 0.27), P.belly, bn(p, t), { p: new V(0, 0.015, 0) });
    }
    // dorsal spikes
    for (let i = 0; i < 9; i++) {
      const t = 0.08 + i * 0.1175;
      const p = sw.at(t, 0);
      const PM = fm(p);
      const s = 1 - 0.45 * t;
      const g = new THREE.ConeGeometry(0.06 * s, 0.26 * s, 5);
      g.translate(0, 0.13 * s - 0.03, 0);
      g.rotateX(-0.6);
      place(PM, g, P.bone, bn(p, t));
      place(PM, new THREE.CylinderGeometry(0.075 * s, 0.085 * s, 0.07, 6), P.boneDark, bn(p, t), {
        p: new V(0, -0.005, 0),
      });
    }
    // side runes
    const ts = [0.15, 0.3, 0.7, 0.85];
    ts.forEach((t, i) => {
      for (const ang of [-82, 82]) {
        const p = sw.at(t, ang);
        rune(fm(p), GLYPHS[(i * 2 + (ang > 0 ? 1 : 0) + (c.kind === "frost" ? 0 : 3)) % 8], 0.17, bn(p, t), glowC, 1.5);
      }
    });

    // iron-and-leather collar
    {
      const t = 0.5;
      const p = sw.at(t, 0);
      const ctr = new V().copy(p.at).addScaledVector(new V().copy(p.n), -p.radius);
      const PM = fm(p, ctr);
      const bone = bn(p, t);
      const Rt = p.radius * 1.08 + 0.03;
      place(PM, new THREE.TorusGeometry(Rt, 0.065, 4, 12), P.iron, bone);
      place(PM, new THREE.TorusGeometry(Rt - 0.01, 0.05, 4, 12), P.leather, bone, { p: new V(0, 0, 0.15) });
      place(PM, new THREE.TorusGeometry(Rt - 0.01, 0.05, 4, 12), P.leather, bone, { p: new V(0, 0, -0.15) });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        place(PM, new THREE.SphereGeometry(0.032, 5, 4), P.chain, bone, {
          p: new V(Math.cos(a) * (Rt + 0.055), Math.sin(a) * (Rt + 0.055), 0),
        });
      }
      place(PM, box(0.1, 0.06, 0.12), P.ironDark, bone, { p: new V(0, -(Rt + 0.06), 0.15) });
      place(PM, box(0.05, 0.07, 0.04), P.chain, bone, { p: new V(0, -(Rt + 0.1), 0.15) });
    }

    // OL: chain draped round the neck ending in a spiked iron shackle
    if (c.tag === "OL") {
      const t = 0.62;
      const p = sw.at(t, 0);
      const ctr = new V().copy(p.at).addScaledVector(new V().copy(p.n), -p.radius);
      const PM = fm(p, ctr);
      const bone = bn(p, t);
      const Rt = p.radius * 1.08 + 0.03;
      place(PM, new THREE.TorusGeometry(Rt, 0.07, 4, 12), P.iron, bone);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        const g = new THREE.ConeGeometry(0.045, 0.2, 4);
        g.translate(0, 0.1, 0);
        place(PM, g, P.ironDark, bone, {
          p: new V(Math.cos(a) * (Rt + 0.05), Math.sin(a) * (Rt + 0.05), 0),
          q: E(0, 0, a - Math.PI / 2),
        });
      }
      // draped links on a second ring
      const p2 = sw.at(0.46, 0);
      const ctr2 = new V().copy(p2.at).addScaledVector(new V().copy(p2.n), -p2.radius);
      const PM2 = fm(p2, ctr2);
      const R2 = p2.radius * 1.08 + 0.09;
      const N = 16;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const tdir = new V(-Math.sin(a), Math.cos(a), 0);
        const radial = new V(Math.cos(a), Math.sin(a), 0);
        const g = new THREE.TorusGeometry(0.07, 0.018, 4, 6);
        g.scale(1.5, 1, 1);
        const q =
          i % 2 === 0
            ? E(0, 0, a + Math.PI / 2)
            : new Q().setFromRotationMatrix(new M4().makeBasis(tdir, new V(0, 0, 1), radial));
        place(PM2, g, P.chain, bn(p2, 0.46), { p: new V(Math.cos(a) * R2, Math.sin(a) * R2, 0), q });
      }
      // padlock block + hanging chain with spiked weight
      const front = sw.at(t, 180);
      place(PM, box(0.18, 0.16, 0.2), P.ironDark, bone, { p: new V(0, -(Rt + 0.1), 0) });
      place(PM, box(0.12, 0.05, 0.12), P.rust, bone, { p: new V(0, -(Rt + 0.19), 0) });
      const base = new V().copy(front.at).add(new V(0, -0.2, 0.06));
      for (let i = 0; i < 5; i++) {
        const g = new THREE.TorusGeometry(0.06, 0.017, 4, 6);
        g.scale(1, 1.5, 1);
        const pq = new M4().compose(new V(), E(0, i % 2 ? Math.PI / 2 : 0, 0), new V(1, 1, 1));
        place(pq, g, P.chain, bone, { p: new V().copy(base).add(new V(0, -0.15 * i, 0.015 * i)) });
      }
      const wp = new V().copy(base).add(new V(0, -0.15 * 5 - 0.04, 0.075));
      const W = new M4();
      place(W, new THREE.SphereGeometry(0.1, 6, 4), P.ironDark, bone, { p: wp });
      for (const d of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0]]) {
        const g = new THREE.ConeGeometry(0.04, 0.12, 4);
        g.translate(0, 0.06, 0);
        const dv = new V(d[0], d[1], d[2]);
        place(W, g, P.iron, bone, { p: new V().copy(wp).addScaledVector(dv, 0.08), q: aim(dv, new V(0, 1, 0.01)) });
      }
    }
    return sw;
  }

  // ------------------------------------------------------------------ head
  function buildHead(c: Cfg) {
    const { h, jaw, k } = c;
    const HM = new M4().compose(new V().copy(h.at), new Q().copy(h.quat), new V(k, k, k));
    const loc = (l: number, f: number, u: number) => new V(-l, f, u);
    const put = (geo: THREE.BufferGeometry, color: string, l: number, f: number, u: number, o: PO & { bone?: any } = {}) =>
      place(HM, geo, color, o.bone ?? h, { ...o, p: loc(l, f, u) });
    const putJ = (geo: THREE.BufferGeometry, color: string, l: number, f: number, u: number, o: PO = {}) =>
      put(geo, color, l, f, u, { ...o, bone: jaw });
    const glowC = c.kind === "frost" ? P.frost : P.venom;
    const snW = (f: number) => 0.56 - (0.16 * (f - 0.3)) / 0.7;
    const jawW = (f: number) => 0.6 - (0.26 * (f - 0.05)) / 0.95;
    const topU = (f: number) => 0.2 - (0.04 * (f - 0.3)) / 0.7;

    // ---- cranium
    put(taper(0.75, 0.62, 0.68, 0.54, 0.72), P.scaleMid, 0, 0, 0);
    put(taper(0.46, 0.5, 0.6, 0.56, 0.34), P.scaleDark, 0, -0.4, -0.06);
    put(taper(0.5, 0.05, 0.4, 0.05, 0.62), P.scaleDark, 0, -0.02, 0.315);
    put(box(0.14, 0.5, 0.06), P.scaleLight, 0, -0.05, 0.345);
    for (const f of [-0.25, 0, 0.2]) put(box(0.4, 0.06, 0.035), P.scaleLight, 0, f, 0.325);
    for (const e of [1, -1]) {
      for (const [f, u, len, hh] of [[-0.2, 0.1, 0.22, 0.2], [0.05, 0.06, 0.2, 0.16], [0.26, -0.02, 0.14, 0.14]])
        put(box(0.045, len, hh), P.scaleLight, e * 0.36, f, u);
      put(new THREE.SphereGeometry(0.045, 5, 4), P.chain, e * 0.33, 0.35, -0.2, { bone: jaw });
    }

    // ---- upper snout
    put(taper(0.56, 0.34, 0.4, 0.26, 0.7), P.scaleMid, 0, 0.65, 0.03);
    put(box(0.43, 0.07, 0.3), P.scaleDark, 0, 1.0, 0.03);
    put(taper(0.34, 0.04, 0.24, 0.04, 0.66), P.scaleDark, 0, 0.64, 0.2, { q: E(-0.057, 0, 0) });
    for (const f of [0.5, 0.68, 0.86]) put(box(0.36 - (f - 0.5) * 0.3, 0.07, 0.03), P.scaleLight, 0, f, topU(f) + 0.035);
    for (const e of [1, -1])
      for (const f of [0.45, 0.65, 0.85]) put(box(0.04, 0.14, 0.1), P.scaleLight, e * (snW(f) / 2), f, 0.06);
    // gums, throat and mouth glow
    put(taper(0.5, 0.03, 0.34, 0.03, 0.66), P.mouth, 0, 0.63, -0.145);
    put(box(0.42, 0.04, 0.2), MOUTH_DK, 0, 0.36, -0.1);
    put(box(0.3, 0.03, 0.1), glowC, 0, 0.4, -0.115, { glow: 1.2 });

    // upper teeth (merged)
    for (const e of [1, -1]) {
      for (let i = 0; i < 7; i++) {
        const f = 0.42 + i * 0.085;
        const fang = i === 3;
        put(fang ? toothDown(0.05, 0.27) : toothDown(0.03, 0.1 + R() * 0.03), P.tooth, e * (snW(f) / 2 - (fang ? 0.05 : 0.035)), f, -0.125);
      }
    }
    for (const l of [-0.1, 0, 0.1]) put(toothDown(0.028, 0.08), P.tooth, l, 0.99, -0.095);

    // ---- lower jaw (rides jawX)
    putJ(taper(0.6, 0.18, 0.34, 0.14, 0.95), P.scaleMid, 0, 0.525, -0.23);
    putJ(taper(0.4, 0.03, 0.26, 0.03, 0.8), P.belly, 0, 0.55, -0.325);
    [[0.3, 0.34], [0.5, 0.3], [0.7, 0.26], [0.9, 0.22]].forEach(([f, w]) => putJ(box(w, 0.035, 0.035), P.bellyDark, 0, f, -0.335));
    putJ(taper(0.46, 0.03, 0.28, 0.03, 0.8), P.mouth, 0, 0.5, -0.145);
    putJ(taper(0.2, 0.05, 0.1, 0.04, 0.5), TONGUE, 0, 0.6, -0.12);
    for (const e of [1, -1]) {
      for (let i = 0; i < 6; i++) {
        const f = 0.45 + i * 0.095;
        putJ(toothUp(0.028, 0.07 + R() * 0.03), P.tooth, e * (jawW(f) / 2 - 0.055), f, -0.15);
      }
      for (const f of [0.3, 0.55, 0.8]) putJ(box(0.035, 0.16, 0.1), P.scaleLight, e * (jawW(f) / 2), f, -0.23);
    }
    for (const l of [-0.05, 0.05]) putJ(toothUp(0.026, 0.07), P.tooth, l, 0.97, -0.15);
    putJ(toothDown(0.04, 0.14), P.bone, -0.07, 0.95, -0.31);
    putJ(toothDown(0.04, 0.14), P.bone, 0.07, 0.95, -0.31);

    // ---- eyes, brows
    for (const e of [1, -1]) {
      const nl = new V(-e * 0.8, 0.55, 0.1).normalize();
      const ec = new V(-e * 0.31, 0.27, 0.12);
      place(HM, new THREE.SphereGeometry(0.1, 6, 5), P.scaleDark, h, { p: new V().copy(ec).addScaledVector(nl, -0.03) });
      place(HM, new THREE.SphereGeometry(0.075, 8, 6), c.eye, h, { p: ec, glow: 1.8 });
      place(HM, box(0.022, 0.02, 0.1), P.eyeSlit, h, {
        p: new V().copy(ec).addScaledVector(nl, 0.062),
        q: aim(nl, new V(0, 0, 1)),
      });
      put(box(0.3, 0.26, 0.085), P.bone, e * 0.28, 0.28, 0.215, { q: E(0, 0.35 * e, 0) });
      put(box(0.2, 0.2, 0.04), P.boneDark, e * 0.28, 0.27, 0.26, { q: E(0, 0.35 * e, 0) });
      const bs = new THREE.ConeGeometry(0.035, 0.12, 4);
      bs.translate(0, 0.06, 0);
      put(bs, P.bone, e * 0.4, 0.3, 0.2, { q: E(0, 0, e * 1.1 + 0.3) });
      // nostrils
      put(box(0.09, 0.04, 0.07), P.eyeSlit, e * 0.12, 0.995, 0.06);
      put(box(0.05, 0.03, 0.045), glowC, e * 0.12, 1.012, 0.06, { glow: 1.6 });
    }

    // ---- cheek frill of extruded blades
    for (const e of [1, -1]) {
      for (let i = 0; i < 5; i++) {
        const a = ((15 + i * 16) * Math.PI) / 180;
        const d = new V(-e * Math.sin(a), -Math.cos(a), (i - 2) * 0.07).normalize();
        const len = [0.44, 0.42, 0.38, 0.32, 0.26][i];
        const shp = new THREE.Shape();
        shp.moveTo(0, -0.075);
        shp.lineTo(len * 0.55, -0.085);
        shp.lineTo(len, 0);
        shp.lineTo(len * 0.55, 0.085);
        shp.lineTo(0, 0.075);
        const mk = (depth: number, sx: number, sy: number) => {
          const g = new THREE.ExtrudeGeometry(shp, { depth, bevelEnabled: false });
          g.translate(0, 0, -depth / 2);
          g.scale(sx, sy, 1);
          return g;
        };
        const q = aim(d, new V(0, 0, 1), "x");
        put(mk(0.03, 1, 1), P.bone, e * 0.3, -0.1, -0.03, { q });
        put(mk(0.045, 0.7, 0.45), P.boneDark, e * 0.3, -0.1, -0.03, { q });
      }
    }

    // ---- horns
    const horn = (pts: number[][], r0: number, bands: [number, string][], capEnd: "point" | "flat" = "point", r1 = 0.012) => {
      const world = pts.map(([l, f, u]) => loc(l, f, u).applyMatrix4(HM));
      return b.sweep(catmull(world), [r0 * k, r1 * k], {
        bone: h,
        bands,
        caps: { start: "flat", end: capEnd },
        sides: 6,
        smooth: false,
      });
    };
    const hornBand = (sw: any, t: number) => {
      const p = sw.at(t, 0);
      const ctr = new V().copy(p.at).addScaledVector(new V().copy(p.n), -p.radius);
      const PM = fm(p, ctr);
      const Rt = p.radius * 1.08 + 0.012;
      place(PM, new THREE.TorusGeometry(Rt, 0.026, 4, 8), P.iron, h);
      place(PM, new THREE.SphereGeometry(0.02, 4, 3), P.chain, h, { p: new V(0, Rt + 0.025, 0) });
      return PM;
    };
    for (const e of [1, -1]) {
      const bigPts = [[e * 0.25, -0.12, 0.27], [e * 0.33, -0.4, 0.52], [e * 0.38, -0.75, 0.66], [e * 0.36, -1.1, 0.62]];
      if (c.tag === "OL" && e === 1) {
        // snapped-off left horn with an iron cap
        const sw = horn([[0.25, -0.12, 0.27], [0.29, -0.24, 0.38], [0.32, -0.34, 0.47]], 0.075, [[1, P.horn]], "flat", 0.06);
        const p = sw.at(0.97, 0);
        const ctr = new V().copy(p.at).addScaledVector(new V().copy(p.n), -p.radius);
        const PM = fm(p, ctr);
        const cyl = new THREE.CylinderGeometry(p.radius * 1.12 + 0.015, p.radius * 1.12 + 0.015, 0.1, 6);
        cyl.rotateX(Math.PI / 2);
        place(PM, cyl, P.iron, h);
        place(PM, new THREE.TorusGeometry(p.radius * 1.2 + 0.02, 0.018, 4, 8), P.ironDark, h, { p: new V(0, 0, 0.05) });
        const fr = new THREE.ConeGeometry(0.045, 0.1, 4);
        fr.translate(0, 0.05, 0);
        fr.rotateX(Math.PI / 2);
        place(PM, fr, P.hornTip, h, { p: new V(0.015, 0, 0.05) });
      } else {
        const bands: [number, string][] =
          c.kind === "frost" ? [[0.6, P.hornTip], [1, P.bone]] : [[0.72, P.horn], [1, P.hornTip]];
        const sw = horn(bigPts, 0.075, bands);
        hornBand(sw, 0.3);
        if (c.kind === "frost") {
          const p = sw.at(0.96, 0);
          const PM = fm(p);
          place(PM, new THREE.OctahedronGeometry(0.075, 0), P.frost, h, { s: new V(0.55, 0.55, 2.3), p: new V(0, 0, 0.06), glow: 1.6 });
          for (const [ox, oz, sc] of [[0.045, -0.04, 0.6], [-0.045, -0.06, 0.5]])
            place(PM, new THREE.OctahedronGeometry(0.05, 0), P.frost, h, { s: new V(0.5, 0.5, 2 * sc + 0.5), p: new V(ox, 0.01, oz), glow: 1.6 });
        }
      }
      // smaller side horn off the brow
      horn([[e * 0.37, 0.2, 0.22], [e * 0.5, 0.0, 0.3], [e * 0.56, -0.25, 0.42]], 0.045, [[0.7, P.horn], [1, P.hornTip]]);
    }

    // ---- identity
    if (c.kind === "frost") {
      // bone horn crown
      for (let i = 0; i < 5; i++) {
        const g = new THREE.ConeGeometry(0.05, 0.22 - Math.abs(i - 2) * 0.03, 5);
        g.translate(0, 0.11, 0);
        g.rotateX(Math.PI / 2 + 0.6);
        put(g, P.bone, (i - 2) * 0.14, -0.28, 0.29);
        put(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 5), P.boneDark, (i - 2) * 0.14, -0.28, 0.3);
      }
      // rime plates + crystals
      for (const e of [1, -1]) {
        for (const f of [0.5, 0.75]) put(box(0.05, 0.16, 0.09), RIME, e * (snW(f) / 2 + 0.01), f, 0.1);
        put(box(0.05, 0.12, 0.07), P.scaleLight, e * (snW(0.62) / 2 + 0.02), 0.62, 0.0);
      }
      for (const [f, s] of [[0.5, 1], [0.7, 0.8], [0.88, 0.6]]) {
        put(new THREE.OctahedronGeometry(0.06 * s, 0), RIME, 0, f, topU(f) + 0.06 * s, { s: new V(0.8, 0.8, 2) });
      }
      for (const l of [-0.2, 0.2]) put(new THREE.OctahedronGeometry(0.05, 0), RIME, l, 0.12, 0.34, { s: new V(0.7, 0.7, 2.2) });
      // frost cracks
      for (const e of [1, -1]) {
        const segs = [[-0.2, 0.18, -0.1, 0.1], [-0.1, 0.1, -0.12, 0.0], [-0.12, 0.0, 0.0, -0.08], [-0.1, 0.1, 0.05, 0.14]];
        for (const [f1, u1, f2, u2] of segs) {
          const dfv = f2 - f1, duv = u2 - u1;
          put(box(0.014, Math.hypot(dfv, duv) + 0.012, 0.014), P.frost, e * 0.376, (f1 + f2) / 2, (u1 + u2) / 2, {
            q: E(Math.atan2(duv, dfv), 0, 0),
            glow: 1.4,
          });
        }
      }
    } else {
      // OL: long scar down the snout with pale ridge edges and stitches
      const sq = E(0, 0, 0.12);
      put(box(0.045, 0.62, 0.03), P.scar, 0.04, 0.64, 0.2, { q: sq });
      put(box(0.016, 0.64, 0.034), P.bone, 0.083, 0.64, 0.2, { q: sq });
      put(box(0.016, 0.64, 0.034), P.bone, -0.003, 0.64, 0.2, { q: sq });
      for (let i = 0; i < 5; i++) put(box(0.12, 0.018, 0.034), P.boneDark, 0.04 - i * 0.012 + 0.0, 0.4 + i * 0.12, 0.205, { q: sq });
      // tusks from the lower jaw
      for (const e of [1, -1]) {
        const pts = [[e * 0.17, 0.8, -0.22], [e * 0.26, 0.92, -0.05], [e * 0.28, 0.9, 0.2], [e * 0.22, 0.8, 0.4]];
        const world = pts.map(([l, f, u]) => loc(l, f, u).applyMatrix4(HM));
        b.sweep(catmull(world), [0.06 * k, 0.005 * k], { bone: jaw, color: P.bone, caps: { end: "point" }, sides: 6, smooth: false });
      }
      // iron bolts along the jaw
      for (const e of [1, -1]) {
        for (let i = 0; i < 6; i++) {
          const f = 0.28 + i * 0.12;
          putJ(box(0.03, 0.1, 0.1), P.ironDark, e * (jawW(f) / 2 + 0.008), f, -0.23);
          putJ(new THREE.CylinderGeometry(0.024, 0.026, 0.03, 6), P.rust, e * (jawW(f) / 2 + 0.03), f, -0.23, { q: E(0, 0, e * Math.PI / 2) });
        }
      }
      // venom drips
      const drip = (l: number, f: number, u: number, len: number, bone: any) => {
        const gs = new THREE.SphereGeometry(0.03, 5, 4);
        put(gs, P.venom, l, f, u - len, { s: new V(1, 1.4, 1), glow: 1.4, bone });
        const cn = new THREE.ConeGeometry(0.02, 0.08, 4);
        cn.translate(0, 0.04, 0);
        put(cn, P.venom, l, f, u - len + 0.02, { glow: 1.4, bone });
        if (len > 0.1) put(new THREE.CylinderGeometry(0.008, 0.008, len - 0.06, 4), P.venom, l, f, u - len / 2 + 0.07, { q: E(Math.PI / 2, 0, 0), glow: 1.2, bone });
      };
      drip(0.22, 0.75, -0.32, 0.12, jaw);
      drip(-0.2, 0.62, -0.32, 0.24, jaw);
      drip(0.06, 0.96, -0.32, 0.1, jaw);
      drip(0.19, 0.7, -0.4, 0.14, h);
      // venom crust on the snout sides
      for (const e of [1, -1]) put(box(0.04, 0.2, 0.06), VENOM_DK, e * (snW(0.8) / 2 + 0.015), 0.8, 0.12);
    }
  }

  // ------------------------------------------------------------------ build
  const cfgs: Cfg[] = [
    {
      tag: "IL",
      h: J.headIL,
      jaw: J.jawIL,
      neckJ: [J.neckIL1, J.neckIL2, J.neckIL3],
      start: M.neckBaseIL,
      radii: [0.42, 0.4, 0.34, 0.3],
      k: 1,
      eye: P.frost,
      kind: "frost",
    },
    {
      tag: "OL",
      h: J.headOL,
      jaw: J.jawOL,
      neckJ: [J.neckOL1, J.neckOL2, J.neckOL3],
      start: M.neckBaseOL,
      radii: [0.38, 0.36, 0.31, 0.27],
      k: 0.96,
      eye: P.venom,
      kind: "venom",
    },
  ];
  for (const c of cfgs) {
    buildNeck(c);
    buildHead(c);
  }
  flush();
  // rest pose: lower jaws hang about 8 degrees open
  for (const c of cfgs) b.pose(c.jaw, { axis: [1, 0, 0], deg: 8 });
}
    return buildHeadsLeft;
  })(),
  // headsRight
  (() => {
function buildHeadsRight({ b, J, P, M }: Ctx) {
  const DEG = Math.PI / 180;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const AX: any = { x: V(1, 0, 0), y: V(0, 1, 0), z: V(0, 0, 1) };
  const rotQ = (axis: "x" | "y" | "z", a: number) => new THREE.Quaternion().setFromAxisAngle(AX[axis], a);
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
  const rnd = rng(23);

  // ---------- merged-detail bags: one part per bone + colour (+ glow strength) ----------
  const mtx = new THREE.Matrix4();
  const bags = new Map<string, any>();
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    bone: any,
    pos: THREE.Vector3,
    q: THREE.Quaternion,
    scale?: number | number[],
    strength = 0,
  ) => {
    const s = typeof scale === "number" ? V(scale, scale, scale) : scale ? V(scale[0], scale[1], scale[2]) : V(1, 1, 1);
    geo.applyMatrix4(mtx.compose(pos, q, s));
    const key = `${bone.name}|${color}|${strength}`;
    let bag = bags.get(key);
    if (!bag) bags.set(key, (bag = { bone, color, strength, geos: [] }));
    bag.geos.push(geo);
  };
  const flush = () => {
    for (const bag of bags.values()) {
      const merged = mergeGeometries(bag.geos);
      if (!merged) continue;
      const p = b.part(merged, bag.color, { bone: bag.bone, at: [0, 0, 0], flat: true });
      if (bag.strength) glow(p, bag.strength);
    }
    bags.clear();
  };

  const boxG = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const sphG = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
  const coneG = (r: number, h: number, s = 5) => new THREE.ConeGeometry(r, h, s);
  const cylG = (r0: number, r1: number, h: number, s = 6) => new THREE.CylinderGeometry(r0, r1, h, s);
  const torG = (r: number, t: number, rs = 5, ts = 10) => new THREE.TorusGeometry(r, t, rs, ts);

  // frame-local placement (sweep points, hits)
  const lp = (fr: any, x: number, y: number, z: number) => V(x, y, z).applyQuaternion(fr.quat).add(vec(fr.at));
  const ryq = (fr: any, a: number) => fr.quat.clone().multiply(rotQ("y", a));

  // ---------- Norse rune glyphs: strokes [x1,z1,x2,z2] in -0.5..0.5 ----------
  const GLYPHS: number[][][] = [
    [[0, -0.5, 0, 0.5], [0, 0.5, 0.3, 0.25], [0, 0.2, 0.3, -0.05]],
    [[-0.2, -0.5, -0.2, 0.5], [-0.2, 0.5, 0.25, 0.1], [0.25, 0.1, -0.2, -0.2], [-0.2, -0.2, 0.25, -0.5]],
    [[-0.25, -0.5, 0.25, 0.5], [0.25, -0.5, -0.25, 0.5]],
    [[0, -0.5, 0, 0.5], [0, 0.5, -0.27, 0.2], [0, 0.5, 0.27, 0.2]],
    [[-0.2, -0.5, -0.2, 0.5], [0.2, -0.5, 0.2, 0.5], [-0.2, 0.3, 0.2, -0.3]],
    [[0, -0.5, 0, 0.5], [0, 0.5, 0.3, 0.2], [0, -0.1, 0.3, -0.4]],
  ];
  const rune = (fr: any, g: number, size: number, color: string, strength: number) => {
    for (const [x1, z1, x2, z2] of GLYPHS[g % GLYPHS.length]) {
      const dx = (x2 - x1) * size;
      const dz = (z2 - z1) * size;
      const len = Math.hypot(dx, dz);
      const cx = ((x1 + x2) / 2) * size;
      const cz = ((z1 + z2) / 2) * size;
      const ang = Math.atan2(-dz, dx);
      put(boxG(len + 0.024, 0.02, 0.034), P.ironDark, fr.bone, lp(fr, cx, 0.003, cz), ryq(fr, ang));
      put(boxG(len, 0.012, 0.014), color, fr.bone, lp(fr, cx, 0.012, cz), ryq(fr, ang), 1, strength);
    }
  };

  // scar: dark gash with pale ridged edges, in the basis q
  const scarQ = (bone: any, pos: THREE.Vector3, q: THREE.Quaternion, len: number, ang: number) => {
    const rq = q.clone().multiply(rotQ("y", ang));
    put(boxG(len, 0.014, 0.04), P.scar, bone, pos, rq);
    for (const sg of [1, -1]) {
      const off = V(0, 0, sg * 0.03).applyQuaternion(rq);
      put(boxG(len * 0.94, 0.02, 0.012), P.bone, bone, pos.clone().add(off), rq);
    }
  };

  const tooth = (bone: any, base: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number) => {
    const d = dir.clone().normalize();
    put(coneG(rad, len, 5), P.tooth, bone, base.clone().addScaledVector(d, len / 2), aim(d));
  };

  // ---------- head profile functions (head-local f) ----------
  const sn = (f: number) => clamp01((f - 0.5) / 0.88);
  const wU = (f: number) => 0.56 - 0.14 * sn(f);
  const topU = (f: number) => 0.17 - 0.07 * sn(f);
  const wJ = (f: number) => 0.5 - 0.16 * clamp01((f - 0.3) / 1.0);
  const cranTop = (f: number) => 0.36 - (0.07 * (f + 0.15)) / 0.75;

  const BLADE = (k: number): any[] => [
    [0, -0.07 * k],
    [0.2 * k, -0.13 * k],
    [0.55 * k, -0.02 * k, "sharp"],
    [0.2 * k, 0.1 * k],
    [0, 0.07 * k],
  ];

  const jawPoses: any[] = [];

  function buildHead(c: any) {
    const H = c.head;
    const JW = c.jaw;
    const at0 = vec(H.at).clone();
    const F = vec(H.axis).clone().normalize();
    const Lf = V(0, 1, 0).cross(F).normalize();
    const Uu = F.clone().cross(Lf).normalize();
    const Rr = Lf.clone().negate();
    const qH = aim(F, Uu, "z");
    const pt = (r: number, u: number, f: number) =>
      at0.clone().addScaledVector(Rr, r).addScaledVector(Uu, u).addScaledVector(F, f);
    const dv = (r: number, u: number, f: number) => V().addScaledVector(Rr, r).addScaledVector(Uu, u).addScaledVector(F, f);
    const hput = (geo: THREE.BufferGeometry, color: string, p: number[], o: any = {}) =>
      put(geo, color, o.bone ?? H, pt(p[0], p[1], p[2]), o.q ?? qH, o.scale, o.glow ?? 0);

    // ===== neck =====
    const ns = c.ns;
    const path = catmull(
      [c.base, ns[1].at, ns[2].at, at0.clone().addScaledVector(F, 0.1)].map((p: any) => vec(p).toArray()),
    );
    const [ra, rb] = c.r;
    const sw: any = b.sweep(path, [ra, ra - (ra - rb) * 0.4, ra - (ra - rb) * 0.8, rb], {
      bone: [...ns, H],
      color: P.scaleMid,
      sides: 8,
      smooth: false,
      caps: { start: "flat", end: "flat" },
      sectors: [
        [-65, 65, P.scaleDark],
        [135, 225, P.bellyDark],
      ],
    });
    const sideAng = (t: number, outward: boolean) => ((sw.at(t, 80).n.x < 0) === outward ? 80 : -80);

    // ventral throat plates
    for (let i = 0; i < 8; i++) {
      const t = 0.1 + i * 0.105;
      const fr = sw.at(t, 180);
      const r = fr.radius;
      put(boxG(r * 0.95, 0.05, 0.145), P.bellyDark, fr.bone, lp(fr, 0, -0.012, 0), fr.quat);
      put(boxG(r * 0.8, 0.05, 0.105), P.belly, fr.bone, lp(fr, 0, 0.005, 0), fr.quat);
    }
    // flank plates
    for (const sg of [1, -1])
      for (let i = 0; i < 7; i++) {
        const fr = sw.at(0.1 + i * 0.12, sg * 70);
        put(boxG(0.16, 0.045, 0.12), P.scaleLight, fr.bone, lp(fr, 0, 0, 0), ryq(fr, sg * 0.3));
      }
    // dorsal spikes shrinking toward the head
    for (let i = 0; i < 9; i++) {
      const t = 0.06 + i * 0.1;
      const k = 1.15 - 0.07 * i;
      const fr = sw.at(t, 0);
      const lean = -0.35;
      const q = fr.quat.clone().multiply(rotQ("x", lean));
      put(coneG(0.055 * k, 0.24 * k, 4), P.bone, fr.bone, lp(fr, 0, 0.012 + 0.12 * k * Math.cos(lean), 0.12 * k * Math.sin(lean)), q, [1, 1, 0.55]);
      put(boxG(0.11 * k, 0.04, 0.14 * k), P.boneDark, fr.bone, lp(fr, 0, 0, 0), fr.quat);
    }
    // leather and iron collar mid-neck
    {
      const tc = 0.42;
      const cp = vec(path.at(tc)).clone();
      const ct = vec(path.tangentAt(tc)).clone();
      const rc = sw.at(tc, 0).radius * 1.1 + 0.04;
      const bone = sw.at(tc, 0).bone;
      const ring = b.ring(frame(cp, ct), { count: 12, radius: rc });
      b.sweep(catmull(ring.items, { closed: true }), 0.05, { color: P.iron, bone, sides: 6 });
      for (const dt of [-0.055, 0.055]) {
        const cp2 = vec(path.at(tc + dt)).clone();
        const ring2 = b.ring(frame(cp2, vec(path.tangentAt(tc + dt)).clone()), { count: 12, radius: rc - 0.012 });
        b.sweep(catmull(ring2.items, { closed: true }), 0.038, { color: P.leather, bone, sides: 6 });
      }
      ring.items.forEach((it: any, i: number) => {
        const p = vec(it.at).clone();
        const out = p.clone().sub(cp).normalize();
        if (i % 2 === 0) put(sphG(0.026, 5, 4), P.chain, bone, p.addScaledVector(out, 0.04), qH);
        if (i === 6) put(boxG(0.12, 0.1, 0.06), P.chain, bone, p.clone().addScaledVector(out, 0.03), aim(out, undefined, "z"));
      });
    }
    // runes down both sides
    const nR = c.id === "IR" ? 4 : 2;
    for (const out of [true, false])
      for (let i = 0; i < nR; i++) {
        const t = c.id === "IR" ? [0.14, 0.27, 0.74, 0.88][i] : [0.2, 0.7][i];
        rune(sw.at(t, sideAng(t, out)), i + (out ? 0 : 3), 0.13, c.rune, 1.3);
      }
    // neck scar
    {
      const t = c.id === "IR" ? 0.36 : 0.32;
      const fr = sw.at(t, sideAng(t, true) * 0.45);
      scarQ(fr.bone, lp(fr, 0, 0.003, 0), fr.quat, 0.36, 0.7);
    }

    if (c.id === "IR") {
      // snapped spear shaft in the neck
      const tS = 0.58;
      const fr = sw.at(tS, sideAng(tS, true));
      const n = vec(fr.axis).clone();
      const tan = vec(path.tangentAt(tS)).clone();
      const dir = n.clone().multiplyScalar(0.75).add(V(0, 0.55, 0)).addScaledVector(tan, -0.2).normalize();
      const p0 = vec(fr.at).clone().addScaledVector(n, -0.1);
      const len = 0.8;
      put(cylG(0.024, 0.03, len, 6), P.leather, fr.bone, p0.clone().addScaledVector(dir, len / 2), aim(dir));
      for (const k of [0.3, 0.47, 0.62])
        put(torG(0.03, 0.011, 4, 8), P.boneDark, fr.bone, p0.clone().addScaledVector(dir, len * k), aim(dir, undefined, "z"));
      put(coneG(0.03, 0.1, 5), P.bone, fr.bone, p0.clone().addScaledVector(dir, len + 0.04), aim(dir));
      put(coneG(0.012, 0.09, 3), P.bone, fr.bone, p0.clone().addScaledVector(dir, len - 0.02).addScaledVector(V(0, 0, 0.03), 1), aim(dir.clone().add(V(0.3, 0, 0.3))));
      put(cylG(0.1, 0.11, 0.02, 8), P.scar, fr.bone, vec(fr.at).clone().addScaledVector(n, 0.004), aim(n));
      // arrowhead embedded
      const tA = 0.3;
      const fa = sw.at(tA, sideAng(tA, true) * 0.55);
      const na = vec(fa.axis).clone();
      const da = na.clone().add(V(0, 0.25, 0)).normalize();
      const qa = aim(da);
      put(cylG(0.075, 0.085, 0.02, 8), P.scar, fa.bone, vec(fa.at).clone().addScaledVector(na, 0.004), aim(na));
      put(coneG(0.055, 0.17, 4), P.iron, fa.bone, vec(fa.at).clone().addScaledVector(da, 0.05), qa, [1, 1, 0.4]);
      for (const sg of [1, -1])
        put(coneG(0.02, 0.07, 3), P.ironDark, fa.bone, vec(fa.at).clone().addScaledVector(da, -0.0).addScaledVector(V(sg * 0.04, 0, 0), 1), aim(da.clone().add(V(sg * 0.7, 0, 0))));
      put(cylG(0.014, 0.014, 0.16, 5), P.leather, fa.bone, vec(fa.at).clone().addScaledVector(da, 0.12), qa);
    }

    // ===== skull =====
    b.frustumBox(pt(0, 0.05, -0.15), pt(0, 0.04, 0.6), [0.72, 0.62], [0.58, 0.5], { bone: H, color: P.scaleDark, name: `${c.id}.cranium` });
    b.frustumBox(pt(0, -0.04, -0.4), pt(0, -0.02, 0.15), [0.5, 0.5], [0.64, 0.54], { bone: H, color: P.scaleMid, name: `${c.id}.jowl` });
    b.frustumBox(pt(0, 0, 0.5), pt(0, -0.03, 1.38), [0.56, 0.34], [0.42, 0.26], { bone: H, color: P.scaleMid, name: `${c.id}.snout` });
    b.frustumBox(pt(0, topU(0.55) + 0.006, 0.55), pt(0, topU(1.3) + 0.006, 1.3), [0.34, 0.04], [0.24, 0.04], { bone: H, color: P.scaleLight, name: `${c.id}.bridge` });
    for (const sr of [1, -1]) {
      hput(boxG(0.05, 0.22, 0.3), P.scaleLight, [sr * 0.35, -0.02, 0.2]);
      hput(boxG(0.04, 0.12, 0.34), P.scaleDark, [sr * (wU(0.9) / 2 + 0.0), -0.08, 0.92]);
    }

    // upper mouth: gum and teeth
    hput(boxG(0.4, 0.045, 0.84), P.mouth, [0, -0.172, 0.92]);
    for (const sr of [1, -1]) {
      for (let k = 0; k < 10; k++) {
        const f = 0.6 + k * 0.075;
        const len = 0.07 + rnd() * 0.03 + (k % 3 === 0 ? 0.02 : 0);
        tooth(H, pt(sr * (wU(f) / 2) * 0.84, -0.18, f), dv(sr * 0.15, -1, 0.18), len, 0.026);
      }
      tooth(H, pt(sr * (wU(0.88) / 2) * 0.9, -0.18, 0.88), dv(sr * 0.1, -1, 0.1), 0.21, 0.043);
    }
    // lower jaw
    b.frustumBox(pt(0, -0.285, 0.3), pt(0, -0.305, 1.3), [0.5, 0.17], [0.34, 0.13], { bone: JW, color: P.scaleMid, name: `${c.id}.jaw` });
    hput(boxG(0.3, 0.03, 0.95), P.belly, [0, -0.385, 0.8], { bone: JW });
    hput(boxG(0.34, 0.03, 0.9), P.mouth, [0, -0.215, 0.78], { bone: JW });
    hput(boxG(0.17, 0.035, 0.7), P.scar, [0, -0.205, 0.8], { bone: JW });
    for (const sr of [1, -1]) {
      for (let k = 0; k < 8; k++) {
        const f = 0.5 + k * 0.1;
        tooth(JW, pt(sr * (wJ(f) / 2) * 0.7, -0.22, f), dv(-sr * 0.12, 1, 0.2), 0.065 + rnd() * 0.025, 0.024);
      }
      tooth(JW, pt(sr * (wJ(1.24) / 2) * 0.8, -0.22, 1.24), dv(sr * 0.05, 1, 0.3), 0.13, 0.033);
      hput(boxG(0.05, 0.1, 0.1), P.scaleLight, [sr * (wJ(0.5) / 2 + 0.01), -0.3, 0.55], { bone: JW });
    }
    for (const f of [0.5, 0.8, 1.05]) put(coneG(0.032, 0.13, 4), P.bone, JW, pt(0, -0.4, f), aim(dv(0, -1, 0.2)));

    // eyes, slits, brows
    for (const sr of [1, -1]) {
      const ec = [sr * 0.27, 0.15, 0.6];
      hput(sphG(0.105, 6, 5), P.scaleDark, [sr * 0.26, 0.15, 0.56]);
      hput(sphG(0.08, 8, 6), c.eye, ec, { glow: 1.6 });
      const out = dv(sr * 0.55, 0.05, 0.82).normalize();
      put(boxG(0.018, 0.11, 0.02), P.eyeSlit, H, pt(ec[0], ec[1], ec[2]).addScaledVector(out, 0.072), aim(out, Uu, "z"));
      hput(boxG(0.22, 0.075, 0.36), c.brow, [sr * 0.28, 0.26, 0.5], { q: qH.clone().multiply(rotQ("z", -sr * 0.38)) });
      put(coneG(0.04, 0.14, 4), c.brow, H, pt(sr * 0.38, 0.3, 0.36), aim(dv(sr * 0.6, 0.1, -1)));
      // nostrils
      hput(boxG(0.12, 0.08, 0.1), P.scaleDark, [sr * 0.1, 0.07, 1.32]);
      hput(sphG(0.03, 6, 4), c.nose, [sr * 0.1, 0.065, 1.375], { scale: [1, 0.8, 0.5], glow: 1.4 });
    }

    // horns
    const horn = (sr: number, pp: number[][], rad: number, o: any = {}) => {
      const k = c.hs * (sr < 0 ? 0.8 : 1);
      const q4 = pp.map(([r, u, f]) => pt(r * sr * k, u, f).toArray());
      const hp = bezier(q4[0], q4[1], q4[2], q4[3]);
      b.sweep(hp, [rad, o.stub ? rad * 0.8 : rad * 0.1], {
        bone: H,
        color: P.horn,
        bands: o.stub ? undefined : [[0.72, P.horn], [1, P.hornTip]],
        sides: 6,
        smooth: false,
        caps: { start: "flat", end: o.stub ? "flat" : "point" },
      });
      for (const t of o.band ?? []) {
        const p = vec(hp.at(t)).clone();
        const tg = vec(hp.tangentAt(t)).clone();
        const rr = rad * (1 - 0.9 * t);
        put(torG(rr + 0.008, 0.016, 4, 8), P.iron, H, p, aim(tg, undefined, "z"));
      }
      if (o.stub) {
        const p = vec(hp.at(1)).clone();
        const tg = vec(hp.tangentAt(1)).clone();
        put(cylG(rad * 0.95, rad * 0.95, 0.05, 7), P.rust, H, p.clone().addScaledVector(tg, 0.015), aim(tg));
        put(coneG(rad * 0.55, 0.1, 5), P.boneDark, H, p.clone().addScaledVector(tg, 0.08), aim(tg));
      }
    };
    if (c.id === "IR") {
      for (const sr of [1, -1]) {
        horn(sr, [[0.22, 0.3, 0.05], [0.36, 0.6, -0.1], [0.62, 0.8, -0.45], [0.95, 0.62, -0.85]], 0.07, { band: [0.25] });
        horn(sr, [[0.3, 0.2, -0.05], [0.5, 0.3, -0.12], [0.8, 0.28, -0.4], [1.0, 0.02, -0.8]], 0.055);
        horn(sr, [[0.12, 0.33, 0.0], [0.15, 0.55, -0.05], [0.2, 0.65, -0.25], [0.3, 0.72, -0.5]], 0.045);
      }
    } else {
      horn(1, [[0.24, 0.28, 0.0], [0.4, 0.5, -0.15], [0.65, 0.55, -0.5], [0.95, 0.3, -0.85]], 0.075, { band: [0.25, 0.5] });
      horn(1, [[0.3, 0.2, 0.0], [0.55, 0.2, -0.1], [0.8, 0.05, -0.35], [1.0, -0.2, -0.55]], 0.05);
      horn(-1, [[0.24, 0.28, 0.0], [0.36, 0.45, -0.08], [0.46, 0.6, -0.17], [0.5, 0.66, -0.25]], 0.078, { stub: true });
    }

    // cheek frill of extruded blades
    const azs = c.id === "IR" ? [20, 45, 70] : [25, 60];
    const kk = c.id === "IR" ? 1 : 0.8;
    for (const sr of [1, -1])
      azs.forEach((az, i) => {
        const a = az * DEG;
        const e = (i - (azs.length - 1) / 2) * 0.45;
        const dh = F.clone().multiplyScalar(-Math.cos(a)).addScaledVector(Rr, sr * Math.sin(a));
        const dir = dh.multiplyScalar(Math.cos(e)).addScaledVector(Uu, Math.sin(e)).normalize();
        const yv = Uu.clone().addScaledVector(dir, -Uu.dot(dir)).normalize();
        b.extrude(BLADE([0.5, 0.58, 0.46][i % 3] * kk * 1.8), {
          at: pt(sr * 0.3, 0.0 + 0.04 * i, 0.12),
          x: dir.toArray(),
          y: yv.toArray(),
          thickness: 0.035,
          bevel: 0.008,
          color: c.id === "IR" ? (i % 2 ? P.boneDark : P.scaleLight) : i % 2 ? P.boneDark : P.bone,
          bone: H,
        });
      });

    // ===== identity details =====
    if (c.id === "IR") {
      // venom rim along both jaws
      for (const sr of [1, -1]) {
        glow(b.rod(pt(sr * (wU(0.6) / 2 + 0.005), -0.15, 0.6), pt(sr * (wU(1.3) / 2 + 0.005), -0.15, 1.3), 0.012, P.venom, { bone: H, sides: 4 }), 1.3);
        glow(b.rod(pt(sr * (wJ(0.4) / 2 + 0.005), -0.23, 0.4), pt(sr * (wJ(1.2) / 2 + 0.005), -0.25, 1.2), 0.012, P.venom, { bone: JW, sides: 4 }), 1.3);
      }
      // scar slashes across the muzzle
      [[0.78, 0.7], [0.98, -0.6], [1.14, 0.55]].forEach(([f, a]) =>
        scarQ(H, pt(0, topU(f) + 0.03, f), qH, 0.3, a),
      );
      // cranium plate ridge
      for (let i = 0; i < 4; i++) {
        const f = 0.0 + i * 0.15;
        hput(boxG(0.16 - i * 0.02, 0.04, 0.12), P.scaleLight, [0, cranTop(f) + 0.005, f], { q: qH.clone().multiply(rotQ("x", 0.15)) });
      }
      // cheek scar
      scarQ(H, pt(0.3, 0.05, 0.45), qH.clone().multiply(rotQ("z", Math.PI / 2)), 0.3, 0.5);
    } else {
      // iron muzzle cage
      for (const f of [0.72, 1.0, 1.26]) {
        const w = wU(f);
        hput(boxG(w + 0.07, 0.04, 0.1), P.iron, [0, topU(f) + 0.012, f]);
        for (const sr of [1, -1]) {
          hput(boxG(0.04, topU(f) + 0.13, 0.1), P.iron, [sr * (w / 2 + 0.015), (topU(f) - 0.13) / 2, f]);
          hput(sphG(0.02, 5, 4), P.chain, [sr * (w / 2 + 0.04), 0.02, f]);
          hput(sphG(0.02, 5, 4), P.chain, [sr * 0.09, topU(f) + 0.034, f]);
        }
      }
      b.frustumBox(pt(0, topU(0.6) + 0.045, 0.6), pt(0, topU(1.3) + 0.045, 1.3), [0.07, 0.035], [0.07, 0.035], { bone: H, color: P.ironDark });
      // chains dangling from the muzzle band
      for (const sr of [1, -1]) {
        const rr = sr * (wU(1.26) / 2 + 0.015);
        for (let k = 0; k < 6; k++)
          hput(torG(0.03, 0.009, 5, 8), P.chain, [rr, -0.17 - 0.055 * k, 1.26], { q: qH.clone().multiply(rotQ("y", k % 2 ? Math.PI / 2 : 0)), scale: [1, 1.4, 1] });
        put(coneG(0.03, 0.08, 4), P.iron, H, pt(rr, -0.17 - 0.055 * 6 - 0.03, 1.26), aim(dv(0, -1, 0)));
      }
      // bone-plated skull crest
      for (let i = 0; i < 6; i++) {
        const f = -0.08 + i * 0.11;
        hput(boxG(0.5 - 0.035 * i, 0.05, 0.2), i % 2 ? P.boneDark : P.bone, [0, cranTop(f) + 0.02 + 0.014 * i, f], { q: qH.clone().multiply(rotQ("x", 0.21)) });
      }
      // long jagged tusks
      for (const sr of [1, -1]) {
        const tp = bezier(
          pt(sr * 0.2, -0.14, 1.05).toArray(),
          pt(sr * 0.3, -0.3, 1.1).toArray(),
          pt(sr * 0.33, -0.5, 1.2).toArray(),
          pt(sr * 0.27, -0.62, 1.45).toArray(),
        );
        b.sweep(tp, [0.05, 0.0], { bone: H, color: P.bone, sides: 5, smooth: false, caps: { start: "flat", end: "point" } });
        for (const t of [0.35, 0.6]) {
          const p = vec(tp.at(t)).clone();
          put(coneG(0.022, 0.07, 4), P.boneDark, H, p.clone().addScaledVector(Rr, sr * 0.04), aim(dv(sr * 0.8, -0.3, -0.4)));
        }
      }
    }
  }

  buildHead({
    id: "IR",
    head: J.headIR,
    jaw: J.jawIR,
    ns: [J.neckIR1, J.neckIR2, J.neckIR3],
    base: M.neckBaseIR,
    r: [0.42, 0.3],
    eye: P.venom,
    nose: P.venom,
    rune: P.venom,
    brow: P.boneDark,
    hs: 1.0,
  });
  buildHead({
    id: "OR",
    head: J.headOR,
    jaw: J.jawOR,
    ns: [J.neckOR1, J.neckOR2, J.neckOR3],
    base: M.neckBaseOR,
    r: [0.38, 0.27],
    eye: P.emberHot,
    nose: P.ember,
    rune: P.ember,
    brow: P.bone,
    hs: 0.6,
  });

  flush();

  // rest pose: lower jaws hang about 8 degrees below the upper
  for (const [jaw, head] of [
    [J.jawIR, J.headIR],
    [J.jawOR, J.headOR],
  ]) {
    const F = vec(head.axis).clone().normalize();
    const Lf = V(0, 1, 0).cross(F).normalize();
    b.pose(jaw, { axis: Lf.toArray(), deg: 8 });
  }
  void jawPoses;
}
    return buildHeadsRight;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hydraOfTheBrokenMere" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,2.2,-1.1], dir: [0,0,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["hips"], at: [0,2.4,0.9], dir: [0,0.15,1], role: "spine" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,2,-2.5], dir: [0,-0.2,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.7,-3.6], dir: [0,-0.35,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.3,-4.7], dir: [0,-0.4,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,0.8,-5.7], dir: [0,-0.4,-1], role: "tail", group: "tail" });
  J["tail5"] = b.joint("tail5", { parent: J["tail4"], at: [0,0.4,-6.5], dir: [0,-0.1,-1], role: "tail", group: "tail" });
  J["hipBL"] = b.joint("hipBL", { parent: J["hips"], at: [1.2,2.1,-1.5], dir: [0.15,-0.7,0.7], role: "leg", group: "legBL" });
  J["kneeBL"] = b.joint("kneeBL", { parent: J["hipBL"], at: [1.45,1.3,-0.8], dir: [0,-0.5,-1], role: "leg", group: "legBL" });
  J["hockBL"] = b.joint("hockBL", { parent: J["kneeBL"], at: [1.4,0.8,-1.9], dir: [0,-1,0.5], role: "leg", group: "legBL" });
  J["footBL"] = b.joint("footBL", { parent: J["hockBL"], at: [1.4,0.2,-1.4], dir: [0,0,1], role: "leg", group: "legBL" });
  J["hipBR"] = b.joint("hipBR", { parent: J["hips"], at: [-1.2,2.1,-1.5], dir: [-0.15,-0.7,0.7], role: "leg", group: "legBR" });
  J["kneeBR"] = b.joint("kneeBR", { parent: J["hipBR"], at: [-1.45,1.3,-0.8], dir: [0,-0.5,-1], role: "leg", group: "legBR" });
  J["hockBR"] = b.joint("hockBR", { parent: J["kneeBR"], at: [-1.4,0.8,-1.9], dir: [0,-1,0.5], role: "leg", group: "legBR" });
  J["footBR"] = b.joint("footBR", { parent: J["hockBR"], at: [-1.4,0.2,-1.4], dir: [0,0,1], role: "leg", group: "legBR" });
  J["shoulderFL"] = b.joint("shoulderFL", { parent: J["chest"], at: [1.3,2.3,1.5], dir: [0.1,-1,-0.2], role: "leg", group: "legFL" });
  J["elbowFL"] = b.joint("elbowFL", { parent: J["shoulderFL"], at: [1.55,1.4,1.2], dir: [0,-1,0.5], role: "leg", group: "legFL" });
  J["wristFL"] = b.joint("wristFL", { parent: J["elbowFL"], at: [1.6,0.7,1.7], dir: [0,-1,0.3], role: "leg", group: "legFL" });
  J["handFL"] = b.joint("handFL", { parent: J["wristFL"], at: [1.6,0.15,2], dir: [0,0,1], role: "leg", group: "legFL" });
  J["shoulderFR"] = b.joint("shoulderFR", { parent: J["chest"], at: [-1.3,2.3,1.5], dir: [-0.1,-1,-0.2], role: "leg", group: "legFR" });
  J["elbowFR"] = b.joint("elbowFR", { parent: J["shoulderFR"], at: [-1.55,1.4,1.2], dir: [0,-1,0.5], role: "leg", group: "legFR" });
  J["wristFR"] = b.joint("wristFR", { parent: J["elbowFR"], at: [-1.6,0.7,1.7], dir: [0,-1,0.3], role: "leg", group: "legFR" });
  J["handFR"] = b.joint("handFR", { parent: J["wristFR"], at: [-1.6,0.15,2], dir: [0,0,1], role: "leg", group: "legFR" });
  J["neckC1"] = b.joint("neckC1", { parent: J["chest"], at: [0,3,1.7], dir: [0,0.8,0.55], role: "neck", group: "headC" });
  J["neckC2"] = b.joint("neckC2", { parent: J["neckC1"], at: [0,3.9,2.15], dir: [0,0.9,0.3], role: "neck", group: "headC" });
  J["neckC3"] = b.joint("neckC3", { parent: J["neckC2"], at: [0,4.9,2.25], dir: [0,0.6,0.5], role: "neck", group: "headC" });
  J["headC"] = b.joint("headC", { parent: J["neckC3"], at: [0,5.6,2.6], dir: [0,-0.15,1], role: "head", group: "headC" });
  J["jawC"] = b.joint("jawC", { parent: J["headC"], at: [0,5.35,3.05], dir: [0,-0.1,1], role: "jaw", group: "headC" });
  J["neckIL1"] = b.joint("neckIL1", { parent: J["chest"], at: [0.7,3,1.6], dir: [0.25,0.8,0.5], role: "neck", group: "headIL" });
  J["neckIL2"] = b.joint("neckIL2", { parent: J["neckIL1"], at: [1.2,3.8,2.1], dir: [0.3,0.8,0.4], role: "neck", group: "headIL" });
  J["neckIL3"] = b.joint("neckIL3", { parent: J["neckIL2"], at: [1.6,4.6,2.5], dir: [0.15,0.6,0.6], role: "neck", group: "headIL" });
  J["headIL"] = b.joint("headIL", { parent: J["neckIL3"], at: [1.75,5.1,3], dir: [0.1,-0.2,1], role: "head", group: "headIL" });
  J["jawIL"] = b.joint("jawIL", { parent: J["headIL"], at: [1.75,4.9,3.35], dir: [0.1,-0.1,1], role: "jaw", group: "headIL" });
  J["neckIR1"] = b.joint("neckIR1", { parent: J["chest"], at: [-0.7,3,1.6], dir: [-0.25,0.8,0.5], role: "neck", group: "headIR" });
  J["neckIR2"] = b.joint("neckIR2", { parent: J["neckIR1"], at: [-1.2,3.8,2.1], dir: [-0.3,0.8,0.4], role: "neck", group: "headIR" });
  J["neckIR3"] = b.joint("neckIR3", { parent: J["neckIR2"], at: [-1.6,4.6,2.5], dir: [-0.15,0.6,0.6], role: "neck", group: "headIR" });
  J["headIR"] = b.joint("headIR", { parent: J["neckIR3"], at: [-1.75,5.1,3], dir: [-0.1,-0.2,1], role: "head", group: "headIR" });
  J["jawIR"] = b.joint("jawIR", { parent: J["headIR"], at: [-1.75,4.9,3.35], dir: [-0.1,-0.1,1], role: "jaw", group: "headIR" });
  J["neckOL1"] = b.joint("neckOL1", { parent: J["chest"], at: [1.1,2.9,1.3], dir: [0.6,0.5,0.5], role: "neck", group: "headOL" });
  J["neckOL2"] = b.joint("neckOL2", { parent: J["neckOL1"], at: [2,3.4,1.8], dir: [0.5,0.6,0.5], role: "neck", group: "headOL" });
  J["neckOL3"] = b.joint("neckOL3", { parent: J["neckOL2"], at: [2.6,4,2.4], dir: [0.2,0.4,0.8], role: "neck", group: "headOL" });
  J["headOL"] = b.joint("headOL", { parent: J["neckOL3"], at: [2.85,4.3,2.95], dir: [0.15,-0.45,1], role: "head", group: "headOL" });
  J["jawOL"] = b.joint("jawOL", { parent: J["headOL"], at: [2.9,4.05,3.3], dir: [0.15,-0.35,1], role: "jaw", group: "headOL" });
  J["neckOR1"] = b.joint("neckOR1", { parent: J["chest"], at: [-1.1,2.9,1.3], dir: [-0.6,0.5,0.5], role: "neck", group: "headOR" });
  J["neckOR2"] = b.joint("neckOR2", { parent: J["neckOR1"], at: [-2,3.4,1.8], dir: [-0.5,0.6,0.5], role: "neck", group: "headOR" });
  J["neckOR3"] = b.joint("neckOR3", { parent: J["neckOR2"], at: [-2.6,4,2.4], dir: [-0.2,0.4,0.8], role: "neck", group: "headOR" });
  J["headOR"] = b.joint("headOR", { parent: J["neckOR3"], at: [-2.85,4.3,2.95], dir: [-0.15,-0.45,1], role: "head", group: "headOR" });
  J["jawOR"] = b.joint("jawOR", { parent: J["headOR"], at: [-2.9,4.05,3.3], dir: [-0.15,-0.35,1], role: "jaw", group: "headOR" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
