import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateMacros, calculateWaterIntake, calculateWeightLossReport } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Droplets, ArrowLeft, Zap, TrendingDown, Calendar, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;
  const macros = useMemo(() => calculateMacros(userData), [userData]);
  const waterIntake = useMemo(() => calculateWaterIntake(userData.weight), [userData.weight]);
  const report = useMemo(() => calculateWeightLossReport(userData), [userData]);

  const chartData = [
    { name: '탄수화물', value: macros.carbs * 4, color: 'var(--accent-primary)' },
    { name: '단백질', value: macros.protein * 4, color: '#00ccff' },
    { name: '지방', value: macros.fat * 9, color: 'var(--accent-secondary)' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <button 
        onClick={() => setStep(1)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'none', 
          color: 'var(--text-secondary)', 
          fontSize: '0.85rem',
          marginBottom: '1rem',
          padding: '0.5rem 0',
          cursor: 'pointer',
          border: 'none'
        }}
      >
        <ArrowLeft size={16} /> 정보 수정하기
      </button>

      {/* 최상단 요약 리포트 */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
        border: '1px solid var(--accent-primary)',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Final Recommendation
        </div>
        <div style={{ fontSize: '2.8rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {macros.calories}<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>kcal / day</span>
        </div>
        
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '12px', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '30px',
          marginTop: '0.5rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ fontWeight: '900', color: 'var(--accent-primary)' }}>{userData.weight}kg</span>
          <ArrowLeft size={14} style={{ transform: 'rotate(180deg)', color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: '900', color: 'var(--accent-secondary)' }}>{userData.targetWeight}kg</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '4px' }}>
            ({userData.targetWeeks}주 소요 예상)
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* 매크로 비율 */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>영양 성분 구성</h3>
            <div style={{ width: '60px', height: '60px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={18} outerRadius={28} paddingAngle={2} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>탄</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{macros.carbs}g</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#00ccff', fontWeight: 'bold' }}>단</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{macros.protein}g</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>지</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{macros.fat}g</div>
            </div>
          </div>
        </div>

        {/* 수분 & 요약 */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(0, 170, 255, 0.3)' }}>
          <Droplets color="#00aaff" size={20} style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.75rem', color: '#00aaff', fontWeight: 'bold' }}>권장 수분</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{waterIntake.toFixed(1)}L</div>
        </div>
      </div>

      {/* 감량 상세 리포트 (심플 버전) */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>주간 예상 감량</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{report.weeklyLossKg}kg</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>목표 달성률</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#00ccff' }}>{report.achievementRate}%</div>
          </div>
          <div style={{ flex: 1.5 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>상태</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: report.isWarning ? 'var(--accent-secondary)' : 'var(--success)' }}>
              {report.isWarning ? '주의: 기간 연장 권장' : '순조로운 페이스'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
