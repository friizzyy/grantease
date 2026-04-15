export default function VaultLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-4xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 skeleton w-44 mb-2" />
          <div className="h-4 skeleton w-72" />
        </div>
        <div className="h-9 skeleton rounded-lg w-36" />
      </div>

      {/* Completeness card */}
      <div className="rounded-xl border border-pulse-accent/10 bg-pulse-accent/[0.02] p-5 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 skeleton rounded-full" />
          <div className="flex-1">
            <div className="h-5 skeleton w-40 mb-2" />
            <div className="h-2 skeleton w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-4">
          <div className="h-5 skeleton w-36 mb-4" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-10 skeleton rounded-lg" />
            <div className="h-10 skeleton rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
