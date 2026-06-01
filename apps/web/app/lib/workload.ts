export const OVERLOAD_THRESHOLD = 40; // hours/week — red
export const CAPACITY_THRESHOLD = 30; // hours/week — amber

export type LoadStatus = "green" | "amber" | "red";

export function getLoadStatus(allocatedHours: number): LoadStatus {
  if (allocatedHours >= OVERLOAD_THRESHOLD) return "red";
  if (allocatedHours >= CAPACITY_THRESHOLD) return "amber";
  return "green";
}

export const statusHex: Record<LoadStatus, string> = {
  green: "#22c55e",
  amber: "#fbbf24",
  red:   "#ef4444",
};

export const statusBgHex: Record<LoadStatus, string> = {
  green: "rgba(34,197,94,0.15)",
  amber: "rgba(251,191,36,0.15)",
  red:   "rgba(239,68,68,0.15)",
};

export const loadColors: Record<LoadStatus, { dot: string; bar: string; text: string }> = {
  green: {
    dot: "bg-green-500",
    bar: "bg-green-500",
    text: "text-green-700",
  },
  amber: {
    dot: "bg-amber-400",
    bar: "bg-amber-400",
    text: "text-amber-700",
  },
  red: {
    dot: "bg-red-500",
    bar: "bg-red-500",
    text: "text-red-700",
  },
};
