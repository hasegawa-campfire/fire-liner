import { Screen } from '@local_modules/screen.js'
import { Graphics } from '@local_modules/graphics/index.js'

export const screen = new Screen({
  el: '#screen',
  width: 144,
  height: 160,
})

export const g = new Graphics({
  canvas: screen.canvas,
  texSize: 1024,
  texLayers: 10,
  clearColor: '#fff',
})
