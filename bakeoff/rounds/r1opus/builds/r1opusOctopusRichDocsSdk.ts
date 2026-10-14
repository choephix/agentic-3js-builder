import * as THREE from "three";
import {
  createBuilder,
  catmull,
  spiral,
  frame,
  offset,
  rng,
  mottle,
  spots,
  countershade,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Grumpy Reef Octopus",
  description:
    "A curious coral-and-rust reef octopus with a bulbous mottled mantle, golden bar-pupil eyes under a grumpy brow, eight curling arms lined with cream suckers, and one arm proudly holding up an old brass shipwreck key.",
};

export default function build() {
  const b = createBuilder({ name: "reefOctopus" });

  // ---------- palette ----------
  const CORAL = "#e8674a";
  const RUST = "#a8402a";
  const DEEP = "#7a2a1a";
  const PALE = "#f6b796";
  const BELLY = "#f7cdb2";
  const CREAM = "#f7e6c4";
  const LID = "#b9472d";
  const BRASS = "#c9952e";
  const BRASS_DARK = "#8a5e1c";
  const PATINA = "#5fa58f";
  const BEAK = "#2a1a14";

  const skin = countershade(
    spots(mottle(CORAL, RUST, { size: 0.07, contrast: 0.8, seed: 3 }), PALE, { size: 0.035, amount: 0.3, seed: 5 }),
    BELLY,
    { level: -0.45 },
  );

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- textures ----------
  const suckerTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffffff"/><circle cx="16" cy="16" r="12" fill="#e4e4e4"/><circle cx="16" cy="16" r="9" fill="none" stroke="#a6a6a6" stroke-width="2.5"/><circle cx="16" cy="16" r="4.5" fill="#848484"/></svg>`,
    { size: 64 },
  );
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#a85a0c"/><circle cx="32" cy="32" r="27" fill="#f2b02a"/><circle cx="32" cy="32" r="19" fill="#ffd45e"/><circle cx="20" cy="44" r="2.5" fill="#d98a14"/><circle cx="45" cy="45" r="2" fill="#d98a14"/><circle cx="26" cy="15" r="2" fill="#d98a14"/><circle cx="50" cy="30" r="1.8" fill="#d98a14"/><rect x="10" y="26" width="44" height="12" rx="6" fill="#140c0a"/><circle cx="44" cy="17" r="5" fill="#fffbe8"/><circle cx="21" cy="47" r="2.2" fill="#fffbe8"/></svg>`,
    { size: 256 },
  );

  // ---------- skeleton: body ----------
  const bodyPts = [
    [0, 0.085, 0.01],
    [0, 0.15, 0.005],
    [0, 0.215, -0.03],
    [0, 0.29, -0.09],
    [0, 0.35, -0.165],
  ];
  const bodyPath = catmull(bodyPts);
  const root = b.joint("root", { at: [0, 0.085, 0.01], dir: [0, 1, 0], role: "spine" });
  const head = b.joint("head", { parent: root, at: [0, 0.15, 0.005], dir: [0, 1, -0.4], role: "head" });
  const mantleT = bodyPath.closestT([0, 0.215, -0.03]);
  const mantle = b.chain("mantle", bodyPath.slice(mantleT, 1), { parent: head, count: 3, role: "spine" });

  const body = b.sweep(bodyPath, [0.062, 0.085, 0.09, 0.112, 0.128, 0.118, 0.075], {
    bone: [root, head, mantle],
    color: skin,
    sides: 12,
    name: "mantle",
  });
  const bodySurf = b.surface(body);

  // beak (upper on root, lower on jaw)
  const jaw = b.joint("jaw", { parent: root, at: [0, 0.04, 0.02], dir: [0, -1, 0.25], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.012, 0.022, 6), BEAK, { bone: root, at: [0, 0.035, 0.03], dir: [0, -1, 0.35], flat: true });
  b.part(new THREE.ConeGeometry(0.009, 0.016, 6), BEAK, { bone: jaw, at: [0, 0.03, 0.012], dir: [0, -1, -0.2], flat: true });

  // ---------- eyes ----------
  const eyeCenters: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const hh = bodySurf.around([0, 0.17, 0]).at(s * 58, 22);
    const E = offset(hh.at, hh.n, 0.012);
    eyeCenters.push(E);
    const gaze = new THREE.Vector3().copy(hh.n).add(V(0, 0, 0.8)).normalize();

    // golden eyeball with bar pupil decal
    const eyeball = b.part(new THREE.SphereGeometry(0.027, 12, 8), "#e9a826", { bone: head, at: E, name: `eye${s > 0 ? "L" : "R"}` });
    b.decal(eyeball, eyeTex, {
      at: offset(E, gaze, 0.027),
      dir: gaze,
      size: [0.044, 0.044],
      mirror: s > 0,
      bone: head,
    });

    // heavy grumpy lid, slanting down toward the middle
    const up = V(0, 1, 0);
    const u = up.clone().sub(gaze.clone().multiplyScalar(up.dot(gaze))).normalize();
    const inward = V(-s, 0, 0);
    const inO = inward.clone().sub(gaze.clone().multiplyScalar(inward.dot(gaze))).normalize();
    const lidDir = u.clone().sub(gaze.clone().multiplyScalar(0.12)).add(inO.multiplyScalar(0.38)).normalize();
    b.part(new THREE.SphereGeometry(0.0305, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), LID, {
      bone: head,
      at: E,
      dir: lidDir,
      flat: true,
      name: `lid${s > 0 ? "L" : "R"}`,
    });

    // brow ridge: inner end low = grumpy
    const inner = E.clone().add(V(-s * 0.024, 0.027, 0.014));
    const outer = E.clone().add(V(s * 0.018, 0.038, -0.004));
    b.capsule(inner, outer, [0.0095, 0.008], { bone: head, color: DEEP, sides: 6 });
    // papilla "horns" over the eye
    b.spike(outer, [s * 0.35, 1, -0.25], 0.032, 0.0075, { bone: head, color: CORAL, sides: 6 });
    b.spike(E.clone().add(V(-s * 0.002, 0.036, 0.006)), [s * 0.1, 1, 0.1], 0.018, 0.005, { bone: head, color: PALE, sides: 5 });

    // pale bead ring under the eye
    b.ring(frame(E, gaze), { count: 7, radius: 0.034, fromDeg: 105, toDeg: 255 }, (item) => {
      const h = bodySurf.nearest(item.at);
      b.stick(new THREE.SphereGeometry(0.0045, 5, 4), PALE, h, { embed: 0.4, bone: head, flat: true });
    });
  }

  // siphon on the left flank
  const sHit = bodySurf.around([0, 0.19, -0.03]).at(105, -15);
  b.sprout("siphon", sHit, sHit.moved([0, 0.035, 0]), [0.017, 0.012], { count: 0, color: skin, caps: { end: "flat" }, sides: 8 });
  b.stick(new THREE.CylinderGeometry(0.0085, 0.0085, 0.004, 8), DEEP, sHit.moved([0, 0.035, 0]), { embed: 0.5 });

  // bumps over the mantle
  const R = rng(21);
  const bumpCols = [RUST, PALE, CORAL, DEEP];
  for (const h of bodySurf.scatter(75, {
    rng: rng(7),
    minDist: 0.022,
    filter: (h) => h.n.y > -0.25 && eyeCenters.every((e) => h.at.distanceTo(e) > 0.055) && h.at.distanceTo(sHit.at) > 0.03,
  })) {
    const r = 0.005 + R() * 0.004;
    b.stick(new THREE.IcosahedronGeometry(r, 0), bumpCols[Math.floor(R() * bumpCols.length)], h, { embed: 0.45, flat: true, group: "bumps" });
  }

  // ---------- arms ----------
  const armR = (t: number) => 0.03 * Math.pow(1 - t, 1.1) + 0.006;
  const azimuths = [22, 66, 110, 152, 196, 240, 284, 320]; // last = key arm (front right)
  const KEY = 7;
  const AR = rng(11);
  const sweeps: ReturnType<typeof b.sweep>[] = [];
  let keyChainTip: ReturnType<typeof b.chain> | null = null;
  let keyC = V(0, 0, 0);

  for (let k = 0; k < 8; k++) {
    const a = (azimuths[k] * Math.PI) / 180;
    const d = V(Math.sin(a), 0, Math.cos(a));
    const p = V(Math.cos(a), 0, -Math.sin(a));
    const pt = (r: number, y: number, side = 0) => [d.x * r + p.x * side, y, d.z * r + p.z * side];

    let path;
    if (k === KEY) {
      keyC = V(d.x * 0.22, 0.4, d.z * 0.22);
      const from = [d.x * 0.237, 0.4, d.z * 0.237];
      const approach = catmull([pt(0.04, 0.08), pt(0.14, 0.055), pt(0.24, 0.12), pt(0.27, 0.25), pt(0.255, 0.35), from]);
      const wrap = spiral(keyC, from, [0, 1, 0], { turns: 1.25, pitch: 0.022 });
      path = approach.concat(wrap);
    } else {
      const sway = (AR() - 0.5) * 0.12;
      const curl = 0.8 + AR() * 0.45;
      const L = 0.4 + AR() * 0.07;
      const lat = (k % 2 ? 1 : -1) * 0.035 * AR();
      path = catmull([
        pt(0.04, 0.078),
        pt(0.13, 0.036, sway * 0.2),
        pt(0.24, 0.026, sway * 0.6),
        pt(L * 0.82, 0.03, sway),
        pt(L, 0.07 * curl, sway * 1.1 + lat * 0.5),
        pt(L * 0.98, 0.12 * curl, sway * 0.9 + lat),
        pt(L * 0.88, 0.132 * curl, sway * 0.6 + lat * 1.2),
        pt(L * 0.84, 0.1 * curl, sway * 0.5 + lat),
      ]);
    }

    const chain = b.chain(`arm${k + 1}`, path, {
      parent: root,
      count: 7,
      role: "tentacle",
      names: (i: number) => `arm${k + 1}_${i + 1}`,
    });
    if (k === KEY) keyChainTip = chain;
    const sw = b.sweep(chain, armR, { color: skin, sides: 8, name: `arm${k + 1}` });
    sweeps.push(sw);

    // two staggered rows of cream suckers on the underside
    for (let j = 0; j < 13; j++) {
      for (const row of [0, 1]) {
        const t = 0.16 + (j + row * 0.5) * 0.064;
        if (t > 0.97) continue;
        const sp = sw.at(t, row ? 207 : 153);
        if (sp.at.y < 0.008) continue;
        const r = Math.max(0.0035, sp.radius * 0.42);
        b.stick(new THREE.CylinderGeometry(r * 0.8, r, r * 0.7, 8), CREAM, sp, {
          embed: 0.35,
          texture: suckerTex,
          group: "suckers",
        });
      }
    }
    // little bumps along the top of each arm
    for (let j = 0; j < 6; j++) {
      const t = 0.18 + j * 0.1;
      const sp = sw.at(t, j % 2 ? 28 : -28);
      b.stick(new THREE.IcosahedronGeometry(Math.max(0.003, sp.radius * 0.22), 0), j % 3 ? RUST : PALE, sp, {
        embed: 0.4,
        flat: true,
        group: "bumps",
      });
    }
  }

  // webbing between neighbouring arms
  for (let k = 0; k < 8; k++) {
    const a = sweeps[k];
    const c = sweeps[(k + 1) % 8];
    b.membrane(a.line(270).slice(0.05, 0.32), c.line(90).slice(0.05, 0.32), {
      color: skin,
      thickness: 0.005,
      scallop: 0.3,
      group: "web",
    });
  }

  // ---------- the brass key ----------
  const keyBone = keyChainTip!.joints[keyChainTip!.joints.length - 1];
  const kx = keyC.x;
  const kz = keyC.z;
  const kp = { bone: keyBone, group: "key" };
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.13, 6), BRASS, { ...kp, at: [kx, 0.425, kz], flat: true });
  b.part(new THREE.CylinderGeometry(0.0095, 0.0095, 0.006, 8), BRASS_DARK, { ...kp, at: [kx, 0.468, kz], flat: true });
  b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.005, 8), BRASS_DARK, { ...kp, at: [kx, 0.48, kz], flat: true });
  // ornate bow
  b.part(new THREE.TorusGeometry(0.022, 0.0055, 6, 14), BRASS, { ...kp, at: [kx, 0.512, kz], flat: true });
  b.part(new THREE.TorusGeometry(0.009, 0.0028, 5, 10), BRASS_DARK, { ...kp, at: [kx, 0.512, kz], flat: true });
  b.part(new THREE.SphereGeometry(0.0045, 6, 4), BRASS, { ...kp, at: [kx, 0.512, kz], flat: true });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), BRASS, { ...kp, at: [kx, 0.537, kz], flat: true });
  // bit and teeth
  b.part(new THREE.BoxGeometry(0.022, 0.02, 0.005), BRASS, { ...kp, at: [kx + 0.011, 0.372, kz], flat: true });
  b.part(new THREE.BoxGeometry(0.007, 0.006, 0.005), BRASS_DARK, { ...kp, at: [kx + 0.025, 0.366, kz], flat: true });
  b.part(new THREE.BoxGeometry(0.007, 0.006, 0.005), BRASS_DARK, { ...kp, at: [kx + 0.025, 0.379, kz], flat: true });
  b.part(new THREE.SphereGeometry(0.0062, 6, 4), BRASS, { ...kp, at: [kx, 0.36, kz], flat: true });
  // verdigris from the wreck
  for (const [dx, dy, r] of [
    [0.019, 0.522, 0.004],
    [-0.017, 0.5, 0.0035],
    [0.003, 0.452, 0.003],
    [0.018, 0.38, 0.003],
  ]) {
    b.part(new THREE.IcosahedronGeometry(r, 0), PATINA, { ...kp, at: [kx + dx, dy, kz + 0.004], flat: true });
  }

  return b.root;
}
