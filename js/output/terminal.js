// TERMINAL. Handles output rendering to screen.

const outputEl = document.getElementById("output");
const inputLine = document.getElementById("input-line");
const promptEl = document.getElementById("prompt");
const typedEl = document.getElementById("typed");

let typingSpeed = 18;
let typing = false;

// Setup
export function init(options = {}) {
  if (typeof options.typingSpeed === "number")
    typingSpeed = options.typingSpeed;
  if (options.prompt) promptEl.textContent = options.prompt;
}
