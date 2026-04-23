import { useCallback, useEffect, useMemo, useState } from 'react';
import TAInput from './components/TAInput';
import SectionInput from './components/SectionInput';
import AssignmentTable from './components/AssignmentTable';
import { getAssignments } from './services/api';

const SAMPLE_TAS = [
  {
    name: 'Ali Rahman',
    skills: ['python', 'algorithms'],
    availability: ['Mon 10:00 AM - 11:00 AM', 'Wed 1:00 PM - 2:00 PM', 'Thu 2:00 PM - 3:00 PM'],
  },
  {
    name: 'Sara Khan',
    skills: ['ui', 'javascript'],
    availability: ['Tue 11:00 AM - 12:00 PM'],
  },
  {
    name: 'Noah Patel',
    skills: ['systems', 'databases'],
    availability: ['Mon 10:00 AM - 11:00 AM'],
  },
];

const SAMPLE_SECTIONS = [
  {
    course: 'CS101 - Intro to Programming',
    time: 'Mon 10:00 AM - 11:00 AM',
    requiredSkill: 'python',
  },
  {
    course: 'CS205 - Algorithm Design',
    time: 'Wed 1:00 PM - 2:00 PM',
    requiredSkill: 'python',
  },
  {
    course: 'CS310 - Advanced Algorithms',
    time: 'Thu 2:00 PM - 3:00 PM',
    requiredSkill: 'algorithms',
  },
  {
    course: 'CS220 - UI Foundations',
    time: 'Tue 11:00 AM - 12:00 PM',
    requiredSkill: 'ui',
  },
  {
    course: 'CS221 - Frontend Workshop',
    time: 'Tue 11:00 AM - 12:00 PM',
    requiredSkill: 'javascript',
  },
  {
    course: 'CS330 - Systems Lab',
    time: 'Mon 10:00 AM - 11:00 AM',
    requiredSkill: 'systems',
  },
  {
    course: 'CS499 - Special Topics',
    time: 'Fri 3:00 PM - 4:00 PM',
    requiredSkill: 'machine learning',
  },
];

const App = () => {
  const [tas, setTAs] = useState(SAMPLE_TAS);
  const [sections, setSections] = useState(SAMPLE_SECTIONS);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const addTA = (ta) => {
    setTAs((prev) => [...prev, ta]);
  };

  const removeTA = (index) => {
    setTAs((prev) => prev.filter((_, i) => i !== index));
  };

  const addSection = (section) => {
    setSections((prev) => [...prev, section]);
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptimize = useCallback(async (nextTAs = tas, nextSections = sections) => {
    if (nextTAs.length === 0 || nextSections.length === 0) {
      setAssignments([]);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await getAssignments({ tas: nextTAs, sections: nextSections });
      setAssignments(response.assignments || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to optimize assignments.');
    } finally {
      setIsLoading(false);
    }
  }, [tas, sections]);

  const disableOptimize = useMemo(() => {
    return isLoading || tas.length === 0 || sections.length === 0;
  }, [isLoading, tas.length, sections.length]);

  useEffect(() => {
    handleOptimize(tas, sections);
  }, [handleOptimize, tas, sections]);

  return (
    <main className="app-container dashboard-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Assignment dashboard</p>
          <h1>TAFlow Optimizer</h1>
          <p>
            Review preloaded teaching assistant assignments, then adjust the roster to see the
            table update automatically.
          </p>
        </div>
        <div className="hero-badge">
          <span className="hero-badge-label">Live data</span>
          <strong>{tas.length} TAs</strong>
          <span>{sections.length} sections</span>
        </div>
      </header>

      <div className="layout-grid">
        <TAInput onAddTA={addTA} tas={tas} onRemoveTA={removeTA} />
        <SectionInput onAddSection={addSection} sections={sections} onRemoveSection={removeSection} />
      </div>

      <section className="card summary-panel">
        <h2>Current Input</h2>
        <div className="summary-counts">
          <span>TAs: <strong>{tas.length}</strong></span>
          <span>Sections: <strong>{sections.length}</strong></span>
        </div>
        <div className="summary-actions">
          <button
            type="button"
            className="btn-optimize"
            onClick={() => handleOptimize()}
            disabled={disableOptimize}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Optimizing…
              </>
            ) : (
              '⚡ Run Optimizer'
            )}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </section>

      <AssignmentTable assignments={assignments} isLoading={isLoading} />
    </main>
  );
};

export default App;
