export function warn(message: string): void {
  console.warn(message)
  throw new Error(message)
}
