The `box` helper was called with `HAZ`, a texture, as its colour (`box(0.14, 0.05, 1.6, HAZ, …, { texture: HAZ })`). `HAZ` has to be passed as `texture:` with a plain colour string in the colour slot. The same mistake occurs on the other hazard-cap boxes, so I fixed it in the helper: if the colour is a Texture, it becomes the texture and the colour becomes white.

<<<<<<< SEARCH
  const part = (geo: THREE.BufferGeometry, color: any, at: V, o: Record<string, any> = {}) => b.part(geo, color, { at, ...o });
=======
  const part = (geo: THREE.BufferGeometry, color: any, at: V, o: Record<string, any> = {}) =>
    color instanceof THREE.Texture
      ? b.part(geo, "#ffffff", { at, ...o, texture: color })
      : b.part(geo, color, { at, ...o });
>>>>>>> REPLACE