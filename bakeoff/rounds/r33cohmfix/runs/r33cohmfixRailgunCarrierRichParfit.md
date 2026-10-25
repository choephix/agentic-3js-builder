Cause: the module is ESM, but `buildHullLower` calls `require(...)` for `mergeGeometries`, which Node rejects as ambiguous module syntax; it needs a static import instead.

<<<<<<< SEARCH
import * as THREE from "three";
=======
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
>>>>>>> REPLACE

<<<<<<< SEARCH
  const { mergeGeometries } = require("three/addons/utils/BufferGeometryUtils.js");
  const merged = mergeGeometries(studs);
=======
  const merged = mergeGeometries(studs);
>>>>>>> REPLACE