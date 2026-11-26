import { useRef, useState } from 'react'
import { SendIcon, StopIcon } from '@/components/common/Icons'
import { ENV } from '@/config/env'
import { useChat } from '@/hooks/useChat'

export function ChatInput() {
  const { isSending, sendMessage, stopGenerating } = useChat()
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  function resizeTextarea(element) {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 160)}px`
  }

  function handleChange(e) {
    setText(e.target.value)
    resizeTextarea(e.target)
  }

  async function submitPrompt() {
    const trimmed = text.trim()
    if (!trimmed || isSending) return
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    await sendMessage(trimmed)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitPrompt()
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (isSending) {
      stopGenerating()
      return
    }
    submitPrompt()
  }

  const canSend = text.trim().length > 0

  return (
    <div className="chat-input-wrapper">
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          rows={1}
          placeholder={`Message ${ENV.APP_NAME}...`}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Chat message input"
        />

        {isSending ? (
          <button
            type="submit"
            className="chat-send-btn chat-send-btn--stop"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <StopIcon size={16} />
          </button>
        ) : (
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!canSend}
            aria-label="Send message"
            title="Send message"
          >
            <SendIcon size={17} />
          </button>
        )}
      </form>

      <p className="chat-input-hint">
        Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for a new line.
      </p>
    </div>
  )
}
