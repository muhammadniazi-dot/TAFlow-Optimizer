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
 * Post-process a list of assignments to detect scheduling conflicts and
 * workload overloads, then annotate each assignment with a status and reason.
 *
 * Status priority (highest → lowest): Conflict > Overloaded > OK
 *
 * @param {Array}  assignments    - Array of assignment objects produced by generateAssignments.
 * @param {number} maxAssignments - Maximum allowed assignments per TA before "Overloaded".
 * @returns {{ assignments: Array, summary: { totalConflicts: number, overloadedTAs: number } }}
 */
const isUnassigned = (assignment) =>
  !assignment || !assignment.ta || assignment.ta === 'Unassigned';

const detectConflicts = (assignments, maxAssignments = MAX_ASSIGNMENTS_PER_TA) => {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return { assignments: [], summary: { totalConflicts: 0, overloadedTAs: 0 } };
  }

  // taLoadMap:     taName → [array of assignment indices]
  // taScheduleMap: taName → { normalizedTime → [array of assignment indices] }
  const taLoadMap = {};
  const taScheduleMap = {};

  assignments.forEach((assignment, index) => {
    if (isUnassigned(assignment)) return;

    const taName = assignment.ta;
    const time = assignment.time ? String(assignment.time).toLowerCase() : '';

    if (!taLoadMap[taName]) taLoadMap[taName] = [];
    taLoadMap[taName].push(index);

    if (!taScheduleMap[taName]) taScheduleMap[taName] = {};
    if (!taScheduleMap[taName][time]) taScheduleMap[taName][time] = [];
    taScheduleMap[taName][time].push(index);
  });

  // Collect indices of all conflicting assignments (same TA, same time slot)
  const conflictIndices = new Set();
  Object.values(taScheduleMap).forEach((timeMap) => {
    Object.values(timeMap).forEach((indices) => {
      if (indices.length > 1) {
        indices.forEach((i) => conflictIndices.add(i));
      }
    });
  });

  // Collect names of overloaded TAs (exceeding maxAssignments)
  const overloadedTANames = new Set();
  Object.entries(taLoadMap).forEach(([taName, indices]) => {
    if (indices.length > maxAssignments) {
      overloadedTANames.add(taName);
    }
  });

  // Annotate each assignment – Conflict takes priority over Overloaded
  assignments.forEach((assignment, index) => {
    if (isUnassigned(assignment)) {
      assignment.status = 'Unassigned';
      assignment.reason = 'No suitable TA available';
      return;
    }

    if (conflictIndices.has(index)) {
      assignment.status = 'Conflict';
      assignment.reason = 'TA assigned to overlapping time slots';
    } else if (overloadedTANames.has(assignment.ta)) {
      assignment.status = 'Overloaded';
      assignment.reason = 'TA exceeds recommended workload';
    } else {
      assignment.status = 'OK';
      assignment.reason = 'Assignment valid';
    }
  });

  return {
    assignments,
    summary: {
      totalConflicts: conflictIndices.size,
      overloadedTAs: overloadedTANames.size
    }
  };
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
        reason: 'No suitable TA available'
      };
    }

    const eligibleTAs = findEligibleTAs(taPool, section);

    if (eligibleTAs.length === 0) {
      return {
        ta: 'Unassigned',
        section: section.course,
        time: section.time,
        status: 'Unassigned',
        reason: 'No suitable TA available'
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

    bestTA.assignments.push(section.course);
    bestTA.assignedTimeSlots.add(section.time.toLowerCase());

    return {
      ta: bestTA.name,
      section: section.course,
      time: section.time,
      status: 'OK',
      reason: 'Assignment valid'
    };
  });

  return detectConflicts(assignments);
};

module.exports = {
  generateAssignments,
  detectConflicts
};
