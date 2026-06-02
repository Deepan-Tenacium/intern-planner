export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-800 rounded-xl" />
        <div className="col-span-2 space-y-4">
          <div className="h-40 bg-slate-800 rounded-xl" />
          <div className="h-40 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
