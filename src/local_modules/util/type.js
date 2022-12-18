/**
 * @template {new () => InstanceType<T>} T
 * @param {unknown} x
 * @param {T} clazz
 * @returns { InstanceType<T> }
 */
export function instOf(x, clazz) {
  if (x instanceof clazz) return x
  throw Error(`not instance: ${clazz.name}`)
}

/**
 * @template T
 * @param {T} x
 * @returns { NonNullable<T> }
 */
export function nonNull(x) {
  if (x != null) return x
  throw Error(`is null`)
}
