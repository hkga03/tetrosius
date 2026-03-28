import test from "node:test";
import assert from "node:assert/strict";

import {
  BOARD_WIDTH,
  MIN_VISIBLE_ROWS,
  STACK_WARNING_ROW,
  awardGem,
  canPlace,
  chooseWildcard,
  countHoles,
  createGame,
  createGameFromGrid,
  drawPiece,
  isPlacementReachable,
  placeActivePiece,
  tickTimer,
  updateSettings,
} from "../src/game-core.js";

function makeEmptyGrid(rows = MIN_VISIBLE_ROWS) {
  return Array.from({ length: rows }, () => Array.from({ length: BOARD_WIDTH }, () => null));
}

function makeCell(kind = "O", isTarget = false) {
  return {
    kind,
    source: "initial",
    isTarget,
    color: "#ffffff",
    accent: "#ffffff",
  };
}

function makeRandom(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

test("createGame builds a valid initial state", () => {
  const game = createGame(makeRandom(42));

  assert.equal(game.width, BOARD_WIDTH);
  assert.equal(game.phase, "idle");
  assert.equal(game.gems, 0);
  assert.equal(game.score, 0);
  assert.ok(game.grid.length >= MIN_VISIBLE_ROWS);
  assert.ok(game.targetTotal > 0);
  assert.equal(game.targetRemaining, game.targetTotal);
  assert.ok(countHoles(game.grid) > 0);
  assert.ok(game.grid[0].filter(Boolean).length < BOARD_WIDTH);
  assert.equal(game.grid.some((row) => row.every(Boolean)), false);
  assert.ok(game.grid[STACK_WARNING_ROW - 1].some(Boolean));
});

test("joker draw spends the gem and ends the turn without an active piece", () => {
  const game = createGameFromGrid(makeEmptyGrid(), { randomFn: () => 0.78 });

  awardGem(game);
  const events = drawPiece(game);

  assert.equal(game.gems, 0);
  assert.equal(game.lastDraw, "joker");
  assert.equal(game.phase, "idle");
  assert.equal(game.activePiece, null);
  assert.equal(events[0].effect, "joker");
});

test("wildcard draw waits for choice and starts placement after selection", () => {
  const game = createGameFromGrid(makeEmptyGrid(), { randomFn: () => 0.95 });

  awardGem(game);
  drawPiece(game);

  assert.equal(game.lastDraw, "wildcard");
  assert.equal(game.phase, "wildcard");
  assert.equal(game.activePiece, null);

  chooseWildcard(game, "T");

  assert.equal(game.phase, "placing");
  assert.equal(game.activePiece.kind, "T");
  assert.equal(game.timerMs, 5000);
});

test("settings clamp timer and apply custom score tables", () => {
  const game = createGameFromGrid(makeEmptyGrid());

  updateSettings(game, {
    turnSeconds: 12,
    initialGapRate: 99,
    drawMode: "wild-seven",
    wildDrawCount: 99,
    showDPad: false,
    scoreByLines: { 1: 130, 4: 1234 },
  });

  assert.equal(game.settings.turnSeconds, 10);
  assert.equal(game.settings.initialGapRate, 45);
  assert.equal(game.settings.drawMode, "wild-seven");
  assert.equal(game.settings.wildDrawCount, 14);
  assert.equal(game.settings.showDPad, false);
  assert.equal(game.settings.scoreByLines[1], 130);
  assert.equal(game.settings.scoreByLines[4], 1234);
});

test("wild-seven draw mode respects the configured wildcard count", () => {
  const withoutWild = createGameFromGrid(makeEmptyGrid(), {
    randomFn: () => 0.95,
    settings: { drawMode: "wild-seven", wildDrawCount: 0 },
  });
  const game = createGameFromGrid(makeEmptyGrid(), {
    randomFn: () => 0.95,
    settings: { drawMode: "wild-seven", wildDrawCount: 1 },
  });

  awardGem(withoutWild);
  drawPiece(withoutWild);
  awardGem(game);
  drawPiece(game);

  assert.equal(withoutWild.settings.wildDrawCount, 0);
  assert.notEqual(withoutWild.lastDraw, "wildcard");
  assert.equal(game.settings.drawMode, "wild-seven");
  assert.equal(game.settings.wildDrawCount, 1);
  assert.equal(game.lastDraw, "wildcard");
  assert.equal(game.phase, "wildcard");
});

test("higher initial gap settings produce a more eroded opening stack", () => {
  const sparse = createGame(makeRandom(7), { initialGapRate: 8 });
  const broken = createGame(makeRandom(7), { initialGapRate: 40 });

  assert.ok(sparse.grid[0].filter(Boolean).length < BOARD_WIDTH);
  assert.ok(broken.grid[0].filter(Boolean).length < BOARD_WIDTH);
  assert.ok(broken.grid[STACK_WARNING_ROW - 1].some(Boolean));
  assert.ok(countHoles(broken.grid) > countHoles(sparse.grid));
});

test("opening stack does not auto-win on the first placement", () => {
  const game = createGame(makeRandom(42));
  game.phase = "placing";
  game.activePiece = {
    kind: "O",
    rotation: 0,
    x: 4,
    y: 24,
    valid: true,
    reachable: true,
  };

  placeActivePiece(game);

  assert.notEqual(game.phase, "won");
  assert.ok(game.targetRemaining > 0);
  assert.deepEqual(game.lastPlacementSummary.clearedRows, []);
});

test("sealed cavities are unreachable but open channels are reachable", () => {
  const sealed = makeEmptyGrid();
  for (let y = 0; y <= 4; y += 1) {
    sealed[y][0] = makeCell();
    sealed[y][4] = makeCell();
  }
  for (let x = 1; x <= 3; x += 1) {
    sealed[0][x] = makeCell();
    sealed[4][x] = makeCell();
  }

  const open = makeEmptyGrid();
  for (let y = 0; y <= 4; y += 1) {
    open[y][0] = makeCell();
    open[y][4] = makeCell();
  }
  for (let x = 1; x <= 3; x += 1) {
    open[0][x] = makeCell();
  }

  assert.equal(canPlace(sealed, "O", 0, 1, 1), true);
  assert.equal(canPlace(open, "O", 0, 1, 1), true);
  assert.equal(isPlacementReachable(sealed, "O", 0, 1, 1), false);
  assert.equal(isPlacementReachable(open, "O", 0, 1, 1), true);
});

test("placing a piece can clear the target row, score points, and win the game", () => {
  const grid = makeEmptyGrid();
  for (let x = 0; x < 8; x += 1) {
    grid[0][x] = makeCell("I", x < 2);
  }

  const game = createGameFromGrid(grid);
  updateSettings(game, { scoreByLines: { 1: 130 } });
  game.phase = "placing";
  game.activePiece = {
    kind: "O",
    rotation: 0,
    x: 8,
    y: 0,
    valid: true,
    reachable: true,
  };

  const events = placeActivePiece(game);

  assert.equal(game.score, 130);
  assert.equal(game.targetRemaining, 0);
  assert.equal(game.phase, "won");
  assert.deepEqual(game.lastPlacementSummary.clearedRows, [0]);
  assert.ok(events.some((event) => event.effect === "clear"));
  assert.ok(events.some((event) => event.effect === "win"));
});

test("manual place drops the active piece to the landing position before locking", () => {
  const grid = makeEmptyGrid();
  for (let x = 0; x < 6; x += 1) {
    grid[0][x] = makeCell("I", false);
  }

  const game = createGameFromGrid(grid);
  game.phase = "placing";
  game.activePiece = {
    kind: "O",
    rotation: 0,
    x: 7,
    y: 9,
    valid: true,
    reachable: true,
  };

  placeActivePiece(game);

  assert.equal(game.phase, "idle");
  assert.equal(game.activePiece, null);
  assert.equal(game.grid[0][7]?.kind, "O");
  assert.equal(game.grid[0][8]?.kind, "O");
  assert.equal(game.lastPlacementSummary.piece.y, 0);
});

test("timeout drops the active piece straight down and locks it", () => {
  const grid = makeEmptyGrid();
  grid[0][0] = makeCell("I", true);
  for (let x = 1; x < 6; x += 1) {
    grid[0][x] = makeCell("I", false);
  }

  const game = createGameFromGrid(grid);
  game.phase = "placing";
  game.timerMs = 10;
  game.activePiece = {
    kind: "O",
    rotation: 0,
    x: 7,
    y: 8,
    valid: true,
    reachable: true,
  };

  const events = tickTimer(game, 20);

  assert.equal(game.phase, "idle");
  assert.equal(game.activePiece, null);
  assert.equal(game.grid[0][7]?.kind, "O");
  assert.equal(game.grid[0][8]?.kind, "O");
  assert.equal(game.lastPlacementSummary.timedOut, true);
  assert.ok(events.some((event) => event.effect === "timeout"));
});
