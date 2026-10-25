The `HAZARD` texture (a `THREE.Texture`) was passed as the `color` argument of `P(...)`/`b.part(...)`, which only accepts a colour string or paint. A texture has to go in the `texture:` option with a plain colour string instead.

Three places did this: the skirt hazard strip, the turret ammo-box stripe, and `HAZARD as any` in the skirt loop. I'll add a helper `HZ` that builds a textured part and use it at all three.

<<<<<<< SEARCH
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], gl = true, bone: any = chassis) => {
=======
  const HZ = (g: THREE.BufferGeometry, at: number[], o: any = {}) =>
    b.part(g, "#ffffff", { bone: o.bone ?? chassis, at: at as any, texture: HAZARD, ...o });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], gl = true, bone: any = chassis) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
    P(box(0.04, 0.12, 5.6), HAZARD as any, [s * 1.05, 0.7, 0]);
=======
    HZ(box(0.04, 0.12, 5.6), [s * 1.05, 0.7, 0]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(box(0.04, 0.15, 0.3), HAZARD as any, { bone: yaw, at: [s * 0.84, 2.9, 0.55] });
=======
    HZ(box(0.04, 0.15, 0.3), [s * 0.84, 2.9, 0.55], { bone: yaw });
>>>>>>> REPLACE