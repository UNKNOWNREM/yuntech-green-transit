// 碳排放計算服務
// 提供碳足跡計算和積分計算功能

// 不同交通方式的碳排放係數 (g CO2/km)
interface EmissionFactors {
  [key: string]: number;
}

const emissionFactors: EmissionFactors = {
  walking: 0,      // 步行無碳排放
  cycling: 0,      // 自行車無碳排放
  bus: 68,         // 公車每公里約68g CO2
  carpool: 48,     // 共乘每公里約48g CO2 (假設4人共乘)
  motorcycle: 103, // 機車每公里約103g CO2
  car: 192         // 自駕車每公里約192g CO2
};

// 不同交通方式的基礎積分
interface PointFactors {
  [key: string]: number;
}

const pointFactors: PointFactors = {
  walking: 10,    // 步行獲得最高積分
  cycling: 8,     // 自行車積分次之
  bus: 5,         // 公車
  carpool: 4,     // 共乘
  motorcycle: 2,  // 機車
  car: 1          // 自駕車獲得最低積分
};

/**
 * 計算特定交通方式的碳排放量
 * @param mode 交通方式
 * @param distance 距離(公里)
 * @returns 碳排放量(kg CO2)
 */
export const calculateEmission = (mode: string, distance: number): number => {
  const factor = emissionFactors[mode] || 0;
  return (factor * distance) / 1000; // 轉換為kg
};

/**
 * 計算相比自駕車節省的碳排放量
 * @param mode 交通方式
 * @param distance 距離(公里)
 * @returns 節省的碳排放量(kg CO2)
 */
export const calculateEmissionSaved = (mode: string, distance: number): number => {
  const carEmission = calculateEmission('car', distance);
  const modeEmission = calculateEmission(mode, distance);
  return Math.max(0, carEmission - modeEmission);
};

/**
 * 計算獲得的積分
 * @param mode 交通方式
 * @param distance 距離(公里)
 * @param streakDays 連續天數
 * @returns 獲得的積分
 */
export const calculatePoints = (mode: string, distance: number, streakDays: number = 0): number => {
  const baseFactor = pointFactors[mode] || 0;
  
  // 基礎積分 = 基礎係數 * 距離
  let points = baseFactor * distance;
  
  // 連續天數加成 (每連續5天增加10%加成，最高50%)
  const streakBonus = Math.min(0.5, Math.floor(streakDays / 5) * 0.1);
  points = points * (1 + streakBonus);
  
  // 四捨五入到整數
  return Math.round(points);
};

/**
 * 計算碳排放節省量相當於種植的樹木數量
 * @param carbonSaved 節省的碳排放量(kg CO2)
 * @returns 相當於種植的樹木數量
 */
export const calculateTreesEquivalent = (carbonSaved: number): number => {
  // 一棵樹每年約吸收20kg CO2
  return carbonSaved / 20;
};
