export const BOARD_WIDTH = 10;
export const MIN_VISIBLE_ROWS = 25;
export const STACK_WARNING_ROW = 20;
export const DEFAULT_SETTINGS = Object.freeze({
  turnSeconds: 5,
  initialGapRate: 18,
  language: "ja",
  drawMode: "classic",
  wildDrawCount: 7,
  showDPad: true,
  gemPerPress: 1,
  gachaCost: 1,
  scoreByLines: {
    1: 100,
    2: 300,
    3: 500,
    4: 800,
  },
});

export const PIECE_ORDER = ["I", "O", "T", "S", "Z", "J", "L"];
export const DRAW_POOL = [...PIECE_ORDER, "joker", "wildcard"];

const BASE_LIBRARY = {
  I: {
    size: 4,
    cells: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    color: "#47d8ff",
    accent: "#e1fbff",
    label: "I",
  },
  O: {
    size: 2,
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    color: "#ffcb3b",
    accent: "#fff0af",
    label: "O",
  },
  T: {
    size: 3,
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    color: "#ff6b7f",
    accent: "#ffd0d6",
    label: "T",
  },
  S: {
    size: 3,
    cells: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    color: "#82de67",
    accent: "#ddffd0",
    label: "S",
  },
  Z: {
    size: 3,
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    color: "#ff7f4d",
    accent: "#ffd7c7",
    label: "Z",
  },
  J: {
    size: 3,
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    color: "#4f88ff",
    accent: "#d7e5ff",
    label: "J",
  },
  L: {
    size: 3,
    cells: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    color: "#ff9e33",
    accent: "#ffe0b8",
    label: "L",
  },
};

const ROTATION_KICKS = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [2, 0],
  [-2, 0],
];

export const TETROMINOES = Object.fromEntries(
  Object.entries(BASE_LIBRARY).map(([kind, definition]) => [
    kind,
    {
      ...definition,
      rotations: buildRotations(definition.cells, definition.size),
    },
  ])
);

function buildRotations(cells, size) {
  const rotations = [];
  let current = cells;
  for (let index = 0; index < 4; index += 1) {
    rotations.push(normalizeCells(current));
    current = current.map(([x, y]) => [size - 1 - y, x]);
  }
  return rotations;
}

function normalizeCells(cells) {
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells
    .map(([x, y]) => [x - minX, y - minY])
    .sort((left, right) => {
      if (left[1] !== right[1]) {
        return left[1] - right[1];
      }
      return left[0] - right[0];
    });
}

function emptyRow() {
  return Array.from({ length: BOARD_WIDTH }, () => null);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function randomInt(randomFn, min, max) {
  return min + Math.floor(randomFn() * (max - min + 1));
}

function getLanguage(settings) {
  return settings?.language === "en" ? "en" : "ja";
}

function formatMessage(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

const CORE_TEXT = {
  ja: {
    drawNone: "まだ引いていません",
    joker: "Joker",
    wildcard: "Wildcard",
    partName: "{kind}パーツ",
    boardAlreadyCleared: "すでに盤面はクリア済みです。リセットしてもう一度遊べます。",
    finishCurrentTurn: "ジェムを集める前に、今のターンを終えてください。",
    gemGain: "ジェム +{count}",
    gameCleared: "ゲームはクリア済みです。リセットして新しいプレイを始めてください。",
    drawOnlyWhileIdle: "パーツを引けるのは待機中だけです。",
    notEnoughGems: "パーツを引くためのジェムが足りません。",
    jokerLostTurn: "Joker! ジェムだけ消費して、このターンは終了です。",
    wildcardChoose: "Wildcard! 好きなパーツを選んでください。",
    partReady: "{kind}パーツの準備ができました。タイマー開始。",
    wildcardNotActive: "いまはWildcard選択中ではありません。",
    unknownPartChoice: "不明なパーツです。",
    settingsUpdated: "設定を更新しました。",
    timeoutNoDrop: "時間切れ。自動落下できる位置がありませんでした。",
    timeoutDropped: "時間切れ。{kind}パーツが真下に落ちて固定されました。",
    partPlaced: "{kind}パーツを配置しました。",
    linesCleared: "{count}ライン消去。{points}点獲得。",
    goalCleared: "目標達成！ 最初の最下段が消えました。",
    noActivePart: "配置できるパーツがありません。",
    placementBlocked: "その位置はふさがれているか、上から到達できません。",
    landingInvalid: "選んだ位置から有効な着地点へ落下できませんでした。",
    wildcardSelected: "Wildcardで{kind}パーツを選びました。",
  },
  en: {
    drawNone: "No draw yet",
    joker: "Joker",
    wildcard: "Wildcard",
    partName: "{kind} Part",
    boardAlreadyCleared: "The board is already cleared. Reset to play again.",
    finishCurrentTurn: "Finish the current turn before collecting more gems.",
    gemGain: "Gems +{count}",
    gameCleared: "The game is already clear. Reset to start another run.",
    drawOnlyWhileIdle: "You can only draw while idle.",
    notEnoughGems: "Not enough gems to draw a part.",
    jokerLostTurn: "Joker! The gem is spent and the turn is lost.",
    wildcardChoose: "Wildcard! Choose any part.",
    partReady: "{kind} part ready. The timer has started.",
    wildcardNotActive: "Wildcard selection is not active right now.",
    unknownPartChoice: "Unknown part choice.",
    settingsUpdated: "Settings updated.",
    timeoutNoDrop: "Time up. No valid auto-drop was available.",
    timeoutDropped: "Time up. {kind} part auto-dropped into place.",
    partPlaced: "{kind} part placed.",
    linesCleared: "{count} line{suffix} cleared for {points} points.",
    goalCleared: "Goal cleared! The original bottom row is gone.",
    noActivePart: "There is no active part to place.",
    placementBlocked: "That placement is blocked or cannot be reached from above.",
    landingInvalid: "The selected position could not be dropped into a valid landing spot.",
    wildcardSelected: "{kind} selected from the wildcard draw.",
  },
};

function coreTextFor(settings) {
  return CORE_TEXT[getLanguage(settings)];
}

function coreText(settings, key, values = {}) {
  const language = getLanguage(settings);
  const table = CORE_TEXT[language];
  const withFallback = { ...values };
  if (language === "en" && typeof withFallback.count === "number") {
    withFallback.suffix = withFallback.count > 1 ? "s" : "";
  }
  return formatMessage(table[key], withFallback);
}

function cloneCell(cell) {
  return cell ? { ...cell } : null;
}

export function cloneGrid(grid) {
  return grid.map((row) => row.map(cloneCell));
}

function createCell(kind, source = "player", isTarget = false) {
  const definition = TETROMINOES[kind];
  return {
    kind,
    source,
    isTarget,
    color: definition.color,
    accent: definition.accent,
  };
}

export function getShapeCells(kind, rotation = 0) {
  return TETROMINOES[kind].rotations[((rotation % 4) + 4) % 4];
}

export function getShapeBounds(kind, rotation = 0) {
  const cells = getShapeCells(kind, rotation);
  const width = Math.max(...cells.map(([x]) => x)) + 1;
  const height = Math.max(...cells.map(([, y]) => y)) + 1;
  return { width, height };
}

export function getPlacedCells(kind, rotation, x, y) {
  return getShapeCells(kind, rotation).map(([offsetX, offsetY]) => ({
    x: x + offsetX,
    y: y + offsetY,
  }));
}

export function getMiniMatrix(kind, rotation = 0) {
  const { width, height } = getShapeBounds(kind, rotation);
  const matrix = Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
  for (const [x, y] of getShapeCells(kind, rotation)) {
    matrix[height - 1 - y][x] = 1;
  }
  return matrix;
}

export function highestOccupiedRow(grid) {
  for (let rowIndex = grid.length - 1; rowIndex >= 0; rowIndex -= 1) {
    if (grid[rowIndex].some(Boolean)) {
      return rowIndex;
    }
  }
  return -1;
}

export function countTargetCells(grid) {
  return grid.reduce(
    (total, row) => total + row.reduce((rowTotal, cell) => rowTotal + (cell?.isTarget ? 1 : 0), 0),
    0
  );
}

export function countHoles(grid) {
  let holes = 0;
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    let seenFilled = false;
    for (let y = grid.length - 1; y >= 0; y -= 1) {
      if (grid[y][x]) {
        seenFilled = true;
      } else if (seenFilled) {
        holes += 1;
      }
    }
  }
  return holes;
}

function ensureRows(grid, targetHeight) {
  while (grid.length < targetHeight) {
    grid.push(emptyRow());
  }
}

export function canPlace(grid, kind, rotation, x, y) {
  for (const cell of getPlacedCells(kind, rotation, x, y)) {
    if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y < 0) {
      return false;
    }
    if (cell.y < grid.length && grid[cell.y][cell.x]) {
      return false;
    }
  }
  return true;
}

function writePiece(grid, kind, rotation, x, y, source = "player") {
  const nextGrid = cloneGrid(grid);
  const placedCells = getPlacedCells(kind, rotation, x, y);
  ensureRows(nextGrid, Math.max(...placedCells.map((cell) => cell.y)) + 1);
  for (const cell of placedCells) {
    nextGrid[cell.y][cell.x] = createCell(kind, source, false);
  }
  return nextGrid;
}

function getFilledRows(grid) {
  return grid
    .map((row, index) => (row.every(Boolean) ? index : -1))
    .filter((index) => index >= 0);
}

export function clearFilledRows(grid) {
  const clearedRows = getFilledRows(grid);
  if (clearedRows.length === 0) {
    return {
      grid: trimGrid(grid),
      clearedRows,
    };
  }

  const remainingRows = [];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex += 1) {
    if (!clearedRows.includes(rowIndex)) {
      remainingRows.push(grid[rowIndex].map(cloneCell));
    }
  }

  const highest = highestOccupiedRow(remainingRows);
  const keepRows = Math.max(MIN_VISIBLE_ROWS, highest + 6);
  while (remainingRows.length < keepRows) {
    remainingRows.push(emptyRow());
  }

  return {
    grid: trimGrid(remainingRows),
    clearedRows,
  };
}

export function trimGrid(grid) {
  const nextGrid = cloneGrid(grid);
  const highest = highestOccupiedRow(nextGrid);
  const keepRows = Math.max(MIN_VISIBLE_ROWS, highest + 6);
  while (nextGrid.length < keepRows) {
    nextGrid.push(emptyRow());
  }
  return nextGrid.slice(0, keepRows);
}

function getSpawnY(grid, kind, rotation = 0) {
  const highest = highestOccupiedRow(grid);
  const { height } = getShapeBounds(kind, rotation);
  return Math.max(MIN_VISIBLE_ROWS - height, highest + 4);
}

export function getDropPlacement(grid, kind, rotation, x, preferredY = null) {
  const { width } = getShapeBounds(kind, rotation);
  const clampedX = clamp(x, 0, BOARD_WIDTH - width);
  let y = Math.max(0, preferredY ?? getSpawnY(grid, kind, rotation));

  if (!canPlace(grid, kind, rotation, clampedX, y)) {
    y = getSpawnY(grid, kind, rotation);
    while (!canPlace(grid, kind, rotation, clampedX, y) && y < grid.length + MIN_VISIBLE_ROWS + 8) {
      y += 1;
    }
  }

  if (!canPlace(grid, kind, rotation, clampedX, y)) {
    return null;
  }

  while (y > 0 && canPlace(grid, kind, rotation, clampedX, y - 1)) {
    y -= 1;
  }

  return { x: clampedX, y };
}

function findSpawnX(grid, kind, rotation = 0) {
  const { width } = getShapeBounds(kind, rotation);
  const maxX = BOARD_WIDTH - width;
  const centre = Math.floor(maxX / 2);
  const candidates = Array.from({ length: maxX + 1 }, (_, index) => index).sort(
    (left, right) => Math.abs(left - centre) - Math.abs(right - centre)
  );
  const spawnY = getSpawnY(grid, kind, rotation);
  return candidates.find((x) => canPlace(grid, kind, rotation, x, spawnY)) ?? 0;
}

function pickRandom(state, values) {
  const index = Math.floor(state.randomFn() * values.length);
  return values[clamp(index, 0, values.length - 1)];
}

function getDrawPool(settings) {
  if (settings?.drawMode !== "wild-seven") {
    return DRAW_POOL;
  }
  return [...PIECE_ORDER, ...Array.from({ length: settings.wildDrawCount }, () => "wildcard")];
}

function mergeSettings(current, patch = {}) {
  const merged = {
    ...current,
    ...patch,
    scoreByLines: {
      ...current.scoreByLines,
      ...(patch.scoreByLines || {}),
    },
  };

  merged.turnSeconds = clamp(Math.round(toNumber(merged.turnSeconds, current.turnSeconds)), 3, 10);
  merged.initialGapRate = clamp(
    Math.round(toNumber(merged.initialGapRate, current.initialGapRate)),
    0,
    45
  );
  merged.language = merged.language === "en" ? "en" : "ja";
  merged.drawMode = merged.drawMode === "wild-seven" ? "wild-seven" : "classic";
  merged.wildDrawCount = clamp(
    Math.round(toNumber(merged.wildDrawCount, current.wildDrawCount)),
    0,
    14
  );
  merged.gemPerPress = Math.max(1, Math.round(toNumber(merged.gemPerPress, current.gemPerPress)));
  merged.gachaCost = Math.max(1, Math.round(toNumber(merged.gachaCost, current.gachaCost)));
  merged.showDPad = Boolean(merged.showDPad);

  for (const lineCount of [1, 2, 3, 4]) {
    merged.scoreByLines[lineCount] = Math.max(
      0,
      Math.round(toNumber(merged.scoreByLines[lineCount], current.scoreByLines[lineCount]))
    );
  }

  return merged;
}

function baseState(grid, settings, randomFn) {
  const trimmedGrid = trimGrid(grid);
  const targetRemaining = countTargetCells(trimmedGrid);
  return {
    width: BOARD_WIDTH,
    visibleRows: MIN_VISIBLE_ROWS,
    grid: trimmedGrid,
    gems: 0,
    score: 0,
    turn: 0,
    phase: "idle",
    timerMs: 0,
    lastDraw: null,
    activePiece: null,
    lastPlacementSummary: null,
    randomFn,
    settings,
    targetTotal: targetRemaining,
    targetRemaining,
  };
}

function markBottomRowTargets(grid) {
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (grid[0][x]) {
      grid[0][x].isTarget = true;
    }
  }
  return trimGrid(grid);
}

function createInitialProfile(randomFn) {
  const profile = [];
  let current = randomInt(randomFn, STACK_WARNING_ROW - 3, STACK_WARNING_ROW);

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (x > 0) {
      current = clamp(current + randomInt(randomFn, -2, 2), STACK_WARNING_ROW - 5, STACK_WARNING_ROW);
    }
    profile.push(current);
  }

  if (Math.max(...profile) < STACK_WARNING_ROW) {
    profile[randomInt(randomFn, 0, BOARD_WIDTH - 1)] = STACK_WARNING_ROW;
  }

  return profile;
}

function createInitialGrid(randomFn, settings) {
  const profile = createInitialProfile(randomFn);
  const palette = ["O", "J", "L", "T", "S", "Z", "I"];
  const grid = Array.from({ length: MIN_VISIBLE_ROWS }, emptyRow);
  const gapRate = settings.initialGapRate / 100;

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    const columnHeight = profile[x];
    for (let y = 0; y < columnHeight; y += 1) {
      const kind = palette[(x + Math.floor(y / 2)) % palette.length];
      grid[y][x] = createCell(kind, "initial", false);
    }
  }

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    const columnHeight = profile[x];
    for (let y = 1; y < columnHeight - 1; y += 1) {
      if (randomFn() < gapRate) {
        grid[y][x] = null;
      }
    }
  }

  const highest = highestOccupiedRow(grid);
  for (let y = 1; y <= highest; y += 1) {
    if (grid[y].every(Boolean)) {
      const removableColumns = profile
        .map((height, x) => (height >= y + 2 ? x : -1))
        .filter((x) => x >= 0);
      if (removableColumns.length > 0) {
        const x = removableColumns[randomInt(randomFn, 0, removableColumns.length - 1)];
        grid[y][x] = null;
      }
    }
  }

  const bottomGapCount = clamp(2 + Math.floor(settings.initialGapRate / 15), 2, 4);
  const bottomGapColumns = new Set();
  while (bottomGapColumns.size < bottomGapCount) {
    bottomGapColumns.add(randomInt(randomFn, 0, BOARD_WIDTH - 1));
  }
  for (const x of bottomGapColumns) {
    grid[0][x] = null;
  }

  return markBottomRowTargets(grid);
}

export function createGame(randomFn = Math.random, settingsOverride = {}) {
  const settings = mergeSettings(DEFAULT_SETTINGS, settingsOverride);
  return baseState(createInitialGrid(randomFn, settings), settings, randomFn);
}

export function createGameFromGrid(grid, options = {}) {
  const settings = mergeSettings(DEFAULT_SETTINGS, options.settings || {});
  const game = baseState(grid, settings, options.randomFn || Math.random);
  game.gems = options.gems ?? 0;
  game.score = options.score ?? 0;
  game.turn = options.turn ?? 0;
  game.phase = options.phase || "idle";
  return game;
}

export function describeDraw(draw, language = "ja") {
  const settings = { language };
  if (!draw) {
    return coreText(settings, "drawNone");
  }
  if (draw === "joker") {
    return coreText(settings, "joker");
  }
  if (draw === "wildcard") {
    return coreText(settings, "wildcard");
  }
  return coreText(settings, "partName", { kind: draw });
}

function emit(message, tone = "info", effect = "") {
  return { message, tone, effect };
}

function getRotationOptions(grid, kind, nextRotation, x, y) {
  return ROTATION_KICKS.map(([kickX, kickY]) => ({
    x: x + kickX,
    y: y + kickY,
    rotation: nextRotation,
  })).filter((candidate) => canPlace(grid, kind, candidate.rotation, candidate.x, candidate.y));
}

export function isPlacementReachable(grid, kind, rotation, targetX, targetY) {
  if (!canPlace(grid, kind, rotation, targetX, targetY)) {
    return false;
  }

  const startRotation = 0;
  const spawnY = getSpawnY(grid, kind, startRotation);
  const maxY = Math.max(spawnY + 4, targetY + 6, highestOccupiedRow(grid) + 8, MIN_VISIBLE_ROWS + 4);
  const queue = [];
  const visited = new Set();

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (canPlace(grid, kind, startRotation, x, spawnY)) {
      const key = `${x},${spawnY},${startRotation}`;
      queue.push({ x, y: spawnY, rotation: startRotation });
      visited.add(key);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift();
    if (
      current.x === targetX &&
      current.y === targetY &&
      current.rotation === ((rotation % 4) + 4) % 4
    ) {
      return true;
    }

    const moves = [
      { x: current.x + 1, y: current.y, rotation: current.rotation },
      { x: current.x - 1, y: current.y, rotation: current.rotation },
      { x: current.x, y: current.y + 1, rotation: current.rotation },
      { x: current.x, y: current.y - 1, rotation: current.rotation },
    ];

    for (const move of moves) {
      if (move.y < 0 || move.y > maxY) {
        continue;
      }
      if (!canPlace(grid, kind, move.rotation, move.x, move.y)) {
        continue;
      }
      const key = `${move.x},${move.y},${move.rotation}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(move);
      }
    }

    const clockwise = (current.rotation + 1) % 4;
    const counterClockwise = (current.rotation + 3) % 4;
    for (const candidate of [
      ...getRotationOptions(grid, kind, clockwise, current.x, current.y),
      ...getRotationOptions(grid, kind, counterClockwise, current.x, current.y),
    ]) {
      if (candidate.y < 0 || candidate.y > maxY) {
        continue;
      }
      const key = `${candidate.x},${candidate.y},${candidate.rotation}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(candidate);
      }
    }
  }

  return false;
}

function makeActivePiece(grid, kind, rotation, x, y) {
  const valid = canPlace(grid, kind, rotation, x, y);
  return {
    kind,
    rotation,
    x,
    y,
    valid,
    reachable: valid ? isPlacementReachable(grid, kind, rotation, x, y) : false,
  };
}

function startPlacement(state, kind) {
  const rotation = 0;
  const y = getSpawnY(state.grid, kind, rotation);
  const x = findSpawnX(state.grid, kind, rotation);
  state.phase = "placing";
  state.timerMs = state.settings.turnSeconds * 1000;
  state.activePiece = makeActivePiece(state.grid, kind, rotation, x, y);
}

export function awardGem(state) {
  state.lastPlacementSummary = null;
  if (state.phase === "won") {
    return [emit(coreText(state.settings, "boardAlreadyCleared"), "info")];
  }
  if (state.phase !== "idle") {
    return [emit(coreText(state.settings, "finishCurrentTurn"), "warning")];
  }
  state.gems += state.settings.gemPerPress;
  return [emit(coreText(state.settings, "gemGain", { count: state.settings.gemPerPress }), "success", "gem")];
}

export function drawPiece(state) {
  state.lastPlacementSummary = null;
  if (state.phase === "won") {
    return [emit(coreText(state.settings, "gameCleared"), "info")];
  }
  if (state.phase !== "idle") {
    return [emit(coreText(state.settings, "drawOnlyWhileIdle"), "warning")];
  }
  if (state.gems < state.settings.gachaCost) {
    return [emit(coreText(state.settings, "notEnoughGems"), "warning")];
  }

  state.gems -= state.settings.gachaCost;
  state.turn += 1;
  const draw = pickRandom(state, getDrawPool(state.settings));
  state.lastDraw = draw;

  if (draw === "joker") {
    state.activePiece = null;
    state.timerMs = 0;
    return [emit(coreText(state.settings, "jokerLostTurn"), "danger", "joker")];
  }

  if (draw === "wildcard") {
    state.phase = "wildcard";
    state.activePiece = null;
    state.timerMs = 0;
    return [emit(coreText(state.settings, "wildcardChoose"), "success", "draw")];
  }

  startPlacement(state, draw);
  return [emit(coreText(state.settings, "partReady", { kind: draw }), "success", "draw")];
}

export function chooseWildcard(state, kind) {
  state.lastPlacementSummary = null;
  if (state.phase !== "wildcard") {
    return [emit(coreText(state.settings, "wildcardNotActive"), "warning")];
  }
  if (!PIECE_ORDER.includes(kind)) {
    return [emit(coreText(state.settings, "unknownPartChoice"), "warning")];
  }

  startPlacement(state, kind);
  return [emit(coreText(state.settings, "wildcardSelected", { kind }), "success", "draw")];
}

export function updateSettings(state, patch) {
  state.lastPlacementSummary = null;
  state.settings = mergeSettings(state.settings, patch);
  if (state.phase === "placing") {
    state.timerMs = Math.min(state.timerMs, state.settings.turnSeconds * 1000);
  }
  return [emit(coreText(state.settings, "settingsUpdated"), "info")];
}

export function setActivePosition(state, x, y) {
  if (!state.activePiece || state.phase !== "placing") {
    return false;
  }

  state.activePiece = makeActivePiece(
    state.grid,
    state.activePiece.kind,
    state.activePiece.rotation,
    x,
    y
  );
  return true;
}

export function moveActivePiece(state, dx, dy) {
  if (!state.activePiece || state.phase !== "placing") {
    return false;
  }

  const nextX = state.activePiece.x + dx;
  const nextY = state.activePiece.y + dy;
  if (!canPlace(state.grid, state.activePiece.kind, state.activePiece.rotation, nextX, nextY)) {
    return false;
  }

  state.activePiece = {
    ...state.activePiece,
    x: nextX,
    y: nextY,
    valid: true,
    reachable: true,
  };
  return true;
}

export function rotateActivePiece(state, direction = 1) {
  if (!state.activePiece || state.phase !== "placing") {
    return false;
  }

  const nextRotation = (state.activePiece.rotation + direction + 4) % 4;
  const candidates = getRotationOptions(
    state.grid,
    state.activePiece.kind,
    nextRotation,
    state.activePiece.x,
    state.activePiece.y
  );

  if (candidates.length === 0) {
    return false;
  }

  const choice = candidates[0];
  state.activePiece = {
    ...state.activePiece,
    rotation: choice.rotation,
    x: choice.x,
    y: choice.y,
    valid: true,
    reachable: true,
  };
  return true;
}

export function tickTimer(state, deltaMs) {
  if (state.phase !== "placing" || !state.activePiece) {
    return [];
  }

  state.timerMs = Math.max(0, state.timerMs - deltaMs);
  if (state.timerMs > 0) {
    return [];
  }

  const timedOutPiece = { ...state.activePiece };
  const drop = getDropPlacement(
    state.grid,
    timedOutPiece.kind,
    timedOutPiece.rotation,
    timedOutPiece.x,
    timedOutPiece.y
  );

  if (!drop) {
    state.phase = "idle";
    state.activePiece = null;
    return [emit(coreText(state.settings, "timeoutNoDrop"), "warning", "timeout")];
  }

  timedOutPiece.x = drop.x;
  timedOutPiece.y = drop.y;
  return commitPlacement(state, timedOutPiece, { timedOut: true });
}

function commitPlacement(state, piece, options = {}) {
  const preClearGrid = writePiece(
    state.grid,
    piece.kind,
    piece.rotation,
    piece.x,
    piece.y,
    "player"
  );

  const cleared = clearFilledRows(preClearGrid);
  const nextGrid = cleared.grid;

  const events = [
    options.timedOut
      ? emit(coreText(state.settings, "timeoutDropped", { kind: piece.kind }), "warning", "timeout")
      : emit(coreText(state.settings, "partPlaced", { kind: piece.kind }), "success"),
  ];
  if (cleared.clearedRows.length > 0) {
    const points = state.settings.scoreByLines[cleared.clearedRows.length] ?? 0;
    state.score += points;
    events.push(
      emit(coreText(state.settings, "linesCleared", { count: cleared.clearedRows.length, points }), "success", "clear")
    );
  }

  state.grid = nextGrid;
  state.activePiece = null;
  state.timerMs = 0;
  state.phase = "idle";
  state.targetRemaining = countTargetCells(state.grid);
  state.lastPlacementSummary = {
    timedOut: Boolean(options.timedOut),
    piece: { ...piece },
    preClearGrid: cloneGrid(preClearGrid),
    postClearGrid: cloneGrid(nextGrid),
    clearedRows: [...cleared.clearedRows],
  };

  if (state.targetTotal > 0 && state.targetRemaining === 0) {
    state.phase = "won";
    events.push(emit(coreText(state.settings, "goalCleared"), "success", "win"));
  }

  return events;
}

export function placeActivePiece(state) {
  if (state.phase !== "placing" || !state.activePiece) {
    return [emit(coreText(state.settings, "noActivePart"), "warning")];
  }

  if (!state.activePiece.valid || !state.activePiece.reachable) {
    return [emit(coreText(state.settings, "placementBlocked"), "warning")];
  }

  const dropped = getDropPlacement(
    state.grid,
    state.activePiece.kind,
    state.activePiece.rotation,
    state.activePiece.x,
    state.activePiece.y
  );

  if (!dropped) {
    return [emit(coreText(state.settings, "landingInvalid"), "warning")];
  }

  return commitPlacement(state, {
    ...state.activePiece,
    x: dropped.x,
    y: dropped.y,
  });
}
