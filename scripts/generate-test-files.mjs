/**
 * Generates binary test files for the speed test.
 * Files use random bytes (non-compressible) so CDN/browser compression
 * doesn't skew measured speeds.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { randomBytes } from 'crypto'

const PUBLIC_DIR = new URL('../public/speedtest', import.meta.url).pathname

mkdirSync(PUBLIC_DIR, { recursive: true })

const files = [
  { name: 'ping.bin', size: 1024 },                 // 1 KB — robust ping target
  { name: '1mb.bin', size: 1024 * 1024 },           // 1 MB
  { name: '10mb.bin', size: 10 * 1024 * 1024 },     // 10 MB
]

for (const { name, size } of files) {
  const path = `${PUBLIC_DIR}/${name}`
  writeFileSync(path, randomBytes(size))
  console.log(`  generated public/speedtest/${name} (${(size / 1024).toFixed(0)} KB)`)
}

console.log('Speed test files ready.')
