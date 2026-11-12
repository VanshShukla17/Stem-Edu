import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  XCircle,
  Award,
  Globe,
  Sparkles
} from 'lucide-react';
import PendulumSimulation from '../components/PendulumSimulation';
import { getLab, submitLabQuiz } from '../services/api';

export default function VirtualLabPage() {
  const { labId } = useParams();
  const effectiveLabId = labId || 'simple_pendulum';

  // API Lab metadata state
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulation physics parameters
  const [length, setLength] = useState(1.0);       // meters
  const [mass, setMass] = useState(0.2);           // kg
  const [gravity, setGravity] = useState(9.80);     // m/s²
  const [initialAngle, setInitialAngle] = useState(12); // degrees
  const [isRunning, setIsRunning] = useState(true);
  const [isSlowMotion, setIsSlowMotion] = useState(false);

  // Real-time HUD readout from simulation loop
  const [readout, setReadout] = useState({
    period: '2.006',
    cycles: 0,
    angleDeg: '12.0',
    simTime: '0.00'
  });

  // UI State: Active Tab ('procedure' | 'theory' | 'quiz')
  const [activeTab, setActiveTab] = useState('procedure');
  const [useHindi, setUseHindi] = useState(false);

  // Quiz submission state
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Fetch Lab from Backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getLab(effectiveLabId)
      .then((data) => {
        if (!isMounted) return;
        if (data.lab) {
          setLab(data.lab);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load lab data:', err);
        // Fallback default lab content for offline / disconnected states
        setLab({
          title: 'Simple Pendulum Experiment',
          titleHindi: 'सरल लोलक प्रयोग: आवर्तकाल की निर्भरता',
          description: 'Investigate how the time period of a simple pendulum depends on string length, bob mass, and the local acceleration due to gravity.',
          descriptionHindi: 'जांचें कि एक सरल लोलक का आवर्तकाल डोरी की लंबाई, गोलक के द्रव्यमान और गुरुत्वीय त्वरण पर कैसे निर्भर करता है।',
          instructions: [
            'Adjust the String Length (L) slider from 0.2m to 2.0m and observe how the swing frequency changes.',
            'Vary the Bob Mass (m) from 0.05kg to 1.0kg to test whether mass influences the oscillation duration.',
            'Switch between Earth (9.8 m/s²), Moon (1.62 m/s²), and Jupiter (24.79 m/s²) gravity environments.',
            'Use the Pause / Resume and Slow Motion toggles to inspect the instantaneous position and velocity.',
            'Answer the 3 observation quiz questions below to test your scientific deductions.'
          ],
          instructionsHindi: [
            'डोरी की लंबाई (L) को 0.2m से 2.0m तक बदलें और देखें कि दोलन आवृत्ति कैसे बदलती है।',
            'गोलक का द्रव्यमान (m) 0.05kg से 1.0kg तक बदलकर जांचें कि क्या द्रव्यमान आवर्तकाल को प्रभावित करता है।',
            'पृथ्वी, चंद्रमा और बृहस्पति के गुरुत्वाकर्षण विकल्पों में तुलना करें।',
            'लोलक की गति को ध्यान से देखने के लिए रोकें / चलाएं और स्लो मोशन का उपयोग करें।',
            'अपने वैज्ञानिक निष्कर्षों की जांच के लिए नीचे दिए गए 3 प्रश्नों के उत्तर दें।'
          ],
          observationQuestions: [
            {
              _id: 'q1',
              question: 'If you quadruple the length of a pendulum string (from 0.25 m to 1.0 m), what happens to its time period?',
              questionHindi: 'यदि आप लोलक की डोरी की लंबाई 4 गुना कर दें (0.25 m से 1.0 m), तो इसके आवर्तकाल पर क्या प्रभाव पड़ेगा?',
              options: [
                'It is halved',
                'It doubles (increases by 2x)',
                'It quadruples (increases by 4x)',
                'It remains completely unchanged'
              ],
              optionsHindi: [
                'यह आधा हो जाता है',
                'यह दोगुना हो जाता है (2x)',
                'यह चार गुना हो जाता है (4x)',
                'यह पूरी तरह अपरिवर्तित रहता है'
              ]
            },
            {
              _id: 'q2',
              question: 'How does increasing the mass of the pendulum bob from 50 g to 500 g affect the period of oscillation?',
              questionHindi: 'गोलक के द्रव्यमान को 50 ग्राम से बढ़ाकर 500 ग्राम करने पर दोलन काल पर क्या प्रभाव पड़ता है?',
              options: [
                'Period increases by 10x',
                'Period decreases by 10x',
                'Period remains completely unchanged',
                'Period depends on the bob material density'
              ],
              optionsHindi: [
                'आवर्तकाल 10 गुना बढ़ जाता है',
                'आवर्तकाल 10 गुना घट जाता है',
                'आवर्तकाल पूरी तरह अपरिवर्तित रहता है',
                'आवर्तकाल गोलक के घनत्व पर निर्भर करता है'
              ]
            },
            {
              _id: 'q3',
              question: 'On the Moon, where gravity is ~1/6th that of Earth (1.62 m/s²), how does the pendulum swing compared to Earth?',
              questionHindi: 'चंद्रमा पर, जहां गुरुत्वीय त्वरण पृथ्वी का ~1/6 (1.62 m/s²) है, लोलक पृथ्वी की तुलना में कैसा दोलन करेगा?',
              options: [
                'It swings much faster with a shorter period',
                'It swings much slower with a longer period',
                'It swings at the exact same frequency',
                'It stops oscillating entirely'
              ],
              optionsHindi: [
                'यह बहुत तेजी से और छोटे आवर्तकाल के साथ दोलन करेगा',
                'यह बहुत धीमे और लंबे आवर्तकाल के साथ दोलन करेगा',
                'यह बिल्कुल उसी आवृत्ति पर दोलन करेगा',
                'यह पूरी तरह रुक जाता है'
              ]
            }
          ]
        });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveLabId]);

  // Reset simulation to standard baseline
  const handleReset = () => {
    setLength(1.0);
    setMass(0.2);
    setGravity(9.80);
    setInitialAngle(12);
    setIsRunning(true);
    setIsSlowMotion(false);
  };

  // Option selection for Observation Quiz
  const handleSelectOption = (questionIdx, optionIdx) => {
    if (quizResult) return; // Prevent modifying after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  // Submit Observation Quiz
  const handleSubmitQuiz = async () => {
    const questions = lab?.observationQuestions || [];
    const answerIndices = questions.map((_, i) =>
      selectedAnswers[i] !== undefined ? selectedAnswers[i] : -1
    );

    // Validation check
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all observation questions before submitting!');
      return;
    }

    try {
      setSubmittingQuiz(true);
      const res = await submitLabQuiz(effectiveLabId, {
        answers: answerIndices,
        simulationConfig: { length, mass, gravity, angle: initialAngle }
      });
      setQuizResult(res);
    } catch (err) {
      console.warn('Backend quiz submission fallback, scoring client-side:', err);
      // Client-side fallback scoring if network is offline
      const fallbackAnswers = [
        { isCorrect: selectedAnswers[0] === 1, correctOptionIndex: 1, explanation: 'Because T = 2π√(L/g), period is proportional to √L. Quadrupling L doubles T (√4 = 2).' },
        { isCorrect: selectedAnswers[1] === 2, correctOptionIndex: 2, explanation: 'Period T = 2π√(L/g) is independent of bob mass for small angles.' },
        { isCorrect: selectedAnswers[2] === 1, correctOptionIndex: 1, explanation: 'In weaker gravity, 1/√g is larger, making period T longer and oscillations slower.' }
      ];
      let score = 0;
      fallbackAnswers.forEach((a) => { if (a.isCorrect) score += 1; });
      setQuizResult({
        score,
        totalQuestions: fallbackAnswers.length,
        percentage: Math.round((score / fallbackAnswers.length) * 100),
        passed: score >= 2,
        evaluatedAnswers: fallbackAnswers
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* Back Link & Language Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <button
          onClick={() => setUseHindi(!useHindi)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: useHindi ? '#EFF6FF' : '#F1F5F9',
            color: useHindi ? '#1D4ED8' : '#475569',
            border: `1px solid ${useHindi ? '#BFDBFE' : '#CBD5E1'}`,
            borderRadius: 'var(--radius-sm, 6px)',
            padding: '4px 10px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Globe size={14} /> {useHindi ? 'हिंदी (Hindi)' : 'English'}
        </button>
      </div>

      {/* Lab Header Card */}
      <div className="card" style={{ marginBottom: '14px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            Physics 3D Lab
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            CBSE Class 10 • Simple Harmonic Motion
          </span>
        </div>

        <h1 style={{ fontSize: '1.35rem', fontWeight: '700', margin: '4px 0 6px 0', color: '#0F172A' }}>
          {useHindi && lab?.titleHindi ? lab.titleHindi : (lab?.title || 'Simple Pendulum Experiment')}
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
          {useHindi && lab?.descriptionHindi ? lab.descriptionHindi : lab?.description}
        </p>
      </div>

      {/* 3D Simulation Viewport Card */}
      <div className="card" style={{ padding: '12px', marginBottom: '14px' }}>
        <PendulumSimulation
          length={length}
          mass={mass}
          gravity={gravity}
          initialAngle={initialAngle}
          isRunning={isRunning}
          isSlowMotion={isSlowMotion}
          onReadoutUpdate={setReadout}
        />

        {/* Live HUD Readout Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginTop: '12px',
            padding: '10px',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-sm, 6px)',
            border: '1px solid #E2E8F0',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
              Period (T)
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0284C7' }}>
              {readout.period} s
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
              Cycles
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#16A34A' }}>
              {readout.cycles}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
              Elapsed Time
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#475569' }}>
              {readout.simTime} s
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
              Angle (θ)
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#D97706' }}>
              {readout.angleDeg}°
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Controls Card */}
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 14px 0', color: '#1E293B' }}>
          Experimental Variables & Controls
        </h2>

        {/* Action Buttons: Play/Pause, Reset, Slow Motion */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="btn btn-primary"
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              backgroundColor: isRunning ? '#DC2626' : '#2563EB'
            }}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause Oscillation' : 'Resume Oscillation'}
          </button>

          <button
            onClick={() => setIsSlowMotion(!isSlowMotion)}
            className="btn btn-secondary"
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px',
              backgroundColor: isSlowMotion ? '#FEF3C7' : '#FFFFFF',
              color: isSlowMotion ? '#B45309' : '#334155',
              borderColor: isSlowMotion ? '#F59E0B' : '#CBD5E1'
            }}
          >
            <Gauge size={16} />
            {isSlowMotion ? 'Slow Motion: ON (0.5x)' : 'Slow Motion (0.5x)'}
          </button>

          <button
            onClick={handleReset}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 14px'
            }}
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Length Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                {useHindi ? 'डोरी की लंबाई (L)' : 'String Length (L)'}
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563EB' }}>
                {length.toFixed(2)} m
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
              <span>0.2 m (Faster)</span>
              <span>2.0 m (Slower)</span>
            </div>
          </div>

          {/* Mass Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                {useHindi ? 'गोलक का द्रव्यमान (m)' : 'Bob Mass (m)'}
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#059669' }}>
                {mass.toFixed(2)} kg
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={mass}
              onChange={(e) => setMass(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
              <span>0.05 kg</span>
              <span>1.0 kg (Scales 3D size)</span>
            </div>
          </div>

          {/* Release Angle Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                {useHindi ? 'प्रारंभिक कोण (θ₀)' : 'Initial Angle (θ₀)'}
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#D97706' }}>
                {initialAngle}°
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={initialAngle}
              onChange={(e) => setInitialAngle(parseInt(e.target.value, 10))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
              <span>5° (Strict SHM)</span>
              <span>25° (Wide Swing)</span>
            </div>
          </div>

          {/* Gravity Field Environment Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              {useHindi ? 'गुरुत्वाकर्षण क्षेत्र (g)' : 'Gravitational Field (g)'}: {gravity.toFixed(2)} m/s²
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { label: '🌍 Earth', val: 9.80 },
                { label: '🌕 Moon', val: 1.62 },
                { label: '🪐 Jupiter', val: 24.79 }
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setGravity(preset.val)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid',
                    borderColor: Math.abs(gravity - preset.val) < 0.05 ? '#2563EB' : '#CBD5E1',
                    backgroundColor: Math.abs(gravity - preset.val) < 0.05 ? '#EFF6FF' : '#F8FAFC',
                    color: Math.abs(gravity - preset.val) < 0.05 ? '#1D4ED8' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Procedure vs Theory vs Quiz */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('procedure')}
          style={{
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: activeTab === 'procedure' ? 'var(--color-primary)' : '#64748B',
            borderBottom: activeTab === 'procedure' ? '3px solid var(--color-primary)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <BookOpen size={16} /> {useHindi ? 'प्रयोग विधि' : 'Procedure'}
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          style={{
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: activeTab === 'theory' ? 'var(--color-primary)' : '#64748B',
            borderBottom: activeTab === 'theory' ? '3px solid var(--color-primary)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={16} /> {useHindi ? 'भौतिक सिद्धांत' : 'Physics Theory'}
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          style={{
            padding: '10px 16px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: activeTab === 'quiz' ? 'var(--color-primary)' : '#64748B',
            borderBottom: activeTab === 'quiz' ? '3px solid var(--color-primary)' : '3px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <HelpCircle size={16} /> {useHindi ? 'निष्कर्ष प्रश्नोत्तरी' : 'Observation Quiz'}
          {quizResult && <CheckCircle2 size={14} color="#16A34A" />}
        </button>
      </div>

      {/* TAB CONTENT 1: PROCEDURE */}
      {activeTab === 'procedure' && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 12px 0', color: '#1E293B' }}>
            {useHindi ? 'प्रायोगिक चरण (Experimental Steps)' : 'Step-by-Step Lab Procedure'}
          </h3>
          <ol style={{ paddingLeft: '20px', margin: 0, color: '#334155', lineHeight: 1.7, fontSize: '0.9rem' }}>
            {(useHindi && lab?.instructionsHindi?.length ? lab.instructionsHindi : (lab?.instructions || [])).map(
              (step, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  {step}
                </li>
              )
            )}
          </ol>
        </div>
      )}

      {/* TAB CONTENT 2: PHYSICS THEORY */}
      {activeTab === 'theory' && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 12px 0', color: '#1E293B' }}>
            {useHindi ? 'सरल लोलक का गणितीय मॉडल' : 'Mathematical Model of the Simple Pendulum'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, margin: '0 0 12px 0' }}>
            For small angular displacements (θ ≤ 15°), the restoring force is proportional to displacement (F ≈ -mgθ = -(mg/L)x), resulting in Simple Harmonic Motion (SHM).
          </p>

          <div
            style={{
              padding: '12px',
              backgroundColor: '#F1F5F9',
              borderRadius: 'var(--radius-sm, 6px)',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              color: '#0F172A',
              margin: '12px 0'
            }}
          >
            T = 2π √(L / g)
          </div>

          <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
            <p><strong>1. Length Dependence:</strong> Time period T is directly proportional to √L. Doubling length increases T by ≈ 1.414×; quadrupling length doubles T.</p>
            <p><strong>2. Mass Independence:</strong> The mass of the bob m cancels out entirely in Newton's second law (ma = -mg sin θ). Therefore, changing bob mass from 50g to 1000g has <strong>zero effect</strong> on period.</p>
            <p><strong>3. Gravity Dependence:</strong> Because g is in the denominator under the radical, weaker gravity (like on the Moon, g = 1.62 m/s²) yields a much longer period (T ≈ 4.94 s for L = 1 m vs 2.006 s on Earth).</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: OBSERVATION QUIZ */}
      {activeTab === 'quiz' && (
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#1E293B' }}>
              {useHindi ? 'अवलोकन प्रश्नोत्तरी' : 'End-of-Lab Observation Quiz'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              {lab?.observationQuestions?.length || 3} Questions
            </span>
          </div>

          {/* Result Banner if already submitted */}
          {quizResult && (
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: quizResult.passed ? '#DCFCE7' : '#FEF2F2',
                border: `1px solid ${quizResult.passed ? '#86EFAC' : '#FECACA'}`,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {quizResult.passed ? (
                <Award size={32} color="#15803D" />
              ) : (
                <XCircle size={32} color="#DC2626" />
              )}
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: quizResult.passed ? '#15803D' : '#991B1B' }}>
                  {quizResult.passed ? '🎉 Discovery Verified! Lab Passed' : '⚠️ Keep Investigating! Retake Recommended'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                  Score: {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%) • Minimum to pass: 60%
                </div>
              </div>
            </div>
          )}

          {/* Observation Questions List */}
          {(lab?.observationQuestions || []).map((q, qIdx) => {
            const selectedOpt = selectedAnswers[qIdx];
            const evalAnswer = quizResult?.evaluatedAnswers?.[qIdx];

            return (
              <div
                key={q._id || qIdx}
                style={{
                  padding: '14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid #E2E8F0',
                  marginBottom: '14px'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '0.92rem', color: '#0F172A', marginBottom: '10px' }}>
                  {qIdx + 1}. {useHindi && q.questionHindi ? q.questionHindi : q.question}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(useHindi && q.optionsHindi?.length ? q.optionsHindi : q.options).map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    let borderCol = isSelected ? '#2563EB' : '#CBD5E1';
                    let bgCol = isSelected ? '#EFF6FF' : '#FFFFFF';
                    let statusLabel = null;

                    if (evalAnswer) {
                      const isCorrect = evalAnswer.correctOptionIndex === optIdx;
                      if (isSelected && isCorrect) {
                        borderCol = '#16A34A';
                        bgCol = '#DCFCE7';
                        statusLabel = '[Your Answer: Correct]';
                      } else if (isSelected && !isCorrect) {
                        borderCol = '#DC2626';
                        bgCol = '#FEE2E2';
                        statusLabel = '[Your Answer: Incorrect]';
                      } else if (isCorrect) {
                        borderCol = '#16A34A';
                        bgCol = '#F0FDF4';
                        statusLabel = '[Correct Answer]';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={!!quizResult}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        style={{
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm, 6px)',
                          border: `1.5px solid ${borderCol}`,
                          backgroundColor: bgCol,
                          cursor: quizResult ? 'default' : 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.88rem'
                        }}
                      >
                        <span style={{ color: '#1E293B', fontWeight: isSelected ? '600' : '400' }}>
                          {String.fromCharCode(65 + optIdx)}) {opt}
                        </span>
                        {statusLabel && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: statusLabel.includes('Correct') && !statusLabel.includes('Incorrect')
                                ? '#15803D'
                                : '#B91C1C'
                            }}
                          >
                            {statusLabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Post-submit explanation */}
                {evalAnswer && evalAnswer.explanation && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '4px',
                      borderLeft: '4px solid #3B82F6',
                      fontSize: '0.82rem',
                      color: '#475569',
                      lineHeight: 1.5
                    }}
                  >
                    <strong>Explanation:</strong> {evalAnswer.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {/* Action button: Submit or Retake */}
          {!quizResult ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submittingQuiz}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {submittingQuiz ? 'Submitting & Scoring...' : 'Submit Lab Observations'}
            </button>
          ) : (
            <button
              onClick={() => {
                setQuizResult(null);
                setSelectedAnswers({});
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
            >
              Retake Observation Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
