1. **Spirit flames read as plain crystal cones.** Emissive flat colour on a symmetric lathe gives a smooth spike with no flicker. Each flame (tail tips and hitodama) now gets two crossed, curling extruded tongues around the lathe core. The silhouette becomes anime fire.
2. **Eyes are too small and half-lost under the red swoosh.** The face is the hero. I enlarged the eye decals by about 35%.
3. **Tails look like smooth sausages.** I added two rings of overlapping fur blades per tail. They use the tail's own white-to-spirit-colour gradient, so the tips look wispy and fluffy.
4. **Legs look like stilts next to the big tails.** I thickened the fore and hind leg radii slightly.

<<<<<<< SEARCH
    return glow(
      b.lathe(ol, { at: v3(at).toArray(), axis: v3(axis).normalize().toArray(), segments: 7, bone, color: col }),
      strength,
    );
  };
=======
    const d = v3(axis).normalize();
    const ref = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const w1 = new THREE.Vector3().crossVectors(d, ref).normalize();
    const w2 = new THREE.Vector3().crossVectors(d, w1).normalize().negate();
    for (const [w, sc] of [
      [w1, 0.85],
      [w2, 0.65],
    ] as const) {
      const k = h * sc;
      const tongue: Ol = [
        [-0.09 * k, 0],
        [0.09 * k, 0],
        [0.13 * k, 0.3 * k],
        [0.08 * k, 0.62 * k],
        [0.17 * k, 0.95 * k, "sharp"],
        [0, 0.7 * k],
        [-0.07 * k, 0.4 * k],
      ];
      glow(
        b.extrude(tongue, { at: v3(at).toArray(), x: w.toArray(), y: d.toArray(), thickness: 0.02, color: col, bone }),
        strength,
      );
    }
    return glow(
      b.lathe(ol, { at: v3(at).toArray(), axis: d.toArray(), segments: 7, bone, color: col }),
      strength,
    );
  };
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(fore, [0.068, 0.045, 0.035, 0.032], { color: legPaint });
=======
    b.sweep(fore, [0.078, 0.053, 0.04, 0.036], { color: legPaint });
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(hind, [0.09, 0.05, 0.037, 0.034], { color: legPaint });
=======
    b.sweep(hind, [0.1, 0.057, 0.042, 0.037], { color: legPaint });
>>>>>>> REPLACE

<<<<<<< SEARCH
        size: [0.064, 0.088],
=======
        size: [0.086, 0.118],
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep(chain, rad, {
      color: cel(gradient(CREAM, tip[0], from, to), gradient(LAV, TIPS_SHADOW[i % 2], from, to)),
    });
=======
    const tailPaint = cel(gradient(CREAM, tip[0], from, to), gradient(LAV, TIPS_SHADOW[i % 2], from, to));
    b.sweep(chain, rad, { color: tailPaint });
    // fur tufts breaking the tail silhouette
    for (const tt of [0.42, 0.66]) {
      const tp = chain.at(tt);
      b.ring(tp, { count: 4, radius: rad(tt) * 0.8, fromDeg: 20 + 20 * (tt > 0.5 ? 1 : 0), toDeg: 380 + 20 * (tt > 0.5 ? 1 : 0) }, (it) => {
        const dir = it.outward.clone().multiplyScalar(0.55).addScaledVector(tp.tangent, 0.85);
        blade({
          at: it.at,
          dir,
          len: 0.14,
          w: 0.075,
          th: [0.016, 0.004],
          color: tailPaint,
          bone: it.bone ?? chain.joints[1],
        });
      });
    }
>>>>>>> REPLACE