// ADDRESS. Validates and returns file and room of given address. Returns null if none found.

// Accepted address formats for data:
// {ROOM}: Finds Room in same Scene.
// {FOLDER}/{SCENE}/{ROOM}: Finds Room in specified Scene JSON.

export function resolveAddress(address, fromFile, scenes) {
  if (typeof address !== "string" || address === "") return null;

  const cut = address.lastIndexOf("/");
  const file = cut === -1 ? fromFile : address.slice(0, cut);
  const room = address.slice(cut + 1);

  if (file == null || room === "") return null;
  if (!Object.hasOwn(scenes, file)) return null;
  if (!Object.hasOwn(scenes[file], room)) return null;

  return { file, room };
}
