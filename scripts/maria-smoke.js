const fs = require('fs')
const path = require('path')

const projectRoot = process.cwd()

const requiredFiles = [
  'src/stores/maria-character-store.ts',
  'src/components/maria/maria-floating-widget.tsx',
  'src/components/maria/maria-character-renderer.tsx',
  'src/lib/maria-tts.ts',
  'src/lib/maria-lipsync.ts',
  'src/lib/maria-emotion-map.ts',
]

const envFile = path.join(projectRoot, '.env.local')

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf8')
  return content.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return acc
    const [key, ...rest] = trimmed.split('=')
    acc[key] = rest.join('=')
    return acc
  }, {})
}

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(projectRoot, file)))
const env = readEnv(envFile)

const flagDefaults = {
  NEXT_PUBLIC_MARIA_WIDGET_ENABLED: env.NEXT_PUBLIC_MARIA_WIDGET_ENABLED || '(default: true)',
  NEXT_PUBLIC_MARIA_TTS_ENABLED: env.NEXT_PUBLIC_MARIA_TTS_ENABLED || '(default: true)',
  NEXT_PUBLIC_MARIA_LIPSYNC_ENABLED: env.NEXT_PUBLIC_MARIA_LIPSYNC_ENABLED || '(default: true)',
}

if (missingFiles.length > 0) {
  console.error('Maria smoke check failed. Missing files:')
  for (const file of missingFiles) console.error(`- ${file}`)
  process.exit(1)
}

console.log('Maria smoke check passed.')
console.log('Feature flag status:')
for (const [key, value] of Object.entries(flagDefaults)) {
  console.log(`- ${key}=${value}`)
}
