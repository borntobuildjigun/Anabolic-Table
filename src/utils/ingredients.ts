export interface Ingredient {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  unit: string;
}

export const INGREDIENTS: Record<string, Record<string, Ingredient>> = {
  carbs: {
    '현미밥': { name: '현미밥', calories: 150, carbs: 33, protein: 3, fat: 1, unit: 'g' },
    '고구마': { name: '고구마', calories: 130, carbs: 30, protein: 1.5, fat: 0.2, unit: 'g' },
    '오트밀': { name: '오트밀', calories: 380, carbs: 66, protein: 13, fat: 7, unit: 'g' },
    '파스타': { name: '파스타(통밀)', calories: 150, carbs: 30, protein: 5, fat: 1, unit: 'g' },
    '흰쌀밥': { name: '흰쌀밥', calories: 130, carbs: 28, protein: 2.5, fat: 0.3, unit: 'g' },
  },
  protein: {
    '닭가슴살': { name: '닭가슴살', calories: 110, carbs: 0, protein: 23, fat: 1, unit: 'g' },
    '틸라피아': { name: '틸라피아', calories: 96, carbs: 0, protein: 20, fat: 1.7, unit: 'g' },
    '소고기(우둔살)': { name: '소고기(우둔살)', calories: 150, carbs: 0, protein: 22, fat: 7, unit: 'g' },
    '계란흰자': { name: '계란흰자', calories: 50, carbs: 1, protein: 11, fat: 0.2, unit: 'g' },
    '연어': { name: '연어', calories: 200, carbs: 0, protein: 20, fat: 13, unit: 'g' },
    '캔참치(기름제거)': { name: '캔참치', calories: 100, carbs: 0, protein: 22, fat: 1, unit: 'g' },
  },
  fats: {
    '아몬드': { name: '아몬드', calories: 580, carbs: 20, protein: 21, fat: 50, unit: 'g' },
    '아보카도': { name: '아보카도', calories: 160, carbs: 9, protein: 2, fat: 15, unit: 'g' },
    '올리브유': { name: '올리브유', calories: 880, carbs: 0, protein: 0, fat: 100, unit: 'g' },
    '견과류': { name: '견과류 믹스', calories: 600, carbs: 20, protein: 15, fat: 55, unit: 'g' },
  }
};
