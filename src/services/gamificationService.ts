// 遊戲化激勵系統服務
import { getUserProfile } from './storageService';

// 任務類型定義
export interface Task {
  id: number;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  requirement: {
    type: 'travel_count' | 'carbon_saved' | 'streak' | 'specific_route';
    value: number;
    mode?: string;
    route?: string;
  };
  reward: {
    points: number;
    badge?: string;
  };
  completed: boolean;
  progress: number;
}

// 預設任務列表
// 預設任務列表
const defaultTasks: Task[] = [
  {
    id: 1,
    title: '今日綠色通勤',
    description: '今天使用步行、自行車或公車出行',
    type: 'daily',
    requirement: {
      type: 'travel_count',
      value: 1,
      mode: 'green'
    },
    reward: {
      points: 20
    },
    completed: false,
    progress: 0
  },
  {
    id: 2,
    title: '減碳先鋒',
    description: '累計減少碳排放達到5kg',
    type: 'weekly',
    requirement: {
      type: 'carbon_saved',
      value: 5
    },
    reward: {
      points: 50,
      badge: '減碳先鋒'
    },
    completed: false,
    progress: 0
  },
  {
    id: 3,
    title: '連續環保',
    description: '連續3天使用低碳交通方式',
    type: 'special',
    requirement: {
      type: 'streak',
      value: 3
    },
    reward: {
      points: 100,
      badge: '環保達人'
    },
    completed: false,
    progress: 0
  },
  {
    id: 4,
    title: '龍潭路安全通行',
    description: '使用龍潭路安全路線',
    type: 'daily',
    requirement: {
      type: 'specific_route',
      value: 1,
      route: 'dragon_pond_safe'
    },
    reward: {
      points: 30
    },
    completed: false,
    progress: 0
  },
  {
    id: 5,
    title: '通勤達人',
    description: '一日內使用多種綠色交通方式',
    type: 'daily',
    requirement: {
      type: 'travel_count',
      value: 2,
      mode: 'green'
    },
    reward: {
      points: 30
    },
    completed: false,
    progress: 0
  },
  {
    id: 6,
    title: '校園健行者',
    description: '在校園內步行累計1公里',
    type: 'daily',
    requirement: {
      type: 'travel_count',
      value: 1,
      mode: 'walking'
    },
    reward: {
      points: 15
    },
    completed: false,
    progress: 0
  },
  {
    id: 7,
    title: '週週自行車',
    description: '一週內使用自行車出行至少3次',
    type: 'weekly',
    requirement: {
      type: 'travel_count',
      value: 3,
      mode: 'cycling'
    },
    reward: {
      points: 50,
      badge: '單車愛好者'
    },
    completed: false,
    progress: 0
  },
  {
    id: 8,
    title: '公共交通支持者',
    description: '一週內搭乘公車至少5次',
    type: 'weekly',
    requirement: {
      type: 'travel_count',
      value: 5,
      mode: 'bus'
    },
    reward: {
      points: 60,
      badge: '公車達人'
    },
    completed: false,
    progress: 0
  },
  {
    id: 9,
    title: '校園探索者',
    description: '造訪校園內的5個不同建築物',
    type: 'special',
    requirement: {
      type: 'travel_count',
      value: 5,
      mode: 'exploration'
    },
    reward: {
      points: 75,
      badge: '校園探險家'
    },
    completed: false,
    progress: 0
  },
  {
    id: 10,
    title: '火車通勤挑戰',
    description: '使用火車站路線完成往返',
    type: 'special',
    requirement: {
      type: 'specific_route',
      value: 1,
      route: 'station_route'
    },
    reward: {
      points: 40,
      badge: '火車愛好者'
    },
    completed: false,
    progress: 0
  },
  {
    id: 11,
    title: '氣候勇士',
    description: '雨天仍使用綠色交通方式',
    type: 'special',
    requirement: {
      type: 'travel_count',
      value: 1,
      mode: 'rainy_green'
    },
    reward: {
      points: 50,
      badge: '全天候環保者'
    },
    completed: false,
    progress: 0
  },
  {
    id: 12,
    title: '減碳達人',
    description: '累計減少10kg碳排放',
    type: 'special',
    requirement: {
      type: 'carbon_saved',
      value: 10
    },
    reward: {
      points: 100,
      badge: '地球守護者'
    },
    completed: false,
    progress: 0
  }
];

// 獲取當前任務列表
export const getTasks = async (): Promise<Task[]> => {
  try {
    // 從本地存儲獲取任務
    const tasksJson = localStorage.getItem('tasks');
    if (tasksJson) {
      return JSON.parse(tasksJson);
    }
    
    // 如果沒有存儲的任務，返回默認任務
    return resetDailyTasks();
  } catch (error) {
    console.error('獲取任務失敗:', error);
    return defaultTasks;
  }
};

// 重置每日任務
export const resetDailyTasks = (): Task[] => {
  const tasks = defaultTasks.map(task => ({
    ...task,
    completed: false,
    progress: 0
  }));
  
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('保存任務失敗:', error);
  }
  
  return tasks;
};

// 更新任務進度
export const updateTaskProgress = async (taskId: number, progress: number): Promise<Task[]> => {
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return tasks;
  
  const task = tasks[taskIndex];
  const newProgress = Math.min(100, (progress / task.requirement.value) * 100);
  const completed = newProgress >= 100;
  
  tasks[taskIndex] = {
    ...task,
    progress: newProgress,
    completed
  };
  
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('保存任務失敗:', error);
  }
  
  return tasks;
};

// 檢查任務完成情況
export const checkTaskCompletion = async (
  mode: string,
  route?: string
): Promise<{tasks: Task[], rewards: {points: number, badges: string[]}}> => {
  const tasks = await getTasks();
  const profile = await getUserProfile();
  
  if (!profile) {
    return { tasks, rewards: { points: 0, badges: [] } };
  }
  
  const isGreenMode = ['walking', 'cycling', 'bus'].includes(mode);
  const rewards = { points: 0, badges: [] as string[] };
  
  // 檢查每個任務
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (task.completed) continue;
    
    let progress = task.progress;
    let completed = false;
    
    switch (task.requirement.type) {
      case 'travel_count':
        if (task.requirement.mode === 'green' && isGreenMode) {
          progress = 100;
          completed = true;
        } else if (task.requirement.mode === mode) {
          progress = 100;
          completed = true;
        }
        break;
        
      case 'carbon_saved':
        // 假設carbonSaved是從profile中獲取的總減碳量
        progress = Math.min(100, (profile.totalCarbonSaved / task.requirement.value) * 100);
        completed = progress >= 100;
        break;
        
      case 'streak':
        progress = Math.min(100, (profile.streakDays / task.requirement.value) * 100);
        completed = progress >= 100;
        break;
        
      case 'specific_route':
        if (route === task.requirement.route) {
          progress = 100;
          completed = true;
        }
        break;
    }
    
    // 更新任務狀態
    if (progress !== task.progress || completed !== task.completed) {
      tasks[i] = {
        ...task,
        progress,
        completed
      };
      
      // 如果任務完成，添加獎勵
      if (completed && !task.completed) {
        rewards.points += task.reward.points;
        if (task.reward.badge) {
          rewards.badges.push(task.reward.badge);
        }
      }
    }
  }
  
  // 保存更新後的任務
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('保存任務失敗:', error);
  }
  
  return { tasks, rewards };
};
