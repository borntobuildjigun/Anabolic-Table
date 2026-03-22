import { UserData } from '../App';
import { INGREDIENTS } from './ingredients';

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

const DEFAULT_BACKUP = {
  carbs: '현미밥',
  protein: '닭가슴살',
  fats: '아몬드'
};

export const calculateMacros = (userData: UserData): Macros => {
  if (!userData) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  const { weight = 0, height = 0, age = 0, gender = 'MALE', goal = 'BULK', activityLevel = 1.2 } = userData;
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
  let fatKcal = Math.max(0, targetCalories * 0.22);
  let carbKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.round(carbKcal / 4),
    fat: Math.round(fatKcal / 9),
  };
};

export const generateOptimizedMealPlan = (userData: UserData): MealPlan[] => {
  if (!userData) return [];
  
  const dailyTotal = calculateMacros(userData);
  const { mealCount = 3, workoutTime = "14:00", selectedIngredients = { carbs: [], protein: [], fats: [] }, isReadyMealMode = false } = userData;
  
  const pPerMeal = Math.round(dailyTotal.protein / (mealCount || 1));
  const fPerMeal = Math.round(dailyTotal.fat / (mealCount || 1));
  
  // workoutTime 안전하게 처리
  const timeParts = workoutTime?.split(':') || ["14", "00"];
  const wHour = Number(timeParts[0] || 14);
  
  const mealIndices = Array.from({ length: mealCount }, (_, i) => 8 + i * 4);
  const diffs = mealIndices.map(time => Math.abs(time - wHour));
  const sorted = [...Array(mealCount).keys()].sort((a, b) => diffs[a] - diffs[b]);
  const fuelIndices = sorted.slice(0, 2);

  const fuelCarbsTotal = dailyTotal.carbs * 0.65;
  const otherCarbsTotal = dailyTotal.carbs - fuelCarbsTotal;
  const fuelCPerMeal = Math.round(fuelCarbsTotal / 2);
  const otherCPerMeal = Math.round(otherCarbsTotal / Math.max(1, mealCount - 2));

  const cName = selectedIngredients?.carbs?.[0] || DEFAULT_BACKUP.carbs;
  const pName = selectedIngredients?.protein?.[0] || DEFAULT_BACKUP.protein;
  const fName = selectedIngredients?.fats?.[0] || DEFAULT_BACKUP.fats;

  return Array.from({ length: mealCount }, (_, i) => {
    const isFuel = fuelIndices.includes(i);
    const targetC = isFuel ? fuelCPerMeal : otherCPerMeal;
    const targetP = pPerMeal;
    const targetF = fPerMeal;

    const calculateWeight = (type: 'carbs' | 'protein' | 'fats', amount: number, name: string) => {
      const ing = INGREDIENTS[type][name] || INGREDIENTS[type][DEFAULT_BACKUP[type]];
      const macroValue = type === 'carbs' ? ing.carbs : type === 'protein' ? ing.protein : ing.fat;
      const weight = Math.round((amount / (macroValue || 1)) * 100);

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

    const foods: FoodItem[] = [
      calculateWeight('carbs', targetC, cName),
      calculateWeight('protein', targetP, pName)
    ];
    if (targetF > 2) foods.push(calculateWeight('fats', targetF, fName));

    return {
      id: i,
      mealName: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} MEAL`,
      macros: {
        calories: Math.round(targetC * 4 + targetP * 4 + targetF * 9),
        protein: targetP,
        carbs: targetC,
        fat: targetF,
        isWorkoutFuel: isFuel
      },
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
