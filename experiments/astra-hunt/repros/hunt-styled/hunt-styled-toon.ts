import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { cel, furEdge, inkLines, animeEye, INK } from "../../../../kits/toon";
import { svg } from "../../../../src/texture";

const COAT = cel(furEdge("#ff6a2b", "#fff6df", { level: -0.1, teeth: 0.08, period: 0.08, ink: INK }));
const FACE = inkLines(cel("#ffb036", "#f06414"), { levels: [0.2], axis: [0, 0, 1] });
const EYE = animeEye({ iris: "#ff8a1c", size: 128 });
const BADGE = svg('<svg viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" fill="#ffffff"/><circle cx="16" cy="16" r="7" fill="#777777"/></svg>', { size: 32 });

export default function build() {
  const b = createBuilder({ name: "styled-toon", detail: 0.8 });
  const hips = b.joint("hips", { at: [0, 0.7, 0] });
  const head = b.joint("head", { parent: hips, at: [0, 1.2, 0.22], aim: [0, 1.2, 1] });
  const body = b.sweep([[0, 0.72, 0], [0, 1.0, 0.02], [0, 1.22, 0.2]], [0.23, 0.16], { color: COAT, caps: "round", skin: "smooth", bone: hips });
  const skull = b.part(new THREE.SphereGeometry(0.22, b.segments(12), b.segments(8)), FACE, { bone: head, at: [0, 1.2, 0.22] });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 1.2, 0.22]).at(s * 38, 2)!;
    b.decal(skin, EYE, { at: hit, size: [0.09, 0.12], mirror: s > 0 });
  }
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#aa1133", { texture: BADGE, at: [0, 0.8, 0.24], dir: [0, 0, 1], axis: "z" });
  b.cards([body.at(0.5, 0), body.at(0.7, 0), body.at(0.9, 0)], EYE, { size: [0.03, 0.08], color: "#ffffff", cross: true, lean: 0 });
  return b.root;
}
