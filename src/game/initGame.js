export function initGame() {
  const WIDTH = 800;

  return {
    tanks: [
      { x: 100, y: 0, health: 100 },
      { x: 700, y: 0, health: 100 },
    ],

    terrain: Array.from(
      { length: WIDTH },
      (_, i) => 420 + Math.sin(i * 0.02) * 35,
    ),

    projectile: null,
    particles: [],

    angle: 45,
    power: 10,
    wind: (Math.random() - 0.5) * 0.2,

    turn: "player",
    weapon: 0,

    shake: 0,
    winner: null,
  };
}
