import { useState, useEffect } from 'react'

// 成就介面定義
interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  unlocked: boolean;
}

// 用戶檔案介面
interface UserProfile {
  totalPoints: number;
  totalCarbonSaved: number;
  streakDays: number;
  travelCount: number;
  achievements: {
    id: number;
    title: string;
    progress: number;
    unlocked: boolean;
  }[];
}

// 交通記錄類型
interface TravelRecord {
  id: string;
  date: string;
  mode: string;
  distance: number;
  start: string;
  end: string;
  carbonSaved: number;
  points: number;
}

// 默認成就列表
const defaultAchievements: Achievement[] = [
  {
    id: 1,
    title: '初級環保者',
    description: '累計減少1kg碳排放',
    icon: '🌱',
    progress: 0,
    unlocked: false
  },
  {
    id: 2,
    title: '綠行先鋒',
    description: '連續7天使用低碳交通',
    icon: '🚲',
    progress: 0,
    unlocked: false
  },
  {
    id: 3,
    title: '龍潭路安全達人',
    description: '10次使用龍潭路安全路線',
    icon: '🛣️',
    progress: 0,
    unlocked: false
  },
  {
    id: 4,
    title: '零碳通勤專家',
    description: '累計30次零碳出行',
    icon: '🌍',
    progress: 0,
    unlocked: false
  },
  {
    id: 5,
    title: '雲林綠行大師',
    description: '獲得1000點綠點積分',
    icon: '🏆',
    progress: 0,
    unlocked: false
  },
  {
    id: 6,
    title: '全校園探索完成',
    description: '訪問校園所有主要建築',
    icon: '🧭',
    progress: 0,
    unlocked: false
  }
]

const Achievements = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [points, setPoints] = useState(0)
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(defaultAchievements)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  // 重新計算成就進度
  const recalculateAchievements = () => {
    setLoading(true)
    
    try {
      // 獲取基本數據
      const profileJson = localStorage.getItem('userProfile')
      const recordsJson = localStorage.getItem('travelRecords')
      
      if (!profileJson) {
        setLoading(false)
        return
      }
      
      const profile: UserProfile = JSON.parse(profileJson)
      const records: TravelRecord[] = recordsJson ? JSON.parse(recordsJson) : []
      
      // 更新積分顯示
      setPoints(profile.totalPoints || 0)
      
      // 計算成就進度
      const updatedAchievements = defaultAchievements.map(achievement => {
        // 預設值
        let progress = 0
        let unlocked = false
        
        // 根據成就ID計算進度
        switch (achievement.id) {
          case 1: // 初級環保者: 累計減少1kg碳排放
            progress = Math.min(profile.totalCarbonSaved / 1 * 100, 100)
            unlocked = profile.totalCarbonSaved >= 1
            break
            
          case 2: // 綠行先鋒: 連續7天使用低碳交通
            progress = Math.min(profile.streakDays / 7 * 100, 100)
            unlocked = profile.streakDays >= 7
            break
            
          case 3: // 龍潭路安全達人: 10次使用龍潭路安全路線
            const dragonPondRecords = records.filter(record => 
              record.start?.includes('龍潭') || record.end?.includes('龍潭'))
            progress = Math.min((dragonPondRecords.length / 10) * 100, 100)
            unlocked = dragonPondRecords.length >= 10
            break
            
          case 4: // 零碳通勤專家: 累計30次零碳出行
            const zeroCarbonRecords = records.filter(record => 
              record.mode === 'walking' || record.mode === 'cycling')
            progress = Math.min((zeroCarbonRecords.length / 30) * 100, 100)
            unlocked = zeroCarbonRecords.length >= 30
            break
            
          case 5: // 雲林綠行大師: 獲得1000點綠點積分
            progress = Math.min((profile.totalPoints / 1000) * 100, 100)
            unlocked = profile.totalPoints >= 1000
            break
            
          case 6: // 全校園探索完成: 訪問校園所有主要建築
            const campusLocations = ['圖書館', '行政大樓', '學生宿舍', '體育館', '工程學院']
            const visitedLocations = new Set<string>()
            
            records.forEach(record => {
              campusLocations.forEach(location => {
                if (record.start?.includes(location) || record.end?.includes(location)) {
                  visitedLocations.add(location)
                }
              })
            })
            
            progress = Math.min((visitedLocations.size / campusLocations.length) * 100, 100)
            unlocked = visitedLocations.size >= campusLocations.length
            break
        }
        
        // 確保進度是有效數字
        if (isNaN(progress)) {
          progress = 0
        }
        
        return {
          ...achievement,
          progress,
          unlocked
        }
      })
      
      setUserAchievements(updatedAchievements)
      
      // 檢查新解鎖的成就
      const previouslyUnlockedCount = userAchievements.filter(a => a.unlocked).length
      const newlyUnlockedCount = updatedAchievements.filter(a => a.unlocked).length
      
      if (newlyUnlockedCount > previouslyUnlockedCount) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('計算成就進度失敗:', error)
      setLoading(false)
    }
  }

  // 在組件掛載時載入數據
  useEffect(() => {
    recalculateAchievements()
    
    // 每10秒自動刷新一次數據
    const intervalId = setInterval(() => {
      recalculateAchievements()
    }, 10000)
    
    return () => clearInterval(intervalId)
  }, [])

  // 處理手動刷新
  const handleRefresh = () => {
    recalculateAchievements()
  }

  // 過濾成就顯示
  const filteredAchievements = activeTab === 'all' 
    ? userAchievements 
    : activeTab === 'unlocked' 
      ? userAchievements.filter(a => a.unlocked) 
      : userAchievements.filter(a => !a.unlocked)

  return (
    <div className="pt-6 pb-20">
      <h1 className="text-2xl font-bold text-center text-primary mb-6">成就中心</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
              <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                  <div 
                    key={i}
                    className="confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      width: `${Math.random() * 10 + 5}px`,
                      height: `${Math.random() * 10 + 5}px`,
                      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'][Math.floor(Math.random() * 4)],
                      animation: `fall ${Math.random() * 3 + 2}s linear forwards, sway ${Math.random() * 2 + 3}s ease-in-out infinite alternate`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">我的積分</h2>
              <span className="text-xl font-bold text-secondary">{points} 點</span>
            </div>
            <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-secondary h-full transition-all duration-1000"
                style={{ width: `${Math.min((points / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              再獲得 {Math.max(1000 - points, 0)} 點即可解鎖「雲林綠行大師」成就
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex border-b mb-4">
              <button 
                className={`flex-1 py-2 text-center transition-colors duration-200 ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('all')}
              >
                全部
              </button>
              <button 
                className={`flex-1 py-2 text-center transition-colors duration-200 ${activeTab === 'unlocked' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('unlocked')}
              >
                已解鎖
              </button>
              <button 
                className={`flex-1 py-2 text-center transition-colors duration-200 ${activeTab === 'locked' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('locked')}
              >
                未解鎖
              </button>
            </div>
            
            {/* 添加刷新按鈕 */}
            <div className="flex justify-end mb-4">
              <button 
                onClick={handleRefresh}
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                刷新成就
              </button>
            </div>
            
            {filteredAchievements.length > 0 ? (
              <div className="space-y-4">
                {filteredAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`border rounded-lg p-3 transition-all duration-300 ${
                      achievement.unlocked ? 'border-green-200 bg-green-50' : 'hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`text-2xl mr-3 ${achievement.unlocked ? 'animate-pulse' : ''}`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          已解鎖
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.max(0, Math.min(achievement.progress, 100))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-600">進度</span>
                      <span className="text-xs font-medium">{Math.round(achievement.progress)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {activeTab === 'unlocked' ? '尚未解鎖任何成就' : '沒有符合條件的成就'}
              </div>
            )}
          </div>
          
          <style>
            {`
            @keyframes fall {
              0% { transform: translateY(-100vh); }
              100% { transform: translateY(100vh); }
            }
            
            @keyframes sway {
              0% { transform: translateX(-5px) rotate(-10deg); }
              100% { transform: translateX(5px) rotate(10deg); }
            }
            
            .confetti-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              pointer-events: none;
            }
            
            .confetti {
              position: absolute;
              top: -10px;
              border-radius: 0;
            }
            `}
          </style>
        </>
      )}
    </div>
  )
}

export default Achievements