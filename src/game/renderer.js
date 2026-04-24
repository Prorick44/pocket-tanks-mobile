function drawTerrain(ctx, terrain) {
  ctx.fillStyle = "#2ecc71";
  ctx.beginPath();

  ctx.moveTo(0, 600);
  for (let i = 0; i < terrain.length; i++) {
    ctx.lineTo(i, terrain[i]);
  }

  ctx.lineTo(800, 600);
  ctx.closePath();
  ctx.fill();
}

function drawParticles(ctx, particles) {
  for (const p of particles || []) {
    ctx.globalAlpha = p.life / 60;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTanks(ctx, tanks) {
  for (const t of tanks) {
    ctx.fillStyle = "#3498db";
    ctx.fillRect(t.x - 10, t.y - 20, 20, 20);
  }
}

function drawProjectile(ctx, p) {
  if (!p) return;

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function draw(ctx, g) {
  ctx.clearRect(0, 0, 800, 600);

  drawTerrain(ctx, g.terrain);
  drawTanks(ctx, g.tanks);
  drawProjectile(ctx, g.projectile);
  drawParticles(ctx, g.particles);
}
