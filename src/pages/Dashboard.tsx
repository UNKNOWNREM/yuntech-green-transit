import { useState, useEffect } from 'react'

// 交通統計類型
interface TransportStats {
  walking: number;
  cycling: number;
  bus: number;
  carpool: number;
  motorcycle: number;
  car: number;
}

// 成就介面定義
interface Achievement {
  id: number;
  title: string;
  progress: number;
  unlocked: boolean;
}

// 用戶檔案類型
interface UserProfile {
  totalPoints: number;
  totalCarbonSaved: number;
  streakDays: number;
  travelCount: number;
  achievements: Achievement[];
}

// 任務類型
interface Task {
  id: number;
  title: string;
  completed: boolean;
  type: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [transportStats, setTransportStats] = useState<TransportStats>({
    walking: 40,
    cycling: 25,
    bus: 15,
    carpool: 10,
    motorcycle: 5,
    car: 5
  })
  const [loading, setLoading] = useState(true)
  const [todayTasks, setTodayTasks] = useState<{id: number; title: string; completed: boolean}[]>([])

  useEffect(() => {
    const loadUserData = () => {
      try {
        setLoading(true)
        
        // 從本地存儲獲取用戶檔案
        const profileJson = localStorage.getItem('userProfile')
        if (profileJson) {
          const loadedProfile: UserProfile = JSON.parse(profileJson)
          setProfile(loadedProfile)
          
          // 計算真實的交通方式統計數據（如果有足夠的記錄）
          calculateTransportStats()
        } else {
          // 創建默認檔案
          const defaultProfile: UserProfile = {
            totalPoints: 0,
            totalCarbonSaved: 0,
            streakDays: 0,
            travelCount: 0,
            achievements: []
          }
          setProfile(defaultProfile)
          localStorage.setItem('userProfile', JSON.stringify(defaultProfile))
        }
        
        // 獲取今日任務
        const tasksJson = localStorage.getItem('tasks')
        if (tasksJson) {
          const tasks: Task[] = JSON.parse(tasksJson)
          const dailyTasks = tasks
            .filter((task) => task.type === 'daily')
            .map((task) => ({
              id: task.id,
              title: task.title,
              completed: task.completed
            }))
          setTodayTasks(dailyTasks)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('加載用戶數據失敗:', error)
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [])

  // 計算真實的交通方式統計數據
  const calculateTransportStats = () => {
    try {
      const recordsJson = localStorage.getItem('travelRecords')
      if (recordsJson) {
        const records: { mode: string }[] = JSON.parse(recordsJson)
        
        // 確保有足夠的記錄來計算有意義的統計數據
        if (records.length >= 5) {
          // 計算每種交通方式的次數
          const modeCounts: Record<string, number> = {
            walking: 0,
            cycling: 0,
            bus: 0,
            carpool: 0,
            motorcycle: 0,
            car: 0
          }
          
          records.forEach((record) => {
            if (record.mode in modeCounts) {
              modeCounts[record.mode]++
            }
          })
          
          // 計算百分比
          const total = Object.values(modeCounts).reduce((sum, count) => sum + count, 0)
          if (total > 0) {
            const stats: TransportStats = {
              walking: Math.round((modeCounts.walking / total) * 100),
              cycling: Math.round((modeCounts.cycling / total) * 100),
              bus: Math.round((modeCounts.bus / total) * 100),
              carpool: Math.round((modeCounts.carpool / total) * 100),
              motorcycle: Math.round((modeCounts.motorcycle / total) * 100),
              car: Math.round((modeCounts.car / total) * 100)
            }
            
            // 調整百分比確保總和為100%
            let sum = Object.values(stats).reduce((s, v) => s + v, 0)
            if (sum !== 100) {
              // 找到最大的項目進行調整
              const maxKey = Object.keys(stats).reduce((a, b) => 
                stats[a as keyof TransportStats] > stats[b as keyof TransportStats] ? a : b
              ) as keyof TransportStats
              
              stats[maxKey] += (100 - sum)
            }
            
            setTransportStats(stats)
          }
        }
      }
    } catch (error) {
      console.error('計算交通統計失敗:', error)
    }
  }

  // 計算樹木等效數量
  const calculateTreesEquivalent = (carbonSaved: number): number => {
    // 一棵樹每年約吸收20kg CO2
    return carbonSaved / 20
  }

  return (
    <div className="pt-6 pb-20">
      <h1 className="text-2xl font-bold text-center text-primary mb-6">雲林綠行通</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">我的環保成效</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-3xl text-green-600 mb-1">
                  {profile?.totalCarbonSaved.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-600">減少碳排放 (kg)</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-3xl text-blue-600 mb-1">
                  {profile ? calculateTreesEquivalent(profile.totalCarbonSaved).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-600">相當於種植樹木 (棵)</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">我的綠點積分</h2>
              <span className="text-xl font-bold text-secondary">{profile?.totalPoints || 0}</span>
            </div>
            <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-secondary h-full transition-all duration-1000"
                style={{ width: `${Math.min(((profile?.totalPoints || 0) / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                連續環保: <span className="font-medium text-primary">{profile?.streakDays || 0}</span> 天
              </div>
              <div className="text-sm text-gray-600">
                總出行次數: <span className="font-medium">{profile?.travelCount || 0}</span> 次
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-3">今日任務</h2>
              {todayTasks.length > 0 ? (
                <ul className="space-y-2">
                  {todayTasks.map((task) => (
                    <li key={task.id} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 ${task.completed ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                        {task.completed && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  今日無任務
                </div>
              )}
              {/* 添加重置按鈕 */}
              <button 
                onClick={() => {
                  import('../services/gamificationService').then((module) => {
                    const tasks = module.resetDailyTasks();
                    console.log('任務已重置:', tasks);
                    alert('任務已重置，請刷新頁面');
                    window.location.reload();
                  });
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 mx-auto block mt-4"
              >
                重置任務
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-3">交通方式分析</h2>
              <div className="h-40 flex items-center justify-center">
                <div className="w-full h-full flex">
                  {Object.entries(transportStats).map(([mode, percentage]) => (
                    <div 
                      key={mode}
                      className="h-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: 
                          mode === 'walking' ? '#4CAF50' : 
                          mode === 'cycling' ? '#2196F3' : 
                          mode === 'bus' ? '#FFC107' : 
                          mode === 'carpool' ? '#9C27B0' : 
                          mode === 'motorcycle' ? '#FF9800' : '#F44336'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap mt-3">
                {Object.entries(transportStats).map(([mode, percentage]) => (
                  <div key={mode} className="flex items-center mr-4 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ 
                        backgroundColor: 
                          mode === 'walking' ? '#4CAF50' : 
                          mode === 'cycling' ? '#2196F3' : 
                          mode === 'bus' ? '#FFC107' : 
                          mode === 'carpool' ? '#9C27B0' : 
                          mode === 'motorcycle' ? '#FF9800' : '#F44336'
                      }}
                    ></div>
                    <span className="text-xs text-gray-600">
                      {mode === 'walking' ? '步行' : 
                       mode === 'cycling' ? '自行車' : 
                       mode === 'bus' ? '公車' : 
                       mode === 'carpool' ? '共乘' : 
                       mode === 'motorcycle' ? '機車' : '自駕車'}
                      ({percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">環保影響力</h2>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-center mb-2">
                您已減少 <span className="font-bold text-green-600">{profile?.totalCarbonSaved.toFixed(2) || '0.00'}</span> kg 碳排放
              </p>
              <p className="text-sm text-gray-600 text-center">
                相當於一棵樹吸收 <span className="font-medium">{profile ? Math.ceil(profile.totalCarbonSaved / 20 * 365) : 0}</span> 天的二氧化碳
              </p>
            </div>
          </div>
          
          <button 
            className="fixed bottom-20 right-4 bg-primary hover:bg-green-600 text-white font-bold w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
            onClick={() => window.location.href = '/travel-record'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

export default Dashboard