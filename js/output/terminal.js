// TERMINAL. Handles output rendering to screen.

const outputEl = document.getElementById("output");
const inputLine = document.getElementById("input-line");
const promptEl = document.getElementById("prompt");
const typedEl = document.getElementById("typed");

let typingSpeed = 18;
let typing = false;
let skipRequested = false;

// Setup
export function init(options = {}) {
  if (typeof options.typingSpeed === "number")
    typingSpeed = options.typingSpeed;
  if (options.prompt) promptEl.textContent = options.prompt;
}

// Print a line instantly.
export function print(text = "", className = "") {
  const el = makeLine(className);
  el.textContent = text;
  scrollToBottom();
  return el;
}

// Print several lines instantly.
export function printLines(lines, className = "") {
  lines.forEach((line) => print(line, className));
}

// Type a line to the given typing speed.
export async function type(text, className = "", speed = typingSpeed) {
  if (speed <= 0) return print(text, className);

  const el = makeLine(className);
  typing = true;
  skipRequested = false;

  for (let i = 1; i <= text.length; i++) {
    if (skipRequested) break;
    el.textContent = text.slice(0, i);
    scrollToBottom();
    await sleep(speed);
  }

  el.textContent = text;
  typing = false;
  skipRequested = false;
  scrollToBottom();
  return el;
}

// Type multiple lines to the given typing speed.
export async function typeLines(lines, className = "", speed = typingSpeed) {
  for (const line of lines) {
    await type(line, className, speed);
  }
}

// Echo typed text.
export function echo(text) {
  return print(`${promptEl.textContent} ${text}`, "echo");
}

export function clear() {
  outputEl.innerHTML = "";
  scrollToBottom();
}

// If typing.
export function isTyping() {
  return typing;
}

// Skip current typing to the end.
export function skip() {
  if (!typing) return false;
  skipRequested = true;
  return true;
}

// Input
export function showInput() {
  inputLine.hidden = false;
  scrollToBottom();
}

export function hideInput() {
  inputLine.hidden = true;
}

export function setTyped(text) {
  typedEl.textContent = text;
  scrollToBottom();
}

export function setPrompt(text) {
  promptEl.textContent = text;
}

// Helpers
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function scrollToBottom() {
  window.scrollTo(0, document.documentElement.scrollHeight);
}

function makeLine(className = "") {
  const el = document.createElement("div");
  el.className = className ? `line ${className}` : "line";
  outputEl.appendChild(el);
  return el;
}
