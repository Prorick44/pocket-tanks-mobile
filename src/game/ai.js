import { GRAVITY } from "./constants";

export function aiTurn(g, fire) {
  const ai = g.tanks[1];
  const player = g.tanks[0];

  const difficulty = g.difficulty || "medium";

  let angleStep = difficulty === "easy" ? 8 : difficulty === "hard" ? 2 : 4;

  let best = null;
  let bestError = Infinity;

  for (let angle = 20; angle <= 160; angle += angleStep) {
    for (let power = 5; power <= 20; power++) {
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

        if (dist < bestError) {
          bestError = dist;
          best = { angle, power };
        }
      }
    }
  }

  if (!best) best = { angle: 45, power: 10 };

  const error = difficulty === "easy" ? 25 : difficulty === "medium" ? 10 : 3;

  best.angle += (Math.random() - 0.5) * error;
  best.power += (Math.random() - 0.5) * error * 0.2;

  g.angle = best.angle;
  g.power = best.power;

  setTimeout(fire, 600);
}
