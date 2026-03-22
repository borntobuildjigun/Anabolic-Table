import { UserData } from '../App';
import { INGREDIENTS, Ingredient } from './ingredients';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isWorkoutFuel?: boolean;
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

// 오차 범위 허용 (5g)
const MACRO_ERROR_MARGIN = 5;

// 기본 재료 (재료 선택 안했을 시 백업)
const DEFAULT_FOODS = {
  carbs: '현미밥',
  protein: '닭가슴살',
  fats: '아몬드'
};

export const calculateMacros = (userData: UserData): Macros => {
  const { weight, height, age, gender, goal, activityLevel } = userData;
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'MALE') bmr += 5;
  else bmr -= 161;

  const tdee = bmr * activityLevel;
  let targetCalories = tdee;
  const proteinG = weight * 2.0;

  if (goal === 'BULK') targetCalories += 400;
  else if (goal === 'LEAN') targetCalories += 200;
  else if (goal === 'CUT') targetCalories -= 500;

  const proteinKcal = proteinG * 4;
  let fatKcal = targetCalories * 0.22;
  let carbKcal = targetCalories - proteinKcal - fatKcal;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.max(0, Math.round(carbKcal / 4)),
    fat: Math.round(fatKcal / 9),
  };
};

/**
 * 그리디 알고리즘 기반 식단 생성 (최적화 버전)
 */
export const generateOptimizedMealPlan = (userData: UserData): MealPlan[] => {
  const totalMacros = calculateMacros(userData);
  const { mealCount, workoutTime, selectedIngredients, isReadyMealMode } = userData;
  
  // 1. 끼니별 매크로 분배 (Workout Timing 적용)
  const [wHour] = workoutTime.split(':').map(Number);
  const mealIndices = Array.from({ length: mealCount }, (_, i) => 8 + i * 4);
  const diffs = mealIndices.map(time => Math.abs(time - wHour));
  const sortedIndices = [...Array(mealCount).keys()].sort((a, b) => diffs[a] - diffs[b]);
  const workoutFuelIndices = sortedIndices.slice(0, 2);

  const fuelCarbsTotal = totalMacros.carbs * 0.65;
  const otherCarbsTotal = totalMacros.carbs - fuelCarbsTotal;
  
  const fuelCarbPerMeal = fuelCarbsTotal / 2;
  const otherCarbPerMeal = otherCarbsTotal / (mealCount - 2 || 1);
  const pPerMeal = totalMacros.protein / mealCount;
  const fPerMeal = totalMacros.fat / mealCount;

  const plan: MealPlan[] = [];

  for (let i = 0; i < mealCount; i++) {
    const isFuel = workoutFuelIndices.includes(i);
    const targetC = isFuel ? fuelCarbPerMeal : otherCarbPerMeal;
    const targetP = pPerMeal;
    const targetF = fPerMeal;

    // 2. 음식 중량 계산 (Greedy)
    const foods: FoodItem[] = [];
    
    // 재료 선택 안했을 시 기본 재료 사용
    const cName = selectedIngredients.carbs[0] || DEFAULT_FOODS.carbs;
    const pName = selectedIngredients.protein[0] || DEFAULT_FOODS.protein;
    const fName = selectedIngredients.fats[0] || DEFAULT_FOODS.fats;

    const calcFood = (type: 'carbs' | 'protein' | 'fats', amount: number, name: string) => {
      const ing = INGREDIENTS[type][name] || INGREDIENTS[type][DEFAULT_FOODS[type]];
      const macroPer100 = type === 'carbs' ? ing.carbs : type === 'protein' ? ing.protein : ing.fat;
      const weight = Math.round((amount / (macroPer100 || 1)) * 100);

      if (isReadyMealMode && ing.readyMealUnit) {
        return {
          name: ing.name,
          weight: ing.readyMealUnit.weight,
          unit: ing.readyMealUnit.name,
          isReady: true,
          readyValue: (weight / ing.readyMealUnit.weight).toFixed(1)
        };
      }
      return { name: ing.name, weight, unit: 'g' };
    };

    foods.push(calcFood('carbs', targetC, cName));
    foods.push(calcFood('protein', targetP, pName));
    if (targetF > 3) foods.push(calcFood('fats', targetF, fName));

    plan.push({
      id: i,
      mealName: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} MEAL`,
      macros: {
        calories: Math.round(targetC * 4 + targetP * 4 + targetF * 9),
        protein: Math.round(targetP),
        carbs: Math.round(targetC),
        fat: Math.round(targetF),
        isWorkoutFuel: isFuel
      },
      foods
    });
  }

  return plan;
};

export const calculateWaterIntake = (weight: number): number => weight * 0.05;

export const getAIRecommendation = (macros: Macros, userData: UserData): string[] => {
  const recs: string[] = [];
  if (userData.goal === 'BULK' && macros.calories < 2500) recs.push("벌크업을 위해 견과류를 추가하여 칼로리를 높이세요.");
  if (macros.fat < 40) recs.push("지방이 부족합니다. 아몬드 10알을 추가하세요.");
  return recs;
};
