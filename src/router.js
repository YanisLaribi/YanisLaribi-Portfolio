import { createRouter, createWebHashHistory } from "vue-router";
import Scene3D from "./components/Scene3D.vue";
import DesktopApp from "./components/DesktopApp.vue";

const routes = [
  { path: "/", name: "scene", component: Scene3D },
  { path: "/desktop", name: "desktop", component: DesktopApp },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
