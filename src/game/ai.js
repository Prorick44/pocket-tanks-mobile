function simulate(g, angle, power, x, y) {
  let vx = Math.cos(angle) * power;
  let vy = -Math.sin(angle) * power;

  let px = x;
  let py = y;

  for (let i = 0; i < 180; i++) {
    vy += 0.25;
    px += vx;
    py += vy;

    if (px < 0 || px >= 800) return null;

    const ground = g.terrain[Math.floor(px)];
    if (py >= ground) return px;
  }

  return null;
}

export function aiTurn(g, fire) {
  const ai = g.tanks[1];
  const player = g.tanks[0];

  let best = { err: Infinity, angle: 0, power: 0 };

  for (let a = 30; a <= 150; a += 5) {
    for (let p = 6; p <= 18; p++) {
      const rad = (Math.PI * a) / 180;

      const hit = simulate(g, rad, p, ai.x, ai.y - 10);
      if (!hit) continue;

      const err = Math.abs(hit - player.x);

      if (err < best.err) {
        best = { err, angle: a, power: p };
      }
    }
  }

  g.angle = best.angle;
  g.power = best.power;

  setTimeout(() => fire(), 500);
}
