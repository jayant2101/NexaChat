import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChatContext } from '@/context/chatContextInstance'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { streamChatMessage } from '@/services/chatService'
import { createId, deriveChatTitle } from '@/utils/formatters'
import { STORAGE_KEYS } from '@/utils/storageKeys'

function createEmptyConversation() {
  const now = new Date().toISOString()
  return {
    id: createId('chat'),
    title: 'New Chat',
    createdAt: now,
    updatedAt: now,
    messages: [],
  }
}

function getInitialTheme() {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useLocalStorage(STORAGE_KEYS.CONVERSATIONS, () => [
    createEmptyConversation(),
  ])
  const [activeChatId, setActiveChatId] = useLocalStorage(
    STORAGE_KEYS.ACTIVE_CHAT_ID,
    () => conversations[0]?.id ?? null,
  )
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, getInitialTheme)

  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (conversations.length === 0) {
      const fresh = createEmptyConversation()
      setConversations([fresh])
      setActiveChatId(fresh.id)
      return
    }
    const exists = conversations.some((c) => c.id === activeChatId)
    if (!exists) {
      setActiveChatId(conversations[0].id)
    }
  }, [conversations, activeChatId, setConversations, setActiveChatId])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeChatId) ?? conversations[0] ?? null,
    [conversations, activeChatId],
  )

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  const stopGenerating = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setIsSending(false)
  }, [])

  const createNewChat = useCallback(() => {
    stopGenerating()
    setError(null)
    const emptyExisting = conversations.find((c) => c.messages.length === 0)
    if (emptyExisting) {
      setActiveChatId(emptyExisting.id)
      setIsSidebarOpen(false)
      return
    }
    const fresh = createEmptyConversation()
    setConversations((prev) => [fresh, ...prev])
    setActiveChatId(fresh.id)
    setIsSidebarOpen(false)
  }, [conversations, setActiveChatId, setConversations, stopGenerating])

  const selectChat = useCallback(
    (chatId) => {
      stopGenerating()
      setError(null)
      setActiveChatId(chatId)
      setIsSidebarOpen(false)
    },
    [setActiveChatId, stopGenerating],
  )

  const deleteChat = useCallback(
    (chatId) => {
      if (chatId === activeChatId) {
        stopGenerating()
      }
      setError(null)
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== chatId)
        if (remaining.length === 0) {
          const fresh = createEmptyConversation()
          setActiveChatId(fresh.id)
          return [fresh]
        }
        if (chatId === activeChatId) {
          setActiveChatId(remaining[0].id)
        }
        return remaining
      })
    },
    [activeChatId, setActiveChatId, setConversations, stopGenerating],
  )

  const clearAllChats = useCallback(() => {
    stopGenerating()
    setError(null)
    const fresh = createEmptyConversation()
    setConversations([fresh])
    setActiveChatId(fresh.id)
    setIsSidebarOpen(false)
  }, [setActiveChatId, setConversations, stopGenerating])

  const sendMessage = useCallback(
    async (rawText) => {
      const content = rawText.trim()
      if (!content || isSending || !activeConversation) return

      const targetChatId = activeConversation.id
      const now = new Date().toISOString()
      const userMessage = {
        id: createId('msg'),
        role: 'user',
        content,
        createdAt: now,
      }

      const historyBeforeSend = activeConversation.messages
      setError(null)
      setIsSending(true)

      setConversations((prev) =>
        prev.map((chat) => {
          if (chat.id !== targetChatId) return chat
          const isFirstMessage = chat.messages.length === 0
          return {
            ...chat,
            title: isFirstMessage ? deriveChatTitle(content) : chat.title,
            updatedAt: now,
            messages: [...chat.messages, userMessage],
          }
        }),
      )

      const controller = new AbortController()
      abortControllerRef.current = controller
      const assistantMessageId = createId('msg')
      let receivedDelta = false

      try {
        const result = await streamChatMessage({
          conversationId: targetChatId,
          message: content,
          history: historyBeforeSend,
          signal: controller.signal,
          onDelta: (delta) => {
            receivedDelta = true
            const chunkTime = new Date().toISOString()
            setConversations((prev) =>
              prev.map((chat) => {
                if (chat.id !== targetChatId) return chat
                const exists = chat.messages.some((msg) => msg.id === assistantMessageId)
                if (!exists) {
                  return {
                    ...chat,
                    updatedAt: chunkTime,
                    messages: [
                      ...chat.messages,
                      {
                        id: assistantMessageId,
                        role: 'assistant',
                        content: delta,
                        createdAt: chunkTime,
                      },
                    ],
                  }
                }
                return {
                  ...chat,
                  updatedAt: chunkTime,
                  messages: chat.messages.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: `${msg.content}${delta}` }
                      : msg,
                  ),
                }
              }),
            )
          },
        })

        if (!receivedDelta) {
          const replyTime = new Date().toISOString()
          const assistantMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: result.reply || 'No response received.',
            createdAt: replyTime,
          }

          setConversations((prev) =>
            prev.map((chat) => {
              if (chat.id !== targetChatId) return chat
              if (chat.messages.some((msg) => msg.id === assistantMessageId)) return chat
              return {
                ...chat,
                updatedAt: replyTime,
                messages: [...chat.messages, assistantMessage],
              }
            }),
          )
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Unable to get a response. Please try again.')
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }
        setIsSending(false)
      }
    },
    [activeConversation, isSending, setConversations],
  )

  const value = useMemo(
    () => ({
      conversations,
      activeConversation,
      activeChatId: activeConversation?.id ?? null,
      isSending,
      error,
      theme,
      isSidebarOpen,
      setIsSidebarOpen,
      toggleTheme,
      createNewChat,
      selectChat,
      deleteChat,
      clearAllChats,
      sendMessage,
      stopGenerating,
      clearError: () => setError(null),
    }),
    [
      conversations,
      activeConversation,
      isSending,
      error,
      theme,
      isSidebarOpen,
      toggleTheme,
      createNewChat,
      selectChat,
      deleteChat,
      clearAllChats,
      sendMessage,
      stopGenerating,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
