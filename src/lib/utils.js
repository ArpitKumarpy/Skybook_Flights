// Minimal inline-validation helper: given a form object and a list of field
// configs, returns { fieldName: "message" } for any required value that's
// empty. Used to drive per-field error text instead of one global banner.
export function validateRequired(form, fields) {
  const errors = {};
  fields.forEach((field) => {
    if (field.optional) return;
    const value = form[field.name];
    if (value === "" || value === null || value === undefined) {
      errors[field.name] = `${field.label} is required.`;
    }
  });
  return errors;
}

export function rowsOf(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return data ? [data] : [];
}

export function normalizePayload(form, fields) {
  return Object.fromEntries(fields.map((field) => {
    const value = form[field.name];
    return [field.name, field.type === "number" && value !== "" ? Number(value) : value];
  }));
}

export function clean(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== ""));
}

export function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}

export function format(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Parses "12A" into { row: 12, letter: "A" }
export function parseSeat(seatNumber) {
  const match = /^(\d+)([A-Za-z])$/.exec(seatNumber || "");
  if (!match) return { row: 0, letter: "" };
  return { row: Number(match[1]), letter: match[2].toUpperCase() };
}

export function formatSeatClass(seatClass) {
  return String(seatClass || "")
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
