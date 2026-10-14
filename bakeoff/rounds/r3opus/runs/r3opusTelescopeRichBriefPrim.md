```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "A polished brass explorer's telescope with leather-wrapped sections, engraved rings, finder scope, rubber eyecup and focus knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

type T3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "explorer_telescope" });

  // ---------- palette ----------
  const BRASS = "#c9a043";
  const BRASS_DK = "#8a6a22";
  const BRASS_HI = "#ecd27a";
  const LEATHER = "#5a3420";
  const STITCH = "#d9b98a";
  const MAHOG = "#6b2a1a";
  const MAHOG_DK = "#43180f";
  const RUBBER = "#1c1c1c";
  const GLASS = "#1d3550";
  const GLINT = "#bfe0ff";
  const PARCH = "#e8dcb5";
  const PARCH_DK = "#c9b88a";
  const INK = "#2a3a6a";
  const RIBBON = "#a8322a";

  const v = (a: T3) => new THREE.Vector3(a[0], a[1], a[2]);
  const P = (x: THREE.Vector3): T3 => [x.x, x.y, x.z];

  // ---------- skeleton ----------
  const HEAD_Y = 1.12;
  const C = new THREE.Vector3(0, 1.3, 0); // tilt pivot
  const root = b.joint("root", { at: [0, 0, 0] });
  const pan = b.joint("pan", { at: [0, HEAD_Y, 0], parent: root });
  const tilt = b.joint("tilt", { at: P(C), parent: pan });

  // generic oriented cylinder
  const cyl = (
    rt: number,
    rb: number,
    len: number,
    seg: number,
    color: string,
    at: THREE.Vector3,
    dir: THREE.Vector3,
    bone: any
  ) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, {
      at: P(at),
      dir: P(dir.clone().normalize()),
      bone,
    });

  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    at: THREE.Vector3,
    dir: THREE.Vector3,
    bone: any
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, {
      at: P(at),
      dir: P(dir.clone().normalize()),
      bone,
    });

  // ---------- TRIPOD ----------
  const TOP_R = 0.07,
    TOP_Y = 1.08,
    FOOT_R = 0.5,
    FOOT_Y = 0.06;
  const legAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const legPoint = (th: number, y: number) => {
    const t = (TOP_Y - y) / (TOP_Y - FOOT_Y);
    const r = TOP_R + (FOOT_R - TOP_R) * t;
    return new THREE.Vector3(Math.sin(th) * r, y, Math.cos(th) * r);
  };
  const UP = new THREE.Vector3(0, 1, 0);
  const X = new THREE.Vector3(1, 0, 0);

  legAngles.forEach((th, i) => {
    const T = legPoint(th, TOP_Y);
    const F = legPoint(th, FOOT_Y);
    const dir = F.clone().sub(T);
    const len = dir.length();
    const mid = T.clone().add(F).multiplyScalar(0.5);
    // main mahogany leg
    box(0.042, len, 0.03, MAHOG, mid, dir, root);
    // darker inner slat (sliding extension look) on lower half
    const lowMid = T.clone().lerp(F, 0.72);
    const inward = new THREE.Vector3(-Math.sin(th), 0, -Math.cos(th)).multiplyScalar(0.02);
    box(0.03, len * 0.5, 0.018, MAHOG_DK, lowMid.clone().add(inward), dir, root);
    // brass ferrules / clamps
    [0.12, 0.5, 0.94].forEach((t, k) => {
      const p = T.clone().lerp(F, t);
      cyl(0.03, 0.03, k === 1 ? 0.05 : 0.035, 8, k === 1 ? BRASS_HI : BRASS, p, dir, root);
    });
    // clamp thumb screw on the middle ferrule
    const pc = T.clone().lerp(F, 0.5);
    const out = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    cyl(0.006, 0.006, 0.04, 6, BRASS, pc.clone().add(out.clone().multiplyScalar(0.035)), out, root);
    cyl(0.016, 0.016, 0.01, 8, BRASS_HI, pc.clone().add(out.clone().multiplyScalar(0.055)), out, root);
    // foot: brass ferrule + spike touching floor
    cyl(0.022, 0.026, 0.05, 8, BRASS, F.clone().add(dir.clone().normalize().multiplyScalar(-0.01)), dir, root);
    b.part(new THREE.ConeGeometry(0.016, 0.06, 6), BRASS_DK, {
      at: [F.x, 0.03, F.z],
      dir: [0, -1, 0],
      bone: root,
    });
    // hinge pin at the head
    const side = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
    cyl(0.012, 0.012, 0.07, 8, BRASS_HI, T, side, root);
  });

  // tripod head
  cyl(0.11, 0.11, 0.025, 12, BRASS, new THREE.Vector3(0, TOP_Y + 0.02, 0), UP, root);
  cyl(0.085, 0.095, 0.05, 6, MAHOG, new THREE.Vector3(0, TOP_Y - 0.015, 0), UP, root);
  cyl(0.115, 0.115, 0.008, 12, BRASS_DK, new THREE.Vector3(0, TOP_Y + 0.036, 0), UP, root);
  // decorative brass studs around head
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
    b.part(new THREE.SphereGeometry(0.009, 6, 4), BRASS_HI, {
      at: [Math.sin(a) * 0.092, TOP_Y - 0.015, Math.cos(a) * 0.092],
      bone: root,
    });
  }

  // ---------- TRAY ----------
  const TRAY_Y = 0.42;
  cyl(0.3, 0.3, 0.02, 3, MAHOG, new THREE.Vector3(0, TRAY_Y, 0), UP, root);
  cyl(0.315, 0.315, 0.012, 3, BRASS, new THREE.Vector3(0, TRAY_Y - 0.012, 0), UP, root);
  cyl(0.12, 0.12, 0.022, 3, MAHOG_DK, new THREE.Vector3(0, TRAY_Y + 0.002, 0), new THREE.Vector3(0, -1, 0), root);
  legAngles.forEach((th) => {
    const corner = new THREE.Vector3(Math.sin(th) * 0.29, TRAY_Y, Math.cos(th) * 0.29);
    const lp = legPoint(th, TRAY_Y);
    const d = lp.clone().sub(corner);
    cyl(0.01, 0.01, Math.max(d.length() + 0.02, 0.03), 6, BRASS_HI, corner.clone().add(lp).multiplyScalar(0.5), d, root);
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { at: P(corner.clone().setY(TRAY_Y + 0.012)), bone: root });
  });

  // rolled star chart
  const chartY = TRAY_Y + 0.01 + 0.028;
  const chartC = new THREE.Vector3(-0.02, chartY, -0.03);
  cyl(0.028, 0.028, 0.24, 10, PARCH, chartC, X, root);
  cyl(0.0285, 0.0285, 0.02, 10, RIBBON, chartC.clone().add(new THREE.Vector3(0.04, 0, 0)), X, root);
  cyl(0.0285, 0.0285, 0.02, 10, RIBBON, chartC.clone().add(new THREE.Vector3(-0.05, 0, 0)), X, root);
  [-1, 1].forEach((s) => {
    cyl(0.02, 0.02, 0.004, 10, PARCH_DK, chartC.clone().add(new THREE.Vector3(s * 0.121, 0, 0)), X, root);
    cyl(0.009, 0.009, 0.006, 8, INK, chartC.clone().add(new THREE.Vector3(s * 0.121, 0, 0)), X, root);
  });
  // a little unrolled lip with stars inked on
  box(0.2, 0.003, 0.06, PARCH, chartC.clone().add(new THREE.Vector3(0, -0.026, 0.045)), UP, root);
  box(0.18, 0.002, 0.04, INK, chartC.clone().add(new THREE.Vector3(0, -0.023, 0.05)), UP, root);
  const starSpots: T3[] = [
    [-0.06, 0, 0.04],
    [-0.02, 0, 0.055],
    [0.03, 0, 0.042],
    [0.07, 0, 0.06],
    [0.0, 0, 0.065],
  ];
  starSpots.forEach((s) =>
    b.part(new THREE.OctahedronGeometry(0.004, 0), BRASS_HI, {
      at: P(chartC.clone().add(new THREE.Vector3(s[0], -0.02, s[2]))),
      bone: root,
    })
  );
  // ribbon tail
  box(0.012, 0.002, 0.05, RIBBON, chartC.clone().add(new THREE.Vector3(0.045, -0.026, 0.035)), UP, root);
  // pocket compass on tray
  const comp = new THREE.Vector3(0.1, TRAY_Y + 0.016, 0.1);
  cyl(0.035, 0.035, 0.014, 12, BRASS, comp, UP, root);
  cyl(0.029, 0.029, 0.003, 12, PARCH, comp.clone().add(new THREE.Vector3(0, 0.007, 0)), UP, root);
  box(0.004, 0.002, 0.045, RIBBON, comp.clone().add(new THREE.Vector3(0, 0.0095, 0)), UP, root);
  b.part(new THREE.TorusGeometry(0.009, 0.0025, 4, 8), BRASS_HI, {
    at: P(comp.clone().add(new THREE.Vector3(0, 0, 0.042))),
    bone: root,
  });

  // ---------- MOUNT (pan) ----------
  cyl(0.03, 0.035, 0.07, 10, BRASS, new THREE.Vector3(0, HEAD_Y + 0.055, 0), UP, pan);
  cyl(0.045, 0.045, 0.012, 10, BRASS_HI, new THREE.Vector3(0, HEAD_Y + 0.03, 0), UP, pan);
  box(0.17, 0.02, 0.05, BRASS, new THREE.Vector3(0, HEAD_Y + 0.095, 0), UP, pan);
  [-1, 1].forEach((s) => {
    const armBottom = HEAD_Y + 0.095;
    const h = C.y - armBottom + 0.02;
    box(0.014, h, 0.045, BRASS, new THREE.Vector3(s * 0.075, armBottom + h / 2, 0), UP, pan);
    // axle bosses
    cyl(0.02, 0.02, 0.02, 10, BRASS_HI, new THREE.Vector3(s * 0.09, C.y, 0), X, pan);
  });
  // pan lock lever
  cyl(0.007, 0.007, 0.09, 6, BRASS_DK, new THREE.Vector3(0, HEAD_Y + 0.06, -0.075), new THREE.Vector3(0, 0, -1), pan);
  b.part(new THREE.SphereGeometry(0.014, 8, 6), MAHOG_DK, { at: [0, HEAD_Y + 0.06, -0.125], bone: pan });

  // ---------- TELESCOPE (tilt) ----------
  const ang = (25 * Math.PI) / 180;
  const D = new THREE.Vector3(0, Math.sin(ang), Math.cos(ang)); // optical axis
  const U = new THREE.Vector3(0, Math.cos(ang), -Math.sin(ang)); // tube "up"
  const pt = (s: number, up = 0, side = 0) =>
    C.clone().add(D.clone().multiplyScalar(s)).add(U.clone().multiplyScalar(up)).add(X.clone().multiplyScalar(side));
  const seg = (s0: number, s1: number, r0: number, r1: number, color: string, n = 16, up = 0) =>
    cyl(r1, r0, s1 - s0, n, color, pt((s0 + s1) / 2, up), D, tilt);

  // tilt axle + knobs
  cyl(0.008, 0.008, 0.2, 6, BRASS_DK, C, X, tilt);
  [-1, 1].forEach((s) => {
    cyl(0.026, 0.026, 0.016, 10, MAHOG_DK, C.clone().add(new THREE.Vector3(s * 0.11, 0, 0)), X, tilt);
    cyl(0.012, 0.012, 0.01, 8, BRASS_HI, C.clone().add(new THREE.Vector3(s * 0.123, 0, 0)), X, tilt);
  });

  // main tube
  seg(-0.38, 0.44, 0.045, 0.045, BRASS);
  // leather wraps
  const wraps: [number, number][] = [
    [-0.3, -0.08],
    [0.1, 0.36],
  ];
  wraps.forEach(([a, z]) => {
    seg(a, z, 0.048, 0.048, LEATHER);
    // stitched seam on top
    const n = Math.round((z - a) / 0.02);
    for (let k = 0; k < n; k++) {
      const s = a + 0.01 + k * ((z - a - 0.02) / Math.max(n - 1, 1));
      box(0.004, 0.007, 0.002, STITCH, pt(s, 0.0485, -0.004), D, tilt);
      box(0.004, 0.007, 0.002, STITCH, pt(s, 0.0485, 0.004), D, tilt);
    }
  });
  // engraved rings (dark groove + bright bead)
  [-0.38, -0.3, -0.08, 0.1, 0.36].forEach((s) => {
    seg(s - 0.012, s + 0.012, 0.051, 0.051, BRASS_HI);
    seg(s - 0.003, s + 0.003, 0.053, 0.053, BRASS_DK);
  });
  [0.0, 0.03, -0.03].forEach((s) => seg(s - 0.002, s + 0.002, 0.0465, 0.0465, BRASS_DK));
  // clamp band at pivot
  seg(-0.03, 0.04, 0.052, 0.052, BRASS);
  // maker's plaque on side
  box(0.004, 0.05, 0.022, BRASS_HI, pt(0.23, 0, 0.049), D, tilt);
  box(0.002, 0.04, 0.014, BRASS_DK, pt(0.23, 0, 0.0515), D, tilt);

  // dew shield + objective
  seg(0.44, 0.47, 0.05, 0.058, BRASS_DK);
  seg(0.47, 0.66, 0.058, 0.058, BRASS);
  seg(0.62, 0.66, 0.061, 0.061, BRASS_HI);
  seg(0.55, 0.56, 0.06, 0.06, BRASS_DK);
  seg(0.6, 0.605, 0.052, 0.052, GLASS, 16);
  b.part(new THREE.CircleGeometry(0.012, 8), GLINT, {
    at: P(pt(0.606, 0.02, 0.015)),
    dir: P(U),
    aim: P(pt(1.0, 0.02, 0.015)),
    bone: tilt,
  });

  // draw tubes
  seg(-0.56, -0.38, 0.034, 0.034, BRASS_HI);
  seg(-0.4, -0.38, 0.04, 0.045, BRASS_DK);
  seg(-0.57, -0.555, 0.038, 0.038, BRASS);
  seg(-0.67, -0.56, 0.024, 0.024, BRASS);
  seg(-0.68, -0.665, 0.028, 0.028, BRASS_DK);
  seg(-0.75, -0.68, 0.019, 0.019, BRASS_HI);
  // rubber eyecup
  seg(-0.81, -0.75, 0.031, 0.021, RUBBER, 12);
  seg(-0.812, -0.806, 0.031, 0.031, RUBBER, 12);
  seg(-0.808, -0.804, 0.012, 0.012, GLASS, 10);

  // focus rack + knobs
  box(0.014, 0.12, 0.01, BRASS_DK, pt(-0.47, -0.036), D, tilt);
  [-1, 1].forEach((sgn) => {
    const kc = pt(-0.46, -0.03, sgn * 0.048);
    cyl(0.006, 0.006, 0.03, 6, BRASS, pt(-0.46, -0.03, sgn * 0.03), X, tilt);
    cyl(0.018, 0.018, 0.022, 12, BRASS_HI, kc, X, tilt);
    cyl(0.012, 0.012, 0.004, 10, BRASS_DK, kc.clone().add(X.clone().multiplyScalar(sgn * 0.012)), X, tilt);
    // knurling ridges
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const off = D.clone().multiplyScalar(Math.cos(a) * 0.019).add(U.clone().multiplyScalar(Math.sin(a) * 0.019));
      box(0.022, 0.004, 0.004, BRASS_DK, kc.clone().add(off), X, tilt);
    }
  });

  // finder scope
  const FU = 0.105;
  [-0.08, 0.1].forEach((s) => {
    box(0.012, 0.012, 0.045, BRASS, pt(s, (0.05 + FU) / 2 - 0.01), U, tilt);
    seg(s - 0.01, s + 0.01, 0.022, 0.022, BRASS_HI, 10, FU);
    // adjusting screws
    [-1, 1].forEach((sg) =>
      cyl(0.004, 0.004, 0.02, 6, BRASS_DK, pt(s, FU, sg * 0.028), X, tilt)
    );
  });
  seg(-0.24, 0.18, 0.016, 0.016, BRASS, 12, FU);
  seg(-0.04, 0.04, 0.0175, 0.0175, LEATHER, 12, FU);
  seg(0.16, 0.22, 0.022, 0.022, BRASS_HI, 12, FU);
  seg(0.215, 0.22, 0.018, 0.018, GLASS, 10, FU);
  seg(-0.29, -0.24, 0.01, 0.01, BRASS_HI, 10, FU);
  seg(-0.31, -0.29, 0.014, 0.011, RUBBER, 10, FU);

  // little lens cap hanging on a cord ring by the dew shield
  const capRing = pt(0.5, -0.06, 0);
  b.part(new THREE.TorusGeometry(0.01, 0.002, 4, 8), BRASS_HI, { at: P(pt(0.5, -0.058, 0)), bone: tilt });
  cyl(0.004, 0.004, 0.04, 4, LEATHER, capRing.clone().add(new THREE.Vector3(0, -0.02, 0)), UP, tilt);
  cyl(0.03, 0.03, 0.012, 12, LEATHER, capRing.clone().add(new THREE.Vector3(0, -0.05, 0)), new THREE.Vector3(0, 0, 1), tilt);
  cyl(0.022, 0.022, 0.014, 12, BRASS_HI, capRing.clone().add(new THREE.Vector3(0, -0.05, 0.001)), new THREE.Vector3(0, 0, 1), tilt);

  return b.root;
}
```