import assets from './data.js'

/** @type {Record<string, Promise<ArrayBuffer>>} */
const cache = {}

{
  const url = new URL('./data.bin', import.meta.url)
  const promise = fetch(url).then((res) => res.arrayBuffer())
  for (const [path, [offset, size]] of Object.entries(assets)) {
    cache[path] = promise.then((buf) => buf.slice(offset, offset + size))
  }
}

/**
 * @param {string} path
 */
export function loadAsset(path) {
  let promise = cache[path]
  if (!promise) {
    promise = fetch(`./assets/${path}`).then((res) => res.arrayBuffer())
    cache[path] = promise
  }
  return promise
}
