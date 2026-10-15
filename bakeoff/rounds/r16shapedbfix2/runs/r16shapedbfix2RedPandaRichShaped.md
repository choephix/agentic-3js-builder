Cause (best guess): the rock is built with `flat: true` and a baked paint, and its lathe profile and flat-shaded icosahedron lumps may lose their paint data, so the stone and everything painted on it renders nothing. I'm switching the rock to normal shading, which the paint bake handles, and I haven't been able to confirm this is the actual cause.

<<<<<<< SEARCH
    scale: [1, 1, 1.25],
    flat: true,
    group: "stone",
    name: "boulder",
=======
    scale: [1, 1, 1.25],
    group: "stone",
    name: "boulder",
>>>>>>> REPLACE

<<<<<<< SEARCH
        scale,
        rotation: [0, rot, 0],
        flat: true,
        group: "stone",
=======
        scale,
        rotation: [0, rot, 0],
        group: "stone",
>>>>>>> REPLACE