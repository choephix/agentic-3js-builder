import * as THREE from "three";
import { createBuilder, svg, paint, mix, smoothstep, noise } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description: "A 1980s upright arcade cabinet with neon synthwave art, glowing screen, joystick and buttons.",
};

export default function build() {
  const b = createBuilder({ name: "arcade" });
  const base = b.joint("base", { at: [0, 0.05, 0] });

  const BODY = paint((p, n) => {
    const t = smoothstep(0, 1.8, p.y);
    const c = mix("#1a0b3a", "#3a1066", t);
    const g = noise(p, 0.05, 3) * 0.06;
    return mix(c, "#000000", g + (n.y < -0.5 ? 0.3 : 0));
  });
  const PINK = "#ff2bd6";
  const CYAN = "#19f0ff";
  const DARK = "#0a0414";
  const YEL = "#ffd23f";

  // side panels (left/right), profile extruded
  const prof: [number, number][] = [
    [-0.34, 0], [0.34, 0], [0.34, 0.85], [0.3, 0.9], [0.3, 1.25], [0.4, 1.3],
    [0.4, 1.78], [0.3, 1.82], [-0.3, 1.82], [-0.34, 1.7],
  ];
  for (const s of [1, -1])
    b.extrude(prof, { at: [s * 0.3, 0, 0], x: [0, 0, 1], thickness: 0.04, color: BODY, bone: base });

  // body fills
  b.part(new THREE.BoxGeometry(0.56, 0.85, 0.62), BODY, { bone: base, at: [0, 0.43, 0.0] });
  b.part(new THREE.BoxGeometry(0.56, 0.5, 0.5), DARK, { bone: base, at: [0, 1.1, -0.12] });
  b.part(new THREE.BoxGeometry(0.56, 0.55, 0.3), BODY, { bone: base, at: [0, 1.52, -0.2] });
  // control panel slanted
  b.part(new THREE.BoxGeometry(0.64, 0.05, 0.3), "#2a0f55", { bone: base, at: [0, 0.9, 0.38], rotation: [-12, 0, 0] });
  // neon edge trim
  for (const s of [1, -1]) {
    glow(b.rod([s * 0.34, 0.02, 0.34], [s * 0.34, 0.85, 0.34], 0.012, PINK, { bone: base }));
    glow(b.rod([s * 0.4, 1.3, 0.2], [s * 0.4, 1.78, 0.2], 0.012, CYAN, { bone: base }));
  }
  glow(b.rod([-0.34, 0.86, 0.36], [0.34, 0.86, 0.36], 0.014, CYAN, { bone: base }));

  // screen bezel and screen
  b.part(new THREE.BoxGeometry(0.5, 0.42, 0.04), "#050208", { bone: base, at: [0, 1.15, 0.14], rotation: [-8, 0, 0] });
  const SCREEN = svg(
    `<svg viewBox="0 0 100 80"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b0057"/><stop offset="0.55" stop-color="#ff2bd6"/><stop offset="0.56" stop-color="#12002e"/><stop offset="1" stop-color="#12002e"/></linearGradient></defs>
    <rect width="100" height="80" fill="url(#s)"/><circle cx="50" cy="32" r="16" fill="#ffd23f"/>
    <rect x="0" y="30" width="100" height="3" fill="#ff2bd6" opacity="0.5"/>
    <g stroke="#19f0ff" stroke-width="0.8"><path d="M0 44H100M0 52H100M0 62H100M0 74H100"/><path d="M50 44L-20 80M50 44L10 80M50 44L35 80M50 44L50 80M50 44L65 80M50 44L90 80M50 44L120 80"/></g>
    <path d="M0 44L12 36L24 44L38 30L50 44" fill="#12002e"/><path d="M50 44L64 32L78 44L90 36L100 44Z" fill="#12002e"/>
    <text x="50" y="12" font-size="9" fill="#19f0ff" text-anchor="middle" font-family="monospace" font-weight="bold">HI-SCORE 99999</text></svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.42, 0.34), "#ffffff", {
      bone: base, at: [0, 1.15, 0.165], dir: [0, 0.14, 1], axis: "z", texture: SCREEN,
    }),
    1.1,
  );

  // marquee
  const MARQ = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#14002e"/><rect x="2" y="2" width="116" height="36" fill="none" stroke="#ff2bd6" stroke-width="2"/>
    <text x="60" y="26" font-size="17" fill="#19f0ff" stroke="#ff2bd6" stroke-width="1" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-style="italic">NEON RIDER</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(0.62, 0.22, 0.3), DARK, { bone: base, at: [0, 1.7, 0.0] });
  glow(b.part(new THREE.PlaneGeometry(0.56, 0.19), "#ffffff", { bone: base, at: [0, 1.7, 0.155], dir: [0, 0, 1], axis: "z", texture: MARQ }), 1.2);

  // side art stripes
  const STRIPE = svg(
    `<svg viewBox="0 0 60 120"><rect width="60" height="120" fill="none"/><path d="M0 100L60 60V75L0 115Z" fill="#ff2bd6"/><path d="M0 85L60 45V55L0 95Z" fill="#19f0ff"/><circle cx="30" cy="25" r="14" fill="#ffd23f"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.5, 1.0), "#ffffff", {
      bone: base, at: [s * 0.343, 0.55, 0.0], dir: [s, 0, 0], axis: "z", texture: STRIPE,
    }), 0.8);

  // joystick
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 10), "#111", { bone: base, at: [-0.15, 0.93, 0.38] });
  b.rod([-0.15, 0.93, 0.38], [-0.15, 1.04, 0.4], 0.009, "#ccc", { bone: base });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), "#ff1e3c", { bone: base, at: [-0.15, 1.06, 0.405] });
  // buttons
  [PINK, CYAN, YEL, "#7dff4a"].forEach((c, i) => {
    glow(b.part(new THREE.CylinderGeometry(0.025, 0.027, 0.02, 10), c, {
      bone: base, at: [0.04 + (i % 2) * 0.07 + (i > 1 ? 0.035 : 0), 0.93 - 0.01, 0.35 + Math.floor(i / 2) * 0.07],
    }), 0.8);
  });
  // coin door
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.02), "#2b2b3a", { bone: base, at: [0, 0.5, 0.315] });
  for (const s of [-1, 1]) glow(b.part(new THREE.BoxGeometry(0.03, 0.05, 0.01), s > 0 ? PINK : CYAN, { bone: base, at: [s * 0.05, 0.54, 0.328] }), 1.2);
  b.part(new THREE.BoxGeometry(0.08, 0.04, 0.01), DARK, { bone: base, at: [0, 0.44, 0.328] });
  // kick plate and feet
  glow(b.part(new THREE.BoxGeometry(0.58, 0.03, 0.02), CYAN, { bone: base, at: [0, 0.16, 0.315] }), 1);
  for (const x of [-0.28, 0.28]) b.part(new THREE.BoxGeometry(0.08, 0.05, 0.6), "#111", { bone: base, at: [x, 0.0, 0.0] });

  return b.root;
}
