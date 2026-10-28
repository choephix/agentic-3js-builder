<!-- call: plan -->

```json
{
  "name": "Bauhaus Songbird on a Branch",
  "description": "A songbird built from Bauhaus primary-colour geometry (a red sphere body, a yellow triangular wing, a blue head disc, a black-and-white tail bar) perched on a branch with a stand.",
  "builderName": "bauhausSongbird",
  "size": [0.3, 0.34, 0.5],
  "layout": "A branch runs along x at height y=0.12, resting on a small black disc base on the floor via a short post. The bird perches on the branch facing +Z: a red sphere body (radius 0.07) centred at y=0.2, a blue disc-like head sphere (radius 0.045) forward and up at z=0.07, a yellow cone beak pointing +Z, a yellow triangular extruded wing on each flank, a long flat tail bar of black, red and white stripes extending back to z=-0.22, and two thin yellow legs gripping the branch. Everything is flat primary colour (red, yellow, blue) plus black and white, with circles, triangles and rectangles only, and each detail is a small separate part seated on the surface. Eyes are white discs with black pupils on the head sides.",
  "palette": {
    "red": "#d62828",
    "yellow": "#f6c90e",
    "blue": "#1d4ea8",
    "black": "#16161a",
    "white": "#f4f1e8",
    "wood": "#8a5a2b",
    "woodDark": "#5e3b1a",
    "cream": "#e9dfc3"
  },
  "mounts": {
    "branchTop": [0, 0.145, 0],
    "perch": [0, 0.145, 0],
    "bodyCenter": [0, 0.22, 0],
    "headCenter": [0, 0.29, 0.07],
    "tailRoot": [0, 0.21, -0.06],
    "wingL": [0.065, 0.225, -0.01],
    "wingR": [-0.065, 0.225, -0.01]
  },
  "joints": [
    { "name": "body", "at": [0, 0.22, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "neck", "parent": "body", "at": [0, 0.26, 0.05], "dir": [0, 0.5, 1], "role": "neck" },
    { "name": "head", "parent": "neck", "at": [0, 0.29, 0.07], "dir": [0, 0, 1], "role": "head" },
    { "name": "jaw", "parent": "head", "at": [0, 0.28, 0.1], "dir": [0, 0, 1], "role": "jaw" },
    { "name": "wingL", "parent": "body", "at": [0.06, 0.23, 0], "dir": [1, 0, -0.3], "role": "wing" },
    { "name": "wingR", "parent": "body", "at": [-0.06, 0.23, 0], "dir": [-1, 0, -0.3], "role": "wing" },
    { "name": "tail1", "parent": "body", "at": [0, 0.21, -0.06], "dir": [0, 0, -1], "role": "tail" },
    { "name": "tail2", "parent": "tail1", "at": [0, 0.2, -0.14], "dir": [0, 0, -1], "role": "tail" },
    { "name": "legL", "parent": "body", "at": [0.03, 0.17, 0.0], "dir": [0, -1, 0], "role": "leg" },
    { "name": "legR", "parent": "body", "at": [-0.03, 0.17, 0.0], "dir": [0, -1, 0], "role": "leg" }
  ],
  "parts": [
    {
      "id": "torso",
      "builds": "Red faceted sphere body (slightly elongated), cream semicircle belly disc patch on the front, a blue stripe ring band around the chest, and a black square rump patch. Owns the body joint geometry.",
      "box": [[-0.075, 0.15, -0.08], [0.075, 0.29, 0.08]],
      "attaches": "Neck at mount headCenter, wings at wingL/wingR, tail at tailRoot, legs at perch.",
      "joints": ["body"],
      "floor": false,
      "budget": 90
    },
    {
      "id": "headBeak",
      "builds": "Blue sphere head, white eye discs with black pupils and a thin black ring, yellow cone upper beak plus separate smaller yellow lower beak on the jaw joint, a red triangular crest extrude on top, small black cheek dots.",
      "box": [[-0.05, 0.24, 0.03], [0.05, 0.35, 0.16]],
      "attaches": "Sits on the torso at headCenter via neck joint.",
      "joints": ["neck", "head", "jaw"],
      "floor": false,
      "budget": 100
    },
    {
      "id": "wingsTail",
      "builds": "Two yellow triangular extruded wings (one per side) with a red stripe and black tip triangle, layered feather bars in blue and white; a tail made of a flat black bar with red and white stripe slabs, tapering across two joints.",
      "box": [[-0.1, 0.18, -0.24], [0.1, 0.28, 0.02]],
      "attaches": "Wings at wingL/wingR, tail at tailRoot.",
      "joints": ["wingL", "wingR", "tail1", "tail2"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "branchStand",
      "builds": "Wooden branch as a straight box-sectioned rod along x with two short angled twig rods, yellow and red small disc leaves in simple geometric shapes, dark knot discs, a short post and a flat black round base disc with a white ring. The two thin yellow bird legs and three-toed black foot bars gripping the branch (on leg joints).",
      "box": [[-0.15, 0], [0.15, 0.15]].length ? [[-0.15, 0, -0.1], [0.15, 0.15, 0.1]] : [[-0.15, 0, -0.1], [0.15, 0.15, 0.1]],
      "attaches": "Branch top at perch/branchTop; legs end at branchTop.",
      "joints": ["legL", "legR"],
      "floor": true,
      "budget": 110
    }
  ]
}
```