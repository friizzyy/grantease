export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 animate-pulse">
      <div className="w-full max-w-2xl space-y-8">
        {/* Progress bar */}
        <div className="h-2 bg-pulse-surface rounded-full" />

        {/* Step content */}
        <div className="space-y-4">
          <div className="h-8 w-64 bg-pulse-surface rounded-lg mx-auto" />
          <div className="h-5 w-96 bg-pulse-surface rounded mx-auto" />
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-pulse-surface rounded-xl border border-pulse-border" />
          ))}
        </div>
      </div>
    </div>
  )
}
