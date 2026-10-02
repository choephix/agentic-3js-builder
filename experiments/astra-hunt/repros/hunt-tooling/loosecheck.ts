import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const main = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#cc3333" }));
  main.name = "main";
  main.position.y = 0.5;
  const loose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: "#3333cc" }));
  loose.name = "loose";
  loose.position.set(0.6, 0.55, 0);
  root.add(main, loose);
  return root;
}
