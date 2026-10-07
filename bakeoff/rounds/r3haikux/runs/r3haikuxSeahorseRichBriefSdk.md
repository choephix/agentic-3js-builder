```ts
import * as THREE from "three";
import { createBuilder, catmull, lerp } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description:
    "A sunny yellow seahorse with ridged armour and thin dark pinstripes, a crown of spikes, a long tube snout, big curious eyes and a pale dorsal fin, its curled tail wrapped around a strand of seagrass.",
};

type V = [number, number, number];

const BODY = "#ffd23c";
const AMBER = "#f2a01e";
const PIN = "#213549";
const SPOT = "#fff8e6";
const EYE = "#fffdf5";
const PUPIL = "#101a25";
const JAW = "#ffb53a";
const FIN = "#9ff2e3";
const FIN_RAY = "#2b7f8c";
const GRASS = "#2d9a4b";
const LEAF = "#67cc76";
const SAND = "#e6c98a";
const PEBBLE = "#a48e68";

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ── Skeleton ──────────────────────────────────────────────────────────
  // The spine (trunk and neck) is the root. Head, snout, jaw and tail hang from it.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.1, -0.004],
      [0, 0.122, 0.004],
      [0, 0.146, 0.016],
      [0, 0.168, 0.02],
      [0, 0.186, 0.016],
    ]),
    { role: "spine" },
  );
  const body = b.sweep(spine, 0.021, { color: BODY });

  const head = b.chain(
    "head",
    [spine.at(1), [0, 0.206, 0.03], [0, 0.222, 0.04]],
    { role: "head" },
  );
  const skull = b.sweep(head, 0.024, { color: BODY });

  // Long tube snout, with a separate lower jaw tucked beneath it.
  const snout = b.chain(
    "snout",
    [head.at(0.5), [0, 0.203, 0.072], [0, 0.198, 0.104], [0, 0.192, 0.128]],
    { role: "head" },
  );
  b.sweep(snout, 0.0082, { color: BODY });

  const jaw = b.chain(
    "jaw",
    [head.at(0.4), [0, 0.193, 0.07], [0, 0.187, 0.097], [0, 0.182, 0.116]],
    { role: "jaw" },
  );
  b.sweep(jaw, 0.0056, { color: JAW });

  // ── Tail: two coils around the seagrass strand, then a flick outward ──
  const stemX = 0.03;
  const stemZ = -0.002;
  const coil: V[] = [];
  for (let k = 0; k <= 8; k++) {
    const a = Math.PI + (k * Math.PI) / 2;
    coil.push([
      stemX + 0.0165 * Math.cos(a),
      0.092 - k * 0.0075,
      stemZ + 0.0165 * Math.sin(a),
    ]);
  }
  coil.push([0.056, 0.024, 0.02]);

  const tail = b.chain("tail", catmull([spine.at(0.06), ...coil]), { role: "tail" });
  const tailBody = b.sweep(tail, 0.0075, { color: BODY });
  b.sweep(tailBody.line(70), 0.0019, { color: PIN });
  b.sweep(tailBody.line(250), 0.0019, { color: PIN });

  // ── Ridged armour and pinstripes on the body ──────────────────────────
  for (const t of [0.2, 0.29, 0.38, 0.47, 0.56, 0.65, 0.74, 0.83]) {
    b.ring(spine.at(t), { count: 10, radius: 0.0205 }, (at) => {
      b.part(new THREE.IcosahedronGeometry(0.0058, 0), AMBER, { at });
    });
  }
  for (const deg of [35, 115, 205, 295]) {
    b.sweep(body.line(deg), 0.0019, { color: PIN });
  }

  // ── White freckles ────────────────────────────────────────────────────
  const trunkSurf = b.surface(body);
  const trunkFreckles: V[] = [
    [-0.032, 0.116, 0.0],
    [-0.031, 0.13, 0.008],
    [-0.033, 0.142, 0.016],
    [-0.031, 0.157, 0.019],
    [-0.032, 0.171, 0.017],
    [-0.024, 0.122, 0.032],
    [0.006, 0.148, 0.04],
    [-0.009, 0.164, 0.042],
  ];
  for (const p of trunkFreckles) {
    b.stick(new THREE.SphereGeometry(0.0034, 7, 5), SPOT, trunkSurf.nearest(p));
  }

  // ── Head: eyes, freckles and crown ────────────────────────────────────
  const skullSurf = b.surface(skull);
  const headFreckles: V[] = [
    [-0.031, 0.196, 0.028],
    [-0.03, 0.2, 0.046],
    [-0.012, 0.19, 0.054],
  ];
  for (const p of headFreckles) {
    b.stick(new THREE.SphereGeometry(0.0034, 7, 5), SPOT, skullSurf.nearest(p));
  }

  // Big curious eyes: a white bulge on each side, with a dark pupil domed forward.
  for (const s of [1, -1]) {
    const eye = skullSurf.nearest([s * 0.04, 0.218, 0.05]);
    b.part(new THREE.SphereGeometry(0.0125, 12, 9), EYE, { at: eye });
    b.part(new THREE.SphereGeometry(0.0068, 9, 7), PUPIL, {
      at: lerp(eye, [s * 0.1, 0.218, 0.05], 0.12),
    });
  }

  // Little crown: six spikes in a ring on top of the head, splaying outward.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const len = i % 2 === 0 ? 0.019 : 0.013;
    const cone = new THREE.ConeGeometry(0.0042, len, 6);
    cone.translate(0, len / 2, 0);
    const tip = skullSurf.nearest([
      0.011 * Math.cos(a),
      0.27,
      0.038 + 0.011 * Math.sin(a),
    ]);
    b.stick(cone, AMBER, tip);
  }

  // ── Delicate fluttering dorsal fin ────────────────────────────────────
  const finBase: V[] = [
    [0, 0.11, -0.024],
    [0, 0.128, -0.016],
    [0, 0.148, -0.008],
    [0, 0.166, -0.005],
    [0, 0.182, -0.007],
    [0, 0.192, -0.012],
  ];
  const finEdge: V[] = [
    [0.005, 0.104, -0.036],
    [-0.006, 0.124, -0.05],
    [0.009, 0.146, -0.058],
    [-0.008, 0.166, -0.056],
    [0.007, 0.184, -0.04],
    [0.002, 0.196, -0.02],
  ];
  b.membrane(finBase, finEdge, { color: FIN });
  for (const k of [1, 2, 3, 4]) {
    b.sweep([finBase[k], finEdge[k]], 0.0011, { color: FIN_RAY });
  }

  // ── Seagrass strand, rising beside the belly ──────────────────────────
  const stem: V[] = [
    [stemX, 0.0, stemZ],
    [0.031, 0.1, stemZ],
    [0.032, 0.2, -0.003],
    [0.029, 0.28, -0.005],
    [0.024, 0.34, -0.008],
    [0.02, 0.37, -0.011],
  ];
  b.sweep(catmull(stem), 0.0055, { color: GRASS });

  // Two crossed ribbon blades give the strand its seagrass look.
  const widths = [0.0065, 0.0055, 0.003, 0];
  const blade = stem.slice(2);
  b.membrane(
    blade.map((p, i) => [p[0] - widths[i], p[1], p[2]]),
    blade.map((p, i) => [p[0] + widths[i], p[1], p[2]]),
    { color: LEAF },
  );
  b.membrane(
    blade.map((p, i) => [p[0], p[1], p[2] - widths[i]]),
    blade.map((p, i) => [p[0], p[1], p[2] + widths[i]]),
    { color: LEAF },
  );

  // ── Sandy patch and pebbles at the floor ──────────────────────────────
  const sand = new THREE.IcosahedronGeometry(0.065, 1);
  sand.scale(1, 0.14, 1);
  sand.translate(0, 0.003, 0);
  b.part(sand, SAND, { at: [0.012, 0, -0.014] });
  b.part(new THREE.IcosahedronGeometry(0.008, 0), PEBBLE, { at: [0.058, 0.004, 0.018] });
  b.part(new THREE.IcosahedronGeometry(0.006, 0), PEBBLE, { at: [-0.04, 0.003, -0.034] });

  return b.root;
}
```