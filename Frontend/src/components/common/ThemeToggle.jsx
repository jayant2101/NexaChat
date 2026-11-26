import { MoonIcon, SunIcon } from '@/components/common/Icons'
import { useChat } from '@/hooks/useChat'

export function ThemeToggle() {
  const { theme, toggleTheme } = useChat()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="icon-button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  )
}
