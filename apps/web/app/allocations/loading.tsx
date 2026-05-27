export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-10 bg-slate-800 rounded-xl" />
      <div className="bg-slate-800 rounded-xl divide-y divide-slate-700">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 mx-4 my-0 bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
