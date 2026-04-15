export default function GrantDetailLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-4xl mx-auto animate-pulse">
      {/* Back button */}
      <div className="h-8 skeleton w-24 rounded-lg mb-6" />

      {/* Title area */}
      <div className="mb-6">
        <div className="h-8 skeleton w-3/4 mb-2" />
        <div className="h-5 skeleton w-1/2 mb-4" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 skeleton w-28 rounded-full" />
          ))}
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="h-5 skeleton w-32 mb-4" />
          <div className="h-4 skeleton w-full mb-2" />
          <div className="h-4 skeleton w-full mb-2" />
          <div className="h-4 skeleton w-3/4" />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="h-5 skeleton w-28 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 skeleton rounded-lg" />
            <div className="h-16 skeleton rounded-lg" />
            <div className="h-16 skeleton rounded-lg" />
            <div className="h-16 skeleton rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 h-48" />
      </div>
    </div>
  )
}
