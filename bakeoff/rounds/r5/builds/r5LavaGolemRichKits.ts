import * as THREE from "three";
import { createBuilder, frame, limb, catmull, polyline, bezier, mottle, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A hulking cel-shaded lava golem: stacked basalt column armour over a molten core, glowing seams, gold trim, a flame crown, a pyro sigil on the chest and a floating rune halo.",
};

// Cold basalt against hot lava, in a Genshin-like cel palette
const BASALT = cel(mottle("#5a5273", "#4b4463", { size: 0.25, seed: 3 }), "#2b2742");
const BASALT_DK = cel(mottle("#3f3956", "#342f49", { size: 0.2, seed: 5 }), "#1d1a2f");
const BASALT_LT = cel("#80779e", "#463f63");
const GOLD = cel("#ffd060", "#c4741f");
const TEETH = cel("#fff0c8", "#e8b888");

const MOLTEN = "#ff6418";
const HOT = "#ffb02e";
const WHITEHOT = "#fff1a6";
const RED = "#e0300c";

const SIGIL_SVG = `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 2 L60 20 L60 60 L32 78 L4 60 L4 20 Z" fill="#ffc03a" stroke="#c4300a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M32 14 C38 28 50 34 48 50 C46 62 38 68 32 68 C24 68 16 62 16 50 C16 40 24 36 26 26 C28 30 30 30 32 14Z" fill="#fff6c8" stroke="#e0420c" stroke-width="3"/>
  <path d="M32 40 C36 46 40 50 38 57 C36 62 28 62 27 56 C26 50 30 48 32 40Z" fill="#ff7a1c"/>
</svg>`;

const flameOutline = (k: number): OutlinePoint[] => [
  [-0.09 * k, 0],
  [0.09 * k, 0],
  [0.11 * k, 0.14 * k],
  [0.05 * k, 0.26 * k],
  [0.08 * k, 0.4 * k],
  [0, 0.62 * k, "sharp"],
  [-0.05 * k, 0.4 * k],
  [-0.11 * k, 0.28 * k],
  [-0.12 * k, 0.12 * k],
];

export default function build() {
  const b = createBuilder({ name: "lava-golem" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const hex = (rt: number, rb: number, h: number) => new THREE.CylinderGeometry(rt, rb, h, 6);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.35, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.35, 0],
      [0, 1.72, 0.03],
      [0, 2.12, 0.1],
      [0, 2.52, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neckChain",
    polyline([
      [0, 2.55, 0.14],
      [0, 2.8, 0.4],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 2.8, 0.4], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.76, 0.52], dir: [0, 0, 1], role: "jaw" });
  const halo = b.joint("halo", { parent: chest, at: [0, 3.0, -1.15], dir: [0, 1, 0] });

  const sides = [1, -1].map((s) => {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.98, 2.42, 0);
    const el = V(s * 1.42, 1.86, 0.1);
    const wr = V(s * 1.82, 1.28, 0.22);
    const arm = b.chain(`arm${S}`, [sh, el, wr], {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    const D = wr.clone().sub(el).normalize();

    // fingers: four plus a thumb, fanned apart
    const fingers = [0, 1, 2, 3].map((k) => {
      const zoff = (k - 1.5) * 0.12;
      const lm = [0.9, 1.05, 1, 0.85][k];
      const p0 = wr.clone().addScaledVector(D, 0.22).add(V(0, 0, zoff));
      const p1 = p0.clone().addScaledVector(V(0, 0, zoff * 1.2).add(D).normalize(), 0.2 * lm);
      const p2 = p1.clone().addScaledVector(D.clone().add(V(-s * 0.55, 0, zoff * 0.8)).normalize(), 0.17 * lm);
      return b.chain(`finger${k + 1}${S}`, [p0, p1, p2], {
        parent: arm.joints[2],
        names: [`finger${k + 1}${S}a`, `finger${k + 1}${S}b`],
        role: "digit",
      });
    });
    const t0 = wr.clone().addScaledVector(D, 0.06).add(V(-s * 0.18, 0, 0.2));
    const t1 = t0.clone().addScaledVector(V(-s * 0.3, D.y * 0.6, 0.8).normalize(), 0.2);
    const t2 = t1.clone().addScaledVector(V(-s * 0.5, D.y * 0.5, 0.8).normalize(), 0.16);
    const thumb = b.chain(`thumb${S}`, [t0, t1, t2], {
      parent: arm.joints[2],
      names: [`thumb${S}a`, `thumb${S}b`],
      role: "digit",
    });

    const pts = limb(V(s * 0.42, 1.3, 0), V(s * 0.46, 0.36, 0.04), [0.52, 0.54], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.46, 0, 0.2],
    });
    const toes = [-1, 0, 1].map((k, i) =>
      b.joint(`toe${i + 1}${S}`, {
        parent: leg.joints[2],
        at: [s * 0.46 + k * 0.2, 0.12, 0.6],
        dir: [0, 0, 1],
        role: "digit",
      }),
    );
    return { s, S, sh, el, wr, D, arm, fingers, thumb, leg, pts, toes };
  });

  // ---------------------------------------------------------------- helpers
  const column = (
    bone: typeof head,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rb: number,
    rt: number,
    color: any,
  ) => {
    const d = dir.clone().normalize();
    return b.part(hex(rt, rb, len), color, {
      bone,
      at: base.clone().addScaledVector(d, len / 2),
      dir: d,
      flat: true,
    });
  };
  const band = (chain: any, t0: number, t1: number, r0: number, r1: number, color: any) =>
    b.sweep(chain, [r0, r1], { from: t0, to: t1, color, section: { ngon: 6 }, caps: "flat" });
  const crack = (target: any, pts: THREE.Vector3[], r = 0.014) => {
    const surf = b.surface(target);
    const sw = b.sweep(surf.drape(polyline(pts), { lift: 0.004 }), r, {
      color: HOT,
      section: { ngon: 4 },
      caps: "round",
    });
    glow(sw, 1.3);
  };

  // ---------------------------------------------------------------- torso
  const core = b.loft(
    [
      { at: [0, 1.28, 0], w: 0.95, h: 0.62 },
      { at: [0, 1.7, 0.03], w: 0.85, h: 0.62 },
      { at: [0, 2.1, 0.1], w: 1.3, h: 0.8 },
      { at: [0, 2.5, 0.12], w: 1.75, h: 0.85 },
      { at: [0, 2.68, 0.13], w: 1.2, h: 0.7 },
    ],
    { bone: spine, color: MOLTEN },
  );
  glow(core, 1);
  const skin = b.surface(core);

  const belt = (y: number, r: number, color: any, open = false) => {
    const p = V(0, y, 0);
    let path = skin.loop(p, { dir: [0, 1, 0] });
    if (open) path = path.slice(0.1, 0.9);
    return b.sweep(path, r, { color, section: { ngon: 6 }, bone: spine.nearestJoint(p) });
  };
  belt(1.32, 0.12, BASALT_DK);
  belt(1.58, 0.1, BASALT);
  belt(1.83, 0.1, BASALT_DK);
  belt(2.07, 0.105, BASALT, true);
  belt(2.31, 0.11, BASALT_DK, true);
  belt(2.56, 0.11, BASALT);

  // pyro sigil in the chest opening
  const front = skin.ray([0, 2.19, 2], [0, 0, -1]);
  if (front) {
    const SIGIL = svg(SIGIL_SVG, { size: 256 });
    glow(b.decal(skin, SIGIL, { at: front, dir: [0, 0, 1], size: [0.34, 0.43] }), 1.3);
    b.part(new THREE.TorusGeometry(0.235, 0.028, 4, 6), GOLD, {
      bone: chest,
      at: [0, 2.19, front.at.z + 0.03],
      rotation: [0, 0, 30],
      flat: true,
    });
  }
  // buckle on the girdle
  const buckle = skin.ray([0, 1.32, 2], [0, 0, -1]);
  if (buckle) {
    b.part(hex(0.12, 0.12, 0.06), GOLD, {
      bone: hips,
      at: [0, 1.32, buckle.at.z + 0.12],
      dir: [0, 0, 1],
      flat: true,
    });
    glow(
      b.part(hex(0.06, 0.06, 0.04), HOT, { bone: hips, at: [0, 1.32, buckle.at.z + 0.15], dir: [0, 0, 1], flat: true }),
      1.2,
    );
  }

  // back spikes of basalt
  [
    [1.72, 0.13, 0.5, BASALT_LT],
    [1.97, 0.15, 0.62, BASALT_DK],
    [2.22, 0.14, 0.55, BASALT_LT],
    [2.45, 0.11, 0.4, BASALT_DK],
  ].forEach(([y, r, len, c]: any) => {
    const hit = skin.ray([0, y, -2], [0, 0, 1]);
    if (!hit) return;
    const pt = hit.at.clone().add(V(0, 0, -0.1));
    b.stick(new THREE.ConeGeometry(r, len, 6), c, frame(pt, [0, 0.5, -1]), {
      bone: spine.nearestJoint(pt),
      embed: 0.3,
      flat: true,
    });
  });

  // tassets hanging from the girdle
  for (const x of [-0.3, 0, 0.3]) {
    const h = x === 0 ? 0.56 : 0.46;
    b.part(new THREE.BoxGeometry(0.26, h, 0.07), x === 0 ? BASALT_LT : BASALT_DK, { bone: hips, at: [x, 1.38 - h / 2, 0.47] });
    b.part(new THREE.BoxGeometry(0.28, 0.04, 0.09), GOLD, { bone: hips, at: [x, 1.38 - h + 0.02, 0.47] });
  }
  for (const x of [-0.18, 0.18]) {
    b.part(new THREE.BoxGeometry(0.28, 0.5, 0.07), BASALT_DK, { bone: hips, at: [x, 1.13, -0.47] });
    b.part(new THREE.BoxGeometry(0.3, 0.04, 0.09), GOLD, { bone: hips, at: [x, 0.9, -0.47] });
  }

  // pauldrons: clusters of basalt columns
  for (const s of [1, -1]) {
    const B = V(s * 0.98, 2.5, 0);
    const specs = [
      { o: [0, 0, 0], d: [s * 0.3, 1, 0], len: 0.6, r: 0.22, c: BASALT },
      { o: [s * 0.2, -0.08, 0.2], d: [s * 0.7, 0.8, 0.35], len: 0.42, r: 0.16, c: BASALT_DK },
      { o: [s * 0.18, -0.08, -0.2], d: [s * 0.6, 0.8, -0.4], len: 0.38, r: 0.15, c: BASALT_LT },
      { o: [s * 0.34, -0.2, 0.02], d: [s, 0.25, 0.05], len: 0.36, r: 0.15, c: BASALT_DK },
    ];
    specs.forEach((sp, i) => {
      const base = B.clone().add(V(sp.o[0], sp.o[1], sp.o[2]));
      const d = V(sp.d[0], sp.d[1], sp.d[2]).normalize();
      const col = column(chest, base, d, sp.len, sp.r, sp.r * 0.88, sp.c);
      if (i === 0) {
        const top = base.clone().addScaledVector(d, sp.len + 0.012);
        glow(b.part(hex(sp.r * 0.7, sp.r * 0.7, 0.035), HOT, { bone: chest, at: top, dir: d, flat: true }), 1.2);
        const cp = [
          [0.06, 0.0],
          [0.2, -0.06],
          [0.3, 0.06],
          [0.43, -0.03],
        ].map(([u, lat]) => base.clone().addScaledVector(d, u).add(V(lat, 0, sp.r - 0.01)));
        crack(col, cp);
      }
    });
  }

  // ---------------------------------------------------------------- neck & collar
  glow(b.sweep(neck, 0.2, { color: MOLTEN }), 1);
  b.sweep(neck, 0.3, { from: 0.02, to: 0.5, color: BASALT_DK, section: { ngon: 6 }, caps: "flat" });
  b.part(new THREE.TorusGeometry(0.32, 0.035, 4, 6), GOLD, {
    bone: chest,
    at: [0, 2.62, 0.18],
    dir: [0, 1, 0],
    axis: "z",
    flat: true,
  });

  // ---------------------------------------------------------------- head
  b.part(new THREE.BoxGeometry(0.7, 0.48, 0.6), BASALT, { bone: head, at: [0, 2.98, 0.52] });
  b.part(hex(0.3, 0.34, 0.12), BASALT_LT, { bone: head, at: [0, 3.27, 0.48], flat: true });
  b.part(new THREE.BoxGeometry(0.56, 0.2, 0.3), BASALT_DK, { bone: head, at: [0, 2.83, 0.88] });
  glow(b.part(new THREE.BoxGeometry(0.44, 0.12, 0.4), MOLTEN, { bone: head, at: [0, 2.735, 0.78] }), 1);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.4, 0.08, 0.2), BASALT_DK, {
      bone: head,
      at: [s * 0.18, 3.15, 0.83],
      rotation: [0, 0, s * 14],
    });
    b.part(new THREE.BoxGeometry(0.22, 0.1, 0.04), BASALT_DK, {
      bone: head,
      at: [s * 0.16, 3.03, 0.84],
      rotation: [0, 0, s * 18],
    });
    glow(
      b.part(new THREE.BoxGeometry(0.17, 0.055, 0.04), WHITEHOT, {
        bone: head,
        at: [s * 0.16, 3.03, 0.86],
        rotation: [0, 0, s * 18],
      }),
      1.6,
    );
    column(head, V(s * 0.32, 2.92, 0.5), V(s, 0, 0), 0.16, 0.12, 0.1, BASALT_LT);
    // lower jaw tusks
    b.part(new THREE.ConeGeometry(0.045, 0.24, 5), TEETH, { bone: jaw, at: [s * 0.2, 2.8, 1.05] });
    // horns
    const p0 = V(s * 0.33, 3.12, 0.4);
    const horn = bezier(p0, V(s * 0.6, 3.2, 0.3), V(s * 0.7, 3.45, -0.05), V(s * 0.5, 3.75, -0.3));
    const hr = (t: number) => 0.09 * (1 - t) + 0.015;
    b.sweep(horn, hr, { to: 0.72, bone: head, color: BASALT_LT, section: { ngon: 6 }, caps: { start: "flat", end: "none" } });
    glow(
      b.sweep(horn, hr, { from: 0.72, bone: head, color: HOT, section: { ngon: 6 }, caps: { start: "none", end: "point" } }),
      1.3,
    );
  }
  for (const x of [-0.2, -0.07, 0.07, 0.2])
    b.part(new THREE.ConeGeometry(0.035, 0.09, 5), TEETH, { bone: head, at: [x, 2.685, 1.0], dir: [0, -1, 0] });

  // lower jaw
  b.part(new THREE.BoxGeometry(0.54, 0.16, 0.44), BASALT, { bone: jaw, at: [0, 2.65, 0.78] });
  glow(b.part(new THREE.BoxGeometry(0.4, 0.02, 0.34), HOT, { bone: jaw, at: [0, 2.738, 0.78] }), 1.2);
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.1), GOLD, { bone: jaw, at: [0, 2.58, 1.0] });

  // flame crown
  const flame = (at: number[], k: number, tilt: number[], color: string, thick: number) =>
    glow(
      b.extrude(flameOutline(k), {
        at,
        x: [1, 0, 0],
        y: tilt,
        thickness: thick,
        bevel: 0.008,
        smoothing: 1,
        color,
        bone: head,
      }),
      1.2,
    );
  flame([0, 3.3, 0.28], 1.0, [0, 1, 0], MOLTEN, 0.06);
  flame([0, 3.3, 0.28], 0.6, [0, 1, 0], HOT, 0.085);
  for (const s of [1, -1]) {
    flame([s * 0.22, 3.28, 0.34], 0.7, [s * 0.35, 1, 0], MOLTEN, 0.05);
    flame([s * 0.22, 3.28, 0.34], 0.4, [s * 0.35, 1, 0], HOT, 0.07);
    flame([s * 0.12, 3.26, 0.1], 0.75, [0, 1, -0.4], RED, 0.05);
  }

  // ---------------------------------------------------------------- arms
  for (const { s, arm, el, wr, D, fingers, thumb } of sides) {
    const tE = arm.span(0)[1];
    glow(
      b.sweep(arm, [0.21, 0.17, 0.2], {
        color: MOLTEN,
        bands: [
          [tE - 0.08, MOLTEN],
          [tE + 0.08, HOT],
          [1, MOLTEN],
        ],
      }),
      1,
    );
    band(arm, 0.02, tE - 0.1, 0.3, 0.27, BASALT);
    band(arm, tE + 0.1, 0.9, 0.27, 0.32, BASALT_DK);
    band(arm, 0.9, 0.95, 0.335, 0.335, GOLD);
    column(arm.joints[1], el.clone().add(V(0, 0, -0.16)), V(s * 0.4, 0.1, -1), 0.4, 0.13, 0.02, BASALT_LT);

    // palm
    b.part(new THREE.BoxGeometry(0.36, 0.28, 0.46), BASALT_DK, {
      bone: arm.joints[2],
      at: wr.clone().addScaledVector(D, 0.12),
      dir: D,
    });
    const digitR = (t: number) => 0.075 - 0.03 * t;
    for (const f of [...fingers, thumb]) {
      b.sweep(f, digitR, { to: 0.62, color: BASALT_LT, section: { ngon: 6 }, caps: "flat" });
      glow(
        b.sweep(f, digitR, { from: 0.62, color: HOT, section: { ngon: 6 }, caps: { start: "none", end: "round" } }),
        1.2,
      );
    }
  }

  // ---------------------------------------------------------------- legs
  for (const { s, leg, pts, toes } of sides) {
    const tk = leg.span(0)[1];
    glow(
      b.sweep(leg, [0.24, 0.19, 0.18], {
        color: MOLTEN,
        bands: [
          [tk - 0.07, MOLTEN],
          [tk + 0.07, HOT],
          [1, MOLTEN],
        ],
      }),
      1,
    );
    band(leg, 0.03, tk - 0.08, 0.34, 0.3, BASALT);
    band(leg, tk + 0.08, 0.86, 0.29, 0.28, BASALT_DK);
    band(leg, 0.88, 0.93, 0.25, 0.25, GOLD);

    const knee = pts[1];
    b.part(hex(0.19, 0.22, 0.15), BASALT_LT, {
      bone: leg.joints[1],
      at: [knee.x, knee.y, knee.z + 0.24],
      dir: [0, 0, 1],
      flat: true,
    });
    glow(
      b.part(hex(0.1, 0.1, 0.04), HOT, {
        bone: leg.joints[1],
        at: [knee.x, knee.y, knee.z + 0.32],
        dir: [0, 0, 1],
        flat: true,
      }),
      1.3,
    );

    // foot
    const ankle = leg.joints[2];
    const fx = s * 0.46;
    b.part(new THREE.BoxGeometry(0.62, 0.26, 0.9), BASALT_DK, { bone: ankle, at: [fx, 0.13, 0.22] });
    glow(b.part(hex(0.27, 0.27, 0.03), MOLTEN, { bone: ankle, at: [fx, 0.275, 0.04], flat: true }), 1);
    toes.forEach((tj, i) => {
      const x = fx + (i - 1) * 0.2;
      b.part(hex(0.085, 0.1, 0.26), BASALT_LT, { bone: tj, at: [x, 0.11, 0.78], dir: [0, 0, 1], flat: true });
      glow(b.part(hex(0.055, 0.055, 0.03), HOT, { bone: tj, at: [x, 0.11, 0.915], dir: [0, 0, 1], flat: true }), 1.2);
    });
  }

  // ---------------------------------------------------------------- floating rune halo
  glow(b.part(new THREE.TorusGeometry(0.85, 0.035, 5, 28), "#ffc94a", { bone: halo, at: [0, 3.0, -1.15] }), 1.2);
  glow(b.part(new THREE.TorusGeometry(0.62, 0.02, 4, 24), "#ffa030", { bone: halo, at: [0, 3.0, -1.15] }), 1.1);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    glow(
      b.part(new THREE.OctahedronGeometry(0.075), WHITEHOT, {
        bone: halo,
        at: [0.85 * Math.cos(a), 3.0 + 0.85 * Math.sin(a), -1.15],
        scale: [1, 1.5, 1],
        flat: true,
      }),
      1.5,
    );
  }

  // slightly open mouth, showing the molten throat
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
