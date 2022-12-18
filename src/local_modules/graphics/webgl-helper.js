import { nonNull, colorToRgba } from '@local_modules/util/index.js'

export class WebGLManager {
  gl = /** @type {WebGL2RenderingContext | null} */ (null)
  #canvas
  #clearColor

  /**
   * @param {object} config
   * @param {HTMLCanvasElement} config.canvas
   * @param {string} [config.clearColor]
   */
  constructor(config) {
    this.#canvas = config.canvas
    this.#clearColor = colorToRgba(config.clearColor || '#000')

    this.#canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      this.#destroy()
    })

    this.#canvas.addEventListener('webglcontextrestored', () => {
      this.#init()
    })

    this.#init()
  }

  #init() {
    const gl = this.#canvas.getContext('webgl2', { antialias: false })

    if (!gl) {
      console.error('failed to initialise WebGL2: no context')
      return
    }

    const err = gl.getError()

    if (err !== gl.NO_ERROR) {
      console.error(`failed to initialise WebGL2: ${err}`)
      return
    }

    this.gl = gl

    gl.clearColor(
      this.#clearColor[0] / 0xff,
      this.#clearColor[1] / 0xff,
      this.#clearColor[2] / 0xff,
      this.#clearColor[3] / 0xff
    )
    // gl.enable(gl.CULL_FACE)
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE)
  }

  #destroy() {
    this.gl = null
  }

  /**
   * @param {() => void} listener
   */
  onContextLost(listener) {
    this.#canvas.addEventListener('webglcontextlost', listener)
  }

  /**
   * @param {() => void} listener
   */
  onContextRestored(listener) {
    this.#canvas.addEventListener('webglcontextrestored', listener)
  }

  /**
   * @param {string} vertexShader
   * @param {string} fragmentShader
   */
  createProgram(vertexShader, fragmentShader) {
    const gl = nonNull(this.gl)

    const shaders = [
      { type: gl.VERTEX_SHADER, source: vertexShader },
      { type: gl.FRAGMENT_SHADER, source: fragmentShader },
    ]

    const program = nonNull(gl.createProgram())

    for (const { type, source } of shaders) {
      const shader = nonNull(gl.createShader(type))

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.attachShader(program, shader)
      } else {
        const infoLog = gl.getShaderInfoLog(shader)
        throw new Error(infoLog || 'shader compile error')
      }
    }

    gl.linkProgram(program)

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program)

      return program
    } else {
      const infoLog = gl.getProgramInfoLog(program)
      throw new Error(infoLog || 'program link error')
    }
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {number} [depth]
   */
  createTexture(width, height, depth) {
    const gl = nonNull(this.gl)
    const texture = nonNull(gl.createTexture())

    if (depth == undefined) {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    } else {
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
      gl.texStorage3D(
        gl.TEXTURE_2D_ARRAY,
        Math.floor(Math.log(512) / Math.log(2)) + 1,
        gl.RGBA8,
        width,
        height,
        depth
      )
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }

    return texture
  }

  /**
   * @param {WebGLTexture | null} texture
   * @param {number} x
   * @param {number} y
   * @param {TexImageSource} image
   */
  texSubImage2D(texture, x, y, image) {
    const gl = nonNull(this.gl)

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      x,
      y,
      image.width,
      image.height,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    )
  }

  /**
   * @param {WebGLTexture | null} texture
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {TexImageSource} image
   */
  texSubImage3D(texture, x, y, z, image) {
    const gl = nonNull(this.gl)

    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
    gl.texSubImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,
      x,
      y,
      z,
      image.width,
      image.height,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    )
  }

  /**
   * @param {WebGLTexture | null} texture
   * @param {number} [layer]
   */
  createFramebuffer(texture, layer) {
    const gl = nonNull(this.gl)
    const frameBuffer = nonNull(gl.createFramebuffer())

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    if (layer === undefined) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      )
    } else {
      gl.framebufferTextureLayer(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        texture,
        0,
        layer
      )
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return frameBuffer
  }

  /**
   * @param {WebGLFramebuffer} dst
   * @param {number} dx
   * @param {number} dy
   * @param {number} dw
   * @param {number} dh
   * @param {WebGLFramebuffer | null} src
   * @param {number} sx
   * @param {number} sy
   * @param {number} sw
   * @param {number} sh
   */
  blitFramebuffer(dst, dx, dy, dw, dh, src, sx = 0, sy = 0, sw = dw, sh = dh) {
    const gl = nonNull(this.gl)

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, src)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dst)
    gl.blitFramebuffer(
      sx,
      sy,
      sx + sw,
      sy + sh,
      dx,
      dy,
      dx + dw,
      dy + dh,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST
    )
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
  }

  createVertexBuffer() {
    const gl = nonNull(this.gl)
    const vbo = nonNull(gl.createBuffer())
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    return vbo
  }

  createIndexBuffer() {
    const gl = nonNull(this.gl)
    const ibo = nonNull(gl.createBuffer())
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    return ibo
  }

  /**
   * @param {WebGLBuffer} vbo
   * @param {Iterable<number>} data
   */
  setVertexBufferData(vbo, data) {
    const gl = nonNull(this.gl)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW)
  }

  /**
   * @param {WebGLBuffer | null} ibo
   * @param {Iterable<number>} data
   */
  setIndexBufferData(ibo, data) {
    const gl = nonNull(this.gl)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(data),
      gl.DYNAMIC_DRAW
    )
  }
}

/**
 * @param {unknown} x
 * @return {x is TexImageSource}
 */
export function isTexImageSource(x) {
  return (
    x instanceof ImageBitmap ||
    x instanceof ImageData ||
    x instanceof HTMLImageElement ||
    x instanceof HTMLCanvasElement ||
    x instanceof HTMLVideoElement
  )
}
