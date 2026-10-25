The thruster code called `b.cards(...)` with no options argument (a leftover stub with a junk frame list), so `options.size` was read from `undefined`; that call is redundant with the glow plane below it, so I remove it.

<<<<<<< SEARCH
    b.cards([{ at: new THREE.Vector3(cx, 0.015, cz), axis: new THREE.Vector3(0, 1, 0) } as any].map(() => (b as any).frame ? null : null).filter(Boolean) as any, GLOWCARD);
=======
>>>>>>> REPLACE