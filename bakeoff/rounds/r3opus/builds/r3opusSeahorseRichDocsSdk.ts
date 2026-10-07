import * as THREE from "three";
import { createBuilder, frame, rng, catmull, paint, noise, gradient, grain, mottle, spots } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with a ridged, faceted body, thin dark lines and white freckles. Its tail is curled around a strand of seagrass rising from a sandy mound, and it has a spiky coronet, a tube snout, big curious eyes and a fluttering dorsal fin.",
};

export default function build() {
  const b = createBuilder({ name: "linedSeahorse", paintSize: 2048 });

  // ---------- palette ----------
  const YELLOW = "#ffc93a";
  const YELLOW2 = "#ffb72e";
  const BELLY = "#ffe27e";
  const LINE = "#4a2814";
  const RIDGE = "#eb9a26";
  const FRECKLE = "#fffaf0";
  const SCLERA = "#fff3c4";
  const IRIS = "#23998c";
  const PUPIL = "#120d0a";
  const WHITE = "#ffffff";
  const MOUTH = "#5a2a18";
  const FIN = "#fbe9ad";
  const FIN_EDGE = "#fff8de";
  const RAY = "#e0a640";
  const GRASS = "#4f9a5a";
  const GRASS2 = "#3f8650";
  const GRASS_DARK = "#2c5e3c";
  const GRASS_TIP = "#b9c75c";
  const SAND = "#ead5a6";
  const SAND2 = "#d7bb86";
  const STAR = "#ff7a4d";
  const STAR_DOT = "#ffd8b0";
  const PEBBLE1 = "#9aa7a8";
  const PEBBLE2 = "#c6b8a0";

  const STEM_Z = -0.03;
  const base = b.joint("base", { at: [0, 0, STEM_Z] });

  // ---------- body path: head end -> belly -> tail coil around the grass ----------
  const R = 0.0095;
  const helix: number[][] = [];
  const turns = 1.6;
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const phi = -u * turns * 2 * Math.PI;
    const y = 0.082 - u * 0.04;
    helix.push([R * Math.sin(phi), y, STEM_Z + R * Math.cos(phi)]);
  }
  const H0 = [0, 0.224, 0.002];
  const N = [0, 0.208, -0.004];
  const C1 = [0, 0.185, 0.003];
  const CORE = [0, 0.155, 0.006];
  const B = [0, 0.125, 0.0];
  const T1 = [0, 0.1, -0.01];
  const bodyPath = catmull([H0, N, C1, CORE, B, T1, ...helix]);

  const coreT = bodyPath.closestT(CORE);
  const core = b.joint("core", { parent: base, at: CORE });
  const front = b.chain("spine", bodyPath.slice(coreT, 0), {
    parent: core,
    count: 3,
    names: ["spine", "chest", "neck"],
    role: "spine",
  });
  const tail = b.chain("tail", bodyPath.slice(coreT, 1), { parent: core, count: 12, role: "tail" });

  // radius profile keyed at path points: [t, rx (side), ry (front-back), shift forward]
  const keys: number[][] = [
    [0, 0.0085, 0.0095, 0],
    [bodyPath.closestT(N), 0.0075, 0.0085, 0],
    [bodyPath.closestT(C1), 0.0115, 0.014, 0.001],
    [coreT, 0.013, 0.017, 0.003],
    [bodyPath.closestT(B), 0.0105, 0.013, 0.0015],
    [bodyPath.closestT(T1), 0.0065, 0.0068, 0],
    [bodyPath.closestT(helix[0]), 0.0048, 0.0048, 0],
    [1, 0.0018, 0.0018, 0],
  ];
  const tExit = keys[6][0];
  const prof = (t: number) => {
    if (t <= keys[0][0]) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const c = keys[i + 1];
      if (t <= c[0]) {
        let u = (t - a[0]) / Math.max(1e-6, c[0] - a[0]);
        u = u * u * (3 - 2 * u);
        return [t, a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u, a[3] + (c[3] - a[3]) * u];
      }
    }
    return keys[keys.length - 1];
  };

  // lined skin paint
  const bodyPaint = paint((p, n, s) => {
    const wob = (noise(p, 0.02, 3) - 0.5) * 40;
    const d = (((s[1] + wob) % 24) + 24) % 24;
    if (d < 2.0 && noise(p, 0.012, 9) > 0.28) return LINE;
    if (n.z > 0.6 && p.y > 0.11 && p.y < 0.2) return BELLY;
    return noise(p, 0.015, 5) > 0.62 ? YELLOW2 : YELLOW;
  });

  const body = b.sweep(bodyPath, (t: number) => {
    const k = prof(t);
    return [k[1], k[2]] as [number, number];
  }, {
    bone: [front, core, tail],
    up: [0, 0, 1],
    section: { ngon: 7 },
    shift: (t: number) => [0, prof(t)[3]] as [number, number],
    color: bodyPaint,
    name: "body",
  });
  const surf = b.surface(body);

  // ridge rings + knobs (bony plates)
  for (let t = 0.03; t < 0.93; t += 0.03) {
    try {
      const loop = surf.loop(frame(bodyPath.at(t), bodyPath.tangentAt(t)), { lift: 0.0002 });
      b.sweep(loop, 0.0008, { color: RIDGE, sides: 5, group: "ridges" });
    } catch (_e) {
      /* skip a ring that cannot be cut */
    }
    const degs = t < tExit ? [180, 128, 232, 76, 284] : [0, 90, 270];
    for (const deg of degs) {
      try {
        b.stick(new THREE.IcosahedronGeometry(0.0012, 0), RIDGE, body.at(t, deg), {
          embed: 0.35,
          flat: true,
          group: "knobs",
        });
      } catch (_e) {
        /* ignore */
      }
    }
  }

  // white freckles
  const fr = rng(21);
  for (const h of surf.scatter(30, {
    rng: fr,
    minDist: 0.008,
    filter: (h) => h.at.y > 0.1 && h.at.y < 0.215,
  }))
    b.stick(new THREE.SphereGeometry(0.0011, 6, 4).scale(1, 0.45, 1), FRECKLE, h, { embed: 0.4, group: "freckles" });

  // ---------- head ----------
  const head = b.joint("head", { parent: front.joints[2], at: H0, dir: [0, -0.15, 1], role: "head" });
  const skull = b.loft(
    [
      { at: [0, 0.229, -0.011], w: 0.012, h: 0.014 },
      { at: [0, 0.229, -0.002], w: 0.019, h: 0.024 },
      { at: [0, 0.226, 0.008], w: 0.018, h: 0.021 },
      { at: [0, 0.22, 0.018], w: 0.011, h: 0.012 },
      { at: [0, 0.216, 0.025], w: 0.0075, h: 0.0075 },
    ],
    { bone: head, color: bodyPaint, sides: 8, name: "skull" },
  );
  // tube snout
  b.rod([0, 0.2165, 0.022], [0, 0.2108, 0.0515], [0.0034, 0.003], { bone: head, color: bodyPaint, sides: 7, name: "snout" });
  b.capsule([0, 0.2114, 0.0508], [0, 0.2108, 0.0556], 0.0024, { bone: head, color: YELLOW, sides: 7, name: "upperLip" });
  b.part(new THREE.SphereGeometry(0.0016, 6, 4), MOUTH, { bone: head, at: [0, 0.2099, 0.0548] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.2096, 0.0495], aim: [0, 0.2088, 0.057], role: "jaw" });
  b.capsule([0, 0.2091, 0.0503], [0, 0.2087, 0.0552], 0.0019, { bone: jaw, color: BELLY, sides: 6, name: "lowerJaw" });

  // snout rings
  for (const u of [0.25, 0.5, 0.75]) {
    const a = new THREE.Vector3(0, 0.2165, 0.022).lerp(new THREE.Vector3(0, 0.2108, 0.0515), u);
    b.part(new THREE.TorusGeometry(0.0033, 0.0005, 4, 10), RIDGE, {
      bone: head,
      at: a,
      dir: [0, -0.19, 1],
      axis: "z",
    });
  }

  // big curious eyes
  const eyeCenters: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const E = new THREE.Vector3(s * 0.0098, 0.2295, 0.006);
    eyeCenters.push(E);
    const d = new THREE.Vector3(s * 0.8, 0.12, 0.55).normalize();
    b.part(new THREE.SphereGeometry(0.0062, 12, 8), SCLERA, { bone: head, at: E, name: "eye" });
    b.part(new THREE.SphereGeometry(0.0064, 12, 6, 0, Math.PI * 2, 0, 0.8), IRIS, { bone: head, at: E, dir: d });
    b.part(new THREE.SphereGeometry(0.0066, 10, 4, 0, Math.PI * 2, 0, 0.45), PUPIL, { bone: head, at: E, dir: d });
    const dh = d.clone().add(new THREE.Vector3(0, 0.55, 0.25)).normalize();
    b.part(new THREE.SphereGeometry(0.0011, 6, 4), WHITE, { bone: head, at: E.clone().addScaledVector(dh, 0.0066) });
    b.part(new THREE.SphereGeometry(0.0006, 5, 3), WHITE, {
      bone: head,
      at: E.clone().addScaledVector(d.clone().add(new THREE.Vector3(0, -0.35, 0.1)).normalize(), 0.0067),
    });
    // lid rim
    b.part(new THREE.TorusGeometry(0.0058, 0.0011, 5, 14), RIDGE, {
      bone: head,
      at: E.clone().addScaledVector(d, 0.0022),
      dir: d,
      axis: "z",
    });
    // eye spine and cheek spine
    b.spike([s * 0.008, 0.2345, 0.003], [s * 0.5, 1, 0.2], 0.0045, 0.0012, { bone: head, color: RIDGE });
    b.spike([s * 0.0085, 0.2205, 0.0], [s * 1, -0.4, -0.3], 0.0035, 0.001, { bone: head, color: RIDGE });
  }

  // head freckles
  for (const h of b.surface(skull).scatter(8, {
    rng: rng(5),
    minDist: 0.006,
    filter: (h) => h.n.y > -0.2 && eyeCenters.every((e) => e.distanceTo(h.at) > 0.009),
  }))
    b.stick(new THREE.SphereGeometry(0.0009, 6, 4).scale(1, 0.45, 1), FRECKLE, h, { embed: 0.4, bone: head });

  // coronet
  b.lathe(
    [
      [0, 0],
      [0.0036, 0],
      [0.003, 0.0035],
      [0.0042, 0.0055],
      [0, 0.0055],
    ],
    { at: [0, 0.238, -0.004], segments: 7, bone: head, color: RIDGE, name: "coronet" },
  );
  b.ring(frame([0, 0.2432, -0.004], [0, 1, 0]), { count: 5, radius: 0.0034, tilt: 45 }, (it) => {
    b.spike(it, it, 0.0048, 0.001, { color: YELLOW, bone: head });
  });
  b.spike([0, 0.243, -0.004], [0, 1, 0.1], 0.0065, 0.0013, { color: YELLOW, bone: head });

  // pectoral fins
  const pecOutline: OutlinePoint[] = [
    [0, -0.0015],
    [0.004, -0.0045],
    [0.0075, -0.004],
    [0.0095, -0.0008],
    [0.009, 0.0025],
    [0.0065, 0.005],
    [0.003, 0.0045],
    [0, 0.0015],
  ];
  const pecPaint = paint((_p, _n, s) => {
    const a = (Math.atan2(s[1], s[0]) * 180) / Math.PI;
    const f = (((a + 90) % 12) + 12) % 12;
    if (f < 2.2) return RAY;
    return Math.hypot(s[0], s[1]) > 0.0075 ? FIN_EDGE : FIN;
  });
  for (const s of [1, -1]) {
    const hit = surf.nearest([s * 0.02, 0.214, -0.002]);
    b.extrude(pecOutline, {
      at: hit.at,
      x: [s * 0.15, 0.3, -1],
      y: [s * 0.2, 1, 0.3],
      thickness: 0.0008,
      smoothing: 1,
      color: pecPaint,
      bone: head,
      name: "pectoral",
    });
  }

  // fluttering dorsal fin
  const finHit = surf.ray([0, 0.147, -0.1], [0, 0, 1]);
  const finAt = finHit ? finHit.at : new THREE.Vector3(0, 0.147, -0.011);
  const finJoint = b.joint("dorsalFin", { parent: core, at: finAt, dir: [0, 0, -1], role: "fan" });
  const finPaint = paint((_p, _n, s) => {
    const f = (((s[0] + 0.02) / 0.0026) % 1 + 1) % 1;
    if (f < 0.22 && s[1] < 0.0095) return RAY;
    return s[1] > 0.0075 ? FIN_EDGE : FIN;
  });
  b.extrude(
    [
      [-0.017, -0.004],
      [0.017, -0.004],
      [0.016, 0.006],
      [0.012, 0.0105],
      [0.008, 0.0092],
      [0.004, 0.011],
      [0, 0.0095],
      [-0.004, 0.011],
      [-0.008, 0.0092],
      [-0.012, 0.0105],
      [-0.016, 0.007],
    ],
    {
      at: finAt,
      x: [0, 1, 0],
      y: [0, 0, -1],
      thickness: [0.0012, 0.0005],
      smoothing: 1,
      color: finPaint,
      bone: finJoint,
      name: "dorsalFin",
    },
  );

  // ---------- seagrass ----------
  const grassPaint = gradient(
    gradient(GRASS_DARK, grain(GRASS, GRASS2, { size: 0.003, axis: "y" }), [0, 0, 0], [0, 0.1, 0]),
    GRASS_TIP,
    [0, 0.22, 0],
    [0, 0.38, 0],
  );
  const grassPaint2 = gradient(
    gradient(GRASS_DARK, grain(GRASS2, "#5aa565", { size: 0.003, axis: "y", seed: 4 }), [0, 0, 0], [0, 0.08, 0]),
    GRASS_TIP,
    [0, 0.15, 0],
    [0, 0.3, 0],
  );
  const blade = (
    name: string,
    pts: number[][],
    w: number,
    twist: number | ((t: number) => number),
    col: typeof grassPaint,
  ) => {
    const ch = b.chain(name, catmull(pts), { parent: base, count: Math.min(5, pts.length - 1), twist });
    b.sweep(ch, (t: number) => [w * (1 - 0.55 * t * t), 0.0007] as [number, number], {
      section: "box",
      caps: { start: "flat", end: "point" },
      color: col,
      name,
    });
  };
  blade(
    "grass",
    [
      [0, 0.003, STEM_Z],
      [0, 0.04, STEM_Z],
      [0, 0.09, STEM_Z],
      [0.006, 0.17, -0.042],
      [0.016, 0.26, -0.04],
      [0.03, 0.33, -0.028],
      [0.042, 0.37, -0.012],
    ],
    0.006,
    (t: number) => (t < 0.35 ? 0 : (t - 0.35) * 70),
    grassPaint,
  );
  blade(
    "grassB",
    [
      [0.022, 0.003, -0.05],
      [0.026, 0.08, -0.055],
      [0.045, 0.17, -0.06],
      [0.07, 0.24, -0.045],
    ],
    0.0055,
    50,
    grassPaint2,
  );
  blade(
    "grassC",
    [
      [-0.02, 0.003, -0.042],
      [-0.024, 0.09, -0.05],
      [-0.036, 0.19, -0.06],
      [-0.05, 0.28, -0.05],
    ],
    0.0058,
    -40,
    grassPaint,
  );
  blade(
    "grassD",
    [
      [-0.03, 0.003, 0.0],
      [-0.036, 0.05, 0.01],
      [-0.05, 0.1, 0.03],
      [-0.06, 0.13, 0.045],
    ],
    0.005,
    30,
    grassPaint2,
  );
  blade(
    "grassE",
    [
      [0.032, 0.003, -0.015],
      [0.038, 0.05, -0.008],
      [0.055, 0.09, 0.005],
      [0.068, 0.11, 0.02],
    ],
    0.0048,
    -60,
    grassPaint,
  );

  // ---------- sandy mound ----------
  const mound = b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.07, 0.004],
      [0.05, 0.011],
      [0.025, 0.016],
      [0, 0.017],
    ],
    { at: [0, 0, STEM_Z], segments: 16, smoothing: 1, bone: base, color: mottle(SAND, SAND2, { size: 0.012 }), name: "mound" },
  );
  const moundSurf = b.surface(mound);

  const pebbles: [number, number, string, number][] = [
    [-0.045, -0.01, PEBBLE1, 0.006],
    [0.035, -0.075, PEBBLE2, 0.007],
    [-0.05, -0.065, PEBBLE2, 0.005],
    [0.06, -0.045, PEBBLE1, 0.0045],
    [-0.015, 0.025, PEBBLE1, 0.004],
  ];
  for (const [x, z, col, r] of pebbles) {
    const h = moundSurf.ray([x, 0.1, z], [0, -1, 0]);
    if (!h) continue;
    b.part(new THREE.DodecahedronGeometry(r, 0).scale(1, 0.6, 1), col, {
      bone: base,
      at: [h.at.x, h.at.y + r * 0.25, h.at.z],
      rotation: [0, x * 4000, 0],
      flat: true,
    });
  }

  // little starfish
  const star: OutlinePoint[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? 0.015 : 0.0058;
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const sh = moundSurf.ray([0.045, 0.1, 0.012], [0, -1, 0]);
  if (sh) {
    b.extrude(star, {
      at: [sh.at.x, sh.at.y + 0.0016, sh.at.z],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.0035,
      bevel: 0.0012,
      smoothing: 1,
      bone: base,
      color: spots(STAR, STAR_DOT, { size: 0.0035, amount: 0.25 }),
      name: "starfish",
    });
  }

  return b.root;
}
