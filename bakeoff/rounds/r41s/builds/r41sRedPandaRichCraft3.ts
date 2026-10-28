import * as THREE from "three";
import { createBuilder, catmull, limb, rng, paint, noise, mix } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Red panda on mossy stone",
  description: "Cel-shaded, Genshin-style red panda standing on a mossy stone with its ringed tail raised for balance.",
};

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  const RUST = cel("#d9602a");
  const RUSTD = cel("#a8431c");
  const DARK = cel("#3a2018");
  const CREAM = cel("#fff0d8", "#e8c9a8");
  const NOSE = "#1c1014";
  const coat = cel(furEdge("#d9602a", "#4a261c", { level: -0.15, teeth: 0.22, period: 0.03, ink: INK }));
  const tailP = paint((_p, _n, s) => (Math.floor(s[0] * 11) % 2 ? RUSTD : RUST));

  // Stone first, simple: a faceted slab with a moss cap.
  const STONE = paint((p, n) => {
    const moss = n.y > 0.5 || (p.y > 0.12 && noise(p, 0.12, 3) > 0.55);
    const rock = mix("#8a8f9a", "#5f6574", noise(p, 0.1, 1));
    return moss ? mix("#5f9a3a", "#8cc24a", noise(p, 0.07, 2)) : rock;
  });

  const hips = b.joint("hips", { at: [0, 0.44, -0.16], role: "spine" });
  b.part(new THREE.CylinderGeometry(0.3, 0.36, 0.26, 9), STONE, { bone: hips, at: [0, 0.13, 0], flat: true });
  const r = rng(5);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r() * 0.3;
    const d = 0.25 + r() * 0.07;
    const k = 0.03 + r() * 0.03;
    b.part(new THREE.IcosahedronGeometry(1, 0), r() > 0.5 ? "#6fae3e" : "#4f8a34", {
      bone: hips,
      at: [Math.cos(a) * d, 0.265, Math.sin(a) * d],
      scale: [k * 1.4, k * 0.6, k * 1.4],
      flat: true,
    });
  }

  // Spine and body
  const spine = b.chain("spine", catmull([[0, 0.44, -0.16], [0, 0.46, 0.02], [0, 0.47, 0.2]]), {
    parent: hips,
    count: 3,
    role: "spine",
  });
  const chest = spine.joints[spine.joints.length - 1];
  b.sweep(spine, (t) => [0.085 + 0.02 * Math.sin(t * 3), 0.082 + 0.012 * Math.sin(t * 3)], { color: coat, bone: spine });

  // Head
  const headC: [number, number, number] = [0, 0.52, 0.31];
  const head = b.joint("head", { parent: chest, at: [0, 0.5, 0.25], dir: [0, 0.15, 1], role: "head" });
  const skull = b.part(new THREE.IcosahedronGeometry(1, 1), RUST, { bone: head, at: headC, scale: [0.088, 0.072, 0.078] });
  b.part(new THREE.SphereGeometry(1, 8, 6), RUST, { bone: head, at: [0, 0.49, 0.245], scale: [0.095, 0.08, 0.06] }); // neck ruff
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [0, 0.5, 0.385], scale: [0.04, 0.03, 0.04] }); // muzzle
  b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, { bone: head, at: [0, 0.512, 0.423], scale: [0.016, 0.011, 0.012] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.482, 0.33], aim: [0, 0.47, 0.4], role: "jaw" });
  b.part(new THREE.SphereGeometry(1, 8, 5), CREAM, { bone: jaw, at: [0, 0.472, 0.372], scale: [0.03, 0.014, 0.04] });

  for (const s of [1, -1]) {
    // cheek ruffs (big and fluffy, cream)
    b.part(new THREE.IcosahedronGeometry(1, 0), CREAM, { bone: head, at: [s * 0.078, 0.495, 0.315], scale: [0.03, 0.04, 0.045], flat: true });
    b.part(new THREE.IcosahedronGeometry(1, 0), CREAM, { bone: head, at: [s * 0.07, 0.47, 0.34], scale: [0.025, 0.025, 0.03], flat: true });
    // round ears with cream rims
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST, { bone: head, at: [s * 0.062, 0.59, 0.285], scale: [0.034, 0.034, 0.016] });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, { bone: head, at: [s * 0.062, 0.588, 0.296], scale: [0.026, 0.026, 0.01] });
    // brow spots
    b.part(new THREE.SphereGeometry(1, 6, 4), CREAM, { bone: head, at: [s * 0.04, 0.567, 0.375], scale: [0.012, 0.008, 0.008] });
  }
  const EYE = animeEye({ iris: "#e8a31c", blush: false, brow: false, size: 256 });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(headC).at(s * 36, 6);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.038, 0.052], mirror: s > 0, bone: head });
  }

  // Legs
  const footY = 0.288;
  const legs: [string, number, number, number, number, number][] = [
    ["H", -0.14, -0.2, 1, 0.4, parseInt("0")],
    ["F", 0.18, 0.2, -1, 0.4, 0],
  ];
  for (const [tag, hz, fz, bend] of legs.map((l) => [l[0], l[1], l[2], l[3]] as [string, number, number, number])) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const pts = limb([s * 0.07, 0.4, hz], [s * 0.08, footY, fz], [0.09, 0.085], [[0, 0, bend]]);
      const leg = b.chain(`leg${tag}${side}`, pts, {
        parent: tag === "H" ? hips : chest,
        names: [`hip${tag}${side}`, `knee${tag}${side}`, `foot${tag}${side}`],
        role: "leg",
      });
      b.sweep(leg, [0.04, 0.03], { color: DARK, bone: leg });
      b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
        at: [s * 0.08, 0.282, fz + 0.012],
        scale: [0.034, 0.024, 0.045],
      });
      for (const k of [-1, 0, 1])
        b.part(new THREE.SphereGeometry(1, 5, 4), "#e9dccb", {
          bone: leg.tip ?? leg.joints[leg.joints.length - 1],
          at: [s * 0.08 + k * 0.014, 0.275, fz + 0.05],
          scale: [0.007, 0.006, 0.01],
        });
    }
  }

  // Ringed bushy tail, raised for balance
  const tail = b.chain(
    "tail",
    catmull([[0, 0.45, -0.22], [0, 0.46, -0.4], [0, 0.54, -0.6], [0, 0.68, -0.74], [0, 0.82, -0.76]]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.05, 0.07, 0.078, 0.065, 0.035], { color: tailP, bone: tail });

  return b.root;
}
