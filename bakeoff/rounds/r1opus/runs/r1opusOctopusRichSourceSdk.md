```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  spots,
  rng,
  aim,
} from "agentic-3js-builder";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust reef octopus with bumpy, pale-mottled skin, golden bar-pupil eyes under grumpy brows, eight curling arms lined with cream suckers, one proudly raising an old verdigris-spotted brass key.",
};

export default function build() {
  const b = createBuilder({ name: "reefOctopus", paintSize: 1024 });
  const UP = new THREE.Vector3(0, 1, 0);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- Paints ----------
  const skinBase = (p: THREE.Vector3, n: THREE.Vector3) => {
    let c = mix("#a83a22", "#d8653c", noise(p, 0.07, 1));
    c = mix(c, "#7a2616", smoothstep(0.62, 0.72, noise(p, 0.05, 11)) * 0.5);
    c = mix(c, "#f1b08c", smoothstep(0.58, 0.68, noise(p, 0.03, 7)) * 0.7);
    const cl = cells(p, 0.016, 3);
    if (cl.id < 0.4) c = mix(c, "#f7d6bd", smoothstep(0.22, 0.12, cl.d1) * 0.75);
    c = mix(c, "#efb59a", smoothstep(-0.2, -0.8, n.y) * 0.5);
    return c;
  };
  const skin = paint((p, n) => skinBase(p, n));
  const armSkin = paint((p, n, s) => {
    const deg = ((s[1] % 360) + 360) % 360;
    const d = Math.abs(deg - 180);
    return mix(skinBase(p, n), "#f4cdb0", smoothstep(75, 35, d) * 0.85);
  });
  const brass = spots("#c9993a", ["#5f9e86", "#7cb8a0"], { size: 0.012, amount: 0.15, seed: 4 });
  const CREAM = "#f5dfc4";
  const BUMPS = ["#d9744f", "#e8946f", "#b9482b", "#f0b292"];

  // ---------- Skeleton: body + mantle ----------
  const body = b.joint("body", { at: [0, 0.1, 0] });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.1, 0.01],
      [0, 0.17, -0.02],
      [0, 0.24, -0.07],
      [0, 0.3, -0.13],
    ]),
    { parent: body, role: "spine", names: ["mantle1", "mantle2", "mantle3"] },
  );
  const mantleR = (t: number) => {
    const r = t < 0.45 ? 0.07 + 0.045 * smoothstep(0, 0.45, t) : 0.115 - 0.06 * ((t - 0.45) / 0.55) ** 2;
    return [r * 1.06, r] as const;
  };
  const mantleSweep = b.sweep(mantle, mantleR, { color: skin, sides: 14 });

  // Arm crown under the head
  const crown = b.lathe(
    [
      [0, 0],
      [0.08, 0.004],
      [0.1, 0.03],
      [0.096, 0.06],
      [0.072, 0.1],
      [0, 0.125],
    ],
    { at: [0, 0.02, 0], color: skin, segments: 16, bone: "body" },
  );

  // Beak with separate jaw (tucked under the crown)
  b.joint("beak", { at: [0, 0.04, 0.004], dir: [0, -1, 0], parent: "body" });
  b.spike([0, 0.04, 0.006], [0, 0.013, 0.011], null, 0.012, { color: "#2b1a12", bone: "beak", sides: 6 });
  b.joint("jaw", { at: [0, 0.04, -0.006], dir: [0, -1, 0], parent: "beak", role: "jaw" });
  b.spike([0, 0.04, -0.008], [0, 0.016, -0.003], null, 0.009, { color: "#3a2418", bone: "jaw", sides: 6 });

  // ---------- Eyes ----------
  const headSurf = b.surface([mantleSweep, crown]);
  const eyeCenters: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const origin = V(s * 0.35, 0.165, 0.3);
    const dir = V(0, 0.16, 0).sub(origin).normalize();
    const hit = headSurf.ray(origin, dir) ?? headSurf.nearest([s * 0.07, 0.16, 0.06]);
    const n = hit.n.clone().normalize();
    const center = hit.at.clone().addScaledVector(n, 0.014);
    eyeCenters.push(center.clone());
    const eye = b.joint(`eye${side}`, { at: center, dir: n, parent: "mantle1" });

    // mound
    b.part(new THREE.SphereGeometry(0.032, 10, 8), skin, {
      at: hit.at.clone().addScaledVector(n, -0.004),
      bone: "mantle1",
    });
    // golden eyeball
    const eyeN = n.clone();
    const c0 = center.clone();
    const eyePaint = paint((p) => {
      const d = p.clone().sub(c0).normalize().dot(eyeN);
      return d > 0.55
        ? mix("#ffd64f", "#f2ac25", smoothstep(0.95, 0.6, d))
        : mix("#b46e18", "#5e3210", smoothstep(0.55, 0.0, d));
    });
    b.part(new THREE.SphereGeometry(0.026, 12, 10), eyePaint, { at: center, bone: eye });

    // bar pupil
    const h = new THREE.Vector3().crossVectors(UP, n).normalize();
    const pc = center.clone().addScaledVector(n, 0.0245);
    b.capsule(pc.clone().addScaledVector(h, -0.0105), pc.clone().addScaledVector(h, 0.0105), 0.0042, {
      color: "#1a0f0b",
      bone: eye,
      sides: 8,
    });
    // highlight
    b.part(new THREE.SphereGeometry(0.0042, 6, 4), "#fffbe8", {
      at: center.clone().addScaledVector(n, 0.023).addScaledVector(UP, 0.009).addScaledVector(h, 0.006),
      bone: eye,
    });

    // heavy grumpy lid: tilted toward the inside and front
    const lidUp = V(-s * 0.35, 1, 0).addScaledVector(n, 0.5).normalize();
    b.part(new THREE.SphereGeometry(0.0295, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), skin, {
      at: center,
      quat: aim(lidUp),
      bone: eye,
    });

    // brow ridge: inner end low, outer end high
    const inward = V(-s, 0, 0);
    const browA = center.clone().addScaledVector(UP, 0.024).addScaledVector(n, 0.017).addScaledVector(inward, 0.017);
    const browB = center.clone().addScaledVector(UP, 0.035).addScaledVector(n, 0.004).addScaledVector(inward, -0.022);
    b.capsule(browA, browB, [0.008, 0.0055], { color: "#8f2f1c", bone: "mantle1", sides: 8 });

    // papillae above the eye
    const pb = center.clone().addScaledVector(UP, 0.034).addScaledVector(inward, -0.012);
    b.spike(pb, V(-s * -0.4, 1, 0.1), 0.03, 0.006, { color: skin, bone: "mantle1", sides: 6 });
    b.spike(
      center.clone().addScaledVector(UP, 0.03).addScaledVector(inward, 0.004).addScaledVector(n, -0.01),
      V(s * 0.2, 1, -0.2),
      0.018,
      0.0045,
      { color: skin, bone: "mantle1", sides: 6 },
    );
  }

  // ---------- Arms ----------
  const R = rng(11);
  const KEY = 1;
  const rArm = (t: number) => 0.031 - 0.025 * t;
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const armPaths: ReturnType<typeof catmull>[] = [];
  let keyChain: ReturnType<typeof b.chain> | null = null;
  let keyDir = new THREE.Vector3();

  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) * Math.PI) / 4;
    const dir = V(Math.sin(a), 0, Math.cos(a));
    const s = k % 2 === 0 ? 1 : -1;
    const side = new THREE.Vector3().crossVectors(UP, dir).multiplyScalar(s);
    const P = (d: number, sd: number, y: number) =>
      dir.clone().multiplyScalar(d).addScaledVector(side, sd).setY(y);
    let pts: THREE.Vector3[];
    if (k === KEY) {
      pts = [
        P(0.07, 0, 0.07),
        P(0.16, 0, 0.05),
        P(0.23, 0, 0.11),
        P(0.25, 0, 0.21),
        P(0.23, 0, 0.3),
        P(0.19, 0, 0.355),
        P(0.15, 0.03, 0.36),
        P(0.14, 0.06, 0.33),
      ];
    } else {
      const L = 0.92 + 0.16 * R();
      pts = [
        P(0.07, 0, 0.065),
        P(0.16 * L, 0, 0.033),
        P(0.28 * L, 0.01 * L, 0.021),
        P(0.4 * L, 0.035 * L, 0.016),
        P(0.48 * L, 0.08 * L, 0.013),
        P(0.51 * L, 0.13 * L, 0.016),
        P(0.48 * L, 0.16 * L, 0.03),
      ];
    }
    const path = catmull(pts);
    armPaths.push(path);
    const chain = b.chain(`arm${k + 1}`, path, {
      parent: body,
      count: 6,
      role: "tentacle",
      names: (i) => `arm${k + 1}_${i + 1}`,
    });
    if (k === KEY) {
      keyChain = chain;
      keyDir = dir.clone();
    }
    const sw = b.sweep(chain, rArm, { color: armSkin, sides: 10 });

    // two staggered rows of cream suckers on the lower sides
    [125, 235].forEach((ang, ri) => {
      for (let i = 0; i < 12; i++) {
        const t = 0.1 + (0.84 * (i + (ri ? 0.5 : 0))) / 12;
        const sp = sw.at(t, ang);
        const Rs = rArm(t) * 0.42;
        const h = Rs * 0.9;
        b.lathe(
          [
            [0, 0],
            [Rs, 0],
            [Rs, 0.55 * h],
            [0.8 * Rs, h],
            [0.45 * Rs, 0.55 * h],
            [0, 0.45 * h],
          ],
          { at: sp.moved([0, -0.25 * h, 0]), axis: sp, color: CREAM, segments: 8 },
        );
      }
    });

    // little bumps along the top of the arm
    for (let i = 0; i < 7; i++) {
      const t = 0.12 + 0.11 * i;
      const sp = sw.at(t, (R() - 0.5) * 70);
      b.stick(ico, BUMPS[Math.floor(R() * BUMPS.length)], sp, {
        scale: rArm(t) * (0.2 + 0.12 * R()),
        embed: 0.45,
      });
    }
  }

  // webbing between the floor arms
  for (let k = 0; k < 8; k++) {
    const j = (k + 1) % 8;
    if (k === KEY || j === KEY) continue;
    b.membrane(armPaths[k].slice(0, 0.3), armPaths[j].slice(0, 0.3), {
      color: skin,
      thickness: 0.005,
      scallop: 0.35,
      rows: 3,
    });
  }

  // ---------- Mantle bumps ----------
  const ms = b.surface(mantleSweep);
  const mr = rng(4);
  const hits = ms.scatter(70, {
    rng: rng(5),
    minDist: 0.017,
    filter: (h) => h.at.y > 0.135,
    keepOut: (p) => eyeCenters.some((c) => c.distanceTo(p) < 0.05),
  });
  for (const hit of hits) {
    b.stick(ico, BUMPS[Math.floor(mr() * BUMPS.length)], hit, { scale: 0.004 + 0.005 * mr(), embed: 0.45 });
  }

  // ---------- The brass key ----------
  if (keyChain) {
    const g = keyChain.at(0.86).at;
    const keyJoint = keyChain.jointAt(0.86);
    const axis = keyDir.clone().multiplyScalar(0.35).add(UP).normalize();
    let normal = V(0, 0, 1).addScaledVector(axis, -axis.z);
    if (normal.lengthSq() < 1e-6) normal = V(1, 0, 0);
    normal.normalize();
    const keySide = new THREE.Vector3().crossVectors(axis, normal).normalize();
    const at = (d: number) => g.clone().addScaledVector(axis, d);

    // shaft
    b.rod(at(-0.055), at(0.038), 0.0055, { color: brass, bone: keyJoint, sides: 8 });
    // collars
    b.rod(at(0.026), at(0.034), 0.0085, { color: brass, bone: keyJoint, sides: 8 });
    b.rod(at(-0.012), at(-0.007), 0.0075, { color: brass, bone: keyJoint, sides: 8 });
    // bow ring
    b.part(new THREE.TorusGeometry(0.021, 0.006, 6, 14), brass, {
      at: at(0.061),
      quat: aim(normal, axis, "z"),
      bone: keyJoint,
    });
    // inner bow boss
    b.part(new THREE.SphereGeometry(0.006, 8, 6), brass, { at: at(0.061), bone: keyJoint });
    // bit teeth
    for (const [d, len] of [
      [-0.05, 0.022],
      [-0.036, 0.016],
      [-0.025, 0.012],
    ] as const) {
      const base = at(d);
      b.frustumBox(base, base.clone().addScaledVector(keySide, len), [0.008, 0.004], [0.008, 0.004], {
        color: brass,
        bone: keyJoint,
        up: normal,
      });
    }
  }

  return b.root;
}
```