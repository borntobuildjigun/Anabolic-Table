import { UserData } from '../App';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const calculateMacros = (userData: UserData): Macros => {
  const { weight, height, age, gender, goal, activityLevel } = userData;

  // Mifflin-St Jeor Formula
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'MALE') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const tdee = bmr * activityLevel;

  let targetCalories = tdee;
  let pRatio = 2.2; // 2.2g per kg (Standard bodybuilding)
  let fRatio = 0.8; // 0.8g per kg

  if (goal === 'BULK') {
    targetCalories += 500;
    fRatio = 1.0;
  } else if (goal === 'LEAN') {
    targetCalories += 200;
    fRatio = 0.8;
  } else if (goal === 'CUT') {
    targetCalories -= 500;
    fRatio = 0.6;
  }

  const proteinG = weight * pRatio;
  const fatG = weight * fRatio;
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbKcal = targetCalories - proteinKcal - fatKcal;
  const carbG = carbKcal / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.round(carbG),
    fat: Math.round(fatG),
  };
};

export const distributeMacros = (totalMacros: Macros, mealCount: number): Macros[] => {
  const meals: Macros[] = [];
  
  // Simple even distribution, but could be adjusted for pre/post workout
  const pPerMeal = totalMacros.protein / mealCount;
  const cPerMeal = totalMacros.carbs / mealCount;
  const fPerMeal = totalMacros.fat / mealCount;
  const calPerMeal = totalMacros.calories / mealCount;

  for (let i = 0; i < mealCount; i++) {
    meals.push({
      calories: Math.round(calPerMeal),
      protein: Math.round(pPerMeal),
      carbs: Math.round(cPerMeal),
      fat: Math.round(fPerMeal),
    });
  }

  return meals;
};
