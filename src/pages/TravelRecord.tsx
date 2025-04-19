import { useState, useEffect } from 'react'
import { calculateEmissionSaved, calculatePoints } from '../services/carbonCalculator'

// 交通方式類型
type TransportMode = 'walking' | 'cycling' | 'bus' | 'carpool' | 'motorcycle' | 'car';

// 交通記錄類型
interface TravelRecord {
  id: string;
  date: string;
  mode: TransportMode;
  distance: number;
  start: string;
  end: string;
  carbonSaved: number;
  points: number;
}
// 成就介面定義
// interface Achievement {
//   id: number;
//   title: string;
//   description?: string;
//   icon?: string;
//   progress: number;
//   unlocked: boolean;
// }
const TravelRecord = () => {
  const [mode, setMode] = useState<TransportMode>('walking')
  const [distance, setDistance] = useState(1)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [records, setRecords] = useState<TravelRecord[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [carbonSaved, setCarbonSaved] = useState(0)
  const [loading, setLoading] = useState(false)

  // 加載歷史記錄
  useEffect(() => {
    const loadRecords = () => {
      try {
        const savedRecords = localStorage.getItem('travelRecords')
        if (savedRecords) {
          setRecords(JSON.parse(savedRecords))
        }
      } catch (error) {
        console.error('加載記錄失敗:', error)
      }
    }
    
    loadRecords()
  }, [])

  // 提交記錄
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!start || !end) {
      alert('請填寫起點和終點')
      return
    }
    
    setLoading(true)
    
    try {
      // 計算碳排放節省量
      const savedCarbon = calculateEmissionSaved(mode, distance)
      
      // 計算獲得的積分
      const streakDays = getStreakDays()
      const points = calculatePoints(mode, distance, streakDays)
      
      // 創建新記錄
      const newRecord: TravelRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mode,
        distance,
        start,
        end,
        carbonSaved: savedCarbon,
        points
      }
      
      // 更新記錄列表
      const updatedRecords = [newRecord, ...records].slice(0, 50) // 只保留最近50條記錄
      setRecords(updatedRecords)
      
      // 保存到本地存儲
      localStorage.setItem('travelRecords', JSON.stringify(updatedRecords))
      
      // 更新用戶檔案（積分、碳排放節省量等）
      updateUserProfile(savedCarbon, points)
      
      // 顯示成功信息
      setEarnedPoints(points)
      setCarbonSaved(savedCarbon)
      setShowSuccess(true)
      
      // 重置表單
      setMode('walking')
      setDistance(1)
      setStart('')
      setEnd('')
      
      // 3秒後隱藏成功信息
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('保存記錄失敗:', error)
      alert('保存記錄失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 獲取連續天數
  const getStreakDays = (): number => {
    if (records.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streakDays = 0
    let currentDate = new Date(today)
    
    // 檢查連續天數
    while (true) {
      currentDate.setDate(currentDate.getDate() - 1)
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // 檢查這一天是否有記錄
      const hasRecord = records.some(record => {
        const recordDate = new Date(record.date)
        return recordDate.toISOString().split('T')[0] === dateStr
      })
      
      if (hasRecord) {
        streakDays++
      } else {
        break
      }
    }
    
    return streakDays
  }
  // 更新用戶檔案
  const updateUserProfile = (carbonSaved: number, points: number) => {
    try {
      // 從本地存儲獲取用戶檔案
      const profileJson = localStorage.getItem('userProfile')
      const profile = profileJson ? JSON.parse(profileJson) : {
        totalPoints: 0,
        totalCarbonSaved: 0,
        streakDays: 0,
        travelCount: 0,
        achievements: []
      }
      
      // 更新檔案
      profile.totalPoints += points
      profile.totalCarbonSaved += carbonSaved
      profile.travelCount += 1
      
      console.log('更新用戶檔案:', {
        totalPoints: profile.totalPoints,
        totalCarbonSaved: profile.totalCarbonSaved,
        travelCount: profile.travelCount
      })
      
      // 檢查今天是否已經記錄
      const today = new Date().toISOString().split('T')[0]
      const hasTodayRecord = records.some(record => {
        const recordDate = new Date(record.date)
        return recordDate.toISOString().split('T')[0] === today
      })
      
      // 如果今天還沒有記錄，更新連續天數
      if (!hasTodayRecord) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        
        const hasYesterdayRecord = records.some(record => {
          const recordDate = new Date(record.date)
          return recordDate.toISOString().split('T')[0] === yesterdayStr
        })
        
        if (hasYesterdayRecord) {
          profile.streakDays += 1
        } else {
          profile.streakDays = 1
        }
      }
      
      // 保存更新後的檔案 - 不計算成就，讓成就頁面自己計算
      localStorage.setItem('userProfile', JSON.stringify(profile))
      console.log('用戶檔案已保存') 
    } catch (error) {
      console.error('更新用戶檔案失敗:', error)
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 獲取交通方式圖標
  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'walking': return '🚶'
      case 'cycling': return '🚲'
      case 'bus': return '🚌'
      case 'carpool': return '🚗👥'
      case 'motorcycle': return '🏍️'
      case 'car': return '🚗'
    }
  }

  return (
    <div className="pt-6 pb-20">
      <h1 className="text-2xl font-bold text-center text-primary mb-6">出行記錄</h1>
      
      {showSuccess && (
        <div className="fixed top-16 inset-x-0 flex justify-center items-center z-50 px-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg max-w-md w-full flex items-center">
            <div className="mr-4 text-2xl">🎉</div>
            <div>
              <p className="font-bold">出行記錄成功!</p>
              <p>獲得 {earnedPoints} 點積分</p>
              <p>減少 {carbonSaved.toFixed(2)} kg 碳排放</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">記錄新出行</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">交通方式</label>
            <div className="grid grid-cols-3 gap-2">
              {(['walking', 'cycling', 'bus', 'carpool', 'motorcycle', 'car'] as TransportMode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  className={`p-2 rounded-lg border text-center transition-colors duration-200 ${
                    mode === m 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setMode(m)}
                >
                  <div className="text-xl mb-1">{getModeIcon(m)}</div>
                  <div className="text-sm">
                    {m === 'walking' ? '步行' : 
                     m === 'cycling' ? '自行車' : 
                     m === 'bus' ? '公車' : 
                     m === 'carpool' ? '共乘' : 
                     m === 'motorcycle' ? '機車' : '自駕車'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">距離 (公里)</label>
            <input 
              type="number" 
              min="0.1" 
              step="0.1" 
              value={distance}
              onChange={(e) => setDistance(parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">起點</label>
              <input 
                type="text" 
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例如: 宿舍"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終點</label>
              <input 
                type="text" 
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="例如: 圖書館"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                記錄中...
              </>
            ) : '記錄出行'}
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">歷史記錄</h2>
        
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map(record => (
              <div key={record.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getModeIcon(record.mode)}</span>
                    <span className="font-medium">
                      {record.mode === 'walking' ? '步行' : 
                       record.mode === 'cycling' ? '自行車' : 
                       record.mode === 'bus' ? '公車' : 
                       record.mode === 'carpool' ? '共乘' : 
                       record.mode === 'motorcycle' ? '機車' : '自駕車'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {record.start} → {record.end} ({record.distance} 公里)
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-green-600">
                    減少碳排放: {record.carbonSaved.toFixed(2)} kg
                  </div>
                  <div className="text-secondary font-medium">
                    +{record.points} 點
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            尚無出行記錄
          </div>
        )}
      </div>
    </div>
  )
}

export default TravelRecord