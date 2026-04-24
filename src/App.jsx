import React, { useRef, useEffect, useState } from "react";
import { WIDTH } from "./game/constants";
import { initGame } from "./game/initGame";
import { aiTurn } from "./game/ai";
import { updateProjectile } from "./game/physics";
import { draw } from "./game/renderer";

export default function App() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [winner, setWinner] = useState(null);

  const engineRef = useRef({
    state: initGame(),
    aiming: false,
    start: null,
    aiLock: false,
  });

  const engine = () => engineRef.current;

  /* ================= FIRE ================= */
  function fire() {
    const g = engine().state;

    if (g.projectile || g.winner) return;

    const isPlayer = g.turn === "player";
    const t = g.tanks[isPlayer ? 0 : 1];

    const angle = ((isPlayer ? g.angle : 180 - g.angle) * Math.PI) / 180;

    g.projectile = {
      x: t.x,
      y: t.y - 10,
      vx: Math.cos(angle) * g.power,
      vy: -Math.sin(angle) * g.power,
    };

    t.recoil = 6;
    g.shake = 10;
  }

  /* ================= UPDATE ================= */
  function update() {
    const eng = engine();
    const g = eng.state;

    g.shake = Math.max(0, g.shake - 0.3);

    if (g.projectile) {
      const alive = updateProjectile(g);

      // turn switch
      if (!alive && !g.projectile && !g.winner) {
        setTimeout(() => {
          g.turn = g.turn === "player" ? "ai" : "player";

          if (g.turn === "ai" && !eng.aiLock) {
            eng.aiLock = true;

            setTimeout(() => {
              aiTurn(g, fire);
              eng.aiLock = false;
            }, 600);
          }
        }, 400);
      }
    }

    if (g.winner && winner !== g.winner) {
      setWinner(g.winner);
    }
  }

  /* ================= MOBILE INPUT ================= */
  useEffect(() => {
    const canvas = canvasRef.current;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;

      return {
        x: ((t.clientX - rect.left) / rect.width) * WIDTH,
        y: ((t.clientY - rect.top) / rect.height) * 600,
      };
    };

    const start = (e) => {
      e.preventDefault();
      if (engine().state.turn !== "player") return;

      engine().aiming = true;
      engine().start = getPos(e);
    };

    const move = (e) => {
      e.preventDefault();
      if (!engine().aiming) return;

      const g = engine().state;
      const p = getPos(e);

      const dx = p.x - engine().start.x;
      const dy = engine().start.y - p.y;

      g.angle = Math.max(
        0,
        Math.min(180, (Math.atan2(dy, dx) * 180) / Math.PI),
      );

      g.power = Math.max(2, Math.min(20, Math.hypot(dx, dy) * 0.08));
    };

    const end = (e) => {
      e.preventDefault();
      if (!engine().aiming) return;

      engine().aiming = false;
      fire();
    };

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end, { passive: false });

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
  }, []);

  /* ================= GAME LOOP ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = WIDTH * dpr;
      canvas.height = 600 * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      update();

      const g = engine().state;

      ctx.save();

      // shake effect
      const s = g.shake || 0;
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);

      draw(ctx, g);

      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ================= LANDSCAPE LOCK ================= */
  const isPortrait = window.innerHeight > window.innerWidth;

  if (isPortrait) {
    return (
      <div
        style={{
          color: "#fff",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#000",
          textAlign: "center",
        }}
      >
        Rotate your device 🔄 for best experience
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div
      style={{
        background: "#000",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HUD */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 10,
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div>PLAYER ❤️ {engine().state.tanks[0].health}</div>
        <div>WIND 🌬️ {engine().state.wind?.toFixed(2)}</div>
        <div>AI ❤️ {engine().state.tanks[1].health}</div>
      </div>

      {/* GAME */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          flex: 1,
          touchAction: "none",
        }}
      />

      {/* WEAPON BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: 10,
          background: "#111",
        }}
      >
        <button onClick={() => (engine().state.weapon = 0)}>Cannon</button>
        <button onClick={() => (engine().state.weapon = 1)}>Missile</button>
        <button onClick={() => (engine().state.weapon = 2)}>Cluster</button>
        <button onClick={() => (engine().state.weapon = 3)}>Nuke</button>
        <button onClick={() => (engine().state.weapon = 4)}>Laser</button>
      </div>

      {/* WINNER */}
      {winner && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            width: "100%",
            textAlign: "center",
            fontSize: 32,
            color: "#fff",
          }}
        >
          🏆 {winner} WINS
        </div>
      )}
    </div>
  );
}
