import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, offset } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hydra of the Broken Spears",
  "description": "A hulking five-headed hydra in God of War style: blackened scarred hide, bone-white horns and fangs, rune-brands and wounds glowing ember-red, bronze spears and chains still lodged in its flesh."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hideDark: "#2a2f2c",
  hideMid: "#3d4640",
  hideLight: "#5a6658",
  belly: "#8a8468",
  scarFlesh: "#8c3b34",
  blood: "#5e0f0e",
  bone: "#d8cfb8",
  boneDark: "#9c9078",
  horn: "#3a342e",
  hornTip: "#cfc4a8",
  claw: "#1c1a18",
  eyeAmber: "#ffb02a",
  eyeSlit: "#0d0b0a",
  mouthInner: "#7a1d1a",
  tongue: "#b03a2e",
  ember: "#ff4a1c",
  runeGlow: "#ff7a1f",
  iron: "#4c4f55",
  ironDark: "#2b2d32",
  bronze: "#8a6a34",
  bronzeDark: "#5a431f",
  chain: "#6b6e74",
  leather: "#4a3626",
  frost: "#9fc4d6",
};
const M = {
  torsoCenter: [0, 2.6, 0] as [number, number, number],
  shoulderHump: [0, 3.4, 1.2] as [number, number, number],
  spineTop: [0, 3.6, 0] as [number, number, number],
  chestFront: [0, 2.9, 2.2] as [number, number, number],
  neckBaseA: [0, 3, 1.9] as [number, number, number],
  neckBaseB: [0.6, 2.95, 1.9] as [number, number, number],
  neckBaseC: [-0.6, 2.95, 1.9] as [number, number, number],
  neckBaseD: [1.1, 2.9, 1.7] as [number, number, number],
  neckBaseE: [-1.1, 2.9, 1.7] as [number, number, number],
  headA: [0, 4.9, 3.9] as [number, number, number],
  headB: [2, 4.5, 3.7] as [number, number, number],
  headC: [-2, 4.5, 3.7] as [number, number, number],
  headD: [3.2, 3.7, 3.2] as [number, number, number],
  headE: [-3.2, 3.7, 3.2] as [number, number, number],
  hipFL: [1.3, 2.5, 1.3] as [number, number, number],
  hipFR: [-1.3, 2.5, 1.3] as [number, number, number],
  hipHL: [1.4, 2.4, -1.5] as [number, number, number],
  hipHR: [-1.4, 2.4, -1.5] as [number, number, number],
  footFL: [1.8, 0.1, 2.1] as [number, number, number],
  footFR: [-1.8, 0.1, 2.1] as [number, number, number],
  footHL: [1.7, 0.1, -1.4] as [number, number, number],
  footHR: [-1.7, 0.1, -1.4] as [number, number, number],
  tailRoot: [0, 2.4, -2.2] as [number, number, number],
  tailTip: [0, 0.4, -5.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const R = rng(11);

  // ---------- body: hips -> spine -> chest ----------
  const body = b.loft(
    [
      { at: [0, 2.45, -2.35], w: 1.5, h: 1.6 },
      { at: [0, 2.45, -1.5], w: 2.6, h: 2.1 },
      { at: [0, 2.5, -0.5], w: 2.3, h: 2.0 },
      { at: [0, 2.55, 0.7], w: 2.9, h: 2.3 },
      { at: [0, 2.55, 1.7], w: 3.1, h: 2.5 },
      { at: [0, 2.6, 2.45], w: 2.4, h: 2.0 },
    ],
    {
      bone: [J.hips, J.spine, J.chest],
      color: P.hideMid,
      sectors: [
        [-60, 60, P.hideDark],
        [125, 235, P.belly],
      ],
    },
  );
  const hump = b.part(new THREE.SphereGeometry(1, 8, 6), P.hideDark, {
    bone: J.chest,
    at: M.shoulderHump,
    scale: [1.25, 0.62, 1.1],
  });
  const skin = b.surface([body, hump]);
  const down = [0, -1, 0];

  // ---------- dorsal plates, two rows ----------
  const zs = [2.0, 1.2, 0.4, -0.4, -1.2, -1.95];
  zs.forEach((z, i) => {
    const s = 1.05 - i * 0.1;
    for (const sx of [1, -1]) {
      const h = skin.ray([sx * 0.42, 6, z], down);
      if (!h) continue;
      b.stick(new THREE.ConeGeometry(0.2 * s, 0.5 * s, 4), P.hideDark, h, { embed: 0.2, flat: true, spin: 45 });
      b.stick(new THREE.ConeGeometry(0.1 * s, 0.38 * s, 4), P.boneDark, h.moved([0, 0.3 * s, 0]), {
        embed: 0.1,
        flat: true,
        spin: 45,
      });
    }
  });

  // ---------- ribs ----------
  for (const s of [1, -1]) {
    for (const z of [1.4, 0.8, 0.2, -0.4]) {
      const pts: number[][] = [];
      for (const e of [-35, -10, 15, 45]) {
        const h = skin.around([0, 2.55, z]).at(s * 90, e);
        if (h) pts.push(h.moved([0, 0.03, 0]).at.toArray());
      }
      if (pts.length > 2) b.sweep(catmull(pts), [0.06, 0.04], { color: P.boneDark, bone: J.spine, sides: 5 });
    }
  }

  // ---------- belly bands ----------
  for (const z of [1.5, 0.7, -0.1, -0.9]) {
    for (const x of [-0.75, 0, 0.75]) {
      const h = skin.ray([x, -1, z], [0, 1, 0]);
      if (h) b.stick(new THREE.BoxGeometry(0.7, 0.12, 0.32), "#a8a184", h, { embed: 0.5, flat: true });
    }
  }

  // ---------- scale plates and mud ----------
  skin
    .scatter(14, { rng: R, minDist: 0.5, filter: (h) => h.n.y > 0.05 && Math.abs(h.at.x) > 0.7 })
    .forEach((h, i) => {
      b.stick(new THREE.CylinderGeometry(0.2, 0.3, 0.1, 5), i % 2 ? P.hideLight : P.hideMid, h, {
        embed: 0.4,
        flat: true,
        spin: i * 37,
      });
    });
  skin
    .scatter(6, { rng: R, minDist: 0.6, filter: (h) => h.at.y < 2.2 && Math.abs(h.n.x) > 0.4 })
    .forEach((h, i) => {
      b.stick(new THREE.SphereGeometry(0.22, 5, 4), P.hideDark, h, { embed: 0.5, scale: [1.4, 0.3, 1], spin: i * 50 });
    });

  // ---------- claw slashes on right flank ----------
  const flank = (s: number, z: number, y: number) => skin.ray([s * 5, y, z], [-s, 0, 0]);
  [1.5, 1.1, 0.7].forEach((z0) => {
    const path = [
      [z0, 3.55],
      [z0 - 0.15, 3.15],
      [z0 - 0.35, 2.75],
      [z0 - 0.55, 2.35],
    ];
    const pts = (lift: number) =>
      path.map(([z, y]) => flank(-1, z, y)).filter(Boolean).map((h) => h!.moved([0, lift, 0]).at.toArray());
    const a = pts(0.03);
    const c = pts(0.045);
    if (a.length > 2) {
      b.sweep(catmull(a), 0.075, { color: P.blood, bone: J.spine, sides: 4 });
      b.sweep(catmull(c), 0.045, { color: P.scarFlesh, bone: J.spine, sides: 4 });
    }
  });

  // ---------- stump scar, right shoulder ----------
  {
    const h = skin.ray([-1.0, 6, 1.4], down);
    if (h) {
      b.stick(new THREE.CylinderGeometry(0.34, 0.42, 0.35, 7), P.scarFlesh, h, { embed: 0.3, flat: true });
      glow(b.stick(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 7), P.ember, h.moved([0, 0.28, 0]), { embed: 0 }), 1.6);
      b.ring(h.moved([0, 0.05, 0]), { count: 8, radius: 0.4 }, (it: any) => {
        b.stick(new THREE.BoxGeometry(0.07, 0.24, 0.05), P.leather, it, { embed: 0.3, bone: J.chest });
      });
      b.ring(h.moved([0, 0.3, 0]), { count: 5, radius: 0.0 }, (it: any) => {
        glow(b.spike(it, it, 0.3, 0.03, { color: P.ember, bone: J.chest }), 1.5);
      });
      b.part(new THREE.BoxGeometry(0.22, 0.05, 0.12), P.iron, { bone: J.chest, at: h.moved([0.0, 0.1, 0.42]).at });
    }
  }

  // ---------- rune brands ----------
  const rune = (h: any, v: number) => {
    if (!h) return;
    const strokes = v
      ? [[0, 0, 0.5, 0], [0.1, 0.1, 0.28, 50], [0.1, -0.1, 0.28, -50]]
      : [[0, 0, 0.5, 0], [-0.1, 0.12, 0.28, -45], [0.0, -0.18, 0.3, 90]];
    for (const [dx, dz, len, sp] of strokes) {
      glow(
        b.stick(new THREE.BoxGeometry(0.055, 0.05, len), P.runeGlow, h.moved([dx, 0, dz]), { embed: 0.3, spin: sp }),
        1.4,
      );
    }
  };
  rune(flank(1, 0.5, 2.9), 0);
  rune(flank(1, -0.5, 2.6), 1);
  rune(flank(-1, -0.8, 3.0), 1);
  rune(flank(-1, -0.8, 2.3), 0);

  // ---------- spears ----------
  const spear = (h: any, d: number[], len: number, head: boolean) => {
    if (!h) return;
    const dir = V(d).normalize();
    const base = h.at.clone();
    const start = base.clone().addScaledVector(dir, -0.4);
    const end = base.clone().addScaledVector(dir, len);
    b.rod(start, end, [0.055, 0.04], { color: P.bronzeDark, bone: J.spine });
    b.rod(base.clone().addScaledVector(dir, 0.55), base.clone().addScaledVector(dir, 0.7), 0.07, {
      color: P.bronze,
      bone: J.spine,
    });
    if (head) b.spike(end, dir, 0.4, 0.09, { color: P.iron, bone: J.spine });
    else b.spike(end, dir.clone().add(V([0.3, 0, 0.2])).normalize(), 0.22, 0.045, { color: P.boneDark, bone: J.spine });
    b.stick(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 7), P.blood, h, { embed: 0.4, flat: true });
  };
  spear(skin.ray([0.6, 6, 0.5], down), [0.25, 1, -0.45], 1.5, true);
  spear(skin.ray([-0.5, 6, -1.0], down), [-0.35, 1, 0.2], 1.2, false);
  spear(skin.ray([-1.1, 6, -1.6], down), [-0.8, 0.6, -0.2], 1.4, true);
  spear(skin.ray([1.1, 6, -1.3], down), [0.7, 0.7, -0.3], 1.1, false);

  // ---------- axe in left shoulder ----------
  {
    const h = skin.ray([1.0, 6, 1.5], down);
    if (h) {
      const d = V([0.55, 0.83, 0]).normalize();
      const base = h.at.clone();
      b.rod(base.clone().addScaledVector(d, -0.4), base.clone().addScaledVector(d, 1.75), 0.06, {
        color: P.ironDark,
        bone: J.chest,
      });
      for (const t of [0.5, 0.9])
        b.rod(base.clone().addScaledVector(d, t), base.clone().addScaledVector(d, t + 0.1), 0.075, {
          color: P.leather,
          bone: J.chest,
        });
      const c = base.clone().addScaledVector(d, 1.5);
      b.extrude(
        [
          [-0.5, -0.3], [-0.12, -0.08], [0.12, -0.08], [0.5, -0.3], [0.4, 0],
          [0.5, 0.3], [0.12, 0.08], [-0.12, 0.08], [-0.5, 0.3], [-0.4, 0],
        ],
        { at: c, x: [0, 0, 1], y: d.toArray(), thickness: 0.07, color: P.iron, bone: J.chest },
      );
      b.part(new THREE.SphereGeometry(0.1, 6, 4), P.ironDark, { bone: J.chest, at: c });
      b.stick(new THREE.CylinderGeometry(0.28, 0.3, 0.05, 7), P.blood, h, { embed: 0.4, flat: true });
    }
  }

  // ---------- shield shard on right flank ----------
  {
    const h = skin.ray([-5, 2.8, -1.7], [1, 0, 0]);
    if (h) {
      const shard = b.extrude(
        [
          [-0.5, -0.3], [0, -0.45], [0.45, -0.25], [0.55, 0.1],
          [0.2, 0.4], [-0.1, 0.25], [-0.3, 0.45], [-0.55, 0.15],
        ],
        { at: [h.at.x - 0.02, h.at.y, h.at.z], x: [0, 0, 1], thickness: 0.07, color: P.bronze, bone: J.hips },
      );
      b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.05, 7), P.bronzeDark, {
        bone: J.hips,
        at: shard.local([0, 0, 0.05]),
        dir: [-1, 0, 0],
      });
      for (const [u, v] of [[-0.38, -0.12], [0.3, -0.12], [0.35, 0.08], [-0.15, 0.2], [0.0, -0.32]])
        b.part(new THREE.SphereGeometry(0.035, 5, 4), P.iron, { bone: J.hips, at: shard.local([u, v, 0.04]) });
    }
  }

  // ---------- chains around the chest ----------
  const linkA = new THREE.TorusGeometry(0.1, 0.03, 4, 8);
  const linkB = linkA.clone().rotateY(Math.PI / 2);
  const wrap = (fr: any, bone: any) => {
    const loop = skin.loop(fr, { lift: 0.05 }).slice(0, 0.92);
    b.sweep(loop, 0.035, { color: P.ironDark, bone });
    let i = 0;
    b.along(loop, 12, (at: any) => {
      b.part(i++ % 2 ? linkB : linkA, P.chain, { frame: at, scale: [1, 1.5, 1], bone });
    });
  };
  wrap(frame([0, 2.7, 1.0], [0, 0.25, 1]), J.chest);
  wrap(frame([0, 2.6, 0.2], [0.15, 0, 1]), J.spine);

  // trailing links over the left shoulder
  {
    const pts = [[0.3, 1.0], [0.9, 1.1], [1.35, 1.2]]
      .map(([x, z]) => skin.ray([x, 6, z], down))
      .filter(Boolean)
      .map((h) => h!.moved([0, 0.07, 0]).at.toArray());
    if (pts.length > 2) {
      const path = catmull(pts);
      b.sweep(path, 0.035, { color: P.ironDark, bone: J.chest });
      let i = 0;
      b.along(path, 4, (at: any) => {
        b.part(i++ % 2 ? linkB : linkA, P.chain, { frame: at, scale: [1, 1.5, 1], bone: J.chest });
      });
      const e = pts[pts.length - 1];
      b.part(linkA, P.chain, { bone: J.chest, at: [e[0] + 0.05, e[1] + 0.05, e[2] + 0.18], scale: [1, 1.5, 1] });
    }
  }

  // ---------- neck-root collars ----------
  const collars: [number[], number[], number][] = [
    [M.neckBaseA, [0, 0.8, 0.5], 0.45],
    [M.neckBaseB, [0.4, 0.8, 0.4], 0.4],
    [M.neckBaseC, [-0.4, 0.8, 0.4], 0.4],
    [M.neckBaseD, [0.8, 0.6, 0.3], 0.35],
    [M.neckBaseE, [-0.8, 0.6, 0.3], 0.35],
  ];
  collars.forEach(([base, dd, r], k) => {
    const d = V(dd).normalize();
    const o = V(base).addScaledVector(d, 3);
    const h = skin.ray(o, d.clone().negate());
    if (!h) return;
    const c = h.at.clone().addScaledVector(d, -0.05);
    const line = frame(c, d.toArray());
    const ring = b.ring(line, { count: 10, radius: r * 0.95 });
    b.sweep(catmull(ring.items, { closed: true }), 0.12, { color: P.hideMid, bone: J.chest, sides: 6 });
    b.ring(line, { count: 6, radius: r + 0.08, tilt: 35 }, (it: any) => {
      b.spike(it, it, 0.3, 0.1, { color: k % 2 ? P.hideLight : P.hideDark, bone: J.chest, sides: 4 });
    });
    const arc = b.ring(line, { count: 5, radius: r + 0.1, fromDeg: 20, toDeg: 150 });
    b.sweep(catmull(arc.items), 0.035, { color: P.scarFlesh, bone: J.chest, sides: 4 });
  });
}
    return buildTorso;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const D = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();

  const legRadius = (t: number, front: boolean) => {
    const keys = front ? [0.52, 0.46, 0.34, 0.26, 0.22, 0.2] : [0.55, 0.5, 0.36, 0.26, 0.22, 0.2];
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
  };

  const makeLeg = (kind: "F" | "H", side: "L" | "R") => {
    const front = kind === "F";
    const hip = J["hip" + kind + side];
    const knee = J["knee" + kind + side];
    const ankle = J["ankle" + kind + side];
    const toe = J["toe" + kind + side];
    const sx = side === "L" ? 1 : -1;
    const foot = V(M["foot" + kind + side]);

    const path = [V(hip.at.toArray()), V(knee.at.toArray()), V(ankle.at.toArray()), V(toe.at.toArray())];
    path[3].y = Math.max(path[3].y, 0.2);
    const sw = b.sweep(path, (t: number) => legRadius(t, front), {
      bone: [hip, knee, ankle, toe],
      color: P.hideMid,
      sectors: [[110, 250, P.hideDark]],
      sides: 8,
      caps: "round",
    });

    // knee / elbow spur
    const kd = front ? D(sx * 0.5, 0.25, -1) : D(sx * 0.5, 0.3, 1);
    b.spike(knee.at, kd, 0.55, 0.14, { color: P.boneDark, bone: knee });
    const kd2 = front ? D(sx * 0.9, 0.5, -0.5) : D(sx * 0.9, 0.6, 0.5);
    b.spike(knee.at, kd2, 0.32, 0.08, { color: P.bone, bone: knee });

    // shin scale plates
    for (let i = 0; i < 5; i++) {
      const t = 0.48 + i * 0.09;
      const h = sw.at(t, 0);
      b.stick(new THREE.BoxGeometry(0.3 - i * 0.015, 0.06, 0.2), P.hideDark, h, { embed: 0.3 });
      b.stick(new THREE.BoxGeometry(0.24 - i * 0.015, 0.06, 0.15), P.hideLight, h, { embed: 0.1 });
    }
    // thigh scale patches
    for (const [t, a] of [[0.12, 40], [0.2, -40], [0.28, 70]] as number[][]) {
      const h = sw.at(t, sx * a);
      b.stick(new THREE.BoxGeometry(0.22, 0.05, 0.18), P.hideLight, h, { embed: 0.3 });
    }

    // rune band on thigh
    const rp = sw.at(0.17);
    const band = b.part(new THREE.TorusGeometry(rp.radius + 0.02, 0.025, 4, 12), P.runeGlow, {
      bone: hip, at: rp.at, dir: rp.tangent, axis: "z",
    });
    glow(band, 1.4);
    for (let i = 0; i < 3; i++) {
      const g = sw.at(0.17, 70 + i * 25 * sx);
      glow(b.stick(new THREE.BoxGeometry(0.05, 0.03, 0.14), P.runeGlow, g, { embed: 0.2, spin: i * 35 }), 1.5);
    }

    // scars
    const sc = sw.at(0.32, sx * 80);
    b.stick(new THREE.BoxGeometry(0.05, 0.02, 0.4), P.blood, sc, { embed: 0.3, spin: 35 });
    b.stick(new THREE.BoxGeometry(0.025, 0.03, 0.38), P.scarFlesh, sc, { embed: 0.3, spin: 35 });
    const sc2 = sw.at(0.4, sx * 100);
    b.stick(new THREE.BoxGeometry(0.04, 0.02, 0.3), P.scarFlesh, sc2, { embed: 0.3, spin: -30 });

    // mud
    for (const [t, a] of [[0.78, 120], [0.88, -110], [0.95, 160]] as number[][]) {
      b.stick(new THREE.SphereGeometry(0.16, 6, 4), P.hideDark, sw.at(t, a), { embed: 0.55, scale: [1, 0.5, 1.2] });
    }

    // shackle
    const ap = sw.at(0.66);
    const ar = ap.radius + 0.03;
    b.part(new THREE.TorusGeometry(ar, 0.06, 5, 12), P.iron, { bone: ankle, at: ap.at, dir: ap.tangent, axis: "z" });
    for (let i = 0; i < 4; i++) {
      const g = sw.at(0.66, i * 90 + 20);
      b.stick(new THREE.SphereGeometry(0.045, 5, 4), P.ironDark, g, { embed: -0.2 });
    }
    const lug = sw.at(0.66, sx * 90);
    b.stick(new THREE.BoxGeometry(0.1, 0.1, 0.08), P.iron, lug, { embed: -0.3 });
    // chain stub
    let cy = lug.at.y - 0.1;
    for (let i = 0; i < 4; i++) {
      const link = new THREE.TorusGeometry(0.05, 0.015, 4, 8);
      b.part(link, i % 2 ? P.chain : P.ironDark, {
        bone: ankle,
        at: [lug.at.x + sx * (0.08 + i * 0.01), cy, lug.at.z],
        rotation: [0, i % 2 ? 0 : 90, 0],
      });
      cy -= 0.07;
    }

    // foot
    b.part(new THREE.SphereGeometry(0.36, 8, 6), P.hideDark, {
      bone: toe, at: [foot.x, 0.12, foot.z + 0.12], scale: [1.05, 0.4, 1.3],
    });
    const n = front ? 4 : 3;
    const base = new THREE.Vector3(toe.at.x, 0.17, toe.at.z - 0.2);
    for (let i = 0; i < n; i++) {
      const a = ((i - (n - 1) / 2) * (front ? 26 : 32) + sx * 4) * (Math.PI / 180);
      const L = (front ? 0.55 : 0.5) * (1 - Math.abs(i - (n - 1) / 2) * 0.08);
      const dir = D(Math.sin(a), 0, Math.cos(a));
      const tip = base.clone().addScaledVector(dir, L);
      tip.y = 0.14;
      b.rod(base, tip, [0.14, 0.11], P.hideMid, { bone: toe, sides: 6 });
      b.stick(new THREE.SphereGeometry(0.1, 5, 4), P.hideDark, { at: tip, axis: dir, n: dir } as any, { embed: 0.5 } as any);
    }
    // claws built separately (explicit positions)
    for (let i = 0; i < n; i++) {
      const a = ((i - (n - 1) / 2) * (front ? 26 : 32) + sx * 4) * (Math.PI / 180);
      const L = (front ? 0.55 : 0.5) * (1 - Math.abs(i - (n - 1) / 2) * 0.08);
      const d = D(Math.sin(a), 0, Math.cos(a));
      const tip = base.clone().addScaledVector(d, L);
      tip.y = 0.14;
      const cd = D(d.x, -0.3, d.z);
      b.spike(tip, cd, 0.3, 0.085, { color: P.boneDark, bone: toe, sides: 6 });
      const t2 = tip.clone().addScaledVector(cd, 0.22);
      b.spike(t2, D(d.x, -0.4, d.z), 0.2, 0.05, { color: P.claw, bone: toe, sides: 6 });
      // toe pad
      b.part(new THREE.SphereGeometry(0.09, 5, 4), P.hideDark, {
        bone: toe, at: [tip.x - d.x * 0.1, 0.05, tip.z - d.z * 0.1], scale: [1, 0.4, 1.2],
      });
    }
    if (!front) {
      const bp = new THREE.Vector3(toe.at.x + sx * 0.25, 0.5, toe.at.z - 0.55);
      b.spike(bp, D(sx * 0.6, -0.2, -1), 0.4, 0.08, { color: P.boneDark, bone: ankle, sides: 6 });
      b.spike(bp.clone().add(D(sx * 0.6, -0.2, -1).multiplyScalar(0.3)), D(sx * 0.6, -0.5, -1), 0.2, 0.045, {
        color: P.claw, bone: ankle, sides: 6,
      });
    }
    // hock spike / extra bone ridge on hind
    if (!front) b.spike(ankle.at, D(sx * 0.2, 0.2, -1), 0.4, 0.1, { color: P.bone, bone: ankle, sides: 6 });
    void R;
  };

  for (const k of ["F", "H"] as const) for (const s of ["L", "R"] as const) makeLeg(k, s);
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: any) {
  const r = rng(11);
  const joints = [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5, J.tail6];
  const pts: number[][] = [
    [0, 2.4, -2.1],
    [0, 2.3, -2.6],
    [0, 2.2, -3.0],
    [0, 1.7, -3.8],
    [0, 1.1, -4.4],
    [0, 0.6, -4.8],
    [0, 0.4, -5.1],
  ];
  const path = catmull(pts);
  const radius = (t: number) => 0.6 * (1 - t) + 0.12 * t;
  const tube = b.sweep(path, radius, {
    bone: joints,
    color: P.hideMid,
    sides: 8,
    caps: "round",
    sectors: [
      [-60, 60, P.hideDark],
      [135, 225, P.belly],
    ],
  });

  // dorsal plates, shrinking, root->tip colour
  const N = 12;
  for (let i = 0; i < N; i++) {
    const t = 0.04 + (i / (N - 1)) * 0.88;
    const at = tube.at(t, 0);
    const s = 1 - t * 0.75;
    const col = i < 4 ? P.hideDark : i < 8 ? P.boneDark : P.bone;
    b.stick(new THREE.ConeGeometry(0.17 * s, 0.4 * s, 4), col, at, { embed: 0.25 });
  }

  // side ridges of scale plates
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const t = 0.08 + i * 0.1;
      const at = tube.at(t, s * 85);
      const k = 1 - t * 0.6;
      b.stick(new THREE.BoxGeometry(0.2 * k, 0.05, 0.16 * k), i % 2 ? P.hideLight : P.hideMid, at, { embed: 0.3 });
    }
  }

  // scar ring cuts
  for (const t of [0.3, 0.52, 0.72]) {
    const loop = b.surface(tube).loop(tube.at(t), { lift: 0.01 });
    b.sweep(loop, 0.018, { color: P.scarFlesh });
    const loop2 = b.surface(tube).loop(tube.at(t + 0.015), { lift: 0.008 });
    b.sweep(loop2, 0.01, { color: P.blood });
  }

  // ember cracks between plates
  for (const [t, a] of [[0.2, 60], [0.38, -70], [0.55, 75], [0.66, -65], [0.8, 70]] as number[][]) {
    const at = tube.at(t, a);
    glow(b.stick(new THREE.BoxGeometry(0.03, 0.2, 0.05), P.ember, at, { embed: 0.3, spin: r() * 60 }), 1.4);
  }

  // iron shackle band near base
  const bt = 0.17;
  const band = b.surface(tube).loop(tube.at(bt), { lift: 0.03 });
  b.sweep(band, 0.045, { color: P.iron });
  const bandIn = b.surface(tube).loop(tube.at(bt + 0.03), { lift: 0.02 });
  b.sweep(bandIn, 0.025, { color: P.ironDark });
  b.along(band, 6, (at: any) => b.stick(new THREE.SphereGeometry(0.04, 6, 4), P.ironDark, at, { embed: 0.2 }));
  // snapped chain hanging from the band's underside
  const ring = tube.at(bt, 180);
  const base = ring.at.clone();
  for (let i = 0; i < 5; i++) {
    const lk = new THREE.TorusGeometry(0.06, 0.02, 5, 8);
    b.part(lk, i % 2 ? P.ironDark : P.chain, {
      bone: J.tail2,
      at: [base.x + (i % 2 ? 0.02 : -0.02), base.y - 0.12 - i * 0.1, base.z - 0.02],
      rotation: [0, i % 2 ? 90 : 0, 0],
    });
  }

  // bone spade blade at tip
  const tip = pts[6];
  const outline: any[] = [
    [0, 0],
    [0.3, 0.1],
    [0.42, 0.45, "sharp"],
    [0.3, 0.9],
    [0.12, 1.2, "sharp"],
    [0, 1.4, "sharp"],
    [-0.12, 1.2, "sharp"],
    [-0.3, 0.9],
    [-0.42, 0.45, "sharp"],
    [-0.3, 0.1],
  ];
  const sc = 0.8;
  const scaled = outline.map((p) => (p.length === 3 ? [p[0] * sc, p[1] * sc, "sharp"] : [p[0] * sc, p[1] * sc]));
  b.extrude(scaled, {
    at: [tip[0], tip[1] - 0.02, tip[2] - 0.1],
    x: [1, 0, 0],
    y: [0, 0.12, -1],
    thickness: 0.07,
    bevel: 0.015,
    color: P.bone,
    bone: J.tail6,
  });
  const bl = new THREE.Vector3(tip[0], tip[1] - 0.02, tip[2] - 0.1);
  const dir = new THREE.Vector3(0, 0.12, -1).normalize();
  // central ridge
  b.rod(bl.clone().addScaledVector(dir, 0.1).add(new THREE.Vector3(0, 0.05, 0)), bl.clone().addScaledVector(dir, 1.0).add(new THREE.Vector3(0, 0.05, 0)), 0.035, P.boneDark, { bone: J.tail6 });
  // notched edge teeth
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const p = bl.clone().addScaledVector(dir, 0.3 + i * 0.22);
      p.x += s * (0.33 - Math.abs(i - 1.2) * 0.07);
      b.part(new THREE.ConeGeometry(0.05, 0.12, 4), P.boneDark, { bone: J.tail6, at: p, dir: [s, 0, 0] });
    }
  // rune glyph
  const g = bl.clone().addScaledVector(dir, 0.65);
  g.y += 0.06;
  for (const [dx, dz, len, rot] of [[0, 0, 0.32, 0], [0.06, -0.05, 0.16, 40], [-0.06, 0.05, 0.16, -40]] as number[][]) {
    glow(
      b.part(new THREE.BoxGeometry(0.035, 0.02, len), P.runeGlow, {
        bone: J.tail6,
        at: [g.x + dx, g.y, g.z + dz],
        rotation: [0, rot, 0],
      }),
      1.5,
    );
  }
  // side barbs
  for (const s of [1, -1]) {
    const p = bl.clone().addScaledVector(dir, 0.35);
    p.x += s * 0.2;
    b.spike([p.x, p.y, p.z], [s * 0.7, 0.1, -0.5], 0.45, 0.07, { color: P.bone, bone: J.tail6 });
  }
}
    return buildTail;
  })(),
  // necks
  (() => {
function buildNecks({ b, J, P, M }: Ctx) {
  const pt = (v: any): number[] => (Array.isArray(v) ? v : v.toArray());
  const R = rng(11);

  const necks = [
    { L: "A", s: 0, r: [0.4, 0.28] },
    { L: "B", s: 1, r: [0.36, 0.26] },
    { L: "C", s: -1, r: [0.36, 0.26] },
    { L: "D", s: 1, r: [0.32, 0.24] },
    { L: "E", s: -1, r: [0.32, 0.24] },
  ];

  for (const n of necks) {
    const { L, s } = n;
    const [r0, r1] = n.r;
    const rad = (t: number) => r0 + (r1 - r0) * t;
    const joints = [J["neck" + L + "1"], J["neck" + L + "2"], J["neck" + L + "3"]];
    const boneAt = (t: number) => joints[t < 0.33 ? 0 : t < 0.66 ? 1 : 2];
    const path = catmull([
      pt(M["neckBase" + L]),
      pt(joints[1].at),
      pt(joints[2].at),
      pt(M["head" + L]),
    ]);
    const tube = b.sweep(path, [r0, r1], {
      bone: joints,
      color: (t: number) => (t < 0.45 ? P.hideDark : P.hideMid),
      sectors: [[125, 235, P.belly]],
      sides: 10,
    });
    const curve = path;
    const side = s > 0 ? -90 : 90; // outward side angle
    const outer = s === 0 ? 90 : side;

    // dorsal plates: hideDark base with boneDark tips
    b.along(tube, 4, (at: any) => {
      const t = at.t ?? 0.5;
      b.stick(new THREE.ConeGeometry(0.1, 0.24, 5), P.hideDark, at, { embed: 0.25 });
      b.stick(new THREE.ConeGeometry(0.04, 0.12, 5), P.boneDark, at.moved([0, 0.16, 0]), { embed: 0 });
    });

    // throat ladder bands
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const h = tube.at(t, 180);
      b.stick(new THREE.BoxGeometry(rad(t) * 1.5, 0.05, 0.1), P.boneDark, h, { embed: 0.5 });
    }

    // ring of hideLight scale plates
    {
      const t = 0.5;
      const c = curve.at(t);
      const tan = curve.tangentAt(t);
      b.ring(frame(c, tan), { count: 5, radius: rad(t) }, (item: any) =>
        b.stick(new THREE.BoxGeometry(0.2, 0.09, 0.12), P.hideLight, item, { embed: 0.5, bone: boneAt(t) }),
      );
    }

    // side frills
    for (const sg of [1, -1])
      for (const t of [0.35, 0.65]) {
        if (t === 0.65 && sg === 1 && false) continue;
        const h = tube.at(t, sg * 90);
        b.stick(new THREE.ConeGeometry(0.09, 0.28, 4), P.hideLight, h, { embed: 0.15, scale: [1, 1, 0.4] });
      }
    // small bone spikes
    for (const t of [0.25, 0.75]) {
      b.stick(new THREE.ConeGeometry(0.035, 0.16, 5), P.bone, tube.at(t, 45 * (R() > 0.5 ? 1 : -1) + 0), { embed: 0.2 });
    }

    const band = (t: number, col: string, w = 0.04, off = 0.02) => {
      const c = curve.at(t);
      const tan = curve.tangentAt(t);
      b.part(new THREE.TorusGeometry(rad(t) + off, w, 6, 14), col, { at: c, dir: tan, axis: "z", bone: boneAt(t) });
    };

    if (L === "A") {
      for (const t of [0.3, 0.62]) {
        band(t, P.iron, 0.045);
        const c = curve.at(t);
        const tan = curve.tangentAt(t);
        b.ring(frame(c, tan), { count: 4, radius: rad(t) + 0.05, fromDeg: 120, toDeg: 240 }, (item: any) =>
          b.stick(new THREE.SphereGeometry(0.03, 5, 4), P.ironDark, item, { embed: 0.2, bone: boneAt(t) }),
        );
      }
      const p = tube.at(0.3, 180).at;
      for (let i = 0; i < 4; i++)
        b.part(new THREE.TorusGeometry(0.05, 0.013, 5, 8), P.chain, {
          at: [p.x + (i === 3 ? 0.05 : 0), p.y - 0.1 - 0.09 * i, p.z],
          rotation: [0, (i % 2) * 90, i === 3 ? 30 : 0],
          bone: joints[0],
        });
    }

    if (L === "B") {
      for (const [t, sp] of [[0.3, 35], [0.55, 30], [0.75, 40]] as const) {
        const h = tube.at(t, outer);
        b.stick(new THREE.BoxGeometry(0.035, 0.02, 0.34), P.scarFlesh, h, { spin: sp, embed: 0.4 });
        b.stick(new THREE.BoxGeometry(0.012, 0.015, 0.36), P.blood, h.moved([0.03, 0, 0]), { spin: sp, embed: 0.3 });
        for (let k = -2; k <= 2; k++)
          b.stick(new THREE.BoxGeometry(0.1, 0.012, 0.012), P.leather, h.moved([0, 0, k * 0.06]), { spin: sp, embed: 0.3 });
      }
    }

    if (L === "C") {
      const t = 0.5;
      const h = tube.at(t, outer);
      const tan = h.tangent;
      const dir = h.n.clone().addScaledVector(tan, 0.6).normalize();
      const at = (d: number) => h.at.clone().addScaledVector(dir, d);
      b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 6), P.bronzeDark, { at: at(0.15), dir: dir.toArray(), bone: joints[1] });
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.bronze, { at: at(0.1), dir: dir.toArray(), bone: joints[1] });
      b.part(new THREE.ConeGeometry(0.03, 0.1, 4), P.hornTip, { at: at(0.4), dir: dir.toArray(), bone: joints[1] });
      b.stick(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 8), P.scarFlesh, h, { embed: 0.4 });
      b.stick(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 7), P.blood, h, { embed: 0.2 });
      for (const [t2, a] of [[0.55, 10], [0.62, -10]] as const)
        b.stick(new THREE.BoxGeometry(0.03, 0.015, 0.22), P.blood, tube.at(t2, outer + a), { embed: 0.4 });
    }

    if (L === "D") {
      const h = tube.at(0.5, outer);
      b.stick(new THREE.BoxGeometry(0.3, 0.05, 0.28), P.bronze, h, { embed: 0.2 });
      b.stick(new THREE.BoxGeometry(0.22, 0.02, 0.2), P.bronzeDark, h.moved([0, 0.03, 0]), { embed: 0 });
      for (const t of [0.42, 0.58]) band(t, P.leather, 0.025, 0.035);
      for (const [x, z] of [[-0.1, -0.09], [0.1, 0.09]])
        b.stick(new THREE.SphereGeometry(0.02, 5, 4), P.ironDark, h.moved([x, 0.05, z]), { embed: 0 });
    }

    if (L === "E") {
      const cr = [[0.25, 110], [0.45, 80], [0.65, 120], [0.8, 95]] as const;
      cr.forEach(([t, a], i) => {
        const h = tube.at(t, s * a * -1 + (s < 0 ? 0 : 0));
        glow(b.stick(new THREE.BoxGeometry(0.025, 0.015, 0.2), P.ember, h, { spin: i % 2 ? 30 : -25, embed: 0.4 }), 1.4);
        glow(b.stick(new THREE.BoxGeometry(0.02, 0.015, 0.12), P.ember, h.moved([0.04, 0, 0.08]), { spin: i % 2 ? -40 : 45, embed: 0.4 }), 1.4);
      });
      const h = tube.at(0.45, outer);
      glow(b.stick(new THREE.BoxGeometry(0.025, 0.02, 0.22), P.runeGlow, h, { embed: 0.4 }), 1.3);
      glow(b.stick(new THREE.BoxGeometry(0.02, 0.02, 0.14), P.runeGlow, h.moved([0.04, 0, 0.04]), { spin: 40, embed: 0.4 }), 1.3);
      glow(b.stick(new THREE.BoxGeometry(0.02, 0.02, 0.14), P.runeGlow, h.moved([-0.04, 0, -0.04]), { spin: -40, embed: 0.4 }), 1.3);
    }
  }
}
    return buildNecks;
  })(),
  // heads
  (() => {
function buildHeads({ b, J, P }: any) {
  const V = THREE.Vector3;
  const JJ = J as any;
  const PP = P as any;

  function makeHead(key: string, sc: number) {
    const hj = JJ["head" + key];
    const jj = JJ["jaw" + key];
    const o = new V().copy(hj.at);
    const f = new V().copy(hj.axis).normalize();
    const left = new V(0, 1, 0).cross(f).normalize();
    const up = f.clone().cross(left).normalize();
    const Q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(left, up, f));
    const Pt = (l: number, u: number, w: number) =>
      o.clone().addScaledVector(left, l * sc).addScaledVector(up, u * sc).addScaledVector(f, w * sc);
    const D = (l: number, u: number, w: number) =>
      left.clone().multiplyScalar(l).addScaledVector(up, u).addScaledVector(f, w).normalize();
    const qrot = (rot?: number[]) =>
      rot ? Q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]))) : Q;
    const box = (w: number, h: number, d: number, col: string, l: number, u: number, fw: number, bone: any, rot?: number[]) =>
      b.part(new THREE.BoxGeometry(w * sc, h * sc, d * sc), col, { bone, at: Pt(l, u, fw), quat: qrot(rot) });
    const sph = (rx: number, ry: number, rz: number, col: string, l: number, u: number, fw: number, bone: any) =>
      b.part(new THREE.SphereGeometry(1, 8, 6), col, {
        bone, at: Pt(l, u, fw), quat: Q, scale: [rx * sc, ry * sc, rz * sc], flat: true,
      });
    const spike = (base: any, dir: any, len: number, r: number, col: string, bone: any, extra: any = {}) =>
      b.spike(base, dir, len * sc, r * sc, { color: col, bone, sides: 4, ...extra });

    // ---- skull, snout, jaw
    box(0.7, 0.4, 0.7, PP.hideMid, 0, 0.05, 0.3, hj);
    box(0.64, 0.08, 0.66, PP.hideDark, 0, 0.23, 0.3, hj);
    b.frustumBox(Pt(0, 0.06, 0.55), Pt(0, 0.04, 1.35), [0.5 * sc, 0.26 * sc], [0.3 * sc, 0.2 * sc], {
      color: PP.hideMid, bone: hj,
    });
    for (const fw of [0.78, 1.05]) {
      const t = (fw - 0.55) / 0.8;
      box(0.22 - 0.07 * t, 0.03, 0.14, PP.hideLight, 0, 0.175 - 0.03 * t, fw, hj);
    }
    for (const s of [1, -1]) box(0.05, 0.035, 0.02, PP.claw, s * 0.07, 0.07, 1.36, hj);

    b.frustumBox(Pt(0, -0.165, 0.5), Pt(0, -0.12, 1.28), [0.44 * sc, 0.13 * sc], [0.26 * sc, 0.1 * sc], {
      color: PP.hideMid, bone: jj,
    });
    for (const [fw, u] of [[0.7, -0.222], [1.05, -0.185]] as number[][]) box(0.26, 0.03, 0.2, PP.belly, 0, u + 0.005, fw, jj);
    box(0.14, 0.03, 0.5, PP.tongue, 0, -0.09, 0.85, jj);
    for (const s of [1, -1])
      glow(box(0.012, 0.014, 0.7, PP.ember, s * 0.18, -0.078, 0.95, hj), 1.6);

    // ---- teeth
    const hwU = (fw: number) => 0.25 - ((fw - 0.55) / 0.8) * 0.1;
    const hwL = (fw: number) => 0.22 - ((fw - 0.5) / 0.78) * 0.09;
    for (const s of [1, -1]) {
      for (const fw of [0.8, 1.0, 1.2]) {
        const t = (fw - 0.55) / 0.8;
        spike(Pt(s * (hwU(fw) - 0.025), -0.06 + 0.01 * t, fw), D(0, -1, 0), 0.1, 0.028, PP.bone, hj);
      }
      const t = (1.1 - 0.55) / 0.8;
      spike(Pt(s * (hwU(1.1) - 0.02), -0.06 + 0.01 * t, 1.1), D(s * 0.05, -1, 0.1), 0.22, 0.042, PP.bone, hj);
      for (const fw of [0.85, 1.12]) {
        const tl = (fw - 0.5) / 0.78;
        spike(Pt(s * (hwL(fw) - 0.03), -0.11 + 0.03 * tl, fw), D(0, 1, 0), 0.08, 0.024, PP.bone, jj);
      }
    }

    // ---- eyes and brows
    const blind = key === "C";
    for (const s of [1, -1]) {
      const milky = blind && s === 1;
      const eye = sph(0.06, 0.09, 0.1, milky ? PP.frost : PP.eyeAmber, s * 0.32, 0.1, 0.38, hj);
      if (!milky) {
        glow(eye, 1.3);
        box(0.01, 0.11, 0.025, PP.eyeSlit, s * 0.376, 0.1, 0.4, hj);
      } else {
        box(0.014, 0.22, 0.03, PP.scarFlesh, s * 0.384, 0.1, 0.38, hj, [0.8, 0, 0]);
        box(0.012, 0.22, 0.012, PP.blood, s * 0.385, 0.1, 0.42, hj, [0.8, 0, 0]);
      }
      box(0.3, 0.07, 0.3, PP.hideDark, s * 0.26, 0.21, 0.4, hj, [0, 0, s * 0.3]);
    }

    // ---- horns
    const horn = (pts: number[][], s: number, r0: number, r1: number, broken = false) => {
      const path = catmull(pts.map((p) => Pt(s * p[0], p[1], p[2])));
      b.sweep(path, [r0 * sc, r1 * sc], {
        bone: hj, color: PP.horn, sides: 6,
        bands: broken ? undefined : [[0.65, PP.horn], [1, PP.hornTip]],
        caps: broken ? "flat" : "point",
      });
      const rr = (r0 + (r1 - r0) * 0.35) * 1.25 * sc;
      b.part(new THREE.CylinderGeometry(rr, rr, 0.035 * sc, 8), PP.boneDark, {
        bone: hj, at: path.at(0.35), dir: path.tangentAt(0.35),
      });
      if (broken) {
        const e = pts[pts.length - 1];
        box(0.08, 0.03, 0.06, PP.hornTip, s * e[0], e[1] + 0.01, e[2] - 0.01, hj, [0.4, 0, s * 0.3]);
      }
    };
    const mainHorn = [[0.22, 0.2, 0.1], [0.34, 0.38, -0.05], [0.46, 0.5, -0.3], [0.5, 0.68, -0.62]];
    const stump = [[0.22, 0.2, 0.1], [0.3, 0.32, 0.0], [0.37, 0.4, -0.12]];
    for (const s of [1, -1]) {
      if (key === "B" && s === 1) horn(stump, s, 0.075, 0.055, true);
      else horn(mainHorn, s, 0.075, 0.01);
      if (key === "A") horn([[0.12, 0.25, 0.05], [0.16, 0.5, -0.1], [0.2, 0.78, -0.3], [0.18, 1.0, -0.6]], s, 0.06, 0.01);
      spike(Pt(s * 0.36, -0.02, 0.08), D(s, 0.2, -0.8), 0.3, 0.06, PP.horn, hj, {
        bands: [[0.6, PP.horn], [1, PP.hornTip]],
      });
      for (let i = 0; i < 2; i++)
        spike(Pt(s * 0.34, -0.08, 0.35 + 0.17 * i), D(s, -0.1, -0.7), 0.22, 0.045, PP.bone, hj);
    }
    for (const fw of [0.1, 0.3]) spike(Pt(0, 0.27, fw), D(0, 1, -0.5), 0.15, 0.06, PP.boneDark, hj);

    // ---- individual traits
    if (key === "A") {
      box(0.74, 0.05, 0.07, PP.bronze, 0, 0.25, 0.12, hj);
      for (const s of [1, -1]) {
        box(0.03, 0.34, 0.07, PP.bronze, s * 0.36, 0.08, 0.12, hj);
        sph(0.02, 0.02, 0.02, PP.bronzeDark, s * 0.2, 0.28, 0.12, hj);
      }
      box(0.16, 0.14, 0.02, PP.bronze, 0, 0.3, 0.15, hj, [-0.5, 0, 0]);
      glow(box(0.03, 0.012, 0.22, PP.runeGlow, 0, 0.275, 0.52, hj), 1.4);
      glow(box(0.13, 0.012, 0.025, PP.runeGlow, 0, 0.275, 0.46, hj), 1.4);
      for (const s of [1, -1]) glow(box(0.03, 0.012, 0.13, PP.runeGlow, s * 0.05, 0.275, 0.62, hj, [0, s * 0.7, 0]), 1.4);
    }
    if (key === "B") {
      for (let i = 0; i < 3; i++) {
        box(0.012, 0.17, 0.022, PP.scarFlesh, 0.357, -0.02, 0.38 + 0.08 * i, hj, [0.6, 0, 0]);
        box(0.01, 0.17, 0.008, PP.blood, 0.358, -0.02, 0.405 + 0.08 * i, hj, [0.6, 0, 0]);
      }
    }
    if (key === "D") {
      const t = 0.56;
      const hw = 0.194 + 0.012, hh = 0.113 + 0.012, cu = 0.05, fw = 1.0;
      box(hw * 2, 0.03, 0.12, PP.iron, 0, cu + hh, fw, hj);
      box(hw * 2, 0.03, 0.12, PP.iron, 0, cu - hh, fw, hj);
      for (const s of [1, -1]) {
        box(0.03, hh * 2, 0.12, PP.iron, s * hw, cu, fw, hj);
        sph(0.018, 0.018, 0.018, PP.ironDark, s * 0.08, cu + hh + 0.02, fw + 0.04, hj);
      }
      void t;
      for (let i = 0; i < 4; i++)
        box(i % 2 ? 0.015 : 0.04, 0.07, i % 2 ? 0.04 : 0.015, PP.chain, 0.21, cu - hh - 0.02 - 0.06 * i, fw, hj);
    }
    if (key === "E") {
      for (const s of [1, -1]) {
        for (let i = 0; i < 3; i++)
          spike(Pt(s * 0.3, 0.26, 0.2 + 0.13 * i), D(s * 0.3, 1, -0.4), 0.2, 0.04, PP.bone, hj);
        glow(box(0.16, 0.012, 0.022, PP.ember, s * 0.27, 0.252, 0.4, hj, [0, s * 0.3, s * 0.3]), 1.6);
        glow(box(0.1, 0.012, 0.022, PP.runeGlow, s * 0.12, 0.275, 0.5, hj, [0, -s * 0.6, 0]), 1.4);
      }
    }
  }

  makeHead("A", 1.15);
  makeHead("B", 1.0);
  makeHead("C", 1.0);
  makeHead("D", 0.9);
  makeHead("E", 0.9);
}
    return buildHeads;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "godOfWarHydra" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,2.4,-1.2], dir: [0,0,1], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,2.6,0.1], dir: [0,0.1,1], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,2.8,1.3], dir: [0,0.15,1], role: "spine" });
  J["tail1"] = b.joint("tail1", { parent: J["hips"], at: [0,2.4,-2.2], dir: [0,-0.1,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,2.2,-3], dir: [0,-0.35,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.7,-3.8], dir: [0,-0.6,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,1.1,-4.4], dir: [0,-0.6,-1], role: "tail", group: "tail" });
  J["tail5"] = b.joint("tail5", { parent: J["tail4"], at: [0,0.6,-4.8], dir: [0,-0.4,-1], role: "tail", group: "tail" });
  J["tail6"] = b.joint("tail6", { parent: J["tail5"], at: [0,0.4,-5.1], dir: [0,-0.1,-1], role: "tail", group: "tail" });
  J["hipFL"] = b.joint("hipFL", { parent: J["chest"], at: [1.3,2.5,1.3], dir: [0.3,-1,-0.4], role: "leg", group: "legs" });
  J["kneeFL"] = b.joint("kneeFL", { parent: J["hipFL"], at: [1.9,1.4,0.9], dir: [-0.1,-0.7,0.7], role: "leg", group: "legs" });
  J["ankleFL"] = b.joint("ankleFL", { parent: J["kneeFL"], at: [1.8,0.45,1.5], dir: [0,-0.3,1], role: "leg", group: "legs" });
  J["toeFL"] = b.joint("toeFL", { parent: J["ankleFL"], at: [1.8,0.1,2.1], dir: [0,-0.2,1], role: "digit", group: "legs" });
  J["hipFR"] = b.joint("hipFR", { parent: J["chest"], at: [-1.3,2.5,1.3], dir: [-0.3,-1,-0.4], role: "leg", group: "legs" });
  J["kneeFR"] = b.joint("kneeFR", { parent: J["hipFR"], at: [-1.9,1.4,0.9], dir: [0.1,-0.7,0.7], role: "leg", group: "legs" });
  J["ankleFR"] = b.joint("ankleFR", { parent: J["kneeFR"], at: [-1.8,0.45,1.5], dir: [0,-0.3,1], role: "leg", group: "legs" });
  J["toeFR"] = b.joint("toeFR", { parent: J["ankleFR"], at: [-1.8,0.1,2.1], dir: [0,-0.2,1], role: "digit", group: "legs" });
  J["hipHL"] = b.joint("hipHL", { parent: J["hips"], at: [1.4,2.4,-1.5], dir: [0.3,-0.8,0.6], role: "leg", group: "legs" });
  J["kneeHL"] = b.joint("kneeHL", { parent: J["hipHL"], at: [1.9,1.5,-0.8], dir: [-0.1,-0.5,-0.9], role: "leg", group: "legs" });
  J["ankleHL"] = b.joint("ankleHL", { parent: J["kneeHL"], at: [1.7,0.7,-2], dir: [0,-0.9,0.7], role: "leg", group: "legs" });
  J["toeHL"] = b.joint("toeHL", { parent: J["ankleHL"], at: [1.7,0.1,-1.4], dir: [0,-0.3,1], role: "digit", group: "legs" });
  J["hipHR"] = b.joint("hipHR", { parent: J["hips"], at: [-1.4,2.4,-1.5], dir: [-0.3,-0.8,0.6], role: "leg", group: "legs" });
  J["kneeHR"] = b.joint("kneeHR", { parent: J["hipHR"], at: [-1.9,1.5,-0.8], dir: [0.1,-0.5,-0.9], role: "leg", group: "legs" });
  J["ankleHR"] = b.joint("ankleHR", { parent: J["kneeHR"], at: [-1.7,0.7,-2], dir: [0,-0.9,0.7], role: "leg", group: "legs" });
  J["toeHR"] = b.joint("toeHR", { parent: J["ankleHR"], at: [-1.7,0.1,-1.4], dir: [0,-0.3,1], role: "digit", group: "legs" });
  J["neckA1"] = b.joint("neckA1", { parent: J["chest"], at: [0,3,1.9], dir: [0,0.8,0.5], role: "neck", group: "necks" });
  J["neckA2"] = b.joint("neckA2", { parent: J["neckA1"], at: [0,4,2.6], dir: [0,0.6,0.8], role: "neck", group: "necks" });
  J["neckA3"] = b.joint("neckA3", { parent: J["neckA2"], at: [0,4.7,3.4], dir: [0,0.1,1], role: "neck", group: "necks" });
  J["headA"] = b.joint("headA", { parent: J["neckA3"], at: [0,4.9,3.9], dir: [0,-0.1,1], role: "head", group: "heads" });
  J["jawA"] = b.joint("jawA", { parent: J["headA"], at: [0,4.7,4], dir: [0,-0.1,1], role: "jaw", group: "heads" });
  J["neckB1"] = b.joint("neckB1", { parent: J["chest"], at: [0.6,2.95,1.9], dir: [0.4,0.8,0.4], role: "neck", group: "necks" });
  J["neckB2"] = b.joint("neckB2", { parent: J["neckB1"], at: [1.2,3.9,2.5], dir: [0.3,0.5,0.8], role: "neck", group: "necks" });
  J["neckB3"] = b.joint("neckB3", { parent: J["neckB2"], at: [1.8,4.4,3.2], dir: [0.2,0.1,1], role: "neck", group: "necks" });
  J["headB"] = b.joint("headB", { parent: J["neckB3"], at: [2,4.5,3.7], dir: [0.25,-0.15,1], role: "head", group: "heads" });
  J["jawB"] = b.joint("jawB", { parent: J["headB"], at: [2.05,4.3,3.8], dir: [0.25,-0.15,1], role: "jaw", group: "heads" });
  J["neckC1"] = b.joint("neckC1", { parent: J["chest"], at: [-0.6,2.95,1.9], dir: [-0.4,0.8,0.4], role: "neck", group: "necks" });
  J["neckC2"] = b.joint("neckC2", { parent: J["neckC1"], at: [-1.2,3.9,2.5], dir: [-0.3,0.5,0.8], role: "neck", group: "necks" });
  J["neckC3"] = b.joint("neckC3", { parent: J["neckC2"], at: [-1.8,4.4,3.2], dir: [-0.2,0.1,1], role: "neck", group: "necks" });
  J["headC"] = b.joint("headC", { parent: J["neckC3"], at: [-2,4.5,3.7], dir: [-0.25,-0.15,1], role: "head", group: "heads" });
  J["jawC"] = b.joint("jawC", { parent: J["headC"], at: [-2.05,4.3,3.8], dir: [-0.25,-0.15,1], role: "jaw", group: "heads" });
  J["neckD1"] = b.joint("neckD1", { parent: J["chest"], at: [1.1,2.9,1.7], dir: [0.8,0.6,0.3], role: "neck", group: "necks" });
  J["neckD2"] = b.joint("neckD2", { parent: J["neckD1"], at: [2,3.5,2.1], dir: [0.7,0.3,0.6], role: "neck", group: "necks" });
  J["neckD3"] = b.joint("neckD3", { parent: J["neckD2"], at: [2.9,3.8,2.7], dir: [0.4,0,1], role: "neck", group: "necks" });
  J["headD"] = b.joint("headD", { parent: J["neckD3"], at: [3.2,3.7,3.2], dir: [0.5,-0.2,1], role: "head", group: "heads" });
  J["jawD"] = b.joint("jawD", { parent: J["headD"], at: [3.3,3.5,3.3], dir: [0.5,-0.2,1], role: "jaw", group: "heads" });
  J["neckE1"] = b.joint("neckE1", { parent: J["chest"], at: [-1.1,2.9,1.7], dir: [-0.8,0.6,0.3], role: "neck", group: "necks" });
  J["neckE2"] = b.joint("neckE2", { parent: J["neckE1"], at: [-2,3.5,2.1], dir: [-0.7,0.3,0.6], role: "neck", group: "necks" });
  J["neckE3"] = b.joint("neckE3", { parent: J["neckE2"], at: [-2.9,3.8,2.7], dir: [-0.4,0,1], role: "neck", group: "necks" });
  J["headE"] = b.joint("headE", { parent: J["neckE3"], at: [-3.2,3.7,3.2], dir: [-0.5,-0.2,1], role: "head", group: "heads" });
  J["jawE"] = b.joint("jawE", { parent: J["headE"], at: [-3.3,3.5,3.3], dir: [-0.5,-0.2,1], role: "jaw", group: "heads" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
