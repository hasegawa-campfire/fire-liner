import { GraphicsDrawer } from './drawer.js'
import { WebGLManager } from './webgl-helper.js'

export class GraphicsOffScreen {
  glm
  drawer

  /**
   * @param {WebGLManager} glm
   * @param {GraphicsDrawer} drawer
   */
  constructor(glm, drawer) {
    this.glm = glm
    this.drawer = drawer
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  create(width, height) {
    return new OffScreen(this.glm, this.drawer, width, height)
  }
}

export class OffScreen {
  #glm
  #drawer
  #frameBuffer = /** @type {WebGLFramebuffer | null} */ (null)
  width
  height

  /**
   * @param {WebGLManager} glm
   * @param {GraphicsDrawer} drawer
   * @param {number} width
   * @param {number} height
   */
  constructor(glm, drawer, width, height) {
    this.#glm = glm
    this.#drawer = drawer
    this.width = width
    this.height = height

    this.#init()
    glm.onContextRestored(() => this.#init())
  }

  #init() {
    const glm = this.#glm
    const gl = glm.gl
    if (!gl) return

    gl.activeTexture(gl.TEXTURE1)
    const texture = glm.createTexture(this.width, this.height)
    this.#frameBuffer = glm.createFramebuffer(texture)
  }

  begin() {
    const gl = this.#glm.gl
    if (!gl) return

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#frameBuffer)
    gl.viewport(0, 0, this.width, this.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  end() {
    const gl = this.#glm.gl
    if (!gl) return

    const draweeInfo = this.#drawer.getDraweeInfo(this)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.#drawer.setImageFrameBuffer(
      this.#frameBuffer,
      draweeInfo.width,
      draweeInfo.height,
      draweeInfo.x,
      draweeInfo.y,
      draweeInfo.z
    )
  }

  getDrawee() {
    return this
  }
}
