```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Pufferfish",
  description:
    "Stylized inflated pufferfish: a golden faceted ball covered in two-tone spines, grumpy half-lidded teal eyes, a puckered beak mouth with a separate opening jaw, scalloped fan fins and a two-tone tail. Rigged with body, jaw, eye, fin and tail joints.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const arr = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];

export default function build() {
  const b = createBuilder({ name: "pufferfish" });
  const R: any = rng(7319);
  const rand = (): number =>
    typeof R === "function" ? R() : typeof R.next === "function" ? R.next() : R.float();

  const COL = {
    body: "#eab543",
    belly: "#fbf0d4",
    spot: "#4e2f17",
    ocellus: "#f7d36a",
    spineTop: "#b07422",
    tipTop: "#3b2210",
    spineSide: "#d79c37",
    tipSide: "#5a3416",
    spineBelly: "#f1dfb2",
    tipBelly: "#c79d63",
    fin: "#ffa940",
    ray: "#d96a1f",
    finEdge: "#6b3a17",
    sclera: "#fff8ea",
    gold: "#f2c230",
    iris: "#2ea58e",
    pupil: "#111317",
    shine: "#ffffff",
    socket: "#c58a2a",
    lidLine: "#6e4119",
    lip: "#f4b07a",
    mouth: "#6e1f24",
    tooth: "#fffdf2",
    cheek: "#f4917e",
    nostril: "#4a2a12",
    speck: "#f6e2b4",
    band: "#5a3518",
  };

  // ---------- body shape (ellipsoid) ----------
  const RX = 0.17, RY = 0.155, RZ = 0.18;
  const UP = V(0, 1, 0);
  const FWD = V(0, 0, 1);

  const surfLocal = (d: THREE.Vector3) => {
    const u = d.clone().normalize();
    const t = 1 / Math.sqrt((u.x / RX) ** 2 + (u.y / RY) ** 2 + (u.z / RZ) ** 2);
    return u.multiplyScalar(t);
  };
  const normalAt = (p: THREE.Vector3) =>
    V(p.x / (RX * RX), p.y / (RY * RY), p.z / (RZ * RZ)).normalize();

  const basis = (yDir: THREE.Vector3, hint: THREE.Vector3 = UP) => {
    const y = yDir.clone().normalize();
    let h = hint.clone().normalize();
    if (Math.abs(h.dot(y)) > 0.95) h = V(1, 0, 0);
    if (Math.abs(h.dot(y)) > 0.95) h = V(0, 0, 1);
    const x = h.sub(y.clone().multiplyScalar(h.dot(y))).normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    return new THREE.Matrix4().makeBasis(x, y, z);
  };

  // ---------- feature directions ----------
  const eyeDir = (s: number) => V(0.6 * s, 0.42, 0.68).normalize();
  const mouthDir = V(0, -0.12, 1).normalize();
  const tailDir = V(0, 0, -1);
  const finDir = (s: number) => V(s, -0.05, -0.12).normalize();
  const cheekDir = (s: number) => V(0.55 * s, -0.15, 0.82).normalize();
  const dorsalDir = V(0, 0.5, -0.87).normalize();
  const analDir = V(0, -0.45, -0.89).normalize();

  const keepOut: [THREE.Vector3, number][] = [
    [eyeDir(1), 0.45],
    [eyeDir(-1), 0.45],
    [mouthDir, 0.42],
    [tailDir, 0.36],
    [finDir(1), 0.3],
    [finDir(-1), 0.3],
    [cheekDir(1), 0.2],
    [cheekDir(-1), 0.2],
    [dorsalDir, 0.24],
    [analDir, 0.22],
  ];
  const near = (u: THREE.Vector3, scale = 1) =>
    keepOut.some(([d, a]) => Math.acos(Math.min(1, Math.max(-1, u.dot(d)))) < a * scale);

  // ---------- spine layout pre-pass (to rest exactly on the floor) ----------
  type Spine = { p: THREE.Vector3; n: THREE.Vector3; d: THREE.Vector3; h: number; r: number; zone: number };
  const spines: Spine[] = [];
  const N = 190;
  const GA = Math.PI * (3 - Math.sqrt(5));
  let minY = -RY;
  for (let i = 0; i < N; i++) {
    const yv = 1 - (2 * (i + 0.5)) / N;
    const rr = Math.sqrt(Math.max(0, 1 - yv * yv));
    const th = i * GA;
    const u = V(rr * Math.cos(th), yv, rr * Math.sin(th));
    u.add(V((rand() - 0.5) * 0.08, (rand() - 0.5) * 0.08, (rand() - 0.5) * 0.08)).normalize();
    if (near(u)) continue;
    const p = surfLocal(u);
    const n = normalAt(p);
    const d = n.clone().add(V(0, 0, -0.32)).normalize();
    const h = 0.036 + rand() * 0.016;
    const r = 0.0068 + rand() * 0.0016;
    const zone = u.y < -0.26 ? 2 : u.y > 0.3 ? 0 : 1;
    spines.push({ p, n, d, h, r, zone });
    const tipY = p.y - n.y * 0.004 + d.y * h;
    if (tipY < minY) minY = tipY;
  }
  const cy = -minY - 0.002;
  const C = V(0, cy, 0);
  const W = (local: THREE.Vector3) => C.clone().add(local);

  // ---------- skeleton ----------
  const J = (name: string, at: THREE.Vector3, parent: any, role?: string, dir?: THREE.Vector3) => {
    const opts: any = { at: arr(at) };
    if (parent) opts.parent = parent;
    if (dir) opts.dir = arr(dir.clone().normalize());
    if (role) opts.role = role;
    const j: any = b.joint(name, opts);
    const o = j && (j.bone ?? j.object ?? j);
    if (role && o && o.userData) o.userData.role = role;
    return j;
  };

  const body = J("body", C, null, "spine", FWD);

  const put = (geo: THREE.BufferGeometry, color: string, at: THREE.Vector3, bone: any, m?: THREE.Matrix4) => {
    if (m) geo.applyMatrix4(m);
    return b.part(geo, color, { at: arr(at), bone });
  };

  // ---------- body + belly ----------
  const bodyGeo = new THREE.SphereGeometry(1, 18, 12);
  bodyGeo.scale(RX, RY, RZ);
  put(bodyGeo, COL.body, C, body);

  const TB = (7 * Math.PI) / 12;
  const bellyGeo = new THREE.SphereGeometry(1, 18, 5, 0, Math.PI * 2, TB, Math.PI - TB);
  bellyGeo.scale(RX * 1.006, RY * 1.006, RZ * 1.006);
  put(bellyGeo, COL.belly, C, body);

  const disc = (pLocal: THREE.Vector3, r: number, color: string, lift = 0, seg = 8) => {
    const n = normalAt(pLocal);
    const g = new THREE.CylinderGeometry(r, r, 0.004, seg);
    put(g, color, W(pLocal).addScaledVector(n, lift), body, basis(n));
  };
  const paramPoint = (theta: number, phi: number) =>
    V(Math.sin(theta) * Math.cos(phi) * RX, Math.cos(theta) * RY, Math.sin(theta) * Math.sin(phi) * RZ);

  // speckled transition along the belly line
  for (let k = 0; k < 26; k++) {
    const phi = (k / 26) * Math.PI * 2 + rand() * 0.1;
    const theta = TB - 0.07 - rand() * 0.08;
    const p = paramPoint(theta, phi);
    if (near(p.clone().normalize(), 0.8)) continue;
    disc(p, 0.005 + rand() * 0.004, COL.speck, 0.0005, 6);
  }

  // dark spots and golden-eyed ocelli over the back
  for (let k = 0; k < 60; k++) {
    const theta = 0.18 + rand() * 1.45;
    const phi = rand() * Math.PI * 2;
    const p = paramPoint(theta, phi);
    if (near(p.clone().normalize(), 1.05)) continue;
    const r = 0.008 + rand() * 0.009;
    disc(p, r, COL.spot, 0, 8);
    if (r > 0.013 && rand() < 0.6) disc(p, r * 0.45, COL.ocellus, 0.001, 6);
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pS = surfLocal(eyeDir(s));
    const n = normalAt(pS);
    const ER = 0.042;
    const ec = W(pS).addScaledVector(n, 0.014);
    const eye = J("eye" + side, ec, body, undefined, n);
    const gaze = n.clone().addScaledVector(FWD, 0.35).normalize();

    const sock = new THREE.TorusGeometry(ER * 0.97, 0.009, 5, 16);
    sock.rotateX(-Math.PI / 2);
    put(sock, COL.socket, W(pS).addScaledVector(n, 0.004), eye, basis(n));

    put(new THREE.SphereGeometry(ER, 14, 10), COL.sclera, ec, eye);

    const cap = (radius: number, theta: number, color: string, dir: THREE.Vector3, seg = 14) => {
      const g = new THREE.SphereGeometry(radius, seg, 4, 0, Math.PI * 2, 0, theta);
      put(g, color, ec, eye, basis(dir));
    };
    cap(ER * 1.012, 0.8, COL.gold, gaze);
    cap(ER * 1.022, 0.62, COL.iris, gaze);
    cap(ER * 1.032, 0.34, COL.pupil, gaze, 12);

    const hl1 = gaze.clone().addScaledVector(UP, 0.45).add(V(0.12, 0, 0)).normalize();
    put(new THREE.SphereGeometry(0.0075, 6, 4), COL.shine, ec.clone().addScaledVector(hl1, ER * 1.04), eye);
    const hl2 = gaze.clone().addScaledVector(UP, -0.25).add(V(-0.1, 0, 0)).normalize();
    put(new THREE.SphereGeometry(0.0038, 5, 3), COL.shine, ec.clone().addScaledVector(hl2, ER * 1.035), eye);

    // heavy upper lid for a grumpy-cute look
    const lidDir = UP.clone().addScaledVector(n, 0.2).addScaledVector(FWD, -0.1).normalize();
    const LR = ER * 1.09, LT = 0.76;
    const lid = new THREE.SphereGeometry(LR, 16, 5, 0, Math.PI * 2, 0, LT);
    put(lid, COL.body, ec, eye, basis(lidDir));
    const liner = new THREE.TorusGeometry(LR * Math.sin(LT), 0.0032, 4, 18);
    liner.rotateX(-Math.PI / 2);
    liner.translate(0, LR * Math.cos(LT), 0);
    put(liner, COL.lidLine, ec, eye, basis(lidDir));
  }

  // ---------- mouth (upper on body, lower on jaw) ----------
  const pM = surfLocal(mouthDir);
  const nM = normalAt(pM);
  const M = W(pM).addScaledVector(nM, 0.004);
  const jaw = J("jaw", M.clone().add(V(0, -0.002, -0.02)), body, "jaw", FWD);

  const inner = new THREE.CylinderGeometry(0.023, 0.023, 0.016, 12);
  inner.rotateX(Math.PI / 2);
  put(inner, COL.mouth, M.clone().addScaledVector(FWD, -0.006), body);

  const upperLip = new THREE.TorusGeometry(0.026, 0.011, 6, 10, Math.PI);
  upperLip.scale(1, 0.85, 1);
  put(upperLip, COL.lip, M.clone().add(V(0, 0.004, 0)), body);

  const lowerLip = new THREE.TorusGeometry(0.026, 0.011, 6, 10, Math.PI);
  lowerLip.rotateZ(Math.PI);
  lowerLip.scale(1, 0.85, 1);
  put(lowerLip, COL.lip, M.clone().add(V(0, -0.004, 0)), jaw);

  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.016, 0.009, 0.006), COL.tooth, M.clone().add(V(0.0085 * s, 0.008, 0.004)), body);
    put(new THREE.BoxGeometry(0.016, 0.009, 0.006), COL.tooth, M.clone().add(V(0.0085 * s, -0.008, 0.004)), jaw);
  }

  // nostrils and blush cheeks
  for (const s of [1, -1]) {
    const pn = surfLocal(V(0.11 * s, 0.22, 1));
    put(new THREE.SphereGeometry(0.0045, 6, 4), COL.nostril, W(pn), body);
    disc(surfLocal(cheekDir(s)), 0.021, COL.cheek, 0.0006, 10);
  }

  // ---------- fins ----------
  const fan = (len: number, half: number, baseHalf: number, rays: number, scallop: number, depth: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-baseHalf, 0);
    const steps = (rays - 1) * 2;
    const tips: number[] = [];
    for (let k = 0; k <= steps; k++) {
      const a = -half + (2 * half * k) / steps;
      const r = len * (k % 2 === 0 ? 1 : 1 - scallop);
      shape.lineTo(Math.sin(a) * r, Math.cos(a) * r);
      if (k % 2 === 0) tips.push(a);
    }
    shape.lineTo(baseHalf, 0);
    shape.closePath();
    const membrane = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 1 });
    membrane.translate(0, 0, -depth / 2);
    const rayGeos = tips.map((a) => {
      const L = len * 0.93;
      const g = new THREE.CylinderGeometry(depth * 0.55, depth * 0.85, L, 4);
      g.translate(0, L / 2, 0);
      g.rotateZ(-a);
      return g;
    });
    return { membrane, rayGeos };
  };

  const placeFan = (
    f: { membrane: THREE.BufferGeometry; rayGeos: THREE.BufferGeometry[] },
    at: THREE.Vector3,
    bone: any,
    out: THREE.Vector3,
    color = COL.fin,
    rayColor: string | null = COL.ray,
  ) => {
    const m = basis(out, UP);
    put(f.membrane, color, at, bone, m);
    if (rayColor) for (const g of f.rayGeos) put(g, rayColor, at, bone, m);
  };

  // pectoral fins: vertical paddles sticking out of the sides
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const p = surfLocal(finDir(s));
    const n = normalAt(p);
    const at = W(p).addScaledVector(n, -0.006);
    const out = V(s, 0.0, -0.7).normalize();
    const fj = J("fin" + side, at, body, "fan", out);
    placeFan(fan(0.075, 0.8, 0.014, 6, 0.13, 0.004), at, fj, out);
  }

  // dorsal and anal fins
  {
    const p = surfLocal(dorsalDir);
    const at = W(p).addScaledVector(normalAt(p), -0.006);
    const out = V(0, 0.6, -0.8).normalize();
    const dj = J("dorsalFin", at, body, "fan", out);
    placeFan(fan(0.06, 0.55, 0.012, 4, 0.14, 0.004), at, dj, out);
  }
  {
    const p = surfLocal(analDir);
    const at = W(p).addScaledVector(normalAt(p), -0.006);
    const out = V(0, -0.55, -0.83).normalize();
    const aj = J("analFin", at, body, "fan", out);
    placeFan(fan(0.052, 0.5, 0.011, 4, 0.14, 0.004), at, aj, out);
  }

  // ---------- tail ----------
  const t1 = C.clone().add(V(0, 0, -RZ * 0.8));
  const t2 = C.clone().add(V(0, 0.004, -RZ - 0.045));
  const t3 = C.clone().add(V(0, 0.008, -RZ - 0.075));
  const tail1 = J("tail1", t1, body, "tail", t2.clone().sub(t1));
  const tail2 = J("tail2", t2, tail1, "tail", t3.clone().sub(t2));
  const caudal = J("caudalFin", t3, tail2, "fan", V(0, 0, -1));

  const stalk = (a: THREE.Vector3, c: THREE.Vector3, rA: number, rC: number, bone: any) => {
    const dir = c.clone().sub(a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(rC, rA, len, 9);
    g.translate(0, len / 2, 0);
    put(g, COL.body, a, bone, basis(dir, UP));
  };
  stalk(t1, t2, 0.05, 0.034, tail1);
  stalk(t2, t3, 0.034, 0.027, tail2);
  const band = new THREE.CylinderGeometry(0.037, 0.037, 0.012, 9);
  put(band, COL.band, t2, tail2, basis(t3.clone().sub(t2), UP));

  // two-tone caudal fin: dark trailing margin behind an orange rayed fan
  const tailOut = V(0, 0, -1);
  placeFan(fan(0.105, 0.85, 0.016, 7, 0.1, 0.003), t3, caudal, tailOut, COL.finEdge, null);
  placeFan(fan(0.088, 0.85, 0.015, 7, 0.1, 0.005), t3, caudal, tailOut, COL.fin, COL.ray);

  // ---------- spines ----------
  const spineCols: [string, string][] = [
    [COL.spineTop, COL.tipTop],
    [COL.spineSide, COL.tipSide],
    [COL.spineBelly, COL.tipBelly],
  ];
  for (const sp of spines) {
    const at = W(sp.p).addScaledVector(sp.n, -0.004);
    const m = basis(sp.d);
    const [cBase, cTip] = spineCols[sp.zone];
    const lower = new THREE.CylinderGeometry(sp.r * 0.45, sp.r, sp.h * 0.62, 5, 1);
    lower.translate(0, sp.h * 0.31, 0);
    put(lower, cBase, at, body, m.clone());
    const tip = new THREE.ConeGeometry(sp.r * 0.45, sp.h * 0.38, 5);
    tip.translate(0, sp.h * 0.62 + sp.h * 0.19, 0);
    put(tip, cTip, at, body, m.clone());
  }

  return b.root;
}
```