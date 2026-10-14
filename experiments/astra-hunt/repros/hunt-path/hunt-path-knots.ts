import { arc, spiral } from "../../../../src/path";
for (const angle of [45, 90, 100, 135, 200]) {
  const p=arc([0,0,0],[1,0,0],[0,1,0],angle);
  console.log("arc",angle,"knots",p.knots,"angles",p.knots.map(t=>t*angle));
}
for (const turns of [0.5,1,1.15,1.5,2.25]) {
  const p=spiral([0,0,0],[1,0,0],[0,1,0],{turns});
  console.log("spiral",turns,"knots",p.knots,"quarterTurns",p.knots.map(t=>t*turns*4));
}
