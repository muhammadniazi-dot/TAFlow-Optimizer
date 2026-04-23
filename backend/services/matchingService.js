const MAX_ASSIGNMENTS_PER_TA = 2;

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
};

const toTARecord = (ta) => ({
  name: String(ta?.name || '').trim(),
  skills: normalizeList(ta?.skills),
  availability: normalizeList(ta?.availability),
  assignments: [],
  assignedTimeSlots: new Set()
});

/**
 * Find TAs that satisfy both the required skill and availability for a section.
 */
const findEligibleTAs = (taPool, section) => {
  const requiredSkill = section.requiredSkill.toLowerCase();
  const time = section.time.toLowerCase();

  return taPool.filter(
    (ta) => ta.skills.includes(requiredSkill) && ta.availability.includes(time)
  );
};

/**
 * Calculate a suitability score for a TA relative to a section.
 * Higher score = better candidate.
 *   +2 for matching skill
 *   +1 for being available at the section time
 *   -1 for each existing assignment (workload penalty)
 */
const calculateScore = (ta, section) => {
  const requiredSkill = section.requiredSkill.toLowerCase();
  const time = section.time.toLowerCase();

  let score = 0;
  if (ta.skills.includes(requiredSkill)) score += 2;
  if (ta.availability.includes(time)) score += 1;
  score -= ta.assignments.length;

  return score;
};

/**
 * Detect whether assigning this TA to the given time would create a time conflict
 * (i.e., the TA already has another assignment at the same time slot).
 */
const detectConflicts = (ta, time) => {
  return ta.assignedTimeSlots.has(time.toLowerCase());
};

const generateAssignments = (tas = [], sections = []) => {
  if (tas.length === 0 || sections.length === 0) {
    return { assignments: [] };
  }

  const taPool = tas.map(toTARecord).filter((ta) => ta.name);

  const normalizedSections = sections.map((section) => ({
    course: String(section?.course || '').trim(),
    time: String(section?.time || '').trim(),
    requiredSkill: String(section?.requiredSkill || '').trim()
  }));

  const assignments = normalizedSections.map((section) => {
    if (!section.course || !section.time || !section.requiredSkill) {
      return {
        ta: 'Unassigned',
        section: section.course || 'Unknown Section',
        time: section.time || 'Unknown Time',
        status: 'Unassigned',
        reason: 'No suitable TA found'
      };
    }

    const eligibleTAs = findEligibleTAs(taPool, section);

    if (eligibleTAs.length === 0) {
      return {
        ta: 'Unassigned',
        section: section.course,
        time: section.time,
        status: 'Unassigned',
        reason: 'No suitable TA found'
      };
    }

    const candidateScores = eligibleTAs.map((ta) => ({
      ta,
      score: calculateScore(ta, section)
    }));

    candidateScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.ta.name.localeCompare(b.ta.name);
    });

    const bestTA = candidateScores[0].ta;
    const hasTimeConflict = detectConflicts(bestTA, section.time);

    bestTA.assignments.push(section.course);
    bestTA.assignedTimeSlots.add(section.time.toLowerCase());

    const isOverloaded = bestTA.assignments.length > MAX_ASSIGNMENTS_PER_TA;

    let status = 'OK';
    let reason = 'Matched based on skill and availability';

    if (hasTimeConflict) {
      status = 'Conflict';
    } else if (isOverloaded) {
      status = 'Overloaded';
      reason = 'Assigned despite high workload';
    }

    return {
      ta: bestTA.name,
      section: section.course,
      time: section.time,
      status,
      reason
    };
  });

  return { assignments };
};

module.exports = {
  generateAssignments
};
