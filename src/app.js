import {
  BOARD_WIDTH,
  MIN_VISIBLE_ROWS,
  PIECE_ORDER,
  STACK_WARNING_ROW,
  TETROMINOES,
  awardGem,
  chooseWildcard,
  createGame,
  describeDraw,
  drawPiece,
  getMiniMatrix,
  getPlacedCells,
  getShapeBounds,
  highestOccupiedRow,
  moveActivePiece,
  placeActivePiece,
  rotateActivePiece,
  setActivePosition,
  tickTimer,
  updateSettings,
} from "./game-core.js";

const SETTINGS_KEY = "tetparty-settings";
const APP_TEXT = {
  ja: {
    documentTitle: "Tetrosius",
    eyebrow: "パーティーパズル試作",
    objectiveLabel: "目標",
    objectiveTitle: "最初の最下段を消そう",
    objectiveCopyActive: "金色のブロックが最初の最下段です。",
    objectiveCopyDone: "金色の対象ブロックはすべて消えました。",
    eventLogLabel: "イベントログ",
    rows: "{count}段",
    settings: "設定",
    reset: "リセット",
    runStatusLabel: "プレイ状況",
    gems: "ジェム",
    score: "スコア",
    turn: "ターン",
    target: "対象",
    currentDraw: "現在の結果",
    timer: "タイマー",
    turnControls: "操作",
    controlsHint: "盤面で位置を確認してから固定。時間切れでも真下に落ちて固定されます。",
    notes: "メモ",
    noteJoker: "Jokerはジェムを消費し、そのターンは無駄になります。",
    noteJokerWild: "このモードではJokerは出ません。Wildcardが多めに入っています。",
    noteWildcard: "Wildcardは好きなパーツを選んでからタイマーが始まります。",
    noteTimeout: "時間切れになると、操作中のパーツは真下に落ちて固定されます。",
    getGem: "ジェム獲得",
    drawPart: "パーツを引く",
    gameSettings: "ゲーム設定",
    tuneRound: "ラウンド設定",
    close: "閉じる",
    turnTime: "制限時間（秒）",
    initialGaps: "初期盤面の欠け（%）",
    gameMode: "ゲームモード",
    drawModeClassic: "標準（7パーツ + Wild + Joker）",
    drawModeWildSeven: "Wild多め（7パーツ + Wild x7）",
    wildCount: "Wild枚数",
    wildCountValue: "{count}枚",
    showDpad: "方向ボタンを表示",
    score1: "1ライン",
    score2: "2ライン",
    score3: "3ライン",
    score4: "4ライン",
    phaseIdle: "待機",
    phasePlacing: "配置中",
    phaseWildcard: "Wildcard",
    phaseWon: "クリア",
    stageTitleWon: "目標達成",
    stageTitlePlacing: "置き場所を決めよう",
    stageTitleIdle: "到達可能な置き場所のみ",
    metaWon: "盤面クリア。リセットで新しい問題を作れます。",
    metaWildcard: "Wildcard発動中。右の7種類から好きなパーツを選ぶとタイマーが始まります。",
    metaPlacing: "自由に動かしてOK。固定されるのは「配置」を押したときか、時間切れのときだけです。",
    metaIdle: "ジェムを集めて、ガチャでパーツを引きましょう。",
    hintWildcard: "まず好きなパーツを選んでください。選ぶまでタイマーは始まりません。",
    hintIdle: "到達可能な置き場所は水色、ふさがれている場所は赤で表示されます。",
    hintInvalid: "その位置は盤面外か既存ブロックと重なっています。",
    hintUnreachable: "その形は置けますが、上からそこまで到達できません。",
    hintReachable: "上から到達可能な位置です。「配置」で固定できます。",
    noDrawTitle: "まだ引いていません",
    noDrawBody: "ジェムを使ってガチャを回しましょう。",
    turnWasted: "このターンは終了です。",
    wildcardBody: "下の7種類から好きなパーツを選ぶとタイマーが始まります。",
    activeNow: "操作中",
    lastResult: "前回の結果",
    choosePartTitle: "好きなパーツを選ぶ",
    choosePartCopy: "1. 欲しい形をタップ 2. 盤面に出現 3. その後タイマー開始",
    resetConfirm: "現在のプレイをリセットします。スコア、ジェム、盤面は失われます。",
    resetLog: "ゲームをリセットしました。新しい盤面を生成しました。",
    initLog: "プロトタイプを初期化しました。金色の対象ブロックを消しましょう。",
    gemBurst: "ジェム獲得！",
    rotateAria: "回転",
    placeAria: "配置",
    settingsPanelLabel: "設定パネル",
  },
  en: {
    documentTitle: "Tetrosius",
    eyebrow: "Party Puzzle Prototype",
    objectiveLabel: "Objective",
    objectiveTitle: "Clear the original bottom row",
    objectiveCopyActive: "Gold blocks belong to the original bottom row.",
    objectiveCopyDone: "All highlighted target blocks are gone.",
    eventLogLabel: "Event Log",
    rows: "{count} rows",
    settings: "Settings",
    reset: "Reset",
    runStatusLabel: "Run Status",
    gems: "Gems",
    score: "Score",
    turn: "Turn",
    target: "Target",
    currentDraw: "Current Draw",
    timer: "Timer",
    turnControls: "Turn Controls",
    controlsHint: "Preview on the board, then lock with Place. Timeout also locks after falling.",
    notes: "Notes",
    noteJoker: "Joker consumes the gem and wastes the turn.",
    noteJokerWild: "This mode has no Joker. The pool is packed with Wildcards.",
    noteWildcard: "Wildcard lets you choose any part before the timer starts.",
    noteTimeout: "If time runs out, the active part drops straight down and locks in place.",
    getGem: "Get Gems",
    drawPart: "Draw Part",
    gameSettings: "Game Settings",
    tuneRound: "Tune the Round",
    close: "Close",
    turnTime: "Turn Time (seconds)",
    initialGaps: "Initial Stack Gaps (%)",
    gameMode: "Game Mode",
    drawModeClassic: "Standard (7 parts + Wild + Joker)",
    drawModeWildSeven: "Wild Rush (7 parts + Wild x7)",
    wildCount: "Wildcard Count",
    wildCountValue: "{count} cards",
    showDpad: "Show D-pad",
    score1: "1 line",
    score2: "2 lines",
    score3: "3 lines",
    score4: "4 lines",
    phaseIdle: "Idle",
    phasePlacing: "Placing",
    phaseWildcard: "Wildcard",
    phaseWon: "Clear",
    stageTitleWon: "Goal Cleared",
    stageTitlePlacing: "Find a Reachable Slot",
    stageTitleIdle: "Reachable Placement Only",
    metaWon: "The tower is cleared. Reset to generate another puzzle.",
    metaWildcard: "Wildcard draw active. Tap one of the 7 parts in the right panel. The timer starts only after you choose.",
    metaPlacing: "Move or rotate freely. Placement only locks when you press Place or when time runs out.",
    metaIdle: "Get gems, then spend them to draw a part.",
    hintWildcard: "Pick any part first. The board will not start timing until your selection is made.",
    hintIdle: "Reachable placements glow teal. Blocked or sealed placements glow red.",
    hintInvalid: "That position collides with the stack or leaves the board.",
    hintUnreachable: "The pose fits, but no path from the top reaches it.",
    hintReachable: "Placement is reachable from the top. Press Place to lock it in.",
    noDrawTitle: "No draw yet",
    noDrawBody: "Use gems to spin the capsule machine.",
    turnWasted: "Turn wasted.",
    wildcardBody: "Choose any of the 7 parts below. The timer starts after selection.",
    activeNow: "Active now",
    lastResult: "Last result",
    choosePartTitle: "Choose your part",
    choosePartCopy: "1. Tap the shape you want. 2. The part appears on the board. 3. Then the timer starts.",
    resetConfirm: "Reset the current run? Score, gems, and board state will be lost.",
    resetLog: "Game reset. A fresh tower was generated.",
    initLog: "Prototype initialized. Clear the gold target blocks.",
    gemBurst: "Get Gems!",
    rotateAria: "Rotate",
    placeAria: "Place",
    settingsPanelLabel: "Settings panel",
  },
};

const refs = {
  app: document.getElementById("app"),
  boardInner: document.getElementById("board-inner"),
  boardViewport: document.getElementById("board-viewport"),
  boardHeight: document.getElementById("board-height"),
  closeSettingsButton: document.getElementById("close-settings-button"),
  controlsHint: document.getElementById("controls-hint"),
  currentDrawLabel: document.getElementById("current-draw-label"),
  drawModeClassicOption: document.getElementById("draw-mode-classic-option"),
  drawModeLabel: document.getElementById("draw-mode-label"),
  drawModeSetting: document.getElementById("draw-mode-setting"),
  drawModeWildOption: document.getElementById("draw-mode-wild-option"),
  drawButton: document.getElementById("draw-button"),
  drawResultCard: document.getElementById("draw-result-card"),
  dpad: document.getElementById("dpad"),
  eyebrowLabel: document.getElementById("eyebrow-label"),
  eventLog: document.getElementById("event-log"),
  eventLogLabel: document.getElementById("event-log-label"),
  fxLayer: document.getElementById("fx-layer"),
  gemCount: document.getElementById("gem-count"),
  gameSettingsLabel: document.getElementById("game-settings-label"),
  gameSettingsTitle: document.getElementById("game-settings-title"),
  gemsLabel: document.getElementById("gems-label"),
  getGemButton: document.getElementById("get-gem-button"),
  goalMeterFill: document.getElementById("goal-meter-fill"),
  initialGapSetting: document.getElementById("initial-gap-setting"),
  initialGapLabel: document.getElementById("initial-gap-label"),
  initialGapSettingValue: document.getElementById("initial-gap-setting-value"),
  jumpBottomButton: document.getElementById("jump-bottom-button"),
  languageEnButton: document.getElementById("language-en-button"),
  languageJaButton: document.getElementById("language-ja-button"),
  metaStatus: document.getElementById("meta-status"),
  moveDownButton: document.getElementById("move-down-button"),
  moveLeftButton: document.getElementById("move-left-button"),
  moveRightButton: document.getElementById("move-right-button"),
  moveUpButton: document.getElementById("move-up-button"),
  noteJoker: document.getElementById("note-joker"),
  noteTimeout: document.getElementById("note-timeout"),
  noteWildcard: document.getElementById("note-wildcard"),
  notesLabel: document.getElementById("notes-label"),
  objectiveLabel: document.getElementById("objective-label"),
  objectiveCopy: document.getElementById("objective-copy"),
  objectiveTitle: document.getElementById("objective-title"),
  phaseChip: document.getElementById("phase-chip"),
  placeButton: document.getElementById("place-button"),
  placementHint: document.getElementById("placement-hint"),
  resetButton: document.getElementById("reset-button"),
  rotateButton: document.getElementById("rotate-button"),
  runStatusLabel: document.getElementById("run-status-label"),
  score1Label: document.getElementById("score-1-label"),
  scoreCount: document.getElementById("score-count"),
  score2Label: document.getElementById("score-2-label"),
  score3Label: document.getElementById("score-3-label"),
  score4Label: document.getElementById("score-4-label"),
  scoreLabel: document.getElementById("score-label"),
  scrim: document.getElementById("scrim"),
  settingsPanel: document.getElementById("settings-panel"),
  settingsToggle: document.getElementById("settings-toggle"),
  showDpadLabel: document.getElementById("show-dpad-label"),
  showDpadSetting: document.getElementById("show-dpad-setting"),
  stageTitle: document.getElementById("stage-title"),
  targetCount: document.getElementById("target-count"),
  targetLabel: document.getElementById("target-label"),
  targetStatPill: document.getElementById("target-stat-pill"),
  timerBarFill: document.getElementById("timer-bar-fill"),
  timerLabel: document.getElementById("timer-label"),
  timerReadout: document.getElementById("timer-readout"),
  timerSettingLabel: document.getElementById("turn-time-label"),
  timerSetting: document.getElementById("timer-setting"),
  timerSettingValue: document.getElementById("timer-setting-value"),
  toastStack: document.getElementById("toast-stack"),
  turnControlsLabel: document.getElementById("turn-controls-label"),
  turnCount: document.getElementById("turn-count"),
  turnLabel: document.getElementById("turn-label"),
  wildCountField: document.getElementById("wild-count-field"),
  wildCountLabel: document.getElementById("wild-count-label"),
  wildCountSetting: document.getElementById("wild-count-setting"),
  wildCountSettingValue: document.getElementById("wild-count-setting-value"),
  wildcardPicker: document.getElementById("wildcard-picker"),
  settingsPanelClose: document.getElementById("close-settings-button"),
  score1Setting: document.getElementById("score-1-setting"),
  score2Setting: document.getElementById("score-2-setting"),
  score3Setting: document.getElementById("score-3-setting"),
  score4Setting: document.getElementById("score-4-setting"),
};

const ui = {
  clearAnimation: null,
  dragging: false,
  focusActive: false,
  initialBottomSnap: true,
  lastFrame: performance.now(),
  logs: [],
  settingsOpen: false,
  toasts: [],
  effects: {
    gemUntil: 0,
    drawUntil: 0,
    clearUntil: 0,
    jokerUntil: 0,
    timeoutUntil: 0,
    winUntil: 0,
  },
};

function currentLanguage() {
  return state?.settings?.language === "en" ? "en" : "ja";
}

function formatText(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function t(key, values = {}) {
  return formatText(APP_TEXT[currentLanguage()][key], values);
}

function shouldShowTargetStatus() {
  return false;
}

let state = createGame(Math.random, loadSettings());

bindEvents();
syncSettingsInputs();
pushLogs([{ message: t("initLog"), tone: "info" }]);
render();
requestAnimationFrame(loop);

function bindEvents() {
  refs.getGemButton?.addEventListener("click", () => {
    if (isInteractionLocked()) {
      return;
    }
    handleEvents(awardGem(state));
  });
  refs.drawButton?.addEventListener("click", () => {
    if (isInteractionLocked()) {
      return;
    }
    const events = drawPiece(state);
    ui.focusActive = state.phase === "placing";
    handleEvents(events);
  });
  refs.rotateButton?.addEventListener("click", () => {
    if (isInteractionLocked()) {
      return;
    }
    if (rotateActivePiece(state)) {
      ui.focusActive = true;
      render();
    }
  });
  refs.placeButton?.addEventListener("click", () => {
    if (isInteractionLocked()) {
      return;
    }
    handleEvents(placeActivePiece(state));
  });
  refs.moveLeftButton?.addEventListener("click", () => moveAndRender(-1, 0));
  refs.moveRightButton?.addEventListener("click", () => moveAndRender(1, 0));
  refs.moveUpButton?.addEventListener("click", () => moveAndRender(0, 1));
  refs.moveDownButton?.addEventListener("click", () => moveAndRender(0, -1));
  refs.settingsToggle?.addEventListener("click", () => setSettingsOpen(true));
  refs.closeSettingsButton?.addEventListener("click", () => setSettingsOpen(false));
  refs.scrim?.addEventListener("click", () => setSettingsOpen(false));
  refs.languageJaButton?.addEventListener("click", () => setLanguage("ja"));
  refs.languageEnButton?.addEventListener("click", () => setLanguage("en"));
  refs.jumpBottomButton?.addEventListener("click", snapBoardToBottom);
  refs.resetButton?.addEventListener("click", resetGame);
  refs.timerSetting?.addEventListener("input", handleSettingsChange);
  refs.initialGapSetting?.addEventListener("input", handleSettingsChange);
  refs.drawModeSetting?.addEventListener("change", handleSettingsChange);
  refs.wildCountSetting?.addEventListener("input", handleSettingsChange);
  refs.showDpadSetting?.addEventListener("change", handleSettingsChange);
  refs.score1Setting?.addEventListener("change", handleSettingsChange);
  refs.score2Setting?.addEventListener("change", handleSettingsChange);
  refs.score3Setting?.addEventListener("change", handleSettingsChange);
  refs.score4Setting?.addEventListener("change", handleSettingsChange);
  refs.wildcardPicker?.addEventListener("click", onWildcardPickerClick);
  refs.boardInner?.addEventListener("pointerdown", onBoardPointerDown);
  refs.boardInner?.addEventListener("pointermove", onBoardPointerMove);
  window.addEventListener("pointerup", onBoardPointerUp);
  window.addEventListener("keydown", onKeyDown);
}

function moveAndRender(dx, dy) {
  if (isInteractionLocked()) {
    return;
  }
  if (moveActivePiece(state, dx, dy)) {
    ui.focusActive = true;
    render();
  }
}

function setLanguage(language) {
  state.settings.language = language === "en" ? "en" : "ja";
  saveSettings(state.settings);
  render();
}

function handleSettingsChange() {
  const nextSettings = {
    turnSeconds: Number(refs.timerSetting.value),
    initialGapRate: Number(refs.initialGapSetting.value),
    drawMode: refs.drawModeSetting.value,
    wildDrawCount: Number(refs.wildCountSetting.value),
    showDPad: refs.showDpadSetting.checked,
    scoreByLines: {
      1: Number(refs.score1Setting.value),
      2: Number(refs.score2Setting.value),
      3: Number(refs.score3Setting.value),
      4: Number(refs.score4Setting.value),
    },
  };
  updateSettings(state, nextSettings);
  saveSettings(state.settings);
  syncSettingsInputs();
  render();
}

function onBoardPointerDown(event) {
  if (isInteractionLocked() || state.phase !== "placing" || !state.activePiece) {
    return;
  }
  const cell = event.target.closest(".board-cell");
  if (!cell) {
    return;
  }
  ui.dragging = true;
  updatePieceFromCell(cell);
}

function onBoardPointerMove(event) {
  if (isInteractionLocked() || !ui.dragging || state.phase !== "placing" || !state.activePiece) {
    return;
  }
  const cell = event.target.closest(".board-cell");
  if (!cell) {
    return;
  }
  updatePieceFromCell(cell);
}

function onBoardPointerUp() {
  if (!ui.dragging) {
    return;
  }
  ui.dragging = false;
  render();
}

function updatePieceFromCell(cell) {
  const hoverX = Number(cell.dataset.x);
  const hoverY = Number(cell.dataset.row);
  const bounds = getShapeBounds(state.activePiece.kind, state.activePiece.rotation);
  const anchorX = hoverX - Math.floor(bounds.width / 2);
  const anchorY = hoverY - Math.floor(bounds.height / 2);
  setActivePosition(state, anchorX, anchorY);
  render();
}

function onKeyDown(event) {
  if (event.target instanceof HTMLInputElement) {
    return;
  }

  if (isInteractionLocked()) {
    return;
  }

  if (ui.settingsOpen) {
    if (event.key === "Escape") {
      setSettingsOpen(false);
    }
    return;
  }

  const actions = {
    ArrowLeft: () => moveAndRender(-1, 0),
    ArrowRight: () => moveAndRender(1, 0),
    ArrowUp: () => moveAndRender(0, 1),
    ArrowDown: () => moveAndRender(0, -1),
    r: () => rotateAndRender(),
    R: () => rotateAndRender(),
    Enter: () => handleEvents(placeActivePiece(state)),
    " ": () => handleEvents(placeActivePiece(state)),
  };

  const action = actions[event.key];
  if (action) {
    event.preventDefault();
    action();
  }
}

function rotateAndRender() {
  if (rotateActivePiece(state)) {
    ui.focusActive = true;
    render();
  }
}

function resetGame() {
  if (refs.settingsPanel && !refs.settingsPanel.classList.contains("hidden")) {
    setSettingsOpen(false);
  }

  const confirmed = window.confirm(t("resetConfirm"));
  if (!confirmed) {
    return;
  }
  state = createGame(Math.random, state.settings);
  ui.clearAnimation = null;
  ui.logs = [];
  ui.toasts = [];
  ui.focusActive = false;
  ui.initialBottomSnap = true;
  pushLogs([{ message: t("resetLog"), tone: "info" }]);
  render();
}

function onWildcardPickerClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }
  const button = event.target.closest("[data-piece]");
  if (!(button instanceof HTMLElement)) {
    return;
  }
  const piece = button.dataset.piece;
  const events = chooseWildcard(state, piece);
  ui.focusActive = true;
  handleEvents(events);
}

function setSettingsOpen(open) {
  ui.settingsOpen = open;
  refs.settingsPanel.classList.toggle("hidden", !open);
  refs.scrim.classList.toggle("hidden", !open);
  refs.app.classList.toggle("settings-open", open);
}

function loop(now) {
  const delta = now - ui.lastFrame;
  ui.lastFrame = now;

  if (!ui.settingsOpen) {
    const events = tickTimer(state, delta);
    if (events.length > 0) {
      handleEvents(events);
    } else {
      updateAnimation(now);
      render();
    }
  } else {
    updateAnimation(now);
    render();
  }

  requestAnimationFrame(loop);
}

function handleEvents(events, options = {}) {
  if (!events || events.length === 0) {
    render();
    return;
  }

  pushLogs(events);
  triggerEffects(events);
  maybeStartClearAnimation();
  if (!options.skipToastRender) {
    render();
  }
}

function maybeStartClearAnimation() {
  const summary = state.lastPlacementSummary;
  if (!summary) {
    return;
  }
  if (summary.clearedRows.length === 0) {
    state.lastPlacementSummary = null;
    return;
  }

  const shiftByRow = buildShiftByDestinationRow(summary.preClearGrid.length, summary.clearedRows);
  ui.clearAnimation = {
    startedAt: performance.now(),
    blinkDuration: 420,
    slideDuration: 420,
    summary,
    shiftByRow,
  };
  state.lastPlacementSummary = null;
}

function buildShiftByDestinationRow(rowCount, clearedRows) {
  const clearedSet = new Set(clearedRows);
  const shiftByRow = new Map();
  let clearedBelow = 0;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    if (clearedSet.has(rowIndex)) {
      clearedBelow += 1;
      continue;
    }
    if (clearedBelow > 0) {
      shiftByRow.set(rowIndex - clearedBelow, clearedBelow);
    }
  }
  return shiftByRow;
}

function updateAnimation(now) {
  if (!ui.clearAnimation) {
    return;
  }
  const totalDuration = ui.clearAnimation.blinkDuration + ui.clearAnimation.slideDuration;
  if (now - ui.clearAnimation.startedAt >= totalDuration) {
    ui.clearAnimation = null;
  }
}

function isInteractionLocked() {
  return Boolean(ui.clearAnimation);
}

function pushLogs(events) {
  const now = performance.now();
  for (const event of events) {
    ui.logs.unshift({
      id: `${now}-${Math.random()}`,
      message: event.message,
      tone: event.tone,
    });
    ui.toasts.push({
      id: `${now}-${Math.random()}`,
      message: event.message,
      tone: event.tone,
      expiresAt: now + 2400,
    });
  }
  ui.logs = ui.logs.slice(0, 8);
}

function triggerEffects(events) {
  const now = performance.now();
  for (const event of events) {
    if (event.effect === "gem") {
      ui.effects.gemUntil = now + 700;
      playGemCollectAnimation();
    }
    if (event.effect === "draw") {
      ui.effects.drawUntil = now + 900;
    }
    if (event.effect === "clear") {
      ui.effects.clearUntil = now + 900;
    }
    if (event.effect === "joker") {
      ui.effects.jokerUntil = now + 1000;
    }
    if (event.effect === "timeout") {
      ui.effects.timeoutUntil = now + 900;
    }
    if (event.effect === "win") {
      ui.effects.winUntil = now + 1800;
    }
  }
}

function playGemCollectAnimation() {
  const target = refs.gemCount?.closest(".stat-pill") || refs.gemCount;
  if (!refs.fxLayer || !target) {
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.42;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  const burst = document.createElement("div");
  burst.className = "gem-burst";
  burst.style.setProperty("--fly-x", `${targetX - startX}px`);
  burst.style.setProperty("--fly-y", `${targetY - startY}px`);
  burst.innerHTML = `
    <div class="gem-burst__core">
      <div class="gem-burst__halo"></div>
      <div class="gem-burst__gem"></div>
      <div class="gem-burst__spark gem-burst__spark--a"></div>
      <div class="gem-burst__spark gem-burst__spark--b"></div>
      <div class="gem-burst__spark gem-burst__spark--c"></div>
      <div class="gem-burst__spark gem-burst__spark--d"></div>
    </div>
    <div class="gem-burst__text">${t("gemBurst")}</div>
  `;

  refs.fxLayer.appendChild(burst);

  requestAnimationFrame(() => {
    burst.classList.add("gem-burst--show");
    window.setTimeout(() => {
      burst.classList.add("gem-burst--fly");
    }, 520);
  });

  window.setTimeout(() => {
    burst.remove();
  }, 1700);
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function syncSettingsInputs() {
  refs.timerSetting.value = String(state.settings.turnSeconds);
  refs.timerSettingValue.textContent = String(state.settings.turnSeconds);
  refs.initialGapSetting.value = String(state.settings.initialGapRate);
  refs.initialGapSettingValue.textContent = `${state.settings.initialGapRate}%`;
  refs.drawModeSetting.value = state.settings.drawMode;
  refs.wildCountSetting.value = String(state.settings.wildDrawCount);
  refs.wildCountSettingValue.textContent = t("wildCountValue", { count: state.settings.wildDrawCount });
  refs.showDpadSetting.checked = state.settings.showDPad;
  refs.score1Setting.value = String(state.settings.scoreByLines[1]);
  refs.score2Setting.value = String(state.settings.scoreByLines[2]);
  refs.score3Setting.value = String(state.settings.scoreByLines[3]);
  refs.score4Setting.value = String(state.settings.scoreByLines[4]);
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage();
  document.title = t("documentTitle");
  refs.eyebrowLabel.textContent = t("eyebrow");
  refs.objectiveLabel.textContent = t("objectiveLabel");
  refs.objectiveTitle.textContent = t("objectiveTitle");
  refs.eventLogLabel.textContent = t("eventLogLabel");
  refs.settingsToggle.textContent = t("settings");
  refs.resetButton.textContent = t("reset");
  refs.runStatusLabel.textContent = t("runStatusLabel");
  refs.gemsLabel.textContent = t("gems");
  refs.scoreLabel.textContent = t("score");
  refs.turnLabel.textContent = t("turn");
  refs.targetLabel.textContent = t("target");
  refs.currentDrawLabel.textContent = t("currentDraw");
  refs.timerLabel.textContent = t("timer");
  refs.turnControlsLabel.textContent = t("turnControls");
  refs.controlsHint.textContent = t("controlsHint");
  refs.notesLabel.textContent = t("notes");
  refs.noteJoker.textContent = state.settings.drawMode === "wild-seven" ? t("noteJokerWild") : t("noteJoker");
  refs.noteWildcard.textContent = t("noteWildcard");
  refs.noteTimeout.textContent = t("noteTimeout");
  refs.getGemButton.textContent = t("getGem");
  refs.drawButton.textContent = t("drawPart");
  refs.gameSettingsLabel.textContent = t("gameSettings");
  refs.gameSettingsTitle.textContent = t("tuneRound");
  refs.closeSettingsButton.textContent = t("close");
  refs.timerSettingLabel.textContent = t("turnTime");
  refs.initialGapLabel.textContent = t("initialGaps");
  refs.drawModeLabel.textContent = t("gameMode");
  refs.drawModeClassicOption.textContent = t("drawModeClassic");
  refs.drawModeWildOption.textContent = t("drawModeWildSeven");
  refs.wildCountLabel.textContent = t("wildCount");
  refs.wildCountSettingValue.textContent = t("wildCountValue", { count: state.settings.wildDrawCount });
  refs.showDpadLabel.textContent = t("showDpad");
  refs.score1Label.textContent = t("score1");
  refs.score2Label.textContent = t("score2");
  refs.score3Label.textContent = t("score3");
  refs.score4Label.textContent = t("score4");
  refs.rotateButton.setAttribute("aria-label", t("rotateAria"));
  refs.rotateButton.setAttribute("title", t("rotateAria"));
  refs.placeButton.setAttribute("aria-label", t("placeAria"));
  refs.placeButton.setAttribute("title", t("placeAria"));
  refs.settingsPanel.setAttribute("aria-label", t("settingsPanelLabel"));
  refs.languageJaButton.classList.toggle("is-active", currentLanguage() === "ja");
  refs.languageEnButton.classList.toggle("is-active", currentLanguage() === "en");
  refs.wildCountField.classList.toggle("hidden", state.settings.drawMode !== "wild-seven");
  refs.wildCountSetting.disabled = state.settings.drawMode !== "wild-seven";
}

function render() {
  const now = performance.now();
  applyStaticTranslations();
  refs.app.classList.toggle("effect-gem", ui.effects.gemUntil > now);
  refs.app.classList.toggle("effect-draw", ui.effects.drawUntil > now);
  refs.app.classList.toggle("effect-clear", ui.effects.clearUntil > now);
  refs.app.classList.toggle("effect-joker", ui.effects.jokerUntil > now);
  refs.app.classList.toggle("effect-timeout", ui.effects.timeoutUntil > now);
  refs.app.classList.toggle("effect-win", ui.effects.winUntil > now);
  refs.gemCount.textContent = String(state.gems);
  refs.scoreCount.textContent = String(state.score);
  refs.turnCount.textContent = String(state.turn);
  refs.targetCount.textContent = `${state.targetRemaining} / ${state.targetTotal}`;
  refs.targetStatPill.classList.toggle("hidden", !shouldShowTargetStatus());
  refs.phaseChip.textContent = phaseLabel(state.phase);
  refs.boardHeight.textContent = t("rows", { count: Math.max(MIN_VISIBLE_ROWS, state.grid.length) });
  refs.timerReadout.textContent = `${(state.timerMs / 1000).toFixed(1)}s`;
  refs.timerSettingValue.textContent = String(state.settings.turnSeconds);
  refs.initialGapSettingValue.textContent = `${state.settings.initialGapRate}%`;
  refs.dpad.classList.toggle("hidden", !state.settings.showDPad);
  refs.drawButton.disabled = isInteractionLocked() || state.phase !== "idle";
  refs.getGemButton.disabled = isInteractionLocked() || state.phase !== "idle";
  refs.rotateButton.disabled = isInteractionLocked() || state.phase !== "placing";
  refs.placeButton.disabled =
    isInteractionLocked() || state.phase !== "placing" || !state.activePiece?.valid || !state.activePiece?.reachable;
  const progressRatio =
    state.targetTotal > 0 ? (state.targetTotal - state.targetRemaining) / state.targetTotal : 1;
  refs.goalMeterFill.style.width = `${Math.round(progressRatio * 100)}%`;
  refs.timerBarFill.style.width =
    state.phase === "placing"
      ? `${Math.max(0, Math.min(100, (state.timerMs / (state.settings.turnSeconds * 1000)) * 100))}%`
      : "0%";
  if (refs.metaStatus) {
    refs.metaStatus.textContent = getMetaStatus();
  }
  if (refs.stageTitle) {
    refs.stageTitle.textContent =
      state.phase === "won" ? t("stageTitleWon") : state.phase === "placing" ? t("stageTitlePlacing") : t("stageTitleIdle");
  }
  refs.objectiveCopy.textContent =
    state.targetRemaining === 0 ? t("objectiveCopyDone") : t("objectiveCopyActive");
  refs.placementHint.textContent = getPlacementHint();
  renderDrawCard();
  renderWildcardPicker();
  renderBoard();
  renderEventLog();
  renderToasts();
  syncSettingsInputs();

  if (ui.initialBottomSnap) {
    snapBoardToBottom();
    ui.initialBottomSnap = false;
  }
  if (ui.focusActive && state.activePiece) {
    focusActivePiece();
    ui.focusActive = false;
  }
}

function getMetaStatus() {
  if (state.phase === "won") {
    return t("metaWon");
  }
  if (state.phase === "wildcard") {
    return t("metaWildcard");
  }
  if (state.phase === "placing") {
    return t("metaPlacing");
  }
  return t("metaIdle");
}

function getPlacementHint() {
  if (state.phase === "wildcard") {
    return t("hintWildcard");
  }
  if (!state.activePiece || state.phase !== "placing") {
    return t("hintIdle");
  }
  if (!state.activePiece.valid) {
    return t("hintInvalid");
  }
  if (!state.activePiece.reachable) {
    return t("hintUnreachable");
  }
  return t("hintReachable");
}

function renderDrawCard() {
  const draw = state.lastDraw;
  let html = "";

  if (!draw) {
    html = `
      <div class="draw-card__empty">
        <p>${t("noDrawTitle")}</p>
        <span>${t("noDrawBody")}</span>
      </div>
    `;
  } else if (draw === "joker") {
    html = `
      <div class="draw-card__special draw-card__special--joker">
        <strong>Joker</strong>
        <span>${t("turnWasted")}</span>
      </div>
    `;
  } else if (draw === "wildcard") {
    html = `
      <div class="draw-card__special draw-card__special--wild">
        <strong>Wildcard</strong>
        <span>${t("wildcardBody")}</span>
      </div>
    `;
  } else {
    html = `
      <div class="draw-card__piece">
        ${renderMiniPiece(draw, state.activePiece?.rotation ?? 0)}
        <div>
          <strong>${describeDraw(draw, currentLanguage())}</strong>
          <span>${state.phase === "placing" ? t("activeNow") : t("lastResult")}</span>
        </div>
      </div>
    `;
  }

  refs.drawResultCard.innerHTML = html;
}

function renderWildcardPicker() {
  const active = state.phase === "wildcard";
  refs.wildcardPicker.classList.toggle("hidden", !active);
  if (!active) {
    refs.wildcardPicker.innerHTML = "";
    refs.wildcardPicker.dataset.rendered = "false";
    return;
  }

  if (
    refs.wildcardPicker.dataset.rendered === "true" &&
    refs.wildcardPicker.dataset.language === currentLanguage()
  ) {
    return;
  }

  refs.wildcardPicker.innerHTML = `
    <div class="wildcard-picker__header">
      <p class="wildcard-picker__title">${t("choosePartTitle")}</p>
      <p class="wildcard-picker__copy">${t("choosePartCopy")}</p>
    </div>
    <div class="wildcard-grid">
      ${PIECE_ORDER.map(
        (kind) => `
          <button class="wildcard-button" type="button" data-piece="${kind}">
            ${renderMiniPiece(kind, 0)}
            <span>${kind}</span>
          </button>
        `
      ).join("")}
    </div>
  `;
  refs.wildcardPicker.dataset.rendered = "true";
  refs.wildcardPicker.dataset.language = currentLanguage();
}

function renderMiniPiece(kind, rotation) {
  const matrix = getMiniMatrix(kind, rotation);
  const piece = TETROMINOES[kind];
  return `
    <div class="mini-piece" style="--mini-cols:${matrix[0].length}; --piece-color:${piece.color}; --piece-accent:${piece.accent}">
      ${matrix
        .map(
          (row) => `
            <div class="mini-piece__row">
              ${row
                .map(
                  (value) => `
                    <span class="mini-piece__cell ${value ? "mini-piece__cell--filled" : ""}"></span>
                  `
                )
                .join("")}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderBoard() {
  const animationFrame = getBoardAnimationFrame();
  const displayGrid = animationFrame?.grid || state.grid;
  const activeCells = new Map();
  if (!animationFrame && state.activePiece && state.phase === "placing") {
    const definition = TETROMINOES[state.activePiece.kind];
    for (const cell of getPlacedCells(
      state.activePiece.kind,
      state.activePiece.rotation,
      state.activePiece.x,
      state.activePiece.y
    )) {
      activeCells.set(`${cell.x},${cell.y}`, {
        color: definition.color,
        accent: definition.accent,
        valid: state.activePiece.valid && state.activePiece.reachable,
      });
    }
  }

  const activeTop =
    !animationFrame && state.activePiece && state.phase === "placing"
      ? Math.max(...getPlacedCells(state.activePiece.kind, state.activePiece.rotation, state.activePiece.x, state.activePiece.y).map((cell) => cell.y))
      : -1;
  const totalRows = Math.max(
    MIN_VISIBLE_ROWS,
    displayGrid.length,
    activeTop + 4,
    highestOccupiedRow(displayGrid) + 4
  );
  let html = "";
  for (let rowIndex = totalRows - 1; rowIndex >= 0; rowIndex -= 1) {
    const rowClasses = ["board-row"];
    const rowNumber = rowIndex + 1;
    if (rowNumber % 5 === 0) {
      rowClasses.push("board-row--milestone");
    }
    if (rowNumber === STACK_WARNING_ROW) {
      rowClasses.push("board-row--warning");
    }
    if (animationFrame?.clearingRows.has(rowIndex)) {
      rowClasses.push("board-row--clearing");
    }
    html += `<div class="${rowClasses.join(" ")}" data-row-index="${rowIndex}" data-row-number="${rowNumber}">`;
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const cell = displayGrid[rowIndex]?.[x] || null;
      const ghost = activeCells.get(`${x},${rowIndex}`);
      const classes = ["board-cell"];
      const styles = [];
      if (cell) {
        classes.push("board-cell--filled");
        if (cell.isTarget) {
          classes.push("board-cell--target");
        }
        styles.push(`--cell-color:${cell.color}`);
        styles.push(`--cell-accent:${cell.accent}`);
      }
      const slideRows = animationFrame?.shiftByRow?.get(rowIndex) || 0;
      if (slideRows > 0 && cell) {
        classes.push("board-cell--sliding");
        styles.push(`--slide-progress:${animationFrame.slideProgress.toFixed(3)}`);
        styles.push(`--slide-rows:${slideRows}`);
      }
      if (ghost) {
        classes.push(ghost.valid ? "board-cell--ghost-valid" : "board-cell--ghost-invalid");
        styles.push(`--ghost-color:${ghost.color}`);
        styles.push(`--ghost-accent:${ghost.accent}`);
      }
      html += `<button class="${classes.join(" ")}" style="${styles.join(";")}" data-x="${x}" data-row="${rowIndex}" type="button"></button>`;
    }
    html += "</div>";
  }
  refs.boardInner.innerHTML = html;
}

function getBoardAnimationFrame() {
  if (!ui.clearAnimation) {
    return null;
  }

  const { startedAt, blinkDuration, slideDuration, summary, shiftByRow } = ui.clearAnimation;
  const elapsed = performance.now() - startedAt;
  if (elapsed <= blinkDuration) {
    return {
      grid: summary.preClearGrid,
      clearingRows: new Set(summary.clearedRows),
      shiftByRow: new Map(),
      slideProgress: 0,
    };
  }

  const slideElapsed = Math.min(slideDuration, elapsed - blinkDuration);
  return {
    grid: summary.postClearGrid,
    clearingRows: new Set(),
    shiftByRow,
    slideProgress: slideElapsed / slideDuration,
  };
}

function renderEventLog() {
  refs.eventLog.innerHTML = ui.logs
    .map(
      (entry) => `
        <li class="event-log__item event-log__item--${entry.tone}">
          ${entry.message}
        </li>
      `
    )
    .join("");
}

function renderToasts() {
  const now = performance.now();
  ui.toasts = ui.toasts.filter((toast) => toast.expiresAt > now);
  refs.toastStack.innerHTML = ui.toasts
    .map(
      (toast) => `
        <div class="toast toast--${toast.tone}">
          ${toast.message}
        </div>
      `
    )
    .join("");
}

function phaseLabel(phase) {
  return {
    idle: t("phaseIdle"),
    placing: t("phasePlacing"),
    wildcard: t("phaseWildcard"),
    won: t("phaseWon"),
  }[phase] || phase;
}

function focusActivePiece() {
  const placedCells = getPlacedCells(
    state.activePiece.kind,
    state.activePiece.rotation,
    state.activePiece.x,
    state.activePiece.y
  );
  const targetRow = Math.max(...placedCells.map((cell) => cell.y));
  const target = refs.boardInner.querySelector(`[data-row-index="${targetRow}"]`);
  target?.scrollIntoView({ block: "center", behavior: "smooth" });
}

function snapBoardToBottom() {
  refs.boardViewport.scrollTop = refs.boardViewport.scrollHeight;
}
