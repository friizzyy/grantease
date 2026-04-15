export default function DiscoverLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1400px] mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-7 skeleton w-48 mb-2" />
        <div className="h-4 skeleton w-72" />
      </div>

      {/* Search bar */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6">
        <div className="h-12 skeleton rounded-lg mb-4" />
        <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
          <div className="h-3 skeleton w-14" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 skeleton w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Grant grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 skeleton w-20 rounded-full" />
              <div className="h-5 skeleton w-14 rounded-full" />
            </div>
            <div className="h-6 skeleton w-full mb-2" />
            <div className="h-6 skeleton w-3/4 mb-1" />
            <div className="h-4 skeleton w-1/2 mb-4" />
            <div className="h-14 skeleton w-full mb-4" />
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div className="h-4 skeleton w-24" />
              <div className="h-4 skeleton w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
