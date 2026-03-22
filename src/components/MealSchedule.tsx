import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { generateOptimizedMealPlan, calculateMacros, getAIRecommendation } from '../utils/calculations';
import { CheckCircle2, Circle, Lightbulb, Zap, Package, Copy, Share2, Clock, Loader2 } from 'lucide-react';

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  const [isGenerating, setIsGenerating] = useState(true);

  if (!context) return null;
  const { userData, setUserData } = context;

  // 1. 메모이제이션을 통한 연산 최적화
  const mealPlan = useMemo(() => generateOptimizedMealPlan(userData), [userData]);
  const totalMacros = useMemo(() => calculateMacros(userData), [userData]);
  const recommendations = useMemo(() => getAIRecommendation(totalMacros, userData), [totalMacros, userData]);

  // 로딩 효과 시뮬레이션 (사용자 경험 향상)
  useEffect(() => {
    setIsGenerating(true);
    const timer = setTimeout(() => setIsGenerating(false), 500);
    return () => clearTimeout(timer);
  }, [userData.mealCount, userData.workoutTime, userData.isReadyMealMode]);

  const toggleMealStatus = (index: number) => {
    const newStatus = [...userData.mealsStatus];
    newStatus[index] = !newStatus[index];
    setUserData({ ...userData, mealsStatus: newStatus });
  };

  const copyToClipboard = () => {
    let text = `[ANABOLIC TABLE 오늘의 식단]\n\n`;
    mealPlan.forEach((m) => {
      text += `[${m.mealName}] `;
      m.foods.forEach(f => {
        text += `${f.name} ${f.isReady ? f.readyValue : f.weight}${f.unit} `;
      });
      text += `\n`;
    });
    navigator.clipboard.writeText(text);
    alert('식단이 클립보드에 복사되었습니다!');
  };

  if (isGenerating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
        <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>최적의 영양 배분 계산 중...</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>전문가용 식단표</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={copyToClipboard} className="neon-border" style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'white' }}>
            <Copy size={20} />
          </button>
          <button onClick={() => window.print()} className="neon-border" style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'white' }}>
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* 운동 시간 설정 */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Clock size={20} />
          <span style={{ fontWeight: 'bold' }}>운동 시간</span>
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
          onClick={() => setUserData({ ...userData, isReadyMealMode: false })}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: !userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: !userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold' }}
        >
          원물 모드
        </button>
        <button 
          onClick={() => setUserData({ ...userData, isReadyMealMode: true })}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Package size={18} /> 간편식
        </button>
      </div>

      {/* 식사 횟수 선택 */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        {[3, 4, 5].map(count => (
          <button key={count} onClick={() => setUserData({ ...userData, mealCount: count, mealsStatus: new Array(count).fill(false) })} style={{ flex: 1, padding: '1rem', borderRadius: '10px', background: userData.mealCount === count ? 'var(--accent-primary)' : 'transparent', color: userData.mealCount === count ? 'black' : 'var(--text-secondary)', fontWeight: '900' }}>
            {count} MEALS
          </button>
        ))}
      </div>

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

      {recommendations.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(204, 255, 0, 0.05)', border: '1px solid var(--accent-primary)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            <Lightbulb size={20} /> AI 추천
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
