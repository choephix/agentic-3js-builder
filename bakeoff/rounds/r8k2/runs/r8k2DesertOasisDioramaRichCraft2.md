1. **Palms:** a new `blade()` helper builds a folded, lance-shaped leaflet with a shallow central ridge and a double-sided surface. `frond()` now uses it: 9 pairs per drooping rib with a stronger droop toward the tip, sized 0.13–0.17 × 0.036–0.05 (× `s`) and tapered near the tip, plus a tip blade. There are 8 outward fronds, and the upright fronds are shortened to `0.24 * sc`.
2. **Humps:** the hump is lowered to 0.405, broadened to 0.12 fore–aft, and tilted back less (`Dr(0, 1, -0.15)`), peaking near 0.53. The striped shell is replaced by two thin flank panels that follow the body ellipse down to about 0.276, joined by a narrow strip over the hump. Each panel has a hem and tassels, and most of the hump stays exposed.
3. **Faces:** the two upward spikes are replaced by one low faceted forelock. The brow sweeps are raised by 0.004 and thinned to 0.0025. A shallow mouth curve sits on each side of the muzzle, below the halter, and is placed on the muzzle surface.
4. **Pond and grass:** the water is now `WX × WZ` = 0.52 × 0.38, and the shoreline, rocks, water paint and ripple footprint follow it. There are 9 tufts, placed between the inner and outer shore ellipses with roots at `G + 0.004`, and 7 reed groups with card height 0.19.
5. **Tents:**
   - Tent A moves to (0.48, -0.77), with its rope pegs pulled in so they stay on the base. Tent B moves to (0.96, 0.12, -0.45); I used x = 0.96 rather than 1.0 so its back corner stays on the base.
   - The awning poles now meet the cloth corner, inset slightly, with no forward offset. The crossbar sits 0.013 under the edge.
   - The rug and tea set move to about (0.9, 0.62) and are re-yawed to the tent. I also moved the jars, crates and sack to clear the new tent.
6. **Calf:** it moves to (-0.54, 0.94), a little past the suggested -0.48, so its head and neck clear the palm trunks. There is a clear gap to the adult.
7. **Surface finish:**
   - The shore uses muted olive and ochre patches, with a few green accents.
   - Sand ripple contribution drops from 0.18 to 0.09, and the dark ripple term from 0.08 to 0.04.
   - Blankets are now broad red/cream and teal/cream bands with a contrasting hem, painted on the panel uv.

<<<<<<< SEARCH
  c = mix(c, SAND_C, 0.18 * smoothstep(0.82, 0.96, rip));
  c = mix(c, SAND_D, 0.08 * smoothstep(-0.88, -0.98, rip));
=======
  c = mix(c, SAND_C, 0.09 * smoothstep(0.82, 0.96, rip));
  c = mix(c, SAND_D, 0.04 * smoothstep(-0.88, -0.98, rip));
>>>>>>> REPLACE
<<<<<<< SEARCH
const PZ = 0.12;
=======
const PZ = 0.12;
const WX = 0.52;
const WZ = 0.38;
>>>>>>> REPLACE
<<<<<<< SEARCH
  const d = Math.hypot((p.x - PX) / 0.47, (p.z - PZ) / 0.34);
=======
  const d = Math.hypot((p.x - PX) / WX, (p.z - PZ) / WZ);
>>>>>>> REPLACE
<<<<<<< SEARCH
const SHORE = paint((p) => (noise(p, 0.14, 21) < 0.36 ? sand : GRASS));
=======
const SHORE = paint((p) => {
  let c = mix("#a9a55e", "#cfae6a", smoothstep(0.35, 0.65, noise(p, 0.4, 21)));
  c = mix(c, "#7aa543", 0.55 * smoothstep(0.62, 0.78, noise(p, 0.17, 27)));
  return c;
});
>>>>>>> REPLACE
<<<<<<< SEARCH
const BLANKET = stripes("#c8402e", "#f4d27a", { size: 0.034, axis: "y", width: 0.32, wobble: 0.05, seed: 14 });
const BLANKET2 = stripes("#2a9d9a", "#fff1cf", { size: 0.03, axis: "y", width: 0.32, wobble: 0.05, seed: 15 });
=======
const clothPaint = (main: string, light: string, hem: string) =>
  paint((_p, _n, s) => (s[1] > 0.84 ? hem : Math.floor(s[0] * 4) % 2 ? light : main));
const BLANKET = clothPaint("#cf4631", "#f6e4bc", GOLD);
const BLANKET2 = clothPaint("#2a9d9a", "#f6e4bc", YELLOW);
>>>>>>> REPLACE
<<<<<<< SEARCH
export default function build() {
=======
// folded lance-shaped palm blade: unit width, length along +Y, shallow ridge toward +Z, both sides drawn
function blade() {
  const v = [
    0, 0, 0, -0.42, 0.3, -0.03, 0, 0.3, 0.07, 0.42, 0.3, -0.03, -0.5, 0.5, -0.04, 0, 0.5, 0.08, 0.5, 0.5, -0.04, -0.3,
    0.8, -0.03, 0, 0.8, 0.05, 0.3, 0.8, -0.03, 0, 1, 0,
  ];
  const f = [
    [0, 1, 2],
    [0, 2, 3],
    [1, 4, 5],
    [1, 5, 2],
    [2, 5, 6],
    [2, 6, 3],
    [4, 7, 8],
    [4, 8, 5],
    [5, 8, 9],
    [5, 9, 6],
    [7, 10, 8],
    [8, 10, 9],
  ];
  const n = v.length / 3;
  const idx: number[] = [];
  for (const [a, c, d] of f) idx.push(a, c, d, n + a, n + d, n + c);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([...v, ...v], 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// a double-sided grid surface through f(u, v); uv carries (u, v) for paints unless plain
function gridGeo(nu: number, nv: number, f: (u: number, v: number) => THREE.Vector3, plain: boolean) {
  const P: THREE.Vector3[] = [];
  const uv: number[] = [];
  for (let i = 0; i <= nu; i++)
    for (let j = 0; j <= nv; j++) {
      P.push(f(i / nu, j / nv));
      uv.push(plain ? 0 : i / nu, plain ? 0 : j / nv);
    }
  const n = P.length;
  const pos: number[] = [];
  for (let c = 0; c < 2; c++) for (const q of P) pos.push(q.x, q.y, q.z);
  const at = (i: number, j: number) => i * (nv + 1) + j;
  const idx: number[] = [];
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      const a = at(i, j);
      const c = at(i + 1, j);
      const d = at(i + 1, j + 1);
      const e = at(i, j + 1);
      idx.push(a, c, d, a, d, e, n + a, n + d, n + c, n + a, n + e, n + d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([...uv, ...uv], 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export default function build() {
>>>>>>> REPLACE
<<<<<<< SEARCH
      pos.push(PX + cos(a) * 0.62 * v, G + 0.001, PZ + sin(a) * 0.45 * v);
      pos.push(PX + cos(a) * 0.45 * w, G + 0.008, PZ + sin(a) * 0.325 * w);
=======
      pos.push(PX + cos(a) * 0.7 * v, G + 0.001, PZ + sin(a) * 0.51 * v);
      pos.push(PX + cos(a) * 0.5 * w, G + 0.008, PZ + sin(a) * 0.36 * w);
>>>>>>> REPLACE
<<<<<<< SEARCH
  put(new THREE.CylinderGeometry(1, 1, 0.02, 18), water, [PX, G - 0.004, PZ], { scale: [0.47, 1, 0.34] });
=======
  put(new THREE.CylinderGeometry(1, 1, 0.02, 20), water, [PX, G - 0.004, PZ], { scale: [WX, 1, WZ] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    scale: [0.84, 0.6, 1],
=======
    scale: [0.93, 0.67, 1],
>>>>>>> REPLACE
<<<<<<< SEARCH
    put(new THREE.DodecahedronGeometry(1, 0), ROCK, [PX + cos(a) * 0.5, G + 0.02, PZ + sin(a) * 0.37], {
=======
    put(new THREE.DodecahedronGeometry(1, 0), ROCK, [PX + cos(a) * 0.55, G + 0.02, PZ + sin(a) * 0.4], {
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (let i = 0; i < 10; i++) {
    const a = PI + 0.25 + (i / 9) * (PI - 0.5);
    reedFrames.push(frame([PX + cos(a) * 0.56, G + 0.02, PZ + sin(a) * 0.41] as V, [0, 1, 0]));
  }
  b.cards(reedFrames, REED, { size: [0.1, 0.24], vary: 0.3, rng: R, spin: 25, cross: true, lean: 8, bend: 18, bone: base });
=======
  for (let i = 0; i < 7; i++) {
    const a = PI + 0.25 + (i / 6) * (PI - 0.5);
    reedFrames.push(frame([PX + cos(a) * WX * 1.14, G + 0.006, PZ + sin(a) * WZ * 1.14] as V, [0, 1, 0]));
  }
  b.cards(reedFrames, REED, { size: [0.09, 0.19], vary: 0.25, rng: R, spin: 25, cross: true, lean: 8, bend: 18, bone: base });
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * PI * 2 + 0.2;
    const k = 0.62 + R() * 0.12;
    tuftFrames.push(frame([PX + cos(a) * 0.66 * k + 0.03, G + 0.02, PZ + sin(a) * 0.5 * k + 0.02] as V, [0, 1, 0]));
  }
=======
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * PI * 2 + 0.2;
    const kk = 1.14 + R() * 0.12;
    tuftFrames.push(frame([PX + cos(a) * WX * kk, G + 0.004, PZ + sin(a) * WZ * kk] as V, [0, 1, 0]));
  }
>>>>>>> REPLACE
<<<<<<< SEARCH
      const n = upright ? 7 : 11;
=======
      const n = upright ? 7 : 9;
      {
        const pe = fp.at(1);
        const te = fp.tangentAt(1);
        const tg0 = new THREE.Vector3(te.x, te.y - 0.2, te.z).normalize();
        const g0 = blade();
        g0.applyMatrix4(
          new THREE.Matrix4().compose(
            new THREE.Vector3(pe.x, pe.y, pe.z),
            aim(tg0, [0, 1, 0]),
            new THREE.Vector3(0.04 * s, 0.12 * s, 0.08 * s),
          ),
        );
        (shade % 2 ? dark : light).push(g0);
      }
>>>>>>> REPLACE
<<<<<<< SEARCH
        const lf = s * (0.04 + 0.06 * sin(PI * Math.min(t * 1.05, 1)));
=======
        const lf = s * (0.13 + 0.04 * sin(PI * Math.min(t, 1))) * (t > 0.8 ? 1 - (t - 0.8) * 1.6 : 1);
        const bw = s * (0.036 + 0.014 * sin(PI * t));
>>>>>>> REPLACE
<<<<<<< SEARCH
            .addScaledVector(Y, upright ? -0.12 : -0.38)
=======
            .addScaledVector(Y, upright ? -0.12 : -0.3 - 0.45 * t)
>>>>>>> REPLACE
<<<<<<< SEARCH
          const g = new THREE.ConeGeometry(0.5, 1, 4, 1).translate(0, 0.5, 0);
          g.applyMatrix4(
            new THREE.Matrix4().compose(pt, aim(d, [0, 1, 0]), new THREE.Vector3(0.03 * s, lf, 0.007 * s)),
          );
=======
          const g = blade();
          g.applyMatrix4(new THREE.Matrix4().compose(pt, aim(d, [0, 1, 0]), new THREE.Vector3(bw, lf, bw * 2)));
>>>>>>> REPLACE
<<<<<<< SEARCH
    const NF = 9;
=======
    const NF = 8;
>>>>>>> REPLACE
<<<<<<< SEARCH
    for (let i = 0; i < 3; i++) frond(az + 0.7 + i * 2.1, 0.36 * sc, true, i);
=======
    for (let i = 0; i < 3; i++) frond(az + 0.7 + i * 2.1, 0.24 * sc, true, i);
>>>>>>> REPLACE
<<<<<<< SEARCH
      const gnd: V = [cx + sin(a) * (r * 1.2 + 0.18), G + 0.004, cz + cos(a) * (r * 1.2 + 0.18)];
=======
      const gnd: V = [cx + sin(a) * (r * 1.2 + 0.08), G + 0.004, cz + cos(a) * (r * 1.2 + 0.08)];
>>>>>>> REPLACE
<<<<<<< SEARCH
  const AX = 0.55;
  const AZ = -0.68;
=======
  const AX = 0.48;
  const AZ = -0.77;
>>>>>>> REPLACE
<<<<<<< SEARCH
      return [l[0] + F[0] * 0.012, l[1], l[2] + F[2] * 0.012];
=======
      const m = lip(u * 0.97);
      return [m[0], m[1], m[2]];
>>>>>>> REPLACE
<<<<<<< SEARCH
      rod([l[0], l[1] + 0.004, l[2]], [l[0], G + 0.002, l[2]], 0.007, WOODP, { sides: 5 });
=======
      rod([l[0], l[1] - 0.002, l[2]], [l[0], G + 0.002, l[2]], 0.007, WOODP, { sides: 5 });
>>>>>>> REPLACE
<<<<<<< SEARCH
    const barY = barA[1] - 0.018;
=======
    const barY = barA[1] - 0.013;
>>>>>>> REPLACE
<<<<<<< SEARCH
  tentB(1.0, 0.0, -0.6);
=======
  tentB(0.96, 0.12, -0.45);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const yaw = -0.6;
    put(new THREE.PlaneGeometry(0.44, 0.31), WHITE, [0.93, G + 0.004, 0.52], {
=======
    const yaw = -0.45;
    put(new THREE.PlaneGeometry(0.44, 0.31), WHITE, [0.9, G + 0.004, 0.62], {
>>>>>>> REPLACE
<<<<<<< SEARCH
    put(sph(8, 5), "#c8402e", [0.98, G + 0.03, 0.46], { scale: [0.05, 0.026, 0.04], rotation: [0, 30, 0] });
    put(sph(8, 5), TEAL, [0.86, G + 0.03, 0.58], { scale: [0.05, 0.026, 0.04], rotation: [0, -20, 0] });
    put(cone(0.01, 0.02, 4), GOLD, [0.98, G + 0.058, 0.46]);
    put(cone(0.01, 0.02, 4), GOLD, [0.86, G + 0.058, 0.58]);
    // tea tray
    put(new THREE.CylinderGeometry(0.05, 0.045, 0.01, 10), GOLD, [0.93, G + 0.011, 0.52], { flat: true });
    put(new THREE.CylinderGeometry(0.012, 0.015, 0.03, 6), CREAM, [0.945, G + 0.031, 0.53], { flat: true });
    put(new THREE.CylinderGeometry(0.012, 0.015, 0.03, 6), CREAM, [0.905, G + 0.031, 0.51], { flat: true });
=======
    put(sph(8, 5), "#c8402e", [0.95, G + 0.03, 0.56], { scale: [0.05, 0.026, 0.04], rotation: [0, 30, 0] });
    put(sph(8, 5), TEAL, [0.83, G + 0.03, 0.68], { scale: [0.05, 0.026, 0.04], rotation: [0, -20, 0] });
    put(cone(0.01, 0.02, 4), GOLD, [0.95, G + 0.058, 0.56]);
    put(cone(0.01, 0.02, 4), GOLD, [0.83, G + 0.058, 0.68]);
    // tea tray
    put(new THREE.CylinderGeometry(0.05, 0.045, 0.01, 10), GOLD, [0.9, G + 0.011, 0.62], { flat: true });
    put(new THREE.CylinderGeometry(0.012, 0.015, 0.03, 6), CREAM, [0.915, G + 0.031, 0.63], { flat: true });
    put(new THREE.CylinderGeometry(0.012, 0.015, 0.03, 6), CREAM, [0.875, G + 0.031, 0.61], { flat: true });
>>>>>>> REPLACE
<<<<<<< SEARCH
  jar(0.1, -0.7, CLAY, 1.1);
  jar(0.16, -0.54, GLAZE, 0.9);
  jar(0.06, -0.58, CLAY, 0.8);
  put(new THREE.BoxGeometry(0.12, 0.1, 0.12), WOODP, [0.98, G + 0.05, -0.72], { rotation: [0, 18, 0] });
  put(new THREE.BoxGeometry(0.09, 0.08, 0.09), WOODP, [0.96, G + 0.14, -0.72], { rotation: [0, -10, 0] });
  for (const dy of [0.02, 0.08]) rod([0.92, G + dy, -0.665], [1.04, G + dy, -0.78], 0.005, WOODDARK, { sides: 4 });
  put(sph(8, 6), "#d8c08a", [0.82, G + 0.035, -0.92], { scale: [0.07, 0.05, 0.06] });
  put(cone(0.015, 0.035, 5), "#d8c08a", [0.82, G + 0.095, -0.92]);
  put(new THREE.TorusGeometry(0.014, 0.004, 4, 8), ROPE, [0.82, G + 0.084, -0.92], { rotation: [90, 0, 0] });
=======
  jar(0.02, -0.68, CLAY, 1.1);
  jar(0.07, -0.48, GLAZE, 0.9);
  jar(-0.04, -0.55, CLAY, 0.8);
  put(new THREE.BoxGeometry(0.12, 0.1, 0.12), WOODP, [1.04, G + 0.05, -0.66], { rotation: [0, 18, 0] });
  put(new THREE.BoxGeometry(0.09, 0.08, 0.09), WOODP, [1.02, G + 0.14, -0.66], { rotation: [0, -10, 0] });
  for (const dy of [0.02, 0.08]) rod([0.98, G + dy, -0.605], [1.1, G + dy, -0.72], 0.005, WOODDARK, { sides: 4 });
  put(sph(8, 6), "#d8c08a", [0.95, G + 0.035, -0.9], { scale: [0.07, 0.05, 0.06] });
  put(cone(0.015, 0.035, 5), "#d8c08a", [0.95, G + 0.095, -0.9]);
  put(new THREE.TorusGeometry(0.014, 0.004, 4, 8), ROPE, [0.95, G + 0.084, -0.9], { rotation: [90, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    const humpAt = T(0, 0.45, -0.05);
    const humpDir = Dr(0, 1, -0.3);
=======
    const humpAt = T(0, 0.405, -0.05);
    const humpDir = Dr(0, 1, -0.15);
>>>>>>> REPLACE
<<<<<<< SEARCH
      scale: [0.075 * k, 0.12 * k, 0.09 * k],
=======
      scale: [0.072 * k, 0.125 * k, 0.12 * k],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(humpGeo(0.22 * PI, 0.62 * PI), blanket, {
      bone: mid,
      at: humpAt,
      dir: humpDir,
      scale: [0.081 * k, 0.126 * k, 0.096 * k],
    });
    try {
      const ring = b.surface(body).loop(mid, { lift: 0.004 * k });
      const drape = ring.slice(0.7, 1).concat(ring.slice(0, 0.3));
      b.sweep(drape, (): [number, number] => [0.05 * k, 0.0035 * k], {
        color: blanket,
        section: "box",
        bone: mid,
        caps: "flat",
      });
      const fwd = Dr(0, 0, 1);
      [0.7, 0.3].forEach((e, ei) => {
        const q = ring.at(e);
        for (let i = -1; i <= 1; i++)
          b.spike(
            [q.x + fwd[0] * i * 0.034 * k, q.y - 0.004 * k, q.z + fwd[2] * i * 0.034 * k],
            [0, -1, 0],
            0.04 * k,
            0.008 * k,
            { color: (i + ei) % 2 ? RED : GOLD, bone: mid, sides: 5 },
          );
      });
    } catch {
      /* the cloth band is decoration only */
    }
=======
    // saddle cloth: two flank panels hung from a narrow strip over the hump
    {
      const P3 = (x: number, y: number, z: number) => new THREE.Vector3(...T(x, y, z));
      const th = Math.atan(0.15);
      const flankPt = (sd: number, u: number, v: number) => {
        const z = -0.105 + 0.11 * u;
        const tt = Math.min(Math.max((z + 0.17) / 0.34, 0), 1);
        const ph = (58 + 57 * v) * (PI / 180);
        const rx = (0.07 + 0.018 * sin(PI * tt)) * 1.09;
        const ry = (0.08 + 0.02 * sin(PI * tt)) * 1.09;
        const yc = 0.3 + 0.02 * sin(PI * Math.min(tt * 1.1, 1));
        return P3(sd * rx * sin(ph), yc + ry * cos(ph), z);
      };
      const strip = gridGeo(
        10,
        1,
        (u, v) => {
          const al = (-107 + 214 * u) * (PI / 180);
          const cy = cos(al);
          const f = 1 - 0.32 * Math.max(0, cy);
          const lx = 0.072 * 1.08 * f * sin(al);
          const ly = 0.125 * 1.08 * cy;
          const lz = (v - 0.5) * 0.04;
          return P3(lx, 0.405 + ly * cos(th) + lz * sin(th), -0.05 - ly * sin(th) + lz * cos(th));
        },
        true,
      );
      b.part(strip, blanket, { bone: mid, at: [0, 0, 0] });
      for (const sd of [1, -1]) {
        b.part(
          gridGeo(4, 4, (u, v) => flankPt(sd, u, v), false),
          blanket,
          { bone: mid, at: [0, 0, 0] },
        );
        for (let i = 0; i <= 4; i++) {
          const q = flankPt(sd, i / 4, 1);
          b.spike([q.x, q.y, q.z], [0, -1, 0], 0.03 * k, 0.007 * k, {
            color: i % 2 ? RED : GOLD,
            bone: mid,
            sides: 4,
          });
        }
      }
    }
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.sweep(catmull([H(s * 0.027, 0.03, 0.036), H(s * 0.034, 0.034, 0.05), H(s * 0.039, 0.03, 0.065)]), 0.004 * hk, {
        bone: head,
        color: coat,
        sides: 5,
      });
=======
      b.sweep(catmull([H(s * 0.027, 0.034, 0.036), H(s * 0.034, 0.038, 0.05), H(s * 0.039, 0.034, 0.065)]), 0.0025 * hk, {
        bone: head,
        color: coat,
        sides: 5,
      });
      const mp = (z: number, y: number) => {
        const u = (z - 0.06) / 0.055;
        const cy = -0.005 - 0.025 * u;
        const rr = 0.031 - 0.003 * u;
        const dy = y - cy;
        return H(s * Math.sqrt(Math.max(rr * rr - dy * dy, 0)) * 0.97, y, z);
      };
      b.sweep(catmull([mp(0.088, -0.034), mp(0.1, -0.04), mp(0.113, -0.038)]), 0.0022 * hk, {
        bone: head,
        color: DARKWOOD,
        sides: 4,
      });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.spike(H(0, 0.04, 0.0), Dr(0, 1, -0.4), 0.04 * hk, 0.01 * hk, { color: HAIR, bone: head, sides: 5 });
    b.spike(H(0, 0.04, 0.02), Dr(0, 1, 0.1), 0.03 * hk, 0.009 * hk, { color: HAIR, bone: head, sides: 5 });
=======
    b.part(new THREE.IcosahedronGeometry(1, 0), HAIR, {
      bone: head,
      at: H(0, 0.049, 0.045),
      scale: [0.0125 * hk, 0.006 * hk, 0.016 * hk],
      flat: true,
    });
>>>>>>> REPLACE
<<<<<<< SEARCH
  camel("Calf", -0.25, 0.96, 0.35, 0.58, 1.3, CALF, BLANKET2);
=======
  camel("Calf", -0.54, 0.94, 0.35, 0.58, 1.3, CALF, BLANKET2);
>>>>>>> REPLACE