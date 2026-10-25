// GAME. Controls print and movement through scenes.

import * as terminal from "../output/terminal.js";
import { parse } from "../input/parser.js";
import * as commands from "../input/commands.js";
import { resolveAddress } from "./address.js";

// Setup
let config = {};
let scenes = {};
let codes = {};
let at = null;
let current = null;

const api = { look, enterCode, allowedCommands };

export function init(data) {
  config = data.config;
  scenes = data.scenes;
  codes = data.codes;
}

// Start the game by entering the first Scene.
export async function start() {
  await moveTo(config.start);
  return !current.ending;
}

// Uses PARSER for deciding type of input. Splits handling input by type. Passed to INPUT.
export async function handleInput(raw) {
  const parsed = parse(raw);

  if (parsed.type === "choice") {
    await choose(parsed.number);
  } else if (parsed.type === "command") {
    await commands.run(parsed, api);
  }

  return !current.ending;
}

// Game function to move between Scenes and Rooms. Uses TERMINAL to print text from data and ends if it has reached an ending.
async function moveTo(address) {
  at = resolveAddress(address, at && at.file, scenes);
  current = scenes[at.file][at.room];

  terminal.print("");
  await terminal.typeLines(current.text);

  if (current.gives && current.gives.length > 0) {
    terminal.print("");
    for (const item of current.gives) {
      const label = item.label ? `${item.label} - ` : "";
      await terminal.type(`[ ${label}CODE: ${item.code} ]`, "code");
    }
    terminal.print("Write this down. You may need it later.", "system");
  }

  if (current.ending) {
    terminal.print("");
    terminal.print("Refresh the page to play again.", "system");
    return;
  }

  printChoices();
}

// If not an ending, uses terminal to print out choices text from Room data.
function printChoices() {
  terminal.print("");
  current.choices.forEach((choice, i) => {
    terminal.print(`${i + 1}. ${choice.text}`, "choice");
  });
}

// Resolves choice inputs, moving to the next room based on input.
async function choose(number) {
  const count = current.choices.length;

  if (number < 1 || number > count) {
    terminal.print(`Choose a number from 1 to ${count}.`, "error");
    return;
  }

  await moveTo(current.choices[number - 1].goto);
}

// Current commands the Room has.
function allowedCommands() {
  return current.commands || [];
}

// Look Command Function: prints "Look" text and choices again.
async function look() {
  terminal.print("");
  await terminal.typeLines(current.look, "system");
  printChoices();
}

// Code Command Function: Checks code and only moves to next Room if Code is correct.
async function enterCode(entered) {
  const entry = codes[entered.toUpperCase()];

  const matchesAt = (restriction) => {
    if (!restriction) return true;
    if (restriction.endsWith("/*")) return restriction.slice(0, -2) === at.file;
    return restriction === `${at.file}/${at.room}`;
  };

  if (!entry || !matchesAt(entry.at)) {
    terminal.print("Code rejected.", "error");
    return;
  }

  if (entry.text) {
    terminal.print("");
    await terminal.typeLines(entry.text);
  }

  await moveTo(entry.goto);
}
