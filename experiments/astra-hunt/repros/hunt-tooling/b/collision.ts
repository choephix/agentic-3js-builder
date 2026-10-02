import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial({ color: "#3333cc" }));
  mesh.position.y = 1;
  root.add(mesh);
  return root;
}
