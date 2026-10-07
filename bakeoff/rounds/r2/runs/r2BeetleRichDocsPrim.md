```ts
import * as THREE from "three";
import { createBuilder, rng, limb, grain } from "agentic-3js-builder";

export const meta = {
  name: "Stag Beetle on a Mossy Log",
  description:
    "A proud stag beetle with a glossy chestnut wing case, black head and thorax, branched reddish antler jaws, elbowed feathery antennae and six spiny legs gripping a mossy log, with a dewdrop on one antler.",
};

const BLACK = "#14100e";
const BLACK2 = "#241a16";
const CHEST = "#7c2c10";
const CHEST_HI = "#b8532a";
const SHINE = "#f4c29a";
const JAW = "#8c3a1a";
const JAW_TIP = "#5c2210";
const DEW = "#c4ecff";
const WHITE = "#ffffff";

const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.12, 0] });
  const body = b.joint("body", { parent: root, at: [0, 0.275, -0.02], dir: [0, 0, 1] });
  const thorax = b.joint("thorax", { parent: body, at: [0, 0.275, 0.02], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.275, 0.055], dir: [0, 0, 1], role: "head" });
  const elytra: Record<string, any> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    elytra[S] = b.joint(`elytra${S}`, {
      parent: body,
      at: [s * 0.008, 0.298, 0.03],
      dir: [0, 0, -1],
      role: "hinge",
    });
  }

  // ---------- log ----------
  const LOGR = 0.12;
  const logY = (x: number) => LOGR + Math.sqrt(Math.max(0, LOGR * LOGR - x * x));
  const bark = grain("#52402f", "#2c2118", { size: 0.018, axis: "z", seed: 3 });
  const log = b.part(new THREE.CylinderGeometry(LOGR, LOGR, 0.56, 12), bark, {
    bone: root,
    at: [0, LOGR, 0],
    rotation: [90, 0, 0],
  });
  for (const z of [0.281, -0.281]) {
    b.part(new THREE.CylinderGeometry(LOGR - 0.004, LOGR - 0.004, 0.006, 12), "#c9a070", {
      bone: root,
      at: [0, LOGR, z],
      rotation: [90, 0, 0],
    });
    for (const rr of [0.085, 0.05, 0.02]) {
      b.part(new THREE.TorusGeometry(rr, 0.0022, 4, 14), "#8a6238", {
        bone: root,
        at: [0, LOGR, z + Math.sign(z) * 0.003],
      });
    }
  }
  // bark ridges
  const logSurf = b.surface(log);
  const keepClear = (h: any) => !(Math.abs(h.at.z) < 0.1 && Math.abs(h.at.x) < 0.12 && h.at.y > 0.15);
  for (const h of logSurf.scatter(34, { rng: rng(11), minDist: 0.06, filter: (h: any) => h.n.y > -0.2 })) {
    b.stick(new THREE.BoxGeometry(0.012, 0.012, 0.07), "#3a2b1f", h, { embed: 0.5, flow: [0, 0, 1] });
  }
  // moss
  const mosses = ["#4f7a2a", "#3d6422", "#6a9437", "#2f5219"];
  const mossHits = logSurf.scatter(90, {
    rng: rng(21),
    minDist: 0.035,
    filter: (h: any) => h.n.y > 0.05 && keepClear(h),
  });
  let k = 0;
  for (const h of mossHits) {
    const r = 0.014 + ((k * 37) % 11) * 0.0023;
    b.stick(new THREE.SphereGeometry(r, 6, 4), mosses[k % 4], h, { embed: 0.35, flow: [0, 0, 1] });
    k++;
  }
  // tiny mushrooms
  const mush = logSurf.scatter(30, {
    rng: rng(5),
    minDist: 0.1,
    filter: (h: any) => h.n.y > 0.3 && h.at.z < -0.1 && Math.abs(h.at.x) > 0.02,
  });
  for (const h of mush.slice(0, 3)) {
    b.stick(new THREE.CylinderGeometry(0.004, 0.005, 0.03, 6), "#e8dcc0", h, { embed: 0.2 });
    const cap = h.moved([0, 0.028, 0]);
    b.stick(new THREE.ConeGeometry(0.016, 0.014, 7), "#c2562e", cap, { embed: 0.1 });
  }

  // ---------- body ----------
  const ell = (x: number, y: number, z: number, seg = 14) =>
    new THREE.SphereGeometry(1, seg, 10).scale(x, y, z);

  // abdomen under the wing cases
  b.part(ell(0.03, 0.015, 0.055), BLACK2, { bone: body, at: [0, 0.267, -0.045], flat: true });
  // wing cases
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const j = elytra[S];
    b.part(ell(0.027, 0.026, 0.066, 16), CHEST, { bone: j, at: [s * 0.022, 0.285, -0.035], flat: true });
    // lighter back sheen
    b.part(ell(0.019, 0.012, 0.05, 12), CHEST_HI, { bone: j, at: [s * 0.022, 0.302, -0.035], flat: true });
    // mirror shine streaks
    b.part(ell(0.005, 0.003, 0.024, 8), SHINE, { bone: j, at: [s * 0.03, 0.311, -0.012], flat: true });
    b.part(ell(0.0035, 0.0025, 0.009, 8), WHITE, { bone: j, at: [s * 0.031, 0.3135, 0.008], flat: true });
    b.part(ell(0.004, 0.0025, 0.012, 8), SHINE, { bone: j, at: [s * 0.015, 0.312, -0.055], flat: true });
  }
  // thorax (pronotum)
  b.part(ell(0.036, 0.021, 0.024, 14), BLACK, { bone: thorax, at: [0, 0.278, 0.03], flat: true });
  b.part(ell(0.026, 0.008, 0.016, 10), "#3a2d28", { bone: thorax, at: [0, 0.293, 0.03], flat: true });
  b.part(ell(0.008, 0.008, 0.012, 6), BLACK, { bone: thorax, at: [0.0, 0.272, 0.0], flat: true });

  // head
  b.part(ell(0.03, 0.017, 0.022, 14), BLACK, { bone: head, at: [0, 0.277, 0.07], flat: true });
  b.part(new THREE.BoxGeometry(0.036, 0.01, 0.014), BLACK2, { bone: head, at: [0, 0.272, 0.086] });
  for (const s of [1, -1]) {
    b.part(ell(0.007, 0.008, 0.009, 6), "#3b2212", { bone: head, at: [s * 0.03, 0.283, 0.068], flat: true });
    b.part(new THREE.SphereGeometry(0.0022, 5, 4), WHITE, { bone: head, at: [s * 0.034, 0.286, 0.072] });
  }

  // ---------- jaws (antlers) ----------
  const jawSweeps: Record<string, any> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const path = [
      [s * 0.014, 0.272, 0.085],
      [s * 0.027, 0.274, 0.108],
      [s * 0.03, 0.277, 0.13],
      [s * 0.013, 0.28, 0.158],
    ];
    const ch = b.chain(`jaw${S}c`, path, {
      parent: head,
      names: [`jaw${S}`, `jawMid${S}`, `jawTip${S}`],
      role: "jaw",
    });
    const sw = b.sweep(ch, (t: number) => 0.0115 * (1 - t) + 0.004, {
      color: JAW,
      sides: 6,
      caps: "point",
    });
    jawSweeps[S] = { sw, ch };
    const tines: [number, number[], number][] = [
      [0.12, [-s * 1.0, 0.1, 0.5], 0.026],
      [0.38, [-s * 0.6, 0.8, 0.5], 0.03],
      [0.58, [-s * 0.9, 0.5, 0.4], 0.034],
      [0.78, [-s * 0.3, 0.9, 0.5], 0.03],
    ];
    for (const [t, d, len] of tines) {
      b.spike(sw.at(t), d, len, 0.0065, { color: JAW_TIP, sides: 5 });
    }
    // dark tooth ridge along the inside
    b.spike(sw.at(0.95), [-s * 0.4, 0.2, 1], 0.02, 0.004, { color: JAW_TIP, sides: 5 });
  }
  // dewdrop on the left antler
  {
    const p = jawSweeps.L.sw.at(0.58, 180);
    const pt = V(p.at as any);
    const dp: number[] = [pt.x, pt.y - 0.006, pt.z];
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), DEW, { bone: jawSweeps.L.ch.joints[1], at: dp });
    b.part(new THREE.SphereGeometry(0.0024, 5, 4), WHITE, {
      bone: jawSweeps.L.ch.joints[1],
      at: [dp[0] - 0.003, dp[1] + 0.003, dp[2] + 0.003],
    });
  }

  // ---------- antennae ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const p0 = [s * 0.024, 0.28, 0.085];
    const p1 = [s * 0.04, 0.288, 0.108];
    const p2 = [s * 0.034, 0.298, 0.13];
    const ch = b.chain(`ant${S}c`, [p0, p1, p2], {
      parent: head,
      names: [`antenna${S}`, `antElbow${S}`, `antTip${S}`],
      role: "tentacle",
    });
    b.sweep(ch, [0.003, 0.002], { color: BLACK2, sides: 5 });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), BLACK, { bone: ch.joints[1], at: p1 });
    const d = V(p2).sub(V(p1)).normalize();
    for (const kk of [-1.5, -0.5, 0.5, 1.5]) {
      const dir = d.clone().add(new THREE.Vector3(-s * 0.15, kk * 0.4, 0)).normalize();
      b.spike(p2, dir.toArray(), 0.022, 0.0034, { color: "#3a2417", bone: ch.tip ?? ch.joints[1], sides: 4 });
    }
  }

  // ---------- legs ----------
  const rows: [string, number, number, number][] = [
    ["F", 0.04, 0.08, 0.052],
    ["M", 0.0, 0.092, 0.0],
    ["H", -0.04, 0.084, -0.062],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const [n, hz, fx, fz] of rows) {
      const hip: number[] = [s * 0.028, 0.268, hz];
      const fxx = s * fx;
      const foot: number[] = [fxx, logY(fxx) + 0.004, fz + hz * 0.3];
      const pts = limb(hip, foot, [0.04, 0.046, 0.03], [s * 0.3, 1, 0]);
      const ch = b.chain(
        `leg${S}${n}`,
        pts,
        {
          parent: body,
          names: [`hip${S}${n}`, `knee${S}${n}`, `ankle${S}${n}`, `foot${S}${n}`],
          role: "leg",
          contact: foot,
        },
      );
      b.part(new THREE.SphereGeometry(0.009, 6, 4), BLACK, { bone: ch.joints[0], at: hip });
      const sw = b.sweep(ch, (t: number) => 0.0068 - 0.0038 * t, { color: BLACK, sides: 6, caps: "round" });
      b.along(sw, 5, (at: any) => b.spike(at, at, 0.011, 0.0024, { color: BLACK2, sides: 4 }));
      b.part(new THREE.SphereGeometry(0.0055, 6, 4), BLACK2, { bone: ch.joints[1], at: pts[1] });
      // claws
      const last = pts[pts.length - 1];
      for (const o of [-1, 1]) {
        b.spike(last, [o * 0.4, -1, 0.4], 0.014, 0.0026, { color: BLACK2, bone: ch.tip ?? ch.joints[2], sides: 4 });
      }
    }
  }

  return b.root;
}
```