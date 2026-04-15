export default function SavedLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1400px] mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-7 skeleton w-40 mb-2" />
        <div className="h-4 skeleton w-64" />
      </div>

      {/* Stats bar */}
      <div className="rounded-xl border border-pulse-accent/10 bg-pulse-accent/[0.02] p-4 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 skeleton rounded-lg" />
            <div>
              <div className="h-6 skeleton w-8 mb-1" />
              <div className="h-3 skeleton w-20" />
            </div>
          </div>
          <div className="w-px h-10 bg-white/[0.06] hidden sm:block" />
          <div>
            <div className="h-6 skeleton w-16 mb-1" />
            <div className="h-3 skeleton w-24" />
          </div>
        </div>
      </div>

      {/* Grant grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-start justify-between mb-3">
              <div className="h-7 skeleton w-24 rounded-lg" />
              <div className="h-8 skeleton w-8 rounded-lg" />
            </div>
            <div className="h-6 skeleton w-full mb-1" />
            <div className="h-6 skeleton w-3/4 mb-1" />
            <div className="h-4 skeleton w-1/2 mb-4" />
            <div className="h-12 skeleton w-full mb-4" />
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
