import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ color: "#663333" }));
  body.name = "body";
  body.position.y = 5;
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshStandardMaterial({ color: "#eeeeee" }));
  eye.name = "eye";
  eye.position.set(0, 10.05, 5.01);
  root.add(body, eye);
  return root;
}
