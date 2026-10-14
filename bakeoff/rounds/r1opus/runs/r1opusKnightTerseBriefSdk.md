```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A stylized plate-armored knight in a rigging rest pose: barrel great helm with a hinged visor, gold coronet and crimson plume, layered pauldrons, heraldic tabard, kite shield on the left arm, sheathed longsword, rondel dagger and a three-segment cape.",
};

export default function build() {
  const b: any = createBuilder({ name: "knight" });
  const R: any = rng(1187);
  const rnd = (): number =>
    typeof R === "function" ? R() : typeof R.next === "function" ? R.next() : R.float();

  // ---------- palette ----------
  const C = {
    steel: "#c6cdd6",
    steelMid: "#a3adb9",
    steelDark: "#5f6874",
    gold: "#e2aa3c",
    mail: "#868e98",
    blue: "#22408c",
    crimson: "#b51f2e",
    white: "#f2ebd9",
    leather: "#6e4226",
    leatherDark: "#3a2416",
    black: "#14161b",
    gem: "#d81f3d",
  };

  // ---------- geometry helpers ----------
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const dome = (r: number, w = 8, h = 3) =>
    new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
  const ringY = (r: number, t: number, seg = 8) =>
    new THREE.TorusGeometry(r, t, 4, seg).rotateX(Math.PI / 2);
  const ringX = (r: number, t: number, seg = 8) =>
    new THREE.TorusGeometry(r, t, 4, seg).rotateY(Math.PI / 2);
  const ext = (shape: THREE.Shape, depth: number) =>
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 4 }).translate(
      0,
      0,
      -depth / 2
    );

  const P = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(geo, color, { at, bone });

  const J = (name: string, at: number[], parent?: any, role?: string) => {
    const o: any = { at };
    if (parent) o.parent = parent;
    if (role) o.role = role;
    return b.joint(name, o);
  };

  // heraldic cross pattée
  function pattee(r: number) {
    const a = r * 0.16;
    const e = r * 0.42;
    const pts = [
      [-a, a], [-e, r], [e, r], [a, a], [r, e], [r, -e],
      [a, -a], [e, -r], [-e, -r], [-a, -a], [-r, -e], [-r, e],
    ];
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    return s;
  }
  // heater shield outline
  function heater(k: number) {
    const s = new THREE.Shape();
    s.moveTo(-0.22 * k, 0.26 * k);
    s.lineTo(0.22 * k, 0.26 * k);
    s.lineTo(0.22 * k, 0.02 * k);
    s.quadraticCurveTo(0.2 * k, -0.22 * k, 0, -0.36 * k);
    s.quadraticCurveTo(-0.2 * k, -0.22 * k, -0.22 * k, 0.02 * k);
    s.closePath();
    return s;
  }
  // dagged tabard panel, origin at top centre
  function tabard(w: number, h: number, k: number) {
    const s = new THREE.Shape();
    const hw = (w / 2) * k;
    const hh = h * k;
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, -hh);
    const n = 8;
    for (let i = 1; i <= n; i++) {
      const x = hw - (2 * hw * i) / n;
      s.lineTo(x, i % 2 === 1 ? -hh + 0.05 : -hh);
    }
    s.closePath();
    return s;
  }
  function trap(wTop: number, wBot: number, len: number) {
    const s = new THREE.Shape();
    s.moveTo(-wTop / 2, 0);
    s.lineTo(wTop / 2, 0);
    s.lineTo(wBot / 2, -len);
    s.lineTo(-wBot / 2, -len);
    s.closePath();
    return s;
  }

  // ---------- skeleton ----------
  const hips = J("hips", [0, 1.0, 0], undefined, "spine");
  const spine = J("spine", [0, 1.16, 0], hips, "spine");
  const chest = J("chest", [0, 1.32, 0], spine, "spine");
  const neck = J("neck", [0, 1.5, 0], chest, "neck");
  const head = J("head", [0, 1.6, 0], neck, "head");
  const visor = J("visor", [0, 1.74, 0.06], head, "jaw");
  J("headTop", [0, 1.9, 0], head, "head");
  const plume = J("plume1", [0, 1.94, -0.03], head, "tail");
  J("plume2", [0, 2.0, -0.25], plume, "tail");

  const cape1 = J("cape1", [0, 1.47, -0.16], chest, "tail");
  const cape2 = J("cape2", [0, 1.0, -0.21], cape1, "tail");
  const cape3 = J("cape3", [0, 0.55, -0.25], cape2, "tail");
  J("capeEnd", [0, 0.18, -0.29], cape3, "tail");

  const sides: [number, string][] = [
    [1, "L"],
    [-1, "R"],
  ];
  const arm: any = {};
  const leg: any = {};
  for (const [s, n] of sides) {
    const sh = J(`shoulder${n}`, [s * 0.1, 1.44, 0], chest, "arm");
    const up = J(`arm${n}`, [s * 0.21, 1.46, 0], sh, "arm");
    const el = J(`elbow${n}`, [s * 0.48, 1.46, 0], up, "arm");
    const wr = J(`wrist${n}`, [s * 0.72, 1.46, 0], el, "arm");
    const fi = J(`fingers${n}`, [s * 0.83, 1.46, 0], wr, "digit");
    J(`fingersEnd${n}`, [s * 0.9, 1.46, 0], fi, "digit");
    const th = J(`thumb${n}`, [s * 0.76, 1.46, 0.05], wr, "digit");
    arm[n] = { sh, up, el, wr, fi, th };

    const hp = J(`hip${n}`, [s * 0.1, 0.96, 0], hips, "leg");
    const kn = J(`knee${n}`, [s * 0.11, 0.53, 0], hp, "leg");
    const an = J(`ankle${n}`, [s * 0.12, 0.1, 0], kn, "leg");
    const to = J(`toe${n}`, [s * 0.12, 0.04, 0.1], an, "leg");
    J(`toeEnd${n}`, [s * 0.12, 0.035, 0.24], to, "leg");
    leg[n] = { hp, kn, an, to };
  }

  // ---------- torso ----------
  P(cyl(0.21, 0.17, 0.3).scale(1, 1, 0.72), C.steel, [0, 1.33, 0], chest);
  P(sph(0.17, 8, 6).scale(1.12, 0.95, 0.62), C.steel, [0, 1.33, 0.05], chest);
  P(box(0.016, 0.1, 0.02), C.gold, [0, 1.245, 0.15], chest);
  P(ext(pattee(0.06), 0.012), C.gold, [0, 1.38, 0.158], chest);
  P(sph(0.012, 6, 4), C.gem, [0, 1.38, 0.166], chest);
  P(ringY(0.21, 0.014).scale(1, 1, 0.72), C.gold, [0, 1.48, 0], chest);
  P(ringY(0.17, 0.012).scale(1, 1, 0.72), C.gold, [0, 1.18, 0], chest);
  for (let i = 0; i < 7; i++) {
    const t = -1.2 + (2.4 * i) / 6;
    const r = 0.205;
    P(sph(0.01, 5, 3), C.gold, [r * Math.sin(t), 1.452, 0.72 * r * Math.cos(t) + 0.004], chest);
  }
  // lance rest
  P(box(0.03, 0.03, 0.07), C.steelDark, [-0.14, 1.3, 0.12], chest);
  P(box(0.03, 0.05, 0.015), C.steelDark, [-0.14, 1.32, 0.155], chest);

  // gorget + mail collar
  P(cyl(0.11, 0.15, 0.07).scale(1, 1, 0.85), C.steelMid, [0, 1.51, 0], chest);
  P(ringY(0.11, 0.01).scale(1, 1, 0.85), C.gold, [0, 1.545, 0], chest);
  P(cyl(0.075, 0.08, 0.1, 8), C.mail, [0, 1.565, 0], neck);

  // fauld lames
  P(cyl(0.17, 0.18, 0.05).scale(1, 1, 0.75), C.steelMid, [0, 1.155, 0], spine);
  P(ringY(0.18, 0.009).scale(1, 1, 0.75), C.gold, [0, 1.13, 0], spine);
  P(cyl(0.18, 0.19, 0.05).scale(1, 1, 0.75), C.steel, [0, 1.115, 0], spine);

  // belt
  P(cyl(0.195, 0.195, 0.035).scale(1, 1, 0.8), C.leather, [0, 1.075, 0], hips);
  P(box(0.055, 0.048, 0.015), C.gold, [0, 1.075, 0.162], hips);
  P(box(0.025, 0.022, 0.01), C.leatherDark, [0, 1.075, 0.169], hips);
  for (let i = 0; i < 10; i++) {
    const t = (i / 10) * Math.PI * 2 + 0.31;
    if (Math.abs(Math.sin(t)) < 0.2 && Math.cos(t) > 0) continue;
    P(sph(0.009, 5, 3), C.gold, [0.198 * Math.sin(t), 1.075, 0.8 * 0.198 * Math.cos(t)], hips);
  }

  // mail skirt
  P(cyl(0.19, 0.215, 0.18, 10).scale(1, 1, 0.75), C.mail, [0, 0.965, 0], hips);

  // tabard panels front + back
  for (const f of [1, -1]) {
    const flip = (g: THREE.BufferGeometry) => (f < 0 ? g.rotateY(Math.PI) : g);
    P(flip(ext(tabard(0.24, 0.44, 1.07), 0.01)), C.gold, [0, 1.075, f * 0.168], hips);
    P(flip(ext(tabard(0.24, 0.44, 1), 0.012)), C.blue, [0, 1.07, f * 0.176], hips);
    P(flip(ext(pattee(0.07), 0.01)), C.gold, [0, 0.86, f * 0.185], hips);
    P(sph(0.013, 6, 4), C.gem, [0, 0.86, f * 0.192], hips);
  }

  // sword in scabbard on left hip
  {
    const T = [0.26, 1.02, 0.07];
    const th = 0.45;
    const R_ = (g: THREE.BufferGeometry) => g.rotateX(th);
    P(R_(box(0.05, 0.78, 0.028).translate(0, -0.39, 0)), C.leatherDark, T, hips);
    P(R_(box(0.06, 0.06, 0.034).translate(0, -0.04, 0)), C.gold, T, hips);
    P(R_(box(0.058, 0.025, 0.034).translate(0, -0.4, 0)), C.gold, T, hips);
    P(R_(box(0.058, 0.08, 0.034).translate(0, -0.74, 0)), C.gold, T, hips);
    P(R_(box(0.2, 0.022, 0.03).translate(0, 0.012, 0)), C.gold, T, hips);
    P(R_(box(0.03, 0.03, 0.034).translate(0.1, 0.012, 0)), C.gold, T, hips);
    P(R_(box(0.03, 0.03, 0.034).translate(-0.1, 0.012, 0)), C.gold, T, hips);
    P(R_(cyl(0.014, 0.014, 0.13, 6).translate(0, 0.09, 0)), C.leather, T, hips);
    P(R_(sph(0.027, 6, 5).translate(0, 0.175, 0)), C.gold, T, hips);
    P(R_(sph(0.011, 5, 3).translate(0, 0.175, 0.024)), C.gem, T, hips);
  }
  // rondel dagger on right hip
  {
    const T = [-0.235, 1.04, 0.05];
    P(box(0.032, 0.2, 0.022).translate(0, -0.11, 0), C.leatherDark, T, hips);
    P(box(0.034, 0.03, 0.024).translate(0, -0.2, 0), C.gold, T, hips);
    P(cyl(0.026, 0.026, 0.008, 8), C.gold, T, hips);
    P(cyl(0.01, 0.01, 0.08, 6).translate(0, 0.045, 0), C.leather, T, hips);
    P(cyl(0.022, 0.022, 0.008, 8).translate(0, 0.09, 0), C.gold, T, hips);
  }
  // belt pouch
  P(box(0.09, 0.09, 0.045), C.leather, [-0.13, 0.99, -0.16], hips);
  P(box(0.092, 0.04, 0.048), C.leatherDark, [-0.13, 1.02, -0.16], hips);
  P(sph(0.008, 5, 3), C.gold, [-0.13, 1.0, -0.186], hips);

  // ---------- helm ----------
  P(cyl(0.14, 0.145, 0.24).rotateY(Math.PI / 8), C.steel, [0, 1.71, 0], head);
  P(dome(0.14).rotateY(Math.PI / 8).scale(1, 0.55, 1), C.steel, [0, 1.83, 0], head);
  P(ringY(0.146, 0.012).rotateY(Math.PI / 8), C.gold, [0, 1.6, 0], head);
  P(ringY(0.145, 0.015).rotateY(Math.PI / 8), C.gold, [0, 1.828, 0], head);
  for (let k = 0; k < 8; k++) {
    const a = Math.PI / 8 + (k * Math.PI) / 4;
    P(
      new THREE.ConeGeometry(0.02, 0.055, 4),
      C.gold,
      [0.142 * Math.sin(a), 1.865, 0.142 * Math.cos(a)],
      head
    );
  }
  P(sph(0.016, 6, 4), C.gem, [0, 1.828, 0.158], head);
  P(cyl(0.02, 0.026, 0.05, 6), C.gold, [0, 1.92, -0.02], head);

  // hinged visor (jaw role)
  P(box(0.17, 0.2, 0.03), C.steel, [0, 1.69, 0.145], visor);
  P(box(0.055, 0.02, 0.01), C.black, [0.05, 1.735, 0.161], visor);
  P(box(0.055, 0.02, 0.01), C.black, [-0.05, 1.735, 0.161], visor);
  P(box(0.024, 0.2, 0.012), C.gold, [0, 1.69, 0.164], visor);
  P(box(0.17, 0.022, 0.012), C.gold, [0, 1.765, 0.163], visor);
  for (const sx of [1, -1])
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 2; c++)
        P(box(0.02, 0.008, 0.008), C.black, [sx * (0.035 + c * 0.03), 1.62 + r * 0.025, 0.162], visor);
  P(sph(0.012, 6, 4), C.gold, [0.088, 1.74, 0.148], visor);
  P(sph(0.012, 6, 4), C.gold, [-0.088, 1.74, 0.148], visor);

  // plume
  {
    const B = [0, 1.94, -0.03];
    for (let i = 0; i < 9; i++) {
      const a = -0.25 + i * 0.24;
      const dir = [0, Math.cos(a), -Math.sin(a)];
      const len = 0.15 + 0.03 * Math.sin((i / 8) * Math.PI);
      const g = sph(0.042, 6, 4)
        .scale(0.85, len / 0.042, 0.5)
        .rotateX(-a);
      const jx = (rnd() - 0.5) * 0.02;
      const col = i % 3 === 1 ? C.white : C.crimson;
      P(g, col, [B[0] + jx, B[1] + dir[1] * len, B[2] + dir[2] * len], plume);
    }
  }

  // ---------- arms ----------
  for (const [s, n] of sides) {
    const A = arm[n];
    const rotX = (g: THREE.BufferGeometry) => g.rotateZ(Math.PI / 2);
    P(sph(0.07, 6, 5), C.mail, [s * 0.18, 1.45, 0], A.sh);
    P(rotX(cyl(0.055, 0.05, 0.28, 7)), C.mail, [s * 0.35, 1.46, 0], A.up);
    P(rotX(cyl(0.062, 0.058, 0.13)), C.steel, [s * 0.4, 1.46, 0], A.up);
    // pauldron
    P(dome(0.125).scale(1, 0.8, 1.1).rotateZ(-s * 0.35), C.steel, [s * 0.25, 1.5, 0], A.sh);
    P(ringY(0.125, 0.012).scale(1, 1, 1.1).rotateZ(-s * 0.35), C.gold, [s * 0.25, 1.5, 0], A.sh);
    for (let i = 0; i < 3; i++) {
      const r = 0.09 - 0.006 * i;
      P(rotX(cyl(r, r, 0.04)), i === 1 ? C.steelMid : C.steel, [s * (0.29 + 0.035 * i), 1.465, 0], A.up);
    }
    P(ringX(0.078, 0.008), C.gold, [s * 0.37, 1.465, 0], A.up);
    P(box(0.012, 0.06, 0.17), C.steelMid, [s * 0.19, 1.585, 0], A.sh);
    P(box(0.014, 0.012, 0.172), C.gold, [s * 0.19, 1.617, 0], A.sh);
    // couter
    P(sph(0.062, 8, 6), C.steel, [s * 0.48, 1.46, 0], A.el);
    P(cyl(0.066, 0.066, 0.012).rotateX(Math.PI / 2), C.steelMid, [s * 0.48, 1.46, -0.07], A.el);
    P(sph(0.013, 6, 4), C.gold, [s * 0.48, 1.46, -0.079], A.el);
    // vambrace
    P(rotX(cyl(0.05, 0.045, 0.2)), C.steel, [s * 0.6, 1.46, 0], A.el);
    P(ringX(0.05, 0.009), C.gold, [s * 0.505, 1.46, 0], A.el);
    P(ringX(0.046, 0.009), C.gold, [s * 0.695, 1.46, 0], A.el);
    // gauntlet
    P(cyl(0.05, 0.068, 0.07).rotateZ((s * Math.PI) / 2), C.steelMid, [s * 0.735, 1.46, 0], A.wr);
    P(ringX(0.068, 0.008), C.gold, [s * 0.77, 1.46, 0], A.wr);
    P(box(0.07, 0.035, 0.085), C.steel, [s * 0.79, 1.46, 0], A.wr);
    P(box(0.012, 0.04, 0.088), C.gold, [s * 0.822, 1.462, 0], A.wr);
    for (const z of [-0.03, -0.01, 0.01, 0.03]) {
      P(box(0.07, 0.026, 0.019), C.steel, [s * 0.865, 1.458, z], A.fi);
      P(box(0.008, 0.028, 0.02), C.steelDark, [s * 0.865, 1.458, z], A.fi);
    }
    P(box(0.03, 0.026, 0.055), C.steel, [s * 0.775, 1.455, 0.068], A.th);
  }

  // ---------- shield (left forearm) ----------
  {
    const el = arm.L.el;
    const c = [0.6, 1.44, 0];
    const at = (x: number, y: number, z: number) => [c[0] + x, c[1] + y, c[2] + z];
    P(ext(heater(1.07), 0.03), C.gold, at(0, 0, 0.075), el);
    P(ext(heater(1), 0.02), C.blue, at(0, 0, 0.096), el);
    P(box(0.44, 0.07, 0.012), C.crimson, at(0, 0.215, 0.106), el);
    for (const x of [-0.12, 0, 0.12]) P(cyl(0.018, 0.018, 0.008, 8).rotateX(Math.PI / 2), C.gold, at(x, 0.215, 0.114), el);
    P(ext(pattee(0.12), 0.01), C.gold, at(0, -0.03, 0.11), el);
    P(dome(0.035).rotateX(Math.PI / 2), C.steel, at(0, -0.03, 0.114), el);
    const pts = heater(0.9).getSpacedPoints(14).slice(0, 14);
    for (const p of pts) P(sph(0.009, 5, 3), C.steel, at(p.x, p.y, 0.107), el);
  }

  // ---------- legs ----------
  for (const [s, n] of sides) {
    const L = leg[n];
    // tassets
    P(box(0.03, 0.1, 0.15).rotateZ(s * 0.18), C.steel, [s * 0.205, 0.97, 0], L.hp);
    P(box(0.03, 0.09, 0.14).rotateZ(s * 0.22), C.steelMid, [s * 0.222, 0.89, 0], L.hp);
    P(sph(0.011, 5, 3), C.gold, [s * 0.223, 0.98, 0], L.hp);
    // thigh
    P(cyl(0.08, 0.07, 0.4, 7), C.mail, [s * 0.105, 0.75, -0.005], L.hp);
    P(cyl(0.088, 0.074, 0.34), C.steel, [s * 0.105, 0.76, 0.01], L.hp);
    P(ringY(0.075, 0.008), C.gold, [s * 0.105, 0.6, 0.01], L.hp);
    // poleyn
    P(sph(0.065, 8, 6).scale(1, 0.9, 1), C.steel, [s * 0.11, 0.53, 0.025], L.kn);
    P(cyl(0.055, 0.055, 0.012).rotateZ(Math.PI / 2), C.steelMid, [s * 0.18, 0.53, 0.02], L.kn);
    P(sph(0.012, 6, 4), C.gold, [s * 0.188, 0.53, 0.02], L.kn);
    P(sph(0.012, 6, 4), C.gold, [s * 0.11, 0.53, 0.088], L.kn);
    // greave
    P(cyl(0.068, 0.05, 0.38), C.steel, [s * 0.115, 0.31, 0], L.kn);
    P(ringY(0.068, 0.008), C.gold, [s * 0.115, 0.495, 0], L.kn);
    P(ringY(0.051, 0.008), C.gold, [s * 0.115, 0.125, 0], L.kn);
    // sabaton
    P(box(0.11, 0.03, 0.3), C.leatherDark, [s * 0.12, 0.015, 0.055], L.an);
    P(box(0.09, 0.08, 0.08), C.steel, [s * 0.12, 0.07, -0.06], L.an);
    P(cyl(0.055, 0.06, 0.05), C.steelMid, [s * 0.12, 0.11, -0.01], L.an);
    for (let i = 0; i < 4; i++) {
      const h = 0.075 - 0.012 * i;
      P(
        box(0.1 - 0.006 * i, h, 0.06),
        i % 2 ? C.steelMid : C.steel,
        [s * 0.12, 0.03 + h / 2, -0.01 + 0.05 * i],
        i < 2 ? L.an : L.to
      );
    }
    P(box(0.09, 0.008, 0.012), C.gold, [s * 0.12, 0.109, 0.005], L.an);
    P(
      new THREE.ConeGeometry(0.035, 0.09, 4).rotateY(Math.PI / 4).rotateX(Math.PI / 2),
      C.steel,
      [s * 0.12, 0.036, 0.2],
      L.to
    );
    // spur
    P(cyl(0.006, 0.006, 0.07, 5).rotateX(Math.PI / 2), C.gold, [s * 0.12, 0.07, -0.13], L.an);
    P(cyl(0.024, 0.024, 0.006, 6).rotateZ(Math.PI / 2), C.gold, [s * 0.12, 0.07, -0.165], L.an);
  }

  // ---------- cape ----------
  {
    const segs = [
      { bone: cape1, top: [0, 1.47, -0.16], bot: [0, 1.0, -0.21], w0: 0.4, w1: 0.5 },
      { bone: cape2, top: [0, 1.0, -0.21], bot: [0, 0.55, -0.25], w0: 0.5, w1: 0.6 },
      { bone: cape3, top: [0, 0.55, -0.25], bot: [0, 0.18, -0.29], w0: 0.6, w1: 0.68 },
    ];
    segs.forEach((sg, i) => {
      const dy = sg.top[1] - sg.bot[1];
      const dz = sg.top[2] - sg.bot[2];
      const len = Math.hypot(dy, dz);
      const th = Math.atan2(dz, dy);
      P(ext(trap(sg.w0, sg.w1, len), 0.02).rotateX(th), C.crimson, sg.top, sg.bone);
      if (i === 1) {
        P(
          ext(pattee(0.12), 0.01).rotateY(Math.PI).translate(0, -len * 0.45, -0.016).rotateX(th),
          C.gold,
          sg.top,
          sg.bone
        );
      }
      if (i === 2) {
        P(box(sg.w1 + 0.01, 0.03, 0.026).rotateX(th), C.gold, [sg.bot[0], sg.bot[1] + 0.015, sg.bot[2]], sg.bone);
      }
    });
    for (const sx of [1, -1]) {
      P(sph(0.032, 8, 6).scale(1, 1, 0.5), C.gold, [sx * 0.19, 1.48, -0.17], chest);
      P(sph(0.012, 6, 4), C.gem, [sx * 0.19, 1.48, -0.186], chest);
    }
  }

  return b.root;
}
```