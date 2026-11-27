// Gil's Grocery — 3D floor map viewer + developer Store Builder.
// Loaded on demand (dynamic import) so three.js only downloads when someone opens 3D.
import * as THREE from "three";
import { findDoor, routeTo, arrowsAlong } from "./route.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ── shared data helpers ───────────────────────────────────────────────────────
export const KINDS = {
  shelf:    { name: "Shelf",           h: 5,    w: 6,   d: 2,   color: "#1a2a14" },
  cooler:   { name: "Cooler",          h: 7,    w: 4,   d: 3,   color: "#0e2030" },
  freezer:  { name: "Ice cream chest", h: 3,    w: 5,   d: 2.5, color: "#0e2a3a" },
  counter:  { name: "Counter",         h: 3.5,  w: 8,   d: 3,   color: "#2a1e0a" },
  case:     { name: "Display case",    h: 3.5,  w: 6,   d: 2.5, color: "#2a1a1a" },
  table:    { name: "Table",           h: 3,    w: 3,   d: 3,   color: "#2a1a0a" },
  separator:{ name: "Rack separator",  h: 5.5,  w: 0.5, d: 6,   color: "#0d0d0d" },
  floor:    { name: "Floor area",      h: 0.05, w: 10,  d: 10,  color: "#141a14" },
};
const COLORS = [
  ["#1a2a3a","Wine"],["#0e2030","Beer / cooler"],["#0e2a3a","Ice cream"],["#2a1a14","Candy"],
  ["#1e2a1e","Snacks"],["#1a2a14","Grocery"],["#2a1a1a","Cigar"],["#1a1e2a","Cards"],
  ["#1a1a2a","Print"],["#1a2a2a","Household"],["#2a1e0a","Counter"],["#141a14","Back room"],["#0d0d0d","Separator"],
];
const r2 = v => Math.round(v * 100) / 100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = s => (s || "zone").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "zone";

export function inferKind(key) {
  if (/back_room/.test(key)) return "floor";
  if (/rack_sep|separator/.test(key)) return "separator";
  if (/cooler|beer_case|beer_wine/.test(key)) return "cooler";
  if (/ice_cream|freezer/.test(key)) return "freezer";
  if (/counter/.test(key)) return "counter";
  if (/cigar_case|case/.test(key)) return "case";
  if (/meat_block|table/.test(key)) return "table";
  return "shelf";
}
function inferHeight(key, kind) {
  if (/wine_rack|household/.test(key)) return 6;
  if (/newspaper/.test(key)) return 4;
  return KINDS[kind].h;
}
// app layout (% of store) → feet
export function toFeet(layout) {
  const size = { ...(layout.size || { w: 40, d: 33 }) }, f = (v, s) => r2(v / 100 * s);
  return {
    size,
    zones: (layout.zones || []).map(z => {
      const kind = z.kind && KINDS[z.kind] ? z.kind : inferKind(z.key);
      return { key: z.key, label: z.label || "", kind, x: f(z.x, size.w), z: f(z.y, size.d), w: f(z.w, size.w), d: f(z.h, size.d),
        h: +z.height || inferHeight(z.key, kind), color: z.color || KINDS[kind].color, tappable: z.tappable !== false, ...(z.rot != null ? { rot: +z.rot } : {}) };
    }),
    walls: (layout.walls || []).map(w => ({ x1: f(w.x1, size.w), z1: f(w.y1, size.d), x2: f(w.x2, size.w), z2: f(w.y2, size.d) })),
  };
}
// feet → app layout (%)
export function toPercent(st) {
  const { w: W, d: D } = st.size, p = (v, s) => r2(v / s * 100);
  return {
    size: { ...st.size },
    zones: st.zones.map(z => ({ key: z.key, label: z.label, x: p(z.x, W), y: p(z.z, D), w: p(z.w, W), h: p(z.d, D), color: z.color, tappable: z.tappable, kind: z.kind, height: z.h, ...(z.rot != null ? { rot: z.rot } : {}) })),
    walls: st.walls.map(w => ({ x1: p(w.x1, W), y1: p(w.z1, D), x2: p(w.x2, W), y2: p(w.z2, D) })),
  };
}

// ── shared scene pieces ───────────────────────────────────────────────────────
const UNIT = new THREE.BoxGeometry(1, 1, 1);
const UNIT_EDGES = new THREE.EdgesGeometry(UNIT);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 7);
UNIT.userData.shared = UNIT_EDGES.userData.shared = CYL.userData.shared = true;
const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const WALL_H = 9, WALL_T = 0.45, WALL_LOW = 0.7;

// Calm, theme-matched colors for the map (same values the 2D map uses in App.jsx MAP_LOOK)
export const LOOK = {
  // developer Store Builder workspace
  builder: { bg: "#14171d", floor: "#1e222a", grid: "#2a2f38", wall: "#535b67", body: "#4a515c", base: "#2b3038", metal: "#8d949e",
          fixL: 0.42, labelBg: "rgba(24,27,34,.9)", labelInk: "#e8eaee", labelLine: "rgba(255,255,255,.08)", hemi: [1.7, "#dfe6f5", "#2a2722"], sun: 2.1, sunColor: "#fff6e8", exposure: 1.05 },
  // Sims-style dollhouse in daylight
  light: { bg: "#8b9a62", grass: "#8b9a62", floor: "#ebe4d6", grout: "#d9d0bf", wallExt: "#3c3d42", wallInt: "#d9d1c1", wallCap: "#2b2c30",
          body: "#d5d7da", base: "#9a948a", metal: "#e2ddd3", wood: "#9a7453", fixL: 0.66,
          labelBg: "rgba(255,255,255,.94)", labelInk: "#1c1d20", labelLine: "rgba(0,0,0,.08)", hemi: [1.45, "#e4ecff", "#7d8656"], sun: 3.0, sunColor: "#ffe4bf", exposure: 1.0 },
  // same house, late afternoon
  dark: { bg: "#5f6b45", grass: "#6e7b4e", floor: "#d9d0bf", grout: "#c6bca9", wallExt: "#36373c", wallInt: "#cbc2b1", wallCap: "#26272a",
          body: "#c3c6ca", base: "#87817a", metal: "#d3cdc2", wood: "#8c6849", fixL: 0.6,
          labelBg: "rgba(24,27,34,.9)", labelInk: "#e8eaee", labelLine: "rgba(255,255,255,.08)", hemi: [1.0, "#c9d3ef", "#5c6442"], sun: 2.6, sunColor: "#ffcf96", exposure: 0.88 },
};
let look = LOOK.builder;
// fixture body tint: keep the hue, drop most of the saturation, sit at the theme's lightness
function calm(hex, L = look.fixL) {
  const c = new THREE.Color(hex), hsl = {}; c.getHSL(hsl);
  return new THREE.Color().setHSL(hsl.h, Math.min(0.32, hsl.s * 0.55), L);
}
// products on shelves: softer and less saturated than the raw palette
const SOFT = new Map();
function soft(hex) {
  let v = SOFT.get(hex);
  if (!v) { const c = new THREE.Color(hex), hsl = {}; c.getHSL(hsl); v = new THREE.Color().setHSL(hsl.h, hsl.s * 0.55, 0.38 + hsl.l * 0.42); SOFT.set(hex, v); }
  return v;
}
function disposeObj(o) {
  o.traverse(c => {
    if (c.isInstancedMesh) c.dispose();
    const ms = Array.isArray(c.material) ? c.material : c.material ? [c.material] : [];
    ms.forEach(m => { if (m.userData.shared) return; if (m.map && !m.map.userData.shared) m.map.dispose(); m.dispose(); });
    if (c.geometry && !c.geometry.userData.shared) c.geometry.dispose();
  });
}
function clearWorld(world) {
  world.children.slice().forEach(o => { world.remove(o); disposeObj(o); });
}
const rootOf = o => { while (o && o.userData.kind === undefined && o.userData.key === undefined) o = o.parent; return o; };
// listeners are attached before OrbitControls so a drag on a fixture can switch the camera off first
function createStage(host, { listeners = {}, bg = look.bg } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = look.exposure;
  const el = renderer.domElement;
  Object.assign(el.style, { display: "block", width: "100%", height: "100%", touchAction: "none" });
  host.prepend(el);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(bg);
  scene.fog = new THREE.Fog(bg, look.grass ? 140 : 70, look.grass ? 300 : 170);
  const camera = new THREE.PerspectiveCamera(look.grass ? 28 : 38, 1, 0.1, 600);   // narrower lens = flatter, dollhouse look
  scene.add(new THREE.HemisphereLight(look.hemi[1], look.hemi[2], look.hemi[0]));
  const sun = new THREE.DirectionalLight(look.sunColor, look.sun);
  sun.position.set(-34, 40, 18); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);   // low-ish sun: long shadows
  Object.assign(sun.shadow, { bias: -0.0004, normalBias: 0.03, radius: 5 });
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 120 });
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#e8eeff", look.sun * 0.35); fill.position.set(30, 25, -20); scene.add(fill);
  const world = new THREE.Group(); scene.add(world);
  const ctx = e => e.preventDefault();
  for (const [k, f] of Object.entries(listeners)) el.addEventListener(k, f);
  el.addEventListener("contextmenu", ctx);
  const controls = new OrbitControls(camera, el);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.12, maxPolarAngle: Math.PI / 2.15, minDistance: 6, maxDistance: 140 });
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(host); resize();
  let raf, onFrame = () => {};
  const loop = t => { raf = requestAnimationFrame(loop); controls.update(); onFrame(t); renderer.render(scene, camera); };
  raf = requestAnimationFrame(loop);
  return {
    renderer, scene, camera, controls, world, el,
    setFrame(f) { onFrame = f; },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      for (const [k, f] of Object.entries(listeners)) el.removeEventListener(k, f);
      el.removeEventListener("contextmenu", ctx);
      clearWorld(world); renderer.dispose(); renderer.forceContextLoss(); el.remove();
    },
  };
}
function aimCamera(stage, size, mode = "3d") {
  const span = Math.max(size.w, size.d);
  if (mode === "top") stage.camera.position.set(0, span * 1.75, 0.01);
  else if (mode === "diorama") {   // three-quarter view from the front-left corner, like a dollhouse
    const d = span * 0.6 / Math.tan(THREE.MathUtils.degToRad(stage.camera.fov) / 2);
    stage.camera.position.set(-0.56, 0.6, 0.58).normalize().multiplyScalar(d * 1.05);
  }
  else stage.camera.position.set(-span * 0.15, span * 0.95, span * 1.15);
  stage.controls.target.set(0, 0, 0); stage.controls.update();
}
// Small canvas textures, drawn once per palette
const TEX = new Map();
function canvasTex(key, px, draw) {
  let t = TEX.get(key);
  if (!t) {
    const c = document.createElement("canvas"); c.width = c.height = px; draw(c.getContext("2d"), px, rng(key));
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    t.userData.shared = true; TEX.set(key, t);
  }
  return t;
}
const shade = (hex, k) => "#" + new THREE.Color(hex).offsetHSL(0, 0, k).getHexString();
// 2 ft vinyl tiles with grout; one texture = 4 × 4 tiles (8 ft)
const tileTex = () => canvasTex("tile" + look.floor, 512, (g, n, r) => {
  g.fillStyle = look.grout; g.fillRect(0, 0, n, n);
  const t = n / 4;
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { g.fillStyle = shade(look.floor, (r() - 0.5) * 0.035); g.fillRect(a * t + 2, b * t + 2, t - 4, t - 4); }
});
// grass: base color with thousands of short blades in lighter and darker greens
const grassTex = () => canvasTex("grass" + look.grass, 256, (g, n, r) => {
  g.fillStyle = look.grass; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 2600; i++) {
    g.strokeStyle = shade(look.grass, (r() - 0.5) * 0.12); g.lineWidth = 1 + r();
    const x = r() * n, y = r() * n; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 2 - r() * 4); g.stroke();
  }
});
const concreteTex = () => canvasTex("concrete", 256, (g, n, r) => {
  g.fillStyle = "#a8a49c"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "0,0,0" : "255,255,255"},${0.03 + r() * 0.05})`; g.fillRect(r() * n, r() * n, 1 + r() * 2, 1 + r() * 2); }
});
function addFloor(world, size, diorama = false) {
  if (diorama) {
    const tex = tileTex().clone(); tex.userData.shared = false; tex.needsUpdate = true; tex.repeat.set(size.w / 8, size.d / 8);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(size.w, size.d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; world.add(floor);
    // the building sits on a slab a little above the lawn
    const slab = new THREE.Mesh(UNIT, mat("#b9b2a5", { r: 0.95 })); slab.scale.set(size.w + 1.2, 0.35, size.d + 1.2); slab.position.y = -0.18; slab.receiveShadow = true; world.add(slab);
    const g = grassTex().clone(); g.userData.shared = false; g.needsUpdate = true; g.repeat.set(60, 60);
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: g, roughness: 1 }));
    lawn.rotation.x = -Math.PI / 2; lawn.position.y = -0.34; lawn.receiveShadow = true; world.add(lawn);
    return;
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size.w, size.d), new THREE.MeshStandardMaterial({ color: look.floor, roughness: 0.92 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; world.add(floor);
  const n = Math.ceil(Math.max(size.w, size.d) / 2);
  const grid = new THREE.GridHelper(n * 2, n, look.grid, look.grid);
  grid.material.transparent = true; grid.material.opacity = 0.7;
  grid.scale.set(size.w / (n * 2), 1, size.d / (n * 2)); grid.position.y = 0.01; world.add(grid);
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: look.bg, roughness: 1 }));
  outside.rotation.x = -Math.PI / 2; outside.position.y = -0.02; outside.receiveShadow = true; world.add(outside);
}
function makeLabel(text, on, visible = true, onColor = "#f0c040", onInk = "#141005", screen = 0) {
  const c = document.createElement("canvas"), ctx = c.getContext("2d"), fs = on ? 46 : 40, pad = on ? 26 : 20;
  ctx.font = `${on ? 700 : 600} ${fs}px Inter, system-ui, sans-serif`;
  c.width = Math.ceil(ctx.measureText(text).width) + pad * 2; c.height = fs + 26;
  ctx.font = `${on ? 700 : 600} ${fs}px Inter, system-ui, sans-serif`;
  const r = c.height / 2, pill = () => { ctx.beginPath(); ctx.moveTo(r, 1); ctx.lineTo(c.width - r, 1); ctx.arc(c.width - r, r, r - 1, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(r, c.height - 1); ctx.arc(r, r, r - 1, Math.PI / 2, Math.PI * 1.5); };
  pill(); ctx.fillStyle = on ? onColor : look.labelBg; ctx.fill();
  if (!on) { ctx.lineWidth = 2; ctx.strokeStyle = look.labelLine; ctx.stroke(); }
  ctx.fillStyle = on ? onInk : look.labelInk; ctx.textBaseline = "middle"; ctx.fillText(text, pad, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  // screen > 0: keep the label this tall on screen whatever the zoom (sizeAttenuation off)
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: !screen }));
  const h = screen ? screen * (on ? 1.2 : 1) : on ? 1.25 : 0.95;
  s.scale.set(h * c.width / c.height, h, 1); s.renderOrder = on ? 11 : 10; s.visible = visible;
  return s;
}
// ── low-poly fixture models ───────────────────────────────────────────────────
// The model is picked from the fixture's name (Candy 2 → candy rack, Cooler 4 → glass-door cooler, …),
// so renaming a fixture in the builder changes what it looks like.
export function styleOf(z) {
  const t = (z.key + " " + (z.label || "")).toLowerCase(), k = z.kind;
  if (k === "separator" || /rack_sep|separator/.test(t)) return "separator";
  if (k === "floor" || /back.?room|storage|stock.?room/.test(t)) return "backroom";
  if (/ice.?chest|ice.?box|ice.?merch|bagged.?ice|^ice$|\bice\b(?!.?cream)/.test(t) && !/ice.?cream/.test(t)) return "icechest";
  if (/ice.?cream|freezer|frozen/.test(t) || k === "freezer") return "freezer";
  if (/cooler|beer.?case|beer.?wine|fridge|drink|soda/.test(t) || k === "cooler") return "cooler";
  if (/wine/.test(t)) return "wine";
  if (/counter|register|checkout/.test(t) || k === "counter") return "counter";
  if (/cigar|tobacco|humidor/.test(t) || k === "case") return "case";
  if (/meat|table|block/.test(t) || k === "table") return "table";
  if (/news|paper|magazine/.test(t)) return "news";
  if (/greeting|card/.test(t)) return "cards";
  if (/candy|gum|chocolate/.test(t)) return "candy";
  if (/snack|chip/.test(t)) return "snacks";
  if (/household|clean|soap|laundry/.test(t)) return "household";
  return "grocery";
}
const PAL = {
  candy: ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#8e44ad", "#f72585", "#4361ee", "#ff9f1c", "#06d6a0", "#ffffff"],
  snacks: ["#d62828", "#f77f00", "#fcbf49", "#2a9d8f", "#3a86ff", "#8338ec", "#ffbe0b"],
  grocery: ["#bc4749", "#f2e8cf", "#6a994e", "#386641", "#e9c46a", "#a7c957", "#264653", "#dda15e"],
  household: ["#4cc9f0", "#4361ee", "#ffffff", "#f72585", "#90be6d", "#f9c74f", "#277da1"],
  cards: ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff", "#ffffff"],
  drinks: ["#e63946", "#1d3557", "#2a9d8f", "#ffb703", "#fb8500", "#8ecae6", "#06d6a0", "#ef476f", "#ffffff", "#3a5a40"],
  wine: ["#4a0e1e", "#6b0f1a", "#1b4332", "#2d6a4f", "#c9a227", "#3d0c11", "#e9d8a6"],
  icecream: ["#f1faee", "#ffcad4", "#a8dadc", "#e9c46a", "#6f4518", "#ffafcc"],
  cigars: ["#7f4f24", "#936639", "#a68a64", "#b6ad90", "#582f0e", "#c9a227"],
  papers: ["#f4f1ea", "#e9e4d8", "#dcd6c8", "#f8f8f8"],
  boxes: ["#b98b52", "#a97c46", "#c79a62", "#9c7444"],
};
const MATS = new Map();
function mat(color, o = {}) {
  const k = color + "|" + [o.r, o.m, o.o, o.e].join(",");
  let m = MATS.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.75, metalness: o.m ?? 0.05, flatShading: true,
      transparent: o.o != null, opacity: o.o ?? 1, depthWrite: o.o == null,
      emissive: o.e ? new THREE.Color(color) : new THREE.Color(0), emissiveIntensity: o.e || 0 });
    m.userData.shared = true; MATS.set(k, m);
  }
  return m;
}
function rng(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
function part(g, w, h, d, material, x, y, z, cast = true) {
  const m = new THREE.Mesh(UNIT, material);
  m.scale.set(Math.max(w, 0.01), Math.max(h, 0.01), Math.max(d, 0.01));
  m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m;
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _eu = new THREE.Euler(), _sc = new THREE.Vector3(), _tr = new THREE.Vector3(), _col = new THREE.Color();
function items(g, list, geo = UNIT) {
  if (!list.length) return;
  const im = new THREE.InstancedMesh(geo, mat("#ffffff", { r: 0.6 }), list.length);
  list.forEach((it, i) => {
    _eu.set(it.rx || 0, it.ry || 0, 0); _q.setFromEuler(_eu); _tr.set(it.x, it.y, it.z); _sc.set(it.w, it.h, it.d);
    im.setMatrixAt(i, _m4.compose(_tr, _q, _sc)); im.setColorAt(i, _col.copy(soft(it.c)));
  });
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.receiveShadow = true; g.add(im);
}
// Which way the fixture faces: away from the wall it backs onto (if its long side runs along it), else toward the middle of the store.
function facing(z, size) {
  const edges = [["+z", z.z, z.w, z.d], ["-z", size.d - (z.z + z.d), z.w, z.d], ["+x", z.x, z.d, z.w], ["-x", size.w - (z.x + z.w), z.d, z.w]]
    .sort((a, b) => a[1] - b[1]);
  let front = null;
  for (const [dir, dist, along, across] of edges) { if (dist > 3.5) break; if (along >= across * 0.45) { front = dir; break; } }
  const wall = !!front;
  if (!front) {
    const cx = z.x + z.w / 2 - size.w / 2, cz = z.z + z.d / 2 - size.d / 2;
    front = z.w >= z.d ? (cz <= 0 ? "+z" : "-z") : (cx <= 0 ? "+x" : "-x");
  }
  if (z.rot != null) front = ROT_DIR[((Math.round(z.rot / 90) % 4) + 4) % 4];
  const alongZ = front[1] === "z";
  return { L: alongZ ? z.w : z.d, T: alongZ ? z.d : z.w, rot: { "+z": 0, "-z": Math.PI, "+x": Math.PI / 2, "-x": -Math.PI / 2 }[front], freestanding: !wall };
}
// rot (degrees) → which way the front faces: 0 toward the entrance, 90 right, 180 toward the back, 270 left
const ROT_DIR = ["+z", "+x", "-z", "-x"];
export function rotOf(z, size) { return z.rot != null ? z.rot : ROT_DIR.indexOf(facingDir(z, size)) * 90; }
function facingDir(z, size) { const f = facing({ ...z, rot: null }, size); return { 0: "+z", [Math.PI]: "-z", [Math.PI / 2]: "+x", [-Math.PI / 2]: "-x" }[f.rot]; }
// every model below is built with its length along x, depth along z, front facing +z, floor at y=0
function fillShelf(list, style, r, len, y, zc, sd, gap, side) {
  const sp = { candy: [0.22, 0.38, 0.25, 0.45], snacks: [0.45, 0.7, 0.55, 0.85], household: [0.35, 0.6, 0.5, 0.95], cards: [0.38, 0.42, 0.6, 0.72] }[style] || [0.3, 0.55, 0.4, 0.8];
  let x = -len / 2, n = 0;
  while (x < len / 2 - sp[0] && n++ < 60) {
    const w = sp[0] + r() * (sp[1] - sp[0]); if (x + w > len / 2) break;
    const h = Math.min(gap * 0.82, sp[2] + r() * (sp[3] - sp[2])), c = pick(r, PAL[style] || PAL.grocery);
    if (style === "cards") list.push({ x: x + w / 2, y: y + h / 2 + 0.03, z: zc, w, h, d: 0.05, rx: -side * 0.3, c });
    else { const d = sd * (0.55 + r() * 0.3); list.push({ x: x + w / 2, y: y + h / 2 + 0.03, z: zc + side * (sd - d) / 2 * 0.6, w, h, d, c }); }
    x += w + 0.05 + r() * 0.04;
  }
}
function gondola(g, L, T, H, dbl, style, r, col) {
  const metal = mat(look.metal, { m: 0.35, r: 0.5 }), dark = mat(look.base, { r: 0.7 });
  const base = Math.min(0.35, H * 0.15);
  part(g, L, base, T, dark, 0, base / 2, 0);
  const back = dbl ? 0 : -T / 2 + 0.07;
  part(g, L, H - base, 0.12, mat(col), 0, base + (H - base) / 2, back);
  part(g, 0.12, H, T, metal, -L / 2 + 0.06, H / 2, 0); part(g, 0.12, H, T, metal, L / 2 - 0.06, H / 2, 0);
  const n = Math.max(1, Math.min(6, Math.round((H - base - 0.3) / 1.15))), gap = (H - base - 0.15) / n;
  const sd = dbl ? T / 2 - 0.12 : T - 0.2, list = [];
  for (const side of dbl ? [1, -1] : [1]) {
    const zc = dbl ? side * (T / 4 + 0.03) : back + 0.06 + sd / 2;
    for (let i = 0; i < n; i++) {
      const y = base + i * gap;
      part(g, L - 0.24, 0.06, sd, metal, 0, y, zc, false);
      fillShelf(list, style, r, L - 0.4, y, zc, sd, gap, side);
    }
  }
  items(g, list);
}
function cooler(g, L, T, H, r, col) {
  const body = mat(look.body, { r: 0.55, m: 0.25 }), trim = mat(look.metal, { m: 0.5, r: 0.35 }), glass = mat("#d8e8f0", { o: 0.16, r: 0.08, m: 0.1 });
  const foot = Math.min(0.5, H * 0.12), cap = Math.min(0.6, H * 0.12);
  part(g, L, H, 0.15, body, 0, H / 2, -T / 2 + 0.075);
  part(g, 0.15, H, T, body, -L / 2 + 0.075, H / 2, 0); part(g, 0.15, H, T, body, L / 2 - 0.075, H / 2, 0);
  part(g, L, foot, T, body, 0, foot / 2, 0); part(g, L, cap, T, body, 0, H - cap / 2, 0);
  part(g, L, cap * 0.8, 0.12, mat(col, { e: 0.12 }), 0, H - cap / 2, T / 2 - 0.02);       // header sign
  part(g, L - 0.3, 0.04, T - 0.4, mat("#f4f8fb", { e: 0.45 }), 0, H - cap - 0.04, 0, false);  // interior light
  const nd = Math.max(1, Math.round(L / 2.4)), dw = L / nd, inner = H - foot - cap;
  for (let i = 0; i <= nd; i++) part(g, 0.08, inner, 0.1, trim, -L / 2 + dw * i + (i === 0 ? 0.04 : i === nd ? -0.04 : 0), foot + inner / 2, T / 2 - 0.05, false);
  for (let i = 0; i < nd; i++) {
    const cx = -L / 2 + dw * (i + 0.5);
    part(g, dw - 0.12, inner - 0.05, 0.03, glass, cx, foot + inner / 2, T / 2 - 0.05, false);
    part(g, 0.06, Math.min(1.3, inner * 0.4), 0.08, trim, cx + dw / 2 - 0.25, foot + inner / 2, T / 2 + 0.03, false);  // handle
  }
  const shelves = Math.max(2, Math.min(6, Math.floor(inner / 1.05))), sg = inner / shelves, list = [];
  for (let s = 0; s < shelves; s++) {
    const y = foot + s * sg + 0.05;
    part(g, L - 0.35, 0.04, T - 0.4, trim, 0, y, 0.05, false);
    let x = -L / 2 + 0.3, n = 0;
    while (x < L / 2 - 0.35 && n++ < 60) {
      const w = 0.22 + r() * 0.12, h = Math.min(sg * 0.8, 0.45 + r() * 0.4);
      list.push({ x: x + w / 2, y: y + 0.02 + h / 2, z: T / 2 - 0.5 - r() * 0.1, w, h, d: w, c: pick(r, PAL.drinks) });
      x += w + 0.04;
    }
  }
  items(g, list, CYL);
}
// ── Gil's own fixtures, modelled on photos of the store ─────────────────────────
// (all built like the rest: length along x, depth along z, front facing +z, floor at y = 0)
const texMat = (tex, o = {}) => {
  const k = "tex|" + tex.uuid + "|" + (o.r ?? 0.6);
  let m = MATS.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ map: tex, roughness: o.r ?? 0.6, metalness: 0 }); m.userData.shared = true; MATS.set(k, m); }
  return m;
};
function plane(g, w, h, material, x, y, z, rx = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; g.add(m); return m;
}
// a side profile (in z/y) pushed out to a slab `t` thick along x, left face at x
function slab(g, pts, t, material, x) {
  const s = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)));
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }), material);
  m.rotation.y = -Math.PI / 2; m.position.x = x + t; m.castShadow = m.receiveShadow = true; g.add(m); return m;
}
// tilted board between two points of a side profile, spanning width w
function tilted(g, w, th, material, z1, y1, z2, y2, x = 0, cast = false) {
  const len = Math.hypot(z2 - z1, y2 - y1), m = part(g, w, len, th, material, x, (y1 + y2) / 2, (z1 + z2) / 2, cast);
  m.rotation.x = Math.atan2(z2 - z1, y2 - y1); return m;
}

// Upright bagged-ice merchandiser: tall white cabinet, one door with big red I-C-E letters wearing snow caps,
// a compressor box on top with a louvred grille and a "Packaged ICE" sign.
const iceLetterTex = ch => canvasTex("iceletter" + ch, 256, (g, n) => {
  g.clearRect(0, 0, n, n);
  const fs = n * 0.98; g.font = `900 ${fs}px Georgia, "Times New Roman", serif`; g.textAlign = "center"; g.textBaseline = "alphabetic";
  const base = n * 0.93, cap = g.measureText(ch).actualBoundingBoxAscent || fs * 0.7, w = g.measureText(ch).width;
  g.lineJoin = "round"; g.lineWidth = n * 0.05; g.strokeStyle = "#2f3f72"; g.strokeText(ch, n / 2, base);
  g.fillStyle = "#b9373a"; g.fillText(ch, n / 2, base);
  // a lumpy cap of snow sitting on the letter
  const top = base - cap, sw = Math.max(w * 0.82, n * 0.3);
  g.beginPath(); g.moveTo(n / 2 - sw / 2, top + n * 0.05);
  for (let k = 0; k < 5; k++) { const x0 = n / 2 - sw / 2 + sw * k / 5; g.quadraticCurveTo(x0 + sw / 10, top - n * (k % 2 ? 0.07 : 0.1), x0 + sw / 5, top - n * 0.01); }
  g.quadraticCurveTo(n / 2 + sw / 2 + n * 0.02, top + n * 0.06, n / 2 + sw * 0.3, top + n * 0.07);
  g.quadraticCurveTo(n / 2 + sw * 0.18, top + n * 0.13, n / 2 + sw * 0.05, top + n * 0.07);
  g.quadraticCurveTo(n / 2 - sw * 0.2, top + n * 0.1, n / 2 - sw / 2, top + n * 0.05);
  g.closePath(); g.fillStyle = "#ffffff"; g.fill(); g.lineWidth = n * 0.018; g.stroke();
});
const iceTopTex = () => canvasTex("icetop", 512, (g, n) => {
  g.fillStyle = "#f6f6f3"; g.fillRect(0, 0, n, n);
  g.fillStyle = "#3c4046";                                               // louvred grille, left 55%
  for (let y = n * 0.12; y < n * 0.88; y += n * 0.055) g.fillRect(n * 0.05, y, n * 0.5, n * 0.028);
  g.strokeStyle = "#c9cbce"; g.lineWidth = 6; g.strokeRect(n * 0.6, n * 0.1, n * 0.36, n * 0.8);
  g.fillStyle = "#2a2a2a"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `italic 600 ${n * 0.075}px Georgia, serif`; g.fillText("Packaged", n * 0.78, n * 0.3);
  g.fillStyle = "#c0393b"; g.font = `900 ${n * 0.2}px Georgia, serif`; g.fillText("ICE", n * 0.78, n * 0.6);
});
function iceChest(g, L, T, H) {
  H = Math.min(H, 7.5);
  const white = mat("#f1f1ee", { r: 0.5 }), seal = mat("#c9ccce", { r: 0.8 }), chrome = mat("#cfd3d8", { m: 0.3, r: 0.25 }), kick = mat("#d6d6d2", { r: 0.7 });
  const top = Math.min(1.2, H * 0.17), body = H - top, base = 0.3;
  part(g, L, base, T - 0.15, kick, 0, base / 2, -0.07);                                  // plinth
  part(g, L, body - base, T, white, 0, base + (body - base) / 2, 0);                     // cabinet
  for (let k = 0; k < 5; k++) part(g, L * 0.32, 0.035, 0.03, mat("#9aa0a5"), -L * 0.18, 0.08 + k * 0.045, T / 2 - 0.06, false); // kick vent
  const dw = L - 0.3, dh = body - base - 0.35, dy = base + 0.18 + dh / 2;
  part(g, dw + 0.08, dh + 0.08, 0.04, seal, 0, dy, T / 2 + 0.01, false);                 // door gasket
  part(g, dw, dh, 0.08, white, 0, dy, T / 2 + 0.05);                                     // door
  const lw = Math.min(dw * 0.72, (dh - 0.3) / 3);
  const letterMat = ch => { const k = "iceL" + ch; let m = MATS.get(k);
    if (!m) { m = new THREE.MeshStandardMaterial({ map: iceLetterTex(ch), transparent: true, roughness: 0.55 }); m.userData.shared = true; MATS.set(k, m); } return m; };
  ["I", "C", "E"].forEach((ch, i) => plane(g, lw, lw, letterMat(ch), -dw * 0.05, dy + dh / 2 - 0.2 - lw * (i + 0.5), T / 2 + 0.095));   // I-C-E down the door
  part(g, 0.09, Math.min(1.6, dh * 0.3), 0.1, chrome, dw / 2 - 0.22, dy, T / 2 + 0.16, false);          // pull
  for (const yy of [-0.55, 0.55]) part(g, 0.06, 0.06, 0.12, chrome, dw / 2 - 0.22, dy + yy, T / 2 + 0.1, false);
  for (const yy of [dh * 0.38, -dh * 0.38]) part(g, 0.1, 0.4, 0.06, chrome, -dw / 2 + 0.04, dy + yy, T / 2 + 0.09, false);   // hinges
  // compressor box on top, set back a little, louvred grille and sign on its face
  const tw = L - 0.1, td = T - 0.5;
  part(g, tw, top, td, white, 0, body + top / 2, -0.25);
  plane(g, tw - 0.04, top - 0.06, texMat(iceTopTex(), { r: 0.6 }), 0, body + top / 2, -0.25 + td / 2 + 0.006);
  part(g, tw + 0.04, 0.05, td + 0.04, seal, 0, body + top, -0.25, false);
  return H;
}

// open-topped box: four walls and a floor (so a chest's insides show through its glass)
function tub(g, L, T, y0, h, material, w = 0.14, floorY = y0) {
  for (const sz of [-1, 1]) part(g, L, h, w, material, 0, y0 + h / 2, sz * (T / 2 - w / 2));
  for (const sx of [-1, 1]) part(g, w, h, T - 2 * w, material, sx * (L / 2 - w / 2), y0 + h / 2, 0);
  part(g, L - 2 * w, 0.06, T - 2 * w, material, 0, floorY, 0, false);
}
// Chest freezers. Big ones: red-and-white ice-cream chest with a grey rim, two curved glass sliding lids,
// wire baskets and casters. Small ones (≤ 3 ft): plain white chest with a flat hinged glass lid.
function freezer(g, L, T, H, r) {
  if (L <= 3.2) return smallChest(g, L, T, Math.min(H, 3), r);
  const bh = Math.min(H, 3.2) - 0.35, red = mat("#b84a45", { r: 0.5 }), white = mat("#f1efea", { r: 0.5 }), grey = mat("#a8adb2", { r: 0.45, m: 0.1 });
  const caster = 0.22, wall = 0.14;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, 0.16, caster, 0.16, mat("#2d2f33"), sx * (L / 2 - 0.3), caster / 2, sz * (T / 2 - 0.3));
  part(g, L - 0.2, 0.25, T - 0.2, mat("#3a3d42"), 0, caster + 0.12, 0, false);            // dark base / vent
  const y0 = caster + 0.18, h = bh - y0;
  tub(g, L, T, y0, h, white, wall, bh - 0.62);                                              // white tub, open at the top
  tub(g, L + 0.02, T + 0.02, y0 + h * 0.14, h * 0.72, red, 0.02, y0 + h * 0.14);            // red wrap
  for (const sz of [-1, 1]) part(g, L + 0.03, h * 0.07, 0.02, white, 0, y0 + h * 0.2, sz * (T / 2 + 0.015), false);   // white pinstripe
  part(g, L - wall * 2, 0.02, T - wall * 2, mat("#e8eef2", { r: 0.6 }), 0, bh - 0.6, 0, false);   // interior floor
  for (const sz of [-1, 1]) part(g, L + 0.1, 0.16, 0.2, grey, 0, bh + 0.08, sz * (T / 2 - 0.05));   // grey rim
  for (const sx of [-1, 1]) part(g, 0.2, 0.16, T + 0.1, grey, sx * (L / 2 - 0.05), bh + 0.08, 0);
  // contents: tubs and boxes in wire baskets
  const list = [], wire = mat("#d9dde0", { m: 0.4, r: 0.4 }), nb = Math.max(2, Math.round(L / 1.1)), bw = (L - 0.4) / nb;
  for (let b = 1; b < nb; b++) part(g, 0.03, 0.45, T - 0.4, wire, -L / 2 + 0.2 + b * bw, bh - 0.4, 0, false);
  part(g, L - 0.4, 0.45, 0.03, wire, 0, bh - 0.4, 0, false);
  for (let b = 0; b < nb; b++) {
    const cx = -L / 2 + 0.2 + (b + 0.5) * bw, tubs = r() < 0.5;
    for (const sz of [-1, 1]) for (const k of [-1, 1]) {
      if (r() < 0.15) continue;
      const it = tubs ? { w: 0.32, h: 0.3, d: 0.32 } : { w: 0.42, h: 0.12, d: 0.22, ry: (r() - 0.5) * 0.6 };
      list.push({ ...it, x: cx + k * bw * 0.22, y: bh - 0.42 + it.h / 2, z: sz * (T / 4 - 0.05), c: pick(r, PAL.icecream) });
    }
  }
  items(g, list, CYL);
  // two curved glass lids that overlap in the middle, each with grey end caps
  const glass = new THREE.MeshStandardMaterial({ color: "#dbe8ef", transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false });
  const R = T * 0.62, arc = 2 * Math.asin(Math.min(0.99, (T / 2) / R)), lift = R * Math.cos(arc / 2);
  for (const s of [-1, 1]) {
    const len = L / 2 + 0.15, cx = s * (L / 4 - 0.04);
    const geo = new THREE.CylinderGeometry(R, R, len, 24, 1, true, Math.PI / 2 - arc / 2, arc);
    const m = new THREE.Mesh(geo, glass); m.rotation.z = Math.PI / 2; m.rotation.y = 0;
    m.position.set(cx, bh + 0.16 - lift + (s > 0 ? 0.04 : 0), 0); g.add(m);
    const cap = new THREE.Shape(); cap.absarc(0, 0, R + 0.03, Math.PI / 2 - arc / 2, Math.PI / 2 + arc / 2, false); cap.absarc(0, 0, R - 0.1, Math.PI / 2 + arc / 2, Math.PI / 2 - arc / 2, true); cap.closePath();
    for (const e of [-1, 1]) {
      const c = new THREE.Mesh(new THREE.ExtrudeGeometry(cap, { depth: 0.06, bevelEnabled: false }), grey);
      c.rotation.y = Math.PI / 2; c.position.set(cx + e * len / 2 - 0.03, bh + 0.16 - lift + (s > 0 ? 0.04 : 0), 0); c.castShadow = true; g.add(c);
    }
    part(g, 0.18, 0.05, 0.5, grey, cx + s * (len / 2 - 0.4), bh + 0.16 + (R - lift) + (s > 0 ? 0.06 : 0.02), 0, false);   // handle
  }
  return bh + 0.2 + (R - lift);
}
function smallChest(g, L, T, H, r) {
  const white = mat("#f2f2ef", { r: 0.5 }), grey = mat("#c4c8cc", { r: 0.5 }), dark = mat("#5a5f66", { r: 0.7 });
  const bh = H - 0.25;
  part(g, L, 0.5, T, white, 0, 0.25, 0);
  tub(g, L, T, 0.5, bh - 0.5, white, 0.14, bh - 0.55);
  part(g, L * 0.55, 0.45, 0.03, mat("#e4e4e0"), L * 0.1, 0.4, T / 2 + 0.01, false);       // lower panel
  for (let k = 0; k < 4; k++) part(g, L * 0.48, 0.04, 0.03, dark, L * 0.1, 0.25 + k * 0.1, T / 2 + 0.025, false);   // vent slats
  part(g, 0.35, 0.22, 0.02, mat("#ffffff"), -L * 0.22, bh - 0.9, T / 2 + 0.01, false);    // spec sticker
  for (const sz of [-1, 1]) part(g, L + 0.04, 0.1, 0.16, grey, 0, bh + 0.05, sz * (T / 2 - 0.06));   // rim
  for (const sx of [-1, 1]) part(g, 0.16, 0.1, T + 0.04, grey, sx * (L / 2 - 0.06), bh + 0.05, 0);
  const list = [];
  for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) if (r() > 0.25)
    list.push({ x: -L / 2 + 0.35 + a * (L - 0.7) / 2, y: bh - 0.42, z: (b - 0.5) * (T - 0.6), w: 0.36, h: 0.2, d: 0.36, c: pick(r, PAL.icecream) });
  items(g, list, CYL);
  const glass = mat("#dfeaf0", { o: 0.25, r: 0.05 });
  const lid = new THREE.Group(); lid.position.set(0, bh + 0.1, -T / 2 + 0.05); g.add(lid);
  part(lid, L - 0.1, 0.05, T - 0.1, glass, 0, 0.03, T / 2 - 0.05, false);
  for (const sx of [-1, 1]) part(lid, 0.08, 0.08, T - 0.1, grey, sx * (L / 2 - 0.09), 0.04, T / 2 - 0.05, false);
  part(lid, L - 0.1, 0.08, 0.08, grey, 0, 0.04, T - 0.12, false);
  part(lid, 0.6, 0.05, 0.12, mat("#f3e07a"), 0, 0.09, T - 0.15, false);                   // price tag on the handle
  return bh + 0.6;
}

// Wooden newspaper stand: oak frame, white shelf boards, papers in stacks on the top and middle shelves,
// washer-fluid jugs and puzzle books on the bottom, a jerky clip-strip on one end.
const newsTex = v => canvasTex("news" + v, 256, (g, n, r) => {
  g.fillStyle = "#efede6"; g.fillRect(0, 0, n, n);
  g.fillStyle = "#26272b"; g.font = `700 ${n * 0.1}px Georgia, serif`; g.textAlign = "center";
  g.fillText(["The Daily Ledger", "Morning Post", "The Courier", "Local News"][v % 4], n / 2, n * 0.13);
  g.fillRect(n * 0.06, n * 0.17, n * 0.88, 3);
  g.fillStyle = "#3b3d42"; g.fillRect(n * 0.06, n * 0.22, n * 0.88, n * 0.05);               // headline
  g.fillStyle = ["#7d8ea3", "#9a8a72", "#7f977d", "#9a7f86"][v % 4];
  g.fillRect(n * (v % 2 ? 0.06 : 0.5), n * 0.31, n * 0.44, n * 0.32);                         // photo
  g.fillStyle = "#a9a9a3";
  for (let y = n * 0.31; y < n * 0.95; y += n * 0.035) {
    const inPhoto = y < n * 0.64;
    g.fillRect(n * (inPhoto ? (v % 2 ? 0.53 : 0.06) : 0.06), y, n * (inPhoto ? 0.41 : 0.88) * (0.7 + r() * 0.3), n * 0.014);
  }
});
function newsStand(g, L, T, H, r) {
  H = Math.min(H, 3.6);
  const oak = mat("#c89a5e", { r: 0.7 }), board = mat("#f1f0ec", { r: 0.6 }), post = 0.12, d = Math.min(T, 1.8);
  const levels = [0.22, H * 0.47, H - 0.08];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, post, H, post, oak, sx * (L / 2 - post / 2), H / 2, sz * (d / 2 - post / 2));
  for (const sx of [-1, 1]) {
    for (const y of [0.12, H - 0.05]) part(g, post * 0.8, 0.16, d - post, oak, sx * (L / 2 - post / 2), y, 0);
    part(g, 0.04, H - 0.3, d - post * 2, board, sx * (L / 2 - post / 2), H / 2, 0, false);   // white side panels
  }
  part(g, L - post * 2, H - 0.3, 0.04, board, 0, H / 2, -d / 2 + 0.04, false);              // back
  levels.forEach(y => {
    part(g, L - post, 0.06, d - 0.06, board, 0, y, 0);
    part(g, L - post * 2, 0.14, 0.05, oak, 0, y - 0.06, d / 2 - 0.02);                        // oak front lip
  });
  // paper stacks: 4 across on top, 3 in the middle, each a flat stack with a printed front page
  const stacks = (y, n, z0, depth) => {
    const w = (L - 0.4) / n;
    for (let i = 0; i < n; i++) {
      const h = 0.07 + r() * 0.08, cx = -L / 2 + 0.2 + w * (i + 0.5), v = Math.floor(r() * 4), dep = Math.min(depth, w * 1.25);
      const s = part(g, w - 0.08, h, dep, mat("#e6e3da", { r: 0.9 }), cx + (r() - 0.5) * 0.05, y + 0.03 + h / 2, z0, false); s.rotation.y = (r() - 0.5) * 0.08;
      plane(g, w - 0.1, dep - 0.02, texMat(newsTex(v), { r: 0.9 }), s.position.x, y + 0.035 + h, z0, -Math.PI / 2, 0).rotation.z = s.rotation.y;
    }
  };
  stacks(levels[2], 4, 0.05, d - 0.2);
  stacks(levels[1], 3, 0.1, d - 0.35);
  // bottom: blue washer-fluid jugs and a couple of puzzle books
  const jug = mat("#3f7fc4", { o: 0.85, r: 0.25 }), cap = mat("#2a4f8f");
  for (let i = 0; i < Math.max(2, Math.floor((L - 1.2) / 0.5)); i++) {
    const x = -L / 2 + 0.4 + i * 0.5;
    part(g, 0.42, 0.85, 0.38, jug, x, levels[0] + 0.03 + 0.425, -0.05);
    part(g, 0.12, 0.1, 0.12, cap, x + 0.1, levels[0] + 0.93, -0.05, false);
    part(g, 0.36, 0.26, 0.01, mat("#e9d36a"), x, levels[0] + 0.45, 0.145, false);           // label
  }
  for (let i = 0; i < 2; i++) { const b = part(g, 0.6, 0.04, 0.8, mat(["#8e6aa8", "#d9a441"][i]), L / 2 - 0.65, levels[0] + 0.05 + i * 0.045, 0.15, false); b.rotation.y = 0.15 * (i ? 1 : -1); }
  // clip-strip of jerky on the right end
  const wire = mat("#2b2d31", { m: 0.4 });
  part(g, 0.03, H * 0.55, 0.03, wire, L / 2 + 0.06, H * 0.6, d / 2 - 0.3, false);
  for (let k = 0; k < 2; k++) part(g, 0.04, 0.75, 0.4, mat("#a8342f", { r: 0.5 }), L / 2 + 0.1, H * 0.72 - k * 0.6, d / 2 - 0.3 - k * 0.05, false);
  return H;
}

// Slant-front wooden cigar case: honey-oak sides, glass front leaning back as it rises, two glass bays,
// lit tiers of cigar boxes inside, a chain across the front and an antique register on top.
function cigarCase(g, L, T, H, r) {
  H = Math.min(H, 4);
  const oak = mat("#c08d4f", { r: 0.65 }), dark = mat("#7a5532", { r: 0.75 }), brass = mat("#b89a5a", { m: 0.55, r: 0.35 });
  const kick = 0.45, sill = 0.82, topT = 0.16, lean = Math.min(0.85, T * 0.3);
  const fz = T / 2, bz = -T / 2, gz1 = fz - 0.05, gz2 = fz - lean;         // glass bottom/top edge
  part(g, L - 0.2, kick, T - 0.5, dark, 0, kick / 2, -0.15);                                  // recessed plinth
  const side = [[bz, kick], [fz, kick], [fz, sill], [gz2 + 0.05, H - topT], [bz, H - topT]];
  for (const sx of [-1, 1]) slab(g, side, 0.16, oak, sx > 0 ? L / 2 - 0.16 : -L / 2);        // side panels
  part(g, L - 0.3, sill - kick, 0.12, oak, 0, (kick + sill) / 2, fz - 0.06);                   // bottom front rail
  part(g, L, topT, gz2 - bz + 0.18, oak, 0, H - topT / 2, (bz + gz2 + 0.18) / 2);              // top
  part(g, L - 0.3, H - topT - kick, 0.12, oak, 0, kick + (H - topT - kick) / 2, bz + 0.06);    // back
  const glass = mat("#e3eef3", { o: 0.12, r: 0.04 });
  tilted(g, L - 0.32, 0.03, glass, gz1, sill, gz2, H - topT);
  tilted(g, 0.12, 0.06, oak, gz1 + 0.03, sill, gz2 + 0.03, H - topT, 0, true);                 // centre mullion
  for (const sx of [-1, 1]) tilted(g, 0.04, 0.04, mat("#d8dadc", { m: 0.6, r: 0.3 }), gz1 + 0.03, sill, gz2 + 0.03, H - topT, sx * L / 4);
  // inside: warm floor, two stepped tiers, a glass shelf, a light under the top
  part(g, L - 0.34, 0.04, T - 0.3, mat("#5b3c22", { r: 0.9 }), 0, sill, 0, false);
  const tier = (y, z, depth) => part(g, L - 0.34, y - sill, depth, mat("#6a4527", { r: 0.85 }), 0, (y + sill) / 2, z, false);
  tier(sill + 0.45, bz + 0.12 + (T * 0.38) / 2, T * 0.38);
  part(g, L - 0.34, 0.025, T * 0.42, glass, 0, H * 0.72, bz + 0.12 + T * 0.21, false);
  part(g, L - 0.4, 0.03, 0.2, mat("#fff3da", { e: 0.6 }), 0, H - topT - 0.04, (gz2 + bz) / 2, false);
  const list = [], row = (y, z, tilt, depth) => {
    for (let x = -L / 2 + 0.3, k = 0; x < L / 2 - 0.5 && k < 30; k++) {
      const w = 0.42 + r() * 0.28, c = r() < 0.18 ? pick(r, ["#d9b44a", "#a93a35", "#2f4a3a", "#e8e2d2"]) : pick(r, PAL.cigars);
      list.push({ x: x + w / 2, y, z, w, h: 0.14, d: depth, rx: tilt, ry: (r() - 0.5) * 0.12, c });
      if (r() < 0.6) list.push({ x: x + w / 2, y: y + 0.17, z: z - depth / 2 - 0.02, w: w * 0.98, h: 0.32, d: 0.03, rx: -0.35, c: shade(c, 0.08) });   // open lid
      x += w + 0.1 + r() * 0.08;
    }
  };
  row(sill + 0.1, fz - lean * 0.2 - 0.45, 0.25, 0.5);
  row(sill + 0.55, bz + 0.12 + T * 0.19, 0.12, 0.45);
  row(H * 0.72 + 0.08, bz + 0.12 + T * 0.21, 0, 0.4);
  items(g, list);
  // gold chain swagged across the glass
  const pts = [];
  for (let k = 0; k <= 16; k++) {
    const t = k / 16, x = -L / 2 + 0.25 + t * (L - 0.5), sag = Math.sin(t * Math.PI * 2) ** 2 * 0.35;
    const y = H * 0.62 - sag, z = gz1 - (y - sill) / (H - topT - sill) * (gz1 - gz2) + 0.06;
    pts.push(new THREE.Vector3(x, y, z));
  }
  const chain = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.022, 5), brass); g.add(chain);
  // antique register on the top at one end
  const rx = -L / 2 + 1.05, ty = H;
  part(g, 1.5, 0.3, 1.1, mat("#4b3a2a", { r: 0.7 }), rx, ty + 0.15, bz + 0.75);               // wooden till drawer
  part(g, 1.3, 0.55, 0.95, mat("#6d6459", { m: 0.35, r: 0.45 }), rx, ty + 0.58, bz + 0.72);    // cast body
  const kb = part(g, 1.2, 0.4, 0.06, mat("#5f574d", { m: 0.35, r: 0.45 }), rx, ty + 0.62, bz + 1.22); kb.rotation.x = -0.6;
  const keys = [];
  for (let a = 0; a < 6; a++) for (let b = 0; b < 3; b++)
    keys.push({ x: rx - 0.5 + a * 0.2, y: ty + 0.55 + b * 0.09, z: bz + 1.25 - b * 0.06, w: 0.1, h: 0.05, d: 0.08, c: b ? "#e8e1cf" : "#b4473f" });
  items(g, keys);
  part(g, 0.08, 0.5, 0.08, mat("#8f8a80", { m: 0.5 }), rx + 0.72, ty + 0.65, bz + 0.72, false);   // crank
  return H + 1.0;
}

// Checkout counter, modelled on a walk-through video of Gil's. From the customer side, left to right:
// a lottery podium carrying the old "Gil's Grocery" sign, a gap to walk behind, then the main counter —
// kraft panels in pale-pine frames with a white top, open pine shelving on the clerk side, and on top a
// slanted stick display, the tiered candy crate, honey, a lottery mat, the register, a fruit basket and jars.
// The clerk side is +z (the zone usually faces the back wall), the customer side -z.
const gilsSignTex = () => canvasTex("gilssign", 512, (g, n, r) => {
  g.fillStyle = "#e9e4d8"; g.fillRect(0, 0, n, n);
  for (let i = 0; i < 90; i++) {                                           // weathered paint: worn streaks of bare wood
    g.fillStyle = `rgba(${120 + r() * 40},${100 + r() * 30},${80 + r() * 20},${0.08 + r() * 0.18})`;
    g.fillRect(r() * n, r() * n, 4 + r() * 60, 1 + r() * 4);
  }
  g.strokeStyle = "rgba(90,80,70,.35)"; g.lineWidth = 2;
  for (let y = n * 0.12; y < n; y += n * 0.2) { g.beginPath(); g.moveTo(0, y); g.lineTo(n, y + (r() - 0.5) * 6); g.stroke(); }   // plank joins
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "#26221e"; g.font = `italic 700 ${n * 0.2}px Georgia, serif`; g.fillText("Gil's", n * 0.44, n * 0.2);
  g.font = `800 ${n * 0.12}px Georgia, serif`; g.fillText("GROCERY", n * 0.55, n * 0.37);
  g.fillRect(n * 0.3, n * 0.45, n * 0.5, 3);
  g.font = `700 ${n * 0.07}px Georgia, serif`; g.fillText("DAILY", n * 0.5, n * 0.52); g.fillText("NEWSPAPERS", n * 0.5, n * 0.6);
  g.fillStyle = "#8e2f2b"; g.font = `800 ${n * 0.085}px Georgia, serif`; g.fillText("S.S. PIERCE", n * 0.52, n * 0.71);
  g.font = `italic 700 ${n * 0.08}px Georgia, serif`; g.fillText("Fancy GROCERIES", n * 0.5, n * 0.8);
  g.fillStyle = "#26221e"; g.font = `700 ${n * 0.05}px Georgia, serif`; g.fillText("TEL. TUcker 7-5921", n * 0.5, n * 0.91);
});
function counter(g, L, T, H, r) {
  const top = Math.min(H, 3.3), kraft = mat("#c7a479", { r: 0.85 }), pine = mat("#e3cfa6", { r: 0.7 }), white = mat("#f4f2ed", { r: 0.4 });
  const base = 0.3, tt = 0.12, cz = -T / 2, kz = T / 2;                       // customer face z, clerk face z
  // framed kraft face: one panel per ~3 ft, pine rails and stiles; `face` is built facing +z, then turned
  const face = (len, h, cx, z, ry) => {
    const n = Math.max(1, Math.round(len / 3)), pw = len / n, gr = new THREE.Group(); gr.position.set(cx, 0, z); gr.rotation.y = ry; g.add(gr);
    part(gr, len, h - base, 0.06, kraft, 0, base + (h - base) / 2, 0);
    part(gr, len + 0.04, base, 0.1, pine, 0, base / 2, 0.01);
    part(gr, len, 0.14, 0.1, pine, 0, h - 0.07, 0.01, false);
    for (let i = 0; i <= n; i++) part(gr, 0.14, h - base, 0.1, pine, -len / 2 + i * pw + (i === 0 ? 0.07 : i === n ? -0.07 : 0), base + (h - base) / 2, 0.01, false);
  };
  const topSlab = (len, dep, cx, czz, y) => {
    part(g, len, tt, dep, white, cx, y - tt / 2, czz);
    const nose = new THREE.Mesh(CYL, white); nose.scale.set(tt, len, tt); nose.rotation.z = Math.PI / 2;   // rounded front edge
    nose.position.set(cx, y - tt / 2, czz - dep / 2); g.add(nose);
  };

  // ── lottery podium (customer's left = +x here) ──
  const pw = Math.min(2.7, L * 0.22), pd = Math.min(T - 0.2, 2.6), px = L / 2 - pw / 2, ph = top + 0.25, pz = cz + pd / 2;
  face(pw, ph - tt, px, cz + 0.03, Math.PI);                                                  // customer face
  face(pd, ph - tt, px - pw / 2 + 0.03, pz, -Math.PI / 2); face(pd, ph - tt, px + pw / 2 - 0.03, pz, Math.PI / 2);
  topSlab(pw + 0.15, pd + 0.12, px, pz - 0.04, ph);
  const sign = plane(g, pw * 0.72, pw * 0.8, texMat(gilsSignTex(), { r: 0.85 }), px, ph * 0.5, cz - 0.07, 0, Math.PI);
  part(g, pw * 0.78, 0.12, 0.06, mat("#8a7d6c", { r: 0.8 }), px, sign.position.y + pw * 0.4 + 0.06, cz - 0.07, false);   // sign's top rail
  part(g, 0.22, 0.2, 0.08, mat("#7d5a3a", { m: 0.3, r: 0.5 }), px, sign.position.y + pw * 0.4 + 0.2, cz - 0.08, false);  // ornate hanger
  const dark = mat("#1f2226", { r: 0.5 });
  part(g, 1.0, 0.25, 0.8, dark, px - 0.2, ph + 0.125, pz + 0.2);                                // lottery terminal
  const scr = part(g, 0.9, 0.7, 0.08, dark, px - 0.2, ph + 0.6, pz + 0.55); scr.rotation.x = -0.35;
  const sg = part(g, 0.78, 0.56, 0.02, mat("#8fb7d6", { e: 0.25 }), px - 0.2, ph + 0.6, pz + 0.6, false); sg.rotation.x = -0.35;
  part(g, 0.9, 0.02, 0.7, mat("#2f6b4a", { r: 0.9 }), px + 0.55, ph + 0.01, pz, false);         // green mat

  // ── main counter ──
  const gap = Math.min(2.6, L * 0.2), mL = L - pw - gap, mx = -L / 2 + mL / 2, dep = T;
  face(mL, top - tt, mx, cz + 0.03, Math.PI);                                                  // customer face
  face(dep, top - tt, -L / 2 + 0.03, 0, -Math.PI / 2); face(dep, top - tt, mx + mL / 2 - 0.03, 0, Math.PI / 2);   // ends
  topSlab(mL + 0.2, dep + 0.2, mx, -0.05, top);
  // clerk side: open pine shelving, two shelves of stock
  const nUp = Math.max(2, Math.round(mL / 2.6));
  for (let i = 0; i <= nUp; i++) part(g, 0.14, top - tt - base, 0.14, pine, -L / 2 + 0.1 + i * (mL - 0.2) / nUp, base + (top - tt - base) / 2, kz - 0.1);
  part(g, mL - 0.1, 0.14, 0.1, pine, mx, top - tt - 0.07, kz - 0.06, false);                   // rail under the top
  part(g, mL - 0.1, base, 0.1, pine, mx, base / 2, kz - 0.08);                                  // kick
  const stock = [];
  for (const [sy, sd] of [[base + 0.02, dep - 0.35], [base + (top - base) * 0.48, dep - 0.5]]) {
    part(g, mL - 0.2, 0.06, sd, pine, mx, sy, kz - sd / 2 - 0.05, false);
    for (let x = -L / 2 + 0.3, k = 0; x < -L / 2 + mL - 0.4 && k < 40; k++) {
      const w = 0.4 + r() * 0.6, h = 0.25 + r() * 0.45;
      if (x + w > -L / 2 + mL - 0.2) break;
      if (r() > 0.18) stock.push({ x: x + w / 2, y: sy + 0.03 + h / 2, z: kz - 0.2 - sd * 0.35, w, h, d: Math.min(0.9, sd * 0.6), ry: (r() - 0.5) * 0.15, c: pick(r, r() < 0.6 ? PAL.boxes : PAL.grocery) });
      x += w + 0.06;
    }
  }
  items(g, stock);

  // on top, from the podium end to the register end
  const y = top, edge = cz + 0.35, wood = mat("#d9bf8f", { r: 0.7 });
  const sx = -L / 2 + mL - 0.75;                                                                // slanted stick display
  part(g, 1.1, 0.5, 0.9, wood, sx, y + 0.25, edge + 0.25);
  const sl = part(g, 1.1, 0.05, 0.95, wood, sx, y + 0.62, edge + 0.3); sl.rotation.x = 0.45;
  const sticks = [];
  for (let k = 0; k < 9; k++) sticks.push({ x: sx - 0.4 + (k % 5) * 0.2, y: y + 0.75 + (k > 4 ? 0.05 : 0), z: edge + 0.15 + (k > 4 ? 0.25 : 0), w: 0.1, h: 0.55, d: 0.1, rx: 0.35, c: "#e8d23c" });
  items(g, sticks);
  const cx = sx - 1.85;                                                                        // tiered candy crate with jars
  for (let s = 0; s < 3; s++) part(g, 1.7, 0.22 + s * 0.26, 0.3, wood, cx, y + (0.22 + s * 0.26) / 2, edge - 0.1 + s * 0.3);
  const jars = [];
  for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++)
    jars.push({ x: cx - 0.6 + k * 0.4, y: y + 0.22 + s * 0.26 + 0.14, z: edge - 0.1 + s * 0.3, w: 0.26, h: 0.28, d: 0.26, c: pick(r, PAL.candy) });
  for (let k = 0; k < 3; k++) jars.push({ x: cx + 1.05 + k * 0.2, y: y + 0.21, z: edge, w: 0.17, h: 0.42, d: 0.17, c: "#c98a2b" });   // honey
  const rx = -L / 2 + 1.1;                                                                     // register end
  jars.push({ x: rx + 0.35, y: y + 0.24, z: edge - 0.05, w: 0.3, h: 0.48, d: 0.3, c: "#9b2f2a" });   // red canister
  jars.push({ x: rx + 0.85, y: y + 0.2, z: edge - 0.05, w: 0.28, h: 0.4, d: 0.28, c: "#ece6d6" });   // donation jar
  items(g, jars, CYL);
  part(g, 1.8, 0.015, 1.1, mat("#3f5d8e", { r: 0.8 }), (cx + rx) / 2 + 0.3, y + 0.008, edge + 0.35, false);   // lottery mat
  part(g, 1.15, 0.3, 0.95, dark, rx, y + 0.15, kz - 0.75);                                     // register
  const kp = part(g, 0.9, 0.06, 0.45, mat("#3a3f46"), rx, y + 0.33, kz - 0.65, false); kp.rotation.x = 0.25;
  part(g, 0.5, 0.22, 0.08, dark, rx, y + 0.47, kz - 1.05);                                      // customer display
  part(g, 0.45, 0.04, 0.3, mat("#d7d9dc"), rx - 0.85, y + 0.05, kz - 0.7, false);               // calculator
  part(g, 0.3, 0.18, 0.4, dark, rx + 0.55, y + 0.09, edge + 0.05);                              // card reader
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.25, 12, 1, true), mat("#b78d55", { r: 0.9 }));
  basket.scale.set(1.3, 1, 0.8); basket.position.set(rx + 0.2, y + 0.13, edge + 0.55); g.add(basket);
  const fruit = [];
  for (let k = 0; k < 7; k++) fruit.push({ x: rx + 0.2 + (r() - 0.5) * 0.7, y: y + 0.2 + r() * 0.06, z: edge + 0.55 + (r() - 0.5) * 0.35, w: 0.17, h: 0.17, d: 0.17, c: k % 3 ? "#e3cf47" : "#8db34a" });
  items(g, fruit, new THREE.SphereGeometry(0.5, 8, 6));
  return top;
}
function wine(g, L, T, H, dbl, r, col) {
  const wood = mat(look.wood || "#8a6a4c", { r: 0.75 }), dark = mat("#4a3826", { r: 0.85 });
  part(g, L, 0.3, T, dark, 0, 0.15, 0);
  part(g, 0.15, H, T, wood, -L / 2 + 0.075, H / 2, 0); part(g, 0.15, H, T, wood, L / 2 - 0.075, H / 2, 0);
  const back = dbl ? 0 : -T / 2 + 0.06;
  part(g, L, H - 0.3, 0.08, wood, 0, 0.3 + (H - 0.3) / 2, back);
  part(g, L, 0.12, T, wood, 0, H - 0.06, 0);
  const n = Math.max(2, Math.min(7, Math.round((H - 0.5) / 0.85))), sg = (H - 0.45) / n;
  const sd = dbl ? T / 2 - 0.1 : T - 0.15, list = [];
  for (const side of dbl ? [1, -1] : [1]) {
    const zc = dbl ? side * T / 4 : back + 0.04 + sd / 2, bl = Math.min(sd * 0.9, 1.0);
    for (let i = 0; i < n; i++) {
      const y = 0.3 + i * sg;
      part(g, L - 0.3, 0.05, sd, wood, 0, y, zc, false);
      for (let x = -L / 2 + 0.3, k = 0; x < L / 2 - 0.2 && k < 60; x += 0.3, k++)
        list.push({ x, y: y + 0.17, z: zc + side * (sd - bl) * 0.15, w: 0.26, h: bl, d: 0.26, rx: Math.PI / 2, c: pick(r, PAL.wine) });  // bottles lying down
    }
  }
  items(g, list, CYL);
}
function displayCase(g, L, T, H, r, col) {
  const glass = mat("#e2eef4", { o: 0.14, r: 0.05 }), metal = mat(look.metal, { m: 0.6, r: 0.3 });
  const ch = Math.min(H * 0.5, 2.2), gh = H - ch;
  part(g, L, ch, T, mat(col), 0, ch / 2, 0);
  part(g, L, gh, T, glass, 0, ch + gh / 2, 0, false);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, 0.07, gh, 0.07, metal, sx * (L / 2 - 0.035), ch + gh / 2, sz * (T / 2 - 0.035), false);
  for (const sz of [-1, 1]) part(g, L, 0.06, 0.07, metal, 0, H - 0.03, sz * (T / 2 - 0.035), false);
  for (const sx of [-1, 1]) part(g, 0.07, 0.06, T, metal, sx * (L / 2 - 0.035), H - 0.03, 0, false);
  part(g, L - 0.3, 0.03, 0.22, mat("#fff6e2", { e: 0.35 }), 0, H - 0.1, -T / 2 + 0.3, false);  // light strip
  const mid = ch + gh * 0.5;
  part(g, L - 0.2, 0.03, T - 0.3, glass, 0, mid, 0, false);
  const list = [];
  for (const y of [ch + 0.03, mid + 0.02]) for (let x = -L / 2 + 0.25, k = 0; x < L / 2 - 0.5 && k < 30; k++) {
    const w = 0.45 + r() * 0.3;
    list.push({ x: x + w / 2, y: y + 0.1, z: (r() - 0.5) * Math.max(0, T - 0.9), w, h: 0.18, d: 0.6, ry: (r() - 0.5) * 0.3, c: pick(r, PAL.cigars) });  // cigar boxes
    x += w + 0.12;
  }
  items(g, list);
}
function table(g, L, T, H, col) {
  const th = Math.min(0.45, H * 0.2), leg = Math.min(0.35, L / 6, T / 6), dark = mat(col);
  part(g, L, th, T, mat("#b4916b", { r: 0.8 }), 0, H - th / 2, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) part(g, leg, H - th, leg, dark, sx * (L / 2 - leg), (H - th) / 2, sz * (T / 2 - leg));
  if (L > 1.2 && T > 1.2) part(g, L - 0.6, 0.08, T - 0.6, dark, 0, Math.min(0.6, H * 0.25), 0, false);
}
function backRoom(g, L, T, r) {
  const fl = part(g, L, 0.04, T, look.grass ? new THREE.MeshStandardMaterial({ map: concreteTex(), roughness: 0.95 }) : mat(look.base, { r: 0.95 }), 0, 0.02, 0, false);
  fl.receiveShadow = true;
  if (L < 3.6 || T < 3.6) return 0.04;
  const pallet = mat("#a08463", { r: 0.9 }), list = [];
  const spots = [[-L / 2 + 1.7, -T / 2 + 1.7], [L / 2 - 1.7, -T / 2 + 1.7], [-L / 2 + 1.7, T / 2 - 1.7]].slice(0, L * T > 60 ? 3 : 1);
  let top = 0.4;
  for (const [px, pz] of spots) {
    part(g, 3, 0.4, 3, pallet, px, 0.2, pz);
    const layers = 1 + Math.floor(r() * 3);
    for (let ly = 0; ly < layers; ly++) for (const a of [-0.7, 0.7]) for (const b of [-0.7, 0.7]) {
      if (r() < 0.15) continue;
      list.push({ x: px + a, y: 0.4 + ly * 1.05 + 0.5, z: pz + b, w: 1.35, h: 1.0, d: 1.35, ry: (r() - 0.5) * 0.15, c: pick(r, PAL.boxes) });
      top = Math.max(top, 0.4 + (ly + 1) * 1.05);
    }
  }
  items(g, list);
  return top;
}
export function buildFixture(z, size) {
  const g = new THREE.Group(), m = new THREE.Group(); g.add(m);
  const f = facing(z, size), style = styleOf(z), r = rng(z.key || "x");
  const L = Math.max(f.L, 0.2), T = Math.max(f.T, 0.2), H = Math.max(z.h, 0.05);
  const col = "#" + calm(z.color).getHexString();
  let top = H;
  switch (style) {
    case "separator": part(m, L, H, Math.min(T, 0.25), mat(look.base, { m: 0.3 }), 0, H / 2, 0); break;
    case "backroom": top = backRoom(m, L, T, r); break;
    case "cooler": cooler(m, L, T, H, r, col); break;
    case "icechest": top = iceChest(m, L, T, H); break;
    case "freezer": top = freezer(m, L, T, H, r); break;
    case "wine": wine(m, L, T, H, f.freestanding, r, col); break;
    case "counter": top = counter(m, L, T, H, r) + 1.2; break;
    case "case": top = /cigar|humidor/i.test((z.key || "") + " " + (z.label || "")) ? cigarCase(m, L, T, H, r) : (displayCase(m, L, T, H, r, col), H); break;
    case "table": table(m, L, T, H, col); break;
    case "news": top = newsStand(m, L, T, H, r); break;
    default: gondola(m, L, T, H, f.freestanding, style, r, col);
  }
  m.rotation.y = f.rot;
  g.position.set(z.x + z.w / 2 - size.w / 2, 0, z.z + z.d / 2 - size.d / 2);
  g.userData.top = top;
  return g;
}
function placeWall(m, w, size, height) {
  const dx = w.x2 - w.x1, dz = w.z2 - w.z1, L = Math.hypot(dx, dz) || 0.01;
  m.scale.set(L + WALL_T, height, WALL_T);
  m.position.set((w.x1 + w.x2) / 2 - size.w / 2, height / 2, (w.z1 + w.z2) / 2 - size.d / 2);
  m.rotation.y = -Math.atan2(dz, dx);
}
// Sims-style cutaway: walls between the camera and the middle of the store drop low
function animateWalls(meshes, walls, size, camera, mode, heights) {
  meshes.forEach((m, i) => {
    const w = walls[i]; if (!w) return;
    let tall = mode === "up";
    if (mode === "cut") {
      const mx = (w.x1 + w.x2) / 2 - size.w / 2, mz = (w.z1 + w.z2) / 2 - size.d / 2;
      tall = mx * camera.position.x + mz * camera.position.z <= 0;
    }
    const y = m.scale.y + ((tall ? WALL_H : WALL_LOW) - m.scale.y) * 0.25;
    m.scale.y = y; m.position.y = y / 2; heights[i] = y;
  });
}
const wallMaterial = on => new THREE.MeshStandardMaterial({ color: on ? "#f0c040" : look.wall, roughness: 0.9,
  emissive: on ? new THREE.Color("#f0c040") : new THREE.Color(0), emissiveIntensity: on ? 0.25 : 0 });

// ── entrance + route arrows (viewer) ──────────────────────────────────────────
// Glass double door in the wall gap, a threshold and a mat outside. Built facing +z (into the store), then turned.
function buildDoor(door, size) {
  const g = new THREE.Group(), leaves = new THREE.Group(), W = door.width, H = 7.4;
  const frame = mat("#2b2c30", { r: 0.5, m: 0.4 }), glass = mat("#cfe4ee", { o: 0.28, r: 0.05, m: 0.1 }), steel = mat("#c9ccd1", { m: 0.7, r: 0.3 });
  part(g, W + 0.2, 0.08, 0.7, steel, 0, 0.04, 0, false);                                       // threshold
  for (const sx of [-1, 1]) part(leaves, 0.22, H, 0.5, frame, sx * (W / 2 - 0.11), H / 2, 0);   // jambs
  part(leaves, W, 0.35, 0.5, frame, 0, H - 0.17, 0);                                            // header
  for (const sx of [-1, 1]) {
    const cxl = sx * W / 4;
    part(leaves, W / 2 - 0.3, H - 0.6, 0.06, glass, cxl, (H - 0.35) / 2, 0, false);
    part(leaves, 0.08, H - 0.4, 0.12, frame, sx * 0.04, (H - 0.35) / 2, 0, false);              // meeting stiles
    part(leaves, 0.07, 1.6, 0.14, steel, sx * 0.3, 3.4, 0.12, false);                            // pull handles
  }
  g.add(leaves); g.userData.leaves = leaves;
  const mat1 = part(g, W + 0.6, 0.05, 2.2, mat("#3f4247", { r: 1 }), 0, 0.03, -1.6, false);    // door mat (outside)
  mat1.receiveShadow = true;
  part(g, W + 0.2, 0.06, 1.8, mat("#55595f", { r: 1 }), 0, 0.035, -1.6, false);
  g.position.set(door.x - size.w / 2, 0, door.z - size.d / 2);
  g.rotation.y = Math.atan2(door.nx, door.nz);   // local +z → into the store
  return g;
}
// one chevron, lying flat, pointing along +x
const CHEVRON = (() => {
  const sh = new THREE.Shape([[0.42, 0], [-0.18, 0.55], [-0.5, 0.55], [0.1, 0], [-0.5, -0.55], [-0.18, -0.55]].map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI / 2); geo.userData.shared = true; return geo;
})();
function buildArrows(points, size, color) {
  const g = new THREE.Group();
  points.forEach(p => {
    const m = new THREE.Mesh(CHEVRON, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.scale.setScalar(1.8); m.position.set(p.x - size.w / 2, 0.05, p.z - size.d / 2); m.rotation.y = -p.angle;
    m.userData.s = p.s; m.renderOrder = 5; g.add(m);
  });
  return g;
}

// ── 3D viewer (used by every floor map in the app) ────────────────────────────
export function mountViewer(host, layout, { accent = "#f0c040", accentInk = "#141005", theme = "dark", onSelectZone } = {}) {
  look = LOOK[theme] || LOOK.dark;
  const LABEL_H = 0.03, LABEL_PX = 21; // placeholder share of the view; declutter() sets the real size from LABEL_PX
  const st = toFeet(layout), { size } = st, raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  const stage = createStage(host, {
    bg: look.bg,
    listeners: {
      pointerdown: e => { down = { x: e.clientX, y: e.clientY }; },
      pointerup: e => {
        if (!down || !onSelectZone) return;
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
        if (moved > 6) return;
        const r = stage.el.getBoundingClientRect();
        ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
        raycaster.setFromCamera(ndc, stage.camera);
        for (const h of raycaster.intersectObjects(Object.values(byKey).map(o => o.m), true)) {
          const root = rootOf(h.object);
          if (root && root.userData.tappable) { onSelectZone(root.userData.key); break; }
        }
      },
    },
  });
  addFloor(stage.world, size, true);
  const byKey = {}, wallMeshes = [], wallH = [];
  st.zones.forEach(z => {
    const m = buildFixture(z, size), top = m.userData.top;
    m.userData = { key: z.key, tappable: z.tappable, top };
    stage.world.add(m);
    let label = null;
    if (z.label && z.tappable) { label = makeLabel(z.label, false, true, accent, accentInk, LABEL_H); label.position.set(m.position.x, top + 0.9, m.position.z); stage.world.add(label); }
    byKey[z.key] = { m, z, label };
  });
  // dollhouse walls: dark outside, light inside, dark cut top (box faces: +x −x +y −y +z −z)
  const ext = mat(look.wallExt, { r: 0.9 }), int = mat(look.wallInt, { r: 0.92 }), cap = mat(look.wallCap, { r: 0.8 });
  st.walls.forEach((w, i) => {
    const m = new THREE.Mesh(UNIT, ext); m.castShadow = true; m.receiveShadow = true;
    placeWall(m, w, size, WALL_H);
    const nx = Math.sin(m.rotation.y), nz = Math.cos(m.rotation.y);          // the wall's +z side
    const inward = nx * -m.position.x + nz * -m.position.z > 0;             // does it face the middle of the store?
    m.material = [ext, ext, cap, cap, inward ? int : ext, inward ? ext : int];
    stage.world.add(m); wallMeshes[i] = m;
  });
  // pin: a map-pin shape over the fixture, a soft halo on it and a pulsing ring on the floor
  const pinMat = new THREE.MeshStandardMaterial({ color: accent, emissive: new THREE.Color(accent), emissiveIntensity: 0.35, roughness: 0.4 });
  const marker = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20), pinMat); head.position.y = 0.95;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 28), pinMat); tip.rotation.x = Math.PI; tip.position.y = 0.3;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), new THREE.MeshBasicMaterial({ color: "#ffffff" })); dot.position.set(0, 0.97, 0.45);
  marker.add(head, tip, dot); marker.traverse(o => { o.castShadow = true; }); marker.visible = false; stage.world.add(marker);
  const glow = new THREE.Mesh(UNIT, new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.14, depthWrite: false }));
  glow.visible = false; stage.world.add(glow);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; ring.visible = false; stage.world.add(ring);
  // entrance: from layout.door, or found as the gap in the outside wall
  st.door = layout.door ? { x: layout.door.x / 100 * size.w, z: layout.door.y / 100 * size.d } : null;
  const door = findDoor(st);
  let doorObj = null, doorWall = -1, doorLabel = null, arrows = null;
  if (door) {
    doorObj = buildDoor(door, size); stage.world.add(doorObj);
    // the door is cut away together with the wall it sits in
    let bd = Infinity;
    st.walls.forEach((w, i) => { const d = Math.min(Math.hypot(w.x1 - door.x, w.z1 - door.z), Math.hypot(w.x2 - door.x, w.z2 - door.z)); if (d < bd) { bd = d; doorWall = i; } });
    doorLabel = makeLabel("Entrance", false, true, accent, accentInk, LABEL_H);
    doorLabel.position.set(door.x - size.w / 2 - door.nx * 2.6, 0.6, door.z - size.d / 2 - door.nz * 2.6); stage.world.add(doorLabel);
  }
  aimCamera(stage, size, "diorama");
  const homeDist = stage.camera.position.length();
  requestAnimationFrame(() => declutter());

  let pin = null, fly = null;
  // zoom toward the pinned fixture, keeping the current viewing angle; any user drag cancels it
  stage.controls.addEventListener("start", () => { fly = null; });
  function flyTo(o, path) {
    const { camera, controls } = stage;
    if (path) {
      // look from the entrance toward the item, high enough to see down the aisles, framing the whole walk
      const xs = path.map(p => p.x - size.w / 2), zs = path.map(p => p.z - size.d / 2);
      const tgt = new THREE.Vector3((Math.min(...xs) + Math.max(...xs)) / 2, 0, (Math.min(...zs) + Math.max(...zs)) / 2);
      let hx = path[0].x - path[path.length - 1].x, hz = path[0].z - path[path.length - 1].z;
      const hl = Math.hypot(hx, hz) || 1; hx /= hl; hz /= hl;
      // turn a little off the straight line so the view keeps some depth
      const tw = 0.35, rx = hx * Math.cos(tw) - hz * Math.sin(tw), rz = hx * Math.sin(tw) + hz * Math.cos(tw);
      const dir = new THREE.Vector3(rx * 0.5, 0.86, rz * 0.5).normalize();
      const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 14);
      const dist = Math.min(homeDist, (span * 0.75 + 10) / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
      fly = { tgt, pos: tgt.clone().addScaledVector(dir, dist) };
      return;
    }
    // no route: ease part of the way toward the pin and zoom in a little
    const dist = homeDist * 0.9;
    const tgt = new THREE.Vector3(o.m.position.x * 0.35, 0, o.m.position.z * 0.35);
    const dir = camera.position.clone().sub(controls.target).normalize();
    if (dir.y < 0.75) { dir.y = 0.75; dir.normalize(); }
    fly = { tgt, pos: tgt.clone().addScaledVector(dir, dist) };
  }
  function setLabel(o, on) {
    if (!o.label) return;
    stage.world.remove(o.label); o.label.material.map.dispose(); o.label.material.dispose();
    o.label = makeLabel(o.z.label, on, true, accent, accentInk, LABEL_H);
    o.label.position.set(o.m.position.x, o.m.userData.top + (on ? 2.9 : 0.9), o.m.position.z); stage.world.add(o.label);
  }
  function setPin(key) {
    if (pin === key) return;
    if (byKey[pin]) setLabel(byKey[pin], false);
    pin = key;
    const o = byKey[key];
    marker.visible = glow.visible = ring.visible = !!o;
    if (arrows) { stage.world.remove(arrows); arrows.traverse(c => c.material && c.material.dispose()); arrows = null; }
    const path = o && door ? routeTo(st, key, door) : null;
    if (path) { arrows = buildArrows(arrowsAlong(path), size, accent); stage.world.add(arrows); }
    if (o) {
      const h = Math.max(o.z.h, o.m.userData.top) + 0.1;
      glow.scale.set(o.z.w + 0.3, h, o.z.d + 0.3); glow.position.set(o.m.position.x, h / 2, o.m.position.z);
      ring.position.x = o.m.position.x; ring.position.z = o.m.position.z; ring.userData.r = Math.hypot(o.z.w, o.z.d) / 2 + 0.6;
      setLabel(o, true);
      flyTo(o, path);
    }
  }
  stage.setFrame(t => {
    animateWalls(wallMeshes, st.walls, size, stage.camera, "cut", wallH);
    if (fly) {
      stage.controls.target.lerp(fly.tgt, 0.08); stage.camera.position.lerp(fly.pos, 0.08);
      if (stage.camera.position.distanceTo(fly.pos) < 0.05) fly = null;
    }
    const o = byKey[pin];
    if (o) {
      glow.material.opacity = 0.1 + 0.05 * Math.sin(t / 420);
      marker.position.set(o.m.position.x, o.m.userData.top + 1.1 + 0.22 * Math.sin(t / 380), o.m.position.z);
      marker.rotation.y = t / 1400;
      const k = (t % 1800) / 1800, rr = ring.userData.r * (0.75 + k * 0.6);   // ring spreads out and fades, then repeats
      ring.scale.set(rr, rr, 1); ring.material.opacity = 0.55 * (1 - k);
    }
    if (arrows) arrows.children.forEach(a => {   // a soft pulse runs from the door to the fixture
      const k = 0.5 + 0.5 * Math.cos(a.userData.s * 0.9 - t / 240);
      a.material.opacity = 0.35 + 0.6 * k * k; a.position.y = 0.05 + 0.08 * k * k;
    });
    if (doorObj && doorWall >= 0) { const k = Math.min(1, (wallH[doorWall] ?? WALL_H) / WALL_H); doorObj.userData.leaves.scale.y = Math.max(0.09, k); }
    if (++frame % 8 === 0) declutter();
  });
  // Hide labels that would overlap on screen: the pinned one wins, then the biggest fixtures
  let frame = 0;
  const _v = new THREE.Vector3();
  function declutter() {
    const { camera, el } = stage, W = el.clientWidth, H = el.clientHeight; if (!W) return;
    const f = 1 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    const list = Object.values(byKey).filter(o => o.label)
      .sort((a, b) => (b.z.key === pin) - (a.z.key === pin) || b.z.w * b.z.d - a.z.w * a.z.d);
    const placed = [];
    for (const o of list) {
      const l = o.label; _v.copy(l.position).project(camera);
      const want = LABEL_PX * (o.z.key === pin ? 1.2 : 1) / (f * H), k = want / l.scale.y;
      if (Math.abs(k - 1) > 0.01) l.scale.set(l.scale.x * k, want, 1);
      const h = l.scale.y * f * H, w = h * l.scale.x / l.scale.y;
      const x = (_v.x + 1) / 2 * W, y = (1 - _v.y) / 2 * H;
      const box = { x: x - w / 2 - 2, y: y - h / 2 - 2, w: w + 4, h: h + 4 };
      const off = _v.z > 1 || x < -w || x > W + w || y < -h || y > H + h;
      const hit = placed.some(p => box.x < p.x + p.w && box.x + box.w > p.x && box.y < p.y + p.h && box.y + box.h > p.y);
      l.visible = o.z.key === pin || (!byKey[pin] && !off && !hit && h > 7);
      if (l.visible) placed.push(box);
    }
    if (doorLabel) { const want = LABEL_PX * 0.9 / (f * H); doorLabel.scale.set(doorLabel.scale.x * want / doorLabel.scale.y, want, 1); }
  }
  return { setPin, top: () => { fly = null; aimCamera(stage, size, "top"); }, angled: () => { fly = null; aimCamera(stage, size, "diorama"); }, dispose: () => stage.dispose() };
}

// ── developer Store Builder ───────────────────────────────────────────────────
const DRAFT = "gils-store-builder-draft";
const CSS = `
.sb{--bg:#080b12;--panel:#0f1525;--line:#1e2a40;--line-2:#2a3650;--fg:#e8ecf4;--sub:#7a879e;--dim:#4a5670;--gold:#f0c040;--gold-ink:#141005;--danger:#e8645a;--ok:#3ccf8e;
  color:var(--fg);font:14px Inter,system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;gap:10px;color-scheme:dark}
.sb *{box-sizing:border-box}
.sb [hidden]{display:none!important}
.sb button{font:600 12px Inter,system-ui,sans-serif;background:var(--panel);color:var(--fg);border:1px solid var(--line-2);border-radius:8px;padding:8px 10px;cursor:pointer;white-space:nowrap;transition:border-color .15s,transform .08s}
.sb button:active{transform:scale(.96)}
.sb button.primary{background:var(--gold);color:var(--gold-ink);border-color:var(--gold)}
.sb button.on{background:#f0c04022;border-color:var(--gold);color:var(--gold)}
.sb button.danger{color:var(--danger);border-color:#e8645a55}
.sb button:disabled{opacity:.35;cursor:default}
.sb .toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.sb .seg{display:inline-flex;border:1px solid var(--line-2);border-radius:8px;overflow:hidden}
.sb .seg button{border:0;border-radius:0;background:transparent;padding:8px 9px}
.sb .seg button.on{background:#f0c04022}
.sb .catalog{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.sb .cat{display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-width:88px;padding:8px 9px;text-align:left}
.sb .cat .box{width:100%;height:16px;border-radius:4px;border:1px solid #ffffff22}
.sb .cat small{font:500 10px "JetBrains Mono",ui-monospace,monospace;color:var(--sub)}
.sb .stage{position:relative;background:#04060c;border:1px solid var(--line);border-radius:12px;overflow:hidden;height:min(62vh,560px);min-height:320px}
.sb .pill{position:absolute;left:8px;top:8px;font:600 11px Inter,system-ui,sans-serif;background:#080b12cc;border:1px solid var(--line-2);border-radius:999px;padding:5px 10px;color:var(--sub);pointer-events:none}
.sb .pill.gold{color:var(--gold);border-color:#f0c04066}
.sb .hint{font-size:12px;color:var(--sub);line-height:1.55}
.sb .card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;gap:9px;min-width:0}
.sb .card h3{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--sub);margin:0;font-weight:600}
.sb label.f{display:grid;gap:4px;font-size:11px;color:var(--sub)}
.sb input,.sb textarea{font:13px Inter,system-ui,sans-serif;background:var(--bg);color:var(--fg);border:1px solid var(--line-2);border-radius:7px;padding:8px 9px;width:100%;min-width:0}
.sb .mono{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-size:12px}
.sb .g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.sb .g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.sb .row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.sb .sw{width:26px;height:26px;border-radius:7px;padding:0;border:2px solid transparent}
.sb .sw.on{border-color:var(--gold)}
.sb .toggle{display:flex;justify-content:space-between;align-items:center;font-size:13px;gap:8px}
.sb .layers{max-height:220px;overflow:auto;display:grid;gap:2px}
.sb .layer{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;background:transparent;border:1px solid transparent;text-align:left;font-weight:500;font-size:12px;width:100%}
.sb .layer.on{border-color:var(--gold);background:#f0c04014}
.sb .chip{width:12px;height:12px;border-radius:3px;flex-shrink:0;border:1px solid var(--line-2)}
.sb .layer .k{margin-left:auto;font:10px "JetBrains Mono",monospace;color:var(--dim)}
.sb .empty{font-size:12px;color:var(--dim);line-height:1.5}
.sb .status{font:600 11px "JetBrains Mono",monospace;padding:4px 9px;border-radius:999px;border:1px solid var(--line-2);color:var(--sub)}
.sb .status.dirty{color:var(--gold);border-color:#f0c04066}
.sb .status.saved{color:var(--ok);border-color:#3ccf8e66}
.sb textarea.out{min-height:110px;resize:vertical;line-height:1.45}
.sb .confirm{background:#2a0f0f;border:1px solid #e8645a55;border-radius:9px;padding:10px;display:grid;gap:8px;font-size:12px;color:#f0b0aa}
.sb .toast{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ok);color:#04140c;font-weight:700;padding:9px 16px;border-radius:20px;font-size:13px;z-index:400}
`;
const MARKUP = `
<div class="catalog" data-r="catalog"></div>
<div class="toolbar">
  <button class="primary" data-r="save">Save to app</button>
  <span class="status" data-r="status">Saved</span>
</div>
<div class="toolbar">
  <button data-r="drawWall">✏ Draw wall</button>
  <button data-r="rot">⟳ Rotate</button>
  <button data-r="dup">Duplicate</button>
  <button class="danger" data-r="del">Delete</button>
  <button data-r="undo">↶</button><button data-r="redo">↷</button>
</div>
<div class="toolbar">
  <div class="seg"><button data-walls="up">Walls up</button><button data-walls="cut" class="on">Cutaway</button><button data-walls="down">Down</button></div>
  <div class="seg"><button data-r="cam3d" class="on">3D</button><button data-r="camTop">Top</button></div>
  <button data-r="labels" class="on">Labels</button>
  <button data-r="snap" class="on">Snap ½ ft</button>
</div>
<div class="stage" data-r="stage"><span class="pill" data-r="modePill"></span></div>
<div class="hint">Drag a fixture to slide it. Once selected, drag a <b>gold corner</b> for width/depth or the <b>blue arrow</b> for height. Drag empty space to orbit, pinch or scroll to zoom, two-finger or right-drag to pan. Changes stay a draft on this device until you press <b>Save to app</b>.</div>
<div class="card" data-r="inspector"></div>
<div class="card">
  <h3>Store size</h3>
  <div class="g2">
    <label class="f">Width (ft, left → right)<input class="mono" type="number" step="0.5" min="5" data-r="sizeW"></label>
    <label class="f">Depth (ft, back → front)<input class="mono" type="number" step="0.5" min="5" data-r="sizeD"></label>
  </div>
  <div class="hint">Changing the size stretches everything with it.</div>
</div>
<div class="card"><h3>Layers <span data-r="stats" style="letter-spacing:0;text-transform:none;font-weight:500;color:var(--dim)"></span></h3><div class="layers" data-r="layers"></div></div>
<div class="card">
  <h3>Backup &amp; import</h3>
  <div class="hint">Paste a layout from the standalone Store Builder page, or copy this one as a backup.</div>
  <div class="row"><button data-r="importBtn">Import…</button><button data-r="copy">Copy layout</button><button class="danger" data-r="discardBtn">Discard draft</button></div>
  <div data-r="importBox" hidden style="display:grid;gap:8px">
    <textarea class="out mono" data-r="importText" placeholder="Paste an exported layout here"></textarea>
    <div class="row"><button class="primary" data-r="importGo">Load it</button><button data-r="importCancel">Cancel</button></div>
    <div class="empty" data-r="importErr"></div>
  </div>
  <div class="confirm" data-r="discardBox" hidden>Throw away the draft and go back to the layout the app is using?
    <div class="row"><button class="danger" data-r="discardGo">Discard draft</button><button data-r="discardCancel">Keep editing</button></div>
  </div>
</div>
<div class="toast" data-r="toast" hidden></div>`;

export function mountBuilder(host, layout, { onSave }) {
  look = LOOK.builder; // the builder keeps its own workspace look
  if (!document.querySelector("style[data-sb]")) { const s = document.createElement("style"); s.dataset.sb = "1"; s.textContent = CSS; document.head.appendChild(s); }
  host.classList.add("sb"); host.innerHTML = MARKUP;
  const $ = n => host.querySelector(`[data-r="${n}"]`);
  const all = sel => host.querySelectorAll(sel);

  let saved = toFeet(layout);
  let state = (() => { try { const d = JSON.parse(localStorage.getItem(DRAFT)); if (d && d.size && Array.isArray(d.zones)) return d; } catch {} return structuredClone(saved); })();
  let sel = null, undoS = [], redoS = [], snapOn = true, labelsOn = true, wallMode = "cut", drawWall = false, drag = null;
  const snap = v => snapOn ? Math.round(v * 2) / 2 : Math.round(v * 10) / 10;
  const snapshot = () => JSON.stringify(state);
  const pushUndo = before => { if (before !== snapshot()) { undoS.push(before); if (undoS.length > 100) undoS.shift(); redoS = []; } };
  const commit = fn => { const b = snapshot(); fn(); pushUndo(b); refresh(); };
  const uniqueKey = base => { const keys = new Set(state.zones.map(z => z.key)); let k = base, n = 2; while (keys.has(k)) k = `${base}_${n++}`; return k; };
  const wx = x => x - state.size.w / 2, wz = z => z - state.size.d / 2;

  // ── stage ──
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const stage = createStage($("stage"), { listeners: { pointerdown: onDown, pointermove: onMove, pointerup: onUp, pointercancel: onUp } });
  let zoneMeshes = [], wallMeshes = [], handleMeshes = [], labelSprites = [], ghostWall, selBox = null;
  const wallH = [];
  const _p = new THREE.Vector3();
  stage.setFrame(() => {
    animateWalls(wallMeshes, state.walls, state.size, stage.camera, wallMode, wallH);
    if (sel && sel.kind === "wall") syncWall(sel.i);
    handleMeshes.forEach(h => { h.getWorldPosition(_p); h.scale.setScalar(clamp(stage.camera.position.distanceTo(_p) * 0.028, 0.7, 3)); });
  });

  function buildScene() {
    clearWorld(stage.world); zoneMeshes = []; wallMeshes = []; handleMeshes = []; labelSprites = [];
    addFloor(stage.world, state.size);
    selBox = null;
    if (sel && sel.kind === "zone") {
      selBox = new THREE.LineSegments(UNIT_EDGES, new THREE.LineBasicMaterial({ color: "#f0c040", depthTest: false, transparent: true }));
      selBox.renderOrder = 15; stage.world.add(selBox);
    }
    state.zones.forEach((z, i) => {
      const on = sel && sel.kind === "zone" && sel.i === i;
      const m = buildFixture(z, state.size); m.userData = { kind: "zone", i, top: m.userData.top };
      stage.world.add(m); zoneMeshes[i] = m;
      if (z.label) { const s = makeLabel(z.label, on, labelsOn); stage.world.add(s); labelSprites[i] = s; }
    });
    state.walls.forEach((w, i) => {
      const on = sel && sel.kind === "wall" && sel.i === i;
      const m = new THREE.Mesh(UNIT, wallMaterial(on)); m.castShadow = true; m.receiveShadow = true;
      m.userData = { kind: "wall", i }; m.scale.y = wallH[i] ?? WALL_H;
      stage.world.add(m); wallMeshes[i] = m;
    });
    if (sel && sel.kind === "wall") ["p1", "p2"].forEach(part => addHandle(part, "#f0c040", new THREE.SphereGeometry(0.5, 20, 14)));
    if (sel && sel.kind === "zone") {
      ["c-nw", "c-ne", "c-sw", "c-se"].forEach(part => addHandle(part, "#f0c040", new THREE.SphereGeometry(0.4, 18, 12)));
      addHandle("top", "#7fd3ff", new THREE.ConeGeometry(0.42, 0.85, 20));
    }
    state.zones.forEach((_, i) => syncZone(i, false));
    state.walls.forEach((_, i) => syncWall(i));
    ghostWall = new THREE.Mesh(UNIT, new THREE.MeshStandardMaterial({ color: "#f0c040", transparent: true, opacity: 0.55 }));
    ghostWall.visible = false; stage.world.add(ghostWall);
  }
  function addHandle(part, col, geo) {
    const h = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: 0.55, depthTest: false, transparent: true }));
    h.renderOrder = 20; h.userData = { kind: sel.kind, i: sel.i, part }; stage.world.add(h); handleMeshes.push(h);
  }
  function syncZone(i, rebuild = true) {
    const z = state.zones[i]; let m = zoneMeshes[i]; if (!m) return;
    if (rebuild) {
      stage.world.remove(m); disposeObj(m);
      m = buildFixture(z, state.size); m.userData = { kind: "zone", i, top: m.userData.top };
      stage.world.add(m); zoneMeshes[i] = m;
    }
    const on = sel && sel.kind === "zone" && sel.i === i;
    const s = labelSprites[i]; if (s) s.position.set(m.position.x, m.userData.top + (on ? 2.2 : 0.9), m.position.z);
    if (on) {
      if (selBox) { const bh = Math.max(z.h, 0.1) + 0.1; selBox.scale.set(z.w + 0.15, bh, z.d + 0.15); selBox.position.set(m.position.x, bh / 2, m.position.z); }
      const x0 = wx(z.x), x1 = wx(z.x + z.w), z0 = wz(z.z), z1 = wz(z.z + z.d), y = z.h;
      const pos = { "c-nw": [x0, y, z0], "c-ne": [x1, y, z0], "c-sw": [x0, y, z1], "c-se": [x1, y, z1], top: [(x0 + x1) / 2, y + 0.75, (z0 + z1) / 2] };
      handleMeshes.forEach(h => h.position.set(...pos[h.userData.part]));
    }
  }
  function syncWall(i) {
    const w = state.walls[i], m = wallMeshes[i]; if (!m) return;
    placeWall(m, w, state.size, m.scale.y);
    if (sel && sel.kind === "wall" && sel.i === i && handleMeshes.length) {
      handleMeshes[0].position.set(wx(w.x1), Math.min(m.scale.y, WALL_H) + 0.6, wz(w.z1));
      handleMeshes[1].position.set(wx(w.x2), Math.min(m.scale.y, WALL_H) + 0.6, wz(w.z2));
    }
  }

  // ── picking & dragging ──
  function setNdc(e) { const r = stage.el.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); raycaster.setFromCamera(ndc, stage.camera); }
  function planeHit(plane) { const p = new THREE.Vector3(); return raycaster.ray.intersectPlane(plane, p) ? p : null; }
  function floorHit() { const p = planeHit(FLOOR_PLANE); return p ? { x: p.x + state.size.w / 2, z: p.z + state.size.d / 2 } : null; }
  function onDown(e) {
    if (e.button === 2) return;
    setNdc(e);
    if (drawWall) {
      const p = floorHit(); if (!p) return;
      stage.controls.enabled = false;
      drag = { type: "draw", start: { x: snap(p.x), z: snap(p.z) }, end: null, before: snapshot() };
      stage.el.setPointerCapture(e.pointerId); return;
    }
    const hh = raycaster.intersectObjects(handleMeshes, false);
    const hits = hh.length ? hh : raycaster.intersectObjects([...zoneMeshes.filter(Boolean), ...wallMeshes], true);
    if (!hits.length) { drag = { type: "maybeDeselect", x: e.clientX, y: e.clientY }; return; }
    const ud = rootOf(hits[0].object).userData, part = ud.part || "body";
    let plane = FLOOR_PLANE;
    if (part.startsWith("c-")) plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -state.zones[ud.i].h);
    else if (part === "top") {
      const at = hits[0].object.position, n = new THREE.Vector3(stage.camera.position.x - at.x, 0, stage.camera.position.z - at.z).normalize();
      plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, at);
    }
    const p = planeHit(plane); if (!p) return;
    stage.controls.enabled = false;
    const changed = !sel || sel.kind !== ud.kind || sel.i !== ud.i;
    sel = { kind: ud.kind, i: ud.i };
    drag = { type: "obj", kind: ud.kind, i: ud.i, part, plane, start: p, orig: { ...(ud.kind === "zone" ? state.zones[ud.i] : state.walls[ud.i]) }, before: snapshot(), moved: false };
    stage.el.setPointerCapture(e.pointerId);
    if (changed) refresh();
  }
  function onMove(e) {
    if (!drag || drag.type === "maybeDeselect") return;
    setNdc(e);
    const { w: W, d: D } = state.size, pill = $("modePill");
    if (drag.type === "draw") {
      const p = floorHit(); if (!p) return;
      drag.end = { x: clamp(snap(p.x), 0, W), z: clamp(snap(p.z), 0, D) };
      const s = drag.start, t = drag.end, dx = t.x - s.x, dz = t.z - s.z, L = Math.hypot(dx, dz);
      ghostWall.visible = L > 0.2; ghostWall.scale.set(L + WALL_T, WALL_H * 0.6, WALL_T);
      ghostWall.position.set(wx((s.x + t.x) / 2), WALL_H * 0.3, wz((s.z + t.z) / 2)); ghostWall.rotation.y = -Math.atan2(dz, dx);
      pill.textContent = `Wall · ${L.toFixed(1)} ft`; return;
    }
    const p = planeHit(drag.plane); if (!p) return;
    const dx = p.x - drag.start.x, dy = p.y - drag.start.y, dz = p.z - drag.start.z, o = drag.orig;
    if (!drag.moved && Math.hypot(dx, dy, dz) < 0.15) return;
    drag.moved = true;
    if (drag.kind === "zone") {
      const z = state.zones[drag.i], part = drag.part, MIN = 0.25, name = z.label || "Separator";
      if (part === "body") {
        z.x = clamp(snap(o.x + dx), 0, Math.max(0, W - z.w)); z.z = clamp(snap(o.z + dz), 0, Math.max(0, D - z.d));
        pill.textContent = `${name} · ${z.x.toFixed(1)} ft from left, ${z.z.toFixed(1)} ft from back`;
      } else if (part === "top") {
        z.h = clamp(snap(o.h + dy), 0.05, 30);
        pill.textContent = `${name} · ${z.h.toFixed(1)} ft tall`;
      } else {
        let L = o.x, T = o.z, R = o.x + o.w, B = o.z + o.d;
        if (part.includes("w")) L = clamp(snap(o.x + dx), 0, R - MIN);
        if (part.includes("e")) R = clamp(snap(R + dx), L + MIN, W);
        if (part.includes("n")) T = clamp(snap(o.z + dz), 0, B - MIN);
        if (part.includes("s")) B = clamp(snap(B + dz), T + MIN, D);
        z.x = r2(L); z.z = r2(T); z.w = r2(R - L); z.d = r2(B - T);
        pill.textContent = `${name} · ${z.w.toFixed(1)} × ${z.d.toFixed(1)} ft`;
      }
      syncZone(drag.i);
    } else {
      const w = state.walls[drag.i];
      if (drag.part === "p1") { w.x1 = clamp(snap(o.x1 + dx), 0, W); w.z1 = clamp(snap(o.z1 + dz), 0, D); }
      else if (drag.part === "p2") { w.x2 = clamp(snap(o.x2 + dx), 0, W); w.z2 = clamp(snap(o.z2 + dz), 0, D); }
      else { w.x1 = snap(o.x1 + dx); w.z1 = snap(o.z1 + dz); w.x2 = snap(o.x2 + dx); w.z2 = snap(o.z2 + dz); }
      syncWall(drag.i);
      pill.textContent = `Wall · ${Math.hypot(w.x2 - w.x1, w.z2 - w.z1).toFixed(1)} ft`;
    }
    syncInspectorValues();
  }
  function onUp(e) {
    stage.controls.enabled = true;
    if (!drag) return;
    if (drag.type === "maybeDeselect") { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5 && sel) { sel = null; refresh(); } }
    else if (drag.type === "draw") {
      ghostWall.visible = false;
      const s = drag.start, t = drag.end;
      if (t && Math.hypot(t.x - s.x, t.z - s.z) >= 0.5) { state.walls.push({ x1: s.x, z1: s.z, x2: t.x, z2: t.z }); sel = { kind: "wall", i: state.walls.length - 1 }; }
      pushUndo(drag.before); refresh();
    } else { pushUndo(drag.before); refresh(); }
    drag = null; setPill();
  }
  function setPill() {
    const p = $("modePill"); p.classList.toggle("gold", drawWall);
    p.textContent = drawWall ? "Draw wall · drag across the floor" : sel ? (sel.kind === "zone" ? `Selected: ${state.zones[sel.i].label || "Separator"}` : `Selected: wall ${sel.i + 1}`) : "Drag fixtures · drag empty space to orbit";
  }

  // ── panel ──
  function refresh() {
    buildScene();
    const zs = state.zones;
    $("stats").textContent = `· ${state.size.w}×${state.size.d} ft · ${zs.length} fixtures · ${state.walls.length} walls`;
    $("undo").disabled = !undoS.length; $("redo").disabled = !redoS.length;
    $("dup").disabled = $("del").disabled = !sel; $("rot").disabled = !sel || sel.kind !== "zone";
    if (document.activeElement !== $("sizeW")) $("sizeW").value = state.size.w;
    if (document.activeElement !== $("sizeD")) $("sizeD").value = state.size.d;
    let L = "";
    zs.forEach((z, i) => { const on = sel && sel.kind === "zone" && sel.i === i;
      L += `<button class="layer${on ? " on" : ""}" data-kind="zone" data-i="${i}"><span class="chip" style="background:${z.color}"></span>${esc(z.label || "(separator)")}<span class="k">${esc(KINDS[z.kind].name)}</span></button>`; });
    state.walls.forEach((w, i) => { const on = sel && sel.kind === "wall" && sel.i === i;
      L += `<button class="layer${on ? " on" : ""}" data-kind="wall" data-i="${i}"><span class="chip" style="background:#b7413a"></span>Wall ${i + 1}<span class="k">${Math.hypot(w.x2 - w.x1, w.z2 - w.z1).toFixed(1)} ft</span></button>`; });
    $("layers").innerHTML = L;
    const insp = $("inspector"), sig = sel ? sel.kind + sel.i : "none";
    if (insp.contains(document.activeElement) && insp.dataset.sig === sig) syncInspectorValues();
    else { insp.dataset.sig = sig; insp.innerHTML = inspectorHtml(); }
    const dirty = snapshot() !== JSON.stringify(saved);
    const st = $("status"); st.textContent = dirty ? "Unsaved draft" : "Saved"; st.className = "status " + (dirty ? "dirty" : "saved");
    try { dirty ? localStorage.setItem(DRAFT, snapshot()) : localStorage.removeItem(DRAFT); } catch {}
    setPill();
  }
  const num = (f, v, label) => `<label class="f">${label}<input class="mono" type="number" step="0.5" data-f="${f}" value="${v}"></label>`;
  function inspectorHtml() {
    if (!sel) return `<h3>Selected</h3><div class="empty">Nothing selected. Tap a fixture or wall, pick one from Layers, or place something new from the strip above.</div>`;
    if (sel.kind === "wall") {
      const w = state.walls[sel.i];
      return `<h3>Wall ${sel.i + 1}</h3><div class="g2">${num("x1", w.x1, "Start · from left")}${num("z1", w.z1, "Start · from back")}${num("x2", w.x2, "End · from left")}${num("z2", w.z2, "End · from back")}</div><div class="hint">Drag the gold balls to move each end. All values in feet.</div>`;
    }
    const z = state.zones[sel.i];
    return `<h3>Selected fixture</h3>
      <label class="f">Name shown on the map<input type="text" data-f="label" value="${esc(z.label)}" placeholder="e.g. Candy 4"></label>
      <label class="f">Key (what items are pinned to)<input class="mono" type="text" data-f="key" value="${esc(z.key)}"></label>
      <div class="g2">${num("x", z.x, "From left wall (ft)")}${num("z", z.z, "From back wall (ft)")}</div>
      <div class="g3">${num("w", z.w, "Width")}${num("d", z.d, "Depth")}${num("h", z.h, "Height")}</div>
      <div class="row">${Object.entries(KINDS).map(([k, v]) => `<button data-kind-set="${k}" class="${z.kind === k ? "on" : ""}" style="padding:6px 8px">${v.name}</button>`).join("")}</div>
      <div class="row">${COLORS.map(([c, n]) => `<button class="sw${z.color === c ? " on" : ""}" data-color="${c}" title="${n}" aria-label="${n}" style="background:${c}"></button>`).join("")}</div>
      <div class="toggle"><span>Tappable (items can be pinned here)</span><button data-r="tap" class="${z.tappable ? "on" : ""}">${z.tappable ? "Yes" : "No"}</button></div>`;
  }
  function syncInspectorValues() {
    if (!sel) return;
    const o = sel.kind === "zone" ? state.zones[sel.i] : state.walls[sel.i];
    $("inspector").querySelectorAll("input[data-f]").forEach(inp => { if (inp !== document.activeElement) inp.value = o[inp.dataset.f]; });
  }
  let editBefore = null;
  const insp = $("inspector");
  insp.addEventListener("focusin", () => { editBefore = snapshot(); });
  insp.addEventListener("input", e => {
    const f = e.target.dataset.f; if (!f || !sel) return;
    const o = sel.kind === "zone" ? state.zones[sel.i] : state.walls[sel.i];
    if (f === "label") o.label = e.target.value;
    else if (f === "key") o.key = slug(e.target.value);
    else { const v = parseFloat(e.target.value); if (isNaN(v)) return; o[f] = ["w", "d"].includes(f) ? Math.max(0.1, v) : f === "h" ? Math.max(0.02, v) : v; }
    refresh();
  });
  insp.addEventListener("change", () => { if (editBefore) { pushUndo(editBefore); editBefore = snapshot(); refresh(); } });
  insp.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || !sel || sel.kind !== "zone") return;
    const z = state.zones[sel.i];
    if (b.dataset.color) commit(() => { z.color = b.dataset.color; });
    else if (b.dataset.kindSet) commit(() => { z.kind = b.dataset.kindSet; z.h = KINDS[z.kind].h; if (z.kind === "separator") z.tappable = false; });
    else if (b.dataset.r === "tap") commit(() => { z.tappable = !z.tappable; });
    else return;
    insp.dataset.sig = ""; refresh();
  });
  $("layers").addEventListener("click", e => { const b = e.target.closest(".layer"); if (!b) return; sel = { kind: b.dataset.kind, i: +b.dataset.i }; refresh(); });

  // ── catalog & toolbar ──
  $("catalog").innerHTML = Object.entries(KINDS).map(([k, v]) =>
    `<button class="cat" data-add="${k}"><span class="box" style="background:#${calm(v.color, 0.5).getHexString()}"></span>${v.name}<small>${v.w}×${v.d}×${v.h} ft</small></button>`).join("");
  $("catalog").addEventListener("click", e => {
    const b = e.target.closest("[data-add]"); if (!b) return; const k = b.dataset.add, K = KINDS[k];
    setDraw(false);
    commit(() => {
      const n = state.zones.filter(z => z.kind === k).length + 1;
      state.zones.push({ key: uniqueKey(slug(K.name) + "_" + n), label: k === "separator" ? "" : `${K.name} ${n}`, kind: k,
        x: snap(state.size.w / 2 - K.w / 2), z: snap(state.size.d / 2 - K.d / 2), w: K.w, d: K.d, h: K.h, color: K.color, tappable: k !== "separator" });
      sel = { kind: "zone", i: state.zones.length - 1 };
    });
    toast(`${K.name} placed in the middle. Drag it into place.`);
  });
  function setDraw(on) { drawWall = on; $("drawWall").classList.toggle("on", on); setPill(); }
  $("drawWall").onclick = () => { setDraw(!drawWall); if (drawWall) { sel = null; refresh(); } };
  const FACE_NAMES = ["the entrance", "the right wall", "the back", "the left wall"];
  function rotate() {
    if (!sel || sel.kind !== "zone") return;
    let msg = "";
    commit(() => {
      const z = state.zones[sel.i], cx = z.x + z.w / 2, cz = z.z + z.d / 2;
      z.rot = (rotOf(z, state.size) + 90) % 360;   // quarter turn clockwise, all the way round
      [z.w, z.d] = [z.d, z.w];
      z.x = clamp(snap(cx - z.w / 2), 0, Math.max(0, state.size.w - z.w)); z.z = clamp(snap(cz - z.d / 2), 0, Math.max(0, state.size.d - z.d));
      msg = `${z.label || "Separator"} · ${z.rot}° · front faces ${FACE_NAMES[z.rot / 90]}`;
    });
    $("modePill").textContent = msg;
  }
  $("rot").onclick = rotate;
  $("dup").onclick = () => { if (!sel) return; commit(() => {
    if (sel.kind === "zone") { const z = state.zones[sel.i]; state.zones.push({ ...z, key: uniqueKey(z.key + "_copy"), label: z.label ? z.label + " copy" : "", x: clamp(z.x + 1, 0, state.size.w - z.w), z: clamp(z.z + 1, 0, state.size.d - z.d) }); sel = { kind: "zone", i: state.zones.length - 1 }; }
    else { const w = state.walls[sel.i]; state.walls.push({ x1: w.x1 + 1, z1: w.z1 + 1, x2: w.x2 + 1, z2: w.z2 + 1 }); sel = { kind: "wall", i: state.walls.length - 1 }; }
  }); };
  $("del").onclick = () => { if (!sel) return; commit(() => { (sel.kind === "zone" ? state.zones : state.walls).splice(sel.i, 1); sel = null; }); };
  $("undo").onclick = () => { if (!undoS.length) return; redoS.push(snapshot()); state = JSON.parse(undoS.pop()); sel = null; refresh(); };
  $("redo").onclick = () => { if (!redoS.length) return; undoS.push(snapshot()); state = JSON.parse(redoS.pop()); sel = null; refresh(); };
  all("[data-walls]").forEach(b => b.onclick = () => { wallMode = b.dataset.walls; all("[data-walls]").forEach(x => x.classList.toggle("on", x === b)); });
  const setCam = mode => { aimCamera(stage, state.size, mode); $("cam3d").classList.toggle("on", mode === "3d"); $("camTop").classList.toggle("on", mode === "top"); };
  $("cam3d").onclick = () => setCam("3d"); $("camTop").onclick = () => setCam("top");
  $("labels").onclick = () => { labelsOn = !labelsOn; $("labels").classList.toggle("on", labelsOn); labelSprites.forEach(s => s && (s.visible = labelsOn)); };
  $("snap").onclick = () => { snapOn = !snapOn; $("snap").classList.toggle("on", snapOn); };
  let sizeBefore = null;
  ["sizeW", "sizeD"].forEach(n => {
    $(n).addEventListener("focus", () => { sizeBefore = snapshot(); });
    $(n).addEventListener("change", () => {
      const v = parseFloat($(n).value); if (isNaN(v) || v < 5) { refresh(); return; }
      const axis = n === "sizeW" ? "w" : "d", k = v / state.size[axis];
      state.size[axis] = v;
      state.zones.forEach(z => { if (axis === "w") { z.x = r2(z.x * k); z.w = r2(z.w * k); } else { z.z = r2(z.z * k); z.d = r2(z.d * k); } });
      state.walls.forEach(w => { if (axis === "w") { w.x1 = r2(w.x1 * k); w.x2 = r2(w.x2 * k); } else { w.z1 = r2(w.z1 * k); w.z2 = r2(w.z2 * k); } });
      pushUndo(sizeBefore); refresh(); setCam("3d");
    });
  });
  function onKey(e) {
    if (!host.isConnected || e.target.matches("input,textarea")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); (e.shiftKey ? $("redo") : $("undo")).click(); return; }
    if (e.key === "Escape") { setDraw(false); sel = null; refresh(); return; }
    if (!sel) return;
    if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); $("del").click(); return; }
    if (e.key.toLowerCase() === "r") { rotate(); return; }
    const st = e.shiftKey ? 2 : 0.5, d = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
    if (!d) return; e.preventDefault();
    commit(() => { if (sel.kind === "zone") { const z = state.zones[sel.i]; z.x = r2(clamp(z.x + d[0], 0, state.size.w - z.w)); z.z = r2(clamp(z.z + d[1], 0, state.size.d - z.d)); }
      else { const w = state.walls[sel.i]; w.x1 += d[0]; w.x2 += d[0]; w.z1 += d[1]; w.z2 += d[1]; } });
  }
  document.addEventListener("keydown", onKey);

  // ── save / import / discard ──
  function toast(msg, bad) { const t = $("toast"); t.textContent = msg; t.style.background = bad ? "#e8645a" : ""; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, 2200); }
  $("save").onclick = async () => {
    const btn = $("save"); btn.disabled = true; btn.textContent = "Saving…";
    try { await onSave(toPercent(state)); saved = JSON.parse(snapshot()); refresh(); toast("Saved. Every floor map now uses this layout."); }
    catch (err) { toast("Couldn't save to the database. Check your connection and try again.", true); console.error(err); }
    btn.disabled = false; btn.textContent = "Save to app";
  };
  const exportText = () => { const l = toPercent(state);
    return `// Gil's Store Builder export — ${new Date().toLocaleDateString()}\nconst STORE_SIZE = ${JSON.stringify(l.size)};\nconst FLOOR_ZONES = [\n${l.zones.map(z => "  " + JSON.stringify(z)).join(",\n")}\n];\nconst FLOOR_WALLS = [\n${l.walls.map(w => "  " + JSON.stringify(w)).join(",\n")}\n];`; };
  $("copy").onclick = () => { navigator.clipboard.writeText(exportText()).then(() => toast("Layout copied")).catch(() => toast("Your browser blocked the clipboard", true)); };
  $("importBtn").onclick = () => { $("importBox").hidden = false; $("discardBox").hidden = true; $("importText").focus(); };
  $("importCancel").onclick = () => { $("importBox").hidden = true; $("importErr").textContent = ""; };
  $("importGo").onclick = () => {
    const txt = $("importText").value;
    try {
      const zm = txt.match(/FLOOR_ZONES\s*=\s*(\[[\s\S]*?\]);/), wm = txt.match(/FLOOR_WALLS\s*=\s*(\[[\s\S]*?\]);/), sm = txt.match(/STORE_SIZE\s*=\s*(\{[\s\S]*?\});/);
      if (!zm) throw new Error("Couldn't find FLOOR_ZONES in what you pasted.");
      const next = toFeet({ zones: JSON.parse(zm[1]), walls: wm ? JSON.parse(wm[1]) : [], size: sm ? JSON.parse(sm[1]) : state.size });
      commit(() => { state = next; sel = null; }); setCam("3d");
      $("importBox").hidden = true; $("importText").value = ""; $("importErr").textContent = "";
      toast("Layout loaded. Press Save to app to publish it.");
    } catch (err) { $("importErr").textContent = err.message.startsWith("Couldn't") ? err.message : "That doesn't look like a Store Builder export. Paste the whole block, including the const lines."; }
  };
  $("discardBtn").onclick = () => { $("discardBox").hidden = false; $("importBox").hidden = true; };
  $("discardCancel").onclick = () => { $("discardBox").hidden = true; };
  $("discardGo").onclick = () => { commit(() => { state = structuredClone(saved); sel = null; }); setCam("3d"); $("discardBox").hidden = true; toast("Draft discarded"); };

  setCam("3d"); refresh();
  return { dispose() { document.removeEventListener("keydown", onKey); stage.dispose(); host.innerHTML = ""; host.classList.remove("sb"); } };
}
