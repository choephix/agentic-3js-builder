// Lantern: a small prop in plain three.js, no SDK and no skeleton. Samples only have to return an Object3D.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, TorusGeometry } from "three";
import type { BufferGeometry } from "three";

export const meta = {
  name: "Lantern",
  description: "A plain three.js prop: no SDK, no joints.",
  builtBy: "SDK author (Claude Opus 5.5)",
};

export default function build() {
  const lantern = new Group();
  const add = (geometry: BufferGeometry, color: string, x: number, y: number, z: number) => {
    const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04 }));
    mesh.position.set(x, y, z);
    lantern.add(mesh);
    return mesh;
  };
  const iron = "#2f2b28";
  add(new BoxGeometry(0.2, 0.03, 0.2), iron, 0, 0.015, 0);
  add(new BoxGeometry(0.15, 0.2, 0.15), "#f2c14e", 0, 0.13, 0);
  for (const x of [-0.08, 0.08])
    for (const z of [-0.08, 0.08]) add(new BoxGeometry(0.02, 0.22, 0.02), iron, x, 0.14, z);
  add(new BoxGeometry(0.2, 0.025, 0.2), iron, 0, 0.26, 0);
  add(new ConeGeometry(0.13, 0.1, 4), iron, 0, 0.32, 0).rotation.y = Math.PI / 4;
  add(new CylinderGeometry(0.012, 0.012, 0.03, 8), iron, 0, 0.385, 0);
  add(new TorusGeometry(0.035, 0.008, 8, 20), iron, 0, 0.43, 0);
  return lantern;
}
