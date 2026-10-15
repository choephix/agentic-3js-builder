import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng, DEG } from "../../../../src/math";
import { gradient, paint, mix } from "../../../../src/paint";
import { frame } from "../../../../src/frame";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A poised nine-tailed fox spirit with cel-shaded white-and-vermilion coat, gold filigree crest, tassels and bells, and spirit flames dancing around its tails.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------- palette ----------
const FUR = cel("#fff3e2", "#d9c3e6"); // pearly white
const FUR_BELLY = cel("#ffffff", "#e6d6f0");
const RED = cel("#e8402f", "#a9208a");
const RED_DEEP = cel("#c22a2f", "#7a1a7c");
const DARK = cel("#3a2450", "#1c1030");
const GOLD = cel("#ffd35a", "#d9902a");
const PINK = cel("#ffb3c8", "#e07fb0");
const WHITE_FLAT = "#fff8ee";
const FLAME_A = "#7fe9ff";
const FLAME_B = "#b48cff";
const FLAME_C = "#e9fbff";
const GOLD_FLAT = "#ffcf4a";
const CORD = "#d62f43";

// ---------- textures ----------
const flameTex = svg(
  `<svg viewBox="0 0 64 96">
  <path d="M32 94 C6 78 6 52 24 36 C22 50 30 52 32 40 C34 24 30 14 36 2 C44 20 62 40 58 66 C56 82 44 92 32 94 Z" fill="#8fe6ff"/>
  <path d="M32 90 C16 78 16 58 28 46 C28 58 34 58 35 48 C38 38 36 30 40 22 C48 40 54 56 50 70 C47 82 40 88 32 90 Z" fill="#b48cff"/>
  <path d="M32 86 C24 78 24 66 32 58 C34 66 38 66 40 60 C44 70 42 80 32 86 Z" fill="#f2fdff"/>
</svg>`,
  { size: 128 },
);
const wispTex = svg(
  `<svg viewBox="0 0 32 64">
  <path d="M16 62 C2 48 4 30 14 20 C14 30 18 32 19 24 C20 14 18 8 22 2 C28 16 32 34 28 46 C26 56 22 60 16 62 Z" fill="#9fefff"/>
  <path d="M16 56 C10 48 12 38 18 32 C18 40 22 40 22 36 C26 44 24 52 16 56 Z" fill="#ffffff"/>
</svg>`,
  { size: 64 },
);
const furTuft = svg(
  `<svg viewBox="0 0 32 64">
  <path d="M16 62 C6 44 4 22 16 2 C28 22 26 44 16 62 Z" fill="#ffffff"/>
</svg>`,
  { size: 64 },
);
const markTex = svg(
  `<svg viewBox="0 0 64 64">
  <path d="M32 4 C26 22 14 26 4 24 C14 34 18 44 14 60 C26 50 38 50 50 60 C46 44 50 34 60 24 C50 26 38 22 32 4 Z" fill="#e8402f"/>
  <path d="M32 18 C30 28 24 32 18 32 C24 38 26 44 24 52 C30 46 34 46 40 52 C38 44 40 38 46 32 C40 32 34 28 32 18 Z" fill="#ffd35a"/>
  <circle cx="32" cy="36" r="4" fill="#3a2450"/>
</svg>`,
  { size: 128 },
);
const runeRing = svg(
  `<svg viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="120" fill="none" stroke="#9fefff" stroke-width="6"/>
  <circle cx="128" cy="128" r="100" fill="none" stroke="#b48cff" stroke-width="4"/>
  <circle cx="128" cy="128" r="68" fill="none" stroke="#9fefff" stroke-width="4" stroke-dasharray="14 10"/>
  <path d="M128 10 L150 98 L240 128 L150 158 L128 246 L106 158 L16 128 L106 98 Z" fill="none" stroke="#e9fbff" stroke-width="4"/>
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `<circle cx="${128 + Math.cos(a) * 110}" cy="${128 + Math.sin(a) * 110}" r="6" fill="#ffffff"/>`;
  }).join("")}
  ${Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const x = 128 + Math.cos(a) * 84;
    const y = 128 + Math.sin(a) * 84;
    return `<path d="M${x - 8} ${y - 8} L${x + 8} ${y + 8} M${x + 8} ${y - 8} L${x - 8} ${y + 8}" stroke="#9fefff" stroke-width="4"/>`;
  }).join("")}
</svg>`,
  { size: 512 },
);
const paperTex = svg(
  `<svg viewBox="0 0 24 64">
  <rect x="2" y="0" width="20" height="60" fill="#fff8ee"/>
  <path d="M2 60 L8 64 L12 58 L16 64 L22 60 Z" fill="#fff8ee"/>
  <path d="M6 6 L18 14 M18 6 L6 14 M12 18 L12 50 M7 26 L17 26 M7 34 L17 34 M7 42 L17 42" stroke="#d62f43" stroke-width="2.5" fill="none"/>
</svg>`,
  { size: 96 },
);
const eyeTex = animeEye({ iris: "#ffb21f", irisLight: "#fff08a", blush: false });

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "nineTailedKitsune", paintSize: 2048 });
  const R = rng(9);

  // ---------- pose ----------
  // Fox stands facing +Z. Standing on ground y = 0; shoulder ~0.62 m.
  const SH = 0.6; // shoulder height
  const HIP = 0.56;

  // ---------- body ----------
  const spine = catmull([
    [0, 0.5, -0.34],
    [0, 0.57, -0.2],
    [0, 0.6, 0.0],
    [0, 0.64, 0.2],
    [0, 0.69, 0.34],
  ]);
  const coatBody = cel(
    furEdge(RED, FUR, { level: -0.1, teeth: 0.28, period: 0.05, ink: INK, inkWidth: 0.05 }),
  );
  const body = b.sweep(spine, [0.14, 0.17, 0.17, 0.15, 0.12], {
    color: coatBody,
    sides: 12,
    caps: "round",
  });
  // chest ruff and belly fluff
  const chest = b.part(new THREE.SphereGeometry(1, 12, 9), FUR_BELLY, {
    at: [0, 0.6, 0.4],
    scale: [0.17, 0.2, 0.18],
  });
  const rump = b.part(new THREE.SphereGeometry(1, 12, 9), coatBody, {
    at: [0, 0.54, -0.34],
    scale: [0.17, 0.17, 0.19],
  });

  // spine dark stripe mark along back (flat extrusions drawn as red dorsal chevrons)
  b.along(spine.slice(0.1, 0.9), 7, (at) => {
    const p = at.point;
    b.part(new THREE.ConeGeometry(0.035, 0.07, 5), RED_DEEP, {
      at: [0, p.y + 0.15, p.z],
      rotation: [90 * 0 + 0, 0, 0],
    });
  });

  // ---------- neck & head ----------
  const neck = b.sweep(
    catmull([
      [0, 0.66, 0.34],
      [0, 0.8, 0.44],
      [0, 0.92, 0.5],
    ]),
    [0.115, 0.095],
    { color: FUR, sides: 10, caps: "round" },
  );
  const neckRuff = b.sweep(
    catmull([
      [0, 0.72, 0.4],
      [0, 0.84, 0.47],
    ]),
    0.135,
    { color: FUR_BELLY, sides: 10, caps: "round" },
  );
  void neck;
  void neckRuff;

  const HEAD: [number, number, number] = [0, 0.98, 0.56];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), FUR, {
    at: HEAD,
    scale: [0.115, 0.095, 0.11],
  });
  // cheek tufts (wide cheeks)
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.05, 0.12, 6), FUR_BELLY, {
      at: [s * 0.115, 0.95, 0.56],
      dir: [s * 1, -0.2, 0.1],
    });
    b.part(new THREE.ConeGeometry(0.04, 0.1, 6), FUR_BELLY, {
      at: [s * 0.1, 0.92, 0.6],
      dir: [s * 0.8, -0.5, 0.3],
    });
  }
  // muzzle
  const muzzle = b.sweep(
    [
      [0, 0.955, 0.62],
      [0, 0.94, 0.76],
    ],
    [0.062, 0.03],
    {
      color: cel(
        furEdge(FUR, FUR_BELLY, { by: "position", axis: [0, 1, 0], level: 0.95, teeth: 0.012, period: 0.02, along: [1, 0, 0] }),
      ),
      sides: 8,
      caps: "round",
    },
  );
  void muzzle;
  // nose
  b.part(new THREE.SphereGeometry(0.02, 8, 6), "#2a1a38", { at: [0, 0.945, 0.795], scale: [1.1, 0.8, 0.9] });
  // mouth line
  const mouthSurf = b.surface(muzzle);
  for (const s of [1, -1]) {
    b.sweep(
      [
        [0, 0.93, 0.79],
        [s * 0.015, 0.915, 0.765],
        [s * 0.035, 0.915, 0.715],
        [s * 0.05, 0.925, 0.68],
      ],
      0.003,
      { color: INK, sides: 4, caps: "round" },
    );
  }
  void mouthSurf;
  // forehead mark (red) and cheek marks
  b.part(new THREE.SphereGeometry(1, 10, 6), RED, {
    at: [0, 1.04, 0.6],
    scale: [0.04, 0.025, 0.045],
  });
  b.part(new THREE.ConeGeometry(0.03, 0.08, 4), RED, { at: [0, 1.065, 0.585], dir: [0, 1, -0.2] });
  b.part(new THREE.CircleGeometry(0.03, 12), GOLD_FLAT, {
    at: [0, 1.05, 0.658],
    dir: [0, 0.2, 1],
    axis: "z",
  });

  // eyes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD).at(s * 36, 6);
    if (hit) {
      b.decal(skin, eyeTex, { at: hit, size: [0.05, 0.068], mirror: s > 0, roll: s * -12 });
    }
    // red eye-liner swoop
    b.sweep(
      [
        [s * 0.055, 1.005, 0.65],
        [s * 0.085, 1.015, 0.62],
        [s * 0.112, 1.04, 0.57],
      ],
      [0.004, 0.001],
      { color: RED_DEEP, sides: 4, caps: "round" },
    );
  }

  // ears (tall, with red tips and pink inside)
  for (const s of [1, -1]) {
    const earOuter = b.extrude(
      [
        [-0.06, 0],
        [0.06, 0],
        [0.04, 0.12],
        [0.0, 0.25, "sharp"],
        [-0.035, 0.12],
      ],
      {
        at: [s * 0.075, 1.04, 0.52],
        x: [s, 0, 0],
        y: [s * 0.35, 1, -0.2],
        thickness: [0.03, 0.01],
        bevel: 0.006,
        smoothing: 1,
        color: cel(gradient(FUR, RED, [0, 1.1, 0.5], [0, 1.28, 0.5])),
      },
    );
    b.extrude(
      [
        [-0.04, 0.01],
        [0.04, 0.01],
        [0.0, 0.19, "sharp"],
      ],
      {
        at: earOuter.local([0, 0, 0.012]),
        x: [s, 0, 0],
        y: [s * 0.35, 1, -0.2],
        thickness: 0.006,
        color: PINK,
      },
    );
    // ear tuft hairs
    b.part(new THREE.ConeGeometry(0.02, 0.07, 5), FUR_BELLY, {
      at: [s * 0.075, 1.045, 0.54],
      dir: [-s * 0.3, -0.3, 1],
    });
  }

  // ---------- gold crest on forehead (ornate crescent) ----------
  const crest = b.extrude(
    [
      [-0.06, 0],
      [-0.035, -0.02],
      [0, -0.01],
      [0.035, -0.02],
      [0.06, 0],
      [0.03, 0.04],
      [0.0, 0.1, "sharp"],
      [-0.03, 0.04],
    ],
    { at: [0, 1.07, 0.62], x: [1, 0, 0], y: [0, 1, 0.3], thickness: 0.008, bevel: 0.002, smoothing: 1, color: GOLD },
  );
  b.part(new THREE.SphereGeometry(0.013, 8, 6), "#ff3f5a", { at: crest.local([0, 0.02, 0.01]) });
  glow(b.part(new THREE.SphereGeometry(0.009, 6, 5), "#ff7a8a", { at: crest.local([0, 0.02, 0.014]) }), 1.2);

  // ---------- legs ----------
  const SOCK = cel("#3a2450", "#1c1030");
  const legPaint = paint((p) => (p.y < 0.17 ? SOCK : FUR));
  const legSpec: Array<{ s: number; z: number; hipY: number; front: boolean }> = [
    { s: 1, z: 0.28, hipY: 0.5, front: true },
    { s: -1, z: 0.28, hipY: 0.5, front: true },
    { s: 1, z: -0.3, hipY: 0.46, front: false },
    { s: -1, z: -0.3, hipY: 0.46, front: false },
  ];
  for (const L of legSpec) {
    const x = L.s * 0.085;
    const path = L.front
      ? catmull([
          [x, L.hipY, L.z],
          [x * 1.05, 0.3, L.z + 0.01],
          [x, 0.1, L.z + 0.02],
          [x, 0.035, L.z + 0.03],
        ])
      : catmull([
          [x * 1.15, L.hipY, L.z + 0.02],
          [x * 1.1, 0.34, L.z - 0.06],
          [x, 0.12, L.z - 0.02],
          [x, 0.035, L.z + 0.0],
        ]);
    b.sweep(path, L.front ? [0.065, 0.04, 0.032, 0.032] : [0.095, 0.05, 0.036, 0.034], {
      color: cel(paint((p) => (p.y < 0.19 ? "#2c1b3d" : (FUR as never)))),
      sides: 8,
      caps: "round",
    });
    void legPaint;
    // paw
    const footZ = path.at(1).z;
    b.part(new THREE.SphereGeometry(1, 8, 6), SOCK, { at: [x, 0.025, footZ + 0.035], scale: [0.04, 0.026, 0.06] });
    // toes
    for (const t of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), "#f6e8ff", {
        at: [x + t * 0.018, 0.016, footZ + 0.09 - Math.abs(t) * 0.006],
      });
    }
    // gold anklet
    b.sweep(
      [
        [x, 0.115, footZ],
        [x + 0.0, 0.115, footZ + 0.0001],
      ].length
        ? catmull(
            Array.from({ length: 9 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return [x + Math.cos(a) * 0.036, 0.11, footZ + 0.004 + Math.sin(a) * 0.036];
            }),
            { closed: true },
          )
        : path,
      0.006,
      { color: GOLD, sides: 5 },
    );
  }
  // fluff on front legs
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.04, 0.12, 6), FUR_BELLY, {
      at: [s * 0.1, 0.4, 0.3],
      dir: [0, -1, -0.3],
    });
  }

  // ---------- fur cards across the body, neck and haunches ----------
  const bodyHits = b.surface([body, chest, rump]).scatter(220, {
    rng: R,
    minDist: 0.05,
    filter: (h) => h.n.y < 0.5,
  });
  b.cards(bodyHits, furTuft, { size: [0.045, 0.1], lean: 62, bend: 25, vary: 0.3, rng: R, color: "#fff3e2" });
  const ruffHits = b.surface(chest).scatter(30, { rng: R, minDist: 0.04, filter: (h) => h.n.z > 0 });
  b.cards(ruffHits, furTuft, { size: [0.05, 0.12], lean: 70, bend: 30, vary: 0.25, rng: R, color: "#ffffff", flow: [0, -1, -0.2] });

  // ---------- ornamental collar & shimenawa rope ----------
  const collarPath = catmull(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [Math.cos(a) * 0.14, 0.84 + Math.sin(a) * 0.0 + 0.0, 0.46 + Math.sin(a) * 0.12 - Math.cos(a) * 0];
    }),
    { closed: true },
  );
  void collarPath;
  const neckLoop = catmull(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [Math.cos(a) * 0.125, 0.82 + Math.sin(a) * 0.05, 0.44 + Math.sin(a) * 0.08];
    }),
    { closed: true },
  );
  b.sweep(neckLoop, 0.014, { color: CORD, sides: 6 });
  b.sweep(neckLoop.slice(0, 1), 0.001, { color: CORD, sides: 3 });
  // paper shide on the rope
  const shideFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 4; i++) {
    const p = neckLoop.at(0.55 + i * 0.1);
    shideFrames.push(frame([p.x, p.y, p.z], [0, 1, 0]));
  }
  b.cards(shideFrames, paperTex, { size: [0.035, 0.09], lean: 180, flow: [0, 0, 1], vary: 0.1, rng: R });
  // gold bell at the throat
  const bellP = neckLoop.at(0.5);
  b.part(new THREE.SphereGeometry(0.03, 10, 8), GOLD, { at: [bellP.x, bellP.y - 0.03, bellP.z + 0.01] });
  b.part(new THREE.BoxGeometry(0.036, 0.004, 0.004), INK, { at: [bellP.x, bellP.y - 0.04, bellP.z + 0.04] });
  b.part(new THREE.TorusGeometry(0.01, 0.003, 5, 8), GOLD_FLAT, { at: [bellP.x, bellP.y, bellP.z + 0.01] });

  // chest medallion with a glowing gem
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.055, 0.008],
      [0.03, 0.018],
      [0, 0.02],
    ],
    { at: [0, 0.66, 0.58], axis: [0, 0.15, 1] as never, color: GOLD } as never,
  );
  glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), "#8fe6ff", { at: [0, 0.66, 0.6] }), 1.5);

  // ---------- back markings: painted red saddle drape & gold-edged cloth ----------
  const cloth = b.extrude(
    [
      [-0.16, 0],
      [0.16, 0],
      [0.19, -0.1],
      [0.1, -0.2],
      [0, -0.14, "sharp"],
      [-0.1, -0.2],
      [-0.19, -0.1],
    ],
    {
      at: [0, 0.8, 0.0],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: cel(
        paint((_p, n, s) => (Math.abs(s[0]) > 0.14 || s[1] < -0.17 ? GOLD_FLAT : Math.abs(n.y) > 0.5 ? "#c22a2f" : "#8a1c4a")),
      ),
    },
  );
  void cloth;

  // ---------- tails ----------
  // Nine tails fanned out behind the hips in a rising lotus fan.
  const tailBase: [number, number, number] = [0, 0.56, -0.5];
  const tailCoat = (tip: [number, number, number], base: [number, number, number]) =>
    cel(
      paint((p, n, s) => {
        void n;
        void s;
        const t = Math.min(1, Math.max(0, (p.clone().sub(new THREE.Vector3(...base)).dot(new THREE.Vector3(...tip).sub(new THREE.Vector3(...base)).normalize()) / new THREE.Vector3(...tip).sub(new THREE.Vector3(...base)).length())));
        if (t > 0.8) return mix("#9fefff", "#e9fbff", (t - 0.8) / 0.2);
        if (t > 0.62) return mix("#fff3e2", "#9fefff", (t - 0.62) / 0.18);
        if (t < 0.12) return "#fff3e2";
        return mix("#ffffff", "#ffb08a", Math.min(1, (t - 0.12) / 0.5) * 0.6);
      }),
    );
  const TAILS = 9;
  const tailTips: Array<[number, number, number]> = [];
  for (let i = 0; i < TAILS; i++) {
    const f = (i - (TAILS - 1) / 2) / ((TAILS - 1) / 2); // -1..1
    const side = f;
    const ang = f * 62 * DEG;
    const lift = 0.0 + (1 - Math.abs(f)) * 0.0;
    const mid = Math.abs(f);
    const len = 1.0 - mid * 0.12;
    const baseP: [number, number, number] = [side * 0.04, 0.58 + 0.01 * i * 0, -0.5];
    const p1: [number, number, number] = [
      Math.sin(ang) * 0.3,
      0.7 + (1 - mid) * 0.16 + mid * 0.02,
      -0.5 - Math.cos(ang) * 0.28,
    ];
    const p2: [number, number, number] = [
      Math.sin(ang) * 0.62,
      0.98 + (1 - mid) * 0.28 + mid * 0.1 + lift,
      -0.5 - Math.cos(ang) * 0.5 * len,
    ];
    const p3: [number, number, number] = [
      Math.sin(ang) * 0.9,
      1.28 + (1 - mid) * 0.28 + mid * 0.02,
      -0.5 - Math.cos(ang) * 0.58 * len + (1 - mid) * -0.05,
    ];
    const p4: [number, number, number] = [
      Math.sin(ang) * 1.05,
      1.52 + (1 - mid) * 0.3 - mid * 0.12,
      -0.5 - Math.cos(ang) * 0.58 * len + (1 - mid) * -0.1,
    ];
    const path = catmull([baseP, p1, p2, p3, p4]);
    tailTips.push(p4);
    const rBase = 0.07 - mid * 0.008;
    b.sweep(path, [rBase, rBase * 1.9, rBase * 2.2, rBase * 1.5, 0.012], {
      color: tailCoat(p4, baseP),
      sides: 8,
      caps: "point",
    });
    // red ink ring pattern near the base
    for (const tt of [0.3, 0.42]) {
      const ap = path.at(tt);
      void ap;
    }
    // spirit-flame wisp wrapped around each tail tip
    const tipFrames = [0.72, 0.8, 0.88, 0.95].map((tt) => {
      const pt = path.at(tt);
      return frame([pt.x, pt.y + 0.03, pt.z], [0, 1, 0]);
    });
    glow(
      b.cards(tipFrames, wispTex, {
        size: [0.07, 0.13],
        lean: 10,
        bend: 15,
        cross: true,
        flow: [Math.sin(ang), 0.2, -1],
        vary: 0.2,
        rng: R,
      }),
      1.2,
    );
    // fur tufts along tail
    const tailFrames = [0.2, 0.32, 0.44, 0.56, 0.68].map((tt) => {
      const pt = path.at(tt);
      const tg = path.tangentAt(tt);
      return frame([pt.x, pt.y, pt.z], [tg.x, tg.y, tg.z]);
    });
    void tailFrames;
    // gold tail ring (hoop) at 0.55
    const rp = path.at(0.5);
    const rt = path.tangentAt(0.5);
    b.part(new THREE.TorusGeometry(rBase * 2.1, 0.005, 5, 12), GOLD_FLAT, {
      at: [rp.x, rp.y, rp.z],
      dir: [rt.x, rt.y, rt.z],
      axis: "z",
    });
    // red tuft stripes on tail (ink lines)
    const rp2 = path.at(0.3);
    const rt2 = path.tangentAt(0.3);
    b.part(new THREE.TorusGeometry(rBase * 1.7, 0.006, 4, 10), CORD, {
      at: [rp2.x, rp2.y, rp2.z],
      dir: [rt2.x, rt2.y, rt2.z],
      axis: "z",
    });
  }

  // ---------- spirit flames (hovering foxfire orbs) ----------
  const orbs: Array<[number, number, number, number]> = [
    [0.55, 0.9, 0.5, 0.07],
    [-0.6, 1.1, 0.35, 0.06],
    [0.7, 0.45, 0.2, 0.05],
    [-0.65, 0.5, 0.55, 0.055],
    [0.35, 1.35, 0.7, 0.045],
    [-0.4, 1.4, 0.25, 0.05],
    [0.0, 1.75, -0.25, 0.06],
    [0.9, 1.5, -0.4, 0.05],
    [-0.9, 1.55, -0.5, 0.05],
  ];
  orbs.forEach(([x, y, z, r], i) => {
    const col = i % 2 ? FLAME_B : FLAME_A;
    glow(b.part(new THREE.SphereGeometry(r * 0.6, 8, 6), FLAME_C, { at: [x, y, z] }), 1.4);
    glow(b.part(new THREE.IcosahedronGeometry(r, 0), col, { at: [x, y, z] }), 1.1);
    glow(
      b.part(new THREE.ConeGeometry(r * 0.8, r * 3.2, 6), col, { at: [x, y + r * 2.4, z] }),
      1.1,
    );
    glow(
      b.cards([frame([x, y + r * 0.2, z], [0, 1, 0])], flameTex, {
        size: [r * 2.6, r * 4],
        cross: true,
        flow: [0, 0.2, 1],
        sink: 0,
      }),
      1.3,
    );
  });

  // ---------- spirit circle on the floor (glowing runes) ----------
  glow(
    b.part(new THREE.CircleGeometry(1.35, 48), "#ffffff", {
      at: [0, 0.004, -0.1],
      dir: [0, 1, 0],
      axis: "z",
      texture: runeRing,
    }),
    1.0,
  );
  // little lit lanterns around the circle edge
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const x = Math.cos(a) * 1.35;
    const z = Math.sin(a) * 1.35 - 0.1;
    b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.05, 6), "#3a2450", { at: [x, 0.025, z] });
    glow(b.part(new THREE.IcosahedronGeometry(0.03, 0), FLAME_A, { at: [x, 0.07, z] }), 1.3);
  }

  // ---------- tassels from the cloth ----------
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.17, 0.75, 0.0],
        [s * 0.2, 0.66, 0.0],
      ],
      0.005,
      { color: CORD, sides: 5 },
    );
    b.part(new THREE.SphereGeometry(0.022, 8, 6), GOLD_FLAT, { at: [s * 0.2, 0.64, 0.0] });
    b.cards([frame([s * 0.2, 0.64, 0.0], [0, 1, 0])], paperTex, { size: [0.03, 0.12], lean: 180, flow: [0, 0, 1], color: "#d62f43" });
  }

  // red kumadori-style marks on shoulders (flat decals)
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      at: [s * 0.172, 0.68, 0.18],
      dir: [s, 0, 0],
      axis: "z",
      texture: markTex,
    });
  }
  void inkLines;
  void DARK;
  void RED_DEEP;
  void WHITE_FLAT;

  return b.root;
}
