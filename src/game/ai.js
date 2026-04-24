export function aiTurn(g, fire) {
  const ai = g.tanks[1];
  const player = g.tanks[0];

  const dx = player.x - ai.x;

  g.angle = 45 + Math.random() * 20;
  g.power = Math.min(20, Math.abs(dx) * 0.1 + 6);

  setTimeout(fire, 500);
}
