import * as THREE from "three";
export default function build() {
  const root = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ color: "#663333" }));
  body.name = "body";
  body.position.y = 5;
  const values: number[] = [];
  for (let i = 0; i < 47; i++) {
    const x = -0.05 + (i % 8) * 0.014;
    const y = 9.8 + Math.floor(i / 8) * 0.014;
    values.push(x, y, 5.01, x + 0.01, y, 5.01, x, y + 0.01, 5.01);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(values, 3));
  const detail = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: "#eeeeee" }));
  detail.name = "detail47";
  root.add(body, detail);
  return root;
}
