1. **Scarf ribbons:** they shot up off the back like antennae, ending in floating gold spikes. I rerouted them to lie along the shoulders and drape down the flanks, so the Genshin scarf-tail silhouette reads as cloth.
2. **Pose:** the panda was a plain four-legged stand, which doesn't say "balancing". I lifted the right forepaw in a playful, bent-elbow pose, with the paw and toes following the lifted target.
3. **Moss lumps on the rim:** they were broccoli-sized and hid the carved boulder and its runes. I shrank them so the stone, the glowing runes and the panda's paws read better.
4. **Leg colour:** the legs and belly were near-black plum and lost their form in the cel shadow. I warmed the dark brown so the cel shading shows and the legs read as red-panda brown.

<<<<<<< SEARCH
  dark: "#4a2a3c",
=======
  dark: "#6a3a4a",
>>>>>>> REPLACE

<<<<<<< SEARCH
    const fPts = limb([s * 0.095, 0.56, 0.17], [s * 0.105, FOOT, 0.2], [0.13, 0.13], [[0, 0, -1]]);
=======
    const fFoot: T3 = s < 0 ? [s * 0.1, FOOT + 0.1, 0.3] : [s * 0.105, FOOT, 0.2];
    const fPts = limb([s * 0.095, 0.56, 0.17], fFoot, [0.13, 0.13], [[0, 0, -1]]);
>>>>>>> REPLACE

<<<<<<< SEARCH
      [fl.tip!, [s * 0.105, FOOT, 0.2], 0.058, 0.04],
=======
      [fl.tip!, fFoot, 0.058, 0.04],
>>>>>>> REPLACE

<<<<<<< SEARCH
        at: [p[0], FOOT - 0.002, p[2] + len * 0.45],
=======
        at: [p[0], p[1] - 0.002, p[2] + len * 0.45],
>>>>>>> REPLACE

<<<<<<< SEARCH
          at: [p[0] + k * wid * 0.5, FOOT - 0.004, p[2] + len * 1.05],
=======
          at: [p[0] + k * wid * 0.5, p[1] - 0.004, p[2] + len * 1.05],
>>>>>>> REPLACE

<<<<<<< SEARCH
          at: [p[0] + k * wid * 0.55, FOOT - 0.01, p[2] + len * 1.3],
=======
          at: [p[0] + k * wid * 0.55, p[1] - 0.01, p[2] + len * 1.3],
>>>>>>> REPLACE

<<<<<<< SEARCH
    const rib = bezier(kp(0, 0, 0), kp(s * 0.05, 0.06, -0.04), kp(s * 0.11, 0.13, -0.14), kp(s * 0.16, 0.12, -0.3));
=======
    const rib = bezier(kp(0, 0, 0), kp(s * 0.04, 0.035, -0.06), kp(s * 0.1, 0.0, -0.14), kp(s * 0.15, -0.1, -0.26));
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike(T(new THREE.Vector3().copy(end as any)), [0, -1, 0], 0.06, 0.016, { color: C.gold, bone: chest });
=======
    b.spike(T(new THREE.Vector3().copy(end as any)), [0, -1, -0.5], 0.05, 0.014, { color: C.gold, bone: chest });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const sz = 0.05 + R() * 0.025;
=======
    const sz = 0.036 + R() * 0.02;
>>>>>>> REPLACE