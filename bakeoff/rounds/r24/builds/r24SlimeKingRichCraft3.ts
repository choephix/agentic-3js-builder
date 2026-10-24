import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  offset,
  catmull,
  paint,
  mix,
  smoothstep,
  cells,
  rgb,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Crowned Slime King",
  description:
    "A huge, grinning Dragon Quest style king slime: cel-shaded jelly body with bubbles and a glossy highlight, a lolling tongue on a hinged jaw, a jewelled arched crown, an ermine collar and a red royal cape.",
};

type Outline = ([number, number] | [number, number, "sharp"])[];

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints (Toriyama-style: flat hard-edged tone bands, one key light from the viewer's upper left)

const INK = "#1a1030";
const LIGHT = new THREE.Vector3(-0.4, 0.8, 0.45).normalize();

const S_SPEC = "#b4eeff";
const S_HI = "#5fc3ff";
const S_MID = "#2f88ee";
const S_LOW = "#1f57cb";
const S_FLOOR = "#173fa8";

const SLIME = paint((p, n) => {
  const l = n.dot(LIGHT);
  const tone = l > 0.82 ? S_SPEC : l > 0.3 ? S_HI : l > -0.3 ? S_MID : S_LOW;
  let c = rgb(tone);
  const cl = cells(p, 0.34, 5);
  if (cl.d1 < 0.2 && cl.id < 0.4 && p.y > 0.12) c = mix(c, [1, 1, 1], 0.18);
  c = mix(c, rgb(S_FLOOR), 0.5 * (1 - smoothstep(0, 0.25, p.y)));
  return c;
});

const PUDDLE = paint((p, n) => {
  const cl = cells(p, 0.3, 9);
  if (n.y > 0.5) {
    if (cl.d1 < 0.16 && cl.id < 0.45) return "#8ad8ff";
    return "#58b9ff";
  }
  return n.dot(LIGHT) > 0 ? "#2f86ee" : "#1f57cb";
});

const goldPaint = (engrave: boolean) =>
  paint((_p, n, s) => {
    const l = n.dot(LIGHT);
    const lit = l > 0.7 ? "#fff6b0" : l > 0.15 ? "#ffd84a" : l > -0.4 ? "#e0a020" : "#a8680f";
    if (engrave) {
      const a = (((s[1] / 36) % 1) + 1) % 1;
      const v = s[0] / 0.17;
      const d = Math.abs(a - 0.5) * 1.2 + Math.abs(v - 0.5);
      if (d < 0.3 && d > 0.2) return l > -0.4 ? "#9a5f0e" : "#6e4208";
      if (d < 0.07) return "#c4380f";
    }
    return lit;
  });
const GOLD = goldPaint(false);
const GOLD_BAND = goldPaint(true);

const VELVET = paint((p, n) => {
  const l = n.dot(LIGHT);
  const base = l > 0.5 ? "#f0404c" : l > -0.2 ? "#c8202e" : "#8f1424";
  const t = cells(p, 0.07, 3);
  return t.d1 < 0.12 ? mix(base, "#ffffff", 0.12) : base;
});

const ERMINE = paint((p, n) => {
  const c = cells(p, 0.075, 11);
  const shade = n.dot(LIGHT) > -0.3 ? 1 : 0.86;
  const col = c.d1 < 0.2 && c.id < 0.55 ? rgb("#2b2233") : rgb("#fbf5ea");
  return [col[0] * shade, col[1] * shade, col[2] * shade];
});

const CAPE = paint((p, n, s) => {
  if (s[0] > 0.925) return ERMINE;
  if (s[0] > 0.895) return "#f2b82e";
  const f = 0.5 + 0.5 * Math.sin(p.x * 8.5);
  const lit = n.dot(LIGHT) > -0.1 ? "#cf2433" : "#a21a28";
  return mix(lit, "#7a0f1f", 0.28 * f);
});

const TONGUE = paint((_p, _n, s) => (Math.abs(s[0]) < 0.011 && s[1] < -0.03 ? "#d63e69" : "#ff7f9d"));
const LIP = "#6cc6ff";

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const EYE = svg(
  `<svg viewBox="0 0 36 52" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11 Q18 1 32 10" stroke="${INK}" stroke-width="4.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="18" cy="32" rx="13.5" ry="18.5" fill="${INK}"/>
    <ellipse cx="12.6" cy="23.5" rx="5.2" ry="7" fill="#ffffff"/>
    <circle cx="23" cy="41" r="2.7" fill="#ffffff"/>
    <circle cx="24.6" cy="34" r="1.5" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3f0818"/><stop offset="1" stop-color="#a02444"/>
    </linearGradient></defs>
    <path d="M9 6 Q60 13 111 6 Q104 44 60 46 Q16 44 9 6Z" fill="url(#m)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M30 9.5 L41 11 L35.5 21Z" fill="#fff6e8" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M79 11 L90 9.5 L84.5 21Z" fill="#fff6e8" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M4 14 Q0 8 5 2" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M116 14 Q120 8 115 2" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);

const SHINE = svg(
  `<svg viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 60 Q-4 22 34 4 Q16 26 18 60 Q13 64 8 60Z" fill="#f4ffff"/>
    <circle cx="30" cy="62" r="4.6" fill="#f4ffff"/>
  </svg>`,
  { size: 256 },
);

const STAR = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 1 L24.5 15.5 L39 20 L24.5 24.5 L20 39 L15.5 24.5 L1 20 L15.5 15.5Z" fill="#fff9c8" stroke="#ffd23a" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "slimeKing" });

  // --- skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.04, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.25, 0],
      [0, 0.55, 0],
      [0, 0.85, 0],
      [0, 1.15, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.85, 0],
    aim: [0, 0.85, 0.6],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.55, 0.35],
    aim: [0, 0.55, 0.9],
    role: "jaw",
  });
  const torso = spine.joints[1];

  // --- gooey skirt ---------------------------------------------------------------------------------------------
  const puddlePts: [number, number][] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r = 1.14 + 0.06 * Math.sin(a * 7) + 0.035 * Math.sin(a * 3 + 1.2);
    puddlePts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  b.extrude(puddlePts, {
    at: [0, 0.035, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    bevel: 0.02,
    color: PUDDLE,
    bone: hips,
    name: "puddle",
  });

  // --- body ----------------------------------------------------------------------------------------------------
  const profile: Outline = [
    [0, 0, "sharp"],
    [0.55, 0],
    [0.82, 0.05],
    [0.96, 0.2],
    [1.0, 0.38],
    [0.94, 0.6],
    [0.8, 0.85],
    [0.6, 1.07],
    [0.38, 1.22],
    [0.2, 1.3],
    [0, 1.33, "sharp"],
  ];
  const body = b.lathe(profile, {
    at: [0, 0, 0],
    axis: [0, 1, 0],
    segments: 18,
    smoothing: 1,
    color: SLIME,
    bone: torso,
    name: "body",
  });
  const skin = b.surface(body);
  const front = (x: number, y: number) => skin.ray([x, y, 3], [0, 0, -1]);

  // jelly bubbles
  const rb = rng(7);
  const bubbleHits = skin.scatter(16, {
    rng: rb,
    minDist: 0.2,
    filter: (h) => h.at.y > 0.1 && h.at.y < 0.75 && !(h.n.z > 0.3 && h.at.y > 0.28 && Math.abs(h.at.x) < 0.7),
  });
  for (const h of bubbleHits) {
    const r = 0.03 + 0.035 * rb();
    b.stick(new THREE.SphereGeometry(r, 8, 6), "#d8f6ff", h, { embed: 0.4, flat: true });
  }

  // --- face ----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const h = front(s * 0.31, 0.8);
    if (h)
      b.decal(body, EYE, {
        at: h.at,
        dir: [0, 0, 1],
        size: [0.2, 0.29],
        mirror: s > 0,
        bone: head,
        name: s > 0 ? "eyeL" : "eyeR",
      });
  }
  const mh = front(0, 0.5);
  if (mh)
    b.decal(body, MOUTH, {
      at: mh.at,
      dir: [0, 0, 1],
      size: [0.84, 0.35],
      segments: 18,
      bone: head,
      name: "mouth",
    });

  // glossy highlight
  const shineHit = skin.around([0, 0.65, 0]).at(-38, 38);
  if (shineHit)
    b.decal(body, SHINE, {
      at: shineHit,
      size: [0.14, 0.245],
      roll: -15,
      bone: torso,
      name: "shine",
    });

  // upper lip (head) and lower lip (jaw)
  const upperLip = skin.drape(
    catmull([
      [-0.41, 0.65, 1.2],
      [-0.2, 0.635, 1.2],
      [0, 0.63, 1.2],
      [0.2, 0.635, 1.2],
      [0.41, 0.65, 1.2],
    ]),
    { lift: 0.02 },
  );
  b.sweep(upperLip, 0.026, { color: LIP, bone: head, sides: 6, name: "upperLip" });
  const lowerLip = skin.drape(
    catmull([
      [-0.41, 0.62, 1.2],
      [-0.34, 0.46, 1.2],
      [-0.17, 0.36, 1.2],
      [0, 0.32, 1.2],
      [0.17, 0.36, 1.2],
      [0.34, 0.46, 1.2],
      [0.41, 0.62, 1.2],
    ]),
    { lift: 0.02 },
  );
  b.sweep(lowerLip, 0.03, { color: LIP, bone: jaw, sides: 6, name: "lowerLip" });

  // lolling tongue
  const th = front(0, 0.4);
  if (th)
    b.extrude(
      [
        [-0.1, 0],
        [0.1, 0],
        [0.13, -0.1],
        [0.08, -0.19],
        [0, -0.22],
        [-0.08, -0.19],
        [-0.13, -0.1],
      ],
      {
        at: [0, 0.45, th.at.z + 0.045],
        x: [1, 0, 0],
        y: [0, 1, -0.35],
        thickness: 0.035,
        bevel: 0.01,
        smoothing: 1,
        color: TONGUE,
        bone: jaw,
        name: "tongue",
      },
    );

  // --- ermine collar, clasp and cape --------------------------------------------------------------------------
  const collarPath = skin.loop([0, 1.08, 0], { lift: 0.04 });
  b.sweep(collarPath, 0.075, { color: ERMINE, sides: 8, name: "collar" });
  const ch = front(0, 1.08);
  if (ch) {
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.035, 10), GOLD, {
      at: offset(ch, ch, 0.1),
      dir: ch.n,
      bone: torso,
      name: "claspPlate",
    });
    glow(
      b.part(new THREE.IcosahedronGeometry(0.05, 0), "#ff2b4a", {
        at: offset(ch, ch, 0.13),
        dir: ch.n,
        bone: torso,
        name: "claspRuby",
      }),
      0.8,
    );
  }

  b.loft(
    [
      { at: [0, 1.06, -0.66], w: 0.7, h: 0.05 },
      { at: [0, 0.75, -0.98], w: 1.35, h: 0.05 },
      { at: [0, 0.4, -1.22], w: 2.0, h: 0.05 },
      { at: [0, 0.04, -1.42], w: 2.7, h: 0.05 },
    ],
    { color: CAPE, bone: torso, caps: "flat", name: "cape" },
  );

  // --- crown ---------------------------------------------------------------------------------------------------
  const CROWN = new THREE.Vector3(0, 1.2, -0.02);
  const TQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0, -0.1));
  const cp = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(TQ).add(CROWN);
  const cd = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(TQ).normalize();
  const axis = cd(0, 1, 0);

  // red velvet cushion
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.36, 0],
      [0.37, 0.08],
      [0.32, 0.16],
      [0.21, 0.23],
      [0.1, 0.28],
      [0, 0.3, "sharp"],
    ],
    { at: cp(0, 0.04, 0), axis, segments: 14, smoothing: 1, color: VELVET, bone: head, name: "cushion" },
  );
  // engraved band
  b.lathe(
    [
      [0.37, 0],
      [0.41, 0],
      [0.44, 0.17],
      [0.4, 0.17],
    ],
    { at: cp(0, 0, 0), axis, segments: 16, color: GOLD_BAND, bone: head, name: "crownBand" },
  );
  const circ = (y: number, r: number, n = 14) =>
    catmull(
      Array.from({ length: n }, (_, i) =>
        cp(r * Math.sin((i / n) * Math.PI * 2), y, r * Math.cos((i / n) * Math.PI * 2)),
      ),
      { closed: true },
    );
  b.sweep(circ(0.01, 0.4), 0.022, { color: GOLD, bone: head, sides: 6, name: "rimLow" });
  b.sweep(circ(0.17, 0.425), 0.022, { color: GOLD, bone: head, sides: 6, name: "rimHigh" });

  for (let i = 0; i < 8; i++) {
    const th2 = (i * Math.PI) / 4;
    const sx = Math.sin(th2);
    const cz = Math.cos(th2);
    const tall = i % 2 === 0;
    const len = tall ? 0.22 : 0.14;
    const baseP = cp(0.41 * sx, 0.16, 0.41 * cz);
    const dir = cd(0.18 * sx, 1, 0.18 * cz);
    b.spike(baseP, dir, len, 0.065, { color: GOLD, bone: head, sides: 6, name: `spike${i}` });
    b.part(new THREE.SphereGeometry(0.038, 8, 6), GOLD, {
      at: baseP.clone().addScaledVector(dir, len + 0.01),
      bone: head,
      name: `spikeBall${i}`,
    });
    // band jewel
    const gemColors = ["#ff2b4a", "#2fe08a", "#2f6bff", "#2fe08a"];
    const big = i === 0;
    glow(
      b.part(new THREE.IcosahedronGeometry(big ? 0.075 : 0.045, 0), gemColors[(i >> 1) % 4], {
        at: cp(0.43 * sx, 0.085, 0.43 * cz),
        dir: cd(sx, 0, cz),
        scale: [1, 0.55, 1],
        bone: head,
        flat: true,
        name: `gem${i}`,
      }),
      0.8,
    );
    // pearl between jewels
    const th3 = th2 + Math.PI / 8;
    b.part(new THREE.SphereGeometry(0.024, 6, 5), "#fff4e6", {
      at: cp(0.435 * Math.sin(th3), 0.085, 0.435 * Math.cos(th3)),
      bone: head,
      name: `pearl${i}`,
    });
  }

  const arch = (phi: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 4 - 1;
      pts.push(cp(0.41 * u * Math.sin(phi), 0.17 + 0.2 * Math.cos((u * Math.PI) / 2), 0.41 * u * Math.cos(phi)));
    }
    return catmull(pts);
  };
  b.sweep(arch(0), 0.022, { color: GOLD, bone: head, sides: 6, name: "archA" });
  b.sweep(arch(Math.PI / 2), 0.022, { color: GOLD, bone: head, sides: 6, name: "archB" });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), GOLD, { at: cp(0, 0.395, 0), bone: head, name: "orb" });
  b.part(new THREE.BoxGeometry(0.03, 0.12, 0.03), GOLD, { at: cp(0, 0.48, 0), quat: TQ, bone: head, name: "crossV" });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.03), GOLD, { at: cp(0, 0.5, 0), quat: TQ, bone: head, name: "crossH" });
  glow(
    b.part(new THREE.IcosahedronGeometry(0.02, 0), "#ff2b4a", {
      at: cp(0, 0.5, 0.025),
      bone: head,
      flat: true,
      name: "crossGem",
    }),
    0.9,
  );

  // twinkles
  for (const [x, y, z, sz] of [
    [-0.56, 0.3, 0.12, 0.24],
    [0.58, 0.18, 0.15, 0.16],
  ] as const) {
    const pos = cp(x, y, z);
    glow(
      b.cards([frame(pos.clone().add(new THREE.Vector3(0, -sz / 2, 0)), [0, 1, 0])], STAR, {
        size: sz,
        lean: 0,
        flow: [0, 0, 1],
        bone: head,
        sink: 0,
      }),
      1,
    );
  }

  return b.root;
}
