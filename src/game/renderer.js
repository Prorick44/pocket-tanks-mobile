import { WEAPONS, GRAVITY } from "./constants";

export function draw(ctx, g) {
  if (!g || !g.terrain) return;

  ctx.save();

  ctx.translate(
    (Math.random() - 0.5) * (g.shake || 0),
    (Math.random() - 0.5) * (g.shake || 0),
  );

  ctx.clearRect(0, 0, 1000, 600);

  /* SKY */
  const sky = ctx.createLinearGradient(0, 0, 0, 600);
  sky.addColorStop(0, "#0f172a");
  sky.addColorStop(1, "#020617");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1000, 600);

  /* TERRAIN */
  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.moveTo(0, 600);
  g.terrain.forEach((h, i) => ctx.lineTo(i, h));
  ctx.lineTo(1000, 600);
  ctx.fill();

  /* TANKS */
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

    /* HP */
    ctx.fillStyle = "#000";
    ctx.fillRect(t.x - 20, t.y - 25, 40, 5);
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(t.x - 20, t.y - 25, (t.health / 100) * 40, 5);
  });

  /* TRAJECTORY */
  if (g.turn === "player" && !g.projectile) {
    let x = g.tanks[0].x;
    let y = g.tanks[0].y - 10;

    const angle = (g.angle * Math.PI) / 180;
    let vx = Math.cos(angle) * g.power;
    let vy = -Math.sin(angle) * g.power;

    ctx.fillStyle = "rgba(255,255,255,0.7)";

    for (let i = 0; i < 60; i++) {
      vx += g.wind;
      vy += GRAVITY;

      x += vx;
      y += vy;

      const ix = Math.floor(x);
      if (ix < 0 || ix >= g.terrain.length) break;
      if (y >= g.terrain[ix]) break;

      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* PROJECTILE */
  if (g.projectile) {
    ctx.fillStyle = WEAPONS[g.weapon].color;
    ctx.beginPath();
    ctx.arc(g.projectile.x, g.projectile.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* PARTICLES */
  g.particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);

    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  });

  g.particles = g.particles.filter((p) => p.life > 0);

  /* UI */
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.shadowColor = g.turn === "player" ? "#00ff88" : "#ff4444";
  ctx.shadowBlur = 10;
  ctx.fillText(`TURN: ${g.turn.toUpperCase()}`, 20, 30);

  /* WIN */
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
