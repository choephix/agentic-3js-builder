1. **Lowest point 90 mm under the floor.** The acacia trunk starts at y = 0.05 with a round start cap of radius 0.14. I gave it a flat start cap and set the start at y = 0.07, so it sits on the base.
2. **Dark "pills" on the flanks.** The scattered fold sausages read as floating slashes. I removed them and let the paint carry the wrinkles.
3. **Skin looked like cracked mud.** The 0.3 m cell pattern was too big and too contrasty. I made the cells finer and softer, and added horizontal wrinkle bands, so it reads as elephant hide.
4. **Dark rings on the legs looked like tape.** I removed them. The mud tint and the toenails already define the feet.
5. **Ears were small and lay flat on the shoulders.** I scaled them up by 1.18× and swung them more sideways so the silhouette flares in the front view. This is the bush elephant's signature feature.
6. **Eyes were tiny.** I enlarged the eye decal so the face reads from the three-quarter view.

<<<<<<< SEARCH
      const cell = cells(p, 0.3, 5);
      c = mix(c, "#3f3a36", 0.5 * (1 - smoothstep(0, 0.09, cell.d2 - cell.d1)));
=======
      const cell = cells(p, 0.16, 5);
      c = mix(c, "#4a443f", 0.28 * (1 - smoothstep(0, 0.045, cell.d2 - cell.d1)));
      const wr = Math.abs(Math.sin((p.y + 0.15 * noise(p, 0.5, 2)) * 24));
      c = mix(c, "#48423d", 0.3 * smoothstep(0.88, 1, wr));
>>>>>>> REPLACE

<<<<<<< SEARCH
  const bodySkin = b.surface(body);
  const folds = bodySkin.scatter(34, {
    rng: rng(3),
    minDist: 0.4,
    filter: (h) => h.n.y > -0.25 && Math.abs(h.n.x) > 0.35,
  });
  folds.forEach((h, i) => {
    b.stick(new THREE.SphereGeometry(1, 6, 4), SKIN, h, {
      embed: 0.5,
      flow: [0, 0, 1],
      spin: (i % 5) * 10 - 20,
      scale: [0.04, 0.04, 0.2 + (i % 3) * 0.05],
    });
  });
=======
  const bodySkin = b.surface(body);
>>>>>>> REPLACE

<<<<<<< SEARCH
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.17, 0.11] });
=======
    if (eyeHit) b.decal(skull, EYE, { at: eyeHit, size: [0.23, 0.145] });
>>>>>>> REPLACE

<<<<<<< SEARCH
const K = 0.85;
=======
const K = 1.0;
>>>>>>> REPLACE

<<<<<<< SEARCH
      x: new THREE.Vector3(s * 0.5, 0, -1).normalize(),
=======
      x: new THREE.Vector3(s * 0.85, 0, -0.55).normalize(),
>>>>>>> REPLACE

<<<<<<< SEARCH
      for (const t of [0.43, 0.86]) {
        const cp = leg.at(t);
        b.part(new THREE.TorusGeometry(legR(t) * 1.06, 0.03, 4, 10), WRINKLE, { at: cp, dir: cp.tangent, axis: "z", flat: true });
      }
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
      [tx, 0.05, tz],
      [tx - 0.05, 0.9, tz - 0.05],
=======
      [tx, 0.07, tz],
      [tx - 0.05, 0.9, tz - 0.05],
>>>>>>> REPLACE

<<<<<<< SEARCH
    { bone: root, color: BARK, sides: 7, smooth: false },
=======
    { bone: root, color: BARK, sides: 7, smooth: false, caps: { start: "flat", end: "round" } },
>>>>>>> REPLACE