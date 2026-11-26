import { useState } from 'react'
import { CheckIcon, CopyIcon, NexaLogo, UserIcon } from '@/components/common/Icons'
import { formatTime } from '@/utils/formatters'

function renderInlineFormatting(text, keyPrefix) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={key} className="message__inline-code">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function MessageContent({ content }) {
  const segments = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="message__body">
      {segments.map((segment, index) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const inner = segment.slice(3, -3)
          const newlineIndex = inner.indexOf('\n')
          const lang = newlineIndex !== -1 ? inner.slice(0, newlineIndex).trim() : ''
          const code = newlineIndex !== -1 ? inner.slice(newlineIndex + 1) : inner

          return (
            <pre key={`code-${index}`} className="message__code-block">
              {lang && <span className="message__code-lang">{lang}</span>}
              <code>{code.trimEnd()}</code>
            </pre>
          )
        }

        const trimmed = segment.trim()
        if (!trimmed) return null

        return trimmed.split(/\n{2,}/).map((paragraph, pIndex) => (
          <p key={`p-${index}-${pIndex}`} className="message__paragraph">
            {paragraph.split('\n').map((line, lIndex, lines) => (
              <span key={`l-${lIndex}`}>
                {renderInlineFormatting(line, `${index}-${pIndex}-${lIndex}`)}
                {lIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))
      })}
    </div>
  )
}

export function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <article className={`message ${isUser ? 'message--user' : 'message--assistant'}`}>
      <div className="message__avatar" aria-hidden="true">
        {isUser ? <UserIcon size={17} /> : <NexaLogo size={20} />}
      </div>

      <div className="message__card">
        <div className="message__meta">
          <span className="message__role">{isUser ? 'You' : 'Assistant'}</span>
          <span className="message__time">{formatTime(message.createdAt)}</span>
        </div>

        <MessageContent content={message.content} />

        {!isUser && (
          <div className="message__actions">
            <button
              type="button"
              className="message__copy-btn"
              onClick={handleCopy}
              aria-label="Copy message"
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
