export function aiTurn(g, fire) {
  const ai = g.tanks[1];
  const player = g.tanks[0];

  const dx = player.x - ai.x;

  const distanceFactor = Math.min(20, Math.abs(dx) * 0.05);

  g.angle = 140 - Math.min(80, Math.abs(dx) * 0.05);
  g.power = Math.min(20, 8 + distanceFactor);

  setTimeout(() => fire(), 600);
}
