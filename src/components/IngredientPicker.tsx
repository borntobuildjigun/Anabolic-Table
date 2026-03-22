import React, { useContext } from 'react';
import { AppContext } from '../App';

const IngredientPicker: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;

  const options = {
    carbs: ['고구마', '현미밥', '오트밀', '바나나', '단호박', '감자'],
    protein: ['닭가슴살', '소고기(우둔살)', '계란 흰자', '돼지 안심', '틸라피아', '프로틴 쉐이크'],
    fats: ['아몬드', '아보카도', '땅콩버터', '올리브유', 'MCT 오일', '호두'],
  };

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
        식재료 커스텀 선택
      </h2>
      
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>탄수화물 (Carbohydrates)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {options.carbs.map(item => (
            <button
              key={item}
              onClick={() => toggleIngredient('carbs', item)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: userData.selectedIngredients.carbs.includes(item) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: userData.selectedIngredients.carbs.includes(item) ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>단백질 (Proteins)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {options.protein.map(item => (
            <button
              key={item}
              onClick={() => toggleIngredient('protein', item)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: userData.selectedIngredients.protein.includes(item) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: userData.selectedIngredients.protein.includes(item) ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>지방 (Fats)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {options.fats.map(item => (
            <button
              key={item}
              onClick={() => toggleIngredient('fats', item)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: userData.selectedIngredients.fats.includes(item) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: userData.selectedIngredients.fats.includes(item) ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                fontSize: '0.875rem'
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
          padding: '1rem', 
          borderRadius: '8px', 
          background: 'var(--accent-primary)', 
          color: 'black', 
          fontWeight: '900',
          fontSize: '1.1rem',
          marginTop: '1rem'
        }}
      >
        식단 분석 및 생성
      </button>
    </div>
  );
};

export default IngredientPicker;
