import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  spots,
  mottle,
  countershade,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Octopus",
  description:
    "A stylized coral-red octopus resting on the floor: bulbous spotted mantle, gold bar-pupil eyes under hinged lids, eight webbed arms that run along the floor and curl their tips up to show rows of cream suckers, a siphon and a two-part beak.",
};

export default function build() {
  const b = createBuilder({ name: "octopus" });

  // Palette
  const CORAL = "#e0553e";
  const DEEP = "#a52d2a";
  const SPOT = "#ffc89e";
  const BELLY = "#f6d6c2";
  const RIM = "#fff1e6";
  const CUP = "#d9837a";
  const GOLD = "#f4c247";
  const BEAK = "#2a1d1a";
  const WEBC = "#c23d35";

  const skin = spots(mottle(CORAL, DEEP, { size: 0.08, contrast: 0.6, seed: 3 }), SPOT, {
    size: 0.05,
    amount: 0.22,
    seed: 7,
  });
  const bodyPaint = countershade(skin, BELLY, { level: -0.55 });
  const webPaint = mottle(WEBC, DEEP, { size: 0.05, seed: 11 });

  // ---------- Skeleton: body + mantle ----------
  const body = b.joint("body", { at: [0, 0.1, 0], dir: [0, 1, 0], role: "spine" });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.17, 0],
      [0, 0.26, -0.04],
      [0, 0.35, -0.1],
      [0, 0.44, -0.17],
    ]),
    { parent: body, count: 3, role: "spine" },
  );
  const head = b.joint("head", { parent: body, at: [0, 0.16, 0.02], dir: [0, 0, 1], role: "head" });

  const bodyLoft = b.loft(
    [
      { at: [0, 0.085, 0], w: 0.16, h: 0.16 },
      { at: [0, 0.15, 0.01], w: 0.23, h: 0.22 },
      { at: [0, 0.25, -0.035], w: 0.28, h: 0.27 },
      { at: [0, 0.34, -0.095], w: 0.28, h: 0.27 },
      { at: [0, 0.42, -0.155], w: 0.2, h: 0.2 },
      { at: [0, 0.465, -0.19], w: 0.07, h: 0.07 },
    ],
    { bone: [body, mantle], color: bodyPaint, caps: { start: "flat", end: "round" } },
  );
  const surf = b.surface(bodyLoft);

  // ---------- Eyes ----------
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#d8962a"/>
      <circle cx="32" cy="32" r="25" fill="#f6cf5a"/>
      <rect x="9" y="25" width="46" height="14" rx="7" fill="#1b1220"/>
      <circle cx="21" cy="19" r="5" fill="#ffffff"/>
      <circle cx="44" cy="45" r="2.5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const UP = new THREE.Vector3(0, 1, 0);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hit = surf.around([0, 0.17, 0]).at(s * 52, 14)!;
    const n = new THREE.Vector3().copy(hit.n as THREE.Vector3).normalize();

    // socket bump
    b.stick(new THREE.SphereGeometry(0.05, 10, 8), bodyPaint, hit, { embed: 0.55, bone: head });
    // eyeball
    const eyeC = hit.moved([0, 0.022, 0]);
    const eyeball = b.part(new THREE.SphereGeometry(0.036, 12, 10), GOLD, { frame: eyeC, bone: head });
    const eyeFront = new THREE.Vector3().copy(eyeC.at as THREE.Vector3).addScaledVector(n, 0.036);
    b.decal(eyeball, eyeTex, {
      at: eyeFront,
      dir: n,
      size: [0.056, 0.056],
      mirror: s > 0,
      bone: head,
    });

    // hinged lid
    const lidDir = n.clone().multiplyScalar(0.4).add(UP).normalize();
    const lid = b.joint(`lid${S}`, { parent: head, at: eyeC, dir: lidDir, role: "hinge" });
    b.part(new THREE.SphereGeometry(0.04, 12, 6, 0, Math.PI * 2, 0, 0.85), skin, {
      bone: lid,
      at: lid,
      dir: lidDir,
    });
    // brow papilla "horn"
    const hornBase = new THREE.Vector3().copy(eyeC.at as THREE.Vector3).addScaledVector(lidDir, 0.036);
    const hornDir = lidDir.clone().addScaledVector(n, -0.2).normalize();
    b.spike(hornBase, hornDir, 0.032, 0.009, { color: DEEP, bone: lid });
  }

  // ---------- Siphon (right side) ----------
  {
    const hit = surf.around([0, 0.15, 0]).at(-105, -10)!;
    b.rod(hit.moved([0, -0.012, 0]), hit.moved([0, 0.04, 0]), [0.018, 0.014], { color: BELLY, bone: body });
    b.stick(
      new THREE.TorusGeometry(0.014, 0.005, 5, 10).rotateX(Math.PI / 2),
      DEEP,
      hit.moved([0, 0.04, 0]),
      { embed: 0.5, bone: body },
    );
  }

  // ---------- Mouth: oral ring and beak ----------
  b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 10), CUP, {
    bone: body,
    at: [0, 0.085, 0.004],
    dir: [0, 1, 0],
    axis: "z",
  });
  b.spike([0, 0.09, -0.004], [0, 0.06, 0.014], null, 0.015, { color: BEAK, bone: body });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.084, 0.01], aim: [0, 0.06, 0.03], role: "jaw" });
  b.spike([0, 0.084, 0.01], [0, 0.062, 0.028], null, 0.011, { color: BEAK, bone: jaw });

  // ---------- Mantle papillae ----------
  for (const h of surf.scatter(40, {
    rng: rng(5),
    minDist: 0.045,
    filter: (h) => h.at.y > 0.26 && h.n.y > -0.2,
  })) {
    b.stick(new THREE.ConeGeometry(0.008, 0.022, 5), DEEP, h, { embed: 0.3 });
  }

  // ---------- Arms ----------
  const rArm = (t: number) => 0.006 + 0.036 * Math.pow(1 - t, 1.1);
  type SweepT = ReturnType<typeof b.sweep>;
  const arms: { sweep: SweepT; az: number }[] = [];

  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const azDeg = s * (22.5 + 45 * k);
      const a = (azDeg * Math.PI) / 180;
      const len = 1 + 0.04 * Math.sin(k * 2.3 + s * 1.7) - (k === 0 ? 0.04 : 0);
      const P = (d: number, y: number) => [Math.sin(a) * d * len, y, Math.cos(a) * d * len];
      const ds = [0.04, 0.14, 0.25, 0.36, 0.46, 0.55, 0.61, 0.63, 0.6];
      let ys = [0.11, 0.06, 0.03, 0.025, 0.02, 0.018, 0.06, 0.11, 0.15];
      let path = catmull(ds.map((d, i) => P(d, ys[i])));
      for (let it = 0; it < 2; it++) {
        ys = ys.map((y, i) => (i >= 2 && i <= 5 ? rArm(path.closestT(P(ds[i], y))) - 0.002 : y));
        path = catmull(ds.map((d, i) => P(d, ys[i])));
      }

      const name = `arm${s > 0 ? "L" : "R"}${k + 1}`;
      const ch = b.chain(name, path, {
        parent: body,
        count: 7,
        names: (i: number) => `${name}_${i + 1}`,
        role: "tentacle",
      });
      const sw = b.sweep(ch, rArm, { color: BELLY, sectors: [[-115, 115, skin]] });
      arms.push({ sweep: sw, az: azDeg });

      // suckers: two staggered rows on the underside
      for (let j = 0; j < 26; j++) {
        const t = 0.1 + j * 0.034;
        if (t > 0.97) break;
        const ang = 180 + (j % 2 ? 30 : -30);
        const sp = sw.at(t, ang);
        if (sp.at.y < 0.004) continue;
        const rr = rArm(t) * 0.42;
        b.stick(new THREE.TorusGeometry(rr, rr * 0.35, 4, 8).rotateX(Math.PI / 2), RIM, sp, { embed: 0.4 });
        b.stick(new THREE.CylinderGeometry(rr * 0.8, rr * 0.8, rr * 0.3, 8), CUP, sp, { embed: 0.6 });
      }

      // pale pearl dots along the top of each arm
      b.along(sw, 7, (at) => {
        const r = rArm(at.t) * 0.3;
        b.stick(new THREE.SphereGeometry(r, 6, 4), SPOT, at, { embed: 0.5, scale: [1, 0.5, 1] });
      });
    }
  }

  // ---------- Interbrachial web ----------
  const order = [...arms].sort((p, q) => p.az - q.az);
  for (let i = 0; i < order.length; i++) {
    const A = order[i];
    const B = order[(i + 1) % order.length];
    b.membrane(A.sweep.line(270, -0.003).slice(0, 0.3), B.sweep.line(90, -0.003).slice(0, 0.3), {
      color: webPaint,
      thickness: 0.006,
      scallop: 0.35,
    });
  }

  return b.root;
}
