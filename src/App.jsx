import { useState } from 'react'
import AppLayout from './components/layout/AppLayout.jsx'
import WorkspacePlaceholder from './components/layout/WorkspacePlaceholder.jsx'
import DashboardHero from './components/dashboard/DashboardHero.jsx'
import ChatPage from './components/chat/ChatPage.jsx'
import ModelsPage from './pages/ModelsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import { SettingsPreferencesProvider } from './hooks/useSettingsPreferences.js'

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  return (
    <SettingsPreferencesProvider>
      <AppLayout activePage={activePage} onNavigate={setActivePage}>
        {activePage === 'Dashboard' ? <DashboardHero onNavigate={setActivePage} />
          : activePage === 'AI Chat' ? <ChatPage />
            : activePage === 'Models' ? <ModelsPage />
              : activePage === 'Analytics' ? <AnalyticsPage />
                : activePage === 'Settings' ? <SettingsPage />
                  : <WorkspacePlaceholder page={activePage} />}
      </AppLayout>
    </SettingsPreferencesProvider>
  )
}
