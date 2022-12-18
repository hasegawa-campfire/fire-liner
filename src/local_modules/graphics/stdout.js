import { WebGLManager } from './webgl-helper.js'

export class GraphicsStdout {
  glm

  /**
   * @param {WebGLManager} glm
   */
  constructor(glm) {
    this.glm = glm
  }

  begin() {
    const gl = this.glm.gl
    if (!gl) return

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  end() {
    const gl = this.glm.gl
    if (!gl) return

    gl.flush()
  }
}
