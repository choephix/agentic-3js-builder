import * as THREE from "three";
import {
  createBuilder,
  rng,
  svg,
  frame,
  limb,
  polyline,
  catmull,
  paint,
  mix,
  smoothstep,
  interpolate,
} from "../../../../src/index";

export const meta = {
  name: "Dragonfly",
  description:
    "A stylized emerald-and-cobalt dragonfly at real size: stained-glass wings with drawn venation and pterostigma, honeycomb compound eyes with glints, striped thorax, segmented abdomen with collars, and spiny legs planted on the ground. Rigged with a spine, neck, head, jaw, tail chain, four wing joints and six legs.",
};

const Y0 = 0.016;

/** Stained-glass wing: cells between longitudinal veins, crossveins at staggered heights. Root at bottom, leading edge at left. */
function wingSvg(hind: boolean, seed: number) {
  const r = rng(seed);
  const keys: number[][] = hind
    ? [[0, 72], [0.06, 96], [0.18, 97], [0.4, 93], [0.7, 86], [0.85, 70], [0.94, 48], [0.985, 25], [1, 10]]
    : [[0, 30], [0.08, 55], [0.2, 80], [0.45, 92], [0.7, 86], [0.85, 70], [0.94, 48], [0.985, 25], [1, 10]];
  const trail = (t: number) => {
    for (let i = 1; i < keys.length; i++)
      if (t <= keys[i][0]) {
        const [t0, x0] = keys[i - 1];
        const [t1, x1] = keys[i];
        return x0 + ((x1 - x0) * (t - t0)) / (t1 - t0);
      }
    return keys[keys.length - 1][1];
  };
  const lead = (t: number) => 4 + 3 * t;
  const Y = (t: number) => 396 - t * 392;
  const P = (f: number, t: number): [number, number] => [lead(t) + f * (trail(t) - lead(t)), Y(t)];
  const fmt = (pts: Array<[number, number]>) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const cols = [0, 0.08, 0.2, 0.36, 0.55, 0.77, 1];
  const pal = ["#dff6f2", "#e6eeff", "#ecfbe6", "#f3e8fb", "#d6eef8", "#faf4e0", "#e2fbf7"];
  let cells = "";
  for (let k = 0; k < cols.length - 1; k++) {
    let t = 0;
    while (t < 1) {
      let t2 = Math.min(1, t + 0.028 + r() * 0.03 + (k === 0 ? 0.01 : 0));
      if (1 - t2 < 0.02) t2 = 1;
      const basal = t < (hind ? 0.17 : 0.1);
      let c: string;
      if (basal) c = hind ? (k < 3 ? "#d2913f" : "#a85f26") : "#e9b95c";
      else if (k === 0) c = "#f6e6a8";
      else c = pal[Math.floor(r() * pal.length)];
      cells += `<polygon points="${fmt([P(cols[k], t), P(cols[k + 1], t), P(cols[k + 1], t2), P(cols[k], t2)])}" fill="${c}"/>`;
      t = t2;
    }
  }
  let veins = "";
  cols.forEach((f, i) => {
    const pts: Array<[number, number]> = [];
    for (let t = 0; t <= 1.0001; t += 0.02) pts.push(P(f, Math.min(t, 1)));
    const w = i === 0 ? 2.8 : i === cols.length - 1 ? 1.6 : 1.25;
    veins += `<polyline points="${fmt(pts)}" stroke-width="${w}"/>`;
  });
  const stigma = `<polygon points="${fmt([P(0, 0.855), P(0.11, 0.855), P(0.11, 0.915), P(0, 0.915)])}" fill="#2a1810" stroke="#160c08" stroke-width="1"/>`;
  const [nx, ny] = P(0, 0.48);
  const nodus = `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="2.2" fill="#1d1a22"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 400"><g stroke="#3a3946" stroke-width="0.8" stroke-linejoin="round">${cells}</g><g fill="none" stroke="#2c2a36" stroke-linecap="round" stroke-linejoin="round">${veins}</g>${stigma}${nodus}</svg>`;
}

/** Compound eye: deep-teal to aqua gradient under a honeycomb of facets. */
function eyeSvg() {
  const r = rng(5);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a3f58"/><stop offset="0.4" stop-color="#1b9fc0"/><stop offset="0.75" stop-color="#6fe2d8"/><stop offset="1" stop-color="#d2f8e0"/></linearGradient></defs><rect width="200" height="100" fill="url(#g)"/><g stroke="#063447" stroke-width="0.55" stroke-opacity="0.75" fill="#ffffff">`;
  const R = 3.2;
  const h = R * Math.sqrt(3);
  for (let i = 0; i * 1.5 * R < 204; i++)
    for (let j = -1; j * h < 104; j++) {
      const cx = i * 1.5 * R;
      const cy = j * h + (i % 2 ? h / 2 : 0);
      const pts: string[] = [];
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        pts.push(`${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`);
      }
      s += `<polygon points="${pts.join(" ")}" fill-opacity="${(r() * 0.2).toFixed(2)}"/>`;
    }
  return s + `</g></svg>`;
}

export default function build() {
  const b = createBuilder({ name: "dragonfly", paintSize: 1024 });

  // ---------------- skeleton core ----------------
  const thorax = b.joint("thorax", { at: [0, Y0, 0.015], dir: [0, 0, 1], role: "spine" });
  const neck = b.joint("neck", { parent: thorax, at: [0, Y0 + 0.0008, 0.0245], dir: [0, 0, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, Y0 + 0.001, 0.027], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, Y0 - 0.0016, 0.0305], dir: [0, -0.35, 1], role: "jaw" });

  // ---------------- thorax ----------------
  const thoraxPaint = paint((p, n) => {
    if (n.y > 0.55) {
      const ax = Math.abs(p.x);
      if (ax < 0.0006) return "#121812";
      if (ax > 0.0017 && ax < 0.0029 && p.z > 0.008) return "#ffd33d";
      return mix("#1f8f6e", "#34c08f", smoothstep(0.006, 0.02, p.z));
    }
    if (n.y < -0.55) return "#d8cf6a";
    const s = (p.z + (p.y - Y0) * 0.9) / 0.0045;
    const f = s - Math.floor(s);
    if (f < 0.2) return "#121812";
    if (f < 0.32) return "#ffd33d";
    return mix("#2fb388", "#9fe07a", smoothstep(0.2, -0.5, n.y));
  });
  b.loft(
    [
      { at: [0, Y0 - 0.0005, 0.0045], w: 0.0065, h: 0.0065 },
      { at: [0, Y0 + 0.0005, 0.0095], w: 0.0105, h: 0.0115 },
      { at: [0, Y0 + 0.001, 0.0165], w: 0.0118, h: 0.0125 },
      { at: [0, Y0 + 0.0008, 0.0225], w: 0.0095, h: 0.0095 },
      { at: [0, Y0 + 0.0006, 0.0255], w: 0.005, h: 0.005 },
    ],
    { color: thoraxPaint, bone: thorax, sides: 10, name: "thorax" },
  );
  b.capsule([0, Y0 + 0.0008, 0.0235], [0, Y0 + 0.0009, 0.027], 0.0021, { color: "#1d2a1f", bone: neck });

  // ---------------- head ----------------
  const ball = (r: number, ws = 12, hs = 8) => new THREE.SphereGeometry(r, ws, hs);
  b.part(ball(1), "#24331f", { at: [0, Y0 + 0.001, 0.0275], scale: [0.0058, 0.0048, 0.0035], bone: head });
  const eyeTex = svg(eyeSvg(), { size: 512 });
  for (const sx of [1, -1]) {
    const c = new THREE.Vector3(sx * 0.0029, Y0 + 0.0034, 0.0295);
    b.part(new THREE.SphereGeometry(0.0047, 20, 14), "#ffffff", {
      at: c,
      rotation: [0, sx > 0 ? 0 : 180, 0],
      texture: eyeTex,
      bone: head,
      name: sx > 0 ? "eyeL" : "eyeR",
    });
    const d1 = new THREE.Vector3(sx * 0.45, 0.62, 0.65).normalize();
    b.part(ball(0.0009, 10, 6), "#f4feff", { at: c.clone().addScaledVector(d1, 0.0046), dir: d1, scale: [1.1, 0.25, 0.7], bone: head });
    const d2 = new THREE.Vector3(sx * 0.7, 0.35, 0.62).normalize();
    b.part(ball(0.0004, 8, 5), "#f4feff", { at: c.clone().addScaledVector(d2, 0.0046), dir: d2, scale: [1, 0.3, 1], bone: head });
    // antennae
    b.spike([sx * 0.0011, Y0 + 0.0032, 0.0335], [sx * 0.3, 0.6, 1], 0.0035, 0.00018, { color: "#1b1b1b", bone: head, sides: 5 });
    // mandibles on the lower jaw
    b.spike([sx * 0.0013, Y0 - 0.002, 0.0328], [-sx * 0.7, -0.2, 1], 0.0017, 0.0004, { color: "#3a2a12", bone: jaw, sides: 5 });
  }
  b.part(ball(1), "#e9dd52", { at: [0, Y0 + 0.001, 0.0335], scale: [0.0034, 0.0026, 0.0022], bone: head, name: "frons" });
  b.part(ball(1), "#161616", { at: [0, Y0 + 0.0021, 0.0336], scale: [0.0035, 0.0004, 0.0023], bone: head });
  b.part(ball(1), "#f2c443", { at: [0, Y0 - 0.0013, 0.0345], scale: [0.0024, 0.0011, 0.0014], bone: head, name: "labrum" });
  b.part(ball(1), "#c48f2c", { at: [0, Y0 - 0.0027, 0.0325], scale: [0.0027, 0.0012, 0.0024], bone: jaw, name: "labium" });

  // ---------------- abdomen ----------------
  const abPath = catmull([
    [0, Y0, 0.006],
    [0, Y0 + 0.0004, -0.01],
    [0, Y0 + 0.0008, -0.03],
    [0, Y0 + 0.0006, -0.048],
    [0, Y0 - 0.0002, -0.058],
  ]);
  const abd = b.chain("abdomen", abPath, {
    parent: thorax,
    count: 6,
    names: ["abdomen1", "abdomen2", "abdomen3", "abdomen4", "abdomen5", "abdomen6"],
    role: "tail",
  });
  const ts = [0, 0.06, 0.14, 0.24, 0.4, 0.6, 0.78, 0.9, 0.97, 1];
  const rs = [0.0024, 0.0027, 0.0019, 0.0014, 0.00135, 0.0014, 0.00155, 0.0015, 0.0012, 0.0009];
  const rAbd = (t: number) => Math.max(interpolate(ts, rs, t), 0.0004);
  const abPaint = paint((p, n, s) => {
    const t = s[0];
    const deg = s[1];
    const seg = t * 10;
    const k = Math.floor(seg);
    const f = seg - k;
    const d = deg > 180 ? 360 - deg : deg;
    if (f < 0.07 || f > 0.96) return "#0d1020";
    if (d > 130) return "#1b2340";
    if (k >= 9) return "#111318";
    if (k >= 2 && d < 20) return "#0d1020";
    if (k >= 2 && k <= 7 && d > 55 && d < 100 && f > 0.2 && f < 0.52) return "#ffd23a";
    const base = k >= 7 ? "#7cccff" : "#2f7de1";
    return mix(base, "#173f8a", smoothstep(60, 125, d));
  });
  b.sweep(abd, { radius: rAbd, color: abPaint, sides: 10, name: "abdomen" });
  for (let k = 1; k <= 9; k++)
    b.sweep(abd, {
      radius: (t: number) => rAbd(t) * 1.09,
      color: "#0d1020",
      from: k / 10 - 0.006,
      to: k / 10 + 0.006,
      caps: "flat",
      sides: 10,
    });
  const tip = abd.at(1).at;
  for (const sx of [1, -1])
    b.spike([sx * 0.0005, tip.y, tip.z + 0.001], [sx * 0.25, 0.08, -1], 0.0035, 0.00035, {
      color: "#0d1020",
      bone: "abdomen6",
      sides: 5,
    });
  b.spike([0, tip.y - 0.0004, tip.z + 0.001], [0, -0.3, -1], 0.0022, 0.0003, { color: "#0d1020", bone: "abdomen6", sides: 5 });

  // ---------------- wings ----------------
  const foreTex = svg(wingSvg(false, 11), { size: 1024 });
  const hindTex = svg(wingSvg(true, 23), { size: 1024 });
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    for (const hind of [false, true]) {
      const jz = hind ? 0.011 : 0.019;
      const jy = Y0 + (hind ? 0.0045 : 0.0055);
      const w = hind ? 0.0125 : 0.0095;
      const len = hind ? 0.038 : 0.04;
      const name = `wing${hind ? "H" : "F"}${side}`;
      const j = b.joint(name, { parent: thorax, at: [sx * 0.0025, jy, jz], dir: [sx, 0, 0], role: "wing" });
      const rootZ = jz - (hind ? 0.13 : 0.33) * w;
      const f = frame([sx * 0.0028, jy, rootZ], [-0.1 * sx, 1, 0]);
      b.cards([f], hind ? hindTex : foreTex, {
        size: [w, len],
        lean: 90,
        flow: [sx, 0, hind ? -0.22 : 0.1],
        sink: 0,
        bone: j,
        mirror: sx < 0,
        name,
      });
      b.part(ball(0.0009, 8, 6), "#1a1f1a", { at: [sx * 0.003, jy + 0.0011, jz], scale: [1, 0.7, 1.4], bone: thorax });
    }
  }

  // ---------------- legs ----------------
  const legs = [
    { id: "F", hip: [0.0018, Y0 - 0.0035, 0.0215], foot: [0.011, 0.00027, 0.031], L: [0.0085, 0.0095, 0.003], sole: [0.3, 0, 1] },
    { id: "M", hip: [0.002, Y0 - 0.0042, 0.0165], foot: [0.0155, 0.00027, 0.0165], L: [0.0085, 0.0095, 0.0032], sole: [1, 0, 0.2] },
    { id: "H", hip: [0.002, Y0 - 0.0045, 0.0115], foot: [0.0155, 0.00027, -0.003], L: [0.0105, 0.0115, 0.0038], sole: [0.6, 0, -1] },
  ];
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    for (const leg of legs) {
      const pts = limb(
        [sx * leg.hip[0], leg.hip[1], leg.hip[2]],
        [sx * leg.foot[0], leg.foot[1], leg.foot[2]],
        leg.L,
        [[sx * 0.5, 1, 0]],
        { sole: [sx * leg.sole[0], 0, leg.sole[2]] },
      );
      const tag = `${leg.id}${side}`;
      const chain = b.chain(`leg${tag}`, polyline(pts), {
        parent: thorax,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `toe${tag}`],
        role: "leg",
      });
      b.sweep(chain, {
        radius: [0.00062, 0.0005, 0.0004, 0.00028],
        bands: [
          [0.36, "#5a3f1e"],
          [1, "#18161c"],
        ],
        sides: 6,
      });
      // spines lining the tibia, two rows
      for (const zs of [0.6, -0.6])
        b.along(
          chain,
          3,
          (pt) => {
            const dir = new THREE.Vector3(-sx, -0.25, zs).normalize().addScaledVector(pt.tangent, 0.9);
            b.spike(pt, dir, 0.0017, 0.00011, { color: "#18161c", sides: 4 });
          },
          { from: 0.42, to: 0.85 },
        );
      // claws
      const toe = pts[3];
      const sole = new THREE.Vector3(sx * leg.sole[0], 0, leg.sole[2]).normalize();
      for (const k of [0.35, -0.35]) {
        const d = sole.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), k);
        b.spike(toe, d, 0.0009, 0.00014, { color: "#0e0d10", bone: `toe${tag}`, sides: 4 });
      }
    }
  }

  return b.root;
}
