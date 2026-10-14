import * as THREE from "three";
import build, { debug } from "./hunt-biped-orc";

const root = build();
const b = debug.b;
const chest = debug.chest;
const armR = debug.armR;
const handR = debug.handR;
const weaponBone = debug.weaponBone;
const belt = debug.belt;
const strap = debug.strap;
const chestDecal = debug.chestDecal;
const jawDecal = debug.jawDecal;
const feet = debug.feet;
if (!b || !chest || !armR || !handR || !weaponBone || !belt || !strap || !chestDecal || !jawDecal || !feet)
  throw new Error("sample did not expose all debug handles");

function meshPositions(mesh: THREE.Mesh) {
  const attr = mesh.geometry.getAttribute("position");
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < attr.count; i++) out.push(new THREE.Vector3().fromBufferAttribute(attr, i).applyMatrix4(mesh.matrixWorld));
  return out;
}
function bounds(mesh: THREE.Object3D) {
  return new THREE.Box3().setFromObject(mesh, true);
}
function centroid(points: readonly THREE.Vector3[]) {
  const c = new THREE.Vector3();
  for (const p of points) c.add(p);
  return c.multiplyScalar(1 / points.length);
}
function finite(points: readonly THREE.Vector3[]) {
  return points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
}
function firstMesh(sweep: { meshes: readonly THREE.Mesh[] }) {
  const mesh = sweep.meshes[0];
  if (!mesh) throw new Error("sweep has no mesh");
  return mesh;
}
function surfaceDistance(mesh: THREE.Mesh, surface: { nearest(point: THREE.Vector3): { at: THREE.Vector3 } }) {
  const points = meshPositions(mesh);
  return points.reduce((sum, point) => sum + point.distanceTo(surface.nearest(point).at), 0) / points.length;
}

root.updateMatrixWorld(true);
const torsoSurface = b.surface(debug.torso!);
const beltMesh = firstMesh(belt);
const strapMesh = firstMesh(strap);
const weaponMesh = root.getObjectByName("weaponGrip");
if (!(weaponMesh instanceof THREE.Mesh)) throw new Error("weapon grip mesh missing");
const beltBefore = centroid(meshPositions(beltMesh));
const strapBefore = centroid(meshPositions(strapMesh));
const beltSurfaceGapBefore = surfaceDistance(beltMesh, torsoSurface);
const strapSurfaceGapBefore = surfaceDistance(strapMesh, torsoSurface);
const chestDecalBefore = centroid(meshPositions(chestDecal.mesh));
const jawDecalBefore = centroid(meshPositions(jawDecal.mesh));
const handBefore = handR.at.clone();
const weaponBefore = weaponBone.at.clone();

b.pose(chest, { axis: [0, 0, 1], deg: 22 });
b.pose(armR.joints[1], { axis: [0, 0, 1], deg: -35 });
const after = b.root;
after.updateMatrixWorld(true);
const beltSurfaceGapAfter = surfaceDistance(beltMesh, torsoSurface);
const strapSurfaceGapAfter = surfaceDistance(strapMesh, torsoSurface);
const beltAfter = centroid(meshPositions(beltMesh));
const strapAfter = centroid(meshPositions(strapMesh));
const chestDecalAfter = centroid(meshPositions(chestDecal.mesh));
const jawDecalAfter = centroid(meshPositions(jawDecal.mesh));
const handAfter = handR.at.clone();
const weaponAfter = weaponBone.at.clone();
const gripCenter = new THREE.Vector3();
weaponMesh.getWorldPosition(gripCenter);
const rootBounds = bounds(after);
const footBounds = feet.map((foot) => {
  const near = root.getObjectByName(foot.x > 0 ? "bootL" : "bootR");
  return near ? bounds(near) : null;
});

console.log(
  JSON.stringify(
    {
      rig: after.userData.rig,
      digitNames: after.userData.rig?.chains?.filter((chain: { role: string }) => chain.role === "digit").map((chain: { joints: string[] }) => chain.joints),
      floor: { rootMinY: rootBounds.min.y, boots: footBounds.map((box) => box?.min.y ?? null) },
      weapon: {
        bindHandWeaponGap: handBefore.distanceTo(weaponBefore),
        posedHandWeaponGap: handAfter.distanceTo(weaponAfter),
        gripCenter: gripCenter.toArray(),
        hand: handAfter.toArray(),
      },
      clothing: {
        beltBefore: beltBefore.toArray(),
        beltAfter: beltAfter.toArray(),
        beltMove: beltBefore.distanceTo(beltAfter),
        beltSurfaceGapBefore,
        beltSurfaceGapAfter,
        strapBefore: strapBefore.toArray(),
        strapAfter: strapAfter.toArray(),
        strapMove: strapBefore.distanceTo(strapAfter),
        strapSurfaceGapBefore,
        strapSurfaceGapAfter,
      },
      decals: {
        chestBefore: chestDecalBefore.toArray(),
        chestAfter: chestDecalAfter.toArray(),
        jawBefore: jawDecalBefore.toArray(),
        jawAfter: jawDecalAfter.toArray(),
        chestFinite: finite(meshPositions(chestDecal.mesh)),
        jawFinite: finite(meshPositions(jawDecal.mesh)),
      },
    },
    null,
    2,
  ),
);
