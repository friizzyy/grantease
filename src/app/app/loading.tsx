export default function AppLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1200px] mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="h-3 skeleton w-20 mb-3" />
          <div className="h-7 skeleton w-56" />
        </div>
        <div className="h-9 skeleton rounded-lg w-28" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="h-3 skeleton w-20 mb-4" />
            <div className="h-8 skeleton w-24 mb-2" />
            <div className="h-3 skeleton w-16" />
          </div>
        ))}
      </div>

      {/* Content sections */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-6">
        <div className="h-5 skeleton w-40 mb-5" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-lg" />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-52" />
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-52" />
      </div>
    </div>
  )
}
