import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateWeightLossReport } from '../utils/calculations';
import { TrendingDown, Calendar, CheckCircle, AlertTriangle, Target } from 'lucide-react';

const WeightLossReport: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData } = context;
  const report = useMemo(() => calculateWeightLossReport(userData), [userData]);

  if (userData.goal === 'BULK') return null;

  return (
    <div className="card" style={{ 
      background: 'linear-gradient(145deg, #1e1e1e 0%, #161616 100%)',
      border: report.isWarning ? '1px solid var(--accent-secondary)' : '1px solid var(--accent-primary)',
      marginTop: '2rem'
    }}>
      <h3 style={{ 
        fontSize: '1.1rem', 
        color: report.isWarning ? 'var(--accent-secondary)' : 'var(--accent-primary)', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <TrendingDown size={20} /> 감량 시뮬레이션 리포트
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>일일 예상 감량</p>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>
            {report.dailyLossG}<span style={{ fontSize: '0.9rem', marginLeft: '0.2rem' }}>g</span>
          </div>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>하루 약 {report.dailyLossG}g 체지방 연소</p>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>주간 예상 감량</p>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>
            {report.weeklyLossKg}<span style={{ fontSize: '0.9rem', marginLeft: '0.2rem' }}>kg</span>
          </div>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>주당 {report.weeklyLossKg}kg 감량 페이스</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1rem', 
          background: 'rgba(204, 255, 0, 0.05)', 
          borderRadius: '12px',
        }}>
          <Calendar color="var(--accent-primary)" size={24} />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>설정 기간</p>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-primary)' }}>
              {report.weeksToTarget}주
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1rem', 
          background: 'rgba(0, 204, 255, 0.05)', 
          borderRadius: '12px',
        }}>
          <Target color="#00ccff" size={24} />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>목표 달성률</p>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#00ccff' }}>
              {report.achievementRate}%
            </div>
          </div>
        </div>
      </div>

      {report.isWarning && (
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          padding: '1rem', 
          background: 'rgba(255, 102, 0, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 102, 0, 0.3)',
          marginBottom: '1rem'
        }}>
          <AlertTriangle color="var(--accent-secondary)" size={20} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', lineHeight: '1.5' }}>
            {report.warningMsg}
          </p>
        </div>
      )}
      
      {!report.isWarning && report.achievementRate >= 95 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <CheckCircle size={14} color="var(--success)" />
          <span>설정한 기간 내에 목표 달성이 가능합니다!</span>
        </div>
      )}

      {!report.isWarning && report.achievementRate < 95 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>
          <AlertTriangle size={14} color="var(--accent-secondary)" />
          <span>기간 내 목표 달성을 위해 식단 기간을 늘리는 것을 권장합니다.</span>
        </div>
      )}
    </div>
  );
};

export default WeightLossReport;
