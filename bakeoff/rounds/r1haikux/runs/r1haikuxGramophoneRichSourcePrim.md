```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, mix, noise, paint, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Antique gramophone",
  description:
    "A walnut cabinet gramophone with a five-lobed, green-patinated brass morning-glory horn, a black record with a red label on a brass turntable, a silver tonearm, a wind-up crank and ball-and-claw feet.",
};

/** A five-petal rosette, 0..1 cover, repeating every `cell` metres: the pale floral inlay. */
function rosette(u: number, v: number, cell: number) {
  const x = u / cell;
  const y = v / cell;
  const du = x - Math.round(x);
  const dv = y - Math.round(y);
  const r = Math.hypot(du, dv);
  const reach = 0.26 + 0.16 * Math.cos(2.5 * Math.atan2(dv, du)) ** 2;
  const petal = smoothstep(reach + 0.03, reach - 0.03, r);
  const heart = smoothstep(0.1, 0.06, r);
  return petal * (1 - 0.6 * heart);
}

/**
 * A morning-glory bell along local +Y: a thin brass wall (outer and inner skin, closed at the throat and at the lip)
 * flaring from `neck` radius to `flare` radius, its last part opening into `lobes` scalloped petals.
 */
function bell(length: number, neck: number, flare: number, lobes: number, wall: number) {
  const N = 14;
  const M = 6 * lobes;
  const stations = Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N;
    const s = Math.min(1, Math.max(0, (t - 0.55) / 0.45));
    return {
      h: length * t,
      r: neck + (flare - neck) * t ** 2.6,
      lobe: 0.22 * s * s * (3 - 2 * s),
    };
  });
  // The closed wall as rings: the outer skin from throat to lip, then the inner skin back down to the throat.
  const rings = [
    ...stations.map((st) => ({ st, inner: false })),
    ...stations.map((_, k) => ({ st: stations[N - k], inner: true })),
  ];
  const points: THREE.Vector3[] = [];
  for (const { st, inner } of rings)
    for (let j = 0; j < M; j++) {
      const angle = (j / M) * Math.PI * 2;
      const petal = 2 * (0.5 + 0.5 * Math.cos(lobes * angle)) ** 1.2 - 1;
      const r = st.r * (1 + st.lobe * petal) - (inner ? wall : 0);
      points.push(new THREE.Vector3(r * Math.cos(angle), st.h, r * Math.sin(angle)));
    }
  const K = rings.length;
  const index: number[] = [];
  for (let q = 0; q < K; q++) {
    const q2 = (q + 1) % K;
    for (let j = 0; j < M; j++) {
      const j2 = (j + 1) % M;
      const a = q * M + j;
      const b = q2 * M + j;
      const c = q2 * M + j2;
      const d = q * M + j2;
      index.push(a, b, c, a, c, d);
    }
  }
  // Wind every face outward: test one face of the outer skin against its radial direction.
  const m = N >> 1;
  const p0 = points[m * M];
  const normal = new THREE.Vector3()
    .subVectors(points[(m + 1) * M], p0)
    .cross(new THREE.Vector3().subVectors(points[(m + 1) * M + 1], p0));
  if (normal.dot(new THREE.Vector3(p0.x, 0, p0.z)) < 0)
    for (let t = 0; t < index.length; t += 3) {
      const swap = index[t + 1];
      index[t + 1] = index[t + 2];
      index[t + 2] = swap;
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points.flatMap((v) => [v.x, v.y, v.z]), 3),
  );
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export default function gramophone() {
  const b = createBuilder({ name: "gramophone", paintSize: 1024 });

  // Paints: warm brass with green verdigris in blotches, walnut grain with a pale rosette inlay on the front panel,
  // and a black record with fine grooves.
  const brass = paint((p) => mix("#c9963f", "#6c9b84", 0.6 * smoothstep(0.56, 0.74, noise(p, 0.045, 7))));
  const walnutGrain = grain("#4a2b18", "#7b5130", { size: 0.02, axis: "x", seed: 3 });
  const walnut = paint((p, n) => {
    const wood = walnutGrain.at(p, n);
    if (n.z < 0.6 || Math.abs(p.x) >= 0.2 || p.y <= 0.14 || p.y >= 0.4) return wood;
    const edge = Math.min(0.2 - Math.abs(p.x), p.y - 0.14, 0.4 - p.y);
    return mix(wood, "#f0e6cc", Math.max(rosette(p.x, p.y, 0.075), smoothstep(0.012, 0.005, edge)));
  });
  const vinyl = paint((p, n) => {
    if (n.y < 0.5) return "#16120f";
    const groove = 0.25 * (0.5 + 0.5 * Math.sin(Math.hypot(p.x, p.z - 0.03) * 300));
    return mix("#0d0b0a", "#2c2723", groove);
  });
  const silver = "#c5cbd3";
  const black = "#26221f";
  const ivory = "#eadfc4";

  // Joints: a root cabinet, the horn, the tonearm pivot and the wind-up crank.
  b.joint("cabinet", { at: [0, 0, 0] });
  const throat = new THREE.Vector3(0, 0.66, -0.12);
  const LENGTH = 0.6;
  const mouth = throat.clone().addScaledVector(new THREE.Vector3(0, 0.38, 0.93).normalize(), LENGTH);
  b.joint("horn", { parent: "cabinet", at: throat, aim: mouth });
  b.joint("tonearm", { parent: "cabinet", at: [-0.2, 0.6, -0.1] });
  b.joint("crank", { parent: "cabinet", at: [0.27, 0.3, 0], role: "hinge" });

  // Cabinet: plinth, body, raised front panel, pilasters, cornice and turned finials, all walnut.
  b.part(new THREE.BoxGeometry(0.52, 0.03, 0.46), walnut, { bone: "cabinet", at: [0, 0.075, 0], name: "plinth" });
  b.part(new THREE.BoxGeometry(0.5, 0.35, 0.44), walnut, { bone: "cabinet", at: [0, 0.265, 0], name: "body" });
  b.part(new THREE.BoxGeometry(0.42, 0.28, 0.014), walnut, {
    bone: "cabinet",
    at: [0, 0.265, 0.227],
    name: "front panel",
  });
  b.part(new THREE.BoxGeometry(0.54, 0.035, 0.48), walnut, { bone: "cabinet", at: [0, 0.4575, 0], name: "cornice" });
  for (const x of [-0.24, 0.24])
    b.part(new THREE.BoxGeometry(0.035, 0.33, 0.02), walnut, {
      bone: "cabinet",
      at: [x, 0.265, 0.23],
      name: "pilaster",
    });
  for (const x of [-0.255, 0.255])
    for (const z of [-0.225, 0.225])
      b.part(new THREE.SphereGeometry(0.022, 14, 10), walnut, { bone: "cabinet", at: [x, 0.484, z], name: "finial" });

  // Ball-and-claw feet: a brass leg, a ball and three claws reaching the floor.
  const feet: Array<[number, number]> = [
    [-0.2, -0.16],
    [0.2, -0.16],
    [-0.2, 0.16],
    [0.2, 0.16],
  ];
  for (const [fx, fz] of feet) {
    b.part(new THREE.CylinderGeometry(0.013, 0.019, 0.04, 12), brass, { bone: "cabinet", at: [fx, 0.05, fz] });
    b.part(new THREE.SphereGeometry(0.02, 14, 10), brass, { bone: "cabinet", at: [fx, 0.03, fz] });
    for (let k = 0; k < 3; k++) {
      const phi = 0.4 + (k * 2 * Math.PI) / 3;
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      b.spike([fx + 0.013 * c, 0.026, fz + 0.013 * s], [fx + 0.044 * c, 0, fz + 0.044 * s], null, 0.0075, {
        color: brass,
        bone: "cabinet",
        name: "claw",
      });
    }
  }

  // Horn standard: a flanged brass pipe rising from the cabinet top into the throat.
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.01, 16), brass, {
    bone: "cabinet",
    at: [0, 0.4805, -0.17],
    name: "standard flange",
  });
  b.sweep(catmull([[0, 0.48, -0.17], [0, 0.565, -0.2], throat]), 0.017, {
    color: brass,
    bone: "cabinet",
    name: "standard",
  });

  // The morning-glory bell, built along its own axis from the throat to the mouth.
  b.part(bell(LENGTH, 0.018, 0.31, 5, 0.005), brass, { bone: "horn", at: throat, aim: mouth, name: "bell" });

  // Turntable: brass plate, black record with grooves, red label with a cream ring, and the spindle.
  b.part(new THREE.CylinderGeometry(0.16, 0.165, 0.012, b.segments(32)), brass, {
    bone: "cabinet",
    at: [0, 0.481, 0.03],
    name: "turntable",
  });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.006, b.segments(40)), vinyl, {
    bone: "cabinet",
    at: [0, 0.4905, 0.03],
    name: "record",
  });
  b.part(new THREE.CylinderGeometry(0.054, 0.054, 0.001, 24), "#e9d9a8", {
    bone: "cabinet",
    at: [0, 0.4941, 0.03],
    name: "label ring",
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.0015, 24), "#b3261e", {
    bone: "cabinet",
    at: [0, 0.4945, 0.03],
    name: "label",
  });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.026, 12), brass, {
    bone: "cabinet",
    at: [0, 0.508, 0.03],
    name: "spindle",
  });
  b.part(new THREE.SphereGeometry(0.008, 12, 8), brass, { bone: "cabinet", at: [0, 0.5205, 0.03], name: "spindle cap" });

  // Tonearm: a silver pillar, the arm swept over the record and a black headshell with its stylus.
  b.part(new THREE.CylinderGeometry(0.011, 0.014, 0.125, 14), silver, {
    bone: "cabinet",
    at: [-0.2, 0.5375, -0.1],
    name: "tonearm pillar",
  });
  b.sweep(
    catmull([
      [-0.2, 0.6, -0.1],
      [-0.17, 0.612, -0.03],
      [-0.12, 0.58, 0.03],
      [-0.085, 0.53, 0.072],
      [-0.07, 0.506, 0.09],
    ]),
    [0.008, 0.0055],
    { color: silver, bone: "tonearm", name: "tonearm" },
  );
  b.part(new THREE.BoxGeometry(0.034, 0.012, 0.024), black, {
    bone: "tonearm",
    at: [-0.07, 0.506, 0.09],
    name: "headshell",
  });
  b.spike([-0.07, 0.5, 0.09], [-0.07, 0.4945, 0.09], null, 0.0022, {
    color: silver,
    bone: "tonearm",
    name: "stylus",
  });

  // Wind-up crank on the left side: a brass boss on the case, an axle and a hinged handle with an ivory knob.
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 18), brass, {
    bone: "cabinet",
    at: [0.26, 0.3, 0],
    dir: [1, 0, 0],
    name: "crank boss",
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.025, 12), brass, {
    bone: "crank",
    at: [0.2825, 0.3, 0],
    dir: [1, 0, 0],
    name: "crank axle",
  });
  b.capsule([0.295, 0.3, 0], [0.295, 0.245, 0.042], 0.0055, { color: brass, bone: "crank", name: "crank arm" });
  b.part(new THREE.SphereGeometry(0.017, 14, 10), ivory, {
    bone: "crank",
    at: [0.295, 0.242, 0.045],
    name: "crank knob",
  });

  return b.root;
}
```