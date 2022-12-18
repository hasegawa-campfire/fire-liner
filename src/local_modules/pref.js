/**
 * @param {string | null} json
 * @return {any}
 */
function parseJson(json) {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * @template {object} T
 * @param {string} key
 * @param {T} data
 * @return {T}
 */
export function createPref(key, data) {
  const target = { ...data, ...parseJson(localStorage.getItem(key)) }

  return createProxy(target, () => {
    localStorage.setItem(key, JSON.stringify(target))
  })
}

/**
 * @template {object} T
 * @param {T} target
 * @param {Function} onChange
 * @return {T}
 */
function createProxy(target, onChange) {
  return new Proxy(target, {
    set(obj, prop, value, receiver) {
      const ret = Reflect.set(obj, prop, value, receiver)
      if (ret) onChange()
      return ret
    },

    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver)
      return typeof value === 'object' && value !== null
        ? createProxy(value, onChange)
        : value
    },
  })
}
