const { generateAssignments } = require('../services/matchingService');

const assignTAs = async (req, res) => {
  try {
    const { tas, sections } = req.body;

    if (!Array.isArray(tas) || !Array.isArray(sections)) {
      return res.status(400).json({
        error: 'Invalid payload. Expected arrays for tas and sections.'
      });
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
