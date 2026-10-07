```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Forest Spirit",
  description:
    "A stag-like forest spirit: a russet fawn-spotted body under a mossy mantle of ferns, mushrooms and flowers, a pale carved mask with red markings and a glowing brow gem, leaf ears, and living-wood antlers tipped with leaves and spirit orbs. Its hooves root into the ground.",
};

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  const R: any = rng(1337);
  const rand = (): number =>
    typeof R === "function" ? R() : R.next ? R.next() : R.float();

  // palette
  const C = {
    fur: "#b0683f",
    furDark: "#7e4529",
    belly: "#ead9b4",
    spot: "#f6ead0",
    leg: "#5b3a26",
    hoof: "#2a211b",
    wood: "#7a5636",
    woodDark: "#4e3523",
    moss: "#5f8f3a",
    mossLight: "#8fbf4a",
    mossDark: "#3f6b2a",
    leaf: "#3f7a34",
    leafLight: "#a6cf5a",
    leafAutumn: "#e09a3a",
    mask: "#f2ede0",
    red: "#c43a2e",
    black: "#1d1a17",
    glow: "#fff3a8",
    glowCyan: "#b8ffe9",
    shroom: "#d2452f",
    shroomStem: "#efe4cc",
    petal: "#f7f2ff",
    petalPink: "#f2a7c3",
    pollen: "#ffd23f",
  };

  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const J = (name: string, at: number[], parent?: any, role?: string): any => {
    const o: any = { at };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    return (b as any).joint(name, o);
  };
  const P = (geo: THREE.BufferGeometry, color: string, opts: any) =>
    (b as any).part(geo, color, opts);

  // tapered faceted segment from a to c (top radius at c)
  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, sides = 6) => {
    const A = V(a), Cc = V(c);
    const d = Cc.clone().sub(A);
    const len = Math.max(d.length(), 1e-4);
    return P(new THREE.CylinderGeometry(r1, r0, len, sides, 1), color, {
      at: A.clone().add(Cc).multiplyScalar(0.5).toArray(),
      dir: d.normalize().toArray(),
      bone,
    });
  };
  const blob = (at: number[], scale: number[], color: string, bone: any, detail = 1, dir?: number[]) => {
    const o: any = { at, bone, scale };
    if (dir) o.dir = dir;
    return P(new THREE.IcosahedronGeometry(1, detail), color, o);
  };
  const leaf = (at: number[], dir: number[], len: number, w: number, color: string, bone: any) => {
    const d = V(dir).normalize();
    const c = V(at).addScaledVector(d, len / 2);
    P(new THREE.OctahedronGeometry(1, 0), color, {
      at: c.toArray(),
      dir: d.toArray(),
      scale: [w, len / 2, Math.max(w * 0.2, 0.003)],
      bone,
    });
  };
  const orb = (at: number[], r: number, color: string, bone: any) => {
    blob(at, [r, r, r], color, bone, 1);
  };
  const basis = (n: THREE.Vector3) => {
    const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const t1 = new THREE.Vector3().crossVectors(n, ref).normalize();
    const t2 = new THREE.Vector3().crossVectors(n, t1).normalize();
    return [t1, t2];
  };
  const flower = (at: number[], normal: number[], size: number, petalColor: string, bone: any) => {
    const n = V(normal).normalize();
    const [t1, t2] = basis(n);
    const c = V(at);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const d = t1.clone().multiplyScalar(Math.cos(a)).addScaledVector(t2, Math.sin(a)).addScaledVector(n, 0.35);
      leaf(c.toArray(), d.toArray(), size, size * 0.45, petalColor, bone);
    }
    blob(c.clone().addScaledVector(n, size * 0.15).toArray(), [size * 0.3, size * 0.3, size * 0.3], C.pollen, bone, 0);
  };
  const mushroom = (at: number[], h: number, r: number, bone: any) => {
    const base = V(at);
    const top = base.clone().add(new THREE.Vector3(0, h, 0));
    seg(base.toArray(), top.toArray(), r * 0.38, r * 0.3, C.shroomStem, bone, 5);
    P(new THREE.SphereGeometry(r, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2), C.shroom, {
      at: top.toArray(),
      scale: [1, 0.7, 1],
      bone,
    });
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + 0.4;
      blob(
        [top.x + Math.cos(a) * r * 0.5, top.y + r * 0.55, top.z + Math.sin(a) * r * 0.5],
        [r * 0.16, r * 0.08, r * 0.16],
        C.spot,
        bone,
        0
      );
    }
  };

  // ---------------- skeleton ----------------
  const hips = J("hips", [0, 1.05, -0.38], undefined, "spine");
  const spine1 = J("spine1", [0, 1.06, 0], hips, "spine");
  const chest = J("chest", [0, 1.07, 0.35], spine1, "spine");
  const neck0 = J("neck0", [0, 1.2, 0.48], chest, "neck");
  const neck1 = J("neck1", [0, 1.4, 0.6], neck0, "neck");
  const head = J("head", [0, 1.6, 0.7], neck1, "head");
  const jaw = J("jaw", [0, 1.6, 0.8], head, "jaw");
  J("jawTip", [0, 1.565, 0.95], jaw, "jaw");
  const tail1 = J("tail1", [0, 1.14, -0.56], hips, "tail");
  const tail2 = J("tail2", [0, 1.19, -0.67], tail1, "tail");
  J("tail3", [0, 1.17, -0.77], tail2, "tail");

  // ---------------- body ----------------
  const bc = [0, 1.06, 0];
  const br = [0.23, 0.24, 0.5];
  blob(bc, br, C.fur, spine1, 1);
  blob([0, 1.04, 0.32], [0.22, 0.26, 0.24], C.fur, chest, 1);
  blob([0, 1.07, -0.36], [0.21, 0.22, 0.22], C.fur, hips, 1);
  blob([0, 0.9, 0.04], [0.17, 0.11, 0.38], C.belly, spine1, 1);
  blob([0, 1.0, 0.46], [0.13, 0.17, 0.1], C.belly, chest, 1);

  // chest ruff
  for (let i = 0; i < 9; i++) {
    const a = -1.1 + (i / 8) * 2.2;
    const x = Math.sin(a) * 0.13;
    const z = 0.5 + Math.cos(a) * 0.05;
    leaf([x, 1.1 - Math.abs(x) * 0.4, z], [x * 2, -1, 0.5], 0.13, 0.04, i % 2 ? C.belly : C.spot, chest);
  }

  // fawn spots on the flanks
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1;
    const n = new THREE.Vector3(side * (0.5 + rand() * 0.5), 0.25 + rand() * 0.55, -0.75 + rand() * 1.5).normalize();
    const p = new THREE.Vector3(bc[0] + n.x * br[0], bc[1] + n.y * br[1], bc[2] + n.z * br[2]);
    const nn = new THREE.Vector3(n.x / br[0], n.y / br[1], n.z / br[2]).normalize();
    const s = 0.018 + rand() * 0.014;
    blob(p.toArray(), [s, 0.006, s * 1.2], C.spot, spine1, 0, nn.toArray());
  }

  // ---------------- moss mantle ----------------
  const topY = (z: number) => 1.29 - 0.08 * (z / 0.5) * (z / 0.5);
  const boneAt = (z: number) => (z < -0.2 ? hips : z > 0.22 ? chest : spine1);
  for (let k = 0; k < 9; k++) {
    const z = -0.42 + k * 0.105;
    const y = topY(z);
    const bn = boneAt(z);
    blob([(rand() - 0.5) * 0.04, y - 0.01, z], [0.15 + rand() * 0.03, 0.05, 0.09], k % 2 ? C.moss : C.mossDark, bn, 1);
    for (const s of [-1, 1]) {
      blob([s * 0.15, y - 0.07, z + (rand() - 0.5) * 0.04], [0.07, 0.035, 0.07], k % 3 ? C.moss : C.mossLight, bn, 0, [s * 0.65, 0.76, 0]);
      // dangling moss fringe pointing down the flanks
      leaf([s * 0.19, y - 0.1, z], [s * 0.5, -1, 0], 0.07, 0.025, C.mossLight, bn);
    }
  }
  const onMoss = (x: number, z: number) => [x, topY(z) + 0.03 - 2.2 * x * x, z];

  // ferns sprouting from moss
  for (let i = 0; i < 12; i++) {
    const z = -0.4 + rand() * 0.8;
    const x = (rand() - 0.5) * 0.18;
    const p = onMoss(x, z);
    const col = i % 4 === 0 ? C.leafAutumn : i % 2 ? C.leaf : C.leafLight;
    leaf(p, [x * 4 + (rand() - 0.5) * 0.6, 1, (rand() - 0.5) * 0.8], 0.11 + rand() * 0.06, 0.028, col, boneAt(z));
  }
  // mushrooms cluster on the haunch
  mushroom(onMoss(0.06, -0.34), 0.05, 0.035, hips);
  mushroom(onMoss(0.1, -0.27), 0.035, 0.024, hips);
  mushroom(onMoss(0.02, -0.42), 0.03, 0.02, hips);
  mushroom(onMoss(-0.08, 0.05), 0.04, 0.028, spine1);
  // flowers
  const flowers = [[-0.06, -0.2], [0.05, 0.12], [-0.02, 0.3], [0.09, -0.05], [-0.1, -0.33]];
  flowers.forEach(([x, z], i) =>
    flower(onMoss(x, z), [x * 3, 1, 0], 0.035, i % 2 ? C.petal : C.petalPink, boneAt(z))
  );
  // little spirit orbs nestled in the moss
  [[0.0, -0.1], [-0.05, 0.2], [0.07, 0.36]].forEach(([x, z], i) =>
    orb(onMoss(x, z), 0.018, i % 2 ? C.glowCyan : C.glow, boneAt(z))
  );

  // ---------------- neck ----------------
  seg([0, 1.12, 0.42], [0, 1.4, 0.6], 0.13, 0.09, C.fur, neck0, 7);
  seg([0, 1.4, 0.6], [0, 1.62, 0.71], 0.09, 0.075, C.fur, neck1, 7);
  blob([0, 1.33, 0.62], [0.07, 0.11, 0.05], C.belly, neck0, 1, [0, 0.8, 0.6]);
  // fern mane
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const p = [0, 1.25 + t * 0.4, 0.43 + t * 0.2];
    const bn = t < 0.5 ? neck0 : neck1;
    leaf(p, [0.35, 0.6, -0.8], 0.12 - t * 0.04, 0.03, i % 2 ? C.leaf : C.leafLight, bn);
    leaf(p, [-0.35, 0.6, -0.8], 0.12 - t * 0.04, 0.03, i % 2 ? C.leafLight : C.leaf, bn);
  }

  // ---------------- head ----------------
  blob([0, 1.66, 0.74], [0.095, 0.09, 0.11], C.fur, head, 1);
  // carved mask
  blob([0, 1.665, 0.8], [0.088, 0.085, 0.06], C.mask, head, 1);
  seg([0, 1.64, 0.8], [0, 1.6, 0.97], 0.06, 0.034, C.mask, head, 6);
  blob([0, 1.603, 0.975], [0.03, 0.022, 0.02], C.black, head, 0);
  // lower jaw
  seg([0, 1.59, 0.8], [0, 1.565, 0.95], 0.042, 0.024, C.belly, jaw, 6);
  // eyes
  for (const s of [-1, 1]) {
    blob([s * 0.068, 1.675, 0.835], [0.022, 0.026, 0.016], C.black, head, 1, [s * 0.7, 0, 0.7]);
    orb([s * 0.074, 1.684, 0.846], 0.007, C.glow, head);
    // red mask lines
    seg([s * 0.068, 1.65, 0.845], [s * 0.034, 1.62, 0.9], 0.006, 0.004, C.red, head, 4);
    seg([s * 0.05, 1.7, 0.85], [s * 0.085, 1.72, 0.81], 0.005, 0.003, C.red, head, 4);
  }
  blob([0, 1.715, 0.845], [0.03, 0.005, 0.03], C.red, head, 0, [0, 0.4, 1]);
  orb([0, 1.718, 0.85], 0.013, C.glowCyan, head);

  // leaf ears
  for (const s of [-1, 1]) {
    const L = s > 0 ? "L" : "R";
    const base = [s * 0.08, 1.7, 0.71];
    const tip = [s * 0.22, 1.75, 0.67];
    const ear = J("ear" + L, base, head);
    J("earTip" + L, tip, ear);
    const d = V(tip).sub(V(base)).normalize();
    leaf(base, d.toArray(), 0.16, 0.05, C.leaf, ear);
    seg(base, V(base).addScaledVector(d, 0.14).toArray(), 0.005, 0.002, C.leafLight, ear, 4);
  }

  // living-wood antlers
  for (const s of [-1, 1]) {
    const L = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.05, 1.73, 0.7],
      [s * 0.12, 1.9, 0.66],
      [s * 0.2, 2.05, 0.6],
      [s * 0.24, 2.2, 0.52],
    ];
    const js: any[] = [];
    pts.forEach((p, i) => js.push(J("antler" + L + i, p, i === 0 ? head : js[i - 1])));
    const radii = [0.03, 0.022, 0.015, 0.008];
    for (let i = 0; i < 3; i++) seg(pts[i], pts[i + 1], radii[i], radii[i + 1], C.wood, js[i], 6);
    // moss collar at the base
    blob([s * 0.06, 1.75, 0.7], [0.04, 0.025, 0.04], C.mossLight, head, 0);
    blob(pts[1], [0.026, 0.02, 0.026], C.moss, js[1], 0);
    // tines
    const tines = [
      { from: 1, to: [s * 0.13, 2.02, 0.78], r: 0.014 },
      { from: 2, to: [s * 0.34, 2.12, 0.66], r: 0.012 },
      { from: 2, to: [s * 0.17, 2.17, 0.47], r: 0.01 },
      { from: 1, to: [s * 0.24, 1.96, 0.72], r: 0.01 },
    ];
    const tips: { p: number[]; bone: any }[] = [{ p: pts[3], bone: js[2] }];
    tines.forEach((t) => {
      seg(pts[t.from], t.to, t.r, 0.004, C.woodDark, js[t.from], 5);
      tips.push({ p: t.to, bone: js[t.from] });
    });
    tips.forEach((t, i) => {
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1 + i;
        leaf(t.p, [Math.cos(a) * 0.8, 0.7, Math.sin(a) * 0.8], 0.06, 0.022, k === 0 && i % 2 ? C.leafAutumn : k % 2 ? C.leafLight : C.leaf, t.bone);
      }
      orb(V(t.p).add(new THREE.Vector3(0, 0.012, 0)).toArray(), i === 0 ? 0.022 : 0.014, i % 2 ? C.glowCyan : C.glow, t.bone);
    });
    // a tiny flower in the fork
    flower(V(pts[2]).add(new THREE.Vector3(0, 0.01, 0)).toArray(), [s * 0.4, 1, 0.3], 0.022, C.petalPink, js[2]);
  }

  // ---------------- tail ----------------
  blob([0, 1.15, -0.6], [0.05, 0.05, 0.06], C.fur, tail1, 0);
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + (i / 6) * 1.8;
    leaf([0, 1.17, -0.64], [Math.sin(a) * 0.7, 0.5 + Math.cos(a) * 0.3, -1], 0.12, 0.035, i % 3 === 0 ? C.leafAutumn : i % 2 ? C.leaf : C.leafLight, tail2);
  }
  blob([0, 1.13, -0.66], [0.035, 0.04, 0.04], C.spot, tail2, 0);

  // ---------------- legs ----------------
  const buildLeg = (names: string[], pts: number[][], parent: any, radii: number[], colors: string[], hipBlob: number[]) => {
    const js: any[] = [];
    pts.forEach((p, i) => js.push(J(names[i], p, i === 0 ? parent : js[i - 1], "leg")));
    blob(pts[0], hipBlob, C.fur, js[0], 1);
    for (let i = 0; i < pts.length - 2; i++) seg(pts[i], pts[i + 1], radii[i], radii[i + 1], colors[i], js[i], 6);
    // joint knuckles
    for (let i = 1; i < pts.length - 2; i++) blob(pts[i], [radii[i] * 1.1, radii[i] * 1.1, radii[i] * 1.1], colors[i], js[i], 0);
    const fet = pts[pts.length - 2];
    const ground = pts[pts.length - 1];
    const fb = js[pts.length - 2];
    // hoof
    seg([ground[0], 0, ground[2]], [fet[0], 0.11, fet[2]], 0.05, 0.034, C.hoof, fb, 6);
    seg([ground[0], 0.11, ground[2]], fet, 0.034, 0.03, C.leg, fb, 6);
    // moss sock with sprouts
    blob([fet[0], 0.13, fet[2]], [0.05, 0.03, 0.05], C.moss, fb, 1);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.2 + fet[0] * 10;
      leaf([fet[0] + Math.cos(a) * 0.03, 0.14, fet[2] + Math.sin(a) * 0.03], [Math.cos(a), 1.2, Math.sin(a)], 0.06, 0.018, k % 2 ? C.leafLight : C.leaf, fb);
    }
    // roots into the ground
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      const c = Math.cos(a), s = Math.sin(a);
      seg([ground[0] + c * 0.035, 0.03, ground[2] + s * 0.035], [ground[0] + c * 0.12, -0.008, ground[2] + s * 0.12], 0.012, 0.004, C.woodDark, fb, 4);
    }
    return js;
  };

  for (const s of [-1, 1]) {
    const L = s > 0 ? "L" : "R";
    const x = s * 0.15;
    buildLeg(
      ["shoulder" + L, "elbow" + L, "wrist" + L, "frontFetlock" + L, "frontHoof" + L],
      [[x, 1.0, 0.36], [s * 0.16, 0.66, 0.42], [s * 0.16, 0.36, 0.43], [s * 0.16, 0.12, 0.42], [s * 0.16, 0, 0.44]],
      chest,
      [0.075, 0.045, 0.034, 0.03],
      [C.fur, C.furDark, C.leg],
      [0.09, 0.15, 0.11]
    );
    buildLeg(
      ["hip" + L, "knee" + L, "hock" + L, "hindFetlock" + L, "hindHoof" + L],
      [[x, 1.0, -0.4], [s * 0.16, 0.68, -0.3], [s * 0.16, 0.4, -0.5], [s * 0.16, 0.12, -0.47], [s * 0.16, 0, -0.45]],
      hips,
      [0.09, 0.05, 0.034, 0.03],
      [C.fur, C.furDark, C.leg],
      [0.1, 0.17, 0.14]
    );
  }

  return b.root;
}
```