import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#cc3333" }));
  left.name = "left";
  left.position.set(0, 0.5, 0);
  const right = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#3333cc" }));
  right.name = "right";
  right.position.set(1.1, 0.5, 0);
  root.add(left, right);
  return root;
}
