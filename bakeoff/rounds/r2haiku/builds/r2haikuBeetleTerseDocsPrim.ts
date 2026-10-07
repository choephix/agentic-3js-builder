import * as THREE from "three";
import { createBuilder, catmull, grain, limb } from "../../../../src/index";

export const meta = {
  name: "stag beetle",
  description: "A male stag beetle: glossy brown elytra, a red-brown pronotum, and branched antler-like jaws.",
};

// Design numbers are written in rough centimetre-scale units. K converts them to metres,
// so the beetle (jaws included) is about 7.5 cm long.
const K = 0.4;
const P = (x: number, y: number, z: number): [number, number, number] => [x * K, y * K, z * K];
const S = (v: number) => v * K;
const mirror = (s: number, x: number, y: number, z: number): [number, number, number] => P(s * x, y, z);
const unit = (u = 12, v = 8) => new THREE.SphereGeometry(1, u, v);

const ELY_A = "#4a2c18";
const ELY_B = "#21130a";
const SEAM = "#120a05";
const PRONO = "#6b3319";
const HEAD = "#3a2316";
const ABD = "#1d120a";
const EYE = "#0d0a08";
const MAND = "#7a3d1d";
const MAND_TIP = "#1d130c";
const LEG = "#2e1d12";
const ANT = "#3a2316";
const CLUB = "#5a3420";

export default function build() {
  const b = createBuilder({ name: "stag-beetle" });

  // Skeleton: body at the centre of the beetle, head forward of the pronotum.
  const body = b.joint("body", { at: P(0, 18, 0) });
  const head = b.joint("head", { parent: body, at: P(0, 17.5, 46) });

  // Wing cases: two glossy ellipsoids with a fine grain running along the length.
  const elytra = grain(ELY_A, ELY_B, { size: 0.006, axis: "z" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 14, 8), elytra, {
      bone: body,
      at: mirror(s, 9.5, 14.5, -12),
      scale: [S(10.5), S(12.5), S(34)],
      flat: true,
    });
  }
  // Central seam where the two wing cases meet.
  b.part(new THREE.BoxGeometry(S(1.4), S(8), S(50)), SEAM, { bone: body, at: P(0, 17, -12) });

  // Pronotum: the domed shield behind the head.
  b.part(unit(), PRONO, { bone: body, at: P(0, 18.5, 26), scale: [S(17.5), S(10.5), S(13.5)] });

  // Abdomen tip poking out behind the wing cases.
  b.part(unit(), ABD, { bone: body, at: P(0, 10.5, -48), scale: [S(11), S(8.5), S(20)] });

  // Neck joining pronotum and head.
  b.part(unit(), HEAD, { bone: body, at: P(0, 17.5, 42), scale: [S(8), S(7.5), S(7)] });

  // Head: a blocky block with a flatter front plate.
  b.part(new THREE.BoxGeometry(S(18.5), S(12.5), S(17)), HEAD, { bone: head, at: P(0, 17.5, 54.5) });
  b.part(new THREE.BoxGeometry(S(12), S(7), S(4)), HEAD, { bone: head, at: P(0, 14.8, 62.5) });

  // Compound eyes on the sides of the head.
  for (const s of [1, -1]) {
    b.part(unit(8, 6), EYE, {
      bone: head,
      at: mirror(s, 9.8, 18.5, 54),
      scale: [S(3.5), S(4.5), S(5.5)],
    });
  }

  // Branched mandibles: long curved jaws with two inner teeth each.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const jawPath = catmull([
      mirror(s, 4.5, 17.5, 58),
      mirror(s, 9.5, 16.8, 72),
      mirror(s, 10.8, 16.2, 94),
      mirror(s, 8.2, 15.8, 113),
      mirror(s, 2.2, 15.8, 120),
    ]);
    const jaw = b.chain(`mand${L}`, jawPath, {
      parent: head,
      role: "jaw",
      names: [`mand${L}1`, `mand${L}2`, `mand${L}3`, `mand${L}4`],
    });
    b.sweep(jaw, [S(4.6), S(1.6)], { color: MAND });

    // Inner teeth, pointing up and across the gap between the jaws.
    b.spike(jaw.at(0.45), [-s * 0.6, 0.7, 0.3], S(7), S(2.8), { color: MAND_TIP });
    b.spike(jaw.at(0.22), [-s * 0.5, 0.8, -0.2], S(5), S(2.2), { color: MAND_TIP });
  }

  // Elbowed antennae ending in a three-plate club.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const antPath = catmull([
      mirror(s, 4, 21.5, 60),
      mirror(s, 8, 25.5, 66),
      mirror(s, 13, 24.5, 72),
      mirror(s, 17, 22.5, 78),
    ]);
    const ant = b.chain(`ant${L}`, antPath, {
      parent: head,
      names: [`ant${L}1`, `ant${L}2`, `ant${L}3`],
    });
    b.sweep(ant, [S(1.0), S(0.6)], { color: ANT });
    const clubs: [number, number, number][] = [
      mirror(s, 18.5, 22.5, 79),
      mirror(s, 20.5, 22.0, 77),
      mirror(s, 20.0, 23.0, 80.5),
    ];
    for (const c of clubs) {
      b.part(unit(8, 6), CLUB, { bone: head, at: c, scale: [S(3.2), S(1.6), S(2.4)] });
    }
  }

  // Six jointed legs, each planted on the floor with a knee bulge.
  const legs = [
    { tag: "F", hipZ: 34, footX: 44, footZ: 50 },
    { tag: "M", hipZ: 0, footX: 42, footZ: 0 },
    { tag: "H", hipZ: -34, footX: 40, footZ: -46 },
  ];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    for (const leg of legs) {
      const hip = mirror(s, 14.5, 17.5, leg.hipZ);
      const foot = [s * leg.footX * K, S(1.3), leg.footZ * K];
      const pts = limb(hip, foot, [S(12.5), S(13.5), S(11)], [
        [s * 0.4, 1, 0],
        [s * 0.4, 1, 0],
      ]);
      const chain = b.chain(`leg${leg.tag}${L}`, pts, {
        parent: body,
        role: "leg",
        names: [`coxa${leg.tag}${L}`, `femur${leg.tag}${L}`, `tibia${leg.tag}${L}`, `tarsus${leg.tag}${L}`],
      });
      b.sweep(chain, [S(2.9), S(1.3)], { color: LEG });
      b.part(unit(6, 4), LEG, {
        bone: chain.joints[1],
        at: pts[1],
        scale: [S(3.4), S(3.4), S(3.4)],
      });
    }
  }

  return b.root;
}
