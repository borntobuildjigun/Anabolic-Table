import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateWeightLossReport } from '../utils/calculations';
import { TrendingDown, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

const WeightLossReport: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData } = context;
  const report = useMemo(() => calculateWeightLossReport(userData), [userData]);

  if (userData.goal === 'BULK') return null; // 벌크업 시에는 표시하지 않음

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
        <TrendingDown size={20} /> 예상 감량 리포트
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>하루 평균 감량</p>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>
            {report.dailyLossG}<span style={{ fontSize: '0.9rem', marginLeft: '0.2rem' }}>g</span>
          </div>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>주간 평균 감량</p>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>
            {report.weeklyLossKg}<span style={{ fontSize: '0.9rem', marginLeft: '0.2rem' }}>kg</span>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        padding: '1rem', 
        background: 'rgba(204, 255, 0, 0.05)', 
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        <Calendar color="var(--accent-primary)" size={24} />
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>목표 체중 달성까지</p>
          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-primary)' }}>
            약 {report.daysToTarget}일 소요 예상
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
          border: '1px solid rgba(255, 102, 0, 0.3)'
        }}>
          <AlertTriangle color="var(--accent-secondary)" size={20} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', lineHeight: '1.5' }}>
            {report.warningMsg}
          </p>
        </div>
      )}
      
      {!report.isWarning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <CheckCircle size={14} color="var(--success)" />
          <span>건강한 감량 속도입니다. 꾸준히 유지하세요!</span>
        </div>
      )}
    </div>
  );
};

export default WeightLossReport;
