export function updateProjectile(g, explode) {
  const p = g.projectile;
  if (!p) return false;

  p.vx += g.wind;
  p.vy += 0.2;

  p.x += p.vx;
  p.y += p.vy;

  // tank hit
  for (let t of g.tanks) {
    if (Math.hypot(p.x - t.x, p.y - t.y) < 18) {
      explode(g, p.x, p.y);
      return false;
    }
  }

  // terrain hit
  const ix = Math.floor(p.x);
  if (ix >= 0 && ix < g.terrain.length) {
    if (p.y >= g.terrain[ix] && p.vy > 0) {
      explode(g, p.x, g.terrain[ix]);
      return false;
    }
  }

  // out
  if (p.x < 0 || p.x > g.terrain.length || p.y > 600) {
    g.projectile = null;
    return false;
  }

  return true;
}
