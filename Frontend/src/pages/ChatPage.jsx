import '@/components/chat/Chat.css'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MainLayout } from '@/layouts/MainLayout'

export function ChatPage() {
  return (
    <MainLayout sidebar={<Sidebar />}>
      <ChatHeader />
      <ChatWindow />
      <ChatInput />
    </MainLayout>
  )
}
