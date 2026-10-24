// STYLE: "Seed-Packet Lithograph". The rusty robot gardener is printed like a vintage seed packet: a limited ink
// palette (teal enamel, rust orange, mustard, cream, leaf green, navy line), halftone-dot shading in place of smooth
// light, chipped enamel over streaky rust, stencilled labels, and flowers and ivy drawn as flat printed cut-outs.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  polyline,
  catmull,
  spiral,
  mix,
  noise,
  smoothstep,
  paint,
  resolve,
  mottle,
  gradient,
  grain,
  svg,
} from "../../../../src/index";
import type { ColorInput, Paint, Joint } from "../../../../src/index";
import { gearTrain, gaugeTexture } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Rusty Robot Gardener",
  description:
    "A tall, friendly, rust-eaten garden robot in a seed-packet lithograph style: halftone-printed shading, chipped teal enamel, a straw hat with a sunflower, a glowing seedling in its chest, a watering-tank backpack and ivy creeping up its legs.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// The inks (the whole palette of the print)
const NAVY = "#1b2a3b";
const TEAL = "#2e8c86";
const TEAL_D = "#1c5a58";
const RUST = "#b5521f";
const RUST_D = "#6b2a12";
const RUST_L = "#df8a45";
const MUSTARD = "#e9b23c";
const CREAM = "#f4e7c5";
const LEAF = "#5aa04a";
const LEAF_D = "#2e6a3a";
const PINK = "#e5607a";
const SOIL = "#4b2f1d";
const BROWN = "#6e4224";
const STEEL = "#4a5d73";
const TINT_BRASS = "#e6b95c";
const TINT_COPPER = "#d98552";

const LIGHT = new THREE.Vector3(0.4, 0.8, 0.45).normalize();

/** Halftone printing: dots grow where the surface turns away from the key light. */
function print(base: ColorInput, cell = 0.02): Paint {
  return paint((p, n) => {
    const col = resolve(base, p, n);
    const dark = smoothstep(0.3, -0.75, n.dot(LIGHT));
    if (dark < 0.12) return col;
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    let u: number;
    let w: number;
    if (ax >= ay && ax >= az) {
      u = p.z;
      w = p.y;
    } else if (ay >= az) {
      u = p.x;
      w = p.z;
    } else {
      u = p.x;
      w = p.y;
    }
    const a = ((u + w) * 0.7071) / cell;
    const c = ((u - w) * 0.7071) / cell;
    const fa = a - Math.floor(a) - 0.5;
    const fc = c - Math.floor(c) - 0.5;
    return Math.hypot(fa, fc) < 0.62 * dark ? mix(col, NAVY, 0.55) : col;
  });
}

const RUST_P = paint((p) => {
  const big = noise(p, 0.08, 2);
  const fine = noise(p, 0.02, 3);
  const streak = noise(new THREE.Vector3(p.x * 5, p.y * 0.7, p.z * 5), 0.06, 5);
  let c = mix(RUST_D, RUST, smoothstep(0.25, 0.7, big));
  c = mix(c, RUST_L, smoothstep(0.55, 0.8, fine) * 0.7);
  c = mix(c, RUST_D, smoothstep(0.55, 0.8, streak) * 0.6);
  return c;
});
const TEAL_P = paint((p) => {
  const c = noise(p, 0.12, 11);
  const e = noise(p, 0.035, 12);
  if (c > 0.62 || (c > 0.52 && e > 0.66)) return RUST_P;
  return mix(TEAL, "#58b5a8", smoothstep(0.55, 0.85, noise(p, 0.06, 13)) * 0.45);
});
const P_TEAL = print(TEAL_P);
const P_RUST = print(RUST_P);
const P_MUST = print(mottle(MUSTARD, "#c58a24", { size: 0.05, seed: 21 }));
const P_LEATHER = print(mottle(BROWN, "#4e2d15", { size: 0.03, seed: 8 }));
const P_STEEL = print(mottle(STEEL, "#2d3b4d", { size: 0.05, seed: 5 }));
const P_STRAW = print(grain("#ecc96a", "#bf9035", { size: 0.01, axis: "x", seed: 3 }));
const P_CANVAS = print(
  gradient(mottle(CREAM, "#e3cf9c", { size: 0.04, seed: 17 }), "#a8864f", [0, 0.78, 0], [0, 0.5, 0]),
);
const P_CANVAS2 = print(mottle("#ead8a6", "#d2b97c", { size: 0.03, seed: 19 }));
const P_BOOT = print(gradient(RUST_P, SOIL, [0, 0.2, 0], [0, 0.0, 0]));

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const SVG_NS = `xmlns="http://www.w3.org/2000/svg"`;

function eyeTexture(iris: string, cracked: boolean) {
  let spokes = "";
  for (let i = 0; i < 14; i++) {
    const a = (i * Math.PI * 2) / 14;
    spokes += `<path d="M${50 + Math.cos(a) * 15} ${50 + Math.sin(a) * 15} L${50 + Math.cos(a) * 31} ${50 + Math.sin(a) * 31}" stroke="${RUST_D}" stroke-width="1.8" opacity="0.7"/>`;
  }
  let dots = "";
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    dots += `<circle cx="${50 + Math.cos(a) * 39.5}" cy="${50 + Math.sin(a) * 39.5}" r="2.1" fill="${NAVY}"/>`;
  }
  const crack = cracked
    ? `<path d="M22 18 L44 42 L38 58 L60 80 M44 42 L66 38" stroke="${NAVY}" stroke-width="2.6" fill="none" stroke-linejoin="round"/>`
    : "";
  return svg(
    `<svg viewBox="0 0 100 100" ${SVG_NS}>
      <circle cx="50" cy="50" r="48" fill="${NAVY}"/>
      <circle cx="50" cy="50" r="44" fill="${CREAM}"/>
      ${dots}
      <circle cx="50" cy="50" r="33.5" fill="${NAVY}"/>
      <circle cx="50" cy="50" r="31.5" fill="${iris}"/>
      <circle cx="50" cy="56" r="26" fill="${RUST_L}" opacity="0.35"/>
      ${spokes}
      <circle cx="50" cy="50" r="14" fill="${NAVY}"/>
      <circle cx="40" cy="38" r="7" fill="${CREAM}"/>
      <circle cx="60" cy="62" r="3.2" fill="${CREAM}"/>
      ${crack}
    </svg>`,
    { size: 192 },
  );
}

function flowerTexture(petal: string, center: string, petals = 10, petalLen = 17, centerR = 11) {
  let p = "";
  for (let i = 0; i < petals; i++)
    p += `<g transform="rotate(${(i * 360) / petals} 50 40)"><ellipse cx="50" cy="${40 - 10 - petalLen / 2}" rx="${petals > 11 ? 6 : 8}" ry="${petalLen}" fill="${petal}" stroke="${NAVY}" stroke-width="2.4"/></g>`;
  let seeds = "";
  if (centerR > 13)
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      seeds += `<circle cx="${50 + Math.cos(a) * 9}" cy="${40 + Math.sin(a) * 9}" r="1.6" fill="${MUSTARD}"/>`;
    }
  return svg(
    `<svg viewBox="0 0 100 140" ${SVG_NS}>
      <path d="M50 140 L50 56" stroke="${NAVY}" stroke-width="8" stroke-linecap="round"/>
      <path d="M50 140 L50 56" stroke="${LEAF}" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 112 Q72 108 80 90 Q58 90 50 104Z" fill="${LEAF}" stroke="${NAVY}" stroke-width="2.2"/>
      ${p}
      <circle cx="50" cy="40" r="${centerR}" fill="${center}" stroke="${NAVY}" stroke-width="2.6"/>
      ${seeds}
      <circle cx="46" cy="36" r="3" fill="${CREAM}" opacity="0.7"/>
    </svg>`,
    { size: 192 },
  );
}

const ivyTexture = () =>
  svg(
    `<svg viewBox="0 0 64 64" ${SVG_NS}>
      <path d="M32 62 C20 52 6 46 4 30 C16 30 22 26 20 14 C28 18 30 12 32 2 C34 12 36 18 44 14 C42 26 48 30 60 30 C58 46 44 52 32 62Z" fill="${LEAF}" stroke="${NAVY}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 60 L32 8 M32 44 L14 32 M32 44 L50 32 M32 28 L24 18 M32 28 L40 18" stroke="${LEAF_D}" stroke-width="2.4" fill="none"/>
      <path d="M32 6 C36 16 44 22 56 28 C48 20 40 14 32 6Z" fill="#8ccf5a" opacity="0.55"/>
    </svg>`,
    { size: 128 },
  );

const grassTexture = () =>
  svg(
    `<svg viewBox="0 0 64 64" ${SVG_NS}>
      <path d="M6 64 Q8 34 2 8 Q18 30 22 64Z" fill="${LEAF}" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M20 64 Q26 30 30 2 Q42 30 40 64Z" fill="#8ccf5a" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M38 64 Q46 36 60 12 Q58 40 54 64Z" fill="${LEAF_D}" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );

const seedlingTexture = () => {
  let rays = "";
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (i * Math.PI) / 8;
    rays += `<path d="M50 62 L${50 + Math.cos(a) * 46} ${62 + Math.sin(a) * 52}" stroke="${MUSTARD}" stroke-width="2.4" opacity="0.5"/>`;
  }
  let motes = "";
  for (let i = 0; i < 14; i++)
    motes += `<circle cx="${12 + ((i * 37) % 76)}" cy="${10 + ((i * 53) % 70)}" r="${1 + (i % 3) * 0.7}" fill="${CREAM}" opacity="0.8"/>`;
  return svg(
    `<svg viewBox="0 0 100 110" ${SVG_NS}>
      <rect x="0" y="0" width="100" height="110" fill="#0f3a3c"/>
      <circle cx="50" cy="62" r="40" fill="#1d6a5c" opacity="0.8"/>
      ${rays}${motes}
      <path d="M50 96 C50 80 50 70 50 56" stroke="${NAVY}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M50 96 C50 80 50 70 50 56" stroke="#9be07a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M50 66 C30 64 20 48 22 36 C40 38 50 50 50 66Z" fill="#8ccf5a" stroke="${NAVY}" stroke-width="2.4"/>
      <path d="M50 58 C70 56 82 40 80 26 C60 28 50 42 50 58Z" fill="#b5ee7c" stroke="${NAVY}" stroke-width="2.4"/>
      <path d="M50 56 C46 46 50 38 54 32 C58 40 56 48 50 56Z" fill="#d8ffa0" stroke="${NAVY}" stroke-width="2"/>
      <path d="M20 106 Q50 78 80 106Z" fill="${SOIL}" stroke="${NAVY}" stroke-width="2.4"/>
      <circle cx="40" cy="98" r="2" fill="${RUST_L}"/><circle cx="58" cy="100" r="2.4" fill="${RUST_L}"/>
    </svg>`,
    { size: 192 },
  );
};

const packetTexture = () =>
  svg(
    `<svg viewBox="0 0 80 120" ${SVG_NS}>
      <rect x="1.5" y="1.5" width="77" height="117" rx="4" fill="${CREAM}" stroke="${NAVY}" stroke-width="3"/>
      <rect x="1.5" y="1.5" width="77" height="38" rx="4" fill="${TEAL}" stroke="${NAVY}" stroke-width="3"/>
      <text x="40" y="22" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="17" fill="${CREAM}">SEEDS</text>
      <text x="40" y="34" text-anchor="middle" font-family="Georgia, serif" font-size="7.5" fill="${MUSTARD}">FINEST GARDEN</text>
      <g transform="translate(12 30) scale(0.56)">
        ${Array.from({ length: 9 }, (_, i) => `<g transform="rotate(${i * 40} 50 40)"><ellipse cx="50" cy="19" rx="8" ry="17" fill="${PINK}" stroke="${NAVY}" stroke-width="3"/></g>`).join("")}
        <circle cx="50" cy="40" r="12" fill="${MUSTARD}" stroke="${NAVY}" stroke-width="3"/>
      </g>
      <path d="M40 90 L40 74" stroke="${LEAF_D}" stroke-width="3"/>
      <text x="40" y="108" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="9" fill="${NAVY}">No. 7 ZINNIA</text>
    </svg>`,
    { size: 192 },
  );

const stencilTexture = () =>
  svg(
    `<svg viewBox="0 0 160 40" ${SVG_NS}>
      <rect x="1.5" y="1.5" width="157" height="37" rx="5" fill="${CREAM}" stroke="${NAVY}" stroke-width="3"/>
      <text x="80" y="25" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="${RUST_D}" letter-spacing="1.5">GREEN THUMB MK.VII</text>
      <circle cx="14" cy="20" r="4" fill="${LEAF}" stroke="${NAVY}" stroke-width="1.5"/>
      <circle cx="146" cy="20" r="4" fill="${LEAF}" stroke="${NAVY}" stroke-width="1.5"/>
    </svg>`,
    { size: 384 },
  );

const dropTexture = () =>
  svg(
    `<svg viewBox="0 0 80 80" ${SVG_NS}>
      <circle cx="40" cy="40" r="38" fill="${CREAM}" stroke="${NAVY}" stroke-width="3"/>
      <path d="M40 10 C52 28 60 36 60 48 A20 20 0 0 1 20 48 C20 36 28 28 40 10Z" fill="${TEAL}" stroke="${NAVY}" stroke-width="3"/>
      <path d="M30 46 A10 10 0 0 0 36 56" stroke="${CREAM}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <text x="40" y="74" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="10" fill="${NAVY}">H2O</text>
    </svg>`,
    { size: 128 },
  );

function inflate(pts: [number, number][], cx: number, cy: number, k: number): [number, number][] {
  return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as [number, number]);
}

export default function build() {
  const b = createBuilder({ name: "rusty-gardener", paintSize: 2048 });

  const EYE_L = eyeTexture(MUSTARD, false);
  const EYE_R = eyeTexture("#8ccf5a", true);
  const SUNFLOWER = flowerTexture(MUSTARD, "#3a2012", 14, 21, 15);
  const DAISY = flowerTexture(CREAM, MUSTARD, 10, 17, 11);
  const ZINNIA = flowerTexture(PINK, MUSTARD, 9, 18, 10);
  const IVY = ivyTexture();
  const GRASS = grassTexture();
  const SEEDLING = seedlingTexture();
  const PACKET = packetTexture();
  const STENCIL = stencilTexture();
  const DROP = dropTexture();

  // --- small helpers -------------------------------------------------------------------------------------------
  const box = (w: number, h: number, d: number, color: ColorInput, bone: Joint, at: V3, o: Record<string, unknown> = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (r: number, h: number, seg: number, color: ColorInput, bone: Joint, at: V3, o: Record<string, unknown> = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, flat: true, ...o });
  const ball = (r: number, color: ColorInput, bone: Joint, at: V3, o: Record<string, unknown> = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, flat: true, ...o });
  const plane = (tex: THREE.Texture, w: number, h: number, bone: Joint, at: V3, dir: V3 = [0, 0, 1]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const disc = (tex: THREE.Texture, r: number, bone: Joint, at: V3, dir: V3 = [0, 0, 1]) =>
    b.part(new THREE.CircleGeometry(r, 16), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const rivets = (pts: V3[], r: number, color: ColorInput, bone: Joint) => {
    const geos = pts.map((p) => new THREE.SphereGeometry(r, 6, 4).translate(p[0], p[1], p[2]));
    return b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
  };
  const norm = (a: V3): V3 => {
    const l = Math.hypot(a[0], a[1], a[2]);
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const add = (a: V3, d: V3, k: number): V3 => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
  const sub = (a: V3, c: V3): V3 => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
  const wrapVine = (center: V3, axis: V3, r: number, turns: number, len: number) => {
    const a = new THREE.Vector3(...axis).normalize();
    const side = new THREE.Vector3(0, 0, 1).cross(a).normalize();
    const from = new THREE.Vector3(...center).addScaledVector(side, r);
    return spiral(center, from, a, { turns, r1: r, pitch: len / turns });
  };
  const R = rng(5);
  const leaves = (path: ReturnType<typeof wrapVine>, n: number, bone: Joint) => {
    const frames = b.along(path, n, () => undefined);
    b.cards(frames, IVY, {
      size: [0.06, 0.07],
      lean: 55,
      flow: (_f: unknown, i: number) => [Math.cos(i * 2.4), 0.1, Math.sin(i * 2.4)],
      vary: 0.25,
      spin: 30,
      rng: R,
      bone,
    });
    b.cards(
      frames.filter((_, i) => i % 4 === 1),
      ZINNIA,
      { size: [0.05, 0.07], flow: [0, 0, 1], cross: true, bone },
    );
  };

  // --- skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.92, 0], role: "spine" });
  const spine = b.chain("spine", polyline([[0, 0.92, 0], [0, 1.14, 0], [0, 1.42, 0]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const spine1 = spine.joints[0];
  const chest = spine.joints[1];
  const neck = b.chain("neck", polyline([[0, 1.5, 0], [0, 1.66, 0.01]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.66, 0.01], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.7, 0.0], dir: [0, 0, 1], role: "jaw" });

  const kneeJ: Record<string, Joint> = {};
  const elbowJ: Record<string, Joint> = {};
  const ankleJ: Record<string, Joint> = {};

  // ===============================================================================================================
  // LEGS
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hipP: V3 = [s * 0.15, 0.92, 0];
    const kneeP: V3 = [s * 0.15, 0.52, 0.025];
    const ankP: V3 = [s * 0.15, 0.15, 0];
    const leg = b.chain(`leg${sd}`, polyline([hipP, kneeP, ankP]), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.15, 0, 0.05],
    });
    const [hipJ, kJ, ankJ] = leg.joints;
    kneeJ[sd] = kJ;
    ankleJ[sd] = ankJ;
    const toeJ = b.joint(`toe${sd}`, { parent: ankJ, at: [s * 0.15, 0.05, 0.08], dir: [0, 0, 1], role: "digit" });

    b.rod(hipP, kneeP, [0.085, 0.07], { bone: hipJ, color: P_TEAL, sides: 8, smooth: false });
    ball(0.1, P_MUST, hipJ, hipP);
    ball(0.085, P_MUST, kJ, kneeP);
    b.rod(kneeP, ankP, [0.07, 0.058], { bone: kJ, color: P_RUST, sides: 8, smooth: false });
    box(0.125, 0.1, 0.04, P_TEAL, kJ, [s * 0.15, 0.52, 0.095]);
    rivets([[s * 0.11, 0.55, 0.116], [s * 0.19, 0.55, 0.116], [s * 0.11, 0.49, 0.116], [s * 0.19, 0.49, 0.116]], 0.008, P_MUST, kJ);
    box(0.1, 0.2, 0.025, P_TEAL, kJ, [s * 0.15, 0.33, 0.077]);
    rivets([[s * 0.15, 0.41, 0.092], [s * 0.15, 0.25, 0.092]], 0.008, P_MUST, kJ);
    for (const y of [0.4, 0.24]) cyl(0.073 - (0.52 - y) * 0.03, 0.028, 8, P_MUST, kJ, [s * 0.15, y, 0.025 * ((y - 0.15) / 0.37)]);
    ball(0.07, P_MUST, ankJ, ankP);
    cyl(0.077, 0.045, 8, P_MUST, ankJ, [s * 0.15, 0.125, 0]);
    // boots
    box(0.17, 0.09, 0.2, P_BOOT, ankJ, [s * 0.15, 0.065, -0.02]);
    box(0.18, 0.02, 0.2, NAVY, ankJ, [s * 0.15, 0.009, -0.02]);
    box(0.17, 0.065, 0.13, P_BOOT, toeJ, [s * 0.15, 0.0525, 0.15]);
    box(0.18, 0.02, 0.13, NAVY, toeJ, [s * 0.15, 0.009, 0.15]);
    rivets([[s * 0.11, 0.087, 0.16], [s * 0.19, 0.087, 0.16], [s * 0.15, 0.087, 0.2]], 0.009, P_MUST, toeJ);
    // grass tufts sprouting at the boots
    b.cards(
      [frame([s * 0.1, 0.1, 0.1], [0, 1, 0]), frame([s * 0.2, 0.1, 0.0], [0, 1, 0]), frame([s * 0.14, 0.09, -0.1], [0, 1, 0])],
      GRASS,
      { size: [0.06, 0.07], flow: [0, 0, 1], cross: true, bone: ankJ },
    );
    // knee gear
    gearTrain(b, {
      at: [s * 0.241, 0.52, 0.025],
      axis: [s, 0, 0],
      module: 0.006,
      style: "flat",
      spin: `kneeGear${sd}`,
      bone: kJ,
      color: [TINT_COPPER],
      gears: [{ teeth: 14 }],
    });
  }

  // ===============================================================================================================
  // PELVIS, BELT, APRON, TOOLS
  box(0.42, 0.2, 0.27, P_TEAL, hips, [0, 0.9, 0]);
  box(0.46, 0.058, 0.31, P_LEATHER, hips, [0, 0.995, 0]);
  box(0.075, 0.065, 0.02, P_MUST, hips, [0, 0.995, 0.16]);
  box(0.045, 0.035, 0.014, NAVY, hips, [0, 0.995, 0.17]);
  rivets([[0.19, 0.995, 0.158], [-0.19, 0.995, 0.158], [0.12, 0.995, 0.158], [-0.12, 0.995, 0.158]], 0.009, P_MUST, hips);

  const apron: [number, number][] = [
    [-0.17, 0], [0.17, 0], [0.2, -0.2], [0.21, -0.38], [0.14, -0.44], [0.07, -0.37],
    [0, -0.44], [-0.07, -0.37], [-0.14, -0.44], [-0.21, -0.38], [-0.2, -0.2],
  ];
  b.extrude(inflate(apron, 0, -0.22, 1.06), { at: [0, 0.965, 0.1425], x: [1, 0, 0], thickness: 0.016, color: NAVY, bone: hips });
  b.extrude(apron, { at: [0, 0.965, 0.144], x: [1, 0, 0], thickness: 0.018, bevel: 0.003, color: P_CANVAS, bone: hips });
  const pocket: [number, number][] = [[-0.085, 0], [0.085, 0], [0.085, -0.115], [0, -0.15], [-0.085, -0.115]];
  plane(PACKET, 0.075, 0.12, hips, [0, 0.862, 0.1545]);
  b.extrude(inflate(pocket, 0, -0.075, 1.12), { at: [0, 0.865, 0.157], x: [1, 0, 0], thickness: 0.012, color: NAVY, bone: hips });
  b.extrude(pocket, { at: [0, 0.865, 0.158], x: [1, 0, 0], thickness: 0.012, bevel: 0.002, color: P_CANVAS2, bone: hips });
  rivets([[-0.075, 0.862, 0.166], [0.075, 0.862, 0.166]], 0.007, P_MUST, hips);

  // tool pouches: trowel (right hip), shears (left hip), a zinnia tucked in the belt
  box(0.075, 0.11, 0.11, P_LEATHER, hips, [-0.255, 0.935, 0.03]);
  box(0.065, 0.1, 0.1, P_LEATHER, hips, [0.255, 0.935, 0.03]);
  cyl(0.017, 0.11, 6, P_LEATHER, hips, [-0.255, 1.04, 0.03]);
  cyl(0.02, 0.025, 6, P_MUST, hips, [-0.255, 1.1, 0.03]);
  for (const k of [-1, 1]) {
    b.rod([0.255, 0.99, 0.03 + k * 0.012], [0.255 + k * 0.025, 1.12, 0.03 + k * 0.03], 0.009, { bone: hips, color: STEEL });
    ball(0.016, RUST, hips, [0.255 + k * 0.025, 1.125, 0.03 + k * 0.03]);
  }
  b.cards([frame([0.1, 1.0, 0.16], [0.2, 1, 0.2])], ZINNIA, { size: [0.07, 0.098], flow: [0, 0, 1], cross: true, bone: hips });

  // ===============================================================================================================
  // TORSO
  for (let i = 0; i < 4; i++) cyl(0.125, 0.036, 8, i % 2 ? RUST_D : P_STEEL, spine1, [0, 1.03 + i * 0.037, 0]);
  box(0.46, 0.38, 0.3, P_TEAL, chest, [0, 1.33, 0]);
  box(0.42, 0.045, 0.27, P_RUST, chest, [0, 1.15, 0]);
  b.frustumBox([0, 1.52, 0], [0, 1.57, 0], [0.5, 0.32], [0.32, 0.24], { bone: chest, color: P_RUST });
  // chest window with the glowing seedling
  box(0.25, 0.27, 0.02, P_MUST, chest, [0, 1.35, 0.155]);
  box(0.21, 0.23, 0.02, NAVY, chest, [0, 1.35, 0.158]);
  glow(plane(SEEDLING, 0.19, 0.21, chest, [0, 1.35, 0.1695]), 1.1);
  rivets([[0.108, 1.468, 0.168], [-0.108, 1.468, 0.168], [0.108, 1.232, 0.168], [-0.108, 1.232, 0.168]], 0.009, P_MUST, chest);
  // stencil plaque and dials
  plane(STENCIL, 0.26, 0.065, chest, [0, 1.19, 0.152]);
  for (const s of [1, -1]) {
    cyl(0.05, 0.02, 10, P_MUST, chest, [s * 0.18, 1.41, 0.158], { dir: [0, 0, 1] });
    disc(gaugeTexture({ needle: s > 0 ? 55 : -40, label: s > 0 ? "PSI" : "SUN" }), 0.043, chest, [s * 0.18, 1.41, 0.1695]);
    box(0.012, 0.22, 0.2, P_RUST, chest, [s * 0.2325, 1.32, 0]);
    rivets([[s * 0.24, 1.4, 0.07], [s * 0.24, 1.4, -0.07], [s * 0.24, 1.24, 0.07], [s * 0.24, 1.24, -0.07]], 0.009, P_MUST, chest);
  }
  rivets([[0.2, 1.17, 0.14], [-0.2, 1.17, 0.14], [0, 1.17, 0.14]], 0.009, P_MUST, chest);
  // collar and neck
  cyl(0.125, 0.04, 8, P_MUST, chest, [0, 1.57, 0]);
  cyl(0.07, 0.17, 8, P_STEEL, neck.joints[0], [0, 1.58, 0.005]);
  for (const y of [1.53, 1.59, 1.64]) cyl(0.08, 0.02, 8, RUST_D, neck.joints[0], [0, y, 0.005]);

  // ===============================================================================================================
  // BACK TANK (watering backpack), straps, hose
  const TZ = -0.32;
  box(0.3, 0.1, 0.04, P_RUST, chest, [0, 1.2, -0.17]);
  box(0.3, 0.1, 0.04, P_RUST, chest, [0, 1.45, -0.17]);
  cyl(0.15, 0.5, 10, P_RUST, chest, [0, 1.28, TZ]);
  b.part(new THREE.SphereGeometry(0.15, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P_RUST, { bone: chest, at: [0, 1.53, TZ], flat: true });
  b.part(new THREE.SphereGeometry(0.15, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), P_RUST, { bone: chest, at: [0, 1.03, TZ], rotation: [180, 0, 0], flat: true });
  for (const y of [1.12, 1.44]) cyl(0.157, 0.04, 10, P_MUST, chest, [0, y, TZ]);
  cyl(0.045, 0.05, 8, P_MUST, chest, [0, 1.69, TZ]);
  cyl(0.02, 0.05, 6, NAVY, chest, [0, 1.73, TZ]);
  b.sweep(catmull([[0.0, 1.66, TZ], [0.14, 1.72, TZ], [0.19, 1.6, TZ]]), 0.014, { bone: chest, color: P_MUST, sides: 6, smooth: false });
  cyl(0.058, 0.02, 10, P_MUST, chest, [0.155, 1.3, TZ], { dir: [1, 0, 0] });
  disc(gaugeTexture({ needle: 70, label: "PSI" }), 0.048, chest, [0.1665, 1.3, TZ], [1, 0, 0]);
  cyl(0.058, 0.02, 10, P_MUST, chest, [-0.155, 1.3, TZ], { dir: [1, 0, 0] });
  disc(DROP, 0.05, chest, [-0.1665, 1.3, TZ], [-1, 0, 0]);
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.11, 1.5, -0.2], [s * 0.15, 1.585, -0.04], [s * 0.16, 1.56, 0.1], [s * 0.15, 1.4, 0.16]]), () => [0.03, 0.008], {
      bone: chest,
      section: "box",
      color: P_LEATHER,
    });
    rivets([[s * 0.15, 1.5, 0.163], [s * 0.15, 1.44, 0.163]], 0.009, P_MUST, chest);
  }
  const hose = catmull([[0, 1.0, TZ - 0.02], [-0.12, 0.94, -0.36], [-0.27, 0.9, -0.27], [-0.28, 0.85, -0.12]]);
  b.sweep(hose, 0.017, { bone: hips, color: TEAL_D, sides: 6, smooth: false });
  cyl(0.026, 0.04, 8, P_MUST, chest, [0, 1.0, TZ - 0.02]);
  cyl(0.026, 0.05, 8, P_MUST, hips, [-0.28, 0.83, -0.12]);
  b.spike([-0.28, 0.8, -0.12], [0, -1, 0], 0.09, 0.032, { bone: hips, color: P_MUST });

  // ===============================================================================================================
  // HEAD
  box(0.36, 0.27, 0.3, P_TEAL, head, [0, 1.865, 0.02]);
  box(0.335, 0.225, 0.01, NAVY, head, [0, 1.855, 0.172]);
  box(0.31, 0.2, 0.02, P_CANVAS2, head, [0, 1.855, 0.178]);
  rivets([[0.148, 1.945, 0.19], [-0.148, 1.945, 0.19], [0.148, 1.765, 0.19], [-0.148, 1.765, 0.19]], 0.008, P_MUST, head);
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const small = s < 0 ? 0.88 : 1;
    const gx = s * 0.085;
    cyl(0.07 * small, 0.06, 10, P_STEEL, head, [gx, 1.885, 0.215], { dir: [0, 0, 1] });
    b.part(new THREE.TorusGeometry(0.07 * small, 0.012, 5, 10), P_MUST, { bone: head, at: [gx, 1.885, 0.245], flat: true });
    glow(plane(s > 0 ? EYE_L : EYE_R, 0.128 * small, 0.128 * small, head, [gx, 1.885, 0.2465]), 1.0);
    // brows: little rust leaves
    const brow: [number, number][] = [[-0.05, 0], [-0.02, 0.022], [0.03, 0.024], [0.055, 0.002], [0.02, 0.01], [-0.02, 0.008]];
    b.extrude(brow, { at: [gx, 1.97, 0.19], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.014, color: P_RUST, bone: head });
    // cheeks
    b.part(new THREE.CircleGeometry(0.03, 10), PINK, { bone: head, at: [s * 0.12, 1.795, 0.1895], dir: [0, 0, 1], axis: "z" });
    // ear cups with spinning gears
    cyl(0.07, 0.045, 10, P_RUST, head, [s * 0.2, 1.86, 0.02], { dir: [1, 0, 0] });
    gearTrain(b, {
      at: [s * 0.2285, 1.86, 0.02],
      axis: [s, 0, 0],
      module: 0.006,
      style: "flat",
      spin: `earGear${sd}`,
      bone: head,
      color: [TINT_BRASS, TINT_COPPER],
      gears: [{ teeth: 16, spokes: 4 }, { teeth: 10, angle: 135 }],
    });
  }
  ball(0.02, P_MUST, head, [0, 1.82, 0.2]);
  // mouth: upper grille on the head, lower jaw on the jaw joint
  box(0.17, 0.034, 0.01, NAVY, head, [0, 1.785, 0.1925]);
  for (let i = -2; i <= 2; i++) box(0.018, 0.018, 0.01, CREAM, head, [i * 0.032, 1.795, 0.1945]);
  box(0.3, 0.07, 0.22, P_MUST, jaw, [0, 1.7, 0.09]);
  for (let i = -2; i <= 2; i++) box(0.012, 0.042, 0.01, NAVY, jaw, [i * 0.05, 1.7, 0.2]);
  rivets([[0.13, 1.72, 0.201], [-0.13, 1.72, 0.201]], 0.008, P_RUST, jaw);

  // straw hat with band, daisies and a sunflower pushing through the crown
  const HAT_AT: V3 = [0, 1.965, 0];
  const HAT_AX: V3 = [0, 1, -0.18];
  b.lathe(
    [[0, 0], [0.36, 0], [0.37, 0.015], [0.27, 0.032], [0.205, 0.035], [0.2, 0.14], [0.16, 0.175], [0, 0.175]],
    { at: HAT_AT, axis: HAT_AX, segments: 10, color: P_STRAW, bone: head },
  );
  b.lathe([[0.197, 0.04], [0.213, 0.04], [0.213, 0.078], [0.197, 0.078]], {
    at: HAT_AT, axis: HAT_AX, segments: 10, color: "#d04a5f", bone: head,
  });
  const brimY = (z: number) => HAT_AT[1] + 0.18 * z + 0.03;
  b.cards(
    ([[0.17, 0.2], [0.09, 0.25], [0.23, 0.1], [-0.2, 0.16]] as [number, number][]).map(([x, z]) =>
      frame([x, brimY(z), z], [x * 0.3, 1, 0.2]),
    ),
    DAISY,
    { size: [0.075, 0.105], flow: [0, 0, 1], cross: true, bone: head },
  );
  b.sweep(catmull([[0, 2.12, -0.03], [0.012, 2.16, -0.03], [0, 2.19, -0.025]]), 0.011, {
    bone: head, color: LEAF_D, sides: 5, smooth: false,
  });
  b.cards([frame([0, 2.19, -0.025], [0.08, 1, 0.12])], SUNFLOWER, {
    size: [0.17, 0.238], flow: [0, 0, 1], cross: true, bone: head,
  });

  // ===============================================================================================================
  // ARMS and HANDS
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const S: V3 = [s * 0.31, 1.45, 0];
    const E: V3 = [s * 0.5, 1.21, 0.02];
    const W: V3 = [s * 0.62, 0.98, 0.1];
    const arm = b.chain(`arm${sd}`, polyline([S, E, W]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    const [shJ, elJ, wrJ] = arm.joints;
    elbowJ[sd] = elJ;
    ball(0.09, P_MUST, shJ, S);
    const dome = b.part(new THREE.SphereGeometry(0.125, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P_RUST, {
      bone: shJ, at: [s * 0.315, 1.48, 0], rotation: [0, 0, -s * 20], flat: true,
    });
    cyl(0.127, 0.014, 8, P_MUST, shJ, [s * 0.315, 1.48, 0], { rotation: [0, 0, -s * 20] });
    const hits = b.surface(dome).scatter(7, { rng: R, minDist: 0.045, filter: (h) => h.n.y > 0.55 });
    b.cards(hits, GRASS, { size: [0.05, 0.07], lean: 15, vary: 0.3, rng: R, bone: shJ });
    b.rod(S, E, [0.062, 0.055], { bone: shJ, color: P_TEAL, sides: 8, smooth: false });
    ball(0.068, P_MUST, elJ, E);
    b.rod(E, W, [0.056, 0.046], { bone: elJ, color: P_RUST, sides: 8, smooth: false });
    gearTrain(b, {
      at: [s * 0.571, 1.21, 0.02],
      axis: [s, 0, 0],
      module: 0.006,
      style: "flat",
      spin: `elbowGear${sd}`,
      bone: elJ,
      color: [TINT_BRASS],
      gears: [{ teeth: 14 }],
    });
    const fd = norm(sub(W, E));
    cyl(0.06, 0.045, 8, P_MUST, elJ, add(W, fd, -0.03), { dir: fd });
    cyl(0.058, 0.03, 8, P_MUST, elJ, add(E, fd, 0.07), { dir: fd });
    ball(0.05, P_STEEL, wrJ, W);
    // palm and back-of-hand plate
    box(0.055, 0.1, 0.11, P_STEEL, wrJ, [W[0] + s * 0.012, W[1] - 0.055, W[2] + 0.02]);
    box(0.012, 0.07, 0.09, P_RUST, wrJ, [W[0] + s * 0.044, W[1] - 0.05, W[2] + 0.02]);
    rivets([[W[0] + s * 0.052, W[1] - 0.03, W[2] + 0.0], [W[0] + s * 0.052, W[1] - 0.07, W[2] + 0.04]], 0.007, P_MUST, wrJ);
    const fingers: [string, number, number][] = [["index", 0.036, 0.2], ["middle", 0, 0], ["ring", -0.036, -0.2]];
    for (const [fname, fz, fan] of fingers) {
      const p0: V3 = [W[0] + s * 0.012, W[1] - 0.105, W[2] + 0.02 + fz];
      const p1 = add(p0, norm([s * 0.14, -1, fan * 0.8]), 0.07);
      const p2 = add(p1, norm([s * 0.1, -1, fan * 0.6 + 0.25]), 0.06);
      const ch = b.chain(`${fname}${sd}`, polyline([p0, p1, p2]), {
        parent: wrJ, names: [`${fname}${sd}1`, `${fname}${sd}2`], role: "digit",
      });
      b.sweep(ch, [0.016, 0.011], { sides: 6, smooth: false, bands: [[0.6, P_STEEL], [1, SOIL]] });
    }
    {
      const p0: V3 = [W[0] - s * 0.01, W[1] - 0.06, W[2] + 0.085];
      const p1 = add(p0, norm([s * 0.1, -0.7, 0.7]), 0.055);
      const p2 = add(p1, norm([s * 0.05, -0.8, 0.6]), 0.045);
      const ch = b.chain(`thumb${sd}`, polyline([p0, p1, p2]), {
        parent: wrJ, names: [`thumb${sd}1`, `thumb${sd}2`], role: "digit",
      });
      b.sweep(ch, [0.018, 0.012], { sides: 6, smooth: false, bands: [[0.6, P_STEEL], [1, SOIL]] });
    }
  }

  // ===============================================================================================================
  // IVY: spirals up the left shin and left forearm, a little on the right boot
  const shinVine = wrapVine([0.15, 0.17, 0.005], [0, 1, 0], 0.083, 1.6, 0.34);
  b.sweep(shinVine, 0.011, { bone: kneeJ.L, color: LEAF_D, sides: 5, smooth: false });
  leaves(shinVine, 12, kneeJ.L);

  const eL: V3 = [0.5, 1.21, 0.02];
  const wL: V3 = [0.62, 0.98, 0.1];
  const foreAxis = sub(wL, eL);
  const armCenter = add(eL, norm(foreAxis), 0.045);
  const armVine = wrapVine(armCenter, foreAxis, 0.07, 1.5, 0.17);
  b.sweep(armVine, 0.01, { bone: elbowJ.L, color: LEAF_D, sides: 5, smooth: false });
  leaves(armVine, 9, elbowJ.L);

  const bootVine = wrapVine([-0.15, 0.15, 0.005], [0, 1, 0], 0.083, 0.9, 0.16);
  b.sweep(bootVine, 0.01, { bone: kneeJ.R, color: LEAF_D, sides: 5, smooth: false });
  leaves(bootVine, 6, kneeJ.R);

  void ankleJ;
  return b.root;
}
