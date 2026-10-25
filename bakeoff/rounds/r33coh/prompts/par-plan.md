## A team builds this model

Several builders build this model at the same time. Each writes one function that builds one part of the model into a shared builder, and the module runs the functions one after another. Each builder reads the system prompt above, the pitch and your spec, and nothing else; they never see each other's code, so your spec is what makes their parts one model.

Your reply is that shared spec: one ```json block in this shape, and no module code.

```json
{
  "name": "Display name",
  "description": "One sentence: what the model is.",
  "builderName": "camelCaseName",
  "size": [2.4, 2.1, 6.2],
  "layout": "The silhouette and proportions, what sits where from the front (+Z) to the back, what rests on the floor, and how the style shows on every part.",
  "palette": { "hull": "#3b4250", "trim": "#e7b814", "neonCyan": "#2ff3ff" },
  "mounts": { "deckTop": [0, 1.35, 0], "turretRing": [0, 2.05, -1.2] },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 1, 0], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [0.95, 0.5, 2.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "What this part is and everything it includes: its construction, details, textures and paints.",
      "box": [[-1.2, 0.3, -3.1], [1.2, 1.35, 3.1]],
      "attaches": "Where it meets the other parts, by mount and joint names.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

- `size` is the whole model's width (x), height (y) and length (z) in meters, in the system prompt's axes: +Y up, the front faces +Z, centred on x = 0, standing on y = 0.
- `parts`: 3–6 parts that split the work evenly, each a self-contained piece of the model of similar richness (a hull, a cab, the running gear, a turret, the cargo). Every piece of the model belongs to exactly one part, and each part owns its details, textures and paints.
- `box` is the space the part fills, as min and max corners in model space. Parts that meet share box faces: a part resting on another starts where the other ends.
- `mounts` are the shared points where parts meet: deck heights, ring centres, axle lines, hinge points. Every place two parts touch has a mount, and both parts build to it.
- `palette` holds the model's flat colours, at most 24, named by use. Every part takes its main colours from it.
- `joints` is the skeleton, created in this order before any part runs: parents first, one root joint without `parent`, names matching `/^[A-Za-z][A-Za-z0-9]*$/`, `dir` the bone's direction, `role` from the system prompt's list. A static model has `"joints": []`. Each part lists the joints its geometry rides.
- `floor: true` marks the parts whose lowest points rest on y = 0; every other part sits above the floor, inside its box.
- `budget` is the part's share of the model's parts; the budgets add up to at most 900.
