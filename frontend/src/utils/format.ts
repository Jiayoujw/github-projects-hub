export function fmtNum(n: number | undefined | null): string {
  if (n == null) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export function timeAgo(dateStr: string | undefined | null): string {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return '刚刚'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`
  return `${Math.floor(months / 12)} 年前`
}

const usageScenarioMap: Record<string, string> = {
  learning: '学习', personal: '个人', team: '团队', enterprise: '企业', opensource: '开源',
}

export function usageLabel(v: string): string {
  return usageScenarioMap[v] || v
}

export function scenarioType(v: string): string {
  const map: Record<string, string> = { learning: 'info', personal: '', team: 'warning', enterprise: 'danger', opensource: 'success' }
  return map[v] || 'info'
}

export const techColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
