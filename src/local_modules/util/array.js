/**
 * @param {number} length
 * @return {number[]}
 */
export function times(length) {
  return Array.from({ length }).map((_, i) => i)
}

/**
 * @template T
 * @param {T[]} arr
 * @param {T} item
 */
export function removeArrayItem(arr, item) {
  const idx = arr.indexOf(item)
  if (idx >= 0) {
    arr.splice(idx, 1)
    return item
  }
}
