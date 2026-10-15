The crash comes from a placeholder part, `P(new THREE.BufferGeometry(), GOLD, …)`, whose empty geometry has no `position` attribute. The builder's `chartify` step reads `position.count` and fails. The placeholder does nothing, so I'm removing it.

<<<<<<< SEARCH
  P(
    new THREE.BufferGeometry(),
    GOLD,
    { at: [0, 0, 0], name: "unused" },
  ).mesh.visible = false;
=======
>>>>>>> REPLACE