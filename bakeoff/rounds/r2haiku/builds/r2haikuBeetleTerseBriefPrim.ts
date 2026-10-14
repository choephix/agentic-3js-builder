import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "stag beetle",
  description:
    "Male stag beetle at real size (about 5 cm with mandibles), stylised from primitives: glossy shell, branching jaws, elbowed antennae and six jointed legs.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "stag-beetle" });
  type Joint = ReturnType<typeof b.joint>;

  const ELYTRA = "#6b3414";
  const ELYTRA_SHEEN = "#8a4a22";
  const SHELL = "#3b2216";
  const DARK = "#1d1410";
  const JAW = "#2a1d14";
  const EYE = "#0b0806";
  const GLINT = "#f4e6c4";

  // Tapered segment from a to c, its +Y axis aimed at c.
  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone: Joint) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const at: V = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    b.part(new THREE.CylinderGeometry(r1, r0, len, 6), color, { at, aim: c, bone });
  };

  // Ellipsoid centred on p with semi-axes rad.
  const ball = (p: V, rad: V, color: string, bone: Joint) => {
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(rad[0], rad[1], rad[2]);
    b.part(g, color, { at: p, bone });
  };

  const box = (p: V, size: V, color: string, bone: Joint) => {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: p, bone });
  };

  // Skeleton: body is the root, head and jaws hang from it.
  const body = b.joint("body", { at: [0, 0.0105, 0] });
  const head = b.joint("head", { at: [0, 0.0105, 0.0235], parent: body });

  // Wing cases, shield and seam.
  box([0, 0.0195, -0.0075], [0.0007, 0.0009, 0.0345], ELYTRA, body);
  ball([0, 0.0128, 0.0105], [0.0085, 0.0062, 0.0075], SHELL, body);
  seg([0, 0.0170, 0.0130], [0, 0.0205, 0.0165], 0.0016, 0.0002, SHELL, body);

  // Head block and clypeus.
  box([0, 0.0105, 0.0235], [0.0095, 0.0062, 0.0075], DARK, head);
  ball([0, 0.0100, 0.0275], [0.0045, 0.0030, 0.0018], DARK, head);

  // Everything paired: +X is the left side, -X the right.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): V => [s * x, y, z];

    // Elytron and its lighter sheen.
    ball(P(0.0050, 0.0115, -0.0075), [0.0058, 0.0085, 0.0175], ELYTRA, body);
    ball(P(0.0050, 0.0200, -0.0100), [0.0030, 0.0004, 0.0070], ELYTRA_SHEEN, body);

    // Eyes with a small glint.
    ball(P(0.0046, 0.0118, 0.0270), [0.0011, 0.0011, 0.0011], EYE, head);
    ball(P(0.0050, 0.0122, 0.0282), [0.0003, 0.0003, 0.0003], GLINT, head);

    // Elbowed antenna with a club tip.
    const antBase = P(0.0022, 0.0122, 0.0285);
    const antElbow = P(0.0045, 0.0132, 0.0315);
    const antTip = P(0.0062, 0.0118, 0.0340);
    const antenna = b.joint(`antenna${side}`, { at: antBase, parent: head });
    const elbow = b.joint(`antennaElbow${side}`, { at: antElbow, parent: antenna });
    seg(antBase, antElbow, 0.0006, 0.0005, DARK, antenna);
    seg(antElbow, antTip, 0.0005, 0.0004, DARK, elbow);
    ball(antTip, [0.0013, 0.0008, 0.0013], DARK, elbow);

    // Mandible: a hinged, curved blade with an inward tooth.
    const jawA = P(0.0025, 0.0102, 0.0275);
    const jawB = P(0.0055, 0.0102, 0.0400);
    const jawC = P(0.0045, 0.0102, 0.0530);
    const mandible = b.joint(`mandible${side}`, { at: jawA, parent: head });
    seg(jawA, jawB, 0.0017, 0.0013, JAW, mandible);
    seg(jawB, jawC, 0.0013, 0.0004, JAW, mandible);
    seg(P(0.0052, 0.0102, 0.0395), P(0.0034, 0.0102, 0.0430), 0.0009, 0.0001, JAW, mandible);

    // Six jointed legs: front, middle, hind.
    const legs = [
      { n: "F", hip: [0.0072, 0.0108, 0.0108], knee: [0.0150, 0.0068, 0.0135], ankle: [0.0180, 0.0030, 0.0165], tip: [0.0190, 0.0, 0.0190] },
      { n: "M", hip: [0.0072, 0.0100, -0.0015], knee: [0.0158, 0.0068, -0.0010], ankle: [0.0185, 0.0030, -0.0030], tip: [0.0195, 0.0, -0.0055] },
      { n: "H", hip: [0.0068, 0.0102, -0.0125], knee: [0.0150, 0.0068, -0.0150], ankle: [0.0178, 0.0030, -0.0185], tip: [0.0190, 0.0, -0.0215] },
    ];

    for (const leg of legs) {
      const h = P(leg.hip[0], leg.hip[1], leg.hip[2]);
      const k = P(leg.knee[0], leg.knee[1], leg.knee[2]);
      const a = P(leg.ankle[0], leg.ankle[1], leg.ankle[2]);
      const t = P(leg.tip[0], leg.tip[1], leg.tip[2]);

      const hip = b.joint(`hip${side}${leg.n}`, { at: h, parent: body });
      const knee = b.joint(`knee${side}${leg.n}`, { at: k, parent: hip });
      const ankle = b.joint(`ankle${side}${leg.n}`, { at: a, parent: knee });

      ball(h, [0.0016, 0.0016, 0.0016], DARK, hip);
      seg(h, k, 0.0011, 0.0009, DARK, hip);
      seg(k, a, 0.0009, 0.0007, DARK, knee);
      seg(a, t, 0.0007, 0.0004, DARK, ankle);
      seg(t, P(leg.tip[0] + 0.0004, 0.0009, leg.tip[2]), 0.0003, 0.00015, DARK, ankle);
    }
  }

  return b.root;
}
