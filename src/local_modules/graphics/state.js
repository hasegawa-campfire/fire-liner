import { Matrix2d } from '@local_modules/matrix2d.js'
import { BmpFont } from '@local_modules/font/index.js'
import { State } from '@local_modules/state.js'

/**
 * @typedef GraphicsStateData
 * @prop {Matrix2d} matrix
 * @prop {string} color
 * @prop {BmpFont | null} font
 */

/**
 * @extends {State<GraphicsStateData>}
 */
export class GraphicsState extends State {
  constructor() {
    super({
      color: '#000',
      matrix: Matrix2d.identity,
      font: null,
    })
  }
}
