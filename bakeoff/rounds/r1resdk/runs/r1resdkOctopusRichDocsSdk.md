```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, offset, mottle, spots, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust octopus with a bumpy mottled mantle, golden bar-pupil eyes, a grumpy brow, eight curling suckered arms, and one arm holding an old brass key.",
};

const CORAL = "#e0714f";
const RUST = "#a8452b";
const PALE = "#f0b896";
const CREAM = "#f7e6c8";
const GOLD = "#f0b323";
const DARK = "#1a1210";
const BROW = "#8c3a26";

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const R = rng(5);

  const body = b.joint("body", { at: [0, 0.12, 0], role: "spine" });

  // coat: mottled coral/rust, paler spots, pale belly
  const base = mottle(CORAL, RUST, { size: 0.07, contrast: 0.8, seed: 3 });
  const spotted = spots(base, PALE, { size: 0.055, amount: 0.3, seed: 9 });
  const coat = countershade(spotted, PALE, { level: -0.5 });

  // skirt where arms join
  b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
    bone: body,
    at: [0, 0.13, 0],
    scale: [0.23, 0.13, 0.23],
  });

  // mantle
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.22, 0],
      [0, 0.36, -0.05],
      [0, 0.55, -0.13],
    ]),
    { parent: body, role: "spine", names: ["mantle1", "mantle2", "mantle3"] },
  );
  const mantleSweep = b.sweep(mantle, [0.15, 0.2, 0.21, 0.13, 0.03], { color: coat, sides: 12 });

  // bumps on the mantle
  const mSkin = b.surface(mantleSweep);
  for (const h of mSkin.scatter(110, { rng: R, minDist: 0.04, filter: (h) => h.n.y > -0.1 })) {
    const s = 0.7 + R() * 0.7;
    b.stick(new THREE.SphereGeometry(0.014, 5, 4), RUST, h, { embed: 0.5, scale: [s, s * 0.8, s], flat: true });
  }

  // eyes
  const center: [number, number, number] = [0, 0.33, -0.05];
  for (const s of [1, -1]) {
    const hit = b.surface(mantleSweep).around(center).at(s * 50, 8);
    if (!hit) continue;
    b.stick(new THREE.SphereGeometry(0.05, 10, 8), GOLD, hit, { embed: 0.5 });
    b.part(new THREE.BoxGeometry(0.058, 0.014, 0.008), DARK, {
      at: offset(hit, hit.n, 0.05),
      dir: hit.n,
      axis: "z",
    });
    // grumpy brow: inner end lower
    const browAt = offset(offset(hit, hit.n, 0.028), [0, 1, 0], 0.048);
    b.part(new THREE.SphereGeometry(1, 8, 5), BROW, {
      at: browAt,
      dir: hit.n,
      axis: "z",
      up: [-s * 0.5, 1, 0],
      scale: [0.065, 0.02, 0.035],
    });
  }

  // arms
  const sucker = new THREE.TorusGeometry(0.4, 0.17, 5, 8).rotateX(Math.PI / 2);
  const radii = [0.06, 0.046, 0.032, 0.017, 0.006];
  const addSuckers = (sw: ReturnType<typeof b.sweep>, t0: number, t1: number, n: number) => {
    for (let k = 0; k < n; k++) {
      const t = t0 + ((t1 - t0) * k) / (n - 1);
      for (const ang of [115, 245]) {
        const p = sw.at(t, ang);
        const s = p.radius * 0.62;
        b.stick(sucker, CREAM, p, { embed: 0.3, scale: [s, s, s], flat: true });
      }
    }
  };

  const offs = [0, 0.12, 0.4, 0.8, 1.3];
  let keyBone: any = null;
  let K = new THREE.Vector3();

  for (let i = 0; i < 8; i++) {
    const a = ((30 + 45 * i) * Math.PI) / 180;
    let pts: number[][];
    if (i === 0) {
      const o = [Math.sin(a), Math.cos(a)];
      const tv = [o[1], -o[0]];
      const kr = 0.58;
      const ky = 0.62;
      K = new THREE.Vector3(o[0] * kr, ky, o[1] * kr);
      pts = [
        [o[0] * 0.16, 0.07, o[1] * 0.16],
        [o[0] * 0.36, 0.12, o[1] * 0.36],
        [o[0] * 0.5, 0.3, o[1] * 0.5],
      ];
      const coil: [number, number][] = [
        [180, -0.1],
        [270, -0.06],
        [0, -0.02],
        [90, 0.02],
        [180, 0.06],
      ];
      for (const [deg, dy] of coil) {
        const th = (deg * Math.PI) / 180;
        const c = Math.cos(th) * 0.03;
        const sn = Math.sin(th) * 0.03;
        pts.push([K.x + o[0] * c + tv[0] * sn, ky + dy, K.z + o[1] * c + tv[1] * sn]);
      }
    } else {
      const curl = (i % 2 ? 1 : -1) * (0.9 + 0.5 * R());
      const sc = 0.9 + 0.2 * R();
      const rs = [0.16, 0.34, 0.52, 0.7, 0.86].map((r, j) => (j === 0 ? r : r * sc));
      const ys = [0.07, 0.05, 0.036, 0.022, 0.012];
      if (i % 2) {
        ys[3] = 0.05;
        ys[4] = 0.11;
      }
      pts = rs.map((r, j) => {
        const ang = a + curl * offs[j];
        return [r * Math.sin(ang), ys[j], r * Math.cos(ang)];
      });
    }
    const ch = b.chain(`arm${i}`, catmull(pts), { parent: body, role: "tentacle" });
    const sw = b.sweep(ch, radii, { color: coat, sides: 8 });
    addSuckers(sw, 0.1, i === 0 ? 0.78 : 0.88, i === 0 ? 8 : 11);
    // bumps along the top
    for (const h of b.surface(sw).scatter(7, { rng: R, minDist: 0.05, filter: (h) => h.n.y > 0.3 })) {
      b.stick(new THREE.SphereGeometry(0.01, 5, 4), RUST, h, { embed: 0.5, flat: true });
    }
    if (i === 0) keyBone = ch.joints[ch.joints.length - 1];
  }

  // the old brass key
  const BRASS = mottle("#c8962e", "#5f8f6e", { size: 0.03, contrast: 0.9, seed: 2 });
  const kp = (dx: number, dy: number, dz = 0): [number, number, number] => [K.x + dx, K.y + dy, K.z + dz];
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 8), BRASS, { bone: keyBone, at: kp(0, 0.02) });
  b.part(new THREE.TorusGeometry(0.045, 0.012, 6, 12), BRASS, { bone: keyBone, at: kp(0, 0.2) });
  b.part(new THREE.TorusGeometry(0.02, 0.01, 5, 8).rotateX(Math.PI / 2), BRASS, { bone: keyBone, at: kp(0, 0.145) });
  b.part(new THREE.BoxGeometry(0.05, 0.022, 0.016), BRASS, { bone: keyBone, at: kp(0.03, -0.1) });
  b.part(new THREE.BoxGeometry(0.035, 0.022, 0.016), BRASS, { bone: keyBone, at: kp(0.024, -0.065) });

  return b.root;
}
```