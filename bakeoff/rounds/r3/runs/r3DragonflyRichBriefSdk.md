```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly hovering over a pond: electric-blue abdomen with black dorsal markings, apple-green thorax, huge turquoise eyes, four veined golden-tinged wings held flat, six tucked legs.",
};

const H = 0.16; // hover height above the pond

export default function build() {
  const b = createBuilder({ name: "emperorDragonfly" });

  // ---------- skeleton ----------
  const J = (name: string, p: number[], parent?: any) =>
    parent
      ? b.joint(name, { at: [p[0], p[1] + H, p[2]], parent })
      : b.joint(name, { at: [p[0], p[1] + H, p[2]] });

  const body = J("body", [0, 0, 0]);
  const head = J("head", [0, 0.002, 0.026], body);
  const jaw = J("jaw", [0, -0.004, 0.0085], head);
  // jaw is positioned in model space; fix by creating with absolute coords
  const jawJ = b.joint("jawLower", { at: [0, -0.002 + H, 0.0335], parent: head });

  const segStart = (i: number) => -0.01 - i * 0.0065;
  const abd: any[] = [];
  for (let i = 0; i < 10; i++) {
    abd.push(J(`abdomen${i + 1}`, [0, -0.0005, segStart(i)], i === 0 ? body : abd[i - 1]));
  }

  const wingJ: Record<string, any> = {};
  const wingDefs = [
    { n: "wingFore", z: 0.004 },
    { n: "wingHind", z: -0.004 },
  ];
  for (const w of wingDefs) {
    for (const [s, side] of [[1, "L"], [-1, "R"]] as [number, string][]) {
      wingJ[w.n + side] = J(w.n + side, [s * 0.006, 0.0075, w.z], body);
    }
  }

  const legDefs = [
    { n: "front", hz: 0.012, kx: 0.010, kz: 0.020, fx: 0.005, fz: 0.0125 },
    { n: "mid", hz: 0.005, kx: 0.0115, kz: 0.009, fx: 0.0065, fz: 0.0015 },
    { n: "hind", hz: -0.002, kx: 0.0115, kz: -0.004, fx: 0.0065, fz: -0.0115 },
  ];
  const legJ: any[] = [];
  for (const d of legDefs) {
    for (const [s, side] of [[1, "L"], [-1, "R"]] as [number, string][]) {
      const hip = J(`hip${d.n}${side}`, [s * 0.0045, -0.0085, d.hz], body);
      const knee = J(`knee${d.n}${side}`, [s * d.kx, -0.0125, d.kz], hip);
      const foot = J(`foot${d.n}${side}`, [s * d.fx, -0.0115, d.fz], knee);
      legJ.push({ s, d, hip, knee, foot });
    }
  }

  // ---------- helpers ----------
  const put = (geo: THREE.BufferGeometry, color: string, bone: any) => {
    geo.translate(0, H, 0);
    return b.part(geo, color, { at: [0, 0, 0], bone });
  };
  const xf = (
    geo: THREE.BufferGeometry,
    pos: number[],
    scale: number[] = [1, 1, 1],
    rot?: THREE.Euler
  ) => {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromEuler(rot ?? new THREE.Euler()),
      new THREE.Vector3(scale[0], scale[1], scale[2])
    );
    geo.applyMatrix4(m);
    return geo;
  };
  const sphere = (r: number, detail = 1) => new THREE.IcosahedronGeometry(r, detail);
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const segGeo = (a: THREE.Vector3, c: THREE.Vector3, w: number, h: number) => {
    const d = c.clone().sub(a);
    const len = d.length();
    const g = new THREE.BoxGeometry(w, len, h);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    g.applyMatrix4(
      new THREE.Matrix4().compose(a.clone().add(c).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1))
    );
    return g;
  };
  const hash = (n: number) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  // ---------- thorax ----------
  put(xf(sphere(0.0105, 2), [0, 0, 0], [1, 0.95, 1.4]), "#8ed23a", body);
  // dark thoracic stripes
  for (const s of [1, -1]) {
    put(segGeo(V([s * 0.0078, 0.006, 0.01]), V([s * 0.0104, -0.002, 0.006]), 0.0012, 0.0012), "#2c3a14", body);
    put(segGeo(V([s * 0.0082, 0.005, -0.002]), V([s * 0.0106, -0.003, -0.005]), 0.0012, 0.0012), "#2c3a14", body);
  }
  // dorsal ridge (wing-bearing, olive)
  put(xf(sphere(0.006, 1), [0, 0.0072, 0.0], [1.2, 0.5, 2.0]), "#6aa82a", body);
  // underside
  put(xf(sphere(0.008, 1), [0, -0.0055, 0.002], [1, 0.6, 1.5]), "#d7e08a", body);

  // ---------- head ----------
  put(xf(sphere(0.0075, 1), [0, 0.002 - 0.002, 0.026], [1, 0.9, 0.9]), "#9ccf3a", head);
  put(xf(sphere(0.0058, 1), [0, -0.0005, 0.0315], [1.2, 0.9, 0.8]), "#c8e45a", head); // face
  put(xf(sphere(0.0036, 1), [0, 0.0055, 0.0315], [1.3, 0.8, 0.8]), "#e6f08a", head); // forehead bulge
  put(xf(new THREE.BoxGeometry(0.007, 0.0022, 0.0022), [0, -0.0032, 0.0345]), "#e8efb0", head); // labrum
  put(xf(sphere(0.0009, 0), [0, 0.0045, 0.0345]), "#101010", head);
  put(xf(sphere(0.0007, 0), [0.0018, 0.0075, 0.0285]), "#101010", head);
  put(xf(sphere(0.0007, 0), [-0.0018, 0.0075, 0.0285]), "#101010", head);
  // jaw
  put(xf(new THREE.BoxGeometry(0.0065, 0.0016, 0.004), [0, -0.0035, 0.0325]), "#3b5a1c", jawJ);
  put(xf(new THREE.BoxGeometry(0.0022, 0.0014, 0.0025), [0.0022, -0.0033, 0.0348]), "#17210b", jawJ);
  put(xf(new THREE.BoxGeometry(0.0022, 0.0014, 0.0025), [-0.0022, -0.0033, 0.0348]), "#17210b", jawJ);
  // eyes
  for (const s of [1, -1]) {
    put(xf(sphere(0.0079, 2), [s * 0.0056, 0.0032, 0.0268], [1, 1.02, 1.1]), "#16cfc4", head);
    put(xf(sphere(0.0048, 1), [s * 0.0042, 0.0092, 0.0272], [1.1, 0.45, 1.2]), "#1a63c8", head);
    put(xf(sphere(0.0016, 0), [s * 0.0075, 0.006, 0.031]), "#e8fffb", head); // highlight
    // antennae
    put(segGeo(V([s * 0.0018, 0.0062, 0.0338]), V([s * 0.0024, 0.0092, 0.0372]), 0.0004, 0.0004), "#222018", head);
  }

  // ---------- abdomen ----------
  const radii = [0.0056, 0.0052, 0.0042, 0.0036, 0.0033, 0.0033, 0.0034, 0.0035, 0.0034, 0.0031];
  for (let i = 0; i < 10; i++) {
    const r = radii[i];
    const len = 0.0065;
    const zc = segStart(i) - len / 2;
    const g = new THREE.CylinderGeometry(r, radii[Math.min(9, i + 1)], len, 8);
    g.rotateX(-Math.PI / 2); // axis along -z (top radius toward -z)
    g.translate(0, -0.0005, zc);
    put(g, "#1f6bff", abd[i]);
    // black dorsal marking
    put(xf(new THREE.BoxGeometry(0.0026, 0.0014, len * 0.78), [0, -0.0005 + r * 0.92, zc]), "#0b0b12", abd[i]);
    if (i > 1) {
      put(xf(new THREE.BoxGeometry(0.0016, 0.0013, len * 0.4), [0, -0.0005 + r * 0.9, zc - len * 0.05]), "#0b0b12", abd[i]);
    }
    // black ring at segment joint
    const ring = new THREE.CylinderGeometry(r * 1.06, r * 1.06, 0.0008, 8);
    ring.rotateX(Math.PI / 2);
    ring.translate(0, -0.0005, segStart(i) - 0.0004);
    put(ring, "#101018", abd[i]);
    // pale blue side flashes
    for (const s of [1, -1]) {
      put(xf(new THREE.BoxGeometry(0.0012, 0.0012, len * 0.45), [s * r * 0.95, -0.0005, zc]), "#8fd4ff", abd[i]);
    }
  }
  // auricles on segment 2 and cerci
  for (const s of [1, -1]) {
    put(xf(sphere(0.0017, 0), [s * 0.0052, -0.0012, segStart(1) - 0.002], [0.6, 1, 1.4]), "#1a4fc0", abd[1]);
    const zEnd = segStart(9) - 0.0065;
    put(segGeo(V([s * 0.0012, -0.0005, zEnd + 0.0006]), V([s * 0.0022, -0.0003, zEnd - 0.0058]), 0.0011, 0.0009), "#14141c", abd[9]);
  }
  put(segGeo(V([0, -0.0017, segStart(9) - 0.006]), V([0, -0.0021, segStart(9) - 0.0095]), 0.0009, 0.0009), "#14141c", abd[9]);

  // ---------- wings ----------
  const veinC = "#2f2a1f";
  const makeWing = (bone: any, rootP: number[], s: number, hind: boolean, yaw: number, seed: number) => {
    const L = hind ? 0.052 : 0.05;
    const wmax = hind ? 0.0155 : 0.0115;
    const lead = (t: number) => 0.004 * (1 - t) * (hind ? 0.5 : 1) + 0.001;
    const trail = (t: number) => {
      const bulge = Math.sqrt(Math.max(0, 1 - t * t * 0.96));
      const base = hind ? 0.55 + 0.45 * Math.min(1, t * 3) : 0.25 + 0.75 * Math.min(1, t * 4);
      const w = wmax * bulge * base * (1 - 0.15 * t);
      return -w + (hind ? 0 : 0);
    };
    // chord: lead is +z side, trail is -z side
    const P = (t: number, u: number) => {
      const z0 = lead(t);
      const z1 = trail(t);
      return V([s * t * L, 0.0004, z0 + (z1 - z0) * u]);
    };
    const M = new THREE.Matrix4().compose(
      V([rootP[0], rootP[1] + H, rootP[2]]),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * s),
      new THREE.Vector3(1, 1, 1)
    );
    const emit = (g: THREE.BufferGeometry, color: string) => {
      g.applyMatrix4(M);
      b.part(g, color, { at: [0, 0, 0], bone });
    };
    // membrane
    const shape = new THREE.Shape();
    const ts = [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.92, 1.0];
    ts.forEach((t, i) => {
      const p = P(t, 0);
      if (i === 0) shape.moveTo(p.x, -p.z);
      else shape.lineTo(p.x, -p.z);
    });
    for (let i = ts.length - 1; i >= 0; i--) {
      const p = P(ts[i], 1);
      shape.lineTo(p.x, -p.z);
    }
    const eg = new THREE.ExtrudeGeometry(shape, { depth: 0.0004, bevelEnabled: false });
    eg.rotateX(-Math.PI / 2);
    emit(eg, "#e9e0b4");
    // longitudinal veins
    const us = [0, 0.14, 0.32, 0.52, 0.74, 1];
    const tv = [0, 0.25, 0.5, 0.75, 0.96];
    us.forEach((u, k) => {
      const thick = k === 0 ? 0.0008 : 0.00045;
      for (let i = 0; i < tv.length - 1; i++) {
        emit(segGeo(P(tv[i], u), P(tv[i + 1], u), thick, 0.0005), veinC);
      }
    });
    // cross veins
    const tc = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    tc.forEach((t, i) => {
      for (let k = 0; k < us.length - 1; k++) {
        if (hash(seed * 17 + i * 5 + k) < 0.3) continue;
        const jit = (hash(seed + i * 3 + k * 7) - 0.5) * 0.06;
        emit(segGeo(P(t + jit, us[k]), P(t + 0.03 + jit, us[k + 1]), 0.00028, 0.0004), veinC);
      }
    });
    // pterostigma
    emit(segGeo(P(0.8, 0.02), P(0.87, 0.02), 0.0012, 0.0006), "#2a1c10");
    // golden base patch
    emit(segGeo(P(0.02, 0.45), P(0.14, 0.45), hind ? 0.0072 : 0.0045, 0.0005), "#d9a441");
  };
  let sd = 1;
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    makeWing(wingJ["wingFore" + side], [s * 0.006, 0.0075, 0.004], s, false, -0.12, sd++);
    makeWing(wingJ["wingHind" + side], [s * 0.006, 0.0075, -0.004], s, true, 0.18, sd++);
  }

  // ---------- legs ----------
  const legC = "#2a2018";
  for (const L of legJ) {
    const hipP = V([L.s * 0.0045, -0.0085, L.d.hz]);
    const kneeP = V([L.s * L.d.kx, -0.0125, L.d.kz]);
    const footP = V([L.s * L.d.fx, -0.0115, L.d.fz]);
    put(segGeo(hipP, kneeP, 0.0012, 0.0012), legC, L.hip);
    put(xf(sphere(0.0011, 0), [kneeP.x, kneeP.y, kneeP.z]), "#5a4630", L.knee);
    put(segGeo(kneeP, footP, 0.0009, 0.0009), legC, L.knee);
    // tiny tarsal claw
    const dirBack = footP.clone().sub(kneeP).normalize();
    put(segGeo(footP, footP.clone().add(dirBack.multiplyScalar(0.0025)).add(V([0, -0.001, 0])), 0.0006, 0.0006), "#111111", L.foot);
  }

  // ---------- pond ----------
  const water = new THREE.CylinderGeometry(0.2, 0.2, 0.006, 24);
  water.translate(0, 0.003, 0);
  b.part(water, "#2f7f8a", { at: [0, 0, 0], bone: body });
  for (const [r, c] of [[0.03, "#6fc0c4"], [0.06, "#58aeb4"], [0.1, "#4a9ea6"]] as [number, string][]) {
    const t = new THREE.TorusGeometry(r, 0.0013, 4, 40);
    t.rotateX(Math.PI / 2);
    t.translate(0, 0.0065, 0);
    b.part(t, c, { at: [0, 0, 0], bone: body });
  }
  // lily pad with notch
  const pad = new THREE.CylinderGeometry(0.045, 0.045, 0.003, 14, 1, false, 0.35, Math.PI * 2 - 0.55);
  pad.translate(0.11, 0.0075, -0.08);
  b.part(pad, "#3f9a3a", { at: [0, 0, 0], bone: body });
  // lotus flower on pad
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const petal = new THREE.ConeGeometry(0.006, 0.02, 4);
    petal.translate(0, 0.01, 0);
    petal.rotateZ(-0.5);
    petal.rotateY(a);
    petal.translate(0.1, 0.009, -0.075);
    b.part(petal, "#f08ab5", { at: [0, 0, 0], bone: body });
  }
  b.part(xf(sphere(0.004, 0), [0.1, 0.012, -0.075]), "#f2c640", { at: [0, 0, 0], bone: body });
  // reeds and cattails
  const reeds = [
    [-0.16, 0.06, 0.2], [-0.175, 0.03, 0.26], [-0.14, 0.095, 0.17], [-0.18, 0.08, 0.15], [0.15, 0.11, 0.18],
  ];
  reeds.forEach((r, i) => {
    const g = new THREE.CylinderGeometry(0.0016, 0.0024, r[2], 5);
    g.translate(r[0], r[2] / 2, r[1]);
    b.part(g, "#4f7d2e", { at: [0, 0, 0], bone: body });
    if (i % 2 === 0) {
      const c = new THREE.CapsuleGeometry(0.0045, 0.03, 3, 6);
      c.translate(r[0], r[2] - 0.03, r[1]);
      b.part(c, "#5a3a22", { at: [0, 0, 0], bone: body });
    }
  });
  // stones on the bank
  for (let i = 0; i < 7; i++) {
    const a = -2.4 + i * 0.28;
    const rr = 0.2;
    b.part(
      xf(sphere(0.012 + hash(i) * 0.008, 0), [Math.cos(a) * rr, 0.004, Math.sin(a) * rr], [1.3, 0.6, 1]),
      i % 2 ? "#8a8a82" : "#6f716b",
      { at: [0, 0, 0], bone: body }
    );
  }

  return b.root;
}
```