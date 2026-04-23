import { useEffect, useRef, useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const formatTime12 = (time24) => {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minuteStr} ${period}`;
};

const formatTimeSlot = ({ day, start, end }) =>
  `${day} ${formatTime12(start)} – ${formatTime12(end)}`;

const SectionInput = ({ onAddSection, sections, onRemoveSection }) => {
  const [courseName, setCourseName] = useState('');
  const [day, setDay] = useState('Mon');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [requiredSkill, setRequiredSkill] = useState('');
  const [errors, setErrors] = useState({});

  const [successMessage, setSuccessMessage] = useState('');
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const resetForm = () => {
    setCourseName('');
    setDay('Mon');
    setStartTime('');
    setEndTime('');
    setRequiredSkill('');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!courseName.trim()) {
      newErrors.courseName = 'Course name is required.';
    }
    if (!startTime) {
      newErrors.startTime = 'Start time is required.';
    }
    if (!endTime) {
      newErrors.endTime = 'End time is required.';
    } else if (startTime) {
      const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      if (toMinutes(endTime) <= toMinutes(startTime)) {
        newErrors.endTime = 'End time must be after start time.';
      }
    }
    if (!requiredSkill.trim()) {
      newErrors.requiredSkill = 'Required skill is required.';
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

    const timeSlot = formatTimeSlot({ day, start: startTime, end: endTime });

    onAddSection({
      course: courseName.trim(),
      time: timeSlot,
      requiredSkill: requiredSkill.trim()
    });

    resetForm();
    setSuccessMessage(`Section "${courseName.trim()}" added successfully.`);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <section className="card section-input-card">
      <h2>Add Course Section</h2>
      <form onSubmit={handleSubmit} className="form-grid" noValidate>
        <label>
          Course Name
          <input
            type="text"
            value={courseName}
            onChange={(event) => {
              setCourseName(event.target.value);
              if (errors.courseName) setErrors((prev) => ({ ...prev, courseName: undefined }));
            }}
            placeholder="CS101"
            className={errors.courseName ? 'input-error' : ''}
          />
          {errors.courseName && <span className="validation-error">{errors.courseName}</span>}
        </label>

        <div className="time-slot-group">
          <span className="time-slot-label">Time Slot</span>
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
        </div>

        <label>
          Required Skill
          <input
            type="text"
            value={requiredSkill}
            onChange={(event) => {
              setRequiredSkill(event.target.value);
              if (errors.requiredSkill)
                setErrors((prev) => ({ ...prev, requiredSkill: undefined }));
            }}
            placeholder="python"
            className={errors.requiredSkill ? 'input-error' : ''}
          />
          {errors.requiredSkill && (
            <span className="validation-error">{errors.requiredSkill}</span>
          )}
        </label>

        <button type="submit" className="btn-add">
          Add Section
        </button>
        {successMessage && (
          <div className="toast-success" role="status">
            <span className="toast-icon">✓</span>
            {successMessage}
          </div>
        )}
      </form>

      {sections && sections.length > 0 && (
        <div className="section-list">
          <h3>Added Sections ({sections.length})</h3>
          {sections.map((section, index) => (
            <div key={index} className="section-item">
              <div className="section-item-header">
                <span className="section-name">📚 {section.course}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => onRemoveSection(index)}
                  aria-label={`Remove ${section.course}`}
                >
                  ✕
                </button>
              </div>
              <div className="section-item-details">
                <div className="tag-group">
                  <span className="tag-label">Time:</span>
                  <span className="tag tag-time">🕐 {section.time}</span>
                </div>
                <div className="tag-group">
                  <span className="tag-label">Skill:</span>
                  <span className="tag tag-skill">{section.requiredSkill}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SectionInput;
