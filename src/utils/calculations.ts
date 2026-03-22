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
  daysToTarget: number;
  isWarning: boolean;
  warningMsg: string;
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

export const getTDEE = (userData: UserData): number => {
  if (!userData) return 0;
  const { weight = 0, height = 0, birthYear = 1995, gender = 'MALE', activityLevel = 1.2 } = userData;
  const age = 2026 - birthYear;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'MALE') bmr += 5;
  else bmr -= 161;
  return bmr * activityLevel;
};

export const calculateMacros = (userData: UserData): Macros => {
  const tdee = getTDEE(userData);
  const { weight = 0, goal = 'BULK' } = userData;
  let targetCalories = tdee;
  const proteinG = weight * 2.0;

  if (goal === 'BULK') targetCalories += 400;
  else if (goal === 'LEAN') targetCalories += 200;
  else if (goal === 'CUT') targetCalories -= 500;

  const proteinKcal = proteinG * 4;
  let fatKcal = Math.max(0, targetCalories * 0.22);
  let carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.round(carbKcal / 4),
    fat: Math.round(fatKcal / 9),
  };
};

export const calculateWeightLossReport = (userData: UserData): WeightLossReportData => {
  const tdee = getTDEE(userData);
  const macros = calculateMacros(userData);
  const deficit = tdee - macros.calories;
  
  // 체지방 1kg = 7,700kcal
  const dailyLossG = (deficit / 7700) * 1000;
  const weeklyLossKg = (dailyLossG * 7) / 1000;
  
  const weightToLose = userData.weight - userData.targetWeight;
  const daysToTarget = dailyLossG > 0 ? Math.ceil((weightToLose * 1000) / dailyLossG) : 0;

  let isWarning = false;
  let warningMsg = "";

  if (weeklyLossKg > userData.weight * 0.01) {
    isWarning = true;
    warningMsg = "감량 속도가 너무 빠릅니다. 근손실 위험이 있으니 식단량을 조금 늘리는 것을 추천합니다.";
  } else if (deficit <= 0 && userData.goal === 'CUT') {
    isWarning = true;
    warningMsg = "현재 칼로리 설정으로는 감량이 어려울 수 있습니다. 활동량을 늘리거나 목표를 조정하세요.";
  }

  return {
    dailyDeficit: Math.round(deficit),
    dailyLossG: Math.round(dailyLossG),
    weeklyLossKg: Number(weeklyLossKg.toFixed(2)),
    daysToTarget: Math.max(0, daysToTarget),
    isWarning,
    warningMsg
  };
};

export const generateOptimizedMealPlan = (userData: UserData): MealPlan[] => {
  if (!userData) return [];
  const dailyTotal = calculateMacros(userData);
  const { mealCount = 3, workoutTime = "14:00", isRestDay = false, selectedIngredients = { carbs: [], protein: [], fats: [] }, isReadyMealMode = false } = userData;
  const pPerMeal = Math.round(dailyTotal.protein / (mealCount || 1));
  const fPerMeal = Math.round(dailyTotal.fat / (mealCount || 1));
  
  let fuelIndices: number[] = [];
  let fuelCPerMeal = 0;
  let otherCPerMeal = 0;

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
    const targetC = isFuel || isRestDay ? (isRestDay ? Math.round(dailyTotal.carbs / mealCount) : fuelCPerMeal) : otherCPerMeal;
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
