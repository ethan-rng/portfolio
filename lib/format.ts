// Dates are calendar days; parse at noon UTC so no timezone shifts them.
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);

export const year = (iso: string) => String(at(iso).getUTCFullYear());
export const monthYear = (iso: string) =>
  at(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
export const fullDate = (iso: string) =>
  at(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
