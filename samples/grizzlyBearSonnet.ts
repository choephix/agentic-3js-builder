import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, polyline } from "../src/path";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Grizzly Bear",
  description:
    "A hulking grizzly stalking on all fours: hand-painted frosted-tip coat, huge shoulder hump, oversized paws and claws, scarred growling face, and a druid's cord of beads, claw and feather.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---- palette (hand-painted: warm lights, plum-brown shadows) ----
const FUR_DARK = "#3b2217";
const FUR_MID = "#6d4125";
const FUR_WARM = "#9b6330";
const FUR_TIP = "#e0b06a";
const FUR_HI = "#f2cf8a";
const SHADE = "#2a1722";
const FUR_LEG = "#241410";
const TAN = "#b88650";
const PAD = "#17100e";
const EYE_MASK = "#1c0f0a";

const NOSE = "#2b2024";
const NOSE_GLOSS = "#70697a";
const NOSTRIL = "#0a0708";
const CLAW = "#e9dcb8";
const CLAW_DARK = "#4a3a2c";
const TOOTH = "#f3ead0";
const TOOTH_SHADE = "#c8b98f";
const MOUTH = "#5a1a1e";
const MOUTH_DEEP = "#2e0c10";
const TONGUE = "#c4545c";
const EYE = "#e8a21a";
const EYE_RING = "#23140d";
const PUPIL = "#120a06";
const GLINT = "#fff6d8";
const EAR_IN = "#6a4a3a";
const EAR_IN_DARK = "#2e1c18";
const LEATHER = "#5b3a20";
const LEATHER_HI = "#8c5e32";
const COPPER = "#c9742e";
const BONE = "#e6dcc0";
const TURQ = "#3fb5a6";

// ---- helpers ----
function curve(tbl: number[][]) {
  return (x: number) => {
    if (x <= tbl[0][0]) return tbl[0][1];
    for (let i = 1; i < tbl.length; i++) {
      if (x <= tbl[i][0]) {
        const [x0, y0] = tbl[i - 1];
        const [x1, y1] = tbl[i];
        const u = (x - x0) / (x1 - x0);
        return y0 + (y1 - y0) * (u * u * (3 - 2 * u));
      }
    }
    return tbl[tbl.length - 1][1];
  };
}

const tmp = new THREE.Vector3();
const eyeSpots: THREE.Vector3[] = [];

// The one coat paint, shared by every furred part so the pattern runs on across body, legs and head.
function coatAt(p: THREE.Vector3, n: THREE.Vector3): Rgb {
  const light = smoothstep(-0.7, 0.9, n.y);
  let c = mix(FUR_MID, FUR_WARM, light * 0.55);
  // big soft dark blotches, then strands that follow the limbs (vertical) or the body (long)
  c = mix(FUR_DARK, c, 0.5 + 0.5 * smoothstep(0.2, 0.8, noise(p, 0.5, 11)));
  const limb = smoothstep(0.78, 0.42, p.y);
  tmp.set(p.x * 2.3, p.y * (2.3 - 1.9 * limb), p.z * (0.55 + 1.75 * limb));
  const strand = noise(tmp, 0.045, 5);
  c = mix(c, FUR_WARM, smoothstep(0.35, 0.9, strand) * 0.55);
  c = mix(c, FUR_DARK, smoothstep(0.55, 0.05, strand) * 0.4);
  // grizzled frost on the shoulders, hump and back
  const up = smoothstep(0.0, 0.9, n.y);
  const hump = smoothstep(-0.1, 0.45, p.z) * smoothstep(0.85, 1.22, p.y);
  const region = smoothstep(0.3, 0.75, noise(p, 0.55, 3));
  tmp.set(p.x * 2.0, p.y * (2.0 - 1.6 * limb), p.z * (0.7 + 1.3 * limb));
  const frost = smoothstep(0.45, 0.85, noise(tmp, 0.04, 9));
  c = mix(c, FUR_TIP, frost * up * region * (0.3 + 0.5 * hump));
  c = mix(c, FUR_HI, up * up * hump * region * 0.3);
  // painted shadow underneath, plum toned
  c = mix(c, SHADE, smoothstep(0.05, -0.65, n.y) * 0.8);
  // dark stockings on the legs
  c = mix(c, FUR_LEG, smoothstep(0.72, 0.22, p.y) * 0.8);
  // soft occlusion where the limbs meet the flank
  const inward = -n.x * Math.sign(p.x);
  c = mix(c, SHADE, smoothstep(0.1, 0.8, inward) * smoothstep(0.75, 0.4, p.y) * smoothstep(0.1, 0.35, p.y) * 0.55);
  // tan muzzle, darker round the nose
  const muz = smoothstep(1.08, 1.24, p.z) * smoothstep(1.1, 0.95, p.y + 0.0);
  c = mix(c, TAN, muz * 0.85);
  c = mix(c, FUR_DARK, smoothstep(1.42, 1.52, p.z) * 0.6);
  // dark painted mask round each eye
  for (const e of eyeSpots) c = mix(c, EYE_MASK, smoothstep(0.095, 0.04, p.distanceTo(e)) * 0.8);
  // dark leathery pads on soles
  if (n.y < -0.55 && p.y < 0.07) c = mix(c, PAD, 0.95);
  return c;
}
const coat = paint((p, n) => coatAt(p, n));
const tuftTint = paint((p, n) => mix(coatAt(p, n), FUR_TIP, 0.28));

// ---- drawings ----
const FUR_GRAD = `<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6a6a6a"/><stop offset="0.55" stop-color="#c6c6c6"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>`;
const tuftA = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">${FUR_GRAD}
<path d="M3 64 C6 40 10 22 16 3 C21 22 23 40 25 64Z" fill="url(#g)"/>
<path d="M14 64 C18 36 24 16 33 0 C35 20 35 42 35 64Z" fill="url(#g)"/>
<path d="M26 64 C30 44 36 30 45 15 C45 33 43 48 41 64Z" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const tuftB = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64">${FUR_GRAD}
<path d="M4 64 C7 40 9 20 12 1 C16 22 19 42 20 64Z" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const featherTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64">
<path d="M12 2 C22 12 22 40 12 62 C2 40 2 12 12 2Z" fill="#a8582a"/>
<path d="M12 6 C19 16 19 34 12 50 C5 34 5 16 12 6Z" fill="#7a3a1c"/>
<path d="M4 20 L20 18 L20 23 L4 25Z M3 34 L21 32 L21 37 L3 39Z" fill="#efe2c4"/>
<path d="M12 0 L12 64" stroke="#f2e6c8" stroke-width="2" fill="none"/>
<path d="M12 2 C22 12 22 40 12 62 C2 40 2 12 12 2Z" fill="none" stroke="#3c1d10" stroke-width="1.2"/></svg>`,
  { size: 192 },
);
const scarTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<g fill="none" stroke-linecap="round">
<path d="M14 6 C20 22 22 40 18 60" stroke="#7a3f40" stroke-width="7"/>
<path d="M30 3 C37 20 39 40 34 62" stroke="#7a3f40" stroke-width="7"/>
<path d="M46 6 C52 22 53 38 49 58" stroke="#7a3f40" stroke-width="7"/>
<path d="M14 6 C20 22 22 40 18 60" stroke="#dfb09c" stroke-width="3.2"/>
<path d="M30 3 C37 20 39 40 34 62" stroke="#dfb09c" stroke-width="3.2"/>
<path d="M46 6 C52 22 53 38 49 58" stroke="#dfb09c" stroke-width="3.2"/>
</g>
<g stroke="#7a3f40" stroke-width="2"><path d="M10 22 L24 24 M26 40 L40 42 M42 20 L55 22"/></g></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "grizzlyBear", paintSize: 2048 });
  const rand = rng(42);
  eyeSpots.length = 0;
  const Y0 = 0.95;

  // ============ skeleton ============
  const hips = b.joint("hips", { at: [0, Y0, -0.4], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, Y0, -0.4],
      [0, Y0, -0.02],
      [0, Y0, 0.3],
      [0, Y0, 0.62],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    polyline([
      [0, Y0, 0.62],
      [0, 0.97, 0.78],
      [0, 0.98, 0.93],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.98, 0.93], dir: [0, -0.14, 1], role: "head" });
  const tail = b.chain(
    "tail",
    polyline([
      [0, Y0, -0.4],
      [0, Y0, -0.72],
      [0, 0.9, -1.0],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ============ body ============
  const rx = curve([
    [-0.74, 0.12],
    [-0.6, 0.27],
    [-0.4, 0.33],
    [-0.1, 0.32],
    [0.2, 0.35],
    [0.45, 0.39],
    [0.7, 0.35],
    [0.9, 0.3],
    [0.96, 0.27],
  ]);
  const topH = curve([
    [-0.74, 1.0],
    [-0.6, 1.1],
    [-0.4, 1.14],
    [-0.1, 1.12],
    [0.2, 1.22],
    [0.45, 1.34],
    [0.7, 1.27],
    [0.9, 1.17],
    [0.96, 1.13],
  ]);
  const botH = curve([
    [-0.74, 0.74],
    [-0.6, 0.52],
    [-0.4, 0.43],
    [-0.1, 0.38],
    [0.2, 0.4],
    [0.45, 0.43],
    [0.7, 0.47],
    [0.9, 0.58],
    [0.96, 0.64],
  ]);
  const zOf = (t: number) => -0.74 + 1.7 * t;
  const bodyPath = polyline([
    [0, Y0, -0.74],
    [0, Y0, 0.96],
  ]);
  const body = b.sweep(bodyPath, (t) => [rx(zOf(t)), (topH(zOf(t)) - botH(zOf(t))) / 2], {
    shift: (t) => [0, (topH(zOf(t)) + botH(zOf(t))) / 2 - Y0],
    bone: [tail, hips, spine, neck],
    color: coat,
    sides: 14,
    name: "body",
  });

  // tail stub
  const tailSweep = b.sweep(tail, [0.13, 0.07], { color: coat, name: "tailStub" });
  const tailHits = b.surface(tailSweep).scatter(14, { rng: rng(5), minDist: 0.04, filter: (h) => h.at.z < -0.78 });
  b.cards(tailHits, tuftA, {
    size: [0.06, 0.12],
    lean: 60,
    bend: 24,
    vary: 0.25,
    rng: rng(6),
    color: tuftTint,
    flow: [0, -0.4, -1],
    name: "tailFur",
  });

  // ============ legs ============
  const legSweeps: Sweep[] = [];

  const makeToes = (
    paw: Joint,
    x0: number,
    zBase: number,
    zLen: number,
    toeY: number,
    spread: number,
    clawLen: number,
    toeR: number,
    prefix: string,
    side: string,
  ) => {
    for (let i = -2; i <= 2; i++) {
      const xb = x0 + i * spread;
      const xt = x0 + i * spread * 1.12;
      const zt = zBase + zLen - Math.abs(i) * 0.012;
      const base: [number, number, number] = [xb, toeY + 0.012, zBase];
      const tip: [number, number, number] = [xt, toeY, zt];
      const toe = b.joint(`${prefix}Toe${i + 3}${side}`, { parent: paw, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, toeR, { bone: toe, color: coat, sides: 8, name: `${prefix}toe${side}${i + 3}` });
      const cs: [number, number, number] = [xt, toeY + 0.005, zt + 0.005];
      const cm: [number, number, number] = [xt + i * 0.004, toeY + 0.02, zt + clawLen * 0.55];
      const ce: [number, number, number] = [xt + i * 0.012, 0.006, zt + clawLen];
      b.sweep(bezier(cs, cm, ce), [toeR * 0.62, 0.003], {
        bone: toe,
        color: CLAW,
        bands: [[0.28, CLAW_DARK]],
        caps: { start: "flat", end: "point" },
        sides: 6,
        name: `claw${prefix}${side}${i + 3}`,
      });
      // knuckle highlight tuft on top of each toe
    }
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // ---- front leg ----
    const fpts: [number, number, number][] = [
      [s * 0.3, 1.0, 0.4],
      [s * 0.36, 0.62, 0.3],
      [s * 0.36, 0.2, 0.46],
      [s * 0.37, 0.085, 0.62],
    ];
    const fleg = b.chain(`legF${side}`, polyline(fpts), {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pawF${side}`],
      role: "leg",
      contact: [s * 0.37, 0, 0.62],
    });
    const frxC = curve([
      [0, 0.19],
      [0.15, 0.21],
      [0.38, 0.17],
      [0.52, 0.15],
      [0.78, 0.115],
      [0.9, 0.12],
      [1, 0.115],
    ]);
    const fryC = curve([
      [0, 0.19],
      [0.15, 0.21],
      [0.38, 0.17],
      [0.52, 0.14],
      [0.78, 0.11],
      [0.9, 0.095],
      [1, 0.085],
    ]);
    const fsweep = b.sweep(fleg, (t) => [frxC(t), fryC(t)], { color: coat, sides: 10, name: `legF${side}` });
    legSweeps.push(fsweep);
    // shoulder muscle mass and elbow point
    b.part(new THREE.SphereGeometry(1, 12, 9), coat, {
      bone: fleg.joints[0],
      at: [s * 0.3, 0.93, 0.4],
      scale: [0.17, 0.27, 0.25],
      name: `shoulderMass${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: fleg.joints[1],
      at: [s * 0.38, 0.64, 0.22],
      scale: [0.11, 0.12, 0.12],
      name: `elbowPoint${side}`,
    });
    makeToes(fleg.tip!, s * 0.37, 0.65, 0.1, 0.045, 0.058, 0.12, 0.037, "F", side);

    // ---- hind leg ----
    const hpts: [number, number, number][] = [
      [s * 0.3, 0.88, -0.46],
      [s * 0.34, 0.52, -0.26],
      [s * 0.3, 0.17, -0.6],
      [s * 0.31, 0.085, -0.38],
    ];
    const hleg = b.chain(`legH${side}`, polyline(hpts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.31, 0, -0.38],
    });
    const hrxC = curve([
      [0, 0.2],
      [0.15, 0.23],
      [0.38, 0.15],
      [0.55, 0.13],
      [0.79, 0.105],
      [0.9, 0.105],
      [1, 0.105],
    ]);
    const hryC = curve([
      [0, 0.2],
      [0.15, 0.23],
      [0.38, 0.15],
      [0.55, 0.12],
      [0.79, 0.095],
      [0.9, 0.09],
      [1, 0.085],
    ]);
    const hsweep = b.sweep(hleg, (t) => [hrxC(t), hryC(t)], { color: coat, sides: 10, name: `legH${side}` });
    legSweeps.push(hsweep);
    b.part(new THREE.SphereGeometry(1, 12, 9), coat, {
      bone: hleg.joints[0],
      at: [s * 0.27, 0.8, -0.43],
      scale: [0.15, 0.28, 0.26],
      name: `thighMass${side}`,
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, {
      bone: hleg.joints[2],
      at: [s * 0.3, 0.11, -0.62],
      scale: [0.1, 0.1, 0.12],
      name: `heel${side}`,
    });
    makeToes(hleg.tip!, s * 0.31, -0.38, 0.09, 0.045, 0.052, 0.07, 0.034, "H", side);
  }

  // ============ head ============
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });

  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), coat, {
    bone: head,
    at: hl(0.1, 0.03),
    scale: [0.235, 0.22, 0.26],
    name: "skull",
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
      bone: head,
      at: hl(0.1, -0.07, s * 0.17),
      scale: [0.11, 0.12, 0.15],
      name: `cheek${side}`,
    });
  }
  const muzzle = b.sweep([hl(0.18, -0.01), hl(0.44, -0.06)], (t) => [0.135 - 0.035 * t, 0.115 - 0.03 * t], {
    bone: head,
    color: coat,
    sides: 10,
    name: "muzzle",
  });
  // mouth roof, visible when the jaw opens
  b.sweep([hl(0.12, -0.115), hl(0.44, -0.145)], () => [0.09, 0.022], {
    bone: head,
    color: MOUTH,
    sides: 8,
    caps: "round",
    name: "mouthRoof",
  });
  // nose pad
  const noseAt = hl(0.5, -0.05);
  b.part(new THREE.SphereGeometry(1, 10, 8), NOSE, {
    bone: head,
    at: noseAt,
    scale: [0.088, 0.062, 0.078],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE_GLOSS, {
    bone: head,
    at: hl(0.525, -0.025, 0.015),
    scale: [0.028, 0.012, 0.02],
    name: "noseGloss",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSTRIL, {
      bone: head,
      at: hl(0.545, -0.055, s * 0.04),
      scale: [0.02, 0.026, 0.014],
      name: "nostril",
    });
    // upper lip / flews
    b.capsule(hl(0.47, -0.095, s * 0.07), hl(0.22, -0.13, s * 0.125), 0.032, {
      bone: head,
      color: coat,
      sides: 6,
      name: "flew",
    });
    // dark whisker spots
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(1, 5, 4), FUR_DARK, {
        bone: head,
        at: hl(0.38 - i * 0.03, -0.01 - i * 0.012, s * (0.1 + i * 0.012)),
        scale: [0.01, 0.01, 0.01],
        name: "whiskerSpot",
      });
    }
  }
  // whiskers
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const a = hl(0.4 - i * 0.012, -0.045 - i * 0.014, s * 0.085);
      const m = hl(0.36 - i * 0.01, -0.05 - i * 0.02, s * (0.17 + i * 0.012));
      const e = hl(0.25 - i * 0.01, -0.09 - i * 0.045, s * (0.26 + i * 0.02));
      b.sweep(bezier(a, m, e), [0.0045, 0.0008], { bone: head, color: "#e9dcbc", sides: 4, caps: "none", name: "whisker" });
    }
  }
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, {
    bone: head,
    at: hl(0.5, -0.1),
    scale: [0.02, 0.012, 0.035],
    name: "philtrum",
  });

  // lower jaw (own bone)
  const jaw = b.joint("jaw", { parent: head, at: hl(0.04, -0.11), aim: hl(0.4, -0.15), role: "jaw" });
  b.sweep([hl(0.08, -0.14), hl(0.4, -0.195)], (t) => [0.115 - 0.045 * t, 0.065 - 0.012 * t], {
    bone: jaw,
    color: coat,
    sides: 10,
    name: "jaw",
  });
  b.sweep([hl(0.1, -0.115), hl(0.36, -0.15)], [0.05, 0.022], {
    bone: jaw,
    color: TONGUE,
    sides: 6,
    name: "tongue",
  });
  b.sweep([hl(0.1, -0.1), hl(0.38, -0.14)], [0.085, 0.055], {
    bone: jaw,
    color: MOUTH_DEEP,
    sides: 8,
    name: "mouthFloor",
  });
  // teeth
  for (const s of [1, -1]) {
    b.spike(hl(0.405, -0.125, s * 0.072), [s * 0.1, -1, 0.35], 0.085, 0.021, {
      bone: head,
      color: TOOTH,
      bands: [[0.25, TOOTH_SHADE]],
      sides: 6,
      name: "canineUp",
    });
    b.spike(hl(0.355, -0.168, s * 0.058), [-s * 0.1, 1, 0.3], 0.068, 0.019, {
      bone: jaw,
      color: TOOTH,
      bands: [[0.25, TOOTH_SHADE]],
      sides: 6,
      name: "canineLow",
    });
  }
  for (let i = -2; i <= 2; i++) {
    b.spike(hl(0.46, -0.125 - Math.abs(i) * 0.002, i * 0.021), [0, -1, 0.2], 0.034, 0.011, {
      bone: head,
      color: TOOTH,
      sides: 5,
      name: "incisorUp",
    });
    b.spike(hl(0.405, -0.186, i * 0.021), [0, 1, 0.2], 0.026, 0.01, {
      bone: jaw,
      color: TOOTH,
      sides: 5,
      name: "incisorLow",
    });
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.spike(hl(0.3 - i * 0.045, -0.15, s * (0.095 + i * 0.006)), [0, -1, 0], 0.028, 0.014, {
        bone: head,
        color: TOOTH_SHADE,
        sides: 5,
        name: "molarUp",
      });
      b.spike(hl(0.28 - i * 0.045, -0.2, s * (0.085 + i * 0.006)), [0, 1, 0], 0.024, 0.013, {
        bone: jaw,
        color: TOOTH_SHADE,
        sides: 5,
        name: "molarLow",
      });
    }
  }

  // eyes, brows, ears
  const skullSurf = b.surface(skull);
  const skullCenter = hl(0.1, 0.03);
  const fwd = hl(1, 0).sub(hl(0, 0)).normalize();
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = skullSurf.around(skullCenter).at(s * 43, 12);
    if (eyeHit) {
      const gaze = eyeHit.n.clone().multiplyScalar(0.8).addScaledVector(fwd, 0.6).normalize();
      const o = eyeHit.at;
      b.part(new THREE.SphereGeometry(0.04, 8, 6), EYE_RING, { bone: head, at: o, name: `eyeRing${side}` });
      eyeSpots.push(o.clone());
      b.part(new THREE.SphereGeometry(0.031, 6, 4), EYE, {
        bone: head,
        at: o.clone().addScaledVector(gaze, 0.017),
        name: `eye${side}`,
      });
      b.part(new THREE.SphereGeometry(0.0185, 5, 4), PUPIL, {
        bone: head,
        at: o.clone().addScaledVector(gaze, 0.033),
        name: `pupil${side}`,
      });
      b.part(new THREE.SphereGeometry(0.007, 5, 4), GLINT, {
        bone: head,
        at: o.clone().addScaledVector(gaze, 0.047).addScaledVector(eyeHit.n, 0.006).add(new THREE.Vector3(0, 0.008, 0)),
        name: `glint${side}`,
      });
    }
    // heavy angry brow, slanting down toward the nose
    const b0 = skullSurf.around(skullCenter).at(s * 10, 30);
    const b1 = skullSurf.around(skullCenter).at(s * 62, 34);
    if (b0 && b1) {
      b.capsule(b0.moved([0, 0.004, 0]), b1.moved([0, 0.008, 0]), [0.024, 0.03], {
        bone: head,
        color: coat,
        sides: 6,
        name: `brow${side}`,
      });
    }
    // ear: round, set at the top corner of the skull, facing out and forward
    const earHit = skullSurf.around(skullCenter).at(s * 100, 48);
    if (earHit) {
      const earDir = earHit.n.clone().addScaledVector(fwd, 0.75).normalize();
      const dir = [earDir.x, earDir.y, earDir.z];
      const ear = b.part(new THREE.SphereGeometry(0.082, 10, 7), coat, {
        bone: head,
        at: earHit.at.clone().addScaledVector(earHit.n, 0.03),
        dir,
        scale: [1, 0.5, 1],
        name: `ear${side}`,
      });
      const rimHits = b.surface(ear).scatter(7, { rng: rng(40 + side.charCodeAt(0)), minDist: 0.03, filter: (h) => h.n.y > 0.3 });
      b.cards(rimHits, tuftB, {
        size: [0.03, 0.055],
        lean: 40,
        bend: 20,
        rng: rand,
        color: tuftTint,
        flow: [0, 0.2, -1],
        name: "earFur",
      });
      b.part(new THREE.SphereGeometry(0.058, 8, 5), EAR_IN, {
        bone: head,
        at: ear.local([0, 0.03, 0]),
        dir,
        scale: [1, 0.3, 1],
        name: `earInner${side}`,
      });
      b.part(new THREE.SphereGeometry(0.03, 6, 4), EAR_IN_DARK, {
        bone: head,
        at: ear.local([0, 0.038, -0.01]),
        dir,
        scale: [1, 0.25, 1],
        name: `earDeep${side}`,
      });
    }
  }

  // ============ fur cards ============
  const bodySurf = b.surface(body);
  const hits = bodySurf.scatter(1000, { rng: rng(7), minDist: 0.058 });
  const mane = hits.filter((h) => h.at.z > 0.12 && h.n.y > 0.15);
  const flanks = hits.filter((h) => !(h.at.z > 0.12 && h.n.y > 0.15) && h.n.y > -0.25);
  const bellies = hits.filter((h) => h.n.y <= -0.25);
  b.cards(mane, [tuftA, tuftB], {
    size: [0.085, 0.17],
    lean: 64,
    bend: 26,
    vary: 0.3,
    rng: rng(11),
    color: tuftTint,
    flow: [0, -0.35, -1],
    name: "mane",
  });
  b.cards(flanks, [tuftA, tuftB], {
    size: [0.065, 0.115],
    lean: 70,
    bend: 24,
    vary: 0.3,
    rng: rng(12),
    color: tuftTint,
    flow: [0, -0.5, -1],
    name: "flankFur",
  });
  b.cards(bellies, tuftA, {
    size: [0.06, 0.11],
    lean: 78,
    bend: 20,
    vary: 0.25,
    rng: rng(13),
    color: tuftTint,
    flow: [0, -0.2, -1],
    name: "bellyFur",
  });

  // long guard hairs along the spine ridge
  const ridge: Frame[] = [];
  b.along(body, 26, (at) => ridge.push(at), { from: 0.2, to: 0.72 });
  b.cards(ridge, tuftB, {
    size: [0.08, 0.17],
    lean: 52,
    bend: 32,
    vary: 0.3,
    rng: rng(31),
    color: tuftTint,
    flow: [0, -0.2, -1],
    cross: true,
    name: "ridge",
  });

  for (const sweep of legSweeps) {
    const lh = b.surface(sweep).scatter(55, { rng: rand, minDist: 0.055, filter: (h) => h.at.y > 0.2 });
    b.cards(lh, [tuftA, tuftB], {
      size: [0.05, 0.1],
      lean: 70,
      bend: 22,
      vary: 0.3,
      rng: rand,
      color: tuftTint,
      flow: [0, -1, -0.15],
      name: "legFur",
    });
    const pawHits = b.surface(sweep).scatter(14, {
      rng: rand,
      minDist: 0.045,
      filter: (h) => h.at.y < 0.2 && h.n.y > 0.35,
    });
    b.cards(pawHits, tuftB, {
      size: [0.035, 0.075],
      lean: 72,
      bend: 20,
      vary: 0.25,
      rng: rand,
      color: tuftTint,
      flow: [0, -0.15, 1],
      name: "pawFur",
    });
  }

  // cheek ruff and forehead fluff
  const ruff = skullSurf.scatter(90, { rng: rng(21), minDist: 0.04, filter: (h) => Math.abs(h.n.x) > 0.45 || h.n.y > 0.5 });
  b.cards(ruff, [tuftA, tuftB], {
    size: [0.06, 0.1],
    lean: 66,
    bend: 22,
    vary: 0.3,
    rng: rng(22),
    color: tuftTint,
    flow: [0, -0.15, -1],
    name: "cheekRuff",
  });

  // ============ scars ============
  const flankHit = bodySurf.ray([1, 1.02, 0.22], [-1, 0, 0]);
  if (flankHit) {
    b.decal(body, scarTex, { at: flankHit, dir: [1, 0, 0], size: [0.2, 0.2], roll: -25, segments: 12 });
  }
  const faceOrigin = hl(0.36, 0.3, 0.22);
  const faceTarget = hl(0.28, -0.02, 0.06);
  const faceDir = faceTarget.clone().sub(faceOrigin).normalize();
  const faceHit = b.surface([skull, muzzle]).ray(faceOrigin, [faceDir.x, faceDir.y, faceDir.z]);
  if (faceHit) {
    b.decal([skull, muzzle], scarTex, { at: faceHit, dir: [0.7, 0.4, 0.6], size: [0.12, 0.12], roll: -35, segments: 10 });
  }

  // ============ druid cord: leather, beads, claw, feather ============
  const cordLoop = bodySurf.loop([0, Y0, 0.8], { dir: [0, 0, 1], lift: 0.014 });
  b.sweep(cordLoop, 0.011, { color: LEATHER, bone: neck.joints[0], sides: 6, name: "cord" });
  const beadCols = [BONE, COPPER, TURQ, COPPER, BONE];
  beadCols.forEach((col, i) => {
    const t = 0.42 + i * 0.04;
    const bp = cordLoop.at(t);
    b.part(new THREE.SphereGeometry(0.026, 6, 4), col, { bone: neck.joints[0], at: bp, name: `bead${i}` });
    if (i === 2) {
      b.part(new THREE.TorusGeometry(0.03, 0.006, 3, 6), LEATHER_HI, { bone: neck.joints[0], at: bp, name: "beadBand" });
    }
  });
  {
    const mp = cordLoop.at(0.5);
    b.sweep(bezier([mp.x, mp.y - 0.02, mp.z], [mp.x, mp.y - 0.1, mp.z + 0.03], [mp.x, mp.y - 0.19, mp.z + 0.1]), [0.026, 0.002], {
      bone: neck.joints[0],
      color: BONE,
      bands: [[0.2, LEATHER_HI]],
      caps: { start: "flat", end: "point" },
      sides: 6,
      name: "pendantClaw",
    });
    b.part(new THREE.TorusGeometry(0.014, 0.004, 3, 6), COPPER, {
      bone: neck.joints[0],
      at: [mp.x, mp.y - 0.025, mp.z],
      rotation: [0, 90, 0],
      name: "pendantRing",
    });
  }
  {
    const fp = cordLoop.at(0.3);
    const out = Math.sign(fp.x) * 0.03;
    b.cards([frame([fp.x + out, fp.y, fp.z], [0, 1, 0])], featherTex, {
      size: [0.08, 0.26],
      lean: 180,
      flow: [0, 0, 1],
      bone: neck.joints[0],
      name: "feather",
    });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), COPPER, { bone: neck.joints[0], at: [fp.x + out * 0.4, fp.y, fp.z], name: "featherBead" });
  }

  // ============ pose: growling, jaw parted ============
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });

  return b.root;
}
