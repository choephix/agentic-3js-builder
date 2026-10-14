import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  mottle,
  offset,
  paint,
  polyline,
  rng,
  spots,
  stripes,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Pufferfish",
  description:
    "An inflated, spiny pufferfish: round olive body with saddles and dark spots, cream belly, big golden eyes with radiating eye-lines, orange lips and a four-tooth beak on a hinged jaw, ray-painted fins, and a prickle coat. Rigged with a spine, tail and caudal chain, head, jaw and pectoral fin joints.",
};

type V3 = [number, number, number];

const C = {
  backA: "#bdb44a",
  backB: "#8ea33f",
  saddle: "#5b6a28",
  spot: "#24300e",
  bellyA: "#f7f0d0",
  bellyB: "#e9dfb2",
  spineTop: "#e4d890",
  spineLow: "#faf3da",
  lip: "#ee8c4c",
  teeth: "#f8f2e0",
  mouth: "#42160f",
  eye: "#241707",
  lid: "#7d8a2e",
  gill: "#3c4416",
  ray: "#4d4c1c",
  finInner: "#ef9f34",
  finMid: "#f7d56e",
  finTip: "#fcefb0",
  finRay: "#cf8326",
  finEdge: "#8a6420",
};

const v3 = (p: any): THREE.Vector3 =>
  Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : new THREE.Vector3(p.x, p.y, p.z);

function must<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`pufferfish: no surface hit for ${what}`);
  return v;
}

const unit = (x: number, y: number, z: number): V3 => {
  const v = new THREE.Vector3(x, y, z).normalize();
  return [v.x, v.y, v.z];
};

const ortho = (xd: V3, yd: V3): V3 => {
  const x = new THREE.Vector3(...xd);
  const y = new THREE.Vector3(...yd);
  y.addScaledVector(x, -y.dot(x)).normalize();
  return [y.x, y.y, y.z];
};

const thickOf = (xd: V3, yd: V3): THREE.Vector3 =>
  new THREE.Vector3(...xd).cross(new THREE.Vector3(...yd)).normalize();

const hash = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Fin paint: golden root fading to a pale tip, dark rays fanning from the root, dark rim on the walls.
interface FinPaintOpts {
  rays: number;
  reach: number;
  thick: THREE.Vector3;
  cx?: number;
  cy?: number;
}
const finPaint = ({ rays, reach, thick, cx = 0, cy = 0 }: FinPaintOpts) =>
  paint((_p, n, s) => {
    if (Math.abs(n.dot(thick)) < 0.5) return C.finEdge;
    const dx = s[0] - cx;
    const dy = s[1] - cy;
    const r = Math.hypot(dx, dy);
    const k = (Math.atan2(dy, dx) / Math.PI) * rays;
    const f = k - Math.floor(k);
    if (f < 0.24 && r > reach * 0.12) return C.finRay;
    if (r < reach * 0.4) return C.finInner;
    if (r > reach * 0.82) return C.finTip;
    return C.finMid;
  });

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="49" fill="#241707"/>
<circle cx="50" cy="50" r="43" fill="#f7d44c"/>
<circle cx="50" cy="50" r="43" fill="none" stroke="#ec9a2a" stroke-width="7"/>
<circle cx="50" cy="50" r="30" fill="#f2b630"/>
<circle cx="50" cy="50" r="22" fill="#0c0704"/>
<ellipse cx="40" cy="38" rx="9" ry="8" fill="#ffffff"/>
<circle cx="61" cy="62" r="4" fill="#ffffff"/>
</svg>`;

function rayMarkup(): string {
  const N = 17;
  let body = "";
  const pt = (ang: number, r: number) =>
    `${(50 + Math.cos(ang) * r).toFixed(2)},${(50 + Math.sin(ang) * r).toFixed(2)}`;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + 0.1;
    const hw = 0.15;
    const r0 = 17;
    const r1 = i % 2 === 0 ? 49 : 40;
    body += `<polygon points="${pt(a - hw, r0)} ${pt(a, r1)} ${pt(a + hw, r0)}" fill="${C.ray}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pufferfish" });

  const YC = 0.153; // height of the body axis (= body radius, belly rests on the floor)
  const P = (z: number): V3 => [0, YC, z];

  // ------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: P(0), dir: [0, 0, 1], role: "spine" });
  const front = b.chain("spine", polyline([P(0), P(0.08), P(0.16)]), {
    parent: root,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const back = b.chain("tail", polyline([P(0), P(-0.08), P(-0.16), P(-0.235)]), {
    parent: root,
    names: ["tail1", "tail2", "tail3", "caudal"],
    role: "tail",
  });
  const spine2 = front.joints[1];
  const tail2 = back.joints[1];
  const caudal = back.joints[3];

  const head = b.joint("head", { parent: spine2, at: [0, YC, 0.11], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, YC - 0.014, 0.165], dir: [0, 0, 1], role: "jaw" });

  // ------------------------------------------------------------------ body
  const mott = mottle(C.backA, C.backB, { size: 0.06, contrast: 0.8, seed: 3 });
  const saddles = stripes(mott, C.saddle, { size: 0.1, axis: "z", width: 0.3, wobble: 0.5, seed: 5 });
  const backPaint = spots(saddles, C.spot, { size: 0.04, amount: 0.3, seed: 9 });
  const bellyPaint = mottle(C.bellyA, C.bellyB, { size: 0.05, seed: 2 });
  const coat = countershade(backPaint, bellyPaint, { level: -0.2, soft: 0.25 });

  const spineZ = [-0.235, -0.16, -0.08, 0, 0.08, 0.16];
  const body = b.sweep(
    catmull(spineZ.map(P)),
    [0.027, 0.042, 0.078, 0.122, 0.148, 0.153, 0.142, 0.108, 0.056],
    { bone: [back, root, front], color: coat, sides: 12, detail: 1.5, caps: "round", name: "body" },
  );
  const sk = b.surface(body);

  const avoid: Array<[THREE.Vector3, number]> = [];

  // ------------------------------------------------------------------ eyes
  const eyeTex = svg(EYE_SVG, { size: 160 });
  const rayTex = svg(rayMarkup(), { size: 256 });
  for (const s of [1, -1]) {
    const hit = must(sk.around([0, YC, 0.02]).at(s * 56, 24), "eye");
    const n = v3(hit.n);
    const pos = v3(hit.at);
    avoid.push([pos, 0.085]);
    const ball = b.part(new THREE.SphereGeometry(0.036, 10, 8), C.eye, {
      at: offset(pos, n, -0.008),
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.0345, 0.0055, 4, 12), C.lid, {
      at: offset(pos, n, 0.0015),
      dir: n,
      axis: "z",
      bone: head,
    });
    b.decal(ball, eyeTex, {
      at: offset(pos, n, 0.028),
      dir: n,
      size: [0.062, 0.062],
      segments: 12,
      mirror: s < 0,
    });
    b.decal(body, rayTex, {
      at: pos,
      dir: n,
      size: [0.17, 0.17],
      segments: 18,
      lift: 0.0015,
      roll: s * 12,
    });
  }

  // ------------------------------------------------------------------ mouth: lips, cavity, four-tooth beak
  const MY = YC - 0.012;
  const lipGeo = () => new THREE.TorusGeometry(0.021, 0.008, 5, 8, Math.PI);
  b.part(lipGeo(), C.lip, { at: [0, MY, 0.205], bone: head, name: "lip.upper" });
  b.part(lipGeo(), C.lip, { at: [0, MY, 0.205], rotation: [0, 0, 180], bone: jaw, name: "lip.lower" });

  const cavity = new THREE.SphereGeometry(0.017, 6, 5);
  cavity.scale(1, 0.8, 0.8);
  b.part(cavity, C.mouth, { at: [0, MY, 0.197], bone: head, name: "mouth.cavity" });

  const upperTooth: OutlinePoint[] = [
    [-0.012, 0.014],
    [0.02, 0.012],
    [0.034, 0, "sharp"],
    [0.03, -0.005],
    [0.012, -0.002],
    [-0.012, -0.002],
  ];
  const lowerTooth: OutlinePoint[] = [
    [-0.012, 0.002],
    [0.012, 0.002],
    [0.03, 0.005],
    [0.034, 0, "sharp"],
    [0.02, -0.012],
    [-0.012, -0.014],
  ];
  for (const sx of [1, -1]) {
    b.extrude(upperTooth, {
      at: [sx * 0.0072, MY + 0.004, 0.19],
      thickness: 0.0135,
      color: C.teeth,
      bone: head,
      name: "tooth.upper",
    });
    b.extrude(lowerTooth, {
      at: [sx * 0.0072, MY - 0.004, 0.19],
      thickness: 0.0135,
      color: C.teeth,
      bone: jaw,
      name: "tooth.lower",
    });
  }

  // ------------------------------------------------------------------ pectoral fins
  const pecOutline: OutlinePoint[] = [
    [-0.006, 0.014],
    [0.02, 0.044],
    [0.05, 0.062],
    [0.082, 0.05],
    [0.096, 0.016],
    [0.092, -0.018],
    [0.074, -0.046],
    [0.045, -0.056],
    [0.02, -0.036],
    [-0.006, -0.012],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = must(sk.around([0, YC, 0.03]).at(s * 88, -12), "pectoral base");
    avoid.push([v3(hit.at), 0.075]);
    const pos = offset(hit.at, hit.n, -0.012);
    const xd = unit(s * 0.45, 0, -0.89);
    const yd = ortho(xd, [s * 0.12, 1, 0]);
    const pec = b.joint(`pectoral${side}`, { parent: root, at: pos, dir: xd, role: "fan" });
    b.extrude(pecOutline, {
      at: pos,
      x: xd,
      y: yd,
      thickness: 0.006,
      bevel: 0.0015,
      smoothing: 1,
      bone: pec,
      name: `fin.pectoral${side}`,
      color: finPaint({ rays: 15, reach: 0.1, thick: thickOf(xd, yd) }),
    });
  }

  // ------------------------------------------------------------------ dorsal and anal fins (set far back)
  const FIN_X: V3 = [0, 0, -1];
  const FIN_Y: V3 = [0, 1, 0];
  const medianFin = (name: string, k: 1 | -1, zA: number, zB: number, h: number, bone: typeof tail2) => {
    const castRay = (z: number) => (k > 0 ? sk.ray([0, 0.8, z], [0, -1, 0]) : sk.ray([0, -0.4, z], [0, 1, 0]));
    const ha = must(castRay(zA), `${name} base`);
    const hb = must(castRay(zB), `${name} base end`);
    const A = v3(ha.at);
    const B = v3(hb.at);
    avoid.push([A, 0.05], [B, 0.05]);
    const ub = A.z - B.z;
    const wb = k * (B.y - A.y);
    const w: Array<[number, number]> = [
      [-0.004, -0.012],
      [0.004, 0.45 * h],
      [0.022, 0.93 * h],
      [0.048, h],
      [ub + 0.008, wb + 0.4 * h],
      [ub + 0.004, wb - 0.014],
      [ub * 0.5, wb * 0.5 - 0.016],
    ];
    const pts: OutlinePoint[] = w.map(([u, ww]): [number, number] => [u, k * ww]);
    if (k < 0) pts.reverse();
    return b.extrude(pts, {
      at: A,
      x: FIN_X,
      y: FIN_Y,
      thickness: 0.006,
      bevel: 0.0015,
      smoothing: 1,
      bone,
      name,
      color: finPaint({ rays: 9, reach: h + 0.03, thick: thickOf(FIN_X, FIN_Y), cx: 0.025, cy: -k * 0.03 }),
    });
  };
  medianFin("fin.dorsal", 1, -0.115, -0.17, 0.055, tail2);
  medianFin("fin.anal", -1, -0.115, -0.17, 0.045, tail2);

  // ------------------------------------------------------------------ caudal fin
  const top: Array<[number, number]> = [
    [0, 0.018],
    [0.025, 0.045],
    [0.056, 0.07],
    [0.088, 0.076],
    [0.112, 0.059],
    [0.12, 0.032],
    [0.113, 0.011],
  ];
  const caudalOutline: OutlinePoint[] = [
    ...top,
    [0.104, 0],
    ...top
      .slice()
      .reverse()
      .map(([u, v]): [number, number] => [u, -v]),
  ];
  b.extrude(caudalOutline, {
    at: [0, YC, -0.225],
    x: FIN_X,
    y: FIN_Y,
    thickness: 0.006,
    bevel: 0.0015,
    smoothing: 1,
    bone: caudal,
    name: "fin.caudal",
    color: finPaint({ rays: 20, reach: 0.12, thick: thickOf(FIN_X, FIN_Y) }),
  });

  // ------------------------------------------------------------------ gill slits
  for (const s of [1, -1]) {
    const marks: Array<[number, number]> = [
      [0.066, -30],
      [0.072, -21],
      [0.072, -12],
      [0.066, -3],
    ];
    const pts = marks.map(([z, el]) => v3(must(sk.around([0, YC, z]).at(s * 90, el), "gill").at));
    for (const p of pts) avoid.push([p, 0.035]);
    b.sweep(sk.drape(catmull(pts), { lift: 0.002 }), 0.0032, {
      color: C.gill,
      sides: 5,
      name: s > 0 ? "gill.L" : "gill.R",
    });
  }

  // ------------------------------------------------------------------ spines: the inflated prickle coat
  const clear = (h: any, zMax: number): boolean => {
    const p = v3(h.at);
    if (h.n.y < -0.72 || p.z > zMax || p.z < -0.19) return false;
    return avoid.every(([c, r]) => p.distanceTo(c) > r);
  };

  const big: THREE.Vector3[] = [];
  const bigHits = sk.scatter(170, { rng: rng(11), minDist: 0.04, filter: (h) => clear(h, 0.125) });
  bigHits.forEach((h, i) => {
    const k = hash(i + 3);
    const p = v3(h.at);
    big.push(p);
    const f = THREE.MathUtils.clamp(0.6 + (p.z + 0.19) * 2.0, 0.6, 1);
    b.stick(
      new THREE.ConeGeometry(0.0085 * f, (0.03 + 0.014 * k) * f, 5),
      h.n.y > 0.15 ? C.spineTop : C.spineLow,
      h,
      { embed: 0.2, spin: k * 360 },
    );
  });

  const smallHits = sk.scatter(150, {
    rng: rng(23),
    minDist: 0.024,
    filter: (h) => clear(h, 0.13) && big.every((q) => v3(h.at).distanceTo(q) > 0.026),
  });
  smallHits.forEach((h) => {
    b.stick(new THREE.ConeGeometry(0.0048, 0.015, 4), C.spineLow, h, { embed: 0.2 });
  });

  // ------------------------------------------------------------------ rest pose: jaw slightly open
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
