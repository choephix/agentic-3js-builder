The module never default-exported a function: all the building ran at import time, `flush()` was never called, and there was no `export default`. The edit below adds both. It also swaps a Paint that was cast to a colour string on the necklace bezel for a plain colour, since that value would have broken the merged part in `flush()`.

<<<<<<< SEARCH
  put("necklace.bezel", GOLD_P as unknown as string, new THREE.TorusGeometry(0.03, 0.007, 4, 8), mat(pend.clone().add(new THREE.Vector3(0, 0.022, -0.03)), eul(60, 0, 0)));
}
=======
  put("necklace.bezel", GOLD_LT, new THREE.TorusGeometry(0.03, 0.007, 4, 8), mat(pend.clone().add(new THREE.Vector3(0, 0.022, -0.03)), eul(60, 0, 0)));
}

// ---------------------------------------------------------------------------------------------------------------
// Finish: build the merged parts and hand back the root
export default function build(): THREE.Object3D {
  flush();
  return b.root;
}
>>>>>>> REPLACE