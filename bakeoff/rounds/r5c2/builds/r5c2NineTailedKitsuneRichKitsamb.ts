import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, grain, scales, mottle, noise, svg, DEG } from "../../../../src/index";
import { cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A high-fantasy anime kitsune: white fox with vermilion markings, nine fanned tails tipped in spirit fire, shimenawa rope and glowing magatama, standing on a mossy shrine dais with a torii, stone lanterns, a nine-pointed rune circle and drifting hitodama flames.",
};

type V3 = [number, number, number];
type Outline = Array<[number, number] | [number, number, "sharp"]>;

// The shrine dais top sits at G; the fox is designed from y = 0 and lifted by G.
const G = 0.12;
const P = (x: number, y: number, z: number): V3 => [x, y + G, z];

// ---------------------------------------------------------------- palette
const FUR = cel("#fffaf1", "#cdc6ee");
const BELLY = cel("#ffe2b8", "#e6b6c6");
const VERM = cel("#ee4a30", "#a8264a");
const CRIM = cel("#c62d57", "#7d2352");
const SOCK = cel("#352a58", "#1d1636");
const COAT = furEdge(FUR, BELLY, { level: -0.5, teeth: 0.3, period: 0.04 });
const LEGC = furEdge(FUR, SOCK, {
  by: "position",
  axis: [0, 1, 0],
  level: G + 0.26,
  teeth: 0.05,
  period: 0.04,
  along: [1, 0, 1],
  ink: INK,
});
const TAILC = paint((_p, _n, s) => (s[0] > 0.76 + 0.07 * zigzag(s[1] / 40) ? VERM : FUR));
const EARC = paint((_p, _n, s) => (s[1] > 0.15 ? VERM : FUR));
const CHEEKC = paint((_p, _n, s) => (s[0] > 0.07 + 0.012 * zigzag(s[1] * 90) ? VERM : FUR));
const GOLD = "#f4c95d";
const PAPER = "#fffdf5";
const ROPE = paint((_p, _n, s) => (((((s[1] - s[0] * 3600) % 90) + 90) % 90 < 45 ? "#ecd89f" : "#a8844a")));
const TORII = cel(grain("#dc4630", "#b8322a", { size: 0.03, axis: "y" }));
const BLACKW = "#524485";
const MOSS = "#5f9a64";
const STONE_SCALES = scales(["#8e94ad", "#9aa0b8", "#80879f"], "#4b4f6b", { size: 0.26, width: 0.1 });
const MOSSY = paint((p, n) => (noise(p, 0.28, 5) > 0.6 + 0.25 * (1 - Math.min(1, n.y * 1.2)) ? MOSS : STONE_SCALES));
const LSTONE = mottle("#a9adc6", "#838aa8", { size: 0.1, contrast: 1.4 });

// ---------------------------------------------------------------- outlines
const flameShape = (k: number): Outline => [
  [0, 0],
  [0.055 * k, 0.035 * k],
  [0.072 * k, 0.1 * k],
  [0.055 * k, 0.17 * k],
  [0.078 * k, 0.26 * k, "sharp"],
  [0.03 * k, 0.21 * k],
  [0.012 * k, 0.37 * k, "sharp"],
  [-0.02 * k, 0.24 * k],
  [-0.06 * k, 0.15 * k],
  [-0.068 * k, 0.07 * k],
  [-0.04 * k, 0.02 * k],
];
const EAR: Outline = [
  [-0.085, 0],
  [0.085, 0],
  [0.07, 0.16],
  [0.006, 0.4, "sharp"],
  [-0.068, 0.16],
];
const EAR_IN: Outline = [
  [-0.052, 0.02],
  [0.052, 0.02],
  [0.04, 0.16],
  [0.004, 0.33, "sharp"],
  [-0.04, 0.16],
];
const CHEEK: Outline = [
  [0, 0.06],
  [0.05, 0.075],
  [0.045, 0.04],
  [0.1, 0.03],
  [0.07, 0],
  [0.11, -0.04],
  [0.05, -0.04],
  [0, -0.05],
];
const SHIDE: Outline = [
  [-0.02, 0],
  [0.02, 0],
  [0.02, -0.05],
  [-0.005, -0.065],
  [0.02, -0.08],
  [-0.02, -0.1],
];
const KASAGI: Outline = [
  [-1.5, 0],
  [1.5, 0],
  [1.68, 0.11],
  [1.5, 0.17],
  [0.6, 0.12],
  [-0.6, 0.12],
  [-1.5, 0.17],
  [-1.68, 0.11],
];

export default function build() {
  const b = createBuilder({ name: "kitsune" });

  // ------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 90 44">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7d1a"/><stop offset="0.55" stop-color="#ffcf3a"/><stop offset="1" stop-color="#fff2a0"/></linearGradient>
      <clipPath id="c"><path d="M14 18 Q44 0 74 20 Q82 26 84 34 Q46 44 14 18Z"/></clipPath>
    </defs>
    <path d="M14 18 Q44 0 74 20 Q82 26 84 34 Q46 44 14 18Z" fill="url(#g)"/>
    <g clip-path="url(#c)">
      <ellipse cx="50" cy="24" rx="6" ry="17" fill="#2a1238"/>
      <circle cx="44" cy="13" r="5" fill="#ffffff"/>
      <circle cx="57" cy="31" r="2.6" fill="#ffffff"/>
    </g>
    <path d="M14 18 Q44 0 74 20 Q82 26 84 34" stroke="#2a1238" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M14 18 Q8 12 2 5" stroke="#e0344f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M18 24 Q44 40 80 38" stroke="#e0344f" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );
  const MARK = svg(
    `<svg viewBox="0 0 40 60">
    <path d="M20 2 C28 16 36 28 30 44 C28 52 22 58 20 58 C18 58 12 52 10 44 C4 28 12 16 20 2Z" fill="#e0344f" stroke="#7a1030" stroke-width="2"/>
    <path d="M20 14 C25 24 28 32 24 42 C22 46 20 48 20 48 C20 48 16 44 15 38 C14 30 18 22 20 14Z" fill="#ffd36b"/>
  </svg>`,
    { size: 128 },
  );
  const SWIRL = svg(
    `<svg viewBox="0 0 64 64">
    <path d="M34 4 C54 14 58 36 46 50 C38 60 20 62 12 50 C6 40 12 30 22 32 C16 38 20 46 28 44 C38 41 40 24 34 4Z" fill="#e0344f" stroke="#7a1030" stroke-width="1.5"/>
    <path d="M34 16 C44 24 46 38 38 46" stroke="#ffd36b" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 192 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64">
    <path d="M2 62 C4 40 10 20 18 2 C24 22 30 42 30 62Z" fill="#ffffff" stroke="#efeaff" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 58 C16 40 17 26 18 14" stroke="#f4f0ff" stroke-width="2" fill="none"/>
  </svg>`,
    { size: 128 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 40 60">
    <path d="M4 60 C6 40 8 22 12 6 C16 24 18 42 20 60Z" fill="#6ec06a"/>
    <path d="M14 60 C18 36 24 18 30 2 C32 24 32 44 34 60Z" fill="#4a9f5c"/>
    <path d="M22 60 C24 46 30 34 38 26 C38 40 36 52 36 60Z" fill="#3f8f58"/>
  </svg>`,
    { size: 128 },
  );
  const star = (n: number, k: number, r: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i * k * 2 * Math.PI) / n - Math.PI / 2;
      return `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  const nodes = Array.from({ length: 9 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 9 - Math.PI / 2;
    return `<circle cx="${(100 + 86 * Math.cos(a)).toFixed(1)}" cy="${(100 + 86 * Math.sin(a)).toFixed(1)}" r="4.2" fill="#fff6a8"/>`;
  }).join("");
  const RUNE = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="97" fill="none" stroke="#5ff0ff" stroke-width="2.6"/>
    <circle cx="100" cy="100" r="91" fill="none" stroke="#5ff0ff" stroke-width="1.6" stroke-dasharray="3 4"/>
    <circle cx="100" cy="100" r="76" fill="none" stroke="#a98bff" stroke-width="2"/>
    <polygon points="${star(9, 4, 74)}" fill="none" stroke="#5ff0ff" stroke-width="2.4" stroke-linejoin="round"/>
    <polygon points="${star(9, 2, 74)}" fill="none" stroke="#a98bff" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="100" cy="100" r="22" fill="none" stroke="#5ff0ff" stroke-width="2.4"/>
    <path d="M100 82 C108 92 112 100 108 108 C106 113 102 115 100 115 C98 115 94 113 92 108 C88 100 92 92 100 82Z" fill="#8ff6ff"/>
    ${nodes}
  </svg>`,
    { size: 1024 },
  );
  const petals = Array.from({ length: 9 }, (_, i) => {
    const a = -80 + i * 20;
    return `<path d="M0 0 C8 -14 8 -34 0 -50 C-8 -34 -8 -14 0 0Z" transform="rotate(${a})" fill="#f4c95d" stroke="#8a5a1a" stroke-width="1"/>`;
  }).join("");
  const PLAQUE = svg(
    `<svg viewBox="0 0 100 130">
    <rect x="2" y="2" width="96" height="126" rx="6" fill="#1d1a30" stroke="#f4c95d" stroke-width="4"/>
    <g transform="translate(50 78)">${petals}</g>
    <circle cx="50" cy="28" r="9" fill="#e0344f" stroke="#f4c95d" stroke-width="2"/>
  </svg>`,
    { size: 256 },
  );
  const LAMP = svg(
    `<svg viewBox="0 0 128 64">
    <defs><linearGradient id="l" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#ff9a3a"/></linearGradient></defs>
    <rect width="128" height="64" fill="url(#l)"/>
    <path d="M0 0H128M0 64H128" stroke="#2b2236" stroke-width="10"/>
    <path d="M0 0V64M16 0V64M32 0V64M48 0V64M64 0V64M80 0V64M96 0V64M112 0V64M128 0V64" stroke="#2b2236" stroke-width="5"/>
    <path d="M24 44 C30 34 34 28 32 18 C40 26 44 36 38 46 Z" fill="#fff6c8" opacity="0.9"/>
  </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: P(0, 0.74, -0.3), dir: [0, 0, 1] });
  const baseJ = b.joint("base", { parent: hips, at: [0, 0, 0], dir: [0, 1, 0] });
  const flameRing = b.joint("flameRing", { parent: hips, at: P(0, 1, 0), dir: [0, 1, 0] });
  const spine = b.chain("spine", catmull([P(0, 0.74, -0.3), P(0, 0.77, -0.02), P(0, 0.8, 0.24)]), {
    parent: hips,
    role: "spine",
    count: 3,
  });
  const neck = b.chain("neck", catmull([P(0, 0.8, 0.24), P(0, 0.93, 0.38), P(0, 1.06, 0.5)]), {
    parent: spine.joints[2],
    role: "neck",
    count: 2,
  });
  const neckJ = neck.joints[1];
  const head = b.joint("head", { parent: neckJ, at: P(0, 1.06, 0.5), dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 1.04, 0.6), aim: P(0, 1.05, 0.8), role: "jaw" });

  // ------------------------------------------------------------ body
  const bodyPath = catmull([
    P(0, 0.74, -0.46),
    P(0, 0.75, -0.3),
    P(0, 0.78, -0.02),
    P(0, 0.81, 0.24),
    P(0, 0.94, 0.4),
    P(0, 1.05, 0.5),
    P(0, 1.08, 0.56),
  ]);
  const body = b.sweep(
    bodyPath,
    (t): [number, number] => {
      const belly = Math.exp(-(((t - 0.36) / 0.26) ** 2));
      const k = Math.max(0, (t - 0.6) / 0.4);
      return [(0.1 + 0.04 * belly) * (1 - 0.45 * k), (0.115 + 0.05 * belly) * (1 - 0.4 * k)];
    },
    { bone: [spine, neck, head], color: COAT, sides: 10, caps: { start: "round", end: "round" } },
  );
  b.part(new THREE.SphereGeometry(1, 10, 8), FUR, { bone: hips, at: P(0, 0.8, -0.5), scale: [0.1, 0.11, 0.1] });

  // ------------------------------------------------------------ legs
  const paw = (x: number, z: number, bone: typeof hips, len: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), SOCK, { bone, at: P(x, 0.028, z), scale: [0.042, 0.03, len] });
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(0.016, 6, 4), SOCK, {
        bone,
        at: P(x + k * 0.024, 0.016, z + len * 0.8 - Math.abs(k) * 0.01),
      });
  };
  const haunches: ReturnType<typeof b.part>[] = [];
  const shoulders: ReturnType<typeof b.part>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(
      `legF${side}`,
      limb(P(s * 0.1, 0.7, 0.22), P(s * 0.1, 0.04, 0.27), [0.3, 0.27, 0.14], [
        [0, 0, -1],
        [0, 0, 1],
      ]),
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
        role: "leg",
        contact: P(s * 0.1, 0, 0.3),
      },
    );
    b.sweep(front, [0.058, 0.044, 0.034, 0.03, 0.032], { color: LEGC, sides: 8 });
    paw(s * 0.1, 0.29, front.joints[3], 0.07);
    shoulders.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), FUR, {
        bone: front.joints[0],
        at: P(s * 0.105, 0.72, 0.2),
        scale: [0.07, 0.13, 0.12],
      }),
    );

    const hind = b.chain(
      `legH${side}`,
      limb(P(s * 0.1, 0.7, -0.34), P(s * 0.1, 0.045, -0.4), [0.3, 0.3, 0.17], [
        [0, 0, 1],
        [0, 0, -1],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
        role: "leg",
        contact: P(s * 0.1, 0, -0.36),
      },
    );
    b.sweep(hind, [0.07, 0.05, 0.034, 0.028, 0.03], { color: LEGC, sides: 8 });
    paw(s * 0.1, -0.36, hind.joints[3], 0.07);
    haunches.push(
      b.part(new THREE.SphereGeometry(1, 10, 8), FUR, {
        bone: hind.joints[0],
        at: P(s * 0.105, 0.7, -0.33),
        scale: [0.08, 0.15, 0.16],
      }),
    );
  }

  // ------------------------------------------------------------ head
  const C = P(0, 1.12, 0.6);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FUR, {
    bone: head,
    at: C,
    scale: [0.105, 0.095, 0.12],
  });
  b.sweep([P(0, 1.095, 0.68), P(0, 1.08, 0.84)], (t): [number, number] => [0.062 - 0.038 * t, 0.05 - 0.028 * t], {
    bone: head,
    color: FUR,
    caps: { start: "flat", end: "round" },
    sides: 8,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#2a1f3a", { bone: head, at: P(0, 1.085, 0.855), scale: [0.024, 0.018, 0.02] });
  b.sweep([P(0, 1.04, 0.6), P(0, 1.05, 0.8)], (t): [number, number] => [0.05 - 0.028 * t, 0.025 - 0.011 * t], {
    bone: jaw,
    color: FUR,
    caps: { start: "round", end: "round" },
    sides: 8,
  });
  b.part(new THREE.BoxGeometry(0.06, 0.01, 0.14), "#5a1a3c", { bone: head, at: P(0, 1.058, 0.74) });
  b.part(new THREE.BoxGeometry(0.04, 0.008, 0.12), "#ff7a9a", { bone: jaw, at: P(0, 1.045, 0.72) });

  for (const s of [1, -1]) {
    // fangs
    b.part(new THREE.ConeGeometry(0.008, 0.03, 5), PAPER, { bone: head, at: P(s * 0.028, 1.058, 0.77), dir: [0, -1, 0] });
    // ears
    b.extrude(EAR, {
      at: P(s * 0.06, 1.155, 0.54),
      x: [s, 0, 0],
      y: [s * 0.3, 1, -0.12],
      thickness: 0.022,
      bevel: 0.004,
      color: EARC,
      bone: head,
    });
    b.extrude(EAR_IN, {
      at: P(s * 0.06, 1.155, 0.548),
      x: [s, 0, 0],
      y: [s * 0.3, 1, -0.12],
      thickness: 0.022,
      bevel: 0.003,
      color: CRIM,
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.018, 0.004, 5, 10), GOLD, {
      bone: head,
      at: P(s * 0.108, 1.15, 0.53),
      dir: [s, 0, 0],
      axis: "z",
    });
    // cheek ruff
    b.extrude(CHEEK, {
      at: P(s * 0.095, 1.115, 0.62),
      x: [s * 0.5, 0, -1],
      thickness: 0.03,
      bevel: 0.005,
      color: CHEEKC,
      bone: head,
    });
    // whiskers
    for (const k of [-1, 0, 1])
      b.rod(P(s * 0.04, 1.09, 0.78), P(s * 0.19, 1.1 + k * 0.025, 0.74 - 0.01 * k), 0.0025, {
        color: PAPER,
        bone: head,
        sides: 4,
      });
    // eyes
    b.decal(skull, EYE, {
      at: P(s * 0.075, 1.16, 0.67),
      dir: [s * 0.75, 0.15, 0.65],
      size: [0.125, 0.062],
      mirror: s > 0,
    });
  }
  const forehead = b.surface(skull).around(C).at(0, 50);
  if (forehead) {
    b.decal(skull, MARK, { at: forehead, size: [0.04, 0.06] });
    glow(b.stick(new THREE.OctahedronGeometry(0.014, 0), "#59f0ff", forehead, { embed: 0.2 }), 1.6);
  }

  // ------------------------------------------------------------ markings and fur
  for (const s of [1, -1]) {
    b.decal(haunches[s > 0 ? 0 : 1], SWIRL, {
      at: P(s * 0.19, 0.7, -0.33),
      dir: [s, 0, 0],
      size: [0.17, 0.17],
      mirror: s > 0,
    });
    b.decal(shoulders[s > 0 ? 0 : 1], SWIRL, {
      at: P(s * 0.175, 0.72, 0.2),
      dir: [s, 0, 0],
      size: [0.12, 0.12],
      mirror: s > 0,
    });
  }
  const bodySkin = b.surface(body);
  const chestHits = bodySkin.scatter(60, {
    rng: rng(3),
    minDist: 0.04,
    filter: (h) => h.n.z > 0.35 && h.at.z > 0.18 && h.at.y > G + 0.55 && h.at.y < G + 0.98,
  });
  b.cards(chestHits, TUFT, {
    size: [0.07, 0.13],
    lean: 70,
    bend: 20,
    flow: [0, -1, 0.1],
    vary: 0.3,
    rng: rng(4),
    cross: true,
  });

  // ------------------------------------------------------------ shimenawa, shide, magatama
  const ropeLoop = bodySkin.loop(neckJ, { lift: 0.01 });
  b.sweep(ropeLoop, 0.02, { color: ROPE, sides: 6 });
  b.along(ropeLoop, 5, (at) => {
    b.extrude(SHIDE, { at, x: at.axis, thickness: 0.004, color: PAPER });
  });
  const F = bodySkin.around(neckJ.at).at(0, -30);
  if (F) {
    const mp = (x: number, y: number): V3 => [F.at.x + x, F.at.y + y - 0.03, F.at.z + 0.035];
    glow(
      b.sweep(
        catmull([mp(0.008, 0), mp(0.022, -0.02), mp(0.012, -0.048), mp(-0.014, -0.05), mp(-0.03, -0.03)]),
        (t) => 0.02 * (1 - t) + 0.004,
        { color: "#59f0ff", bone: neckJ, caps: { start: "round", end: "point" }, sides: 6 },
      ),
      1.5,
    );
    b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 8), GOLD, { bone: neckJ, at: mp(0.01, 0.012), dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.SphereGeometry(0.026, 8, 6), GOLD, { bone: neckJ, at: mp(0.04, -0.045) });
  }

  // ------------------------------------------------------------ spirit flames
  const flame = (at: V3, h: number, bone: typeof hips, outer: string, inner: string) => {
    const k = h / 0.3;
    for (const x of [
      [1, 0, 0],
      [0, 0, 1],
    ] as V3[]) {
      glow(
        b.extrude(flameShape(k), { at, x, thickness: 0.05 * k, bevel: 0.012 * k, smoothing: 1, color: outer, bone }),
        1.3,
      );
      glow(
        b.extrude(flameShape(k * 0.55), {
          at: [at[0], at[1] + 0.01 * k, at[2]],
          x,
          thickness: 0.056 * k,
          bevel: 0.01 * k,
          smoothing: 1,
          color: inner,
          bone,
        }),
        1.6,
      );
    }
  };
  const CYAN: [string, string] = ["#3fd8ff", "#e4fbff"];
  const VIOLET: [string, string] = ["#9b6bff", "#f0e2ff"];

  // ------------------------------------------------------------ nine tails
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const th = u * 68 * DEG;
    const dx = Math.sin(th);
    const dy = Math.cos(th);
    const L = 0.95 + 0.17 * (1 - Math.abs(u));
    const pts = [0, 0.3, 0.64, 1].map((s) =>
      P(
        u * 0.035 + dx * L * s * 0.95,
        0.78 + dy * L * s * 0.8 + 0.12 * Math.abs(u) * s * s + 0.05,
        -0.5 - 0.34 * s + 0.07 * u * Math.sin(s * Math.PI),
      ),
    );
    const tail = b.chain(`tail${i + 1}_`, catmull(pts), { parent: hips, role: "tail", count: 4 });
    const sw = b.sweep(tail, (t) => 0.03 + 0.07 * Math.sin(Math.PI * Math.pow(t, 1.2)), {
      color: TAILC,
      caps: { start: "round", end: "point" },
      sides: 8,
    });
    const tipV = new THREE.Vector3(...pts[3]);
    const dirV: V3 = [pts[3][0] - pts[0][0], pts[3][1] - pts[0][1], pts[3][2] - pts[0][2]];
    const hits = b.surface(sw).scatter(13, {
      rng: rng(30 + i),
      minDist: 0.06,
      filter: (h) => h.at.distanceTo(tipV) > 0.28,
    });
    b.cards(hits, TUFT, { size: [0.05, 0.09], lean: 78, bend: 15, flow: dirV, cross: true, vary: 0.3, rng: rng(60 + i) });
    const [o, n] = i % 2 ? VIOLET : CYAN;
    flame([pts[3][0], pts[3][1] + 0.03, pts[3][2]], 0.2, tail.joints[3], o, n);
  }

  // ------------------------------------------------------------ orbiting hitodama and embers
  for (let i = 0; i < 9; i++) {
    const phi = (45 + 33 * i) * DEG;
    const rho = 1.15 + 0.08 * Math.sin(1.9 * i);
    const y = 1.0 + ((i * 5) % 9) * 0.1;
    const [o, n] = i % 2 ? VIOLET : CYAN;
    flame(P(Math.sin(phi) * rho, y, Math.cos(phi) * rho), 0.2 + 0.04 * (i % 3), flameRing, o, n);
  }
  const rr = rng(11);
  for (let i = 0; i < 30; i++) {
    const a = rr() * Math.PI * 2;
    const r = 0.5 + rr() * 1.1;
    const y = 0.25 + rr() * 2.0;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const size = 0.012 + rr() * 0.012;
    if (z < -0.25 && Math.abs(x) < 1.0 && y > 0.7) continue;
    glow(
      b.part(new THREE.OctahedronGeometry(size, 0), i % 3 === 0 ? "#ffd86b" : i % 2 ? "#7fe9ff" : "#b79bff", {
        bone: flameRing,
        at: P(x, y, z),
      }),
      1.5,
    );
  }

  // ------------------------------------------------------------ shrine dais
  const dais = b.lathe(
    [
      [0, 0],
      [1.72, 0],
      [1.76, 0.02],
      [1.76, 0.05],
      [1.7, 0.065],
      [1.5, 0.065],
      [1.5, 0.11],
      [1.46, 0.12],
      [0, 0.12],
    ],
    { at: [0, 0, 0], bone: baseJ, segments: 16, color: MOSSY },
  );
  glow(
    b.part(new THREE.PlaneGeometry(2.6, 2.6), "#ffffff", {
      bone: baseJ,
      at: P(0, 0.004, 0),
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE,
    }),
    1,
  );
  const grassHits = b.surface(dais).scatter(70, {
    rng: rng(5),
    minDist: 0.1,
    filter: (h) => h.n.y > 0.8 && Math.hypot(h.at.x, h.at.z) > 1.35,
  });
  b.cards(grassHits, GRASS, { size: [0.1, 0.18], lean: 10, vary: 0.4, spin: 180, rng: rng(6), cross: true, bone: baseJ });

  // ------------------------------------------------------------ torii
  for (const s of [1, -1]) {
    b.rod([s * 1.0, G - 0.01, -1.35], P(s * 1.0, 2.02, -1.35), [0.09, 0.075], { color: TORII, bone: baseJ, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.105, 0.115, 0.22, 8), BLACKW, { bone: baseJ, at: P(s * 1.0, 0.1, -1.35) });
  }
  b.part(new THREE.BoxGeometry(2.35, 0.1, 0.11), TORII, { bone: baseJ, at: P(0, 1.62, -1.35) });
  b.part(new THREE.BoxGeometry(3.0, 0.07, 0.2), BLACKW, { bone: baseJ, at: P(0, 2.03, -1.35) });
  b.extrude(KASAGI, { at: P(0, 2.065, -1.35), x: [1, 0, 0], thickness: 0.3, bevel: 0.01, color: BLACKW, bone: baseJ });
  b.part(new THREE.BoxGeometry(0.42, 0.5, 0.05), BLACKW, { bone: baseJ, at: P(0, 1.82, -1.35) });
  b.part(new THREE.PlaneGeometry(0.38, 0.46), "#ffffff", {
    bone: baseJ,
    at: P(0, 1.82, -1.35 + 0.0265),
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE,
  });

  // ------------------------------------------------------------ stone lanterns
  for (const s of [1, -1]) {
    const lx = s * 1.32;
    const lz = 0;
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.2, 0.04],
        [0.12, 0.07],
        [0, 0.07],
      ],
      { at: P(lx, 0, lz), bone: baseJ, segments: 8, color: LSTONE },
    );
    b.rod(P(lx, 0.07, lz), P(lx, 0.42, lz), [0.06, 0.05], { color: LSTONE, bone: baseJ, sides: 8 });
    b.lathe(
      [
        [0, 0],
        [0.16, 0],
        [0.2, 0.03],
        [0.2, 0.05],
        [0, 0.05],
      ],
      { at: P(lx, 0.42, lz), bone: baseJ, segments: 8, color: LSTONE },
    );
    glow(
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8), "#ffffff", {
        bone: baseJ,
        at: P(lx, 0.57, lz),
        texture: LAMP,
      }),
      1.2,
    );
    b.lathe(
      [
        [0, 0],
        [0.3, 0],
        [0.26, 0.04],
        [0.1, 0.14],
        [0.05, 0.2],
        [0, 0.22],
      ],
      { at: P(lx, 0.67, lz), bone: baseJ, segments: 8, color: LSTONE },
    );
    b.part(new THREE.SphereGeometry(0.035, 8, 6), LSTONE, { bone: baseJ, at: P(lx, 0.92, lz) });
  }

  return b.root;
}
