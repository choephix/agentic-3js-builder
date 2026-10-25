import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, polyline, bezier, offset, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { metal, gearTrain, gaugeTexture } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wind-up Tin Robot",
  description:
    "A 1950s Japanese lithographed tin wind-up robot: red tapered body with a chest lithograph, gauge and gear porthole, accordion chrome arms with pincer claws, striped legs on teal feet, a blue-tin head with glowing lens eyes and grill mouth, and a brass wind-up key in its back.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const RED = "#c2322a";
const CREAM = "#f1dfb4";
const TEAL = "#2d7ea4";
const INK = "#1a1218";
const RIVET = "#dfe3ea";
const GLASS_YELLOW = "#ffd23a";

/** Lithographed tin: a flat colour lit from above, darker beneath, with a few chips of bare metal showing. */
const tin = (base: string, seed: number) =>
  paint((p, n) => {
    let c = mix(base, "#fff3dc", 0.16 * smoothstep(0.1, 1, n.y) * (0.6 + 0.4 * noise(p, 0.02, seed)));
    c = mix(c, "#1a1020", 0.3 * smoothstep(-0.1, -1, n.y));
    const wear = noise(p, 0.0045, seed + 7);
    c = mix(c, "#b9bcc4", 0.85 * smoothstep(0.8, 0.9, wear));
    const sheen = noise(p, 0.012, seed + 3);
    return mix(c, "#ffffff", 0.07 * smoothstep(0.55, 0.9, sheen));
  });

const RED_TIN = tin(RED, 1);
const CREAM_TIN = tin(CREAM, 2);
const TEAL_TIN = tin(TEAL, 3);
const CHROME = metal("steel", { polish: 0.6, tarnish: 0.15, size: 0.02 });
const BRASS = metal("brass", { tarnish: 0.25, size: 0.015 });

/** Cream rings on red, with a thin ink seam at each edge: the legs' lithograph. */
const LEG_LITHO = paint((p) => {
  const k = (((p.y / 0.011) % 1) + 1) % 1;
  if (k < 0.5) return RED_TIN;
  if (k < 0.56 || k > 0.94) return INK;
  return CREAM_TIN;
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function dial(cx: number, cy: number, needleDeg: number) {
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const a = ((-135 + i * 33.75) * Math.PI) / 180;
    const x1 = cx + Math.sin(a) * 17;
    const y1 = cy - Math.cos(a) * 17;
    const x2 = cx + Math.sin(a) * 13;
    const y2 = cy - Math.cos(a) * 13;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#f3e4b8" stroke-width="2"/>`;
  }).join("");
  const a = (needleDeg * Math.PI) / 180;
  const nx = cx + Math.sin(a) * 15;
  const ny = cy - Math.cos(a) * 15;
  return `<circle cx="${cx}" cy="${cy}" r="21" fill="#1c1a22" stroke="#d9c58a" stroke-width="3"/>${ticks}
    <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#ff3b2a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="#d9c58a"/>`;
}

const CHEST_LITHO = svg(
  `<svg viewBox="0 0 170 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="170" height="64" fill="#f3e4b8"/>
    <rect x="3" y="3" width="164" height="58" fill="none" stroke="#b8242a" stroke-width="3"/>
    <rect x="8" y="8" width="154" height="48" fill="none" stroke="#2d7ea4" stroke-width="1.5"/>
    ${dial(32, 32, -40)}${dial(138, 32, 55)}
    <rect x="60" y="11" width="50" height="16" rx="3" fill="#1c1a22"/>
    <circle cx="71" cy="19" r="4.5" fill="#ff3b2a"/><circle cx="85" cy="19" r="4.5" fill="#ffd23a"/><circle cx="99" cy="19" r="4.5" fill="#38d0c0"/>
    <circle cx="69" cy="17" r="1.4" fill="#ffffff"/><circle cx="83" cy="17" r="1.4" fill="#ffffff"/><circle cx="97" cy="17" r="1.4" fill="#ffffff"/>
    <text x="85" y="46" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#b8242a">ROBOT</text>
    <path d="M62 50 l6 -9 l-3 0 l5 -8 l-7 10 l3 0 z" fill="#2d7ea4"/>
    <path d="M108 50 l-6 -9 l3 0 l-5 -8 l7 10 l-3 0 z" fill="#2d7ea4"/>
    <text x="85" y="56" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#2d7ea4">ATOMIC POWER</text>
  </svg>`,
  { size: 512 },
);

const SIDE_LITHO = svg(
  `<svg viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="60" fill="#f3e4b8"/>
    <rect x="2.5" y="2.5" width="43" height="55" fill="none" stroke="#b8242a" stroke-width="2.5"/>
    <path d="M24 8 L40 26 L31 26 L31 50 L17 50 L17 26 L8 26 Z" fill="#2d7ea4" stroke="#1c1a22" stroke-width="1.5"/>
    <rect x="19" y="33" width="10" height="3" fill="#f3e4b8"/><rect x="19" y="39" width="10" height="3" fill="#f3e4b8"/>
  </svg>`,
  { size: 192 },
);

const BACK_LITHO = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="60" fill="#f3e4b8"/>
    <rect x="3" y="3" width="114" height="54" fill="none" stroke="#2d7ea4" stroke-width="3"/>
    <text x="60" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="13" fill="#b8242a">MADE IN</text>
    <text x="60" y="40" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="15" fill="#b8242a">JAPAN</text>
    <circle cx="18" cy="48" r="6" fill="#b8242a"/><text x="18" y="51" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="8" fill="#f3e4b8">N</text>
    <text x="70" y="52" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#1c1a22">WIND-UP  No. 55</text>
  </svg>`,
  { size: 384 },
);

const EYE_LENS = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="31" fill="#2a1800"/>
    <circle cx="32" cy="32" r="26" fill="#ffd23a"/>
    <circle cx="32" cy="32" r="19" fill="#ffb01e"/>
    <circle cx="32" cy="32" r="12" fill="#ff7a1e"/>
    <circle cx="32" cy="32" r="5" fill="#3a1000"/>
    <ellipse cx="22" cy="21" rx="7" ry="5" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const GRILL = svg(
  `<svg viewBox="0 0 120 36" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="36" rx="4" fill="#1a1218"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${10 + i * 15}" y="6" width="6" height="24" rx="2" fill="${i % 2 ? "#ffd23a" : "#ff9a2a"}"/>`).join("")}
    <rect x="4" y="2" width="112" height="2" fill="#4a3a30"/>
  </svg>`,
  { size: 256 },
);

const TOE_PLATE = svg(
  `<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="40" fill="#f3e4b8"/>
    ${Array.from({ length: 5 }, (_, i) => `<path d="M${i * 14 - 10} 40 l12 -40 l7 0 l-12 40 z" fill="#b8242a"/>`).join("")}
    <rect x="0" y="0" width="60" height="40" fill="none" stroke="#1c1a22" stroke-width="3"/>
  </svg>`,
  { size: 160 },
);

const STAR = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="#f3e4b8" stroke="#1c1a22" stroke-width="2"/>
    <path d="M20 5 L24 15.5 L35 16 L26.5 23 L29.5 34 L20 28 L10.5 34 L13.5 23 L5 16 L16 15.5 Z" fill="#b8242a"/>
  </svg>`,
  { size: 128 },
);

const GAUGE = gaugeTexture({ needle: 40, label: "VOLT", size: 160 });

// ---------------------------------------------------------------------------------------------------------------
// Dimensions

const WAIST_Y = 0.128;
const SHOULDER_Y = 0.215;
const HIP_Y = 0.122;
const NECK_Y = 0.225;
const HEAD_Y0 = 0.24;
const JAW_H = 0.018;
const SKULL_H = 0.048;
const HEAD_TOP = HEAD_Y0 + JAW_H + SKULL_H;
const HEAD_HW = 0.036;
const HEAD_HD = 0.031;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const tz = (y: number) => (y - WAIST_Y) / (SHOULDER_Y - WAIST_Y);
/** Torso half width and half depth at a height. */
const hw = (y: number) => 0.0425 + 0.0125 * tz(y);
const hd = (y: number) => 0.03 + 0.006 * tz(y);
const FRONT_N = V(0, -0.006 / 0.087, 1).normalize();
const BACK_N = V(0, 0.006 / 0.087, -1).normalize();
const frontAt = (x: number, y: number, lift = 0.0012) => V(x, y, hd(y)).addScaledVector(FRONT_N, lift);
const backAt = (x: number, y: number, lift = 0.0012) => V(x, y, -hd(y)).addScaledVector(BACK_N, lift);

export default function build() {
  const b = createBuilder({ name: "windup-robot" });

  /** Many studs of one colour on one bone, as one part. */
  const rivets = (points: THREE.Vector3[], bone: Parameters<typeof b.part>[2]["bone"], r = 0.0015) => {
    const geos = points.map((p) => new THREE.SphereGeometry(r, 6, 4).translate(p.x, p.y, p.z));
    b.part(mergeGeometries(geos), RIVET, { bone, at: [0, 0, 0], flat: true });
  };

  // ---------------------------------------------------------------------------------------------------------- Skeleton
  const hips = b.joint("hips", { at: [0, HIP_Y, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, WAIST_Y + 0.003, 0],
      [0, 0.17, 0],
      [0, NECK_Y, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const belly = spine.joints[0];
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, NECK_Y, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, HEAD_Y0, 0], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HEAD_Y0 + JAW_H, -0.02], dir: [0, 0, 1], role: "jaw" });
  const antenna = b.joint("antenna", { parent: head, at: [0, HEAD_TOP, 0], dir: [0, 1, 0], role: "hinge" });
  const keyAt = V(0, 0.183, -hd(0.183));
  const key = b.joint("key", { parent: chest, at: keyAt, dir: [0, 0, -1], role: "hinge" });

  // ---------------------------------------------------------------------------------------------------------- Torso
  b.frustumBox(
    [0, WAIST_Y, 0],
    [0, SHOULDER_Y, 0],
    [2 * hw(WAIST_Y), 2 * hd(WAIST_Y)],
    [2 * hw(SHOULDER_Y), 2 * hd(SHOULDER_Y)],
    { bone: spine, color: RED_TIN, name: "torso" },
  );
  // Pelvis block and belt.
  b.part(new THREE.BoxGeometry(0.076, 0.014, 0.052), RED_TIN, { bone: hips, at: [0, 0.121, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.09, 0.009, 0.066), CHROME, { bone: hips, at: [0, 0.1305, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.014, 0.011, 0.004), RED_TIN, { bone: hips, at: [0, 0.1305, 0.034], flat: true });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 12), CHROME, {
      bone: hips,
      at: [s * 0.041, HIP_Y, 0],
      dir: [1, 0, 0],
      flat: true,
    });

  // Chest lithograph, gauge, gear porthole and dial knobs.
  b.part(new THREE.PlaneGeometry(0.085, 0.032), "#ffffff", {
    bone: chest,
    at: frontAt(0, 0.193),
    dir: FRONT_N,
    axis: "z",
    texture: CHEST_LITHO,
    name: "chestLitho",
  });
  const gaugeC = frontAt(0.022, 0.154, 0);
  b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.004, 16), BRASS, {
    bone: belly,
    at: gaugeC.clone().addScaledVector(FRONT_N, 0.002),
    dir: FRONT_N,
  });
  b.part(new THREE.CircleGeometry(0.0105, 20), "#ffffff", {
    bone: belly,
    at: gaugeC.clone().addScaledVector(FRONT_N, 0.0045),
    dir: FRONT_N,
    axis: "z",
    texture: GAUGE,
  });
  const portC = frontAt(-0.018, 0.154, 0);
  b.part(new THREE.CircleGeometry(0.0145, 16), INK, {
    bone: belly,
    at: portC.clone().addScaledVector(FRONT_N, 0.0008),
    dir: FRONT_N,
    axis: "z",
  });
  b.part(new THREE.TorusGeometry(0.016, 0.0022, 8, 20), BRASS, {
    bone: belly,
    at: portC.clone().addScaledVector(FRONT_N, 0.001),
    dir: FRONT_N,
    axis: "z",
  });
  const drive = gearTrain(b, {
    at: portC.clone().addScaledVector(FRONT_N, 0.0035).add(V(-0.004, 0, 0)),
    axis: FRONT_N,
    module: 0.0012,
    style: "flat",
    spin: "cog",
    bone: belly,
    group: "porthole",
    gears: [{ teeth: 12 }, { teeth: 8, angle: -90 }],
  });
  drive.spin(20);
  for (const s of [1, -1]) {
    const k = frontAt(s * 0.031, 0.209, 0);
    b.part(new THREE.CylinderGeometry(0.0055, 0.0065, 0.007, 10), CHROME, {
      bone: chest,
      at: k.clone().addScaledVector(FRONT_N, 0.0035),
      dir: FRONT_N,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.003, 0.0035, 0.003, 8), RED, {
      bone: chest,
      at: k.clone().addScaledVector(FRONT_N, 0.0085),
      dir: FRONT_N,
      flat: true,
    });
  }
  // Side arrows and back plate.
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.04, 0.05), "#ffffff", {
      bone: belly,
      at: [s * (hw(0.168) + 0.0012), 0.168, 0],
      dir: [s, -0.144, 0],
      axis: "z",
      texture: SIDE_LITHO,
    });
  b.part(new THREE.PlaneGeometry(0.064, 0.032), "#ffffff", {
    bone: belly,
    at: backAt(0, 0.15),
    dir: BACK_N,
    axis: "z",
    texture: BACK_LITHO,
  });
  // Rivet rows down every torso edge.
  {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 7; i++) {
      const y = 0.138 + i * 0.012;
      for (const s of [1, -1]) {
        pts.push(V(s * (hw(y) - 0.006), y, hd(y)), V(s * (hw(y) - 0.006), y, -hd(y)));
        pts.push(V(s * hw(y), y, hd(y) - 0.006), V(s * hw(y), y, -(hd(y) - 0.006)));
      }
    }
    rivets(pts, chest);
  }

  // ---------------------------------------------------------------------------------------------------------- Key
  b.rod(offset(keyAt, [0, 0, 1], 0.008), offset(keyAt, [0, 0, -1], 0.022), 0.0032, BRASS, { bone: key, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.003, 12), BRASS, {
    bone: key,
    at: offset(keyAt, [0, 0, -1], 0.0015),
    dir: [0, 0, 1],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8), CHROME, {
    bone: key,
    at: offset(keyAt, [0, 0, -1], 0.012),
    dir: [0, 0, 1],
    flat: true,
  });
  const keyHead = offset(keyAt, [0, 0, -1], 0.03);
  b.part(new THREE.BoxGeometry(0.006, 0.004, 0.012), BRASS, {
    bone: key,
    at: offset(keyAt, [0, 0, -1], 0.025),
    flat: true,
  });
  for (const s of [1, -1])
    b.part(new THREE.TorusGeometry(0.0085, 0.0024, 6, 14), BRASS, {
      bone: key,
      at: keyHead.clone().add(V(s * 0.0095, 0, 0)),
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
    });

  // ---------------------------------------------------------------------------------------------------------- Neck
  b.part(new THREE.CylinderGeometry(0.016, 0.018, 0.016, 12), CHROME, {
    bone: neck,
    at: [0, NECK_Y + 0.008, 0],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.003, 12), RED_TIN, {
    bone: neck,
    at: [0, NECK_Y + 0.0015, 0],
    flat: true,
  });

  // ---------------------------------------------------------------------------------------------------------- Head
  const skullC = HEAD_Y0 + JAW_H + SKULL_H / 2;
  b.part(new THREE.BoxGeometry(2 * HEAD_HW, SKULL_H, 2 * HEAD_HD), TEAL_TIN, {
    bone: head,
    at: [0, skullC, 0],
    flat: true,
    name: "skull",
  });
  // Lower jaw with its grill mouth.
  b.part(new THREE.BoxGeometry(2 * HEAD_HW, JAW_H, 2 * HEAD_HD), TEAL_TIN, {
    bone: jaw,
    at: [0, HEAD_Y0 + JAW_H / 2, 0],
    flat: true,
    name: "jawBox",
  });
  glow(
    b.part(new THREE.PlaneGeometry(0.054, 0.013), "#ffffff", {
      bone: jaw,
      at: [0, HEAD_Y0 + JAW_H / 2, HEAD_HD + 0.0012],
      dir: [0, 0, 1],
      axis: "z",
      texture: GRILL,
    }),
    0.9,
  );
  b.part(new THREE.BoxGeometry(0.06, 0.0025, 0.004), CHROME, {
    bone: jaw,
    at: [0, HEAD_Y0 + 0.002, HEAD_HD],
    flat: true,
  });
  // Eyes: chrome rims with glowing lenses.
  const EYE_Y = HEAD_Y0 + JAW_H + 0.028;
  for (const s of [1, -1]) {
    const e = V(s * 0.019, EYE_Y, HEAD_HD);
    b.part(new THREE.CylinderGeometry(0.012, 0.0125, 0.006, 14), CHROME, {
      bone: head,
      at: e.clone().add(V(0, 0, 0.002)),
      dir: [0, 0, 1],
    });
    glow(
      b.part(new THREE.CircleGeometry(0.0095, 14), "#ffffff", {
        bone: head,
        at: e.clone().add(V(0, 0, 0.0055)),
        dir: [0, 0, 1],
        axis: "z",
        texture: EYE_LENS,
      }),
      1.3,
    );
  }
  // Brow visor, cheek bolts, ears and side vents.
  b.part(new THREE.BoxGeometry(0.074, 0.006, 0.012), CREAM_TIN, {
    bone: head,
    at: [0, HEAD_TOP - 0.006, HEAD_HD - 0.002],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.074, 0.003, 0.014), RED_TIN, {
    bone: head,
    at: [0, HEAD_TOP - 0.0105, HEAD_HD - 0.003],
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 10), RED_TIN, {
      bone: head,
      at: [s * (HEAD_HW + 0.004), EYE_Y, 0],
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8), CHROME, {
      bone: head,
      at: [s * (HEAD_HW + 0.011), EYE_Y, 0],
      dir: [1, 0, 0],
      flat: true,
    });
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.003, 0.0025, 0.018), INK, {
        bone: head,
        at: [s * HEAD_HW, HEAD_Y0 + JAW_H + 0.008 + i * 0.005, -0.012],
        flat: true,
      });
  }
  rivets(
    [
      ...Array.from({ length: 5 }, (_, i) => V(-0.028 + i * 0.014, HEAD_TOP - 0.003, HEAD_HD)),
      ...Array.from({ length: 4 }, (_, i) => V(-0.03, HEAD_Y0 + 0.006 + i * 0.016, HEAD_HD)),
      ...Array.from({ length: 4 }, (_, i) => V(0.03, HEAD_Y0 + 0.006 + i * 0.016, HEAD_HD)),
    ].filter((p) => Math.abs(p.y - EYE_Y) > 0.012 || Math.abs(p.x) > 0.029),
    head,
  );
  // Antenna.
  b.part(new THREE.CylinderGeometry(0.009, 0.011, 0.004, 12), CHROME, {
    bone: antenna,
    at: [0, HEAD_TOP + 0.002, 0],
    flat: true,
  });
  b.rod([0, HEAD_TOP + 0.004, 0], [0, HEAD_TOP + 0.03, 0], 0.002, CHROME, { bone: antenna, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.002, 8), RED, {
    bone: antenna,
    at: [0, HEAD_TOP + 0.017, 0],
    flat: true,
  });
  glow(
    b.part(new THREE.SphereGeometry(0.0065, 10, 7), "#ff4a3a", { bone: antenna, at: [0, HEAD_TOP + 0.035, 0] }),
    1.4,
  );

  // ---------------------------------------------------------------------------------------------------------- Arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S = V(s * 0.062, 0.205, 0);
    const E = V(s * 0.095, 0.16, 0.004);
    const W = V(s * 0.125, 0.12, 0.01);
    const arm = b.chain("arm" + side, polyline([S, E, W]), {
      parent: chest,
      names: ["shoulder" + side, "elbow" + side, "wrist" + side],
      role: "arm",
    });
    // Shoulder cap with a star on its end.
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.022, 12), RED_TIN, {
      bone: arm.joints[0],
      at: S,
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CircleGeometry(0.011, 16), "#ffffff", {
      bone: arm.joints[0],
      at: [s * (0.062 + 0.0112), 0.205, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: STAR,
    });
    // Accordion chrome arm, one tube over both bones.
    b.sweep(arm, (t) => 0.0105 + 0.0018 * Math.sin(t * Math.PI * 18), { color: CHROME, caps: "flat", sides: 10 });
    const dU = E.clone().sub(S).normalize();
    const dL = W.clone().sub(E).normalize();
    b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.004, 10), RED_TIN, {
      bone: arm.joints[0],
      at: S.clone().lerp(E, 0.3),
      dir: dU,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0145, 10, 8), RED_TIN, { bone: arm.joints[1], at: E, flat: true });
    b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.004, 10), RED_TIN, {
      bone: arm.joints[1],
      at: E.clone().lerp(W, 0.55),
      dir: dL,
      flat: true,
    });
    // Wrist cuff and pincer claw: two digit joints.
    const wrist = arm.tip!;
    b.part(new THREE.CylinderGeometry(0.0125, 0.011, 0.012, 10), RED_TIN, {
      bone: wrist,
      at: W.clone().addScaledVector(dL, 0.002),
      dir: dL,
      flat: true,
    });
    const W0 = W.clone().addScaledVector(dL, 0.007);
    b.part(new THREE.CylinderGeometry(0.0075, 0.0085, 0.006, 8), CHROME, {
      bone: wrist,
      at: W0.clone().addScaledVector(dL, -0.001),
      dir: dL,
      flat: true,
    });
    for (const k of [1, -1]) {
      const mid = W0.clone().addScaledVector(dL, 0.016).add(V(0, 0, k * 0.012));
      const tip = W0.clone().addScaledVector(dL, 0.03).add(V(0, 0, k * 0.0045));
      const digit = b.joint((k > 0 ? "thumb" : "finger") + side, { parent: wrist, at: W0, aim: mid, role: "digit" });
      b.sweep(bezier(W0, mid, tip), [0.0036, 0.002], {
        bone: digit,
        color: CHROME,
        section: "box",
        caps: { start: "flat", end: "flat" },
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------- Legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const H = V(s * 0.028, HIP_Y, 0);
    const K = V(s * 0.03, 0.07, 0.003);
    const A = V(s * 0.032, 0.025, 0);
    const leg = b.chain("leg" + side, polyline([H, K, A]), {
      parent: hips,
      names: ["hip" + side, "knee" + side, "ankle" + side],
      role: "leg",
      contact: [s * 0.032, 0, 0.012],
    });
    b.frustumBox(H, K, [0.03, 0.032], [0.027, 0.03], { bone: leg.joints[0], color: LEG_LITHO });
    b.frustumBox(K, A, [0.027, 0.03], [0.03, 0.033], { bone: leg.joints[1], color: LEG_LITHO });
    // Knee hub across, with a cream cap.
    b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.034, 12), CHROME, {
      bone: leg.joints[1],
      at: K,
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 10), CREAM, {
      bone: leg.joints[1],
      at: [s * 0.0475, 0.07, 0.003],
      dir: [1, 0, 0],
      flat: true,
    });
    // Ankle cuff and foot.
    const foot = leg.tip!;
    b.part(new THREE.CylinderGeometry(0.017, 0.019, 0.01, 12), RED_TIN, {
      bone: foot,
      at: [s * 0.032, 0.027, 0.002],
      flat: true,
    });
    const F = V(s * 0.032, 0.011, 0.012);
    b.part(new THREE.BoxGeometry(0.05, 0.022, 0.075), TEAL_TIN, { bone: foot, at: F, flat: true, name: "foot" + side });
    b.part(new THREE.PlaneGeometry(0.038, 0.026), "#ffffff", {
      bone: foot,
      at: [F.x, 0.0232, 0.031],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: TOE_PLATE,
    });
    b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.05, 8), CHROME, {
      bone: foot,
      at: [F.x, 0.006, 0.0495],
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.052, 0.005, 0.077), INK, { bone: foot, at: [F.x, 0.0025, 0.012], flat: true });
    rivets(
      [
        V(F.x - 0.02, 0.022, -0.02),
        V(F.x + 0.02, 0.022, -0.02),
        V(F.x - 0.02, 0.022, 0.01),
        V(F.x + 0.02, 0.022, 0.01),
        V(F.x - 0.025, 0.014, 0.03),
        V(F.x + 0.025, 0.014, 0.03),
        V(F.x - 0.025, 0.014, -0.015),
        V(F.x + 0.025, 0.014, -0.015),
      ],
      foot,
    );
  }

  return b.root;
}
