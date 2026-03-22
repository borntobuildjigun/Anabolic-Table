import React, { useContext } from 'react';
import { AppContext } from '../App';

const Onboarding: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: name === 'gender' ? value : Number(value)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        신체 데이터 입력
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>성별</label>
          <select 
            name="gender" 
            value={userData.gender} 
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
          >
            <option value="MALE">남성 (Male)</option>
            <option value="FEMALE">여성 (Female)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>현재 체중 (kg)</label>
            <input 
              type="number" 
              name="weight" 
              value={userData.weight} 
              onChange={handleChange}
              placeholder="80"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>목표 체중 (kg)</label>
            <input 
              type="number" 
              name="targetWeight" 
              value={userData.targetWeight} 
              onChange={handleChange}
              placeholder="85"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>신장 (cm)</label>
            <input 
              type="number" 
              name="height" 
              value={userData.height} 
              onChange={handleChange}
              placeholder="180"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>나이</label>
            <input 
              type="number" 
              name="age" 
              value={userData.age} 
              onChange={handleChange}
              placeholder="30"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>체지방률 (%)</label>
          <input 
            type="number" 
            name="bodyFat" 
            value={userData.bodyFat} 
            onChange={handleChange}
            placeholder="15"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'white' }}
          />
        </div>

        <button 
          type="submit" 
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
          다음 단계로 (GOAL)
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
