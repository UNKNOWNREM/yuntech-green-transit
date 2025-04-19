// 地圖服務
// 提供校園地圖和路線規劃功能

import L from 'leaflet';

// 校園位置類型
export interface CampusLocation {
  id: string;
  name: string;
  position: [number, number]; // 緯度,經度
  description?: string;
  type: 'building' | 'facility' | 'entrance' | 'transport';
}

// 危險區域類型
export interface DangerZone {
  id: string;
  name: string;
  description: string;
  polygon: [number, number][]; // 多邊形頂點座標
  riskLevel: number; // 1-10
}

// 路線類型
export interface Route {
  id: string;
  name: string;
  start: string; // 起點ID
  end: string; // 終點ID
  path: [number, number][]; // 路徑座標
  distance: number; // 公里
  estimatedTime: number; // 分鐘
  type: 'walking' | 'cycling' | 'bus';
  safetyIndex: number; // 1-10
  description?: string;
}

// 路線偏好類型
export interface RoutePreference {
  safety: number; // 1-10
  eco: number; // 1-10
  time: number; // 1-10
  weather?: 'sunny' | 'cloudy' | 'rainy';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

// 雲林科技大學中心座標
const YUNTECH_CENTER: [number, number] = [23.694033091149173, 120.53405455108127];

// 校園位置座標
export const campusLocations: CampusLocation[] = [
  {
    id: 'main_gate',
    name: '校門口',
    position: [23.69588784760861, 120.53431077240255],
    description: '雲林科技大學正門入口',
    type: 'entrance'
  },
  {
    id: 'library',
    name: '圖書館',
    position: [23.693738, 120.534227],
    description: '雲林科技大學圖書館',
    type: 'building'
  },
  {
    id: 'student_center',
    name: '學生活動中心',
    position: [23.69111131114025, 120.53509521420952],
    description: '提供學生社團活動和集會的場所',
    type: 'building'
  },
  {
    id: 'engineering',
    name: '工程學院',
    position: [23.694691967664962, 120.53665125919225],
    description: '包含機械、電機、電子等工程系所',
    type: 'building'
  },
  {
    id: 'management',
    name: '管理學院',
    position: [23.694414542648126, 120.53260008156494],
    description: '包含企管、資管、財金等管理系所',
    type: 'building'
  },
  {
    id: 'design',
    name: '設計學院',
    position: [23.692118514152266, 120.53489707733729],
    description: '包含工設、視傳、建築等設計系所',
    type: 'building'
  },
  {
    id: 'dormitory',
    name: '學生宿舍',
    position: [23.689289654493248, 120.53459085129329],
    description: '學生住宿區',
    type: 'building'
  },
  {
    id: 'station',
    name: '斗六火車站',
    position: [23.711770609311447, 120.54385186879234],
    description: '斗六火車站',
    type: 'transport'
  }
];

// 更新後的危險區域數據
export const dangerZones: DangerZone[] = [
  {
    id: 'dragon_pond_road',
    name: '龍潭路',
    description: '校外龍潭路段，車流量大且車速快，行人和自行車需特別注意',
    polygon: [
      [23.694174, 120.538126],
      [23.694136, 120.538132],
      [23.691521, 120.528763],
      [23.690892, 120.525113],
      [23.691923, 120.525069],
      [23.692033, 120.526151],
      [23.691712, 120.528572],
      [23.692377, 120.530349]
    ],
    riskLevel: 8  
  }
  // {
  //   id: 'night_area',
  //   name: '夜間照明不足區',
  //   description: '校園後方區域夜間照明不足，建議結伴同行',
  //   polygon: [
  //     [23.6915, 120.5365],
  //     [23.6920, 120.5370],
  //     [23.6925, 120.5375],
  //     [23.6920, 120.5380],
  //     [23.6915, 120.5375],
  //     [23.6910, 120.5370]
  //   ],
  //   riskLevel: 6
  // }
];

// 更新後的預設路線數據
export const predefinedRoutes: Route[] = [
  {
    id: 'main_to_library_walk',
    name: '校門口到圖書館步行路線',
    start: 'main_gate',
    end: 'library',
    path: [
      [23.695950603417664, 120.53466292268489], // 校門口
      [23.69458285562304, 120.53445704443878], // 中間點
      [23.694047424630003, 120.53424783214136]  // 圖書館
    ],
    distance: 0.25,
    estimatedTime: 2,
    type: 'walking',
    safetyIndex: 9,
    description: '沿校園主要步道，全程有路燈照明'
  },
  {
    id: 'dorm_to_engineering_cycle',
    name: '宿舍到工程學院自行車路線',
    start: 'dormitory',
    end: 'engineering',
    path: [
      [23.689857059017303, 120.53434529119755], // 學生宿舍
      [23.69021096920485, 120.53637566661449], // 中間點1
      [23.69151368847791, 120.53613606693024], // 中間點2
      [23.693507903278118, 120.53575996958178],   // 中間點3
      [23.694617816287263, 120.53557496686773],  // 工程學院
    ],
    distance: 0.8,
    estimatedTime: 5,
    type: 'cycling',
    safetyIndex: 8,
    description: '經過設計學院和管理學院，有專用自行車道'
  },
  {
    id: 'station_to_main_bus',
    name: '斗六火車站到校門口公車路線',
    start: 'station',
    end: 'main_gate',
    path: [
      // 反向的路線 (從火車站到校門口)
      [23.712240820880822, 120.54079448932686], // 火車站
      [23.710071663857093, 120.53777145453279],
      [23.713495937561092, 120.53316371668518],
      [23.708036233769363, 120.52983620144545],
      [23.70479905818722, 120.5291778615449],
      [23.70139707418221, 120.52935488756651],
      [23.699937652957573, 120.53207998178328],
      [23.6983567475842, 120.53112955650579],
      [23.695845693281342, 120.5316095139504],
      [23.6962453839526, 120.53406428923495],
      [23.696034294072675, 120.53426436802823], // 校門口附近
      [23.695301341946802, 120.53440347370554]  // 校門口
    ],
    distance: 2.8, // 根據實際路線更新距離
    estimatedTime: 15, // 巴士估計時間
    type: 'bus',
    safetyIndex: 9,
    description: '校園公車每30分鐘一班，可使用學生證免費搭乘'
  },
  {
    id: 'main_to_station_safe',
    name: '校門口到斗六火車站安全路線',
    start: 'main_gate',
    end: 'station',
    path: [
      // 正向路線 (從校門口到火車站)
      [23.695301341946802, 120.53440347370554], // 校門口
      [23.696034294072675, 120.53426436802823],
      [23.6962453839526, 120.53406428923495],
      [23.695845693281342, 120.5316095139504],
      [23.6983567475842, 120.53112955650579],
      [23.699937652957573, 120.53207998178328],
      [23.70139707418221, 120.52935488756651],
      [23.70479905818722, 120.5291778615449],
      [23.708036233769363, 120.52983620144545],
      [23.713495937561092, 120.53316371668518],
      [23.710071663857093, 120.53777145453279],
      [23.712240820880822, 120.54079448932686]  // 火車站
    ],
    distance: 2.8, // 根據實際路線更新距離
    estimatedTime: 35, // 步行估計時間
    type: 'walking',
    safetyIndex: 7,
    description: '繞開龍潭路危險路段，雖然距離較長但更安全'
  },
  {
    id: 'student_center_to_main_gate',
    name: '學生活動中心到校門口路線',
    start: 'student_center',
    end: 'main_gate',
    path: [
      [23.69132987812816, 120.53508153127581], // 活動中心
      [23.69113927138021, 120.53404885628476],
      [23.695124856025117, 120.5332364712782],
      [23.695301341946802, 120.53440347370554] // 校門口
    ],
    distance: 0.6,
    estimatedTime: 7,
    type: 'walking',
    safetyIndex: 9,
    description: '校內安全路線，沿途有路燈照明'
  }
];

// 初始化地圖
// 初始化地圖
export const initMap = (container: HTMLElement): L.Map => {
  const map = L.map(container).setView(YUNTECH_CENTER, 16);
  
  // 添加OpenStreetMap圖層
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // 修復Leaflet圖標問題 - 使用TypeScript友好的方式
  L.Icon.Default.imagePath = '/images/leaflet/';
  
  return map;
};

// 添加校園位置到地圖
export const addLocationsToMap = (map: L.Map): void => {
  campusLocations.forEach(location => {
    L.marker(location.position)
      .addTo(map)
      .bindPopup(`<b>${location.name}</b><br>${location.description || ''}`);
  });
};

// 添加危險區域到地圖
export const addDangerZonesToMap = (map: L.Map): void => {
  dangerZones.forEach(zone => {
    L.polygon(zone.polygon, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.3
    }).addTo(map)
      .bindPopup(`<b>${zone.name}</b><br>風險等級: ${zone.riskLevel}/10<br>${zone.description}`);
  });
};

// 添加路線到地圖
export const addRouteToMap = (map: L.Map, route: Route): L.Polyline => {
  const color = route.type === 'walking' ? 'green' : 
                route.type === 'cycling' ? 'blue' : 'orange';
  
  const polyline = L.polyline(route.path, {
    color: color,
    weight: 5,
    opacity: 0.7
  }).addTo(map);
  
  polyline.bindPopup(`
    <b>${route.name}</b><br>
    距離: ${route.distance} 公里<br>
    預估時間: ${route.estimatedTime} 分鐘<br>
    安全指數: ${route.safetyIndex}/10<br>
    ${route.description || ''}
  `);
  
  return polyline;
};

// 查找兩點間的路線
export const findRoute = (startId: string, endId: string): Route | null => {
  // 先查找預設路線
  const directRoute = predefinedRoutes.find(
    route => route.start === startId && route.end === endId
  );
  
  if (directRoute) return directRoute;
  
  // 查找反向路線
  const reverseRoute = predefinedRoutes.find(
    route => route.start === endId && route.end === startId
  );
  
  if (reverseRoute) {
    // 創建反向路線
    return {
      ...reverseRoute,
      id: `${reverseRoute.id}_reverse`,
      name: `${reverseRoute.name} (反向)`,
      start: endId,
      end: startId,
      path: [...reverseRoute.path].reverse()
    };
  }
  
  return null;
};

// 根據偏好推薦路線
export const recommendRoute = (
  startId: string, 
  endId: string, 
  preferences: RoutePreference
): Route | null => {
  // 查找所有可能的路線
  const possibleRoutes: Route[] = [];
  
  // 直接路線
  const directRoute = findRoute(startId, endId);
  if (directRoute) possibleRoutes.push(directRoute);
  
  // 如果沒有直接路線，嘗試找間接路線（未實現）
  
  if (possibleRoutes.length === 0) return null;
  
  // 根據偏好計算每條路線的得分
  const scoredRoutes = possibleRoutes.map(route => {
    let score = 0;
    
    // 安全因素
    score += route.safetyIndex * (preferences.safety / 10);
    
    // 環保因素
    const ecoScore = route.type === 'walking' ? 10 : 
                     route.type === 'cycling' ? 8 : 
                     route.type === 'bus' ? 6 : 4;
    score += ecoScore * (preferences.eco / 10);
    
    // 時間因素 (時間越短得分越高)
    const timeScore = 10 - Math.min(9, route.estimatedTime / 10);
    score += timeScore * (preferences.time / 10);
    
    // 天氣因素
    if (preferences.weather === 'rainy' && route.type === 'walking') {
      score -= 3; // 雨天降低步行得分
    }
    
    // 時間因素
    if (preferences.timeOfDay === 'night' && route.safetyIndex < 7) {
      score -= 2; // 夜間降低低安全路線得分
    }
    
    return { route, score };
  });
  
  // 選擇得分最高的路線
  scoredRoutes.sort((a, b) => b.score - a.score);
  return scoredRoutes[0]?.route || null;
};
