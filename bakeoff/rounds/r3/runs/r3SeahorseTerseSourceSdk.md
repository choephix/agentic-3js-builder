```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  interpolate,
  paint,
  mix,
  noise,
  smoothstep,
} from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description:
    "A stylized upright seahorse with a curled prehensile tail, ringed bony body, coronet, dorsal and pectoral fins, and a hinged lower jaw.",
};

const GOLD = "#e9a23b";
const CREAM = "#f8e0a6";
const BROWN = "#9a4f1c";
const FIN = "#f6cf7e";

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---- skeleton -------------------------------------------------------
  b.joint("root", { at: [0, 0.09, 0], dir: [0, 1, 0] });

  const spinePts: Array<[number, number, number]> = [
    [0, 0.15, 0.012],
    [0, 0.13, 0.0],
    [0, 0.105, 0.006],
    [0, 0.08, 0.004],
    [0, 0.058, -0.01],
    [0, 0.04, -0.028],
    [0, 0.022, -0.034],
    [0, 0.009, -0.022],
    [0, 0.005, -0.004],
    [0, 0.013, 0.008],
    [0, 0.026, 0.004],
    [0, 0.024, -0.008],
  ];
  const path = catmull(spinePts);
  const spine = b.chain("spine", path.slice(0, 0.5), {
    parent: "root",
    count: 5,
    names: ["neck1", "neck2", "spine1", "spine2", "spine3"],
    role: "spine",
  });
  const tail = b.chain("tail", path.slice(0.5, 1), { parent: spine, count: 6, role: "tail" });

  b.joint("head", { parent: "neck1", at: [0, 0.148, 0.01], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.1395, 0.05], dir: [0, 0.05, 1], role: "jaw" });
  b.joint("dorsalFin", { parent: "spine2", at: [0, 0.09, -0.018], dir: [0, 0, -1], role: "fan" });
  b.joint("pectoralL", { parent: "neck2", at: [0.017, 0.118, -0.006], dir: [1, 0, 0], role: "fan" });
  b.joint("pectoralR", { parent: "neck2", at: [-0.017, 0.118, -0.006], dir: [-1, 0, 0], role: "fan" });

  // ---- body -----------------------------------------------------------
  const ts = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.72, 0.85, 0.95, 1];
  const rs = [0.0085, 0.011, 0.02, 0.022, 0.0175, 0.0125, 0.0085, 0.0055, 0.003, 0.0015];
  const coat = paint((p, n, s) => {
    const t = s[0];
    const ringPos = (t * 54) % 1;
    const belly = smoothstep(0.1, 0.7, n.z) * (t < 0.55 ? 1 : 0.2);
    let c = mix(GOLD, CREAM, belly * 0.85);
    if (Math.abs(ringPos - 0.5) < 0.13) c = mix(c, BROWN, 0.65);
    const sp = noise(p, 0.006, 3);
    c = mix(c, BROWN, smoothstep(0.62, 0.78, sp) * 0.45);
    return c;
  });
  const body = b.sweep(
    path,
    (t) => {
      const r = interpolate(ts, rs, t);
      return [r * 0.85, r];
    },
    { color: coat, bone: [spine, tail], sides: 10, caps: "round", name: "body" },
  );

  const sph = (r: number, color: string, at: number[], scale: number[], bone: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: at as [number, number, number], scale: scale as [number, number, number], bone });

  // ---- head -----------------------------------------------------------
  sph(1, GOLD, [0, 0.153, 0.014], [0.0135, 0.016, 0.019], "head");
  b.rod([0, 0.15, 0.025], [0, 0.143, 0.066], [0.0085, 0.0045], { color: "#e2953a", bone: "head", sides: 8, name: "snout" });
  b.rod([0, 0.1395, 0.05], [0, 0.1415, 0.064], [0.0035, 0.0022], { color: BROWN, bone: "jaw", sides: 6, name: "lowerJaw" });
  // eyes
  for (const sx of [1, -1]) {
    sph(0.0052, "#f3c24a", [sx * 0.0115, 0.1575, 0.023], [1, 1, 1], "head");
    sph(0.0036, "#15110e", [sx * 0.0145, 0.1575, 0.0245], [0.8, 1, 1], "head");
    sph(0.0009, "#ffffff", [sx * 0.0172, 0.159, 0.0262], [1, 1, 1], "head");
    // brow ridge
    b.part(new THREE.BoxGeometry(0.005, 0.0022, 0.009), BROWN, {
      at: [sx * 0.0105, 0.1635, 0.02],
      rotation: [0, 0, sx * -20],
      bone: "head",
    });
    // cheek spine
    b.spike([sx * 0.011, 0.146, 0.01], [sx * 0.018, 0.138, -0.003], null, 0.0026, { color: BROWN, bone: "head", sides: 5 });
  }
  // coronet
  b.spike([0, 0.166, 0.009], [0, 0.184, -0.006], null, 0.0032, { color: BROWN, bone: "head", sides: 5 });
  for (const sx of [1, -1]) {
    b.spike([sx * 0.005, 0.164, 0.012], [sx * 0.011, 0.177, 0.0], null, 0.0027, { color: "#c2702a", bone: "head", sides: 5 });
    b.spike([sx * 0.008, 0.16, 0.004], [sx * 0.015, 0.168, -0.008], null, 0.0022, { color: "#c2702a", bone: "head", sides: 5 });
  }
  // nostril dots
  for (const sx of [1, -1]) sph(0.0009, "#3a1c0c", [sx * 0.003, 0.1465, 0.058], [1, 1, 1], "head");

  // ---- fins -----------------------------------------------------------
  const dorsal: Array<[number, number]> = [
    [-0.012, 0.104],
    [-0.034, 0.114],
    [-0.05, 0.102],
    [-0.05, 0.084],
    [-0.04, 0.068],
    [-0.022, 0.064],
  ];
  b.extrude(dorsal, { at: [0, 0, 0], thickness: 0.0012, color: FIN, bone: "dorsalFin", name: "dorsalFin" });
  for (const [z, y] of [
    [-0.034, 0.113],
    [-0.048, 0.101],
    [-0.049, 0.085],
    [-0.04, 0.069],
  ]) {
    b.rod([0, 0.088, -0.016], [0, y, z], 0.0007, { color: "#d58a2c", bone: "dorsalFin", sides: 4 });
  }
  const pect: Array<[number, number]> = [
    [0, 0.002],
    [-0.012, 0.011],
    [-0.02, 0.004],
    [-0.018, -0.006],
    [-0.008, -0.012],
    [0, -0.005],
  ];
  b.extrude(pect, { at: [0.0185, 0.118, -0.004], thickness: 0.001, color: FIN, bone: "pectoralL", name: "pectoralL" });
  b.extrude(pect, { at: [-0.0185, 0.118, -0.004], thickness: 0.001, color: FIN, bone: "pectoralR", name: "pectoralR" });

  // ---- ridges along back and belly -----------------------------------
  const skin = b.surface(body);
  const back = new THREE.ConeGeometry(0.003, 0.009, 5);
  for (let y = 0.034; y <= 0.135; y += 0.0085) {
    const hit = skin.ray([0, y, -0.2], [0, 0, 1]);
    if (hit) b.stick(back, y > 0.105 ? "#c2702a" : BROWN, hit, { embed: 0.25 });
  }
  const belly = new THREE.ConeGeometry(0.0022, 0.005, 4);
  for (let y = 0.062; y <= 0.128; y += 0.0075) {
    const hit = skin.ray([0, y, 0.2], [0, 0, -1]);
    if (hit) b.stick(belly, "#fff0c8", hit, { embed: 0.3 });
  }
  // side bony studs on the trunk
  const stud = new THREE.SphereGeometry(0.0026, 6, 4);
  for (const sx of [1, -1])
    for (let y = 0.07; y <= 0.125; y += 0.011) {
      const hit = skin.ray([sx * 0.2, y, 0.004], [-sx, 0, 0]);
      if (hit) b.stick(stud, "#c2702a", hit, { embed: 0.4 });
    }

  return b.root;
}
```