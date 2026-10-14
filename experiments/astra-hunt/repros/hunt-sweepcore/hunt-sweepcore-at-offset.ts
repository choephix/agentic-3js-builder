import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
const b=createBuilder({name:'offset'}); b.joint('r',{at:[0,0,0]});
const sw=b.sweep([[0,0,0],[0,0,1],[.8,0,1.4],[1.5,0,.7],[1.5,0,0]],.05,{color:'#fff'});
const surface=b.surface(sw);
for(const t of [.13,.27,.41,.55,.69,.83]){const q=sw.at(t,35).at;const hit=surface.nearest(q);console.log(t,{d:q.distanceTo(hit.at),q:q.toArray(),hit:hit.at.toArray()});}
