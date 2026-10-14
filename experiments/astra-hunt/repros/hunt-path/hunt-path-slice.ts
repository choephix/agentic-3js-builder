import { polyline } from "../../../../src/path";
const p=polyline([[0,0,0],[1,0,0],[1,1,0]]);
for (const [a,b] of [[0,1],[1,0],[.2,.8],[.8,.2]] as const) {
 const q=p.slice(a,b);
 console.log(a,b,{at0:q.at(0).toArray(),at1:q.at(1).toArray(),t0:q.tangentAt(0).toArray(),t1:q.tangentAt(1).toArray(),knots:q.knots});
}
