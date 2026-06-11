/**
 * ID 生成
 */
let counter = 0

export function genId(prefix = 'id'): string {
  counter = (counter + 1) % 1_000_000
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`
}
