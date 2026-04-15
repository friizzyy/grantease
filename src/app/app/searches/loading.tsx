export default function SearchesLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1400px] mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-7 skeleton w-44 mb-2" />
        <div className="h-4 skeleton w-72" />
      </div>

      {/* Stats bar */}
      <div className="rounded-xl border border-pulse-accent/10 bg-pulse-accent/[0.02] p-4 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 skeleton rounded-lg" />
            <div>
              <div className="h-6 skeleton w-8 mb-1" />
              <div className="h-3 skeleton w-24" />
            </div>
          </div>
          <div className="w-px h-10 bg-white/[0.06] hidden sm:block" />
          <div>
            <div className="h-6 skeleton w-8 mb-1" />
            <div className="h-3 skeleton w-20" />
          </div>
        </div>
      </div>

      {/* Search cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-6 skeleton w-48 mb-2" />
                <div className="flex gap-2">
                  <div className="h-6 skeleton w-24 rounded-lg" />
                  <div className="h-6 skeleton w-20 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 skeleton w-9 rounded-lg" />
                <div className="h-9 skeleton w-20 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              <div className="h-4 skeleton w-28" />
              <div className="h-4 skeleton w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
