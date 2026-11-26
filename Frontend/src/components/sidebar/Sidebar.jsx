import { useMemo, useState } from 'react'
import {
  CloseIcon,
  MessageSquareIcon,
  NexaLogo,
  PlusIcon,
  TrashIcon,
} from '@/components/common/Icons'
import { ENV } from '@/config/env'
import { useChat } from '@/hooks/useChat'
import './Sidebar.css'

export function Sidebar() {
  const {
    conversations,
    activeChatId,
    isSidebarOpen,
    setIsSidebarOpen,
    createNewChat,
    selectChat,
    deleteChat,
    clearAllChats,
  } = useChat()

  const [query, setQuery] = useState('')

  const filteredConversations = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return conversations
    return conversations.filter((chat) => chat.title.toLowerCase().includes(trimmed))
  }, [conversations, query])

  return (
    <aside
      className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}
      aria-label="Conversation history"
    >
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            <NexaLogo size={32} variant="badge" />
          </span>
          <span className="sidebar__brand-name">
            {ENV.APP_NAME === 'NexaChat' ? (
              <>
                <span>Nexa</span>
                <span style={{ fontWeight: 400, opacity: 0.85 }}>Chat</span>
              </>
            ) : (
              ENV.APP_NAME
            )}
          </span>
        </div>

        <button
          type="button"
          className="sidebar__close-btn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      <div className="sidebar__actions">
        <button type="button" className="sidebar__new-chat-btn" onClick={createNewChat}>
          <PlusIcon size={17} />
          <span>New Chat</span>
        </button>

        <input
          type="search"
          className="sidebar__search"
          placeholder="Search chats..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search conversations"
        />
      </div>

      <div className="sidebar__list" role="list">
        {filteredConversations.length === 0 ? (
          <p className="sidebar__empty">No matching conversations</p>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = chat.id === activeChatId
            return (
              <div
                key={chat.id}
                role="listitem"
                className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
              >
                <button
                  type="button"
                  className="sidebar__item-btn"
                  onClick={() => selectChat(chat.id)}
                  title={chat.title}
                >
                  <MessageSquareIcon size={15} className="sidebar__item-icon" />
                  <span className="sidebar__item-title">{chat.title}</span>
                </button>

                <button
                  type="button"
                  className="sidebar__delete-btn"
                  onClick={() => deleteChat(chat.id)}
                  aria-label={`Delete ${chat.title}`}
                  title="Delete chat"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            )
          })
        )}
      </div>

      <div className="sidebar__footer">
        <span className="sidebar__mode-badge">
          {ENV.USE_MOCK_API ? 'Frontend Mock Mode' : 'API Connected'}
        </span>

        {conversations.some((c) => c.messages.length > 0) && (
          <button type="button" className="sidebar__clear-btn" onClick={clearAllChats}>
            Clear all
          </button>
        )}
      </div>
    </aside>
  )
}
