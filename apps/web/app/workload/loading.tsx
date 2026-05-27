export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-slate-800 rounded-lg" />
      <div className="h-12 bg-slate-800 rounded-xl" />
      <div className="bg-slate-800 rounded-xl divide-y divide-slate-700">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 mx-4" />
        ))}
      </div>
    </div>
  );
}
