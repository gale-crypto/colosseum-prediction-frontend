import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MarketsPage from './pages/MarketsPage'
import MarketDetailPage from './pages/MarketDetailPage'
import LeaderboardPage from './pages/LeaderboardPage'
import EarnPage from './pages/EarnPage'
import NewsPage from './pages/NewsPage'
import UserProfilePage from './pages/UserProfilePage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'
import CreateMarketPage from './pages/CreateMarketPage'
import { createAppKit } from '@reown/appkit/react'
import { metadata, networks, projectId, solanaWeb3JsAdapter } from './config'
import { solana } from '@reown/appkit/networks'

createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId,
  networks: networks,
  defaultNetwork: solana,
  metadata: metadata,
  features: {
    analytics: true
  }
})

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MarketsPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/markets/:id" element={<MarketDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* <Route path="/admin" element={<AdminPage />} /> */}
          <Route path="/create-market" element={<CreateMarketPage />} />
          <Route path="/admin/markets/new" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
