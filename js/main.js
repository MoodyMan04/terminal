// MAIN. Establishes connection across all Helper JS files.

import * as terminal from "./output/terminal.js";
import * as input from "./input/input.js";
import * as commands from "./input/commands.js";
import * as game from "./engine/game.js";
import { loadAll } from "./engine/loader.js";

const ALLOW_START_WITH_PROBLEMS = false;

// Initialize input. Load all JSONs, return any errors. If good, initialize terminal, commands, and the game and begin until ending reached.
async function main() {
  input.init(game.handleInput);

  let data;
  try {
    data = await loadAll();
  } catch (err) {
    terminal.print(`FATAL: ${err.message}`, "error");
    if (location.protocol === "file:") {
      terminal.print(
        "Open this through a local server, not by double-clicking the file.",
        "system",
      );
    }
    return;
  }

  if (data.problems.length > 0) {
    terminal.print(
      `Found ${data.problems.length} problem(s) in the game data:`,
      "error",
    );
    data.problems.forEach((p) => terminal.print(`  - ${p}`, "error"));
    if (!ALLOW_START_WITH_PROBLEMS) return;
    terminal.print("");
  }

  terminal.init({
    typingSpeed: data.config.typingSpeed,
    prompt: data.config.prompt,
  });
  commands.init(data.commandDefs);
  game.init(data);

  await terminal.typeLines(data.config.boot, "system");

  const keepGoing = await game.start();
  if (keepGoing) input.enable();
}

main();
