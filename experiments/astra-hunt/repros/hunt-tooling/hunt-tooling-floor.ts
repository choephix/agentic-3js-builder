import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#cc3333" }));
  mesh.position.y = 0.505;
  root.add(mesh);
  return root;
}
