import React from 'react';
import { Link } from 'react-router-dom';
import { Atom, FlaskConical, Dna, Calculator, ArrowRight } from 'lucide-react';

export default function SubjectsPage() {
  const subjects = [
    {
      id: 'physics',
      name: 'Physics',
      nameHindi: 'भौतिक विज्ञान',
      chapter: 'Electricity (विद्युत)',
      color: '#2563EB',
      icon: Atom
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      nameHindi: 'रासायनिक विज्ञान',
      chapter: 'Chemical Reactions and Equations',
      color: '#7C3AED',
      icon: FlaskConical
    },
    {
      id: 'biology',
      name: 'Biology',
      nameHindi: 'जीव विज्ञान',
      chapter: 'Life Processes (जैव प्रक्रम)',
      color: '#16A34A',
      icon: Dna
    },
    {
      id: 'math',
      name: 'Mathematics',
      nameHindi: 'गणित',
      chapter: 'Real Numbers (वास्तविक संख्याएं)',
      color: '#CA8A04',
      icon: Calculator
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px' }}>Subjects (विषय)</h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
        Select a subject to begin reading chapters and notes
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {subjects.map((sub) => {
          const Icon = sub.icon;
          return (
            <div key={sub.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: `${sub.color}15`, color: sub.color, padding: '12px', borderRadius: '12px' }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{sub.name}</h3>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>{sub.nameHindi}</div>
                  <div style={{ color: sub.color, fontSize: '0.8rem', fontWeight: '500', marginTop: '2px' }}>
                    {sub.chapter}
                  </div>
                </div>
              </div>
              <Link
                to={`/subjects/${sub.id}/chapters/1`}
                style={{
                  color: 'var(--color-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px'
                }}
              >
                <ArrowRight size={20} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
