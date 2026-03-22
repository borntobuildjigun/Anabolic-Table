import React, { useContext } from 'react';
import { AppContext, UserGoal } from '../App';
import { Flame, TrendingUp, Target } from 'lucide-react';

const GoalSelection: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;

  const goals: { id: UserGoal; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: 'BULK', 
      label: '벌크업 (Bulk Up)', 
      desc: '근육량 최대화 및 고강도 훈련을 위한 잉여 칼로리 섭취', 
      icon: <TrendingUp size={32} />,
      color: 'var(--accent-primary)'
    },
    { 
      id: 'LEAN', 
      label: '린매스업 (Lean Mass Up)', 
      desc: '체지방 증가를 최소화하며 순수 근육 성장을 도모', 
      icon: <Target size={32} />,
      color: '#00ccff'
    },
    { 
      id: 'CUT', 
      label: '커팅 (Cutting)', 
      desc: '근손실 최소화 및 선명도 향상을 위한 체지방 감량', 
      icon: <Flame size={32} />,
      color: 'var(--accent-secondary)'
    },
  ];

  const handleSelect = (goalId: UserGoal) => {
    setUserData({ ...userData, goal: goalId });
    setStep(3);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
        목적 선택
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => handleSelect(goal.id)}
            className="card neon-border"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              textAlign: 'left',
              width: '100%',
              padding: '1.5rem',
              cursor: 'pointer',
              background: userData.goal === goal.id ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              borderColor: userData.goal === goal.id ? goal.color : 'var(--border-color)',
              color: 'white'
            }}
          >
            <div style={{ color: goal.color }}>
              {goal.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{goal.label}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{goal.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GoalSelection;
