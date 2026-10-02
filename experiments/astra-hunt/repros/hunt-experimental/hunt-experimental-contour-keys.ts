import {contour} from '../../../../src/experimental/contour';
for(const key of [[[0,.1],[0,.2]],[[.2,.1],[.2,.3]],[[0,.1],[.5,.2],[.5,.4],[1,.1]]] as ReadonlyArray<ReadonlyArray<readonly [number,number]>>[]){const c=contour({front:key,back:.05,side:.05}); console.log(JSON.stringify(key),c.knots,[0,.1,.2,.5,1].map(t=>c.reach(t)),[0,.1,.2,.5,1].map(t=>c.polygon(t,8).some(q=>q.some(Number.isNaN))))}
