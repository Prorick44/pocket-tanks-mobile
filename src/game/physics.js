import { explode } from "./effects";

export function updateProjectile(g) {
  const p = g.projectile;
  if (!p) return false;

  p.vy += 0.25;
  p.vx += g.wind * 0.05;

  p.x += p.vx;
  p.y += p.vy;

  // out of bounds
  if (p.x < 0 || p.x >= g.terrain.length) {
    g.projectile = null;
    return false;
  }

  const groundY = g.terrain[Math.floor(p.x)];

  // 💥 hit ground
  if (p.y >= groundY) {
    explode(g, p.x, p.y);
    g.projectile = null;
    return false;
  }

  // 🎯 tank hit
  for (const t of g.tanks) {
    if (Math.hypot(p.x - t.x, p.y - (t.y - 10)) < 18) {
      t.health -= 25;
      explode(g, p.x, p.y);
      g.projectile = null;

      if (t.health <= 0) {
        g.winner = t === g.tanks[0] ? "AI" : "PLAYER";
      }

      return false;
    }
  }

  return true;
}
