// STYLE: NEEDLE-FELT APPLIQUÉ FOLK PLUSH.
// The sloth is a hand-sewn wool toy: felted oatmeal pieces with blanket-stitch zig-zag seams in cream thread,
// button eyes, a stitched smile, cut-felt fur tufts, embroidered flowers and rosettes on the flanks, and a
// thread-wrapped branch with felt leaves and a little hang-tag. Everything is flat wool colour plus thread.

import * as THREE from "three";
import {
  arc,
  catmull,
  createBuilder,
  frame,
  limb,
  mix,
  noise,
  paint,
  rgb,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";

// ------------------------------------------------------------------------------------------------ constants
const Y = (v: number) => v - 0.035; // global drop so the hanging back just kisses the floor
const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const BY = Y(0.2); // body axis height
const BRY = Y(0.52); // branch axis height
const GRIP_R = 0.052; // radius of the claw arcs round the branch
const H = 1.0; // head scale constant

// felt palette
const OAT = "#c8b08a";
const OAT_D = "#a08560";
const CREAM = "#f1e6c6";
const SAGE = "#8fa86a";
const BROWN = "#5b3d2a";
const DBROWN = "#3c271b";
const TERRA = "#d9825a";
const TEAL = "#2f7f86";
const THREAD = "#fff1c9";
const BARK = "#6b4a34";
const BARK_D = "#46301f";
const CLAW = "#efe3be";
const CLAW_TIP = "#b99e62";
const PINK = "#e98aa0";
const NOSE = "#3b2418";

type C3 = readonly [number, number, number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const zig = (x: number) => Math.abs((x - Math.floor(x)) * 2 - 1);
const mod = (x: number, m: number) => ((x % m) + m) % m;

/** Felt look: fine fibre noise, soft cloudy drift, and warmer light from above. */
function tone(c: C3, p: THREE.Vector3, n: THREE.Vector3, seed: number): C3 {
  const k = 1 + (noise(p, 0.006, seed) - 0.5) * 0.2 + (noise(p, 0.07, seed + 7) - 0.5) * 0.14;
  const l = 0.86 + 0.14 * smoothstep(-0.8, 0.8, n.y);
  const f = k * l;
  return [clamp01(c[0] * f), clamp01(c[1] * f), clamp01(c[2] * f)];
}

function coatAt(p: THREE.Vector3, n: THREE.Vector3): C3 {
  let c = mix(OAT, OAT_D, smoothstep(0.4, 0.62, noise(p, 0.05, 3)));
  c = mix(c, SAGE, 0.8 * smoothstep(0.6, 0.66, noise(p, 0.09, 11)));
  return tone(c, p, n, 5);
}

const coatPaint = paint((p, n) => coatAt(p, n));
const creamPaint = paint((p, n) => tone(rgb(CREAM), p, n, 4));
const pawPaint = paint((p, n) => tone(mix(BROWN, DBROWN, smoothstep(0.3, 0.7, noise(p, 0.04, 8))), p, n, 9));
const cardTint = paint((p, n) => (n.y > 0.4 ? tone(rgb(CREAM), p, n, 4) : coatAt(p, n)));

/** Body: cream belly (the side that faces the branch) joined to the coat by a stitched blanket-stitch zig-zag. */
function bodyPaint(len: number) {
  return paint((p, n, s) => {
    const d = mod(s[1], 360);
    const a = d > 180 ? 360 - d : d;
    const along = s[0] * len;
    const edge = 66 + 9 * zig(along / 0.05);
    if (Math.abs(a - edge) < 1.1 && Math.floor(along / 0.008) % 2 === 0) return tone(rgb(THREAD), p, n, 2);
    if (a < edge) {
      if (Math.abs(a - 28) < 0.9 && Math.floor(along / 0.012) % 2 === 0) return tone(mix(CREAM, SAGE, 0.55), p, n, 6);
      return tone(rgb(CREAM), p, n, 4);
    }
    return coatAt(p, n);
  });
}

/** Limbs: coat upper part, brown forearm joined by a stitched seam, terracotta cuff at the wrist. */
function limbPaint(len: number) {
  return paint((p, n, s) => {
    const bound = 0.5 + 0.03 * zig(s[1] / 40);
    const seam = Math.abs(s[0] - bound) * len;
    if (seam < 0.0022 && Math.floor(mod(s[1], 360) / 9) % 2 === 0) return tone(rgb(THREAD), p, n, 2);
    if (s[0] > 0.88 && s[0] < 0.94) return tone(rgb(TERRA), p, n, 12);
    if (s[0] >= bound) return tone(mix(BROWN, DBROWN, smoothstep(0.3, 0.7, noise(p, 0.04, 8))), p, n, 9);
    return coatAt(p, n);
  });
}

/** Branch: brown felt wound with a spiral of cream thread. */
const barkPaint = paint((p, n, s) => {
  const k = mod(s[1] - 6200 * s[0], 360);
  if (k < 11) return tone(rgb(THREAD), p, n, 2);
  return tone(mix(BARK, BARK_D, smoothstep(0.35, 0.7, noise(p, 0.05, 31))), p, n, 33);
});

function leafPaint(base: string, seed: number) {
  return paint((p, n, s) => {
    const ay = Math.abs(s[1]);
    const mid = ay < 0.0026;
    const side = s[0] > 0.035 && s[0] < 0.13 && Math.abs(ay - (s[0] - 0.03) * 0.55) < 0.002;
    if ((mid || side) && Math.floor(s[0] / 0.008) % 2 === 0) return tone(rgb(THREAD), p, n, 2);
    return tone(rgb(base), p, n, seed);
  });
}

const ell = (rx: number, ry: number, rz: number, w = 12, h = 8) => new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);

const keyed = (k: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
  const i = Math.min(Math.floor(x), k.length - 2);
  const e = (1 - Math.cos((x - i) * Math.PI)) / 2;
  return k[i] * (1 - e) + k[i + 1] * e;
};

export const meta = {
  name: "Felt Appliqué Sloth",
  description:
    "A three-toed sloth hanging from a thread-wrapped branch, sewn from needle-felted wool: stitched seams, button eyes, cut-felt fur tufts, embroidered flowers and rosettes, felt leaves and a hang-tag.",
};

// ------------------------------------------------------------------------------------------------ textures
function makeTextures() {
  const TUFT_A = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 80 C2 52 10 24 20 2 C30 24 38 52 37 80Z" fill="#f0f0f0" stroke="#767676" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 70 L20 18" stroke="#9c9c9c" stroke-width="2.6" stroke-dasharray="6 5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const TUFT_B = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 80 C2 54 6 30 11 3 C16 22 19 30 20 38 C21 30 24 22 29 3 C34 30 38 54 37 80Z" fill="#ececec" stroke="#767676" stroke-width="3" stroke-linejoin="round"/>
      <path d="M12 70 L12 24 M28 70 L28 24" stroke="#a0a0a0" stroke-width="2.4" stroke-dasharray="5 5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const MOSS = svg(
    `<svg viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 70 C4 44 8 22 12 4 C18 24 20 48 20 70Z" fill="#6e9a4b" stroke="#2f5a2a" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M16 70 C20 40 28 20 36 2 C38 26 36 50 38 70Z" fill="#8fbf5c" stroke="#2f5a2a" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M11 62 L12 22 M30 62 L34 20" stroke="#d6efa0" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const FACE = svg(
    `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 8 C150 6 192 38 190 82 C188 124 150 144 100 144 C50 144 12 124 10 82 C8 38 50 10 100 8Z" fill="#f4e8c8"/>
      <path d="M100 8 C150 6 192 38 190 82 C188 124 150 144 100 144 C50 144 12 124 10 82 C8 38 50 10 100 8Z" fill="none" stroke="#c9ad74" stroke-width="2.6" stroke-dasharray="7 5" transform="translate(100 76) scale(0.93) translate(-100 -76)"/>
      <g transform="rotate(-22 60 70)">
        <ellipse cx="60" cy="70" rx="48" ry="28" fill="#4b3324"/>
        <ellipse cx="60" cy="70" rx="43" ry="23.5" fill="none" stroke="#e6cf9a" stroke-width="2" stroke-dasharray="5 4"/>
      </g>
      <g transform="rotate(22 140 70)">
        <ellipse cx="140" cy="70" rx="48" ry="28" fill="#4b3324"/>
        <ellipse cx="140" cy="70" rx="43" ry="23.5" fill="none" stroke="#e6cf9a" stroke-width="2" stroke-dasharray="5 4"/>
      </g>
      <circle cx="30" cy="104" r="13" fill="#e98aa0"/><circle cx="170" cy="104" r="13" fill="#e98aa0"/>
      <path d="M24 98 l12 12 M36 98 l-12 12 M164 98 l12 12 M176 98 l-12 12" stroke="#b9506c" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="100" cy="104" rx="50" ry="28" fill="#fbf1d6" stroke="#c9ad74" stroke-width="2.2" stroke-dasharray="6 4"/>
      <path d="M68 108 Q100 134 132 108" fill="none" stroke="#4b3324" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M68 108 l-5 -6 M132 108 l5 -6" stroke="#4b3324" stroke-width="3" stroke-linecap="round"/>
      <path d="M82 118 l0 5 M100 122 l0 5 M118 118 l0 5" stroke="#c9ad74" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );
  const BUTTON = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#f1e6c6"/>
      <circle cx="50" cy="50" r="43" fill="none" stroke="#b79a64" stroke-width="3" stroke-dasharray="8 6"/>
      <circle cx="50" cy="50" r="35" fill="#1b110d"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="#3f2a1e" stroke-width="3"/>
      <ellipse cx="38" cy="37" rx="12" ry="8.5" fill="#ffffff" transform="rotate(-30 38 37)"/>
      <circle cx="64" cy="65" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 192 },
  );
  const leaf = (x: number, y: number, rot: number, fill: string) =>
    `<g transform="rotate(${rot} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="17" ry="7.5" fill="${fill}" stroke="#244a30" stroke-width="2.4"/><path d="M${x - 11} ${y} L${x + 11} ${y}" stroke="#e9f5c4" stroke-width="1.6" stroke-dasharray="4 3" fill="none"/></g>`;
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    petals += `<circle cx="${(60 + 14 * Math.sin(a)).toFixed(1)}" cy="${(38 - 14 * Math.cos(a)).toFixed(1)}" r="9.5" fill="#ffd35a" stroke="#9a6a14" stroke-width="2.2"/>`;
  }
  const FLORA = svg(
    `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="114" height="154" rx="30" fill="#d9825a" stroke="#7a3d26" stroke-width="3"/>
      <rect x="11" y="11" width="98" height="138" rx="24" fill="none" stroke="#fff1c9" stroke-width="2.4" stroke-dasharray="7 5" stroke-linecap="round"/>
      <path d="M60 142 C54 112 68 86 60 52" fill="none" stroke="#244a30" stroke-width="5" stroke-linecap="round"/>
      <path d="M60 142 C54 112 68 86 60 52" fill="none" stroke="#9ccf7e" stroke-width="1.6" stroke-dasharray="5 5"/>
      ${leaf(42, 120, -28, "#7fb06a")}${leaf(79, 112, 28, "#6a9d5a")}${leaf(43, 90, -32, "#6a9d5a")}${leaf(78, 78, 30, "#7fb06a")}
      ${petals}
      <circle cx="60" cy="38" r="8" fill="#c0392b" stroke="#6a1a12" stroke-width="2"/><circle cx="60" cy="38" r="2.6" fill="#fff1c9"/>
      <circle cx="30" cy="30" r="2.6" fill="#fff1c9"/><circle cx="90" cy="30" r="2.6" fill="#fff1c9"/>
      <circle cx="30" cy="132" r="2.6" fill="#fff1c9"/><circle cx="90" cy="132" r="2.6" fill="#fff1c9"/>
    </svg>`,
    { size: 256 },
  );
  let rosPetals = "";
  for (let i = 0; i < 8; i++)
    rosPetals += `<ellipse cx="50" cy="27" rx="8" ry="15" fill="${i % 2 ? "#e8b84a" : "#f3d27a"}" stroke="#8a5a14" stroke-width="2" transform="rotate(${i * 45} 50 50)"/>`;
  const ROSETTE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="#2f7f86" stroke="#17464a" stroke-width="3"/>
      <circle cx="50" cy="50" r="41" fill="none" stroke="#fff1c9" stroke-width="2.4" stroke-dasharray="6 5"/>
      ${rosPetals}
      <circle cx="50" cy="50" r="12" fill="#d9825a" stroke="#7a3d26" stroke-width="2.4"/>
      <circle cx="50" cy="50" r="5" fill="#fff1c9"/>
    </svg>`,
    { size: 192 },
  );
  const TAG = svg(
    `<svg viewBox="0 0 70 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,100 70,100 70,20 55,0 15,0 0,20" fill="#2f7f86" stroke="#17464a" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="6,94 64,94 64,23 52,6 18,6 6,23" fill="none" stroke="#fff1c9" stroke-width="2" stroke-dasharray="5 4"/>
      <circle cx="35" cy="17" r="5" fill="#17464a"/>
      <text x="35" y="58" text-anchor="middle" font-family="serif" font-weight="bold" font-size="26" fill="#fff1c9">zZz</text>
      <path d="M22 80 A12 12 0 1 0 40 84 A9 9 0 1 1 22 80Z" fill="#e8b84a"/>
      <circle cx="52" cy="76" r="2.4" fill="#e8b84a"/><circle cx="58" cy="86" r="1.8" fill="#e8b84a"/>
    </svg>`,
    { size: 192 },
  );
  return { TUFT_A, TUFT_B, MOSS, FACE, BUTTON, FLORA, ROSETTE, TAG };
}

// ------------------------------------------------------------------------------------------------ build
export default function build() {
  const b = createBuilder({ name: "sloth", paintSize: 2048 });
  const T = makeTextures();
  const rand = rng(7);

  // ---- skeleton: root, spine, neck, head, jaw
  const root = b.joint("root", { at: [0, BY, -0.24] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, BY, -0.24],
      [0, BY, -0.08],
      [0, BY, 0.07],
      [0, BY + 0.015, 0.2],
    ]),
    { parent: root, names: ["hips", "spine1", "spine2"], role: "spine" },
  );
  const BODY_L = spine.length;

  const body = b.sweep(
    spine,
    (t) => {
      const r = keyed([0.085, 0.125, 0.14, 0.13, 0.105])(t);
      return [r * 1.05, r * 0.96];
    },
    { color: bodyPaint(BODY_L), sides: 14 },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, BY + 0.015, 0.2],
      [0, BY + 0.05, 0.27],
      [0, BY + 0.075, 0.325],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  b.sweep(neck, [0.085, 0.07], { color: coatPaint, sides: 12 });

  const HC = P(0, Y(0.285), 0.375);
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1).at,
    dir: [0, 0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: P(0, HC.y - 0.035, HC.z + 0.03),
    aim: P(0, HC.y - 0.04, HC.z + 0.12),
    role: "jaw",
  });

  // ---- head: skull, snout, jaw, nose, ears, eyes, brows
  const skull = b.part(ell(0.093 * H, 0.085 * H, 0.09 * H, 16, 10), coatPaint, { bone: head, at: HC });
  const snout = b.part(ell(0.05 * H, 0.034 * H, 0.046 * H, 12, 8), creamPaint, {
    bone: head,
    at: P(0, HC.y - 0.023, HC.z + 0.065),
  });
  b.part(ell(0.04 * H, 0.017 * H, 0.04 * H, 10, 6), creamPaint, {
    bone: jaw,
    at: P(0, HC.y - 0.05, HC.z + 0.065),
  });

  const skullSurf = b.surface(skull);
  const snoutSurf = b.surface(snout);
  const noseHit = snoutSurf.ray([0, HC.y - 0.002, 1], [0, 0, -1]);
  if (noseHit) b.stick(ell(0.02, 0.013, 0.016, 10, 6), NOSE, noseHit, { embed: 0.5, bone: head });

  // face drawing wrapped over skull + snout
  const faceHit = skullSurf.ray([0, HC.y, 1], [0, 0, -1]);
  if (faceHit)
    b.decal([skull, snout], T.FACE, {
      at: faceHit,
      dir: [0, 0, 1],
      size: [0.17 * H, 0.128 * H],
      segments: 30,
      color: "#ffffff",
      bone: head,
    });

  // button eyes
  for (const s of [1, -1]) {
    const hit = skullSurf.ray([s * 0.034 * H, HC.y + 0.004, 1], [0, 0, -1]);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 14), CREAM, hit, { embed: 0.4, bone: head });
    b.part(new THREE.CircleGeometry(0.0215, 16), "#ffffff", {
      bone: head,
      at: hit.moved([0, 0.0076, 0]),
      dir: hit.n,
      axis: "z",
      texture: T.BUTTON,
    });
    // stitched brow
    const brow = skullSurf.drape(
      catmull([
        [s * 0.012, HC.y + 0.038, 0.47],
        [s * 0.036, HC.y + 0.046, 0.462],
        [s * 0.06, HC.y + 0.038, 0.442],
      ]),
      { lift: 0.002 },
    );
    b.sweep(brow, 0.0028, { color: DBROWN, sides: 5, bone: head });
    // ear: felt nub with a pink inner circle
    const earAt = P(s * 0.087 * H, HC.y + 0.037, HC.z - 0.03);
    b.part(ell(0.016, 0.022, 0.022, 10, 6), OAT_D, { bone: head, at: earAt });
    b.part(new THREE.CircleGeometry(0.0115, 10), PINK, {
      bone: head,
      at: earAt.clone().add(P(s * 0.0125, 0, 0)),
      dir: [s, 0.1, 0.1],
      axis: "z",
    });
  }

  // head fur: fringe and ruff
  {
    const hits = skullSurf.scatter(46, {
      rng: rand,
      minDist: 0.028,
      filter: (h) => !(h.n.z > 0.3 && h.at.y < HC.y + 0.06),
    });
    b.cards(hits, [T.TUFT_A, T.TUFT_B], {
      size: [0.03, 0.045],
      lean: 62,
      bend: 20,
      flow: (f) => (f.axis.y > 0.85 ? [0, 0, -1] : [0, -1, -0.15]),
      vary: 0.25,
      spin: 20,
      rng: rng(21),
      color: coatPaint,
      bone: head,
    });
  }

  // ---- tail stub
  const rump = b.surface(body).ray([0, BY, -1], [0, 0, 1]);
  if (rump)
    b.sprout("tail", rump, P(0, BY - 0.015, -0.4), [0.045, 0.02], {
      count: 2,
      names: ["tail1", "tail2"],
      role: "tail",
      color: creamPaint,
      sides: 8,
    });

  // ---- limbs with claws that hook over the branch
  const buildLimb = (fore: boolean, s: number) => {
    const side = s > 0 ? "L" : "R";
    const zh = fore ? 0.2 + s * 0.02 : -0.26 + s * 0.02;
    const shoulder = P(s * (fore ? 0.09 : 0.078), Y(fore ? 0.3 : 0.265), fore ? 0.1 : -0.19);
    const wrist = P(s * 0.05, BRY - 0.048, zh);
    const pts = limb(shoulder, wrist, fore ? [0.15, 0.165] : [0.125, 0.14], [[s, 0, fore ? -0.25 : 0.25]]);
    const names = fore ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`] : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const chain = b.chain(`${fore ? "arm" : "leg"}${side}`, pts, {
      parent: fore ? spine.joints[2] : spine.joints[0],
      names,
      role: fore ? "arm" : "leg",
    });
    const tip = chain.tip!;
    const sweep = b.sweep(chain, [0.05, 0.043, 0.032, 0.027], { color: limbPaint(chain.length), sides: 10 });
    // stitched cuff threads
    const skin = b.surface(sweep);
    for (const t of [0.88, 0.94]) b.sweep(skin.loop(chain.at(t), { lift: 0.002 }), 0.0022, { color: THREAD, sides: 5 });
    // paw
    b.part(ell(0.028, 0.03, 0.042, 10, 7), pawPaint, { bone: tip, at: P(s * 0.049, BRY - 0.033, zh) });
    // three claws wrapping the branch
    for (let j = -1; j <= 1; j++) {
      const zc = zh + j * 0.022;
      const ang = (20 * Math.PI) / 180;
      const center = P(0, BRY, zc);
      const from = P(s * GRIP_R * Math.cos(ang), BRY - GRIP_R * Math.sin(ang), zc);
      const nm = `${fore ? "fore" : "hind"}Claw${side}${j + 2}`;
      const claw = b.chain(nm, arc(center, from, [0, 0, s], 92), {
        parent: tip,
        names: [`${nm}a`, `${nm}b`],
        role: "digit",
      });
      b.sweep(claw, [0.0105, 0.002], {
        color: (t: number) => (t < 0.72 ? CLAW : CLAW_TIP),
        caps: { start: "flat", end: "point" },
        sides: 6,
      });
      b.part(ell(0.0135, 0.014, 0.0135, 8, 6), pawPaint, { bone: tip, at: from });
    }
    // elbow / knee rosette
    const jointAt = chain.joints[1].at.clone().add(P(s * 0.1, 0, fore ? -0.04 : 0.04));
    const hit = b.surface(sweep).nearest(jointAt);
    b.decal(sweep, T.ROSETTE, { at: hit, size: [0.055, 0.055], segments: 12, color: "#ffffff" });
    // fur tufts on the limb
    const hits = b.surface(sweep).scatter(14, { rng: rand, minDist: 0.04, filter: (h) => h.n.y > -0.3 });
    b.cards(hits, [T.TUFT_A, T.TUFT_B], {
      size: [0.028, 0.045],
      lean: 60,
      bend: 20,
      flow: [0, -1, -0.1],
      vary: 0.25,
      spin: 20,
      rng: rng(31 + (fore ? 0 : 5) + (s > 0 ? 0 : 2)),
      color: coatPaint,
    });
    return { chain, sweep };
  };
  for (const s of [1, -1]) {
    buildLimb(true, s);
    buildLimb(false, s);
  }

  // ---- embroidered flanks
  for (const s of [1, -1]) {
    b.decal(body, T.FLORA, {
      at: P(s * 0.125, BY - 0.06, -0.03),
      dir: P(s, -0.45, 0).normalize(),
      size: [0.1, 0.14],
      segments: 14,
      color: "#ffffff",
    });
    b.decal(body, T.ROSETTE, {
      at: P(s * 0.1, BY - 0.07, -0.18),
      dir: P(s, -0.45, 0).normalize(),
      size: [0.08, 0.08],
      segments: 12,
      color: "#ffffff",
    });
  }

  // ---- body fur: cut-felt tufts and algae moss
  {
    const skinBody = b.surface(body);
    const skipFlank = (h: { n: THREE.Vector3; at: THREE.Vector3 }) =>
      Math.abs(h.n.x) > 0.5 && h.at.y < BY + 0.07 && h.at.z > -0.26 && h.at.z < 0.05;
    const hits = skinBody.scatter(230, { rng: rand, minDist: 0.03, filter: (h) => !skipFlank(h) });
    b.cards(hits, [T.TUFT_A, T.TUFT_B], {
      size: [0.045, 0.07],
      lean: 58,
      bend: 25,
      flow: (f) => (f.axis.y > 0.85 ? [0, 0, -1] : [0, -1, -0.12]),
      vary: 0.3,
      spin: 22,
      rng: rng(4),
      color: cardTint,
    });
    const moss = skinBody.scatter(26, {
      rng: rand,
      minDist: 0.06,
      filter: (h) => h.n.y < -0.3 && h.n.y > -0.95 && !skipFlank(h),
    });
    b.cards(moss, T.MOSS, {
      size: [0.035, 0.055],
      lean: 55,
      bend: 20,
      flow: [0, -1, -0.1],
      vary: 0.3,
      spin: 25,
      rng: rng(9),
    });
  }

  // ---- the branch: thread-wrapped, with felt leaves and a hang-tag
  b.sweep(
    [
      [0, BRY, -0.62],
      [0, BRY, 0.8],
    ],
    [0.042, 0.031],
    { color: barkPaint, bone: root, sides: 10 },
  );

  const addLeaf = (z: number, side: number, seed: number, col: string) => {
    const base = P(side * 0.02, BRY + 0.03, z);
    const d = P(side * 0.8, 0.45, 0.25).normalize();
    const tip = base.clone().addScaledVector(d, 0.1);
    b.rod(base, tip, [0.009, 0.006], BARK, { bone: root, sides: 6 });
    const xd = P(d.x, d.y - 0.35, d.z).normalize();
    const yd = P(0, 1, 0).addScaledVector(xd, -xd.y).normalize();
    b.extrude(
      [
        [0, 0],
        [0.03, 0.032],
        [0.09, 0.05],
        [0.16, 0, "sharp"],
        [0.09, -0.05],
        [0.03, -0.032],
      ],
      { at: tip, x: xd, y: yd, thickness: 0.005, smoothing: 1, color: leafPaint(col, seed), bone: root },
    );
  };
  addLeaf(0.64, 1, 41, "#6a9d5a");
  addLeaf(0.72, -1, 42, "#8fb867");
  addLeaf(0.5, -1, 43, "#5f8a4a");
  addLeaf(-0.5, 1, 44, "#7fb06a");
  addLeaf(-0.57, -1, 45, "#6a9d5a");

  // hang-tag on a thread loop
  {
    const tz = -0.45;
    const ringItems = b.ring(frame([0, BRY, tz], [0, 0, 1]), { count: 10, radius: 0.046 }).items;
    b.sweep(catmull(ringItems, { closed: true }), 0.004, { color: THREAD, sides: 5, bone: root });
    const top = BRY - 0.14;
    b.rod([0, BRY - 0.046, tz], [0, top, tz], 0.003, THREAD, { bone: root, sides: 5 });
    b.extrude(
      [
        [-0.035, -0.1],
        [0.035, -0.1],
        [0.035, -0.02],
        [0.02, 0],
        [-0.02, 0],
        [-0.035, -0.02],
      ],
      { at: [0, top, tz], x: [0, 0, 1], thickness: 0.006, color: TEAL, bone: root },
    );
    const planeGeo = new THREE.PlaneGeometry(0.07, 0.1);
    for (const sx of [1, -1])
      b.part(planeGeo, "#ffffff", {
        bone: root,
        at: [sx * 0.0036, top - 0.05, tz],
        dir: [sx, 0, 0],
        axis: "z",
        texture: T.TAG,
      });
  }

  return b.root;
}
