import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Info, Target, User, Calculator } from 'lucide-react';

const Onboarding: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;
  const [age, setAge] = useState(2026 - (userData.birthYear || 1995));

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'weight' || name === 'targetWeight' || name === 'height' || name === 'bodyFat' || name === 'targetWeeks' || name === 'age') {
      if (value !== '' && !/^\d*\.?\d{0,1}$/.test(value)) return;
    }
    
    if (name === 'age') {
      const numAge = value === '' ? 0 : Number(value);
      setAge(numAge);
      setUserData({ ...userData, birthYear: 2026 - numAge });
      return;
    }

    const numValue = value === '' ? 0 : Number(value);
    setUserData({ ...userData, [name]: numValue });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || Number(value) === 0) {
      if (name === 'bodyFat') return;
      const defaults: Record<string, number> = { weight: 70, targetWeight: 70, height: 175, age: 30, bodyFat: 15, targetWeeks: 8 };
      if (name === 'age') {
        setAge(30);
        setUserData({ ...userData, birthYear: 1996 });
      } else {
        setUserData({ ...userData, [name]: defaults[name] });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 온보딩 완료 시 바로 결과 페이지(Step 6)로 이동
    // 기본값 설정 (사용자가 거치지 않은 단계들에 대한 설정)
    setUserData(prev => ({
      ...prev,
      goal: prev.weight > prev.targetWeight ? 'CUT' : 'BULK',
      workoutIntensity: 'MEDIUM',
      workoutTiming: 'AFTERNOON',
      activityLevel: 1.55,
      mealCount: 4
    }));
    setStep(6);
  };

  const isBodyFatUnknown = userData.bodyFat === 0;

  return (
    <div className="card" style={{ animation: 'fadeIn 0.5s ease', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
          신체 데이터 입력
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>정확한 식단 설계를 위해 기본 정보를 입력해주세요.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <User size={16} /> 성별
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button 
              type="button"
              onClick={() => setUserData({ ...userData, gender: 'MALE' })}
              style={{ 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: userData.gender === 'MALE' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', 
                color: userData.gender === 'MALE' ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              남성
            </button>
            <button 
              type="button"
              onClick={() => setUserData({ ...userData, gender: 'FEMALE' })}
              style={{ 
                padding: '0.75rem', 
                borderRadius: '8px', 
                background: userData.gender === 'FEMALE' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', 
                color: userData.gender === 'FEMALE' ? 'black' : 'white',
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              여성
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>현재 체중 (kg)</label>
            <input type="number" inputMode="decimal" name="weight" value={userData.weight || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="70.0" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>목표 체중 (kg)</label>
            <input type="number" inputMode="decimal" name="targetWeight" value={userData.targetWeight || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="65.0" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>신장 (cm)</label>
            <input type="number" name="height" value={userData.height || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="175" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>나이 (Age)</label>
            <input type="number" name="age" value={age || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="30" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>체지방률 (%)</label>
              <div className="tooltip-container">
                <Info size={14} style={{ color: 'var(--accent-primary)', cursor: 'help' }} />
                <span className="tooltip-text">모를 경우 '건너뛰기'를 선택하세요.</span>
              </div>
            </div>
            <input 
              type="number" 
              name="bodyFat" 
              value={isBodyFatUnknown ? '' : (userData.bodyFat || '')} 
              onChange={handleNumberChange} 
              onBlur={handleBlur} 
              placeholder={isBodyFatUnknown ? "건너뛰기됨" : "15"} 
              disabled={isBodyFatUnknown}
              style={{ 
                width: '100%', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                background: isBodyFatUnknown ? 'transparent' : 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)', 
                color: 'white',
                opacity: isBodyFatUnknown ? 0.5 : 1,
                fontSize: '1rem'
              }} 
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isBodyFatUnknown} 
                onChange={(e) => setUserData({ ...userData, bodyFat: e.target.checked ? 0 : 15 })}
                style={{ cursor: 'pointer' }}
              />
              체지방률 모름 (건너뛰기)
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>목표 기간 (주)</label>
            <div style={{ position: 'relative' }}>
              <input type="number" name="targetWeeks" value={userData.targetWeeks || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="8" style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--accent-secondary)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold' }} />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>주</span>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '1.25rem', 
            borderRadius: '12px', 
            background: 'var(--accent-primary)', 
            color: 'black', 
            fontWeight: '900', 
            fontSize: '1.2rem', 
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: '0 4px 20px rgba(204, 255, 0, 0.3)',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <Calculator size={24} /> 식단 최적화 시작
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
