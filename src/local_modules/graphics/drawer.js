import { BinaryNode } from '@local_modules/binary-node.js'
import { State } from '@local_modules/state.js'
import { loadAsset } from '@local_modules/asset/index.js'
import { createImage } from '@local_modules/util/index.js'
import { WebGLManager, isTexImageSource } from './webgl-helper.js'
import { GraphicsProgram } from './program.js'
import { GraphicsState } from './state.js'

/**
 * @typedef Drawee
 * @prop {number} width
 * @prop {number} height
 */

/**
 * @typedef {TexImageSource | {getDrawee: () => (Drawee | undefined)}} DraweeImage
 */

/**
 * @param {DraweeImage} image
 * @return {Size | undefined}
 */
export function getDraweeSize(image) {
  return 'getDrawee' in image ? image.getDrawee() : image
}

/**
 * @typedef DraweeInfo
 * @prop {number} x
 * @prop {number} y
 * @prop {number} z
 * @prop {number} width
 * @prop {number} height
 * @prop {number} version
 */

const draweeInfoSymbol = Symbol()

export class GraphicsDrawer {
  glm
  state
  program
  /** @type {WebGLTexture | null} */
  texture = null
  texSize
  texLayers
  /** @type {BinaryNode[]} */
  rootNodes = []
  /** @type {WebGLFramebuffer[]} */
  frameBuffers = []
  version = 0

  /**
   * @param {WebGLManager} glm
   * @param {GraphicsState} state
   * @param {State<any>} vertexState
   * @param {GraphicsProgram} program
   * @param {number} texSize
   * @param {number} texLayers
   */
  constructor(glm, state, vertexState, program, texSize, texLayers) {
    this.glm = glm
    this.state = state
    this.attrState = vertexState
    this.program = program
    this.texSize = texSize
    this.texLayers = texLayers

    this.#init()
    glm.onContextRestored(() => this.#init())
  }

  #init() {
    const glm = this.glm
    const gl = glm.gl
    if (!gl) return

    const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    const maxTexLayers = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)
    const texSize = Math.min(this.texSize, maxTexSize)
    const texLayers = Math.min(this.texLayers, maxTexLayers)

    gl.activeTexture(gl.TEXTURE0)

    this.texture = glm.createTexture(texSize, texSize, texLayers)
    this.frameBuffers = []
    this.rootNodes = []
    this.version++
  }

  /**
   * @param {TexImageSource} image
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setImage(image, x, y, z) {
    const glm = this.glm
    const gl = glm.gl
    if (!gl) return

    gl.activeTexture(gl.TEXTURE0)
    glm.texSubImage3D(this.texture, x, y, z, image)
  }

  /**
   * @param {WebGLFramebuffer | null} frameBuffer
   * @param {number} width
   * @param {number} height
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  setImageFrameBuffer(frameBuffer, width, height, x, y, z) {
    const glm = this.glm
    const gl = glm.gl
    if (!gl) return

    let dstFrameBuffer = this.frameBuffers[z]

    if (!dstFrameBuffer) {
      this.frameBuffers[z] = glm.createFramebuffer(this.texture, z)
      dstFrameBuffer = this.frameBuffers[z]
    }

    glm.blitFramebuffer(dstFrameBuffer, x, y, width, height, frameBuffer)
  }

  /**
   * @param {DraweeImage} image
   * @param {number} [dx]
   * @param {number} [dy]
   * @param {number} [dw]
   * @param {number} [dh]
   * @param {number} [sx]
   * @param {number} [sy]
   * @param {number} [sw]
   * @param {number} [sh]
   */
  draw(image, dx, dy, dw, dh, sx, sy, sw, sh) {
    const drawee = getDraweeSize(image)
    if (!drawee) return
    const draweeInfo = this.getDraweeInfo(drawee)

    dx = dx ?? 0
    dy = dy ?? 0
    dw = dw ?? draweeInfo.width
    dh = dh ?? draweeInfo.height
    sx = sx ?? 0
    sy = sy ?? 0
    sw = sw ?? draweeInfo.width
    sh = sh ?? draweeInfo.height

    const dstLeft = dx
    const dstTop = dy
    const dstRight = dx + dw
    const dstBottom = dy + dh

    const texLeft = (draweeInfo.x + sx) / this.texSize
    const texTop = (draweeInfo.y + sy) / this.texSize
    const texRight = (draweeInfo.x + sx + sw) / this.texSize
    const texBottom = (draweeInfo.y + sy + sh) / this.texSize

    const mat = this.state.data.matrix
    const posLeftTop = mat.transformPos({ x: dstLeft, y: dstTop })
    const posRightTop = mat.transformPos({ x: dstRight, y: dstTop })
    const posLeftBottom = mat.transformPos({ x: dstLeft, y: dstBottom })
    const posRightBottom = mat.transformPos({ x: dstRight, y: dstBottom })

    this.program.addVertex('position', [
      posLeftTop.x,
      posLeftTop.y,
      posRightTop.x,
      posRightTop.y,
      posLeftBottom.x,
      posLeftBottom.y,
      posRightBottom.x,
      posRightBottom.y,
    ])

    this.program.addVertex('textureCoord', [
      texLeft,
      texTop,
      draweeInfo.z,
      texRight,
      texTop,
      draweeInfo.z,
      texLeft,
      texBottom,
      draweeInfo.z,
      texRight,
      texBottom,
      draweeInfo.z,
    ])

    for (const key in this.attrState.data) {
      const values = this.attrState.data[key]
      this.program.addVertex(key, values)
      this.program.addVertex(key, values)
      this.program.addVertex(key, values)
      this.program.addVertex(key, values)
    }
  }

  /**
   * @param {Drawee} drawee
   * @return {DraweeInfo}
   */
  getDraweeInfo(drawee) {
    // @ts-ignore
    let draweeInfo = drawee[draweeInfoSymbol]

    if (!draweeInfo || draweeInfo.version !== this.version) {
      const node = new BinaryNode(0, 0, drawee.width + 1, drawee.height + 1)
      let z = this.rootNodes.findIndex((root) => root.insert(node))

      if (z < 0) {
        z = this.rootNodes.length
        const root = new BinaryNode(0, 0, this.texSize + 1, this.texSize + 1)
        if (!root.insert(node)) throw Error('texture overflow')
        this.rootNodes.push(root)
      }

      // @ts-ignore
      draweeInfo = drawee[draweeInfoSymbol] = {
        x: node.x,
        y: node.y,
        z,
        width: drawee.width,
        height: drawee.height,
        version: this.version,
      }

      if (isTexImageSource(drawee)) {
        this.setImage(drawee, draweeInfo.x, draweeInfo.y, draweeInfo.z)
      }
    }

    return draweeInfo
  }

  /**
   * @param {number} textureUnit
   * @param {string} path
   */
  loadTexture(textureUnit, path) {
    const glm = this.glm

    /**
     * @param {TexImageSource} image
     */
    const setup = (image) => {
      const gl = glm.gl
      if (!gl) return

      gl.activeTexture(gl.TEXTURE0 + textureUnit)
      const texture = glm.createTexture(image.width, image.height)
      glm.texSubImage2D(texture, 0, 0, image)
      gl.activeTexture(gl.TEXTURE0)
    }

    return loadAsset(path)
      .then((buf) => createImage(buf, path))
      .then((image) => {
        setup(image)
        glm.onContextRestored(() => setup(image))
      })
  }
}
