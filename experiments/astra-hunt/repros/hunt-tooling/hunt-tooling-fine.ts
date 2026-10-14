import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 1);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#cc3333" }));
  mesh.position.y = 0.5;
  root.add(mesh);
  return root;
}
