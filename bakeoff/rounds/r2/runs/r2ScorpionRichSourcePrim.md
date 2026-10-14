```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Desert Scorpion",
  description:
    "Threatening amber scorpion with a high arched segmented tail, dark stinger, big forward pincers, eight legs and a cluster of black eyes.",
};

const AMBER = "#e29a22";
const AMBER2 = "#c97a10";
const LIGHT = "#f6c457";
const DARK = "#4a2209";
const TELSON = "#2a1209";
const STING = "#120605";
const EYE = "#050505";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const B = createBuilder({ name: "scorpion" });
  for (const c of [AMBER, AMBER2, LIGHT]) {
    const m = B.material(c);
    m.roughness = 0.25;
    m.metalness = 0.15;
  }
  for (const c of [DARK, TELSON, STING]) {
    const m = B.material(c);
    m.roughness = 0.3;
    m.metalness = 0.1;
  }
  const eyeM = B.material(EYE);
  eyeM.roughness = 0.08;
  eyeM.metalness = 0.3;

  const seg = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, color: string, bone: any, sides = 8) =>
    B.part(new THREE.CylinderGeometry(r1, r0, a.distanceTo(b), sides, 1), color, {
      at: a.clone().add(b).multiplyScalar(0.5),
      aim: b,
      bone,
    });
  const band = (at: THREE.Vector3, toward: THREE.Vector3, r: number, tube: number, bone: any, color = DARK) =>
    B.part(new THREE.TorusGeometry(r, tube, 5, 10), color, { at, aim: toward, axis: "z", bone });
  const ell = (c: THREE.Vector3, s: [number, number, number], color: string, bone: any, ws = 8, hs = 6) =>
    B.part(new THREE.SphereGeometry(1, ws, hs), color, { at: c, scale: s, bone });

  // ---- skeleton core
  const root = B.joint("root", { at: V(0, 0.025, 0.02), dir: [0, 0, 1] });
  const spine = B.chain("spine", [V(0, 0.025, 0.045), V(0, 0.025, 0), V(0, 0.025, -0.07)], {
    parent: root,
    role: "spine",
    names: ["spine1", "spine2"],
  });
  const abd = spine.joints[1];

  // ---- prosoma (head shield)
  ell(V(0, 0.026, 0.036), [0.027, 0.012, 0.033], AMBER, root, 9, 6);
  B.part(new THREE.BoxGeometry(0.036, 0.011, 0.02), AMBER2, { at: V(0, 0.024, 0.054), rotation: [-8, 0, 0], bone: root });
  ell(V(0, 0.036, 0.04), [0.009, 0.006, 0.011], DARK, root, 7, 5);
  for (const s of [1, -1]) {
    ell(V(s * 0.0038, 0.0405, 0.042), [0.003, 0.003, 0.003], EYE, root, 6, 5);
    const eyes = [
      [0.018, 0.0335, 0.052],
      [0.0198, 0.0325, 0.0455],
      [0.0205, 0.0315, 0.039],
    ];
    for (const [x, y, z] of eyes) ell(V(s * x, y, z), [0.0021, 0.0021, 0.0021], EYE, root, 6, 4);
    // shield ridge
    B.part(new THREE.BoxGeometry(0.004, 0.003, 0.03), DARK, { at: V(s * 0.012, 0.0375, 0.032), rotation: [0, s * 10, 0], bone: root });
  }
  band(V(0, 0.026, 0.005), V(0, 0.026, -0.02), 0.0215, 0.002, root);

  // ---- jaws (chelicerae): upper fixed, lower on a jaw joint
  const jaw = B.joint("jaw", { parent: root, at: V(0, 0.0175, 0.066), dir: [0, 0, 1], role: "jaw" });
  for (const s of [1, -1]) {
    B.part(new THREE.BoxGeometry(0.008, 0.006, 0.012), AMBER2, { at: V(s * 0.0055, 0.0235, 0.07), bone: root });
    seg(V(s * 0.0055, 0.0235, 0.075), V(s * 0.0035, 0.0215, 0.083), 0.0028, 0.0004, STING, root, 5);
    B.part(new THREE.BoxGeometry(0.0075, 0.004, 0.011), DARK, { at: V(s * 0.0048, 0.0175, 0.0715), bone: jaw });
    seg(V(s * 0.0048, 0.0175, 0.077), V(s * 0.0032, 0.0195, 0.0845), 0.0022, 0.0004, STING, jaw, 5);
  }

  // ---- mesosoma: 7 plates with dark joint bands
  for (let i = 0; i < 7; i++) {
    const z = -0.004 - i * 0.0102;
    const w = 0.0245 - i * 0.0016;
    const hh = 0.0115 - i * 0.0004;
    ell(V(0, 0.0255, z), [w, hh, 0.0078], i % 2 ? AMBER2 : AMBER, abd, 9, 6);
    ell(V(0, 0.0255, z - 0.0051), [w * 0.9, hh * 0.92, 0.0036], DARK, abd, 9, 5);
    B.part(new THREE.BoxGeometry(0.004, 0.0022, 0.008), LIGHT, { at: V(0, 0.0255 + hh * 0.95, z), bone: abd });
  }
  // underside / pectines
  for (const s of [1, -1])
    B.part(new THREE.ConeGeometry(0.0025, 0.012, 4), DARK, { at: V(s * 0.005, 0.0135, -0.004), rotation: [165, 0, 0], bone: root });

  // ---- tail (metasoma) arching over the back
  const tailPath = [V(0, 0.027, -0.072), V(0, 0.04, -0.104), V(0, 0.07, -0.124), V(0, 0.105, -0.108), V(0, 0.125, -0.072), V(0, 0.128, -0.035)];
  const tail = B.chain("tail", tailPath, {
    parent: abd,
    role: "tail",
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "stinger"],
  });
  const tr = [0.0112, 0.0102, 0.0095, 0.0088, 0.0082, 0.0076];
  const centre = V(0, 0.075, -0.07);
  for (let i = 0; i < 5; i++) {
    const a = tail.at(tail.ts[i]).at;
    const b = tail.at(tail.ts[i + 1]).at;
    const j = tail.joints[i];
    seg(a, b, tr[i], tr[i + 1], i % 2 ? AMBER2 : AMBER, j, 8);
    ell(a, [tr[i] * 1.05, tr[i] * 1.05, tr[i] * 1.05], DARK, j, 7, 5);
    band(a.clone().lerp(b, 0.06), b, tr[i] * 1.05, 0.0022, j);
    const mid = a.clone().lerp(b, 0.5);
    const out = mid.clone().sub(centre).normalize();
    for (const f of [0.3, 0.7]) {
      const p = a.clone().lerp(b, f);
      const o = p.clone().sub(centre).normalize();
      ell(p.clone().addScaledVector(o, tr[i] * 0.95), [0.0025, 0.0025, 0.0025], LIGHT, j, 5, 4);
    }
    void out;
  }
  // telson
  const st = tail.tip!;
  band(V(0, 0.128, -0.035), V(0, 0.126, -0.02), 0.0076, 0.002, tail.joints[4]);
  ell(V(0, 0.125, -0.024), [0.0088, 0.0098, 0.0125], TELSON, st, 8, 6);
  seg(V(0, 0.126, -0.014), V(0, 0.1245, -0.004), 0.0048, 0.0032, TELSON, st, 6);
  seg(V(0, 0.1245, -0.004), V(0, 0.108, 0.012), 0.0032, 0.0004, STING, st, 6);

  // ---- pincers & legs
  for (const S of [1, -1]) {
    const L = S > 0 ? "L" : "R";
    const p = [V(S * 0.014, 0.024, 0.062), V(S * 0.038, 0.024, 0.082), V(S * 0.038, 0.022, 0.11)];
    const palp = B.chain("palp" + L, p, {
      parent: root,
      role: "arm",
      names: [`palpA${L}`, `palpB${L}`, `hand${L}`],
    });
    const [j0, j1] = palp.joints;
    const hand = palp.tip!;
    seg(p[0], p[1], 0.0085, 0.0078, AMBER, j0);
    seg(p[1], p[2], 0.0085, 0.0105, AMBER, j1);
    ell(p[1], [0.0092, 0.0092, 0.0092], AMBER2, j0, 7, 5);
    band(p[1].clone(), p[2], 0.0092, 0.0022, j1);
    band(p[2].clone(), V(S * 0.038, 0.022, 0.13), 0.0108, 0.0024, j1);
    ell(V(S * 0.037, 0.022, 0.123), [0.0128, 0.0078, 0.0165], AMBER, hand, 8, 6);
    ell(V(S * 0.037, 0.0285, 0.12), [0.006, 0.003, 0.009], LIGHT, hand, 6, 4);
    // fixed finger
    const fa = V(S * 0.03, 0.022, 0.133);
    const fm = V(S * 0.0275, 0.022, 0.15);
    const ft = V(S * 0.0255, 0.022, 0.168);
    seg(fa, fm, 0.0062, 0.0042, AMBER, hand, 6);
    seg(fm, ft, 0.0042, 0.0006, DARK, hand, 6);
    // movable finger
    const jw = B.joint(`clawJaw${L}`, { parent: hand, at: V(S * 0.0445, 0.022, 0.128), aim: V(S * 0.034, 0.022, 0.166), role: "digit" });
    const ma = V(S * 0.0435, 0.022, 0.13);
    const mm = V(S * 0.0395, 0.022, 0.15);
    const mt = V(S * 0.0325, 0.022, 0.169);
    seg(ma, mm, 0.0056, 0.0042, AMBER, jw, 6);
    seg(mm, mt, 0.0042, 0.0006, DARK, jw, 6);

    for (let i = 0; i < 4; i++) {
      const z0 = [0.048, 0.03, 0.012, -0.006][i];
      const f = [0.034, 0.014, -0.012, -0.034][i];
      const q = [V(S * 0.013, 0.019, z0), V(S * 0.04, 0.037, z0 + f * 0.5), V(S * 0.064, 0.026, z0 + f), V(S * 0.08, 0, z0 + f * 1.5)];
      const n = i + 1;
      const leg = B.chain(`leg${L}${n}`, q, {
        parent: root,
        role: "leg",
        names: [`hip${L}${n}`, `knee${L}${n}`, `ankle${L}${n}`, `foot${L}${n}`],
      });
      const [h, k, a] = leg.joints;
      ell(q[0], [0.0062, 0.0062, 0.0062], DARK, h, 6, 5);
      seg(q[0], q[1], 0.0055, 0.0045, AMBER, h, 6);
      seg(q[1], q[2], 0.0045, 0.0036, AMBER2, k, 6);
      seg(q[2], q[3], 0.0036, 0.0012, AMBER, a, 6);
      ell(q[1], [0.0048, 0.0048, 0.0048], DARK, k, 6, 5);
      ell(q[2], [0.0039, 0.0039, 0.0039], DARK, a, 6, 5);
      band(q[1].clone().lerp(q[2], 0.5), q[2], 0.0041, 0.0013, k);
    }
  }

  return B.root;
}
```