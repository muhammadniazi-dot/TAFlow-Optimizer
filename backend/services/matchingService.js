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

const chooseBestTA = (taPool, section) => {
  const requiredSkill = String(section?.requiredSkill || '').trim().toLowerCase();
  const timeSlot = String(section?.timeSlot || '').trim().toLowerCase();

  const candidates = taPool.filter((ta) => ta.skills.includes(requiredSkill));

  if (candidates.length === 0) {
    return { ta: null, hasTimeConflict: true, isAvailable: false };
  }

  let bestCandidate = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const ta of candidates) {
    const isAvailable = ta.availability.includes(timeSlot);
    const hasTimeConflict = ta.assignedTimeSlots.has(timeSlot);

    const availabilityPenalty = isAvailable ? 0 : 100;
    const overlapPenalty = hasTimeConflict ? 50 : 0;
    const balancePenalty = ta.assignments.length * 10;

    const score = availabilityPenalty + overlapPenalty + balancePenalty;

    if (score < bestScore) {
      bestScore = score;
      bestCandidate = {
        ta,
        hasTimeConflict,
        isAvailable
      };
      continue;
    }

    if (score === bestScore && bestCandidate && ta.assignments.length < bestCandidate.ta.assignments.length) {
      bestCandidate = {
        ta,
        hasTimeConflict,
        isAvailable
      };
      continue;
    }

    if (score === bestScore && bestCandidate && ta.assignments.length === bestCandidate.ta.assignments.length) {
      if (ta.name.localeCompare(bestCandidate.ta.name) < 0) {
        bestCandidate = {
          ta,
          hasTimeConflict,
          isAvailable
        };
      }
    }
  }

  return bestCandidate;
};

const generateAssignments = (tas = [], sections = []) => {
  const taPool = tas.map(toTARecord).filter((ta) => ta.name);
  const normalizedSections = sections.map((section) => ({
    courseName: String(section?.courseName || '').trim(),
    timeSlot: String(section?.timeSlot || '').trim(),
    requiredSkill: String(section?.requiredSkill || '').trim()
  }));

  const assignments = [];
  const issueFlags = [];

  for (const section of normalizedSections) {
    if (!section.courseName || !section.timeSlot || !section.requiredSkill) {
      assignments.push({
        ta: 'Unassigned',
        section: section.courseName || 'Unknown Section',
        time: section.timeSlot || 'Unknown Time',
        status: 'Conflict'
      });
      issueFlags.push({ taName: null, timeConflict: true });
      continue;
    }

    const choice = chooseBestTA(taPool, section);

    if (!choice?.ta) {
      assignments.push({
        ta: 'Unassigned',
        section: section.courseName,
        time: section.timeSlot,
        status: 'Conflict'
      });
      issueFlags.push({ taName: null, timeConflict: true });
      continue;
    }

    const { ta, hasTimeConflict, isAvailable } = choice;
    ta.assignments.push(section.courseName);
    ta.assignedTimeSlots.add(section.timeSlot.toLowerCase());

    assignments.push({
      ta: ta.name,
      section: section.courseName,
      time: section.timeSlot,
      status: hasTimeConflict || !isAvailable ? 'Conflict' : 'OK'
    });

    issueFlags.push({ taName: ta.name, timeConflict: hasTimeConflict || !isAvailable });
  }

  const taAssignmentCounts = taPool.reduce((accumulator, ta) => {
    accumulator[ta.name] = ta.assignments.length;
    return accumulator;
  }, {});

  const taOverloaded = Object.entries(taAssignmentCounts).reduce((accumulator, [name, count]) => {
    accumulator[name] = count > 2;
    return accumulator;
  }, {});

  const finalAssignments = assignments.map((assignment, index) => {
    const taName = assignment.ta;
    const overload = taOverloaded[taName];
    const hasConflict = issueFlags[index]?.timeConflict;

    if (overload) {
      return {
        ...assignment,
        status: 'Overloaded'
      };
    }

    if (hasConflict) {
      return {
        ...assignment,
        status: 'Conflict'
      };
    }

    return assignment;
  });

  return {
    assignments: finalAssignments
  };
};

module.exports = {
  generateAssignments
};
