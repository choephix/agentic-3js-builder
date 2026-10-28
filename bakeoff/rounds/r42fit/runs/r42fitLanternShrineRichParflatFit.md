<!-- call: plan -->

```json
{
  "name": "Wayside Shrine of the Wind",
  "description": "A Genshin Impact style roadside shrine: a vermilion torii gate, a small stone-based wooden hokora shrine with offerings, stone lanterns and hanging paper lanterns, built as a stylized low-poly prop group.",
  "builderName": "waysideShrine",
  "size": [4.6, 3.6, 4.2],
  "layout": "Static prop group on a small stone plinth footprint. Front (+Z): a vermilion torii gate (two round pillars, kasagi top beam with upswept black ends, nuki tie beam, central plaque with gold emblem) at z=1.6. A flagstone path runs from the torii back to the shrine. Two stone toro lanterns flank the path at z=0.5 (x=+/-1.1), each with a glowing warm window. Behind at z=-1.2 stands the hokora: a stone base with steps, a wooden box with a double door, a teal-tiled hip roof with gold finials and a hanging shimeNawa rope with white paper shide. In front of the shrine steps sit offerings: a small wooden offering box with coin slot, sake bottle, fruit plate, a stack of mora coins, flowers in a vase. Two paper lanterns hang from the torii nuki and glow orange. Genshin look: clean saturated colours, warm vermilion against teal and cream, gold trim lines, cyan glowing anemo crystal floating above the shrine roof, small fabric ribbons with gold tassels. Bold chunky primitive shapes, details as small parts in their own colours.",
  "palette": {
    "vermilion": "#c8382c",
    "vermilionDark": "#8f2420",
    "blackLacquer": "#262229",
    "gold": "#f0c04a",
    "goldDark": "#b8862c",
    "cream": "#f4e8cc",
    "paper": "#fff1d0",
    "stone": "#a9a9a2",
    "stoneDark": "#7d7f7c",
    "stoneLight": "#c9c9c0",
    "moss": "#6f9a52",
    "wood": "#9a6a3e",
    "woodDark": "#6b4528",
    "roofTeal": "#3f8f8a",
    "roofTealDark": "#2c6866",
    "glowWarm": "#ffb955",
    "anemo": "#6ff2d0",
    "rope": "#d9c28a",
    "red": "#d8454a",
    "apple": "#e5534b",
    "orange": "#f19a3a",
    "sake": "#5a86c8",
    "flowerPink": "#f58fb0",
    "leaf": "#4f9a58",
    "ink": "#2b1d2f"
  },
  "mounts": {
    "ground": [0, 0, 0],
    "toriiCenter": [0, 0, 1.6],
    "toriiNukiY": [0, 2.3, 1.6],
    "toriiTop": [0, 3.1, 1.6],
    "pathStart": [0, 0.03, 1.3],
    "lanternL": [1.1, 0, 0.5],
    "lanternR": [-1.1, 0, 0.5],
    "shrineBase": [0, 0.35, -1.2],
    "shrineFloor": [0, 0.35, -1.2],
    "shrineRoofBase": [0, 1.75, -1.2],
    "roofPeak": [0, 2.55, -1.2],
    "offeringArea": [0, 0.35, -0.2],
    "crystal": [0, 3.1, -1.2]
  },
  "joints": [],
  "parts": [
    {
      "id": "torii",
      "builds": "Torii gate at z=1.6: two round tapered vermilion pillars (radius 0.17 at base, 0.14 top, height 2.9) on black lacquer base rings and stone footings; curved kasagi top beam (vermilion with black lacquer cap slab and upswept ends), shimaki below it, nuki tie beam through pillars with protruding ends, central gakuzuka plaque in blackLacquer with a gold emblem (small gold diamond plus ring), gold bands where beams meet pillars, and two hanging paper lanterns (paper colour with glowWarm emissive, ink stripes, gold caps and tassels) from the nuki at x=+/-0.8. Pillar span 3.0 m between centres (x=+/-1.5).",
      "box": [[-2.3, 0, 1.3], [2.3, 3.6, 1.9]],
      "attaches": "Stands on ground at toriiCenter; path begins at pathStart just behind it.",
      "joints": [],
      "floor": true,
      "budget": 220
    },
    {
      "id": "pathAndLanterns",
      "builds": "Flagstone path from z=1.3 to z=-0.6 made of irregular stone slabs in stone/stoneLight with moss tufts at edges; low grass-moss border patches; two stone toro lanterns at lanternL and lanternR: stepped hex base, tapered post with ring, hex firebox with glowing glowWarm windows on the path-facing sides, wide hex roof with upturned corners in stoneDark, gem-shaped finial (hoju) in stoneLight, moss on roof tops.",
      "box": [[-2.0, 0, -0.7], [2.0, 1.7, 1.3]],
      "attaches": "Path meets torii at pathStart and shrine steps at offeringArea; lanterns stand on ground at lanternL/lanternR.",
      "joints": [],
      "floor": true,
      "budget": 190
    },
    {
      "id": "shrineBody",
      "builds": "Hokora small shrine centred at shrineBase (width 1.6, depth 1.3): two-tier stone plinth with front steps (3 steps) toward +Z, wooden raised veranda with woodDark posts and railing, wooden cabin walls (wood with woodDark framing beams), a double door in vermilionDark with gold studs and gold handles and a central gold emblem, small side windows with lattice, and gold trim along the base line. Cream cloth banners hang left and right of door.",
      "box": [[-1.0, 0, -1.9], [1.0, 1.75, -0.5]],
      "attaches": "Plinth on ground at shrineBase; roof sits on shrineRoofBase; steps end at offeringArea.",
      "joints": [],
      "floor": true,
      "budget": 190
    },
    {
      "id": "shrineRoof",
      "builds": "Hip roof from shrineRoofBase upward: wide overhanging eaves in roofTeal with curved upswept corners, layered tile rows as thin ridge strips in roofTealDark, gold ridge cap and gold fish-shaped finials (onigawara) at both ridge ends, gold trim along the eaves edge, woodDark rafter ends underneath, a hanging shimeNawa rope of rope colour across the front with cream paper shide zigzags and small gold bells, and a floating anemo crystal at crystal mount: faceted double-pyramid in anemo glowing, with three small orbiting shards and a ring of tiny swirl leaf shapes in leaf colour.",
      "box": [[-1.4, 1.75, -2.1], [1.4, 3.6, -0.3]],
      "attaches": "Rests on shrineBody at shrineRoofBase (y=1.75); crystal floats at crystal mount.",
      "joints": [],
      "floor": false,
      "budget": 150
    },
    {
      "id": "offerings",
      "builds": "Offerings in front of the shrine steps around offeringArea (z from -0.1 to 0.3): wooden saisen offering box (wood with woodDark slats, slotted top, gold trim, red rope bell cord with gold bell hanging from a small post), a plate of fruit (apples in apple, oranges in orange, small leaf parts) on a cream dish, a sake bottle with sake colour and cream label with ink mark, two sake cups, stack of gold mora coins with a hole detail, a small vase with flowerPink blooms and leaf stems, two candles with glowWarm flames, and a few scattered paper cranes in cream and red.",
      "box": [[-0.9, 0, -0.5], [0.9, 1.0, 0.5]],
      "attaches": "Sits on ground or the lowest shrine step at offeringArea; between lanterns and the shrine steps.",
      "joints": [],
      "floor": true,
      "budget": 130
    }
  ]
}
```

<!-- call: torii -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTorii({ b, P }: any) {
  const Z = 1.6;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, 0, rz] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 12) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  for (const s of [1, -1]) {
    const x = s * 1.5;
    // stone footing, lacquer ring, pillar
    cyl(0.28, 0.32, 0.14, P.stone, x, 0.07, Z, 8);
    cyl(0.2, 0.22, 0.12, P.stoneDark, x, 0.2, Z, 8);
    cyl(0.2, 0.2, 0.2, P.blackLacquer, x, 0.32, Z, 12);
    cyl(0.14, 0.17, 2.9, P.vermilion, x, 1.55, Z, 12);
    cyl(0.145, 0.145, 0.04, P.gold, x, 2.15, Z, 12);
    cyl(0.145, 0.145, 0.04, P.gold, x, 2.45, Z, 12);
    // nuki protruding end
    box(0.14, 0.22, 0.2, P.vermilionDark, s * 2.05, 2.3, Z);
    // upswept kasagi ends
    box(0.7, 0.2, 0.34, P.vermilion, s * 2.0, 3.12, Z, s * 0.22);
    box(0.7, 0.07, 0.4, P.blackLacquer, s * 2.0, 3.26, Z, s * 0.22);
    box(0.2, 0.1, 0.4, P.gold, s * 2.32, 3.38, Z, s * 0.22);
    // pillar top cap
    cyl(0.16, 0.16, 0.05, P.blackLacquer, x, 3.02, Z, 12);
  }
  // kasagi
  box(3.4, 0.22, 0.36, P.vermilion, 0, 3.1, Z);
  box(3.4, 0.07, 0.42, P.blackLacquer, 0, 3.25, Z);
  box(3.4, 0.03, 0.43, P.gold, 0, 3.205, Z);
  // shimaki
  box(3.2, 0.14, 0.26, P.vermilionDark, 0, 2.93, Z);
  // nuki
  box(3.9, 0.2, 0.18, P.vermilion, 0, 2.3, Z);
  box(3.9, 0.03, 0.19, P.gold, 0, 2.2, Z);
  // gakuzuka plaque
  box(0.12, 0.35, 0.12, P.vermilionDark, 0, 2.62, Z);
  box(0.62, 0.48, 0.08, P.blackLacquer, 0, 2.62, Z + 0.06);
  box(0.68, 0.54, 0.05, P.gold, 0, 2.62, Z + 0.03);
  const d = b.part(new THREE.OctahedronGeometry(0.13), P.gold, { at: [0, 2.62, Z + 0.12], scale: [0.8, 1, 0.3] });
  b.part(new THREE.TorusGeometry(0.19, 0.016, 5, 16), P.gold, { at: [0, 2.62, Z + 0.105] });
  // paper lanterns
  for (const s of [1, -1]) {
    const x = s * 0.8;
    b.rod([x, 2.2, Z], [x, 1.85, Z], 0.012, P.ink);
    cyl(0.1, 0.1, 0.04, P.gold, x, 1.83, Z, 8);
    glow(b.part(new THREE.SphereGeometry(0.2, 10, 8), P.paper, { at: [x, 1.6, Z], scale: [1, 1.15, 1] }), 1.2);
    for (let i = 0; i < 3; i++)
      b.part(new THREE.TorusGeometry(0.2 - Math.abs(i - 1) * 0.0, 0.008, 4, 14), P.ink, {
        at: [x, 1.6 + (i - 1) * 0.12, Z], rotation: [90, 0, 0], scale: [1 - (i === 1 ? 0 : 0.06), 1 - (i === 1 ? 0 : 0.06), 1],
      });
    cyl(0.1, 0.1, 0.04, P.gold, x, 1.36, Z, 8);
    b.rod([x, 1.36, Z], [x, 1.18, Z], 0.01, P.red);
    b.part(new THREE.ConeGeometry(0.04, 0.12, 6), P.gold, { at: [x, 1.12, Z], rotation: [180, 0, 0] });
  }
  return d;
}
```

<!-- call: pathAndLanterns -->

```ts
import * as THREE from "three";
import { rng, glow } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

export function buildPathAndLanterns({ b, P, M }: any) {
  const R = rng(11);
  const G = (glowKit ?? glow) as any;
  const hex = (r0: number, r1: number, h: number) => new THREE.CylinderGeometry(r1, r0, h, 6);

  // flagstone path
  const stones = [P.stone, P.stoneLight, P.stoneDark];
  let z = 1.25;
  let row = 0;
  while (z > -0.55) {
    const d = 0.2 + R() * 0.1;
    const n = row % 2 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const w = 0.78 / n;
      const x = -0.39 + w * (i + 0.5) + (R() - 0.5) * 0.04;
      const g = new THREE.BoxGeometry(w * 0.9, 0.05, d * 0.88);
      b.part(g, stones[Math.floor(R() * 2)], { at: [x, 0.022, z - d / 2], rotation: [0, (R() - 0.5) * 14, 0], flat: true });
    }
    z -= d;
    row++;
  }

  // moss tufts and border patches
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1;
    const zz = 1.25 - R() * 1.8;
    const x = side * (0.5 + R() * 0.25);
    const s = 0.06 + R() * 0.07;
    b.part(new THREE.SphereGeometry(s, 6, 4), i % 3 ? P.moss : P.leaf, { at: [x, s * 0.35, zz], scale: [1.4, 0.5, 1.2], flat: true });
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.05, 7), P.moss, { at: [s * (1.45 + i * 0.12), 0.02, 1.0 - i * 0.5], scale: [1, 1, 1.4], flat: true });
    }
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry(0.025, 0.12, 4), P.leaf, { at: [s * (0.62 + i * 0.03), 0.06, 0.9 - i * 0.4 + R() * 0.1] });
    }
  }

  // toro lanterns
  const lantern = (cx: number, cz: number, s: number) => {
    const at = (y: number): [number, number, number] => [cx, y, cz];
    b.part(hex(0.3, 0.3, 0.08), P.stoneDark, { at: at(0.04), flat: true });
    b.part(hex(0.22, 0.24, 0.08), P.stone, { at: at(0.12), flat: true });
    b.part(hex(0.1, 0.07, 0.62), P.stoneLight, { at: at(0.47), flat: true });
    b.part(hex(0.13, 0.13, 0.05), P.stone, { at: at(0.43), flat: true });
    b.part(hex(0.2, 0.26, 0.08), P.stone, { at: at(0.82), flat: true });
    // firebox
    b.part(hex(0.19, 0.19, 0.3), P.stoneLight, { at: at(1.01), flat: true });
    // windows on path-facing side (toward x=0) and front/back
    for (const [dx, dz, ry] of [[-s, 0, 90], [0, 1, 0], [0, -1, 0]] as number[][]) {
      const w = b.part(new THREE.BoxGeometry(0.13, 0.17, 0.02), P.glowWarm, { at: [cx + dx * 0.165, 1.01, cz + dz * 0.165], rotation: [0, ry, 0] });
      G(w, 1.5);
      b.part(new THREE.BoxGeometry(0.015, 0.17, 0.025), P.stoneDark, { at: [cx + dx * 0.168, 1.01, cz + dz * 0.168], rotation: [0, ry, 0] });
    }
    G(b.part(hex(0.15, 0.15, 0.18), P.glowWarm, { at: at(1.01) }), 1.2);
    // roof
    b.part(hex(0.4, 0.3, 0.06), P.stoneDark, { at: at(1.19), flat: true });
    b.part(new THREE.ConeGeometry(0.42, 0.22, 6), P.stoneDark, { at: at(1.33), flat: true });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.05, 0.1, 4), P.stoneDark, { at: [cx + Math.sin(a) * 0.42, 1.24, cz + Math.cos(a) * 0.42], rotation: [Math.cos(a) * -30, 0, Math.sin(a) * 30] });
    }
    b.part(new THREE.SphereGeometry(0.07, 6, 4), P.moss, { at: [cx + 0.1, 1.38, cz - 0.05], scale: [1.5, 0.5, 1.3] });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.moss, { at: [cx - 0.12, 1.36, cz + 0.1], scale: [1.4, 0.5, 1.2] });
    // hoju finial
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 6), P.stone, { at: at(1.46) });
    b.part(new THREE.SphereGeometry(0.07, 6, 5), P.stoneLight, { at: at(1.55), scale: [1, 1.3, 1] });
    b.part(new THREE.ConeGeometry(0.04, 0.1, 6), P.stoneLight, { at: at(1.66) });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.moss, { at: [cx + 0.2, 0.18, cz + 0.12], scale: [1.4, 0.5, 1.2] });
  };
  lantern(M.lanternL[0], M.lanternL[2], 1);
  lantern(M.lanternR[0], M.lanternR[2], -1);
}
```

<!-- call: shrineRoof -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildShrineRoof({ b, J, P, M }: Ctx) {
  const cx = 0, cz = -1.2, y0 = 1.75;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const glowMat = (p: any, s: number) => {
    const m = p.mesh.material as THREE.MeshStandardMaterial;
    const c = m.clone();
    c.emissive.copy(c.color);
    c.emissiveIntensity = s;
    p.mesh.material = c;
    return p;
  };

  // Hip roof: stacked pyramid tiers (square cone frustums, rotated 45deg) with overhang
  const tiers = 5;
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers;
    const rBot = 1.75 - t * 1.1;
    const rTop = 1.75 - (t + 1 / tiers) * 1.1;
    const h = 0.2;
    const g = new THREE.CylinderGeometry(rTop * 0.72 + 0.02, rBot * 0.72, h, 4, 1);
    g.rotateY(Math.PI / 4);
    g.scale(1, 1, 0.78);
    b.part(g, i % 2 ? P.roofTealDark : P.roofTeal, { at: [cx, y0 + 0.12 + i * 0.17, cz] });
  }
  // eaves slab and gold trim
  const eave = new THREE.CylinderGeometry(1.2, 1.3, 0.1, 4);
  eave.rotateY(Math.PI / 4);
  eave.scale(1, 1, 0.78);
  b.part(eave, P.roofTeal, { at: [cx, y0 + 0.05, cz] });
  const trimY = y0 + 0.01;
  box(2.52, 0.04, 0.05, P.gold, 0, trimY, cz + 1.03 * 0.78 + 0.1 - 0.1 + 0.0);
  const hw = 0.92 * 1.3 * 0.78;
  box(1.82 * 1.38, 0.04, 0.05, P.gold, 0, trimY, cz + hw - 0.05);
  box(1.82 * 1.38, 0.04, 0.05, P.gold, 0, trimY, cz - hw + 0.05);
  // tile rows on front face strips
  for (let i = 0; i < 4; i++) {
    const w = 2.2 - i * 0.45;
    box(w, 0.025, 0.04, P.roofTealDark, 0, y0 + 0.12 + i * 0.17, cz + 0.88 - i * 0.2);
    box(w, 0.025, 0.04, P.roofTealDark, 0, y0 + 0.12 + i * 0.17, cz - 0.88 + i * 0.2);
  }
  // upswept corners
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.4, 0.07, 0.12, P.roofTeal, sx * 1.3, y0 + 0.13, cz + sz * 0.95, [0, sx * sz * 0.7, sx * -0.35]);
    b.part(new THREE.ConeGeometry(0.06, 0.2, 5), P.gold, { at: [sx * 1.42, y0 + 0.22, cz + sz * 0.98] });
  }
  // rafter ends underneath
  for (let i = 0; i < 11; i++) {
    const x = -1.2 + i * 0.24;
    box(0.07, 0.07, 0.16, P.woodDark, x, y0 - 0.02, cz + 0.93);
    box(0.07, 0.07, 0.16, P.woodDark, x, y0 - 0.02, cz - 0.93);
  }
  for (let i = 0; i < 6; i++) {
    const z = cz - 0.7 + i * 0.28;
    box(0.16, 0.07, 0.07, P.woodDark, 1.27, y0 - 0.02, z);
    box(0.16, 0.07, 0.07, P.woodDark, -1.27, y0 - 0.02, z);
  }
  // ridge
  const ry = y0 + 0.12 + tiers * 0.17 + 0.03;
  box(0.9, 0.1, 0.12, P.gold, 0, ry, cz);
  for (const s of [1, -1]) {
    // onigawara fish finial: body, fin, tail curl
    box(0.14, 0.2, 0.12, P.gold, s * 0.5, ry + 0.12, cz);
    b.part(new THREE.ConeGeometry(0.08, 0.28, 5), P.gold, { at: [s * 0.52, ry + 0.34, cz], rotation: [0, 0, -s * 25] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.ink, { at: [s * 0.5, ry + 0.16, cz + 0.065] });
    box(0.05, 0.12, 0.1, P.goldDark, s * 0.5, ry + 0.02, cz);
  }
  b.part(new THREE.SphereGeometry(0.07, 6, 5), P.gold, { at: [0, ry + 0.1, cz] });

  // shimenawa across front
  const zf = cz + 1.0;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -1.0 + i * 0.25;
    pts.push(new THREE.Vector3(x, y0 - 0.1 - Math.sin((i / 8) * Math.PI) * 0.12, zf + 0.1));
  }
  b.sweep(pts, 0.035, { color: P.rope, bone: undefined as any });
  for (let i = 1; i < 8; i++) {
    const p = pts[i];
    for (let k = 0; k < 2; k++) {
      box(0.07, 0.09, 0.012, P.cream, p.x + (k ? 0.04 : -0.04), p.y - 0.1 - k * 0.08, p.z, [0, 0, k ? 20 : -20]);
      box(0.07, 0.09, 0.012, P.paper, p.x + (k ? -0.04 : 0.04), p.y - 0.2 - k * 0.07, p.z, [0, 0, k ? -20 : 20]);
    }
  }
  for (const x of [-0.5, 0, 0.5]) {
    const p = pts[Math.round((x + 1) / 0.25)];
    b.part(new THREE.SphereGeometry(0.045, 6, 5), P.gold, { at: [p.x, p.y - 0.05, p.z + 0.05] });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 5), P.goldDark, { at: [p.x, p.y + 0.0, p.z + 0.04] });
  }

  // anemo crystal
  const [qx, qy, qz] = M.crystal;
  const cy = qy + 0.2;
  const up = new THREE.ConeGeometry(0.2, 0.42, 6);
  const dn = new THREE.ConeGeometry(0.2, 0.3, 6);
  glowMat(b.part(up, P.anemo, { at: [qx, cy + 0.21, qz] }), 1.6);
  glowMat(b.part(dn, P.anemo, { at: [qx, cy - 0.15, qz], rotation: [180, 0, 0] }), 1.6);
  glowMat(b.part(new THREE.OctahedronGeometry(0.07), "#e8fff8", { at: [qx, cy, qz] }), 2);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    glowMat(b.part(new THREE.OctahedronGeometry(0.06), P.anemo, { at: [qx + Math.cos(a) * 0.42, cy + 0.1 + i * 0.1, qz + Math.sin(a) * 0.42] }), 1.4);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const g = new THREE.SphereGeometry(0.04, 5, 3);
    g.scale(1.6, 0.35, 0.8);
    b.part(g, P.leaf, {
      at: [qx + Math.cos(a) * 0.6, cy - 0.1 + Math.sin(a * 2) * 0.05 + R() * 0.04, qz + Math.sin(a) * 0.6],
      rotation: [0, -(a * 180) / Math.PI + 90, 20],
    });
  }
}
```

<!-- call: offerings -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildOfferings({ b, P, M }: any) {
  const R = rng(5);
  const ox = M.offeringArea[0], oz = M.offeringArea[2] + 0.1;
  // Place a part at offset from the offering area, resting on baseY.
  const put = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, rot?: number[]) =>
    b.part(geo, color, { at: [ox + x, y, oz + z], ...(rot ? { rotation: rot } : {}) });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---- Saisen offering box (left, x=-0.5)
  const bx = -0.5, bz = 0;
  put(box(0.5, 0.05, 0.4), P.woodDark, bx, 0.025, bz);
  put(box(0.46, 0.34, 0.36), P.wood, bx, 0.22, bz);
  for (let i = 0; i < 5; i++) put(box(0.02, 0.32, 0.01), P.woodDark, bx - 0.19 + i * 0.095, 0.22, bz + 0.185);
  put(box(0.54, 0.04, 0.44), P.woodDark, bx, 0.41, bz);
  put(box(0.3, 0.012, 0.04), P.ink, bx, 0.432, bz + 0.02);
  put(box(0.5, 0.02, 0.01), P.gold, bx, 0.32, bz + 0.186);
  put(box(0.5, 0.02, 0.01), P.gold, bx, 0.12, bz + 0.186);
  for (const s of [-1, 1]) put(box(0.04, 0.02, 0.4), P.gold, bx + s * 0.25, 0.41, bz);
  // post with bell cord
  put(cyl(0.025, 0.03, 0.9, 6), P.woodDark, bx - 0.22, 0.45, bz - 0.15);
  put(box(0.14, 0.03, 0.04), P.woodDark, bx - 0.15, 0.88, bz - 0.15);
  put(cyl(0.015, 0.015, 0.4, 6), P.red, bx - 0.08, 0.68, bz - 0.15);
  put(sph(0.04, 8, 6), P.gold, bx - 0.08, 0.46, bz - 0.15);
  put(box(0.02, 0.01, 0.02), P.goldDark, bx - 0.08, 0.455, bz - 0.15);
  put(cyl(0.012, 0.025, 0.08, 6), P.red, bx - 0.08, 0.7 - 0.28 + 0.02 - 0.2, bz - 0.15);

  // ---- Fruit plate (centre-left)
  const fx = 0.05, fz = 0.12;
  put(cyl(0.2, 0.12, 0.04, 12), P.cream, fx, 0.02, fz);
  put(new THREE.TorusGeometry(0.19, 0.012, 4, 14), P.gold, fx, 0.042, fz, [90, 0, 0]);
  const fruits: [number, number, string][] = [[-0.07, 0, P.apple], [0.07, 0.02, P.apple], [0, -0.08, P.orange], [0.01, 0.09, P.orange], [-0.1, 0.09, P.apple]];
  fruits.forEach(([x, z, c], i) => {
    put(sph(0.06, 8, 6), c, fx + x, 0.1, fz + z);
    put(box(0.01, 0.03, 0.01), P.woodDark, fx + x, 0.165, fz + z);
    put(new THREE.ConeGeometry(0.02, 0.06, 4), P.leaf, fx + x + 0.03, 0.17, fz + z, [0, i * 50, 70]);
  });

  // ---- Sake bottle & cups
  const sx = 0.5, sz = -0.05;
  put(cyl(0.06, 0.07, 0.26, 10), P.sake, sx, 0.13, sz);
  put(cyl(0.03, 0.06, 0.07, 10), P.sake, sx, 0.295, sz);
  put(cyl(0.022, 0.03, 0.12, 8), P.sake, sx, 0.38, sz);
  put(cyl(0.026, 0.026, 0.03, 8), P.red, sx, 0.455, sz);
  put(box(0.08, 0.1, 0.01), P.cream, sx, 0.13, sz + 0.07);
  put(box(0.025, 0.05, 0.005), P.ink, sx, 0.13, sz + 0.076);
  put(box(0.1, 0.012, 0.012), P.gold, sx, 0.2, sz + 0.07);
  for (const [cx, cz] of [[0.36, 0.14], [0.5, 0.18]]) {
    put(cyl(0.04, 0.025, 0.045, 8), P.cream, cx, 0.0225, cz);
    put(cyl(0.03, 0.03, 0.004, 8), P.sake, cx, 0.044, cz);
  }

  // ---- Mora stack
  const mx = 0.75, mz = 0.2;
  for (let i = 0; i < 6; i++) {
    put(cyl(0.065, 0.065, 0.02, 12), i % 2 ? P.goldDark : P.gold, mx + (i % 2) * 0.006, 0.01 + i * 0.021, mz);
  }
  put(box(0.03, 0.005, 0.03), P.ink, mx, 0.128, mz);
  put(cyl(0.065, 0.065, 0.02, 12), P.gold, mx + 0.16, 0.01, mz + 0.06, [0, 0, 0]);
  put(box(0.03, 0.004, 0.03), P.ink, mx + 0.16, 0.022, mz + 0.06);

  // ---- Vase with flowers
  const vx = 0.25, vz = -0.2;
  put(cyl(0.05, 0.06, 0.04, 8), P.cream, vx, 0.02, vz);
  put(sph(0.08, 8, 6), P.roofTeal, vx, 0.12, vz);
  put(cyl(0.04, 0.05, 0.08, 8), P.roofTealDark, vx, 0.2, vz);
  put(box(0.17, 0.012, 0.012), P.gold, vx, 0.12, vz + 0.078);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2, h = 0.34 + R() * 0.1;
    const fxp = vx + Math.cos(a) * 0.05, fzp = vz + Math.sin(a) * 0.05;
    put(cyl(0.006, 0.006, h - 0.2, 4), P.leaf, vx + Math.cos(a) * 0.025, 0.2 + (h - 0.2) / 2, vz + Math.sin(a) * 0.025);
    put(sph(0.04, 6, 4), P.flowerPink, fxp, h + 0.02, fzp);
    put(sph(0.016, 5, 4), P.gold, fxp, h + 0.05, fzp);
    put(new THREE.ConeGeometry(0.02, 0.07, 4), P.leaf, vx + Math.cos(a) * 0.05, 0.27, vz + Math.sin(a) * 0.05, [0, 0, 60]);
  }

  // ---- Candles
  for (const cx of [-0.15, 0.7]) {
    const cz = cx < 0 ? -0.3 : -0.25;
    put(cyl(0.05, 0.055, 0.015, 8), P.goldDark, cx, 0.0075, cz);
    put(cyl(0.025, 0.025, 0.16, 8), P.cream, cx, 0.095, cz);
    put(cyl(0.004, 0.004, 0.025, 4), P.ink, cx, 0.188, cz);
    glow(put(new THREE.ConeGeometry(0.018, 0.06, 6), P.glowWarm, cx, 0.225, cz), 1.6);
  }

  // ---- Paper cranes
  const crane = (x: number, z: number, c: string, r: number) => {
    put(new THREE.ConeGeometry(0.03, 0.1, 4), c, x, 0.04, z, [90, r, 0]);
    for (const s of [-1, 1]) put(box(0.07, 0.004, 0.05), c, x + s * 0.04 * Math.cos(r * 0.0175), 0.06, z, [0, r, s * 25]);
    put(new THREE.ConeGeometry(0.01, 0.04, 4), c, x, 0.075, z + 0.05, [60, 0, 0]);
  };
  crane(-0.25, 0.25, P.cream, 20);
  crane(0.4, 0.3, P.red, -30);
  crane(-0.8, 0.28, P.cream, 60);
}
```

<!-- call: shrineBody -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildShrineBody({ b, J, P, M }: any) {
  const CX = M.shrineBase[0], CZ = M.shrineBase[2];
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [CX + x, y, CZ + z], ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [CX + x, y, CZ + z] });
  const GOLD = P.gold;

  // two-tier plinth (top at y=0.35)
  box(1.9, 0.18, 1.5, P.stoneDark, 0, 0.09, 0);
  box(1.7, 0.17, 1.3, P.stone, 0, 0.265, -0.0);
  box(1.72, 0.03, 1.32, P.stoneLight, 0, 0.355, 0);
  // moss on plinth edge
  box(0.5, 0.03, 0.1, P.moss, -0.6, 0.19, 0.76);
  box(0.4, 0.03, 0.1, P.moss, 0.65, 0.19, 0.76);
  // gold trim on base line
  box(1.74, 0.025, 1.34, GOLD, 0, 0.37, 0);

  // 3 steps toward +Z (end z = -0.2 world => local z ~1.0)
  for (let i = 0; i < 3; i++) {
    const h = 0.1 * (3 - i);
    box(0.7, h, 0.2, i % 2 ? P.stoneLight : P.stone, 0, h / 2, 0.75 + 0.17 * (i + 1) - 0.0);
    box(0.7, 0.02, 0.2, P.stoneLight, 0, h + 0.01, 0.75 + 0.17 * (i + 1));
  }
  // side stone cheek blocks
  for (const s of [1, -1]) box(0.12, 0.28, 0.6, P.stoneDark, s * 0.42, 0.14, 1.0);

  // veranda floor
  box(1.6, 0.06, 1.25, P.wood, 0, 0.4, 0);
  for (let i = -3; i <= 3; i++) box(0.01, 0.005, 1.25, P.woodDark, i * 0.22, 0.432, 0);
  box(1.64, 0.05, 0.05, P.woodDark, 0, 0.4, 0.64);

  // posts & railing at front/sides
  const rail = 0.7;
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    cyl(0.04, 0.04, 1.3, 8, P.woodDark, sx * 0.76, 0.43 + 0.65, sz * 0.58);
    cyl(0.055, 0.055, 0.03, 8, GOLD, sx * 0.76, 0.43 + 1.31, sz * 0.58);
  }
  for (const sx of [1, -1]) {
    box(0.04, 0.04, 1.18, P.woodDark, sx * 0.76, 0.43 + 0.3, 0);
    box(0.05, 0.04, 1.18, P.woodDark, sx * 0.76, 0.43 + 0.28 + 0.01, 0);
    for (let i = -2; i <= 2; i++) box(0.025, 0.28, 0.025, P.woodDark, sx * 0.76, 0.43 + 0.15, i * 0.24);
  }
  // front railing gaps at the door side
  for (const sx of [1, -1]) {
    box(0.4, 0.04, 0.04, P.woodDark, sx * 0.55, 0.43 + 0.3, 0.58);
    for (let i = 0; i < 3; i++) box(0.025, 0.28, 0.025, P.woodDark, sx * (0.4 + i * 0.15), 0.43 + 0.15, 0.58);
  }
  box(1.5, 0.04, 0.04, P.woodDark, 0, 0.43 + 0.3, -0.58);

  // cabin walls
  const wy0 = 0.43, wh = 1.3 - 0.0;
  box(1.3, wh, 1.0, P.wood, 0, wy0 + wh / 2, -0.05);
  // vertical plank lines on front
  for (let i = -5; i <= 5; i++) if (Math.abs(i * 0.11) > 0.29) box(0.008, wh - 0.1, 0.01, P.woodDark, i * 0.11, wy0 + wh / 2, 0.455);
  // framing beams
  for (const sx of [1, -1]) {
    box(0.1, wh + 0.02, 0.1, P.woodDark, sx * 0.65, wy0 + wh / 2, 0.45);
    box(0.1, wh + 0.02, 0.1, P.woodDark, sx * 0.65, wy0 + wh / 2, -0.55);
  }
  box(1.36, 0.08, 0.1, P.woodDark, 0, wy0 + wh - 0.04, 0.46);
  box(1.36, 0.06, 0.1, P.woodDark, 0, wy0 + 0.03, 0.46);
  box(1.36, 0.07, 0.1, P.woodDark, 0, wy0 + 0.85, 0.46);
  box(1.36, 0.08, 0.1, P.woodDark, 0, wy0 + wh - 0.04, -0.56);
  box(1.0, 0.04, 0.02, GOLD, 0, wy0 + wh - 0.1, 0.52);
  // lintel gold line
  box(1.3, 0.02, 0.02, GOLD, 0, wy0 + 0.065, 0.52);

  // door frame
  box(0.64, 0.9, 0.04, P.woodDark, 0, wy0 + 0.5, 0.5);
  // doors
  for (const s of [1, -1]) {
    box(0.29, 0.82, 0.04, P.vermilionDark, s * 0.15, wy0 + 0.5, 0.53);
    // panels
    box(0.2, 0.28, 0.012, P.vermilion, s * 0.15, wy0 + 0.72, 0.555);
    box(0.2, 0.28, 0.012, P.vermilion, s * 0.15, wy0 + 0.3, 0.555);
    // gold studs grid
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      const sph = b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: [CX + s * (0.07 + c * 0.16), wy0 + 0.17 + r * 0.19 + (r > 1 ? 0.0 : 0), CZ + 0.56] });
    }
    // handle
    cyl(0.02, 0.02, 0.012, 8, GOLD, s * 0.03, wy0 + 0.5, 0.56).rotation.x = Math.PI / 2;
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), P.goldDark, { at: [CX + s * 0.04, wy0 + 0.46, CZ + 0.565] });
  }
  box(0.012, 0.82, 0.02, GOLD, 0, wy0 + 0.5, 0.56);
  // central emblem: ring + diamond
  b.part(new THREE.TorusGeometry(0.07, 0.01, 5, 12), GOLD, { at: [CX, wy0 + 0.6, CZ + 0.57] });
  box(0.07, 0.07, 0.014, GOLD, 0, wy0 + 0.6, 0.575, [0, 0, 45 * Math.PI / 180]);
  box(0.03, 0.03, 0.016, P.anemo, 0, wy0 + 0.6, 0.58, [0, 0, 45 * Math.PI / 180]);
  // door step
  box(0.7, 0.03, 0.1, P.woodDark, 0, wy0 + 0.015, 0.56);

  // side windows with lattice
  for (const s of [1, -1]) {
    const x = s * 0.66;
    box(0.04, 0.4, 0.4, P.woodDark, x, wy0 + 0.75, -0.05);
    box(0.03, 0.34, 0.34, P.ink, x + s * 0.005, wy0 + 0.75, -0.05);
    for (let i = -1; i <= 1; i++) {
      box(0.03, 0.34, 0.02, P.woodDark, x + s * 0.02, wy0 + 0.75, -0.05 + i * 0.1);
      box(0.03, 0.02, 0.34, P.woodDark, x + s * 0.02, wy0 + 0.75 + i * 0.1, -0.05);
    }
    box(0.05, 0.03, 0.46, GOLD, x + s * 0.01, wy0 + 0.545, -0.05);
  }

  // cream banners beside door
  for (const s of [1, -1]) {
    const x = s * 0.48;
    cyl(0.012, 0.012, 0.5, 6, P.goldDark, x, wy0 + 0.95, 0.56).rotation.z = Math.PI / 2;
    box(0.2, 0.5, 0.012, P.cream, x, wy0 + 0.66, 0.565);
    box(0.2, 0.03, 0.014, P.vermilion, x, wy0 + 0.89, 0.568);
    box(0.2, 0.025, 0.014, GOLD, x, wy0 + 0.43, 0.568);
    box(0.06, 0.2, 0.014, P.ink, x, wy0 + 0.64, 0.57);
    box(0.1, 0.03, 0.014, P.ink, x, wy0 + 0.7, 0.57);
    b.part(new THREE.ConeGeometry(0.02, 0.07, 6), GOLD, { at: [CX + x, wy0 + 0.36, CZ + 0.57], rotation: [Math.PI, 0, 0] });
    for (const t of [-1, 1]) b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at: [CX + x + t * 0.09, wy0 + 0.62, CZ + 0.58] });
  }

  // eave plate on top of cabin for roof seating
  box(1.5, 0.05, 1.2, P.woodDark, 0, 1.7, -0.05);
  box(1.52, 0.02, 1.22, GOLD, 0, 1.73, -0.05);
  // back posts
  const g = rng(3);
  for (let i = 0; i < 3; i++) box(0.12 + g() * 0.05, 0.02, 0.1, P.moss, -0.7 + i * 0.7, 0.36, 0.6);
}
```

<!-- call: fit-shrineBody -->

Only the steps and their cheek blocks stuck out past the +z face, so I pulled them back onto the plinth front; everything else is unchanged. The steps are now 0.14 m deep and the cheek blocks sit at z = 0.4, so nothing in my part passes local z = 0.7.

<<<<<<< SEARCH
    box(0.7, h, 0.2, i % 2 ? P.stoneLight : P.stone, 0, h / 2, 0.75 + 0.17 * (i + 1) - 0.0);
    box(0.7, 0.02, 0.2, P.stoneLight, 0, h + 0.01, 0.75 + 0.17 * (i + 1));
=======
    box(0.7, h, 0.14, i % 2 ? P.stoneLight : P.stone, 0, h / 2, 0.5 + 0.07 * i + 0.07);
    box(0.7, 0.02, 0.14, P.stoneLight, 0, h + 0.01, 0.5 + 0.07 * i + 0.07);
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (const s of [1, -1]) box(0.12, 0.28, 0.6, P.stoneDark, s * 0.42, 0.14, 1.0);
=======
  for (const s of [1, -1]) box(0.12, 0.28, 0.6, P.stoneDark, s * 0.42, 0.14, 0.4);
>>>>>>> REPLACE

<!-- call: fit-shrineRoof -->

Edits below pull the over-reaching pieces back inside the box. The shimenawa rope and shide now sit on the roof's front slope instead of hanging below the eave. The corner swoops, finials and rafter ends are pulled in. The crystal is lowered so its top stays under y = 3.6.

<<<<<<< SEARCH
  const zf = cz + 1.0;
=======
  const zf = cz + 0.84;
>>>>>>> REPLACE
<<<<<<< SEARCH
    pts.push(new THREE.Vector3(x, y0 - 0.1 - Math.sin((i / 8) * Math.PI) * 0.12, zf + 0.1));
=======
    pts.push(new THREE.Vector3(x, y0 + 0.4 - Math.sin((i / 8) * Math.PI) * 0.08, zf));
>>>>>>> REPLACE
<<<<<<< SEARCH
      box(0.07, 0.09, 0.012, P.cream, p.x + (k ? 0.04 : -0.04), p.y - 0.1 - k * 0.08, p.z, [0, 0, k ? 20 : -20]);
      box(0.07, 0.09, 0.012, P.paper, p.x + (k ? -0.04 : 0.04), p.y - 0.2 - k * 0.07, p.z, [0, 0, k ? -20 : 20]);
=======
      box(0.07, 0.09, 0.012, P.cream, p.x + (k ? 0.04 : -0.04), p.y - 0.07 - k * 0.01, p.z, [0, 0, k ? 20 : -20]);
      box(0.07, 0.09, 0.012, P.paper, p.x + (k ? -0.04 : 0.04), p.y - 0.12 - k * 0.01, p.z, [0, 0, k ? -20 : 20]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.4, 0.07, 0.12, P.roofTeal, sx * 1.3, y0 + 0.13, cz + sz * 0.95, [0, sx * sz * 0.7, sx * -0.35]);
    b.part(new THREE.ConeGeometry(0.06, 0.2, 5), P.gold, { at: [sx * 1.42, y0 + 0.22, cz + sz * 0.98] });
=======
    box(0.3, 0.07, 0.1, P.roofTeal, sx * 1.15, y0 + 0.13, cz + sz * 0.8, [0, sx * sz * 0.7, sx * -0.35]);
    b.part(new THREE.ConeGeometry(0.06, 0.2, 5), P.gold, { at: [sx * 1.27, y0 + 0.22, cz + sz * 0.84] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.07, 0.07, 0.16, P.woodDark, x, y0 - 0.02, cz + 0.93);
    box(0.07, 0.07, 0.16, P.woodDark, x, y0 - 0.02, cz - 0.93);
=======
    box(0.07, 0.07, 0.16, P.woodDark, x, y0 + 0.04, cz + 0.8);
    box(0.07, 0.07, 0.16, P.woodDark, x, y0 + 0.04, cz - 0.8);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.16, 0.07, 0.07, P.woodDark, 1.27, y0 - 0.02, z);
    box(0.16, 0.07, 0.07, P.woodDark, -1.27, y0 - 0.02, z);
=======
    box(0.16, 0.07, 0.07, P.woodDark, 1.27, y0 + 0.04, z);
    box(0.16, 0.07, 0.07, P.woodDark, -1.27, y0 + 0.04, z);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const cy = qy + 0.2;
=======
  const cy = qy;
>>>>>>> REPLACE