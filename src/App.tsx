import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import TravelRecord from './pages/TravelRecord'
import CampusMap from './pages/CampusMap'
import Achievements from './pages/Achievements'
import Leaderboard from './pages/Leaderboard'
import Navbar from './components/Navbar'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // 監聽網絡狀態變化
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {!isOnline && (
          <div className="bg-warning text-white p-2 text-center">
            您目前處於離線模式，部分功能可能受限
          </div>
        )}
        <div className="container mx-auto px-4 pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/travel-record" element={<TravelRecord />} />
            <Route path="/campus-map" element={<CampusMap />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
        <Navbar />
      </div>
    </Router>
  )
}

export default App
