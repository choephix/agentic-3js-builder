The splash outline can self-intersect when `lean` is large relative to `width`; moving its outer shoulder with the lean keeps the edges separated.

<<<<<<< SEARCH
        [-width, 0],
        [width, 0],
        [width * 0.59, height * 0.45],
        [lean, height],
        [lean - width * 0.4, height * 0.83],
        [-width * 0.65, height * 0.29],
=======
        [-width, 0],
        [width, 0],
        [lean + width * 0.5, height * 0.65],
        [lean, height],
        [lean - width * 0.4, height * 0.83],
        [-width * 0.65, height * 0.29],
>>>>>>> REPLACE