import { useState } from 'react';

const SectionInput = ({ onAddSection }) => {
  const [courseName, setCourseName] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [requiredSkill, setRequiredSkill] = useState('');

  const resetForm = () => {
    setCourseName('');
    setTimeSlot('');
    setRequiredSkill('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!courseName.trim() || !timeSlot.trim() || !requiredSkill.trim()) {
      return;
    }

    onAddSection({
      courseName: courseName.trim(),
      timeSlot: timeSlot.trim(),
      requiredSkill: requiredSkill.trim()
    });

    resetForm();
  };

  return (
    <section className="card">
      <h2>Add Course Section</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Course Name
          <input
            type="text"
            value={courseName}
            onChange={(event) => setCourseName(event.target.value)}
            placeholder="CS101"
            required
          />
        </label>

        <label>
          Time Slot
          <input
            type="text"
            value={timeSlot}
            onChange={(event) => setTimeSlot(event.target.value)}
            placeholder="Mon 2PM"
            required
          />
        </label>

        <label>
          Required Skill
          <input
            type="text"
            value={requiredSkill}
            onChange={(event) => setRequiredSkill(event.target.value)}
            placeholder="python"
            required
          />
        </label>

        <button type="submit">Add Section</button>
      </form>
    </section>
  );
};

export default SectionInput;
