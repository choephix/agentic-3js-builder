Cause: in `buildPodsRear`, `b.cards` is called with an empty frame list and no `size` option, so the SDK destructures `options.size` (undefined) and throws. That line is a leftover no-op, because the glow card is already built as a `PlaneGeometry` part on the next line. The same bad pattern in `buildPodsFront` passes a fake frame object, which is also unsafe, so I replace it with a plane part too.

<<<<<<< SEARCH
    b.cards([{ at: new THREE.Vector3(cx, 0.06, cz), axis: new THREE.Vector3(0, 1, 0) } as any].map(() => (null as any)).filter(Boolean), glowTex, {});
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(
      b.cards([THREE.Object3D ? { at: new THREE.Vector3(cx, 0.02, cz), axis: new THREE.Vector3(0, -1, 0) } as any : null], glowTex, { size: [0.5, 0.02], lean: 0 }),
      1,
    );
=======
    glow(
      b.part(new THREE.PlaneGeometry(0.6, 0.06), "#ffffff", { bone: j, at: [cx, 0.01, cz], dir: [0, 1, 0], axis: "z", texture: glowTex }),
      1,
    );
>>>>>>> REPLACE