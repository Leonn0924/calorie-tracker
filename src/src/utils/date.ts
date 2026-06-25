import { format, parseISO, isToday, isThisWeek, isThisMonth, startOfWeek, endOfWeek, eachDayOfInterval, subDays, addDays as addDaysFns } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

/**
 * 解析日期字符串为 Date 对象
 */
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr)
}

/**
 * 日期增加天数
 */
export function addDays(date: Date, days: number): Date {
  return addDaysFns(date, days)
}

/**
 * 格式化日期为 MM-DD（不含年份）
 */
export function formatDateMD(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MM-dd')
}

/**
 * 格式化日期为中文显示 (如：6月23日)
 */
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'M月d日', { locale: zhCN })
}

/**
 * 格式化日期为短格式 (如：23日)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd日', { locale: zhCN })
}

/**
 * 获取今天的日期字符串
 */
export function getToday(): string {
  return formatDate(new Date())
}

/**
 * 判断是否是今天
 */
export function isDateToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isToday(d)
}

/**
 * 判断是否在本周
 */
export function isDateThisWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isThisWeek(d, { weekStartsOn: 1 })
}

/**
 * 判断是否在本月
 */
export function isDateThisMonth(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isThisMonth(d)
}

/**
 * 获取本周日期范围（周一到周日）
 */
export function getThisWeekDates(): string[] {
  const today = new Date()
  const start = startOfWeek(today, { weekStartsOn: 1 })
  const end = endOfWeek(today, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })
  return days.map(d => formatDate(d))
}

/**
 * 获取最近 N 天的日期
 */
export function getRecentDates(days: number): string[] {
  const today = new Date()
  const result = []
  for (let i = 0; i < days; i++) {
    result.push(formatDate(subDays(today, i)))
  }
  return result.reverse()
}

/**
 * 获取最近 N 天（别名）
 */
export function getRecentDays(days: number): string[] {
  return getRecentDates(days)
}

/**
 * 获取某月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 获取某月第一天是星期几（0=周日，1=周一，...6=周六）
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/**
 * 格式化时间戳为时间字符串 (如：08:30)
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

/**
 * 根据时间推断餐别
 */
export function inferMealType(date: Date | string): '早餐' | '午餐' | '晚餐' | '加餐' {
  const d = typeof date === 'string' ? parseISO(date) : date
  const hour = d.getHours()

  if (hour >= 0 && hour <= 10) return '早餐'
  if (hour >= 11 && hour <= 13) return '午餐'
  if (hour >= 14 && hour <= 17) return '晚餐'
  return '加餐'
}