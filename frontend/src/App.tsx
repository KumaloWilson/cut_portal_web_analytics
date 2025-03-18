import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { QueryClient, QueryClientProvider } from "react-query"
import { SocketProvider } from "./contexts/SocketContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import Dashboard from "./pages/Dashboard"
import EventsPage from "./pages/EventsPage"
import StudentsPage from "./pages/StudentsPage"
import StudentDetailPage from "./pages/StudentDetailPage"
import SettingsPage from "./pages/SettingsPage"
import "./index.css"
import Layout from "./components/navigation/Layout"

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
      <ThemeProvider>
        <SocketProvider>
          <Router future={{ v7_startTransition: true }}>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="students/:studentId" element={<StudentDetailPage />} />
                {/* <Route path="modules" element={<ModulesPage />} />
                <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
                <Route path="faculties" element={<FacultiesPage />} /> */}
                <Route path="settings" element={<SettingsPage />} />
                {/* Add a catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

