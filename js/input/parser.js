// PARSER. Defines raw text from input as a "Choice" or a "Command"

// Can be parsed as:
// { type: "empty', {RAW OBJECT} }
// { type: "choice", number: {NUMBER} }
// { type: "command", word: {COMMAND}, args: [{TEXT AFTER COMMAND}] }

export function parse(raw) {
  const text = raw.trim().replace(/\s+/g, " ");

  if (text === "") {
    return { type: "empty", raw };
  }

  if (/^\d+$/.test(text)) {
    return { type: "choice", number: parseInt(text, 10), raw };
  }

  const [word, ...args] = text.split(" ");
  return { type: "command", word: word.toLowerCase(), args, raw };
}
