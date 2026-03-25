import React, { useContext, useState, useEffect } from 'react';
import { AppContext, WorkoutIntensityType } from '../App';
import { generateOptimizedMealPlan, calculateMacros, getAIRecommendation, MealPlan, Macros } from '../utils/calculations';
import { CheckCircle2, Circle, Lightbulb, Zap, Clock, Info, Flame, Dumbbell, Coffee, Loader2 } from 'lucide-react';

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [totalMacros, setTotalMacros] = useState<Macros | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  if (!context) return null;
  const { userData, setUserData } = context;

  // 비동기 계산 로직: 브라우저 멈춤 방지
  useEffect(() => {
    setIsPageLoading(true);
    
    // 계산을 비동기적으로 처리하여 UI 스레드를 확보함
    const timer = setTimeout(() => {
      try {
        const plan = generateOptimizedMealPlan(userData);
        const macros = calculateMacros(userData);
        const recs = getAIRecommendation(macros, userData);
        
        setMealPlan(plan);
        setTotalMacros(macros);
        setRecommendations(recs);
      } catch (error) {
        console.error("Meal Calculation Error:", error);
      } finally {
        setIsPageLoading(false);
      }
    }, 400); // 페이지 전환 애니메이션을 위한 충분한 여유

    return () => clearTimeout(timer);
  }, [userData]);

  const toggleMealStatus = (index: number) => {
    const newStatus = [...(userData.mealsStatus || [])];
    newStatus[index] = !newStatus[index];
    setUserData(prev => ({ ...prev, mealsStatus: newStatus }));
  };

  const setIntensity = (intensity: WorkoutIntensityType) => {
    setUserData(prev => ({ ...prev, workoutIntensity: intensity }));
  };

  const intensityOptions: { id: WorkoutIntensityType; label: string; icon: any; color: string }[] = [
    { id: 'HIGH', label: 'HIGH', icon: Flame, color: 'var(--danger)' },
    { id: 'MEDIUM', label: 'MEDIUM', icon: Dumbbell, color: 'var(--accent-primary)' },
    { id: 'LOW', label: 'LOW', icon: Coffee, color: 'var(--text-secondary)' },
  ];

  if (isPageLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
        <Loader2 className="animate-spin" size={60} color="var(--accent-primary)" />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', letterSpacing: '1px' }}>ANABOLIC ENGINE</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            개인별 신체 데이터와 선택하신 식재료를<br/>
            바탕으로 최적의 영양 비율을 계산 중입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        맞춤형 아나볼릭 식단표
      </h2>

      {/* 실시간 탄수화물 전략 컨트롤러 */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Zap size={14} fill="var(--accent-primary)" color="var(--accent-primary)" /> 오늘의 탄수화물 전략 선택
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {intensityOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setIntensity(opt.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '0.75rem 0.25rem',
                borderRadius: '10px',
                background: userData.workoutIntensity === opt.id ? opt.color : 'transparent',
                color: userData.workoutIntensity === opt.id ? 'black' : 'var(--text-secondary)',
                border: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
            >
              <opt.icon size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: '900' }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 상세 설정 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '0.75rem', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>모드 선택</div>
           <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setUserData(p => ({...p, isReadyMealMode: false}))} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', background: !userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: !userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold' }}>원물</button>
              <button onClick={() => setUserData(p => ({...p, isReadyMealMode: true}))} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', background: userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold' }}>간편식</button>
           </div>
        </div>
        <div className="card" style={{ padding: '0.75rem', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>끼니 횟수</div>
           <div style={{ display: 'flex', gap: '4px' }}>
              {[3, 4, 5].map(c => (
                <button key={c} onClick={() => setUserData(p => ({...p, mealCount: c}))} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', borderRadius: '4px', background: userData.mealCount === c ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: userData.mealCount === c ? 'black' : 'white', fontWeight: 'bold' }}>{c}</button>
              ))}
           </div>
        </div>
      </div>

      {/* 훈련 시간 설정 */}
      {!userData.isRestDay && (
        <div className="card" style={{ padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(204, 255, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>훈련 시간 (기상 후 {userData.workoutTime})</span>
            <input 
              type="time" 
              value={userData.workoutTime || "14:00"}
              onChange={(e) => setUserData(p => ({ ...p, workoutTime: e.target.value }))}
              style={{ background: 'var(--bg-primary)', color: 'white', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      )}

      {/* 식단표 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mealPlan.map((meal) => {
          const isDone = userData.mealsStatus?.[meal.id] || false;
          return (
            <div key={meal.id} className="card" style={{ 
              opacity: isDone ? 0.5 : 1, 
              border: isDone ? '1px solid var(--border-color)' : meal.macros?.isWorkoutFuel ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', 
              background: isDone ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              padding: '1.25rem',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1rem', color: meal.macros?.isWorkoutFuel ? 'var(--accent-primary)' : 'white', margin: 0 }}>{meal.mealName}</h3>
                  {meal.macros?.isWorkoutFuel && <Zap size={14} fill="var(--accent-primary)" color="var(--accent-primary)" />}
                </div>
                <button onClick={() => toggleMealStatus(meal.id)} style={{ background: 'none', color: isDone ? 'var(--success)' : 'var(--text-muted)', padding: 0 }}>
                  {isDone ? <CheckCircle2 size={24} color="#00ff88" /> : <Circle size={24} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {meal.foods?.map((food, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      background: idx === 0 ? 'rgba(204, 255, 0, 0.15)' : idx === 1 ? 'rgba(0, 204, 255, 0.15)' : 'rgba(255, 102, 0, 0.15)', 
                      color: idx === 0 ? 'var(--accent-primary)' : idx === 1 ? '#00ccff' : 'var(--accent-secondary)', 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '4px', 
                      fontWeight: '900', 
                      minWidth: '70px', 
                      textAlign: 'center',
                      fontSize: '0.9rem'
                    }}>
                      {food.isReady ? food.readyValue : food.weight}{food.unit}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {food.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {recommendations.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(204, 255, 0, 0.05)', border: '1px solid rgba(204, 255, 0, 0.2)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <Lightbulb size={18} /> AI 추천 가이드
          </h4>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {recommendations.map((rec, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{rec}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealSchedule;
