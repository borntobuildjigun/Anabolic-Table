import React, { createContext, useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import GoalSelection from './components/GoalSelection';
import Dashboard from './components/Dashboard';
import IngredientPicker from './components/IngredientPicker';
import MealSchedule from './components/MealSchedule';
import WeightLossReport from './components/WeightLossReport';

export type UserGoal = 'BULK' | 'LEAN' | 'CUT';

export interface UserData {
  weight: number;
  targetWeight: number;
  height: number;
  birthYear: number;
  gender: 'MALE' | 'FEMALE';
  bodyFat: number;
  goal: UserGoal;
  activityLevel: number;
  workoutTime: string;
  isRestDay: boolean;
  isReadyMealMode: boolean;
  targetWeeks: number; // 추가: 목표 감량 기간(주)
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

const INITIAL_DATA: UserData = {
  weight: 70,
  targetWeight: 65,
  height: 175,
  birthYear: 1995,
  gender: 'MALE',
  bodyFat: 15,
  goal: 'CUT',
  activityLevel: 1.55,
  workoutTime: '14:00',
  isRestDay: false,
  isReadyMealMode: false,
  targetWeeks: 8, // 기본 8주
  selectedIngredients: {
    carbs: ['현미밥'],
    protein: ['닭가슴살'],
    fats: ['아몬드'],
  },
  mealCount: 4,
  mealsStatus: [false, false, false, false],
};

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const saved = localStorage.getItem('anabolic_user_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_DATA, ...parsed };
      }
    } catch (e) {
      console.error("Storage Error:", e);
    }
    return INITIAL_DATA;
  });

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('anabolic_step');
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('anabolic_user_data', JSON.stringify(userData));
    localStorage.setItem('anabolic_step', step.toString());
  }, [userData, step]);

  return (
    <AppContext.Provider value={{ userData, setUserData, step, setStep }}>
      <div className="app-container">
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>ANABOLIC TABLE</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Professional Meal Planner</p>
        </header>

        <main style={{ minHeight: '600px' }}>
          {step === 1 && <Onboarding />}
          {step === 2 && <GoalSelection />}
          {step === 3 && <IngredientPicker />}
          {step === 4 && (
            <>
              <Dashboard />
              <WeightLossReport />
              <MealSchedule />
            </>
          )}
        </main>
        
        {step > 1 && (
          <button 
            onClick={() => setStep(1)}
            style={{ 
              marginTop: '2rem', 
              background: 'none', 
              color: 'var(--text-muted)', 
              textDecoration: 'underline',
              width: '100%',
              textAlign: 'center',
              padding: '1rem'
            }}
          >
            데이터 수정하러 가기
          </button>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
