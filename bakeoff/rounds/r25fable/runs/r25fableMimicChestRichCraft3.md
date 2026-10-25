```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  resolve,
  catmull,
  polyline,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Mimic Chest",
  description:
    "A D&D treasure-chest mimic: iron-banded oak chest with a gaping fanged maw, a long curling tongue, wood-flesh pseudopod legs and hungry yellow eyes.",
};

export default function build() {
  const b = createBuilder({ name: "mimic" });
  const R = rng(7);

  // ---------------------------------------------------------------- dimensions
  const W = 0.92; // across (x)
  const D = 0.62; // deep (z)
  const Y0 = 0.14; // body bottom
  const Y1 = 0.56; // rim / lid hinge height
  const LIDH = 0.22; // lid dome height
  const HX = W / 2;
  const HZ = D / 2;

  // ---------------------------------------------------------------- paints
  const WOOD = paint((p, n) => {
    const q = new THREE.Vector3(p.x * 0.12, p.y, p.z); // streaks run along x
    const g = noise(q, 0.012, 3);
    let c = mix("#6a3f22", "#a9743f", smoothstep(0.25, 0.8, g * 0.65 + 0.35 * noise(p, 0.09, 4)));
    const side = Math.abs(n.y) < 0.6;
    const coord = side ? p.y : p.z;
    const f = (((coord + 0.03) / 0.105) % 1 + 1) % 1;
    if (f < 0.05) c = mix(c, "#24130a", 0.85);
    else if (f < 0.1) c = mix(c, "#c89054", 0.25);
    if (noise(p, 0.03, 5) > 0.72) c = mix(c, "#3d2412", 0.35); // knots and stains
    c = mix(c, "#3a2a1c", smoothstep(0.28, 0.12, p.y) * 0.55); // grime at the feet
    c = mix(c, "#caa066", 0.14 * smoothstep(0.3, 1, n.y)); // sun on the top
    return c;
  });
  const IRON = metal("iron", { tarnish: 0.55, polish: 0.25 });
  const GILT = metal("gilt", { tarnish: 0.25 });
  const FLESH = paint((p, n) => {
    const g = noise(p, 0.04, 11);
    let c = mix("#b1404f", "#e0727f", g);
    const cl = cells(p, 0.035, 12);
    if (cl.d2 - cl.d1 < 0.08) c = mix(c, "#7c1f30", 0.45); // vein web
    c = mix(c, "#6e1a2b", smoothstep(0.6, -0.4, n.y) * 0.5);
    return c;
  });
  const GUM = paint((p, n) => mix(resolve(FLESH, p, n), "#f29aa6", 0.35 * smoothstep(0.2, 0.9, n.y)));
  const TONGUE = paint((p, n, s) => {
    const d = ((s[1] % 360) + 360) % 360;
    const dd = Math.min(d, 360 - d);
    let c = mix("#c74a63", "#f088a0", noise(p, 0.03, 21));
    const cl = cells(p, 0.022, 22);
    if (cl.d1 < 0.32 && dd < 110) c = mix(c, "#f9bfc9", 0.55); // taste buds
    if (dd < 9 && s[0] < 0.92) c = mix(c, "#7f1e34", 0.6); // centre groove
    c = mix(c, "#8a2a3c", smoothstep(0.3, -0.7, n.y) * 0.45);
    return c;
  });
  const HYBRID = paint((p, n) => {
    const t = smoothstep(0.42, 0.6, noise(p, 0.07, 31) + 0.6 * smoothstep(0.3, 0.05, p.y));
    return mix(resolve(WOOD, p, n), resolve(FLESH, p, n), t);
  });
  const IVORY = paint((p, n) => {
    const root = Math.abs(p.y - Y1);
    let c = mix("#b9a176", "#f4edd8", smoothstep(0.0, 0.05, root));
    c = mix(c, "#d8c9a0", 0.3 * smoothstep(0.3, -0.5, n.y));
    return c;
  });
  const CLAW = "#2a1f1a";
  const DROOL = "#f1c9d2";
  const GULLET = "#3a0a14";

  // ---------------------------------------------------------------- textures
  const EYE_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1c0d06"/>
      <circle cx="50" cy="50" r="44" fill="#efc84a"/>
      <path d="M8 46 Q22 40 30 48 M10 60 Q24 56 32 60 M90 42 Q78 40 70 48 M92 58 Q78 56 70 60"
            stroke="#c2412b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="30" fill="#d9731c"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#7a3a0c" stroke-width="3"/>
      <ellipse cx="50" cy="50" rx="8" ry="30" fill="#130505"/>
      <circle cx="37" cy="36" r="7" fill="#fff9e3"/>
      <circle cx="60" cy="63" r="3" fill="#fff9e3"/>
    </svg>`,
    { size: 256 },
  );
  const LOCK_TEX = svg(
    `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="76" height="96" rx="8" fill="#e2b14a" stroke="#6a4810" stroke-width="3"/>
      <rect x="9" y="9" width="62" height="82" rx="5" fill="none" stroke="#7a5416" stroke-width="2"/>
      <circle cx="40" cy="42" r="12" fill="#1a1008"/>
      <path d="M33 48 L47 48 L52 78 L28 78 Z" fill="#1a1008"/>
      <circle cx="15" cy="15" r="3.5" fill="#7a5416"/><circle cx="65" cy="15" r="3.5" fill="#7a5416"/>
      <circle cx="15" cy="85" r="3.5" fill="#7a5416"/><circle cx="65" cy="85" r="3.5" fill="#7a5416"/>
    </svg>`,
    { size: 192 },
  );
  const SKULL_TEX = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="none" stroke="#3a2210" stroke-width="4"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#3a2210" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M30 52 Q30 24 50 24 Q70 24 70 52 Q70 62 62 66 L62 76 L38 76 L38 66 Q30 62 30 52 Z" fill="#e9dcb8" stroke="#3a2210" stroke-width="3"/>
      <circle cx="41" cy="48" r="6" fill="#3a2210"/><circle cx="59" cy="48" r="6" fill="#3a2210"/>
      <path d="M50 56 L46 63 L54 63 Z" fill="#3a2210"/>
      <path d="M42 76 L42 70 M50 76 L50 70 M58 76 L58 70" stroke="#3a2210" stroke-width="2.5"/>
      <path d="M22 80 L78 22 M22 22 L78 80" stroke="#e9dcb8" stroke-width="5" stroke-linecap="round"/>
      <path d="M22 80 L78 22 M22 22 L78 80" stroke="#3a2210" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- skeleton
  const core = b.joint("hips", { at: [0, 0.35, 0], role: "spine" });
  const jaw = b.joint("jaw", { parent: core, at: [0, Y1, -HZ], dir: [0, 0, 1], role: "jaw", group: "lid" });

  // ---------------------------------------------------------------- body (lower jaw)
  b.part(new THREE.BoxGeometry(W, Y1 - Y0, D), WOOD, { bone: core, at: [0, (Y0 + Y1) / 2, 0], flat: true, name: "body" });
  // plinth
  b.part(new THREE.BoxGeometry(W + 0.05, 0.04, D + 0.05), WOOD, { bone: core, at: [0, Y0 + 0.02, 0], flat: true });
  // mouth floor and gullet
  b.part(new THREE.BoxGeometry(W - 0.1, 0.06, D - 0.1), GUM, { bone: core, at: [0, Y1 - 0.015, 0], flat: true });
  b.part(new THREE.SphereGeometry(1, 12, 8), GULLET, {
    bone: core,
    at: [0, Y1 + 0.005, -0.06],
    scale: [0.24, 0.05, 0.15],
  });
  // gum ridge around the rim
  const gumPath = polyline(
    [
      [HX - 0.045, Y1 + 0.012, HZ - 0.045],
      [-HX + 0.045, Y1 + 0.012, HZ - 0.045],
      [-HX + 0.045, Y1 + 0.012, -HZ + 0.045],
      [HX - 0.045, Y1 + 0.012, -HZ + 0.045],
    ],
    { closed: true },
  );
  b.sweep(gumPath, () => [0.03, 0.022] as [number, number], { bone: core, color: FLESH, sides: 6 });

  // teeth helper
  const teethAlong = (y: number, up: 1 | -1, bone: typeof core, count: number) => {
    const inset = 0.03;
    const rim = polyline(
      [
        [HX - inset, y, HZ - inset],
        [-HX + inset, y, HZ - inset],
        [-HX + inset, y, -HZ + inset],
        [HX - inset, y, -HZ + inset],
      ],
      { closed: true },
    );
    b.along(rim, count, (at) => {
      const p = at.at;
      const big = R() < 0.22;
      const len = (big ? 0.11 : 0.055) + R() * 0.03;
      const r = big ? 0.022 : 0.015;
      b.spike(p, [-p.x * 0.25, up, -p.z * 0.25], len, r, { color: IVORY, bone, sides: 5 });
    });
  };
  teethAlong(Y1 + 0.005, 1, core, 28);

  // ---------------------------------------------------------------- lid (upper jaw)
  const lidOutline: OutlinePoint[] = [
    [-HZ, 0, "sharp"],
    [HZ, 0, "sharp"],
    [HZ, 0.07],
    [HZ * 0.72, 0.17],
    [0, LIDH],
    [-HZ * 0.72, 0.17],
    [-HZ, 0.07],
  ];
  b.extrude(lidOutline, {
    at: [0, Y1, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: W,
    smoothing: 1,
    color: WOOD,
    bone: jaw,
    name: "lid",
  });
  // roof of the mouth
  b.part(new THREE.BoxGeometry(W - 0.1, 0.06, D - 0.1), GUM, { bone: jaw, at: [0, Y1 + 0.015, 0], flat: true });
  b.capsule([0, Y1 - 0.01, -0.12], [0, Y1 - 0.07, -0.1], [0.022, 0.018], { bone: jaw, color: GULLET, sides: 6 });
  teethAlong(Y1 - 0.005, -1, jaw, 26);

  // lid straps
  for (const sx of [1, -1]) {
    const x = sx * 0.27;
    const strap = catmull([
      [x, Y1 - 0.005, HZ + 0.012],
      [x, Y1 + 0.075, HZ + 0.008],
      [x, Y1 + 0.178, HZ * 0.72],
      [x, Y1 + LIDH + 0.01, 0],
      [x, Y1 + 0.178, -HZ * 0.72],
      [x, Y1 + 0.075, -HZ - 0.008],
      [x, Y1 - 0.005, -HZ - 0.012],
    ]);
    b.sweep(strap, () => [0.035, 0.012] as [number, number], {
      bone: jaw,
      color: IRON,
      section: "box",
      caps: "flat",
    });
    // rivets on the lid strap
    for (const t of [0.12, 0.3, 0.5, 0.7, 0.88]) {
      const p = strap.at(t);
      const n = strap.tangentAt(t);
      b.part(new THREE.SphereGeometry(0.011, 6, 4), IRON, {
        bone: jaw,
        at: [p.x, p.y + 0.011 * Math.abs(n.z), p.z + 0.011 * Math.abs(n.y) * Math.sign(p.z)],
      });
    }
  }
  // hasp and skull emblem on the lid
  b.part(new THREE.BoxGeometry(0.075, 0.13, 0.016), GILT, { bone: jaw, at: [0, Y1 + 0.015, HZ + 0.012], flat: true });
  b.part(new THREE.TorusGeometry(0.022, 0.007, 5, 10), IRON, {
    bone: jaw,
    at: [0, Y1 - 0.04, HZ + 0.024],
    rotation: [0, 0, 0],
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: jaw,
    at: [0, Y1 + LIDH + 0.004, 0],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: SKULL_TEX,
  });
  // hinge brackets
  for (const sx of [1, -1])
    b.part(new THREE.BoxGeometry(0.1, 0.04, 0.05), IRON, { bone: core, at: [sx * 0.27, Y1, -HZ - 0.01], flat: true });

  // ---------------------------------------------------------------- body ironwork
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.27;
      b.part(new THREE.BoxGeometry(0.07, Y1 - Y0 + 0.01, 0.02), IRON, {
        bone: core,
        at: [x, (Y0 + Y1) / 2, sz * (HZ + 0.01)],
        flat: true,
      });
      for (const y of [Y0 + 0.07, Y0 + 0.2, Y0 + 0.33])
        b.part(new THREE.SphereGeometry(0.011, 6, 4), IRON, { bone: core, at: [x, y, sz * (HZ + 0.02)] });
      // corner brackets
      b.part(new THREE.BoxGeometry(0.09, 0.07, 0.09), IRON, {
        bone: core,
        at: [sx * (HX - 0.02), Y0 + 0.05, sz * (HZ - 0.02)],
        flat: true,
      });
      b.part(new THREE.BoxGeometry(0.09, 0.05, 0.09), IRON, {
        bone: core,
        at: [sx * (HX - 0.02), Y1 - 0.03, sz * (HZ - 0.02)],
        flat: true,
      });
    }
  // side handles
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.09, 0.14), IRON, { bone: core, at: [sx * (HX + 0.01), 0.4, 0], flat: true });
    b.part(new THREE.TorusGeometry(0.045, 0.009, 5, 10), IRON, {
      bone: core,
      at: [sx * (HX + 0.025), 0.34, 0],
      rotation: [0, 90, 0],
    });
  }
  // lock plate with keyhole
  b.part(new THREE.BoxGeometry(0.11, 0.14, 0.014), GILT, { bone: core, at: [0, 0.4, HZ + 0.007], flat: true });
  b.part(new THREE.PlaneGeometry(0.1, 0.125), "#ffffff", {
    bone: core,
    at: [0, 0.4, HZ + 0.0155],
    dir: [0, 0, 1],
    axis: "z",
    texture: LOCK_TEX,
  });

  // ---------------------------------------------------------------- eyes
  for (const s of [1, -1]) {
    const cx = s * 0.16;
    const cy = 0.4;
    const eye = b.part(new THREE.SphereGeometry(0.065, 12, 8), "#2a1408", {
      bone: core,
      at: [cx, cy, HZ - 0.02],
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    const iris = b.decal(eye, EYE_TEX, { at: [cx, cy, HZ + 0.05], dir: [0, 0, 1], size: [0.1, 0.1], mirror: s > 0 });
    glow(iris, 0.6);
    // wooden eyelid ring and brow splinter
    b.part(new THREE.TorusGeometry(0.066, 0.015, 6, 14), WOOD, { bone: core, at: [cx, cy, HZ + 0.004] });
    b.extrude(
      [
        [-0.08, 0, "sharp"],
        [0.08, 0.01, "sharp"],
        [0.05, 0.05],
        [-0.03, 0.04],
      ],
      {
        at: [cx, cy + 0.06, HZ + 0.012],
        x: [s, 0.25, 0],
        thickness: 0.02,
        color: WOOD,
        bone: core,
      },
    );
  }

  // ---------------------------------------------------------------- legs (pseudopods)
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const tag = `${sz > 0 ? "F" : "B"}${sx > 0 ? "L" : "R"}`;
      const hip: [number, number, number] = [sx * (HX - 0.1), Y0 + 0.02, sz * (HZ - 0.12)];
      const knee: [number, number, number] = [sx * (HX + 0.03), 0.1, sz * (HZ + 0.03)];
      const foot: [number, number, number] = [sx * (HX + 0.09), 0.045, sz * (HZ + 0.09)];
      const leg = b.chain(`leg${tag}`, [hip, knee, foot], {
        parent: core,
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
        group: "legs",
      });
      b.sweep(leg, (t) => 0.075 - 0.032 * t, { color: HYBRID, sides: 7 });
      const ang0 = Math.atan2(sx, sz);
      for (const i of [-1, 0, 1]) {
        const a = ang0 + i * 0.6;
        b.spike(foot, [Math.sin(a), -0.5, Math.cos(a)], 0.085, 0.016, { color: CLAW, bone: leg.tip!, sides: 5 });
      }
    }

  // back tentacles
  for (const sx of [1, -1]) {
    const tag = sx > 0 ? "L" : "R";
    const root: [number, number, number] = [sx * 0.34, 0.32, -HZ + 0.02];
    const tent = b.chain(
      `tentacle${tag}`,
      catmull([root, [sx * 0.42, 0.3, -HZ - 0.14], [sx * 0.5, 0.42, -HZ - 0.22], [sx * 0.46, 0.6, -HZ - 0.16]]),
      { parent: core, count: 4, role: "tentacle", group: "tentacles" },
    );
    b.sweep(tent, (t) => 0.05 * (1 - t) + 0.01, { color: HYBRID, sides: 7, caps: { start: "flat", end: "round" } });
  }

  // ---------------------------------------------------------------- open the maw
  b.pose(jaw, { axis: [1, 0, 0], deg: -72 });

  // ---------------------------------------------------------------- tongue
  const tonguePath = catmull([
    [0, Y1 - 0.02, -0.02],
    [0, Y1 + 0.04, 0.22],
    [0.02, Y1 - 0.04, 0.46],
    [-0.04, 0.36, 0.66],
    [0, 0.2, 0.84],
    [0.09, 0.1, 1.0],
  ]);
  const tongue = b.chain("tongue", tonguePath, { parent: core, count: 7, role: "tentacle", group: "tongue" });
  const tongueTube = b.sweep(tongue, (t) => [0.1 - 0.045 * t, 0.038 - 0.012 * t] as [number, number], {
    color: TONGUE,
    sides: 8,
    caps: { start: "flat", end: "round" },
  });
  // a gem lure stuck to the tongue
  glow(
    b.stick(new THREE.OctahedronGeometry(0.035), "#3fd27a", tongueTube.at(0.52, 0), { embed: 0.3, flat: true }),
    0.6,
  );
  // drool from the tongue tip to the floor
  const tip = tongueTube.at(0.97, 180);
  b.sweep(polyline([tip.at, [tip.at.x, 0.003, tip.at.z]]), [0.012, 0.003], { color: DROOL, bone: tongue.tip ?? tongue, sides: 5 });
  b.part(new THREE.CylinderGeometry(0.08, 0.09, 0.006, 10), DROOL, { bone: core, at: [tip.at.x, 0.003, tip.at.z], flat: true });
  // drool strands hanging from the upper fangs
  for (const sx of [-0.3, 0.1, 0.35]) {
    const top = jaw.local({ forward: HZ * 2 - 0.05, right: -sx, down: 0.04 });
    b.sweep(polyline([top, [sx, Y1 + 0.06, HZ - 0.05]]), [0.006, 0.003], { color: DROOL, bone: jaw, sides: 4 });
  }

  // ---------------------------------------------------------------- treasure lure in the maw
  for (let i = 0; i < 9; i++) {
    const x = (R() - 0.5) * (W - 0.3);
    const z = (R() - 0.5) * (D - 0.3) - 0.05;
    if (Math.abs(x) < 0.1 && z > -0.1) continue; // keep the tongue root clear
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10), GILT, {
      bone: core,
      at: [x, Y1 + 0.02, z],
      rotation: [R() * 20 - 10, R() * 180, R() * 20 - 10],
      flat: true,
    });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.03), "#e0433f", { bone: core, at: [-0.3, Y1 + 0.04, -0.15], flat: true }), 0.5);
  glow(b.part(new THREE.OctahedronGeometry(0.026), "#4a7cff", { bone: core, at: [0.32, Y1 + 0.035, 0.08], flat: true }), 0.5);

  return b.root;
}
```