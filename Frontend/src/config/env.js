export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'NexaChat',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API !== 'false',
}

export const STARTER_PROMPTS = [
  {
    id: 'explain',
    title: 'Explain a concept',
    prompt: 'Explain how Retrieval-Augmented Generation (RAG) works in simple terms.',
  },
  {
    id: 'code',
    title: 'Debug or write code',
    prompt: 'Write a clean Python FastAPI endpoint for streaming chatbot responses.',
  },
  {
    id: 'brainstorm',
    title: 'Brainstorm project ideas',
    prompt: 'Suggest 5 practical features to make a college chatbot project stand out.',
  },
  {
    id: 'summarize',
    title: 'Draft a project summary',
    prompt: 'Help me write a concise abstract for an AI chatbot web application.',
  },
]
