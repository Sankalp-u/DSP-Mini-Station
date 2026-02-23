// client/src/utils/safeRender.js

export function safeRender(value) {
  if (value === null || value === undefined) return "";

  // numbers & strings are safe
  if (typeof value === "string" || typeof value === "number")
    return value;

  // arrays → join safely
  if (Array.isArray(value))
    return value.map(v => safeRender(v)).join(", ");

  // objects → stringify safely
  if (typeof value === "object")
    return JSON.stringify(value, null, 2);

  return String(value);
}