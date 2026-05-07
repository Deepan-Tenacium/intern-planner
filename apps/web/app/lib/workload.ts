export type LoadStatus = "green" | "amber" | "red";

export function getLoadStatus(allocatedHours: number): LoadStatus {
  if (allocatedHours >= 40) return "red";
  if (allocatedHours >= 30) return "amber";
  return "green";
}

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
