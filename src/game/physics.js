import { GRAVITY } from "./constants";

export function updateProjectile(g, explode) {
  const p = g.projectile;
  if (!p) return false;

  p.vx += g.wind;
  p.vy += GRAVITY;

  p.x += p.vx;
  p.y += p.vy;

  // tank hit
  for (let t of g.tanks) {
    const d = Math.hypot(p.x - t.x, p.y - t.y);
    if (d < 12) {
      explode(g, p.x, p.y);
      g.projectile = null;
      return false;
    }
  }

  // terrain hit
  const ix = Math.floor(p.x);
  if (ix >= 0 && ix < g.terrain.length) {
    if (p.y >= g.terrain[ix]) {
      explode(g, p.x, g.terrain[ix]);
      g.projectile = null;
      return false;
    }
  }

  // out of bounds
  if (p.x < 0 || p.x > g.terrain.length || p.y > 600) {
    g.projectile = null;
    return false;
  }

  return true;
}
