```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  polyline,
  paint,
  mottle,
  smoothstep,
  lerp,
  frame,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly hovering above a small pond: electric-blue abdomen with a black dorsal stripe, apple-green thorax, faceted turquoise wraparound eyes and four glassy, vein-netted wings held flat, over rippling water with lily pads, reeds and grass.",
};

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly" });
  const R0 = rng(42) as unknown as any;
  const rand = (): number => (typeof R0 === "function" ? R0() : R0.next());
  const wrapDeg = (d: number) => (((d % 360) + 540) % 360) - 180;

  // ---------- palette ----------
  const BLUE = "#1e9bff";
  const BLUE_D = "#0d4f9e";
  const BLACK = "#0f1216";
  const GREEN = "#8fd43c";
  const GREEN_D = "#4f9a2a";
  const LEG = "#1b1d1f";
  const FACE = "#d4e04c";

  const H = 0.13; // hover height

  // ---------- skeleton ----------
  const ground = b.joint("ground", { at: [0, 0, 0] });
  const thorax = b.joint("thorax", { parent: ground, at: [0, H, 0.016], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, H + 0.001, 0.034], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.0045, down: 0.0042 }),
    aim: head.local({ forward: 0.0068, down: 0.0054 }),
    role: "jaw",
  });
  const abdPath = catmull([
    [0, H + 0.0005, 0.007],
    [0, H, -0.008],
    [0, H - 0.001, -0.025],
    [0, H - 0.0025, -0.042],
    [0, H - 0.004, -0.054],
  ]);
  const abd = b.chain("abdomen", abdPath, {
    parent: thorax,
    count: 8,
    names: (i: number) => `abdomen${i + 1}`,
    role: "tail",
  });

  // ---------- paints ----------
  const thoraxPaint = paint((_p, _n, s) => {
    const A = Math.abs(wrapDeg(s[1]));
    const t = s[0];
    if (A > 140) return "#c9d860";
    if (A > 55 && A < 125) {
      const k = t * 2.2 + (A - 90) / 120;
      const f = k - Math.floor(k);
      if (f < 0.07) return "#34461f";
    }
    if (A < 16 && t > 0.25) return GREEN_D;
    return GREEN;
  });

  const abdPaint = paint((_p, _n, s) => {
    const t = s[0];
    const A = Math.abs(wrapDeg(s[1]));
    if (t < 0.09) return A < 95 ? "#46c8c0" : GREEN;
    const u = (t - 0.09) * 10;
    const f = u - Math.floor(u);
    if (f < 0.06) return BLACK;
    const w = 12 + 34 * smoothstep(0.5, 0.95, f) + (Math.abs(f - 0.45) < 0.05 ? 22 : 0);
    if (A < w + t * 18) return BLACK;
    if (A > 140) return BLUE_D;
    return BLUE;
  });

  const eyePaint = paint((_p, n) => (n.y > 0.45 ? "#5ff2e0" : n.y > -0.25 ? "#22cdd0" : "#1478a0"));

  // ---------- thorax ----------
  b.loft(
    [
      { at: [0, H - 0.0004, 0.0045], w: 0.006, h: 0.0068 },
      { at: [0, H, 0.011], w: 0.0088, h: 0.0106 },
      { at: [0, H + 0.0004, 0.021], w: 0.0086, h: 0.0104 },
      { at: [0, H + 0.0006, 0.0285], w: 0.0052, h: 0.006 },
    ],
    { bone: thorax, color: thoraxPaint, name: "thorax" },
  );
  b.part(new THREE.SphereGeometry(0.0022, 8, 6), GREEN_D, { bone: thorax, at: [0, H + 0.0006, 0.0312], flat: true });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.0032, 8, 6), "#35552a", { bone: head, at: head.at, flat: true });
  for (const s of [1, -1]) {
    const ec = head.local({ left: s * 0.0027, up: 0.0013, forward: 0.0018 });
    b.part(new THREE.SphereGeometry(0.0044, 12, 8), eyePaint, { bone: head, at: ec, flat: true, name: s > 0 ? "eyeL" : "eyeR" });
    const hl = new THREE.Vector3(s * 0.4, 0.7, 0.6).normalize().multiplyScalar(0.0042).add(ec);
    b.part(new THREE.SphereGeometry(0.0009, 6, 4), "#e8fffb", { bone: head, at: hl });
    // antennae
    b.spike(head.local({ left: s * 0.0009, up: 0.0005, forward: 0.0058 }), [s * 0.5, 0.5, 0.7], 0.003, 0.00018, {
      bone: head,
      color: BLACK,
    });
    // mandibles
    b.spike(head.local({ left: s * 0.0013, forward: 0.0052, down: 0.0036 }), [-s * 0.5, -0.4, 0.6], 0.0018, 0.0004, {
      bone: head,
      color: "#2a1e10",
    });
  }
  // frons, spot, labrum
  b.part(new THREE.SphereGeometry(0.0028, 8, 6).scale(1.25, 0.95, 0.8), FACE, {
    bone: head,
    at: head.local({ forward: 0.0045, down: 0.0012 }),
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.0008, 6, 4), BLACK, { bone: head, at: head.local({ forward: 0.0064, up: 0.0004 }) });
  b.part(new THREE.BoxGeometry(0.0034, 0.0012, 0.0016), "#e0c040", {
    bone: head,
    at: head.local({ forward: 0.0054, down: 0.0034 }),
  });
  // lower lip (labium) on the jaw
  b.part(new THREE.BoxGeometry(0.004, 0.0026, 0.0012), "#cfb23a", {
    bone: jaw,
    frame: jaw.moved(jaw.local([0, 0.0012, 0])),
  });

  // ---------- abdomen ----------
  b.sweep(abd, [0.0032, 0.0036, 0.0023, 0.0019, 0.002, 0.0021, 0.0021, 0.002, 0.0018, 0.0015], {
    color: abdPaint,
    name: "abdomen",
  });
  const tipJ = abd.joints[abd.joints.length - 1];
  const tipP = abd.at(1).at;
  for (const s of [1, -1])
    b.spike(tipP, [s * 0.25, 0.08, -1], 0.0052, 0.0005, { bone: tipJ, color: BLACK });
  b.spike(tipP, [0, -0.15, -1], 0.0028, 0.0004, { bone: tipJ, color: BLACK });

  // ---------- legs ----------
  const legZ = [0.025, 0.019, 0.013];
  const legF = [0.006, 0.003, 0.0005];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    legZ.forEach((z, i) => {
      const fz = legF[i];
      const pts = [
        [s * 0.0016, H - 0.0042, z],
        [s * (0.0045 + i * 0.0006), H - 0.0075, z + fz],
        [s * (0.0036 + i * 0.0005), H - 0.0102, z + fz - 0.0042],
        [s * 0.0028, H - 0.0108, z + fz - 0.0068],
      ];
      const leg = b.chain(`leg${S}${i + 1}`, polyline(pts), {
        parent: thorax,
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`, `foot${S}${i + 1}`],
        role: "leg",
      });
      b.sweep(leg, [0.00055, 0.00045, 0.00032, 0.0002], { color: LEG, sides: 5 });
      for (let k = 1; k <= 3; k++) {
        const p = lerp(pts[1], pts[2], k / 4);
        b.spike(p, [s * 0.5, -0.5, 0.5], 0.0011, 0.00012, { bone: leg.joints[1], color: LEG });
      }
    });
  }

  // ---------- wings ----------
  const foreOutline =
    "M44 500 L58 500 C70 488 86 460 91 420 C95 320 96 180 95 70 C94 28 84 6 70 6 C52 8 34 40 26 110 C18 200 20 330 30 420 C34 460 38 488 44 500 Z";
  const hindOutline =
    "M42 500 L58 500 C72 486 88 456 92 410 C96 310 96 170 95 70 C94 28 84 6 70 6 C48 8 28 46 18 120 C6 210 4 330 10 410 C16 460 30 480 42 500 Z";
  const wingTex = (outline: string, mirror: boolean) => {
    let veins = "";
    for (const k of [0.15, 0.3, 0.46, 0.62, 0.78]) {
      const x0 = 46 + k * 10;
      const xc = 22 + k * 66;
      const x1 = 26 + k * 64;
      veins += `<path d="M${x0} 500 C${xc} 360 ${x1 + 4} 200 ${x1} 18" stroke="#2f2c22" stroke-width="1.5" fill="none"/>`;
    }
    const tf = mirror ? `transform="translate(100 0) scale(-1 1)"` : "";
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 500">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c4dfe4"/><stop offset="0.55" stop-color="#dcefee"/><stop offset="1" stop-color="#f1dc8e"/></linearGradient>
<linearGradient id="gv" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d9a84a" stop-opacity="0.6"/><stop offset="0.3" stop-color="#e8d290" stop-opacity="0"/></linearGradient>
<pattern id="n" width="9" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(6)"><path d="M0 0 V7 M0 2 H4.5 M4.5 0 V7 M4.5 5.5 H9" stroke="#3b3a30" stroke-width="0.8" fill="none"/></pattern>
<clipPath id="c"><path d="${outline}"/></clipPath>
</defs>
<g ${tf}>
<path d="${outline}" fill="url(#g)"/>
<g clip-path="url(#c)">
<rect width="100" height="500" fill="url(#gv)"/>
<rect width="100" height="500" fill="url(#n)" opacity="0.55"/>
${veins}
<path d="M60 260 L94 262" stroke="#2f2c22" stroke-width="2"/>
<rect x="83" y="46" width="10" height="46" fill="#8a5a24" stroke="#2a1e10" stroke-width="1.5"/>
</g>
<path d="${outline}" fill="none" stroke="#2c2a22" stroke-width="2.4"/>
</g></svg>`,
      { size: 512 },
    );
  };
  const foreA = wingTex(foreOutline, false);
  const foreB = wingTex(foreOutline, true);
  const hindA = wingTex(hindOutline, false);
  const hindB = wingTex(hindOutline, true);

  const wings = [
    { name: "foreWing", z: 0.0205, chord: 0.0115, span: 0.05, sweepZ: 0.12, A: foreA, B: foreB },
    { name: "hindWing", z: 0.0125, chord: 0.0155, span: 0.048, sweepZ: -0.15, A: hindA, B: hindB },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const w of wings) {
      const base = new THREE.Vector3(s * 0.0015, H + 0.0045, w.z);
      const o = new THREE.Vector3(s, 0, w.sweepZ).normalize();
      const lead = new THREE.Vector3().crossVectors(o, new THREE.Vector3(0, 1, 0)).multiplyScalar(s).normalize();
      const wj = b.joint(`${w.name}${S}`, { parent: thorax, at: base, dir: o, role: "wing" });
      const oArr = [o.x, o.y, o.z];
      b.part(new THREE.PlaneGeometry(w.chord, w.span).translate(0, w.span / 2, 0), "#ffffff", {
        bone: wj,
        at: [base.x, base.y + 0.00012, base.z],
        dir: [0, 1, 0],
        axis: "z",
        up: oArr,
        texture: s > 0 ? w.A : w.B,
        name: `${w.name}${S}Top`,
      });
      b.part(new THREE.PlaneGeometry(w.chord, w.span).translate(0, w.span / 2, 0), "#ffffff", {
        bone: wj,
        at: [base.x, base.y - 0.00012, base.z],
        dir: [0, -1, 0],
        axis: "z",
        up: oArr,
        texture: s > 0 ? w.B : w.A,
        name: `${w.name}${S}Bottom`,
      });
      const wp = (u: number, v: number) =>
        base
          .clone()
          .addScaledVector(lead, (u - 0.5) * w.chord)
          .addScaledVector(o, v * w.span)
          .add(new THREE.Vector3(0, 0.0002, 0));
      b.sweep(polyline([wp(0.56, 0.01), wp(0.9, 0.12), wp(0.93, 0.86)]), 0.00025, {
        bone: wj,
        color: "#2b2618",
        sides: 4,
      });
    }
  }

  // ---------- pond ----------
  let dots = "";
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2;
    const r = 62 + rand() * 62;
    dots += `<circle cx="${(128 + Math.cos(a) * r).toFixed(1)}" cy="${(128 + Math.sin(a) * r).toFixed(1)}" r="${(1.2 + rand() * 1.6).toFixed(1)}" fill="${rand() > 0.5 ? "#7fbf4a" : "#a6d45e"}"/>`;
  }
  const waterTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><radialGradient id="w" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2f8f8a"/><stop offset="0.7" stop-color="#1f6a6e"/><stop offset="1" stop-color="#2d4a32"/></radialGradient></defs>
<rect width="256" height="256" fill="url(#w)"/>
<ellipse cx="88" cy="72" rx="42" ry="13" fill="#8fd6d0" opacity="0.35"/>
<path d="M36 96 Q90 84 146 96" stroke="#6fc4c4" stroke-width="3" opacity="0.5" fill="none"/>
<path d="M150 190 Q190 180 222 192" stroke="#6fc4c4" stroke-width="2.5" opacity="0.45" fill="none"/>
<g opacity="0.3" fill="#0d3238"><ellipse cx="128" cy="138" rx="3" ry="22"/><ellipse cx="128" cy="124" rx="40" ry="4"/><ellipse cx="128" cy="132" rx="38" ry="5"/></g>
<circle cx="128" cy="128" r="14" fill="none" stroke="#d6f5ee" stroke-width="2.5" opacity="0.9"/>
<circle cx="128" cy="128" r="28" fill="none" stroke="#d6f5ee" stroke-width="2" opacity="0.7"/>
<circle cx="128" cy="128" r="46" fill="none" stroke="#c6efe6" stroke-width="2" opacity="0.5"/>
<circle cx="128" cy="128" r="68" fill="none" stroke="#b6e6dc" stroke-width="1.5" opacity="0.35"/>
${dots}
</svg>`,
    { size: 512 },
  );
  b.part(new THREE.CircleGeometry(0.152, 28), "#ffffff", {
    bone: ground,
    at: [0, 0.006, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: waterTex,
    name: "water",
  });
  b.lathe(
    [
      [0.148, 0],
      [0.205, 0],
      [0.2, 0.006],
      [0.185, 0.012],
      [0.16, 0.011],
      [0.148, 0.007],
    ],
    { at: [0, 0, 0], segments: 18, smoothing: 1, color: mottle("#5b4a2e", "#4e6a2c", { size: 0.025 }), bone: ground, name: "bank" },
  );

  // pebbles
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.158 + rand() * 0.04;
    const sz = 0.005 + rand() * 0.005;
    b.part(new THREE.IcosahedronGeometry(sz, 0).scale(1, 0.6, 1), rand() > 0.5 ? "#8a8578" : "#a39e8f", {
      bone: ground,
      at: [Math.sin(a) * r, 0.009, Math.cos(a) * r],
      rotation: [0, rand() * 360, 0],
      flat: true,
    });
  }

  // grass tufts
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
<path d="M14 64 C13 40 8 20 3 2 C11 20 17 40 18 64Z" fill="#6aa83a"/>
<path d="M15 64 C16 36 20 18 28 6 C23 20 19 40 19 64Z" fill="#88c048"/>
<path d="M13 64 C12 46 10 34 6 24 C13 34 16 46 17 64Z" fill="#4f8a2c"/>
<path d="M16 64 C17 30 16 14 17 0 C19 14 20 30 19 64Z" fill="#7ab842"/>
</svg>`,
    { size: 128 },
  );
  const tufts = [];
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.166 + rand() * 0.022;
    tufts.push(frame([Math.sin(a) * r, 0.0105, Math.cos(a) * r], [0, 1, 0]));
  }
  b.cards(tufts, grassTex, { size: [0.035, 0.05], cross: true, vary: 0.3, spin: 180, rng: rng(9), bone: ground });

  // reeds
  const REED = "#5d8c34";
  const reedAngles = [-150, -138, -165, -125, -176, 148, 136];
  reedAngles.forEach((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const r = 0.172 + rand() * 0.015;
    const base = [r * Math.sin(rad), 0.008, r * Math.cos(rad)];
    const h = (0.17 + rand() * 0.09) * (i >= 5 ? 0.7 : 1);
    const lx = (rand() - 0.5) * 0.04;
    const lz = (rand() - 0.5) * 0.04 - 0.01;
    const tip = [base[0] + lx, h, base[2] + lz];
    const mid = [base[0] + lx * 0.5, (h + 0.008) / 2, base[2] + lz * 0.5];
    b.sweep(catmull([base, mid, tip]), [0.0026, 0.0005], {
      bone: ground,
      color: REED,
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
    if (i === 0 || i === 3)
      b.capsule(lerp(base, tip, 0.7), lerp(base, tip, 0.85), 0.0048, { bone: ground, color: "#6b3a1c", sides: 7 });
  });
  // reed leaves
  for (const deg of [-145, -160, -130, 142]) {
    const rad = (deg * Math.PI) / 180;
    const r = 0.178;
    const base = [r * Math.sin(rad), 0.008, r * Math.cos(rad)];
    const out = [Math.sin(rad), 0, Math.cos(rad)];
    const h = 0.09 + rand() * 0.05;
    b.sweep(
      bezier(base, [base[0], h * 0.7, base[2]], [base[0] + out[0] * 0.05, h, base[2] + out[2] * 0.05], [
        base[0] + out[0] * 0.08,
        h * 0.75,
        base[2] + out[2] * 0.08,
      ]),
      (t: number) => [0.0035 * (1 - t) + 0.0004, 0.0006],
      { bone: ground, color: "#6f9e3c", caps: { start: "flat", end: "point" }, sides: 6 },
    );
  }

  // lily pads
  const pads = [
    { x: 0.075, z: -0.06, R: 0.026, rot: 30 },
    { x: -0.085, z: 0.045, R: 0.03, rot: 200 },
    { x: 0.055, z: 0.09, R: 0.02, rot: 110 },
    { x: -0.04, z: -0.1, R: 0.022, rot: 290 },
  ];
  for (const pd of pads) {
    const out: OutlinePoint[] = [];
    const n = 14;
    for (let k = 0; k <= n; k++) {
      const ang = ((14 + (k * 332) / n) * Math.PI) / 180;
      const pt: OutlinePoint = k === 0 || k === n ? [pd.R * Math.cos(ang), pd.R * Math.sin(ang), "sharp"] : [pd.R * Math.cos(ang), pd.R * Math.sin(ang)];
      out.push(pt);
    }
    out.push([0, 0, "sharp"]);
    const R = pd.R;
    const padPaint = paint((_p, _n, s) => {
      const ang = Math.atan2(s[1], s[0]);
      const f = (((ang / (Math.PI * 2)) * 14 + 14) % 1 + 1) % 1;
      const rr = Math.hypot(s[0], s[1]);
      if (rr > R * 0.9) return "#3d6e2a";
      if (f < 0.08 && rr > 0.003) return "#7fb04a";
      return "#4f8f36";
    });
    const a = (pd.rot * Math.PI) / 180;
    b.extrude(out, {
      at: [pd.x, 0.0068, pd.z],
      x: [Math.cos(a), 0, Math.sin(a)],
      y: [-Math.sin(a), 0, Math.cos(a)],
      thickness: 0.0012,
      smoothing: 1,
      color: padPaint,
      bone: ground,
    });
  }

  // water lily flower
  const fc = [-0.082, 0.0075, 0.042];
  b.ring(frame(fc, [0, 1, 0]), { count: 8, radius: 0.004, tilt: 35 }, (it) =>
    b.stick(new THREE.SphereGeometry(1, 6, 4).scale(0.0035, 0.009, 0.0018).translate(0, 0.009, 0), "#f4a6c8", it, {
      embed: 0.05,
      bone: ground,
    }),
  );
  b.ring(frame([fc[0], fc[1] + 0.001, fc[2]], [0, 1, 0]), { count: 6, radius: 0.002, tilt: 60, fromDeg: 30, toDeg: 330 }, (it) =>
    b.stick(new THREE.SphereGeometry(1, 6, 4).scale(0.0026, 0.007, 0.0014).translate(0, 0.007, 0), "#fbd3e4", it, {
      embed: 0.05,
      bone: ground,
    }),
  );
  b.part(new THREE.SphereGeometry(0.003, 6, 4), "#f2c43a", { bone: ground, at: [fc[0], fc[1] + 0.002, fc[2]], flat: true });

  return b.root;
}
```