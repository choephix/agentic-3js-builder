1. **Palm crowns:** I deleted the `FROND` card texture and `mk()` and now build each frond as a rib sweep along a cubic bezier, with merged leaflet geometry on it. Each mature palm gets 9 arching fronds (0.45–0.65 m, tips drooping about 0.16–0.23 m below the crown) plus 3 shorter upright ones. The leaflets are flattened 4-sided cones in pairs along the rib (about 0.17–0.2 m wide), merged into two shaded parts per palm.
2. **Camel humps:** The hump is now a tapered ellipsoid of about 0.075 × 0.12 × 0.09 m, leaning rearward, with its lower third buried in the back. The blanket dome and gold spikes are gone. In their place is a thin cloth shell around the hump with the crest left open, plus a cloth band swept over the back and down both flanks. Small tassels hang from the band ends.
3. **Faces:** Eyes are about 20% smaller and sit embedded in the skull. The brow is a thin curved sweep (about half the old thickness) seated on the skull. Ears are flattened rounded leaf shapes (about 0.045 × 0.022 × 0.010 m × `hk`) angled outward and back, with a smaller pink inner ear recessed on the front face. I removed the lashes. The long muzzle and the calf's larger head ratio are unchanged.
4. **Pond:** The green cylinder is replaced by a 20-vertex irregular shoreline annulus sloping from `G + 0.001` outside to `G + 0.008` inside. It is painted grass where noise is high and sand where it is low, so it is broken up. The water top is at `G + 0.006`, which removes the cyan wall. The ripple plane, pads and lotus are lowered by 0.029 m.
5. **Lanterns and pot:** `lantern()` now takes an explicit attach point and ropes it to the roof tip. The awning posts and a new crossbar carry a lantern hung from a hook on the bar. The standing lantern hangs from the post's real endpoint. The pot gets a 0.03 m semicircular bail, and the tripod chain ends at its top. The sparks are untouched.
6. **Sightline:** The juvenile palm is removed and the calf moves to (-0.25, 0.96) with the same yaw and scale.
7. **Quieter patterns:** Sand ripples are blended at 0.18 and 0.08 with softened thresholds. `TRUNK` contrast is lower. `baseP` is now three broad strata. The shoreline green is darker.

## Edits

<<<<<<< SEARCH
import * as THREE from "three";
=======
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
>>>>>>> REPLACE

<<<<<<< SEARCH
  noise,
  mix,
=======
  noise,
  aim,
  mix,
>>>>>>> REPLACE

<<<<<<< SEARCH
  if (rip > 0.92) c = mix(c, SAND_C, 0.6);
  else if (rip < -0.95) c = mix(c, SAND_D, 0.25);
=======
  c = mix(c, SAND_C, 0.18 * smoothstep(0.82, 0.96, rip));
  c = mix(c, SAND_D, 0.08 * smoothstep(-0.88, -0.98, rip));
>>>>>>> REPLACE

<<<<<<< SEARCH
const STRATA = ["#b9783f", "#8f5530", "#d49a5c", "#6e4126"];
const baseP = paint((p, n) => {
  if (n.y > 0.8) return sand;
  const band = Math.floor(p.y / 0.03 + noise(p, 0.3, 8) * 1.4);
  return STRATA[((band % 4) + 4) % 4];
});
=======
const STRATA = ["#94623a", "#b47f48", "#c99a60"];
const baseP = paint((p, n) => {
  if (n.y > 0.8) return sand;
  const y = p.y + (noise(p, 0.5, 8) - 0.5) * 0.02;
  return y < 0.05 ? STRATA[0] : y < 0.11 ? STRATA[1] : STRATA[2];
});
>>>>>>> REPLACE

<<<<<<< SEARCH
const GRASS = mottle("#86c44e", "#5fa63e", { size: 0.16, seed: 6 });
=======
const GRASS = mottle("#709f40", "#5a8a37", { size: 0.16, seed: 6 });
const SHORE = paint((p) => (noise(p, 0.14, 21) < 0.36 ? sand : GRASS));
>>>>>>> REPLACE

<<<<<<< SEARCH
  stripes("#a8723f", "#7a4a26", { size: 0.04, axis: "y", width: 0.5, wobble: 0.12, seed: 2 }),
  "#573419",
=======
  stripes("#a06c3d", "#92603a", { size: 0.04, axis: "y", width: 0.5, wobble: 0.12, seed: 2 }),
  "#664020",
>>>>>>> REPLACE

<<<<<<< SEARCH
function frondSvg() {
  let s = `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">`;
  s += `<path d="M32 128 L32 6" stroke="#355f27" stroke-width="2.8" stroke-linecap="round" fill="none"/>`;
  const cols = ["#2f6f2d", "#3a8433", "#4a9a3a", "#5db044", "#78c653"];
  for (let i = 0; i < 13; i++) {
    const y = 122 - i * 9;
    const w = 28 * (1 - i / 16) + 3;
    const c = cols[Math.min(4, Math.floor((i / 13) * 5))];
    for (const side of [-1, 1]) {
      const x1 = 32 + side * w;
      s += `<path d="M32 ${y} Q${32 + side * w * 0.6} ${y - 2} ${x1} ${y - 14} Q${32 + side * w * 0.45} ${y - 7} 32 ${y - 3.5} Z" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`;
    }
  }
  s += `<path d="M32 14 Q26 7 32 0 Q38 7 32 14Z" fill="#8bd45c"/></svg>`;
  return svg(s, { size: 256 });
}

=======
>>>>>>> REPLACE

<<<<<<< SEARCH
  const FROND = frondSvg();
  const TUFT = tuftSvg();
=======
  const TUFT = tuftSvg();
>>>>>>> REPLACE

<<<<<<< SEARCH
  put(new THREE.CylinderGeometry(1, 1, 0.04, 16), GRASS, [PX, G + 0.005, PZ], { scale: [0.68, 1, 0.5], flat: true });
  put(new THREE.CylinderGeometry(1, 1, 0.05, 18), water, [PX, G + 0.01, PZ], { scale: [0.47, 1, 0.34] });
  put(new THREE.PlaneGeometry(1, 1), WHITE, [PX, G + 0.0365, PZ], {
=======
  {
    // irregular shoreline annulus, sloping from the sand up to a low lip at the water
    const N = 20;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * PI * 2;
      const v = 1 + 0.1 * sin(a * 3 + 0.7) + 0.05 * sin(a * 5 + 2.1);
      const w = 1 + 0.02 * sin(a * 4);
      pos.push(PX + cos(a) * 0.62 * v, G + 0.001, PZ + sin(a) * 0.45 * v);
      pos.push(PX + cos(a) * 0.45 * w, G + 0.008, PZ + sin(a) * 0.325 * w);
    }
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      idx.push(2 * i, 2 * i + 1, 2 * j, 2 * i + 1, 2 * j + 1, 2 * j);
    }
    const shore = new THREE.BufferGeometry();
    shore.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    shore.setIndex(idx);
    shore.computeVertexNormals();
    put(shore, SHORE, [0, 0, 0], { flat: true });
  }
  put(new THREE.CylinderGeometry(1, 1, 0.02, 18), water, [PX, G - 0.004, PZ], { scale: [0.47, 1, 0.34] });
  put(new THREE.PlaneGeometry(1, 1), WHITE, [PX, G + 0.0075, PZ], {
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(new THREE.CylinderGeometry(r, r, 0.008, 8), PADGREEN, [x, G + 0.039, z], { flat: true });
=======
    put(new THREE.CylinderGeometry(r, r, 0.008, 8), PADGREEN, [x, G + 0.01, z], { flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    put(cone(0.014, 0.05, 4), PINK, [LX + cos(a) * 0.016, G + 0.068, LZ + sin(a) * 0.016], { dir });
  }
  put(sph(6, 4), YELLOW, [LX, G + 0.058, LZ], { scale: [0.014, 0.012, 0.014] });
  put(cone(0.012, 0.04, 4), PINK, [LX, G + 0.075, LZ]);
=======
    put(cone(0.014, 0.05, 4), PINK, [LX + cos(a) * 0.016, G + 0.039, LZ + sin(a) * 0.016], { dir });
  }
  put(sph(6, 4), YELLOW, [LX, G + 0.029, LZ], { scale: [0.014, 0.012, 0.014] });
  put(cone(0.012, 0.04, 4), PINK, [LX, G + 0.046, LZ]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    const mk = (n: number, off: number, leanA: number, bend: number, len: number, wid: number) => {
      const fr = Array.from({ length: n }, () => frame([top[0], top[1] + 0.01 * s, top[2]] as V, [0, 1, 0]));
      b.cards(fr, FROND, {
        size: [wid * s, len * s],
        lean: leanA,
        bend,
        flow: (_f: any, i: number): V => {
          const a = off + (i * PI * 2) / n;
          return [sin(a), 0, cos(a)];
        },
        vary: 0.12,
        rng: R,
        sink: 0.04,
        bone: base,
      });
    };
    mk(7, az + 0.2, 40, 78, 0.62, 0.34);
    mk(6, az + 0.65, 80, 55, 0.55, 0.3);
    return path;
=======
    // fronds: a swept rib per frond with paired low-poly leaflets merged per shade
    const crown = new THREE.Vector3(top[0], top[1] + 0.012 * s, top[2]);
    const dark: THREE.BufferGeometry[] = [];
    const light: THREE.BufferGeometry[] = [];
    const Y = new THREE.Vector3(0, 1, 0);
    const sc = 0.85 + 0.15 * s;
    const frond = (a: number, L: number, upright: boolean, shade: number) => {
      const o = new THREE.Vector3(sin(a), 0, cos(a));
      const P = (f: number, h: number) => crown.clone().addScaledVector(o, f * L).addScaledVector(Y, h * L);
      const fp = upright
        ? bezier(P(0, 0), P(0.05, 0.4), P(0.14, 0.75), P(0.28, 0.92))
        : bezier(P(0, 0), P(0.35, 0.4), P(0.75, 0.38), P(0.95, -0.35));
      b.sweep(fp, [0.008 * s, 0.002 * s], { bone: base, color: "#4f8a35", sides: 4, caps: "point" });
      const n = upright ? 7 : 11;
      for (let i = 0; i < n; i++) {
        const t = 0.14 + (i / (n - 1)) * 0.82;
        const pa = fp.at(t);
        const ta = fp.tangentAt(t);
        const pt = new THREE.Vector3(pa.x, pa.y, pa.z);
        const tg = new THREE.Vector3(ta.x, ta.y, ta.z);
        const side = new THREE.Vector3().crossVectors(tg, Y);
        if (side.lengthSq() < 1e-4) side.set(cos(a), 0, -sin(a));
        side.normalize();
        const lf = s * (0.04 + 0.06 * sin(PI * Math.min(t * 1.05, 1)));
        for (const sd of [1, -1]) {
          const d = side
            .clone()
            .multiplyScalar(0.85 * sd)
            .addScaledVector(tg, 0.5)
            .addScaledVector(Y, upright ? -0.12 : -0.38)
            .normalize();
          const g = new THREE.ConeGeometry(0.5, 1, 4, 1).translate(0, 0.5, 0);
          g.applyMatrix4(
            new THREE.Matrix4().compose(pt, aim(d, [0, 1, 0]), new THREE.Vector3(0.03 * s, lf, 0.007 * s)),
          );
          (shade % 2 ? dark : light).push(g);
        }
      }
    };
    const NF = 9;
    for (let i = 0; i < NF; i++) frond(az + (i / NF) * PI * 2 + (R() - 0.5) * 0.25, (0.5 + 0.15 * R()) * sc, false, i);
    for (let i = 0; i < 3; i++) frond(az + 0.7 + i * 2.1, 0.36 * sc, true, i);
    put(mergeGeometries(dark)!, "#2f7a30", [0, 0, 0], { flat: true });
    put(mergeGeometries(light)!, "#5cb347", [0, 0, 0], { flat: true });
    return path;
>>>>>>> REPLACE

<<<<<<< SEARCH
  palm(-0.88, 0.45, 0.82, 1.3, 0.2, 0.85);
  palm(0.22, 0.45, 0.42, -0.5, 0.06, 0.5);
=======
  palm(-0.88, 0.45, 0.82, 1.3, 0.2, 0.85);
>>>>>>> REPLACE

<<<<<<< SEARCH
  const lantern = (x: number, y: number, z: number, hang: number) => {
    rod([x, y + hang, z], [x, y + 0.055, z], 0.0025, ROPE);
=======
  const lantern = (x: number, y: number, z: number, attach: V) => {
    rod(attach, [x, y + 0.065, z], 0.003, ROPE, { sides: 4 });
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const u of [-0.22, 0.22]) {
      const l = lip(u);
      rod([l[0], l[1], l[2]], [l[0], G + 0.002, l[2]], 0.007, WOODP, { sides: 5 });
    }
    const l = lip(-0.22);
    lantern(l[0] + Rr[0] * 0.04, l[1] - 0.075, l[2] + Rr[2] * 0.04, 0.03);
=======
    const pole = (u: number): V => {
      const l = lip(u);
      return [l[0] + F[0] * 0.012, l[1], l[2] + F[2] * 0.012];
    };
    for (const u of [-0.22, 0.22]) {
      const l = pole(u);
      rod([l[0], l[1] + 0.004, l[2]], [l[0], G + 0.002, l[2]], 0.007, WOODP, { sides: 5 });
    }
    const barA = pole(-0.22);
    const barB = pole(0.22);
    const barY = barA[1] - 0.018;
    rod([barA[0], barY, barA[2]], [barB[0], barY, barB[2]], 0.0055, WOODP, { sides: 5 });
    const hook = pole(0);
    put(sph(6, 4), GOLD, [hook[0], barY, hook[2]], { scale: [0.009, 0.009, 0.009] });
    lantern(hook[0], barY - 0.095, hook[2], [hook[0], barY, hook[2]]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    lantern(lx + 0.07, G + 0.24, lz, 0.05);
=======
    put(sph(6, 4), GOLD, [lx + 0.06, G + 0.318, lz], { scale: [0.008, 0.008, 0.008] });
    lantern(lx + 0.06, G + 0.225, lz, [lx + 0.06, G + 0.316, lz]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    rod(apex, [fx, G + 0.2, fz], 0.0025, IRON, { sides: 4 });
=======
    rod(apex, [fx, G + 0.2435, fz], 0.003, IRON, { sides: 4 });
    put(new THREE.TorusGeometry(0.03, 0.0035, 4, 10, PI), IRON, [fx, G + 0.21, fz], { flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
    // hump with blanket cap
    b.part(sph(10, 7), coat, { bone: mid, at: T(0, 0.405, -0.03), scale: [0.07 * k, 0.085 * k, 0.075 * k] });
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, PI * 2, 0, PI * 0.62), blanket, {
      bone: mid,
      at: T(0, 0.405, -0.03),
      scale: [0.079 * k, 0.093 * k, 0.083 * k],
    });
    for (let i = 0; i < 3; i++)
      b.spike(T(0, 0.475, -0.03 + (i - 1) * 0.03), Dr(0, 1, (i - 1) * 0.35), 0.05 * k, 0.012 * k, {
        color: GOLD,
        bone: mid,
        sides: 5,
      });
    for (const s of [1, -1])
      for (let i = 0; i < 3; i++)
        b.spike(T(s * 0.075, 0.37, -0.07 + i * 0.04), Dr(s * 0.3, -1, 0), 0.04 * k, 0.008 * k, {
          color: i % 2 ? RED : GOLD,
          bone: mid,
          sides: 5,
        });
=======
    // tapered hump leaning rearward, with a thin saddle cloth draped over it and down both flanks
    const humpGeo = (th0: number, th1: number) => {
      const g = new THREE.SphereGeometry(1, 10, 7, 0, PI * 2, th0, th1);
      const pos = g.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const f = 1 - 0.32 * Math.max(0, pos.getY(i));
        pos.setXYZ(i, pos.getX(i) * f, pos.getY(i), pos.getZ(i) * f);
      }
      return g;
    };
    const humpAt = T(0, 0.45, -0.05);
    const humpDir = Dr(0, 1, -0.3);
    b.part(humpGeo(0, PI), coat, {
      bone: mid,
      at: humpAt,
      dir: humpDir,
      scale: [0.075 * k, 0.12 * k, 0.09 * k],
    });
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
>>>>>>> REPLACE

<<<<<<< SEARCH
      b.part(sph(7, 5), EYE, { bone: head, at: H(s * 0.037, 0.025, 0.055), scale: [0.012 * hk, 0.014 * hk, 0.012 * hk] });
      b.part(sph(5, 4), WHITE, { bone: head, at: H(s * 0.045, 0.031, 0.06), scale: [0.004 * hk, 0.005 * hk, 0.004 * hk] });
      b.capsule(H(s * 0.036, 0.043, 0.04), H(s * 0.04, 0.04, 0.072), 0.008 * hk, { bone: head, color: coat, sides: 5 });
      for (let i = 0; i < 3; i++)
        b.spike(H(s * 0.04, 0.036, 0.05 + i * 0.008), Dr(s * (0.5 + i * 0.2), 0.7, 0.4 + i * 0.3), 0.022 * hk, 0.0022 * hk, {
          color: EYE,
          bone: head,
          sides: 4,
        });
      b.spike(H(s * 0.026, 0.055, -0.005), Dr(s * 0.6, 1, -0.2), 0.034 * hk, 0.012 * hk, { color: coat, bone: head, sides: 5 });
      b.spike(H(s * 0.026, 0.058, -0.003), Dr(s * 0.6, 1, -0.2), 0.02 * hk, 0.006 * hk, { color: PINK, bone: head, sides: 5 });
=======
      b.part(sph(7, 5), EYE, { bone: head, at: H(s * 0.033, 0.022, 0.05), scale: [0.0096 * hk, 0.0112 * hk, 0.0096 * hk] });
      b.part(sph(5, 4), WHITE, { bone: head, at: H(s * 0.039, 0.026, 0.056), scale: [0.0032 * hk, 0.004 * hk, 0.0032 * hk] });
      b.sweep(catmull([H(s * 0.027, 0.03, 0.036), H(s * 0.034, 0.034, 0.05), H(s * 0.039, 0.03, 0.065)]), 0.004 * hk, {
        bone: head,
        color: coat,
        sides: 5,
      });
      const earDir = Dr(s * 0.8, 1, -0.6);
      b.part(sph(7, 5), coat, {
        bone: head,
        at: H(s * 0.038, 0.047, -0.008),
        dir: earDir,
        scale: [0.011 * hk, 0.0225 * hk, 0.005 * hk],
      });
      b.part(sph(6, 4), PINK, {
        bone: head,
        at: H(s * 0.0385, 0.0475, -0.0062),
        dir: earDir,
        scale: [0.006 * hk, 0.015 * hk, 0.004 * hk],
      });
>>>>>>> REPLACE

<<<<<<< SEARCH
  camel("Calf", -0.1, 0.9, 0.35, 0.58, 1.3, CALF, BLANKET2);
=======
  camel("Calf", -0.25, 0.96, 0.35, 0.58, 1.3, CALF, BLANKET2);
>>>>>>> REPLACE