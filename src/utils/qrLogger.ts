import { ref } from 'vue'

interface QRLogEntry {
  type: 'create' | 'scan'
  data: string
  timestamp: number
  success: boolean
  metadata?: {
    format?: string
    error?: string
  }
}

class QRLogger {
  private static instance: QRLogger
  private logs = ref<QRLogEntry[]>([])

  private constructor() {}

  public static getInstance(): QRLogger {
    if (!QRLogger.instance) {
      QRLogger.instance = new QRLogger()
    }
    return QRLogger.instance
  }

  public logQREvent(entry: Omit<QRLogEntry, 'timestamp'>) {
    const logEntry: QRLogEntry = {
      ...entry,
      timestamp: Date.now()
    }
    this.logs.value.push(logEntry)
    this.persistLogs()
  }

  public getLogs() {
    return this.logs.value
  }

  public getStats() {
    const stats = {
      totalScans: 0,
      totalCreations: 0,
      successRate: 0,
      failureRate: 0
    }

    const logs = this.logs.value
    stats.totalScans = logs.filter((log) => log.type === 'scan').length
    stats.totalCreations = logs.filter((log) => log.type === 'create').length

    const successfulOperations = logs.filter((log) => log.success).length
    stats.successRate = (successfulOperations / logs.length) * 100 || 0
    stats.failureRate = 100 - stats.successRate

    return stats
  }

  private persistLogs() {
    try {
      localStorage.setItem('qr_logs', JSON.stringify(this.logs.value))
    } catch (error) {
      console.error('Failed to persist QR logs:', error)
    }
  }

  public loadLogs() {
    try {
      const savedLogs = localStorage.getItem('qr_logs')
      if (savedLogs) {
        this.logs.value = JSON.parse(savedLogs)
      }
    } catch (error) {
      console.error('Failed to load QR logs:', error)
    }
  }
}

export const qrLogger = QRLogger.getInstance()
