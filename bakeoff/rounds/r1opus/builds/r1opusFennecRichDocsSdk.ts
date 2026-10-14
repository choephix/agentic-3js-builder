import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  polyline,
  catmull,
  limb,
  countershade,
  mottle,
  gradient,
  grain,
  paint,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Fennec Kit on a Dune",
  description:
    "A fennec fox kit standing alert on a small dusk-lit sand dune: enormous satin ears lined in peach, cream fur warming to sandy gold, a bushy black-tipped tail, big sparkling eyes, oversized paws and a woven leather collar with a brass bell.",
};

export default function build() {
  const b = createBuilder({ name: "fennecKit", paintSize: 2048 });

  // ---------- palette ----------
  const CREAM = "#fbefdc";
  const CREAM_W = "#f6e0bd";
  const GOLD = "#e2ad6a";
  const GOLD_D = "#c98e4f";
  const WHITE_FUR = "#fff6ea";
  const PEACH = "#f7c9a8";
  const PEACH_L = "#fbdcc4";
  const ROSE = "#e9a08f";
  const DARK = "#2a1e1a";
  const TIPBLACK = "#231a17";
  const LEATHER = "#8a4f2a";
  const LEATHER_D = "#5a2f17";
  const BRASS = "#dcaa43";
  const BRASS_D = "#94671e";
  const SAND = "#e7b980";
  const SAND_HI = "#f3cf98";
  const SAND_WARM = "#e6a46c";
  const SAND_DUSK = "#b98a8e";
  const PEBBLE = "#9c7f6e";
  const PRINT = "#c9905e";
  const GRASS = "#a8945e";

  const G = 0.07; // dune top height

  // ---------- textures ----------
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
      <path d="M16 64 C6 52 4 30 9 6 C12 22 14 26 16 2 C18 26 21 22 24 8 C28 30 26 52 16 64Z" fill="#ffffff"/>
      <path d="M16 60 C13 46 13 30 16 12 C17 30 18 46 16 60Z" fill="#d6d6d6"/>
    </svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M10 38 C8 48 4 56 2 62 L9 62 C11 54 15 47 18 44Z" fill="#3a2418"/>
      <path d="M8 30 C10 12 50 10 56 28 C58 40 46 52 32 52 C18 52 6 44 8 30Z" fill="#24160f"/>
      <ellipse cx="33" cy="32" rx="19" ry="17" fill="#5a331d"/>
      <ellipse cx="33" cy="33" rx="15" ry="14" fill="#3a2214"/>
      <circle cx="33" cy="33" r="11" fill="#0b0705"/>
      <circle cx="40" cy="25" r="5.5" fill="#ffffff"/>
      <circle cx="27" cy="40" r="2.2" fill="#ffffff" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );
  const pawPrint = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <ellipse cx="32" cy="42" rx="14" ry="12" fill="#ffffff"/>
      <ellipse cx="14" cy="24" rx="6" ry="7" fill="#ffffff"/>
      <ellipse cx="26" cy="14" rx="6" ry="7" fill="#ffffff"/>
      <ellipse cx="38" cy="14" rx="6" ry="7" fill="#ffffff"/>
      <ellipse cx="50" cy="24" rx="6" ry="7" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const grassTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M29 64 L22 8 L34 64Z M34 64 L45 2 L39 64Z M26 64 L5 22 L31 64Z M38 64 L60 28 L42 64Z" fill="#ffffff"/>
      <path d="M31 64 L30 20 L33 64Z" fill="#cfcfcf"/>
    </svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const back = mottle(GOLD, GOLD_D, { size: 0.025, contrast: 0.45, seed: 3 });
  const coat = countershade(back, CREAM, { level: 0.1 });
  const legPaint = gradient(coat, CREAM, [0, G + 0.075, 0], [0, G + 0.03, 0]);
  const braid = paint((_p, _n, s) => {
    const k = Math.floor(s[0] * 56 + s[1] / 45);
    return ((k % 2) + 2) % 2 ? LEATHER : LEATHER_D;
  });
  const duneP = paint((p, n) => {
    const ripple = Math.sin((p.x * 0.5 + p.z) * 95 + noise(p, 0.2, 3) * 8) > 0.55;
    if (n.y > 0.985) return ripple ? SAND_HI : SAND;
    if (n.x > -0.05) return ripple ? SAND_HI : SAND_WARM;
    return ripple ? SAND : SAND_DUSK;
  });

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0, 0] });

  const hipsP: [number, number, number] = [0, G + 0.12, -0.065];
  const midP: [number, number, number] = [0, G + 0.122, 0.0];
  const chestP: [number, number, number] = [0, G + 0.13, 0.055];
  const spine = b.chain("spine", polyline([hipsP, midP, chestP]), {
    parent: root,
    names: ["hips", "spine1", "chest"],
    role: "spine",
  });
  const hips = spine.joints[0];
  const chest = spine.tip!;

  const neck = b.chain(
    "neck",
    catmull([chestP, [0, G + 0.165, 0.08], [0, G + 0.192, 0.095]]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const hc: [number, number, number] = [0, G + 0.215, 0.105];
  const head = b.joint("head", { parent: neck.joints[1], at: hc, dir: [0, -0.05, 1], role: "head" });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.028, down: 0.021 }),
    aim: head.local({ forward: 0.07, down: 0.025 }),
    role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(
    catmull([
      [0, G + 0.118, -0.095],
      [0, G + 0.12, -0.04],
      [0, G + 0.125, 0.02],
      [0, G + 0.135, 0.065],
    ]),
    (t) => [0.035 + 0.008 * Math.sin(Math.PI * t), 0.039 + 0.006 * Math.sin(Math.PI * t)],
    { bone: spine, color: coat },
  );
  const neckTube = b.sweep(neck, [0.034, 0.029], { color: coat });

  // ---------- head ----------
  const headPaint = paint((p, n) => (n.z > 0.55 && p.y < hc[1] + 0.008 ? CREAM : coat));
  const cranium = b.part(new THREE.SphereGeometry(0.05, 14, 10), headPaint, {
    bone: head,
    at: hc,
    scale: [1.05, 0.92, 0.95],
    name: "cranium",
  });
  b.loft(
    [
      { at: head.local({ forward: 0.03, down: 0.012 }), w: 0.036, h: 0.03 },
      { at: head.local({ forward: 0.072, down: 0.015 }), w: 0.02, h: 0.017 },
    ],
    { bone: head, color: CREAM_W, name: "muzzle" },
  );
  b.loft(
    [
      { at: head.local({ forward: 0.03, down: 0.025 }), w: 0.03, h: 0.012 },
      { at: head.local({ forward: 0.064, down: 0.025 }), w: 0.015, h: 0.007 },
    ],
    { bone: jaw, color: WHITE_FUR, name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.0075, 8, 6), DARK, {
    bone: head,
    at: head.local({ forward: 0.077, down: 0.011 }),
    scale: [1.25, 0.8, 0.9],
    name: "nose",
  });

  for (const s of [1, -1]) {
    // eyes
    b.decal(cranium, eyeTex, {
      at: head.local({ left: s * 0.026, up: 0.012, forward: 0.04 }),
      dir: [s * 0.5, 0.12, 1],
      size: [0.034, 0.034],
      mirror: s < 0,
      bone: head,
    });
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod(
        head.local({ left: s * 0.011, forward: 0.062, down: 0.012 + k * 0.003 }),
        head.local({ left: s * 0.058, forward: 0.068 - k * 0.006, down: 0.004 + k * 0.009 }),
        [0.0007, 0.0003],
        { color: DARK, bone: head, sides: 4 },
      );
    }

    // ears
    const side = s > 0 ? "L" : "R";
    const base = head.local({ left: s * 0.024, up: 0.03, back: 0.008 });
    const L: [number, number, number] = [s * 0.42, 1, -0.12];
    const W: [number, number, number] = [1, -s * 0.42, 0];
    const earJ = b.joint(`ear${side}`, { parent: head, at: base, dir: L, role: "hinge" });
    const tipPt = new THREE.Vector3(...L).normalize().multiplyScalar(0.11).add(base);
    const ear = b.extrude(
      [
        [-0.035, 0],
        [0.035, 0],
        [0.03, 0.04],
        [0.016, 0.085],
        [0, 0.11, "sharp"],
        [-0.016, 0.085],
        [-0.03, 0.04],
      ],
      {
        at: base,
        x: W,
        y: L,
        thickness: [0.008, 0.003],
        bevel: 0.0015,
        smoothing: 1,
        color: gradient(GOLD, GOLD_D, base, tipPt),
        bone: earJ,
        name: `ear${side}`,
      },
    );
    const lining = gradient(ROSE, grain(PEACH, PEACH_L, { size: 0.004, axis: L }), base, ear.local([0, 0.05, 0]));
    b.extrude(
      [
        [-0.026, 0],
        [0.026, 0],
        [0.022, 0.033],
        [0.011, 0.07],
        [0, 0.09, "sharp"],
        [-0.011, 0.07],
        [-0.022, 0.033],
      ],
      {
        at: ear.local([0, 0.012, 0.003]),
        x: W,
        y: L,
        thickness: 0.003,
        smoothing: 1,
        color: lining,
        bone: earJ,
        name: `earLining${side}`,
      },
    );
    // inner ear fluff along the lining edges
    const front = ear.axis;
    const hairFrames = [];
    const hairFlows = [];
    for (let k = 0; k < 5; k++) {
      const v = 0.006 + k * 0.012;
      const hw = (0.026 - v * 0.26) * 0.85;
      for (const e of [1, -1]) {
        hairFrames.push(frame(ear.local([e * hw, v + 0.012, 0.0045]), front));
        hairFlows.push(ear.dir([-e, 0.7, 0]));
      }
    }
    b.cards(hairFrames, tuft, {
      size: [0.011, 0.02],
      lean: 65,
      bend: 15,
      flow: (_f, i) => hairFlows[i],
      color: WHITE_FUR,
      bone: earJ,
    });
  }

  // cheek ruff
  const crSurf = b.surface(cranium);
  const cheekHits = [];
  for (const s of [1, -1])
    for (const az of [62, 80, 98])
      for (const el of [-32, -14]) {
        const h = crSurf.around(hc).at(s * az, el);
        if (h) cheekHits.push(h);
      }
  b.cards(cheekHits, tuft, {
    size: [0.018, 0.026],
    lean: 60,
    bend: 20,
    flow: [0, -0.6, -1],
    color: WHITE_FUR,
    vary: 0.2,
    rng: rng(9),
  });

  // ---------- legs ----------
  const pawGeo = () => new THREE.SphereGeometry(0.019, 8, 6);
  const pawY = G + 0.0117;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fPts = limb([s * 0.026, G + 0.11, 0.055], [s * 0.03, pawY, 0.062], [0.052, 0.05], [0, 0, -1]);
    const fLeg = b.chain(`legF${side}`, fPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `paw${side}`],
      role: "leg",
      contact: [s * 0.03, G, 0.07],
    });
    b.sweep(fLeg, [0.015, 0.012, 0.012], { color: legPaint });
    // hind
    const hPts = limb(
      [s * 0.03, G + 0.105, -0.06],
      [s * 0.032, pawY, -0.05],
      [0.045, 0.045, 0.03],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hLeg = b.chain(`legH${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.032, G, -0.042],
    });
    b.sweep(hLeg, [0.026, 0.017, 0.011, 0.012], { color: legPaint });

    // oversized paws with toes
    for (const [leg, foot] of [
      [fLeg, fPts[fPts.length - 1]],
      [hLeg, hPts[hPts.length - 1]],
    ] as const) {
      const tip = leg.tip!;
      b.part(pawGeo(), CREAM, { bone: tip, at: [foot.x, pawY, foot.z + 0.008], scale: [1, 0.62, 1.35] });
      for (const k of [-1.5, -0.5, 0.5, 1.5]) {
        b.part(new THREE.SphereGeometry(0.0065, 6, 4), CREAM_W, {
          bone: tip,
          at: [foot.x + k * 0.0085, G + 0.007, foot.z + 0.03 - Math.abs(k) * 0.003],
          scale: [1, 0.9, 1.2],
        });
      }
    }
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, G + 0.118, -0.09],
    [0, G + 0.105, -0.15],
    [0, G + 0.092, -0.205],
    [0, G + 0.098, -0.255],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 4, role: "tail" });
  const tailPaint = gradient(coat, TIPBLACK, tailPath.at(0.72), tailPath.at(1));
  const tailTube = b.sweep(tail, (t) => 0.012 + 0.02 * Math.sin(Math.PI * (0.15 + 0.75 * t)), {
    color: tailPaint,
  });
  b.cards(b.surface(tailTube).scatter(80, { rng: rng(4), minDist: 0.011 }), tuft, {
    size: [0.02, 0.032],
    lean: 55,
    bend: 25,
    flow: [0, 0, -1],
    vary: 0.3,
    rng: rng(5),
    color: tailPaint,
  });

  // body fur and chest ruff
  const bodySurf = b.surface(body);
  b.cards(bodySurf.scatter(90, { rng: rng(6), minDist: 0.012, filter: (h) => h.n.y > 0.15 }), tuft, {
    size: [0.016, 0.024],
    lean: 68,
    bend: 15,
    flow: [0, -0.2, -1],
    vary: 0.25,
    rng: rng(7),
    color: coat,
  });
  b.cards(bodySurf.scatter(30, { rng: rng(8), minDist: 0.009, filter: (h) => h.n.z > 0.45 }), tuft, {
    size: [0.016, 0.026],
    lean: 50,
    bend: 20,
    flow: [0, -1, 0.2],
    vary: 0.2,
    rng: rng(10),
    color: WHITE_FUR,
  });

  // ---------- collar & bell ----------
  const collar = b.surface(neckTube).loop(neck.at(0.62), { lift: 0.002 });
  b.sweep(collar, 0.0045, { color: braid, sides: 6, name: "collar" });
  let throat = collar.at(0);
  let best = -Infinity;
  for (let i = 0; i < 64; i++) {
    const p = collar.at(i / 64);
    const score = p.z - 0.3 * p.y;
    if (score > best) {
      best = score;
      throat = p;
    }
  }
  const bellBone = neck.joints[0];
  const ringAt = new THREE.Vector3(throat.x, throat.y - 0.004, throat.z + 0.006);
  b.part(new THREE.TorusGeometry(0.003, 0.0009, 4, 8), BRASS_D, { bone: bellBone, at: ringAt, rotation: [0, 90, 0] });
  const bellAt = new THREE.Vector3(ringAt.x, ringAt.y - 0.003 - 0.0105, ringAt.z);
  b.lathe(
    [
      [0, 0],
      [0.0075, 0],
      [0.0078, 0.0018],
      [0.0062, 0.006],
      [0.004, 0.009],
      [0, 0.0105],
    ],
    { at: bellAt, segments: 10, color: BRASS, bone: bellBone, name: "bell" },
  );
  b.part(new THREE.TorusGeometry(0.0066, 0.0007, 4, 12), BRASS_D, {
    bone: bellBone,
    at: bellAt.clone().add(new THREE.Vector3(0, 0.0028, 0)),
    rotation: [90, 0, 0],
  });
  b.part(new THREE.SphereGeometry(0.0022, 6, 4), DARK, {
    bone: bellBone,
    at: bellAt.clone().add(new THREE.Vector3(0, 0.0004, 0.002)),
  });

  // ---------- dune ----------
  const dune = b.lathe(
    [
      [0, 0],
      [0.55, 0],
      [0.46, 0.016],
      [0.32, 0.046],
      [0.18, 0.07],
      [0, 0.07],
    ],
    { at: [0, 0, 0], segments: 18, spin: 7, color: duneP, bone: root, name: "dune" },
  );
  const duneSurf = b.surface(dune);
  const down = (x: number, z: number) => duneSurf.ray([x, 0.5, z], [0, -1, 0]);

  // footprints trailing up the dune
  const prints = [];
  for (let i = 0; i < 6; i++) {
    const z = -0.46 + i * 0.055;
    const h = down((i % 2 ? 1 : -1) * 0.028 + 0.02 * Math.sin(i), z);
    if (h) prints.push(h);
  }
  b.cards(prints, pawPrint, { size: 0.024, lean: 90, flow: [0, 0, 1], mirror: true, color: PRINT, bone: root });

  // dry grass tufts
  const grassHits = [down(0.34, 0.14), down(0.37, 0.09), down(-0.3, -0.16), down(-0.12, 0.38)].filter(
    (h): h is NonNullable<typeof h> => h !== null,
  );
  b.cards(grassHits, grassTex, {
    size: [0.07, 0.085],
    cross: true,
    bend: 15,
    vary: 0.3,
    spin: 40,
    rng: rng(12),
    color: GRASS,
    bone: root,
  });

  // pebbles
  const pr = rng(21);
  for (let i = 0; i < 7; i++) {
    const a = pr() * Math.PI * 2;
    const r = 0.22 + pr() * 0.25;
    const h = down(Math.cos(a) * r, Math.sin(a) * r);
    if (h)
      b.stick(new THREE.DodecahedronGeometry(0.008 + pr() * 0.008, 0), PEBBLE, h, {
        flat: true,
        embed: 0.4,
        spin: pr() * 360,
        bone: root,
      });
  }

  return b.root;
}
