import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { vec } from "../src/math";
import { bezier, catmull } from "../src/path";
import { paint } from "../src/paint";
import { cellPaint, pick, pixelArt, snapColor, stepped } from "../kits/pixel";
import type { Cell } from "../kits/pixel";
import { glow } from "../kits/glow";

export const meta = {
  name: "Basilisk, Serpent King",
  description:
    "A rearing eight-legged serpent lizard king in pixel art: emerald diamond-backed scales, cream belly scutes, a gold-spiked crown and ruby cock's comb, glowing slit-pupil eyes, a forked tongue, gold collar and a spade-tipped tail.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every ramp is snapped to a 64-level (VGA) palette

const ramp = (cols: string[]) => cols.map((c) => snapColor(c, 64));
const GREEN = ramp(["#06161a", "#0c2b26", "#14452f", "#1f6e3a", "#35a044", "#6ccb54", "#b4e87c"]);
const CREAM = ramp(["#6e5c33", "#9b8648", "#c7b36c", "#e8d99e", "#f8f0c8"]);
const GOLD = ramp(["#5e330f", "#a2601a", "#d6962a", "#f2c84a", "#fff0a4"]);
const RED = ramp(["#32081a", "#6c1226", "#ae1f30", "#e0402e", "#ff8442"]);
const BONE_R = ramp(["#5a4a38", "#8f7c5c", "#cdbc92", "#f0e6c4"]);
const OCHRE = ramp(["#6e3d12", "#a8661a", "#d99a2b", "#f4cc4e"]);

const INK = snapColor("#0a1214", 64);
const GOLDC = snapColor("#e6aa2c", 64);
const GOLDD = snapColor("#a2601a", 64);
const RUBY = snapColor("#d02640", 64);
const BONE = snapColor("#efe4c0", 64);
const BONE_D = snapColor("#9a8660", 64);
const TOOTH = snapColor("#fff8e4", 64);
const CLAW = snapColor("#2a2118", 64);
const PINK = snapColor("#d4506c", 64);
const TONGUE = snapColor("#c8203e", 64);
const STUD = snapColor("#b89654", 64);
const VENOM = snapColor("#9be84a", 64);

const BODY_CELL = 0.04; // texel size for the big masses
const FINE = 0.02; // half texel for head, limbs and small parts

// Cells repeat on every texel, so colours are cached per cell: crisp cells, and the pattern maths runs once.
function skinPaint(size: number, fn: (c: Cell) => string) {
  const cache = new Map<string, string>();
  return cellPaint(
    size,
    (c) => {
      const key = `${c.axis},${c.u},${c.v},${c.depth}`;
      let col = cache.get(key);
      if (col === undefined) {
        col = fn(c);
        cache.set(key, col);
      }
      return col;
    },
    { dither: true },
  );
}

// A flat piece drawn on its own cell grid (extrude coordinates): ramp rows with a checker dither between rows.
function rowPaint(rows: string[], cell: number, rowCount: number, flip = false) {
  return paint((_p, _n, s) => {
    const y = flip ? -s[1] : s[1];
    const row = Math.floor(y / cell + 1e-4);
    const col = Math.floor(s[0] / cell + 1e-4);
    const v = (row + ((col + row) & 1 ? 0.75 : 0.2)) / rowCount;
    return pick(rows, Math.min(1, Math.max(0, v)));
  });
}

const EYE = pixelArt(
  [".ooooo.", "oywyyyo", "oyyKyyo", "oyyKyyo", "oyyKyyo", "oyyKyyo", ".ooooo."],
  { o: "#e8860e", y: "#ffe44c", w: "#ffffff", K: "#120a10" },
);

export default function build() {
  const b = createBuilder({ name: "basilisk", paintSize: 2048 });

  // -------------------------------------------------------------------------------------------------------------
  // Body curve: tail tip -> hips -> shoulders -> reared neck. Radii are [half width, half height].
  const CTRL: { p: [number, number, number]; rx: number; ry: number }[] = [
    { p: [0, 0.2, -3.15], rx: 0.012, ry: 0.012 },
    { p: [0, 0.12, -2.8], rx: 0.05, ry: 0.045 },
    { p: [0, 0.12, -2.3], rx: 0.1, ry: 0.09 },
    { p: [0, 0.17, -1.8], rx: 0.18, ry: 0.15 },
    { p: [0, 0.35, -1.3], rx: 0.28, ry: 0.24 },
    { p: [0, 0.52, -0.85], rx: 0.38, ry: 0.3 },
    { p: [0, 0.56, -0.1], rx: 0.42, ry: 0.33 },
    { p: [0, 0.57, 0.6], rx: 0.43, ry: 0.34 },
    { p: [0, 0.68, 1.05], rx: 0.38, ry: 0.33 },
    { p: [0, 1.05, 1.22], rx: 0.31, ry: 0.29 },
    { p: [0, 1.45, 1.2], rx: 0.26, ry: 0.25 },
    { p: [0, 1.8, 1.36], rx: 0.22, ry: 0.22 },
  ];
  const body = catmull(CTRL.map((c) => c.p));
  const L = body.length;
  const keys = CTRL.map((c) => ({ t: body.closestT(c.p), rx: c.rx, ry: c.ry }));
  const profile = (t: number): [number, number] => {
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const k = keys[i + 1];
      if (t <= k.t || i === keys.length - 2) {
        const f = Math.min(1, Math.max(0, (t - a.t) / (k.t - a.t)));
        const e = f * f * (3 - 2 * f);
        return [a.rx + (k.rx - a.rx) * e, a.ry + (k.ry - a.ry) * e];
      }
    }
    return [keys[0].rx, keys[0].ry];
  };
  const tHips = body.closestT([0, 0.56, -0.1]);
  const tShoulder = body.closestT([0, 0.68, 1.05]);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.56, -0.1], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain("spine", body.slice(tHips, tShoulder), { parent: hips, count: 4, role: "spine" });
  const neck = b.chain("neck", body.slice(tShoulder, 1), {
    parent: spine.joints[spine.joints.length - 1],
    count: 4,
    role: "neck",
  });
  const tail = b.chain("tail", body.slice(tHips, 0), { parent: hips, count: 8, role: "tail" });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: body.at(1),
    dir: [0, -0.22, 1],
    role: "head",
  });

  // ---- body paint: dorsal diamonds, flank studs of dither, cream belly scutes, banded bone tail tip
  const UPV = new THREE.Vector3(0, 1, 0);
  const bodyUV = (at: THREE.Vector3) => {
    const t = body.closestT(at);
    const c = body.at(t);
    const T = body.tangentAt(t);
    const up = UPV.clone().addScaledVector(T, -T.y).normalize();
    const side = new THREE.Vector3().crossVectors(T, up);
    const rel = at.clone().sub(c);
    return { t, x: t * L, a: Math.atan2(rel.dot(side), rel.dot(up)) };
  };
  const bodyPaint = skinPaint(BODY_CELL, (c) => {
    const { x, a } = bodyUV(c.at);
    const aa = Math.abs(a);
    const light = 0.42 + 0.34 * c.n.y + 0.14 * (c.random(1) - 0.5);
    if (x < 0.55) return pick(x % 0.2 < 0.1 ? BONE_R : RED, 0.55 + 0.35 * c.n.y + 0.1 * c.random(2));
    // belly plates (a zig-zag border so the cream edge reads as scutes)
    const plate = Math.floor(x / 0.12);
    const border = 2.15 + (plate % 2 ? 0.16 : -0.06);
    if (aa > border) {
      const f = (x / 0.12) % 1;
      const seam = f < 0.2;
      return pick(CREAM, (seam ? 0.2 : 0.62) + 0.22 * c.random(3) + 0.1 * Math.min(1, (aa - border) / 0.5));
    }
    // dorsal diamonds
    const P = 0.46;
    const ph = (((x % P) + P) % P) / P - 0.5;
    const d = Math.abs(ph) * 2 + aa / 1.05;
    if (d < 1) {
      if (d > 0.82) return pick(OCHRE, 0.15 + 0.2 * c.random(4));
      if (d < 0.3) return pick(GOLD, 0.62 + 0.25 * c.random(5));
      return pick(OCHRE, 0.5 + 0.4 * (1 - d) + 0.1 * c.random(6));
    }
    if (d < 1.17) return pick(GREEN, 0.04 + 0.08 * c.random(7));
    // rings between diamonds on the dark flank, yellow flecks
    const fleck = c.random(8) < 0.035;
    const flankDark = Math.sin(x * 11 + aa * 3) > 0.62 ? -0.12 : 0;
    return pick(GREEN, Math.min(1, Math.max(0, light + flankDark + (fleck ? 0.26 : 0))));
  });

  const bodyTube = b.sweep(body, (t) => profile(t), {
    bone: [tail, hips, spine, neck],
    sides: 8,
    color: bodyPaint,
  });

  // ---- legs: four pairs of sprawled lizard legs
  const LEG_Z = [0.86, 0.3, -0.26, -0.82];
  const LEG_SCALE = [1.1, 1, 1, 1.1];
  // scale plates on a 4 x 3 cell grid, bricked: dark edges, a light top row
  const scaleShade = (c: Cell) => {
    const row = Math.floor(c.v / 3);
    const rowPos = ((c.v % 3) + 3) % 3;
    const edgeU = (((c.u + (row & 1) * 2) % 4) + 4) % 4 === 0;
    return rowPos === 0 || edgeU ? -0.17 : rowPos === 1 ? 0.07 : 0;
  };
  const limbPaint = skinPaint(FINE, (c) => {
    const fleck = c.random(9) < 0.03;
    const v = 0.42 + 0.3 * c.n.y + 0.08 * (c.random(1) - 0.5) + scaleShade(c) + (fleck ? 0.2 : 0);
    if (c.n.y < -0.55) return pick(OCHRE, 0.45 + 0.15 * c.random(2) + scaleShade(c));
    return pick(GREEN, Math.min(1, Math.max(0, v)));
  });
  const padPaint = skinPaint(FINE, (c) => {
    const edge = c.random(1) < 0.0 ? 0 : scaleShade(c) * 1.4;
    return pick(GOLD, Math.min(1, Math.max(0, 0.55 + 0.2 * c.n.y + edge + 0.08 * c.random(2))));
  });
  const toePaint = skinPaint(FINE, (c) => pick(OCHRE, 0.3 + 0.3 * c.n.y + 0.15 * c.random(4) + scaleShade(c)));
  LEG_Z.forEach((z, i) => {
    const k = LEG_SCALE[i];
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const id = `${side}${i + 1}`;
      const by = body.at(body.closestT([0, 0.55, z])).y;
      const hipP: [number, number, number] = [s * 0.3, by - 0.05, z];
      const foot: [number, number, number] = [s * 0.98 * k, 0.09, z + 0.16];
      const pts = limb(hipP, foot, [0.52 * k, 0.46 * k], [s * 0.9, 1, -0.1]);
      if (pts[pts.length - 1].distanceTo(vec(foot)) > 1e-3) throw new Error("leg too short for its foot");
      const parentChain = z > -0.1 ? spine : tail;
      const leg = b.chain(`leg${id}`, pts, {
        parent: parentChain.nearestJoint(hipP),
        names: [`hip${id}`, `knee${id}`, `ankle${id}`],
        role: "leg",
      });
      const limbTube = b.sweep(leg, [0.15 * k, 0.12 * k, 0.09 * k, 0.065 * k], {
        section: "box",
        caps: { start: "round", end: "flat" },
        color: limbPaint,
      });
      // gold shoulder pad, wrist cuff and elbow band, and a row of bone studs on the outer edge
      b.part(new THREE.BoxGeometry(0.26 * k, 0.07, 0.28 * k), padPaint, {
        bone: leg.joints[0],
        at: [hipP[0] + s * 0.17, hipP[1] + 0.15, hipP[2]],
        rotation: [0, 0, -s * 22],
      });
      const legSurf = b.surface(limbTube);
      b.sweep(legSurf.loop(leg.at(0.86), { lift: 0.012 }), 0.017 * k, { section: "box", color: GOLDC });
      for (const t of [0.14, 0.3, 0.64, 0.8])
        b.stick(new THREE.ConeGeometry(0.032 * k, 0.1 * k, 4), BONE, limbTube.at(t, 0), { embed: 0.3 });
      const knee = leg.joints[1];
      const ankle = leg.joints[2];
      // elbow spur, knee plate and an ankle spur
      b.spike(knee.at, [s * 0.75, 0.3, -0.6], 0.2 * k, 0.05, { bone: knee, sides: 4, color: BONE });
      b.part(new THREE.BoxGeometry(0.1 * k, 0.1 * k, 0.1 * k), GOLDC, {
        bone: knee,
        at: [knee.at.x + s * 0.03, knee.at.y + 0.075 * k, knee.at.z + 0.05],
        rotation: [0, 45, 0],
      });
      b.spike([foot[0], 0.12, foot[2] - 0.04], [s * 0.4, 0.4, -1], 0.13, 0.03, { bone: ankle, sides: 4, color: BONE });
      // palm and four toes with claws
      b.part(new THREE.BoxGeometry(0.17 * k, 0.07, 0.25 * k), limbPaint, {
        bone: ankle,
        at: [foot[0], 0.035, foot[2] + 0.07],
      });
      const fan = [-38, -13, 13, 38];
      fan.forEach((deg, ti) => {
        const th = (deg * Math.PI) / 180;
        const dir = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
        const mid = ti === 1 || ti === 2;
        const len = (mid ? 0.24 : 0.19) * k;
        const base = new THREE.Vector3(foot[0] + dir.x * 0.02, 0.032, foot[2] + 0.17 * k + dir.z * 0.02);
        const toe = b.joint(`toe${id}_${ti + 1}`, { parent: ankle, at: base, dir: [dir.x, 0, dir.z], role: "digit" });
        const tip = base.clone().addScaledVector(dir, len);
        b.rod(base, tip, [0.034, 0.024], { bone: toe, sides: 4, color: toePaint });
        b.spike(tip, [dir.x, -0.28, dir.z], 0.11, 0.028, { bone: toe, sides: 4, color: CLAW });
      });
    }
  });

  // ---- spade-tipped tail
  {
    const tipJ = tail.joints[tail.joints.length - 1];
    const tipP = body.at(0);
    const back = body.tangentAt(0).clone().negate();
    const spade = stepped(
      [
        [2, 3],
        [1, 4],
        [0, 5],
        [0, 5],
        [1, 4],
        [2, 3],
      ],
      BODY_CELL * 1.25,
      { rows: true },
    );
    b.extrude(spade, {
      at: tipP.clone().addScaledVector(back, -0.02).add(new THREE.Vector3(0, -0.15, 0)),
      x: [back.x, back.y, back.z],
      y: [0, 1, 0],
      thickness: 0.05,
      color: rowPaint(GOLD, BODY_CELL * 1.25, 5),
      bone: tipJ,
    });
  }

  // ---- dorsal spines: raked saw-tooth plates down neck, back and tail
  {
    const tFrom = body.closestT([0, 1.7, 1.3]);
    const tTo = body.closestT([0, 0.1, -2.7]);
    const count = 36;
    const spinePaint = rowPaint([...RED.slice(0, 2), ...GOLD.slice(1)], BODY_CELL, 7);
    b.along(
      bodyTube,
      count,
      (at) => {
        const x = at.t * L;
        const big = 2 + 8 * Math.exp(-(((x - 3.3) / 1.2) ** 2)) + 2 * Math.exp(-(((x - 5.1) / 0.6) ** 2));
        const h = Math.max(2, Math.round(big));
        const n = at.n;
        const back = at.tangent.clone().negate();
        const cols = [Math.max(1, h - 4), Math.max(1, h - 2), h];
        b.extrude(
          stepped(
            cols.map((hh) => [0, hh] as [number, number]),
            BODY_CELL,
          ),
          {
            at: at.at.clone().addScaledVector(n, -0.05),
            x: [back.x, back.y, back.z],
            y: [n.x, n.y, n.z],
            thickness: 0.035,
            color: spinePaint,
            bone: at.bone ?? undefined,
          },
        );
      },
      { from: tTo, to: tFrom },
    );
  }

  // ---- flank studs and tail bands
  {
    const studGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    for (const s of [1, -1]) {
      for (let i = 0; i < 16; i++) {
        const t = tHips - 0.2 + (i / 15) * 0.36;
        const t2 = Math.min(0.97, Math.max(0.03, t));
        b.stick(studGeo, STUD, bodyTube.at(t2, s * 72), { embed: 0.45 });
      }
      for (let i = 0; i < 6; i++) {
        const t = body.closestT([0, 1.05, 1.23]) + (i / 5) * 0.06;
        b.stick(studGeo, STUD, bodyTube.at(t, s * 82), { embed: 0.45 });
      }
    }
    const surf = b.surface(bodyTube);
    for (const z of [-1.4, -1.85, -2.25, -2.55]) {
      const tt = body.closestT([0, 0.12, z]);
      b.sweep(surf.loop(body.at(tt), { dir: body.tangentAt(tt), lift: 0.012 }), 0.018, { section: "box", color: GOLDC });
    }
    // gold collar with rubies, and a ruby pendant on the chest
    const tc = body.closestT([0, 1.5, 1.21]);
    const collar = surf.loop(body.at(tc), { dir: body.tangentAt(tc), lift: 0.02 });
    b.sweep(collar, 0.04, { section: "box", color: GOLDC });
    b.sweep(surf.loop(body.at(tc - 0.03), { dir: body.tangentAt(tc - 0.03), lift: 0.015 }), 0.02, {
      section: "box",
      color: GOLDD,
    });
    b.along(collar, 8, (at) => b.part(new THREE.BoxGeometry(0.07, 0.07, 0.07), RUBY, { frame: at }));
    const pend = bodyTube.at(tc, 180);
    b.stick(new THREE.BoxGeometry(0.15, 0.15, 0.05), GOLDC, pend, { embed: 0.2, spin: 45 });
    b.stick(new THREE.BoxGeometry(0.09, 0.09, 0.05), RUBY, pend, { embed: -0.3, spin: 45 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head, authored at unit size in head-frame numbers [right, forward, up] and enlarged by S: a king's big head
  const S = 1.35;
  const HC = FINE * S; // the head's texel
  const H = (r: number, f: number, u: number) => head.local([r * S, f * S, u * S]);
  const headInv = head.quat.clone().invert();
  const toHead = (p: THREE.Vector3) => p.clone().sub(head.at).applyQuaternion(headInv).divideScalar(S); // right, forward, up
  const topAt = (f: number) => 0.19 - 0.209 * (f + 0.12);
  const halfAt = (f: number) => (0.44 - (0.18 * (f + 0.12)) / 0.67) / 2;
  const bx = (w: number, l: number, h: number) => new THREE.BoxGeometry(w * S, l * S, h * S);
  const hbox = (size: [number, number, number], r: number, f: number, u: number) =>
    bx(...size)
      .applyQuaternion(head.quat)
      .translate(...H(r, f, u).toArray());
  const zAxis = new THREE.Vector3(0, 0, 1);

  const headPaint = skinPaint(HC, (c) => {
    const [r, f, u] = toHead(c.at).toArray();
    const top = topAt(f);
    let v = 0.46 + 0.34 * c.n.y + 0.06 * (c.random(1) - 0.5) + scaleShade(c) * 0.8;
    if (u < -0.075 && c.n.y < 0.5) return pick(CREAM, 0.55 + 0.25 * c.random(2) + scaleShade(c) * 0.6);
    if (f > 0.02 && Math.abs(u - (top - 0.1)) < 0.02 && Math.abs(r) > 0.04) return pick(GREEN, 0.04 + 0.08 * c.random(3));
    if (c.n.y > 0.5) {
      // gold diamond between the brows
      const d = Math.abs(r) / 0.11 + Math.abs(f - 0.36) / 0.13;
      if (d < 0.35) return pick(GOLD, 0.72 + 0.1 * c.random(5));
      if (d < 0.8) return pick(OCHRE, 0.55 + 0.2 * c.random(5));
      if (d < 1) return pick(OCHRE, 0.18);
      if (d < 1.2) return pick(GREEN, 0.05);
    }
    if (Math.abs(r) < 0.022 && c.n.y > 0.4) v += 0.22;
    if (c.random(4) < 0.03) v += 0.28;
    return pick(GREEN, Math.min(1, Math.max(0, v)));
  });
  const jawPaint = skinPaint(HC, (c) => {
    const brick = (c.u + (c.v & 1) * 2) % 4 === 0;
    if (c.n.y < -0.4) return pick(CREAM, (brick ? 0.25 : 0.6) + 0.25 * c.random(1));
    return pick(GREEN, Math.min(1, Math.max(0, 0.3 + 0.3 * c.n.y + 0.1 * c.random(2) - (brick ? 0.08 : 0))));
  });

  // skull (upper jaw), snout, nostrils and nose horn
  const skull = b.frustumBox(H(0, -0.12, 0.02), H(0, 0.55, -0.04), [0.44 * S, 0.34 * S], [0.26 * S, 0.18 * S], {
    bone: head,
    color: headPaint,
  });
  b.part(bx(0.28, 0.07, 0.2), headPaint, { bone: head, at: H(0, 0.57, -0.035), quat: head.quat });
  b.part(bx(0.34, 0.09, 0.06), headPaint, { bone: head, at: H(0, 0.5, -0.115), quat: head.quat });
  b.spike(H(0, 0.5, 0.07), head.dir([0, 0.45, 1]), 0.15 * S, 0.04 * S, { bone: head, sides: 4, color: BONE });
  for (const s of [1, -1]) {
    const rr = -s; // head-frame x is the model's right, so the model's left side is negative
    b.part(bx(0.045, 0.04, 0.03), INK, { bone: head, at: H(rr * 0.065, 0.55, 0.062), quat: head.quat });
    // eye turret angled forward so the gaze meets you, brow plate and brow spike
    const phi = (35 * Math.PI) / 180;
    const eq = head.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(zAxis, rr > 0 ? phi : Math.PI - phi));
    const cx = rr * 0.145;
    const cf = 0.33;
    const cu = 0.035;
    b.part(bx(0.13, 0.17, 0.15), headPaint, { bone: head, at: H(cx, cf, cu), quat: eq });
    b.part(bx(0.15, 0.2, 0.06), headPaint, { bone: head, at: H(cx + rr * 0.01, cf - 0.01, cu + 0.1), quat: eq });
    b.spike(H(rr * 0.19, 0.2, cu + 0.12), head.dir([rr * 0.35, -0.9, 0.3]), 0.17 * S, 0.035 * S, {
      bone: head,
      sides: 4,
      color: BONE,
    });
    const fx = Math.cos(phi) * rr;
    const fy = Math.sin(phi);
    glow(
      b.part(new THREE.PlaneGeometry(7 * HC, 7 * HC), "#ffffff", {
        bone: head,
        at: H(cx + fx * 0.0665, cf + fy * 0.0665, cu),
        dir: head.dir([fx, fy, 0.08]),
        axis: "z",
        texture: EYE,
      }),
      1.6,
    );
    // cheek jewel, cheek and jaw spurs, ear hollow
    b.part(bx(0.05, 0.05, 0.05), GOLDC, { bone: head, at: H(rr * (halfAt(0.14) + 0.012), 0.14, -0.065), quat: head.quat });
    b.spike(H(rr * 0.2, -0.04, -0.06), head.dir([rr * 0.8, -0.7, -0.15]), 0.17 * S, 0.035 * S, {
      bone: head,
      sides: 4,
      color: BONE,
    });
    b.spike(H(rr * 0.19, 0.04, -0.1), head.dir([rr * 0.75, -0.5, -0.35]), 0.12 * S, 0.03 * S, {
      bone: head,
      sides: 4,
      color: BONE,
    });
    b.part(bx(0.03, 0.06, 0.08), INK, { bone: head, at: H(rr * 0.215, -0.07, -0.01), quat: head.quat });
    // swept-back ruby frill with gold ribs
    const frill = b.joint(`frill${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: H(rr * 0.2, -0.06, 0.04),
      dir: [s, 0.1, 0.2],
      role: "fan",
    });
    const FR = stepped(
      Array.from({ length: 16 }, (_, i) => [Math.max(0, i - 6), 7 + Math.round(i * 0.7) - (i % 5 === 4 ? 3 : 0)] as [number, number]),
      HC,
      { rows: true },
    );
    b.extrude(FR, {
      at: frill.at,
      x: [s, 0.05, -0.55],
      y: [0, 1, 0],
      thickness: 0.026,
      color: paint((_p, _n, sc) => {
        const cx2 = Math.floor(sc[0] / HC + 1e-4);
        const cy2 = Math.floor(sc[1] / HC + 1e-4);
        const rad = Math.hypot(cx2, cy2);
        const ang = Math.atan2(cy2, cx2);
        if (rad > 17.5) return RED[1];
        if (Math.floor(ang * 6) % 2 === 0) return pick(GOLD, 0.45 + 0.4 * (rad / 19));
        return pick(RED, 0.3 + 0.55 * (rad / 19) + 0.1 * ((cx2 + cy2) & 1));
      }),
      bone: frill,
    });
  }
  // swept-back banded bone horns
  for (const s of [1, -1]) {
    const rr = -s;
    b.sweep(bezier(H(rr * 0.16, -0.08, 0.12), H(rr * 0.34, -0.22, 0.2), H(rr * 0.32, -0.46, 0.46)), [0.06 * S, 0.012 * S], {
      bone: head,
      sides: 4,
      caps: { start: "flat", end: "point" },
      bands: [
        [0.2, BONE],
        [0.27, BONE_D],
        [0.5, BONE],
        [0.57, BONE_D],
        [1, BONE],
      ],
    });
  }

  // gold crown band, five gold spikes with ruby studs, and a ruby cock's comb
  const band = b.surface(skull).loop(H(0, -0.01, 0.01), { dir: head.dir([0, 1, 0]), lift: 0.012 });
  b.sweep(band, 0.025 * S, { section: "box", color: GOLDC, bone: head });
  const crownRows = rowPaint(GOLD, HC, 9);
  [-70, -35, 0, 35, 70].forEach((deg, i) => {
    const th = (deg * Math.PI) / 180;
    const hh = [6, 8, 11, 8, 6][i];
    const tang = head.dir([Math.cos(th), 0, -Math.sin(th)]);
    const out = [Math.sin(th) * 0.9, -0.4, Math.cos(th)];
    const root = H(Math.sin(th) * 0.2, -0.05, 0.02 + Math.cos(th) * 0.16);
    b.extrude(
      stepped(
        [hh - 3, hh, hh - 3].map((v) => [0, Math.max(1, v)] as [number, number]),
        HC,
      ),
      {
        at: root.addScaledVector(tang, -1.5 * HC),
        x: tang.toArray(),
        y: head.dir(out),
        thickness: 0.036,
        color: crownRows,
        bone: head,
      },
    );
    b.part(bx(0.05, 0.05, 0.05), RUBY, {
      bone: head,
      at: H(Math.sin(th) * 0.225, -0.05, 0.02 + Math.cos(th) * 0.185),
      quat: head.quat,
    });
  });
  {
    const colsH = [3, 4, 6, 5, 8, 6, 9, 7, 8, 5, 6, 4, 3];
    const base = 0.07;
    const f0 = 0.0;
    const spans = colsH.map((vis, i) => {
      const f = f0 + (i + 0.5) * FINE;
      const hidden = Math.max(0, Math.round((topAt(f) - base) / FINE));
      return [0, hidden + vis] as [number, number];
    });
    b.extrude(stepped(spans, HC), {
      at: H(0, f0, base),
      x: head.dir([0, 1, 0]).toArray(),
      y: head.dir([0, 0, 1]).toArray(),
      thickness: 0.05,
      color: paint((_p, _n, s) => {
        const col = Math.floor(s[0] / HC + 1e-4);
        const yTop = (spans[Math.min(spans.length - 1, Math.max(0, col))][1] * HC - s[1]) / HC;
        return yTop < 1.2
          ? pick(GOLD, 0.8)
          : yTop < 3.2
            ? RED[3]
            : pick(RED, 0.25 + 0.1 * ((col + Math.floor(s[1] / HC)) & 1));
      }),
      bone: head,
    });
  }

  // teeth (merged per jaw), and the lower jaw
  const upperTeeth: THREE.BufferGeometry[] = [];
  const lowerTeeth: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const f = 0.1 + i * 0.058;
      const w = halfAt(f) - 0.012;
      upperTeeth.push(hbox([0.026, 0.026, 0.06], s * w, f, -0.145));
      if (i < 7) lowerTeeth.push(hbox([0.024, 0.024, 0.055], s * (w - 0.04), f + 0.02, -0.147));
    }
  }
  b.part(mergeGeometries(upperTeeth)!, TOOTH, { bone: head, at: [0, 0, 0] });

  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.06, -0.145), aim: H(0, 0.5, -0.155), role: "jaw" });
  b.frustumBox(H(0, -0.06, -0.195), H(0, 0.5, -0.172), [0.38 * S, 0.1 * S], [0.22 * S, 0.08 * S], {
    bone: jaw,
    color: jawPaint,
  });
  b.part(bx(0.2, 0.06, 0.07), jawPaint, { bone: jaw, at: H(0, 0.53, -0.166), quat: head.quat });
  b.frustumBox(H(0, 0.0, -0.152), H(0, 0.5, -0.133), [0.3 * S, 0.02 * S], [0.17 * S, 0.02 * S], {
    bone: jaw,
    color: PINK,
  });
  b.part(mergeGeometries(lowerTeeth)!, TOOTH, { bone: jaw, at: [0, 0, 0] });
  for (const s of [1, -1]) {
    b.spike(H(s * 0.17, 0.1, -0.22), jaw.dir([s * 0.3, -0.5, -0.8]), 0.1 * S, 0.03 * S, {
      bone: jaw,
      sides: 4,
      color: BONE,
    });
    // venom fangs with a bead of green poison
    b.spike(H(-s * 0.1, 0.38, -0.14), head.dir([0, 0.04, -1]), 0.2 * S, 0.034 * S, {
      bone: head,
      sides: 4,
      color: TOOTH,
    });
    b.part(bx(0.03, 0.03, 0.03), VENOM, { bone: head, at: H(-s * 0.1, 0.4, -0.3), quat: head.quat });
  }
  // dewlap: ruby wattles hung under the chin
  [3, 5, 7, 5, 3].forEach((n, i) => {
    b.extrude(
      stepped(
        [
          [-n, 0],
          [-n, 0],
        ],
        HC,
      ),
      {
        at: H(0, 0.1 + i * 0.07, -0.225),
        x: head.dir([0, 1, 0]).toArray(),
        y: head.dir([0, 0, 1]).toArray(),
        thickness: (0.04 - Math.abs(i - 2) * 0.004) * S,
        color: rowPaint(RED, HC, 7, true),
        bone: jaw,
      },
    );
  });

  // forked tongue
  const tongue = b.chain(
    "tongue",
    catmull([H(0, 0.02, -0.158), H(0, 0.28, -0.158), H(0, 0.56, -0.168), H(0, 0.76, -0.19)]),
    { parent: jaw, count: 3, role: "tentacle" },
  );
  b.sweep(tongue, [0.034 * S, 0.03 * S, 0.022 * S], { section: "box", color: TONGUE, caps: { start: "round", end: "flat" } });
  const tongueTip = tongue.joints[tongue.joints.length - 1];
  for (const s of [1, -1])
    b.rod(H(0, 0.74, -0.19), H(-s * 0.07, 0.86, -0.2), [0.02 * S, 0.012 * S], { bone: tongueTip, sides: 4, color: TONGUE });

  // slightly open mouth in the rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  return b.root;
}
