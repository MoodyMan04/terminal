// INPUT. Establishes means of communication for TERMINAL via keyboard typing and blocking mouse events.

import * as terminal from "../output/terminal.js";

const capture = document.getElementById("capture");

let handler = null;
let enabled = false;
let history = [];
let historyIndex = 0;
let draft = "";

// Setup
export function init(onSubmit, { maxLength = 80 } = {}) {
  handler = onSubmit;
  capture.maxLength = maxLength;

  blockMouse();
  bindKeyboard();
  keepFocus();
}

// Show the prompt and start accepting typed commands.
export function enable() {
  enabled = true;
  terminal.showInput();
  focus();
}

// Hide the prompt and ignore typing.
export function disable() {
  enabled = false;
  terminal.hideInput();
}

// Block mouse for production.
function blockMouse() {
  const dev = ["localhost", "127.0.0.1"].includes(location.hostname);

  const events = [
    "click",
    "dblclick",
    "mousedown",
    "mouseup",
    "auxclick",
    "selectstart",
    "dragstart",
    "drop",
    "copy",
    "cut",
    ...(dev ? [] : ["contextmenu"]),
  ];
  events.forEach((name) =>
    document.addEventListener(name, (e) => e.preventDefault(), {
      capture: true,
    }),
  );
}

// Select focus.
function focus() {
  capture.focus({ preventScroll: true });
}

function keepFocus() {
  capture.addEventListener("blur", () => setTimeout(focus, 0));
  window.addEventListener("focus", focus);
  document.addEventListener("touchstart", focus, { passive: true });
  focus();
}

// Keyboard functionality for TERMINAL.
function bindKeyboard() {
  capture.addEventListener("keydown", onKeyDown);
  capture.addEventListener("input", onInput);
}

function onKeyDown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey || /^F\d+$/.test(e.key)) return;

  if (terminal.isTyping()) {
    e.preventDefault();
    if (e.key === "Enter" || e.key === " " || e.key === "Escape")
      terminal.skip();
    return;
  }

  if (!enabled) {
    e.preventDefault();
    return;
  }

  switch (e.key) {
    case "Enter":
      e.preventDefault();
      submit();
      break;

    case "ArrowUp":
      e.preventDefault();
      browseHistory(-1);
      break;

    case "ArrowDown":
      e.preventDefault();
      browseHistory(1);
      break;

    case "ArrowLeft":
    case "ArrowRight":
    case "Home":
    case "End":
      e.preventDefault();
      break;

    case "Escape":
      e.preventDefault();
      setText("");
      break;
  }
}

function onInput() {
  if (!enabled) {
    capture.value = "";
    return;
  }
  terminal.setTyped(capture.value);
  historyIndex = history.length;
}

// Text and History.
function setText(text) {
  capture.value = text;
  terminal.setTyped(text);
}

function browseHistory(direction) {
  if (history.length === 0) return;

  if (historyIndex === history.length) draft = capture.value;

  historyIndex = Math.min(
    Math.max(historyIndex + direction, 0),
    history.length,
  );

  setText(historyIndex === history.length ? draft : history[historyIndex]);
}

// Submit input from TERMINAL.
async function submit() {
  const raw = capture.value;

  if (raw.trim() !== "") {
    history.push(raw);
  }
  historyIndex = history.length;
  draft = "";

  setText("");
  terminal.echo(raw);
  disable();

  // The handler may return false to keep the prompt hidden (e.g. game over).
  const keepOpen = handler ? await handler(raw) : true;
  if (keepOpen !== false) enable();
}
