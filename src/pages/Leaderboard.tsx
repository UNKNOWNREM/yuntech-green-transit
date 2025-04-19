import { useState, useEffect } from 'react'
import { getUserProfile } from '../services/storageService'
import { Chart, registerables } from 'chart.js'
import { Bar } from 'react-chartjs-2'

// 註冊Chart.js組件
Chart.register(...registerables)

const userRankings = [
  { id: 1, name: '王小明', department: '資訊工程系', points: 1250, carbonSaved: 25.6 },
  { id: 2, name: '李小華', department: '企業管理系', points: 980, carbonSaved: 19.2 },
  { id: 3, name: '張小芳', department: '工業設計系', points: 870, carbonSaved: 17.5 },
  { id: 4, name: '陳小強', department: '資訊管理系', points: 760, carbonSaved: 15.3 },
  { id: 5, name: '林小玲', department: '應用外語系', points: 650, carbonSaved: 13.1 },
  { id: 6, name: '吳小傑', department: '電機工程系', points: 540, carbonSaved: 10.8 },
  { id: 7, name: '黃小婷', department: '財務金融系', points: 430, carbonSaved: 8.6 },
  { id: 8, name: '劉小豪', department: '營建工程系', points: 320, carbonSaved: 6.4 },
  { id: 9, name: '蔡小雯', department: '文化資產系', points: 210, carbonSaved: 4.2 },
  { id: 10, name: '鄭小偉', department: '材料科學系', points: 100, carbonSaved: 2.0 }
]

const departmentRankings = [
  { id: 1, name: '資訊工程系', members: 120, points: 45600, carbonSaved: 912.0 },
  { id: 2, name: '工業設計系', members: 110, points: 38500, carbonSaved: 770.0 },
  { id: 3, name: '企業管理系', members: 130, points: 35100, carbonSaved: 702.0 },
  { id: 4, name: '電機工程系', members: 125, points: 31250, carbonSaved: 625.0 },
  { id: 5, name: '資訊管理系', members: 115, points: 28750, carbonSaved: 575.0 }
]

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('individual')
  const [userRank, setUserRank] = useState(0)
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        
        // 從IndexedDB獲取用戶檔案
        const profile = await getUserProfile()
        
        if (profile) {
          setUserPoints(profile.totalPoints)
          
          // 計算用戶排名
          const rank = userRankings.findIndex(user => user.points < profile.totalPoints) + 1
          setUserRank(rank > 0 ? rank : userRankings.length + 1)
          
          // 顯示動畫效果
          setShowAnimation(true)
          setTimeout(() => setShowAnimation(false), 2000)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('獲取用戶數據失敗:', error)
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [])

  // 圖表數據 - 個人排行
  const individualChartData = {
    labels: userRankings.slice(0, 5).map(user => user.name),
    datasets: [
      {
        label: '積分',
        data: userRankings.slice(0, 5).map(user => user.points),
        backgroundColor: '#2196F3'
      }
    ]
  }

  // 圖表數據 - 系所排行
  const departmentChartData = {
    labels: departmentRankings.map(dept => dept.name),
    datasets: [
      {
        label: '總積分 (千)',
        data: departmentRankings.map(dept => dept.points / 1000),
        backgroundColor: '#4CAF50'
      }
    ]
  }

  return (
    <div className="pt-6 pb-20">
      <h1 className="text-2xl font-bold text-center text-primary mb-6">排行榜</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">我的排名</h2>
            <div className="flex items-center">
              <div className={`w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold ${showAnimation ? 'animate-pulse' : ''}`}>
                {userRank}
              </div>
              <div className="ml-4">
                <p className="font-medium">您的積分: {userPoints} 點</p>
                <p className="text-sm text-gray-600">
                  {userRank <= 10 
                    ? '恭喜您進入前10名！' 
                    : `再獲得 ${userRankings[9]?.points - userPoints + 1} 點即可進入前10名`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex border-b mb-4">
              <button 
                className={`flex-1 py-2 text-center transition-colors duration-200 ${activeTab === 'individual' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('individual')}
              >
                個人排行
              </button>
              <button 
                className={`flex-1 py-2 text-center transition-colors duration-200 ${activeTab === 'department' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('department')}
              >
                系所排行
              </button>
            </div>
            
            <div className="h-64 mb-6">
              <Bar 
                data={activeTab === 'individual' ? individualChartData : departmentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  },
                  animation: {
                    duration: 1000
                  }
                }}
              />
            </div>
            
            {activeTab === 'individual' ? (
              <div>
                <div className="flex font-medium text-gray-600 py-2 border-b">
                  <div className="w-10 text-center">排名</div>
                  <div className="flex-1">用戶</div>
                  <div className="w-20 text-right">積分</div>
                  <div className="w-24 text-right">減碳量(kg)</div>
                </div>
                {userRankings.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center py-3 border-b last:border-b-0 ${index < 3 ? 'bg-green-50' : ''} transition-colors duration-200 hover:bg-gray-50`}
                  >
                    <div className="w-10 text-center">
                      {index < 3 ? (
                        <span className={`inline-block w-6 h-6 rounded-full text-white text-xs flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-700'
                        }`}>
                          {index + 1}
                        </span>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.department}</p>
                    </div>
                    <div className="w-20 text-right font-medium">{user.points}</div>
                    <div className="w-24 text-right text-primary font-medium">{user.carbonSaved}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex font-medium text-gray-600 py-2 border-b">
                  <div className="w-10 text-center">排名</div>
                  <div className="flex-1">系所</div>
                  <div className="w-16 text-right">成員</div>
                  <div className="w-20 text-right">總積分</div>
                  <div className="w-24 text-right">減碳量(kg)</div>
                </div>
                {departmentRankings.map((dept, index) => (
                  <div 
                    key={dept.id} 
                    className={`flex items-center py-3 border-b last:border-b-0 ${index < 3 ? 'bg-green-50' : ''} transition-colors duration-200 hover:bg-gray-50`}
                  >
                    <div className="w-10 text-center">
                      {index < 3 ? (
                        <span className={`inline-block w-6 h-6 rounded-full text-white text-xs flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-700'
                        }`}>
                          {index + 1}
                        </span>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 font-medium">{dept.name}</div>
                    <div className="w-16 text-right">{dept.members}</div>
                    <div className="w-20 text-right font-medium">{dept.points}</div>
                    <div className="w-24 text-right text-primary font-medium">{dept.carbonSaved}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3">本月環保之星</h2>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                👑
              </div>
              <div>
                <p className="font-medium text-lg">{userRankings[0].name}</p>
                <p className="text-sm text-gray-600">{userRankings[0].department}</p>
                <p className="text-sm mt-1">
                  <span className="text-secondary font-medium">{userRankings[0].points} 積分</span> · 
                  <span className="text-primary font-medium"> 減少 {userRankings[0].carbonSaved} kg 碳排放</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Leaderboard
