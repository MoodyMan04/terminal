// COMMANDS. Maps text in commands.json to GAME functions.

import * as terminal from "../output/terminal.js";

let defs = {};
let aliasMap = {};

// Mapping of functions to commands.
const handlers = {
  help() {
    terminal.print("");
    terminal.print("Type a number to choose an option.", "system");
    terminal.print("Commands:", "system");
    terminal.print("");

    const ids = Object.keys(defs);
    const width = Math.max(...ids.map((id) => defs[id].usage.length)) + 2;

    ids.forEach((id) => {
      terminal.print(
        `  ${defs[id].usage.padEnd(width)}${defs[id].description}`,
        "system",
      );
    });
    terminal.print("");
  },

  look({ game }) {
    return game.look();
  },

  clear() {
    terminal.clear();
  },

  code({ args, game }) {
    const entered = args.join(" ").trim();
    if (!entered) {
      terminal.print(`Usage: ${defs.code.usage}`, "error");
      return;
    }
    return game.enterCode(entered);
  },
};

// Setup
export function init(definitions) {
  defs = definitions;
  aliasMap = {};

  for (const [id, def] of Object.entries(defs)) {
    if (!handlers[id]) {
      console.warn(
        `commands.json defines "${id}" but commands.js has no handler for it.`,
      );
    }
    aliasMap[id] = id;
    (def.aliases || []).forEach((alias) => (aliasMap[alias] = id));
  }
}

// Availability of a command.
let currentGame = null;

function isAvailableHere(id) {
  if (!handlers[id]) return false;
  if (defs[id].always) return true;
  return currentGame.allowedCommands().includes(id);
}

// Running a command.
export async function run(parsed, game) {
  const id = aliasMap[parsed.word];

  if (!id || !handlers[id]) {
    terminal.print(
      `Unknown command: ${parsed.word}. Type "help" for options.`,
      "error",
    );
    return;
  }

  currentGame = game;

  if (!isAvailableHere(id)) {
    terminal.print("You can't do that right now.", "error");
    return;
  }

  await handlers[id]({ args: parsed.args, game });
}
