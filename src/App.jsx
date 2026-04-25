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

  /* ================= FIRE ================= */
  function fire() {
    const g = engine().state;
    if (g.projectile || g.winner) return;

    const isPlayer = g.turn === "player";
    const t = g.tanks[isPlayer ? 0 : 1];

    const angle = (g.angle * Math.PI) / 180;

    g.projectile = {
      x: t.x,
      y: t.y - 10,
      vx: Math.cos(angle) * g.power,
      vy: -Math.sin(angle) * g.power,
      trail: [],
    };

    t.recoil = 10;
    g.shake = 10;
  }

  /* ================= RESTART ================= */
  function restartGame() {
    engine().state = initGame();
    engine().aiLock = false;
    engine().aiming = false;
    engine().start = null;
    setWinner(null);
  }

  /* ================= UPDATE ================= */
  function update() {
    const g = engine().state;

    g.shake = Math.max(0, g.shake - 0.3);

    if (g.projectile) {
      const flying = updateProjectile(g, explode);

      if (!flying && !g.projectile && !g.winner) {
        setTimeout(() => {
          g.turn = g.turn === "player" ? "ai" : "player";

          if (g.turn === "ai" && !engine().aiLock) {
            engine().aiLock = true;

            setTimeout(() => {
              aiTurn(g, fire);
              engine().aiLock = false;
            }, 600);
          }
        }, 300);
      }
    }

    if (g.winner && winner !== g.winner) {
      setWinner(g.winner);
    }
  }

  /* ================= INPUT ================= */
  useEffect(() => {
    const canvas = canvasRef.current;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return {
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
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

      g.power = Math.min(20, Math.hypot(dx, dy) * 0.1);
    };

    const end = () => {
      if (!engine().aiming) return;
      engine().aiming = false;
      fire();
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);

    canvas.addEventListener("touchstart", (e) => start(e.touches[0]));
    canvas.addEventListener("touchmove", (e) => move(e.touches[0]));
    canvas.addEventListener("touchend", end);
  }, []);

  /* ================= GAME LOOP ================= */
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

  const g = engine().state;

  const weapons = ["Cannon", "Missile", "Cluster", "Nuke", "Laser"];

  const setDifficulty = (level) => {
    g.difficulty = level;
  };

  return (
    <div style={styles.root}>
      {/* HUD */}
      <div style={styles.hud}>
        <div>Turn: {g.turn}</div>
        <div>Angle: {Math.round(g.angle)}°</div>
        <div>Power: {Math.round(g.power)}</div>
        <div>Wind: {g.wind.toFixed(2)}</div>
      </div>

      {/* DIFFICULTY SELECT */}
      <div style={styles.difficultyBar}>
        {["easy", "medium", "hard"].map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            style={{
              ...styles.diffBtn,
              background: g.difficulty === d ? "#00ff88" : "#222",
            }}
          >
            {d.toUpperCase()}
          </button>
        ))}
      </div>

      {/* RESTART */}
      <button onClick={restartGame} style={styles.restartBtn}>
        Restart 🔄
      </button>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={600}
        style={styles.canvas}
      />

      {/* WEAPONS */}
      <div style={styles.weaponBar}>
        {weapons.map((w, i) => (
          <button
            key={i}
            onClick={() => (g.weapon = i)}
            style={{
              ...styles.weaponBtn,
              background: g.weapon === i ? "#00ff88" : "#222",
            }}
          >
            {w}
          </button>
        ))}
      </div>

      {/* WINNER */}
      {winner && (
        <div style={styles.winner}>🏆 {winner.toUpperCase()} WINS</div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  root: {
    height: "100vh",
    background: "black",
    display: "flex",
    flexDirection: "column",
  },

  hud: {
    display: "flex",
    justifyContent: "space-around",
    color: "white",
    padding: 8,
    background: "#111",
  },

  canvas: {
    flex: 1,
    width: "100%",
    touchAction: "none",
  },

  weaponBar: {
    display: "flex",
    justifyContent: "space-around",
    padding: 10,
    background: "#111",
  },

  weaponBtn: {
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
  },

  restartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: "8px 12px",
    background: "#ff4d4d",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontWeight: "bold",
  },

  difficultyBar: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    padding: 6,
    background: "#0b0b0b",
  },

  diffBtn: {
    border: "none",
    color: "white",
    padding: "5px 10px",
    borderRadius: 6,
  },

  winner: {
    position: "absolute",
    top: "40%",
    width: "100%",
    textAlign: "center",
    fontSize: 32,
    color: "white",
  },
};
