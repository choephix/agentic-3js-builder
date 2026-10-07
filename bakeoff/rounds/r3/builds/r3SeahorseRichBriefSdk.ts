import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with a spiked crown, tube snout, fluttering dorsal fin and big eyes, gripping a strand of seagrass with its curled tail.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const YEL = "#f7c818", CREAM = "#ffe88c", DARK = "#5b3a12", ORANGE = "#e88a26";
  const WHITE = "#fffdf2", BLACK = "#1a1410", G1 = "#3f9b4a", G2 = "#2e7d3e", G3 = "#63b85a";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.18, 0.03] });
  const head = b.joint("head", { at: [0, 0.34, 0.04], parent: hips });
  const jaw = b.joint("jaw", { at: [0, 0.338, 0.07], parent: head });

  // spine path: neck -> belly -> tail wrapping the strand
  const pts: THREE.Vector3[] = [
    V(0, 0.335, 0.03), V(0, 0.305, 0.015), V(0, 0.265, 0.015), V(0, 0.225, 0.03),
    V(0, 0.18, 0.04), V(0, 0.14, 0.025), V(0, 0.105, 0.0),
  ];
  const cz = 0.019, R = 0.024, N = 14;
  for (let k = 0; k <= N; k++) {
    const th = (k / N) * Math.PI * 3;
    pts.push(V(R * Math.sin(th), 0.085 - 0.07 * (k / N), cz - R * Math.cos(th)));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  const chainPts = curve.getSpacedPoints(22).map((p) => [p.x, p.y, p.z]);
  const spine = b.chain("spine", chainPts, { parent: hips, role: "spine" } as any);

  // radius profile by arc fraction
  const prof: [number, number][] = [
    [0, 0.017], [0.08, 0.021], [0.2, 0.036], [0.3, 0.041], [0.38, 0.03],
    [0.45, 0.018], [0.6, 0.012], [0.85, 0.008], [1, 0.005],
  ];
  const rad = (u: number) => {
    for (let i = 1; i < prof.length; i++) {
      if (u <= prof[i][0]) {
        const [a, ra] = prof[i - 1], [c, rc] = prof[i];
        return ra + ((u - a) / (c - a)) * (rc - ra);
      }
    }
    return prof[prof.length - 1][1];
  };
  b.sweep(spine, (t: number) => rad(t), { color: YEL } as any);

  const frameAt = (u: number) => {
    const p = curve.getPointAt(u);
    const t = curve.getTangentAt(u);
    const n = V(0, -t.z, t.y).normalize(); // back normal
    if (n.z > 0) n.negate();
    return { p, t, n, r: rad(u) };
  };
  const dirAt = (f: ReturnType<typeof frameAt>, a: number) =>
    V(Math.cos(a), 0, 0).add(f.n.clone().multiplyScalar(Math.sin(a))).normalize();

  // ---------- dark lines (ridge rings) ----------
  const ringGeo = (r: number) => {
    const g = new THREE.TorusGeometry(r, 0.0022, 3, 10);
    g.rotateX(Math.PI / 2);
    return g;
  };
  for (let i = 0; i < 34; i++) {
    const u = 0.03 + (i / 33) * 0.93;
    const f = frameAt(u);
    b.part(ringGeo(f.r * 1.07), DARK, { at: [f.p.x, f.p.y, f.p.z], dir: [f.t.x, f.t.y, f.t.z] } as any);
  }

  // cream belly plates
  for (let i = 0; i < 12; i++) {
    const u = 0.07 + (i / 11) * 0.33;
    const f = frameAt(u);
    const d = dirAt(f, -Math.PI / 2);
    const g = new THREE.SphereGeometry(f.r * 0.5, 5, 4);
    g.scale(1.0, 0.45, 0.8);
    const pos = f.p.clone().add(d.clone().multiplyScalar(f.r * 0.92));
    b.part(g, CREAM, { at: [pos.x, pos.y, pos.z], dir: [d.x, d.y, d.z] } as any);
  }

  // white freckles
  const rr = rng2(7);
  for (let i = 0; i < 16; i++) {
    const u = 0.04 + rr() * 0.4;
    const f = frameAt(u);
    const a = (rr() < 0.5 ? 1 : -1) * (0.2 + rr() * 1.3);
    const d = dirAt(f, a > 0 ? a : Math.PI - a);
    const side = a > 0 ? 1 : -1;
    const dd = V(side * Math.abs(d.x), 0, 0).add(f.n.clone().multiplyScalar(d.z * 0 + (rr() - 0.5) * 1.2)).normalize();
    const g = new THREE.SphereGeometry(0.004 + rr() * 0.002, 5, 4);
    const pos = f.p.clone().add(dd.clone().multiplyScalar(f.r * 1.0));
    b.part(g, WHITE, { at: [pos.x, pos.y, pos.z] } as any);
  }

  // back ridge spikes
  const cone = (base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, color: string, bone?: any) => {
    const d = dir.clone().normalize();
    const c = base.clone().add(d.clone().multiplyScalar(len / 2));
    const g = new THREE.ConeGeometry(r, len, 5);
    const o: any = { at: [c.x, c.y, c.z], dir: [d.x, d.y, d.z] };
    if (bone) o.bone = bone;
    b.part(g, color, o);
  };
  for (let i = 0; i < 9; i++) {
    const u = 0.05 + (i / 8) * 0.4;
    const f = frameAt(u);
    const base = f.p.clone().add(f.n.clone().multiplyScalar(f.r * 0.95));
    cone(base, f.n.clone().add(V(0, 0.2, 0)), 0.014, 0.005, ORANGE);
  }
  // side knobs
  for (let i = 0; i < 6; i++) {
    const u = 0.1 + (i / 5) * 0.28;
    const f = frameAt(u);
    for (const s of [1, -1]) {
      const d = V(s, 0, 0).add(f.n.clone().multiplyScalar(-0.2)).normalize();
      cone(f.p.clone().add(d.clone().multiplyScalar(f.r * 0.95)), d, 0.009, 0.0045, ORANGE);
    }
  }

  // ---------- head ----------
  const hg = new THREE.SphereGeometry(0.03, 8, 6);
  hg.scale(0.85, 1.0, 1.1);
  b.part(hg, YEL, { at: [0, 0.35, 0.05], bone: head } as any);
  // forehead brow ridge
  const brow = new THREE.SphereGeometry(0.02, 6, 4);
  brow.scale(1.3, 0.5, 0.8);
  b.part(brow, ORANGE, { at: [0, 0.372, 0.06], bone: head } as any);
  // snout (upper) and lower jaw
  const up = new THREE.CylinderGeometry(0.007, 0.0115, 0.075, 7);
  b.part(up, YEL, { at: [0, 0.35, 0.105], dir: [0, -0.06, 1], bone: head } as any);
  const lo = new THREE.CylinderGeometry(0.0045, 0.007, 0.06, 6);
  b.part(lo, CREAM, { at: [0, 0.338, 0.1], dir: [0, 0.0, 1], bone: jaw } as any);
  b.part(new THREE.SphereGeometry(0.006, 5, 4), DARK, { at: [0, 0.347, 0.145], bone: head } as any);
  // snout rings
  for (let i = 0; i < 4; i++) {
    const z = 0.08 + i * 0.016;
    const g = new THREE.TorusGeometry(0.0095 - i * 0.0007, 0.0018, 3, 8);
    b.part(g, DARK, { at: [0, 0.35 - i * 0.0009, z], bone: head } as any);
  }
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0155, 8, 6), WHITE, { at: [s * 0.027, 0.362, 0.056], bone: head } as any);
    b.part(new THREE.SphereGeometry(0.0105, 8, 6), BLACK, { at: [s * 0.036, 0.362, 0.06], bone: head } as any);
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), WHITE, { at: [s * 0.04, 0.368, 0.067], bone: head } as any);
    b.part(new THREE.SphereGeometry(0.0025, 5, 4), ORANGE, { at: [s * 0.032, 0.353, 0.066], bone: head } as any);
    // cheek spine
    cone(V(s * 0.022, 0.335, 0.045), V(s * 0.6, -0.3, -0.5), 0.016, 0.005, ORANGE, head);
    // pectoral fin
    const pg = new THREE.SphereGeometry(0.02, 5, 4);
    pg.scale(0.12, 1.0, 0.8);
    b.part(pg, ORANGE, { at: [s * 0.036, 0.3, 0.0], bone: hips } as any);
  }
  // crown of spikes
  const crown: [number, number, number, number][] = [
    [0, 0.378, 0.075, 0.022], [0, 0.382, 0.055, 0.03], [0, 0.378, 0.035, 0.026],
    [0, 0.368, 0.02, 0.02], [0.013, 0.376, 0.05, 0.02], [-0.013, 0.376, 0.05, 0.02],
    [0.017, 0.368, 0.03, 0.016], [-0.017, 0.368, 0.03, 0.016],
  ];
  crown.forEach(([x, y, z, l]) => {
    cone(V(x, y, z), V(x * 12, 1, -0.45), l, 0.006, ORANGE, head);
  });

  // ---------- dorsal fin ----------
  {
    const f = frameAt(0.34);
    const base = f.p.clone().add(f.n.clone().multiplyScalar(f.r * 0.8));
    const outline: number[][] = [
      [0, -0.04], [0.02, -0.038], [0.03, -0.028], [0.038, -0.015], [0.034, -0.002],
      [0.042, 0.01], [0.034, 0.022], [0.036, 0.034], [0.02, 0.04], [0, 0.04],
    ];
    b.extrude(outline, { at: [base.x, base.y, base.z], x: [0, 0, -1], y: [0, 1, 0], depth: 0.003 } as any);
    // fin rays
    const fan = [-0.034, -0.017, 0, 0.017, 0.034];
    fan.forEach((yy, i) => {
      const g = new THREE.CylinderGeometry(0.0012, 0.0012, 0.036, 3);
      const c = base.clone().add(V(0, yy * 0.9, -0.02));
      b.part(g, ORANGE, { at: [c.x, c.y, c.z], dir: [0, yy * 5, -1] } as any);
    });
  }

  // ---------- seagrass ----------
  const blade = (ptsB: number[][], r: number, color: string) => {
    const c = new THREE.CatmullRomCurve3(ptsB.map((p) => V(p[0], p[1], p[2])));
    const arr = c.getSpacedPoints(14).map((p) => [p.x, p.y, p.z]);
    b.sweep(arr, (t: number) => r * (1 - 0.7 * t), { color } as any);
  };
  blade([[0, -0.004, cz], [0, 0.07, cz], [0.05, 0.13, cz], [0.09, 0.22, cz - 0.005], [0.11, 0.35, cz - 0.01], [0.09, 0.48, cz - 0.02], [0.12, 0.6, cz - 0.01]], 0.012, G1);
  blade([[0.03, -0.004, 0.0], [0.045, 0.12, -0.01], [0.07, 0.25, -0.03], [0.05, 0.4, -0.04]], 0.007, G2);
  blade([[-0.05, -0.004, -0.02], [-0.07, 0.1, -0.03], [-0.1, 0.22, -0.02], [-0.09, 0.33, -0.01]], 0.007, G3);
  blade([[-0.03, -0.004, 0.06], [-0.05, 0.1, 0.07], [-0.08, 0.18, 0.09]], 0.006, G2);
  // sandy base
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.02, 9), "#e8d49a", { at: [0, 0.0, 0.01], bone: hips } as any);

  return b.root;
}

function rng2(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
