import { useState } from 'react';

const parseCommaSeparated = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const TAInput = ({ onAddTA, tas, onRemoveTA }) => {
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('');
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setName('');
    setSkills('');
    setAvailability('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    }
    if (parseCommaSeparated(skills).length === 0) {
      newErrors.skills = 'At least one skill is required.';
    }
    if (parseCommaSeparated(availability).length === 0) {
      newErrors.availability = 'At least one availability slot is required.';
    }
    return newErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onAddTA({
      name: name.trim(),
      skills: parseCommaSeparated(skills),
      availability: parseCommaSeparated(availability)
    });

    resetForm();
  };

  return (
    <section className="card ta-input-card">
      <h2>Add TA</h2>
      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Ali"
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="validation-error">{errors.name}</span>}
        </label>

        <label>
          Skills (comma-separated)
          <input
            type="text"
            value={skills}
            onChange={(event) => {
              setSkills(event.target.value);
              if (errors.skills) setErrors((prev) => ({ ...prev, skills: undefined }));
            }}
            placeholder="python, algorithms"
            className={errors.skills ? 'input-error' : ''}
          />
          {errors.skills && <span className="validation-error">{errors.skills}</span>}
        </label>

        <label>
          Availability (comma-separated)
          <input
            type="text"
            value={availability}
            onChange={(event) => {
              setAvailability(event.target.value);
              if (errors.availability) setErrors((prev) => ({ ...prev, availability: undefined }));
            }}
            placeholder="Mon 2PM, Tue 10AM"
            className={errors.availability ? 'input-error' : ''}
          />
          {errors.availability && (
            <span className="validation-error">{errors.availability}</span>
          )}
        </label>

        <button type="submit" className="btn-add">
          Add TA
        </button>
      </form>

      {tas && tas.length > 0 && (
        <div className="ta-list">
          <h3>Added TAs ({tas.length})</h3>
          {tas.map((ta, index) => (
            <div key={index} className="ta-item">
              <div className="ta-item-header">
                <span className="ta-name">{ta.name}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => onRemoveTA(index)}
                  aria-label={`Remove ${ta.name}`}
                >
                  ✕
                </button>
              </div>
              <div className="ta-item-details">
                <div className="tag-group">
                  <span className="tag-label">Skills:</span>
                  {ta.skills.length > 0 ? (
                    ta.skills.map((skill) => (
                      <span key={skill} className="tag tag-skill">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="tag-empty">—</span>
                  )}
                </div>
                <div className="tag-group">
                  <span className="tag-label">Availability:</span>
                  {ta.availability.length > 0 ? (
                    ta.availability.map((slot) => (
                      <span key={slot} className="tag tag-availability">
                        {slot}
                      </span>
                    ))
                  ) : (
                    <span className="tag-empty">—</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TAInput;
