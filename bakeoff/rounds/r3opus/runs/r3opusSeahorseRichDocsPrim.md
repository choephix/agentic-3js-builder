```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  offset,
  rng,
  paint,
  mottle,
  cells,
  noise,
  gradient,
  grain,
  spots,
} from "agentic-3js-builder";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny yellow lined seahorse with fine dark lines and white freckles, its tail curled around a seagrass blade on a little sand mound.",
};

function need<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing ${what}`);
  return v;
}

export default function build() {
  const b = createBuilder({ name: "linedSeahorse", paintSize: 2048 });
  const R_ = rng(11);

  // Palette
  const YELLOW = "#ffd23a";
  const GOLD = "#f7ae25";
  const RIDGE = "#f09a1c";
  const LINE = "#5e3313";
  const FRECKLE = "#fffaf0";
  const SPIKE = "#e6781a";
  const SPIKE_TIP = "#7a3a12";
  const EYE_WHITE = "#fffdf5";
  const IRIS = "#d0661c";
  const PUPIL = "#141018";
  const RIM = "#f07d18";
  const FIN = "#fff1b8";
  const FIN_RAY = "#f2a43a";
  const FIN_EDGE = "#ffcf63";

  // Paints
  const base = mottle(YELLOW, GOLD, { size: 0.018, seed: 3 });
  const bodyPaint = paint((p, _n, s) => {
    const c = cells(p, 0.011, 5);
    if (c.d1 < 0.0012 && noise(p, 0.03, 9) > 0.52) return FRECKLE;
    const a = (((s[1] % 24) + 24) % 24);
    if (a < 3) return LINE;
    return base;
  });
  const finPaint = paint((_p, _n, s) => {
    const dx = s[0] - 0.004;
    const dy = s[1] - 0.022;
    const ang = Math.atan2(dy, -dx);
    const d = Math.hypot(dx, dy);
    const k = (((ang / (8 * Math.PI / 180)) % 1) + 1) % 1;
    if (k < 0.16 && d > 0.004) return FIN_RAY;
    return d > 0.018 ? FIN_EDGE : FIN;
  });
  const pecPaint = paint((_p, _n, s) => {
    const ang = Math.atan2(s[1], -s[0]);
    const k = (((ang / (14 * Math.PI / 180)) % 1) + 1) % 1;
    if (k < 0.18) return FIN_RAY;
    return Math.hypot(s[0], s[1]) > 0.009 ? FIN_EDGE : FIN;
  });
  const grassPaint = gradient(
    grain("#2a6a34", "#3d8c46", { size: 0.003, axis: "y" }),
    "#a6dc72",
    [0, 0.02, 0],
    [0, 0.34, 0],
  );
  const sandPaint = mottle("#ecd7a0", "#d3b676", { size: 0.01, seed: 4 });
  const starPaint = spots("#ff7a66", "#ffd8c8", { size: 0.004, amount: 0.3, seed: 2 });

  // ---------- Body path: tail tip (coiled round the strand) up to the head ----------
  const strandZ = 0.014;
  const coil: number[][] = [];
  const turns = 1.55;
  const steps = Math.round(turns * 8);
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const th = u * turns * Math.PI * 2;
    const r = 0.0068 - 0.0012 * u;
    const y = 0.075 - 0.017 * u;
    coil.push([Math.sin(th) * r, y, strandZ - Math.cos(th) * r]);
  }
  coil.reverse(); // tip first
  const coilStart = coil[coil.length - 1];
  const pA = [0, 0.087, 0.003];
  const pB = [0, 0.1, -0.006];
  const pC = [0, 0.116, -0.01];
  const pD = [0, 0.14, -0.004];
  const pE = [0, 0.168, -0.005];
  const pF = [0, 0.195, -0.012];
  const pG = [0, 0.218, -0.016];
  const pH = [0, 0.234, -0.012];
  const body = catmull([...coil, pA, pB, pC, pD, pE, pF, pG, pH]);

  const keys: [number, number][] = [
    [0, 0.0017],
    [body.closestT(coilStart), 0.0034],
    [body.closestT(pB), 0.006],
    [body.closestT(pC), 0.0105],
    [body.closestT(pD), 0.0165],
    [body.closestT(pE), 0.0145],
    [body.closestT(pF), 0.0085],
    [body.closestT(pG), 0.0095],
    [1, 0.011],
  ];
  const R = (t: number) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, r0] = keys[i];
      const [t1, r1] = keys[i + 1];
      if (t <= t1) {
        const u = Math.min(1, Math.max(0, (t - t0) / Math.max(1e-6, t1 - t0)));
        const sm = u * u * (3 - 2 * u);
        return r0 + (r1 - r0) * sm;
      }
    }
    return keys[keys.length - 1][1];
  };

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.135, -0.005] });
  const rootT = body.closestT(hips.at);
  const front = b.chain("spine", body.slice(rootT, 1), {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "neck1", "neck2"],
    role: "spine",
  });
  const back = b.chain("tail", body.slice(rootT, 0), { parent: hips, count: 10, role: "tail" });
  const head = b.joint("head", { parent: front, at: pH, dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.2305, 0.05], dir: [0, -0.1, 1], role: "jaw" });

  // ---------- Body tube ----------
  const bodyS = b.sweep(body, R, { bone: [back, hips, front], color: bodyPaint, sides: 8, name: "body" });

  // Ridge rings and tubercles
  const tEnd = keys[6][0] + 0.03;
  const ringCount = 30;
  for (let i = 0; i < ringCount; i++) {
    const t = 0.035 + ((tEnd - 0.035) * i) / (ringCount - 1);
    const r = R(t);
    b.part(new THREE.TorusGeometry(r * 1.03, r * 0.16, 3, 8), RIDGE, {
      at: body.at(t),
      dir: body.tangentAt(t),
      axis: "z",
      flat: true,
      name: `ridge${i}`,
    });
    if (t > 0.12) {
      for (const d of [65, -65]) {
        b.stick(new THREE.ConeGeometry(r * 0.12 + 0.0006, r * 0.3 + 0.0012, 5), RIDGE, bodyS.at(t, d), {
          embed: 0.3,
          flat: true,
        });
      }
    }
  }

  // ---------- Head ----------
  const headS = b.loft(
    [
      { at: [0, 0.243, -0.018], w: 0.016, h: 0.018 },
      { at: [0, 0.247, -0.006], w: 0.024, h: 0.026 },
      { at: [0, 0.245, 0.008], w: 0.021, h: 0.022 },
      { at: [0, 0.239, 0.02], w: 0.011, h: 0.011 },
      { at: [0, 0.235, 0.036], w: 0.0085, h: 0.0085 },
      { at: [0, 0.233, 0.048], w: 0.0085, h: 0.0085 },
      { at: [0, 0.2325, 0.053], w: 0.0095, h: 0.009 },
    ],
    { bone: head, color: bodyPaint, name: "skull" },
  );
  const skullC = [0, 0.247, -0.004];
  const headSurf = b.surface(headS);

  // Mouth: upper lip on head, lower jaw on jaw
  b.capsule([0, 0.2345, 0.051], [0, 0.2338, 0.0585], 0.003, { bone: head, color: GOLD, name: "upperLip" });
  b.capsule(jaw.at, [0, 0.229, 0.0582], 0.0026, { bone: jaw, color: RIDGE, name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(0.0018, 6, 4), PUPIL, { bone: head, at: [0, 0.2318, 0.0598] });

  // Eyes
  for (const s of [1, -1]) {
    const hit = need(headSurf.around(skullC).at(s * 85, 12), "eye hit");
    const n = hit.n.clone().normalize();
    const center = offset(hit.at, n, 0.0022);
    b.part(new THREE.SphereGeometry(0.0068, 12, 9), EYE_WHITE, { bone: head, at: center, name: `eye${s > 0 ? "L" : "R"}` });
    const gaze = n.clone().add(new THREE.Vector3(0, 0.15, 0.7)).normalize();
    b.part(new THREE.SphereGeometry(0.0047, 10, 8), IRIS, { bone: head, at: offset(center, gaze, 0.0031) });
    b.part(new THREE.SphereGeometry(0.0029, 8, 6), PUPIL, { bone: head, at: offset(center, gaze, 0.0055) });
    b.part(new THREE.SphereGeometry(0.0012, 6, 4), "#ffffff", {
      bone: head,
      at: offset(offset(center, gaze, 0.0078), [0, 1, 0.3], 0.0016),
    });
    b.part(new THREE.TorusGeometry(0.0069, 0.0013, 4, 12), RIM, {
      bone: head,
      at: offset(center, n, 0.0008),
      dir: n,
      axis: "z",
      flat: true,
    });
    // brow spike
    const brow = n.clone().multiplyScalar(0.6).add(new THREE.Vector3(0, 1, 0)).normalize();
    b.spike(offset(center, brow, 0.0062), brow.clone().add(new THREE.Vector3(0, 0, -0.6)), 0.0055, 0.0014, {
      bone: head,
      color: SPIKE,
    });
    // cheek knob
    const cheek = n.clone().add(new THREE.Vector3(0, -0.9, -0.4)).normalize();
    b.spike(offset(center, cheek, 0.0075), cheek, 0.003, 0.0013, { bone: head, color: SPIKE });
  }

  // Coronet: a little crown of spikes
  const crownHit = need(headSurf.around(skullC).at(180, 68), "crown hit");
  const crown = b.stick(new THREE.CylinderGeometry(0.0034, 0.0046, 0.008, 6), RIDGE, crownHit, {
    embed: 0.3,
    flat: true,
    name: "coronet",
  });
  const top = crown.moved(crown.local([0, 0.004, 0]));
  b.ring(top, { count: 5, radius: 0.0028, tilt: 50 }, (item) =>
    b.spike(item, item, 0.0065, 0.0013, { color: SPIKE, bands: [[0.6, SPIKE], [1, SPIKE_TIP]] }),
  );
  b.spike(top, top, 0.009, 0.0016, { color: SPIKE, bands: [[0.6, SPIKE], [1, SPIKE_TIP]] });

  // ---------- Fins ----------
  const finJ = b.joint("finDorsal", { parent: hips, at: [0, 0.135, -0.018], dir: [0, 0, -1], role: "fan" });
  b.extrude(
    [
      [0.002, 0, "sharp"],
      [0.002, 0.044, "sharp"],
      [-0.006, 0.047],
      [-0.012, 0.042],
      [-0.017, 0.038],
      [-0.022, 0.03],
      [-0.025, 0.021],
      [-0.025, 0.012],
      [-0.02, 0.005],
      [-0.012, 0.0],
    ],
    { at: [0, 0.118, -0.012], thickness: 0.0012, bevel: 0.0004, smoothing: 1, color: finPaint, bone: finJ, name: "dorsalFin" },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pec = b.joint(`pec${side}`, { parent: front, at: [s * 0.008, 0.205, -0.006], dir: [s * 0.5, 0, -1], role: "fan" });
    b.extrude(
      [
        [0.001, -0.004, "sharp"],
        [0.001, 0.004, "sharp"],
        [-0.006, 0.008],
        [-0.011, 0.006],
        [-0.013, 0.0],
        [-0.01, -0.006],
        [-0.005, -0.007],
      ],
      {
        at: pec.at,
        x: [-s * 0.45, 0, 1],
        y: [0, 1, 0],
        thickness: 0.001,
        bevel: 0.0003,
        smoothing: 1,
        color: pecPaint,
        bone: pec,
        name: `pecFin${side}`,
      },
    );
  }

  // ---------- Seagrass and sand ----------
  b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.072, 0.003],
      [0.05, 0.008],
      [0.02, 0.0115],
      [0, 0.012],
    ],
    { at: [0, 0, 0], bone: hips, segments: 14, smoothing: 1, color: sandPaint, name: "sand" },
  );

  const blade = catmull([
    [0, 0, strandZ],
    [0, 0.07, strandZ],
    [0.01, 0.16, 0.012],
    [0.035, 0.25, 0.006],
    [0.06, 0.33, 0],
  ]);
  b.sweep(blade, (t: number) => [0.0036 * (1 - 0.35 * t), 0.0009], {
    bone: hips,
    color: grassPaint,
    sides: 6,
    caps: { start: "flat", end: "point" },
    name: "seagrass",
  });

  const extra: number[][][] = [
    [[-0.03, 0, -0.025], [-0.045, 0.09, -0.035], [-0.07, 0.17, -0.05]],
    [[0.035, 0, -0.03], [0.045, 0.07, -0.045], [0.065, 0.13, -0.06]],
    [[-0.02, 0, 0.035], [-0.03, 0.05, 0.045], [-0.05, 0.1, 0.062]],
    [[0.03, 0, 0.03], [0.04, 0.05, 0.04], [0.058, 0.085, 0.05]],
  ];
  extra.forEach((pts, i) =>
    b.sweep(catmull(pts), (t: number) => [0.003 * (1 - 0.3 * t), 0.0008], {
      bone: hips,
      color: grassPaint,
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: `grass${i}`,
    }),
  );

  // Pebbles
  const pebbleCols = ["#b9a585", "#8f8a80", "#d8c8a8", "#a08870"];
  for (let i = 0; i < 7; i++) {
    const a = R_() * Math.PI * 2;
    const r = 0.028 + R_() * 0.035;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.abs(x) < 0.012 && z > 0) continue;
    const h = 0.012 * (1 - (r / 0.075) ** 2);
    const size = 0.0028 + R_() * 0.003;
    b.part(new THREE.IcosahedronGeometry(size, 0), pebbleCols[i % pebbleCols.length], {
      bone: hips,
      at: [x, h, z],
      scale: [1, 0.6, 1.2],
      rotation: [0, R_() * 180, 0],
      flat: true,
    });
  }

  // Starfish
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 + Math.PI / 2;
    const rad = i % 2 ? 0.0042 : 0.011;
    star.push([Math.cos(ang) * rad, Math.sin(ang) * rad]);
  }
  b.extrude(star, {
    at: [-0.04, 0.0082, 0.034],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.003,
    bevel: 0.0012,
    smoothing: 1,
    color: starPaint,
    bone: hips,
    name: "starfish",
  });

  return b.root;
}
```