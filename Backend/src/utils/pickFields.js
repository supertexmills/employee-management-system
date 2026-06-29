export function pickFields(body, allowedKeys) {
  return Object.fromEntries(
    allowedKeys
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  );
}
