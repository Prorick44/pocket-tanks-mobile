export function generateTerrain() {
  const terrain = [];
  let h = 420;

  for (let i = 0; i < 1000; i++) {
    h += Math.sin(i * 0.01) * 0.8 + (Math.random() - 0.5) * 1.5;
    h = Math.max(320, Math.min(520, h));
    terrain.push(h);
  }

  return terrain;
}
