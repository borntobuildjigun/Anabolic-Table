import React, { useContext } from 'react';
import { AppContext } from '../App';

const Onboarding: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'weight' || name === 'targetWeight') {
      if (value !== '' && !/^\d*\.?\d{0,1}$/.test(value)) return;
    }
    const numValue = value === '' ? 0 : Number(value);
    setUserData({ ...userData, [name]: numValue });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || Number(value) === 0) {
      const defaults: Record<string, number> = { weight: 70, targetWeight: 70, height: 175, birthYear: 1995, bodyFat: 15, targetWeeks: 8 };
      setUserData({ ...userData, [name]: defaults[name] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div className="card" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        신체 데이터 입력
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>성별</label>
          <select 
            name="gender" 
            value={userData.gender} 
            onChange={(e) => setUserData({ ...userData, gender: e.target.value as any })}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
          >
            <option value="MALE">남성 (Male)</option>
            <option value="FEMALE">여성 (Female)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>현재 체중 (kg)</label>
            <input type="number" inputMode="decimal" step="0.1" name="weight" value={userData.weight || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="70.0" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>목표 체중 (kg)</label>
            <input type="number" inputMode="decimal" step="0.1" name="targetWeight" value={userData.targetWeight || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="65.0" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>신장 (cm)</label>
            <input type="number" inputMode="numeric" name="height" value={userData.height || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="175" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>출생년도 (4자리)</label>
            <input type="number" inputMode="numeric" name="birthYear" value={userData.birthYear || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="1995" maxLength={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>체지방률 (%)</label>
            <input type="number" inputMode="numeric" name="bodyFat" value={userData.bodyFat || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="15" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>목표 기간 (주)</label>
            <input type="number" inputMode="numeric" name="targetWeeks" value={userData.targetWeeks || ''} onChange={handleNumberChange} onBlur={handleBlur} placeholder="8" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--accent-secondary)', color: 'white' }} />
          </div>
        </div>

        <button type="submit" style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--accent-primary)', color: 'black', fontWeight: '900', fontSize: '1.1rem', marginTop: '1rem' }}>다음 단계로 (GOAL)</button>
      </form>
    </div>
  );
};

export default Onboarding;
