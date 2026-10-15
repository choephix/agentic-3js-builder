The textured parts for the crown circlet, coin stacks, and loose coins were mistakenly passed `GOLD_PAINT` (a `Paint` instance) instead of a color string tint.

<<<<<<< SEARCH
  // Circlet Base Band
  b.part(new THREE.CylinderGeometry(CR_RAD, CR_RAD, CR_H, 16, 1, true), GOLD_PAINT, {
    bone: root,
    at: crownLocal(0, CR_H / 2, 0),
    quat: crownQuat,
    texture: FILIGREE_TEX,
    name: "crown_circlet",
  });
=======
  // Circlet Base Band
  b.part(new THREE.CylinderGeometry(CR_RAD, CR_RAD, CR_H, 16, 1, true), GOLD_BRIGHT, {
    bone: root,
    at: crownLocal(0, CR_H / 2, 0),
    quat: crownQuat,
    texture: FILIGREE_TEX,
    name: "crown_circlet",
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_PAINT, {
        bone: root,
        at: [st.x + jx, cy, st.z + jz],
        texture: COIN_TEX,
        name: `coin_stack_${sidx}_${c}`,
      });
=======
      b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_BRIGHT, {
        bone: root,
        at: [st.x + jx, cy, st.z + jz],
        texture: COIN_TEX,
        name: `coin_stack_${sidx}_${c}`,
      });
>>>>>>> REPLACE
<<<<<<< SEARCH
  looseCoins.forEach((lc, idx) => {
    b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_PAINT, {
      bone: root,
      at: lc.at,
      quat: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(lc.rot[0], lc.rot[1], lc.rot[2]),
      ),
      texture: COIN_TEX,
      name: `loose_coin_${idx}`,
    });
  });
=======
  looseCoins.forEach((lc, idx) => {
    b.part(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), GOLD_BRIGHT, {
      bone: root,
      at: lc.at,
      quat: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(lc.rot[0], lc.rot[1], lc.rot[2]),
      ),
      texture: COIN_TEX,
      name: `loose_coin_${idx}`,
    });
  });
>>>>>>> REPLACE