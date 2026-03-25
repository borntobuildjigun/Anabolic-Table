import React, { useContext } from 'react';
import { AppContext, WorkoutIntensityType } from '../App';
import { Flame, Dumbbell, Coffee, ChevronRight } from 'lucide-react';

const WorkoutIntensity: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;

  const options: { id: WorkoutIntensityType; label: string; desc: string; icon: any; color: string; subDesc: string }[] = [
    { 
      id: 'HIGH', 
      label: '고강도 (High)', 
      desc: '하체, 등, 고중량 웨이트', 
      icon: Flame, 
      color: 'var(--danger)', 
      subDesc: 'High Carb 모드: 탄수화물 증량 (+10% kcal)' 
    },
    { 
      id: 'MEDIUM', 
      label: '중강도 (Medium)', 
      desc: '소근육, 일반 웨이트', 
      icon: Dumbbell, 
      color: 'var(--accent-primary)', 
      subDesc: 'Medium Carb 모드: 표준 매크로 유지' 
    },
    { 
      id: 'LOW', 
      label: '휴식/유산소 (Low)', 
      desc: 'Rest Day, 저강도 활동', 
      icon: Coffee, 
      color: 'var(--text-secondary)', 
      subDesc: 'Low Carb 모드: 탄수화물 절감 (지방 보충)' 
    },
  ];

  const handleSelect = (id: WorkoutIntensityType) => {
    setUserData({ ...userData, workoutIntensity: id });
    setStep(4);
  };

  return (
    <div className="card" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        오늘 어떤 운동을 하시나요?
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        운동 강도에 따라 탄수화물 비율을 과학적으로 재배분합니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              borderRadius: '12px',
              background: 'var(--bg-tertiary)',
              border: userData.workoutIntensity === opt.id ? `2px solid ${opt.color}` : '2px solid transparent',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{ 
              background: `${opt.color}20`, 
              padding: '0.75rem', 
              borderRadius: '10px',
              color: opt.color 
            }}>
              <opt.icon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>{opt.label}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{opt.desc}</div>
              <div style={{ color: opt.color, fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 'bold', opacity: 0.8 }}>{opt.subDesc}</div>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </button>
        ))}
      </div>

      <button 
        onClick={() => setStep(2)}
        style={{ 
          width: '100%', 
          marginTop: '1.5rem', 
          padding: '0.75rem', 
          background: 'none', 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem',
          textDecoration: 'underline'
        }}
      >
        이전 단계로
      </button>
    </div>
  );
};

export default WorkoutIntensity;
