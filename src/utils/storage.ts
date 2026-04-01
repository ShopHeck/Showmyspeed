import type { TestResult } from '../types'

const KEY = 'showmyspeed_history'
const MAX = 50

function trimSamples(r: TestResult): TestResult {
  const trim = (arr: Array<{ t: number; mbps: number }> | undefined) => {
    if (!arr || arr.length <= 30) return arr
    return arr.filter((_, i) => i % 2 === 0)  // keep every other point
  }
  return { ...r, downloadSamples: trim(r.downloadSamples), uploadSamples: trim(r.uploadSamples) }
}

export function saveResult(result: TestResult): void {
  const history = loadHistory()
  history.unshift(trimSamples(result))
  if (history.length > MAX) history.splice(MAX)
  try {
    localStorage.setItem(KEY, JSON.stringify(history))
  } catch {
    // storage full — drop oldest
  }
}

export function loadHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as TestResult[]
  } catch {
    return []
  }
}

export function clearHistory(): void {
  localStorage.removeItem(KEY)
}
