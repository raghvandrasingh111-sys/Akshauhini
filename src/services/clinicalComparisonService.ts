export type ComparisonStatus = 'NEW' | 'CHANGED' | 'RESOLVED' | 'UNCHANGED' | 'POTENTIALLY_UNRESOLVED'

export interface ClinicalChange {
  field: string
  status: ComparisonStatus
  previous: string
  current: string
  summary: string
}

function normalizeValue(value: unknown): string {
  if (value == null) return 'Not recorded'
  if (typeof value === 'string') return value.trim() || 'Not recorded'
  if (Array.isArray(value)) return value.join(', ') || 'Not recorded'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function compareScalar(field: string, previous: unknown, current: unknown): ClinicalChange | null {
  const prev = normalizeValue(previous)
  const curr = normalizeValue(current)

  if (prev === 'Not recorded' && curr === 'Not recorded') return null
  if (prev === 'Not recorded' && curr !== 'Not recorded') {
    return { field, status: 'NEW', previous: prev, current: curr, summary: `${field} was not documented before and is now present.` }
  }
  if (curr === 'Not recorded' && prev !== 'Not recorded') {
    return { field, status: 'RESOLVED', previous: prev, current: curr, summary: `${field} is no longer documented in the current encounter.` }
  }
  if (prev !== curr) {
    return { field, status: 'CHANGED', previous: prev, current: curr, summary: `${field} changed from "${prev}" to "${curr}".` }
  }
  return { field, status: 'UNCHANGED', previous: prev, current: curr, summary: `${field} remains unchanged.` }
}

export function compareClinicalData(previous: Record<string, unknown>, current: Record<string, unknown>): ClinicalChange[] {
  const keys = Array.from(new Set([...Object.keys(previous), ...Object.keys(current)])).sort()

  return keys
    .map((key) => {
      if (key === 'timestamp' || key === 'updated_at' || key === 'created_at') return null
      return compareScalar(key, previous[key], current[key])
    })
    .filter((item): item is ClinicalChange => Boolean(item))
}
