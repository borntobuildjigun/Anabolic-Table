import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateMacros, calculateWaterIntake } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Droplets, ArrowLeft } from 'lucide-react';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData, setStep } = context;
  const macros = useMemo(() => calculateMacros(userData), [userData]);
  const waterIntake = useMemo(() => calculateWaterIntake(userData.weight), [userData.weight]);

  const chartData = [
    { name: '탄수화물', value: macros.carbs * 4, color: 'var(--accent-primary)', grams: macros.carbs },
    { name: '단백질', value: macros.protein * 4, color: '#00ccff', grams: macros.protein },
    { name: '지방', value: macros.fat * 9, color: 'var(--accent-secondary)', grams: macros.fat },
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
          color: 'var(--accent-primary)', 
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          padding: '0.5rem 0',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={18} /> 처음부터 다시 설정하기
      </button>

      <h2 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        매크로 분석 대시보드
        {userData.goal === 'CUT' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>식단 기간: <strong>{userData.targetWeeks}주</strong></span>
            <input 
              type="range" 
              min="2" 
              max="24" 
              value={userData.targetWeeks} 
              onChange={(e) => setUserData({ ...userData, targetWeeks: parseInt(e.target.value) })}
              style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        )}
      </h2>
      
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
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>글리코겐 & 에너지</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0, 204, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 204, 255, 0.2)' }}>
            <p style={{ color: '#00ccff', fontSize: '0.75rem', fontWeight: 'bold' }}>단백질</p>
            <div style={{ fontWeight: '900', fontSize: '1.25rem' }}>{macros.protein}g</div>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>근합성 & 회복</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 102, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
            <p style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem', fontWeight: 'bold' }}>지방</p>
            <div style={{ fontWeight: '900', fontSize: '1.25rem' }}>{macros.fat}g</div>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>호르몬 조절</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          💡 <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>보디빌딩 팁:</span> {
            userData.goal === 'BULK' 
              ? '벌크업 시기에는 탄수화물을 충분히 섭취하여 근육 내 글리코겐 저장량을 최대화하고 강도 높은 훈련을 지속하세요.'
              : userData.goal === 'CUT'
              ? '커팅 시기에는 단백질 섭취량을 유지하여 근손실을 방지하고, 지방 대사를 위해 적절한 활동량을 유지하는 것이 중요합니다.'
              : '린매스업은 정교한 칼로리 조절이 필요합니다. 체중 변화를 주 단위로 모니터링하며 섭취량을 미세 조정하세요.'
          }
        </p>
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
    </div>
  );
};

export default Dashboard;
