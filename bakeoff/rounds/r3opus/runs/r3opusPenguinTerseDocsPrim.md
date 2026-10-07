```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, limb, paint, mottle, offset } from "agentic-3js-builder";

export const meta = {
  name: "Waddles the King Penguin",
  description:
    "A stylized low-poly king penguin with a mottled slate back, a white belly that warms into a gold chest, orange ear patches, a long two-part beak, webbed orange feet, and a knitted teal scarf and bobble hat. Rigged in a neutral rest pose with flippers held out.",
};

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // ---------- palette ----------
  const BACK = mottle("#283346", "#1a2130", { size: 0.07, seed: 3 });
  const EDGE = "#55606f";
  const C_WHITE = new THREE.Color("#f7f3e8");
  const C_GOLD = new THREE.Color("#ffc94f");
  const C_EAR = new THREE.Color("#ff9a2e");
  const WHITE = "#f7f3e8";
  const BEAK = "#1c1d22";
  const BEAK_ORANGE = "#ff8a3a";
  const FOOT = "#ff8a2a";
  const WEB = "#ec6a1c";
  const CLAW = "#3a2a22";
  const PUPIL = "#121419";
  const TEAL = "#1d9e9a";
  const TEAL_D = "#157a78";
  const CREAM = "#fbe9c8";
  const RED = "#e2513f";

  const hex = (c: THREE.Color) => "#" + c.getHexString();
  const lerpC = (a: THREE.Color, c: THREE.Color, t: number) => hex(a.clone().lerp(c, Math.min(1, Math.max(0, t))));
  const smooth = (x: number) => {
    const t = Math.min(1, Math.max(0, x));
    return t * t * (3 - 2 * t);
  };

  // plumage: slate back, white belly wrapping round the bottom, gold chest, orange ear patches
  const plumage = paint((p, n) => {
    if (p.y > 0.67) {
      if (Math.abs(n.x) > 0.5 && p.y < 0.785 && p.y > 0.67 && p.z < 0.07) return hex(C_EAR);
      if (n.z > 0.3 && p.y < 0.73) return lerpC(C_GOLD, C_EAR, (p.y - 0.67) / 0.06);
      return BACK;
    }
    const h = Math.min(1, Math.max(0, (p.y - 0.05) / 0.62));
    const thr = -0.4 + 0.7 * h;
    if (n.z < thr - 0.08) {
      if (Math.abs(n.x) > 0.6 && p.y > 0.6) return hex(C_EAR);
      return BACK;
    }
    if (n.z < thr) return EDGE;
    return lerpC(C_WHITE, C_GOLD, smooth((p.y - 0.42) / 0.22));
  });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.18, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.3, 0.005],
      [0, 0.45, 0.012],
      [0, 0.6, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: spine.joints[1], at: [0, 0.6, 0.02], dir: [0, 1, 0.08], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.76, 0.03], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.08, down: 0.025 }),
    aim: head.local({ forward: 0.2, down: 0.045 }),
    role: "jaw",
  });

  // ---------- body ----------
  const bodyPath = catmull([
    [0, 0.11, -0.005],
    [0, 0.28, 0.005],
    [0, 0.45, 0.012],
    [0, 0.6, 0.02],
    [0, 0.68, 0.025],
  ]);
  const body = b.sweep(bodyPath, [0.1, 0.15, 0.165, 0.15, 0.115, 0.08], {
    bone: [hips, spine, neck],
    color: plumage,
    sides: 12,
    name: "body",
  });

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(0.105, 12, 10), plumage, { bone: head, at: head.at, name: "skull" });

  // beak: long dark upper, orange lower on the jaw
  b.frustumBox(head.local({ forward: 0.07 }), head.local({ forward: 0.215, down: 0.03 }), [0.042, 0.03], [0.006, 0.008], {
    bone: head,
    color: BEAK,
    name: "beakUpper",
  });
  b.frustumBox(jaw.at, head.local({ forward: 0.2, down: 0.042 }), [0.036, 0.018], [0.008, 0.006], {
    bone: jaw,
    color: BEAK_ORANGE,
    name: "beakLower",
  });

  // eyes
  const headSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = headSurf.around(head.at).at(s * 45, 8);
    if (!hit) continue;
    const white = hit.local([0, 0.004, 0]);
    b.part(new THREE.SphereGeometry(0.026, 10, 8), WHITE, { bone: head, at: white, name: `eyeWhite${s > 0 ? "L" : "R"}` });
    const pupilC = hit.local([0, 0.02, 0]);
    b.part(new THREE.SphereGeometry(0.014, 8, 6), PUPIL, { bone: head, at: pupilC });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), WHITE, {
      bone: head,
      at: offset(offset(pupilC, [0, 1, 0], 0.007), hit.n, 0.009),
    });
  }

  // knitted bobble hat
  const hatAt: [number, number, number] = [0, 0.82, 0.03];
  const ribs = paint((_p, _n, s) => (Math.floor(s[1] / 15) % 2 === 0 ? TEAL : TEAL_D));
  b.lathe(
    [
      [0, 0, "sharp"],
      [0.104, 0, "sharp"],
      [0.1, 0.035],
      [0.08, 0.07],
      [0.045, 0.093],
      [0, 0.1, "sharp"],
    ],
    { at: hatAt, bone: head, smoothing: 1, segments: 14, color: ribs, name: "hat" },
  );
  const cuffRibs = paint((_p, _n, s) => (Math.floor(s[1] / 12) % 2 === 0 ? CREAM : "#efd6ab"));
  b.lathe(
    [
      [0.097, -0.012],
      [0.114, -0.012],
      [0.116, 0.02],
      [0.097, 0.022],
    ],
    { at: hatAt, bone: head, segments: 16, color: cuffRibs, name: "hatCuff" },
  );
  b.part(new THREE.SphereGeometry(0.032, 8, 6), CREAM, {
    bone: head,
    at: [0, 0.82 + 0.122, 0.03],
    flat: true,
    name: "pompom",
  });

  // ---------- flippers ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const flipper = b.chain(
      `flipper${S}`,
      catmull([
        [s * 0.1, 0.53, 0.0],
        [s * 0.24, 0.47, 0.0],
        [s * 0.38, 0.39, -0.005],
      ]),
      { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "wing", up: [0, 1, 0] },
    );
    b.sweep(
      flipper,
      (t: number) => [0.02 + 0.04 * Math.sin(Math.PI * (0.25 + 0.75 * t)), 0.016 * (1 - t) + 0.007] as [number, number],
      { color: BACK, sectors: [[115, 245, WHITE]], sides: 10 },
    );
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.14, -0.08],
      [0, 0.09, -0.18],
      [0, 0.065, -0.24],
    ]),
    { parent: hips, count: 2, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t: number) => [0.045 - 0.03 * t, 0.016 - 0.006 * t] as [number, number], { color: BACK });

  // ---------- legs and webbed feet ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.07, 0.16, 0.02], [s * 0.08, 0.035, 0.05], [0.07, 0.07], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.08, 0, 0.07],
    });
    const ankle = leg.joints[leg.joints.length - 1];
    b.sweep(leg, [0.026, 0.02], { color: FOOT });
    const ank = pts[pts.length - 1];
    b.part(new THREE.SphereGeometry(0.026, 8, 6), FOOT, { bone: ankle, at: ank, name: `heel${S}` });

    const toes = [];
    for (let i = 0; i < 3; i++) {
      const ang = (i - 1) * 0.55 + s * 0.15;
      const start: [number, number, number] = [ank.x + Math.sin(ang) * 0.01, 0.022, ank.z + Math.cos(ang) * 0.01];
      const tip: [number, number, number] = [ank.x + Math.sin(ang) * 0.085, 0.012, ank.z + Math.cos(ang) * 0.085];
      const toe = b.chain(`toe${S}${i + 1}`, [start, tip], { parent: ankle, names: [`toe${S}${i + 1}`], role: "digit" });
      b.sweep(toe, [0.015, 0.009], { color: FOOT });
      const end = toe.at(1);
      b.spike(end, end, 0.022, 0.007, { color: CLAW });
      toes.push(toe);
    }
    b.membrane(toes[0], toes[1], { thickness: 0.005, color: WEB, scallop: 0.15 });
    b.membrane(toes[1], toes[2], { thickness: 0.005, color: WEB, scallop: 0.15 });
  }

  // ---------- knitted scarf ----------
  const knitColour = (k: number) => (k % 4 === 2 ? CREAM : k % 4 === 3 ? RED : TEAL);
  const scarfRing = paint((p) => {
    const a = Math.atan2(p.x, p.z - 0.02);
    return knitColour(Math.floor(((a + Math.PI) / (2 * Math.PI)) * 20));
  });
  const scarfTail = paint((_p, _n, s) => knitColour(Math.floor(s[0] * 8)));

  const bodySurf = b.surface(body);
  const collar = bodySurf.loop(neck, { lift: 0.012 });
  b.sweep(collar, 0.024, { color: scarfRing, name: "scarf" });

  const hang = bodySurf.drape(
    catmull([
      [-0.035, 0.585, 0.12],
      [-0.06, 0.5, 0.16],
      [-0.075, 0.41, 0.18],
    ]),
    { lift: 0.012 },
  );
  b.sweep(hang, () => [0.026, 0.008] as [number, number], { color: scarfTail, caps: "flat", name: "scarfEnd" });
  const endP = hang.at(1);
  const endT = hang.tangentAt(1);
  for (let k = -2; k <= 2; k++) {
    const a = offset(endP, [1, 0, 0], k * 0.01);
    b.capsule(a, offset(a, endT, 0.03), 0.0035, { color: CREAM });
  }

  return b.root;
}
```