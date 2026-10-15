// Desert oasis diorama: a round sand plinth with a pond, three palms, two tents, three camels and camp clutter.
// Low-poly whimsical mix: faceted primitives (8-sided lathes, 8x6 spheres, box-section fronds) with chunky, cheerful
// proportions, big-eyed camels, striped cloth, bunting and a lantern, all in a sunny storybook palette.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A round sand plinth with a turquoise pond ringed by rocks, reeds and lotus, three leaning palms, a striped round tent and a gabled awning tent, a standing camel, a resting camel and a calf, a campfire, pots, cactus and bunting.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

const D = Math.PI / 180;
/** Height of the plinth's sand surface. */
const GY = 0.16;

export default function build() {
  const b = createBuilder({ name: "desertOasis", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------------------------------------------------
  // Placement helpers: a local frame (offset on the plinth, yaw, scale) so every object is drawn in its own axes.
  function loc(ox: number, oz: number, yawDeg: number, s = 1) {
    const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yawDeg * D);
    const yaw = yawDeg * D;
    return {
      q,
      s,
      P: (x: number, y: number, z: number) => V(x * s, y * s, z * s).applyQuaternion(q).add(V(ox, GY, oz)),
      fwd: V(Math.sin(yaw), 0, Math.cos(yaw)),
      xAxis: V(Math.cos(yaw), 0, -Math.sin(yaw)),
    };
  }
  type Loc = ReturnType<typeof loc>;
  const W = loc(0, 0, 0, 1);
  const Qe = (r: readonly number[]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D, r[1] * D, r[2] * D));

  const put = (
    L: Loc,
    geo: THREE.BufferGeometry,
    color: Fill,
    pos: readonly number[],
    size: number | readonly number[] = 1,
    rot: readonly number[] = [0, 0, 0],
    texture?: THREE.Texture,
  ) => {
    const sc = typeof size === "number" ? [size, size, size] : size;
    return b.part(geo, color, {
      at: L.P(pos[0], pos[1], pos[2]),
      quat: L.q.clone().multiply(Qe(rot)),
      scale: [sc[0] * L.s, sc[1] * L.s, sc[2] * L.s],
      flat: true,
      texture,
    });
  };
  const E = (L: Loc, color: Fill, pos: readonly number[], rad: readonly number[], rot: readonly number[] = [0, 0, 0]) =>
    put(L, new THREE.SphereGeometry(1, 8, 6), color, pos, rad, rot);
  const ball = (color: Fill, x: number, y: number, z: number, rad: readonly number[], rot: readonly number[] = [0, 0, 0]) =>
    E(W, color, [x, y, z], rad, rot);

  // ---------------------------------------------------------------------------------------------------------
  // Textures
  const kilim = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24">
<rect width="40" height="24" fill="#b3402e"/>
<rect width="40" height="3" fill="#26255a"/><rect y="21" width="40" height="3" fill="#26255a"/>
<rect y="3" width="40" height="1" fill="#f2d28a"/><rect y="20" width="40" height="1" fill="#f2d28a"/>
<polygon points="20,4 31,12 20,20 9,12" fill="#f2d28a"/>
<polygon points="20,7 27,12 20,17 13,12" fill="#1f8f94"/>
<polygon points="20,10 23,12 20,14 17,12" fill="#b3402e"/>
<polygon points="4,8 7,12 4,16 1,12" fill="#f2d28a"/><polygon points="36,8 39,12 36,16 33,12" fill="#f2d28a"/>
<polygon points="4,10 5.5,12 4,14 2.5,12" fill="#26255a"/><polygon points="36,10 37.5,12 36,14 34.5,12" fill="#26255a"/>
</svg>`,
    { size: 256 },
  );
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
<polygon points="2,40 0,18 7,40" fill="#4aa63a"/>
<polygon points="6,40 4,10 11,40" fill="#5fbf45"/>
<polygon points="11,40 14,2 19,40" fill="#3f9a33"/>
<polygon points="17,40 24,8 24,40" fill="#6fcb4f"/>
<polygon points="22,40 30,14 28,40" fill="#4aa63a"/>
</svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------------------------------------
  // Plinth, sand, dunes
  const sand = paint((p) => {
    const rip = Math.sin(p.x * 38 + p.z * 14 + noise(p, 0.3, 3) * 5);
    const t = noise(p, 0.25, 1) * 0.6 + rip * 0.12 + 0.2;
    return mix("#e9c987", "#f6e1a6", smoothstep(0.1, 0.7, t));
  });
  const strata = paint((p, n) => {
    if (n.y > 0.6) return sand;
    const k = Math.floor((p.y + noise(p, 0.2, 5) * 0.02) / 0.03);
    return ["#c8905a", "#b5743f", "#d6a06a", "#9c5f35"][((k % 4) + 4) % 4];
  });
  b.lathe(
    [
      [0, 0],
      [1.28, 0],
      [1.33, 0.05],
      [1.31, 0.12],
      [1.25, GY],
      [0, GY],
    ],
    { at: [0, 0, 0], segments: 22, color: strata },
  );
  ball(sand, -0.15, -1.0 - 0.0 + 0.0 - 0.0 - GY + GY - 0.05, 0, [0.001, 0.001, 0.001]); // placeholder removed below
  // dunes (half buried)
  const dune = (x: number, z: number, rx: number, ry: number, rz: number, yaw: number) =>
    ball(sand, x, -0.03, z, [rx, ry, rz], [0, yaw, 0]);
  dune(-0.15, -1.0, 0.45, 0.14, 0.2, 10);
  dune(-1.05, -0.1, 0.16, 0.11, 0.32, 8);
  dune(0.95, -0.82, 0.22, 0.1, 0.18, 30);
  dune(1.0, 0.75, 0.16, 0.08, 0.2, -20);

  // ---------------------------------------------------------------------------------------------------------
  // Pond
  const PX = -0.15;
  const PZ = 0.2;
  const waterPaint = paint((p) => {
    const d = Math.hypot(p.x - PX, p.z - PZ);
    const ring = Math.sin(d * 60) * 0.5 + 0.5;
    return mix(mix("#1f9fb5", "#46c7c9", smoothstep(0, 0.4, d)), "#bff3ea", ring * 0.06 + smoothstep(0.34, 0.41, d) * 0.35);
  });
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.008, 16), mottle("#b98e56", "#cba46a", { size: 0.08, seed: 4 }), {
    at: W.P(PX, 0.004, PZ),
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.41, 0.41, 0.014, 14), waterPaint, { at: W.P(PX, 0.007, PZ), flat: true });

  const stone = mottle("#8f8a7d", "#b9ae98", { size: 0.07, seed: 3 });
  const moss = mottle("#6f9c43", "#a8b85a", { size: 0.04, seed: 8 });
  const rockPaint = paint((p, n) => (n.y > 0.65 && noise(p, 0.09, 9) > 0.45 ? moss : stone));
  const rock = (x: number, z: number, r: number, seed: number) => {
    const k = rng(seed);
    return b.part(new THREE.IcosahedronGeometry(1, 0), rockPaint, {
      at: W.P(x, r * 0.35, z),
      scale: [r * (0.9 + k() * 0.5), r * (0.55 + k() * 0.35), r * (0.9 + k() * 0.5)],
      rotation: [k() * 40, k() * 360, k() * 40],
      flat: true,
    });
  };
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5 * D;
    const rr = 0.45 + (i % 3) * 0.015;
    rock(PX + Math.sin(a) * rr, PZ + Math.cos(a) * rr, 0.05 + 0.035 * ((i * 7) % 5) / 4, 100 + i);
  }
  rock(PX - 0.1, PZ - 0.52, 0.12, 301);
  rock(PX + 0.12, PZ - 0.55, 0.085, 302);
  rock(PX + 0.55, PZ - 0.05, 0.09, 303);

  // lily pads and lotus
  const pad = (x: number, z: number, r: number) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.006, 7), mottle("#4f9f3f", "#7cc24f", { size: 0.04, seed: 6 }), {
      at: W.P(x, 0.017, z),
      rotation: [0, x * 300, 0],
      flat: true,
    });
  };
  pad(PX + 0.1, PZ + 0.08, 0.05);
  pad(PX - 0.12, PZ - 0.1, 0.045);
  pad(PX + 0.17, PZ - 0.14, 0.038);
  pad(PX - 0.2, PZ + 0.14, 0.04);
  const lotus = (x: number, z: number) => {
    const c = W.P(x, 0.02, z);
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * D;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 0)).multiply(Qe([24, 0, 0]));
      b.part(new THREE.ConeGeometry(0.014, 0.05, 4), i % 2 ? "#ff8fb8" : "#ffb3cf", {
        at: c.clone().add(V(Math.sin(a) * 0.014, 0.022, Math.cos(a) * 0.014)),
        quat: q,
        flat: true,
      });
    }
    b.part(new THREE.SphereGeometry(0.013, 6, 4), "#ffd23f", { at: c.clone().add(V(0, 0.018, 0)), flat: true });
  };
  lotus(PX + 0.1, PZ + 0.08);
  lotus(PX - 0.2, PZ + 0.14);

  // reeds with cattails
  const reed = (x: number, z: number, h: number, lx: number, lz: number, tail: boolean) => {
    const path = catmull([W.P(x, 0, z), W.P(x + lx * 0.4, h * 0.5, z + lz * 0.4), W.P(x + lx, h, z + lz)]);
    b.sweep(path, [0.006, 0.003], { sides: 4, color: "#6aa84a", caps: "point" });
    if (tail) b.capsule(path.at(0.78), path.at(0.97), 0.011, "#6b3f23", { sides: 5 });
  };
  for (const [ang, n] of [
    [-110, 4],
    [-60, 3],
    [35, 3],
    [150, 4],
    [100, 3],
  ] as const) {
    for (let i = 0; i < n; i++) {
      const a = (ang + i * 9) * D;
      const rr = 0.52 + i * 0.03;
      const h = 0.2 + 0.1 * rand();
      reed(PX + Math.sin(a) * rr, PZ + Math.cos(a) * rr, h, Math.sin(a) * 0.05, Math.cos(a) * 0.05, i % 2 === 0);
    }
  }

  // grass mounds with tuft cards
  const grassPaint = mottle("#5ea63c", "#8cc152", { size: 0.1, seed: 5 });
  const frames: ReturnType<typeof frame>[] = [];
  const mound = (x: number, z: number, rx: number, rz: number) => {
    ball(grassPaint, x, -0.015, z, [rx, 0.05, rz], [0, rand() * 90, 0]);
    for (let i = 0; i < 6; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.8;
      frames.push(frame(W.P(x + Math.cos(a) * rx * r, 0.02, z + Math.sin(a) * rz * r), [0, 1, 0]));
    }
  };
  mound(-0.5, 0.55, 0.17, 0.12);
  mound(0.28, 0.6, 0.14, 0.1);
  mound(0.32, -0.02, 0.14, 0.1);
  mound(-0.62, -0.02, 0.12, 0.14);
  mound(0.05, -0.45, 0.16, 0.1);
  for (const [x, z] of [
    [0.4, -0.7],
    [-0.35, -0.3],
    [0.9, 0.1],
    [-0.9, 0.7],
  ])
    frames.push(frame(W.P(x, 0, z), [0, 1, 0]));
  b.cards(frames, tuft, { size: [0.07, 0.08], cross: true, vary: 0.3, spin: 180, rng: rand, sink: 0.05 });

  // flowers
  const flower = (x: number, z: number, color: string) => {
    b.rod(W.P(x, 0, z), W.P(x, 0.07, z), 0.003, "#5a9a3a", { sides: 4 });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), color, { at: W.P(x, 0.078, z), flat: true });
    b.part(new THREE.SphereGeometry(0.006, 4, 3), "#ffd23f", { at: W.P(x, 0.088, z), flat: true });
  };
  flower(-0.48, 0.58, "#ff8fb8");
  flower(-0.55, 0.5, "#f7f0e0");
  flower(0.3, 0.63, "#ffb347");
  flower(0.26, 0.56, "#ff8fb8");
  flower(0.34, 0.0, "#f7f0e0");
  flower(-0.6, -0.08, "#ffb347");
  flower(0.08, -0.47, "#ff8fb8");

  // pebbles
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.3 + rand() * 0.85;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (Math.hypot(x - PX, z - PZ) < 0.6) continue;
    const s = 0.012 + rand() * 0.014;
    b.part(new THREE.IcosahedronGeometry(1, 0), stone, {
      at: W.P(x, s * 0.2, z),
      scale: [s * 1.3, s * 0.7, s],
      rotation: [0, rand() * 360, 0],
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Palms
  const frondPaint = paint((p, n) => mix(n.y > 0.3 ? "#58b440" : "#2f7d33", "#2c6a2c", noise(p, 0.08, 4) * 0.5));
  function palm(x: number, z: number, h: number, lean: number, yawDeg: number, seed: number) {
    const yaw = yawDeg * D;
    const dx = Math.sin(yaw);
    const dz = Math.cos(yaw);
    const pt = (t: number) => V(x + dx * lean * t * t, GY + h * t, z + dz * lean * t * t);
    const bark = paint((p) => {
      const k = Math.floor((p.y - GY) / 0.032);
      return mix(k % 2 ? "#8b5a33" : "#a97646", "#5e3a20", noise(p, 0.06, 2) * 0.5);
    });
    b.sweep(catmull([0, 0.25, 0.5, 0.75, 1].map(pt)), (t) => 0.056 - 0.026 * t, {
      sides: 7,
      color: bark,
      caps: { start: "flat", end: "round" },
    });
    b.part(new THREE.ConeGeometry(0.085, 0.07, 7), "#7b4e2b", { at: V(x, GY + 0.03, z), flat: true });
    const top = pt(1);
    b.part(new THREE.SphereGeometry(0.05, 7, 5), "#3d7f35", { at: top.clone().add(V(0, 0.01, 0)), scale: [1, 0.7, 1], flat: true });
    for (let i = 0; i < 4; i++) {
      const a = i * 90 * D + seed;
      b.part(new THREE.SphereGeometry(0.024, 6, 4), "#6b3f23", {
        at: top.clone().add(V(Math.sin(a) * 0.035, -0.03, Math.cos(a) * 0.035)),
        flat: true,
      });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + seed;
      const ox = Math.sin(a);
      const oz = Math.cos(a);
      const len = 0.42 + 0.08 * Math.sin(i * 2.1 + seed);
      const rise = i % 2 ? 0.16 : 0.22;
      const path = bezier(
        top.clone().add(V(ox * 0.02, 0.01, oz * 0.02)),
        top.clone().add(V(ox * len * 0.4, rise, oz * len * 0.4)),
        top.clone().add(V(ox * len * 0.8, rise * 0.9, oz * len * 0.8)),
        top.clone().add(V(ox * len * 1.05, -0.12 - 0.04 * (i % 3), oz * len * 1.05)),
      );
      b.sweep(
        path,
        (t): [number, number] => {
          const env = 0.055 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.9)) * (1 - 0.25 * t);
          const tri = Math.abs(((t * 11) % 1) - 0.5) * 2;
          return [Math.max(env * (0.55 + 0.45 * tri), 0.003), 0.005];
        },
        { section: "box", up: [0, 1, 0], caps: "flat", color: frondPaint },
      );
      b.sweep(path, 0.006, { sides: 4, color: "#cfe27a", caps: "flat" });
    }
    return { pt };
  }
  palm(-0.95, 0.35, 0.95, 0.3, 80, 0.3);
  const palm2 = palm(0.25, -0.22, 0.85, 0.25, -110, 1.1);
  palm(-0.9, 0.55 + 0.05, 0.6, 0.15, 60, 2.0);

  // ---------------------------------------------------------------------------------------------------------
  // Pots, kettle
  const potProfile: OutlinePoint[] = [
    [0, 0],
    [0.03, 0],
    [0.06, 0.04],
    [0.07, 0.09],
    [0.055, 0.15],
    [0.032, 0.18],
    [0.042, 0.205],
    [0, 0.205],
  ];
  const pot = (x: number, z: number, sc: number, clay: string) => {
    const potPaint = paint((p, _n, s) => {
      const h = s[0] / sc;
      if (h > 0.07 && h < 0.095) return "#3b2a5a";
      if (h > 0.1 && h < 0.108) return "#f0d9a0";
      return mix(clay, "#7a3a20", noise(p, 0.05, 6) * 0.4);
    });
    b.lathe(
      potProfile.map(([px, py]) => [px * sc, py * sc] as OutlinePoint),
      { at: W.P(x, 0, z), segments: 10, color: potPaint },
    );
    for (const sx of [1, -1])
      b.part(new THREE.TorusGeometry(0.03 * sc, 0.007 * sc, 4, 8, Math.PI), clay, {
        at: W.P(x + sx * 0.045 * sc, 0.14 * sc, z),
        quat: Qe([0, 0, -sx * 90]),
        flat: true,
      });
  };

  // ---------------------------------------------------------------------------------------------------------
  // Tent A: round striped tent
  function tentA(cx: number, cz: number, yawDeg: number) {
    const L = loc(cx, cz, yawDeg, 1);
    const tentPaint = paint((p, n) => {
      const y = p.y - GY;
      if (y < 0.04) return mix("#6b3a2a", "#4b2a1f", noise(p, 0.05, 2) * 0.6);
      const a = Math.atan2(p.x - cx, p.z - cz);
      const sec = Math.floor((a / (2 * Math.PI) + 0.5) * 16);
      if (y > 0.146 || n.y > 0.35)
        return sec % 2
          ? mix("#c9392c", "#a82a22", noise(p, 0.08, 3))
          : mix("#f4e6c4", "#e3d1a2", noise(p, 0.08, 4));
      if (y > 0.07 && y < 0.095) return "#d8a23a";
      return mix("#f2e2bc", "#dfc99a", noise(p, 0.1, 5));
    });
    b.lathe(
      [
        [0, 0],
        [0.28, 0],
        [0.28, 0.14],
        [0.34, 0.155],
        [0.22, 0.26],
        [0.1, 0.37],
        [0.04, 0.42],
        [0, 0.43],
      ],
      { at: [cx, GY, cz], segments: 8, color: tentPaint },
    );
    const arch: OutlinePoint[] = [
      [-0.065, 0],
      [0.065, 0],
      [0.065, 0.11],
      [0.03, 0.165],
      [0, 0.18, "sharp"],
      [-0.03, 0.165],
      [-0.065, 0.11],
    ];
    const archBig = arch.map(([x, y, k]) => (k ? [x * 1.2, y * 1.12, k] : [x * 1.2, y * 1.12])) as OutlinePoint[];
    b.extrude(archBig, { at: L.P(0, 0, 0.283), x: L.xAxis, thickness: 0.05, color: "#e0a93a" });
    b.extrude(arch, { at: L.P(0, 0, 0.292), x: L.xAxis, thickness: 0.056, color: "#3a2214" });
    for (const sx of [1, -1])
      put(L, new THREE.BoxGeometry(0.03, 0.15, 0.012), "#b3402e", [sx * 0.07, 0.085, 0.322], 1, [0, 0, -sx * 8]);
    // pole, finial, pennant
    b.rod(V(cx, GY + 0.42, cz), V(cx, GY + 0.55, cz), 0.008, "#6b4a2b", { sides: 5 });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), "#e0a93a", { at: V(cx, GY + 0.565, cz), flat: true });
    b.extrude(
      [
        [0, 0],
        [0.12, 0.022],
        [0, 0.044],
      ],
      { at: V(cx, GY + 0.5, cz), x: [1, 0, 0], thickness: 0.004, color: "#d33a2c" },
    );
    // guy ropes and pegs
    for (let k = 0; k < 6; k++) {
      const a = (k * 60 + 30) * D;
      const sx = Math.sin(a);
      const sz = Math.cos(a);
      b.rod(V(cx + sx * 0.27, GY + 0.2, cz + sz * 0.27), V(cx + sx * 0.5, GY + 0.04, cz + sz * 0.5), 0.004, "#e8dcc0", {
        sides: 4,
      });
      b.part(new THREE.CylinderGeometry(0.008, 0.006, 0.05, 5), "#6b4a2b", { at: V(cx + sx * 0.5, GY + 0.02, cz + sz * 0.5), flat: true });
    }
    // rug at door, cushions
    b.part(new THREE.PlaneGeometry(0.34, 0.24), "#ffffff", {
      at: L.P(0, 0.004, 0.5),
      dir: [0, 1, 0],
      axis: "z",
      up: L.fwd,
      texture: kilim,
    });
    E(L, "#1f8f94", [-0.09, 0.025, 0.5], [0.06, 0.022, 0.05], [0, 20, 0]);
    E(L, "#e0a93a", [0.1, 0.025, 0.52], [0.055, 0.02, 0.05], [0, -25, 0]);
  }
  tentA(0.62, -0.38, -20);

  // ---------------------------------------------------------------------------------------------------------
  // Tent B: gabled tent with striped awning
  function tentB(cx: number, cz: number, yawDeg: number) {
    const L = loc(cx, cz, yawDeg, 1);
    const wallPaint = paint((p) =>
      p.y - GY < 0.03 ? "#7a4a2d" : mix("#f1e0b8", "#e0c898", noise(p, 0.1, 4)),
    );
    const gable: OutlinePoint[] = [
      [-0.25, 0],
      [0.25, 0],
      [0.25, 0.14],
      [0, 0.33, "sharp"],
      [-0.25, 0.14],
    ];
    b.extrude(gable, { at: L.P(0, 0, 0), x: L.xAxis, thickness: 0.44, color: wallPaint });
    const roofPaint = stripes("#f4e6c4", "#1f8f94", { size: 0.09, axis: L.fwd.clone(), width: 0.5, wobble: 0 });
    for (const sx of [1, -1])
      put(L, new THREE.BoxGeometry(0.377, 0.014, 0.56), roofPaint, [sx * 0.153, 0.225, 0], 1, [0, 0, -sx * 37.8]);
    b.rod(L.P(0, 0.34, -0.32), L.P(0, 0.34, 0.32), 0.014, "#d9a63a", { sides: 6 });
    for (const sz of [-0.33, 0.33]) E(L, "#e0a93a", [0, 0.34, sz], [0.022, 0.022, 0.022]);
    // awning
    const awnPaint = stripes("#f4e6c4", "#c9392c", { size: 0.08, axis: L.xAxis.clone(), width: 0.5, wobble: 0 });
    put(L, new THREE.BoxGeometry(0.5, 0.01, 0.26), awnPaint, [0, 0.215, 0.35], 1, [12, 0, 0]);
    for (const sx of [1, -1]) {
      b.rod(L.P(sx * 0.23, 0, 0.47), L.P(sx * 0.23, 0.19, 0.47), 0.01, "#6b4a2b", { sides: 5 });
      E(L, "#e0a93a", [sx * 0.23, 0.2, 0.47], [0.016, 0.016, 0.016]);
    }
    for (let i = 0; i < 9; i++)
      put(L, new THREE.ConeGeometry(0.014, 0.034, 4), i % 2 ? "#e0a93a" : "#c9392c", [-0.22 + i * 0.055, 0.17, 0.477], 1, [180, 0, 0]);
    // door
    const arch: OutlinePoint[] = [
      [-0.065, 0],
      [0.065, 0],
      [0.065, 0.11],
      [0.03, 0.165],
      [0, 0.18, "sharp"],
      [-0.03, 0.165],
      [-0.065, 0.11],
    ];
    const archBig = arch.map(([x, y, k]) => (k ? [x * 1.25, y * 1.12, k] : [x * 1.25, y * 1.12])) as OutlinePoint[];
    b.extrude(archBig, { at: L.P(0, 0, 0.2185), x: L.xAxis, thickness: 0.008, color: "#e0a93a" });
    b.extrude(arch, { at: L.P(0, 0, 0.222), x: L.xAxis, thickness: 0.01, color: "#3a2214" });
    for (const sx of [1, -1]) {
      put(L, new THREE.BoxGeometry(0.035, 0.15, 0.012), "#b3402e", [sx * 0.058, 0.085, 0.232], 1, [0, 0, -sx * 8]);
      put(L, new THREE.BoxGeometry(0.04, 0.008, 0.016), "#e0a93a", [sx * 0.05, 0.075, 0.234]);
    }
    // rug, cushions
    b.part(new THREE.PlaneGeometry(0.44, 0.3), "#ffffff", {
      at: L.P(0, 0.004, 0.62),
      dir: [0, 1, 0],
      axis: "z",
      up: L.fwd,
      texture: kilim,
    });
    E(L, "#c9392c", [0.12, 0.03, 0.56], [0.07, 0.025, 0.06], [0, 15, 0]);
    E(L, "#1f8f94", [-0.1, 0.03, 0.66], [0.065, 0.025, 0.055], [0, -20, 0]);
    // lantern
    b.rod(L.P(-0.2, 0.19, 0.46), L.P(-0.2, 0.13, 0.46), 0.003, "#3a2a1a", { sides: 4 });
    put(L, new THREE.ConeGeometry(0.03, 0.025, 6), "#e0a93a", [-0.2, 0.12, 0.46]);
    glow(put(L, new THREE.SphereGeometry(0.028, 6, 5), "#ffc45a", [-0.2, 0.085, 0.46]), 1.6);
    put(L, new THREE.CylinderGeometry(0.024, 0.02, 0.012, 6), "#e0a93a", [-0.2, 0.054, 0.46]);
    // pots by the wall
    const p1 = L.P(0.36, 0, 0.12);
    const p2 = L.P(0.32, 0, 0.32);
    pot(p1.x, p1.z, 1.1, "#c8683a");
    pot(p2.x, p2.z, 0.8, "#d9904a");
    return L;
  }
  tentB(-0.68, -0.6, 15);

  // ---------------------------------------------------------------------------------------------------------
  // Campfire, kettle, logs, sacks
  {
    const fx = 0.98;
    const fz = -0.08;
    for (let i = 0; i < 7; i++) {
      const a = i * (360 / 7) * D;
      ball(rockPaint, fx + Math.sin(a) * 0.09, 0.012, fz + Math.cos(a) * 0.09, [0.03, 0.022, 0.03], [0, i * 50, 0]);
    }
    for (let i = 0; i < 3; i++)
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.15, 6), "#6b4226", {
        at: W.P(fx, 0.03, fz),
        quat: Qe([0, i * 60, 90]),
        flat: true,
      });
    glow(b.part(new THREE.ConeGeometry(0.05, 0.12, 5), "#ff7a1f", { at: W.P(fx, 0.09, fz), flat: true }), 1.4);
    glow(b.part(new THREE.ConeGeometry(0.03, 0.1, 5), "#ffd54a", { at: W.P(fx + 0.01, 0.08, fz - 0.005), flat: true }), 1.6);
    glow(b.part(new THREE.ConeGeometry(0.022, 0.07, 4), "#ff4a1a", { at: W.P(fx - 0.04, 0.06, fz + 0.02), flat: true }), 1.3);
    for (const [ex, ez] of [
      [0.03, 0.04],
      [-0.03, -0.03],
      [0.05, -0.02],
    ])
      glow(b.part(new THREE.SphereGeometry(0.01, 4, 3), "#ff6a2a", { at: W.P(fx + ex, 0.025, fz + ez), flat: true }), 1.5);
    // log seats
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 7), "#8a5a33", { at: W.P(fx + 0.02, 0.035, fz + 0.28), quat: Qe([0, 20, 90]), flat: true });
    b.part(new THREE.CircleGeometry(0.035, 7), "#d9a96a", { at: W.P(fx + 0.12 * Math.cos(20 * D) + 0.02, 0.035, fz + 0.28 - 0.12 * Math.sin(20 * D)), dir: [Math.cos(20 * D), 0, -Math.sin(20 * D)], axis: "z" });
    // kettle on a flat stone
    const kx = fx - 0.2;
    const kz = fz + 0.12;
    ball(rockPaint, kx, 0.008, kz, [0.05, 0.016, 0.05]);
    b.lathe(
      [
        [0, 0],
        [0.035, 0],
        [0.045, 0.02],
        [0.04, 0.05],
        [0.02, 0.065],
        [0, 0.07],
      ],
      { at: W.P(kx, 0.02, kz), segments: 8, color: "#6c7480" },
    );
    b.capsule(W.P(kx + 0.035, 0.04, kz), W.P(kx + 0.07, 0.07, kz), 0.009, "#6c7480", { sides: 5 });
    b.part(new THREE.TorusGeometry(0.03, 0.004, 4, 8, Math.PI), "#3a2a1a", { at: W.P(kx, 0.075, kz), quat: Qe([0, 0, 0]), flat: true });
    // sacks by tent A
    const sk = (x: number, z: number, s: number, c: string) => {
      ball(c, x, 0.045 * s, z, [0.06 * s, 0.05 * s, 0.05 * s], [0, x * 100, 0]);
      b.part(new THREE.ConeGeometry(0.02 * s, 0.03 * s, 5), c, { at: W.P(x, 0.1 * s, z), flat: true });
      b.part(new THREE.TorusGeometry(0.02 * s, 0.004, 4, 6), "#6b4a2b", { at: W.P(x, 0.085 * s, z), quat: Qe([90, 0, 0]), flat: true });
    };
    sk(0.4, -0.18, 1.1, "#d9c7a0");
    sk(0.31, -0.24, 0.9, "#c9b080");
    sk(0.36, -0.1, 0.8, "#e5d6b0");
    pot(0.98, -0.52, 1.0, "#c8683a");
  }

  // ---------------------------------------------------------------------------------------------------------
  // Cactus
  {
    const cx = 0.25;
    const cz = -0.8;
    const cactusPaint = paint((p) => (noise(p, 0.025, 3) > 0.72 ? "#f4f0c0" : mix("#4f9a45", "#2f7a3a", noise(p, 0.1, 2))));
    const g = (x: number, y: number, z: number) => W.P(cx + x, y, cz + z);
    b.sweep(catmull([g(0, 0, 0), g(0, 0.1, 0), g(0, 0.22, 0.01)]), [0.042, 0.034], {
      section: { ngon: 8 },
      color: cactusPaint,
      caps: { start: "flat", end: "round" },
    });
    b.sweep(catmull([g(0.03, 0.08, 0), g(0.09, 0.09, 0), g(0.12, 0.15, 0), g(0.12, 0.21, 0)]), 0.022, {
      section: { ngon: 6 },
      color: cactusPaint,
    });
    b.sweep(catmull([g(-0.03, 0.12, 0), g(-0.08, 0.13, 0), g(-0.1, 0.17, 0), g(-0.1, 0.2, 0)]), 0.02, {
      section: { ngon: 6 },
      color: cactusPaint,
    });
    for (const [x, y] of [
      [0, 0.255],
      [0.12, 0.24],
      [-0.1, 0.225],
    ])
      for (let i = 0; i < 5; i++) {
        const a = i * 72 * D;
        b.part(new THREE.ConeGeometry(0.01, 0.026, 4), "#ff6fa5", {
          at: g(x + Math.sin(a) * 0.01, y, Math.cos(a) * 0.01),
          quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, 0)).multiply(Qe([25, 0, 0])),
          flat: true,
        });
      }
    ball("#ff9a3a", cx, 0.015 - 0.015, cz, [0.001, 0.001, 0.001]);
  }

  // ---------------------------------------------------------------------------------------------------------
  // Camels
  const cloth = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"><rect width="8" height="8" fill="#26255a"/><polygon points="4,0 8,4 4,8 0,4" fill="#e0a93a"/></svg>`,
    { size: 32 },
  );
  void cloth;
  function camel(
    ox: number,
    oz: number,
    yaw: number,
    s: number,
    pose: "stand" | "rest",
    tone: readonly [string, string],
    saddle: boolean,
  ) {
    const L = loc(ox, oz, yaw, s);
    const coat = countershade(mottle(tone[0], tone[1], { size: 0.12, seed: Math.round(ox * 10) + 2 }), "#ecd4a4", { level: -0.3 });
    const FUR = "#5b3a20";
    const PAD = "#6e5238";
    const stand = pose === "stand";
    const yb = stand ? 0.33 : 0.17;
    const rs = (r: readonly number[]) => r.map((v) => v * s);
    const tube = (pts: number[][], r: readonly number[], color: Fill, extra: { sides?: number } = {}) =>
      b.sweep(catmull(pts.map((q) => L.P(q[0], q[1], q[2]))), rs(r), { color, sides: extra.sides ?? 6 });

    // body
    E(L, coat, [0, yb, 0], [0.12, 0.13, 0.26]);
    E(L, coat, [0, yb - 0.01, 0.17], [0.11, 0.125, 0.12]);
    E(L, coat, [0, yb + 0.005, -0.17], [0.115, 0.125, 0.12]);
    E(L, coat, [0, yb + 0.115, 0.02], [0.075, 0.09, 0.09]);
    E(L, FUR, [0, yb + 0.195, 0.02], [0.034, 0.03, 0.04]);
    // neck
    const neckL = [
      [0, yb + 0.04, 0.2],
      [0, yb + 0.15, 0.3],
      [0, yb + 0.25, 0.3],
      [0, yb + 0.33, 0.35],
    ];
    tube(neckL, [0.062, 0.05, 0.042, 0.04], coat, { sides: 7 });
    const nl = catmull(neckL.map((q) => V(q[0], q[1], q[2])));
    for (const t of [0.25, 0.45, 0.65, 0.85]) {
      const q = nl.at(t);
      put(L, new THREE.ConeGeometry(0.018, 0.05, 5), FUR, [q.x, q.y + 0.045, q.z - 0.012], 1, [-30, 0, 0]);
    }
    E(L, FUR, [0, yb + 0.13, 0.28], [0.03, 0.05, 0.03], [20, 0, 0]);
    // head
    E(L, coat, [0, yb + 0.345, 0.41], [0.05, 0.048, 0.065]);
    E(L, "#ecd4a4", [0, yb + 0.325, 0.485], [0.043, 0.038, 0.05]);
    E(L, "#d9b988", [0, yb + 0.303, 0.478], [0.033, 0.016, 0.045]);
    for (const sx of [1, -1]) {
      E(L, "#3a2214", [sx * 0.016, yb + 0.335, 0.532], [0.009, 0.007, 0.008]);
      E(L, "#ffffff", [sx * 0.042, yb + 0.36, 0.43], [0.015, 0.015, 0.015]);
      E(L, "#2a1a10", [sx * 0.049, yb + 0.362, 0.437], [0.01, 0.01, 0.01]);
      E(L, "#ffffff", [sx * 0.052, yb + 0.367, 0.44], [0.004, 0.004, 0.004]);
      E(L, FUR, [sx * 0.044, yb + 0.373, 0.43], [0.019, 0.008, 0.019]);
      put(L, new THREE.ConeGeometry(0.014, 0.045, 5), coat, [sx * 0.032, yb + 0.4, 0.385], 1, [-15, 0, -sx * 25]);
      put(L, new THREE.ConeGeometry(0.008, 0.03, 4), "#e8a2a2", [sx * 0.033, yb + 0.395, 0.392], 1, [-15, 0, -sx * 25]);
    }
    put(L, new THREE.ConeGeometry(0.02, 0.04, 5), FUR, [0, yb + 0.39, 0.4], 1, [10, 0, 0]);
    // tail
    tube(
      [
        [0, yb + 0.05, -0.27],
        [0, yb - 0.01, -0.34],
        [0, yb - 0.12, -0.34],
      ],
      [0.014, 0.009],
      coat,
      { sides: 5 },
    );
    E(L, FUR, [0, yb - 0.145, -0.345], [0.02, 0.035, 0.02]);
    // legs
    if (stand) {
      for (const sx of [1, -1])
        for (const zz of [0.16, -0.17]) {
          const front = zz > 0;
          const pts = front
            ? [
                [sx * 0.08, yb - 0.07, zz],
                [sx * 0.08, 0.17, zz + 0.012],
                [sx * 0.08, 0.07, zz],
              ]
            : [
                [sx * 0.085, yb - 0.05, zz],
                [sx * 0.08, 0.15, zz - 0.03],
                [sx * 0.075, 0.07, zz + 0.01],
              ];
          tube(pts, [0.038, 0.028, 0.02], coat);
          put(L, new THREE.CylinderGeometry(0.03, 0.036, 0.03, 6), PAD, [sx * (front ? 0.08 : 0.075), 0.015, zz]);
          if (front) E(L, "#8a6a48", [sx * 0.08, 0.172, zz + 0.032], [0.026, 0.03, 0.014]);
        }
    } else {
      for (const sx of [1, -1]) {
        tube(
          [
            [sx * 0.09, yb - 0.05, 0.14],
            [sx * 0.095, 0.05, 0.2],
            [sx * 0.095, 0.035, 0.33],
          ],
          [0.04, 0.03, 0.028],
          coat,
        );
        E(L, coat, [sx * 0.105, 0.1, -0.13], [0.045, 0.085, 0.12]);
        tube(
          [
            [sx * 0.1, 0.05, -0.08],
            [sx * 0.1, 0.035, -0.22],
            [sx * 0.1, 0.035, -0.31],
          ],
          [0.032, 0.03, 0.028],
          coat,
        );
      }
      E(L, "#8a6a48", [0, 0.045, 0.17], [0.06, 0.03, 0.06]);
    }
    // bridle
    b.part(new THREE.TorusGeometry(0.045, 0.004, 4, 8), "#c9392c", {
      at: L.P(0, yb + 0.325, 0.46),
      quat: L.q.clone(),
      scale: s,
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.052, 0.004, 4, 8), "#e0a93a", {
      at: L.P(0, yb + 0.345, 0.37),
      quat: L.q.clone(),
      scale: s,
      flat: true,
    });
    E(L, "#e0a93a", [0, yb + 0.13, 0.31], [0.014, 0.014, 0.014]);
    // saddle blanket
    if (saddle) {
      put(L, new THREE.BoxGeometry(0.2, 0.008, 0.14), "#ffffff", [0, yb + 0.135, -0.14], 1, [0, 0, 0], kilim);
      for (const sx of [1, -1]) {
        put(L, new THREE.BoxGeometry(0.09, 0.008, 0.14), "#ffffff", [sx * 0.1345, yb + 0.106, -0.14], 1, [0, 0, -sx * 40], kilim);
        for (let i = 0; i < 5; i++)
          put(L, new THREE.ConeGeometry(0.009, 0.03, 4), i % 2 ? "#e0a93a" : "#c9392c", [sx * 0.169, yb + 0.06, -0.19 + i * 0.025], 1, [180, 0, 0]);
      }
    }
  }
  camel(0.95, 0.4, -100, 1, "stand", ["#c4934f", "#d8ab69"], true);
  camel(0.2, 0.85, 70, 1, "rest", ["#b88547", "#cf9c5c"], true);
  camel(-0.6, 0.8, 90, 0.6, "stand", ["#dcb479", "#ecc88d"], false);

  // ---------------------------------------------------------------------------------------------------------
  // Bunting from tent A pole to palm trunk
  {
    const start = V(0.62, GY + 0.52, -0.38);
    const end = palm2.pt(0.5);
    const mid = start.clone().lerp(end, 0.5).add(V(0, -0.08, 0));
    const rope = catmull([start, mid, end]);
    b.sweep(rope, 0.003, { sides: 4, color: "#e8dcc0" });
    const cols = ["#c9392c", "#e0a93a", "#1f8f94", "#f4e6c4"];
    for (let k = 1; k <= 10; k++) {
      const t = k / 11;
      const pt = rope.at(t);
      const tg = rope.tangentAt(t);
      const xd = V(tg.x, 0, tg.z).normalize();
      b.extrude(
        [
          [-0.02, 0],
          [0.02, 0],
          [0, -0.045],
        ],
        { at: pt, x: xd, thickness: 0.004, color: cols[k % 4] },
      );
    }
  }

  return b.root;
}
