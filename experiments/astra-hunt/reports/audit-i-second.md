# Audit group i — second pass

## ukiyoeKappa — latest v03; current: typecheck clean, report-only differs: four loose plastron studs (4.5–12.1 mm gaps)
- Verdict: minor
- [P1] Four vermilion studs pinning the plastron visibly float off its corners — evidence: `snaps/ukiyoeKappa/B/snaps/v03-three-quarter.png` and `v03-head.png` show the red corner balls separated from the cream plastron; current report `loose` clusters `part52`–`part55` measure 4.5 mm and 12.1 mm gaps to `extrude.spine1` — cause: `samples/ukiyoeKappa.ts:117-123` places sphere centres at fixed `z = 0.168` instead of seating them on the plastron surface — fix: derive each stud from a plastron surface hit / move it outward until its radius overlaps the plate, preserving the four corner positions.

## vgaSkeletonWarrior — latest v03; current: typecheck clean, report-only differs: torn tabard strap is 13 mm from the ribs
- Verdict: needs fix
- [P1] The blue torn-tabard strap is a free-floating vertical strip rather than attached clothing — evidence: `snaps/vgaSkeletonWarrior/B/snaps/v03-front.png` shows a clear gap between the strap and the exposed ribs, and current report-only identifies `part.tornTabardStrap` as 13 mm from `sweep.ribs.8` — cause: `samples/vgaSkeletonWarrior.ts:270` hard-codes the strap box at `z = 0.165`, away from the rib surfaces and with no attachment to the tabard — fix: seat the strap against the front rib/clavicle surface and overlap or connect its lower end to the tabard/belt instead of leaving it as an unattached box.

## synthwaveHoverbike — latest v08-sdk; current: typecheck clean, report-only same (expected hover warning at min y = 0.300 m)
- Verdict: clean
- Clean (correcting the first pass): the 0.300 m clearance is intentional for the riderless *hoverbike*, whose meta describes glowing hover pads and whose source explicitly stacks the pad core to y = 0.30 (`samples/synthwaveHoverbike.ts:146-176`); `v08-sdk-sheet.jpg` shows the pads coherently under the chassis, with no detached parts.

## Agreed clean
- stainedGlassMoth (v03), steamLocomotive (v02), stegosaurus (v10-lowpoly), strawberryBunny (v02), sushiCat (v02), teapotDragon (v03), tentacleSerpent (v02-lowpoly), tinToyCrab (v03), tinToyDragon (v03), toonFennec (v03), toonRedPanda (v03), treehouseDiorama (v02), triceratops (v07-lowpoly), tyrannosaurus (v03), ukiyoeOctopus (v03), veiledChameleon (v10-lowpoly): sheets plus relevant head/side/flex views show the expected anatomy/signature details, attached parts and jaw/limb counts; each current typecheck is clean, report issues are empty, and all counts/bounds remain within contract.
