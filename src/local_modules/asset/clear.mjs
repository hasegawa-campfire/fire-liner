import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const binPath = fileURLToPath(new URL('./data.bin', import.meta.url))
const jsPath = fileURLToPath(new URL('./data.js', import.meta.url))

await writeFile(binPath, '.')
await writeFile(jsPath, `export default {}`)
