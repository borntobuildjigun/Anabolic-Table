import React, { createContext, useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import MealSchedule from './components/MealSchedule';

export type UserGoal = 'BULK' | 'LEAN' | 'CUT';
export type WorkoutIntensityType = 'HIGH' | 'MEDIUM' | 'LOW';

export interface UserData {
  weight: number;
  targetWeight: number;
  height: number;
  birthYear: number;
  gender: 'MALE' | 'FEMALE';
  bodyFat: number;
  goal: UserGoal;
  workoutIntensity: WorkoutIntensityType;
  activityLevel: number;
  workoutTime: string;
  isRestDay: boolean;
  isReadyMealMode: boolean;
  targetWeeks: number;
  selectedIngredients: {
    carbs: string[];
    protein: string[];
    fats: string[];
  };
  mealCount: number;
  mealsStatus: boolean[];
}

interface AppContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('anabolic_user_data');
    return saved ? JSON.parse(saved) : {
      weight: 70,
      targetWeight: 70,
      height: 175,
      birthYear: 1996,
      gender: 'MALE',
      bodyFat: 15,
      goal: 'LEAN',
      workoutIntensity: 'MEDIUM',
      activityLevel: 1.55,
      workoutTime: '14:00',
      isRestDay: false,
      isReadyMealMode: false,
      targetWeeks: 8,
      selectedIngredients: { carbs: [], protein: [], fats: [] },
      mealCount: 4,
      mealsStatus: [false, false, false, false],
    };
  });

  const [step, setStep] = useState(1);

  useEffect(() => {
    localStorage.setItem('anabolic_user_data', JSON.stringify(userData));
  }, [userData]);

  return (
    <AppContext.Provider value={{ userData, setUserData, step, setStep }}>
      <div style={{ paddingBottom: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontStyle: 'italic' }}>
            ANABOLIC TABLE
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Professional Bodybuilding Meal Planner</p>
        </header>

        {step === 1 && <Onboarding />}
        {step === 6 && (
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <Dashboard />
            <MealSchedule />
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
