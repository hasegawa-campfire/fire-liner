import { readdir, readFile, writeFile } from 'fs/promises'
import { createWriteStream, WriteStream } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const binPath = fileURLToPath(new URL('./data.bin', import.meta.url))
const jsPath = fileURLToPath(new URL('./data.js', import.meta.url))

/**
 * @param {string} basePath
 * @param {string} path
 * @param {WriteStream} ws
 * @param {number} offset
 * @returns {Promise<[string, [number, number]][]>}
 */
async function find(basePath, path, ws, offset) {
  /** @type {[string, [number, number]][]} */
  const files = []

  for (const dir of await readdir(path, { withFileTypes: true })) {
    const dirPath = join(path, dir.name)

    if (dir.isDirectory()) {
      files.push(...(await find(basePath, dirPath, ws, offset)))
      const last = files.at(-1)
      if (last) offset = last[1][0] + last[1][1]
    } else {
      const file = await readFile(dirPath)
      ws.write(file)
      const key = dirPath.replace(/\\/g, '/').replace(`${basePath}/`, '')
      files.push([key, [offset, file.length]])
      offset += file.length
    }
  }

  return files
}

const outputPath = process.argv[2]
const outputBin = createWriteStream(binPath)
const files = await find(outputPath, outputPath, outputBin, 0)
outputBin.end()
const json = JSON.stringify(Object.fromEntries(files))
await writeFile(jsPath, `export default ${json}`)
