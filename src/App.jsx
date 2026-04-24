import React, { useRef, useEffect } from "react";
import { WIDTH, WEAPONS } from "./game/constants";
import { initGame } from "./game/initGame";
import { aiTurn } from "./game/ai";
import { updateProjectile } from "./game/physics";
import { draw } from "./game/renderer";

const SCENE = {
  PLAY: "play",
  OVER: "over",
};

export default function App() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const engineRef = useRef({
    state: {
      ...initGame(),
      wind: Math.random() * 0.2 - 0.1,
      particles: [],
      shake: 0,
    },
    scene: SCENE.PLAY,
    aiLock: false,
    touchStart: null,
    lastFireTime: 0,
  });

  const engine = () => engineRef.current;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ================= FIRE ================= */

  function fire() {
    const e = engine();
    const g = e.state;

    if (
      g.projectile ||
      g.winner ||
      g.turn === "locked" ||
      Date.now() - e.lastFireTime < 300
    )
      return;

    e.lastFireTime = Date.now();

    const isPlayer = g.turn === "player";
    const t = g.tanks[isPlayer ? 0 : 1];

    const angle = ((isPlayer ? g.angle : 180 - g.angle) * Math.PI) / 180;

    g.projectile = {
      x: t.x,
      y: t.y - 10,
      vx: Math.cos(angle) * g.power,
      vy: -Math.sin(angle) * g.power,
    };

    g.lastTurn = isPlayer ? "player" : "ai";
    g.turn = "locked";
  }

  /* ================= TURN ================= */

  function nextTurn() {
    const e = engine();
    const g = e.state;

    if (g.winner) return;

    g.wind = Math.random() * 0.3 - 0.15; // 🌪 new wind every turn
    g.turn = g.lastTurn === "player" ? "ai" : "player";

    if (g.turn === "ai" && !e.aiLock) {
      e.aiLock = true;

      setTimeout(() => {
        aiTurn(g, fire);
        e.aiLock = false;
      }, 700);
    }
  }

  /* ================= EXPLOSION ================= */

  function explode(x, y) {
    const e = engine();
    const g = e.state;

    const w = WEAPONS[g.weapon];

    // Damage
    g.tanks.forEach((t) => {
      const d = Math.hypot(t.x - x, t.y - y);
      if (d < w.radius) {
        t.health -= w.damage * (1 - d / w.radius);
      }
    });

    // 💥 particles
    for (let i = 0; i < 25; i++) {
      g.particles.push({
        x,
        y,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * -4,
        life: 30,
      });
    }

    // 🎥 screen shake
    g.shake = 10;

    g.projectile = null;

    if (g.tanks[0].health <= 0) g.winner = "AI";
    if (g.tanks[1].health <= 0) g.winner = "PLAYER";

    if (!g.winner) nextTurn();
    else engine().scene = SCENE.OVER;
  }

  /* ================= HIT ================= */

  function checkDirectHit(g) {
    const p = g.projectile;
    if (!p) return false;

    for (let t of g.tanks) {
      if (
        p.x > t.x - 20 &&
        p.x < t.x + 20 &&
        p.y > t.y - 10 &&
        p.y < t.y + 10
      ) {
        explode(p.x, p.y);
        return true;
      }
    }
    return false;
  }

  /* ================= UPDATE ================= */

  function update() {
    const e = engine();
    const g = e.state;

    if (e.scene !== SCENE.PLAY) return;

    // projectile
    if (g.projectile) {
      g.projectile.vx += g.wind; // 🌪 wind effect

      if (checkDirectHit(g)) return;

      const flying = updateProjectile(g, explode);

      if (!flying && !g.projectile) {
        nextTurn();
      }
    }

    // particles
    g.particles = g.particles.filter((p) => p.life > 0);
    g.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
    });

    // shake decay
    if (g.shake > 0) g.shake--;
  }

  /* ================= TOUCH ================= */

  useEffect(() => {
    const canvas = canvasRef.current;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.touches[0].clientX - rect.left) * (WIDTH / rect.width),
        y: (e.touches[0].clientY - rect.top) * (600 / rect.height),
      };
    };

    const start = (e) => {
      if (engine().state.turn !== "player") return;
      engine().touchStart = getPos(e);
    };

    const move = (e) => {
      const eng = engine();
      const g = eng.state;
      if (!eng.touchStart) return;

      const p = getPos(e);
      const dx = p.x - eng.touchStart.x;
      const dy = eng.touchStart.y - p.y;

      g.angle = clamp((Math.atan2(dy, dx) * 180) / Math.PI, 0, 180);
      g.power = clamp(Math.hypot(dx, dy) * 0.1, 2, 20);
    };

    const end = () => (engine().touchStart = null);

    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchmove", move);
    canvas.addEventListener("touchend", end);

    return () => {
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
    };
  }, []);

  /* ================= LOOP ================= */

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const loop = () => {
      update();

      const g = engine().state;

      // 🎥 apply shake
      if (g.shake > 0) {
        ctx.save();
        ctx.translate(
          Math.random() * g.shake - g.shake / 2,
          Math.random() * g.shake - g.shake / 2,
        );
      }

      draw(ctx, g);

      // draw particles
      ctx.fillStyle = "orange";
      g.particles.forEach((p) => {
        ctx.fillRect(p.x, p.y, 2, 2);
      });

      // reset shake
      if (g.shake > 0) ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ================= UI ================= */

  const g = engine().state;

  return (
    <div
      style={{
        background: "#000",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={600}
        style={{ width: "100%", flex: 1, touchAction: "none" }}
      />

      {/* HUD */}
      <div style={{ color: "#fff", textAlign: "center", padding: "5px" }}>
        Angle: {g.angle.toFixed(0)} | Power: {g.power.toFixed(1)} | Wind:{" "}
        {g.wind.toFixed(2)}
      </div>

      {/* HEALTH */}
      <div style={{ display: "flex" }}>
        <div
          style={{
            flex: 1,
            background: "red",
            height: "10px",
            width: `${g.tanks[0].health}%`,
          }}
        />
        <div
          style={{
            flex: 1,
            background: "blue",
            height: "10px",
            width: `${g.tanks[1].health}%`,
          }}
        />
      </div>

      {/* CONTROLS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px",
          background: "#111",
        }}
      >
        <button
          style={{ background: g.weapon === 0 ? "#0f0" : "#444" }}
          onClick={() => (g.weapon = 0)}
        >
          Cannon
        </button>
        <button
          style={{ background: g.weapon === 1 ? "#0f0" : "#444" }}
          onClick={() => (g.weapon = 1)}
        >
          Missile
        </button>

        <button
          onClick={fire}
          style={{
            fontSize: "18px",
            padding: "10px 20px",
            background: "#ff4444",
            color: "#fff",
          }}
        >
          FIRE 🔥
        </button>

        <button onClick={() => (engineRef.current.state = initGame())}>
          Restart
        </button>
      </div>

      {g.winner && (
        <div
          style={{
            color: "#fff",
            textAlign: "center",
            padding: "10px",
            fontSize: "20px",
          }}
        >
          {g.winner} WINS 🏆
        </div>
      )}
    </div>
  );
}
