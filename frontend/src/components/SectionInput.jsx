import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const DURATIONS = [
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 }
];

const padTime = (value) => String(value).padStart(2, '0');

const toMinutes = (timeValue) => {
  if (!timeValue) {
    return Number.NaN;
  }

  const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
  return hours * 60 + minutes;
};

const addMinutes = (timeValue, minutesToAdd) => {
  const totalMinutes = toMinutes(timeValue) + minutesToAdd;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${padTime(hours)}:${padTime(minutes)}`;
};

const formatTime = (timeValue) => {
  if (!timeValue) {
    return '';
  }

  const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
  const hour = hours % 12 || 12;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hour}:${padTime(minutes)} ${suffix}`;
};

const formatSchedule = (schedule) => {
  if (!schedule) {
    return '';
  }

  return `${schedule.day} ${formatTime(schedule.start)} – ${formatTime(schedule.end)}`;
};

const isOverlapping = (candidate, existing) => {
  if (!candidate || !existing) {
    return false;
  }

  if (candidate.day !== existing.day) {
    return false;
  }

  return toMinutes(candidate.start) < toMinutes(existing.end)
    && toMinutes(existing.start) < toMinutes(candidate.end);
};

const SectionInput = ({ onAddSection, sections = [], onRemoveSection }) => {
  const [courseName, setCourseName] = useState('');
  const [requiredSkill, setRequiredSkill] = useState('');
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('120');
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setCourseName('');
    setRequiredSkill('');
    setSelectedDay('Mon');
    setStartTime('');
    setDuration('120');
    setErrors({});
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const validationErrors = {};
    const durationInMinutes = Number(duration);

    if (!courseName.trim()) {
      validationErrors.courseName = 'Course name is required.';
    }

    if (!requiredSkill.trim()) {
      validationErrors.requiredSkill = 'Required skill is required.';
    }

    if (!selectedDay) {
      validationErrors.day = 'Pick a day for the section.';
    }

    if (!startTime) {
      validationErrors.startTime = 'Start time is required.';
    }

    if (!durationInMinutes) {
      validationErrors.duration = 'Duration is required.';
    }

    const candidateSchedule =
      selectedDay && startTime && durationInMinutes
        ? {
            day: selectedDay,
            start: startTime,
            end: addMinutes(startTime, durationInMinutes)
          }
        : null;

    if (candidateSchedule && toMinutes(candidateSchedule.end) <= toMinutes(candidateSchedule.start)) {
      validationErrors.duration = 'End time must be after the start time.';
    }

    if (candidateSchedule) {
      const normalizedCourseName = courseName.trim().toLowerCase();
      const duplicateSection = sections.some((section) => {
        const existingSchedule = section?.schedule;
        const existingCourseName = String(section?.courseName || '').trim().toLowerCase();

        return (
          existingSchedule &&
          existingCourseName === normalizedCourseName &&
          existingSchedule.day === candidateSchedule.day &&
          existingSchedule.start === candidateSchedule.start &&
          existingSchedule.end === candidateSchedule.end
        );
      });

      if (duplicateSection) {
        validationErrors.schedule = 'This section has already been added.';
      }

      const overlappingSection = sections.some((section) => isOverlapping(candidateSchedule, section?.schedule));
      if (!validationErrors.schedule && overlappingSection) {
        validationErrors.schedule = 'This time overlaps with an existing section.';
      }
    }

    return validationErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const schedule = {
      day: selectedDay,
      start: startTime,
      end: addMinutes(startTime, Number(duration))
    };

    onAddSection({
      courseName: courseName.trim(),
      requiredSkill: requiredSkill.trim(),
      schedule,
      timeSlot: formatSchedule(schedule)
    });

    resetForm();
  };

  return (
    <section className="card section-input-card">
      <h2>Add Course Section</h2>
      <form onSubmit={handleSubmit} className="form-grid section-form" noValidate>
        <label>
          Course Name
          <input
            type="text"
            value={courseName}
            onChange={(event) => {
              setCourseName(event.target.value);
              clearError('courseName');
            }}
            placeholder="CS101"
            className={errors.courseName ? 'input-error' : ''}
          />
          {errors.courseName && <span className="validation-error">{errors.courseName}</span>}
        </label>

        <label>
          Required Skill
          <input
            type="text"
            value={requiredSkill}
            onChange={(event) => {
              setRequiredSkill(event.target.value);
              clearError('requiredSkill');
            }}
            placeholder="Python"
            className={errors.requiredSkill ? 'input-error' : ''}
          />
          {errors.requiredSkill && <span className="validation-error">{errors.requiredSkill}</span>}
        </label>

        <div className="field-block">
          <span className="field-label">Day</span>
          <div className="day-toggle-group" role="group" aria-label="Select section day">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={`day-pill ${selectedDay === day ? 'day-pill-active' : ''}`}
                aria-pressed={selectedDay === day}
                onClick={() => {
                  setSelectedDay(day);
                  clearError('day');
                  clearError('schedule');
                }}
              >
                {day}
              </button>
            ))}
          </div>
          {errors.day && <span className="validation-error">{errors.day}</span>}
        </div>

        <div className="section-time-grid">
          <label>
            Start Time
            <input
              type="time"
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
                clearError('startTime');
                clearError('schedule');
              }}
              step="1800"
              className={errors.startTime ? 'input-error' : ''}
            />
          </label>

          <label>
            Duration
            <select
              value={duration}
              onChange={(event) => {
                setDuration(event.target.value);
                clearError('duration');
                clearError('schedule');
              }}
              className={errors.duration ? 'input-error' : ''}
            >
              {DURATIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="section-preview">
          <span className="section-preview-label">Preview</span>
          <strong>
            {selectedDay && startTime
              ? `${selectedDay} ${formatTime(startTime)} – ${formatTime(addMinutes(startTime, Number(duration) || 0))}`
              : 'Select a day and time'}
          </strong>
        </div>

        {errors.schedule && <span className="validation-error">{errors.schedule}</span>}

        <button type="submit" className="btn-add">
          Add Section
        </button>
      </form>

      {sections.length > 0 && (
        <div className="section-list">
          <h3>Added Sections ({sections.length})</h3>
          {sections.map((section, index) => {
            const schedule = section.schedule;
            const displayTime = schedule ? formatSchedule(schedule) : section.timeSlot;

            return (
              <div key={`${section.courseName}-${displayTime}-${index}`} className="section-item">
                <div className="section-item-header">
                  <div>
                    <span className="section-item-course">{section.courseName}</span>
                    <div className="section-item-time">{displayTime}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => onRemoveSection?.(index)}
                    aria-label={`Remove ${section.courseName}`}
                  >
                    ✕
                  </button>
                </div>

                <div className="section-badges">
                  <span className="badge badge-day">{schedule?.day || 'Time'}</span>
                  <span className="badge badge-skill">{section.requiredSkill}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SectionInput;
