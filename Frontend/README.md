# NexaChat Frontend

Modular React + Vite frontend for the AI Chatbot project.

## Project Structure

```text
Frontend/
├── .env.example                 # Environment template
├── index.html                   # HTML shell
├── vite.config.js               # Vite config & `@/` alias
└── src/
    ├── main.jsx                 # React mount & global CSS
    ├── App.jsx                  # Context provider & page shell
    ├── config/
    │   └── env.js               # Environment settings & starter prompts
    ├── context/
    │   ├── chatContextInstance.js # Context instance
    │   └── ChatContext.jsx        # Conversations, active chat, theme & messaging state
    ├── hooks/
    │   ├── useAutoScroll.js     # Scrolls chat viewport on new messages
    │   ├── useChat.js           # ChatContext consumer hook
    │   └── useLocalStorage.js   # Persistent state hook
    ├── layouts/
    │   ├── MainLayout.jsx       # Responsive sidebar + main workspace shell
    │   └── MainLayout.css
    ├── pages/
    │   └── ChatPage.jsx         # Main chat workspace page
    ├── services/
    │   ├── apiClient.js         # Fetch wrapper with normalized ApiError
    │   └── chatService.js       # Backend `/chat` client + local mock fallback
    ├── styles/
    │   ├── variables.css        # Light & dark theme design tokens
    │   └── global.css           # Base resets & scrollbars
    ├── utils/
    │   ├── formatters.js        # ID generation, time formatting, chat title helper
    │   └── storageKeys.js       # localStorage key constants
    └── components/
        ├── common/
        │   ├── Icons.jsx        # Inline SVG icon library
        │   └── ThemeToggle.jsx  # Light/dark theme switcher
        ├── sidebar/
        │   ├── Sidebar.jsx      # Chat history, search, new/delete/clear actions
        │   └── Sidebar.css
        └── chat/
            ├── ChatHeader.jsx   # Active chat title, mobile menu, theme toggle
            ├── ChatWindow.jsx   # Empty state, starter prompts, message list, errors
            ├── MessageBubble.jsx# Formatted messages, code blocks, copy button
            ├── ChatInput.jsx    # Auto-resizing prompt box with send/stop controls
            └── Chat.css
```

## Scripts

```powershell
npm run dev      # Start Vite dev server
npm run lint     # Run oxlint checks
npm run build    # Build production bundle in dist/
npm run preview  # Preview production build
```

## Connecting a Backend Later

Copy `.env.example` to `.env` and set:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

`src/services/chatService.js` sends `POST /chat` with `{ conversation_id, message, history }` and expects `{ reply }` in JSON.
