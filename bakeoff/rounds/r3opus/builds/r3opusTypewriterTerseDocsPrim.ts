import * as THREE from "three";
import { createBuilder, frame, paint, svg, bezier } from "../../../../src/index";

export const meta = {
  name: "Typewriter",
  description:
    "A stylized 1930s portable typewriter in teal enamel with gold pinstripes, chrome-ringed glass-top keys, a fan of typebars, red/black ribbon spools, a rubber platen and a sheet of typed paper.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  b.joint("root", { at: [0, 0, 0] });

  const BODY = "#2f7f74";
  const BODY_DARK = "#1d4f49";
  const GOLD = "#e0ae3c";
  const CHROME = "#cdd3db";
  const STEEL = "#8d95a0";
  const RUBBER = "#1b1b1f";
  const KEY = "#131317";
  const CREAM = "#f1e8d0";
  const RED = "#c7342f";

  // ---------- Body shell (side-profile extrude) ----------
  const bodyPaint = paint((_p, _n, s) =>
    (s[1] > 0.02 && s[1] < 0.0245) || (s[1] > 0.028 && s[1] < 0.0295) ? GOLD : BODY,
  );
  const body = b.extrude(
    [
      [-0.15, 0.012, "sharp"],
      [0.16, 0.012, "sharp"],
      [0.16, 0.04],
      [0.02, 0.105],
      [-0.03, 0.125],
      [-0.15, 0.125, "sharp"],
    ],
    { at: [0, 0, 0], thickness: 0.36, bevel: 0.008, smoothing: 1, color: bodyPaint, name: "body" },
  );

  // rubber feet
  for (const s of [1, -1])
    for (const zz of [0.12, -0.12])
      b.part(new THREE.CylinderGeometry(0.016, 0.018, 0.014, 8), RUBBER, { at: [s * 0.16, 0.007, zz] });

  // brand plaque on the front lip
  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 40">
      <rect x="2" y="2" width="236" height="36" rx="8" fill="${GOLD}"/>
      <rect x="8" y="7" width="224" height="26" rx="5" fill="#1a1a1a"/>
      <text x="120" y="29" font-family="Georgia, serif" font-weight="bold" font-size="24" letter-spacing="6" text-anchor="middle" fill="${GOLD}">ROYALE</text>
    </svg>`,
    { size: 512 },
  );
  b.decal(body, plaque, { at: [0, 0.0225, 0.162], dir: [0, 0, 1], size: [0.12, 0.019] });

  // script logos on the flanks
  const logo = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 56">
      <text x="130" y="40" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="40" text-anchor="middle" fill="${GOLD}">Royale</text>
      <rect x="20" y="46" width="220" height="5" fill="${GOLD}"/>
    </svg>`,
    { size: 512 },
  );
  for (const s of [1, -1])
    b.decal(body, logo, { at: [s * 0.18, 0.075, -0.07], dir: [s, 0, 0], size: [0.13, 0.028] });

  // ---------- Keyboard ----------
  const slopeY = (z: number) => 0.04 + (0.16 - z) * (0.065 / 0.14);
  const texCache = new Map<string, ReturnType<typeof svg>>();
  const keyTex = (label: string) => {
    let t = texCache.get(label);
    if (!t) {
      const fs = label.length > 1 ? 15 : 34;
      t = svg(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="32" fill="${KEY}"/>
          <circle cx="32" cy="32" r="26" fill="none" stroke="#3a3a42" stroke-width="3"/>
          <text x="32" y="${label.length > 1 ? 37 : 44}" font-family="Georgia, serif" font-weight="bold" font-size="${fs}" text-anchor="middle" fill="${CREAM}">${label}</text>
        </svg>`,
        { size: 64 },
      );
      texCache.set(label, t);
    }
    return t;
  };

  const key = (x: number, z: number, row: number, label: string) => {
    const base = slopeY(z);
    const top = base + 0.02 + row * 0.005;
    b.rod([x, base - 0.006, z], [x, top - 0.004, z], 0.0018, { color: STEEL, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.005, 12), KEY, { at: [x, top - 0.0025, z] });
    b.part(new THREE.TorusGeometry(0.009, 0.0014, 4, 14), CHROME, { at: [x, top - 0.001, z], rotation: [90, 0, 0] });
    b.part(new THREE.CircleGeometry(0.0078, 14), "#ffffff", {
      at: [x, top + 0.0006, z],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: keyTex(label),
    });
  };

  const rows: { z: number; keys: string; off: number }[] = [
    { z: 0.135, keys: "ZXCVBNM,.", off: 0.012 },
    { z: 0.108, keys: "ASDFGHJKL", off: 0.006 },
    { z: 0.081, keys: "QWERTYUIOP", off: 0 },
    { z: 0.054, keys: "1234567890", off: -0.006 },
  ];
  const SP = 0.027;
  rows.forEach((r, ri) => {
    const n = r.keys.length;
    for (let i = 0; i < n; i++) key((i - (n - 1) / 2) * SP + r.off, r.z, ri, r.keys[i]);
  });
  // shift keys
  for (const s of [1, -1]) key(s * 0.158, 0.135, 0, "SHIFT");

  // space bar
  b.capsule([-0.1, 0.056, 0.168], [0.1, 0.056, 0.168], 0.0065, { color: KEY, sides: 8 });
  for (const s of [1, -1]) b.rod([s * 0.085, 0.056, 0.166], [s * 0.085, 0.044, 0.142], 0.002, { color: CHROME, sides: 6 });

  // ---------- Typebar basket ----------
  const bc = new THREE.Vector3(0, 0.122, -0.09);
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 18, 1, false, -Math.PI / 2, Math.PI), BODY_DARK, {
    at: [bc.x, bc.y, bc.z],
  });
  b.part(new THREE.TorusGeometry(0.03, 0.004, 6, 16, Math.PI), CHROME, { at: [0, 0.131, -0.09], rotation: [90, 0, 0] });
  const BARS = 26;
  for (let i = 0; i < BARS; i++) {
    const phi = THREE.MathUtils.degToRad(-80 + (160 * i) / (BARS - 1));
    const d = new THREE.Vector3(Math.sin(phi), 0, Math.cos(phi));
    const a = bc.clone().add(d.clone().multiplyScalar(0.032)).setY(0.132);
    const o = bc.clone().add(d.clone().multiplyScalar(0.068)).setY(0.13);
    b.rod(a, o, 0.0016, { color: STEEL, sides: 4 });
    b.part(new THREE.BoxGeometry(0.004, 0.004, 0.008), KEY, { at: o, dir: [d.x, 0, d.z], axis: "z" });
  }

  // ---------- Ribbon spools ----------
  for (const s of [1, -1]) {
    const x = s * 0.12;
    const z = -0.045;
    b.part(new THREE.CylinderGeometry(0.036, 0.034, 0.01, 16), CHROME, { at: [x, 0.13, z] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 14), KEY, { at: [x, 0.137, z] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 14), RED, { at: [x, 0.141, z] });
    b.part(new THREE.TorusGeometry(0.035, 0.002, 4, 16), CHROME, { at: [x, 0.136, z], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.016, 8), CHROME, { at: [x, 0.143, z] });
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 6), RED, { at: [x, 0.152, z] });
    // ribbon run to the vibrator
    b.frustumBox([s * 0.09, 0.141, -0.058], [s * 0.017, 0.148, -0.075], [0.0015, 0.008], [0.0015, 0.008], {
      color: RED,
    });
  }
  b.part(new THREE.BoxGeometry(0.035, 0.012, 0.004), CHROME, { at: [0, 0.148, -0.075] });

  // ---------- Carriage ----------
  b.part(new THREE.BoxGeometry(0.46, 0.012, 0.05), CHROME, { at: [0, 0.131, -0.11] });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.012, 0.07, 0.075), BODY, { at: [s * 0.19, 0.168, -0.11] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.37, 16), RUBBER, { at: [0, 0.17, -0.11], dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.028, 10), RUBBER, {
      at: [s * 0.212, 0.17, -0.11],
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.032, 8), CHROME, { at: [s * 0.214, 0.17, -0.11], dir: [1, 0, 0] });
  }
  // margin stops on the rail
  for (const x of [-0.12, 0.13]) {
    b.part(new THREE.BoxGeometry(0.012, 0.01, 0.014), CHROME, { at: [x, 0.142, -0.095] });
    b.part(new THREE.BoxGeometry(0.008, 0.004, 0.01), RED, { at: [x, 0.148, -0.095] });
  }

  // paper bail with rollers
  b.rod([-0.16, 0.193, -0.088], [0.16, 0.193, -0.088], 0.0025, { color: CHROME, sides: 6 });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.014, 8), RUBBER, { at: [s * 0.06, 0.193, -0.088], dir: [1, 0, 0] });
    b.rod([s * 0.16, 0.193, -0.088], [s * 0.185, 0.18, -0.1], 0.0025, { color: CHROME, sides: 6 });
  }

  // paper scale in front of the platen
  let ticks = "";
  for (let i = 0; i <= 60; i++) {
    const x = 5 + i * 4.83;
    const h = i % 5 === 0 ? 8 : 4;
    ticks += `<rect x="${x.toFixed(1)}" y="0" width="2" height="${h}" fill="#222"/>`;
  }
  const scaleTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 12"><rect width="300" height="12" fill="${CREAM}"/>${ticks}<rect x="148" y="0" width="4" height="12" fill="${RED}"/></svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.012), "#ffffff", {
    at: [0, 0.172, -0.0785],
    dir: [0, 0.3, 1],
    axis: "z",
    texture: scaleTex,
  });

  // carriage return lever (typist's left)
  b.sweep(bezier([-0.19, 0.195, -0.09], [-0.215, 0.25, -0.075], [-0.235, 0.24, 0.0]), 0.0035, {
    color: CHROME,
    sides: 6,
  });
  b.part(new THREE.SphereGeometry(0.009, 8, 6), RUBBER, { at: [-0.235, 0.24, 0.008] });
  // line-space lever on the right
  b.capsule([0.19, 0.2, -0.1], [0.205, 0.215, -0.07], 0.003, { color: CHROME, sides: 6 });

  // ---------- Paper ----------
  const paperRoot = new THREE.Vector3(0, 0.198, -0.112);
  const dHat = new THREE.Vector3(0, 1, -0.35).normalize();
  const backN = new THREE.Vector3(0, dHat.z, -dHat.y);
  const tableAt = paperRoot.clone().add(dHat.clone().multiplyScalar(0.075)).add(backN.clone().multiplyScalar(0.008));
  b.part(new THREE.BoxGeometry(0.3, 0.15, 0.004), BODY, { at: tableAt, dir: [dHat.x, dHat.y, dHat.z] });
  b.part(new THREE.BoxGeometry(0.3, 0.006, 0.006), CHROME, {
    at: tableAt.clone().add(dHat.clone().multiplyScalar(0.075)),
    dir: [dHat.x, dHat.y, dHat.z],
  });

  const lines = [
    { t: "June 12, 1938", c: "#26262c", y: 48 },
    { t: "Dear friend,", c: "#26262c", y: 76 },
    { t: "The quick brown fox jumps", c: "#26262c", y: 98 },
    { t: "over the lazy dog. Every key", c: "#26262c", y: 112 },
    { t: "still sings with a bright", c: "#26262c", y: 126 },
    { t: "clack, and the bell rings at", c: "#26262c", y: 140 },
    { t: "the end of every line.", c: RED, y: 154 },
    { t: "Yours truly,", c: "#26262c", y: 182 },
    { t: "The quick brown fox_", c: "#26262c", y: 222 },
  ];
  const paperTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 240">
      <rect width="216" height="240" fill="#fbf7ec"/>
      <rect x="0" y="0" width="216" height="3" fill="#e9e1cc"/>
      ${lines
        .map(
          (l) =>
            `<text x="18" y="${l.y}" font-family="Courier New, Courier, monospace" font-weight="bold" font-size="10" fill="${l.c}">${l.t}</text>`,
        )
        .join("")}
    </svg>`,
    { size: 512 },
  );
  b.cards([frame([paperRoot.x, paperRoot.y, paperRoot.z], [dHat.x, dHat.y, dHat.z])], paperTex, {
    size: [0.21, 0.23],
    flow: [0, 0, 1],
  });

  return b.root;
}
