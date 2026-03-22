import type { TestResult } from '../types'

const KEY = 'showmyspeed_history'
const MAX = 50

export function saveResult(result: TestResult): void {
  const history = loadHistory()
  history.unshift(result)
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
