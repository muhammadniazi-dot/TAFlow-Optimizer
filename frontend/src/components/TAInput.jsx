import { useState } from 'react';

const TAInput = ({ onAddTA }) => {
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('');

  const resetForm = () => {
    setName('');
    setSkills('');
    setAvailability('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    onAddTA({
      name: name.trim(),
      skills: skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      availability: availability
        .split(',')
        .map((slot) => slot.trim())
        .filter(Boolean)
    });

    resetForm();
  };

  return (
    <section className="card">
      <h2>Add TA</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ali"
            required
          />
        </label>

        <label>
          Skills (comma-separated)
          <input
            type="text"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="python, algorithms"
          />
        </label>

        <label>
          Availability (comma-separated)
          <input
            type="text"
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
            placeholder="Mon 2PM, Tue 10AM"
          />
        </label>

        <button type="submit">Add TA</button>
      </form>
    </section>
  );
};

export default TAInput;
