import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda balancing on a mossy boulder, tail raised as a counterweight, wearing a teal scarf with gold tassels and a Dendro charm; glowing Dendro rune, sprout and seeds.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (every surface is a two-tone cel)

const T = 0.335; // top of the stone
const GOLD = cel("#ffd45c", "#cf8a1f");
const TEAL = cel("#38d6c4", "#2a8fb4");
const TEAL_D = cel("#1e9fb0", "#206a9a");
const CREAM = cel("#fff3da", "#f2c9a4");
const BELLY = "#4c2522";
const NOSE = cel("#34203a", INK);
const PINK = cel("#ff9fb0", "#e0607e");
const CLAW = cel("#ffeccc", "#e8bfa0");
const LEAF = cel("#8fe05a", "#3fae6a");
const LEAF_D = cel("#5fc84a", "#2a8f68");

const RUST_BACK = "#f58c3e";
const RUST = "#e8622a";
const TEAR = "#a82f1c";
const RING_A = "#ee7430";
const RING_B = "#c4501f";
const TAIL_TIP = "#4a2320";

const coat = cel(
  furEdge(
    paint((_p, n) => (n.y > 0.72 ? RUST_BACK : RUST)),
    BELLY,
    { level: -0.22, teeth: 0.26, period: 0.03, ink: INK, inkWidth: 0.045 },
  ),
);
const legCoat = cel(
  furEdge(coat, "#3f1e1d", {
    by: "position",
    level: T + 0.125,
    teeth: 0.03,
    period: 0.03,
    along: [1, 0, 0],
    ink: INK,
    inkWidth: 0.004,
  }),
);
const pawPaint = cel("#321718", "#241014");

const tailPaint = cel(
  paint((_p, _n, s) => {
    const L = 0.66;
    const d = s[0] * L;
    if (s[0] > 0.9) return TAIL_TIP;
    const ring = Math.floor((d + 0.016 * zigzag(s[1] / 50)) / 0.075);
    return ring % 2 === 0 ? RING_A : RING_B;
  }),
);

const stonePaint = cel(
  paint((p, n) => {
    const nz = noise(p, 0.14, 3);
    const grow = n.y * 0.9 + (nz - 0.5) * 0.9 + (p.y - 0.17) * 1.8;
    if (grow > 0.55) return noise(p, 0.045, 9) > 0.62 ? "#a4f070" : "#7fd652";
    if (grow > 0.46) return "#4da84a";
    return noise(p, 0.1, 5) > 0.55 ? "#aebcc6" : "#97a6b6";
  }),
);
const mossPaint = cel(mottle("#8de25a", "#66c94a", { size: 0.06, seed: 4, contrast: 1.4 }));
const pebblePaint = cel(mottle("#b2bfc9", "#9aa8b9", { size: 0.08, seed: 2 }));
const turfPaint = cel(
  paint((p, n) => {
    if (n.y < 0.5) return "#6b4630";
    return noise(p, 0.18, 11) > 0.5 ? "#92e060" : "#79cf52";
  }),
);

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const tuftTex = svg(
  `<svg viewBox="0 0 32 64"><path d="M1 64 Q4 28 16 1 Q28 28 31 64Z" fill="#ffffff"/></svg>`,
  { size: 96 },
);
const mossDripTex = svg(
  `<svg viewBox="0 0 24 40"><path d="M0 40 Q3 16 12 1 Q21 16 24 40Z" fill="#79d34e"/><path d="M6 40 Q8 20 12 8 Q15 20 18 40Z" fill="#a6ee74"/></svg>`,
  { size: 96 },
);
const grassTex = svg(
  `<svg viewBox="0 0 40 40"><path d="M2 40 Q6 18 10 2 Q16 20 18 40Z" fill="#5cc447"/><path d="M12 40 Q20 14 26 0 Q30 20 32 40Z" fill="#8be05a"/><path d="M24 40 Q32 22 38 10 Q38 28 38 40Z" fill="#4ea93f"/></svg>`,
  { size: 128 },
);
const frondTex = (() => {
  let leaves = "";
  for (let i = 0; i < 9; i++) {
    const y = 72 - i * 7.2;
    const w = 15 - i * 1.15;
    leaves += `<path d="M20 ${y + 3} Q${20 - w} ${y - 2} ${20 - w - 1} ${y - 7} Q${20 - 4} ${y - 5} 20 ${y}Z" fill="${i % 2 ? "#67cd4c" : "#85e056"}"/>`;
    leaves += `<path d="M20 ${y + 3} Q${20 + w} ${y - 2} ${20 + w + 1} ${y - 7} Q${20 + 4} ${y - 5} 20 ${y}Z" fill="${i % 2 ? "#85e056" : "#67cd4c"}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 40 80"><path d="M20 80 Q21 40 20 4" stroke="#3f9a45" stroke-width="3" fill="none"/>${leaves}</svg>`,
    { size: 192 },
  );
})();
const runeRing = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="none" stroke="#ffd45c" stroke-width="3.2"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#f0a73a" stroke-width="2"/>
  <g fill="#ffd45c">${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<circle cx="${50 + 42 * Math.cos(a)}" cy="${50 + 42 * Math.sin(a)}" r="2.2"/>`;
  }).join("")}</g>
  <path d="M50 4 Q56 12 50 18 Q44 12 50 4Z M50 96 Q56 88 50 82 Q44 88 50 96Z M4 50 Q12 44 18 50 Q12 56 4 50Z M96 50 Q88 44 82 50 Q88 56 96 50Z" fill="#ffd45c"/>
  </svg>`,
  { size: 384 },
);
const runeGlyph = svg(
  `<svg viewBox="0 0 100 100">
  <path d="M50 22 Q72 34 68 56 Q64 72 50 78 Q36 72 32 56 Q28 34 50 22Z" fill="none" stroke="#9bff7a" stroke-width="4"/>
  <path d="M50 80 L50 40 M50 62 Q38 58 34 48 M50 52 Q62 50 66 40" stroke="#c9ffa8" stroke-width="3.4" fill="none"/>
  <circle cx="50" cy="30" r="3.2" fill="#e4ffd0"/>
  </svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 1024 });
  const R = rng(17);

  const ell = (
    c: THREE.Vector3 | number[],
    r: number[],
    color: Parameters<typeof b.part>[1],
    bone?: Parameters<typeof b.part>[2] extends infer O ? (O extends { bone?: infer B } ? B : never) : never,
    seg: [number, number] = [10, 7],
  ) => b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { bone, at: c, scale: r });

  // =============================================================================================================
  // Skeleton

  const HY = T + 0.2;
  const hips = b.joint("hips", { at: [0, HY, -0.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, HY, -0.2],
      [0, HY + 0.006, -0.07],
      [0, HY + 0.018, 0.07],
      [0, HY + 0.035, 0.19],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, HY + 0.035, 0.19],
      [0, HY + 0.06, 0.25],
      [0, HY + 0.075, 0.3],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, HY + 0.075, 0.3],
    dir: [0, 0, 1],
    role: "head",
  });
  const HC = head.local({ forward: 0.05, up: 0.01 });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.055, down: 0.03 }),
    aim: head.local({ forward: 0.16, down: 0.035 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, HY + 0.01, -0.26],
      [0.0, HY - 0.005, -0.4],
      [0.03, HY + 0.035, -0.54],
      [0.08, HY + 0.15, -0.62],
      [0.11, HY + 0.28, -0.6],
      [0.08, HY + 0.4, -0.5],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );

  // =============================================================================================================
  // Body, neck, tail

  const bodyR = (t: number) => [0.098 - 0.01 * t, 0.092 - 0.006 * t] as [number, number];
  const body = b.sweep(spine, bodyR, { color: coat, caps: "round", detail: 0.8 });
  const neckSw = b.sweep(neck, [0.074, 0.07], { color: CREAM, caps: "round", detail: 0.7 });
  const tailR = (t: number) => {
    const k = [0.05, 0.062, 0.076, 0.08, 0.072, 0.05];
    const f = t * (k.length - 1);
    const i = Math.min(Math.floor(f), k.length - 2);
    return k[i] + (k[i + 1] - k[i]) * (f - i);
  };
  const tailSw = b.sweep(tail, tailR, { color: tailPaint, caps: "round", detail: 0.9 });

  // Chest bib & hip haunches for chunkier masses
  ell([0, HY - 0.04, 0.2], [0.075, 0.06, 0.06], cel(BELLY), spine.joints[2]);
  for (const s of [1, -1]) ell([s * 0.07, HY - 0.015, -0.22], [0.062, 0.075, 0.085], coat, spine.joints[0]);

  // =============================================================================================================
  // Legs & paws

  const footTargets: Record<string, THREE.Vector3> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const fore of [true, false]) {
      const tag = `${fore ? "F" : "H"}${side}`;
      const root: [number, number, number] = fore ? [s * 0.088, HY - 0.012, 0.15] : [s * 0.09, HY - 0.02, -0.2];
      const ank: [number, number, number] = fore ? [s * 0.1, T + 0.03, 0.2] : [s * 0.105, T + 0.03, -0.25];
      const pts = limb(root, ank, fore ? [0.1, 0.1] : [0.115, 0.115], [fore ? [0, 0, -1] : [0, 0, 1]]);
      const names = fore
        ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
        : [`hip${side}`, `knee${side}`, `ankle${side}`];
      const leg = b.chain(`leg${tag}`, catmull(pts), {
        parent: fore ? spine.joints[2] : spine.joints[0],
        names,
        role: fore ? "arm" : "leg",
      });
      b.sweep(leg, (t) => (fore ? 0.052 - 0.014 * t : 0.058 - 0.022 * t), {
        color: legCoat,
        caps: "round",
        detail: 0.8,
      });
      const foot = leg.tip!;
      const fp = foot.at;
      footTargets[tag] = fp.clone();
      // paw
      ell([fp.x, T + 0.022, fp.z + 0.028], [0.04, 0.03, 0.05], pawPaint, foot);
      // toes
      for (let k = 0; k < 4; k++) {
        const ox = (k - 1.5) * 0.018;
        const tz = fp.z + 0.062 - Math.abs(k - 1.5) * 0.008;
        const toeJ = b.joint(`toe${tag}${k + 1}`, {
          parent: foot,
          at: [fp.x + ox, T + 0.02, fp.z + 0.04],
          dir: [ox * 1.2, -0.05, 1],
          role: "digit",
        });
        ell([fp.x + ox, T + 0.016, tz], [0.0125, 0.0115, 0.017], pawPaint, toeJ, [6, 4]);
        b.spike([fp.x + ox, T + 0.012, tz + 0.012], [0, -0.1, 1], 0.016, 0.0055, {
          color: CLAW,
          bone: toeJ,
          detail: 0.4,
        });
      }
    }
  }

  // =============================================================================================================
  // Head

  const facePaint = cel(
    paint((p, _n) => {
      const q = p.clone().sub(HC);
      const ax = Math.abs(q.x);
      if (q.z > 0.015) {
        // tear mark: eye corner to mouth, a short tapering stroke
        const ax0 = 0.038, ay0 = -0.008, bx = 0.058, by = -0.052;
        const dx = bx - ax0, dy = by - ay0;
        const u = Math.min(Math.max(((ax - ax0) * dx + (q.y - ay0) * dy) / (dx * dx + dy * dy), 0), 1);
        const dist = Math.hypot(ax - (ax0 + dx * u), q.y - (ay0 + dy * u));
        if (dist < 0.0085 * (1 - 0.55 * u)) return TEAR;
      }
      const edge = -0.012 + 0.016 * zigzag(q.x / 0.026);
      if (q.y < edge && q.z > -0.03) return "#fff3da";
      if (q.y < edge - 0.03) return "#fff3da";
      return paint((_pp, nn) => (nn.y > 0.78 ? RUST_BACK : RUST));
    }),
  );
  const skull = ell(HC, [0.094, 0.079, 0.085], facePaint, head, [16, 11]);
  const skin = b.surface(skull);

  // cheek puffs
  const cheeks: ReturnType<typeof ell>[] = [];
  for (const s of [1, -1]) cheeks.push(ell(head.local({ left: s * 0.068, down: 0.02, forward: 0.035 }), [0.046, 0.042, 0.05], CREAM, head, [10, 7]));

  // snout, nose, jaw
  const SC = head.local({ forward: 0.115, down: 0.022 });
  const snout = ell(SC, [0.042, 0.033, 0.047], CREAM, head, [12, 8]);
  ell(head.local({ forward: 0.157, down: 0.013 }), [0.019, 0.013, 0.013], NOSE, head, [8, 5]);
  ell(head.local({ forward: 0.164, down: 0.0075, left: 0.004 }), [0.0045, 0.003, 0.003], "#ffffff", head, [5, 4]);
  const jawPart = ell(jaw.local([0, 0.04, 0]), [0.033, 0.017, 0.05], CREAM, jaw, [10, 6]);
  ell(jaw.local([0, 0.062, -0.008]), [0.017, 0.007, 0.018], PINK, jaw, [6, 4]); // tongue

  // mouth line
  const snoutSkin = b.surface([snout, jawPart]);
  const mouthPts = [-1, 0, 1].map((k) => k);
  void mouthPts;
  for (const s of [1, -1]) {
    const path = catmull([
      head.local({ forward: 0.155, down: 0.026 }),
      head.local({ left: s * 0.009, forward: 0.15, down: 0.038 }),
      head.local({ left: s * 0.026, forward: 0.136, down: 0.043 }),
      head.local({ left: s * 0.04, forward: 0.12, down: 0.039 }),
    ]);
    b.sweep(snoutSkin.drape(path, { lift: 0.0015 }), 0.0022, { color: INK, bone: head, caps: "round", detail: 0.4 });
  }
  b.sweep(
    catmull([head.local({ forward: 0.157, down: 0.017 }), head.local({ forward: 0.153, down: 0.033 })]),
    0.0022,
    { color: INK, bone: head, caps: "round", detail: 0.4 },
  );

  // anime eyes
  const EYE = animeEye({ iris: "#e0912f", irisLight: "#ffd873", irisDark: "#7a3510", blush: "#ff8a9a" });
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 34, 2);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0, segments: 10 });
    const brow = skin.around(HC).at(s * 40, 27);
    if (brow) b.stick(new THREE.SphereGeometry(1, 6, 4), CREAM, brow, { embed: 0.35, scale: [0.016, 0.007, 0.011] });
  }

  // cheek and brow fluff
  for (const s of [1, -1]) {
    const cs = b.surface(cheeks[s > 0 ? 0 : 1]);
    const hits = cs.scatter(34, {
      rng: R,
      minDist: 0.022,
      filter: (h) => Math.abs(h.n.x) > 0.35 || h.n.y < -0.2,
    });
    b.cards(hits, tuftTex, {
      size: [0.034, 0.05],
      lean: 62,
      bend: 20,
      flow: [s * 0.8, -0.3, -1],
      vary: 0.25,
      rng: R,
      color: CREAM,
      cross: true,
    });
  }

  // ears
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ej = b.joint(`ear${side}`, {
      parent: head,
      at: head.local({ left: s * 0.066, up: 0.055, forward: 0.0 }),
      dir: [s * 0.3, 1, 0.1],
      role: "hinge",
    });
    earJoints[s] = ej;
    const outer = b.extrude(
      [
        [-0.045, 0],
        [0.045, 0],
        [0.022, 0.09],
        [-0.022, 0.09],
      ],
      {
        at: ej.at,
        x: [s, 0, 0],
        y: [s * 0.4, 1, 0.22],
        thickness: 0.016,
        bevel: 0.005,
        smoothing: 2,
        bone: ej,
        color: cel(
          paint((_p, _n, uv) => (uv[1] > 0.068 - 0.012 * zigzag(uv[0] / 0.012) ? "#fff3da" : "#3e1d1c")),
        ),
      },
    );
    void outer;
    const inner = b.extrude(
      [
        [-0.03, 0.006],
        [0.03, 0.006],
        [0.011, 0.078],
        [-0.011, 0.078],
      ],
      {
        at: [ej.at.x, ej.at.y, ej.at.z + 0.0075],
        x: [s, 0, 0],
        y: [s * 0.4, 1, 0.22],
        thickness: 0.016,
        bevel: 0.004,
        smoothing: 2,
        bone: ej,
        color: cel(
          paint((_p, _n, uv) => (Math.hypot(uv[0], uv[1] - 0.02) < 0.022 ? "#ffc9b0" : "#fff3da")),
        ),
      },
    );
    void inner;
    // ear tufts
    const ctr = ej.at.clone();
    const tufts = [0, 1, 2, 3].map((i) => frame([ctr.x + s * (0.002 + i * 0.002), ctr.y + 0.012 + i * 0.012, ctr.z + 0.017], [s * 0.3, 0.6, 1]));
    b.cards(tufts, tuftTex, { size: [0.022, 0.03], lean: 40, flow: [0, -0.3, -1], color: CREAM, bone: ej, vary: 0.2, rng: R });
  }

  // Dendro sprout between the ears
  const spr = frame(head.local({ up: 0.077, forward: 0.0 }), [0, 1, 0.1]);
  b.sweep(catmull([spr.at, [0, HC.y + 0.098, HC.z - 0.03], [0, HC.y + 0.118, HC.z - 0.03]]), [0.004, 0.0025], {
    color: LEAF_D,
    bone: head,
    caps: "round",
    detail: 0.5,
  });
  for (const s of [1, -1]) {
    const lf = b.extrude(
      [
        [0, 0],
        [0.018, 0.008],
        [0.03, 0.022],
        [0.012, 0.03],
        [-0.002, 0.012],
      ],
      {
        at: [0, HC.y + 0.118, HC.z - 0.03],
        x: [0, 0, 1],
        y: [s * 0.9, 1, 0],
        thickness: 0.004,
        smoothing: 2,
        bone: head,
        color: LEAF,
      },
    );
    void lf;
  }
  glow(ell([0, HC.y + 0.123, HC.z - 0.03], [0.006, 0.006, 0.006], "#b8ff8e", head, [6, 4]), 1.4);

  // =============================================================================================================
  // Scarf, ribbon tails, pendant

  const neckSkin = b.surface(neckSw);
  const scarfPath = neckSkin.loop(neck.at(0.35), { lift: 0.006 });
  b.sweep(scarfPath, () => [0.014, 0.024], { color: TEAL, bone: neck.joints[0], detail: 0.9 });
  for (const off of [-0.017, 0.017]) {
    const c = neck.at(0.35);
    const edgePath = neckSkin.loop(frame(c.at.clone().add(new THREE.Vector3(0, 0.0, off * 0.9)), c.tangent), { lift: 0.013 });
    b.sweep(edgePath, 0.0045, { color: GOLD, bone: neck.joints[0], detail: 0.6 });
  }
  // knot on the front, ribbon ends
  const bodySkin = b.surface(body);
  const chestHit = bodySkin.ray([0, HY + 0.2, 0.4], [0, -0.45, -1]);
  const knotAt = chestHit ? chestHit.at.clone() : new THREE.Vector3(0, HY, 0.27);
  const knotPos = knotAt.clone().add(new THREE.Vector3(0, 0.055, 0.0));
  ell(knotPos.clone().add(new THREE.Vector3(0, 0.005, 0.03)), [0.026, 0.024, 0.02], TEAL_D, spine.joints[2], [8, 6]);
  for (const s of [1, -1]) {
    // ribbon tail
    const rb = b.extrude(
      [
        [-0.016, 0],
        [0.016, 0],
        [0.019, -0.085],
        [0.0, -0.07, "sharp"],
        [-0.019, -0.085],
      ],
      {
        at: knotPos.clone().add(new THREE.Vector3(s * 0.016, 0.0, 0.052 + (s > 0 ? 0 : 0.004))),
        x: [1, 0, 0],
        y: [s * 0.18, 1, 0.1],
        thickness: 0.007,
        bevel: 0.002,
        bone: spine.joints[2],
        color: cel(
          paint((_p, _n, uv) => (uv[1] < -0.062 && uv[1] > -0.07 ? "#ffd45c" : "#38d6c4")),
          TEAL_D as unknown as string,
        ),
      },
    );
    void rb;
  }
  // bell pendant with a Dendro gem
  const bellAt = knotPos.clone().add(new THREE.Vector3(0, -0.075, 0.063));
  ell(bellAt, [0.02, 0.02, 0.02], GOLD, spine.joints[2], [8, 6]);
  glow(ell(bellAt.clone().add(new THREE.Vector3(0, 0, 0.012)), [0.009, 0.011, 0.007], "#9bff7a", spine.joints[2], [6, 4]), 1.5);
  b.part(new THREE.TorusGeometry(0.02, 0.0025, 4, 10), GOLD, {
    at: bellAt.clone().add(new THREE.Vector3(0, 0.0, 0.0)),
    bone: spine.joints[2],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  });
  for (let k = 0; k < 5; k++) {
    const a = (k - 2) * 0.012;
    b.spike(bellAt.clone().add(new THREE.Vector3(a, -0.016, 0.004)), [a * 2, -1, 0.1], 0.04, 0.003, {
      color: k % 2 ? TEAL : GOLD,
      bone: spine.joints[2],
      detail: 0.4,
    });
  }

  // =============================================================================================================
  // Ear ornament (left): gold ring + tassel
  {
    const ej = earJoints[1];
    const at = ej.at.clone().add(new THREE.Vector3(0.036, 0.018, 0.012));
    b.part(new THREE.TorusGeometry(0.011, 0.0028, 5, 10), GOLD, { at, bone: ej, rotation: [90, 0, 20] });
    ell(at.clone().add(new THREE.Vector3(0.002, -0.022, 0)), [0.007, 0.008, 0.007], GOLD, ej, [6, 4]);
    for (let k = 0; k < 3; k++)
      b.spike(at.clone().add(new THREE.Vector3(0.002 + (k - 1) * 0.004, -0.028, 0)), [(k - 1) * 0.25, -1, 0], 0.036, 0.0035, {
        color: k === 1 ? TEAL : GOLD,
        bone: ej,
        detail: 0.4,
      });
  }

  // =============================================================================================================
  // Tail fluff

  {
    const ts = b.surface(tailSw);
    const hits = ts.scatter(150, { rng: R, minDist: 0.038, filter: (h) => h.n.y > -0.55 });
    b.cards(hits, tuftTex, {
      size: [0.05, 0.07],
      lean: 58,
      bend: 15,
      flow: (_f, i) => [Math.sin(i * 2.1) * 0.3, 0.2, -1],
      vary: 0.3,
      rng: R,
      color: tailPaint,
    });
    // darker tip fluff
    const tip = tail.at(0.985);
    b.cards([frame(tip.at, tip.tangent)], tuftTex, { size: [0.08, 0.09], lean: 0, color: TAIL_TIP, cross: true });
  }
  // body fluff along the back
  {
    const bs = b.surface(body);
    const hits = bs.scatter(90, { rng: R, minDist: 0.045, filter: (h) => h.n.y > 0.2 });
    b.cards(hits, tuftTex, { size: [0.04, 0.05], lean: 70, flow: [0, 0.1, -1], vary: 0.25, rng: R, color: coat });
    const hb = bs.scatter(34, { rng: R, minDist: 0.05, filter: (h) => h.n.y < -0.25 && h.n.y > -0.8 });
    b.cards(hb, tuftTex, { size: [0.035, 0.05], lean: 70, flow: [0, -0.1, -1], vary: 0.25, rng: R, color: cel(BELLY) });
  }

  // =============================================================================================================
  // The stone

  const stoneGeo = new THREE.LatheGeometry(
    [
      [0, 0],
      [0.27, 0],
      [0.33, 0.07],
      [0.345, 0.17],
      [0.3, 0.27],
      [0.23, 0.322],
      [0.15, 0.333],
      [0, T],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    10,
  );
  const stone = b.part(stoneGeo, stonePaint, { at: [0, 0, 0], scale: [1, 1, 1.32], bone: hips, flat: true });
  const stoneSkin = b.surface(stone);
  // chunks to break the symmetry
  const chunkDefs: [number[], number[], number][] = [
    [[0.22, 0.12, 0.3], [0.17, 0.15, 0.16], 20],
    [[-0.25, 0.1, -0.2], [0.16, 0.13, 0.2], 70],
    [[0.2, 0.1, -0.35], [0.15, 0.11, 0.14], 110],
    [[-0.24, 0.09, 0.28], [0.14, 0.1, 0.15], 140],
  ];
  for (const [c, r, rot] of chunkDefs)
    b.part(new THREE.IcosahedronGeometry(1, 1), stonePaint, { at: c, scale: r, rotation: [0, rot, 0], bone: hips, flat: true });

  // moss cushions on the top and rim
  const mossSpots: [number[], number[]][] = [
    [[0.0, T - 0.012, 0.0], [0.2, 0.03, 0.3]],
    [[0.16, T - 0.02, 0.2], [0.09, 0.03, 0.085]],
    [[-0.17, T - 0.025, -0.1], [0.085, 0.035, 0.1]],
    [[-0.12, T - 0.03, 0.27], [0.07, 0.03, 0.065]],
    [[0.14, T - 0.035, -0.28], [0.09, 0.035, 0.07]],
    [[0.3, 0.2, 0.0], [0.08, 0.05, 0.12]],
    [[-0.32, 0.17, 0.1], [0.07, 0.05, 0.11]],
    [[0.0, 0.28, 0.4], [0.1, 0.045, 0.06]],
    [[0.1, 0.12, 0.46], [0.09, 0.045, 0.05]],
  ];
  for (const [c, r] of mossSpots) b.part(new THREE.SphereGeometry(1, 9, 6), mossPaint, { at: c, scale: r, bone: hips });

  // moss fringe hanging off the rim, tufts on top
  {
    const rim: THREE.Vector3[] = [];
    for (let k = 0; k < 26; k++) {
      const a = (k / 26) * Math.PI * 2;
      const h = stoneSkin.around([0, 0.2, 0]).at((a * 180) / Math.PI, 38);
      if (h && h.at.y > 0.2) rim.push(h.at.clone());
    }
    b.cards(
      rim.map((p) => frame(p, [0, 1, 0])),
      mossDripTex,
      { size: [0.05, 0.075], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: R, cross: true, bone: hips },
    );
    const tops = stoneSkin.scatter(46, { rng: R, minDist: 0.05, filter: (h) => h.n.y > 0.5 });
    b.cards(tops, grassTex, { size: [0.045, 0.06], lean: 14, flow: [0, 0, 1], vary: 0.35, rng: R, cross: true, bone: hips });
  }

  // Dendro rune on the front of the stone
  {
    const front = [0.0, 0.15, 0.55];
    b.decal(stoneSkin, runeRing, { at: front, dir: [0, 0.1, 1], size: [0.21, 0.21], lift: 0.004, bone: hips });
    const gl = b.decal(stoneSkin, runeGlyph, { at: front, dir: [0, 0.1, 1], size: [0.15, 0.15], lift: 0.007, bone: hips });
    glow(gl, 1.5);
  }

  // =============================================================================================================
  // Turf base and diorama dressing

  const outline: [number, number][] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const rr = 0.62 + 0.07 * Math.sin(k * 2.3) + 0.04 * Math.cos(k * 1.1);
    outline.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  b.extrude(outline, {
    at: [0, 0.03, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.032,
    bevel: 0.008,
    smoothing: 1,
    color: turfPaint,
    bone: hips,
  });

  // grass, ferns, pebbles, mushrooms, flowers around the base
  const around: [number, number][] = [];
  for (let k = 0; k < 40; k++) {
    const a = R() * Math.PI * 2;
    const rr = 0.42 + R() * 0.17;
    around.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  b.cards(
    around.map(([x, z]) => frame([x, 0.03, z], [0, 1, 0])),
    grassTex,
    { size: [0.08, 0.11], lean: 8, flow: [0, 0, 1], vary: 0.4, rng: R, cross: true, bone: hips },
  );
  const ferns: [number, number, number][] = [
    [-0.45, 0.2, 0], [0.48, 0.28, 1], [-0.38, -0.34, 2], [0.4, -0.4, 3], [0.1, 0.52, 4],
  ];
  for (const [x, z, k] of ferns) {
    const pts = [0, 1, 2, 3, 4, 5].map((i) => frame([x, 0.03, z], [Math.cos(i * 1.05 + k), 1.6, Math.sin(i * 1.05 + k)]));
    b.cards(pts, frondTex, { size: [0.14, 0.24], lean: 55, bend: 35, flow: (f) => [f.axis.x, -0.2, f.axis.z], bone: hips });
  }
  for (const [x, z, r] of [
    [0.5, 0.05, 0.05], [-0.52, -0.08, 0.045], [0.34, 0.45, 0.03], [-0.2, 0.5, 0.035], [-0.3, -0.5, 0.04],
  ] as [number, number, number][])
    b.part(new THREE.IcosahedronGeometry(1, 0), pebblePaint, { at: [x, 0.03, z], scale: [r * 1.2, r * 0.7, r], rotation: [0, x * 200, 0], bone: hips, flat: true });

  // mushrooms
  const capPaint = cel(
    paint((p, n) => {
      const c = noise(p, 0.02, 21);
      return n.y > 0.2 && c > 0.72 ? "#fff3da" : "#ff7c8a";
    }),
    "#d04a68",
  );
  const mush: [number, number, number][] = [
    [-0.46, 0.4, 1], [-0.52, 0.34, 0.65], [0.42, -0.2, 0.8],
  ];
  for (const [x, z, k] of mush) {
    b.lathe(
      [
        [0, 0],
        [0.012 * k, 0],
        [0.012 * k, 0.06 * k],
        [0, 0.06 * k],
      ],
      { at: [x, 0.03, z], segments: 6, color: CREAM, bone: hips },
    );
    b.lathe(
      [
        [0, 0.05 * k],
        [0.045 * k, 0.05 * k],
        [0.042 * k, 0.065 * k],
        [0.026 * k, 0.092 * k],
        [0, 0.1 * k],
      ],
      { at: [x, 0.03, z], segments: 8, color: capPaint, bone: hips },
    );
  }

  // flowers
  const bloom: [number, number][] = [[0.3, 0.5], [0.4, 0.42], [-0.5, -0.22], [0.52, -0.1]];
  for (const [x, z] of bloom) {
    const h = 0.09 + R() * 0.05;
    b.sweep(catmull([[x, 0.03, z], [x + 0.01, 0.03 + h * 0.5, z - 0.005], [x, 0.03 + h, z]]), 0.0035, {
      color: LEAF_D,
      bone: hips,
      caps: "round",
      detail: 0.5,
    });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(1, 6, 4), cel("#ffffff", "#bfd6ff"), {
        at: [x + Math.cos(a) * 0.017, 0.03 + h + 0.003, z + Math.sin(a) * 0.017],
        dir: [Math.cos(a), 0.35, Math.sin(a)],
        scale: [0.007, 0.019, 0.0045],
        bone: hips,
      });
    }
    b.part(new THREE.SphereGeometry(1, 6, 4), GOLD, { at: [x, 0.03 + h + 0.004, z], scale: [0.009, 0.007, 0.009], bone: hips });
  }

  // floating Dendro seeds
  const seeds: [number, number, number, number][] = [
    [0.34, 0.8, 0.12, 0.014], [-0.3, 0.9, -0.25, 0.011], [0.22, 0.99, -0.48, 0.012], [-0.38, 0.72, 0.2, 0.01], [0.3, 0.62, 0.34, 0.009],
  ];
  for (const [x, y, z, r] of seeds) {
    glow(b.part(new THREE.OctahedronGeometry(r, 0), "#aaff80", { at: [x, y, z], scale: [0.8, 1.4, 0.8], bone: hips }), 1.4);
    b.part(new THREE.TorusGeometry(r * 1.7, r * 0.18, 4, 10), GOLD, { at: [x, y, z], rotation: [70, x * 90, 0], bone: hips });
  }

  void smoothstep;
  return b.root;
}
