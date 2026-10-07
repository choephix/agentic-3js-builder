```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Dragonfly",
  description:
    "A life-size stylized dragonfly in a rest pose. It has a faceted metallic-green thorax with yellow shoulder stripes, huge low-poly compound eyes that meet on top of the head, and a separate labrum (upper lip) and labium jaw. The azure abdomen is banded in black and ends in a navy tip with cerci. Four veined wings carry dark pterostigmas and amber bases, and six bristly legs stand on hooked claws.",
};

type P3 = [number, number, number];

export default function build() {
  const b: any = createBuilder({ name: "dragonfly" });

  // ---------- palette ----------
  const C = {
    green: "#2f9e6e",
    greenDark: "#1f6b4c",
    yellow: "#f2cf3a",
    black: "#11161c",
    azure: "#1fc3dc",
    azureLight: "#5fe0ee",
    navy: "#1b2b48",
    paleBlue: "#a8ecf6",
    eye: "#26a9d9",
    eyeDark: "#0e3a55",
    white: "#f5fbff",
    membrane: "#d4ecf4",
    vein: "#34414e",
    stigma: "#3a1f17",
    amber: "#e6a03a",
    legBrown: "#2a241f",
    face: "#e7d04b",
    lip: "#c9a536",
    cerci: "#dfe8ee",
  };

  // ---------- helpers ----------
  const v3 = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const arr = (v: THREE.Vector3): P3 => [v.x, v.y, v.z];
  const put = (geo: THREE.BufferGeometry, color: string, at: P3, bone?: any) =>
    bone ? b.part(geo, color, { at, bone }) : b.part(geo, color, { at });
  const rod = (a: number[], c: number[], r0: number, r1: number, color: string, seg = 5, bone?: any) => {
    const A = v3(a);
    const Cc = v3(c);
    const d = Cc.clone().sub(A);
    const len = Math.max(d.length(), 1e-5);
    const geo = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
    const opts: any = { at: arr(A.clone().add(Cc).multiplyScalar(0.5)), dir: arr(d.normalize()) };
    if (bone) opts.bone = bone;
    return b.part(geo, color, opts);
  };
  const cone = (base: number[], dir: number[], h: number, r: number, color: string, seg = 4, bone?: any) => {
    const D = v3(dir).normalize();
    const opts: any = { at: arr(v3(base).addScaledVector(D, h / 2)), dir: arr(D) };
    if (bone) opts.bone = bone;
    return b.part(new THREE.ConeGeometry(r, h, seg, 1), color, opts);
  };
  const ball = (at: P3, r: number, color: string, bone?: any, w = 6, h = 4) =>
    put(new THREE.SphereGeometry(r, w, h), color, at, bone);
  const ellip = (at: P3, sx: number, sy: number, sz: number, color: string, bone?: any, w = 8, h = 6) =>
    put(new THREE.SphereGeometry(1, w, h).scale(sx, sy, sz), color, at, bone);

  const Y = 0.0135; // thorax height above floor

  // ---------- skeleton ----------
  const thorax = b.joint("thorax", { at: [0, Y, -0.002], aim: [0, Y, 0.006] });
  const head = b.joint("head", { at: [0, Y + 0.0008, 0.0075], parent: thorax, aim: [0, Y + 0.0008, 0.016] });
  const jaw = b.joint("jaw", { at: [0, Y - 0.0022, 0.0125], parent: head, aim: [0, Y - 0.0028, 0.017] });

  // abdomen line
  const slope = -0.03;
  const D = new THREE.Vector3(0, slope, -1).normalize();
  const abStart = new THREE.Vector3(0, Y, -0.0062);
  const abAt = (s: number): P3 => arr(abStart.clone().addScaledVector(D, s));
  const segL = [0.003, 0.005, 0.0062, 0.0062, 0.0062, 0.0062, 0.0062, 0.0048, 0.0042, 0.003];
  const segR = [0.0026, 0.0023, 0.0017, 0.00165, 0.0016, 0.00155, 0.0016, 0.0018, 0.0019, 0.0016];
  const abLen = segL.reduce((a, c) => a + c, 0);
  b.chain("tail", [abAt(0), abAt(0.012), abAt(0.024), abAt(0.036), abAt(abLen)], {
    parent: thorax,
    role: "tail",
  });

  // ---------- thorax ----------
  ellip([0, Y + 0.0005, -0.0005], 0.0048, 0.0055, 0.0075, C.green, thorax, 8, 6);
  // dorsal black ridge
  put(new THREE.BoxGeometry(0.0011, 0.0006, 0.0115), C.black, [0, Y + 0.0057, -0.0008], thorax);
  // shoulder stripes: yellow, black, yellow on each side
  for (const s of [1, -1]) {
    const stripe = (z: number, color: string, w: number) => {
      const g = new THREE.BoxGeometry(0.0006, 0.0072, w);
      g.rotateX(0.35);
      put(g, color, [s * 0.0042, Y + 0.0006, z], thorax);
    };
    stripe(0.0022, C.yellow, 0.0014);
    stripe(0.0003, C.black, 0.0009);
    stripe(-0.0018, C.yellow, 0.0014);
    stripe(-0.0042, C.black, 0.0008);
    // small yellow spot near top
    ball([s * 0.0022, Y + 0.0052, 0.003], 0.0007, C.yellow, thorax, 5, 4);
  }
  // prothorax "neck" collar
  ellip([0, Y + 0.0004, 0.0066], 0.0026, 0.0024, 0.0018, C.greenDark, thorax, 7, 5);
  ellip([0, Y + 0.0024, 0.0064], 0.0016, 0.0006, 0.0010, C.yellow, thorax, 6, 4);

  // ---------- head ----------
  // face / frons
  ellip([0, Y + 0.0002, 0.0125], 0.0040, 0.0034, 0.0027, C.face, head, 8, 6);
  ellip([0, Y + 0.0012, 0.0148], 0.0026, 0.0012, 0.0010, C.yellow, head, 6, 4);
  // compound eyes (faceted icosahedra)
  for (const s of [1, -1]) {
    put(new THREE.IcosahedronGeometry(0.0036, 1), C.eye, [s * 0.0027, Y + 0.0022, 0.0112], head);
    // darker lower band of the eye
    put(new THREE.IcosahedronGeometry(0.0030, 1), C.eyeDark, [s * 0.0034, Y + 0.0006, 0.0108], head);
    // pseudo-pupil and highlight
    ball([s * 0.0044, Y + 0.0024, 0.0141], 0.0009, C.eyeDark, head, 6, 4);
    ball([s * 0.0044, Y + 0.0048, 0.0129], 0.0007, C.white, head, 5, 4);
    // antenna
    rod([s * 0.0006, Y + 0.0026, 0.0148], [s * 0.0017, Y + 0.0044, 0.0170], 0.00014, 0.00009, C.black, 4, head);
  }
  // ocelli
  ball([0, Y + 0.0029, 0.0143], 0.00035, C.black, head, 4, 3);
  ball([0.0008, Y + 0.0026, 0.0141], 0.00028, C.black, head, 4, 3);
  ball([-0.0008, Y + 0.0026, 0.0141], 0.00028, C.black, head, 4, 3);
  // occipital spot at back of head
  ball([0, Y + 0.0040, 0.0085], 0.0008, C.yellow, head, 5, 4);
  // labrum (upper lip) and mandibles on head
  put(new THREE.BoxGeometry(0.0032, 0.0011, 0.0012), C.lip, [0, Y - 0.0015, 0.0146], head);
  for (const s of [1, -1]) {
    cone([s * 0.0011, Y - 0.0021, 0.0143], [-s * 0.6, -0.3, 0.7], 0.0014, 0.00035, C.legBrown, 4, head);
  }
  // labium (lower jaw)
  put(new THREE.BoxGeometry(0.0034, 0.0008, 0.0028), C.lip, [0, Y - 0.0029, 0.0136], jaw);
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.0010, 0.0006, 0.0012), C.face, [s * 0.0011, Y - 0.0030, 0.0152], jaw);
  }

  // ---------- abdomen ----------
  let s0 = 0;
  for (let i = 0; i < segL.length; i++) {
    const L = segL[i];
    const r = segR[i];
    const tip = i >= 7;
    const col = tip ? C.navy : i < 2 ? C.azureLight : C.azure;
    rod(abAt(s0), abAt(s0 + L), r, r * 0.93, col, 7);
    // black ring at the segment joint
    rod(abAt(s0), abAt(s0 + 0.0007), r * 1.1, r * 1.1, C.black, 7);
    const mid = v3(abAt(s0 + L * 0.55));
    if (i >= 2 && i <= 7) {
      // dorsal diamond marking
      const g = new THREE.OctahedronGeometry(1, 0).scale(0.0007, 0.00035, L * 0.3);
      put(g, C.black, arr(mid.clone().add(new THREE.Vector3(0, r * 0.93, 0))));
      // lateral thin stripes
      for (const s of [1, -1]) {
        put(new THREE.BoxGeometry(0.00025, 0.0004, L * 0.55), C.black,
          arr(mid.clone().add(new THREE.Vector3(s * r * 0.9, 0.0002, 0))));
      }
    }
    if (tip && i <= 8) {
      for (const s of [1, -1]) {
        ball(arr(mid.clone().add(new THREE.Vector3(s * r * 0.75, r * 0.55, 0))), r * 0.38, C.paleBlue, undefined, 5, 4);
      }
    }
    if (i === 1) {
      // auricles on S2
      for (const s of [1, -1]) {
        ball(arr(mid.clone().add(new THREE.Vector3(s * r * 0.95, 0, 0))), 0.0006, C.yellow, undefined, 5, 4);
      }
    }
    s0 += L;
  }
  const E = abAt(abLen);
  for (const s of [1, -1]) cone(E, [s * 0.25, 0.05, -1], 0.0028, 0.0003, C.cerci, 4);
  cone(E, [0, -0.3, -1], 0.0018, 0.00028, C.navy, 4);

  // ---------- wings ----------
  const Zax = new THREE.Vector3(0, 0, 1);
  const Yax = new THREE.Vector3(0, 1, 0);
  const sm = (x: number) => {
    const t = Math.min(1, Math.max(0, x));
    return t * t * (3 - 2 * t);
  };
  const wing = (name: string, s: number, rootZ: number, chord: number, sweep: number, hind: boolean) => {
    const span = 0.044;
    const root: P3 = [s * 0.0022, Y + 0.0047, rootZ];
    const ay = -s * sweep;
    const bz = s * 0.05;
    const env = (u: number) =>
      (hind ? 0.55 + 0.45 * sm(u / 0.15) : 0.3 + 0.7 * sm(u / 0.3)) *
      Math.sqrt(Math.max(0, 1 - Math.pow(u, 2.4)));
    const lead = (u: number) => 0.32 * env(u) * chord;
    const trail = (u: number) => -0.68 * env(u) * chord * (hind ? 1 + 0.7 * Math.pow(1 - u, 3) : 1);
    const P = (u: number, v: number, h = 0): P3 => {
      const p = new THREE.Vector3(s * u * span, h, v);
      p.applyAxisAngle(Zax, bz);
      p.applyAxisAngle(Yax, ay);
      return [root[0] + p.x, root[1] + p.y, root[2] + p.z];
    };
    const F = (u: number, f: number, h = 0.00008) => P(u, lead(u) + f * (trail(u) - lead(u)), h);

    b.chain(name, [P(0, 0), P(0.5, 0), P(1, 0)], { parent: thorax, role: "wing" });

    // membrane
    const N = 14;
    const sh = new THREE.Shape();
    sh.moveTo(0, lead(0));
    for (let i = 1; i <= N; i++) {
      const u = i / N;
      sh.lineTo(s * u * span, lead(u));
    }
    for (let i = N - 1; i >= 0; i--) {
      const u = i / N;
      sh.lineTo(s * u * span, trail(u));
    }
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.00015, bevelEnabled: false });
    g.rotateX(Math.PI / 2);
    g.rotateZ(bz);
    g.rotateY(ay);
    put(g, C.membrane, root);

    // veins
    const vein = (f: number, u0: number, u1: number, r: number) => {
      const n = 6;
      for (let i = 0; i < n; i++) {
        const ua = u0 + ((u1 - u0) * i) / n;
        const ub = u0 + ((u1 - u0) * (i + 1)) / n;
        rod(F(ua, f), F(ub, f), r, r * 0.9, C.vein, 4);
      }
    };
    vein(0.0, 0.0, 0.97, 0.00016);
    vein(0.22, 0.02, 0.9, 0.0001);
    vein(0.45, 0.02, 0.85, 0.0001);
    vein(0.7, 0.03, 0.7, 0.00009);
    if (hind) vein(0.88, 0.02, 0.35, 0.00009);
    for (const u of [0.1, 0.25, 0.45, 0.6, 0.75]) {
      const f1 = u > 0.68 ? 0.45 : 0.7;
      rod(F(u, 0), F(u, f1), u === 0.45 ? 0.00013 : 0.00008, u === 0.45 ? 0.00013 : 0.00008, C.vein, 4);
    }

    // pterostigma
    const st = new THREE.BoxGeometry(0.0032, 0.00028, 0.0009);
    st.rotateZ(bz);
    st.rotateY(ay);
    put(st, C.stigma, P(0.84, lead(0.84) - 0.0005, 0.0001));

    // amber base patch
    const bp = new THREE.SphereGeometry(1, 8, 4).scale(hind ? 0.0045 : 0.0028, 0.0001, chord * (hind ? 0.4 : 0.25));
    bp.rotateZ(bz);
    bp.rotateY(ay);
    put(bp, C.amber, P(0.07, (lead(0.07) + trail(0.07)) * 0.5, 0.00006));

    // hinge
    ball(root, 0.0007, C.black, thorax, 5, 4);
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    wing("foreWing" + side, s, 0.0018, 0.0092, 0.1, false);
    wing("hindWing" + side, s, -0.0038, 0.011, -0.12, true);
  }

  // ---------- legs ----------
  const hipZ = [0.0042, 0.0012, -0.0018];
  const fwd = [0.006, 0.0005, -0.006];
  const names = ["Front", "Mid", "Hind"];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let k = 0; k < 3; k++) {
      const zH = hipZ[k];
      const fz = fwd[k];
      const hip: P3 = [s * 0.0016, Y - 0.0042, zH];
      const cox: P3 = [s * 0.0026, Y - 0.0050, zH + fz * 0.08];
      const knee: P3 = [s * 0.0072, Y + 0.0005, zH + fz * 0.6];
      const ankle: P3 = [s * 0.0115, Y - 0.0115, zH + fz];
      const toe: P3 = [s * 0.0135, 0.0004, zH + fz * 1.25];
      b.chain("leg" + names[k] + side, [hip, cox, knee, ankle, toe], { parent: thorax, role: "leg" });

      rod(hip, cox, 0.0007, 0.0006, C.greenDark, 5);
      rod(cox, knee, 0.00045, 0.00036, C.legBrown, 5);
      rod(knee, ankle, 0.00032, 0.00022, C.black, 5);
      rod(ankle, toe, 0.0002, 0.00016, C.black, 4);
      ball(cox, 0.00062, C.black, undefined, 5, 4);
      ball(knee, 0.00045, C.black, undefined, 5, 4);
      ball(ankle, 0.0003, C.black, undefined, 4, 3);

      // inward bristles on tibia and femur
      const td = v3(ankle).sub(v3(knee)).normalize();
      const spineDir = arr(td.clone().multiplyScalar(0.5).add(new THREE.Vector3(-s * 0.8, 0.15, 0)));
      for (const t of [0.2, 0.4, 0.6, 0.8]) {
        const p = arr(v3(knee).lerp(v3(ankle), t));
        cone(p, spineDir, 0.0012, 0.00009, C.black, 3);
      }
      const fd = v3(knee).sub(v3(cox)).normalize();
      const fSpine = arr(fd.clone().multiplyScalar(0.4).add(new THREE.Vector3(0, -0.9, 0)));
      for (const t of [0.4, 0.7]) {
        cone(arr(v3(cox).lerp(v3(knee), t)), fSpine, 0.0009, 0.00008, C.black, 3);
      }
      // tarsal claws touching the floor
      for (const cz of [0.4, -0.4]) {
        cone(toe, [s * 0.4, -1, cz + fz * 40], 0.0008, 0.0001, C.legBrown, 3);
      }
    }
  }

  return b.root;
}
```