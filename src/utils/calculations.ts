import { UserData } from '../App';
import { INGREDIENTS } from './ingredients';

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
  const { weight = 0, height = 0, birthYear = 1995, gender = 'MALE' } = userData;
  const age = 2026 - birthYear;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'MALE' ? bmr + 5 : bmr - 161;
};

export const getTDEE = (userData: UserData): number => {
  const bmr = getBMR(userData);
  return bmr * (userData.activityLevel || 1.2);
};

export const calculateMacros = (userData: UserData): Macros => {
  const tdee = getTDEE(userData);
  const bmr = getBMR(userData);
  const { weight = 0, targetWeight = 0, targetWeeks = 8, goal = 'BULK' } = userData;
  
  let targetCalories = tdee;

  if (goal === 'BULK') {
    targetCalories += 400;
  } else if (goal === 'LEAN') {
    targetCalories += 200;
  } else if (goal === 'CUT') {
    // 과학적 결손 계산: (감량 kg * 7700) / (주 * 7일)
    const weightToLose = Math.max(0, weight - targetWeight);
    const totalDeficitKcal = weightToLose * 7700;
    const dailyDeficitNeeded = totalDeficitKcal / (targetWeeks * 7);
    
    targetCalories = tdee - dailyDeficitNeeded;
    
    // 안전 장치: 기초대사량(BMR)의 90% 이하로 떨어질 경우 BMR 수준으로 조정
    const minimumSafetyCalories = bmr * 0.9;
    if (targetCalories < minimumSafetyCalories) {
      targetCalories = bmr;
    }
  }

  const proteinG = weight * 2.0;
  const proteinKcal = proteinG * 4;
  let fatKcal = Math.max(0, targetCalories * 0.22);
  let carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.max(0, Math.round(carbKcal / 4)),
    fat: Math.round(fatKcal / 9),
  };
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

  // 안전 장치 경고 문구
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

  if (isRestDay) {
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
