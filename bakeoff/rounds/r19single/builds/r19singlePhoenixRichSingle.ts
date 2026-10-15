// Pyre Phoenix: a Genshin-Impact-style fire bird with wings spread. Cel-shaded crimson body (kits/toon), ornate gold
// filigree (tiara, collars, bracers, pauldrons, tassels), pyro-glowing flame feathers and wisps (kits/glow) and a
// single teal accent (gems, tail eye-spots, eyes' counterpoint to the fire).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import { paint, scales } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import type { Path } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Pyre Phoenix",
  description:
    "A giant fire phoenix with wings spread: cel-shaded crimson plumage, layered flame feathers that glow, long eye-spotted tail plumes, ornate gold filigree and tassels, teal gems.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const CRIM = "#c8203a";
const CRIM_D = "#7d1230";
const RED = "#ec3b34";
const ORANGE = "#ff7a22";
const AMBER = "#ffb534";
const YELLOW = "#fff0a0";
const GOLD = "#f5c542";
const GOLD_D = "#b9822b";
const GOLD_S = "#c47f1d";
const TEAL = "#2fd9c8";
const BEAK = "#f3b13a";
const BEAK_S = "#c97a1e";
const CLAW = "#8a5a1c";

const OUT_P = "M20 2 C31 30 37 80 35 140 C34 185 27 220 20 238 C13 220 6 185 5 140 C3 80 9 30 20 2 Z";
const OUT_S = "M30 3 C50 14 58 60 55 120 C53 165 40 190 30 198 C20 190 7 165 5 120 C2 60 10 14 30 3 Z";
const OUT_C = "M30 118 C14 104 4 84 4 54 C4 22 16 3 30 3 C44 3 56 22 56 54 C56 84 46 104 30 118 Z";

/** The region of the drawing above a zig-zag (flame-tongue) edge at height y. */
function zigRegion(W: number, y: number, depth: number, teeth: number) {
  let d = `M0 0 H${W} V${y + depth}`;
  for (let i = teeth * 2; i >= 0; i--) d += ` L${(i * W) / (teeth * 2)} ${i % 2 === 0 ? y + depth : y}`;
  return d + " Z";
}

/** A feather drawing: base colour, flame-tongue bands from the root up to the tip (y descending), gold edge and quill. */
function featherTex(
  W: number,
  H: number,
  outline: string,
  base: string,
  bands: ReadonlyArray<readonly [number, string]>,
  edge: string,
  size: number,
) {
  const regions = bands.map(([y, c]) => `<path d="${zigRegion(W, y, H * 0.07, 4)}" fill="${c}"/>`).join("");
  return svg(
    `<svg viewBox="0 0 ${W} ${H}">
    <defs><clipPath id="c"><path d="${outline}"/></clipPath></defs>
    <g clip-path="url(#c)">
      <rect width="${W}" height="${H}" fill="${base}"/>
      ${regions}
      <path d="M${W / 2} ${H - 2} L${W / 2} 6" stroke="${edge}" stroke-width="3" fill="none"/>
    </g>
    <path d="${outline}" fill="none" stroke="${edge}" stroke-width="3.6" stroke-linejoin="round"/>
  </svg>`,
    { size },
  );
}

/** A rounded covert feather: dark base, two scalloped tones near the tip, gold quill and edge. */
function covertTex(base: string, c1: string, c2: string) {
  return svg(
    `<svg viewBox="0 0 60 120">
    <defs><clipPath id="c"><path d="${OUT_C}"/></clipPath></defs>
    <g clip-path="url(#c)">
      <rect width="60" height="120" fill="${base}"/>
      <ellipse cx="30" cy="22" rx="40" ry="46" fill="${c1}"/>
      <ellipse cx="30" cy="12" rx="27" ry="28" fill="${c2}"/>
      <path d="M30 116 L30 40" stroke="${GOLD}" stroke-width="3" fill="none"/>
    </g>
    <path d="${OUT_C}" fill="none" stroke="${GOLD}" stroke-width="3.6" stroke-linejoin="round"/>
  </svg>`,
    { size: 256 },
  );
}

/** A long ribbon (tail plume, crest blade) between two edges that taper to a rounded tip. */
function ribbon(path: Path, W: number, normal: THREE.Vector3) {
  const A: THREE.Vector3[] = [];
  const B: THREE.Vector3[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = path.at(t);
    const T = path.tangentAt(t);
    const side = T.clone().cross(normal).normalize();
    const w = Math.max(0.006, W * Math.sin(Math.PI * Math.pow(t, 1.8)));
    A.push(p.clone().addScaledVector(side, w));
    B.push(p.clone().addScaledVector(side, -w));
  }
  return [catmull(A), catmull(B)] as const;
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ------------------------------------------------------------------------------------------------ textures
  const PRIM = featherTex(
    40,
    240,
    OUT_P,
    CRIM_D,
    [
      [185, CRIM],
      [145, RED],
      [105, ORANGE],
      [66, AMBER],
      [30, YELLOW],
    ],
    GOLD,
    384,
  );
  const SEC = featherTex(
    60,
    200,
    OUT_S,
    CRIM_D,
    [
      [150, CRIM],
      [112, RED],
      [76, ORANGE],
      [42, AMBER],
    ],
    GOLD,
    320,
  );
  const FAN = featherTex(
    40,
    240,
    OUT_P,
    "#5a0f2e",
    [
      [185, CRIM_D],
      [145, CRIM],
      [105, RED],
      [66, ORANGE],
      [30, AMBER],
    ],
    GOLD_S,
    384,
  );
  const COV_A = covertTex(CRIM_D, RED, ORANGE);
  const COV_B = covertTex(CRIM, ORANGE, AMBER);
  const WISP = svg(
    `<svg viewBox="0 0 40 80">
    <path d="M20 80 C6 70 2 52 12 36 C16 28 14 16 20 2 C24 16 30 24 32 38 C38 54 34 70 20 80 Z" fill="${ORANGE}"/>
    <path d="M20 76 C10 68 9 54 16 42 C18 36 18 28 20 20 C24 30 28 38 28 50 C30 62 26 72 20 76 Z" fill="${AMBER}"/>
    <path d="M20 74 C14 68 14 58 20 48 C26 58 26 68 20 74 Z" fill="${YELLOW}"/>
  </svg>`,
    { size: 256 },
  );
  const TASSEL = svg(
    `<svg viewBox="0 0 30 120">
    <path d="M15 96 C3 84 3 44 5 12 L25 12 C27 44 27 84 15 96 Z" fill="${CRIM}"/>
    <path d="M11 20 V80 M15 14 V86 M19 20 V80" stroke="${ORANGE}" stroke-width="2.6" fill="none"/>
    <path d="M4 12 L8 2 L12 12 L15 0 L18 12 L22 2 L26 12 Z" fill="${AMBER}"/>
    <rect x="3" y="82" width="24" height="6" fill="${GOLD}"/>
    <circle cx="15" cy="100" r="8" fill="${GOLD}"/>
    <circle cx="15" cy="100" r="3.5" fill="${TEAL}"/>
    <rect x="13" y="106" width="4" height="14" fill="${GOLD_S}"/>
  </svg>`,
    { size: 256 },
  );
  const EYE = animeEye({ iris: "#ffb21e", blush: false });

  // ------------------------------------------------------------------------------------------------ paints
  const GOLDC = cel(GOLD, GOLD_S);
  const ARMP = cel(CRIM);
  const BEAKC = cel(BEAK, BEAK_S);
  const AMBERC = cel(AMBER);
  const BODYP = cel(
    furEdge(
      furEdge(AMBER, furEdge(CRIM, AMBER, { level: -0.1, teeth: 0.3, period: 0.045 }), {
        axis: [0, 0, 1],
        level: 0.55,
        teeth: 0.2,
        period: 0.045,
        along: [1, 0, 0],
      }),
      AMBER,
      { level: -0.25, teeth: 0.25, period: 0.05 },
    ),
  );
  const NECKP = cel(furEdge(AMBER, CRIM, { axis: [0, 0, 1], level: 0.35, teeth: 0.25, period: 0.04, along: [0, 1, 0] }));
  const LEGP = cel(scales([AMBER, GOLD], GOLD_S, { size: 0.045, width: 0.14 }));
  const CRESTP = cel(paint((_p, _n, s) => (s[0] < 0.45 ? CRIM : s[0] < 0.75 ? ORANGE : AMBER)));
  const plumePaint = (eyeAt: number) =>
    cel(
      paint((_p, _n, s) => {
        const a = s[0];
        const c = s[1];
        if (c < 0.07 || c > 0.93) return GOLD;
        const ed = Math.hypot((a - eyeAt) / 0.12, (c - 0.5) / 0.3);
        if (ed < 0.42) return TEAL;
        if (ed < 0.62) return INK;
        if (ed < 0.85) return GOLD;
        if (ed < 1.05) return CRIM_D;
        const g = a + 0.05 * (zigzag(c * 3) - 0.5);
        if (g < 0.26) return CRIM_D;
        if (g < 0.5) return CRIM;
        if (g < 0.74) return RED;
        if (g < 0.9) return ORANGE;
        return AMBER;
      }),
    );

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.88, -0.25], dir: [0, 0.35, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.88, -0.25],
      [0, 0.98, 0.04],
      [0, 1.12, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.3],
      [0, 1.34, 0.44],
      [0, 1.54, 0.46],
      [0, 1.7, 0.56],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: neck.at(1), dir: [0, -0.12, 1], role: "head" });
  const H = head.at.clone();
  const hp = (x: number, y: number, z: number) => V(H.x + x, H.y + y, H.z + z);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.04, 0.05), aim: hp(0, -0.065, 0.17), role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.88, -0.25],
      [0, 0.9, -0.5],
      [0, 0.86, -0.75],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );

  // ------------------------------------------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 0.88, -0.42], w: 0.14, h: 0.14 },
      { at: [0, 0.9, -0.24], w: 0.36, h: 0.34 },
      { at: [0, 0.99, 0.02], w: 0.52, h: 0.46 },
      { at: [0, 1.12, 0.26], w: 0.46, h: 0.46 },
      { at: [0, 1.26, 0.38], w: 0.26, h: 0.26 },
    ],
    { bone: spine, color: BODYP, sides: 10, name: "body" },
  );
  const neckSw = b.sweep(neck, [0.1, 0.07], { color: NECKP, sides: 8, name: "neck" });
  b.sweep(tail, [0.075, 0.035], { color: ARMP, sides: 8, name: "tailTube" });

  // contour feathers over the body
  const bodySkin = b.surface(body);
  const coat = bodySkin.scatter(220, { rng: R, minDist: 0.045, filter: (h) => h.n.y > -0.4 });
  b.cards(coat, [COV_A, COV_B], {
    size: [0.07, 0.14],
    lean: 55,
    bend: 20,
    vary: 0.25,
    spin: 12,
    rng: R,
  });
  const neckHits = b.surface(neckSw).scatter(70, { rng: R, minDist: 0.04 });
  b.cards(neckHits, [COV_B, COV_A], { size: [0.055, 0.11], lean: 60, bend: 20, vary: 0.2, rng: R });

  // neck ruff: two rings of long feathers at the base of the neck, gold torque above
  const ruff = b.ring(neck.at(0.1), { count: 14, radius: 0.095 }).items;
  b.cards(ruff, SEC, { size: [0.07, 0.17], lean: 55, flow: [0, -0.3, -1], vary: 0.15, rng: R, bend: 15 });
  b.part(new THREE.TorusGeometry(0.092, 0.015, 6, 14), GOLDC, {
    at: neck.at(0.5),
    dir: neck.at(0.5),
    axis: "z",
  });
  b.part(new THREE.TorusGeometry(0.086, 0.012, 6, 14), GOLDC, {
    at: neck.at(0.8),
    dir: neck.at(0.8),
    axis: "z",
  });

  // flame mane along the back and neck
  const manePts = [0.25, 0.4, 0.55, 0.7, 0.85].map((t) => body.at(t, 0));
  glow(
    b.cards(manePts, WISP, { size: [0.09, 0.22], lean: 35, flow: [0, 0, -1], cross: true, vary: 0.25, rng: R }),
    1,
  );
  const neckMane = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t) => neckSw.at(t, 0));
  glow(
    b.cards(neckMane, WISP, { size: [0.07, 0.18], lean: 35, flow: [0, 0, -1], cross: true, vary: 0.25, rng: R }),
    1,
  );

  // chest gem in a gold bezel, with tassels
  const chestHit = bodySkin.nearest([0, 1.08, 0.9]);
  b.stick(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 8), GOLDC, chestHit, { embed: 0.5 });
  glow(b.stick(new THREE.OctahedronGeometry(0.05), TEAL, chestHit.moved([0, 0.02, 0]), { embed: 0.2 }), 1.2);
  b.cards(
    [-0.055, 0.055].map((dx) => frame(chestHit.at.clone().add(V(dx, -0.06, 0.03)), [0, 1, 0])),
    TASSEL,
    { size: [0.05, 0.22], lean: 180, flow: [0, 0, 1], bone: spine.joints[1] },
  );

  // ------------------------------------------------------------------------------------------------ head
  const headPaint = cel(
    furEdge(CRIM, AMBER, {
      by: "position",
      axis: [0, 1, 0],
      level: H.y - 0.002,
      teeth: 0.02,
      period: 0.028,
      along: [1, 0, 0],
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, {
    bone: head,
    at: hp(0, 0.01, 0.05),
    scale: [0.085, 0.08, 0.11],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), AMBERC, {
    bone: jaw,
    at: hp(0, -0.04, 0.06),
    scale: [0.058, 0.03, 0.07],
    name: "jawMass",
  });
  b.sweep(bezier(hp(0, 0.0, 0.13), hp(0, 0.02, 0.24), hp(0, -0.075, 0.29)), (t) => [0.042 * (1 - t) + 0.004, 0.04 * (1 - t) + 0.004] as [number, number], {
    bone: head,
    color: BEAKC,
    sides: 6,
    caps: { start: "flat", end: "point" },
    name: "beakUpper",
  });
  b.sweep(bezier(hp(0, -0.035, 0.09), hp(0, -0.04, 0.19), hp(0, -0.065, 0.235)), (t) => [0.03 * (1 - t) + 0.004, 0.026 * (1 - t) + 0.004] as [number, number], {
    bone: jaw,
    color: BEAKC,
    sides: 6,
    caps: { start: "flat", end: "point" },
    name: "beakLower",
  });

  // eyes: big anime eyes decalled onto the skull
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(skull.at).at(s * 58, 6);
    if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.052, 0.071], mirror: s > 0 });
  }

  // gold tiara with gem
  b.extrude(
    [
      [0.08, 0.0],
      [0.085, 0.07, "sharp"],
      [0.04, 0.04],
      [0.02, 0.13, "sharp"],
      [-0.015, 0.05],
      [-0.07, 0.11, "sharp"],
      [-0.09, 0.01],
    ],
    { at: hp(0, 0.078, 0.04), x: [0, 0, 1], thickness: 0.018, bevel: 0.004, color: GOLDC, bone: head, name: "tiara" },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.02), TEAL, { bone: head, at: hp(0, 0.1, 0.1), scale: [1, 1.4, 1] } as never), 1.2);

  // crest blades streaming back from the crown
  for (const yaw of [-20, 0, 20]) {
    const f = V(Math.sin(yaw * DEG), 0, -Math.cos(yaw * DEG));
    const L = yaw === 0 ? 0.5 : 0.4;
    const p0 = hp(0, 0.08, -0.03);
    const path = bezier(
      p0,
      p0.clone().addScaledVector(f, L * 0.4).add(V(0, 0.12, 0)),
      p0.clone().addScaledVector(f, L * 0.75).add(V(0, 0.1, 0)),
      p0.clone().addScaledVector(f, L).add(V(0, -0.12, 0)),
    );
    const [eA, eB] = ribbon(path, 0.04, V(Math.cos(yaw * DEG), 0, Math.sin(yaw * DEG)));
    b.membrane(eA, eB, { color: CRESTP, thickness: 0.006, bone: head, rows: 3 });
  }

  // ------------------------------------------------------------------------------------------------ tail
  const tailJoint = tail.joints[1];
  const tailBase = V(0, 0.9, -0.46);
  const plumeSpec = [
    { n: "plumeR2", yaw: -36, len: 1.1, tipY: 0.6, W: 0.1 },
    { n: "plumeR1", yaw: -18, len: 1.4, tipY: 0.34, W: 0.12 },
    { n: "plumeC", yaw: 0, len: 1.8, tipY: 0.15, W: 0.15 },
    { n: "plumeL1", yaw: 18, len: 1.4, tipY: 0.34, W: 0.12 },
    { n: "plumeL2", yaw: 36, len: 1.1, tipY: 0.6, W: 0.1 },
  ];
  for (const spec of plumeSpec) {
    const f = V(Math.sin(spec.yaw * DEG), 0, -Math.cos(spec.yaw * DEG));
    const p0 = tailBase.clone();
    const p1 = p0.clone().addScaledVector(f, spec.len * 0.33).add(V(0, 0.2, 0));
    const p2 = p0.clone().addScaledVector(f, spec.len * 0.68);
    p2.y = 0.9 + (spec.tipY - 0.9) * 0.7 + 0.05;
    const p3 = p0.clone().addScaledVector(f, spec.len);
    p3.y = spec.tipY;
    const joint = b.joint(spec.n, { parent: tailJoint, at: p0, aim: p1, role: "fan" });
    const [eA, eB] = ribbon(bezier(p0, p1, p2, p3), spec.W, V(0, 1, 0));
    b.membrane(eA, eB, { color: plumePaint(0.72), thickness: 0.008, bone: joint, rows: 4 });
    glow(
      b.cards([frame(p3, [0, 1, 0])], WISP, {
        size: [0.1, 0.24],
        lean: 20,
        flow: f,
        cross: true,
        bone: joint,
        sink: 0.15,
      }),
      1,
    );
  }
  // fan of short flame feathers under the long plumes
  {
    const phi = 18 * DEG;
    const nF = V(0, Math.cos(phi), -Math.sin(phi));
    const g = V(0, -Math.sin(phi), -Math.cos(phi));
    for (let i = 0; i <= 10; i++) {
      const th = (-50 + 10 * i) * DEG;
      const d = V(Math.sin(th), 0, 0).addScaledVector(g, Math.cos(th));
      const len = 0.55 + 0.25 * Math.cos(th * 1.6);
      const layer = (5 - Math.abs(i - 5)) * 0.004;
      b.cards([frame(tailBase.clone().addScaledVector(nF, layer), nF)], FAN, {
        size: [0.1, len],
        lean: 90,
        flow: d,
        bone: tailJoint,
        sink: 0.05,
        bend: -8,
      });
    }
  }
  b.part(new THREE.TorusGeometry(0.078, 0.014, 6, 14), GOLDC, { at: tail.at(0.25), dir: tail.at(0.25), axis: "z" });

  // ------------------------------------------------------------------------------------------------ wings
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const dih = 24 * DEG;
    const u = V(s * Math.cos(dih), Math.sin(dih), 0);
    const nrm = V(-s * Math.sin(dih), Math.cos(dih), 0);
    const back = V(0, 0, -1);
    const S = V(s * 0.22, 1.12, 0.1);
    const E = S.clone().addScaledVector(u, 0.35).add(V(0, 0, -0.07));
    const Wr = E.clone().addScaledVector(u, 0.38).add(V(0, 0, 0.12));
    const Hd = Wr.clone().addScaledVector(u, 0.18).add(V(0, 0, 0.03));
    const Tp = Hd.clone().addScaledVector(u, 0.14).add(V(0, 0, 0.03));
    const wing = b.chain(`wing${sd}`, catmull([S, E, Wr, Hd, Tp]), {
      parent: spine.joints[1],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "wing",
    });
    const [jSh, jEl, jWr, jHd] = wing.joints;
    b.sweep(wing, [0.075, 0.035], { color: ARMP, sides: 8, name: `arm${sd}` });

    const dirOf = (a: number) => u.clone().multiplyScalar(Math.cos(a * DEG)).addScaledVector(back, Math.sin(a * DEG));
    const lay = (tex: THREE.Texture, at: THREE.Vector3, a: number, len: number, wid: number, layer: number, bone: Joint, bend = -14) =>
      b.cards([frame(at.clone().addScaledVector(nrm, layer), nrm)], tex, {
        size: [wid, len],
        lean: 90,
        flow: dirOf(a),
        bone,
        sink: 0.06,
        bend,
      });
    type Tip = { at: THREE.Vector3; dir: THREE.Vector3 };
    const flames = (bone: Joint, tips: Tip[], size: [number, number]) => {
      if (!tips.length) return;
      glow(
        b.cards(
          tips.map((t) => frame(t.at, nrm)),
          WISP,
          { size, lean: 28, flow: (_f, i) => tips[i].dir, cross: true, bone, vary: 0.25, rng: R, sink: 0.15 },
        ),
        1,
      );
    };

    // primaries: glowing flame feathers fanning from the hand
    const tipsHand: Tip[] = [];
    const tipsWrist: Tip[] = [];
    for (let k = 0; k <= 8; k++) {
      const t = 1 - k / 8;
      const base = Wr.clone().lerp(Tp, t);
      const bone = t > 0.56 ? jHd : jWr;
      const len = 0.8 - 0.045 * Math.abs(k - 2);
      const a = 6 + k * 7.5;
      const layer = k * 0.004;
      glow(lay(PRIM, base, a, len, 0.11, layer, bone, -16), 1);
      const tip = { at: base.clone().addScaledVector(dirOf(a), len * 0.97).addScaledVector(nrm, layer), dir: dirOf(a) };
      (t > 0.56 ? tipsHand : tipsWrist).push(tip);
    }
    flames(jHd, tipsHand, [0.075, 0.17]);
    flames(jWr, tipsWrist, [0.075, 0.17]);

    // secondaries along the forearm
    const tipsSec: Tip[] = [];
    for (let j = 0; j <= 8; j++) {
      const t = 1 - j / 8;
      const base = E.clone().lerp(Wr, t);
      const a = 70 + j * 3.5;
      const len = 0.64 - 0.012 * j;
      const layer = 0.04 + j * 0.004;
      lay(SEC, base, a, len, 0.12, layer, jEl, -12);
      if (j % 2 === 0)
        tipsSec.push({ at: base.clone().addScaledVector(dirOf(a), len * 0.97).addScaledVector(nrm, layer), dir: dirOf(a) });
    }
    flames(jEl, tipsSec, [0.07, 0.15]);

    // tertials along the upper arm
    for (let m = 0; m <= 3; m++) {
      const base = S.clone().lerp(E, 0.8 - m * 0.25);
      lay(SEC, base, 100 + m * 7, 0.5 - 0.04 * m, 0.12, 0.08 + m * 0.004, jSh, -10);
    }

    // coverts: greater rows over every flight feather, then a lesser row along the arm
    for (let q = 0; q <= 8; q++) {
      const t = 1 - q / 8;
      lay(COV_A, Wr.clone().lerp(Tp, t), 6 + q * 7.5, 0.3, 0.095, 0.09 + q * 0.002, t > 0.56 ? jHd : jWr, -10);
      lay(COV_A, E.clone().lerp(Wr, t), 70 + q * 3.5, 0.3, 0.1, 0.09 + q * 0.002, jEl, -8);
    }
    for (let m = 0; m <= 3; m++)
      lay(COV_A, S.clone().lerp(E, 0.8 - m * 0.25), 100 + m * 7, 0.26, 0.1, 0.09 + m * 0.002, jSh, -8);
    for (let i = 0; i <= 10; i++) {
      const base = i <= 5 ? S.clone().lerp(E, i / 5) : E.clone().lerp(Wr, (i - 5) / 5);
      lay(COV_B, base, 75, 0.16, 0.08, 0.13 + i * 0.001, i <= 5 ? jSh : jEl, -6);
    }

    // gold filigree: pauldron, elbow ring, bracer with gem, hanging tassel, thumb claw
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), GOLDC, {
      at: S.clone().addScaledVector(nrm, 0.02),
      dir: nrm,
      scale: [0.11, 0.07, 0.11],
      bone: jSh,
      name: `pauldron${sd}`,
    });
    b.part(new THREE.TorusGeometry(0.11, 0.014, 6, 12), GOLDC, { at: S, dir: nrm, axis: "z", bone: jSh });
    b.part(new THREE.TorusGeometry(0.062, 0.014, 6, 12), GOLDC, {
      at: E,
      dir: Wr.clone().sub(S),
      axis: "z",
      bone: jEl,
    });
    b.part(new THREE.TorusGeometry(0.058, 0.016, 6, 12), GOLDC, {
      at: Wr,
      dir: Hd.clone().sub(E),
      axis: "z",
      bone: jWr,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.032), TEAL, {
        at: Wr.clone().addScaledVector(nrm, 0.07),
        dir: nrm,
        scale: [1, 1.3, 1],
        bone: jWr,
      }),
      1.2,
    );
    b.cards([frame(Wr.clone().add(V(0, -0.05, -0.02)), [0, 1, 0])], TASSEL, {
      size: [0.05, 0.26],
      lean: 180,
      flow: [0, 0, 1],
      bone: jWr,
    });
    b.spike(Tp, u.clone().add(V(0, 0, 0.5)), 0.11, 0.02, GOLDC, { bone: jHd, name: `thumbClaw${sd}` });
  }

  // ------------------------------------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hip = V(s * 0.15, 0.86, -0.06);
    const foot = V(s * 0.17, 0.075, 0.04);
    const pts = limb(hip, foot, [0.28, 0.38, 0.3], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
    });
    const legSw = b.sweep(leg, [0.075, 0.045, 0.03, 0.026], { color: LEGP, sides: 8, name: `legTube${sd}` });
    const thigh = b.surface(legSw).scatter(36, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 0.5 });
    b.cards(thigh, [COV_A, COV_B], { size: [0.075, 0.15], lean: 55, bend: 20, vary: 0.2, rng: R });
    const tarsus = pts[3].clone().sub(pts[2]);
    b.part(new THREE.TorusGeometry(0.034, 0.01, 6, 12), GOLDC, {
      at: pts[2].clone().lerp(pts[3], 0.55),
      dir: tarsus,
      axis: "z",
      bone: leg.joints[2],
    });
    b.part(new THREE.TorusGeometry(0.03, 0.009, 6, 12), GOLDC, {
      at: pts[2].clone().lerp(pts[3], 0.9),
      dir: tarsus,
      axis: "z",
      bone: leg.joints[2],
    });
    // toes: three forward, one back, each its own joint, with dark-gold claws
    const toes = [
      { k: "A", yaw: -26, len: 0.2 },
      { k: "B", yaw: 0, len: 0.25 },
      { k: "C", yaw: 26, len: 0.2 },
      { k: "D", yaw: 180, len: 0.13 },
    ];
    for (const toe of toes) {
      const dx = Math.sin(toe.yaw * DEG);
      const dz = Math.cos(toe.yaw * DEG);
      const tip = V(foot.x + dx * toe.len, 0.018, foot.z + dz * toe.len);
      const tc = b.chain(`toe${toe.k}${sd}`, [foot, tip], { parent: leg, names: [`toe${toe.k}${sd}`], role: "digit" });
      b.sweep(tc, [0.027, 0.02], { color: LEGP, sides: 6, name: `toe${toe.k}${sd}` });
      b.spike(tip, V(dx, -0.12, dz), 0.07, 0.018, CLAW, { bone: tc.joints[0], sides: 6, name: `claw${toe.k}${sd}` });
    }
    b.part(new THREE.SphereGeometry(1, 8, 6), GOLDC, {
      at: foot.clone().add(V(0, 0.005, 0)),
      scale: [0.036, 0.028, 0.04],
      bone: leg.joints[2],
    });
  }

  // ------------------------------------------------------------------------------------------------ embers
  for (let i = 0; i < 16; i++) {
    const x = (R() * 2 - 1) * 1.7;
    const y = 1.0 + R() * 1.3;
    const z = (R() * 2 - 1) * 0.9 - 0.1;
    glow(
      b.part(new THREE.OctahedronGeometry(0.014 + R() * 0.014), [ORANGE, AMBER, YELLOW][i % 3], {
        at: [x, y, z],
        bone: hips,
        scale: [1, 2, 1],
        rotation: [R() * 40, R() * 360, R() * 40],
        name: `ember${i}`,
      }),
      1,
    );
  }

  return b.root;
}
