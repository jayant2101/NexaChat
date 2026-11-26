import { ENV } from '@/config/env'
import { ApiError, apiFetch, apiRequest } from './apiClient'

const MOCK_DELAY_MS = 450

function waitWithSignal(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    function onAbort() {
      clearTimeout(timer)
      reject(new DOMException('Request aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function buildMockReply(userMessage) {
  return (
    `Preview response for: "${userMessage}"\n\n` +
    'Set `VITE_USE_MOCK_API=false` in `.env` to connect to the local Flask LLM backend.'
  )
}

function serializeChatBody({ conversationId, message, history }) {
  return {
    conversation_id: conversationId,
    message,
    history: history.map(({ role, content }) => ({ role, content })),
  }
}

/**
 * Send a non-streaming chat prompt.
 */
export async function sendChatMessage({ conversationId, message, history, signal }) {
  if (ENV.USE_MOCK_API) {
    await waitWithSignal(MOCK_DELAY_MS, signal)
    return {
      reply: buildMockReply(message),
      model: 'mock-assistant-v1',
    }
  }

  const data = await apiRequest('/chat', {
    method: 'POST',
    body: serializeChatBody({ conversationId, message, history }),
    signal,
  })

  return {
    reply: data.reply ?? data.message ?? '',
    model: data.model ?? 'local-llm',
  }
}

/**
 * Stream chat tokens over Server-Sent Events (`POST /api/chat/stream`).
 */
export async function streamChatMessage({ conversationId, message, history, signal, onDelta }) {
  if (ENV.USE_MOCK_API) {
    await waitWithSignal(MOCK_DELAY_MS, signal)
    const reply = buildMockReply(message)
    onDelta?.(reply)
    return { reply, model: 'mock-assistant-v1' }
  }

  const response = await apiFetch('/chat/stream', {
    method: 'POST',
    body: serializeChatBody({ conversationId, message, history }),
    signal,
  })

  if (!response.body) {
    return sendChatMessage({ conversationId, message, history, signal })
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullReply = ''
  let model = 'local-llm'

  const processEventChunk = (eventChunk) => {
    for (const line of eventChunk.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue
      const rawJson = line.slice(5).trim()
      if (!rawJson) continue

      let payload
      try {
        payload = JSON.parse(rawJson)
      } catch {
        continue
      }

      if (payload.error) {
        throw new ApiError(payload.error, 500)
      }
      if (payload.delta) {
        fullReply += payload.delta
        onDelta?.(payload.delta)
      }
      if (payload.model) {
        model = payload.model
      }
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      buffer += decoder.decode()
      if (buffer.trim()) {
        processEventChunk(buffer)
      }
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split(/\r?\n\r?\n/)
    buffer = events.pop() ?? ''

    for (const eventChunk of events) {
      processEventChunk(eventChunk)
    }
  }

  return { reply: fullReply, model }
}
