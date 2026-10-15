// Lava golem: basalt plates split by molten seams, Genshin-style cel shading, gold trims and a pyro core.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng, vec } from "../../../../src/math";
import type { FrameInput, V3 } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";
import type { OutlinePoint } from "../../../../src/builder";

export const meta = {
  name: "Lava Golem",
  description:
    "A towering basalt golem whose cracked plates are split by glowing molten seams, with gold filigree trims, a pyro core in the chest and flames licking from its crown and shoulders.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const HOT = "#ff7b1c";
const CORE = "#ffd25a";
const WHITEHOT = "#fff2a8";
const BONE = "#efe0bd";
const TASSEL = "#d8352a";

const ROCKS = [
  cel(mottle("#4c4562", "#3b3550", { size: 0.14, seed: 2 })),
  cel(mottle("#574e70", "#413a59", { size: 0.12, seed: 5 })),
  cel(mottle("#3f3956", "#322c46", { size: 0.16, seed: 9 })),
];
const DARKROCK = cel("#2c2640");
const GOLD = cel("#f0bf48", "#b9792a");
const CLAW = cel("#1f1a2c");
const EMBER = cel("#c8401a", "#8c2412");

// Cells of basalt split by seams: a white-gold core in the crack, orange rim, then rock.
const seamed = (size: number, width: number): Paint =>
  paint((p) => {
    const c = cells(p, size, 4);
    const e = c.d2 - c.d1;
    if (e < width * 0.45) return CORE;
    if (e < width) return HOT;
    return ROCKS[Math.min(2, Math.floor(c.id * 3))];
  });

const BODY = seamed(0.34, 0.1);
const HEADP = seamed(0.22, 0.1);
const LEGP = paint((p) => (p.y < 0.22 + 0.04 * Math.sin(p.x * 40 + p.z * 25) ? EMBER : BODY));

const ringGeo = (R: number, r: number) => new THREE.TorusGeometry(R, r, 5, 16).rotateX(Math.PI / 2);

const FLAME = svg(
  `<svg viewBox="0 0 40 80">
  <path d="M20 79 C3 62 6 42 17 30 C15 44 24 40 22 20 C22 10 27 6 26 1 C35 22 39 40 37 56 C35 69 28 77 20 79Z" fill="#ff5a14"/>
  <path d="M20 76 C9 63 12 48 19 40 C19 50 24 48 24 36 C30 48 31 60 28 67 C26 72 23 75 20 76Z" fill="#ffb02e"/>
  <path d="M20 72 C15 64 17 56 20 52 C22 58 25 60 24 66 C23 70 22 71 20 72Z" fill="#fff1a6"/>
</svg>`,
  { size: 128 },
);

const FIL = svg(
  `<svg viewBox="0 0 100 50">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path id="a" d="M50 4 C32 4 22 18 8 15 C20 30 36 27 50 46 C64 27 80 30 92 15 C78 18 68 4 50 4Z" stroke="${INK}" stroke-width="8"/>
    <path d="M50 4 C32 4 22 18 8 15 C20 30 36 27 50 46 C64 27 80 30 92 15 C78 18 68 4 50 4Z" stroke="#f2c14e" stroke-width="3.6"/>
    <path d="M50 14 C42 14 38 20 30 20 M50 14 C58 14 62 20 70 20 M50 14 L50 34" stroke="#f9e08a" stroke-width="2.6"/>
  </g>
  <circle cx="50" cy="24" r="5" fill="#ff7b1c" stroke="${INK}" stroke-width="2"/>
  <circle cx="20" cy="22" r="2.6" fill="#f2c14e"/><circle cx="80" cy="22" r="2.6" fill="#f2c14e"/>
</svg>`,
  { size: 512 },
);

const RUNE = svg(
  `<svg viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="28" fill="none" stroke="#f2c14e" stroke-width="3.4"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#ff7b1c" stroke-width="2.2"/>
  <path d="M32 10 C20 26 18 36 25 45 C26 38 30 36 32 30 C34 36 38 38 39 45 C46 36 44 26 32 10Z" fill="#ff9a24"/>
  <path d="M32 24 C28 32 28 38 32 42 C36 38 36 32 32 24Z" fill="#fff1a6"/>
  <path d="M32 2 L32 6 M32 58 L32 62 M2 32 L6 32 M58 32 L62 32" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const loin = (w: number, h: number): OutlinePoint[] => [
  [-w, 0],
  [w, 0],
  [w * 0.85, -h * 0.6],
  [0, -h, "sharp"],
  [-w * 0.85, -h * 0.6],
];

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const P = (v: THREE.Vector3, x: number, y: number, z: number) => v.clone().add(new THREE.Vector3(x, y, z));

  // Helpers -----------------------------------------------------------------------------------------------------
  const pillar = (base: V3, dir: V3, h: number, r: number, bone: Joint, tint: Paint | string) => {
    const d = vec(dir).normalize();
    const start = vec(base);
    b.part(new THREE.CylinderGeometry(r * 0.85, r, h, 6), tint, {
      at: start.clone().addScaledVector(d, h / 2),
      dir: d,
      bone,
      flat: true,
    });
    glow(
      b.part(new THREE.CylinderGeometry(r * 0.6, r * 0.7, 0.03, 6), HOT, {
        at: start.clone().addScaledVector(d, h),
        dir: d,
        bone,
      }),
      1.3,
    );
  };
  const band = (f: FrameInput, R: number, r: number, depth: number, color: Paint | string, lit = false) => {
    const part = b.part(ringGeo(R, r), color, { frame: f, scale: [1, 1, depth] });
    if (lit && typeof color === "string") glow(part, 1.3);
    return part;
  };

  // Skeleton + torso --------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.05, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.08, 0],
      [0, 1.42, 0.02],
      [0, 1.74, 0.06],
      [0, 2.0, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const torso = b.sweep(spine, (t) => [0.27 + 0.26 * Math.pow(t, 0.8), 0.24 + 0.1 * t], { color: BODY, sides: 10 });

  b.part(new THREE.IcosahedronGeometry(1, 1), BODY, {
    at: [0, 1.05, 0],
    bone: hips,
    scale: [0.38, 0.26, 0.3],
    flat: true,
  });

  // Belts and bands on the torso
  band(spine.at(0.05), 0.305, 0.035, 0.84, HOT, true);
  band(spine.at(0.16), 0.335, 0.04, 0.78, GOLD);
  band(spine.at(0.72), 0.48, 0.035, 0.66, GOLD);
  band(spine.at(0.62), 0.46, 0.022, 0.66, HOT, true);

  // Pyro core on the chest, in a gold ring with spokes
  glow(b.part(new THREE.SphereGeometry(0.11, 8, 6), "#ffb02e", { bone: chest, at: [0, 1.62, 0.35] }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), WHITEHOT, { bone: chest, at: [0, 1.62, 0.43] }), 1.8);
  b.part(new THREE.TorusGeometry(0.15, 0.03, 6, 14), GOLD, { bone: chest, at: [0, 1.62, 0.37] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.17, 1.62 + Math.sin(a) * 0.17, 0.37], [Math.cos(a), Math.sin(a), 0.2], 0.08, 0.022, {
      color: GOLD,
      bone: chest,
    });
  }
  // Filigree collar plate
  b.decal(torso, FIL, { at: [0, 1.98, 0.43], dir: [0, 0.15, 1], size: [0.56, 0.28] });

  // Basalt plates over the torso
  b.surface(torso)
    .scatter(30, { rng: rng(3), minDist: 0.19, filter: (h) => h.n.y > -0.3 })
    .forEach((h, i) =>
      b.stick(new THREE.BoxGeometry(0.2, 0.06, 0.16), ROCKS[i % 3], h, { embed: 0.35, spin: i * 41 }),
    );

  // Back columns
  for (let i = 0; i < 7; i++) {
    const k = 3 - Math.abs(i - 3);
    const x = (i - 3) * 0.1;
    pillar([x, 1.7 + 0.05 * k, -0.2], [x * 2.5, 1, -0.55], 0.45 + 0.12 * k, 0.075, chest, ROCKS[1]);
  }
  pillar([0.18, 1.35, -0.22], [0.5, 0.5, -1], 0.4, 0.07, chest, ROCKS[2]);
  pillar([-0.18, 1.35, -0.22], [-0.5, 0.5, -1], 0.4, 0.07, chest, ROCKS[2]);

  // Pelvis loin plates
  for (const [z, sx] of [
    [0.28, 1],
    [-0.28, -1],
  ] as const) {
    b.extrude(loin(0.2, 0.5), { at: [0, 1.1, z], x: [sx, 0, 0], thickness: 0.05, bevel: 0.01, color: GOLD, bone: hips });
    b.extrude(loin(0.16, 0.42), { at: [0, 1.08, z], x: [sx, 0, 0], thickness: 0.07, bevel: 0.01, color: DARKROCK, bone: hips });
  }
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: hips, at: [0, 0.93, 0.318], dir: [0, 0, 1], axis: "z", texture: RUNE }),
    1.2,
  );

  // Neck and head ------------------------------------------------------------------------------------------------
  const neck = b.chain(
    "neck",
    [
      [0, 1.98, 0.1],
      [0, 2.22, 0.26],
    ],
    { parent: chest, names: ["neck", "head"], role: "neck" },
  );
  const head = neck.joints[neck.joints.length - 1];
  b.sweep(neck, [0.17, 0.15], { color: BODY, sides: 8 });
  band(neck.at(0.1), 0.2, 0.03, 1, GOLD);

  const HC = head.local({ forward: 0.05, up: 0.06 });
  b.part(new THREE.IcosahedronGeometry(1, 1), HEADP, { bone: head, at: HC, scale: [0.25, 0.2, 0.23], flat: true });
  b.part(new THREE.BoxGeometry(0.38, 0.06, 0.12), DARKROCK, {
    bone: head,
    at: head.local({ forward: 0.22, up: 0.15 }),
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.07, 0.1, 0.08), ROCKS[1], {
    bone: head,
    at: head.local({ forward: 0.27, up: 0.06 }),
    flat: true,
  });

  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.BoxGeometry(0.085, 0.035, 0.03), WHITEHOT, {
        bone: head,
        at: head.local({ forward: 0.245, up: 0.1, left: s * 0.085 }),
        rotation: [0, 0, -s * 14],
      }),
      1.6,
    );
    // cheek spikes
    b.spike(head.local({ forward: 0.12, up: 0.0, left: s * 0.2 }), [s, -0.2, 0.5], 0.14, 0.05, {
      color: ROCKS[1],
      bone: head,
    });
    // gold ear disc, tassel and bead
    const ear = head.local({ forward: 0.02, up: 0.05, left: s * 0.25 });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10), GOLD, { bone: head, at: ear, dir: [s, 0, 0] });
    b.sweep([ear, P(ear, s * 0.02, -0.15, -0.02), P(ear, s * 0.03, -0.3, -0.04)], [0.02, 0.015, 0.006], {
      color: TASSEL,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { bone: head, at: P(ear, s * 0.015, -0.1, -0.015) });
  }

  // Crown of basalt columns and flames
  for (const i of [-1, 0, 1]) {
    pillar(head.local({ up: 0.17, forward: 0.1, left: i * 0.1 }), [i * 0.3, 1, -0.6], 0.2 + 0.08 * (1 - Math.abs(i)), 0.05, head, ROCKS[2]);
  }
  band(neck.at(0.9), 0.0001, 0.0001, 1, GOLD); // placeholder-free zero ring avoided below
  b.part(new THREE.TorusGeometry(0.22, 0.02, 5, 14), GOLD, {
    bone: head,
    at: head.local({ forward: 0.05, up: 0.12 }),
    dir: [0, 1, -0.2],
    axis: "z",
    scale: [1, 0.9, 1],
  });
  const crown: THREE.Vector3[] = [];
  for (let i = 0; i < 7; i++) crown.push(head.local({ up: 0.18, back: 0.02, left: (i - 3) * 0.07 }));
  glow(
    b.cards(
      crown.map((p) => frame(p, [0, 1, 0])),
      FLAME,
      { size: [0.16, 0.34], lean: 10, flow: [0, 0, -1], bend: 20, cross: true, vary: 0.25, rng: rng(77), bone: head },
    ),
    1.4,
  );

  // Jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.02 }),
    aim: head.local({ forward: 0.32, up: -0.06 }),
    role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.34, 0.09, 0.24), HEADP, {
    bone: jaw,
    at: jaw.local({ forward: 0.09, down: 0.035 }),
    flat: true,
  });
  b.spike(jaw.local({ forward: 0.18, down: 0.06 }), [0, -0.4, 1], 0.1, 0.045, { color: ROCKS[1], bone: jaw });
  for (let i = -2; i <= 2; i++)
    b.spike(jaw.local({ forward: 0.19, left: i * 0.055, up: 0.0 }), [0, 1, 0.1], 0.07, 0.02, {
      color: BONE,
      bone: jaw,
    });
  glow(b.part(new THREE.BoxGeometry(0.24, 0.03, 0.16), HOT, { bone: head, at: head.local({ forward: 0.2, up: -0.02 }) }), 1.2);

  // Arms ---------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shoulderAt = [s * 0.64, 1.95, 0.0];
    const H = [s * 0.88, 0.78, 0.22];
    const pts = limb(shoulderAt, H, [0.72, 0.72], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, catmull(pts), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    const armTube = b.sweep(arm, [0.2, 0.19, 0.22, 0.25], { color: BODY, sides: 8 });

    // pauldron: rock mass, gold rim, spikes, flames
    b.part(new THREE.IcosahedronGeometry(1, 1), BODY, {
      bone: shoulder,
      at: [s * 0.7, 2.0, 0],
      scale: [0.34, 0.26, 0.32],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.32, 0.03, 5, 16), GOLD, {
      bone: shoulder,
      at: [s * 0.7, 2.0, 0],
      dir: [s, 1, 0],
      axis: "z",
    });
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.6 + 0.1 * i), 2.18 - 0.03 * i, (i - 1) * 0.13], [s * 0.35, 1, (i - 1) * 0.3], 0.3 - 0.04 * i, 0.075, {
        color: ROCKS[i % 3],
        bone: shoulder,
      });
    const fl: THREE.Vector3[] = [];
    for (let i = 0; i < 4; i++) fl.push(new THREE.Vector3(s * (0.55 + 0.07 * i), 2.2, i % 2 ? 0.1 : -0.1));
    glow(
      b.cards(
        fl.map((p) => frame(p, [0, 1, 0])),
        FLAME,
        { size: [0.13, 0.28], lean: 8, flow: [0, 0, -1], bend: 20, cross: true, vary: 0.25, rng: rng(90 + s), bone: shoulder },
      ),
      1.4,
    );

    // elbow
    b.part(new THREE.IcosahedronGeometry(1, 0), ROCKS[1], { bone: elbow, at: elbow.at, scale: 0.2, flat: true });
    b.spike(elbow.at, [0, 0.1, -1], 0.26, 0.07, { color: ROCKS[2], bone: elbow });

    // cuffs
    band(arm.at(0.2), 0.245, 0.03, 1, GOLD);
    band(arm.at(0.88), 0.285, 0.035, 1, GOLD);
    band(arm.at(0.78), 0.26, 0.02, 1, HOT, true);

    // plates
    b.surface(armTube)
      .scatter(12, { rng: rng(20 + (s > 0 ? 1 : 2)), minDist: 0.15 })
      .forEach((h, i) =>
        b.stick(new THREE.BoxGeometry(0.15, 0.05, 0.12), ROCKS[(i + 1) % 3], h, { embed: 0.35, spin: i * 53 }),
      );

    // hand: palm, knuckle spikes, four fingers and a thumb
    b.part(new THREE.IcosahedronGeometry(1, 1), BODY, {
      bone: wrist,
      at: [H[0], H[1] - 0.06, H[2] + 0.04],
      scale: [0.2, 0.17, 0.2],
      flat: true,
    });
    for (let i = 0; i < 3; i++)
      b.spike([H[0] + (i - 1) * 0.09, H[1] - 0.03, H[2] + 0.12], [0, 0.3, 1], 0.1, 0.035, { color: CLAW, bone: wrist });
    for (let f = 0; f < 4; f++) {
      const base = [H[0] + (f - 1.5) * 0.085, H[1] - 0.13, H[2] + 0.05];
      const mid = [base[0], base[1] - 0.11, base[2] + 0.05];
      const tip = [mid[0], mid[1] - 0.1, mid[2] + 0.07];
      const fch = b.chain(`finger${S}${f}`, [base, mid, tip], {
        parent: wrist,
        names: [`finger${S}${f}a`, `finger${S}${f}b`],
        role: "digit",
      });
      b.sweep(fch, [0.05, 0.042, 0.03], { color: ROCKS[f % 3], sides: 6 });
      b.spike(tip, [0, -0.6, 1], 0.09, 0.03, { color: CLAW, bone: fch.joints[1] });
    }
    const tb = [H[0] - s * 0.17, H[1] - 0.02, H[2] + 0.04];
    const tm = [H[0] - s * 0.22, H[1] - 0.11, H[2] + 0.1];
    const tt = [H[0] - s * 0.2, H[1] - 0.18, H[2] + 0.2];
    const thumb = b.chain(`thumb${S}`, [tb, tm, tt], {
      parent: wrist,
      names: [`thumb${S}a`, `thumb${S}b`],
      role: "digit",
    });
    b.sweep(thumb, [0.055, 0.045, 0.032], { color: ROCKS[1], sides: 6 });
    b.spike(tt, [0, -0.5, 1], 0.09, 0.032, { color: CLAW, bone: thumb.joints[1] });
  }

  // Legs ---------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.3, 1.05, 0], [s * 0.34, 0.2, 0.1], [0.5, 0.55], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, catmull(pts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.34, 0, 0.2],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const legTube = b.sweep(leg, [0.25, 0.22, 0.18], { color: LEGP, sides: 8 });

    b.part(new THREE.IcosahedronGeometry(1, 0), ROCKS[1], { bone: knee, at: knee.at, scale: 0.2, flat: true });
    b.spike(knee.at, [0, 0, 1], 0.24, 0.07, { color: ROCKS[2], bone: knee });
    band(leg.at(0.3), 0.27, 0.03, 1, GOLD);
    band(leg.at(0.78), 0.2, 0.03, 1, GOLD);
    band(leg.at(0.93), 0.19, 0.025, 1, HOT, true);

    b.surface(legTube)
      .scatter(10, { rng: rng(40 + (s > 0 ? 1 : 2)), minDist: 0.17, filter: (h) => h.at.y > 0.4 })
      .forEach((h, i) =>
        b.stick(new THREE.BoxGeometry(0.16, 0.05, 0.13), ROCKS[(i + 2) % 3], h, { embed: 0.35, spin: i * 61 }),
      );

    // foot
    b.part(new THREE.BoxGeometry(0.38, 0.24, 0.56), ROCKS[0], { bone: ankle, at: [s * 0.34, 0.12, 0.2], flat: true });
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.BoxGeometry(0.1, 0.16, 0.16), ROCKS[1], {
        bone: ankle,
        at: [s * 0.34 + i * 0.12, 0.08, 0.52],
        flat: true,
      });
      b.part(new THREE.BoxGeometry(0.105, 0.05, 0.03), GOLD, {
        bone: ankle,
        at: [s * 0.34 + i * 0.12, 0.14, 0.6],
      });
    }
    b.spike([s * 0.34, 0.14, -0.05], [0, 0.4, -1], 0.16, 0.06, { color: ROCKS[2], bone: ankle });
  }

  return b.root;
}
