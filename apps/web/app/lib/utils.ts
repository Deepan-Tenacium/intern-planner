export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

export const skillCategoryColors: Record<string, string> = {
  backend:  "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30",
  frontend: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30",
  data:     "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  design:   "bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/30",
};

export const skillCategoryFallback = "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
