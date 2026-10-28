```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, offset } from "agentic-3js-builder";
import { countershade, mottle, spots, paint } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A stylized, Overwatch-flavoured kraken: indigo mantle with glowing runes, angry yellow eyes, a hooked beak on a hinged jaw, and eight spread tentacles with suckers, spikes and glowing tips.",
};

const INDIGO = "#3a2a9c";
const VIOLET = "#7a5cf0";
const BELLY = "#ff8fa8";
const CYAN = "#5ff4ff";
const HORN = "#f8cf5a";
const HORN_DK = "#b86a1e";
const DARK = "#1a1038";
const ORANGE = "#ff8a3d";
const SUCK = "#ffd9e2";
const SUCK_IN = "#c4547a";

const EYE = svg(
  `<svg viewBox="0 0 100 100">
  <defs><radialGradient id="i" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#fff59a"/><stop offset="1" stop-color="#ffb21e"/></radialGradient></defs>
  <ellipse cx="50" cy="50" rx="48" ry="44" fill="#1b1030"/>
  <ellipse cx="50" cy="50" rx="42" ry="38" fill="url(#i)"/>
  <ellipse cx="50" cy="52" rx="9" ry="29" fill="#120a24"/>
  <ellipse cx="38" cy="38" rx="7" ry="9" fill="#ffffff"/>
  <circle cx="62" cy="64" r="3.5" fill="#ffffff"/>
  <polygon points="0,0 100,0 100,16 0,44" fill="#3a2a9c" stroke="#1b1030" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="none" stroke="#5ff4ff" stroke-width="6"/>
  <circle cx="50" cy="50" r="22" fill="none" stroke="#5ff4ff" stroke-width="5"/>
  <path d="M50 8 L50 30 M50 70 L50 92 M8 50 L30 50 M70 50 L92 50" stroke="#5ff4ff" stroke-width="6" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="7" fill="#5ff4ff"/>
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const r = rng(11);

  // ---------- skeleton ----------
  const core = b.joint("core", { at: [0, 0.8, 0.1], role: "spine" });
  const spinePath = catmull([
    [0, 0.8, 0.1],
    [0, 1.5, 0.0],
    [0, 2.2, -0.3],
    [0, 2.9, -0.7],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: core,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const head = b.joint("head", {
    parent: spine.joints[1],
    at: [0, 1.3, 0.5],
    dir: [0, 0, 1],
    role: "head",
  });

  // ---------- coat ----------
  const coat = countershade(
    spots(mottle(INDIGO, VIOLET, { size: 0.45, seed: 3 }), "#8ff6ff", { size: 0.2, amount: 0.22, seed: 5 }),
    BELLY,
    { level: -0.4 },
  );
  const limbCoat = countershade(mottle(INDIGO, VIOLET, { size: 0.35, seed: 8 }), BELLY, { level: -0.5 });

  // ---------- mantle / body ----------
  const body = b.sweep(spine, [0.62, 0.9, 0.82, 0.42], { color: coat, sides: 10 });
  const skin = b.surface(body);

  // barnacles on the back
  for (const h of skin.scatter(16, { rng: rng(4), minDist: 0.25, filter: (h) => h.n.y > 0.2 }))
    b.stick(new THREE.ConeGeometry(0.05, 0.13, 5), "#efdcae", h, { embed: 0.3 });

  // dorsal crest spikes
  b.along(body, 6, (at) => {
    const k = 1 - Math.abs(at.t - 0.55) * 1.2;
    b.spike(at, at, 0.18 + 0.2 * k, 0.07, { color: ORANGE });
  });

  // side fins
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.8, 2.0, -0.25]);
    const sd = hit.at.x >= 0 ? 1 : -1;
    const outline: [number, number][] = [
      [0, -0.25],
      [0.6, -0.1],
      [1.05, 0.35],
      [0.95, 0.85],
      [0.5, 0.55],
      [0, 0.4],
    ];
    const at = hit.at.toArray() as [number, number, number];
    b.extrude(outline, { at, x: [sd, 0, 0], thickness: 0.05, bevel: 0.01, smoothing: 1, color: ORANGE, bone: spine.joints[1] });
    const inner = outline.map(([x, y]) => [x * 0.62 + 0.05, y * 0.6 + 0.05] as [number, number]);
    b.extrude(inner, {
      at: [at[0], at[1], at[2]],
      x: [sd, 0, 0],
      thickness: 0.075,
      smoothing: 1,
      color: "#ffc27a",
      bone: spine.joints[1],
    });
  }

  // runes
  for (const s of [1, -1]) {
    const hit = skin.nearest([s * 0.62, 2.25, 0.05]);
    glow(
      b.decal(skin, RUNE, {
        at: hit,
        size: [0.42, 0.42],
        mirror: s < 0,
        segments: 8,
      }),
      1.4,
    );
  }

  // ---------- face ----------
  for (const s of [1, -1]) {
    const eyeHit = skin.nearest([s * 0.42, 1.55, 1.0]);
    b.decal(skin, EYE, { at: eyeHit, size: [0.5, 0.5], mirror: s < 0, segments: 12 });
    const brow = skin.nearest([s * 0.42, 1.95, 0.95]);
    b.stick(new THREE.BoxGeometry(0.55, 0.09, 0.18), DARK, brow, { embed: 0.2, spin: s * 25 });
    const cheek = skin.nearest([s * 0.55, 1.2, 0.8]);
    b.stick(new THREE.ConeGeometry(0.07, 0.2, 5), HORN, cheek, { embed: 0.3 });
  }

  // beak: separate upper and lower jaw
  const p0 = skin.nearest([0, 1.1, 1.0]).at.toArray() as [number, number, number];
  const jaw = b.joint("jaw", {
    parent: head,
    at: [p0[0], p0[1] - 0.12, p0[2] - 0.05],
    aim: [p0[0], p0[1] - 0.12, p0[2] + 0.5],
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), DARK, {
    at: [p0[0], p0[1] - 0.12, p0[2] + 0.05],
    bone: head,
    scale: [1.1, 0.7, 1],
  });
  {
    const d = new THREE.Vector3(0, -0.7, 1).normalize();
    const c = new THREE.Vector3(...p0).addScaledVector(d, 0.2);
    b.part(new THREE.ConeGeometry(0.24, 0.55, 5), HORN, { at: c, dir: d, bone: head, flat: true });
    const t = new THREE.Vector3(...p0).addScaledVector(d, 0.22).add(new THREE.Vector3(0, 0.0, 0));
    b.part(new THREE.ConeGeometry(0.2, 0.3, 5), HORN_DK, { at: t.clone().addScaledVector(d, 0.05), dir: d, bone: head, flat: true });
    const d2 = new THREE.Vector3(0, 0.45, 1).normalize();
    const j = new THREE.Vector3(p0[0], p0[1] - 0.12, p0[2] - 0.05);
    b.part(new THREE.ConeGeometry(0.19, 0.45, 5), HORN, { at: j.clone().addScaledVector(d2, 0.16), dir: d2, bone: jaw, flat: true });
    b.part(new THREE.ConeGeometry(0.1, 0.2, 5), HORN_DK, { at: j.clone().addScaledVector(d2, 0.3), dir: d2, bone: jaw, flat: true });
  }

  // ---------- tentacles ----------
  const LOW: [number, number][] = [
    [0.45, 0.85],
    [1.1, 0.5],
    [1.8, 0.15],
    [2.5, 0.08],
    [3.1, 0.04],
  ];
  const HIGH: [number, number][] = [
    [0.45, 0.85],
    [1.1, 1.2],
    [1.7, 1.9],
    [2.1, 2.7],
    [1.8, 3.3],
  ];
  const raised = [1, 3, 4, 6];
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) * Math.PI) / 4;
    const hi = raised.includes(i);
    const list = hi ? HIGH : LOW;
    const sc = 0.92 + 0.16 * r();
    const wob = (i % 2 ? 1 : -1) * (hi ? 0.1 : 0.22);
    const pts = list.map(([d, y]) => {
      const aa = a + wob * (d - 0.5);
      return [Math.sin(aa) * d * sc, y, Math.cos(aa) * d * sc + 0.1] as [number, number, number];
    });
    const name = `tentacle${i + 1}`;
    const ch = b.chain(name, catmull(pts), { parent: core, count: 6, role: "tentacle" });
    const sw = b.sweep(ch, hi ? [0.3, 0.22, 0.14, 0.07, 0.03] : [0.3, 0.2, 0.12, 0.06, 0.025], {
      color: limbCoat,
      sectors: [[135, 225, "#ff9bb0"]],
      sides: 8,
    });
    for (let k = 0; k < 7; k++) {
      const t = 0.14 + k * 0.11;
      const h = sw.at(t, 180);
      const rr = Math.max(0.025, h.radius * 0.5);
      b.stick(new THREE.CylinderGeometry(rr, rr * 1.1, 0.03, 8), SUCK, h, { embed: 0.3 });
      b.stick(new THREE.CylinderGeometry(rr * 0.55, rr * 0.55, 0.045, 8), SUCK_IN, h, { embed: 0.3 });
    }
    for (const t of [0.2, 0.36, 0.52, 0.68]) {
      b.spike(sw.at(t, hi ? 0 : 0), sw.at(t, 0), 0.16 * (1 - t) + 0.06, 0.04 * (1 - t) + 0.015, { color: ORANGE });
    }
    const end = pts[pts.length - 1];
    glow(
      b.part(new THREE.SphereGeometry(0.06, 8, 6), CYAN, {
        at: [end[0], Math.max(end[1], 0.06), end[2]],
        bone: ch.joints[ch.joints.length - 1],
      }),
      1.8,
    );
    // spare mid-length glow dot
    const mid = sw.at(0.45, 0);
    glow(b.stick(new THREE.SphereGeometry(0.035, 6, 4), CYAN, mid, { embed: 0.3 }), 1.5);
  }

  // webbed skirt rim around tentacle roots
  b.sweep(
    catmull(
      Array.from({ length: 8 }, (_, i) => {
        const a = ((i + 0.5) * Math.PI) / 4 + 0.39;
        return [Math.sin(a) * 0.62, 0.95, Math.cos(a) * 0.62 + 0.1] as [number, number, number];
      }),
      { closed: true },
    ),
    0.09,
    { color: ORANGE, bone: core },
  );
  void offset;
  void paint;

  return b.root;
}
```