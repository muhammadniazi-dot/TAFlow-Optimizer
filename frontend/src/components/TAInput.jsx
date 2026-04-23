import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const parseCommaSeparated = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const formatTime12 = (time24) => {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minuteStr} ${period}`;
};

const formatTimeSlot = ({ day, start, end }) => `${day} ${formatTime12(start)} – ${formatTime12(end)}`;

const TAInput = ({ onAddTA, tas, onRemoveTA }) => {
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [day, setDay] = useState('Mon');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errors, setErrors] = useState({});

  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setName('');
    setSkills('');
    setAvailabilitySlots([]);
    setDay('Mon');
    setStartTime('');
    setEndTime('');
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
    if (availabilitySlots.length === 0) {
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
      availability: availabilitySlots.slice()
    });

    resetForm();
    setSuccessMessage(`TA "${name.trim()}" added successfully.`);
    setTimeout(() => setSuccessMessage(''), 3000);
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

        <div className="time-slot-group">
          <span className="time-slot-label">Availability</span>
          <div className="day-selector" role="group" aria-label="Select day">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                className={`day-btn${day === d ? ' day-btn-active' : ''}`}
                onClick={() => setDay(d)}
                aria-pressed={day === d}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="time-inputs">
            <label className="time-label">
              Start time
              <input
                type="time"
                value={startTime}
                onChange={(event) => {
                  setStartTime(event.target.value);
                  if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: undefined }));
                }}
                className={errors.startTime ? 'input-error' : ''}
              />
              {errors.startTime && <span className="validation-error">{errors.startTime}</span>}
            </label>
            <label className="time-label">
              End time
              <input
                type="time"
                value={endTime}
                onChange={(event) => {
                  setEndTime(event.target.value);
                  if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: undefined }));
                }}
                className={errors.endTime ? 'input-error' : ''}
              />
              {errors.endTime && <span className="validation-error">{errors.endTime}</span>}
            </label>
          </div>

          <div className="availability-controls">
            <button
              type="button"
              className="btn-add-availability btn"
              onClick={() => {
                const newErrors = {};
                if (!startTime) newErrors.startTime = 'Start time is required.';
                if (!endTime) newErrors.endTime = 'End time is required.';
                if (startTime && endTime) {
                  const toMinutes = (t) => {
                    const [h, m] = t.split(':').map(Number);
                    return h * 60 + m;
                  };
                  if (toMinutes(endTime) <= toMinutes(startTime)) {
                    newErrors.endTime = 'End time must be after start time.';
                  }
                }
                if (Object.keys(newErrors).length > 0) {
                  setErrors((prev) => ({ ...prev, ...newErrors }));
                  return;
                }

                const slot = formatTimeSlot({ day, start: startTime, end: endTime });
                if (!availabilitySlots.includes(slot)) {
                  setAvailabilitySlots((prev) => [...prev, slot]);
                }
                setStartTime('');
                setEndTime('');
              }}
            >
              Add Availability
            </button>
          </div>

          <div className="availability-list">
            {availabilitySlots.length > 0 ? (
              availabilitySlots.map((slot, idx) => (
                <div key={slot} className="availability-item">
                  <span className="tag tag-availability">{slot}</span>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setAvailabilitySlots((prev) => prev.filter((s) => s !== slot))}
                    aria-label={`Remove ${slot}`}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <span className="tag-empty">No availability added</span>
            )}
          </div>

          {errors.availability && <span className="validation-error">{errors.availability}</span>}
        </div>

        <button type="submit" className="btn-add">
          Add TA
        </button>
        {successMessage && (
          <div className="toast-success" role="status">
            <span className="toast-icon">✓</span>
            {successMessage}
          </div>
        )}
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
