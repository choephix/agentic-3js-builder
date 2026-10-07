import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  limb,
  paint,
  scales,
  mottle,
  countershade,
  svg,
  offset,
} from "../../../../src/index";

export const meta = {
  name: "Nine-banded Armadillo",
  description:
    "A stylized nine-banded armadillo: dusty pinkish-tan banded carapace with scaled shields, a pointy snout on a hinged jaw, tall leathery ears, beady eyes, clawed feet, a ringed tapering tail and pale hairs poking out between the bands.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo", paintSize: 2048 });

  // palette
  const SHELL = "#c9a08a";
  const SHELL_MID = "#b88f7b";
  const SHELL_DARK = "#7f5c50";
  const SHELL_LIGHT = "#e6c8b2";
  const SKIN = "#b58c84";
  const SKIN_DARK = "#7a5c57";
  const BELLY = "#d9b8ac";
  const HEAD_SKIN = "#c49a8f";
  const EAR = "#a67a72";
  const EAR_DARK = "#7e5852";
  const CLAW = "#ece0c8";
  const EYE = "#140e10";
  const NOSE = "#4a3232";
  const HAIR = "#f4ead6";

  // paints
  const dusty = mottle(SHELL, SHELL_MID, { size: 0.05, seed: 4 });
  const plate = scales(dusty, SHELL_DARK, { size: 0.016, seed: 3 });
  const B0 = 0.34;
  const B1 = 0.66;
  const shellPaint = paint((_p, _n, s) => {
    const t = s[0];
    if (t < B0 || t > B1) return plate;
    const u = ((t - B0) / (B1 - B0)) * 9;
    const f = u - Math.floor(u);
    if (f < 0.13) return SHELL_DARK;
    if (f > 0.84) return SHELL_LIGHT;
    const deg = ((s[1] % 360) + 360) % 360;
    const tile = Math.floor(deg / 9) % 2 === 0;
    return tile ? dusty : SHELL_MID;
  });
  const headShield = scales(SHELL, SHELL_DARK, { size: 0.011, seed: 8 });
  const headPaint = paint((_p, n) => (n.y > 0.45 ? headShield : HEAD_SKIN));
  const bodyPaint = countershade(mottle(SKIN, SKIN_DARK, { size: 0.03, seed: 2 }), BELLY, { level: -0.25 });
  const legPaint = scales(SKIN, SKIN_DARK, { size: 0.011, seed: 6 });
  const tailScales = scales(dusty, SHELL_DARK, { size: 0.012, seed: 9 });
  const tailPaint = paint((_p, _n, s) => {
    const u = s[0] * 13;
    const f = u - Math.floor(u);
    return f < 0.18 ? SHELL_DARK : f > 0.85 ? SHELL_LIGHT : tailScales;
  });
  const earPaint = mottle(EAR, EAR_DARK, { size: 0.012, seed: 12 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.155, -0.15], dir: [0, 0.1, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.155, -0.15],
      [0, 0.17, -0.04],
      [0, 0.165, 0.06],
      [0, 0.15, 0.14],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.15, 0.14],
      [0, 0.16, 0.18],
    ],
    { parent: spine, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.16, 0.18], dir: [0, -0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.14, 0.19], aim: [0, 0.115, 0.3], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.15, -0.16],
      [0, 0.135, -0.26],
      [0, 0.11, -0.37],
      [0, 0.075, -0.48],
    ]),
    { parent: hips, count: 5, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.sweep(
    spine,
    (t) => [0.068 + 0.014 * Math.sin(Math.PI * t), 0.056 + 0.01 * Math.sin(Math.PI * t)],
    { color: bodyPaint, sides: 12, shift: [0, -0.004] },
  );

  const shell = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * t);
      const e =
        t > 0.82 ? 1 - 0.5 * ((t - 0.82) / 0.18) ** 2 : t < 0.1 ? 1 - 0.25 * ((0.1 - t) / 0.1) ** 2 : 1;
      return [(0.098 + 0.02 * k) * e, (0.058 + 0.02 * k) * e];
    },
    { shift: [0, 0.022], color: shellPaint, sides: 16 },
  );

  // band lips: raised arcs over the back at every band edge
  for (let i = 0; i <= 9; i++) {
    const t = B0 + ((B1 - B0) * i) / 9;
    const pts: THREE.Vector3[] = [];
    for (let d = -104; d <= 104; d += 13) pts.push(shell.at(t, d, 0.001).at.clone());
    const edge = i === 0 || i === 9;
    b.sweep(catmull(pts), edge ? 0.0055 : 0.004, {
      bone: spine.jointAt(t),
      color: edge ? SHELL_DARK : SHELL_LIGHT,
      sides: 6,
    });
  }
  // lower rim of the carapace
  for (const s of [1, -1]) {
    b.sweep(shell.line(s * 104, 0.001), 0.005, { bone: spine, color: SHELL_DARK, sides: 6 });
  }

  // ---------- head ----------
  const headLoft = b.loft(
    [
      { at: [0, 0.168, 0.175], w: 0.085, h: 0.075 },
      { at: [0, 0.165, 0.22], w: 0.07, h: 0.06 },
      { at: [0, 0.145, 0.27], w: 0.035, h: 0.032 },
      { at: [0, 0.131, 0.315], w: 0.018, h: 0.018 },
    ],
    { bone: head, color: headPaint, sides: 10 },
  );
  b.loft(
    [
      { at: [0, 0.135, 0.2], w: 0.05, h: 0.025 },
      { at: [0, 0.122, 0.26], w: 0.028, h: 0.016 },
      { at: [0, 0.117, 0.3], w: 0.012, h: 0.01 },
    ],
    { bone: jaw, color: HEAD_SKIN, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(0.01, 8, 6), NOSE, {
    bone: head,
    at: [0, 0.131, 0.322],
    scale: [1.1, 0.85, 0.6],
  });

  const headSurf = b.surface(headLoft);
  for (const s of [1, -1]) {
    const hit = headSurf.nearest([s * 0.04, 0.182, 0.225]);
    b.stick(new THREE.SphereGeometry(0.0068, 8, 6), EYE, hit, { embed: 0.45, bone: head });
    b.part(new THREE.SphereGeometry(0.0022, 5, 4), "#ffffff", {
      bone: head,
      at: offset(hit.local([0, 0.0066, 0]), [0, 1, 0.4], 0.002),
    });
  }

  // ears
  const earOutline: [number, number][] = [
    [-0.016, 0],
    [0.016, 0],
    [0.02, 0.025],
    [0.011, 0.05],
    [0, 0.058],
    [-0.012, 0.045],
    [-0.018, 0.02],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const earDir: [number, number, number] = [s * 0.55, 1, -0.3];
    const earJ = b.joint(`ear${S}`, { parent: head, at: [s * 0.026, 0.19, 0.19], dir: earDir, role: "hinge" });
    b.extrude(earOutline, {
      at: earJ.at,
      x: [0, 0.3, 1],
      y: earDir,
      thickness: 0.005,
      bevel: 0.0015,
      smoothing: 2,
      color: earPaint,
      bone: earJ,
    });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const F = front ? "F" : "H";
      const root: [number, number, number] = front ? [s * 0.055, 0.14, 0.09] : [s * 0.055, 0.135, -0.11];
      const tx = s * 0.068;
      const tz = front ? 0.11 : -0.11;
      const pts = limb(root, [tx, 0.014, tz], front ? [0.072, 0.07] : [0.07, 0.075], [
        front ? [0, 0, -1] : [0, 0, 1],
      ]);
      const leg = b.chain(`leg${F}${S}`, pts, {
        parent: front ? spine.joints[2] : hips,
        names: front ? [`shoulder${S}`, `elbow${S}`, `hand${S}`] : [`hip${S}`, `knee${S}`, `foot${S}`],
        role: "leg",
        contact: [tx, 0, tz],
      });
      b.sweep(leg, front ? [0.026, 0.02, 0.016] : [0.032, 0.022, 0.017], { color: legPaint, sides: 8 });
      const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.021, 8, 5), SKIN_DARK, {
        bone: foot,
        at: [tx, 0.012, tz + 0.01],
        scale: [1, 0.55, 1.35],
      });
      const n = front ? 4 : 5;
      for (let j = 0; j < n; j++) {
        const off = j - (n - 1) / 2;
        const outer = j === 0 || j === n - 1;
        const len = front ? (outer ? 0.014 : 0.025) : 0.016;
        b.spike([tx + off * 0.008, 0.01, tz + 0.028], [off * 0.15, -0.33, 1], len, 0.0042, {
          color: CLAW,
          bone: foot,
          sides: 6,
        });
      }
    }
  }

  // ---------- tail ----------
  const tailSweep = b.sweep(tail, (t) => 0.034 * (1 - t) + 0.004, {
    color: tailPaint,
    sides: 10,
    caps: { start: "round", end: "point" },
  });
  const tailSurf = b.surface(tailSweep);
  for (let i = 0; i < 11; i++) {
    const t = 0.06 + i * 0.078;
    const loop = tailSurf.loop(tail.at(t), { lift: 0.001 });
    b.sweep(loop, 0.0026 + 0.003 * (1 - t), { color: SHELL_DARK, sides: 5 });
  }

  // ---------- coarse pale hairs ----------
  const hairTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><g stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M16 64 Q14 36 9 5"/><path d="M18 64 Q22 34 26 10"/><path d="M15 64 Q17 30 16 1"/></g></svg>`,
    { size: 128 },
  );
  const hash = (a: number) => {
    const j = Math.sin(a) * 43758.5453;
    return j - Math.floor(j);
  };
  const hairFrames: ReturnType<typeof shell.at>[] = [];
  for (let i = 0; i <= 9; i++) {
    const t = B0 + ((B1 - B0) * i) / 9 - 0.004;
    for (let d = -100; d <= 100; d += 15) {
      const fr = hash(i * 12.9898 + d * 78.233);
      if (fr < 0.4) continue;
      hairFrames.push(shell.at(t, d + (fr - 0.5) * 10, 0));
    }
  }
  for (let i = 0; i < 8; i++) {
    const t = 0.15 + i * 0.1;
    for (const d of [-55, -25, 0, 25, 55]) {
      if (hash(i * 3.7 + d * 1.3) < 0.45) continue;
      hairFrames.push(body.at(t, 180 + d, 0));
    }
  }
  b.cards(hairFrames, hairTex, {
    size: [0.016, 0.032],
    lean: 30,
    vary: 0.3,
    spin: 20,
    rng: rng(5),
    color: HAIR,
  });

  return b.root;
}
