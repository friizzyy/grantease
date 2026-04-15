export default function SettingsLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-6xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-7 skeleton w-32 mb-2" />
        <div className="h-4 skeleton w-80" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:w-72 shrink-0 space-y-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 skeleton rounded-full mb-3" />
              <div className="h-5 skeleton w-32 mb-1" />
              <div className="h-4 skeleton w-24" />
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 skeleton rounded-xl mb-1" />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="h-5 skeleton w-40 mb-4" />
              <div className="h-10 skeleton rounded-lg mb-3" />
              <div className="h-10 skeleton rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
