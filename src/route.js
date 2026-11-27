// Walking route from the entrance to a fixture, shared by the 2D and 3D maps.
// Works in feet with the store's top-left corner at (0, 0): x across, z down the plan.

const CELL = 0.5;        // grid resolution (ft)
const CLEAR = 0.75;      // keep this far from shelves and walls (ft)

// app layout (percent of the store) → feet
export function layoutFeet(layout) {
  const size = layout.size || { w: 40, d: 33 }, fx = v => v / 100 * size.w, fz = v => v / 100 * size.d;
  return {
    size,
    zones: (layout.zones || []).map(z => ({ key: z.key, label: z.label || "", x: fx(z.x), z: fz(z.y), w: fx(z.w), d: fz(z.h) })),
    walls: (layout.walls || []).map(w => ({ x1: fx(w.x1), z1: fz(w.y1), x2: fx(w.x2), z2: fz(w.y2) })),
    door: layout.door ? { x: fx(layout.door.x), z: fz(layout.door.y) } : null,
  };
}

// The entrance: layout.door if set, otherwise the 2.5–10 ft gap between two
// lined-up outside wall ends (e.g. the front wall drawn as two pieces).
export function findDoor(st) {
  const { size } = st, cx = size.w / 2, cz = size.d / 2;
  const ends = [];
  st.walls.forEach((w, i) => {
    const horiz = Math.abs(w.x2 - w.x1) >= Math.abs(w.z2 - w.z1);
    ends.push({ x: w.x1, z: w.z1, i, horiz }, { x: w.x2, z: w.z2, i, horiz });
  });
  let best = null;
  if (st.door) best = { x: st.door.x, z: st.door.z, width: 3.5, horiz: Math.abs(st.door.z - cz) / size.d > Math.abs(st.door.x - cx) / size.w };
  else for (let a = 0; a < ends.length; a++) for (let b = a + 1; b < ends.length; b++) {
    const p = ends[a], q = ends[b];
    if (p.i === q.i || p.horiz !== q.horiz) continue;
    const along = p.horiz ? Math.abs(p.x - q.x) : Math.abs(p.z - q.z), across = p.horiz ? Math.abs(p.z - q.z) : Math.abs(p.x - q.x);
    if (along < 2.5 || along > 10 || across > 1) continue;
    const m = { x: (p.x + q.x) / 2, z: (p.z + q.z) / 2, width: along, horiz: p.horiz };
    // prefer gaps on the outside edge of the building
    m.edge = p.horiz ? Math.abs(m.z - cz) / size.d : Math.abs(m.x - cx) / size.w;
    if (!best || m.edge > best.edge) best = m;
  }
  if (!best) return null;
  // inward direction: from the gap toward the middle of the store
  const nx = best.horiz ? 0 : Math.sign(cx - best.x) || 1, nz = best.horiz ? Math.sign(cz - best.z) || 1 : 0;
  return { ...best, nx, nz };
}

// distance from a point to a rectangle (0 inside)
const rectDist = (px, pz, r) => Math.hypot(Math.max(r.x - px, 0, px - (r.x + r.w)), Math.max(r.z - pz, 0, pz - (r.z + r.d)));
function segDist(px, pz, w) {
  const dx = w.x2 - w.x1, dz = w.z2 - w.z1, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - w.x1) * dx + (pz - w.z1) * dz) / L2));
  return Math.hypot(px - (w.x1 + t * dx), pz - (w.z1 + t * dz));
}

// Route from the door to just in front of the fixture `zoneKey`, as a list of {x, z} corners.
export function routeTo(st, zoneKey, door = findDoor(st)) {
  const goalZone = st.zones.find(z => z.key === zoneKey);
  if (!door || !goalZone) return null;
  const W = Math.ceil(st.size.w / CELL), D = Math.ceil(st.size.d / CELL), N = W * D;
  const cx = i => (i % W + 0.5) * CELL, cz = i => (Math.floor(i / W) + 0.5) * CELL;
  const blocked = new Uint8Array(N), goal = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const x = cx(i), z = cz(i);
    if (st.walls.some(w => segDist(x, z, w) < 0.25 + CLEAR * 0.8)) { blocked[i] = 1; continue; }
    if (st.zones.some(r => r.w > 0.1 && rectDist(x, z, r) < CLEAR)) blocked[i] = 1;
    const g = rectDist(x, z, goalZone);
    if (g >= CLEAR && g < CLEAR + 1.4) goal[i] = 1;
  }
  // start just inside the door (nearest open cell)
  const sx = door.x + door.nx * 1.2, sz = door.z + door.nz * 1.2;
  let start = -1, sd = Infinity;
  for (let i = 0; i < N; i++) if (!blocked[i]) { const d = Math.hypot(cx(i) - sx, cz(i) - sz); if (d < sd) { sd = d; start = i; } }
  if (start < 0) return null;
  // Dijkstra on the grid (8 directions, no corner cutting) until we touch the fixture
  const dist = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N);
  dist[start] = 0;
  const heap = [[0, start]];
  const push = (d, i) => { heap.push([d, i]); let k = heap.length - 1; while (k) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k;
    if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  let end = -1;
  while (heap.length) {
    const [d, i] = pop(); if (done[i]) continue; done[i] = 1;
    if (goal[i]) { end = i; break; }
    const x = i % W, y = Math.floor(i / W);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= D) continue;
      const j = ny * W + nx; if (blocked[j] || done[j]) continue;
      if (dx && dy && (blocked[y * W + nx] || blocked[ny * W + x])) continue;
      const nd = d + (dx && dy ? Math.SQRT2 : 1);
      if (nd < dist[j]) { dist[j] = nd; prev[j] = i; push(nd, j); }
    }
  }
  if (end < 0) return null;
  const cells = []; for (let i = end; i >= 0; i = prev[i]) cells.push(i); cells.reverse();
  // straighten: keep only the corners needed to stay in open space
  const clearLine = (a, b) => {
    const steps = Math.ceil(Math.hypot(cx(b) - cx(a), cz(b) - cz(a)) / (CELL / 2));
    for (let s = 1; s < steps; s++) {
      const x = cx(a) + (cx(b) - cx(a)) * s / steps, z = cz(a) + (cz(b) - cz(a)) * s / steps;
      if (blocked[Math.floor(z / CELL) * W + Math.floor(x / CELL)]) return false;
    }
    return true;
  };
  const keep = [cells[0]];
  for (let k = 1, a = cells[0]; k < cells.length; k++) {
    if (!clearLine(a, cells[k])) { a = cells[k - 1]; keep.push(a); }
  }
  keep.push(cells[cells.length - 1]);
  return [{ x: door.x, z: door.z }, ...keep.map(i => ({ x: cx(i), z: cz(i) }))];
}

// Evenly spaced arrow positions along a route: [{x, z, angle}], angle = direction of travel (radians, x→z)
export function arrowsAlong(path, spacing = 2.6, skipStart = 1.2, skipEnd = 0.6) {
  if (!path || path.length < 2) return [];
  const segs = []; let total = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], L = Math.hypot(b.x - a.x, b.z - a.z);
    if (L > 0.01) { segs.push({ a, b, L, from: total }); total += L; }
  }
  const out = [];
  for (let s = skipStart; s <= total - skipEnd; s += spacing) {
    const g = segs.find(q => s <= q.from + q.L) || segs[segs.length - 1], t = (s - g.from) / g.L;
    out.push({ x: g.a.x + (g.b.x - g.a.x) * t, z: g.a.z + (g.b.z - g.a.z) * t, angle: Math.atan2(g.b.z - g.a.z, g.b.x - g.a.x), s });
  }
  if (!out.length && total > 0.5) {   // very short walk: one arrow halfway
    const g = segs.find(q => total / 2 <= q.from + q.L), t = (total / 2 - g.from) / g.L;
    out.push({ x: g.a.x + (g.b.x - g.a.x) * t, z: g.a.z + (g.b.z - g.a.z) * t, angle: Math.atan2(g.b.z - g.a.z, g.b.x - g.a.x), s: total / 2 });
  }
  return out;
}
