## Your part, measured

The module ran with your function in it and measured your part against the spec. Your part fills the box {box} (min and max corners in metres, model space); the whole model is {size} m (x, y, z), standing on y = 0. Every piece of your part sits inside its box, so the parts fit together into one model.

{measured}

Bring these pieces inside your box: move, shorten, narrow or scale them, keeping your part's design, its details and the mounts where it meets the other parts. Everything that already fits stays as it is.

## Edits

Reply with SEARCH/REPLACE blocks against your function as it is above:

<<<<<<< SEARCH
exact lines from your function
=======
the lines that replace them
>>>>>>> REPLACE

Each SEARCH copies whole lines of your function exactly, indentation included, and matches one place only; a few lines around the change are enough. Blocks apply in order, each to the code as the blocks before it left it. When the changes touch most of the function, reply with the whole new function and its imports in one ```ts block instead.
