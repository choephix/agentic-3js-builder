import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Morning-Glory Gramophone",
  description:
    "An antique gramophone on a carved walnut cabinet with pale floral marquetry, brass ball-and-claw feet, a flaring eight-petal morning-glory brass horn with verdigris patina, a black record with a red label, a silver tonearm and reproducer, and a side wind-up crank.",
};

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// Rotate geometry so its +Y axis points along dir.
function alignY(geo: THREE.BufferGeometry, dir: THREE.Vector3) {
  const d = dir.clone().normalize();
  const up = V(0, 1, 0);
  const dot = up.dot(d);
  if (dot < -0.99999) geo.rotateX(Math.PI);
  else if (dot < 0.99999) {
    const axis = new THREE.Vector3().crossVectors(up, d).normalize();
    geo.applyMatrix4(new THREE.Matrix4().makeRotationAxis(axis, Math.acos(dot)));
  }
  return geo;
}
function rodGeo(a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, seg = 8) {
  const dir = b.clone().sub(a);
  const g = new THREE.CylinderGeometry(rb, ra, dir.length(), seg, 1);
  alignY(g, dir);
  const m = a.clone().add(b).multiplyScalar(0.5);
  g.translate(m.x, m.y, m.z);
  return g;
}
function discGeo(c: THREE.Vector3, axis: THREE.Vector3, r: number, h: number, seg = 16) {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  alignY(g, axis);
  g.translate(c.x, c.y, c.z);
  return g;
}
function ringGeo(c: THREE.Vector3, axis: THREE.Vector3, r: number, tube: number, seg = 24) {
  const g = new THREE.TorusGeometry(r, tube, 4, seg);
  g.rotateX(Math.PI / 2);
  alignY(g, axis);
  g.translate(c.x, c.y, c.z);
  return g;
}
function ballGeo(c: THREE.Vector3, r: number, ws = 8, hs = 6) {
  const g = new THREE.SphereGeometry(r, ws, hs);
  g.translate(c.x, c.y, c.z);
  return g;
}
function boxGeo(c: THREE.Vector3, w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(c.x, c.y, c.z);
  return g;
}

type Face = { c: THREE.Vector3; u: THREE.Vector3; v: THREE.Vector3; n: THREE.Vector3 };
function onFace(geo: THREE.BufferGeometry, f: Face, off: number) {
  geo.translate(0, 0, off);
  const m = new THREE.Matrix4().makeBasis(f.u, f.v, f.n);
  m.setPosition(f.c);
  geo.applyMatrix4(m);
  return geo;
}

const C = {
  walnut: "#7a4524",
  walnutDark: "#4a2814",
  burl: "#5a2f17",
  walnutLight: "#975b30",
  inlay: "#f1e3be",
  leaf: "#cdbf8d",
  boxwood: "#b47c42",
  brass: "#b9893a",
  brassDeep: "#8f6526",
  brassBright: "#e6be5e",
  hornIn: "#d8a84a",
  hornOut: "#a9782c",
  patina: "#7fa98c",
  patina2: "#97ad6b",
  silver: "#cfd2d8",
  steel: "#8b9098",
  black: "#141416",
  groove: "#383842",
  red: "#b31f2b",
  cream: "#f3e6c4",
  gold: "#e2b94f",
  felt: "#2f5136",
  ebony: "#24160e",
  mica: "#e8d7a6",
  throat: "#2a1c0c",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // ---------- random ----------
  const R: any = rng(1912);
  let seedF = 1912;
  const local = () => {
    seedF = (seedF * 16807) % 2147483647;
    return seedF / 2147483647;
  };
  const rand = (): number => {
    let v: any;
    try {
      v = typeof R === "function" ? R() : typeof R?.next === "function" ? R.next() : typeof R?.float === "function" ? R.float() : undefined;
    } catch {
      v = undefined;
    }
    return typeof v === "number" && isFinite(v) ? v : local();
  };

  // ---------- key dimensions ----------
  const TOP = 0.295; // lid top surface
  const PC = V(0, 0.31, 0.02); // platter centre
  const PV = V(-0.15, 0.37, -0.14); // tonearm pivot top
  const SB = V(-0.055, 0.352, 0.105); // soundbox centre
  const CR = V(0.21, 0.175, 0); // crank shaft root

  // ---------- skeleton ----------
  const base: any = b.joint("base", { at: [0, 0, 0] });
  const platterJ: any = b.joint("platter", { at: [PC.x, PC.y, PC.z], parent: base } as any);
  const armJ: any = b.joint("tonearm", { at: [PV.x, PV.y, PV.z], parent: base } as any);
  const crankJ: any = b.joint("crank", { at: [CR.x, CR.y, CR.z], parent: base } as any);

  // ---------- part placement (geometry baked in model space) ----------
  let raw = false;
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const put = (geo: THREE.BufferGeometry, color: string, bone: any = base) => {
    if (!raw) {
      try {
        (b as any).part(geo, color, { at: [0, 0, 0], bone });
        return;
      } catch {
        raw = true;
      }
    }
    let m = mats.get(color);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04 });
      mats.set(color, m);
    }
    (b as any).root.add(new THREE.Mesh(geo, m));
  };

  // =====================================================================
  // CABINET
  // =====================================================================
  put(boxGeo(V(0, 0.075, 0), 0.46, 0.03, 0.46), C.walnutDark); // skirt
  put(boxGeo(V(0, 0.093, 0), 0.44, 0.008, 0.44), C.walnutLight); // skirt lip
  put(boxGeo(V(0, 0.175, 0), 0.42, 0.17, 0.42), C.walnut); // body
  put(boxGeo(V(0, 0.27, 0), 0.46, 0.02, 0.46), C.walnutDark); // top molding
  put(boxGeo(V(0, 0.287, 0), 0.44, 0.016, 0.44), C.walnut); // lid

  // bead molding under the top
  for (let i = 0; i <= 20; i++) {
    const t = -0.22 + i * 0.022;
    const pts = [V(t, 0.258, 0.232), V(t, 0.258, -0.232), V(0.232, 0.258, t), V(-0.232, 0.258, t)];
    for (const p of pts) put(new THREE.IcosahedronGeometry(0.0055, 0).translate(p.x, p.y, p.z), C.walnutLight);
  }
  // dentils along the skirt
  for (let i = 0; i < 14; i++) {
    const t = -0.2 + i * (0.4 / 13);
    put(boxGeo(V(t, 0.068, 0.231), 0.012, 0.012, 0.006), C.walnutLight);
    put(boxGeo(V(t, 0.068, -0.231), 0.012, 0.012, 0.006), C.walnutLight);
    put(boxGeo(V(0.231, 0.068, t), 0.006, 0.012, 0.012), C.walnutLight);
    put(boxGeo(V(-0.231, 0.068, t), 0.006, 0.012, 0.012), C.walnutLight);
  }

  // corner pilasters
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = sx * 0.21, z = sz * 0.21;
      put(rodGeo(V(x, 0.1, z), V(x, 0.25, z), 0.017, 0.017, 8), C.walnutLight);
      put(boxGeo(V(x, 0.254, z), 0.04, 0.012, 0.04), C.walnutDark);
      put(boxGeo(V(x, 0.102, z), 0.04, 0.012, 0.04), C.walnutDark);
      for (const y of [0.135, 0.175, 0.215]) {
        const o = V(sx, 0, sz).normalize().multiplyScalar(0.016);
        put(ballGeo(V(x + o.x, y, z + o.z), 0.005, 6, 4), C.inlay);
      }
    }

  // ---------- inlaid side panels ----------
  const faces: Face[] = [
    { c: V(0, 0.175, 0.21), u: V(1, 0, 0), v: V(0, 1, 0), n: V(0, 0, 1) },
    { c: V(0, 0.175, -0.21), u: V(-1, 0, 0), v: V(0, 1, 0), n: V(0, 0, -1) },
    { c: V(0.21, 0.175, 0), u: V(0, 0, -1), v: V(0, 1, 0), n: V(1, 0, 0) },
    { c: V(-0.21, 0.175, 0), u: V(0, 0, 1), v: V(0, 1, 0), n: V(-1, 0, 0) },
  ];

  const flower = (f: Face, a: number, bb: number, petals: number, pr: number, off: number, petalCol: string, centerCol: string | null, rot0 = 0) => {
    for (let k = 0; k < petals; k++) {
      const g = new THREE.SphereGeometry(1, 6, 4);
      g.scale(pr * 0.4, pr, 0.0018);
      g.translate(0, pr * 0.95, 0);
      g.rotateZ(rot0 + (k * Math.PI * 2) / petals);
      g.translate(a, bb, 0);
      put(onFace(g, f, off), petalCol);
    }
    if (centerCol) {
      const g = new THREE.CylinderGeometry(pr * 0.42, pr * 0.42, 0.003, 8);
      g.rotateX(Math.PI / 2);
      g.translate(a, bb, 0.0008);
      put(onFace(g, f, off), centerCol);
    }
  };

  faces.forEach((f, fi) => {
    // recessed burl panel & frame
    put(onFace(new THREE.BoxGeometry(0.32, 0.12, 0.006), f, 0.003), C.burl);
    for (const s of [-1, 1]) {
      put(onFace(new THREE.BoxGeometry(0.35, 0.014, 0.01).translate(0, s * 0.067, 0), f, 0.005), C.walnutLight);
      put(onFace(new THREE.BoxGeometry(0.014, 0.12, 0.01).translate(s * 0.168, 0, 0), f, 0.005), C.walnutLight);
    }
    // brass corner rosettes
    for (const sa of [-1, 1])
      for (const sb of [-1, 1]) {
        const g = new THREE.CylinderGeometry(0.0075, 0.0075, 0.004, 8);
        g.rotateX(Math.PI / 2);
        g.translate(sa * 0.168, sb * 0.067, 0);
        put(onFace(g, f, 0.011), C.brass);
      }

    const OFF = 0.0062;
    const isCrankSide = fi === 2;
    if (!isCrankSide) flower(f, 0, 0, 8, 0.019, OFF, C.inlay, C.boxwood, Math.PI / 8);
    else flower(f, 0, 0, 8, 0.02, OFF, C.brassBright, null, Math.PI / 8);

    // mirrored vines with leaves and buds
    for (const s of [-1, 1]) {
      const pts = [V(0.03, 0.0, 0), V(0.062, 0.03, 0), V(0.098, -0.026, 0), V(0.132, 0.012, 0)].map((p) => V(p.x * s, p.y, 0));
      const curve = new THREE.CatmullRomCurve3(pts);
      put(onFace(new THREE.TubeGeometry(curve, 20, 0.0017, 4, false), f, OFF), C.leaf);
      [0.18, 0.42, 0.66, 0.86].forEach((t, i) => {
        const p = curve.getPoint(t);
        const tg = curve.getTangent(t);
        const ang = Math.atan2(tg.y, tg.x) - Math.PI / 2 + (i % 2 ? 0.9 : -0.9);
        const g = new THREE.SphereGeometry(1, 6, 4);
        g.scale(0.0048, 0.012, 0.0015);
        g.translate(0, 0.011, 0);
        g.rotateZ(ang);
        g.translate(p.x, p.y, 0);
        put(onFace(g, f, OFF), C.leaf);
      });
      flower(f, s * 0.138, 0.016, 5, 0.0095, OFF, C.inlay, C.boxwood, 0.3 * s);
    }
  });

  // brass nameplate on the front
  {
    const g = new THREE.CylinderGeometry(0.016, 0.016, 0.004, 14);
    g.rotateX(Math.PI / 2);
    g.scale(1.8, 1, 1);
    g.translate(0, 0.25, 0.222);
    put(g, C.brassBright);
    put(boxGeo(V(0, 0.25, 0.2245), 0.034, 0.003, 0.002), C.walnutDark);
  }

  // lid inlay: ring around the platter and front corner flowers
  {
    const g = new THREE.TorusGeometry(0.188, 0.0025, 3, 48);
    g.rotateX(Math.PI / 2);
    g.translate(PC.x, TOP, PC.z);
    put(g, C.inlay);
    const top: Face = { c: V(0, TOP, 0), u: V(1, 0, 0), v: V(0, 0, -1), n: V(0, 1, 0) };
    flower(top, 0.19, -0.19, 6, 0.011, 0.0004, C.inlay, C.boxwood);
    flower(top, -0.19, -0.19, 6, 0.011, 0.0004, C.inlay, C.boxwood);
    flower(top, 0.19, 0.19, 6, 0.009, 0.0004, C.inlay, C.boxwood);
  }

  // speed knob and brake lever
  put(discGeo(V(0.175, TOP + 0.006, 0.17), V(0, 1, 0), 0.012, 0.012, 10), C.silver);
  put(ballGeo(V(0.175, TOP + 0.016, 0.17), 0.007), C.ebony);
  put(rodGeo(V(0.17, TOP + 0.004, -0.15), V(0.13, TOP + 0.012, -0.12), 0.004, 0.003, 6), C.silver);
  put(ballGeo(V(0.13, TOP + 0.012, -0.12), 0.006), C.ebony);

  // ---------- ball-and-claw feet ----------
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const c = V(sx * 0.19, 0.028, sz * 0.19);
      put(ballGeo(c, 0.028, 10, 7), C.walnutDark);
      put(rodGeo(V(c.x, 0.045, c.z), V(c.x, 0.075, c.z), 0.02, 0.032, 8), C.walnut);
      const az0 = Math.atan2(sz, sx);
      const dirAt = (az: number, el: number, r: number) =>
        V(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el)).multiplyScalar(r).add(c);
      for (const daz of [-1.1, -0.37, 0.37, 1.1, Math.PI]) {
        const az = az0 + daz;
        const p1 = dirAt(az, 0.85, 0.03);
        const p2 = dirAt(az, -0.2, 0.031);
        const p3 = dirAt(az, -0.95, 0.026);
        put(ballGeo(p1, 0.0075, 6, 4), C.brass);
        put(rodGeo(p1, p2, 0.0068, 0.0058, 6), C.brass);
        put(rodGeo(p2, p3, 0.0058, 0.0008, 6), C.brassDeep);
      }
    }

  // =====================================================================
  // TURNTABLE (rotates on the platter joint)
  // =====================================================================
  put(discGeo(V(PC.x, 0.304, PC.z), V(0, 1, 0), 0.165, 0.014, 32), C.black, platterJ);
  put(ringGeo(V(PC.x, 0.304, PC.z), V(0, 1, 0), 0.165, 0.004, 40), C.brass, platterJ);
  put(discGeo(V(PC.x, 0.312, PC.z), V(0, 1, 0), 0.158, 0.002, 32), C.felt, platterJ);
  put(discGeo(V(PC.x, 0.315, PC.z), V(0, 1, 0), 0.15, 0.004, 40), C.black, platterJ);
  for (const r of [0.062, 0.078, 0.094, 0.11, 0.126, 0.142]) {
    const g = new THREE.TorusGeometry(r, 0.0008, 3, 48);
    g.rotateX(Math.PI / 2);
    g.translate(PC.x, 0.317, PC.z);
    put(g, C.groove, platterJ);
  }
  put(discGeo(V(PC.x, 0.3175, PC.z), V(0, 1, 0), 0.05, 0.0012, 24), C.red, platterJ);
  put(ringGeo(V(PC.x, 0.3182, PC.z), V(0, 1, 0), 0.049, 0.0016, 32), C.gold, platterJ);
  put(ringGeo(V(PC.x, 0.3182, PC.z), V(0, 1, 0), 0.016, 0.001, 16), C.cream, platterJ);
  for (const s of [0, 1]) {
    const g = new THREE.TorusGeometry(0.031, 0.0013, 3, 14, 1.7);
    g.rotateZ(Math.PI / 2 - 0.85 + s * Math.PI);
    g.rotateX(-Math.PI / 2);
    g.translate(PC.x, 0.3183, PC.z);
    put(g, s ? C.cream : C.gold, platterJ);
  }
  put(rodGeo(V(PC.x, 0.31, PC.z), V(PC.x, 0.328, PC.z), 0.004, 0.0035, 8), C.silver, platterJ);
  put(ballGeo(V(PC.x, 0.328, PC.z), 0.0045), C.silver, platterJ);

  // =====================================================================
  // MORNING-GLORY HORN
  // =====================================================================
  const P0 = V(0, 0.56, -0.11);
  const d = V(0, 0.3, 1).normalize();
  const e1 = V(1, 0, 0);
  const e2 = new THREE.Vector3().crossVectors(d, e1).normalize();
  const PET = 8, r0 = 0.026, RM = 0.3, L = 0.5;
  const hornPt = (s: number, th: number, k: number) => {
    const c = Math.cos(PET * th);
    const base0 = r0 + (RM - r0) * Math.pow(s, 3.2);
    const r = base0 * (1 + 0.13 * Math.pow(s, 2.5) * c) * k;
    const ax = L * s - 0.05 * Math.pow(s, 7) * (0.5 + 0.5 * c);
    return P0.clone()
      .addScaledVector(d, ax)
      .addScaledVector(e1, Math.cos(th) * r)
      .addScaledVector(e2, Math.sin(th) * r);
  };
  const NS = 18, NT = PET * 6;
  const hornSurf = (k: number, outward: boolean) => {
    const pos: number[] = [];
    for (let i = 0; i <= NS; i++)
      for (let j = 0; j <= NT; j++) {
        const p = hornPt(i / NS, (j / NT) * Math.PI * 2, k);
        pos.push(p.x, p.y, p.z);
      }
    // orientation test
    const pa = hornPt(0.5, 0.1, k), pb = hornPt(0.5 + 1 / NS, 0.1, k), pc = hornPt(0.5, 0.1 + (Math.PI * 2) / NT, k);
    const n = new THREE.Vector3().crossVectors(pb.clone().sub(pa), pc.clone().sub(pa));
    const rel = pa.clone().sub(P0);
    const radial = rel.clone().addScaledVector(d, -rel.dot(d));
    const natOut = n.dot(radial) > 0;
    const flip = natOut !== outward;
    const idx: number[] = [];
    for (let i = 0; i < NS; i++)
      for (let j = 0; j < NT; j++) {
        const a = i * (NT + 1) + j, bq = (i + 1) * (NT + 1) + j, c = a + 1, dq = bq + 1;
        if (!flip) idx.push(a, bq, c, bq, dq, c);
        else idx.push(a, c, bq, bq, c, dq);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    const ng = g.toNonIndexed();
    ng.computeVertexNormals();
    return ng;
  };
  put(hornSurf(1.0, true), C.hornOut);
  put(hornSurf(0.985, false), C.hornIn);

  // rolled rim
  {
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j < 96; j++) pts.push(hornPt(1, (j / 96) * Math.PI * 2, 0.993));
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 144, 0.0065, 6, true), C.brassBright);
  }
  // petal ribs, inside and out, and beads at the petal tips
  for (let k = 0; k < PET; k++) {
    const th = (k * Math.PI * 2) / PET;
    const outPts: THREE.Vector3[] = [], inPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const s = 0.12 + (0.86 * i) / 12;
      outPts.push(hornPt(s, th, 1.015));
      inPts.push(hornPt(s, th, 0.972));
    }
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outPts), 24, 0.0045, 5, false), C.patina);
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(inPts), 24, 0.0038, 5, false), C.brassBright);
    put(ballGeo(hornPt(1, th, 1.0), 0.011, 8, 6), C.brassBright);
    // little valley seams inside (the folds between petals)
    const sv: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) sv.push(hornPt(0.45 + (0.5 * i) / 8, th + Math.PI / PET, 0.975));
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sv), 12, 0.0018, 4, false), C.brassDeep);
  }
  // verdigris patina blooms
  for (let i = 0; i < 40; i++) {
    const s = 0.25 + 0.72 * rand();
    const th = rand() * Math.PI * 2;
    const p = hornPt(s, th, 1.0);
    const r = 0.005 + 0.011 * rand() * s;
    put(new THREE.IcosahedronGeometry(r, 0).translate(p.x, p.y, p.z), rand() < 0.5 ? C.patina : C.patina2);
  }
  for (let i = 0; i < 14; i++) {
    const s = 0.55 + 0.42 * rand();
    const th = rand() * Math.PI * 2;
    const p = hornPt(s, th, 0.985);
    put(new THREE.IcosahedronGeometry(0.003 + 0.003 * rand(), 0).translate(p.x, p.y, p.z), C.patina2);
  }
  // throat: dark plug, collar
  put(discGeo(P0.clone().addScaledVector(d, 0.03), d, 0.03, 0.004, 12), C.throat);
  put(ringGeo(P0, d, 0.028, 0.006, 16), C.brassDeep);
  put(ringGeo(P0.clone().addScaledVector(d, 0.04), d, 0.034, 0.004, 16), C.brass);

  // elbow from tonearm pivot to horn throat
  {
    const curve = new THREE.CubicBezierCurve3(
      PV.clone(),
      PV.clone().add(V(0, 0.13, 0)),
      P0.clone().addScaledVector(d, -0.14),
      P0.clone()
    );
    put(new THREE.TubeGeometry(curve, 24, 0.023, 10, false), C.brass);
    put(ringGeo(curve.getPoint(0.5), curve.getTangent(0.5), 0.025, 0.004, 14), C.brassBright);
    put(ringGeo(PV.clone().add(V(0, 0.012, 0)), V(0, 1, 0), 0.025, 0.004, 14), C.brassBright);
  }
  // horn support bracket
  {
    const foot = V(0, TOP, -0.175);
    const top = V(0, 0.525, -0.115);
    put(discGeo(foot.clone().add(V(0, 0.004, 0)), V(0, 1, 0), 0.026, 0.008, 12), C.brass);
    put(rodGeo(foot, top, 0.009, 0.007, 8), C.brassDeep);
    put(ballGeo(top, 0.012), C.brass);
    put(ballGeo(V(0, 0.4, -0.15), 0.011), C.brassBright);
  }

  // =====================================================================
  // TONEARM
  // =====================================================================
  put(discGeo(V(PV.x, TOP + 0.006, PV.z), V(0, 1, 0), 0.032, 0.012, 16), C.silver);
  put(ringGeo(V(PV.x, TOP + 0.012, PV.z), V(0, 1, 0), 0.03, 0.003, 16), C.steel);
  put(rodGeo(V(PV.x, TOP, PV.z), V(PV.x, PV.y - 0.012, PV.z), 0.014, 0.013, 10), C.silver);
  put(ballGeo(PV, 0.021, 10, 8), C.silver, armJ);
  const armDir = V(SB.x - PV.x, 0, SB.z - PV.z).normalize();
  const armEnd = SB.clone().addScaledVector(armDir, -0.012);
  put(rodGeo(PV, armEnd, 0.012, 0.008, 10), C.silver, armJ);
  put(ringGeo(PV.clone().lerp(armEnd, 0.5), armEnd.clone().sub(PV), 0.0115, 0.002, 12), C.steel, armJ);
  // reproducer
  put(discGeo(SB, armDir, 0.032, 0.014, 18), C.silver, armJ);
  put(discGeo(SB.clone().addScaledVector(armDir, 0.004), armDir, 0.024, 0.012, 18), C.mica, armJ);
  put(ringGeo(SB.clone().addScaledVector(armDir, 0.0075), armDir, 0.027, 0.0022, 18), C.brassBright, armJ);
  {
    const side = new THREE.Vector3().crossVectors(armDir, V(0, 1, 0)).normalize();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = SB.clone()
        .addScaledVector(armDir, 0.0075)
        .addScaledVector(side, Math.cos(a) * 0.029)
        .add(V(0, Math.sin(a) * 0.029, 0));
      put(ballGeo(p, 0.0022, 5, 4), C.steel, armJ);
    }
  }
  put(ballGeo(SB.clone().addScaledVector(armDir, 0.01), 0.004, 6, 4), C.steel, armJ);
  put(rodGeo(V(SB.x, SB.y - 0.026, SB.z), V(SB.x, 0.3182, SB.z), 0.0028, 0.0008, 6), C.steel, armJ);

  // =====================================================================
  // WIND-UP CRANK (+X side)
  // =====================================================================
  const X = V(1, 0, 0);
  put(discGeo(V(0.2185, CR.y, CR.z), X, 0.026, 0.007, 16), C.brass);
  put(ringGeo(V(0.222, CR.y, CR.z), X, 0.022, 0.0025, 16), C.brassBright);
  const hub = V(0.262, CR.y, CR.z);
  put(rodGeo(V(0.215, CR.y, CR.z), hub, 0.006, 0.006, 8), C.silver, crankJ);
  put(ballGeo(hub, 0.01), C.silver, crankJ);
  const E = V(0.262, CR.y + 0.065, CR.z + 0.03);
  put(rodGeo(hub, E, 0.0065, 0.005, 8), C.silver, crankJ);
  put(ballGeo(E, 0.0065), C.silver, crankJ);
  put(rodGeo(E, E.clone().add(V(0.045, 0, 0)), 0.0035, 0.0035, 6), C.steel, crankJ);
  {
    const g = new THREE.CapsuleGeometry(0.011, 0.024, 3, 8);
    g.rotateZ(Math.PI / 2);
    g.translate(E.x + 0.027, E.y, E.z);
    put(g, C.ebony, crankJ);
    put(ballGeo(E.clone().add(V(0.047, 0, 0)), 0.005), C.brassBright, crankJ);
  }

  return (b as any).root;
}
