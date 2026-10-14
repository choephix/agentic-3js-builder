import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  bezier,
  spiral,
  paint,
  scales,
  spots,
  gradient,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Hatchling Dragon",
  description:
    "A cat-sized baby dragon sitting proudly beside its broken speckled egg: teal scales fading to a buttery belly, soft orange back spines, oversized amber-skinned wings, stubby horns, big amber eyes, a toothy grin and a curl of smoke from one nostril.",
};

// ---------- palette ----------
const TEAL = "#2fb8a6";
const TEAL_B = "#39c6b0";
const TEAL_DEEP = "#1e8c87";
const TEAL_DEEP_B = "#23978f";
const TEAL_EDGE = "#13605e";
const BELLY = "#ffe39a";
const BELLY_LINE = "#f0c46a";
const BLEND1 = "#d2e7a0";
const BLEND2 = "#93d6a8";
const ORANGE = "#ff8a3d";
const ORANGE_TIP = "#ffc46c";
const AMBER_D = "#d26a1c";
const AMBER_M = "#f39b2e";
const AMBER_L = "#ffc85e";
const VEIN = "#b4561a";
const HORN = "#fff1cf";
const HORN_TIP = "#e3b97e";
const CLAW = "#f7ecd2";
const EYE_DARK = "#2a140a";
const NOSTRIL = "#3a1a20";
const MOUTH = "#5a1f2e";
const TONGUE = "#ff7f90";
const TOOTH = "#ffffff";
const SMOKE = "#c9cedd";
const SMOKE_L = "#eef0f7";
const EGG = "#f6eedb";
const EGG_IN = "#fffaf0";
const SPECK1 = "#8a6a4a";
const SPECK2 = "#5fa89a";
const SPECK3 = "#c9a27a";

function keyed(keys: number[][]) {
  return (t: number): [number, number] => {
    if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1];
      const c = keys[i];
      if (t <= c[0]) {
        const u = (t - a[0]) / Math.max(1e-6, c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u];
      }
    }
    const l = keys[keys.length - 1];
    return [l[1], l[2]];
  };
}

export default function build() {
  const b = createBuilder({ name: "babyDragon", paintSize: 2048 });
  const R = rng(11);

  // ---------- paints ----------
  const scaleSide = scales([TEAL, TEAL_B], TEAL_EDGE, { size: 0.02, seed: 4 });
  const scaleTop = scales([TEAL_DEEP, TEAL_DEEP_B], TEAL_EDGE, { size: 0.02, seed: 4 });
  const coat = (len: number, plates: boolean) =>
    paint((_p, _n, s) => {
      const deg = ((s[1] % 360) + 360) % 360;
      const d = Math.abs(deg - 180);
      if (d < 50) {
        if (plates) {
          const f = ((s[0] * len) / 0.032) % 1;
          if (f < 0.13) return BELLY_LINE;
        }
        return BELLY;
      }
      if (d < 62) return BLEND1;
      if (d < 74) return BLEND2;
      return d > 135 ? scaleTop : scaleSide;
    });
  const legCoat = gradient(scaleSide, scaleTop, [0, 0.14, 0], [0, 0.02, 0]);
  const wingSkin = paint((_p, _n, s) => {
    const a = s[0];
    const c = s[1];
    const edge = Math.min(c, 1 - c);
    if (a < 0.9) for (const v of [0.34, 0.67]) if (Math.abs(c - v) < 0.01 + 0.012 * (1 - a)) return VEIN;
    if (a > 0.94) return AMBER_D;
    if (edge < 0.06 || a < 0.07) return AMBER_D;
    if (edge < 0.17 || a < 0.2) return AMBER_M;
    return AMBER_L;
  });
  const eggOuter = spots(EGG, [SPECK1, SPECK2, SPECK3], { size: 0.03, amount: 0.28, seed: 9 });
  const eggPaint = (cx: number, cz: number, insideUp: boolean) =>
    paint((p, n) => {
      const rx = p.x - cx;
      const rz = p.z - cz;
      const l = Math.hypot(rx, rz) || 1;
      const radial = (n.x * rx + n.z * rz) / l;
      const inside = radial < -0.2 || (insideUp ? n.y > 0.7 : n.y < -0.7);
      return inside ? EGG_IN : eggOuter;
    });

  // ---------- body path & skeleton ----------
  const hipsP = [0, 0.12, -0.03];
  const bellyP = [0, 0.2, 0.0];
  const chestP = [0, 0.28, 0.02];
  const neckP = [0, 0.335, 0.04];
  const neckTop = [0, 0.385, 0.06];
  const tailPts = [
    [-0.22, 0.05, -0.03],
    [-0.2, 0.047, -0.12],
    [-0.13, 0.045, -0.2],
    [-0.04, 0.055, -0.19],
    [0, 0.08, -0.11],
  ];
  const body = catmull([...tailPts, hipsP, bellyP, chestP, neckP, neckTop]);
  const rootT = body.closestT(hipsP);
  const chestT = body.closestT(chestP);

  const hips = b.joint("hips", { at: hipsP });
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: hips, count: 5, role: "tail" });
  const spine = b.chain("spine", body.slice(rootT, chestT), { parent: hips, count: 2, role: "spine" });
  const neck = b.chain("neck", body.slice(chestT, 1), { parent: spine.joints[1], count: 2, role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: neckTop, dir: [0, 0.03, 1], role: "head" });

  const kt = (p: number[]) => body.closestT(p);
  const radius = keyed([
    [0, 0.02, 0.02],
    [kt(tailPts[1]), 0.027, 0.025],
    [kt(tailPts[2]), 0.037, 0.034],
    [kt(tailPts[3]), 0.05, 0.046],
    [kt(tailPts[4]), 0.075, 0.07],
    [rootT, 0.105, 0.1],
    [kt(bellyP), 0.11, 0.105],
    [chestT, 0.088, 0.083],
    [kt(neckP), 0.052, 0.05],
    [1, 0.046, 0.046],
  ]);
  const torso = b.sweep(body, radius, {
    bone: [tail, hips, spine, neck],
    color: coat(body.length, true),
    sides: 12,
    name: "body",
  });

  // ---------- dorsal spines ----------
  const spineOutline = (k: number): OutlinePoint[] => [
    [-0.015 * k, -0.006],
    [0.017 * k, -0.006],
    [0.012 * k, 0.012 * k],
    [0.003 * k, 0.032 * k, "sharp"],
  ];
  b.along(
    torso,
    15,
    (at) => {
      const u = Math.min(1, Math.max(0, (at.t - 0.04) / 0.88));
      const k = 0.55 + 0.65 * Math.sin(Math.PI * u);
      b.extrude(spineOutline(k), {
        at,
        x: at.dir([0, 0, -1]),
        y: at.dir([0, 1, 0]),
        thickness: [0.012 * k, 0.004],
        bevel: 0.002,
        smoothing: 1,
        color: paint((_p, _n, s) => (s[1] > 0.016 * k ? ORANGE_TIP : ORANGE)),
        group: "spines",
      });
    },
    { from: 0.04, to: 0.92 },
  );

  // ---------- tail spade ----------
  const tipP = body.at(0);
  const tan = body.tangentAt(0);
  const out = new THREE.Vector3(-tan.x, 0, -tan.z).normalize();
  const spade: OutlinePoint[] = [
    [0, 0.008, "sharp"],
    [-0.012, 0.038, "sharp"],
    [0.03, 0.042],
    [0.085, 0, "sharp"],
    [0.03, -0.042],
    [-0.012, -0.038, "sharp"],
    [0, -0.008, "sharp"],
  ];
  b.extrude(spade, {
    at: tipP,
    x: out,
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    smoothing: 1,
    color: paint((_p, _n, s) => (s[0] > 0.05 ? ORANGE_TIP : ORANGE)),
    bone: tail.joints[tail.joints.length - 1],
    name: "tailSpade",
  });

  // ---------- head ----------
  const H = head;
  const upper = b.loft(
    [
      { at: H.local({ back: 0.05, up: 0.045 }), w: 0.09, h: 0.08 },
      { at: H.local({ forward: 0.0, up: 0.055 }), w: 0.15, h: 0.14 },
      { at: H.local({ forward: 0.06, up: 0.045 }), w: 0.135, h: 0.11 },
      { at: H.local({ forward: 0.12, up: 0.02 }), w: 0.1, h: 0.065 },
      { at: H.local({ forward: 0.165, up: 0.015 }), w: 0.08, h: 0.05 },
    ],
    { bone: head, color: coat(1, false), sides: 12, name: "skull" },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: H.local({ back: 0.01, down: 0.01 }),
    aim: H.local({ forward: 0.15, down: 0.03 }),
    role: "jaw",
  });
  b.loft(
    [
      { at: H.local({ forward: 0.0, down: 0.015 }), w: 0.11, h: 0.05 },
      { at: H.local({ forward: 0.07, down: 0.02 }), w: 0.1, h: 0.04 },
      { at: H.local({ forward: 0.14, down: 0.015 }), w: 0.075, h: 0.032 },
    ],
    { bone: jaw, color: coat(1, false), sides: 10, name: "jawLoft" },
  );
  b.part(new THREE.SphereGeometry(0.03, 8, 6), TONGUE, {
    bone: jaw,
    at: H.local({ forward: 0.085, down: 0.002 }),
    scale: [1, 0.35, 1.3],
    name: "tongue",
  });
  for (const s of [1, -1]) {
    b.spike(H.local({ left: s * 0.03, down: 0.004, forward: 0.13 }), [0, 1, 0.1], 0.02, 0.006, {
      bone: jaw,
      color: TOOTH,
      sides: 6,
    });
    b.spike(H.local({ left: s * 0.042, down: 0.006, forward: 0.09 }), [0, 1, 0.05], 0.015, 0.005, {
      bone: jaw,
      color: TOOTH,
      sides: 6,
    });
  }
  // mouth interior and upper teeth on the skull
  b.part(new THREE.SphereGeometry(0.045, 10, 6), MOUTH, {
    bone: head,
    at: H.local({ forward: 0.08, down: 0.012 }),
    scale: [0.95, 0.4, 1.35],
    name: "mouth",
  });
  const teeth = [
    [0.05, 0.054, 0.017],
    [0.085, 0.048, 0.02],
    [0.118, 0.04, 0.022],
    [0.148, 0.03, 0.025],
  ];
  for (const s of [1, -1])
    for (const [f, x, len] of teeth)
      b.spike(H.local({ left: s * x, down: 0.006, forward: f }), [0, -1, 0.15], len, 0.0065, {
        bone: head,
        color: TOOTH,
        sides: 6,
      });
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });

  // eyes
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs><radialGradient id="g" cx="0.5" cy="0.62" r="0.55">
        <stop offset="0" stop-color="#ffe27a"/><stop offset="0.6" stop-color="#f5a623"/><stop offset="1" stop-color="#b8560f"/>
      </radialGradient></defs>
      <circle cx="32" cy="32" r="29" fill="url(#g)" stroke="#3a1a08" stroke-width="4"/>
      <ellipse cx="32" cy="34" rx="6" ry="18" fill="#1b0c06"/>
      <circle cx="41" cy="21" r="7" fill="#ffffff"/>
      <circle cx="24" cy="45" r="3.2" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const blushTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20"><ellipse cx="16" cy="10" rx="15" ry="9" fill="#ff93a3"/></svg>`,
    { size: 64 },
  );
  for (const s of [1, -1]) {
    const eyeC = H.local({ left: s * 0.05, up: 0.062, forward: 0.055 });
    const eyeDir = new THREE.Vector3(s * 0.75, 0.2, 0.65).normalize();
    const eyeball = b.part(new THREE.SphereGeometry(0.03, 12, 8), EYE_DARK, { bone: head, at: eyeC, name: "eyeball" });
    b.decal(eyeball, eyeTex, {
      at: eyeC.clone().addScaledVector(eyeDir, 0.03),
      dir: eyeDir,
      size: [0.047, 0.047],
      bone: head,
    });
    // proud brow ridge
    b.capsule(H.local({ left: s * 0.022, up: 0.1, forward: 0.065 }), H.local({ left: s * 0.07, up: 0.092, forward: 0.035 }), 0.012, {
      bone: head,
      color: TEAL_DEEP,
      sides: 6,
    });
    // cheek blush
    b.decal(upper, blushTex, {
      at: H.local({ left: s * 0.058, up: 0.008, forward: 0.095 }),
      dir: [s * 0.9, 0, 0.45],
      size: [0.032, 0.02],
      bone: head,
    });
    // nostril
    b.part(new THREE.SphereGeometry(0.007, 6, 4), NOSTRIL, {
      bone: head,
      at: H.local({ left: s * 0.018, up: 0.04, forward: 0.178 }),
    });
    // ear frills
    const frill: OutlinePoint[] = [
      [0, -0.015],
      [0.05, 0.0, "sharp"],
      [0.035, 0.018],
      [0.062, 0.036, "sharp"],
      [0.02, 0.032],
      [0, 0.02],
    ];
    b.extrude(frill, {
      at: H.local({ left: s * 0.055, up: 0.06, back: 0.02 }),
      x: [s * 0.8, 0, -0.6],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: paint((_p, _n, st) => (st[0] > 0.035 ? ORANGE_TIP : ORANGE)),
      bone: head,
      name: "frill",
    });
  }

  // horns, crest, and a bit of shell on the head
  const headSurf = b.surface(upper);
  const crown = H.local({ up: 0.05 });
  for (const s of [1, -1]) {
    const specs = [
      { az: 145, el: 48, len: 1, r: 0.018 },
      { az: 165, el: 22, len: 0.6, r: 0.012 },
    ];
    for (const h of specs) {
      const hit = headSurf.around(crown).at(s * h.az, h.el);
      if (!hit) continue;
      const tip = hit.local({ left: s * 0.012 * h.len, up: 0.045 * h.len, back: 0.035 * h.len });
      const ctrl = hit.local({ left: s * 0.006 * h.len, up: 0.03 * h.len, back: 0.004 });
      b.sweep(bezier(hit, ctrl, tip), [h.r, 0], {
        bone: head,
        color: gradient(HORN, HORN_TIP, hit.local({ up: 0 }), tip),
        caps: { start: "flat", end: "point" },
        extend: [0.012, 0],
        sides: 7,
      });
    }
  }
  for (const el of [50, 28]) {
    const hit = headSurf.around(crown).at(180, el);
    if (!hit) continue;
    const n = new THREE.Vector3().copy(hit.n);
    const xd = new THREE.Vector3(0, 0, -1).addScaledVector(n, n.z).normalize();
    const k = el > 40 ? 0.75 : 0.6;
    b.extrude(spineOutline(k), {
      at: hit,
      x: xd,
      y: n,
      thickness: [0.01 * k, 0.004],
      bevel: 0.002,
      smoothing: 1,
      color: paint((_p, _n, s) => (s[1] > 0.016 * k ? ORANGE_TIP : ORANGE)),
      bone: head,
      group: "spines",
    });
  }
  const top = headSurf.around(crown).at(0, 78);
  if (top) {
    const hat: OutlinePoint[] = [
      [0, 0.028, "sharp"],
      [0.014, 0.024],
      [0.026, 0.014],
      [0.03, 0, "sharp"],
      [0.036, 0, "sharp"],
      [0.031, 0.019],
      [0.017, 0.031],
      [0, 0.035, "sharp"],
    ];
    b.lathe(hat, {
      at: top.local({ down: 0.008 }),
      axis: [0.3, 1, 0.1],
      segments: 9,
      smoothing: 1,
      color: eggOuter,
      bone: head,
      name: "shellHat",
    });
  }

  // smoke wisp from the left nostril
  const N = H.local({ left: 0.02, up: 0.046, forward: 0.185 });
  const smokePath = spiral([N.x + 0.02, N.y, N.z + 0.004], N, [0, 1, 0], { turns: 1.4, r1: 0.035, pitch: 0.08 });
  b.sweep(smokePath, [0.004, 0.008, 0.012, 0.015, 0.011], {
    bone: head,
    color: gradient(SMOKE, SMOKE_L, N, smokePath.at(1)),
    sides: 7,
    name: "smoke",
  });
  let puff = 0;
  b.along(smokePath, 3, (at) => {
    puff++;
    b.part(new THREE.IcosahedronGeometry(0.012 + puff * 0.005, 0), SMOKE_L, { at, bone: head, flat: true, name: "smokePuff" });
  });

  // ---------- limbs and wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const X = (p: number[]) => [s * p[0], p[1], p[2]];

    // hind legs (sitting haunches)
    const hind = b.chain(
      `hindLeg${S}`,
      polyline([X([0.08, 0.115, -0.02]), X([0.13, 0.11, 0.08]), X([0.14, 0.038, 0.065]), X([0.145, 0.024, 0.14])]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg", contact: X([0.145, 0, 0.12]) },
    );
    const hindTube = b.sweep(hind, [0.062, 0.042, 0.03, 0.024], { color: legCoat, sides: 10 });
    const kneeHit = b.surface(hindTube).nearest(X([0.13, 0.2, 0.08]));
    b.stick(new THREE.CylinderGeometry(0.02, 0.025, 0.01, 6), TEAL_DEEP, kneeHit, { embed: 0.4, flat: true });
    const hindFoot = hind.tip ?? hind.joints[hind.joints.length - 1];
    for (const j of [-1, 0, 1])
      b.spike(X([0.145 + j * 0.016, 0.02, 0.152]), [s * j * 0.3, -0.25, 1], 0.026, 0.008, {
        bone: hindFoot,
        color: CLAW,
        sides: 6,
      });

    // front legs
    const fore = b.chain(
      `foreLeg${S}`,
      polyline([X([0.06, 0.25, 0.05]), X([0.072, 0.15, 0.1]), X([0.072, 0.036, 0.118]), X([0.075, 0.022, 0.175])]),
      { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "leg", contact: X([0.075, 0, 0.16]) },
    );
    b.sweep(fore, [0.036, 0.028, 0.024, 0.021], { color: legCoat, sides: 10 });
    const hand = fore.tip ?? fore.joints[fore.joints.length - 1];
    for (const j of [-1, 0, 1])
      b.spike(X([0.075 + j * 0.013, 0.018, 0.188]), [s * j * 0.3, -0.25, 1], 0.022, 0.007, {
        bone: hand,
        color: CLAW,
        sides: 6,
      });

    // wings
    const rootW = [0.05, 0.3, -0.05];
    const elbowW = [0.17, 0.37, -0.1];
    const wristW = [0.29, 0.43, -0.08];
    const flankW = [0.08, 0.17, -0.09];
    const wing = b.chain(`wing${S}`, polyline([X(rootW), X(elbowW), X(wristW)]), {
      parent: spine.joints[1],
      names: [`wingArm${S}`, `wingFore${S}`, `wingHand${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.022, 0.014], { color: TEAL_DEEP, sides: 8 });
    const wingHand = wing.tip ?? wing.joints[wing.joints.length - 1];
    b.spike(X(wristW), [s * 0.2, 0.6, 0.8], 0.03, 0.009, { bone: wingHand, color: CLAW, sides: 6 });

    const fdefs = [
      { mid: [0.38, 0.5, -0.06], tip: [0.46, 0.53, -0.05] },
      { mid: [0.41, 0.41, -0.09], tip: [0.52, 0.37, -0.1] },
      { mid: [0.36, 0.3, -0.11], tip: [0.43, 0.2, -0.14] },
    ];
    const fingers = fdefs.map((f, i) =>
      b.chain(`finger${i + 1}${S}`, catmull([X(wristW), X(f.mid), X(f.tip)]), {
        parent: wingHand,
        count: 2,
        role: "digit",
      }),
    );
    for (const f of fingers)
      b.sweep(f, [0.011, 0.004], {
        color: TEAL_DEEP,
        bands: [
          [0.84, TEAL_DEEP],
          [1, CLAW],
        ],
        sides: 6,
      });
    b.membrane(fingers[0], fingers[1], { color: wingSkin, thickness: 0.006, scallop: 0.16, name: "wingSkin" });
    b.membrane(fingers[1], fingers[2], { color: wingSkin, thickness: 0.006, scallop: 0.16, name: "wingSkin" });
    b.membrane(fingers[2], polyline([X(elbowW), X(flankW)]), {
      color: wingSkin,
      thickness: 0.006,
      scallop: 0.1,
      bone: wing.joints[0],
      name: "wingSkin",
    });
  }

  // ---------- the broken egg ----------
  const EC = [0.32, 0, 0.14];
  const shell: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.06, 0.008],
    [0.095, 0.04],
    [0.11, 0.09],
    [0.108, 0.14, "sharp"],
    [0.1, 0.14, "sharp"],
    [0.1, 0.09],
    [0.086, 0.045],
    [0.055, 0.016],
    [0, 0.009, "sharp"],
  ];
  const eggUp = eggPaint(EC[0], EC[2], true);
  b.lathe(shell, { at: EC, segments: 14, smoothing: 1, color: eggUp, bone: hips, name: "eggShell" });
  b.ring(frame([EC[0], 0.14, EC[2]], [0, 1, 0]), { count: 11, radius: 0.104 }, (item) => {
    const h = 0.02 + R() * 0.035;
    const dx = (R() - 0.5) * 0.02;
    b.slab([item.local([-0.032, 0, -0.006]), item.local([0.032, 0, -0.006]), item.local([dx, 0, h])], {
      color: eggUp,
      thickness: 0.008,
      bone: hips,
      name: "eggShard",
    });
  });

  // the egg's top, upside down on the ground
  const CAP = [0.3, 0.083, -0.17];
  const cap: OutlinePoint[] = [
    [0, 0.076, "sharp"],
    [0.045, 0.062],
    [0.072, 0.033],
    [0.082, 0, "sharp"],
    [0.09, 0, "sharp"],
    [0.08, 0.035],
    [0.05, 0.07],
    [0, 0.085, "sharp"],
  ];
  const capPaint = eggPaint(CAP[0], CAP[2], false);
  b.lathe(cap, { at: CAP, axis: [0, -1, 0], segments: 14, smoothing: 1, color: capPaint, bone: hips, name: "eggCap" });

  // loose shards on the floor
  const loose = [
    [0.47, 0.22, 0.4, 0.03],
    [0.18, 0.3, 1.7, 0.025],
    [0.45, -0.02, 2.6, 0.022],
    [0.2, -0.3, 0.9, 0.028],
  ];
  for (const [cx, cz, rot, sz] of loose) {
    const pts = [0, 2.3, 4.1].map((a) => {
      const rr = sz * (0.8 + R() * 0.4);
      return [cx + Math.cos(rot + a) * rr, 0.004, cz + Math.sin(rot + a) * rr];
    });
    b.slab(pts, { color: capPaint, thickness: 0.006, bone: hips, name: "floorShard" });
  }

  return b.root;
}
