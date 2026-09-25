const WEEKDAY_MAP: Record<string, string> = {
  Sun: "日",
  Mon: "月",
  Tue: "火",
  Wed: "水",
  Thu: "木",
  Fri: "金",
  Sat: "土",
};

export function formatBoardDate(iso: string) {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekday = WEEKDAY_MAP[get("weekday")] ?? get("weekday");

  return `${get("year")}/${get("month")}/${get("day")}(${weekday}) ${get("hour")}:${get("minute")}:${get("second")}`;
}

export function displayName(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "名無しさん";
}
