import React, { useRef, useEffect, useState } from "react";
import { WIDTH } from "./game/constants";
import { initGame } from "./game/initGame";
import { aiTurn } from "./game/ai";
import { updateProjectile } from "./game/physics";
import { draw } from "./game/renderer";
import { explode } from "./game/effects";

export default function App() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [winner, setWinner] = useState(null);

  const engineRef = useRef({
    state: initGame(),
    aiLock: false,
    aiming: false,
    start: null,
  });

  const engine = () => engineRef.current;

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
    g.shake = 4;
  }

  function update() {
    const eng = engine();
    const g = eng.state;

    g.shake = Math.max(0, g.shake - 0.2);

    if (g.projectile) {
      const flying = updateProjectile(g, explode);

      if (!flying && !g.projectile && !g.winner) {
        setTimeout(() => {
          g.turn = g.turn === "player" ? "ai" : "player";

          if (g.turn === "ai" && !eng.aiLock) {
            eng.aiLock = true;
            setTimeout(() => {
              aiTurn(g, fire);
              eng.aiLock = false;
            }, 600);
          }
        }, 500);
      }
    }

    if (g.winner && winner !== g.winner) {
      setWinner(g.winner);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return {
        x: (t.clientX - rect.left) * (WIDTH / rect.width),
        y: (t.clientY - rect.top) * (600 / rect.height),
      };
    };

    const start = (e) => {
      if (engine().state.turn !== "player") return;
      engine().aiming = true;
      engine().start = getPos(e);
    };

    const move = (e) => {
      if (!engine().aiming) return;

      const g = engine().state;
      const p = getPos(e);

      const dx = p.x - engine().start.x;
      const dy = engine().start.y - p.y;

      g.angle = Math.max(
        0,
        Math.min(180, (Math.atan2(dy, dx) * 180) / Math.PI),
      );
      g.power = Math.max(2, Math.min(20, Math.hypot(dx, dy) * 0.1));
    };

    const end = () => {
      if (!engine().aiming) return;
      engine().aiming = false;
      fire();
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);

    canvas.addEventListener("touchstart", start);
    canvas.addEventListener("touchmove", move);
    canvas.addEventListener("touchend", end);

    return () => {};
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const loop = () => {
      update();
      draw(ctx, engine().state);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ background: "#000", height: "100vh" }}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={600}
        style={{ width: "100%" }}
      />

      <div style={{ padding: "10px" }}>
        <button onClick={() => (engine().state.weapon = 0)}>Cannon</button>
        <button onClick={() => (engine().state.weapon = 1)}>Missile</button>
        <button onClick={() => (engine().state.weapon = 2)}>Cluster</button>
        <button onClick={() => (engine().state.weapon = 3)}>Nuke</button>
        <button onClick={() => (engine().state.weapon = 4)}>Laser</button>
      </div>

      {winner && (
        <div style={{ color: "#fff", textAlign: "center" }}>{winner} WINS</div>
      )}
    </div>
  );
}
