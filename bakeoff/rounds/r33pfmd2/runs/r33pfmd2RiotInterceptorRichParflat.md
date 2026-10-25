<!-- call: plan -->

```json
{
  "name": "Riot-Control Interceptor VX-9",
  "description": "A corporate riot-control armored interceptor with a roof-mounted water cannon and glowing neon light bars, in Cyberpunk 2077 style.",
  "builderName": "riotInterceptor",
  "size": [2.5, 2.3, 5.6],
  "layout": "A low, wide, wedge-shaped armored car facing +Z. Front: sloped armored nose with a wide neon-cyan light-bar grille, a push-bar ram and a pair of angular magenta headlights. Mid: a short, raked, armored cab with a narrow dark-tinted windshield, riot-mesh side windows and a roof light bar (cyan and magenta alternating). Rear and roof: a rotating water cannon turret on a ring just behind the cab roof, with a fat tank and a long barrel pointing forward. Back: a tank/pump housing with hazard stripes and tail light strips. Four big chunky wheels with hubs touch the floor, with the body riding on them. The style shows in every part: graffiti-worn dark hull panels, yellow hazard chevrons, corporate logo decals, glowing neon trim edges (cyan, magenta, yellow), and vents, antennas and cables for cyberpunk clutter.",
  "palette": {
    "hull": "#2b303b",
    "hullDark": "#161920",
    "hullLight": "#4a5262",
    "armor": "#3a4150",
    "trim": "#f2c root".replace(" root", "") ,
    "hazard": "#f5c518",
    "black": "#0a0b0f",
    "glass": "#0d2a33",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonYellow": "#fff04a",
    "neonRed": "#ff2b3a",
    "tire": "#101114",
    "rim": "#7b8494",
    "steel": "#9aa3b2",
    "water": "#3ab8ff",
    "corpWhite": "#e8ecf2",
    "rust": "#6b3a26"
  },
  "mounts": {
    "deckTop": [0, 1.35, 0],
    "cabFloor": [0, 1.35, 0.3],
    "roofTop": [0, 2.0, -0.2],
    "turretRing": [0, 2.0, -1.3],
    "cannonPivot": [0, 2.35, -1.3],
    "frontAxle": [0, 0.5, 1.7],
    "rearAxle": [0, 0.5, -1.7],
    "noseFront": [0, 0.9, 2.8],
    "rearFace": [0, 1.1, -2.8]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.0, -1.3], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "cannonPitch", "parent": "turretYaw", "at": [0, 2.35, -1.3], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.1, 0.5, 1.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.1, 0.5, 1.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.1, 0.5, -1.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.1, 0.5, -1.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassisAndNose",
      "builds": "Lower hull from front bumper to rear: floor pan, side skirts, wheel arches (arch trims around wheel positions), sloped armored nose wedge with a neon-cyan grille light bar, ram push-bar in hazard yellow/black, two angular magenta headlights, front intake vents, tow hooks, license plate with corp logo, fender flares, door seams, side corporate stripe decals with the logo, underbody dark plates and glowing under-car cyan strip. Hull colours with hazard and neon accents.",
      "box": [[-1.25, 0.3, -2.8], [1.25, 1.35, 2.85]],
      "attaches": "Cab sits on deckTop/cabFloor; wheels at frontAxle/rearAxle on the joints wheelFL..RR; rear housing at rearFace.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armored raked cabin from cabFloor to roofTop: roof slab, A-pillars, narrow tinted windshield, side riot-mesh windows with bars, door panels with handles, mirrors with small cyan LEDs, a roof light bar with alternating cyan and magenta segments plus glowing end caps, antennas, roof sensor pod/camera, a sat dish, cables, vents, a corporate logo on the roof and door sides, hazard chevrons on pillars.",
      "box": [[-1.1, 1.35, -1.0], [1.1, 2.1, 1.3]],
      "attaches": "Sits on deckTop/cabFloor; roof at roofTop; the turret ring just behind it at turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "waterCannonTurret",
      "builds": "Rotating water cannon assembly: turret ring base on turretRing (gear teeth ring, hazard-striped collar), a rotating armored pedestal on joint turretYaw, a fat translucent-blue-tinted water tank with glowing water-level strip, pump block with pipes and valves, a long barrel on joint cannonPitch with a flared nozzle and banded sleeves, cyan glow ring at the muzzle, magenta targeting laser sight, camera eye, hose coil, pressure gauge, warning decals.",
      "box": [[-0.9, 2.0, -2.1], [0.9, 2.3, 1.2]],
      "attaches": "Base on turretRing at roof behind cab; barrel points +Z along cannonPitch from cannonPivot, over the cab roof.",
      "joints": ["turretYaw", "cannonPitch"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wheels",
      "builds": "Four big chunky wheels, each on its own wheel joint: faceted black tire with tread blocks, steel rim with bolts, hub cap with a neon ring (cyan front, magenta rear), brake discs and calipers visible behind spokes, mud flaps. Axle stubs and suspension arms linking to the body. All wheel bottoms touch y=0 (radius about 0.5).",
      "box": [[-1.3, 0, -2.2], [1.3, 1.0, 2.2]],
      "attaches": "Centred on the frontAxle and rearAxle lines at x=±1.1 on joints wheelFL, wheelFR, wheelRL, wheelRR.",
      "joints": ["wheelFL", "wheelFR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "rearModule",
      "builds": "Rear equipment block behind the cab: a boxy armoured tank and pump housing at the back deck, hazard-striped rear doors, rear bumper with a ram bar, red neon tail light strips and brake lights, exhaust stacks, a rear ladder, roof-rack vents, a corporate warning decal, cable bundles, a rear neon-yellow reflective strip and a rear cyan light bar.",
      "box": [[-1.2, 1.35, -2.85], [1.2, 2.0, -1.0]],
      "attaches": "Meets the cab at z=-1.0 and the chassis rear face at rearFace; the turret ring sits on its top at turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    }
  ]
}
```