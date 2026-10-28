The orb highlight passed `0` as the rotation argument of `put`, which needs a tuple. The rotation became NaN and broke the model's bounds, hence no opaque pixels. I fixed that call and removed the near-zero-scale rune tag part.

<<<<<<< SEARCH
    put("#ffffff", new THREE.SphereGeometry(r * 0.16, 5, 4), [x - r * 0.4, cy + r * 0.45, z + r * 0.55], 0, 1.6);
=======
    put("#ffffff", new THREE.SphereGeometry(r * 0.16, 5, 4), [x - r * 0.4, cy + r * 0.45, z + r * 0.55], [0, 0, 0], 1, 1.6);
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { bone: root, at: [0.38, 2.255 + 0.0, 0.2], dir: [0, 0, 1], axis: "z", texture: runeSvg, name: "runeTag", scale: 0.001 }), 0.0001);
=======
>>>>>>> REPLACE