export function explode(g, x, y) {
  g.particles = g.particles || [];

  const radius = 35;

  // 🌄 terrain destruction
  for (let i = 0; i < g.terrain.length; i++) {
    const dx = i - x;
    if (Math.abs(dx) < radius) {
      g.terrain[i] += (radius - Math.abs(dx)) * 0.6;
    }
  }

  // 💥 particles
  for (let i = 0; i < 45; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6;

    g.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2,
      life: 60,
      color: Math.random() > 0.5 ? "orange" : "yellow",
    });
  }

  g.shake = 12;
}
