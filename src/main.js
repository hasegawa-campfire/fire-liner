import { g, screen } from '@/r.js'

const offScreenShaders = {
  vertex: `#version 300 es
in vec2 position;
in vec3 textureCoord;
out vec3 vTextureCoord;

uniform vec2 resolution;
uniform float flipY;

void main() {
  vTextureCoord = textureCoord;
  vec2 clipSpace = (position / resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, flipY), 0, 1);
}
`,
  fragment: `#version 300 es
precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray textureArray;

in vec3 vTextureCoord;
out vec4 outColor;

void main() {
  outColor = texture(textureArray, vTextureCoord);
}
`,
}

const onScreenShaders = {
  vertex: `#version 300 es
in vec2 position;
in vec3 textureCoord;
out vec3 vTextureCoord;

uniform vec2 resolution;
uniform float flipY;

void main() {
  vTextureCoord = textureCoord;
  vec2 clipSpace = (position / resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, flipY), 0, 1);
}
`,
  fragment: `#version 300 es
precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray textureArray;

in vec3 vTextureCoord;
out vec4 outColor;

void main() {
  outColor = texture(textureArray, vTextureCoord);
}
`,
}

const offScreenProgram = g.program.create({
  shaders: offScreenShaders,
  attrs: {
    position: 2,
    textureCoord: 3,
  },
  uniforms: {
    resolution: '2f',
    flipY: '1f',
    textureArray: '1i',
  },
})

const onScreenProgram = g.program.create({
  shaders: onScreenShaders,
  attrs: {
    position: 2,
    textureCoord: 3,
  },
  uniforms: {
    resolution: '2f',
    flipY: '1f',
    textureArray: '1i',
  },
})

const offScreen = g.offScreen.create(screen.width, screen.height)

function main() {
  requestAnimationFrame(main)

  offScreen.begin()
  offScreenProgram.begin()
  offScreenProgram.setUniforms({
    resolution: [offScreen.width, offScreen.height],
    flipY: [1],
    textureArray: [0],
  })

  g.drawRect(0, 0, screen.width, screen.height, '#000')

  offScreenProgram.end()
  offScreen.end()

  g.stdout.begin()
  onScreenProgram.begin()
  onScreenProgram.setUniforms({
    resolution: [offScreen.width, offScreen.height],
    flipY: [-1],
    textureArray: [0],
  })
  g.drawImage(offScreen)
  onScreenProgram.end()
  g.stdout.end()
}

requestAnimationFrame(main)
screen.canvas.hidden = false
