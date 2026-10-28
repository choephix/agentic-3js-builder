The parameter `tex` in `place` shadows the `tex` helper function, so `tex(tex)` calls a texture as a function. Passing the texture directly fixes it.

<<<<<<< SEARCH
    const place = (tex: THREE.Texture, w: number, h: number, u: number, v: number, roll = 0) => {
=======
    const place = (texture: THREE.Texture, w: number, h: number, u: number, v: number, roll = 0) => {
>>>>>>> REPLACE

<<<<<<< SEARCH
up: up.toArray() as any, texture: tex(tex),
=======
up: up.toArray() as any, texture,
>>>>>>> REPLACE

<<<<<<< SEARCH
    const tex = (t: THREE.Texture) => t;
=======
>>>>>>> REPLACE