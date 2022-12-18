import { nonNull } from './type.js'

/**
 * @param {Blob} blob
 */
export async function loadImage(blob) {
  const image = new Image()
  const url = URL.createObjectURL(blob)
  image.src = url
  await image.decode()
  URL.revokeObjectURL(url)
  return image
}

/**
 * @param {ArrayBuffer} buf
 * @param {string} filename
 */
export async function createImage(buf, filename) {
  const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
  const blob = new Blob([buf], { type })

  try {
    return await createImageBitmap(blob)
  } catch {
    return await loadImage(blob)
  }
}

const rgbaCanvas = document.createElement('canvas')
rgbaCanvas.width = 1
rgbaCanvas.height = 1
const rgbaCtx = nonNull(
  rgbaCanvas.getContext('2d', { willReadFrequently: true })
)
/** @type {Record<string, [number, number, number, number]>} */
const rgbaCache = {}

/**
 * @param {string} color
 */
export function colorToRgba(color) {
  let rgba = rgbaCache[color]
  if (!rgba) {
    rgbaCtx.fillStyle = color
    rgbaCtx.clearRect(0, 0, 1, 1)
    rgbaCtx.fillRect(0, 0, 1, 1)
    const data = rgbaCtx.getImageData(0, 0, 1, 1).data
    rgba = rgbaCache[color] = [data[0], data[1], data[2], data[3]]
  }
  return rgba
}
