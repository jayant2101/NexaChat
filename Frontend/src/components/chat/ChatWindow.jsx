import { CloseIcon, NexaLogo } from '@/components/common/Icons'
import { ENV, STARTER_PROMPTS } from '@/config/env'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { useChat } from '@/hooks/useChat'
import { MessageBubble } from './MessageBubble'

export function ChatWindow() {
  const { activeConversation, isSending, error, clearError, sendMessage } = useChat()
  const messages = activeConversation?.messages ?? []
  const lastMessage = messages[messages.length - 1]
  const scrollAnchorRef = useAutoScroll(
    `${messages.length}-${lastMessage?.content?.length ?? 0}-${isSending}`,
  )

  return (
    <section className="chat-window" aria-label="Chat messages">
      <div className="chat-window__inner">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">
              <NexaLogo size={30} />
            </div>
            <h2 className="empty-state__title">Welcome to {ENV.APP_NAME}</h2>
            <p className="empty-state__subtitle">
              Start a conversation below or pick one of the starter prompts.
            </p>

            <div className="starter-grid">
              {STARTER_PROMPTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="starter-card"
                  onClick={() => sendMessage(item.prompt)}
                  disabled={isSending}
                >
                  <span className="starter-card__title">{item.title}</span>
                  <span className="starter-card__prompt">{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isSending && lastMessage?.role !== 'assistant' && (
              <div className="message message--assistant" aria-live="polite">
                <div className="message__avatar" aria-hidden="true">
                  <NexaLogo size={20} />
                </div>
                <div className="message__card message__card--typing">
                  <span className="typing-dots" aria-label="Assistant is typing">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="chat-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="chat-error__dismiss"
              onClick={clearError}
              aria-label="Dismiss error"
            >
              <CloseIcon size={15} />
            </button>
          </div>
        )}

        <div ref={scrollAnchorRef} />
      </div>
    </section>
  )
}
