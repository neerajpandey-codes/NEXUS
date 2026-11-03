export const initialConversations = [
  {
    id: 'conversation-research',
    title: 'Q3 product research summary',
    updated: '12 min ago',
    messages: [
      { id: 'research-u1', role: 'user', content: 'Summarize the key themes from our Q3 product research.' },
      { id: 'research-a1', role: 'assistant', content: 'The research points to three clear themes: teams want a faster way to find trusted information, they value tools that fit into their existing workflows, and they need more visibility into how AI generated its recommendations. A strong next step is to prioritize search quality and clearer source context.' },
      { id: 'research-u2', role: 'user', content: 'Which one should we prioritize first?' },
      { id: 'research-a2', role: 'assistant', content: 'Start with search quality. It supports the other two themes: better discovery reduces friction in existing workflows, and more relevant results make source context easier to understand.' },
    ],
  },
  {
    id: 'conversation-launch',
    title: 'Launch email for the new workspace',
    updated: 'Yesterday',
    messages: [
      { id: 'launch-u1', role: 'user', content: 'Help me outline a launch email for our new AI workspace.' },
      { id: 'launch-a1', role: 'assistant', content: 'A simple structure could be: open with the problem the workspace solves, introduce the unified AI experience, highlight two or three practical benefits, and close with a clear invitation to try it. Keep the tone confident and specific.' },
    ],
  },
  {
    id: 'conversation-learning',
    title: 'Vector databases, explained simply',
    updated: 'Oct 29',
    messages: [
      { id: 'learning-u1', role: 'user', content: 'Explain vector databases in simple terms.' },
      { id: 'learning-a1', role: 'assistant', content: 'Think of a vector database as a library that files ideas by meaning instead of only by exact words. When you ask a question, it can find notes that are conceptually related, even if they use different wording.' },
    ],
  },
]

export const suggestedPrompts = [
  'Help me organize my week',
  'Summarize a long document',
  'Brainstorm ideas for a project',
]
