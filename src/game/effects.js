import { WEAPONS } from "./constants";

export function explode(game, x, y) {
  const w = WEAPONS[game.weapon];

  for (let i = 0; i < game.terrain.length; i++) {
    const d = Math.abs(i - x);
    if (d < w.radius) {
      game.terrain[i] += (w.radius - d) * 0.6;
    }
  }

  game.tanks.forEach((t) => {
    const d = Math.hypot(t.x - x, t.y - y);
    if (d < w.radius) {
      t.health -= w.damage * (1 - d / w.radius);
    }
  });

  for (let i = 0; i < 35; i++) {
    game.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 40,
    });
  }

  if (w.name === "Nuke") {
    game.tanks.forEach((t) => (t.health -= 20));
  }

  if (w.name === "Laser") {
    game.tanks.forEach((t) => {
      if (Math.abs(t.x - x) < 25) t.health -= w.damage;
    });
  }

  game.shake = 12;
  game.projectile = null;

  if (game.tanks[0].health <= 0) game.winner = "AI";
  if (game.tanks[1].health <= 0) game.winner = "PLAYER";
}
