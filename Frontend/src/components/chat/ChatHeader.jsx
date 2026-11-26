import { MenuIcon } from '@/components/common/Icons'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { ENV } from '@/config/env'
import { useChat } from '@/hooks/useChat'

export function ChatHeader() {
  const { activeConversation, setIsSidebarOpen } = useChat()

  return (
    <header className="chat-header">
      <div className="chat-header__left">
        <button
          type="button"
          className="icon-button chat-header__menu-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open conversation sidebar"
        >
          <MenuIcon size={20} />
        </button>

        <div className="chat-header__title-group">
          <h1 className="chat-header__title">{activeConversation?.title || 'New Chat'}</h1>
          <span className="chat-header__subtitle">
            {ENV.USE_MOCK_API ? 'Preview Mode' : 'Live Assistant'}
          </span>
        </div>
      </div>

      <div className="chat-header__right">
        <ThemeToggle />
      </div>
    </header>
  )
}
