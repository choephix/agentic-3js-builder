import * as THREE from "three";
import { createBuilder, rng, paint, scales, countershade, svg, polyline, catmull } from "../../../../src/index";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly hovering at pond height. It has an electric-blue abdomen with black dorsal arrow markings, an apple-green thorax and huge faceted turquoise wraparound eyes. Its four flat stained-glass wings have dark veins, gold-tinted panes and amber pterostigmas. The six black legs are folded under it.",
};

const Y0 = 0.3; // hover height
const BLACK = "#0a0d18";
const BLUE = "#1e9bff";
const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function wingTexture(hind: boolean, mirror: boolean) {
  const R = rng(hind ? 41 : 17);
  const W = 100, H = 400;
  const width = (u: number) =>
    hind
      ? 82 * Math.pow(Math.max(0, Math.sin(Math.PI * (0.22 + 0.78 * u))), 0.55)
      : 72 * Math.pow(Math.max(0, Math.sin(Math.PI * (0.1 + 0.9 * u))), 0.6);
  const lead = (u: number) => 95 - 6 * u * u;
  const P = (u: number, v: number) => {
    let x = lead(u) - v * width(u);
    if (mirror) x = W - x;
    const y = H - 4 - u * (H - 8);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  };
  const vs = hind ? [0, 0.06, 0.13, 0.23, 0.36, 0.51, 0.67, 0.84, 1] : [0, 0.07, 0.15, 0.27, 0.42, 0.6, 0.79, 1];
  const panes = ["#f2dc8c", "#eef7f0", "#cdeef2", "#e6e2f5", "#f6e9b8"];
  let fills = "";
  let cross = "";
  for (let k = 0; k < vs.length - 1; k++) {
    const v0 = vs[k], v1 = vs[k + 1];
    const n = k < 2 ? 40 : 28;
    const cuts = [0];
    for (let j = 1; j < n; j++) cuts.push((j + (R() - 0.5) * 0.7) / n);
    cuts.push(1);
    for (let i = 0; i < cuts.length - 1; i++) {
      const u0 = cuts[i], u1 = cuts[i + 1];
      const r = R();
      const pick = panes[Math.floor(R() * panes.length)];
      let fill: string | null = null;
      if (u0 < 0.05) fill = "#d9a441";
      else if (k === 0 && u0 >= 0.8 && u1 <= 0.9) fill = "#7a4e16";
      else if (u0 < 0.25 && r < 0.55) fill = r < 0.3 ? "#f2dc8c" : "#f6e9b8";
      else if (r < 0.4) fill = pick;
      if (fill) {
        const pts = [P(u0, v0), P((u0 + u1) / 2, v0), P(u1, v0), P(u1, v1), P((u0 + u1) / 2, v1), P(u0, v1)].join(" ");
        fills += `<polygon points="${pts}" fill="${fill}"/>`;
      }
      if (i > 0) cross += `<line x1="${P(u0, v0).split(",")[0]}" y1="${P(u0, v0).split(",")[1]}" x2="${P(u0, v1).split(",")[0]}" y2="${P(u0, v1).split(",")[1]}"/>`;
    }
  }
  let longs = "";
  vs.forEach((v, k) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) pts.push(P(i / 60, v));
    const isCosta = k === 0;
    const stroke = isCosta ? "#c9a23c" : "#1d2226";
    const w = isCosta ? 3 : k === vs.length - 1 ? 1.8 : 1.6;
    longs += `<polyline points="${pts.join(" ")}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  });
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${fills}<g stroke="#2a3034" stroke-width="1.15" stroke-linecap="round">${cross}</g>${longs}</svg>`;
  return svg(markup, { size: 1024 });
}

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly" });

  // ---------- skeleton ----------
  const C = new THREE.Vector3(0, Y0, 0.006);
  const thorax = b.joint("thorax", { at: C, dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, Y0 + 0.0005, 0.0155], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.0045, down: 0.0032 }),
    aim: head.local({ forward: 0.0085, down: 0.0046 }),
    role: "jaw",
  });
  const abd = b.chain(
    "abdomen",
    catmull([
      [0, Y0 - 0.0005, -0.001],
      [0, Y0 - 0.0016, -0.02],
      [0, Y0 - 0.0021, -0.04],
      [0, Y0 - 0.0015, -0.056],
    ]),
    { parent: thorax, count: 7, role: "tail" },
  );

  // ---------- thorax ----------
  const thoraxPaint = paint((p, n) => {
    const qx = p.x - C.x, qy = p.y - C.y, qz = p.z - C.z;
    if (Math.abs(qx) < 0.0005 && qy > 0.002) return "#3f7d1c";
    const d = qz * 0.85 + qy * 0.55;
    if (Math.abs(n.x) > 0.35 && (Math.abs(d - 0.0012) < 0.00035 || Math.abs(d + 0.0028) < 0.0003)) return "#1c2410";
    if (qy < -0.003) return "#b2e464";
    return "#7fd63a";
  });
  b.part(new THREE.SphereGeometry(1, 12, 9), thoraxPaint, {
    bone: thorax, at: C, scale: [0.0058, 0.0068, 0.0088], rotation: [12, 0, 0], flat: true, name: "thoraxBody",
  });
  b.part(new THREE.SphereGeometry(0.0024, 8, 6), "#5fae2c", { bone: thorax, at: [0, Y0, 0.0138], flat: true, name: "prothorax" });

  // ---------- abdomen ----------
  const abdPaint = paint((_p, _n, s) => {
    const t = s[0];
    let d = ((s[1] % 360) + 360) % 360;
    if (d > 180) d -= 360;
    const ad = Math.abs(d);
    if (t < 0.12) {
      if (ad < 14) return BLACK;
      if (t < 0.03) return "#2fae8f";
      return ad > 130 ? "#1670c8" : BLUE;
    }
    const L = 0.11;
    const x = (t - 0.12) / L;
    const f = x - Math.floor(x);
    if (f < 0.07) return BLACK;
    if (ad < 10) return BLACK;
    const spread = 12 + 55 * sstep(0.3, 0.92, f);
    if (f > 0.3 && ad < spread) return BLACK;
    if (ad > 135) return "#1670c8";
    if (ad > 70) return "#4fd0ff";
    return BLUE;
  });
  b.sweep(abd, [0.0034, 0.0043, 0.0028, 0.0024, 0.0023, 0.0023, 0.0022, 0.0022, 0.0022, 0.0023, 0.0021], {
    color: abdPaint, name: "abdomen",
  });
  const lastSeg = abd.joints[abd.joints.length - 1];
  for (const s of [1, -1]) {
    b.spike([s * 0.0008, Y0 - 0.0011, -0.0565], [s * 0.25, 0.12, -1], 0.0036, 0.00045, { color: BLACK, bone: lastSeg });
  }
  b.spike([0, Y0 - 0.0024, -0.0565], [0, -0.1, -1], 0.0022, 0.0004, { color: BLACK, bone: lastSeg });

  // ---------- head ----------
  const eyeTop = scales(["#19d6cf", "#22c3e3", "#2ee6c4"], "#0b5d66", { size: 0.0008, seed: 3 });
  const eyeLow = scales(["#7ed957", "#9be06a", "#8fe0a0"], "#356b32", { size: 0.0008, seed: 3 });
  const eyePaint = countershade(eyeTop, eyeLow, { level: -0.35 });
  b.part(new THREE.SphereGeometry(0.0036, 10, 8), "#203018", {
    bone: head, at: head.local({ back: 0.0006, up: 0.0004 }), flat: true, name: "occiput",
  });
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.0043, 14, 10), eyePaint, {
      bone: head, at: head.local({ left: s * 0.0028, up: 0.0012, forward: 0.0035 }), flat: true, name: s > 0 ? "eyeL" : "eyeR",
    });
    const es = b.surface(eye).around(eye);
    const pupil = es.at(s * 38, 8);
    if (pupil) b.stick(new THREE.CylinderGeometry(0.0011, 0.0011, 0.0003, 8), "#04363c", pupil, { embed: 0.5, bone: head });
    const glint = es.at(s * 15, 48);
    if (glint) b.stick(new THREE.SphereGeometry(0.0007, 6, 4), "#eaffff", glint, { embed: 0.3, scale: [1, 0.4, 1], bone: head });
    b.spike(head.local({ forward: 0.0066, up: 0.0016, left: s * 0.0008 }), [s * 0.25, 0.55, 1], 0.0028, 0.00018, {
      color: BLACK, bone: head,
    });
  }
  b.part(new THREE.SphereGeometry(0.0026, 10, 8), "#c6e04a", {
    bone: head, at: head.local({ forward: 0.0065, down: 0.0012 }), scale: [1.25, 1, 0.85], flat: true, name: "frons",
  });
  b.part(new THREE.BoxGeometry(0.0016, 0.0005, 0.0006), BLACK, {
    bone: head, at: head.local({ forward: 0.0084, down: 0.0002 }), name: "fronsMark",
  });
  b.part(new THREE.BoxGeometry(0.0036, 0.0012, 0.0018), "#e0d860", {
    bone: head, at: head.local({ forward: 0.0072, down: 0.0028 }), name: "labrum",
  });
  b.part(new THREE.BoxGeometry(0.0034, 0.0035, 0.0012), "#d8c870", {
    bone: jaw, frame: jaw.moved(jaw.local([0, 0.0018, 0])), name: "labium",
  });

  // ---------- wings ----------
  const tex = {
    fore: [wingTexture(false, false), wingTexture(false, true)],
    hind: [wingTexture(true, false), wingTexture(true, true)],
  };
  const wings = [
    { id: "F", y: 0.0055, z: 0.0085, len: 0.048, chord: 0.012, sw: 0.12, off: 0.27, hind: false },
    { id: "H", y: 0.0042, z: 0.0005, len: 0.046, chord: 0.0145, sw: -0.06, off: 0.1, hind: true },
  ];
  for (const w of wings) {
    for (const s of [1, -1]) {
      const root = new THREE.Vector3(s * 0.0022, Y0 + w.y, w.z);
      const out = new THREE.Vector3(s, 0, w.sw).normalize();
      const fwd = new THREE.Vector3(-out.z * s, 0, out.x * s);
      const wj = b.joint(`wing${w.id}${s > 0 ? "L" : "R"}`, { parent: thorax, at: root, dir: out, role: "wing" });
      const center = root.clone().addScaledVector(out, w.len * 0.5).addScaledVector(fwd, -w.off * w.chord);
      for (const top of [true, false]) {
        const mirrored = top ? s < 0 : s > 0;
        const t = (w.hind ? tex.hind : tex.fore)[mirrored ? 1 : 0];
        b.part(new THREE.PlaneGeometry(w.chord, w.len), "#ffffff", {
          bone: wj,
          at: center.clone().add(new THREE.Vector3(0, top ? 0.00003 : -0.00003, 0)),
          dir: [0, top ? 1 : -1, 0],
          axis: "z",
          up: [out.x, 0, out.z],
          texture: t,
          name: `wing${w.id}${s > 0 ? "L" : "R"}${top ? "Top" : "Bot"}`,
        });
      }
      b.part(new THREE.BoxGeometry(0.0022, 0.0012, 0.003), "#2d4a17", {
        bone: thorax, at: [s * 0.0029, Y0 + w.y, w.z - 0.0008], name: `wingBase${w.id}${s > 0 ? "L" : "R"}`,
      });
    }
  }

  // ---------- legs ----------
  const ids = ["F", "M", "H"];
  for (let k = 0; k < 3; k++) {
    for (const s of [1, -1]) {
      const id = ids[k] + (s > 0 ? "L" : "R");
      const rz = [0.0115, 0.0085, 0.0055][k];
      const pts = [
        [s * 0.0018, Y0 - 0.0052, rz],
        [s * (0.0058 + 0.0009 * k), Y0 - 0.0068, rz - 0.0012 * k],
        [s * (0.0042 + 0.0012 * k), Y0 - 0.0118, rz + 0.0035 - 0.001 * k],
        [s * (0.0034 + 0.0012 * k), Y0 - 0.0132, rz + 0.0072 - 0.0018 * k],
      ];
      const leg = b.chain(`leg${id}`, polyline(pts), {
        parent: thorax, names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`], role: "leg", group: "legs",
      });
      b.sweep(leg, [0.00048, 0.00022], { color: (t: number) => (t < 0.12 ? "#5a3c1c" : "#14110d"), sides: 6 });
      if (leg.tip) b.spike(leg.tip, [0, -0.8, 0.6], 0.0011, 0.00014, { color: "#3a2a18", bone: leg.tip });
    }
  }

  return b.root;
}
