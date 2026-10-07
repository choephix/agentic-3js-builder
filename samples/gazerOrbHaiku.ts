import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { bayer, cellPaint, pick, pixelTexture, stepped } from "../kits/pixel";
import { glow } from "../kits/glow";

export const meta = {
  name: "Gazer Orb",
  description:
    "A floating eye-orb monster: a violet orb with one great eye and a hinged fanged lower jaw, hovering 0.4 m above the floor on a crown of eyestalks and a fringe of trailing tendrils.",
  style: "pixel art",
  commit: "b816db2",
};

// One paint cell and one texture pixel, in metres, so every texel in the model matches.
const TEXEL = 0.02;
const DOT = 0.008;

const LIGHT = new THREE.Vector3(0.5, 0.8, 0.55).normalize();

const BODY = ["#1b0f2e", "#2a1747", "#3d2262", "#533078", "#6b4096", "#8a58b4", "#a676cc"];
const STALK = ["#1d2a18", "#2e4620", "#44692c", "#5f8c3a", "#7fae4e", "#a2cc6a"];
const TENDRIL = ["#241236", "#372060", "#4d2c82", "#6a44a0", "#8c66bc"];
const SCLERA = ["#c9bd98", "#d9cfae", "#e6dcbc", "#f3ecd2"];
const SPINE = ["#5c4a22", "#8a7236", "#b8a052", "#e8d68e"];
const IRIS = ["#0d3e3a", "#17645c", "#2a9a88", "#5fd6b8"];
const TOOTH = "#f3eedf";
const WART = "#b98ad8";
const BEAD = "#7ff5d6";
const MOTE = "#c9fff0";
const EYE_WHITE = "#efe6c8";

const lit = (n: THREE.Vector3) => (n.dot(LIGHT) + 1) / 2;

const bodyPaint = cellPaint(
  TEXEL,
  (c) => {
    let v = lit(c.n);
    if (c.random(4) < 0.07) v -= 0.22;
    if (c.random(9) > 0.96) v += 0.18;
    return c.pick(BODY, v);
  },
  { dither: true },
);

const lipPaint = cellPaint(TEXEL, (c) => c.pick(BODY, 0.15 + 0.4 * lit(c.n)), { dither: true });

const stalkPaint = cellPaint(
  0.01,
  (c) => {
    let v = lit(c.n);
    if ((c.s[0] * 9) % 1 < 0.22) v -= 0.3;
    return c.pick(STALK, v);
  },
  { dither: true },
);

const tendrilPaint = cellPaint(
  0.01,
  (c) => {
    let v = lit(c.n);
    if ((c.s[0] * 6) % 1 < 0.2) v -= 0.25;
    return c.pick(TENDRIL, v);
  },
  { dither: true },
);

const spinePaint = cellPaint(0.01, (c) => c.pick(SPINE, lit(c.n)), { dither: true });

// Eyeballs: cream sclera with a few red veins, shaded like the body.
const scleraPaint = cellPaint(
  0.01,
  (c) => (c.random(12) < 0.05 ? "#b8485a" : c.pick(SCLERA, lit(c.n))),
  { dither: true },
);

// The great eye and the small stalk eyes: a 1-pixel dark rim, a heavy upper lid,
// a dithered teal iris lit from the upper left, a black pupil and a highlight.
function eyeTexture(n: number, seed: number) {
  const R = n / 2;
  const r = rng(seed);
  return pixelTexture(n, n, (g) => {
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const dx = x + 0.5 - R;
        const dy = y + 0.5 - R; // grid y runs down, so negative dy is up
        const d = Math.hypot(dx, dy);
        if (d > R) continue;
        if (d > R - 1) {
          g.set(x, y, "#140a1e");
          continue;
        }
        if (dy < -0.4 * R - 0.2 * Math.abs(dx)) {
          g.set(x, y, "#2a1433");
          continue;
        }
        if (d <= R * 0.22) {
          g.set(x, y, "#07050c");
          continue;
        }
        if (d <= R * 0.55) {
          if (d > R * 0.55 - 1) g.set(x, y, "#0f3b37");
          else g.set(x, y, pick(IRIS, 0.5 + (-dx - dy) / (R * 1.6), bayer(x, y)));
          continue;
        }
        g.set(x, y, d > R - 2 ? "#b9a878" : r() < 0.06 ? "#b8485a" : EYE_WHITE);
      }
    const h = Math.floor(R - R * 0.36);
    g.set(h, h, "#ffffff");
  });
}

const EYE_BIG = eyeTexture(24, 3);
const EYE_SMALL = eyeTexture(12, 5);

// The mouth: a half-ellipse maw with a red tongue and four hanging upper fangs.
const MW = 26;
const MH = 12;
const inMouth = (x: number, y: number) => {
  const dx = (x + 0.5 - MW / 2) / (MW / 2);
  const dy = (y + 0.5) / MH;
  return dx * dx + dy * dy <= 1;
};
const MOUTH = pixelTexture(MW, MH, (g) => {
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      if (!inMouth(x, y)) continue;
      const edge = !inMouth(x - 1, y) || !inMouth(x + 1, y) || !inMouth(x, y - 1) || !inMouth(x, y + 1);
      if (edge) g.set(x, y, "#12061c");
      else if (y >= 9 && Math.abs(x + 0.5 - MW / 2) < 4) g.set(x, y, "#b03a4e");
      else g.set(x, y, y % 2 ? "#4a0d24" : "#3c0a1d");
    }
  for (const fc of [5, 11, 15, 21]) {
    for (const dx of [-1, 0, 1]) g.set(fc + dx, 1, "#f6f1e4");
    for (const dx of [-1, 0]) g.set(fc + dx, 2, "#f6f1e4");
    g.set(fc, 3, "#bdb5cc");
  }
});

// The lower jaw plate, drawn in its own plane (x across, y up) and hinged at the mouth.
const JAW: [number, number][] = [
  [-0.11, 0.0],
  [0.11, 0.0],
  [0.12, -0.03],
  [0.09, -0.07],
  [0, -0.09],
  [-0.09, -0.07],
  [-0.12, -0.03],
];

// The brow ridge: four rows of pixel steps, bottom first, one cell (TEXEL) per step.
const BROW = stepped(
  [
    [-5, 5],
    [-5, 5],
    [-4, 4],
    [-2, 2],
  ],
  TEXEL,
  { rows: true },
);

const STALKS = [
  { name: "stalkA", az: 0, el: 80, len: 0.3 },
  { name: "stalkB", az: 55, el: 45, len: 0.26 },
  { name: "stalkC", az: -55, el: 45, len: 0.26 },
  { name: "stalkD", az: 110, el: 50, len: 0.24 },
  { name: "stalkE", az: -110, el: 50, len: 0.24 },
  { name: "stalkF", az: 150, el: 25, len: 0.22 },
  { name: "stalkG", az: -150, el: 25, len: 0.22 },
];

const TENDRIL_AZ = [-150, -90, -30, 30, 90, 150];
const TIP_Y = 0.41; // lowest point of the model: the hover height

export default function build() {
  const b = createBuilder({ name: "gazerOrb" });
  const C: [number, number, number] = [0, 0.8, 0];
  const R = 0.3;

  const core = b.joint("core", { at: C, role: "spine" });

  const orb = b.part(new THREE.SphereGeometry(R, 14, 10), bodyPaint, {
    bone: core,
    at: C,
    flat: true,
    name: "orb",
  });
  const skin = b.surface(orb);
  const hitAt = (az: number, el: number) => {
    const h = skin.around(C).at(az, el);
    if (!h) throw new Error(`no body surface at azimuth ${az}, elevation ${el}`);
    return h;
  };

  // The great eye, on the front, and the maw under it.
  glow(b.decal(orb, EYE_BIG, { at: skin.nearest([0, C[1] + 0.07, C[2] + 0.3]), size: [24 * DOT, 24 * DOT] }));
  b.decal(orb, MOUTH, { at: skin.nearest([0, C[1] - 0.11, C[2] + 0.28]), size: [MW * DOT, MH * DOT] });
  // A stepped brow ridge on the skin just above the great eye; its plane is tangent
  // to the orb at 35 degrees of elevation.
  const browEl = (35 * Math.PI) / 180;
  b.extrude(BROW, {
    at: [0, C[1] + (R - 0.004) * Math.sin(browEl), C[2] + (R - 0.004) * Math.cos(browEl)],
    x: [1, 0, 0],
    y: [0, Math.cos(browEl), -Math.sin(browEl)],
    thickness: 0.03,
    bevel: 0.004,
    color: lipPaint,
    bone: core,
    name: "brow",
  });

  // Lower jaw: a separate plate on its own joint, with fangs pointing up into the maw.
  const jawY = C[1] - 0.15;
  const jaw = b.joint("jaw", {
    parent: core,
    at: [0, jawY, C[2] + 0.2],
    aim: [0, jawY - 0.3, C[2] + 1.2],
    role: "jaw",
  });
  b.extrude(JAW, {
    at: [0, jawY, C[2] + 0.265],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    smoothing: 1,
    color: lipPaint,
    bone: jaw,
    name: "jawLower",
  });
  for (const x of [-0.09, -0.045, 0, 0.045, 0.09])
    b.spike([x, jawY, C[2] + 0.28], [0, 1, 0], 0.035, 0.01, { bone: jaw, color: TOOTH });

  // A crown of spines round the equator, kept clear of the eye and maw at the front.
  for (const az of [60, 90, 120, 150, 180, 210, 240, 270, 300]) {
    const h = hitAt(az, 0);
    b.spike(h, h, 0.05, 0.018, { color: spinePaint });
  }

  // Warts scattered over the back and flanks, clear of the face and the tendril fringe.
  const warts = skin.scatter(16, {
    rng: rng(7),
    minDist: 0.07,
    filter: (h) => {
      const az = Math.atan2(h.n.x, h.n.z);
      const el = Math.asin(h.n.y);
      return !(Math.abs(az) < 1 && el > -0.7 && el < 0.7) && el > -0.6 && el < 1;
    },
  });
  for (const h of warts) b.stick(new THREE.SphereGeometry(0.02, 6, 4), WART, h, { embed: 0.4 });

  // Eyestalks: each rises from the body on its own joint chain and ends in an eye
  // that faces out from the body, a little toward the viewer.
  for (const s of STALKS) {
    const h = hitAt(s.az, s.el);
    const H = h.at.clone();
    const n = h.n.clone();
    const d = new THREE.Vector3(n.x, n.y + 0.8, n.z).normalize();
    const L = s.len;
    const curl = Math.sign(H.x) * L * 0.12;
    const pts = [
      H,
      H.clone().addScaledVector(d, L * 0.35),
      H.clone().addScaledVector(d, L * 0.7).add(new THREE.Vector3(curl, 0, 0)),
      H.clone().addScaledVector(d, L).add(new THREE.Vector3(curl * 0.6, 0, 0)),
    ];
    const { chain } = b.sprout(s.name, h, pts, [0.03, 0.013], {
      count: 3,
      role: "tentacle",
      color: stalkPaint,
    });
    if (!chain) throw new Error(`stalk ${s.name} has no joints`);

    const tp = chain.at(1);
    const tan = tp.tangent.clone();
    const ballC = tp.at.clone().addScaledVector(tan, 0.045);
    const ball = b.part(new THREE.SphereGeometry(0.07, 10, 8), scleraPaint, {
      bone: tp.bone,
      at: ballC,
      flat: true,
      name: `${s.name}Eye`,
    });
    const out = ballC.clone().sub(new THREE.Vector3(...C)).normalize();
    const facing = out.multiplyScalar(0.7).add(new THREE.Vector3(0, 0, 0.3)).normalize();
    const eyeHit = b.surface(ball).nearest(ballC.clone().addScaledVector(facing, 0.3));
    glow(b.decal(ball, EYE_SMALL, { at: eyeHit, size: [12 * DOT, 12 * DOT] }));
  }

  // Trailing tendrils under the body, each ending in a glowing bead; the tips set the hover height.
  TENDRIL_AZ.forEach((az, i) => {
    const h = hitAt(az, -62);
    const H = h.at.clone();
    const n = h.n.clone();
    const sway = Math.sign(H.x) * 0.035;
    const pts = [
      H,
      new THREE.Vector3(H.x + n.x * 0.05, H.y - 0.05, H.z + n.z * 0.05),
      new THREE.Vector3(H.x + n.x * 0.08 + sway, 0.45, H.z + n.z * 0.08),
      new THREE.Vector3(H.x + n.x * 0.1 + sway, TIP_Y, H.z + n.z * 0.1),
    ];
    const { chain } = b.sprout(`tendril${String.fromCharCode(65 + i)}`, h, pts, [0.02, 0.006], {
      count: 2,
      role: "tentacle",
      color: tendrilPaint,
    });
    if (!chain) throw new Error(`tendril ${i} has no joints`);
    const tp = chain.at(1);
    glow(
      b.part(new THREE.SphereGeometry(0.02, 6, 4), BEAD, {
        bone: tp.bone,
        at: [tp.at.x, TIP_Y + 0.02, tp.at.z],
        name: `tendrilBead${i}`,
      }),
    );
  });

  // Pixel dust: tiny glowing cubes drifting round the orb, one pixel each.
  const motes = rng(21);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + motes() * 0.5;
    const rr = 0.44 + motes() * 0.14;
    const y = 0.62 + motes() * 0.75;
    glow(
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), MOTE, {
        bone: core,
        at: [Math.sin(a) * rr, y, Math.cos(a) * rr],
        name: `mote${i}`,
      }),
    );
  }

  return b.root;
}
