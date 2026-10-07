```ts
import * as THREE from "three";
import { createBuilder, offset, rng } from "agentic-3js-builder";
import { arc, catmull } from "agentic-3js-builder";
import { limb } from "agentic-3js-builder";
import { grain, paint } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Panther chameleon on a twig",
  description:
    "A walking panther chameleon on a bark twig: turquoise head fading through lime to a sunset-orange, tightly coiled tail, white lateral stripe, red bars, ridged casque, independent turret eyes and mitten-like zygodactyl feet gripping the branch.",
};

type RGB = [number, number, number];
type Station = { at: THREE.Vector3; w: number; h: number };

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));
const sm = (e0: number, e1: number, x: number): number => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const mixC = (a: RGB, c: RGB, t: number): RGB => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const scaleC = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];
const hex = (c: RGB): string => {
  const f = (v: number): string =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${f(c[0])}${f(c[1])}${f(c[2])}`;
};
const hash = (i: number, j: number, k = 0): number => {
  const v = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

// piecewise interpolation over sorted keys (t -> value); segments from index `easeFrom` are eased
const keyed =
  (ts: number[], vs: number[], easeFrom: number) =>
  (t: number): number => {
    if (t <= ts[0]) return vs[0];
    for (let i = 1; i < ts.length; i++) {
      if (t <= ts[i]) {
        let f = (t - ts[i - 1]) / (ts[i] - ts[i - 1]);
        if (i >= easeFrom) f = f * f * (3 - 2 * f);
        return vs[i - 1] + (vs[i] - vs[i - 1]) * f;
      }
    }
    return vs[vs.length - 1];
  };

// colour along the animal, u = metres back from the neck/head junction
const STOPS: [number, RGB][] = [
  [0.0, [0.04, 0.78, 0.83]], // turquoise
  [0.05, [0.07, 0.8, 0.74]],
  [0.11, [0.2, 0.83, 0.45]], // green
  [0.18, [0.5, 0.87, 0.17]], // lime
  [0.25, [0.8, 0.88, 0.15]], // yellow-lime
  [0.31, [0.99, 0.78, 0.13]], // amber
  [0.37, [1.0, 0.58, 0.1]], // orange
  [0.46, [1.0, 0.44, 0.09]],
  [0.7, [0.93, 0.3, 0.1]], // sunset
];
const bodyColorAt = (u: number): RGB => {
  if (u <= STOPS[0][0]) return STOPS[0][1];
  for (let i = 1; i < STOPS.length; i++) {
    if (u <= STOPS[i][0]) {
      const [u0, c0] = STOPS[i - 1];
      const [u1, c1] = STOPS[i];
      return mixC(c0, c1, (u - u0) / (u1 - u0));
    }
  }
  return STOPS[STOPS.length - 1][1];
};

const RED: RGB = [0.8, 0.07, 0.1];
const WHITE: RGB = [0.98, 0.97, 0.9];
const BELLY: RGB = [0.95, 0.93, 0.72];
const TURQ: RGB = [0.05, 0.77, 0.81];

const CREST = "#f3e6a0";
const CLAW = "#3b3228";
const IRIS = "#f0b92c";
const PUPIL = "#0a0b0d";
const LID = "#d9c24a";
const LIDSCALE = "#9fd35a";
const RIDGE = "#c4f3e8";
const TUB_HEAD = "#bff5e8";

const leafOutline = (k: number): OutlinePoint[] => [
  [0, 0, "sharp"],
  [0.014 * k, 0.011 * k],
  [0.04 * k, 0.018 * k],
  [0.066 * k, 0.012 * k],
  [0.088 * k, 0, "sharp"],
  [0.066 * k, -0.012 * k],
  [0.04 * k, -0.018 * k],
  [0.014 * k, -0.011 * k],
];

const CASQUE_OUTLINE: OutlinePoint[] = [
  [0.056, 0.028],
  [0.044, 0.04],
  [0.03, 0.054],
  [0.012, 0.066],
  [-0.004, 0.071, "sharp"],
  [-0.013, 0.06],
  [-0.016, 0.042],
  [-0.01, 0.028],
  [0.02, 0.02],
];

export default function build() {
  const b = createBuilder({ name: "pantherChameleon" });

  // ================= skeleton =================
  const HIP = [0, 0.168, -0.09];
  const SHOULDER = [0, 0.174, 0.09];
  const hips = b.joint("hips", { at: HIP, dir: [0, 0, 1], role: "spine" });

  // tail coil: a logarithmic spiral in the YZ plane, curling down and forward
  const COIL_Y = 0.125;
  const COIL_Z = -0.245;
  const R0 = 0.05;
  const R1 = 0.013;
  const TURNS = 1.5;
  const TH0 = Math.PI / 2;
  const TH1 = TH0 + TURNS * 2 * Math.PI;
  const KK = Math.log(R0 / R1) / (TH1 - TH0);
  const coilPoint = (th: number): number[] => {
    const r = R0 * Math.exp(-KK * (th - TH0));
    return [0, COIL_Y + r * Math.sin(th), COIL_Z + r * Math.cos(th)];
  };
  const coil: number[][] = [];
  for (let i = 22; i >= 0; i--) coil.push(coilPoint(TH0 + ((TH1 - TH0) * i) / 22));

  const BODY_PTS: number[][] = [
    [0, 0.1725, -0.215],
    [0, 0.171, -0.18],
    [0, 0.17, -0.15],
    HIP,
    [0, 0.172, -0.02],
    [0, 0.173, 0.05],
    SHOULDER,
    [0, 0.18, 0.135],
    [0, 0.195, 0.182],
  ];
  // one curve from the tail tip, through the hips, to the base of the head
  const body = catmull([...coil, ...BODY_PTS]);
  const BODY_LEN = body.length;

  const tCoil0 = body.closestT(coilPoint(TH0));
  const tOuter = body.closestT(coilPoint(TH0 + 2 * Math.PI));
  const tRump = body.closestT([0, 0.17, -0.15]);
  const tHips = body.closestT(HIP);
  const tMid = body.closestT([0, 0.172, -0.02]);
  const tShoulder = body.closestT(SHOULDER);
  const tNeck = (tShoulder + 1) / 2;

  const spine = b.chain("spine", body.slice(tHips, tShoulder), { parent: hips, count: 3, role: "spine" });
  const neck = b.chain("neck", body.slice(tShoulder, 1), { parent: spine, count: 2, role: "neck" });
  const tail = b.chain("tail", body.slice(tHips, 0), { parent: hips, count: 12, role: "tail" });

  const head = b.joint("head", { parent: neck, at: [0, 0.2, 0.17], dir: [0, -0.06, 1], role: "head" });
  const H = (f: number, u: number, l = 0): THREE.Vector3 => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: H(0.006, -0.02), aim: H(0.09, -0.012), role: "jaw" });

  // ================= paints =================
  const bodyKeys = [0, tCoil0, tRump, tHips, tMid, tShoulder, tNeck, 1];
  const bodyRX = keyed(bodyKeys, [0.0035, 0.017, 0.025, 0.03, 0.033, 0.033, 0.026, 0.022], 2);
  const bodyRY = keyed(bodyKeys, [0.0035, 0.017, 0.031, 0.05, 0.056, 0.055, 0.042, 0.032], 2);

  const bodyCoat = paint((_p, _n, s) => {
    const u = (1 - s[0]) * BODY_LEN;
    const a = s[1] > 180 ? 360 - s[1] : s[1];
    let c = bodyColorAt(u);
    // fine granulation, one cell per scale
    c = scaleC(c, 0.92 + 0.15 * hash(Math.floor(u / 0.0075), Math.floor(a / 10)));
    // pale belly (body only; the coil rolls over)
    const tailFade = 1 - sm(0.36, 0.42, u);
    c = mixC(c, BELLY, 0.7 * sm(125, 165, a) * tailFade);
    // red bars across the flanks and tail
    const wob = 0.0045 * Math.sin(a * 0.06 + u * 20);
    const ph = (u + wob) / 0.052;
    const fr = ph - Math.floor(ph);
    const barW = 0.42 - 0.2 * sm(90, 150, a);
    const cov =
      sm(0, 0.06, fr) * (1 - sm(barW - 0.06, barW, fr)) * sm(0.085, 0.12, u) * (1 - sm(120, 165, a) * tailFade);
    c = mixC(c, RED, 0.92 * cov);
    // white lateral stripe, a little below mid-flank
    const hw = 7 * sm(0.06, 0.1, u) * (1 - sm(0.33, 0.37, u));
    const st = hw > 0.5 ? 1 - sm(hw - 1.8, hw, Math.abs(a - 100)) : 0;
    c = mixC(c, WHITE, 0.95 * st);
    return hex(c);
  });

  const headPaint = paint((p, n) => {
    let c = TURQ;
    c = mixC(c, [0.22, 0.84, 0.6], 0.45 * sm(0.35, 0.95, n.y));
    c = mixC(c, [0.8, 0.96, 0.9], 0.75 * sm(-0.1, -0.7, n.y));
    const gk =
      0.9 + 0.2 * hash(Math.floor(p.x / 0.0065), Math.floor(p.y / 0.0065), Math.floor(p.z / 0.0065));
    return hex(scaleC(c, gk));
  });

  const casquePaint = paint((_p, n, s) => {
    if (Math.abs(n.x) < 0.5) return hex([0.95, 0.88, 0.5]);
    const d = Math.hypot(s[0] - 0.012, (s[1] - 0.025) * 1.15);
    const band = Math.floor(d / 0.0075) % 2;
    const c: RGB = band ? [0.1, 0.84, 0.86] : [0.04, 0.62, 0.7];
    return hex(c);
  });

  const eyePaint = paint((p, n) => {
    const h = hash(Math.floor(p.x / 0.005), Math.floor(p.y / 0.005), Math.floor(p.z / 0.005));
    let c = mixC([0.25, 0.8, 0.62], [0.7, 0.88, 0.3], h);
    c = scaleC(c, 0.85 + 0.2 * sm(-0.5, 0.8, n.y));
    return hex(c);
  });

  const legPaint = paint((p, n) => {
    let c = bodyColorAt(Math.max(0, 0.185 - p.z));
    c = scaleC(c, 1 - 0.28 * sm(0.095, 0.04, p.y));
    c = mixC(c, [0.9, 0.95, 0.75], 0.5 * sm(-0.2, -0.9, n.y));
    const gk =
      0.9 + 0.2 * hash(Math.floor(p.x / 0.0055), Math.floor(p.y / 0.0055), Math.floor(p.z / 0.0055));
    return hex(scaleC(c, gk));
  });

  const tubBody = paint((p) => hex(mixC(bodyColorAt(0.185 - p.z), [1, 0.98, 0.8], 0.55)));

  const barkPaint = grain("#7b5b3d", "#47321f", { size: 0.006, axis: "z" });
  const leafPaint = paint((_p, _n, s) => {
    const rib = Math.abs(s[1]) < 0.0011 ? 1 : 0;
    let c = mixC([0.1, 0.38, 0.16], [0.35, 0.68, 0.2], clamp01(s[0] / 0.08));
    c = mixC(c, [0.75, 0.88, 0.45], rib * 0.8);
    return hex(c);
  });

  // ================= body =================
  const bodyRadius = (t: number): [number, number] => [bodyRX(t), bodyRY(t)];
  const bodyTube = b.sweep(body, bodyRadius, {
    bone: [tail, hips, spine, neck],
    color: bodyCoat,
    sides: 12,
  });

  // dorsal crest of cream spines from tail root to the nape
  b.along(
    bodyTube,
    22,
    (at) => {
      b.spike(at.moved([0, -0.004, 0]), at, 0.006 + 0.2 * bodyRY(at.t), 0.0042, { color: CREST, sides: 6 });
    },
    { from: tCoil0 + 0.01, to: 0.93 },
  );
  // spines on the outer turn of the coil
  for (let i = 0; i < 11; i++) {
    const t = tOuter + ((tCoil0 - tOuter) * (i + 0.5)) / 11;
    const pos = body.at(t);
    const rad = new THREE.Vector3(0, pos.y - COIL_Y, pos.z - COIL_Z).normalize();
    const rt = bodyRX(t);
    b.spike(
      pos.clone().addScaledVector(rad, rt * 0.85),
      [rad.x, rad.y, rad.z],
      0.006 + rt * 0.45,
      0.0032,
      { color: CREST, bone: tail.nearestJoint(pos), sides: 6 },
    );
  }

  // pale tubercles scattered over the flanks
  const bodySkin = b.surface(bodyTube);
  for (const hit of bodySkin.scatter(60, {
    rng: rng(21),
    minDist: 0.024,
    filter: (h) => h.n.y > -0.3 && h.at.z > -0.19 && h.at.z < 0.14,
  })) {
    b.stick(new THREE.ConeGeometry(0.0032, 0.007, 5), tubBody, hit, { embed: 0.35, flat: true });
  }

  // ================= head =================
  const stationRadius = (path: ReturnType<typeof catmull>, st: Station[]) => {
    const ts = st.map((q) => path.closestT(q.at));
    const rx = keyed(
      ts,
      st.map((q) => (q.w / 2) * 1.12),
      99,
    );
    const ry = keyed(
      ts,
      st.map((q) => q.h / 2),
      99,
    );
    return (t: number): [number, number] => [rx(t), ry(t)];
  };

  const upperSt: Station[] = [
    { at: H(-0.012, 0.01), w: 0.042, h: 0.048 },
    { at: H(0.015, 0.011), w: 0.054, h: 0.056 },
    { at: H(0.045, 0.01), w: 0.05, h: 0.05 },
    { at: H(0.07, 0.006), w: 0.036, h: 0.036 },
    { at: H(0.086, 0.001), w: 0.022, h: 0.022 },
  ];
  const upperPath = catmull(upperSt.map((q) => q.at));
  const headUpper = b.sweep(upperPath, stationRadius(upperPath, upperSt), {
    bone: head,
    color: headPaint,
    section: { ngon: 6 },
    smooth: false,
  });

  const jawSt: Station[] = [
    { at: H(0.004, -0.026), w: 0.04, h: 0.02 },
    { at: H(0.03, -0.0245), w: 0.04, h: 0.02 },
    { at: H(0.06, -0.0195), w: 0.03, h: 0.015 },
    { at: H(0.084, -0.0145), w: 0.016, h: 0.008 },
  ];
  const jawPath = catmull(jawSt.map((q) => q.at));
  b.sweep(jawPath, stationRadius(jawPath, jawSt), {
    bone: jaw,
    color: headPaint,
    section: { ngon: 6 },
    smooth: false,
  });

  // casque: a tilted helmet-fin with a serrated rim and parallel ridges
  b.extrude(CASQUE_OUTLINE, {
    at: H(0, 0),
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.03, 0.01],
    bevel: 0.004,
    color: casquePaint,
    bone: head,
  });

  const EDGE: number[][] = [
    [0.056, 0.028],
    [0.044, 0.04],
    [0.03, 0.054],
    [0.012, 0.066],
    [-0.004, 0.071],
    [-0.013, 0.06],
    [-0.016, 0.042],
  ];
  const edgeLen: number[] = [0];
  for (let i = 1; i < EDGE.length; i++) {
    edgeLen.push(edgeLen[i - 1] + Math.hypot(EDGE[i][0] - EDGE[i - 1][0], EDGE[i][1] - EDGE[i - 1][1]));
  }
  const EDGE_TOTAL = edgeLen[edgeLen.length - 1];
  const NCREST = 10;
  for (let k = 0; k < NCREST; k++) {
    const d = ((k + 0.5) / NCREST) * EDGE_TOTAL;
    let i = 1;
    while (i < EDGE.length - 1 && edgeLen[i] < d) i++;
    const fr = (d - edgeLen[i - 1]) / (edgeLen[i] - edgeLen[i - 1]);
    const f = EDGE[i - 1][0] + (EDGE[i][0] - EDGE[i - 1][0]) * fr;
    const u = EDGE[i - 1][1] + (EDGE[i][1] - EDGE[i - 1][1]) * fr;
    const tl = Math.hypot(EDGE[i][0] - EDGE[i - 1][0], EDGE[i][1] - EDGE[i - 1][1]);
    const tf = (EDGE[i][0] - EDGE[i - 1][0]) / tl;
    const tu = (EDGE[i][1] - EDGE[i - 1][1]) / tl;
    const nf = tu;
    const nu = -tf;
    const len = 0.008 + 0.006 * Math.sin((Math.PI * (k + 0.5)) / NCREST);
    b.spike(H(f - nf * 0.004, u - nu * 0.004), [0, nu * 0.8 + tu * 0.45, nf * 0.8 + tf * 0.45], len, 0.0036, {
      color: CREST,
      bone: head,
      sides: 6,
    });
  }
  // parallel ridges on both faces of the casque
  const thickAt = (u: number): number => 0.03 + (0.01 - 0.03) * clamp01((u - 0.02) / (0.071 - 0.02));
  for (const s of [1, -1]) {
    for (const k of [0.8, 0.6]) {
      const pts = EDGE.map(([f, u]) => {
        const f2 = 0.015 + k * (f - 0.015);
        const u2 = 0.045 + k * (u - 0.045);
        return H(f2, u2, s * (thickAt(u2) / 2 + 0.0012));
      });
      b.sweep(pts, 0.0017, { bone: head, color: RIDGE, sides: 5 });
    }
  }

  // snout details
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0052, 6, 4), headPaint, {
      bone: head,
      at: H(0.09, 0.007, s * 0.0055),
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0025, 5, 4), PUPIL, {
      bone: head,
      at: H(0.076, 0.007, s * 0.0158),
      flat: true,
    });
  }

  // little conical tubercles on the skull
  const headSkin = b.surface(headUpper);
  for (const hit of headSkin.scatter(30, {
    rng: rng(5),
    minDist: 0.011,
    filter: (h) => h.n.y > -0.1 && h.at.z > head.at.z + 0.01,
  })) {
    b.stick(new THREE.ConeGeometry(0.0026, 0.0062, 5), TUB_HEAD, hit, { embed: 0.3, flat: true });
  }

  // ================= turret eyes, looking two different ways =================
  const EYE_R = 0.0195;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const g = (s > 0 ? new THREE.Vector3(0.5, 0.12, 0.86) : new THREE.Vector3(-0.93, 0.16, -0.34)).normalize();
    const gd = [g.x, g.y, g.z];
    const eye = b.joint(`eye${side}`, { parent: head, at: H(0.047, 0.021, s * 0.029), dir: gd });
    b.part(new THREE.SphereGeometry(EYE_R, 9, 7), eyePaint, { bone: eye, at: eye.at, flat: true });
    const collar = b.part(new THREE.CylinderGeometry(0.0092, 0.0128, 0.0058, 10), LID, {
      bone: eye,
      at: offset(eye.at, gd, EYE_R - 0.0017),
      dir: gd,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.0082, 0.0082, 0.0035, 12), IRIS, {
      bone: eye,
      at: offset(eye.at, gd, EYE_R + 0.0002),
      dir: gd,
    });
    b.part(new THREE.CylinderGeometry(0.0043, 0.0043, 0.004, 10), PUPIL, {
      bone: eye,
      at: offset(eye.at, gd, EYE_R + 0.0014),
      dir: gd,
    });
    const upSide = new THREE.Vector3(0, 1, 0).addScaledVector(g, -g.y).normalize();
    b.part(new THREE.SphereGeometry(0.0016, 5, 4), "#ffffff", {
      bone: eye,
      at: offset(offset(eye.at, gd, EYE_R + 0.0024), [upSide.x, upSide.y, upSide.z], 0.0026),
    });
    b.ring(collar.moved([0, -0.004, 0]), { count: 9, radius: 0.014 }, (item) => {
      b.stick(new THREE.SphereGeometry(0.003, 5, 4), LIDSCALE, item, { embed: 0.3, flat: true });
    });
  }

  // ================= legs and mitten feet =================
  const TWIG_Y = 0.017;
  const TWIG_R = 0.017;
  const FOOT_Y = 0.05;
  const RHO = TWIG_R + 0.0068 + 0.0006;
  const legRadius = keyed([0, 0.45, 1], [0.0185, 0.0135, 0.0105], 99);
  const legDefs = [
    { id: "FL", s: 1, front: true, z: 0.108 },
    { id: "FR", s: -1, front: true, z: 0.168 },
    { id: "HL", s: 1, front: false, z: -0.072 },
    { id: "HR", s: -1, front: false, z: -0.152 },
  ];
  for (const d of legDefs) {
    const { id, s, front, z } = d;
    const root = [s * 0.027, 0.15, front ? 0.088 : -0.088];
    const target = [s * 0.004, FOOT_Y, z];
    const pts = limb(root, target, [0.07, 0.07], [[s, 0, front ? -0.6 : 0.6]]);
    const names = front ? [`shoulder${id}`, `elbow${id}`, `wrist${id}`] : [`hip${id}`, `knee${id}`, `ankle${id}`];
    const leg = b.chain(`leg${id}`, pts, {
      parent: front ? spine : hips,
      names,
      role: front ? "arm" : "leg",
    });
    b.sweep(leg, legRadius, { color: legPaint, sides: 8 });
    b.part(new THREE.SphereGeometry(0.021, 8, 6), legPaint, { bone: leg.joints[0], at: root, flat: true });

    const wrist = leg.tip!;
    b.part(new THREE.SphereGeometry(0.0125, 7, 5), legPaint, { bone: wrist, at: target, flat: true });
    // palm resting on top of the twig
    b.sweep(
      [
        [s * 0.004, FOOT_Y, z - 0.012],
        [s * 0.004, FOOT_Y, z + 0.012],
      ],
      (): [number, number] => [0.0165, 0.0085],
      { bone: wrist, color: legPaint, sides: 8 },
    );

    // two opposed toe bundles wrapping the twig: three fused toes and two
    for (const j of [1, -1]) {
      const startAng = (22 * Math.PI) / 180;
      const from = [j * RHO * Math.sin(startAng), TWIG_Y + RHO * Math.cos(startAng), z];
      const path = arc([0, TWIG_Y, z], from, [0, 0, 1], -j * 96);
      const toe = b.chain(`toe${id}${j > 0 ? "a" : "b"}`, path, {
        parent: wrist,
        up: [0, 0, 1],
        count: 3,
        role: "digit",
      });
      const halfW = j > 0 ? 0.0145 : 0.0105;
      b.sweep(toe, (t: number): [number, number] => [0.0068 - 0.0012 * t, halfW * (1 - 0.18 * t)], {
        color: legPaint,
        sides: 8,
      });
      const tipP = path.at(1);
      const tipT = path.tangentAt(1);
      const toTwig = new THREE.Vector3(0, TWIG_Y, z).sub(tipP).normalize();
      const cdir = tipT.clone().multiplyScalar(0.75).addScaledVector(toTwig, 0.45).normalize();
      const offs = j > 0 ? [-0.009, 0, 0.009] : [-0.005, 0.005];
      for (const o of offs) {
        b.spike(
          tipP.clone().addScaledVector(tipT, -0.004).add(new THREE.Vector3(0, 0, o)),
          [cdir.x, cdir.y, cdir.z],
          0.014,
          0.0036,
          { color: CLAW, bone: toe.joints[2], sides: 6 },
        );
      }
    }
  }

  // ================= the twig =================
  const TWIG_PTS: number[][] = [
    [-0.025, 0.075, -0.52],
    [-0.015, 0.048, -0.42],
    [-0.005, 0.026, -0.33],
    [0, 0.017, -0.22],
    [0, 0.017, -0.05],
    [0, 0.017, 0.13],
    [0.004, 0.019, 0.25],
    [0.02, 0.032, 0.36],
    [0.04, 0.052, 0.46],
  ];
  const TWIG_RS = [0.0195, 0.0185, 0.0175, 0.017, 0.017, 0.017, 0.0155, 0.0125, 0.0085];
  const twigPath = catmull(TWIG_PTS);
  const twigRadius = keyed(
    TWIG_PTS.map((q) => twigPath.closestT(q)),
    TWIG_RS,
    99,
  );
  b.sweep(twigPath, twigRadius, { bone: hips, color: barkPaint, sides: 8 });

  const twiglet = (near: number[], mid: number[][]) => {
    const s0 = twigPath.at(twigPath.closestT(near));
    const path = catmull([[s0.x, s0.y, s0.z], ...mid]);
    b.sweep(path, [0.006, 0.002], { bone: hips, color: barkPaint, sides: 6 });
    return path;
  };
  const addLeaf = (at: THREE.Vector3, dir: number[], roll: number, sc: number): void => {
    const x = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const y = new THREE.Vector3(0, 1, 0).addScaledVector(x, -x.y).normalize().applyAxisAngle(x, roll);
    b.extrude(leafOutline(sc), {
      at,
      x: [x.x, x.y, x.z],
      y: [y.x, y.y, y.z],
      thickness: 0.002,
      smoothing: 1,
      color: leafPaint,
      bone: hips,
    });
  };

  const br1 = twiglet(
    [0.01, 0.028, 0.3],
    [
      [0.035, 0.06, 0.33],
      [0.065, 0.095, 0.37],
      [0.09, 0.125, 0.4],
    ],
  );
  addLeaf(br1.at(0.45), [1, 0.2, 0.1], 1.2, 1.0);
  addLeaf(br1.at(0.72), [0.1, 0.4, 1], -1.1, 0.95);
  addLeaf(br1.at(1), [0.5, 0.5, 0.8], 0.4, 1.15);

  const br2 = twiglet(
    [-0.01, 0.034, -0.4],
    [
      [-0.04, 0.07, -0.43],
      [-0.07, 0.105, -0.46],
      [-0.095, 0.14, -0.485],
    ],
  );
  addLeaf(br2.at(0.45), [-1, 0.2, -0.2], -1.2, 0.95);
  addLeaf(br2.at(0.72), [0, 0.4, -1], 1.0, 0.9);
  addLeaf(br2.at(1), [-0.5, 0.5, -0.8], -0.5, 1.1);

  addLeaf(twigPath.at(1), [0.3, 0.4, 1], 0.8, 1.0);

  return b.root;
}
```