// LOADER. Fetches JSONs as needed.

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
