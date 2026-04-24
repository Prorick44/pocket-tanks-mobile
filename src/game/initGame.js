import { generateTerrain } from "./terrain";

export function initGame() {
  const terrain = generateTerrain();

  return {
    turn: "player",
    tanks: [
      { x: 150, y: terrain[150], health: 100, recoil: 0 },
      { x: 850, y: terrain[850], health: 100, recoil: 0 },
    ],
    terrain,
    projectile: null,
    particles: [],
    angle: 45,
    power: 12,
    weapon: 0,
    wind: Math.random() * 0.2 - 0.1,
    winner: null,
    shake: 0,
  };
}
