import { AudioLines, BrainCircuit, Code2, Image, MessageSquareText, ShieldCheck, Sparkles, Zap } from 'lucide-react'

export const aiModels = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'A versatile model for fast, capable reasoning across text, code, and images.', context: '128K context', latency: '420 ms', category: 'General', icon: Sparkles, color: 'cyan', capabilities: ['Reasoning', 'Vision', 'Code'] },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Thoughtful analysis and natural writing for complex tasks and long documents.', context: '200K context', latency: '510 ms', category: 'Reasoning', icon: BrainCircuit, color: 'purple', capabilities: ['Analysis', 'Writing', 'Long context'] },
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', provider: 'Google', description: 'Multimodal intelligence built for research, synthesis, and creative exploration.', context: '1M context', latency: '380 ms', category: 'Reasoning', icon: AudioLines, color: 'blue', capabilities: ['Multimodal', 'Research', 'Long context'] },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', description: 'A lightweight assistant for quick answers and everyday productivity.', context: '128K context', latency: '210 ms', category: 'General', icon: Zap, color: 'green', capabilities: ['Fast', 'Summaries', 'Everyday'] },
  { id: 'dall-e', name: 'DALL·E 3', provider: 'OpenAI', description: 'Turn detailed creative direction into polished visual concepts.', context: 'Image model', latency: '2.4 sec', category: 'Creative', icon: Image, color: 'pink', capabilities: ['Image generation', 'Creative'] },
  { id: 'code-assistant', name: 'Code Assistant', provider: 'NEXUS', description: 'A focused coding companion for explaining, drafting, and reviewing code.', context: '64K context', latency: '340 ms', category: 'Code', icon: Code2, color: 'amber', capabilities: ['Code', 'Debugging', 'Docs'] },
]

export const analyticsWindows = {
  '7 days': { total: '2,481', change: '+14.2%', prompts: [32, 44, 39, 67, 56, 81, 70, 96], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'], average: '354' },
  '30 days': { total: '9,742', change: '+21.6%', prompts: [26, 38, 33, 48, 45, 69, 62, 90], labels: ['Oct 3', 'Oct 7', 'Oct 11', 'Oct 15', 'Oct 19', 'Oct 23', 'Oct 27', 'Today'], average: '325' },
  '90 days': { total: '26,804', change: '+18.9%', prompts: [22, 31, 46, 39, 60, 54, 76, 88], labels: ['Aug 1', 'Aug 13', 'Aug 25', 'Sep 6', 'Sep 18', 'Sep 30', 'Oct 12', 'Today'], average: '298' },
}

export const analyticsModels = [
  { name: 'GPT-4o', share: 38, color: '#22D3EE', prompts: '3,701' },
  { name: 'Claude 3.5 Sonnet', share: 29, color: '#8B5CF6', prompts: '2,825' },
  { name: 'Gemini 2.5 Pro', share: 21, color: '#818CF8', prompts: '2,046' },
  { name: 'Other models', share: 12, color: '#34D399', prompts: '1,170' },
]

export const settingsDefaults = {
  profile: { name: 'Alex Morgan', email: 'alex.morgan@nexus.ai' },
  appearance: 'midnight',
  notifications: { product: true, activity: true, tips: false },
  general: { compact: false, enterToSend: true, language: 'English (US)' },
}
