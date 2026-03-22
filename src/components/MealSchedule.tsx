import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateMacros, distributeMacros } from '../utils/calculations';
import { CheckCircle2, Circle } from 'lucide-react';

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData } = context;
  const totalMacros = useMemo(() => calculateMacros(userData), [userData]);
  const mealMacros = useMemo(() => distributeMacros(totalMacros, userData.mealCount), [totalMacros, userData.mealCount]);

  const handleMealCountChange = (count: number) => {
    setUserData({ 
      ...userData, 
      mealCount: count,
      mealsStatus: new Array(count).fill(false)
    });
  };

  const toggleMealStatus = (index: number) => {
    const newStatus = [...userData.mealsStatus];
    newStatus[index] = !newStatus[index];
    setUserData({ ...userData, mealsStatus: newStatus });
  };

  const getRandomItem = (items: string[]) => items[Math.floor(Math.random() * items.length)];

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        맞춤형 식단표 생성
      </h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[3, 4, 5].map(count => (
          <button
            key={count}
            onClick={() => handleMealCountChange(count)}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              background: userData.mealCount === count ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: userData.mealCount === count ? 'black' : 'white',
              fontWeight: 'bold',
              border: '1px solid var(--border-color)'
            }}
          >
            {count}끼
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mealMacros.map((macros, index) => {
          const isDone = userData.mealsStatus[index];
          return (
            <div 
              key={index} 
              className="card"
              style={{ 
                opacity: isDone ? 0.4 : 1,
                transition: 'opacity 0.3s ease',
                position: 'relative',
                border: isDone ? '1px solid var(--border-color)' : '1px solid var(--accent-primary)',
                background: isDone ? 'var(--bg-primary)' : 'var(--bg-secondary)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>끼니 {index + 1}</h3>
                <button 
                  onClick={() => toggleMealStatus(index)}
                  style={{ background: 'none', color: isDone ? 'var(--success)' : 'var(--text-muted)' }}
                >
                  {isDone ? <CheckCircle2 size={24} color="#00ff88" /> : <Circle size={24} />}
                </button>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>권장 식재료</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {getRandomItem(userData.selectedIngredients.carbs)}
                  </span>
                  <span style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {getRandomItem(userData.selectedIngredients.protein)}
                  </span>
                  {macros.fat > 5 && (
                    <span style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {getRandomItem(userData.selectedIngredients.fats)}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>칼로리</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{macros.calories}k</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--accent-primary)' }}>탄수</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{macros.carbs}g</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.625rem', color: '#00ccff' }}>단백</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{macros.protein}g</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--accent-secondary)' }}>지방</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{macros.fat}g</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MealSchedule;
