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

  // 1. 단백질 우선 배분 (체중당 2g)
  const proteinG = weight * 2.0;
  const proteinKcal = proteinG * 4;

  // 2. 목적별 칼로리 조정
  if (goal === 'BULK') {
    targetCalories += 400; // 벌크업: +300~500의 중간값
  } else if (goal === 'LEAN') {
    targetCalories += 200;
  } else if (goal === 'CUT') {
    targetCalories -= 500;
  }

  // 3. 지방 및 탄수화물 배분
  // 지방은 총 칼로리의 20-25% 권장
  let fatKcal = targetCalories * 0.22;
  let fatG = fatKcal / 9;

  // 남은 칼로리를 탄수화물로
  let carbKcal = targetCalories - proteinKcal - fatKcal;
  let carbG = carbKcal / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.round(carbG),
    fat: Math.round(fatG),
  };
};

export const getAIRecommendation = (macros: Macros, userData: UserData): string[] => {
  const recommendations: string[] = [];
  const { goal } = userData;

  if (goal === 'BULK' && macros.calories < 2500) {
    recommendations.push("벌크업을 위해 견과류나 땅콩버터를 추가하여 칼로리 밀도를 높이세요.");
  }
  if (macros.fat < 40) {
    recommendations.push("지방 섭취량이 부족합니다. 아몬드 10알 또는 오메가-3 보충을 권장합니다.");
  }
  if (goal === 'CUT' && macros.carbs > 200) {
    recommendations.push("커팅 중 탄수화물이 다소 높습니다. 섬유질이 풍부한 채소 비중을 늘리세요.");
  }

  return recommendations;
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
