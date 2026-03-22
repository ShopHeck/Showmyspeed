export type TestPhase =
  | 'idle'
  | 'ping'
  | 'download'
  | 'upload'
  | 'complete'
  | 'error'

export interface TestResult {
  id: string
  timestamp: number
  download: number   // Mbps
  upload: number     // Mbps
  ping: number       // ms
  jitter: number     // ms
  isp?: string
  ip?: string
  city?: string
  country?: string
}

export interface LiveMetrics {
  ping: number
  jitter: number
  download: number
  upload: number
}

export interface IpInfo {
  ip: string
  isp: string
  city: string
  country: string
  org: string
}

export interface UseCaseGrade {
  label: string
  icon: string
  pass: boolean
  reason: string
}
