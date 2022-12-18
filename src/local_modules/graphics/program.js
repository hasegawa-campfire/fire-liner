import { nonNull } from '@local_modules/util/index.js'
import { WebGLManager } from './webgl-helper.js'

export class GraphicsProgram {
  glm
  /** @type {Program | null } */
  current = null

  /**
   * @param {WebGLManager} glm
   */
  constructor(glm) {
    this.glm = glm
  }

  /**
   * @param {object} config
   * @param {object} config.shaders
   * @param {string} config.shaders.vertex
   * @param {string} config.shaders.fragment
   * @param {Record<string, number>} config.attrs
   * @param {Record<string, string>} config.uniforms
   */
  create(config) {
    return new Program(this, config)
  }

  /**
   * @param {string} name
   * @param {number[]} data
   */
  addVertex(name, data) {
    this.current?.addVertex(name, data)
  }
}
/**
 * @typedef AttrUnit
 * @prop {number} size
 * @prop {WebGLBuffer} vbo
 * @prop {number[]} data
 */

/**
 * @typedef UniformUnit
 * @prop {WebGLUniformLocation} loc
 * @prop {string} type
 */

export class Program {
  #config
  #owner
  #program = /** @type {WebGLProgram | null} */ (null)
  #uniforms = /** @type {Record<string, UniformUnit>} */ ({})
  #attrs = /** @type {Record<string, AttrUnit>} */ ({})
  #ibo = /** @type {WebGLBuffer | null} */ (null)
  #vao = /** @type {WebGLVertexArrayObject | null} */ (null)

  /**
   * @param {GraphicsProgram} owner
   * @param {object} config
   * @param {object} config.shaders
   * @param {string} config.shaders.vertex
   * @param {string} config.shaders.fragment
   * @param {Record<string, number>} config.attrs
   * @param {Record<string, string>} config.uniforms
   */
  constructor(owner, config) {
    this.#owner = owner
    this.#config = config

    this.#init()
    owner.glm.onContextRestored(() => this.#init())
  }

  #init() {
    const glm = this.#owner.glm
    const gl = glm.gl
    if (!gl) return

    const config = this.#config

    this.#program = glm.createProgram(
      config.shaders.vertex,
      config.shaders.fragment
    )

    this.#uniforms = {}
    for (const [name, type] of Object.entries(config.uniforms)) {
      const loc = nonNull(gl.getUniformLocation(this.#program, name))
      this.#uniforms[name] = { loc, type }
    }

    this.#vao = nonNull(gl.createVertexArray())
    gl.bindVertexArray(this.#vao)

    this.#attrs = {}
    for (const [name, size] of Object.entries(config.attrs)) {
      const loc = gl.getAttribLocation(this.#program, name)
      const vbo = glm.createVertexBuffer()
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
      this.#attrs[name] = { size, vbo, data: [] }
    }

    this.#ibo = glm.createIndexBuffer()
    gl.bindVertexArray(null)
  }

  begin() {
    const gl = this.#owner.glm.gl
    if (!gl) return

    gl.useProgram(this.#program)

    for (const { data } of Object.values(this.#attrs)) {
      data.splice(0)
    }

    this.#owner.current = this
  }

  end() {
    const glm = this.#owner.glm
    const gl = glm.gl
    if (!gl) return

    let elementSize = 0

    for (const { size, vbo, data } of Object.values(this.#attrs)) {
      elementSize = Math.max(elementSize, data.length / size)
      glm.setVertexBufferData(vbo, data)
    }

    const indices = []

    for (let i = 0; i < elementSize; i += 4) {
      indices.push(i + 0, i + 1, i + 2, i + 3, i + 2, i + 1)
    }

    glm.setIndexBufferData(this.#ibo, indices)

    gl.bindVertexArray(this.#vao)
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    gl.bindVertexArray(null)

    if (this.#owner.current === this) {
      this.#owner.current = null
    }
  }

  /**
   * @param {Record<string, number[]>} values
   */
  setUniforms(values) {
    const gl = this.#owner.glm.gl
    if (!gl) return

    for (const [name, v] of Object.entries(values)) {
      const { loc, type } = this.#uniforms[name]

      if (type === '1f') gl.uniform1f(loc, v[0])
      else if (type === '2f') gl.uniform2f(loc, v[0], v[1])
      else if (type === '3f') gl.uniform3f(loc, v[0], v[1], v[2])
      else if (type === '4f') gl.uniform4f(loc, v[0], v[1], v[2], v[3])
      else if (type === '1i') gl.uniform1i(loc, v[0])
      else if (type === '2i') gl.uniform2i(loc, v[0], v[1])
      else if (type === '3i') gl.uniform3i(loc, v[0], v[1], v[2])
      else if (type === '4i') gl.uniform4i(loc, v[0], v[1], v[2], v[3])
      else if (type === '1fv') gl.uniform1fv(loc, v)
      else if (type === '2fv') gl.uniform2fv(loc, v)
      else if (type === '3fv') gl.uniform3fv(loc, v)
      else if (type === '4fv') gl.uniform4fv(loc, v)
      else if (type === '1iv') gl.uniform1iv(loc, v)
      else if (type === '2iv') gl.uniform2iv(loc, v)
      else if (type === '3iv') gl.uniform3iv(loc, v)
      else if (type === '4iv') gl.uniform4iv(loc, v)
    }
  }

  /**
   * @param {string} name
   * @param {number[]} data
   */
  addVertex(name, data) {
    this.#attrs[name]?.data.push(...data)
  }
}
