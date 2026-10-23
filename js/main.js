// MAIN. Establishes connection across all helper files.

import * as terminal from "./output/terminal.js";
import * as input from "./input/input.js";

// Main function.
async function main() {
  terminal.init({
    typingSpeed: 18,
    prompt: ">",
  });
}

main();
