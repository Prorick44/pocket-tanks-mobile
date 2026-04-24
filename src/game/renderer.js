import { WEAPONS, GRAVITY } from "./constants";

export function draw(ctx, g) {
  if (!g || !g.terrain) return;

  ctx.save();

  ctx.translate(
    (Math.random() - 0.5) * (g.shake || 0),
    (Math.random() - 0.5) * (g.shake || 0),
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
    if (ground !== undefined) t.y = ground;

    const recoil = t.recoil || 0;

    ctx.fillStyle = i === 0 ? "#22c55e" : "#ef4444";
    ctx.fillRect(t.x - 18 - recoil, t.y - 12, 36, 12);

    const angle = ((i === 0 ? g.angle : 180 - g.angle) * Math.PI) / 180;

    const nx = t.x + Math.cos(angle) * 25;
    const ny = t.y - 12 - Math.sin(angle) * 25;

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - 12);
    ctx.lineTo(nx, ny);
    ctx.stroke();
  });

  // trajectory
  if (g.turn === "player" && !g.projectile) {
    let t = g.tanks[0];
    let x = t.x;
    let y = t.y - 10;

    let vx = Math.cos((g.angle * Math.PI) / 180) * g.power;
    let vy = -Math.sin((g.angle * Math.PI) / 180) * g.power;

    ctx.fillStyle = "rgba(255,255,255,0.4)";

    for (let i = 0; i < 25; i++) {
      vx += g.wind;
      x += vx;
      y += vy;
      vy += GRAVITY;
      ctx.fillRect(x, y, 2, 2);
    }
  }

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
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });

  g.particles = g.particles.filter((p) => p.life > 0);

  // UI
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
