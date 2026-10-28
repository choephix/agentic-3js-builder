import * as THREE from "three";
import { createBuilder, rng, noise, paint, polyline, catmull, limb, offset } from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red panda on a mossy stone",
  description: "A cel-shaded, Genshin-style red panda with a ringed tail and a bell collar, standing on a mossy stone.",
};

const ST = 0.16; // stone top height
const RUST = cel("#e0652b");
const RUSTD = cel("#a8401c");
const DARK = cel("#3a2118", "#24130e");
const BELLY = cel("#4d2c20");
const CREAM = cel("#fff1d6", "#f3cfa4");
const GOLD = cel("#f2c14e", "#c98a2a");
const RIBBON = cel("#c8323c");
const MOSSD = cel("#3f7a38");
const NOSE = cel("#241418", INK);
const MOSS = "#6fae48";
const STONE = "#8f9aa6";
const STONED = "#5d6877";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda" });
  const sph = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.36, -0.12], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, -0.12],
      [0, 0.37, 0.0],
      [0, 0.39, 0.14],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2"] },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.4, 0.14],
      [0, 0.45, 0.22],
    ]),
    { parent: chest, role: "neck", names: ["neck"] },
  );
  const HC: [number, number, number] = [0, 0.465, 0.29];
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.45, 0.22], dir: [0, 0.05, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.428, 0.27], aim: [0, 0.428, 0.34], role: "jaw" });

  // ---------- stone ----------
  const stoneP = cel(
    paint((p, n) =>
      n.y > 0.55 && noise(p, 0.16, 3) > 0.32 ? MOSS : noise(p, 0.1, 5) > 0.5 ? STONE : STONED,
    ),
  );
  const stone = b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.37, 0.05],
      [0.34, 0.12],
      [0.27, ST],
      [0, ST],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 9, color: stoneP, bone: hips },
  );
  const stoneSkin = b.surface(stone);
  for (const h of stoneSkin.scatter(26, {
    rng: rng(5),
    minDist: 0.06,
    filter: (h) => h.n.y > 0.45 && !(Math.abs(h.at.x) < 0.14 && Math.abs(h.at.z) < 0.3),
  }))
    b.stick(new THREE.ConeGeometry(0.018, 0.05, 5), h.at.y > 0.1 ? MOSSD : MOSSD, h, { embed: 0.3, bone: hips });

  // ---------- body ----------
  const coat = cel(
    paint((p, n) => (n.y > -0.15 ? (noise(p, 0.05, 2) > 0.62 ? "#ee7a38" : "#e0652b") : "#4d2c20")),
  );
  b.sweep(spine, [0.085, 0.1, 0.095], { color: coat });
  const neckS = b.sweep(neck, 0.065, { color: coat });

  // collar
  const loop = b.surface(neckS).loop(neck.at(0.5), { lift: 0.006 });
  b.sweep(loop, 0.011, { color: RIBBON, bone: neck.joints[0] });
  b.stick(sph(8, 6), GOLD, neckS.at(0.5, 180), { embed: 0.3, scale: [0.02, 0.02, 0.02] });
  b.stick(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), NOSE, neckS.at(0.5, 180), { embed: -0.8, scale: [1, 1, 1] });

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.37, -0.16],
      [0, 0.36, -0.35],
      [0, 0.39, -0.55],
      [0, 0.5, -0.72],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  const rings = cel(
    paint((p, n) => ((Math.floor((p.z + 5) / 0.055) % 2) ? "#e0652b" : "#9a3a1a")),
  );
  b.sweep(tail, [0.07, 0.065, 0.055, 0.032], {
    color: rings,
    bands: [
      [0.9, rings],
      [1, CREAM],
    ],
  });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb([s * 0.075, 0.33, 0.1], [s * 0.085, 0.182, 0.12], [0.09, 0.09], [[0, 0, -1]]);
    const hind = limb([s * 0.075, 0.33, -0.13], [s * 0.085, 0.182, -0.15], [0.09, 0.09], [[0, 0, 1]]);
    const legs: [string, typeof front, any, number][] = [
      ["F", front, chest, 0.04],
      ["H", hind, spine.joints[0], 0.05],
    ];
    for (const [tag, pts, parent, r] of legs) {
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent,
        role: "leg",
        names: [`${tag === "F" ? "shoulder" : "hip"}${side}`, `${tag === "F" ? "elbow" : "knee"}${side}`, `paw${tag}${side}`],
      });
      b.sweep(leg, [r, r * 0.65], { color: DARK });
      const foot = pts[2];
      b.part(sph(8, 6), DARK, {
        bone: leg.tip!,
        at: [foot.x, ST + 0.022, foot.z + 0.012],
        scale: [0.034, 0.024, 0.044],
      });
      for (let i = -1; i <= 1; i++)
        b.part(sph(6, 4), CREAM, {
          bone: leg.tip!,
          at: [foot.x + i * 0.014, ST + 0.012, foot.z + 0.05],
          scale: [0.007, 0.006, 0.008],
        });
    }
  }

  // ---------- head ----------
  const skull = b.part(sph(12, 8), RUST, { bone: head, at: HC, scale: [0.085, 0.072, 0.078] });
  b.part(sph(8, 6), CREAM, { bone: head, at: [0, HC[1] - 0.022, HC[2] + 0.068], scale: [0.042, 0.032, 0.04] });
  b.part(sph(8, 6), NOSE, { bone: head, at: [0, HC[1] - 0.008, HC[2] + 0.11], scale: [0.016, 0.012, 0.012] });
  b.part(sph(8, 6), CREAM, { bone: jaw, at: [0, HC[1] - 0.052, HC[2] + 0.06], scale: [0.03, 0.014, 0.038] });
  b.part(sph(6, 4), cel("#7a2a2e"), { bone: jaw, at: [0, HC[1] - 0.042, HC[2] + 0.062], scale: [0.022, 0.006, 0.03] });

  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#ffb43a", blush: "#ff9a8a" });
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 36, 4);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0, bone: head });
    // brow spot
    const brow = skin.around(HC).at(s * 28, 40);
    if (brow) b.stick(sph(6, 4), CREAM, brow, { embed: 0.3, scale: [0.014, 0.01, 0.014], bone: head });
    // tear stripe
    const tear = skin.drape(
      polyline([
        [s * 0.052, HC[1] - 0.03, HC[2] + 0.055],
        [s * 0.045, HC[1] - 0.045, HC[2] + 0.07],
        [s * 0.036, HC[1] - 0.052, HC[2] + 0.085],
      ]),
      { lift: 0.003 },
    );
    b.sweep(tear, [0.005, 0.003], { color: RUSTD, bone: head });
    // ears
    const ed = new THREE.Vector3(s * 0.45, 0.6, 0.15).normalize();
    const eat = [s * 0.06, HC[1] + 0.06, HC[2] - 0.02] as [number, number, number];
    b.part(sph(8, 6), RUSTD, { bone: head, at: eat, dir: ed.toArray(), axis: "z", scale: [0.042, 0.046, 0.02] });
    const inner = offset(eat, [s * 0.1, 0.2, 0.97], 0.012);
    b.part(sph(8, 6), CREAM, { bone: head, at: inner, dir: ed.toArray(), axis: "z", scale: [0.03, 0.034, 0.012] });
    // cheek ruffs
    for (let i = 0; i < 4; i++)
      b.spike(
        [s * 0.07, HC[1] - 0.015 - 0.012 * i, HC[2] + 0.005 + 0.012 * i],
        [s * 1, -0.35 - 0.12 * i, 0.15 + 0.08 * i],
        0.05 - 0.004 * i,
        0.02,
        { color: CREAM, bone: head, caps: { end: "point" } },
      );
  }
  // forehead tuft
  b.spike([0, HC[1] + 0.06, HC[2] + 0.01], [0, 1, 0.5], 0.035, 0.014, { color: RUSTD, bone: head });

  return b.root;
}
