import { UserData } from '../App';
import { INGREDIENTS } from './ingredients';

export type CarbCycle = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isWorkoutFuel?: boolean;
}

export interface WeightLossReportData {
  dailyDeficit: number;
  dailyLossG: number;
  weeklyLossKg: number;
  weeksToTarget: number;
  isWarning: boolean;
  isIdeal: boolean;
  warningMsg: string;
  achievementRate: number;
}

export interface FoodItem {
  name: string;
  weight: number;
  unit: string;
  isReady?: boolean;
  readyValue?: string;
}

export interface MealPlan {
  id: number;
  mealName: string;
  macros: Macros;
  foods: FoodItem[];
}

const DEFAULT_BACKUP = {
  carbs: '현미밥',
  protein: '닭가슴살',
  fats: '아몬드'
};

export const getBMR = (userData: UserData): number => {
  if (!userData) return 0;
  const { weight = 0, height = 0, birthYear = 1995, gender = 'MALE', bodyFat = 0 } = userData;

  if (bodyFat > 0) {
    const lbm = weight * (1 - bodyFat / 100);
    return 370 + (21.6 * lbm);
  }

  const age = 2026 - birthYear;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'MALE' ? bmr + 5 : bmr - 161;
};

export const getFormulaName = (userData: UserData): string => {
  return (userData?.bodyFat && userData.bodyFat > 0) ? "Katch-McArdle" : "Mifflin-St Jeor";
};

export const getTDEE = (userData: UserData): number => {
  const bmr = getBMR(userData);
  return bmr * (userData.activityLevel || 1.2);
};

/**
 * 탄수화물 사이클링 기반 매크로 계산 로직
 */
export const calculateMacros = (userData: UserData): Macros => {
  const tdee = getTDEE(userData);
  const bmr = getBMR(userData);
  const { weight = 0, targetWeight = 0, targetWeeks = 8, goal = 'BULK', workoutIntensity = 'MEDIUM' } = userData;
  
  let targetCalories = tdee;

  // 1. 기본 목표 기반 칼로리 설정
  if (goal === 'BULK') {
    targetCalories += 400;
  } else if (goal === 'LEAN') {
    targetCalories += 200;
  } else if (goal === 'CUT') {
    const weightToLose = Math.max(0, weight - targetWeight);
    const totalDeficitKcal = weightToLose * 7700;
    const dailyDeficitNeeded = totalDeficitKcal / (targetWeeks * 7);
    targetCalories = tdee - dailyDeficitNeeded;
    
    const minimumSafetyCalories = bmr * 0.9;
    if (targetCalories < minimumSafetyCalories) {
      targetCalories = bmr;
    }
  }

  // 2. 탄수화물 사이클링(Carb Cycling) 조정
  let finalCalories = targetCalories;
  let carbRatio = 0.45; // 기본 탄수화물 비율
  let fatRatio = 0.25;

  if (workoutIntensity === 'HIGH') {
    finalCalories *= 1.1; // 칼로리 10% 증량
    carbRatio = 0.55; // 탄수화물 비중 대폭 강화
  } else if (workoutIntensity === 'LOW') {
    carbRatio = 0.25; // 탄수화물 비중 절반으로 축소
    fatRatio = 0.35; // 부족한 에너지를 지방으로 보충
  }

  // 3. 최종 영양소 배분
  const proteinG = weight * 2.0;
  const proteinKcal = proteinG * 4;
  
  // 탄수화물과 지방 계산 (나머지 칼로리 내에서 비율 조정)
  const remainingKcal = finalCalories - proteinKcal;
  let carbKcal = remainingKcal * (carbRatio / (carbRatio + fatRatio));
  let fatKcal = remainingKcal - carbKcal;

  return {
    calories: Math.round(finalCalories),
    protein: Math.round(proteinG),
    carbs: Math.max(0, Math.round(carbKcal / 4)),
    fat: Math.max(0, Math.round(fatKcal / 9)),
  };
};

export const getCarbCycleCoaching = (userData: UserData): string => {
  const intensity = userData.workoutIntensity || 'MEDIUM';
  switch (intensity) {
    case 'HIGH':
      return "오늘은 하체나 등 같은 대근육 운동 날이군요! 퍼포먼스를 위해 탄수화물을 전략적으로 증량했습니다. 🔥";
    case 'LOW':
      return "오늘은 휴식 또는 유산소 날입니다. 인슐린 민감도를 높이기 위해 탄수화물을 줄이고 건강한 지방을 배치했습니다. 🧘";
    default:
      return "일반적인 웨이트 트레이닝에 최적화된 표준 매크로입니다. 꾸준함이 정답입니다. 💪";
  }
};

export const calculateWeightLossReport = (userData: UserData): WeightLossReportData => {
  const tdee = getTDEE(userData);
  const bmr = getBMR(userData);
  const macros = calculateMacros(userData);
  const deficit = tdee - macros.calories;
  
  const dailyLossG = (deficit / 7700) * 1000;
  const weeklyLossKg = (dailyLossG * 7) / 1000;
  
  const weightToLose = userData.weight - userData.targetWeight;
  const totalDeficitNeeded = weightToLose * 7700;
  const dailyDeficitNeeded = totalDeficitNeeded / (userData.targetWeeks * 7);

  let isWarning = false;
  let warningMsg = "";

  if (tdee - dailyDeficitNeeded < bmr * 0.9) {
    isWarning = true;
    warningMsg = "⚠️ 설정하신 기간이 너무 짧아 건강한 감량이 어렵습니다. 기간을 늘리는 것을 권장합니다.";
  }

  const achievementRate = Math.min(100, Math.max(0, (deficit / dailyDeficitNeeded) * 100)) || 0;

  return {
    dailyDeficit: Math.round(deficit),
    dailyLossG: Math.round(dailyLossG),
    weeklyLossKg: Number(weeklyLossKg.toFixed(2)),
    weeksToTarget: userData.targetWeeks,
    isWarning,
    isIdeal: achievementRate >= 95,
    warningMsg,
    achievementRate: Math.round(achievementRate)
  };
};

export const generateOptimizedMealPlan = (userData: UserData): MealPlan[] => {
  if (!userData) return [];
  const dailyTotal = calculateMacros(userData);
  const { mealCount = 3, workoutTime = "14:00", isRestDay = false, selectedIngredients = { carbs: [], protein: [], fats: [] }, isReadyMealMode = false } = userData;
  const pPerMeal = Math.round(dailyTotal.protein / (mealCount || 1));
  const fPerMeal = Math.round(dailyTotal.fat / (mealCount || 1));
  
  let fuelCPerMeal = 0;
  let otherCPerMeal = 0;
  let fuelIndices: number[] = [];

  if (isRestDay || userData.workoutIntensity === 'LOW') {
    fuelCPerMeal = Math.round(dailyTotal.carbs / mealCount);
    otherCPerMeal = fuelCPerMeal;
  } else {
    const timeParts = workoutTime?.split(':') || ["14", "00"];
    const wHour = Number(timeParts[0] || 14);
    const mealIndices = Array.from({ length: mealCount }, (_, i) => 8 + i * 4);
    const diffs = mealIndices.map(time => Math.abs(time - wHour));
    const sorted = [...Array(mealCount).keys()].sort((a, b) => diffs[a] - diffs[b]);
    fuelIndices = sorted.slice(0, 2);
    const fuelCarbsTotal = dailyTotal.carbs * 0.65;
    const otherCarbsTotal = dailyTotal.carbs - fuelCarbsTotal;
    fuelCPerMeal = Math.round(fuelCarbsTotal / 2);
    otherCPerMeal = Math.round(otherCarbsTotal / Math.max(1, mealCount - 2));
  }

  const cName = selectedIngredients?.carbs?.[0] || DEFAULT_BACKUP.carbs;
  const pName = selectedIngredients?.protein?.[0] || DEFAULT_BACKUP.protein;
  const fName = selectedIngredients?.fats?.[0] || DEFAULT_BACKUP.fats;

  return Array.from({ length: mealCount }, (_, i) => {
    const isFuel = !isRestDay && fuelIndices.includes(i);
    const targetC = isFuel ? fuelCPerMeal : (isRestDay ? Math.round(dailyTotal.carbs / mealCount) : otherCPerMeal);
    const targetP = pPerMeal;
    const targetF = fPerMeal;

    const calculateWeight = (type: 'carbs' | 'protein' | 'fats', amount: number, name: string) => {
      const ing = INGREDIENTS[type][name] || INGREDIENTS[type][DEFAULT_BACKUP[type]];
      const macroValue = type === 'carbs' ? ing.carbs : type === 'protein' ? ing.protein : ing.fat;
      const weight = Math.round((amount / (macroValue || 1)) * 100);
      if (isReadyMealMode && ing.readyMealUnit) {
        return { name: ing.name, weight: ing.readyMealUnit.weight, unit: ing.readyMealUnit.name, isReady: true, readyValue: (weight / ing.readyMealUnit.weight).toFixed(1) };
      }
      return { name: ing.name, weight, unit: 'g' };
    };

    const foods: FoodItem[] = [calculateWeight('carbs', targetC, cName), calculateWeight('protein', targetP, pName)];
    if (targetF > 2) foods.push(calculateWeight('fats', targetF, fName));

    return { id: i, mealName: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} MEAL`, macros: { calories: Math.round(targetC * 4 + targetP * 4 + targetF * 9), protein: targetP, carbs: targetC, fat: targetF, isWorkoutFuel: isFuel }, foods };
  });
};

export const calculateWaterIntake = (weight: number): number => (weight || 0) * 0.05;

export const getAIRecommendation = (macros: Macros, userData: UserData): string[] => {
  if (!macros || !userData) return [];
  const recs: string[] = [];
  if (userData.goal === 'BULK' && macros.calories < 2500) recs.push("칼로리가 부족합니다. 견과류 섭취를 늘리세요.");
  if (macros.fat < 35) recs.push("지방이 부족합니다. 아몬드 10알을 추가하세요.");
  return recs;
};
