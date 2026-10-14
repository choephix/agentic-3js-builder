# Sample fixes, 2026-10-02

All 186 `samples/*.ts` slugs are covered by the final first- and second-pass audits; every sample stays in the library.
Worst audited defect: **25 P0 / 8 P1 / 1 only P2 / 152 clean**; counts are mutually exclusive, not counts of defects.
Most common faults: detached attachments/limbs, missing or unreadable jaws, wrong coordinate axes, and incorrect rig topology.
Second-pass verdicts win; the five red-lionfish swimmers, hoverbike, and ghost retain their intended off-ground placement.
“Clean” means no remaining per-sample audit finding, not immunity from the shared SDK problems listed below.

Merged from all 19 final `scratch/astra-reports/audit-*.md` reports; `audit-h2-second.md` is group h. Entries within P0 put broken anatomy and large structural/rig failures before smaller attachment gaps. Shot paths starting `snaps/` or `preview/` are relative to `/home/cx/tmp/public/nilo/agentic-3js-builder/`; unqualified shot names belong to the entry's `snaps/<slug>/B/snaps/` directory. Measurements and source lines are those recorded by the auditors, not fresh measurements by this merger.

Second-pass clean corrections: `clockworkAutomaton`, `clockworkCarousel`, `clockworkCrocodile`, and `clockworkStag` replace the first-pass P2 fine-detail verdicts; `toonFennec` replaces the first-pass P1 whisker verdict; `synthwaveHoverbike` rejects the first-pass P0 floor finding (its 300 mm hover is intentional). `redFox` was reviewed at v13-lowpoly, correcting the first-pass v04 tag. No samples are removed.

## P0

### ps1Mech

- [P0] Left claw and right cannon are detached from the arms, with additional back/torso pieces floating — evidence: `v03-sheet.jpg` front/three-quarter/top panels and both flex shots show the hand/cannon assemblies separated from their forearms; current report-only lists `box.armL.2` 609 mm from `armL`, `box.weaponCannon` 403 mm from `armR`, `extrude.back.2` 131 mm from `armL`, `extrude.back` 130 mm from `armR`, and torso gaps of 61–65 mm — cause: `samples/ps1Mech.ts:308-331` passes model-space coordinates into `box()`/`b.part()` together with a bone (`box()` at lines 101-110 forwards `at` directly), so the bone transform offsets already-positioned geometry — fix: place these meshes in bone-local coordinates or translate model-space geometry and call `b.part(..., { bone, at: [0, 0, 0] })`; derive attachment positions from the arm joints instead of duplicating world coordinates.

### snesRedDragon

- [P0] All four legs float well below the torso instead of meeting the belly — evidence: v03-front.png and v03-side.png visibly show a large gap at every leg root; report-only measures legTubeFL/FR 333 mm and legTubeHL/HR 211 mm from continuousBody — cause: samples/snesRedDragon.ts:228-252 creates each chain at roots y=1.52 (lines 235-240) while the body underside is higher at the leg z positions — fix: derive leg roots from body surface/underside hits (or raise/extend the leg sweeps) so each leg overlaps the body and remains attached through flex; do not merely hide the gap with a filler sphere.

### centaurArcher

- [P0] All four black hooves are detached below the horse legs — evidence: `snaps/centaurArcher/B/snaps/v03-front.png`, `v03-three-quarter.png`, and both flex shots visibly show four square hooves floating on the floor; report-only measures `hooffrontL`/`hooffrontR` at 150–151 mm from their leg tubes and hind hooves at 148 mm — cause: `samples/centaurArcher.ts:185-190` places the hoof at y = 0.043 while the leg sweep ends at the ankle — fix: place each hoof on the ankle endpoint/bone and bridge the leg sweep to it, preserving floor contact without a gap.

- [P0] The recurved bow is not held coherently by either hand and tears from the intended grip in the rig — evidence: `snaps/centaurArcher/B/snaps/v03-front.png` and `v03-three-quarter.png` show the bow crossing the torso with its central grip away from both hands; `v03-flex-b.png` leaves the bow across the chest while the hands move; current preview measures `recurveBow` ↔ `armL` at 52.5 mm — cause: `samples/centaurArcher.ts:333-341` builds the bow from fixed world-space points without a dedicated bow joint, so the builder assigns bow pieces across `wristL`/`wristR` instead of one held item — fix: add a dedicated `bow` joint parented to the gripping wrist, put every bow/string/grip piece on it, and place the grip at that hand (or pose the hand to the grip).

### nesYeti

- [P0] The model has four full legs (frontHipL/R and hindHipL/R) in addition to its arms, making the bipedal yeti read as a quadruped — evidence: v02 sheet `front`, `three-quarter`, `side`, `skeleton`, and both flex shots visibly show two front legs under the shoulders and two hind legs; the report skeleton also lists `frontHipL/R` and `hindHipL/R` — cause: `samples/nesYeti.ts:259-292` loops over both `kind = "front"` and `kind = "hind"` and creates a leg chain for each — fix: remove the front leg pair and retain only the hind leg pair as legs, leaving the shoulder chains as arms.

- [P1] The dark square face/mask block rides high over the head and obscures the facial placement — evidence: `snaps/nesYeti/B/snaps/v02-head.png` and v02 sheet head close-up/front — cause: `samples/nesYeti.ts:339-345` places `leatherFace` separately over the high skull station — fix: lower/reseat the face block on the skull and align its eyes/nose/mouth with the head and jaw.

### nesGoblinShaman

- [P0] The creature is facing the wrong way: the v02 `front.png` shows a featureless back of the head, while `back.png` shows the eyes, nose, and open mouth; this violates the +Z facing contract and makes the front view unreadable — evidence: `snaps/nesGoblinShaman/B/snaps/v02-front.png`, `snaps/nesGoblinShaman/B/snaps/v02-back.png`, `snaps/nesGoblinShaman/B/snaps/v02-head.png` — cause: `samples/nesGoblinShaman.ts:203-219` builds the face/nose with `head.local(... z ...)`; for a forward head, local Y is forward and local Z is up — fix: swap the face feature's forward offsets from local Z to local Y (and recalculate the corresponding jaw/eye/tooth placements) so the face reads in the +Z front view.

### lizardfolkHunter

- [P0] Both arm chains are detached from the torso at their shoulder roots (23.1 mm gap) — evidence: `npm run preview -- lizardfolkHunter --gap sweep.armR torso` and `--gap sweep.armL torso` each report 23.1 mm; latest `v03-report.json` also lists `sweep.armR`/`sweep.armL` as loose 23 mm clusters; cause: `samples/lizardfolkHunter.ts:259-272` hard-codes shoulder roots at `[±0.26, 1.46, 0.06]` while the torso loft ends at the narrower shoulder station in `samples/lizardfolkHunter.ts:392-403`; fix: derive each shoulder root from the torso surface (or move/extend the arm sweep) so the shoulder mesh overlaps the torso with no visible seam.

- [P0] The lizard's mouth/lower jaw is not readable in the front, three-quarter or head close-up shots — evidence: `v03-front.png` and `v03-head.png` show a continuous pointed green face with no mouth opening or visible lower jaw/teeth, despite the jaw joint; cause: `samples/lizardfolkHunter.ts:94-100` places the jaw and `:474-486` builds the lower jaw, but the result is hidden/fused under the head loft from `:460-471`; fix: reposition or enlarge the lower jaw and mouth interior so a separate upper/lower jaw and teeth read in the rest pose.

### mantisShrimp

Added by the second pass; omitted from the first-pass report.

- [P0] All six orange walking-leg chains are detached from the abdomen/thorax at their hip roots, with 17–22 mm gaps — evidence: `v03-side.png` and `v03-flex-a.png` show the thin walking legs hanging below the pale underside instead of emerging from it; `npm run preview -- mantisShrimp --gap sweep.legs abdomen` measures a 22.4 mm closest-point gap (`[0.036, 0.081, 0.068]` to `[0.023, 0.098, 0.062]`), and current report-only lists the six leg clusters 17–22 mm from the abdomen — cause: `samples/mantisShrimp.ts:454-460` hard-codes hip roots at `y = 0.078` and `x = ±0.040`, while `:468-472` sweeps each chain without burying/overlapping the thorax — fix: derive each hip root from the thorax/abdomen surface (or extend/bury the first leg segment) so every leg overlaps the body with no visible gap.

### emperorPenguin

- [P0] Both webbed feet are visibly detached below the legs — evidence: `v03-front.png` shows each black foot separated by a clear gap from the lower body/leg, and report-only lists `sweep.legL.4` and `sweep.legR.4` 42 mm from `body` — cause: `samples/emperorPenguin.ts:354-394` ends the leg sweep at `footTarget` while the toe chains start at the separately placed `footBasePt` (`:356`, `:397-425`) — fix: make the tarsus/foot chain and toe geometry overlap the body-connected lower leg, then verify both feet touch the leg mesh while retaining ground contact.

### giantAnteater

- [P0] Eyes and several paw blocks visibly float away from their host meshes — evidence: `v08-lowpoly-head.png` shows both yellow eyes suspended off the wedge head; report-only lists head eye parts 11 mm from the head and front-leg pieces 20 mm from their leg sweeps, while the sheet shows brown paw blocks separated from legs — cause: `samples/giantAnteater.ts:133-170` places paws at `front.at(1).at`/`hind.at(1).at` with separate frustum boxes, and `:214-226` places eye spheres at fixed offsets that do not meet the loft surface — fix: seat eyes and paw blocks from `surface(...).nearest`/`Hit.moved` frames or overlap their offsets with the host sweeps.

### voxelWolf

- [P0] Tail tip block is visibly detached — evidence: `v03-sheet.jpg` side/three-quarter views show a gap at the tail tip, and report-only measures `box.tail.3` 12 mm from `tail` — cause: tail boxes are authored as independent pieces at `samples/voxelWolf.ts:176-184` — fix: place tail tip flush with tailMid or overlap the adjacent boxes by at least the voxel seam width.

- [P0] Neck block is rigid on `neckBase` while the child neck joint moves — evidence: report-only stiff-part check identifies `box.neck` 100% on `neckBase` while `neckTop` pivots; the flex-a/flex-b panels show the neck/head articulation riding through the block — cause: neck box placement/bone assignments at `samples/voxelWolf.ts:108-125` — fix: bind the neck volume to the neck chain (or split it across `neckBase`/`neckTop`) so it follows the child joint in flex poses.

### warthogGemini

- [P0] The front legs are classified as arms in the rig answer key — evidence: v03 report rig lists `frontLeg_L`/`frontLeg_R` with `role: "arm"` (and `shoulder_L`/`shoulder_R` as arms), although the front limbs visibly end in hooves in the front/three-quarter/side shots — cause: `samples/warthogGemini.ts:354-367` sets both the shoulder and front leg chain roles to `arm` — fix: set these quadruped front-limb joints/chains to `role: "leg"` while retaining the visible shoulder names.

- [P0] Front-leg chains contain zero-length shoulder-to-knee joints — evidence: `v03-skeleton.png` shows the shoulder/knee nodes coincident, and the current skeleton report places `shoulder_L` and `frontKnee_L` both at `[0.16,0.65,0.26]` (same for the right side) — cause: `samples/warthogGemini.ts:354-364` creates a `shoulderJoint` at `shoulderPt` and then starts `b.chain` with `limb(shoulderPt, ...)`, whose first named joint is therefore at the same point — fix: make the shoulder joint the chain root (remove the duplicate parent joint), or name/start the chain at the next non-coincident knee point so each front-limb joint has a real segment. (The first-pass `arm`-versus-`leg` role finding remains applicable.)

### witchCottageDiorama

- [P0] Roof assembly visibly floats above the cottage, with a stray ochre roof block suspended in the gap — evidence: `v03-front.png` shows the entire gold roof separated from the wall top and a discrete gold cuboid hanging left of the chimney; report-only also lists 16 loose body clusters, largest gap 270 mm — cause: roof boxes/ridge and front thatch pieces are independently placed at `samples/witchCottageDiorama.ts:157-164` — fix: lower/resize the roof pieces to overlap the wall/eaves and attach the stray cuboid to the roof assembly (or remove that accidental fragment while keeping the roof design).

### gbcSlimeKing

- [P0] Crown, cape, swallowed sword/treasure, and mouth decals visibly float off the slime — evidence: `v03-head.png` shows a gap under the crown and detached purple cape; report-only measures `crownBand` 22 mm, `royalCape` 75 mm, `swallowedSwordHilt` 62 mm, and `upperMouth` 11 mm from the body — cause: `samples/gbcSlimeKing.ts:126-150` and `:171-199` use hard-coded world positions for the cape, crown, face planes, and treasure rather than seating them on the body/head surface — fix: derive each attachment from `body`/`head` frames or surface hits, move treasure inward into the jelly, and seat crown, cape root, and mouth planes against the intended volume.

### spaceMarine

- [P0] the chainsword blade chassis floats off the forearm/hand assembly — evidence: `snaps/spaceMarine/B/snaps/v03-three-quarter.png` and `v03-side.png`; the first-pass measurement records 233.6 mm between `box.armL.14` and `sweep.armL.2` — cause: `samples/spaceMarine.ts:812-835` places the long blade pieces at fixed positions without a connected bridge from the wrist sweep — fix: derive the chainsword handle/blade route from the `leftWrist`/hand frame (or add a continuous overlapping motor/handle section) so the weapon physically meets the grip and remains on the wrist bone through flex.

- [P1] chainsword teeth are visibly detached below the blue chainblade chassis instead of seated on its cutting edge — evidence: `snaps/spaceMarine/B/snaps/v03-side.png` and `v03-low.png` show a clear gap under the blade; current `npm run preview -- spaceMarine --gap box.armL.14 cone.armL.2` measures 94.3 mm between the chassis and first tooth — cause: `samples/spaceMarine.ts:826-835` places teeth at `y = ty - 0.085`, while the chassis is centred at `y = 1.2` with 0.15 m height (`812-817`), leaving the first tooth below its lower edge — fix: derive each tooth position from the rotated chassis' lower edge (or move the tooth row up by the measured gap) so teeth overlap the blade and remain on the left-wrist weapon bone.

### brutalistWalkerFortress

Second pass replaces the first-pass clean verdict.

- [P0] The rooftop radar dish/mast is detached from the fortress roof — evidence: `snaps/brutalistWalkerFortress/B/snaps/v03-front.png` and `v03-top.png` show the dark mast/dish floating above the roof; current preview measures `sphere.radar` ↔ `body` at 406.5 mm and `sweep.radar` ↔ `body` at 85.2 mm — cause: `samples/brutalistWalkerFortress.ts:227-233` starts the radar post at y = 5.74 while the roof/body ends around y = 5.68, leaving the radar cluster separated — fix: extend the radar post down to the roof and bridge the remaining mast/dish geometry to the body while keeping it on `radar`.

### mimicHermitCrab

- [P0] The creature has no separate jaw/mouth chain and no readable crab mouth — evidence: `v03-report.json` has no `jaw` joint/chain, and `v03-sheet.jpg`/`v03-head.png` show eyestalks and pincers but no mouth; cause: `samples/mimicHermitCrab.ts:319-319` creates only the body root, while the head at `:482-490` has no jaw child; fix: add a named jaw child with `role: "jaw"` and upper/lower mouthparts on the head, positioned to read between the claws.

### brassDiver

Second pass replaces the first-pass clean verdict.

- [P0] The diver has no separate jaw joint or jaw geometry — evidence: current report skeleton has `head` and `portHinge` but no `jaw`; `snaps/brassDiver/B/snaps/v02-head.png` shows a fixed illustrated face behind the front port, with no independently hinged lower jaw — cause: `samples/brassDiver.ts:212-232` creates only hips/spine/neck/head for the creature, while `:362-393` puts the entire face on the static `portGlass` texture — fix: add a named `jaw` joint under `head` and make the lower face/jaw a separate part that can open, rather than baking the whole face into the port texture.

### amigurumiNarwhal

- [P0] the narwhal has an embroidered smile but no separate lower jaw or jaw-role joint — evidence: `snaps/amigurumiNarwhal/B/snaps/v03-head.png` and `v03-flex-a.png`/`v03-flex-b.png` show a continuous muzzle with no opening; `v03-report.json` has 17 parts and 18 joints but no `jaw` group/joint — cause: `samples/amigurumiNarwhal.ts:460-486` builds the face/smile without a jaw-bound lower muzzle — fix: add a `jaw` joint parented to `head`, put the lower muzzle/mouth on it, and keep the upper muzzle on `head`.

### origamiDragon

- [P0] Both large horns are visibly detached and floating above the skull — evidence: v03 head shot `snaps/origamiDragon/B/snaps/v03-head.png`, v03 sheet head close-up, current preview `preview/origamiDragon/three-quarter.png`; report-only also flags hornL/hornR 48–54 mm from the head — cause: `samples/origamiDragon.ts:182-193` sets `hornBase = P(hb, s * 0.07, 0.13, -0.02)`, above/outside the skull surface — fix: derive each horn base from a head surface point or lower/inset the base until the horn physically meets the skull, while keeping the horn on the head bone.

### hammerheadShark

- [P0] Posterior dorsal fin is detached from the shark body — evidence: report-only loose-part measurement `slab.tail.2` is 48 mm from the body (side shot shows the small second dorsal fin at the tail junction); cause: `samples/hammerheadShark.ts:539-556` places `dorsal2FinPolygon` on `tail1` but its base does not meet the tail surface — fix: move/reshape the polygon base onto the tail1 body (or bridge the gap) while retaining its tail1 bone.

### chibiMechPilot

Second pass replaces the first-pass clean verdict.

- [P0] The raised visor is visibly floating above the helmet rather than hinged to the brow — evidence: `snaps/chibiMechPilot/B/snaps/v05-sdk-head.png` shows a clear gap between the visor and helmet shell; current preview measures the `visorHinge` group ↔ `head` at 19.0 mm and the report lists `extrude.visorHinge` as a loose part — cause: `samples/chibiMechPilot.ts:49,206-214` places the hinge/visor at y = 0.865–0.900 while the head shell surface ends below it — fix: move the hinge and visor down/forward until the hinge contacts the helmet shell and the visor reads as a single hinged assembly, preserving its `visorHinge` bone.

### blacksmithForgeAstra

- [P0] the glowing half-forged blade is suspended/mis-oriented through the rack rather than resting on the bench/anvil — evidence: `snaps/blacksmithForgeAstra/B/snaps/v04-side.png`, `v04-three-quarter.png`, and `v04-top.png` show the pale blade detached from the work surface — cause: `samples/blacksmithForgeAstra.ts:173-178` creates the blade with an upright extrude frame at `[0.38,0.8,0.32]` — fix: orient and place the blade on the bench/anvil, and connect its handle/blade assembly to the intended support.

### warthogAstra

- [P0] Several facial wart spheres float away from the head — evidence: head close-up visibly shows detached cheek/brow spheres; current report-only lists four loose head clusters (`sphere.head.3` gap 14 mm, `sphere.head.8` 13 mm, `sphere.head.12` 11 mm, `sphere.head.7` 10 mm) — cause: wart parts are placed as independent head spheres at `samples/warthogAstra.ts:121-143` — fix: seat each wart on a `surface(head)` hit (or increase its embed/offset toward the skull) until the measured gaps are gone.

### articulatedDeskLamp

Second-pass current-only audit; no earlier snapshot.

- [P0] Power switch is visibly detached from the weighted base — evidence: current preview three-quarter shot shows the black switch body hovering behind the base; `npm run preview -- articulatedDeskLamp --gap powerSwitch weightedBase` measures a 16.7 mm gap (`powerSwitch` closest point `[0,0.185,-0.167]`, `weightedBase` `[0,0.170,-0.160]`) — cause: `samples/articulatedDeskLamp.ts:282-287` places the switch at y=0.22 while the base surface ends near y=0.17 at that rear location — fix: move the switch down and/or into the base until it overlaps the rear base surface (retain the cable entry).

### barnOwl

- [P0] both feet hover above the floor — evidence: `snaps/barnOwl/B/snaps/v07-lowpoly-front.png` and `v07-lowpoly-report.json` bounds y = 0.0129..1.0583 m with the lowest toes 13 mm above y = 0 — cause: `samples/barnOwl.ts:271-312` places the leg/toe contact geometry above the floor — fix: lower the toe/foot construction or shift the finished owl down about 13 mm so the lowest toes contact y = 0.

## P1

### pico8Rooster

Second pass replaces the first-pass clean verdict.

- [P1] Both eye cubes are mounted on top of the skull instead of the face, leaving the front/three-quarter head effectively eyeless — evidence: `snaps/pico8Rooster/B/snaps/v03-head.png` shows `eyeL` and `eyeR` as two white cubes on the crown; `v03-sheet.jpg` front, three-quarter, and low-hero panels show the same placement; current preview bounds put both eyes at y = 0.720–0.734 and z = 0.304–0.341 while the beak is lower/front — cause: `samples/pico8Rooster.ts:108-115` uses `head.local([s * 0.07, 0.075, 0.132])` and `head.dir([0, 0, 1])`; with a forward-facing head, local z is up, not forward — fix: place the eyes with the forward/up axes swapped (approximately `[s * 0.07, 0.132, 0.075]`) and aim their textured face along the head's forward axis.

### codexJaguarWarrior

- [P1] The open-jaw jaguar helmet has no readable lower jaw: only the upper muzzle/teeth are visible while the dark warrior face hangs as a separate block beneath it — evidence: `v04-head.png` and `v04-three-quarter.png` show a large open gap under the golden muzzle with no matching lower-jaw plate — cause: `samples/codexJaguarWarrior.ts:243-257` builds the jaw parts at y = 1.435–1.465 behind/under the face sphere at lines 227-232, so they are occluded — fix: move/extend the jaw geometry forward beneath the muzzle, keep it on `jaw`, and leave the warrior face behind it so the upper/lower helmet jaws read as one hinged mouth.

### marginaliaSnailKnight

- [P1] The rabbit knight's face has no readable mouth/muzzle in the front or head close-up — evidence: `v02-front.png` and `v02-head.png` show a smooth brown head with an eye but no visible mouth, while only the tiny jaw/chin and teeth geometry is present; cause: `samples/marginaliaSnailKnight.ts:87-115` uses a 26 mm jaw sphere and 9 mm teeth at `jaw.local(...)`; fix: enlarge and move the muzzle/jaw pieces toward the face and add a dark mouth line that reads at the sample's scale.

### feltPlushSloth

Second pass replaces the first-pass clean verdict.

- [P1] Eye-button embellishments are visibly skewed/flattened across the eye patches instead of sharing the patch surface normal — evidence: `snaps/feltPlushSloth/B/snaps/v07-head.png` shows the eye patch/button stacks with a narrow sideways thread/button sliver rather than concentric surface-facing accents — cause: `samples/feltPlushSloth.ts:210-229` feeds `patch.moved(...)` into `b.stick` for the shank/button/lid details, while `src/frame.ts:51-53` passes `quat.invert()` as the moved frame quaternion and derives its facing from that inverted quaternion — fix: preserve the original quaternion in `Frame.moved()` and use a clone only for the facing conversion, then rerender the eye details and confirm both stacks stay normal to the skull.

### redLionfishAstra

Second pass rejects the first-pass P0 floor finding: the 0.25 m swimming elevation is intentional; keep it.

- [P1] Brow tentacles read as thick crossed antlers over the eyes rather than feathery supra-orbital filaments — evidence: `snaps/redLionfishAstra/B/snaps/v02-sheet.jpg` front/three-quarter and `v02-head.png` show the two beige branches crossing the brow; cause: `samples/redLionfishAstra.ts:204-222` roots each sprout close to the eye and gives it a short inward curve with only two tiny barbs per station — fix: move each root/tip outward from the eye line and add a clear side-barb/fringe set without crossing the face.

### warthogOx

- [P1] Ears read as oversized circular discs rather than warthog ears — evidence: v02 head close-up and front/three-quarter sheet show two broad round plates dominating the top of the head, unlike the intended small leaf-shaped ears — cause: ear extrudes use the very broad outline/orientation at `samples/warthogOx.ts:171-189` — fix: use a narrower pointed leaf outline and seat/rotate it against the skull so the ear silhouette is triangular and smaller.

### vgaSkeletonWarrior

Second pass replaces the first-pass clean verdict.

- [P1] The blue torn-tabard strap is a free-floating vertical strip rather than attached clothing — evidence: `snaps/vgaSkeletonWarrior/B/snaps/v03-front.png` shows a clear gap between the strap and the exposed ribs, and current report-only identifies `part.tornTabardStrap` as 13 mm from `sweep.ribs.8` — cause: `samples/vgaSkeletonWarrior.ts:270` hard-codes the strap box at `z = 0.165`, away from the rib surfaces and with no attachment to the tabard — fix: seat the strap against the front rib/clavicle surface and overlap or connect its lower end to the tabard/belt instead of leaving it as an unattached box.

### ukiyoeKappa

Second pass replaces the first-pass clean verdict.

- [P1] Four vermilion studs pinning the plastron visibly float off its corners — evidence: `snaps/ukiyoeKappa/B/snaps/v03-three-quarter.png` and `v03-head.png` show the red corner balls separated from the cream plastron; current report `loose` clusters `part52`–`part55` measure 4.5 mm and 12.1 mm gaps to `extrude.spine1` — cause: `samples/ukiyoeKappa.ts:117-123` places sphere centres at fixed `z = 0.168` instead of seating them on the plastron surface — fix: derive each stud from a plastron surface hit / move it outward until its radius overlaps the plate, preserving the four corner positions.

## P2

- `juniperBonsai` — Training wire is too finely tessellated: report-only identifies `trainingWire` at 684 triangles and a 4 mm mean edge. Cause: `samples/juniperBonsai.ts:491` sweeps the copper wire around the branch. Fix: reduce radial/path segments or replace the wire detail with a simpler primitive/paint while preserving the branch rig. The second pass explicitly retains this P2.

## Clean

`alebrijeJaguar`, `amigaSeaTurtle`, `arcadeTentacleAlien`, `artDecoFalcon`, `artDecoRobotButler`, `artNouveauDragonfly`, `atariAnglerfish`, `axolotl`, `bengalTiger`, `biomechSwarmQueen`, `bisonBull`, `blacksmithForgeGemini`, `blacksmithForgeKimi`, `blacksmithForgeOx`, `blacksmithForgeSonnet`, `blossomDeer`, `bobaSlime`, `broomWitchling`, `bunnyBakeryIsland`, `cactusGunslinger`, `chestMimic`, `chibiKnight`, `clayWalrus`, `claymationBadgerChef`, `clockworkAutomaton`, `clockworkCarousel`, `clockworkCrocodile`, `clockworkOwl`, `clockworkStag`, `cloudSheep`, `curiosityJackalope`, `cyberpunkNoodleStall`, `delftWindmillDiorama`, `dieselpunkWarElephant`, `dosBasilisk`, `dreadKnight`, `dromedaryCaravan`, `eggshellDragonling`, `flowerHedgehog`, `flyingFox`, `gameboyFrog`, `gingerbreadGolem`, `giraffe`, `goldenPheasant`, `graffitiSkateRat`, `griffin`, `hamsterRover`, `hedgehogPostie`, `highlandCow`, `honeyBee`, `hummingbirdAtFlower`, `hydra`, `indianPeafowl`, `inkwashCrane`, `islandTortoise`, `jadeSerpent`, `jetpackPenguinMerc`, `jrpgCockatrice`, `koiCarp`, `koiPondIsland`, `komodoDragon`, `lantern`, `lanternGhost`, `leafTanuki`, `leafySeadragon`, `lifeguardBlob`, `lifeguardContour`, `lifeguardControl`, `lifeguardSculpt`, `lighthouseCove`, `littleLich`, `mantaRay`, `mochiCatBaker`, `moonJellyfish`, `moose`, `mossStoneGolem`, `mushroomGolemBoss`, `mushroomVillage`, `neonScorpion`, `nesBoar`, `nileCrocodile`, `octopusBarista`, `oldFisherman`, `orcBerserkerAstra`, `orcBerserkerGemini`, `orcBerserkerKimi`, `orcBerserkerOx`, `orcBerserkerSonnet`, `oreBeetle`, `owlbear`, `pangolin`, `paperDragonKite`, `pastelUnicornFoal`, `peacock`, `penguinIceCreamCart`, `picturebookReef`, `pixelCapybara`, `pixelHarvestVillage`, `pixelMammoth`, `porcelainElephant`, `ps1CaveSpider`, `ps1Raptor`, `rainyBusStopDiorama`, `ramFawn`, `redFox`, `redKangaroo`, `redLionfishGemini`, `redLionfishKimi`, `redLionfishOx`, `redLionfishSonnet`, `retroActionHero`, `robotGardener`, `rubberhoseCat`, `sailfish`, `samuraiWarrior`, `scarecrow`, `secretaryBirdAstra`, `secretaryBirdGemini`, `secretaryBirdKimi`, `secretaryBirdOx`, `secretaryBirdSonnet`, `siegeSnail`, `silverbackGorilla`, `sleepySloth`, `snowLeopard`, `sprinterBlob`, `sprinterContour`, `sprinterControl`, `sprinterSculpt`, `stagBeetle`, `stainedGlassMoth`, `steamLocomotive`, `stegosaurus`, `strawberryBunny`, `sushiCat`, `synthwaveHoverbike`, `teapotDragon`, `tentacleSerpent`, `tinToyCrab`, `tinToyDragon`, `toonFennec`, `toonRedPanda`, `treehouseDiorama`, `triceratops`, `tyrannosaurus`, `ukiyoeOctopus`, `veiledChameleon`, `vikingLongship`, `wanderingMerchant`, `warthogKimi`, `warthogSonnet`, `wyvern`.

## SDK patterns

These are shared SDK fixes or documented limitations, not reasons to delete or individually work around correct sample code. SDK IDs and impact lists come from the accompanying triage reports; only the eye-button symptom was independently added as a per-sample defect by the second-pass auditors.

- **FRAMEMATH-1 (P0 SDK; visible P1 eye defect in the sloth):** `Frame.moved()` corrupts orientation (`src/frame.ts:51-54`); preserve the original quaternion and invert a clone for facing conversion, then rerender affected `stick`/`cards` consumers: `blossomDeer`, `feltPlushSloth`, `hedgehogPostie`, `inkwashCrane`, `islandTortoise`, `lifeguardSculpt`, `mossStoneGolem`, `orcBerserkerSonnet`, `pangolin`, `pixelMammoth`, `porcelainElephant`, `robotGardener`, `scarecrow`, `secretaryBirdSonnet`, `sprinterSculpt`, `warthogKimi`, `warthogSonnet`. Point-only uses are not orientation failures. Source: `triage-frameikskel.md`; visual confirmation: `audit-c-second.md`.

- **OUTLINE-1 (P1):** axis-closing lathes emit zero-area faces/zero normals; fix pole tessellation in `src/outline.ts`, not each sample. Affected slugs: `alebrijeJaguar`, `axolotl`, `artDecoFalcon`, `blacksmithForgeKimi`, `blacksmithForgeOx`, `blacksmithForgeSonnet`, `blossomDeer`, `bunnyBakeryIsland`, `cactusGunslinger`, `chibiKnight`, `clockworkAutomaton`, `clockworkCarousel`, `clockworkCrocodile`, `clockworkOwl`, `clockworkStag`, `curiosityJackalope`, `dieselpunkWarElephant`, `dosBasilisk`, `dromedaryCaravan`, `gbcSlimeKing`, `goldenPheasant`, `graffitiSkateRat`, `griffin`, `hamsterRover`, `hedgehogPostie`, `honeyBee`, `indianPeafowl`, `inkwashCrane`, `jadeSerpent`, `koiPondIsland`, `leafTanuki`, `littleLich`, `mantaRay`, `marginaliaSnailKnight`, `mochiCatBaker`, `neonScorpion`, `octopusBarista`, `oldFisherman`, `orcBerserkerOx`, `orcBerserkerSonnet`, `paperDragonKite`, `penguinIceCreamCart`, `picturebookReef`, `pixelCapybara`, `pixelMammoth`, `porcelainElephant`, `sailfish`, `scarecrow`, `secretaryBirdGemini`, `sleepySloth`, `steamLocomotive`, `stegosaurus`, `teapotDragon`, `tinToyCrab`, `tinToyDragon`, `toonRedPanda`, `treehouseDiorama`, `triceratops`, `ukiyoeKappa`, `vgaSkeletonWarrior`, `wanderingMerchant`, `wyvern`. Source: `triage-outlinedocs.md`; no distinct render artefact was confirmed by that triage.

- **EXPERIMENTAL-1 (P1):** zero contour reaches create degenerate hair-cap faces/zero normals in `lifeguardContour`, `sprinterContour`; handle collapsed sections in `contour()`/sweep, or validate and update the two hair profiles together. Source: `triage-loftdistexp.md`; numeric defect confirmed, not visually distinct at 900 px.

- **BAKE-3 / TOOLING-2 (P1, same growth mechanism):** per-part z-fight scaling changes export coordinates and contaminates gap/bounds measurements; remove growth from model/export/measurement geometry in `harness/assemble.ts`. Scope is every audited slug whose sample export has more than one visible mesh; the category lists above provide the complete slug roster. Source: `triage-bakepath.md`; use its exact-geometry fix rather than retaining inflated exports.

- **DISTRIBUTE-3 (P1 type contract):** positive-count sprout chains remain nullable; strengthen SDK return types rather than adding sample workarounds. Named callers: `amigurumiNarwhal`, `axolotl`, `bobaSlime`, `chibiMechPilot`, `juniperBonsai`, `koiPondIsland`, `marginaliaSnailKnight`, `redLionfishAstra`, `redLionfishKimi`, `redLionfishSonnet`, `tentacleSerpent`, `treehouseDiorama`. Source: `triage-loftdistexp.md`.

- **SURFACE-2 (intended limitation; docs guidance only):** drape routes inherit the first hit weights. Document pose-safe explicit chain binding for `amigurumiNarwhal`, `dreadKnight`, `lifeguardSculpt`, `orcBerserkerOx`, `orcBerserkerSonnet`, `sprinterSculpt`; do not relabel their clean render audits as confirmed tearing. Source: `triage-surfmembrane.md`.

- **DOCS-1 (P2 docs gap):** closed polygonal sweep corners intentionally use overlapping round caps, unlike smooth welded seams. Clarify the docs; keep `blacksmithForgeOx`, `hamsterRover`, `tinToyCrab`, `wyvern` unchanged. Source: `triage-outlinedocs.md`.
