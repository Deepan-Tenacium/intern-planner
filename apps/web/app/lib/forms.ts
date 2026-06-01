export const colors = {
  bg:        "#0f1117",
  border:    "#2a2d3a",
  text:      "#f1f5f9",
  textMuted: "#94a3b8",
  indigo:    "#6366f1",
  red:       "#ef4444",
  amber:     "#fbbf24",
};

export const inputCls =
  "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500";

export const inputStyle = {
  background: colors.bg,
  border: `1px solid ${colors.border}`,
  color: colors.text,
};

export const inputErrorStyle = {
  background: colors.bg,
  border: `1px solid ${colors.red}`,
  color: colors.text,
};
