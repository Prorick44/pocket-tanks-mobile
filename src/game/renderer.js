import { WEAPONS } from "./constants";

export function draw(ctx, g) {
  if (!g) return;

  ctx.save();
  ctx.translate(
    (Math.random() - 0.5) * g.shake,
    (Math.random() - 0.5) * g.shake,
  );

  ctx.clearRect(0, 0, 1000, 600);

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 600);
  sky.addColorStop(0, "#020617");
  sky.addColorStop(1, "#1e293b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1000, 600);

  // terrain
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.moveTo(0, 600);
  g.terrain.forEach((h, i) => ctx.lineTo(i, h));
  ctx.lineTo(1000, 600);
  ctx.fill();

  // tanks
  g.tanks.forEach((t, i) => {
    const ground = g.terrain[Math.floor(t.x)];
    if (ground) t.y = ground;

    t.recoil *= 0.85;

    ctx.fillStyle = i === 0 ? "#22c55e" : "#ef4444";
    ctx.fillRect(t.x - 18 - t.recoil, t.y - 12, 36, 12);

    const angle = ((i === 0 ? g.angle : 180 - g.angle) * Math.PI) / 180;

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - 12);
    ctx.lineTo(t.x + Math.cos(angle) * 25, t.y - 12 - Math.sin(angle) * 25);
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.fillRect(t.x - 20, t.y - 25, 40, 5);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(t.x - 20, t.y - 25, (t.health / 100) * 40, 5);
  });

  // projectile
  if (g.projectile) {
    ctx.fillStyle = WEAPONS[g.weapon].color;
    ctx.beginPath();
    ctx.arc(g.projectile.x, g.projectile.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // particles
  g.particles.forEach((p) => {
    ctx.fillStyle = `rgba(255,150,0,${p.life / 40})`;
    ctx.fillRect(p.x, p.y, 3, 3);
    p.life--;
  });

  g.particles = g.particles.filter((p) => p.life > 0);

  ctx.fillStyle = "#fff";
  ctx.fillText(`Turn: ${g.turn}`, 20, 20);

  if (g.winner) {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, 1000, 600);

    ctx.fillStyle = "#fff";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${g.winner} WINS`, 500, 300);
  }

  ctx.restore();
}
