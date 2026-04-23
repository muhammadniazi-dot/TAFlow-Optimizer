const { generateAssignments } = require('../services/matchingService');

const validateTAs = (tas) => {
  for (let i = 0; i < tas.length; i++) {
    const ta = tas[i];
    if (!ta.name || typeof ta.name !== 'string') {
      return `TA at index ${i} is missing a valid "name" field.`;
    }
    if (!ta.name.trim()) {
      return `TA at index ${i} is missing a valid "name" field.`;
    }
    if (!Array.isArray(ta.skills) && typeof ta.skills !== 'string') {
      return `TA "${ta.name}" has an invalid "skills" field. Expected array or comma-separated string.`;
    }
    if (!Array.isArray(ta.availability) && typeof ta.availability !== 'string') {
      return `TA "${ta.name}" has an invalid "availability" field. Expected array or comma-separated string.`;
    }
  }
  return null;
};

const validateSections = (sections) => {
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section.courseName || typeof section.courseName !== 'string') {
      return `Section at index ${i} is missing a valid "courseName" field.`;
    }
    if (!section.courseName.trim()) {
      return `Section at index ${i} is missing a valid "courseName" field.`;
    }
    if (!section.timeSlot || typeof section.timeSlot !== 'string') {
      return `Section "${section.courseName}" is missing a valid "timeSlot" field.`;
    }
    if (!section.timeSlot.trim()) {
      return `Section "${section.courseName}" is missing a valid "timeSlot" field.`;
    }
    if (!section.requiredSkill || typeof section.requiredSkill !== 'string') {
      return `Section "${section.courseName}" is missing a valid "requiredSkill" field.`;
    }
    if (!section.requiredSkill.trim()) {
      return `Section "${section.courseName}" is missing a valid "requiredSkill" field.`;
    }
  }
  return null;
};

const assignTAs = async (req, res) => {
  try {
    const { tas, sections } = req.body;

    if (!Array.isArray(tas) || !Array.isArray(sections)) {
      return res.status(400).json({
        error: 'Invalid payload. Expected arrays for tas and sections.'
      });
    }

    if (tas.length === 0) {
      return res.status(400).json({
        error: 'The "tas" array must not be empty.'
      });
    }

    if (sections.length === 0) {
      return res.status(400).json({
        error: 'The "sections" array must not be empty.'
      });
    }

    const taValidationError = validateTAs(tas);
    if (taValidationError) {
      return res.status(400).json({ error: taValidationError });
    }

    const sectionValidationError = validateSections(sections);
    if (sectionValidationError) {
      return res.status(400).json({ error: sectionValidationError });
    }

    const result = generateAssignments(tas, sections);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to process assignments.',
      details: error.message
    });
  }
};

module.exports = {
  assignTAs
};
