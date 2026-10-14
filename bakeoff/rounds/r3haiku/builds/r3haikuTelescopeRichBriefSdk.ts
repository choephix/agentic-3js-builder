import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass explorer's telescope with leather wraps, engraved rings, a finder scope and focusing knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

type V = [number, number, number];

const BRASS = "#c9a24a";
const BRASS_DARK = "#7d5f24";
const LEATHER = "#5b3a22";
const WOOD = "#4a2315";
const RUBBER = "#1d1d1d";
const GLASS = "#2b4a63";
const PAPER = "#e6d6a4";
const RED = "#8b2222";

// Tube geometry: centre C, tilted 35 degrees up from horizontal, pointing forward (+Z).
const TILT = (35 * Math.PI) / 180;
const C: V = [0, 1.25, 0];
const D: V = [0, Math.sin(TILT), Math.cos(TILT)]; // along the tube, towards the objective
const U: V = [0, Math.cos(TILT), -Math.sin(TILT)]; // perpendicular, "up" from the tube

// Point on the tube axis at distance t, offset o along U, and s along X (left).
const P = (t: number, o = 0, s = 0): V => [
  s,
  C[1] + D[1] * t + U[1] * o,
  C[2] + D[2] * t + U[2] * o,
];

export default function build() {
  const b = createBuilder({ name: "telescope" });

  // ---------- Main brass tube ----------
  b.sweep([P(-0.38), P(0.38)], 0.032, { color: BRASS });

  // Leather-wrapped grip sections
  b.sweep([P(-0.22), P(-0.12)], 0.036, { color: LEATHER });
  b.sweep([P(0.05), P(0.15)], 0.036, { color: LEATHER });

  // Engraved rings: thin raised bands in darker brass
  for (const t of [-0.3, -0.05, 0.25, 0.32]) {
    b.sweep([P(t - 0.006), P(t + 0.006)], 0.0335, { color: BRASS_DARK });
  }

  // Objective cell and lens at the front
  b.sweep([P(0.38), P(0.41)], 0.04, { color: BRASS });
  b.sweep([P(0.405), P(0.412)], 0.034, { color: GLASS });

  // Eyepiece barrel and rubber eyecup at the rear
  b.sweep([P(-0.38), P(-0.44)], 0.02, { color: BRASS });
  b.sweep([P(-0.44), P(-0.5)], 0.026, { color: RUBBER });

  // ---------- Finder scope ----------
  const F = (t: number) => P(t, 0.075);
  b.sweep([F(-0.16), F(0.2)], 0.02, { color: BRASS });
  b.sweep([F(-0.16), F(-0.14)], 0.024, { color: RUBBER }); // finder eyepiece cup
  b.sweep([F(0.2), F(0.215)], 0.024, { color: BRASS_DARK }); // finder objective ring
  // Brackets joining the finder to the tube
  for (const t of [-0.12, 0.14]) {
    b.sweep([P(t, 0), P(t, 0.075)], 0.008, { color: BRASS });
  }

  // ---------- Focusing knobs (on the side, axis along X) ----------
  const knobFine = new THREE.CylinderGeometry(0.028, 0.028, 0.022, 18);
  knobFine.rotateZ(Math.PI / 2);
  b.part(knobFine, WOOD, { at: P(-0.25, 0, 0.045) });
  b.part(knobFine.clone(), WOOD, { at: P(-0.25, 0, -0.045) });

  const knobCoarse = new THREE.CylinderGeometry(0.036, 0.036, 0.03, 20);
  knobCoarse.rotateZ(Math.PI / 2);
  b.part(knobCoarse, BRASS, { at: P(0.02, 0, 0.055) });
  b.part(knobCoarse.clone(), BRASS, { at: P(0.02, 0, -0.055) });

  // ---------- Cradle and head ----------
  // Trunnion axle across the tube centre
  b.sweep([P(0, 0, -0.09), P(0, 0, 0.09)], 0.012, { color: BRASS });
  // Cradle block below the tube
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.09), BRASS, { at: P(0, -0.06) });

  // Brass hub where the legs meet
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 14), BRASS, {
    at: [0, 1.12, 0],
  });

  // Central column down to the tray
  b.sweep([[0, 1.1, 0], [0, 0.46, 0]], 0.012, { color: BRASS_DARK });

  // ---------- Tripod legs ----------
  const top: V = [0, 1.15, 0];
  const legAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const feet: V[] = legAngles.map((th) => [
    Math.sin(th) * 0.58,
    0,
    Math.cos(th) * 0.58,
  ]);
  const along = (s: number, f: V): V => [
    top[0] + (f[0] - top[0]) * s,
    top[1] + (f[1] - top[1]) * s,
    top[2] + (f[2] - top[2]) * s,
  ];

  for (const f of feet) {
    b.sweep([top, f], 0.024, { color: WOOD });
    // Brass ferrule near the top of each leg
    b.sweep([along(0.12, f), along(0.2, f)], 0.03, { color: BRASS });
    // Rubber foot, sunk slightly into the ground
    b.part(new THREE.SphereGeometry(0.03, 10, 8), RUBBER, {
      at: [f[0], 0.02, f[2]],
    });
  }

  // Wooden spreader joining the legs at mid-height
  const spread = feet.map((f) => along(0.5, f));
  for (let i = 0; i < spread.length; i++) {
    b.sweep([spread[i], spread[(i + 1) % spread.length]], 0.01, {
      color: WOOD,
    });
  }

  // ---------- Tray with rolled star chart ----------
  const trayY = 0.46;
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.16), WOOD, { at: [0, trayY, 0] });
  // Raised rim
  const rimY = trayY + 0.015;
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.008), WOOD, { at: [0, rimY, 0.08] });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.008), WOOD, { at: [0, rimY, -0.08] });
  b.part(new THREE.BoxGeometry(0.008, 0.03, 0.16), WOOD, { at: [0.1, rimY, 0] });
  b.part(new THREE.BoxGeometry(0.008, 0.03, 0.16), WOOD, { at: [-0.1, rimY, 0] });

  const rollY = trayY + 0.006 + 0.022;
  b.sweep([[-0.07, rollY, 0], [0.07, rollY, 0]], 0.022, { color: PAPER });
  const band = new THREE.CylinderGeometry(0.0235, 0.0235, 0.012, 18);
  band.rotateZ(Math.PI / 2);
  b.part(band, RED, { at: [0.02, rollY, 0] });

  return b.root;
}
