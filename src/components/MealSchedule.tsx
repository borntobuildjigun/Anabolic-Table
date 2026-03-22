import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { calculateMacros, distributeMacros, getAIRecommendation } from '../utils/calculations';
import { INGREDIENTS } from '../utils/ingredients';
import { CheckCircle2, Circle, Lightbulb, Zap, Package, Copy, Share2, Clock } from 'lucide-react';

interface MealWeightResult {
  value: string | number;
  unit: string;
  isReady: boolean;
}

const MealSchedule: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { userData, setUserData } = context;
  const totalMacros = useMemo(() => calculateMacros(userData), [userData]);
  const mealMacros = useMemo(() => distributeMacros(totalMacros, userData.mealCount, userData.workoutTime), [totalMacros, userData.mealCount, userData.workoutTime]);
  const recommendations = useMemo(() => getAIRecommendation(totalMacros, userData), [totalMacros, userData]);

  const handleMealCountChange = (count: number) => {
    setUserData({ ...userData, mealCount: count, mealsStatus: new Array(count).fill(false) });
  };

  const toggleMealStatus = (index: number) => {
    const newStatus = [...userData.mealsStatus];
    newStatus[index] = !newStatus[index];
    setUserData({ ...userData, mealsStatus: newStatus });
  };

  const getMealWeight = (macroType: 'carbs' | 'protein' | 'fats', amount: number, ingredientName: string): MealWeightResult => {
    const ingredient = INGREDIENTS[macroType][ingredientName];
    if (!ingredient) return { value: 0, unit: 'g', isReady: false };
    
    const macroPer100g = macroType === 'carbs' ? ingredient.carbs : macroType === 'protein' ? ingredient.protein : ingredient.fat;
    const weight = (amount / (macroPer100g || 1)) * 100;

    if (userData.isReadyMealMode && ingredient.readyMealUnit) {
      const units = weight / ingredient.readyMealUnit.weight;
      return { value: units.toFixed(1), unit: ingredient.readyMealUnit.name, isReady: true };
    }
    return { value: Math.round(weight), unit: 'g', isReady: false };
  };

  const copyToClipboard = () => {
    let text = `[ANABOLIC TABLE 오늘의 식단]\n\n`;
    mealMacros.forEach((m, i) => {
      const c = userData.selectedIngredients.carbs[0] || '현미밥';
      const p = userData.selectedIngredients.protein[0] || '닭가슴살';
      const cW = getMealWeight('carbs', m.carbs, c);
      const pW = getMealWeight('protein', m.protein, p);
      text += `[${i + 1}식] ${c} ${cW.value}${cW.unit} + ${p} ${pW.value}${pW.unit}\n`;
    });
    navigator.clipboard.writeText(text);
    alert('식단이 복사되었습니다!');
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>전문가용 식단표</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={copyToClipboard} className="neon-border" style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'white' }}>
            <Copy size={20} />
          </button>
          <button onClick={() => window.print()} className="neon-border" style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'white' }}>
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Clock size={20} />
          <span style={{ fontWeight: 'bold' }}>오늘의 메인 운동 시간</span>
        </div>
        <input 
          type="time" 
          value={userData.workoutTime}
          onChange={(e) => setUserData({ ...userData, workoutTime: e.target.value })}
          style={{ background: 'var(--bg-tertiary)', color: 'white', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setUserData({ ...userData, isReadyMealMode: false })}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: !userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: !userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold' }}
        >
          원물(Raw) 모드
        </button>
        <button 
          onClick={() => setUserData({ ...userData, isReadyMealMode: true })}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: userData.isReadyMealMode ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: userData.isReadyMealMode ? 'black' : 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Package size={18} /> 간편식 모드
        </button>
      </div>

      <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        {[3, 4, 5].map(count => (
          <button key={count} onClick={() => handleMealCountChange(count)} style={{ flex: 1, padding: '1rem', borderRadius: '10px', background: userData.mealCount === count ? 'var(--accent-primary)' : 'transparent', color: userData.mealCount === count ? 'black' : 'var(--text-secondary)', fontWeight: '900', fontSize: '1.1rem' }}>
            {count} MEALS
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {mealMacros.map((macros, index) => {
          const isDone = userData.mealsStatus[index];
          const carbName = userData.selectedIngredients.carbs[0] || '현미밥';
          const proteinName = userData.selectedIngredients.protein[0] || '닭가슴살';
          const fatName = userData.selectedIngredients.fats[0] || '아몬드';

          const cW = getMealWeight('carbs', macros.carbs, carbName);
          const pW = getMealWeight('protein', macros.protein, proteinName);
          const fW = getMealWeight('fats', macros.fat, fatName);

          return (
            <div key={index} className="card" style={{ opacity: isDone ? 0.4 : 1, border: isDone ? '1px solid var(--border-color)' : macros.isWorkoutFuel ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: isDone ? 'var(--bg-primary)' : 'var(--bg-secondary)', position: 'relative' }}>
              {macros.isWorkoutFuel && (
                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--accent-primary)', color: 'black', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={12} fill="black" /> WORKOUT FUEL
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: macros.isWorkoutFuel ? 'var(--accent-primary)' : 'white' }}>{index + 1}st MEAL</h3>
                <button onClick={() => toggleMealStatus(index)} style={{ background: 'none', color: isDone ? 'var(--success)' : 'var(--text-muted)' }}>
                  {isDone ? <CheckCircle2 size={28} color="#00ff88" /> : <Circle size={28} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: 'var(--accent-primary)', color: 'black', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '900', minWidth: '95px', textAlign: 'center' }}>
                    {cW.value}{cW.unit}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{carbName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#00ccff', color: 'black', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '900', minWidth: '95px', textAlign: 'center' }}>
                    {pW.value}{pW.unit}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{proteinName}</div>
                </div>
                {macros.fat > 3 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--accent-secondary)', color: 'black', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '900', minWidth: '95px', textAlign: 'center' }}>
                      {fW.value}{fW.unit}
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{fatName}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {userData.isReadyMealMode && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
          ※ 시판 제품마다 영양 성분이 다를 수 있으니 패키지를 확인하세요.
        </p>
      )}

      {recommendations.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', background: 'rgba(204, 255, 0, 0.05)', border: '1px solid var(--accent-primary)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            <Lightbulb size={20} /> AI 추천 보완 가이드
          </h4>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {recommendations.map((rec, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MealSchedule;
