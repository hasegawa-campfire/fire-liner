import { Matrix2d } from '@local_modules/matrix2d.js'
import { State } from '@local_modules/state.js'
import { WebGLManager } from './webgl-helper.js'
import { GraphicsStdout } from './stdout.js'
import { GraphicsProgram } from './program.js'
import { GraphicsDrawer } from './drawer.js'
import { GraphicsOffScreen } from './offscreen.js'
import { GraphicsText } from './text.js'
import { GraphicsShape } from './shape.js'
import { GraphicsState } from './state.js'

export class Graphics {
  #state
  #attrState
  stdout
  program
  offScreen
  #drawer
  #shape
  #text

  /**
   * @param {object} config
   * @param {HTMLCanvasElement} config.canvas
   * @param {number} config.texSize
   * @param {number} config.texLayers
   * @param {string} [config.clearColor]
   */
  constructor(config) {
    const glm = new WebGLManager(config)

    this.#state = new GraphicsState()
    this.#attrState = new State(/** @type {any} */ ({}))
    this.stdout = new GraphicsStdout(glm)
    this.program = new GraphicsProgram(glm)
    this.#drawer = new GraphicsDrawer(
      glm,
      this.#state,
      this.#attrState,
      this.program,
      config.texSize,
      config.texLayers
    )
    this.offScreen = new GraphicsOffScreen(glm, this.#drawer)
    this.#shape = new GraphicsShape(this.#state, this.#drawer)
    this.#text = new GraphicsText(this.#state, this.#drawer)
  }

  save() {
    this.#state.save()
    this.#attrState.save()
  }

  restore() {
    this.#state.restore()
    this.#attrState.restore()
  }

  /**
   * @param {string} name
   * @param  {number[]} value
   */
  setAttr(name, value) {
    this.#attrState.data[name] = value.slice()
  }

  /**
   * @param {string} name
   * @return {number[]}
   */
  getAttr(name) {
    const value = this.#attrState.data[name]
    return value ? value.slice() : []
  }

  get color() {
    return this.#state.data.color
  }

  set color(value) {
    this.#state.data.color = value
  }

  get font() {
    return this.#state.data.font
  }

  set font(value) {
    this.#state.data.font = value
  }

  get matrix() {
    return this.#state.data.matrix
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  translate(x, y) {
    this.#state.data.matrix = this.#state.data.matrix.translate(x, y)
  }

  /**
   * @param {Pos} pos
   */
  translatePos(pos) {
    this.#state.data.matrix = this.#state.data.matrix.translate(pos.x, pos.y)
  }

  /**
   * @param {number} sx
   * @param {number} [sy]
   */
  scale(sx, sy) {
    this.#state.data.matrix = this.#state.data.matrix.scale(sx, sy)
  }

  /**
   * @param {number} deg
   */
  rotate(deg) {
    this.#state.data.matrix = this.#state.data.matrix.rotate(deg)
  }

  identify() {
    this.#state.data.matrix = Matrix2d.identity
  }

  /**
   * @param {Pos} pos
   */
  transformPos(pos) {
    return this.#state.data.matrix.transformPos(pos)
  }

  /**
   * @param {Pos} pos
   */
  invertTransformPos(pos) {
    return this.#state.data.matrix.invert().transformPos(pos)
  }

  /**
   * @param {import('./drawer.js').DraweeImage} image
   * @param {number} [dx]
   * @param {number} [dy]
   * @param {number} [dw]
   * @param {number} [dh]
   * @param {number} [sx]
   * @param {number} [sy]
   * @param {number} [sw]
   * @param {number} [sh]
   */
  drawImage(image, dx, dy, dw, dh, sx, sy, sw, sh) {
    return this.#drawer.draw(image, dx, dy, dw, dh, sx, sy, sw, sh)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} [color]
   */
  drawRect(x, y, width, height, color) {
    return this.#shape.drawRect(x, y, width, height, color)
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {string} [color]
   * @param {number} strokeWidth
   */
  drawCirle(x, y, radius, color, strokeWidth = 1) {
    return this.#shape.drawCirle(x, y, radius, color, strokeWidth)
  }

  /**
   * @param {string} text
   * @param {Partial<import('./text.js').TextStyle>} [style]
   */
  measureText(text, style) {
    return this.#text.measure(text, style)
  }

  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {Partial<import('./text.js').TextStyle>} [style]
   */
  drawText(text, x, y, style) {
    return this.#text.draw(text, x, y, style)
  }

  /**
   * @param {number} textureUnit
   * @param {string} path
   */
  loadTexture(textureUnit, path) {
    return this.#drawer.loadTexture(textureUnit, path)
  }
}
