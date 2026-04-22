import { useMemo, useState } from 'react';
import TAInput from './components/TAInput';
import SectionInput from './components/SectionInput';
import AssignmentTable from './components/AssignmentTable';
import { getAssignments } from './services/api';

const App = () => {
  const [tas, setTAs] = useState([]);
  const [sections, setSections] = useState([]);
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

  const handleOptimize = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await getAssignments({ tas, sections });
      setAssignments(response.assignments || []);
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to optimize assignments.');
    } finally {
      setIsLoading(false);
    }
  };

  const disableOptimize = useMemo(() => {
    return isLoading || tas.length === 0 || sections.length === 0;
  }, [isLoading, tas.length, sections.length]);

  return (
    <main className="app-container">
      <header>
        <h1>TAFlow Optimizer</h1>
        <p>Prototype tool for matching teaching assistants to course sections.</p>
      </header>

      <div className="layout-grid">
        <TAInput onAddTA={addTA} tas={tas} onRemoveTA={removeTA} />
        <SectionInput onAddSection={addSection} />
      </div>

      <section className="card">
        <h2>Current Input</h2>
        <p>
          TAs: <strong>{tas.length}</strong> | Sections: <strong>{sections.length}</strong>
        </p>
        <button type="button" onClick={handleOptimize} disabled={disableOptimize}>
          {isLoading ? 'Optimizing...' : 'Run Optimizer'}
        </button>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <AssignmentTable assignments={assignments} />
    </main>
  );
};

export default App;
