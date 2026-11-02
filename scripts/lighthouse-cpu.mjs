// Calibrates Lighthouse's mobile CPU throttling to the machine it runs on (the user's decision,
// 02.11.2026). GitHub's runners differ: the same build scored performance 0.93 on one with a
// benchmark index of ~4,050 and 0.88 on one at ~2,800. Lighthouse emulates a phone by slowing the
// host's CPU by a fixed factor, so a slower host emulates a slower phone. This runs Lighthouse's
// own benchmark (computeBenchmarkIndex) in Chrome three times, takes the median and scales the
// factor to it: 4× on a 4,000 machine (where the budgets were set), 2.8× on a 2,800 one, so every
// run emulates the same phone. Written to lighthouse-reports/cpu.json for lighthouserc.cjs.
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const require = createRequire(import.meta.url)
const lhci = require.resolve('@lhci/cli/package.json')
const lighthouseDir = require
  .resolve('lighthouse/package.json', { paths: [lhci] })
  .replace(/package\.json$/, '')
const { pageFunctions } = await import(
  pathToFileURL(`${lighthouseDir}core/lib/page-functions.js`).href
)
const chromePath = require(
  require.resolve('chrome-launcher', { paths: [lhci] }),
).Launcher.getInstallations()[0]

/** The benchmark index at which the budgets were set, with Lighthouse's default 4× slowdown. */
const reference = 4000

const browser = await puppeteer.launch({ executablePath: chromePath, headless: true })
const page = await browser.newPage()
const runs = []
for (let i = 0; i < 3; i++) {
  runs.push(await page.evaluate(`(${pageFunctions.computeBenchmarkIndex.toString()})()`))
}
await browser.close()

const benchmarkIndex = Math.round([...runs].sort((a, b) => a - b)[1])
const multiplier = Math.min(
  6,
  Math.max(2, Math.round((4 * benchmarkIndex * 100) / reference) / 100),
)
await mkdir('lighthouse-reports', { recursive: true })
await writeFile(
  'lighthouse-reports/cpu.json',
  `${JSON.stringify({ benchmarkIndex, runs, multiplier }, null, 2)}\n`,
)
console.log(`CPU benchmark index ${benchmarkIndex} (${runs.join(', ')}): ${multiplier}× slowdown`)
