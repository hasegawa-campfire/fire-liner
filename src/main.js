import { Tween } from './local_modules/tween.js'
import { audioReady } from '@local_modules/audio.js'
import { g, mainLoop, pointer, pref, screen, store } from '@/r.js'
import { Dialog } from '@/ui/dialog.js'
import { SceneTitle } from '@/scenes/title/index.js'
import { SceneLevels } from '@/scenes/levels/index.js'
import { ScenePlay } from '@/scenes/play/index.js'
import { SceneRanking } from '@/scenes/ranking/index.js'
import { SceneTips } from '@/scenes/tips/index.js'
import { playAudioBgm, setAudioMute, stopAudioSe } from '@/helper.js'
import { themeCount } from '@/data/theme.js'

const offScreenShaders = {
  vertex: `#version 300 es
in vec2 position;
in vec3 textureCoord;
in float luminance;
out vec3 vTextureCoord;
out float vLuminance;

uniform vec2 resolution;
uniform float flipY;

void main() {
  vTextureCoord = textureCoord;
  vLuminance = luminance;
  vec2 clipSpace = (position / resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, flipY), 0, 1);
}
`,
  fragment: `#version 300 es
precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray textureArray;
uniform sampler2D paletteTexture;
uniform float palettePattern;

in vec3 vTextureCoord;
in float vLuminance;
out vec4 outColor;

const vec3 grayScale = vec3(0.299, 0.587, 0.114);

void main() {
  vec4 textureColor = texture(textureArray, vTextureCoord);
  float gray = clamp(dot(textureColor.rgb, grayScale) + vLuminance, 0.0, 1.0);
  vec4 paletteColor = texture(paletteTexture, vec2(gray, palettePattern));
  outColor = vec4(paletteColor.rgb, textureColor.a);
}
`,
}

const onScreenShaders = {
  vertex: `#version 300 es
in vec2 position;
in vec3 textureCoord;
out vec2 vPosition;
out vec3 vTextureCoord;

uniform vec2 resolution;
uniform float flipY;

void main() {
  vPosition = position;
  vTextureCoord = textureCoord;
  vec2 clipSpace = (position / resolution) * 2.0 - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, flipY), 0, 1);
}
`,
  fragment: `#version 300 es
precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray textureArray;

in vec2 vPosition;
in vec3 vTextureCoord;
out vec4 outColor;

void main() {
  outColor = texture(textureArray, vTextureCoord);
  float x = mod(vPosition.x, 1.0);
  float y = mod(vPosition.y, 1.0);
  float edge = pow(max(x, y), 10.0);
  outColor.rgb += (1.0 - outColor.rgb) * edge * 0.6;
}
`,
}

const offScreenProgram = g.program.create({
  shaders: offScreenShaders,
  attrs: {
    position: 2,
    textureCoord: 3,
    luminance: 1,
  },
  uniforms: {
    resolution: '2f',
    flipY: '1f',
    textureArray: '1i',
    paletteTexture: '1i',
    palettePattern: '1f',
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

const fadeOut = Tween.from(0).to(4, 16)
const fadeIn = Tween.from(4).to(0, 16).start()

setAudioMute(pref.mute)
audioReady.then(stopAudioSe)

/**
 * @typedef Scene
 * @prop {() => void} update
 * @prop {import('@local_modules/audio.js').Audio } bgm
 */

/** @type {Record<string,new (...args: any[]) => Scene>} */
const sceneNames = {
  title: SceneTitle,
  ranking: SceneRanking,
  levels: SceneLevels,
  play: ScenePlay,
  tips: SceneTips,
}

/** @type {Scene} */
let scene = new SceneTitle()

function main() {
  offScreen.begin()
  offScreenProgram.begin()
  offScreenProgram.setUniforms({
    resolution: [offScreen.width, offScreen.height],
    flipY: [1],
    textureArray: [0],
    paletteTexture: [2],
    palettePattern: [(pref.theme + 0.5) / themeCount],
  })

  fadeOut.next()
  fadeIn.next()

  if (store.nextScene) {
    if (!fadeOut.started) {
      fadeOut.start()
    }
    if (fadeOut.onDone) {
      const [name, ...args] = store.nextScene
      store.nextScene = null
      const prevScene = scene
      scene = new sceneNames[name](...args)
      fadeOut.reset()
      fadeIn.start()
      if (prevScene.bgm !== scene.bgm) {
        prevScene.bgm.setVolume(0, 0.3)
      }
    }
  }

  if (fadeOut.running) {
    g.setAttr('luminance', [Math.ceil(fadeOut.value) / 3])
    pointer.disabled = true
  } else if (fadeIn.running) {
    g.setAttr('luminance', [Math.ceil(fadeIn.value) / 3])
    pointer.disabled = false
  } else {
    g.setAttr('luminance', [0])
    pointer.disabled = false
  }

  if (fadeIn.onDone) {
    playAudioBgm(scene.bgm)
  }

  pointer.update()
  Dialog.updateBegin()

  g.save()
  scene.update()
  g.restore()

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

  Dialog.updateEnd()
}

g.loadTexture(2, 'colors.png').then(() => {
  mainLoop.proc = main
  screen.canvas.hidden = false
})
