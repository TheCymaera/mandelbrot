import MyApp from "./app-ui/MyApp.svelte";

import "./main.css";
import { mount } from "svelte";
import { Vec6 } from "./math/Vec6";
import { Mat6 } from "./math/Mat6";

// mount app
const element = document.querySelector(".SvelteOutlet")!;
mount(MyApp, { target: element });

Object.assign(globalThis, { Vec6, Mat6 })


//const rot = Math.PI / 2;
//const m1 = Mat6.rotationFromAxisIndices(0, 1, rot);
//const m2 = Mat6.rotationFromAxes(Vec6.fromIndex(0), Vec6.fromIndex(1), rot);

//console.log("m1", m1);
//console.log("m2", m2);

//console.log("m1", m1.multiplyVec6(new Vec6(1,0,0,0,0,0)));
//console.log("m2", m2.multiplyVec6(new Vec6(1,0,0,0,0,0)));