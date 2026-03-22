import { UserData } from '../App';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isWorkoutFuel?: boolean;
}

export const calculateMacros = (userData: UserData): Macros => {
  const { weight, height, age, gender, goal, activityLevel } = userData;

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'MALE') bmr += 5;
  else bmr -= 161;

  const tdee = bmr * activityLevel;
  let targetCalories = tdee;
  
  const proteinG = weight * 2.0;
  const proteinKcal = proteinG * 4;

  if (goal === 'BULK') targetCalories += 400;
  else if (goal === 'LEAN') targetCalories += 200;
  else if (goal === 'CUT') targetCalories -= 500;

  let fatKcal = targetCalories * 0.22;
  let fatG = fatKcal / 9;

  let carbKcal = targetCalories - proteinKcal - fatKcal;
  let carbG = carbKcal / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinG),
    carbs: Math.round(carbG),
    fat: Math.round(fatG),
  };
};

export const calculateWaterIntake = (weight: number): number => {
  return (weight * 0.05); // 10kg당 0.5L = 체중 * 0.05
};

export const getAIRecommendation = (macros: Macros, userData: UserData): string[] => {
  const recommendations: string[] = [];
  const { goal } = userData;

  if (goal === 'BULK' && macros.calories < 2500) recommendations.push("벌크업을 위해 견과류나 땅콩버터를 추가하여 칼로리 밀도를 높이세요.");
  if (macros.fat < 40) recommendations.push("지방 섭취량이 부족합니다. 아몬드 10알 또는 오메가-3 보충을 권장합니다.");
  if (goal === 'CUT' && macros.carbs > 200) recommendations.push("커팅 중 탄수화물이 다소 높습니다. 섬유질이 풍부한 채소 비중을 늘리세요.");
  
  return recommendations;
};

export const distributeMacros = (totalMacros: Macros, mealCount: number, workoutTime: string): Macros[] => {
  const meals: Macros[] = [];
  const [wHour] = workoutTime.split(':').map(Number);
  
  // 운동 전후 식사 인덱스 추정 (시간 기반으로 단순화)
  // 08:00 시작, 4시간 간격 식사 가정
  const mealIndices = Array.from({ length: mealCount }, (_, i) => 8 + i * 4);
  const diffs = mealIndices.map(time => Math.abs(time - wHour));
  
  // 운동 시간과 가장 가까운 두 끼니를 Pre/Post로 설정
  const sortedIndices = [...Array(mealCount).keys()].sort((a, b) => diffs[a] - diffs[b]);
  const workoutFuelIndices = sortedIndices.slice(0, 2);

  const totalCarbs = totalMacros.carbs;
  const fuelCarbsTotal = totalCarbs * 0.65; // 65% 집중 배치
  const otherCarbsTotal = totalCarbs - fuelCarbsTotal;
  
  const fuelCarbPerMeal = fuelCarbsTotal / 2;
  const otherCarbPerMeal = otherCarbsTotal / (mealCount - 2 || 1);

  const pPerMeal = totalMacros.protein / mealCount;
  const fPerMeal = totalMacros.fat / mealCount;

  for (let i = 0; i < mealCount; i++) {
    const isFuel = workoutFuelIndices.includes(i);
    const carbs = isFuel ? fuelCarbPerMeal : otherCarbPerMeal;
    const calories = (carbs * 4) + (pPerMeal * 4) + (fPerMeal * 9);

    meals.push({
      calories: Math.round(calories),
      protein: Math.round(pPerMeal),
      carbs: Math.round(carbs),
      fat: Math.round(fPerMeal),
      isWorkoutFuel: isFuel
    });
  }

  return meals;
};
