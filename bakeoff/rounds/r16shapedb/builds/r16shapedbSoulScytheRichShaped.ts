import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import type { OutlinePoint } from "../../../../src/outline";
import { bezier, catmull, spiral } from "../../../../src/path";
import { cells, grain, mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A League of Legends-style reaper's scythe: a vertebra-ringed dragon-spine snath with a talon foot, a fanged dragon skull socket spitting soul-fire, a cracked ivory rib-blade with a glowing teal soul edge, runes, bone barbs and trapped souls, ribbons and a hanging soul lantern.",
  style: "League of Legends",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "soulScythe", detail: 1 });

  // ---------------------------------------------------------------------------------------------------------------
  // Palette and paints
  const TEAL = "#3df5df";
  const TEAL_HI = "#d6fff8";
  const TEAL_DEEP = "#0e8aa0";
  const DARK = "#150f2b";
  const TOOTH = "#fbf3de";
  const RIB = "#a58f6d";
  const CLOTH = "#2a8fa6";
  const IV_HI = "#f7edd2";
  const IV_LO = "#9d93bd";
  const STAIN = "#c9ae80";
  const CRACK = "#5f4c44";

  const boneColor = (p: THREE.Vector3, n: THREE.Vector3): Rgb => {
    const light = smoothstep(-0.7, 0.8, n.y * 0.8 + n.z * 0.3);
    let c = mix(IV_LO, IV_HI, light);
    c = mix(c, STAIN, 0.45 * smoothstep(0.45, 0.8, noise(p, 0.14, 4)));
    const cell = cells(p, 0.1, 6);
    const line = 1 - smoothstep(0.03, 0.08, cell.d2 - cell.d1);
    c = mix(c, CRACK, 0.55 * line * smoothstep(0.35, 0.6, noise(p, 0.2, 8)));
    return c;
  };
  const BONE = paint((p, n) => boneColor(p, n));
  const GOLD = metal("gilt", { tarnish: 0.2, size: 0.05 });
  const GOLD_D = metal("bronze", { tarnish: 0.3, size: 0.05 });
  const LEATHER = grain("#2b1a3d", "#573a6e", { size: 0.03, axis: "y", seed: 5 });

  // ---------------------------------------------------------------------------------------------------------------
  // Blade curves (outline coordinates: x along the blade, y up, origin at the blade root)
  const TOP = catmull([
    [-0.1, 0.03, 0],
    [0.0, 0.15, 0],
    [0.25, 0.235, 0],
    [0.55, 0.26, 0],
    [0.85, 0.19, 0],
    [1.08, 0.04, 0],
    [1.22, -0.16, 0],
    [1.29, -0.4, 0],
  ]);
  const INN = catmull([
    [-0.1, -0.04, 0],
    [0.12, -0.025, 0],
    [0.4, -0.025, 0],
    [0.7, -0.05, 0],
    [0.95, -0.13, 0],
    [1.13, -0.27, 0],
    [1.29, -0.4, 0],
  ]);
  const N = 40;
  const topS = Array.from({ length: N + 1 }, (_, i) => TOP.at(i / N));
  const innS = Array.from({ length: N + 1 }, (_, i) => INN.at(i / N));
  const yAt = (S: THREE.Vector3[], x: number) => {
    if (x <= S[0].x) return S[0].y;
    for (let i = 0; i < S.length - 1; i++) {
      if (x <= S[i + 1].x) {
        const t = (x - S[i].x) / Math.max(1e-6, S[i + 1].x - S[i].x);
        return S[i].y + (S[i + 1].y - S[i].y) * t;
      }
    }
    return S[S.length - 1].y;
  };
  const topY = (x: number) => yAt(topS, x);
  const innY = (x: number) => yAt(innS, x);

  const BX = 0;
  const BY = 1.8;
  const BZ = -0.13;
  const BT = 0.03; // blade thickness

  const BLADE = paint((p, n, s) => {
    let c = boneColor(p, n);
    const d = s[1] - innY(s[0]);
    c = mix(c, "#a9f3ea", 0.75 * (1 - smoothstep(0.03, 0.14, d)));
    c = mix(c, TEAL, 0.35 * (1 - smoothstep(0.0, 0.07, d)));
    if (Math.abs(n.z) < 0.5) c = mix(c, "#6a5f78", 0.55);
    return c;
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Textures
  const ruleSvg = () => {
    const X0 = -0.1;
    const Y1 = 0.3;
    const glyphs = [
      "M0 -1 L0 1 M0 -0.2 L0.7 -0.8",
      "M-0.6 -1 L0.6 0 L-0.6 1",
      "M-0.6 -1 L0.6 -1 L-0.6 1 L0.6 1",
      "M0 -1 L0 1 M-0.7 0 L0.7 0 M-0.5 -0.6 L0.5 -0.6",
      "M-0.6 1 L0 -1 L0.6 1 M-0.35 0.2 L0.35 0.2",
      "M-0.6 -0.8 L0.6 -0.8 L0.6 0.8 M0 -0.8 L0 0.8",
      "M0 -1 L0.7 0 L0 1 L-0.7 0 Z M0 -0.3 L0 0.3",
    ];
    let out = "";
    const guide = (off: number) => {
      const pts: string[] = [];
      for (let x = 0.2; x <= 1.1; x += 0.05) pts.push(`${((x - X0) * 1000).toFixed(0)} ${((Y1 - (innY(x) + off)) * 1000).toFixed(0)}`);
      return `<polyline points="${pts.join(" ")}" fill="none" stroke="#3df5df" stroke-width="5" stroke-linecap="round" opacity="0.9"/>`;
    };
    out += guide(0.045) + guide(0.115);
    let k = 0;
    for (let x = 0.25; x <= 1.03; x += 0.0625, k++) {
      const y = innY(x) + 0.08;
      const slope = (innY(x + 0.01) - innY(x - 0.01)) / 0.02;
      const ang = (-Math.atan(slope) * 180) / Math.PI;
      out += `<g transform="translate(${((x - X0) * 1000).toFixed(1)} ${((Y1 - y) * 1000).toFixed(1)}) rotate(${ang.toFixed(1)}) scale(15)"><path d="${glyphs[(k * 3) % glyphs.length]}" fill="none" stroke="#e7fffb" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
    // soul sparks flowing toward the tip
    for (let j = 0; j < 7; j++) {
      const x = 0.3 + j * 0.1;
      out += `<circle cx="${((x - X0) * 1000).toFixed(0)}" cy="${((Y1 - (innY(x) + 0.155 + (j % 2) * 0.012)) * 1000).toFixed(0)}" r="${4 + (j % 3)}" fill="#bffff6"/>`;
    }
    return `<svg viewBox="0 0 1500 800" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
  };
  const RUNES = svg(ruleSvg(), { size: 1500 });

  const FLAME = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1696b4"/><stop offset="0.5" stop-color="#3df5df"/><stop offset="1" stop-color="#b8fff4"/></linearGradient></defs>
      <path d="M32 126 C8 118 4 92 14 70 C18 60 12 48 20 34 C22 48 30 50 30 40 C30 26 34 14 40 2 C42 22 56 40 54 76 C58 100 50 120 32 126Z" fill="url(#f)" stroke="#0b5f78" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 118 C20 112 20 92 28 78 C30 90 36 90 38 78 C46 94 44 112 32 118Z" fill="#e9fffb"/>
    </svg>`,
    { size: 128 },
  );

  const GHOST = svg(
    `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9fffb"/><stop offset="1" stop-color="#5fe9dc"/></linearGradient></defs>
      <path d="M32 4 C14 4 8 20 8 38 L8 84 L16 74 L24 90 L32 74 L40 90 L48 74 L56 84 L56 38 C56 20 50 4 32 4Z" fill="url(#g)" stroke="#0e8aa0" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="22" cy="34" rx="5" ry="8" fill="#0b2a3a"/><ellipse cx="42" cy="34" rx="5" ry="8" fill="#0b2a3a"/>
      <ellipse cx="32" cy="56" rx="6" ry="9" fill="#0b2a3a"/>
    </svg>`,
    { size: 128 },
  );

  const EYE = svg(
    `<svg viewBox="0 0 100 56" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="e" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#6ff7e8"/><stop offset="1" stop-color="#14b3c4"/></radialGradient></defs>
      <path d="M2 30 Q50 -8 98 22 Q54 60 2 30Z" fill="#0b0818"/>
      <path d="M9 29 Q50 3 91 23 Q54 50 9 29Z" fill="url(#e)"/>
      <ellipse cx="52" cy="28" rx="5" ry="13" fill="#06121c"/>
      <ellipse cx="45" cy="21" rx="3" ry="4" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  const RIBBON = svg(
    `<svg viewBox="0 0 60 300" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#17104a"/><stop offset="0.5" stop-color="#2f2a82"/><stop offset="1" stop-color="#17104a"/></linearGradient></defs>
      <path d="M2 300 L58 300 L58 8 L30 42 L2 8Z" fill="url(#r)" stroke="#e9b94a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M12 292 L12 34 M48 292 L48 34" stroke="#e9b94a" stroke-width="2.5" fill="none"/>
      <path d="M30 120 L44 160 L30 200 L16 160Z" fill="#0e3550" stroke="#e9b94a" stroke-width="3"/>
      <path d="M30 138 L37 160 L30 182 L23 160Z" fill="#3df5df"/>
      <path d="M20 240 L40 240 M20 252 L40 252 M20 264 L40 264" stroke="#3df5df" stroke-width="3" stroke-linecap="round"/>
      <circle cx="30" cy="80" r="6" fill="#3df5df"/>
    </svg>`,
    { size: 300 },
  );

  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="#1c1433" stroke="#f0c05a" stroke-width="6"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#3df5df" stroke-width="2.5"/>
      <path d="M12 52 Q50 14 88 52 Q50 86 12 52Z" fill="#0e8aa0" stroke="#3df5df" stroke-width="3"/>
      <path d="M22 52 Q50 28 78 52 Q50 74 22 52Z" fill="#9ffcf0"/>
      <ellipse cx="50" cy="52" rx="7" ry="17" fill="#0b1226"/>
      <path d="M50 4 L50 14 M50 86 L50 96 M4 50 L14 50 M86 50 L96 50" stroke="#f0c05a" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const lanternPanels = () => {
    let out = "";
    for (let k = 0; k < 6; k++) {
      const cx = 100 * k + 50;
      out += `<path d="M${cx} 160 C${cx - 28} 150 ${cx - 30} 110 ${cx - 12} 84 C${cx - 8} 96 ${cx - 2} 96 ${cx} 78 C${cx + 4} 60 ${cx + 10} 52 ${cx + 14} 36 C${cx + 26} 66 ${cx + 38} 90 ${cx + 28} 120 C${cx + 22} 144 ${cx + 10} 156 ${cx} 160Z" fill="#fdfffe"/>`;
      out += `<path d="M${cx} 150 C${cx - 14} 140 ${cx - 10} 120 ${cx} 100 C${cx + 12} 120 ${cx + 14} 140 ${cx} 150Z" fill="#6ff7e8"/>`;
      out += `<path d="M${100 * k} 0 L${100 * k} 200" stroke="#0b6a80" stroke-width="7"/>`;
    }
    return `<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ff9ec"/><stop offset="0.5" stop-color="#3df5df"/><stop offset="1" stop-color="#18b6c9"/></linearGradient></defs>
      <rect width="600" height="200" fill="url(#l)"/>${out}</svg>`;
  };
  const LANTERN = svg(lanternPanels(), { size: 600 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton
  const S = 1.3; // skull scale
  const SY = 1.97; // skull centre height
  const H = (x: number, y: number, z: number): V => [x * S, SY + y * S, z * S];

  const snath = b.joint("snath", { at: [0, 0.95, 0], dir: [0, 1, 0] });
  const head = b.joint("head", { parent: snath, at: H(0, 0, 0), dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.07, 0), dir: [0, 0, 1], role: "jaw" });
  const blade = b.joint("blade", { parent: snath, at: [BX, BY, BZ], dir: [1, 0, 0] });
  const lantern = b.joint("lantern", { parent: snath, at: [-0.55, 2.07, BZ], dir: [0, -1, 0] });

  const torus = (at: V, dir: V | null, R: number, r: number, color: THREE.Color | string | typeof GOLD, bone: typeof snath, name: string, scale?: V, rot?: V) =>
    b.part(new THREE.TorusGeometry(R, r, 5, 12), color as string, {
      bone,
      at,
      ...(dir ? { dir, axis: "z" as const } : {}),
      ...(rot ? { rotation: rot } : {}),
      ...(scale ? { scale } : {}),
      flat: true,
      name,
      group: "fittings",
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Snath: glowing soul core wrapped in dragon vertebrae
  glow(b.sweep([[0, 0.2, 0], [0, 1.84, 0]], 0.022, { bone: snath, color: TEAL, caps: "flat", sides: 6, name: "soulCore", group: "snath" }), 1.3);

  const vertGeo = (hh: number) =>
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.0, -hh),
        new THREE.Vector2(0.032, -hh),
        new THREE.Vector2(0.034, -hh * 0.7),
        new THREE.Vector2(0.018, -hh * 0.25),
        new THREE.Vector2(0.018, hh * 0.25),
        new THREE.Vector2(0.034, hh * 0.7),
        new THREE.Vector2(0.032, hh),
        new THREE.Vector2(0.0, hh),
      ],
      8,
    );
  const vertYs: number[] = [0.32, 0.39, 0.46];
  for (let k = 0; k < 10; k++) vertYs.push(1.07 + k * 0.07);
  vertYs.forEach((y, i) => {
    const sc = 0.9 + 0.2 * (y / 1.8);
    b.part(vertGeo(0.028), BONE, { bone: snath, at: [0, y, 0], scale: [sc, 1, sc], flat: true, name: `vertebra${i}`, group: "snath" });
    b.spike([0, y, -0.03 * sc], [0, 0.5, -1], 0.065, 0.011, { bone: snath, color: BONE, sides: 4, name: `neuralSpine${i}`, group: "snath" });
    if (i % 2 === 0)
      for (const s of [1, -1])
        b.spike([s * 0.032 * sc, y, 0], [s, -0.2, 0], 0.055, 0.009, { bone: snath, color: BONE, sides: 4, name: `rib${i}`, group: "snath" });
  });

  // Leather grip, teal cord wrap, gold collars
  b.sweep([[0, 0.55, 0], [0, 1.0, 0]], 0.031, { bone: snath, color: LEATHER, caps: "flat", sides: 8, name: "gripSleeve", group: "grip" });
  b.sweep(spiral([0, 0.55, 0], [0.034, 0.55, 0], [0, 1, 0], { turns: 9, pitch: 0.05 }), 0.005, {
    bone: snath,
    color: CLOTH,
    sides: 4,
    name: "gripCord",
    group: "grip",
  });
  const collarProfile: [number, number][] = [
    [0, 0],
    [0.05, 0],
    [0.055, 0.012],
    [0.04, 0.04],
    [0.033, 0.05],
    [0, 0.05],
  ];
  b.lathe(collarProfile, { at: [0, 0.99, 0], bone: snath, color: GOLD, segments: 8, name: "collarUp", group: "grip" });
  b.lathe(collarProfile, { at: [0, 0.56, 0], axis: [0, -1, 0], bone: snath, color: GOLD, segments: 8, name: "collarDown", group: "grip" });
  for (const y of [0.57, 0.78, 0.98]) torus([0, y, 0], [0, 1, 0], 0.035, 0.008, GOLD, snath, "gripRing");
  for (const y of [0.67, 0.89]) glow(b.part(new THREE.OctahedronGeometry(0.016, 0), TEAL, { bone: snath, at: [0, y, 0.036], flat: true, name: "gripGem", group: "grip" }), 1.2);

  // Talon foot
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.048, 0.02],
      [0.04, 0.06],
      [0.034, 0.09],
      [0.034, 0.14],
      [0.042, 0.15],
      [0, 0.15],
    ],
    { at: [0, 0.14, 0], bone: snath, color: GOLD, segments: 8, name: "ferrule", group: "foot" },
  );
  b.spike([0, 0.14, 0], [0, -1, 0], 0.1, 0.028, { bone: snath, color: BONE, sides: 6, name: "footSpike", group: "foot" });
  for (const a of [90, 210, 330]) {
    const c = Math.cos((a * Math.PI) / 180);
    const z = Math.sin((a * Math.PI) / 180);
    const P = (r: number, y: number): V => [r * c, y, r * z];
    b.sweep(bezier(P(0.02, 0.22), P(0.1, 0.22), P(0.18, 0.15), P(0.18, 0.0)), [0.034, 0], {
      bone: snath,
      color: BONE,
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: "talon",
      group: "foot",
    });
    b.part(new THREE.SphereGeometry(0.036, 6, 4), GOLD, { bone: snath, at: P(0.075, 0.215), flat: true, name: "knuckle", group: "foot" });
    torus(P(0.17, 0.1), [0, 1, 0], 0.03, 0.007, GOLD, snath, "talonRing");
  }

  // Neck socket: gold collar with a crown of claws and the ribbon ring
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.072, 0.02],
      [0.056, 0.05],
      [0.046, 0.08],
      [0, 0.08],
    ],
    { at: [0, 1.76, 0], bone: snath, color: GOLD, segments: 8, name: "neckSocket", group: "socket" },
  );
  torus([0, 1.76, 0], [0, 1, 0], 0.064, 0.01, GOLD_D, snath, "ribbonRing");
  b.ring(frame([0, 1.83, 0], [0, 1, 0]), { count: 6, radius: 0.055, tilt: 55 }, (it) =>
    b.spike(it, it, 0.07, 0.013, { color: GOLD, sides: 5, name: "socketClaw", group: "socket" }),
  );
  b.sweep([[0, 1.8, -0.03], [0, 1.9, -0.045]], 0.04, { bone: head, color: BONE, sides: 6, name: "skullNeck", group: "skull" });

  // ---------------------------------------------------------------------------------------------------------------
  // Dragon skull
  const cranium = b.part(new THREE.SphereGeometry(1, 10, 7), BONE, {
    bone: head,
    at: H(0, 0, -0.02),
    scale: [0.085 * S, 0.078 * S, 0.1 * S],
    flat: true,
    name: "cranium",
    group: "skull",
  });

  const SN = [
    { z: 0.02, y: -0.015, w: 0.14, h: 0.11 },
    { z: 0.1, y: -0.025, w: 0.115, h: 0.085 },
    { z: 0.19, y: -0.032, w: 0.085, h: 0.062 },
    { z: 0.265, y: -0.036, w: 0.078, h: 0.055 },
  ];
  const JW = [
    { z: -0.01, y: -0.075, w: 0.12, h: 0.04 },
    { z: 0.08, y: -0.085, w: 0.095, h: 0.035 },
    { z: 0.17, y: -0.088, w: 0.07, h: 0.03 },
    { z: 0.24, y: -0.09, w: 0.055, h: 0.03 },
  ];
  type Stn = { z: number; y: number; w: number; h: number };
  const stAt = (arr: Stn[], z: number): Stn => {
    if (z <= arr[0].z) return arr[0];
    for (let i = 0; i < arr.length - 1; i++) {
      if (z <= arr[i + 1].z) {
        const t = (z - arr[i].z) / (arr[i + 1].z - arr[i].z);
        const m = (k: "y" | "w" | "h") => arr[i][k] + (arr[i + 1][k] - arr[i][k]) * t;
        return { z, y: m("y"), w: m("w"), h: m("h") };
      }
    }
    return arr[arr.length - 1];
  };

  b.loft(SN.map((s) => ({ at: H(0, s.y, s.z), w: s.w * S, h: s.h * S })), {
    bone: head,
    color: BONE,
    section: { ngon: 6 },
    caps: "flat",
    name: "snout",
    group: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 7, 5), BONE, { bone: head, at: H(0, -0.034, 0.268), scale: [0.04 * S, 0.03 * S, 0.034 * S], flat: true, name: "nosePad", group: "skull" });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.009 * S, 5, 4), DARK, { bone: head, at: H(s * 0.02, -0.03, 0.296), name: "nostril", group: "skull" });

  // lower jaw (its own bone, opened at the end)
  b.loft(JW.map((s) => ({ at: H(0, s.y, s.z), w: s.w * S, h: s.h * S })), {
    bone: jaw,
    color: BONE,
    section: { ngon: 6 },
    caps: "flat",
    name: "lowerJaw",
    group: "jaw",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), BONE, { bone: jaw, at: H(0, -0.09, 0.248), scale: [0.03 * S, 0.02 * S, 0.026 * S], flat: true, name: "chin", group: "jaw" });

  // teeth
  const upperZ = [0.04, 0.08, 0.12, 0.16, 0.2, 0.24];
  const upperLen = [0.028, 0.03, 0.032, 0.034, 0.062, 0.032];
  for (const s of [1, -1])
    upperZ.forEach((z, i) => {
      const st = stAt(SN, z);
      const canine = i === 4;
      b.spike(H(s * st.w * 0.5 * 0.83, st.y - st.h * 0.25 - 0.002, z), [0, -1, 0], upperLen[i] * S, (canine ? 0.011 : 0.008) * S, {
        bone: head,
        color: TOOTH,
        sides: 5,
        name: "upperTooth",
        group: "skull",
      });
    });
  for (const x of [-0.022, 0, 0.022]) {
    const st = SN[3];
    b.spike(H(x, st.y - st.h * 0.4, 0.262), [0, -1, 0.1], 0.03 * S, 0.007 * S, { bone: head, color: TOOTH, sides: 5, name: "incisor", group: "skull" });
  }
  for (const s of [1, -1])
    upperZ.forEach((z, i) => {
      const st = stAt(JW, z);
      const canine = i === 3;
      b.spike(H(s * st.w * 0.5 * 0.83, st.y + st.h * 0.25 + 0.002, z), [0, 1, 0], (canine ? 0.05 : 0.024) * S, (canine ? 0.009 : 0.006) * S, {
        bone: jaw,
        color: TOOTH,
        sides: 5,
        name: "lowerTooth",
        group: "jaw",
      });
    });

  // brows, eyes
  for (const s of [1, -1]) {
    b.rod(H(s * 0.022, 0.05, 0.13), H(s * 0.085, 0.052, 0.02), [0.016 * S, 0.012 * S], { bone: head, color: BONE, sides: 5, name: "browRidge", group: "skull" });
    const sc = H(s * 0.056, 0.018, 0.07);
    const sock = b.part(new THREE.SphereGeometry(0.027 * S, 8, 6), DARK, { bone: head, at: sc, flat: true, name: "eyeSocket", group: "skull" });
    const dir: V = [s * 0.62, 0.16, 0.77];
    const dl = Math.hypot(...dir);
    const out = dir.map((v) => v / dl) as V;
    const r = 0.027 * S;
    glow(
      b.decal(sock, EYE, {
        at: [sc[0] + out[0] * r, sc[1] + out[1] * r, sc[2] + out[2] * r],
        dir: out,
        size: [0.072, 0.042],
        roll: s * 16,
        name: "soulEye",
        group: "skull",
      }),
      1.6,
    );
  }

  // horns with gold rings
  for (const s of [1, -1]) {
    const hp = bezier(H(s * 0.045, 0.055, -0.045), H(s * 0.09, 0.09, -0.1), H(s * 0.12, 0.19, -0.13), H(s * 0.1, 0.27, -0.03));
    b.sweep(hp, [0.036, 0.004], { bone: head, color: BONE, sides: 6, caps: { start: "flat", end: "point" }, name: "horn", group: "skull" });
    for (const t of [0.22, 0.46, 0.7]) {
      const at = hp.at(t);
      const rr = 0.036 - (0.036 - 0.004) * t + 0.004;
      const tg = hp.tangentAt(t);
      b.part(new THREE.TorusGeometry(rr, 0.006, 5, 10), GOLD, { bone: head, at, dir: [tg.x, tg.y, tg.z], axis: "z", flat: true, name: "hornRing", group: "skull" });
    }
    // cheek fan spikes
    const fan: { d: V; len: number }[] = [
      { d: [s, 0.35, -0.5], len: 0.11 },
      { d: [s, 0.05, -0.8], len: 0.14 },
      { d: [s * 0.9, -0.3, -0.8], len: 0.1 },
    ];
    fan.forEach((f, i) =>
      b.spike(H(s * 0.075, -0.012 - i * 0.012, -0.03 - i * 0.012), f.d, f.len * S, 0.016 * S, { bone: head, color: BONE, sides: 5, name: "cheekSpike", group: "skull" }),
    );
  }

  // surface-seated crest and brow gem
  const skin = b.surface(cranium);
  [25, 48, 70].forEach((el, i) => {
    const hit = skin.around(cranium.at).at(180, el);
    if (hit) b.stick(new THREE.ConeGeometry(0.02 * S, (0.1 - i * 0.02) * S, 5), BONE, hit, { embed: 0.2, bone: head, name: "crestSpike", group: "skull" });
  });
  const gemHit = skin.around(cranium.at).at(0, 58);
  if (gemHit) {
    b.stick(new THREE.CylinderGeometry(0.03, 0.036, 0.014, 6), GOLD, gemHit, { embed: 0.4, bone: head, name: "gemSetting", group: "skull" });
    glow(b.stick(new THREE.OctahedronGeometry(0.026, 0), TEAL, gemHit, { embed: 0.15, bone: head, flat: true, name: "browGem", group: "skull" }), 1.5);
  }

  // open the jaw, then fill the maw with soul fire
  b.pose(jaw, { axis: [1, 0, 0], deg: 24 });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), TEAL, { bone: head, at: [0, 1.845, 0.14], name: "mawCore", group: "skull" }), 1.5);
  const mawFrames = [
    { z: 0.1, y: 1.841, size: [0.045, 0.06] as [number, number] },
    { z: 0.17, y: 1.808, size: [0.055, 0.075] as [number, number] },
    { z: 0.23, y: 1.786, size: [0.055, 0.095] as [number, number] },
  ];
  for (const m of mawFrames) glow(b.cards([frame([0, m.y, m.z], [0, 1, 0])], FLAME, { size: m.size, lean: 0, flow: [0, 0, -1], cross: true, bone: head }), 1.3);

  // ---------------------------------------------------------------------------------------------------------------
  // Blade: cracked ivory rib with glowing soul edge
  const outline: OutlinePoint[] = [];
  topS.forEach((p, i) => outline.push(i === N ? [p.x, p.y, "sharp"] : [p.x, p.y]));
  for (let i = N - 1; i >= 0; i--) outline.push([innS[i].x, innS[i].y]);
  b.extrude(outline, { at: [BX, BY, BZ], bone: blade, thickness: BT, bevel: 0.006, color: BLADE, name: "bladeBody", group: "blade" });

  const edge: OutlinePoint[] = [];
  const wBand = (i: number) => 0.032 * (1 - smoothstep(0.7, 1.0, i / N));
  for (let i = 0; i <= N; i++) edge.push([innS[i].x, innS[i].y]);
  for (let i = N - 1; i >= 0; i--) edge.push([innS[i].x, innS[i].y + Math.max(0.004, wBand(i))]);
  glow(b.extrude(edge, { at: [BX, BY, BZ], bone: blade, thickness: BT + 0.008, bevel: 0.003, color: TEAL, name: "soulEdge", group: "blade" }), 1.8);

  // rune bands on both faces
  const runeW = 1.5;
  const runeH = 0.8;
  const runeC: V = [0.65 + BX, BY - 0.1, BZ];
  const frontPlane = new THREE.PlaneGeometry(runeW, runeH);
  const backPlane = new THREE.PlaneGeometry(runeW, runeH);
  const uv = backPlane.getAttribute("uv");
  for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
  glow(b.part(frontPlane, "#ffffff", { bone: blade, at: [runeC[0], runeC[1], runeC[2] + BT / 2 + 0.0035], dir: [0, 0, 1], axis: "z", up: [0, 1, 0], texture: RUNES, name: "runesFront", group: "blade" }), 1.5);
  glow(b.part(backPlane, "#ffffff", { bone: blade, at: [runeC[0], runeC[1], runeC[2] - BT / 2 - 0.0035], dir: [0, 0, -1], axis: "z", up: [0, 1, 0], texture: RUNES, name: "runesBack", group: "blade" }), 1.5);

  // wing-finger ribs on both faces
  for (let k = 0; k < 8; k++) {
    const x = 0.22 + k * 0.1;
    const x2 = x + 0.05;
    for (const sz of [1, -1]) {
      b.rod([BX + x, BY + topY(x) - 0.03, BZ + sz * (BT / 2 - 0.0005)], [BX + x2, BY + innY(x2) + 0.135, BZ + sz * (BT / 2 - 0.0005)], [0.007, 0.0035], {
        bone: blade,
        color: RIB,
        sides: 5,
        name: "bladeRib",
        group: "blade",
      });
    }
  }

  // dorsal barbs with soul-fire between them
  const barbOutline: OutlinePoint[] = [
    [-0.03, 0],
    [0.05, 0],
    [0.045, 0.05],
    [0.09, 0.14, "sharp"],
    [0.0, 0.1],
    [-0.035, 0.045],
  ];
  const barbs: [number, number][] = [
    [0.28, 1.0],
    [0.5, 1.0],
    [0.72, 0.9],
    [0.92, 0.75],
    [1.07, 0.55],
  ];
  for (const [x, k] of barbs) {
    const a = Math.atan2(topY(x + 0.01) - topY(x - 0.01), 0.02);
    const sc = k * 1.1;
    const o: OutlinePoint[] = barbOutline.map((p) => (p.length === 3 ? [p[0] * sc, p[1] * sc, "sharp"] : [p[0] * sc, p[1] * sc]));
    b.extrude(o, {
      at: [BX + x, BY + topY(x) - 0.018, BZ],
      x: [Math.cos(a), Math.sin(a), 0],
      y: [-Math.sin(a), Math.cos(a), 0],
      thickness: [0.03, 0.01],
      bevel: 0.004,
      bone: blade,
      color: BONE,
      name: "bladeBarb",
      group: "blade",
    });
  }
  const flameFrames = [0.39, 0.61, 0.82, 1.0].map((x) => frame([BX + x, BY + topY(x) + 0.004, BZ], [0, 1, 0]));
  glow(b.cards(flameFrames, FLAME, { size: [0.09, 0.19], lean: 0, flow: [0, 0, -1], cross: true, bone: blade, vary: 0.15, rng: undefined }), 1.3);

  // gold root clamp with dragon-eye emblem
  const plate: OutlinePoint[] = [
    [-0.12, -0.08],
    [0.1, -0.1],
    [0.24, -0.02],
    [0.2, 0.1],
    [0.08, 0.17],
    [-0.12, 0.12],
  ];
  b.extrude(plate, { at: [BX, BY, BZ], bone: blade, thickness: 0.05, bevel: 0.008, color: GOLD, name: "rootPlate", group: "blade" });
  for (const sz of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.048, 16), "#ffffff", {
      bone: blade,
      at: [BX + 0.09, BY + 0.03, BZ + sz * 0.0275],
      dir: [0, 0, sz],
      axis: "z",
      up: [0, 1, 0],
      texture: EMBLEM,
      name: "emblem",
      group: "blade",
    });
    for (const [rx, ry] of [[-0.07, -0.05], [-0.07, 0.09], [0.19, 0.0], [0.15, 0.09]])
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD_D, { bone: blade, at: [BX + rx, BY + ry, BZ + sz * 0.026], flat: true, name: "rivet", group: "blade" });
  }

  // thumb talon under the root, and the counterweight horn with the lantern hook
  b.sweep(bezier([0.12, 1.74, BZ], [0.12, 1.62, BZ], [0.2, 1.54, BZ], [0.34, 1.49, BZ]), [0.032, 0], {
    bone: blade,
    color: BONE,
    sides: 6,
    caps: { start: "flat", end: "point" },
    name: "thumbTalon",
    group: "blade",
  });
  const tailPath = bezier([-0.03, 1.82, BZ], [-0.22, 1.79, BZ], [-0.42, 1.87, BZ], [-0.55, 2.07, BZ]);
  b.sweep(tailPath, [0.042, 0.012], { bone: snath, color: BONE, sides: 6, caps: { start: "flat", end: "round" }, name: "counterHorn", group: "hook" });
  for (const t of [0.3, 0.55]) {
    const at = tailPath.at(t);
    const tg = tailPath.tangentAt(t);
    b.part(new THREE.TorusGeometry(0.043 - 0.03 * t, 0.006, 5, 10), GOLD, { bone: snath, at, dir: [tg.x, tg.y, tg.z], axis: "z", flat: true, name: "counterRing", group: "hook" });
  }
  for (const [t, len] of [[0.25, 0.1], [0.5, 0.08], [0.75, 0.06]] as [number, number][]) {
    const at = tailPath.at(t);
    b.spike(at, [0.1, -1, 0], len, 0.016, { bone: snath, color: BONE, sides: 5, name: "counterBarb", group: "hook" });
  }
  torus([-0.55, 2.07, BZ], null, 0.016, 0.004, GOLD, snath, "hookRing");

  // ---------------------------------------------------------------------------------------------------------------
  // Soul lantern on a chain
  for (let k = 0; k < 11; k++)
    torus([-0.55, 2.04 - k * 0.021, BZ], null, 0.011, 0.0028, GOLD_D, lantern, `chainLink${k}`, [0.8, 1.5, 1], [0, k % 2 ? 90 : 0, 0]);
  torus([-0.55, 1.805, BZ], null, 0.016, 0.004, GOLD, lantern, "lanternRing");
  b.lathe(
    [
      [0, 0],
      [0.062, 0],
      [0.062, 0.01],
      [0.04, 0.035],
      [0.016, 0.055],
      [0.012, 0.06],
      [0, 0.06],
    ],
    { at: [-0.55, 1.73, BZ], bone: lantern, color: GOLD, segments: 6, name: "lanternCap", group: "lantern" },
  );
  glow(
    b.part(new THREE.CylinderGeometry(0.052, 0.045, 0.11, 6), "#ffffff", {
      bone: lantern,
      at: [-0.55, 1.675, BZ],
      texture: LANTERN,
      name: "lanternGlass",
      group: "lantern",
    }),
    1.4,
  );
  for (let k = 0; k < 6; k++) {
    const th = (k * Math.PI) / 3;
    b.rod([-0.55 + 0.045 * Math.sin(th), 1.62, BZ + 0.045 * Math.cos(th)], [-0.55 + 0.052 * Math.sin(th), 1.73, BZ + 0.052 * Math.cos(th)], 0.005, {
      bone: lantern,
      color: GOLD,
      sides: 4,
      name: "lanternBar",
      group: "lantern",
    });
  }
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.052, 0.02],
      [0.056, 0.04],
      [0, 0.04],
    ],
    { at: [-0.55, 1.58, BZ], bone: lantern, color: GOLD, segments: 6, name: "lanternBase", group: "lantern" },
  );
  b.spike([-0.55, 1.585, BZ], [0, -1, 0], 0.045, 0.015, { bone: lantern, color: GOLD, sides: 6, name: "lanternFoot", group: "lantern" });

  // ---------------------------------------------------------------------------------------------------------------
  // Ribbons from the neck ring
  const ribbonFrames: { f: ReturnType<typeof frame>; flow: V; size: [number, number] }[] = [];
  [45, 135, 225, 315].forEach((a, i) => {
    const c = Math.cos((a * Math.PI) / 180);
    const z = Math.sin((a * Math.PI) / 180);
    ribbonFrames.push({ f: frame([0.062 * c, 1.76, 0.062 * z], [0, 1, 0]), flow: [c, 0, z], size: i % 2 ? [0.065, 0.42] : [0.075, 0.55] });
  });
  for (const r of ribbonFrames) b.cards([r.f], RIBBON, { size: r.size, lean: 180, flow: r.flow, bone: snath });

  // ---------------------------------------------------------------------------------------------------------------
  // Trapped souls drifting under the blade
  const souls: [number, number, number][] = [
    [0.62, -0.27, 0.13],
    [0.92, -0.42, 0.12],
    [1.1, -0.62, 0.1],
  ];
  for (const [x, y, sz] of souls)
    glow(b.cards([frame([BX + x, BY + y, BZ], [0, 1, 0])], GHOST, { size: [sz * 0.7, sz * 1.1], lean: 0, flow: [0, 0, -1], cross: false, bone: blade }), 1.4);
  [[0.7, -0.14], [0.8, -0.2], [0.86, -0.3], [1.04, -0.5], [1.0, -0.38], [0.74, -0.22]].forEach(([x, y], i) => {
    glow(b.part(new THREE.OctahedronGeometry(0.008 + (i % 3) * 0.003, 0), TEAL_HI, { bone: blade, at: [BX + x, BY + y, BZ], flat: true, name: "soulSpark", group: "souls" }), 1.5);
  });
  glow(b.part(new THREE.IcosahedronGeometry(0.012, 0), TEAL_DEEP, { bone: blade, at: [BX + 1.29, BY - 0.4, BZ], flat: true, name: "tipGlint", group: "souls" }), 1.4);

  return b.root;
}
