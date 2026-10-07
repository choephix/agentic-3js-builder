import * as THREE from "three";

export const meta = {
  name: "Fennec Fox",
  description: "A stylized fennec fox in a neutral rest pose, built from primitives with oversized ears, a bushy tail and a pale sand palette.",
};

export default function createFennecFox(): THREE.Object3D {
  const root = new THREE.Group();

  // Palette: one material per colour, shared across meshes.
  const fur = new THREE.MeshStandardMaterial({ color: 0xe2b27a, roughness: 0.92 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xf7e8cc, roughness: 0.9 });
  const tan = new THREE.MeshStandardMaterial({ color: 0xc98a52, roughness: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a1d15, roughness: 0.6 });
  const earInner = new THREE.MeshStandardMaterial({ color: 0xf2d9b0, roughness: 0.9 });

  const sphere = (
    r: number,
    mat: THREE.Material,
    pos: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0],
  ) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.rotation.set(...rot);
    root.add(m);
    return m;
  };

  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    mat: THREE.Material,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    root.add(m);
    return m;
  };

  const cone = (
    r: number,
    h: number,
    seg: number,
    mat: THREE.Material,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1],
  ) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.scale.set(...scale);
    root.add(m);
    return m;
  };

  // Body: a compact, slightly squashed barrel.
  sphere(1, fur, [0, 0.24, 0], [0.095, 0.1, 0.18]);

  // Cream chest and belly patch.
  sphere(1, cream, [0, 0.215, 0.13], [0.07, 0.07, 0.1]);
  sphere(1, cream, [0, 0.19, -0.02], [0.075, 0.05, 0.11]);

  // Head: a wide skull with a tapered muzzle.
  sphere(1, fur, [0, 0.33, 0.22], [0.1, 0.095, 0.105]);
  // Cream cheek fluff.
  sphere(1, cream, [-0.06, 0.305, 0.23], [0.05, 0.04, 0.06]);
  sphere(1, cream, [0.06, 0.305, 0.23], [0.05, 0.04, 0.06]);
  // Muzzle cone pointing +Z.
  cone(0.05, 0.14, 8, fur, [0, 0.305, 0.3], [Math.PI / 2, 0, 0]);
  // Cream muzzle tip.
  cone(0.028, 0.06, 8, cream, [0, 0.302, 0.355], [Math.PI / 2, 0, 0]);

  // Nose.
  sphere(0.018, dark, [0, 0.31, 0.37], [1.1, 0.9, 1]);

  // Eyes: small dark beads with a tiny highlight.
  sphere(0.014, dark, [-0.048, 0.36, 0.275]);
  sphere(0.014, dark, [0.048, 0.36, 0.275]);
  sphere(0.004, cream, [-0.043, 0.366, 0.287]);
  sphere(0.004, cream, [0.053, 0.366, 0.287]);

  // Ears: the fennec signature. Large, tall, slightly splayed and tilted back.
  const earBase: [number, number, number][] = [
    [-0.055, 0.44, 0.18],
    [0.055, 0.44, 0.18],
  ];
  earBase.forEach(([x, y, z], i) => {
    const side = i === 0 ? -1 : 1;
    cone(0.058, 0.2, 4, tan, [x, y, z], [-0.3, 0, side * 0.18], [0.75, 1, 0.35]);
    cone(0.04, 0.16, 4, earInner, [x * 1.0, y - 0.01, z + 0.012], [-0.3, 0, side * 0.18], [0.5, 1, 0.2]);
  });

  // Legs: slim and long, with dark paws.
  const legs: [number, number][] = [
    [-0.058, 0.11],
    [0.058, 0.11],
    [-0.058, -0.1],
    [0.058, -0.1],
  ];
  legs.forEach(([x, z]) => {
    cyl(0.022, 0.017, 0.17, 6, fur, [x, 0.085, z]);
    cyl(0.019, 0.019, 0.05, 6, tan, [x, 0.025, z]);
    sphere(0.026, dark, [x, 0.01, z + 0.012], [1, 0.45, 1.3]);
  });

  // Tail: a big bushy plume, carried low and curving up at the back.
  sphere(1, fur, [0, 0.29, -0.34], [0.058, 0.058, 0.19], [0.35, 0, 0]);
  // Cream underside of the tail.
  sphere(1, cream, [0, 0.265, -0.33], [0.03, 0.03, 0.15], [0.35, 0, 0]);
  // Dark tip.
  sphere(0.05, dark, [0, 0.36, -0.52], [0.9, 0.9, 1]);

  // Subtle whisker-like tufts at the back of the ears for character.
  cone(0.012, 0.05, 4, tan, [-0.035, 0.52, 0.12], [-0.4, 0, 0.1]);
  cone(0.012, 0.05, 4, tan, [0.035, 0.52, 0.12], [-0.4, 0, -0.1]);

  return root;
}
