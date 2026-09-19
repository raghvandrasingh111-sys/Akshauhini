interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / total) * 100))
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-medikiosk-muted mb-2">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-medikiosk-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
