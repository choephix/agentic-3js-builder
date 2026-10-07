import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  grain,
  mottle,
  svg,
  bezier,
  catmull,
  polyline,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Morning Glory Gramophone",
  description:
    "An antique gramophone on a carved walnut cabinet with pale floral marquetry, claw-and-ball feet, a patinated brass morning-glory horn, a black record with a red label, a nickel tonearm and a side wind-up crank.",
};

// ---------- palette ----------
const WALNUT = "#6e4024";
const WALNUT_D = "#43240f";
const WALNUT_DEEP = "#2b170b";
const BRASS = "#c99a3e";
const BRASS_BRIGHT = "#e8c266";
const BRASS_DARK = "#8a6220";
const PATINA = "#7fa383";
const NICKEL = "#cfd3d8";
const NICKEL_D = "#8d939b";
const FELT = "#2f4a34";
const BLACK = "#141214";
const EBONY = "#1c1410";
const MICA = "#d9cfae";
const IV = "#f0e3c1";
const SAT = "#d4a35c";

// ---------- SVG drawings ----------
function spray(x: number, y: number, ang: number): string {
  let s = "";
  for (const a of [-38, -12, 12, 38]) {
    const r = ((ang + a) * Math.PI) / 180;
    const lx = x + Math.cos(r) * 16;
    const ly = y + Math.sin(r) * 16;
    s += `<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="11" ry="4.5" transform="rotate(${(ang + a).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})" fill="${IV}"/>`;
  }
  s += `<circle cx="${x}" cy="${y}" r="5" fill="${SAT}"/>`;
  return s;
}

function inlaySvg(w: number, h: number, withVines: boolean): string {
  const cx = w / 2;
  const cy = h / 2;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">`;
  s += `<rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="12" fill="none" stroke="${IV}" stroke-width="4"/>`;
  s += `<rect x="18" y="18" width="${w - 36}" height="${h - 36}" rx="7" fill="none" stroke="${SAT}" stroke-width="3"/>`;
  // corner sprays
  s += spray(30, 30, 45) + spray(w - 30, 30, 135) + spray(30, h - 30, -45) + spray(w - 30, h - 30, -135);
  if (withVines) {
    const amp = h * 0.17;
    for (const side of [-1, 1]) {
      const x0 = cx + side * 34;
      const x1 = cx + side * (w / 2 - 52);
      const N = 28;
      const pt = (u: number) => {
        const x = x0 + (x1 - x0) * u;
        const y = cy + amp * Math.sin(u * Math.PI * 2.2) * (0.4 + 0.6 * u);
        return [x, y];
      };
      let d = "";
      for (let i = 0; i <= N; i++) {
        const [x, y] = pt(i / N);
        d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      s += `<path d="${d}" fill="none" stroke="${IV}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
      let alt = 1;
      for (let u = 0.12; u < 0.92; u += 0.11) {
        const [xa, ya] = pt(u);
        const [xb, yb] = pt(u + 0.01);
        const ang = (Math.atan2(yb - ya, xb - xa) * 180) / Math.PI;
        const nr = ((ang + 90) * Math.PI) / 180;
        const lx = xa + Math.cos(nr) * 9 * alt;
        const ly = ya + Math.sin(nr) * 9 * alt;
        s += `<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="10" ry="4.2" transform="rotate(${(ang + alt * 38).toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})" fill="${IV}"/>`;
        if (alt > 0) s += `<circle cx="${(xa - Math.cos(nr) * 6).toFixed(1)}" cy="${(ya - Math.sin(nr) * 6).toFixed(1)}" r="3.2" fill="${SAT}"/>`;
        alt = -alt;
      }
      const [ex, ey] = pt(1);
      for (let i = 0; i < 5; i++) {
        const r = (i / 5) * Math.PI * 2;
        s += `<circle cx="${(ex + Math.cos(r) * 7).toFixed(1)}" cy="${(ey + Math.sin(r) * 7).toFixed(1)}" r="5.5" fill="${IV}"/>`;
      }
      s += `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="4" fill="${SAT}"/>`;
    }
    for (let i = 0; i < 8; i++)
      s += `<ellipse cx="${cx}" cy="${cy - 20}" rx="7" ry="15" transform="rotate(${i * 45} ${cx} ${cy})" fill="${IV}"/>`;
    for (let i = 0; i < 8; i++)
      s += `<ellipse cx="${cx}" cy="${cy - 33}" rx="3" ry="6" transform="rotate(${i * 45 + 22.5} ${cx} ${cy})" fill="${SAT}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="9" fill="${SAT}"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="${IV}"/>`;
  }
  s += `</svg>`;
  return s;
}

function recordSvg(): string {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="256" fill="#0d0c0e"/>`;
  let k = 0;
  for (let r = 92; r < 250; r += 3.2) {
    s += `<circle cx="256" cy="256" r="${r.toFixed(1)}" fill="none" stroke="${k % 2 ? "#1f1c22" : "#121114"}" stroke-width="1.6"/>`;
    k++;
  }
  for (const r of [140, 188]) s += `<circle cx="256" cy="256" r="${r}" fill="none" stroke="#050505" stroke-width="3"/>`;
  s += `<circle cx="256" cy="256" r="251" fill="none" stroke="#2c292f" stroke-width="4"/>`;
  s += `<path d="M256 256 L506 200 A256 256 0 0 1 506 312 Z" fill="#ffffff" opacity="0.08"/>`;
  s += `<path d="M256 256 L6 312 A256 256 0 0 1 6 200 Z" fill="#ffffff" opacity="0.08"/>`;
  s += `<circle cx="256" cy="256" r="84" fill="#b3191f"/>`;
  s += `<circle cx="256" cy="256" r="77" fill="none" stroke="#e8c66c" stroke-width="2.5"/>`;
  s += `<text x="256" y="226" font-family="Georgia, serif" font-weight="bold" font-size="22" fill="#f2d47c" text-anchor="middle">VICTORIA</text>`;
  s += `<text x="256" y="244" font-family="Georgia, serif" font-size="10" fill="#f2d47c" text-anchor="middle">TALKING MACHINE CO.</text>`;
  s += `<text x="256" y="290" font-family="Georgia, serif" font-style="italic" font-size="13" fill="#f2d47c" text-anchor="middle">Waltz of the Flowers</text>`;
  s += `<text x="256" y="306" font-family="Georgia, serif" font-size="9" fill="#f2d47c" text-anchor="middle">CONCERT ORCHESTRA · 78</text>`;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    s += `<circle cx="${(256 + Math.cos(a) * 9).toFixed(1)}" cy="${(258 + Math.sin(a) * 9).toFixed(1)}" r="5" fill="#f2d47c"/>`;
  }
  s += `<circle cx="256" cy="256" r="4" fill="#0d0c0e"/></svg>`;
  return s;
}

const plaqueSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48">
<rect x="1" y="1" width="238" height="46" rx="7" fill="#c9a04a"/>
<rect x="6" y="6" width="228" height="36" rx="4" fill="none" stroke="#6d4c17" stroke-width="2"/>
<circle cx="14" cy="24" r="3" fill="#6d4c17"/><circle cx="226" cy="24" r="3" fill="#6d4c17"/>
<text x="120" y="31" font-family="Georgia, serif" font-weight="bold" font-size="17" letter-spacing="2" fill="#3b2508" text-anchor="middle">THE MORNING GLORY</text>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  void rng(1);

  // ---------- skeleton ----------
  const base = b.joint("base", { at: [0, 0, 0] });
  const turntable = b.joint("turntable", { parent: base, at: [0, 0.331, 0.04], dir: [0, 1, 0] });
  const T0 = new THREE.Vector3(0.16, 0.37, -0.17);
  const tonearm = b.joint("tonearm", { parent: base, at: T0, dir: [-0.4, 0.05, 1], role: "hinge" });
  const crank = b.joint("crank", { parent: base, at: [-0.22, 0.2, 0], dir: [-1, 0, 0], role: "hinge" });

  // ---------- materials ----------
  const wood = grain(WALNUT, WALNUT_D, { size: 0.012, axis: "x" });
  const woodV = grain(WALNUT, WALNUT_D, { size: 0.01, axis: "y" });
  const burl = mottle(grain(WALNUT, WALNUT_D, { size: 0.014, axis: "z", seed: 4 }), WALNUT_D, { size: 0.035, seed: 5 });
  const patina = mottle(BRASS, mottle(BRASS_DARK, PATINA, { size: 0.025, seed: 3 }), { size: 0.07, seed: 1 });
  const brassInner = mottle(BRASS_BRIGHT, BRASS, { size: 0.06, seed: 7 });

  // ---------- cabinet ----------
  b.part(new THREE.BoxGeometry(0.48, 0.03, 0.5), wood, { bone: base, at: [0, 0.08, 0] }); // plinth
  b.part(new THREE.BoxGeometry(0.44, 0.205, 0.46), wood, { bone: base, at: [0, 0.1975, 0] }); // body
  b.part(new THREE.BoxGeometry(0.47, 0.015, 0.49), wood, { bone: base, at: [0, 0.3075, 0] }); // moulding
  b.part(new THREE.BoxGeometry(0.48, 0.015, 0.5), burl, { bone: base, at: [0, 0.3225, 0] }); // lid

  const rect = (y: number, hx: number, hz: number) =>
    polyline(
      [
        [hx, y, hz],
        [-hx, y, hz],
        [-hx, y, -hz],
        [hx, y, -hz],
      ],
      { closed: true },
    );
  b.sweep(rect(0.3225, 0.24, 0.25), 0.008, { color: WALNUT_DEEP, sides: 6, bone: base });
  b.sweep(rect(0.0655, 0.24, 0.25), 0.006, { color: WALNUT_DEEP, sides: 6, bone: base });
  // egg-and-bead carving along plinth top
  const beadGeo = new THREE.SphereGeometry(0.0055, 6, 4);
  b.along(rect(0.096, 0.232, 0.242), 64, (at) => b.part(beadGeo, WALNUT_DEEP, { bone: base, at, scale: [1, 0.8, 1] }));

  // turned corner pilasters
  const pil: OutlinePoint[] = [
    [0, 0],
    [0.02, 0],
    [0.02, 0.01],
    [0.015, 0.016],
    [0.014, 0.03],
    [0.017, 0.034],
    [0.013, 0.04],
    [0.012, 0.165],
    [0.016, 0.17],
    [0.013, 0.176],
    [0.018, 0.19],
    [0.02, 0.205],
    [0, 0.205],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.lathe(pil, { at: [sx * 0.22, 0.095, sz * 0.23], segments: 10, color: woodV, bone: base });

  // marquetry panels with raised frames
  const frontTex = svg(inlaySvg(370, 160, true), { size: 512 });
  const sideTex = svg(inlaySvg(380, 160, true), { size: 512 });
  const topTex = svg(inlaySvg(460, 480, false), { size: 512 });
  const cy = 0.1975;
  b.part(new THREE.PlaneGeometry(0.37, 0.16), "#ffffff", {
    bone: base, at: [0, cy, 0.2318], dir: [0, 0, 1], axis: "z", texture: frontTex,
  });
  b.sweep(
    polyline([[0.19, cy + 0.085, 0.23], [-0.19, cy + 0.085, 0.23], [-0.19, cy - 0.085, 0.23], [0.19, cy - 0.085, 0.23]], { closed: true }),
    0.0045,
    { color: WALNUT_DEEP, sides: 6, bone: base },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.38, 0.16), "#ffffff", {
      bone: base, at: [s * 0.2218, cy, 0], dir: [s, 0, 0], axis: "z", texture: sideTex,
    });
    b.sweep(
      polyline([[s * 0.22, cy + 0.085, 0.2], [s * 0.22, cy + 0.085, -0.2], [s * 0.22, cy - 0.085, -0.2], [s * 0.22, cy - 0.085, 0.2]], { closed: true }),
      0.0045,
      { color: WALNUT_DEEP, sides: 6, bone: base },
    );
  }
  b.part(new THREE.PlaneGeometry(0.46, 0.48), "#ffffff", {
    bone: base, at: [0, 0.3302, 0], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: topTex,
  });

  // brass maker's plaque
  b.part(new THREE.PlaneGeometry(0.12, 0.024), "#ffffff", {
    bone: base, at: [0, 0.08, 0.2512], dir: [0, 0, 1], axis: "z", texture: svg(plaqueSvg, { size: 512 }),
  });

  // carved aprons
  const apron = (hw: number): OutlinePoint[] => [
    [-hw, 0, "sharp"],
    [hw, 0, "sharp"],
    [hw, -0.01],
    [hw * 0.76, -0.014],
    [hw * 0.49, -0.023],
    [hw * 0.24, -0.02],
    [hw * 0.1, -0.03],
    [0, -0.043],
    [-hw * 0.1, -0.03],
    [-hw * 0.24, -0.02],
    [-hw * 0.49, -0.023],
    [-hw * 0.76, -0.014],
    [-hw, -0.01],
  ];
  const shellGeo = new THREE.SphereGeometry(0.02, 9, 3, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const s of [1, -1]) {
    b.extrude(apron(0.185), { at: [0, 0.066, s * 0.243], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, smoothing: 1, color: wood, bone: base });
    b.extrude(apron(0.195), { at: [s * 0.233, 0.066, 0], x: [0, 0, 1], thickness: 0.012, bevel: 0.003, smoothing: 1, color: wood, bone: base });
    b.part(shellGeo, WALNUT_D, { bone: base, at: [0, 0.052, s * 0.249], dir: [0, 0, s], scale: [1, 0.45, 1], flat: true });
  }

  // claw-and-ball feet
  const ballGeo = new THREE.SphereGeometry(0.022, 10, 8);
  const ankle: OutlinePoint[] = [
    [0, 0],
    [0.016, 0],
    [0.013, 0.01],
    [0.012, 0.02],
    [0.02, 0.03],
    [0.024, 0.036],
    [0, 0.036],
  ];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const fx = sx * 0.21;
      const fz = sz * 0.22;
      b.part(ballGeo, BRASS_BRIGHT, { bone: base, at: [fx, 0.022, fz] });
      b.lathe(ankle, { at: [fx, 0.038, fz], segments: 10, color: woodV, bone: base });
      const dx = sx / Math.SQRT2;
      const dz = sz / Math.SQRT2;
      for (const a of [-45, 0, 45, 180]) {
        const r = (a * Math.PI) / 180;
        const ux = dx * Math.cos(r) + dz * Math.sin(r);
        const uz = -dx * Math.sin(r) + dz * Math.cos(r);
        const P = (o: number, y: number) => [fx + ux * o, y, fz + uz * o];
        const toe = bezier(P(0.012, 0.055), P(0.03, 0.048), P(0.032, 0.022), P(0.023, 0.007));
        b.sweep(toe, [0.008, 0.0035], { color: WALNUT_D, sides: 6, caps: { start: "round", end: "point" }, bone: base });
      }
    }

  // ---------- turntable & record ----------
  b.part(new THREE.CylinderGeometry(0.152, 0.152, 0.01, 40), NICKEL, { bone: turntable, at: [0, 0.336, 0.04] });
  b.part(new THREE.CylinderGeometry(0.146, 0.146, 0.0012, 40), FELT, { bone: turntable, at: [0, 0.3412, 0.04] });
  b.part(new THREE.CylinderGeometry(0.148, 0.148, 0.004, 40), BLACK, { bone: turntable, at: [0, 0.343, 0.04] });
  b.part(new THREE.CircleGeometry(0.147, 48), "#ffffff", {
    bone: turntable, at: [0, 0.3456, 0.04], dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture: svg(recordSvg(), { size: 512 }),
  });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.016, 8), NICKEL, { bone: turntable, at: [0, 0.349, 0.04] });

  // speed regulator, brake, needle cups
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.003, 16), NICKEL, { bone: base, at: [-0.175, 0.3315, 0.19] });
  b.rod([-0.175, 0.334, 0.19], [-0.155, 0.335, 0.21], 0.003, { color: NICKEL_D, bone: base });
  b.part(new THREE.SphereGeometry(0.005, 6, 4), EBONY, { bone: base, at: [-0.155, 0.335, 0.21] });
  b.rod([-0.19, 0.333, 0.08], [-0.15, 0.338, 0.06], 0.003, { color: NICKEL, bone: base });
  for (const x of [0.15, 0.185]) {
    b.part(new THREE.CylinderGeometry(0.014, 0.011, 0.014, 10), BRASS, { bone: base, at: [x, 0.337, 0.2] });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.002, 10), EBONY, { bone: base, at: [x, 0.3442, 0.2] });
  }

  // ---------- tonearm & soundbox ----------
  b.lathe(
    [[0, 0], [0.032, 0], [0.032, 0.006], [0.019, 0.012], [0.014, 0.04], [0, 0.04]],
    { at: [0.16, 0.33, -0.17], segments: 16, color: NICKEL, bone: tonearm },
  );
  b.part(new THREE.SphereGeometry(0.021, 12, 8), NICKEL, { bone: tonearm, at: T0 });
  const S = new THREE.Vector3(0.035, 0.386, 0.135);
  const armPath = catmull([T0, [0.13, 0.392, -0.06], [0.07, 0.396, 0.06], S]);
  b.sweep(armPath, [0.013, 0.008], { color: NICKEL, bone: tonearm, caps: "flat" });
  const tan = armPath.tangentAt(1);
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 20), NICKEL, { bone: tonearm, at: S, dir: tan });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 20), MICA, { bone: tonearm, at: S, dir: tan });
  b.part(new THREE.TorusGeometry(0.03, 0.0032, 5, 20), NICKEL_D, { bone: tonearm, at: S, dir: tan, axis: "z" });
  b.part(new THREE.SphereGeometry(0.004, 6, 4), NICKEL_D, { bone: tonearm, at: S.clone().addScaledVector(tan, 0.009) });
  b.rod([S.x, S.y - 0.025, S.z], [S.x, 0.3495, S.z], 0.004, { color: NICKEL, bone: tonearm });
  b.spike([S.x, 0.3495, S.z], [0, -1, 0], 0.0038, 0.0012, { color: NICKEL_D, bone: tonearm });

  // ---------- morning-glory horn ----------
  const A = new THREE.Vector3(0, 0.55, 1).normalize();
  const U = new THREE.Vector3(1, 0, 0);
  const V = new THREE.Vector3().crossVectors(A, U);
  const B = new THREE.Vector3(0, 0.706, -0.28);
  const H = [0, 0.06, 0.12, 0.17, 0.21, 0.245, 0.27, 0.29, 0.305, 0.315];
  const R = [0.032, 0.04, 0.055, 0.075, 0.1, 0.13, 0.16, 0.195, 0.235, 0.275];
  const outer: OutlinePoint[] = H.map((h, i) => [R[i], h] as OutlinePoint);
  const bead: OutlinePoint[] = [
    [0.285, 0.321],
    [0.286, 0.329],
    [0.276, 0.33],
  ];
  const inner: OutlinePoint[] = H.map((h, i) => [R[i] - 0.004, h + 0.004] as OutlinePoint).reverse();
  const PANEL = (Math.PI * 2) / 10;
  const hornPaint = paint((p, n) => {
    const d = p.clone().sub(B);
    const h = d.dot(A);
    const rad = d.clone().addScaledVector(A, -h);
    const phi = Math.atan2(rad.dot(V), rad.dot(U));
    let f = (((phi - PANEL / 2) / PANEL) % 1 + 1) % 1;
    f = Math.min(f, 1 - f);
    if (n.dot(rad) < 0) {
      if (h < 0.09) return BRASS_DARK;
      if (f < 0.035) return BRASS_DARK;
      return brassInner;
    }
    return f < 0.03 ? BRASS_DARK : patina;
  });
  b.lathe([...outer, ...bead, ...inner], { at: B, axis: A, segments: 40, color: hornPaint, bone: base });

  // panel ribs ending in petal points
  for (let k = 0; k < 10; k++) {
    const phi = (k + 0.5) * PANEL;
    const dirR = U.clone().multiplyScalar(Math.cos(phi)).addScaledVector(V, Math.sin(phi));
    const pts = H.map((h, i) => B.clone().addScaledVector(A, h).addScaledVector(dirR, R[i] + 0.0015));
    b.sweep(catmull(pts), [0.0025, 0.0042], { color: BRASS_DARK, sides: 5, bone: base });
    const tipDir = dirR.clone().multiplyScalar(0.85).addScaledVector(A, 0.5).normalize();
    b.spike(pts[pts.length - 1], tipDir, 0.03, 0.006, { color: BRASS, bone: base });
  }
  b.part(new THREE.TorusGeometry(0.036, 0.006, 6, 18), BRASS_DARK, { bone: base, at: B.clone().addScaledVector(A, 0.01), dir: A, axis: "z" });

  // gooseneck throat from the tonearm elbow up into the bell
  const throat = bezier(T0, [0.16, 0.58, -0.17], B.clone().addScaledVector(A, -0.14), B.clone().addScaledVector(A, 0.03));
  b.sweep(throat, [0.019, 0.03], { color: patina, bone: base, caps: "flat" });
  for (const t of [0.06, 0.5]) {
    b.part(new THREE.TorusGeometry(0.019 + 0.011 * t + 0.002, 0.004, 5, 16), BRASS_DARK, {
      bone: base, at: throat.at(t), dir: throat.tangentAt(t), axis: "z",
    });
  }

  // ---------- wind-up crank ----------
  b.part(new THREE.CylinderGeometry(0.028, 0.03, 0.006, 16), BRASS, { bone: crank, at: [-0.2235, 0.2, 0], dir: [-1, 0, 0] });
  b.part(new THREE.TorusGeometry(0.026, 0.003, 4, 16), BRASS_DARK, { bone: crank, at: [-0.2265, 0.2, 0], dir: [-1, 0, 0], axis: "z" });
  b.rod([-0.222, 0.2, 0], [-0.27, 0.2, 0], 0.006, { color: NICKEL, bone: crank });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), NICKEL, { bone: crank, at: [-0.27, 0.2, 0] });
  b.sweep(bezier([-0.27, 0.2, 0], [-0.275, 0.17, 0.012], [-0.272, 0.13, 0]), 0.0055, { color: NICKEL, bone: crank });
  b.capsule([-0.274, 0.13, 0], [-0.318, 0.13, 0], 0.011, { color: EBONY, bone: crank });

  return b.root;
}
