import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const index = geometry.index!;
  for (let i = 0; i < index.count; i += 3) {
    const b = index.getX(i + 1);
    index.setX(i + 1, index.getX(i + 2));
    index.setX(i + 2, b);
  }
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#cc3333" }));
  mesh.position.y = 0.5;
  root.add(mesh);
  return root;
}
