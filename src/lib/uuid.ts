/**
 * Utilities for validating and normalizing UUIDs before sending queries to Supabase / PostgreSQL.
 * Prevents PostgreSQL error: "invalid input syntax for type uuid: ''"
 */

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export function isUuid(value: unknown): value is string {
  if (typeof value !== 'string') return false
  return UUID_REGEX.test(value.trim())
}

export function toValidUuidOrNull(value: unknown): string | null {
  if (isUuid(value)) return value.trim()
  return null
}
