import * as THREE from "three";
import { createBuilder, polyline, svg } from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A stylized Slavic folk-art diorama of a crooked log hut perched on two expressive chicken legs, with painted windows, carved trim, a steep roof, chimney, and magical folkloric details.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const DARK = "#24151a";
  const BARK = "#60351f";
  const LOG = "#9b5d35";
  const LOG_LIGHT = "#c68148";
  const ROOF = "#482331";
  const ROOF_LIGHT = "#713446";
  const GOLD = "#e0a53e";
  const CREAM = "#f0d38b";
  const RED = "#b83d35";
  const BLUE = "#315e65";
  const GREEN = "#3f704d";

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: the hut is carried by two slightly crooked, readable chicken legs.

  const root = b.joint("hutRoot", {
    at: [0, 0.67, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const legL = b.chain(
    "legL",
    polyline([
      [0.34, 0.66, 0],
      [0.39, 0.39, 0.035],
      [0.31, 0.14, 0.075],
    ]),
    {
      parent: root,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.31, 0, 0.075],
    },
  );

  const legR = b.chain(
    "legR",
    polyline([
      [-0.34, 0.66, 0],
      [-0.39, 0.39, 0.035],
      [-0.31, 0.14, 0.075],
    ]),
    {
      parent: root,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.31, 0, 0.075],
    },
  );

  b.sweep(legL, [0.105, 0.072], {
    color: LOG,
    section: { ngon: 6 },
    caps: "round",
  });

  b.sweep(legR, [0.105, 0.072], {
    color: LOG,
    section: { ngon: 6 },
    caps: "round",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Reusable primitive helpers.

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    bone: any = root,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    bone: any = root,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 1.04, height, 8), color, {
      at,
      bone,
      rotation,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    bone: any = root,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    bone: any = root,
  ) => b.capsule(a, z, radius, { color, bone });

  // ---------------------------------------------------------------------------------------------------------------
  // Feet: three broad toes and a rear spur on each leg.

  const addChickenFoot = (x: number, side: number, z: number) => {
    const ankle: [number, number, number] = [x, 0.11, z];
    rod(ankle, [x + side * 0.14, 0.035, z + 0.12], 0.034, CREAM);
    rod(ankle, [x + side * 0.025, 0.035, z + 0.17], 0.034, CREAM);
    rod(ankle, [x - side * 0.115, 0.035, z + 0.115], 0.034, CREAM);
    rod([x, 0.125, z - 0.015], [x - side * 0.12, 0.045, z - 0.10], 0.028, GOLD);

    // Dark little joints make the feet feel carved rather than tubular.
    sphere(0.044, [x, 0.12, z], GOLD);
    sphere(0.025, [x + side * 0.14, 0.035, z + 0.12], DARK);
    sphere(0.025, [x + side * 0.025, 0.035, z + 0.17], DARK);
    sphere(0.025, [x - side * 0.115, 0.035, z + 0.115], DARK);
  };

  addChickenFoot(0.31, 1, 0.075);
  addChickenFoot(-0.31, -1, 0.075);

  // Knee bands and little feather collars.
  for (const s of [-1, 1]) {
    cylinder(0.118, 0.055, [s * 0.385, 0.41, 0.035], GOLD, root, [0, 0, Math.PI / 2]);
    b.spike([s * 0.385, 0.49, 0.035], [0, 1, 0], 0.12, 0.045, {
      color: LOG_LIGHT,
      bone: s > 0 ? legL.joints[0] : legR.joints[0],
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The cabin: chunky horizontal logs with projecting end-grains.

  box([1.43, 0.72, 0.93], [0, 1.16, 0], BARK);

  for (let y = 0.84; y <= 1.49; y += 0.135) {
    box([1.56, 0.078, 0.98], [0, y, 0], LOG);
    box([1.61, 0.048, 0.072], [0, y + 0.018, 0.515], DARK);
    box([1.61, 0.048, 0.072], [0, y + 0.018, -0.515], DARK);

    // Bright end-grain disks, like painted folk-art rosettes.
    cylinder(0.043, 0.012, [0.79, y, 0], LOG_LIGHT, root, [Math.PI / 2, 0, 0]);
    cylinder(0.043, 0.012, [-0.79, y, 0], LOG_LIGHT, root, [Math.PI / 2, 0, 0]);
  }

  // Corner posts and carved sill.
  box([0.13, 0.82, 0.13], [0.69, 1.17, 0.46], DARK);
  box([0.13, 0.82, 0.13], [-0.69, 1.17, 0.46], DARK);
  box([0.13, 0.82, 0.13], [0.69, 1.17, -0.46], DARK);
  box([0.13, 0.82, 0.13], [-0.69, 1.17, -0.46], DARK);
  box([1.52, 0.09, 1.03], [0, 0.77, 0], GOLD);

  // ---------------------------------------------------------------------------------------------------------------
  // Door and windows.

  box([0.34, 0.54, 0.045], [0, 1.13, 0.485], DARK);
  box([0.275, 0.45, 0.018], [0, 1.15, 0.515], RED);
  box([0.21, 0.37, 0.012], [0, 1.15, 0.529], "#74302d");
  sphere(0.025, [0.105, 1.16, 0.55], GOLD);
  box([0.43, 0.06, 0.07], [0, 1.43, 0.55], GOLD);

  const window = svg(
    `<svg viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#315e65"/>
      <path d="M50 0V100M0 50H100" stroke="#e1a33b" stroke-width="9"/>
      <path d="M10 10L39 39M90 10L61 39M10 90L39 61M90 90L61 61" stroke="#b83d35" stroke-width="8"/>
      <circle cx="50" cy="50" r="10" fill="#f0d38b"/>
    </svg>`,
    { size: 128 },
  );

  const placeWindow = (x: number, z: number, turn: [number, number, number]) => {
    box([0.39, 0.43, 0.055], [x, 1.27, z], DARK, root, turn);
    b.part(new THREE.PlaneGeometry(0.31, 0.34), "#ffffff", {
      at: [x, 1.27, z + (z > 0 ? 0.033 : -0.033)],
      bone: root,
      rotation: turn,
      texture: window,
    });
    box([0.48, 0.045, 0.07], [x, 1.51, z], GOLD, root, turn);
    box([0.48, 0.045, 0.07], [x, 1.03, z], GOLD, root, turn);
  };

  placeWindow(0.42, 0.49, [0, 0, 0]);
  placeWindow(-0.42, 0.49, [0, 0, 0]);
  placeWindow(0.5, -0.05, [0, 0, 0]);
  placeWindow(-0.5, -0.05, [0, 0, 0]);

  // ---------------------------------------------------------------------------------------------------------------
  // Steep four-sided roof, oversized eaves, and chimney.

  b.part(new THREE.ConeGeometry(1.04, 0.63, 4), ROOF, {
    at: [0, 1.84, 0],
    bone: root,
    rotation: [0, Math.PI / 4, 0],
    flat: true,
  });

  // Roof stripes emphasize the Slavic painted silhouette.
  for (const s of [-1, 1]) {
    box([0.055, 0.66, 1.16], [s * 0.36, 1.84, 0], ROOF_LIGHT, root, [0, 0, s * 0.52]);
  }

  box([1.31, 0.08, 1.22], [0, 1.57, 0], GOLD);
  box([1.16, 0.055, 1.09], [0, 1.62, 0], RED);

  box([0.19, 0.43, 0.19], [-0.36, 2.14, -0.10], DARK);
  box([0.24, 0.07, 0.24], [-0.36, 2.38, -0.10], GOLD);

  // Roof finial: a red wooden onion with a gold spear.
  sphere(0.095, [0, 2.18, 0], RED);
  cylinder(0.035, 0.28, [0, 2.38, 0], GOLD);
  b.spike([0, 2.51, 0], [0, 1, 0], 0.16, 0.045, { color: GOLD });

  // ---------------------------------------------------------------------------------------------------------------
  // Carved folk-art ornament: paired red-and-gold sun wheels under the eaves.

  const rosette = (x: number, z: number, side: number) => {
    cylinder(0.095, 0.025, [x, 1.585, z], GOLD, root, [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      rod(
        [x, 1.585, z],
        [x + Math.sin(a) * 0.125, 1.585 + Math.cos(a) * 0.125, z],
        0.014,
        RED,
      );
    }
    sphere(0.035, [x, 1.605, z], BLUE);
  };

  rosette(-0.54, 0.54, -1);
  rosette(0.54, 0.54, 1);
  rosette(-0.54, -0.54, -1);
  rosette(0.54, -0.54, 1);

  // Hanging carved charms below the roof.
  for (const x of [-0.6, -0.2, 0.2, 0.6]) {
    cylinder(0.018, 0.16, [x, 0.66, 0.51], GOLD);
    b.spike([x, 0.57, 0.51], [0, -1, 0], 0.13, 0.045, { color: RED });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // A pair of folk-art chickens peeking from the roof, a playful Baba-Yaga detail.

  const bird = (x: number, color: string) => {
    sphere(0.115, [x, 2.07, 0.25], color);
    sphere(0.082, [x, 2.20, 0.27], color);
    b.spike([x, 2.21, 0.345], [0, 0, 1], 0.10, 0.035, { color: GOLD });
    sphere(0.018, [x - 0.045, 2.225, 0.327], DARK);
    b.spike([x, 2.29, 0.27], [0, 1, 0], 0.09, 0.025, { color: RED });
    b.spike([x, 2.295, 0.27], [0.45, 0.6, 0], 0.075, 0.022, { color: RED });
    b.spike([x, 2.295, 0.27], [-0.45, 0.6, 0], 0.075, 0.022, { color: RED });
  };

  bird(-0.28, BLUE);
  bird(0.28, GREEN);

  // Small golden nail heads unify the painted, hand-made folk-art language.
  for (const x of [-0.63, -0.42, 0.42, 0.63]) {
    sphere(0.018, [x, 1.57, 0.54], GOLD);
    sphere(0.018, [x, 1.57, -0.54], GOLD);
  }

  return b.root;
}
