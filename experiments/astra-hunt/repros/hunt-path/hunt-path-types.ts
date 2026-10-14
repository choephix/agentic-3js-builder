import { catmull, polyline, bezier, spiral } from "../../../../src/path";
const stations = [[0, 0, 0], [1, 0, 0], [2, 1, 0]];
catmull(stations);
polyline(stations);
const p = stations[0];
bezier(p, stations[1], stations[2]);
spiral([0, 0, 0], stations[0], [0, 1, 0], { turns: 1 });
