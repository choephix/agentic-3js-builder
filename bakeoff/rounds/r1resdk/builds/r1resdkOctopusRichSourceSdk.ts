import * as THREE from "three";
import { createBuilder, catmull, rng, mottle, spots, countershade, svg } from "../../../../src/index";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust reef octopus with a bumpy bulbous mantle, golden bar-pupil eyes under grumpy lids, eight curling suckered arms, and one arm holding up an old brass key.",
};

export default function build() {
  const b = createBuilder({ name: "octopus", paintSize: 1024 });
  const R = rng(5);

  // ---------- palette & paints ----------
  const base = mottle("#e8765a", "#b4472f", { size: 0.07, seed: 2 });
  const pale = mottle(base, "#f3b99c", { size: 0.04, seed: 7, contrast: 2.5 });
  const dotted = spots(pale, "#f8d3b8", { size: 0.032, amount: 0.25, seed: 4 });
  const belly = mottle("#f4c9ae", "#e9a98f", { size: 0.05, seed: 9 });
  const skin = countershade(dotted, belly, { level: -0.3, soft: 0.3 });
  const brass = mottle("#d1a037", "#8f6a1c", { size: 0.025, seed: 3 });

  // ---------- skeleton root & mantle ----------
  b.joint("root", { at: [0, 0.09, 0], dir: [0, 1, 0] });
  const stations = [
    { at: [0, 0.095, 0.04], w: 0.18, h: 0.18 },
    { at: [0, 0.17, 0.0], w: 0.27, h: 0.27 },
    { at: [0, 0.25, -0.06], w: 0.3, h: 0.3 },
    { at: [0, 0.31, -0.11], w: 0.17, h: 0.17 },
  ];
  const spine = b.chain("mantle", catmull(stations.map((s) => s.at as [number, number, number])), {
    parent: "root",
    role: "spine",
    count: 3,
    names: ["mantle1", "mantle2", "mantle3"],
  });
  const mantle = b.loft(stations as any, { color: skin, bone: spine, name: "mantle" });

  // bumps on the mantle
  const bumpGeo = new THREE.IcosahedronGeometry(1, 0);
  const surf = b.surface(mantle);
  const hits = surf.scatter(70, { rng: rng(3), minDist: 0.034, filter: (h) => h.at.y > 0.12 });
  for (const h of hits) {
    const s = 0.008 + R() * 0.007;
    b.stick(bumpGeo, R() < 0.5 ? "#f0a48a" : "#c4553a", h, { scale: [s, s * 0.6, s], embed: 0.35 });
  }

  // ---------- eyes ----------
  const goldTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="none" stroke="#b86f10" stroke-width="5"/>
      <rect x="10" y="41" width="80" height="18" rx="8" fill="#1b0e08"/>
      <circle cx="36" cy="33" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const E = new THREE.Vector3(s * 0.105, 0.19, 0.07);
    const n = new THREE.Vector3(s * 0.65, 0.12, 0.75).normalize();
    b.joint("eye" + tag, { parent: "mantle2", at: E.toArray() as any, dir: n.toArray() as any });
    b.part(new THREE.SphereGeometry(0.052, 10, 8), "#c85b40", { at: E, bone: "eye" + tag, name: "socket" + tag });
    const G = E.clone().addScaledVector(n, 0.022);
    const ball = b.part(new THREE.SphereGeometry(0.036, 12, 9), "#f2b629", { at: G, bone: "eye" + tag, name: "eyeball" + tag });
    b.decal(ball, goldTex, {
      at: G.clone().addScaledVector(n, 0.036),
      dir: n,
      size: [0.07, 0.07],
      segments: 10,
      bone: "eye" + tag,
      name: "iris" + tag,
    });
    const pole = new THREE.Vector3(-s * 0.4, 1, 0.6).normalize();
    b.part(new THREE.SphereGeometry(0.041, 10, 5, 0, Math.PI * 2, 0, 1.1), "#a63f2b", {
      at: G,
      dir: pole,
      axis: "y",
      bone: "eye" + tag,
      name: "lid" + tag,
    });
  }

  // ---------- beak ----------
  b.joint("jaw", { parent: "root", at: [0, 0.05, 0.12], dir: [0, -0.3, 1], role: "jaw" });
  b.spike([0, 0.062, 0.113], [0, 0.044, 0.152], null, 0.015, { color: "#3a2412", bone: "root", name: "upperBeak" });
  b.spike([0, 0.045, 0.118], [0, 0.03, 0.146], null, 0.012, { color: "#4a2e18", bone: "jaw", name: "lowerBeak" });

  // ---------- arms ----------
  const armR = (u: number) => 0.034 * Math.pow(1 - u, 1.1) + 0.0045;
  const names = ["FL", "ML1", "ML2", "BL", "BR", "MR2", "MR1", "FR"];
  const lens = [0, 0.36, 0.4, 0.34, 0.38, 0.35, 0.4, 0.33];
  const curls = [0, 0.5, 0.7, 0.35, 0.6, 0.45, 0.65, 0.4];
  const lifts = [0, 0.03, 0.0, 0.07, 0.02, 0.08, 0.01, 0.05];
  const suckGeo = new THREE.TorusGeometry(0.7, 0.32, 5, 9).rotateX(Math.PI / 2);
  const discGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.25, 8);
  const keyJointHolder: { j: any; C: THREE.Vector3 } = { j: null, C: new THREE.Vector3() };

  names.forEach((nm, i) => {
    const a = ((22.5 + 45 * i) * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const perp = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const pts: number[][] = [];
    let maxT = 0.8;
    if (i === 0) {
      const at = (r: number, y: number) => [d.x * r, y, d.z * r];
      pts.push(at(0.07, 0.095), at(0.13, 0.11), at(0.19, 0.16), at(0.225, 0.22));
      const C = d.clone().multiplyScalar(0.27);
      keyJointHolder.C = C;
      for (let j = 0; j <= 9; j++) {
        const th = Math.PI + (j / 9) * 3 * Math.PI;
        const p = C.clone()
          .addScaledVector(d, 0.02 * Math.cos(th))
          .addScaledVector(perp, 0.02 * Math.sin(th));
        pts.push([p.x, 0.26 + (j / 9) * 0.15, p.z]);
      }
      maxT = 0.5;
    } else {
      for (let j = 0; j < 8; j++) {
        const u = j / 7;
        const Rr = 0.07 + lens[i] * u;
        const ang = a + curls[i] * u * u * 1.6;
        const y = armR(u) + 0.002 + 0.05 * (1 - u) ** 2 + lifts[i] * u ** 3;
        pts.push([Math.sin(ang) * Rr, y, Math.cos(ang) * Rr]);
      }
    }
    const chain = b.chain("arm" + nm, catmull(pts as any), { parent: "root", role: "tentacle", count: i === 0 ? 5 : 4 });
    const arm = b.sweep(chain, armR, { color: skin, name: "arm" + nm });
    if (i === 0) keyJointHolder.j = chain.spanJoints[chain.spanJoints.length - 1];

    // suckers
    for (let k = 0; k < 10; k++) {
      const t = 0.07 + k * 0.075;
      if (t > maxT) break;
      const s = armR(t) * 0.62;
      for (const ang of [105, 255]) {
        const hit = arm.at(t, ang, 0);
        b.stick(suckGeo, "#f6e6c8", hit, { scale: s, embed: 0.2, name: "sucker" + nm });
        b.stick(discGeo, "#d98b78", hit, { scale: s, embed: 0.2, name: "suckerPad" + nm });
      }
    }
    // dorsal bumps
    for (const t of [0.18, 0.34, 0.5, 0.66]) {
      if (i === 0 && t > 0.5) continue;
      const hit = arm.at(t, (R() - 0.5) * 70, 0);
      const s = 0.005 + R() * 0.003;
      b.stick(bumpGeo, R() < 0.5 ? "#f0a48a" : "#c4553a", hit, { scale: [s, s * 0.6, s], embed: 0.3 });
    }
  });

  // ---------- brass key ----------
  const { j, C } = keyJointHolder;
  const K = (x: number, y: number, z: number) => new THREE.Vector3(C.x + x, y, C.z + z);
  b.rod(K(0, 0.19, 0), K(0, 0.468, 0), 0.008, { color: brass, bone: j, name: "keyShaft" });
  b.part(new THREE.TorusGeometry(0.032, 0.008, 6, 12), brass, { at: K(0, 0.5, 0), bone: j, name: "keyBow" });
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 8), brass, { at: K(0, 0.43, 0), bone: j, name: "keyCollar" });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.01), brass, { at: K(0.02, 0.205, 0), bone: j, name: "keyTooth1" });
  b.part(new THREE.BoxGeometry(0.022, 0.012, 0.01), brass, { at: K(0.016, 0.228, 0), bone: j, name: "keyTooth2" });
  b.part(new THREE.BoxGeometry(0.014, 0.012, 0.01), brass, { at: K(0.01, 0.2, 0), bone: j, name: "keyTooth3" });

  return b.root;
}
