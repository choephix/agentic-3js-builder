import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Joint } from "../src/skeleton";
import { DEG, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { grain, mix, mottle, noise, paint, scales, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Tidecaller Leviathan",
  description:
    "A towering sea serpent coiled out of a tidal pool, neck reared, jaws roaring: teal hand-painted scales, gold belly plates, ivory horns and spines, a bronze fang gorget and old harpoons in its hide.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours) -- the scales themselves are paints below.

const IVORY = "#f2e5bd";
const IVORY_D = "#c9b588";
const ORANGE = "#f4892a";
const EMBER = "#ffb42a";
const RED = "#c9362b";
const BLOOD = "#7d1b30";
const MOUTH = "#b83a4c";
const TONGUE = "#d9556a";
const GOLD = "#ecb637";
const GOLD_D = "#a9741f";
const BRONZE = "#b4772d";
const BRONZE_D = "#7a4a1b";
const IRON = "#5b6573";
const IRON_D = "#2f3744";
const WOOD = "#8c5b33";
const WOOD_D = "#5d3a1e";
const ROPE = "#d3bf8d";
const BLACK = "#140c1a";
const TEAL_DK = "#0d5361";
const TEAL_MD = "#1a9d92";
const TURQ = "#43f2d8";
const KELP_DK = "#1f5e34";
const BARN = "#cfd7c6";
const BARN_D = "#8e9b8d";

const tri = (x: number) => Math.abs((((x % 1) + 1) % 1) * 2 - 1);
const frac = (x: number) => ((x % 1) + 1) % 1;

// Scale tones: lit top, mid flank, shaded low; the chevron war-paint is the same three steps in blue.
const tone = (list: string[], edge: string) => scales(list, edge, { size: 0.15, width: 0.2, seed: 3 });
const TEAL_HI = tone(["#62e6c6", "#4cd6bd", "#74eed0"], "#1b8c88");
const TEAL_M = tone(["#21b5a2", "#1ba598", "#27c1ac"], "#0c5868");
const TEAL_LO = tone(["#12838c", "#10788a", "#15949c"], "#06324c");
const NAVY_HI = tone(["#3487d2", "#2f7bc6", "#3f93de"], "#143c74");
const NAVY_M = tone(["#215fa8", "#1e579c", "#2669b6"], "#0c2c5c");
const NAVY_LO = tone(["#15437f", "#123b75", "#194d8f"], "#071d42");

/** The hide: hand-painted scale tiers by light, blue chevrons down the flanks, gold belly scutes between dark seams. */
function skin(len: number, period: number, tip: boolean, chevrons: boolean) {
  return paint((p, n, s) => {
    const along = s[0] * len;
    const d = ((s[1] % 360) + 360) % 360;
    const top = d > 180 ? 360 - d : d;
    const wob = (noise(p, 0.45, 5) - 0.5) * 26;
    const edge = 128 + wob + 7 * tri(along / (period * 2));
    if (tip && s[0] < 0.028) return mix(ORANGE, EMBER, s[0] / 0.028);
    if (top > edge) {
      const f = frac(along / period);
      if (f < 0.1) return "#8d4f14";
      const c = mix("#ffd864", "#e08a22", f);
      return top > 166 ? mix(c, "#8a4a10", 0.35) : c;
    }
    if (top > edge - 3.5) return "#07263a";
    if (top < 8) return "#0a2f4c";
    const band = chevrons && top < 108 && frac(along / 0.7 - top / 110) < 0.2;
    const lift = wob / 130;
    if (n.y > 0.5 + lift) return band ? NAVY_HI : TEAL_HI;
    if (n.y > -0.15 + lift) return band ? NAVY_M : TEAL_M;
    return band ? NAVY_LO : TEAL_LO;
  });
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "leviathan", paintSize: 2048 });
  const R = rng(17);

  // ---- Body curve: a tail tip curled up at the outside, two and a half stacked laps, then a swan neck ----------
  const keyed = (u: number, keys: number[][]) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const [u0, v0] = keys[i];
      const [u1, v1] = keys[i + 1];
      if (u <= u1) return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0);
    }
    return keys[keys.length - 1][1];
  };
  const radiusKeys = [
    [0, 0.035],
    [0.03, 0.09],
    [0.09, 0.2],
    [0.2, 0.34],
    [0.32, 0.44],
    [0.5, 0.52],
    [0.7, 0.55],
    [1, 0.5],
  ];
  const PITCH = 0.9;
  const STEPS = 54;
  const centreZ = -0.4;
  const ctl: { p: number[]; r: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const u = i / STEPS;
    const th = u * 864;
    const r = keyed(u, radiusKeys);
    const rho = 3.05 - 1.55 * u;
    const a = (th + 36) * DEG;
    const curl = 1.15 * Math.pow(Math.max(0, 1 - u / 0.07), 2);
    const climb = Math.max(0, th / 360 - 0.4) * PITCH;
    ctl.push({ p: [rho * Math.sin(a), r + climb + curl, centreZ + rho * Math.cos(a)], r });
  }
  const neck: [number[], number][] = [
    [[-0.6, 2.9, -1.98], 0.47],
    [[-0.9, 3.85, -1.8], 0.43],
    [[-0.6, 4.8, -1.3], 0.41],
    [[-0.15, 5.55, -0.7], 0.38],
    [[0.1, 6.05, 0.0], 0.36],
    [[0.1, 6.2, 0.72], 0.35],
  ];
  for (const [p, r] of neck) ctl.push({ p, r });

  const bodyPath = catmull(ctl.map((c) => c.p));
  const keyT: number[] = [];
  const keyR: number[] = [];
  ctl.forEach((c, i) => {
    let t = bodyPath.closestT(c.p);
    if (i > 0 && t <= keyT[i - 1]) t = keyT[i - 1] + 1e-4;
    keyT.push(t);
    keyR.push(c.r);
  });
  keyT[0] = 0;
  keyT[keyT.length - 1] = 1;
  const radiusAt = (t: number) => {
    for (let i = 0; i < keyT.length - 1; i++) {
      if (t <= keyT[i + 1]) {
        const f = (t - keyT[i]) / (keyT[i + 1] - keyT[i]);
        return keyR[i] + (keyR[i + 1] - keyR[i]) * f;
      }
    }
    return keyR[keyR.length - 1];
  };
  const LEN = bodyPath.length;

  // ---- Skeleton -----------------------------------------------------------------------------------------------
  const coilEndT = bodyPath.closestT(ctl[STEPS].p);
  const midT = coilEndT * 0.62;
  const core = b.joint("core", { at: bodyPath.at(coilEndT), dir: bodyPath.tangentAt(coilEndT), role: "spine" });
  const front = b.chain("neck", bodyPath.slice(coilEndT, 1), { parent: core, count: 10, role: "neck" });
  const spine = b.chain("spine", bodyPath.slice(coilEndT, midT), { parent: core, count: 9, role: "spine" });
  const tail = b.chain("tail", bodyPath.slice(midT, 0), {
    parent: spine.joints[spine.joints.length - 1],
    count: 16,
    role: "tail",
  });

  const headDir = new THREE.Vector3(0, -0.2, 1).normalize();
  const head = b.joint("head", {
    parent: front.joints[front.joints.length - 1],
    at: bodyPath.at(1),
    dir: headDir,
    role: "head",
  });
  // head-frame helper: left (+X side), forward along the skull, up
  const S = 1.22; // heroic oversized head: every head-frame position and radius below is multiplied by this
  const H = (left: number, fwd: number, up: number) => head.local([-left * S, fwd * S, up * S]);
  const jaw = b.joint("jaw", { parent: head, at: H(0, 0.12, -0.24), aim: H(0, 1.5, -0.32), role: "jaw" });

  const cheekFin: Record<number, Joint> = {};
  for (const s of [1, -1]) {
    cheekFin[s] = b.joint(`cheekFin${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: H(s * 0.4, 0.3, 0.0),
      dir: head.dir([-s * 0.5, -1, 0.1]),
      role: "fan",
    });
  }

  // ---- The long body -----------------------------------------------------------------------------------------
  const bodyPaint = skin(LEN, 0.27, true, true);
  const body = b.sweep(bodyPath, radiusAt, {
    bone: [tail, spine, core, front],
    color: bodyPaint,
    sides: 10,
  });

  // Tail fluke: a spade of ember-orange fin continuing the tip
  const tailFrame = body.at(0.004);
  const fluke: OutlinePoint[] = [
    [-0.05, -0.08],
    [0.4, -0.2],
    [0.95, -0.42, "sharp"],
    [0.7, -0.07],
    [1.3, 0.0, "sharp"],
    [0.7, 0.07],
    [0.95, 0.42, "sharp"],
    [0.4, 0.2],
    [-0.05, 0.08],
  ];
  b.extrude(fluke, {
    at: tailFrame,
    x: tailFrame.tangent.clone().multiplyScalar(-1),
    y: tailFrame.n,
    thickness: 0.035,
    bevel: 0.01,
    smoothing: 1,
    color: paint((_p, _n, s) => {
      const r = Math.hypot(s[0] - 0.05, s[1]);
      return r > 0.85 ? EMBER : r > 0.45 ? ORANGE : RED;
    }),
    bone: tail.joints[0],
  });

  // ---- Dorsal crest: swept-back bone plates tipped in orange ---------------------------------------------------
  const finOutline = (h: number): OutlinePoint[] => [
    [0.16 * (0.7 + h * 0.8), -0.07],
    [0.06 * (0.7 + h * 0.8), h * 0.5],
    [-0.3 * (0.7 + h * 0.8), h, "sharp"],
    [-0.12 * (0.7 + h * 0.8), h * 0.45],
    [-0.2 * (0.7 + h * 0.8), -0.07],
  ];
  const finPaint = (h: number) =>
    paint((_p, _n, s) => (s[1] > h * 0.68 ? ORANGE : s[1] > h * 0.34 ? IVORY : s[1] > 0.02 ? IVORY_D : BLOOD));
  const finClasses = [0.16, 0.27, 0.4, 0.55].map((h) => ({ h, outline: finOutline(h), color: finPaint(h) }));
  b.along(body, 78, (at) => {
    const r = radiusAt(at.t);
    let k = r < 0.12 ? 0 : r < 0.28 ? 1 : r < 0.46 ? 2 : 3;
    const i = Math.round(at.t * 78 - 0.5);
    if (i % 4 === 0) k = Math.min(3, k + 1);
    const c = finClasses[k];
    b.extrude(c.outline, {
      at,
      x: at.tangent,
      y: at.n,
      thickness: [0.05 + k * 0.012, 0.012],
      bevel: 0.008,
      smoothing: 1,
      color: c.color,
    });
  });

  // ---- Head -------------------------------------------------------------------------------------------------------
  const headPaint = skin(1.3, 0.2, false, true);
  const skullR = (t: number): [number, number] => [(0.46 - 0.07 * t) * S, (0.37 - 0.05 * t) * S];
  const palate = paint((_p, _n, s) => mix("#4a0f22", MOUTH, smoothstep(0.05, 0.8, s[0])));
  b.sweep([H(0, -0.28, 0), H(0, 0.92, 0.02)], skullR, {
    bone: head,
    color: headPaint,
    sectors: [[112, 248, palate]],
    sides: 10,
  });
  const snoutR = (t: number): [number, number] => [(0.38 - 0.13 * t) * S, (0.25 - 0.08 * t) * S];
  b.sweep([H(0, 0.7, 0.0), H(0, 1.78, -0.1)], snoutR, {
    bone: head,
    color: headPaint,
    sectors: [[108, 252, palate]],
    sides: 10,
  });
  // snout geometry at forward distance y, for seating teeth
  const snoutAt = (y: number) => {
    const t = (y - 0.7) / 1.08;
    const [rx, ry] = snoutR(t);
    return { rx: rx / S, ry: ry / S, cz: -0.1 * t };
  };
  // armoured nose pad, nostrils and a blunt ivory nose horn
  b.part(new THREE.SphereGeometry(1, 8, 5), TEAL_DK, {
    bone: head,
    at: H(0, 1.78, -0.1),
    quat: head.quat,
    scale: [0.2 * S, 0.15 * S, 0.14 * S],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.055 * S, 6, 4), BLACK, {
      bone: head,
      at: H(s * 0.1, 1.82, -0.05),
      quat: head.quat,
      scale: [1, 0.8, 0.8],
    });
  }
  b.spike(H(0, 1.5, 0.19), H(0, 1.82, 0.4), null, 0.085 * S, { bone: head, color: IVORY, sides: 6 });
  b.sweep([H(0, 1.46, 0.18), H(0, 1.54, 0.2)], 0.1 * S, { bone: head, color: GOLD, sides: 6 });

  // eyes: glowing amber under heavy brow plates
  for (const s of [1, -1]) {
    const c = H(s * 0.4, 0.6, 0.15);
    glow(
      b.part(new THREE.SphereGeometry(0.12 * S, 8, 6), EMBER, { bone: head, at: c, quat: head.quat, scale: [1, 1, 1] }),
      1.3,
    );
    b.part(new THREE.SphereGeometry(1, 6, 5), BLACK, {
      bone: head,
      at: head.local([-(s * 0.4 + s * 0.105) * S, 0.6 * S, 0.15 * S]),
      quat: head.quat,
      scale: [0.018 * S, 0.045 * S, 0.1 * S],
    });
    // heavy upper lid and angry brow ridge
    b.part(new THREE.SphereGeometry(1, 8, 5), TEAL_DK, {
      bone: head,
      at: H(s * 0.4, 0.58, 0.245),
      quat: head.quat,
      scale: [0.15 * S, 0.17 * S, 0.075 * S],
    });
    b.sweep(
      catmull([H(s * 0.1, 0.22, 0.36), H(s * 0.3, 0.46, 0.42), H(s * 0.47, 0.82, 0.32)]),
      [0.09 * S, 0.07 * S, 0.035 * S],
      { bone: head, color: TEAL_LO, sides: 6, up: [0, 1, 0] },
    );
    for (let i = 0; i < 3; i++) {
      const y = 0.4 + i * 0.17;
      b.spike(H(s * (0.24 + i * 0.09), y, 0.4 - i * 0.03), H(s * (0.27 + i * 0.1), y - 0.1, 0.62 - i * 0.07), null, 0.04, {
        bone: head,
        color: IVORY,
        sides: 5,
      });
    }
    // lower lid bag and cheek scale plate
    b.part(new THREE.SphereGeometry(1, 8, 5), TEAL_MD, {
      bone: head,
      at: H(s * 0.43, 0.62, 0.04),
      quat: head.quat,
      scale: [0.1 * S, 0.17 * S, 0.06 * S],
    });
  }

  // great swept-back horns, ringed and tipped
  const hornPaint = paint((_p, _n, s) => {
    if (s[0] > 0.9) return GOLD;
    const ring = frac(s[0] * 7);
    if (ring < 0.09) return IVORY_D;
    return mix(BRONZE_D, IVORY, smoothstep(0, 0.75, s[0]));
  });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([H(s * 0.24, 0.12, 0.28), H(s * 0.42, -0.35, 0.5), H(s * 0.7, -0.9, 0.52), H(s * 0.98, -1.4, 0.74)]),
      [0.17 * S, 0.12 * S, 0.06 * S, 0.012],
      { bone: head, color: hornPaint, sides: 7, caps: { start: "round", end: "point" } },
    );
    b.sweep(catmull([H(s * 0.37, 0.18, -0.15), H(s * 0.62, -0.2, -0.28), H(s * 0.84, -0.6, -0.5)]), [0.1 * S, 0.05 * S, 0.01], {
      bone: head,
      color: hornPaint,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
    // cheek spikes
    for (let i = 0; i < 3; i++) {
      const y = 0.45 + i * 0.28;
      b.spike(H(s * (0.41 - i * 0.03), y, -0.16 - i * 0.02), H(s * (0.62 - i * 0.04), y - 0.18, -0.34 - i * 0.04), null, 0.05, {
        bone: head,
        color: IVORY_D,
        sides: 5,
      });
    }
  }
  // skull crest plates (larger than the dorsal ones)
  for (let i = 0; i < 3; i++) {
    const h = 0.62 - i * 0.1;
    b.extrude(
      [
        [0.2, -0.08],
        [0.08, h * 0.5],
        [-0.34, h, "sharp"],
        [-0.14, h * 0.45],
        [-0.22, -0.08],
      ],
      {
        at: H(0, 0.62 - i * 0.28, 0.33),
        x: head.dir([0, -1, 0]),
        y: head.dir([0, 0, 1]),
        thickness: [0.1, 0.02],
        bevel: 0.01,
        smoothing: 1,
        color: finPaint(h),
        bone: head,
      },
    );
  }

  // cheek fins: spiky fans, rays painted from deep red to ember
  const finShape: OutlinePoint[] = [
    [0, 0.14],
    [0.3, 0.52, "sharp"],
    [0.38, 0.24],
    [0.78, 0.46, "sharp"],
    [0.74, 0.14],
    [1.15, 0.18, "sharp"],
    [0.88, -0.08],
    [1.0, -0.38, "sharp"],
    [0.55, -0.22],
    [0.3, -0.45, "sharp"],
    [0.12, -0.12],
  ];
  const finRays = paint((_p, n, s) => {
    const r = Math.hypot(s[0], s[1]);
    const a = Math.atan2(s[1], s[0]);
    if (Math.abs(n.y) < 2) {
      if (frac(a / 0.36 + 0.5) < 0.12) return RED;
    }
    return mix(BLOOD, ORANGE, smoothstep(0.15, 0.95, r));
  });
  for (const s of [1, -1]) {
    b.extrude(finShape.map((pt) => (pt.length === 3 ? [pt[0] * S, pt[1] * S, pt[2]] : [pt[0] * S, pt[1] * S])) as OutlinePoint[], {
      at: H(s * 0.4, 0.3, 0.0),
      x: head.dir([-s * 0.5, -1, 0]),
      y: head.dir([0, 0, 1]),
      thickness: 0.03,
      bevel: 0.01,
      smoothing: 1,
      color: finRays,
      bone: cheekFin[s],
    });
    // bone rib along the fin's leading edge
    b.sweep([H(s * 0.4, 0.3, 0.1), H(s * 0.62, -0.8, 0.45)], [0.03, 0.012], {
      bone: cheekFin[s],
      color: IVORY,
      sides: 5,
    });
  }

  // ---- Upper teeth and fangs -------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const y = 0.66 + i * 0.125;
      const g = snoutAt(y);
      const x = s * g.rx * 0.8;
      const z = g.cz - g.ry * 0.78;
      const len = 0.1 + 0.05 * R() + (i === 7 ? 0.14 : 0);
      b.spike(H(x, y, z + 0.03), H(x * 0.97, y + 0.02, z - len), null, (i === 7 ? 0.055 : 0.036) * S, {
        bone: head,
        color: IVORY,
        sides: 5,
      });
    }
    b.sweep(bezier(H(s * 0.2, 1.45, -0.2), H(s * 0.26, 1.58, -0.5), H(s * 0.22, 1.5, -0.8)), [0.07 * S, 0.0], {
      bone: head,
      color: IVORY,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
  }

  // ---- Lower jaw -------------------------------------------------------------------------------------------------
  const jawPaint = skin(1.6, 0.16, false, true);
  const jawR = (t: number): [number, number] => [(0.35 - 0.15 * t) * S, (0.15 - 0.04 * t) * S];
  b.sweep([H(0, 0.05, -0.34), H(0, 1.62, -0.4)], jawR, {
    bone: jaw,
    color: jawPaint,
    sectors: [[-85, 85, MOUTH]],
    sides: 10,
  });
  b.part(new THREE.SphereGeometry(1, 8, 5), TEAL_DK, {
    bone: jaw,
    at: H(0, 1.65, -0.4),
    quat: head.quat,
    scale: [0.2 * S, 0.15 * S, 0.12 * S],
  });
  // gold chin plate
  b.sweep([H(0, 1.2, -0.5), H(0, 1.66, -0.5)], [0.12 * S, 0.09 * S], { bone: jaw, color: GOLD, sides: 6 });
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const y = 0.52 + i * 0.14;
      const t = y / 1.62;
      const [rxS, ryS] = jawR(t);
      const rx = rxS / S;
      const ry = ryS / S;
      const x = s * rx * 0.82;
      const z = -0.34 - 0.06 * t + ry * 0.7;
      const len = 0.09 + 0.05 * R();
      b.spike(H(x, y, z - 0.03), H(x * 0.97, y, z + len), null, 0.034 * S, { bone: jaw, color: IVORY, sides: 5 });
    }
    // lower tusks: heavy curved ivory with a gold band
    b.sweep(bezier(H(s * 0.2, 1.4, -0.38), H(s * 0.4, 1.8, -0.12), H(s * 0.32, 1.76, 0.5)), [0.085 * S, 0.0], {
      bone: jaw,
      color: IVORY,
      sides: 7,
      caps: { start: "round", end: "point" },
    });
    b.sweep([H(s * 0.215, 1.46, -0.3), H(s * 0.25, 1.55, -0.26)], 0.095 * S, { bone: jaw, color: GOLD, sides: 7 });
    // jaw-hinge plate
    b.part(new THREE.SphereGeometry(1, 8, 5), TEAL_MD, {
      bone: jaw,
      at: H(s * 0.34, 0.1, -0.3),
      quat: head.quat,
      scale: [0.09 * S, 0.2 * S, 0.11 * S],
    });
  }
  // tongue with a forked tip
  b.sweep([H(0, 0.25, -0.26), H(0, 0.85, -0.25), H(0, 1.3, -0.27)], [0.12 * S, 0.05 * S], {
    bone: jaw,
    color: TONGUE,
    sides: 6,
    caps: { start: "round", end: "round" },
  });
  for (const s of [1, -1]) {
    b.sweep([H(s * 0.01, 1.28, -0.27), H(s * 0.07, 1.52, -0.25)], [0.04 * S, 0.008], {
      bone: jaw,
      color: TONGUE,
      sides: 5,
      caps: { start: "round", end: "point" },
    });
  }

  // ---- Barbels: lip whiskers and chin tendrils (tentacle chains) -------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const lip = b.chain(
      `whisker${side}`,
      catmull([H(s * 0.32, 1.45, -0.1), H(s * 0.65, 1.5, -0.3), H(s * 0.95, 1.15, -0.75), H(s * 1.1, 0.7, -1.15)]),
      { parent: head, count: 3, role: "tentacle" },
    );
    b.sweep(lip, [0.075, 0.016], { color: BRONZE, sides: 6 });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), GOLD, { bone: lip.joints[lip.joints.length - 1], at: lip.at(1).at });
    const chin = b.chain(
      `chinBarbel${side}`,
      catmull([H(s * 0.18, 1.5, -0.46), H(s * 0.28, 1.32, -0.85), H(s * 0.34, 1.05, -1.3), H(s * 0.3, 0.7, -1.75)]),
      { parent: jaw, count: 3, role: "tentacle" },
    );
    b.sweep(chin, [0.05, 0.01], { color: TEAL_MD, sides: 6 });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), RED, { bone: chin.joints[chin.joints.length - 1], at: chin.at(1).at });
  }

  // ---- Bronze fang gorget on the neck ----------------------------------------------------------------------------
  const neckSkin = b.surface(body);
  const ringJoint = front.joints[6];
  const bandLoop = neckSkin.loop(ringJoint, { lift: 0.03 });
  b.sweep(bandLoop, 0.085, { color: BRONZE, sides: 8, bone: ringJoint });
  const upLoop = neckSkin.loop(front.joints[5], { lift: 0.02 });
  b.sweep(upLoop, 0.04, { color: GOLD, sides: 6, bone: front.joints[5] });
  const downLoop = neckSkin.loop(front.joints[7], { lift: 0.02 });
  b.sweep(downLoop, 0.04, { color: GOLD, sides: 6, bone: front.joints[7] });
  const studLoop = neckSkin.loop(ringJoint, { lift: 0.1 });
  b.along(studLoop, 18, (at) => b.stick(new THREE.SphereGeometry(0.035, 6, 4), GOLD, at, { embed: 0.2, bone: ringJoint }));
  // find the front of the ring to hang the fangs and gem there
  let frontT = 0;
  let bestZ = -1e9;
  for (let i = 0; i < 64; i++) {
    const p = bandLoop.at(i / 64);
    if (p.z > bestZ) {
      bestZ = p.z;
      frontT = i / 64;
    }
  }
  const frontHit = neckSkin.nearest(bandLoop.at(frontT));
  glow(
    b.stick(new THREE.OctahedronGeometry(0.15, 0), TURQ, frontHit, { embed: 0.0, bone: ringJoint, scale: [1, 0.7, 1.15] }),
    1.4,
  );
  b.stick(new THREE.CylinderGeometry(0.12, 0.15, 0.05, 8), GOLD_D, frontHit, { embed: 0.3, bone: ringJoint });
  const fangArc = bandLoop.slice(frontT - 0.17 < 0 ? 0 : frontT - 0.17, Math.min(1, frontT + 0.17));
  b.along(fangArc, 7, (at) => {
    b.spike(at, [0, -1, 0.15], 0.3, 0.05, { color: IVORY, sides: 5, bone: ringJoint });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), GOLD, { bone: ringJoint, at: at.at });
  });

  // ---- Gills, barnacles, kelp, harpoons ------------------------------------------------------------------------------
  const gillTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
       <path d="M10 4 Q4 24 10 44" stroke="#43f2d8" stroke-width="3.6" fill="none" stroke-linecap="round"/>
       <path d="M24 2 Q17 24 24 46" stroke="#7bf8e6" stroke-width="3.6" fill="none" stroke-linecap="round"/>
       <path d="M38 4 Q32 24 38 44" stroke="#43f2d8" stroke-width="3.6" fill="none" stroke-linecap="round"/>
       <path d="M52 8 Q47 24 52 40" stroke="#2bc9b8" stroke-width="3.6" fill="none" stroke-linecap="round"/>
     </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const gp = body.at(0.9, s * 100);
    glow(
      b.decal(body, gillTex, {
        at: gp,
        dir: gp.n,
        up: gp.tangent,
        size: [0.55, 0.4],
        mirror: s < 0,
        segments: 8,
      }),
      1.1,
    );
  }

  // barnacle clusters
  const barnHits = neckSkin.scatter(64, { rng: rng(7), minDist: 0.5, filter: (h) => h.n.y > -0.25 });
  const barnGeo = new THREE.CylinderGeometry(0.03, 0.065, 0.085, 6, 1);
  const barnTop = new THREE.CylinderGeometry(0.022, 0.022, 0.012, 6, 1);
  barnHits.forEach((h, i) => {
    const k = 1.3 + 0.9 * R();
    b.stick(barnGeo, BARN, h, { embed: 0.35, scale: [k, k, k], flat: true });
    if (i % 2 === 0) {
      b.stick(barnGeo, BARN_D, h.moved([0.09 * k, 0, 0.03 * k]), { embed: 0.35, scale: [k * 0.7, k * 0.7, k * 0.7], flat: true });
      b.stick(barnTop, BLACK, h.moved([0, 0.075 * k, 0]), { embed: 0.0, scale: [k, k, k] });
    }
  });

  // kelp ribbons hanging from the coils
  const kelpTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
       <path d="M10 96 C4 80 14 66 9 50 C5 34 12 18 18 0 C22 18 28 34 25 50 C22 66 30 80 22 96 Z" fill="#2d7d3d" stroke="#144a28" stroke-width="2.4" stroke-linejoin="round"/>
       <path d="M16 94 C12 76 20 62 15 48 C12 34 17 18 18 4" stroke="#a6dc6a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
       <path d="M12 70 C16 66 14 60 11 56" stroke="#3f9a4c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
     </svg>`,
    { size: 192 },
  );
  const kelpHits = neckSkin.scatter(26, {
    rng: rng(23),
    minDist: 1.1,
    filter: (h) => h.n.y > 0.55 && h.at.y > 1.3 && h.at.y < 3.0,
  });
  b.cards(
    kelpHits.map((h) => frame(h, [0, 1, 0])),
    kelpTex,
    { size: [0.28, 0.85], lean: 180, flow: [0, 0, 1], bend: 20, vary: 0.35, rng: rng(5), cross: true, color: KELP_DK },
  );

  // old harpoons buried in the hide, with rope and tattered pennants
  const harpoon = (t: number, deg: number, spread: number) => {
    const pt = body.at(t, deg);
    const out = pt.n.clone();
    const dir = out
      .clone()
      .multiplyScalar(0.8)
      .addScaledVector(pt.tangent, -0.5 * spread)
      .add(new THREE.Vector3(0, 0.45, 0))
      .normalize();
    const base = pt.at.clone().addScaledVector(out, -0.18);
    const end = base.clone().addScaledVector(dir, 1.7);
    b.rod(base, end, 0.04, { color: WOOD, sides: 6 });
    b.rod(base.clone().addScaledVector(dir, 0.24), base.clone().addScaledVector(dir, 0.46), 0.058, { color: IRON, sides: 6 });
    b.sweep([base.clone().addScaledVector(dir, 0.5), base.clone().addScaledVector(dir, 0.95)], 0.046, {
      color: grain(WOOD, WOOD_D, { size: 0.05, axis: dir.toArray() }),
      sides: 6,
    });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), IRON_D, { at: end });
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    b.extrude(
      [
        [0, 0.07],
        [0.35, 0.11],
        [0.7, 0.04],
        [0.55, -0.03],
        [0.8, -0.13],
        [0.38, -0.11],
        [0, -0.07],
      ],
      { at: base.clone().addScaledVector(dir, 1.25), x: dir, y: side, thickness: 0.012, color: RED },
    );
    const rp = end.clone();
    b.sweep(
      catmull([
        rp,
        rp.clone().add(new THREE.Vector3(0.1, -0.25, 0.1)),
        rp.clone().add(new THREE.Vector3(0.25, -0.75, 0.05)),
        rp.clone().add(new THREE.Vector3(0.3, -1.2, 0.15)),
      ]),
      [0.022, 0.014],
      { color: ROPE, sides: 5 },
    );
  };
  harpoon(0.3, 60, 1);
  harpoon(0.46, -55, -1);
  harpoon(0.9, -70, 1);

  // glowing tide-runes down the flanks
  const runeGeo = new THREE.OctahedronGeometry(0.075, 0);
  for (let i = 0; i < 12; i++) {
    const pt = body.at(0.2 + i * 0.05, i % 2 ? 62 : -62);
    glow(b.stick(runeGeo, TURQ, pt, { embed: 0.25, scale: [1, 0.55, 1.2] }), 1.2);
  }

  // ---- Tidal pool and rocks -----------------------------------------------------------------------------------
  const water = paint((p) => {
    const d = Math.hypot(p.x, p.z - centreZ);
    const n1 = noise(p, 0.5, 9);
    if (d > 4.38 + n1 * 0.18) return "#e6f6f2";
    if (d > 4.15 + n1 * 0.15) return "#8fd9d6";
    const ring = Math.sin(d * 5.4 + n1 * 3);
    if (ring > 0.88) return "#5fc0cf";
    return mix("#0f4d6c", "#2a93b4", smoothstep(1.2, 4.2, d));
  });
  b.lathe(
    [
      [0, 0],
      [4.55, 0],
      [4.7, 0.04],
      [4.55, 0.09],
      [0, 0.09],
    ],
    { at: [0, 0, centreZ], segments: 28, color: water, bone: core },
  );
  const stone = paint((p, n) =>
    n.y > 0.65 && noise(p, 0.3, 4) > 0.5 ? mottle("#5f9a4a", "#3c7a3c", { size: 0.2, seed: 2 }) : mottle("#6c7b8a", "#434f5e", { size: 0.3, seed: 6 }),
  );
  const rockSpots: [number, number, number, number][] = [
    [-4.45, 2.0, 0.55, 0.3],
    [-4.2, 0.4, 0.7, 0.5],
    [-3.0, -3.0, 0.45, 1.1],
    [3.9, 1.8, 0.62, 2.0],
    [4.3, -0.8, 0.8, 2.6],
    [2.6, 3.7, 0.38, 3.0],
    [0.3, -4.5, 0.6, 4.0],
    [-1.4, 4.1, 0.34, 5.0],
  ];
  for (const [x, z, r0, sp] of rockSpots) {
    const r = r0 * 0.8;
    b.part(new THREE.IcosahedronGeometry(r, 0), stone, {
      bone: core,
      at: [x, r * 0.68, z],
      rotation: [0, sp * 70, 0],
      scale: [1.2, 0.72, 1],
      flat: true,
    });
    for (let i = 0; i < 3; i++) {
      const pr = r * (0.22 + 0.12 * R());
      const a = R() * Math.PI * 2;
      b.part(new THREE.IcosahedronGeometry(pr, 0), stone, {
        bone: core,
        at: [x + Math.cos(a) * (r * 1.3 + pr), pr * 0.55, z + Math.sin(a) * (r * 1.3 + pr)],
        rotation: [0, a * 40, 0],
        scale: [1.1, 0.65, 1],
        flat: true,
      });
    }
  }

  // ---- Wreckage in the pool: a snapped mast with a torn sail, a barrel, planks ---------------------------------
  const plank = grain(WOOD, WOOD_D, { size: 0.06, axis: "x" });
  b.rod([-2.9, 0.05, 3.4], [-3.35, 1.55, 3.1], 0.075, { color: plank, sides: 6, bone: core });
  b.rod([-3.35, 1.55, 3.1], [-3.42, 1.72, 3.06], 0.05, { color: WOOD_D, sides: 5, bone: core });
  b.rod([-3.95, 1.3, 3.18], [-2.55, 1.34, 3.18], 0.045, { color: plank, sides: 6, bone: core });
  b.sweep([[-3.1, 0.75, 3.27], [-3.14, 0.95, 3.24]], 0.1, { color: IRON, sides: 8, bone: core });
  const sail = paint((_p, _n, s) => {
    if (frac(s[1] / 0.3) < 0.14) return RED;
    return noise(new THREE.Vector3(s[0], s[1], 0), 0.2, 3) > 0.62 ? "#cdbd92" : "#ece0bb";
  });
  b.extrude(
    [
      [0, 0],
      [1.3, 0],
      [1.3, -0.5],
      [1.1, -0.38],
      [1.0, -0.95],
      [0.74, -0.62],
      [0.52, -1.05],
      [0.3, -0.7],
      [0.12, -0.9],
      [0, -0.45],
    ],
    { at: [-3.85, 1.28, 3.18], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.015, color: sail, bone: core },
  );
  const barrelAt: [number, number, number] = [0.9, 0.23, 3.45];
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.56, 10, 1), plank, { bone: core, at: barrelAt, rotation: [0, 30, 90] });
  for (const o of [-0.17, 0.17]) {
    b.part(new THREE.CylinderGeometry(0.232, 0.232, 0.045, 10, 1), IRON_D, {
      bone: core,
      at: [barrelAt[0] - o * Math.cos(30 * DEG), barrelAt[1], barrelAt[2] + o * Math.sin(30 * DEG)],
      rotation: [0, 30, 90],
    });
  }
  const plankBoxes: [number, number, number, number][] = [
    [-0.4, 0.06, 3.75, 20],
    [0.1, 0.07, 3.9, -35],
    [1.8, 0.05, 3.2, 70],
  ];
  for (const [x, y, z, a] of plankBoxes) {
    b.part(new THREE.BoxGeometry(1.15, 0.05, 0.2), plank, { bone: core, at: [x, y, z], rotation: [0, a, 4] });
    b.part(new THREE.SphereGeometry(0.025, 5, 3), IRON_D, { bone: core, at: [x + 0.4 * Math.cos(a * DEG), y + 0.03, z - 0.4 * Math.sin(a * DEG)] });
  }

  // roaring: open the jaw last
  b.pose(jaw, { axis: head.dir([-1, 0, 0]), deg: 24 });
  return b.root;
}
