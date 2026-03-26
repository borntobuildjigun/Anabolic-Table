import React, { useContext, useState, useEffect } from 'react';
import { AppContext, WorkoutIntensityType, WorkoutTimingType } from '../App';
import { generateOptimizedMealPlan, calculateMacros, getAIRecommendation, MealPlan, Macros } from '../utils/calculations';
import { CheckCircle2, Circle, Lightbulb, Zap, Flame, Dumbbell, Coffee, Loader2, Settings2, Sun, Moon, Sunrise } from 'lucide-react';

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  if (!context) return null;
  const { userData, setUserData } = context;

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      try {
        const plan = generateOptimizedMealPlan(userData);
        setMealPlan(plan);
      } catch (error) {
        console.error("Meal Calculation Error:", error);
      } finally {
        setIsPageLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [userData]);

  const toggleMealStatus = (index: number) => {
    const newStatus = [...(userData.mealsStatus || [])];
    newStatus[index] = !newStatus[index];
    setUserData(prev => ({ ...prev, mealsStatus: newStatus }));
  };

  const intensityOptions: { id: WorkoutIntensityType; label: string; icon: any }[] = [
    { id: 'LOW', label: '낮음 (Rest)', icon: Coffee },
    { id: 'MEDIUM', label: '보통 (Daily)', icon: Dumbbell },
    { id: 'HIGH', label: '높음 (Hard)', icon: Flame },
  ];

  const timingOptions: { id: WorkoutTimingType; label: string; icon: any }[] = [
    { id: 'MORNING', label: '오전 운동', icon: Sunrise },
    { id: 'AFTERNOON', label: '오후 운동', icon: Sun },
    { id: 'EVENING', label: '저녁 운동', icon: Moon },
    { id: 'REST', label: '휴식 (없음)', icon: Coffee },
  ];

  if (isPageLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '1.5rem' }}>
        <Loader2 className="animate-spin" size={40} color="var(--accent-primary)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>식단표 생성 중...</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.5s ease' }}>
      {/* 1. 탄수화물 사이클링 전략 (강도) */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>훈련 강도 (탄수화물 양)</div>
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {intensityOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setUserData(p => ({ ...p, workoutIntensity: opt.id }))}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.75rem 0.5rem',
                borderRadius: '8px',
                background: userData.workoutIntensity === opt.id ? 'var(--accent-primary)' : 'transparent',
                color: userData.workoutIntensity === opt.id ? 'black' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: '900',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.8rem'
              }}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 운동 시간대 선택 (탄수화물 타이밍) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>운동 시간대 (탄수화물 타이밍)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {timingOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setUserData(p => ({ ...p, workoutTiming: opt.id }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.75rem',
                borderRadius: '8px',
                background: userData.workoutTiming === opt.id ? 'var(--bg-tertiary)' : 'transparent',
                color: userData.workoutTiming === opt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: userData.workoutTiming === opt.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.8rem'
              }}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'white' }}>오늘의 식단표</h3>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
        >
          <Settings2 size={16} /> 설정
        </button>
      </div>

      {showSettings && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>식재료 모드</div>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '2px', borderRadius: '6px' }}>
                <button onClick={() => setUserData(p => ({...p, isReadyMealMode: false}))} style={{ flex: 1, padding: '0.4rem', fontSize: '0.7rem', borderRadius: '4px', border: 'none', background: !userData.isReadyMealMode ? 'var(--accent-primary)' : 'transparent', color: !userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold', cursor: 'pointer' }}>원물</button>
                <button onClick={() => setUserData(p => ({...p, isReadyMealMode: true}))} style={{ flex: 1, padding: '0.4rem', fontSize: '0.7rem', borderRadius: '4px', border: 'none', background: userData.isReadyMealMode ? 'var(--accent-primary)' : 'transparent', color: userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold', cursor: 'pointer' }}>간편식</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>끼니 횟수</div>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '2px', borderRadius: '6px' }}>
                {[3, 4, 5].map(c => (
                  <button key={c} onClick={() => setUserData(p => ({...p, mealCount: c}))} style={{ flex: 1, padding: '0.4rem', fontSize: '0.7rem', borderRadius: '4px', border: 'none', background: userData.mealCount === c ? 'var(--accent-primary)' : 'transparent', color: userData.mealCount === c ? 'black' : 'white', fontWeight: 'bold', cursor: 'pointer' }}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 식단 카드 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {mealPlan.map((meal) => {
          const isDone = userData.mealsStatus?.[meal.id] || false;
          const label = meal.label;
          const isFuel = label === 'PRE-WO' || label === 'POST-WO' || label === 'PRE/POST-WO';
          
          return (
            <div key={meal.id} style={{ 
              position: 'relative',
              background: isDone ? 'rgba(255,255,255,0.02)' : 'var(--bg-tertiary)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: isDone ? '1px solid transparent' : isFuel ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              opacity: isDone ? 0.6 : 1,
              transition: 'all 0.3s ease',
              boxShadow: isFuel && !isDone ? '0 0 15px rgba(204, 255, 0, 0.1)' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: isFuel ? 'var(--accent-primary)' : 'var(--text-muted)', letterSpacing: '1px' }}>
                      {label || `MEAL ${meal.id + 1}`}
                    </span>
                    {isFuel && <Zap size={10} fill="var(--accent-primary)" color="var(--accent-primary)" />}
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{meal.mealName}</h4>
                </div>
                <button 
                  onClick={() => toggleMealStatus(meal.id)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {isDone ? <CheckCircle2 size={28} color="var(--success)" /> : <Circle size={28} color="var(--border-color)" />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {meal.foods?.map((food, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '4px', 
                        height: '24px', 
                        borderRadius: '2px',
                        background: idx === 0 ? 'var(--accent-primary)' : idx === 1 ? '#00ccff' : 'var(--accent-secondary)'
                      }} />
                      <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{food.name}</span>
                    </div>
                    <div style={{ 
                      fontSize: '1rem', 
                      fontWeight: '900', 
                      color: 'white'
                    }}>
                      {food.isReady ? food.readyValue : food.weight}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '2px', fontWeight: 'normal' }}>{food.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MealSchedule;
