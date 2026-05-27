export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 h-64 bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
