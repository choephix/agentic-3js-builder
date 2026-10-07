```ts
import * as THREE from "three";
import { createBuilder, limb, catmull, patches, paint } from "agentic-3js-builder";

export const meta = {
  name: "Giraffe",
  description: "Stylized rigged giraffe with patched coat, long neck, ossicones, mane, tail tuft and cloven hooves.",
};

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  const CREAM = "#ecd08a";
  const BROWN = "#9a5a26";
  const DARK = "#2b1d14";
  const MANE = "#4a2a14";
  const HOOF = "#2a2220";
  const MUZZLE = "#6b4a3a";
  const SOCK = "#e2c585";

  const coat = patches(CREAM, BROWN, { size: 0.42, gap: 0.05 });
  const legCoat = paint((p) => (p.y < 0.65 ? SOCK : coat));

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 2.55, -0.6] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.55, -0.6],
      [0, 2.7, 0],
      [0, 2.85, 0.5],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const shoulder = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.85, 0.5],
      [0, 3.5, 1.0],
      [0, 4.3, 1.42],
      [0, 5.0, 1.75],
    ]),
    { parent: shoulder, count: 4, role: "neck" },
  );
  const hp: [number, number, number] = [0, 5.0, 1.75];
  const dY = -0.24, dZ = 0.97;
  const H = (f: number, u: number, l: number): [number, number, number] => [l, hp[1] + u + f * dY, hp[2] + f * dZ];

  const head = b.joint("head", { parent: neck.joints[3], at: hp, dir: [0, dY, dZ], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0.04, -0.07, 0), aim: H(0.4, -0.07, 0), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.65, -0.95],
      [0, 2.4, -1.25],
      [0, 1.9, -1.4],
      [0, 1.35, -1.45],
    ]),
    { parent: hips, count: 3, role: "tail" },
  );

  // ---------- body ----------
  b.sweep(spine, (t) => [0.3 + 0.04 * t, 0.42 - 0.02 * t], { color: coat, sides: 10 });
  const neckTube = b.sweep(neck, (t) => 0.27 - 0.13 * t, { color: coat, sides: 8 });
  b.sweep(tail, [0.06, 0.025], { color: coat, sides: 6 });
  const tl = tail.joints[2];
  b.part(new THREE.ConeGeometry(0.07, 0.32, 6), MANE, { bone: tl, at: [0, 1.25, -1.45], dir: [0, -1, 0] });

  // mane
  b.along(neckTube, 14, (at) => b.spike(at, at, 0.1, 0.03, { color: MANE, sides: 5 }));

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fp = limb(
      [s * 0.22, 2.45, 0.5],
      [s * 0.22, 0.13, 0.55],
      [0.85, 0.8, 0.75],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const fl = b.chain("legF" + S, fp, {
      parent: shoulder,
      names: ["shoulder" + S, "elbow" + S, "carpus" + S, "hoofF" + S],
      role: "leg",
    });
    b.sweep(fl, [0.14, 0.055], { color: legCoat, sides: 7 });
    b.part(new THREE.SphereGeometry(0.075, 6, 5), legCoat, { bone: fl.joints[2], at: fp[2] });
    // hind
    const hp2 = limb(
      [s * 0.22, 2.4, -0.6],
      [s * 0.22, 0.13, -0.72],
      [0.85, 0.8, 0.75],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain("legH" + S, hp2, {
      parent: hips,
      names: ["hip" + S, "stifle" + S, "hock" + S, "hoofH" + S],
      role: "leg",
    });
    b.sweep(hl, [0.17, 0.055], { color: legCoat, sides: 7 });
    b.part(new THREE.SphereGeometry(0.075, 6, 5), legCoat, { bone: hl.joints[2], at: hp2[2] });

    for (const [ch, pts] of [
      [fl, fp],
      [hl, hp2],
    ] as const) {
      for (const o of [-0.045, 0.045]) {
        b.part(new THREE.BoxGeometry(0.075, 0.14, 0.25), HOOF, {
          bone: ch.tip!,
          at: [pts[3].x + o, 0.07, pts[3].z + 0.03],
        });
      }
    }
  }

  // ---------- head ----------
  b.frustumBox(H(-0.05, 0, 0), H(0.42, 0, 0), [0.2, 0.2], [0.13, 0.12], { color: coat, bone: head });
  b.frustumBox(H(0.3, -0.01, 0), H(0.46, -0.01, 0), [0.14, 0.13], [0.15, 0.13], { color: MUZZLE, bone: head });
  b.frustumBox(H(0.04, -0.12, 0), H(0.44, -0.12, 0), [0.12, 0.06], [0.13, 0.07], { color: MUZZLE, bone: jaw });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.05, 6, 5), DARK, { bone: head, at: H(0.1, 0.08, s * 0.1) });
    // nostrils
    b.part(new THREE.SphereGeometry(0.025, 5, 4), DARK, { bone: head, at: H(0.47, 0.03, s * 0.05) });
    // ears
    b.part(new THREE.SphereGeometry(0.08, 6, 4), coat, {
      bone: head,
      at: H(-0.05, 0.1, s * 0.2),
      scale: [1.9, 0.4, 0.9],
      rotation: [0, 0, -s * 20],
    });
    // ossicones
    const base = H(0.02, 0.16, s * 0.07);
    const tip = H(-0.08, 0.5, s * 0.09);
    b.spike(base, tip, null, 0.04, { color: coat, bone: head, sides: 6, caps: "flat" });
    b.part(new THREE.SphereGeometry(0.055, 6, 5), MANE, { bone: head, at: tip });
  }
  // third small horn
  b.part(new THREE.ConeGeometry(0.03, 0.08, 5), coat, { bone: head, at: H(0.2, 0.2, 0) });

  return b.root;
}
```