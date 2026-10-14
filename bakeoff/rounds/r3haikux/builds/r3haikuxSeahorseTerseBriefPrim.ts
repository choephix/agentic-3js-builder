import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Seahorse",
  description:
    "A stylised seahorse: a ringed armour trunk with a brood pouch, a curled tail, a coronet crest, fan fins and a hinged snout, rigged on a joint skeleton.",
};

type V = [number, number, number];

const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const scale = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => scale(a, 1 / len(a));
const midOf = (a: V, c: V): V => scale(add(a, c), 0.5);

// Tangent of a polyline at index k (one-sided at the ends).
const tangentAt = (pts: V[], k: number): V =>
  sub(pts[Math.min(k + 1, pts.length - 1)], pts[Math.max(k - 1, 0)]);

// Outward back normal of the trunk. The trunk lies in the Y/Z plane and its back faces -Z.
const backNormal = (prev: V, next: V): V => {
  const t = unit(sub(next, prev));
  return unit([0, t[2], -t[1]]);
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  type J = ReturnType<typeof b.joint>;

  const BODY = "#f2934e";
  const JAW = "#e5783a";
  const GOLD = "#ffd166";
  const CREAM = "#fff1cf";
  const FIN = "#ff6f91";
  const SPOT = "#b5452b";
  const INK = "#2b2540";

  // ---- primitives, each placed on a bone -----------------------------------

  // Flat-ended cylinder from a to c.
  const segment = (a: V, c: V, r: number, color: string, bone: J) => {
    const d = sub(c, a);
    b.part(new THREE.CylinderGeometry(r, r, len(d), 7), color, {
      at: midOf(a, c),
      dir: unit(d),
      bone,
    });
  };

  // Rounded tube from a to c (the capsule ends meet the two points).
  const tube = (a: V, c: V, r: number, color: string, bone: J) => {
    const d = sub(c, a);
    b.part(new THREE.CapsuleGeometry(r, Math.max(0.001, len(d) - 2 * r), 2, 6), color, {
      at: midOf(a, c),
      dir: unit(d),
      bone,
    });
  };

  // Tapered cylinder: radius ra at a, radius rc at c.
  const taper = (a: V, c: V, ra: number, rc: number, color: string, bone: J) => {
    const d = sub(c, a);
    b.part(new THREE.CylinderGeometry(rc, ra, len(d), 8), color, {
      at: midOf(a, c),
      dir: unit(d),
      bone,
    });
  };

  // Short disc (ring plate) centred at c, normal along t.
  const plate = (c: V, t: V, r: number, h: number, color: string, bone: J) => {
    b.part(new THREE.CylinderGeometry(r, r, h, 9), color, { at: c, dir: unit(t), bone });
  };

  // Cone standing on base and pointing along dir.
  const spike = (base: V, dir: V, L: number, r: number, color: string, bone: J) => {
    const n = unit(dir);
    b.part(new THREE.ConeGeometry(r, L, 6), color, {
      at: add(base, scale(n, L / 2)),
      dir: n,
      bone,
    });
  };

  // Sphere stretched to ellipsoid radii.
  const blob = (c: V, radii: V, color: string, bone: J) => {
    const g = new THREE.SphereGeometry(1, 10, 7);
    g.scale(radii[0], radii[1], radii[2]);
    b.part(g, color, { at: c, bone });
  };

  // Double-sided flat fan from base. The rim lists offsets from base, in order around the edge.
  const fan = (base: V, rim: V[], color: string, bone: J) => {
    const pos: number[] = [];
    const O: V = [0, 0, 0];
    for (let i = 0; i < rim.length - 1; i++) {
      pos.push(...O, ...rim[i], ...rim[i + 1]);
      pos.push(...O, ...rim[i + 1], ...rim[i]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    b.part(g, color, { at: base, bone });
  };

  // ---- key points (metres, +Y up, the face points +Z) -----------------------
  const pHips: V = [0, 0.118, 0];
  const pS1: V = [0, 0.15, 0.01];
  const pS2: V = [0, 0.184, 0.028];
  const pS3: V = [0, 0.213, 0.052];
  const pNeck: V = [0, 0.236, 0.074];
  const pHead: V = [0, 0.272, 0.1];

  // ---- skeleton --------------------------------------------------------------
  const hips = b.joint("hips", { at: pHips });
  const spine1 = b.joint("spine1", { at: pS1, parent: hips });
  const spine2 = b.joint("spine2", { at: pS2, parent: spine1 });
  const spine3 = b.joint("spine3", { at: pS3, parent: spine2 });
  const neck = b.joint("neck", { at: pNeck, parent: spine3 });
  const head = b.joint("head", { at: pHead, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.258, 0.116], parent: head });

  // Tail: a spiral curled under the belly, one joint per armoured ring.
  const coil: [number, number] = [0.062, -0.028]; // coil centre, in (y, z)
  const tubeR = (k: number) => 0.011 - 0.0006 * k;
  const tailP: V[] = [pHips];
  for (let k = 1; k <= 11; k++) {
    const th = 0.4636 - 0.857 * k;
    const r = 0.0626 - 0.0045 * k;
    tailP.push([0, coil[0] + r * Math.cos(th), coil[1] + r * Math.sin(th)]);
  }
  // Lower the coil so its lowest ring sits on the floor.
  let lift = Infinity;
  for (let k = 1; k <= 11; k++) lift = Math.min(lift, tailP[k][1] - (tubeR(k) + 0.0035));
  for (let k = 1; k <= 11; k++) tailP[k][1] -= lift;

  const tailJ: J[] = [hips];
  for (let k = 1; k <= 11; k++) {
    tailJ.push(b.joint(`tail${k}`, { at: tailP[k], parent: tailJ[k - 1] }));
  }

  // ---- trunk ----------------------------------------------------------------
  const trunk: V[] = [pHips, pS1, pS2, pS3, pNeck, pHead];
  const trunkJ: J[] = [hips, spine1, spine2, spine3, neck];
  const trunkR = [0.019, 0.021, 0.022, 0.0185, 0.0155];
  const ringR = [0.0225, 0.0245, 0.0255, 0.0255, 0.0205];
  for (let i = 0; i < 5; i++) {
    segment(trunk[i], trunk[i + 1], trunkR[i], BODY, trunkJ[i]);
    plate(trunk[i], tangentAt(trunk, i), ringR[i], 0.008, GOLD, trunkJ[i]);
  }
  // Rounded pelvis where the tail leaves the body.
  blob(pHips, [0.019, 0.019, 0.019], BODY, hips);
  // Brood pouch on the front of the abdomen.
  blob([0, 0.164, 0.036], [0.0136, 0.02, 0.0096], CREAM, spine1);

  // ---- tail -----------------------------------------------------------------
  for (let k = 1; k <= 11; k++) {
    tube(tailP[k - 1], tailP[k], (tubeR(k - 1) + tubeR(k)) / 2, BODY, tailJ[k - 1]);
    plate(tailP[k], tangentAt(tailP, k), tubeR(k) + 0.0035, 0.006, k % 2 ? GOLD : CREAM, tailJ[k]);
  }

  // ---- head -----------------------------------------------------------------
  blob(pHead, [0.0241, 0.028, 0.0322], BODY, head);
  // Long tubular snout, with a separate lower jaw hinged at the back.
  taper([0, 0.265, 0.112], [0, 0.252, 0.182], 0.0118, 0.0068, BODY, head);
  taper([0, 0.2565, 0.114], [0, 0.2455, 0.178], 0.0092, 0.0045, JAW, jaw);
  blob([0, 0.2515, 0.1835], [0.0036, 0.0036, 0.0036], INK, head);
  // Big side eyes with dark pupils.
  for (const s of [1, -1]) {
    blob([s * 0.0205, 0.279, 0.1], [0.0092, 0.0092, 0.0092], CREAM, head);
    blob([s * 0.0292, 0.2795, 0.1035], [0.0052, 0.0052, 0.0052], INK, head);
  }
  // Coronet: three gold spikes swept back over the crown.
  spike([0, 0.289, 0.074], [0, 0.72, -0.69], 0.021, 0.0055, GOLD, head);
  spike([0, 0.293, 0.086], [0, 0.86, -0.5], 0.026, 0.006, GOLD, head);
  spike([0, 0.292, 0.1], [0, 0.97, -0.2], 0.02, 0.0052, GOLD, head);

  // ---- back spines ------------------------------------------------------------
  const nA = backNormal(pHips, pS2);
  spike(add(pS1, scale(nA, 0.016)), nA, 0.016, 0.0045, GOLD, spine1);
  const nB = backNormal(pS2, pNeck);
  spike(add(pS3, scale(nB, 0.018)), nB, 0.017, 0.0048, GOLD, spine3);
  const nC = backNormal(pS3, pHead);
  spike(add(pNeck, scale(nC, 0.014)), nC, 0.013, 0.004, GOLD, neck);

  // ---- dorsal fin: a sail on the back, following the trunk ------------------
  const tS2 = unit(sub(pS3, pS1));
  const nS2 = backNormal(pS1, pS3);
  const dorsalBase = add(pS2, scale(nS2, 0.022));
  const dorsal = b.joint("dorsal", { at: dorsalBase, parent: spine2 });
  const onFin = (u: number, out: number): V => add(scale(tS2, u), scale(nS2, out));
  fan(
    dorsalBase,
    [
      onFin(-0.014, 0.004),
      onFin(-0.01, 0.016),
      onFin(0.002, 0.03),
      onFin(0.016, 0.036),
      onFin(0.026, 0.028),
      onFin(0.034, 0.012),
      onFin(0.03, 0.0),
    ],
    FIN,
    dorsal,
  );

  // ---- pectoral fans on each side, splaying outward as they trail back ------
  for (const s of [1, -1]) {
    const base: V = [s * 0.024, 0.214, 0.046];
    const finJ = b.joint(s > 0 ? "finL" : "finR", { at: base, parent: spine3 });
    const edge: [number, number][] = [
      [0.011, -0.006],
      [0.006, -0.02],
      [-0.008, -0.03],
      [-0.021, -0.027],
      [-0.024, -0.011],
    ];
    fan(base, edge.map(([dy, dz]): V => [s * (-0.002 - 0.5 * dz), dy, dz]), FIN, finJ);
  }

  // ---- rust spots down the flanks ---------------------------------------------
  const flank: [number, number, number, J][] = [
    [0.0175, 0.128, 0.003, hips],
    [0.0205, 0.17, 0.0206, spine1],
    [0.0215, 0.196, 0.038, spine2],
    [0.0195, 0.225, 0.0634, spine3],
  ];
  for (const [x, y, z, j] of flank) {
    for (const s of [1, -1]) blob([s * x, y, z], [0.0034, 0.0034, 0.0034], SPOT, j);
  }

  return b.root;
}
