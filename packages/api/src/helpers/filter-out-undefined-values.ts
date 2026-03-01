export function filterOutUndefinedValues(value: unknown): boolean {
  return value !== undefined && value !== null && value !== 'undefined' && value !== 'null' && value !== '';
}
