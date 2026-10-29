// LOADER. Collects all data JSONs and validates all.

import { resolveAddress } from "./address.js";

// Fetch specified JSON.
async function fetchJSON(path) {
  let res;
  try {
    res = await fetch(path, { cache: "no-cache" });
  } catch (err) {
    throw new Error(`Could not fetch ${path}: ${err.message}`);
  }

  if (!res.ok) throw new Error(`${path} returned HTTP ${res.status}`);

  try {
    return await res.json();
  } catch (err) {
    throw new Error(`${path} is not valid JSON: ${err.message}`);
  }
}

// Collects all JSONs required on Boot, sorts Scenes and validates them.
export async function loadAll() {
  const [config, commandDefs, codes] = await Promise.all([
    fetchJSON("data/config.json"),
    fetchJSON("data/commands.json"),
    fetchJSON("data/codes.json"),
  ]);

  const scenes = {};
  await Promise.all(
    config.scenes.map(async (id) => {
      scenes[id] = await fetchJSON(`data/scenes/${id}.json`);
    }),
  );

  const problems = validate({ config, commandDefs, codes, scenes });
  return { config, commandDefs, codes, scenes, problems };
}

// Validates JSON paths under several constraints. Returns array of problems found. Default: reported on Boot in MAIN.
function validate({ config, commandDefs, codes, scenes }) {
  const problems = [];
  const add = (msg) => problems.push(msg);

  const checkAddress = (where, label, address, fromFile) => {
    if (!resolveAddress(address, fromFile, scenes)) {
      add(`${where}: ${label} goes to unknown place "${address}".`);
    }
  };

  // Validate address for starting Scene.
  if (!resolveAddress(config.start, null, scenes)) {
    add(
      `config.json: start "${config.start}" is not a valid "folder/file/room" address.`,
    );
  }

  // Validate address for each Scene in Adventure.
  config.scenes.forEach((file) => {
    if (file.startsWith("/") || file.endsWith("/") || file.endsWith(".json")) {
      add(
        `config.json: scenes entry "${file}" should look like "folder/file" (no leading/trailing slash, no .json).`,
      );
    }
  });

  // Validate Scene conventions for each Scene, including Room naming, data inconsistencies, missing text, missing codes, missing choices.
  for (const [file, rooms] of Object.entries(scenes)) {
    const isObject =
      rooms && typeof rooms === "object" && !Array.isArray(rooms);
    if (!isObject || Object.keys(rooms).length === 0) {
      add(`file "${file}": must be an object containing at least one room.`);
      continue;
    }

    for (const [roomId, room] of Object.entries(rooms)) {
      const where = `room "${file}/${roomId}"`;

      if (roomId.includes("/")) add(`${where}: room names can't contain "/".`);

      if (!Array.isArray(room.text) || room.text.length === 0) {
        add(`${where}: "text" must be a non-empty array of strings.`);
      }

      const commands = room.commands || [];
      commands.forEach((cmd) => {
        if (!commandDefs[cmd])
          add(`${where}: unknown command "${cmd}" (not in commands.json).`);
      });

      if (
        commands.includes("look") &&
        (!Array.isArray(room.look) || room.look.length === 0)
      ) {
        add(`${where}: lists the "look" command but has no "look" text.`);
      }

      const hasChoices = Array.isArray(room.choices) && room.choices.length > 0;
      if (room.ending) {
        if (hasChoices) add(`${where}: is an ending but also has choices.`);
      } else if (!hasChoices) {
        add(
          `${where}: has no choices and is not marked "ending": true (dead end).`,
        );
      }

      (room.choices || []).forEach((choice, i) => {
        if (typeof choice.text !== "string" || choice.text === "") {
          add(`${where}: choice ${i + 1} has no "text".`);
        }
        checkAddress(where, `choice ${i + 1}`, choice.goto, file);

        if (choice.transition !== undefined) {
          const t = choice.transition;
          const valid =
            typeof t === "string" ||
            (Array.isArray(t) &&
              t.length > 0 &&
              t.every((line) => typeof line === "string"));
          if (!valid) {
            add(
              `${where}: choice ${i + 1} "transition" must be a string or an array of strings.`,
            );
          }
        }
      });

      (room.gives || []).forEach((item, i) => {
        if (typeof item.code !== "string" || item.code === "") {
          add(`${where}: "gives" entry ${i + 1} has no "code".`);
        } else if (item.code !== item.code.toUpperCase()) {
          add(`${where}: given code "${item.code}" should be UPPERCASE.`);
        } else if (!codes[item.code]) {
          add(
            `${where}: gives code "${item.code}" but codes.json has no entry for it.`,
          );
        }
      });
    }
  }

  // Validate Code conventions, including not all uppercase, address check, and if the Room it leads to is valid.
  for (const [code, entry] of Object.entries(codes)) {
    const where = `codes.json "${code}"`;

    if (code !== code.toUpperCase()) add(`${where}: key must be UPPERCASE.`);
    checkAddress(where, "code", entry.goto, null);

    if (entry.at) {
      if (entry.at.endsWith("/*")) {
        const file = entry.at.slice(0, -2);
        if (!Object.hasOwn(scenes, file))
          add(`${where}: "at" names unknown file "${file}".`);
      } else if (!resolveAddress(entry.at, null, scenes)) {
        add(`${where}: "at" names unknown room "${entry.at}".`);
      }
    }
  }

  return problems;
}
