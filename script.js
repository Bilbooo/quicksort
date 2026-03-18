"use strict";

// ── Config ────────────────────────────────────────────────────────────────────
const INITIAL = [100, 20, 10, 80, 60, 50, 7, 30, 40];
const N       = INITIAL.length;

// ── Step generator ────────────────────────────────────────────────────────────
function generateSteps(initial) {
  const steps = [];
  const arr   = [...initial];
  const sorted = new Set();

  function snap(p, r, phase, desc, callStack, opts = {}) {
    steps.push({
      array:     [...arr],
      p, r, phase, desc,
      callStack: [...callStack],
      sorted:    new Set(sorted),
      pivotPos:  opts.pivotPos  ?? -1,
      iPtr:      opts.iPtr      ?? -1,
      jPtr:      opts.jPtr      ?? -1,
      swapping:  opts.swapping  ?? [],
    });
  }

  function partition(p, r, cs) {
    const x = arr[r];
    let i   = p - 1;

    snap(p, r, "PARTITION: init",
      `PARTITION(A, ${p}, ${r})\n` +
      `  x = A[${r}] = ${x}   ← pivot (ultimo elemento del range)\n` +
      `  i = p − 1 = ${i}\n` +
      `  Inizio loop: j scorre da ${p} fino a ${r - 1}`,
      cs, { pivotPos: r, iPtr: -99, jPtr: p });

    for (let j = p; j < r; j++) {
      if (arr[j] <= x) {
        i++;
        const bI = arr[i], bJ = arr[j];
        [arr[i], arr[j]] = [arr[j], arr[i]];

        snap(p, r, "PARTITION: swap",
          `j = ${j}:   A[${j}] = ${bJ}  ≤  x = ${x}   ✓   (va nella zona sinistra)\n` +
          `  i++ → i = ${i}\n` +
          `  SWAP( A[${i}] = ${bI}   ↔   A[${j}] = ${bJ} )\n` +
          `  Risultato:  A[${i}] = ${arr[i]},    A[${j}] = ${arr[j]}`,
          cs, { pivotPos: r, iPtr: i, jPtr: j, swapping: [i, j] });

      } else {
        snap(p, r, "PARTITION: skip",
          `j = ${j}:   A[${j}] = ${arr[j]}  >  x = ${x}   ✗   (va nella zona destra)\n` +
          `  Nessuno swap — j avanza`,
          cs, { pivotPos: r, iPtr: i < 0 ? -99 : i, jPtr: j });
      }
    }

    const bI1 = arr[i + 1], bR = arr[r];
    [arr[i + 1], arr[r]] = [arr[r], arr[i + 1]];
    const q = i + 1;
    sorted.add(q);

    snap(p, r, "PARTITION: done",
      `Fine loop   (j ha raggiunto r = ${r})\n` +
      `  SWAP( A[${q}] = ${bI1}   ↔   A[${r}] = ${bR} )  → posiziona il pivot\n` +
      `  Pivot ${arr[q]} ora in posizione definitiva  A[${q}]  ✓\n` +
      `  PARTITION restituisce  q = ${q}`,
      cs, { pivotPos: q, iPtr: i < 0 ? -99 : i });

    return q;
  }

  function quicksort(p, r, cs) {
    const call  = `QS(${p}, ${r})`;
    const newCS = [...cs, call];

    if (p >= r) {
      if (p === r) sorted.add(p);
      snap(p, r,
        p === r ? "QS: base (1 elem)" : "QS: base (vuoto)",
        `QUICKSORT(A, ${p}, ${r})\n  ` + (
          p === r
            ? `p = r = ${p}  →  un solo elemento A[${p}] = ${arr[p]},  già ordinato  ✓`
            : `p > r  →  sottoarray vuoto,  niente da fare  ✓`
        ),
        newCS);
      return;
    }

    snap(p, r, "QS: chiamata",
      `QUICKSORT(A, ${p}, ${r})\n` +
      `  if (p < r)  →  ${p} < ${r}  ✓\n` +
      `  Chiamo PARTITION(A, ${p}, ${r})`,
      newCS);

    const q = partition(p, r, newCS);

    snap(p, r, "QS: ricorsione sx",
      `q = ${q}  →  A[${q}] = ${arr[q]}  fissato definitivamente  ✓\n` +
      `  Chiamo QUICKSORT(A, ${p}, ${q - 1})  [indici ${p} .. ${q - 1}]` +
      (p > q - 1 ? "  →  sottoarray vuoto" : ""),
      newCS, { pivotPos: q });

    quicksort(p, q - 1, newCS);

    snap(p, r, "QS: ricorsione dx",
      `  Chiamo QUICKSORT(A, ${q + 1}, ${r})  [indici ${q + 1} .. ${r}]` +
      (q + 1 > r ? "  →  sottoarray vuoto" : ""),
      newCS, { pivotPos: q });

    quicksort(q + 1, r, newCS);
  }

  quicksort(0, initial.length - 1, []);
  initial.forEach((_, i) => sorted.add(i));

  snap(0, initial.length - 1, "✅ COMPLETATO",
    `QuickSort completato!\n  Array ordinato: [${arr.join(", ")}]`, []);

  return steps;
}

const STEPS = generateSteps(INITIAL);

// ── Color maps ────────────────────────────────────────────────────────────────
const PHASE_COLOR = {
  "QS: chiamata":        "#3b82f6",
  "QS: base (1 elem)":   "#3fb950",
  "QS: base (vuoto)":    "#3fb950",
  "QS: ricorsione sx":   "#f97316",
  "QS: ricorsione dx":   "#f97316",
  "PARTITION: init":     "#bc8cff",
  "PARTITION: swap":     "#3fb950",
  "PARTITION: skip":     "#8b949e",
  "PARTITION: done":     "#3fb950",
  "✅ COMPLETATO":        "#3fb950",
};

const CELL_STATE_COLORS = {
  sorted:   { bg: "#78350f", text: "#fef3c7", border: "#f59e0b" },
  swapping: { bg: "#4c1d95", text: "#ede9fe", border: "#bc8cff" },
  pivot:    { bg: "#7f1d1d", text: "#fee2e2", border: "#f85149" },
  i:        { bg: "#064e3b", text: "#d1fae5", border: "#3fb950" },
  j:        { bg: "#78350f", text: "#fef9e7", border: "#f59e0b" },
  active:   { bg: "#1e3a5f", text: "#bfdbfe", border: "#1f6feb" },
  inactive: { bg: "#1c2128", text: "#3d4451", border: "#21262d" },
};

const LEGEND_DEFS = [
  ["active",   "Range [p..r]"],
  ["pivot",    "Pivot  x"],
  ["i",        "Puntatore  i"],
  ["j",        "Puntatore  j"],
  ["swapping", "Swap  ↔"],
  ["sorted",   "Ordinato  ✓"],
  ["inactive", "Fuori range"],
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getCellState(idx, step) {
  const { p, r, pivotPos, iPtr, jPtr, swapping, sorted } = step;
  if (sorted.has(idx))                       return "sorted";
  if (swapping.includes(idx))                return "swapping";
  if (idx === pivotPos && pivotPos >= 0)     return "pivot";
  if (idx === iPtr     && iPtr     >= 0)     return "i";
  if (idx === jPtr     && jPtr     >= 0)     return "j";
  if (idx >= p && idx <= r && p <= r)        return "active";
  return "inactive";
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const elHeaderSub  = $("header-sub");
const elFill       = $("progress-fill");
const elPtrLabels  = $("ptr-labels");
const elCells      = $("cells");
const elRangeBar   = $("range-bar");
const elLegend     = $("legend");
const elInfoBar    = $("info-bar");
const elDescCard   = $("desc-card");
const elPhaseBadge = $("phase-badge");
const elDescText   = $("desc-text");
const elCallStack  = $("call-stack");
const elSortedGrid = $("sorted-grid");
const elSortedCnt  = $("sorted-count");
const elSlider     = $("slider");
const elStepLbl    = $("step-lbl");
const elBtnStart   = $("btn-start");
const elBtnPrev    = $("btn-prev");
const elBtnPlay    = $("btn-play");
const elBtnNext    = $("btn-next");
const elBtnEnd     = $("btn-end");
const elSpeedSel   = $("speed-sel");

// ── State ─────────────────────────────────────────────────────────────────────
let currentIdx = 0;
let playing    = false;
let timer      = null;

// ── Render ────────────────────────────────────────────────────────────────────
function render(idx) {
  currentIdx = idx;
  const step = STEPS[idx];
  const pc   = PHASE_COLOR[step.phase] || "#58a6ff";
  const pct  = idx === 0 ? 0 : (idx / (STEPS.length - 1)) * 100;

  // Header sub
  elHeaderSub.textContent =
    `Array: [${INITIAL.join(", ")}]  ·  ${STEPS.length} passi totali`;

  // Progress
  elFill.style.width      = pct + "%";
  elFill.style.background = pc;

  // ── Pointer label row ──
  elPtrLabels.innerHTML = step.array.map((_, i) => {
    const parts = [];
    if (i === step.p && step.p <= step.r)
      parts.push(`<span style="color:#8b949e">p</span>`);
    if (i === step.r && step.p <= step.r)
      parts.push(`<span style="color:#8b949e">r</span>`);
    if (i === step.iPtr && step.iPtr >= 0)
      parts.push(`<span style="color:#3fb950">i</span>`);
    if (i === step.jPtr && step.jPtr >= 0 && i !== step.iPtr)
      parts.push(`<span style="color:#f59e0b">j</span>`);
    return `<div class="ptr-slot">${parts.join("")}</div>`;
  }).join("");

  // ── Cells ──
  elCells.innerHTML = step.array.map((val, i) => {
    const state = getCellState(i, step);
    const col   = CELL_STATE_COLORS[state];
    return `
      <div class="cell-wrap">
        <div class="cell state-${state}"
             style="background:${col.bg};color:${col.text};border-color:${col.border}">
          ${val}
        </div>
        <div class="cell-idx">[${i}]</div>
      </div>`;
  }).join("");

  // ── Range bar ──
  elRangeBar.innerHTML = step.array.map((_, i) => {
    const active = i >= step.p && i <= step.r && step.p <= step.r;
    return `<div class="range-tick"
                 style="background:${active ? pc + "88" : "transparent"}"></div>`;
  }).join("");

  // ── Legend (static after first render, but rebuild is cheap) ──
  if (!elLegend.children.length) {
    elLegend.innerHTML = LEGEND_DEFS.map(([key, label]) => {
      const col = CELL_STATE_COLORS[key];
      return `
        <div class="leg-item">
          <div class="leg-swatch"
               style="background:${col.bg};border-color:${col.border}"></div>
          ${label}
        </div>`;
    }).join("");
  }

  // ── Info bar ──
  let infoHTML = "";
  if (step.p <= step.r) {
    infoHTML += `<div class="info-tag" style="border-color:#3b82f688;color:#58a6ff">
      <span class="lbl">Range: </span>A[${step.p}..${step.r}]
      <span style="color:#484f58">&nbsp;(${step.r - step.p + 1} elem)</span>
    </div>`;
    if (step.pivotPos >= 0)
      infoHTML += `<div class="info-tag" style="border-color:#f8514944;color:#f85149">
        <span class="lbl">Pivot x: </span>A[${step.pivotPos}] = ${step.array[step.pivotPos]}
      </div>`;
    if (step.iPtr >= 0)
      infoHTML += `<div class="info-tag" style="border-color:#3fb95044;color:#3fb950">
        <span class="lbl">i: </span>${step.iPtr}
      </div>`;
    if (step.jPtr >= 0)
      infoHTML += `<div class="info-tag" style="border-color:#f59e0b44;color:#f59e0b">
        <span class="lbl">j: </span>${step.jPtr}
      </div>`;
  }
  elInfoBar.innerHTML = infoHTML;

  // ── Description card ──
  elDescCard.style.borderLeftColor = pc;
  elPhaseBadge.textContent         = `${step.phase.toUpperCase()}  ·  PASSO ${idx + 1} / ${STEPS.length}`;
  elPhaseBadge.style.background    = pc;
  elDescText.textContent           = step.desc;

  // ── Call stack ──
  if (step.callStack.length === 0) {
    elCallStack.innerHTML = `<div style="color:#3d4451;font-size:13px">— vuoto —</div>`;
  } else {
    elCallStack.innerHTML = step.callStack.map((frame, i) => {
      const isTop = i === step.callStack.length - 1;
      return `<div class="stack-item${isTop ? " active" : ""}"
                   style="margin-left:${i * 10}px">
        ${isTop ? "▶ " : "  "}${frame}
      </div>`;
    }).join("");
  }

  // ── Sorted grid ──
  elSortedGrid.innerHTML = Array.from({ length: N }, (_, i) => {
    const done = step.sorted.has(i);
    return `<div class="sorted-cell ${done ? "done" : "undone"}">
      ${done ? step.array[i] : i}
    </div>`;
  }).join("");
  elSortedCnt.textContent = `${step.sorted.size} / ${N} elementi ordinati`;

  // ── Slider & buttons ──
  elSlider.max   = STEPS.length - 1;
  elSlider.value = idx;
  elSlider.style.accentColor = pc;
  elStepLbl.textContent      = `passo ${idx + 1} / ${STEPS.length}`;

  elBtnPrev.disabled  = idx === 0;
  elBtnNext.disabled  = idx === STEPS.length - 1;
  elBtnStart.disabled = idx === 0;
  elBtnEnd.disabled   = idx === STEPS.length - 1;
}

// ── Playback ──────────────────────────────────────────────────────────────────
function setPlaying(val) {
  playing = val;
  elBtnPlay.textContent = playing ? "⏸ Pausa" : "▶ Play";
  elBtnPlay.className   = "btn play-btn" + (playing ? " playing" : "");

  clearInterval(timer);
  if (playing) {
    const delay = parseInt(elSpeedSel.value, 10);
    timer = setInterval(() => {
      if (currentIdx >= STEPS.length - 1) { setPlaying(false); return; }
      render(currentIdx + 1);
    }, delay);
  }
}

function go(delta) {
  setPlaying(false);
  const next = Math.max(0, Math.min(STEPS.length - 1, currentIdx + delta));
  render(next);
}

// ── Events ────────────────────────────────────────────────────────────────────
elBtnStart.addEventListener("click", () => { setPlaying(false); render(0); });
elBtnEnd  .addEventListener("click", () => { setPlaying(false); render(STEPS.length - 1); });
elBtnPrev .addEventListener("click", () => go(-1));
elBtnNext .addEventListener("click", () => go(+1));
elBtnPlay .addEventListener("click", () => setPlaying(!playing));

elSlider.addEventListener("input", e => {
  setPlaying(false);
  render(parseInt(e.target.value, 10));
});

elSpeedSel.addEventListener("change", () => {
  if (playing) setPlaying(true); // restart timer with new speed
});

document.addEventListener("keydown", e => {
  if (e.target.tagName === "SELECT") return;
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    go(+1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    go(-1);
  } else if (e.key === "p" || e.key === "P") {
    setPlaying(!playing);
  } else if (e.key === "Home") {
    setPlaying(false); render(0);
  } else if (e.key === "End") {
    setPlaying(false); render(STEPS.length - 1);
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
render(0);
