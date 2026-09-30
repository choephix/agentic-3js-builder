// Lantern Ghost: a cute flat low-poly ghost hovering 15 cm above the floor, hugging a paper-cut lantern.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Lantern Ghost",
  description:
    "A chubby little ghost with a wavy rigged sheet tail, a mouth that opens, a star-patterned nightcap and a paper-cut candle lantern, trailing sparkles.",
};

const GHOST = "#f8f4ff";
const FRILL = "#ddd2ff";
const CAP = "#8b94ff";
const CREAM = "#fff3c9";
const CAP_RED = "#c9463d";
const ROD = "#8a3a2f";
const CANDLE = "#fff6dd";

const HOVER = 0.15;

/** A star outline as an SVG path. */
function starPath(cx: number, cy: number, ro: number, ri: number, points = 5, rot = -90) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    const r = i % 2 === 0 ? ro : ri;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** A four-point sparkle outline (concave diamond). */
const sparklePath = (c: number, ro: number, ri: number) =>
  `M${c} ${c - ro}L${c + ri} ${c - ri}L${c + ro} ${c}L${c + ri} ${c + ri}L${c} ${c + ro}L${c - ri} ${c + ri}L${c - ro} ${c}L${c - ri} ${c - ri}Z`;

export default function build() {
  const b = createBuilder({ name: "lanternGhost" });

  // ---- drawings -------------------------------------------------------------------------------------------------
  const EYE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52">
      <ellipse cx="20" cy="26" rx="18" ry="25" fill="#2a1f3d"/>
      <circle cx="13.5" cy="15" r="7.5" fill="#ffffff"/>
      <circle cx="27" cy="35" r="3.8" fill="#ffffff"/>
      <circle cx="28" cy="22" r="1.8" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const BLUSH = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24">
      <ellipse cx="20" cy="12" rx="19" ry="11" fill="#ffa3bf"/>
      <path d="M9 17L13 6M17 18L21 7M25 17L29 6" stroke="#ff7ea6" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const MOUTH = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30">
      <path d="M3 4Q20 -1 37 4Q35 28 20 28Q5 28 3 4Z" fill="#4a2040"/>
      <path d="M9 22Q20 12 31 22Q28 28 20 28Q12 28 9 22Z" fill="#ff8fa8"/>
    </svg>`,
    { size: 128 },
  );
  const STAR_Y = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="${starPath(20, 21, 19, 8)}" fill="#ffe98a"/></svg>`,
    { size: 96 },
  );
  const STAR_W = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="${starPath(20, 21, 19, 8)}" fill="#ffffff"/></svg>`,
    { size: 96 },
  );
  const MOON = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M26 3A18 18 0 1 0 37 28A14 14 0 0 1 26 3Z" fill="#ffe98a"/></svg>`,
    { size: 96 },
  );

  // Paper-cut lantern panel: orange paper with punched star and dot windows the candle shines through.
  const PANEL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
      <path fill-rule="evenodd" fill="#ffa25e" d="M0 0H40V64H0Z ${starPath(20, 34, 15, 6.5, 5, -90)} M20 10.5m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0 M20 55.5m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0"/>
      <rect x="0" y="0" width="40" height="4" fill="#e0553a"/>
      <rect x="0" y="60" width="40" height="4" fill="#e0553a"/>
    </svg>`,
    { size: 192 },
  );
  const FLAME = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40">
      <path d="M12 0Q22 16 21 27Q20 38 12 38Q4 38 3 27Q2 16 12 0Z" fill="#ffb62e"/>
      <path d="M12 14Q17 24 16 30Q15 36 12 36Q9 36 8 30Q7 24 12 14Z" fill="#fff2a8"/>
    </svg>`,
    { size: 96 },
  );
  const sparkle = (fill: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="${sparklePath(20, 19, 5)}" fill="${fill}"/></svg>`,
      { size: 96 },
    );
  const SPARKS = [
    sparkle("#ffe066"),
    sparkle("#ff9ec4"),
    sparkle("#8ff0d0"),
    sparkle("#b9a6ff"),
    sparkle("#fff3c9"),
    sparkle("#ffe066"),
  ];

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const H = new THREE.Vector3(0, 0.37, 0.01);
  const HR = 0.118;
  const body = b.joint("body", { at: [0, 0.2, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, 0],
      [0, 0.265, 0.004],
      [0, 0.32, 0.008],
    ]),
    { parent: body, count: 2, role: "spine" },
  );
  const tailPath = catmull([
    [0, 0.25, -0.09],
    [0.03, 0.232, -0.155],
    [-0.035, 0.232, -0.235],
    [0.03, 0.262, -0.31],
    [-0.02, 0.315, -0.365],
  ]);
  const tail = b.chain("tail", tailPath, { parent: spine.joints[0], count: 6, role: "tail" });
  const head = b.joint("head", { parent: spine.joints[1], at: H, dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, H.y - 0.04, 0.04], aim: [0, H.y - 0.048, 0.12], role: "jaw" });
  const lantern = b.joint("lantern", { parent: spine.joints[0], at: [0, 0.2, 0.18], dir: [0, 1, 0], group: "lantern" });

  // ---- body: a chubby bell that streams back into a wavy sheet tail ----------------------------------------------
  b.sweep(spine, [0.128, 0.124, 0.105], {
    color: GHOST,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
  });
  // zigzag hem: soft points hanging round the bottom edge
  b.ring(frame([0, 0.215, 0.0], [0, 1, 0]), { count: 9, radius: 0.112 }).items.forEach((item, i) => {
    b.spike(item, [item.outward.x * 0.12, -1, item.outward.z * 0.12], 0.06, 0.05, {
      bone: spine.joints[0],
      color: i % 2 ? GHOST : FRILL,
      sides: 5,
      smooth: false,
    });
  });
  const tailSweep = b.sweep(
    tail,
    (t) => {
      const r = 0.082 * Math.pow(1 - t, 0.8) + 0.008;
      const sheet = 0.03 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.1) / 0.85)));
      return [r * 0.95 + sheet, r * 0.78];
    },
    { color: GHOST, sides: 7, smooth: false, caps: { start: "round", end: "point" } },
  );
  // zigzag fringe along both edges of the tail sheet
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const t = 0.2 + i * 0.12;
      const p = tailSweep.at(t, s * 90);
      b.spike(p, p, 0.045 * (1 - t) + 0.012, 0.022 * (1 - t) + 0.008, {
        color: i % 2 ? GHOST : FRILL,
        sides: 5,
        smooth: false,
      });
    }
  }

  // ---- head -----------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(HR, 9, 6), GHOST, {
    bone: head,
    at: H,
    scale: [1.08, 0.96, 1],
    flat: true,
    name: "skull",
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(H).at(s * 27, 8);
    if (eyeHit) b.decal(skin, EYE, { at: eyeHit, size: [0.046, 0.06], segments: 8, bone: head });
    const cheekHit = skin.around(H).at(s * 46, -12);
    if (cheekHit) b.decal(skin, BLUSH, { at: cheekHit, size: [0.04, 0.024], segments: 6, mirror: s < 0, bone: head });
  }
  const mouthHit = skin.around(H).at(0, -15);
  if (mouthHit) b.decal(skin, MOUTH, { at: mouthHit, size: [0.046, 0.034], segments: 8, bone: head });

  // lower jaw: a little chin that drops to open the mouth
  b.part(new THREE.SphereGeometry(0.026, 6, 4), GHOST, {
    bone: jaw,
    at: [0, H.y - 0.056, 0.098],
    scale: [1.15, 0.5, 0.7],
    flat: true,
    name: "chin",
  });

  // ---- nightcap ---------------------------------------------------------------------------------------------------
  const capBase = new THREE.Vector3(0, 0.435, 0.008);
  const capPath = catmull([
    capBase,
    [0, 0.48, 0.018],
    [0, 0.52, -0.03],
    [0, 0.53, -0.095],
    [0, 0.495, -0.16],
    [0, 0.44, -0.195],
    [0, 0.385, -0.21],
  ]);
  const capTube = b.sweep(capPath, [0.106, 0.094, 0.076, 0.056, 0.04, 0.026], {
    bone: head,
    color: CAP,
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "round" },
    up: [0, 0, -1],
  });
  const brimRing = b.ring(frame(capBase, [0, 1, 0.12]), { count: 10, radius: 0.102 });
  b.sweep(catmull(brimRing.items, { closed: true }), 0.017, {
    bone: head,
    color: CREAM,
    sides: 5,
    smooth: false,
  });
  b.part(new THREE.SphereGeometry(0.03, 7, 5), CREAM, { bone: head, at: [0, 0.372, -0.225], flat: true, name: "pompom" });
  const capSkin = b.surface(capTube);
  const stickers = [STAR_Y, STAR_W, MOON, STAR_Y, STAR_W];
  const r3 = rng(11);
  capSkin
    .scatter(12, { rng: rng(5), minDist: 0.055, filter: (h) => h.n.y > -0.15 })
    .forEach((hit, i) => {
      b.decal(capSkin, stickers[i % stickers.length], {
        at: hit,
        size: [0.03, 0.03],
        segments: 3,
        roll: r3() * 360,
        bone: head,
      });
    });

  // ---- arms + paper lantern ---------------------------------------------------------------------------------------
  const LZ = 0.19;
  const wallBottom = HOVER + 0.01;
  const wallH = 0.065;
  const LR = 0.04; // hexagon circumradius
  const capTop = wallBottom + wallH + 0.015;
  const handY = capTop + 0.02;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.105, 0.262, 0.04],
        [s * 0.09, 0.242, 0.125],
        [s * 0.022, handY, LZ],
      ]),
      { parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(arm, [0.02, 0.014], { color: GHOST, sides: 5, smooth: false });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GHOST, {
      bone: arm.tip ?? arm.joints[arm.joints.length - 1],
      at: [s * 0.02, handY, LZ],
      flat: true,
      name: `mitt${side}`,
    });
  }

  // lantern frame: hex caps, corner ribs, pole and knob
  b.part(new THREE.CylinderGeometry(LR * 0.92, LR * 1.12, 0.01, 6), CAP_RED, {
    bone: lantern,
    at: [0, wallBottom - 0.005, LZ],
    flat: true,
    name: "lanternBase",
  });
  b.part(new THREE.CylinderGeometry(LR * 0.55, LR * 1.12, 0.015, 6), CAP_RED, {
    bone: lantern,
    at: [0, wallBottom + wallH + 0.0075, LZ],
    flat: true,
    name: "lanternTop",
  });
  b.rod([0, capTop - 0.002, LZ], [0, handY + 0.012, LZ], 0.004, { bone: lantern, color: ROD, sides: 4, smooth: false });
  b.part(new THREE.SphereGeometry(0.008, 5, 4), CAP_RED, { bone: lantern, at: [0, handY + 0.014, LZ], flat: true, name: "knob" });
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const p = (y: number) => [LR * Math.sin(a), y, LZ + LR * Math.cos(a)];
    b.rod(p(wallBottom), p(wallBottom + wallH), 0.0035, { bone: lantern, color: ROD, sides: 4, smooth: false });
  }
  // paper panels
  const apothem = LR * Math.cos(Math.PI / 6);
  const wallFrames = [0, 1, 2, 3, 4, 5].map((k) => {
    const a = Math.PI / 6 + (k * Math.PI) / 3;
    return frame([apothem * Math.sin(a), wallBottom, LZ + apothem * Math.cos(a)], [0, 1, 0]);
  });
  glow(
    b.cards(wallFrames, PANEL, {
      size: [LR * 1.0, wallH],
      sink: 0,
      bone: lantern,
      flow: (f) => {
        const dx = f.at.x;
        const dz = f.at.z - LZ;
        return [dx, 0, dz];
      },
    }),
    1.15,
  );
  // candle and flame inside
  b.part(new THREE.CylinderGeometry(0.008, 0.009, 0.024, 6), CANDLE, {
    bone: lantern,
    at: [0, wallBottom + 0.012, LZ],
    flat: true,
    name: "candle",
  });
  glow(
    b.cards([frame([0, wallBottom + 0.024, LZ], [0, 1, 0])], FLAME, {
      size: [0.022, 0.038],
      sink: 0,
      cross: true,
      bone: lantern,
      flow: [0, 0, 1],
    }),
    1.6,
  );

  // ---- sparkle trail -------------------------------------------------------------------------------------------------
  const sparks: Frame[] = [];
  const rs = rng(21);
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const x = 0.06 * Math.sin(t * 8.5 + 0.6) * (0.4 + t);
    const y = Math.max(HOVER + 0.02, HOVER + 0.02 + 0.15 * (1 - t) * (0.6 + 0.4 * rs()) + 0.03 * Math.sin(t * 11));
    const z = -0.4 - 0.5 * t;
    sparks.push(frame([x + (rs() - 0.5) * 0.03, y, z], [0, 1, 0]));
  }
  // a few drifting around the head and cap
  for (let i = 0; i < 7; i++) {
    const a = rs() * Math.PI * 2;
    const r = 0.17 + rs() * 0.09;
    sparks.push(frame([Math.cos(a) * r, 0.36 + rs() * 0.2, -0.04 + Math.sin(a) * r * 0.6 - 0.04], [0, 1, 0]));
  }
  const sparkRng = rng(33);
  glow(
    b.cards(sparks, SPARKS, {
      size: 0.04,
      vary: 0.25,
      rng: sparkRng,
      sink: 0,
      cross: true,
      flow: [0, 0, 1],
      bone: spine.joints[0],
    }),
    1,
  );

  return b.root;
}
