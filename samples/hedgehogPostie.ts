import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, rng } from "../src/math";
import type { Joint } from "../src/skeleton";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Hedgehog Postie",
  description:
    "A cute flat low-poly hedgehog mail carrier on its hind legs: chunky quills, postal cap, stuffed satchel, a letter held out to a tiny red postbox, and stamped envelope cards.",
};

// ---- palette -------------------------------------------------------------------------------------------------
const SKIN = "#f2c39a";
const CREAM = "#fff1de";
const MASK = "#fff1de";
const QUILL_BASE = "#8a6cc0";
const NOSE = "#4b2b4a";
const ROSE = "#b03f5e";
const CLAW = "#7a5368";
const CAP = "#5fb9f2";
const CAP_BAND = "#3d86dc";
const CAP_VISOR = "#2f63b8";
const GOLD = "#ffd24d";
const SCARF = "#ff6f7f";
const BELT = "#7a5a4a";
const BAG = "#f2a25c";
const BAG_FLAP = "#e9853f";
const STRAP = "#35b9a3";
const BOX_RED = "#ff5a6c";
const BOX_DARK = "#d63d58";
const PAPER = "#fff6e6";

// ---- drawings ------------------------------------------------------------------------------------------------
const quillTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 32">
    <rect x="0" y="0" width="8" height="32" fill="#9b79d6"/>
    <rect x="0" y="0" width="8" height="18" fill="#c9a9f5"/>
    <rect x="0" y="0" width="8" height="8" fill="#fff0f6"/>
  </svg>`,
  { size: 64 },
);

const eyeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50">
    <ellipse cx="20" cy="26" rx="17" ry="22" fill="#2b1a3c"/>
    <ellipse cx="20" cy="29" rx="12.5" ry="16" fill="#5b3f86"/>
    <ellipse cx="20" cy="31" rx="9" ry="11" fill="#7a5db0"/>
    <circle cx="26" cy="15" r="7.5" fill="#ffffff"/>
    <circle cx="13" cy="36" r="3.4" fill="#ffffff"/>
  </svg>`,
  { size: 200 },
);

const blushTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24">
    <ellipse cx="20" cy="12" rx="19" ry="11" fill="#ff93ac"/>
    <path d="M10 15 L14 7 M18 16 L22 8 M26 15 L30 7" stroke="#ff6589" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 160 },
);

const maskTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70">
    <path d="M4 42 C2 16 26 6 50 20 C74 6 98 16 96 42 C94 62 72 70 50 70 C28 70 6 62 4 42 Z" fill="${MASK}"/>
    <ellipse cx="22" cy="24" rx="9" ry="5" fill="#d79e78" transform="rotate(-18 22 24)"/>
    <ellipse cx="78" cy="24" rx="9" ry="5" fill="#d79e78" transform="rotate(18 78 24)"/>
  </svg>`,
  { size: 300 },
);

const smileTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
    <path d="M4 4 Q10 14 20 5" stroke="#8a3f5a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 120 },
);

const badgeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="#ffd24d" stroke="#2f63b8" stroke-width="3"/>
    <circle cx="15" cy="22" r="8" fill="none" stroke="#2f63b8" stroke-width="3.6"/>
    <path d="M20 14 L32 8 L32 22 L22 19 Z" fill="#2f63b8"/>
    <rect x="9" y="14" width="8" height="4" rx="1.5" fill="#2f63b8"/>
  </svg>`,
  { size: 200 },
);

const buckleTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
    <rect x="3" y="3" width="24" height="24" rx="4" fill="#ffd24d" stroke="#d99a22" stroke-width="2.6"/>
    <rect x="10" y="10" width="10" height="10" rx="2" fill="#7a5a4a"/>
  </svg>`,
  { size: 120 },
);

const bagTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90">
    <path d="M0 0 L90 0 L90 50 L45 72 L0 50 Z" fill="${BAG_FLAP}"/>
    <path d="M6 6 L84 6 L84 47 L45 66 L6 47 Z" fill="none" stroke="#ffd9a8" stroke-width="2.6" stroke-dasharray="6 5"/>
    <circle cx="45" cy="62" r="9" fill="#ffd24d" stroke="#d99a22" stroke-width="2.4"/>
    <path d="M38 61 L52 61 M45 57 L45 66" stroke="#d99a22" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M30 78 L42 82 L30 86 Z M60 78 L48 82 L60 86 Z" fill="#fff6e6"/>
  </svg>`,
  { size: 270 },
);

const scarfTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
    <path d="M0 0 L60 0 L30 60 Z" fill="${SCARF}"/>
    <circle cx="14" cy="9" r="3.2" fill="#fff6e6"/>
    <circle cx="30" cy="9" r="3.2" fill="#fff6e6"/>
    <circle cx="46" cy="9" r="3.2" fill="#fff6e6"/>
    <circle cx="22" cy="24" r="3.2" fill="#fff6e6"/>
    <circle cx="38" cy="24" r="3.2" fill="#fff6e6"/>
    <circle cx="30" cy="39" r="3.2" fill="#fff6e6"/>
  </svg>`,
  { size: 180 },
);

function stamp(kind: number, col: string, x: number, y: number) {
  const art =
    kind === 0
      ? `<path d="M11 6 C11 2 4 2 4 8 C4 13 11 17 11 19 C11 17 18 13 18 8 C18 2 11 2 11 6 Z" fill="#fff6e6"/>`
      : kind === 1
        ? `<path d="M11 3 L13.4 9 L19 9.4 L14.6 13 L16 19 L11 15.8 L6 19 L7.4 13 L3 9.4 L8.6 9 Z" fill="#fff6e6"/>`
        : `<circle cx="11" cy="11" r="5" fill="#fff6e6"/><circle cx="11" cy="11" r="2.2" fill="${col}"/>`;
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="22" height="26" fill="#ffffff" stroke="${col}" stroke-width="1.6" stroke-dasharray="2.4 1.6"/>
    <rect x="3" y="3" width="16" height="20" fill="${col}"/>
    <g transform="translate(0 2)">${art}</g>
  </g>`;
}

function envelope(paper: string, edge: string, stampKind: number, stampCol: string, airmail = false) {
  const border = airmail
    ? `<path d="M0 8 L14 0 L28 8 L42 0 L56 8 L70 0 L84 8 L98 0 L112 8 L120 4 L120 0 L0 0 Z" fill="none"/>
       <rect x="3" y="3" width="114" height="74" fill="none" stroke="#ff5a6c" stroke-width="4" stroke-dasharray="10 10"/>
       <rect x="3" y="3" width="114" height="74" fill="none" stroke="#4a8ee8" stroke-width="4" stroke-dasharray="10 10" stroke-dashoffset="10"/>`
    : "";
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
      <rect x="0" y="0" width="120" height="80" rx="4" fill="${paper}"/>
      ${border}
      <path d="M3 4 L60 46 L117 4" fill="none" stroke="${edge}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M3 76 L46 36 M117 76 L74 36" fill="none" stroke="${edge}" stroke-width="2.2"/>
      ${stamp(stampKind, stampCol, 88, 10)}
      <circle cx="80" cy="30" r="9" fill="none" stroke="#7a6a8a" stroke-width="1.8"/>
      <path d="M62 24 Q68 20 74 24 M62 30 Q68 26 74 30 M62 36 Q68 32 74 36" fill="none" stroke="#7a6a8a" stroke-width="1.8"/>
      <path d="M12 52 L56 52 M12 62 L48 62 M12 72 L40 72" stroke="#8d7fa0" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 360 },
  );
}

const ENV_CREAM = envelope(PAPER, "#d9b98f", 0, "#ff6f8d");
const ENV_PINK = envelope("#ffd3e1", "#f29ab5", 1, "#ffb400");
const ENV_SKY = envelope("#d3efff", "#8cc5ea", 2, "#35b9a3");
const ENV_AIR = envelope(PAPER, "#d9b98f", 0, "#4a8ee8", true);

const slotTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
    <rect x="2" y="8" width="56" height="14" rx="7" fill="#3a1e3c"/>
    <rect x="6" y="11" width="48" height="3" rx="1.5" fill="#6a4268"/>
  </svg>`,
  { size: 240 },
);

const plateTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
    <rect x="2" y="2" width="56" height="56" rx="10" fill="#fff6e6" stroke="#ffd24d" stroke-width="4"/>
    <rect x="12" y="16" width="36" height="26" rx="3" fill="#ffd3e1" stroke="#ff5a6c" stroke-width="2.6"/>
    <path d="M13 18 L30 32 L47 18" fill="none" stroke="#ff5a6c" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M16 50 L44 50" stroke="#c9b9a0" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 180 },
);

const sparkleTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="#fff3a8"/>
    <path d="M16 8 L17.6 14.4 L24 16 L17.6 17.6 L16 24 L14.4 17.6 L8 16 L14.4 14.4 Z" fill="#ffffff"/>
  </svg>`,
  { size: 96 },
);

const grassTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <path d="M4 40 L9 6 L15 40 Z" fill="#8fdc8a"/>
    <path d="M13 40 L21 0 L28 40 Z" fill="#b6ef9d"/>
    <path d="M25 40 L33 10 L37 40 Z" fill="#8fdc8a"/>
  </svg>`,
  { size: 120 },
);

const daisyTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52">
    <path d="M19 52 L21 52 L21 26 L19 26 Z" fill="#7fd083"/>
    <g fill="#ffffff">
      <ellipse cx="20" cy="9" rx="5" ry="8"/>
      <ellipse cx="20" cy="27" rx="5" ry="8"/>
      <ellipse cx="11" cy="18" rx="8" ry="5"/>
      <ellipse cx="29" cy="18" rx="8" ry="5"/>
    </g>
    <circle cx="20" cy="18" r="5.5" fill="#ffc83d"/>
  </svg>`,
  { size: 120 },
);

const tuftTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32">
    <path d="M2 32 L8 2 L12 32 Z" fill="#fff1de"/>
    <path d="M10 32 L18 6 L22 32 Z" fill="#ffe2c2"/>
  </svg>`,
  { size: 96 },
);

// ---- helpers -------------------------------------------------------------------------------------------------
type Hit = { at: THREE.Vector3; n: THREE.Vector3 };

/** Many cones standing on surface hits, swept back: one merged geometry in model space. */
function quillGeometry(hits: Hit[], random: () => number, len: number, radius: number, sweepBack: number) {
  const pieces: THREE.BufferGeometry[] = [];
  for (const hit of hits) {
    const dir = hit.n
      .clone()
      .add(new THREE.Vector3(0, 0.22, -sweepBack))
      .normalize();
    const l = len * (0.8 + 0.4 * random());
    const r = radius * (0.85 + 0.3 * random());
    const cone = new THREE.ConeGeometry(1, 1, 5, 1).translate(0, 0.5, 0);
    const q = aim(dir);
    const origin = hit.at.clone().addScaledVector(dir, -0.25 * l);
    cone.applyMatrix4(new THREE.Matrix4().compose(origin, q, new THREE.Vector3(r, l, r)));
    pieces.push(cone);
  }
  const merged = mergeGeometries(pieces);
  if (!merged) throw new Error("quill merge failed");
  return merged;
}

export default function build() {
  const b = createBuilder({ name: "hedgehogPostie", paintSize: 512 });
  const rand = rng(11);

  // ---- skeleton --------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.15, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, 0],
      [0, 0.195, 0.004],
      [0, 0.245, 0.012],
      [0, 0.285, 0.022],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chestJoint = spine.joints[1];
  const neck = b.joint("neck", { parent: spine.joints[2], at: [0, 0.285, 0.022], aim: [0, 0.32, 0.03], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.312, 0.03], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.278, 0.05], aim: [0, 0.285, 0.14], role: "jaw" });

  // ---- torso -----------------------------------------------------------------------------------------------
  const torso = b.sweep(spine, [0.068, 0.09, 0.088, 0.06], {
    sides: 8,
    smooth: false,
    color: SKIN,
    sectors: [[110, 250, CREAM]],
  });

  // tail stub under the quills
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.108, -0.07],
      [0, 0.1, -0.1],
      [0, 0.094, -0.128],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, [0.024, 0.004], { sides: 6, smooth: false, color: SKIN });

  // ---- belt, scarf ----------------------------------------------------------------------------------------
  const torsoSkin = b.surface(torso);
  const beltHit = torsoSkin.ray([0, 0.17, 0.4], [0, 0, -1]);
  const beltR = beltHit ? beltHit.at.z - 0.004 : 0.078;
  b.lathe(
    [
      [beltR - 0.008, 0],
      [beltR + 0.014, 0],
      [beltR + 0.014, 0.02],
      [beltR - 0.008, 0.02],
    ],
    { at: [0, 0.158, 0.004], segments: 8, color: BELT, bone: hips },
  );
  const buckleHit = torsoSkin.ray([0, 0.168, 0.3], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.032, 0.008, 0.032), "#ffffff", buckleHit.moved([0, 0.018, 0]), {
      embed: 0.3,
      texture: buckleTex,
      bone: hips,
    });
  }

  // ---- head ------------------------------------------------------------------------------------------------
  const HEAD_C: [number, number, number] = [0, 0.338, 0.03];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), SKIN, {
    bone: head,
    at: HEAD_C,
    scale: [0.097, 0.085, 0.09],
    flat: true,
  });
  b.decal(skull, maskTex, {
    at: [0, 0.32, 0.25],
    dir: [0, 0, 1],
    size: [0.15, 0.105],
    segments: 26,
    lift: 0.0025,
    bone: head,
  });
  const headSkin = b.surface(skull);
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: [s * 0.056, 0.338, 0.25],
      dir: [0, 0, 1],
      size: [0.04, 0.05],
      segments: 14,
      lift: 0.0055,
      bone: head,
    });
    const cheek = headSkin.ray([s * 0.068, 0.305, 0.4], [0, 0, -1]);
    if (cheek) {
      b.decal(skull, blushTex, {
        at: cheek,
        dir: [-(-s * 0.3), 0, 1],
        size: [0.042, 0.026],
        lift: 0.0045,
        bone: head,
      });
    }
  }

  // pointed snout, separate jaw, nose
  const snout = b.sweep(
    [
      [0, 0.325, 0.055],
      [0, 0.303, 0.198],
    ],
    [0.042, 0.008],
    { sides: 6, smooth: false, color: CREAM, bone: head, caps: { start: "none", end: "round" } },
  );
  b.part(new THREE.SphereGeometry(0.0135, 6, 5), NOSE, { bone: head, at: [0, 0.3, 0.205], flat: true });
  b.part(new THREE.SphereGeometry(0.0035, 4, 3), "#ffffff", { bone: head, at: [0.005, 0.306, 0.216], flat: true });
  b.sweep(
    [
      [0, 0.291, 0.06],
      [0, 0.289, 0.17],
    ],
    [0.028, 0.008],
    { sides: 6, smooth: false, color: ROSE, bone: head, caps: "none" },
  );
  b.sweep(
    [
      [0, 0.278, 0.052],
      [0, 0.283, 0.165],
    ],
    [0.03, 0.01],
    { sides: 6, smooth: false, color: CREAM, bone: jaw, caps: { start: "none", end: "round" } },
  );
  b.sweep(
    [
      [0, 0.291, 0.064],
      [0, 0.293, 0.15],
    ],
    [0.018, 0.008],
    { sides: 4, smooth: false, color: "#ff8fa8", bone: jaw, caps: "none" },
  );
  for (const s of [1, -1]) {
    const hit = headSkin.ray([s * 0.06, 0.288, 0.4], [0, 0, -1]);
    if (hit) {
      b.decal(skull, smileTex, {
        at: hit,
        dir: [-(-s * 0.25), 0, 1],
        size: [0.03, 0.02],
        lift: 0.005,
        mirror: s < 0,
        bone: head,
      });
    }
  }

  // ears
  for (const s of [1, -1]) {
    const ear = b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, {
      bone: head,
      at: [s * 0.084, 0.388, -0.004],
      scale: [0.03, 0.034, 0.014],
      rotation: [0, s * 50, s * -25],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#ff9db5", {
      bone: head,
      at: ear.local([0, 0.002, 0.0115]),
      scale: [0.019, 0.022, 0.008],
      rotation: [0, s * 50, s * -25],
      flat: true,
    });
  }

  // cheek tufts
  b.cards(
    [1, -1].flatMap((s) => [
      frame([s * 0.088, 0.312, 0.05], [s * 0.9, -0.15, 0.4]),
      frame([s * 0.092, 0.322, 0.03], [s * 0.9, 0.05, 0.25]),
    ]),
    tuftTex,
    { size: [0.028, 0.032], lean: 15, flow: [0, -0.3, 0.3], bone: head },
  );

  // ---- cap -------------------------------------------------------------------------------------------------
  const capAt: [number, number, number] = [0, 0.375, 0.022];
  const capAxis: [number, number, number] = [0, 1, -0.14];
  const crown = b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.09, 0.028],
      [0.1, 0.05],
      [0.097, 0.068],
      [0, 0.068],
    ],
    { at: capAt, axis: capAxis, segments: 10, color: CAP, bone: head },
  );
  b.lathe(
    [
      [0.089, -0.004],
      [0.0945, -0.004],
      [0.0945, 0.03],
      [0.089, 0.03],
    ],
    { at: capAt, axis: capAxis, segments: 10, color: CAP_BAND, bone: head },
  );
  b.part(new THREE.SphereGeometry(0.0095, 6, 4), GOLD, { bone: head, at: crown.local([0, 0.07, 0]), flat: true });
  b.extrude(
    [
      [-0.088, 0],
      [-0.098, 0.03],
      [-0.06, 0.076],
      [0, 0.09],
      [0.06, 0.076],
      [0.098, 0.03],
      [0.088, 0],
    ],
    {
      at: [0, 0.383, 0.108],
      x: [1, 0, 0],
      y: [0, -0.12, 1],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: CAP_VISOR,
      bone: head,
    },
  );
  b.decal(crown, badgeTex, { at: [0, 0.402, 0.3], dir: [0, -0.14, 1], size: [0.046, 0.046], lift: 0.0025, bone: head });

  // ---- back quills -----------------------------------------------------------------------------------------
  const dome = b.part(new THREE.SphereGeometry(1, 9, 6), QUILL_BASE, {
    bone: chestJoint,
    at: [0, 0.215, -0.045],
    scale: [0.112, 0.112, 0.098],
    flat: true,
  });
  const backHits = b.surface(dome).scatter(105, {
    rng: rng(3),
    minDist: 0.033,
    filter: (h) => h.n.z < 0.3 && h.n.y > -0.25 && h.at.y > 0.12,
  });
  b.part(quillGeometry(backHits, rand, 0.135, 0.036, 0.3), "#ffffff", {
    bone: chestJoint,
    at: [0, 0, 0],
    texture: quillTex,
    flat: true,
  });

  const nape = b.part(new THREE.SphereGeometry(1, 9, 6), QUILL_BASE, {
    bone: head,
    at: [0, 0.336, -0.014],
    scale: [0.094, 0.082, 0.074],
    flat: true,
  });
  const napeHits = b.surface(nape).scatter(52, {
    rng: rng(5),
    minDist: 0.028,
    filter: (h) => h.n.z < 0.15 && h.at.y < 0.366 && h.at.y > 0.28 && !(Math.abs(h.at.x) > 0.066 && h.at.y > 0.352),
  });
  b.part(quillGeometry(napeHits, rand, 0.08, 0.026, 0.4), "#ffffff", {
    bone: head,
    at: [0, 0, 0],
    texture: quillTex,
    flat: true,
  });

  // ---- arms ------------------------------------------------------------------------------------------------
  const armWrists: Record<number, THREE.Vector3> = {};
  const wristJoints: Record<number, Joint> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.07, 0.256, 0.012],
        [s * 0.118, 0.27, 0.03],
        [s * 0.166, 0.288, 0.046],
      ]),
      { parent: chestJoint, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.027, 0.02], { sides: 6, smooth: false, color: SKIN });
    const wrist = arm.tip ?? arm.joints[arm.joints.length - 1];
    const palm = b.part(new THREE.SphereGeometry(0.025, 7, 5), SKIN, {
      bone: wrist,
      at: [s * 0.186, 0.296, 0.052],
      flat: true,
    });
    armWrists[s] = palm.at.clone();
    wristJoints[s] = wrist;
    const fingerDirs: [number, number, number][] = [
      [s * 0.35, 0.55, 0.75],
      [s * 0.3, 0.05, 1],
      [s * 0.3, -0.5, 0.85],
    ];
    fingerDirs.forEach((d, i) => {
      const base = palm.local([0, 0, 0]).clone();
      const dir = new THREE.Vector3(...d).normalize();
      const f = b.joint(`finger${S}${i + 1}`, {
        parent: wrist,
        at: [base.x + dir.x * 0.018, base.y + dir.y * 0.018, base.z + dir.z * 0.018],
        dir: d,
        role: "digit",
      });
      b.capsule(f, [f.at.x + dir.x * 0.026, f.at.y + dir.y * 0.026, f.at.z + dir.z * 0.026], [0.009, 0.0065], {
        sides: 5,
        smooth: false,
        color: SKIN,
        bone: f,
      });
    });
  }

  // ---- legs ------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.056, 0.13, 0.004], [s * 0.062, 0.03, 0.012], [0.058, 0.062], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, catmull(pts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.062, 0, 0.05],
    });
    b.sweep(leg, [0.034, 0.03], { sides: 6, smooth: false, color: SKIN });
    const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.03, 6, 5), SKIN, { bone: ankle, at: [s * 0.062, 0.03, 0.006], flat: true });
    const toe = b.joint(`toe${S}`, {
      parent: ankle,
      at: [s * 0.062, 0.03, 0.03],
      dir: [0, 0, 1],
      role: "digit",
    });
    b.capsule([s * 0.062, 0.03, 0.03], [s * 0.062, 0.03, 0.078], [0.03, 0.026], {
      sides: 6,
      smooth: false,
      color: SKIN,
      bone: toe,
    });
    for (const k of [-1, 0, 1]) {
      b.spike([s * 0.062 + k * 0.016, 0.028, 0.098 - Math.abs(k) * 0.008], [k * 0.25, -0.1, 1], 0.02, 0.008, {
        sides: 5,
        smooth: false,
        color: CLAW,
        bone: toe,
      });
    }
  }

  // ---- satchel and strap -----------------------------------------------------------------------------------
  const bagC = new THREE.Vector3(-0.116, 0.138, 0.012);
  b.part(new THREE.BoxGeometry(0.05, 0.096, 0.112), BAG, { bone: hips, at: bagC.toArray(), flat: true });
  const flapPlate = b.part(new THREE.PlaneGeometry(0.112, 0.104), "#ffffff", {
    bone: hips,
    at: [bagC.x - 0.0262, bagC.y + 0.006, bagC.z],
    dir: [-1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: bagTex,
  });
  // letters stuffed in the top of the bag
  const stuffed: [THREE.Texture, number, number, number, number][] = [
    [ENV_PINK, -0.104, 0.196, 0.034, 14],
    [ENV_SKY, -0.118, 0.2, -0.018, -12],
    [ENV_CREAM, -0.126, 0.194, 0.01, 6],
  ];
  stuffed.forEach(([tex, x, y, z, tilt]) => {
    b.part(new THREE.BoxGeometry(0.008, 0.08, 0.086), "#ffffff", {
      bone: hips,
      at: [x, y, z],
      rotation: [tilt, 0, tilt * -0.6],
      texture: tex,
    });
  });
  b.part(new THREE.BoxGeometry(0.058, 0.014, 0.116), BAG_FLAP, {
    bone: hips,
    at: [bagC.x - 0.006, 0.19, bagC.z],
    rotation: [0, 0, -14],
    flat: true,
  });
  // strap across the chest
  const strapPath = catmull(
    [
      [-0.098, 0.19, 0.01],
      [-0.06, 0.212, 0.084],
      [0.0, 0.238, 0.09],
      [0.05, 0.25, 0.076],
      [0.066, 0.258, 0.0],
      [0.04, 0.24, -0.085],
      [-0.03, 0.212, -0.098],
      [-0.085, 0.18, -0.05],
    ],
    { closed: true },
  );
  b.sweep(torsoSkin.drape(strapPath, { lift: 0.006 }), [0.014, 0.008], {
    section: "box",
    color: STRAP,
    bone: chestJoint,
  });

  // neckerchief
  b.sweep(torsoSkin.loop([0, 0.272, 0.02], { lift: 0.008 }), 0.012, {
    sides: 5,
    smooth: false,
    color: SCARF,
    bone: chestJoint,
  });
  b.decal(torsoSkin, scarfTex, {
    at: [0, 0.225, 0.25],
    dir: [0, -0.2, 1],
    size: [0.1, 0.1],
    lift: 0.012,
    bone: chestJoint,
    up: [0, 1, 0],
  });

  // ---- letter in the left paw ------------------------------------------------------------------------------
  const paw = armWrists[1];
  b.part(new THREE.BoxGeometry(0.084, 0.056, 0.004), "#ffffff", {
    bone: wristJoints[1],
    at: [paw.x + 0.014, paw.y + 0.02, paw.z + 0.002],
    rotation: [0, 0, -12],
    texture: ENV_AIR,
  });

  // ---- postbox ---------------------------------------------------------------------------------------------
  const PB: [number, number, number] = [0.29, 0, 0.03];
  // the postbox is a prop: it rides the root
  const box = b.lathe(
    [
      [0, 0],
      [0.058, 0],
      [0.058, 0.012],
      [0.048, 0.022],
      [0.048, 0.138],
      [0.056, 0.146],
      [0.054, 0.158],
      [0.042, 0.182],
      [0.02, 0.198],
      [0, 0.2],
    ],
    { at: PB, segments: 8, color: BOX_RED, bone: hips },
  );
  b.lathe(
    [
      [0.0, 0],
      [0.062, 0],
      [0.062, 0.012],
      [0.0, 0.012],
    ],
    { at: PB, segments: 8, color: BOX_DARK, bone: hips },
  );
  b.lathe(
    [
      [0.049, 0.118],
      [0.054, 0.118],
      [0.054, 0.128],
      [0.049, 0.128],
    ],
    { at: PB, segments: 8, color: GOLD, bone: hips },
  );
  b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { bone: hips, at: [PB[0], 0.204, PB[2]], flat: true });
  b.decal(box, slotTex, {
    at: [PB[0] - 0.02, 0.165, 0.3],
    dir: [-0.1, 0, 1],
    size: [0.048, 0.024],
    lift: 0.003,
    bone: hips,
  });
  b.decal(box, plateTex, {
    at: [PB[0] - 0.012, 0.085, 0.3],
    dir: [-0.1, 0, 1],
    size: [0.04, 0.04],
    lift: 0.003,
    bone: hips,
  });

  // ---- envelope cards, flowers, grass, sparkles ------------------------------------------------------------
  b.cards([frame([-0.14, 0.001, 0.14], [0, 1, 0])], ENV_PINK, {
    size: [0.085, 0.057],
    lean: 90,
    flow: [0.4, 0, -1],
    mirror: true,
    bone: hips,
  });
  b.cards([frame([-0.07, 0.001, 0.2], [0, 1, 0])], ENV_SKY, {
    size: [0.075, 0.05],
    lean: 90,
    flow: [-0.5, 0, -1],
    mirror: true,
    bone: hips,
  });
  b.cards([frame([0.285, 0.0, 0.1], [0, 1, 0])], ENV_CREAM, {
    size: [0.09, 0.06],
    lean: 22,
    flow: [0.1, 0, -1],
    mirror: true,
    bone: hips,
  });
  const grassFrames = [
    [0.2, 0.06],
    [0.34, 0.1],
    [0.35, -0.02],
    [0.25, -0.05],
    [-0.19, 0.02],
    [-0.2, 0.13],
    [0.12, 0.17],
    [-0.02, 0.2],
  ].map(([x, z]) => frame([x, 0, z], [0, 1, 0]));
  b.cards(grassFrames, grassTex, { size: [0.05, 0.05], vary: 0.25, rng: rng(9), cross: true, bone: hips });
  b.cards(
    [
      [0.17, 0.11],
      [0.33, 0.14],
      [-0.17, 0.08],
    ].map(([x, z]) => frame([x, 0, z], [0, 1, 0])),
    daisyTex,
    { size: [0.04, 0.052], cross: true, bone: hips },
  );
  b.cards(
    [frame([0.27, 0.36, 0.08], [0, 1, 0]), frame([-0.2, 0.34, 0.07], [0, 1, 0]), frame([0.33, 0.23, 0.1], [0, 1, 0])],
    sparkleTex,
    { size: 0.028, flow: [0, 0, 1], cross: true, lean: 0, bone: chestJoint },
  );

  // ---- rest pose: a small smile ----------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  void snout;
  void flapPlate;
  return b.root;
}
