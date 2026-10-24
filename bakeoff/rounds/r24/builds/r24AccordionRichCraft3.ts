import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, paint, noise, mix, smoothstep, svg, catmull } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Madreperla Piano Accordion",
  description:
    "Italian mother-of-pearl piano accordion: swirled nacre celluloid body, gilt corner guards and rails, 24 ivory and 17 ebony treble keys, 120 pearl bass buttons, pleated wine bellows with gold ridges, filigree grille, rosette medallions, register rockers, leather straps and jewel studs.",
};

type V = [number, number, number];
type Fill = ColorInput;
type RGB = readonly [number, number, number];

// ---------------------------------------------------------------- dimensions (meters)
const H = 0.48; // box height
const T0 = -0.29; // treble box outer end (grille side)
const T1 = -0.1; // treble box bellows side
const B0 = 0.16; // bass box bellows side
const B1 = 0.29; // bass box outer end
const TZ = 0.1; // treble half depth
const BZ = 0.09; // bass half depth
const BOARD = 0.011;
const XS = T1 + BOARD; // first bellows ring
const XE = B0 - BOARD; // last bellows ring
const M = 26; // bellows segments
const DX = (XE - XS) / M;
const MID_Y = H / 2;

// ---------------------------------------------------------------- palette
const GOLD = "#e0ad3c";
const IVORY = "#faf5ea";
const EBONY = "#17111b";
const SHINE = "#5d5470";
const TRAY = "#241218";
const CHROME = "#d5dce4";
const BTN_BODY = "#eee5d6";
const PLATE = "#2b1620";
const ROCK_A = "#f5eee2";
const ROCK_B = "#ecc6d4";
const SLOT = "#1d1218";
const STITCH = "#ead9ab";
const RUBY = "#c8213f";
const EMERALD = "#19a574";
const SAPPHIRE = "#2b5fcf";
const HOLE = "#1a0e10";

// ---------------------------------------------------------------- paints
const PEARL = paint((p, n) => {
  const w1 = noise(p, 0.12, 4);
  const band = 0.5 + 0.5 * Math.sin(p.x * 24 + p.y * 18 - p.z * 11 + w1 * 11);
  let c: RGB = mix("#fcf7ee", "#f4c9d9", smoothstep(0.5, 0.95, band) * 0.9);
  c = mix(c, "#bfe8e1", smoothstep(0.58, 0.82, noise(p, 0.06, 9)) * 0.8);
  c = mix(c, "#d6c9f6", smoothstep(0.62, 0.88, noise(p, 0.08, 17)) * 0.65);
  const f = noise(p, 0.007, 31);
  c = mix(c, "#ffffff", smoothstep(0.6, 0.78, f) * 0.7);
  c = mix(c, "#e2cfd0", smoothstep(0.34, 0.2, f) * 0.35);
  c = mix(c, "#cfe6ff", 0.16 * smoothstep(0.4, 1, Math.abs(n.x)));
  const k = smoothstep(-0.7, 0.8, n.y);
  return [c[0] * (0.82 + 0.18 * k), c[1] * (0.86 + 0.14 * k), c[2] * (0.95 + 0.05 * k)];
});

const BELLOWS = paint((p, n) => {
  const ph = (p.x - XS) / (2 * DX);
  const d = Math.abs(ph - Math.floor(ph) - 0.5); // 0 on a ridge, 0.5 in a valley
  let c: RGB = mix("#2a0a1a", "#5e1b37", smoothstep(0.5, 0.12, d));
  c = mix(c, "#80304e", noise(p, 0.03, 5) * 0.25);
  const k = 0.8 + 0.2 * smoothstep(-0.8, 0.8, n.y);
  if (d < 0.07) return [0.9 * k, 0.7 * k, 0.26 * k];
  if (d < 0.1) c = mix(c, "#6b4310", 0.6);
  return [c[0] * k, c[1] * k, c[2] * k];
});

const GILT = metal("gilt", { polish: 0.5, tarnish: 0.12 });

const LEATHER = paint((p, n) => {
  const a = noise(p, 0.03, 2);
  const g = noise(p, 0.004, 7);
  const c = mix("#4b2314", "#85502e", a * 0.7 + g * 0.3);
  const k = 0.85 + 0.15 * smoothstep(-0.5, 0.8, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});

// ---------------------------------------------------------------- textures
const GD = "#5e3a0c";
const GM = "#e3b24b";
const GL = "#fff0b3";

const gline = (d: string, w = 2.6) =>
  `<path d="${d}" fill="none" stroke="${GD}" stroke-width="${w + 2.2}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${GM}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${GL}" stroke-width="${w * 0.35}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-0.5 -0.6)"/>`;

const rosetteSvg = (cx: number, cy: number, r: number, petals: number, rot = 0) => {
  let s = "";
  for (let i = 0; i < petals; i++) {
    const a = rot + (i * 360) / petals;
    s += `<ellipse cx="${cx}" cy="${cy - r * 0.58}" rx="${r * 0.21}" ry="${r * 0.42}" transform="rotate(${a} ${cx} ${cy})" fill="${GM}" stroke="${GD}" stroke-width="1.6"/>`;
    s += `<ellipse cx="${cx}" cy="${cy - r * 0.62}" rx="${r * 0.07}" ry="${r * 0.26}" transform="rotate(${a} ${cx} ${cy})" fill="${GL}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="${GM}" stroke="${GD}" stroke-width="1.8"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="#fbefe6" stroke="${GD}" stroke-width="1.4"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.14}" fill="#f2b9cc"/>`;
  s += `<circle cx="${cx - r * 0.08}" cy="${cy - r * 0.09}" r="${r * 0.05}" fill="#ffffff"/>`;
  return s;
};

function makeOrnament() {
  let s = `<svg viewBox="0 0 66 440" xmlns="http://www.w3.org/2000/svg">`;
  s += gline("M12 4 H54 Q62 4 62 12 V428 Q62 436 54 436 H12 Q4 436 4 428 V12 Q4 4 12 4Z", 2.6);
  s += `<path d="M14 10 H52 Q56 10 56 14 V426 Q56 430 52 430 H14 Q10 430 10 426 V14 Q10 10 14 10Z" fill="none" stroke="${GD}" stroke-width="1.6" stroke-dasharray="2.5 3.5"/>`;
  for (let k = 0; k < 6; k++) {
    const y = 76 + k * 58;
    s += rosetteSvg(33, y, 17, 8, k * 11);
    if (k < 5) {
      const y2 = y + 20;
      s += gline(`M33 ${y2} C14 ${y2 + 6} 14 ${y2 + 22} 33 ${y2 + 30}`, 2.2);
      s += gline(`M33 ${y2} C52 ${y2 + 6} 52 ${y2 + 22} 33 ${y2 + 30}`, 2.2);
      s += `<path d="M33 ${y2 + 8} q-5 6 0 12 q5 -6 0 -12Z" fill="${GM}" stroke="${GD}" stroke-width="1.4"/>`;
    }
  }
  s += gline("M33 392 L24 404 L33 416 L42 404Z", 2.2);
  s += `<circle cx="33" cy="404" r="3" fill="#fbefe6" stroke="${GD}" stroke-width="1.2"/>`;
  s += `</svg>`;
  return svg(s, { size: 1000 });
}

function makePlaque() {
  return svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="96" height="36" rx="10" fill="${GM}" stroke="${GD}" stroke-width="3"/>
      <rect x="6" y="6" width="88" height="28" rx="7" fill="#3a0f1c" stroke="${GL}" stroke-width="1.5"/>
      <text x="50" y="20" text-anchor="middle" font-family="serif" font-weight="bold" font-size="11" fill="#f6d986" textLength="74" lengthAdjust="spacingAndGlyphs">MADREPERLA</text>
      <rect x="35" y="25" width="10" height="5" fill="#1f9d55"/>
      <rect x="45" y="25" width="10" height="5" fill="#fbf6ea"/>
      <rect x="55" y="25" width="10" height="5" fill="#d22b3a"/>
    </svg>`,
    { size: 400 },
  );
}

function makeGrille() {
  let lat = "";
  for (let x0 = -400; x0 <= 150; x0 += 20) lat += `<path d="M${x0} 0 L${x0 + 400} 400"/>`;
  for (let x0 = 0; x0 <= 550; x0 += 20) lat += `<path d="M${x0} 0 L${x0 - 400} 400"/>`;
  return svg(
    `<svg viewBox="0 0 150 390" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gg" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#a8721f"/><stop offset="0.5" stop-color="#f3d06e"/><stop offset="1" stop-color="#a8721f"/>
        </linearGradient>
        <radialGradient id="pg" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f7d4e0"/><stop offset="0.8" stop-color="#bfe5df"/><stop offset="1" stop-color="#cdbdf0"/>
        </radialGradient>
        <clipPath id="win"><path d="M18 352 V108 A57 57 0 0 1 132 108 V352 Z"/></clipPath>
      </defs>
      <rect width="150" height="390" fill="url(#gg)"/>
      <rect x="2" y="2" width="146" height="386" fill="none" stroke="${GD}" stroke-width="4"/>
      <path d="M18 352 V108 A57 57 0 0 1 132 108 V352 Z" fill="#3a0716" stroke="${GD}" stroke-width="5"/>
      <g clip-path="url(#win)">
        <rect x="0" y="0" width="150" height="390" fill="#4a0b1a"/>
        <g stroke="#e0aa45" stroke-width="2.4" fill="none">${lat}</g>
        <circle cx="75" cy="112" r="30" fill="${GM}" stroke="${GD}" stroke-width="3"/>
        <circle cx="75" cy="112" r="22" fill="#3a0716" stroke="${GL}" stroke-width="1.6"/>
        <circle cx="75" cy="112" r="14" fill="url(#pg)" stroke="${GD}" stroke-width="2"/>
        <circle cx="70" cy="107" r="3.4" fill="#ffffff"/>
      </g>
      <path d="M18 352 V108 A57 57 0 0 1 132 108 V352 Z" fill="none" stroke="${GL}" stroke-width="1.4" transform="translate(-0.8 -0.8)"/>
      <circle cx="75" cy="26" r="14" fill="${GM}" stroke="${GD}" stroke-width="2.4"/>
      <circle cx="75" cy="26" r="7" fill="url(#pg)" stroke="${GD}" stroke-width="1.6"/>
      <path d="M12 28 q9 -12 18 0 M120 28 q9 -12 18 0" fill="none" stroke="${GD}" stroke-width="3"/>
      <rect x="18" y="360" width="114" height="20" rx="6" fill="#3a0716" stroke="${GD}" stroke-width="3"/>
      <g fill="${GM}" stroke="${GD}" stroke-width="1.2">
        <circle cx="34" cy="370" r="4"/><circle cx="54" cy="370" r="4"/><circle cx="75" cy="370" r="4"/><circle cx="96" cy="370" r="4"/><circle cx="116" cy="370" r="4"/>
      </g>
    </svg>`,
    { size: 700 },
  );
}

function makeRosette() {
  let petals = "";
  for (let i = 0; i < 12; i++) {
    petals += `<ellipse cx="50" cy="25" rx="6.2" ry="14" transform="rotate(${i * 30} 50 50)" fill="url(#pg)" stroke="${GD}" stroke-width="1.7"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pg" cx="0.4" cy="0.35" r="0.85">
          <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f7d4e0"/><stop offset="0.8" stop-color="#bfe5df"/><stop offset="1" stop-color="#cdbdf0"/>
        </radialGradient>
        <radialGradient id="gm" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stop-color="#fff0b3"/><stop offset="0.6" stop-color="#e3b24b"/><stop offset="1" stop-color="#a8721f"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill="${GD}"/>
      <circle cx="50" cy="50" r="45" fill="url(#gm)"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="${GD}" stroke-width="1.8" stroke-dasharray="2 4"/>
      ${petals}
      <circle cx="50" cy="50" r="14" fill="url(#gm)" stroke="${GD}" stroke-width="2.4"/>
      <circle cx="50" cy="50" r="9" fill="url(#pg)" stroke="${GD}" stroke-width="1.6"/>
      <ellipse cx="47" cy="46" rx="3.2" ry="2" fill="#ffffff" transform="rotate(-30 47 46)"/>
    </svg>`,
    { size: 512 },
  );
}

function makeButton(dimple: boolean) {
  return svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="pg" cx="0.38" cy="0.32" r="0.85">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#f6dbe5"/><stop offset="0.85" stop-color="#c4e6e0"/><stop offset="1" stop-color="#cfc2ef"/>
      </radialGradient></defs>
      <circle cx="16" cy="16" r="15.5" fill="#8a7b80"/>
      <circle cx="16" cy="16" r="13.5" fill="url(#pg)"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="#c9b6be" stroke-width="1.4"/>
      ${dimple ? `<circle cx="16" cy="16" r="3.6" fill="#7a6a70"/><circle cx="15" cy="15" r="1.2" fill="#b8a8ae"/>` : ""}
      <ellipse cx="11.5" cy="10.5" rx="4.2" ry="2.4" fill="#ffffff" opacity="0.85" transform="rotate(-35 11.5 10.5)"/>
    </svg>`,
    { size: 64 },
  );
}

// ---------------------------------------------------------------- geometry helpers
/** A box turned into a frustum along X with rectangular sections (half extents hy, hz), centred on the body height. */
function frustumX(x0: number, x1: number, hy0: number, hz0: number, hy1: number, hz1: number) {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const end = pos.getX(i) > 0;
    const hy = end ? hy1 : hy0;
    const hz = end ? hz1 : hz0;
    pos.setXYZ(i, end ? x1 : x0, MID_Y + Math.sign(pos.getY(i)) * hy, Math.sign(pos.getZ(i)) * hz);
  }
  g.computeVertexNormals();
  return g;
}

export default function build() {
  const b = createBuilder({ name: "piano_accordion" });

  const box = (s: V, c: Fill, at: V, rot?: V, name?: string) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, rotation: rot, name });

  const bucket = () => {
    const gs: THREE.BufferGeometry[] = [];
    return {
      add(g: THREE.BufferGeometry, at: V, rot?: V) {
        if (rot) {
          const d = THREE.MathUtils.DEG2RAD;
          g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0] * d, rot[1] * d, rot[2] * d)));
        }
        g.translate(at[0], at[1], at[2]);
        gs.push(g);
      },
      box(s: V, at: V) {
        this.add(new THREE.BoxGeometry(s[0], s[1], s[2]), at);
      },
      flush(c: Fill, texture?: THREE.Texture, name?: string) {
        return b.part(mergeGeometries(gs, false)!, c, { at: [0, 0, 0], texture, name });
      },
    };
  };

  const plane = (w: number, h: number, tex: THREE.Texture, at: V, dir: V, up?: V, name?: string) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, up, axis: "z", texture: tex, name });
  const disc = (r: number, tex: THREE.Texture, at: V, dir: V, up?: V, name?: string) =>
    b.part(new THREE.CircleGeometry(r, 28), "#ffffff", { at, dir, up, axis: "z", texture: tex, name });

  /** Four bars forming a rectangular frame in the YZ plane (outer half extents hy, hz). */
  const frameYZ = (xc: number, xl: number, cy: number, cz: number, hy: number, hz: number, t: number, c: Fill) => {
    box([xl, t, 2 * hz], c, [xc, cy + hy - t / 2, cz]);
    box([xl, t, 2 * hz], c, [xc, cy - hy + t / 2, cz]);
    box([xl, 2 * hy - 2 * t, t], c, [xc, cy, cz + hz - t / 2]);
    box([xl, 2 * hy - 2 * t, t], c, [xc, cy, cz - hz + t / 2]);
  };

  /** Gilt rim round the top or bottom perimeter of a box. */
  const rim = (x0: number, x1: number, z0: number, z1: number, y: number) => {
    const t = 0.005;
    const h = 0.007;
    const w = x1 - x0 + 0.004;
    const d = z1 - z0 + 0.004;
    box([w, h, t], GILT, [(x0 + x1) / 2, y, z1 - t / 2 + 0.002]);
    box([w, h, t], GILT, [(x0 + x1) / 2, y, z0 + t / 2 - 0.002]);
    box([t, h, d - 2 * t], GILT, [x0 + t / 2 - 0.002, y, (z0 + z1) / 2]);
    box([t, h, d - 2 * t], GILT, [x1 - t / 2 + 0.002, y, (z0 + z1) / 2]);
  };

  const gems: { at: V; c: string }[] = [];

  /** Gilt binding, corner guards and jewel studs for one box. */
  const trimBox = (x0: number, x1: number, z0: number, z1: number, gemColors: string[]) => {
    rim(x0, x1, z0, z1, H - 0.0035 + 0.002);
    rim(x0, x1, z0, z1, 0.0035);
    const g = 0.022;
    let gi = 0;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const cx = sx > 0 ? x1 : x0;
        const cz = sz > 0 ? z1 : z0;
        box([0.006, H - 0.04, 0.006], GILT, [cx, MID_Y, cz]);
        for (const sy of [-1, 1]) {
          const cy = sy > 0 ? H : 0;
          const at: V = [cx + sx * (0.003 - g / 2), cy + sy * (0.003 - g / 2), cz + sz * (0.003 - g / 2)];
          if (sy < 0 && 0 + sy * (0.003 - g / 2) < 0) at[1] = g / 2; // keep guards on the floor
          box([g, g, g], GILT, at);
          if (sz > 0) gems.push({ at: [at[0], at[1], cz + 0.003], c: gemColors[gi++ % gemColors.length] });
        }
      }
    }
  };

  const rockers = (cx: number, y: number, z: number, n: number, pitch: number) => {
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * pitch;
      box([0.012, 0.002, 0.026], SLOT, [x, y + 0.001, z]);
      box([0.009, 0.005, 0.02], i % 2 ? ROCK_B : ROCK_A, [x, y + 0.0045, z], [i % 2 ? 12 : -12, 0, 0]);
      b.part(new THREE.CylinderGeometry(0.0018, 0.0018, 0.014, 6), GOLD, { at: [x, y + 0.003, z], dir: [1, 0, 0] });
    }
  };

  // ================================================================ BODY
  b.part(new THREE.BoxGeometry(T1 - T0, H, 2 * TZ), PEARL, { at: [(T0 + T1) / 2, MID_Y, 0], name: "trebleBox" });
  b.part(new THREE.BoxGeometry(B1 - B0, H, 2 * BZ), PEARL, { at: [(B0 + B1) / 2, MID_Y, 0], name: "bassBox" });
  trimBox(T0, T1, -TZ, TZ, [RUBY, EMERALD, SAPPHIRE, RUBY]);
  trimBox(B0, B1, -BZ, BZ, [SAPPHIRE, RUBY, EMERALD, SAPPHIRE]);

  // ================================================================ BELLOWS
  for (const [xc, name] of [
    [T1 + BOARD / 2, "boardTreble"],
    [B0 - BOARD / 2, "boardBass"],
  ] as [number, string][]) {
    b.part(new THREE.BoxGeometry(BOARD, 0.456, 0.171), PEARL, { at: [xc, MID_Y, 0], name });
    frameYZ(xc, BOARD + 0.001, MID_Y, 0, 0.232, 0.0875, 0.004, GILT);
  }
  const ringAt = (k: number) => (k % 2 ? { hy: 0.222, hz: 0.084 } : { hy: 0.2, hz: 0.064 });
  const studs = bucket();
  for (let k = 0; k < M; k++) {
    const a = ringAt(k);
    const c = ringAt(k + 1);
    b.part(frustumX(XS + k * DX, XS + (k + 1) * DX, a.hy, a.hz, c.hy, c.hz), BELLOWS, {
      at: [0, 0, 0],
      name: `bellows${k}`,
    });
    if (k % 2 === 1) {
      const x = XS + k * DX;
      for (const sy of [-1, 1])
        for (const sz of [-1, 1]) studs.box([0.007, 0.016, 0.016], [x, MID_Y + sy * 0.215, sz * 0.077]);
    }
  }
  studs.flush(GOLD, undefined, "bellowsCorners");

  // bellows strap with buckle
  box([0.11, 0.022, 0.003], LEATHER, [0.094, 0.4, 0.0875], undefined, "bellowsStrap");
  box([0.11, 0.0016, 0.0008], STITCH, [0.094, 0.4 + 0.0085, 0.0893]);
  box([0.11, 0.0016, 0.0008], STITCH, [0.094, 0.4 - 0.0085, 0.0893]);
  box([0.004, 0.03, 0.006], GOLD, [0.038, 0.4, 0.089]);
  box([0.016, 0.004, 0.006], GOLD, [0.044, 0.4 + 0.013, 0.089]);
  box([0.016, 0.004, 0.006], GOLD, [0.044, 0.4 - 0.013, 0.089]);
  box([0.016, 0.0025, 0.005], GOLD, [0.046, 0.4, 0.0915]);
  const holes = bucket();
  for (let i = 0; i < 4; i++)
    holes.add(new THREE.CylinderGeometry(0.0016, 0.0016, 0.001, 6).rotateX(Math.PI / 2), [0.1 + i * 0.012, 0.4, 0.0893]);
  holes.flush(HOLE, undefined, "strapHoles");

  // ================================================================ TREBLE KEYBOARD (front, +Z)
  const KEY_N = 24;
  const KP = 0.0185;
  const keyY = (i: number) => MID_Y + (i - (KEY_N - 1) / 2) * KP;
  const KX = -0.161;

  box([0.114, 0.452, 0.003], TRAY, [-0.162, MID_Y, TZ + 0.0015], undefined, "keyTray");
  box([0.004, 0.456, 0.005], GILT, [-0.2195, MID_Y, TZ + 0.0025]);
  box([0.004, 0.456, 0.005], GILT, [-0.1045, MID_Y, TZ + 0.0025]);
  box([0.119, 0.004, 0.005], GILT, [-0.162, 0.0115, TZ + 0.0025]);
  box([0.119, 0.004, 0.005], GILT, [-0.162, 0.4685, TZ + 0.0025]);

  for (let i = 0; i < KEY_N; i++) {
    box([0.088, 0.0172, 0.012], IVORY, [KX, keyY(i), 0.109], undefined, `whiteKey${i}`);
  }
  const shine = bucket();
  for (let i = 0; i < KEY_N - 1; i++) {
    const note = (i + 3) % 7; // key 0 is F
    if ([0, 1, 3, 4, 5].includes(note)) {
      const y = keyY(i) + KP / 2;
      box([0.047, 0.0105, 0.013], EBONY, [-0.1815, y, 0.121], undefined, `blackKey${i}`);
      shine.box([0.04, 0.003, 0.0008], [-0.1815, y + 0.001, 0.1278]);
    }
  }
  shine.flush(SHINE, undefined, "blackKeyShine");

  // ornamented front panel + plaque
  const ORNAMENT = makeOrnament();
  plane(0.064, 0.44, ORNAMENT, [-0.2555, MID_Y, TZ + 0.002], [0, 0, 1], undefined, "ornamentPanel");
  plane(0.06, 0.024, makePlaque(), [-0.2555, 0.434, TZ + 0.0035], [0, 0, 1], undefined, "plaque");

  // ================================================================ TREBLE GRILLE (outer end, -X)
  frameYZ(T0 - 0.0005, 0.005, MID_Y, 0, 0.205, 0.082, 0.006, GILT);
  plane(0.152, 0.398, makeGrille(), [T0 - 0.002, MID_Y, 0], [-1, 0, 0], undefined, "grille");

  // ================================================================ TREBLE TOP: registers + rosette
  const ROSETTE = makeRosette();
  box([0.13, 0.003, 0.05], GILT, [-0.19, H + 0.0015, 0.055], undefined, "registerPlate");
  rockers(-0.19, H + 0.003, 0.055, 5, 0.026);
  disc(0.032, ROSETTE, [-0.195, H + 0.0025, -0.04], [0, 1, 0], [0, 0, -1], "rosetteTreble");

  // ================================================================ BASS KEYS (front, +Z)
  const BTN = makeButton(false);
  const BTNC = makeButton(true);
  box([0.1, 0.44, 0.004], PLATE, [0.225, MID_Y, BZ + 0.002], undefined, "bassPlate");
  frameYZ(0, 0, 0, 0, 0.1, 0.1, 0.01, GILT); // placeholder removed below (zero-length bars are harmless)
  box([0.108, 0.004, 0.006], GILT, [0.225, 0.2335 + 0.2465 - 0.0, BZ + 0.003]);
  box([0.108, 0.004, 0.006], GILT, [0.225, 0.0135, BZ + 0.003]);
  box([0.004, 0.452, 0.006], GILT, [0.173, MID_Y, BZ + 0.003]);
  box([0.004, 0.452, 0.006], GILT, [0.277, MID_Y, BZ + 0.003]);

  const btnBody = bucket();
  const btnCap = bucket();
  const btnCapC = bucket();
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r < 20; r++) {
      const x = 0.18375 + c * 0.0165;
      const y = MID_Y + (r - 9.5) * 0.0195;
      btnBody.add(new THREE.CylinderGeometry(0.0058, 0.0064, 0.008, 8).rotateX(Math.PI / 2), [x, y, BZ + 0.008]);
      const cap = new THREE.CircleGeometry(0.0054, 10);
      (r % 3 === 1 && c === 2 ? btnCapC : btnCap).add(cap, [x, y, BZ + 0.0123]);
    }
  }
  btnBody.flush(BTN_BODY, undefined, "bassButtons");
  btnCap.flush("#ffffff", BTN, "bassButtonCaps");
  btnCapC.flush("#ffffff", BTNC, "bassMarkerCaps");

  // bass top: small register bar
  box([0.08, 0.003, 0.04], GILT, [0.225, H + 0.0015, 0.04], undefined, "bassRegisterPlate");
  rockers(0.225, H + 0.003, 0.04, 3, 0.026);
  disc(0.026, ROSETTE, [0.225, H + 0.0025, -0.04], [0, 1, 0], [0, 0, -1], "rosetteBassTop");

  // ================================================================ BASS END (+X): medallion + air valve
  frameYZ(B1 + 0.0005, 0.005, MID_Y, 0, 0.205, 0.074, 0.005, GILT);
  box([0.003, 0.4, 0.144], PLATE, [B1 + 0.0015, MID_Y, 0], undefined, "bassEndPanel");
  disc(0.062, ROSETTE, [B1 + 0.0035, MID_Y, 0], [1, 0, 0], undefined, "rosetteBassEnd");
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 12), GOLD, { at: [B1 + 0.002, 0.425, 0.045], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.012, 10), CHROME, { at: [B1 + 0.008, 0.425, 0.045], dir: [1, 0, 0] });
  b.part(new THREE.SphereGeometry(0.0085, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), ROCK_A, {
    at: [B1 + 0.014, 0.425, 0.045],
    dir: [1, 0, 0],
  });

  // ================================================================ BACK: pads, shoulder straps, hand strap
  box([0.15, 0.3, 0.004], LEATHER, [-0.195, MID_Y, -TZ - 0.002], undefined, "treblePad");
  box([0.1, 0.3, 0.004], LEATHER, [0.225, MID_Y, -BZ - 0.002], undefined, "bassPad");

  const strap = (xs: number, xe: number) => {
    const xsList = [xs, -0.112, -0.095, 0.0, 0.14, 0.168, xe];
    const zList = [-0.1025, -0.1025, -0.0905, -0.0905, -0.0905, -0.0925, -0.0925];
    const yAt = (x: number) => 0.455 + ((0.035 - 0.455) * (x - xs)) / (xe - xs);
    const pts: V[] = xsList.map((x, i) => [x, yAt(x), zList[i]]);
    const path = catmull(pts);
    b.sweep(path, () => [0.017, 0.0025], { section: "box", up: [0, 0, -1], color: LEATHER, caps: "flat" });
    for (const s of [-1, 1]) {
      b.sweep(path, () => [0.0009, 0.0003], {
        section: "box",
        up: [0, 0, -1],
        color: STITCH,
        caps: "flat",
        shift: [s * 0.0125, 0.0027],
      });
    }
    const ang = (Math.atan2(0.035 - 0.455, xe - xs) * 180) / Math.PI;
    const sx = xs + (xe - xs) * 0.1;
    box([0.012, 0.038, 0.006], GOLD, [sx, yAt(sx), -0.1055], [0, 0, ang]);
    box([0.04, 0.014, 0.008], GILT, [xs, 0.468, -0.1035]);
    box([0.04, 0.014, 0.008], GILT, [xe, 0.03, -0.0935]);
  };
  strap(-0.17, 0.2);
  strap(-0.22, 0.255);

  // bass hand strap loop
  const loop = catmull([
    [0.225, 0.12, -0.094],
    [0.225, 0.126, -0.119],
    [0.225, 0.24, -0.129],
    [0.225, 0.354, -0.119],
    [0.225, 0.36, -0.094],
  ]);
  b.sweep(loop, () => [0.0035, 0.026], { section: "box", up: [1, 0, 0], color: LEATHER, caps: "flat" });
  box([0.056, 0.012, 0.007], GILT, [0.225, 0.12, -0.0955]);
  box([0.056, 0.012, 0.007], GILT, [0.225, 0.36, -0.0955]);

  // ================================================================ JEWEL STUDS
  for (const g of gems) {
    glow(b.part(new THREE.SphereGeometry(0.0055, 6, 4), g.c, { at: g.at, name: "gem" }), 0.5);
  }

  return b.root;
}
