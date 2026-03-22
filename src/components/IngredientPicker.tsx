import React, { useContext } from 'react';
import { AppContext } from '../App';
import { INGREDIENTS } from '../utils/ingredients';

const IngredientPicker: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;

  const toggleIngredient = (category: keyof typeof userData.selectedIngredients, item: string) => {
    const current = userData.selectedIngredients[category];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    
    setUserData({
      ...userData,
      selectedIngredients: {
        ...userData.selectedIngredients,
        [category]: updated
      }
    });
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        보디빌딩 전문 식재료 선택
      </h2>
      
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>탄수화물 (Complex Carbs)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {Object.keys(INGREDIENTS.carbs).map(item => (
            <button
              key={item}
              onClick={() => toggleIngredient('carbs', item)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                background: userData.selectedIngredients.carbs.includes(item) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: userData.selectedIngredients.carbs.includes(item) ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: '900',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#00ccff' }}>단백질 (High Protein)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {Object.keys(INGREDIENTS.protein).map(item => (
            <button
              key={item}
              onClick={() => toggleIngredient('protein', item)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                background: userData.selectedIngredients.protein.includes(item) ? '#00ccff' : 'var(--bg-tertiary)',
                color: userData.selectedIngredients.protein.includes(item) ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: '900',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>지방 (Healthy Fats)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {Object.keys(INGREDIENTS.fats).map(item => (
            <button
              key={item}
              onClick={() => toggleIngredient('fats', item)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                background: userData.selectedIngredients.fats.includes(item) ? 'var(--accent-secondary)' : 'var(--bg-tertiary)',
                color: userData.selectedIngredients.fats.includes(item) ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: '900',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => setStep(4)}
        style={{ 
          width: '100%', 
          padding: '1.25rem', 
          borderRadius: '12px', 
          background: 'var(--accent-primary)', 
          color: 'black', 
          fontWeight: '900',
          fontSize: '1.2rem',
          marginTop: '1.5rem',
          boxShadow: '0 4px 20px rgba(204, 255, 0, 0.3)'
        }}
      >
        최적화된 식단 생성하기
      </button>
    </div>
  );
};

export default IngredientPicker;
