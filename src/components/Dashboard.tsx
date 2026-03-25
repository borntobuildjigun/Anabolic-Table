import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateMacros, calculateWaterIntake, getFormulaName, getCarbCycleCoaching } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Droplets, ArrowLeft, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;
  const macros = useMemo(() => calculateMacros(userData), [userData]);
  const waterIntake = useMemo(() => calculateWaterIntake(userData.weight), [userData.weight]);
  const coachingMsg = useMemo(() => getCarbCycleCoaching(userData), [userData]);

  const chartData = [
    { name: '탄수화물', value: macros.carbs * 4, color: 'var(--accent-primary)', grams: macros.carbs },
    { name: '단백질', value: macros.protein * 4, color: '#00ccff', grams: macros.protein },
    { name: '지방', value: macros.fat * 9, color: 'var(--accent-secondary)', grams: macros.fat },
  ];

  const cycleInfo = {
    HIGH: { label: 'HIGH CARB', color: 'var(--danger)', bg: 'rgba(255, 68, 68, 0.1)' },
    MEDIUM: { label: 'MEDIUM CARB', color: 'var(--accent-primary)', bg: 'rgba(204, 255, 0, 0.1)' },
    LOW: { label: 'LOW CARB', color: 'var(--text-secondary)', bg: 'rgba(160, 160, 160, 0.1)' },
  }[userData.workoutIntensity || 'MEDIUM'];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <button 
        onClick={() => setStep(3)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'none', 
          color: 'var(--accent-primary)', 
          fontWeight: 'bold',
          marginBottom: '1rem',
          padding: '0.5rem 0',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={18} /> 운동 강도 다시 설정하기
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem', margin: 0 }}>
          매크로 분석 대시보드
        </h2>
        <div style={{ 
          background: cycleInfo.bg, 
          color: cycleInfo.color, 
          padding: '0.4rem 0.8rem', 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontWeight: '900',
          border: `1px solid ${cycleInfo.color}40`,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Zap size={12} fill={cycleInfo.color} /> {cycleInfo.label}
        </div>
      </div>

      {/* 코칭 문구 카드 */}
      <div className="card" style={{ 
        border: `1px solid ${cycleInfo.color}30`, 
        background: `linear-gradient(to right, ${cycleInfo.bg}, transparent)`,
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'white', fontWeight: '500' }}>
            {coachingMsg}
          </p>
        </div>
      </div>
      
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>일일 총 칼로리</p>
            <div className="bold-value" style={{ fontSize: '2.5rem' }}>
              {macros.calories}<span className="unit">kcal</span>
            </div>
          </div>
          <div style={{ width: '120px', height: '120px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(204, 255, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(204, 255, 0, 0.2)' }}>
            <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 'bold' }}>탄수화물</p>
            <div style={{ fontWeight: '900', fontSize: '1.25rem' }}>{macros.carbs}g</div>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>에너지원</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0, 204, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 204, 255, 0.2)' }}>
            <p style={{ color: '#00ccff', fontSize: '0.75rem', fontWeight: 'bold' }}>단백질</p>
            <div style={{ fontWeight: '900', fontSize: '1.25rem' }}>{macros.protein}g</div>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>근합성</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 102, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
            <p style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem', fontWeight: 'bold' }}>지방</p>
            <div style={{ fontWeight: '900', fontSize: '1.25rem' }}>{macros.fat}g</div>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>호르몬</p>
          </div>
        </div>
      </div>

      {/* 수분 섭취 가이드 */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a192f 100%)',
        border: '1px solid #00aaff',
        marginTop: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0, 170, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <Droplets color="#00aaff" size={32} />
          </div>
          <div>
            <p style={{ color: '#00aaff', fontSize: '0.875rem', fontWeight: 'bold' }}>오늘의 권장 수분량</p>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white' }}>
              {waterIntake.toFixed(1)}<span style={{ fontSize: '1.25rem', marginLeft: '0.25rem' }}>L</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8 }}>
          현재 <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{getFormulaName(userData)}</span> 공식 및 탄수화물 사이클링이 적용된 데이터입니다.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
