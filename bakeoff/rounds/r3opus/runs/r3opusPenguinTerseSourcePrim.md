```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, noise, gradient, DEG } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "King Penguin",
  description:
    "A stylized king penguin in a rigging rest pose: egg-shaped lofted body with a painted tuxedo, silver back, golden chest and glowing orange ear patches, flat paddle flippers held out, webbed feet, stiff tail and a two-part opening beak.",
};

const shade = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];

export default function build() {
  const b = createBuilder({ name: "kingPenguin", paintSize: 1024 });

  // ---------------- Skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.14, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.2, 0],
      [0, 0.38, 0],
      [0, 0.55, 0],
    ],
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.55, 0],
      [0, 0.64, 0.01],
    ],
    { parent: "spine2", names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { at: [0, 0.64, 0.01], parent: "neck", dir: [0, 1, 0], role: "head" });

  // ---------------- Paints ----------------
  const plumage = paint((p) => {
    const y = p.y;
    const ang = Math.abs(Math.atan2(p.x, p.z)) / DEG; // 0 = straight ahead
    const fluff = 0.9 + 0.18 * noise(p, 0.02, 3);
    // Ear patches: glowing orange teardrops on the head sides.
    for (const sx of [1, -1]) {
      const d = ((p.x - sx * 0.088) / 0.034) ** 2 + ((y - 0.69) / 0.055) ** 2 + ((p.z + 0.005) / 0.05) ** 2;
      if (d < 1) return mix("#ffd84a", "#f2851c", smoothstep(0.05, 0.95, d));
    }
    let half: number;
    if (y < 0.34) half = 66;
    else if (y < 0.6) half = 66 - 26 * smoothstep(0.34, 0.6, y);
    else half = 40 - 40 * smoothstep(0.6, 0.69, y);
    if (half > 1 && ang < half - 4) {
      let c = mix("#f7f4ec", "#fbe08a", smoothstep(0.42, 0.55, y));
      c = mix(c, "#f39a2c", smoothstep(0.55, 0.66, y));
      return shade(c, 0.96 + 0.06 * noise(p, 0.015, 9));
    }
    if (half > 1 && ang < half) return "#0d1016"; // crisp black outline of the bib
    let back = mix("#2a3240", "#8c98aa", smoothstep(0.16, 0.5, y));
    back = mix(back, "#14171e", smoothstep(0.52, 0.62, y));
    back = mix(back, "#161a22", 0.6 * smoothstep(half + 26, half + 4, ang));
    return shade(back, fluff);
  });

  const flipperPaint = paint((p, n) => {
    const fluff = 0.9 + 0.16 * noise(p, 0.02, 5);
    const tip = smoothstep(0.41, 0.46, Math.abs(p.x));
    if (n.y > -0.15) return shade(mix(mix("#3a4352", "#7f8b9c", smoothstep(0.2, 0.4, Math.abs(p.x))), "#1a1e26", tip), fluff);
    return mix("#f5f2ea", "#1a1e26", Math.max(tip, smoothstep(0.022, 0.034, p.z)));
  });

  // ---------------- Body ----------------
  b.loft(
    [
      { at: [0, 0.12, 0.0], w: 0.22, h: 0.2 },
      { at: [0, 0.24, 0.012], w: 0.4, h: 0.36 },
      { at: [0, 0.36, 0.012], w: 0.4, h: 0.35 },
      { at: [0, 0.48, 0.005], w: 0.32, h: 0.28 },
      { at: [0, 0.58, 0.0], w: 0.22, h: 0.2 },
      { at: [0, 0.66, 0.005], w: 0.15, h: 0.14 },
    ],
    { color: plumage, bone: [hips, spine, neck], sides: 14, name: "body" },
  );

  // ---------------- Head ----------------
  b.part(new THREE.SphereGeometry(0.11, 16, 12), plumage, {
    at: [0, 0.72, 0.02],
    bone: head,
    scale: [0.95, 0.95, 1.05],
    name: "headBall",
  });

  // Beak
  const d = new THREE.Vector3(0, -0.28, 1).normalize();
  const beakBase = new THREE.Vector3(0, 0.708, 0.11);
  b.part(new THREE.ConeGeometry(0.022, 0.135, 6), "#16181d", {
    at: beakBase.clone().addScaledVector(d, 0.0675),
    dir: d,
    bone: head,
    scale: [1, 1, 0.6],
    name: "beakUpper",
  });
  const jawAt = new THREE.Vector3(0, 0.692, 0.105);
  const jaw = b.joint("jaw", { at: jawAt, parent: head, dir: d, role: "jaw" });
  const lowerPaint = gradient(
    "#f2803a",
    "#16181d",
    jawAt.clone().addScaledVector(d, 0.07),
    jawAt.clone().addScaledVector(d, 0.105),
  );
  b.part(new THREE.ConeGeometry(0.017, 0.118, 6), lowerPaint, {
    at: jawAt.clone().addScaledVector(d, 0.059),
    dir: d,
    bone: jaw,
    scale: [0.9, 1, 0.5],
    name: "beakLower",
  });

  // ---------------- Paired parts ----------------
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";

    // Eyes with glints, and beak gape
    const eyeAt: [number, number, number] = [sx * 0.066, 0.745, 0.095];
    b.part(new THREE.SphereGeometry(0.016, 10, 8), "#0b0b0e", { at: eyeAt, bone: head, name: `eye${S}` });
    b.part(new THREE.SphereGeometry(0.005, 6, 5), "#ffffff", {
      at: [eyeAt[0] + sx * 0.004, eyeAt[1] + 0.007, eyeAt[2] + 0.012],
      bone: head,
      name: `glint${S}`,
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 5), "#ff9a55", {
      at: [sx * 0.019, 0.697, 0.108],
      bone: head,
      name: `gape${S}`,
    });

    // Flippers, held out
    const flipper = b.chain(
      `flipper${S}`,
      [
        [sx * 0.16, 0.5, 0],
        [sx * 0.27, 0.47, 0],
        [sx * 0.38, 0.44, 0],
        [sx * 0.47, 0.42, 0],
      ],
      {
        parent: "spine2",
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `flipperTip${S}`],
        role: "wing",
        up: [0, 1, 0],
      },
    );
    const fw = [0.04, 0.052, 0.046, 0.032, 0.012];
    const ft = [0.013, 0.012, 0.01, 0.008, 0.005];
    const lerpArr = (arr: number[], t: number) => {
      const x = Math.min(Math.max(t, 0), 1) * (arr.length - 1);
      const i = Math.min(Math.floor(x), arr.length - 2);
      return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
    };
    b.sweep(flipper, (t: number) => [lerpArr(fw, t), lerpArr(ft, t)] as const, {
      color: flipperPaint,
      sides: 10,
      name: `flipper${S}`,
    });

    // Legs
    const ankle = new THREE.Vector3(sx * 0.09, 0.035, 0.05);
    b.chain(
      `leg${S}`,
      [
        [sx * 0.08, 0.16, 0.01],
        [sx * 0.085, 0.09, 0.03],
        [ankle.x, ankle.y, ankle.z],
      ],
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `ankle${S}`],
        role: "leg",
        contact: [sx * 0.09, 0, 0.09],
      },
    );
    b.capsule([sx * 0.085, 0.1, 0.03], ankle, 0.024, { color: "#2e3542", bone: `knee${S}`, name: `shin${S}` });

    // Toes, webbing and claws
    const FOOT = "#24242a";
    const tips: THREE.Vector3[] = [];
    [-28, 0, 28].forEach((a0, i) => {
      const a = (a0 + sx * 12) * DEG;
      const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const tip = new THREE.Vector3(ankle.x + dir.x * 0.07, 0.011, ankle.z + dir.z * 0.07);
      tips.push(tip);
      const name = `toe${i + 1}${S}`;
      b.chain(`toeChain${i + 1}${S}`, [ankle.clone(), tip.clone()], {
        parent: `ankle${S}`,
        names: [name],
        role: "digit",
      });
      b.capsule(ankle.clone(), tip.clone(), [0.015, 0.011], { color: FOOT, bone: name, name: `toe${i + 1}${S}` });
      b.spike(tip.clone(), [dir.x, -0.4, dir.z], 0.02, 0.006, { color: "#0d0d10", bone: name, name: `claw${i + 1}${S}` });
    });
    b.slab(
      [new THREE.Vector3(ankle.x, 0.012, ankle.z - 0.012), tips[0], tips[1], tips[2]].map(
        (v) => new THREE.Vector3(v.x, 0.01, v.z),
      ),
      { color: "#2f2c36", thickness: 0.008, bone: `ankle${S}`, name: `web${S}` },
    );
  }

  // ---------------- Tail ----------------
  const tail = b.chain(
    "tail",
    [
      [0, 0.16, -0.13],
      [0, 0.1, -0.22],
      [0, 0.06, -0.28],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t: number) => [0.045 * (1 - t) + 0.012, 0.014 * (1 - t) + 0.006] as const, {
    color: "#1c212b",
    sides: 8,
    name: "tail",
  });

  return b.root;
}
```