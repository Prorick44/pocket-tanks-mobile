export function generateTerrain() {
  const terrain = [];
  let h = 400;

  for (let i = 0; i < 1000; i++) {
    h += Math.random() * 4 - 2;
    h = Math.max(320, Math.min(520, h));
    terrain.push(h);
  }

  return terrain;
}
