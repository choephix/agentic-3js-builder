import * as THREE from "three";
import { createBuilder, limb, offset } from "../../../../src/index";
import { catmull, spiral } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Clockwork Terrier",
  description: "Wind-up brass and copper terrier with riveted plates, chest gears, winding key, spring legs and tail, leather ears, green lens eyes and a red collar with tag.",
};

const BRASS = "#c9a227";
const BRASS2 = "#e3c458";
const COPPER = "#b8663a";
const DARK = "#2a2420";
const GREEN = "#4fe08a";
const LEATHER = "#7b4a2a";
const RED = "#c0262d";
const STEEL = "#8a8f94";

export default function build() {
  const b = createBuilder({ name: "clockworkTerrier" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.34, -0.2], dir: [0, 0.1, 1] });
  const spine = b.chain("spine", catmull([[0, 0.34, -0.2], [0, 0.36, 0], [0, 0.37, 0.2]]), {
    parent: hips, count: 2, role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.37, 0.2], [0, 0.45, 0.25], [0, 0.54, 0.29]]), {
    parent: spine.joints[1], count: 2, role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.54, 0.29], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.53, 0.37], aim: [0, 0.53, 0.52], role: "jaw" });
  const key = b.joint("key", { parent: spine.joints[0], at: [0, 0.47, -0.02], dir: [0, 1, 0], role: "hinge" });

  // ---------- torso ----------
  b.sweep(spine, (t) => [0.105 + 0.01 * t, 0.115 + 0.005 * t], {
    color: BRASS, section: { ngon: 8 },
  });
  b.sweep(neck, [0.075, 0.06], { color: BRASS, section: { ngon: 8 } });

  const sB = spine.joints[0];
  const sC = spine.joints[1];
  // plates
  b.part(new THREE.BoxGeometry(0.15, 0.016, 0.22), COPPER, { bone: sB, at: [0, 0.478, 0.0] });
  b.part(new THREE.BoxGeometry(0.17, 0.014, 0.12), COPPER, { bone: sB, at: [0, 0.462, -0.2] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.15, 0.2), COPPER, { bone: sB, at: [s * 0.103, 0.35, -0.12] });
    b.part(new THREE.BoxGeometry(0.01, 0.04, 0.2), BRASS2, { bone: sB, at: [s * 0.106, 0.28, -0.12] });
  }
  b.part(new THREE.BoxGeometry(0.15, 0.012, 0.3), COPPER, { bone: sB, at: [0, 0.248, 0.0] });

  // rivets
  const rivets: THREE.BufferGeometry[] = [];
  const addR = (x: number, y: number, z: number) =>
    rivets.push(new THREE.SphereGeometry(0.008, 6, 4).translate(x, y, z));
  for (const x of [-0.06, 0.06]) for (const z of [-0.09, -0.03, 0.03, 0.09]) addR(x, 0.488, z);
  for (const x of [-0.07, 0.07]) for (const z of [-0.25, -0.15]) addR(x, 0.47, z);
  for (const s of [1, -1])
    for (const y of [0.30, 0.40]) for (const z of [-0.2, -0.12, -0.04]) addR(s * 0.11, y, z);
  b.part(mergeGeometries(rivets)!, BRASS2, { bone: sB, at: [0, 0, 0] });

  // chest gears
  const gear = (s: number, y: number, z: number, r: number, col: string, tw: number) => {
    const g1 = new THREE.CylinderGeometry(r, r, 0.008, 6);
    const g2 = new THREE.CylinderGeometry(r, r, 0.008, 6).rotateY(Math.PI / 6 + tw);
    const d = [s, 0, 0] as [number, number, number];
    b.part(g1, col, { bone: sC, at: [s * 0.108, y, z], dir: d });
    b.part(g2, col, { bone: sC, at: [s * 0.108, y, z], dir: d });
    b.part(new THREE.CylinderGeometry(r * 0.35, r * 0.35, 0.014, 8), DARK, { bone: sC, at: [s * 0.11, y, z], dir: d });
  };
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 12), DARK, { bone: sC, at: [s * 0.1, 0.355, 0.14], dir: [s, 0, 0] });
    b.part(new THREE.TorusGeometry(0.06, 0.009, 5, 14), BRASS2, { bone: sC, at: [s * 0.108, 0.355, 0.14], dir: [s, 0, 0], axis: "z" });
    gear(s, 0.37, 0.125, 0.035, COPPER, 0);
    gear(s, 0.335, 0.168, 0.026, BRASS2, 0.2);
    gear(s, 0.332, 0.108, 0.02, STEEL, 0.1);
  }
  // chest front plate
  b.part(new THREE.BoxGeometry(0.13, 0.12, 0.012), COPPER, { bone: sC, at: [0, 0.36, 0.215] });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS2, { bone: sC, at: [0, 0.36, 0.225] });

  // ---------- winding key ----------
  b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.02, 8), BRASS2, { bone: key, at: [0, 0.48, -0.02] });
  b.rod([0, 0.48, -0.02], [0, 0.6, -0.02], 0.01, { bone: key, color: BRASS2 });
  b.extrude(
    [[-0.012, 0], [-0.07, 0.01], [-0.075, 0.06], [-0.025, 0.065], [-0.012, 0.03],
     [0.012, 0.03], [0.025, 0.065], [0.075, 0.06], [0.07, 0.01], [0.012, 0]],
    { at: [0, 0.59, -0.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: COPPER, bone: key },
  );

  // ---------- head ----------
  b.part(new THREE.BoxGeometry(0.16, 0.14, 0.15), BRASS, { bone: head, at: [0, 0.6, 0.31] });
  b.frustumBox([0, 0.575, 0.37], [0, 0.565, 0.53], [0.1, 0.075], [0.085, 0.06], { bone: head, color: BRASS2 });
  b.part(new THREE.BoxGeometry(0.05, 0.03, 0.04), DARK, { bone: head, at: [0, 0.585, 0.54] });
  b.frustumBox([0, 0.522, 0.37], [0, 0.522, 0.51], [0.075, 0.028], [0.065, 0.024], { bone: jaw, color: COPPER });
  for (const s of [1, -1]) {
    // teeth
    b.spike([s * 0.025, 0.536, 0.5], [0, 1, 0], 0.02, 0.007, { bone: jaw, color: "#f3ecd8", sides: 4 });
    // eyes
    b.part(new THREE.SphereGeometry(0.027, 8, 6), GREEN, { bone: head, at: [s * 0.05, 0.64, 0.388] });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), BRASS2, { bone: head, at: [s * 0.05, 0.64, 0.384] });
    b.part(new THREE.BoxGeometry(0.06, 0.012, 0.03), COPPER, { bone: head, at: [s * 0.05, 0.678, 0.385] });
    // ear
    const side = s > 0 ? "L" : "R";
    const ear = b.chain(`ear${side}`, catmull([[s * 0.07, 0.67, 0.27], [s * 0.11, 0.65, 0.255], [s * 0.13, 0.58, 0.25]]), {
      parent: head, count: 2,
    });
    b.sweep(ear, [0.032, 0.02], { color: LEATHER, section: "box", caps: "flat" });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BRASS2, { bone: ear.joints[0], at: [s * 0.075, 0.665, 0.27] });
  }

  // ---------- collar ----------
  const band = b.ring(neck.at(0.5), { count: 10, radius: 0.088 });
  b.sweep(catmull(band.items, { closed: true }), 0.014, { color: RED, bone: neck.joints[0], sides: 6 });
  b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.007, 10), BRASS2, band.items[5], { bone: neck.joints[0], embed: 0.3 });
  b.stick(new THREE.CylinderGeometry(0.012, 0.012, 0.009, 8), COPPER, band.items[5], { bone: neck.joints[0], embed: -0.2 });

  // ---------- legs ----------
  const legs: [string, number, number, number, number, THREE.Vector3[] | null, any, number[]][] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const specs = [
      { p: "f", root: [s * 0.085, 0.3, 0.17], foot: [s * 0.085, 0.04, 0.2], par: sC, bend: [0, 0, -1] },
      { p: "h", root: [s * 0.085, 0.31, -0.2], foot: [s * 0.085, 0.04, -0.23], par: hips, bend: [0, 0, 1] },
    ];
    for (const sp of specs) {
      const pts = limb(sp.root, sp.foot, [0.15, 0.15], [sp.bend]);
      const leg = b.chain(`${sp.p}leg${side}`, pts, {
        parent: sp.par,
        names: [`${sp.p}hip${side}`, `${sp.p}knee${side}`, `${sp.p}ankle${side}`],
        role: "leg",
      });
      b.part(new THREE.SphereGeometry(0.05, 8, 6), COPPER, { bone: leg.joints[0], at: pts[0] });
      b.capsule(pts[0], pts[1], 0.032, { bone: leg.joints[0], color: BRASS, sides: 8 });
      b.part(new THREE.SphereGeometry(0.03, 8, 6), COPPER, { bone: leg.joints[1], at: pts[1] });
      b.rod(pts[1], pts[2], 0.014, { bone: leg.joints[1], color: STEEL, sides: 6 });
      const axis = pts[2].clone().sub(pts[1]).normalize().toArray();
      const coil = spiral(pts[1], offset(pts[1], [1, 0, 0], 0.032), axis as [number, number, number], {
        turns: 5, pitch: 0.03,
      });
      b.sweep(coil, 0.006, { bone: leg.joints[1], color: COPPER, sides: 5 });
      b.part(new THREE.BoxGeometry(0.065, 0.04, 0.1), BRASS, { bone: leg.tip!, at: [s * 0.085, 0.02, pts[2].z + 0.02] });
      b.part(new THREE.BoxGeometry(0.067, 0.012, 0.03), COPPER, { bone: leg.tip!, at: [s * 0.085, 0.04, pts[2].z + 0.05] });
    }
  }

  // ---------- spring tail ----------
  const tail = b.chain("tail", catmull([[0, 0.4, -0.27], [0, 0.47, -0.315], [0, 0.54, -0.36]]), {
    parent: hips, count: 2, role: "tail",
  });
  b.sweep(tail, 0.01, { color: STEEL, sides: 6 });
  const dir = new THREE.Vector3(0, 0.7, -0.45).normalize().toArray() as [number, number, number];
  const coil = spiral([0, 0.4, -0.27], [0.035, 0.4, -0.27], dir, { turns: 6, pitch: 0.035 });
  b.sweep(coil, 0.007, { bone: tail.joints[0], color: COPPER, sides: 5 });
  b.part(new THREE.SphereGeometry(0.025, 8, 6), BRASS2, { bone: tail.joints[1], at: [0, 0.6, -0.4] });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), COPPER, { bone: hips, at: [0, 0.4, -0.27] });

  return b.root;
}
