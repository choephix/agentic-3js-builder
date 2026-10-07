import * as THREE from "three";
import { createBuilder, rng, polyline } from "../../../../src/index";

export const meta = {
  name: "Stag beetle on a mossy log",
  description:
    "A proud stag beetle with a glossy chestnut wing case, black head and thorax, branched reddish mandibles, elbowed antennae with feathery clubs and spiny legs gripping a moss-covered log, a dewdrop on one antler tine.",
};

const CHESTNUT = "#8c4a1f";
const BLACK = "#15110e";
const JAW = "#7a3b22";
const BARK = "#5a3d26";
const MOSS = "#5f8f3a";
const MOSS2 = "#3e6b2b";
const DROP = "#b5eaff";
const EYE = "#3a2a1a";
const TIP = "#2b1c12";

const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
const side = (p: number[], s: number) => [s * p[0], p[1], p[2]];

export default function build() {
  const b = createBuilder({ name: "stag beetle" });
  const R = rng(7);

  // Skeleton: body root, head joint hanging off it.
  const body = b.joint("body", { at: [0, 0.128, 0] });
  const head = b.joint("head", { at: [0, 0.13, 0.036], parent: body });

  // Mossy log lying on the floor along Z (top at y = 0.10).
  const logGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.42, 10);
  logGeo.rotateX(Math.PI / 2);
  b.part(logGeo, BARK, { at: [0, 0.05, 0], bone: body });

  // Moss clumps scattered over the top of the log.
  for (let i = 0; i < 26; i++) {
    const th = (R() - 0.5) * 2.6;
    const z = (R() - 0.5) * 0.36;
    const pos = [0.052 * Math.sin(th), 0.05 + 0.052 * Math.cos(th), z];
    b.part(sph(1, 6, 4), R() < 0.5 ? MOSS : MOSS2, {
      at: pos,
      scale: [0.011 + R() * 0.006, 0.005, 0.009 + R() * 0.006],
      bone: body,
    });
  }

  // Thorax shield and head.
  b.part(sph(1), BLACK, { at: [0, 0.126, 0.022], scale: [0.012, 0.0105, 0.012], bone: body });
  b.part(sph(1), BLACK, { at: [0, 0.13, 0.042], scale: [0.0135, 0.0115, 0.0115], bone: head });

  for (const s of [1, -1]) {
    // Chestnut wing case halves, glossy and domed.
    b.part(sph(1, 10, 8), CHESTNUT, {
      at: [s * 0.0055, 0.13, -0.012],
      scale: [0.0115, 0.0105, 0.031],
      bone: body,
    });
    // Puncture pits on the wing case.
    b.part(sph(1, 5, 4), BLACK, {
      at: [s * 0.0085, 0.136, -0.02],
      scale: [0.0015, 0.0005, 0.0015],
      bone: body,
    });
    // Eyes.
    b.part(sph(1, 6, 4), EYE, { at: [s * 0.0105, 0.134, 0.05], scale: [0.0028, 0.0028, 0.0028], bone: head });

    // Branched mandibles: main jaw plus two tines.
    const M = [
      [0.006, 0.128, 0.046],
      [0.015, 0.131, 0.061],
      [0.022, 0.129, 0.078],
      [0.017, 0.125, 0.095],
    ].map((p) => side(p, s));
    const jaw = b.chain(s > 0 ? "mandibleL" : "mandibleR", M);
    b.sweep(jaw, 0.0032, { color: JAW });

    const tine1Tip = side([0.024, 0.142, 0.06], s);
    const tine2Tip = side([0.03, 0.134, 0.082], s);
    b.sweep(polyline([M[1], tine1Tip]), 0.0017, { color: JAW });
    b.sweep(polyline([M[2], tine2Tip]), 0.0017, { color: JAW });

    // Dewdrop clinging to the tip of the left antler tine.
    if (s > 0) {
      b.part(sph(1, 8, 6), DROP, {
        at: tine1Tip,
        scale: [0.0032, 0.0038, 0.0032],
        bone: head,
      });
    }

    // Elbowed antenna with a feathery club.
    const A = [
      [0.005, 0.138, 0.05],
      [0.011, 0.15, 0.058],
      [0.013, 0.158, 0.07],
      [0.012, 0.157, 0.088],
    ].map((p) => side(p, s));
    const ant = b.chain(s > 0 ? "antennaL" : "antennaR", A);
    b.sweep(ant, 0.0012, { color: BLACK });

    const club = polyline(
      [
        [0.012, 0.157, 0.088],
        [0.009, 0.152, 0.104],
      ].map((p) => side(p, s)),
    );
    b.along(club, 6, (at) => {
      b.part(sph(1, 6, 4), TIP, { frame: at, scale: [0.0055, 0.0016, 0.0028] });
    });

    // Three pairs of spiny legs gripping the bark.
    const legs = [
      { zh: 0.026, kz: 0.02, zf: 0.03 },
      { zh: 0.006, kz: 0.0, zf: 0.004 },
      { zh: -0.016, kz: -0.024, zf: -0.028 },
    ];
    legs.forEach((L, i) => {
      const pts = [
        [0.01, 0.124, L.zh],
        [0.042, 0.128, L.kz],
        [0.04, 0.1, (L.kz + L.zf) / 2],
        [0.03, 0.091, L.zf],
      ].map((p) => side(p, s));
      const leg = b.chain(`leg${i}${s > 0 ? "L" : "R"}`, pts);
      b.sweep(leg, 0.0028, { color: BLACK });

      b.along(leg, 3, (at) => {
        b.part(new THREE.ConeGeometry(0.0008, 0.004, 4), BLACK, { frame: at });
      });
    });
  }

  return b.root;
}
