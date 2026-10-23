// INPUT. Establishes means of communication for TERMINAL via keyboard typing and blocking mouse events.

import * as terminal from "../output/terminal.js";

const capture = document.getElementById("capture");

let handler = null;

// Setup
export function init(onSubmit, { maxLength = 80 } = {}) {
  handler = onSubmit;
  capture.maxLength = maxLength;

  blockMouse();
  bindKeyboard();
}

// Block mouse events except for testing.
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

// Bind keyboard to specific functionality for the terminal.
function bindKeyboard() {
  // TODO: ADD KEYBOARD FUNCTIONALITY.
}
