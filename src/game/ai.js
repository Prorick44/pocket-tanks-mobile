import { GRAVITY } from "./constants";

export function aiTurn(g, fire) {
  const ai = g.tanks[1];
  const player = g.tanks[0];

  const difficulty = g.difficulty || "medium";

  let angleStep = 4;
  let powerStep = 1;

  if (difficulty === "easy") angleStep = 8;
  if (difficulty === "hard") angleStep = 2;

  let best = null;
  let bestError = Infinity;

  for (let angle = 20; angle <= 160; angle += angleStep) {
    for (let power = 5; power <= 20; power += powerStep) {
      const rad = (angle * Math.PI) / 180;

      let x = ai.x;
      let y = ai.y - 10;

      let vx = Math.cos(rad) * power;
      let vy = -Math.sin(rad) * power;

      for (let i = 0; i < 80; i++) {
        vx += g.wind;
        vy += GRAVITY;

        x += vx;
        y += vy;

        const ix = Math.floor(x);
        if (ix < 0 || ix >= g.terrain.length) break;
        if (y >= g.terrain[ix]) break;

        const dist = Math.abs(x - player.x);

        if (dist < 10) {
          best = { angle, power };
          bestError = 0;
          break;
        }

        if (dist < bestError) {
          bestError = dist;
          best = { angle, power };
        }
      }

      if (bestError === 0) break;
    }

    if (bestError === 0) break;
  }

  if (!best) best = { angle: 45, power: 10 };

  if (difficulty === "easy") {
    best.angle += (Math.random() - 0.5) * 25;
    best.power += (Math.random() - 0.5) * 4;
  }

  if (difficulty === "medium") {
    best.angle += (Math.random() - 0.5) * 12;
    best.power += (Math.random() - 0.5) * 2;
  }

  g.angle = best.angle;
  g.power = best.power;

  setTimeout(fire, 600);
}
