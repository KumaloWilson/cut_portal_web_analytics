import type React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { QueryClient, QueryClientProvider } from "react-query"
import Dashboard from "./pages/Dashboard"
import EventsPage from "./pages/EventsPage"
import "./App.css"
import { Layout } from "lucide-react"
import { SocketProvider } from "./contexts/SocketContext"
import SettingsPage from "./pages/SettingsPage"
import UsersPage from "./pages/UsersPage"

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
})

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </QueryClientProvider>
  )
}

export default App

