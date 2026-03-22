import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateMacros, distributeMacros, getAIRecommendation } from '../utils/calculations';
import { INGREDIENTS } from '../utils/ingredients';
import { CheckCircle2, Circle, Lightbulb } from 'lucide-react';

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData } = context;
  const totalMacros = useMemo(() => calculateMacros(userData), [userData]);
  const mealMacros = useMemo(() => distributeMacros(totalMacros, userData.mealCount), [totalMacros, userData.mealCount]);
  const recommendations = useMemo(() => getAIRecommendation(totalMacros, userData), [totalMacros, userData]);

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

  const getMealWeight = (macroType: 'carbs' | 'protein' | 'fats', amount: number, ingredientName: string) => {
    const ingredient = INGREDIENTS[macroType][ingredientName];
    if (!ingredient) return 0;
    const macroPer100g = macroType === 'carbs' ? ingredient.carbs : macroType === 'protein' ? ingredient.protein : ingredient.fat;
    return Math.round((amount / macroPer100g) * 100);
  };

  const getOrdinal = (n: number) => {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        전문가용 식단표
      </h2>

      {/* Segmented Control - Meal Count */}
      <div style={{ 
        display: 'flex', 
        background: 'var(--bg-secondary)', 
        padding: '0.25rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
      }}>
        {[3, 4, 5].map(count => (
          <button
            key={count}
            onClick={() => handleMealCountChange(count)}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '10px',
              background: userData.mealCount === count ? 'var(--accent-primary)' : 'transparent',
              color: userData.mealCount === count ? 'black' : 'var(--text-secondary)',
              fontWeight: '900',
              fontSize: '1.2rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {count} MEALS
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {mealMacros.map((macros, index) => {
          const isDone = userData.mealsStatus[index];
          const carbName = userData.selectedIngredients.carbs[0] || '현미밥';
          const proteinName = userData.selectedIngredients.protein[0] || '닭가슴살';
          const fatName = userData.selectedIngredients.fats[0] || '아몬드';

          const carbWeight = getMealWeight('carbs', macros.carbs, carbName);
          const proteinWeight = getMealWeight('protein', macros.protein, proteinName);
          const fatWeight = getMealWeight('fats', macros.fat, fatName);

          return (
            <div 
              key={index} 
              className="card"
              style={{ 
                opacity: isDone ? 0.4 : 1,
                border: isDone ? '1px solid var(--border-color)' : '1px solid var(--accent-primary)',
                background: isDone ? 'var(--bg-primary)' : 'linear-gradient(145deg, var(--bg-secondary) 0%, #1e1e1e 100%)',
                padding: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
                  {getOrdinal(index + 1)} MEAL
                </h3>
                <button 
                  onClick={() => toggleMealStatus(index)}
                  style={{ background: 'none', color: isDone ? 'var(--success)' : 'var(--text-muted)' }}
                >
                  {isDone ? <CheckCircle2 size={28} color="#00ff88" /> : <Circle size={28} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Food Item Row - Carbohydrates */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    background: 'var(--accent-primary)', 
                    color: 'black', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '6px',
                    fontWeight: '900',
                    fontSize: '1.1rem',
                    minWidth: '85px',
                    textAlign: 'center'
                  }}>
                    {carbWeight}g
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'white' }}>{carbName}</div>
                </div>

                {/* Food Item Row - Proteins */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    background: '#00ccff', 
                    color: 'black', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '6px',
                    fontWeight: '900',
                    fontSize: '1.1rem',
                    minWidth: '85px',
                    textAlign: 'center'
                  }}>
                    {proteinWeight}g
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'white' }}>{proteinName}</div>
                </div>

                {/* Food Item Row - Fats (Conditionally Shown) */}
                {macros.fat > 3 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      background: 'var(--accent-secondary)', 
                      color: 'black', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '6px',
                      fontWeight: '900',
                      fontSize: '1.1rem',
                      minWidth: '85px',
                      textAlign: 'center'
                    }}>
                      {fatWeight}g
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'white' }}>{fatName}</div>
                  </div>
                )}
              </div>

              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px dashed var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                <span>🔥 {macros.calories}kcal</span>
                <span>💪 P {macros.protein}g</span>
                <span>🍚 C {macros.carbs}g</span>
                <span>🥑 F {macros.fat}g</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Recommendation Section */}
      {recommendations.length > 0 && (
        <div className="card" style={{ 
          marginTop: '2rem', 
          background: 'rgba(204, 255, 0, 0.05)', 
          border: '1px solid var(--accent-primary)',
          borderRadius: '16px'
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            <Lightbulb size={20} /> AI 추천 보완 가이드
          </h4>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {recommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealSchedule;
