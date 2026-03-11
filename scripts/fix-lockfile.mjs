import { execSync } from 'child_process'

try {
  console.log('Running pnpm install to update lockfile...')
  const output = execSync('pnpm install --no-frozen-lockfile', {
    cwd: '/vercel/share/v0-project',
    stdio: 'pipe',
    encoding: 'utf-8',
  })
  console.log(output)
  console.log('Lockfile updated successfully.')
} catch (err) {
  console.error('Error:', err.stderr || err.message)
  process.exit(1)
}
