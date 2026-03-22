import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import { generateOptimizedMealPlan, calculateMacros, getAIRecommendation } from '../utils/calculations';
import { CheckCircle2, Circle, Lightbulb, Zap, Package, Clock, Loader2, Info } from 'lucide-react';

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!context) return null;
  const { userData, setUserData } = context;

  const mealPlan = useMemo(() => generateOptimizedMealPlan(userData), [userData]);
  const totalMacros = useMemo(() => calculateMacros(userData), [userData]);
  const recommendations = useMemo(() => getAIRecommendation(totalMacros, userData), [totalMacros, userData]);

  const toggleMealStatus = (index: number) => {
    const newStatus = [...(userData.mealsStatus || [])];
    newStatus[index] = !newStatus[index];
    setUserData({ ...userData, mealsStatus: newStatus });
  };

  const handleAsyncAction = (action: () => void) => {
    setIsProcessing(true);
    setTimeout(() => {
      action();
      setIsProcessing(false);
    }, 100);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        전문가용 식단표
      </h2>

      {/* 운동 유무 설정 */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: userData.isRestDay ? 'var(--text-secondary)' : 'var(--accent-primary)' }}>
            <Clock size={20} />
            <span style={{ fontWeight: 'bold' }}>{userData.isRestDay ? '오늘은 휴식일' : '훈련 시간 설정'}</span>
          </div>
          <button 
            onClick={() => setUserData({ ...userData, isRestDay: !userData.isRestDay })}
            style={{ 
              padding: '0.4rem 1rem', borderRadius: '20px', 
              background: userData.isRestDay ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
              color: userData.isRestDay ? 'black' : 'white',
              fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--border-color)'
            }}
          >
            {userData.isRestDay ? '운동하는 날로 변경' : '오늘은 쉴래요'}
          </button>
        </div>
        
        {!userData.isRestDay ? (
          <input 
            type="time" 
            value={userData.workoutTime || "14:00"}
            onChange={(e) => setUserData({ ...userData, workoutTime: e.target.value })}
            style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'white', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>
            <Info size={16} />
            <span>일반 식단 모드: 영양소가 모든 끼니에 균등하게 배분됩니다.</span>
          </div>
        )}
      </div>

      {/* 모드 및 식사 횟수 선택 (기존과 동일하게 유지하되 처리 속도 개선) */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => handleAsyncAction(() => setUserData({ ...userData, isReadyMealMode: false }))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: !userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: !userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold', border: '1px solid var(--border-color)' }}>원물 모드</button>
        <button onClick={() => handleAsyncAction(() => setUserData({ ...userData, isReadyMealMode: true }))} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Package size={18} /> 간편식 모드</button>
      </div>

      <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        {[3, 4, 5].map(count => (
          <button key={count} onClick={() => handleAsyncAction(() => setUserData({ ...userData, mealCount: count, mealsStatus: new Array(count).fill(false) }))} style={{ flex: 1, padding: '1rem', borderRadius: '10px', background: userData.mealCount === count ? 'var(--accent-primary)' : 'transparent', color: userData.mealCount === count ? 'black' : 'var(--text-secondary)', fontWeight: '900' }}>{count} MEALS</button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>식단 업데이트 중...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {mealPlan.map((meal) => {
              const isDone = userData.mealsStatus?.[meal.id] || false;
              return (
                <div key={meal.id} className="card" style={{ opacity: isDone ? 0.4 : 1, border: isDone ? '1px solid var(--border-color)' : meal.macros?.isWorkoutFuel ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: isDone ? 'var(--bg-primary)' : 'var(--bg-secondary)', position: 'relative' }}>
                  {meal.macros?.isWorkoutFuel ? (
                    <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--accent-primary)', color: 'black', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={12} fill="black" /> WORKOUT FUEL
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid var(--border-color)' }}>
                      BALANCED MEAL
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: meal.macros?.isWorkoutFuel ? 'var(--accent-primary)' : 'white' }}>{meal.mealName}</h3>
                    <button onClick={() => toggleMealStatus(meal.id)} style={{ background: 'none', color: isDone ? 'var(--success)' : 'var(--text-muted)' }}>
                      {isDone ? <CheckCircle2 size={28} color="#00ff88" /> : <Circle size={28} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {meal.foods?.map((food, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: idx === 0 ? 'var(--accent-primary)' : idx === 1 ? '#00ccff' : 'var(--accent-secondary)', color: 'black', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '900', minWidth: '95px', textAlign: 'center' }}>{food.isReady ? food.readyValue : food.weight}{food.unit}</div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{food.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {recommendations.length > 0 && !isProcessing && (
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(204, 255, 0, 0.05)', border: '1px solid var(--accent-primary)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            <Lightbulb size={20} /> AI 추천 가이드
          </h4>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {recommendations.map((rec, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealSchedule;
