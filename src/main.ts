import MyApp from "./app-ui/MyApp.svelte";

import "./main.css";
import { mount } from "svelte";
import { Vec6 } from "./math/Vec6";

// mount app
const element = document.querySelector(".SvelteOutlet")!;
mount(MyApp, { target: element });

Object.assign(globalThis, { Vec6 })
