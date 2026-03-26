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
  label?: string;
}

const DEFAULT_BACKUP = {
  carbs: '현미밥',
  protein: '닭가슴살',
  fats: '아몬드'
};

export const getBMR = (userData: UserData): number => {
  if (!userData) return 0;
  const { weight = 0, height = 0, birthYear = 1996, gender = 'MALE', bodyFat = 0 } = userData;

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
  const activityMap: Record<string, number> = {
    'LOW': 1.2,
    'MEDIUM': 1.55,
    'HIGH': 1.75
  };
  const multiplier = activityMap[userData.workoutIntensity] || 1.55;
  return bmr * multiplier;
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
  // Intensity에 따라 칼로리와 탄수화물 비율을 조절
  let finalCalories = targetCalories;
  let carbRatio = 0.45; // 보통 (Medium)
  let fatRatio = 0.25;

  if (workoutIntensity === 'HIGH') {
    finalCalories = targetCalories * 1.15;
    carbRatio = 0.6; 
  } else if (workoutIntensity === 'LOW') {
    finalCalories = targetCalories * 0.85;
    carbRatio = 0.2;
    fatRatio = 0.4;
  }

  // 3. 최종 영양소 배분
  const proteinG = weight * 2.2; // 보디빌딩 기준 단백질 상향
  const proteinKcal = proteinG * 4;
  
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
      return "오늘은 고강도 훈련일입니다. 충분한 탄수화물로 글리코겐을 충전하세요! 🔥";
    case 'LOW':
      return "오늘은 휴식일입니다. 탄수화물을 줄이고 지방 섭취를 늘려 대사를 조절합니다. 🧘";
    default:
      return "표준 매크로 식단입니다. 일정한 영양 공급으로 컨디션을 유지하세요. 💪";
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
  const { mealCount = 4, workoutTiming = 'AFTERNOON', selectedIngredients = { carbs: [], protein: [], fats: [] }, isReadyMealMode = false } = userData;
  
  const pPerMeal = Math.round(dailyTotal.protein / mealCount);
  const fPerMeal = Math.round(dailyTotal.fat / mealCount);
  
  // 탄수화물 배분 로직 (Carb Timing)
  let carbDistribution = Array(mealCount).fill(1 / mealCount); // 기본 균등 배분
  let labels = Array(mealCount).fill('');

  if (workoutTiming === 'MORNING') {
    // 오전 운동: 아침(Pre), 점심(Post)에 70% 집중
    if (mealCount >= 3) {
      carbDistribution = Array(mealCount).fill(0.1); // 나머지는 10%씩
      carbDistribution[0] = 0.35; // 아침 (Pre-WO)
      carbDistribution[1] = 0.35; // 점심 (Post-WO)
      labels[0] = 'PRE-WO';
      labels[1] = 'POST-WO';
      labels[mealCount-1] = 'BEDTIME';
    }
  } else if (workoutTiming === 'AFTERNOON') {
    // 오후 운동: 2번째(Pre), 3번째(Post) 식사에 집중
    if (mealCount >= 4) {
      carbDistribution = Array(mealCount).fill(0.1);
      carbDistribution[1] = 0.35; // Pre
      carbDistribution[2] = 0.35; // Post
      labels[1] = 'PRE-WO';
      labels[2] = 'POST-WO';
      labels[mealCount-1] = 'BEDTIME';
    } else if (mealCount === 3) {
      carbDistribution = [0.2, 0.6, 0.2];
      labels[1] = 'PRE/POST-WO';
      labels[2] = 'BEDTIME';
    }
  } else if (workoutTiming === 'EVENING') {
    // 저녁 운동: 3번째(Pre), 4번째(Post) 식사에 집중
    if (mealCount >= 4) {
      carbDistribution = Array(mealCount).fill(0.1);
      carbDistribution[2] = 0.35; 
      carbDistribution[3] = 0.35;
      labels[2] = 'PRE-WO';
      labels[3] = 'POST-WO';
    }
  } else {
    // 휴식일 (REST): 균등 배분
    labels[mealCount-1] = 'BEDTIME';
  }

  // 마지막 식사(BEDTIME)는 항상 탄수화물을 최소화하고 단백질/지방 위주로 재조정
  if (workoutTiming !== 'EVENING' || mealCount > 4) {
    const lastIdx = mealCount - 1;
    if (carbDistribution[lastIdx] > 0.1) {
       const excess = carbDistribution[lastIdx] - 0.1;
       carbDistribution[lastIdx] = 0.1;
       // 남은 탄수화물을 다른 식사에 골고루 배분
       const othersCount = mealCount - 1;
       for(let i=0; i<othersCount; i++) carbDistribution[i] += excess/othersCount;
    }
    if (!labels[lastIdx]) labels[lastIdx] = 'BEDTIME';
  }

  const cName = selectedIngredients?.carbs?.[0] || DEFAULT_BACKUP.carbs;
  const pName = selectedIngredients?.protein?.[0] || DEFAULT_BACKUP.protein;
  const fName = selectedIngredients?.fats?.[0] || DEFAULT_BACKUP.fats;

  return Array.from({ length: mealCount }, (_, i) => {
    const targetC = Math.round(dailyTotal.carbs * carbDistribution[i]);
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

    return { 
      id: i, 
      mealName: `식사 ${i + 1}`, 
      label: labels[i],
      macros: { calories: Math.round(targetC * 4 + targetP * 4 + targetF * 9), protein: targetP, carbs: targetC, fat: targetF }, 
      foods 
    };
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
