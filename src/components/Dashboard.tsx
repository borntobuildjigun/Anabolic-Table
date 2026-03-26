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

      {/* 최상단 요약 리포트 (Sticky-like feel) */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
        border: '2px solid var(--accent-primary)',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(204, 255, 0, 0.1)',
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* 장식용 요소 */}
        <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: 'black', padding: '2px 12px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px' }}>
          ANABOLIC REPORT
        </div>

        <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          일일 권장 섭취량
        </div>
        <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white', marginBottom: '1rem', lineHeight: 1 }}>
          {macros.calories}<span style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', marginLeft: '4px' }}>kcal</span>
        </div>
        
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '16px', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '0.85rem 2rem', 
          borderRadius: '100px',
          marginTop: '0.5rem',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>현재</div>
            <div style={{ fontWeight: '900', color: 'white', fontSize: '1.1rem' }}>{userData.weight}kg</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', color: 'var(--accent-primary)' }} />
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{userData.targetWeeks}주</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>목표</div>
            <div style={{ fontWeight: '900', color: 'var(--accent-secondary)', fontSize: '1.1rem' }}>{userData.targetWeight}kg</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* 매크로 비율 */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-secondary)' }}>매크로 영양소</h3>
            <div style={{ width: '64px', height: '64px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={2} dataKey="value">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center', background: 'rgba(204, 255, 0, 0.05)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '2px' }}>탄</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{macros.carbs}g</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(0, 204, 255, 0.05)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#00ccff', fontWeight: 'bold', marginBottom: '2px' }}>단</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{macros.protein}g</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255, 102, 0, 0.05)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-secondary)', fontWeight: 'bold', marginBottom: '2px' }}>지</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{macros.fat}g</div>
            </div>
          </div>
        </div>

        {/* 수분 & 요약 */}
        <div className="card" style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          border: '1px solid rgba(0, 170, 255, 0.3)',
          background: 'linear-gradient(135deg, rgba(0,170,255,0.05) 0%, transparent 100%)'
        }}>
          <Droplets color="#00aaff" size={24} style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '0.75rem', color: '#00aaff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Water</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white' }}>{waterIntake.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '2px' }}>L</span></div>
        </div>
      </div>

      {/* 감량 상세 리포트 */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>주간 감량 페이스</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{report.weeklyLossKg}kg</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>하루 약 {report.dailyLossG}g 감량</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>목표 달성률</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#00ccff' }}>{report.achievementRate}%</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>기간 내 완성 가능</div>
          </div>
          <div style={{ flex: 1.2 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>건강 상태</div>
            <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: 'bold', 
              color: report.isWarning ? 'var(--accent-secondary)' : 'var(--success)',
              background: report.isWarning ? 'rgba(255, 102, 0, 0.1)' : 'rgba(0, 255, 136, 0.05)',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {report.isWarning ? '주의: 기간 연장 권장' : '안정적'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {report.isWarning ? '신진대사 보호 필요' : '최적의 대사 효율'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
