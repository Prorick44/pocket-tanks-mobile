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
  const [gameUI, setGameUI] = useState({});

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

    const angle = ((isPlayer ? g.angle : 180 - g.angle) * Math.PI) / 180;

    g.projectile = {
      x: t.x,
      y: t.y - 10,
      vx: Math.cos(angle) * g.power,
      vy: -Math.sin(angle) * g.power,
      trail: [],
    };

    t.recoil = 8;
    g.shake = 8;
  }

  /* ================= UPDATE ================= */
  function update() {
    const eng = engine();
    const g = eng.state;

    g.shake = Math.max(0, g.shake - 0.25);

    if (g.projectile) {
      g.projectile.trail.push({ x: g.projectile.x, y: g.projectile.y });
      if (g.projectile.trail.length > 12) g.projectile.trail.shift();

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
        }, 400);
      }
    }

    setGameUI({
      playerHP: Math.max(0, g.tanks[0].health),
      aiHP: Math.max(0, g.tanks[1].health),
      wind: g.wind,
      weapon: g.weapon,
      turn: g.turn,
    });

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
  }, []);

  /* ================= LOOP ================= */
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const loop = () => {
      update();

      const g = engine().state;

      // screen shake
      ctx.save();
      const shakeX = (Math.random() - 0.5) * g.shake;
      const shakeY = (Math.random() - 0.5) * g.shake;
      ctx.translate(shakeX, shakeY);

      draw(ctx, g);
      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const isPortrait = window.innerHeight > window.innerWidth;

  if (isPortrait) {
    return <div style={styles.rotate}>Rotate your device 🔄</div>;
  }

  const weaponNames = ["Cannon", "Missile", "Cluster", "Nuke", "Laser"];

  return (
    <div style={styles.root}>
      {/* HUD */}
      <div style={styles.hud}>
        <Health label="PLAYER" hp={gameUI.playerHP} color="#00ff88" />
        <div style={styles.centerHUD}>
          <div>🌬️ {gameUI.wind?.toFixed(2)}</div>
          <div style={{ opacity: 0.7 }}>{weaponNames[gameUI.weapon]}</div>
        </div>
        <Health label="AI" hp={gameUI.aiHP} color="#ff4d4d" />
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={600}
        style={styles.canvas}
      />

      {/* WEAPONS */}
      <div style={styles.weaponBar}>
        {weaponNames.map((w, i) => (
          <button
            key={i}
            onClick={() => (engine().state.weapon = i)}
            style={{
              ...styles.weaponBtn,
              background: gameUI.weapon === i ? "#00ff88" : "#222",
              transform: gameUI.weapon === i ? "scale(1.1)" : "scale(1)",
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

/* ================= UI COMPONENT ================= */
function Health({ label, hp, color }) {
  return (
    <div style={{ width: 140 }}>
      <div style={{ fontSize: 12 }}>{label}</div>
      <div style={styles.hpBarBg}>
        <div
          style={{
            ...styles.hpBarFill,
            width: `${hp}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  root: {
    height: "100vh",
    background: "radial-gradient(circle, #111, #000)",
    display: "flex",
    flexDirection: "column",
  },
  hud: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    color: "#fff",
    alignItems: "center",
  },
  centerHUD: {
    textAlign: "center",
    fontSize: 14,
  },
  canvas: {
    width: "100%",
    flex: 1,
    touchAction: "none",
  },
  weaponBar: {
    display: "flex",
    justifyContent: "space-around",
    padding: 10,
    background: "#111",
  },
  weaponBtn: {
    color: "#fff",
    border: "none",
    padding: "8px 10px",
    borderRadius: 6,
    transition: "0.2s",
  },
  hpBarBg: {
    height: 8,
    background: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  hpBarFill: {
    height: "100%",
    transition: "0.3s",
  },
  winner: {
    position: "absolute",
    top: "40%",
    width: "100%",
    textAlign: "center",
    fontSize: 32,
    color: "#fff",
    animation: "pop 0.6s ease-out",
  },
  rotate: {
    color: "#fff",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#000",
  },
};
