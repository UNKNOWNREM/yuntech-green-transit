import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  initMap, 
  addLocationsToMap, 
  addDangerZonesToMap, 
  addRouteToMap,
  campusLocations,
  predefinedRoutes,
  recommendRoute,
  Route,
  RoutePreference
} from '../services/mapService'

const CampusMap = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const [selectedStartLocation, setSelectedStartLocation] = useState('')
  const [selectedEndLocation, setSelectedEndLocation] = useState('')
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [routePolyline, setRoutePolyline] = useState<L.Polyline | null>(null)
  const [preferences, setPreferences] = useState<RoutePreference>({
    safety: 7,
    eco: 8,
    time: 5
  })
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rainy'>('sunny')
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning')

  // 初始化地圖
  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // 初始化地圖
      leafletMapRef.current = initMap(mapRef.current)
      
      // 添加校園地點
      addLocationsToMap(leafletMapRef.current)
      
      // 添加危險區域
      addDangerZonesToMap(leafletMapRef.current)
    }

    // 清理函數
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // 查找路線
  const handleFindRoute = () => {
    if (!selectedStartLocation || !selectedEndLocation) {
      alert('請選擇起點和終點')
      return
    }

    setLoading(true)

    try {
      // 清除之前的路線
      if (routePolyline && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(routePolyline)
      }

      // 根據偏好推薦路線
      const route = recommendRoute(
        selectedStartLocation, 
        selectedEndLocation, 
        {
          ...preferences,
          weather,
          timeOfDay
        }
      )

      if (route && leafletMapRef.current) {
        setSelectedRoute(route)
        
        // 添加路線到地圖
        const polyline = addRouteToMap(leafletMapRef.current, route)
        setRoutePolyline(polyline)
        
        // 縮放地圖以顯示整個路線
        leafletMapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] })
      } else {
        alert('找不到合適的路線')
        setSelectedRoute(null)
      }
    } catch (error) {
      console.error('查找路線失敗:', error)
      alert('查找路線時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  // 獲取地點名稱
  const getLocationName = (id: string) => {
    const location = campusLocations.find(loc => loc.id === id)
    return location ? location.name : ''
  }

  return (
    <div className="pt-6 pb-20">
      <h1 className="text-2xl font-bold text-center text-primary mb-6">校園地圖</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap mb-4">
          <div className="flex items-center mr-4 mb-2">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-1"></div>
            <span className="text-sm">步行路線</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-sm">自行車路線</span>
          </div>
          <div className="flex items-center mr-4 mb-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-1"></div>
            <span className="text-sm">公車路線</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-1"></div>
            <span className="text-sm">危險區域</span>
          </div>
        </div>
        
        <div ref={mapRef} className="h-64 md:h-96 rounded-lg mb-4"></div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">起點</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedStartLocation}
              onChange={(e) => setSelectedStartLocation(e.target.value)}
            >
              <option value="">請選擇起點</option>
              {campusLocations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終點</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedEndLocation}
              onChange={(e) => setSelectedEndLocation(e.target.value)}
            >
              <option value="">請選擇終點</option>
              {campusLocations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">路線偏好</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">安全優先</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={preferences.safety}
                onChange={(e) => setPreferences({...preferences, safety: parseInt(e.target.value)})}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">環保優先</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={preferences.eco}
                onChange={(e) => setPreferences({...preferences, eco: parseInt(e.target.value)})}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">時間優先</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={preferences.time}
                onChange={(e) => setPreferences({...preferences, time: parseInt(e.target.value)})}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">天氣狀況</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={weather}
              onChange={(e) => setWeather(e.target.value as 'sunny' | 'cloudy' | 'rainy')}
            >
              <option value="sunny">晴天</option>
              <option value="cloudy">多雲</option>
              <option value="rainy">雨天</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時間</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as 'morning' | 'afternoon' | 'evening' | 'night')}
            >
              <option value="morning">早上</option>
              <option value="afternoon">下午</option>
              <option value="evening">傍晚</option>
              <option value="night">夜間</option>
            </select>
          </div>
        </div>
        
        <button 
          className="w-full bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex justify-center items-center"
          onClick={handleFindRoute}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              查找路線中...
            </>
          ) : '查找最佳路線'}
        </button>
      </div>
      
      {selectedRoute && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">推薦路線</h2>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">{selectedRoute.name}</div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedRoute.type === 'walking' ? 'bg-green-100 text-green-800' :
                selectedRoute.type === 'cycling' ? 'bg-blue-100 text-blue-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {selectedRoute.type === 'walking' ? '步行' :
                 selectedRoute.type === 'cycling' ? '自行車' : '公車'}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {getLocationName(selectedRoute.start)} → {getLocationName(selectedRoute.end)}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-white p-2 rounded text-center">
                <div className="text-xs text-gray-500">距離</div>
                <div className="font-medium">{selectedRoute.distance} 公里</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="text-xs text-gray-500">預估時間</div>
                <div className="font-medium">{selectedRoute.estimatedTime} 分鐘</div>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <div className="text-xs text-gray-500">安全指數</div>
                <div className="font-medium">{selectedRoute.safetyIndex}/10</div>
              </div>
            </div>
            {selectedRoute.description && (
              <div className="text-sm italic text-gray-600">{selectedRoute.description}</div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3">常用路線</h2>
        <ul>
          {predefinedRoutes.slice(0, 3).map(route => (
            <li key={route.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium">{getLocationName(route.start)} → {getLocationName(route.end)}</p>
                <p className="text-sm text-gray-600">
                  距離: {route.distance} 公里 | 
                  {route.type === 'walking' ? '步行' : 
                   route.type === 'cycling' ? '自行車' : '公車'}
                  時間: 約 {route.estimatedTime} 分鐘
                </p>
              </div>
              <button 
                className="bg-primary text-white px-3 py-1 rounded-full text-sm transition-colors duration-200 hover:bg-green-600"
                onClick={() => {
                  setSelectedStartLocation(route.start)
                  setSelectedEndLocation(route.end)
                  setTimeout(() => {
                    handleFindRoute()
                  }, 100)
                }}
              >
                導航
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CampusMap
