```ts
import * as THREE from "three";
import { createBuilder, rng, svg, stripes, paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Neon Vector 84",
  description: "A chunky 1980s synthwave arcade cabinet with a glowing screen, marquee, controls, coin door, neon trim, rivets, and retro side art.",
};

export default function build() {
  const b = createBuilder({ name: "neon-vector-84", detail: 1 });

  const INK = "#120b2b";
  const DEEP = "#211044";
  const PURPLE = "#54246f";
  const VIOLET = "#762f9d";
  const MAGENTA = "#f22996";
  const PINK = "#ff62c3";
  const CYAN = "#24e5e8";
  const BLUE = "#315bdb";
  const ORANGE = "#ff8d32";
  const YELLOW = "#ffd34d";
  const METAL = "#8b719c";
  const DARKMETAL = "#302445";
  const SCREENBLACK = "#05051b";
  const WHITE = "#fff1ff";

  const bodyPaint = stripes(
    "#41205e",
    ["#5b2678", "#722b91", "#3d2b76"],
    { size: 0.23, axis: "y", width: 0.18, wobble: 0.12, seed: 8 },
  );

  const sidePaint = paint((p, n) => {
    const band = Math.sin(p.y * 24 + p.z * 4) > 0.15;
    if (Math.abs(n.x) > 0.7) return band ? "#5c2479" : "#321d59";
    return "#41205e";
  });

  const screenTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#09145e"/>
          <stop offset="0.55" stop-color="#17105e"/>
          <stop offset="1" stop-color="#26052e"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="0">
          <stop stop-color="#ff267c"/><stop offset="0.5" stop-color="#ff9c32"/><stop offset="1" stop-color="#ff267c"/>
        </linearGradient>
      </defs>
      <rect width="320" height="190" fill="url(#bg)"/>
      <circle cx="160" cy="104" r="38" fill="#ff3b82" opacity=".92"/>
      <path d="M116 105 Q160 68 204 105 Q160 121 116 105" fill="#ffb445"/>
      <path d="M0 151 L320 151" stroke="#ff4fa7" stroke-width="3"/>
      <path d="M0 163 L320 163 M0 176 L320 176" stroke="#7c32cc" stroke-width="2"/>
      <g stroke="#3475f4" stroke-width="2" opacity=".9">
        <path d="M160 151 L32 190 M160 151 L75 190 M160 151 L115 190 M160 151 L205 190 M160 151 L245 190 M160 151 L288 190"/>
      </g>
      <g fill="#fff3c7">
        <circle cx="33" cy="32" r="1.8"/><circle cx="88" cy="49" r="1.4"/><circle cx="240" cy="28" r="1.6"/>
        <circle cx="285" cy="65" r="1.2"/><circle cx="211" cy="53" r="1.1"/><circle cx="142" cy="25" r="1.1"/>
      </g>
      <text x="160" y="42" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="#fff5ff" stroke="#ff229a" stroke-width="1">VECTOR</text>
      <text x="160" y="137" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#fff">HIGH SCORE 008400</text>
      <g stroke="#ff8bd4" stroke-width="1" opacity=".35">
        <path d="M0 8H320 M0 17H320 M0 26H320 M0 35H320 M0 44H320 M0 53H320 M0 62H320 M0 71H320 M0 80H320 M0 89H320 M0 98H320 M0 107H320 M0 116H320 M0 125H320 M0 134H320 M0 143H320 M0 152H320 M0 161H320 M0 170H320 M0 179H320"/>
      </g>
    </svg>
  `, { size: 512 });

  const marqueeTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 110">
      <defs>
        <linearGradient id="m" x2="0" y2="1">
          <stop stop-color="#ff52ba"/><stop offset=".45" stop-color="#7a2bd2"/><stop offset="1" stop-color="#21105a"/>
        </linearGradient>
      </defs>
      <rect width="420" height="110" rx="8" fill="url(#m)" stroke="#24e5e8" stroke-width="6"/>
      <path d="M12 83 Q90 13 164 70 T408 31" fill="none" stroke="#ffb13d" stroke-width="5" opacity=".9"/>
      <text x="210" y="66" text-anchor="middle" font-family="monospace" font-weight="bold" font-style="italic" font-size="47" fill="#fff4a8" stroke="#ff248f" stroke-width="4" paint-order="stroke">NEON VECTOR</text>
      <text x="210" y="94" text-anchor="middle" font-family="monospace" font-size="12" fill="#a6ffff">INSERT COIN • 1984 • INSERT COIN</text>
    </svg>
  `, { size: 512 });

  const controlTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 100">
      <rect width="320" height="100" fill="#160d35"/>
      <path d="M0 18H320 M0 82H320" stroke="#f22996" stroke-width="4"/>
      <path d="M15 55 L70 23 L125 55 L180 23 L235 55 L290 23" fill="none" stroke="#24e5e8" stroke-width="3"/>
      <text x="160" y="72" text-anchor="middle" font-family="monospace" font-size="14" fill="#ffd34d">PLAYER ONE // READY</text>
    </svg>
  `, { size: 256 });

  const coinTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170">
      <rect width="100" height="170" rx="8" fill="#090817" stroke="#7c5e93" stroke-width="4"/>
      <rect x="14" y="15" width="72" height="54" rx="5" fill="#2a1c44" stroke="#ff318e" stroke-width="3"/>
      <text x="50" y="39" text-anchor="middle" font-family="monospace" font-size="12" fill="#fff">COIN</text>
      <text x="50" y="56" text-anchor="middle" font-family="monospace" font-size="11" fill="#24e5e8">1 CREDIT</text>
      <circle cx="50" cy="107" r="23" fill="#e0a942" stroke="#fff0a0" stroke-width="3"/>
      <path d="M38 107 H62 M50 95 V119" stroke="#84521f" stroke-width="4"/>
      <rect x="27" y="140" width="46" height="8" rx="4" fill="#ff2d92"/>
    </svg>
  `, { size: 256 });

  const sideArt = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 430">
      <defs>
        <linearGradient id="s" x2="0" y2="1">
          <stop stop-color="#ff2f99"/><stop offset=".5" stop-color="#7130ca"/><stop offset="1" stop-color="#101d62"/>
        </linearGradient>
      </defs>
      <rect width="180" height="430" fill="url(#s)"/>
      <path d="M8 390 L80 28 L172 390" fill="none" stroke="#24e5e8" stroke-width="5"/>
      <path d="M25 360 L83 70 L155 360" fill="none" stroke="#ffb13d" stroke-width="4"/>
      <circle cx="89" cy="177" r="57" fill="#ff337f" opacity=".75"/>
      <circle cx="89" cy="177" r="42" fill="none" stroke="#fff06b" stroke-width="7"/>
      <path d="M28 282 Q90 225 151 282" fill="none" stroke="#fff" stroke-width="5"/>
      <text x="90" y="320" text-anchor="middle" transform="rotate(-12 90 320)" font-family="monospace" font-size="19" font-weight="bold" fill="#fff">NV-84</text>
      <g fill="#fff">
        <circle cx="30" cy="48" r="2"/><circle cx="141" cy="84" r="2"/><circle cx="37" cy="152" r="2"/><circle cx="146" cy="244" r="2"/>
      </g>
    </svg>
  `, { size: 384 });

  const base = b.part(
    new THREE.BoxGeometry(0.78, 0.22, 0.72),
    INK,
    { at: [0, 0.11, 0], name: "rubber_base", group: "cabinet" },
  );

  b.part(new THREE.BoxGeometry(0.72, 0.72, 0.68), bodyPaint, {
    at: [0, 0.56, -0.015],
    name: "lower_cabinet",
    group: "cabinet",
  });

  b.part(new THREE.BoxGeometry(0.72, 0.64, 0.55), bodyPaint, {
    at: [0, 1.22, -0.075],
    name: "upper_cabinet",
    group: "cabinet",
  });

  // Broad side cheeks create the characteristic wedge silhouette.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.055, 1.52, 0.7), sidePaint, {
      at: [s * 0.39, 0.91, -0.02],
      name: `side_cheek_${s}`,
      group: "cabinet",
    });
    b.part(new THREE.PlaneGeometry(0.64, 1.48), "#ffffff", {
      at: [s * 0.421, 0.91, -0.015],
      dir: [s, 0, 0],
      axis: "z",
      texture: sideArt,
      name: `side_art_${s}`,
      group: "side_art",
    });
  }

  // Rear crown and top cap.
  b.part(new THREE.BoxGeometry(0.72, 0.18, 0.56), VIOLET, {
    at: [0, 1.58, -0.08],
    name: "top_cap",
    group: "cabinet",
  });
  b.part(new THREE.BoxGeometry(0.82, 0.06, 0.66), INK, {
    at: [0, 1.69, -0.08],
    name: "top_shadow",
    group: "cabinet",
  });

  // Glowing marquee housing and face.
  b.part(new THREE.BoxGeometry(0.74, 0.25, 0.12), INK, {
    at: [0, 1.72, 0.22],
    name: "marquee_housing",
    group: "marquee",
  });
  const marquee = b.part(new THREE.PlaneGeometry(0.67, 0.175), WHITE, {
    at: [0, 1.72, 0.286],
    dir: [0, 0, 1],
    axis: "z",
    texture: marqueeTexture,
    name: "marquee_face",
    group: "marquee",
  });
  glow(marquee, 1.3);

  // Screen recess, bezel and glass.
  b.part(new THREE.BoxGeometry(0.62, 0.51, 0.075), INK, {
    at: [0, 1.29, 0.255],
    name: "screen_bezel",
    group: "screen",
  });
  b.part(new THREE.BoxGeometry(0.535, 0.405, 0.035), DARKMETAL, {
    at: [0, 1.29, 0.304],
    name: "screen_inner_frame",
    group: "screen",
  });
  const screen = b.part(new THREE.PlaneGeometry(0.505, 0.375), WHITE, {
    at: [0, 1.29, 0.326],
    dir: [0, 0, 1],
    axis: "z",
    texture: screenTexture,
    name: "crt_screen",
    group: "screen",
  });
  glow(screen, 1.8);

  // Screen corner bolts.
  for (const x of [-0.285, 0.285]) {
    for (const y of [1.075, 1.505]) {
      const bolt = b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 8), METAL, {
        at: [x, y, 0.345],
        dir: [0, 0, 1],
        name: "screen_bolt",
        group: "screen",
      });
      glow(bolt, 0.25);
    }
  }

  // Control deck and patterned front lip.
  b.part(new THREE.BoxGeometry(0.73, 0.17, 0.42), INK, {
    at: [0, 0.99, 0.34],
    name: "control_deck",
    group: "controls",
  });
  const controlFace = b.part(new THREE.PlaneGeometry(0.64, 0.19), WHITE, {
    at: [0, 1.045, 0.555],
    dir: [0, 0.26, 0.97],
    axis: "z",
    texture: controlTexture,
    name: "control_panel_art",
    group: "controls",
  });
  glow(controlFace, 0.35);

  b.part(new THREE.BoxGeometry(0.72, 0.12, 0.06), PURPLE, {
    at: [0, 0.91, 0.555],
    name: "control_front_lip",
    group: "controls",
  });

  // Joystick shaft, ball, and ring.
  b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.12, 10), METAL, {
    at: [-0.18, 1.14, 0.38],
    name: "joystick_shaft",
    group: "controls",
  });
  const stickBall = b.part(new THREE.SphereGeometry(0.085, 12, 8), MAGENTA, {
    at: [-0.18, 1.255, 0.38],
    name: "joystick_ball",
    group: "controls",
  });
  glow(stickBall, 1.2);
  const stickRing = b.part(new THREE.TorusGeometry(0.075, 0.012, 6, 16), CYAN, {
    at: [-0.18, 1.105, 0.38],
    rotation: [0, 0, 0],
    name: "joystick_ring",
    group: "controls",
  });
  glow(stickRing, 1.4);

  // Six arcade buttons, deliberately oversized and colorful.
  const buttonColors = [CYAN, PINK, YELLOW, CYAN, ORANGE, MAGENTA];
  const buttonPositions = [
    [0.03, 1.145, 0.40],
    [0.145, 1.145, 0.40],
    [0.26, 1.145, 0.40],
    [0.03, 1.145, 0.50],
    [0.145, 1.145, 0.50],
    [0.26, 1.145, 0.50],
  ] as const;

  buttonPositions.forEach((p, i) => {
    b.part(new THREE.CylinderGeometry(0.038, 0.045, 0.035, 12), INK, {
      at: [p[0], p[1] - 0.012, p[2]],
      name: `button_socket_${i}`,
      group: "controls",
    });
    const button = b.part(new THREE.SphereGeometry(0.038, 10, 6), buttonColors[i], {
      at: p,
      scale: [1, 0.55, 1],
      name: `button_${i}`,
      group: "controls",
    });
    glow(button, 1.25);
  });

  // Coin door and coin slot.
  b.part(new THREE.BoxGeometry(0.22, 0.36, 0.035), DARKMETAL, {
    at: [0, 0.49, 0.345],
    name: "coin_door",
    group: "coin_door",
  });
  const coinFace = b.part(new THREE.PlaneGeometry(0.19, 0.32), WHITE, {
    at: [0, 0.49, 0.366],
    dir: [0, 0, 1],
    axis: "z",
    texture: coinTexture,
    name: "coin_door_art",
    group: "coin_door",
  });
  glow(coinFace, 0.55);

  // Coin door screws.
  for (const x of [-0.095, 0.095]) {
    for (const y of [0.32, 0.66]) {
      b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 8), METAL, {
        at: [x, y, 0.39],
        dir: [0, 0, 1],
        name: "coin_screw",
        group: "coin_door",
      });
    }
  }

  // Neon vertical strips, screen frame, and base glow.
  const neon = (a: [number, number, number], c: [number, number, number], color: string, name: string) => {
    const part = b.rod(a, c, 0.012, { color, name, group: "neon" });
    glow(part, 2.2);
    return part;
  };

  neon([-0.425, 0.17, 0.36], [-0.425, 1.58, 0.36], CYAN, "left_neon_column");
  neon([0.425, 0.17, 0.36], [0.425, 1.58, 0.36], MAGENTA, "right_neon_column");
  neon([-0.33, 1.04, 0.37], [0.33, 1.04, 0.37], PINK, "control_neon");
  neon([-0.30, 1.55, 0.35], [0.30, 1.55, 0.35], CYAN, "screen_top_neon");
  neon([-0.30, 1.03, 0.35], [-0.30, 1.55, 0.35], MAGENTA, "screen_left_neon");
  neon([0.30, 1.03, 0.35], [0.30, 1.55, 0.35], CYAN, "screen_right_neon");
  neon([-0.34, 0.19, 0.37], [0.34, 0.19, 0.37], MAGENTA, "base_neon");

  // Decorative front rivets and warning stripes.
  for (const y of [0.24, 0.80, 1.61]) {
    for (const x of [-0.34, 0.34]) {
      const rivet = b.part(new THREE.SphereGeometry(0.014, 8, 6), METAL, {
        at: [x, y, 0.37],
        name: "front_rivet",
        group: "details",
      });
      glow(rivet, 0.3);
    }
  }

  for (let i = 0; i < 7; i++) {
    const x = -0.28 + i * 0.093;
    b.part(new THREE.BoxGeometry(0.045, 0.025, 0.012), i % 2 ? YELLOW : INK, {
      at: [x, 0.76, 0.378],
      rotation: [0, 0, -25],
      name: "warning_stripe",
      group: "details",
    });
  }

  // Small illuminated status indicators below the controls.
  for (const [x, color] of [[-0.09, CYAN], [0, YELLOW], [0.09, PINK]] as const) {
    const led = b.part(new THREE.SphereGeometry(0.014, 8, 6), color, {
      at: [x, 0.825, 0.385],
      name: "status_led",
      group: "details",
    });
    glow(led, 2.5);
  }

  // Four stout feet keep the cabinet exactly on the floor.
  for (const x of [-0.29, 0.29]) {
    for (const z of [-0.25, 0.25]) {
      b.part(new THREE.CylinderGeometry(0.055, 0.06, 0.09, 8), INK, {
        at: [x, 0.045, z],
        name: "rubber_foot",
        group: "base",
      });
    }
  }

  return b.root;
}
```