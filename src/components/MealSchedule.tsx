import React, { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../App';
import { generateOptimizedMealPlan, calculateMacros, getAIRecommendation } from '../utils/calculations';
import { CheckCircle2, Circle, Lightbulb, Zap, Package, Copy, Clock, Loader2 } from 'lucide-react';

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!context) return null;
  const { userData, setUserData } = context;

  // 1. 계산 로직 분리 및 메모이제이션
  const mealPlan = useMemo(() => generateOptimizedMealPlan(userData), [userData]);
  const totalMacros = useMemo(() => calculateMacros(userData), [userData]);
  const recommendations = useMemo(() => getAIRecommendation(totalMacros, userData), [totalMacros, userData]);

  const toggleMealStatus = (index: number) => {
    const newStatus = [...userData.mealsStatus];
    newStatus[index] = !newStatus[index];
    setUserData({ ...userData, mealsStatus: newStatus });
  };

  // PC 브라우저 렉 방지용 비동기 래퍼 함수
  const executeAsyncUpdate = useCallback((updateFn: () => void) => {
    setIsProcessing(true);
    // 1단계: UI 상태 변경을 위해 메인 스레드에 제어권 양도
    setTimeout(() => {
      // 2단계: 실제 연산 수행
      updateFn();
      // 3단계: 렌더링 후 로딩 해제
      requestAnimationFrame(() => {
        setIsProcessing(false);
      });
    }, 100);
  }, []);

  const handleModeChange = (isReady: boolean) => {
    executeAsyncUpdate(() => {
      setUserData(prev => ({ ...prev, isReadyMealMode: isReady }));
    });
  };

  const handleMealCountChange = (count: number) => {
    executeAsyncUpdate(() => {
      setUserData(prev => ({ 
        ...prev, 
        mealCount: count, 
        mealsStatus: new Array(count).fill(false) 
      }));
    });
  };

  return (
    <div style={{ marginTop: '2rem', minHeight: '500px' }}>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        전문가용 식단표
      </h2>

      {/* 운동 시간 설정 */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Clock size={20} />
          <span style={{ fontWeight: 'bold' }}>훈련 시간 설정</span>
        </div>
        <input 
          type="time" 
          value={userData.workoutTime}
          onChange={(e) => setUserData({ ...userData, workoutTime: e.target.value })}
          style={{ background: 'var(--bg-tertiary)', color: 'white', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px' }}
        />
      </div>

      {/* 모드 전환 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          disabled={isProcessing}
          onClick={() => handleModeChange(false)}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '8px', 
            background: !userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
            color: !userData.isReadyMealMode ? 'black' : 'white', 
            fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'none' /* PC 리플로우 방지 */
          }}
        >
          원물 모드
        </button>
        <button 
          disabled={isProcessing}
          onClick={() => handleModeChange(true)}
          style={{ 
            flex: 1, padding: '0.75rem', borderRadius: '8px', 
            background: userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
            color: userData.isReadyMealMode ? 'black' : 'white', 
            fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'none'
          }}
        >
          <Package size={18} /> 간편식 모드
        </button>
      </div>

      {/* 식사 횟수 선택 */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        {[3, 4, 5].map(count => (
          <button 
            key={count} 
            disabled={isProcessing}
            onClick={() => handleMealCountChange(count)} 
            style={{ 
              flex: 1, padding: '1rem', borderRadius: '10px', 
              background: userData.mealCount === count ? 'var(--accent-primary)' : 'transparent', 
              color: userData.mealCount === count ? 'black' : 'var(--text-secondary)', 
              fontWeight: '900', cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'none'
            }}
          >
            {count} MEALS
          </button>
        ))}
      </div>

      <div style={{ minHeight: '400px', position: 'relative' }}>
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>식단 재배정 중...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {mealPlan.map((meal) => {
              const isDone = userData.mealsStatus[meal.id];
              return (
                <div key={meal.id} className="card" style={{ opacity: isDone ? 0.4 : 1, border: isDone ? '1px solid var(--border-color)' : meal.macros.isWorkoutFuel ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: isDone ? 'var(--bg-primary)' : 'var(--bg-secondary)', position: 'relative' }}>
                  {meal.macros.isWorkoutFuel && (
                    <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--accent-primary)', color: 'black', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={12} fill="black" /> WORKOUT FUEL
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: meal.macros.isWorkoutFuel ? 'var(--accent-primary)' : 'white' }}>{meal.mealName}</h3>
                    <button onClick={() => toggleMealStatus(meal.id)} style={{ background: 'none', color: isDone ? 'var(--success)' : 'var(--text-muted)' }}>
                      {isDone ? <CheckCircle2 size={28} color="#00ff88" /> : <Circle size={28} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {meal.foods.map((food, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          background: idx === 0 ? 'var(--accent-primary)' : idx === 1 ? '#00ccff' : 'var(--accent-secondary)', 
                          color: 'black', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '900', minWidth: '95px', textAlign: 'center' 
                        }}>
                          {food.isReady ? food.readyValue : food.weight}{food.unit}
                        </div>
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
