import { Activity, Clock3, MessageSquareText, Sparkles } from 'lucide-react'

export const dashboardStats = [
  { label: 'Prompts run', value: '1,284', change: '+12.8%', detail: 'vs. last month', icon: MessageSquareText, tone: 'cyan' },
  { label: 'Time saved', value: '36.5h', change: '+8.2%', detail: 'vs. last month', icon: Clock3, tone: 'purple' },
  { label: 'Active models', value: '08', change: 'All online', detail: 'across 4 providers', icon: Sparkles, tone: 'blue' },
  { label: 'Workspace activity', value: '92.4%', change: '+4.6%', detail: 'engagement score', icon: Activity, tone: 'green' },
]

export const activitySeries = {
  week: {
    label: 'This week', total: '1,284', delta: '+12.8%',
    points: [34, 47, 40, 63, 55, 78, 68, 92],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'],
  },
  month: {
    label: 'This month', total: '5,892', delta: '+18.3%',
    points: [28, 41, 36, 55, 48, 68, 61, 78],
    labels: ['Oct 1', 'Oct 5', 'Oct 9', 'Oct 13', 'Oct 17', 'Oct 21', 'Oct 25', 'Today'],
  },
}

export const recentPrompts = [
  { title: 'Summarize the Q3 product research findings', category: 'Research', model: 'Claude 3.5 Sonnet', time: '12 min ago', color: 'purple' },
  { title: 'Draft a launch email for our new workspace', category: 'Writing', model: 'GPT-4o', time: '48 min ago', color: 'cyan' },
  { title: 'Explain vector databases in simple terms', category: 'Learning', model: 'Gemini 2.5 Pro', time: '2 hours ago', color: 'blue' },
  { title: 'Create a project timeline for the redesign', category: 'Planning', model: 'GPT-4o', time: 'Yesterday', color: 'green' },
]

export const modelStatuses = [
  { name: 'GPT-4o', provider: 'OpenAI', latency: '420 ms', color: 'green' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', latency: '510 ms', color: 'green' },
  { name: 'Gemini 2.5 Pro', provider: 'Google', latency: '380 ms', color: 'green' },
]
