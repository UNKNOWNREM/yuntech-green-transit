// 本地存儲服務
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// 定義數據庫結構
interface YunTechGreenTransitDB extends DBSchema {
  travelRecords: {
    key: string; // 記錄ID
    value: {
      id: string;
      mode: string; // 交通方式
      startLocation: string;
      endLocation: string;
      distance: number;
      date: Date;
      points: number;
      carbonSaved: number;
    };
    indexes: { 'by-date': Date };
  };
  userProfile: {
    key: string; // 'profile'
    value: {
      id: string;
      totalPoints: number;
      totalCarbonSaved: number;
      streakDays: number;
      travelCount: number;
      lastTravelDate: Date | null;
      achievements: {
        id: number;
        title: string;
        unlocked: boolean;
        progress: number;
      }[];
    };
  };
}

// 出行記錄接口
export interface TravelRecord {
  id?: string; // 可選，因為新增時不需要提供
  mode: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  date?: Date; // 可選，由系統自動生成
  points: number;
  carbonSaved: number;
}

// 用戶檔案接口
export interface UserProfile {
  id: string;
  totalPoints: number;
  totalCarbonSaved: number;
  streakDays: number;
  travelCount: number;
  lastTravelDate: Date | null;
  achievements: {
    id: number;
    title: string;
    unlocked: boolean;
    progress: number;
  }[];
}

// 初始化數據庫
const initDB = async (): Promise<IDBPDatabase<YunTechGreenTransitDB>> => {
  return await openDB<YunTechGreenTransitDB>('yuntech-green-transit', 1, {
    upgrade(db) {
      // 創建出行記錄存儲
      const travelStore = db.createObjectStore('travelRecords', {
        keyPath: 'id'
      });
      travelStore.createIndex('by-date', 'date');

      // 創建用戶檔案存儲
      db.createObjectStore('userProfile', {
        keyPath: 'id'
      });
    }
  });
};

// 保存出行記錄
export const saveTravelRecord = async (record: TravelRecord): Promise<string> => {
  const db = await initDB();
  const id = `travel_${Date.now()}`;
  const date = new Date();
  
  const newRecord = {
    id,
    ...record,
    date
  };
  
  await db.add('travelRecords', newRecord);
  
  // 更新用戶檔案
  await updateUserProfile(record.points, record.carbonSaved, date);
  
  // 同步到 localStorage 以便組件可以訪問
  syncTravelRecordsToLocalStorage();
  
  return id;
};

// 同步出行記錄到 localStorage
export const syncTravelRecordsToLocalStorage = async () => {
  try {
    const records = await getAllTravelRecords();
    
    // 將 IndexedDB 中的記錄轉換為組件期望的格式
    const formattedRecords = records.map(record => ({
      id: record.id,
      date: record.date.toISOString(),
      mode: record.mode,
      distance: record.distance,
      start: record.startLocation,
      end: record.endLocation,
      carbonSaved: record.carbonSaved,
      points: record.points
    }));
    
    localStorage.setItem('travelRecords', JSON.stringify(formattedRecords));
  } catch (error) {
    console.error('同步到 localStorage 失敗:', error);
  }
};

// 獲取所有出行記錄
export const getAllTravelRecords = async () => {
  const db = await initDB();
  return await db.getAll('travelRecords');
};

// 獲取特定日期範圍的出行記錄
export const getTravelRecordsByDateRange = async (startDate: Date, endDate: Date) => {
  const db = await initDB();
  const index = db.transaction('travelRecords').store.index('by-date');
  return await index.getAll(IDBKeyRange.bound(startDate, endDate));
};

// 初始化用戶檔案
const initUserProfile = async () => {
  const db = await initDB();
  const profile = await db.get('userProfile', 'profile');
  
  if (!profile) {
    const newProfile = {
      id: 'profile',
      totalPoints: 0,
      totalCarbonSaved: 0,
      streakDays: 0,
      travelCount: 0,
      lastTravelDate: null,
      achievements: [
        { id: 1, title: '初級環保者', unlocked: false, progress: 0 },
        { id: 2, title: '綠行先鋒', unlocked: false, progress: 0 },
        { id: 3, title: '龍潭路安全達人', unlocked: false, progress: 0 },
        { id: 4, title: '零碳通勤專家', unlocked: false, progress: 0 },
        { id: 5, title: '雲林綠行大師', unlocked: false, progress: 0 },
        { id: 6, title: '全校園探索完成', unlocked: false, progress: 0 }
      ]
    };
    
    await db.add('userProfile', newProfile);
    
    // 同步到 localStorage
    syncUserProfileToLocalStorage(newProfile);
  }
};

// 同步用戶檔案到 localStorage
export const syncUserProfileToLocalStorage = async (profile?: UserProfile) => {
  try {
    if (!profile) {
      profile = await getUserProfile();
      if (!profile) return;
    }
    
    localStorage.setItem('userProfile', JSON.stringify({
      totalPoints: profile.totalPoints,
      totalCarbonSaved: profile.totalCarbonSaved,
      streakDays: profile.streakDays,
      travelCount: profile.travelCount,
      achievements: profile.achievements.map(a => ({
        id: a.id,
        title: a.title,
        progress: a.progress,
        unlocked: a.unlocked
      }))
    }));
  } catch (error) {
    console.error('同步用戶檔案到 localStorage 失敗:', error);
  }
};

// 更新用戶檔案
const updateUserProfile = async (
  points: number, 
  carbonSaved: number, 
  date: Date
) => {
  const db = await initDB();
  
  // 確保用戶檔案存在
  await initUserProfile();
  
  const profile = await db.get('userProfile', 'profile');
  if (!profile) return;
  
  // 計算連續天數
  let streakDays = profile.streakDays;
  if (profile.lastTravelDate) {
    const lastDate = new Date(profile.lastTravelDate);
    // 重置為當天0點進行比較，避免同一天多次記錄的影響
    lastDate.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      // 連續天數+1
      streakDays += 1;
    } else if (dayDiff > 1) {
      // 連續中斷，重置為1
      streakDays = 1;
    }
    // 如果是同一天的記錄，連續天數不變
  } else {
    // 第一次記錄
    streakDays = 1;
  }
  
  // 更新總積分和總減碳量
  const totalPoints = profile.totalPoints + points;
  const totalCarbonSaved = profile.totalCarbonSaved + carbonSaved;
  const travelCount = profile.travelCount + 1;
  
  // 獲取所有出行記錄
  const allRecords = await getAllTravelRecords();
  
  // 更新成就進度
  const achievements = [...profile.achievements];

  // 成就1: 初級環保者 - 累計減少1kg碳排放
  achievements[0].progress = Math.min(100, (totalCarbonSaved / 1) * 100);
  achievements[0].unlocked = totalCarbonSaved >= 1;
  
  // 成就2: 綠行先鋒 - 連續7天使用低碳交通
  achievements[1].progress = Math.min(100, (streakDays / 7) * 100);
  achievements[1].unlocked = streakDays >= 7;
  
  // 成就3: 龍潭路安全達人 - 10次使用龍潭路安全路線
  const dragonPondRecords = allRecords.filter(record => 
    record.startLocation.includes('龍潭') || record.endLocation.includes('龍潭')
  );
  achievements[2].progress = Math.min(100, (dragonPondRecords.length / 10) * 100);
  achievements[2].unlocked = dragonPondRecords.length >= 10;
  
  // 成就4: 零碳通勤專家 - 累計30次零碳出行
  const zeroCarbonRecords = allRecords.filter(record => 
    record.mode === 'walking' || record.mode === 'cycling'
  );
  achievements[3].progress = Math.min(100, (zeroCarbonRecords.length / 30) * 100);
  achievements[3].unlocked = zeroCarbonRecords.length >= 30;
  
  // 成就5: 雲林綠行大師 - 獲得1000點綠點積分
  achievements[4].progress = Math.min(100, (totalPoints / 1000) * 100);
  achievements[4].unlocked = totalPoints >= 1000;
  
  // 成就6: 全校園探索完成 - 訪問校園所有主要建築
  const campusLocations = ['圖書館', '行政大樓', '學生宿舍', '體育館', '工程學院'];
  const visitedLocations = new Set<string>();
  
  allRecords.forEach(record => {
    campusLocations.forEach(location => {
      if (record.startLocation.includes(location) || record.endLocation.includes(location)) {
        visitedLocations.add(location);
      }
    });
  });
  
  achievements[5].progress = Math.min(100, (visitedLocations.size / campusLocations.length) * 100);
  achievements[5].unlocked = visitedLocations.size >= campusLocations.length;

  // 更新用戶檔案
  const updatedProfile = {
    ...profile,
    totalPoints,
    totalCarbonSaved,
    streakDays,
    travelCount,
    lastTravelDate: date,
    achievements
  };
  
  await db.put('userProfile', updatedProfile);
  
  // 同步到localStorage以便快速訪問
  syncUserProfileToLocalStorage(updatedProfile);
};

// 獲取用戶檔案
export const getUserProfile = async (): Promise<UserProfile | undefined> => {
  const db = await initDB();
  
  // 確保用戶檔案存在
  await initUserProfile();
  
  return await db.get('userProfile', 'profile');
};

// 從 localStorage 讀取數據以支援舊版本組件
export const loadFromLocalStorage = () => {
  try {
    // 嘗試從 IndexedDB 同步到 localStorage
    syncUserProfileToLocalStorage();
    syncTravelRecordsToLocalStorage();
    
    // 從 localStorage 獲取用戶檔案
    const profileJson = localStorage.getItem('userProfile');
    if (profileJson) {
      return JSON.parse(profileJson);
    }
    return null;
  } catch (error) {
    console.error('從 localStorage 加載數據失敗:', error);
    return null;
  }
};

// 初始化時同步數據到 localStorage
(async () => {
  try {
    await syncUserProfileToLocalStorage();
    await syncTravelRecordsToLocalStorage();
  } catch (error) {
    console.error('初始化時同步數據失敗:', error);
  }
})();