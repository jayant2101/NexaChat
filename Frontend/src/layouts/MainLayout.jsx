import { useChat } from '@/hooks/useChat'
import './MainLayout.css'

export function MainLayout({ sidebar, children }) {
  const { isSidebarOpen, setIsSidebarOpen } = useChat()

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <div
          className="app-layout__backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      {sidebar}
      <main className="app-layout__main">{children}</main>
    </div>
  )
}
